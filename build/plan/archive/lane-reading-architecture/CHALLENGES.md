# Why reading keeps failing (READING-ARCHITECTURE, deliverable 3)

**Status** · Draft by READING-ARCHITECTURE #1, 2026-10-23, from the evidence at commit 7bb1046202. Decides nothing.

Readers: BOB, and the lane's next deliverable, `OPTIONS.md` (whole architectures), which must remove the classes below by design. Nothing here is a design; where a source proposes a remedy it is marked as the source's. Where this draft adds a reading of its own it says so.

---

## 0. The evidence read

### 0.1 Sources

| Group | Files | Share |
|---|---|---|
| Family reports | `pdf-envelope-T51`, `pdf-architecture-T51`, `envelope-scans-T51`, `envelope-sheets-T51`, `envelope-docs-T51` | E1 (PDF), E2 (scans, images, OCR), E3 (sheets, CSV), E4 (documents, slides, ODF, HTML, archives) |
| Audits and offline passes | the audits of partial reads (K4571 passes S1–S14, F1–F12, V1–V9, C-series) and the offline pass records | E12 |
| Diagnoses | R6 diagnosis files; R7 and R8 diagnosis files (`diagnosis-R7-*`, `diagnosis-R8-*`) | E6 (R6), E5 (R7, R8) |
| Fix rounds | fix rounds 4, 4b, 5, 7 | E9 |
| Fix round 6 and fix round 8 | the plans (round 6 `G1–G57`; round 8 `G91–G122`, `N1–N24`, `F-1–F-7`, `S1–S25`) | E8 (round 6), E7 (round 8) |
| Walk records | `walk-T51-build`, `walk-T51-live`; re-walks `rewalk` and `rewalk4`–`rewalk7` (W2–W7) | E10 (build and live walk), E11 (re-walks) |

### 0.2 How it was read

