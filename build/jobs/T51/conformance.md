# conformance (T51)

**Status** · session_014bYaS8aw3Ywr8iWF6pbvdN · depth 2 · WORKING · handled B0

## J1 · REPORT

Found in another module (not changed by this job): `actions` test `bio-plane/test/m/actions/t34.test.mjs:101` copies the sentence of `actions` `localize("actions.index.an_action_recorded_for_a_2", ...)` (`bio-plane/src/actions/index.mjs:1240`) as a literal. The words check (cross-module run over the list you named) flags it as a testcopy `[code]` in `actions`. It does not name conformance's module; the excerpt only reads "conformance determination" because the sentence says so. For `actions` to fix, not this job.

## J2 · COMPLETE

Entries applied (T51-85, words, K3949 / K3962 / K3986):
- Inline sentences converted to `localize`, text byte-identical: `checks.mjs` DETERMINATION_ONLY_BY_ITS_ACT (`conformance.checks.a_determination_is_recorded_only`); `index.mjs` NO_OFFICE_ENTITY (`conformance.index.no_office_entity_is_held`); `index.mjs` NO_STANDARDS detail (`conformance.index.a_determination_measures_the_act`).
- Test copies (the 6 testcopy findings, including the t46 code copies) replaced by `word("refusal.STANDARD_SIDE_UNNAMED")`, `word("refusal.CONFORMANCE_BAD_REASON")` and key-free checks: `dec149.test.mjs` (translation through `word`; detail sentence no longer held: the NAMES_THE_PLANE check stays), `determine.test.mjs` (C-113.17 through `word`), `t46-words.test.mjs` (`KEPT_THREE` holds check and where only; the KEPT canonical-JSON hash pins the three kept translations, text unchanged; expected values read from `CONFORMANCE_CHECKS.<row>.translation`).

Deferred: none in the module.

Found in another module (REPORT posted): `actions` `test/m/actions/t34.test.mjs:101`, a literal copy of `actions`' own sentence.

Tests run: `node --test test/m/conformance/` (bio-plane) 3 times; final run 119 pass, 0 fail.
Checks run (civicos-process checks, product `/home/user/bio`):
- `checks/words.mjs /home/user/bio conformance`: 0 failures (4085 string literals read; before: 9)
- `checks/words.mjs ... consequences action-grammar actions action-holds escalation filing-templates filings action-clocks action-plans action-records plan-work action-replies`: no line of conformance; one line in `actions` (see REPORT)
- `checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; channels 0 failures; coverage 26 failures across other modules (none conformance); conformance's own coverage 41 of 41 ids, 0 failures; words failures in other modules only
- `checks/architecture.mjs /home/user/bio conformance`: 0 failures
- `checks/coverage.mjs /home/user/bio conformance`: 41 of 41 live ids, 0 failures
- `checks/ownership.mjs /home/user/bio conformance tranche/T51 job/T51/conformance`: 1 file changed, 0 failures
- `bio-plane/src/setup-words/build.mjs --check`: rows.mjs stale, as expected (BOB regenerates at layer close); no refusal naming conformance

Size (session_01ViYfNCYcxxWgYECRmXKcky): test runs 3, module lines 2709
