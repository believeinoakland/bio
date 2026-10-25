# odf-reader (T51)

**Status** · session_01FYSm4Xubbtcon5NpEXmiLS · depth 2 · COMPLETE · handled B10

## J1 · REPORT

Found in another module, not changed (ooxml, not odf-reader). The words check, `inline` arm, reads eight string literals in `bio-plane/src/ooxml.mjs` as sentences people read: lines 773, 834, 854, 927, 929, 933, 965 and 978 (for example "odf:{} is first but COMPRESSED (method {}, ODF requires stored)" and "odf:mimetype declares {}, but {} is ABSENT"). Lines 927, 933, 965 and 978 are the ODF mimetype diagnostics that odf-reader's detect and digest rely on through `discriminate`; the others are the OOXML part-declaration diagnostics. My read: these are developer or diagnostic signals, not member-facing text, so they may belong on the design's `unkeyed` list (K3944) rather than in `localize`. Please route to ooxml's owner. odf-reader does not depend on their wording, which its tests assert by behaviour.

Also seen, not mine: the repo-wide run reports 4839 failures (4844 before my change), all inherited from other modules' words and testcopy findings.

## J2 · COMPLETE

Entries applied: T51-250, the five `plain` findings in `bio-plane/src/odf.mjs` (K3957), each judged a sentence a member reads, so each now goes through `localize` with a key fixed once (commit aae68e82ef):
- line 713, meta.xml absence detail, R28: `odf-reader.odf.this_package_carries_no_meta`
- line 1048, structure()'s guard note, R10: `odf-reader.odf.content_xml_not_read_over`
- line 2265, `ODF_EVIDENTIARY_MEASURED.odt`, R37 basis: `odf-reader.odf.content_xml_with_text_list`
- line 2268, `ODF_EVIDENTIARY_UNMEASURED.odp`, R33 basis: `odf-reader.odf.no_odp_export_has_been`
- line 2382, the not-certain refusal basis, R32: `odf-reader.odf.the_bytes_are_not_an`
Same class, not flagged, converted in the same pass for consistency: `ODF_EVIDENTIARY_MEASURED.ods` (`odf-reader.odf.content_xml_byte_identical_across`), and the two UTF-8 refusal bases in the digest (`odf-reader.odf.content_xml_is_not_valid`, `odf-reader.odf.content_xml_is_not_valid_2`). Wording is unchanged. No sentence was judged unread by any member, so nothing is listed for the `unkeyed` list.

Deferred, and why: `bio-plane/test/m/odf-reader/digest.test.mjs` asserts two of these bases by regex (the "not an OpenDocument package" refusal and the ".odp export has been measured" refusal). The check passes them, and I left them so as not to widen the change. Under K3810 they hold sentence fragments, so once BOB regenerates the rows I'd move them to `localize`/key comparisons. This is a question for BOB, not a blocker.

Found in another module (see REPORT above): eight inline strings in `ooxml.mjs`.

