# actions (T33)

**Status** · session_01NJ3oEE5VB1ykNEwnTexhdw · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Readings I am building on (T33-73); none stops the job. Answer only where you disagree.
(1) R12's zone: retrieval R53 calls `fn(bundleMd, nowMs)` and passes no zone. `actionFacts(documentText, nowMs, zone)` stays pure with the zone as its third argument; the function this module registers with retrieval passes the active view's `time_zone` at call time. No zone held: `clock_overdue` null. "Close of business": a clock entry whose `basis` says "close of business" (case-folded) is due at the latest `close` of the counterparty office's `hours` (the view's `counterparties` entry for its role and body) on the entry's weekday, minute precision, through `civil-time.overdueOn` side `body`; no hours: the day. R25's read, R33's mechanical fence and the lifecycle read use the same local day; with no zone R33 treats no entry as past (every machine status move refused).
(2) R9's bridge: no profile entry carries an office identifier, so "the office entity seeded for {role, body}" is found as the one `office` entity holding the role's fold as an alias (`entities.entitiesByAlias`) with a live `post_in` line (`lines.linesOf`) to an entity holding the body's fold. Exactly one: filled. None or several: written without, the answer saying which. Filled where this module writes the bytes (`actionCreate`, whose answer gains `addressee: {entity_id, filled, says}` for an office arm); a document promoted directly is held as written (a step cannot change bytes), and the read resolves the bridge at read time, labelled so. "The action's date" (R9's holder, R64's in-force, R65's status) is the first `sent` entry's `at`, else the `created` day, answered as `as_of` with its basis.
(3) R66/R67: events R30 calls a source with `{set, from, to, limit}` and duties R16 with `{duty, from, to}`: neither passes a viewer. My sources honour `viewer` when given and otherwise answer nothing (fail closed, R36). That leaves both registrations empty in practice until events and duties pass their reader's viewer; I am REPORTing it as their flaw.
(4) R62: `subject` is an `ENT-` id, or a bundle id read through the entities its captures resolve to at an established grade (entities R35's read contract). Op `addresseesuggest`; a missing subject is `NO_SUBJECT`. R64: a records-request law names its standard as the document key `law_standard`; a malformed or unseen standard id is `NO_SUCH_STANDARD` through `standards.noSuchStandard`; `actionLawsPropose` takes `standard` per entry, stored in a new column. R65: new codes `MACHINE_CANNOT_SET_PROCEEDING` and `NOT_A_PROCEEDING`. None of the new codes has a catalogue row: their rows are action-grammar's (C-117) at the stamp (REPORT to follow).

## J2 · REPORT

Findings outside actions (T33-73), against each module's requirements:
(1) action-grammar (for ACTION-GRAMMAR #6, as K1649 routes): rows wanted in C-117 for the codes actions now mints without one: `NO_SUBJECT` (R62, `addresseeSuggest`), `MACHINE_CANNOT_SET_PROCEEDING` and `NOT_A_PROCEEDING` (R65). Also its `ENTITY_ID_RE` (checks.mjs:43) is still `^ENT-\d{4}-\d{4}$`, so an office arm's `entity_id` of five counter digits is refused against actions R9 ("the registry's ENT- form, record-grammar's idPattern"); and `checkActionExtension` (checks.mjs:718) reads past-due on the UTC day, where K1444 (iii) gives the office's local day (actions passes `nowMs` only; a `zone` argument would let the audit read it as R12 does).
(2) Reds my change makes, both from R12/R33's local day (K1444 (iii)), not from a flaw of mine:
  - escalation `stages.test.mjs:43` (R6, stage 3 → 4 by the clock): escalation calls `actionFacts(text, nowMs)` with no place, and R12 now answers `clock_overdue: null` without a zone. Fix in escalation: pass the view (`actions.place()` or the combined view) as the third argument. Its entry T33-76 does not name this; it needs a CHANGE.
  - monitoring `understanding.test.mjs:480` (R50): its wake is the UTC day after the entry, and R33 now lets the machine mark an entry overdue only once the office's local day has ended (Halifax: 03:00 UTC). This is T33-78's own "C-3: R34 on the local day".
  Every other user of actions (action-clocks, filings, action-plans, affordances, queue-producers, queue, instance-setup, control-plane, plane) fails exactly the tests it failed before my change, by name.
(3) New op `addresseesuggest` (R62, a read for every signed-in class) and the `proceeding` filter of `op=actions`: op-declarations, control-plane and affordances will need them declared (T33-85/88/89).
(4) Events R30 and duties R16 pass no viewer to a source (N595, as answered); until then actions' two sources answer nothing.

## J3 · COMPLETE

T33-73 applied, on K1649's accepted readings (J1).
Entries applied:
- R61 (S0-5/B0.9): `PLAN_ID_RE` is record-grammar's `idPattern("PLN")` core plus the slug; no pattern of actions' own.
- R12, R25, R33 (C-3, K1444 (iii)): `actionFacts(text, nowMs, place)` reads `clock_overdue` on the office's local day (`civil-time.overdueOn`, side `body`), "close of business" at the close of the office's hours; null with no zone, never UTC. The function registered with retrieval passes the active view. The read, the lifecycle and the mechanical fence use the same local day (no zone: no entry has passed).
- R15: `BAD_DATE` through `civil-time.isCalendarDate` (2026-02-31 refused).
- R9 (B1a.14; K1484 row 5): an office arm's `entity_id` names an office entity (a person, another kind or an unheld id is refused, arm named); `actionCreate` fills it from the bridge (one office entity for the role and body with a live `post_in` line), else writes without and says `none`/`ambiguous` in its answer's `addressee`; the read shows the entity (stated, or the bridge at read) and `holder_on_date` from `lines.holderAt`, labelled as who held the office, never the addressee; `as_of_date` is the first sent entry's day, else the creation day.
- R63 (C-8 plane half): a new `{state: named, name}` is refused `COUNTERPARTY_REFUSED` with findings through `actionCreate`, `op=actioncreate` and `op=promote`; nothing stored; a held one reads as written.
- R64 (K1446): a governing law (`actionLaws`, `actionLawsPropose`, new column `action_law_proposals.standard`) and a records-request law (`law_standard`) may name a held standard; unseen or malformed answers `standards.noSuchStandard`; the citation stays the member's; the read's `law_standards` gives each with its in-force state on the action's date. A machine states neither.
- R65 (C1): `proceeding` set/changed by a member only (`MACHINE_CANNOT_SET_PROCEEDING`), an entity of kind proceeding (`entities.noSuchEntity`, `NOT_A_PROCEEDING`); read with `events.proceedingStatusAt` on the action's date; `actionsFor` and `op=actions` filter by it.
- R62 (A ORG): `addresseeSuggest` / `op=addresseesuggest`: the offices `custodian_of`/`responsible_for` a subject (an entity, or a record through its established resolutions) on the action's date or today, as R9's office arm with the line and both grades; undetermined apart; writes nothing.
- R66: `eventSource` registered once with `events.registerEventSource`; R67: `triggerSource` registered once with `duties.registerTriggerSource`. Both honour `viewer` and answer nothing without one (N595).
Deferred: none in this module.
Found in other modules: J2 (action-grammar rows for NO_SUBJECT, MACHINE_CANNOT_SET_PROCEEDING, NOT_A_PROCEEDING; its ENTITY_ID_RE still four digits; its audit's UTC day; escalation `stages.test.mjs:43` and monitoring `understanding.test.mjs:480` red from the local day; `addresseesuggest` to declare).
Final uses: record-grammar, jurisdictions, civil-time, record-core, membership, promotion, provenance, content, connections, retrieval, inquiry, conformance, entities, lines, events, standards, duties, action-grammar, capture (adds civil-time, lines, events, standards, duties; architecture's 6 failures are exactly these edges, K1563 (1)).
Tests (after merging tranche/T33 @ 554876bb8b): actions 87 pass, 0 fail (new `t33.test.mjs`, 12 tests; read/t18 tests re-pinned to R12's local day and R9's narrowing). Users of actions: action-plans 53/0, queue-producers 80/0, queue 113/0; escalation 51/1 and monitoring 110/1 (new, J2 (2)); action-clocks 29/3, filings 58/2, affordances 164/3, instance-setup 90/4, control-plane 155/4, plane 82/3: the same tests by name as on the tranche before my change (the named inherited reds).
Checks: format 0 failures; architecture 6 failures (the uses edges above); coverage 55 of 55, 0 failures; ownership 7 files, 0 failures.
Size (session_01NJ3oEE5VB1ykNEwnTexhdw): test runs 14, module lines 3327

## J4 · COMPLETE

B3 (K1657) applied: R51's audit arm is handed `ctx.zone`, the zone of the action's office as R12 reads it (`zoneOf(place())`; null with none held), so action-grammar R7 reads a pending entry past its date on the office's local day.
Test: `t33.test.mjs` "R51 the audit's arm is handed the zone …" (Halifax 23:00 on the dated day not past, the next local day past; no zone, never past). It is red against action-grammar as it stands on tranche/T33 (R7 not yet built there: actions 87 pass, 1 fail, this test). Checked against a local, uncommitted stand-in of R7 as written (the local day through `ctx.zone`, none past without it): 88 pass, 0 fail; the stand-in reverted. It turns green when ACTION-GRAMMAR #6 merges.
Checks after merging tranche/T33 @ a3bf52a471: format 0 failures; architecture 0 failures (uses set at K1657); coverage 55 of 55; ownership 3 files, 0 failures.
Size (session_01NJ3oEE5VB1ykNEwnTexhdw): test runs 17, module lines 3328
