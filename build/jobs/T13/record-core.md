# record-core (T13)

**Status** · session_01GSoeuDnnp3sumTtZuq2WZq · depth 2 · COMPLETE · handled B1

## Completion

**Applied** (N322 with N250, on `tranche/T13` at 2b79d7e208):
- **R62** `mintExhausted(prefix, extra?)` is a module-level export of `src/record-core/index.mjs`. It answers `{ok: false, reason: "MINT_EXHAUSTED", code: "MINT_EXHAUSTED", check: "C-59.6", translation, prefix, detail}`. `detail` is one fixed sentence per gated prefix of R3's set: "the plane could not find a free project | case | draft | grant | task id: every one it drew was already taken. Nothing was written." It is the same for every caller and names no count or id. A prefix outside the set, or one that is not a string, names no object (`prefix` is the string asked, or `""`). `extra`'s own fields are added and never replace the answer's (a non-object `extra`, or one whose keys or getters throw, adds nothing). It writes nothing and never throws.
- **Row C-59.6** `MINT_EXHAUSTED` is new in this module's own table, `src/record-core/checks.mjs` `RECORD_CORE_CHECKS` (K174; also re-exported from `index.mjs`). Its `where` is `src/record-core/index.mjs mintExhausted > is-mint-exhausted` (the region is marked), and its translation is review's C-87.12, unchanged. C-59.5 stays in the catalogue.
- The callers (promotion R19, case-authoring R7, review R27, queue R23) are untouched: they change in their own jobs. R62's clause that every act answers through the helper is a `test.todo` naming those jobs.

**Marks my work meets** (for BOB to strike): R62's `*(not yet met: N322)*` for the helper and its row. Its callers' half is met as their jobs land (the todo). The status line's "R62 … not yet met" also applies.

**Check rows for promotion to stamp (N318):** C-59.6 added (record-core `RECORD_CORE_CHECKS.MINT_EXHAUSTED`). None moved or retired here. C-87.12 retires in review's job.

**Deferred.** None.

**Found in other modules and artifacts (reported to BOB, J1):**
- **control-plane**: `MODULE_CHECK_FILES` (`src/control-plane/index.mjs`:775) lists every module's `checks.mjs` for `dec49Row`, and record-core's new file is not in it. The helper spreads its own row, so the wire is complete today. A `dec49Row("MINT_EXHAUSTED")` lookup finds review's C-87.12 until review retires it, and then finds nothing until the list gains `M_RECORD_CORE`.
- **legacy-tests** (`civicos-ui/check-refusal-codes.mjs`, the DEC-49 guard): on `tranche/T13` it fails 4 checks, none of them mine. With this change it fails 13. The 9 new failures:
  - (1) `REVIEW_COPY_CHECKS.MINT_EXHAUSTED and RECORD_CORE_CHECKS.MINT_EXHAUSTED carry the IDENTICAL translation`. This is R62's own wording (the translation is C-87.12's), and it clears when review retires C-87.12 (layer 8).
  - (2)–(9) floor slack, each up by this row and its region: `families` 109→110, `rows` 788→789, `governedSites` 497→498, `regions` 459→460, `regionLines` 5495→5500, `codesChecked` 898→900, `outcomeReturns` 267→268, `refusalsJudged` 862→863.
  - The `MINT_EXHAUSTED` multi-site declaration (line 3781) names C-87.12 and review's region, and needs re-reading once the callers converge.
  - Grep: no hit for `mintExhausted` or `RECORD_CORE_CHECKS` in `civicos-ui/` or affordances. The only `MINT_EXHAUSTED` hits in `civicos-ui/` are that guard's pins and declaration.
- **Generated artifacts made stale** (not rebuilt): `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) and `agent-worker/dist/agent-worker.bundled.mjs`, both carrying `src/record-core/index.mjs` (`fleetbundles.test.mjs`: STALE BUNDLE for both).

**Tests and checks:**
- `node --test test/m/record-core/` (from `bio-plane/`): 58 tests, 57 pass, 0 fail, 1 todo (R62's callers). New: "R62: mintExhausted is the one answer …" (row, every gated prefix, the R9 condition inside a refused transaction writing nothing) and "R62: mintExhausted's extra adds …" (extra never replaces; writes nothing; never throws across odd prefixes and hostile extras).
- `node checks/format.mjs .`: 69 modules, 64 requirements files, 0 failures. `architecture.mjs . record-core`: 4 product files, 8 relative imports, 0 failures. `coverage.mjs . record-core`: 62 of 62 live requirement ids named by a test, 0 failures. `ownership.mjs . record-core tranche/T13`: 0 failures (rerun after commit, below).
- `node civicos-ui/check-refusal-codes.mjs`: 13 failures (4 on the base, 9 above). `node --test bio-plane/test/fleetbundles.test.mjs`: 1 fail (the two stale bundles).

Size (session_01GSoeuDnnp3sumTtZuq2WZq): test runs 8, module lines 1093

## J1 · REPORT

Found outside record-core by R62 (details in my record's Completion):
1. control-plane: `MODULE_CHECK_FILES` (src/control-plane/index.mjs:775) lacks record-core's new `src/record-core/checks.mjs` (`RECORD_CORE_CHECKS`). The helper spreads its own row, so the wire is complete today. But `dec49Row("MINT_EXHAUSTED")` resolves to review's C-87.12 until review retires it, and then to nothing until the list gains `M_RECORD_CORE`.
2. legacy-tests, the DEC-49 guard (civicos-ui/check-refusal-codes.mjs): 4 failures on tranche/T13, 13 with this change. The 9 new ones:
   - the identical translation of REVIEW_COPY_CHECKS.MINT_EXHAUSTED and RECORD_CORE_CHECKS.MINT_EXHAUSTED. This is R62's wording, and it clears when review retires C-87.12 in layer 8.
   - floor slack: families 109→110, rows 788→789, governedSites 497→498, regions 459→460, regionLines 5495→5500, codesChecked 898→900, outcomeReturns 267→268, refusalsJudged 862→863.
   - the MINT_EXHAUSTED multi-site declaration (line 3781) names C-87.12 and needs re-reading once the callers converge.
3. Stale generated artifacts, not rebuilt: bio-plane/dist/bio-plane.bundled.mjs and agent-worker/dist/agent-worker.bundled.mjs (fleetbundles: STALE BUNDLE, src/record-core/index.mjs).
4. Promotion's stamp (N318): C-59.6 added. Nothing moved or retired.

## J2 · COMPLETE

R62 met and tested: mintExhausted(prefix, extra?) exported from src/record-core/index.mjs, its row C-59.6 MINT_EXHAUSTED in src/record-core/checks.mjs (RECORD_CORE_CHECKS, C-87.12's translation). Record-core tests 57 pass, 0 fail, 1 todo (the callers' half, their jobs). format, architecture, coverage (62/62) and ownership: 0 failures. Ready for the early merge (K425). Findings in J1.
