---
title: Checklist modules
description: Published modules and operator pages in the OSCP checklist.
outline: false
aside: false
pageClass: index-page
prev: false
next: false
---

# Checklist modules

Browse the published pages when you know an ID, need a result table, or need the
prerequisites and recovery notes for a finding.

The summary follows the box's phase order: enumeration, services, web, session,
host, Windows and domain, Linux privilege, movement. Open one lane at a time; a
failed lead returns to the service it came from rather than moving forward.

For a Linux shell, start at
[LPRIV-01](./generated/tasks/lpriv-01.md).

[Default box route](./generated/start.md){.action} [Module summary](#module-summary){.action}

## From a scan line

A reported port maps to the module that opens its lane. The same ports appear on
each module row and match in the filter below. Confirm the service before
following a label; a port guess is not a protocol proof.

<!--@include: ./.vitepress/generated/port-index.md-->

## Every task

Every published page in phase order, grouped by module or as one flat list.

<TaskDirectory />

## Module summary

Each module page lists its tasks, after the module context when the source
gives one. The sections follow the box's phase order and are generated from the
same phase list as the sidebar.

<!--@include: ./.vitepress/generated/module-directory.md-->

