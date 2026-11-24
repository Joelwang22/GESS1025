import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseChecklist } from "./checklist.mjs";

// Re-pins the maintained snapshot after an intentional content edit.
// Updates the manifest hash/count and the human-facing count mirrors.
const root = path.resolve(import.meta.dirname, "..");
const snapshot = path.join(root, "content/master-working-2026-11-21.working.132.md");
const bytes = await readFile(snapshot);
const checklist = parseChecklist(bytes.toString("utf8"));
const hash = createHash("sha256").update(bytes).digest("hex");

const retired = new Set(["linux", "linux_privilege"]);
const operatorTasks = 15;
const sourceTasks = checklist.tasks.length;
const publishedTasks = sourceTasks - checklist.tasks.filter(({ moduleId }) => retired.has(moduleId)).length + operatorTasks;
const sourceModules = checklist.modules.length;
const publishedModules = sourceModules - [...retired].filter((id) => checklist.modules.some((module) => module.id === id)).length + 1;

async function edit(relative, pairs) {
  const file = path.join(root, relative);
  let text = await readFile(file, "utf8");
  for (const [pattern, value] of pairs) {
    if (!pattern.test(text)) throw new Error(`pattern missing in ${relative}: ${pattern}`);
    text = text.replace(pattern, value);
  }
  await writeFile(file, text);
}

await edit("content/source.json", [
  [/"snapshotSha256": "[a-f0-9]{64}"/, `"snapshotSha256": "${hash}"`],
  [/"expectedTaskCount": \d+/, `"expectedTaskCount": ${sourceTasks}`],
]);
await edit("site/about/source.md", [
  [/Imported snapshot tasks \| \d+/, `Imported snapshot tasks | ${sourceTasks}`],
  [/Imported snapshot modules \| \d+/, `Imported snapshot modules | ${sourceModules}`],
  [/Published pages \| \d+/, `Published pages | ${publishedTasks}`],
  [/Published modules \| \d+/, `Published modules | ${publishedModules}`],
  [/Snapshot SHA-256 \| `[a-f0-9]{64}`/, `Snapshot SHA-256 | \`${hash}\``],
]);
await edit("DESIGN.md", [
  [/By module \(\d+\)/, `By module (${publishedModules})`],
  [/Flat list \(\d+\)/, `Flat list (${publishedTasks})`],
  [/lists all \d+/, `lists all ${publishedTasks}`],
]);
await edit("tests/checklist.test.mjs", [
  [/tasks\.length, \d+/, `tasks.length, ${sourceTasks}`],
  [/size, \d+/, `size, ${sourceTasks}`],
  [/expectedTaskCount, \d+/, `expectedTaskCount, ${sourceTasks}`],
  [/first\.taskCount, \d+/, `first.taskCount, ${publishedTasks}`],
  [/first\.moduleCount, \d+/, `first.moduleCount, ${publishedModules}`],
  [/first\.sourceTaskCount, \d+/, `first.sourceTaskCount, ${sourceTasks}`],
  [/first\.sourceModuleCount, \d+/, `first.sourceModuleCount, ${sourceModules}`],
]);
await edit("tests/site.test.mjs", [
  [/Published pages \\\| \d+/, `Published pages \\| ${publishedTasks}`],
  [/taskFiles\.length, \d+/, `taskFiles.length, ${publishedTasks + 10}`],
  [/moduleFiles\.length, \d+/, `moduleFiles.length, ${publishedModules}`],
  [/sidebar\.length, \d+/, `sidebar.length, ${publishedModules}`],
  [/indexNames\.length, \d+/, `indexNames.length, ${publishedModules}`],
  [/generatedCatalog\.moduleCount, \d+/, `generatedCatalog.moduleCount, ${publishedModules}`],
  [/generatedCatalog\.taskCount, \d+/, `generatedCatalog.taskCount, ${publishedTasks}`],
  [/generatedCatalog\.sourceModuleCount, \d+/, `generatedCatalog.sourceModuleCount, ${sourceModules}`],
  [/generatedCatalog\.sourceTaskCount, \d+/, `generatedCatalog.sourceTaskCount, ${sourceTasks}`],
  [/\.size, \d+/g, `.size, ${publishedTasks}`],
  [/all \d+ tasks/, `all ${publishedTasks} tasks`],
  [/By module \\+\(\d+\\+\)/, `By module \\(${publishedModules}\\)`],
  [/Flat list \\+\(\d+\\+\)/, `Flat list \\(${publishedTasks}\\)`],
  [/assert\.match\(source, \/[a-f0-9]{64}\/\)/, `assert.match(source, /${hash}/)`],
]);

process.stdout.write(`Stamped ${sourceTasks} source tasks, ${publishedTasks} published, ${hash}\n`);
