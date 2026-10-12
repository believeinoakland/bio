# action-grammar (T46)

**Status** · session_014zGD2WeapwDueLZpi1n52a · depth 2 · COMPLETE · handled B1

## Completion (ACTION-GRAMMAR #10)

**Entry applied.** T46-31 (N913; DEC-194; K2953, K2959): R26. In `src/action-grammar/checks.mjs` a frozen `ACTION_GRAMMAR_WORDS` holds `words.json`'s `refusal.<CODE>` sentences verbatim for the twenty-four rows R26 names (C-117.30, .31, .33–.40, .42–.54 less .41, and .56), and each of those rows takes its translation from it by key, as `membership`'s `HANDLE_WORDS`, `extraction`'s `TRANSCRIBE_WORDS` and `duties`' `DUTIES_WORDS` do; `index.mjs` re-exports it (`export *`). Codes, numbers, `where`s and behaviour unmoved: every finding the arms push is unchanged. Kept in T46, as R26 rules: C-117.32 `OVERRIDE_GROUND_REFUSED`, C-117.41 `OFFICE_STATUS_WITHOUT_OUTCOME`, C-117.55 `REPLY_OWED_REFUSED`, C-117.57 `LAW_STAGE_UNKNOWN` (each returned to BOB until its sentence and its requirement agree), and C-117.58 `MACHINE_CANNOT_SET_COPIED` (no key in `words.json`). `BEARING_REFUSED` is not this module's row: R24 still pushes the finding, `action-replies` (C-150.3) re-words it at its one minting site. Every other row of every table is unchanged (the R9 golden test compares them all).

**Reading set (mechanics §17).** Read whole by this session: `build/requirements/action-grammar.md`; every file of `src/action-grammar/` and `test/m/action-grammar/` (golden.json excepted, a large data fixture, K2053); my entry and the plan's opening rules in `build/plan/current.md`; layer 9's contract and the action-grammar section of `build/layers.md`; the public parts (Purpose and Provides) of record-grammar, jurisdictions, civil-time, connections and inquiry-grammar.

**Own code and tests read whole (P20).** No flaw found that this job needed to fix. One observation, not a flaw against the requirements and so not changed: `lifecycleFindings`' `DUE_NOT_A_DATE` (C-94.9, R5) tests the `YYYY-MM-DD` shape only, so `due_by: 2026-02-30` passes it; tightening it to `civil-time.isCalendarDate` would change findings on documents written before, which R5 and R7 (byte-identical to T44) do not allow without a requirement change. For BOB's judgement; nothing deferred.

**Found in other modules.** None to fix. Accepted reds this change opens or meets:
- `system/row-census.test.mjs` names exactly the twenty-four rows (C-117.30, .31, .33–.40, .42–.54, .56) as "changed with no record": rule 5 (2), until T47's stamp. Before the change it named no C-117 row.
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) inlines `src/action-grammar/checks.mjs` and is stale by this change: rule 5 (4), regenerated at the layer close. `case-checker/program.mjs` does not hold this module.
- Reds seen in users' tests, identical without this change (checked against the job branch's base): `escalation` 1 (R21, states "the catalogue's"; escalation's own N910 work with record-grammar R57), `affordances` 2 (R48 ACT_HELP, rule 5 (7); R1 R12 R24 op maps of filing-templates and local-facts, from T46-9's N935).

**Tests and checks.**
- `node --test test/m/action-grammar/*.test.mjs`: tests 64, pass 64, fail 0 (61 before). New: `t46-words.test.mjs`, three tests naming R26. `t45-rows.mjs` keeps T45's drafts as `T45_ROWS` and adds `ROWS_NOW` (read from `words.json` itself), which the R9 tests in `t45.test.mjs` and `grammar.test.mjs` now compare against.
- Negative control: `t46-words.test.mjs` against the T45 `checks.mjs`: 0 pass, 3 fail; restored, 3 pass.
- Users' tests (the rows are a provided value): actions 110/0, action-holds 35/0, action-clocks 66/0, action-replies 16/0, filing-templates 63/0, filings 92/0, setup-page 83/0, instance-setup 147/0, answer-envelope 32/0, promotion 137/0; escalation 71 pass, 1 fail and affordances 232 pass, 2 fail, the inherited reds above.
- No layer tests are named in `build/manifest.md`.
- `format`: 0 failures. `architecture action-grammar`: 0 failures. `coverage action-grammar`: 26 of 26 live ids named; 0 failures. `ownership action-grammar tranche/T46`: 6 files changed; 0 failures. `run.mjs`: format 0, architecture 0 (none for my files), coverage 29 failures (other modules' ids marked not yet met, rule 5 (1); none action-grammar's), channels 0.

Size (session_014zGD2WeapwDueLZpi1n52a): test runs 22, module lines 2750

## J1 · COMPLETE

T46-31 (N913; R26) applied: twenty-four C-117 rows (.30, .31, .33-.40, .42-.54, .56) read words.json's refusal.<CODE> by key from a frozen ACTION_GRAMMAR_WORDS (checks.mjs, re-exported by index.mjs); codes, numbers, wheres and behaviour unmoved. Kept: C-117.32, .41, .55, .57 (R26, returned to BOB) and .58 (no words.json key). BEARING_REFUSED left to action-replies (R24 still pushes the finding). New test t46-words.test.mjs (R26, 3 tests; negative control 0/3 against T45 code). Module tests 64/64. Users' tests pass (actions, action-holds, action-clocks, action-replies, filing-templates, filings, setup-page, instance-setup, answer-envelope, promotion); escalation 1 red (R21) and affordances 2 reds (R48 rule 5 (7); R1 R12 R24 op maps, T46-9) are identical without my change. Checks: format, architecture, coverage (26/26), ownership (6 files) 0 failures; run.mjs architecture 0. Reds opened, both accepted: row-census names exactly the 24 rows (rule 5 (2)); plane bundle stale (rule 5 (4)). Own code and tests read whole; nothing deferred; one observation for BOB in my record (C-94.9 checks the date's shape only, unchangeable under R5/R7 as written). Details in my record.
