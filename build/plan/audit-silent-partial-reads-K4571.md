# Audit: silent partial reads in Civicsmith (branch tranche/T51, read-only, 2026-10-22)

Bob's rule (K4571): never silently scan. Paths are under /home/user/bio/bio-plane/src/ unless they start with another module's directory.
Verdicts: SILENT / STATED / FINISHED-LATER. Everything below was read in code, not run. "Not established" marks what I could not confirm.

## 1. The SILENT rows, ranked by how likely a member hits each

### S1. The text index and answer bounds (the known K4571 case is far wider than plain text)
- Module: reading-pipeline, extraction, retrieval, screens-inquiry. Fix owner: extraction (index segments), reading-pipeline (grain), plane (continuation), screens-inquiry (words).
- reading-pipeline/index.mjs:30-36, 879-905. The wire carries at most 512 KiB of unit text, each unit charged 128 B extra, so about 4,064 units. This path reads a document at the door: any non-PDF up to 20 MiB, and any PDF up to 2 MiB (control-plane/index.mjs:212-217, 689).
- extraction/index.mjs:47-48, 1068-1073. The index keeps at most 4,096 units and 2 MiB. Deferred readings (`readHeld`, line 708) use this bound.
- The rest is skipped and "named" as runs in `capture_text_skipped`. Nothing ever reads the rest (`readHeld` returns READING_HELD, extraction/index.mjs:690).
- Who is hit, because the bound is per unit, not per file:
  - a DOCX or HTML page with more than about 4,000 paragraphs or blocks;
  - a PDF whose text exceeds 512 KiB, roughly more than 170 dense pages, read at the door (a PDF up to 2 MiB can hold more);
  - plain text, one unit per line.
- Is the member told? No screen draws the skipped runs.
  - The skipped runs and `capture_text_state` appear only in `contentaxis` (retrieval/index.mjs:1604-1645). No screen calls it.
  - `readingFor` (extraction/index.mjs:1140-1190) uses only `unitsOf().units` and drops `state`, `counts` and `skipped`.
  - `unreadOf` (extraction/index.mjs:1201-1207) counts skipped pages as read.
  - The Document screen shows text state "full" with nothing drawn (screens-inquiry/document.mjs:226, 247). The only trace is a numeric line "Read {read} of {total} words" (`screen.document.text.read`, document.mjs:248; capture.mjs:187). It never says "partial".
  - The Capture screen shows the same line or "full" (screens-intake/capture.mjs:187-191).
- Fix shape: put the index state, bound and skipped runs into the reading op and draw them as "partial: these pages or paragraphs are not searchable or citable" on the Document and Capture screens, using a new word key. The continuation is plane `reading` by cursor. This bound is not a platform limit (a chosen figure from the M-20 and REC-91 measurements, plus the 1 MiB INLINE_MAX for the inline path). It should stay in some form, but it must be stated.

### S2. One unit per spreadsheet sheet, or per huge paragraph or line, cut at 128K characters
- Module: reading-pipeline, extraction, csv-reader and the office readers. Fix owner: reading-pipeline (grain: split a sheet into row-range units) and extraction.
- A CSV, XLSX or ODS sheet is ONE unit (csv-reader/index.mjs:790-798; `allUnitsOf` sheets arm, reading-pipeline/index.mjs:871-896). The unit is cut to CAPTURE_TEXT_UNIT_CAP = 128 Ki characters (reading-pipeline/index.mjs:40, 893; extraction/index.mjs:1068-1076).
- So passage search and citation reach only the first 128K characters of each sheet. A 1 MB CSV is about 12% searchable.
- The same cut hits one very long paragraph or line (minified JSON, one-line text, one-paragraph exports).
- The cut is stored as `capture_text.truncated` and returned as `text_units[].truncated`, but no screen draws it. The only grep hit for "truncated" in document.mjs is revisions (line 767).
- The content-axis state stays PRESENT when units were only cut: observeIndexed (observation-log/index.mjs:451-465) appends it to the detail, but state is `partial` only when `over_bound > 0`. So even the API calls it whole.
- Not established: whether the typed cells (`sheets[].cells`) that find-in reads are complete. find-in has its own bounds (S5).
- Fix shape: row-block units for sheets (reading-pipeline grain), count `truncated` into the `partial` state (observation-log), and draw it (screens). The 128K figure is a chosen figure.

