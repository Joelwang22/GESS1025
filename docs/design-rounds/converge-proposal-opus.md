# Convergence proposal (Opus)

Both designs scored 9.6 / 10 in cross-review: Runbook Binder at `1fde407`
(`design/opus`) and Slate & Signal at `c02a796` (`design/gemini`). This
proposal names one base, a borrow list, how each conflict is resolved, the
non-negotiables, and an implementation and verification plan. I wrote it
without seeing Gemini's proposal.

## 1. Base: build on `design/opus` (`1fde407`)

The two designs are close in quality and in what they offer the operator, so
the base should be the one that is cheaper to change safely.

| Factor | Runbook Binder | Slate & Signal |
| --- | --- | --- |
| Code size (generator, config, Markdown plugin, theme JS, CSS, components) | about 3,260 lines | about 4,400 lines |
| Where Markdown presentation lives | `site/.vitepress/markdown.mjs`, a separate module that Node tests import directly (`BLANK`, `blanksIn`, `checklistMarkdown`) | Inline in a 578-line `config.mjs` |
| Decision-table rule | One `isDecisionHeaders` in the generator, imported by the renderer, so the jump links and the `.decision` class cannot disagree | Logic duplicated between generator flags and config |
| CSS | One `custom.css` on VitePress variables | `tokens.css`, `components.css` and `custom.css` |
| Tests | 59. They include built-HTML exactness for all 732 plates against the source, jump targets that must exist and sit above the explanations on all 145 tasks, a home-table test against the catalog and the box route, and a CSS no-hiding guard | 57, with strong overlap. Unique and worth porting: no `<details>` in module context, no remote assets, 16px mobile body text, the Python and `<?php` blank exclusions, a neutral Question cue, and no catalog import in the theme |
| Client data | Per-task route frontmatter; the sidebar carries `taskId` and `taskTitle`; no generated JSON in the bundle | The same approach as of round 3 |

The visual quality is comparable. Gemini's treatments that are clearly better
are self-contained components or styles that port cleanly (section 2), whereas
moving my module-level structure (`markdown.mjs`, the shared decision rule,
the jump scoping) into Gemini's inline config would mean rewriting it.

## 2. Borrow list (from Gemini into the base)

Drawn from the "Worth borrowing" sections of all six reviews.

| # | Borrow | From (Gemini) | Into (base) |
| --- | --- | --- | --- |
| B1 | **Task header row above the title**: breadcrumb (Checklist / Module), call-number stamp with "task n of N" kept on one line, and jump chips on the right (First command, Result table, Explanations, Routes (n)). Built outside `<main>` from frontmatter flags the generator already computes. | `components/TaskHeader.vue`, `components.css` | New `components/TaskHeader.vue` in the `doc-before` slot; `scripts/checklist.mjs` writes `jumps` frontmatter (`firstCommand: "cmd-N"`, `hasResults`) instead of the in-`<main>` meta line |
| B2 | **Home "Where to enter" sheet**: each row quotes the box route's When cell **and its decision wording verbatim**, with every destination's exact title beneath | `components/HomeWorkbench.vue` | New `components/WhereToEnter.vue`, which reads the box-route rows from generator output (frontmatter or a small generated module) and titles from `themeConfig.sidebar`; it replaces the Markdown table in `site/index.md` |
| B3 | **Home jump box** (ID or keyword), for phones, where the sidebar sits behind a menu | `HomeWorkbench.vue` | Reuse `GoToTask.vue` logic (`task-id.js` `matchTasks` and `normalizeTaskId`) in a compact home variant |
| B4 | **Flat-list toggle** on the directory (By module / Flat list (145)) | `components/ChecklistDirectory.vue` | `components/TaskDirectory.vue` |
| B5 | **Inter, the variable font VitePress already bundles locally** (`cv05` for distinct l and I), in place of the system sans. Kali's default sans renders unevenly; Inter is self-hosted and adds no request beyond the theme's own. | `tokens.css` | `custom.css` `--vp-font-family-base`; the mono stack gains `"DejaVu Sans Mono"` before `"Liberation Mono"` for Kali |
| B6 | **Title tooltips on plain task IDs in prose** (`<span class="task-id" title="ID: Title">`) | `op-task-ref` in `config.mjs` | `markdown.mjs` `markReferences` |
| B7 | **Route sheet in the outline**: an `h2` with an id (e.g. "Recorded routes for NET-05") so "On this page" lists it | `components/TaskRouteMap.vue` | `components/TaskRoutes.vue` |
| B8 | **Scroll-margin and the `cmd-N` anchor conventions** (already the same in both; the names are agreed here) | `config.mjs` | No change |

