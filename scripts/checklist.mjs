import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const EDITION_HEADING = /^# Master working checklist (\S+)\s*$/;
const MODULE_HEADING = /^# ([a-z][a-z0-9_]*)\s*$/;
const TASK_HEADING =
  /^## ([A-Z][A-Z0-9]*-\d{2})(?:\.\s+|\s+[—-]\s+|\s+)(.+?)\s*$/;
const EXPLANATIONS_HEADING = "# Explanations and troubleshooting";
const ROUTE_DESTINATION = /\bNext: ([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?=[\s.,;:!?)]|$)/g;

function normalizeLines(markdown) {
  return markdown.replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
}

function classifyStructuralLines(lines) {
  const structural = [];
  let fence = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence === null) {
      if (marker) {
        fence = { kind: marker[1][0], length: marker[1].length };
        structural.push(false);
      } else {
        structural.push(true);
      }
      continue;
    }

    structural.push(false);
    if (
      marker &&
      marker[1][0] === fence.kind &&
      marker[1].length >= fence.length &&
      marker[2].trim() === ""
    ) {
      fence = null;
    }
  }

  if (fence !== null) throw new Error("Unclosed Markdown fence in checklist source");
  return structural;
}

function structuralLines(lines) {
  const classifications = classifyStructuralLines(lines);
  const structural = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (classifications[index]) structural.push({ index, line: lines[index] });
  }
  return structural;
}

function transformOutsideFences(markdown, transform) {
  const lines = normalizeLines(markdown);
  const classifications = classifyStructuralLines(lines);
  return lines
    .map((line, index) => (classifications[index] ? transform(line) : line))
    .join("\n");
}

function section(lines, start, end) {
  return lines.slice(start, end).join("\n").trim();
}

export function parseChecklist(markdown) {
  const lines = normalizeLines(markdown);
  const structural = structuralLines(lines);
  const editionEntry = structural.find(({ line }) => EDITION_HEADING.test(line));
  if (!editionEntry) throw new Error("Missing master checklist edition heading");
  const edition = editionEntry.line.match(EDITION_HEADING)[1];

  const digestMatch = markdown.match(/Sources SHA-256: `([a-f0-9]{64})`/);
  if (!digestMatch) throw new Error("Missing checklist source digest");

  const appendixEntry = structural.find(
    ({ index, line }) => index > editionEntry.index && line === EXPLANATIONS_HEADING,
  );
  if (!appendixEntry) throw new Error("Missing explanations and troubleshooting appendix");

  const workingEntries = structural.filter(
    ({ index }) => index > editionEntry.index && index < appendixEntry.index,
  );
  const modules = [];
  const moduleById = new Map();
  const workingTasks = [];
  const taskById = new Map();
  let currentModule = null;

  for (const entry of workingEntries) {
    const moduleMatch = entry.line.match(MODULE_HEADING);
    if (moduleMatch) {
      const id = moduleMatch[1];
      if (moduleById.has(id)) throw new Error(`Duplicate module ${id}`);
      currentModule = { id, headingIndex: entry.index, context: "", tasks: [] };
      moduleById.set(id, currentModule);
      modules.push(currentModule);
      continue;
    }

    const taskMatch = entry.line.match(TASK_HEADING);
    if (!taskMatch) continue;
    if (!currentModule) throw new Error(`Task ${taskMatch[1]} has no module`);
    const id = taskMatch[1];
    if (taskById.has(id)) throw new Error(`Duplicate working task ${id}`);
    const task = {
      id,
      title: taskMatch[2],
      moduleId: currentModule.id,
      headingIndex: entry.index,
      working: "",
      explanation: "",
    };
    currentModule.tasks.push(task);
    workingTasks.push(task);
    taskById.set(id, task);
  }

  if (workingTasks.length === 0) throw new Error("Checklist has no working tasks");

  for (const module of modules) {
    const firstTask = module.tasks[0];
    const nextModule = modules[modules.indexOf(module) + 1];
    const contextEnd = firstTask?.headingIndex ?? nextModule?.headingIndex ?? appendixEntry.index;
    module.context = section(lines, module.headingIndex + 1, contextEnd);
  }

  for (let index = 0; index < workingTasks.length; index += 1) {
    const task = workingTasks[index];
    const nextTask = workingTasks[index + 1];
    const taskModuleIndex = modules.findIndex(({ id }) => id === task.moduleId);
    const nextModule = modules[taskModuleIndex + 1];
    const end =
      nextTask?.moduleId === task.moduleId
        ? nextTask.headingIndex
        : (nextModule?.headingIndex ?? appendixEntry.index);
    task.working = section(lines, task.headingIndex + 1, end);
  }

  const explanationEntries = structural
    .filter(({ index }) => index > appendixEntry.index)
    .map((entry) => ({
      ...entry,
      match: entry.line.match(TASK_HEADING),
    }))
    .filter(({ match }) => match !== null);
  const explanationIds = new Set();

  for (let index = 0; index < explanationEntries.length; index += 1) {
    const entry = explanationEntries[index];
    const id = entry.match[1];
    if (explanationIds.has(id)) throw new Error(`Duplicate explanation for ${id}`);
    const task = taskById.get(id);
    if (!task) throw new Error(`Explanation has no working task: ${id}`);
    const end = explanationEntries[index + 1]?.index ?? lines.length;
    task.explanation = section(lines, entry.index + 1, end);
    if (!task.explanation) throw new Error(`Missing explanation for ${id}`);
    explanationIds.add(id);
  }

  for (const task of workingTasks) {
    if (!explanationIds.has(task.id)) {
      throw new Error(`Missing explanation for ${task.id}`);
    }
  }

  return {
    edition,
    sourceDigest: digestMatch[1],
    preface: section(lines, 0, editionEntry.index),
    modules: modules.map(({ headingIndex: _headingIndex, ...module }) => ({
      ...module,
      tasks: module.tasks.map(({ headingIndex: _taskHeading, ...task }) => task),
    })),
    tasks: workingTasks.map(({ headingIndex: _headingIndex, ...task }) => task),
  };
}

