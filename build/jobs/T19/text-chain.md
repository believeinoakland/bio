# text-chain (T19)

**Status** · session_01JFaNkersyiBgEDxNLun4KD · depth 2 · WORKING · handled B3

## J1 · QUESTION

Two things need R wording in `build/requirements/text-chain.md`; I am building against this reading meanwhile (ids R92–R103 proposed, next free after R91).

**1. The extent algebra copied in (B1, draft-T19 line 28).** Copied whole from `checks/bio-checks.mjs` 6626–6728 and 7026–7169; the catalogue keeps its copy untouched. `canonicalJson` is read from record-grammar (its R12), so Uses gains it. Proposed, a new Provides section "The content-extent algebra":
- **R92** `CONTENT_EXTENT_KINDS` is a plain object whose keys are exactly `document`, `pdf-page`, `sheet-cell`, `slide-shape`, `doc-para`, `sheet-range`, `doc-table`, `image`, in that order, each `{landed: true, human: <its phrase>}` with the catalogue's phrases; `dom` is not a key.
- **R93** `CONTENT_EXTENT_A1_RE` matches exactly a cell in A1 notation (an optional `$`, 1–3 letters of either case, an optional `$`, a row 1–9999999 with no leading zero); `CONTENT_EXTENT_RANGE_RE` matches such a cell or two joined by `:`.
- **R94** `a1ToRowCol(cell)` → `{col, row}`, both 1-based, the column bijective base 26 (A=1, Z=26, AA=27, ZZ=702, AAA=703), `$` dropped and case folded; `null` for anything else.
- **R95** `rangeCorners(range)` → `{r0, c0, r1, c1}` with each pair ordered (min, max), a single cell being a one-cell range, `null` unless the trimmed input matches `CONTENT_EXTENT_RANGE_RE`; `canonicalRange(range)` → `"<col0><r0>:<col1><r1>"`, upper case, no `$`, always two corners, `null` when `rangeCorners` is.
- **R96** `contentCitedAs(extent)` → the extent's `cited_as` unchanged when present and not `""`; else `"bytes"` for an `image` and `"text"` for every other kind (a non-object reads as `{}`).
- **R97** `canonicalExtent(extent)` → `canonicalJson` of the arm's fixed fields, absent ones `null`, `ref` never among them: `document` {kind}; `pdf-page` {kind, page, rect min/max-normalised}; `sheet-cell` {kind, sheet trimmed, cell trimmed, `$`-free, upper case}; `slide-shape` {kind, slide, shape}; `doc-para` {kind, para, run}; `sheet-range` {kind, sheet, range = `canonicalRange`}; `doc-table` {kind, table, cell as sheet-cell's}; `image` {kind, cited_as = `contentCitedAs`, part trimmed lower-case, page, rect as pdf-page's}; integers only where an index is meant; any other kind `{kind: kind ?? null, fields: fields ?? null}`. Byte-identical to the catalogue's `canonicalExtent` for every input while the catalogue holds its copy (content ids are taken over it).
- **R98** `describeExtent(extent)` → an authored non-blank `ref`, trimmed; else the derived form per arm (`the whole document`; `page <n+1>` or `page <n+1>, a region of it`; `<sheet>!<cell>`; `¶<para+1>`; `slide <slide>`; `<sheet>!<canonical range>`; `table <t+1>[, <CELL>]`; `image <part, 12 chars>` or `an image on page <n+1>`), each arm's fallback phrase when its fields are missing, the kind's `human` for a landed kind otherwise, and `a part of this document the record cannot name` for any other kind (own keys only: a kind such as `constructor` reads as unknown). All of R92–R98 never throw.

**2. N416.** Every name but one has a user outside text-chain (`extraction/pipeline.mjs` imports `stepCovers`; legacy-tests' `textchain.test.mjs`, `reading-position.test.mjs`, `tier2-wire.test.mjs` and `tier-pagewise.probe.mjs` import the rest, and K619 keeps them), so I propose Rs rather than internalising:
- **R99** `weaker(a, b)` → the weaker (higher `BASIS_GRADES` index) of two grade letters; `null` when either is not a `BASIS_GRADES` letter.
- **R100** `stepCovers(step, page)` → `false` for a non-object step; `true` for an unscoped step (no `extent`); `false` for an extent this module cannot read (R22's unreadable case, R30); else `true` exactly when `page` is an integer in the extent's pages.
- **R101** `CONFIDENCE_BASES` is a plain object whose keys are exactly `engine` and `none`: the bases R42 admits.
- **R102** `perPageTierWinner(p1, p2)` → `"tier1"` when `p2` is absent, `"tier2"` when `p1` is absent, else `"tier2"` exactly on R76's two conditions and `"tier1"` otherwise; `TIER_RULE` is a non-empty sentence stating that rule (fewer undetermined characters and more glyphs, else tier 1).
- **R103** `READING_POSITION_KINDS` is a plain object whose keys are exactly R61's four arms; `READING_POSITION_UNPRODUCED` is `"dom"`, the IC-1 arm `readingSource` answers `null` for.
- `EXTENT_KINDS`: **made internal** (no importer anywhere; only `nc-cpdf10.mjs`'s source-text mutation names it, and its line is unchanged).

## J2 · COMPLETE

Done at `job/T19/text-chain` @ 31d9ca7b92 (tranche/T19 @ 23f693d911 merged in after B3).

**Entries applied**
- The extent algebra copied into `bio-plane/src/textchain.mjs` (R92–R98, K747): `CONTENT_EXTENT_KINDS`, `CONTENT_EXTENT_A1_RE`, `CONTENT_EXTENT_RANGE_RE`, `a1ToRowCol`, `rangeCorners`, `canonicalRange`, `contentCitedAs`, `canonicalExtent`, `describeExtent` (and `a1Letters`, private); `canonicalJson` read from record-grammar. The catalogue's copy is untouched (ownership: legacy-checks 0 added, 0 removed). Two deliberate differences, both on inputs where the catalogue's copy does not answer a string: `a1ToRowCol`/`rangeCorners` never throw (R83; the catalogue's throw on a value with no string form, e.g. `Object.create(null)`), and `describeExtent` reads only own keys of `CONTENT_EXTENT_KINDS` (R98). `canonicalExtent` is byte-identical to the catalogue's over a 2,000+-input sweep of every kind, field and malformation (`extent.test.mjs`).
- N416 (R99–R103, K747): `weaker`, `stepCovers`, `CONFIDENCE_BASES`, `perPageTierWinner`, `TIER_RULE`, `READING_POSITION_KINDS`, `READING_POSITION_UNPRODUCED` stay exported, now named and tested; `EXTENT_KINDS` made internal (its source line, which `nc-cpdf10.mjs` mutates, is unchanged).
- Improvement in my own module: the sheet-range containment's private `a1Cell` now reads the algebra's cell (`CONTENT_EXTENT_A1_RE` + `a1ToRowCol`) instead of a third spelling of the A1 pattern; R72's behaviour unchanged.

**Deferred:** nothing.

**Found elsewhere (REPORT)**
- Generated artifact staled: `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`): `fleetbundles.test.mjs`' bio-plane arm reports STALE BUNDLE for `src/textchain.mjs`. Not regenerated (§14); BOB's layer-close regeneration covers it.
- legacy-checks (catalogue copy, deleted by reevaluation in L7): `a1ToRowCol`/`rangeCorners` throw `TypeError` on a value with no string form, and `describeExtent({kind: "constructor"})` answers `undefined` rather than a sentence. Low priority given the deletion; importers re-pointing here get the total versions.
- Red at baseline and unchanged by this job (legacy-tests' old suites): `test/textchain.test.mjs` and `test/transcribe.test.mjs` import `TEXT_CHAIN_CHECKS` from the catalogue (it moved to text-chain in T18), `test/extractrun.test.mjs` imports `AI_RUNS_CHECKS` from `ai-runs/index.mjs`, `test/reading-position-occurrences.test.mjs` imports `CONNECTION_CHOICE_CHECKS` from the catalogue; `test/system/bounds.test.mjs` (13 FAIL lines) and `test/system/ocr-member-e2e.test.mjs` fail identically with and without this change.

**Tests and checks**
- `node --test test/m/text-chain/`: tests 112, pass 112, fail 0, skipped 0.
- Users' module suites (`test/m/` extraction, content, basis-versions, query-language, control-plane, connections, ocr-worker): tests 577, pass 577, fail 0.
- `format`: 83 modules, 78 requirements files; 0 failures · `architecture`: 10 product files, 16 relative imports; 0 failures · `coverage`: 103 of 103 live requirement ids named by a test; 0 failures · `ownership` (civicos-process @ d52122e): 4 files changed by text-chain; legacy-checks: 0 line(s) added, 0 removed; 0 failures.

Size (session_01JFaNkersyiBgEDxNLun4KD): test runs 11, module lines 2026
