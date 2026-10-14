# filing-templates (T49)

**Status** · session_01DLu9hNhnNY3UX3zTHQrEQY · depth 2 · WAITING ON BOB (J1) · handled B2

## Record (T49-11, test only, claude-haiku-5-5)

**Reading (step 2).** Read whole: `roles/JOB.md`; `build/requirements/filing-templates.md`; `bio-plane/test/m/filing-templates/r33.test.mjs` and `t46-words.test.mjs` (the tests that name R29 and R33); `bio-plane/src/filing-templates/checks.mjs` (the rows R29 and R33 translate by); `build/layers.md`, layer 9. START (B1) read whole. **Not read whole:** the plan (`build/plan/current.md`: entry T49-11 and the opening rules, found by search) and the module's `index.mjs` (1,440 lines), `schema.mjs` and `blanks.mjs`, read only where the job touches them (the R33 check, the machine-identity message). That is a gap against step 2. It is disclosed here and not closed in this job.

**Entries applied.**
- N1068 ("labeled"): `bio-plane/src/filing-templates/index.mjs` line 211, the member-facing machine-identity refusal, re-spelled. The other "labelled" words in the module are comments, schema notes and test titles, not member-facing, and are left.
- Test only: `r33.test.mjs`, the R33 approval test: removed a literal copy of the RFC row's translation. The read by key (`en("refusal.RFC_QUOTING_MISSING")`) stays.
- The `admin` grep (N1072): no `admin` reaches reader-facing text in `src/filing-templates/`. Its tests use `admin` as a viewer id only (`fixture.mjs`, `reads.test.mjs`). No change.

**Deferred.** Nothing in the entry is deferred. The three tests below stay red for a reason outside this job (next section).

**Found, not in this job's scope.**
1. `docs/development/ux-substrate/screens/words.json` holds neither `rfc.quoting` nor `refusal.RFC_QUOTING_MISSING`. Commit `0fd6562c1e` (DEC-234, the design session, 2026-10-14) removed both; `main` (`f498560a37`) and `tranche/T49` agree. R33 requires the row to translate by key from `words.json`, and R29 says a row never holds a copy. The module's `FILING_TEMPLATES_WORDS` (`checks.mjs` lines 30–32) holds a verbatim copy, which R29 forbids. Whether the removal was deliberate is for the design stream to say.
2. `bio-plane/src/setup-words/index.mjs` line 516 still carries `refusal.RFC_QUOTING_MISSING` (and `rfc.quoting` at line 480). T49-15 re-takes `WORD_ROWS` from `main`, which no longer has them.

