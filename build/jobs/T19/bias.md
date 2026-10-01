# bias (T19)

**Status** · session_01NBsR9ExEChyivCpdRoXPVh · depth 2 · COMPLETE · handled B0

## Completion (BIAS #5)

**Entries applied** (B1 START; `current.md` layer 5, bias; requirement as folded, K764):
- **Rule 1, re-points.** `src/bias/checks.mjs` reads `normalizeType` (`record-grammar/types.mjs`), `parseFrontmatter` (`record-grammar/frontmatter.mjs`) and C-26.12 `BIAS_ILLEGAL_TRANSITION` from promotion's row (`promotion/checks.mjs` `PROMOTION_ROW_CHECKS`, joined to `BIAS_CHECKS` by reference, R29 as K587); its header comment re-worded. `src/bias/index.mjs` reads `normalizeType`, `parseFrontmatter`, `MACHINE_AUTHOR_PREFIX`, `isMachineStamp` (`actors.mjs`) and `createSha256` (`sha256.mjs`) from record-grammar. No bias file imports `bio-checks.mjs`.
- **✱ deleted:** the catalogue's `BIAS_CHECKS` (its one row, C-26.12, and its D-468 note), `bio-checks.mjs` −42 lines. Confirmed first over the repository: no importer left in any source or test (the remaining mentions are comments, and the generated `bio-plane/dist` and `release/` bundles).
- **R46:** `biasOf` registers R42's `counts(hid)` once at start through record-core's `registerCounts` under `biasStatements`, `biasAdoptions` (`BIAS_COUNT_KEYS`, exported). `store.mjs`:1197's own spread of `biasOf(...).counts(hid)` stays for legacy-store's job to delete by name; until then both give the same figures under the same keys.
- **K789:** the test world builds credentials after membership (`credentialsOf(ctx, {record, membership}).migrate()`) and the founder claims through `credentials.claim`; `uses` already carried credentials. The 35 accepted reds pass.
- `test/m/bias/checks.test.mjs`: the catalogue parity arm dropped; R29 now asserts C-26.12 is promotion's row itself. New `counts.test.mjs` (R46). No old suite deleted (K619).

**Requirement marks met, for BOB to strike** (with the tests that name them): R46 (`counts.test.mjs`, "R46: counts(hid) is registered once at start…"). R29 as re-pointed (`checks.test.mjs`, "R29: every C-26 row…"). Every other live R stays met, each named: R1–R7, R29, R31, R32 `checks.test.mjs`; R8–R10, R23 `promotion.test.mjs`; R11–R18, R22–R25, R27, R28, R30 `adopt-manifest.test.mjs`; R19–R21 `inhale.test.mjs`; R33–R44 `debt.test.mjs`; R45 `migrate.test.mjs`. R26 stays a `todo` (deferred, K102).

**Deferred:** nothing.

**Found elsewhere (REPORT):**
- `bio-plane/dist/bio-plane.bundled.mjs` (not product, BOB's regeneration at the layer close) is stale: it holds the catalogue's `BIAS_CHECKS` and bias's old imports.
- `test/m/legacy-checks/catalogue.test.mjs`:273 "rule 2 LEGACY_GRAMMARS fills six of record-grammar's EXTENSION_ARMS slots" fails on `tranche/T19` with my change stashed too (a C-2.7 entry where the test expects none): legacy-checks', not caused here.
- `civicos-ui/check-refusal-codes.mjs` (an old guard, not run, P11) counts `*_CHECKS` families; bias's own `BIAS_CHECKS` still exists, so the family name stays, but its `families` floor may read one fewer catalogue family at the next regression.

**Tests and checks run:**
- `node --test test/m/bias/*.test.mjs`: tests 56, pass 55, fail 0, todo 1 (R26). Before: pass 19, fail 35 (K789).
- `node --test test/m/record-core/ test/m/promotion/ test/m/legacy-checks/` (my registration and the catalogue deletion): pass 211, fail 1 (the pre-existing legacy-checks failure above, identical without my change).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bias`: 11 product files, 38 imports, 0 failures. `checks/coverage.mjs bias`: 46 of 46 live ids named, 0 failures. `checks/ownership.mjs bias tranche/T19`: legacy-checks 0 added, 42 removed; 0 failures.

Size (session_01NBsR9ExEChyivCpdRoXPVh): test runs 8, module lines 1813

## J1 · COMPLETE

BIAS #5 complete on job/T19/bias (record's Completion section). Applied: rule 1 re-points (checks.mjs and index.mjs to record-grammar; C-26.12 read from promotion's PROMOTION_ROW_CHECKS by reference), the catalogue's BIAS_CHECKS deleted (no importer left; bio-checks.mjs -42), R46 counts registered with record-core under biasStatements/biasAdoptions, K789 credentials in the test world. R met for you to strike: R46 (counts.test.mjs), R29 as re-pointed (checks.test.mjs); all other live Rs still named and passing. Tests: bias 55 pass, 0 fail, 1 todo (R26). Checks: format, architecture, coverage 46/46, ownership all 0 failures. Reports: bio-plane/dist bundle stale (yours at the close); legacy-checks catalogue.test.mjs:273 fails on tranche/T19 without my change too; the old refusal-codes guard's families floor may move at the next regression. No merge-early obligation.
