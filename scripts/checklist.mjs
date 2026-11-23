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
const REFERENCE_TOKEN = "[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+";
const ROUTE_MARK = new RegExp(
  `\\bNext: (${REFERENCE_TOKEN}(?:/(?:${REFERENCE_TOKEN}|\\d{2}))*)(?=[\\s.,;:!?)*|]|$)|\\*\\*([^*\\n]+?)\\*\\*`,
  "g",
);
const REFERENCE_SEPARATOR = /(\/|\s+through\s+|,\s+or\s+|,\s+|\s+or\s+|\s+and\s+)/;
const TASK_SHAPE = /^[A-Z][A-Z0-9]*-\d{2}$/;
const TERMINAL_SHAPE = /^(?:PAUSE|GAP)-[A-Z]+(?:-[A-Z]+)*$/;
const PLAIN_TASK_TOKEN = /\b[A-Z][A-Z0-9]*-\d{2}\b/g;
const PLAIN_TERMINAL_TOKEN = /\b(?:PAUSE|GAP)-[A-Z]+(?:-[A-Z]+)*\b/g;

const MODULE_DISPLAY_NAMES = new Map([
  ["network", "Network"],
  ["file_services", "File services"],
  ["remote_access", "Remote access"],
  ["http", "HTTP"],
  ["windows_ad", "Windows and Active Directory"],
  ["redis", "Redis"],
  ["redis_exploitation", "Redis exploitation"],
  ["ssh_knock", "SSH knock"],
  ["windows_privilege", "Windows privilege"],
  ["dns_nfs", "DNS and NFS"],
  ["snmp", "SNMP"],
  ["database", "Database"],
  ["mssql", "MSSQL"],
  ["mail_rdp", "Mail and RDP"],
  ["web_input", "Web input"],
  ["ftp_write", "FTP write"],
  ["ftp_tls", "FTP TLS"],
  ["smb_write", "SMB write"],
  ["command_continuation", "Command continuation"],
  ["command_shell", "Command shell"],
  ["sql_continuation", "SQL continuation"],
  ["web_upload", "Web upload"],
  ["web_editor", "Web editor"],
  ["access", "Access"],
  ["shell_transfer", "Shell transfer"],
  ["local_artifact", "Local artifact"],
  ["linux", "Linux"],
  ["linux_privilege", "Linux privilege"],
]);

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

function mapInline(text, transformText, transformCode) {
  let result = "";
  let plain = "";
  let index = 0;
  while (index < text.length) {
    if (text[index] === "\\" && text[index + 1] === "`") {
      plain += "\\`";
      index += 2;
      continue;
    }
    if (text[index] !== "`") {
      plain += text[index];
      index += 1;
      continue;
    }
    let runEnd = index;
    while (text[runEnd] === "`") runEnd += 1;
    const length = runEnd - index;
    let close = -1;
    let search = runEnd;
    while (search < text.length) {
      const candidate = text.indexOf("`", search);
      if (candidate === -1) break;
      let candidateEnd = candidate;
      while (text[candidateEnd] === "`") candidateEnd += 1;
      if (candidateEnd - candidate === length) {
        close = candidate;
        break;
      }
      search = candidateEnd;
    }
    if (close === -1) {
      plain += text.slice(index, runEnd);
      index = runEnd;
      continue;
    }
    result += transformText(plain);
    plain = "";
    result += transformCode(text.slice(index, close + length), text.slice(runEnd, close));
    index = close + length;
  }
  return result + transformText(plain);
}

