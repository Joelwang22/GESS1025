# Round 2: Opus "Runbook Binder" improvements

Branch `design/opus`. Model `claude-opus-5-5`. This round responds to Gemini's
review (8.4 / 10, `review-1-gemini-on-opus.md` in the Gemini worktree) and the
coordinator's binding rulings. Module context stays expanded on every page.

## Disposition of Gemini's recommendations

| # | Recommendation | Disposition | What changed, or why not |
| --- | --- | --- | --- |
| 1 | Fix sidebar title clipping (AD-05, AD-08, NET-03) | **Implemented** | Root cause: I had set `--vp-layout-max-width: 1520px`. VitePress derives the sidebar width from it, so at 1440px the sidebar was 264px wide while its groups were 240px plus 32px of padding. Every title box ran 8px past the clipping edge. The maximum is back to 1440px; the sidebar is 304px and no title clips (measured on AD-05, AD-08 and NET-03). A test pins the value. |
| 2 | Bound the sticky rail on hub tasks | **Implemented** | The rail moved below the outline, so "On this page" sits at the top of the aside (y = 112 on every task, previously 846–1,087 on hubs). Hub tasks with more than six routes show call-number chips, with titles on hover and focus, plus a link to the route sheet. Rail height dropped from 714–955px to 289–321px on NET-05, AD-03, WIN-01 and WSQL-01. Nothing scrolls inside the rail. |
| 3a | Keyword filtering on `/checklist/` | **Implemented** | The directory gains a filter by ID, title word or module, with a live count ("2 of 145 tasks match 'kerberos'"). With no query, all 145 tasks render, including in the static HTML. |
| 3b | Replace the two-column flow so MSSQL does not sit beside Network | **Declined** | A row-wise grid either leaves large gaps (Windows and AD has 37 tasks, its neighbour 4) or puts unrelated modules on one line. The directory reads like a printed index: down each column, in source order. The filter now handles targeted lookup. |
| 3c | Keyword fallback in the ID box | **Implemented** | "Go to task ID" became **Find task**. An exact or loose ID still opens on Enter. Other text lists live matches by ID, title word or module, showing the first 12 and the total, and Enter opens the first. "suid" gives 3 results and "smb" the SMB tasks. This also adopts Gemini's live sidebar filter. |
| 4 | Collapse long module contexts in `<details>` | **Declined (coordinator ruling)** | Context changes how the commands run (for example `--get` to `--request POST`, required `--data-urlencode` fields, the session header, curl 8.4+), so it stays expanded. To meet the goal of raising the first command without collapsing anything, context is set at 14px / 1.5 with tighter padding, and from 1100px wide it flows into two columns on task pages. Together with a shorter meta line and heading, WSQL-01's first plate moved from y = 869 to 756 at 1440×900, so its first command line is fully visible. On a 390px phone the first plate is at 1,258px; Gemini measured the first command line at 1,425px in round 1. The new **First command** jump reaches it in one tap. |
| 5a | Keep Copy on one row on multi-blank plates | **Implemented** | The plate header now has two rows. Row one (language, Wrap lines, Copy) never wraps its controls away. Row two lists the blanks. On AD-03 at 390px, Copy stays top right. |
| 5b | Show at most 3–4 blanks with "+N more" | **Declined** | Truncating the list would hide a blank the operator must replace. Every blank is listed on its own row instead, which meets the goal (Copy pinned, header readable) without hiding any. |
| 5c | Soften blank fills on dark plates | **Implemented** | Blanks on plates use a 20% yellow wash with `#ffe37a` text and the dashed underline. Blanks on paper keep the solid highlighter. |
| 5d | Wrap/Scroll toggle | **Implemented** | A **Wrap lines** toggle with `aria-pressed` and a fixed label. Off, long lines scroll sideways inside the plate with no page overflow. Copy is unchanged: I checked a real clipboard read after toggling. |
| 6a | Structure "Enter when:", "Question:" and outcome bullets | **Implemented** | All 36 cue paragraphs become labelled rows; the question is set semibold. 103 of the 105 outcome-slug bullets become ruled rows with the slug in a mono chip. The other two are in lists that mix slugged and plain bullets, which stay ordinary lists. Words and order are unchanged; the word audit still passes. |
| 6b | Tighten decision-table detection | **Implemented** | One shared rule (`isDecisionHeaders`) used by both the generator and the renderer: the last header starts with "Next" or "Revisit", unless it ends in "expression". WSQL-05's two SQL syntax tables are no longer decision tables; AD-03's Revisit table is. |
| 7a | Ship both `theme-color` tags | **Implemented** | VitePress keeps one meta tag per name, so both tags are written in `transformHtml`. Tested in the built HTML. |
| 7b | Take the trailing dot out of the stamp | **Implemented** | The stamp holds `NET-01`. The source period stays in the heading, in muted ink, just after the box, so the heading text is unchanged. |
| 7c | Module pages: no outline, aligned IDs | **Implemented** | `outline: false`, and an ID column with the exact "ID. Title" text. I also removed the meaningless "Next in source order: NET-01" pager from module pages and the box route page (tested). |
| 7d | Update `site/about/source.md` | **Implemented** | It now documents the box route page, every route-mark form including `→`, context on every task, the meta line and jumps, route metadata, and the build-time marks. |

