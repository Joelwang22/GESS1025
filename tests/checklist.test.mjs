import assert from "node:assert/strict";
import { execFile } from "node:child_process";
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
import { promisify } from "node:util";

import { createMarkdownRenderer } from "vitepress";

import {
  escapeVuePlaceholders,
  generateSite,
  linkTaskRoutes,
  parseChecklist,
} from "../scripts/checklist.mjs";
import { codeText } from "../site/.vitepress/theme/copy.js";
import { matchTasks, normalizeTaskId } from "../site/.vitepress/theme/task-id.js";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const execFileAsync = promisify(execFile);
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

let rendererPromise;

async function renderMarkdown(markdown) {
  rendererPromise ??= createMarkdownRenderer(
    path.join(repositoryRoot, "site"),
    {},
    "/GESS1025/",
  );
  return (await rendererPromise).render(markdown);
}

const routeIds = new Set([
  "NET-02",
  "NET-05",
  "SHELL-01",
  "EXP-03",
  "WEB-06",
  "WEB-08",
  "LPRIV-01",
  "LPRIV-15",
]);
const routeTerminals = new Set(["PAUSE-COVERAGE", "GAP-SERVICE"]);

function link(markdown) {
  return linkTaskRoutes(markdown, routeIds, routeTerminals);
}

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
  assert.equal(checklist.tasks.length, 230);
  assert.equal(new Set(checklist.tasks.map(({ id }) => id)).size, 230);
  assert.deepEqual(
    checklist.modules.slice(0, 5).map(({ id }) => id),
    ["network", "ftp", "smb", "remote_access", "http"],
  );
  assert.ok(checklist.tasks.every(({ explanation }) => explanation.length > 0));
});

