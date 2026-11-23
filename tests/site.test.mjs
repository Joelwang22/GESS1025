import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test, { before } from "node:test";
import { promisify } from "node:util";

import {
  escapeVuePlaceholders,
  generateSite,
  isDecisionHeaders,
  isOutcomeList,
  parseChecklist,
} from "../scripts/checklist.mjs";
import { BLANK, blanksIn } from "../site/.vitepress/markdown.mjs";
import { codeText } from "../site/.vitepress/theme/copy.js";
import { matchTasks, normalizeTaskId } from "../site/.vitepress/theme/task-id.js";

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve(import.meta.dirname, "..");
const siteRoot = path.join(repositoryRoot, "site");
const sourcePath = path.join(
  repositoryRoot,
  "content/master-working-2026-11-21.working.132.md",
);
const manifestPath = path.join(repositoryRoot, "content/source.json");
let buildPromise;

async function text(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

async function buildSite() {
  if (!buildPromise) {
    const vitepressBin = path.join(
      repositoryRoot,
      "node_modules/vitepress/bin/vitepress.js",
    );
    buildPromise = execFileAsync(
      process.execPath,
      [vitepressBin, "build", siteRoot],
      { cwd: repositoryRoot, windowsHide: true },
    );
  }
  return buildPromise;
}

async function filesBelow(root, suffix = "") {
  const files = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (!suffix || entry.name.endsWith(suffix)) files.push(absolute);
    }
  }
  await walk(root);
  return files;
}

async function resolveBuiltTarget(distRoot, pathname) {
  let relative = decodeURIComponent(pathname.slice("/checklist/".length));
  if (!relative || relative.endsWith("/")) relative += "index.html";
  const direct = path.join(distRoot, relative);
  try {
    if ((await stat(direct)).isFile()) return direct;
  } catch {}
  if (!path.extname(relative)) {
    const html = `${direct}.html`;
    try {
      if ((await stat(html)).isFile()) return html;
    } catch {}
  }
  return null;
}

let checklist;
let manifest;

function taskLink(id) {
  return `/generated/tasks/${id.toLowerCase()}`;
}

function fencedBlocks(markdown) {
  const blocks = [];
  let current = null;
  for (const line of markdown.split("\n")) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (current === null) {
      if (marker) current = { kind: marker[1][0], length: marker[1].length, lines: [line] };
      continue;
    }
    current.lines.push(line);
    if (
      marker &&
      marker[1][0] === current.kind &&
      marker[1].length >= current.length &&
      marker[2].trim() === ""
    ) {
      blocks.push(current.lines.join("\n"));
      current = null;
    }
  }
  return blocks;
}

function proseOutsideCode(markdown) {
  let prose = markdown;
  for (const block of fencedBlocks(markdown)) prose = prose.replace(block, "\n");
  return prose.replace(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)/g, " ");
}

function frontmatterOf(page) {
  return page.slice(0, page.indexOf("\n---\n", 4));
}

before(async () => {
  await generateSite({ sourcePath, manifestPath, outputRoot: repositoryRoot });
  checklist = parseChecklist(await text("content/master-working-2026-11-21.working.132.md"));
  manifest = JSON.parse(await text("content/source.json"));
});

test("provides home, checklist index, and provenance pages", async () => {
  const [home, index, source] = await Promise.all([
    text("site/index.md"),
    text("site/checklist/index.md"),
    text("site/about/source.md"),
  ]);

  assert.match(home, /OSCP master checklist/);
  assert.match(home, /2026-11-21\.working\.132/);
  assert.match(home, /generated\/tasks\/net-01/);
  assert.match(index, /28 modules/);
  assert.match(index, /generated\/modules\/network/);
  assert.match(source, /8d6eff26e2b383b832399636b356009e68ae68e7918217a1a837ee8799cccad5/);
});