### Other findings from Gemini's review

| Finding | Disposition |
| --- | --- |
| `.sb-count` contrast near the AA floor | Implemented: 12px in `--rb-ink-2` (7.8:1 on desk in light mode, 10.3:1 in dark). |
| Meta line wraps onto a second row | Implemented: the "Jump to" label is gone. The jump chips sit on the meta line, and on WSQL-01 at 1440px it is one row. |

## Adopted from Gemini's design

- The jump bar (First command, Result table, Explanations, Routes), built at
  generation time. Each jump appears only when its target exists, and a test
  checks every target on every task page.
- Enter when and Question rows.
- Outcome rows with slug chips.
- Module tags on cross-module route destinations in the route sheet.
- A live task filter, merged into Find task.
- A per-plate Wrap toggle.
- A Show / Hide cue on the folded inbound list.

## Verification

| Command | Result |
| --- | --- |
| `pnpm test` | **58 pass, 0 fail, 0 skipped** (51 in round 1, plus 7 new) |
| `pnpm build` | Succeeds; the only warning is the existing local search index chunk |
| Playwright overflow sweep: all 177 pages at 390, 768 and 1280px | 531 page-widths, theme loaded on all, no horizontal overflow |
| Sidebar clipping probe at 1440px (AD-05, AD-08, NET-03) | No clipped titles |
| Rail probe at 1440×900 (NET-05, AD-03, WIN-01, WSQL-01) | Rail 289–321px; outline top 112px on all |
| Interaction run | Find "suid" gives 3 matches; "web9" + Enter opens WEB-09; Wrap off scrolls inside the plate (page overflow 0) and Copy still equals the rendered text; Result table jump lands at y = 80; directory "kerberos" gives 2 of 145 |
| Screenshots at 1440 and 390px, light and dark: home, index, box route, NET-01, WEB-09, NET-05, WSQL-01, AD-03, WEXEC-04, HTTP module | `.superpowers/round-2/final/` (Git-ignored) |

New tests:

- Decision-table semantics.
- Every jump on every task page resolves, and appears only when its target
  exists.
- Cues and outcome rows keep their exact words.
- Plate header row layout.
- Find-task matching.
- Module pages: exact titles, no outline, no pager.
- Both `theme-color` tags, and the 1440px layout guard.

## Known weaknesses

- **On a 390px phone, long-context tasks still open with about a screen of
  context.** WSQL-01's first command is at about 1,260px. Expanded context is a
  ruling, not an oversight; the First command jump is the mitigation.
- **Two-column context needs at least 1100px.** Narrower laptops and split
  screens get the single compact column.
- **The directory still reads down columns**; the filter is the way to narrow
  it.
- **Find task needs JavaScript to list matches.** Without it, the sidebar, the
  directory and local search still work.
- **Earlier weaknesses still stand:** system fonts only, the search-index chunk
  warning, and the stale `.impeccable/design.json` sidecar.
