# conformance (T35)

**Status** · session_016Bjc5tpJNX89ingrG1hp72 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Readings for T35-61 (R27–R29); I carry on with them unless you answer otherwise.
1. R29 and `calculations.read`: `read` is async (its R8–R10), `determine` and `comparisonPropose` are synchronous and called synchronously by filings, actions and action-plans tests. Reading: each answers synchronously as today, and answers a Promise of the same answer only when a row's `did` is a measure `{calc, result_key}`; the measure is read before R1's checks run (a read, nothing written), its refusal answered at the rows' place. The measure (result, denominator, population, derivation, result key) is held on the row as read at the write, never re-composed; reads stay synchronous.
2. R29 `result_key`: held as given; when it differs from the calculation's stored result key, the row says so (`result_key_differs`) and is not refused. "The result" is the calculation's `output`; denominator from `results.application.denominator` or a ratio/share output's `denominator`; population from `results.application.population`. Neither: `MEASURE_NO_DENOMINATOR`. Absent/unseen calc: `{ok:false, reason/code NO_SUCH_CALCULATION}` with calculations' own sentence, no catalogue row of mine.
3. R27 `<body>`: the actor's `body` as given (an entity id or the issuer's name, matched as `bindsAt` matches an issuer); a comparison actor naming an organisation and no `body` uses its `entity_id`. Bindingness is read at each of R3's dates: all `binds` → true; all `benchmark` → false; anything else → `undetermined` with why. A pre-T35 determination answers `binds: "undetermined"`, "recorded before bindingness was read".
4. Order: `STANDARD_NOT_BINDING` right after `OUTCOME_UNKNOWN`, then `BENCHMARK_CALLED_NONCONFORMING`, then `UNCLEAR_NO_QUESTION`. In `comparisonPropose`: R25/R28's act refusals after `NO_SUCH_CONTRADICTION_INQUIRY`, then R29's, then `BENCHMARK_CALLED_NONCONFORMING`.
5. R28: a comparison's actor needs `entity_id`, or `role` and `body` (else `ACT_INCOMPLETE`, part actor); evidence stays optional for a comparison, as today. An `entity_id` not held is `ACTOR_NOT_AN_OFFICE_OR_ORGANISATION`.
6. Effect beyond my module: R27 refuses `noncompliant` whenever `bindsAt` is not `binds`, so other modules' tests that determine `noncompliant` against a standard whose issuer is not the actor's body will turn red. I will measure which and REPORT them.

## J2 · REPORT

What R27 turns red outside conformance, measured on job/T35/conformance against tranche/T35 (each module's tests before and after):
- **filings: 4 new reds**, all its fixture's determinations refused `STANDARD_NOT_BINDING` (filings R3, R15, R18, R21): `prepare.test.mjs`:106 and `reads.test.mjs`:123 (the act's event is placed nowhere, so no date binds), `reads.test.mjs`:94 (S3 is the Selectboard's own but its period has no end), `reads.test.mjs`:106 (an ordinance not shown to bind "Nowhere Harbour"). The fix is filings' fixture: a dated act event, and a standard that binds the actor's body (issued by it with a closed period, or an adoption/imposition recorded in standards). FILINGS #15 can carry it in this layer once conformance merges.
- consequences, actions, escalation, action-plans: 0 new reds. action-clocks (2), affordances (2), control-plane (4): the same failures before and after (inherited reds).
- **A finding for standards (R20 with R43), against its requirements:** `inForceAt` answers `undetermined` for a standard whose period has `to: null` ("the record does not state when it ceased to be in force"), and `bindsAt` carries that undetermined into "is it the body's own". So a standard with an open-ended period (most standards in force today) never answers `binds`, and conformance R27 then refuses every `noncompliant` against it. R3 accepts an undetermined force; R27 does not accept an undetermined binding. Whether an open end should read as in force for `bindsAt`, or R27 should accept a binding undetermined only by an open end, is yours.
- Generated artifact: my change stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, which embeds conformance), regenerated at L9's close (§14).

## J3 · COMPLETE

**Entries applied.** T35-61 whole (N651; K1723, K1713, K102), on the readings K2019 confirmed (J1):
- R27: each standard's bindingness on the act's body read through `standards.bindsAt` at R3's dates, held per standard (`body`, `binds`, its why and what it rests on) on determinations and comparisons, labelled "Standard · binds <body>" / "Benchmark · not binding on <body>"; `STANDARD_NOT_BINDING` (C-113.32) for `noncompliant` unless it binds (undetermined refused the same); `BENCHMARK_CALLED_NONCONFORMING` (C-113.33) over row text and questions; `diverges` against a benchmark answered "below the benchmark"; `binds` never taken from a proposal; rows written before T35 read `undetermined`.
- R28: `comparisonPropose` takes the act as R25 (event read, `ACT_NO_EVENT`, `NO_SUCH_EVENT`, `ACT_NOT_AN_EVENT`) with an office or organisation actor (`ACTOR_KINDS`), `ACTOR_IS_A_PERSON` (C-113.34), `ACTOR_NOT_AN_OFFICE_OR_ORGANISATION` (C-113.35); `determine` keeps `ACTOR_NOT_AN_OFFICE`.
- R29: a row's `did` may be `{calc, result_key}`, read through `calculations.read` (the act then answers a Promise), held with result, denominator, population and derivation; `NO_SUCH_CALCULATION` as calculations answers it; `MEASURE_NO_DENOMINATOR` (C-113.36); "practice" never said.
- `modules.json`'s calculations edge used (`calculationsOf`). Additive columns for stores made before T35. Rows C-113.32–.36 await stamp (red 2).
- Refactor: the act's event resolution is one method, shared by determine and the comparison.

**Deferred.** None.

**Found in other modules** (J2 REPORT): filings' fixture, 4 tests red from R27 (its determinations against standards not binding the body); standards R20/R43: an open-ended period never binds, so no `noncompliant` against it (yours to rule); the plane bundle staled.

**Tests and checks.** `node --test bio-plane/test/m/conformance/`: 76 tests, 76 pass, 0 fail (10 new in `t35.test.mjs`; R27, R28, R29 each named). Users before/after: consequences 0/0, actions 0/0, escalation 0/0, action-plans 0/0 fail; filings 0/4; action-clocks 2/2, affordances 2/2, control-plane 4/4 (inherited). `format`: 0 failures. `architecture conformance`: 0 failures. `coverage conformance`: 29 of 29 live ids, 0 failures. `ownership conformance tranche/T35`: 10 files, 0 failures.

Size (session_016Bjc5tpJNX89ingrG1hp72): test runs 14, module lines 2083
