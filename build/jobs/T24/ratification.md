# ratification (T24)

**Status** · session_01FzkbVm8E9gu1PeRiKPLsQE · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1; `build/plan/current.md` T24 L8: N502 (test); wording only, no change of meaning, no requirement change):
- N502: `test/m/ratification/checks.test.mjs`:313, "awaiting stamp" → "stamped by 1.53.0 (PROMOTION #24, T23 layer 2)" (`gate.mjs`'s 1.53.0 history names C-58.4 and C-58.5).
- N469's rule, found by the re-scan of my own `paths` and `tests` (`awaiting stamp`, legacy store, legacy-index, dispatcher, op map):
  - `test/m/ratification/fixture.mjs`:237: "as the legacy store's dispatch reaches them" → "as the plane's op map (`plane/store.mjs`) reaches them through `ratificationOps` (R32)".
  - `test/m/ratification/relays.test.mjs`:7–8: "legacy-index's callers hand `{json, doAnswer, storeSilent, …}` until layer 11" → `storeRefusal` handed "as the plane's door, `plane/door.mjs`, hands it" and without it "a caller handing only `{json, doAnswer, storeSilent, …}`" (door.mjs:70 hands `storeRefusal`).
  - Not stale (past-tense history): `ops.mjs`:2, :42, `release.mjs`:3, `retire.mjs`:3, `index.mjs`:9–15, :74, `checks.mjs`:5, :145, :1155, :1162 (already name 1.53.0); `index.mjs`:770 "the legacy arms" is the undelivered committer arm, not the retired store.

**Deferred:** nothing.

**Other modules:** nothing found. No change under `bio-plane/src/`, so the plane's bundle is not staled.

**Red 5:** no catalogue row added or changed; none to list.

**Reading:** read whole: my requirements, `build/plan/current.md`, `plan/t24-stale-notes.md`, the three test files changed; the rest of the module was re-scanned by search for the N502/N508 kind (a wording-only entry; no behaviour read or changed).

**Tests and checks:**
- `node --test bio-plane/test/m/ratification/`: tests 199, pass 199, fail 0.
- `node --test bio-plane/test/m/`: tests 5236, pass 5225, fail 0, todo 11.
- `checks/format.mjs`: 88 modules, 87 requirements files; 2 failures, both red 4 (`link-sweep`'s `paths` and `tests` absent).
- `checks/architecture.mjs … ratification`: 24 product files, 115 relative imports; 0 failures.
- `checks/coverage.mjs … ratification`: 38 of 38 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … ratification tranche/T24`: 4 files changed; 0 failures.

Size (session_01FzkbVm8E9gu1PeRiKPLsQE): test runs 2, module lines 3973
