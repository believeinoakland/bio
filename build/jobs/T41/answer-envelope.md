# answer-envelope (T41)

**Status** · session_017cmBYso32d54JzyLxFv27Q · depth 2 · WORKING · handled B1

## Completion

**Entry applied:** T41-60 (K2428, K2487, K2488, K2525, K2532, K2538, K2554, K2556, K2566; N820), marks R7 and R10 (K2573).
- `families.mjs`: `CHECK_FAMILY_FILES` gains T41's six family files at their `modules.json` places (R10, R7): `src/steps/checks.mjs` (C-142) after hypotheses', before citation's; `src/ai-use/checks.mjs` (C-143) after run-rules', before run-productions' (ai-runs between them holds no file of families); `src/reading-guides/checks.mjs` (C-144) after capture-requests', before `skilldoctrine.mjs`; `src/question-explorer/checks.mjs` (C-145) after `skilldoctrine.mjs`, before answers'; `src/investigation/checks.mjs` (C-146) after intent's, before reevaluation's; `src/publish-schedule/checks.mjs` (C-122.5, moved) directly after publication's, before docket's. `CHECK_FAMILIES` is total again (rule 4 (16) cleared, case-carriage's re-assertion with it: 70/70). Measured: 90 codes join (29 steps, 6 ai-use, 18 reading-guides, 11 question-explorer, 25 investigation, 1 publish-schedule); every code decorated before reads exactly as before (1,622 compared). The five rows whose code an earlier family holds (steps C-142.3 `NO_SUCH_BUNDLE`, C-142.28 `NO_SUCH_PROPOSAL`; investigation C-146.10 `NO_SUCH_QUESTION`, C-146.21 `NO_SUCH_PROPOSAL`, C-146.26 `NARRATIVE_NOT_A_LEG`) keep the earlier row, until N843, as K2566 says.
- `rows-before-r43.json` (R7, R10): re-pinned to each owner's row: C-35.13 (K2428), C-94.5 (K2556, to `65a25bcf08b2ebd2` as BOB gave it), C-70.1, C-22.9, C-22.14, C-104.2, .3, .4, .5, .8; retired into `changed.retired`, their numbers held by no code: C-124.52 `PROPOSALS_CURSOR_REFUSED` (K2554) and C-106.1 `DRAWN_ON_BY_SEVERAL_PROJECTS`; `changed.note` says so. `PROPOSAL_NO_RUN` and `NO_SUCH_PROPOSAL` not re-pinned (rule 4 (21)).
- `families.test.mjs`: the C-120 test re-pinned with C-120.23–.29 (K2428, K2538); docket's place now directly after publish-schedule, which directly follows publication; answers' directly after question-explorer. New test `R10, R7, R2 (T41 …)`: each new family's place between its two neighbours and its module's place in `modules.json`, every code decorating with its own row unless an earlier family holds it (exactly the five above), no later family holding a code one of them decorates, C-122.5 out of publication's file, no other code's decoration moved, with negative controls (each file left out is missed by the totality arm; the totality test fails without one). Mutation-checked: dropping ai-use's entry fails it and the totality test; swapping publish-schedule before publication fails it.
- `catalogue-end.test.mjs` (an improvement): names R10, and compares every pin and names every difference at once instead of stopping at the first (BOB's note that it stopped at its first failure).

**Reading set (mechanics §17):** measured as §3 asks: my requirements (15 KB), layer 11's row, my code and tests (128 KB without the 59 KB pin fixture, whose content I read where my work changes it), the Purpose of each used module (52 KB, 79 modules with the six new ones) and the six new family files the Uses name (34 KB): about 230 KB, under 300; read whole myself.

**Deferred:** none.

**Found in other modules and requirements (REPORT):**
- `answer-envelope` R7's wording (BOB's): "`docket`'s at its place directly after `publication`" no longer holds since `publish-schedule` sits between them (R10, `modules.json`); I read R10 as superseding it and test docket directly after publish-schedule. R7's text could say "at its place in `build/modules.json`".
- Generated artifacts: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is staled by `families.mjs` (rule 4 (14)).

**Final `uses`** (for BOB to apply at my merge): the current list plus `steps` (`src/steps/checks.mjs`), `ai-use` (`src/ai-use/checks.mjs`), `reading-guides` (`src/reading-guides/checks.mjs`), `question-explorer` (`src/question-explorer/checks.mjs`), `investigation` (`src/investigation/checks.mjs`) and `publish-schedule` (`src/publish-schedule/checks.mjs`), each the edge its family file in `families.mjs` needs. Until then `checks/architecture.mjs answer-envelope` reports exactly these six imports (6 failures, nothing else).

**Tests and checks run:**
- `node --test bio-plane/test/m/answer-envelope/`: `pass 28, fail 1`: the one failure is `catalogue-end.test.mjs`'s pin test naming exactly `NO_SUCH_PROPOSAL` (C-111.22 → C-134.23) and `PROPOSAL_NO_RUN` (C-124.47 → C-134.22), accepted red by name (rule 4 (21)) until N843. Was 25 pass, 4 fail at my start.
- `case-carriage` 70/0 (its re-assertion of totality green). Users `control-plane` 191 pass/4 fail, `plane` 147/8, `store-door` 36/5: the same counts on `tranche/T41` without my change (ai account and draft routes, inherited; none touches the families).
- `checks/format.mjs`: 0 failures; `checks/architecture.mjs answer-envelope`: 6 failures, the six `uses` above; `checks/coverage.mjs answer-envelope`: 10 of 10 live ids named, 0 failures; `checks/ownership.mjs answer-envelope tranche/T41`: 0 failures.

Size (session_017cmBYso32d54JzyLxFv27Q): test runs 14, module lines 836

## J1 · REPORT

Two findings, in my record's Completion: (1) answer-envelope R7's wording "docket's at its place directly after publication" no longer holds since publish-schedule sits between them (R10, modules.json); I read R10 as superseding it and test docket directly after publish-schedule; R7 could say "at its place in build/modules.json". (2) The plane bundle is staled by families.mjs (rule 4 (14)).
