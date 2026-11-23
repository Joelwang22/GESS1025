# Round 2 Cross-Review: Gemini on Opus ("Runbook Binder")

- **Reviewed target:** `C:\Users\joelw\.t3\worktrees\checklist\design-opus-7daaa63e739d0723` (branch `design/opus`, commit `303178b`)
- **Review evidence:** Ran `pnpm test` (**58/58 passed**) and `pnpm build` (clean in 9.50s) in Opus's worktree; ran an independent programmatic HTML & CSS fidelity audit across all 145 tasks and all 732 command plates; served Opus's `site/.vitepress/dist` under `/checklist/` and inspected **55 headless Chrome screenshots** (saved under `.superpowers/review-2/`) plus live DOM/interaction probes across `1440×900`, `768×900`, and `390×844` in light and dark mode.

---

## Fidelity & Correctness Verification

- **Source content & expanded module contexts:** All 145 tasks, 28 modules, `/generated/start`, and 3 supporting references preserve full source wording and order. Zero `<details>` elements wrap module contexts (`0` found across all 145 task pages). No CSS hiding (`display: none`, `visibility: hidden`, `clip`, or off-screen hiding) exists in `custom.css`.
- **Command copy exactness:** Audited all **732 rendered `.cmd-plate` blocks** against their source Markdown fences using exact `.line` joining: **0 mismatches**. Live toggle test on `WEXEC-04` confirmed `Wrap lines` keeps its fixed label while flipping `aria-pressed` (`"true"` → `"false"`), causes zero page overflow (`overflowX: 0`), and leaves rendered line text byte-identical.
- **Runtime & responsive health:** **0 console errors**, **`overflowX: 0`** on every tested page at `390px`, `768px`, and `1440px`, and **`16px` body font** across all viewports.
- **Blocking defects:** **None.**

---

## Verification of Round 1 Recommendations

| # | Round 1 Recommendation | Status on Real Build | Evidence |
| :-: | :--- | :--- | :--- |
| 1 | Fix desktop sidebar title clipping (`AD-05`, `AD-08`, `NET-03`) | **Verified fixed** | Sidebar is `304px` wide at 1440px (`sidebarOverflow: 0`, `clippedCount: 0`); `AD-05` and `AD-08` wrap cleanly with generous right margin. |
| 2 | Bound sticky rail on hub tasks (`NET-05`, `AD-03`, `WIN-01`, `WSQL-01`) | **Verified fixed** | `"On this page"` sits at `y = 112px` on every hub; chip-mode `TaskRail` shrinks rail height to `289–321px` on `NET-05`, `WSQL-01`, and `AD-03` with stop states and route-sheet link visible above the fold. |
| 3 | Keyword filter on `/checklist/` and keyword fallback in `GoToTask` | **Verified fixed** | `/checklist/` adds live `"Filter by ID, title or module"` with Clear button and live count (`role="status"`) while keeping all 145 tasks server-rendered; sidebar `Find task` accepts exact/loose IDs and live title/module words. Keeping `columns: 2` is reasonable now that filtering handles targeted lookup. |
| 4 | Module context compactness (coordinator ruling: must stay expanded) | **Verified strong** | Compact `14px / 1.5` styling + two-column flow from `>= 1100px` drops `WSQL-01`'s 1,467-char context to `329px` tall and brings the first command plate into the initial 900px desktop viewport (`plateTop: 756px`). Mobile (`390px`) has a one-tap `First command` jump chip. |
| 5 | Keep `Copy` on Row 1 on multi-blank plates, soften dark blank wash, add `Wrap lines` toggle | **Verified fixed** | Two-row `.cmd-head` pins language, fixed-label `Wrap lines` (`aria-pressed`), and `Copy` on Row 1 (`copyTop: 6px` at 390px on `AD-03` and `WEXEC-04`), listing every blank on Row 2 without truncation. Softened dark-plate yellow wash (`#ffe37a` + 20% wash) eliminates Round 1 glare. |
| 6 | Structure `Enter when:` / `Question:` cues & outcome bullets; tighten decision-table detection | **Verified fixed** | Cue blocks and ruled `snake_case:` outcome rows render cleanly (`NET-05`, `AD-03`). Shared `isDecisionHeaders` marks `AD-03`'s `Revisit` table as `.decision` and leaves `WSQL-05`'s two SQL expression tables as data tables. |
| 7 | Dual `theme-color`, clean `.h-id` stamp, module page outline/alignment, updated `source.md`, `.sb-count` contrast | **Verified fixed** | Both light and dark `theme-color` tags ship via `transformHtml`; `[NET-01]` stamp has no trailing dot inside the box; module pages drop the redundant outline and meaningless pager and align IDs; `source.md` documents all transforms; `.sb-count` upgraded to `--rb-ink-2`. |

---

## Rubric Breakdown — **9.5 / 10**