test("the provenance manifest pins the exact imported bytes", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  assert.equal(manifest.edition, "2026-11-21.working.132");
  assert.equal(manifest.expectedTaskCount, 230);
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

test("the PostgreSQL lane keeps psql enumeration and prompt recovery commands", async () => {
  const checklist = parseChecklist(await readFile(sourcePath, "utf8"));
  const postgres = checklist.tasks.find(({ id }) => id === "DB-19");

  assert.ok(postgres);
  for (const command of [
    String.raw`\r`,
    String.raw`\conninfo`,
    String.raw`\l+`,
    String.raw`\du+`,
    String.raw`\dn+`,
    String.raw`\c <DATABASE>`,
    String.raw`\dt *.*`,
    String.raw`\d <SCHEMA>.<TABLE>`,
  ]) {
    assert.match(postgres.working, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(postgres.working, /postgres-#.*query buffer is\s+unfinished/s);
});

test("the Git index preserves the exact supporting reference bytes", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  for (const reference of manifest.references) {
    const { stdout } = await execFileAsync(
      "git",
      ["show", `:${reference.snapshotPath}`],
      { cwd: repositoryRoot, encoding: "buffer" },
    );
    assert.equal(
      createHash("sha256").update(stdout).digest("hex"),
      reference.snapshotSha256,
      `${reference.snapshotPath} was normalized before Git stored it`,
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

test("renders inline-code placeholders literally once", async () => {
  const markdown = escapeVuePlaceholders(
    "Use `<DOMAIN>` for <DOMAIN>.\n\n| Field | Value |\n| --- | --- |\n| user | `<supplied-domain/user>` |",
  );

  assert.equal(
    markdown,
    "Use `<DOMAIN>` for &lt;DOMAIN&gt;.\n\n| Field | Value |\n| --- | --- |\n| user | `<supplied-domain/user>` |",
  );
  const html = await renderMarkdown(markdown);
  assert.match(html, /<code>&lt;DOMAIN&gt;<\/code> for &lt;DOMAIN&gt;\./);
  assert.match(html, /<code>&lt;supplied-domain\/user&gt;<\/code>/);
  assert.doesNotMatch(html, /&amp;lt;|&amp;gt;/);
});

test("keeps a code span that wraps across lines literal", () => {
  const markdown =
    "Preserve the full `Owned user -> MemberOf ->\ngroup -> gMSA` chain > text.";

  assert.equal(
    escapeVuePlaceholders(markdown),
    "Preserve the full `Owned user -> MemberOf ->\ngroup -> gMSA` chain &gt; text.",
  );
});

test("treats an unmatched backtick as text and still escapes after it", () => {
  assert.equal(
    escapeVuePlaceholders("A lone ` tick before <x>."),
    "A lone ` tick before &lt;x&gt;.",
  );
});

test("makes Vue interpolation inside inline code inert and literal", async () => {
  const markdown = escapeVuePlaceholders("Run `echo {{ x }} <y>` now.");

  assert.equal(markdown, "Run <code v-pre>echo {{ x }} &lt;y&gt;</code> now.");
  const html = await renderMarkdown(markdown);
  assert.match(html, /<code v-pre>echo \{\{ x \}\} &lt;y&gt;<\/code>/);
});

test("links single, compound, abbreviated, and range task references", () => {
  assert.equal(link("| ok | **NET-02**. Next |"), "| ok | **[NET-02](./net-02)**. Next |");
  assert.equal(
    link("Verify through **SHELL-01/EXP-03**."),
    "Verify through **[SHELL-01](./shell-01)/[EXP-03](./exp-03)**.",
  );
  assert.equal(
    link("Use **WEB-06/08** for one input."),
    'Use **[WEB-06](./web-06)/[08](./web-08 "WEB-08")** for one input.',
  );
  assert.equal(
    link("Open only **LPRIV-01 through LPRIV-15**."),
    "Open only **[LPRIV-01](./lpriv-01) through [LPRIV-15](./lpriv-15)**.",
  );
  assert.equal(
    link("Next: NET-02/NET-05."),
    "Next: [NET-02](./net-02)/[NET-05](./net-05).",
  );
});

test("links both ends of an arrow-joined task sequence", () => {
  assert.equal(
    link("**NET-02 → NET-05**: verify, then continue."),
    "**[NET-02](./net-02) → [NET-05](./net-05)**: verify, then continue.",
  );
  assert.equal(link("**one matching → branch**"), "**one matching → branch**");
});

test("links task parts of a compound but leaves terminal states unlinked", () => {
  assert.equal(
    link("**NET-05/PAUSE-COVERAGE**; **PAUSE-COVERAGE**. Next: GAP-SERVICE."),
    "**[NET-05](./net-05)/PAUSE-COVERAGE**; **PAUSE-COVERAGE**. Next: GAP-SERVICE.",
  );
  assert.equal(
    link("**GAP-SERVICE/PAUSE-COVERAGE**"),
    "**GAP-SERVICE/PAUSE-COVERAGE**",
  );
});

test("leaves fenced commands, inline code, prose, and ordinary bold untouched", () => {
  const markdown = [
    "NET-02 already checked services; follow WEB-06/08 later.",
    "Run in **Kali Bash** with **AS-REP** context and `**NET-02**`.",
    "",
    "```text",
    "Next: NET-02. **WEB-99** **NET-05**",
    "```",
  ].join("\n");

  assert.equal(link(markdown), markdown);
});

test("rejects unknown task-like and terminal-like references", () => {
  assert.throws(() => link("**WEB-99**"), /Unknown route destination WEB-99/);
  assert.throws(() => link("**WEB-06/99**"), /Unknown route destination WEB-99/);
  assert.throws(() => link("**NET-02/PAUSE-NOWHERE**"), /Unknown route destination PAUSE-NOWHERE/);
  assert.throws(() => link("Return to AD-99 first."), /Unknown route destination AD-99/);
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

    assert.equal(first.taskCount, 225);
    assert.equal(first.moduleCount, 47);
    assert.equal(first.sourceTaskCount, 230);
    assert.equal(first.sourceModuleCount, 48);
    assert.deepEqual(second, first);
    assert.equal(secondDigest, firstDigest);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

// Ported from design/gemini (Slate & Signal): unit-level regression checks.

test("links arrow-joined task sequences in both directions", () => {
  const ids = new Set(["SSH-01", "SSH-02", "LNX-01", "LNX-03"]);
  assert.equal(
    linkTaskRoutes("Run **SSH-01 → SSH-02** then **LNX-01 → LNX-03**.", ids, new Set()),
    "Run **[SSH-01](./ssh-01) → [SSH-02](./ssh-02)** then **[LNX-01](./lnx-01) → [LNX-03](./lnx-03)**.",
  );
});

test("normalizes loose task IDs and matches by ID or keyword", () => {
  assert.equal(normalizeTaskId("net1"), "NET-01");
  assert.equal(normalizeTaskId("web 9"), "WEB-09");
  assert.equal(normalizeTaskId("lpriv-2"), "LPRIV-02");
  assert.equal(normalizeTaskId("AD37"), "AD-37");
  assert.equal(normalizeTaskId("kerberoast"), null);

  const tasks = [
    { id: "NET-01", title: "Check connectivity", module: "Network" },
    { id: "WEB-09", title: "Inspect source and cookies", module: "HTTP" },
    { id: "AD-14", title: "Kerberoast service accounts", module: "AD" },
  ];
  assert.deepEqual(matchTasks(tasks, "web9").map((task) => task.id), ["WEB-09"]);
  assert.deepEqual(matchTasks(tasks, "kerberoast").map((task) => task.id), ["AD-14"]);
  assert.deepEqual(matchTasks(tasks, "http").map((task) => task.id), ["WEB-09"]);
});

test("codeText preserves exact source text without trimming or stripping shell prompts", () => {
  const fakeCode = (lines) => ({
    children: lines.map((textContent) => ({
      classList: { contains: (name) => name === "line" },
      textContent,
    })),
  });
  assert.equal(
    codeText(fakeCode(["$ ping -c 2 <IP_ADDRESS>", "> SELECT @@version;", "  indented", ""])),
    "$ ping -c 2 <IP_ADDRESS>\n> SELECT @@version;\n  indented\n",
  );
  assert.equal(
    codeText({ children: [], textContent: "  $ keep leading space and prompt  \n" }),
    "  $ keep leading space and prompt  \n",
  );
});
