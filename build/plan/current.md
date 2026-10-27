**Round** · R1 · layer 5 CLOSED · layer 9 OPEN
# Plan T51b · the alpha, on the redesigned process
**Status** · OPEN · BOB #317 · session_01224iDvCaoPmHYZNq2oLxtm · depth 1
**Jobs** · events: EVENTS #1 session_01Ko31oRwx6KqRAKesZzHQ8g
**Owed** · archive events

# Plan: T51b round R1 · the team-zone pass, finished

**Status** · Written by BOB #315 for BOB #316, who opens it with `proc round open --round R1 --plan build/plan/T51b-R1.md` (adoption README step 4). T51b is the alpha only, on the redesigned process, nothing of the beta (Bob, K5336, K5337; `build/rulings-product/scope.md`). Its order: R1 (this round); the artifacts, the redeploy of biosmoke8 and the live walk (`build/situations/deploy-and-walk.md`), every defect in fix rounds (`fix-round.md`); the cut 0.87.0 through the rehearsal, which passes before Bob is told (K5333; `release.md`, `build/plan/walk-T51-alpha/alpha-cut.md`); civicsmith.org and the installer; Bob's own install (K4935).

**Before R1 opens (BOB's, §5.10):** the pass's edits on branch `pass/zone-T51b` (K5292, `build/plan/pass-zone-K5292.md`; 18 sites) are taken onto `tranche/T51b` for the 16 modules whose own suites read as before (K5338), each of those modules' suites and their users' run once with the checks (never the whole suite, K5338), then committed with a ruling naming every module. The edits to `action-plans` and `events` are not taken: their jobs below make them. Before their STARTs, BOB writes K5292 (the team's stated zone governs, else the place profile's) into both modules' requirements, re-marking the ids below `*(not yet met: T51b)*`.

**Also at the opening (BOB's; README "Before you run it"):** the 13 requirement files' `*(not yet met: T51)*` marks are re-marked `T51b` where T51b meets them, else each moves to `next.md` with its P19 reason; the adoption README's step 7 retirements (bio's `premerge.mjs`, `watch-job.sh`, `bob-rulings-check.mjs`; the process repository's probe, prep and dry-run branches by `prune-branches.yml`); JOURNEY-CHECK #16's unmerged work (test-only, K5311) and OP-CAPABILITIES #2's (no change needed, K5239) enter neither.

## Layer 5

**events**
- T51b-1 · The team's stated zone governs every date the module reads or writes for a team that states one (K5292), the place profile's zone only where the team states none. The pass's edits on `pass/zone-T51b` are the starting point; its own suite read 5 red after them (R23, R35, R42, R53, R54): bring each to the requirement as rewritten for K5292, never back to the old behaviour. K5292 is written into Terms (a date-time's default zone), R23 and R42 (K5342); R35, R53 and R54 state no zone source, so their reds come from the governing `zone()` and each is brought to Terms' zone; a sentence of them that needs changing is a question to BOB. Tested by its suite and its users' suites.

## Layer 9

**action-plans**
- T51b-2 · As T51b-1, for the plan's dates and checks: a "no zone held" world now finds the team's zone (R46 (b), R48, R54 red after the pass's edits); each brought to the rewritten requirement. Its walker case: money's figures refused `MONEY_BAD_PERIOD` for want of the team's zone (re-walk 11 C new 1, `money/index.mjs:276`), and the plan's date checks; both re-walked live after the redeploy. Tested by its suite and its users' suites.
