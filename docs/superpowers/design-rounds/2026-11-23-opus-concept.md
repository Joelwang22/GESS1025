# Design direction for the OSCP Master Checklist: "Route Catalog: card by day, fiche by night"

Nothing was edited, committed, pushed or served. I read every file in the brief, plus `content/source.json`, `site/about/source.md`, two task pages (NET-01 and LPRIV-02), a module page, both test files and VitePress's default code-block CSS. The Impeccable direction seed ran without writing to the repo (seed `bfc19d6f`, mode Read).

## 0. Problems in the current build that the redesign has to fix

These are measured, not guessed. A visual pass that skips them would only polish broken content.

1. **Placeholders in inline code show escaped text.** `escapeVuePlaceholders` turns `<` into `&lt;` in prose lines, including inside backtick spans. Markdown shows code-span text literally, so NET-01 displays `ip route get '&lt;IP_ADDRESS&gt;'`. The built HTML contains `&amp;lt;`. This affects 26 task files, and a reader who copies those commands gets the wrong text.
2. **Most route IDs are not links.** The task files contain 646 bold task IDs such as `**NET-02**`, mostly in the Next column of result tables. Only 88 are linked, because the generator only links the `Next: ID` pattern. Under pressure, the reader has to search for an ID that should be one click.
3. **"Next task" means two different things.** The footer pager's "Next task" follows source order. The tables' "Next" column is the recorded route. These conflict when a result says NET-02 but the pager offers NET-02 for unrelated reasons, or the reverse.
4. **The copy button is invisible until hover.** VitePress sets `opacity: 0` and shows it only on hover or focus, so touch users never see it. The language label is also hidden on hover. The content has 535 bash blocks, 74 powershell, 5 cmd and 28 sql, so whether a command runs in Kali or on a Windows host matters.
5. **Body text drops to 15px on screens 640px or narrower.** That is the wrong direction for stressful reading on a phone.
6. **There are 224 bold terminal states, such as `**PAUSE-ROUTE**` and `**GAP-ACCESS**`.** They look exactly like task routes. A reader can't tell "stop here" from "go to a task".

## 1. The direction and what it draws on

**Route Catalog.** Each of the 145 tasks is treated as a typed library catalog card. Each of the 28 modules is a drawer. Each task ID is a call number. The routes a card names are its "tracings": the cross-references a cataloguer types at the foot of a card so you can find the related cards.

- **Light theme: the index card.** White card stock, one red header rule and pale blue ruling, on a cool grey-green ground like a steel library cabinet.
- **Dark theme: COM microfiche.** Libraries replaced card catalogs with Computer Output Microfilm in the 1970s and 80s. The same records were shown as light text on a dark negative, under a reader hood, with a human-readable title strip across the top of each fiche. That gives the dark theme the same records in the catalog's own night-time medium, not just inverted colours.

**Why it fits the product:**
- The checklist is a branching reference, not a sequence. A catalog is built for the same job: find the card you need, read it, then follow its cross-references.
- Catalogs never imply progress. Nobody "completes" a card drawer, which matches PRODUCT.md's ban on progress state and its "no proof of completion" rule.
- The candidate's real setting is a 24-hour exam or a long lab: a dark Kali VM on one half of the screen, this site on the other, often at 3am. That is why the dark theme gets equal design weight.

**Two looks this avoids:**
- The usual look for this category is stock VitePress, which the site uses now.
- The obvious opposite is a neon "hacker terminal" in near-black. It looks like Kali and reads badly over long sessions.

**Other directions considered.** Each was combined with the product and judged on two things: whether OSCP readers would recognise it, and whether it keeps the content clear. All six were declined, but each contributed one rule to the chosen direction:

