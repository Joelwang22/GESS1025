import { createHash } from "node:crypto";
import {
  mkdir,
  readdir,
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
const REFERENCE_SEPARATOR = /(\/|\s+through\s+|\s+→\s+|,\s+or\s+|,\s+|\s+or\s+|\s+and\s+)/;
const TASK_SHAPE = /^[A-Z][A-Z0-9]*-\d{2}$/;
const TERMINAL_SHAPE = /^(?:PAUSE|GAP)-[A-Z]+(?:-[A-Z]+)*$/;
const PLAIN_TASK_TOKEN = /\b[A-Z][A-Z0-9]*-\d{2}\b/g;
const PLAIN_TERMINAL_TOKEN = /\b(?:PAUSE|GAP)-[A-Z]+(?:-[A-Z]+)*\b/g;
const OPERATOR_MODULE_ID = "linux_privilege";
const OPERATOR_MODULE_TITLE = "Linux";
const RETIRED_MODULE_IDS = new Set(["linux", "linux_privilege"]);
const LNX_REDIRECTS = new Map([
  ["LNX-01", "LPRIV-01"],
  ["LNX-02", "LPRIV-11"],
  ["LNX-03", "LPRIV-03"],
  ["LNX-04", "LPRIV-06"],
  ["LNX-05", "LPRIV-04"],
  ["LNX-06", "LPRIV-07"],
  ["LNX-07", "LPRIV-08"],
  ["LNX-08", "LPRIV-07"],
  ["LNX-09", "LPRIV-14"],
  ["LNX-10", "LPRIV-15"],
]);

const MODULE_DISPLAY_NAMES = new Map([
  ["network", "Network"],
  ["ftp", "FTP"],
  ["smb", "SMB"],
  ["remote_access", "SSH"],
  ["http", "HTTP"],
  ["ad", "AD"],
  ["windows", "Windows"],
  ["redis", "Redis"],
  
  ["dns", "DNS"],
  ["nfs", "NFS"],
  ["snmp", "SNMP"],
  ["adcs", "ADCS"],
  ["ad_abuse", "AD abuse"],
  ["password_attacks", "Password attacks"],
  ["pivoting", "Pivoting"],
  ["metasploit", "Metasploit"],
  ["payloads", "Payloads"],
  ["web_advanced", "Advanced web"],
  ["database", "Database"],
  ["oracle", "Oracle"],
  ["postgresql", "PostgreSQL"],
  ["mysql", "MySQL"],
  ["mssql", "MSSQL"],
  ["mail", "Mail"],
  ["rdp", "RDP"],
  ["web_input", "Web input"],
  ["command_continuation", "Command continuation"],
  ["command_shell", "Command shell"],
  ["sql_continuation", "SQL continuation"],
  ["web_upload", "Web upload"],
  ["web_editor", "Web editor"],
  ["access", "Exploit check"],
  ["shell", "Shell"],
  ["transfer", "Transfer"],
  ["local_artifact", "Local artifact"],
  ["smtp", "SMTP"],
  ["tftp", "TFTP"],
  ["rsync", "Rsync"],
  ["docker", "Docker"],
  ["jenkins", "Jenkins"],
  ["ipmi", "IPMI"],
  ["vnc", "VNC"],
  ["ntp", "NTP"],
  ["x11", "X11"],
  ["squid", "Squid"],
  ["generic", "Generic service"],
  ["linux", "Linux"],
  ["linux_privilege", "Linux"],
]);

// Module order is a phase order, not a subject order: each section is the
// question the operator is answering now, and the sections follow the only
// direction a box moves that cannot be undone. A phase either hands forward to
// the next one or returns to service selection; an exhausted lead never pads
// the next phase. Modules sit where they are entered, so a service keeps its
// whole lane in one section and shared steps (payloads, session proof) sit in
// the phase that owns them rather than beside every caller.
const SIDEBAR_SECTIONS = [
  { title: "Enumeration", ids: ["network"] },
  { title: "Services", ids: ["ftp", "smb", "remote_access", "mssql", "database", "oracle", "postgresql", "mysql", "mail", "rdp", "redis", "dns", "nfs", "snmp", "smtp", "tftp", "rsync", "docker", "jenkins", "ipmi", "vnc", "ntp", "x11", "squid", "generic"] },
  { title: "Web", ids: ["http", "web_input", "sql_continuation", "web_upload", "web_editor", "command_continuation", "command_shell", "web_advanced"] },
  { title: "Session", ids: ["payloads", "access", "metasploit"] },
  { title: "Host", ids: ["shell", "transfer", "local_artifact"] },
  { title: "Privilege", ids: ["linux_privilege", "windows"] },
  { title: "Domain", ids: ["ad", "password_attacks", "adcs", "ad_abuse"] },
  { title: "Movement", ids: ["pivoting"] },
];

const PHASE_ORDER = new Map(
  SIDEBAR_SECTIONS.flatMap((section) => section.ids).map((id, index) => [id, index]),
);

// A scan line is the join between enumeration and a lane, so every service
// module carries the ports that open it. The source writes `<SERVICE_PORT>`
// placeholders rather than literal numbers in many commands, so the map is
// authored here instead of scraped from task bodies. It lists the ports that
// change the next action, not every port a product may ever use.
const SERVICE_PORTS = new Map([
  ["ftp", ["21", "990"]],
  ["smb", ["139", "445"]],
  ["remote_access", ["22"]],
  ["http", ["80", "443", "8000", "8080", "8443"]],
  ["ad", ["88", "135", "389", "445"]],
  ["windows", ["135", "139", "445", "5985", "5986"]],
  ["adcs", ["80", "135", "443"]],
  ["ad_abuse", ["88", "389", "445"]],
  ["database", ["1521", "3306", "5432"]],
  ["oracle", ["1521"]],
  ["postgresql", ["5432"]],
  ["mysql", ["3306"]],
  ["mssql", ["1433"]],
  ["transfer", ["445"]],
  ["mail", ["25", "110", "143", "465", "587", "993", "995"]],
  ["rdp", ["3389"]],
  ["redis", ["6379"]],
  ["dns", ["53/udp", "53/tcp"]],
  ["nfs", ["111", "2049"]],
  ["snmp", ["161/udp"]],
  ["smtp", ["25"]],
  ["tftp", ["69/udp"]],
  ["rsync", ["873"]],
  ["docker", ["2375", "2376"]],
  ["jenkins", ["8080"]],
  ["ipmi", ["623/udp"]],
  ["vnc", ["5900"]],
  ["ntp", ["123/udp"]],
  ["x11", ["6000"]],
  ["squid", ["3128"]],
]);

// Modules with no single scan port: the scan itself, phases that run after a
// session exists, and web tasks that inherit the HTTP port.
const PORT_EXEMPT = new Set([
  "network",
  "web_input",
  "web_upload",
  "web_editor",
  "web_advanced",
  "command_continuation",
  "command_shell",
  "sql_continuation",
  "password_attacks",
  "access",
  "shell",
  "transfer",
  "metasploit",
  "payloads",
  "pivoting",
  "local_artifact",
  "linux_privilege",
  "generic",
]);

const PORT_SHAPE = /^(\d{1,5})(?:\/(udp|tcp))?$/;

function portNumber(hint) {
  return Number(PORT_SHAPE.exec(hint)[1]);
}

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
  const { outline = [2, 3], ...metadata } = fields;
  return [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `outline: ${JSON.stringify(outline)}`,
    // With no outline the aside column would stay reserved and empty,
    // narrowing the page for nothing.
    ...(outline === false ? ["aside: false"] : []),
    ...Object.entries(metadata).map(([key, value]) => `${key}: ${JSON.stringify(value)}`),
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

const LONG_CONTEXT = 600;

function moduleContextSection(module, context, { labelled = true } = {}) {
  const name = displayName(module.id);
  return [
    // Long contexts (the four web modules, up to 1,467 characters) may flow
    // into two columns on wide screens; short ones stay a single column.
    `<section class="ledger-module-context"${module.context.length >= LONG_CONTEXT ? ' data-context-size="long"' : ""} ${labelled ? 'aria-labelledby="module-context"' : `aria-label="${escapeHtml(name)} module context"`}>`,
    "",
    ...(labelled
      ? [`<p id="module-context" class="ledger-module-context-label"><span class="ledger-module-context-name">${escapeHtml(name)} module context</span> <span class="ledger-module-context-scope">Applies to every task in this module</span></p>`, ""]
      : []),
    context,
    "",
    "</section>",
    "",
    "",
  ].join("\n");
}

// An outcome list is a bullet list in which every item (at least two) opens
// with an outcome slug such as "http_reported:". NET-05 and 17 other tasks
// route through these lists instead of a result table.
export const OUTCOME_SLUG = /^([a-z][a-z0-9]*(?:_[a-z0-9]+)+):/;

export function isOutcomeList(firstLines) {
  return firstLines.length >= 2 && firstLines.every((line) => OUTCOME_SLUG.test(line));
}

// The first line of each item in each top-level "- " list, outside fences.
// A blank line followed by an unindented non-item line ends a list; a blank
// line between items does not (a loose list is still one list).
function bulletLists(markdown) {
  const lines = normalizeLines(markdown);
  const structural = classifyStructuralLines(lines);
  const lists = [];
  let current = null;
  let blank = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!structural[index]) {
      current = null;
      blank = false;
      continue;
    }
    const item = /^- (.*)$/.exec(line);
    if (item) {
      if (!current) {
        current = [];
        lists.push(current);
      }
      current.push(item[1]);
      blank = false;
    } else if (line.trim() === "") {
      blank = true;
    } else if (current && blank && !/^\s/.test(line)) {
      current = null;
      blank = false;
    }
  }
  return lists;
}

