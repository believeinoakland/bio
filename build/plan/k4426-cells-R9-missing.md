# K4426 check T51-F9: the 15 MISSING cells, closed from records and runs

Prepared 2026-10-24 by a reading worker for BOB, from `origin/tranche/T51` at `34824ac8cc`. Not committed. No product code or tracked file changed. Reds below were run by this worker in scratch worktrees (a test file from the fixing commit put on the fixing commit's parent), except where marked "record".

Paths are under `bio-plane/` unless stated. "R" ids are the requirement ids of the module.

## G124f (module: runtime-limits, job 2; light kinds are G131i)

- **(1) CLOSED.** The figures were literals in six modules with no shared table. Seen at `67fac453ed^1`: `csv-reader/index.mjs:270` 17 MiB; `reading-pipeline/index.mjs:51` `WHOLE_READ_MAX` 24 MiB; `ooxml.mjs:191` `STREAMED_TEXT_BOUND_BYTES` 32 MiB; `odf.mjs:228` `ODF_REPEAT_EXPANSION_MAX` 262144; `workbooks/index.mjs:44` `WORKBOOK_CELLS_MAX` 50000; the tables `TABLE_MAX_CELLS` 1_000_000 (tables.mjs:14-15). Record: `build/jobs/T51/runtime-limits.md`, "Round 9 (RUNTIME-LIMITS #7, causes G124, G123a)", R-FOUR (1). They now live in `src/read-bounds.mjs` rows `csv` (:32), `xlsx.declared_text` (:143), `ods` (:144-146), `workbook.cells` (:149).
- **(2) CLOSED.** Same record, R-FOUR (2): "nine ceilings were stated each in one requirement and no test compared them". Gap fixed by `test/m/runtime-limits/read-bounds.test.mjs`.
- **(3) CLOSED for the table; case level not yet.** `read-bounds.test.mjs` (commit `67fac453ed`; tests "R30: the light kinds hold the standard 50 MB ... 1,048,576 rows", "R30: the alpha figures of the heavy kinds the plan names", "R30 (K4845) ...standards"). Red on `67fac453ed^1`: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/read-bounds.mjs'` (fail 1; a weak red, the file did not exist). Green on the tip: 17/17. The light kinds' boundary case exists: `test/m/csv-reader/standard-size.test.mjs` "R6 R9 a CSV of exactly 50 MB and 1,048,576 rows is read ... (SHEET C04)". Still no test names SHEET C03-C08 for the heavy kinds (bound minus 2, the bound, plus 1 with size and limit) or X05 (33 MiB declared XLSX); no record claims one. Run that would close it: the corpus R set's SHEET C03-C08 and X05 at the round end (plan section 7), against the table's alpha figures.

## G125a

- **(1) CLOSED for j14 and j7.**
  - j14 (pdf-pixels): old `pdf-worker/src/pagepixels.mjs` at `544b34099c`: `decodeImage` (:435) only tested `!im.width || !im.height` (:462) and then called `decodeDct` (:450), `ccittDecode(data, { K, columns, rows, byteAlign })` (:486, `columns` from `/Columns` :478, `rows` from `/Rows` or `im.height` :479) and the raw route's `rowBytes * im.height` (:609-610), all from header dimensions, with no bound first. Fix and record: `pdf-pixels.md` J6, entry "G125a R46".
  - j7 (pdf-reader): old `pdfstructure.mjs` `_streamDecoded` (`86083e4087`, :896-921) inflated whatever the stream held with no judgement of `/Width` `/Height`. Run on that commit: a Flate image stream declaring 10956 x 10956 (over the 120,000,000 pixel bound) and one declaring `/Width 8388609 /Height 1` (over the row stride bound) each answered 1,048,576 bytes with no `stream_over_bound:image` note. Fix in `b6cdf456af`.
- **(2) CLOSED.**
  - j14: before `9cc44f65d6`, `pdf-worker/test/pagepixels.test.mjs` tested only the picture path's bounds (R42, :605-657) and truncated data (R23/R24); no test declared an oversize frame to `decodeImage`. Closed by the "R46" block (:902-928 at `9cc44f65d6`).
  - j7: the old pdf-reader image fixtures were 1x1, 1000x1000 (`dense.mjs:51`) and the small `images.test.mjs` sizes; none declared an oversize frame. Closed by `test/m/pdf-reader/bounds.test.mjs` "R22: an image stream's declared size is judged before anything is allocated for it".
  - (Red of that j7 test on `86083e4087`: the assertion `wide.got === null` fails; the process then dies building the assertion message for a 1 MiB array, "RangeError: Array buffer allocation failed" under `ulimit -v`, silent exit otherwise. Passes on the tip.)

## G128e (2), j5

- **(2) CLOSED.** The held-cells tests before the job covered xlsx only: `test/m/office-readers/g41-held.test.mjs` (at `3868441e0b^1`, header lines 2-4 and every call is `xlsxEntry`), and `g41-peak.mjs:13` (`xlsxEntry.text(..., { inlineCellsMax })`). `docx-cells.test.mjs` tested table cells listed and never the option. No test gave a docx table over `inlineCellsMax`. Closed by `scan-bounds.test.mjs` "R45" (docx tables, record `office-readers.md` G128e (R45) entry; red by process death, exit 134, as the check already states).

## G128i

Job 41 (extraction-2) merged at K4927; the module's record has the row (`build/jobs/T51/extraction.md`, "Fix round 9, second half", entry "G128i ... mapped (N)", :751).

- **(1) CLOSED.** The acquisition record has no G128i item (confirmed: `acquisition.md` carries no G128i line). The extraction record maps each audit row to its owner: S1 (4,096-unit and 2 MiB index bounds) closed by R22/R99 in extraction; S2 closed for the writer (R47 chunks); S6 is `completeness: stated` (R97, R100) with the drawing screens-inquiry's; S4 screens-daily's; S9 control-plane's (job 38); the rows L26, L8, C30, the over-25,165,824 B files and the 504 are not extraction's and each "becomes its family's corpus case at the round end".
- **(2) CLOSED for extraction's piece (S1) only.** `extraction.md` :715: "the tests pinned the cut (`store.test.mjs` R22, `readcontract.test.mjs` R58, `round6.test.mjs` R90, `testimony.test.mjs` R61)"; fixed by amending them and adding `r99-r107.test.mjs`. For the other rows no record states why a test missed them beyond the plan's "audit rows were findings, never tests".
- **STILL MISSING (3).** Extraction's S1 red exists (record :716: `✖ R99 R22 ... Error: no such table: job_batches`; `✖ R90 R22 R99 ... a piece over the old 4,096-unit bound lands whole`; `✖ R99 ... a kill between two batches ... Missing expected rejection`), but no named corpus case with a red exists for L26, L8, C30, the over-25 MiB statement or the 504. Run that closes it: the corpus R set's cases for those five rows at the round end (K4920: "its (3) the corpus R set's cases at the round end").

## G130c (1), j23 and j3

- **(1) CLOSED.**
  - j23: old `acquisition/index.mjs` at `15a40a2d8e^1`: `FORMAT_HEAD = 1024` (:140); a capture in parts was judged by `headOf` (:2081, first KiB of the first part) then `detectFormat(head)` (:2062), and `zipPastBound` (:2089) answered `zip` or nothing, after which a ZIP became `undetermined` (:2064-2067). Red run on `15a40a2d8e^1` with the test from `15a40a2d8e`, `r9-format-range.test.mjs`: pass 2, fail 3; `✖ R101 (G130c): an office file past 8 MiB, in several parts, is docx ...` `actual: 'undetermined', expected: 'docx'`; the whole-held case the same. Tip: 5/5.
  - j3: old `ooxml.mjs` at `24d9be7b9f^1`: `discriminate(bytes, ...)` (:967) and `readPart(bytes, ...)` (:593) took whole bytes only. Red run, `round9.test.mjs` "R11 a file of any size is judged from its end record ... never from its head": actual `{ ok: false, why: 'not_a_zip' }`, expected `{ format: 'docx', confidence: 'high', ... }`; the "R11 a range source that cannot be read" test also red; pass 0 of the R11 pair. Tip: `round9.test.mjs` 26/26.

## G131g

- **(1) CLOSED for j5, j8, j10.**
  - j5 (office-readers): old `docx.mjs:108` `const UTF8 = new TextDecoder("utf-8", { fatal: false })`, used at :541 and :555; `pptx.mjs:127`, :434, :484, :607; `formats-xlsx.mjs:107`, :432, :491, :521, :542 (at `3868441e0b^1`). UTF-8 only; a UTF-16 part decoded to nonsense and was found empty.
  - j8 (format-registry): old `formats.mjs:145` `const LATIN1 = new TextDecoder("latin1")`, used at :158 `LATIN1.decode(bytes.subarray(0, 1024))` in the html `detect` (at `ac33f73f03^1`). Record `format-registry.md` :45, :56: the html head was the only text decode in the sniff.
  - j10 (site-profiles): old `site-profiles/index.mjs:158` `new TextDecoder("utf-8", { fatal: false }).decode(bytes)` in `digests` (at `9c60f6fc6d^1`). Record `site-profiles.md` R22 entry (:69).
- **(2) CLOSED for j3, j5, j8, j10, j23.**
  - j3: before `24d9be7b9f`, `test/m/ooxml` held UTF-16 only inside the CFB/VBA builders (`cfb.mjs:23, 125, 176-183`); no test decoded a part. Closed by `round9.test.mjs` R36.
  - j5: `git grep -i "utf-16|windows-1252"` over `bio-plane/test/m/office-readers` at `3868441e0b^1` finds nothing. Closed by `chars-decode.test.mjs` R41.
  - j8: the old html test `builtins.test.mjs` "R17: html detect with bytes" used `latin1(s)` fixtures only (no UTF-16). Closed by its UTF-16 lines (:53-56 at `ac33f73f03`).
  - j10: `git grep -i "utf-16|charset|latin1|1252|bom"` over `site-profiles/test` at `9c60f6fc6d^1` finds nothing. Closed by `r9-bounded.test.mjs` R22 (:149-200).
  - j23: old acquisition tests carry only `charset=utf-8` headers (`acquire.test.mjs:454`, `fixture.mjs:320`, `origin.test.mjs:36`, `profile.test.mjs:186`); no UTF-16 or windows-1252 case. Closed by `r9-decode.test.mjs`.
- **(3) CLOSED for j5, j8, j10.**
  - j5: `chars-decode.test.mjs` on `3868441e0b^1`: `✖ R41 a UTF-16 document.xml (with or without a BOM) is read and not found empty ...` `AssertionError: bom true  actual: '', expected: 'Wide café text'`; `✖ R41 a part decoded with more than 0.5 % replacement characters is stated partial ...` `assert.ok(partial)` `actual: undefined`. Tip 6/6.
  - j8: `builtins.test.mjs` from `ac33f73f03` on `ac33f73f03^1`: `✖ R17: html detect with bytes ...` `TypeError: Cannot read properties of null (reading 'format')` at `isHit` called from `builtins.test.mjs:55`, the UTF-16LE line `html.detect(u16("<html><body>x", true))` (the UTF-8 BOM line before it passes on the latin1 decoder).
  - j10: a mutation of the tip (the old `new TextDecoder("utf-8", { fatal: false })` line restored in `digests`, scratch copy): `r9-bounded.test.mjs` pass 5, fail 3: `✖ R22 a page's machinery is normalised after decoding, in any encoding` ("the page state is found and normalised in a UTF-16 page", digests differ); `✖ R22 a declared encoding decodeText cannot decode makes the document not textual ...` (`true !== false`); `✖ R22 the same page in UTF-8, UTF-8 with a BOM, windows-1252 and UTF-16 ...`. Tip 8/8. The red is by mutation, because `ooxml.decodeText` was not on the tranche when the job first ran (its record: 19 of 46 red by seam, "R22 seam" test).
  - j23 for completeness: `r9-decode.test.mjs` on `78465658bc^1`: pass 0, fail 7 (`TypeError: Cannot read properties of undefined (reading 'encoding')`).

## G132l (2), j7

- **(2) CLOSED.** Old `pdfstructure.mjs` `unpredict` (`86083e4087`, :245-246): `if (predictor < 10) return data; /* TIFF predictor 2 is vanishingly rare here */`. The only predictor fixtures in the old pdf-reader tests were PNG predictors: `pdfdoc.test.mjs:88, :92, :450` (`/Predictor 12`) and `indexed.mjs:90` (`/Predictor 12`); none used `/Predictor 2`. Closed by `bounds.test.mjs` "R22: a stream with a TIFF predictor is not passed through as if un-predicted ...". Red re-run on `86083e4087`: that test fails (`actual: Uint8Array(100) [...]`, expected `null`); green on the tip.

## G133c (2), j5 and j3

- **(2) CLOSED.**
  - j5: the old test pinned the defect: `test/m/office-readers/builders-invariants.test.mjs:81-83` fed `"&#x110000;&#99999999;"` and asserted `d.document === big`, "a reference that is no character stays as written" (and the same for pptx and xlsx); changed in `3868441e0b` to assert the part unreadable with `char_ref_invalid`. Red run of `chars-decode.test.mjs` on `3868441e0b^1`: pass 0, fail 6, e.g. `R40 docx ... actual: 'before &#x110000; after', expected: null`.
  - j3: the only numeric-reference test in `test/m/ooxml` at `24d9be7b9f^1` was valid input: `ooxml.test.mjs:710` (`&#x41;&#66;`); the decoder `decodeXmlEntities` (`ooxml.mjs:722-730`) calls `String.fromCodePoint(code)` for any finite code. Closed by `round9.test.mjs` R37 (record: `RangeError: Invalid code point 1114112`).

## Summary

CLOSED: G124f (1)(2)(3, table level), G125a (1)(2), G128e (2), G128i (1) and (2, S1 piece), G130c (1), G131g (1)(2)(3), G132l (2), G133c (2).
STILL MISSING: G124f (3) at case level (SHEET C03-C08, X05: corpus R set at the round end); G128i (3) for the five rows that are not extraction's (L26, L8, C30, >25 MiB, 504: corpus R set at the round end).

Scratch worktrees used (in the session scratchpad, removed after): `67fac453ed^1`, `86083e4087`, `15a40a2d8e^1`, `24d9be7b9f^1`, `ac33f73f03^1`, `3868441e0b^1`, `78465658bc^1`, and a mutated copy of the tip.
