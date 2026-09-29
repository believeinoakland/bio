# review (T13)

**Status** · session_01P7YNYC4HwY5uqrXFyjyZpM · depth 2 · WORKING · handled B0

## Completion (REVIEW #4, 2026-09-29)

**Applied.** N322, as R27. `#draft`'s new draft and `#grant` answer `MINT_EXHAUSTED` through `record-core.mintExhausted` (its R62): prefix `DRAFT` gives a free draft id, `RVG` a free grant id. The answer is record-core's, byte for byte, under its row C-59.6. Nothing is written, because the mint still comes before each insert. The local helper `mintExhausted(what)` and its DEC-49 region `is-review-mint-exhausted` are gone. **C-87.12 is retired** from `src/review/checks.mjs` (`REVIEW_COPY_CHECKS`), and its number is not reused. The header comments now say so. The new import (`mintExhausted` from `../record-core/index.mjs`) is on the existing `record-core` edge in `modules.json`.

**awaiting stamp: C-87.12 retired** (promotion R50, K408 (2); N318). This is the one check row this job moved. Row removed: C-87.12 `MINT_EXHAUSTED`, `REVIEW_COPY_CHECKS`, `src/review/index.mjs mintExhausted > is-review-mint-exhausted`. Its one row is now record-core's C-59.6.

**Tests** (`test/m/review/`):
- `acts.test.mjs` R27: both arms at the interface, with the minter answering none. Two new drafts, one of them naming a case with `newCase`, and one grant. Each answer is `deepEqual` to `mintExhausted("DRAFT")` or `mintExhausted("RVG")`, carrying C-59.6 and record-core's translation. The prefix and detail name the id. The whole-store snapshot is unchanged. An edit in place is neither minted nor refused. Earlier refusals still come first. Both acts succeed once the minter answers again.
- `invariants.test.mjs` R23/R27: the family is C-87.1–C-87.11 plus C-32.16. `MINT_EXHAUSTED` is absent from `REVIEW_COPY_CHECKS`, and no row, here or in the catalogue, holds C-87.12.
- No `test.todo`.

**Deferred.** None.

**For BOB:**
1. **Requirements.** R27 is met. Please strike its `*(not yet met: N322)*` mark and "Not yet met: R27" on the Status line. R23 still lists "C-87.1–C-87.12, C-32.16"; with R27 it should read "C-87.1–C-87.11, C-32.16 (C-87.12 retired, R27)". Both edits are outside my write scope.
2. **legacy-tests.** `bio-plane/test/d448-review-copy-translation.test.mjs` pins the family at 12 codes including `MINT_EXHAUSTED`. It is green on `tranche/T13` and red here: "want 12, got 11", and its arm counts are `[false,false,2]` against `[true,true,3]`. It needs a re-pin back to 11.
3. **The DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`) goes from 16 failures on `tranche/T13` to 13 here:
   - The failure "REVIEW_COPY_CHECKS.MINT_EXHAUSTED and RECORD_CORE_CHECKS.MINT_EXHAUSTED carry the IDENTICAL translation" is gone.
   - `regions` is back at its floor (459).
   - `refusalsJudged` is back at its floor (862).
   - Slack falls by one or more on `rows` (790→789), `governedSites` (499→498), `regionLines` (5502→5498) and `codesChecked` (901→900). Those ratchets were already failing on the base, and their floors are legacy-tests' to re-pin.
4. **gate.mjs** (not mine). The comments at lines 304–305 and 321 describe C-87.12 as retiring "later" or "after this stamp". That wording is for the stamp's owner to refresh.
5. **Generated artifact.** `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) still carries review's old region and is now stale. I did not rebuild it.
6. **Greps.** Nothing in `civicos-ui/` or in affordances' lists names `MINT_EXHAUSTED`, C-87.12 or the retired helper. The only hits are the guard's floor comments. No module uses `review`, so there were no dependents' suites to run.

**Tests and checks run:**
- `node --test bio-plane/test/m/review/`: tests 30, pass 30, fail 0, todo 0.
- `bio-plane/test/refusal-wire.test.mjs`: pass.
- `civicos-ui/test/review-copy.test.mjs`: pass 1, fail 0.
- `bio-plane/test/d448-review-copy-translation.test.mjs`: 1 fail here, 0 on base (item 2).
- `civicos-ui/check-refusal-codes.mjs`: 13 failures, against 16 on base (item 3).
- `format`: 69 modules, 64 requirements files, 0 failures.
- `architecture`: 8 product files, 31 relative imports, 0 failures.
- `coverage`: 27 of 27 live requirement ids named by a test, 0 failures.
- `ownership` (against `tranche/T13`): 5 files, legacy-store and legacy-checks 0 lines added or removed, 0 failures.

Size (session_01P7YNYC4HwY5uqrXFyjyZpM): test runs 7, module lines 1009