// A table is a decision table when its last column names where to go next
// ("Next", "Next choice", "Next action", "Revisit"). Columns that hold syntax
// to type next ("Next table expression") are reference data, not routes.
export function isDecisionHeaders(headers) {
  const last = String(headers.at(-1) ?? "").trim();
  return /^(?:next|revisit)\b/i.test(last) && !/\bexpression$/i.test(last);
}

function tableHeaderRows(markdown) {
  const lines = normalizeLines(markdown);
  const structural = classifyStructuralLines(lines);
  const headers = [];
  for (let index = 0; index + 1 < lines.length; index += 1) {
    if (!structural[index] || !/^\s*\|/.test(lines[index])) continue;
    if (!/^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(lines[index + 1])) continue;
    headers.push(
      lines[index]
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim()),
    );
  }
  return headers;
}

// Counts fenced blocks, so a plate's page anchor (cmd-1, cmd-2, ...) can be
// predicted from the sections rendered before it.
function fenceCount(markdown) {
  let count = 0;
  let fence = null;
  for (const line of normalizeLines(markdown)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence === null) {
      if (marker) {
        fence = { kind: marker[1][0], length: marker[1].length };
        count += 1;
      }
    } else if (
      marker &&
      marker[1][0] === fence.kind &&
      marker[1].length >= fence.length &&
      marker[2].trim() === ""
    ) {
      fence = null;
    }
  }
  return count;
}

