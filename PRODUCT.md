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

Turn the current long-form checklist export into a faster reading experience.
Success means a reader can find the relevant module or task, read its commands
and interpretation, then follow the recorded next task without navigating a
large document.

## Positioning

This repository is a faithful reading interface for the Operator Workbench
master checklist. It does not reproduce Workbench's operator workflows or add a
second application.

## Operating context

Readers use the site alongside an authorized lab or exam workflow. Tasks are
finding-driven rather than a required linear sequence. The source material is
`2026-11-21.working.132`, with 145 working task bodies and matching explanations.

## Capabilities and constraints

- Static GitHub Pages output with local search and grouped navigation.
- Stable task URLs, route links, previous and next navigation, and code copying.
- Exact source wording, task IDs, commands, routes, version, and provenance.
- No progress state, notes, targets, credentials, accounts, analytics, backend,
  or command execution.
- The first release uses a restrained documentation baseline. A separate later
  task will decide any stronger visual direction.

## Evidence on hand

- Imported snapshot: `content/master-working-2026-11-21.working.132.md`
- Provenance manifest: `content/source.json`
- Product design: `docs/superpowers/specs/2026-11-23-lightweight-checklist-site-design.md`

No testimonials, usage metrics, or completion claims are available and none may
be invented.

## Product principles

- Preserve the checklist before styling it.
- Make finding-driven navigation obvious.
- Keep reading controls familiar and keyboard accessible.
- Keep this site smaller in scope than Operator Workbench.
