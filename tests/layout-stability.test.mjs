// Layout stability: the page must not shift when the reader interacts with it.
// These checks pin the specific causes that used to move content: the
// scrollbar gutter, a toggle that mounted after hydration, a nav bar that
// reflowed on collapse, a local nav that filled in late, a Find task field
// that narrowed and results that pushed the tree down, and a fold with no
// motion between its two layouts.
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { parseChecklist } from "../scripts/checklist.mjs";

import { FOLD_FOLLOWERS, toMilliseconds } from "../site/.vitepress/theme/sidebar-fold.js";

const themeDir = path.resolve(import.meta.dirname, "../site/.vitepress/theme");
const read = (relative) => readFile(path.join(themeDir, relative), "utf8");

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
      if (prelude.startsWith("@media") || prelude.startsWith("@supports")) {
        media = prelude;
        continue;
      }
      const end = source.indexOf("}", index);
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

async function themeRules() {
  const files = (await readdir(themeDir)).filter((name) => name.endsWith(".css"));
  const rules = [];
  for (const file of files) rules.push(...cssRules(await read(file)).map((rule) => ({ ...rule, file })));
  return rules;
}

const DESKTOP = "@media (min-width: 960px)";

test("the root reserves the scrollbar gutter on every page", async () => {
  const html = (await themeRules()).find((rule) => rule.media === null && rule.selectors.includes("html") && /scrollbar-gutter/.test(rule.body));
  assert.ok(html, "html sets scrollbar-gutter");
  assert.equal(declaration(html.body, "scrollbar-gutter"), "stable");
});

test("the sidebar toggle's slot is server-rendered and holds its width", async () => {
  const toggle = await read("components/SidebarToggle.vue");
  const template = toggle.slice(toggle.indexOf("<template>"));
  // The slot wraps the button and carries no condition of its own; only the
  // button waits for the desktop media query after hydration.
  assert.match(template, /<span class="sidebar-toggle-slot">\s*<button\s+v-if="desktop"/);
  assert.doesNotMatch(template, /<span class="sidebar-toggle-slot"[^>]*v-(?:if|show)/);
  const slot = (await themeRules()).find((rule) => rule.media === DESKTOP && rule.selectors.includes(".sidebar-toggle-slot"));
  assert.ok(slot, "desktop rule for the toggle slot");
  assert.equal(declaration(slot.body, "min-width"), "var(--rb-toggle-size)");
  const button = (await themeRules()).find((rule) => rule.media === null && rule.selectors.includes(".sidebar-toggle"));
  assert.equal(declaration(button.body, "width"), "var(--rb-toggle-size)");
  assert.equal(declaration(button.body, "height"), "var(--rb-toggle-size)");
});

test("collapsing the sidebar leaves the nav bar's layout alone", async () => {
  const collapsed = (await themeRules()).filter((rule) => rule.selectors.some((selector) => selector.startsWith("html.sidebar-collapsed")));
  for (const rule of collapsed) {
    for (const selector of rule.selectors.filter((s) => /VPNavBar/.test(s))) {
      // Only the surface offset may change in the bar: no title column,
      // search or control may resize or move.
      assert.doesNotMatch(selector, /\.title|VPNavBarTitle|search|content/, selector);
      assert.doesNotMatch(rule.body, /(?:min-|max-)?width|margin|padding/, selector);
    }
  }
  const surface = collapsed.find((rule) => rule.selectors.includes("html.sidebar-collapsed .Layout .VPNavBar.has-sidebar"));
  assert.equal(declaration(surface.body, "--vp-nav-col-offset"), "0px");
});

test("the local navigation follows the sidebar fold without forcing an empty bar", async () => {
  const rules = await themeRules();
  const folded = rules.find((rule) => rule.media === DESKTOP && rule.selectors.includes("html.sidebar-collapsed .Layout .VPLocalNav.has-sidebar"));
  assert.ok(folded, "the local nav drops the sidebar offset when folded");
  assert.equal(declaration(folded.body, "padding-inline-start"), "0");
  const band = "@media (min-width: 960px) and (max-width: 1279px)";
  const empty = rules.find((rule) => rule.media === band && rule.selectors.includes(".Layout .VPLocalNav.has-sidebar.empty"));
  assert.equal(empty, undefined, "task pages do not reserve space for an empty outline bar");
});