| Candidate | Verdict | What the direction takes from it |
|---|---|---|
| Daylight architectural section | Declined on both | **One active band:** a single colour marks "you are here" (the current card in the sidebar and the current drawer), and is used for nothing else. |
| Mesophotic deep dive | Declined. Its depth axis implies progress, which PRODUCT.md bans. | **One hard left axis:** every call number sits in a fixed-width mono column on the left, in the sidebar, module lists, tracings and table outcomes. The eye scans one column. |
| Emigre bitmap specimen | Declined. Pixel display type hurts legibility. | **One family, strict scale:** a single type family at four fixed sizes, with no extra faces. |
| Stitched alphabet sampler | Declined on both | **Rows reflow whole:** on phones, each result-table row becomes a full-width band (outcome above route). No squeezed columns and no sideways scrolling. |
| Ikeda datamatics | Declined. Strobing is unsafe. | **No grey body text:** content uses only full ink, ribbon red and annotation blue. Grey is for chrome only. |
| Film cutting-bench select rail | Declined. Its "flag where you stopped" is progress state. | **A mark, not just a colour:** task routes, stop states and outside references get different glyphs as well as colours, so they still read without colour. |

**My own top candidate, for the reviewer to weigh:** an aviation quick-reference handbook (non-normal checklists with condition statements and "go to" steps). It is the closest match for decision branching. The honest risk is that OSCP candidates don't know QRH conventions, and it is the familiar "emergency checklist" look. I ranked it above the catalog on mechanism, but below it on how much a reader can comfortably live in it for hours.

## 2. First viewport and signature interaction

**Task page at 1440px.** This is the main surface, because 145 of the 178 pages are tasks.
- On the left, the drawer cabinet sidebar, 300px. The current drawer is expanded, and each item has a call-number column with a hanging indent so long titles like LPRIV-02 wrap cleanly.
- In the centre, the card at 70ch:
  - At the top, the title strip: drawer label (`NETWORK`, linked to the module page) on the left, and a "Jump to results ↓" link on the right when the page has a result table (107 of 145 do).
  - Below that, the call number in large mono (`NET-01`), then the title under a 2px ribbon-red header rule.
  - Then the source body, unchanged.
- On the right, the "On this task" outline.

**Signature interaction: tracings plus card pull.**
- At the foot of every card, above the pager, a tracings block lists **Routes named on this task**. Each entry shows the full destination (call number and title), in source order and without duplicates. Stop states get the `■` mark and are not linked.
- A second line, **Named as a route by**, lists the backlinks: every task whose routes name this one. This answers "how did I get here, and where else does this branch lead?" without inventing any guidance.
- Following any route link plays a 160ms "card pull": the new card rises 12px out of the drawer using a View Transition hooked into VitePress's router. There is no fade or blur. With `prefers-reduced-motion`, or a browser without View Transitions, the navigation is instant.

**Home page.** All of the existing home copy stays, in the same order:
- The title strip shows the edition line in mono.
- The IMPORTANT note becomes a caution guide card: a ribbon-red left band with a `CAUTION` caps label, keeping the same words.
- "Start at NET-01" is the primary call-number card; "Browse all modules" is secondary.
- Below "How to use it", a cabinet grid of 28 drawer fronts. Each shows the module name, its ID range (for example `NET-01 – NET-05`) and its task count from the existing index. It is plain links in a list. There is no progress meter.

## 3. The system

**Colour.** Restrained strategy: three inks on two grounds per theme. All text pairs below were computed against WCAG.

| Role | Card (light) | Fiche (dark) | Contrast |
|---|---|---|---|
| Cabinet / hood ground (chrome, sidebar) | `#E3E8E4` | `#0B1016` | — |
| Card / frame surface (article) | `#FBFCFD` | `#111A23` | — |
| Slip (code blocks, table header) | `#EDF1F5` | `#0A1118` | — |
| Ink (all body content) | `#1B2230` | `#E4ECF1` | 15.5 : 1 / 14.7 : 1 |
| Annotation blue (links, focus ring, active band) | `#1E4FB4` | `#8DB8FF` | 7.2 / 8.7 |
| Ribbon red (header rule, CAUTION, stop states, placeholders) | `#A8251C` | `#FF9384` | 6.9 / 8.2 |
| Chrome muted (sidebar meta, labels only) | `#4A5462` | `#A9B8C6` | 7.5 / 8.7 |
| Ruling (table rules, dividers; decorative) | `#C9D7EE` | `#2A3A4A` | — |

