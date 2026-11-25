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
import { BLANK } from "../site/.vitepress/markdown.mjs";
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
  let relative = decodeURIComponent(pathname.slice("/GESS1025/".length));
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
let catalog;

function taskLink(id) {
  return `/generated/tasks/${id.toLowerCase()}`;
}

function fencedBlocks(markdown) {
  const blocks = [];
  let current = null;
  for (const line of markdown.split("\n")) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})([^\r]*)\r?$/);
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
  catalog = JSON.parse(await text("site/.vitepress/generated/catalog.json"));
});

test("the home page is the module directory; the old directory URL forwards to it", async () => {
  const [home, moved, source, directory] = await Promise.all([
    text("site/index.md"),
    text("site/checklist/index.md"),
    text("site/about/source.md"),
    text("site/.vitepress/generated/module-directory.md"),
  ]);

  assert.match(home, /^# Checklist modules$/m);
  assert.match(home, /^## Scan results$/m);
  assert.match(home, /^## Task List$/m);
  assert.match(home, /<TaskDirectory \/>/);
  assert.doesNotMatch(home, /Browse the published pages|For a Linux shell|Default box route/);
  assert.doesNotMatch(home, /field\/linux-privilege|\]\(\.\.\//);
  assert.match(home, /@include: \.\/\.vitepress\/generated\/port-index\.md/);
  assert.match(home, /@include: \.\/\.vitepress\/generated\/module-directory\.md/);
  assert.match(directory, /\| \[Linux\]\(/);
  assert.doesNotMatch(home, /generated\/modules\/linux\.md/);
  assert.match(directory, /\]\(\.\.\/\.\.\/generated\/modules\/network\.md\)/);
  // Bookmarks to /GESS1025/checklist/ land on the home page.
  assert.match(moved, /http-equiv: refresh\s+content: "0; url=\.\.\/"/);
  assert.match(moved, /\[home page\]\(\.\.\/\)/);
  assert.match(moved, /search: false/);
  assert.doesNotMatch(moved, /<TaskDirectory/);
  assert.match(source, /4f643efe7db1efdbd58af5a24e7cf46764b97945528b567afbe38940d6742697/);
  assert.match(source, /Published pages \| 215/);
});

test("publishes one 20-page Linux privilege operator module", async () => {
  const [config, css, toggle, theme] = await Promise.all([
    text("site/.vitepress/config.mjs"),
    text("site/.vitepress/theme/custom.css"),
    text("site/.vitepress/theme/components/SidebarToggle.vue"),
    text("site/.vitepress/theme/index.js"),
  ]);

  assert.doesNotMatch(config, /field\/linux-privilege|Privilege escalation checklist/);
  assert.match(config, /nav: \[\]/);
  assert.doesNotMatch(config, /Field checklists|Detailed reference · 28 modules/);
  for (const label of ["Linux checklist", "Detailed reference", "Box route", "Source"]) {
    assert.doesNotMatch(config, new RegExp(`text: "${label}"`));
  }
  assert.match(theme, /nav-bar-content-before.*SidebarToggle/);
  assert.match(toggle, /aria-controls="VPSidebarNav"/);
  assert.match(toggle, /aria-expanded="String\(!collapsed\)"/);
  assert.match(toggle, /toggleAttribute\("inert", collapsed\.value\)/);
  assert.match(css, /html\.sidebar-collapsed \.Layout \.VPSidebar/);

  const sidebar = JSON.parse(await text("site/.vitepress/generated/sidebar.json"));
  const linux = sidebar.find(({ text: label }) => label === "Privilege")?.items.find(({ text: label }) => label === "Linux");
  assert.ok(linux);
  assert.equal(linux.items.length, 20);
  assert.deepEqual(
    linux.items.map(({ link }) => link),
    Array.from({ length: 20 }, (_, index) =>
      `/generated/tasks/lpriv-${String(index + 1).padStart(2, "0")}`,
    ),
  );
  assert.ok(sidebar.some(({ text: label }) => label === "Privilege"));

  for (let index = 1; index <= 20; index += 1) {
    const id = `LPRIV-${String(index).padStart(2, "0")}`;
    const source = await text(`content/linux-privilege/${id.toLowerCase()}.md`);
    const prose = proseOutsideCode(source);
    assert.match(source, /^# LPRIV-\d{2}\. /);
    assert.match(source, /^\*\*Run this when:\*\*/m);
    assert.match(source, /^\*\*Look for:\*\*/m);
    assert.match(source, /^\*\*If found:\*\*/m);
    assert.ok(source.indexOf("```bash") < 500, `${id} first command is above the fold`);
    assert.ok(fencedBlocks(source).length <= 4, `${id} command-group budget`);
    assert.ok(prose.split(/\s+/).filter(Boolean).length <= 600, `${id} prose budget`);
  }
});

test("renders every Linux operator command with copy controls and inline routes", async () => {
  await buildSite();
  for (let index = 1; index <= 20; index += 1) {
    const slug = `lpriv-${String(index).padStart(2, "0")}`;
    const [operatorSource, operatorHtml] = await Promise.all([
      text(`content/linux-privilege/${slug}.md`),
      text(`site/.vitepress/dist/generated/tasks/${slug}.html`),
    ]);
    assert.equal([...operatorHtml.matchAll(/class="cmd-copy"/g)].length, fencedBlocks(operatorSource).length, slug);
    assert.match(operatorHtml, /class="Layout task-page field-page operator-page"/);
    assert.match(operatorHtml, /class="sb-module">Linux/);
    assert.doesNotMatch(operatorHtml, /class="(?:route-panel|task-rail|task-jumps)"/);
    assert.doesNotMatch(operatorHtml, /field\/linux-privilege|id="explanations-and-troubleshooting"/);
  }
  const lpriv01 = await text("site/.vitepress/dist/generated/tasks/lpriv-01.html");
  
  assert.doesNotMatch(lpriv01, /Field checklists|Detailed reference · 28 modules|sb-reference-label/);
});

test("the operator corpus retains the field pass and every retired Linux privilege case", async () => {
  const corpus = (
    await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        text(`content/linux-privilege/lpriv-${String(index + 1).padStart(2, "0")}.md`),
      ),
    )
  ).join("\n");

  for (const pattern of [
    /getent group sudo wheel docker lxd disk adm shadow/,
    /find \/home \/opt \/var\/www \/srv -xdev -name '<NAME>'/,
    /:set shell=\/bin\/bash/,
    /find \/usr\/bin \/usr\/sbin \/usr\/local\/bin \/usr\/local\/sbin \/opt -xdev -type f/,
    /SYSTEMD_PAGER=cat systemctl list-timers --all --no-pager/,
    /DominicBreuker\/pspy\/releases\/download\/v1\.2\.1\/pspy64/,
    /find \/etc \/opt \/usr\/local \/var\/www \/srv -xdev -type f -writable/,
    /ss -lntup 2>\/dev\/null \|\| netstat -lntup 2>\/dev\/null/,
    /configuration\.php/,
    /~\/\.ssh\/known_hosts/,
    /cat \/etc\/exports/,
    /docker ps/,
    /getfacl -p -- '<ABSOLUTE_OBSERVED_PATH>'/,
    /dpkg-query -S '<ABSOLUTE_EXECUTABLE>'/,
    /command -v gcc cc make python python3 perl/,
  ]) {
    assert.match(corpus, pattern);
  }

  const retiredCases = new Map([
    ["delegated run-as shell", /Direct GNU Bash/],
    ["SUID and SETUID capability", /SUID GDB and SUID PHP/],
    ["writable scheduled script", /writable script consumed by a higher-privileged job/],
    ["capability lead", /cap_dac_read_search/],
    ["writable service path", /service-consumer case/],
    ["delegated executable escape", /GNU find, Python 3, GNU time, GNU nice, or Perl/],
    ["temporary foreground Bash", /temporary foreground-shell case/],
    ["delegated SQL client", /MySQL or MariaDB client/],
    ["SUID encoder read", /GNU `base32`/],
    ["delegated Git read", /Delegated Git/],
    ["missing delegated script", /missing delegated script/],
    ["delegated service wrapper", /delegated wrapper case/],
    ["SUID PATH resolution", /retired SUID PATH case/],
    ["reversible account append", /reversible `\/etc\/passwd` change/],
    ["GNU tar wildcard", /GNU tar wildcard execution/],
  ]);
  for (const [label, pattern] of retiredCases) assert.match(corpus, pattern, label);
});

test("generates every public page, module, and LNX compatibility URL", async () => {
  const [taskFiles, moduleFiles, net01, net05, lpriv01, lnx01] = await Promise.all([
    readdir(path.join(siteRoot, "generated/tasks")),
    readdir(path.join(siteRoot, "generated/modules")),
    text("site/generated/tasks/net-01.md"),
    text("site/generated/tasks/net-05.md"),
    text("site/generated/tasks/lpriv-01.md"),
    text("site/generated/tasks/lnx-01.md"),
  ]);

  assert.equal(taskFiles.length, 225);
  assert.equal(moduleFiles.length, 47);
  assert.match(net01, /^# NET-01\. Check connectivity/m);
  assert.match(net01, /## Explanations and troubleshooting/);
  assert.match(net05, /Next: \[WEB-01\]\(\.\/web-01\)/);
  assert.match(lpriv01, /^# LPRIV-01\. Establish context and immediate privileges/m);
  assert.match(lnx01, /^search: false$/m);
  assert.match(lnx01, /^redirectTarget: "\.\/lpriv-01\.html"$/m);
});

test("preserves module and task order in the sidebar", async () => {
  const sidebar = JSON.parse(
    await text("site/.vitepress/generated/sidebar.json"),
  );

  assert.equal(sidebar.length, 8);
  assert.equal(sidebar[0].text, "Enumeration");
  const network = sidebar[0].items.find(({ text: label }) => label === "Network");
  assert.ok(network);
  assert.deepEqual(
    network.items.slice(0, 3).map(({ text: label, link }) => ({ label, link })),
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
  const privilege = sidebar.at(-3);
  assert.equal(privilege.text, "Privilege");
  assert.deepEqual(
    privilege.items.map(({ text: label }) => label),
    ["Linux", "Windows"],
  );
  assert.equal(privilege.items[0].items.length, 20);
  const domain = sidebar.at(-2);
  assert.equal(domain.text, "Domain");
  assert.deepEqual(
    domain.items.map(({ text: label }) => label),
    ["AD", "Password attacks", "ADCS", "AD abuse"],
  );
  const movement = sidebar.at(-1);
  assert.equal(movement.text, "Movement");
  assert.deepEqual(
    movement.items.map(({ text: label }) => label),
    ["Pivoting"],
  );
});

test("orders sections by box phase, with every service lane ahead of the session", async () => {
  const sidebar = JSON.parse(
    await text("site/.vitepress/generated/sidebar.json"),
  );

  assert.deepEqual(
    sidebar.map(({ text: label }) => label),
    [
      "Enumeration",
      "Services",
      "Web",
      "Session",
      "Host",
      "Privilege",
      "Domain",
      "Movement",
    ],
  );

  const order = sidebar.flatMap((section) => section.items.map(({ text: label }) => label));
  const position = (label) => order.indexOf(label);
  // A shared step sits in its own phase, never beside a service that reaches it.
  assert.ok(position("Network") < position("FTP"));
  assert.ok(position("Payloads") < position("Exploit check"));
  assert.ok(position("Exploit check") < position("Shell"));
  assert.ok(position("Local artifact") < position("Pivoting"));
  // A service keeps its read and write tasks in the same section.
  assert.equal(
    sidebar.findIndex(({ items }) => items.some(({ text }) => text === "FTP")),
    sidebar.findIndex(({ items }) => items.some(({ text }) => text === "SMB")),
  );
  // SSH knock is the SSH module's third task, not a module of its own.
  const ssh = sidebar.flatMap(({ items }) => items).find(({ text }) => text === "SSH");
  assert.deepEqual(
    ssh.items.map(({ link }) => link.split("/").at(-1)),
    ["ssh-01", "ssh-02", "ssh-03"],
  );
});

test("generates the home directory from the sidebar phase list", async () => {
  const [directory, sidebar] = await Promise.all([
    text("site/.vitepress/generated/module-directory.md"),
    text("site/.vitepress/generated/sidebar.json").then(JSON.parse),
  ]);

  const headings = [...directory.matchAll(/^### (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(headings, sidebar.map(({ text: label }) => label));

  const names = [...directory.matchAll(/^\| \[([^\]]+)\]\(\.\.\/\.\.\/generated\/modules\//gm)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    names,
    sidebar.flatMap((section) => section.items.map(({ text: label }) => label)),
  );
  assert.match(await text("site/index.md"), /@include: \.\/\.vitepress\/generated\/module-directory\.md/);
});

test("names modules with an explicit acronym-correct display map", async () => {
  const [sidebar, index] = await Promise.all([
    text("site/.vitepress/generated/sidebar.json").then(JSON.parse),
    text("site/.vitepress/generated/module-directory.md"),
  ]);
  const indexNames = [...index.matchAll(/^\| \[([^\]]+)\]\(\.\.\/\.\.\/generated\/modules\//gm)].map(
    (match) => match[1],
  );

  assert.equal(indexNames.length, 47);
  const sidebarNames = sidebar.flatMap((section) => section.items.map(({ text: label }) => label));
  assert.deepEqual(sidebarNames.sort(), [...indexNames].sort());
  for (const name of ["HTTP", "AD", "Linux", "Windows", "DNS", "NFS", "SNMP", "MSSQL", "Oracle", "PostgreSQL", "MySQL", "FTP", "SMB", "SSH", "Shell", "Transfer", "SQL continuation", "Mail", "RDP", "Docker", "Jenkins", "Generic service"]) {
    assert.ok(indexNames.includes(name), name);
  }
  const httpModule = await text("site/generated/modules/http.md");
  assert.match(httpModule, /^title: "HTTP"$/m);
  assert.match(httpModule, /^# HTTP$/m);
  assert.ok(indexNames.includes("Linux"));
  assert.ok(indexNames.includes("Windows"));
});

test("emits a complete public catalog with source provenance", async () => {
  const generatedCatalog = JSON.parse(await text("site/.vitepress/generated/catalog.json"));
  const sidebar = JSON.parse(await text("site/.vitepress/generated/sidebar.json"));

  assert.equal(generatedCatalog.edition, manifest.edition);
  assert.equal(generatedCatalog.sourceDigest, manifest.sourceDigest);
  assert.equal(generatedCatalog.snapshotSha256, manifest.snapshotSha256);
  assert.equal(generatedCatalog.moduleCount, 47);
  assert.equal(generatedCatalog.taskCount, 215);
  assert.equal(generatedCatalog.sourceModuleCount, 48);
  assert.equal(generatedCatalog.sourceTaskCount, 220);
  assert.equal(sidebar.flatMap((section) => section.items).length, generatedCatalog.modules.length);
  assert.equal(new Set(generatedCatalog.tasks.map(({ id }) => id)).size, 215);
  assert.ok(!generatedCatalog.tasks.some(({ id }) => id.startsWith("LNX-")));
  assert.deepEqual(
    generatedCatalog.tasks.filter(({ id }) => id.startsWith("LPRIV-")).map(({ id }) => id),
    Array.from({ length: 20 }, (_, index) => `LPRIV-${String(index + 1).padStart(2, "0")}`),
  );
  assert.equal(generatedCatalog.modules.at(-1).title, "Pivoting");
  // The catalog, the sidebar and the home directory carry one phase order.
  assert.deepEqual(
    generatedCatalog.modules.map(({ title }) => title),
    sidebar.flatMap((section) => section.items.map(({ text }) => text)),
  );
});

test("emits route data keyed by task with outbound, terminal, and inbound tracings", async () => {
  const [routes, catalog] = await Promise.all([
    text("site/.vitepress/generated/routes.json").then(JSON.parse),
    text("site/.vitepress/generated/catalog.json").then(JSON.parse),
  ]);
  const taskIds = catalog.tasks.map(({ id }) => id);
  const terminalStates = new Set(manifest.terminalStates);
  const moduleById = new Map(catalog.modules.map((module) => [module.id, module]));

  assert.deepEqual(Object.keys(routes).sort(), [...taskIds].sort());
  const expectedInbound = new Map(taskIds.map((id) => [id, []]));
  for (const task of catalog.tasks) {
    const route = routes[task.id];
    const module = moduleById.get(task.moduleId);
    assert.equal(route.id, task.id);
    assert.equal(route.title, task.title);
    assert.equal(route.link, taskLink(task.id));
    assert.deepEqual(route.module, { id: module.id, title: module.title, link: module.link });
    for (const destination of route.outbound) {
      assert.deepEqual(destination, {
        id: destination.id,
        title: routes[destination.id].title,
        link: taskLink(destination.id),
      });
      expectedInbound.get(destination.id).push(task.id);
    }
    assert.ok(route.terminalStates.every((state) => terminalStates.has(state)));
    const sourceTask = checklist.tasks.find(({ id }) => id === task.id && !id.startsWith("LPRIV-"));
    if (sourceTask) {
      for (const match of proseOutsideCode(`${sourceTask.working}\n${sourceTask.explanation}`).matchAll(
        /\bNext: ((?:PAUSE|GAP)-[A-Z]+(?:-[A-Z]+)*)/g,
      )) {
        assert.ok(route.terminalStates.includes(match[1]), `${task.id} ${match[1]}`);
      }
    }
  }
  for (const id of taskIds) {
    assert.deepEqual(routes[id].inbound.map(({ id: source }) => source), expectedInbound.get(id));
  }

  assert.ok(routes["NET-01"].outbound.some(({ id }) => id === "NET-02"));
  assert.ok(routes["NET-01"].terminalStates.includes("PAUSE-ROUTE"));
  assert.ok(routes["NET-05"].outbound.some(({ id }) => id === "WEB-01"));
  assert.ok(routes["WEB-01"].outbound.some(({ id }) => id === "WEB-08"));
  assert.equal(routes["LNX-09"], undefined);
  assert.ok(routes["LPRIV-01"].outbound.some(({ id }) => id === "LPRIV-03"));
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

  for (const task of checklist.tasks.filter(({ moduleId }) => !["linux", "linux_privilege"].includes(moduleId))) {
    const source = proseOutsideCode(`${task.working}\n${task.explanation}`);
    const generated = proseOutsideCode(
      await text(`site/generated/tasks/${task.id.toLowerCase()}.md`),
    );
    for (const match of source.matchAll(/\bNext: ([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)/g)) {
      if (terminalStates.has(match[1])) nextTerminals += 1;
      else nextTasks += 1;
    }
    boldSingles += [...source.matchAll(/\*\*(?:\[)?[A-Z][A-Z0-9]*-\d{2}/g)].length;
    generatedNextTasks += [...generated.matchAll(/\bNext: \[[A-Z][A-Z0-9]*-\d{2}\]\(\.\/[a-z0-9-]+\)/g)].length;
    generatedNextTerminals += [...generated.matchAll(/\bNext: (?:PAUSE|GAP)-[A-Z-]+/g)].length;
    generatedBoldSingles += [...generated.matchAll(/\*\*\[[A-Z][A-Z0-9]*-\d{2}\]\(/g)].length;
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
  assert.match(web01, /\*\*\[WEB-06\]\(\.\/web-06\)\*\*/);
  assert.match(web01, /\*\*\[WEB-08\]\(\.\/web-08\)\*\*/);
  assert.match(lnx09, /^redirectTarget: "\.\/lpriv-14\.html"$/m);
  assert.match(rexp04, /\*\*\[SHELL-01\]\(\.\/shell-01\)\/\[EXP-03\]\(\.\/exp-03\)\*\*/);
});

test("task pages carry station frontmatter and verbatim module context", async () => {
  const catalog = JSON.parse(await text("site/.vitepress/generated/catalog.json"));
  const titles = new Map(catalog.modules.map(({ id, title }) => [id, title]));
  let contextual = 0;

  for (const module of checklist.modules.filter(({ id }) => !["linux", "linux_privilege"].includes(id))) {
    for (const task of module.tasks) {
      const page = await text(`site/generated/tasks/${task.id.toLowerCase()}.md`);
      const head = frontmatterOf(page);
      assert.match(head, new RegExp(`^taskId: "${task.id}"$`, "m"));
      if (task.id === "VNC-01") assert.match(head, /^optional: true$/m);
      if (task.id === "NET-01") assert.doesNotMatch(head, /^optional:/m);
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
    checklist.modules
      .filter(({ id, context }) => context && !["linux", "linux_privilege"].includes(id))
      .reduce((sum, { tasks }) => sum + tasks.length, 0),
  );
  assert.ok(contextual > 0);
  for (let index = 1; index <= 20; index += 1) {
    const id = `LPRIV-${String(index).padStart(2, "0")}`;
    const page = await text(`site/generated/tasks/${id.toLowerCase()}.md`);
    const head = frontmatterOf(page);
    assert.match(head, new RegExp(`^taskId: "${id}"$`, "m"));
    assert.match(head, /^moduleTitle: "Linux"$/m);
    assert.match(head, /^operatorPage: true$/m);
  }
});

test("preserves every fenced command block byte for byte", async () => {
  let blocks = 0;
  for (const task of checklist.tasks.filter(({ moduleId }) => !["linux", "linux_privilege"].includes(moduleId))) {
    const page = await text(`site/generated/tasks/${task.id.toLowerCase()}.md`);
    for (const block of fencedBlocks(`${task.working}\n${task.explanation}`)) {
      blocks += 1;
      assert.ok(page.includes(block), `${task.id} changed a fenced block`);
    }
  }
  assert.ok(blocks > 0);
  for (let index = 1; index <= 20; index += 1) {
    const slug = `lpriv-${String(index).padStart(2, "0")}`;
    const [source, page] = await Promise.all([
      text(`content/linux-privilege/${slug}.md`),
      text(`site/generated/tasks/${slug}.md`),
    ]);
    for (const block of fencedBlocks(source.replaceAll("\r\n", "\n"))) {
      assert.ok(page.includes(block), `${slug} changed a fenced block`);
    }
  }

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

  assert.match(config, /base:\s*["']\/GESS1025\/["']/);
  assert.match(config, /https:\/\/github\.com\/Joelwang22\/GESS1025/);
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
  assert.match(home, /\/GESS1025\/assets\//);
  assert.match(net01, /\/GESS1025\/generated\/tasks\/net-02/);
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
    const base = new URL(`https://example.test/GESS1025/${pageRelative}`);
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const value = match[1];
      if (/^(?:https?:|mailto:|data:|#)/.test(value)) continue;
      const resolved = new URL(value, base);
      if (!resolved.pathname.startsWith("/GESS1025/")) {
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
  for (const match of searchSource.matchAll(/\/GESS1025\/[^"'\\]+/g)) {
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

  const [dns, dns01] = await Promise.all([
    text("site/.vitepress/dist/generated/modules/dns.html"),
    text("site/.vitepress/dist/generated/tasks/dns-01.html"),
  ]);
  assert.match(dns, /<code>&lt;\.\.\.&gt;<\/code>/);
  assert.match(dns01, /<code>&lt;\.\.\.&gt;<\/code>/);
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
  assert.match(readme, /\/GESS1025\/about\/source\.html/);
  assert.match(readme, /https:\/\/joelwang22\.github\.io\/GESS1025\//);
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

async function publishedTaskMarkdown(task) {
  if (task.id.startsWith("LPRIV-")) {
    return (await text(`content/linux-privilege/${task.id.toLowerCase()}.md`)).replaceAll("\r\n", "\n");
  }
  const sourceTask = checklist.tasks.find(({ id }) => id === task.id);
  const module = checklist.modules.find(({ id }) => id === sourceTask.moduleId);
  return [module.context, sourceTask.working, sourceTask.explanation].join("\n");
}

test("built task pages keep every source word and every command line visible in <main>", async () => {
  await buildSite();
  const failures = [];
  let commandLines = 0;
  for (const task of catalog.tasks) {
      const label = task.id;
      const html = await text(`site/.vitepress/dist/generated/tasks/${task.id.toLowerCase()}.html`);
      const markdown = await publishedTaskMarkdown(task);
      const main = builtMainText(html, label);
      const source = decodeEntities(
        markdown
          .replace(/\]\([^)\s]*\s+"[^"]*"\)/g, "]")
          .replace(/\]\([^)\s]*\)/g, "]")
          // Ordered-list numbers render as <ol> markers, not text.
          .replace(/^[ \t>]*\d+[.)][ \t]/gm, ""),
      );
      const built = tokenCounts(main);
      for (const [token, count] of tokenCounts(source)) {
        const have = built.get(token) ?? 0;
        if (have < count) failures.push(`${label}: "${token}" ${have}/${count}`);
      }
      for (const block of fencedBlocks(markdown)) {
        for (const line of block.split("\n").slice(1, -1)) {
          if (!line.trim()) continue;
          commandLines += 1;
          if (!main.includes(line.trimEnd())) {
            failures.push(`${label}: command line missing: ${line.slice(0, 80)}`);
          }
        }
      }
  }
  assert.ok(commandLines > 180, `expected a broad command audit, checked ${commandLines}`);
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
  return {
    html,
    expected: fenceBodies(await publishedTaskMarkdown(task)),
    built: builtPlates(html),
  };
}

test("every command plate renders and copies its source block text exactly", async () => {
  await buildSite();
  const failures = [];
  let blocks = 0;
  for (const task of catalog.tasks) {
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
      if (/cmd-fill|>Fill in</.test(built[index].head)) {
        failures.push(`${task.id}: block ${index + 1} still has a placeholder summary`);
      }
    }
    if (/class="copy"/.test(html)) failures.push(`${task.id}: hover-only copy button remains`);
    if ((html.match(/class="cmd-copy"/g) ?? []).length !== expected.length) {
      failures.push(`${task.id}: copy controls do not match plates`);
    }
  }
  assert.ok(blocks > 180, `expected a broad plate audit, checked ${blocks}`);
  assert.deepEqual(failures, []);
});

test("the copy handler joins rendered line text without trimming or prompt stripping", () => {
  const line = (value) => ({ classList: { contains: (name) => name === "line" }, textContent: value });
  const other = { classList: { contains: () => false }, textContent: "ignored" };
  const code = { children: [line("$ echo '<IP_ADDRESS>'  "), other, line(""), line("  > tail")] };
  assert.equal(codeText(code), "$ echo '<IP_ADDRESS>'  \n\n  > tail");
});

test("command blanks are highlighted in place without a header summary", async () => {
  await buildSite();
  const failures = [];
  let marked = 0;
  for (const task of catalog.tasks) {
    const { expected, built } = await taskPlates(task);
    for (const [index, block] of expected.entries()) {
      const count = [...block.body.matchAll(BLANK)].length;
      const found = (built[index].code.match(/class="blank"/g) ?? []).length;
      if (found !== count) failures.push(`${task.id} block ${index + 1}: ${found}/${count} blanks marked`);
      if (/cmd-fill|>Fill in</.test(built[index].head)) failures.push(`${task.id} block ${index + 1}: summary remains`);
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
  assert.match(web01, /<a href="\.\/web-08\.html"[^>]*class="route"[^>]*>WEB-08<\/a>/);
  // The title is the verbatim source heading; the compact module location and
  // the task's place in its module sit above it, outside <main>.
  assert.match(net01, /<h1 id="net-01-check-connectivity" tabindex="-1">NET-01\. Check connectivity <a class="header-anchor"/);
  const header = net01.indexOf('<div class="task-header">');
  assert.ok(header >= 0 && header < net01.indexOf("<main"), "header row precedes <main>");
  assert.match(net01, /<a href="\/GESS1025\/generated\/modules\/network\.html">Network<\/a>/);
  assert.match(net01, /<span class="task-position">Task 1 of 5<\/span>/);
  assert.doesNotMatch(net01, /class="(?:task-stamp|task-jumps|task-rail|route-panel)"/);
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

test("task pages keep route metadata without duplicating routes outside the procedure", async () => {
  await buildSite();
  const routes = JSON.parse(await text("site/.vitepress/generated/routes.json"));
  const brief = ({ id, title }) => ({ id, title, module: routes[id].module.title });
  for (const [index, task] of catalog.tasks.entries()) {
    const head = frontmatterOf(await text(`site/generated/tasks/${task.id.toLowerCase()}.md`));
    const field = (name) => JSON.parse(head.match(new RegExp(`^${name}: (.*)$`, "m"))[1]);
    assert.deepEqual(field("routesOut"), routes[task.id].outbound.map(brief), task.id);
    assert.deepEqual(field("routesIn"), routes[task.id].inbound.map(brief), task.id);
    assert.deepEqual(field("routeStops"), routes[task.id].terminalStates, task.id);
    if (task.id.startsWith("LPRIV-")) {
      assert.equal(head.includes("position:"), false);
    } else {
      assert.deepEqual(field("position"), { index: index + 1, total: catalog.tasks.length });
    }
  }
  const net01 = await text("site/.vitepress/dist/generated/tasks/net-01.html");
  const main = net01.slice(net01.indexOf("<main"), net01.lastIndexOf("</main>"));
  assert.match(main, /href="\.\/net-02\.html"/);
  assert.match(main, /<span class="stop"[^>]*>PAUSE-ROUTE<\/span>/);
  assert.doesNotMatch(net01, /class="(?:route-panel|task-rail|task-jumps)"/);
  assert.match(net01, />Next</);
  const [lpriv01, lpriv20] = await Promise.all([
    text("site/.vitepress/dist/generated/tasks/lpriv-01.html"),
    text("site/.vitepress/dist/generated/tasks/lpriv-20.html"),
  ]);
  assert.doesNotMatch(lpriv01, /pager-link prev-page/);
  assert.match(lpriv01, /href="\/GESS1025\/generated\/tasks\/lpriv-02\.html"/);
  assert.match(lpriv20, /href="\/GESS1025\/generated\/tasks\/lpriv-19\.html"/);
  assert.doesNotMatch(lpriv20, /pager-link next-page/);
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
  for (const id of ["NET-01", "NET-05", "SSH-02", "EXP-03", "AD-01"]) {
    assert.match(html, new RegExp(`href="\\./tasks/${id.toLowerCase()}\\.html" class="route"`), id);
  }
  assert.match(html, /href="\.\/tasks\/lnx-03\.html"/);
  assert.match(await text("site/generated/start.md"), /^title: "How to use this edition"$/m);
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

test("every task page removes short-page jump navigation and the document outline", async () => {
  await buildSite();
  for (const task of catalog.tasks) {
    const source = await text(`site/generated/tasks/${task.id.toLowerCase()}.md`);
    const html = await text(`site/.vitepress/dist/generated/tasks/${task.id.toLowerCase()}.html`);
    assert.match(frontmatterOf(source), /^outline: false$/m, task.id);
    assert.doesNotMatch(html, /class="(?:task-jumps|task-rail|route-panel)"/, task.id);
  }
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
  assert.ok(cues >= 30, `expected at least 30 source cues, found ${cues}`);
  const sourceOutcomes = checklist.tasks.reduce(
    (sum, task) =>
      sum +
      (proseOutsideCode(`${task.working}\n${task.explanation}`).match(/^- [a-z][a-z0-9]*(?:_[a-z0-9]+)+: /gm) ?? [])
        .length,
    0,
  );
  // Lists that mix slugged and plain bullets stay ordinary lists.
  assert.ok(outcomes >= 15 && outcomes <= sourceOutcomes, `outcome rows ${outcomes} of ${sourceOutcomes}`);
  const net05 = await text("site/.vitepress/dist/generated/tasks/net-05.html");
  assert.match(net05, /<li><span class="outcome-slug">http_reported<\/span>: Nmap reported an HTTP\/HTTPS label/);
});

test("command plates keep Copy visible and add Wrap only when a block needs it", async () => {
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
  const net01 = await text("site/.vitepress/dist/generated/tasks/net-01.html");
  assert.match(net01, /class="cmd-copy"/);
  assert.doesNotMatch(net01, /class="cmd-wrap"/);
});

test("the find box matches task IDs, title words, modules and scan ports", () => {
  const tasks = [
    { id: "SMB-01", title: "List shares for the current identity", module: "SMB" },
    { id: "LPRIV-02", title: "Does this reviewed SUID binary change identity?", module: "Linux" },
    { id: "AD-06", title: "Request one roastable Kerberos ticket", module: "AD" },
  ];
  assert.deepEqual(matchTasks(tasks, "smb").map(({ id }) => id), ["SMB-01"]);
  assert.deepEqual(matchTasks(tasks, "suid").map(({ id }) => id), ["LPRIV-02"]);
  assert.deepEqual(matchTasks(tasks, "kerberos ticket").map(({ id }) => id), ["AD-06"]);
  assert.deepEqual(matchTasks(tasks, "linux").map(({ id }) => id), ["LPRIV-02"]);
  assert.deepEqual(matchTasks(tasks, "   "), []);
  // A scan port reaches the module that owns it, and only that module.
  assert.deepEqual(matchTasks(tasks.slice(0, 1), "445", ["21", "139", "445"]).map(({ id }) => id), ["SMB-01"]);
  assert.deepEqual(matchTasks(tasks.slice(1), "445", []).map(({ id }) => id), []);
});

test("every service lane names its scan ports in the sidebar and the port index", async () => {
  await buildSite();
  const [sidebar, index, directory, home] = await Promise.all([
    text("site/.vitepress/generated/sidebar.json").then(JSON.parse),
    text("site/.vitepress/generated/port-index.md"),
    text("site/.vitepress/generated/module-directory.md"),
    text("site/.vitepress/dist/index.html"),
  ]);
  const groups = sidebar.flatMap((section) => section.items);
  const portsOf = (label) => groups.find(({ text }) => text === label)?.modulePorts ?? [];

  assert.deepEqual(portsOf("SSH"), ["22"]);
  assert.ok(portsOf("SMB").includes("445"));
  assert.ok(portsOf("MSSQL").includes("1433"));
  assert.ok(portsOf("DNS").includes("53/udp"));
  assert.ok(portsOf("Windows").includes("445"));
  assert.deepEqual(portsOf("Linux"), []);
  for (const label of ["Network", "Pivoting", "Linux"]) {
    assert.deepEqual(portsOf(label), [], label);
  }

  for (const group of groups) {
    for (const hint of group.modulePorts) {
      const [port, proto] = hint.split("/");
      const row = `| <span class="port">${port}</span> | ${(proto ?? "tcp").toUpperCase()} |`;
      assert.ok(index.includes(row), `${group.text} ${hint} row`);
      assert.ok(index.includes(`[${group.text}](../../generated/modules/`), hint);
      assert.match(directory, new RegExp(`\\| \\[${group.text.replace(/[/]/g, "\\/")}\\]\\([^)]+\\) \\| [^|]*${hint}`));
    }
  }

  // The home page shows the scan results above the task list, server-rendered.
  const beforeTaskList = home.slice(0, home.indexOf('id="task-list"'));
  assert.match(beforeTaskList, /id="scan-results"/);
  assert.match(beforeTaskList, />445</);
  assert.match(home, /class="sb-ports"[^>]*><span class="sb-port">22<\/span>/);
  assert.doesNotMatch(home, /Filter by ID, title, module or port|From a scan line/);
});

test("module pages list exact task titles in an aligned column without an outline", async () => {
  await buildSite();
  for (const module of catalog.modules) {
    const page = await text(`site/generated/modules/${module.id}.md`);
    assert.match(frontmatterOf(page), /^outline: false$/m);
    const html = await text(`site/.vitepress/dist/generated/modules/${module.id}.html`);
    // A module page is not a step in source order, so it has no task pager.
    assert.doesNotMatch(html, /in source order/, module.id);
    for (const task of catalog.tasks.filter(({ moduleId }) => moduleId === module.id)) {
      const row = html.match(
        new RegExp(`<span class="module-task-id">${task.id}\\.</span> <span class="module-task-title">([\\s\\S]*?)</span>`),
      );
      assert.ok(row, `${module.id} lists ${task.id}`);
      assert.equal(decodeEntities(row[1].replace(/<[^>]+>/g, "")), task.title.replaceAll("`", ""));
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

test("the generated box route remains available without a home-page prompt", async () => {
  await buildSite();
  const [home, route] = await Promise.all([
    text("site/.vitepress/dist/index.html"),
    text("site/.vitepress/dist/generated/start.html"),
  ]);
  assert.doesNotMatch(home, />Default box route<\/a>/);
  assert.match(route, /id="default-box-route"/);
  assert.match(
    decodeEntities(route.replace(/<[^>]+>/g, "")).replace(/\s+/g, " "),
    /LNX-01 or WIN-01 according to the actual host; AD-01 when domain context is assigned or observed\./,
  );
});

test("the old directory URL forwards to the home page, and task crumbs point home", async () => {
  await buildSite();
  const moved = await text("site/.vitepress/dist/checklist/index.html");
  assert.match(moved, /<meta http-equiv="refresh" content="0; url=\.\.\/">/);
  assert.match(moved, /<link rel="canonical" href="\.\.\/">/);
  const header = await text("site/.vitepress/theme/components/TaskHeader.vue");
  assert.match(header, /const checklistLink = withBase\("\/"\);/);
});

test("pages without an outline reserve no empty aside, and the column reaches 1120px", async () => {
  const net03 = await text("site/generated/tasks/net-03.md");
  assert.match(net03, /^outline: false\naside: false$/m);
  const module = await text("site/generated/modules/network.md");
  assert.match(module, /^aside: false$/m);
  const rules = await allThemeRules();
  const column = rules.find((rule) => rule.media === null && rule.selectors.includes(".Layout .VPDoc .content-container"));
  assert.equal(declaration(column.body, "max-width"), "1120px");
  // No page type narrows the column again.
  for (const rule of rules.filter((candidate) => candidate.selectors.some((selector) => /\.content-container$/.test(selector)))) {
    assert.ok(["1120px", undefined].includes(declaration(rule.body, "max-width")), rule.selectors.join(", "));
  }
});

test("the column is centred on the screen and kept clear of the open sidebar in both fold states", async () => {
  const rules = await allThemeRules();
  const centred = rules.find((rule) => rule.media?.includes("min-width: 960px") && rule.selectors.includes(".Layout .VPDoc .content-container") && declaration(rule.body, "margin-inline"));
  assert.ok(centred, "desktop column margin rule");
  assert.equal(declaration(centred.body, "margin-inline"), "max(0px, calc(50% - var(--vp-sidebar-width) / 2 - 560px)) auto");
  // Nothing keyed to the fold state offsets the column.
  for (const rule of rules.filter((candidate) => candidate.selectors.some((selector) => selector.includes("sidebar-collapsed")))) {
    assert.ok(!rule.selectors.some((selector) => /VPDoc|VPContent|content-container/.test(selector)), rule.selectors.join(", "));
  }
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
  assert.match(net01, /class="blank">&lt;TARGET_IP&gt;<\/span>/);
  assert.doesNotMatch(mail02, /class="blank">&lt;0\.4096&gt;/);
  assert.doesNotMatch(wupload02, /class="blank">&lt;\?php/);
  // The placeholder summary strip is gone. Python source in the local helper
  // reference still never gets blank marks.
  assert.doesNotMatch(net01, /cmd-fill|cmd-fill-label|>Fill in</);
  assert.doesNotMatch(uploadProof, /class="blank"/);
});

test("task pages separate outcome rows, stop marks and the explanation band without a route appendix", async () => {
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
  assert.doesNotMatch(net05, /class="(?:route-panel|task-rail|task-jumps)"/);
  assert.match(ad03, /data-label="Revisit"/);
  // Plain task IDs in prose are marked as IDs, never as routes.
  assert.match(net05, /<span class="task-id"[^>]*>NET-03<\/span>/);
  assert.match(net05, /<span class="task-id"[^>]*>EXP-01<\/span>/);
});

test("every task page keeps module context expanded with no <details> wrapper", async () => {
  await buildSite();
  const failures = [];
  for (const module of checklist.modules) {
    if (!module.context || module.id === "linux_privilege") continue;
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
    /(?<![-\w])clip\s*:/i,
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

test("command controls and focus remain distinct on dark plates in either theme", async () => {
  const css = await text("site/.vitepress/theme/tokens.css");
  const light = tokenBlock(css, ":root");
  const dark = new Map([...light, ...tokenBlock(css, ".dark")]);
  for (const [mode, tokens] of [["light", light], ["dark", dark]]) {
    const colour = (name) => hexRgb(tokens.get(name));
    for (const surface of ["rb-plate", "rb-plate-head"]) {
      for (const token of ["rb-plate-focus", "rb-plate-control-edge", "rb-plate-ink-2"]) {
        assert.ok(contrast(colour(token), colour(surface)) >= 3, `${mode}: ${token} against ${surface}`);
      }
    }
    for (const fill of ["rb-plate-ink", "rb-plate-ink-2"]) {
      assert.ok(contrast(colour("rb-plate"), colour(fill)) >= 4.5, `${mode}: Copy text against ${fill}`);
    }
  }
});

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
    for (const ink of ["rb-ink", "rb-ink-2", "rb-ink-3", "rb-port"]) {
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
  for (const module of checklist.modules.filter(({ id }) => id !== "linux")) {
    const html = await text(`site/.vitepress/dist/generated/modules/${module.id}.html`);
    const strip = html.match(/<div class="task-header module-header">([\s\S]*?)<\/nav><\/div>/)?.[1];
    assert.ok(strip, `${module.id} has a header strip`);
    assert.ok(html.indexOf('<div class="task-header module-header">') < html.indexOf("<main"), module.id);
    const expectedCount = module.id === "linux_privilege" ? 20 : module.tasks.length;
    assert.match(strip, new RegExp(`${expectedCount} tasks?</span>`), `${module.id} task count`);
    assert.match(strip, /href="\/GESS1025\/generated\/start\.html">Box route<\/a>/);
    assert.ok(strip.includes(`>NET-05: ${escapeVuePlaceholders(net05.title).replaceAll("'", "&#39;")}</a>`), `${module.id} NET-05 title`);
  }
});

test("outcome lists are recognised by a slug on every item, shared by generator and renderer", () => {
  assert.ok(isOutcomeList(["http_reported: Nmap reported HTTP.", "ftp_reported: Nmap reported FTP."]));
  assert.ok(!isOutcomeList(["http_reported: only one item"]));
  assert.ok(!isOutcomeList(["http_reported: slugged", "Plain bullet without a slug"]));
  assert.ok(!isOutcomeList(["reply: a single word is not a slug", "no_reply: two words"]));
});

test("the task list keeps every task without directory controls", async () => {
  await buildSite();
  const directory = await text("site/.vitepress/theme/components/TaskDirectory.vue");
  assert.doesNotMatch(directory, /Filter by ID|By module|Flat list|directory-tools|directory-flat/);
  // The server-rendered task list keeps every published task in module order.
  const html = await text("site/.vitepress/dist/index.html");
  const directoryHtml = html.slice(html.indexOf('class="directory"'), html.indexOf('id="module-summary"'));
  assert.equal(new Set([...directoryHtml.matchAll(/generated\/tasks\/([a-z0-9-]+)\.html/g)].map(([, id]) => id)).size, 215);
  assert.doesNotMatch(directoryHtml, /All 215 tasks|Directory layout|aria-pressed/);
});

// Flat list of style rules with the at-rule prelude that encloses each one.
function cssRules(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];
  let media = null;
  let start = 0;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === "{") {
      const prelude = source.slice(start, index).trim();
      start = index + 1;
      if (prelude.startsWith("@")) {
        media = prelude;
        continue;
      }
      const end = source.indexOf("}", index);
      // Split the selector list on top-level commas, not those inside :is().
      const selectors = prelude.split(/,(?![^()]*\))/).map((part) => part.trim());
      rules.push({ media, selectors, body: source.slice(index + 1, end) });
      index = end;
      start = end + 1;
    } else if (source[index] === "}") {
      media = null;
      start = index + 1;
    }
  }
  return rules;
}

function declaration(body, property) {
  return body.match(new RegExp(`(?:^|;|\\s)${property}\\s*:\\s*([^;]+)`))?.[1].trim();
}

async function allThemeRules() {
  const rules = [];
  for (const file of await themeStylesheets()) {
    for (const rule of cssRules(await readFile(file, "utf8"))) rules.push({ ...rule, file: path.basename(file) });
  }
  return rules;
}

test("narrow command plates inset the header once, so labels line up with the code column", async () => {
  const narrow = (await allThemeRules()).filter((rule) => /max-width:\s*640px/.test(rule.media ?? ""));
  const inset = (selector) => {
    const rule = narrow.find((candidate) => candidate.selectors.includes(selector) && /padding/.test(candidate.body));
    assert.ok(rule, `${selector} has a narrow-screen inset`);
    return rule;
  };
  const code = declaration(inset(".vp-doc div.cmd-plate code").body, "padding").split(/\s+/)[1];
  const row = ".vp-doc .cmd-bar";
  assert.equal(declaration(inset(row).body, "padding-left"), code, `${row} starts on the code column`);
  for (const rule of narrow.filter((candidate) => candidate.selectors.includes(".vp-doc .cmd-head"))) {
    assert.doesNotMatch(rule.body, /padding/, `${rule.file}: the head would add a second inset to its rows`);
  }
});

test("task pages use only source headings and command targets below sticky bars", async () => {
  const headingRules = (await allThemeRules()).filter(
    (rule) => rule.selectors.includes(".Layout .vp-doc :is(h1, h2, h3, h4, h5, h6)[id]") && /scroll-margin-top/.test(rule.body),
  );
  assert.ok(headingRules.length >= 3, "heading offsets exist for desktop, tablet and phone widths");
  for (const rule of headingRules) {
    assert.doesNotMatch(rule.selectors.join(" "), /route-panel-title/);
  }
});

test("the compact task location row keeps its position separate from the source title", async () => {
  const rules = await allThemeRules();
  const header = rules.find((rule) => rule.media === null && rule.selectors.includes(".task-header"));
  assert.equal(declaration(header.body, "border-bottom"), "0");
  const position = rules.find((rule) => rule.media === null && rule.selectors.includes(".task-position"));
  assert.equal(declaration(position.body, "margin-left"), "auto");
});

test("the sidebar has no search of its own; search lives in the nav bar", async () => {
  const [index, rules] = await Promise.all([text("site/.vitepress/theme/index.js"), allThemeRules()]);
  assert.doesNotMatch(index, /sidebar-nav-before|GoToTask/);
  assert.ok(!rules.some((rule) => rule.selectors.some((selector) => /\.goto\b/.test(selector))));
  // The sidebar's text starts at the rail inset, under the menu glyph's bars.
  const panel = rules.find((rule) => rule.media === "@media (min-width: 960px)" && rule.selectors.includes(":root .Layout .VPSidebar"));
  assert.equal(declaration(panel.body, "padding-inline-start"), "var(--rb-sidebar-inset)");
});
