# Round 3 Design Write-up: Gemini — "Slate & Signal" (v3)

Branch: `design/gemini`
Source edition: `2026-11-21.working.132` (145 tasks, 28 modules, 3 supporting references, `content/` untouched)
Responding to: Opus Round 2 review (`9.3 / 10`, `review-2-opus-on-gemini.md`). Target: `>= 9.5 / 10`.

---

## Summary of Round 3 Changes

Round 3 implements all five of Opus's Round 2 recommendations (including both optional items) plus the mobile breadcrumb pairing nit and removing meaningless pagers from module and box-route pages:

1. **Sequential `id="cmd-N"` anchors, `First command` jump, and two-column expanded module context (`>= 1100px`):**
   - `site/.vitepress/config.mjs` assigns `id="cmd-1"`, `id="cmd-2"`, ... (`scroll-margin-top: 84px`) to every rendered command plate.
   - `scripts/checklist.mjs` emits `hasCommand` strictly when `task.working` contains a fenced command block (so browser-only tasks like `WEB-09` do not jump past their decision table into troubleshooting examples), and marks long module contexts (`>= 600` chars) with `data-context-size="long"` while preserving `<section class="ledger-module-context"` intact.
   - `TaskHeader.vue` renders `<a href="#cmd-1">First command</a>` at the front of the jump bar whenever `hasCommand` is true; tightened single-row header spacing plus two-column long context (`13.5px / 1.42`, `columns: 2` from `1100px`) raises `WSQL-01`'s first command plate from `y = 833px` to **`y = 762px`** (`cmd1LineBottom: 875px`), placing the entire first plate and command line cleanly above the fold at `1440×900` with zero collapsing.
2. **Exact source conditions restored on Home's `"Where to enter"` sheet (`HomeWorkbench.vue`):**
   - Every row in Home's `"Where to enter"` sheet now quotes the source Default box route's decision conditions verbatim alongside each destination's exact source title—including `"LNX-01 or WIN-01 according to the actual host; AD-01 when domain context is assigned or observed."` on `"Usable session verified"`, plus `SSH-01 → SSH-02` and `LNX-01 → LNX-03` sequences.
3. **Strict one-meaning-per-colour discipline (`custom.css`):**
   - Removed Route Cobalt blue tint and blue label from `.op-cue-question`, replacing it with a neutral card surface and heavy ink top rule so blue exclusively signifies clickable links and task routes.
4. **Compact mobile directory (`ChecklistDirectory.vue`, `components.css`, `site/checklist/index.md`):**
   - Below `640px`, the site quick-filter pills sit on a single horizontally scrolling row (`flex-wrap: nowrap; overflow-x: auto;`) with tightened toolbar/caption spacing, bringing the first task (`NET-01`) up from `~830px` to **`608px`** so all five `Network` tasks appear on the first `390×844` mobile screen with zero page-level horizontal overflow.
5. **Client bundle reduction, plain task-ID styling, mobile breadcrumb pairing, and clean pagers:**
   - Attached structured module/task metadata to `themeConfig.sidebar` in `site/.vitepress/config.mjs` and removed all `catalog.json` imports from `HomeWorkbench.vue`, `SidebarFilter.vue`, and `ChecklistDirectory.vue`, cutting the shared client theme chunk from **`125 kB` to `82.4 kB`** (`-42.6 kB`) while keeping `catalog.json` generated for tests.
   - Styled plain task IDs mentioned in prose (`EXP-01`, `NET-03`, `WEB-06`, etc.) with `<span class="op-task-ref">` in neutral tabular mono (`title` tooltip with task title), visually distinct from clickable cobalt route chips and inverted stop stamps.
   - Paired the call-number stamp and `task n of N` inside `.op-task-id-pair` (`white-space: nowrap`) so narrow mobile breadcrumbs (`AD-03`) never strand `"task 3 of 37"` on its own line.
   - Omitted meaningless catalog `prev`/`next` pagers on module pages and `/generated/start`.

---

## Disposition Table — Round 2 Recommendations

