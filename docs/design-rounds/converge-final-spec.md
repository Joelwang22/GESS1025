# Converged final design: specification

Status: **draft for Gemini sign-off.** Not yet implemented.

Inputs:

- `converge-proposal-opus.md` (`3e4bc32`) and `converge-proposal-gemini.md`
  (`177304b`).
- Six cross-reviews.
- Contrast measurements taken for this spec (section 3).

## 1. Agreed by both proposals

| Topic | Agreement |
| --- | --- |
| Base | `design/opus` at `1fde407` |
| Branch | `design/final`, cut from the base; nothing reaches `main` until both agents sign off |
| Implementer | Opus implements. Gemini verifies independently and may push polish fixes. Both sign off. |
| Quick-filter groups | The six site-made grouping pills are **dropped** |
| Module context | Always expanded; **14px / 1.5** floor; two columns from 1100px on task pages |
| Task header | Gemini's row above the H1: breadcrumb, `[ID] task n of N` kept together, working-section jumps on the right. The H1 renders the verbatim source heading. The in-`<main>` meta line and the H1 stamp are removed. |
| Fonts | Inter, the variable font VitePress already bundles locally, for prose and interface; mono stack with ligatures off |
| Directory | Base filterable directory plus a **By module / Flat list (145)** toggle; server-rendered default lists all 145 tasks |
| Find | Base `GoToTask.vue` ("Find task", exact-ID title confirmation, keyword results) |
| Routes | Base `TaskRail.vue` (bounded, under "On this page") **and** the foot route sheet with cross-module tags |
| Command plates | Base two-row plate built in `markdown.mjs` with Shiki decorations; the fence's language word as written |
| Mobile tables | Stacked labelled rows with the header row visible as a legend; mobile `thead th { width: auto }` |
| Non-negotiables | See section 5 |

## 2. Resolutions of the remaining differences

### 2.1 Palette and tokens: **adopt Gemini's warm surfaces and its token-file split, keep one meaning per colour**

- **Surfaces and text:** Gemini's values. Light: paper `#faf9f5`, desk
  `#f1efe9`, soft `#eae7df`, ink `#181c22`, ink-2 `#444c58`, ink-3 `#57606d`,
  rule `#dcd7cb`, strong rule `#c5bfb2`. Dark: paper `#151a22`, desk
  `#10141b`, soft `#1b222c`, ink `#e8e6df`, ink-2 `#b4bec9`, ink-3 `#8c98a8`.
  Dark ink-2 rises from Gemini's `#a9b4c2` to `#b4bec9` for more headroom on
  soft surfaces.
- **Route colour:** Gemini's cobalt, `#135198` light and `#78b9fa` dark.
  Measured: 7.50:1 and 8.41:1 on paper, and 6.52:1 and 6.45:1 on the chip tint.
  Both are higher than my blue in light mode.
- **Command plates:** Gemini's, `#161b22` light and `#0c1016` dark, with
  header bar `#1f2630` / `#161c24`.
- **Theme colour metas** follow the paper colours (`#faf9f5` / `#151a22`).
- **CSS split** (Gemini): `theme/tokens.css` holds colour, type and radius
  tokens for both themes; `theme/components.css` holds the components (task
  header, plates, marks, cues, outcome rows, rail, route sheet, directory,
  find, home sheet); `theme/custom.css` holds VitePress overrides and document
  typography. The CSS no-hiding guard covers **all three** files.
- **One meaning per colour:**
  - **Cobalt** means navigation: task routes, links, and the focus ring.
  - **Amber/yellow** means a blank to replace.
  - **The ink slab with a square** means a stop state.
  - **Neutral ink-bordered bands** are for module context, IMPORTANT, and the
    Enter when and Question cues.
  - **Pressed toggles** (Wrap lines) use a neutral plate-ink border and wash,
    **not** cobalt. This narrows Gemini's "subtle cobalt" active state so blue
    never means "on".

### 2.2 Placeholder treatment: **one amber/yellow family, solid on paper, a wash on plates, always with a dashed underline**

Gemini's proposal already endorses this mix.

- **On paper (prose and tables):** a solid highlighter (`#ffe45c` light /
  `#f0cf45` dark) with dark text (`#1b1600` / `#171200`; 14.2:1 and 12.2:1)
  and a dashed underline. In light mode the fill barely differs from paper
  (1.21:1), so the **dashed underline is the required non-colour cue** and
  keeps the blank visible in greyscale and forced colours.
- **On command plates and in the Fill in strip:** a 20% amber wash
  (`rgba(255, 214, 64, 0.2)`) with `#ffe37a` text (8.19:1 light plate,
  9.27:1 dark) and the dashed underline. That is softer than a solid fill when
  a block has 10 or more blanks.
