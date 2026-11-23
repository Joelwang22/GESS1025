# Round 2 Design Write-up: Gemini — "Slate & Signal" (v2)

Branch: `design/gemini`
Source edition: `2026-11-21.working.132` (145 tasks, 28 modules, 3 supporting references, `content/` untouched)
Responding to: Opus Round 1 review (`8.0 / 10`) and Coordinator binding rulings (target `>= 9.5 / 10`).

---

## Summary of Round 2 Changes

Round 2 resolves all three binding coordinator rulings and implements all 11 of Opus's recommendations while incorporating several high-leverage structural improvements from the cross-review (verbatim `/generated/start` box route page, build-time command plate headers with named `Fill in:` blanks, per-task route frontmatter eliminating the 262 KB client `routes.json` import, loose task-ID parsing, and aligned sidebar call numbers).

Key architectural shifts:

1. **Zero collapsed task instructions:** Shared module contexts are expanded on every contextual task page (including the 13 tasks in `web_input`, `command_continuation`, `sql_continuation`, and `web_upload`), formatted as a compact neutral desk band (`14.5px`, `1.52` line-height) with a hairline ink top rule and explicit `"Applies to every task in this module"` scope note.
2. **Source-faithful entry & verbatim preface:** The source snapshot's `# How to use this edition` and `## Default box route` table are now published verbatim at `/generated/start` with all route marks linked (including `→`-joined sequences such as `SSH-01 → SSH-02` and `LNX-01 → LNX-03`). Home (`HomeWorkbench.vue`) replaces its previous 3-card paraphrased grid with a compact ruled `"Where to enter"` sheet that quotes the exact `When` rows of the default box route and renders verbatim task titles read directly from `catalog.json`.
3. **Guaranteed verbatim copying & dark terminal plates:** VitePress's hover-only copy button and prompt-stripping normalizer are replaced at build time in `site/.vitepress/config.mjs` and handled by `site/.vitepress/theme/copy.js`. Every command plate renders as a dark terminal well in both light and dark modes (`#161B22` light / `#0C1016` dark, `github-dark-dimmed` syntax highlighting) with a build-time header bar (language, live status, fixed-label `Wrap lines` toggle with `aria-pressed`, always-visible `Copy` button), a build-time `Fill in:` strip listing distinct `<PLACEHOLDER>` tokens (not `aria-hidden`, skipped on non-shell code like Python/HTML/PHP), and `2ch` hanging indents on wrapped lines. `codeText()` joins Shiki `.line` spans with `\n` with zero trimming and zero `$ ` / `> ` stripping, verified across all 732 fenced command blocks by a new exhaustive test.
4. **Non-overloaded semantic signals & zero CSS hiding:** Each visual cue has one unambiguous job:
   - **Route Cobalt + CSS-masked SVG arrow:** clickable task routes and focus rings.
   - **Signal Amber + dashed underline:** `<PLACEHOLDER>` tokens to fill in before execution (inline and in `Fill in:` strips).
   - **Inverted Ink Slab + drawn square:** non-clickable `PAUSE-*` / `GAP-*` stop states.
   - **Neutral ink-bordered desk band:** expanded Module Context and `IMPORTANT` callout.
   - **Zero CSS hiding:** removed `clip: rect(0,0,0,0)` on mobile `thead`, removed `.op-sr-live` off-screen positioning, removed `overflow: hidden` on command plates, and added an automated CSS guard test. Mobile decision tables keep `<thead>` visible in flow as a compact one-line column legend (`Result / Next`, `When / Decision / Next choice`) above stacked labelled rows.
5. **Wayfinding & bundle hygiene:** Per-task route metadata (`taskPosition`, `moduleTaskCount`, `hasDecision`, `routesOut`, `routeStops`, `routesIn`) is embedded into task frontmatter during generation so `TaskHeader.vue` and `TaskRouteMap.vue` no longer import the 262 KB `routes.json` into the client bundle (`routes.json` remains emitted for tests). `ChecklistDirectory.vue` lists every task in every module card (no 3-task truncation) and explicitly labels filter pills as `"Quick filter (site grouping):"`. Loose task-ID normalization (`net1`, `web 9`, `lpriv-2`) works across Home, Sidebar, and Directory.

