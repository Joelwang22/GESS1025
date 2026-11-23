# Field Ledger 132 Design Specification

## Purpose

Turn the existing VitePress checklist into a fast, legible field reference for
an OSCP candidate working beside a terminal, without turning it into a second
operator application. The redesign changes navigation and presentation only.
It must preserve all 145 tasks, all 28 modules, commands, explanations,
branching, context, ordering, and provenance.

The design was selected after independent proposals and reciprocal reviews by
Claude Opus 5.5 and Gemini 4 Neon. Both reviews converged on the Impeccable
concept-seed assignment: a surveyor's field ledger.

## Creative direction

**Field Ledger 132** treats every task as a numbered station leaf in a
surveyor's field book.

- Task IDs are call numbers.
- Navigable task references are instrument-cobalt traverse marks.
- Terminal states are solid surveyor-ochre boundary marks and never links.
- Command placeholders use an ochre dashed blank, distinct from a stop mark by
  shape as well as color.
- A restrained coordinate grid appears only in station headers and marginal
  regions, never behind long-form prose or commands.
- Light mode uses warm archival paper. Dark mode uses instrument slate.
- Explanations form a clearly separated notes band, but remain expanded and
  searchable.

The result must feel like a precise field instrument, not a generic docs site,
a cyberpunk terminal, an aviation costume, or a dashboard.

## Product boundaries

- Static GitHub Pages output, fully usable offline after load.
- No backend, command execution, accounts, target storage, notes, progress,
  completion state, analytics, telemetry, or remote assets.
- No text or styling may imply that an attempt succeeded.
- Source text remains the authority. Derived navigation may summarize links,
  but it must not invent recommendations or reorder decisions.
- No hand-curated observation dispatch matrix. The home page may link only to
  source-backed entry tasks such as NET-01 and NET-05 and to generated indexes.
- JavaScript may enhance filtering, wrapping, and focus behavior. Core content,
  task routes, context, and derived tracings must remain present without it.

## Information architecture

### Home page

Keep the existing safety copy and sequence. Present the edition, task count,
module count, and finding-driven warning in a compact first viewport. Provide
source-backed entry links to NET-01, NET-05, and the module/call-number index.
Do not invent service recommendations.

### Module and call-number index

The checklist index must retain all 28 modules in source order and add a
generated call-number lookup containing every one of the 145 tasks exactly
once. Avoid false first-to-last ranges for modules whose prefixes or order are
interleaved. Each task row shows its exact ID, exact title, and module.

### Task leaf

Each task page contains:

1. A station header with module link, call number, exact title, and quick links
   to results and notes when those anchors exist.
2. The full verbatim module context when the module defines one. It may be long
   and must not be collapsed.
3. The source working section, including commands and decision tables.
4. The unchanged `Explanations and troubleshooting` section in a notes band.
5. A derived Tracings navigation block with outbound task routes, terminal
   states, and inbound backlinks. Backlinks above 12 entries use native
   `<details>` to prevent hub pages from being overwhelmed.
6. Previous and next links labelled explicitly as source order, not recommended
   route or progress.

### Sidebar and search

Keep VitePress local search and its existing `/` shortcut. Sidebar groups stay
in source order with acronym-correct display names. Task rows use a fixed-width
call-number column and hanging title. A small filter may narrow the sidebar's
own task list without mutating VitePress's internal DOM.

## Content-fidelity requirements

- Fix placeholder escaping so inline code renders literal `<...>` once rather
  than `&amp;lt;...&amp;gt;`. Apply the fix to task bodies, module context, and
  imported references.
- Link known task IDs outside fenced code in `Next:` routes, bold single IDs,
  compound IDs, and abbreviated compounds. Unknown task-like IDs fail
  generation. Terminal states remain unlinked.
- Preserve every fenced command's text. Presentation spans and controls must
  not alter copied text.
- Derive route and placeholder counts from the parsed corpus in tests; do not
  encode review-time estimates as product truth.
- Treat `<0.4096>` and language/HTML syntax as literals, not replaceable
  placeholders. Recognize operator blanks such as
  `<supplied-domain/user>` and dotted filenames.
