# sources (T47)

**Status** · session_01AiGMiDQpBd9gx4BdycAt9K · depth 2 · WORKING · handled B2

## Completion (SOURCES #15)

A restart: SOURCES #14 (session_012DLyugbYugm9hcAwhQQgJk) posted J1 and committed no code; this session took its record over (`mail start`), read B1 and B2 and did the job whole.

**Entry applied** · T47-13 (N947, N983, K3027, K3033, K3045): R20 and R8's T47 clause met.
- **R20** `sourceChangesSince({source, since, limit?, after?})`, in-plane, no route and no viewer: each disclosure of the source (R2, R6; a link is its `source`'s disclosure, not its `to`'s) and each consent and withdrawal (R7, R11) at an instant after `since` and at or before the read's instant (this module's clock), `{ok, source, since, at, changes, limit, truncated, next}`, each change `{at, act, entry}` only. Unknown source `NO_SUCH_SOURCE` (C-121.1), byte for byte R8's answer; a `since` that is not an ISO 8601 instant `{ok: true, source, changes: null, since_invalid: true}`; N90's bound (default 200, clamped 1…1000). Writes nothing, logs no read, binds no knock, never throws.
- **R8 (T47)** `op=sourcepublishable` passes no instant: a `now` or `at` in the query or the body is never read, so it answers at this module's own instant; the in-process `publishableAt` keeps its stated `at`.

**Details ruled here (mine, recorded for BOB)** · (1) An ISO 8601 instant is a date that exists, a time of day (seconds and a fraction optional) and a zone (`Z` or `±HH:MM`); a date alone, a local time with no zone, or a string only `Date.parse` reads is not one (`isInstant`, exported). (2) Recorded order: the instant, then at one instant disclosures before consents (a consent names an entry already appended), then each table's own order. (3) "After `since`" is judged to the millisecond, the instants held being millisecond-stamped; a fraction past it is dropped, which keeps "strictly after" exact. A `since` past year 9999 is after every change. (4) `next` names the last change answered (`d<seq>`/`c<seq>`); an `after` naming no change of this source reads as absent (from the first), as `capture` R45 reads an unknown cursor. (5) A store failure inside R20 answers `NO_SUCH_SOURCE`, as R8's does, so `case-carriage` R21 fails closed.

**Read** · requirements (whole); all module code (`index.mjs`, `checks.mjs`, `schema.mjs`) and every test file (`fixture.mjs` and the eight test files) whole myself; the public parts of record-grammar, record-core, membership, capture, doorbell and provenance; `layers.md` (its status, layer table and the layer-3 sections); my plan entry and the plan's rules at the opening. (`case-carriage` R21, the consumer, read for the interface.)

**Flaws looked for in my module** · none that touch a requirement. Considered and left: `publishableAt` accepts any `at` `Date.parse` reads (its refusal detail says ISO 8601); tightening it to `isInstant` would change what in-plane callers (`case-carriage`, `publication`) may pass, which no requirement asks, so it stays and is named here for a later entry if BOB wants it.

**Found in other modules** · none. No generated artifact of another module staled beyond the plane bundle (rule 5 (4)). `op-grades`' sentence for `sourcepublishable` ("at one instant") stays true.

**Tests and checks** (on `job/T47/sources` with `tranche/T47` merged, B2's R8 clause included)
- `node --test test/m/sources/`: tests 38, pass 38, fail 0 (8 new in `changes.test.mjs`: R20 ×7, R8's T47 clause ×1, its control the in-process `at`).
- Users of `sources`, after: people 46/0, reevaluation 141/0, case-carriage 80/0, publication 141/0, case-disclosures 97/0, store-door 45/0, control-plane 242/0; case-authoring 209/1, affordances 243/2, op-declarations 147/9, answer-envelope 32/1, each failing title identical with and without this change (rule 5 (7a), (7c)).
- `checks/format.mjs`: 0 failures; `architecture.mjs … sources`: 0 failures; `coverage.mjs … sources`: 20 of 20 live ids named, 0 failures; `ownership.mjs … tranche/T47`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 failures (3064 files), channels 0; coverage 43 failures, none sources'.

Size (session_01AiGMiDQpBd9gx4BdycAt9K): test runs 6, module lines 1080


## J1 · QUESTION

`sourcepublishable`'s `at`. The plan entry (T47-13, K3027/K3033) says `sourcepublishable` is evaluated at the server's instant, a query `now`/`at` ignored. `build/requirements/sources.md` (R8 signature `publishableAt({source, audience, at?})`, and the T47 suggestion) says the opposite: R8's `at` is a stated instant asked about, not N983's subject, "whether a caller may choose it is left as it stands". Requirements are the contract, so my best reading: leave `op=sourcepublishable` passing the query's `at` unchanged and build only R20. If you mean the plan's half, amend R8 (e.g. "`op=sourcepublishable` evaluates at this module's instant; a query `now`/`at` is ignored; the in-process `publishableAt` keeps `at?`", which R20's callers need) and I will apply it with a test. Carrying on with R20 meanwhile.
