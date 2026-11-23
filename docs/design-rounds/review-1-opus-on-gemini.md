# Round 1 review: Opus on Gemini "Slate & Signal"

Reviewed: `design/gemini` at `8c88e9a`. The later commit `02dc370` adds only
Gemini's review document; the design is unchanged. Reviewer: `claude-opus-5-5`.
I did not edit the Gemini worktree.

**Score: 8.0 / 10**

## What I checked

| Check | Result |
| --- | --- |
| `pnpm test` in the Gemini worktree | 45 pass, 0 fail |
| `pnpm build` | Succeeds |
| Overflow sweep: all 177 pages at 390, 768 and 1280px (Playwright) | Theme loaded on all 531; no horizontal overflow |
| Screenshots: home, checklist index, NET-01, WEB-09, NET-05, `linux_privilege` module, WSQL-01 (long context), at 1440 and 390px, light and dark | `.superpowers/review-1/` (Git-ignored) |
| Copy audit: VitePress's copy algorithm run on every block of every task page, compared with the source fence body | 732 of 732 blocks identical |
| Real Copy clicks read back from the clipboard (Chromium, granted permissions) | Match the simulation (Windows returns `\r\n`, an OS effect) |
| Contrast of signal colours | Placeholder 5.5:1 light, 10:1 dark; stop 6.1 and 9.2; route chip 7.5 and 8.4 |
| Keyboard | Copy reachable and outlined on focus; `/` opens search except while typing in an input |

## Fidelity

**No source words or command lines are lost.** The token audit passes, every
block copies exactly, and route and stop marks cover both bold and plain
`Next:` forms. The restructured NET-05-style outcome lists and the
"Enter when" and "Question" cues keep the source text and order.

**1. Long module contexts are collapsed by default.** The `web_input`,
`command_continuation`, `sql_continuation` and `web_upload` contexts (13 tasks)
are inside a closed `<details>`, and the summary shows only "Run in Kali Bash."
This is not secondary text. It contains the instructions that change how the
page's own commands must be run:

- "For the observed ordinary URL-form POST, replace `--get` with
  `--request POST` in every request."
