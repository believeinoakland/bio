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

## J3 · COMPLETE

**T45-24 applied on `job/T45/consequences` (head 0fab488e48), with conformance (T45-23, K2852) merged in.**

**Read whole by me (P20):** `build/requirements/consequences.md`; all four files of `src/consequences/`; all seven test files and the fixture; T45-24, rule 4 and reconciliation R3, R20 in the plan; the l9a draft's "consequences" section and its doubts; K2780, K2781, K2787; `BIO_Action_v0_2.md` §3 (Consequence, Success record) and rules 1, 16, 17; layer 9's contract.
From the providers I read whole the services I call: conformance R9, R19, R20, R33, R36, R37 and their code; case-authoring R71 and `carryOutcome`; civil-time R6 and `parseEdtf`; membership R78, R81.
How the over-limit set was read (mechanics §17 (3)): one helper read in full the requirements of the later users (actions, escalation, action-plans, plan-work, op-declarations, plane, filings, and affordances where it names this module), then wrote a digest citing each section. Its findings went into J1 and J2.

**Entries applied**
- **R1:** after `DETERMINATION_SUPERSEDED`, a void determination (conformance R33's `void`) refuses a new part and a revision through `conformance.determinationVoided`, writing nothing. Parts already held stand and read as before.
- **R9 amended:**
  - `words` holds at most five distinct entries of the frozen `ADDRESSED_WORDS`, and only on `addressed` (`ADDRESSED_WORD_REFUSED`).
  - A key `percent`, `percentage`, `share`, `ratio` or `score` anywhere in the statement, or a `%` in `words`, is refused `ADDRESSED_NO_PERCENTAGE`.
  - The reason is required for both states: `ADDRESSED_NO_REASON`, and `ADDRESSED_BAD_REASON` over 2,000 characters.
  - Words are stored in a new `words` column (migrated) and answered on the part.
- **R17–R21, R23:**
  - `successRecord`, `successRevise`, `successRecordRead`, `successRecordsFor`, and `successFigure` (R18's machine-computed figure for a member to adopt).
  - Rows in `success_records`, ids `SUC-<year>-<4 digits>` (B2, K2845), fenced by project and declared to purge. Promotion is deferred to N911.
  - Figures are computed by R2's own path, in figure mode: their unit is the arithmetic's own, and they are recomputed on revision.
  - The cause is checked through `registerOwnActReader(fn, module)` (one registration, `listenerRefusal`). With no reader, or one that throws or answers no list, a cause is `SUCCESS_CAUSE_UNCHECKABLE`.
- **R22:** `outcomeCarry` with `{success}`, `{addressed: part}` or `{cure: {determination, standard}}` (B2; `curesOf`'s pinned shape, K2850).
  - It passes only text and cites to `case-authoring.carryOutcome`, inside one transaction, and appends a row to `consequence_carries`.
  - New rows: `CARRY_NOT_ADDRESSED` and `CARRY_NO_CURE` (B2).
- **Ops:** `successrecord`, `successrevise`, `successread`, `successrecords`, `outcomecarry`.
- **Rows:** C-114.23 to C-114.44, in the Rows line's order, then the two from B2.

**Also fixed (my module):** R2's weakest-grade rule is now one function, `#weakest`, shared by parts and figures. `NO_REASON`'s translation now says "A revision says why." (it no longer covers an addressed record).

**Deferred:** R17's "record object of its own type" goes to N911 (B2). Until record-grammar registers `success_record`, nothing is promoted.

**Found in other modules** (sent in J2): affordances T45-39 (the layer-9 op count, and R19's `JUSTIFICATION_REFUSALS`); op-grades T45-38 (add `ADDRESSED_NO_REASON` and `SUCCESS_NO_REASON`, and grade `successrevise` `reasoned`); op-declarations T45-45 (specs for my five ops).

**Tests**
- consequences: 55 pass, 0 fail.
- The fixture still stands in conformance's `determinationRead` and `curesOf`, as before. It now mirrors their real answer shapes (K248, K2850): `void: {causes, says}`, `act.when` as a date-time, findings as `{finding}`. The real code was read against them.
- Users, against `tranche/T45`:
  - escalation 63/0.
  - filings 69/1 (R9, rule 4 (7)).
  - actions 109/2 (R52, R57: the same on the tranche itself, so not mine).
  - affordances 222/4 (2 rule 4 (11); 2 mine, J2).
  - op-declarations 132/1 (already red; it gains my ops).
  - op-grades, action-plans, plane, control-plane, answer-envelope, queue-producers and monitoring: no new red.

**Checks** (civicos-process)
- format: 153 modules, 152 requirements files; 0 failures.
- architecture consequences: 14 product files, 59 relative imports; 0 failures.
- coverage consequences: 23 of 23 live requirement ids named by a test; 0 failures.
- ownership consequences tranche/T45: 10 files changed; 0 failures.

Size (session_01NVrgxKwv2iteSYLUiBVZx1): test runs 16, module lines 2058
