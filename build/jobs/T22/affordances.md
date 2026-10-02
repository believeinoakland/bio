# affordances (T22)

**Status** · session_01EPYqGW7CQ8qqjXeH7nrTFT · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Ready for the early merge (step 5 of B1), on `job/T22/affordances` @ fb943a804d.

(1) Joint totality, as B1 (5) asked: I merged `origin/job/T22/op-declarations` @ 0e9ee15e90 into a scratch copy of my branch and ran `test/m/control-plane/totality.test.mjs`, `test/m/affordances/catalogue.test.mjs` and `test/m/op-declarations/`: 71 pass, 0 fail. On my branch alone the control-plane totality is red with exactly the seven rows op-declarations adds as `stale` (addressfrequencyset, declinetoescalate, doorbelltally, gradenote, heldcaptures, heldrestore, heldsetaside), accepted red 5; it clears when op-declarations merges.

(2) A detail I settled by precedent (P17; for rulings.md if you record it): `escalationstatus` gets NO `NON_ACTS` entry. op-declarations gives it no `NEEDS` row, as `escalationsdue` has none (their J1), and by R7/R12 an ungated op named in `NON_ACTS` reads `stale`. Your B1 (4) listed it among the ops that get a NON_ACTS reason. My test asserts it is named in no registry, and that it would read `unpublished` if it were ever gated. If you rule otherwise, it is one line on each side. capture's three reads (heldcaptures, gradenote, doorbelltally) do get `read:` rows, matching their present `null` NEEDS rows.

(3) Generated artifact: this change stales the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (it changes `bio-plane/src/affordances.mjs`). I regenerated nothing.

