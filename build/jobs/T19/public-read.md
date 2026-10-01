# public-read (T19)

**Status** · session_012N1gfy5QA5rP3F2eTHXTkt · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`build/plan/current.md` layer 8, public-read, amended; B1):
- **Rows C-44.2, C-68.5, C-98.1–.9 into its own `checks.mjs` (K651; R17).** New `bio-plane/src/public-read/checks.mjs`: `CASE_RESOLUTION_CHECKS` (C-44.2), `PUBLISHED_STORE_CHECKS` (C-68.5), `PUBLISHED_READ_CHECKS` (C-98.1–.9), copied from `publication/checks.mjs` with their numbers, `where`s and translations unchanged (byte-identical, checked against publication's table before the copy) and the family names kept; `rowOf(code)` answers `{code, check, translation}` for these eleven codes and throws for any other (own keys only, so `constructor`/`toString` throw too). Every raiser now reads its row from here: `public-read/index.mjs` (C-44.2, C-98.8) and `publication/worker.mjs` (C-68.5, C-98.1–.4, .9, and the `container.mjs` refusals C-98.5–.7 decorated there). No `where` changed, so no row is `awaiting stamp`. `publication`'s copies stay in its table until its job deletes them (publication R33).
- **`caseTensionsOf` and `caseDocumentBlocks` from `case-grammar` directly** (PUBLIC-READ #1's deferral): `public-read/index.mjs` imports them from `../case-grammar/index.mjs`, no longer through `publication/index.mjs`' re-export. The Worker's `caseDocumentStatesMemberBlocks` likewise now comes from `case-grammar` (it came through `publication/checks.mjs`' re-export).
- **Rule 1: no public-read file imports `bio-checks.mjs`.** `publication/worker.mjs`:17 re-pointed to record-grammar (`parseFrontmatter` `frontmatter.mjs`, `normalizeType` `types.mjs`, `sectionText` `document.mjs`; the same functions the catalogue re-exports), and `test/m/public-read/convert-d442-publish-writes-nothing.test.mjs`:18 (`parseFrontmatter`) to `record-grammar/frontmatter.mjs`.
- **Worker files stay at their paths** (change 8): moot, nothing moved.
- **Own improvements:** the Worker's header and R comments re-worded to this module's ids (R3, R5, R6, R9; it called itself publication's and cited publication R10/R13/R15/R48), and the stale "joins this module's paths at publication's merge" notes in `index.mjs` and `door.mjs` corrected. Tests re-pointed off publication's re-exports to their owners: `rowOf` (published, worker, convert-publishedcase) to `public-read/checks.mjs`; `caseTensionsOf`/`caseDocumentBlocks` and friends (tensions, sources) and `publishedGraphEdges` (convert-publishedcase) to `case-grammar`. No old suite deleted (K619).

**R met, with its test (for BOB to strike, K775 (6)):** R17 — `test/m/public-read/checks.test.mjs`: "R17 the module holds C-44.2, C-68.5 and C-98.1–C-98.9 in its own table…" (families, numbers, `where`s and translation digests pinned; `rowOf` and its throw) and "R17 every refusal the module answers with one of these codes, at every site that raises it, carries its row from here" (all eleven codes driven at every raising site: store reads, the Worker's relays, publishedbytes by part, by container and by case document, publishedcase's finding body). R1–R16 unchanged and still met by their tests.

**Deferred:** none.

**Found, for BOB (also in REPORT):**
- **control-plane** (its R22, layer 11): `CHECK_FAMILY_FILES` (`control-plane/families.mjs`) does not list `src/public-read/checks.mjs`, so `test/m/control-plane/families.test.mjs`' totality arm now also names public-read's three families. That arm is already red at the tranche head (credentials, inquiry-grammar, basis-versions files), so the suite's count is unchanged. Until publication deletes its copies the codes still resolve through publication's table; once it does, `dec49Row` reaches C-44.2, C-68.5 and C-98 only if the list names this file, so the list should gain it no later than publication's deletion lands (one line, control-plane's).
- **Requirements/uses (BOB's):** `public-read.md`'s Uses still says `legacy-checks: parseFrontmatter, normalizeType, sectionText`; after rule 1 those are read from `record-grammar` (already a `uses` edge), and no public-read file imports `legacy-checks` any more, so the `legacy-checks` edge in `modules.json` and that Uses line can go.
- **Generated artifacts:** none made stale (no bundle takes these files).

**Tests and checks:**
- `node --test bio-plane/test/m/public-read/`: tests 67, pass 67, fail 0.
- Users of the touched files (control-plane, publication, ratification, filings, legacy-store, case-grammar, and the old suites importing `publication/worker.mjs`): counts identical with and without this change (control-plane 84/1, publication 71/19, ratification 87/81, filings 45/0, legacy-store 4/0, case-grammar 20/0).
- `test/m/` whole: tests 4519, pass 4325, fail 174; every failing test also fails at `tranche/T19` @ 3c731d90b5 (177 there, the three extra being environment-only), none new.
- `checks/format.mjs`: 87 modules, 0 failures. `checks/architecture.mjs … public-read`: 24 files, 67 imports, 0 failures. `checks/coverage.mjs … public-read`: 17 of 17, 0 failures. `checks/ownership.mjs … public-read tranche/T19`: 12 files, legacy-index 0 lines, 0 failures.

Size (session_012N1gfy5QA5rP3F2eTHXTkt): test runs 9, module lines 2159