### S3. The Search screen shows a page of results and gives no "more"; it says nothing about unindexed or partly indexed documents
- Module: screens-daily/finder-states.mjs; retrieval.
- Lines 97-99 ask for 50 fields, 200 passages and 50 subjects; lines 116-160 draw them. There is no more-act for these three routes (only browse has one).
- The text says "{n} passages in {m} documents match", where n is the query total but m is counted from the first 200 displayed rows (lines 137-152). The second figure is wrong whenever n is above 200.
- A search that finds nothing, or only some hits, never says that some documents are unread, unindexed or partial. The API computes this tally (`captures_counted` vs `captures_in_scope`, query.mjs:1068-1089, MEANING_AXIS_CAP = 500, with `truncated`), but no search screen draws it.
- The n total is stated. The cut is not.
- Fix shape: a "show more" act via cursor, m taken from the query's own document count, and one line "N of the documents in scope are unread or only partly searchable" from the axis tally (screens-daily and retrieval).

### S4. The "looked everywhere" claim ignores partial looks
- Module: screens-daily/finder-states.mjs:211-301 (frontier); observation-log vocabulary.
- STATES is limited to LOOKED_FOUND, LOOKED_ABSENT and LOOKED_INDETERMINATE (line 215). `partial` ("we looked and got part", observation-log/vocabulary.mjs:42) is filtered out of the tally line (line 294) and does not block `everywhere`.
- "Somebody has looked everywhere" (`screen.finder.nobody.none`, line 301) can therefore be said while content-level looks are partial (S1, S2).
- Fix shape: add `partial` to the drawn states and to the `everywhere` test (screens-daily, with a word key).

### S5. Find-in (`findin`) covers at most 200 documents per call, 50 items per kind, and 50 cells per matched row
- Module: retrieval-browse (find.mjs, findin.mjs); screens-daily/find-in.mjs.
- retrieval-browse/find.mjs:49-60: FIND_CAPTURES_PER_CALL = 200 documents in sha order; `next` is returned. The act (find-in.mjs:199-221) sends only scope and kinds, so `next` is never used. The scope line states the project's total document count (line 89), which reads as "all searched".
- Items: FIND_ITEMS_DEFAULT = 50 per kind. `truncated` is drawn only for the "term" kind (find-in.mjs:184); people, money, dates, requirements and events show no "more".
- FIND_ROW_CELLS_MAX = 50 (findin.mjs:643-681): `cells_truncated` is not drawn (find-in.mjs:166-175).
- `whole` is false when more documents remain, which only suppresses "Nothing here" (findin.mjs:260). Nothing says "searched 200 of 1,350".
- Also: `ALIAS_PAGES_MAX = 4` (findin.mjs:45, 529-540) is flagged `truncated`, which the screen again ignores.
- Fix shape: loop on `next` or show "searched {read} of {scope}" and a continue act; draw `truncated` for every kind (screens-daily, retrieval-browse).

### S6. Documents refused whole for size or memory: the reason is not drawn on the Document screen (probable; not fully established)
- Module: reading-pipeline, pdf-reader, pdf-worker, office readers. These are platform limits and must stay.
- The limits:
  - WHOLE_READ_MAX = 24 MiB (reading-pipeline/index.mjs:48; tooBig, line 1500) for any format;
  - STREAMED_TEXT_BOUND_BYTES = 32 MiB and the 20 MiB measured bound for office text (ooxml.mjs:114, 191);
  - ODF_REPEAT_EXPANSION_MAX = 262,144 (odf.mjs:228);
  - the PDF memory rule READ_LIMIT_MB = 100 (pdfstructure.mjs:4177-4283), which answers `final` and is never started;
  - pdf-worker declines tier 2 over MAX_PDF_BYTES = 16 MiB (pdf-worker/src/index.mjs:76, 169-175);
  - multipart reads over 20 MiB (MULTIPART_READ_MAX, reading-pipeline/index.mjs:44).
- The reading itself states the reason (`failure: final`, `why`, an `over_size_bound` marker).
- The Document screen derives its text state only from `text_units` and `unread_pages` (document.mjs:224-226). A failed reading has no units, so it draws "none", and "none" draws no visible text. I found no screen that draws `reading.why`.
- The over-16-MiB PDF case draws "Partial: pages N have no text" (`screen.document.text.partial`), which blames the pages instead of the size.
- The 128 MB isolate and Cloudflare limits are platform limits that must stay.
- Fix shape: draw `reading.failure` and `why` as the first line of the "Its text" fact (screens-inquiry). Not established: whether `screen.capture` or another screen already shows it.

