---
title: Source and provenance
description: Provenance for the imported Operator Workbench master checklist.
outline: [2, 3]
---

# Source and provenance

This website reads one retained Operator Workbench authoring snapshot. The
snapshot is committed here so the site builds independently of the Workbench
checkout.

| Field | Value |
| --- | --- |
| Edition | `2026-11-21.working.132` |
| Working tasks | 145 |
| Modules | 28 |
| Imported | 2026-11-23 |
| Snapshot SHA-256 | `8d6eff26e2b383b832399636b356009e68ae68e7918217a1a837ee8799cccad5` |
| Printed source digest | `ecec4118a4af2cf2dc8f29b82712febe898620d82e82079be85ef91df4a5a731` |

The snapshot's edition heading carries this note, reproduced exactly:

> Authoring edition; manual decisions are not runtime reviewer coverage.

## Retained files

- Snapshot: `content/master-working-2026-11-21.working.132.md`
- Provenance manifest: `content/source.json`
- Original Workbench path:
  `docs/checklists/oscp/master-working-2026-11-21.working.132.md`

## What generation changes

The generator splits the snapshot into module and task pages. It adds page
metadata and Markdown links around recognized `Next: TASK-ID` destinations.
Visible wording and command content remain unchanged.

Generation stops if the edition, source digest, snapshot hash, task count,
explanation coverage, task IDs, or route destinations drift from the manifest.
