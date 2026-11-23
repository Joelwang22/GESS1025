# Round 1 Design Report — Gemini (`Slate & Signal`)

- **Branch:** `design/gemini`
- **Edition preserved:** `2026-11-21.working.132` (145 tasks across 28 modules, 3 supporting references, byte-pinned under `content/`)
- **Screenshots:** Saved under `.superpowers/round-1/` (34 captures covering Home, Checklist Index, `NET-01`, `WEB-09`, `LPRIV-02`, `NET-05`, `WSQL-01`, and `Linux privilege` module at `1440×900` and `390×844` in both light and dark modes, plus scrolled views of `NET-05` recorded routes and `LPRIV-02` decision table + explanations).

---

## 1. Design Concept — "Slate & Signal"

Rather than keeping stock VitePress documentation styling or leaning into cyberpunk/terminal cosplay, **Slate & Signal** treats the OSCP Master Checklist as a **precision tactical field manual**—drawing on Swiss technical service manuals and aviation Quick Reference Handbooks (QRH) built for 12–24 hours of high-stakes, non-linear fault isolation beside an active terminal.

### Visual System
- **Zero-glare matte surfaces in both themes:**
  - **Light ("Drafting Vellum"):** `#FAF9F5` reading canvas, `#F2F0EA` sidebar/chrome/notes ground, `#F1EEE7` command well, `#181C22` primary ink (> 15:1 contrast). Eliminates pure-white monitor halation.
  - **Dark ("Cockpit Slate"):** `#151A22` reading canvas, `#10141B` chrome/notes ground, `#0D1117` deep command well, `#E8E6DF` warm off-white ink (> 13.5:1 contrast). Sits calmly beside a dark Kali `tmux` pane without OLED smear or neon fatigue.
- **Dichromat-safe, zero-claim two-voice signaling:**
  - **Route Cobalt** (`#135198` light / `#78B9FA` dark) marks clickable task routes, active sidebar position, interactive controls, and universal dual-halo keyboard focus rings.
  - **Signal Amber** (`#9A4700` light / `#F2B04C` dark) marks stop/coverage-gap states (`PAUSE-*`, `GAP-*`), unreplaced command `<PLACEHOLDER>` slots, shared module rules, and the finding-driven `IMPORTANT` caution.
  - No green (never implies access or completion), no red (a `PAUSE-*` / `GAP-*` stop is disciplined scope control, not an error), and no decorative VitePress violet.
  - **Redundant non-color cues everywhere:** clickable routes carry `→` and a solid cobalt border; stop states carry `■` and a `3px` solid left bar (non-interactive); placeholders carry a warm tint and dashed bottom underline inside monospace.
