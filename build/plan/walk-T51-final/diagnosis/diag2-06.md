# Diagnosis of the final walk, sitting 06 (read, find, cite into a question): the 46 BROKEN rows of `06-read-cite.md`

Read: record `06-read-cite.md` on `origin/prep/final-06-read-cite` at `bc9cd88f47` (journey script `scripts/06-read-cite.test.mjs` read whole for the rows below); product code `/home/user/wt-diag` at `49f2e85a98` (tranche/T51). Fix round 10 (`fix-round-10-T51.md`, read whole) and `diagnosis/diag2-*.md` were checked for every cause. I reproduced by running small scripts and one Miniflare plane per case against the worktree (scratch files only; nothing in the worktree changed except `bio-plane/node_modules`, from `npm ci`). Paths below are under `bio-plane/src/` unless they start with `build/`, `docprofile/` or `site-profiles/`. "Record defect N" is the number in the record's own list.

| # | Record | Rows | Verdict | Owning module | One-line cause |
|---|---|---|---|---|---|
| 1 | 06 (record 1) | R49.5, R49.7 | DEFECT (BLOCKER) | monitoring | the tick files a changed copy under a register row only: no reading is owed, and a bare-digest read is a final "not read as text" |
| 2 | 06 (record 2) | R46.2 | DEFECT (MAJOR) | retrieval | `#documentsOf` binds 200 ids a statement; the plane's bound is 100 |
| 3 | 06 (record 3) | R45.4, R45.7, BROWSER2.3 | SPECIFIED (citation R2) + question for Bob | citation | "already cited" means any leg on the document, so a second passage is never written |
| 4 | 06 (record 4) | R45.24-R45.27 | SPECIFIED / WALKER-ERROR (+ one gap, BOB's) | content | the bound is the format's grid; a CSV has none; a text read holds no paragraph count |
| 5 | 06 (record 4) | R45.28, R45.29 | DEFECT (MINOR) | content | no test that the extent's kind fits the capture's format |
| 6 | 06 (record 5) | R47.1 | SPECIFIED (csv-reader R7/R21 as amended by fix round 10 cause 20); wording needed | csv-reader | a `.txt` with a comma on most lines has "one consistent delimiter" |
| 7 | 06 | R47.5, R47.6 | WALKER-ERROR | retrieval-browse | events read only typed minutes/agenda; people only followed names |
| 8 | 06 (record 6) | R47.16 | DEFECT (MAJOR) | calculations | `declareTable` takes a content id only; the screen sends `{capture_sha, extent}` for a passage never cited |
| 9 | 06 (record 7) | R46.32, R150.2, R150.3, R150.4 | DEFECT (MAJOR) | acquisition | a page's links are filed only when `subresources: true` is asked; the Add screen never asks |
| 10 | 06 (record 8) | R152.3 | SPECIFIED (retrieval R39, REC-110) | retrieval | the frontier tally is deliberately not gated; the record's expectation (D-447) is search order |
| 11 | 06 (record 10) | R46.27, OVERLAY.3 | DEFECT (MINOR) | retrieval | `NOT_YOURS` is intent's code; the door decorates by code, so a selection refusal reads the aspiration sentence |
| 12 | 06 (record 12; no BROKEN row) | R45.31, R49.12, R150.8 (WORKS) | DEFECT (MINOR) | connections | `backlinks` answers hypotheses' code `NO_SUCH_BUNDLE`; the sentence says "inquiry" and "Nothing was written" |
| 13 | 06 | R49.8 | SPECIFIED (site-profiles R18) / WALKER-ERROR | site-profiles | the conservative handler masks only `nonce="..."`; the walker's page used a csrf meta, an inline script and a render stamp |
| 14 | 06 | R49.13, R45.41, R48.17 | WALKER-ERROR (three different errors) | none | `source` is a cause word; `role` is refused before `extent`; `sever` reads its fields from the address |
| 15 | 06 (record 11) | BROWSER.6, BROWSER.16, BROWSER2.4 | DEFECT (MINOR) | screens-inquiry | an upload's source is drawn as its `upload:<64 hex>` locator |
| 16 | 06 | BROWSER2.5, BROWSER3.7 | DEFECT (MAJOR; gap in the requirements) | interface-shell | Enter in the Finder's words field sends nothing: no field-Enter path exists |
| 17 | 06 | BROWSER3.8 | WALKER-ERROR (interface-shell R35) | none | a network abort draws "can't be reached", as specified |
| 18 | 06 (record 14) | BROWSER.1, .2, .3, .5, .6, .7, .9, .11, .12, .13, .15, .16, .17 | WALKER-ERROR; KNOWN diag2-10b C9, closes diag2-07 §12 | none | every unnamed control sits in a closed `<details>`; `innerText` is empty there |
| 19 | 06 (record 14) | BROWSER.11, .12, .13, .15-.19 | mixed: KNOWN diag2-07 §10 and §11; DEFECT (MINOR) x2; one UNKNOWN | interface-shell; screens-daily | `a.cs-ref` is inline so `min-height` is void; the Finder's pick boxes are 24 px |
| 20 | 06 (record 14) | BROWSER.5, BROWSER.15 | WORDS | UX-DESIGN (row `screen.capture.logins.about3`) | the design's own sentence uses "secret" |

Record defects with no BROKEN row (13, 15, 16, and the sentence half of 9) are in the closing note.

---

## 1. 06 R49.5, R49.7 "a newer copy filed by Check now is never read, so its notice stays UNDETERMINED and ADOPT is refused" -- DEFECT (BLOCKER), monitoring

### 1. Root cause with evidence
Reproduced in Miniflare in 15 s with the member's own acts (acquire a page, file and vouch it, read it, cite its paragraph 2 into a question, `monitorset`, change the page, `op=monitor`): `monitor` answers `status: "modified"`, `capture.registered: true`; `op=owedwork sha=<new>` answers `owed: []`; `op=reading sha256=<new>` `found: false`; `versionnotice` `newer_capture_undetermined` with `newer_capture_unread`; `adoptversion` `BASIS_VERSION_REFUSED`, `C-45.2 CONTENT_EXTENT_NO_CHAIN`. Two causes, both in how the tick files the copy:
(a) Nothing owes a reading. `monitoring/index.mjs:1057-1076` holds the fetched bytes (`monCap`), `:1186-1194` promotes them with `register: addCap ? [{ sha256: monCap.sha256, path: monCap.file, encoding: "binary", ...}] : []`. The file has no call to `registerJob`, `owedLater` or `readHeld`. The door follows a reading after `op=promote` and `op=inboxpull` (`control-plane/index.mjs:4044` `if (((op === "promote" && followed.length) || op === "inboxpull") && ...`), and after an upload and an unpack on their own paths; control-plane R123 names `promote`, `captureupload`, `inboxpull`. The tick is `op=monitor` and the alarm sweep: followed by none of them.
(b) A read of that digest would still be a final non-text statement. The tick carries `data/provenance.json` forward untouched, so `extraction.#storedDocument(bundle, sha)` (`extraction/index.mjs`, `docs.find((d) => d.capture.sha256 === sha)`) finds no document for the digest and `readHeld` (`:916-960`) reads a bare `{capture: {sha256, bytes}}` stub. Measured: `op=readheld` as ann answers `read: true`; `op=reading` then `found: true`, `units_total: 0`, `completeness.state: "stated"`, `failure: "final"`, "the document was not read as text (non-textual or too large), so no reading was attempted"; `adoptversion` is still refused C-45.2. (As the founder, `readheld` answers `NO_HOME`: the founder cannot see ann's project; that is not a cause.)
The refusal and the unread notice are content's checks working (`content/index.mjs:1198-1200` `newer_capture_unread`), not a third cause. Owner: `monitoring` (paths `bio-plane/src/monitoring/`), the module that files the copy.

### 2. Why the module tests missed it
`bio-plane/test/m/monitoring/tick.test.mjs:511-553` (R9) asserts `capture.held/registered/file/why` and the promotion, never a reading; the module's fixture host is a stub with no job registrar or reader. control-plane `r123-reading.test.mjs` and `t51-reading-follows.test.mjs` cover promote, upload and pull only. content `converts-notice.test.mjs` builds its unread newer capture by hand.

### 3. Failing-first test
New `bio-plane/test/m/monitoring/check-now-reading.test.mjs`, importing `../control-plane/r8-kit.mjs` as the walker's script does: scripted outbound page whose paragraph 2 holds a counter; member acquires, files, vouches; `readWhole`; `findin` a term of paragraph 2 and `cite` it into a question; `monitorset` daily; bump the counter; `post op=monitor`. Assert, within 60 s: `op=reading sha256=<answer.capture.sha256>` is `found` with `units_total > 0` and no `failure`; `versionnotice` for the question names the leg `newer_capture_matched` (or `unaffected`), not `newer_capture_unread`; `adoptversion` on the queue notice answers `ok`, the leg's `extent_capture` is the new digest and `op=basisversions` counts 1. Red today: reading `found: false`, notice `newer_capture_unread`, ADOPT `BASIS_VERSION_REFUSED`. A unit twin in `tick.test.mjs`: the host's `registerJob` spy receives one `{kind: "reading", sha: seen}` for a registered `modified` tick and none for an unregistered one.

### 4. Platform
The cause is code: it reproduces in Miniflare (workerd). The reading itself runs on the object's alarm (plane R75, "within a minute"), so the post-fix check at its real shape is on the deployed plane: Check now on a watched page whose bytes changed, then `op=owedwork` shows a `reading` row that clears, `op=reading` has units, the notice grade follows, ADOPT writes.

### Requirement
monitoring R9 (the filed copy) states a register row only and `note2` still says the tick "does not capture the new version". control-plane R123's title ("A reading follows every entry into the record") states the right behaviour, its body lists three ops. Wording, one sentence in monitoring R9: "the copy is filed with a provenance document entry (locator, content type, digest) and a `reading` job is owed for it through the capture's registrar", and R123's list gains "the monitor tick's filed copy".

---

## 2. 06 R46.2 "`op=search` with limit 101 or more over 321 hits answers STORE_DID_NOT_ANSWER" -- DEFECT (MAJOR), retrieval

### 1. Root cause with evidence
`retrieval/index.mjs:803-809` `#documentsOf`: `for (let i = 0; i < uniq.length; i += 200) { const part = uniq.slice(i, i + 200), marks = part.map(() => "?").join(","); ... this.#rows(`SELECT b.bundle_id, b.title... WHERE b.bundle_id IN (${marks})`, ...part)`. It names the document of every hit of the page (`#namedHits`, R92), so a page of 101 hits binds 101 variables; the plane's statement bound is 100 (D-36; `query-language/fixture.mjs:28-33` `PLANE_VARIABLE_CEILING = 100`; `docs/development/kickoffs/RECORD.md:94`). Reproduced on the real module with a wrapper that refuses a statement of more than 100 arguments: limits 100 works, 101 and 150 throw at `index.mjs:809`; on the plane the throw is the object not answering, so the door says `STORE_DID_NOT_ANSWER`. The other chunks in the area are 64 or 100 (`units.mjs:12`, `BROWSE_ID_CHUNK` 64, `SELECTION_ID_CHUNK` 64); `review/index.mjs:1052` `CHUNK = 200` (project ids) has the same shape and is not exercised by this record. Reach: no screen sends `limit` over 100 to `search` except the question pickers (`screens-daily/find-in.mjs:25`, `finder-states.mjs:355`: `q: "type:inquiry", limit: "200"`), so a team holding more than 100 questions loses those pickers; the Finder itself sends 50 (`finder.mjs:42,115`), so the record's "first screen of 200" is the walker's reading.

### 2. Why the module tests missed it
retrieval's fixture opens `new DatabaseSync(":memory:")` with no variable limit (`bio-plane/test/m/retrieval/fixture.mjs:51`); `search.test.mjs` and `t51*.test.mjs` use a handful of documents. Only query-language's fixture carries the ceiling, and its tests never reach `#documentsOf`.

### 3. Failing-first test
In `bio-plane/test/m/retrieval/`: `fixture.mjs` opens its database with `{ limits: { variableNumber: 100 } }` as `query-language/fixture.mjs:33` does (this also finds the rest of the class); new `search-limit.test.mjs` files 150 documents with one title word and asserts `search({q: "title:Levy", limit})` answers `hits.length === min(limit, 150)` for 100, 101, 150 and 500 (the clamp), `total` 150, no throw. Red today at 101. The row itself is the check at the real shape.

### 4. Platform
Yes: the 100-variable bound is workerd's (undocumented, D-36). Node's SQLite has no such bound, so only the capped fixture or the plane sees it. Check at the real shape: `op=search&q=title:Levy&limit=101..500` against Miniflare or the deployed plane over more than 100 hits (the record's row R46.2).

### Requirement
retrieval R6 (a page of `limit` hits) and R92 already state the right behaviour; code only. The 90-variable rule is a project rule (D-36), not retrieval's text.

---

## 3. 06 R45.4, R45.7, BROWSER2.3 "cite a second passage of a document the question already rests on" -- SPECIFIED (citation R2), a question for Bob, citation

### 1. Root cause with evidence
`citation/index.mjs:588-596`: `const legged = new Set(ontoInquiry && ... doc.data.basis ... .map((l) => l.target))` then `else if (ontoInquiry ? legged.has(id) : st !== undefined) already.push(id)`; with no new member, `:672-679` answers `ok: true, cited: [], alreadyCited, detail: "every member of the selection was already cited; nothing was written. The part of the document this call named was written NOWHERE ... making an existing citation more specific is a separate authored act"`. Keyed by target, never by extent. The comment at `:576-579` says "A second leg on the same target is legal by design (D4) but is an authored statement, not a repeat of this act". citation R2 says it: "A member is already cited when the inquiry already holds a leg on it ... when a part was named it says the part was written nowhere." So the behaviour is specified. The only "separate act" is `narrow` (`basis-versions` R26/R27), which re-describes ONE existing leg in a new version; no act adds a second leg of the same document. The Document page then draws the whole-document words for a passage: `screens-inquiry/document.mjs:582-596` "Left as it was · the question already cited it · Page 20" (the member pressed Cite on page 3, the line names page 20 of the old leg; it does not say page 3 was cited).
Question for Bob (P17, requirement): should one question be able to rest on two passages of one document through Cite? Explanation: today Cite is one leg per document per question. Options: A, keep it, and have the Document page say so plainly ("This question already rests on page 20 of this document; a question rests on one passage of a document") with a door to `narrow`; B, Cite writes a new leg when the named part differs from every part the question already rests on that document, and answers "already cited" only for the same part. Recommendation: B. Members cite an ordinance page by page, and C-2.8's grouping already tolerates a second passage beside a grouped one (inquiry-grammar R68, K5090); A leaves no way to say it.

### 2. Why the module tests missed it
`bio-plane/test/m/citation/` tests the retry (same selection twice) and the "part written nowhere" sentence; no test cites two different parts of one document into one question, because R2 says it does not.

### 3. Failing-first test (if B is chosen)
`bio-plane/test/m/citation/` new `second-passage.test.mjs`: question with a leg on w10 page 19; `cite` of `found` page 2 (same document) answers `cited: [w10]`, two legs, `alreadyCited: []`; control: the same page again answers `alreadyCited`; control: `role` differs. Through the door in the walker's shape (`findin` then `cite`) with `r8-kit`. Red today: `cited: []`, one leg. If A: the red test is in `screens-inquiry/fr28-document-acts.test.mjs`: the line after the refused second passage names that a question rests on one passage and does not claim the page pressed.

### 4. Platform
No.

### Requirement
citation R2 states today's behaviour. B needs R2 reworded: "already cited when the inquiry already holds a leg on it with the same part (`content_id`); a different part of a document it rests on is a new leg" (and R3's answer fields unchanged). A needs one sentence in screens-inquiry R49/R61 for the line drawn after `alreadyCited`.

---

## 4. 06 R45.24, R45.25, R45.26, R45.27 "extents past the document accepted: cell AA9999, range A1:ZZ999, CSV cell A99999, paragraph 99 of a text" -- SPECIFIED (content R7, R8) / WALKER-ERROR, content

### 1. Root cause with evidence
Run on the module's own checker with the figures the readers store: workbook `sheets: [{name: "Sheet1", rows: 1048576, cols: 16384, usedRows: 13, usedCols: 4}]` (`formats-xlsx.mjs:1360,1467` `rows: XLSX_GRID_ROWS, cols: XLSX_GRID_COLS`): `AA9999` and `A1:ZZ999` answer null (inside the grid: column 27 and 702, rows 9999 and 999), `XFE1` answers `CONTENT_EXTENT_OUT_OF_RANGE`. content R7: "a cell past the format's grid capacity (never the used range: an empty cell exists)". The walker's "4x13 sheet" is the used range. CSV: `csv-reader/index.mjs:1131-1138` `rows: null, cols: null, usedRows, usedCols`, comment "THE BOUND IS NULL ... RFC 4180 fixes no maximum"; `coversSheetCell` (`content/extent-core.mjs:627-640`) skips a null bound; content R8 "an extent admitted without its bound held answers `undetermined`, never a refusal". Text: a text read through no format entry has no `container_extent` (reading-pipeline R12 "Absent when no entry answered"; `content/index.mjs:373` `paragraphs = ... held.paragraphs > 0 ? ... : null`; `coversDocPara` `extent-core.mjs:645-650` returns null). Verdict: SPECIFIED for the workbook and CSV (record "past the grid" is wrong), and for text a gap the requirements do not close: the reader numbers a text's paragraphs itself (reading-pipeline R32, `paragraphsOfText`), so the count is known and not stored. Detail, BOB's: recommend the text and HTML readings state their paragraph count in `container_extent` (reading-pipeline R12) so `coversDocPara` bounds them.

### 2. Why the module tests missed it
`content/converts-extent.test.mjs:241-330` tests bounds only where a container figure is held and the grid-versus-used-range rule (`:291`); no test cites a text capture (never has a figure).

### 3. Failing-first test
Only for the text gap, if BOB takes it: `reading-pipeline/convert-extent.test.mjs` a text read states `container_extent.paragraphs` equal to its units' count; `content/converts-extent.test.mjs` paragraph 99 of that capture is `CONTENT_EXTENT_OUT_OF_RANGE` with "3 paragraph(s)". Red today. For the workbook and CSV add the walker's cases as admitted-by-design controls.

### 4. Platform
No.

### Requirement
content R7/R8 already state the workbook and CSV behaviour. For text: reading-pipeline R12 needs "a text or HTML reading states its paragraph count as an office reading does".

---

## 5. 06 R45.28, R45.29 "a pdf-page extent on a Word file, a slide on a text file" -- DEFECT (MINOR), content

### 1. Root cause with evidence
Run on `checkContentExtent` (`content/extent-core.mjs:287`): `{kind: "pdf-page", page: 0}` over a docx context (`container_name "docx"`, 16 paragraphs) answers null; `{kind: "slide-shape", slide: 1}` over a text context answers null. Each kind is judged only against its own figure (`ctx.pageCount`, `container.slides`), which a docx or a text does not hold, so "not held" is read as "unbounded". Nothing asks whether the capture's format can have that kind of extent, although the context already carries the format (`content/index.mjs:1591-1606` `containerKindOf`: `format`, `office`). content R7 lists its refusals and has none for this. Reach: hand-built calls only; the screens offer extents found in the reading.

### 2. Why the module tests missed it
`converts-extent.test.mjs` crosses kinds with containers that hold the right figure; no row crosses a kind with a format that cannot hold it.

### 3. Failing-first test
`bio-plane/test/m/content/converts-extent.test.mjs`: for formats docx, xlsx, pptx, pdf, csv, text, each extent kind the format cannot hold answers `CONTENT_EXTENT_OUT_OF_RANGE` naming kind and format; a kind it can hold, and a context with `format: null` (not held), answer null. Door twin in `bio-plane/test/m/citation/`: `cite` with `extent_kind=pdf-page` over a docx selection answers `BASIS_REFUSED` with that finding. Red today (null).

### 4. Platform
No.

### Requirement
content R7 needs one sentence: "an extent of a kind the capture's format cannot hold (a page of a Word file, a slide of a text, a cell of a PDF) is refused C-45.1, naming the kind and the format; where the format is not held it is not refused (R8)".

---

## 6. 06 R47.1 "a plain-text file of minutes with commas is read as a CSV table" -- SPECIFIED (csv-reader R7 as amended in fix round 10 cause 20; R21), wording needed, csv-reader

### 1. Root cause with evidence
`formats.mjs:153` calls `csv.isDelimitedText(name, ct, head)`; `csv-reader/index.mjs:1216-1243` accepts `text/plain` and `.txt` and returns true when `scanDialect` finds one consistent delimiter; the rule (`:393-413`) is `if (present * 2 > lines) consistent.push(...)`, "present on the majority of the lines, whatever its count", which is csv-reader R7 as amended (fix round 10, cause 20; K5053, K5056). Run: `isDelimitedText("comma-minutes.txt", "text/plain", <the walker's four paragraphs>)` is true (three of its four non-blank lines carry a comma; the walker's comment "fewer than half" miscounted); the five-paragraph `rich-minutes.txt` (one comma line of five) is false. So this is cause 20's rule applied to prose, KNOWN as a family (fix-round-10 §1 G4 R20) but new in shape: R21 lists `text/plain` and `.txt` and says "true exactly when ... R7's delimiter rule finds one consistent delimiter". Per-line counts of the walker's file are 2, 1, 3, 0: no count repeats.

### 2. Why the module tests missed it
`delimited.test.mjs:36` ("prose with one comma a line is not consistent") uses one comma line in three; no test has prose with commas on most lines, and the cause-20 test is a ragged CSV with a title block.

### 3. Failing-first test
`bio-plane/test/m/csv-reader/delimited.test.mjs`: the walker's four paragraphs as `minutes.txt` / `text/plain` answer false; controls: a real three-column CSV named `.txt` true, the same bytes named `.csv` true, a ragged CSV with a title block named `.csv` true (cause 20's). Door twin: upload `comma-minutes.txt`, `op=reading` `format` is not `csv` and its units are `doc-para` (red: `format "csv"`, one unit `sheet-range A1:D7`). Rule to test, recommended: for a declared plain-text file the delimiter's most common non-zero per-line count must hold on the majority of lines (presence alone suffices for `.csv`/`.tsv` and declared CSV types).

### 4. Platform
No.

### Requirement
R7 and R21 state today's behaviour; they need wording: "for `text/plain` or a `.txt` name the delimiter must repeat with the same count on the majority of lines; a declared CSV or TSV keeps presence on the majority".

---

## 7. 06 R47.5, R47.6 "Find in this, kinds events and people, count 0" -- WALKER-ERROR, retrieval-browse

### 1. Root cause with evidence
`retrieval-browse/findin.mjs:38-41` `FIND_EVENT_TYPES = ["meeting_minutes", "meeting_agenda"]`; `#events` (`:464-468`) skips a capture typed otherwise with "not minutes or an agenda" (count 0, `nothing: false`, not "Nothing here"). The walker's plain-text minutes are typed `generic` (record R50.8 `doctype "generic"`). `#people` (`:482-`) matches only followed persons and offices (`FIND_PEOPLE_KINDS`); the room follows nobody, as row R47.8 of the same sitting states. retrieval-browse R2: "events: the items ... the doctype readers read in a capture typed as minutes or an agenda".

### 2. Why the module tests missed it
Nothing missed: behaviour is as specified. 3. Failing-first test: none. 4. Platform: no.

### Requirement
retrieval-browse R2 states it. The walker re-runs with an uploaded minutes document the doctype reader types as minutes, and a followed person.

---

## 8. 06 R47.16 "Declare the table from a found CSV passage with no content row yet answers NO_SOURCE" -- DEFECT (MAJOR), calculations

### 1. Root cause with evidence
The screen composes the body: `screens-daily/find-in-forms.mjs:133-136` `source: it.content_id ? String(it.content_id) : { capture_sha: it.capture_sha, extent: it.extent }`. `calculations/index.mjs:675-676` `declareTable`: `const contentId = typeof source === "string" ? source.trim() : plain(source) ? str(source.content) : ""; if (!contentId) return no("NO_SOURCE", "a table names its captured source: the content id of a CSV, ...")`. An object `{capture_sha, extent}` has no `content`, so it is refused; a found item has a `content_id` only once somebody cited its passage. Every other recording act takes the same found match and mints (money `#source`, `money/index.mjs:511-536`). The walker's body is what the screen sends. Owner: `calculations` (it states the contract; the screen's shape is the one money and dates take).

### 2. Why the module tests missed it
calculations tests always pass a content id (`r9-source.test.mjs`, `application.test.mjs`); screens-daily `find-in.test.mjs:17` fakes a table item that already carries `content_id: "CNT-4"`.

### 3. Failing-first test
`bio-plane/test/m/calculations/declare-found.test.mjs` (new), over `r8-kit` as the walker: upload and file a CSV, read it, `findin` a row, `tabledeclare` with `source: {capture_sha, extent}` from the item, `header` and `schema` as the screen builds them; assert `ok: true`, a content row minted for the extent, and the same table sha as declaring from the content id after citing. Red today: `NO_SOURCE`.

### 4. Platform
No.

### Requirement
calculations R1 says "a captured source (a content extent of a CSV ...)"; the code reads it as a content id. Wording: "`source` is a content id, or a found passage `{capture_sha, extent}` whose content row is minted as money R2 does".

---

## 9. 06 R46.32, R150.2, R150.3, R150.4 "op=links of a captured page with five anchors answers `links: []`" -- DEFECT (MAJOR), acquisition

### 1. Root cause with evidence
`acquisition/index.mjs:1749-1753` walks a page only `if (body.subresources === true && !subsSkipped)`, and the links are filed inside that walk (`:2311-2318` `cap.recordLinks(...)` in `walkSubresources`); acquisition R19 "Supporting files (`subresources: true`)". The member's Add screen never sends it: `screens-intake/capture.mjs:652-666` builds `{ locator, for?, project?, render? }`. Reproduced: acquire `{locator, project}` of the hub page, file it: `op=links capture=<sha>` answers `resolved: 0, links: []`; the same page acquired with `subresources: true` answers `resolved: 5` (`tally {linked: 1, offsite: 3, anchor: 1}`); the page parser itself finds all five (`captureSubresources` called alone returns 5 links). So no member-captured page has links: `op=links address=` (count 0), the frontier's never-looked set (R46.32, `retrieval/frontier.mjs`, reads the `deferred` partition), SELF-REFERENCE and held verdicts (R150.2-3) have no rows to show. capture R27 says "a capture's own links are a property of its bytes"; they are filed only as a by-product of fetching supporting files.

### 2. Why the module tests missed it
`acquisition/acquire.test.mjs` and `fix6-t51.test.mjs` pass `subresources: true`; `capture/reads.test.mjs` calls `recordLinks` directly; screens-intake tests check the body without asking what the plane then holds.

### 3. Failing-first test
`bio-plane/test/m/acquisition/` new `member-links.test.mjs` over `r8-kit` as the walker: `acquire {locator, project}` (no `subresources`) of a page with five anchors, file it, `op=links capture=<sha>` answers 5 links in the groups `anchor`, `deferred` (x4, one a self-reference), and `op=links address=<leaf>` lists the hub; capture the leaf and the leaf's link reads held. Red today: `links: []`, `count: 0`.

### 4. Platform
No (reproduced in Miniflare, pure code).

### Requirement
acquisition R19 says the walk is on request and says the links are filed after it, which is the behaviour. Wording: "every HTML capture files its page's links (no fetching); `subresources` adds the walk of supporting files". Remedy choice is BOB's; recommended: record the links from the primary on every HTML capture, since the Add screen's "as the site sent it" must stay cheap.

---

## 10. 06 R152.3 "a hidden project's new document moves a non-participant's frontier tallies" -- SPECIFIED (retrieval R39, REC-110), retrieval

### 1. Root cause with evidence
`retrieval/frontier.mjs:147-174`: "THE TALLY IS DELIBERATELY NOT GATED (REC-110, D-386 closed; narrowed by D-486 to leave out the run rows of a project the viewer cannot see): it counts EVERY row at this level ... names no bundle, subject or address"; the `tally` note ends "and is not gated". retrieval R39: "At the document, content and meaning levels R38 does not narrow it (the REC-110 ruling), but it leaves out every row whose authority is a run in a project the viewer cannot see". `docs/development/OBSERVATION-LOG-DESIGN.md:37`: "REC-110's tally ruling (premise 1) is NOT reopened" (BOB #15). The record's D-447 is `query-language` R11, about search order and snippets (which did not move, as the row reports). The document-filing rows are not runs, so D-486's narrowing does not apply.

### 2. Why the module tests missed it
Not missed: `frontier.test.mjs` asserts the ungated tally. 3. Failing-first test: none. 4. Platform: no.

### Requirement
retrieval R39 states it. If Bob wants aggregate counts to stay fixed under hidden activity, that reopens a ruling (policy): the cost is that the tally cannot then be one unbounded scan (R39's own reason). No job without his word.

---

## 11. 06 R46.27, OVERLAY.3 "`NOT_YOURS` on another member's selection reads 'A member's own aspiration is declared ...'" -- DEFECT (MINOR), retrieval

### 1. Root cause with evidence
`retrieval/index.mjs:1418,1437` return `{ ok: false, reason: "NOT_YOURS", detail: "a selection is readable only by the credential that made it" }`, no `check`, no `translation`. The door's decoration is by code alone (`answer-envelope/index.mjs:184-195` `dec49Decorate`: `const row = dec49Row(code); ... r.check = row.check; r.translation = row.translation`), and the row for `NOT_YOURS` is intent's C-111.15 (`intent/checks.mjs:83-85`, `intent/index.mjs:304`). The shell draws `refusal.<code>` first (interface-shell R13, `browser.mjs:346`), so a member sees the same sentence. Precedent: tasks mints `TASK_NOT_YOURS` "apart from intent's `NOT_YOURS` (C-111.15), so the control plane's door, which keys rows by code, finds this row" (`tasks/checks.mjs:36-37`). Owner: `retrieval`.

### 2. Why the module tests missed it
`bio-plane/test/m/retrieval/selections.test.mjs` asserts the module's `reason`, never the door's decoration (module tests do not run the envelope).

### 3. Failing-first test
`bio-plane/test/m/retrieval/` new `selection-not-yours.test.mjs` over `r8-kit`: ann holds a selection, mel `op=selection&handle=`: the refusal has a `check` and a `translation` that does not contain "aspiration" and names a set of things. Red today: C-111.15 and the aspiration sentence. Unit twin: retrieval's refusal carries its own code and row (DEC-49: the code at one literal site).

### 4. Platform
No.

### Requirement
retrieval R19, R21, R77 name the code `NOT_YOURS`; the fix is a code and a catalogue row of retrieval's own (like `TASK_NOT_YOURS`), so those three lines name it. The sentence itself is a words row (UX-DESIGN): "That set of things was made by another member; only that member can use it."

---

## 12. 06 (record 12; rows WORKS: R45.31, R49.12, R150.8) "a non-participant's read of a document's citers answers 'There is no inquiry here by that id'" -- DEFECT (MINOR), connections

### 1. Root cause with evidence
`connections/index.mjs:884` `backlinks`: `if (!this.sees(target, viewer)) return { ok: false, reason: "NO_SUCH_BUNDLE", target }`. `NO_SUCH_BUNDLE` is also hypotheses' code (`hypotheses/checks.mjs:21` C-134.1, "There is no inquiry here by that id that you can see. Nothing was written."), and the same code-only decoration (`answer-envelope/index.mjs:184-195`) puts that sentence on a read of a document. Same class and same remedy as section 11 (own code and row); strength, actions and action-holds also answer a bare `NO_SUCH_BUNDLE` (greps at `strength/index.mjs:697`, `actions/index.mjs:1531`, `action-holds/index.mjs:214`) and get the same sentence: not diagnosed further here. The Document page does not draw the sentence (`screens-inquiry/document.mjs:95` treats `NO_SUCH_BUNDLE` as a held state).

### 2. Why the module tests missed it
connections tests assert `reason`, not the door's decoration.

### 3. Failing-first test
`bio-plane/test/m/connections/` over `r8-kit`: mel `op=backlinks&target=<ann's document id>`: `translation` does not say "inquiry" or "Nothing was written". Red today.

### 4. Platform
No.

### Requirement
connections R20 ("a target the viewer cannot see answers as an absent one") states the behaviour; wording of the sentence is UX-DESIGN's; the code is a connections row.

---

## 13. 06 R49.8 "a page that differs only by per-render machinery gives NO notice" -- SPECIFIED (site-profiles R18) / WALKER-ERROR, site-profiles

### 1. Root cause with evidence
Run through `docprofile.assess` with the walker's two renders: the page is an unrecognised document, handled by `conservative` (`site-profiles/handlers/conservative.mjs:40-48`), whose only rule is `/(\bnonce=")([^"]*)(")/gi` ("definitional"). Verdicts: nonce attribute alone `unchanged`; a changed `<meta name="csrf-token">`, a changed inline script body (`window.__t=n`) and a changed `data-render` stamp each `changed`. The walker's fixture carries all three, so `changed` is the specified answer: site-profiles R18 "an unrecognised document is never assumed decorated (`conservative` treats almost nothing as machinery ...)", and a CSRF meta is not per-response by definition. The record's note that this is "the same cause" as defect 1 is not so: the notice here is raised by a real `changed` verdict (`monitoring/index.mjs:1119-1121` `settledQuiet`), and defect 1 is about reading the copy.

### 2. Why the module tests missed it
Not missed. 3. Failing-first test: none; a walker fixture for this row must be a recognised stack (a WordPress page with `_wpnonce`, `site-profiles/handlers/wordpress.mjs:77-81`) or carry a `nonce="..."` attribute and no other moving byte. 4. Platform: no.

### Requirement
site-profiles R18 states it. New handlers "earn the right on measurement" (conservative.mjs header); no job.

---

## 14. 06 R49.13, R45.41, R48.17 -- WALKER-ERROR x3, none

### 1. Root cause with evidence
R49.13: `reevaluation/index.mjs:2931-2950` `recordReevaluation`: `if (!dep || !tgt || !src || !CAUSE_SOURCES.includes(src)) return noCause("pass dependent=<the finding looked at>, target=<what moved under it> and source=<one of supersession, edition, deferred, ...>")`. The walker sent `source: web.sha`, a capture digest; `source` is the cause word from the closed list (`source` for a newer version of a cited page). R45.41: citation R1 refuses in order, `ROLE_NOT_APPLICABLE` (a project takes no role) before the part (`EXTENT_NOT_APPLICABLE`); the walker sent `role: "supports"` so the project arm answered `ROLE_NOT_APPLICABLE` (a correct refusal in the member's words), and the case id and draft id are not projects (`NO_SUCH_PROJECT`). R48.17: `citation/index.mjs:1133-1136` `sever` reads `project`, `handle` and `reason` from the address (`q("project")`, `q("handle")`, `q("reason")`; only `cite` reads the body, citation R19/K4308); the walker POSTed them in the body, so the handle was never seen (`NO_SUCH_SELECTION`) and the "still held" read proves it. The screen sends them in the query (`screens-inquiry/question.mjs:1395-1402`). OVERLAY.5's `sever` NO_SUCH_SELECTION is the same error.

### 2. Why the module tests missed it
Nothing missed; the refusals are specified. 3. Failing-first test: none. 4. Platform: no.

### Requirement
reevaluation R16, citation R1/R19 state it. The walker re-runs R48.17 with the handle and reason in the address, R49.13 with `source: "source"` or the cause the notice names, and R45.41 without `role`.

---

## 15. 06 BROWSER.6, BROWSER.16, BROWSER2.4 "Document page: 'Captured {date} · upload:{64 hex}'" -- DEFECT (MINOR), screens-inquiry

### 1. Root cause with evidence
`screens-inquiry/document.mjs:181-185`: `cs.w("screen.document.captured", { date: ..., source: outside ? {html: <a ...>locator</a>} : (locator || doc.source.authority || "") })`. An upload's locator is `upload:<sha256>` (capture R108), so the running text carries a raw address with the fingerprint. screens-intake R35 already draws an upload as `document.uploaded.by` ({member}, {date}) in Held and wherever a held row names its source; the Document page was not moved with it. I read the page text in Chromium: `Captured October 25, 2026 · upload:<64 hex>`.

### 2. Why the module tests missed it
`screens-inquiry/document.test.mjs` and `fr*-document*.test.mjs` draw documents with web locators or none.

### 3. Failing-first test
`bio-plane/test/m/screens-inquiry/document.test.mjs`: a document whose `source.locator` is `upload:` plus 64 hex draws no `upload:` and no 40-hex run, and says who brought the file and when (`document.uploaded.by`). Red today.

### 4. Platform
No.

### Requirement
screens-inquiry R32 does not state the upload source; screens-intake R35 does for Held. Wording: "`document` draws an upload's source as `document.uploaded.by`, never its `upload:` address".

---

## 16. 06 BROWSER2.5, BROWSER3.7 "Finder: type a word and press Enter" -- DEFECT (MAJOR; a gap in the requirements), interface-shell

### 1. Root cause with evidence
In Chromium over a plane with one text document: `fill("#finder-q", "passage:treasurer")`, `press("Enter")`, wait 3 s: no `/api/` request is made and the page is unchanged; clicking the "Search" button sends `meaningrows` and draws the passage. Same for a word nobody holds (BROWSER3.7: Enter sends nothing, the click draws "Nothing your team holds matches ..."). The field and the act are not in a `<form>` (`screens-daily/finder.mjs:79-80` `cs.field("finder-q", ...)` beside `cs.act("search", ...)`) and the shell has no Enter path for a field: its `keydown` handler (`interface-shell/browser.mjs:2443-2457`) excludes `input, textarea, select` from the Enter/Space path and handles rows and grips only; the second listener (`:2475-2480`) handles Escape and Alt+Shift keys. No requirement says what Enter does in a field. (The record calls BROWSER3.7 an "inconclusive probe": the cause is this.)

### 2. Why the module tests missed it
interface-shell tests drive acts by click; screens-daily finder tests call the act. No test presses Enter in a field.

### 3. Failing-first test
`bio-plane/test/m/interface-shell/` over its Chromium harness (`phone390.test.mjs` pattern): a stand-in screen with a field that names its act and that act; pressing Enter in the field sends that act's op once, with the field's value; Enter in a `textarea` does not. Then `screens-daily/finder.test.mjs` (Chromium or the kit): Enter in `finder-q` calls `search`. Red today.

### 4. Platform
No.

### Requirement
Not stated anywhere. UX interaction (Bob's, P17), explained: a search box that ignores Enter surprises every keyboard user. Options: A, a field names the act Enter sends (`cs.field(id, key, {enter: "search"})`), Enter in a one-line field only; B, the first primary act of the field's section. Recommendation: A (explicit, one line per field). New interface-shell requirement text; screens-daily names it for `finder-q`, the Add address field and the other single-purpose fields.

---

## 17. 06 BROWSER3.8 "Document with its main read cut at the network" -- WALKER-ERROR (interface-shell R35), none

### 1. Root cause with evidence
The walker aborted `**/api/?op=image*` (`page.route(... r.abort())`): a transport failure, not a refused read. interface-shell R35: "a failed fetch or a 5xx draws 'can't be reached', retried every 30 seconds, what was typed kept"; the page drew `shell.unavailable.unreachable` ("Your team's Civicsmith can't be reached", `setup-words/rows.mjs:1426,1431`). "Could not read this, because ..." is for a refusal with a reason.

### 2. Why the module tests missed it
Nothing missed. 3. Failing-first test: none. 4. Platform: no.

### Requirement
interface-shell R35 states it.

---

## 18. 06 BROWSER.1, .2, .3, .5, .6, .7, .9, .11, .12, .13, .15, .16, .17 "controls with no accessible name" -- WALKER-ERROR; KNOWN diag2-10b C9; closes diag2-07 §12, none

### 1. Root cause with evidence
The detector (`06-read-cite.test.mjs:1390`) counts a visible control with empty `innerText`, `aria-label`, `title`, `labels`, `aria-labelledby` and `value`: the same detector as diag2-10b C9. I reproduced the counts on the same screens (Chromium, 1280 px): every unnamed control is inside a closed `<details>` (`closest("details:not([open])")` true) and has its label as `textContent`; Home: `release` "Vouch for photos", `promote` "Start the project"; Finder: `secondlook`; Add: `capturecredentialsupply` "Store this login"; Document (a PDF): `revisioncompare` "Compare these two", `contradictionflag`, `retire` (exactly the three the record counts, which closes diag2-07 §12 "NOT LOCATED"); Question: `conclude`, `search`, `checkrequest` and an `a.cs-ref` to the project; Project: `projectbarset`, `projectvisibilityset`. Closed content is not rendered, so `innerText` is empty. The Queue's 33 and Home's 25 are the same buttons many times over (KNOWN diag2-10b C9).

### 2. Why the module tests missed it / 3. Test / 4. Platform
No defect, no test. The walker's script skips controls inside a closed `<details>` or reads `textContent`.

### Requirement
interface-shell R13/R84 are met.

---

## 19. 06 BROWSER.11, .12, .13, .15, .16, .17, .18, .19 "targets under 44 px at 390" -- mixed

### 1. Root cause with evidence
Measured in Chromium at 390 px on the same screens (small world; classes counted):
(a) "Show me how" 112x24, 94x24: the wizard mark: KNOWN diag2-07 §10 (interface-shell phone rule).
(b) Checkbox and radio inputs 24x24 inside a label: WALKER-ERROR, KNOWN diag2-07 §11 (the label is 44 px: Home 2, Capture 2, Question 7, Project 3 measured with a label of at least 44 px). `cd-rcoords-0..3` (BROWSER.18) are the same class by their ids; not drawn here.
(c) `a.cs-ref` 22 px high (Home "hub page 62x22", "leaf a 36x22", Question and Project rows, the Finder's titles 188x22): DEFECT (MINOR), `interface-shell`. The phone block says `.cs-main a.cs-ref{min-height:44px;min-width:44px}` (`interface-shell/index.mjs:360`), but these anchors are `display: inline` (computed `display: inline`, `min-height: 44px`, height 22), where `min-height` has no effect. interface-shell R84/R108: "every control is at least 44 px to tap".
(d) The Finder's result-row pick boxes `finder-pick-<id>` are 24x24 with no label (`screens-daily/finder.mjs:175` `'<input type="checkbox" id="finder-pick-..." aria-label="...">'`): DEFECT (MINOR), `screens-daily`. The phone block gives `input.mk-pick{width:44px;height:44px}` (`index.mjs:362`) but this box has no `mk-pick` class (cs.rows' own box has it, `browser.mjs:902`); the generic rule makes it 24. These are 48 of the Finder's 96 (the other 48 are (c)).
(e) The Queue's "time added 67x20, time due 52x20, kind 26x20, <title> 314x18": UNKNOWN. In my queue (a few items) only one `a.cs-ref` was small; the sample's controls did not appear. Reproduction: in the walker's room rerun BROWSER.13 printing `outerHTML` and `display` of the first ten small targets.

### 2. Why the module tests missed it
`interface-shell/phone390.test.mjs` measures stand-in screens (cards, rows, checkboxes beside words), not a `cs.ref` in a row nor the Finder's rows.

### 3. Failing-first test
(c) `phone390.test.mjs`: a `cs.row` holding `cs.ref(...)` measured at 390 px is at least 44 px high (red: 22). (d) `bio-plane/test/m/screens-daily/finder.test.mjs`: the pick box carries `mk-pick` and measures 44x44 at 390 px (red: no class, 24).

### 4. Platform
No.

### Requirement
interface-shell R84 and R108 state the right behaviour; code only. Note (c) is an inline anchor in a row; an inline link inside running text stays exempt (the walker's own filter).

---

## 20. 06 BROWSER.5, BROWSER.15 "the word 'secret' on the Add screen" -- WORDS, UX-DESIGN

### 1. Root cause with evidence
The sentence is `setup-words/rows.mjs:10874` `["screen.capture.logins.about3", "The secret is sealed and never shown again, to you or to anyone.", "DEC-403: B458 1", null, false, "design"]`, a design row (the stored-login control, B458; `draft-T52-plan.md` T52-33). The retired word list is the brief's check 15 (group, secret, confidential, Signal, overdue, civic groups). The sitting's other retired-word reads were clean (OVERLAY.1). Nothing in the code is wrong.

### 2. Why the module tests missed it / 3. Failing-first test
`screens-intake` words check reads the design's rows; "secret" is not in a code-held list. If the word is retired for members, the test is a words check over the design rows for the brief's list.

### 4. Platform
No.

### Requirement
A wording question only: a design row. To UX-DESIGN: reword ("The password is stored sealed ...") or confirm "secret" is allowed for a stored login.

---

## Record defects with no BROKEN row

- **Record 9, NO_SOURCE and NOT_MONITORED carry no member sentence (OVERLAY.2, row WORKS):** the plane's answer has none, but the screen draws `refusal.<code>` first (interface-shell R13, `browser.mjs:338-352`); `refusal.NOT_MONITORED` exists ("This address isn't being watched, so there is nothing to check yet. Watch it first.", `rows.mjs:1334`). WALKER-ERROR for `NOT_MONITORED`. `refusal.NO_SOURCE` (`rows.mjs:7976`) is money's sentence ("A money figure must rest on exactly one source"), shown for `calculations`' table `NO_SOURCE` too: WORDS (UX-DESIGN), minor, only reachable once section 8 is fixed and the field is empty.
- **Record 13, OCR'd pages carry rect null (R45.13, row WORKS):** SPECIFIED. A pdf-page extent with `rect: null` means the whole page (reading-pipeline's unit comment, `reading-pipeline/index.mjs:~981`); the OCR reader names the page, not a region.
- **Record 15, `contradictionflag`, `attest`, `declareorigin`, `monitor`, `tabledeclare` absent from the `affordances` catalog (OVERLAY.4, row WORKS):** SPECIFIED / WALKER-ERROR. affordances R1: `ACTS` "holds exactly these object-directed acts"; `CAPTURE_ACTS` holds `attest` and `monitor`; the rung of every op comes from `op-grades` (`contradictionflag: "reasoned"` at `op-grades/index.mjs:444`, `attest: "attested"` at `:344`).
- **Record 16, `explore` takes only a full instant (R150.7, row WORKS):** SPECIFIED. explore R1: `NO_DATE`, `BAD_DATE` (`civil-time`'s refusal); a date alone is `civil-time`'s `BAD_DATE`.
