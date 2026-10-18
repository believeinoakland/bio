# duties (T51)

**Status** · session_01Ws4NENFkwXyb87BcFTppXf · depth 2 · WORKING · handled B1

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
