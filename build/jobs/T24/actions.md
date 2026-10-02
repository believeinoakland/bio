# actions (T24)

**Status** · session_01KwWnfa9KiMXxMcbgPRxgox · depth 2 · COMPLETE · handled B1

## J1 · REPORT

One thing outside my files, for BOB:
1. **Generated artifact staled** (manifest §14): my comment edits to `bio-plane/src/actions/index.mjs` are an input of the plane's bundle, so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close. Comments only; no bundled behaviour changed. I regenerated nothing.

## J2 · COMPLETE

**Entries applied** (START B1; commit `6b943c2403`)
- (1) **N508.** `index.mjs`:2368 re-worded: `actionsOps` are entries of the plane's one route map (plane R5: `routes` spreads them in, `plane/store.mjs`:307, and control-plane's `dispatch` answers every store request over it), not the legacy store's op map. Same wording as host-governor's and extraction's.
- **Re-scan** (every source and test file of the module, read whole) for the N502/N508 kind: three more notes named a retired legacy module as live, re-worded:
  - `index.mjs`:55: `NOTE_MAX` was "the legacy store's `RELEASE_ACK_MAX`"; now "the value of the retired legacy store's `RELEASE_ACK_MAX`".
  - `index.mjs`:292: the K57 helpers were "copied from the legacy store (which keeps its own for its other writers)"; now "copied from the retired legacy store at the extraction; this module keeps its own copy".
  - `index.mjs`:2306: the governing-laws proposal sentence was "legacy-checks'"; it is action-grammar's `lawProposalLabel` (imported at :44), and now says so.
  - Left as they are, because they are past-tense history: `index.mjs`:5–9 (the T8 extraction), :1551 (the legacy refusal-code guard, "deleted in T20"), `schema.mjs`:2 ("Moved from `schema.mjs` (legacy-store)"). No `awaiting stamp` note in the module or its tests; the tests name no legacy module.
- **Rows:** none added or changed, so nothing is `awaiting stamp` from this job (red 5: none to list).
- Wording only: no behaviour or requirement changed.

**Deferred:** none.

**Found in other modules / artifacts** (REPORT J1): the plane bundle is stale from `actions/index.mjs` (comments only). I regenerated nothing.

**Tests and checks**
- `node --test test/m/actions/` (in `bio-plane/`): tests 66, pass 66, fail 0.
- Whole `bio-plane/test/m`: tests 5244, pass 5231, fail 2, skipped 0. The two reds are accepted by name: red 8 (`scheduler/consumers.test.mjs`:161) and red 9 (`plane/notices.test.mjs`:33, its assertion at :39). Nothing else red.
- `format.mjs`: 88 modules, 87 requirements files; 2 failures, both accepted red 4 (link-sweep's `paths` and `tests` absent). `architecture.mjs … actions`: 13 product files, 50 relative imports; 0 failures. `coverage.mjs … actions`: 43 of 43 live ids named by a test; 0 failures. `ownership.mjs … actions tranche/T24`: 1 file changed; 0 failures.

Size (session_01KwWnfa9KiMXxMcbgPRxgox): test runs 2, module lines 2654
