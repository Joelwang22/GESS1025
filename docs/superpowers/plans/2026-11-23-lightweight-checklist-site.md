# Lightweight checklist site implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the exact Workbench master checklist as a searchable, navigable VitePress site on GitHub Pages.

**Architecture:** The repository stores one exact checklist snapshot and a provenance manifest. A dependency-light Node generator validates the snapshot, splits it into module and task Markdown pages, links known route destinations, and writes the VitePress sidebar data before every dev or build command.

**Tech stack:** Node.js 22, pnpm, VitePress, Node built-in test runner, GitHub Pages Actions

**Spec:** `docs/superpowers/specs/2026-11-23-lightweight-checklist-site-design.md`

## Global constraints

- Import `2026-11-21.working.132` with exactly 145 working task bodies.
- Preserve visible checklist wording, command bytes, stable IDs, route order, version, and source digest.
- Add no progress state, backend, accounts, command execution, analytics, or remote runtime services.
- Generate only under `site/generated/` and `site/.vitepress/generated/`.
- Use repository-local assets and dependencies; the production site must not fetch fonts, scripts, or styles from third-party origins.

## Review focus

- A task heading inside a command fence must remain content, not become a second task. Parser tests use a fenced heading fixture.
- A task with working content but no explanation must fail with its exact ID. Parser tests exercise the omission.
- A `Next:` destination that is a known terminal state rather than a task must remain plain text, while an unknown task-like ID must fail. Route tests cover both cases.
- GitHub Pages' `/checklist/` base path must preserve sidebar, search, task, asset, and previous/next links. The production build and link audit exercise the configured base.
- Reimporting identical input must produce byte-identical generated output. The generation test runs twice and compares a directory digest.

---

### Task 1: Content import and deterministic parser

**Files:**
- Create: `content/master-working-2026-11-21.working.132.md`
- Create: `content/source.json`
- Create: `scripts/checklist.mjs`
- Create: `tests/checklist.test.mjs`
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `.gitignore`

**Interfaces:**
- Consumes: the exact Workbench snapshot at `docs/checklists/oscp/master-working-2026-11-21.working.132.md` during the one-time import
- Produces: `parseChecklist(markdown: string): Checklist`, `linkTaskRoutes(markdown: string, taskIds: Set<string>, terminalStates: Set<string>): string`, and `generateSite({ sourcePath, manifestPath, outputRoot }): Promise<GenerationResult>` from `scripts/checklist.mjs`

- [ ] **Step 1: Write parser and provenance tests**

  Assert the real snapshot reports edition `2026-11-21.working.132`, 145 unique working tasks, one matching explanation per task, source-order modules, the manifest's exact file SHA-256, fenced pseudo-headings ignored, missing explanations rejected, and duplicate IDs rejected.

- [ ] **Step 2: Run the tests to verify they fail**

  Run: `pnpm test`

  Expected: failure because `scripts/checklist.mjs` and imported content do not exist.

- [ ] **Step 3: Import the source and implement the parser**

  Copy the snapshot byte-for-byte, record its edition, printed source digest,
  exact SHA-256, expected task count, source repository path, and import date in
  `content/source.json`, then implement the exported parser and validation
  functions using only Node built-ins.

- [ ] **Step 4: Add route and determinism tests**

  Assert known task destinations become relative Markdown links, terminal-state
  destinations remain visible plain text, unknown task-like destinations fail,
  and two generations have the same directory digest.

- [ ] **Step 5: Implement deterministic generation**

  Generate a home page, checklist index, provenance page, module index pages,
  one page per task with working and explanation content, a JSON content
  manifest, and sidebar data. Clean only the two generator-owned directories.

- [ ] **Step 6: Run the focused tests**

  Run: `pnpm test`

  Expected: all parser, provenance, route, and determinism tests pass.

### Task 2: VitePress reading site

**Files:**
- Create: `site/.vitepress/config.mjs`
- Create: `site/.vitepress/theme/index.js`
- Create: `site/.vitepress/theme/custom.css`
- Create: `site/index.md`
- Create: `site/checklist/index.md`
- Create: `site/about/source.md`
- Create: `site/generated/**`
- Create: `site/.vitepress/generated/sidebar.json`
- Modify: `package.json`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `GenerationResult` and generated sidebar data from Task 1
- Produces: `pnpm dev`, `pnpm build`, and static output at `site/.vitepress/dist/`

- [ ] **Step 1: Write generated-site contract tests**

  Assert the generated home, index, provenance, module, and 145 task pages
  exist; task pages contain stable IDs, working text, explanations, and linked
  task routes; sidebar groups preserve module and task order.

- [ ] **Step 2: Run the site tests to verify they fail**

  Run: `pnpm test`

  Expected: failure because the VitePress configuration and generated site do
  not exist.

- [ ] **Step 3: Configure the documentation experience**

  Configure VitePress with base `/checklist/`, local search, grouped sidebar,
  outline navigation, code-copy controls, edit links disabled, source metadata,
  and previous/next navigation. Add restrained local CSS for reading width,
  long command wrapping, focus visibility, and narrow viewports.

- [ ] **Step 4: Build and audit links**

  Run: `pnpm build`

  Expected: VitePress exits 0 and writes `site/.vitepress/dist/index.html`.

  Run: `pnpm test`

  Expected: all tests pass, including a built-HTML audit that rejects root-base
  task and asset links.

### Task 3: Repository delivery and GitHub Pages

**Files:**
- Create: `.github/workflows/pages.yml`
- Create: `README.md`
- Create: `.node-version`
- Modify: `package.json`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `pnpm test` and `pnpm build` from Tasks 1 and 2
- Produces: a Pages artifact from `site/.vitepress/dist/` and documented local/import workflows

- [ ] **Step 1: Add delivery contract tests**

  Assert the workflow uses the official configure, upload, and deploy Pages
  actions; installs with `pnpm --frozen-lockfile`; and runs tests before build.

- [ ] **Step 2: Run the delivery tests to verify they fail**

  Run: `pnpm test`

  Expected: failure because the Pages workflow and README do not exist.

- [ ] **Step 3: Add deployment and maintenance documentation**

  Add a least-privilege Pages workflow triggered on `main` and manual dispatch.
  Document purpose, non-goals, local commands, source provenance, deliberate
  reimport, generated-file ownership, and the GitHub Pages settings required for
  Actions deployment.

- [ ] **Step 4: Run slice verification**

  Run: `pnpm test`

  Expected: all tests pass.

  Run: `pnpm build`

  Expected: production build succeeds with 145 task pages and no broken internal
  links found by the audit.

  Run: `git diff --check`

  Expected: exit 0.

