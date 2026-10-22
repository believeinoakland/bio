**Status** · The audit worker's report for Bob's question of 2026-10-22 (K4483), saved whole by BOB #247; F1 reproduced by `audit-partial-reads/pending-gap.test.mjs` and its root fact read by BOB (K4487). Its scratch-path notes are superseded by this file.

# Audit: items held, read or processed only in parts, pages or deferred stages (T51, branch tranche/T51, HEAD 2e49352176)

The REPORT.md you asked for could not be written: the Write tool refused it ("subagents should return findings as text"). This message is the full report, so please save it from here. The only file written is a scratch test: `/tmp/claude-0/-home-user-bio/a5b8960f-d2ed-5706-8868-f32f13765dec/scratchpad/audit/pending-gap.test.mjs`. Run it with `cd /home/user/bio/bio-plane && node --test <that file>`. It imports the repo by absolute path and changes no tracked file.

Evidence levels: CERTAIN means traced through the code to the end. PROBABLE says what I did not read. F1 was also reproduced by running that test. Paths are relative to `/home/user/bio/bio-plane/src` unless they start with a repo-root module directory.

I did not re-report K4481 (extraction R81). R81 only fixes extraction's private home lookup (`#homeOfParts`), and the same root cause reaches about 25 other callers (F3).

## Root facts all findings rest on

- **Register holds parts only.** A capture of more than one 8 MiB part is registered only by its part shas.
  - `screens-intake/capture.mjs:134-139` (`promoteDocument`): `register` is built from `parts`.
  - This is by design in provenance D-533 (`provenance/index.mjs:689-700`).
  - So `provenance.homeOf(<whole sha>)` (`provenance/index.mjs:835-841`, SQL on `register` by `capture_sha`) is null for every multipart capture.
- **Whole object only up to 32 MiB in the request.** The whole is stored under its own digest in the request only up to `MULTIPART_KEEP_MAX` = 32 MiB (`acquisition/index.mjs:1354`, `capture/index.mjs:718`).
  - Above that, only the `acquire` path makes it whole, by `putFromParts`, awaited within the bound.
  - If that does not finish in time, the plane's `keeps_pending` alarm does it later.
- **Reading assembles parts only up to 20 MiB.** `reading-pipeline.bytesOf` assembles a multipart capture from parts only up to `MULTIPART_READ_MAX` = 20 MiB (`reading-pipeline/index.mjs:1445`).
- **Workers read the whole key only.** The OCR member, PDF member, scanner and safe view all read `<store>/captures/<whole sha>` (`ocr-worker/src/member.mjs` ~l.262, `pdf-worker/src/index.mjs:161`, `file-scanner/src/store.mjs:54`). A capture with no whole object is invisible to them.

## Ranked findings, by member impact

### F1. A deferred reading is abandoned about 4 minutes after capture, or dropped at "no home yet", and no one is told. Lost reading. CERTAIN, reproduced.

**(a) Entry.**
- The member captures a PDF over 2 MB, or any document once under 8 s of the door's 25 s bound remains. The door answers `reading_pending: true` with no reading (`control-plane/index.mjs:2347-2358`, `plane/door.mjs:97-101`). It registers `pendingadd` (`control-plane/index.mjs:2403-2410`).
- Or a capture over 32 MiB whose keep is left to the alarm.
- The member then names and files it on the screen (op=promote) at her own pace.

**(b) Fault, step by step.**
1. `plane/pending.mjs:53-59,72-78`: the entry is due at once. The alarm calls `extraction.readHeld`, but she has usually not promoted yet, so the answer is `NO_HOME`.
   - That counts as an attempt, backed off 15 s, 30 s, 60 s, 120 s.
   - After `PENDING_ATTEMPTS_MAX` = 5 tries (t = 0, 15, 45, 105, 225 s) `live()` no longer selects it and `wake()` returns null.
2. For kind `keep` (over 32 MiB), `pending.mjs:76` treats `afterKeep && NO_HOME` as ended and deletes the row.
   - Its comment says "the door reads it at the promotion (control-plane R117)". No such read exists.
   - `readHeld` is called in control-plane only at `control-plane/index.mjs:2367` (after an `acquire` answer with `existed`) and `:2443` (after an upload answer with `existed`).
   - Nothing runs after `op=promote`.
   - `screens-intake` has no `readheld` or `reading_pending` handling. The only recovery is `screens-inquiry/document.mjs:462,1128`, a manual "Read it" on an unread copy (N5).
