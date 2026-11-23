# OSCP field checklist

A command-first website for use beside a terminal. The default field checklists
keep routine enumeration compact, while the full Operator Workbench master
checklist remains searchable as the detailed reference.

The first field guide covers Linux privilege escalation. The retained reference
contains edition `2026-11-21.working.132`: 145 tasks across 28 modules. It keeps
the imported wording, commands, task IDs, routes, explanations, version, and
provenance.

## Local use

Requires Node.js 22 or newer and pnpm 9.15.9.

```text
pnpm install --frozen-lockfile
pnpm dev
```

The development site regenerates the checklist pages before starting VitePress.

Run the content, generation, link, and production-build contracts with:

```text
pnpm test
```

Create the deployable site at `site/.vitepress/dist/` with:

```text
pnpm build
```

## Scope

This repository is a field and reference interface. It does not track box
progress, store targets or credentials, execute commands, provide accounts, or
reproduce Operator Workbench workflows.

The checklist is finding-driven. It is not a required 145-step sequence and
does not assert that a tool result proves access or completion.

## Source provenance

The exact imported snapshot is
`content/master-working-2026-11-21.working.132.md`. `content/source.json` pins
its edition, printed source digest, expected task count, exact SHA-256, and the
three local supporting references used by the snapshot.

The generator rejects source drift, duplicate task IDs, missing explanations,
unknown route destinations, hash mismatches, and task-count changes. The source
and provenance details are also published at `/checklist/about/source.html`.

## Generated-file ownership

`scripts/checklist.mjs` owns these directories:

- `site/generated/`
- `site/.vitepress/generated/`

Both are ignored by Git and replaced on every generation. Do not edit them.
Edit field checklists and framing pages under `site/`, generator logic under
`scripts/`, or imported content under `content/` as appropriate. Field copy is
maintained separately from the imported snapshot so a practical edit cannot
silently change the retained reference.

## Design

The interface design (colours, type, components, and the rules that keep
source text exact and visible) is recorded in `DESIGN.md`. Theme code lives in
`site/.vitepress/theme/` (`tokens.css`, `components.css`, `custom.css` and the
Vue components) and build-time Markdown presentation in
`site/.vitepress/markdown.mjs`.

## Refreshing the checklist

Refreshes are deliberate because the website must identify the exact checklist
edition it publishes.

1. Copy the new retained Workbench snapshot into `content/` without changing
   its bytes.
2. Update the snapshot path, edition, printed digest, SHA-256, expected task
   count, and import date in `content/source.json` and `scripts/checklist.mjs`.
3. Reimport and hash any supporting local files that the snapshot links.
4. Update the edition and counts on `site/checklist/index.md` and
   `site/about/source.md`.
5. Run `pnpm test` and `pnpm build`. Commit the new source and lockfile only
   after both commands pass.

Do not edit an earlier imported snapshot in place. Add the new edition and
remove the old edition only in the same reviewed refresh.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` tests, builds, uploads, and
deploys the site when `main` changes. In the repository settings, open
**Pages**, set **Source** to **GitHub Actions**, and save. The VitePress base is
`/checklist/`, matching `https://joelwang22.github.io/checklist/`.

The workflow grants read-only repository access plus the Pages and identity
permissions required by the official deployment actions. It does not publish
packages or write repository contents.
