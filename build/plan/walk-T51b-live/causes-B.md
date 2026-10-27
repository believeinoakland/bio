# Causes of walk B's findings (area B: finding documents and capturing content), 0.87.0 on `tranche/T51b` (1807adf9929)

Method: every cause below was read in the source on `tranche/T51b` (worktree `walk/T51b-causes-B`); where the live copy (biosmoke8, `/version` 0.87.0) could confirm it I made read-only GET calls through the proxy as the member or the administrator (sign-in screen, no value printed): `heldcaptures`, `sourceof`, `safeview`, `threatof`, `scanstatus`, `search`, `namedrequests`, `heldat`, `meaningrows`, all reads (a refused `safeview` and a refused `heldat` write nothing). No test suite was run. No record was written. Walker ids are `LB-n` from `B.md`.

Counts: 21 causes (B-K1 to B-K21). DESIGN: 4 (B-K6, B-K10, B-K13, B-K14). UNKNOWN: 3 (B-K4, B-K20, B-K21). Two are boundary questions for BOB (K4164): B-K1 (two filers, one entry rule) and B-K3 (screen, shell, file-safety).

The finding that changes the walk: **LB-14 is not a wording MINOR; it is the end of journey (f) failing (B-K1, BLOCKER).** A pulled knock can never be vouched for.

---

## B-K1 BLOCKER: a pulled knock, an unpacked archive member and a testimony are filed without `data/dataset.json`, so `release` refuses them `ENTRY_REQUIREMENTS`: none can be vouched for