| # | Criterion | Score | Evidence & Rationale |
| :-: | :--- | :-: | :--- |
| 1 | **Mid-box workflow speed and clarity** | **2.4 / 2.5** | Verbatim `/generated/start` box route, conditional landmark jump bar (`First command`, `Result table`, `Explanations`, `Routes`), structured `Enter when:` / `Question:` cues, ruled outcome rows, and two-column expanded module context putting `WSQL-01`'s first command above the fold at 1440×900. Minor nits: on browser-only working steps like `WEB-09`, `First command` jumps past the result table into Explanations; CSS `columns: 2` can split a sentence across columns on `WSQL-01`. |
| 2 | **Command presentation and exact copying** | **1.5 / 1.5** | 732/732 exact copy parity verified; two-row `.cmd-head` keeps `lang`, fixed-label `Wrap lines` (`aria-pressed`), and `Copy` pinned top-right at every width; every blank listed on Row 2 without truncation; softened dark-plate amber wash; `2ch` hanging indents; zero false blanks on Python or `<0.4096>`. |
| 3 | **Wayfinding (sidebar, index, search, routes, entry points)** | **1.4 / 1.5** | Zero sidebar clipping, live `Find task` (loose IDs + keywords), live `/checklist/` filter, bounded chip-mode `TaskRail` below `"On this page"`, cross-module tags in the route sheet, and clean module/start pages without meaningless pagers. Minor nits: Home's `"Where to enter"` lists bare task IDs (`→ NET-01`) without inline task titles, and unfiltered `/checklist/` still places `MSSQL` beside `Network` via CSS `columns: 2`. |
| 4 | **Hierarchy, scannability and concise chrome** | **1.4 / 1.5** | Crisp binder aesthetic, accurate decision vs. data table classification (`AD-03` / `WSQL-05`), clean module pages, accurate provenance page, and single-row meta/jump strip on most tasks. Minor nit: the muted source period outside the call-number box (`[NET-01] .`) reads like a stray speck on its own line above the title. |
| 5 | **Responsive layout at 390, 768 and 1440px** | **0.9 / 1.0** | Zero horizontal overflow at all three widths, `16px` body text everywhere, `Copy` pinned top-right at 390px, and clean non-hiding stacked mobile tables. Minor nit: on 390px phones, multi-blank headers (`WEXEC-04`) grow to `129px` tall and long expanded contexts still occupy ~656px before the first step (expected under the ruling and mitigated by `First command`). |
| 6 | **Accessibility** | **1.0 / 1.0** | Distinct shape+color marks throughout, zero CSS hiding, fixed-label `Wrap lines` with `aria-pressed`, `aria-live` status on Copy / Find / Directory filter, both `theme-color` tags shipped, upgraded `.sb-count` contrast, `forced-colors` and `prefers-reduced-motion` support, and `"On this page"` visible on every hub. |
| 7 | **Visual craft and coherence in light and dark** | **0.9 / 1.0** | Calm, distinctive, cohesive "Runbook Binder" craft in both light and dark modes; softened dark-plate blank wash looks great on dense tasks (`AD-03`, `WEXEC-04`). Minor nit: system-font-only typography introduces OS variance and the isolated period next to `[NET-01] .` slightly interrupts the otherwise razor-sharp heading stamp. |

This build is ready to ship to an OSCP candidate as-is; all remaining items are optional minor polish nits.

---

## Optional Minor Polish (Already >= 9.5)

1. **`scripts/checklist.mjs` (`First command` jump on `WEB-09` and similar tasks):** Scope `hasCommand` / `#first-command` to fenced blocks inside `task.working` rather than `task.explanation`, so tasks whose working step is a browser-UI check don't jump past the decision table into troubleshooting examples.
2. **`site/index.md` (`Where to enter` table):** Include each destination's exact source title alongside its `→ TASK-ID` link so first-time readers see what `NET-01`, `NET-05`, and `SSH-01` ask without hovering.
3. **`site/.vitepress/theme/components/GoToTask.vue`:** When `exact` matches a task ID (e.g., typing `net1`), display the task's source title in the status line (`Press Enter to open NET-01 — Check connectivity.`) so the operator confirms the target before navigating.

---

## Worth Borrowing into Gemini's Design

1. **Two-column expanded module context at `>= 1100px` (`custom.css`)** — cuts `WSQL-01`'s 1,467-char expanded context to `329px` so the first command stays visible in the initial 1440×900 viewport without collapsing a single word.
2. **`First command` jump chip on task pages (`scripts/checklist.mjs`)** — especially valuable on `390px` phones when a long expanded module context sits above the first command.
3. **Removing meaningless `Previous/Next in source order` pagers from module pages and `/generated/start`** — keeps catalog pagers strictly on task pages where source-order stepping makes sense.
4. **Compact chip-mode route list inside the right aside below `"On this page"`** — surfaces outbound task IDs and stop states beside long tasks without pushing `"On this page"` out of view.