- Surface module context on every child task of each contextual module.
- Correct acronym casing with an explicit display-name map rather than title
  casing identifiers mechanically.

## Visual system

### Palette

| Role | Light | Dark |
| --- | --- | --- |
| Ground | `#F4EFE3` | `#12171D` |
| Leaf | `#FBF8F0` | `#182029` |
| Slip/code | `#EDE6D6` | `#0E1318` |
| Primary ink | `#1D2126` | `#E5E1D6` |
| Secondary chrome ink | `#4A515A` | `#A9B1BB` |
| Instrument cobalt | `#1D4F91` | `#86B6F2` |
| Surveyor ochre | `#8A4A06` | `#E2A54C` |
| Ruling | `#C9BFA8` | `#3A4654` |
| Grid | `#E4DCCB` | `#202A35` |

No red, green, or violet is used as an interface status color. Body text does
not use the secondary chrome color.

### Typography

- Self-host Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono WOFF2
  subsets with their license. System and Liberation fallbacks remain.
- Body text is 16px or larger at every supported viewport, with a 1.6-1.68 line
  height.
- Monospace text disables ligatures. Literal `0/O`, `1/l/I`, apostrophe, and
  backtick must remain distinguishable.
- Prose measure is approximately 68ch; code and decision tables may use the
  wider 78ch ledger frame.
- Call numbers use tabular monospace figures.

### Geometry and depth

- Use two-pixel datum rules, one-pixel ledger ruling, square tables, and two- to
  four-pixel control radii.
- Keep document surfaces flat. Shadows are reserved for transient search and
  mobile navigation overlays.
- No decorative page-transition motion.

## Components

### Route mark

A cobalt task link with a visible arrow and an accessible `Route to` label. It
shows the destination's exact title in derived navigation. Inline source text
remains exact.

### Stop mark

A solid ochre boundary mark with a bar or square and an accessible `Stop state`
label. It is never a link. Plain `Next: GAP-*` and `Next: PAUSE-*` forms must be
covered as well as bold forms.

### Command plate

Every fenced block shows a persistent language label and copy control. Long
commands wrap safely by default with a visible hanging indent; a compact
Wrap/Scroll control may switch behavior without changing command text. Copy
feedback uses `aria-live`.

### Decision matrix

Routing tables use heavy condition-to-route ruling. On narrow screens, simple
two-column routing tables stack into labelled rows. Reference/data tables stay
scrollable and structurally unchanged. Table classification is based on tested
header semantics, not merely column count.

### Tracings

Derived navigation lists outbound task stations in source order and inbound
stations grouped or bounded for scanning. It never labels a route as completed,
successful, preferred, or recommended.

## Responsive and accessibility contract

- Test home, index, NET-01, NET-05, AD-03, LPRIV-02, MAIL-02, and XFER-02 at
  390, 683, 768, 960, 1280, and 1440 pixels where tooling permits.
- No tested page may create document-level horizontal overflow.
- Body text remains at least 16px on mobile.
- Search, sidebar filter, copy, wrap, task routes, Tracings, theme switch, and
  mobile navigation are keyboard reachable with a visible cobalt focus ring.
- Color is never the only distinction between route, stop, and placeholder.
- Respect `prefers-reduced-motion`; preserve meaning under forced colors.
- Focused headings and anchors clear the sticky header with scroll margin.
- Wide scrollable tables expose an accessible name and keyboard focus.

## Verification contract

- Tests assert 145 task pages, 28 module pages, one occurrence of each task in
  the call-number index, stable source order, and exact provenance.
- Tests reproduce and prevent inline-code double escaping.
- Tests cover single, compound, abbreviated, terminal, unknown, and fenced
  route tokens.
- Tests cover contextual modules and representative routing/reference tables.
- The exhaustive built-link audit remains green.
- `pnpm test` and `pnpm build` pass.
- A production-browser review covers desktop, split-screen, and mobile in both
  themes and inspects representative dense pages.
- Both named reviewers re-score the implementation with the original weighted
  rubric. Any score below 9.5 produces a new correction round and new reviews.

