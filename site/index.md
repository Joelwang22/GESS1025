---
title: OSCP checklist
description: A practical OSCP checklist for live boxes and deeper troubleshooting.
outline: false
aside: false
pageClass: home-page
prev: false
next: false
---

# OSCP checklist

**Commands first. Follow a lead when you find one.** {.edition-line}

Use the checklist beside your terminal. Start with the page that matches your
current position, then follow the linked task when a finding needs more work.

> [!IMPORTANT]
> Use this site only for an assigned lab or another authorized target. Start
> with the smallest check that answers the current question and stop sweeping
> when you have a credible lead.

[Open Linux privilege escalation checklist](./generated/tasks/lpriv-01.md){.action .action-primary} [Start a new box](./generated/tasks/net-01.md){.action} {.home-actions}

## Choose your situation

| You have | Start here |
| --- | --- |
| A Linux shell | [Start at LPRIV-01 and establish context](./generated/tasks/lpriv-01.md). |
| A new target with no foothold | [Begin with connectivity and service discovery](./generated/tasks/net-01.md). |
| A specific service, task ID, or finding | Search the checklist below. |

## Find a task

Search the published checklist by ID or title.

<HomeJump />

## How to use it

1. Start Linux privilege escalation at LPRIV-01.
2. Read the short **Look for** note under each command group.
3. When you find something, follow **If found** to the exact page.
4. Re-enumerate at LPRIV-20 after the identity changes.

Every command block has an always-visible **Copy** control. Highlighted values
such as `<IP_ADDRESS>` are blanks to replace before running the command.

## Box route

The original finding-driven entry table remains available in the
[default box route](./generated/start.md). You can also browse the
[module directory](./checklist/).

The site does not execute commands, store targets or credentials, or replace
your notes.