test("the fold moves sidebar, nav surface and column on one shared timing", async () => {
  const [tokens, rules, fold] = await Promise.all([read("tokens.css"), themeRules(), read("sidebar-fold.js")]);
  for (const name of ["show-duration", "show-easing", "hide-duration", "hide-easing"]) {
    assert.match(tokens, new RegExp(`--rb-fold-${name}:`), name);
  }
  // Hiding is an exit and must be quicker than showing.
  const show = toMilliseconds(tokens.match(/--rb-fold-show-duration:\s*([^;]+);/)[1]);
  const hide = toMilliseconds(tokens.match(/--rb-fold-hide-duration:\s*([^;]+);/)[1]);
  assert.ok(hide > 0 && hide < show, `hide ${hide}ms < show ${show}ms`);

  const sidebar = rules.find((rule) => rule.media === DESKTOP && rule.selectors.includes("html.sidebar-collapsed .Layout .VPSidebar"));
  assert.match(sidebar.body, /transform var\(--rb-fold-hide-duration\) var\(--rb-fold-hide-easing\)/);
  const open = rules.find((rule) => rule.media === DESKTOP && rule.selectors.includes(":root .Layout .VPSidebar"));
  assert.match(open.body, /transform var\(--rb-fold-show-duration\) var\(--rb-fold-show-easing\)/);
  const css = rules.map((rule) => rule.body).join("\n");
  assert.match(css, /--vp-nav-col-offset var\(--rb-fold-show-duration\)/);
  assert.match(css, /--vp-nav-col-offset var\(--rb-fold-hide-duration\)/);
  assert.match((await read("custom.css")), /@property --vp-nav-col-offset/);

  // The column follows by transform (FLIP), never by animating layout.
  assert.match(fold, /element\.animate\(\[\{ transform: `translateX\(\$\{offset\}px\)` \}/);
  assert.match(fold, /prefers-reduced-motion: reduce/);
  for (const selector of [".VPDoc .container > .content", ".VPDoc .aside-container", ".VPLocalNav .container"]) {
    assert.ok(FOLD_FOLLOWERS.includes(selector), selector);
  }
});

test("fold durations survive the minifier's unit rewrite", () => {
  assert.equal(toMilliseconds("220ms"), 220);
  assert.equal(toMilliseconds(".22s"), 220);
  assert.equal(toMilliseconds("0.32s"), 320);
  assert.equal(toMilliseconds(" 320ms "), 320);
  assert.equal(toMilliseconds("0s"), 0);
  assert.equal(toMilliseconds(""), 0);
  assert.equal(toMilliseconds(undefined), 0);
});

test("the menu control is an accessible button whose bars fold into an arrow", async () => {
  const [toggle, rules] = await Promise.all([read("components/SidebarToggle.vue"), themeRules()]);
  assert.match(toggle, /aria-label="Sidebar navigation"/);
  assert.match(toggle, /:aria-expanded="String\(!collapsed\)"/);
  assert.match(toggle, /class="sidebar-toggle-glyph" aria-hidden="true"/);
  assert.equal((toggle.match(/class="sidebar-toggle-bar"/g) ?? []).length, 3);
  for (const nth of [1, 2, 3]) {
    const rule = rules.find((candidate) =>
      candidate.selectors.includes(`.sidebar-toggle[aria-expanded="true"] .sidebar-toggle-bar:nth-child(${nth})`),
    );
    assert.ok(rule, `bar ${nth} has an expanded pose`);
    assert.match(declaration(rule.body, "transform"), /translate/);
  }
  const reduced = rules.find((rule) => /prefers-reduced-motion: reduce/.test(rule.media ?? "") && rule.selectors.includes(".sidebar-toggle"));
  assert.equal(declaration(reduced.body, "animation"), "none");
});

test("Find task never narrows its field or pushes the tree while typing", async () => {
  const [find, rules] = await Promise.all([read("components/GoToTask.vue"), themeRules()]);
  // Clear lives inside the field, over end padding the input always keeps.
  assert.match(find, /<div class="goto-field">\s*<input[\s\S]*?\/>\s*<button v-if="value" class="goto-clear"/);
  const clear = rules.find((rule) => rule.media === null && rule.selectors.includes(".goto-clear"));
  assert.equal(declaration(clear.body, "position"), "absolute");
  const input = rules.find((rule) => rule.media === null && rule.selectors.includes(".goto-input"));
  const endPadding = declaration(input.body, "padding").split(/\s+/)[1];
  assert.match(endPadding, /^[1-9][\d.]*rem$/, "the input reserves room for Clear");
  // Status and results open over the tree instead of in its flow.
  assert.match(find, /<div class="goto-panel" :class="\{ 'is-open': open \}"/);
  const panel = rules.find((rule) => rule.media === null && rule.selectors.includes(".goto-panel"));
  assert.equal(declaration(panel.body, "position"), "absolute");
  const form = rules.find((rule) => rule.media === null && rule.selectors.includes(".goto"));
  assert.equal(declaration(form.body, "position"), "relative");
});

test("module rows keep name and count on one line; task IDs fit their column", async () => {
  const rules = await themeRules();
  const rows = rules.find((rule) => rule.selectors.includes(".VPSidebarItem:is(.level-0, .level-1) > .item .text bdi"));
  assert.equal(declaration(rows.body, "display"), "flex");
  // The task grid must not reach module rows (level-1), which once squeezed
  // a module name into the call-number column.
  assert.ok(!rules.some((rule) => rule.selectors.includes(".VPSidebarItem.level-1 .text bdi")));
  const tasks = rules.find((rule) => rule.selectors.includes(".VPSidebarItem.level-2 .text bdi"));
  const idColumn = Number.parseFloat(declaration(tasks.body, "grid-template-columns"));
  // Read maintained input directly: generated files may not exist yet when
  // Node starts the test files concurrently on a clean checkout.
  const catalog = parseChecklist(await readFile(path.resolve(import.meta.dirname, "../content/master-working-2026-11-21.working.132.md"), "utf8"));
  const longest = Math.max(...catalog.tasks.map(({ id }) => id.length));
  // 12px mono at up to 0.61em advance, 16px root.
  assert.ok(idColumn * 16 >= longest * 12 * 0.61, `${idColumn}rem holds a ${longest}-character ID`);
});
