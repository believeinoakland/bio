# consequences (T45)

**Status** · session_01NVrgxKwv2iteSYLUiBVZx1 · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Three points the requirements leave open; I build on my best reading of each meanwhile.

1. **R17 "a record object of its own type (R14's pattern)".** R14's pattern needs `record-grammar` to register the type (an `ids.mjs` prefix row, `types.mjs` `OBJECT_TYPES`, `document.mjs` `STATES` with the one state `recorded`). No T45 entry asks that of `record-grammar` (L1), and I may not change it. *Best reading:* until the type exists, a success record is held as append-only rows of my own tables: id `SUC-<year>-<4 digits>` minted by `record-core.mintOpaqueId`, fenced by its project (R13's rule), declared to purge keyed by that id. Nothing is promoted, and R17's "record object" clause is deferred in my record. When `record-grammar` registers `SUC-`/`success_record`, a later job of this module promotes each. Alternative: you open a `record-grammar` entry in T45 and I promote now.

2. **R22's `{cure: link}`.** `conformance.curesOf` (its R37) is read by determination, not by link id, and answers no act `when` or evidence. *Best reading:* `carry: {cure: {determination, standard}}` names the standing link through `curesOf`. `on` is the curing determination's act `when` (`determinationRead`), and `cites` are its findings (`{kind: "finding", ref}`). There may be no standing link, or a `{addressed: part}` whose latest statement is not `addressed` (or none). For those I propose two new rows in C-114: `CARRY_NO_CURE` and `CARRY_NOT_ADDRESSED`, placed after R22's existence refusals, each writing nothing. Say if you want other codes.

3. **R17's `matter` "(set by `action-plans`)".** Neither `action-plans` nor `plan-work` sets it, and plan-work names a matter `{plan, subject}`, not `{plan, matter}`. *Best reading:* I store whatever object is given, unread, as R17 says. The "set by" note is BOB's to re-point.

Reported, decided by me (no answer needed):
- Op names: `successrecord`, `successrevise`, `successread` (R20 one), `successrecords` (R20 list), `outcomecarry`.
- `successRecordRead` answers `live: true|false` beside `superseded_by`, which `actions` R93 and R8 (e) need.
- R20's last sentence: the read `actions` R93 uses is `successRecordRead`, not `successRecordsFor`.
- The five harm words are exported as one frozen `ADDRESSED_WORDS` (affordances R51).
- New rows take C-114.23 onward, in R9's and the Rows line's order.

## J2 · REPORT

Built on `job/T45/consequences`: R1 (void refusal), R9 amended, R17–R23 and R22 (with B2's and B3's rulings). My tests: 55 pass. The one red is `void.test.mjs` (R1), which imports `conformance.determinationVoided`, absent until conformance merges. I will switch to the named import and re-run on your CHANGE, then post COMPLETE. Checks: format, architecture, coverage (23 of 23) and ownership all show 0 failures.

New reds my change makes in later modules' tests. I compared each against `tranche/T45` (where a test was already red, the cause added is mine):
- **affordances** `catalogue.test.mjs` "R1 R12: … layer 9's op maps hold exactly its 41 mutating ops, 19 ungated reads … 62 ops". My five new ops break the count: `successrecord`, `successrevise`, `outcomecarry` (acts) and `successread`, `successrecords` (reads). That is T45-39's to re-pin.
- **affordances** `backing.test.mjs` R19, "consequencerevise and addressedrecord … refused without their reason with a code in JUSTIFICATION_REFUSALS". `addressedrecord` now refuses a missing reason with `ADDRESSED_NO_REASON` (R9 as amended), which is not in `op-grades`' `JUSTIFICATION_REFUSALS`. T45-38 should add `ADDRESSED_NO_REASON` and `SUCCESS_NO_REASON`, and grade `successrevise` `reasoned`.
- **op-declarations** `t33.test.mjs` "R19, R6" was already red. It now also lacks specs for my five ops (T45-45).
- No new red in: escalation, filings (R9 was already red under rule 4 (7)), actions, action-plans, op-grades, plane, control-plane, answer-envelope, queue-producers, monitoring.

For the plane (T45-47) and actions (T45-27): `registerOwnActReader(fn, module = "actions")` registers once, through `membership.listenerRefusal`.
