# action-grammar (T47)

**Status** · session_01C23dRcZuUnxyMW6avDwka9 · depth 2 · COMPLETE · handled B1

## Completion (ACTION-GRAMMAR #11)

**Entries applied.** T47-36 (N959, N961; K2982):
- **R27** (N959): `clockMovesNotMechanical(heldClock, nextClock, todayIso)` states R33's mechanical rule by the date alone, as it already did for a `todayIso` naming a day: it answers `[{ord, from, to}]` for every status change but a `pending` → `overdue` move whose held `date` is before `todayIso`'s day, reads no time of day (a timed `due_at` entry moved on its own day is answered; `actions` R98 filters that), and is pure. One flaw fixed under P8: a `todayIso` naming no day (absent, `null`, a `Date`, any text not starting `YYYY-MM-DD`) read as the text `"undefined"`/`"null"`/…, which sorts after every date, so every `pending` → `overdue` move passed. It now passes none. `actions` always hands a `YYYY-MM-DD` (`localToday(...) ?? "0000-00-00"`), so its behaviour is unchanged; the golden `clockMoves` scalars are unchanged.
- **R28** (N961): the twelve rows whose raising site moved to `action-records` name it. C-73.2–.5 → `src/action-records/index.mjs lawEntries > is-laws-entry`; C-90.2 → `badRiskTier > is-bad-risk-tier`; C-90.6 → `actionRiskPropose > is-risk-propose-basis`; C-117.39 → `actionReceipt > is-receipt-on-sent`; C-117.48–.50 → `actionScope > is-scope`; C-117.51, .52 → `actionPromise > is-promise`. Each is prefixed `src/action-records/index.mjs`, with code, number, translation and region unmoved. No other row moved; C-32.21 stays `actions`' `#seeksFence`. `golden.json` (its six recorded rows, C-73.2–.5, C-90.2, C-90.6) and `t45-rows.mjs` (C-117.39, .48–.52) follow, and the tests that pinned `src/actions/` for those rows were re-pointed (`grammar.test.mjs` R9's `where` form, `t45.test.mjs` R9, `t46-words.test.mjs` R26).
- R2's `PROMISE_KINDS` cross-reference was re-worded in the requirement only; the value is unchanged and no code changed for it.