function proseWordCount(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[\[\]#*`()<>]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

async function loadOperatorModule(sourceRoot) {
  const directory = path.join(sourceRoot, "content/linux-privilege");
  const names = (await readdir(directory))
    .filter((name) => /^lpriv-\d{2}\.md$/.test(name))
    .sort();
  const expected = Array.from({ length: 20 }, (_, index) =>
    `lpriv-${String(index + 1).padStart(2, "0")}.md`,
  );
  if (JSON.stringify(names) !== JSON.stringify(expected)) {
    throw new Error("Linux privilege operator source must contain exactly LPRIV-01 through LPRIV-20");
  }

  const tasks = [];
  for (const [index, name] of names.entries()) {
    const markdown = (await readFile(path.join(directory, name), "utf8")).trim();
    const lines = normalizeLines(markdown);
    const heading = lines[0].match(/^# (LPRIV-\d{2})\. (.+)$/);
    const expectedId = `LPRIV-${String(index + 1).padStart(2, "0")}`;
    if (!heading || heading[1] !== expectedId) {
      throw new Error(`${name} must start with "# ${expectedId}. <title>"`);
    }
    const working = lines.slice(1).join("\n").trim();
    if (!working.startsWith("**Run this when:**")) {
      throw new Error(`${expectedId} must start with a Run this when entry condition`);
    }
    if (!working.includes("**Look for:**") || !working.includes("**If found:**")) {
      throw new Error(`${expectedId} must include Look for and If found guidance`);
    }
    if (fenceCount(working) > 4) {
      throw new Error(`${expectedId} exceeds four command groups`);
    }
    if (proseWordCount(working) > 600) {
      throw new Error(`${expectedId} exceeds 600 prose words`);
    }
    tasks.push({
      id: expectedId,
      title: heading[2],
      moduleId: OPERATOR_MODULE_ID,
      working,
      explanation: "",
    });
  }

  return {
    id: OPERATOR_MODULE_ID,
    context: "",
    tasks,
  };
}

// Landmarks for the task header's jump chips, derived from the page's
// structure. Jumps target the working section, never the explanations: a
// browser-only step such as WEB-09 has no command jump at all. Module context
// renders first, so its blocks and tables come before the working section's.
// Returns frontmatter fields; the header renders outside <main>.
function taskLandmarks(task, module) {
  const beforeExplanations = [module.context, task.working].join("\n");
  const optional = /^\*\*Optional\.\*\*/m.test(task.working) || /\(optional\)$/.test(task.title);
  return {
    modulePosition: {
      index: module.tasks.findIndex(({ id }) => id === task.id) + 1,
      total: module.tasks.length,
    },
    firstCommand: fenceCount(task.working) > 0 ? `cmd-${fenceCount(module.context) + 1}` : null,
    ...(optional ? { optional: true } : {}),
    resultsKind: tableHeaderRows(beforeExplanations).some(isDecisionHeaders)
      ? "table"
      : bulletLists(beforeExplanations).some(isOutcomeList)
        ? "outcomes"
        : null,
  };
}

function buildTaskBody(task, module, taskIds, terminalStates) {
  const title = `${task.id}. ${task.title}`;
  const sections = [module.context, task.working, task.explanation].map((markdown) =>
    renderSection(markdown, taskIds, terminalStates),
  );
  const [context, working, explanation] = sections;
  const body = `# ${title}\n\n${module.context ? moduleContextSection(module, context.markdown, { labelled: false }) : ""}${working.markdown}\n\n<section class="task-notes" aria-labelledby="explanations-and-troubleshooting">\n\n## Explanations and troubleshooting\n\n${explanation.markdown}\n\n</section>\n`;
  return { title, body, references: sections.flatMap(({ references }) => references) };
}

function taskPage(task, module, { title, body }, route, position, routes) {
  const brief = ({ id, title: stationTitle }) => ({
    id,
    title: stationTitle,
    module: routes[id].module.title,
  });
  return `${frontmatter(title, `OSCP master checklist task ${task.id}`, {
    taskId: task.id,
    moduleId: module.id,
    moduleTitle: displayName(module.id),
    pageClass: "task-page",
    outline: false,
    position,
    ...taskLandmarks(task, module),
    routesOut: route.outbound.map(brief),
    routeStops: route.terminalStates,
    routesIn: route.inbound.map(brief),
  })}${body}`;
}

function operatorReferences(task, taskIds) {
  const references = [];
  for (const [id] of task.working.matchAll(/\b([A-Z][A-Z0-9]*-\d{2})\b/g)) {
    if (taskIds.has(id)) references.push({ kind: "task", id });
  }
  return references;
}

function operatorTaskPage(task, module, route, index, routes) {
  const brief = ({ id, title: stationTitle }) => ({
    id,
    title: stationTitle,
    module: routes[id].module.title,
  });
  const previous = module.tasks[index - 1];
  const next = module.tasks[index + 1];
  const pager = (candidate) =>
    candidate
      ? {
          text: `${candidate.id}. ${candidate.title}`,
          link: taskLink(candidate.id),
        }
      : false;
  const body = escapeVuePlaceholders(task.working);
  return `${frontmatter(`${task.id}. ${task.title}`, `Linux privilege escalation operator page ${task.id}`, {
    taskId: task.id,
    moduleId: module.id,
    moduleTitle: OPERATOR_MODULE_TITLE,
    pageClass: "task-page field-page operator-page",
    outline: false,
    operatorPage: true,
    modulePosition: { index: index + 1, total: module.tasks.length },
    firstCommand: fenceCount(task.working) ? "cmd-1" : null,
    resultsKind: null,
    routesOut: route.outbound.map(brief),
    routeStops: [],
    routesIn: route.inbound.map(brief),
    prev: pager(previous),
    next: pager(next),
  })}# ${task.id}. ${task.title}\n\n${body}\n`;
}

function redirectPage(id, target) {
  return `${frontmatter(`${id} moved`, `${id} now routes to ${target}`, {
    layout: false,
    search: false,
    prev: false,
    next: false,
    redirectTarget: `./${target.toLowerCase()}.html`,
  })}<main class="compatibility-redirect">

# ${id} moved

This retired URL now maps to [${target}](./${target.toLowerCase()}.md).

</main>\n`;
}

function modulePage(module, taskIds, terminalStates) {
  const name = displayName(module.id);
  // Each row keeps the exact "ID. Title" text; spans only align the ID column.
  const taskList = module.tasks
    .map(
      ({ id, title }) =>
        `- [<span class="module-task-id">${id}.</span> <span class="module-task-title">${escapeHtml(title)}</span>](../tasks/${id.toLowerCase()})`,
    )
    .join("\n");
  const context = module.context
    ? moduleContextSection(
        module,
        renderSection(module.context, taskIds, terminalStates, { linkPrefix: "../tasks/" }).markdown,
      )
    : "";
  return `${frontmatter(name, `${name} module in the OSCP master checklist`, {
    pageClass: "module-page",
    outline: false,
    prev: false,
    next: false,
    moduleId: module.id,
    moduleTitle: name,
    moduleTaskCount: module.tasks.length,
  })}# ${name}\n\n${context}## Tasks\n\n${taskList}\n`;
}

// The source opens with "How to use this edition", including the default box
// route. It is published verbatim, with route marks linked like task pages.
// A leading export comment is invisible in rendered Markdown and is dropped.
function startPage(checklist, taskIds, terminalStates) {
  const preface = checklist.preface.replace(/^<!--[\s\S]*?-->\s*/, "");
  const { markdown } = renderSection(preface, taskIds, terminalStates, {
    linkPrefix: "./tasks/",
  });
  return `${frontmatter("How to use this edition", "The default box route and reading guidance from the OSCP master checklist", {
    pageClass: "start-page",
    prev: false,
    next: false,
  })}${markdown}\n`;
}

// Rows of the source's "Default box route" table whose decision opens with a
// task route: each row's When and Decision cells, verbatim.
export function boxRouteEntries(preface) {
  const lines = normalizeLines(preface);
  const heading = lines.findIndex((line) => line.trim() === "## Default box route");
  if (heading === -1) throw new Error("Missing Default box route table in the preface");
  const rows = [];
  let inTable = false;
  for (const line of lines.slice(heading + 1)) {
    if (!/^\s*\|/.test(line)) {
      if (inTable) break;
      continue;
    }
    inTable = true;
    const cells = line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
    if (cells[0] === "When" || /^:?-{3,}/.test(cells[0])) continue;
    rows.push({ when: cells[0], decision: cells[1] });
  }
  return rows.filter(({ decision }) => /^\*\*[A-Z][A-Z0-9]*-\d{2}/.test(decision));
}

// The home page's "Where to enter" sheet, included into site/index.md. Each
// row quotes the box route's When cell and Decision cell verbatim, with route
// marks linked, then lists every task the decision names with its exact title.
// Links are relative to this file; VitePress rebases them when it includes it.
function whereToEnter(checklist, taskIds, terminalStates) {
  const titles = new Map(checklist.tasks.map(({ id, title }) => [id, title]));
  const rows = boxRouteEntries(checklist.preface).map(({ when, decision }) => {
    const { markdown } = renderSection(decision, taskIds, terminalStates, {
      linkPrefix: "../../generated/tasks/",
    });
    const ids = [...new Set([...decision.matchAll(/[A-Z][A-Z0-9]*-\d{2}/g)].map(([id]) => id))].filter((id) =>
      titles.has(id),
    );
    const tasks = ids
      .map(
        (id) =>
          `- [<span class="enter-id">${id}</span> <span class="enter-title">${escapeHtml(titles.get(id))}</span>](../../generated/tasks/${id.toLowerCase()}.md)`,
      )
      .join("\n");
    return [
      '<div class="enter-row">',
      "",
      `${escapeVuePlaceholders(when)} {.enter-when}`,
      "",
      `${markdown} {.enter-decision}`,
      "",
      tasks,
      "{.enter-tasks}",
      "",
      "</div>",
    ].join("\n");
  });
  return `<!-- Generated by scripts/checklist.mjs from the source's Default box route. Do not edit. -->\n\n<div class="enter-sheet">\n\n${rows.join("\n\n")}\n\n</div>\n`;
}

// The home page's module summary, included into site/index.md. It is generated
// from the same phase list as the sidebar, so the directory cannot keep an
// order the navigation has already left behind.
function moduleDirectory(publicModules) {
  const moduleById = new Map(publicModules.map((module) => [module.id, module]));
  const blocks = SIDEBAR_SECTIONS.map((section) => {
    const rows = section.ids.map((id) => {
      const module = moduleById.get(id);
      const ports = (SERVICE_PORTS.get(module.id) ?? []).join(" · ") || "—";
      return `| [${displayName(module.id)}](../../generated/modules/${module.id}.md) | ${ports} | ${module.tasks.length} |`;
    });
    return [`### ${section.title}`, "", "| Module | Ports | Tasks |", "| --- | --- | ---: |", ...rows].join("\n");
  });
  return `<!-- Generated by scripts/checklist.mjs from the sidebar's phase list. Do not edit. -->\n\n${blocks.join("\n\n")}\n`;
}

// The port index is the reverse lookup for a scan line: port to the module that
// opens its lane. One port can own several modules, so a row lists them all in
// phase order.
function portIndex(publicModules) {
  const moduleById = new Map(publicModules.map((module) => [module.id, module]));
  const byPort = new Map();
  for (const [id, hints] of SERVICE_PORTS) {
    for (const hint of hints) {
      if (!byPort.has(hint)) byPort.set(hint, []);
      byPort.get(hint).push(id);
    }
  }
  const rows = [...byPort.entries()]
    .sort(([a], [b]) => portNumber(a) - portNumber(b) || a.localeCompare(b))
    .map(([hint, ids]) => {
      const [, port, proto] = PORT_SHAPE.exec(hint);
      const links = ids
        .sort((a, b) => PHASE_ORDER.get(a) - PHASE_ORDER.get(b))
        .map((id) => `[${displayName(moduleById.get(id).id)}](../../generated/modules/${id}.md)`)
        .join(", ");
      return `| ${port} | ${(proto ?? "tcp").toUpperCase()} | ${links} |`;
    });
  return `<!-- Generated by scripts/checklist.mjs from the service port map. Do not edit. -->\n\n| Port | Proto | Topic |\n| ---: | --- | --- |\n${rows.join("\n")}\n`;
}

function buildRoutes(tasks, moduleById, referencesByTask) {
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const station = (id) => ({ id, title: taskById.get(id).title, link: taskLink(id) });
  const inbound = new Map(tasks.map(({ id }) => [id, []]));
  const routes = {};

  for (const task of tasks) {
    const module = moduleById.get(task.moduleId);
    const references = referencesByTask.get(task.id);
    const outbound = [
      ...new Set(
        references
          .filter(({ kind }) => kind === "task")
          .map(({ id }) => LNX_REDIRECTS.get(id) ?? id)
          .filter((id) => id !== task.id && taskById.has(id)),
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
  for (const task of tasks) {
    routes[task.id].inbound = inbound.get(task.id).map(station);
  }
  return routes;
}

function buildCatalog(checklist, snapshotSha256, sourceChecklist = checklist) {
  // The catalog follows the sidebar's phase order, so the directory and the
  // navigation read the same way. Tasks keep their order inside a module.
  const rank = (moduleId) => PHASE_ORDER.get(moduleId) ?? PHASE_ORDER.size;
  const modules = [...checklist.modules].sort((a, b) => rank(a.id) - rank(b.id));
  const tasks = [...checklist.tasks].sort((a, b) => rank(a.moduleId) - rank(b.moduleId));
  return {
    edition: checklist.edition,
    sourceDigest: checklist.sourceDigest,
    snapshotSha256,
    moduleCount: checklist.modules.length,
    taskCount: checklist.tasks.length,
    sourceModuleCount: sourceChecklist.modules.length,
    sourceTaskCount: sourceChecklist.tasks.length,
    modules: modules.map((module) => ({
      id: module.id,
      title: displayName(module.id),
      link: moduleLink(module.id),
      ports: SERVICE_PORTS.get(module.id) ?? [],
      hasContext: module.context.length > 0,
      tasks: module.tasks.map(({ id, title }) => ({ id, title, link: taskLink(id) })),
    })),
    tasks: tasks.map(({ id, title, moduleId }) => ({
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
  const operatorModule = await loadOperatorModule(sourceRoot);
  const publicModules = [
    ...checklist.modules.filter(({ id }) => !RETIRED_MODULE_IDS.has(id)),
    operatorModule,
  ];
  const publicTasks = [...publicModules.flatMap(({ tasks }) => tasks)].sort(
    (a, b) =>
      (PHASE_ORDER.get(a.moduleId) ?? PHASE_ORDER.size) -
      (PHASE_ORDER.get(b.moduleId) ?? PHASE_ORDER.size),
  );
  const publicChecklist = {
    ...checklist,
    modules: publicModules,
    tasks: publicTasks,
  };
  for (const module of publicModules) {
    if (!PORT_EXEMPT.has(module.id) && !SERVICE_PORTS.has(module.id)) {
      throw new Error(`Service module ${module.id} has no port hint`);
    }
  }
  for (const [id, hints] of SERVICE_PORTS) {
    if (!publicModules.some((module) => module.id === id)) {
      throw new Error(`Port hint names unknown module ${id}`);
    }
    for (const hint of hints) {
      const match = PORT_SHAPE.exec(hint);
      if (!match || Number(match[1]) < 1 || Number(match[1]) > 65535) {
        throw new Error(`Bad port hint ${hint} for ${id}`);
      }
    }
  }
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

  const taskIds = new Set([
    ...checklist.tasks.map(({ id }) => id),
    ...publicTasks.map(({ id }) => id),
  ]);
  const terminalStates = new Set(manifest.terminalStates);
  const moduleById = new Map(publicModules.map((module) => [module.id, module]));
  const referencesByTask = new Map();
  const bodies = new Map();
  for (const task of publicTasks) {
    if (task.moduleId === OPERATOR_MODULE_ID) {
      referencesByTask.set(task.id, operatorReferences(task, taskIds));
      continue;
    }
    const built = buildTaskBody(
      task,
      moduleById.get(task.moduleId),
      taskIds,
      terminalStates,
    );
    referencesByTask.set(task.id, built.references);
    bodies.set(task.id, built);
  }
  const routes = buildRoutes(publicTasks, moduleById, referencesByTask);
  for (const [index, task] of publicTasks.entries()) {
    const module = moduleById.get(task.moduleId);
    await writeText(
      path.join(generatedRoot, "tasks", `${task.id.toLowerCase()}.md`),
      task.moduleId === OPERATOR_MODULE_ID
        ? operatorTaskPage(
            task,
            module,
            routes[task.id],
            module.tasks.findIndex(({ id }) => id === task.id),
            routes,
          )
        : taskPage(
            task,
            module,
            bodies.get(task.id),
            routes[task.id],
            { index: index + 1, total: publicTasks.length },
            routes,
          ),
    );
  }
  for (const [id, target] of LNX_REDIRECTS) {
    await writeText(
      path.join(generatedRoot, "tasks", `${id.toLowerCase()}.md`),
      redirectPage(id, target),
    );
  }
  await writeText(path.join(generatedRoot, "start.md"), startPage(checklist, taskIds, terminalStates));
  for (const module of publicModules) {
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

  const moduleGroup = (module) => ({
    text: displayName(module.id),
    collapsed: true,
    modulePorts: SERVICE_PORTS.get(module.id) ?? [],
    items: module.tasks.map(({ id, title }) => ({
      text: `${id} · ${title}`,
      link: `/generated/tasks/${id.toLowerCase()}`,
    })),
  });
  for (const section of SIDEBAR_SECTIONS) {
    for (const id of section.ids) {
      if (!publicModules.some((module) => module.id === id)) {
        throw new Error(`Sidebar section ${section.title} names unknown module ${id}`);
      }
    }
  }
  const sidebar = SIDEBAR_SECTIONS.map((section) => ({
    text: section.title,
    collapsed: true,
    items: section.ids
      .map((id) => publicModules.find((module) => module.id === id))
      .filter(Boolean)
      .map(moduleGroup),
  }));
  const grouped = new Set(sidebar.flatMap((section) => section.items.map((group) => group.text)));
  for (const module of publicModules) {
    if (!grouped.has(displayName(module.id))) throw new Error(`Sidebar section missing ${module.id}`);
  }
  const sectioned = sidebar.flatMap((section) => section.items.map((group) => group.text));
  if (sectioned.length !== new Set(sectioned).size) {
    throw new Error("A module is listed under more than one sidebar section");
  }
  const contentManifest = {
    edition: checklist.edition,
    sourceDigest: checklist.sourceDigest,
    snapshotSha256,
    taskCount: publicTasks.length,
    moduleCount: publicModules.length,
    sourceTaskCount: checklist.tasks.length,
    sourceModuleCount: checklist.modules.length,
    modules: publicModules.map((module) => ({
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
      path.join(configGeneratedRoot, "where-to-enter.md"),
      whereToEnter(checklist, taskIds, terminalStates),
    ),
    writeText(
      path.join(configGeneratedRoot, "sidebar.json"),
      `${JSON.stringify(sidebar, null, 2)}\n`,
    ),
    writeText(
      path.join(configGeneratedRoot, "module-directory.md"),
      moduleDirectory(publicModules),
    ),
    writeText(
      path.join(configGeneratedRoot, "port-index.md"),
      portIndex(publicModules),
    ),
    writeText(
      path.join(configGeneratedRoot, "routes.json"),
      `${JSON.stringify(routes, null, 2)}\n`,
    ),
    writeText(
      path.join(configGeneratedRoot, "catalog.json"),
      `${JSON.stringify(buildCatalog(publicChecklist, snapshotSha256, checklist), null, 2)}\n`,
    ),
  ]);

  return {
    edition: checklist.edition,
    moduleCount: publicModules.length,
    taskCount: publicTasks.length,
    sourceModuleCount: checklist.modules.length,
    sourceTaskCount: checklist.tasks.length,
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
    `Generated ${result.taskCount} public tasks across ${result.moduleCount} public modules from ${result.edition}.\n`,
  );
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await main();
}
