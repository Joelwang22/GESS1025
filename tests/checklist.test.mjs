import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  escapeVuePlaceholders,
  generateSite,
  linkTaskRoutes,
  parseChecklist,
} from "../scripts/checklist.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const sourcePath = path.join(
  repositoryRoot,
  "content/master-working-2026-11-21.working.132.md",
);
const manifestPath = path.join(repositoryRoot, "content/source.json");

const fixture = `# How to use this edition

Follow a matching route.

# Master working checklist 2026-11-21.working.132

Authoring edition.

Sources SHA-256: \`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\`

# network

Network context.

## NET-01. Check connectivity

Run the first check.

\`\`\`text
## FAKE-99. This heading is command output
\`\`\`

- reply: Continue. Next: NET-02.

## NET-02. Scan services

Run the second check.

- incomplete: Stop here. Next: PAUSE-COVERAGE.

# Explanations and troubleshooting

## NET-01. Check connectivity

Why the first check matters.

## NET-02. Scan services

Why the second check matters.
`;

async function sha256(file) {
  const bytes = await readFile(file);
  return createHash("sha256").update(bytes).digest("hex");
}

async function digestTree(root) {
  const digest = createHash("sha256");

  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) =>
      left.name.localeCompare(right.name),
    )) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).replaceAll("\\", "/");
      if (entry.isDirectory()) {
        await walk(absolute);
      } else {
        digest.update(relative);
        digest.update(await readFile(absolute));
      }
    }
  }

  await walk(root);
  return digest.digest("hex");
}

test("parses the retained checklist edition with working and explanation parity", async () => {
  const checklist = parseChecklist(await readFile(sourcePath, "utf8"));

  assert.equal(checklist.edition, "2026-11-21.working.132");
  assert.equal(
    checklist.sourceDigest,
    "ecec4118a4af2cf2dc8f29b82712febe898620d82e82079be85ef91df4a5a731",
  );
  assert.equal(checklist.tasks.length, 145);
  assert.equal(new Set(checklist.tasks.map(({ id }) => id)).size, 145);
  assert.deepEqual(
    checklist.modules.slice(0, 5).map(({ id }) => id),
    ["network", "file_services", "remote_access", "http", "windows_ad"],
  );
  assert.ok(checklist.tasks.every(({ explanation }) => explanation.length > 0));
});

test("the provenance manifest pins the exact imported bytes", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  assert.equal(manifest.edition, "2026-11-21.working.132");
  assert.equal(manifest.expectedTaskCount, 145);
  assert.equal(manifest.snapshotSha256, await sha256(sourcePath));
});

test("the provenance manifest pins every imported supporting reference", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  assert.equal(manifest.references.length, 3);
  for (const reference of manifest.references) {
    assert.equal(
      reference.snapshotSha256,
      await sha256(path.join(repositoryRoot, reference.snapshotPath)),
    );
  }
});

test("ignores task-like headings inside fenced command blocks", () => {
  const checklist = parseChecklist(fixture);

  assert.deepEqual(
    checklist.tasks.map(({ id }) => id),
    ["NET-01", "NET-02"],
  );
  assert.match(checklist.tasks[0].working, /FAKE-99/);
});

test("keeps shorter fence markers inside a four-backtick command fence", () => {
  const nestedFence = fixture.replace(
    "```text\n## FAKE-99. This heading is command output\n```",
    "````text\n```bash\n## FAKE-99. This heading is command output\n```\n````",
  );

  assert.deepEqual(
    parseChecklist(nestedFence).tasks.map(({ id }) => id),
    ["NET-01", "NET-02"],
  );
});

test("rejects a working task without a matching explanation", () => {
  const withoutExplanation = fixture.replace(
    /\n## NET-02\. Scan services\n\nWhy the second check matters\.\n$/,
    "\n",
  );

  assert.throws(
    () => parseChecklist(withoutExplanation),
    /Missing explanation for NET-02/,
  );
});

test("rejects an explanation heading with an empty body", () => {
  const emptyExplanation = fixture.replace(
    "Why the second check matters.",
    "",
  );

  assert.throws(
    () => parseChecklist(emptyExplanation),
    /Missing explanation for NET-02/,
  );
});