### S7. The Document screen's lists: links 200, name matches 500, connections 200, themes 20, with no "more"
- screens-inquiry/document.mjs:797 (links, limit 200), 851 (resolutions 500), 852 (connections 200), 953 (themes sliced to 20).
- A web page with more than 200 links (agendas) shows only 200 and no count. A document is not "read" less, but the member can think the list is whole.
- Fix shape: draw `truncated` or `total`, or page by cursor (screens-inquiry).

### S8. Following a Legistar body reads only part, and says so only in the run record
- Module: following/index.mjs:80, 700-760; following/legistar.mjs:69-79; legistar-reader nextPage (line 333).
- BODY_READ_FETCHES = 200 per read. A meeting costs 1 events fetch + 1 items fetch, plus one votes fetch per item, so 200 fetches cover only a few dozen meetings.
- The events and matters addresses are read once. `nextPage` and `$skip` (1,000 rows per page) are never followed.
- When the fetch limit is hit, `truncated: true` goes on the read record (line 753). I found no screen word for it. Not established: the follow status screen.
- Fix shape: continue by cursor at the next tick (FINISHED-LATER) and show "read N of M meetings" (following, with a screens word). The 200 is a chosen figure and can be raised or continued.

### S9. At most 16 documents of one promotion are followed for reading
- control-plane/index.mjs:2566 (`entries.slice(0, READING_FOLLOWED_MAX)`, 16); line 217.
- Documents 17 and beyond (many files of an archive or a batch promoted together) get no reading and no owed row; nothing sweeps them (plane/pending.mjs has no sweeper).
- Per document the screen does say "Unread: this copy has not been read yet" with "Read it now" (document.mjs:459-464). The batch answer says nothing.
- Fix shape: owe the rest (`pendSha`) instead of slicing (control-plane).

### S10. Web capture subresources: skipped parts are recorded but no screen words them
- Module: subresources.mjs:51-62; browserrender.mjs:211-230; render.mjs:346-368; acquisition/index.mjs:1852-1856.
  - SUBRESOURCE_CAP = 400 bodies per capture.
  - SUBRESOURCE_MAX = 8 MiB per body.
  - SUBRESOURCE_BUDGET = 64 MiB per capture.
  - CSS_MAX_DEPTH = 2: a depth-2 stylesheet is captured but not read for its own url()s.
  - A primary page over 8 MiB, or held in parts, is not walked at all (SUB_PARSE_MAX).
- Each skip is recorded with a reason (`body_unavailable`, `TOO_LARGE_TO_PARSE`) in the capture's data. I found no screen text for it (the Capture screen words cover only the visitor-copy refusal).
- The page text is unaffected; the fidelity of "the page as a visitor saw it" is. The 256 MiB total (CAPTURE_MAX, acquisition/index.mjs:354) is refused with 413 `TOO_LARGE` and stated.
- Fix shape: one line on the Capture result and the Document: "N of M supporting files kept" (acquisition and screens-intake). The 400 figure is, by its own comment, a chosen cap, not a platform limit.

### S11. Pickers and lists that stop at a fixed limit with no "more"
- Document pickers (`heldcaptures`, limit 200 or 500):
  - screens-investigate/calculation.mjs:15, money.mjs:21, grouprules.mjs:21;
  - screens-publish/docket.mjs:20 ("the document it rests on");
  - screens-action/matter.mjs:156, 177 (the same 200);
  - screens-daily/doors.mjs:17 (500).
  - person.mjs:24, standard.mjs:33, proceeding.mjs:26 and timeline.mjs:24 use the same 200; their files mention `truncated`, which I did not verify covers the picker.
- Inbox: screens-intake/inbox.mjs:7 (200 knocks, no "more").
- Question choosers: `type:inquiry` limit 200 (screens-daily/find-in.mjs:25 and 116, screens-intake/capture.mjs:21).
- "Is this address already held": screens-intake/capture.mjs:633 looks in only the first 1,000 held documents.
- Fix shape: `next` cursor, or "showing N of M" (each owning screens module).

### S12. Corpus export renderings stop at 5,000 records per source; the file carries no marker
- corpus-export/render.mjs:33, 76-80, 139, 357; corpus-export/index.mjs:183-187. RENDER_MAX = 5,000 records per source.
- `truncated` is a field of the API answer only, and not of the rendering body (the open-standard file, which is what an outside party receives). No screen calls `exportRendering`.
- The table export is paged with `next` (tables.mjs:28, 97) and is complete.
- Fix shape: put the cut into the rendering body (as a note field per standard) and page it (corpus-export).

