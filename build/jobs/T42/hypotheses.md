# hypotheses (T42)

**Status** · session_01Fm5UfnSMEt4ujf1MKJezUn · depth 2 · WORKING · handled B1

## Completion

**Read** (mechanics §17; START measured 332 KB, over 300). I read these whole: `requirements/hypotheses.md`; layer 6's row of `layers.md`; the plan's T42-13 entry, rule 4 and `draft-T42-reqs.md` §N843; K2566 and K2608; the code and tests the entry changes: `src/hypotheses/checks.mjs`, `index.mjs` and `test/m/hypotheses/t41.test.mjs`. The re-coding calls no used service, so no used module's Provides was in the change. A worker read the rest of the module whole: `schema.mjs`, `fixture.mjs`, `acts`, `invariants`, `legs`, `notes`, `notes-t35`, `notes-t36` and `owner.test.mjs`, about 118 KB with the requirements. It wrote a summary of about 6 KB, every statement citing file:line, covering anything touching the two codes, catalogue-wide tests, fixture helpers, ids named per file, and flaws.

**Entries applied.**
- T42-13 (N843, K2566), R22: C-134.22 re-coded in place from `PROPOSAL_NO_RUN` to `HYPOTHESIS_PROPOSAL_NO_RUN`, and C-134.23 from `NO_SUCH_PROPOSAL` to `NO_SUCH_HYPOTHESIS_PROPOSAL`. Numbers, `where`s and translations are unchanged (K238). Their raisers in `index.mjs` changed to match: `hypothesisPropose`, and `#openProposal` for `hypothesisTakeUp` and `hypothesisSetAside`. Doc comments and the `checks.mjs` header were updated too. The module no longer holds either code, so it no longer decorates action-plans' or intent's refusals.
- R16–R18's tests in `t41.test.mjs` now expect the new codes.
- New test `R22`: both rows' numbers and translations are pinned, neither old code is a key, and every C-134 number is held once. It drives every refusal of the three proposal acts, through the methods and the ops arms (absent, hidden, a held `HYP-`, null and a malformed proposal; a run of null, empty, blank or not a string), and checks each answers the new code and never the old. Its negative control: a proposal with its run, taken up and set aside by a member who can see it, lands. Negative control on the code itself: with the old `src/hypotheses` restored, the R22 test fails (0 pass, 1 fail).
- Improvement in my module: `acts.test.mjs`:91 repeated the assertion on line 90; I removed it.

**Deferred.** None.

**Found outside this module (REPORT J1).**
1. Users' suites (P11) after this change: 772 tests, 769 pass, 3 fail:
   - `test/m/answer-envelope/catalogue-end.test.mjs`:17 (assertion :27). Rule 4 (6), expected. Its `PROPOSAL_NO_RUN` pin is green again. Its `NO_SUCH_PROPOSAL` pin now reads C-142.28 (steps' row, the next holder) where C-111.22 is pinned. It stays red until steps re-codes C-142.28 (T42-14), then T42-27.
   - `test/m/answer-envelope/families.test.mjs`:425 (assertion :457), "NO_SUCH_PROPOSAL is also held after src/steps/checks.mjs" (intent's C-111.22, investigation's C-146.21). **New with this change**: it was green on the tranche without it (I re-ran it with the old code: only catalogue-end red). Its `HELD_EARLIER` still lists C-142.28 as held by an earlier family, which was hypotheses' C-134.23. It returns to green once T42-14 (steps) and T42's investigation entry re-code their rows and T42-27 drops the three N843 rows from `HELD_EARLIER`, as `draft-T42-reqs.md` §N843 says. It needs naming as an accepted red from this merge until then. I did not change it.
   - `test/system/migrate-released.test.mjs` "born on 0.80.0: no table a fresh store lacks", got `["ai_ceilings"]`. Rule 4 (7), inherited, until T42-17.
   - affordances, op-declarations, control-plane and plane: green.
2. Generated artifacts: the plane bundle and `case-checker/program.mjs` are stale from this source change (rule 4 (10)); I did not regenerate them.
3. Promotion stamps C-134.22 and C-134.23 as re-keyed rows (rule 4 (2)). `docs/development/ux-substrate/ux-substrate-v2.json` names these codes; it is the UX stream's file, so they need telling.
4. Requirements text (BOB's to word): R7 names `op=hypothesissetaside` among T41's arms but not `hypothesistakeup`, `noteshare`, `noteunshare` or `shares`. The ops map has those arms and `invariants.test.mjs`:9–14 and `t41.test.mjs` test them. The behaviour stands; only the text lags.

**Tests and checks.**
- `node --test test/m/hypotheses/`: tests 48, pass 48, fail 0.
- Users' suites (affordances, op-declarations, answer-envelope, control-plane, plane with `migrate-released`): tests 772, pass 769, fail 3, as above.
- `manifest.md` names no layer tests.
- `format`: 147 modules, 146 requirements files; 0 failures.
- `architecture hypotheses`: 12 product files, 40 relative imports; 0 failures.
- `coverage hypotheses`: 22 of 22 live requirement ids named by a test; 0 failures.
- `ownership hypotheses tranche/T42`: 0 failures (re-run after the commit, below).

Size (session_01Fm5UfnSMEt4ujf1MKJezUn): test runs 6, module lines 1108

## J1 · REPORT

Found outside hypotheses (record §Completion, item 1–4). (1) NEW red from this change: answer-envelope test/m/answer-envelope/families.test.mjs:425 (assert :457) 'NO_SUCH_PROPOSAL is also held after src/steps/checks.mjs' — HELD_EARLIER still lists C-142.28 as held earlier (it was by hypotheses' C-134.23); green once T42-14 steps and investigation re-code and T42-27 drops the three N843 HELD_EARLIER rows; needs naming as an accepted red from this merge. Not changed. (2) catalogue-end.test.mjs:17 (:27), rule 4 (6): the PROPOSAL_NO_RUN pin is green again; NO_SUCH_PROPOSAL now decorates steps' C-142.28 instead of intent's pinned C-111.22 until T42-14. (3) migrate-released 'born on 0.80.0' ai_ceilings: rule 4 (7). Other users (affordances, op-declarations, control-plane, plane) green. (4) Plane bundle and program.mjs stale (rule 4 (10)); promotion stamps the re-keyed C-134.22/.23; ux-substrate-v2.json names the codes (UX stream, to tell). (5) Requirements text: R7 names op=hypothesissetaside but not the T41 arms hypothesistakeup, noteshare, noteunshare, shares, which the code has and tests test; wording only.
