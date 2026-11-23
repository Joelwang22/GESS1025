# Convergence Proposal — Gemini

- **Author:** Gemini (`design/gemini` at `c02a796`, reviewed `9.6 / 10`)
- **Peer:** Opus (`design/opus` at `1fde407`, reviewed `9.6 / 10`)
- **Goal:** Converge on **one** final, ship-ready design combining the best engineering foundation, mid-box ergonomics, and visual craft from both branches.

---

## 1. Base Branch Recommendation: `design/opus` (`1fde407`)

Build the final unified branch (`design/final`) on **`design/opus` (`1fde407`)**, then port the highest-value UX, visual, and interaction treatments from **`design/gemini` (`c02a796`)**.

### Why `design/opus` is the stronger code base

| Dimension | `design/opus` (`1fde407`) | `design/gemini` (`c02a796`) | Takeaway |
| :--- | :--- | :--- | :--- |
| **Code footprint** | 4,722 lines across 14 source/test files | 5,812 lines across 15 source/test files | Opus is ~1,090 lines leaner. |
| **Client theme bundle** | **72.8 kB** | 82.4 kB | Opus ships a 9.6 kB smaller client chunk. |
| **Markdown pipeline** | Extracted `site/.vitepress/markdown.mjs` (341L) + thin `config.mjs` (108L); shares `isDecisionHeaders` with `scripts/checklist.mjs` | Monolithic `config.mjs` (579L); duplicates decision-header heuristic | Opus's shared generator/renderer contract prevents drift and enables direct unit testing. |
| **Placeholder highlighting** | Shiki `preprocess` `decorations` API (`blankDecorations()`) | Post-Shiki HAST text-node walker | Shiki `decorations` handles placeholders even when a syntax grammar splits `<` and the identifier across sibling spans. |
| **Test suite** | **59 pass, 0 fail** (strictest working-only jump audit, 1440px sidebar layout guard, plate row-layout test, home title/condition test, CSS zero-hiding guard, 732-plate exact copy) | **57 pass, 0 fail** (includes `AD-03`/`WSQL-05` table check, `Question` neutral-colour guard, zero `catalog.json` import guard, `codeText` unit test) | Porting Gemini's 4–5 unique assertions into Opus's 59-test suite is much simpler than the reverse. |
| **Long-context legibility** | `14px` two-column module context at `>= 1100px`, still placing `WSQL-01` plate 1 at `y = 756px` | `13.5px` two-column module context (`y = 762px`) | `14px` is a safer floor for a 24-hour exam while keeping the first command above the fold. |
| **Right-aside routes** | Bounded sticky `TaskRail.vue` below `"On this page"` (chip mode when `> 6` routes) | Outline only; routes only at page bottom | Keeping `TaskRail` in place avoids rebuilding it from scratch. |

Where Gemini's structure is cleaner—splitting styles into `tokens.css` / `components.css` / `custom.css` instead of one 1,532-line `custom.css`—we should adopt that CSS modularity during convergence.

---

## 2. Borrow List (from `design/gemini` onto `design/opus`)

Drawing on every review's `WORTH BORROWING` list and Round 1–3 measurements:

| # | Feature / Treatment | Source File(s) in `design/gemini` | Target File(s) in `design/final` | Why Bring It Over |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Single-line Breadcrumb + Stamp + `task n of N` + Jump Bar above H1** (with `.op-task-id-pair` preventing mobile orphan wraps) | `site/.vitepress/theme/components/TaskHeader.vue`, `components.css` | New `TaskHeader.vue` (mounted in `doc-before` via `theme/index.js`), replacing Opus's `.task-meta` under H1 and removing the stray muted period `[NET-01] .` | Faster spatial orientation on desktop and phones (`Checklist / Module / [ID] task n of N`), eliminates the isolated period speck outside Opus's boxed H1 stamp, and keeps jump chips cleanly scoped above the title. |
| 2 | **Module page top navigation bar** (`All 28 modules / N tasks` + `Default box route` + `Service dispatch (NET-05)`) | `TaskHeader.vue`, `scripts/checklist.mjs` (`isModulePage`, `taskCount`) | `TaskHeader.vue`, `scripts/checklist.mjs` | Gives module index pages immediate jump-backs to `/checklist/`, `/generated/start`, and `NET-05`. |
| 3 | **Outcome-list jump target (`id="results"`) for bullet-routed tasks** (`NET-05`, `AD-03`, `FTP-02`, `SMB-01`) | `scripts/checklist.mjs`, `site/.vitepress/config.mjs` (`op-outcome-list` gets `#decision-matrix`) | `scripts/checklist.mjs`, `site/.vitepress/markdown.mjs` (`markOutcomeLists`) | Extends the `Result table` / `Decision` jump to bullet-routed dispatch tasks so `NET-05` and similar tasks get a direct jump to their outcome branches too. |
| 4 | **Directory `By module (28)` / `Flat list (145)` layout toggle** | `site/.vitepress/theme/components/ChecklistDirectory.vue`, `components.css` | `site/.vitepress/theme/components/TaskDirectory.vue`, `components.css` | Lets an operator scan all 145 tasks in one flat call-number table (`ID · Title · Module`) or grouped by module, while staying server-rendered in source order with no JS. |
| 5 | **Home quick-jump input + `Full-text search /` button + global `/` keyboard shortcut + active-sidebar auto-scroll** | `HomeWorkbench.vue`, `site/.vitepress/theme/index.js` | `HomeWorkbench.vue` (or lightweight `HomeJump.vue`), `theme/index.js` | Removes friction when landing on Home (`net1` + Enter or `/` from anywhere, safely guarded against `<input>`/`<textarea>`/`contenteditable`), and scrolls the active sidebar task into view on route change. |
| 6 | **Ruled Home `"Where to enter"` rows quoting both `When` and exact source decision conditions, with clickable `ID + exact title` rows beneath** | `HomeWorkbench.vue`, `components.css` | `site/index.md` (or `HomeWorkbench.vue`) + Opus's `"Reading a task"` 4-mark legend kept right below | Preserves exact source conditions verbatim on every conditional/sequenced row (`SSH-01 → SSH-02`, `LNX-01 → LNX-03`, `Usable session verified`) while keeping each destination's exact title immediately clickable without scanning across 3 table columns. |
| 7 | **Bundled offline Inter sans-serif (`inter-roman-latin.woff2`) + crisp cobalt route-chip pills + warm paper/slate token split** | `site/.vitepress/theme/tokens.css`, `components.css`, `custom.css` | Split `custom.css` into `tokens.css` + `components.css` + `custom.css` | Eliminates OS system-font variance across Windows/macOS/Linux (zero remote assets—uses VitePress's already-bundled offline Inter), gives route links unmistakable button-like click affordance, and improves CSS maintainability. |
| 8 | **Sidebar filter clear (`×`) button + Escape-to-clear** | `SidebarFilter.vue` | `GoToTask.vue` | Quick one-key/one-click reset when switching queries mid-box, layered onto Opus's superior exact-ID title confirmation (`Press Enter to open NET-01: Check connectivity`). |
| 9 | **Unique Gemini regression tests** | `tests/checklist.test.mjs`, `tests/site.test.mjs` | `tests/checklist.test.mjs`, `tests/site.test.mjs` | Port `Question` cue neutral-colour guard, zero `catalog.json` Vue-import guard, `AD-03`/`WSQL-05` explicit classification test, and `codeText` prompt-retention edge cases. |

---

## 3. Conflict Resolutions

| Area | Opus (`design/opus`) | Gemini (`design/gemini`) | Proposed Resolution & Rationale |
| :--- | :--- | :--- | :--- |
| **1. Palette & colour semantics** | Crisp cool-neutral paper (`#fafaf8` / `#111417`), cobalt routes, solid yellow highlighter blanks on paper + 20% yellow wash on dark plates, inverted ink slab stops, neutral `IMPORTANT` & context. | Warm stone paper (`#FAF9F5` / `#151A22`), cobalt routes (`#1D54B5` / `#78B9FA`), muted amber wash blanks on both paper & dark plates, inverted ink slab stops, neutral `IMPORTANT`, context, & `Question:` cue. | **Use Gemini's warm paper/slate surface pair (`#FAF9F5` / `#151A22`) + strict 1-meaning-per-colour discipline** (Cobalt = clickable links/routes only; Amber + dashed underline = `<PLACEHOLDER>` blanks only; Inverted Ink Slab + drawn square = non-clickable `PAUSE-*`/`GAP-*` stops only; Neutral ink-bordered bands = Module Context, `IMPORTANT`, `Enter when:`, `Question:`). Keep Opus's crisp solid-tint readability on paper blanks and 20% amber wash (`#ffe37a` / `#F7B955`) on dark plates (verified >= 7:1 contrast). |
| **2. Typography** | OS system sans (`-apple-system, Segoe UI, ...`) + OS monospace; `14px` two-column context. | VitePress's bundled offline Inter (`inter-roman-latin.woff2`) + OS monospace; `13.5px` two-column context. | **Use bundled offline Inter for UI/prose + OS monospace (ligatures disabled, `tabular-nums`)**, and keep **Opus's `14px` / `1.48` floor for expanded module context** (with `16px` body prose everywhere). Eliminates Windows/Linux font drift without any network request, and keeps long exam-critical instructions comfortably readable at `14px`. |
| **3. Command block header** | Two-row dark plate (`github-dark`): Row 1 = lowercase lang, `Wrap lines` (`aria-pressed`), `Copy`; Row 2 = `Fill in` + every blank. | Two-row dark plate (`github-dark-dimmed`): Row 1 = uppercase lang, `Wrap lines` (`aria-pressed`), `Copy`; Row 2 = `Fill in:` + every blank. | **Keep Opus's `markdown.mjs` two-row plate + Shiki `decorations`, styled with `github-dark-dimmed` (softer dark-mode eye strain during long labs) and Gemini's crisp `Copy`/`Wrap lines` active state** (`aria-pressed="true"` highlighted in subtle cobalt border/wash). Keep lowercase/exact source language word (Opus's `bash`, `text`, `sql` matches source fences directly). |
| **4. Home page** | Static Markdown: edition + `IMPORTANT` + 3 CTA buttons + 3-col `"Where to enter"` table (with exact titles & conditions) + `"Reading a task"` 4-mark legend + `"How to use it"`. | Interactive `HomeWorkbench.vue`: jump input + `Full-text search /` + 3 CTA buttons + 5-row ruled `"Where to enter"` sheet (quoting `When` + exact decision conditions + clickable `ID · exact title` rows) + `"How to use it"`. | **Combine both strengths:** Keep Gemini's quick-jump input + `Full-text search /` + 3 CTA buttons + ruled `"Where to enter"` sheet (quoting `When`, exact source decision conditions, and clickable exact source titles), **followed directly by Opus's compact `"Reading a task"` 4-mark legend** (teaching Blank / Route / Stop / Plain ID in 4 lines) and `"How to use it"`. |
| **5. Directory (`/checklist/`)** | Single filter input + server-rendered 2-column CSS `columns: 2` printed-index flow (no site grouping tabs, no flat-list toggle). | Filter input + `By module (28)` / `Flat list (145)` toggle + 6 site-labelled quick-filter pills (scrolling row on mobile) + module cards. | **Use Opus's clean filterable directory + Gemini's `By module (28)` / `Flat list (145)` toggle, WITHOUT the 6 invented site-grouping pills.** Dropping the site-made grouping pills eliminates invented taxonomy entirely (100% source-faithful), removes the mobile scroll-cue nit, and makes mobile `/checklist/` show `NET-01` even higher on the first screen (~`540px`). Use a clean 2-column desktop CSS grid or balanced printed index in `By module` mode; when a query is active, show matching modules/tasks cleanly. |
| **6. Sidebar find/filter** | `Find task` with explicit `Go` button, live keyword list (first 12 + total), exact-ID confirmation naming the task (`Press Enter to open NET-01: Check connectivity`), Enter opens first match. | `Filter or ID (web9, suid)…` with live dropdown (first 18) and `×` clear button, Enter opens exact or sole match. | **Use Opus's `GoToTask.vue` (`Find task`) enhanced with Gemini's `×` clear button and `Escape`-to-clear.** Keeping the `Go` button helps pointer/touch users, exact-ID title confirmation prevents wrong-task jumps, and Enter-opens-first speeds up mid-box keyword navigation. |
| **7. Route rail & route map** | Sticky right-aside `TaskRail.vue` below `"On this page"` (titled list `<= 6`, chip mode `> 6` + stops) AND bottom `TaskRoutes.vue` with cross-module tags and folded inbound (`> 6`). | Bottom `TaskRouteMap.vue` only (2-col grid cards with cross-module tags, stops, folded inbound `> 6`). | **Keep BOTH Opus's bounded sticky `TaskRail.vue` below `"On this page"` AND the bottom route sheet (`TaskRoutes.vue` with Gemini's crisp card layout and cross-module tags).** Operators reading a long task see outbound routes and stop states immediately beside the text without losing `"On this page"`, while mobile and deep-inspection users get full titles and inbound backlinks at the bottom. |
| **8. Decision rows & cues** | Structured `Enter when:` / `Question:` cue block (neutral ink, semibold question), ruled `snake_case:` outcome rows, heavy-ruled decision tables, bare underlined `→ NET-02` route links. | Same structured cues (neutral ink + heavy top rule on `Question:`), ruled `snake_case:` outcome rows, heavy-ruled decision tables, soft-tinted cobalt `→ NET-02` pill chips. | **Keep Opus's clean `markdown.mjs` rules + Gemini's soft-tinted cobalt route-chip pills (`.route` with subtle tint + border + drawn SVG arrow)** and neutral heavy-ruled `Question:` cue. Tinted route chips are noticeably faster to spot inside dense decision cells (`AD-03`, `WEB-09`, `start`) than bare underlined links, while keeping cobalt strictly for routes. Also give outcome-bullet lists `id="results"` so `NET-05` gets a `Decision` / `Outcomes` jump. |
| **9. Mobile tables** | Both branches already converged on the same zero-CSS-hiding pattern: visible one-line `Col 1 / Col 2` `<thead>` legend above stacked `data-label` cards (`<= 640px`). | Identical pattern (with `thead th { width: auto !important }` so 2-column legends stay tight). | **Keep the shared zero-hiding stacked mobile table with `width: auto !important` on mobile `thead th`** so `Result / Next` and `When / Decision / Next choice` both sit tightly together at 390px. |

---

## 4. Non-Negotiables Carried Forward

Every constraint below remains strictly enforced by automated tests and build checks on `design/final`:

1. **Zero `content/` edits:** `content/master-working-2026-11-21.working.132.md`, `content/source.json`, and all 3 `content/references/` files remain byte-for-byte pinned.
2. **Exact verbatim command copy (all 732 plates):** Custom `copy.js` joins rendered Shiki `.line` spans with `\n` with zero trimming and zero `$ ` / `> ` stripping; automated test verifies all 732 plates byte-for-byte against source fences, plus live clipboard click check.
3. **All 51 contextual tasks keep module context expanded:** Zero `<details>` elements anywhere inside `.ledger-module-context`; compact `14px` two-column layout from `>= 1100px` keeps `WSQL-01`'s first command line visible above the fold at `1440×900`, and `First command` jump handles narrow viewports.
4. **Exact source titles and source conditions everywhere:** Home `"Where to enter"`, `/generated/start`, sidebar, directory, module pages, and route sheets display exact source titles from `catalog`/source and preserve verbatim conditions (`Usable session verified`, `SSH-01 → SSH-02`, `LNX-01 → LNX-03`).
5. **Zero CSS hiding:** Automated stylesheet guard forbids `display: none`, `visibility: hidden`, `clip:`, `clip-path:`, `overflow: hidden` on content blocks, zero-height collapsing, and `-9999px` off-screen positioning across all theme stylesheets.
6. **Full combined test suite + built-page fidelity guards:** Keep all **42** original baseline tests untouched, keep all **17** Opus Round 1–3 tests, and port all unique Gemini assertions (total ~63–64 passing tests), including full built-page word/command-line parity in `<main>`, 732-plate exact copy parity, working-only landmark jump verification across all 145 tasks, and zero remote assets.
7. **Product boundaries intact:** 100% static/offline, `/checklist/` GitHub Pages base, VitePress local search, zero remote fonts/scripts/assets, no tracking, accounts, or completion claims.

---

## 5. Implementation & Verification Plan

### Branch & Ownership
1. **Agree on convergence spec** (Convergence step 2: reconcile any differences between Opus's proposal and this one into a brief final spec).
2. **Create `design/final` from `design/opus` (`1fde407`)** (preserving clean git history without touching `main` until final sign-off).
3. **Division of work (clean, sequential handoff to avoid merge conflicts):**
   - **Stage A — Structural & Build Foundation (Opus, on `design/final`):**
     - Split `custom.css` into `tokens.css`, `components.css`, `custom.css` and adopt Gemini's warm paper/slate surface tokens + bundled offline Inter + cobalt route-chip styling.
     - Add `TaskHeader.vue` (breadcrumb + paired `[ID] task n of N` + working-only jump bar) above H1 and clean up H1 stamp (remove isolated muted dot), plus module-page top nav bar.
     - Extend `markdown.mjs` & `scripts/checklist.mjs` so outcome-bullet lists also receive `#results` (when no prior decision table exists).
     - Add `By module (28)` / `Flat list (145)` toggle to `TaskDirectory.vue` (keeping it 100% free of invented site-grouping pills).
     - Add `×` clear + `Escape` to `GoToTask.vue`, and add Home quick-jump + `/` shortcut + active-sidebar scroll + ruled `"Where to enter"` sheet with `"Reading a task"` legend below.
     - Port all unique Gemini unit/site tests into `tests/checklist.test.mjs` and `tests/site.test.mjs`.
   - **Stage B — Independent Cross-Verification & Polish Pass (Gemini, on `design/final`):**
     - Run `pnpm test` and `pnpm build` independently.
     - Run full **732-plate real copy audit**, **531 page-width overflow sweep** (`390`, `768`, `1280`/`1440px`), and capture + visually inspect screenshots across light and dark modes (`home`, `index`, `start`, `net-01`, `web-09`, `net-05`, `wsql-01`, `ad-03`, `ad-05`, `ad-08`, `wexec-04`, `http` module, `linux_privilege` module).
     - Fix any visual, spacing, contrast, or test nits discovered (e.g., `WSQL-01` fold height at `1100×900` and `1440×900`, mobile `index` first-task height, `theme-color` sync with final surfaces).
   - **Stage C — Mutual Final Sign-Off (Both agents):**
     - Both Opus and Gemini confirm `>= 9.5/10` with zero blocking issues and zero regressions before the coordinator merges `design/final` to `main`.

*(Alternatively, if the coordinator prefers Gemini to drive Stage A implementation and Opus to run Stage B verification & polish, the exact same ordered checklist applies symmetrically.)*