- Violet is removed. The important callout uses ribbon red.
- `theme-color` gets two meta tags, one per colour scheme.
- Selection is an annotation-blue wash at 18%.

**Type.** One family, self-hosted, OFL, Latin subset, `font-display: swap`, bundled in the build and never fetched from a CDN.
- **Atkinson Hyperlegible Next** (variable) for text.
- **Atkinson Hyperlegible Mono** for commands, IDs and outcome tokens.
- The reason for this family is specific to the content. It was designed for character disambiguation: `Il1`, `O0` and quote shapes are distinct, which matters in a reference full of IDs like `LPRIV-01` and commands where `'` and a backtick mean different things. Ligatures are off (`font-variant-ligatures: none`), so `->` and `=>` render as typed.
- Fallbacks: the current system stacks.
- Four fixed steps only:
  - **Call number / label:** mono 0.8125rem, caps, +0.06em tracking.
  - **Body:** 17px on desktop and 16px on phones (never smaller), line-height 1.62.
  - **h2:** 1.375rem, weight 650, line-height 1.3.
  - **h1 title:** 1.875rem, weight 700, line-height 1.2. The call number above it is mono 1.125rem.
  - **Code:** mono 15px, line-height 1.55.
- Measure: 70ch.

**Surfaces.**
- Everything is flat, with no shadows except VitePress's transient search overlay, which stays.
- Corners: 2px for blocks, 0 for tables. Card stock is crisp, not soft.
- The card surface has one 2px ribbon-red rule under the title.
- `## Explanations and troubleshooting` begins the "verso" (the back of the card): a full-width ruled band, with the rest of the page on the slip tone. The heading text is unchanged.

**Layout.**
- VitePress's three-column shell stays, at a 1440px maximum: 300px sidebar, 70ch article, outline.
- Spacing: 4px base, with 8, 16, 24, 48 and 72 used. There is more space above a heading than below it.
- Phones: 16px side gutters, code blocks run full-bleed to the gutter edges, and nothing scrolls sideways except code that is intentionally `pre-wrap`.

**Components.**
- **Sidebar drawer:**
  - The group label is caps mono with an ID range.
  - Items use a two-column grid: a call-number column in tabular mono, then a hanging-indent title.
  - The active item gets the annotation-blue band: a 3px left bar plus tinted text.
  - This needs the generator to emit `<span class="cn">NET-01</span><span class="tt">Check connectivity</span>`. Screen readers still hear "NET-01 Check connectivity".
- **Code slip:**
  - A slip surface with a 3px ink left rule.
  - The language label is always visible, top-left, caps mono, and spelled out (`BASH`, `POWERSHELL`, `CMD`, `SQL`, `TEXT`).
  - The copy button is always visible at 0.7 opacity and becomes 1 on hover or focus. The existing "Copied" state stays, plus an `aria-live` confirmation.
  - **Blanks:** placeholders inside code (`<TARGET_IP>`, `'<absolute-observed-…>'`) get a ribbon-red dotted underline, like the blanks on a typed form.
    - This is a Shiki transformer through `markdown.codeTransformers`.
    - It matches `<[A-Za-z][A-Za-z0-9]*[_-][A-Za-z0-9_-]*>` or all-caps tokens of two or more letters, so it skips `<script>`, `<br>` and `<<EOF`.
    - It wraps text in spans only, so copied text is byte-identical.
- **Routing table.** A markdown-it core rule adds a class to tables whose first header is `Result` or `Observed result`, and marks each Next cell:
  - `→` plus annotation blue for a linked task.
  - `■` plus ribbon red for a terminal state (detected from `manifest.terminalStates`).
  - No mark for prose-only cells.
  - The outcome token (`reply`) stays in mono.
  - Every cell gets a `data-label` from its header text, so the phone layout can stack each row as an outcome band over a route band.
- **Tracings:** a `nav` landmark labelled "Task routes" in the `doc-footer-before` slot. It is built from a generated `routes.json` and is not added to the task markdown, so the body text stays identical to the source.
- **Pager:** labels become "Previous in checklist order" and "Next in checklist order", which fixes problem 3. The mechanism is unchanged.
- **Focus:** a 3px annotation-blue outline with a 2px offset everywhere, including copy buttons, sidebar items, table links and tracing chips. Contrast against both grounds is at least 3:1.
- **Motion:** only the card pull (160ms, `cubic-bezier(.2,.7,.2,1)`) and the copy confirmation. Reduced motion means no motion at all.