3. A member who files after about 4 minutes, or after the keep tick, gets a record with no reading, permanently. A second registration of an exhausted digest is a no-op (`pending.mjs:46-54`), so capturing again does not re-arm it.
4. `list()` (`pending.mjs:99`) is exposed by no op, screen or notice, so dead entries "stay named" where nobody sees them. No queue, notice or machinery producer raises "this document has no reading". The capture screen is not told the reading is pending.

**(c) Silent and permanent.** Retried only 5 times, then dropped.

**(d) Evidence.** The scratch test shows `readHeld` asked exactly 5 times over 8 alarms, then no wake once the home exists, and a re-register leaving attempts at 5. The existing test `test/m/plane/fix4-r75.test.mjs` ("after a keep, a digest with no home yet ends there") pins this faulty behaviour as required.

**(e) Failing-first tests.**
- A 3 MB text PDF is captured and `readHeld` answers `NO_HOME` for 10 minutes of fake time. The member then promotes. A reading must exist within one alarm.
- A 40 MB three-part capture (14+14+12 MiB). The keep is done by the alarm at 15 s and the member promotes at 90 s. A reading must follow the promotion.
- Control: a 10 MiB capture promoted within 5 s is read (works today).
- A second `acquire` of the same address re-arms an exhausted entry.

**(f) Owner.**
- **plane** (`plane/pending.mjs`): an owed reading never expires, `NO_HOME` after a keep does not end it, a re-register re-arms it, and `list` is exposed.
- **control-plane**: read after `op=promote` of a document with no `reading`, and carry `reading_pending` to the screen.
- **screens-intake**: say the reading is pending.

This is C5a's planned "readHeld after the screen's promotion", still unbuilt.

**(g) Why tests miss.** Pending's tests spy `readHeld` and never promote between ticks. The keep test encodes the comment as the requirement.

### F2. An uploaded file over 32 MiB is never made whole and never scheduled. Its reading is a permanent failure. CERTAIN.

**(a) Entry.** The member uploads a 33–256 MiB PDF or Office file (`op=captureupload`).

**(b) Fault.**
- `capture/index.mjs:718` calls `keepWhole`. It returns `{ok: true, kept: false}` at once when `total > MULTIPART_KEEP_MAX` (`acquisition/index.mjs:370`).
- The C5c fix (await `putFromParts`, else `keepLater`) is only in the `acquire` arm (`acquisition/index.mjs:1569-1585`). The upload arm has none.
- `control-plane readUploaded` (`:2432-2449`) reads inline. `bytesOf` finds no whole, total > 20 MiB, and returns `bytes: null`. A failed reading "N bytes in 3 parts, over the 20 MiB" is promoted.
- `readHeld` could replace it (`#wantedTheWhole`) once the whole is held, but nothing ever makes the whole.
- OCR, PDF member, scanner (F3a), safe view, vouch box and `op=capture` also find nothing.

**(c) Permanent.** The page shows the failed reading; no action is offered.

**(e) Test.** Upload a 40 MB body (5 parts) through the real door with real `putFromParts`. After the answer, one alarm must hold the whole and `readHeld` must make a reading with text.

**(f) Owner.** capture (use the `keepLater` arm as `acquire` does) and control-plane (defer `readUploaded` for large files).

**(g) Why tests miss.** R86's tests use 12 MB uploads. No upload over 32 MiB is in any fixture.

### F3. Every lookup keyed by a whole sha treats a multipart capture as "not held / no home". Systemic. Lookup returning null is CERTAIN.

- **Owner of the fix: provenance.** Provenance should resolve a whole sha through a document that states `parts`, once, at promotion, for example an index table or a virtual register row. Then all callers are right at once.
- Otherwise each module needs its own R81.
- The same assumption is also made by raw SQL on `register`: money:524, monitoring:1288/1502, actions:1255/1407/2384, action-records:223, content:376, retrieval/frontier:191, retrieval-browse/find:79-84, capture-requests:567/1538, case-authoring:2033.

**Consequences, with what I read:**

- **3a. file-safety and the scanner. Live effect PROBABLE.**
  - `file-safety/index.mjs:281-290`: `#parts` goes through `#home` (null), so the scan target is `{parts: null}`. The scanner reads only the whole key.
  - A multipart capture with no whole (over 32 MiB while the keep is pending, or forever for F2 uploads) gets `not_scanned: NOT_FOUND`.
  - `#due` (`:939-945`) counts only notes with `result <> 'not_scanned'`, so the file is re-sent every batch forever. One note is written each time (unbounded growth).
  - `#held` (`:261-277`) skips the viewer's sight check when `home` is null. A multipart capture in a private document is then served to any non-denied viewer: a confidentiality gap, not a loss.
  - `acquisition/unpack.mjs:833` has the same shape for archives.
  - Test: a 36 MiB (16+16+4) file in a private project. Another member's `openoriginal` must be refused and the scan note must be a verdict, not `not_scanned`.
