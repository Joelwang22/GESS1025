---
name: OSCP Master Checklist
description: A command-first checklist with practical pages and complete Operator Workbench tasks.
colors:
  paper-light: "#faf9f5"
  desk-light: "#f1efe9"
  panel-light: "#eae7df"
  ink-light: "#181c22"
  ink-2-light: "#444c58"
  ink-3-light: "#57606d"
  rule-light: "#dcd7cb"
  rule-strong-light: "#c5bfb2"
  route-light: "#135198"
  route-hover-light: "#0b3a70"
  paper-dark: "#151a22"
  desk-dark: "#10141b"
  panel-dark: "#1b222c"
  ink-dark: "#e8e6df"
  ink-2-dark: "#b4bec9"
  ink-3-dark: "#8c98a8"
  rule-dark: "#262f3d"
  rule-strong-dark: "#333e4f"
  route-dark: "#78b9fa"
  route-hover-dark: "#a2d0fc"
  blank-light: "#ffe45c"
  blank-dark: "#f0cf45"
  blank-ink-light: "#1b1600"
  blank-ink-dark: "#171200"
  plate-blank: "rgba(255, 214, 64, 0.2)"
  plate-blank-ink: "#ffe37a"
  plate-light: "#161b22"
  plate-dark: "#0c1016"
  plate-head-light: "#1f2630"
  plate-head-dark: "#161c24"
  plate-ink: "#e6edf3"
  plate-ink-2: "#a9b4c2"
typography:
  display:
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  headline:
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif'
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.022em"
  task-title:
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif'
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif'
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  section:
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif'
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.4
  subsection:
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif'
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  context:
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  table:
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif'
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.4
  mono:
    fontFamily: '"Cascadia Mono", ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", "Liberation Mono", monospace'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  call-number:
    fontFamily: '"Cascadia Mono", ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", "Liberation Mono", monospace'
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  mark: "3px"
  control: "4px"
  row: "6px"
  block: "8px"
  sheet: "0px"
components:
  command-plate:
    backgroundColor: "{colors.plate-light}"
    textColor: "{colors.plate-ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.block}"
  command-plate-head:
    backgroundColor: "{colors.plate-head-light}"
    textColor: "{colors.plate-ink-2}"
    typography: "{typography.label}"
  blank:
    backgroundColor: "{colors.blank-light}"
    textColor: "{colors.blank-ink-light}"
    rounded: "{rounded.mark}"
  route-chip:
    textColor: "{colors.route-light}"
    typography: "{typography.call-number}"
    rounded: "{rounded.control}"
  stop-mark:
    backgroundColor: "{colors.ink-light}"
    textColor: "{colors.paper-light}"
    typography: "{typography.call-number}"
    rounded: "{rounded.mark}"
  call-number-stamp:
    textColor: "{colors.ink-light}"
    typography: "{typography.call-number}"
    rounded: "{rounded.control}"
  module-context:
    backgroundColor: "{colors.desk-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.context}"
    rounded: "{rounded.block}"
  notes-band:
    backgroundColor: "{colors.desk-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.sheet}"
  route-card:
    textColor: "{colors.ink-light}"
    rounded: "{rounded.row}"
---

# Design System: OSCP Master Checklist

## Overview

**Creative North Star: "The Field Binder, in Slate & Signal"**

The checklist has two deliberate reading speeds in one navigation tree. The
practical Linux page is the sheet kept beside the console: compact command
groups, a short signal to recognize, and a link for the next investigation.
The imported task pages keep the original procedure sheets and their full
decision record. A detailed task has:

- a header row with its call number and place in the module;
- the verbatim source title;
- a module tab note that always stays expanded;
- dark command plates with marked blanks;
- ruled result tables or outcome rows;
- an explanations band;
- a route sheet at the foot.

The reader is mid-box with a terminal open on the other half of the screen.
The default loop is: scan one recognizable category, copy its commands, notice
a signal, then open the exact detailed procedure only if needed. Detailed
task pages retain the slower source loop of context, command, result, and route.
Nothing on the page tracks progress or suggests that a result means
success.

Imported text is never changed, hidden or collapsed. Practical checklist copy
is separately maintained, not a rewrite of the imported snapshot.

## Colors

Warm paper in light mode, instrument slate in dark mode, and one meaning per
colour. Every meaning is also carried by shape. Every text pair below meets
WCAG AA (4.5:1) in both themes; a test computes them from `tokens.css`.

