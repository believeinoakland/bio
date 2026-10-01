# reevaluation (T19)

**Status** · session_01WArww1p9WPhPW7tHUiPSts · depth 2 · COMPLETE · handled B1

## Completion (REEVALUATION #9, session_01WArww1p9WPhPW7tHUiPSts)

**Entries applied** (`build/plan/current.md` layer 7, as amended by B1):
- Rule 1 re-points, so no reevaluation file imports `bio-checks.mjs`: `src/reevaluation/checks.mjs` (`ISO_TS_RE` from record-grammar's `ids.mjs`); `index.mjs` (`normalizeType`, `parseFrontmatter`, `isMachineIdentity`, `MACHINE_CLASS_PREFIX`, `sha256HexSync` from record-grammar; `VERSION_NAME_RE` from basis-versions; `GROUND_LABEL_RE` from inquiry-grammar; `canonicalExtent` from text-chain's `textchain.mjs`); `test/m/reevaluation/fixture.mjs` (`parseFrontmatter`, record-grammar); `checks.test.mjs` (`checkBundle`, record-grammar's, with no grammars: the R23 arm asks only that C-10.1 is not the record grammar's, which needs none). `index.mjs`'s header comment re-worded ("the check catalogue", and what it reads from where).
- N433's share: none (B1, K766).
- **The catalogue's extent algebra and `VERSION_NAME_RE`: nothing deleted.** Each name is still referenced by catalogue code that stays: `canonicalExtent` by `extentRelation`; `describeExtent`, `CONTENT_EXTENT_KINDS`, `CONTENT_EXTENT_A1_RE`, `rangeCorners`, `contentCitedAs` by `checkContentExtent` (and `a1ToRowCol` through its `coversSheetCell`, `coversSheetRange`, `coversDocTable`); `canonicalRange` by `canonicalExtent`, `describeExtent`; `CONTENT_EXTENT_RANGE_RE`, `a1ToRowCol` by `rangeCorners`; `VERSION_NAME_RE` by `basisVersionFindings`. Deleting any would leave a held function naming an undefined binding. See the REPORT for who reaches those callers.

**Fixed in my own module:** the R27 claim-referent test (`corrected.test.mjs`:62) was red on the branch before any change ("no K2 pair formed"): contradiction now reads the subject entity from inquiry's `inquiry_bundle_facts` (N136, T19 L6), and the fixture's `claim()` still wrote `bundles.inquiry_subject_entity`. The fixture now seeds `inquiry_bundle_facts`, as contradiction's own fixture does.

**Deferred:** none.

**Found in other modules** (REPORT J2):
- legacy-checks: the callers that hold the algebra (`checkContentExtent` with its `covers*` helpers, `extentRelation`, `basisVersionFindings`, `checkLegExtentGrammar`, `legExtent`) have no named importer in product source (only `*` namespace imports: control-plane's `families.mjs`, which composes the row tables; the C-45 rows' `where` still names `checks/bio-checks.mjs checkContentExtent > is-content-extent`). Their live copies are content's `extent-core.mjs`, basis-versions' and inquiry-grammar's. They go, and the algebra and `VERSION_NAME_RE` with them, when the catalogue is deleted whole (control-plane's last act, K786) or when their owners' rows are re-pointed; text-chain's `extent.test.mjs` parity arm (N446) reads the catalogue's copies until then. Old suites (`test/content-extent*.test.mjs`, `fw19-extent-arms`, `cpdf18-pdf-images`, `rec85-arm-digest`) import them too (K619).

**Tests and checks:**
- `node --test test/m/reevaluation/` (bio-plane): tests 73, pass 73, fail 0, skipped 0. No layer tests are named in the manifest; no service I provide changed.
- `format`: 87 modules, 82 requirements files; 0 failures.
- `architecture reevaluation`: 13 product files, 57 relative imports; 0 failures.
- `coverage reevaluation`: 28 of 28 live requirement ids named by a test; 0 failures.
- `ownership reevaluation tranche/T19`: 5 files changed; legacy-store 0 added, 0 removed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01WArww1p9WPhPW7tHUiPSts): test runs 4, module lines 26 (16 added, 10 removed)

## J1 · REPORT

legacy-checks: the catalogue's extent algebra (canonicalExtent, describeExtent, CONTENT_EXTENT_KINDS, CONTENT_EXTENT_A1_RE, CONTENT_EXTENT_RANGE_RE, rangeCorners, canonicalRange, contentCitedAs, a1ToRowCol) and VERSION_NAME_RE all STAY: each is still referenced by held catalogue code (extentRelation -> canonicalExtent; checkContentExtent and its covers* helpers -> describeExtent and the rest; basisVersionFindings -> VERSION_NAME_RE). Those callers have no named importer in product source (only control-plane families.mjs' namespace import, which composes the row tables; the C-45 rows' where still names 'checks/bio-checks.mjs checkContentExtent > is-content-extent'). Their live copies are content extent-core.mjs, basis-versions and inquiry-grammar. So they, the algebra and VERSION_NAME_RE go together at the catalogue's whole deletion (K786) or when their owners' rows are re-pointed; text-chain's extent.test.mjs parity (N446) and old suites (K619) read them until then. Nothing deleted from legacy-checks; ownership 0 lines there.

## J2 · COMPLETE

Rule-1 re-points done: no reevaluation file imports bio-checks.mjs (record-grammar, basis-versions, inquiry-grammar, text-chain); index.mjs header re-worded. Catalogue deletion: nothing deletable (REPORT J2 names what stays and why). Fixed in my own tests: the R27 K2 fixture seeded bundles.inquiry_subject_entity; contradiction now reads inquiry_bundle_facts (N136), so corrected.test.mjs:62 was red on the branch before my change; now seeded there. Tests 73/73; format, architecture, coverage (28/28), ownership 0 failures. Record: build/jobs/T19/reevaluation.md on job/T19/reevaluation.
