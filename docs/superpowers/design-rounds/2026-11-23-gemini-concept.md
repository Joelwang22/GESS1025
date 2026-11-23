# OSCP Master Checklist — Replacement Visual & Reading System Concept

> **Scope & Mode:** Read-only design concept for `C:\Users\joelw\Documents\checklist` (edition `2026-11-21.working.132`, 145 tasks, 28 modules). Zero files edited, zero invented claims, zero operator-application state added.

---

## Corpus & Baseline Audit Findings (Why a Deeper Redesign Matters)

Inspecting [scripts/checklist.mjs](C:/Users/joelw/Documents/checklist/scripts/checklist.mjs), [site/.vitepress/theme/custom.css](C:/Users/joelw/Documents/checklist/site/.vitepress/theme/custom.css), [DESIGN.md](C:/Users/joelw/Documents/checklist/DESIGN.md), [tests/site.test.mjs](C:/Users/joelw/Documents/checklist/tests/site.test.mjs), and all 145 generated task files revealed five structural UX gaps that a purely cosmetic reskin would miss:

1. **646 unlinked task branches across 127 of 145 tasks:** [scripts/checklist.mjs:16](C:/Users/joelw/Documents/checklist/scripts/checklist.mjs:16) only links `Next: TASK-ID` (88 links across 18 bullet-list tasks such as `ad-01.md` and `net-05.md`). In the **130 tasks that use Markdown result tables**, next-task destinations are written as bold IDs (`**NET-02**`, `**WIN-16**`, `**WEB-06/08**`, `**LNX-01/02**`)—all 646 are currently unclickable plain bold text, alongside 224 bold terminal halt states (`**PAUSE-ROUTE**`, `**PAUSE-COVERAGE**`, `**GAP-*` ).
2. **Hidden module-level execution rules:** 11 of 28 modules carry critical shell/safety context in their module header (e.g., [site/generated/modules/linux_privilege.md:8-11](C:/Users/joelw/Documents/checklist/site/generated/modules/linux_privilege.md:8-11): *"Run commands in the verified target Bash session"*), yet jumping directly to a task via search or route link hides that context completely.
3. **1,992 command placeholders and 826-character command lines:** Across 732 code blocks (`bash`: 535, `text`: 90, `powershell`: 74, `sql`: 28, `cmd`: 5), substitution slots like `'<IP_ADDRESS>'` and `'<absolute-observed-root-SUID-GNU-find>'` visually blend into surrounding command text, and ultra-long lines wrap indiscriminately inside a tight `74ch` column.
4. **Linear pager contradicts finding-driven guidance:** [site/.vitepress/config.mjs:47-50](C:/Users/joelw/Documents/checklist/site/.vitepress/config.mjs:47-50) labels VitePress's linear sidebar footer `"Next task"`—so at the bottom of `NET-05` (*Choose a service to investigate*), the primary footer link directs the reader to `FTP-01` regardless of observed ports.
5. **Typography & casing friction on Kali Linux:** [site/.vitepress/theme/custom.css:8-12](C:/Users/joelw/Documents/checklist/site/.vitepress/theme/custom.css:8-12) relies on `Segoe UI` and `Cascadia Code`, neither of which exists on Kali Linux (the primary exam OS), causing fallback to wide/uneven system fonts; meanwhile `displayName()` in [scripts/checklist.mjs:271-276](C:/Users/joelw/Documents/checklist/scripts/checklist.mjs:271-276) renders acronyms in title case (`Http`, `Windows Ad`, `Dns Nfs`, `Snmp`, `Mssql`, `Mail Rdp`, `Ftp Tls`) in the sidebar despite proper casing in [site/checklist/index.md](C:/Users/joelw/Documents/checklist/site/checklist/index.md).

---

## 1. Named Direction & Cultural / Artifact Grounding

### Direction Name: **QRH-132 — "The Non-Normal Flight Card"**

### Cultural & Artifact Grounding
Rather than generic SaaS documentation, cyberpunk terminal cosplay, or Minecraft-inspired Workbench styling, this direction is grounded in **Commercial Aviation Quick Reference Handbooks (QRH)** (Boeing/Airbus non-normal checklists), **NASA Flight Data File (FDF) Cue Cards**, and **Mid-Century Bell Labs / Tektronix Technical Service Manuals**.

These physical and electronic artifacts were evolved over decades for the exact cognitive conditions of an OSCP exam: **12–24 hours of solitary, time-bounded, high-stress, non-linear fault isolation**, where misreading a prerequisite, skipping a boundary check, or pasting a command into the wrong shell costs hours.

