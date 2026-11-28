---
title: Source and provenance
description: Provenance for the maintained checklist snapshot.
outline: [2, 3]
---

# Source and provenance

This website maintains one Operator Workbench-derived snapshot. It is committed
here and edited in place, so the site builds independently of the Workbench
checkout. `pnpm stamp` re-pins the hash and counts after an intentional edit.

| Field | Value |
| --- | --- |
| Edition | `2026-11-21.working.132` |
| Snapshot tasks | 231 |
| Snapshot modules | 48 |
| Published pages | 226 |
| Published modules | 47 |
| Imported | 2026-11-23 |
| Snapshot SHA-256 | `9ec725d623b7d5678dd4cb85a22e611e27d6f467e1fbaf3eab35e638b8fa956c` |
| Printed source digest | `ecec4118a4af2cf2dc8f29b82712febe898620d82e82079be85ef91df4a5a731` |

The snapshot's edition heading carries this note, reproduced exactly:

> Authoring edition; manual decisions are not runtime reviewer coverage.

## Retained files

- Snapshot: `content/master-working-2026-11-21.working.132.md`
- Provenance manifest: `content/source.json`
- Original Workbench path:
  `docs/checklists/oscp/master-working-2026-11-21.working.132.md`

## What generation changes

The generator publishes the snapshot's non-retired modules and its opening
section, "How to use this edition" with the default box route. It replaces the
snapshot's old Linux and narrow Linux-privilege modules with one authored
[Linux privilege escalation](../generated/modules/linux_privilege.md) module.
The replacement has exactly LPRIV-01 through LPRIV-20. The retired task bodies
are not published as an archive. Generation also adds:

- Links on recognized route marks: `Next: TASK-ID` destinations, bold task IDs
  such as `**NET-02**`, compound and abbreviated forms such as
  `**WEB-06/08**`, ranges such as `**LPRIV-01 through LPRIV-20**`, and
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
- Base-aware compatibility redirects from LNX-01 through LNX-10 to the closest
  new LPRIV operator page. Existing LPRIV URLs keep their paths.

The site's build step then marks presentation without changing text: command
blank such as `<TARGET_IP>`, route and stop marks, plain task IDs, decision
tables, the "Enter when" and "Question" cues, and outcome lists. Copy writes
each command block's text exactly as the snapshot gives it.

Generation stops if the edition, source digest, snapshot hash, imported task
count, explanation coverage, task IDs, route destinations, or 20-page operator
contract drifts from the expected structure.
