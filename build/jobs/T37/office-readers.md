# office-readers (T37)

**Status** · session_01LP5svq8XNYaHCh7k7jeXoZ · depth 2 · WORKING · handled B1

**Reading set** · read whole, as B1 asked (mechanics §17): `build/requirements/office-readers.md`; the public parts of `subresources` and `ooxml`; layer 1's contract in `build/layers.md`; the plan's "Rules at the opening", T37-4 and K2118; all four files of the module (`docx.mjs`, `pptx.mjs`, `formats-xlsx.mjs`, `csv.mjs`) and every file under `bio-plane/test/m/office-readers/`.

## Completion (T37-4)

**Applied** · T37-4 (N758, its share; K2118): R11 as amended. Each `.docx` table cell in `text().tables[].cells` now carries `paras`, the `para` ordinals (of `paragraphs`) of the paragraphs its `value` was read from, in reading order (`docx.mjs` `tableCells`). My reading of "the paragraphs its text was read from" is the cell's non-empty paragraphs, so `value` is exactly `paras.map(p => paragraphs[p].text).join("\n")`. A vertically merged cell lists its restart's paragraphs and then each continuation's, and those can be far apart in the body. A nested table's paragraphs stay with its own cells. The ordinals come from the same walk `walkDocumentTables` already used to find each cell's paragraphs, so nothing is numbered a second way. `paras` is the last key, after `formula`.

**Tests** · `docx-cells.test.mjs`: every expected cell now names its `paras`; the key-set test checks that `value` is its `paras`' texts. A new R11 test runs on a vertically merged table (a cell merged down three rows whose lines sit between other cells', "Total" written three times, an empty paragraph in a continuation, a second merge, and a nested table inside a merged cell). It checks the ordinals exactly, their reading order, that `value` is their texts joined, and that every non-empty table paragraph is named by exactly one cell. `text.test.mjs`'s R11 docx table expectation names `paras` too.

**Deferred** · none.

**Found in other modules** (in REPORT J2):
- extraction: `bio-plane/test/m/extraction/r70.test.mjs`:47 pins a `.docx` cell's keys to the six R30 keys, so it fails (1 of 132) once office-readers emits `paras`. It passes on `tranche/T37`. T37 has no extraction entry. The test asserts "field for field as office-readers emitted them", so the fix is to add `paras` to that key list (and line 110's `cell` helper, if its readings should carry it).
- reading-pipeline: `bio-plane/test/m/reading-pipeline/emitted.test.mjs`:129, the `dc` helper of the R28 test "a .docx reading carries cells … exactly as the real docx entry emits them", hand-writes the cell without `paras`, so it fails (1 of 92). It passes on `tranche/T37`. T37-9 (reading-pipeline R28, carrying `paras`) is the entry that changes it.
- No generated artifact is made stale by this change: `docx.mjs` goes into the plane bundle, which BOB regenerates at the layer close (manifest §14).

**Ran** · `node --test bio-plane/test/m/office-readers/`: 107 pass, 0 fail. The modules that use office-readers: odf-reader 69/0, format-registry 33/0, budget-doctypes 27/0, file-safety 43/0, workbooks 26/0, extraction 131/1 (above). Also the readers of `tables[].cells`: reading-pipeline 91/1 (above), retrieval 162/0, content 131/0. Checks: `format.mjs .` 0 failures (136 modules); `architecture.mjs . office-readers` 0 failures; `coverage.mjs . office-readers` 33 of 33 live ids named by a test, 0 failures; `ownership.mjs . office-readers tranche/T37` 0 failures.

**P6** · the module's four files total 3,816 lines (3,809 at T36), well under 4,000.

Size (session_01LP5svq8XNYaHCh7k7jeXoZ): test runs 14, module lines 3816