- **Why not amber text alone** (Gemini's earlier light-mode `#8a3f00`): a fill
  plus underline is the strongest "replace this" signal in prose, and both
  proposals keep the fill.

### 2.3 Gemini's extra borrow items

| Item | Resolution | Detail |
| --- | --- | --- |
| **× clear and Escape-to-clear** on Find task | **Adopt** | In `GoToTask.vue`, a visible "Clear" button (text, not a glyph) appears when the field is non-empty; Escape clears the field and the results. Both keep focus in the field. |
| **`#results` on outcome-bullet tasks** (NET-05, AD-03, FTP-02, SMB-01 and the other 14) | **Adopt** | `id="results"` goes to the first decision table in the module context or working section; if there is none, to the first outcome list in the working section. The jump label is **"Result table"** for a table and **"Outcomes"** for an outcome list. The outcome-list rule (`isOutcomeList`) moves into `scripts/checklist.mjs` and is shared with `markdown.mjs`, as `isDecisionHeaders` is, so a jump and its target cannot disagree. |
| **Home "Full-text search /" button, global `/`, active sidebar auto-scroll** | **Adopt the button and the auto-scroll; reuse VitePress's existing `/`** | VitePress local search already binds `/` (in `VPNavBarSearch`, guarded against editable fields), so no second listener is added. The home button opens the same search by activating the nav search control and shows `/` as its key hint. On each route change the active sidebar item scrolls into view (`block: "nearest"`), instantly under reduced motion. |
| **Soft-tinted cobalt route chips** | **Adopt** | `.route` gets a 9% (light) / 14% (dark) cobalt tint, a 1px cobalt border at about 35% alpha, a 4px radius, and the drawn arrow. Abbreviated parts such as `/08` keep the chip without the arrow. Route text is at least 6.45:1 on the tint (measured). |
| **Module-page top strip** | **Adopt, with exact titles** | Module pages get the header row: "Checklist / *Module* · N tasks", then **Box route** and **NET-05: Choose a service to investigate**. That is the exact source title; Gemini's "Service dispatch (NET-05)" label is not used. |
| **Gemini's unique regression tests** | **Adopt all** | Listed in section 5.5 |

### 2.4 My extra items

| Item | Resolution | Detail |
| --- | --- | --- |
| **Title tooltips on plain task IDs in prose** | **Keep.** Gemini already has the same thing (`op-task-ref`), so this is shared. | `<span class="task-id" title="ID: exact title">`, neutral mono, never cobalt |
| **Route sheet in the outline** | **Keep** | The foot route sheet's `h2` gets `id="task-routes"`, titled "Recorded routes for *ID*", so "On this page" lists it and the Routes (n) jump targets it |
| **DejaVu Sans Mono in the mono stack** | **Keep** | `"Cascadia Mono", ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", "Liberation Mono", monospace`, so Kali gets its default mono before Liberation |

### 2.5 Smaller points settled while reconciling

| Point | Resolution | Reason |
| --- | --- | --- |
| Shiki theme | **`github-dark-dimmed`** (Gemini) with colour replacements: `#768390 → #8b96a3` and `#2d333b → #a9b4c2` | Measured: my current `github-dark` renders comments at **3.59:1** on the plate, which fails AA. Dimmed comments are 4.46:1, just short; the replacement reaches 5.76:1 (light plate) and 6.35:1 (dark plate). A new test checks every inline `--shiki-*` colour in the built HTML against both plate colours (at least 4.5:1). |
| Home "Where to enter" | **Gemini's ruled sheet layout**, generated at build time | Each row: the When cell and the **verbatim decision cell** from the box route (route marks linked), then one row per destination with its ID and exact title. The generator writes `site/.vitepress/generated/where-to-enter.md` from the parsed preface, including every row whose decision begins with a task route (5 rows), and `site/index.md` includes it with `<!--@include: ...-->`. No hand-copied quotes, no client JSON, and the content stays in local search. |
| Home order | Title and edition, IMPORTANT, jump box and Full-text search, three actions, **Where to enter**, then the base's **"Reading a task" legend** (blank, route, stop, plain ID), **How to use it**, and **What this site changes** | Both proposals |
| Question cue | Neutral band with a heavy ink top rule, semibold question | Both proposals; the existing neutral-colour guard test applies |
| Directory By module layout | Base printed-index columns, read top to bottom | It stays a source-order index; the flat list serves row-wise scanning |
| Session state for the directory mode and filters | None persisted | Product boundary: no state |

## 3. Contrast table (measured for this spec)

| Pair | Light | Dark |
| --- | --- | --- |
| Ink / ink-2 / ink-3 on paper | 16.2 / 8.2 / 6.0 | 14.0 / 9.3 / 6.0 |
| Ink-3 on desk and on soft | 5.5 / 5.2 | 6.3 / 5.5 |
| Cobalt on paper / chip tint / Next-column wash | 7.50 / 6.52 / 6.98 | 8.41 / 6.45 / 7.55 |
| Blank text on paper fill | 14.2 | 12.2 |
| Plate blank `#ffe37a` on wash | 8.19 | 9.27 |
| Plate ink / ink-2 on plate | 14.6 / 8.2 | 16.1 / 9.1 |
| Shiki comments after replacement | 5.76 | 6.35 |
| Stop slab text | 16.2 | 14.0 |

All text pairs pass WCAG AA (4.5:1). The light-mode blank fill relies on its
dashed underline as the non-text cue.

## 4. Files

| File | Change |
| --- | --- |
| `scripts/checklist.mjs` | Shared `isOutcomeList`. Frontmatter for jumps: `firstCommand` (`cmd-N`), `resultsKind` (`table`, `outcomes` or none). Module-page fields for the top strip. Writes `where-to-enter.md`. Removes the in-`<main>` meta line. |
| `site/.vitepress/markdown.mjs` | `#results` falls back to the outcome list. Removes `markTaskHeading`. Plain-ID `title` tooltips. Route-chip class is unchanged; the styling lives in CSS. |
| `site/.vitepress/config.mjs` | `github-dark-dimmed` with colour replacements (via the plate transformer's `preprocess`). Both theme-colour metas at the new paper colours. |
| `site/.vitepress/theme/tokens.css`, `components.css`, `custom.css` | The split described in 2.1 |
| `theme/components/TaskHeader.vue` (new) | Task and module header rows |
| `theme/components/HomeJump.vue` (new) | Home jump box and Full-text search button, reusing `task-id.js` |
| `theme/components/GoToTask.vue` | Clear button and Escape |
| `theme/components/TaskDirectory.vue` | By module / Flat list toggle |
| `theme/components/TaskRoutes.vue` | `h2#task-routes` "Recorded routes for *ID*"; Gemini's card layout |
| `theme/index.js` | Mounts `TaskHeader` in `doc-before`; sidebar active-item scroll on route change |
| `site/index.md` | The new order, with the `where-to-enter` include |
| `DESIGN.md`, `site/about/source.md`, `docs/design-rounds/converge-final.md` | Updated to the built result |

## 5. Non-negotiables

1. **Exact copy.** Every plate's rendered text equals its source fence body,
   for all 732 blocks. Copy joins line text with `\n` and does no trimming or
   prompt stripping. A real-click clipboard audit runs before sign-off.
2. **Module context expanded** on all 51 contextual tasks. No `<details>` in
   any task page's `<main>`; at least 14px.
3. **Exact titles and conditions.** Every title shown comes from the catalog.
   The home sheet quotes box-route cells verbatim, including "LNX-01 or WIN-01
   according to the actual host; AD-01 when domain context is assigned or
   observed." and the `→` sequences.
4. **No CSS hiding** in any theme stylesheet. Native `<details>` is used only
   for derived inbound lists of more than 12.
5. **Tests.** All 42 baseline tests stay unchanged, and all 59 base tests stay
   (updated only where markup moves, never weakened). Gemini's unique tests are
   ported:
   - The Question cue uses no brand colour.
   - No theme code imports generated JSON (`catalog.json` or `routes.json`).
   - AD-03 and WSQL-05 table classification.
   - `codeText` prompt-retention edge cases.
   - The `<?php` and Python blank exclusions, and Fill in not `aria-hidden`.
   - No `<details>` in module context.
   - 16px body text on mobile.
   - No remote assets.
   - Both directions of `→` linking.

   New tests:
   - Shiki token contrast of at least 4.5:1 against both plates.
   - The outcome-list `#results` target, and the jump label for each target
     kind.
   - The home sheet against the parsed preface.
   - The module-page strip uses exact titles.
   - The Find Clear button and Escape.
   - The flat list renders all 145 tasks.
6. **The built-page fidelity guard** ("built task pages keep every source word
   and every command line visible in `<main>`") stays unchanged and passes on
   the final build.
7. **Product boundaries.** Static, offline after load, base `/checklist/`,
   local search, no remote assets, no state, and no text implying success.

## 6. Order of work and verification

1. Cut `design/final` from `1fde407`. Port Gemini's unique tests (5.5) first.
2. Split the CSS (2.1) with no visual change, then apply the tokens and route
   chips.
3. Shiki theme and colour replacements, plus the contrast test.
4. Task header and module strip; remove the meta line and the H1 stamp.
   Update the jump test.
5. Outcome-list `#results`, with the shared rule.
6. Home: the generated Where to enter partial, the jump box and Full-text
   search, then the legend.
7. Find Clear and Escape; directory flat list; sidebar auto-scroll.
8. Docs: DESIGN.md, `source.md`, `converge-final.md`.

Every commit keeps `pnpm test` green. After step 8, both agents independently
run:

- `pnpm test` and `pnpm build`.
- The 732-block real-click copy audit.
- The static fidelity checks.
- The sidebar, directory and home completeness checks.
- The 531 page-width overflow sweep.
- Screenshots: home, index, box route, NET-01, WEB-09, NET-05, WSQL-01, AD-03,
  AD-05, WEXEC-04, and the HTTP and `linux_privilege` modules, at 390 and
  1440px in light and dark.

Both must score at least 9.5 with no blocking items before the coordinator
opens the pull request to `main`.
