# observation-log (T53)

**Status** · session_018BhcecurEFLMTnAtT6vbUk · depth 2 · COMPLETE
**Sessions** · 2

## Completion (2026-10-28)

# observation-log · T53 · report

**Entries applied**

- **T53-149 · N1219 (R40, R41).** A run's or step's log entry carries `read` `{record, n, total, outcome}` or `disagree` `{record, levels}` as data. `observation_log` gains two JSON-text columns, `read` and `disagree` (new stores in the schema text, older stores by `migrateObservationLog`; rows made before read both `null`). `observe` takes the two (snake or camel spelling), `checkObservation` asks them last through the new pure `checkObservationFields` (shape of each, `read` before `disagree`, then the allowance: not both, only authority kind `run` or `step`), and the insert stores each with its keys in R40's order. Two new refusals, nothing written on either, each naming the field: `OBSERVATION_FIELD_MALFORMED` (C-22.32) and `OBSERVATION_FIELD_NOT_ALLOWED` (C-22.33), one site each, sentences read by key (`refusal.<CODE>`, `localize` with the English until the words table holds the row). `latest`, `byAuthority`, `contentRows` and the rows handed to an `onLookAnswered` listener serve both fields (object or `null`). R13's fence is unchanged; the fields have no sight of their own (R41). Tests: `run-fields.test.mjs` (R40's positive and control cases in full, the pre-T53 table migration, R37's payload, R41); R26, R9 and R29's pinned lists updated for the new rows and columns.
- **T53-150 · K5565.** All 26 English sites of the module's six test files converted: assertions read the word table by key (`word(id, vars)`, composed from the nested keys where the product composes), none copies a sentence. B sites keyed in the module: `FIRST_EXTRACTION_PREFIX` and `RE_EXTRACTION_PREFIX` (`observation-log.index.first_extraction_prefix`, `.re_extraction_prefix`; same text as before). The words check reads `testenglish 0`; the ownership check keeps `build/tests-english-baseline.json` outside a job's paths, so its six lines for this module (answered 2, append 3, lead 1, meaning 9, vocabulary 1, writers 10) are left for BOB to remove; with the baseline as it stands every file is at or under its allowance. Module suite: 92 pass, 0 fail.

**Decision for BOB (the C-22 numbers).** R40 says the row's number is BOB's at START; my START named none, so I took the next two free after C-22.31: **C-22.32** `OBSERVATION_FIELD_MALFORMED`, **C-22.33** `OBSERVATION_FIELD_NOT_ALLOWED`. If BOB allocated other numbers, the change is the two `check` strings in `checks.mjs` and the pinned list in `vocabulary.test.mjs` (R26).

**Not done / owed outside this module (found, not mine to edit)**

1. **run-rules' tests pin the C-22 set** and now fail on my two rows: `test/m/run-rules/table.test.mjs` (R11, the list of observation-log's C-22 numbers) and `t46.test.mjs:120` (R30, the numbers above C-22.28 read as `29,30,31`, now `29,30,31,32,33`). Both need the two numbers added; run-rules' job or BOB.
2. **Stale generated artifact.** `bio-plane/src/setup-words/rows.mjs` and `words-unreviewed.json` are stale until `node bio-plane/src/setup-words/build.mjs` runs (the new `localize` ids: both refusals, `observation-log.vocabulary.field_*`, the two prefixes); three setup-words tests (WORDS_COMMIT, review list R16 and R17) are red until the merge regenerates them. `proc merge` does that.
3. **Row census.** `gate.mjs`' ROW_CENSUS counts the C-22 rows: two new rows await the next promotion stamp.
4. **Requirements.** R29's column list (the read contract) should name `read` and `disagree`; R40 and R41 can be struck as met. `ai-runs` R99 and R100 can now build on the writer and readers here (its `op=airunlog` reads `observation_log` itself, so it needs its own change to serve the two columns).
5. Dependent modules with failures that predate this job (ai-runs, run-rules, op-declarations `t48`: `accountReferenceSet`, ai-accounts' route moves) are inherited and unchanged.

**Met** · R40, R41

Tests: 92/92. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecurEFLMTnAtT6vbUk): test runs 1, module lines 3223