---

## Disposition Table — Binding Rulings & Recommendations 1–11

| Item | Requirement / Recommendation | Disposition | Files Changed | Verification |
| --- | --- | --- | --- | --- |
| **BLOCKING 1 / Rec 1** | Expand all module contexts on every task page with no `<details>`; keep compact through typography/layout | **Implemented** | `scripts/checklist.mjs`, `site/.vitepress/theme/custom.css`, `site/about/source.md` | New test `every task page keeps module context expanded with no <details> wrapper` checks all contextual tasks; visually verified on `WSQL-01` at 1440px and 390px light/dark. |
| **BLOCKING 2 / Rec 2** | Use exact source task titles everywhere on Home; keep entry points source-backed or explicitly labelled | **Implemented** | `site/.vitepress/theme/components/HomeWorkbench.vue`, `site/.vitepress/theme/components.css` | New test `home page entry points render exact source task titles from catalog` verifies every home entry link against `catalog.json`; rows quote the exact `When` column of the Default box route. |
| **BLOCKING 3 / Rec 4** | Replace VitePress's native copy handler with exact verbatim copy (no trimming, no `$ `/`> ` stripping) and test every command block against source | **Implemented** | `site/.vitepress/theme/copy.js`, `site/.vitepress/theme/index.js`, `site/.vitepress/config.mjs`, `tests/checklist.test.mjs`, `tests/site.test.mjs` | Unit test for `codeText()` + exhaustive test `every built command plate copies the exact source block verbatim and exposes fixed controls` verifying all 732 plates byte-for-byte. |
| **Rec 3** | Publish source preface (`How to use this edition` + `Default box route`) verbatim as a page, link its route marks, and point Home/nav at it | **Implemented** | `scripts/checklist.mjs`, `site/.vitepress/config.mjs`, `site/index.md`, `site/checklist/index.md`, `site/about/source.md` | New test `publishes the verbatim source preface at /generated/start with linked box routes` + unit test for `→`-joined sequences (`SSH-01 → SSH-02`, `LNX-01 → LNX-03`). |
| **Rec 5** | Name the blanks in each plate header (`Fill in: <IP_ADDRESS>`) at build time in the Markdown fence renderer, not post-load JS, and without `aria-hidden` | **Implemented** | `site/.vitepress/config.mjs`, `site/.vitepress/theme/custom.css`, `site/.vitepress/theme/index.js` | New test `renders build-time Fill in blank strips without aria-hidden and skips Python code`; visually verified inline layout on `NET-01`, `AD-05`, and `WEXEC-04`. |
| **Rec 6** | De-overload amber: give stops and module context their own distinct signals; move module context and `IMPORTANT` to neutral ink-bordered bands | **Implemented** | `site/.vitepress/theme/tokens.css`, `site/.vitepress/theme/custom.css` | Amber reserved exclusively for `<PLACEHOLDER>` blanks; inverted ink slab + drawn square for `PAUSE-*`/`GAP-*`; neutral ink-bordered band for Module Context and `IMPORTANT`. Visually verified in light & dark. |
| **Rec 7** | Stop clipping `<thead>` on mobile decision tables (and eliminate all CSS hiding techniques) | **Implemented** | `site/.vitepress/theme/custom.css`, `site/.vitepress/theme/components.css` | Mobile `<thead>` renders visibly in flow as a one-line legend (`Result / Next`); removed `.op-sr-live` and plate `overflow: hidden`. Guarded by `theme stylesheets use zero CSS hiding techniques`. |
| **Rec 8** | Increase command plate contrast in light mode so commands separate from prose at a glance | **Implemented** | `site/.vitepress/config.mjs`, `site/.vitepress/theme/tokens.css`, `site/.vitepress/theme/custom.css` | Deep terminal slate plates (`#161B22` light / `#0C1016` dark) using `github-dark-dimmed` in both themes, with `2ch` hanging indent on wrapped `.line` spans. |
| **Rec 9** | Trim redundant chrome (`REFERENCE & TROUBLESHOOTING`, `N commands` counter, decorative `3px` left borders, Unicode icon glyphs, tall mobile home grid, clipped 390px input placeholder) | **Implemented** | `scripts/checklist.mjs`, `site/.vitepress/theme/components/TaskHeader.vue`, `TaskRouteMap.vue`, `HomeWorkbench.vue`, `custom.css`, `components.css` | Removed eyebrow label, `commandCount`, `3px` stripes, and Unicode arrows/squares; shortened home placeholder to `"Jump by task ID or keyword…"` (zero clipping at 390px); condensed Home entry sheet to 5 compact ruled rows. |
| **Rec 10** | Keep a fixed label (`Wrap lines`) with `aria-pressed` on the wrap toggle instead of mutating both | **Implemented** | `site/.vitepress/config.mjs`, `site/.vitepress/theme/copy.js` | Verified in HTML test (`aria-pressed="true">Wrap lines</button>`) and live headless Chrome click test (`pressed` flips `"true"` → `"false"` while label remains `"Wrap lines"`). |
| **Rec 11** | Show every task in module mode on the directory (no 3-task truncation) and label site groupings explicitly | **Implemented** | `site/.vitepress/theme/components/ChecklistDirectory.vue`, `site/.vitepress/theme/components.css` | Every module card lists all tasks in source order; filter bar explicitly reads `"Quick filter (site grouping):"`. |