test("generates one readable page per task and module", async () => {
  const [taskFiles, moduleFiles, net01, net05] = await Promise.all([
    readdir(path.join(siteRoot, "generated/tasks")),
    readdir(path.join(siteRoot, "generated/modules")),
    text("site/generated/tasks/net-01.md"),
    text("site/generated/tasks/net-05.md"),
  ]);

  assert.equal(taskFiles.length, 145);
  assert.equal(moduleFiles.length, 28);
  assert.match(net01, /^# NET-01\. Check connectivity/m);
  assert.match(net01, /## Explanations and troubleshooting/);
  assert.match(net05, /Next: \[WEB-01\]\(\.\/web-01\)/);
});

test("preserves module and task order in the sidebar", async () => {
  const sidebar = JSON.parse(
    await text("site/.vitepress/generated/sidebar.json"),
  );

  assert.equal(sidebar.length, 28);
  assert.equal(sidebar[0].text, "Network");
  assert.deepEqual(
    sidebar[0].items.slice(0, 3).map(({ text: label, link }) => ({ label, link })),
    [
      {
        label: "NET-01 · Check connectivity",
        link: "/generated/tasks/net-01",
      },
      {
        label: "NET-02 · Scan the box's TCP ports and services",
        link: "/generated/tasks/net-02",
      },
      {
        label: "NET-03 · Clarify one ambiguous TCP service only if needed",
        link: "/generated/tasks/net-03",
      },
    ],
  );
});

test("names modules with an explicit acronym-correct display map", async () => {
  const [sidebar, index] = await Promise.all([
    text("site/.vitepress/generated/sidebar.json").then(JSON.parse),
    text("site/checklist/index.md"),
  ]);
  const indexNames = [...index.matchAll(/^\| \[([^\]]+)\]\(\.\.\/generated\/modules\//gm)].map(
    (match) => match[1],
  );

  assert.equal(indexNames.length, 28);
  assert.deepEqual(sidebar.map(({ text: label }) => label), indexNames);
  for (const name of ["HTTP", "Windows and Active Directory", "DNS and NFS", "SNMP", "MSSQL", "FTP TLS", "SSH knock", "SQL continuation", "Mail and RDP"]) {
    assert.ok(indexNames.includes(name), name);
  }
  const httpModule = await text("site/generated/modules/http.md");
  assert.match(httpModule, /^title: "HTTP"$/m);
  assert.match(httpModule, /^# HTTP$/m);
});

test("emits a complete call-number catalog in source order with provenance", async () => {
  const catalog = JSON.parse(await text("site/.vitepress/generated/catalog.json"));
  const sidebar = JSON.parse(await text("site/.vitepress/generated/sidebar.json"));

  assert.equal(catalog.edition, manifest.edition);
  assert.equal(catalog.sourceDigest, manifest.sourceDigest);
  assert.equal(catalog.snapshotSha256, manifest.snapshotSha256);
  assert.equal(catalog.moduleCount, checklist.modules.length);
  assert.equal(catalog.taskCount, checklist.tasks.length);
  assert.deepEqual(
    catalog.modules.map(({ id, title, link, hasContext, tasks }) => ({ id, title, link, hasContext, tasks })),
    checklist.modules.map((module, index) => ({
      id: module.id,
      title: sidebar[index].text,
      link: `/generated/modules/${module.id}`,
      hasContext: module.context.length > 0,
      tasks: module.tasks.map(({ id, title }) => ({ id, title, link: taskLink(id) })),
    })),
  );
  assert.deepEqual(
    catalog.tasks,
    checklist.tasks.map(({ id, title, moduleId }) => ({
      id,
      title,
      link: taskLink(id),
      moduleId,
      moduleTitle: sidebar[checklist.modules.findIndex((module) => module.id === moduleId)].text,
    })),
  );
  assert.equal(new Set(catalog.tasks.map(({ id }) => id)).size, 145);
});

test("emits route data keyed by task with outbound, terminal, and inbound tracings", async () => {
  const [routes, catalog] = await Promise.all([
    text("site/.vitepress/generated/routes.json").then(JSON.parse),
    text("site/.vitepress/generated/catalog.json").then(JSON.parse),
  ]);
  const taskIds = checklist.tasks.map(({ id }) => id);
  const terminalStates = new Set(manifest.terminalStates);
  const moduleById = new Map(catalog.modules.map((module) => [module.id, module]));

  assert.deepEqual(Object.keys(routes), taskIds);
  const expectedInbound = new Map(taskIds.map((id) => [id, []]));
  for (const task of checklist.tasks) {
    const route = routes[task.id];
    const module = moduleById.get(task.moduleId);
    assert.equal(route.id, task.id);
    assert.equal(route.title, task.title);
    assert.equal(route.link, taskLink(task.id));
    assert.deepEqual(route.module, { id: module.id, title: module.title, link: module.link });
    assert.equal(
      route.context,
      checklist.modules.find(({ id }) => id === task.moduleId).context,
    );

    const page = await text(`site/generated/tasks/${task.id.toLowerCase()}.md`);
    const linked = [
      ...new Set(
        [...page.matchAll(/\]\(\.\/([a-z][a-z0-9]*-\d{2})(?: "[^"]+")?\)/g)].map(
          (match) => match[1].toUpperCase(),
        ),
      ),
    ].filter((id) => id !== task.id);
    assert.deepEqual(route.outbound.map(({ id }) => id), linked, `${task.id} outbound`);
    for (const destination of route.outbound) {
      assert.deepEqual(destination, {
        id: destination.id,
        title: routes[destination.id].title,
        link: taskLink(destination.id),
      });
      expectedInbound.get(destination.id).push(task.id);
    }
    assert.ok(route.terminalStates.every((state) => terminalStates.has(state)));
    for (const match of proseOutsideCode(`${task.working}\n${task.explanation}`).matchAll(
      /\bNext: ((?:PAUSE|GAP)-[A-Z]+(?:-[A-Z]+)*)/g,
    )) {
      assert.ok(route.terminalStates.includes(match[1]), `${task.id} ${match[1]}`);
    }
  }
  for (const id of taskIds) {
    assert.deepEqual(routes[id].inbound.map(({ id: source }) => source), expectedInbound.get(id));
  }

  assert.ok(routes["NET-01"].outbound.some(({ id }) => id === "NET-02"));
  assert.ok(routes["NET-01"].terminalStates.includes("PAUSE-ROUTE"));
  assert.ok(routes["NET-05"].outbound.some(({ id }) => id === "WEB-01"));
  assert.ok(routes["WEB-01"].outbound.some(({ id }) => id === "WEB-08"));
  assert.ok(routes["LNX-09"].outbound.some(({ id }) => id === "LPRIV-15"));
  assert.ok(routes["NET-02"].inbound.some(({ id }) => id === "NET-01"));
});

test("links every source route mark derived from the corpus", async () => {
  let nextTasks = 0;
  let nextTerminals = 0;
  let boldSingles = 0;
  let generatedNextTasks = 0;
  let generatedNextTerminals = 0;
  let generatedBoldSingles = 0;
  const terminalStates = new Set(manifest.terminalStates);

  for (const task of checklist.tasks) {
    const source = proseOutsideCode(`${task.working}\n${task.explanation}`);
    const generated = proseOutsideCode(
      await text(`site/generated/tasks/${task.id.toLowerCase()}.md`),
    );
    for (const match of source.matchAll(/\bNext: ([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)/g)) {
      if (terminalStates.has(match[1])) nextTerminals += 1;
      else nextTasks += 1;
    }
    boldSingles += [...source.matchAll(/\*\*[A-Z][A-Z0-9]*-\d{2}\*\*/g)].length;
    generatedNextTasks += [...generated.matchAll(/\bNext: \[[A-Z][A-Z0-9]*-\d{2}\]\(\.\/[a-z0-9-]+\)/g)].length;
    generatedNextTerminals += [...generated.matchAll(/\bNext: (?:PAUSE|GAP)-[A-Z-]+/g)].length;
    generatedBoldSingles += [...generated.matchAll(/\*\*\[[A-Z][A-Z0-9]*-\d{2}\]\(\.\/[a-z0-9-]+\)\*\*/g)].length;
  }

  assert.ok(nextTasks > 0 && nextTerminals > 0 && boldSingles > 0);
  assert.equal(generatedNextTasks, nextTasks);
  assert.equal(generatedNextTerminals, nextTerminals);
  assert.equal(generatedBoldSingles, boldSingles);

  const [web01, lnx09, rexp04] = await Promise.all([
    text("site/generated/tasks/web-01.md"),
    text("site/generated/tasks/lnx-09.md"),
    text("site/generated/tasks/rexp-04.md"),
  ]);
  assert.match(web01, /\*\*\[WEB-06\]\(\.\/web-06\)\/\[08\]\(\.\/web-08 "WEB-08"\)\*\*/);
  assert.match(lnx09, /\*\*\[LPRIV-01\]\(\.\/lpriv-01\) through \[LPRIV-15\]\(\.\/lpriv-15\)\*\*/);
  assert.match(rexp04, /\*\*\[SHELL-01\]\(\.\/shell-01\)\/\[EXP-03\]\(\.\/exp-03\)\*\*/);
});

test("task pages carry station frontmatter and verbatim module context", async () => {
  const catalog = JSON.parse(await text("site/.vitepress/generated/catalog.json"));
  const titles = new Map(catalog.modules.map(({ id, title }) => [id, title]));
  let contextual = 0;

  for (const module of checklist.modules) {
    for (const task of module.tasks) {
      const page = await text(`site/generated/tasks/${task.id.toLowerCase()}.md`);
      const head = frontmatterOf(page);
      assert.match(head, new RegExp(`^taskId: "${task.id}"$`, "m"));
      assert.match(head, new RegExp(`^moduleId: "${module.id}"$`, "m"));
      assert.match(head, new RegExp(`^moduleTitle: ${JSON.stringify(titles.get(module.id))}$`, "m"));
      if (!module.context) {
        assert.doesNotMatch(page, /ledger-module-context/, task.id);
        continue;
      }
      contextual += 1;
      const contextStart = page.indexOf('<section class="ledger-module-context"');
      const contextBody = page.indexOf(escapeVuePlaceholders(module.context));
      assert.ok(contextStart > page.indexOf(`# ${task.id}. `), task.id);
      assert.ok(contextBody > contextStart, `${task.id} context`);
      assert.ok(
        page.indexOf("</section>", contextBody) < page.indexOf("## Explanations and troubleshooting"),
        task.id,
      );
    }
  }
  assert.equal(
    contextual,
    checklist.modules.filter(({ context }) => context).reduce((sum, { tasks }) => sum + tasks.length, 0),
  );
  assert.ok(contextual > 0);
});

test("preserves every fenced command block byte for byte", async () => {
  let blocks = 0;
  for (const task of checklist.tasks) {
    const page = await text(`site/generated/tasks/${task.id.toLowerCase()}.md`);
    for (const block of fencedBlocks(`${task.working}\n${task.explanation}`)) {
      blocks += 1;
      assert.ok(page.includes(block), `${task.id} changed a fenced block`);
    }
  }
  assert.ok(blocks > 0);

  const mail = checklist.tasks.find(({ working, explanation }) =>
    `${working}${explanation}`.includes("<0.4096>"),
  );
  const mailPage = await text(`site/generated/tasks/${mail.id.toLowerCase()}.md`);
  assert.ok(mailPage.includes("'(BODY.PEEK[TEXT]<0.4096>)'"));
  assert.doesNotMatch(mailPage, /&lt;0\.4096&gt;/);
});

test("ports supporting local references and rewrites their task links", async () => {
  const [references, db02, exp03, rdp02, wupload02] = await Promise.all([
    readdir(path.join(siteRoot, "generated/references")),
    text("site/generated/tasks/db-02.md"),
    text("site/generated/tasks/exp-03.md"),
    text("site/generated/tasks/rdp-02.md"),
    text("site/generated/tasks/wupload-02.md"),
  ]);

  assert.deepEqual(references.sort(), [
    "checklist.md",
    "lab-retrospective.md",
    "make-lab-upload-proof.md",
  ]);
  assert.match(db02, /\]\(\.\.\/references\/checklist\.md\)/);
  assert.match(exp03, /\]\(\.\/win-01\.md\)/);
  assert.match(rdp02, /\]\(\.\/win-01\.md\)/);
  assert.match(wupload02, /\]\(\.\.\/references\/make-lab-upload-proof\.md\)/);
});

test("configures VitePress for GitHub Pages and local search", async () => {
  const config = await text("site/.vitepress/config.mjs");

  assert.match(config, /base:\s*["']\/checklist\/["']/);
  assert.match(config, /provider:\s*["']local["']/);
  assert.match(config, /sidebar/);
  assert.match(config, /outline/);
});

test("builds base-aware task, asset, search, and navigation links", async () => {
  await buildSite();

  const [home, net01] = await Promise.all([
    text("site/.vitepress/dist/index.html"),
    text("site/.vitepress/dist/generated/tasks/net-01.html"),
  ]);
  assert.match(home, /\/checklist\/assets\//);
  assert.match(net01, /\/checklist\/generated\/tasks\/net-02/);
  assert.doesNotMatch(home, /(?:href|src)="\/assets\//);
  assert.doesNotMatch(net01, /href="\/generated\//);
});

test("every built local link and search result resolves inside the Pages base", async () => {
  await buildSite();
  const distRoot = path.join(siteRoot, ".vitepress/dist");
  const htmlFiles = await filesBelow(distRoot, ".html");
  const failures = [];
  let checked = 0;

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    const pageRelative = path.relative(distRoot, htmlFile).replaceAll("\\", "/");
    const base = new URL(`https://example.test/checklist/${pageRelative}`);
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const value = match[1];
      if (/^(?:https?:|mailto:|data:|#)/.test(value)) continue;
      const resolved = new URL(value, base);
      if (!resolved.pathname.startsWith("/checklist/")) {
        failures.push(`${pageRelative}: outside base ${value}`);
        continue;
      }
      const target = await resolveBuiltTarget(distRoot, resolved.pathname);
      checked += 1;
      if (!target) failures.push(`${pageRelative}: missing ${value}`);
      else if (resolved.hash) {
        const targetHtml = await readFile(target, "utf8");
        const id = decodeURIComponent(resolved.hash.slice(1));
        if (!targetHtml.includes(`id="${id}"`)) {
          failures.push(`${pageRelative}: missing anchor ${value}`);
        }
      }
    }
  }

  const searchFiles = (await filesBelow(path.join(distRoot, "assets"), ".js")).filter(
    (file) => path.basename(file).includes("localSearchIndex"),
  );
  assert.equal(searchFiles.length, 1);
  const searchSource = await readFile(searchFiles[0], "utf8");
  for (const match of searchSource.matchAll(/\/checklist\/[^"'\\]+/g)) {
    const resolved = new URL(match[0], "https://example.test");
    const target = await resolveBuiltTarget(distRoot, resolved.pathname);
    checked += 1;
    if (!target) failures.push(`search index: missing ${match[0]}`);
  }

  assert.ok(checked > 1_000, `expected a broad link audit, checked ${checked}`);
  assert.deepEqual(failures, []);
});

test("built pages render inline-code placeholders literally once", async () => {
  await buildSite();
  const distRoot = path.join(siteRoot, ".vitepress/dist/generated");
  const failures = [];
  for (const htmlFile of await filesBelow(distRoot, ".html")) {
    const html = await readFile(htmlFile, "utf8");
    if (/&amp;(?:lt|gt|#123|#125);/.test(html)) {
      failures.push(path.relative(distRoot, htmlFile).replaceAll("\\", "/"));
    }
  }
  assert.deepEqual(failures, []);

  const [dnsNfs, nfs01] = await Promise.all([
    text("site/.vitepress/dist/generated/modules/dns_nfs.html"),
    text(`site/.vitepress/dist/generated/tasks/${checklist.modules.find(({ id }) => id === "dns_nfs").tasks[0].id.toLowerCase()}.html`),
  ]);
  assert.match(dnsNfs, /<code>&lt;\.\.\.&gt;<\/code>/);
  assert.match(nfs01, /<code>&lt;\.\.\.&gt;<\/code>/);
});

test("uses a Vite release patched for the Windows launch-editor advisory", async () => {
  const lockfile = await text("pnpm-lock.yaml");

  assert.doesNotMatch(lockfile, /vite@5\.4\.21/);
  assert.match(lockfile, /vite@(?:[7-9]|[1-9]\d)\./);
});

test("deploys the verified build with the official GitHub Pages actions", async () => {
  const workflow = await text(".github/workflows/pages.yml");
  const globalPermissions = workflow.slice(
    workflow.indexOf("permissions:"),
    workflow.indexOf("jobs:"),
  );
  const deployJob = workflow.slice(workflow.indexOf("  deploy:"));

  assert.match(workflow, /contents:\s*read/);
  assert.doesNotMatch(globalPermissions, /pages:\s*write/);
  assert.doesNotMatch(globalPermissions, /id-token:\s*write/);
  assert.match(deployJob, /pages:\s*write/);
  assert.match(deployJob, /id-token:\s*write/);
  assert.match(workflow, /actions\/configure-pages@v6/);
  assert.match(workflow, /actions\/upload-pages-artifact@v5/);
  assert.match(workflow, /actions\/deploy-pages@v5/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.ok(workflow.indexOf("pnpm test") < workflow.indexOf("pnpm build"));
  assert.match(workflow, /site\/\.vitepress\/dist/);
});

test("documents local use, provenance, generation ownership, and Pages setup", async () => {
  const [readme, nodeVersion] = await Promise.all([
    text("README.md"),
    text(".node-version"),
  ]);

  assert.equal(nodeVersion.trim(), "22");
  assert.match(readme, /pnpm dev/);
  assert.match(readme, /pnpm test/);
  assert.match(readme, /pnpm build/);
  assert.match(readme, /2026-11-21\.working\.132/);
  assert.match(readme, /generated-file ownership/i);
  assert.match(readme, /refreshing the checklist/i);
  assert.match(readme, /GitHub Actions/i);
  assert.match(readme, /\/checklist\/about\/source\.html/);
});

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&");
}

function builtMainText(html, label) {
  const start = html.indexOf("<main");
  const end = html.lastIndexOf("</main>");
  assert.ok(start >= 0 && end > start, `${label} has no <main> content region`);
  return decodeEntities(
    html
      .slice(start, end)
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\/?span\b[^>]*>/gi, "")
      .replace(/<[^>]+>/g, " "),
  );
}

function tokenCounts(value) {
  const counts = new Map();
  for (const token of value.match(/[A-Za-z0-9]+/g) ?? []) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

test("built task pages keep every source word and every command line visible in <main>", async () => {
  await buildSite();
  const failures = [];
  let commandLines = 0;
  for (const module of checklist.modules) {
    for (const task of module.tasks) {
      const label = task.id;
      const html = await text(
        `site/.vitepress/dist/generated/tasks/${task.id.toLowerCase()}.html`,
      );
      const main = builtMainText(html, label);
      const source = decodeEntities(
        [module.context, task.working, task.explanation]
          .join("\n")
          .replace(/\]\([^)\s]*\)/g, "]")
          // Ordered-list numbers render as <ol> markers, not text.
          .replace(/^[ \t>]*\d+[.)][ \t]/gm, ""),
      );
      const built = tokenCounts(main);
      for (const [token, count] of tokenCounts(source)) {
        const have = built.get(token) ?? 0;
        if (have < count) failures.push(`${label}: "${token}" ${have}/${count}`);
      }
      for (const block of fencedBlocks(`${task.working}\n${task.explanation}`)) {
        for (const line of block.split("\n").slice(1, -1)) {
          if (!line.trim()) continue;
          commandLines += 1;
          if (!main.includes(line.trimEnd())) {
            failures.push(`${label}: command line missing: ${line.slice(0, 80)}`);
          }
        }
      }
    }
  }
  assert.ok(commandLines > 500, `expected a broad command audit, checked ${commandLines}`);
  assert.deepEqual(failures.slice(0, 40), []);
});

function fenceBodies(markdown) {
  return fencedBlocks(markdown).map((block) => {
    const lines = block.split("\n");
    return {
      lang: lines[0].replace(/^ {0,3}(`{3,}|~{3,})/, "").trim(),
      body: lines.slice(1, -1).join("\n"),
    };
  });
}

function builtPlates(html) {
  const main = html.slice(html.indexOf("<main"), html.lastIndexOf("</main>"));
  return [
    ...main.matchAll(
      /<div class="cmd-plate language-([^"\s]*)"[^>]*>(<div class="cmd-head">[\s\S]*?)<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/g,
    ),
  ].map(([, lang, head, code]) => ({
    lang,
    head,
    code,
    text: decodeEntities(code.replace(/<[^>]+>/g, "")),
  }));
}

async function taskPlates(task) {
  const html = await text(`site/.vitepress/dist/generated/tasks/${task.id.toLowerCase()}.html`);
  const module = checklist.modules.find(({ id }) => id === task.moduleId);
  return {
    html,
    expected: fenceBodies([module.context, task.working, task.explanation].join("\n")),
    built: builtPlates(html),
  };
}

test("every command plate renders and copies its source block text exactly", async () => {
  await buildSite();
  const failures = [];
  let blocks = 0;
  for (const task of checklist.tasks) {
    const { html, expected, built } = await taskPlates(task);
    if (built.length !== expected.length) {
      failures.push(`${task.id}: ${built.length} plates for ${expected.length} blocks`);
      continue;
    }
    for (const [index, block] of expected.entries()) {
      blocks += 1;
      if (built[index].text !== block.body) failures.push(`${task.id}: block ${index + 1} text differs`);
      if (built[index].lang !== block.lang) failures.push(`${task.id}: block ${index + 1} language differs`);
      if (!built[index].head.includes(`<span class="cmd-lang">${block.lang || "text"}</span>`)) {
        failures.push(`${task.id}: block ${index + 1} has no visible language label`);
      }
    }
    if (/class="copy"/.test(html)) failures.push(`${task.id}: hover-only copy button remains`);
    if ((html.match(/class="cmd-copy"/g) ?? []).length !== expected.length) {
      failures.push(`${task.id}: copy controls do not match plates`);
    }
  }
  assert.ok(blocks > 500, `expected a broad plate audit, checked ${blocks}`);
  assert.deepEqual(failures, []);
});

test("the copy handler joins rendered line text without trimming or prompt stripping", () => {
  const line = (value) => ({ classList: { contains: (name) => name === "line" }, textContent: value });
  const other = { classList: { contains: () => false }, textContent: "ignored" };
  const code = { children: [line("$ echo '<IP_ADDRESS>'  "), other, line(""), line("  > tail")] };
  assert.equal(codeText(code), "$ echo '<IP_ADDRESS>'  \n\n  > tail");
});

test("command blanks are highlighted in place and listed above each plate", async () => {
  await buildSite();
  const escape = (value) => value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const failures = [];
  let marked = 0;
  for (const task of checklist.tasks) {
    const { expected, built } = await taskPlates(task);
    for (const [index, block] of expected.entries()) {
      const count = [...block.body.matchAll(BLANK)].length;
      const found = (built[index].code.match(/class="blank"/g) ?? []).length;
      if (found !== count) failures.push(`${task.id} block ${index + 1}: ${found}/${count} blanks marked`);
      for (const blank of blanksIn(block.body)) {
        if (!built[index].head.includes(`<code class="blank">${escape(blank)}</code>`)) {
          failures.push(`${task.id} block ${index + 1}: header omits ${blank}`);
        }
      }
      marked += count;
    }
  }
  assert.ok(marked > 400, `expected many marked blanks, found ${marked}`);
  assert.deepEqual(failures, []);
  const literal = checklist.tasks.find(({ working, explanation }) =>
    `${working}${explanation}`.includes("<0.4096>"),
  );
  const html = await text(`site/.vitepress/dist/generated/tasks/${literal.id.toLowerCase()}.html`);
  assert.doesNotMatch(html, /class="blank">&lt;0\.4096&gt;/);
});

test("routes, stop states, and decision tables carry distinct marks", async () => {
  await buildSite();
  const [net01, web01] = await Promise.all([
    text("site/.vitepress/dist/generated/tasks/net-01.html"),
    text("site/.vitepress/dist/generated/tasks/web-01.html"),
  ]);
  assert.match(
    net01,
    /<a href="\.\/net-02\.html" class="route" title="NET-02: Scan the box&#39;s TCP ports and services">NET-02<\/a>/,
  );
  assert.match(net01, /<strong><span class="stop"[^>]*>PAUSE-ROUTE<\/span><\/strong>/);
  assert.doesNotMatch(net01, /<a [^>]*>[^<]*PAUSE-ROUTE/);
  assert.match(net01, /<table class="decision cols-2"/);
  assert.match(net01, /<td data-label="Result">/);
  assert.match(net01, /<td data-label="Next">/);
  assert.match(web01, /<a href="\.\/web-08\.html" title="WEB-08: [^"]+" class="route route-short">08<\/a>/);
  // The title is the verbatim source heading; the call-number stamp and the
  // task's place in its module sit in the header row above it, outside <main>.
  assert.match(net01, /<h1 id="net-01-check-connectivity" tabindex="-1">NET-01\. Check connectivity <a class="header-anchor"/);
  const header = net01.indexOf('<div class="task-header">');
  assert.ok(header >= 0 && header < net01.indexOf("<main"), "header row precedes <main>");
  assert.match(net01, /<span class="task-id-pair"><span class="task-stamp">NET-01<\/span><span class="task-position">task 1 of 5<\/span><\/span>/);
  assert.match(net01, /<span class="sb-id">NET-01<\/span> <span class="sb-title">Check connectivity<\/span>/);

  const terminalStates = new Set(manifest.terminalStates);
  let stops = 0;
  for (const task of checklist.tasks) {
    const html = await text(`site/.vitepress/dist/generated/tasks/${task.id.toLowerCase()}.html`);
    const main = html.slice(html.indexOf("<main"), html.lastIndexOf("</main>"));
    for (const match of proseOutsideCode(`${task.working}\n${task.explanation}`).matchAll(
      /\bNext: ((?:PAUSE|GAP)-[A-Z]+(?:-[A-Z]+)*)/g,
    )) {
      stops += 1;
      assert.ok(terminalStates.has(match[1]));
      assert.ok(
        main.includes(`<span class="stop" title="Stop state named by the checklist">${match[1]}</span>`),
        `${task.id} ${match[1]}`,
      );
    }
  }
  assert.ok(stops > 0);
});

test("task pages carry their derived routes and a route sheet outside <main>", async () => {
  await buildSite();
  const routes = JSON.parse(await text("site/.vitepress/generated/routes.json"));
  const brief = ({ id, title }) => ({ id, title, module: routes[id].module.title });
  for (const [index, task] of checklist.tasks.entries()) {
    const head = frontmatterOf(await text(`site/generated/tasks/${task.id.toLowerCase()}.md`));
    const field = (name) => JSON.parse(head.match(new RegExp(`^${name}: (.*)$`, "m"))[1]);
    assert.deepEqual(field("routesOut"), routes[task.id].outbound.map(brief), task.id);
    assert.deepEqual(field("routesIn"), routes[task.id].inbound.map(brief), task.id);
    assert.deepEqual(field("routeStops"), routes[task.id].terminalStates, task.id);
    assert.deepEqual(field("sourcePosition"), { index: index + 1, total: checklist.tasks.length });
  }
  const [net01, net05] = await Promise.all([
    text("site/.vitepress/dist/generated/tasks/net-01.html"),
    text("site/.vitepress/dist/generated/tasks/net-05.html"),
  ]);
  const panel = net01.indexOf('class="route-panel"');
  assert.ok(panel > net01.lastIndexOf("</main>"), "route sheet sits after <main>");
  assert.match(net01.slice(panel), /href="\/checklist\/generated\/tasks\/net-02\.html"/);
  assert.match(net01.slice(panel), /<span class="stop">PAUSE-ROUTE<\/span>/);
  assert.match(net01, /class="task-rail"/);
  assert.match(net01, /Next in source order/);
  // A hub with more than twelve inbound routes folds them into native <details>.
  assert.ok(routes["NET-05"].inbound.length > 12);
  assert.match(
    net05,
    new RegExp(`<summary>Linked from ${routes["NET-05"].inbound.length} tasks</summary>`),
  );
});

test("publishes the source preface verbatim as the default box route page", async () => {
  await buildSite();
  const html = await text("site/.vitepress/dist/generated/start.html");
  const main = builtMainText(html, "start");
  const preface = decodeEntities(
    checklist.preface
      .replace(/^<!--[\s\S]*?-->\s*/, "")
      .replace(/\]\([^)\s]*\)/g, "]")
      .replace(/^[ \t>]*\d+[.)][ \t]/gm, ""),
  );
  const built = tokenCounts(main);
  const missing = [...tokenCounts(preface)].filter(([token, count]) => (built.get(token) ?? 0) < count);
  assert.deepEqual(missing, []);
  for (const id of ["NET-01", "NET-05", "SSH-02", "LNX-03", "EXP-03", "AD-01"]) {
    assert.match(html, new RegExp(`href="\\./tasks/${id.toLowerCase()}\\.html" class="route"`), id);
  }
  assert.match(await text("site/index.md"), /generated\/start\.md/);
});

test("the go-to box accepts loose task ID spellings", () => {
  assert.equal(normalizeTaskId("web-09"), "WEB-09");
  assert.equal(normalizeTaskId(" lpriv2 "), "LPRIV-02");
  assert.equal(normalizeTaskId("WUPLOAD-02"), "WUPLOAD-02");
  assert.equal(normalizeTaskId("rexp 4"), "REXP-04");
  assert.equal(normalizeTaskId("PAUSE-ROUTE"), null);
  assert.equal(normalizeTaskId(""), null);
});

test("the theme never hides content with CSS", async () => {
  // Every theme stylesheet: tokens.css, components.css and custom.css.
  const css = (await Promise.all((await themeStylesheets()).map((file) => readFile(file, "utf8")))).join(
    "\n",
  );
  for (const pattern of [
    /display:\s*none/,
    /visibility:\s*hidden/,
    /content-visibility/,
    /clip(?:-path)?:\s*(?:rect|inset)/,
    /(?:^|[\s;{])(?:max-)?height:\s*0(?:px)?\s*[;}]/m,
    /overflow(?:-[xy])?:\s*(?:hidden|clip)/,
    /(?:left|right|top):\s*-\d{3,}/,
  ]) {
    assert.doesNotMatch(css, pattern);
  }
});

test("decision tables are recognised by their route column, not by the word Next alone", () => {
  for (const headers of [
    ["Result", "Next"],
    ["Result", "Next choice"],
    ["Observed result", "Next action, after cleanup"],
    ["Prior blocked question on this assigned endpoint", "Revisit"],
  ]) {
    assert.ok(isDecisionHeaders(headers), headers.join(" | "));
  }
  for (const headers of [
    ["Engine", "Next table expression"],
    ["Engine", "Next column expression"],
    ["Required fact", "Compare with the candidate"],
    ["Mark", "Meaning"],
  ]) {
    assert.ok(!isDecisionHeaders(headers), headers.join(" | "));
  }
});

test("every task page offers jumps to its own landmarks, and each target exists", async () => {
  await buildSite();
  for (const task of checklist.tasks) {
    const html = await text(`site/.vitepress/dist/generated/tasks/${task.id.toLowerCase()}.html`);
    const meta = html.match(/<nav class="task-jumps"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(meta, `${task.id} has a jump row`);
    for (const [, anchor] of meta.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(html.includes(`id="${anchor}"`), `${task.id} jump #${anchor}`);
    }
    assert.match(meta, /href="#explanations-and-troubleshooting"/);
    const routeCount = JSON.parse(frontmatterOf(await text(`site/generated/tasks/${task.id.toLowerCase()}.md`)).match(/^routesOut: (.*)$/m)[1]).length;
    assert.match(meta, new RegExp(`href="#task-routes">Routes \\(${routeCount}\\)</a>`), `${task.id} routes count`);
    // Jumps go to the working section only. Every target must sit before the
    // explanations band, and a jump exists exactly when the working section
    // (or the module context above it) has the landmark.
    const notes = html.indexOf('<section class="task-notes"');
    for (const [, anchor] of meta.matchAll(/href="#(cmd-\d+|results)"/g)) {
      assert.ok(html.indexOf(`id="${anchor}"`) < notes, `${task.id} #${anchor} is above the explanations`);
    }
    assert.equal(/href="#cmd-\d+"/.test(meta), fencedBlocks(task.working).length > 0, `${task.id} first-command jump`);
    const workingHtml = html.slice(html.indexOf("<main"), notes);
    // Result jump: the first decision table before the explanations, or
    // failing that the first outcome list there, labelled for what it is.
    const hasTable = /<table class="decision/.test(workingHtml);
    const hasOutcomes = /<ul class="outcomes"/.test(workingHtml);
    const expectedLabel = hasTable ? "Result table" : hasOutcomes ? "Outcomes" : null;
    const label = meta.match(/href="#results">([^<]+)<\/a>/)?.[1] ?? null;
    assert.equal(label, expectedLabel, `${task.id} result jump`);
    if (expectedLabel) {
      const target = html.match(/<(table|ul) [^>]*id="results"/)?.[1];
      assert.equal(target, hasTable ? "table" : "ul", `${task.id} #results target`);
    }
  }
  const net05Jumps = (await text("site/.vitepress/dist/generated/tasks/net-05.html")).match(
    /<nav class="task-jumps"[^>]*>([\s\S]*?)<\/nav>/,
  )[1];
  assert.match(net05Jumps, /href="#results">Outcomes<\/a>/, "NET-05 jumps to its outcome list");
  const web09 = (await text("site/.vitepress/dist/generated/tasks/web-09.html")).match(
    /<nav class="task-jumps"[^>]*>([\s\S]*?)<\/nav>/,
  )[1];
  assert.doesNotMatch(web09, /First command/, "WEB-09's working step has no command");
  assert.match(web09, /href="#results"/);
  const [wsql05, ad03] = await Promise.all([
    text("site/.vitepress/dist/generated/tasks/wsql-05.html"),
    text("site/.vitepress/dist/generated/tasks/ad-03.html"),
  ]);
  assert.doesNotMatch(wsql05, /<table class="decision[^"]*"[^>]*>\s*<thead>\s*<tr>\s*<th>Engine<\/th>/);
  assert.match(ad03, /<table class="decision[^>]*><thead><tr><th>Prior blocked question on this assigned endpoint<\/th><th>Revisit<\/th>/);
});

test("Enter when and Question cues and outcome lists keep their exact words", async () => {
  await buildSite();
  let cues = 0;
  let outcomes = 0;
  for (const task of checklist.tasks) {
    const html = await text(`site/.vitepress/dist/generated/tasks/${task.id.toLowerCase()}.html`);
    const source = `${task.working}\n${task.explanation}`;
    const expectedCues = proseOutsideCode(source).match(/^(?:Enter when|Question):/gm) ?? [];
    const builtCues = html.match(/<p class="cue cue-(?:enter|question)"><span class="cue-label">(?:Enter when|Question):<\/span>/g) ?? [];
    assert.equal(builtCues.length, expectedCues.length, `${task.id} cues`);
    cues += builtCues.length;
    // The first outcome list on a page may also carry id="results".
    for (const list of html.matchAll(/<ul class="outcomes"[^>]*>([\s\S]*?)<\/ul>/g)) {
      for (const [, slug] of list[1].matchAll(/<li><span class="outcome-slug">([a-z0-9_]+)<\/span>:/g)) {
        assert.ok(source.includes(`- ${slug}: `), `${task.id} ${slug}`);
        outcomes += 1;
      }
    }
  }
  assert.ok(cues >= 36, `expected the 36 source cues, found ${cues}`);
  const sourceOutcomes = checklist.tasks.reduce(
    (sum, task) =>
      sum +
      (proseOutsideCode(`${task.working}\n${task.explanation}`).match(/^- [a-z][a-z0-9]*(?:_[a-z0-9]+)+: /gm) ?? [])
        .length,
    0,
  );
  // Lists that mix slugged and plain bullets stay ordinary lists.
  assert.ok(outcomes >= 100 && outcomes <= sourceOutcomes, `outcome rows ${outcomes} of ${sourceOutcomes}`);
  const net05 = await text("site/.vitepress/dist/generated/tasks/net-05.html");
  assert.match(net05, /<li><span class="outcome-slug">http_reported<\/span>: Nmap reported an HTTP\/HTTPS label/);
});

test("command plates keep Copy and Wrap on one row with blanks listed below", async () => {
  await buildSite();
  const html = await text("site/.vitepress/dist/generated/tasks/ad-03.html");
  const plates = builtPlates(html);
  assert.ok(plates.length > 0);
  for (const plate of plates) {
    const bar = plate.head.match(/<div class="cmd-bar">([\s\S]*?)<\/div>/)[1];
    assert.match(bar, /class="cmd-lang"/);
    assert.match(bar, /<button type="button" class="cmd-wrap" aria-pressed="true"/);
    assert.match(bar, /class="cmd-copy"/);
    assert.doesNotMatch(bar, /class="blank"/);
  }
  assert.match(html, /id="cmd-1"/);
});

test("the find box matches task IDs, title words, and modules", () => {
  const tasks = [
    { id: "SMB-01", title: "List shares for the current identity", module: "File services" },
    { id: "LPRIV-02", title: "Does this reviewed SUID binary change identity?", module: "Linux privilege" },
    { id: "AD-06", title: "Request one roastable Kerberos ticket", module: "Windows and Active Directory" },
  ];
  assert.deepEqual(matchTasks(tasks, "smb").map(({ id }) => id), ["SMB-01"]);
  assert.deepEqual(matchTasks(tasks, "suid").map(({ id }) => id), ["LPRIV-02"]);
  assert.deepEqual(matchTasks(tasks, "kerberos ticket").map(({ id }) => id), ["AD-06"]);
  assert.deepEqual(matchTasks(tasks, "linux").map(({ id }) => id), ["LPRIV-02"]);
  assert.deepEqual(matchTasks(tasks, "   "), []);
});

test("module pages list exact task titles in an aligned column without an outline", async () => {
  await buildSite();
  for (const module of checklist.modules) {
    const page = await text(`site/generated/modules/${module.id}.md`);
    assert.match(frontmatterOf(page), /^outline: false$/m);
    const html = await text(`site/.vitepress/dist/generated/modules/${module.id}.html`);
    // A module page is not a step in source order, so it has no task pager.
    assert.doesNotMatch(html, /in source order/, module.id);
    for (const task of module.tasks) {
      const row = html.match(
        new RegExp(`<span class="module-task-id">${task.id}\\.</span> <span class="module-task-title">([^<]*)</span>`),
      );
      assert.ok(row, `${module.id} lists ${task.id}`);
      assert.equal(decodeEntities(row[1]), task.title);
    }
  }
});

test("both light and dark browser chrome colours ship, and the layout keeps the sidebar whole", async () => {
  await buildSite();
  const home = await text("site/.vitepress/dist/index.html");
  // Browser chrome matches the paper colour of each theme (tokens.css).
  assert.match(home, /<meta name="theme-color" content="#faf9f5" media="\(prefers-color-scheme: light\)">/);
  assert.match(home, /<meta name="theme-color" content="#151a22" media="\(prefers-color-scheme: dark\)">/);
  const tokens = await text("site/.vitepress/theme/tokens.css");
  assert.match(tokens, /:root \{[\s\S]*--rb-paper: #faf9f5;/);
  assert.match(tokens, /\.dark \{[\s\S]*--rb-paper: #151a22;/);
  // VitePress derives the sidebar width from the layout maximum; above 1440px
  // the computed sidebar is narrower than its groups and titles clip.
  // Every theme stylesheet: tokens.css, components.css and custom.css.
  const css = (await Promise.all((await themeStylesheets()).map((file) => readFile(file, "utf8")))).join(
    "\n",
  );
  assert.match(css, /--vp-layout-max-width: 1440px;/);
});

test("the home Where to enter sheet quotes the box route verbatim with exact titles", async () => {
  await buildSite();
  const home = await text("site/.vitepress/dist/index.html");
  assert.match(await text("site/index.md"), /<!--@include: \.\/\.vitepress\/generated\/where-to-enter\.md-->/);
  const titles = new Map(checklist.tasks.map(({ id, title }) => [id, title]));
  const plain = (html) => decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
  // Expected rows come from the parsed preface: every Default box route row
  // whose decision opens with a task route.
  const table = checklist.preface.slice(checklist.preface.indexOf("## Default box route"));
  const expected = [...table.matchAll(/^\| ([^|]+?) +\| ([^|]+?) +\| [^|]+\|$/gm)]
    .map(([, when, decision]) => ({ when: when.trim(), decision: decision.trim() }))
    .filter(({ decision }) => /^\*\*[A-Z][A-Z0-9]*-\d{2}/.test(decision));
  assert.equal(expected.length, 5);
  const rows = [...home.matchAll(/<div class="enter-row">([\s\S]*?)<\/ul><\/div>/g)].map(([, row]) => row);
  assert.equal(rows.length, expected.length);
  for (const [index, { when, decision }] of expected.entries()) {
    const row = rows[index];
    assert.equal(plain(row.match(/<p class="enter-when">([\s\S]*?)<\/p>/)[1]), when, `row ${index + 1} When`);
    // The decision cell is quoted word for word, conditions included.
    assert.equal(
      plain(row.match(/<p class="enter-decision">([\s\S]*?)<\/p>/)[1]),
      decision.replaceAll("**", ""),
      `row ${index + 1} decision`,
    );
    const ids = [...new Set([...decision.matchAll(/[A-Z][A-Z0-9]*-\d{2}/g)].map(([id]) => id))];
    const listed = [...row.matchAll(/<span class="enter-id">([^<]+)<\/span> <span class="enter-title">([^<]*)<\/span>/g)];
    assert.deepEqual(
      listed.map(([, id, title]) => [id, decodeEntities(title)]),
      ids.map((id) => [id, titles.get(id)]),
      `row ${index + 1} titles`,
    );
  }
  assert.match(
    plain(home),
    /LNX-01 or WIN-01 according to the actual host; AD-01 when domain context is assigned or observed\./,
  );
});

test("the home page offers a quick jump and full-text search in the first section", async () => {
  await buildSite();
  const home = await text("site/.vitepress/dist/index.html");
  const jump = home.indexOf('<form class="home-jump"');
  assert.ok(jump > 0 && jump < home.indexOf('id="where-to-enter"'), "jump box precedes Where to enter");
  assert.match(home, /<button class="home-jump-search" type="button">\s*Full-text search <kbd>\/<\/kbd><\/button>/);
  assert.match(home, /<input id="home-jump-input"/);
});

// Ported from design/gemini (Slate & Signal), selectors adapted to this theme.

test("placeholders are marked without altering text or matching literals", async () => {
  await buildSite();
  const [net01, mail02, wupload02, uploadProof] = await Promise.all([
    text("site/.vitepress/dist/generated/tasks/net-01.html"),
    text("site/.vitepress/dist/generated/tasks/mail-02.html"),
    text("site/.vitepress/dist/generated/tasks/wupload-02.html"),
    text("site/.vitepress/dist/generated/references/make-lab-upload-proof.html"),
  ]);
  assert.match(net01, /class="blank">&lt;IP_ADDRESS&gt;<\/span>/);
  assert.doesNotMatch(mail02, /class="blank">&lt;0\.4096&gt;/);
  assert.doesNotMatch(wupload02, /class="blank">&lt;\?php/);
  // The Fill in strip is exposed to assistive technology, and Python source
  // (the local helper reference) never gets blank marks.
  assert.match(net01, /<p class="cmd-fill"><span class="cmd-fill-label">Fill in<\/span> <code class="blank">&lt;IP_ADDRESS&gt;<\/code><\/p>/);
  assert.doesNotMatch(net01, /cmd-fill[^>]*aria-hidden/);
  assert.doesNotMatch(uploadProof, /class="blank"/);
});

test("task pages separate outcome rows, stop marks, inbound folds and the explanation band", async () => {
  await buildSite();
  const [net01, net05, ad03] = await Promise.all([
    text("site/.vitepress/dist/generated/tasks/net-01.html"),
    text("site/.vitepress/dist/generated/tasks/net-05.html"),
    text("site/.vitepress/dist/generated/tasks/ad-03.html"),
  ]);
  assert.match(net01, /<section class="task-notes" aria-labelledby="explanations-and-troubleshooting">/);
  assert.match(net05, /<p class="cue cue-enter">/);
  assert.match(net05, /<p class="cue cue-question">/);
  assert.match(net05, /<ul class="outcomes"[^>]*>/);
  assert.match(net05, /<span class="outcome-slug">http_reported<\/span>/);
  assert.match(net05, /<span class="stop"[^>]*>GAP-SERVICE<\/span>/);
  assert.match(net05, /<span class="stop"[^>]*>PAUSE-COVERAGE<\/span>/);
  assert.match(net05, /<details class="route-inbound-more">/);
  assert.match(ad03, /data-label="Revisit"/);
  // Plain task IDs in prose are marked as IDs, never as routes.
  assert.match(net05, /<span class="task-id"[^>]*>NET-03<\/span>/);
  assert.match(net05, /<span class="task-id"[^>]*>EXP-01<\/span>/);
});

test("every task page keeps module context expanded with no <details> wrapper", async () => {
  await buildSite();
  const failures = [];
  for (const module of checklist.modules) {
    if (!module.context) continue;
    for (const task of module.tasks) {
      const html = await text(`site/.vitepress/dist/generated/tasks/${task.id.toLowerCase()}.html`);
      const section = html.match(/<section class="ledger-module-context"[\s\S]*?<\/section>/);
      if (!section) failures.push(`${task.id}: missing module context`);
      else if (/<details\b/i.test(section[0])) failures.push(`${task.id}: module context uses <details>`);
      const main = html.slice(html.indexOf("<main"), html.lastIndexOf("</main>"));
      if (/<details\b/i.test(main)) failures.push(`${task.id}: <details> inside <main>`);
    }
  }
  assert.deepEqual(failures, []);
});

test("built pages load no remote assets, and body text stays 16px on mobile", async () => {
  await buildSite();
  const distRoot = path.join(siteRoot, ".vitepress/dist");
  for (const htmlFile of await filesBelow(distRoot, ".html")) {
    const html = await readFile(htmlFile, "utf8");
    assert.doesNotMatch(
      html,
      /(?:src|href)="https?:\/\/[^"]*\.(?:css|js|mjs|woff2?|ttf|otf|png|jpe?g|gif|svg|webp)(?:[?#][^"]*)?"/i,
      `remote asset in ${path.relative(distRoot, htmlFile)}`,
    );
  }
  // Prose rules (.vp-doc, its paragraphs and list items) never set a size
  // below 16px. The module context band is the one deliberate 14px block.
  for (const file of await themeStylesheets()) {
    const css = (await readFile(file, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selectors = selector.split(",").map((part) => part.trim());
      if (!selectors.some((part) => /^\.vp-doc(?: (?:p|li))?$/.test(part))) continue;
      const size = body.match(/font-size:\s*(\d+(?:\.\d+)?)px/);
      if (size) assert.ok(Number(size[1]) >= 16, `${path.basename(file)}: ${selector.trim()} sets ${size[1]}px`);
    }
  }
});

async function themeStylesheets() {
  const themeDir = path.join(siteRoot, ".vitepress/theme");
  return (await readdir(themeDir)).filter((name) => name.endsWith(".css")).map((name) => path.join(themeDir, name));
}

test("every theme stylesheet avoids CSS hiding techniques", async () => {
  const files = await themeStylesheets();
  assert.ok(files.length >= 1);
  const forbidden = [
    /\bdisplay\s*:\s*none\b/i,
    /\bvisibility\s*:\s*hidden\b/i,
    /\bclip\s*:/i,
    /\bclip-path\s*:/i,
    /\boverflow(?:-[xy])?\s*:\s*(?:hidden|clip)\b/i,
    /-9999px/i,
    /content-visibility/i,
    /(?:^|[\s;{])(?:max-)?height:\s*0(?:px)?\s*[;}]/m,
  ];
  for (const file of files) {
    const css = (await readFile(file, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const pattern of forbidden) assert.doesNotMatch(css, pattern, `${path.basename(file)}: ${pattern}`);
  }
});

test("the Question cue stays neutral and theme code imports no generated data", async () => {
  for (const file of await themeStylesheets()) {
    const css = await readFile(file, "utf8");
    for (const [rule] of css.matchAll(/[^{}]*p\.cue-question[^{}]*\{[^}]*\}/g)) {
      assert.doesNotMatch(rule, /--vp-c-brand|--rb-route|--route/, `${path.basename(file)}: Question cue uses route colour`);
    }
  }
  const themeDir = path.join(siteRoot, ".vitepress/theme");
  const sources = [
    ...(await readdir(themeDir)).filter((name) => /\.(?:js|mjs|vue)$/.test(name)).map((name) => path.join(themeDir, name)),
    ...(await readdir(path.join(themeDir, "components"))).map((name) => path.join(themeDir, "components", name)),
  ];
  for (const file of sources) {
    assert.doesNotMatch(await readFile(file, "utf8"), /generated\/(?:catalog|routes|sidebar)\.json/, path.basename(file));
  }
});

test("module pages and the box route page have no source-order pager", async () => {
  await buildSite();
  const [http, start] = await Promise.all([
    text("site/.vitepress/dist/generated/modules/http.html"),
    text("site/.vitepress/dist/generated/start.html"),
  ]);
  assert.doesNotMatch(http, /pager-link/);
  assert.doesNotMatch(start, /pager-link/);
});

function hexRgb(value) {
  const hex = value.replace("#", "");
  return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function luminance([red, green, blue]) {
  const channel = (value) => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function contrast(first, second) {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

function blend(foreground, alpha, background) {
  return foreground.map((value, index) => Math.round(value * alpha + background[index] * (1 - alpha)));
}

function tokenBlock(css, selector) {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf("\n}", start));
  const tokens = new Map();
  for (const [, name, value] of body.matchAll(/--(rb-[a-z0-9-]+):\s*([^;]+);/g)) tokens.set(name, value.trim());
  return tokens;
}

function rgbaParts(value) {
  const [r, g, b, a] = value.match(/[\d.]+/g).map(Number);
  return { rgb: [r, g, b], alpha: a };
}

test("every token text pair meets WCAG AA in both themes", async () => {
  const css = await text("site/.vitepress/theme/tokens.css");
  const light = tokenBlock(css, ":root");
  const dark = new Map([...light, ...tokenBlock(css, ".dark")]);
  const failures = [];
  for (const [mode, tokens] of [["light", light], ["dark", dark]]) {
    const colour = (name) => hexRgb(tokens.get(name));
    const check = (label, foreground, background) => {
      const ratio = contrast(foreground, background);
      if (ratio < 4.5) failures.push(`${mode} ${label}: ${ratio.toFixed(2)}`);
    };
    for (const ink of ["rb-ink", "rb-ink-2", "rb-ink-3"]) {
      for (const surface of ["rb-paper", "rb-desk", "rb-panel"]) check(`${ink} on ${surface}`, colour(ink), colour(surface));
    }
    const soft = rgbaParts(tokens.get("rb-route-soft"));
    const wash = rgbaParts(tokens.get("rb-route-wash"));
    for (const surface of ["rb-paper", "rb-desk"]) {
      check(`route on ${surface}`, colour("rb-route"), colour(surface));
      check(`route chip on ${surface}`, colour("rb-route"), blend(soft.rgb, soft.alpha, colour(surface)));
      check(`route on Next wash over ${surface}`, colour("rb-route"), blend(wash.rgb, wash.alpha, colour(surface)));
    }
    check("blank text on blank fill", colour("rb-blank-fg"), colour("rb-blank-bg"));
    check("stop slab", colour("rb-stop-fg"), colour("rb-stop-bg"));
    for (const surface of ["rb-plate", "rb-plate-head"]) {
      check(`plate ink on ${surface}`, colour("rb-plate-ink"), colour(surface));
      check(`plate ink-2 on ${surface}`, colour("rb-plate-ink-2"), colour(surface));
      const plateBlank = rgbaParts(tokens.get("rb-plate-blank-bg"));
      check(`plate blank on ${surface}`, colour("rb-plate-blank-fg"), blend(plateBlank.rgb, plateBlank.alpha, colour(surface)));
    }
  }
  assert.deepEqual(failures, []);
});

test("every syntax colour in built command plates meets WCAG AA on both plate backgrounds", async () => {
  await buildSite();
  const css = await text("site/.vitepress/theme/tokens.css");
  const plates = [
    ["light plate", tokenBlock(css, ":root").get("rb-plate")],
    ["dark plate", tokenBlock(css, ".dark").get("rb-plate")],
  ];
  assert.deepEqual(plates.map(([, value]) => value), ["#161b22", "#0c1016"]);
  const colours = new Set();
  for (const htmlFile of await filesBelow(path.join(siteRoot, ".vitepress/dist"), ".html")) {
    const html = await readFile(htmlFile, "utf8");
    for (const [, value] of html.matchAll(/--shiki-(?:light|dark):(#[0-9a-fA-F]{6})\b/g)) colours.add(value.toLowerCase());
  }
  assert.ok(colours.size >= 4, `expected several syntax colours, found ${colours.size}`);
  const failures = [];
  for (const colour of colours) {
    for (const [label, plate] of plates) {
      const ratio = contrast(hexRgb(colour), hexRgb(plate));
      if (ratio < 4.5) failures.push(`${colour} on ${label}: ${ratio.toFixed(2)}`);
    }
  }
  assert.deepEqual(failures, []);
  assert.ok(!colours.has("#768390"), "the sub-AA comment colour is replaced");
});

test("module pages open with a header strip that names linked tasks by exact title", async () => {
  await buildSite();
  const net05 = checklist.tasks.find(({ id }) => id === "NET-05");
  for (const module of checklist.modules) {
    const html = await text(`site/.vitepress/dist/generated/modules/${module.id}.html`);
    const strip = html.match(/<div class="task-header module-header">([\s\S]*?)<\/nav><\/div>/)?.[1];
    assert.ok(strip, `${module.id} has a header strip`);
    assert.ok(html.indexOf('<div class="task-header module-header">') < html.indexOf("<main"), module.id);
    assert.match(strip, new RegExp(`${module.tasks.length} tasks?</span>`), `${module.id} task count`);
    assert.match(strip, /href="\/checklist\/generated\/start\.html">Box route<\/a>/);
    assert.ok(strip.includes(`>NET-05: ${escapeVuePlaceholders(net05.title).replaceAll("'", "&#39;")}</a>`), `${module.id} NET-05 title`);
  }
});

test("outcome lists are recognised by a slug on every item, shared by generator and renderer", () => {
  assert.ok(isOutcomeList(["http_reported: Nmap reported HTTP.", "ftp_reported: Nmap reported FTP."]));
  assert.ok(!isOutcomeList(["http_reported: only one item"]));
  assert.ok(!isOutcomeList(["http_reported: slugged", "Plain bullet without a slug"]));
  assert.ok(!isOutcomeList(["reply: a single word is not a slug", "no_reply: two words"]));
});
