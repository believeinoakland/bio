# money (T36)

**Status** · session_01AzpG9vAgA5NEhFJGqSdSUx · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Two readings I am building on; tell me if either is wrong.
1. R24 and a fact whose source is a canonical table's row (R4's machine write, `{table, row, binding}`): it cites the capture the table was read from (R19's `source_capture_sha`) but no part in `content`'s extent grammar. My reading: it is an item, its `extent` read as `document` (events R49: "a citation naming no part is read as `document`"), so "who recorded something from this capture" names the machine's table-row facts too; with an `extent` filter its relation is whatever `extentRelation(extent, {kind: "document"})` answers. The alternative is to leave table-row facts out of R24 entirely.
2. R25 `moved` for a non-actual fact with several concerned events: `when` is the date of the one concerned event that has a date, and null when none or more than one has a date (I never choose between them). `compared` only counts included `actual` facts that are not withdrawn (R7: a withdrawn fact is never counted). The trail rows sit beside each inclusion and each open proposal of a `trail` set only. An attribution set's `readSet` is unchanged.

## J2 · COMPLETE

**Entries applied.** T36-16 (N715 money's share; N728 data share; U108, U110–U114), on J1's readings as B4 (K2117) confirmed, with K2114 and K2116 (B2, B3) applied after merging `tranche/T36` @ a263514dc1.
- **R24** `recordedBy({captureSha, extent?, limit?, viewer})`: events R49's shape over the facts whose source is an extent of the capture (`kind: "money_fact"`, `field: "source"`, `by`, `at`, `withdrawn` per R7). A fact on a fact is no item. A table-row fact is an item with its extent read as `document`. `extent` filters by `content.extentRelation` (same, narrower, wider). Items are ordered by the canonical extent string in code-unit order, then record. Limit 1–500 (default 100), with `truncated`. Sight is R21's: a viewer membership refuses gets `items: []`. `VIEWER_MISSING` and `EXTENT_MALFORMED` take the shape `{ok: false, refused, code, reason, why}`, with no catalogue row. `NO_SHA` is also a refusal. It is an in-process read with no ops arm, as R49 says. It writes nothing and never throws.
- **R25** In `readSet` of a `trail` set, each inclusion and each open proposal carries `trail: {from, to, moved, compared?, budget_only?, adjustments, gaps}`:
  - `from` and `to`: the party as stated, with `grade.parties`, or `{stated: false, says: "not stated in this source"}`.
  - `moved` comes from `events.readEvent` and is never taken from the period. For an actual fact it is `dated`, with `when`, `event` and the governing attestation. When several events are concerned, the single payment or transfer among them is used. Otherwise it is `undetermined`, with `why` (and `events` when several). For any other phase it is `did_not_move`.
  - `compared` (non-actual facts only): each included, non-withdrawn actual fact sharing a `concerns` id, with `reconcile`'s answer.
  - `adjustments` are listed beside the fact and never netted.
  - `gaps` lists any of from, to, moved and basis.
  - Attribution sets are unchanged. Nothing is written.

**Deferred.** None. The screens are left out by the plan (N672).

**Other modules.** Nothing to report. `money_facts` and R19's read contract are unchanged, so no generated artifact is stale.

**Reading set (§17, N739).** I read these whole: my requirements; layer 5's row of `build/layers.md`; the plan's rules and my entry; K2092, K1941, K1988, K1430 and K2063; all of my code and tests (the M-M1 CSV, a data fixture, excepted per K2053); the Purpose of each used module; events R9, R10, R26 and R49 (as amended by K2114 and K2116) and `readEvent`'s code; content R2, R5 and R6. That is about 200 KB, under 300 KB, so I used no workers and no summary.

**Tests and checks.**
- `node --test bio-plane/test/m/money/`: tests 70, pass 70, fail 0. New files: `recorded.test.mjs` (R24, 4 tests) and `trail.test.mjs` (R25, 9 tests); the fixture gains `datedFact` and `datedEvent`.
- Users of money, on the first commit:
  - 0 fail: money-checks 46, duties 49, people 40, explore 27, query-language 45, retrieval 153, calculations 47, strength 143, contradiction 119, intent 74, corpus-export 25, ratification 213, case-disclosures 59, case-authoring 151, consequences 41, affordances 208, plane 130.
  - op-declarations: 90 pass, 3 fail. All three are accepted reds 13 and 17 (`t33.test.mjs`:192, `t34.test.mjs`:135, `t35.test.mjs`:196); I added no op.
- After the R49 change: retrieval 153, explore 27, calculations 47 and money-checks 46, all 0 fail.
- Layer tests: none (manifest).
- Checks: `format: 135 modules, 134 requirements files; 0 failures`; `architecture: 15 product files, 41 relative imports (…); 0 failures`; `coverage: 1 modules, 25 of 25 live requirement ids named by a test; 0 failures`; `ownership: 5 files changed by money between tranche/T36 and HEAD; 0 failures`.

**P6.** 1,430 module lines (`src/money/`), well under about 4,000.

Size (session_01AzpG9vAgA5NEhFJGqSdSUx): test runs 16, module lines 1430