- **3b. Safe view never made. Code CERTAIN, race PROBABLE.**
  - The receipt that queues the render is written before the keep (`acquisition/index.mjs:1364`, keep at `:1569`).
  - `#render` (`file-safety/index.mjs:866-872`) finds `#look` null while the whole is absent and sets `render_state='failed', NOT_FOUND`. Failed is never re-queued.
  - Test: a 40 MB capture whose keep is done after the render poll must end with a safe view.
- **3c. Monitoring. PROBABLE (rest of the tick not read).**
  - `monitoring/index.mjs:1285-1291` answers "the served bytes are not registered under this record" for a changed multipart capture and sets `capturedSha` null.
  - `subjects()` (`:1498-1512`) joins `register`, so multipart versions drop out of the address's version chain.
  - Test: a monitored PDF that grows from 5 to 12 MB must have 2 chain entries.
- **3d. Tasks. PROBABLE (enqueue condition not read).**
  - `tasks/index.mjs:349-356`: a queued `authority-undetermined` event for a multipart capture has no home and waits.
  - It is tried 8 times (`TASK_DRAIN_RETRY_LIMIT`, `:174,1181`) and then never again. The member never gets the task.
- **3e. Citing or basing on a passage of a PDF over 8 MiB.** Read: citation/index.mjs:440-455 (`FOUND_MALFORMED`, missing `document`), citation/recorded.mjs:149, lines:415, events:275, attestation:320. CERTAIN for the lookup and the refusals in these five.
  - These are loud but permanent refusals with misleading wording.
  - Same lookup, PROBABLE consequence: standards:576 (partly guarded), duties:349/639/671/914, workbooks:125, sources:711, docket:307, local-facts:214, people:260, progressions:1227, queue-producers:593/693, machinery-producers:397, notice-producers:914, wiring.mjs:297, store-door/pull.mjs:111.
- **3f. Actions. CERTAIN.** `actions/index.mjs:1255`: a correspondence `artifact_sha` that is multipart is refused `CORRESPONDENCE_REFUSED` ("does not resolve in the register"), advising "capture it first".
- **3g. Search.**
  - `retrieval-browse/find.mjs:79-84` resolves a scope to register rows, which are PART shas for a multipart document, while text and units are keyed by the whole sha. PROBABLE: a project-scoped find skips large documents without saying so (I did not read `finder.find`).
  - `retrieval/frontier.mjs:191` withholds any capture with no register row, so the list of readings that need re-extraction never shows large PDFs. CERTAIN.

**Common test.** Build the capture by the real chain (acquire a 20 MB source in 3 parts, promote with a parts-only register as the screen does). Every caller above must answer as for a 5 MB capture.

**Why tests miss.** Suites register one row per capture. Nothing builds the parts-only register the screen builds.

### F4. A failed reading made for a transient cause is final: `READING_HELD` blocks every later read. Silent, permanent. CERTAIN.

**(a) Entry.** Any capture read while the store, a worker or the object hiccups: an R2 read error, PDF or OCR member down, an exception in an entry.

**(b) Fault.**
- `reading-pipeline/index.mjs:1458-1461` (`bytesOf` throws, giving `why: evidence_store_read`), the entry-throw branch, and the tier2/3 failure notes all write a failed reading.
- `extraction.readHeld` (`:655-662`) replaces a stored reading only if `#wantedTheWhole`, which is the three multipart sentences (`:707-717`).
- Every other failed reading answers `READING_HELD`, and `plane/pending.mjs:74` counts that as ended.
- A scanned PDF read while the PDF member was down stays `tier3_candidate` until a member presses the manual re-read (`op=pdfstructure&ocr=1`), which she is not prompted to do.

**(e) Tests.**
- `evidence.get` throws once during `readHeld` of a 3 MB PDF. The alarm 60 s later must make the reading.
- PDF member 503 on a scanned 5 MB PDF, then healthy. The next alarm must re-read.

**(f) Owner.** extraction (replace a reading marked transient) and reading-pipeline (mark the cause).

**(g) Why tests miss.** R80's tests build only "no reading" and "multipart cap" homes.

