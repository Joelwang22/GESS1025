# Round 1: Opus design, "Runbook Binder"

Branch `design/opus`. Model `claude-opus-5-5`.

## Concept

Each task page is a procedure sheet from an operations runbook binder, the kind
kept beside a console. The sheet has a stamped call number, a tab note that
applies to every sheet behind its module tab, dark command plates with the
blanks highlighted, a ruled result matrix, and a route sheet at the foot. The
sidebar is the binder's tab edge.

I picked the binder from seven candidates drawn from the reader's world (man
page, aviation QRH, gamebook "turn to", transit map, surveyor's field book,
runbook binder, RFC text) using the impeccable concept roll (seed `8523243c`).
Three disciplines came from the challengers the roll dealt:

- One highlighter mark for the only thing the reader must change: the blanks.
- Marks that carry meaning by shape, not hue alone.
- A visible line between source text and site-derived navigation.

I did not keep the Field Ledger's palette or survey metaphor. I kept its
working ideas: call numbers, unlinked stop states, inbound route lists, and the
rule that module context stays expanded.

## The core loop it optimises

The source prescribes a loop: read context, run one action, compare the result
with the named outcomes, follow the matching route. Every change below serves
one step of that loop.

## What changed and why

### 1. The source's own box route is now published

The snapshot opens with "How to use this edition" and a **Default box route**
table: the source's own guide for working a box. The parser read it, but no page
published it. It is now `/generated/start` ("Box route" in the nav), verbatim,
with its task references linked. A leading export comment, which is invisible
when the source Markdown renders, is the only thing dropped. I added `→` as a
route separator so `**SSH-01 → SSH-02**` links both ends; the only three
occurrences are in this preface, so task pages are unchanged.

The home page now has a **Where to enter** table. It quotes the box route's
**When** cells and the first task each row names, and points to the full row.

### 2. Command plates

- Dark plates in both themes, matching the terminal beside the browser.
- A header that is always visible, with the fence's language word, a **Fill in**
  list of every distinct blank in the block, and a **Copy** button. VitePress's
  copy button only appears on hover.
- Blanks such as `<IP_ADDRESS>` are highlighted inside the code. Shiki
  decorations at build time wrap them in a span, so the code text is unchanged.
  `<0.4096>` and other digit-led literals are never marked.
- Copying is exact. VitePress's handler trims and strips `$ ` and `> ` prefixes
  from shell blocks, so it is replaced. The new handler joins each rendered
  line's text with newlines, with no other processing. A test checks every one
  of the 732 plates against its source block, byte for byte.
- Long lines wrap with a two-character hanging indent, so a wrapped line never
  looks like a new command.
- Ligatures are off in code; Cascadia Mono comes before Cascadia Code.

### 3. Routes, stops and IDs

- Task links in route marks get a drawn arrow, mono bold blue, and a tooltip
  with the destination's exact title.
- Terminal states (`PAUSE-*`, `GAP-*`) become ink slabs with a square glyph and
  are never links. This covers plain `Next: PAUSE-…` forms as well as bold ones.
- Plain task IDs in prose are set in mono so they scan as IDs.
- Tables whose last header starts with "Next" become decision tables: a heavy
  head rule and a blue wash on the action column.

### 4. Task page structure (same order as the source)

1. A call-number stamp above the exact title (the heading text is unchanged).
2. A meta line: module link, "task n of N", and a jump to explanations.
3. Module context as a bordered tab note, labelled "Applies to every task in
   this module". Always expanded (the longest is 1,467 characters).
4. The working section.
5. Explanations and troubleshooting in a desk-tone band under a heavy rule.

Outside `<main>`:

- **Aside rail** (from 1280px): the task's ID, module, and its routes with
  destination titles, sticky while reading the result table.
- **Route sheet** above the pager: every linked task with its title, the stop
  states named, and the tasks that link here.
- **Pager** relabelled "Previous/Next in source order", so it is not confused
  with the checklist's own "Next:" routes.

Each task's derived routes are written into that page's frontmatter by the
generator. That keeps the 262 KB `routes.json` out of the client bundle.

### 5. Sidebar, index and search

- The sidebar sets call numbers in a fixed mono column with titles hanging
  beside them, shows a task count on each module tab, and is more compact. The
  generated `sidebar.json` labels are unchanged; the config renders them.
