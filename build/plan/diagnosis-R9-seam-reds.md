# Diagnosis · T51 fix round 9 · the seam file's reds after every provider merged

Tree `/home/user/wt-diag` (detached at `e1272a2bc0`). Written by a diagnosis worker (sonnet, medium) for BOB #281. No product code was changed in this tree and nothing is committed.

How this was done. Each red was run alone from `/home/user/wt-diag/bio-plane` as
`node --import ./test/platform-sqlite.mjs --test --test-force-exit --test-name-pattern="<pattern>" test/m/control-plane/t51-round9-seam.test.mjs`
(round 8's three: `... t51-round8-seam.test.mjs`). To test a proposed fix without touching this tree, the tree was copied (without `.git`) to
`/tmp/claude-0/-home-user-bio/c0a1bb34-62f6-50e2-9b7a-2b920802b70d/scratchpad/sc` and the fix was applied there; "scratch" below means that copy. A fix is called **verified** only where the red turned green in the scratch copy; otherwise it is **derived** (read from code and evidence, not run).

## Summary

| # | Red | Verdict | Owner(s) |
|---|---|---|---|
| 1 | §6 A1 and A12, an uploaded archive's members | PRODUCT in three places and TEST wrong in one (four causes) | acquisition (two), control-plane (one); the test's R135 line is control-plane's |
| 2 | §5 K4833, two members, two PDFs | the first two tests are §4's cause (nothing arms the alarm); the third has a product gap and a test that asks for what D-15 forbids | acquisition (arm), control-plane + acquisition (the refusal's detail), test |
| 3 | §9 the killed page | PRODUCT (the kill is charged to the whole, never to the page) | plane (job 37) with reading-pipeline and extraction |
| 4 | §19 round 8 A1, A1 control, A1b | PRODUCT: acquisition never arms the alarm after it registers the `fetch` row. Not the scheduler, not plane | acquisition |

