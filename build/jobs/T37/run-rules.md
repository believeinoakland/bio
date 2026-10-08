# run-rules (T37)

**Status** · session_01Dj7ZF9hyAftgEfQR75g64h · depth 2 · COMPLETE · handled B1

## Completion (T37-49)

**Reading set.** Read whole, tests included: `build/requirements/run-rules.md`; the public parts of `record-grammar` and `observation-log` (Uses); `build/layers.md` (layer 6's contract, the run-rules split); `bio-plane/src/run-rules/` (all five files) and `bio-plane/test/m/run-rules/` (all seven); my entry T37-49 in `build/plan/current.md`; K1793, K1804, K2200, K2201; DEC-127 and DEC-157 whole.

**Entries applied.** T37-49 (N669's share; K2200 (4), K2201):
- R22: `DRAFT_KINDS` = `["own_words", "translation"]`, frozen; `DRAFT_MODE.kinds` names it. `DRAFT_MODE` gains `translation_reach` (nothing of the record: no read op of any module, `ASK_SCOPE` included, whatever the suggestions switch; only the words asked about, at most `TRANSLATION_DRAFT_MAX_WORDS` = 100 a draft) and `translation_keeps` (answered to the plane, never kept; what is stored is `instance-setup`'s). `draftMayRead({kind, firsthand, suggestions})`: true only for `own_words`, `firsthand` absent/null/false, `suggestions === true`; false for `translation` whatever the rest and for an unknown kind; own keys only; never throws.
- R21 amended: `own_words` is R21's draft unchanged (`reach`, `firsthand_reach`); a translation draft is the same mode `draft`.
- No new mode, no new flag: `RUN_MODES`, `DEPLOYED_MODES`, `deploys_apart` and `deployedModesFor` unchanged (tested). `startAllowed` unchanged for a draft of either kind (tested).

**Deferred.** None. The requirements' `*(not yet met: T37)*` marks on R21 and R22 are BOB's to clear (the job does not write requirements).

**Found in other modules (posted as a REPORT).** `agent-worker` (T37-17, its R70's 1–100 words) can read `TRANSLATION_DRAFT_MAX_WORDS` from here rather than hold its own 100. No generated artifact made stale: `skilldoctrine.mjs` reads only `DRAFT_MODE.mode`.

**Tests and checks.**
- `node --test test/m/run-rules/`: tests 32, pass 32, fail 0.
- Users' tests (no provided service changed in behaviour; run as a guard): `ai-runs`, `run-productions`, `capture-requests`, `skills`, `action-plans`, `answer-envelope`: tests 388, pass 383, fail 5; `agent-worker/test/`: tests 11, pass 7, fail 4. The same 5 and 4 fail with my change stashed; the five `capture-requests/plane.test.mjs` reds are rows 30–34 of `plan/t37-red-census.md` (`token=` in the address, `CREDENTIAL_IN_ADDRESS`). None is run-rules'.
- `format`: 136 modules, 135 requirements files; 0 failures. `architecture run-rules`: 12 product files, 21 relative imports; 0 failures. `coverage run-rules`: 22 of 22 live requirement ids named by a test; 0 failures. `ownership run-rules tranche/T37`: 4 files changed; 0 failures.

Size (session_01Dj7ZF9hyAftgEfQR75g64h): test runs 6, module lines 2051

## J1 · REPORT

agent-worker (T37-17, its R70: a to_language draft of 1–100 words): run-rules now exports TRANSLATION_DRAFT_MAX_WORDS = 100 (R22's 'at most 100 a draft', K2201) beside DRAFT_KINDS and draftMayRead; agent-worker can read the figure here rather than hold its own 100. An improvement, not a defect. No generated artifact made stale (skilldoctrine.mjs reads only DRAFT_MODE.mode).