---

## Ideas Borrowed from Opus's Round 1 Design

- **Verbatim `/generated/start` preface page** ("Box route" in top nav) with linked `→` task sequences.
- **Per-task route frontmatter** so task chrome does not pull the 262 KB `routes.json` graph into the client JS bundle.
- **Build-time named `Fill in:` blank list** inside the command plate header, restricted to shell/command/text languages (excluding Python/HTML/PHP).
- **Dark terminal command plates in light mode** with `2ch` hanging indent on wrapped continuation lines.
- **Aligned sidebar call-number grid + module task counts**, with `overflow-wrap: break-word` and generous right padding so long titles (`AD-05`, `AD-08`, `AD-10`) never clip.
- **Loose task-ID normalization** (`net1`, `web 9`, `lpriv-2`) shared across Home, Sidebar, and Directory.
- **Expanded decision-table matching** covering 3-column decision tables (`/generated/start`) and `AD-03`'s `Revisit` table without false-matching `WSQL-05`'s SQL expression tables.

---

## Verification Summary

- **`pnpm test`**: **55 passed, 0 failed** (all 42 baseline tests preserved intact + 13 design & fidelity tests covering expanded module contexts, 732-plate byte-for-byte copy parity, verbatim `/generated/start` preface, exact home source titles, build-time `Fill in:` strips, `AD-03`/`WSQL-05` table classification, loose ID normalization, `→` route linking, and zero CSS hiding).
- **`pnpm build`**: Succeeds cleanly (`Generated 145 tasks across 28 modules from 2026-11-21.working.132.`, built in ~10s).
- **Visual & DOM inspection (headless Chrome CDP, 53 screenshots in `.superpowers/round-2/`)**:
  - Inspected Home, Checklist Index, `/generated/start`, `NET-01`, `WEB-09`, `NET-05`, `WSQL-01`, `AD-03`, `AD-05`, `WEXEC-04`, and `linux_privilege` module at `1440×900`, `768×900`, and `390×844` in light and dark mode.
  - Zero console/runtime errors, zero horizontal overflow across all 50 viewport/theme/page combinations, `16px` body font everywhere, zero `<details>` inside module contexts, zero sidebar clipping (`sidebarScrollOverflow: 0`, `clippedCount: 0`), and live `Wrap lines` toggle confirmed.
  - Visual review caught and fixed three real polish defects before finalizing: VitePress's `.vp-doc div[class*="language-"] code` stretching `.op-cmd-blanks` chips to full width, desktop `th:first-child` width leaking into mobile `Result / Next` legend spacing, and `"On this task"` outline label appearing on non-task pages (updated to `"On this page"`).
