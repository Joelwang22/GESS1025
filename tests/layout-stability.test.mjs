// Layout stability: the page must not shift when the reader interacts with it.
// These checks pin the specific causes that used to move content: the
// scrollbar gutter, a toggle that mounted after hydration, a nav bar that
// reflowed on collapse, a control that moved with the fold, a local nav that
// filled in late, and a page column that re-centred when the sidebar folded.
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { parseChecklist } from "../scripts/checklist.mjs";

const milliseconds = (time) => Number.parseFloat(time) * (time.trim().endsWith("ms") ? 1 : 1000);

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

test("the menu control is fixed in the rail's top square in both states", async () => {
  const [toggle, rules, tokens] = await Promise.all([read("components/SidebarToggle.vue"), themeRules(), read("tokens.css")]);
  // Only the button waits for the desktop media query after hydration, and
  // it mounts out of the nav bar's flow, so nothing beside it moves.
  assert.match(toggle.slice(toggle.indexOf("<template>")), /<template>\s*(?:<!--[\s\S]*?-->\s*)?<button\s+v-if="desktop"/);
  const button = rules.find((rule) => rule.media === null && rule.selectors.includes(".sidebar-toggle"));
  assert.equal(declaration(button.body, "width"), "var(--rb-toggle-size)");
  assert.equal(declaration(button.body, "height"), "var(--rb-toggle-size)");
  const placed = rules.find((rule) => rule.media === DESKTOP && rule.selectors.includes(".sidebar-toggle"));
  assert.equal(declaration(placed.body, "position"), "fixed");
  assert.equal(declaration(placed.body, "inset-inline-start"), "calc((var(--rb-rail-width) - var(--rb-toggle-size)) / 2)");
  // No collapsed-state rule may move or resize the control.
  for (const rule of rules.filter((candidate) => candidate.selectors.some((selector) => selector.startsWith("html.sidebar-collapsed")))) {
    assert.ok(!rule.selectors.some((selector) => /sidebar-toggle(?!-bar)/.test(selector)), rule.selectors.join(", "));
  }
  // The sidebar's text starts where the glyph's bars do.
  assert.match(tokens, /--rb-sidebar-inset: calc\(\(var\(--rb-rail-width\) - var\(--rb-toggle-glyph\)\) \/ 2\);/);
});

test("folded, the sidebar leaves a rail of its own width", async () => {
  const rules = await themeRules();
  const panel = rules.find((rule) => rule.media === DESKTOP && rule.selectors.includes("html.sidebar-collapsed .Layout .VPSidebar"));
  assert.equal(declaration(panel.body, "transform"), "translateX(calc((var(--rb-rail-width) - 100%) * var(--vp-direction-multiplier)))");
  assert.equal(declaration(panel.body, "opacity"), undefined, "the rail stays painted");
  const contents = rules.find((rule) => rule.media === DESKTOP && rule.selectors.includes("html.sidebar-collapsed .Layout .VPSidebar > *"));
  assert.equal(declaration(contents.body, "opacity"), "0");
});

