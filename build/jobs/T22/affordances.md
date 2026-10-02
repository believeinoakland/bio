# affordances (T22)

**Status** · session_01EPYqGW7CQ8qqjXeH7nrTFT · depth 2 · RUNNING until 2026-10-02T05:22:10Z (bio-plane test/m (whole)) · handled B1

## J1 · REPORT

Ready for the early merge (step 5 of B1), on `job/T22/affordances` @ fb943a804d.

(1) Joint totality, as B1 (5) asked: I merged `origin/job/T22/op-declarations` @ 0e9ee15e90 into a scratch copy of my branch and ran `test/m/control-plane/totality.test.mjs`, `test/m/affordances/catalogue.test.mjs` and `test/m/op-declarations/`: 71 pass, 0 fail. On my branch alone the control-plane totality is red with exactly the seven rows op-declarations adds as `stale` (addressfrequencyset, declinetoescalate, doorbelltally, gradenote, heldcaptures, heldrestore, heldsetaside), accepted red 5; it clears when op-declarations merges.

(2) A detail I settled by precedent (P17; for rulings.md if you record it): `escalationstatus` gets NO `NON_ACTS` entry. op-declarations gives it no `NEEDS` row, as `escalationsdue` has none (their J1), and by R7/R12 an ungated op named in `NON_ACTS` reads `stale`. Your B1 (4) listed it among the ops that get a NON_ACTS reason. My test asserts it is named in no registry, and that it would read `unpublished` if it were ever gated. If you rule otherwise, it is one line on each side. capture's three reads (heldcaptures, gradenote, doorbelltally) do get `read:` rows, matching their present `null` NEEDS rows.

(3) Generated artifact: this change stales the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (it changes `bio-plane/src/affordances.mjs`). I regenerated nothing.

(4) Users' suites (`test/m/affordances|tasks|queue|op-declarations|control-plane`): 417 of 420 pass. The three reds are the totality in (1), plus control-plane's carried `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15 (cleared at control-plane's L11 merge). The whole `test/m` run follows in my COMPLETE.

## J2 · QUESTION

Uses gap: `node checks/architecture.mjs bio affordances` now reports 13 failures (0 on the tranche baseline). R19's backing, which B1 asks for "each against the real module", drives ops owned by six modules that affordances' `uses` does not name: provenance (`testify`), observation-log (`lead`, `leadlook`, `leadshare`), bias (`biasadopt`), strength (`strengthbar`), reevaluation (`versionadopt`), and monitoring (`addressfrequencyset`, layer 10, which is earlier than my layer 11). The tests import each one's fixture and its checks table, which holds the code `JUSTIFICATION_REFUSALS` names, and monitoring's op map, for the totality over its new op.

My best reading: add those six to affordances' `uses` in `build/modules.json`, and to the requirements' Uses as "their op maps, the ops R2 grades, and the backing of each rung (R19)", the line `sources and capture` and layer 9's modules already carry. The modules really are what R2 grades, so the uses are true. The alternative, not driving them, would leave R19 unproven for 8 ops. I am carrying on. Once you change `modules.json`, I merge `tranche/T22` and re-run the check. Nothing else in my job waits on this.