## 4. Content-preservation contract

Each line is meant to become a test.

1. **Task body text matches the source.** All 145 task pages, 28 module pages and 3 reference pages are generated. With route-link wrappers removed (`[ID](./id)` back to `ID`), every task body equals its source section byte for byte, after the inline-code escaping fix.
2. **Code blocks are untouched.** Every fence keeps its info string and content. In the built HTML, each code block's text content equals the source fence, which proves the placeholder spans changed nothing.
3. **Inline code renders as written.** NET-01's built HTML shows the literal text `'<IP_ADDRESS>'`, and no built page contains `&amp;lt;` inside `<code>`.
4. **Routes are complete and correct.** Every bold task ID and every `Next: ID` that matches a known task is linked. Terminal states are never linked. An unknown ID still stops generation. The existing link audit keeps passing at more than 1,000 checks, and the count should rise by about 550.
5. **Tables are unchanged in content.** Row count, cell text and column order in result tables match the source. Only classes and `data-label` attributes are added.
6. **URLs don't change.** `/checklist/`, `/checklist/checklist/`, `/checklist/generated/tasks/<id>.html`, the module and reference paths, and `/checklist/about/source.html` are all stable. `base`, `cleanUrls: false` and sidebar order stay as they are.
7. **Every existing feature stays.** Local search with detailed view, the outline, the skip link, the appearance toggle, the GitHub link and the previous/next pager all remain. The search index contains all 145 task pages.
8. **Provenance stays.** The edition line, source hashes and the Source page remain. Its "What generation changes" section is updated to describe bold-ID linking and the tracings index, so the provenance statement stays true.
9. **The site stays offline and claim-free.**
   - The built HTML, CSS and JS contain no `http(s)` asset URLs; only content links and the GitHub social link remain.
   - Nothing new goes in storage beyond VitePress's own appearance key.
   - There is no analytics.
   - No copy anywhere suggests progress, completion or success. Tracings say "named", never "recommended" or "done".

## 5. How to build it in VitePress

- **`theme/index.js`:** extend `DefaultTheme` with a `Layout` that fills `doc-before` (title-strip drawer label and "Jump to results"), `doc-footer-before` (Tracings) and `home-features-after` (or a home-page component for the cabinet). Register `router.onBeforeRouteChange` to wrap navigation in `document.startViewTransition` when supported and reduced motion is off.
- **CSS:** replace `custom.css` with `tokens.css` (VitePress `--vp-c-*` variables mapped to the palette above under `:root` and `.dark`), `components.css` (sidebar, slip, routing table, tracings, verso) and `fonts.css` (`@font-face` for local woff2). Style through VitePress variables first and override its internal classes only where needed. Those classes are fragile on `2.0.0-alpha.21`, so keep overrides in one file with a comment naming the VitePress version.
- **`config.mjs`:**
  - `markdown.config(md)` adds the routing-table and terminal-mark core rules.
  - `markdown.codeTransformers` adds the blanks transformer.
  - `docFooter` gets the new labels.
  - `head` gets font preload links and the two `theme-color` meta tags.
- **`scripts/checklist.mjs`:**
  - (a) Code-span-aware escaping. Tokenise backtick runs and skip them, since markdown-it already escapes their contents. There are no `{{` in inline code in the source, but add a guard test anyway.
  - (b) Link `**TASK-ID**` where the ID is a known task, outside fences.
  - (c) Emit `site/.vitepress/generated/routes.json` with titles, outbound routes in source order, and backlinks.
  - (d) Emit sidebar text as call-number and title spans.

All of this is build-time except about 2KB of transition code and the Tracings component.

**Expected cost.** Two woff2 files, about 70–90KB together. No new runtime dependencies. Playwright would be a new dev-only dependency; see section 7.

## 6. Rubric and self-score

