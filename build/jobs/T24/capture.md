# capture (T24)

**Status** · session_01Ev99X9H9nsfjJtVzKww84u · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Generated artifact staled (manifest §14): my comment-only edit to `bio-plane/src/capture/index.mjs` is an input of the plane's bundle, so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close (`fleetbundles.test.mjs`: 1 fail with my change, 0 with it stashed). I regenerated nothing. No other module's flaw found.

## J2 · COMPLETE

**Entries applied** (START B1; commit `4d58d53c12`)
- (1) **N508.** `bio-plane/src/capture/index.mjs`:2261 re-worded: `captureOps` are entries of the plane's one route map (plane R5: `routes` spreads them in, and control-plane's `dispatch` answers every store request over it), not the legacy store's op map. Wording only.
- **Re-scan** of the module's source and tests for the N502/N508 kind: two more hits, both test notes, re-worded: `test/m/capture/doorbell.test.mjs`:19 (a stub "answering as the store's dispatcher does" → as control-plane's `dispatch` does over the plane's route map); `test/m/capture/relays.test.mjs`:5 ("legacy-index's callers hand … until layer 11" → the plane's door hands `storeRefusal`; a caller handing only the three helpers, as the retired legacy-index's did, is answered alike). Not stale, kept: past-tense history notes (`index.mjs`:6–7, :209, :2242; `ops.mjs`:1, :117, :142, :171; `doorbell.mjs`:2, :151; `schema.mjs`:1, :496, :514; `ops.test.mjs`:116; `plane.test.mjs`:2). No `awaiting stamp` note in the module.
- **Rows:** none added or changed (`checks.mjs` untouched), so nothing `awaiting stamp` (red 5) from this job.

**Deferred:** none.

**Found in other modules / artifacts** (REPORT J1): the plane bundle is stale from `capture/index.mjs` (regenerated nothing).

**Tests and checks**
- Module tests (`test/m/capture/`, `cap13-reuse-pages`, `d57selflink`): tests 118, pass 118, fail 0.
- Whole `bio-plane/test/m`: tests 5230, pass 5219, fail 0, skipped 0 (11 todo). No red beyond the accepted ones (none showed).
- `format.mjs`: 88 modules, 87 requirements files; 2 failures, both accepted red 4 (link-sweep's `paths` and `tests` absent). `architecture.mjs … capture`: 23 product files, 93 relative imports; 0 failures. `coverage.mjs … capture`: 55 of 55 live ids named by a test; 0 failures. `ownership.mjs … capture tranche/T24`: 4 files changed; 0 failures.

Size (session_01Ev99X9H9nsfjJtVzKww84u): test runs 4, module lines 3769
