# public-read (T24)

**Status** · session_01RQeoV3bSk9w1uyvNraCojZ · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (B1; wording only, no change of meaning, no requirement changes):
- N508: `bio-plane/test/m/public-read/fixture.mjs`:4, :28 no longer name the legacy store's op map; they name the plane store's op map (`plane/store.mjs` spreads `publicReadOps` beside `publicationOps`; control-plane's routes reach it).
- S1's: `bio-plane/src/public-read/checks.mjs`:9, :146 and `checks.test.mjs`:47: C-98.10 is "stamped by 1.54.0" (gate.mjs' 1.54.0 note lists it among the arrivals), no longer `awaiting stamp`.
- Re-scan (N469's rule) over every file in `paths` and `tests`: one more of the kind, `worker.test.mjs`:5 (the store's op map "as it stands after `publication`'s merge"), re-worded to the plane store's op map. `index.mjs`:12, :1101 already name the plane store (`plane/store.mjs`); `door.mjs`:2 and `door.test.mjs`:1 are past-tense history (moved from `src/index.mjs`): not stale.

**Rows added or changed:** none (comments only), so nothing `awaiting stamp` for red 5.

**Deferred:** none.

**Found elsewhere (reported to BOB):**
- Bundle: `bio-plane/src/public-read/checks.mjs` changed (comments only), so the plane's bundle (`bio-plane/dist/bio-plane.bundled.mjs`) may be stale by input hash; regenerated nothing (manifest).
- network-notices: `test/m/network-notices/reads.test.mjs`:143 (R25) failed once in the whole `test/m` run (`bob named`) and passed 17 runs of its file alone, 5 of them on the tranche's tree without this change. It searches the JSON of every answer for the bare substring `bob` (and `alice`, `carol`, `dave`), which random encoded material in those answers (salts, roots, keys) can contain by chance; so it is intermittent, not a leak. The test should match the member names as whole values or tokens, not substrings (network-notices R25).

**Tests and checks run:**
- `node --test test/m/public-read/`: tests 86, pass 86, fail 0.
- `node --test test/m/` (whole): tests 5236, pass 5224, fail 1 (network-notices R25, intermittent, above; not this change); no red from this module.
- `node --test test/m/network-notices/reads.test.mjs` ×17: fail 0 every time.
- `checks/format.mjs .`: 2 failures, both red 4 (`link-sweep`'s directories absent).
- `checks/architecture.mjs . public-read`: 0 failures.
- `checks/coverage.mjs . public-read`: 19 of 19 live ids named; 0 failures.
- `checks/ownership.mjs . public-read tranche/T24`: 5 files; 0 failures.

Size (session_01RQeoV3bSk9w1uyvNraCojZ): test runs 20, module lines 2408

## J1 · REPORT

Two findings outside public-read. (1) Bundle: bio-plane/src/public-read/checks.mjs changed (comments only), so the plane's bundle may be stale by input hash; regenerated nothing. (2) network-notices: test/m/network-notices/reads.test.mjs:143 (R25) failed once in the whole test/m run ('bob named') and passed 17 runs of its file alone (5 on the tranche's tree without my change). It searches the JSON of every answer for the bare substring 'bob' (and alice, carol, dave), which random encoded material (salts, roots, keys) can contain by chance: intermittent, not a leak. It should match member names as whole values or tokens (network-notices R25).
