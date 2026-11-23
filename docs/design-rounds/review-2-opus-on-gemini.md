# Round 2 review: Opus on Gemini "Slate & Signal" v2

Reviewed: `design/gemini` at `d8f7401`. The later commit `9f6efaf` adds only
Gemini's review document. Reviewer: `claude-opus-5-5`. I did not edit the
Gemini worktree. Screenshots are in `.superpowers/review-2/` (Git-ignored).

**Score: 9.3 / 10** (round 1: 8.0)

## What I checked, on the built site

| Check | Result |
| --- | --- |
| `pnpm test` in the Gemini worktree | 55 pass, 0 fail, 0 skipped |
| `pnpm build` | Succeeds |
| **Real Copy clicks on all 732 command blocks** (Chromium, clipboard read back, compared with each source fence) | **732 of 732 exact**; one copy control per block; no VitePress hover-only buttons left |
| Module context on all 51 contextual tasks | All present and expanded; no `<details>` in any task page's `<main>` |
| Home entry titles against `catalog.json` | All exact; the "When" rows quote the source verbatim |
| Hiding techniques in the three theme stylesheets | None (`display: none`, `visibility: hidden`, `clip`, hidden overflow, zero height, off-screen) |
| Overflow sweep: all 177 pages at 390, 768 and 1280px | 531 page-widths, theme loaded on all, no horizontal overflow |
| Sidebar clipping at 1440px | None |
| Plate header | Copy stays on the language row at 390 and 1440px, including AD-03 with four blanks |
| Screenshots at 1440 and 390px, light and dark: home, index, box route, NET-01, WEB-09, NET-05, WSQL-01, AD-03, `linux_privilege` module | Reviewed |

## Round 1 items, re-verified

| Round 1 item | Status | Evidence |
| --- | --- | --- |
| Blocking 1: long contexts collapsed | **Fixed** | All 51 contextual tasks are expanded in a neutral ink-bordered band at 14.5px |
| Blocking 2: paraphrased home titles, invented column | **Fixed** | Titles come from `catalog.json`; rows quote the box route's "When" column. One nit below. |
| Blocking 3: copy relied on VitePress normalisation | **Fixed** | New exact handler; 732 of 732 real clicks match the source |
| Rec 3: publish the preface | **Fixed** | `/generated/start` is verbatim, with linked routes including `→` runs |
| Rec 5: name blanks at build time | **Fixed** | "Fill in:" strip in the plate header, not `aria-hidden`, skipped for Python |
| Rec 6: de-overload amber | **Fixed** | Amber only on blanks; stops are inverted slabs; context and IMPORTANT are neutral bands |
| Rec 7: stop clipping `<thead>` | **Fixed** | The mobile legend stays visible in the flow; a CSS guard test is added |
| Rec 8: plate contrast in light mode | **Fixed** | Dark terminal plates in both themes |
| Rec 9: trim chrome | **Fixed** | Eyebrow label, command counters, 3px stripes and Unicode glyph icons are gone |
| Rec 10: Wrap toggle semantics | **Fixed** | Fixed "Wrap lines" label with `aria-pressed` |
| Rec 11: directory truncation and taxonomy labels | **Fixed** | Every task is listed; the pills are labelled "Quick filter (site grouping)" |

## Remaining issues (no fidelity defects)

1. **WSQL-01's first command is still below the fold.** With the context
   expanded, the first plate starts at 833px at 1440×900, so its first command
   line is under the fold. On a 390px phone it starts at 1,429px. The jump bar
   offers Decision, Explanations and Routes but no jump to the first command,
   so the long-context tasks (13 of them) start with a scroll hunt.
2. **One home row drops the source's conditions.** "Usable session verified"
   lists LNX-01, WIN-01 and AD-01 as equal choices. The source says
   "**LNX-01** or **WIN-01** according to the actual host; **AD-01** when
   domain context is assigned or observed." The full text is on the box route
   page, but the summary loses the "according to the actual host" choice and
   the condition for AD-01.
3. **The Question cue uses route blue.** It gets a blue-tinted band and a blue
   label, while blue otherwise means "this goes to another task". It weakens
   the one-meaning-per-colour discipline that Rec 6 established for amber.
