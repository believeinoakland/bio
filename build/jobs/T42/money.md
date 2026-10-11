# money (T42)

**Status** · session_01Ux9Ca6B1viDvKwTEe8rhGB · depth 2 · RUNNING until 2026-10-11T02:15:38Z (users' suites) · handled B0

## Completion (T42-11b; K2610, K2633; B1)

**Read whole:** the reading set was measured at 454 KB, over 300 KB (K2304). I read these whole myself: `requirements/money.md`; layer 5's row of `layers.md`; `plan/current.md`'s T42-11b and rule 4; K2610 and K2633; record-grammar R29 and `record-grammar/acts.mjs` (the used service, `SHARED_ACT_CHECKS`); progressions' and entities' refusal helpers (the pattern R29's readers follow); the code this entry changes (`money/index.mjs`); and the tests it touches (`record.test.mjs`, `ops.test.mjs`). A worker read the rest of the module in full (`schema.mjs`, `vocab.mjs`, `fixture.mjs` and the other 9 test files, 73 KB, no CSV) and wrote a ~1,100-word summary citing file and line. The summary found no test that pins a refusal's keys for a shared code.

**Applied:**
1. **R26** money's one refusal helper, `refusal` (`index.mjs`:67), now answers any code that is one of record-grammar's shared act rows with that row's `check` and `translation`. `NO_BASIS` (C-33.40) is one such code. The site's own `detail` is kept, and no caller field can replace the row. The only site that raises `NO_BASIS` is `setFundType` with no basis (`index.mjs`:1166), reached directly and through `op=moneyfundtype`. Every other money refusal keeps its shape. `SHARED_ACT_CHECKS` is imported through record-grammar's index (an existing edge).

**Tests:** `refusals.test.mjs` adds two R26 tests:
- Each site (direct and op arm) with an absent, null, empty, blank or non-string basis answers `NO_BASIS` with C-33.40's check and translation exactly, keeps its detail, and writes nothing.
- The negative control (K874): with a basis the act lands without the row, and five of money's own codes carry no `check` or `translation`.

I confirmed the first test fails against the code before this change.

**Deferred:** none.

**Found in other modules (REPORT J1):**
1. **record-grammar:** C-33.40's `where` (`acts.mjs`) names inquiry's, progressions' and entities' sites. It does not name money's `refusal` (`setFundType`) or, after T42-11a, lines'. R29 says the `where` names every site that raises `NO_BASIS`. This needs a row change, which brings a stamp.
2. **case-disclosures:** `test/m/case-disclosures/carries.test.mjs`:139 (R7, "no new table") is red, expecting 157 tables and finding 159. It is red identically on `tranche/T42` @ f997b738cd without money's change, and it is not in rule 4. A T42 merge appears to have added two tables to the store it counts.

No generated artifact made stale beyond the plane bundle (rule 4 (10)). `modules.json` edges added: none.

**Tests and checks** (branch at tranche/T42 @ 9d750634da plus this change):
- money (`test/m/money/`, the two new tests among them): `tests 72, pass 72, fail 0`.
- Users' suites (P11: money-checks, duties, people, explore, query-language, retrieval, calculations, strength, contradiction, intent, corpus-export, ratification, case-disclosures, case-authoring, consequences, affordances, op-declarations, plane, `system/migrate-released`): `tests 1898, pass 1888, fail 2` (the rest neither pass nor fail). The 2 reds:
  - `case-disclosures/carries.test.mjs`:139: report 2 above.
  - `system/migrate-released.test.mjs` (`ai_ceilings`): rule 4 (7).
  - Both are red the same way on `tranche/T42`.
- `format: 147 modules, 146 requirements files; 0 failures`
- `architecture: 15 product files, 41 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 26 of 26 live requirement ids named by a test; 0 failures`
- `ownership: 3 files changed by money between tranche/T42 and HEAD; 0 failures`

Size (session_01Ux9Ca6B1viDvKwTEe8rhGB): test runs 4, module lines 1434