### Already equivalent; keep the base version

- Find and filter with live results.
- Exact copy handler.
- Fill in row.
- Wrap lines with `aria-pressed`.
- Neutral IMPORTANT band.
- Cue rows.
- Outcome rows.
- Module tags on routes.
- Stacked mobile tables with a visible legend.
- Box route page.
- `→` route linking.

## 3. Conflicts and resolutions

| Area | Runbook Binder | Slate & Signal | Resolution | Why |
| --- | --- | --- | --- | --- |
| Palette and colour semantics | Paper `#fafaf8` / slate `#111417`; route blue; blank yellow highlighter; ink stop slab | Vellum `#FAF9F5` / slate `#151A22`; cobalt; amber blank text on a tint; ink stop slab | **Keep the base palette and its one-meaning-per-colour rule.** Blanks stay a highlighter on paper and a soft wash on plates. | Both now follow the same rule. The highlighter is the strongest "replace this" cue in prose, and on plates it is already softened. The amber-text treatment is less visible in light mode. |
| Typography | System sans; Cascadia Mono stack; 16px body; 14px context | Inter; mono stack; 16px body; 13.5px context on desktop | **Inter (B5) plus a 14px floor for module context.** Mono: Cascadia Mono, ui-monospace, SF Mono, Menlo, Consolas, DejaVu Sans Mono, Liberation Mono, with ligatures off. | Inter gives the same rendering on Kali, Windows and macOS without a remote request. Context holds command-changing rules, so it never goes below 14px. |
| Task heading and meta | Stamp inside the H1 (`NET-01` box, then the title); meta line in `<main>` | Breadcrumb row with stamp and jumps above a plain H1 | **Gemini's header row (B1) and a plain, verbatim H1.** Drop `markTaskHeading`. | One stamp per page; the H1 stays the source heading text; derived navigation moves out of `<main>`, so the fidelity guard covers only source text. |
| Command block header | Fence word, Wrap lines, Copy on row 1; Fill in row 2; soft wash | Same structure; uppercase label | **Keep the base.** The label is the fence word as written; uppercase may be applied in CSS only. | They are the same in behaviour; the base already carries the 732-plate exactness test. |
| Home page | Title, edition, IMPORTANT, actions, Where to enter table, marks legend, how to use | Title, edition, IMPORTANT, jump box and search button, actions, Where to enter sheet, how to use | **Base order, with Gemini's Where to enter sheet (B2) and jump box (B3).** Keep the "Reading a task" marks legend. | The sheet keeps the source conditions next to titles. The legend teaches the four marks, which only the base has. |
| Directory | Filter; two columns by module, read down | Filter; module cards; flat toggle; six "site grouping" quick-filter pills | **Base directory, with the flat toggle (B4). Drop the quick-filter groupings.** | The groupings are a site-made taxonomy that has to be maintained on every refresh. Text filtering by "smb", "kerberos" or "LPRIV" covers the same need with no invented categories. |
| Sidebar find and filter | **Find task**: exact ID opens on Enter with the title in the status; keyword results with module | Filter with live results | **Keep Find task.** | It behaves the same, and it adds exact-ID confirmation, which a mid-box jump needs. |
| Route rail and route map | Aside rail (titles, or chips on hubs) beside the decision table from 1280px; route sheet at the foot | No rail; route map at the foot; "Routes (n)" jump | **Keep the rail and the sheet; add "Routes (n)" in the header jumps and list the sheet in the outline (B7).** | The rail is the only place where route titles are visible while reading the result table. Its hub-page height is already bounded. |
| Decision rows | Ruled table; blue wash on the route column; arrow plus underline route marks | Ruled table; boxed route chips | **Keep the base marks.** | Shape coding is equivalent; the arrow and underline read as inline links inside quoted source text without boxing. |
| Mobile tables | Stacked rows, header legend in the flow | The same since round 2 | **Base.** | Same behaviour. |
| Module context | Expanded; 14px; two columns from 1100px | Expanded; 13.5px; two columns from 1100px | **Base (14px).** | The floor stated above. |

## 4. Non-negotiables carried forward

1. **Exact copy.** Copy writes each rendered line joined by `\n`, with no
   trimming and no prompt stripping. Every plate's rendered text equals its
   source fence body (the test covers all 732).
2. **All module context expanded.** No `<details>` and no hiding on any task
   or module page. Port Gemini's explicit "no `<details>` in context" test.
3. **Exact titles and source conditions.** Every derived title comes from the
   catalog. Home rows quote the box route's When and decision text verbatim,
   conditions included. Tests compare against the parsed source.
