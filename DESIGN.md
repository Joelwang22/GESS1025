---
name: OSCP Master Checklist
description: An operations runbook binder for the Operator Workbench master checklist, read beside a live terminal.
colors:
  ink-light: "#16181b"
  ink-2-light: "#444a51"
  ink-3-light: "#656b73"
  paper-light: "#fafaf8"
  desk-light: "#f0f0ec"
  panel-light: "#e9e9e4"
  rule-light: "#dadad3"
  rule-strong-light: "#bdbdb5"
  route-light: "#1a4fd0"
  route-hover-light: "#0f3aa6"
  ink-dark: "#e7e5df"
  ink-2-dark: "#babec4"
  ink-3-dark: "#959ca4"
  paper-dark: "#111417"
  desk-dark: "#0c0f12"
  panel-dark: "#1d2227"
  rule-dark: "#272c33"
  rule-strong-dark: "#3a414a"
  route-dark: "#94b6ff"
  route-hover-dark: "#b8cfff"
  blank-light: "#ffe45c"
  blank-dark: "#f0cf45"
  blank-ink: "#1b1600"
  plate-light: "#15181c"
  plate-dark: "#090b0d"
  plate-head-light: "#1d2127"
  plate-head-dark: "#14181c"
  plate-ink: "#e8e6e1"
  plate-ink-2: "#a9afb7"
  plate-blank: "rgba(255, 214, 64, 0.2)"
  plate-blank-ink: "#ffe37a"
typography:
  display:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  headline:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.022em"
  task-title:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  section:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.4
  subsection:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.4
  route-sheet-title:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  table:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.4
  meta:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.4
  mono:
    fontFamily: '"Cascadia Mono", ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  call-number:
    fontFamily: '"Cascadia Mono", ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
    fontSize: "12.5px"
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
    padding: "14px 18px"
  command-plate-head:
    backgroundColor: "{colors.plate-head-light}"
    textColor: "{colors.plate-ink-2}"
    typography: "{typography.label}"
    padding: "6px 6px 6px 16px"
  blank:
    backgroundColor: "{colors.blank-light}"
    textColor: "{colors.blank-ink}"
    rounded: "{rounded.mark}"
  route-mark:
    textColor: "{colors.route-light}"
    typography: "{typography.call-number}"
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
    rounded: "{rounded.block}"
    padding: "14px 18px"
  notes-band:
    backgroundColor: "{colors.desk-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.sheet}"
    padding: "4px 24px 12px"
  decision-table-head:
    backgroundColor: "{colors.desk-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.label}"
    padding: "10px 14px"
  route-sheet:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.block}"
    padding: "18px 20px"
  route-row:
    textColor: "{colors.ink-light}"
    rounded: "{rounded.row}"
    padding: "9px 11px"
  action-primary:
    backgroundColor: "{colors.ink-light}"
    textColor: "{colors.paper-light}"
    rounded: "{rounded.row}"
    padding: "0 16px"
  goto-input:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink-light}"
    typography: "{typography.mono}"
    rounded: "{rounded.control}"
---

# Design System: OSCP Master Checklist

## Overview

**Creative North Star: "The Runbook Binder"**

Each task is a procedure sheet in an operations binder kept beside the console.
It has a stamped call number, a tab note that applies to every sheet behind
its module tab, dark command plates with the blanks highlighted, a ruled result
matrix, and a route sheet at the foot that lists every place the sheet can send
you. The sidebar is the binder's tab edge: module tabs with counts, then call
numbers in a fixed column.

The reader is mid-box with a terminal open on the other half of the screen. The
design optimises the loop the source itself prescribes: read the context, fill
the blanks, run one command, match the result, follow the route. Nothing on the
page tracks progress or suggests that a result means success.

**Key characteristics**

- Commands look like commands: dark plates in both themes, echoing the terminal
  beside the browser, with a persistent language label and Copy control.
- Three marks carry meaning by shape as well as colour: route (arrow and
  underline), blank (highlighter fill and dashed underline), and stop (solid
  inverted slab with a square).
- Flat sheets separated by heavy ink rules and tonal bands; no floating cards.
- One interaction blue, reserved for routes, links and focus.

## Colors

Restrained palette: neutrals, one interaction blue, one signal yellow.

- **Ink** (`#16181b` light, `#e7e5df` dark): text, heavy rules, stamps, stop
  slabs, primary buttons.
- **Paper** (`#fafaf8` / `#111417`): the reading sheet.
- **Desk** (`#f0f0ec` / `#0c0f12`): sidebar, module context, explanation band,
  table heads, cue rows.
- **Route blue** (`#1a4fd0` / `#94b6ff`): every task link, the Next column wash,
  route sheet and rail IDs, focus rings. Nothing decorative uses it.
- **Blank yellow**: only operator blanks such as `<IP_ADDRESS>`. On paper it is
  a solid highlighter (`#ffe45c` / `#f0cf45` with `#1b1600` text). On command
  plates it is a softer wash (`rgba(255, 214, 64, 0.2)` with `#ffe37a` text), so
  a block with ten blanks does not glare.
- **Plate** (`#15181c` / `#090b0d`): command plates in both themes.

### Named rules

**The One Meaning Per Colour Rule.** Blue means "go somewhere". Yellow means
"replace this before running". Ink slabs mean "the checklist stops here". No
colour is reused for another meaning, and no success or failure colour exists.

**The Shape Carries It Rule.** Each mark keeps its meaning in greyscale and in
forced-colours mode: the arrow, the dashed underline and the square glyph stay
visible without colour.

## Typography