test("rejects duplicate task IDs", () => {
  const duplicate = fixture.replace(
    "## NET-02. Scan services\n\nRun the second check.",
    "## NET-01. Scan services\n\nRun the second check.",
  );

  assert.throws(() => parseChecklist(duplicate), /Duplicate working task NET-01/);
});

test("links task routes and leaves terminal states as plain text", () => {
  const linked = linkTaskRoutes(
    "Next: NET-02. Next: PAUSE-COVERAGE.",
    new Set(["NET-01", "NET-02"]),
    new Set(["PAUSE-COVERAGE"]),
  );

  assert.equal(
    linked,
    "Next: [NET-02](./net-02). Next: PAUSE-COVERAGE.",
  );
});

test("does not rewrite route-like text inside command fences", () => {
  const markdown = "Next: NET-02.\n\n```text\nNext: NET-02.\n```";

  assert.equal(
    linkTaskRoutes(
      markdown,
      new Set(["NET-01", "NET-02"]),
      new Set(),
    ),
    "Next: [NET-02](./net-02).\n\n```text\nNext: NET-02.\n```",
  );
});

test("rejects an unknown task-like route destination", () => {
  assert.throws(
    () =>
      linkTaskRoutes(
        "Next: WEB-99.",
        new Set(["NET-01"]),
        new Set(["PAUSE-COVERAGE"]),
      ),
    /Unknown route destination WEB-99/,
  );
});

test("escapes angle-bracket placeholders in prose but not command fences", () => {
  const markdown = "Use <DOMAIN> here.\n\n```bash\necho '<DOMAIN>'\n```";

  assert.equal(
    escapeVuePlaceholders(markdown),
    "Use &lt;DOMAIN&gt; here.\n\n```bash\necho '<DOMAIN>'\n```",
  );
});

test("makes Vue interpolation and raw HTML inert outside command fences", () => {
  const markdown =
    "{{ dangerous() }}\n<div @click=\"dangerous()\">text</div>\n\n```html\n<div>example</div>\n```";

  assert.equal(
    escapeVuePlaceholders(markdown),
    "&#123;&#123; dangerous() &#125;&#125;\n&lt;div @click=\"dangerous()\"&gt;text&lt;/div&gt;\n\n```html\n<div>example</div>\n```",
  );
});

test("rejects manifest reference reads and writes outside owned paths", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "checklist-manifest-"));
  const temporaryContent = path.join(temporaryRoot, "content");
  const maliciousManifest = path.join(temporaryContent, "source.json");
  await mkdir(temporaryContent, { recursive: true });
  await writeFile(
    maliciousManifest,
    JSON.stringify({
      ...manifest,
      references: [
        { ...manifest.references[0], snapshotPath: "../outside.md" },
      ],
    }),
    { encoding: "utf8", flush: true },
  );

  try {
    await assert.rejects(
      generateSite({
        sourcePath,
        manifestPath: maliciousManifest,
        outputRoot: temporaryRoot,
      }),
      /Reference path outside content\/references/,
    );

    await writeFile(
      maliciousManifest,
      JSON.stringify({
        ...manifest,
        references: [
          { ...manifest.references[0], output: "../../index.md" },
        ],
      }),
      { encoding: "utf8", flush: true },
    );
    await assert.rejects(
      generateSite({
        sourcePath,
        manifestPath: maliciousManifest,
        outputRoot: temporaryRoot,
      }),
      /Invalid reference output/,
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("generation is deterministic for identical input", async () => {
  const outputRoot = await mkdtemp(path.join(tmpdir(), "checklist-site-"));
  try {
    const first = await generateSite({ sourcePath, manifestPath, outputRoot });
    const firstDigest = await digestTree(outputRoot);
    const second = await generateSite({ sourcePath, manifestPath, outputRoot });
    const secondDigest = await digestTree(outputRoot);

    assert.equal(first.taskCount, 145);
    assert.deepEqual(second, first);
    assert.equal(secondDigest, firstDigest);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