- **Go to task ID** sits at the top of the sidebar: a mono input with a datalist
  of all 145 IDs and titles. It accepts loose spellings ("web9", "lpriv 2") and
  reports unknown IDs inline. Local search is unchanged and still bound to `/`.
- `/checklist/` now leads with **Every task by module**, a two-column directory
  of all 145 tasks with IDs and titles. The module summary table follows it.
- Module pages show context in the same tab-note style, and the task list as
  ruled rows.

### 6. Mobile and laptop

- Below 640px every table stacks into bordered rows, each cell labelled with
  its column header. The header row stays visible as a legend; nothing is
  hidden.
- Plates extend 12px into the gutter. Body text stays at 16px.
- I swept all 177 pages at 390, 768 and 1280px: none has horizontal overflow.

### 7. Light and dark

Light uses laminated-sheet paper (`#fafaf8`) and ink. Dark uses instrument slate
(`#111417`). Both follow the system setting and the toggle. Blue means "go
somewhere", yellow means "replace before running", and an ink slab means "the
checklist stops here". No success colour exists anywhere.

## How each operator need is met

| Need | Where it is met |
| --- | --- |
| Find the right module or task | Go to task ID, sidebar ID column, full directory on `/checklist/`, local search |
| Know where to start a box | Box route page (source preface) and the Where to enter table on the home page |
| Read and copy exact commands | Persistent plate header, exact copy, hanging-indent wrapping, no ligatures |
| See what to substitute | Highlighted blanks in code, Fill in list per plate |
| Interpret results | Decision tables, stacked labelled rows on mobile |
| Follow the recorded route | Route marks with title tooltips, aside rail, route sheet, inbound links |
| Know where a route ends | Stop slabs, never links |
| Keep context | Module tab note on every task, meta line with module and position |

## Use of `<details>`

Only one place: the route sheet's "Linked from N tasks" list collapses when a
task has more than 12 inbound links. NET-05 has 57. This list is derived
navigation, not source content, and the summary stays one click away. No source
content is collapsed and no CSS hides anything. A test fails the build if the
theme CSS contains `display: none`, `visibility: hidden`, zero heights,
clipping, hidden overflow or off-screen offsets.

## Tests added

`pnpm test` now runs 51 tests (42 before):

- Every command plate's rendered text equals its source block exactly, with a
  visible language label and one copy control per plate (732 blocks).
- The copy handler neither trims nor strips prompts.
- Every blank in every block is marked in place and listed in the plate header;
  `<0.4096>` is not marked.
- Route, short-route and stop marks, decision-table labels, the heading stamp
  and sidebar markup are present; every plain `Next: PAUSE-*/GAP-*` renders as
  a stop slab.
- Frontmatter routes match `routes.json` for all 145 tasks. The route sheet
  sits outside `<main>`, and NET-05's 57 inbound links fold into `<details>`.
- The box route page contains every word of the source preface and links its
  routes.
- Go to task ID normalisation.
- The theme CSS never hides content.
- The `→` separator links both ends.

## Known weaknesses

- **System fonts.** No hyperlegible face is self-hosted, so the look depends on
  the platform's sans and on Cascadia Mono being installed (Windows). Elsewhere
  the mono falls back to SF Mono, Menlo or Liberation Mono.
- **Mobile tables are long.** WEB-09 or NET-05 on a phone scroll a long way;
  stacked rows are readable but not compact.
- **The rail duplicates the route sheet** at 1280px and wider. I accepted the
  repetition because the rail is beside the result table and the sheet is at
  the end of the page.
- **Plain IDs in prose are styled but not linked.** Only the source's route
  marks link. Linking every ID would add links the source did not mark as
  routes.
- **The home "Where to enter" table** quotes only the first task each box-route
  row names. The full conditions are one click away.
- **The VitePress internals the theme depends on** (the `preWrapper` copy button
  markup, sidebar `bdi`, scoped class names) are alpha-release details. The
  fence patch falls back to VitePress's default markup if the pattern changes,
  and the plate test would catch that.
- **The `.impeccable/design.json` sidecar** still describes the old baseline.
  DESIGN.md is current.
- **No independent finish review yet.** The coordinator's cross-review stands
  in for it.
- **The build warns about a chunk over 500 kB.** It is the local search index
  (689 kB), which holds the whole checklist. I did not change search
  configuration.

## Screenshots

Captured under `.superpowers/round-1/` (not committed): home, checklist index,
box route, NET-01, WEB-09, NET-05 and the `sql_continuation` module page, at
1440px and 390px in light and dark.
