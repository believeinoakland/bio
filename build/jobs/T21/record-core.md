# record-core (T21)

**Status** · session_015o5zPpvnxZMQdCfaHQg4En · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T21 L2):
1. **N458** (K899 (1)): `snapKeyCensus`' `note` (`src/record-core/index.mjs` :801–802) says "a record whose manifest holds fewer rows…" and "one promotion of a record with no creation row". A re-scan of my paths found no other "bundle" in text a member reads: no refusal `detail`, row translation or op help in `checks.mjs` or `index.mjs` uses it. The interface names stay (N71): the `bundles`, `bundles_with_deficit` and `orphan_manifest_bundles` fields, `bundle_id`, `bundle.md`, SQL. No test pinned the old words.
2. **N468** (K923): R74's comments (`index.mjs` :916–927) now say that plane registers the export under this module's name and that the module registers nothing itself. The "held copy" provenance now reads "moved here from the plane in T20 (K861)". R74's tests (`test/m/record-core/record-core.test.mjs`): the sight comment, the figures comment, the title ("as R74 counts them"), the NULL-reading comment, and the helper `heldFigures` renamed `expectedFigures`. The pinned values are unchanged. Also re-worded: the R64 stats-source stand-in's comment, which named legacy-store's `#counts` as the source.
3. **N469** (K931): `src/record-core/schema.mjs` :101 named `hygiene.test.mjs` (deleted in T20). It now names the module test that proves the claim: R23's whole-store purge test in `test/m/record-core`, which keeps `minted_ids` beside `seq`. My re-scan found one more: `test/m/record-core/storage.mjs` :5–6 said "the legacy battery exercises the same module inside Miniflare". It now names the plane's live Miniflare suites (`test/stats-disclosure.test.mjs`, `test/members.test.mjs`). "Measured in Miniflare" (`index.mjs` :345) is provenance and stays.
4. **K939** (RECORD-GRAMMAR #4 J1): I re-keyed the two R67 tests to the slot that now claims `C-2.9` only. In the malformed list, `['C-9.1']` alone and `['C-2.7','C-2.8','C-9.1']` are now accepted, so I dropped them and added a real partial-slot case, `['C-2.7','C-2.8','C-18.7']`. A second claim of `C-9.1` is now `GRAMMAR_DECLARED` (`id: 'C-9.1'`), with a separate case still holding `C-800.1`. In the K766 test, `b` claims `C-2.9` alone, and a third registration claiming `C-9.1` is shown `GRAMMAR_DECLARED`. The code was already right under R67 and is unchanged.

Code changes are comments and one note's text only: no row change, nothing awaits stamp, no requirement newly met.

**Deferred:** none.

**Found in other modules:**
- The plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` (`.bundle.json`, owner `not_product`) is stale, because two files under `bio-plane/src/record-core/` changed (REPORT J2). Nothing was regenerated.
- `test/m` holds 45 failures, all red on `tranche/T21` before this job, in modules later in the order: filings (35: approve-send 6, outward 5, packet 1, premise 2, prepare 9, reads 6, refusals 2, sight 4), project-stage `stage` 5, intent `grammar` 1, membership `module-order` 1 and `t9-notice-sight-bounds` 1, promotion `promote` 1 and `registry` 1. A clean `origin/tranche/T21` checkout at b6bba07ff7 ran 50 failures. That figure is those 45, plus my two R67 tests, plus three that passed in this checkout and failed in the side worktree (the test sandbox's read-only removal R2, `extraction/convert-tiers`, `extraction/staffdirectory`). None of these is new red.

**Tests and checks:**
- `node --test test/m/record-core/` (from `bio-plane/`): tests 92, pass 92, fail 0. Before the re-keys: 90 pass, 2 fail, the two R67 tests named in B1.
- Whole `test/m`: tests 4681, pass 4616, fail 45, todo 20. No new red: compared by test name against `origin/tranche/T21` (4670 tests, 50 fail).
- `checks/format.mjs`: 86 modules, 84 requirements files; 0 failures.
- `checks/architecture.mjs record-core`: 5 product files, 9 relative imports; 0 failures.
- `checks/coverage.mjs record-core`: 74 of 74 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs record-core tranche/T21`: 5 files changed; 0 failures.

Size (session_015o5zPpvnxZMQdCfaHQg4En): test runs 5, module lines 1686