| Role | Light | Dark | Shape cue |
| --- | --- | --- | --- |
| Paper / desk / panel | `#faf9f5` / `#f1efe9` / `#eae7df` | `#151a22` / `#10141b` / `#1b222c` | — |
| Ink / ink-2 / ink-3 | `#181c22` / `#444c58` / `#57606d` | `#e8e6df` / `#b4bec9` / `#8c98a8` | — |
| **Cobalt**: navigation only (task routes, links, focus ring) | `#135198` | `#78b9fa` | Tinted chip with a drawn arrow |
| **Blank yellow and amber**: a value to replace | Highlighter `#ffe45c` with `#1b1600` text | `#f0cf45` with `#171200` | Dashed underline |
| Blank on a command plate | 20% amber wash with `#ffe37a` text | Same | Dashed underline |
| **Stop slab**: a stop state, never a link | Ink slab, paper text | Inverted | Filled square glyph |
| Command plate / header bar | `#161b22` / `#1f2630` | `#0c1016` / `#161c24` | — |

**Neutral bands** (desk tone with an ink rule) hold module context, IMPORTANT,
and the Enter when and Question cues. Pressed controls (Wrap lines, the
directory layout toggle) use neutral ink, never cobalt. In light mode the
blank's fill differs little from paper (1.21:1), so the dashed underline is
its required non-colour cue.

Syntax colours use **github-dark-dimmed**, with comments lifted from `#768390`
to `#8b96a3` (5.76:1 on the light plate, 6.35:1 on the dark plate) and the
near-background markup colour replaced. A test checks every syntax colour in
the built site against both plates.

## Typography

**Inter**, which VitePress's default theme ships as local font files (no
remote request), with `cv05` so l, I and 1 stay distinct. Commands, code and
call numbers use Cascadia Mono, ui-monospace, SF Mono, Menlo, Consolas, DejaVu
Sans Mono (Kali's default) and Liberation Mono. Ligatures are off in all code.

- **Display** 2.5rem: home title only.
- **Headline** 2rem: framing pages.
- **Task title** 1.75rem: the verbatim source heading.
- **Title** 1.375rem: level-two sections under a 2px ink rule.
- **Section** 1.15rem and **subsection** 1.05rem.
- **Body** 16px / 1.65 at every width, prose capped at 74ch.
- **Module context** 14px / 1.5. This is the floor: context carries rules
  that change how commands run.
- **Table** 15px; **label** 13px / 700; **mono** 14px in plates; **call
  number** 12.5–13px / 700.

## Layout

The VitePress shell is kept:

- a 304px sidebar;
- an 820px reading column (prose 74ch; plates and tables full width);
- a 224px aside from 1280px, holding "On this page" and then the task rail;
- a 1440px layout maximum, because VitePress sizes the sidebar from it and a
  larger value clips sidebar titles.

Task pages reduce VitePress's top padding to 1.5rem, and the aside moves up to
match. That keeps WSQL-01's first command line above the fold at 1440×900.

The practical column has a 900px maximum and the task column an 820px maximum.
Both shrink to fit beside the sidebar and aside. Guidance uses a label column
and a hanging body column. The practical Linux page is the first item in the
existing Linux privilege module. The desktop sidebar can collapse without
storing state, and the reading column recentres when it does.

A field page is one linear document: brief operating rule, immediately visible
command groups, **Look for** signals, and **If found** reference links. The
right-hand outline is its section index; it has no route rail or repeated module
context.

A detailed task page, top to bottom:

1. The header row (outside `<main>`).
2. The verbatim H1.
3. Module context. From 1100px wide, contexts of 600 characters or more flow
   into two columns.
4. The working section.
5. The explanations band.
6. The route sheet (outside `<main>`).
7. The source-order pager.

Below 640px:

- tables stack into labelled rows, with the header row kept as a visible
  legend;
- cue rows stack;
- command plates extend 12px into the gutters;
- the explanations band runs edge to edge.

CSS lives in three files: `tokens.css` (colours, type and layout tokens for
both themes), `components.css` (plates, marks, header row, route sheet and
rail, Find task, directory, home sheet and jump, cues, outcome rows) and
`custom.css` (VitePress overrides, document typography, narrow-screen,
forced-colours and reduced-motion blocks). No stylesheet hides content.

## Components

### Header row

On task pages:

- **Left:** Checklist / *Module* / `[ID]` task *n* of *N*. The stamp and its
  position never wrap apart.
- **Right:** jump chips for **First command** (the working section's first
  plate), **Result table** or **Outcomes** (the first decision table before
  the explanations, otherwise the first outcome list), **Explanations**, and
  **Routes (n)**.

The generator writes each jump's target into frontmatter, using the same rules
the renderer uses (`isDecisionHeaders`, `isOutcomeList`), so a jump never lacks
a target.

Module pages: Checklist / *Module* · *N* tasks, **Box route**, and
**NET-05: Choose a service to investigate**, named by its exact title.

### Command plate

- **Row one:** the fence's own language word, **Wrap lines** (`aria-pressed`;
  off scrolls long lines inside the plate), and an always-visible **Copy**.