Twelve helper shares (E1–E12) each read every file in their share whole, to the last line (every source file of the evidence in exactly one share), and wrote a structured report (instances, root cause as the source states it, evidence grade, classes, requirement or platform fact, the source's proposals, questions for Bob). Three syntheses then merged them on one fixed class list C1–C15: S1 (E1–E4, E12), S2 (E5–E8), S3 (E9–E11). This document merges the three. The writer read the three syntheses whole; the E-files were not re-read; the lane read this file whole. Citations to code lines are the sources', not re-verified here.

**Ids.** Ids are the sources' own. Because the namespaces collide (an `S-n` is a scan defect in E2 and a sheet defect in E3; `F-n` is an architecture finding in E1 and an audit finding in E12), every id carries its E-file in brackets: `N4 [E1]`, `S-22 [E3]`, `X2 [E4]`, `F1 [E12]`, `R8r-A [E5]`, `F-MEM-0111 [E6]`. `G`-ids are the fix-round causes (G1–G122); they are shared across files and carry no bracket. The `N`-ids of E1 and the `N`-ids of round 8 (E7) are the same findings; likewise the scan `S`-ids of E2 and E7. `R-n` in E11 is a re-walk finding (W2–W7 are the re-walks).

### 0.3 Evidence grades

- **live**: the deployed copy `biosmoke8`, walked by a small number of walkers. No walk was ever alone on the copy (E11); two walkers shared the one Durable Object in every round, and from W6 a proxy added 0.3–1.4 s a call.
- **plat**: measured locally at the platform's shape: raw workerd with R2, Miniflare with real Durable Object SQLite, or a node child capped at the platform heap running the real plane.
- **node**: plain node; times are node times, RSS is node RSS, not workerd heap.
- **reasoned**: read in code, or a hypothesis; not run.

### 0.4 How little is live, and as of when

- Almost every number in the family reports (E1–E4) is **node**. The live and platform-shape numbers are collected in §4 and are few.
- The walked scale is small against Bob's bar. Largest real PDF 1,354 pages (23 MB), walked to page 9 only; largest text 12 MB and 24 MiB; largest CSV 17 MiB; largest workbook 221,376 cells; scans of 30 and 60 pages (clean ImageMagick renderings); the largest non-PDF real read a 2.3 MB file (E4). **No file above about 41.5 MB, no document above 1,354 pages, no image other than photographs under 4,096 px, no archive, no 100 MB, no 5,000-page, no 50 MB sheet, no 500 MB archive has been read live.** Whether the present design can read such a file at all has no measurement (S3).
- **Memory.** The syntheses disagree on what has been seen live. S3 (rounds up to W7) says no memory kill has ever been evidenced live: `interrupted` 0 in every round, `last_mem` 0 or NULL, because workerd's `process.memoryUsage()` returns zeros. S2 records one live `exceededMemory`, on 2026-10-23, an ODS inline read (`R8l-B2` [E5], G122: 37,973 ms wall, 7,462 ms CPU, the sharing alarm run died with it). S1 lists the ODS (`S-2` [E3]) as "cause unknown on platform; kill is a node hypothesis". This draft takes S2's reading as the newer: one live memory kill, the rest local.
- **Statuses are as of their source's date**, not of commit 7bb1046202, and were not re-checked against the tip. E1–E4 are draft plans at base 5ac9380e00 ("open" means open at that base). E8 (fix round 6) is a plan and records no post-round result. E6 (diagnoses of 2026-10-22/23) says to re-check against the tip before writing "open"; several items it lists as open were fixed later the same days (for example the `op=reading` page size, the scheduler merges). The re-walk statuses end at W7 (about 2026-10-22); the round 8 items are "ran", "code" or "pending" with no job.
- The recurrence data are therefore the stronger evidence in this document; the sizes are the weaker.
- **Other places the syntheses differ.** (1) Scanner: S3 dates the missing signatures from 2026-10-15, S1 (FR-SCAN, E4) says none ever; both agree nothing has been scanned. (2) Storage: S3 finds no instance of a row-size error in rounds 4–7; S1 and S2 record `SQLITE_TOOBIG` (G41, round 6) and the ODS/DOCX cliff; the difference is the share, not the facts. (3) Plane idle is 86, 85, 50, 49 MB across sources (as built vs ASCII bundle; §4). (4) Scheduler: S2 says the alarm was never lost in round 8 and the failure is slowness; S1 and S3 also list the round 5–6 dead alarm; both are true at their dates. (5) The 12 MB text's 30 s first tick: S3 "not CPU-shaped, unknown"; S2 "partly a measurement artefact (`last_ms` from alarm start)"; unresolved.

---

## 1. The short answer

Reading does not fail in a hundred separate ways. It fails in the same few ways in every file family, and each fix has so far been a bound or a patch on the path the last walker used. Beneath the seventeen classes sit these root mechanisms.

1. **The cost of a step is the file's, not the piece's.** A tick re-pulls, re-parses or re-inflates the whole file to produce one piece, and holds the file or its text two to six times, inside a 128 MB isolate that the plane already fills to about 86 MB as built (about 50 MB with an ASCII-only bundle), so a read has roughly 40 MB, not 128. (C1, C2, C14)
2. **Owed work is registered after the answer, by a hop that can fail.** The register is written by whichever path computed the remainder, after it replied, by a client request that can be cancelled; one production path never registers at all. A scan stops at page 24 with nothing owed, three times in five rounds. (C4, C6, C11)
3. **One serial object and one serial alarm carry everything.** Reading, screens, scans, renders and the queue share one thread; a synchronous stretch or a long await blocks them all, and the scheduler's failures moved from "lost" to "slow and unseen" (gaps to 551 s with `stale` false). (C5, C14)
4. **Bounds are set per module, in the wrong unit, below Bob's bar.** Nine byte ceilings sit on the path of one PDF, between 2 MiB and 256 MiB; the largest file actually read is 24 MiB against Bob's 100 MB, 50 MB and 500 MB; declared or stored bytes stand in for allocated memory and work. (C7, C1, C12)
5. **Many paths do one thing.** Six copies of "read the whole PDF", six signature sniffers, three CSV parsers, four size checks, four ways in; a fix lands on the path the test used, and identity (whole, part, bundle, register row) is decided in several places. (C8, C9, C3)
6. **Tests and instruments do not see the platform's shape.** Node and Miniflare enforce no memory, no CPU, no clock freeze and no alarm semantics; fixtures are the builder's kind of file; workerd reports zero memory. A fix cannot be seen to work until a walker meets the next layer: "not a single failure in this share was caught by a test before a walker saw it" (E5). (C13, C15)
7. **What the member is told is computed apart from the record.** The reading records `skipped`, `truncated`, `ocr_left`, `failure`, but each screen derives its own state from another field, and "whole" has three meanings. (C11)
8. **Formats, safety and third parties sit outside the reading path.** Only the kinds the test builders made are proven; the scanner runs beside the decoders and has never scanned; some kinds have no decoder at all. (C10, C16, C17)

**What an architecture change can remove, and what only discipline removes.** By design: 1, 2, 5 and 7 (a read whose per-step cost is bounded independent of file size, owed work registered before any answer in one ledger, one read path per kind, one completeness fact owned by the reading), and in large part 3 and 4 (the load moves off the record's thread; bounds stated once per kind in the unit that matters). Only discipline removes 6 and C15 (a harness at the platform's shape, live measurement, an invariant owned by a module and its sibling paths named in every fix); a design can make them cheaper but not unnecessary. Decisions for Bob, not for an architecture, decide C10, C16 and C17 (which kinds are read, what a safety hold does). Unknown causes remain (§5), above all the time between alarm ticks (G70), which no source has explained and on which any scheduler design depends.

---
## 2. The classes

Each class: the mechanism; the instances (id [E-file] · family · what was seen · grade); recurrence (did it come back after a claimed fix); the requirement or platform fact behind it; what the sources propose (theirs, not this draft's). Instances are the principal ones; the syntheses list more (all ids are retrievable in S1, S2, S3).

### C1 Memory at size

**Mechanism.** Every reader holds a unit larger than its unit of work (a page, a stream, a CMap, a table, a paragraph list, a whole decoded string), and the same bytes or text are then held several times: bytes, inflated, decoded, parsed, stringified, copied as evidence, bound for SQL. Bounds are set on declared or stored bytes, so a small file allocates far more than it declares: a 204 KB PDF inflates to 200 MB, a 69 KB DOCX declaring 19 MiB kills the object, a 330-byte JPEG declaring 60000x60000 reaches gigabytes. The 128 MB isolate is shared with the plane's idle (about 86 MB as built), the held bytes (up to 24 MiB), the open document and the range; no requirement states that sum, and workerd gives no heap counter to check it.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| F-MEM-0111 [E6], G26, G56 | PDF | 15.9 MB, 1,354 pages: object killed 8 times; first tick 12.4 s at cap 112, peak 126.8–128.0 MB; survives 144 MB, dies at 128/112/96 | plat (raw workerd; node child) |
| G38, F-SHAPE-READING-OP [E6] | PDF, CSV | `op=reading` of a finished large PDF answers 1,328 units = 13.99 MB and kills the object; a 1 MB CSV's reading is 12,872,074 B | plat |
| G37, G40, F-G15-1MB-CSV [E6] | text, CSV | whole-text classification; 1 MB CSV dies at 127 MB: 89.1 idle + 18.6 + 11.4 string + 17.6 copy = 136.7 MB; reading stringified four times | plat |
| R8l-B2 [E5], G99, G122, S-2 [E3] | ODS | 1.03 MB stored, `content.xml` 20.4 MB, 172,302 cells: 37,973 ms wall, 7,462 ms CPU, `exceededMemory`; also killed the sharing alarm run | live (S1 grades the cause "unknown on platform"; see §0.4) |
| X2, X7, X4, X17, X19 [E4] | DOCX, ZIP, safe view | 69 KB DOCX declaring 19 MiB kills the object; 123 KB DOCX with 120 MiB embedding -> 252 MB; archive listing of 2,000 entries 343 MiB heap; `threatOf` over an archive holds 256 MiB | node (V8 cap) |
| N4, N10, N11, N12 [E1/E7] | PDF decoders | 204 KB -> 200 MB inflate (RSS +894 MB); bfrange 16.7 M codes +1.1 GB; a 3 MB decoded page aborts a 128 MB heap; CCITT 8 KB declaring 60000x60000 | node / code |

**Recurrence.** Yes, on a different object each time: PDF (nine causes on one file, BUDGET-2024-APP: C5a, E2, G26, G37, G38, G56, G68, N4, N11), CSV (G40, G41), workbooks (G44), `op=reading` (G38), ODS (G99, G122). The memory fix of R41/R42 was regressed by R82 (found in round 5). The 20/32 MiB office ceilings (K4504) were measured on 600-character random paragraphs and fail on one-cell tables (X2). Image bounds were added on the JPX, PNG and picture routes only (S5 [E2] = N12 [E1]); held cells exist for CSV and XLSX, not ODS, DOCX, PPTX.

**Requirement / platform fact.** Platform: 128 MB isolate shared by everything the object does; Miniflare and local workerd enforce no cap (G27); workerd's `process.memoryUsage()` returns zeros (G69); V8 holds a script as two-byte text if any character is non-ASCII (43.5 MB of the idle, G39). Bob's bar: bounded memory for 100 MB / 50 MB / 500 MB files (K4630, K4628, K4636). Module requirements: pdf-reader R41 (the 64 MB claim is scoped to "up to 16 MB" while 24 MiB is read), R42, R43; reading-pipeline R36, R44; csv-reader R19; ooxml R35 (bounds declared bytes); image-codecs R4, R10; extraction R76, R93, R96–R98. **No requirement states the object's total, including the plane.** Proposed invariants: PDF I4, scans SI3/SI4, sheets J-4, docs I15 ("declared is not allocated").

**Sources propose.** A declared-size check before any allocation on every codec route (E1 D1, E2 A6/A7); streamed capped inflation (E1 A4); one windowed contract for sheets with cells held in the file (E3 E-11); bounds on declared text, objects walked (250,000) and characters held at once, plus a range source for containers (E4 A1–A3); gate on declared unpacked size (G122); ASCII-only bundle (G39); "reading by ranges from the store, never one whole object in 128 MB" (F-7, K4814(9): direction only); the tier-1 PDF parse into `pdf-worker`'s own isolate (E9 E2(f), "BOB's structural option"). ARCH found E1's proposed 118 MB PDF budget sums to 122.

### C2 Work per step grows with the file

**Mechanism.** A tick, request or call does work proportional to the whole file, or to something other than what was counted: every later tick of an office, ODS, HTML or tier-2 PDF read re-opens and re-parses the whole file; `cellsIn` re-walks from byte 0; each OCR page re-reads the whole object; classification runs over the whole text; synchronous stretches (regexes, decoders, `range()`) never yield. Pieces are sized by page count or average bytes, not by the cost of the page. Smaller pieces then cost more in total (parse-total ratio 1.53 / 1.57 / 1.63 at 200 / 100 / 75 pages, G56). Because workerd freezes `Date.now()` in synchronous work (R-CLOCK), no in-code deadline can fire inside such a stretch.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| G56, G68, F-MEM-0111 [E6] | PDF | first tick 11.7 s; 23 MB at 0.77 MB/page gets one page a tick; 22–23 s CPU of 30 (about 7 full parses) | live / plat |
| F-1, F-5, N16, N17, N19 [E1/E7] | PDF | tier 2 parses the whole file twice per escalating tick; each OCR page re-reads the object (up to 24 calls a tick); two owed PDFs thrash one open-document slot, each tick re-pulling up to 24 MiB | code / node |
| X6, X8, X22, X25, X30 [E4] | office, HTML | quadratic `TOKEN_RE`: 953-byte DOCX 8.0 s, 400 KB unclosed tag 20 s; 214,175 paragraphs = 53 ticks; 18 MB-text DOCX 72 ticks; 8 MiB DOCX first tick 13.3 s on a fast machine | node |
| G67, S1 [E2], G97, R8r-A [E5] | scans | 30-page scan upload 42.7 s (`extractread` 39.3 s: 24 serial OCR calls x about 1.6 s inside the request); OCR ticks 29–31 s | live |

**Recurrence.** Yes. The 10 s / 8 s / 500 ms bars exist as test bars (K4670, R93) and were patched file by file: `PDF_RANGE_PAGES` 200 -> 100 + 1.3 MB, parse bar 1.5 -> 1.7 (E1 P3). Ranges (G26) gave 11.7–12.4 s ticks because they were sized by page count (G56); ticks of 29–93 s followed in round 7 (partly a measurement artefact); in round 8 a scan and an ODS held the thread 38–43 s inline. `yieldNow` merged for csv-reader and pdf-reader open (G86), not for `range()`, XLSX, ODS, DOCX, PPTX or classification; G88 yields only between detects, only for plain text; G68's window fix covers text/CSV only; office carries no state between ticks (X8).

**Requirement / platform fact.** K4354 (screens and acts within 2 s; web capture 15 s); K4670 (10 s a tick, a technical call); K4562, K4787 (one core, no load-dependent test); plane R84 (sheets only: "no PDF twin"), R91, R93 (500 ms p95 for cheap reads); csv-reader R20; pdf-reader R43, R45; reading-pipeline R40. Platform: Workers CPU per request "5 min (default: 30 seconds)" on Paid (PLATFORM.md, workers-limits); `bio-plane/wrangler.jsonc:175` sets no `cpu_ms`, so the 30 s default applies by the documentation (not yet confirmed on the deployed copy); 32 invocations per request (not measured on this runtime); R-CLOCK; a bare `await` does not let another request run (G82).

**Sources propose.** A work budget per range in decoded bytes plus objects, at least one page (E1 E1, E4 D1); yields between pages and every 64 Ki tokens (E1 E2, E4 D2); tier 2 asked for the range only (E1 E3); one `window(cursor)` contract for every sheet kind (E3 section 6); a range source over the zip directory for office (E4 A1); a linear tokenizer (E4 B10); assert counts, not time; explicit `cpu_ms` after measuring (E1 E8).

### C3 Piece boundaries and reassembly

**Mechanism.** The answer for a piece has a different shape from the answer for the whole, and the consumers that join pieces do not know where the cut was. A block is a presentation device (a header line repeated, empty cells dropped, row numbers absent) that leaks into consumers. A unit is at once the unit of citation, of indexing and of the wire, under fixed caps (128 Ki characters, 4,096 units, 512 KiB wire, 2 MiB index), so a unit over a cap is cut in one path and carried whole in another. The "pieces" path was added as a second reader beside the whole read with a thinner answer, and the whole-read answer was the one the tests compared. "Pieces equal whole" (R35) became unstatable and nothing replaced it.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| N3 [E1/E7] | PDF | every stored PDF reading is the first range's alone: `title`, `page_boxes`, `container_extent.images`, `text_glyphs`, `words_total` lost | ran (node) |
| N15 [E1], G15, G71 | PDF | a page over 128 Ki chars cut in a whole read, carried whole in pieces, writer then slices (cut text not searchable); `words_read` stuck at the first piece's | node / live |
| S-3, G64, G100/G101, R8r-C [E3/E5] | CSV | 18,098 data rows ingested as 18,101 then 18,100: the header repeated at the head of each 128 KiB block, `heldTextAt` joins units with "\n", two phantom rows at 7,317 and 14,636; table sha differs from the tab twin | live + plat |
| G13, G14, F-12MB-TEXT [E6] | text | plain text with no blank line makes each line a unit; 4,096 units / 2 MiB kept; last line (`ENDMARKER`) not found; 117,316 units skipped | live |

**Recurrence.** At every level. G15's fix (row-block units with `lineRows`) was cursor-mode only (S-23); G13/G14 cursor and `completeness` fixed the whole read, the piece side stayed open (N15); the G64 delimiter was fixed in round 7, the repeated header is still open (W7); R41 (blocks with header repeat) was the fix that created R8r-C; header repeat had already been seen as a words miscount (F-WORDS) and fixed there while the join stayed. The G71 override works for ranges while N3 shows the rest of the reading is still piece 1's.

**Requirement / platform fact.** K4571 (never a silent partial; searchable to the last line); K4636 (sheet text searchable to the last row); reading-pipeline R15, R22, R33, R35, R40 ("no page lost or doubled"), R41; extraction R22, R90, R91; csv-reader R16. Platform: SQLite value 2,098,176 B; 8 MiB stored part. Proposed in all four family plans: invariant "pieces equal whole" (E1 F2, E2 SI10, E3 J-6, E4 I6/A7).

**Sources propose.** "A reading in pieces equals the whole read" as an invariant and test (E1 F2); row-range units from `lineRows`, tables built from bytes, never from presentation text (E3 J-13; G100/G101); "chunk, never cut" (E4 A7); page boxes and image placements in their own rows (E1 F1). E1's own view: make ranged pieces the only read (whole = one piece).

### C4 Owed work not durably registered, or registered by a later hop that can fail

**Mechanism.** When a path cannot finish, the remainder is owed only if that path remembers to say so. The register is written by whichever hop computes the remainder, after the answer has left: a client-held request (the screen's `promote`, `followEntries`, `pendSha`), a `waitUntil`, an in-memory map; or not at all, because `Extraction.read` passes no `owe` hook and no production code does (the hook at `reading-pipeline/index.mjs:2646, 2707` is called by tests only). When the hop is cancelled, throws or meets a reset stub, nothing exists to heal from; the failure is swallowed (`catch {}`) and `reading_pending:true` is still returned. Each new door is a new place to forget. The audit: the work was "held in a request, a memory Map or an expiring or giving-up table".

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| scan30; R8r-A, R8l-A2 [E5]; I-4 [E2]; N2 [E1]; G96/G97; R-12 [E11] | scan | 1.9 MB 30-page scan stops at page 24: `completeness whole 24`, `ocr_left {24, 6}`, no ledger row, unchanged 90 minutes later; the client cancelled `promote` 497 ms in; four cancelled promotes in 2 hours | live (reproduced locally to the digit) |
| F1 [E12], F1 [E9], R-2 [E11] | PDF | a deferred reading abandoned after 5 tries (about 4 minutes) because `NO_HOME` before promotion counted as an attempt; `fix4-r75` pinned the fault; 0111's row `attempts 0 why NO_HOME` unchanged 30 h | live + plat |

**Recurrence.** The clearest "fixed on one path" class. F9 was fixed on the PDF ledger, E6 on promote only, scan30 returned on upload; S4 was hidden by a screen fix. Registration was repaired door by door (F1, F2, F5, F6, F9, F11, F12; K4487–K4502) and returned at the next (scan30, S1 in pieces, S9, X3, ODS). The round 5 seam test passed because its promote completes; K4806 live reads then found three more uploads whose promotes were cancelled, saved only because they were registered at the upload (G96).

**Requirement / platform fact.** K4487 D1–D6 (D2: no count or clock ends an entry; D3: a reading follows every entry; D5: caps defer or state, never drop); plane R75, R77; reading-pipeline R37 (`owe`); extraction R82; control-plane R123; K4562, K4565/K4566, K4571, K4811(6). Platform: `waitUntil` is cut about 30 s after the response; an isolate holds nothing across restart; a client may cancel a request at any time.

**Sources propose.** One registrar at the source: `owe` before the answer leaves, `readUploaded` writes the `ocr` row, register before the inline read (R8r-A, G96, G98); the audit: provenance owns one resolution and the plane's `keeps_pending` becomes the single owed-work ledger, ending only on done or on a member told, every cap deferring into it or saying what is not read (E12 section 4); a durable attempt record per post-commit step (G54); no OCR in a member's request (E2 C3).

### C5 Liveness: retries, final stops, poison files, the serial alarm, the scheduler

**Mechanism.** Two opposite faults sit on one missing rule. Loops: a kill, a throw or a no-progress tick is classed `transient` and asked again for ever (back-off 15 s doubling to 1 h; the interrupted-run counter counts deaths of the plane, not of the member; a row that kills the isolate never records its attempt and is retried first). Premature stops: a count or clock ends an entry (5 tries, 8 attempts, 3 interruptions), a transient failure at tick 2 is written `more=0`, a deterministic throw is retried as transient. Plane R77 says "no count and no clock ends an entry" but has no partner rule that every tick advances, that a kill is classified after a bound, or that a tick-2 transient is retried. Beneath both, one alarm runs about 34 consumers in registry order and awaits each, nothing bounds a consumer, the reading is last, and the watchdog is a cron that arrives late and cannot preempt a handler.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| N1 [E1], G102 | PDF | encrypted PDF in pieces: `readRange` returns `count:0`, `next = from + 0`, `more` stays true; owed for ever (`pdfstructure.mjs:4525–4529`) | ran (node) |
| N12, N23 [E1/E7], S8 [E2] | PDF, OCR | a kill or throw counted `transient`, asked every tick; no top-level guard in `handleTranscribe` (500 -> transient, ledger asks about hourly) | code / stub |
| N14 [E1], S20 [E2], S-7 [E3], X13 [E4] | all | transient failure at tick 2 written `more=0, cursor=NULL`, read ends (`#continueText`, `extraction/index.mjs:881–885`) | reasoned / node stub (four independent reports) |
| F1, F11 [E12]; G8, F-RETRY-ENDS-STATED [E6]; `PENDING_INTERRUPTED_MAX` 3 | all | three interruptions end a row `final` "the object stopped" (`pending.mjs:193–202`): a legitimately long XLSX/ODS read or a poison document ends final | code |
| F-ALARM-DEAD, G1 [E6/E8]; F5 [E12] | scheduler | after 0111's 8 kills no alarm ran for hours: 19 readings + 3 keeps + 6 subresources owed with `attempts 0`; spent alarm left every kind unread about 8 h | live (platform fact inferred) |
| R8w-F1, G91/G92 [E5/E7] | scheduler | live telemetry 18:40–20:30Z: 355 alarm events, 36 runs of 25–169 s at 160–500 ms CPU (waiting, not computing), alarm running 37–98% of wall; the long consumer (file-scan, file-render) "probable, not proven" | live + plat |
| G70; R-7, R-29 [E11] | scheduler | 12 MB text whole in 32 min (44 ticks, gaps to 451 s) and in 1.4–1.5 min on other runs; 214 samples: `alarm_at` null in 48, in the past in 40, `oldest_overdue` 691 s, `last_run` gaps to 551 s, `stale` false in all 214 | live |
| G93, G94, G95 [E5] | watchdog | `heal` has no caller; `watchdog_seen` is the cron's slot so a check 26 min late looks on time; `stale` false by definition through a 691 s stall | live + code |

**Recurrence.** Both directions came back. The spent alarm was fixed in round 6 (`#reconcile`, `watch`, SCHEDULER #39, cron `*/5`, K4574); in round 8 the scheduler failed in a different form: the cron and alarm worked (25 of 25 slots, the alarm never lost) but the failure moved from "lost" to "slow and unseen". G70 stood across W6 and W7. Replacing attempt and retention counts with "never forgets" (F1 fix) created the loops (N1, N12, N23). The tick-2 failure was found independently by four reports and is open. Ledger wedge: round 5 (2.5 h), W5 (nothing ran 40 min), W7 (stalls to 551 s).

**Requirement / platform fact.** Plane R75, R77, R91; K4487 D2; K4565/K4566 (the scheduler "heals itself unseen"); K4811(5) (stale = oldest owed >= 300 s and no firing completed in 300 s, or one firing > 300 s); scheduler R14 (one alarm runs everything), R28, R29 ("a busy object is not a dead one"); ocr-worker R7; R-STOP. Platform: `getAlarm()` is null during a run, so a request that arms then sets a past alarm; a spent alarm stays set until `setAlarm`; alarm retry up to 6 with back-off from 2 s (whether kills count is not stated); cron can be hours late on "underutilized machines", up to 15 min to propagate; a handler cannot be preempted from outside; a stub that threw is broken; Miniflare's alarm is not Cloudflare's.

**Sources propose.** Every `more` tick advances or ends final and stated (I7; E1 E6, E2 E1, E4 D5); a kill counted as an attempt, three per page -> `PAGE_KILLED_READER` stated (E1 E6); failures classified deterministic / transient / resource, tick >= 2 retried under R77 (E4 I20); `started_at` and `attempts+1` stamped before the owner runs (E9 R5 E2); a per-firing budget (about 10 s) with rotation and an in-flight set, an 8 s bound inside `#scanner`, per-consumer log lines, `heal(now)` wired into the door, `stale` redefined (G91–G95, K4811(5); BOB's options: rotation, bounded awaits, reorder). E1: attempt budget, kill classification and progress check belong in the scheduler contract.

### C6 Inline versus background decided by stored bytes or a clock at entry

**Mechanism.** Whether a read happens inside the member's request is decided from stored bytes by format class (PDF over 2 MiB, other over 3 MiB, parts 20 MiB, hand-off 24 MiB) plus a clock arm checked once at entry (8 of 25 s). The cost is pages (OCR, about 1.6 s each, 24 sequential calls), unpacked size (a DOCX declaring 19 MiB read inline in 1.9 s; a 1.03 MB ODS that unpacks to 20.4 MB) or work per row. The same content goes opposite ways: a 19.46 MiB stored package is deferred, a 1.03 MB stored package of the same unpacked size is read inline and dies. The decision is taken at at least five call sites with different tests, and an inline read has no abort-and-defer path: its remainder is dropped (C4). The door's 25 s bound wraps acquire and reading together, so silence in either looks like "acquire 502".

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| R8l-B2 [E5], G122; R-13 [E11]; X2 [E4] | ODS, DOCX | 1.03 MB stored / 20.4 MB unpacked read inline 38 s to out-of-memory; a 210 KB DOCX declaring 19 MiB read inline | live / node |
| G5, F-12MB-TEXT-INLINE [E6]; R-10 [E11] | text | 12 MB text 27–29 s in the request (1.5 s/MB); repeated on the `existed` path and `acquire` vs `captureupload` (PATH) | live |
| G7, F-READING-WONT-FIT-CLOCK [E6] | capture | `readingWontFit` ORs a clock arm after the size exemption: a 41.5 MB capture at 18.7 s gets `reading_pending:true` for a statement made from sizes alone | live |
| N16 [E1], S19 [E2], X24 [E4] | PDF, scans, text | `op=pdfstructure&ocr=1` and `pagetranscribe` never go through the decision at all; the `keep` row runs the first reading in the same tick; 24 MiB text upload 18.4 s | code / node |

**Recurrence.** Yes: bytes-for-all became bytes-by-format (G5, G43), the cost of a scan (pages) still defeated it five rounds later (scan30, G97), and the unpacked size defeated it for ODS (G122). The fix was applied to promote and press, not upload (PATH). "Per format and per size, set in each module" (E11 class 1). R4's "keep first, read after" (RC-R1) was reversed in G79 above 32 MiB.

**Requirement / platform fact.** K4354; K4562 (large capture answered under 2 s, finished later); K4571 shape B (large text answered at once, read in the background in pieces); control-plane R100, R105 (25 s acquire bound), R120 (PDF 2 MiB), R123, R125 (3 MiB text); reading-pipeline R37. Platform: Workers 30 s CPU; `waitUntil` cut at about 30 s; a request body read through `arrayBuffer` lands whole in the isolate.

**Sources propose.** No OCR in a member's request on any path (E2 C3, K4811(6)); no PDF over 2 MB loaded in a member's request (E1 F4/I9); the intake bar extended to uploads (E4 D9, Bob's); decide on cost, not bytes (E1 ENV A, E2 section 2); gate on declared unpacked size (G122); the size exemption must reach the clock arm (G7); R5 6(1) option A, 15 s to about 8 MB then "being fetched" with progress (E9; W6's `fetch_pending` looks like A). S2: abort-and-defer inside an inline read is E5's author's view, not a source's.

---
### C7 Bounds set ad hoc per module, below Bob's standard, in the wrong unit

**Mechanism.** Each module set the number its own failure or test needed; most are "chosen, not measured" and are expressed in declared or stored bytes, units, cells or calls. No requirement states the envelope per kind, so one file is judged at four unrelated sizes by four modules, and the largest file actually read (24 MiB) is a fraction of Bob's tier. A stated refusal "with its size" replaced a crash and was never lifted to the standard: a document between 24 MiB and 100 MB is told "kept whole, its words can't be searched or cited", which is a refusal of a file inside its bound.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| F-7 [E7], ARCH 1.5 [E1], F-PDF-23MB [E6] / G34 | PDF | nine byte ceilings on one PDF's path: 2 MiB inline, 3 MiB text, 8 MiB detection read-back, 16 MiB (R41 claim), 20 MiB (parts; file-safety `GRADE_READ_MAX`), 24 MiB (`WHOLE_READ_MAX`), 32 MiB (`MULTIPART_KEEP_MAX`), 64 MiB (pdf-worker after G34), 256 MiB (capture); 23 MB PDFs ended "no words" under a 16 MiB `MAX_PDF_BYTES` | node / live (41.5 MB book "was not read") |
| S-9 [E3] | sheets | CSV 17 MiB, any entry 24 MiB, XLSX 32 MiB declared XML, ODS 262,144 cells, workbook 50,000 cells, safe view 1,000 cells; K4628's 50 MB / about 1M rows "unreachable"; a 1M-row CSV passes only if rows average under about 17 B | node (ran) |
| X36, X5, X28/X29 [E4] | docs | 61 bounds in seven groups, 27 marked Bob's; multipart text 8–20 MiB has no window cursor (10 MiB -> 111 ticks, 1.1 GB served); archive 256 MiB vs 500 MB; safe view 500 pages vs 5,000 | node |
| G44, R8r-B/G99 [E5] | sheets | workbook add bound (about 50,000 cells / 8 MiB) would REFUSE a file within 50 MB; ODS `content.xml` > 20 MiB refused; E8's own note: contrary to "never refused" | plat |

**Recurrence.** The ceilings themselves are the fix that recurs: 16 -> 64 MiB (G34), 20 MiB `sizeGuard` -> 32 MiB pieces (4b-F7), 2 -> 3 MiB, each tuned on one measured file (E1 P3). E11 flags the 24 MiB ceiling as "the largest gap from Bob's bar"; E9 and the plans treat it as a ruling (D5), not a gap.

**Requirement.** Bob's bar (documents and scans 100 MB or 5,000 pages, sheets 50 MB or about 1M rows, images 50 MB, archives 500 MB; K4628, K4630, K4636, N1267); K1881 (a bound that changes what a member may do is Bob's; reported, not asked); P17; K4785; reading-pipeline R37, ooxml R35, file-safety R51, acquisition R10/R17, capture R86/R103. Only R37 and R35 state any one bound (E4).

**Sources propose.** The envelope per kind in module requirements (E1 ENV 2.2, 40 rows; E2 4.2; E3 E-1..E-28; E4 4.2, 61 bounds), as one table every module quotes (E3), in allocated memory, objects or work (E4 I15). **Flag for OPTIONS (E1, E2, E4, E12 independently):** the plans' own recommended ceilings (24 MiB, 1,000 pages, 10,000 pages, 32 MiB office) sit below the bar; E12 says only a pieces/streaming design can reach it; E4 Q1 option (b) reaches 100 MB by reading in pieces from the store.

### C8 Several paths doing one thing differently

**Mechanism.** Each fact (is it a PDF, which encoding, too big, owed, which document) is decided in several places, often by sniffers that disagree, and a fix lands on the path the test used. Duplicated machinery as counted by the sources: six copies of "read the whole PDF" at eight or more call sites; three inflaters with three caps; two parsers that disagree on `/Encrypt`; two OCR-owing mechanisms and two OCR drivers; six signature sniffers; three CSV parsers with three rules; four size checks; four decode paths; four ways in (upload, fetch, visitor, multipart); the inline read versus `readHeld`; the reader bundled three times. Fixtures invent the answer shape the other module returns, so the harness passes while the deployed copy breaks.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| D1, D3–D8, F-2, F-4, N9 [E1] | PDF | `PdfDoc` and `XrefReader` disagree on a direct `/Encrypt`; native inflate uncapped vs 128 MiB vs 8 MiB; three decoders of `/Contents` | code / node |
| S13, S14, C-H [E2] | images | a JPEG whose COM segment says `%PDF-1.4` detects as PDF; four classifiers disagree, every image over 1 MiB graded `high`; three PNG decoders | code / node |
| PATH x 7; S-10; tables.mjs:39–99 [E3] | sheets | G15, G41, G43, G48, G64 fixed on one path; the tolerant walker reads a CSV that the strict declarer calls `SOURCE_NOT_READ`; `cellsOf` made no cells when `capture_format` was `undetermined` | node + live |
| E5, E1 [E9]; R-15, R-16 [E11] | upload vs pull | `profileOf({ct:null})` ignores `media_type`: a text knock is "non-textual or too large" `final`; CSV labelled "an application that builds its pages in the browser" | live |

**Recurrence.** The strongest class in every report. E1: "fixed on the path the test used"; E3 P5: a fix proved on the walker's path, seven times; E4: "every one of these is a bar that a DOCX, ODT, PPTX or HTML meets and a text or CSV does not" (G88 plain text only; G68 text/CSV only; G41 sheets only; G2 fetch arm only). G41 needed two follow-ups inside its round (K4664, K4670). Found only at signing: B1.

**Requirement.** R-SEAM / R-ONE (one seam, one core), K4164 (fixed where the cause is owned), K4787, format-registry R10–R16/R23/R26, reading-pipeline R1/R2, csv-reader R2, acquisition R17, provenance R72/R73. No requirement says "a fix to a fact must hold on every entry path" (E3).

**Sources propose.** One signature table (E2 D1), one CSV-identity function (E3 E-19), one decode rule (E4 C1), detection in one place (E7), each fix naming its sibling paths and tested through each (E3 P5), census tests (E9 T1). E1: make ranged pieces the only read. E2: one owed-ledger of pages with one consumer. **S1's reading (not the sources'):** the plans harden today's three read modes and about eight parse call sites with bounds and invariants; none proposes fewer paths.

### C9 Identity of "the document"

**Mechanism.** A captured file has up to four identities (the whole sha, part shas, the bundle id, the register row), and `existed`, `held` and `found` are computed from different ones. A capture over one 8 MiB part is registered only by part shas, so any lookup keyed by the whole sha finds "not held"; `REGISTER_FIRST` ("ties by digest") can return a part. "Bytes in the store" is treated as "the document is recorded". The repair (a `whole` row, R72) added a fourth row to bundle-keyed readers and created the next failure set.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| F3 [E12], 4b F3 [E9]; V1–V9 [E12] | multipart | about 25 callers keyed by whole sha; after R72 `content.captureFor(bundle)` returned a part sha about 3 times in 4: `FOUND_CAPTURE_MOVED`, `only_capture` never held, `RELIED_ON_NOT_PRESENTABLE`, `BYTES_MISSING`; V9 `addWorkbook` and `case-carriage` not driven; F3a fail-open: file-safety served an unknown-home capture as "no sight check" | reasoned + Node stubbed chain |
| G6, G7, G73, G33, G12d, F-PART-DIGEST [E8/E6] | multipart | 41.5 MB capture's reading written against part 4 as "non-textual or too large" with no size; Document page took the part digest and drew "Nothing here" and an OCR act; stale part-keyed rows count as a second capture | live |

**Recurrence.** G6 -> G7 -> G73 -> G33 -> F3 (three more doors found it: PATH); R72 -> R73 (K4509) -> retrieval R94 (K4514) -> V9 still open; R4 C5b -> 4b F3 -> R5 E1/E3 -> R7 G78 -> held-elsewhere in W6/W7. R88 `#wholeOfPart` was fixed in round 6 yet stale rows were still in the live record in round 8; the migration of stale rows is unplaced.

**Requirement.** provenance D-533 (register holds parts only) vs R72/R73; reading-pipeline R39 (BARE_DIGEST), extraction R81, R88; capture R103; C-53.13 and K4404 (naming another project, by design); "searchable and citable" (Bob). Platform: 8 MiB part; `MULTIPART_KEEP_MAX` 32 MiB.

**Sources propose.** Provenance owns one resolution by the whole sha with `part_of` marks wherever a reader goes by bundle (E12 section 4, adopted as R73); the identity row declares which row "is the capture" (V1); one table, one sha (E3 J-14); "keep and serve a multipart capture under the document's fingerprint, or refuse in words and file nothing" (E10 C5); conditional fetch by held sha (G32). E9's author (his view): one logical object with a streamable view instead of whole-versus-parts branching in each reader.

### C10 Formats and features absent or mishandled

**Mechanism.** No requirement states the filter set, font and encoding set, structure features or readable kinds, so the test builders' kind of file (UTF-8, classic xref, Flate only, identity ToUnicode, text on every page, clean ImageMagick JPEG pages, ASCII CSV with LF, 600-character paragraphs) is the only proven kind. The door accepts any bytes to 256 MiB; the registry reads about 12 kinds; OCR reads JPEG and PNG. What is unread is often passed as "whole" with no marker, or refused with the wrong sentence. Each gap was found by the first different file.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| E11 [E1/E9], G34, N5–N10, N17, N21, N24 | PDF | `[/ASCII85Decode /FlateDecode]` read as pictures of text (live); WinAnsi without ToUnicode reads `""`; stale incremental update; wrong catalog; page leaf without `/Type` dropped; file cut at 70% reads 20 of 30 pages `ok:true`; encrypted scan never OCR'd; LZW and RunLength undecodable | live + node |
| S9, S11, S12, S21 [E2]; L26/C18 [E10] | images, OCR | sideways picture read as fluent garbage at legibility 0.25 (above the 0.2 refusal line); progressive/CMYK JPEG and interlaced PNG all end "declined"; four routes give wrong pixels with `ok:true`; photographed pages read 55% and 21% of words (43% overall) | node / live |
| S-4, S-6, S-10, S-11, S-15..S-19 [E3] | sheets | UTF-8 cells lost through a windows-1252 carrier (45% of general punctuation, 62% CJK, 100% emoji); delimiter and encoding decided on the first 50 lines; `.xls` offered by the picker, never read; shared formulas, merged cells, missing `r` | node |
| X9, X10, X11, X16, X20 [E4] | docs | windows-1252 reads `Caf� r�sum�` with `failure:null`; UTF-16 `document.xml` -> `ok:true` empty; RTF/.eml/.doc/.msg have no reader but are marked `repairable`; footnotes, headers, comments, text boxes, notes not read; only ZIP opens; encrypted archives scanned `clean` | node |

**Recurrence.** Each gap was found by the first different file: ASCII85 by a walker (E11), G34 by a 23 MB WinAnsi PDF, ODS by W7. The families never walked: "nine walks never uploaded or captured a DOCX, DOC, ODT, RTF, PPTX, ODP, email or ZIP" (E4); no PNG, TIFF, GIF, WebP, HEIC, real camera photo, mixed PDF, sideways page, other language (E2). The reportlab/ImageMagick corpus (E1 ENV) hid all of it.

**Requirement.** pdf-reader R8–R12, R20, R22 (Flate only), R23, R26, R27; pdf-pixels R13–R26, R42–R44; image-codecs R1–R11; ocr-worker R12 (English only); reading-pipeline R4 (JPEG/PNG only); csv-reader R7; office-readers R11, R30 (dates raw by ruling); BOB #32 (windows-1252 refusal); K4628 ("every file a member is likely to hold"); N1266; R44 (>= 90% of words); R32 (the page's visible text).

**Sources propose.** State the filter, font and feature set in module requirements and prove it with a generated corpus (E1 64 files, E2 72, E3 72, E4 87 rows); decide which image kinds, encodings, parts of a document and formats are read (E2 B-S1, E4 Q4–Q6); picture preparation before changing the OCR engine (E10 L26, BOUNDARY). **Search side (reasoned):** FTS `unicode61` has no NFKC (ligature "fi" not found); scripts without spaces are one token per run (B-6).

### C11 Member-visible state not derived from the record

**Mechanism.** The reading records the truth (`skipped`, `truncated`, `why`, `over_size_bound`, `failure`, `counts`, `ocr_left`), but the consumers in between drop it, and each screen derives its state from the wrong field, a client timer or a flag. "Whole" has three meanings (bytes held whole, index state, completeness) that can disagree. A generic fallback writes the sentence ("non-textual or too large", "undecodable region(s)", "declined (PAGE_NOT_RENDERABLE)") rather than the cause code. Where nothing was owed (C4), no screen could say anything true. No requirement states a time to whole.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| S2 [E2], R-12 [E11], R8r-A [E5] | scan | `completeness:"whole"` for a 30-page scan with 6 unread and a 250-page mixed file with 102 unread (`#completenessOf` ignores `tier3_candidate`, `ocr_left`; `extraction/index.mjs:1520–1530`); the API says whole, the Document screen corrects it | live |
| R-26 [E11], G103–G105, G2–G4 | web capture | at 18 s: "couldn't be fetched ... Nothing was kept" while the file is kept and `fetch-done` arrives; `opened_by` stored `probe-dee` vs stamped `member:probe-dee`, never equal | live |
| S-8 [E3], X28 [E4], S6 [E12], S3 [E2], S11 [E2] | refusals | size and bound dropped; "(multipart)" for HTML over 8 MiB; a size-refused PDF drawn "Partial: pages N have no text"; "Read it now" offered where it cannot succeed; refusal reason never reaches the member | live / node |
| S-1 [E3], X1 [E4], S-2 [E3] | ODS, DOCX | "too large to keep whole" for a 297 KB ODS; "Unread" an hour later with nothing owed; a 1 MiB row guard replaces the whole reading by a unit-less statement | node + live |

**Recurrence.** Each K4571 audit pass found more (S1–S14, then the PDF, scan, sheet and docs passes). False "nothing was kept": W2 -> W5 -> W7. "Check again soon" beside a final statement: W4 -> W6. Silent partial: W4 (24 pages) -> W7 (24 of 30). E11: the biggest class by count. E3: "The silent cases found since are in no requirement."

**Requirement.** K4571 (never a silent partial); K4579 (partial and done rows); K4426 (the four fields); extraction R90–R93 (R91 `completeness`); screens-intake R54, R57; control-plane R57, R123; K4269 (UX rows owed to the design stream); FR-12 R46 (the state names the date and reason, never "waiting"); K4562; Bob's bar ("told what is happening, why, and when"). No requirement states a time to whole (B-3 [E1], B-S5 [E2], B-3 [E3], Q9 [E4]).

**Sources propose.** One `completeness` fact owned by the reading and drawn by every screen (E12 audit S; E2 SI2); every refusal names its cause and figure (`TOO_LARGE {size,bound}`, `UNSUPPORTED_FORMAT`, `ENCRYPTED`; E4); "Read it" only where it can succeed (E4 I22, E2 SI13); screens draw the answer's own words, not a flag (G7). E8 G14 names the cause: "no requirement said a bound must reach the member".

### C12 Storage and index limits

**Mechanism.** A stored value whose size scales with the file (cells, page boxes, image placements, units) meets the 2,098,176-byte SQL value or the 1 MiB reading-row guard. The reading is one stored JSON with text, cells and units together; history keeps every distinct reading, each a full copy. The guard fails by deleting the whole reading (units and references) rather than the optional part, so a small file can lose its whole index. The index keeps 4,096 units / 2 MiB per piece, and a non-append write deletes all units.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| G41, F-G41-TOOBIG [E6] | CSV, XLSX | a CSV >= about 209,811 B (188,847 ok) or a workbook > about 13,000 cells throws `SQLITE_TOOBIG` inside the write transaction; 147 B a typed CSV cell, 161 B an XLSX cell; raw workerd 2,100,000 ok, 2,300,000 refused | plat |
| S-1 [E3] | ODS | 6,000 cells 1,003,177 B kept; 16,000 cells (80 KB file) 2,692,909 B stated and unindexed (`extraction/index.mjs:1096–1101`); `g41.test.mjs:142–159` asserts the cliff as correct; round 7 called it "by design" | node |
| R-10 [E11], G13/G14 | text | 12 MB text: 2,324 units kept, 117,316 skipped, last line absent (live); the 2 MiB / 4,096 bound moved between rounds (last line found at 24 MiB with 170,847–356,569 units in R7), unexplained | live |

**Recurrence.** Yes. The limit was "already in the repository" (`record-core/schema.mjs:33–35`) for files and never applied to readings; found for readings in round 6, then for provenance, ingest and portal in the same round. G41 opted in only CSV and XLSX ("two callers left unopted -> G44: PATH"), leaving ODS, DOCX, PPTX (S-1, X1). G38 was fixed once for bytes and recurred as a page. S3 notes that in rounds 4–7 no instance states a row-size error; the limit showed there only as bounds that reshape the reading.

**Requirement.** Platform: SQLite value 2,098,176 B (2,252,800 refused); 10 GB per object; Bob's "storage rows <= 2 MB"; K4636 ("a reading over 1 MiB is stated"); extraction R22, R94 (`READING_KEY_BYTES` 262,144 bounds only the answer), R96, R97; promotion `INLINE_MAX` 1,048,576. Proposed: SI11, J-12.

**Sources propose.** Cells held in the file (`inlineCellsMax`, `cellsIn`) for every kind (E3, E4 A9); do not store what nobody asked: sheet text read whole and searchable, cells from the held file on demand (K4636); cells over 512 KiB omitted with a statement, text units never lost to a bound on something else (E4 I17); a guard at every bound value; the reading-row guard never replaces a reading that could be indexed (E3 J-12); the SQL-limit shim in every test.

### C13 Tests not at the platform's shape, and observability the platform withholds

**Mechanism.** The suite is node, with fixtures that are the builder's kind of file and stores that answer instantly. Miniflare enforces no 128 MB, no CPU limit, no SQL value limit, no alarm retry cap; workerd returns zeros for memory and freezes the clock in synchronous work, so memory cannot be asserted in the object and time cannot be asserted at all; Workers Logs were switched off by every script upload and lose the tail of long firings. A bug was seen only when a walker met it, and half the causes stay unknown. Tests also pin a bug or a comment as the requirement.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| S-39 [E3], X30 [E4], G39 | harness | `peakMB` is a tick-boundary reading (the 2 ms sampler is cleared on the next line, `harness.mjs:254–255`); two cap conventions (`capFor(N)=128-N` PDF vs `128+39-N` sheets; D=39 from an ASCII bundle idling at 49 MB while the committed bundle needs 85); harness still models 87.6 MB; memory test counts JS heap, not ArrayBuffers | plat |
| `round6-pieces.test.mjs:124`; `r37.test.mjs`; `fix4-r75`; `r81.test.mjs:66–72`; `g41.test.mjs:142–159` | PDF, ledger, ODS | a "300-page dense PDF" is a stub; the `owe` hook is called by hand; tests pin the bug (`NO_HOME` ends an entry; the ODS cliff) | node |
| R8r-A, G96, G97; R8w-F1, G91 [E5] | scans, scheduler | a scan test answers 24 pages in one call with no wall; a scheduler double with instant consumers and a `getAlarm()` that never nulls; passes while live fails | node |
| all four families | fixtures | every walked scan is a clean ImageMagick render of English; sheets ASCII, LF, 4–6 columns, one city portal's 166 CSVs; docs 600-character paragraphs; PDFs one font, identity ToUnicode, classic xref | node |

**Recurrence.** All rounds; the central root of recurrence in every report (E1 "strongest root cause"; E3 P1–P9; E4 P1–P8: "every in-force id of 7 modules named by a test, yet X1–X36 exist"). E5: "Not a single failure in this share was caught by a test before a walker saw it." The fifteen causes of E8's chain were each found by a new harness, the shim or a walker; round 8 repeated the class with new stubs (scan, scheduler double); W4 smoke passed 16 of 16 screen sets while two BLOCKERs stood. Process rules (R-FOUR, R-SEAM, R-STOP, R-CLOCK, R-QUIET, R-LIVE) are procedural; no test environment enforces the platform's limits (E9).

**Requirement.** K4785 (3)(4) (whole suite at round end plus a live subset on biosmoke8); K4787; K4616 (idle measured in raw workerd); K4687 (capped-node measure); K4297, K4426/K4428, K4111, K4149, K4792; plane R84, R92; R-FOUR.

**Sources propose.** A seeded generated corpus with a truth function (64–87 files per family plus 16 seeded variations each round end) run through the real entry path at platform shape (R real plane, M module, W workerd, L live), judged by invariants on counts, not time (E1 I1–I14, E2 SI1–SI14, E3 J-1..J-17, E4 I15–I22); harness gains `members:"real"`, `restartAt`, `storeFailAt`, `killPage`, `objectGoneAt`, per-tick counts, an in-tick sampler, one cap convention; two oracles; step 0 is to measure; NULL when unmeasurable and a per-sha last-run record (R7r-R2); a lag meter (R8s-C).

### C14 Contention on the one object

**Mechanism.** One thread serves the tick and every request: record writes, ledger, scheduler, queue derivation, session writes, inline reads and the Document screen. A synchronous stretch or an isolate reset by one stops everything. Each object call costs 110–125 ms at the floor and a screen makes 19–57 of them, serialised. The tick alone is cheap (30–40 ms added at platform shape); the harm comes from neighbours, recomputes, and a read that dies and takes the object's other work with it (`STORE_DID_NOT_ANSWER`).

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| G82, G117, R8s-C [E5]; R-34 [E11] | screens | with a tick running Home 7.7–7.8 s, Queue 7.9–8.3 s vs idle 2.2–3.9 s; cause unknown | live |
| R8s-B, G115, G116; G80 | queue | 12 concurrent `queue?count=true` 13–20 s (24 took 23.8 s); cache key `total_changes()` moved by bookkeeping writes; each recompute 0.75–1.9 s live vs 30–40 ms locally | live |
| R2/E2 [E9/E11]; F-MEM-0111 [E6] | PDF | while 0111's reading ran: `whoami` 36.6 s, sign-in 9–40 s, "Read it" 502 at 37.4 s; its kills starved the 19/3/6 ledger | live (walker B also uploading) |

**Recurrence.** Speed against K4354 is "STILL MAJOR in every round" (E11 R-34): each round measured the floor and found new serialised work. G82 -> G86 -> still red in W7; the contention bar is asserted only for cheap reads and for `whoami`, never with a screen beside a tick.

**Requirement.** K4354, K4599 (act floor after the alpha), K4747 (moving the object); plane R91, R93; record-core R89/R90; queue R94; SI14 / J-15. Platform: one `STORE` Durable Object per team, single-threaded; objects do not move after creation.

**Sources propose.** Yields counted in units and a tick work budget (E1 E2, E3 E-14, E4 D1/D2); `uncounted(fn)` for bookkeeping writes, one derivation per (viewer, signature) (R8s-B); fold session, window and op into one call, a location hint, per-row work off the list path (E9/E10; Bob's, deferred); the PDF parse in `pdf-worker` (E9 E2(f)); E5's author (his view): isolate reading from the foreground or use a time-budgeted rotation.

### C15 Process: causes fixed by hypothesis, repairs causing the next failure, invariants owned by no module

**Mechanism.** The first statement of an invariant came after the cause in most rows (E3 3.1; in all but about 5 of about 30 round-7 causes the invariant is "none stated", E4). Bars appear as test bars before requirements. Fixes tune a constant on the walker's file and are re-tuned. Fixes are made at the module that saw the symptom; the invariant lives in nobody. Capabilities are built and tested alone and never wired. Unknown causes ship as logging and are fixed a round later.

| Id [E] | Seen |
|---|---|
| E8 section 2.R [E8], G13 -> G56 | about fifteen successive causes in one round for "the same" large-file family; each local bound moved the failure |
| R82 [E9], R41 -> R8r-C, G5 -> G43 -> G122, K4664/K4670 | the repair caused the next failure: `budget: Infinity`; header repeat; the inline gate revised in-round and still wrong |
| built but unwired: `heal` (G93), `owe` hook (N2), `allowTextPage` (F-3, S10), held cells for CSV/XLSX only (G99), continuation for PDF only (S4) | an invariant owned by no module; "a claimed premise was wrong": "inline first 24 pages gone" was a dead alarm (F-ALARM-DEAD) |
| P6 [E3], C17 [E12], P8 [E9] | "by design" that was a deferral (ODS 1 MiB guard, called by design in round 7 after K4628/K4630 had overtaken the deferral); R4 C13b and C5a adopted before measurement; "the 20 MiB limit was nobody's job" |

**Recurrence.** Every report; recurrence by definition (§3). **Requirement.** R-FOUR (four fields), R-SEAM/R-ONE, R-STOP, R-OLD, R-LIVE, K4164, K4426–K4428, K4785, K4787, K4812, P17. **Sources propose.** Write the envelope into the requirements first (E1–E4 section 6); each fix names its sibling paths and tests through each (E3); a deferral overtaken by a ruling is a defect (E3 P6); a corpus run at each round end in its own session; a recipe file as the "see it red" step (E1 ARCH); a check that every capability has a caller (E5's author's view); one reading contract with named owners of the budgets (K4812, the lane).

### C16 Safety verdicts and third parties outside the reading's control (added)

**Why a new class, and one class not two.** S1 proposed a C16 "safety decoupled from reading; capability absent"; S3 proposed a C16 "third-party egress and slow external assurance". They overlap on the scanner (ClamAV with no signatures, in both) but S1's second half is a different mechanism. This draft splits by mechanism: **C16** is what the reading's path depends on or is judged by and does not control (the scanner and its signature feed, third-party sites, the timestamp authority, safety verdicts that disagree with what the reader can read); **C17** is capabilities that do not exist. C8 and C10 cover neither: C8 is duplicated decisions, C10 is mishandled features of supported formats.

**Mechanism.** File-safety, the scanner and ClamAV run beside the decoders, not before; no reading module imports file-safety. The scanner says `clean` of what it cannot read (`--alert-encrypted=no`: password-protected ZIP, DOCX and PDF come back `OK`), its limits are unpublished and a limit hit becomes a permanent `NOT_SCANNED`. Its signatures never arrived: `database.clamav.net` answered 403, so nothing has been scanned (S3: no signatures since 2026-10-15; S1/E4 FR-SCAN: none ever, every upload of every kind unscanned) while the Security page said files are checked. Third parties sit inside the member's bound too: attestation (digicert rfc3161, 14 s a press, "up to 30 s") gates publication; oaklandca.gov and legistar refuse or answer slowly from the Worker's addresses while curl takes under 2 s; a `host-governor` cool-off of 60 s slept inside the request gave 502 at 60.5 s three times.

| Id [E] | Family | Seen | Grade |
|---|---|---|---|
| F-F1 [E10], R-27 [E11], C84 [E9] | scanner | 403 on signatures, no signatures since 2026-10-15, 27–104 files "waiting", `not_scanned/SIGNATURES_ABSENT` not counted as a scan, polled every 5 min for ever; the container scan path never run on real files; pressing "Check for new signatures now" mirrored them, the daily cron did not run after the redeploy | live |
| F-D4 [E10], N-slow-refuse [E9] | web | oaklandca.gov / legistar refuse or are slow from the Worker ("never work around a site's bot protection", K3658); 502 at 60.5 s | live / reasoned |

**Recurrence.** The scanner has not yet worked in any round (E10 L25, C84, W2, W4, R-27). Attest was cut out of the bound; render 8.8–17.5 s remains. **Requirement.** file-safety R6, R11, R14, R16 (leaves gating open), R18, R39, R45, R51; file-scanner R1–R3, R7, R16, R24; FR-12 R46; K4182/K3658 (no workaround of a site's protection; the User-Agent borrow ruled out); R20. **Sources propose.** Encrypted as its own state, never `clean` (E4 I21, B9); state that reading does not wait for the scan (E4 Q11, E2 B-S7; recommended: no gating for alpha, and say so); a mirror the team controls (E9 R4 option (a), recommended), or ask ClamAV, or files stay held unscanned and say so; record `not_scanned` once per file and reason until the reason changes (E10); do not hold the member's request for third parties (C2/C6 removals).

### C17 Capability absent (added)

**Mechanism.** Some pages and files cannot be read because the code to read them does not exist, and nothing says so before the member tries: the door accepts any bytes to 256 MiB, the registry reads about 12 kinds, and a file without a decoder ends "not read as text (non-textual or too large)" with a "Read it now" act that cannot succeed. This is a scope decision nobody wrote down as a decision (E2 on TIFF).

| Id [E] | Seen |
|---|---|
| N18 [E1] | no page rasteriser: a CID or Type3 font without ToUnicode can never be OCR'd |
| S3 [E2] | TIFF (the usual office-scanner output), GIF, WebP, HEIC, BMP, SVG, JP2 accepted `ok:true`, then `final` "non-textual or too large"; no decoder exists |
| X10, X20 [E4]; S-10 [E3] | no reader for RTF, .eml, .doc, .msg, .ppsx; only ZIP opens (TAR/GZ/7z/RAR `undetermined`); `.xls` offered by the picker, never read |
| N24 [E1], B-4 | no tier-1 decryption: encrypted scans never OCR'd; user-password PDFs stated `PASSWORD_REQUIRED` (K4803) |

**Recurrence.** Not a fixed-and-returned case; open in four reports. **Requirement.** image-codecs, pdf-pixels R13–R26, ocr-worker R12, reading-pipeline R4, format-registry R23, N1266 (formats missing from the beta), K4628 ("every file a member is likely to hold"). **Sources propose.** Capabilities are Bob's choices (E2 B-S1, E3 B-5, E4 Q5, E1 B-4, B-6); questions in §6. For OPTIONS: where a capability would run (a rasteriser, a TIFF/WebP/HEIC decoder, a legacy Office reader, an archive opener) is an architecture question once Bob has chosen the kinds.

---
## 3. The recurrence table across rounds

Merged from S1, S2, S3 and deduplicated. "Came back" = the failure, or the same mechanism on another path or kind, recurred after the claimed fix. R4, R4b, R5, R6, R7, R8 are fix rounds; W2–W7 the re-walks.

| Failure | Seen | Fix claimed | Came back? |
|---|---|---|---|
| Large PDF read kills or starves the object (0111, 1,354 pages) | C5a, R4 P8, W2, W4, R5 E2, G26 | page ranges R43 (200 pages, then 100 + 1.3 MB); classify once; 1 MiB a page R93; budget = index bound | Yes: G56 11.7 s first tick; G68 one page a tick; `op=reading` kills (G38); 41.5 MB "was not read" (R8); N4/N11 |
| Every tick re-opens the whole file | G68, S-14, X8, F-1, N19 | `openPdfRange` + `HELD_OPEN`; `csvWindowTick` | Yes: office, ODS, HTML never windowed; two PDFs thrash the slot; tier 2 whole per tick |
| Tick holds the thread; screens slow | G82, G86, W7 R-34, G117 | `yieldNow` for csv-reader and pdf-reader open | Yes: still red in W7 (Home 7.7 s); not `range()`, XLSX, ODS, DOCX, PPTX |
| Sheet reading holds cells and JSON many times | G15, G40, G41, G44, G99/G122 | no cells at intake, `cellsIn`, row guard | Yes: ODS dies live (R8); workbook add bound is a refusal |
| Scan OCR stops at 24 pages, nothing owed | F9 (4b), R5 E6, W4, W5, scan30 (W7), S1 in pieces | ledger `ocr` row + cursor; `followEntries` on promote | Yes, three times: upload path and later pieces open |
| Debt not durable (post-commit) | R5 G54, R6 G8/G9, R8 G96/G98 | ledger rows per post-commit step; seam test | Yes: scan (G96), ODS (G122); the test passed because its promote completed |
| Tick-2 transient failure ends the read | N14, S20, S-7, X13 | transient/final marks (R82) | Open, found independently by four reports |
| Inline work over the 15 s bar | C5a, G5, G79, scan30, ODS 42.9 s | format-class rule 2/3 MiB | Yes: cost is pages and unpacked size (scan30, G122) |
| Spent or dead alarm; ledger wedged; nothing ran 40 min | R5 E2, F5, G1, W5 | `#reconcile`, `watch`, SCHEDULER #39, cron `*/5`, heartbeat K4574 | Moved: serial firing (G91), `heal` unwired (G93), `stale` false (G95), slot-as-seen (G94); stalls to 551 s in W7 |
| Large web capture holds the act; false "nothing was kept" | R5 G2/G3/G4, W2, W5, W7 R-26 | park + `fetch` row; `fetch_pending`; per-stage timings | Yes: 18 s flip in W7; first capture 42.8 s unknown (G106) |
| Reading read in part, silently | G13/G14, E3, S1/S2 [E12], R-12 | cursor, `completeness`, pieces | Yes: G15 piece side (N15), S-23, S2 [E2] `whole` with unread pages, X14, S-1 |
| Header repeated at piece join; index used as file | F-WORDS, G64 (W6 18,101; W7 18,100), R8r-C | words count; delimiter fix | Yes: repeated header still open (R41 created it) |
| Multipart / part digest taken for the document | C5b, F3, G6, G7, G73, G33, X35, R-23 | R72 `whole` row; R39; R88 | Yes: V1–V7 broke from R72; V9, N20 open; held-elsewhere W6/W7 |
| Upload over 32 MiB never whole; document 24 MiB–100 MB "kept, can't be searched" | F2, 4b-F2, R103, E3 [E9] | `keepPast`, `putFromParts`; statement with size | Partly: kept but unread above 24 MiB, `final` with size (K4517), a refusal inside the bound |
| Scanner never scans | L25, C84, W2, W4, R-27 | manual mirror press works | Daily job not run after redeploy; outcome of the 403 not in the share |

---

## 4. Live-measured facts every architecture must respect

Only these are live or platform-shape; every other number in the family reports is node. "live" = biosmoke8; "plat" = platform-shape local.

**The isolate and the plane**
- Isolate 128 MB, shared by everything the object does. Plane idle: 86 MB with the two-byte bundle as built (raw workerd bisect, G39, K4616, plat); about 50 MB (49–50) with an ASCII-only bundle, D = 38.7 MB saved (plat); the committed bundle "needs 85" (S-38 [E3]). The harness still models 87.6 MB. Headroom for a read: about 42 MB as built, 78–79 MB ASCII (E4). Which bundle is deployed is not established (§5).
- Workerd: `process.memoryUsage()` all zeros (`last_mem` NULL); `Date.now()` frozen in synchronous work; Miniflare enforces no memory or CPU limit (G27, G69, R-CLOCK).
- Plane bundle 27,063,908 B built, 30.18–30.85 MiB of the 32 MiB Worker limit (K4520); global scope 519–533 ms in node vs the 1 s start-up limit (local workerd 4.3 s does not transfer). `wrangler.jsonc:175` sets no `cpu_ms`; by Cloudflare's documentation the default is then 30 s, raisable to 5 min (PLATFORM.md).

**Tick, request and OCR time**
- PDF: G56 first tick 11.7 s (live); 23 MB at 0.77 MB/page gives one page a tick at `PDF_RANGE_BYTES` 1.3 MB; ticks 93,374 / 75,790 / 11,283 ms in W6 (partly artefact: `last_ms` runs from alarm start), 6,926 ms max in W7; 0111: 22–23 s CPU with all plane modules, 12.4 s first tick at cap 112, survives 144 MB, dies at 128 (plat); model 3 s + 0.04 s/page; parse-total ratio 1.53 / 1.57 / 1.63 at 200 / 100 / 75 pages.
- Text and CSV: G37 classify 12.4 s at 128/128 MB; G48 17 MiB CSV first tick 16 s (plat); 24 MiB text 14.0–16.6 s (plat), 8.3 s in W7; 12 MB text first tick 30,017 ms in W6, 4,189 ms in W7; 17 MiB CSV ticks 39–48 s (W6), 5.2 s max (W7). A 1 MB CSV needs about 133 MB and dies at 127–132 MB (plat).
- Screens with a tick running: Home 7.7–7.8 s, Queue 7.9–8.3 s vs idle 2.2–3.9 s (G117, W7). 12 concurrent `queue?count=true` 13–20 s; each recompute 0.75–1.9 s live vs 30–40 ms locally. `interfacewords` 6.35 MB per sign-in, 11.4–13.7 s.
- OCR: about 1.6 s per call inline (24 calls = 39–43 s); scan30 upload 42.7 s (`extractread` 39.3 s); `ocr` ticks 29–31 s (the OCR service's time, not the thread's); 10.4 s CPU at 300 dpi vs a comment `cpu_ms` 30,000 (a code comment, not measured live); 1,000-page scan about 2.8 h of OCR (estimate); photographed pages read 55% and 21% of words, 43% overall, 84% precise. OCR has not been measured live since G67 landed.
- ODS 20.4 MB `content.xml`, 172,302 cells: 37,973 ms wall, 7,462 ms CPU, `exceededMemory` on 2026-10-23, taking the alarm run (38,690 ms) and two scanner calls with it (R8l-B2). Money ingest 1.8 ms a row (100,000 rows 182 s, plat). `caseratify` 13.1 s = 59 sequential calls.

**Alarm and scheduler (live)**
- Telemetry 18:40–20:30Z: 355 alarm events, 36 runs of 25–169 s at 160–500 ms CPU (waiting), alarm running 37–98% of wall, 12 `canceled`; 25 of 25 cron events ok (R8w-F1). A new upload starts with a 35–44 s alarm run before the reading's first tick (G91).
- 12 MB text whole in 32 min (44 ticks of 0.2–4.2 s, median gap 17 s, five gaps over 60 s up to 451 s; the 24 MiB text up to 551 s) vs 1.4–1.5 min with 3–10 s gaps on later runs; 17 MiB CSV 19 min vs 64 s.
- 214 samples in W7: `watchdog_seen` every 300 s; `alarm_at` null in 48, past in 40; `oldest_overdue` to 691 s; `last_run` gaps to 551 s; `stale` false in all 214. Cron slots delivered hours late (17:05:40 at 19:23:28). After redeploys owed work started 40 min, about 20 min and about 6 min late; the spent alarm left every kind unread about 8 h (F5). Back-off 15 s doubling to 1 h; `PENDING_INTERRUPTED_MAX` 3; F1's five-try stop at about 4 minutes.

**The door, the network, the object**
- Door `ACQUIRE_BOUND_MS` 25 s (the screen promised "up to 25 s" while the wait was 31.8 s); 32 invocations per request (not measured here; 24 OCR calls used); 10,000 subrequests; `waitUntil` cut about 30 s after the response.
- Object call 110–160 ms a hop (Frankfurt object, files in western North America); R2 0.26–0.29 s a call from a far Worker; a screen makes 19–57 calls; 12 parallel `whoami` 2.1–4.2 s; the object cannot move after creation.
- Uploads 10 MB 8 s, 23 MB 13–16 s, 40 MB 22.9–25.7 s (12.2 s in W7); 24 MiB text 18.4–20.7 s; large fetch about 0.5–0.7 MB/s (15.9 MB took 23 s; 14–16 MB PDFs 1.8–8.4 min live vs 7.6 s in Miniflare); `putFromParts` 40/100/256 MiB in 1.4/3.6/9.2 s in workerd (K4497); a 24 MiB whole read measured in workerd (K4498); ClamAV about 35 s and render about 18 s fit the long firings (probable); digicert 14 s.

**Storage (plat)**
- SQL value 2,098,176 B passes, 2,252,800 B refused; raw workerd 2,100,000 ok, 2,300,000 refused; 147 B a typed CSV cell, 161 B an XLSX cell (CSV 188,847 B ok, 209,811 B fails; 221,376 workbook cells die, 166,380 survive). Reading row guard 1 MiB; index 4,096 units / 2 MiB per piece; unit cap 128 Ki chars; wire 512 KiB; `READING_KEY_BYTES` 262,144; 10 GB per object. The live record held 535,983 text units and 1,794 files.

**Scale actually walked:** largest PDF 1,354 pages / 23 MB (walked to page 9); a 41.5 MB five-part capture (stated, not read); 12 MB and 24 MiB text; 17.0 MiB CSV; 221,376-cell workbook; 20.4 MB ODS; 30- and 60-page scans; the largest non-PDF real read a 2.3 MB file. Nothing beyond.

---

## 5. Causes still unknown, and the measurement that would settle each

Merged and deduplicated. **Dep. = A** marks a cause an architecture decision depends on.

| Item | What is unknown | Measurement that would settle it | Dep. |
|---|---|---|---|
| **G70** gaps between ticks: 28–64 s, stalls of 451–551 s, 32 min vs 1.4 min for one file; `alarm_at` null or past; `stale:false` | not diagnosed after W6, W7; candidates: alarm re-arm after a long alarm, `SPENT_ALARM_MS` 60,000, the `*/5` watchdog vs `HEAL_EVERY_MS`, a slow consumer (file-scan about 35 s, file-render about 18 s) | per-consumer start/end lines before and after each await; the G70 line moved before the heartbeat write; alarm set, fired, tick end and next set times on a quiet copy; `getAlarm` sampled every second for an hour; `file-scanner` telemetry; repeat one file to see if the gap is bimodal | **A** |
| **G82/G86** what holds the thread 7–8 s with a tick running; the 6.2 s `heldcaptures` | `range()` is code-identified, may not be the only stretch | L run with a tick in progress and timed requests into the object; lag meter (10 ms interval) and per-stretch counters | **A** |
| Which resource killed the object under 0111 (OOM, CPU, wall) | "probable"; no live `last_mem`/`last_ms` | scratch deployed object, a 21 MB 1,300-page PDF, `wrangler tail`; `cpu_ms`; wall per phase; capped harness at 128 MB | **A** |
| Deployed `cpu_ms`, real memory, plane idle (86 vs 50 vs 49 vs 85) | which bundle is deployed; node RSS is not workerd heap; whether workerd charges external strings to the object | read-only probe of deployed limits; raw workerd bisect of the deployed bundle; N4/N10/N11/N12 at workerd shape | **A** |
| OCR in workerd: CPU, memory, wait per page, two frames in a warm isolate; real camera photos | 10.4 s is a comment; 61.3 MB measured on synthetic frames in an engine-only worker | per-page CPU and memory at 300 dpi in workerd; `own_ms`/`wait_ms` on a live `ocr` row; a photo walk | **A** |
| Platform inferences: a set alarm over a spent one runs; a raw script PUT keeps cron; failed `scheduled` auto-retried; kills count toward the 6 alarm retries; `waitUntil` about 30 s; alarm wall limit; 32 invocations on this runtime; whether the door bounds the PUT body before `arrayBuffer` | inferred, not measured | live drills; platform tests (PLATFORM.md); capped-isolate upload of 60 and 100 MB | **A** |
| Whether a 100 MB / 5,000-page document, a 50 MB / 1M-row sheet, a 50 MB image or a 500 MB archive can be read at all by the present design; time-to-whole rates | no measurement exists | the first corpus run at the standard's sizes on a quiet copy | **A** |
| 12 MB text's 30 s first tick; the 93 s and 75 s PDF ticks; Home/Queue +4–5 s with ticks; recompute 25–60x local | inherited time (alarm start stamp) or compute; the record's size (535,983 units) | `own_ms`/`wait_ms`, `started_at` at row start, `rows_read`/`rows_written`; the local harness loaded with 535k units | - |
| Index bound after round 6 (170,847–356,569 units found at 24 MiB in R7); DO storage at cells 11x the file | the bound moved between rounds, unexplained | read the code at the tip; gauge at 70%/90% (G42) | - |
| G63 ingest 4.1 s then 0.28 s; 17 MiB CSV Document page 6.5–10.3 s; G66; R7b-B3; R7r-R6; F-B21-FRONT-PAGE 20–30 s | not reproduced | cold/warm repeats; walker re-runs with a request trace | - |

---

## 6. Questions for Bob that the sources raise

Deduplicated; ids as the E-files give them. K4628 and K4630 (within the bound, read whole in bounded memory, never refused for size) answer the size questions: marked **answered**; they go to FOR-BOB.md only if a measurement shows the platform cannot. Technical details the sources list for completeness are BOB's, not Bob's.

| # | Question | Ids | State |
|---|---|---|---|
| 1 | Largest file read per kind (today PDF/scan/office 24 MiB; text/CSV in pieces to 24 MiB; web page 8 MiB); page ceilings (rec. 1,000 for scans, 10,000 for PDFs); shape limits (columns, cell length, 250,000 objects); workbooks over 50,000 cells | B-1, B-2, B-5 [E1]; B-S2, B-S3 [E2]; B-1, B-2, B-4 [E3]; Q1–Q3, Q8 [E4] | **Answered** by K4628/K4630. The sources' recommended ceilings sit below the bar; flagged in C7 |
| 2 | A promised time to "whole" (rec. 15 min largest text PDF, 2.5 h largest scan) | B-3 [E1]; B-S5 [E2]; B-3 [E3]; Q9 [E4]; G70 | Still Bob's (K4571 set none) |
| 3 | Formats read: image kinds (rec. + TIFF, GIF first frame); `.xls`; RTF, .doc, .eml, TAR/GZ; CJK/Thai search (rec. outside alpha) | B-S1 [E2]; B-5 [E3]; Q5 [E4]; B-6 [E1] | Still Bob's (C17) |
| 4 | Encodings (UTF-8/UTF-16/declared charset; windows-1252, reversing BOB #32); OCR languages beyond English | Q4 [E4]; B-8 [E3]; B-S4 [E2] | Still Bob's |
| 5 | What counts as text: footnotes, headers, comments, notes (rec. read every part, mark kind); dates and percent (reversing office R30); a web page's main content or its furniture (changes what a member may cite) | Q6 [E4]; B-7 [E3]; RC-R11 / L6 [E9/E10] | Still Bob's |
| 6 | Password-protected files (rec. "encrypted" its own state, no entry) | B-4 [E1]; Q10 [E4] | Partly answered (K4803: `PASSWORD_REQUIRED`) |
| 7 | Poor pages: sideways, blurred, faint (rec. turn upright; < 20% legible store nothing, < 80% mark); picture preparation or engine first | B-S6 [E2]; L26 [E10] | Still Bob's |
| 8 | Does a safety hold stop reading (rec. no gating for alpha, say so)? If the scanner stays at 403: mirror the team controls, ask ClamAV, or hold unscanned and say so | B-S7 [E2]; Q11 [E4]; C84 [E9] | Still Bob's (C16) |
| 9 | Large web capture bar: A 15 s to about 8 MB then "being fetched" with progress, B longer bar, C refuse over a size; visitor-view promise | R5 6(1) / G85 [E9]; Q7 [E4] | Still Bob's; W6 behaves like A without a ruling |
| 10 | May a member see the name of another project in which a held copy is filed? | R7r-R5 [E5]; R-23 [E11] | Still Bob's (K4404 vs privacy) |
| 11 | Protective bounds that change what a member may do (K1881): 64 MiB page, 16 MiB object stream, 2,000,000 objects, 300 dpi frame floor, 64 images a page; 27 of E4's 61 bounds | E1 2.3 (A3–A7, D2, D3); g44; E4 | In principle answered by K4630; figures are BOB's unless they change what is read |
| 12 | Data modules out of the script (14.2 of 27 MB; signed-release change); bundle at 30.18 MiB of 32 MiB "an architecture question to Bob" (K2547); G55 tier-2 ingest options | G39, R7s [E5]; G84 [E9/E10]; G55 | For OPTIONS, then Bob |
| 13 | Deferred by Bob: speed after alpha (combined read op, location hint); UX words; sentence for blank/undecodable pages | K4599, K4747, K4269; g41 4 | Deferred / design stream |
| 14 | **Flagged by E9 and E11, raised by no source:** may a document between 24 MiB and 100 MB stay "kept whole, its words can't be searched or cited"? | E9 E3/D5; E11 R-20 | Answered against it by K4628/K4630; it is the standing gap (C7) |

Not reading, pass to BOB: design lane items, Bob-only acts at close, installer 115 vs 112 MB (K4237), Level 1 load test (K4746(1)), scheduler design options (R8w-F1), queue doctrine (R7b-B2, fixed in W7).

---

## 7. What this means for OPTIONS

Design obligations that follow from the classes. Each is a requirement on an architecture, not a design; OPTIONS must show how each architecture meets it or why it need not. Classes in brackets. These are this draft's reading of the evidence, not the sources' text, except where a source id is given.

1. **One read path per kind; a whole read is a one-piece range.** The cost of a step is bounded independently of file size and page count: bytes decoded plus objects walked per step, at least one page, never "pages x average". No step re-pulls or re-parses the whole file; what the next step needs is carried in a stored cursor, not the isolate. [C1, C2, C3, C8, C14; E1 F2/E3, E3 section 6, E4 A1]
2. **Peak memory is stated once, as a measured sum:** the unit read, plus held bytes, plus the plane's idle, against 128 MB (or the isolate the read moves to). Every decoder checks declared headers before allocating, on every route. The unit of a bound is allocated memory, objects or work, not stored bytes. [C1, C7; I15. Depends on plane idle and external-string charging, §5]
3. **Owed work is registered durably before any answer leaves**, by the reader's owner, in one ledger, on every door (upload, promote, press, pull, archive entry, tick 2). A path that cannot finish writes what remains first; no later hop is the only register. [C4, C6; K4487 D2/D5]
4. **Progress is monotone; every tick is bounded and advancing.** A step answering `more` advances a stored cursor or ends final and stated with a cause code; a kill is counted against the unit that caused it and classified after a bound; deterministic, transient and resource failures are different states; a transient failure at tick 2 or later is retried, not written as an end. [C5; I2, I7, I20]
5. **A poison-file rule.** A page or object that repeatedly kills the reader ends in a stated state naming the unit while the rest is still read; it neither loops for ever nor ends the whole read after N deaths of the plane. [C5, C1]
6. **Inline versus background is decided on real cost** (pages, declared unpacked size, OCR calls, rows), and the inline path can stop and hand its remainder to the ledger; or no member request does heavy work at all (no OCR, unpack or large fetch inside one). [C6, C4; K4354, K4562, K4811(6)]
7. **Scheduling that cannot be starved:** a bounded firing (time budget with rotation, or bounded awaits), no consumer able to hold the alarm for minutes, a watchdog whose `stale` is defined on time since the last completed firing and which re-arms, and the record's screens not sharing a thread with a long read (or the read moved off the record's object). [C5, C14; K4565/K4566, K4811(5). Depends on the causes of G70 and G82, §5]
8. **Bounds stated once per kind, in the unit that matters,** in one table every module quotes, derived from Bob's standard. A file within its bound is never refused or "kept, not read"; above it, it is refused with its size and the bound. [C7, C12; K4628, K4630, K1881]
9. **One place computes completeness** from the reading's own facts (units written, skipped, truncated, `ocr_left`, failure cause, owed rows), and every screen and API draws it. Every refusal and partial carries a coded cause and a figure; "Read it" is offered only where it can succeed; a "when" is stated. [C11; K4571, FR-12 R46]
10. **One identity for a document** (the whole sha); parts are a detail below the register; no consumer is keyed by a part. [C9; R72/R73]
11. **No stored value scales with the file without a guard:** readings, cell tables and page boxes in rows sized for the 2 MB value; optional parts omitted with a statement rather than a whole reading deleted. [C12, C3; K4636]
12. **Pieces equal whole**, tested: a reading in pieces and a whole reading give the same text, units, counts and table, for every kind, across cut sweeps (the cap, the cap plus one, a multi-byte character, a quoted multi-line field). Units are chunked, never cut. [C3; I6]
13. **Kinds and capabilities are declared** (filters, fonts and encodings, structure features, image types, archive formats): each read, or refused in words naming the cause at the door; none accepted `ok:true` and later `final` "non-textual". Depends on Bob's choices, §6. [C10, C17, C11]
14. **Safety and third parties are decoupled from reading:** the read never waits on the scan or a remote authority; a verdict that cannot be given (encrypted, over limit, no signatures) is its own stated state, never `clean`; no member request waits on a third party beyond its bound. [C16, C6]
15. **A harness at the platform's shape, plus live measurement:** real alarm semantics (null during a run, past alarm stays), a capped heap with one convention counting ArrayBuffers, the SQL value limit, real service-binding latency, kill/restart/store-failure injection (`restartAt`, `killPage`, `storeFailAt`, `objectGoneAt`), a seeded corpus at the standard's sizes run through the real entry path with a truth function and an independent reader, invariants judged on counts not time, and a live subset on biosmoke8 at each round end. Where workerd withholds a reading, the architecture exposes its own (lag meter, per-unit counters, NULL when unmeasured, a per-sha last-run record). [C13, C15; K4785, K4616]
16. **Every fix names its sibling paths** and is proved through each; each invariant above is owned by a named module and written in its requirements before code changes. Only discipline delivers this; fewer paths make it cheaper. [C8, C15]
17. **Measure first:** the causes marked **A** in §5 (G70, the thread holders of G82, deployed `cpu_ms`, plane idle, OCR in workerd, the PUT-body bound, the platform inferences, reading at the standard's sizes) are settled before an option is costed on them. [C5, C13, C14]

**Two observations for OPTIONS raised by the syntheses (not the sources' recommendations).** First, every plan's recommended per-kind ceiling is below Bob's bar, and the 24 MiB figure also drives memory (held bytes inside the 128 MB); E12 and E4 Q1 say only pieces or streaming from the store can reach the bar in 128 MB. Second, the plans harden today's three read modes (whole, ranged, held) with bounds, invariants and a corpus; the recurrence table suggests C4, C6, C8 and C9 follow from the number of paths, not from any bound, which is the case for an option with fewer paths.
