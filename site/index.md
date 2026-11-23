---
title: OSCP master checklist
description: A searchable reading interface for the Operator Workbench master checklist.
outline: false
aside: false
pageClass: home-page
---

# OSCP master checklist

**Edition `2026-11-21.working.132` · 145 tasks · 28 modules** {.edition-line}

This is the Operator Workbench master checklist in a format built for reading
beside a terminal. Search for a task ID, browse by module, or follow the
next-task links recorded in each decision.

> [!IMPORTANT]
> This is a finding-driven reference, not a 145-step sequence. Open only the
> branch supported by the assigned target, supplied access, or an observed
> result. A tool result is not proof of access or completion by itself.

<HomeJump />

[Start at NET-01](./generated/tasks/net-01.md){.action .action-primary} [Default box route](./generated/start.md){.action} [All modules and tasks](./checklist/){.action}

## Where to enter

Each row quotes the **When** and **Decision** cells of the source's
[default box route](./generated/start.md) word for word, then lists the tasks
that decision names with their exact titles. Enter at the row that matches what
you have observed; the box route page also gives each row's next choice.

<!--@include: ./.vitepress/generated/where-to-enter.md-->

## Reading a task

Every task page uses the same marks and controls.

| Mark | Meaning |
| --- | --- |
| `<IP_ADDRESS>` | A blank. Replace it with your own value before you run the command. Each command block lists its blanks above the code. |
| **[NET-02](./generated/tasks/net-02.md)** | A route to another task. Hover or focus it to see that task's title. |
| **PAUSE-ROUTE** | A stop state the checklist names. It is not a link and does not mean the attempt succeeded. |
| NET-03 | A task the text mentions without routing to it. Hover or focus it to see that task's title. |
| **Copy** | Copies the command block exactly as written, blanks included. |

## How to use it

1. Start from your current observed context. For a new box with no access, that
   is normally NET-01.
2. Run or perform only the action for the question in front of you, after
   replacing every highlighted blank.
3. Compare the result with the rows of the task's result table before moving
   on.
4. Follow the matching next-task link. If the result is incomplete, keep the
   uncertainty instead of inferring success.

## What this site changes

Only navigation and presentation. The source wording, command blocks, task IDs,
routes, explanations, version, and provenance are retained from the Workbench
authoring snapshot.

This site does not track progress, store targets or credentials, execute
commands, or replace Operator Workbench.
