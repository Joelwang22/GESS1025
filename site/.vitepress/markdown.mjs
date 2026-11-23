// Build-time presentation for checklist Markdown. Every rule here adds classes,
// attributes, or wrapper elements around text that is already present. None of
// them changes, removes, or reorders source text, and none runs in the browser.

// An operator blank inside a command or inline code: `<IP_ADDRESS>`,
// `<supplied-domain/user>`, `<observed-unit.service>`. A literal such as
// `<0.4096>` starts with a digit and is not a blank.
import { isDecisionHeaders } from "../../scripts/checklist.mjs";

export const BLANK = /<[A-Za-z][A-Za-z0-9_./-]*>/g;

// Command languages whose angle-bracket tokens are operator blanks. Source
// languages (Python, HTML, PHP) can contain real tags, so they are left alone.
const BLANK_LANGUAGES = new Set([
  "bash",
  "sh",
  "shell",
  "shellscript",
  "zsh",
  "powershell",
  "ps1",
  "cmd",
  "bat",
  "sql",
  "text",
  "txt",
  "",
]);

const TASK_HREF = /^(?:\.\/|\.\.\/tasks\/|\.\.\/generated\/tasks\/|\.\/tasks\/|\.\/generated\/tasks\/|\/generated\/tasks\/)([a-z][a-z0-9]*-\d{2})(?:\.md|\.html)?$/;
const TASK_TEXT = /^(?:[A-Z][A-Z0-9]*-\d{2}|\d{2})$/;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function blanksIn(code) {
  return [...new Set([...code.matchAll(BLANK)].map(([match]) => match))];
}

// The plate shows the fence's own language word, exactly as the source wrote it.
export function languageLabel(lang) {
  return lang || "text";
}

function wrapBlanks(text) {
  let html = "";
  let last = 0;
  for (const match of text.matchAll(BLANK)) {
    html += escapeHtml(text.slice(last, match.index));
    html += `<span class="blank">${escapeHtml(match[0])}</span>`;
    last = match.index + match[0].length;
  }
  return html + escapeHtml(text.slice(last));
}

// Shiki decorations wrap each blank in a span without changing the code text.
export function blankDecorations() {
  return {
    name: "checklist:blanks",
    preprocess(code, options) {
      if (!BLANK_LANGUAGES.has(String(options.lang ?? "").toLowerCase())) return;
      const decorations = [...code.matchAll(BLANK)].map((match) => ({
        start: match.index,
        end: match.index + match[0].length,
        properties: { class: "blank" },
      }));
      if (decorations.length) {
        options.decorations = [...(options.decorations ?? []), ...decorations];
      }
    },
  };
}

// The command plate header replaces VitePress's hover-only copy button. The
// copy control is always visible; the copied text is the exact rendered code.
function commandHeader(lang, content) {
  const label = languageLabel(lang);
  const blanks = BLANK_LANGUAGES.has(lang) ? blanksIn(content) : [];
  const fill = blanks.length
    ? `<p class="cmd-fill"><span class="cmd-fill-label">Fill in</span> ${blanks
        .map((blank) => `<code class="blank">${escapeHtml(blank)}</code>`)
        .join(" ")}</p>`
    : "";
  // Row one never wraps its controls away from the language label; the blank
  // list gets its own row so Copy stays at the top right at every width.
  return `<div class="cmd-head"><div class="cmd-bar"><span class="cmd-lang">${escapeHtml(label)}</span> <span class="cmd-actions"><span class="cmd-status" role="status"></span><button type="button" class="cmd-wrap" aria-pressed="true" title="Wrap long lines, or turn off to scroll them sideways">Wrap lines</button> <button type="button" class="cmd-copy" title="Copy this ${escapeHtml(label)} block exactly"><span class="cmd-copy-text" aria-live="polite">Copy</span></button></span></div> ${fill}</div>`;
}

function patchFence(md) {
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const html = fence(tokens, index, options, env, self);
    const lang = /^<div class="language-([^\s"]*)/.exec(html)?.[1]?.toLowerCase() ?? "";
    const replaced = html.replace(
      /<button title="[^"]*" data-copied="[^"]*" class="copy"><\/button><span class="lang">[^<]*<\/span>/,
      commandHeader(lang, tokens[index].content),
    );
    // Each plate gets a stable in-page anchor (cmd-1, cmd-2, ...) for the
    // task's "First command" jump.
    const holder = env && typeof env === "object" ? env : {};
    holder.checklistCommandCount = (holder.checklistCommandCount ?? 0) + 1;
    return replaced.replace(
      /^<div class="language-([^"]*)"/,
      `<div class="cmd-plate language-$1" id="cmd-${holder.checklistCommandCount}"`,
    );
  };
}

