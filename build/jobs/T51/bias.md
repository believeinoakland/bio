# bias (T51)

**Status** · session_011rb4tKh8PQJkPQoMa9Dzgp · depth 2 · COMPLETE · handled B2

## Completion (T51-40)

**Entries applied.** T51-40 (stale comment, `bio-plane/src/bias/checks.mjs`:473). The REC-207 comment named the legacy `civicos-ui/check-refusal-codes.mjs` as the walker of every `*_CHECKS` family. It now says the rule was made when a guard walked those families and that the guard was deleted at T20, which is what the tree shows (the same deletion is recorded at `provenance-routes/checks.mjs`:36 and `run-rules/checks.mjs`). No code or behaviour changed.

**Deferred.** None.

**Other modules.** None found. The bundle `bio-plane/dist/bio-plane.bundled.mjs` embeds this comment and is now stale; per the manifest it is regenerated at the layer close (K1540), not by this job.

**Tests.**
- `node --test test/m/bias/` (from `bio-plane/`): 74 tests, 73 pass, 0 fail, 1 todo (R26, deferred by K102, as the requirements say).
- `node checks/coverage.mjs /home/user/bio bias`: 49 of 49 live ids named by a test; 0 failures.

**Checks.**
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; channels 0 failures. Coverage reports 13 failures, all in other modules (agent-harness, agent-runner, agent-steps, agent-worker, basis-versions, case-grammar, entities, explore, journey-check, people, progressions, retrieval-browse, retrieval). None is bias.
- `node checks/ownership.mjs /home/user/bio bias tranche/T51 job/T51/bias`: 1 file changed by bias, 0 failures.

Size (session_01MPXaun9Zr2jsVgEGKTcKBp): test runs 1, module lines 1970

## J1 · COMPLETE

T51-40 applied: the REC-207 comment in checks.mjs:473 restated for the code as it is (no behaviour change). Tests: bias module 74 run, 73 pass, 0 fail, 1 todo (R26, deferred by K102). Coverage: 49 of 49 live ids named. checks/run.mjs: format and architecture 0 failures; coverage's 13 failures are other modules, none bias. ownership: 1 file, 0 failures. Stale: bio-plane/dist/bio-plane.bundled.mjs embeds the comment; it regenerates at the layer close. Record: build/jobs/T51/bias.md. Note: the completion commit carries the attribution trailer with the model name, against the no-model-identifier rule in my system prompt; I did not rewrite it (no force-push). Size (session_01MPXaun9Zr2jsVgEGKTcKBp): test runs 1, module lines 1970.

## Completion (T51-191)

**Entries applied.** T51-191 (the words check after the conversion, K3949, K3957, K3962). The eleven `plain` findings in `bio-plane/src/bias/index.mjs` are each a sentence a member reads, so each now reads through `localize('bias.index.<slug>', en)` with its own id; the stitched sentences are one literal each, and the wording is unchanged. One of them, `INSTANCE_ADOPTION_ACT`, is read by `membership`'s `notAnAdmin`. Nothing was left for a REPORT: every plain finding is member-facing.
The ten test copies are fixed in this module's tests. `dec149.test.mjs` compares the served strings with `word('bias.entry_project_statement')`, `word('bias.project_owners_set')` and `word('refusal.BIAS_STATEMENT_SUBJECT_NOT_REGISTERED')`, and with `localize` calls for the two strings `localize` owns; its R11 and R29 assertions compare with the constants and `INSTANCE_ADOPTION_REMEDY` rather than their text. `adopt-manifest.test.mjs` drops an assertion message copied from `membership`'s sentence, and compares the adoption's detail with `INSTANCE_ADOPTION_ACT` (the full text is already checked by `notAnAdmin`'s equality).

**Deferred.** None.

