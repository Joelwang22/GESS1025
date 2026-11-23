# Round 1 Cross-Review: Gemini on Opus ("Runbook Binder")

- **Reviewed target:** `C:\Users\joelw\.t3\worktrees\checklist\design-opus-7daaa63e739d0723` (branch `design/opus`, commit `1a09276`)
- **Review evidence:** Ran `pnpm test` (**51/51 passed**) and `pnpm build` (clean in 7.48s) in Opus's worktree; ran a programmatic HTML fidelity audit across all 145 tasks and all 732 command plates; served Opus's `site/.vitepress/dist` under `/checklist/` and inspected **47 headless Chrome screenshots** (saved under `.superpowers/review-1/`) covering Home, `/checklist/`, `/generated/start`, `NET-01`, `WEB-09`, `NET-05`, `WSQL-01`, `AD-03`, and `SQL continuation` module at `1440×900`, `768×900`, and `390×844` in light and dark modes.

---

## Fidelity & Correctness Verification

- **Source content & visibility:** All 145 tasks, 28 modules, 3 supporting references, and the newly published `/generated/start` source preface render with zero missing or altered source text. No CSS hides source content (`display: none`, `visibility: hidden`, clipping, or off-screen offsets).
- **Command copy exactness:** Audited every one of the **732 rendered `.cmd-plate` blocks** against its source Markdown fence using Opus's exact `codeText()` line-join logic: **0 mismatches**. Replacing VitePress's default `copyCode.js` (which trims and strips leading `$ ` / `> ` prompts) is a major fidelity win. Python reference code (`make-lab-upload-proof.html`) renders as a command plate without false blank highlights, and `<0.4096>` is never marked as a blank.
- **Runtime & layout health:** **0 console errors**, **`overflowX: 0`** on every tested page at `390px`, `768px`, and `1440px`, and **`16px` body font** across all viewports.
- **Blocking defects:** **None.**

---

## Rubric Breakdown — **8.4 / 10**

