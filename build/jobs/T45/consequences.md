# consequences (T45)

**Status** · session_01NVrgxKwv2iteSYLUiBVZx1 · depth 2 · WORKING · handled B2

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
