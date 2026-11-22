---
name: OSCP Master Checklist
description: A quiet, searchable field manual for the Operator Workbench master checklist.
colors:
  field-blue-light: "#1d4ed8"
  field-blue-hover-light: "#2563eb"
  field-blue-solid: "#3b82f6"
  field-blue-soft-light: "rgba(37, 99, 235, 0.12)"
  field-blue-dark: "#93c5fd"
  field-blue-hover-dark: "#60a5fa"
  field-blue-soft-dark: "rgba(96, 165, 250, 0.14)"
  paper-light: "#ffffff"
  panel-light: "#f6f6f7"
  ink-light: "#3c3c43"
  muted-ink-light: "#67676c"
  rule-light: "#e2e2e3"
  paper-dark: "#1b1b1f"
  panel-dark: "#202127"
  ink-dark: "#dfdfd6"
  muted-ink-dark: "#98989f"
  rule-dark: "#2e2e32"
  important-soft-light: "rgba(159, 122, 234, 0.14)"
  important-soft-dark: "rgba(159, 122, 234, 0.16)"
typography:
  headline:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3333333
    letterSpacing: "-0.02em"
  body:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.68
  label:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.45
  mono:
    fontFamily: '"Cascadia Code", "SFMono-Regular", Consolas, "Liberation Mono", monospace'
rounded:
  inline: "4px"
  block: "8px"
components:
  link-default:
    textColor: "{colors.field-blue-light}"
    typography: "{typography.body}"
  link-hover:
    textColor: "{colors.field-blue-hover-light}"
  code-block:
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.muted-ink-light}"
    typography: "{typography.mono}"
    rounded: "{rounded.block}"
    padding: "20px 24px"
  callout-important:
    backgroundColor: "{colors.important-soft-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.block}"
    padding: "16px"
  table-header:
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.muted-ink-light}"
    typography: "{typography.label}"
    padding: "8px 16px"
  search-field:
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.inline}"
    padding: "8px 12px"
  task-pager:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.field-blue-light}"
    rounded: "{rounded.block}"
    padding: "12px 16px"
---

# Design System: OSCP Master Checklist

## Overview

**Creative North Star: "The Indexed Field Manual"**

The site is a quiet reference built for use beside an active lab or exam workflow. Its visual system stays close to VitePress's familiar documentation shell so readers can search, scan a grouped sidebar, read a task, and follow its recorded route without learning a new interface. The system is compact around navigation and generous around long-form content.

This first release is intentionally restrained. System sans text, monospace commands, one blue interaction color, and thin rules carry the interface. Content structure does the rest. The design avoids dashboard widgets, progress signals, and visual claims that a task has been completed.

**Key Characteristics:**

- Documentation-first hierarchy with no decorative hero treatment.
- One theme-aware blue family for links, focus, selection, and active navigation.
- Flat surfaces separated by tone and thin rules.
- A narrow reading column inside a wide shell with a persistent grouped sidebar.
- Native Markdown patterns for commands, result tables, callouts, and task routing.

## Colors

The palette is neutral in both themes, with blue reserved for interaction and a soft violet used only by VitePress's semantic important callout.

### Primary

- **Field Blue:** The light-theme link and focus color (`#1d4ed8`) becomes a pale blue (`#93c5fd`) in dark mode. It marks links, selected navigation, and the strongest focus cue.
- **Field Blue Hover:** The light-theme hover and focus outline color (`#2563eb`) becomes a brighter blue (`#60a5fa`) in dark mode.
- **Field Blue Solid:** The shared middle blue (`#3b82f6`) supports solid brand roles inherited from VitePress.
- **Field Blue Wash:** A translucent wash (`rgba(37, 99, 235, 0.12)` in light mode and `rgba(96, 165, 250, 0.14)` in dark mode) marks text selection and soft brand states.

### Secondary

- **Important Violet Wash:** VitePress renders the single important callout with a soft semantic violet (`rgba(159, 122, 234, 0.14)` in light mode and `rgba(159, 122, 234, 0.16)` in dark mode). This is a message type, not a second brand accent.

### Neutral

- **Paper:** The document background is white (`#ffffff`) in light mode and charcoal (`#1b1b1f`) in dark mode.
- **Soft Panel:** Sidebars, code blocks, alternating table rows, and fields use a soft gray (`#f6f6f7`) in light mode and a raised charcoal (`#202127`) in dark mode.
- **Graphite Ink:** Primary text uses dark graphite (`#3c3c43`) in light mode and warm off-white (`#dfdfd6`) in dark mode.
- **Muted Ink:** Secondary copy and table labels use gray (`#67676c`) in light mode and cool gray (`#98989f`) in dark mode.
- **Quiet Rule:** Dividers use pale gray (`#e2e2e3`) in light mode and deep gray (`#2e2e32`) in dark mode.

### Named Rules

**The One Blue Voice Rule.** Use the field-blue family for interaction. Do not add unrelated accent colors to ordinary navigation or document controls.

**The Semantic Exception Rule.** Violet belongs only to the important callout already present on the home page. It does not become a decorative palette.

## Typography

**Display Font:** None. Page headings use the same system sans family as the body.

**Body Font:** UI system sans with Segoe UI and generic sans-serif fallbacks.

**Label/Mono Font:** Cascadia Code with SFMono-Regular, Consolas, Liberation Mono, and monospace fallbacks.

