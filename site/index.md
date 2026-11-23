---
title: OSCP field checklist
description: Fast field checklists backed by the complete Operator Workbench reference.
outline: false
aside: false
pageClass: home-page
---

# OSCP field checklist

**Commands first. Detailed procedures when a finding needs them.** {.edition-line}

Use the field checklist beside your terminal. It keeps the common commands and
signals on one page, then links into the full Operator Workbench reference when
a finding needs a careful procedure.

> [!IMPORTANT]
> Use this site only for an assigned lab or another authorized target. Start
> with the smallest check that answers the current question and stop sweeping
> when you have a credible lead.

[Open the Linux privilege escalation checklist](./field/linux-privilege.md){.action .action-primary} [Start a new box](./generated/tasks/net-01.md){.action} [Browse detailed reference](./checklist/){.action} {.home-actions}

## Choose your situation

| You have | Start here |
| --- | --- |
| A Linux shell | [Run the field privilege escalation checklist](./field/linux-privilege.md). |
| A new target with no foothold | [Begin with connectivity and service discovery](./generated/tasks/net-01.md). |
| A specific service, task ID, or finding | Search the detailed reference below. |

## Search the detailed reference

The reference retains all 145 imported tasks, their explanations, and their
recorded routes. Search it when the field checklist points to a deeper procedure.

<HomeJump />

## How the two layers work

1. Use a field checklist for the quick enumeration pass.
2. Read the short **Look for** note under each command group.
3. When you find something, follow **If found** into the exact reference task.
4. Return to the field checklist after the lead is resolved.

Every command block has an always-visible **Copy** control. Highlighted values
such as `<IP_ADDRESS>` are blanks to replace before running the command.

## Detailed box route

The original finding-driven entry table and all source wording remain available
in the [default box route](./generated/start.md) and the
[complete module directory](./checklist/).

The site does not execute commands, store targets or credentials, or replace
your notes.
