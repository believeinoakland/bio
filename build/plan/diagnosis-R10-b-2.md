**Part 2 of 2** (R12-R18); part 1 is `build/plan/diagnosis-R10-b-1.md` (the header, the summary table, the recipe note and R6-R11). Split verbatim by the placement worker; the text below is the study session's, unchanged.

## R12 · `.tsv` members of an archive are unread (C1)

### 1. Root cause with evidence

**`bio-plane/src/acquisition/index.mjs:154`: `const NAME_TEXT_TYPES = Object.freeze({ txt: "text/plain", md: "text/markdown", csv: "text/csv" })`, used by `textTypeOf` (`:155`-`:167`), which `fileDocument` (`bio-plane/src/acquisition/unpack.mjs:823`-`:828`) calls for a member whose bytes have no magic: `if (!ct && head && !multipart) ct = textTypeOf({ bytes: head, name: row.name })`. There is no `tsv` (nor `tab`) in the table, so a member `dir/m02.tsv` gets `ct = null`, is profiled `undetermined`, and the reading is the walker's "the document was not read as text (non-textual or too large), so no reading was attempted".**

- Red, in Node, the real function on tab-separated bytes: `textTypeOf({bytes, name:"dir/m02.tsv"})` → **`null`**; `"dir/m03.csv"` → `"text/csv"`; `"m1.txt"` → `"text/plain"`; `"dir/m04.tab"` → `null`. The same bytes with a declared type, as a browser gives a standalone file, `textTypeOf({bytes, type:"text/tab-separated-values", name:"solo.tsv"})` → `"text/tab-separated-values"`. That is the walker's finding exactly: "the same bytes uploaded alone as `solo.tsv` read `whole`, so the member path misses the tsv type that the door gives a standalone file".
- Downstream is already right: `csv-reader` reads `text/tab-separated-values` (`csv-reader/index.mjs:193`, its R21), and the walk's `.csv` members read as sheets.
- Requirement text as written: acquisition **R102**: "the type a `.txt`, `.md` or `.csv` name stands for (text/plain, text/markdown, text/csv)". The requirement itself omits `.tsv`; the brief for the walk (C1: "txt, csv, tsv") asks for it.

### 2. Why the tests missed it

`bio-plane/test/m/acquisition/fix5-t51.test.mjs:77`-`:90` tests the names the requirement lists (`k.csv`, `k.MD`, `knock-b.txt`) and controls (a NUL, invalid UTF-8, a declared PDF type). No test builds a `.tsv` (or `.tab`) member, and `acquisition`'s archive tests (`archive-entries.test.mjs`) use `.txt` members. The 30-member archive's three kinds (txt, tsv, csv) was only built by the walk.

### 3. Failing-first test

- **Module and file:** `acquisition`, `bio-plane/test/m/acquisition/fix5-t51.test.mjs` (the R102 test) plus `archive-entries.test.mjs` (a member through `fileDocument`).
- **Builds:** `makeZip([{name:"dir/m02.tsv", data: tab-separated bytes}, {name:"dir/m03.csv", ...}, {name:"dir/m01.txt", ...}])`, unpacked through the real `unpack` path (the same `acquisition` fixtures `archive-entries.test.mjs` already builds).
- **Asserts:** `textTypeOf({bytes, name:"x.tsv"})` is `"text/tab-separated-values"`; the unpacked member's `capture.content_type` is that, its profile is a tab-separated format, and through `reading-pipeline`'s `read` (the `fresh()` fixture) the member reads `whole` with the same cells as the standalone file of the same bytes; controls: a `.tsv` holding a NUL is null.
- **Seen red:** the first assertion, yes (`null`).

### 4. Platform check

None for the cause. After the fix: the walker's 30-member archive on the live copy, all 10 `.tsv` members `whole` with cells.

### 5. Owner

