# Final implementation of the converged design

Branch `design/final`, cut from `design/opus` at `0aa2ccf`, which carries
`1fde407` plus the review and spec records. Implemented by Opus to
`converge-final-spec.md`, which Gemini signed off without amendments
(`converge-signoff-gemini.md`). The branch has not been pushed or merged to
`main`.

## What was built, in spec order

| Step | Commit | What it did |
| --- | --- | --- |
| 0 | `9de3314` | Imported Gemini's design-round records (round 1–3 write-ups, three reviews of Opus, convergence proposal, sign-off) for history. |
| 1 | `758652b` | **Ported Gemini's unique tests** by intent, with selectors adapted (section 3). `matchTasks` now also matches a loose ID ("web9"), and `codeText` falls back to the element's own text when no Shiki lines exist. |
| 2a | `e1ae180` | **Split the CSS** into `tokens.css`, `components.css` and `custom.css` with no rule changes. A full-page pixel comparison of 10 pages at 1440 and 390px in both themes matched, apart from 35px of nav-bar anti-aliasing noise that also appears between two captures of the unchanged build. The CSS guards now read every stylesheet. |
| 2b | `17e5db6` | **Palette and type:** Gemini's warm paper and slate surfaces; cobalt `#135198` / `#78b9fa`; Gemini's plate colours; blanks keep the highlighter on paper and the amber wash on plates; tinted cobalt route chips with the drawn arrow; neutral pressed state for Wrap lines; Inter (bundled locally) with `cv05`; DejaVu Sans Mono in the mono stack; `theme-color` follows the paper colours. A new test computes every token text pair and requires WCAG AA in both themes. |
| 3 | `33a26bf` | **`github-dark-dimmed`**, with `#768390 → #8b96a3` and `#2d333b → #a9b4c2` applied through a Shiki `colorReplacements` transformer. A new test checks every `--shiki-*` colour in the built site against both plates. |
| 4 | `d8beeeb` | **Header row** (`TaskHeader.vue`, outside `<main>`): breadcrumb, stamp with "task n of N", and First command / Result table / Explanations / Routes (n). The H1 is the verbatim source heading. **Module strip** with Box route and "NET-05: Choose a service to investigate". The route sheet `h2#task-routes` "Recorded routes for *ID*" appears in the outline, with Gemini's card layout. Plain task IDs carry title tooltips. |
| 5 | `862da76` | **Outcomes jump:** `isOutcomeList` and `OUTCOME_SLUG` are shared by the generator and renderer. `#results` goes to the first decision table before the explanations, otherwise the first outcome list. That gives 128 "Result table" jumps and 14 "Outcomes" jumps, NET-05 included. |
| 6 | `1260a72` | **Home:** the generator writes `where-to-enter.md` from the parsed Default box route (5 rows, When and Decision cells verbatim, exact titles), and `site/index.md` includes it. The `HomeJump.vue` jump box has exact-ID confirmation, Escape, and Full-text search. VitePress's own `/` binding is reused. |
| 7 | `63fad75` | **Find task** Clear button and Escape. **Directory** By module (28) / Flat list (145) toggle. **Sidebar** follows the active task after route changes on desktop. |
| Fix | `e81391b` | Kept WSQL-01's first command above the fold after the header row was added (section 2). Two-column context only for contexts of 600 characters or more. Find task is pinned at the top of the desktop sidebar. |
| Docs | this commit | `DESIGN.md` rewritten for the converged system; `README.md` (design pointer, generated include); `site/about/source.md`; this record. |

## Deviations from the spec, with reasons

1. **Task-page top padding and the pinned Find box are not in the spec.**
   Adding the header row pushed WSQL-01's first command line to 904px at
   1440×900, 4px below the fold the spec requires. I reduced VitePress's top
   padding on task pages from 3rem to 1.5rem, moved the aside by the same
   amount, and tightened the header and title spacing. The line now ends at
   869px.

   The sidebar auto-scroll (spec 2.3) scrolled Find task out of view on long
   modules. Find task is now sticky at the top of the desktop sidebar, and
   sidebar items have a scroll margin so the active one is never hidden under
   it.
2. **Two columns only for long module contexts.** The spec said "two columns
   from 1100px". Short contexts (314 characters on Linux privilege) split
   mid-sentence across two columns, so only contexts of 600 characters or more
   (13 tasks) flow into two. The layout of all other tasks is a single
   compact column, as before.
3. **The home legend has five rows** (blank, route, stop, plain ID, and Copy),
   rather than the four marks the spec named. Copy was kept because it is the
   one control the legend explains.
4. **Route cards in the rail** keep the base chip and titled-row behaviour.
   Gemini's card layout was applied to the foot route sheet, as the spec says.

No content, copy, title or condition rule was relaxed.