function patchInlineCode(md) {
  const codeInline = md.renderer.rules.code_inline;
  md.renderer.rules.code_inline = (tokens, index, options, env, self) => {
    const token = tokens[index];
    if (!blanksIn(token.content).length) return codeInline(tokens, index, options, env, self);
    return `<code${self.renderAttrs(token)}>${wrapBlanks(token.content)}</code>`;
  };
}

function patchLinks(md, taskTitles) {
  const linkOpen =
    md.renderer.rules.link_open ??
    ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));
  md.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const token = tokens[index];
    const href = token.attrGet("href") ?? "";
    const id = TASK_HREF.exec(href)?.[1]?.toUpperCase();
    const text = tokens[index + 1];
    if (
      id &&
      taskTitles.has(id) &&
      text?.type === "text" &&
      TASK_TEXT.test(text.content) &&
      tokens[index + 2]?.type === "link_close"
    ) {
      token.attrJoin("class", /^\d{2}$/.test(text.content) ? "route route-short" : "route");
      token.attrSet("title", `${id}: ${taskTitles.get(id)}`);
    }
    return linkOpen(tokens, index, options, env, self);
  };
}

// Terminal states become stop marks; plain task IDs outside links become
// call-number marks. Both wrap existing text in a span.
function markReferences(md, terminalStates, taskTitles) {
  const states = [...terminalStates].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `(?<![A-Za-z0-9-])(${[...states, "[A-Z][A-Z0-9]*-\\d{2}"].join("|")})(?![A-Za-z0-9-])`,
    "g",
  );
  md.core.ruler.push("checklist_reference_marks", (state) => {
    for (const block of state.tokens) {
      if (block.type !== "inline" || !block.children) continue;
      const children = [];
      let linkDepth = 0;
      for (const child of block.children) {
        if (child.type === "link_open") linkDepth += 1;
        if (child.type === "link_close") linkDepth -= 1;
        if (child.type !== "text" || linkDepth > 0 || !pattern.test(child.content)) {
          children.push(child);
          continue;
        }
        pattern.lastIndex = 0;
        let last = 0;
        const push = (type, content) => {
          const token = new state.Token(type, "", 0);
          token.content = content;
          children.push(token);
        };
        for (const match of child.content.matchAll(pattern)) {
          const value = match[1];
          const kind = terminalStates.has(value)
            ? "stop"
            : taskTitles.has(value)
              ? "task-id"
              : null;
          if (!kind) continue;
          if (match.index > last) push("text", child.content.slice(last, match.index));
          push(
            "html_inline",
            kind === "stop"
              ? `<span class="stop" title="Stop state named by the checklist">`
              : `<span class="task-id">`,
          );
          push("text", value);
          push("html_inline", "</span>");
          last = match.index + value.length;
        }
        if (last < child.content.length) push("text", child.content.slice(last));
      }
      block.children = children;
    }
  });
}

function inlineText(token) {
  return (token?.children ?? [])
    .filter(({ type }) => type === "text" || type === "code_inline")
    .map(({ content }) => content)
    .join("")
    .trim();
}

// Tables gain a decision class when their last header names the next step,
// and every cell carries its column header for the stacked narrow layout.
function markTables(md) {
  md.core.ruler.push("checklist_tables", (state) => {
    const tokens = state.tokens;
    for (let index = 0; index < tokens.length; index += 1) {
      if (tokens[index].type !== "table_open") continue;
      const headers = [];
      let cursor = index + 1;
      for (; tokens[cursor].type !== "thead_close"; cursor += 1) {
        if (tokens[cursor].type === "th_open") headers.push(inlineText(tokens[cursor + 1]));
      }
      if (isDecisionHeaders(headers)) {
        tokens[index].attrJoin("class", "decision");
        // The first decision table on a page is the "Result table" jump target.
        if (!state.env.checklistResultsMarked) {
          tokens[index].attrSet("id", "results");
          state.env.checklistResultsMarked = true;
        }
      }
      tokens[index].attrJoin("class", `cols-${headers.length}`);
      let column = 0;
      for (; tokens[cursor].type !== "table_close"; cursor += 1) {
        if (tokens[cursor].type === "tr_open") column = 0;
        if (tokens[cursor].type === "td_open") {
          if (headers[column]) tokens[cursor].attrSet("data-label", headers[column]);
          column += 1;
        }
      }
      index = cursor;
    }
  });
}

