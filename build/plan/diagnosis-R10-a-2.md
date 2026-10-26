> Part 2 of 2 (G7, R35-R39); part 1 (R1-R5, with the summary and how the evidence was made) is `diagnosis-R10-a-1.md`.
# G7. Statements on screens (MINOR)

## R35. The grade panel: "WHY UNDETERMINED, BECAUSE ?" and no note of an unread image type

**Walker:** A13 (PNG 1 MiB + 1 and 3 MB, BMP), N7. Two faults in one row; they have different owners, so they are R35a and R35b.

### R35a. The heading

#### 1. Root cause with evidence

`screens-inquiry/document.mjs:371-373`:
```
out.push(cs.sec("screen.document.gradenote.head", ...,
  { fills: { letter: letter || T("state.undetermined", { reason: "" }) } }));
```
`screen.document.gradenote.head` is "Why {letter}?" (rows.mjs:2278). `letter` is the grade `A`-`D` from `capturegrade`; for a copy whose grade is not determined it is `""` and the module fills `{letter}` with `state.undetermined` = "Undetermined, because {reason}" ("the reason always follows", rows.mjs:80) and an empty reason. The drawn heading is "Why Undetermined, because ?" (run here with the walker's recipe: the 1 MiB + 1 PNG `size:{bytes:1048577}`, the "Read the grade note" act pressed; the heading drew exactly that, then "No grade note: this copy was handed to the team rather than fetched from its source."). The real plane's `capturegrade` for every copy handed in by upload answers `grade:null, determined:false, basis:"CAPTURE_RECEIVED_NOT_FETCHED", ceiling:"B"`, so the heading is wrong for every uploaded copy not yet graded, not only images.

#### 2. Why the tests missed it

The one test of the panel, `screens-inquiry/document.test.mjs:158`, presses "Read the grade note" on a scripted `capturegrade` answer that carries the letter `B`; no test draws the panel for a copy whose grade is not determined (searched the module's tests for `gradenote`).

#### 3. Failing-first test

**screens-inquiry**, `r10-stated.test.mjs`: the PNG `size:{bytes:1048577}` through the real plane, "Read the grade note" pressed; asserts the heading contains none of "because" or a bare "?" and is the word held for an ungraded copy (`hasWord`-guarded). **Seen red:** yes.

#### 4. Platform check

None.

#### 5. Owner and words

**Owner: screens-inquiry.** Words: the key chosen is wrong (the module composes a clause key, `state.undetermined`, into a noun slot); the sentence itself is also the design's gap: "Why {letter}?" has no form for "not graded". UX-DESIGN supplies `screen.document.gradenote.head.ungraded` ("Why is this copy not graded?" or as the design words it).

### R35b. No note that an image type is not read

#### 1. Root cause with evidence

The product states it; no screen draws it, and the brief looked in the wrong answer.

- `file-safety` R56: "a TIFF, HEIC or BMP is stated as an unread image type ... the structure check of an image answers `not_examined` and never `clean`." The structure check (`file-safety/index.mjs:1790-1799`) returns `not_examined`/`UNREAD_IMAGE_TYPE:<kind>` but only **inside a deeper check** (`#startDeeper`, `:1822`), which needs an outside scan or sandbox tool switched on; with none the request is refused `NO_OUTSIDE_TOOL` (`:1775`). Its result sits in `fs_deeper.checks`, not in `verdictnotes` (only an `encrypted` structure result writes a note, `:1823-1826`).
- The member-facing answer that does state it is `threatof`: run here, a BMP's `threatof` answers `format:"image"`, `image:{type:"bmp", read:false}`, `threat:"high"` (reason `source_not_fetched`); a PNG's answers `image:{type:"png", read:true}`. `verdictnotes` is `notes: []` for both until a note is written.
- Neither the Document page nor `screens-intake/open-file.mjs` reads `threatof.image` (searched both for `.image`, `image.read`): the Open-file screen draws "HIGH RISK ... Added by you, not fetched" and "Built-in scanner: Clean" (ClamAV's verdict on the bytes), which is what the walker saw.

So A13's "there is NO structure note" is true of `verdictnotes`, which the brief named (`graded by source, TIFF/BMP 'unread image type', never clean for a structure it did not open`), but `verdictnotes` is not where R56 puts it. The requirement is met at the answer (`threatof.image`) and unmet at any screen.

#### 2. Why the tests missed it

`file-safety` tests the structure check and `threatOf` (R56, SCAN A16, D13, F1-F8) at the answer. No screen requirement asks the Document page or Open-file to say it, so no screen test does.

#### 3. Failing-first test

**screens-intake**, `r10-open-file.test.mjs`: a BMP `generate({kind:"bmp", seed:"rw9-A-13", size:{lines:3}})` through the real plane, `/app/open-file/<sha>` booted over the real door. Asserts: the screen names the type as one the product does not read (by a new key), and does not let "Built-in scanner: Clean" stand for the structure. **Seen red:** the absence is shown (`threatof.image.read === false`; no screen reads it). Not a drawn-wrong sentence, so there is no screenshot to compare.

#### 4. Platform check

The ClamAV scanner is a container (`file-scanner`): the "Clean" line on live is its verdict; Miniflare answers `SCANNER_ABSENT`. On biosmoke8: the BMP's Open-file screen after the fix.

#### 5. Owner and words

**Owner: screens-intake** (`open-file.mjs`). **For BOB (requirement silent):** neither `screens-intake` nor `screens-inquiry` has a requirement that a screen states `threatof.image.read === false`. Decide whether Open-file (where a member decides to open it) or the Document page, or both, say it; recommendation: Open-file (the decision to open), one sentence. Words: no key; UX-DESIGN supplies it.

---

## R36. A stray type word ("gif", "tiff") on the upload line

**Walker:** A7, N6. For a GIF or TIFF uploaded without a project the line reads "A photographed page, not read yet: its words can't be found or cited until the assistant reads it or a member types them. gif".

### 1. Root cause with evidence

`screens-intake/capture.mjs:1239-1240`:
```
if (reason === "UNSUPPORTED_FORMAT")
  return keyedW("screen.capture.read.refused.UNSUPPORTED_FORMAT", { kind }, () => `${cs.w("capture.picture.unread")}${f.kind ? ` <span class="mk-data">${cs.esc(String(f.kind))}</span>` : ""}`);
```
The key `screen.capture.read.refused.UNSUPPORTED_FORMAT` has no row (searched `rows.mjs`), so the stand-in is drawn: `capture.picture.unread` ("A photographed page, not read yet: its words can't be found or cited until the assistant reads it or a member types them.") plus the raw kind. That sentence is the line for a picture with **no reading yet**; for a GIF whose reading says `UNSUPPORTED_FORMAT` it promises a reading that is refused ("GIF is not read yet" on the Document page) and ends in a bare word. Run here: the reading object the real plane stores for a GIF (`{failure:"final", reason:"UNSUPPORTED_FORMAT", kind:"gif", basis:"GIF is not read yet."}`) as the upload answer's `reading`, the Add file tab pressed (the one hand-routed step: the object is the real plane's, put in the scripted upload answer because the in-process plane answers a GIF's first reading inline as "not read as text"): the line was exactly the walker's, for `gif` and for `tiff`.

Separately, in this in-process run the plane's **inline** first reading of a GIF/TIFF in the `captureupload` answer was "the document was not read as text (non-textual or too large), so no reading was attempted" while the **stored** reading (`op=reading`, after `readheld`) says `UNSUPPORTED_FORMAT gif`. The inline pass is the `acquireReadingOp`/`extractread` one; the live copy's inline answer carried the right reason (the walker's line has "gif"), so the two differ between Miniflare and the live copy and I did not establish why. It does not change the owner: the Add screen must not draw a stand-in that promises a reading.

### 2. Why the tests missed it

`screens-intake/r9-states.test.mjs:97-115` ("R64 each refusal is its own sentence") loops over five reasons and asserts `line.textContent.includes(c[k])` for `kind`, `part` and `name`: it asserts the raw kind **is** drawn, and that "five causes, five sentences" differ, which they do.

### 3. Failing-first test

**screens-intake**, `r10-refused-kind.test.mjs` in the module's `page.mjs` harness: the upload answer carries the reading the real plane stores for a GIF and for a TIFF (taken from the plane in the same test, `generate({kind:"gif"|"tiff", seed:"rw9-A-7", size:{lines:3}})`, so the object is not typed by the test). Asserts: the line is the sentence for "{kind} is not read yet" (`reading-pipeline.index.unsupported_gif`/`_tiff`, held) and does not include `capture.picture.unread`'s words nor a `.mk-data` span holding the bare kind. **Seen red:** yes.

### 4. Platform check

None for the sentence; the live/Miniflare difference in the inline reading is noted above and is for whoever fixes R5.

### 5. Owner and words

**Owner: screens-intake.** Words: the key chosen is the module's (`capture.picture.unread` is for "no reading yet"); the right words are already held for every unread type: `reading-pipeline.index.unsupported_gif`, `_tiff`, `_bmp`, `_webp`, `_heic`, `_avif`, `_jp2`, `_ico`, `_unsupported_kind` (which the Document page already draws). `screen.capture.read.refused.UNSUPPORTED_FORMAT` is owed to `later-ux.md` (K4269) and can stay owed.

---

## R37. The assumed encoding is not drawn

**Walker:** B4b (CSV as windows-1252), C8 (windows-1252 and UTF-16 text/HTML).

### 1. Root cause with evidence

The reading states it and no screen draws it, and no screen requirement asks it to.

- `reading-pipeline/index.mjs:2767` `encodingFacts` puts `encoding` and `encoding_assumed` on the reading; run here: a Latin-1 text uploaded as `cp.txt` reads `encoding: "windows-1252"`, `encoding_assumed: true`.
- `reading-pipeline` R49: "The reading states the encoding (`encoding` and whether it was `assumed`, **which the document's page shows**)". The only requirement that says the page shows it is in the **other** module's file.
- `screens-inquiry/document.mjs` contains no `encoding` (searched) and `screens-inquiry` has no requirement for it; the word table has no row for "read as windows-1252 because the file did not say" (searched `rows.mjs`). Run here: the page for that text mentions no encoding, "assumed" or "windows" (checked by regex over the whole page).

### 2. Why the tests missed it

`reading-pipeline` tests assert `encoding`/`assumed` on the reading (R49). `screens-inquiry`'s tests cannot test a requirement it does not hold.

### 3. Failing-first test

**screens-inquiry**, `r10-stated.test.mjs`: `Buffer.from("Z\xfcrich caf\xe9 ...".repeat(30), "latin1")` uploaded as `cp.txt`/`text/plain` (the walker's recipe is the corpus text with `encoding:"windows-1252"`); asserts the page draws the sentence for an assumed encoding with the encoding's name (key `hasWord`-guarded until the row lands), and that a UTF-8 file with a BOM or a declared charset draws none. **Seen red:** yes (the page draws nothing).

### 4. Platform check

None.

### 5. Owner and words

**Owner: screens-inquiry.** **For BOB (requirement placed in the wrong module):** move the half of `reading-pipeline` R49 that says "which the document's page shows" into a `screens-inquiry` requirement ("a reading that assumed its encoding says so on the Document page, with the encoding's name"). Words: no key; the defect is the design's (UX-DESIGN supplies the sentence); the module's part is to draw it.

---

## R38. The first-load sentence and "N pictures kept, not read" are not drawn

**Walker:** C10 (acadia's visitor view), C11 (253 supporting files).

### 1. Root cause with evidence

Two facts the plane keeps and the Document page never reads; neither has a screen requirement or a word.

- **First load.** `render.mjs:436` defines `RENDER_COPY_STATEMENT` ("this is a copy of the page's first load: it was not scrolled, banners and dialogs were not dismissed, and frames and shadow content are not in it, so what a visitor sees beyond the first load is not claimed"), and `render.mjs:578` pushes it into the rendered document's `undetermined` list, which lands in the provenance (the walker found it there). `capture-sources` states only that it is exported (`capture-sources.md:178`). `document.mjs` reads no `undetermined` list of the document's capture facts.
- **Pictures kept, not read.** `acquisition/index.mjs:2192` puts `pictures_unread: {count, bytes}` into `supporting`. `acquisition` R119: "so the document says 'N pictures kept, not read'". `document.mjs:342-366` reads `kept`, `skipped`, `total`, `reasons`, `not_walked` of `supporting` and draws "N of M supporting files kept" and the reasons; it never reads `pictures_unread` (searched `screens-inquiry` and `screens-intake`: 0 hits). No row holds the sentence (searched `rows.mjs`).

Both are by code read plus the walker's record (C10, C11): a rendered capture and a 253-file page need the renderer and the live proxy, which are not run in-process. A related observation is not part of R38: 164 of the 253 supporting files "couldn't be fetched" (65 %); that is `capture-sources`' budget (G5/G6 side), not a sentence.

### 2. Why the tests missed it

The acquisition tests assert `pictures_unread` on the answer (R119's test); `screens-inquiry`'s `r9-supporting.test.mjs` asserts the "N of M kept" lines on a scripted `supporting`. Nothing connects the two, because no `screens-inquiry` requirement says the page draws them.

### 3. Failing-first test

**screens-inquiry**, `r10-supporting.test.mjs` in the pattern of `r9-supporting.test.mjs` (the document's `data/provenance.json` carrying a `supporting` made by acquisition's own builder (`acquisition/index.mjs:2160-2192`, called with 40 pictures) and, for the first-load case, a document whose provenance `undetermined` holds `RENDER_COPY_STATEMENT` imported from `render.mjs`): the page includes the sentence for N pictures with the size; includes the first-load statement; a page with no pictures and a plain capture draw neither. **Seen red:** not run (it needs a supporting file builder); the absence is read from code and from C10/C11.

### 4. Platform check

The live copy: C10's acadia capture (renderer, 12 s) and C11's page. After the fix, one capture of the walker's page on biosmoke8 with the Document page of both documents.

### 5. Owner and words

**Owner: screens-inquiry.** **For BOB (requirement silent):** `acquisition` R119 says "the document says"; `capture-sources` says the statement exists; no `screens-inquiry` requirement says the page draws either. Add both to `screens-inquiry`. Words: no row for either sentence; the defect is the design's (UX-DESIGN supplies "{n} pictures kept, not read ({size})" and the first-load sentence in a member's words). The code-origin row `capture-sources.render.copy_first_load_not_scrolled` is the plane's English and is not a design row.

---

## R39. `/version` carries no bounds; the migrations' counts are on no read-only answer

**Walker:** D5, D6. Both are checks the brief wrote against the wrong answers; each leaves a real question for BOB.

### 1. Root cause with evidence

**Bounds (D5).**
- The plane's `GET /version` is a plain text version string by design (`control-plane/index.mjs:968-970`: "Which version is this? A plain GET, no token ... "). No requirement says the plane's `/version` carries bounds.
- The requirement is the scanner's: `file-scanner` R8 `GET /version` answers `{... renderer_version, bounds}` and R16 lists the limits `bounds` carries. It is met in the scanner (`file-scanner/src/handler.mjs:28`, `bounds: BOUNDS`; `limits.mjs`; asserted in `file-scanner/test/worker.test.mjs`). The scanner is reachable only through the service binding.
- The only plane op that relays that answer is `scanstatus` (`file-safety/index.mjs:1421-1445`, admin): it passes `version`, `clamav_version`, `signatures`, `renderer_version`, and **not `bounds`**. So the scanner's and the renderer's limits are published and cannot be read by anyone outside the binding, including a walker.
- `cpu_ms` (D5's other half) is FIXED (`plane` R99).

**Counts (D6).**
- `extraction` `migrateRepairs`/`migrateReadings` (R105) return counts (`examined`, `registered`, `existed`, `shapes: {first_range, cut_units, pages_unread, stated_bare}`); the provenance repair (`provenance` R79, `repairParts`) answers "the rows moved and the rows left".
- The wake runs them and **discards the answers**: `extraction/index.mjs:2408-2411` `await drain(() => this.migrateRepairs()).catch(() => null)` keeps only `done`/`examined` to decide when to stop. No op answers them (searched: `migrateRepairs`/`migrateReadings`/`repairParts` are called nowhere but these wake paths). `op=selftest` and `owedwork` carry the register and text counts, as the walker found. `extraction` R105 says the migration is "counted", and "BOB schedules the live run"; neither says where a count is read.

### 2. Why the tests missed it

`file-scanner/test/worker.test.mjs` asserts `/version` carries `bounds` at the scanner. The extraction and provenance tests assert the counts on the function's own answer. No test asks the question the walker asked ("can I read it from outside").

### 3. Failing-first test

Only if BOB rules the figures must be readable from outside:
- **file-safety**, `test/m/file-safety/r10-scanstatus-bounds.test.mjs`: the module's scanner stub answers `/version` with `bounds` (the real `BOUNDS` imported from `file-scanner/src/limits.mjs`); `scanStatus({viewer: admin})` answers `scanner.bounds` and `renderer.bounds` equal to it. **Seen red:** by code read (the answer is built without `bounds` at `:1433-1436`); not run.
- **extraction**, `test/m/extraction/r10-migration-counts.test.mjs`: after the wake's migration run, a read-only answer (`selftest`'s block) holds the counts per migration; the run's answers are kept in the `reading_migrations` row (R66), not discarded. **Seen red:** by code read.

### 4. Platform check

The scanner is a container worker with a service binding: the check is `GET /version` on the bound scanner on biosmoke8 (read with an administrator's `scanstatus` once relayed). Miniflare cannot run the container image.

### 5. Owner and words

**Owners: file-safety** (relay `bounds` in `scanstatus`) and **extraction** (keep the counts); two owners because two modules hold two figures. Words: none; these are administrator figures. **For BOB (decision, small):** must a walker or an administrator be able to read the scanner's limits and the migrations' counts without the Cloudflare console? Recommendation: yes, because both walks (D5, D6) were written to check them and could not; the cheapest shape is `scanstatus.bounds` and a `migrations` block in `selftest`. If no, the brief's D5/D6 rows are corrected to say these are read in the code and the scanner's own tests.

---

# Appendix: the repro helper

Kept outside the repository (scratchpad `diag/`), printed here so a job can rebuild it. Run from `bio-plane/`: `node --import ./test/platform-sqlite.mjs <script>`. Each case is `probe(label, bytes, name, type)`: upload by the real `captureupload`, promote by the screen's `promoteDocument`, wait for `op=reading` to settle, print the reading's fields and the Document page's text.

```js
// the plane + the real OCR member, as screens-inquiry/r9-refusal.test.mjs boots them
const mf = new Miniflare({ workers: [{ name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }], compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"], serviceBindings: { OCR_WORKER: "ocr-worker" },
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "...", PROBE_TOKEN: "...", VERSION: "4.6.0", INSTANCE_NAME: "diag-town",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" } }, ocrWorkerDef()] });
// claim + login as the founder, then:
const u = await upload(bytes, name, type);                       // /api/?op=captureupload&statement=diag&name=..&type=..
const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: u.document, title: name, locator: u.document.locator, project: "" });
const page = await boot({ screens: SCREENS, plane: forwarded, path: "/app/document/" + filed.bundleId });   // forwarded = every OPS op to the real door
// wait for [data-text-state], read main(page).textContent; ops: reading, readheld, heldcaptures, capturegrade, threatof
```

The generator recipes used (all from `bio-plane/test/`): `imggen` `{kind:"png"|"gif"|"tiff"|"bmp", seed, size:{lines:3}}`, `degrade:{turn:90}`, `size:{bytes:1048577}`; `pdfgen` `{kind:"pdf", seed, size:{pages:5}, encryption:{method:"aes", user:"walkpw"}}`, `truncate:0.7`, `size:{bytes:25165825}`; `sheetgen` `{kind:"ods", size:{rows:45000, cols:6}}`, `{kind:"csv", size:{rows:1048576, cols:1}}`; `makeZip([{name:"m1.txt", data}, ...])`; a hand-zipped DOCX (`[Content_Types].xml`, `_rels/.rels`, `word/document.xml` with 300,000 `<w:p><w:r><w:t>a</w:t></w:r></w:p>`); text bytes as `y.doc`.

One shape the helper does not cover: the Add screen (R5, R36) was driven with `fill(p, {"ci-file": new File([bytes], name, {type})})` and `press(p, "captureupload")`, then `p.clock.tick(21000)` between real waits so `watchReading` runs on the page's fake clock.
