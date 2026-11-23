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

Give an operator a compact, command-first field checklist beside a live
terminal, with the complete imported runbook available when a finding needs
more context. Success means the common enumeration pass stays on one scannable
page and a deeper procedure is one link away.

## Positioning

This repository has two layers. Hand-authored field checklists optimize the
common operator workflow for speed. A faithful reading interface retains the
Operator Workbench master checklist as the detailed reference.

## Operating context

Readers use the site alongside an authorized lab or exam workflow. A field
checklist groups the commands an operator normally scans together. Detailed
tasks remain finding-driven rather than a required linear sequence. The
retained reference source is `2026-11-21.working.132`, with 145 working task
bodies and matching explanations.

## Capabilities and constraints

- Static GitHub Pages output with local search and grouped navigation.
- A concise Linux privilege escalation field checklist with scoped-first
  commands, short signals, and direct links into detailed procedures.
- Stable task URLs, route links, previous and next navigation, and code copying.
- Exact reference-source wording, task IDs, commands, routes, version, and
  provenance. Field-checklist copy is maintained separately.
- No progress state, notes, targets, credentials, accounts, analytics, backend,
  or command execution.
- Presentation follows the field binder direction recorded in DESIGN.md:
  compact command plates in field pages and the full runbook treatment in
  reference pages.

## Evidence on hand

- Imported snapshot: `content/master-working-2026-11-21.working.132.md`
- Provenance manifest: `content/source.json`
- Product design: `docs/superpowers/specs/2026-11-23-lightweight-checklist-site-design.md`

No testimonials, usage metrics, or completion claims are available and none may
be invented.

## Product principles

- Put the field workflow before the source archive.
- Keep quick enumeration and deep procedures visibly distinct.
- Preserve the imported reference before styling it.
- Make finding-driven navigation obvious once a lead exists.
- Keep reading controls familiar and keyboard accessible.
- Keep this site smaller in scope than Operator Workbench.