One finding crosses reds 2 and 4: they are the same defect (red 2's first red line is a `fetch` row `queued`, attempts 0, never run).

---

## 4 · §19 (round 8 A1, A1 control, A1b): the `fetch` row is registered and nothing arms the alarm

**Reproduction.** `--test-name-pattern="R8 \(A1" test/m/control-plane/t51-round8-seam.test.mjs`, three tests, all red:
`r8-seam-capture.mjs:92` "the document is delivered within 120 s" (A1 and A1 control), `r8-seam-capture.mjs:120` "the watch ended within 170 s" (A1b). The same state shows in §5's red line: the owed `fetch` row is `"state":"owed","job_state":"queued","attempts":0,"next_try":1792862207247,...` (registered, due now, never run) while `alarm_at` stays hours ahead (`1792886400000`, the daily alarm).

**Root cause (certain, verified).** `bio-plane/src/acquisition/index.mjs:404-412`, `oweOf`, the function that registers every row acquisition owes (the `fetch` row of a parked large capture, called at `:1368` `await fetchOwe({ kind: "fetch", session: fp.session })`):

```js
const oweOf = (cap, opts) => {
  const reg = registrarOf(cap, opts);
  if (reg) return async (entry) => {
    let r;
    try { r = reg(entry); } catch (e) { r = { ok: false, reason: "REGISTRAR_THREW" }; }
    if (r && r.ok === true) return true;          // <- :409, the row is written; the alarm is never asked to look at it
```

Acquisition R116 (fix round 9) moved the row from the old `owedLater` hook to the registrar. The old path, `plane/pending.mjs:639` (`owe` ... `await arm();`), armed the scheduler after writing the row. The registrar `registerJob` (`plane/pending.mjs:240`) is synchronous and arms nothing, by design: `plane/pending.mjs:28-30` and `store.mjs:441-443` say "arming the alarm is the separate `armJobs()` after the commit", and the store gives the capture module `capture.armJobs = () => pending.armJobs()` (`plane/store.mjs:443`). Capture does take that step (`capture/index.mjs:910-917`, `#registrar` returns `{reg, arm}`, called after its commit). Acquisition's `registrarOf` (`:400-401`) reads `cap.registerJob` and nowhere reads `cap.armJobs` (the word `armJobs` does not occur in `acquisition/*.mjs`). Acquisition R116 says: "arming the plane's alarm is a separate step after the commit."

Why the alarm stays 4.4 h ahead and nothing rescues it: the request path's rescue is `scheduler/index.mjs:779-784` `heal()`, which by its own R28 only re-arms when no alarm is set or the one set is spent (`at < now - SPENT_ALARM_MS`); it "asks nothing of any consumer". A set daily alarm in the future is not spent, so `heal` returns it. `arm()` (`:767`) would weigh `pending-work`'s wake (`pending.mjs:713`, `wake: next()` = the row's `due_at`, now) and pull the alarm earlier (`#reconcile`, `:754-758`), but nobody calls it. The scheduler and plane's consumer behave as specified.

**Verified fix in scratch.** In `oweOf`, after `r.ok === true`: `if (cap && typeof cap.armJobs === "function") await cap.armJobs()` inside a try/catch. Result: `R8 (A1)`, `R8 (A1 control)`, `R8 (A1b)` all pass (3 of 3), and §5's first two tests pass (red 2).

**Owner.** acquisition (R116). The same omission is in `keepLaterOf` (`acquisition/index.mjs:418-423`, the `keep` row) and in whatever registers `subresources` and `unpack` through `registerJob`; the whole of R116's callers should arm once after the commit.

**Why missed.** Acquisition's R116 tests (`test/m/acquisition/r9-registrar.test.mjs`) run on `jobRegistrarStub` (`test/job-registrar-stub.mjs`), which has no `armJobs` and records rows only; they assert "exactly one row of kind X and sha Y" and never that the alarm was asked. Round 8's A1 was green until acquisition R116 replaced the arming hook; round 9's own seam is the first test with the real scheduler behind the registrar.

**Test or product.** Product. The seam test is right.

**Failing-first test the owning job adds.** In `test/m/acquisition/r9-registrar.test.mjs`: give `jobRegistrarStub` an `armJobs` that counts calls, set `w.store.armJobs = j.armJobs`, press a large web page, and assert `j.armed() >= 1` after the answer and after the row exists (`rows().length === 1`), and that a refusing registrar arms nothing. It is red today (0 calls). Same for a `keep` and a `subresources` row.

---

## 2 · §5 (K4833): two members, two PDFs sharing an 8 MiB part

**Reproduction.** `--test-name-pattern="R9 seam §5 \(K4833, G127a, G127c; R120 R123 R125"` (about 11 min on the loaded machine). Red line (`r9-seam-documents.mjs:444`): `the first member's PDF is held (its fetch row: {"sha":"fp_c1b5400a222154d2_mvmnv8r2","kind":"fetch","state":"owed","job_state":"queued","attempts":0,"registered_at":1792862207247,"next_try":1792862207247,"last_try":null,...})`.

**Root cause, tests 1 and 3 (first press): the same as red 4.** The press parks a 10 MiB PDF (`LARGE_FETCH_BYTES`) and registers a `fetch` row through `oweOf` (`acquisition/index.mjs:1368`); the alarm is never armed (`:409`), the row stays `queued, attempts 0`, `heldat` stays false. Provenance's part rule is already right: `provenance/index.mjs:1816-1822` takes `shas` as the wholes only (R74-R76) and the G127c refusal is for a whole. Verified: with red 4's one-line fix in scratch, test 1 (two members press) and test 2 (two members upload and promote) both pass. (Test 2 passes in this tree too, unchanged: the upload path registers through capture, which arms.)

**Root cause, test 3 ("the same file pressed by a second member is refused for the WHOLE only"), after the alarm is armed: the refusal's facts are lost on the way to the row, and the test asks for something the record forbids.** With the arm fix the row ends `final`, `why CAPTURE_HELD_BY_ANOTHER_BUNDLE`, `detail {}`, `failed_why {}` (`DIAG5 row` in scratch). Plane R97 says the row carries the refused sha, its holder and `kind` in `failed_why` (`plane/pending.mjs:350-357` `heldOf` reads `r.detail` or `r.refusal.detail` as `{capture_sha|sha, holder, kind}` and `:358-364` `stop` writes `failed_why`). Three links drop it:

1. provenance's refusal carries them at the TOP level of its answer (`provenance/index.mjs:1829-1832`, `{bundleId, capture_sha, kind: "whole", holder}` is `refusal(code, text, extra)` -> `rowRefusal` `:314-316` spreads `extra`; `detail` is a sentence string);
2. control-plane returns only the holder: `control-plane/index.mjs:822` `return { ok: false, reason, ...(reason === "CAPTURE_HELD_BY_ANOTHER_BUNDLE" ? { holder: ... } : {}) }`, no `kind`, no `capture_sha`, no `detail` object;
3. acquisition's `owedFetch` ends the entry from `refusalOf(given)` (the code alone, `:2505-2508`) and answers `{ ok: true, done: true, final: true, reason: why }` at `:2436`, `:2462` and `final(why)` at `:2518`/`:2561`, so `heldOf(r)` in the plane finds nothing.

The test then reads `row.detail` (`r9-seam-documents.mjs:491`, `const detail = (row && row.detail) || press.body.detail || {}`; the holder assertion is `:495`), which is the owner's cursor column and is `{}` by design; the plane puts the facts in `failed_why[<code>]` (R97). That line of the test is wrong. Second, `assert.ok(detail.holder, "the refusal names the holder")` cannot hold: provenance names the holder only to a caller who may see it (`provenance/index.mjs:1824-1826`, `named = !caller || membership.inSight(...)`, D-15), and the second member (`r9k-fay`) is not in sight of the first member's bundle (`r9k-eli`, no shared project), so the holder is `null` by the record's own rule. In scratch, with links 2 and 3 carrying `detail: {capture_sha, kind, holder}` and the test reading `row.failed_why["CAPTURE_HELD_BY_ANOTHER_BUNDLE"]`, the row reads `{"sha":"7471c70f...","holder":null,"kind":"whole"}`: the `kind: whole` assertion passes, the `holder` assertion fails for the D-15 reason.

**Owner.** Tests 1 and 3 (first press): acquisition, the arm (red 4). Test 3's refusal detail: control-plane (`index.mjs:822` builds the answer) and acquisition (`owedFetch` must pass the delivery's `detail` through its `final` answers); the plane's reader (`heldOf`) is already as R97 states. The holder assertion and the `row.detail` read are the test's (control-plane's seam, job 43).

**Why missed.** The plane's own test (`test/m/plane/r9-jobs.test.mjs:147-152`) hands the plane an answer that already has `detail: { bundleId, capture_sha, kind, holder }`, a shape the real chain never builds (provenance puts those keys at the top level, control-plane keeps only `holder`, acquisition keeps only `reason`); I did not find a test that runs provenance's real refusal through control-plane's delivery, acquisition's `owedFetch` and the plane's row together, so each link was tested against a hand-made neighbour. The plan (G127c) wrote "the owed row carries the refused sha and the holder (plane-2's job row, `failed_why`)" but no job owned the two upstream links.

**Test or product.** Tests 1 and 2: product (red 4). Test 3: product for `kind` and the sha (the chain), TEST for reading `row.detail` and for requiring a holder a member may not be told. Requirement note for BOB: plane R97 says the row "carries ... its holder", provenance R2/D-15 says the holder is named only in sight. Smallest consistent reading: the row carries what the refusal carried (`holder: null` when not in sight) and the test asserts `kind: whole` and the sha, plus the holder in a second case where the second member can see the first's project.

**Proposed fix.** (a) acquisition arms (red 4). (b) control-plane `index.mjs:822` also returns `detail: { capture_sha, kind, holder }` copied from the refusal's top level. (c) acquisition's three final answers add `detail: given.detail` when it is a plain object. (d) test: read `row.failed_why[HELD_ELSEWHERE]`; assert `kind === "whole"` and the sha; move the holder assertion to a case where both members are in one project, or drop it.

**Failing-first tests.** control-plane: drive `deliverOwedRender` with a store whose promotion answers provenance's real refusal shape (top-level `kind`, `capture_sha`, `holder`) and assert the answer carries `detail: {capture_sha, kind: "whole", holder}`. acquisition: `owedFetch` with a `deliver` returning `{ok:false, reason:"CAPTURE_HELD_BY_ANOTHER_BUNDLE", detail:{kind:"whole", capture_sha:X, holder:null}}` ends `final` with `detail` on the answer. plane: a `final` answer carrying that `detail` leaves `failed_why.CAPTURE_HELD_BY_ANOTHER_BUNDLE = {sha:X, holder:null, kind:"whole"}` (this part likely exists; if so it stays green).

---

## 1 · §6 A1 and A12: the members of an uploaded archive

**Reproduction.** `--test-name-pattern="R9 seam §6 \(G126f"` (A1, A12; about 4.5 min). Red lines: A1 `r9-seam-documents.mjs:139` `each member of the uploaded archive is filed and has a home (the archive is opened, as a fetched one is): m001.txt:filed:no home m002.txt:filed:no home m003.txt:filed:no home`; A12 fails on its first assertion (`"the first upload's members are filed and have homes"`, `:~182`) for the same reason. "filed, no home" means acquisition cut and stored the member, and control-plane's promotion of it was refused.

**Four causes, found in order (each hid the next); with all four fixed in scratch A1 and A12 pass.**

### 1a. Cause: acquisition states the wrong `grade_basis` for a member of an ungraded archive (product, the red in the record)

`bio-plane/src/acquisition/unpack.mjs:849`:

```js
...(g && g.grade ? { grade: g.grade } : { ...(g && g.basis ? { grade_basis: g.basis } : {}) }),
```

`g` is `provenance.captureGrade(member)`, i.e. provenance R59's answer for the file, whose `basis` is always `"CAPTURE_UNPACKED_FROM_ARCHIVE"` and whose `archive.basis` is the archive's own basis (`provenance/index.mjs:1344`: `{ ...rest, route: "unpacked", basis: UNPACKED_FROM_ARCHIVE, archive, ... }`, `archive: { sha256, through, route, basis }`). An uploaded archive earns no letter (`CAPTURE_RECEIVED_NOT_FETCHED`, R63), so the member's `g.grade` is null and acquisition writes `grade_basis: "CAPTURE_UNPACKED_FROM_ARCHIVE"`. Provenance's C-18.1 compares with the archive's: `provenance/register-checks.mjs:105-112` (`const basis = g.archive && typeof g.archive === 'object' ? g.archive.basis : g.basis; ... if (cap.grade_basis !== basis) findings.push(f('C-18.1', 'error', ... its capture.grade_basis is '${cap.grade_basis}', not its archive's, '${basis}'`) and the promotion is refused. Requirements: acquisition R39 ("`capture.grade` the letter ... absent when that answer has none, and the archive document's `grade_basis` then stated") and provenance R42 ("otherwise its `grade_basis` is the archive's").

Owner: acquisition. Fix in words: state `g.archive.basis` when `g.archive` is an object, else `g.basis`. (Verified in scratch: the members then get homes.)

Why missed: acquisition's fixture `captureGrade` (`test/m/acquisition/fixture.mjs:108-121`) answers `{...a, route: "unpacked", basis: "CAPTURE_UNPACKED_FROM_ARCHIVE", archive: {..., basis: a.archive ? ... : a.basis}}` correctly, but every acquisition test unpacks an archive received by a direct fetch, which earns a letter, so the no-letter branch of `fileDocument` never ran. Provenance's tests (`provenance/unpacked.test.mjs:255-269`) build the member's document by hand with the right basis. No test joined the two before an uploaded archive could be unpacked (capture R86, round 9).

Test or product: product.

Failing-first: acquisition: archive receipted by `doorbell` or `upload` (fixture `captureGrade` answering `grade: null, basis: CAPTURE_RECEIVED_NOT_FETCHED`), unpack it, assert each document's `capture.grade_basis === "CAPTURE_RECEIVED_NOT_FETCHED"` and `capture.grade` absent; then file it through the real provenance (as `provenance/unpacked.test.mjs`'s `world()`) and assert no C-18.1.

### 1b. Cause: the archive door follows only the members whose reading was dropped (product; also true of a FETCHED archive)

`control-plane/index.mjs:2459-2462`:

```js
async function promoteFiled(docs, archiveSha, incomplete = false) {
  const dropped = [];
  const done = await promoteArchive({ stub, doAnswer, docs, project: archiveProject, archiveSha, who: archiveWho, onDropped: (e) => dropped.push(e) });
  if (dropped.length) await followEntries(dropped);
```

`promoteArchive` calls `onDropped` only for a document filed without its reading (`control-plane/archive.mjs:108`, `f.readingDropped`). A member cut out by acquisition carries no `reading` at all (`acquisition/unpack.mjs` `fileDocument` builds none), so it is never `readingDropped` and never followed: no `reading` row, no inline read. Evidence (scratch, FETCHED zip, `DIAGF member`): each member is `filed` with a home, `op=reading` answers `found:false, job:{state:null}` and `owedwork` lists no row, and no tick will ever read it. Requirements: control-plane R130 ("the archive door ... registers the document's `reading` row"), R133 ("Every document a promotion stores is followed"), R134's A1 ("each member filed under the project and read").

Owner: control-plane. Fix in words: after `promoteArchive`, follow every promoted member, not only the dropped ones: `followEntries(done.promoted.map(p => ({ sha: p.sha256, document: <the doc of that digest> })))`. (Verified in scratch: the members then have a reading.)

Why missed: `r133-r134-follow.test.mjs` drives `makeFetch` over a recording store and counts follows for `op=promote`'s `followed` list and for archive members only where the stub marks the document `readingDropped`; its header says "the whole path with the real plane is the seam's §6". No archive test asserted a member's reading or row.

Test or product: product.

Failing-first: control-plane (`archive.test.mjs` / `r133-r134-follow.test.mjs` style): `op=unpack` filing 3 members that carry no reading: assert `pendingadd` kind `reading` is asked once per promoted member, in order, before any read, and that `reading_pending` is true when over `READING_FOLLOWED_MAX`; control: a member in `not_promoted` is not followed.

### 1c. Cause: acquisition does not use the one rule for "is this text" on an archive member (product, a gap between two requirements)

After 1a and 1b, the member has a reading but it is `completeness: "stated", failure: "final", basis: "the document was not read as text (non-textual or too large), so no reading was attempted"`, `format: "undetermined"` (`DIAG6c`). `acquisition/unpack.mjs:821-826`:

```js
const o = await ev.get(stored.parts[0].sha256);
const head = o ? new Uint8Array(await o.arrayBuffer()) : null;
const f = head ? detectFormat(head, null) : null;
ct = f && FORMAT_MEDIA_TYPES[f.format] ? FORMAT_MEDIA_TYPES[f.format] : null;
```

Plain text has no magic bytes, `detectFormat(head, null)` (no name passed; `formats.mjs:190`) answers `undetermined`, so `ct` is null and `profileOf` profiles the member as an unread blob. Acquisition R102 defines `textTypeOf({bytes, type, name})` as "THE ONE RULE for reading a file a member brought in as text" (`acquisition/index.mjs:155`); capture's upload (`capture/index.mjs:895-898, 1290`) and the doorbell's pull (`doorbell/index.mjs:654`) call it; `unpack.mjs` does not. Acquisition R39 says the type is "what format-registry finds in the bytes, else none", while control-plane R134's A1 requires an archive of text members to be "read". The two lines of the requirements disagree, which is why no job owned it.

Owner: acquisition (`unpack.mjs fileDocument`), with BOB to amend R39/R102 so an archive member is a third entrance to the one rule. Fix in words: when `detectFormat` finds nothing, use `textTypeOf({ bytes: head, type: null, name: row.name })` (the entry's decoded name) for the member's type. (Verified in scratch with a name-extension stand-in for `textTypeOf`: members are then read, `findin` finds each marker word.) A fetched archive's text members have the same defect.

Why missed: acquisition's unpack tests use ZIPs of PDFs and structured files whose formats have magic bytes, or assert the document's digests and receipt, not that a text member is readable; capture and doorbell tests of `textTypeOf` never meet an archive.

Test or product: product (spec gap flagged).

Failing-first: acquisition: unpack a ZIP with `a.txt` (UTF-8 text) and `b.csv`; assert `documents[0].profile.content_type_label`/`source_content_type` is `text/plain` and the profile is read from text (`profiled_from_text: true`); control: a `.txt` entry holding a NUL byte is not text; an entry named `x.bin` is `undetermined`.

### 1d. Cause: A1's last block compares `op=reading`'s `job.state` with `owedwork`, which does not list finished rows (TEST wrong)

After 1a-1c the test fails at `r9-seam-documents.mjs:163`: `job.state is null exactly when no reading row exists (state finished, rows 0)`. `owedwork` lists only rows still owed (`plane/pending.mjs` `list`: `WHERE state <> 'finished'`; the comment "A row that finished owes nothing and is not listed"), while `op=reading` answers the job state from the row itself, a finished row included (plane R107, control-plane R135: "each state ... finished"). So a member whose job finished has `job.state: "finished"` and zero listed rows, and the test's equation is false for every finished job. `owedwork` also carries the last run of each kind (`last: [{kind, outcome: "finished"}]`), which is where an ended row shows. (Control-plane R135 says `owedwork` "lists the same rows"; the plane's R77/R80 listing excludes finished rows; BOB may want that sentence made precise.)

Owner: the test (control-plane's seam, job 43). Fix in words: count a row as existing if it is in `owed` or in `last` for kind `reading` or `ocr`. (Verified in scratch: with 1a-1d, A1 and A12 pass.)

Why missed: the line was written against fixtures where the job is still owed or has no row; the seam is the first place a finished row coexists with a reading.

---

## 3 · §9 (G129c): the killed page

**Reproduction.** `--test-name-pattern="R9 seam §9 \(G129c"` (about 2.5 min). Red line (`r9-seam-reading.mjs:675`): `the rest of the scan is read: pages [] of 8; open work [reading:final,ocr:final]; {"state":"partial","failure":null,"why":null,"units":0}`. Page 5 of an 8-page scan kills the object when the OCR member is asked for it (`ocrMember`, `r9-seam-reading.mjs:149`, answers `x-r9-kill` and the Store wrapper calls `ctx.abort`). With the wrapper's output printed (scratch, `DIAG9`): both rows are `final`, `why: "PAGE_KILLED_READER"`, `attempts: 3` (ocr) / `4` (reading), `interrupted: 3`, `detail: {}`, `written: 0`; the OCR member's log shows each pass asking pages 0 to 5 one call at a time, the kill at 5, and no page ever written; `ocr_left: {cursor: 0, pages: 8}` is unchanged.

**Root cause (certain for what happens; the fix is derived, not run).** Three parts of one design hole; the first two are the cause of the red:

1. **The kill is charged to the whole, not to the page.** The plane stamps the unit a run starts on from the row's `detail`: `plane/pending.mjs:439` `const unit = unitOf(json(row.detail, {}))`, with `unitOf` (`:135-141`) answering `p<n>` only for `detail.next_page` or `detail.page`, else a `c...` cursor, else `"whole"`. The `ocr` and `reading` rows extraction registers carry `cursor` in the `cursor` COLUMN and `detail {}` (`extraction/index.mjs:760-771` `#ocrEntry` -> `registerJob` -> `pending.mjs:write`, which keeps `detail` only when given), so every run is stamped `"whole"`. When the object dies, `reapInterrupted` (`:467-481`) adds one kill to the stamped unit (`"whole"`), and at three:

```js
const steppable = PAGED.includes(row.kind) && (pageOf(unit) !== null || unit.startsWith("c"));
if (u && u.tries >= UNIT_KILLS_MAX && !steppable) {
  sql.exec(`UPDATE keeps_pending SET final_why=?, last_why=?, state='final', ended_at=?, last_try=? WHERE sha=? AND kind=?`, PAGE_KILLED_READER, ...
```

`"whole"` is not steppable, so the row ends `final PAGE_KILLED_READER` with the whole scan unread: the "three interruptions end the whole read" that plane R101 (2) retired, under the page's reason. `unitPlan` (`:448-462`) therefore never has a `p5` with three tries to hand the reader as `killedPages`.

2. **Nothing stamps the page actually in flight.** The OCR pass asks the member one page at a time in a loop (`reading-pipeline/index.mjs:381-420` `askMemberPerPage`; `:402` `const rp = await call([page])`), inside one `tier3Extend` call, and writes the reading once, afterwards (`extraction/index.mjs:1165` `tier3Extend`, `:1192` `#writeReread`). So pages 0 to 4 are done in memory and lost when page 5 kills the object; and no hook tells the plane which page the object died on. The only attribution available to the plane is the stamp taken before the run, i.e. `"whole"`. Extraction R101 says "Before the reader runs on a unit (a page...) its attempt is stamped", plane R101 (2) "a unit's attempt is stamped before its reader runs"; the `killed` answer (`reading-pipeline` R54) covers only a member that ANSWERS 5xx while the object lives, not a kill of the object.

3. (Not the cause of this red, but it would be the next one.) The half-budget retry never happens: the plane hands `halfBudgetPages` (`pending.mjs:461, 489`), extraction's `readHeld` takes `halved` (`extraction/index.mjs:860`); nothing sets `halved`.

Requirements: plane R101 (2), extraction R101 ("SCAN D12: page 150 stated after the kills, the other 299 read").

**Owner.** plane (job 37: the stamp and the reap, `pending.mjs`) with reading-pipeline (`askMemberPerPage` must tell the caller which page it is about to ask) and extraction (`#ocrPass` and the reading pass pass that hook down). The plane owns the decision to end a row; it cannot end it for a page it never learned about.

**Smallest correct fix in words.** The plane hands the reader a `stampUnit(page)` beside `registerJob`/`armJobs` (`pending.mjs:485 handed()`); `askMemberPerPage` calls it immediately before each member call (first call: the first page asked); the plane's `stampUnit` writes `job_unit_attempts(sha, kind, "p<page>")` with `stamped_at` and clears the row-level `"whole"` stamp, and `reapInterrupted` then charges the kill to `p5` only. After three kills `unitPlan` returns `killedPages: [5]` (already wired to `read`/`#ocrPass` -> `tier3Extend`, which states `PAGE_KILLED_READER` for it and goes on); the pages before 5 are lost three times (the pass is atomic, at most `OCR_INVOCATIONS_PER_REQUEST` calls) and then read. A row whose pass dies with no page stamped stays charged to `"whole"` and still ends stated at three (a poison that is not a unit). Also rename the hand-off so the half-budget retry exists (`halfBudgetPages` -> `halved` for the stamped page, or extraction reads `halfBudgetPages`). Optional, and a BOB decision on cost: write the reading after each OCR call so a kill loses at most one page.

**Why missed.** The plane's R101 test (`test/m/plane/r9-jobs.test.mjs:347-375`) makes the reader die only when the page is FIRST in the run and the row names it in `detail.next_page` (`:352-356`), so `unitOf` returns `p150` by construction; the real rows extraction registers have `detail {}` and the page that kills is the sixth in a pass. Extraction's and reading-pipeline's tests (`extraction/r101.test.mjs`, `reading-pipeline/r9-reader.test.mjs`) hand `killedPages` in; none kills the object in the middle of `askMemberPerPage`. The seam is the first test that joins them.

**Test or product.** Product. The seam test is right (page 5 stated, 0-4 and 6-7 read).

**Failing-first tests.** plane: register an `ocr` row through `registerJob({kind:"ocr", sha, cursor: 0})` (as extraction does, `detail` empty) with a reader stub that calls `stampUnit(5)` then makes the isolate "die" (leave `started_at` set, not in `running`); three ticks later `unitAttempts` holds `p5` with tries 3 and the row is NOT `final`; the next `readArgs` has `killedPages: [5]`. Control: a reader that dies with no stamped page ends the row `PAGE_KILLED_READER` at three (today's behaviour, now only for that case). reading-pipeline: `askMemberPerPage` with a member recorded in order calls the hook with 1, 2, 3 before the corresponding member calls. extraction: `#ocrPass` passes the hook to `tier3Extend`. Seam: the existing §9 test.

---

## Things BOB may want to place beyond the four

- Red 4's omission (no `armJobs` after a registrar write) is a class: audit every caller of `registerJob` outside capture and the ledger (`acquisition` `keep`, `subresources`, `unpack`; `file-safety/index.mjs:281` `#registerJobs`; extraction's `registerOwe` already arms, `plane/store.mjs:452`).
- Red 1c needs a requirement line (acquisition R39/R102: an archive member is read as text by the one rule); red 1d and red 2's holder need a one-sentence precision in control-plane R135 / plane R97 (finished rows are not in `owedwork`'s `owed`; the holder on a row is what the refusal named to the viewer).
- Machine note: the seam sections take 2 to 11 minutes each on the loaded machine; every timing here is a wait for a condition, not a duration.
