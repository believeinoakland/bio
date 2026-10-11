# lines (T42)

**Status** · session_0163snLavE1iNycSFMG4uPJy · depth 2 · COMPLETE · handled B0

## Completion (T42-11a; K2610, K2633; B1)

**Read whole (the reading set is 367 KB, over 300 KB; K2304):** `requirements/lines.md`; layer 5's row of `layers.md`; `plan/current.md`'s T42-11a and rule 4; K2610, K2633; record-grammar R29 (and R52) and `record-grammar/acts.mjs` (`SHARED_ACT_CHECKS`); entities' `actShapeRefusal` (the pattern followed); the code this entry changes (`lines/index.mjs`, whole) and the tests it builds on (`fixture.mjs`, `record.test.mjs`). Two workers read the rest in full and wrote summaries citing file and line: the Public parts of the ten used modules (about 8.8 KB), and `schema.mjs`, `vocab.mjs` and the five other test files (about 4.7 KB).

**Applied:**
1. **R22**: one helper, `noBasis(detail)` (`index.mjs`:53–58), answers `{ok: false, reason, code: "NO_BASIS", check: "C-33.40", translation, detail}` from `SHARED_ACT_CHECKS.NO_BASIS`, with each site's own particular kept in `detail`. All seven `#basis` sites go through it (:426, 444, 448, 454, 463, 470, 476): no basis; a rule naming no rule; a record instant that is not an instant; a register row with no record instant; a rule source of neither form; testimony in an unheld project; a basis of no form. `recordCurrentThrough` (R21) reaches the same sites through `#basis`.
2. **Own flaws fixed** (the reader found these places checking a sample where the requirement asks for full compliance): R18 now writes every structure kind (it had left out `contracts_with`) and gates a `HYP-` id as `from_entity` and as a passage's `captureSha`; R15 compares the whole OCDS and party-role lists, gives every other kind no role, and checks that every list (`CONNECTION_KINDS` and each role list among them) is frozen; R16 compares `holderat`'s whole answer with the service's.

**Tests:** `basis-row.test.mjs` (3 tests, R22): each of the seven sites through `recordLine`, the machine's register row, the same seven through `recordCurrentThrough` and through the ops map's `linerecord`. Each refusal carries `check` C-33.40, the row's translation verbatim and its own detail, and nothing is written. The negative control (K874): the basis forms' other refusals (NO_STATEMENT, NO_SHA, CAPTURE_NOT_HELD, NO_EXTENT, EXTENT_NOT_IN_CAPTURE) and seven other refusals carry no `check` or `translation`, and the four valid basis forms write. Mutation: with the helper reverted to a bare code, 2 of the 3 tests fail.

**Deferred, with why:** further sample-only tests in my own module, none touching R22, left for a later lines entry so as not to widen T42-11a: R18's `holderAt` scan sees only exported names, and skips modules that fail to import (invariants.test.mjs:36–41); R20's place and banned-word checks read field names and three refusal details, not the text of values (:104, :110–112); R14's members' words are checked one word deep (owner.test.mjs:18–19); R17's `assert.ok(Lines)` proves nothing (:124–125). Also, R18's gate covers the `lines` table but not `line_current_through`'s basis; whether R18 reaches a current-through statement is BOB's reading.

**Found in other modules (REPORT):**
1. **record-grammar R29:** C-33.40's `where` must name every site that raises `NO_BASIS` (N827, K2467); it does not yet name `src/lines/index.mjs noBasis` (`acts.mjs`:43–49). This is record-grammar's change and needs a stamp; lines did not touch it.
2. **case-disclosures** `carries.test.mjs`:156 ("no new table", 159 !== 157) fails the same with and without this change, on `tranche/T42`; it is not caused by lines.
3. **money** :1162's bare `NO_BASIS` is T42-11b's (K2610), and unchanged.
4. The requirement's marker `*(not yet met: T42)*` on R22 is BOB's to clear at merge. The plane bundle is staled by any source change (rule 4 (10)). `modules.json` edges added: none.

**Tests and checks** (on `tranche/T42` @ f997b738cd merged):
- lines (`test/m/lines/`): `tests 33, pass 33, fail 0`.
- users (P11): local-facts 38/0, money 70/0, money-checks 48/0, duties 49/0, people 46/0, calculations 55/0, inquiry 193/0, strength 143/0, answers 58/0, corpus-export 25/0, case-disclosures 94/1 (report 2), case-authoring 181/0, actions 109/0, escalation 63/0, affordances 232/0, instance-setup 135/0, op-declarations 128/0, plane 166/0; `system/migrate-released`: one FAIL of its checks, "born on 0.80.0: and no table a fresh store lacks", got `["ai_ceilings"]`, the accepted red of rule 4 (7) until T42-17, not caused by lines.
- `format: 147 modules, 146 requirements files; 0 failures`; `architecture: 10 product files, 41 relative imports; 0 failures`; `coverage: 1 modules, 22 of 22 live requirement ids named by a test; 0 failures`; `ownership: 5 files changed by lines between tranche/T42 and HEAD; 0 failures`.

Size (session_0163snLavE1iNycSFMG4uPJy): test runs 30, module lines 962

## J1 · COMPLETE

T42-11a complete at the branch head (tranche/T42 @ f997b738cd merged): R22: all seven NO_BASIS sites answer with record-grammar's C-33.40 (check, translation) through one helper noBasis; basis-row.test.mjs tests each site via recordLine, recordCurrentThrough and the ops map, with a negative control; mutation fails 2 of 3. Own sample-only tests for R15, R16 and R18 made whole. lines 33/33; the 18 user suites green except case-disclosures carries.test.mjs:156 (159 !== 157, red on tranche/T42 without this change); migrate-released red only on the ai_ceilings arm (rule 4 (7)). The four checks report 0 failures. REPORT: record-grammar R29 needs C-33.40's where to name src/lines/index.mjs noBasis (acts.mjs:43-49), record-grammar's change. modules.json edges added: none. Details in the record's Completion section.
