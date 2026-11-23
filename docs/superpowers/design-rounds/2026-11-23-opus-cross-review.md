# Opus cross-review of Gemini QRH-132

Model: `claude-opus-5-5` with high effort

## Verdict

Opus scored Gemini's proposal **7.55 / 10**. The proposal's strongest ideas
were the verbatim module-context band, complete route linking, destination
titles, visible code controls, responsive result matrices, self-hosted fonts,
and the explicit rule that the interface must never use success colors.

The largest deductions were for missed content-fidelity defects, an invented
dispatch matrix that could contradict the source, incomplete terminal-state
detection, reduced body size, weak split-screen coverage, and runtime DOM
changes coupled to VitePress internals.

| Criterion | Weight | Score |
| --- | ---: | ---: |
| Content and command fidelity | 1.50 | 0.95 |
| Finding-to-branch navigation speed | 1.50 | 1.25 |
| Command inspection and substitution safety | 1.00 | 0.80 |
| Long-session legibility | 1.00 | 0.80 |
| Split-screen and mobile resilience | 1.00 | 0.75 |
| Accessibility | 1.00 | 0.80 |
| Information architecture and context | 1.00 | 0.75 |
| Distinctive visual identity | 0.75 | 0.55 |
| Static VitePress maintainability | 0.75 | 0.50 |
| Honest semantics and provenance | 0.50 | 0.40 |
| **Total** | **10.00** | **7.55** |

## Evidence that changed the recommendation

- Inline-code placeholders are double escaped on 26 task pages and on module
  pages; copied inline examples can therefore be wrong today.
- Task pages contain compound and abbreviated route references, as well as
  plain-text terminal `Next:` destinations, that neither first proposal fully
  handled.
- Five modules cannot honestly be summarized with simple first-to-last ID
  ranges because prefixes and source order interleave.
- Module context exists on 11 of 28 modules and can be long, so it must remain
  full length rather than being forced into a compact strip.
- Route fan-in can reach 57 pages, requiring a bounded backlink treatment.
- The current local search already binds `/`; duplicating that behavior is
  unnecessary.

## Self-critique of Opus Route Catalog

Opus also rejected parts of its own first proposal: its placeholder regex was
less accurate, red carried too many meanings, module ID ranges were sometimes
false, it omitted module context and plain terminal routes, its motion added no
operational value, and dense backlinks would overwhelm high-fan-in tasks.

## Convergence recommendation

Build **Field Ledger 132** as one coherent interface rather than blending two
themes. Each task is a numbered surveyor's field-book leaf. Task IDs are call
numbers, task links are cobalt traverse lines, stop or scope states are solid
ochre boundary monuments, and editable placeholders use a dashed ochre blank.

Preserve the QRH proposal's branch clarity, context band, result matrices, code
plates, and typography. Preserve the route-catalog proposal's call-number
index, backlinks, route titles, and strict content-equality tests. Drop the
curated dispatch matrix, invented taxonomy, runtime DOM injection, decorative
motion, and any color shared ambiguously between routes, stops, and blanks.

## Acceptance gates for a 9.5 review

- All 145 tasks and 28 modules remain present, ordered, and searchable.
- Generated presentation preserves every command, placeholder, explanation,
  and route; built inline code contains no double-escaped angle brackets.
- Every task reference resolves, while terminal states remain visibly unlinked.
- Module context is reproduced verbatim on the tasks that need it.
- The call-number index lists all 145 task IDs exactly once.
- Home, representative long tasks, and the index have no horizontal page
  overflow at 390, 683, 768, 960, 1280, and 1440 pixels in both themes.
- Copy, search, route, and derived-navigation controls are keyboard reachable,
  visibly focused, and usable with reduced motion and forced colors.
- No runtime network dependency, telemetry, progress state, or inferred success
  semantics are introduced.
- The full test suite, production build, and local-link audit pass.

No files were edited by the reviewer.
