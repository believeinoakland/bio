# capture (T7)

**Status** · session_01L2yS2q9k4fhVDfNH5pKtLX · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Proposed Provides text for N109 (as B1 asked), N90 and N122, each a change to a service I provide, so it is yours to fold (K152's pattern). I carry on against it as written; say if any reading is wrong.

**N109 · a new R57 (For later modules):**
- **R57** The table `links` (its `source_capture`, `address_norm`, `partition` and `first_seen` columns) is a stated read contract: a later module may join it in its own SQL (retrieval's frontier R40 reads the `deferred` partition; connections R29 joins `source_capture`, `address_norm` and `partition`), and this module changes none of those columns' names or meaning without a change to this requirement. `source_capture` is the digest of the capture whose bytes carried the link; `address_norm` the normalised address of the resource it names (no fragment); `partition` one of `anchor`, `intra`, `deferred`, `refused` as `subresources` classified it (`deferred` when none was given); `first_seen` the whole-second UTC instant this module first filed that row, kept when R27's `recordLinks` replaces the capture's rows. Every write to `links` stays this module's.
  (Code change with it: `recordLinks` today resets `first_seen` on every replacement, so a continuation's re-filing moved it; it now keeps the earlier instant for a row it re-files.)

**N90 · the six routes bounded, and two more of mine that were already bare** (so meaning-bounds' BARE roster reads 51 → 43; `reusedparts` stays, stated below). One shape for all: `limit` defaults to 200 and is clamped to 1 … 1000; each answer publishes `limit` and `truncated`, and a paged read also `next`, the opaque cursor to pass as `after`. Sentences to add:
- R27, after "`linksTo` answers every capture linking to an address and the elements cited": "…, at most `limit` rows in (source, citation) order per answer, with `truncated` and `next` when more remain; `count` and `elements` are of the rows listed."
- R27, after "answers the current verdict, the history and whether it changed": "(the history is the newest `limit` verdicts, oldest first, with `total` and `truncated`; `changed` is whether `total` exceeds one)".
- R27, `resolveLinks`: "Through the op, at most `limit` of the source's links per answer in link order, with `truncated` and `next`, the tally and verdict counts being of the links listed; an in-process caller that passes no `limit` is answered every link (connections' projection reads them whole) and the answer says `limit: null`."
- R28: "`chromeOf({host, limit, after})` answers a host's classified links in address order, at most `limit`, with `truncated` and `next`."
- R24: "`siteChrome` answers at most `limit` assets, most-recurring first, with `truncated` and `total`; `documents` and `documents_undetermined` are the host's." (siteChrome is not in R24's heading list today; I read it as R24's, the recurrence ratio over the same counts.)
- R25: "`recordSiteAssets` answers every change counted in `changed` but lists at most `limit` of them in `changes`, each naming at most `limit` reusing captures (`reused_by`, with `reused_by_count`), and `truncated` when either list was cut; every posthoc verdict is still appended."
- R26: "`reuseVerdicts` lists at most `limit`, newest first, with `truncated`."
- R32: "`inboxList(status, {limit, after})` lists at most `limit` knocks, newest first, with `truncated` and `next`."
- Stated, not bounded: `reusedParts(bundleId)` stays whole, since ratification must re-fetch every reused part and the list is bounded by the bundle's own captures' walks (each within the platform ceiling, R23); and `siteAssets` answers a map, which the walk cannot grade (it stays OPAQUE there): through the op it is bounded the same way (`limit`, `truncated`, `next`) unless `addresses` names the assets asked, and the in-process walk (R19) reads it whole.

**N122 · a new sentence in Provides (SHAPE), say R58:**
- **R58** `captureOf(ctx, opts)` answers the one instance for a storage. An option a caller supplies after the instance exists is never silently dropped: an `env` or `governor` the instance took by default (no caller had supplied one) is adopted from the first later caller that supplies it; one that differs from what an earlier caller supplied (an `env` differs when any binding differs; a governor, record or provenance when it is another object) is refused by a throw naming the option, before the caller gets an instance.

## J2 · REPORT

Found in other modules while applying N90, N103, N109 and N122 (none changed by me):

1. **connections** (test): `bio-plane/test/m/connections/factory.test.mjs` line 18 pins the silent first-caller-wins memo that capture R58 (K175) now forbids: `captureOf(host, { env: {} })` after connections created capture with its `env` now throws (a different `env`). m/connections reads 59/1, that arm alone. The line should assert the refusal (`assert.throws(..., /different \`env\`/)`), or go.
2. **legacy-tests** (`derivation-bounds`, base 68/5 → 66/7, both new reds pinned rosters): (a) `recordsiteassets->capture/index:recordSiteAssets` leaves the dispatched-members pin: its posthoc verdicts are now appended by one `INSERT … SELECT` and it reads only the reusers it lists (`LIMIT cap + 1`), so it no longer amplifies; (b) `capture/index:resolveLinks` joins SET 2 (a published bound beside its per-link read of the target's direct captures, which stays whole; its page is graded, so it is not doubly blind). Re-pin both by name.
3. **legacy-tests** (`meaning-bounds`, base 92/4 → 94/2): BARE 51 → **43** (the ceiling and floor of 43 now hold): off the roster `chromeof`, `inboxlist`, `linksto`, `recordlinkverdict`, `recordsiteassets`, `resolvelinks`, `reuseverdicts`, `sitechrome`; `reusedparts` stays (R26 states why). OPAQUE 11 → 10: `siteassets` left it, so the named-residual arm still fails, now only for the others' names (`audit->auditPass` in, `projectfork`, `projectowneradd`, `siteassets` out). The two remaining reds are not capture's (`pdfStructure[silent]`, and that residual pin).
4. **host-governor**: `governorOf` keeps the first instance per storage with the `env` it was first given, the pattern N122 fixed here: a capture created without `env` builds the governor with `env: null`, and a later `env` never reaches it (capture adopts the env; the governor it holds does not). The same rule (adopt a defaulted option, refuse a differing one) would close it.
5. **legacy-index**: `bio-plane/src/index.mjs` line 156 imports `withReading` from `capture/ops.mjs` and never uses it (extraction's op composes the reading).
6. **Generated artifacts made stale** (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and its manifest carry capture's source; regenerate at the layer close.

## J3 · COMPLETE

**Entries applied** (all four, on requirements as folded in K175):
- **N103**: `readingInputs` removed from `acquire.mjs`; `acquireOp` answers `{answer}` alone, so the op makes no second read of the primary (extraction reads it itself). R42's test now also asserts the op adds no store read over the service's own.
- **N90**: bounded and paged, `limit` 200 by default, clamped 1…1000, `truncated`, and `next`/`after` (an opaque cursor, `BAD_CURSOR` for one it did not write) on the paged reads: `linksTo`, `resolveLinks` (through the op; in process with no `limit`, every link, `limit: null`), `recordLinkVerdict` (newest `limit`, `total`), `recordSiteAssets` (changes and each change's `reused_by` capped, `reused_by_count`; every posthoc verdict still appended, now by one `INSERT … SELECT`), `siteChrome` (most-recurring first, `total`), `chromeOf`, and beyond the six: `inboxList`, `reuseVerdicts`, and `siteAssets` through the op (asked addresses, and the walk's in-process read, whole). `captureOps` bounds every one of these routes whatever the caller omits; `linksOp` forwards `limit` and `after`. **meaning-bounds' BARE roster: 51 → 43** (only `reusedparts` of mine stays, as R26 states); OPAQUE 11 → 10.
- **N109**: R57 met: the four columns as stated; `recordLinks` now files in place (upsert, then one delete of the rows the new set no longer names), so a re-filed row keeps its `first_seen`, and it reads no rows into memory.
- **N122**: R58 met: `captureOf` adopts an `env` or `governor` it took by default from the first later caller that supplies one, and throws naming the option on a differing `env` (any binding), `governor`, `record` or `provenance`; every option is judged before any is adopted, so a refused call changes nothing.

**Deferred**, with why: `resolveLinks`' per-link read of the target's direct captures stays whole (it grows with the re-captures of one address). Bounding it means deciding the bracket in SQL over the receipts' instants compared as text, which needs provenance R48 to state `first_retrieved`/`last_retrieved`'s whole-second spelling; until then the JS decision over `Date.parse` is kept.

**Found in other modules**: REPORT J2 (connections' factory arm vs R58; derivation-bounds' and meaning-bounds' pins; host-governor's first-caller memo; an unused import in legacy-index; the plane bundle stale).

**Tests and checks** (on `job/T7/capture` @ the commit carrying this record's code, tranche merged at B2):
- `node --test bio-plane/test/m/capture/`: **56 pass, 0 fail** (new `reads.test.mjs`: R24–R28, R32 bounds, R57, R58; `ops.test.mjs` R42 N103).
- Users' tests: m/extraction 58/0, m/retrieval 58/0, m/connections 59/1 (the factory arm, J2 item 1); capture-requests, ratification, monitoring, scheduler, queue have no tests yet.
- Legacy suites touching capture, mine vs the tranche base: meaning-bounds 94/2 (base 92/4), derivation-bounds 66/7 (base 68/5; J2 item 2), bounds 203/3 (same), project-sight 231/1 (same); 0 fail on subresources 363, suggest 101, plane-envelope 64, gate-reads 115, d57selflink 24, cap13-reuse-pages 22, cap14-reused-from 23, reuse-ratify 36, ratify-envelope 35, refusal-wire 42, d522-unattended-render 21, d334-monitor-credential 41.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio capture`: 0 failures. `checks/coverage.mjs bio capture`: 58 of 58 live ids named, 0 failures. `checks/ownership.mjs bio capture tranche/T7`: legacy-store and legacy-index 0 lines added, 0 removed; 0 failures.

Size (session_01L2yS2q9k4fhVDfNH5pKtLX): test runs 11, module lines 2840