// Applies transformText to prose and transformCode to inline code spans,
// leaving fenced blocks byte-for-byte. Code spans may wrap across the lines of
// one paragraph, but never across blank lines or table rows.
function transformProse(markdown, transformText, transformCode = (span) => span) {
  const lines = normalizeLines(markdown);
  const classifications = classifyStructuralLines(lines);
  const output = [];
  let paragraph = [];
  const flush = () => {
    if (paragraph.length === 0) return;
    output.push(mapInline(paragraph.join("\n"), transformText, transformCode));
    paragraph = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!classifications[index] || line.trim() === "") {
      flush();
      output.push(line);
    } else if (/^\s*\|/.test(line)) {
      flush();
      output.push(mapInline(line, transformText, transformCode));
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return output.join("\n");
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

function unknownDestination(destination) {
  return new Error(`Unknown route destination ${destination}`);
}

// Splits "A-01/02", "A-01/PAUSE-X" or "A-01 through A-15" into reference
// parts. A part that is neither task- nor terminal-shaped is "other".
function parseReferenceRun(run) {
  const pieces = run.split(REFERENCE_SEPARATOR);
  const parts = [];
  let previousTask = null;
  for (let index = 0; index < pieces.length; index += 2) {
    const token = pieces[index];
    if (TASK_SHAPE.test(token)) {
      parts.push({ index, kind: "task", id: token, abbreviated: false });
      previousTask = token;
    } else if (TERMINAL_SHAPE.test(token)) {
      parts.push({ index, kind: "terminal", id: token });
      previousTask = null;
    } else if (/^\d{2}$/.test(token) && pieces[index - 1] === "/" && previousTask) {
      const id = previousTask.replace(/\d{2}$/, token);
      parts.push({ index, kind: "task", id, abbreviated: true });
      previousTask = id;
    } else {
      parts.push({ index, kind: "other", id: token });
    }
  }
  return { pieces, parts };
}

function renderReferenceRun({ pieces, parts }, context) {
  const rendered = [...pieces];
  for (const part of parts) {
    if (part.kind === "other") throw unknownDestination(part.id);
    if (part.kind === "terminal") {
      if (!context.terminalStates.has(part.id)) throw unknownDestination(part.id);
      context.references.push({ kind: "terminal", id: part.id });
      continue;
    }
    if (!context.taskIds.has(part.id)) throw unknownDestination(part.id);
    context.references.push({ kind: "task", id: part.id });
    const href = `${context.linkPrefix}${part.id.toLowerCase()}`;
    rendered[part.index] = part.abbreviated
      ? `[${pieces[part.index]}](${href} "${part.id}")`
      : `[${part.id}](${href})`;
  }
  return rendered.join("");
}

function validatePlainReferences(text, { taskIds, terminalStates }) {
  for (const [token] of text.matchAll(PLAIN_TASK_TOKEN)) {
    if (!taskIds.has(token)) throw unknownDestination(token);
  }
  for (const [token] of text.matchAll(PLAIN_TERMINAL_TOKEN)) {
    if (!terminalStates.has(token)) throw unknownDestination(token);
  }
}

// Links known task IDs in source route marks (`Next:` destinations and bold
// reference spans) outside fenced code and inline code. Terminal states stay
// plain text. Any unknown task-like or terminal-like token fails generation.
function transformTaskReferences(
  markdown,
  taskIds,
  terminalStates,
  { linkPrefix = "./" } = {},
) {
  const context = { taskIds, terminalStates, linkPrefix, references: [] };
  const linked = transformProse(markdown, (text) => {
    validatePlainReferences(text, context);
    return text.replace(ROUTE_MARK, (match, nextRun, boldRun) => {
      if (nextRun !== undefined) {
        return `Next: ${renderReferenceRun(parseReferenceRun(nextRun), context)}`;
      }
      const run = parseReferenceRun(boldRun);
      if (run.parts.some(({ kind }) => kind === "other")) return match;
      return `**${renderReferenceRun(run, context)}**`;
    });
  });
  return { markdown: linked, references: context.references };
}

export function linkTaskRoutes(markdown, taskIds, terminalStates, options) {
  return transformTaskReferences(markdown, taskIds, terminalStates, options).markdown;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function codeSpanContent(content) {
  const collapsed = content.replaceAll("\n", " ");
  if (
    collapsed.length > 1 &&
    collapsed.startsWith(" ") &&
    collapsed.endsWith(" ") &&
    collapsed.trim() !== ""
  ) {
    return collapsed.slice(1, -1);
  }
  return collapsed;
}

// Makes Vue interpolation and raw HTML inert. Prose is entity-escaped once.
// Inline code is left to Markdown, which escapes it once; a code span that
// contains Vue interpolation becomes an equivalent v-pre element instead.
export function escapeVuePlaceholders(markdown) {
  return transformProse(
    markdown,
    (text) =>
      text
        .replaceAll("{{", "&#123;&#123;")
        .replaceAll("}}", "&#125;&#125;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;"),
    (span, content) =>
      /\{\{|\}\}/.test(content)
        ? `<code v-pre>${escapeHtml(codeSpanContent(content))}</code>`
        : span,
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
  const name = MODULE_DISPLAY_NAMES.get(moduleId);
  if (!name) throw new Error(`Missing display name for module ${moduleId}`);
  return name;
}

function taskLink(id) {
  return `/generated/tasks/${id.toLowerCase()}`;
}

function moduleLink(id) {
  return `/generated/modules/${id}`;
}

function frontmatter(title, description, fields = {}) {
  return [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    "outline: [2, 3]",
    ...Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`),
    "---",
    "",
  ].join("\n");
}

function renderSection(markdown, taskIds, terminalStates, options) {
  const { markdown: linked, references } = transformTaskReferences(
    markdown,
    taskIds,
    terminalStates,
    options,
  );
  return {
    markdown: escapeVuePlaceholders(linkSupportingReferences(linked)),
    references,
  };
}

function moduleContextSection(module, context) {
  const name = displayName(module.id);
  return [
    '<section class="ledger-module-context" aria-labelledby="module-context">',
    "",
    `<p id="module-context" class="ledger-module-context-label">${escapeHtml(name)} module context</p>`,
    "",
    context,
    "",
    "</section>",
    "",
    "",
  ].join("\n");
}

function buildTaskPage(task, module, taskIds, terminalStates) {
  const title = `${task.id}. ${task.title}`;
  const sections = [module.context, task.working, task.explanation].map((markdown) =>
    renderSection(markdown, taskIds, terminalStates),
  );
  const [context, working, explanation] = sections;
  const page = `${frontmatter(title, `OSCP master checklist task ${task.id}`, {
    taskId: task.id,
    moduleId: module.id,
    moduleTitle: displayName(module.id),
  })}# ${title}\n\n${module.context ? moduleContextSection(module, context.markdown) : ""}${working.markdown}\n\n## Explanations and troubleshooting\n\n${explanation.markdown}\n`;
  return { page, references: sections.flatMap(({ references }) => references) };
}

function modulePage(module, taskIds, terminalStates) {
  const name = displayName(module.id);
  const taskList = module.tasks
    .map(({ id, title }) => `- [${id}. ${title}](../tasks/${id.toLowerCase()})`)
    .join("\n");
  const context = module.context
    ? `${renderSection(module.context, taskIds, terminalStates, { linkPrefix: "../tasks/" }).markdown}\n\n`
    : "";
  return `${frontmatter(name, `${name} module in the OSCP master checklist`)}# ${name}\n\n${context}## Tasks\n\n${taskList}\n`;
}

function buildRoutes(checklist, moduleById, referencesByTask) {
  const taskById = new Map(checklist.tasks.map((task) => [task.id, task]));
  const station = (id) => ({ id, title: taskById.get(id).title, link: taskLink(id) });
  const inbound = new Map(checklist.tasks.map(({ id }) => [id, []]));
  const routes = {};

  for (const task of checklist.tasks) {
    const module = moduleById.get(task.moduleId);
    const references = referencesByTask.get(task.id);
    const outbound = [
      ...new Set(
        references.filter(({ kind, id }) => kind === "task" && id !== task.id).map(({ id }) => id),
      ),
    ];
    for (const id of outbound) inbound.get(id).push(task.id);
    routes[task.id] = {
      id: task.id,
      title: task.title,
      link: taskLink(task.id),
      module: { id: module.id, title: displayName(module.id), link: moduleLink(module.id) },
      context: module.context,
      outbound: outbound.map(station),
      terminalStates: [
        ...new Set(references.filter(({ kind }) => kind === "terminal").map(({ id }) => id)),
      ],
      inbound: [],
    };
  }
  for (const task of checklist.tasks) {
    routes[task.id].inbound = inbound.get(task.id).map(station);
  }
  return routes;
}

function buildCatalog(checklist, snapshotSha256) {
  return {
    edition: checklist.edition,
    sourceDigest: checklist.sourceDigest,
    snapshotSha256,
    moduleCount: checklist.modules.length,
    taskCount: checklist.tasks.length,
    modules: checklist.modules.map((module) => ({
      id: module.id,
      title: displayName(module.id),
      link: moduleLink(module.id),
      hasContext: module.context.length > 0,
      tasks: module.tasks.map(({ id, title }) => ({ id, title, link: taskLink(id) })),
    })),
    tasks: checklist.tasks.map(({ id, title, moduleId }) => ({
      id,
      title,
      link: taskLink(id),
      moduleId,
      moduleTitle: displayName(moduleId),
    })),
  };
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
  const moduleById = new Map(checklist.modules.map((module) => [module.id, module]));
  const referencesByTask = new Map();
  for (const task of checklist.tasks) {
    const { page, references } = buildTaskPage(
      task,
      moduleById.get(task.moduleId),
      taskIds,
      terminalStates,
    );
    referencesByTask.set(task.id, references);
    await writeText(path.join(generatedRoot, "tasks", `${task.id.toLowerCase()}.md`), page);
  }
  for (const module of checklist.modules) {
    await writeText(
      path.join(generatedRoot, "modules", `${module.id}.md`),
      modulePage(module, taskIds, terminalStates),
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
    writeText(
      path.join(configGeneratedRoot, "routes.json"),
      `${JSON.stringify(buildRoutes(checklist, moduleById, referencesByTask), null, 2)}\n`,
    ),
    writeText(
      path.join(configGeneratedRoot, "catalog.json"),
      `${JSON.stringify(buildCatalog(checklist, snapshotSha256), null, 2)}\n`,
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