**Rows, each `awaiting stamp` (T48's stamp, plan rule 5 (2)):** changed `where`: C-73.2 NO_LAWS, C-73.3 BAD_LAW_LEVEL, C-73.4 BAD_CITATION, C-73.5 TOO_MANY_LAWS, C-90.2 BAD_RISK_TIER, C-90.6 RISK_PROPOSAL_BASIS_REFUSED, C-117.39 RECEIPT_NOT_ON_SENT, C-117.48 MACHINE_CANNOT_SET_SCOPE, C-117.49 SCOPE_NO_REASON, C-117.50 SCOPE_UNCHANGED, C-117.51 MACHINE_CANNOT_RECORD_PROMISE, C-117.52 PROMISE_REFUSED.

**R28's census fixture, my reading.** R28 names `test/fixtures/row-census-1.73.0.jsonl` as following. That file is now `row-census-1.74.0.jsonl` (stamped at T47-10) and belongs to `promotion`'s `tests`, so it is not mine to write. I read "the census fixtures following" as the stamp's own act at T48, which re-snapshots these twelve lines. I did not touch it. If BOB means otherwise, it is a `promotion` change.

**Reading set (mechanics §17).** Read whole by this session: `build/requirements/action-grammar.md`; every file of `src/action-grammar/` and `test/m/action-grammar/` (`golden.json` excepted as a large data fixture, K2053; I changed six of its strings and read every occurrence I changed); my entry and the plan's opening rules in `build/plan/current.md`; split map `build/extraction/actions-split.md` §5; layer 9's contract, the action-grammar section and T47's opening section of `build/layers.md`; the public parts (Purpose and Provides) of record-grammar, jurisdictions, civil-time, connections and inquiry-grammar.

**Own code and tests read whole (P20).** One flaw found and fixed (R27's `todayIso`, above). Nothing deferred. Last tranche's observation (C-94.9 checks `due_by`'s shape only) still stands as an observation, unchanged for the same reason.

**Open until `action-records` merges (BOB's CHANGE).** R28's control, the census arm (`t47.test.mjs`, "R28 (the census arm)"), checks that every row's `where` names a file this tree holds, with that DEC-49 region and that function. It passes for every `actions` and action-grammar row. It is red for exactly the twelve rows above, each `src/action-records/index.mjs is not held`, because T47-37 has not merged. This is the requirement's own pointing, which BOB's START anticipated. I will re-run on the CHANGE, and the function names it expects are R28's (`lawEntries`, `badRiskTier`, `actionRiskPropose`, `actionReceipt`, `actionScope`, `actionPromise`).

**Found in other modules.**
- `actions` (red my change opens, until T47-38): `test/m/actions/acts.test.mjs:205` (R28: C-90.2's `where` pinned to `src/actions/index.mjs #badRiskTier`) and `test/m/actions/t45.test.mjs:567` (R8 R74 … R88: `RECEIPT_NOT_ON_SENT has its row`, looking for rows naming actions' file). Both pin the sites of the arms T47-38 moves to `action-records` (split map §6: R28, R80, R87, R88 arms move there). They are not in rule 5's list, so they are named here for the merge ruling (K2704). Before my change: actions 121/0; after: 119/2.
- Row census (`system/row-census.test.mjs`, `promotion`'s): adds exactly the twelve rows above as "changed with no record" (rule 5 (2), until T48's stamp). It was already red on `tranche/T47` from other jobs' rows (7 pass, 1 fail on both).
- The plane bundle inlines `src/action-grammar/checks.mjs` and is stale (rule 5 (4)).
- Reds in users' tests identical with and without my change (run on `tranche/T47` @ 0892a110bd and on my branch): action-replies 6 (R3, R8 through case-authoring R70, rule 5 (8); R7, rule 5 (7a)); affordances 7 (rule 5 (7a), (8)); answer-envelope 8 (rule 5 (7a), (7b), (8)).

**Tests and checks.**
- `node --test test/m/action-grammar/*.test.mjs`: tests 73, pass 72, fail 1 (the census arm, above). Before: 64/64. New `t47.test.mjs`: 9 tests naming R27 (5) and R28 (4).
- Negative control: `t47.test.mjs` against the code before this change (`tranche/T47`): 6 pass, 3 fail (R27's no-day rule; R28's two `where` tests). The census arm passes there because the old `where`s resolve.
- Users' tests: actions 119/2 (the two above; 121/0 before), action-holds 37/0, action-clocks 70/0, action-replies 17/6, filing-templates 66/0, filings 97/0, escalation 85/0, affordances 238/7, setup-page 87/0, instance-setup 157/0, answer-envelope 25/8. All but `actions`' are identical to `tranche/T47`.
- No layer tests are named in `build/manifest.md`.
- `format`: 0 failures. `architecture action-grammar`: 0 failures. `coverage action-grammar`: 28 of 28 live ids named; 0 failures. `ownership action-grammar tranche/T47`: 9 files changed; 0 failures. `run.mjs`: format 0, architecture 0, coverage 36 failures (other modules' ids marked not yet met, rule 5 (1); none action-grammar's), channels 0.

Size (session_01C23dRcZuUnxyMW6avDwka9): test runs 12, module lines 2766

## J1 · COMPLETE

T47-36 applied, with one control red until action-records merges (your CHANGE).
- R27 (N959): clockMovesNotMechanical is R33's date rule alone (no time of day; actions R98 filters). Flaw fixed (P8): a todayIso naming no day read as text after every date and passed every pending->overdue move; it now passes none. actions always hands YYYY-MM-DD, so its behaviour is unchanged.
- R28 (N961): the twelve rows C-73.2-.5, C-90.2, C-90.6, C-117.39, C-117.48-.52 name src/action-records/index.mjs <fn> > <region>, as R28 lists them. Code, number, translation and region are unmoved; no other row moved (C-32.21 stays #seeksFence). golden.json and t45-rows.mjs follow. Rows named awaiting stamp (T48) in my record.
- New t47.test.mjs (R27 x5, R28 x4). Module 72/73: the one red is R28's census arm, exactly those 12 rows, "src/action-records/index.mjs is not held" (T47-37 not merged). I re-run on the CHANGE. Negative control against tranche code: 3 of the new tests fail.
- Red my merge opens in actions (not in rule 5's list, K2704): acts.test.mjs:205 (C-90.2 where pinned to actions) and t45.test.mjs:567 (RECEIPT_NOT_ON_SENT's row looked for under actions). Both pin arms T47-38 moves to action-records (split map 6). actions is 121/0 before and 119/2 after.
- My reading of R28's census fixture: row-census-1.74.0.jsonl is promotion's, so I did not write it. "The census fixtures following" means T48's stamp. The census adds exactly my 12 rows as changed (rule 5 (2)).
- Users' other reds (action-replies 6, affordances 7, answer-envelope 8) are identical on tranche/T47. Plane bundle stale (rule 5 (4)).
- Checks: format, architecture, coverage (28/28), ownership (9 files) all 0 failures. run.mjs: architecture 0, coverage 36 (others', rule 5 (1)).
Details in my record.
