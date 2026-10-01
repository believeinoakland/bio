# public-read (T21)

**Status** · session_01SbJjiQPQYNZ8RUUs1apaLL · depth 2 · COMPLETE · handled B1

## J1 · REPORT

For BOB (nothing blocks):
1. **Stale artifact.** My change is under `bio-plane/src/` (comments only, in `public-read/door.mjs`, `public-read/index.mjs`, `publication/worker.mjs`, `container.mjs`, `inband.mjs`), so the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale. I regenerated nothing (manifest, "Generated artifacts").
2. **R7's review-copy half (a reading, no change asked).** R7 says `inbandQuartet` is the one hasher of the container manifest and the review copy. The deleted `test/reviewcopy-inband.test.mjs` proved the "no second site" half by reading source text, which a module test may not do. At my interface, `worker.test.mjs`' R6 arm holds the container manifest's hash to the quartet's. The review copy's call (`op=reviewcopy`) is its own module's to prove; `inband.mjs` now says so.

## J2 · COMPLETE

**Entries applied** (B1).
- **N469.** Every note in my paths that named a deleted file as live is re-worded to the module test that now proves the claim, or made past-tense provenance where the claim was a measurement or a finding:
  - BOB's five: `door.mjs`:40 (now `door.test.mjs`' R1 arm, which holds the whole argument refusal), :73 (`door.test.mjs`' R4 arm, the wrapped envelope); `index.mjs`:726 (`published.test.mjs`' R12 and R13 arms: the deliverer is read from `delivered_by` only, never back-filled), :874 (`meaning-bounds.test.mjs` "(deleted in T20)", past tense: it explains why the query sits here); `publication/worker.mjs`:546 (`convert-publishedcase.test.mjs`' R3 (block 1) arm; "store.mjs states it" re-pointed to `public-read/index.mjs` and C-98.8's row in `checks.mjs`).
  - Found on my re-scan: `index.mjs` :398 "asserted by the suite" (now `published.test.mjs`' R3 and R11 arms); :449 `multicase.test.mjs`'s walk (past tense, "deleted in T20"); :549 "the suite's negative control" (no test held it; R3 names `unresolved`, so I added an R3 arm, below); :637 "this battery" (a dated measurement: "the test battery of the day"); :668 `op-claims` (past tense, "since retired"); :680 `case-opened.test.mjs` (now `convert-publishedcase.test.mjs` for this read's pick and `convert-multifinding.test.mjs` for the container's; `op=ratify`'s is the control plane's); :890 `multicase.test.mjs`'s census and "this helper is in `store.mjs`" (past tense; the callers' answers are held by `published.test.mjs`' R2 and R3 arms); `publication/worker.mjs` :286 "the battery" (a measurement: "the test battery of the day"), :408 "the suite proves that" (now `convert-publishedcase.test.mjs`' R5 (block 3) planted-object arm); `container.mjs`:27 "the suite's strongest assertion" (now public-read's R6 tests, `worker.test.mjs` and `convert-publishedcase.test.mjs` block 4); `inband.mjs`:13 `reviewcopy-inband.test.mjs` (now `worker.test.mjs`' R6 arm for the container; the review copy's half is its own module's, J1 item 2).
  - Two notes named `schema.mjs`, deleted in T19 (`door.mjs`:26, `index.mjs`:374). I re-pointed both to this module's R10, which states the property.
  - Kept as provenance: `index.mjs`:126 ("measured by `rec170-manifest-pair.test.mjs`", a past finding) and the `convert-*.test.mjs` headers.
- Comments only in `src/`.

**Tests:** one new arm in `bio-plane/test/m/public-read/published.test.mjs`: "R3 a serve edge with no published edition behind it is reported in `unresolved`, never dropped and never served". It publishes the target and checks the edge is served. It then purges the target's published row and checks the edge moves to `unresolved` with nothing served.

**Runs:**
- `node --test bio-plane/test/m/public-read/`: tests 71, pass 71, fail 0, skipped 0.
- The manifest names no layer tests. I changed no service.

**Checks:**
- format: 86 modules, 84 requirements files; 0 failures.
- architecture: 25 product files, 69 relative imports; 0 failures.
- coverage: 17 of 17 live requirement ids named by a test; 0 failures.
- ownership: 7 files changed by public-read between tranche/T21 and HEAD; 0 failures.

**Deferred:** none.

**Found in other modules:** see J1. The plane bundle is stale. R7's review-copy half is the review copy's module's to prove.

Size (session_01SbJjiQPQYNZ8RUUs1apaLL): test runs 1, module lines 2165