### S13. The staff-report reader cuts the recommendation at 600 characters
- doctypes/staff-report.mjs:268-275: reads until the next heading but stops at 600 characters. The cut is not flagged (the entity is a reading of the recommendation).
- Fix shape: flag `cut` on the field or lift the limit (doctypes).

### S14. Calculation patterns gather at most 2,000 units and use the capped count as the denominator
- calculations/patterns.mjs:16, 67, 85, 152. The comment says "the rest wait for the next run's cursor"; I found no cursor in these paths.
- The denominator `n` is then rows.length, a sample shown as a census. It needs more than 2,000 decided transitions or flow instances to hit.
- Fix shape: state `of_total` and `capped: true` in the denominator (calculations).

## 2. STATED, FINISHED-LATER and platform rows (no fix needed except where noted)

| Module | file:line | Bound | What happens to the rest | Told? | Verdict |
|---|---|---|---|---|---|
| ocr (reading-pipeline) | reading-pipeline/index.mjs:343, 375-410 | 24 OCR calls per request (Cloudflare 32 invocations) | Rest read on later re-reads (extraction R35 seeds), owed with `kind ocr` | Pages named in the OCR note; Document says "Partial: pages N have no text" and offers OCR (document.mjs:247, 468-475) | FINISHED-LATER and STATED. Platform limit. |
| ocr-worker | ocr-worker/src/contract.mjs:52, 122; member.mjs:121 | Frame 61.3 MB, picture long edge 4096 | A page needing a bigger frame is declined | In `loop.refused`, pages named | STATED. Platform limit. |
| AI page transcription | agent-worker/src/ops.mjs:88; plane/transcribe.mjs:49 | 8 pages per act, 5 MiB per image | Rest left unread | "up to 8" in the act text; done line names pages (`screen.document.pagetranscribe.done`) | STATED |
| control-plane reading | control-plane/index.mjs:212-217, 689-702 | PDF over 2 MiB, or under 8 s of the 25 s door left, is read after | Owed in the plane ledger | `reading_pending`, `screen.document.text.unread.next` | FINISHED-LATER (but see S1 for what the later read covers) |
| capture size | acquisition/index.mjs:354; capture/index.mjs:695, 1287 | 256 MiB per capture | Refused 413 TOO_LARGE with bytes and max | Refusal | STATED |
| archives (unpack) | acquisition/unpack.mjs:31-35, 564-640; ooxml.mjs:265-276 | 100 entries and 64 MiB per call; 1 GiB and 40,000 entries per day; 10,000 entries, depth 3, ratio 1100 | Waiting entries continued by the plane drain (plane/unpack.mjs), or refused by name | `screen.archive.waiting/.notopened/.more`, `refusal.ARCHIVE_*`, each entry "not filed" named | STATED and FINISHED-LATER |
| safe view | file-scanner/src/limits.mjs:17 | 500 pages rendered | Remaining pages not rendered | `screen.open-file.safe.truncated` ("{pages} of {total}"); text cut via `screen.open-file.safetext.cut` (262,144) | STATED |
| file-safety grade | file-safety/index.mjs:69, 366-417 | Files over 20 MiB judged by their start | Marked `tooLarge`, stated unread | Stated | STATED. Platform limit. |
| sheet-worker recompute | sheet-worker/src/contract.mjs:33-39; member.mjs:47-50 | 9 MB unzipped, 250,000 cells, 120 s | Whole recompute refused `OVER_BOUND`; cached values used | Refusal and `NOT_RECOMPUTED` | STATED. Platform limit. |
| calculations | calculations/index.mjs:440-453, 1777, 1897 | 20 MiB / TABLE_MAX_CELLS; saved set above one frozen set | Refused, "Nothing was written" | Refusal in words | STATED |
| strength | strength/arithmetic.mjs:24, 60-80 | Depth 6 | Rated `undetermined_at` with the member named | On the finding | STATED |
| AI runs | run-rules/rules.mjs:168-216; agent-harness/src/harness.mjs:254 | fetches, subsessions, wallclock, mints, pages, proposals | Run ends at the bound | `ai.run.ending.*` (assistant.mjs:177) | STATED |
| contradiction and tensions | contradiction/index.mjs:73-104, 1499-1614 | 2,000 candidates scanned, 50 pairs, 200 referents | `truncated` on the answer | Not established on a screen | STATED at API |
| explore | screens-investigate/explore.mjs:108 | depth 500 and a time budget | `truncated`, `complete:false`, `depth_stopped` | Drawn | STATED |
| publication reads | publication/index.mjs:152-162, 1489-1553, 1666-1675 | 500 editions, 1,000 cited parts, 200 resting findings per capture | `truncated` or `cut` flagged | Screen not established | STATED at API. Rare. |
| standing answers | answers/standing.mjs:32-48, 422-438, 529 | 50 questions per tick; 10,000 ids / keys / captures | Remainder next tick; `partial` flag | Not established on a screen | FINISHED-LATER and STATED at API |
| run-productions ratio | run-productions/index.mjs:74, 978-1019 | 64 documents | `documents_capped` published | No screen consumer found | STATED at API only |
| extraction occurrences | extraction/index.mjs:55, 894-899 | 256 occurrences per entity reference | Rest stored as one unplaced row; connections `occCut` (connections/index.mjs:741) | Flagged in the connections read | STATED |
| desk reads (frontier, lines, browse, monitoring) | retrieval/frontier.mjs:54-57; lines/index.mjs:34-35; monitoring/index.mjs:262-264, 2863-2896 | pages of 200 to 2,000 | `truncated` and `next` on the answer | Most screens draw "more" (browse finder.mjs:226, queue.mjs:322, held.mjs:146) | STATED |
| docket read | monitoring/index.mjs:289 | 8 MiB answer | `unreadable` | Stated | STATED |
| link sweep | link-sweep/checks.mjs:52 (sources 20, seeds 10, paths 20) | Scope and budget fixed at ratification | n/a | Shown before ratifying (`screen.watching.sweepdef.rat1`) | STATED |
| plain-text translation, text check | plane/ask.mjs:457; agent-worker/src/draft.mjs:65, action-drafts.mjs:60 | 20,000 characters | Refused before any account is read | Refusal | STATED |
| PDF object limits | pdfstructure.mjs:2866, 3723-3726 | Form depth 8, object window 4 MiB | Page marked `image_unread` or undetermined | Pages show in the unread list | STATED |

