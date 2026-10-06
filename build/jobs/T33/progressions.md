# progressions (T33)

**Status** · session_017DVQNok5seqfZSHmhaBsqx · depth 2 · WORKING · handled B1

## J1 · QUESTION

Five readings I am building on now (none stops me; answer any you read otherwise).

(1) **Upstreams not yet built (events; standards' T33 `inForceAt`; local-facts' governing zone).** progressions reaches each through `progressionsOf` deps, defaulting to `eventsOf(host)`, `standardsOf(host)`, `localFactsOf(host)`. `src/events/` does not exist yet, so my static import of `../events/index.mjs` makes this branch unloadable until events merges. My tests inject providers in the shapes of those modules' requirements; to run them before events lands I use an uncommitted local stub file for the import only (never committed). Merge after events, standards and local-facts, as B1 says.

(2) **Shapes read from events' requirements** (best reading, adapters in one place): `datedFactsFor({captureSha, viewer})` answers the capture's dated facts (`{dated_fact_id, capture_sha, kind, value, ...}`, `value` a `YYYY-MM-DD` taken in the governing zone); `readEvent({eventId, viewer})` answers `when` as R9's `{start, end, precision, zone}` (`start` the value at `precision`), and its `attestations[]` each name `capture_sha` (directly or through its dated fact). A document attests an event when one of its attestations names that capture.

(3) **R39's portion and date.** `PORTION_UNKNOWN` is minted by standards (its R23); best reading: standards exports a one-site answer for it as for `noSuchStandard`; until it does I mint nothing and answer through whatever standards exports, named in my record. Portion held = equal to the standard's own `portion` path as `standardRead` answers it. "The read's date" = the module clock's instant, passed to `inForceAt({standard, portion, date, viewer})`.

(4) **R32's "payment placed after the term"** (amount-free). Best reading: a placed stage whose own date is after its predecessor's latest own date plus the stage's own `within` (the term) is a `placed_after_term` finding, naming both placements; undetermined dates make it `undetermined`, never a finding. "One response where a stage admits one" is R31's finding, kept. Neither is aggregated into `proposals[]` (R31's precedent, queue's wording).

(5) **R40 registration "once at load"**: registered into `connection-grammar`'s default registry when the module loads, its `neighbours` answering from the instance `progressionsOf` last made (one store per isolate), synchronous as the contract requires. Kind id `placed_on_flow`, word "placed on a declared flow", class `evidentiary`; `from` the event (`EVT-`) when the placement names one, else the bundle the document is filed in; `to` the entity; `valid` from = to = the placement's own date (so R6's in/out/undetermined holds), both null when unstated.

Also, decided (technical): `overdue_successor` keeps `overdue_by_ms` beside `overdue_by`, since `civicos-ui/app.html:18339` (Bob's UX) reads it. R41: progressions registers with no `entities`, `promotion` or `scheduler` slot today, so the test covers R33's slot with the layer 5–8 (and scheduler) listeners of the re-pinned order.
