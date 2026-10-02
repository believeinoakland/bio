# BOB to action-plans (T22)

**Read** · handled J0

## B1 · START

Depth 2. You join T22's layer 9 by K1086 (P19, as plane joined L11 by K1061): ACTIONS #9 meets its R55 by registering capture's `litigation-hold` reader at start in `actionsOf` through `captureOf(host)`, which joins provenance's promotion step to the host; a fixture that builds `actionsOf` without provenance's tables then fails every promotion (`no such column: authored`, provenance's `#testimonyFence`). Every real host builds provenance first. Your entry, one only: your test fixture (`bio-plane/test/m/action-plans/fixture.mjs`) migrates provenance as a real host does (`provenanceOf(host).migrate()`, or the provenance setup the other fixtures use, before `actionsOf`), so `test/m/action-plans/` (43 tests) stays green once actions merges; and through your fixture `test/m/affordances/backing.test.mjs`:140 and :165 stay green (affordances' file, not yours: run it, do not edit it). Prove it on your branch with ACTIONS #9's change merged: BOB posts a CHANGE when actions is merged; until then, merge `origin/job/T22/actions` into a scratch branch to test, never into yours. Change nothing else in your module; re-scan your paths for notes naming a T20-deleted file, `tools/` or the deleted plane `index.mjs` as live (N469, N471, N480) and re-word any. Reds carried by name now: as in K1082 (actions `t18.test.mjs`:299 is actions' own, this layer; consequences `reads.test.mjs`:185 intermittent; scheduler `plane.test.mjs`:85; queue-producers `proposals.test.mjs`:39; control-plane `doorbell.test.mjs`:310, `catalogue-end.test.mjs`:15; row-census, accepted red 3; accepted red 4, `MODULE_ORDER`). The coverage check's 11 accepted failures are other modules'. Proof: `bio-plane/test/m/action-plans/` green with actions merged; affordances `backing.test.mjs` green; the whole `bio-plane/test/m` with no new red. A test-only change stales no bundle. Do not delete or edit another module's files.

## B2 · CHANGE

N497 (K1087), test-only: if your test fixtures register promotion's facts under the retired `"legacy-store"`, name the providing module instead (`instance-setup` for `producingGroup`; `publication` for `caseMember`, `publishedRegistry`), N469's rule. No behaviour changes. tranche/T22 @ 9e3c197c15.

## B3 · CHANGE

K1088 (tranche/T22 @ fcd4a42998): your `uses` gains `provenance`, so your fixture may import provenance for the migrate (K1086). Merge tranche/T22 in.

## B4 · CHANGE

actions, action-clocks, standards and escalation are merged into tranche/T22 @ dde04dba31 (K1089). Merge tranche/T22 into your branch, finish what waited on them (conformance: standards' reason; filings: N474 with action-clocks' `factReader` and standards' reason; action-plans: your fixture's provenance migrate against actions' merged R55), re-run, and post COMPLETE.

## B5 · ANSWER · re J1

Your first reading, already done: K1088 added `provenance` to your `uses` (B3). Actions and action-clocks are merged (K1089; action-clocks fixed its fixture the same way, so your J2 is settled). Merge tranche/T22 @ 0cbec8e1ea (B4), re-run the checks and post COMPLETE: you are the last job in L9.