Tests and checks:
- `node --test test/m/odf-reader/*.test.mjs` (in bio-plane): 70 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 174 modules, 173 requirements; 0 failures.
- `node checks/architecture.mjs /home/user/bio odf-reader`: 12 product files, 0 failures.
- `node checks/coverage.mjs /home/user/bio odf-reader`: 47 of 47 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio odf-reader tranche/T51 job/T51/odf-reader`: 1 file changed by odf-reader, 0 failures.
- `node checks/run.mjs /home/user/bio`: the words check shows no finding in odf-reader or `odf.mjs`; `plain` 2137 to 2132. The run exits 1 on other modules' inherited failures only (4844 to 4839), as above.

Size (session_013zPuS6aCiGt1Nqw5Gii5vD): test runs 1, module lines 2413

## J3 · COMPLETE

CHANGE B2 (K3960) handled. Merged tranche/T51 into job/T51/odf-reader (merge commit 5795b25470). The recomputed "Plain findings (K3957)" section reads "None left", so no code change this round: the five findings I converted in aae68e82ef are on the design's unkeyed list (DEC-343). `bio-plane/src/odf.mjs` is unchanged by the merge.

Checks after the merge:
- `node --test test/m/odf-reader/*.test.mjs` (bio-plane): 70 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio odf-reader`: 0 failures.
- `node checks/coverage.mjs /home/user/bio odf-reader`: 47 of 47 live requirement ids named by a test.
- `node checks/ownership.mjs /home/user/bio odf-reader tranche/T51 job/T51/odf-reader`: 1 file changed by odf-reader, 0 failures.
- `node checks/run.mjs /home/user/bio`: no odf-reader or `odf.mjs` finding; the run exits 1 on other modules' failures only (4174 now, down from 4839 after the merge).
- `node bio-plane/src/setup-words/build.mjs --check` (read-only): does not name odf-reader. It reports `rows.mjs` as stale for `doc-clean.images` (word 16640). That is another module's generated artifact; I did not regenerate it.

Still open from J1 and J2: the eight inline strings in `ooxml.mjs` (for BOB to route to ooxml's owner) and the two regex assertions in `digest.test.mjs` (a question for BOB about moving them to key comparisons once rows are regenerated).

Size (session_013zPuS6aCiGt1Nqw5Gii5vD): test runs 2, module lines 2413

## J4 · COMPLETE

CHANGE B3 (K3968; K3965) handled. Merged tranche/T51 into job/T51/odf-reader (the merge brought my `odf.mjs` change into the tranche, so ownership now reports 0 odf-reader files changed against the tranche).

Done: the two regex assertions in `bio-plane/test/m/odf-reader/digest.test.mjs` now compare by equality with `localize`: the not-certain refusal (`odf-reader.odf.the_bytes_are_not_an`) and the unmeasured `.odp` basis (`odf-reader.odf.no_odp_export_has_been`), each with its en text. Commit is on the job branch and pushed. The file imports `localize` from `src/setup-words/index.mjs`.

Checks:
- `node --test test/m/odf-reader/*.test.mjs` (bio-plane): 70 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio odf-reader`: 0 failures.
- `node checks/coverage.mjs /home/user/bio odf-reader`: 47 of 47 live ids named by a test.
- `node checks/ownership.mjs /home/user/bio odf-reader tranche/T51 job/T51/odf-reader`: 0 files changed against the tranche, 0 failures.
- `node checks/run.mjs /home/user/bio`: no odf-reader or `odf.mjs` finding; exits 1 on other modules' failures only (4174).
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note names other modules (for example `budget-doctypes`), not odf-reader; regenerating is left to R1's close, as B3 says.

Size (session_013zPuS6aCiGt1Nqw5Gii5vD): test runs 3, module lines 2413

## J5 · COMPLETE

START B4 (G15, `lineRows`, provider; K4571, K4579) handled. Merged `tranche/T51` first.

**Cause (rule 1).** `odsText` built each sheet's `text` from the rows `walkSheet` materialises, joined into `lines`, and kept no row number beside them (`bio-plane/src/odf.mjs`, the `lines` loop in `odsText`, before the change ~:1805-1819). Empty rows and repeated empty runs are skipped and repeated rows are expanded, so a line's index is not its row; a reader of `sheet.text` (READING-PIPELINE's row-block grain, #22) could not name a block's true rows.

**Why the tests missed it (rule 2).** No requirement said a sheet's lines carry their rows; R19 states the text only. Gap fixed: the failing-first test below, which checks every line of a sheet with empty, repeated-empty, repeated-non-empty and multi-paragraph rows.

**Change.** `bio-plane/src/odf.mjs:1806, 1823, 1870`: every sheet `odsEntry.text()` emits carries `lineRows`, one 1-based sheet row (as a spreadsheet shows it, `row.r`, repeats counted) per line of `sheet.text`, same length as `text.split("\n")`; a cell holding several paragraphs or line breaks gives several lines, each carrying its row; a sheet with no text carries `[]`. Over the guard or repeat bound and with no readable body, `sheets` is `[]` as before, so no sheet carries it there. Wording and every other field are unchanged. No census op is owned or changed (K4208: none). R-OLD: computed from bytes at each read, so new reads only; a stored reading made before this change has no `lineRows`, and the consumer reads absent as unknown (K4579). No new sentence a member reads, so no row owed. Platform check (rule 4): N.

**Failing-first (rule 3).** `bio-plane/test/m/odf-reader/ods.test.mjs`, "R19 lineRows: every sheet carries one 1-based sheet row per line of its text, through empty rows, repeated rows and a cell holding several lines": through `odsEntry.text()` on bytes. Red before the change: `actual: undefined` for `lineRows` (the `text` assertion above it passed). Green after: `[1, 8, 9, 10, 11, 12, 12, 13]` for the sheet, `[]` for a blank sheet, `[2]` for the hidden sheet. The existing R18 test's field list now sets `lineRows` aside (as it does `cells`).

**Requirement lines proposed (BOB writes `build/requirements/`).** Under R19, or as a new id: "`odsEntry.text()`'s every sheet also carries `lineRows`: one 1-based row number per line of the sheet's `text` (the row as a spreadsheet shows it, `table:number-rows-repeated` counted; a cell of several paragraphs or line breaks gives each of its lines that cell's row), the same length as `text.split("\n")`, and `[]` when the sheet has no text. It is the sheet's own rows, never the used range." My test is named R19; rename it if BOB gives the line another id.

**Tests and checks.**
- `node --test --test-force-exit test/m/odf-reader/*.test.mjs` (bio-plane): 74 pass, 0 fail.
- Users (direct `uses` of odf-reader, since `impact.mjs origin/tranche/T51 HEAD` names 116 modules through a shared table): format-registry, doc-clean, file-safety: 175 tests, 173 pass, 1 fail (file-safety R24, accepted by name in plan §4... it is the refusal-table test, unrelated to a sheet's fields; not mine). acquisition, capture, `cap13-reuse-pages`, `d57selflink`: 486 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 176 modules, 0 failures. `architecture ... odf-reader`: 13 product files, 0 failures. `coverage ... odf-reader`: 48 of 48 live ids named, 0 failures. `ownership ... odf-reader tranche/T51 job/T51/odf-reader`: 3 files changed by odf-reader, 0 failures.
- `node checks/run.mjs /home/user/bio`: 0 failures in every row; words: inline 0, plain 0, testcopy 0, missingkey 0, 18421 words, the same as `tranche/T51` run unchanged (18421; string literals 673477 vs 673447).

Nothing deferred. Nothing found in another module.

Size (session_01Y3a7inMeXF8xJY4JE2EiKK): test runs 4, module lines 2430

## J6 · COMPLETE

G15 done (commit on job/T51/odf-reader, record section J5). bio-plane/src/odf.mjs:1806,1823,1870: every ods sheet from odsEntry.text() carries lineRows (one 1-based sheet row per line of text, repeats counted, multi-paragraph cell lines each carry its row, [] when no text). Failing-first ods.test.mjs 'R19 lineRows ...' red (lineRows undefined) then green. odf-reader 74/74; users: acquisition+capture+cap13+d57 486/486, format-registry+doc-clean+file-safety 173/175... correction: 175 tests, 1 fail = file-safety R24 (accepted by name, plan s4). Checks format/architecture/coverage(48/48)/ownership 0 failures; run.mjs words unchanged (18421, 0 findings). Proposed requirement line is in J5 (under R19). No census op, no new sentence, nothing deferred.

## J7 · REPORT

Found in another module, not changed (extraction, job 28/41): `bio-plane/test/m/extraction/g41.test.mjs:142-159`, "R97 (G41): the same for an ods workbook whose cells pass 1 MiB (the entry keeps whole cells)", is now red on `tranche/T51` + this job. It pins the cliff G128e removes: it reads a 1,500-row, 6-column ODS through `readHeld` and asserts the reading is stored `failure: "final"` with `too_large.key == "cells"`. With R49 the `.ods` entry honours `inlineCellsMax` (the opt-in extraction already passes), so the cells are held (`cells: null`, `cells_held: true`), the reading stays under 1 MiB and is stored whole; the assertion at line 156 reads `undefined` where it expects `"final"`. The test should be rewritten by extraction's job to the new behaviour (the ODS reading stored whole with `cells_held`, `cellsOf` answering the rows through `cellsIn`), as the xlsx case (R96 b) already is. Nothing in odf-reader to change.

## J8 · COMPLETE

START B5 handled (fix round 9; G133a, G133b, G133c, G133d, G134a, G134b, G134d, G131g, G126d, G124 quotes; requirements R45, R46, R48, R49-R55 read whole). Merged `tranche/T51` first. Code is `bio-plane/src/odf.mjs` (2430 -> 2903 lines); tests are in `bio-plane/test/m/odf-reader/`.

**Providers not merged at my start.** START says ooxml (3) and office-readers (5) were merged; on `tranche/T51` they were not (`ooxml.mjs` exports no `decodeText`). I coded against the contract text (plan 2c.5): `odf.mjs` calls `ooxml.decodeText` when ooxml exports it (a `typeof` test through a namespace import) and otherwise a minimal local decode of the same shape (`decodeTextFallback`: BOM, UTF-16 without a BOM, the declared charset, else UTF-8). When ooxml merges, its function takes over by itself; the fallback is then dead code (BOB may send CHANGE to delete it). `READ_BOUNDS`/`boundOf` was merged (runtime-limits) and is used for real. The seam to office-readers is the `parts` shape of R53, which this module states from its own requirement; office-readers R38 reads the same.

## Per cause (R-FOUR)

**G133a / R49 held cells and windows (+ G128e writer piece, `odf.mjs:2202`).**
(1) Root cause: the ODS entry had no held-cells contract. `walkSheet` (old :1475-1566) materialised every row and every cell of a sheet, `typedCells` (old :1439) and `odsText` (old :1776-1883) listed them all, and `entryFor.text` took no options (old :2202), so `inlineCellsMax` was ignored; the 20.4 MB `content.xml` (172,302 cells) died at 112 MB. Now: `sheetRows` (:1822) is a generator, one row at a time, over `iterNested` (:460); `odsText` (:2123) reads in windows of 65,536 tokens, awaits `yieldNow` between them, lists `cells` only while the JSON of all sheets' cells is within `inlineCellsMax` (past it every sheet gets `cells: null`, `cells_held: true`, and `text`, `lineRows`, extent and counts stay the whole read's); `odsCellsIn` (:2275) is the optional `cellsIn` slot (sheet by name or 0-based position, rows and columns 1-based, `maxCells` and `next_row` as csv-reader's, `no_such_sheet`, `bad_range`, the guard's or repeat marker, never a throw). The repeat meter is per read and installed only around synchronous windows (`withMeter`), so two reads awaiting at once keep their own counts (a test for it). The 20 MiB guard stays and is not raised (`large.test.mjs` unchanged and green).
(2) Why the tests missed it: `large.test.mjs` tested only the over-bound refusal and no test passed `inlineCellsMax` to an ODS or ran one near the bound in a capped heap. Gap fixed: `r8-held-cells.test.mjs` (contract tests and the capped child).
(3) Red then green: red before, on the unchanged module: `R49 inlineCellsMax: past the bound ... actual: [ ...cells ] expected: null`; `R49 cellsIn: ... actual: 'undefined' expected: 'function'`; `R49 yieldNow: ... actual: false expected: true`; the child `R49 a 20,400,000-byte content.xml (172,302 cells) ... at --max-old-space-size=112` red (exit 1), and the old module run by hand at that cap on the same file: `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`, exit 134. Green after: 8 of 8, the child asserts `cells: null`, `cells_held`, `usedRows`/`usedCols`, the whole text to its last row, `counts.cells` 172,302 and `cellsIn` rows 70000-70010 equal to the generator's cells (the child is `r8-held-child.mjs`, the content.xml measured 20.3-20.5 MB). Five runs alone: 8/8 each; on one core (`taskset -c 0`) 17/17 with `r9-linear`.
(4) Platform check: L done (the capped child at the real 112 MB figure). P is BOB's (`owedwork`, `op=reading`, `heldcaptures`; I touched no deployment). Report for BOB: with held cells the same file also reads whole at 112 MB with every cell listed (no option), so the held path is not what keeps it under; the figure stays 20 MiB, no change proposed (K1881).

**G133b / R50 covered cells.** (1) `odf.mjs:1507` (old) iterated only `table:table-cell`, so every cell right of a merge moved one column left. Now `sheetRows` iterates `table-cell` and `covered-table-cell` (`CELL_NAMES`, :1789; :1842): a covered cell advances its whole repeat run and holds nothing, even a value written inside it. (2) No merged-cell fixture existed; `r9-covered.test.mjs` adds three (a value right of a merge, a repeated covered run, a merge across rows), checking `cells`, the row's `text`, `usedCols`, `range`, and in `structure()` the formula's and the link's `sheet-cell`. (3) Red: `R50 a value to the right of a merge keeps its column...` x3 ✖; green 3 of 3. (4) N, L covered by the child's shape.

**G133c / R51 character references.** (1) The reader never checked a numeric reference outside `decodeEntities`, which left an out-of-range one as written and let a surrogate or NUL through as text; ooxml-side throws are ooxml's. `hasInvalidCharRef` (:698) now reads every part once (above U+10FFFF, a surrogate, U+0000, digits that do not parse, no `;`); the part is stated `{part, why: "char_ref_invalid", final: true}` in `parts().undetermined` and `evidentiary.undetermined`, `text()` answers `main_part_unreadable` with that `why` and `final`, `active` says `unread`, the same on every call, and the other parts are read (meta.xml, the manifest, styles.xml each tested). (2) No hostile reference was ever tried; `r9-charref.test.mjs` covers eight forms in content.xml and the three other parts. (3) Red: 8 `R51 ... in content.xml` ✖ and `R51 a bad reference in meta.xml, the manifest or styles.xml` ✖; green 11 of 11. The existing R11 assertion that "a reference naming no character is kept as written" is replaced by this requirement's behaviour (`odt.test.mjs`); a name that is no character reference (`&bogus;`) is still kept. (4) N.

**G133d / R52 linear walk.** (1) Root cause: the one token regex (old :359) had a lazy attribute group that, for an unclosed `<a `, a comment or a CDATA with no end, scanned to the end of the part from every opener (96 KB of `<a ` took 9.7 s; 20,000 `<!-- ` 2.9 s and 20,000 `<![CDATA[` 3.4 s in the red run), and `attrsOf` was a backtracking pattern over a long name run. Now `linearMarkup` (:721) checks every opener once, left to right: one not closed, or a tag over 64 KiB (`boundOf("xml","tag")`, no literal), becomes text over the examined span and the scan goes on after it, with closers and quotes searched forward only, so a hostile run costs one scan; every later walk meets only tokens that end. `attrsOf` (:388) is a hand scan. Unclosed `<draw:a>` wrappers use `lastIndexOf`. `counts.scanned_bytes` (on the three `text()` answers) is the characters that scan examined in content.xml and styles.xml (<= 1 x the parts; meta.xml and the manifest answer other operations, and counting them made doc-clean's copy-versus-original test differ); `text()` states `tag_over_bound {part, count}` and `markup_unterminated {part, count}` in its `undetermined`, `structure()` in `evidentiary.undetermined`. `yieldNow` is awaited between windows of 65,536 tokens, at row, paragraph and page boundaries (a unit is not split). Dropped at Stage 3 per the plan.
(2) The object cannot time itself (R-CLOCK) and no work count existed; the tests assert counts only. (3) Red: all of `R52` ✖ (nine: the six shapes, cell and slide, the 64 KiB tag, the yield count: `scanned_bytes` absent); green 9 of 9; the shapes run in 20-290 ms.
(4) N.

**G134a, G134b, G134d / R53 parts with kinds.** (1) `walkTextBody` (old :1106) fused a footnote's text onto its paragraph (`odf.mjs:2156` old), an ODS cell's annotation entered its displayed value (`note text\n5`, old :1518), and nothing read headers, footers, master pages or free text boxes. Now `text()` of all three entries carries `parts: [{kind, ref, part, text, hidden?}]` (`null` where content.xml was not read): ODT footnote, endnote, comment, text_box (inside a paragraph) and tracked_deletion from content.xml, each `ref` the host paragraph (`¶N`), and header/footer from the master pages of styles.xml (`<page> (<variant>)`); ODP speaker_note (`slide N (notes)`), text_box (a frame holding a text box and no `presentation:class`, `slide N shape K`; it stays also in the slide's own text, R24) and master_text (styles.xml), a hidden page's marked `hidden: true`; ODS cell_note (`sheet!cell`), the cell showing its own value. A footnote, endnote, annotation and text box are taken out of the host paragraph's text; R9's exclusion stays. Checked against real LibreOffice output (soffice): an `.odt` with footnote, endnote, comment, tracked deletion, text box, header and footer, and an `.odp` with a free text box, notes and a master page, give the units above. (2) No fixture had a footnote, a note, a header or a master page. `r9-parts.test.mjs`: six tests. (3) Red: six ✖; green 6 of 6. (4) N. The closed list's other kinds (`body`) are the existing `paragraphs`/`slides`/`sheets`.

**G131g / R54 the one decode (`odf.mjs:187` old).** (1) The five sites decoded with `UTF8.decode` (content.xml, meta.xml, styles.xml, manifest, the stored `mimetype` member, which is ASCII by rule and stays). Now `readXmlText` (:785) decodes through `ooxml.decodeText` (or the stand-in above) with the part's declared charset, so UTF-16 and a declared legacy charset are read; replacement characters over 0.5 % state the part `partial` with the count (`undetermined: [{reason: "partial", part, replaced}]`); an unsupported charset states `ENCODING_UNSUPPORTED {name}`. R37's digest stays strict UTF-8 (control test green). (2) Fixtures were UTF-8. (3) Red: four `R54` ✖ on the unchanged module (plus the digest control green); green 5 of 5. (4) N.

**G126d / R55 `isOdfTextPart` (`odf.mjs:799`).** True exactly for `content.xml`, `styles.xml`, `meta.xml` (normalised part name), false for anything else and for a non-string, never throws; `ooxml.declaredTextBytes(container, isOdfTextPart)` sums the three (tested). Inside the module the 20 MiB guard stays on content.xml; styles.xml is bounded separately as before. For control-plane (job 38).

**G124 quotes / R45, R48.** `ODF_REPEAT_EXPANSION_MAX = boundOf("ods", "repeat_units")`, the copied-text bound `boundOf("ods", "content_xml")`, the tag bound `boundOf("xml", "tag")`; no numeric literal for a ceiling is left (`r9-quotes.test.mjs` pins the values and greps the source for the old literals, as G124's test asks). The marker keeps `boundName: "MEASURED_OOXML_TEXT_BOUND_BYTES"` (R45). No ceiling is kept without a row; nothing to carry to runtime-limits. Pacing constants (65,536-token window, the 0.5 % ratio) are not ceilings.

## Everything else
- R-OLD: all new output is computed from the bytes at each read: new reads only; a stored ODS reading made before has none of `parts`/`cells_held`, and extraction's migration (G128j/G133a "old records") re-reads the "too large" ones. No repair here.
- Words: no new sentence. New codes a member may meet and that need words (owed, consumer's/BOB's, plan section 5 rows "every part is read" and "the assumed encoding"): `char_ref_invalid`, `partial`, `ENCODING_UNSUPPORTED`, `tag_over_bound`, `markup_unterminated`, the closed kinds. `words` for odf-reader: inline 0, plain 0, testcopy 0, missingkey 0, marker 0.
- Census ops: none owned (K4208).
- Generated artifacts made stale: none by me (the plane bundle and `program.mjs` are staled by any merge, carried).
- Files created outside my paths: none (all in `test/m/odf-reader/`: `r9.mjs`, `r8-held-cells.test.mjs`, `r8-held-child.mjs`, `r9-covered`, `r9-charref`, `r9-linear`, `r9-parts`, `r9-decode`, `r9-quotes`). Existing tests changed because the shapes they pin changed by requirement: `counts.scanned_bytes` and `parts` in the exact-shape assertions (`odp`, `ods`, `odt`, `repeats`), the export list (`entries` R43), the R11 reference case (R51).
- Found in another module (REPORT posted): `extraction/g41.test.mjs:142-159` pins the ODS cliff and is red now.
- Requirement lines proposed (BOB writes `build/requirements/`): (a) R53: add the `ref` forms above, that `parts` is `null` when content.xml was not read, and that an ODP `text_box` is a free text box (no `presentation:class`) also present in the slide's text; (b) R52: `counts.scanned_bytes` is the characters examined by the one markup scan of content.xml and styles.xml, and the two statements `tag_over_bound` and `markup_unterminated` (`{reason, part, count}`); (c) R54: the partial statement is `{reason: "partial", part, replaced}` in `text()`'s `undetermined`, `{part, why: "partial", replaced}` in `structure()`'s; (d) R49: `cellsIn` takes the sheet by name or 0-based position and walks the earlier sheets under the same repeat meter, answering the repeat marker when the whole read would; (e) R51: `text()` answers `main_part_unreadable` with `why: "char_ref_invalid"` and `final: true`. R19's note on `lineRows` stands.

## Tests and checks
- `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/odf-reader/` (bio-plane): 120 tests, 120 pass, 0 fail (74 before; 46 new, 7 existing assertions updated as listed).
- Users, direct `uses` and the modules that read an ODF result: `format-registry` + `doc-clean` 85 tests: 84 pass, 1 fail then fixed (doc-clean `oracles` R5 compared `scanned_bytes` of a cleaned copy: now counts content.xml and styles.xml only); `file-safety` 103: 102 pass, 1 fail = R24 refusal-table words (accepted by name, plan section 4); `acquisition` 276/276; `capture` + `cap13-reuse-pages` + `d57selflink` 296/296; `office-readers` range-units and detect-parts, `extraction` convert-chain, convert-extent, g41, `reading-pipeline` convert-chain, convert-extent, read, `content` converts-extent, `ooxml` ooxml: 142 tests, 141 pass, 1 fail = the extraction g41 R97 ods case reported above. (`impact.mjs origin/tranche/T51 HEAD` names 116 modules through a shared table, so I ran the callers.)
- `node checks/format.mjs /home/user/bio`: 176 modules, 0 failures. `architecture ... odf-reader`: 22 product files, 76 imports, 0 failures. `coverage ... odf-reader`: 55 of 55 live ids named, 0 failures. `ownership ... odf-reader origin/tranche/T51 job/T51/odf-reader`: 16 files changed, 0 failures.
- `node checks/run.mjs /home/user/bio`: no finding in `odf.mjs` or odf-reader tests; the run exits 1 on other modules' findings only (words: inline 12, missingkey 5, 17 failures, none mine); words count 18,524, unchanged by this job.
- Heavy file `r8-held-cells.test.mjs` alone, five runs: 8/8 each; with `r9-linear` on one core (`taskset -c 0`): 17/17.

Size (session_01UqB6MGJZC34pq9fKcsf621): test runs 31, module lines 2903

## J9 · COMPLETE

CHANGE B7 (K4863) handled. `decodeTextFallback` and its `typeof` switch are removed from `bio-plane/src/odf.mjs`; `readXmlText` calls `ooxml.decodeText` through the namespace import. ooxml has not merged, so 99 of 120 odf-reader tests are red by name now (every read goes through the decode: `ooxml.decodeText is not a function` is stated as `reader_failed:TypeError`); the 21 that pass read no part (detect, digest, quotes, predicate). Nothing else changed; all of J8's results hold once ooxml's `decodeText` merges (they were green with the stand-in). I need the CHANGE you promised when ooxml merges, to merge `tranche/T51` and re-run the module, impact and the checks. The J8 line "BOB may send CHANGE to delete it" is done.

Size (session_01UqB6MGJZC34pq9fKcsf621): test runs 32, module lines 2870

## J10 · COMPLETE

CHANGE B8 (K4864) handled. Merged `tranche/T51` (ooxml #4 included) into the job branch and pushed. The tests kept red for `decodeText` are green: `test/m/odf-reader/` 120 of 120 with ooxml's real `decodeText` (UTF-16, declared Latin-1/windows-1252, partial count all pass through it).

Users re-run: format-registry + doc-clean + acquisition 385 tests, 384 pass; capture, cap13, d57selflink, file-safety 399, 398 pass (1 = file-safety R24, accepted by name); office-readers range-units/detect-parts, extraction g41, reading-pipeline read, ooxml 105, 104 pass (1 = extraction g41 R97 ods, reported in J7, placed in job 28). New red, not mine: doc-clean "R3 R12 TOO_MANY_ENTRIES ... boundOf(office, entries)" (a doc-clean test of the archive-entries row that came with this merge; no odf-reader code is involved: it counts entries of a package copy).

Checks: format 0 failures; architecture 22 files, 0; coverage 55 of 55, 0; ownership 16 files, 0; run.mjs: no odf finding, words 18,524 unchanged (inline 12, missingkey 5, none mine).

Size (session_01UqB6MGJZC34pq9fKcsf621): test runs 34, module lines 2870

## Fix round 9, batch D: R53 amended, the ODT text box (G166; K4987; START B9)

**Red first.** On the unchanged module, a text box (`draw:text-box`) not inside a paragraph (a frame anchored to the page, or alone in a table cell) answered its words only as body paragraphs: no `text_box` part at all. A box inside a paragraph answered the `text_box` part with no `paras` and left the host text clean. So the duplicate the START names did not exist as "both"; the kind was wrong for two of three shapes and `paras` was absent in all three. Two new tests red, one existing assertion (`by.text_box`) updated for `paras`.

**Change (`odf.mjs`, `walkTextBodyG`).** A text box is a unit wherever it sits. Outside a paragraph its paragraphs keep their slots in `paragraphs` (the file's order, so `¶n` numbering and R6's count are unchanged) with empty `text`, so `document` and the paragraph texts hold none of its words; the `text_box` part's `paras` lists those indices and its `ref` is the first. Inside a paragraph it holds no slot (as before) and `paras` is `[]`. Links in a box now stay the body's (R7; they were lost before in an in-paragraph box). Decision (mine, not Bob's): empty-text slots rather than removing the paragraphs, so reading-pipeline can drop exactly `paras` and every other `¶n` stays addressed as before.

**For reading-pipeline (job 90):** `paras` is present on every ODT `text_box` part; entries of `paragraphs` named in it have `text: ""`.

**Tests and checks.** `test/m/odf-reader/`: 122 tests, 122 pass (2 new, named R53; one existing updated). Users (`acquisition` grades, `doc-clean` oracles, `format-registry` builtins, `reading-pipeline` read): 47 tests, 46 pass, 0 fail, 1 skipped; `impact.mjs` names 116 modules through a shared table, so the callers were run. format 0 failures; architecture 22 files, 0; coverage 55 of 55, 0; ownership 3 files, 0 failures. Words: no new sentence; no rows owed. Generated artifacts made stale: none. Found in another module: none.

Cause: the walker took a text box as a unit only when inside a paragraph. Why missed: R53's tests built the frame inside a paragraph. Platform check: none needed (pure module).

Size (session_01ADqp4HKjkPA6rcj1FoXALV): test runs 7, module lines 2900

## J11 · COMPLETE

Batch D (B9, G166/K4987) done: R53 amended. An ODT text_box part now carries paras; a box outside a paragraph (page-anchored or alone in a cell) was before body-only with no text_box part, so it is now a text_box unit and its paragraph slots keep their indices with text empty (paras lists them); a box inside a paragraph has paras []. Links in a box stay the body's. Red first: 2 tests red on the old module. odf-reader 122/122; callers 46/47 pass, 0 fail; format, architecture, coverage, words, ownership 0 failures. Detail and the note for reading-pipeline (job 90) in my record.

## Job 111 (B10, K5011): R56, G184, S-18 and S-19's rest

**Red first** (`test/m/odf-reader/r56.test.mjs`, run on the unchanged module, 4 of 5 red). (1) An error cell written `office:value-type="string"` beside `calcext:value-type="error"` answered `declared: "error"`, `type: null`: `attrsOf` keys an attribute by its local name, so the later of the two won. (2) A typed-empty cell repeated 16,384 times on 64 repeated rows was refused `over_repeat_bound` (a cell with a `value-type` and nothing else counted as carrying, so each address was paid for). (3) Every `over_repeat_bound` marker lacked `final` (`text()`, `structure()`, `cellsIn`, units and characters). (4) Two sheets of 200,000 repeat units each were refused: one meter served the whole read.
**Did not reproduce:** S-18 (covered cells). Round 9's R50 already iterates `table:covered-table-cell`; the R56 test proves it (C1 stays C1) and is green on the unchanged module. S-19's annotation in the displayed value is also already met by R53 (`cell_note`, `note text\n5` gone).

**Change (`odf.mjs`).** `attrsOf` keeps `calcext:value-type` apart (`calcext-value-type`), and a cell's type is `office:value-type`, else calcext's. A typed cell with no value attribute, formula, text or note is an empty run, advanced over and never expanded; it no longer extends the used range. `spend` and `spendChars` markers carry `final: true`. `sheetRows` starts its units at zero for each sheet (the characters a repeat copies stay one count per read: they bound the text a read can yield, R45); `cellsIn` walks the same way, so its cells equal the whole read's.
**Tests.** `r56.test.mjs`: 5 tests, 5 pass. Existing tests changed because the marker shape changed by requirement: `repeats.test.mjs` (UNITS, CHARS), `entries.test.mjs` R41 (the units marker). `test/m/odf-reader/`: 127 tests, 127 pass. Users that read ODF output (`acquisition` grades, `doc-clean` oracles, `format-registry` builtins): 19 tests, 18 pass, 0 fail, 1 skipped. `impact.mjs` names 116 modules through a shared table; those three files are the ones that name this module's output.
**Checks.** format: 176 modules, 0 failures. architecture odf-reader: 22 files, 0. coverage odf-reader: 56 of 56 live ids named, 0. ownership: 5 files changed, 0. `checks/run.mjs`: words inline 0, plain 0, testcopy 0, missingkey 0, marker 0; no finding in odf-reader.

**Cause:** the cell walk treated "has a value type" as "carries content", took the last attribute of a shared local name, and metered the whole read once. **Why missed:** the fixtures are the module's own builder's kind of file (no `calcext`, no padding, one sheet). **Platform check:** none needed (pure module). **R-OLD:** new reads only; a stored reading keeps its old marker without `final`.
**Fixture note (K4990):** the repo holds no committed real `.ods`; the markup follows what LibreOffice writes for an error cell and for a padded row (the module header's measurement). **Requirement lines for BOB:** R45's marker shape gains `final: true`; R45's units meter is per sheet (R56). No sentence added, so no rows owed. Census ops: none owned (K4208).

Size (session_01FYSm4Xubbtcon5NpEXmiLS): test runs 5, module lines 2910

## J12 · COMPLETE

Job 111 (B10, R56/G184) done. Red first: error cell typed null (calcext overrode office), typed-empty repeat refused after 16 rows, over_repeat_bound markers lacked final, meter shared across sheets. Not reproduced: covered cells (R50 already met). Fixed in odf.mjs; r56.test.mjs 5/5; odf-reader suite 127/127; checks 0 failures (coverage 56/56, ownership 0, words 0). BOB: R45 marker gains final:true and its units meter is per sheet. Details in my record.
