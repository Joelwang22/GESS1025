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

Give an operator command-first pages beside a live terminal. Success means one
page answers the current decision, from enumeration through web, AD, host
privilege and access, with the Linux privilege pass as one deliberate 20-page
path.

## Positioning

Thirty-five modules are grouped by the box's phase order: Reach, Services, Web,
Session, Host, Windows and domain, Linux privilege, and Movement. Linux
privilege escalation is one visible module with LPRIV-01 through LPRIV-20.
Retired LNX URLs redirect into it and existing LPRIV URLs stay stable.

## Operating context

Readers use the site alongside an authorized lab or exam workflow. Every page
starts with a trigger, a useful command, a concrete signal, and exact next links.
The maintained snapshot is `2026-11-21.working.132`; `pnpm stamp` re-pins it after
an edit. The original Linux task bodies stay out of published navigation and
search.

## Capabilities and constraints

- Static GitHub Pages output with local search and grouped navigation.
- A 20-page Linux privilege escalation module with scoped-first commands,
  short signals, direct finding links, and sequential previous/next controls.
- Stable task URLs, route links, previous and next navigation, and code copying.
- Exact maintained-source wording, task IDs, commands, routes, version, and
  provenance for published snapshot tasks. Operator copy is maintained
  separately.
- No progress state, notes, targets, credentials, accounts, analytics, backend,
  or command execution.
- Presentation follows the field binder direction recorded in DESIGN.md:
  compact operator pages and the full runbook treatment on retained tasks.

## Evidence on hand

- Maintained snapshot: `content/master-working-2026-11-21.working.132.md`
- Provenance manifest: `content/source.json`
- Product design: `docs/superpowers/specs/2026-11-23-lightweight-checklist-site-design.md`

No testimonials, usage metrics, or completion claims are available and none may
be invented.

## Product principles

- Put the operator workflow before retained reference detail.
- Keep enumeration and detailed procedures in one navigation tree.
- Preserve the maintained reference before styling it.
- Make finding-driven navigation obvious once a lead exists.
- Keep reading controls familiar and keyboard accessible.
- Keep this site smaller in scope than Operator Workbench.