export function linkTaskRoutes(markdown, taskIds, terminalStates) {
  return transformOutsideFences(markdown, (line) =>
    line.replace(ROUTE_DESTINATION, (match, destination) => {
      if (taskIds.has(destination)) {
        return `Next: [${destination}](./${destination.toLowerCase()})`;
      }
      if (terminalStates.has(destination)) return match;
      throw new Error(`Unknown route destination ${destination}`);
    }),
  );
}

export function escapeVuePlaceholders(markdown) {
  return transformOutsideFences(markdown, (line) =>
    line
      .replaceAll("{{", "&#123;&#123;")
      .replaceAll("}}", "&#125;&#125;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;"),
  );
}

function linkSupportingReferences(markdown) {
  return markdown
    .replaceAll(
      /\((?:\.\/)?checklist\.md(#[^)]+)?\)/g,
      (_match, fragment = "") => `(../references/checklist.md${fragment})`,
    )
    .replaceAll(
      /\((?:\.\/)?lab-retrospective\.md(#[^)]+)?\)/g,
      (_match, fragment = "") =>
        `(../references/lab-retrospective.md${fragment})`,
    )
    .replaceAll(
      "(../../../scripts/make-lab-upload-proof.py)",
      "(../references/make-lab-upload-proof.md)",
    )
    .replaceAll(
      /\(windows-ad-practical\.json(?:#[^)]+)?\)/g,
      "(./win-01.md)",
    );
}

function validateReferences(manifest, sourceRoot) {
  if (!Array.isArray(manifest.references)) {
    throw new Error("Provenance manifest references must be an array");
  }
  const referenceRoot = path.resolve(sourceRoot, "content/references");
  const outputs = new Set();
  return manifest.references.map((reference) => {
    if (
      reference === null ||
      typeof reference !== "object" ||
      typeof reference.title !== "string" ||
      !reference.title.trim() ||
      typeof reference.snapshotPath !== "string" ||
      !/^[a-f0-9]{64}$/.test(reference.snapshotSha256) ||
      !["markdown", "python"].includes(reference.kind) ||
      typeof reference.output !== "string" ||
      !/^[a-z0-9][a-z0-9-]*\.md$/.test(reference.output)
    ) {
      throw new Error("Invalid reference output or manifest entry");
    }
    if (outputs.has(reference.output)) {
      throw new Error(`Duplicate reference output: ${reference.output}`);
    }
    outputs.add(reference.output);

    const snapshot = path.resolve(sourceRoot, reference.snapshotPath);
    const relative = path.relative(referenceRoot, snapshot);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(
        `Reference path outside content/references: ${reference.snapshotPath}`,
      );
    }
    return { ...reference, snapshot };
  });
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function displayName(moduleId) {
  return moduleId
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function frontmatter(title, description) {
  return [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    "outline: [2, 3]",
    "---",
    "",
  ].join("\n");
}

function taskPage(task, taskIds, terminalStates) {
  const title = `${task.id}. ${task.title}`;
  const working = escapeVuePlaceholders(
    linkSupportingReferences(
      linkTaskRoutes(task.working, taskIds, terminalStates),
    ),
  );
  const explanation = escapeVuePlaceholders(
    linkSupportingReferences(task.explanation),
  );
  return `${frontmatter(title, `OSCP master checklist task ${task.id}`)}# ${title}\n\n${working}\n\n## Explanations and troubleshooting\n\n${explanation}\n`;
}

function modulePage(module) {
  const name = displayName(module.id);
  const taskList = module.tasks
    .map(({ id, title }) => `- [${id}. ${title}](../tasks/${id.toLowerCase()})`)
    .join("\n");
  const context = module.context
    ? `${escapeVuePlaceholders(module.context)}\n\n`
    : "";
  return `${frontmatter(name, `${name} module in the OSCP master checklist`)}# ${name}\n\n${context}## Tasks\n\n${taskList}\n`;
}

async function writeText(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, value, "utf8");
}

export async function generateSite({ sourcePath, manifestPath, outputRoot }) {
  const [sourceBytes, manifestText] = await Promise.all([
    readFile(sourcePath),
    readFile(manifestPath, "utf8"),
  ]);
  const manifest = JSON.parse(manifestText);
  const checklist = parseChecklist(sourceBytes.toString("utf8"));
  const snapshotSha256 = sha256(sourceBytes);
  const root = path.resolve(outputRoot);
  const sourceRoot = path.resolve(path.dirname(manifestPath), "..");

  if (manifest.edition !== checklist.edition) {
    throw new Error(`Edition mismatch: ${manifest.edition} != ${checklist.edition}`);
  }
  if (manifest.sourceDigest !== checklist.sourceDigest) {
    throw new Error("Checklist source digest does not match provenance manifest");
  }
  if (manifest.snapshotSha256 !== snapshotSha256) {
    throw new Error("Checklist snapshot SHA-256 does not match provenance manifest");
  }
  if (manifest.expectedTaskCount !== checklist.tasks.length) {
    throw new Error(
      `Task count mismatch: ${manifest.expectedTaskCount} != ${checklist.tasks.length}`,
    );
  }

  const references = validateReferences(manifest, sourceRoot);
  const referencePages = [];
  for (const reference of references) {
    const bytes = await readFile(reference.snapshot);
    if (sha256(bytes) !== reference.snapshotSha256) {
      throw new Error(`Reference SHA-256 mismatch: ${reference.snapshotPath}`);
    }
    const source = bytes.toString("utf8");
    const page =
      reference.kind === "python"
        ? `${frontmatter(reference.title, reference.title)}# ${reference.title}\n\nThis is the exact helper referenced by the imported checklist. Review it locally before use.\n\n\`\`\`\`python\n${source.trimEnd()}\n\`\`\`\`\n`
        : `${frontmatter(reference.title, reference.title)}${escapeVuePlaceholders(source).trimStart()}`;
    referencePages.push({ ...reference, page });
  }

  const generatedRoot = path.join(root, "site/generated");
  const configGeneratedRoot = path.join(root, "site/.vitepress/generated");
  await Promise.all([
    rm(generatedRoot, { recursive: true, force: true }),
    rm(configGeneratedRoot, { recursive: true, force: true }),
  ]);

  const taskIds = new Set(checklist.tasks.map(({ id }) => id));
  const terminalStates = new Set(manifest.terminalStates);
  for (const task of checklist.tasks) {
    await writeText(
      path.join(generatedRoot, "tasks", `${task.id.toLowerCase()}.md`),
      taskPage(task, taskIds, terminalStates),
    );
  }
  for (const module of checklist.modules) {
    await writeText(
      path.join(generatedRoot, "modules", `${module.id}.md`),
      modulePage(module),
    );
  }
  for (const reference of referencePages) {
    await writeText(
      path.join(generatedRoot, "references", reference.output),
      reference.page,
    );
  }

  const sidebar = checklist.modules.map((module) => ({
    text: displayName(module.id),
    collapsed: true,
    items: module.tasks.map(({ id, title }) => ({
      text: `${id} · ${title}`,
      link: `/generated/tasks/${id.toLowerCase()}`,
    })),
  }));
  const contentManifest = {
    edition: checklist.edition,
    sourceDigest: checklist.sourceDigest,
    snapshotSha256,
    taskCount: checklist.tasks.length,
    modules: checklist.modules.map((module) => ({
      id: module.id,
      title: displayName(module.id),
      taskCount: module.tasks.length,
      tasks: module.tasks.map(({ id, title }) => ({ id, title })),
    })),
    references: referencePages.map(({ title, output, snapshotSha256 }) => ({
      title,
      output,
      snapshotSha256,
    })),
  };
  await Promise.all([
    writeText(
      path.join(generatedRoot, "content-manifest.json"),
      `${JSON.stringify(contentManifest, null, 2)}\n`,
    ),
    writeText(
      path.join(configGeneratedRoot, "sidebar.json"),
      `${JSON.stringify(sidebar, null, 2)}\n`,
    ),
  ]);

  return {
    edition: checklist.edition,
    moduleCount: checklist.modules.length,
    taskCount: checklist.tasks.length,
    snapshotSha256,
  };
}

async function main() {
  const repositoryRoot = path.resolve(import.meta.dirname, "..");
  const result = await generateSite({
    sourcePath: path.join(
      repositoryRoot,
      "content/master-working-2026-11-21.working.132.md",
    ),
    manifestPath: path.join(repositoryRoot, "content/source.json"),
    outputRoot: repositoryRoot,
  });
  process.stdout.write(
    `Generated ${result.taskCount} tasks across ${result.moduleCount} modules from ${result.edition}.\n`,
  );
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await main();
}