### F5. Web capture: outstanding supporting files and a pending render are dropped silently after one hour. Code CERTAIN, member-visible effect PROBABLE.

- The remainder is parked as a capture session (`acquisition/index.mjs:1420-1436,1827-1831`) in the scratch table `capture_sessions` with `ttlMs` = 3,600,000 (`capture/index.mjs:2590-2615`).
- Expired rows are deleted on every save or load, and `liveCaptureSessions` (`:2635`) lists only unexpired ones.
- After 1 hour the outstanding files are never fetched, the "Unfinished" line disappears, and there is no alarm.
- The pending render's run is a promise in a module Map. It is re-rendered only if she presses "Finish it".
- The manifest honestly says `complete:false, outstanding:n` (`subresources.mjs:1307`).
- Test: capture a page with 120 subresources and 30 deferred, then advance 61 minutes. An alarm must fetch them, or the page must say 30 files were not captured.
- Owner: acquisition, capture, plane (use the owed-work ledger as in F1).

### F6. A knock pulled into the record is never read. CERTAIN.

- Entry: the member presses "Move into the record" on an inbox knock (photo or PDF up to 8 MiB).
- `doorbell/index.mjs:718-745` `#pulledDocument` has no `reading`.
- `store-door/pull.mjs` promotes it, and `extraction.projectPromotion` (`:733`) skips a document with no reading.
- `inboxpull` calls no `readHeld`, and no pending entry is made. This is the INFO-2026-0080 photo case; N5 is only a manual repair.
- Test: pull a 3 MB text-layer knock PDF. The document page must show its reading without a press.
- Owner: store-door and control-plane (read after pull), with extraction.

### F7. Office, ODF and CSV text over 20 MiB is refused as "undetermined", permanently. Stated. CERTAIN (known as COFF-6, deferred).

- `ooxml.mjs:114-155` `sizeGuard` refuses when declared uncompressed text-part bytes exceed 20 MiB. It is used by docx, pptx, xlsx (`formats-xlsx.mjs:831`), csv (`csv.mjs:513`) and odf (`odf.mjs:1599`).
- Result: no text, an `over_size_bound` marker, no streaming reader, no re-read path.
- Test: a 25 MB xlsx whose declared text is 30 MB must yield text, or a stated pending reading with an action.
- Owner: ooxml, formats-xlsx, csv, odf.

### F8. Only about the first 512 KiB of a long document's text is indexed, also in `readHeld`, where there is no wire to protect. Stated, permanent. CERTAIN in code.

- `reading-pipeline/index.mjs:23-45,848-880` `textUnitsFor` applies `ACQUIRE_TEXT_UNITS_BUDGET` = 512 KiB. It was meant to keep the acquire answer under `INLINE_MAX`.
- Units over the budget are named as skipped runs. `readHeld` (`extraction/index.mjs:670`) and re-read use the same function.
- A 1,000-page packet is searchable only to its first ~100–250 pages. `words_read` and `words_total` are stated, but no op indexes the rest.
- Test: a 400-page text PDF (3 MB of text) with every page findable.
- Owner: reading-pipeline (budget for the wire only), with extraction's index bound (`extraction/index.mjs:47-48`).

### F9. OCR stops at 24 pages per request, and the rest waits for a manual re-read. Stated. CERTAIN.

- `reading-pipeline/index.mjs:326-350,384-386`: `OCR_INVOCATIONS_PER_REQUEST` = 24, one page per call. A 100-page scan is stored with 24 pages read, `tier3_candidate: true` and a note.
- No alarm continues it and no queue item is raised. The re-read (`op=pdfstructure&ocr=1`) does 24 more pages per press.
- In `readHeld` the same cap applies, although an alarm has no 32-invocation request limit.
- `pdf-worker` declines over 16 MiB (`pdf-worker/src/index.mjs:76,169`, `over_envelope`).
- Both workers and `extraction.pdfStructure` (`extraction/index.mjs:~1495`) read the whole key only. A capture with no whole answers 404.
- Test: a 60-page scanned PDF (6 MB) through acquire and the alarm must have all 60 pages read, or show "36 pages not read yet" with the act.
- Owner: reading-pipeline, extraction, plane.

### F10. Whole objects up to 256 MiB are loaded into one object's memory by several readers. Crash/restart loop. PROBABLE (extends the C5a hypothesis H; no workerd here).