| # | Opus Recommendation | Disposition | Files Changed | Verification |
| :-: | :--- | :--- | :--- | :--- |
| 1 | Add `First command` jump + `cmd-N` anchors; compact long module context (e.g. two columns from ~1100px) so `WSQL-01`'s first command is visible at `1440×900` with no collapsing | **Implemented** | `scripts/checklist.mjs`, `site/.vitepress/config.mjs`, `site/.vitepress/theme/components/TaskHeader.vue`, `site/.vitepress/theme/custom.css`, `site/.vitepress/theme/components.css` | New test confirms `href="#cmd-1"` resolves before Explanations on `WSQL-01`/`NET-01` and is omitted on `WEB-09`/`NET-05`; Chrome audit confirms `WSQL-01` `cmd1Top = 762px`, `cmd1LineBottom = 875px` at `1440×900` (fully above 900px fold) and 0 `<details>` in module contexts. |
| 2 | Restore exact source conditions on Home's `"Usable session verified"` row and any other conditional rows | **Implemented** | `site/.vitepress/theme/components/HomeWorkbench.vue`, `site/.vitepress/theme/components.css` | New test verifies `"LNX-01 or WIN-01 according to the actual host; AD-01 when domain context is assigned or observed."` in built `index.html`; all 5 rows quote verbatim source conditions + exact `catalog` titles. |
| 3 | Remove Route Cobalt blue from the `"Question:"` cue so blue only means routes/links | **Implemented** | `site/.vitepress/theme/custom.css` | New test asserts `.vp-doc p.op-cue-question` uses no `--vp-c-brand` tokens; visually verified on `AD-03`, `AD-05`, and `NET-05` in light and dark mode. |
| 4 | Below `640px`, put mobile index quick-filter pills on one horizontally scrolling row so the first task appears on the first screen | **Implemented** | `site/.vitepress/theme/components.css`, `site/checklist/index.md` | Chrome audit confirms `firstDirTaskTop = 608px` at `390×844` (all 5 `Network` tasks visible on the first mobile screen) with `overflowX: 0`. |
| 5 | Optional: avoid shipping `catalog.json` on every page; style plain task IDs in prose | **Implemented** | `site/.vitepress/config.mjs`, `HomeWorkbench.vue`, `SidebarFilter.vue`, `ChecklistDirectory.vue`, `custom.css` | New test confirms zero Vue theme components import `catalog.json` (shared theme chunk dropped from `125 kB` to `82.4 kB`) and `NET-05` prose IDs (`EXP-01`, `NET-03`) render as `.op-task-ref`. |
| Nit | Keep `"task 3 of 37"` paired with call-number stamp on narrow mobile breadcrumbs; omit pagers on module & box-route pages | **Implemented** | `TaskHeader.vue`, `components.css`, `scripts/checklist.mjs` | Chrome audit confirms `idPairHeight = 23px` at 390px on `AD-03` & `AD-05`; test confirms zero `pager-link` on module pages and `/generated/start`. |

---

## Verification Results

- **`pnpm test`**: **57 pass, 0 fail, 0 skipped** (all 42 baseline tests preserved intact + 15 design & fidelity tests, including exhaustive 732-plate verbatim copy check, zero CSS hiding guard, expanded module context check across all contextual tasks, `First command` jump verification, verbatim Home conditions, neutral `Question:` cue check, plain task-ID marking, and zero `catalog.json` imports in Vue theme components).
- **`pnpm build`**: Succeeds cleanly in 9.17s (`Generated 145 tasks across 28 modules from 2026-11-21.working.132.`). Shared client theme chunk: **`82.4 kB`** (down from `125 kB`).
- **Visual & DOM inspection (headless Chrome CDP, 45 screenshots in `.superpowers/round-3/`)**:
  - Verified Home, Checklist Index, `/generated/start`, `NET-01`, `WEB-09`, `NET-05`, `WSQL-01`, `AD-03`, `AD-05`, `WEXEC-04`, and `linux_privilege` module at `1440×900` and `390×844` in light and dark mode.
  - **0 console errors**, **0 horizontal overflow violations**, **`16px` body font** everywhere, `WSQL-01` first command plate completely above the 900px fold (`cmd1Top = 762px`, `cmd1LineBottom = 875px`), mobile index first task at `y = 608px`, and mobile breadcrumb `idPairHeight = 23px`.