**Character:** The typography is plain, familiar, and dense enough for technical reference. Weight and spacing establish hierarchy. Monospace appears only where commands, identifiers, hashes, or literal paths need it.

### Hierarchy

- **Headline** (600, `2rem` desktop and `1.75rem` below `48rem`, `1.25` desktop line height): Page titles. The custom letter spacing is tight (`-0.025em`).
- **Title** (600, `1.5rem`, `1.3333333`): Major task sections. Each level-two heading begins after a large gap and a divider.
- **Section heading** (600, `1.25rem`, `1.4`): Nested instructions within long tasks.
- **Body** (400, `16px`, `1.68` on the document and `1.75` on paragraphs): Long-form instructions inside a maximum `74ch` measure. Body text drops to `15px` at `640px` and below.
- **Label** (600, `0.875rem`, `1.45` where used in navigation): Table headings, sidebar items, and compact interface labels.
- **Mono** (contextual size, normal weight): Command blocks, inline code, task IDs where marked as code, source hashes, and paths.

### Named Rules

**The Commands Stay Mono Rule.** Use monospace for literal input and output, not for general emphasis or decorative headings.

**The Reading Measure Rule.** Keep article content at or below `74ch`. The sidebar and outline may widen the shell, but not the text column.

## Layout

The site uses the standard VitePress documentation frame with a compact top navigation, a grouped left sidebar, the article column, and an on-page outline when space permits. The shell can grow to `1520px`; the sidebar is `300px`; the article content stays at `74ch`. This allows long task names to remain useful in navigation without stretching instructions into hard-to-read lines.

Spacing follows the Markdown hierarchy. Paragraphs, lists, tables, code, and callouts sit on a `1rem` rhythm. Level-two sections begin after `3rem`, then use a divider and `1.5rem` of top padding. On screens at `640px` or below, body type drops to `15px`, code blocks extend `8px` into the page gutter, and their rounded corners remain visible.

VitePress owns responsive collapse behavior. The desktop sidebar and outline become familiar menu-driven navigation on narrower screens. Do not replace that behavior with a custom app shell.

## Elevation & Depth

The reading experience is flat. Page, sidebar, code, table, and callout layers are separated by tonal shifts and one-pixel rules, not persistent card shadows. VitePress's low overlay shadow is reserved for transient UI such as local search. It should not be copied onto article sections.

### Shadow Vocabulary

- **Transient Overlay** (`box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07), 0 1px 4px rgba(0, 0, 0, 0.07)`): Local search and other temporary floating UI supplied by VitePress.

### Named Rules

**The Flat Reading Rule.** Document content stays flat at rest. Use tone and rules for structure; reserve shadow for a temporary layer above the document.

## Shapes

The form language is softly squared. Inline code and compact fields use a `4px` radius. Code blocks and semantic callouts use an `8px` radius. Tables rely on straight one-pixel borders rather than an outer card silhouette. On mobile, wide command blocks may run into the gutter, but they keep their `8px` corners.

**The Two Radius Rule.** Use `4px` for inline or compact controls and `8px` for block-level reading aids. Do not introduce pill shapes into the baseline.

## Components

### Navigation

Navigation is the VitePress default theme with a text site title, Checklist and Source links, local search, a theme switch, a repository link, a grouped sidebar, and an on-page outline. Default text is neutral; hover and active states use Field Blue. The sidebar text keeps a `1.45` line height for long task names. Narrow screens use VitePress's menu treatment.

### Search field

Local search uses VitePress's detailed results view. The field sits on the soft panel color with the standard interactive border. Focus uses the global `3px` Field Blue outline with a `3px` offset. Search is a navigation tool, not a dashboard panel.

### Document links

Links are medium-weight Field Blue with a visible underline and a `0.16em` underline offset. Hover moves to the brighter Field Blue variant. All links retain the global keyboard focus ring.

### Code blocks

Command blocks use the soft panel color, muted document text, the project monospace stack, `20px 24px` internal padding, and `8px` corners at normal widths. Long lines can wrap anywhere because the source contains long commands and paths. VitePress supplies the copy control.

### Important callout

The home-page warning is a VitePress important block with a soft violet background, neutral text, `16px` padding, and `8px` corners. It carries the finding-driven safety guidance. The violet remains local to this semantic block.

### Result tables

Task result tables are horizontally scrollable, use one-pixel dividers, and alternate paper with the soft panel tone. Headers use muted `0.875rem` semibold text with `8px 16px` padding. Numeric columns use tabular figures. Tables remain part of the article flow rather than becoming cards.

### Task pager

Previous and next task links come from VitePress's document footer. They use the ordinary paper background, thin divider treatment, Field Blue link text, and concise labels. The pager supports the recorded route without implying progress or completion.

## Do's and Don'ts

### Do:

- **Do** keep the article column at `74ch` or narrower.
- **Do** use Field Blue for links, focus, active navigation, and soft selection.
- **Do** render commands and literal paths in the established monospace stack.
- **Do** keep result tables, command blocks, callouts, and previous or next links inside normal document flow.
- **Do** preserve light and dark theme behavior through the existing VitePress variables.

### Don't:

- **Don't** add dashboards, progress meters, completion badges, or operator state to this reading interface.
- **Don't** turn modules or tasks into floating cards with persistent shadows.
- **Don't** use the important-callout violet as a general accent.
- **Don't** add decorative typefaces, illustration, or pill controls to the lightweight baseline.
- **Don't** style a command result as proof that access or completion occurred.
