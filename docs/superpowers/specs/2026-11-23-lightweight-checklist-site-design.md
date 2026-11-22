# Lightweight checklist site design

## Intent

Port the latest Operator Workbench master checklist into a lightweight GitHub
Pages documentation site. The website exists because the current document
export is cumbersome to navigate during a lab or OSCP-style box. It is a
reading interface, not another operator application.

The imported source is the authoritative Workbench authoring snapshot
`2026-11-21.working.132`. It contains 145 working task bodies. The port must
retain the task text, stable IDs, routes, version, and source digest.

## Goals

- Let a reader find a module or task quickly through grouped navigation and
  local full-text search.
- Give every task a stable URL and place its working instructions and later
  explanation on the same page.
- Make route destinations clickable without changing the checklist wording.
- Preserve code blocks and provide a copy action.
- Work as a static GitHub Pages site with no server, account, or remote runtime
  dependency beyond serving the files.
- Keep the first visual treatment restrained so later work can establish a
  deliberate visual direction without undoing product logic.

## Non-goals

- Rebuild Operator Workbench or reproduce its Quest, Terminal, evidence,
  execution, review, or reporting features.
- Track box progress, completion state, notes, targets, credentials, or other
  operator data.
- Rewrite, shorten, reorder, or otherwise editorialize the checklist content.
- Add runtime command execution, cloud services, analytics, or authentication.
- Claim that every task is mandatory or that the authoring view is a linear
  145-step run sheet.

## Chosen approach

Use VitePress as a static documentation generator. Keep one exact imported
Markdown snapshot plus a small provenance record in the repository. A Node
script validates and splits that snapshot into generated module and task pages
before local development or production builds. VitePress supplies grouped
sidebar navigation, local search, responsive reading layouts, code-copy
controls, and previous/next links without turning the site into an application.

The alternatives were a React operator interface and one large generated HTML
document. The React approach repeats product behavior that belongs in
Workbench. A single HTML document preserves the navigation problem that caused
this project. A documentation generator fits the requested lightweight port and
leaves room for later theme work.

## Information architecture

- The home page identifies the checklist version, explains that tasks are
  finding-driven, and links to the first network task and the module index.
- A checklist index lists all modules and their task counts.
- The sidebar groups task links by module in source order.
- Each task page starts with its stable ID and title, followed by the exact
  working body. Its explanation and troubleshooting text follows on the same
  page under a clear heading.
- Textual `Next: TASK-ID` destinations become relative links to the destination
  task. Only the Markdown link syntax is added; visible words remain unchanged.
- A provenance page records the Workbench edition, imported filename, source
  digest printed by the checklist, exact snapshot SHA-256, task count, and
  import date.

## Content and generation rules

- Commit the imported snapshot so the website repository builds independently
  of the Workbench checkout.
- Treat the snapshot as immutable input during generation. Generated pages may
  add navigation links and page metadata but may not alter prose or command
  bytes.
- Fail generation for duplicate task IDs, missing explanation entries, unknown
  route destinations, a version mismatch, a snapshot hash mismatch, or a task
  count other than 145.
- Generate deterministic output and remove only the generator-owned output
  directory before rewriting it.

## Delivery and verification

- `pnpm dev` regenerates content and starts the local documentation server.
- `pnpm test` runs parser, provenance, routing, and generated-output checks with
  Node's built-in test runner.
- `pnpm build` regenerates content and produces the static site.
- GitHub Actions installs from the lockfile, runs tests and the build, and
  deploys the output through the official Pages actions.
- The repository README documents local use, content provenance, and how to
  refresh the imported snapshot deliberately.

