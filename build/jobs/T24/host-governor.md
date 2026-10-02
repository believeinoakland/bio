# host-governor (T24)

**Status** · session_01WL11uZnbncFsdu25U9t5UL · depth 2 · COMPLETE · handled B1

## J1 · REPORT

One thing outside my files, for BOB:
1. **Generated artifact staled** (manifest §14): my comment edits to `bio-plane/src/host-governor/index.mjs` and `schema.mjs` are inputs of the plane's bundle (`bio-plane/dist/bio-plane.bundle.json` hashes `host-governor/index.mjs`), so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close. The bundled code is unchanged (comments only). I regenerated nothing.

## J2 · COMPLETE

**Entries applied** (START B1; commit `6b9bec841a`)
- (1) **N508.** `index.mjs`:266 re-worded: `governorRoutes` are entries of the plane's one route map (plane R5: `routes` spreads them in, and control-plane's `dispatch` answers every store request over it), not the legacy store's op map. `ops.test.mjs`:13: the stand-in stub answers as the plane store does (its route map, `{ok, result}`), not the legacy store's dispatcher.
- **Re-scan** (every source and test file of the module, read whole) for the N502/N508 kind: one more hit, `schema.mjs`:1–2, which said the legacy schema interpolates `HOST_GOVERNOR_SCHEMA`. Nothing outside the module reads it now, so I re-worded it: `HostGovernor#migrate` runs it, and the plane store calls that `migrate` at every boot (`plane/store.mjs`:206). Left as they are, because they are past-tense history or test data: `index.mjs`:2 (extracted from legacy-store and legacy-index in T4), `index.mjs`:394 (legacy-index's `governorOp` block, moved here), `index.mjs`:294 (the 0.46.0 measurement), and `ops.test.mjs`:122's fake stack string. No `awaiting stamp` note in the module.
- **Rows:** none added or changed (the module has no catalogue rows), so nothing is `awaiting stamp` from this job (red 5: none to list).
- Wording only; no behaviour changed.

**Deferred:** none.

**Found in other modules / artifacts** (REPORT J1): the plane bundle is stale from `host-governor/index.mjs` and `schema.mjs` (comments only). I regenerated nothing.

**Tests and checks**
- `node --test bio-plane/test/m/host-governor/`: tests 39, pass 39, fail 0.
- Whole `bio-plane/test/m`: tests 5230, pass 5219, fail 0, skipped 0, todo 11. No red at all, so none of the accepted reds showed.
- `format.mjs`: 88 modules, 87 requirements files; 2 failures, both accepted red 4 (link-sweep's `paths` and `tests` absent). `architecture.mjs … host-governor`: 6 product files, 11 relative imports; 0 failures. `coverage.mjs … host-governor`: 27 of 27 live ids named by a test; 0 failures. `ownership.mjs … host-governor tranche/T24`: 4 files changed; 0 failures.

Size (session_01WL11uZnbncFsdu25U9t5UL): test runs 2, module lines 434