**Tests and checks.**
- `node --test bio-plane/test/m/filing-templates/*.test.mjs`: 79 tests, 76 pass, 3 fail. The failures are `r33.test.mjs:49` (R33 RFC_QUOTING_SENTENCE), `r33.test.mjs:69` (R33 the row moves) and `t46-words.test.mjs:36` (R29 C-125.33). All three fail on the same cause: `words.json` has no `rfc.quoting` or `refusal.RFC_QUOTING_MISSING`, so `en()` returns undefined.
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs filing-templates`: 0 failures.
- `checks/coverage.mjs filing-templates`: 33 of 33 live requirement ids named by a test.
- `checks/ownership.mjs T49`: 0 failures (after the commit `d7c70fd531`).
- `checks/run.mjs` is not run: it is required before COMPLETE, and this job is BLOCKED.

Size (session_01DLu9hNhnNY3UX3zTHQrEQY): test runs 3, module lines 1919

## J1 · BLOCKED

BLOCKED. Cause: needs Bob.

The job's changes are in (N1068 "labeled" at index.mjs:211; the literal copy removed from r33.test.mjs; the admin grep clean; commit d7c70fd531, record pushed as ad6967243c). Format, architecture, coverage and ownership pass. Three tests stay red, all on one cause: `words.json` holds no `rfc.quoting` and no `refusal.RFC_QUOTING_MISSING`. Commit 0fd6562c1e (DEC-234, the design session, 2026-10-14) removed both; main and tranche/T49 agree. The tests are r33.test.mjs:49, r33.test.mjs:69 and t46-words.test.mjs:36. Test-only changes cannot clear them without weakening R29 or R33.

Decision for Bob (policy/requirements, P17):
(1) RECOMMENDED: the design stream restores the two keys to words.json, with their wording as filing-templates holds them (checks.mjs lines 31-32), unless the design session says the removal was deliberate. Then the three tests pass with no change to this module.
(2) Or amend R29 and R33 to allow this module to hold the RFC row's translation as a copy. Then the tests are re-pointed at that copy; a CHANGE job would do it.

Either way, `setup-words` line 516 still carries the two rows, and T49-15 re-takes its WORD_ROWS from main, which lacks them.

Plain steps for Bob: tell the design session (its next session) that words.json lost `refusal.RFC_QUOTING_MISSING` and `rfc.quoting` in 0fd6562c1e and that R33 needs them back; or rule (2) here. Then ring me back, and I will re-run the tests and COMPLETE.

Also disclosed: I did not read the module's index.mjs, schema.mjs and blanks.mjs whole (step 2); the record says so.

## Completion (after BOB's ANSWER to J1, B2)

**Entries applied.** T49-11, test only, as B2 settled (K3357): the words are this module's own, declared in it (`checks.mjs` lines 31–32, text unchanged) and absent from `words.json` (DEC-234, B200 (5)).
- `r33.test.mjs`: the first R33 test asserts the sentence is unchanged and that `words.json` holds neither `rfc.quoting` nor `refusal.RFC_QUOTING_MISSING`; the words.json re-wording comparison is dropped. The row test pins the module's own text (`RFC_TRANSLATION`) and asserts the row and the declaration both carry it.
- `t46-words.test.mjs`: the table test reads `refusal.TEMPLATE_NOT_REVIEWED` from `words.json` by key and pins `refusal.RFC_QUOTING_MISSING` as the module's own word.
- N1068 ("labeled", `index.mjs` line 211) and the `admin` grep: as in the first record. No further change.
- `setup-words` untouched (T49-15 re-takes its rows from main, as B2 said). No change to `words.json`.

**Deferred.** None.

**Found in other modules (for BOB, a REPORT).** `checks/run.mjs` over the product (run after the merge) reports 17 coverage failures: live requirement ids named by no test, in admission, affordances, control-plane, interface-assets, interface-shell, journey-check, op-capabilities, screens-action, screens-daily, screens-entry, screens-inquiry, screens-intake, screens-investigate, screens-publish, screens-settings, setup-words and site. Architecture is 0 failures overall. These modules are not this job's; the list is reported, not fixed.

**Tests and checks (after the re-point).**
- `node --test bio-plane/test/m/filing-templates/*.test.mjs`: 79 tests, 79 pass, 0 fail.
- `checks/format.mjs`: 0 failures.
- `checks/architecture.mjs filing-templates`: 0 failures. `checks/run.mjs` architecture over the product: 0 failures.
- `checks/coverage.mjs filing-templates`: 33 of 33 live requirement ids named by a test.
- `checks/ownership.mjs T49`: 0 failures.
- `checks/run.mjs` coverage over the product: 17 failures, all in other modules (above).

Size (session_01DLu9hNhnNY3UX3zTHQrEQY): test runs 4, module lines 1919

## J2 · REPORT

REPORT, found in other modules (not this job's; not fixed here). After the merge of tranche/T49, `checks/run.mjs` over the product reports 17 coverage failures: live requirement ids named by no test. admission R27; affordances R61; control-plane R96, R97, R98; interface-assets R8; interface-shell R65–R69; journey-check R7–R13; op-capabilities R1–R3; screens-action R17; screens-daily R24, R29, R30, R32; screens-entry R16–R20; screens-inquiry R23–R43 (19 ids); screens-intake R22–R25; screens-investigate R27–R29; screens-publish R22, R23; screens-settings R34; setup-words R9; site R1–R11 (all 11). Architecture is 0 failures overall. filing-templates is clean: 79/79 tests, coverage 33/33.
