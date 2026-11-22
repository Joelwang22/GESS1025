import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test, { before } from "node:test";
import { promisify } from "node:util";

import { generateSite } from "../scripts/checklist.mjs";

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

before(async () => {
  await generateSite({ sourcePath, manifestPath, outputRoot: repositoryRoot });
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
