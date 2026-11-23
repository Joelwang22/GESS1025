# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

VitePress static documentation site, delegated by the user and approved for
GitHub Pages deployment.

## Users

The primary reader is an OSCP candidate or authorized lab operator who needs to
consult the master checklist while working through a box.

## Product purpose

Give an operator command-first pages beside a live terminal. Success means the
Linux privilege pass has one clear 15-page path, while findings can jump to the
exact page that resolves them.

## Positioning

Linux privilege escalation is one visible module with LPRIV-01 through
LPRIV-15. The other published Operator Workbench tasks remain in the same
checklist. Retired LNX URLs redirect into the new module and existing LPRIV
URLs stay stable.

## Operating context

Readers use the site alongside an authorized lab or exam workflow. Each Linux
privilege page starts with a useful command, a concrete signal, and exact next
links. The retained reference source is `2026-11-21.working.132`; its original
Linux task bodies stay out of published navigation and search.

## Capabilities and constraints

- Static GitHub Pages output with local search and grouped navigation.
- A 15-page Linux privilege escalation module with scoped-first commands,
  short signals, direct finding links, and sequential previous/next controls.
- Stable task URLs, route links, previous and next navigation, and code copying.
- Exact imported-source wording, task IDs, commands, routes, version, and
  provenance for published snapshot tasks. Operator copy is maintained
  separately.
- No progress state, notes, targets, credentials, accounts, analytics, backend,
  or command execution.
- Presentation follows the field binder direction recorded in DESIGN.md:
  compact operator pages and the full runbook treatment on retained tasks.

## Evidence on hand

- Imported snapshot: `content/master-working-2026-11-21.working.132.md`
- Provenance manifest: `content/source.json`
- Product design: `docs/superpowers/specs/2026-11-23-lightweight-checklist-site-design.md`

No testimonials, usage metrics, or completion claims are available and none may
be invented.

## Product principles

- Put the operator workflow before retained reference detail.
- Keep enumeration and detailed procedures in one navigation tree.
- Preserve the imported reference before styling it.
- Make finding-driven navigation obvious once a lead exists.
- Keep reading controls familiar and keyboard accessible.
- Keep this site smaller in scope than Operator Workbench.
