# office-readers (T9)

**Status** · session_01US5MKSyeetAVCERbaBowrE · depth 2 · WORKING · handled B0


## Completion (OFFICE-READERS #2)

OFFICE-READERS #1 left no record or commit on this branch; #2 started the job from B1.

**Entries applied** (plan layer 1, the office-readers bullet): N27, its share. `a1Corner` and `rangeUnitFor` (already exported from `formats-xlsx.mjs` by the T2 job's D-415 work) are made fit to be provided services and tested at the interface, for odf-reader's `.ods` half:
- `a1Corner(s)` answers `null` for any non-string (it read `String(s)` before, so a `String` object or a value whose string form looked like a corner was read as one).
- `rangeUnitFor(sheetName, a, b, sheets, grid = null)` never throws (R21): a corner that is not `{col, row}` of positive integers is `{why: "not_a_range_reference"}`; a non-string sheet name, or `sheets` that is not an array, is `{why: "no_such_sheet"}` (before, `rangeUnitFor(null, …)` could match a sheet named `"null"`, and a missing `sheets` or corner threw). `grid` defaults to none, the `.ods`/csv case.
- Proposed Provides text for BOB to fold (numbered after R25): see J1. The tests name them as R26 and R27 on that proposal; if BOB numbers them otherwise I re-title on the CHANGE.

**Improvement in my module:** the private `a1Col` (the used-extent walk's column reader) was a second copy of `a1Corner`'s column arithmetic; it now calls `a1Corner` (one code one site, K231). The one behaviour difference: a cell reference with row 0 or a leading-zero row (`Z0`), which is no address, no longer reaches `usedCols`; R11's "furthest cell this walk actually saw" and the helper's own "skipped, never scored" rule both want that. Tested.

**Deferred:** none.

**Found in other modules:**
- Generated artifact `bio-plane/dist/bio-plane.bundled.mjs` (not_product; built from the plane's source) is stale by `formats-xlsx.mjs`. Not rebuilt (§14).
- odf-reader: its `.ods` range grammar (`$Sheet1.$A$1:.$B$2`) is its own to parse; it passes each corner's A1 part to `a1Corner` and calls `rangeUnitFor(sheet, a, b, sheetNames, null)` (ODF fixes no grid). `rangeUnitFor`'s case-insensitive fallback is the xlsx rule; whether `.ods` sheet names resolve without case is odf-reader's reading to state.

**Tests and checks run:**
- `node --test bio-plane/test/m/office-readers/`: tests 66, pass 66, fail 0 (new file `range-units.test.mjs`: 10 tests).
- Users of `formats-xlsx.mjs` and `csv.mjs`: `node --test bio-plane/test/m/odf-reader/ bio-plane/test/m/format-registry/` plus the old battery's `formats-xlsx`, `formats-csv`, `formats-odf`, `formats-pptx`, `content-extent-arms`, `fw19-extent-arms`, `capture-container-extent`, `reading-dialect`: tests 80, pass 80, fail 0.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … office-readers`: 9 product files, 30 relative imports; 0 failures. `checks/coverage.mjs … office-readers`: 25 of 25 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … office-readers tranche/T9`: 0 failures.

Size (session_01US5MKSyeetAVCERbaBowrE): test runs 3, module lines 3330

## J1 · REPORT

**Early merge (B1, §4): `a1Corner` and `rangeUnitFor` are built and tested** on `job/T9/office-readers` @ 84a4d0d60b (`bio-plane/test/m/office-readers/range-units.test.mjs`, 10 tests; module 66 of 66 pass; the four checks pass). odf-reader can build against them now.

**Proposed Provides text** (for `office-readers.md`, a new heading after R19's builders, "Range units (reused by `odf-reader`)"; my tests name them R26 and R27 on this proposal):

- **R26** `a1Corner(s) -> {col, row} | null`. One A1 corner, both 1-based: one to three letters (read without case; bijective base 26, `A`=1, `ZZZ`=18278), then a row 1–9,999,999 with no leading zero; either `$` marker allowed and ignored; surrounding whitespace trimmed. `null` for anything else: a non-string, a whole row or column, a range, a sheet-qualified reference, row 0. Never throws.
- **R27** `rangeUnitFor(sheetName, a, b, sheets, grid = null) -> {unit} | {why}`. `a`, `b`: corners as R26 returns them, in any order; `sheets`: the workbook's sheet names; `grid`: the format's bound `{rows, cols}`, or `null` when the format fixes none. `unit` is the `sheet-range` reference (R18's shape and builder) of the rectangle, top-left corner first. The sheet matches exactly, else without case when exactly one sheet answers; the unit carries the workbook's spelling. `why`: `not_a_range_reference` (a corner is not `{col, row}` of positive integers), `no_such_sheet` (no sheet answers, two answer without case, or `sheetName`/`sheets` is not a string/array), `outside_grid` (either corner past `grid` on either axis). Never throws. R9's units are built through it.

Record: flaws fixed in both (they could throw, or read a non-string as a corner or a sheet name `"null"`), and `a1Col` now reads through `a1Corner`. One generated artifact stale: `bio-plane/dist/bio-plane.bundled.mjs`.
