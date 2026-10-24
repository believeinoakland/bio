# Diagnosis: the seven reds of `t51-round9-seam` (control-plane J54, job 43)

Tree: `origin/job/T51/control-plane` at 8ff794a3e7 (worktree `/home/user/wt-diag2`, detached, nothing changed in it). Fixes were tried only in a copy of the tree without `.git`: `/tmp/claude-0/-home-user-bio/a6c1edf3-f10a-553b-b4ba-067ada11cc6f/scratchpad/copy`. The whole set of source changes is the unified diff `/tmp/claude-0/-home-user-bio/a6c1edf3-f10a-553b-b4ba-067ada11cc6f/scratchpad/fixes.diff` (9 files). Every red was reproduced alone before any change, and every fix below was run through the same seam test in the copy ("verified" = the red went green in the copy; "derived" = read from code, not run). No tool or safety check refused an act.

## Summary table

| # | Red | Verdict | Owner(s) | Requirement ids | Requirement text must change? |
|---|---|---|---|---|---|
| 1 | §10 DOCX text box: hit kind `body`, wanted `text_box` | Product, but a KNOWN duplicate: the box words are deliberately both a body paragraph unit and a `text_box` unit (pinned by 4 module tests). BOB decides which one stands (options B/C below) | office-readers (docx.mjs) + reading-pipeline (allUnitsOf); extraction's R66 test follows | office-readers R11, R38; reading-pipeline R47; retrieval R95; K4831 (7)(a) | Yes: one sentence each in R38 and R47; extraction `n26.test.mjs` (R66) expectation changes |
| 2 | §10 cite a footnote: BASIS_REFUSED / C-2.8 `doc-part` not one of ... | Product. NOT text-chain, NOT the catalogue row | inquiry-grammar (grammar.mjs:34 import) + content (extent-core `legExtent`) | content R1, R48; inquiry-grammar R4 and its `content` edge | Yes: content R48 (core reads `extent_part` for `doc-part`), inquiry-grammar R4 (judged through content's public face) |
| 3 | §11 finished row of a scan: written 0, failed 1 NO_HOME vs reading's written 8, failed 0 | Product | plane (pending.mjs) + extraction (R80 answer) | plane R97, R98; control-plane R135; extraction R80, R100 | Yes: plane R97 (what the counters of an ended row are, NO_HOME is no failure), extraction R80 (`READING_HELD` carries counters) |
| 4 | §12 UNDECLARED UTF-8 with one invalid byte decoded wholly as windows-1252 | Product | ooxml (`decodeText`, sniffEncoding) | ooxml R36; DOCS T7; reading-pipeline R49 | Yes: R36 names no outcome for this input; one sentence and a threshold (BOB's detail ruling) |
| 5 | §13 G130b: CSV declared ms-excel / octet-stream ends `final`; `.tsv` declared text/plain read as prose | Product. format-registry and csv-reader are MET; the callers never hand them the name | acquisition (profileOf) + capture (upload's profile call) | format-registry R9, R31; csv-reader R21; acquisition R17, R101, R102; capture R107 | Yes: acquisition R17/R101 and capture R107 (pass name and declared type); acquisition R102 vs R31 need one reconciling line |

Corrections to J54's suspicions: in (1) the body units are made by reading-pipeline from the reader's `paragraphs`, and office-readers' own tests require the box words to stay in `paragraphs` (so "leave them out of the body units" is a two-module change, not one line in docx.mjs); in (2) `checkLegExtentGrammar` does NOT accept a `doc-part` today (it is the refusing function; I called it directly and it gives the same sentence), it is `content`'s public `checkContentExtent` that accepts it; the owner is neither text-chain nor a catalogue row; in (5) format-registry and csv-reader are not the unmet modules.

---

## 1. §10 DOCX text box: the hit says kind `body`, wanted `text_box`

Reproduced alone (3 min): `textbox: the hit says kind body, wanted text_box`. Note the unit-level check passes: a `text_box` unit holding the words exists; the hit is the first of two.

**Root cause (read and run).**
- `bio-plane/src/docx.mjs:331` (`for (const b of boxStack) b.paras.push(last)`) and `:393` (`case "txbxContent"`): the walk numbers the box's inner paragraph like every `<w:p>` and keeps it in `walk.paragraphs`.
- `docx.mjs:1111`: `paragraphs = walk.paragraphs.map(...)` and `document` therefore hold the box words (run directly: generator seed 9134, `paragraphs` has `¶10: 9134-u11-ktextbox`, `document` includes it).
- `docx.mjs:1181-1183`: the same words are emitted again as a part `{kind: "text_box", ref: "¶10"}`.
- `reading-pipeline/index.mjs:983-1011` (`allUnitsOf`): body units are every `i2text.paragraphs` entry with a glyph, then every part is appended as a `doc-part` unit. So the passage is a `body` unit (`doc-para` ¶10, seq earlier) and a `text_box` unit; `op=search` returns the first, `body`.

**Product or test.** Product. The test is right: K4831 (7)(a) "every part of a document read and searchable, each result marked with its kind".

**Requirement.** office-readers R38: "one per piece of text in the file outside the body's own units ... `kind` one of the closed list ... text boxes ... `document` stays the body's text and the lists R11 describes are unchanged: `parts` adds, never replaces." R11: `paragraphs` is "one per `<w:p>` read, in document order". reading-pipeline R47: "every part a reader emits reaches the index with its kind". retrieval R95: "A passage search returns every kind by default". None says whether a text box's paragraph is also a body paragraph; R38 read literally says the body keeps it ("parts adds, never replaces"), and that is what the module's tests assert. The requirement is silent on the duplicate, so the text must change.

**This is a pinned choice, not an oversight.** Four module tests pin the duplicate as correct (below), and extraction's `n26.test.mjs:117-123` says so in a comment: "(fix round 9, K4896) the text box's text is also its own `doc-part` unit (reading-pipeline R47, G134d: every part marked with its kind), beside the paragraph units, which are N26's numbering", asserting `doc-para` units `[1,'boxed']`-style for the box paragraphs AND `doc-part` units `boxed`, `t in box`. K4896 itself (rulings.md:4891) does not mention it: it is the job's test-level choice, not a ruling of Bob's. The seam's wording ("each result marked with its kind", K4831 (7)(a)) is what makes the duplicate a defect: one passage returns two results, one marked `body`.

**Why the module tests missed it.** office-readers `parts-kinds.test.mjs:40-56` asserts the `text_box` part and that `document` is the body; `text.test.mjs:76-79` asserts `[1, "boxed"]` stays in `paragraphs`; `docx-cells.test.mjs:76-85` asserts a box in a cell "is the cell's text"; `mce.test.mjs`. All of them pin the duplicate as correct. reading-pipeline's tests (`r9-reader.test.mjs:18`) list the kinds but never feed a text box through `allUnitsOf`. Nothing joins the two lists.

**Smallest fix (verified).** Two modules, 3 lines, keeps every office-readers test green:
- office-readers `docx.mjs:1183`: the `text_box` part also carries `paras: [...box.paras]` (the paragraph numbers the box holds; `addressParts` keeps extra fields).
- reading-pipeline `allUnitsOf` (`:1001`): body `doc-para` units whose `para` is named in any `text_box` part's `paras` are not units (numbers and `seq` gaps are normal there already, empty paragraphs leave gaps).
Seam result in the copy: `a DOCX with a footnote, endnote, header, footer, comment ...` PASS (185 s). Side effect, run in the copy: extraction `n26.test.mjs:81` (R66) goes red, because it expects the box paragraphs as body `doc-para` units (this is the pinned duplicate); its expected `doc-para` list becomes `NEW_PARAS` without the box paragraphs, the `doc-part` list unchanged. A stored reading is untouched until re-read; a stored reference to a box paragraph as `doc-para ¶N` stays a valid extent (the paragraph keeps its number), it just no longer has a body unit of its own text. The simpler one-module alternative (blank the box paragraphs' `text` in `paragraphs`) was run at reader level and works for the seam, but it breaks `text.test.mjs:76`, `docx-cells.test.mjs:76` and the R11 sentence "one per `<w:p>` read", so I do not recommend it.

**Options for BOB (a detail decision under P17, recorded in `build/rulings.md`).** B (recommended, verified): the box words are the `text_box` part's only; the paragraph keeps its number. C: keep both units and make the hit layer (retrieval R95, `findin`) prefer the part's kind where a part unit and a body unit hold the same text; no reader or test changes, but `op=reading`'s `text_units` and every other consumer still show the words twice, and "one result, one kind" is then true of search only. A is the one-module alternative (blank the paragraphs in docx.mjs), not recommended as shown.

**Failing-first tests the owners add.**
- office-readers (`parts-kinds.test.mjs`): the text_box part of `wordPackage()` has `paras` equal to the paragraph index of "Inside the box" (and two paragraphs in one box give both); control: a part of another kind has none.
- reading-pipeline (`r9-reader.test.mjs`): an `i2text` with `paragraphs` [.., {para: 9, text: "boxed"}] and a `text_box` part with `paras: [9]` yields exactly one unit holding "boxed", kind `text_box`; control: the same without `paras` keeps both.
- both are seeded by the seam's own generator (`docgen` `parts: ["textbox"]`).

**Wording proposed.** R38 add: "A `text_box` part carries `paras`, the `para` numbers of the paragraphs of the box (R11 keeps them in `paragraphs` and in a table cell's text, so every number stays what it was)." R47 add: "A body paragraph that a `text_box` part names in `paras` is not a body unit: its words are the part's, so a passage is one unit with one kind."

**Not checked (flagged).** pptx (`pptx.mjs:946`) and odt (`odf.mjs:1680`) text boxes may duplicate the same way; the seam's pptx/odt sections do not include a text box. The large-docx piecewise path (`parts.stream`, R35) was not run; its text_box part comes from the same loop but should be checked.

---

## 2. §10 citing a footnote: BASIS_REFUSED / C-2.8 CONTENT_EXTENT_UNREADABLE "extent kind 'doc-part' is not one of ..."

Reproduced alone (2.7 min): `BASIS_REFUSED`, finding `C-2.8 CONTENT_EXTENT_UNREADABLE`, detail "the part of the document this citation names names an extent this record cannot evaluate: extent kind 'doc-part' is not one of: document, pdf-page, sheet-cell, slide-shape, doc-para, sheet-range, doc-table, image".

**Root cause (read and run).**
- `bio-plane/src/inquiry-grammar/grammar.mjs:34-35` imports `checkContentExtent, legExtent, legHasAuthoredExtent, ...` from `../content/extent-core.mjs`, the CORE. `checkLegExtentGrammar` (`:537-538`) calls it, and the store's promote path reaches it through `checkInquiryBasis` (`:803`).
- The core judges kinds against text-chain's table (`extent-core.mjs:285-288`, `CONTENT_EXTENT_KINDS` imported from `../textchain.mjs`: the eight, by design). `doc-part` and `envelope` are added only by content's public face: `content/extent.mjs:51-54` (the ten-kind table) and `:428-445` (`checkContentExtent`, whose `doc-part` arm is `checkPart`, `:454`). `content/index.mjs` re-exports that one. Direct run: core `checkContentExtent({kind:"doc-part",...}, DOCUMENT_ONLY)` refuses with the sentence above; `content/index.mjs`'s accepts it; `checkLegExtentGrammar` on a `doc-part` leg refuses.
- Second defect on the same path: the core's `legExtent` (`extent-core.mjs:69-128`) reads `extent_part` only under `image`, so a `doc-part` leg's `part` is dropped: `legExtent({extent_kind:"doc-part", extent_part:"word/footnotes.xml", extent_ref:"footnote 2"})` gives `{kind, ref}`, whose canonical form (`text-chain` R97: `{kind, part, ref}`) has `part: null`, a different address from the found unit's. Derived from the direct call; with only the import fixed the refusal goes but the content id would be minted over a different extent than the one found.

**Product or test.** Product. Test is right.

**Owner.** Not text-chain: its eight-kind table is deliberate (text-chain R92; `content/seams.test.mjs:72-74` compares "the eight" without `doc-part`), and its `canonicalExtent`/`describeExtent` already have the `doc-part` arm (R97, R98; `textchain.mjs:1663`). Not the catalogue row: C-2.8 `CONTENT_EXTENT_UNREADABLE` is the right answer for an unknown kind. The unmet requirement is content R1 ("the `doc-part` extent ... are extents ... refused only when malformed"), which the leg grammar bypasses by importing the core file instead of content's face; two edits: inquiry-grammar `grammar.mjs:35` (import path) and content `extent-core.mjs` `legExtent` (a `doc-part` arm reading `extent_part`; `legHasAuthoredExtent` already lists `extent_part`). The committed case-checker bundle `bio-plane/src/case-checker/program.mjs` embeds the grammar and must be rebuilt by BOB afterwards (rB D10).

**Requirement quotes.** content R1: "Only the eight kinds above, the `envelope` extent R33 adds (K102), and the `doc-part` extent (K4910) are extents. A `doc-part` extent `{kind: "doc-part", part, ref}` addresses a non-body part ... it is refused only when malformed". content R48: "the extent core ... `legExtent` ... `checkContentExtent` ... copied from the catalogue unchanged ... `content/extent.mjs` stays their one public face". inquiry-grammar's uses list: "`content`: `checkContentExtent` and its document-only context (C-45)". Wording changes: content R48 add "`legExtent` reads `extent_part` for a `doc-part` leg (the one place it departs from the catalogue's, whose legs had none)"; inquiry-grammar R4 add "the leg's part is judged by content's public `checkContentExtent`, so every kind content's R1 lists is admitted".

**Why the module tests missed it.** content's `grammar.test.mjs:18-41` and `r9-units.test.mjs` test `doc-part` through content's own `checkContentExtent`; `seams.test.mjs` proves the core equals the catalogue for the eight only; inquiry-grammar's `grammar.test.mjs`/`corpus.mjs` have no `doc-part` leg. Nothing calls `checkLegExtentGrammar` with one.

**Smallest fix (verified).** `grammar.mjs:35` `from "../content/extent.mjs"` (it re-exports `legExtent`, `legHasAuthoredExtent`, `CONTENT_ID_RE`, `CONTENT_EXTENT_DOCUMENT_ONLY`, and its `checkContentExtent`; `CONTENT_EXTENT_DOCUMENT_ONLY` has `known: false` so `checkPart` raises no NO_CHAIN); plus in `extent-core.mjs` `legExtent`: `if (kind === 'doc-part' && typeof l.extent_part === 'string' && l.extent_part.trim()) out.part = l.extent_part.trim();`. Direct: the footnote leg yields no finding; a `doc-part` leg naming neither part nor ref yields one finding. Seam in the copy: `the footnote found is cited in a question ...` PASS (187 s).

**Failing-first tests.** inquiry-grammar: `checkLegExtentGrammar({target, extent_kind: "doc-part", extent_part: "word/footnotes.xml", extent_ref: "footnote 2"}, "basis[0]", "C-2.8", f)` pushes nothing; control `{extent_kind: "doc-part"}` pushes one C-2.8 finding naming it; control `extent_kind: "doc-prt"` still the unknown-kind sentence. content: `legExtent(<that leg>)` equals `{kind: "doc-part", part, ref}` and `canonicalExtent` of it equals `canonicalExtent` of the unit's extent as `reading-pipeline` emits it.

---

## 3. §11 finished job row of a scan read to its end: written 0, failed 1 NO_HOME against the reading's written 8, failed 0

Reproduced alone (3 min): `{"state":"finished","kind":"reading","written":0,"skipped":0,"owed":0,"failed":1,"failed_why":{"NO_HOME":1}}` against `{"written":8,"skipped":0,"owed":0,"failed":0}`.

**Root cause (run with a trace on `settle`; the four answers, in order).**
1. `reading` row: `readHeld` answers `{ok:true, read:false, why:"NO_HOME"}` (the door's inline read made the document at upload; the filing had not promoted it yet). `plane/pending.mjs:431`, the last line of `settle`, falls to `attempt(row, at, "NO_HOME")`, and `attempt` (`:334-340`) does `failed=failed+1, failed_why={"NO_HOME":1}`. The `ocr` kind has `NO_HOME` in `OCR_NOTHING_OWED` (`:121`) and so ends without a failure; the `reading` kind has no such arm, and the `keep` owner (`:507-516`) treats NO_HOME as "owes nothing". Asymmetric.
2. `ocr` row: NO_HOME, ends (no failure).
3. `ocr` row: `{ok:true, read:true}`: this pass wrote the 8 units; the answer carries no counters, so nothing is tallied (`tally`, `:371`).
4. `reading` row, after filing: `{ok:true, read:false, why:"READING_HELD"}` (extraction R80: a reading is already held), no counters; the end arm (`:426-429`) calls `tally(row, r, false)` (adds 0) and `finish` (`:341-345`), which does not touch `failed`. `op=reading`'s `job` is the `reading` row (`control-plane/job-state.mjs`, `jobStateOf`), so it states written 0 and failed 1 while `completeness.counters` (extraction `#completenessOf`, `extraction/index.mjs:1945`) is written 8.
The row is only ever credited with units written by passes that run through it; the reading made by the door and the OCR pass are not.

**Product or test.** Product. The assertion is R135 read at its word: `op=reading` "answers ... the counters (`written`, `skipped`, `owed`, `failed`) ... from the job row".

**Owner and requirement.** plane R97: "the counters `written`, `skipped`, `owed`, `failed` (integers) with `failed_why` (JSON, by cause ...) ... A row ends only when the job's counters say nothing is owed". R135 (control-plane): "`op=reading` and `owedwork` answer from the job row" and "Neither asks the owner of a reading what its state is". extraction R80 (header of `readHeld`): answers `{ok:true, read:false, why}` with `NO_HOME`, `READING_HELD`, `NO_WHOLE_OBJECT`. R97 does not say what `written` and `failed` count when another act wrote the units, nor that a wait for a home is no failure; R80 gives no counters on `READING_HELD`. So the owner is plane (R97) with extraction R80, and the wording must change in both. control-plane's R135 is met as written (the seam is right to expose it).

**Why the module tests missed it.** plane's tests stub `readHeld` with canned answers and assert `[kind, attempts]`, never counters: `fix4-r75.test.mjs:101-113` ("no home yet: it is tried again", answers `{ok:true, read:true}`), `fix5-r77.test.mjs`, `r7-keephome.test.mjs`. extraction's tests (`r82.test.mjs`) never look at the job row. The three-act sequence (door read, OCR pass, filing, finishing pass) exists only through the door.

**Smallest fix (verified).**
- `extraction/index.mjs` `readHeld`: `left("READING_HELD")` also carries `counters: {written, skipped}` from `#completenessOf(digest)` (put in the local `left` so every READING_HELD branch has it; the branch at `:900` is not the only one reached). NOT `owed`: with `owed` in the answer `settle`'s `stillOwed` test (`pending.mjs:415`) sees owed pages on a held reading of a scan and keeps the `reading` row, which broke plane `fix4b-r77-owners.test.mjs` (F9, 60-page scan) in the copy; the pages owed are the `ocr` row's.
- `plane/pending.mjs` `settle`: (a) a `reading` row answered `NO_HOME` is waited, not failed: a `wait()` like `attempt()` without `failed=failed+1`; (b) a `reading` row answered `READING_HELD` with counters ends with `written=MAX(written, c.written)`, `skipped=MAX(...)` then `finish`.
Seam in the copy: `a scan read to its end` PASS (173 s); trace after: `reading` row written 0 failed 0 gets READING_HELD with counters written 8, ends `{written 8, failed 0}`.

**Open question for BOB (detail, P17).** A row that really failed transiently and later finished still states `failed` above 0 with its cause; I recommend keeping that (R97: "a failure is counted, by cause"), since the seam only asks failed 0 for a read that did not fail. Also the `ocr` row's own counters are still 0 for the pass that wrote the 8 units (not asserted by the seam; `op=reading` reads the `reading` row first).

**Failing-first tests.** plane: a `reading` row answered NO_HOME has `failed` 0, `last_why` NO_HOME, `state` queued, due later; then answered `{ok:true, read:false, why:"READING_HELD", counters:{written:8, skipped:0}}` it ends `finished` with written 8 and failed 0; control: answered `{ok:false, why:"TRANSIENT"}` it counts `failed` 1. extraction: `readHeld` of a digest with a held reading answers `READING_HELD` with counters equal to `completeness.counters`.

**Wording proposed.** plane R97 add: "`written` and `skipped` of a `reading` row that ends because the reading is already held are the reading's own (extraction R80's counters), whoever wrote the units; a `reading` row answered `NO_HOME` waits and counts no failure (as the `ocr` kind's does)." extraction R80 add: "`READING_HELD` carries `counters` `{written, skipped}` of the reading held (R100); never `owed`, which the `ocr` row carries."

---

## 4. §12 UNDECLARED UTF-8 text with one invalid byte is decoded wholly as windows-1252

Reproduced alone (upload and fetch, 2.3 min); also at unit level: `decodeText(<UTF-8 text with œuvre ... plus one 0xFF>, {})` gives `{encoding: "windows-1252", assumed: true, replaced: 0}` and `'L'Å“uvre'`.

**Root cause (read and run).** `bio-plane/src/ooxml.mjs:950` (in `sniffEncoding`): `if (detect && !utf8Check(b).valid) return { ok: true, encoding: "windows-1252", assumed: true };` The test is all-or-nothing: one invalid byte anywhere makes the whole text legacy, so every `œ é ñ ’` in 60 units becomes two wrong characters, with `replaced: 0` and `failure: null`.

**Product or test.** Product. The test follows DOCS T7 (plan row, quoted in `build/jobs/T51/office-readers.bob.md` G131g (3)): "UTF-8 with a bad byte at the middle and at the end; each as `text/plain` with and without `charset` ... the text equals the truth or `ENCODING_UNSUPPORTED {name}`; **never** `U+FFFD`/NUL units with `failure: null`". The declared half is green (replacement counted, `ooxml/round9.test.mjs:348-351`).

**Owner and requirement.** ooxml R36: "It decodes UTF-8 (with or without a BOM), UTF-16 (with or without a BOM) and the declared or detected legacy charset (windows-1252, ISO-8859-x). ... `assumed` is `true` when no declaration and no BOM decided it; `replaced` is the number of U+FFFD ... a text its declared encoding could decode never comes back with replacement characters in its place." It names no outcome for undeclared bytes that are UTF-8 apart from a stray byte; "detected legacy charset" was read as "not valid UTF-8 means legacy". T7 needs "truth or named", and naming (`ENCODING_UNSUPPORTED`) would refuse a whole file for one byte, so the truth is the better outcome. The requirement text must change: one sentence and the threshold (BOB's detail ruling).

**Why the module tests missed it.** `ooxml/round9.test.mjs`: undeclared valid UTF-8 (`:308`), undeclared Latin-1/windows-1252 (`:332`), declared UTF-8 with bad bytes (`:348`), never undeclared with a bad byte. The seam fixture (UTF-8 with an invalid byte, no charset) is the only such input.

**Smallest fix (verified).** In `sniffEncoding`: `if (detect && !utf8Check(b).valid && !mostlyUtf8(b)) windows-1252`, with `mostlyUtf8(b)` counting well-formed multi-byte sequences against invalid bytes and returning `valid > 0 && invalid * 4 <= valid`. Result: `{encoding: "utf-8", assumed: true, replaced: 1}`, text `L'œuvre ...`; Latin-1 `café résumé` and `naïve` still windows-1252; one valid sequence against one invalid byte (ambiguous) still windows-1252. `ooxml/round9.test.mjs` 26/26 pass in the copy; seam `... red until the detection decodes an undeclared UTF-8 ...` upload PASS and fetch PASS.

**Failing-first test (ooxml).** `decodeText(<UTF-8 text with 10+ accented characters and one 0xFF in the middle, and the same with a truncated character at the end>, {})` is `{encoding: "utf-8", assumed: true, replaced: 1 (or 2), text contains "œuvre"}`; controls: undeclared Latin-1 (no valid sequence) stays windows-1252; one valid and one invalid stays windows-1252; declared `utf-8` unchanged.

**Wording proposed.** R36 add: "With no declaration and no BOM, bytes that are not valid UTF-8 are read as UTF-8, `assumed`, the invalid bytes replaced and counted in `replaced`, when well-formed multi-byte sequences outnumber them four to one at least; otherwise as windows-1252."

**Flagged, not run.** csv-reader decides its encoding per window by majority (its header §2), a second rule for the same bytes; T7's "the same file gives the same answer by upload, fetch and parts" is not checked for a `.csv` with a bad byte.

---

## 5. §13 G130b: CSV declared `application/vnd.ms-excel` / `application/octet-stream` ends `final`; `.tsv` declared `text/plain` is read as prose

Reproduced alone (2.4 min): `csv declared application/vnd.ms-excel: not read as a sheet ({"comp":"stated","failure":"final"})`, same for octet-stream, `tsv declared text/plain: ... "extent":{"kind":"doc-para"...}`; `text/csv` and `text/tab-separated-values` pass.

**Root cause (run with a trace on `detectFormat`).** Every `detectFormat` call in the upload path has `name: null`: `acquisition/index.mjs:2091` (`format: detectFormat(formatBytes, ct || null)`, called from capture's `profileThe`, `capture/index.mjs:955`), and `reading-pipeline/index.mjs:2838` (re-detection inside `readInner`, reached from `read`, `:2622`). `formats.mjs:153` (`afterBytes`) runs the name pass only when a name is given, so csv-reader's `isDelimitedText` is never asked. For the two non-text declared types a second gap: `profileThe(ct)` gets `ct = null` (textTypeOf returns null for a type that is no text type, `acquisition/index.mjs:155-170`), and the declared `type` is recorded only afterwards (`capture/index.mjs:957`), while `isDelimitedText` returns false for a non-string type (`csv-reader/index.mjs:1211`). So the profile says `undetermined`, the reader finds no entry (`wireable` false) and the reading is stated `final` (the traced fact is the `undetermined` profile and re-detection with no name; which `final` arm answers, `reading-pipeline/index.mjs:2903` or the not-read-as-text one, was not traced); for `text/plain` + `.tsv` the profile is `undetermined`, the text-type fallback reads it as prose.

**Product or test.** Product. Test is right (SHEET C23/C24/C32/C33).

**Owner and requirement.** format-registry R31 ("Pass 3 (name and head): runs only when ... `name` is provided. It calls csv-reader's `isDelimitedText(name, contentType, head)` ... So a CSV declared `application/vnd.ms-excel`, `application/octet-stream` or `text/plain` with a name ending `.csv`, `.tsv`, `.tab` or `.txt` is read as a sheet") and csv-reader R21 are met: run with a name and the declared type, `detectFormat` answers csv. The unmet requirement is the callers': acquisition R17/R101 ("`format` from `format-registry.detectFormat` over the bytes") and capture R107 never say the document's name and declared type are handed in. One more conflict BOB must reconcile in words: acquisition R102 "A declared type that is not text is never overridden by a name" (about the text content type, `textTypeOf`) against R31 (about the format `csv`): they answer different questions, but R102 calls itself "One rule for a member's file as text", so the text should say that R31's name pass decides the FORMAT `csv` and R102 only the text content type. Fetch (`acquisition/index.mjs:1786`, locator's last path segment as name) has the same omission; derived, not run.

**Why the module tests missed it.** format-registry's tests call `detectFormat(bytes, ct, name)` with a name (R31 met); csv-reader tests `isDelimitedText` directly; acquisition and capture tests (`capture/g41b-t51.test.mjs`) upload CSV declared `text/csv` or by `.csv` name with no type, never a CSV declared with a non-text type nor a `.tsv` as `text/plain`.

**Smallest fix (verified).** `acquisition/index.mjs` `profileOf` takes `name` and `declaredType` and uses `formatOf(bytes, ct, name, declaredType)`: `detectFormat(bytes, ct || null, name)`, and when that is `undetermined` and `ct` is null, once more with the declared type, taking the answer only if it is `csv` (bytes still outrank every declared type). `capture/index.mjs:955` passes `name` and `type`. Seam in the copy: `G130b` PASS (149 s); trace shows all five cases with their names and format `csv`.

**Failing-first tests.** acquisition `profile.test.mjs`: `profileOf` of the C01 CSV bytes with `name: "c.csv"` and `declaredType` `application/vnd.ms-excel` / `application/octet-stream` has `format.format` `csv`; `.tsv` with `ct: "text/plain"` the same; controls: the same bytes with no name stay `undetermined`; a ZIP with `.csv` name and octet-stream is `zip`/its own format (bytes outrank). capture `g41b-t51.test.mjs`: the upload of each of the five seam cases is profiled `csv`.

**Wording proposed.** acquisition R17 and R101 add: "`detectFormat` is given the document's name (an upload's name, a fetch's last path segment) and, where `ct` names no text type, the declared type once more, taking only a delimited text it finds (format-registry R31)." capture R107 add: "`uploadCapture` hands `profileOf` the name and the declared type." acquisition R102 add: "R31's name pass decides the format `csv`; this rule decides only the text content type."

---

## Regression run of the owners' tests in the copy

Seam, each alone in the copy with all fixes applied: reds 1, 2, 3 (re-run after the last change), 4 (upload and fetch) and 5 pass. Module tests, one file at a time, 79 files of: office-readers (docx, parts, text, mce), inquiry-grammar (all), content (all), plane (pending, jobs, keep-home, bookkeeping), capture (upload, g41b), acquisition (profile, decode, format-range, registrar), reading-pipeline (r9-reader, pieces-formats, csv-range), format-registry, csv-reader (all), extraction (r82, r99-r107, n26), ooxml (all 6). Results: `/tmp/claude-0/-home-user-bio/a6c1edf3-f10a-553b-b4ba-067ada11cc6f/scratchpad/reg2.out`. Two files went red; both green on the unchanged worktree:
- plane `fix4b-r77-owners.test.mjs` (F9): caused by my first version of the READING_HELD counters carrying `owed`; fixed in the copy (counters `{written, skipped}`), file green again, seam re-run green. A real trap for the owner: do not put `owed` on that answer.
- extraction `n26.test.mjs:81` (R66): the pinned duplicate of red 1 (see there); it follows BOB's choice B (its expectation changes) and does not follow C.
Not run (time): the rest of the 272 files of those modules and the other modules; the owners' own runs and BOB's merge run cover them.

## Combined effect of the nine edited files (see `fixes.diff`)

`acquisition/index.mjs`, `capture/index.mjs` (5); `content/extent-core.mjs`, `inquiry-grammar/grammar.mjs` (2); `docx.mjs`, `reading-pipeline/index.mjs` (1); `extraction/index.mjs`, `plane/pending.mjs` (3); `ooxml.mjs` (4). Each owner's job changes only its own paths; reds 1, 2, 3 and 5 are two-module changes (sequence: provider first, consumer second).
