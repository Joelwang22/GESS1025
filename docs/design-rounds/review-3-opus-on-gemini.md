# Round 3 review: Opus on Gemini "Slate & Signal" v3

Reviewed: `design/gemini` at `c02a796`. The later commit `6028867` adds only
Gemini's review document. Reviewer: `claude-opus-5-5`. I did not edit the
Gemini worktree. Screenshots are in `.superpowers/review-3/` (Git-ignored).

**Score: 9.6 / 10** (round 1: 8.0, round 2: 9.3)

I would ship this to an OSCP candidate as it stands.

## Fidelity, re-run on the built site

| Check | Result |
| --- | --- |
| `pnpm test` | 57 pass, 0 fail, 0 skipped |
| `pnpm build` | Succeeds |
| **Real Copy clicks on all 732 command blocks**, with the clipboard compared to each source fence | **732 of 732 exact**; one copy control per block; no VitePress hover-only buttons |
| Module context on all 51 contextual tasks | All expanded; no `<details>` in any task page's `<main>` |
| Hiding techniques in the three theme stylesheets | None. The mobile quick-filter row uses `overflow-x: auto`, which scrolls. |
| Overflow sweep: all 177 pages at 390, 768 and 1280px | 531 page-widths, no horizontal overflow |

## Completeness after moving catalog data into `themeConfig.sidebar`

| Check | Result |
| --- | --- |
| Shipped site data (`__VP_SITE_DATA__`) | 28 groups, 145 items, in source order; every `taskTitle` equals the source title |
| Rendered sidebar | 145 distinct task links |
| `/checklist/` server-rendered HTML (no JavaScript) | 145 distinct task links |
| `/checklist/` live, by module and flat list | 145 tasks in each mode; every flat row shows its exact title |
| Home "Where to enter" | 5 rows. Each quotes the box route's When cell and decision wording verbatim, including "SSH-01 → SSH-02: verify the host key…" and "LNX-01 or WIN-01 according to the actual host; AD-01 when domain context is assigned or observed.", with exact titles beside each ID |

## Round 2 recommendations, verified

| # | Recommendation | Status | Evidence |
| --- | --- | --- | --- |
| 1 | First command jump; raise the first plate | **Fixed** | All 145 tasks checked: the jump appears exactly when the working section has a command block (141 tasks), and every target sits above the explanations. WEB-09 has none. WSQL-01's first command line ends at 875px at 1440×900 (above the fold); context is in two columns from 1100px. |
| 2 | Restore the home conditions | **Fixed** | The verbatim conditions are in the built `index.html` |
| 3 | Take blue off the Question cue | **Fixed** | Neutral band with an ink rule, in light and dark (NET-05, AD-03) |
| 4 | Compact the mobile index | **Fixed** | First task at 608px on a 390×844 screen; all of the Network module fits on the first screen |
| 5 | Ship less catalog data; mark plain task IDs | **Fixed** | No component imports `catalog.json`; plain IDs such as `EXP-01` and `NET-03` render as neutral mono references |
| Nit | Breadcrumb wrap; module and box-route pagers | **Fixed** | "task n of N" stays beside the stamp on mobile; module and box-route pages have no pager |

## Regressions

None found.

## Remaining nits (none needed for 9.5)

1. **Desktop context type is 13.5px.** Long contexts render at 13.5px from
   1100px wide (14px on mobile). They hold command-changing instructions, so
   14px would be a safer floor for a 24-hour exam read.
2. **At exactly 1100×900, WSQL-01's first command line ends at 927px**, just
   under the fold. It is above the fold at 1280px and 1440px, and the First
   command jump covers it.
3. **The mobile quick-filter row** relies on the cut-off last pill
   ("Services & dat…") as its only scroll cue. That is acceptable, but a fade
   or an arrow would make it more obvious.

## Scores

| # | Criterion | Weight | Score | Notes |
| --- | --- | ---: | ---: | --- |
| 1 | Mid-box workflow speed and clarity | 2.5 | 2.42 | Expanded context, First command jump, cue rows, outcome rows, route map and verbatim entry conditions form a fast, honest loop. Small deduction for 13.5px context on desktop. |
| 2 | Command presentation and exact copying | 1.5 | 1.48 | Exact on every block, confirmed by click; build-time Fill in strip; Wrap toggle; dark plates with hanging indent. |
| 3 | Wayfinding | 1.5 | 1.45 | Complete sidebar, directory and home after the data move; box route page; filters accept loose IDs; module tags on routes. The quick-filter groups are site-made, though clearly labelled as such. |
| 4 | Hierarchy, scannability and concise chrome | 1.5 | 1.42 | Clean hierarchy; the home entry rows are a little dense, with the quoted condition and the title stacked. |
| 5 | Responsive at 390, 768 and 1440px | 1.0 | 0.97 | No overflow anywhere; mobile index and breadcrumbs fixed. |
| 6 | Accessibility | 1.0 | 0.97 | No hiding, correct toggle semantics, one meaning per colour, good contrast. Desktop context type is 13.5px. |
| 7 | Visual craft and coherence, light and dark | 1.0 | 0.94 | Calm, consistent "Slate & Signal" in both themes. |
| | **Total** | **10.0** | **9.65, rounded to 9.6** | |

## Recommendations to reach 9.5

None. Gemini already meets the target. The nits above are optional.

## Worth borrowing into the Runbook Binder

- **Quoting the box route's decision text on each home row**, as well as the
  When cell, with the exact titles beneath.
- **The breadcrumb, stamp and position on one line above the title, kept
  together.**
- **The flat-list toggle** on the directory.
- **A horizontally scrolling quick-filter row on mobile**, if I ever add
  grouping chips.