| # | Criterion | Score | Evidence & Rationale |
| :-: | :--- | :-: | :--- |
| 1 | **Mid-box workflow speed and clarity** | **2.1 / 2.5** | Publishing the source's own Default Box Route (`/generated/start`) plus the Home `"Where to enter"` table and `"Reading a task"` mark legend gives immediate orientation. However, keeping 1,177–1,467 char repeated module contexts fully expanded pushes `WSQL-01`'s first command to `y = 869px` at 1440×900 (clipped at the bottom edge) and `y = 1425px` at 390×844 (nearly two full phone screens down). Also, the 18 bullet-routed tasks (`NET-05`, `AD-03`, `FTP-02`, `SMB-01`) leave `Enter when:`, `Question:`, and `snake_case:` outcome bullets unstyled. |
| 2 | **Command presentation and exact copying** | **1.3 / 1.5** | Custom `copy.js` guarantees exact byte-for-byte copying across all 732 plates; dark plates with always-visible language word, `Copy` button, `2ch` hanging indent, non-ligature mono, and `Fill in` blank list are excellent. Deductions: no `Wrap`/`Scroll` toggle for inspecting long one-liners; `Fill in` swells `.cmd-head` to `120px` (3 rows) at 390px on `AD-03` and lists up to **11 blank pills** on `WEXEC-04`; bright `#ffe45c`/`#f0cf45` solid yellow fills create visual glare when 8–16 blanks appear together on dark plates (`AD-03`). |
| 3 | **Wayfinding (sidebar, index, search, routes, entry points)** | **1.2 / 1.5** | Strong `/generated/start` box route, loose-ID `GoToTask` (`web9`, `lpriv 2`), per-task frontmatter routes (avoiding a 262 KB client bundle), sticky `TaskRail`, and honest `"Previous/Next in source order"` pager labels. Deductions: `GoToTask` rejects keyword queries (`suid`, `smb`, `kerberos`); `/checklist/` is a 6,279px (desktop) / 13,358px (mobile) static wall with zero filtering, and CSS `columns: 2` places `MSSQL` beside `Network`; `TaskRail` overflows 900px viewports on hub tasks (`NET-05` 866px rail / 1094px aside; `AD-03` 955px rail / 1183px aside), pushing `"On this page"` off-screen; sidebar task titles clip at the right edge (`"offlin"` on `AD-08`, `"user"` on `AD-05`). |
| 4 | **Hierarchy, scannability and concise chrome** | **1.2 / 1.5** | Crisp binder aesthetic, clear call-number hierarchy, `task n of N` meta line, heavy-ruled decision tables, and recessed desk-tone `Explanations and troubleshooting` band. Deductions: the boxed H1 call-number stamp renders a trailing dot (`[NET-01.]`, `[AD-03.]`) inconsistent with `[NET-01]` in the aside rail; `markTables` falsely marks 2 SQL syntax lookup tables in `WSQL-05` (`Engine \| Next table expression`, `Engine \| Next column expression`) as `.decision` while missing `AD-03`'s `Revisit` decision table; module pages show a redundant `"On this page / Tasks"` aside and unaligned `ID. Title` links; `site/about/source.md` still omits bold-ID linking, `→` linking, and `/generated/start`. |
| 5 | **Responsive layout at 390, 768 and 1440px** | **0.8 / 1.0** | Zero horizontal overflow at all three widths, `16px` mobile body text, and clever non-hiding stacked mobile tables with a `/` header legend. Deductions: `WSQL-01` mobile first viewport is 100% module context (`ctxHeight: 812px`); `.cmd-head` wraps to `120px` on `AD-03` at 390px; `/checklist/` is `13,358px` tall on mobile with no filter; sidebar level-1 titles clip at the right edge on desktop (`AD-05`, `AD-08`). |
| 6 | **Accessibility** | **0.9 / 1.0** | Excellent shape+color encoding (drawn SVG arrow + underline for routes, dashed underline + fill for blanks, square + inverted slab for stops), zero CSS hiding, `aria-live` copy state, `forced-colors` and `prefers-reduced-motion` support. Deductions: VitePress deduplicates `meta[name="theme-color"]` in `site/.vitepress/config.mjs`, dropping the light `#f6f6f3` tag so only the dark tag ships; `TaskRail` overflow at 1440×900 pushes `"On this page"` out of the visible viewport on hub pages; `--rb-ink-3` (`#656b73`) on `--rb-desk` (`#f0f0ec`) sits right at the AA floor for `11.5px` `.sb-count`. |
| 7 | **Visual craft and coherence in light and dark** | **0.9 / 1.0** | Distinct, restrained, authentic "Runbook Binder" identity with disciplined typography and layout parity across light and dark modes. Small deduction: solid saturated yellow `#ffe45c`/`#f0cf45` highlight pills feel slightly loud on dark plates with many placeholders (`AD-03`, `WEXEC-04`), and relying on OS sans stacks introduces platform variance. |

---

## Recommendations (Priority Order)

