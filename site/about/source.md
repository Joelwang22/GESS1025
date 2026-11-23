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

The generator splits the snapshot into module and task pages, and publishes the
snapshot's opening section, "How to use this edition" with its default box
route, as the [Box route](../generated/start.md) page. Visible wording and
command content remain unchanged. It adds:

- Links on recognized route marks: `Next: TASK-ID` destinations, bold task IDs
  such as `**NET-02**`, compound and abbreviated forms such as
  `**WEB-06/08**`, ranges such as `**LPRIV-01 through LPRIV-15**`, and
  arrow-joined runs such as `**SSH-01 → SSH-02**`. Terminal states such as
  `PAUSE-ROUTE` stay unlinked.
- The module's context on every task in that module, always expanded.
- Page metadata for the header row above each task title: the task's module
  and position, and the targets of its jumps (first command, result table or
  outcome list, explanations, routes). The title itself is the source heading,
  unchanged.
- Each task's derived routes: the tasks it links, the stop states it names,
  and the tasks that link to it.
- The home page's "Where to enter" rows, quoted word for word from the
  Default box route with each named task's exact title.

The site's build step then marks presentation without changing text: command
blanks such as `<IP_ADDRESS>`, route and stop marks, plain task IDs, decision
tables, the "Enter when" and "Question" cues, and outcome lists. Copy writes
each command block's text exactly as the snapshot gives it.

Generation stops if the edition, source digest, snapshot hash, task count,
explanation coverage, task IDs, or route destinations drift from the manifest.
