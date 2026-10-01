# retrieval (T21)

**Status** · session_017EMv9TeFvu3SjUe4UdGAch · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied** (B1, `build/plan/current.md` T21 L5):
1. **N458** (K899 (1)): "record" for "bundle" in the text members read. I re-scanned my paths first; the hits were exactly B1's six lines, at the same numbers. `frontier.mjs`:179 and :182, the document level's `note`: "every record it names" and "a referent that cannot be attributed to any record at all" (re-worded, so it does not read "this record cannot attribute to a record"). `index.mjs`:530, the `widen.detail` ("no record matches all of these terms…"); :716 and :737, two syntax sentences ("they answer at RECORD grain", "has:leg asks whether the record carries…"); :759, the `NO_FTS_ID` finding's `detail` ("the record has no text index key"). The interface names stay (N71): `bundle_id`, `bundleId`, `bundle.md`, the `bundles` count key, SQL. Re-keyed tests: `search.test.mjs` R9 (the widen detail) and `legs.test.mjs` R16 (`/RECORD grain/`, and its title). Added: R17 holds the `NO_FTS_ID` detail's new words, and R36/R40 holds that the document note says "record" and not "bundle". Comments that are not read by a member (the JSDoc at `frontier.mjs`:108 and others) are unchanged.
2. **N469** (K931): `index.mjs`:849, `listBundles`' note, said `meaning-bounds.test.mjs` (deleted in T20) pins the no-limit arm complete. It now names the module test that proves it: `roster.test.mjs`' R63 test ("with no limit … the bare array of every row, uncapped"). My re-scan of `src/retrieval/` and `test/m/retrieval/` for any other note naming a deleted file, a battery or a suite as live found none: every test header's "converted from the old battery's …" and "the old suite's …" is provenance and stays (`build/layers.md` rule 6), including `legs.test.mjs`:4.

Text and comments only: no row, code path or answer shape changed; no requirement newly met; nothing awaits stamp.

**Deferred:** none.

**Found in other modules:**
- Generated artifact stale (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`), because `bio-plane/src/retrieval/frontier.mjs` and `index.mjs` changed. I regenerated nothing (REPORT J1). `release/bio-plane.bundled.mjs` also holds the old words; it is the signed release build's (deploy, Bob's act).
- My requirements' R63 still says the bare array's completeness is what "`meaning-bounds.test.mjs` pins", a file T20 deleted. The claim is now held by `roster.test.mjs`' R63 test. Re-wording R63 is BOB's (requirements text); recommended: "(its named consumers need it complete; R63's own test holds it)".
- No other module's test pins the retrieval strings I changed: I grepped `bio-plane/`, `civicos-ui/` and the other fleet members for each old string, and found only the generated bundle and the release build above.

**Tests and checks:**
- `node --test test/m/retrieval/` (from `bio-plane/`): tests 122, pass 122, fail 0.
- `checks/format.mjs`: 86 modules, 84 requirements files; 0 failures.
- `checks/architecture.mjs retrieval`: 23 product files, 76 relative imports; 0 failures.
- `checks/coverage.mjs retrieval`: 67 of 67 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs retrieval tranche/T21`: 6 files changed; 0 failures.

Size (session_017EMv9TeFvu3SjUe4UdGAch): test runs 1, module lines 2345
