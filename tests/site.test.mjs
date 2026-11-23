import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test, { before } from "node:test";
import { promisify } from "node:util";

import { escapeVuePlaceholders, generateSite, parseChecklist } from "../scripts/checklist.mjs";

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