test("folding the sidebar never moves the page column", async () => {
  const [rules, toggle] = await Promise.all([themeRules(), read("components/SidebarToggle.vue")]);
  // The column keeps the open sidebar's offset: no folded-state rule may
  // touch the content area, the document, its outline or the local nav.
  for (const rule of rules.filter((candidate) => candidate.selectors.some((selector) => selector.startsWith("html.sidebar-collapsed")))) {
    for (const selector of rule.selectors) {
      assert.doesNotMatch(selector, /VPContent|VPDoc|VPLocalNav|aside/, selector);
    }
  }
  // And nothing carries the column anywhere in script.
  assert.doesNotMatch(toggle, /animate\(|sidebar-fold/);
});

test("collapsing the sidebar leaves the nav bar's layout alone", async () => {
  const collapsed = (await themeRules()).filter((rule) => rule.selectors.some((selector) => selector.startsWith("html.sidebar-collapsed")));
  for (const rule of collapsed) {
    for (const selector of rule.selectors.filter((s) => /VPNavBar/.test(s))) {
      // Only the surface offset and paint may change in the bar: the title
      // fades, but no title column, search or control may resize or move.
      assert.doesNotMatch(selector, /\.title|search|content/, selector);
      assert.doesNotMatch(rule.body, /(?:^|;)\s*(?:(?:min-|max-)?width|margin[\w-]*|padding[\w-]*|transform|inset[\w-]*)\s*:/, selector);
    }
  }
  const surface = collapsed.find((rule) => rule.selectors.includes("html.sidebar-collapsed .Layout .VPNavBar.has-sidebar"));
  assert.equal(declaration(surface.body, "--vp-nav-col-offset"), "var(--rb-rail-width)");
});

test("the sidebar tree scrolls below the nav bar on a reserved, thin gutter", async () => {
  const rules = await themeRules();
  // The panel itself never scrolls; its tree does, so the scrollbar starts
  // under the nav bar's rule and rows never pass under the site title.
  const panel = rules.find((rule) => rule.media === DESKTOP && rule.selectors.includes(":root .Layout .VPSidebar"));
  assert.equal(declaration(panel.body, "overflow"), "visible");
  assert.equal(declaration(panel.body, "padding-inline-end"), "0");
  const tree = rules.find((rule) => rule.media === DESKTOP && rule.selectors.includes(".Layout .VPSidebar .nav"));
  assert.equal(declaration(tree.body, "overflow-y"), "auto");
  assert.equal(declaration(tree.body, "height"), "100%");
  // Opening a module never brings a scrollbar in or moves a caret.
  assert.equal(declaration(tree.body, "scrollbar-gutter"), "stable");
  assert.equal(declaration(tree.body, "scrollbar-width"), "thin");
  // The active marker stays on the module's guide line under the highlight.
  const marker = rules.find((rule) => rule.selectors.includes(".Layout .VPSidebar .VPSidebarItem.level-2.is-active > .item > .indicator"));
  assert.equal(declaration(marker.body, "inset-inline-start"), "calc(-0.5rem - 1px)");
});

test("an opened sidebar list settles in without animating its height", async () => {
  const css = await read("custom.css");
  const opened = (await themeRules()).find((rule) => rule.selectors.includes(".VPSidebar:is(:hover, :focus-within) .VPSidebarItem > .items"));
  assert.ok(opened, "opened lists transition only while the reader is in the sidebar");
  assert.doesNotMatch(opened.body, /height|max-height|grid-template-rows/);
  assert.match(opened.body, /opacity/);
  assert.match(css, /@starting-style\s*\{\s*\.VPSidebar \.VPSidebarItem > \.items\s*\{\s*opacity: 0;/);
});

test("the local navigation never forces an empty bar", async () => {
  const rules = await themeRules();
  const band = "@media (min-width: 960px) and (max-width: 1279px)";
  const empty = rules.find((rule) => rule.media === band && rule.selectors.includes(".Layout .VPLocalNav.has-sidebar.empty"));
  assert.equal(empty, undefined, "task pages do not reserve space for an empty outline bar");
});

test("the fold moves sidebar and nav surface on one shared timing", async () => {
  const [tokens, rules] = await Promise.all([read("tokens.css"), themeRules()]);
  for (const name of ["show-duration", "show-easing", "hide-duration", "hide-easing"]) {
    assert.match(tokens, new RegExp(`--rb-fold-${name}:`), name);
  }
  // Hiding is an exit and must be quicker than showing.
  const show = milliseconds(tokens.match(/--rb-fold-show-duration:\s*([^;]+);/)[1]);
  const hide = milliseconds(tokens.match(/--rb-fold-hide-duration:\s*([^;]+);/)[1]);
  assert.ok(hide > 0 && hide < show, `hide ${hide}ms < show ${show}ms`);

  const sidebar = rules.find((rule) => rule.media === DESKTOP && rule.selectors.includes("html.sidebar-collapsed .Layout .VPSidebar"));
  assert.match(sidebar.body, /transform var\(--rb-fold-hide-duration\) var\(--rb-fold-hide-easing\)/);
  const open = rules.find((rule) => rule.media === DESKTOP && rule.selectors.includes(":root .Layout .VPSidebar"));
  assert.match(open.body, /transform var\(--rb-fold-show-duration\) var\(--rb-fold-show-easing\)/);
  const css = rules.map((rule) => rule.body).join("\n");
  assert.match(css, /--vp-nav-col-offset var\(--rb-fold-show-duration\)/);
  assert.match(css, /--vp-nav-col-offset var\(--rb-fold-hide-duration\)/);
  assert.match((await read("custom.css")), /@property --vp-nav-col-offset/);
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