- "Add each actual required non-secret field with `--data-urlencode
  'name=value'` to every request."
- Add the WEB-09 private session header only after checking the origin.
- "Require curl 8.4+."
- The stop conditions: 429, partial output, login or other-origin redirects.

An operator on WSQL-01 who copies the visible plates without opening the panel
sends GET requests that are missing required fields. The text is present and one
click away, so I have not applied the 6.0 cap for loss of information. It
breaks the brief's rule that only secondary material may collapse, though, and
it must be expanded before this design can reach 9.5. The longest of these
contexts is 1,467 characters, about 16 lines.

**2. Home entry labels paraphrase task titles.** `HomeWorkbench.vue` writes
its own labels for 6 of its 9 tasks:

| Gemini's label | Source title |
| --- | --- |
| Full TCP port & service scan | Scan the box's TCP ports and services |
| Linux host & effective identity | Which host and effective identity are you using? |
| Identify domain & controller | Identify the domain and controller |
| Verify host & session identity | Is the session actually on the assigned host with a known identity? |
| Upgrade socket shell to PTY | Can an existing socket shell become a usable target PTY? |
| Triage a downloaded file | Does this exact downloaded file contain a usable next lead? |

Several turn a conditional question into an instruction, which is the kind of
framing the source avoids. The write-up says the grid is "derived strictly from
the source snapshot's own Default Box Route". The "Session or artifact" column
(EXP-03, SHELL-01, ART-01) is not a box-route row, and the box route itself is
not published anywhere on the site. "Default discovery sequence" also sits
awkwardly with the source's "not a fixed command sequence".

**3. The clipboard relies on VitePress's normaliser.** The native handler
trims each shell block and strips leading `$ ` and `> ` from its lines. Nothing
in the current edition triggers either (I checked all 732 blocks), so there is
no defect today. A future edition containing a `> ` continuation or prompt
line would copy altered text, and no test would catch it. Gemini's tests check
markup, not the copied string.

**Minor.** At 640px and below, decision tables hide their `<thead>` with the
`clip: rect(0 0 0 0)` visually-hidden pattern. Each cell repeats the header as a
label, so nothing is lost, but it is the technique the brief bans. Command
plates also set `overflow: hidden`; `pre` scrolls inside, so nothing is cut
off in practice.

## Scores

| # | Criterion | Weight | Score | Notes |
| --- | --- | ---: | ---: | --- |
| 1 | Mid-box workflow speed and clarity | 2.5 | 1.85 | Excellent: task header with Decision, Explanations and Routes jumps, the Enter when and Question cues, NET-05 outcome rows, and the route map with module tags. Deductions: collapsed contexts that hold command-modifying rules; the plate says "4 blanks" but not which; the source's box route is not published. |
| 2 | Command presentation and exact copying | 1.5 | 1.25 | Copy is always visible, the Wrap/Scroll toggle is good, placeholders are marked at build time, and copy is exact today. Deductions: it depends on VitePress's trimming; the blank counter is added by JavaScript after load and is `aria-hidden`; light-mode plates are barely darker than the page, so commands do not separate from prose at a glance. |
| 3 | Wayfinding | 1.5 | 1.15 | The sidebar filter, dual-mode directory, route map, breadcrumb, `/` shortcut and source-order pager label are all strong. Deductions: paraphrased entry labels and an invented column; no box route page; six invented "operational area" tabs; module cards list only 3 tasks before "View all". |
| 4 | Hierarchy, scannability and concise chrome | 1.5 | 1.20 | Clear hierarchy and strong decision tables. Deductions: redundant chrome, such as a "REFERENCE & TROUBLESHOOTING" label above the "Explanations and troubleshooting" heading, "1 command" counters and many uppercase tracked mono labels; on mobile the home grid fills roughly the first 1,000px before "How to use it". |
| 5 | Responsive at 390, 768 and 1440px | 1.0 | 0.90 | No overflow anywhere, and the stacked RESULT and NEXT rows are good. Deductions: clipped `<thead>`; the home jump field's placeholder truncates at 390px ("NET-05, s"). |
| 6 | Accessibility | 1.0 | 0.80 | Contrast passes, focus rings, reduced motion, forced colours, and a `/` guard on inputs. Deductions: amber means four things (placeholder, stop, module context, IMPORTANT); the Wrap button flips both its label and `aria-pressed`; the blank count is hidden from assistive technology; Unicode glyphs (■, ▾, →) act as icons. |
| 7 | Visual craft and coherence, light and dark | 1.0 | 0.80 | Coherent and calm, and both themes are well tuned. Deductions: 3px coloured left borders on plates, stops and callouts, card grids on home and index, and the uppercase-mono-label look. |
| | **Total** | **10.0** | **7.95, rounded to 8.0** | |

## Recommendations, most important first

1. **Expand all module contexts on task pages** (`scripts/checklist.mjs`,
   which wraps contexts over 600 characters in `<details>`). Render them open
   in a compact band. To save space, tighten the type (14-15px, 1.5 line
   height) rather than collapsing.
2. **Use exact source titles on the home page** (`HomeWorkbench.vue`). Read
   titles from `catalog.json` instead of hand-written labels. Either drop the
   "Session or artifact" column or label it as a site selection rather than
   "the checklist's default route".
3. **Publish the source preface** ("How to use this edition" and the Default
   box route table) verbatim as a page, link its route marks, and point the
   home entry grid at it.
4. **Replace the native copy handler** (`theme/index.js`) with one that writes
   the rendered lines joined by `\n`, with no trim and no prompt stripping.
   Add a test that compares every plate's text with its source fence body.
5. **Name the blanks in each plate header** ("Fill in: `<IP_ADDRESS>`"). Render
   this at build time in the Markdown fence renderer, not in JavaScript after
   load, and do not mark it `aria-hidden`.
6. **Give stops and module context their own signals.** Keep amber for
   placeholders and stop states, and move module context and IMPORTANT to a
   neutral ink-bordered band.
7. **Stop clipping `<thead>`** on mobile decision tables (`custom.css` around
   line 730). Leave it visible as a one-line legend, or rely on the cell labels
   and keep the header in the flow.
8. **Increase plate contrast in light mode** so commands stand apart from
   prose at a glance (a darker well, or a dark plate as in a terminal).
9. **Trim chrome:** remove the "REFERENCE & TROUBLESHOOTING" label, the
   "N commands" counter, and the decorative 3px left borders. On mobile, move
   "How to use it" above the entry grid or shorten the grid.
10. **Wrap toggle:** keep a fixed label ("Wrap lines") with `aria-pressed`, or
    change the label without `aria-pressed`, but not both.
11. **Directory:** show every task in module mode (cards currently stop at 3),
    and either drop the invented area tabs or label them as site groupings.

## Worth borrowing into the Runbook Binder

- The **task header jump bar** (Decision ↓, Explanations ↓, Routes (n) ↓),
  which is quick on long tasks.
- **Enter when and Question cues** set as structured lines, without changing
  their text.
- **Outcome-list rows** for NET-05-style bullet lists: a mono slug badge and
  ruled rows.
- **Module tags on route-map destinations**, so cross-module jumps are visible.
- The **sidebar filter** with live results, as a complement to my exact-ID
  box.
- The **Wrap/Scroll toggle** on plates, for wide outputs that read better
  unwrapped.
- **"Show" and "Hide" text on the inbound `<details>` summary.**
