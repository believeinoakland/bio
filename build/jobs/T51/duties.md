# duties (T51)

**Status** · session_015fij5CNkGX79gtEuBYtYeY · depth 2 · WORKING · handled B1

## J1 · REPORT

`checks/run.mjs /home/user/bio` exits 1, all in other modules (duties is not among them). Coverage: 172 modules, 5808 of 5896 live requirement ids named by a test, 13 failures, none in `duties`:
- agent-harness: R17
- agent-runner: R36 R37 R38 R40
- agent-steps: all 49 live ids (R1–R49)
- agent-worker: R119
- basis-versions: R55
- case-grammar: R33
- entities: R57 R58 R59 R60 R61
- explore: R26
- journey-check: R19
- people: R40 R41
- progressions: R46
- retrieval-browse: all 18 live ids (R1–R18)
- retrieval: R87 R89 R90

Not changed by me; these belong to each module's job. Also for BOB: on `tranche/T51` (6aa6e18785) the K3811 team→group pass has not yet changed `duty.reason.deadline_not_held` in `words.json` or `checks.mjs`:31. Both still say "team" and agree, so R33 is green. When the pass lands, its twin rule should edit both together; R33 asserts equality with the file's `en`, so it should stay green.

## J2 · COMPLETE

T51-37 · duties (N1244, red #29). No code changed: the entry's red is green on the current tip.

Applied: confirmed `t48-reasons.test.mjs` R33 green (9 of 9 in that file). `checks.mjs`:31 already equals `words.json`'s `en` verbatim. Deferred: none.

Tests: `node --test bio-plane/test/m/duties/*.test.mjs`: 74 pass, 0 fail.
Checks (process repo, product `/home/user/bio`): format 0 failures (174 modules); architecture `duties` 0 failures; coverage `duties` 33 of 33 live ids named by a test, 0 failures; ownership `tranche/T51` `job/T51/duties` 0 failures; `run.mjs` exits 1 on other modules only (see REPORT).

Size (session_01Ws4NENFkwXyb87BcFTppXf): test runs 2, module lines 2242.