4. **No CSS hiding.** The guard covers every theme stylesheet: no
   `display: none`, `visibility: hidden`, clipping, hidden overflow, zero
   height or off-screen offsets. `<details>` is used only for derived inbound
   lists of more than 12.
5. **Every test from both branches kept or ported.** All 42 baseline tests stay
   unchanged, as do all 59 base tests. Gemini's 15 added tests are ported by
   intent, with selectors updated:

   | Gemini test | Port |
   | --- | --- |
   | Arrow-joined sequences in both directions | Add its cases to the base arrow test |
   | Loose IDs and keyword matching | Add its cases to the `normalizeTaskId` and `matchTasks` tests |
   | `codeText` exactness | Already covered; keep both case sets |
   | Placeholders without false literals | Add the `<?php` and Python exclusions to the blank test |
   | Route, stop, decision, outcome and explanation marks | Covered; add its explanation-band assertion |
   | Pager labels, both theme colours, 16px mobile text, no remote assets | Port the 16px mobile and no-remote-assets checks (new to the base) |
   | Module context expanded with no `<details>` | **Port (new)** |
   | All plates copy exactly, fixed controls | Covered |
   | Verbatim preface | Covered |
   | Exact home titles | Covered, and extend to the B2 sheet |
   | Fill in not `aria-hidden`; Python skipped | Port |
   | AD-03 Revisit and WSQL-05 expressions | Covered |
   | No CSS hiding | Covered; extend to all stylesheets |
   | First command jump | Covered (stricter: all 145 tasks) |
   | Home conditions, neutral Question cue, marked IDs, no catalog import | Port the Question-cue colour, marked IDs and "no generated JSON imported by theme code" checks |

6. **The built-page fidelity guard** ("built task pages keep every source word
   and every command line visible in `<main>`") stays as written and runs on
   the final build.
7. **Product boundaries.** Static, offline after load, no remote fonts or
   assets, no state, base `/checklist/`, local search, and no text implying
   success.

## 5. Implementation plan

**Who and where.** Opus implements on a new branch, `design/final`, cut from
`design/opus` at `1fde407`. Gemini's branch stays as a read-only reference.
Nothing merges to `main` until both reviews pass.

**Order.** Each step is its own commit and keeps `pnpm test` green.

1. **Port Gemini's tests first** (section 4.5), adapted to the base selectors.
   The new assertions that describe borrowed behaviour (B1–B7) start as the
   specification for the steps below.
2. **B5 typography:** Inter and the mono stack; check the 14px context floor.
3. **B1 task header:**
   - the generator writes jump flags to frontmatter;
   - `TaskHeader.vue` goes in `doc-before`;
   - remove the in-`<main>` meta line and `markTaskHeading`;
   - the H1 renders verbatim;
   - update the jump test to read the header and still prove every target sits
     above the explanations.
4. **B7:** route sheet `h2` with an id in the outline; "Routes (n)" chip.
5. **B6:** title tooltips on plain task IDs.
6. **B2 and B3:** the Where to enter sheet and the home jump box.
   - The generator exposes the parsed box-route rows (When, decision, task IDs)
     so the sheet quotes them without hand copying.
   - The home test checks every quote against the preface and every title
     against the catalog.
7. **B4:** the directory flat-list toggle (server-rendered default stays "by
   module", listing all 145).
8. **Docs:** DESIGN.md (merged system), `site/about/source.md`, the README
   check, and a `converge-final.md` record.

**Verification.** Both agents run it independently on the built
`design/final`:

- `pnpm test` and `pnpm build`, both passing, with test counts reported.
- Real-click copy audit of all 732 blocks against the source fences.
- Static fidelity: 51 contextual tasks expanded, no `<details>` in `<main>`,
  exact titles, no hiding patterns in any stylesheet.
- Completeness: sidebar 28 groups and 145 items in source order; directory 145
  tasks in the server-rendered HTML and in both modes; home rows verbatim.
- Overflow sweep of all 177 pages at 390, 768 and 1280px.
- Screenshots of home, index, box route, NET-01, WEB-09, NET-05, WSQL-01, AD-03
  and one module page, at 390 and 1440px in light and dark.
- Each agent writes a review of the final design against the same rubric. Both
  must score at least 9.5 with no blocking items. Any blocking item triggers a
  fix commit and a re-review of that item only.
- After both pass, the coordinator opens the pull request from `design/final`
  to `main`. The Pages workflow (`pnpm test` before `pnpm build`) runs in CI
  before merge.