(4) Users' suites (`test/m/affordances|tasks|queue|op-declarations|control-plane`): 417 of 420 pass. The three reds are the totality in (1), plus control-plane's carried `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15 (cleared at control-plane's L11 merge). The whole `test/m` run follows in my COMPLETE.

## J2 · QUESTION

Uses gap: `node checks/architecture.mjs bio affordances` now reports 13 failures (0 on the tranche baseline). R19's backing, which B1 asks for "each against the real module", drives ops owned by six modules that affordances' `uses` does not name: provenance (`testify`), observation-log (`lead`, `leadlook`, `leadshare`), bias (`biasadopt`), strength (`strengthbar`), reevaluation (`versionadopt`), and monitoring (`addressfrequencyset`, layer 10, which is earlier than my layer 11). The tests import each one's fixture and its checks table, which holds the code `JUSTIFICATION_REFUSALS` names, and monitoring's op map, for the totality over its new op.

My best reading: add those six to affordances' `uses` in `build/modules.json`, and to the requirements' Uses as "their op maps, the ops R2 grades, and the backing of each rung (R19)", the line `sources and capture` and layer 9's modules already carry. The modules really are what R2 grades, so the uses are true. The alternative, not driving them, would leave R19 unproven for 8 ops. I am carrying on. Once you change `modules.json`, I merge `tranche/T22` and re-run the check. Nothing else in my job waits on this.

## J3 · COMPLETE

Complete on `job/T22/affordances` @ fb943a804d (one code commit; mail commits after it). Ready to merge early, back to back with op-declarations (J1).

**Entries applied (B1, B2):**
- **R2, R27 (met):** DEC-88's 57 moved from `RUNG_ABSENT` into `RUNGS`, R2's bands word for word: 25 `reversible`, 30 `reasoned` (`inboxresolve` among them, refused `RESOLVE_NO_REASON`), 2 `terminal` (`escalationend`, `filingapprove`). `RUNG_ABSENT` keeps exactly R27's 21 `undetermined` and its other grounds unchanged. The undetermined block's header was re-worded for DEC-88. T22's four (`declinetoescalate`, `heldsetaside`, `heldrestore`, `addressfrequencyset`) are `reasoned`.
- **R19 (met: the words' and grounds' backing):** `JUSTIFICATION_REFUSALS` gains 21 codes, each read from its owner's checks table (and so tested): TESTIMONY_NO_WORDS, TRANSCRIBE_NO_TEXT, LEAD_NO_WORDS, PURSUIT_UNSTATED, LEAD_LOOK_NO_DETAIL, LEAD_SHARE_NO_REASON, ATTEST_NO_NOTE, ENTITY_NO_NOTE, NO_BASIS (record-grammar's shared row; the comment says it counts as the stated basis, not inquiry's object demand), VERSION_ADOPT_NO_REASON, NO_NOTE, BIAS_ADOPTION_NO_REASON, BAR_NO_REASON, STANDARD_NO_REASON, PACKET_NO_REASON, ATTRIBUTION_NO_REASON, STATEMENT_ACK_NO_REASON, RESOLVE_NO_REASON, NO_RATIONALE, SET_ASIDE_NO_REASON, FREQUENCY_NO_REASON. INTENT_NO_REASON and ESCALATION_NO_REASON were already there. `backing.test.mjs` drives every newly reasoned op that asks a reason (26 from DEC-88, plus T22's four) at its owner's real interface. Without the reason (absent, empty, blank) each is refused with its exact code, and nothing is written to any table. With the reason it is accepted. K1025's four are backed by their grounds: `resolve` records `basis` and `method`; `actioncorrespond` and `filingsent` are refused NEITHER_CAPTURE_NOR_TESTIMONY (nothing written) and accepted on an account with no further reason; `consequencerecord`'s assessed arm is refused NO_RATIONALE, its computed arm accepted on operands and its undetermined arm on its stated why. The two terminal acts are tested too: a second approval answers ALREADY_APPROVED, and an ended escalation answers ALREADY_ENDED and is never reopened.
- **R31, R4 (met: rung_consequences):** `CONSEQUENCE_STATEMENTS` maps the six acts to `{friction, statement}`: `dialog` for five, `in-place` for `workobjective`. It is published as `VOCABULARIES.rung_consequences` (the same object, also through `vocabulariesFor` and `affordancesAnswer`). The decorated act's keys are unchanged (R11). The statements' wording is mine and claims only what each owner enforces; their look is the redesign's.
- **R3, R7, R12, per B2:** `NON_ACTS` gains declinetoescalate, heldsetaside, heldrestore and addressfrequencyset, plus `read:` rows for heldcaptures, gradenote and doorbelltally. `escalationstatus` is named nowhere (no NEEDS row; J1 (2), B2), and neither is `doorbellrefused`. T23's three are left out.
- **The `is` wording (CONTENT #9, ENTITIES #7, OBSERVATION-LOG #8, BOB #92 ×3):** once the moved ops left `RUNG_ABSENT` their `is` sentences went with them, so the requirement now lives in their `NON_ACTS` reasons and `RUNGS` comments. attesttext, transcriptionattest, entitycreate, leadshare, leadlook, objectivecondition, workobjective, versionadopt, standarddeclare, standardadopt and inboxresolve now each state that the reason or note is required, with its code and DEC-88's rung.
- **(6) Re-scan:** comments naming the deleted `src/store.mjs` as live were corrected (record-core's `perItem`, basis-versions' conclude, the facts module). The provenance notes stay. Nothing names `tools/` or `legacy-tests` as live.

**Tests and checks:**
- `test/m/affordances/`: 146 pass, 0 fail.
- Users' suites (affordances, tasks, queue, op-declarations, control-plane): 417 of 420 pass. The 3 reds are the totality (accepted red 5, cleared by op-declarations: proven by the scratch merge, 71 of 71) and control-plane's carried `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15.
- Whole `bio-plane/test/m`: 4,962 tests, 4,940 pass, 10 fail, 12 todo. All 10 are accepted by name: queue-producers' `proposals.test.mjs` (4); control-plane's doorbell :310, catalogue-end :15 and totality (red 5); accepted red 4 (membership `module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, promotion `registry.test.mjs`:58). No new red.
- `format`: 0 failures. `coverage`: 31 of 31 live ids named, 0 failures. `ownership`: 5 files, 0 failures.
- `architecture`: 13 failures (0 on the baseline). These are the uses gap in my J2 QUESTION, still open: once `modules.json` names provenance, observation-log, bias, strength, reevaluation and monitoring, it passes. I re-run it after your answer.

**Deferred:** nothing.

**Found in other modules:** none against their requirements.

**Generated artifact:** this change stales `bio-plane/dist/bio-plane.bundled.mjs`. I regenerated nothing.

Size (session_01EPYqGW7CQ8qqjXeH7nrTFT): test runs 19, module lines 3144