**`acquisition`.** Requirement for BOB: **R102** lists three names and so encodes the gap; a `.tsv` (and `.tab`, which `csv-reader`'s `DELIMITED_EXTENSIONS` already accepts, `csv-reader/index.mjs:1193`) is a table the product reads standalone; the requirement should say the name table is the one `csv-reader` states, so the two cannot drift.

---

## R13 · an archive's members listed on unrelated Document pages (D7b); absent from the project list and breadcrumb (E5)

R13 is **two observations with different causes**; (a) is explained and is not a defect of a screen's code, (b) I could not reproduce at the screen.

### R13a · members listed on documents that are not archives (D7b)

**What draws them (reproduced).** The Document page draws two choices that list **every information document the viewer can see**: "assert a connection to another document" (`bio-plane/src/screens-inquiry/document.mjs:1137`-`:1146`, `later("docs","list",{type:"information", limit:"500"})`, then `others.map(b => ({value: b.bundle_id, text: b.title}))`) and "this contradicts another document" (`:1059`-`:1062`, the same `list`). `build/requirements/screens-inquiry.md` R99: "the other document is chosen among the documents she can see". The test `bio-plane/test/m/screens-inquiry/fr28-document-acts.test.mjs:107`-`:114` (`DOCS`, a hand-built `list` answer) asserts exactly that the options are "only other documents". A member of an archive is an ordinary information document titled "`<path>`, from the archive `<sha>`" (`control-plane/archive.mjs:42`, word `file.archive.entry.title`), so it is an option on **every** Document page, the ODS's and the other ZIP's included, which is what D7b saw. Nothing in the page lists "the archive's members" as such, and the other Document pages the walker names would list them as well in the same choice (the walker saw them at the tail, the newest documents).
**Verdict:** not a wrong result of the screen; a **design matter** for BOB: whether those two choices, today a flat 500-document list of titles, should be narrowed to the document's project and paged (screens-inquiry R99/R127 are silent on scope). Not an R13 cause for a job.

### R13b · members absent from the project's list and from the breadcrumb (E5): NOT reproduced

- **What I reproduced (green).** The members are filed under the archive's project: `control-plane/archive.mjs:48`/`:49` writes `project: "<PROJ>"` into each member's `bundle.md` when `promoteArchive` is given a project (`:85`), and `promotion/index.mjs:147`-`:151` (`projectOf`) stores it. Run through the real record (the harness of `bio-plane/test/m/control-plane/archive.test.mjs:78`): with `project: "PROJ-2026-0001"` the archive's bundle and the member's (`INFO-2026-0002-archive-file`, "one.txt, from the archive cd74...") both answer `bundleInfo().project === "PROJ-2026-0001"`. E5 itself reads `project` = the walker's project on all three members in `op=heldcaptures`. So the project is carried to the record; G154 is as FIXED as E5 says.
- **What the screens read.** The project's documents list is `heldcaptures {project, state:"held_and_vouched", fields:"picker"}` read once on load and paged (`screens-inquiry/project.mjs:244`-`:258`), refreshed only by its own act `heldcaptures`; the `capture` layer's filter is `b.project = ? OR seen_in` (`capture/index.mjs:2027`-`:2028`), which the members satisfy. The breadcrumb's project is `doc.project` (`document.mjs:178`) read from the member's `bundle.md` by `front()` (`screens-inquiry/common.mjs:9`, a quoted value is JSON-read, so `project: "PROJ-..."` is read), then `later("project:"+project, "image", ...)`.
- **So both symptoms contradict the data and the reads I can follow**; I did not reproduce either at the draw. The candidates, in the order to test: (i) the project page was loaded before the unpack job made the members and shows its first read (E5 counts "5 documents after the unpack" without pressing the refresh act); (ii) the member's page read an `image` of the bundle from before the project line existed. **UNKNOWN, with the reproduction owed (K4428)**: on the live copy, in one sitting: `op=image&id=<member>` and look for `project:` in `bundle.md`; `op=heldcaptures&project=<E>&state=held_and_vouched` and count; then the Document page of that member and the project page after a hard reload. If the first two show the project and the page still omits it, the cause is in the draw (`document.mjs:178`/`project.mjs:253`) and is `screens-inquiry`'s; if `bundle.md` lacks the line, it is `acquisition`/`control-plane`'s (a member made when the unpack call carried no project: the path `control-plane/index.mjs:2450`-`:2459` reads it from `heldat`).
- **Why the tests missed it**: `archive.test.mjs` asserts the promote body carries `project:` in the md and, once, `bundleInfo`; no test draws a member's Document page or the project's list after an unpack (the screen tests script the answers by hand).

**Owner (R13 as a whole):** (a) none (BOB's design call); (b) `screens-inquiry`, pending the live reading above; no job should be opened for (b) before that reading (K4428).

---

## R14 · an encrypted DOCX and a `%PDF-` DOCM are shown "Clean" (C7)

### 1. Root cause with evidence

**`bio-plane/src/screens-intake/open-file.mjs:79`-`:83`: for a file the viewer added, `yours` (`kind === "high" && addedBy && reasons.some(code === "source_not_fetched")`) draws `screen.open-file.high.yours` and **suppresses the "Why: ..." line**: `(reasons.length && !yours ? ... screen.open-file.why ... : "")`. Every other reason of the grade (`encrypted`, `active:vba-project`, `format_unchecked`) is therefore never said to the member who added the file; the only other thing the page draws is the "Checks" list, which holds the scanner's note.**

- The grade itself is **right**. In-process, over the real `file-safety` (the `filedWorld` fixture of `bio-plane/test/m/file-safety/fixture.mjs`, a scanner that answers `clean` as the live ClamAV did), the walker's files: DOCX `{kind:"docx", encryptedMember:true}` → `threat: high`, reasons `["encrypted"]`, original not openable (`may_open: false`, `NOT_SCANNED`); `%PDF-1.4\n` + the macro DOCM → `high`, `["format_unchecked"]`, openable; the macro DOCM → `high`, `["active:vba-project"]`; a template → `low`. In all four the only verdict **note** is the scanner's `clean`. (file-safety R54 holds: an encrypted file is "graded high and never clean".)
- The screen draws what the walker saw. On the real served page (`bio-plane/test/m/screens-intake/page.mjs`, `open("/app/open-file/<sha>")` with scripted `threatof`/`verdictnotes`/`captureaccounts` answers carrying the member as the capture's actor): grade reasons `[source_not_fetched, encrypted]` → `says(high.yours)` true, the encrypted reason's words **not on the page**, the scanner's note "Clean" on it; the same for `[source_not_fetched, active:vba-project]`; and the control `[encrypted]` alone (a file the viewer did not add) **does** say the reason ("Why: ..."). On the live copy the walker's files were all "Added by you, not fetched" (the live grades carry `source_not_fetched` as well).
- The scanner's "Clean" is the scanner's true statement (it opens nothing inside an encrypted package and does not alert); it is the only check line until the deeper check is asked, because the structure check that writes the `encrypted` note runs only in `#startDeeper` (`file-safety/index.mjs:1820`-`:1826`). So the page tells a member who added an encrypted file: HIGH RISK, "Added by you, not fetched ... yours included", a clean scanner, and nothing about encryption.
- Which sentence is wrong: `screen.open-file.high.yours` ("Added by you, not fetched by your team's Civicsmith: every such file is high risk, yours included.", DEC-259) is true and incomplete. **The defect is the key chosen** (the module replaces the reasons line with it) and not the sentence; the reasons line (`screen.open-file.why`, "Why: {reasons}") exists and is simply not drawn.

### 2. Why the tests missed it

`bio-plane/test/m/screens-intake/open-file.test.mjs:235` (`MINE`) scripts `reasons: [{code:"source_not_fetched", ...}]` **alone**, so "yours" replaces nothing; `STATES.warned` has `active:macro` but for a file not added by the viewer. No test has a viewer-added file whose grade also holds another reason. `file-safety`'s tests assert the grade (`r54-encrypted.test.mjs` is green) and none asserts what the page says.

### 3. Failing-first test

- **Module and file:** `screens-intake`, `bio-plane/test/m/screens-intake/open-file.test.mjs` (beside R36).
- **Builds:** `mine({threatof: high with reasons [source_not_fetched, encrypted]})`, and `[source_not_fetched, active:vba-project]`, and `[source_not_fetched, format_unchecked]`, with the scanner note `clean`.
- **Asserts:** the page says `high.yours` **and** the other reason's translation (the line "Why: ..." lists the reasons other than `source_not_fetched`); for `encrypted` it also states that the scanner could not look inside (design to word it: a check line for the encrypted state); control: `[source_not_fetched]` alone draws no empty "Why:" line.
- **Seen red:** yes (above, `says the second reason: false`).

### 4. Platform check

The live reading to repeat after the fix: the walker's three files on the copy; `op=threatof` must list the same reasons the page now says (the grade is computed by the plane; only the draw changes).

### 5. Owner

**`screens-intake`.** Requirement for BOB: **R36** says the page "draws High risk with `screen.open-file.high.yours`, then `next.head` and `next.yours` ... its checks are said in words"; it is silent on any other reason of the grade for a file the viewer added, and the omission is what the page implements. For BOB (design): whether an encrypted file's check line should say "its inside could not be checked" beside the scanner's "Clean" (a word the design does not hold: `grep -i "encrypted"` in the word table's `screen.open-file.*` finds the reason words only).

---

## R15 · a 240 KB `<div` run makes the upload take 30-39 s (C8, X22)

### 1. Root cause with evidence

**`bio-plane/src/subresources.mjs:75`: `const TAG_RE = /<(\/?[a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g`, used by `scanHtml` (`:263`-`:300`, via `parseHtmlRefs` `:259` and `captureSubresources`) over the page the capture holds. For `<div<div<div...` (a run of tag starts and no `>`), each of the 60,000 `<` opens a match whose attribute group `[^>"']` also takes `<`, so every start reads to the end of the text before failing: n² steps.** This is not the profile (X22's regexes in `client-rendered.mjs` are linear now, R20); the profile of the same bytes takes 28-75 ms.

- Measured, Node, `parseHtmlRefs(text)` over `"<html><body>" + "<div".repeat(n)` with no closing tag: n = 10,000 (40 KB) **0.7 s**; 20,000 **3.0 s**; 40,000 **12.6 s**; **60,000 (240,012 B, the walker's size) 26.9 s**, each doubling costing four times. The same text closed by `</body></html>`: 6-26 ms; the `<div>` control: 6-17 ms. The live copy's `captureupload` ST was **30.5 s and 38.7 s** for the walker's 240 KB run.
- The call chain: `captureupload` → `acquire` (`acquisition/index.mjs:968`) → `walkSubresources` (`:1752`, `:2224`: any capture profiled HTML and under 8 MiB, "reads the primary back into memory to parse it") → `captureSubresources` → `scanHtml`. The upload therefore runs the web page's supporting-files walk over a file the member handed in, which finds no supporting file here. The same parse is called again on a continuation (`:2415`).
- Everything else on the upload path I timed over the same text is fast: `identify` + `doctypeFor` 28 + 33 ms, `profileOf` 75 ms, `titleOfBytes` 2 ms, the reading `read()` 86 ms (so the walker's "read `whole` (2 words)" and "upload 30 s" are both true).

### 2. Why the tests missed it

`bio-plane/test/m/subresources/subresources.test.mjs` builds small pages and asserts the references found; it has no input larger than a few KB and no time assertion; `build/requirements/subresources.md` states no bound on the parser's work (the 8 MiB bound is `acquisition`'s `SUB_PARSE_MAX`, a size, not work). `envelope-docs-T51-s2.md` X22 listed `client-rendered.mjs` and `staff-directory.mjs` and fixed those; this regex was not on the list.

### 3. Failing-first test

- **Module and file:** `subresources`, `bio-plane/test/m/subresources/subresources.test.mjs` (a `R? linear` test).
- **Builds:** `"<html><body>" + "<div".repeat(60000)` (and the 20,000 run, to assert the ratio), `"<a".repeat(80000)`, `"<img ".repeat(...)`.
- **Asserts:** `parseHtmlRefs` returns (`refs` `[]`) in under 1 s at 240 KB, and the time at 120 KB is under 3 times the time at 60 KB (linear, not quadratic); control: the references of a normal page are unchanged (the existing tests).
- **Seen red:** yes (26.9 s).

### 4. Platform check

The ST of `captureupload` for the same file on the live copy, after the fix, with the CPU time of the request on `Server-Timing` (workerd's regex engine is the same V8 irregexp; the quadratic is the pattern's, not the platform's).

### 5. Owner

**`subresources`.** Requirement for BOB: silent on work bounds (only sizes); a line "the parse is linear in the page's bytes" belongs beside R-parse. Also worth the job's first step: a search of the module's other regexes for the same shape (`[^>"']` classes inside a lazy group).

---


## R16 · a hidden pptx slide is held twice (C3)

### 1. Root cause with evidence

**The pptx entry lists a hidden slide in two lists, `slides[]` and `parts`, and the reading makes a unit of each.** `bio-plane/src/pptx.mjs:943` pushes every slide into `slides` (with `hidden` set from the slide's bytes, `:935`), and `:949` pushes the **same text again** for a hidden slide into the `body` part units: `if (hidden && walked.bodyText) units.body.push({ kind: "body", ref: at(null), part, text: walked.bodyText, hidden: true })`. `reading-pipeline/index.mjs:1006`-`:1028` (`allUnitsOf`) then turns `slides` into `slide-shape` units and `parts` into `doc-part` units, so the slide is two units. The slide's own `slide-shape` unit is built by the `arm(...)` call at `:1011` and **does not copy `hidden`**, so the unit that carries the mark is the duplicate and the original says nothing.

- Red, in-process, the walker's recipe family `{kind:"pptx", seed:"rw9-C-3p", size:{units:6}, parts:["notes","hidden"]}` through the real `pptxEntry.text()` and `read()`: 7 slides (slide 7 `hidden: true`) and parts `[body "slide 7" ppt/slides/slide7.xml hidden, speaker_note "slide 1"]`; the reading holds **9 units for 8 texts**: `slide-shape` slide 7 (`kind: body`, no `hidden`), `doc-part` `ppt/slides/slide7.xml` (`body`, `hidden`), and the notes once. That is the walker's count 2 on a search for the hidden slide's mark, and "nothing says the slide is hidden" on the slide-shape unit a hit lands on.
- The requirement as written asks for the pair: office-readers **R38** says `parts` carries "a hidden slide's text marked `hidden: true`" and that "`parts` adds, never replaces"; R11's lists (`slides`) are unchanged.

### 2. Why the tests missed it

`bio-plane/test/m/office-readers/parts-kinds.test.mjs` (R38) asserts each part of the deck is a unit with its kind, hidden slide included, from the entry's `parts`; it never reads through `reading-pipeline`'s `allUnitsOf` and counts units against texts. `reading-pipeline`'s units tests build `slides` and `parts` by hand and not from one deck.

### 3. Failing-first test

- **Module and file:** `office-readers` (the entry's contract) with the pipeline half in `reading-pipeline`: `bio-plane/test/m/office-readers/parts-kinds.test.mjs` plus `bio-plane/test/m/reading-pipeline/text-units.test.mjs`.
- **Builds:** `generate({kind:"pptx", seed:"rw9-C-3p", size:{units:6}, parts:["notes","hidden"]})`.
- **Asserts:** through `read()`: the reading holds exactly one unit carrying the hidden slide's mark; that unit is marked `hidden`; its kind is `body`; the deck's text count equals its unit count (8 texts, 8 units); the notes unit is once.
- **Seen red:** yes (9 units for 8 texts; the surviving slide-shape unit not marked).

### 4. Platform check

None. After the fix, on the live copy: `findin`/`search` for the hidden slide's mark counts 1 and the hit says hidden.

### 5. Owner

**`office-readers`** (R38 amended: a hidden slide's text is the slide's own unit marked `hidden`, and is not also a `part`). The pipeline's one-line follow (`allUnitsOf` copies `hidden` onto a `slide-shape` unit) is the same job's contract change and belongs to `reading-pipeline`'s job as a second small cause if BOB splits; K4427 says one owner per cause, so I place the **duplicate** with `office-readers` and name the missing mark as the cause the other module's job takes.

---

## R17 · the search hit and a cited leg carry no part kind (C3)

R17 is **two causes** with different owners.

### R17a · the Find-in hit carries no part kind

- **Root cause (file:line).** `bio-plane/src/retrieval-browse/findin.mjs:639`-`:640` (`#term`): `add({ kind: "term", words, capture_sha, extent, origin: FIND_ORIGIN, term })`. The rows come from the meaning statement with `rows: "passage"` (`:605`-`:612`), which **carry the unit's part kind** (retrieval **R95**: "`meaningRows`' `rows=passage` rows each carry `kind`"); the item is built from `r.snippet`/`u.text`/`r.extent` and **never from `r.kind`**, so the hit has `kind: "term"` (the result kind) and no part kind. The Find-in screen (`screens-daily/find-in.mjs:159`-`:163`) draws the extent (a page or paragraph number) and no kind word either.
- **Red** (the real `retrieval-browse` over a real SQLite store, the module's own `world` fixture, with a footnote unit written with its part kind `footnote` and a body unit): the term hit for the footnote has keys `kind, words, capture_sha, extent, origin, term, title, content_id, content_held, recorded`, `extent {"kind":"doc-part","part":"word/footnotes.xml","ref":"footnote 1"}`, and **no part kind** (the walker's `findin` items: "carry `extent` ... no kind word").
- **Why the tests missed it:** `bio-plane/test/m/retrieval-browse/fixture.mjs:221`-`:225` (`w.unit(...)`) inserts `capture_text` rows with **no `kind` column at all** ("as extraction's index writes it"): the fixture's schema (`EXTRACTION_SCHEMA`, `extraction/schema.mjs:283`-`:293`) has no `kind`, while the real index writes it (`extraction/index.mjs:1788`). No find-in test can see a kind. (I had to `ALTER TABLE capture_text ADD COLUMN kind` in my own repro to write one.) `search`'s R95 test is in `retrieval`, whose hits do carry it.
- **Failing-first test:** `retrieval-browse`, `bio-plane/test/m/retrieval-browse/findin.test.mjs` with the fixture's `unit()` taking a `kind`; builds a docx-like capture with a body unit and a footnote unit and a `term` find; asserts the footnote's item carries `part: "footnote"` (the name is the module's; `kind` is taken) and the body's `body`, and `null` for a unit stored without one. **Seen red:** yes.
- **Owner:** `retrieval-browse` for the item; then `screens-daily` for the word beside the passage (the words are the design's: there is a closed list of part kinds and no `screen.find-in.part.*` rows, so the **sentence is the design's** for UX-DESIGN, the **key chosen is the module's**).

### R17b · a cited footnote leg names no place (C3 citation)

- **Root cause.** `bio-plane/src/screens-inquiry/question.mjs:219`-`:223` (`whereOf`): the place a leg draws is a page (`pageOf`) else a paragraph (`paraOf`, "Paragraph n", `screen.question.leg.paragraph`); a leg whose extent is `{kind: "doc-part", part, ref}` has neither, so `whereOf` answers `""` and the leg is drawn as the quote and the document's name only. The leg itself is right: the walker read `extent_kind doc-part`, `extent_part word/footnotes.xml`, `extent_ref "footnote 1"`, i.e. the leg already holds the place's own human form (`ref`), which names the kind.
- **Why the tests missed it:** `screens-inquiry` tests script legs with `extent_page`/`extent_para` only (`question.mjs` handles those two).
- **Failing-first test:** `screens-inquiry`, a question page whose basis holds a leg with `extent_kind: "doc-part", extent_part: "word/footnotes.xml", extent_ref: "footnote 1"`; asserts the leg's line contains the ref ("footnote 1") the way a paragraph leg contains "Paragraph 23"; control: the page and paragraph legs unchanged. **Seen red:** by reading (`whereOf` has no arm for `extent_ref`); not rendered here.
- **Owner:** `screens-inquiry`; the sentence is the design's if a part leg should read "In the footnote" rather than the ref as written.

---

## R18 · links-only `<div>` dropped; `<td><p>` cells flat (C8)

R18 is **two observations**: (a) is the specified behaviour; (b) is a defect.

### R18a · a `<div>` of only links is dropped: by design

`bio-plane/src/reading-pipeline/html.mjs:344`-`:362` takes "a block of only links that is no list and holds none" as furniture; reading-pipeline **R51** ends: "a list, table or block holding one, of only links, is kept; **a bar of links is furniture**". The test pins it: `bio-plane/test/m/reading-pipeline/r10-html.test.mjs:58`: `<p>Body words here.</p><div><a href="/a">Facebook</a> <a href="/b">Twitter</a></div>` "a bar of links goes". I reproduced: a `<div>` of two anchors is dropped, and so is a `<p>` of anchors; the same two links as `<li>` items are kept (the walker's `<li><a>` list is kept). So the walker's STILL is a request to change R51, not a defect against it. **For BOB:** whether a bare `<div>` of links on a page with no navigation landmark is a "bar" (today: yes) is the design's; no job until R51 is amended.

### R18b · a `<td><p>` cell splits the row into flat paragraphs

- **Root cause.** `bio-plane/src/reading-pipeline/html.mjs:397`: in the text pass `if (D.block[nm]) { out.push("\n\n"); if (name === "tr" || name === "table") cells = 0; }` makes **every** block tag (including `p`, `div`, `li`) end a paragraph, with no regard to being inside a `td`/`th`; only `td`/`th` starts insert the tab (`:398`). A cell that holds its text in a `<p>` therefore breaks the row at each cell's `<p>`: one unit per cell. R51 says "a table keeps its rows and columns (a cell is not a paragraph)".
- **Red** (real `read()`, `fresh()` fixture): plain `<table><tr><th>Street</th><th>Cost</th><th>Date</th></tr><tr><td>Oak Ave</td><td>3400</td><td>2026-02-11</td>...` → rows `"Oak Ave\t3400\t2026-02-11"`; the generator's table `{kind:"html", table:{rows:6, cols:3}}` (`<td><p>text</p></td>`) → **22 units = 4 body + 18 cells**, each cell its own unit, no row (the walker's 22 = 4 + 18).
- **Why the tests missed it:** `r10-html.test.mjs:63` builds the table as `<td>r${r}c${c}</td>` (text direct in the cell) and the `<tr>` rows are asserted; no test puts a block inside a cell, which is what office-pasted and CMS tables do and what `docgen`'s table is.
- **Failing-first test:** `reading-pipeline`, `bio-plane/test/m/reading-pipeline/r10-html.test.mjs`: `visibleTextOfHtml` of `<table><tr><td><p>a</p></td><td><p>b</p></td></tr></table>` equals the row `"a\tb"` as one paragraph; a `<td>` holding two `<p>`s keeps the row (cell text joined by a space or break inside the cell); the 500 x 20 table with `<p>` in each cell reads as 500 rows. **Seen red:** yes.
- **Owner:** `reading-pipeline`. Requirement: R51 states the rule ("a cell is not a paragraph") but the closing sentence ("a table row is one paragraph, its cells told apart by a tab") is silent on a block inside a cell.