## Tests

`pnpm test`: **75 tests** (28 in `tests/checklist.test.mjs`, 47 in
`tests/site.test.mjs`).

| Group | Count | Status |
| --- | ---: | --- |
| Tests from `main` (`307661d`), including the built-page fidelity guard | 42 | All 42 test blocks byte-identical to `main`, and all 31 of `main`'s helpers and top-level declarations unchanged (checked by script) |
| Tests added on `design/opus` (rounds 1–3) | 17 | 16 present under their original names. "The home entry table shows exact titles…" was replaced by "the home Where to enter sheet quotes the box route verbatim with exact titles", which checks every row against the parsed preface instead of a hand-written table that no longer exists. |
| Ported from `design/gemini` | 11 | Arrow linking both ways; loose ID and keyword matching; `codeText` edge cases; literal placeholders, Fill in exposure and Python exclusion; outcome, stop, inbound and explanation-band marks plus plain-ID marks and the AD-03 Revisit label; module context with no `<details>`; no remote assets and 16px prose; a CSS hiding guard over every stylesheet; neutral Question cue and no generated JSON imported by theme code; no pager on module and box-route pages. Gemini's First-command, preface, home-title, copy, AD-03/WSQL-05 and theme-colour tests were already covered by base tests, which are stricter (all 145 tasks, all 732 plates). |
| New for the converged design | 10 | Token contrast (AA, both themes); syntax-colour contrast on both plates; module header strip; jump label and target per task; `isOutcomeList`; home sheet against the preface; home jump and search; Find Clear and Escape plus the directory flat list; theme-colour metas and tokens; and the extended jump test |

Base tests whose markup moved were updated, never weakened. Each still
asserts the same property:

- The heading assertion now checks the verbatim H1 and the header stamp.
- The jump test reads the header row and is stricter: it checks the label and
  target element on every task, and the Routes count.
- The `theme-color` test checks the new paper colours.
- The two CSS guards read every stylesheet instead of `custom.css` alone.
- The outcome-row regex accepts the `id` attribute on the first list.

## Verification results

All results below are on the final code (`e81391b`), and the docs commit
changes no code.

| Check | Result |
| --- | --- |
| `pnpm test` | **75 pass, 0 fail, 0 skipped** |
| `pnpm build` | Succeeds (`Generated 145 tasks across 28 modules`); the only warning is the existing local search index chunk |
| Real-click copy audit: every Copy control on every task page, clipboard compared with the source fence | **732 of 732 exact**; one control per plate; no VitePress hover-only buttons |
| Overflow sweep: all 177 pages at 390, 768 and 1280px | **531 of 531** with the theme loaded; **no horizontal overflow** |
| Module context | 51 of 51 contextual tasks expanded; no `<details>` in any task page's `<main>` |
| Task titles | 145 of 145 H1s equal the source heading |
| Sidebar | 28 groups and 145 items in source order, 0 title mismatches; 145 rendered task links |
| Directory without JavaScript | 145 tasks, 0 title mismatches; the flat list shows 145 rows live |
| Module pages | Every task listed on all 28 |
| Home Where to enter | 5 of 5 rows equal the preface's When and Decision cells; exact titles; the LNX-01 / WIN-01 / AD-01 conditions kept |
| CSS hiding | None in `tokens.css`, `components.css` or `custom.css` (test) |
| Contrast | All token text pairs and all syntax colours at least 4.5:1 in both themes (tests) |
| WSQL-01 first command line at 1440×900 | Ends at 869px, **above the fold** |
| Interactions (Playwright) | Find "suid": 3 matches. "web9" + Enter opens WEB-09. Clear and Escape reset the field. The sidebar follows the active task (LPRIV-15 visible after a jump). Home "net1" shows the title and opens on Enter. Full-text search and `/` open search, and `/` typed in the jump box stays in the box. The flat list shows 145 rows and "kerberos" narrows it to 2. Wrap off scrolls inside the plate with no page overflow, and Copy is still exact. |
| Screenshots | `.superpowers/final/`: home, index, box route, NET-01, WEB-09, NET-05, WSQL-01, AD-03 and the HTTP module, at 1440 and 390px in light and dark (36 images) |

## Known limitations

- **Narrower viewports:** WSQL-01's first command line is below the fold at
  1280×900 (950px) and on a 390px phone (1,450px), because its 1,467-character
  context stays expanded by rule. The First command jump reaches it in one
  click. At 1280px this is about 40px lower than the base build, because of
  the header row.
- **Sidebar position:** on desktop, the sidebar scrolls to the active task
  after navigation. Find task stays pinned, but the module list above the
  active task scrolls out of view until the reader scrolls back.
- **The build warns about the local search index chunk** (about 690 kB), as in
  every earlier build.