| # | Criterion | Score | Honest weakness |
|---|---|---|---|
| 1 | Content fidelity | 9 | The bold-ID linking and escaping changes touch the generator, the highest-risk file. Fidelity depends on the strip-links equality test actually being written. |
| 2 | Route clarity under stress | 9 | Tracings are new derived UI. If the wording drifts toward "suggested", they become a claim. Backlinks on hub tasks like NET-05 or LNX-09 could run long, so they need a wrap or a collapsible "+N more". |
| 3 | Long-session legibility | 8 | Atkinson is engineered rather than characterful, and some readers find it plain. The 17px body costs density on 1366px laptops. |
| 4 | Command safety and copying | 9 | The placeholder regex can miss an odd form or mark a real `<FOO_BAR>` literal. The marking is visual only and copied text never changes, but a false mark could still mislead. |
| 5 | Navigation and search | 8 | The search UI stays as VitePress's. There is no jump-to-ID field because search already finds IDs, which is a missed chance for a native call-number lookup. |
| 6 | Light and dark parity | 8 | The microfiche dark theme rests on a metaphor most readers won't notice. It works as a palette, but the "title strip" idea could read as just a header. |
| 7 | Mobile | 8 | The stacked result rows rely on `data-label`, which adds markup. The VitePress mobile menu is unchanged, so 28 drawers still means a long menu. |
| 8 | Accessibility, keyboard and focus | 8 | View Transitions plus the SPA router need a check that focus still moves to the new `h1`. Glyph marks (`→`, `■`) need text alternatives ("route to", "stop state"). |
| 9 | Performance and offline | 8 | About 80KB of fonts on first load. The local search index is about 2MB of JS today and this direction doesn't reduce it. |
| 10 | A distinct, committed identity | 7 | The catalog idea mostly lives in small details: ruling, call-number column, red rule, verso band, tracings. At a glance it can still read as "a well-made docs site". That is partly the point for this content, but it is the direction's main risk. A peer may also find catalog nostalgia unrelated to OSCP culture. |

**Total: 82 / 100.**

## 7. Files and tests likely to change

**Change:**
- `scripts/checklist.mjs`
- `site/.vitepress/config.mjs`
- `site/.vitepress/theme/index.js`
- `site/.vitepress/theme/custom.css` (replaced by `tokens.css`, `components.css` and `fonts.css`)
- `site/index.md` (same copy, cabinet component added)
- `site/about/source.md` (generation-changes text)
- `README.md` (fonts and licence, generated `routes.json` ownership)
- `DESIGN.md` (rewritten after the build)
- `.impeccable/surfaces/site-index-md.md` (direction contract replaces the "deferred" note)
- `PRODUCT.md` (drop the "first release uses a restrained baseline" line)

**Add:**
- `site/.vitepress/theme/components/TaskTracings.vue`
- `site/.vitepress/theme/components/DrawerCabinet.vue`
- `site/.vitepress/theme/components/TitleStrip.vue`
- `site/.vitepress/theme/fonts/*.woff2` and `OFL.txt`

**`tests/checklist.test.mjs`:**
- Inline code keeps `<…>` intact.
- Bold task IDs are linked and terminal states are not.
- An unknown bold ID is rejected.
- `routes.json` outbound and backlink correctness on NET-01 and NET-05.
- Strip-links byte equality for all 145 tasks.

**`tests/site.test.mjs`:**
- Update the sidebar label assertion to match the span markup.
- Built NET-01 contains no `&amp;lt;`.
- Code-block text equals the fence for a sample (LPRIV-02, plus one powershell task).
- Result tables carry the class and `data-label`.
- Terminal cells carry the stop mark and no link.
- Fonts are present in `dist/assets` and no external font or script URLs exist.
- The pager labels.
- The search index covers all 145 tasks.

**Proposed new dev dependency: Playwright.** One spec for the 1440 and 390 viewports in both themes. It checks keyboard tabbing to the copy buttons, focus visibility, focus moving to the `h1` after a route navigation, no sideways page scroll at 390px, and reduced motion disabling the transition. The repo has no browser tests today; whether to add the dependency is for the peer and the user to decide.