- **Row two:** **Fill in** with every distinct blank.

Copy uses a filled neutral control. Wrap stays outlined, with an underline
when pressed and a dashed edge when off. Plate focus uses pale neutral ink
against the dark header. Control edges and focus exceed 3:1 in both themes.
Desktop headers are compact; narrow screens and coarse pointers retain 44px
controls. Cobalt keeps its navigation meaning elsewhere.

Wrapped lines hang two columns in. Copy writes each rendered line's text joined
by `\n`, with no trimming or prompt stripping, so the clipboard equals the
source block byte for byte. Every plate has an anchor (`cmd-1`, `cmd-2`, and
so on).

### Marks

- **Route chip:** tinted cobalt pill, mono bold, with a drawn arrow, and the
  destination's exact title as its tooltip. Abbreviated parts (`/08`) drop the
  arrow.
- **Blank:** highlighter on paper, a wash on plates, always with a dashed
  underline.
- **Stop:** an inverted slab with a square, never a link.
- **Plain task ID:** neutral mono, with its exact title as a tooltip.

### Cues, outcome rows, decision tables

- **"Enter when:" and "Question:"** become neutral labelled rows.
- **Outcome rows:** bullet lists in which every item opens with a slug become
  ruled rows with the slug in a chip.
- **Decision tables:** a table whose last header starts with "Next" or
  "Revisit", and doesn't end in "expression". They get a heavy head rule and a
  cobalt wash on the route column.

### Module context

The binder tab note: a desk band with a 1px border, labelled "*Module* module
context · Applies to every task in this module". Always expanded.

### Task rail and route sheet

- **Rail** (in the aside, under the outline): the stamp and module, then the
  routes. Up to six show their titles; hub tasks show chips plus a link to the
  sheet.
- **Route sheet:** "Recorded routes for *ID*" (`h2#task-routes`, listed in the
  outline). Cards show the ID and any cross-module tag on top and the exact
  title below. Then the stop states, and the inbound links (folded into
  native `<details>` above 12).

### Find task (sidebar) and the home jump

Find task is pinned at the top of the desktop sidebar.

- An exact or loose ID ("web9") shows "Press Enter to open *ID*: *title*".
- Other text lists live matches by ID, title word or module.
- **Clear** and Escape reset the field.

The home jump box does the same, and adds **Full-text search /**, which opens
VitePress's local search. `/` opens it from any page.

After a route change, the active sidebar item scrolls into view on desktop.

### Home

1. Title and command-first promise.
2. Authorization and scoped-first rule.
3. Primary Linux checklist action and new-box route.
4. Three situation-based entry choices.
5. Task search.
6. The checklist workflow and link to the retained box route.

### Directory

`/checklist/` has a filter by ID, title or module; Escape and Clear reset it.
It has **By module (28)**, in printed-index columns, and **Flat list (145)**,
showing ID, exact title and module. The server-rendered default lists all 145
tasks. Nothing is stored.

## Do's and don'ts

### Do

- Keep every source word, command and table in `<main>`, in source order.
- Keep field sections in the operator's scan order: command, signal, next move.
- Use cobalt only for navigation, and yellow or amber only for blanks.
- Keep commands visible and copyable without hover.
- Derive every title and quote from the parsed source, never by hand.
- Label derived navigation as derived, and keep it outside `<main>`.

### Don't

- Don't hide anything with `display: none`, `visibility: hidden`, clipping,
  hidden overflow, zero height or off-screen offsets. Tests forbid these in
  every theme stylesheet.
- Don't collapse source content. Only derived inbound lists may use
  `<details>`.
- Don't repeat detailed prerequisites or failure taxonomies on field pages.
- Don't add progress, completion, success colours, stored state or remote
  assets.
