# conformance (T35)

**Status** · session_016Bjc5tpJNX89ingrG1hp72 · depth 2 · WORKING · handled B0

## J1 · QUESTION

Readings for T35-61 (R27–R29); I carry on with them unless you answer otherwise.
1. R29 and `calculations.read`: `read` is async (its R8–R10), `determine` and `comparisonPropose` are synchronous and called synchronously by filings, actions and action-plans tests. Reading: each answers synchronously as today, and answers a Promise of the same answer only when a row's `did` is a measure `{calc, result_key}`; the measure is read before R1's checks run (a read, nothing written), its refusal answered at the rows' place. The measure (result, denominator, population, derivation, result key) is held on the row as read at the write, never re-composed; reads stay synchronous.
2. R29 `result_key`: held as given; when it differs from the calculation's stored result key, the row says so (`result_key_differs`) and is not refused. "The result" is the calculation's `output`; denominator from `results.application.denominator` or a ratio/share output's `denominator`; population from `results.application.population`. Neither: `MEASURE_NO_DENOMINATOR`. Absent/unseen calc: `{ok:false, reason/code NO_SUCH_CALCULATION}` with calculations' own sentence, no catalogue row of mine.
3. R27 `<body>`: the actor's `body` as given (an entity id or the issuer's name, matched as `bindsAt` matches an issuer); a comparison actor naming an organisation and no `body` uses its `entity_id`. Bindingness is read at each of R3's dates: all `binds` → true; all `benchmark` → false; anything else → `undetermined` with why. A pre-T35 determination answers `binds: "undetermined"`, "recorded before bindingness was read".
4. Order: `STANDARD_NOT_BINDING` right after `OUTCOME_UNKNOWN`, then `BENCHMARK_CALLED_NONCONFORMING`, then `UNCLEAR_NO_QUESTION`. In `comparisonPropose`: R25/R28's act refusals after `NO_SUCH_CONTRADICTION_INQUIRY`, then R29's, then `BENCHMARK_CALLED_NONCONFORMING`.
5. R28: a comparison's actor needs `entity_id`, or `role` and `body` (else `ACT_INCOMPLETE`, part actor); evidence stays optional for a comparison, as today. An `entity_id` not held is `ACTOR_NOT_AN_OFFICE_OR_ORGANISATION`.
6. Effect beyond my module: R27 refuses `noncompliant` whenever `bindsAt` is not `binds`, so other modules' tests that determine `noncompliant` against a standard whose issuer is not the actor's body will turn red. I will measure which and REPORT them.