**Core Design Laws Translating QRH Craft to the Web:**
- **Zero Glare, Zero Neon:** Daylight reading sits on warm matte vellum (`#F6F4EE`), eliminating pure-white monitor halation; night reading sits on low-glare cockpit instrument slate (`#13161A`) with warm off-white ink (`#E7E4DC`) tuned to sit calmly beside a dark Kali `tmux` pane without OLED black smear or neon-green cliché.
- **Two-Axis Dichromat-Safe Operational Signaling:** Replace VitePress's default blue-plus-random-violet scheme with the classic aerospace **Cobalt–Ochre** axis (100% distinguishable under protanopia/deuteranopia and backed by redundant shape/glyph cues):
  - **Instrument Cobalt** = *Navigable route, interactive control, active position* (`→ NET-02`).
  - **Caution Ochre / Amber** = *Halt gate, scope boundary, unreplaced command placeholder* (`‖ PAUSE-COVERAGE`, `‖ GAP-SERVICE`, `<IP_ADDRESS>`). Never red (a pause is a disciplined stop, not a failure) and never green (the site never claims access or completion).
- **Front-of-Card vs. Back-of-Card Hierarchy:** Every task page visually separates the terse **Working Procedure** (entry, commands, condition→branch matrix) from the recessed **Amplified Notes (`## Explanations and troubleshooting`)** band below it—both remain expanded and `Ctrl+F`-searchable, never hidden behind accordions.
- **Hairline Structural Anchoring:** Heavy `2px` top/bottom structural rules frame the Task Identification Header and Decision Matrix, replacing rounded floating SaaS cards and shadows.

---

## 2. First Viewport & Signature Interaction

### First Viewport (`site/index.md` at 1280×800 and 768×900 Split-Screen)
No marketing hero, no decorative artwork, no progress meters. The landing page becomes a **Flight Index & Finding-Driven Dispatch Sheet** so an operator arriving mid-box reaches the right task in **1 click or 2 keystrokes**:

1. **QRH Edition Header Strip** (anchored by a `2px` top rule):
   - Kicker (mono, uppercase): `EDITION 2026-11-21.WORKING.132 · 145 TASKS · 28 MODULES · STATIC REFERENCE`
   - H1: `OSCP master checklist` + concise existing lead sentence.
   - **Inline Search Trigger Bar** (`Search task ID, service, or command…` with `/` and `Ctrl K` keycaps) wired directly to VitePress's native local search modal.
