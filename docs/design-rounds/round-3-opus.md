# Round 3: Opus polish

Small fixes for the three nits in Gemini's round 2 review of the Runbook Binder
(9.5 / 10). Nothing else changed.

| Nit | Change |
| --- | --- |
| On WEB-09, "First command" jumped past the result table into the explanations | Jumps now target the working section only. **First command** appears only when the working section has a command block, and it points to that section's first block (`cmd-N`, counting any module-context blocks before it). **Result table** follows the same rule. WEB-09 now offers Result table, Explanations and Routes. 141 of 145 tasks keep a command jump; 128 keep a result-table jump. |
| The home "Where to enter" table showed bare IDs | A **Task title** column shows each destination's exact source title. The **Next task** column keeps the box route's wording, so the multi-task row still reads "LNX-01 or WIN-01 according to the actual host; AD-01 when domain context is assigned or observed"; its title cell lists `ID: title` for each task. |
| Find task's exact-ID status did not name the task | Typing an ID now shows "Press Enter to open NET-01: Check connectivity". |

## Verification

| Check | Result |
| --- | --- |
| `pnpm test` | **59 pass, 0 fail, 0 skipped** (58 before, plus 1 new) |
| `pnpm build` | Succeeds |
| Overflow sweep: all 177 pages at 390, 768 and 1280px | 531 page-widths, no horizontal overflow |
| Spot checks at 1440px (light) and 390px (dark) | Home table renders; WEB-09 shows no First command jump, and Result table lands at y = 80; Find "net1" shows the title. Captures are in `.superpowers/round-3/`. |

Tests:

- The jump test is now stricter: every command and result jump must land
  above the explanations, and must exist exactly when the working section has
  that landmark. It also checks WEB-09 explicitly.
- A new test checks every home "Where to enter" row: the When cell is quoted
  from the box route, titles match the catalog, and the multi-task row keeps
  the source's conditions.
