# content (T33)

**Status** · session_0163Apu7btH1Rwvt1F7kyCNq · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

**Where the typed cells and the office metadata are held (R46's sheet arm, R52, R53): neither place holds them.**

Measured on `job/T33/content` (tranche/T33 merged at 1cb3158218):
- The readers emit them: `formats-xlsx.mjs`/`csv.mjs`/`odf.mjs` give each sheet `cells` (office-readers R30, odf-reader R46); `docx.mjs`/`pptx.mjs`/`formats-xlsx.mjs` give a top-level `metadata` (office-readers R31).
- `reading-pipeline` drops both: `readingFromWire` composes the reading from `entities`, `facts`, the chain and the basis; `containerExtentOf` keeps each sheet's `{name, rows, cols, usedRows, usedCols}` only; `textUnitsFor` makes one `sheet-range` unit per sheet (the whole used range, its text only). So `extraction.readingOf(sha).reading` (R30) and `unitsOf(sha)` (R36) hold neither, and nothing else persists them.
- So R46's `sheet-cell`/`sheet-range` arm, R52 and R53 have nothing to read. Adding storage here is ruled out by the entry (P6: wiring only) and my Suggestions.

**My best reading (for you to rule):** `reading-pipeline` (its job T33-23 is running) adds two keys to the reading it composes: `metadata`, the entry's object as emitted (or null), and `cells`, `{<sheet name>: <that sheet's cells list, or null>}` for a workbook (absent otherwise). `extraction` persists the reading unchanged (R19) and `readingOf` returns it in `reading` (R30), so no extraction code changes. `content` reads `readingOf(sha).reading.cells[sheet]` and `.metadata`, synchronously, as R46/R52/R53 state. Cost to weigh: the reading also rides `data/provenance.json`; R30's cells are bounded by the entries' size guard (over it, `null`), but a large workbook's cells would enlarge every reading row and the bundle file. The alternative, re-reading the stored bytes through the format entry inside `content`, would make R46/R52/R53 async and duplicate the reader path, so I do not propose it.

**Meanwhile:** I am coding R52/R53/R46's sheet arm against that shape (one private reader, so a different ruled shape changes one function), with tests on a stand-in extraction; and R54 (`declareTable`) now. The R46/R52/R53 tests against real readings wait on your answer.