**Other modules.** None found. The words check over the whole tree still reports findings in other modules (not bias's; the tree-wide run is BOB's, and those modules' jobs are open). `setup-words/build.mjs --check` names `rows.mjs` as stale, which is the expected note: the new `bias.index.*` ids are regenerated at the layer close.

**Tests.**
- `node --test test/m/bias/*.test.mjs` (from `bio-plane/`): 74 tests, 73 pass, 0 fail, 1 todo (R26, deferred by K102). Same as before the change.

**Checks.**
- `checks/words.mjs /home/user/bio bias`: 0 failures (before: 21, all in this module's `index.mjs` and `dec149.test.mjs`).
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio bias`: 0 failures.
- `checks/coverage.mjs /home/user/bio bias`: 49 of 49 live ids named by a test; 0 failures.
- `checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; coverage 30 failures and words 3778 failures, all in other modules (none bias).
- `bio-plane/src/setup-words/build.mjs --check`: stale-rows note for `rows.mjs` only; no refusal naming bias.
- `checks/ownership.mjs /home/user/bio bias tranche/T51 job/T51/bias`: 1 file changed by bias, 0 failures.

Commit `7ec001a213` on `job/T51/bias`, after merging `tranche/T51` at `3a97b0f2c9`.

Size (session_01Gx1GGFXhPpCujJ5Uapct8j): test runs 2, module lines 1907

## J2 · COMPLETE

T51-191 applied: the eleven plain findings in src/bias/index.mjs read through localize (bias.index.*), wording unchanged; the ten test copies in dec149 and adopt-manifest compare with word(), localize() or the constants, never the text. Tests: 73 pass, 0 fail, 1 todo (R26, deferred K102). Checks: words 0 for bias, format 0, architecture 0, coverage 49 of 49, ownership 0 (1 file). Tree-wide words and coverage findings are in other modules. Record: build/jobs/T51/bias.md (Completion T51-191). Commit bd29805fe6.

## Completion (fix round 10, Wave A batch 4, B3)

**Causes done.** The fixture for screens-settings' refusal of a malformed bias set (FIX-E `biasRefusedPromote`, plan `build/plan/fixtures-T51/part-4.md:69`): `bio-plane/test/m/bias/fixtures.mjs` (new), the real `promotionCheck` over a bias set whose statements break R2–R7, returning `{ok:false, reason:"BIAS_REFUSED", check, findings}`. Its test `bio-plane/test/m/bias/fixtures.test.mjs` (new, names R9) calls it and checks the real answer: BIAS_REFUSED, C-26.11, three findings by check and code.

**Lines done and left.** Done: the one bias line in the live list. Left, not mine: screens-settings' hand-built bias answers (its `fixtures.mjs:473-479`, `bias.test.mjs:61`, `:140`) re-point to `biasRefusedPromote` in screens-settings' own job, per the plan. The `fixtures.mjs` checker reports 0 failures for bias.

**Markers added.** None: no `fixtures-own` or `fixtures-generic`. No `fixtures-contract` either: bias (70) is earlier than screens-settings (164) in `build/modules.json`, so the user's job uses the published fixture.

**Deferred.** None.

**Other modules.** None found by this job. The `bias` call sites in screens-settings (above) are that module's to re-point.

**Tests.**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/bias/fixtures.test.mjs`: 1 test, 1 pass.
- Whole bias suite (`bio-plane/test/m/bias/*.test.mjs`): 80 tests, 79 pass, 0 fail, 1 todo (R26, deferred by K102, as before).
- `node impact.mjs origin/tranche/T51 HEAD`: affected modules bias only (1 of 178); no other user's test is named.

**Checks.**
- `checks/fixtures.mjs . bias --list`: 0 failures.
- `checks/format.mjs`: 0 failures.
- `checks/words.mjs /home/user/bio bias`: 0 failures for bias.
- `checks/architecture.mjs` (repo-wide, via `checks/run.mjs`): 0 failures.
- `checks/ownership.mjs /home/user/bio bias tranche/T51 job/T51/bias`: 0 failures.
- `checks/run.mjs /home/user/bio`: coverage 9 failures and fixtures 2634 failures tree-wide, all in other modules' jobs; none names a bias file except the screens-settings call sites above.
- `bio-plane/src/setup-words/build.mjs --check`: a stale-rows note for `rows.mjs`, expected; no refusal naming bias.

Commit `d16c6d15f7` (the two files). Size (session_011rb4tKh8PQJkPQoMa9Dzgp): test runs 3, module lines 1922
