# OSCP checklist

A command-first website for use beside a terminal. Forty-seven modules follow the
box's phase order from enumeration through service lanes, session, host,
privilege, domain and pivoting. Each service owns one module and its scan ports,
and the home page has a generated port index. Linux and Windows are parallel
Privilege lanes, each with host context; Linux privilege escalation is one
authored 20-page operator module.

The retained edition is `2026-11-21.working.132`. The snapshot is now
maintained in place for this site; its hash, task count and the LPRIV pages
are pinned by generation.

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

This repository is a checklist interface. It does not track box
progress, store targets or credentials, execute commands, provide accounts, or
reproduce Operator Workbench workflows.

The checklist is finding-driven. It is not a required linear sequence and
does not assert that a tool result proves access or completion.

## Source provenance

The snapshot is
`content/master-working-2026-11-21.working.132.md`. `content/source.json` pins
its edition, printed source digest, expected task count, exact SHA-256, and the
three local supporting references used by the snapshot.

The generator rejects source drift, duplicate task IDs, missing explanations,
unknown route destinations, hash mismatches, and task-count changes. The source
and provenance details are also published at `/GESS1025/about/source.html`.

## Generated-file ownership

`scripts/checklist.mjs` owns these directories:

- `site/generated/`
- `site/.vitepress/generated/`

Both are ignored by Git and replaced on every generation. Do not edit them.
Edit authored operator pages under `content/linux-privilege/`, framing pages
under `site/`, generator logic under `scripts/`, or the maintained task snapshot
under `content/`.

The snapshot is edited directly. Operator copy still stays separate so a page
edit cannot silently change a task.

## Design

The interface design (colours, type, components, and the rules that keep
source text exact and visible) is recorded in `DESIGN.md`. Theme code lives in
`site/.vitepress/theme/` (`tokens.css`, `components.css`, `custom.css` and the
Vue components) and build-time Markdown presentation in
`site/.vitepress/markdown.mjs`.

## Refreshing the checklist

The snapshot is the working source now. Edit it in place, then re-pin and verify:

1. Edit task bodies in `content/master-working-2026-11-21.working.132.md`. Keep
   the heading shape, one explanation per task, and only real route IDs.
2. Run `pnpm stamp`. It recomputes the SHA-256 and task count and updates the
   manifest, provenance page, design counts and test expectations.
3. When a module is added or renamed, update its display name,
   `SIDEBAR_SECTIONS` phase and `SERVICE_PORTS` in `scripts/checklist.mjs`. The
   home directory and port index are generated from those; do not edit them.
4. Run `pnpm test` and `pnpm build`. Commit only after both pass.

To import a genuinely new Workbench edition instead, replace the snapshot path,
edition and printed digest in `content/source.json` and `scripts/checklist.mjs`,
then run the same steps. Do not edit the three supporting references in place.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` tests, builds, uploads, and
deploys the site when `main` changes. In the repository settings, open
**Pages**, set **Source** to **GitHub Actions**, and save. The VitePress base is
`/GESS1025/`, matching `https://joelwang22.github.io/GESS1025/`.

The workflow grants read-only repository access plus the Pages and identity
permissions required by the official deployment actions. It does not publish
packages or write repository contents.