- **Typography & Offline Resilience:**
  - Uses VitePress 2's already-bundled local `Inter` variable font (`cv05` enabled for `l`/`I` clarity) paired with a non-ligature monospace stack (`font-variant-ligatures: none; font-feature-settings: "liga" 0, "calt" 0`) so `->`, `=>`, `!=`, `0/O`, and `1/l/I` always render literally as typed.
  - Body text stays **16px at every viewport including 390px mobile** (removing the baseline's 15px mobile reduction).
  - Dual reading measure: prose paragraphs constrain to `68ch`, while command plates and decision tables expand to `820px` (and `920px` on non-aside directory/home/module pages) to reduce awkward command wrapping.
  - Zero new npm dependencies and zero remote fonts, scripts, or asset requests.

---

## 2. What Changed and Why

| Area | Files Changed | What Changed & Why |
| :--- | :--- | :--- |
| **Generator presentation markup** | `scripts/checklist.mjs` | Kept exact source parsing, SHA-256 verification, compound route linking, `sidebar.json`, `routes.json`, and `catalog.json`. Added static task frontmatter hints (`hasDecision`, `commandCount`, `hasModuleContext`), wrapped `## Explanations and troubleshooting` in `<section class="op-explanations">` for clean visual separation, formatted long (> 600 char) shared module contexts with native `<details>` while keeping concise contexts directly expanded, and upgraded module task lists into aligned call-number rows (`outline: false` on module pages). |
| **Build-time Markdown & Shiki intelligence** | `site/.vitepress/config.mjs` | Added a Shiki HAST `codeTransformer` (`placeholderCodeTransformer`) that wraps operator placeholders (`<IP_ADDRESS>`, `<supplied-domain/user>`, etc.) in `<span class="op-placeholder">` at build time without modifying a single copied character (and verified against corpus literals `<0.4096>` and `<?php ... ?>`). Added a Markdown-it core rule (`enhanceChecklistMarkdown`) that tags route chips (`op-route-chip` + full destination `title` tooltips), tags both bold and plain `Next:` terminal states as non-interactive `op-stop-stamp` badges, classifies 2-column routing tables as `op-decision-table` with `data-label` mobile stacking attributes, structures `Enter when:` / `Question:` cues, and formats the 18 outcome bullet lists (`NET-05`, `FTP-02`, `SMB-01`, etc.) into scannable dispatch rows. Relabeled the footer pager to `"Previous in catalog"` / `"Next in catalog"` and emitted dual light/dark `theme-color` meta tags. |
| **Theme tokens & styles** | `site/.vitepress/theme/tokens.css`, `components.css`, `custom.css` | Implemented the complete Slate & Signal palette, always-visible Command Plate utility bar (language badge, blank count cue, Wrap/Scroll toggle, always-opaque Copy button), heavy-ruled Decision Matrices with hover tracking and mobile stacked cards, recessed Explanations band, focus rings, `prefers-reduced-motion`, and `forced-colors` support. |
| **Operator navigation components** | `site/.vitepress/theme/index.js`, `components/TaskHeader.vue`, `TaskRouteMap.vue`, `SidebarFilter.vue`, `HomeWorkbench.vue`, `ChecklistDirectory.vue` | Added zero-state, 100% static components reading `routes.json` and `catalog.json`: task breadcrumb + section jumps (`Decision ↓`, `Explanations ↓`, `Routes ↓`); derived Route Map (outbound cards with full titles & cross-module tags, stop states, and inbound backlinks); non-mutating sidebar task filter; home quick-jump + source-backed entry grid; and dual-mode Modules / All-145-Tasks directory with operational area filters. Added `/` global search shortcut, polite `aria-live` copy confirmation, and Wrap/Scroll code toggle appended after `<pre>` so VitePress's native `copyCode.js` sibling lookup stays intact. |
| **Framing pages** | `site/index.md`, `site/checklist/index.md`, `site/about/source.md` | Kept all required edition/provenance copy, finding-driven `[!IMPORTANT]` warning, and 28-module source-order table. Mounted `<HomeWorkbench />` on `/` (`outline: false`), `<ChecklistDirectory />` on `/checklist/`, and updated `site/about/source.md` to accurately document all build-time presentation transforms. |
| **Automated verification** | `tests/site.test.mjs` | Preserved all 42 baseline tests unchanged and added 3 new integration test suites auditing placeholder highlighting (plus literal exclusion of `<0.4096>` and `<?php`), route chips, stop stamps, decision tables, outcome lists, `<details>` context/inbound collapsing, honest catalog pager labels, dual `theme-color`, 16px mobile text, and zero remote assets. |

---

## 3. How Each Operator Need Is Met

1. **Find the right module or task fast:**
   - **Home Workbench (`/`):** Instant live quick-jump input across all 145 tasks, one-click `Full-text search (/)` button, and 3 source-backed entry columns (*New box · no access*, *Verified host shell*, *Session or artifact*) derived strictly from the source snapshot's own Default Box Route (`NET-01`, `NET-02`, `NET-05`, `LNX-01`, `WIN-01`, `AD-01`, `EXP-03`, `SHELL-01`, `ART-01`).
   - **Sidebar Quick Filter:** Compact filter box at the top of the sidebar narrows all 145 tasks by ID, title, or module without opening a modal or mutating VitePress's sidebar DOM.
   - **Dual-Mode Checklist Directory (`/checklist/`):** Filter by keyword or 6 operational area tabs, toggle between **Modules (28)** (showing ID prefixes, task counts, shared-rules indicator, and direct task links) and **All tasks (145)** call-number lookup, plus the full no-JS source-order table below.
   - **Global `/` shortcut & Top Nav:** Pressing `/` anywhere opens VitePress local search immediately; top nav offers 1-click `Start: NET-01`, `Modules & Index`, and `Source`.
2. **Read and copy exact commands safely:**
   - Every fenced block sits in a **Command Plate** with an always-visible uppercase language badge (`BASH`, `POWERSHELL`, `CMD`, `SQL`, `TEXT`), blank counter (`4 blanks`), `Wrap` / `Scroll` toggle (defaults to safe wrapping so long commands never break viewport width, switches to horizontal scroll on demand), and an always-visible `Copy` button (`opacity: 1` always, never hover-gated) with `aria-live="polite"` feedback.
   - Every operator placeholder (`<IP_ADDRESS>`, `<absolute-observed-executable>`, `<same-run-id>`, `<supplied-domain/user>`) is highlighted in Signal Amber with a dashed underline at build time—visually impossible to miss before pasting—while clipboard copy preserves **exact source bytes**.
3. **Understand how to interpret results:**
   - Concise module execution rules (e.g., *verified target Bash session* vs. *Kali Bash*) stay permanently visible in an amber operational banner right below the task title.
   - `Enter when:` and `Question:` lines stand out as structured prerequisite and question cues.
   - All 130 decision tables use heavy `2px` anchors, clean 40%/60% proportions, row hover guides, and stack cleanly into `RESULT` / `NEXT` blocks on 390px screens.
   - All 18 outcome-bullet tasks (such as `NET-05`) render with monospace outcome slug badges and ruled rows instead of a dense bullet wall.
   - `## Explanations and troubleshooting` sits in a clearly separated, recessed `REFERENCE & TROUBLESHOOTING` band—expanded and searchable by default, one click away from the task header (`Explanations ↓`).
4. **Follow the recorded "Next:" route without confusion:**
   - Every inline task route renders as a Cobalt **Route Chip** (`→ NET-02`) with a build-time native `title` tooltip showing the destination's full title.
   - Every stop/coverage-gap state (`PAUSE-*`, `GAP-*`, bold or plain) renders as an Amber non-clickable **Stop Stamp** (`■ PAUSE-ROUTE`), distinct by glyph, border, and color.
   - The footer **Recorded Routes** navigator lists every outbound task route with its exact title and cross-module label, lists stop states separately, and clearly labels the VitePress linear footer `"Previous in catalog"` / `"Next in catalog"` so catalog order is never confused with a finding-driven branch.

---

## 4. Native `<details>` Collapsing & Justification

No source text is hidden with CSS (`display: none`, `visibility: hidden`, zero height, off-screen positioning, or clipped overflow). Native `<details>` is used in **only two narrowly scoped secondary cases**, keeping all working commands and explanations immediately visible without interaction:

1. **Lengthy shared module contexts (> 600 characters) on child task pages:**
   - Applies to **4 of 28 modules** (`web_input`, `command_continuation`, `sql_continuation`, `web_upload` — 13 tasks total), where the shared module preamble is 16–21 lines (~1,177–1,467 characters) repeated identically on every child task.
   - **Why:** Leaving 21 lines of repeated preamble expanded above every task pushes the task's actual question and first command completely below the fold on laptop and mobile screens.
   - **Safeguard:** The `<summary>` surfaces the module label, the critical opening shell-environment cue (e.g., *"Run in Kali Bash."*), and line count (`Full rules (16 lines) ▾`), so the shell boundary is still visible at a glance and the full verbatim context is one click away (and always expanded on the parent module page itself). All **7 concise contextual modules** (≤ 600 chars, including `linux_privilege`, `dns_nfs`, `snmp`, `database`, `mssql`, `mail_rdp`, `windows_privilege`) remain directly expanded with no `<details>`.
2. **Large inbound backlink lists (> 6 inbound tasks) in the derived Route Map:**
   - Applies to hub tasks such as `NET-05` (57 inbound references), `LNX-01` (22), `EXP-03` (21), `WIN-01` (20), `WEB-09` (19), and `LNX-09` (18).
   - **Why:** Inbound backlinks are derived navigation metadata (not source task content). Rendering 57 backlink chips expanded at the bottom of `NET-05` overwhelms the primary outbound routes and catalog pager; collapsing `> 6` inbound references behind `"Named as a route by N tasks"` keeps hub footers focused while staying one click away. Tasks with `≤ 6` inbound links show them directly expanded.

---

## 5. Known Weaknesses & Honest Trade-Offs

1. **System monospace fallback variance on Kali Linux:** To keep zero new npm dependencies and zero extra font payload (while leveraging VitePress 2's already-bundled local `Inter` for body text), code blocks rely on a carefully ordered local monospace stack (`Cascadia Mono`, `JetBrains Mono`, `SFMono-Regular`, `Consolas`, `DejaVu Sans Mono`, `Liberation Mono`). Kali Linux renders cleanly with `DejaVu Sans Mono` / `Liberation Mono` (and ligatures are disabled), but does not share a single bundled monospace glyph shape across every OS.
2. **Client-side Wrap/Scroll button enhancement:** The `Wrap` / `Scroll` button and `"N blanks"` indicator in Command Plates are appended on mount in `theme/index.js` (after `<pre>`, preserving VitePress's `copyCode.js` sibling structure). With JavaScript disabled, commands still render with safe wrapping, highlighted placeholders, and visible language labels, though the interactive Wrap toggle and live filter components require JS (the core 28-module table, all 145 task pages, route links, and `<details>` disclosures remain 100% functional without JS).
3. **Sidebar retains all 28 flat groups:** To preserve source order and the existing `sidebar.length === 28` contract in `tests/site.test.mjs`, the default sidebar lists all 28 collapsed modules sequentially. While the new `SidebarFilter` box solves rapid task lookup in place, visual browsing of the collapsed sidebar itself still spans 28 flat entries compared to the phase-filterable `/checklist/` directory.
4. **Placeholder regex scoping:** The Shiki placeholder highlighter matches `/<[A-Za-z][A-Za-z0-9_./-]*>/` (excluding common HTML tags) and was audited across all 403 unique `<...>` sequences in `2026-11-21.working.132` with zero false positives (`<0.4096>` and `<?php ... ?>` are cleanly skipped). Future checklist editions introducing XML/HTML-like tokens outside the exclusion list could theoretically get an amber highlight, though copied command text would remain byte-identical.
5. **VitePress 2 alpha selector coupling:** Styling VitePress's native `.vp-doc div[class*="language-"] > button.copy` and `.VPDoc:not(.has-aside) .content-container` relies on VitePress `2.0.0-alpha.21` markup and could require minor CSS adjustments when upgrading to VitePress 2 stable.
