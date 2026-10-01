# pdf-worker (T21)

**Status** · session_01B6vMjCUja1qXTcpkSqYzuB · depth 2 · WORKING · handled B0

## Completion (PDF-WORKER #5)

**Entries applied.** `build/plan/current.md` (T21) layer 1, pdf-worker, N469 (B1):
- `pdf-worker/fleet-member.json`:13 `note`: the deleted `battery.mjs` is no longer named; it now says `bio-plane/scripts/fleet-bundle.mjs` discovers the member by this file and builds and verifies its `bundle`, and the package's own `npm test` runs the suites in `testDir`. The rest of the note (surface, the retired `coverage.mjs`, K739) is unchanged. The fields R36 names are unchanged.
- Re-scan of my own paths found four more live claims about T20-deleted files, re-worded the same way:
  - `scripts/build.mjs`:3: "a fresh worktree's battery can load it" now names `test/structure.test.mjs`.
  - `wrangler.jsonc`:12: "what the battery loads under miniflare" now names `test/structure.test.mjs`.
  - `wrangler.jsonc`:22–23 and `src/index.mjs`:24–25: "a hygiene source scan" (`bio-plane/test/system/hygiene.test.mjs`, deleted in T20 by 6280db0024) now names R37 in `test/structure.test.mjs`, which checks at the interface that CAPTURES is only ever `.get` and that the bucket is unchanged after calls. R37 was already tested this way, so no test was added.
  - `test/table-recognition.probe.mjs`:3: "the battery never discovers it" now says no suite runs it (not `npm test`, not the regression workflow's `node --test` globs).
- Unchanged: the provenance and retirement notes (`src/index.mjs`:57, which cites `scripts/coverage.mjs` as retired), and the two probes that belong to pdf-pixels.

**Deferred.** Nothing.

**Generated artifact staled (REPORT J1).** `pdf-worker/dist/pdf-worker.bundle.json`: the input hash of `src/index.mjs` changed because of a comment. `dist/pdf-worker.bundled.mjs` is not staled: a trial `npm run build` changed only the manifest, and then `dist/` was restored. It is left for BOB's L1-close regeneration. The `fleet-member.json` note is not a bundle input.

**Found in other modules.** None.

**Tests and checks.**
- `node test/structure.test.mjs`: `structure: 83 passed, 0 failed`.
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: 1 fail. `node bio-plane/test/system/fleetbundles.test.mjs` gives `fleetbundles: 97 pass, 1 fail`; the one failure is pdf-worker's STALE BUNDLE (the manifest above). With the trial rebuild: `98 pass, 0 fail`.
- No layer tests (`build/manifest.md`). No service I provide changed.
- Checks:
  - `format: 86 modules, 84 requirements files; 0 failures`
  - `architecture: 13 product files, 8 relative imports (0 naming no tracked file, not judged); 0 failures`
  - `coverage: 1 modules, 17 of 17 live requirement ids named by a test; 0 failures`
  - ownership: see below

Size (session_01B6vMjCUja1qXTcpkSqYzuB): test runs 3, module lines 13 (comments and one JSON note in five files)