// Splits "NET-01. Check connectivity" into a call-number stamp and a title.
// Runs after the anchor plugin, so heading IDs are unchanged.
function markTaskHeading(md) {
  md.core.ruler.push("checklist_task_heading", (state) => {
    const tokens = state.tokens;
    const open = tokens.findIndex(({ type, tag }) => type === "heading_open" && tag === "h1");
    if (open === -1) return;
    const inline = tokens[open + 1];
    const first = inline.children?.[0];
    const match = first?.type === "text" && /^([A-Z][A-Z0-9]*-\d{2})(\.) /.exec(first.content);
    if (!match) return;
    // The source period stays in the heading text, just outside the stamp box.
    const stamp = new state.Token("html_inline", "", 0);
    stamp.content = `<span class="h-id">${match[1]}</span><span class="h-dot">${match[2]}</span> `;
    first.content = first.content.slice(match[0].length);
    inline.children.unshift(stamp);
    tokens[open].attrJoin("class", "task-title");
  });
}

function splitLeadingText(state, inline, length, className) {
  const first = inline.children[0];
  const label = new state.Token("html_inline", "", 0);
  label.content = `<span class="${className}">`;
  const text = new state.Token("text", "", 0);
  text.content = first.content.slice(0, length);
  const close = new state.Token("html_inline", "", 0);
  close.content = "</span>";
  first.content = first.content.slice(length);
  inline.children.unshift(label, text, close);
}

// "Enter when:" and "Question:" paragraphs become labelled cue rows. The label
// is wrapped in a span; the words and their order are unchanged.
const CUE = /^(Enter when:|Question:)/;

function markCues(md) {
  md.core.ruler.push("checklist_cues", (state) => {
    const tokens = state.tokens;
    for (let index = 0; index + 1 < tokens.length; index += 1) {
      if (tokens[index].type !== "paragraph_open" || tokens[index].hidden) continue;
      const inline = tokens[index + 1];
      const first = inline.children?.[0];
      const match = first?.type === "text" && CUE.exec(first.content);
      if (!match) continue;
      tokens[index].attrJoin("class", match[1] === "Question:" ? "cue cue-question" : "cue cue-enter");
      splitLeadingText(state, inline, match[1].length, "cue-label");
    }
  });
}

// Bullet lists in which every item opens with an outcome slug ("http_reported:")
// become ruled outcome rows with the slug set as a label.
const OUTCOME = /^([a-z][a-z0-9]*(?:_[a-z0-9]+)+):/;

function markOutcomeLists(md) {
  md.core.ruler.push("checklist_outcomes", (state) => {
    const tokens = state.tokens;
    for (let index = 0; index < tokens.length; index += 1) {
      if (tokens[index].type !== "bullet_list_open") continue;
      const level = tokens[index].level;
      const items = [];
      let cursor = index + 1;
      for (; cursor < tokens.length; cursor += 1) {
        const token = tokens[cursor];
        if (token.type === "bullet_list_close" && token.level === level) break;
        if (token.type === "list_item_open" && token.level === level + 1) {
          items.push(tokens.slice(cursor + 1).find(({ type }) => type === "inline"));
        }
      }
      const slugged = items.filter((inline) => {
        const first = inline?.children?.[0];
        return first?.type === "text" && OUTCOME.test(first.content);
      });
      if (items.length >= 2 && slugged.length === items.length) {
        tokens[index].attrJoin("class", "outcomes");
        for (const inline of items) {
          splitLeadingText(state, inline, OUTCOME.exec(inline.children[0].content)[1].length, "outcome-slug");
        }
      }
      index = cursor;
    }
  });
}

export function checklistMarkdown({ terminalStates, taskTitles }) {
  return {
    codeTransformers: [blankDecorations()],
    config(md) {
      patchFence(md);
      patchInlineCode(md);
      patchLinks(md, taskTitles);
      markTaskHeading(md);
      markCues(md);
      markOutcomeLists(md);
      markReferences(md, terminalStates, taskTitles);
      markTables(md);
    },
  };
}
