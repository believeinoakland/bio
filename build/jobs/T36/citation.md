# citation (T36)

**Status** · session_01WS6wZwoZkEzr9PB9xGHcPS · depth 2 · RUNNING until 2026-10-08T04:21:25Z (users' suites (answers, inquiry)) · handled B2

## J1 · QUESTION

R13 readings I am building on (carry on unless you answer otherwise). No new table and no new Uses edge to another layer's module is needed.
1. **Finding citing objects.** The capture's home document is `provenance.homeOf(sha)` (Uses already). Citing objects are found by listing `project` and `inquiry` bundles through `record-core` `listByType` and `head` (R36, R41), reading each one's current `bundle.md` and keeping its legs/`cites` edges whose target is that document and whose pin is the capture. Parsed citations are cached in memory per citing object, keyed by its `bundleSha` (no row, so R6 holds). Cost: one `head` per citing object per capture read, plus a parse only when a citing object changed. I chose this over `inquiry.restingOn` (leg-earning's projection; citation's test world does not boot inquiry, so `inquiry_basis` is empty there) and over joining `refs` (connections', not in my Uses). If you would rather have a projection (a capture → citing-object index), that is a table under P6/R6 and yours to decide; I am not adding one.
2. **The pin.** It is the leg's or edge's `extent_capture`; else, for a leg naming a `content_id`, that content row's capture (`content.contentRow`); else `content.captureFor(target)`, the capture an unpinned citation addresses (content R11, the same one inquiry R12 resolves through). A legacy edge with no `extent_capture` is therefore answered for its document's first-held capture.
3. **`by` and `at`.** They come from the citing object's history (`record-core` `readImage`, R15): the manifest entries in write order (`seq`), each one's `bundle.md` bytes, and the first entry whose bytes carry the leg (same target, canonical extent and pin) or the `cites` edge (same target). `by` is that entry's `author` and `at` its `created`. When history cannot say (a blob-backed `bundle.md`), the current head's latest entry is used.
4. **Uses lines to add (BOB's wording):** `retrieval.registerRecordedBy` (R76); `content.canonicalExtent` (R2), `extentRelation` (R6), `CONTENT_EXTENT_KINDS` and `contentRow`; `record-core` `listByType`, `head` and `readImage`; `provenance.homeOf` for R13 as well as R1.
5. **`NO_SHA`.** It is answered in the shape's refusal form `{ok:false, refused, code, reason, why}`, with no row (extraction's row is not reachable from my Uses). A non-hex sha answers `items: []` (K2116).
6. **Registration.** It is done in `citationOf` when it first creates the instance (the plane's boot reaches it through run-productions' factory, against `retrievalOf(host)`, the instance `findIn` runs on). A `new Citation(...)` registers nothing.

## J2 · COMPLETE

**Entry applied: T36-21 (R13 `recordedBy`, registered with retrieval R76), on J1's readings as B2/K2132 settled them.**

- **Code.** `bio-plane/src/citation/recorded.mjs` is new. `index.mjs` gains the `recordedBy` method, the registration in `citationOf` (once, at first creation, against the retrieval instance the factory reaches, which is the plane's `retrievalOf(host)`; a `new Citation` registers nothing), `inquiryServices` gains `restingOn`, and a `storage` dep is added.
  - Legs are found through inquiry's leg projection (`restingOn`, R12; K2132).
  - Projects are found in one statement over record-core's `bundles` contract (R37: `bundle_id`, `object_type`, `bundle_sha`), with `listByType`/`head` as the fallback when no store is given.
  - Each citing object's citations are parsed once per `bundleSha` and held in memory. There is no table (R6).
  - The pin is the stated `extent_capture`, else the content row's capture, else `content.captureFor(doc)`. That last one is resolved at each read, so a document captured after it was cited is still found. This flaw was found and fixed in this job, with a test.
  - `by` and `at` are the first manifest entry, in write order, whose `bundle.md` carries the leg or edge (`readImage`).
  - Refusals: `VIEWER_MISSING`, `NO_SHA` and `EXTENT_MALFORMED` use the shape's row-less form; a failure answers `RECORDED_BY_UNREADABLE`. A Citation without inquiry's projection refuses `INQUIRY_UNAVAILABLE` (written in R12's words), so `findIn` lists it as not read rather than answering "nobody".
- **Measured (K2132).** 200 captures over 500 projects and 500 inquiries, 2,000 items: **0.93 s cold, 0.47 s warm**, and the real `findIn` over the 200 documents 0.65 s. This is under the 2 s line. The first version read projects one `head` at a time and took 3.2 s / 2.7 s, 2.5 s of it in `head`; the single statement over R37 fixed that.
- **Tests.** `test/m/citation/recorded.test.mjs` is new, 12 tests, each naming R13. It runs in a world with the real inquiry booted (fixture option `{inquiry: true}`: retrieval's stand-in `inquiry_basis`/`connections` tables are dropped, inquiry's and connections' schemas migrated, and every capture given a three-page text-layer reading).
  - The covered Suggestions: a found match cited, then `findIn`'s `recorded` showing `relation: same` with `by`/`at`; narrower, wider and disjoint parts; a project edge as `document`, withdrawn after sever, `by` unchanged; a hidden project neither answered nor counted, with `truncated` unchanged; an earlier capture's leg absent from a later capture's read; the content_id pin; the legacy unpinned edge; a leg removed from a basis; `LISTENER_DECLARED` on a second registration; the shape's refusals with no row added; the limit clamp; nothing written; never throws; the SQL and per-bundle paths answering alike.
  - The R12 test is extended to R13's `why`s. The word "plane" was caught in a `why` and reworded.
- **Deferred:** none.
- **Found elsewhere (REPORT):**
  - (1) **Stale artifact.** `bio-plane/dist/bio-plane.bundled.mjs` is staled by `src/citation/` (fleetbundles: STALE BUNDLE). It is not mine to write; it should be regenerated at L6's close.
  - (2) **Plane boot.** citation is made at boot only through run-productions' factory (`runProductionsOf` → `citationOf(host, …)`). Registration therefore depends on that call staying before the first request. A plain `citationOf(ctx)` line in the plane's boot (plane's file, `store.mjs` ~272) would make it explicit.
  - (3) **Whole-plane suites.** Only retrieval's own `t36.test.mjs` asserts "none registered", and its world does not make citation: 162/0. No suite needed a change.
- **Reading set.** Measured about 260 KB as mechanics §3 counts it (my code and tests 184 KB, requirements 14 KB, and the used services named in Uses: events R49, retrieval R73/R76/R77, content R2/R5/R6/R11, record-core R15/R36/R37/R41, membership R44/R61, provenance R4, leg-earning R4). That is at most 300 KB, so I read it whole myself; no worker summary.
- **Tests and checks run (on HEAD after the final change):**
  - citation: 78 pass, 0 fail.
  - Users and neighbours:
    - retrieval 162/0, run-productions 39/0, plane 130/0, migrate-released 1/0, answers 44/0, inquiry 175/0.
    - affordances 206/2: red 20 `catalogue.test.mjs`:583 and red 19 `t33.test.mjs`:144.
    - answer-envelope 24/2: red 18 `catalogue-end.test.mjs`:17 and red 11 `families.test.mjs`:49.
    - The same reds fail identically on the tranche tip without my change.
  - system: deploybindings (red 10), row-census (red 4; no row of mine), fleetbundles (the stale plane bundle, REPORT 1).
  - format: 0 failures. architecture: 14 product files, 0 failures. coverage: 13 of 13, 0 failures. ownership: 0 failures.
- **P6:** 1,406 lines in `src/citation/` (was 1,186), well under 4,000.

Size (session_01WS6wZwoZkEzr9PB9xGHcPS): test runs 24, module lines 1406