2. **Operational Scope Rule Band** (left `3px` Ochre structural bar on subtle warm-amber tint—replacing VitePress's default violet `[!IMPORTANT]` box):
   - Preserves verbatim the existing finding-driven warning (*"not a 145-step sequence... A tool result is not proof of access or completion by itself"*).
3. **Finding-Driven Entry Matrix ("Start from your current observation")** — a flat, ruled 3-column index grid above the fold containing only real links into existing tasks (no invented taxonomy claims):
   - **Initial Box / Network:** `NET-01` Connectivity · `NET-02` TCP Scan · `NET-05` Service Dispatch
   - **Observed Service:** `WEB-01` HTTP · `AD-01` Windows/AD · `SMB-01` SMB · `FTP-01` FTP · `SSH-01` SSH · `DB-01` / `DB-03` SQL · `REDIS-01` Redis · `DNS-01` DNS · `NFS-01` NFS · `SNMP-01` SNMP · `MAIL-01` Mail · `RDP-01` RDP
   - **Active Shell / Artifact:** `EXP-03` Verify Shell · `SHELL-01` Stabilize PTY · `LNX-01` Linux Triage · `LPRIV-01` Linux PrivEsc · `WIN-01` Windows Triage · `ART-01` Local Artifact
   - Footer links below the matrix: `Browse all 28 modules →` ([site/checklist/index.md](C:/Users/joelw/Documents/checklist/site/checklist/index.md)) and `Source & provenance →` ([site/about/source.md](C:/Users/joelw/Documents/checklist/site/about/source.md)).
4. **Below the fold:** Verbatim `"How to use it"` (4 numbered steps) and `"What this site changes"` sections.

### Signature Interaction: **Condition-to-Branch Routing & Zero-Mistake Command Inspection**
Three tightly coupled, zero-state interactions define daily use across all 145 task pages:

1. **Clickable QRH Route Chips vs. Non-Link Halt Stamps:**
   - Every task ID in a result table or `Next:` clause (`646 + 88 = 734` route references, including compound forms like `**WEB-06/08**` and `**LNX-01/02**`) renders as a crisp square-cornered (`2px` radius) **Cobalt Route Chip** (`→ NET-02`) carrying a native `title` / accessible tooltip previewing the destination's full title (e.g., `NET-02 · Scan the box's TCP ports and services`, statically injected at build time—zero runtime fetch).
   - Every terminal state (`PAUSE-ROUTE`, `PAUSE-COVERAGE`, `PAUSE-RECOVERY`, `GAP-SERVICE`, etc.) renders as a non-interactive **Ochre Halt Stamp** (`‖ PAUSE-COVERAGE`) with a `3px` amber left bar, giving instant visual separation between *"follow branch"* and *"stop and verify boundary"*.
   - Hovering any result-table row gently illuminates the full row with a `2px` cobalt left guide so the eye tracks cleanly from left-hand observation slug to right-hand branch.
2. **Command Plate Utility Bar + Placeholder Illumination:**
   - Every fenced command block sits inside a flat **Command Plate** with an always-visible `28px` header bar showing:
     - Monospaced shell/language tag (`BASH`, `POWERSHELL`, `SQL`, `CMD`, `TEXT`),
     - A **`Wrap` / `No-wrap` toggle** (defaults to `Wrap` so long commands never clip in split-screen; one click switches to horizontal scroll for inspecting complex flags/pipes on 200–826 char commands),
     - An **always-visible `Copy` button** (not hidden until hover—essential for touch/keyboard/fast scanning) with `aria-live="polite"` confirmation (`Copied`).
   - Inside `<pre><code>`, all **1,992 `<PLACEHOLDER>` spans** are highlighted in Caution Ochre with a subtle dotted underline (via a Shiki build-time transformer) so operators spot every value requiring substitution before pasting—while clipboard copy preserves the **exact verbatim source bytes**.
3. **Keyboard-First Jump Without Leaving the Reading Flow:**
   - Pressing `/` anywhere outside an input immediately opens VitePress local search (supplementing `Ctrl+K` / `Cmd+K`), and every task header strip includes a single-click `Notes ↓` anchor jump to `#explanations-and-troubleshooting` plus the module breadcrumb link.

---

## 3. Exact Design System Specification

### A. Palette (Verified WCAG AA/AAA Ratios)

| Token Role | CSS Custom Property | Light ("Daylight Vellum") | Dark ("Night-Flight Slate") | Contrast (on primary bg) |
| :--- | :--- | :--- | :--- | :--- |
| Reading canvas | `--vp-c-bg` | `#F6F4EE` | `#13161A` | — |
| Sidebar / Amplified notes surface | `--vp-c-bg-alt` | `#ECE9E0` | `#191D23` | — |
| Code well / Table header | `--vp-c-bg-soft` | `#EFECE4` | `#0E1116` | — |
| Code plate top bar | `--qrh-code-bar` | `#E4E0D4` | `#171C23` | — |
| Primary ink | `--vp-c-text-1` | `#1A1D21` | `#E7E4DC` | **15.1:1** (L) / **14.3:1** (D) |
| Secondary ink | `--vp-c-text-2` | `#4E555F` | `#A5ABB5` | **7.0:1** (L) / **7.6:1** (D) |
| Tertiary / Metadata ink | `--vp-c-text-3` | `#626973` | `#868E99` | **5.1:1** (L) / **5.4:1** (D) |
| Hairline divider | `--vp-c-divider` | `#D4CFC3` | `#2A313B` | — |
| Heavy QRH anchor rule (`2px`) | `--qrh-rule-heavy` | `#1A1D21` | `#7E8896` | — |
| Route / Interactive Cobalt | `--vp-c-brand-1` | `#0E4D8A` | `#72B8F4` | **7.7:1** (L) / **8.9:1** (D) |
| Cobalt Hover | `--vp-c-brand-2` | `#093866` | `#96CCFA` | **10.6:1** (L) / **11.2:1** (D) |
| Cobalt Soft Wash (selection/chip bg) | `--vp-c-brand-soft` | `rgba(14, 77, 138, 0.09)` | `rgba(114, 184, 244, 0.13)` | — |
| Route Chip Border | `--qrh-route-border` | `rgba(14, 77, 138, 0.34)` | `rgba(114, 184, 244, 0.36)` | — |
| Halt / Boundary / Placeholder Ochre | `--qrh-amber-1` | `#9A4300` | `#F2AE49` | **6.1:1** (L) / **9.9:1** (D) |
| Ochre Soft Wash (halt stamp / callout) | `--qrh-amber-soft` | `rgba(180, 83, 9, 0.10)` | `rgba(242, 174, 73, 0.13)` | — |
| Ochre Border | `--qrh-amber-border` | `rgba(180, 83, 9, 0.38)` | `rgba(242, 174, 73, 0.42)` | — |
| Row hover highlight | `--qrh-row-hover` | `rgba(14, 77, 138, 0.055)` | `rgba(114, 184, 244, 0.075)` | — |

**Syntax Highlighting (Shiki):** Configure dual built-in Shiki themes in VitePress (`github-light-default` / `github-dark-dimmed` with muted overrides) so syntax tokens stay low-saturation and never compete with Ochre `<PLACEHOLDER>` highlights.

### B. Typography (100% Offline, Kali-Consistent)
- **Font Pairing (Self-hosted Latin WOFF2 via `@fontsource` bundled into `dist/assets/`—zero CDN calls, `font-display: swap`):**
  - **Sans (`--vp-font-family-base`):** `"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif` — engineered for dense technical manuals; high x-height, crisp tabular numerals, compact width for long task titles.
  - **Mono (`--vp-font-family-mono`):** `"IBM Plex Mono", "JetBrains Mono", "Cascadia Code", "Liberation Mono", ui-monospace, monospace` — slashed zero (`0` vs `O`), unmistakable `1`/`l`/`I` differentiation critical when manually reading flags (`-l`, `-I`, `-1`) and hashes.
- **Type Scale & Measure:**
  - **Task ID Stamp:** `IBM Plex Mono`, `600`, `0.8125rem` (`13px`), `letter-spacing: 0.04em`, uppercase.
  - **Page H1 (`Task Title`):** `IBM Plex Sans`, `600`, `1.75rem` desktop (`1.45rem` ≤640px), `line-height: 1.24`, `letter-spacing: -0.02em`.
  - **Section H2 (`Explanations and troubleshooting`):** `IBM Plex Sans`, `600`, `1.25rem`, `line-height: 1.32`, preceded by mono kicker `AMPLIFIED NOTES`.
  - **Section H3:** `IBM Plex Sans`, `600`, `1.0625rem`, `line-height: 1.4`.
  - **Prose Body:** `15.5px` desktop (`15px` ≤640px), `line-height: 1.66`, **`max-width: 68ch`** (`p`, `ul`, `ol`) for effortless 16-hour scan speed.
  - **Code Blocks:** `13.5px` (`13px` ≤640px), `line-height: 1.62`, **`max-width: 84ch`** (breaks out cleanly from prose measure inside the `820px` content container so long commands wrap far less often).
  - **Tables & Sidebar:** `14px`, `line-height: 1.48`, `font-variant-numeric: tabular-nums`.

### C. Material, Elevation & Geometry
- **Flat Matte Surfaces:** Zero persistent drop shadows on document blocks. Elevation comes strictly from tonal paper steps (`--vp-c-bg` → `--vp-c-bg-alt` → `--vp-c-bg-soft`) and crisp `1px` / `2px` rules.
- **Shadow Exception:** Only VitePress's transient local search modal and mobile nav drawer use `0 8px 28px rgba(0, 0, 0, 0.22)` (dark) / `0 8px 24px rgba(26, 29, 33, 0.12)` (light).
- **Tight Technical Radii (No Pills):**
  - `2px`: Route chips, halt stamps, inline code, keycaps, copy/wrap buttons.
  - `4px`: Command plates, callout bands, catalog pager, search input.
  - `0px`: Structural rules, decision matrix outer top/bottom anchors, sidebar active indicator bar.

### D. Layout & Responsive Geometry
- **Shell Max Width:** `--vp-layout-max-width: 1480px`.
- **Adaptive Sidebar Width:** `272px` at `960px–1279px` (maximizes room for tiled half-screen laptop browsers beside Kali), `296px` at `>= 1280px`.
- **Article Column:** `.VPDoc .content-container { max-width: 820px; }` with prose constrained to `68ch` (`~630px`) and code plates + decision tables spanning the full `820px` (`~84ch`).
- **Right Outline (`VPDocAside`):** Appears at `>= 1280px`; relabeled `"On this card"`.
- **Mobile & Narrow Split-Screen (`<= 640px`):**
  - VitePress native mobile nav bar (`VPLocalNav`) stays intact.
  - **2-column Decision Matrices (`table.qrh-matrix-2col`)** automatically stack each `<tr>` into a crisp vertical **Condition / Next** block using `data-label` column captions injected at build time—eliminating horizontal table swiping on 390px phones or narrow browser panes. Any 3+ column table (e.g., reference docs) keeps horizontal scroll with subtle edge fade.
  - Command plates bleed `-12px` into side gutters with `0` left/right border radius so maximum characters fit per line.

### E. Component Specifications
1. **Top Navigation Bar (`VPNav`):** Compact `56px` height, matte `--vp-c-bg` with `1px solid --vp-c-divider` bottom hairline (no blurry glassmorphism). Site title carries a tiny `18px` inline SVG QRH tab glyph (no external raster), links (`Checklist`, `Source`), compact Search button showing `Ctrl K` / `/`, theme toggle, GitHub link.
2. **Grouped Left Sidebar (`VPSidebar`):**
   - Preserves all 28 modules in exact source order with corrected acronym titles (`HTTP`, `Windows & AD`, `DNS & NFS`, `SNMP`, `MSSQL`, `Mail & RDP`, `FTP TLS`, `SMB Write`, `SQL Continuation`, `SSH Knock`).
   - Displays subtle right-aligned tabular task count (`37`, `15`, `11`) per module group.
   - Task items render `ID` in `IBM Plex Mono 600` followed by title in `IBM Plex Sans`, with a `2px` Cobalt left edge bar on the active task and auto-scroll into view when arriving via a route link.
   - Lightweight **`sidebar-nav-before` Quick Filter** (ephemeral input: `"Filter 145 tasks…"`): filters visible sidebar links by ID/title in place without obscuring the current page with a modal.
3. **Task Identification Header & Module Context Strip (`doc-before` slot on task pages):**
   - Anchored by a `2px` heavy top rule: `[NET-01]` high-contrast mono stamp · Module breadcrumb link (`Network ↗`) · `Notes ↓` anchor.
   - When the task's module has a `module.context` rule (11 modules), renders a compact single-band **Execution Context Strip** right below the header (e.g., *`MODULE CONTEXT · Linux Privilege:` Run commands in the verified target Bash session. Replace all placeholders.*), verbatim from the module's source context—making shell boundaries unmissable on direct task entry.
4. **Command Plate (`div.language-*`):**
   - `1px solid --vp-c-divider`, `4px` radius, `28px` `--qrh-code-bar` top strip containing uppercase language badge (`BASH`), `Wrap` toggle button (`aria-pressed`), and always-visible `Copy` button.
   - Body padding `14px 18px`; `<PLACEHOLDER>` spans styled in `--qrh-amber-1` with `border-bottom: 1px dotted var(--qrh-amber-border)`.
5. **Condition → Branch Matrix (`table.qrh-matrix-2col`):**
   - `2px solid --qrh-rule-heavy` top border, `1px` row dividers, `2px` bottom anchor, zero outer vertical borders.
   - Left column (`42%`): outcome slug (`<code>reply</code>`) + description.
   - Right column (`58%`): Cobalt **Route Chips** (`→ NET-02`) and Ochre **Halt Stamps** (`‖ PAUSE-ROUTE`).
6. **Amplified Notes Band (`## Explanations and troubleshooting`):**
   - Visually transitions below the working procedure via a `1px` dashed divider + recessed `--vp-c-bg-alt` background (`padding: 20px 24px`, `border-left: 3px solid --vp-c-divider`, `margin-top: 2.5rem`) so the boundary between *do this now* and *why / fallback detail* is unmistakable at a glance.
7. **Catalog Pager (`VPDocFooter`):**
   - Retained for keyboard/sequential browsing, but relabeled **`Previous in catalog`** / **`Next in catalog`** and visually quieted (`--vp-c-bg`, muted label) so operators never mistake catalog adjacency for a finding-driven branch.
8. **Checklist Module Index (`site/checklist/index.md`):**
   - Preserves all 28 modules and exact task counts, organized into 5 scannable domain bands (*Network & Dispatch*, *Core Services & Protocols*, *Web Applications*, *Windows & Active Directory*, *Shells, Artifacts & Linux*) showing each module's task ID prefix range (e.g., `AD-01–21, WIN-01–16`), count, and one-line entry link—replacing the undifferentiated 28-row flat table.
9. **Focus States & Motion:**
   - **Focus Ring:** Universal `2px solid var(--vp-c-brand-1)` with `2px` offset + subtle outer contrast halo (`box-shadow: 0 0 0 4px var(--vp-c-bg)`) on every link, route chip, sidebar item, wrap/copy button, and search input. `scroll-margin-top: 84px` on headings and focus targets so sticky nav never occludes focused elements.
   - **Motion:** Zero decorative/entrance animations. `120ms ease-out` color/border transitions only; strict `@media (prefers-reduced-motion: reduce)` zeroes all transitions and smooth scrolling.

---

## 4. Content-Preservation Contract

Every functional and textual invariant of `2026-11-21.working.132` remains strictly enforced by build-time gates:

| Invariant | Preservation Guarantee |
| :--- | :--- |
| **All 145 task bodies & explanations** | `content/master-working-2026-11-21.working.132.md` and `content/source.json` remain byte-immutable; SHA-256 verification fails build on any drift. |
| **Exact visible prose & command bytes** | Linkification of bold task IDs adds only Markdown link syntax (`**[NET-02](./net-02)**`, `**[WEB-06](./web-06)/[08](./web-08)**`) strictly outside fenced code blocks. Stripping Markdown link syntax reproduces source prose byte-for-byte. Clipboard copy emits exact unmodified command text. |
| **Zero invented claims or app state** | No checkboxes, completion ticks, localStorage progress tracking, target inputs, credential fields, notes, execution hooks, testimonials, or pass-rate metrics. (Only VitePress's native theme-mode preference uses localStorage, unchanged.) |
| **Stable URLs & GitHub Pages base** | `base: "/checklist/"`, `cleanUrls: false`, `/generated/tasks/<id>`, `/generated/modules/<id>`, `/generated/references/<file>`, `/checklist/`, `/about/source` all remain identical. |
| **Provenance transparency** | [site/about/source.md](C:/Users/joelw/Documents/checklist/site/about/source.md) updates its *"What generation changes"* note accurately to document both `Next: TASK-ID` and bold `**TASK-ID**` route linkification plus frontmatter metadata. |
| **Supporting references** | All 3 hashed references (`checklist.md`, `lab-retrospective.md`, `make-lab-upload-proof.md`) remain generated, hash-verified, and cross-linked. |
| **No-JS & Offline resilience** | 100% static HTML/CSS/WOFF2 output; all 145 tasks, explanations, 734 route links, and module pages remain readable and navigable with JavaScript disabled and zero network access. |

---

## 5. Implementation Approach Within VitePress (`2.0.0-alpha.21`)

Stay firmly inside VitePress's native theme-extension architecture—no custom SPA router, no runtime data fetching, no heavy UI library:

1. **Generator Extensions ([scripts/checklist.mjs](C:/Users/joelw/Documents/checklist/scripts/checklist.mjs)):**
   - Add an explicit acronym-aware `MODULE_DISPLAY_NAMES` map (fixing `HTTP`, `Windows & AD`, `DNS & NFS`, `SNMP`, `MSSQL`, `Mail & RDP`, `FTP Write`, `FTP TLS`, `SMB Write`, `SQL Continuation`, `SSH Knock`) while keeping `Network` unchanged for `sidebar[0].text`.
   - Keep `linkTaskRoutes()` behavior intact for `Next: TASK-ID`, and add a second fence-safe pass `linkBoldTaskReferences(markdown, taskIds, terminalStates)` converting bold known task IDs and slash compounds (`**NET-02**`, `**WEB-06/08**`, `**NET-03/DNS-01/PAUSE-ROUTE**`) into relative Markdown links while leaving terminal states unlinked and throwing on malformed/unknown task-like IDs.
   - Enrich generated task page YAML frontmatter with static metadata (`taskId`, `moduleId`, `moduleTitle`, `moduleContext`, `routeTitles` lookup or single build-time `site/.vitepress/generated/task-index.json` imported once by the theme for tooltip previews).
   - Emit `sidebar.json` preserving all 28 modules in exact source order (task count exposed via frontmatter/manifest or lightweight text metadata without breaking existing `sidebar.length === 28` and `link` assertions).
2. **Markdown-it & Shiki Build-Time Hooks ([site/.vitepress/config.mjs](C:/Users/joelw/Documents/checklist/site/.vitepress/config.mjs)):**
   - **Markdown-it plugin (`markdown.config`)**:
     - Decorate links pointing to `./<task-id>` with `class="qrh-route-chip"` and `title="<ID> · <Title>"` (from `content-manifest.json`), so tooltips work even without JS.
     - Decorate `<strong>` elements whose exact text matches `content/source.json`'s `terminalStates` with `class="qrh-halt-stamp"`.
     - Annotate 2-column task tables with `class="qrh-matrix-2col"` and inject `data-label="<Header>"` on `<td>` cells for clean mobile stacking.
     - Wrap content following `## Explanations and troubleshooting` in `<section class="qrh-amplified-notes">` (or style via modern CSS sibling selector `.vp-doc h2#explanations-and-troubleshooting ~ *`, avoiding DOM wrapper fragility!).
   - **Shiki Transformer (`markdown.codeTransformers`)**:
     - Split code tokens matching `/<[A-Za-z0-9_.-]+>/g` into `<span class="qrh-placeholder">` spans during static HTML generation—preserving exact text nodes for native copy-to-clipboard while highlighting all 1,992 placeholders at zero runtime JS cost.
   - Update `docFooter` labels to `"Previous in catalog"` / `"Next in catalog"` and `outline.label` to `"On this card"`.
3. **Thin Theme Layer ([site/.vitepress/theme/index.js](C:/Users/joelw/Documents/checklist/site/.vitepress/theme/index.js) + 3 small Vue SFCs):**
   - Extend `DefaultTheme` using official `Layout` slots:
     - `#doc-before`: `QrhTaskHeader.vue` (renders the QRH Task ID stamp, module breadcrumb, `Notes ↓` jump, and verbatim `moduleContext` banner when present—renders nothing on non-task pages).
     - `#sidebar-nav-before`: `QrhSidebarFilter.vue` (ephemeral in-memory title/ID filter for the 145 sidebar items, auto-clears with `Esc`).
   - Register one global component `QrhEntryMatrix.vue` used only on [site/index.md](C:/Users/joelw/Documents/checklist/site/index.md) for the above-the-fold Finding-Driven Entry Dispatch + inline `/` search trigger, plus a tiny `onMounted` progressive-enhancement hook in `theme/index.js` for:
     - `/` global keyboard shortcut opening VitePress local search,
     - Per-code-block `Wrap` toggle button injected into `.vp-doc div[class*="language-"]` (no extra wrappers needed around Shiki output),
     - Auto-scrolling the active `.VPSidebarItem.is-active` into view on route navigation.
4. **Styling & Self-Hosted Fonts ([site/.vitepress/theme/custom.css](C:/Users/joelw/Documents/checklist/site/.vitepress/theme/custom.css)):**
   - Import `@fontsource/ibm-plex-sans/{400,500,600}.css` and `@fontsource/ibm-plex-mono/{400,500,600}.css` (Latin subsets only) so VitePress hashes and emits `.woff2` files into `/checklist/assets/`.
   - Define all QRH tokens under `:root` and `.dark` mapped directly onto VitePress `--vp-*` custom properties first, minimizing brittle internal-class overrides.

---

## 6. 10-Point Rubric, Self-Score & Honest Weaknesses

| # | Criterion | Score | Assessment |
| :-: | :--- | :-: | :--- |
| 1 | **Finding-to-Branch Navigation Speed** | **0.95 / 1.0** | Linking all 646 bold task IDs + above-the-fold Entry Matrix + `/` search shortcut cuts common exam jumps from 4–6 interactions to 1 click. |
| 2 | **Long-Session Visual Ergonomics (Light & Dark)** | **0.90 / 1.0** | Warm matte vellum (`#F6F4EE`) and night-flight slate (`#13161A`) with 7:1–15:1 contrast, harmonized code-well luminance, and dichromat-safe Cobalt–Ochre signaling. |
| 3 | **Corpus Fidelity & Content Preservation** | **0.90 / 1.0** | Zero prose/command mutation, SHA-256 provenance intact, no app state; slight complexity added by compound slash-ID linkification (`**WEB-06/08**`). |
| 4 | **Command Readability & Substitution Safety** | **0.85 / 1.0** | Always-visible Copy + Wrap toggle + Ochre `<PLACEHOLDER>` highlighting + `84ch` code width directly target the 732 commands and 1,992 placeholders. |
| 5 | **Decision Table Clarity & Halt Signaling** | **0.90 / 1.0** | Heavy-rule QRH matrix, row hover tracking, Cobalt route chips with hover titles vs. Ochre halt stamps, and mobile card stacking. |
| 6 | **Cultural / Artifact Coherence Without Costume** | **0.90 / 1.0** | Authentic QRH/FDF typography and structural restraint; avoids fake rivets, terminal scanlines, or military cosplay. |
| 7 | **Split-Screen & Mobile Resilience** | **0.85 / 1.0** | Tuned `272px` narrow-desktop sidebar, mobile 2-col table stacking, and full-bleed mobile code blocks; wide 3+ col reference tables still rely on scroll. |
| 8 | **Keyboard Accessibility, Focus & Reduced Motion** | **0.90 / 1.0** | Dual-halo 7:1+ focus rings, `scroll-margin-top`, always-visible buttons, `/` search shortcut, strict `prefers-reduced-motion`. |
| 9 | **VitePress Maintainability & Upgrade Safety** | **0.65 / 1.0** | Official slots and `--vp-*` tokens do most work, but Shiki token splitting, DOM-injected Wrap toggles, and `.vp-doc` table selectors carry mild fragility on `vitepress@2.0.0-alpha.21`. |
| 10 | **Offline / Static Performance & Zero App-Creep** | **0.75 / 1.0** | 100% static/offline with zero external requests and no-JS fallback, but self-hosted WOFF2 fonts add ~105 KB and client sidebar filtering adds modest JS. |
| | **Total Self-Score** | **8.55 / 10** | Strong functional & ergonomic leap; main trade-offs are font payload and alpha-VitePress hook surface. |

### Honest Weaknesses & Trade-Offs for Cross-Review
1. **Self-hosted font payload (~105 KB WOFF2) vs. zero-byte system stack:** Bundling `@fontsource/ibm-plex-sans` + `@fontsource/ibm-plex-mono` adds two devDependencies and ~105 KB of cached font assets. Justification: Kali Linux lacks `Segoe UI` and `Cascadia Code`, so system fonts visibly degrade on the primary exam OS—but a peer may reasonably argue whether a single monospace bundle (IBM Plex Mono only, ~50 KB) + clean system sans is a tighter budget.
2. **Compound slash-ID linkification edge cases:** Turning `**NET-03/DNS-01/PAUSE-ROUTE**` and `**WEB-06/08**` into partial links (`**[WEB-06](./web-06)/[08](./web-08)**`) is ergonomically huge, but introduces parser surface area in [scripts/checklist.mjs](C:/Users/joelw/Documents/checklist/scripts/checklist.mjs). Every generated link must pass strict `taskIds` validation plus the exhaustive built-HTML audit in [tests/site.test.mjs](C:/Users/joelw/Documents/checklist/tests/site.test.mjs), and [site/about/source.md](C:/Users/joelw/Documents/checklist/site/about/source.md) must transparently document this expansion beyond `Next: TASK-ID`.
3. **Shiki `<PLACEHOLDER>` transformer delicacy:** In `bash`/`powershell` grammars, `'<IP_ADDRESS>'` sits inside a single-quoted string token; splitting Shiki HAST tokens safely without double-escaping HTML entities (`&lt;`) or mangling multi-line strings requires dedicated unit tests on representative blocks from `art-03.md`, `ad-10.md`, and `lpriv-02.md`.
4. **Sidebar scale (28 flat groups):** Keeping `sidebar.length === 28` avoids breaking [tests/site.test.mjs:107](C:/Users/joelw/Documents/checklist/tests/site.test.mjs:107) and preserves exact source order, but 28 collapsed top-level groups still force vertical scanning unless the operator uses the sidebar quick-filter or `/` search. Grouping the sidebar into 5 domain meta-sections would improve visual hierarchy at the cost of updating that test contract.
5. **Dual column measure (`68ch` prose vs. `84ch` code/tables):** Giving code plates and result tables extra width dramatically reduces ugly command wrapping in split-screen, yet creates a stepped right edge against narrower prose paragraphs—an intentional functional trade-off that some typographic purists may dislike.
6. **DOM-injected Wrap toggle on VitePress alpha:** Injecting a Wrap button onto VitePress's `.vp-doc div[class*="language-"]` markup could break if a VitePress 2.0 beta/stable changes code-block DOM structure; emitting the button via a `markdown.config` fence wrapper rule (rather than runtime DOM mutation) would be cleaner and SSR-consistent, though it requires testing compatibility with VitePress's built-in copy button handler.

---

## 7. Concrete Files & Tests Likely to Change

### Core Implementation Files
- [package.json](C:/Users/joelw/Documents/checklist/package.json) & [pnpm-lock.yaml](C:/Users/joelw/Documents/checklist/pnpm-lock.yaml) — Add `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` (devDependencies, bundled statically by VitePress) if self-hosted fonts are approved.
- [scripts/checklist.mjs](C:/Users/joelw/Documents/checklist/scripts/checklist.mjs) — Add acronym-accurate `MODULE_DISPLAY_NAMES`, fence-safe `linkBoldTaskReferences()` (handling single and slash-compound task IDs while keeping terminal states unlinked), enriched task frontmatter (`taskId`, `moduleId`, `moduleTitle`, `moduleContext`), and build-time `site/.vitepress/generated/task-index.json`.
- [site/.vitepress/config.mjs](C:/Users/joelw/Documents/checklist/site/.vitepress/config.mjs) — Add `markdown.config` (route-chip classes + destination `title` tooltips, halt-stamp classes, 2-col table `data-label` injection), `markdown.codeTransformers` (Ochre `<PLACEHOLDER>` spans), Shiki light/dark theme config, updated `theme-color` meta, `"On this card"` outline label, and `"Previous in catalog"` / `"Next in catalog"` docFooter labels.
- [site/.vitepress/theme/index.js](C:/Users/joelw/Documents/checklist/site/.vitepress/theme/index.js) — Extend `DefaultTheme` with `Layout` slots (`#doc-before`, `#sidebar-nav-before`), register `QrhEntryMatrix`, wire `/` search shortcut, code-block wrap toggle, and active-sidebar auto-scroll.
- [site/.vitepress/theme/custom.css](C:/Users/joelw/Documents/checklist/site/.vitepress/theme/custom.css) — Full QRH-132 token palette (light/dark), font imports, dual-measure typography, Command Plate + placeholder styling, Condition→Branch Matrix (including mobile 2-col card stacking), Amplified Notes band, Route Chips, Halt Stamps, focus rings, and `prefers-reduced-motion`.
- **New Theme Components under `site/.vitepress/theme/components/`:**
  - `QrhTaskHeader.vue` (task ID stamp, module breadcrumb, `Notes ↓` anchor, verbatim `moduleContext` banner for the 11 modules that carry one).
  - `QrhSidebarFilter.vue` (ephemeral in-place sidebar task filter).
  - `QrhEntryMatrix.vue` (finding-driven observation dispatch grid + inline `/` search trigger for `site/index.md`).

### Framing & Documentation Files
- [site/index.md](C:/Users/joelw/Documents/checklist/site/index.md) — Integrate `<QrhEntryMatrix />` while preserving edition line, verbatim `[!IMPORTANT]` warning, `NET-01` & `/checklist/` links, `"How to use it"`, and `"What this site changes"`.
- [site/checklist/index.md](C:/Users/joelw/Documents/checklist/site/checklist/index.md) — Upgrade the flat 28-row table into the 5-domain scannable module directory (keeping all 28 module links, counts, and exact order discoverable).
- [site/about/source.md](C:/Users/joelw/Documents/checklist/site/about/source.md) — Update *"What generation changes"* to reflect bold task-ID linkification and static frontmatter metadata honestly.
- [DESIGN.md](C:/Users/joelw/Documents/checklist/DESIGN.md), [.impeccable/design.json](C:/Users/joelw/Documents/checklist/.impeccable/design.json), and [.impeccable/surfaces/site-index-md.md](C:/Users/joelw/Documents/checklist/.impeccable/surfaces/site-index-md.md) — Replace the restrained baseline spec with the committed QRH-132 design system record.

### Tests Likely to Change or Expand
- [tests/checklist.test.mjs](C:/Users/joelw/Documents/checklist/tests/checklist.test.mjs) — Preserve all existing parser/provenance/fence/determinism tests; add unit tests for:
  - `linkBoldTaskReferences()` on single bold IDs (`**NET-02**`), slash-compound IDs (`**WEB-06/08**`, `**NET-03/DNS-01/PAUSE-ROUTE**`), non-linking of terminal states (`**PAUSE-COVERAGE**`), fence immunity, and visible-text byte parity (stripping link markup equals original prose).
  - Acronym-corrected `displayName()` output and `moduleContext` frontmatter emission on the 11 contextual modules.
- [tests/site.test.mjs](C:/Users/joelw/Documents/checklist/tests/site.test.mjs) — Preserve existing base-path, exhaustive built-link audit (which will now automatically validate all ~734 route links!), search index, lockfile, and GitHub Actions workflow tests; add assertions for:
  - Built task HTML containing clickable links for table-routed tasks (e.g., `net-01.html` linking to `net-02`, `win-01.html` linking to `win-16` and `ad-14`), `.qrh-halt-stamp` markup on terminal states, `.qrh-placeholder` spans inside command blocks without altering raw command text, and zero external font/CDN URLs (`https://fonts.*`) in `site/.vitepress/dist/`.
  - Updated module display title check if `sidebar.json` acronym labels are tested beyond `sidebar[0].text === "Network"`.