- Readers that load the whole object: `bytesOf` (`reading-pipeline/index.mjs:1432-1436`), `file-safety #bytes/#lookAt` (`:322-360`, on every grade call for a PDF or Office file), the OCR and PDF members, and `extraction.pdfStructure`.
- A whole made by `putFromParts` can be 256 MiB.
- An out-of-memory kill returns nothing, so each pending retry is spent. After 5 crashes the entry is dropped (F1).
- Test (L, workerd 128 MB): a 100 MB held whole PDF. The alarm must survive or defer with a visible reason.
- Owner: reading-pipeline (size gate that defers), plane, file-safety.

### F11. ZIP intake: events stop at 8 attempts, and budget stops wait for a member, with no notice. PROBABLE.

- `plane/unpack.mjs:19,30`: `UNPACK_RETRY_LIMIT` is 8, about 2 hours. The event stays queued and `wake` is null.
- `acquisition/unpack.mjs:604-640`: a stop on the tree or daily budget leaves entries `waiting` and enqueues no continuation (only `stoppedForCall` does).
- The file's grade shows `archive_waiting` only on opening.
- Owner: acquisition, plane.

### F12. Reading migrations (N26 docx, N439 pptx) skip readings silently. Low. PROBABLE.

- `extraction/index.mjs:1380-1389`: a candidate whose bytes are "not held" is returned in `skipped`, and the cursor moves on.
- The drain loop (`startMigrations`, `:1316-1331`) discards that result.
- Owner: extraction.

## Paths checked and found safe

- **Size cap (acquire, upload):** a fetch or upload over 256 MiB answers `TOO_LARGE` 413 (`acquisition/index.mjs:1214`, `capture/index.mjs:696`).
- **Multipart `acquire` up to 32 MiB:** `keepWhole` is awaited; failure is `CAPTURE_NOT_KEPT` 502 in words with nothing filed.
- **`acquire` over 32 MiB:** `putFromParts` is awaited within `bound - 5 s`, else `keepLater`. C5c is done for `acquire`.
- **`PENDING_RENDERS` loss:** handled (re-render, `finishRender :1869-1892`; C13b done). Only "never pressed" remains (F5).
- **`record-core.putFromParts`:** one part in memory, digest verified, aborted on mismatch or missing part, `already` when held. R88 ranged `get` validates its range and only small heads use it.
- **File-scanner:** handles `parts` targets correctly when given them (`store.mjs:31-85`). `SCAN_MAX_BYTES` equals `CAPTURE_MAX`.
- **Doorbell knock size:** the 8 MiB cap is one part, and over it answers 413 to the sender. Pull uses `homeOf` on a single-part sha, correctly (but see F6).
- **Web subresource caps:** `CAP_REACHED`, `BUDGET_EXHAUSTED` and `DEFERRED` are recorded per reference and in the manifest. A primary over 8 MiB is stated.
- **Tier-1 PDF reading:** no page cap and no time cap. Inner decode bounds are stated markers.
- **Safe view:** truncation at 500 pages is recorded (`x-truncated`).
- **sheet-worker:** its bounds answer `NOT_RECOMPUTED` in words.
- **doc-clean (16 MiB) and image-cover (32 MiB):** both refuse in words on a member's own act.
- **ZIP entries:** each `not_filed` has a named code; each `waiting` has `waiting_on`. Archive limits refuse in words.
- **Email attachments:** the product has no email intake.
- **monitoring:** unreachable counts surface a source that keeps failing.
- **host-governor:** refusals answer at once with `retry_after_ms`.
- **In-memory work:** only `KEEPING` (dedupe) and `PENDING_RENDERS` remain; `acquire_stages` is stored since R75. `waitUntil` carries only the read hooks, the migrations (F12) and the scanner mirror (C84).

## Design decision for BOB (one recommendation)

The class has one cause, not twenty. Something owed is held in a request, a memory Map or an expiring or giving-up table, and the register does not carry a multipart capture's whole-sha identity.

My recommendation:
1. **Whole-sha resolution:** provenance owns one resolution of a capture by its whole sha (F3).
2. **Owed-work ledger:** plane's `keeps_pending` becomes the single owed-work ledger.
   - An entry ends only when the work is done, or a member is told in the queue; never by a count.
   - The ledger is readable by an op and shown as a queue item.
3. **Caps:** every cap that returns null or failed either defers into that ledger, or says on the document page what is not read and offers the act.
   - The caps are `MULTIPART_READ_MAX`, the 512 KiB units, the 24 OCR pages, the 20 MiB text bound and the 16 MiB tier-2 limit.