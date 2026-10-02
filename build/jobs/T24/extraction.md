# extraction (T24)

**Status** · session_01AQZyjhWKrMBRZzo1DUJGjm · depth 2 · COMPLETE · handled B1

## J1 · REPORT

One thing outside my files, for BOB:
1. **Generated artifact staled** (manifest §14): my comment edits to `bio-plane/src/extraction/index.mjs`, `ops.mjs` and `schema.mjs` are inputs of the plane's bundle (`bio-plane/dist/bio-plane.bundle.json` hashes all three), so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close. The bundled code is unchanged (comments, and SQL `--` comment lines the schema runner strips). I regenerated nothing.

## J2 · COMPLETE

**Entries applied** (START B1; commit `00b877e547`)
- (1) **N508.** `index.mjs`:1474: `extractionOps` are entries of the plane's one route map (plane R5: `routes` spreads them in, and control-plane's `dispatch` answers every store request over it), not the legacy store's op map. `ops.mjs`:10, :32, :82: the plane's door (`src/plane/door.mjs`) hands `doAnswer` and `json`; the fallbacks stay for a caller that hands none, "as legacy-index did, before it retired" (was "until legacy-index hands it (layer 11)").
- **Re-scan** (every source file of the module read whole; the test files searched for the kind, every hit read) for the N502/N508 kind: five more hits, all re-worded. `index.mjs`:1418: `driftFor`'s reader is retrieval's content-axis frontier (`retrieval/frontier.mjs`), not the legacy store's. `schema.mjs`: the `reading_refs` re-key's migration is this module's `migrate()` (index.mjs), not `store.mjs #migrate`; the term fold is this module's `labelTerms` over `normAlias` (R59), not the `Store`'s; the recogniser is `entities`' `recogniseTier`, not `#recognise` (two lines); REC-12's rule "was recorded in the retired store's schema", not "is recorded a few hundred lines up in store.mjs"; "the retired schema.mjs's standing rule". Left as they are, being past-tense history: `index.mjs`:3–5 (moved from `store.mjs` and `index.mjs`), :399 (the order the legacy store ran them), :1022 (as `store.mjs`' `#counts` took it), `ops.mjs`:1 (moved from `legacy-index`), :70 (legacy-index map §4.4, a document), and the tests' notes (`relays.test.mjs`, `testimony-slot.test.mjs`, `figures.test.mjs`, the T17 convert notes). No `awaiting stamp` note in the module.
- **Rows:** none added or changed (C-51.1–C-51.6 untouched), so nothing is `awaiting stamp` from this job (red 5: none to list).
- Wording only; no behaviour changed.

**Deferred:** none.

**Found in other modules / artifacts** (REPORT J1): the plane bundle is stale from `extraction/index.mjs`, `ops.mjs` and `schema.mjs` (comments only). I regenerated nothing.

**Tests and checks**
- Module tests (`test/m/extraction/`, `d606-perpage-ocr`, `tier2-wire`, `system/pdf-worker-binding`): tests 174, pass 174, fail 0. `tier-pagewise.probe.mjs` run: baseline 0 pages awarded, as it must be.
- Whole `bio-plane/test/m`: tests 5236, pass 5225, fail 0, skipped 0, todo 11. No red at all, so none of the accepted reds showed.
- `format.mjs`: 88 modules, 87 requirements files; 2 failures, both accepted red 4 (link-sweep's `paths` and `tests` absent). `architecture.mjs … extraction`: 38 product files, 125 relative imports; 0 failures. `coverage.mjs … extraction`: 63 of 63 live ids named by a test; 0 failures. `ownership.mjs … extraction tranche/T24`: 4 files changed; 0 failures.

Size (session_01AQZyjhWKrMBRZzo1DUJGjm): test runs 3, module lines 4001
