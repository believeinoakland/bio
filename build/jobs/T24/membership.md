# membership (T24)

**Status** · session_01TsMiP8QXjZwgw1wxMGupxs · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T24 L2):
- R83: `MODULE_ORDER` (`bio-plane/src/membership/index.mjs`:182) gains `link-sweep` after `monitoring` in layer 10, equal again to `build/modules.json` after the opening's N506 fold (K1181, K1185). The R83 test failed before the change (the file's ids against the list) and passes after; promotion's `registry.test.mjs` (R39, R45, R46) passes through it.
- N502/N508 re-scan of this module (N469's rule): no stale note found. The op-map note (`index.mjs`:2604) already names the plane as the composition root that spreads the map (`plane/store.mjs`:271, true); the legacy store and `store.mjs` are named only in past-tense history (the header's extraction line, the boot and audit pass notes, `members.test.mjs`'s negative-control run records). No `awaiting stamp` in the module. The header's change list gains T24's line.

**Deferred** · none.

**Found in another module** · the change is under `bio-plane/src/`, so the plane's bundle may be stale (`plane`'s generated artifact; not regenerated, mechanics §14).

**Tests and checks**
- `node --test test/m/membership/ test/members.test.mjs`: tests 140, pass 140, fail 0.
- Users: `test/m/promotion/`: tests 102, pass 102, fail 0. `test/m/provenance/`: tests 117, pass 117, fail 0.
- Whole `bio-plane/test/m`: tests 5218, pass 5207, fail 0, todo 11 (the existing TODOs of the left-out rows: bias R26, contradiction K5/R41, inquiry R31, progressions R32, publication R30). Accepted red 1 did not show.
- `checks/format.mjs`: 2 failures, both accepted red 4 (link-sweep's `paths` and `tests` do not exist yet). `checks/architecture.mjs membership`: 0 failures. `checks/coverage.mjs membership`: 79 of 79 live ids named, 0 failures. `checks/ownership.mjs membership tranche/T24`: 0 failures.
- No row added or changed (nothing `awaiting stamp`).

Size (session_01TsMiP8QXjZwgw1wxMGupxs): test runs 5, module lines 3342