1. **Fix desktop sidebar text clipping in `site/.vitepress/theme/custom.css` (`AD-05`, `AD-08`, `NET-03`):** Adjust `.VPSidebarItem.level-1 .text bdi` (`grid-template-columns: 5rem minmax(0, 1fr)` plus `overflow-wrap: break-word` and slightly tighter right padding) so long task titles like `AD-08` (`"...offline"`) and `AD-05` (`"...users"`) never clip against the right sidebar edge.
2. **Bound the sticky right rail on hub tasks (`site/.vitepress/theme/components/TaskRail.vue` & `custom.css`, affecting `NET-05`, `AD-03`, `WIN-01`, `WSQL-01`):** Cap or scroll `.task-rail-list` (e.g., `max-height: 44vh; overflow-y: auto` or compact ID chips when `outbound.length > 6`) so `"On this page"` and stop states stay visible above the fold at `1440×900`.
3. **Add live keyword/module filtering to `/checklist/` (`site/.vitepress/theme/components/TaskDirectory.vue`) and allow keyword fallback in `GoToTask.vue`:** Let operators filter the 145-task directory by ID, service, or keyword (and replace vertical-flow `columns: 2` with a left-to-right grid or filterable view so `MSSQL` doesn't sit beside `Network`), and let `GoToTask` suggest/match task titles when the user types `suid`, `smb`, or `kerberos`.
4. **Collapse lengthy repeated module contexts (> 600 chars) with native `<details>` (`scripts/checklist.mjs`, affecting `web_input`, `command_continuation`, `sql_continuation`, `web_upload`):** Surface the module label and opening shell rule (*"Run in Kali Bash..."*) in `<summary>` while keeping the 7 short module contexts expanded, bringing `WSQL-01`'s first command above the fold on desktop and cutting mobile scroll before the first step by ~700px.
5. **Tame `.cmd-head` on multi-blank plates and add a Wrap/Scroll toggle (`site/.vitepress/markdown.mjs`, `custom.css`, `copy.js`, affecting `AD-03`, `WEXEC-04`, `WEB-09`):** Show at most 3–4 blanks inline in `.cmd-head` with a compact `+N more` cue (or put `Fill in` in a clean secondary sub-bar) so `Copy` stays pinned top-right on one row at 390px, soften dark-mode blank fills slightly to reduce glare on 10+ blank blocks, and add a `Wrap`/`Scroll` toggle without touching copied text.
6. **Structure bullet-routed tasks and tighten decision-table detection (`site/.vitepress/markdown.mjs`, `custom.css`, affecting `NET-05`, `AD-03`, `WSQL-05`):** Format `Enter when:`, `Question:`, and `snake_case_outcome:` list items into scannable decision rows, and require column-1 observation semantics (plus `Revisit` on column 2) in `markTables` so `AD-03`'s `Revisit` table is classed `.decision` and `WSQL-05`'s two SQL syntax tables are not.
7. **Clean up framing & metadata details:**
   - Emit both light and dark `theme-color` meta tags via `transformHtml` in `site/.vitepress/config.mjs` (avoiding VitePress's `head` deduplication).
   - Remove the trailing dot from inside the `.h-id` border box (`site/.vitepress/markdown.mjs` `markTaskHeading`) so `[NET-01]` matches the aside rail stamp.
   - Set `outline: false` on module pages (`scripts/checklist.mjs` `modulePage`) and align module task IDs in a mono column like `TaskDirectory.vue`.
   - Update `site/about/source.md` ("What generation changes") to accurately document bold-ID linking, `→` linking, `/generated/start`, and per-task route frontmatter.

---

## Worth Borrowing into Gemini's Design

1. **Publishing the source's own preface ("How to use this edition" + "Default box route") as `/generated/start`** with `→` linking both ends — 100% source-authored orientation instead of hand-assembled entry cards.
2. **Replacing VitePress's `copyCode.js` with a dedicated exact line-join `copy.js`** + a 732-plate automated exactness test, guaranteeing zero trimming or `$ `/`> ` prompt stripping.
3. **`2ch` hanging indent on wrapped command lines** (`.line { padding-left: 2ch; text-indent: -2ch; }`) so wrapped continuations never visually masquerade as new commands.
4. **Per-task route frontmatter (`routesOut`, `routeStops`, `routesIn`)** instead of importing the full `routes.json` into the client bundle.
5. **Zero-CSS-hiding mobile table legend (`thead` rendered as `Col 1 / Col 2` above stacked rows)** paired with an automated CSS audit test forbidding `display: none` / `visibility: hidden` / off-screen hiding.
6. **Per-plate `Fill in` blank summary** (adapted concisely so it doesn't bloat mobile headers) and **loose task-ID normalization** (`web9`, `lpriv 2` → `WEB-09`, `LPRIV-02`) in quick jump/filter inputs.
