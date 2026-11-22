import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
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

async function text(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
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
  const [references, db02, wupload02] = await Promise.all([
    readdir(path.join(siteRoot, "generated/references")),
    text("site/generated/tasks/db-02.md"),
    text("site/generated/tasks/wupload-02.md"),
  ]);

  assert.deepEqual(references.sort(), [
    "checklist.md",
    "lab-retrospective.md",
    "make-lab-upload-proof.md",
  ]);
  assert.match(db02, /\]\(\.\.\/references\/checklist\.md\)/);
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
  const vitepressBin = path.join(
    repositoryRoot,
    "node_modules/vitepress/bin/vitepress.js",
  );
  await execFileAsync(process.execPath, [vitepressBin, "build", siteRoot], {
    cwd: repositoryRoot,
    windowsHide: true,
  });

  const [home, net01] = await Promise.all([
    text("site/.vitepress/dist/index.html"),
    text("site/.vitepress/dist/generated/tasks/net-01.html"),
  ]);
  assert.match(home, /\/checklist\/assets\//);
  assert.match(net01, /\/checklist\/generated\/tasks\/net-02/);
  assert.doesNotMatch(home, /(?:href|src)="\/assets\//);
  assert.doesNotMatch(net01, /href="\/generated\//);
});
