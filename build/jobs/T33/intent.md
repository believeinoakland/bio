# intent (T33)

**Status** · session_01HwKBgK9AA2JTXEF7K2WRpT · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Readings for T33-58 (R4, R31); I am building on them now, and none of them blocks the work.
(1) **uses.** `modules.json` gives intent no `money` and no `calc-grammar`, but R31 calls `money.moneyOf` and `money.summable`, and compares in calc-grammar's exact decimals. Reading: intent's uses gain **money** and **calc-grammar**, both imported directly. The comparison uses calc-grammar's `add` (R4) and `relate` (R10's relation of two figures; it lives in `calc-grammar/decimal.mjs`, the same file money imports `readingOf` and `cmpD` from). Until `modules.json` carries both edges, `architecture.mjs intent` is red on those two imports. Please add them, or tell me to route the comparison differently.
(2) **What is compared.** One total per matched instance: all the facts `moneyOf({entity: <instance entity>, kinds, phases, period, limit: 500})` answers, totalled with `add`. This is the Suggestions' draft reading, as in F1's "how much of the fund's spending". `min` and `max` are inclusive. The instance passes when its total's reading lies wholly within the bounds; it fails, and is excluded like an `entity_kind` miss, when the reading lies wholly outside. Otherwise it is undetermined. A rounded total is read across its half-unit and an approximate one settles nothing (both are `relate`'s rules), so neither is ever counted as a figure it may not be. A range fact is added as a range.
(3) **Undetermined, never zero (R31, R4).** Any of these makes the instance undetermined, never excluded: `summable` refuses (its code and detail are carried), `moneyOf` lists an undetermined-period fact, `moneyOf` answers `truncated` or refuses (for example a period money cannot map, `BAD_PERIOD`), or the facts' currency differs from the filter's (`UNIT_MISMATCH`). So is an instance with **no** money fact in the named kinds, phases and period: the record holding none is not a total of zero.
(4) **Sight (R5: counts are the same for every reader).** The total is taken under the plane's sight (`class:daemon`), so `matched`, `meeting` and the rest do not change with the viewer. Beside each instance the answer gives `amount: {total, currency, facts, passes, why?}`. A fact the viewer may not see is listed as null, as R5 does for bundle ids.
(5) **Shape at setCondition (R2's `CONDITION_UNREADABLE`).** `amount` is a map of `min?`, `max?`, `currency` (required), `kinds?` (money's closed kinds), `phases?` (money's closed phases) and `period?` (money's period fields). `min` and `max` are exact decimal strings or safe integers, never other numbers. At least one bound is required, and `min` ≤ `max`. Anything else gets CONDITION_UNREADABLE, the same code with a fuller detail. It is stored flat under `objective_condition` as `amount_*` keys, because the front matter has only one level of map, so it can never collide with a member's `filter_*` key.
(6) **The named red (K1568, K1586).** The fixture gives the plane-built world a stand-in for `events` (`datedFactsFor` in its R27 shape) and a `zoneOf`, so the need is dated by its own dated fact, not a reading. Separately, intent's proposal basis now carries progressions' `overdue_count` and `overdue_undetermined_count` beside `overdue`, so an undetermined overdue never reads as "not overdue".

## Record of completion (INTENT #12)

**Entries applied (T33-58; K1471, K1522; J1 readings as B2 answered, K1625):** R4 (the record evaluates two filter keys: `entity_kind` and `amount`; any other key is kept and makes the instance undetermined, never excluded). R31 (`filter.amount: {min?, max?, currency, kinds?, phases?, period?}`):
- For each matched instance the module reads `money.moneyOf` for the instance's entity, under the plane's sight so every reader's counts are the same (R5), with the named kinds, phases and period and limit 500. It asks `money.summable`, totals with calc-grammar's `add` in exact decimals, and compares inclusively with the bounds.
- The comparison uses calc-grammar's own reading of a figure (`readingOf`, `cmpD`, `dec` from `calc-grammar/decimal.mjs`), not `relate` as J1 said. `relate` answers "undetermined" for a range that only touches an inclusive bound. The rules are the ones J1 stated: a rounded total is read across its half-unit, an approximate one settles nothing, and a range is added as a range.
- The instance passes when the total's reading lies within the bounds. It is excluded when the reading lies outside them. It is undetermined, with why, never excluded and never zero, when `summable` refuses (its code is carried), a fact's period has no end, `moneyOf` cuts or refuses (for example `BAD_PERIOD`), the currency differs, the total is approximate, the reading lies across a bound, or no fact is held.
- `amount: {currency, min, max, total, facts, passes, why?, code?}` is answered beside the instance. A fact the viewer may not see is null. Nothing is stored (R19).
- R2's `CONDITION_UNREADABLE` covers the amount's shape: at least one bound, each an exact decimal string or a safe integer, `min` ≤ `max`, money's closed kinds and phases, and money's period fields. The refusal carries `amount_why`. The amount is written flat as `amount_*` keys under `objective_condition` and reads back unchanged.

**The named red (K1568, K1586):** `invariants.test.mjs` "R15 R16 (N179)" is green. The fixture now builds the real `events`, with extraction and content under it, and the test profile `test-port-ellery`, whose zone progressions reads through local-facts (no stub `zoneOf`). The need is dated by a dated fact recorded through `events.recordDatedFact`. A new arm shows an undated need's award is counted `overdue_undetermined_count: 1`, never "not overdue".

**Improvement in my module:** the proposal basis carries progressions' `overdue_count` and `overdue_undetermined_count` beside `overdue` (B2 (6)). `overdue` is now `g.overdue === true` rather than a truthiness test.

**Deferred:** none.

**Found in other modules:** none. The six failures in the users' tests are all on BOB's named list (below).

**Final uses:** record-grammar, record-core, membership, promotion, provenance, entities, progressions, retrieval, inquiry, ai-runs, capture-requests, credentials (unchanged), plus:
- **money** and **calc-grammar**, imported by the code (B2 (1)).
- **events**, **extraction** and **content**, imported only by `fixture.mjs`, so the real events dates a stage (B2 (6)) and money's facts are recorded over the real modules.

Architecture's 7 failures are these five edges, until they are set at the merge.

**Tests and checks (on `job/T33/intent` @ 610d8c466c):**
- intent: 73/73 pass, three runs in a row. `amount.test.mjs` adds 8 tests over the real money.
- Users of intent (monitoring, scheduler, affordances, queue-producers, control-plane, plane): 662/668. All six failures are on the START's named list: affordances `catalogue.test.mjs` "62 ops" and "N364's ops"; control-plane R43 pin, R26 sources' ops and `families.test.mjs` "CHECK_FAMILIES is total"; scheduler R12 (capture-requests `plane.test.mjs`, AI_NO_ACCOUNT).
- `format`: 0 failures. `architecture`: 7 failures (the edges above). `coverage`: 31 of 31 live ids. `ownership`: 0 failures.

Size (session_01HwKBgK9AA2JTXEF7K2WRpT): test runs 24, module lines 2119

## J2 · COMPLETE

T33-58 applied (R4, R31 over the real money; J1 as B2 answered). The named red is green: the fixture dates the need through the real events (B2 (6)). intent 73/73. Users 662/668, every failure on the START's named list. format, coverage (31/31) and ownership are clean. architecture has 7 failures, all on the uses edges to set at the merge: money and calc-grammar (code); events, extraction and content (fixture only). Details are in the Record of completion, on job/T33/intent @ d8f2aa421a.