- **Owning module:** `store-door`. `bio-plane/src/store-door/pull.mjs:37-78` (`filing`): the files it promotes are `bundle.md`, `data/provenance.json` and the blob at `doc.file` (`:62-64`), and the front matter writes `content_hash: sha256:${cap.sha256}` (`:51`), the hash of the file, not of a dataset. Two more filers with the same omission: `control-plane`, `bio-plane/src/control-plane/archive.mjs:63-65` (`bundle.md`, `data/provenance.json`, blobs; no dataset), and `provenance`, `bio-plane/src/provenance/index.mjs:2010-2018` (the testimony: `bundle.md`, `data/provenance.json`, `snapshots/observation-<sha>.txt`; no dataset). Boundary (K4164): the entry rule is `ratification`'s (`bio-plane/src/ratification/release.mjs:195-201`: "well-formed content_hash", "data/dataset.json", "a file in snapshots/", and a provenance chain); the two filers are in two modules; the screen that built the same bundle correctly is `screens-intake` (`capture.mjs:141-189`, which writes `data/dataset.json` with `content_hash` = the canonical dataset's hash "so that `release` is not refused ENTRY_REQUIREMENTS (R23)"). One cause, three sites, one rule: BOB places it as one entry in each of `store-door`, `control-plane` and `provenance`, or asks for a shared "file a bundle that can be released" helper.
- **Findings explained:** LB-14 (Held captures: "Refused", "Open it to vouch for it by itself", file name lost), the dead-end line "A pulled knock in Held captures carries the word 'Refused'", and journey (f) "From a knock to the record", whose last step (vouch) the walker never pressed. Also the testimony step of (b) (no LB id; the walker's row 'What I saw or heard ... OK'): the member's "What I saw or heard" records say "It waits in Held captures like any capture" and cannot be vouched either (see the evidence).
- **Severity:** BLOCKER (journey (f) cannot complete: knock, pull, vouch; and a testimony, journey (b)'s third capture step, is never vouched; the walker's MINOR rested on reading the mark as wording).
- **Evidence, live (member, `op=heldcaptures&limit=200&state=held`, full fields):** 105 held rows: 94 `eligible: true`; 11 `eligible: false, class: "ENTRY_REQUIREMENTS"`. The 11 are, by id: 4 pulled knocks (`INFO-2026-0185-doorbell-knock`, `-0186`, `-0240`, `-0243`; the last two are the walker's of today, `knock:KNOCK-2026-10-27-66ca56e2` and `...-83158184`), 3 unpacked archive members (`INFO-2026-0144/0145/0146-archive-file`) and 4 testimonies (`INFO-2026-0201`, `-0202`, `-0254`, `-0255` `-observation`); the other 94 (uploads and address captures, the screen path that writes the dataset) are all eligible. The row's reason: "verified state has entry requirements: a well-formed content_hash, data/dataset.json, and at least one file in snapshots/ (C-2.7), and a provenance_chain naming the route for every document in the register (C-18.9). Releasing these as they stand would mint records the catalog immediately rejects." The "Refused" mark is therefore true, not a wording defect: `held.mjs:58-65` draws `mark.gap.refused` for `eligible === false` and the sentence "Open it to vouch for it by itself" (`screen.held.ineligible.alone`), which promises a way on that does not exist. The Document page's vouch is not a separate path: `document.mjs:1703-1720` calls `release` with a one-member selection, and `release.mjs:87-110` examines every member with the same `examineMember`.
- **Not proven by me:** that the single vouch is refused. What would prove it: press "Vouch for this copy" (acknowledgment and mitigation filled) on `INFO-2026-0185-doorbell-knock` and read the refusal `ENTRY_REQUIREMENTS` with offenders (a refused release writes nothing, release.mjs:107 "every member examined before any document changes"); I did not press it (an act on the copy).
- **Why tests missed it:** `bio-plane/test/m/store-door/pull.test.mjs` tests the filing and the promotion (a bundle at `collected`) and never calls `release`/`examineMember` on the result; no test in `test/m/control-plane/inbox-door.test.mjs` or `doorbell.test.mjs` releases a pulled bundle; `test/m/screens-intake/inbox.test.mjs` scripts `inboxpull`'s answer. `journey-check/journeys.mjs` has no step that pulls a knock and vouches it (nor one that vouches a testimony or an archive member) (`grep inboxpull` finds nothing). The two filers that do pass (`capture.mjs`) have their own R23 test.
- **Walker's exact case:** as a member, doorbell as a knocker with a PDF (3.3 kB); as the member open Inbox, "Move into the record"; open Held captures, find "Material handed in at the doorbell on 27 October 2026"; open it; "Vouch for this copy" with an acknowledgment and what you checked. Expected: "Vouched for by ...". Observed (by the plane): `eligible: false`, `ENTRY_REQUIREMENTS`.

## B-K2 MAJOR: "Which person" lists `Dana Reyes, [object Object]`

- **Owning module:** `screens-intake`. `bio-plane/src/screens-intake/about-knocker.mjs:98`: `text: plain(String(p.name || p.entity) + (p.today ? ", " + p.today : ""))`.
- **Findings:** LB-2 (all four pairs, source page).
- **Severity:** MAJOR.
- **Cause, proven in code:** `peopledirectory` rows carry `today` as an object, never a string: `bio-plane/src/people/index.mjs:1351` returns `today: { posts }` for a person (and `:1335` `today: { kind, sector, note, note_by, machine, holders? }` for any other kind). An object is truthy, so the template appends `", " + {…}` = `", [object Object]"` for every row. `screens-investigate/people.mjs:70-87,116,143` read `r.today` as an object (`r.today.posts`), which is how the shape is meant to be used.
- **Why tests missed it:** `test/m/screens-intake/t51-about-knocker.test.mjs:110-125` creates a person with `entitycreate` through the real plane and asserts the body sent by `sourcepersonlink`, never the text of the option; no test reads the "Which person" option text.
- **Walker's exact case:** member, `/app/about-knocker/<fingerprint>` of a pulled knock, section "Say who this is": options "Dana Reyes, [object Object]", "Miguel Alvarez, [object Object]".
- Expected fix shape (for the job): draw the person's posts (office, body) or nothing after the name.

## B-K3 MAJOR: the safe view of a Word file, a PowerPoint or a scanned PDF says "open below" and draws nothing; the result is a file download the screen never mentions

- **Owning module:** `screens-intake`. `bio-plane/src/screens-intake/open-file.mjs:235` (`cs.set("safe", { kind: "pdf" })` after `cs.download`, `:207`) and `:79` (`safeDrawn` draws only the sentence `screen.open-file.safe.ready` and a page count for a pdf answer). Boundary (K4164): `interface-shell` `browser.mjs:596-612` (`cs.download` can only `saveFile(blob)`; the shell has no way to show a byte answer in the page), `file-safety` (the owner answers a PDF, `op=safeview`), and the requirement `screens-intake` R5 ("The safe view is drawn from `op=safeview`'s pages, marked `mark.origin.machine`...").
- **Findings:** LB-3 (and the dead-end line "the press shows nothing; ... the act's result is nowhere to be seen").
- **Severity:** MAJOR.
- **Cause, proven in code:** the words promise "The safe view is open below: each page as a picture, so nothing in it can run." (`rows.mjs:2485`, `screen.open-file.safe.ready`); the code path for a PDF answer sets `{kind:"pdf"}` whose drawing is that sentence only. Nothing in `safeDrawn` (`open-file.mjs:56-81`) emits an `<img>`, `<iframe>`, `<embed>` or link for it. The spreadsheet (`kind: "data"`) and text (`kind: "text"`) branches do draw their content, which is why those pass.
- **Why tests missed it:** `test/m/screens-intake/open-file.test.mjs:282` asserts only `says(q, "screen.open-file.safe.ready")`, the sentence, for the PDF answer; a test that looked at what is on the page below it would have failed. The renderer itself is tested at `file-safety`/`file-scanner`, not through the screen.
- **Walker's exact case:** Opening a file (`/app/open-file/<sha>`) for a DOCX / PPTX / scanned PDF, "Show the safe view on this page", member or administrator, 1280 and 390: sentence appears, a 73 618 B / 204 579 B / 151 571 B PDF is downloaded, nothing under the sentence.
- **For BOB:** the fix needs a decision on where pages are drawn (page images from the owner, or the shell showing the PDF inline); it spans the three modules above.

## B-K4 MAJOR, UNKNOWN: F-B14 still fails for the alpha walker's Word file; today's Word file renders

- **Owning module (probable, not proven):** `file-safety` (R59 retry) with `file-scanner` (renderer image). `bio-plane/src/file-safety/index.mjs:1136-1159` (`#renderFinal`, `#requeueForRelease`) and `:1229-1236` (`renderBatch` reads the renderer's release and requeues failed files of another release only).
- **Findings:** LB-4 / re-walk row F-B14 (`docx-8d42d898652f5a8b1020d342.docx`, INFO-2026-0192, member and administrator 1280).
- **Severity:** MAJOR (a member's older Word file stays unviewable; the page says "Civicsmith cannot make a safe view of this kind of file", which is false for Word files).
- **What I established, live (administrator):** capture sha `9dce360ad13b0...2e93e` (the file's `source_locator`): `op=safeview` answers `SAFE_VIEW_FAILED`, `renderer_reason: "NOT_RENDERABLE"`, `renderer_detail: "Warning: failed to launch javaldx - java may not function correctly\nError: source file could not be loaded"`, and `threatof.safe_view = {state:"failed", route:"office"}`. The detail is now present (it was null in the alpha), so the file has been rendered again by the current Worker and failed again. `scanstatus.renderer.version` is `libreoffice 4:7.4.7-1+deb12u14; poppler-utils 22.12.0-2+deb12u3`, the same release the alpha walk measured; R59 by its own words ("never retried against the same release") therefore does not requeue it, working as written. Today's Word file (`docx-bb75402a5b60e285bfebb17c.docx`, sha `71fd1838...a214e`) has `safe_view = {state:"done", route:"office"}` on that same renderer. So the renderer works; the old file does not load in 7.4.7.
- **What I could not establish:** why LibreOffice 7.4.7 cannot load that one file while it loads today's. The two uploads come from the same generator; I could not fetch the old file's bytes without an act that opens the original (not a read), and I cannot run the pinned image here. **What would prove it:** the bytes of `9dce360a...` (admin "Open the original" is an act; or the walker's local copy `bio-plane/test/corpus.mjs` recipe docx with the alpha's seed) converted by the pinned image `file-scanner-renderer` (`soffice --headless --convert-to pdf`); compare with the zip entries of today's file. If the file is malformed, B-K4 is "an old failed row of a bad file" and the page's sentence (B-K13's `refusal.NOT_RENDERABLE`) is the defect; if it is a feature 7.4.7 cannot load, it is `file-scanner` (Dockerfile.renderer, LibreOffice 7.4.7).
- **Why tests missed it:** `file-safety` R59 is tested with a fake scanner that reports two releases; no test runs the shipped image on the generator's documents (`file-scanner/test/render.test.mjs` skips when LibreOffice is absent, and the local build is 24.2).
- **Walker's exact case:** member, `/app/open-file/<the sha of INFO-2026-0192's capture>`, "Show the safe view": "Civicsmith cannot make a safe view of this kind of file. It is kept as it was handed in. Nothing was shown."

## B-K5 MAJOR: Find's "In titles, notes and details" shows a record's raw markdown as the match

- **Owning module:** `screens-daily`, `bio-plane/src/screens-daily/finder-states.mjs:153-168` (`excerpt`, `fieldRows`: the hit's `snippet` is escaped and drawn as it came). Source of the raw text: `query-language`/`retrieval`, `bio-plane/src/query.mjs:2501` (`snippet(bundles_fts, ${BODY}, '[', ']', '…', ?)` over the whole `body` column, markdown headings and the session log included). Boundary: the screen cannot know what is markup; the plane cannot know what the screen wants (R6's snippet is "the words around the match").
- **Findings:** LB-1.
- **Severity:** MAJOR.
- **Cause, proven in code and live:** every hit of the fields route carries `snippet` from the document's whole text; for a record (a standard, a determination) that text is its markdown, so the line reads "## Citation ... ## Issuer ENT-2026-0005 ## Reason ... ## Session Log ### Session ... | Recorded | member:admin Changes: standard recorded." I read the live hits: `op=search&q="placed nowhere"&snippet=40` (administrator) returns `" ## Act  The order EVT-2026-mccjsrhzk52lbtsw, [placed nowhere] ([object Object]).  Done by the office Records officer, City of Walkton (no office entity is held ..."`. Two defects share the cause: (1) markdown headings and session logs shown as the match; (2) the plane marks the match with `[` and `]`, and `excerpt()` (`finder-states.mjs:153-158`) turns any `[...]` in the text into emphasis, so a literal "[object Object]" is drawn "object Object" in italics: that is why the walker saw "(object Object)" with no brackets.
- **The "[object Object]" itself is old stored data, not current code:** it is in `CONF-2026-0001-determination` and `CONF-2026-0002-determination` (created 2026-10-26 07:05Z and 12:05Z). The determinations created later (`CONF-2026-0003` 18:55Z, `-0004`, `-0005` 2026-10-27 06:22Z) read "[placed nowhere] ([placed nowhere]: no attestation of this event is dated)", so `reasonText` (`conformance/index.mjs:2056-2062`, "nothing is never `[object Object]`") fixed it for new records; the old ones are immutable. One remaining raw interpolation of a `why` that may be `{key, vars}` is `bio-plane/src/conformance/index.mjs:763` (`${not.why}`) and `:768` (`${und.why}`), where `und.why` comes from `#inForce` (`:889`, `r.why ?? null`) and `standards` can pass an event's `{key, vars}` through (`standards/index.mjs:1241`): an in-force answer for a dated act whose standard rests on an unplaced event would write `on <date>: [object Object]`. I did not reproduce that one; it is a one-line check for `conformance`'s job.
- **Why tests missed it:** `test/m/screens-daily/finder-states.test.mjs` and `partial.test.mjs` feed plain-sentence snippets; no test feeds a record body with markdown headings or a literal bracket.
- **Walker's exact case:** member 1280, Find, `ordinance`, section "In titles, notes and details": the standard document's row shows "## Citation Alpha Roof Maintenance Ordinance, section 3 ## Issuer ENT-2026-0005 ## Reason The council minutes state this rule ## Source Undetermined: ... ## Session Log ...". For the bracket: Find, `"placed nowhere"` as administrator, the CONF-2026-0001 row.

## B-K6 DESIGN: the Document page's reading and authority sentences are developer sentences

- **Owning module:** UX-DESIGN (wording). The sentences are design-file rows (`words.json`, `origin "design"` in `rows.mjs`) whose notes name the producing module, and `screens-inquiry` `document.mjs:220` (authority basis), `:365`, `:562` (reading basis/why) draw them as given. Producing modules: `capture` (`rows.mjs:12576`), `doorbell` (`:12974`), `reading-pipeline` (`:17134`), `textchain` (`:15948`).
- **Findings:** LB-5 (every Document page, 1280 and 390; the dead-end census list of "words a member would not understand").
- **Words, quoted:** "a file a member brought into the record, which no one fetched; no authority is asserted; recorded {at} for resolution through the task list" (`capture.authority_basis`); "the {key} reader found no entities in this document's {fmt} text-layer text (tier {wired_tier}); recorded as an empty reading, never an emptied document" (`reading-pipeline.why.reader_found_entities`); "{replaced} page(s) were re-read by the tier-2 decoder, which recovered text tier 1 could not map and more of it; the other {kept} page(s) kept tier 1's reading" (`textchain.say.push.page_re_read`); "Undetermined".
- **Severity (the walker's):** MAJOR. Nothing is broken; the words are machine-facing and need a member's rewording.

## B-K7 MINOR: the stored authority sentence carries a raw ISO timestamp

- **Owning module:** `capture`, `bio-plane/src/capture/index.mjs:1382` (`authority_basis: say("capture.authority_basis", { at })`) and the same slot in `doorbell` (`rows.mjs:12974` `doorbell.authority_basis` {at}); `at` is an ISO instant, written into the stored record, and the Document page draws it raw (`screens-inquiry/document.mjs:220`) followed by the formatted date (`:221`): "recorded 2026-10-27T05:57:00Z for resolution through the task list October 27, 2026".
- **Findings:** the timestamp half of LB-5.
- **Severity:** MINOR. **Why tests missed it:** the screen's test scripts a short `basis`; the capture test checks the stored sentence contains the instant.
- **Walker's exact case:** Document page of any uploaded file, the "Undetermined" line under the source.

## B-K8 MAJOR: a mistyped address gets a sentence about "an argument" and "the shape it must take", with nothing beside it

- **Owning module:** `screens-intake`, `bio-plane/src/screens-intake/capture.mjs:128-136` (`refusalHtml`) and `:675` (`cs.call("heldat", { query: { address, check: "true" } })`), with the word in `answer-envelope` (`bio-plane/src/answer-envelope/checks.mjs:169-173`, `refusal.REQUIRED_ARGUMENT_MISSING`, `rows.mjs:16132`). Boundary: the sentence promises "The argument and the shape it must take are named beside this message" and nothing draws them.
- **Findings:** LB-6.
- **Severity:** MAJOR.
- **Cause, proven live and in code:** `heldat` refuses a non-https text: member `op=heldat&address=not an address&check=true` answers `{ok:false, reason:"REQUIRED_ARGUMENT_MISSING", argument:"address", shape:"a public https address", error:"address must be a public https address; \"not an address\" is not", ...}`. `refusalHtml` takes the held word for the code (`refusal.REQUIRED_ARGUMENT_MISSING`) whose text has no `{argument}`/`{shape}` slot, so the `argument` and `shape` the answer carries (put in `fills`, `:132-133`) are dropped. The screen also sends the typed text to `heldat` without checking it is an address (`sendAcquire`, `:661-676`).
- **Why tests missed it:** `test/m/screens-intake/capture.test.mjs:109` states "(REQUIRED_ARGUMENT_MISSING), so no real press reaches it: it stays the one scripted answer (a fault)", the assumption the live copy contradicts.
- **Walker's exact case:** Add, From an address, type "not an address", press Capture, administrator 390.

## B-K9 MAJOR: the lead form, pressed empty, says "Say why first: this act is sent only with your reason" though the form has no reason box

- **Owning module:** `screens-intake`, `bio-plane/src/screens-intake/leads.mjs:70-75` (`sendLead` returns `{words:""}`) and `:122` (`reasonField: "words"`), which routes it to the shell's generic reason check, `bio-plane/src/interface-shell/browser.mjs:2205-2208` (`w("shell.reason.needed")`). The "reason" of this act is the member's own words.
- **Findings:** LB-7.
- **Severity:** MAJOR (walker's). **Why tests missed it:** `test/m/screens-intake/` leads tests press with words; the empty press of a content field declared as `reasonField` is not tested (the other forms, e.g. `capture.mjs`, refuse with `capture.fieldneeded` naming the field).
- **Walker's exact case:** Add, Leads, "Write down the lead" with both boxes empty, member 390. Fix shape: `sendLead` refuses with the field's name (`capture.fieldneeded`, `fills: {field: "What you were told"}`) as `sendAcquire` does at `capture.mjs:660`.

## B-K10 DESIGN: "What this search covered" ends in a bare "10 / we looked and got part of it"

- **Owner:** UX-DESIGN (a row owed). The screen draws a stand-in: `bio-plane/src/screens-daily/finder-states.mjs:262-266`, written under the comment "(stand-ins: the log's own words for a partial look, the browse's 'more')": the count beside `observation-log.partial.looked_got_part` ("we looked and got part of it"), with no label saying what the number counts. The design's `screen.finder.covered.*` rows (`rows.mjs:6968-6978`) hold none for the documents only partly read.
- **Findings:** LB-8. **Words, quoted:** "10 / we looked and got part of it". **Severity:** MAJOR (walker's); nothing broken.
- **Why tests missed it:** the stand-in is pinned by `test/m/screens-daily/finder-states.test.mjs` as drawn.

## B-K11 MINOR: the passage count sentence borrows the Held list's "files shown" row and says "1 documents"

- **Owning module:** `screens-daily`, `bio-plane/src/screens-daily/finder-states.mjs:194-196`: the partial case uses `screen.held.archivemore` ("{shown} of {total} files shown.", `rows.mjs:2440`, a Held-list sentence) for passages; the whole case picks `holds.one` only when the passage total is 1, else `holds.other` with `m` = the number of documents (`:177-181`), so 2 passages in 1 document reads "2 passages in 1 documents match."
- **Findings:** LB-9, LB-10 (re-walk rows "200 of 1773 files" and "1 documents": both NOT FIXED).
- **Severity:** MINOR. The singular-document variant needs one new design row ("{n} passages in 1 document"): the second half is owed to UX-DESIGN.
- **Why tests missed it:** `test/m/screens-daily/partial.test.mjs:47,143` pin `screen.held.archivemore` for the passages route as the intended sentence; `:78` pins `holds.other` for n=2, m=2 only.
- **Walker's exact cases:** member 1280, Find `ordinance` ("200 of 1809 files shown."); Find `council NOT zzzqqq live087-B-6-u1-kbody` ("2 passages in 1 documents match.").

## B-K12 MINOR: under "no result", the widen act for the documents grain is labelled just "Search"

- **Owning module:** `screens-daily`, `bio-plane/src/screens-daily/finder-states.mjs:233`: `label: passageWiden ? "act.search.label.finder.widen" : "act.search.label.finder"`. The fields case (`widen` set) takes the plain label ("Search"), identical to the page's own Search button.
- **Findings:** LB-11 (re-walk row "widen buttons"; all four pairs). **Severity:** MINOR.
- **Why tests missed it:** `test/m/screens-daily/round10.test.mjs:267` asserts the plain `act.search.label.finder` for that case ("the act's label follows the heading"); the passage case (`:285-295`) asserts the widen label.
- **Walker's exact case:** Find `ordinance zzzqqq`: "Documents holding at least one of the words: 13." and a button "Search".

## B-K13 DESIGN: Opening a file: "The safe view needs no check." on every page, and the picture has no safe view

- **Owner:** UX-DESIGN (a variant row owed), with BOB for the picture question. Words, quoted: the last sentence of `screen.open-file.deeper.about` (`rows.mjs:2487`): "...opens the original to every member for 24 hours. The safe view needs no check." drawn at `screens-intake/open-file.mjs:123` for every high-risk file, including one the page has just said "so it has no safe view" (`hasSafeView` false, `:116-117`); and `refusal.NO_SAFE_VIEW` "Your team's Civicsmith makes safe views of documents, presentations, spreadsheets and plain text, and this file is none of them, so it has no safe view."
- **Findings:** LB-12 (re-walk row, NOT FIXED), LB-13 (a member cannot look at their own photograph in the app; by `file-safety` R11 pictures get no safe view, `build/requirements/file-safety.md:43`, so this is BOB's question).
- **Severity:** MINOR. Nothing is broken; one design row cannot be split by the code.

## B-K14 DESIGN (requirement): every capture is "No project yet" and the app never says how to file one

- **Owner:** UX-DESIGN / BOB (requirement). By decision, "Add has no project chooser of its own: the project is the route's subject (`/app/capture/<tab>/<PROJ-...>`)" (`test/m/screens-intake/r7-project-picker.test.mjs:1-6`, fix round 7, BOB's ruling), so the Add tab reached from the menu files nowhere, and no screen says that a document can be filed into a project afterwards or by opening Add from the project.
- **Findings:** LB-16 (alpha F-B17, still). **Words, quoted:** "No project yet". **Severity:** MINOR.

## B-K15 MINOR: the testimony form carries the photo paragraph but not the photo control the design draws

- **Owning module:** `screens-intake`, `bio-plane/src/screens-intake/capture.mjs:622` draws `photo.reminder`; the design's "What I saw or heard" mock draws it under "Add a photo or recording you made then · optional; it is kept beside your account" (`docs/development/ux-substrate/screens/mock-screens.js:1192-1193`; rows `screen.capture.saw.photo`, `screen.capture.saw.photo.optional`, `rows.mjs:4236-4237`), and no code uses those two rows (`grep` finds none outside the word tables). Requirement `screens-intake` R3 does not list the photo or recording attachment. So the form has the reminder of a photo that cannot be added.
- **Findings:** LB-17. **Severity:** MINOR. **BOB question:** add the optional attachment (R3), or drop the reminder from this form.
- **Why tests missed it:** R3's test covers the three fields the requirement names.

## B-K16 MINOR: a stored detail the reader may not read is drawn as if nothing more were known (the recorder cannot see what they recorded)

- **Owning module:** `screens-intake`, `bio-plane/src/screens-intake/about-knocker.mjs:60-66` (`known` rows) and `:80` (`ab-sight`, no member preselected, not even the recorder). `sources` answers an entry whose value the reader may not read as `withheld: true` with no `value` (`bio-plane/src/sources/index.mjs:285-288`); the screen draws `value` only when it is a string (`:63`) and has no branch for `withheld`.
- **Findings:** LB-19 (alpha F-B6, still). **Severity:** MINOR.
- **Evidence, live (member `walker`, `op=sourceof` for the pulled knock's capture):** the one history entry is `{kind:"attribute", attribute:"occupation", how:"self", knownTo:"group", recorded:true, by:"walker", withheld:true}`: the walker recorded the occupation and cannot read it back, because the sight list sent was not including the walker (`sendDisclose` sends `sight` as ticked; nothing is ticked by default).
- **Why tests missed it:** `t51-about-knocker.test.mjs` ticks the recorder's own box in its disclosure test.
- **Walker's exact case:** member, source page of a pulled knock, record "Occupation / The source said it themselves" with the member's value and evidence, one other member on the sight list, then read the page: "Occupation / Told by the source themselves · known to the team".

## B-K17 MINOR: Held captures has no search and no order, oldest first

- **Owning module:** `screens-intake`, `bio-plane/src/screens-intake/held.mjs` (reads `heldcaptures` with `fields: "picker"`, limit 50; no sort or filter control). The plane already sorts (`capture/index.mjs:249-252`: `HELD_SORTS` = age, source, project; `SORT_DIRS`), so the missing piece is the screen's, and the requirement `screens-intake` R4 names none.
- **Findings:** LB-20. **Severity:** MINOR. **BOB question:** does the design draw a sort or a search on Held captures (requirement gap)?

## B-K18 MINOR: after a pull the old "Put back in the inbox as new" line stays

- **Owning module:** `screens-intake`, `bio-plane/src/screens-intake/inbox.mjs:133-155` (`donePull` sets `discarded` false and `pulled`, never `putback`), drawn at `:116` (`L.putback ? said("screen.inbox.putback.done")`). Sequence the walker made: discard, put back, pull.
- **Findings:** the stale "Put back ..." half of LB-21 (also seen with the put-back answer, row f2). **Severity:** MINOR. **Why tests missed it:** the inbox tests run each act from a fresh page; none runs put-back then pull in one page.

## B-K19 MINOR: no way from a pulled knock's Document or Held row to "A source"

- **Owning module:** `screens-inquiry` (`document.mjs`) and `screens-intake` (`held.mjs`): `grep about-knocker` finds the link only in `inbox.mjs:102-103` (`cs.ref("source", k.capture_sha, ...)`). The requirement `screens-intake` R43 draws the source page "from the inbox" only.
- **Findings:** the first dead-end line of the census (and the walker's f3 note). **Severity:** MINOR; a requirement question for BOB (should the document of a handed-in file link to its source?).

## B-K20 UNKNOWN: slow screens and acts under five walkers; one "Still loading" with no call in flight

- **Findings:** LB-15 (`inboxpull;dur=2600`, `captureupload;dur=3923` for a DOCX, `namedrequests;dur=3268` with idle 8.4 s at 1280, first headings 2.0 to 2.8 s, the cold doorbell 7.2 s, `inboxresolve;dur=2870`), LB-18 (`council NOT zzzqqq live087-B-6-u1-kbody`: "Still loading" at 1.5 s).
- **What I tried:** read-only repeats when the copy was quiet: `namedrequests` 133 to 149 ms (`do-namedrequests` 67 to 69 ms), three calls; the NOT query's two calls `meaningrows` 421 ms and `search` 150 ms; so the slow figures are not the reads' own cost. The writes (`inboxpull`, `captureupload`, `inboxresolve`) cannot be repeated read-only, and I read `captureupload`'s path only as far as `capture` (profile, scan queue, render queue); I could not attribute 3.9 s to a step. For LB-18, `finder-states.mjs:138` shows "Still loading" while any route is `loading` or fewer routes than wanted are recorded; with the two routes each under 0.5 s alone it is not explained by the code.
- **What would prove it:** a trace of the same acts with the other four walkers idle (the `Server-Timing` `do-*` and `in-*` parts of `captureupload`, `inboxpull`), and for LB-18 the sequence of `cs.call` starts and settles in the page for that query. **Severity:** MINOR (walker's), MAJOR only if `captureupload` stays over 5 s when quiet.

## B-K21 UNKNOWN: after "Move into the record" at 1280 the knock still read "New" 4.1 s later

- **Findings:** LB-21 (first half). **Severity:** MINOR.
- **What I tried:** `inbox.mjs:206` declares `rereads: ["list","knock"]` for `inboxpull`, so the screen reads the knock again after the act, and `donePull` (`:133`) does not touch its status; the pull and its promotion are one act (`store-door/pull.mjs`, R7), so a reread after the answer should read "pulled". I could not find a reason in the code for a stale "New" and did not reproduce it (the walker did not at 390 either). **What would prove it:** the order and answers of `inboxpull` and the following `inboxget` for that press (the reread may have been answered from a call started earlier: `browser.mjs:124-141` coalesces reads in `SHARED` while `LOADING`).
