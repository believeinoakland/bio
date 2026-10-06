# progressions (T33)

**Status** · session_017DVQNok5seqfZSHmhaBsqx · depth 2 · WAITING ON BOB (B3: CHANGE when events, standards, local-facts merge) · handled B3

## J1 · QUESTION

Five readings I am building on now (none stops me; answer any you read otherwise).

(1) **Upstreams not yet built (events; standards' T33 `inForceAt`; local-facts' governing zone).** progressions reaches each through `progressionsOf` deps, defaulting to `eventsOf(host)`, `standardsOf(host)`, `localFactsOf(host)`. `src/events/` does not exist yet, so my static import of `../events/index.mjs` makes this branch unloadable until events merges. My tests inject providers in the shapes of those modules' requirements; to run them before events lands I use an uncommitted local stub file for the import only (never committed). Merge after events, standards and local-facts, as B1 says.

(2) **Shapes read from events' requirements** (best reading, adapters in one place): `datedFactsFor({captureSha, viewer})` answers the capture's dated facts (`{dated_fact_id, capture_sha, kind, value, ...}`, `value` a `YYYY-MM-DD` taken in the governing zone); `readEvent({eventId, viewer})` answers `when` as R9's `{start, end, precision, zone}` (`start` the value at `precision`), and its `attestations[]` each name `capture_sha` (directly or through its dated fact). A document attests an event when one of its attestations names that capture.

(3) **R39's portion and date.** `PORTION_UNKNOWN` is minted by standards (its R23); best reading: standards exports a one-site answer for it as for `noSuchStandard`; until it does I mint nothing and answer through whatever standards exports, named in my record. Portion held = equal to the standard's own `portion` path as `standardRead` answers it. "The read's date" = the module clock's instant, passed to `inForceAt({standard, portion, date, viewer})`.

(4) **R32's "payment placed after the term"** (amount-free). Best reading: a placed stage whose own date is after its predecessor's latest own date plus the stage's own `within` (the term) is a `placed_after_term` finding, naming both placements; undetermined dates make it `undetermined`, never a finding. "One response where a stage admits one" is R31's finding, kept. Neither is aggregated into `proposals[]` (R31's precedent, queue's wording).

(5) **R40 registration "once at load"**: registered into `connection-grammar`'s default registry when the module loads, its `neighbours` answering from the instance `progressionsOf` last made (one store per isolate), synchronous as the contract requires. Kind id `placed_on_flow`, word "placed on a declared flow", class `evidentiary`; `from` the event (`EVT-`) when the placement names one, else the bundle the document is filed in; `to` the entity; `valid` from = to = the placement's own date (so R6's in/out/undetermined holds), both null when unstated.

Also, decided (technical): `overdue_successor` keeps `overdue_by_ms` beside `overdue_by`, since `civicos-ui/app.html:18339` (Bob's UX) reads it. R41: progressions registers with no `entities`, `promotion` or `scheduler` slot today, so the test covers R33's slot with the layer 5–8 (and scheduler) listeners of the re-pinned order.

## J2 · REPORT

Every T33-32 entry is applied on `job/T33/progressions` @ e9388ab7b3 (tranche/T33 merged in, K1563 applied): R16 on civil-time's local day from the predecessor's own date, R17, R32 (amount-free, as J1 (4)), R37, R38, R39 (through standards' `noSuchStandard` and `portionUnknown`, K1563 (10)), R40 (host routing and `OWNER_HOST_AMBIGUOUS`, K1563 (1); the owner battery passes), R41, R42. Module tests 60/60; format 0 failures; coverage 42/42; ownership 14 files, 0 failures.

**Not yet COMPLETE, by K1563 (1):** events, standards (`inForceAt`, `portionUnknown`) and local-facts are injected deps coded to their requirements; I re-point the tests at the real modules after each merges, then COMPLETE. Send a CHANGE when they are on `tranche/T33`.

**For you:**
1. **uses** (architecture's only failures, K1563 (3)): progressions imports civil-time, local-facts, events, standards and connection-grammar (all five named in its Uses).
2. **intent** `invariants.test.mjs:200` (R15 R16, N179) goes red with this job: it dates the need by its *reading* (`plane.readingAt`) and expects overdue at 2026-01-20. R16 (K1444 (ii)) no longer reads a reading's date as a stage's date, so the finding reads `overdue: undetermined` with the capture date as a bound, and `basis.overdue` is false. Its fixture needs an own date through `events` (a dated fact) and `deps.zoneOf`; intent's to fix, not mine. queue, queue-producers, scheduler, monitoring, inquiry, plane: all green with my change; affordances' one red is K1550's named red.
3. **Code overlap:** events R7 mints `NO_SUCH_DATED_FACT`, and progressions R37 names the same code. I minted it at C-100.25 (with `NOT_ATTESTED_BY_DOCUMENT` C-100.24). If events exports a one-site answer, I will answer through it instead. Your call.
4. **Shapes a consumer sees:** an `overdue_successor`'s `deadline` is now a local day (`YYYY-MM-DD`), with `deadline_zone`, `overdue_by {amount, unit}` and `overdue_by_ms` kept (the UI reads it, `civicos-ui/app.html:18339`, Bob's UX). An undetermined one has `overdue: "undetermined"`, `why` and `bounds`. `proposals[]` gains `overdue_undetermined_count`, and its instance `overdue` may be `"undetermined"`. `overdueScan`'s `next_deadline` is the first instant after the deadline's local day. Instances threaded before T33 have no own dates, so their overdue findings read undetermined until a member names a date or events holds one (the requirement's Suggestions).
5. money-checks R1 vs R32: settled by K1563 (7). Nothing from me.
