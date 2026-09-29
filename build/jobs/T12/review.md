# review (T12)

**Status** · session_012Ut7sA7iL6CYNPX5ux1UVU · depth 2 · COMPLETE · handled B1

## Completion (REVIEW #3, 2026-09-29)

**Applied.** N306, as R27 (K392): `MINT_EXHAUSTED` is one row, C-87.12, in `src/review/checks.mjs`'s `REVIEW_COPY_CHECKS` (K231). Both mint sites, `#draft`'s new draft and `#grant`, answer it through one helper, `mintExhausted(what)`, with one DEC-49 region, `is-review-mint-exhausted`, as `notReviewOwner` does. The detail names the id it could not mint ("a free draft id", "a free grant id") and says nothing was written. Nothing is written: the mint comes before each insert, and a `null` from `mintOpaqueId` records no id (record-core R7, R9). The answer is additive on the wire: `reason` is unchanged, and `code`, `check` and `translation` join it.

**Tests** (`test/m/review/`). `acts.test.mjs` R27 covers both arms at the interface, with record-core's `mintOpaqueId` answering none: two new drafts and one grant; the full refusal with its row; the detail naming each id; a whole-store snapshot unchanged; an edit in place that mints nothing and is not refused; the earlier refusals still coming first; both acts succeeding once the minter answers again. `invariants.test.mjs` R23 now holds C-87.1–C-87.12, and its battery drives the new row. No `test.todo`.

**Deferred.** None.

**For BOB.**
1. **Requirements.** R27 is met: please strike its `*(not yet met: N306)*` mark and the Status line's "Not yet met: R27" in `build/requirements/review.md`. That file is outside my write scope.
2. **promotion R34 (N318).** Row added: C-87.12 `MINT_EXHAUSTED`, `REVIEW_COPY_CHECKS`, `src/review/index.mjs mintExhausted > is-review-mint-exhausted`. It is for the next tranche's `CATALOG_VERSION` stamp and census re-pin.
3. **legacy-tests, re-anchoring.**
   - `test/d448-review-copy-translation.test.mjs` pins the family at eleven codes: "want 11, got 12", and the pinned numbering lacks `MINT_EXHAUSTED`. It is green on `tranche/T12` and red only for this row.
   - `civicos-ui/check-refusal-codes.mjs` (the DEC-49 guard) has 25 failures on `tranche/T12` and 27 here. The two new ones:
     - (a) arm F: 286 untranslated codes against a floor of 287. `MINT_EXHAUSTED` left the untranslated set.
     - (b) arm G: `MINT_EXHAUSTED` is now a row minted at three literal sites: case-authoring, promotion and review. This is the multi-site state next.md N322 retires into record-core. Until then it needs a `MULTI_SITE_CLOSED` entry, or N322.
     - The rows, reach, governedSites, regions, regionLines, codesChecked and refusalsJudged figures each rose by 1, or by 4 for regionLines. These ratchets were already failing on the base.
   - `test/d470-catalog-census.test.mjs` and `test/machinefences-dec49.test.mjs` are red on `tranche/T12` already and are unchanged by this work.
4. **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) carries review's source and is now stale. I did not rebuild it.
5. **Greps.** `civicos-ui/` and affordances' lists: no hit for `MINT_EXHAUSTED`. No module uses `review` (modules.json), so there were no dependents' suites to run.

**Tests and checks run.**
- `node --test bio-plane/test/m/review/`: tests 30, pass 30, fail 0, todo 0.
- `civicos-ui/test/review-copy.test.mjs`: pass 1, fail 0.
- `bio-plane/test/refusal-wire.test.mjs`: pass 1, fail 0.
- `format`: 69 modules, 64 requirements files, 0 failures.
- `architecture`: 8 product files, 30 relative imports, 0 failures.
- `coverage`: 27 of 27 live requirement ids named by a test, 0 failures.
- `ownership` (against `tranche/T12`): 5 files, legacy-store and legacy-checks 0 lines added or removed, 0 failures.

Size (session_012Ut7sA7iL6CYNPX5ux1UVU): test runs 3, module lines 1025