System sans for reading and interface; Cascadia Mono (with ui-monospace,
SF Mono, Menlo, Consolas and Liberation Mono fallbacks) for commands, code and
call numbers. Ligatures are disabled in all code so `->`, `!=` and `==` stay
literal. No web fonts are loaded; the site stays offline-first.

### Hierarchy

- **Display** 2.5rem / 600: home title only (2rem below 640px).
- **Headline** 2rem / 600: framing page titles (1.65rem below 640px).
- **Task title** 1.75rem / 600, under a mono call-number stamp.
- **Title** 1.375rem / 600: level-two sections, each opened by a 2px ink rule.
- **Section** 1.15rem and **subsection** 1.05rem for nested source headings.
- **Body** 16px / 1.65 at every width, prose capped at 74ch.
- **Module context** 14px / 1.5, the one deliberately compact prose block.
- **Table** 15px / 1.55; **meta** 14px; **label** 13px / 700; **caption** 12px / 700.
- **Mono** 14px in plates (13.5px below 640px); **call number** 12.5px / 700.

## Layout

VitePress's shell, re-materialised: a 304px binder-tab sidebar, an 820px reading
column (prose 74ch, plates and tables full column width), and a 224px aside from
1280px holding the page outline, then the task rail. The layout maximum stays at
1440px: VitePress derives the sidebar width from it, and a larger maximum makes
the sidebar narrower than its groups, which clips titles.

Task page order is the source's order: stamp and title, meta line with jumps,
module context, working section, explanation band. Derived navigation sits
outside `<main>`: the aside rail and the route sheet above the source-order
pager. Module and box-route pages have no pager.

Below 640px every table stacks into bordered rows with column labels, the
header row stays visible as a legend, cue rows stack their label above the
text, command plates extend 12px into the gutters, and the explanation band runs
edge to edge.

## Elevation and depth

Flat. Structure comes from 1-3px ink rules, tonal bands and plate darkness.
Shadows belong only to VitePress's transient overlays (search, mobile menu).

## Shapes

3px marks, 4px controls, 6px rows and buttons, 8px blocks (plates, module
context, route sheet). The explanation band is square: it is a sheet section
under a 3px datum rule, not a card.

## Components

### Call-number stamp and meta line

The heading's call number sits in a 2px ink box; the source's period follows
the box in muted ink, and the title starts on the next line. The meta line
below names the module and the task's position, then offers jump chips that
exist only when the page has their target: **First command** (`#cmd-1`),
**Result table** (`#results`), **Explanations**, and **Routes**.

### Command plate

Row one, which never wraps its controls away: the fence's own language word,
**Wrap lines** (a toggle with `aria-pressed`; off scrolls long lines sideways
inside the plate) and an always-visible **Copy** button. Row two, only when the
block has blanks: **Fill in** and every distinct blank. Body: Shiki github-dark
colours, `pre-wrap` wrapping, and a two-column hanging indent so a wrapped line
never reads as a new command. Copy writes each rendered line's text joined by
newlines, with no trimming or prompt stripping, so the clipboard equals the
source block byte for byte. The button label changes to "Copied" inside a
polite live region. Every plate has an anchor, `cmd-1`, `cmd-2` and so on.

### Marks

- **Route**: mono, bold, blue, underlined, with a drawn arrow; the `title`
  gives the destination task's exact title. Abbreviated parts such as `/08`
  drop the arrow.
- **Blank**: highlighter fill, dashed underline, in code and inline code.
- **Stop**: ink slab with a square, never a link, titled "Stop state named by
  the checklist".
- **Call number**: plain task IDs in prose are set in mono.

### Cue rows and outcome rows

"Enter when:" and "Question:" paragraphs become ruled desk-tone rows with the
label in its own column; the question is set semibold. Bullet lists whose every
item opens with an outcome slug (`http_reported:`) become ruled rows with the
slug in a mono chip. Words and order are unchanged.

### Decision table

A table is a decision table when its last header starts with "Next" or
"Revisit", unless it names an expression to type ("Next table expression").
2px ink rule under a desk-tone head, 1px row rules, a faint blue wash on the
route column, and a 46% condition column in two-column tables. The first one on
a page carries the `results` anchor.

### Module context

The binder tab note: desk band, 1px border, label "<Module> module context ·
Applies to every task in this module". Always expanded, never collapsed, set at
14px. From 1100px wide it flows into two columns on task pages so long contexts
take half the height.

### Task rail

In the aside, under the outline: the call number and module, then the task's
routes. Up to six routes show their titles; a hub task shows call-number chips
(titles on hover and focus) and a link to the route sheet, so the outline stays
in view.

### Route sheet

"Where <ID> can lead" (`#task-routes`): every linked task with its exact title
and, for cross-module routes, its module, the stop states it names, and the
tasks that link to it. Inbound lists of more than 12 fold into native
`<details>` with a Show / Hide cue.

### Find task

The first control in the sidebar. An exact or loosely typed ID ("web9",
"lpriv-2") opens that task on Enter. Any other text lists live matches by ID,
title word or module (the first 12, with the total), and Enter opens the first.

### Directory filter

On `/checklist/`, the full directory renders by default in source order, read
down each column. Typing filters it by ID, title word or module; clearing
restores every task.

## Do's and don'ts

### Do

- Keep every source word, command and table in `<main>` and in source order.
- Use blue only for routes and links, yellow only for blanks.
- Keep commands visible and copyable without hover.
- Label derived navigation as derived, and keep it outside `<main>`.

### Don't

- Don't hide anything with `display: none`, `visibility: hidden`, zero height,
  clipping or off-screen positioning. The test suite forbids these in the theme.
- Don't collapse source content. Only derived inbound lists may use `<details>`.
- Don't add progress, completion, success colours or operator state.
- Don't load remote fonts or assets.