4. **The mobile index puts a lot of chrome before the content.** At 390px the
   filter, mode toggle, six quick-filter pills and a status line come before
   the first task, which starts at about 830px.
5. **Every page ships the catalog.** `SidebarFilter.vue`, `HomeWorkbench.vue`
   and `ChecklistDirectory.vue` import `catalog.json`, so the shared theme chunk
   is 125 kB (my build's is 75 kB). It is small once compressed, but it is on
   every page, including offline loads.
6. **Small nits:**
   - On narrow mobile breadcrumbs, "task 3 of 37" wraps onto its own line.
   - Plain task IDs in prose ("EXP-01", "NET-03" on NET-05) are not set as
     IDs, so they scan like words.

## Scores

| # | Criterion | Weight | Score | Notes |
| --- | --- | ---: | ---: | --- |
| 1 | Mid-box workflow speed and clarity | 2.5 | 2.30 | Expanded context, exact copy, Fill in strip, jump bar, cue rows, outcome rows and route map make a fast loop. Deductions: no jump to the first command, and it sits below the fold on long-context tasks; the home row drops the conditions. |
| 2 | Command presentation and exact copying | 1.5 | 1.45 | Exact on every block, verified by click; build-time blank list; Wrap toggle; dark plates with hanging indent. |
| 3 | Wayfinding | 1.5 | 1.40 | Box route page, sidebar filter with loose IDs, home jump, flat and by-module directory, route map with module tags, breadcrumbs. The small deduction is for the home row conditions. |
| 4 | Hierarchy, scannability and concise chrome | 1.5 | 1.35 | Much cleaner than round 1. Deductions: the mobile index stacks controls ahead of the list; plain IDs in prose are not marked. |
| 5 | Responsive at 390, 768 and 1440px | 1.0 | 0.95 | No overflow anywhere; stacked tables keep a visible legend; the breadcrumb wraps on narrow phones. |
| 6 | Accessibility | 1.0 | 0.95 | No CSS hiding, correct `aria-pressed`, Fill in exposed to assistive technology, good contrast, shape-coded marks. The Question cue's blue blurs the route signal. |
| 7 | Visual craft and coherence, light and dark | 1.0 | 0.90 | Coherent, calm and well tuned in both themes; the blue question band is the one off-system colour. |
| | **Total** | **10.0** | **9.30** | |

I would ship this to an OSCP candidate. Nothing is lost or altered and copying
is exact. The gap to 9.5 is how quickly the long-context tasks reach their
first command, plus two semantic nits.

## Recommendations to reach 9.5

1. **Add a First command jump and raise the first plate on long-context
   tasks** (`TaskHeader.vue`, the generator, `custom.css`). Give every plate an
   anchor (`cmd-1`, and so on) and add "First command" to the jump bar when the
   page has one. Make the context band more compact without collapsing it,
   for example two columns from about 1100px. Expected: WSQL-01's first command
   line visible at 1440×900, and one tap away on mobile.
2. **Restore the conditions on the home "Usable session verified" row**
   (`HomeWorkbench.vue`). Quote the source decision cell ("LNX-01 or WIN-01
   according to the actual host; AD-01 when domain context is assigned or
   observed"), or show only the rows whose decision is a single task.
3. **Take route blue off the Question cue** (`custom.css`). Use the neutral ink
   band, with weight or a rule for emphasis, so blue stays reserved for routes.
4. **Compact the mobile index** (`ChecklistDirectory.vue` / `components.css`).
   Below 640px, put the quick-filter pills on one horizontally scrolling row or
   behind the filter field, so the first task appears within the first screen.
5. **Optional:** load the catalog only where it is needed, and set plain task
   IDs in prose as IDs.

## Worth borrowing into the Runbook Binder

- **Breadcrumb and position above the title** (Checklist / Module / ID), which
  is quicker to read than my meta line on phones.
- **The flat list versus by-module toggle** on the directory.
- **The "Where to enter" sheet with exact titles beside each ID**, which reads
  better than my two-column table. (Keep the source conditions in the decision
  text.)
- **The neutral ink-bordered IMPORTANT band.**