## 3. Adjacent findings (not numeric bounds, outside the count)
- HTML visible text keeps only `<main>` and `<article>` contents when either exists (reading-pipeline/index.mjs:1050-1070, 1008-1018) and drops navigation and furniture by name. Text beside them is neither read nor said. Not established whether the member is told.
- Also in visibleTextOfHtml: `head`, `script`, `style` and `template` drop "to the end" when unclosed. HTML allows an omitted `</head>`, which would drop the whole page. Not tested.
- Platform limits that must stay, from the table in section 2 and S6: the 128 MB isolate (WHOLE_READ_MAX, STREAMED text, PDF memory, ocr frame), the 25 s door and the 10,000-subrequest plane limit (control-plane:563). They must be stated (S6), not removed.

## 4. Summary

SILENT rows: 14 (S1 to S14). Ranked by how likely a member hits each in a real investigation:
1. S1 the 512 KiB / 4,064 unit and 2 MiB / 4,096 unit text bounds: any long Word document, PDF over about 170 dense pages, or long web page, not just 12 MB text.
2. S2 one-unit sheets and long lines cut at 128K characters: every budget CSV or workbook.
3. S3 the Search screen: no more-act, wrong document count, no word on unread or partly indexed documents. Every search.
4. S5 find-in: 200 documents per call, `next` ignored, 50 items per kind. Any project over 200 documents.
5. S4 "looked everywhere" ignores `partial`.
6. S6 the size and memory refusals are not drawn on the Document screen. Any 24 MiB-plus budget PDF.
7. S11 pickers and the inbox at fixed limits.
8. S7 links 200, connections 200 on the Document screen.
9. S8 followed Legistar bodies: 200 fetches, no `$skip` paging.
10. S9 the 16 documents followed per promotion.
11. S10 subresource skips.
12. S13 the staff-report 600-character recommendation.
13. S12 corpus export 5,000-record cut.
14. S14 calculation patterns 2,000 units.

S1, S2, S4 and S6 share one fix: make the reading say its own completeness (index state, truncated units, failure reason) as one `completeness` fact that the Document, Capture, Search and "looked" screens draw, then page the remainder.

## 5. Could not establish
- Whether any screen draws `reading.why` or `failure: final` (S6); whether the follow screens draw `truncated` (S8); whether contradiction, publication and standing-answer `truncated` flags reach a screen; the typed-cell completeness for workbooks (S2); whether person, standard, proceeding and timeline document pickers handle `truncated` (S11); whether the patterns cursor (S14) exists elsewhere.
- Nothing was run and no tracked file was changed.
