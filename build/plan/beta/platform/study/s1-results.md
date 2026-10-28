# S1 results on `plat-s1` (running record)

**Status** · PLATFORM #1, 2026-10-27. Copy `plat-s1` (installed alongside by Bob, signed 0.87.0, the alpha's code, not T53's; Level 1; no store options, so the room was placed by Bob's own request's location, `installer-steps` R41). Through the agent proxy only (K4733). Tool: the old lane's `probe.mjs` (copied, with the sign-in as `PLATS1_*`), "api done" = the last API read finished; "net" = proxy delay taken out (P18's method, 50 ms hop assumed). Nobody else is on this copy. Medians of 5 runs, ranges in brackets. Credentials never printed.

## 1a. The empty team (2 members, no project, no document), 1280 px

| screen | admin raw ms | admin net ms | member raw ms | member net ms | requests (API) |
|---|---|---|---|---|---|
| Home `/app` | 2,134 (1,876-3,317) | 638 (609-2,193) | 1,722 (1,550-2,861) | 656 (628-748) | 35 (25) admin, 30 (20) member |
| Queue | 1,441 (1,241-4,245) | 579 (525-592) | 1,332 (1,236-2,137) | 579 (573-745) | 22-23 (13) |
| Held | 1,487 (1,231-1,817) | 577 (575-603) | 1,345 (1,154-2,198) | 589 (542-682) | 21-22 (12) |
| Inbox | 1,503 (1,095-2,320) | 597 (565-612) | 1,193 (1,019-1,957) | 568 (539-582) | 19 (10) |
| Add | 1,238 (1,076-3,764) | 592 (534-606) | 1,119 (1,075-1,539) | 588 (488-609) | 21 (12) |
| Projects | 1,342 (1,267-2,113) | 592 (571-631) | 1,211 (1,144-1,275) | 627 (565-628) | 23 (13) |

**Reading.** Every screen of an empty team is drawn within 2.2 s raw and 0.7 s net, inside the 2 s bar with the proxy's delay in or out, except tails to 3.3-4.2 s raw (one run each of Home, Queue, Add): the proxy's tail (P18) or a cold object, not separable from one sample set. The floor is therefore about **0.6 s net**, with 19-35 requests a screen, the same frame the alpha made (P23: 13-26 reads on a team with data).

**The hop.** `do-session` is **50-57 ms**, `do-doorwindow` 54-66 ms and `do-<op>` 51-102 ms on plat-s1, against 108-135 ms on biosmoke8 in P23 (its room in Frankfurt). `in-<route>` is 0 throughout. The room's placement near the team about **halves the hop** (one sample set; the proxy's own part, P18, is the same for both). This is the placement gain K4747 bought, measured on an empty room; on a team with data the in-object time returns (P24).

## What is not yet measured (next)
Seed A (1b) and the screens on a team with data; Project and Document screens (they need a project and a document); the other sizes; the ramp; per-table bytes (needs the proto redeploy).

## 1b. Seed A-lite (the first, small seed), 1280 px

**What was seeded.** One project (`PLAT S1 study project`) and 120 generated files, 104 MB, uploaded through the product's own file door (`op=captureupload` with the file as the body, filed under the project from its own Add door): 60 text files (50-500 KB), 30 CSV (1-5 MB, 8,000-40,000 rows), 15 DOCX, 15 PDF (20-100 pages, text). Two workers, about 11-13 s a file, no failures, about 12 minutes. This is a fifth of the 500-document / 0.4 GB "Seed A" the plan names: the full seed and the larger ones are for the next session. **The room's own figures after it** (`op=stats`, read a few minutes after the last upload, reading still in progress): 123 bundles, 489 files, **28,889 text units**, `dbBytes` **200,000,000** (a round figure: the stats read may report a coarse size, so read it as "about 200 MB"; per-table bytes need the measuring ops of step 1d). So 104 MB of files made about 200 MB of database at this point, about 1.9 times the file bytes (not FILES' 1.4-1.5 times the text: the text share of these files is not measured separately).

| screen | admin raw ms | admin net ms | member raw ms | member net ms | requests (API) admin / member |
|---|---|---|---|---|---|
| Home | 2,811 (2,096-3,489) | 690 (620-881) | 1,797 (1,632-2,449) | 623 (556-714) | 35 (25) / 30 (20) |
| Queue | 2,169 (1,347-3,126) | 713 (645-982) | 1,394 (1,237-2,575) | 607 (585-620) | 23 (13) / 23 (13) |
| Project | 2,341 (1,863-4,230) | 822 (703-1,053) | 2,658 (2,071-4,285) | 639 (617-770) | 36 (27) / 35 (25) |
| Document | 2,455 (2,358-3,179) | 913 (812-952) | 1,275 (1,169-1,840) | 676 (599-695) | 44 (33) / 22 (12) |
| Held | 1,860 (1,183-2,451) | 800 (639-1,275) | 1,194 (1,078-1,905) | 567 (522-578) | 24 (13) / 21 (12) |
| Inbox | 1,769 (1,096-3,042) | 589 (570-612) | 1,179 (996-2,178) | 576 (531-666) | 20 (10) / 19 (10) |
| Add | 1,405 (1,249-1,837) | 782 (706-951) | 1,165 (1,058-1,210) | 579 (560-636) | 22 (12) / 21 (12) |
| Projects | 1,191 (1,156-2,619) | 579 (522-695) | 1,309 (1,092-2,569) | 591 (579-594) | 23 (13) / 23 (13) |

**Reading.** With data the net medians stay at 0.57-0.91 s (the bar is 2 s); raw medians reach 2.2-2.8 s for the administrator on Home, Queue, Project and Document, with ranges to 4.2 s: the proxy adds 1-2 s to concurrent requests (P18), so the raw figure overstates and the net figure understates; the truth for a member in the same place is between. **The administrator's screens are heavier than the member's** (Document 44 requests against 22, 913 against 676 ms net), as in P23. Compared with the empty team (1a), Held, Add and Document moved most (Held 577 to 800 ms, Add 592 to 782 ms): the room's own work begins to show, as P24 found on biosmoke8. At 104 MB the copy is far from the ceiling; the 2 GB and 6 GB seeds and the ramp (steps 1c, 1e) are what find it. **Caveats:** a fifth of the planned seed; reading still in progress while the screens were timed (the `textUnits` were still landing); nobody else on the copy; alpha code 0.87.0.

## 1b-full. Seed A grown to 503 documents (PLATFORM #2), 1280 px

**Status** · PLATFORM #2, 2026-10-27, `plat-s1` (alpha code 0.87.0, Level 1), reading finished and idle (127,502 text units, 503 of 503 indexed, no change over 2 minutes), nobody else on the copy. Medians of 5; administrator `plat-s1-admin`, member `plat2-member` (a member with no held captures of their own).

**What was seeded.** 380 more generated files (190 text 50-500 KB, 95 CSV 1-5 MB, 47 DOCX, 48 PDF 20-100 pages; 193 MB) added to the study project through its own Add door, three workers; with the first 120 (104 MB) the project holds 500 documents and about 297 MB of files. `op=stats`: 503 bundles, 2,009 files, **127,502 text units**, `dbBytes` **600,000,000** (a coarse figure: about 600 MB), so about 2.0 times the file bytes.

| screen | admin raw ms | admin net ms | requests (API) | member raw ms | member net ms | requests (API) |
|---|---|---|---|---|---|---|
| Home | 4,868 | **3,526** | 35 (25) | 1,763 | 659 | 31 (20) |
| Queue | 4,463 | **3,456** | 24 (13) | 1,305 | 563 | 22 (13) |
| Held | 1,542 | 992 | 22 (13) | 1,114 | 573 | 21 (12) |
| Inbox | 2,129 | 638 | 19 (10) | 1,007 | 550 | 19 (10) |
| Add | 3,419 | **2,752** | 22 (12) | 1,111 | 572 | 21 (12) |
| Projects | 1,384 | 628 | 22 (13) | 1,224 | 578 | 23 (13) |
| Project | 6,489 | **4,768** | 40 (29) | 2,015 | 649 | 35 (25) |
| Document | 2,485 | 1,158 | 46 (33) | 1,270 | 621 | 21 (12) |

(The first administrator run, `t1`, signed in as a wrong handle and is discarded; two further administrator sets, before and after confirming the room idle, agree within 5 %.)

**Reading.** At 104 MB (1b) the administrator's screens were 0.6-0.9 s net. At 500 documents and 297 MB, **four administrator screens pass the 2 s bar at p50 (Home 3.5 s, Queue 3.5 s, Add 2.8 s, Project 4.8 s net)**, while the member's stay at 0.55-0.66 s. The ops that wait are cheap ones: `bootstrap`, `memberlist`, `grouplanguages` and `profiles` show 2.6-3.4 s of server time on Home, and `queue`, `inbox`, `wizardsat` and `capturerequests` 2.0-3.2 s on Queue and Add: the room's one thread answers them behind a heavy admin read. The heavy reads are the administrator's: `heldcaptures` (1.4 s alone on Queue, the P24 finding) and the Queue/Inbox lists, now over the roughly 500 captures still waiting in Held (nobody has vouched; a real team clears them). The member's frame has none of those reads and stays inside the bar. **So the ceiling this copy shows at Level 1 is not a size but a queue of held captures on the administrator's screens**: a team that lets captures wait, as the seed does, loses the 2 s bar at about 500 documents, well before any record-size limit. This is the alpha's code; the fold, the kept counts and `heldcaptures` as a picker (`time-budgets-draft.md` §3) are the fixes the draft already names; this run is their "before".

**The Add door under three parallel uploads (a finding for BOB).** 17 of 380 uploads timed out at the page's 120 s wait with three workers (0.1-2.5 MB each: 8 CSV, 7 text, 2 PDF, no DOCX); **all 17 succeeded when re-tried one at a time, in 10.7-15.5 s**. So the file was not the cause: the door window queued behind the room's work (reading in progress) while other members' uploads were landing, as P24 found. A team with three members adding documents at once, with reading behind, can see a 2 minute wait on files under 3 MB. The 363 others took about 11-14 s each.

## 1e. The ramp, members' frames, 5 to 60 members (PLATFORM #2)

**What ran.** A throwaway driver (not `load-check`; K5448) replays each screen's declared reads from the probe's op lists as N virtual members using the member account's token, one screen at a time, all of its reads in parallel, mix Home 25 %, Queue 15 %, Project 20 %, Document 15 %, Projects 10 %, Held, Inbox, Add 5 % each, think time exponential with mean 30 s (2 screens a minute, P17), 3 minutes a step (the draft's 10 minutes shortened), steps 5, 10, 15, 25, 40, 60, from one container through the agent proxy, on `plat-s1` (alpha 0.87.0, Level 1, Seed A of 503 documents idle). The numbers are the **raw frame time** (first request to last answer, proxy delay *in*, no draw): the driver is not a browser, so the browser-based "net" correction does not apply and the first printout's "net" column (negative in places) is discarded.

| members | screens | errors | Home p50 / p90 | Queue p50 / p90 | Project p50 / p90 | Document p50 / p90 | Projects p50 / p90 |
|---|---|---|---|---|---|---|---|
| 5 | 42 | 0 % | 1,158 / 2,207 | 1,740 / 2,137 | 1,561 / 2,243 | 1,190 / 2,546 | 943 / 1,194 |
| 10 | 68 | 0 % | 1,200 / 1,907 | 1,154 / 1,984 | 1,350 / 2,198 | 1,060 / 1,242 | 1,071 / 1,357 |
| 15 | 100 | 0 % | 979 / 1,976 | 617 / 1,561 | 1,090 / 2,194 | 1,076 / 1,856 | 564 / 986 |
| 25 | 155 | 0 % | 759 / 1,961 | 558 / 1,122 | 819 / 1,719 | 591 / 1,522 | 560 / 715 |
| 40 | 251 | 0.03 % | 1,214 / 1,995 | 733 / 2,505 | 1,392 / 2,018 | 610 / 1,471 | 552 / 785 |
| 60 | 355 | 0 % | 778 / 1,867 | 634 / 1,746 | 1,107 / 2,171 | 593 / 1,791 | 522 / 965 |

**Reading.** From 5 to 60 members at 2 screens a minute each (up to 2 screens a second against the room) the room did not saturate: no step broke the stop rule (more than 1 % errors), and the median frame times **fall** from the first steps to the later ones (the first steps include connection and cold-object cost, with fewer samples); the p90 stays at 1.1-2.5 s raw, proxy included, with no rising trend. So for a team whose members mostly read, **this copy at Level 1 did not reach its limit at 60 concurrent members**; the limit is somewhere above that on this method.

**What this does not show (read before relying on it).** (1) Reads of a **member's** frame only: the administrator's frames, which already pass the bar at idle (§1b-full), were not mixed in, and the heavy `heldcaptures` list is the same for every caller here so the cost it showed for the administrator does not appear. (2) One token for all virtual members (one session row), no writes, no uploads and no reading in progress: the door's queue under uploads (the 17 timeouts) is not tested. (3) The driver's container sits on the same proxy as every other test: raw times include its delay; nothing here converts them to the bar's net figure. (4) 3 minutes a step and one pass: p99 is not firm. **Next:** the same ramp with an administrator walker per ten members and one upload every minute, the soak at 80 % of the last step, and the record sizes (1c).

## 1e-mixed. The ramp with an administrator walker and uploads (PLATFORM #2)

**What ran.** The §1e driver plus one administrator walker per ten members (rounded, at least one) replaying the administrator's frames (Home, Queue, Project, Document, which include the heavy `heldcaptures` and list reads) and one upload of a 200 KB text file a minute through the product's own `captureupload` act as a member, 3 minutes a step, steps 5, 10, 15, then stopped by the rule (errors over 1 %). Same copy and state as §1e (Seed A, alpha 0.87.0, Level 1). Raw times, proxy in. Two runs: the first (administrator session expired: a shared-device session ends after 15 minutes idle, `SESSION_LIMITS.sharedIdle`, `credentials/index.mjs`; my driver let it idle) is discarded; the figures are from the runs with live tokens.

| members | errors | member Home p50 / p90 | Queue | Project | Document | administrator Home | Queue | Project | Document | uploads (ms, API call only) |
|---|---|---|---|---|---|---|---|---|---|---|
| 5 (+1 walker) | 0 % | 1,478 / 4,526 | 1,307 / 2,954 | 2,063 / 2,407 | 1,883 | 3,165 / 4,578 | 3,692 | 5,848 | 4,097 | 1,628, 5,230, 2,122 |
| 10 (+1) | 0.17 % | 928 / 2,482 | 768 / 1,764 | 1,485 / 1,759 | 1,064 / 2,272 | 4,012 | 3,585 | 4,447 | 4,242 | 3,972, 1,987, 2,279 |
| 15 (+2) | **1.24 %** (a re-run of this step: 0.41 %) | 868 / 2,489 | 770 / 3,884 | 1,665 / 4,659 | 1,272 / 4,200 | 3,440 | 3,018 / 5,204 | 8,112 / 8,570 | 6,159 | 2,578, 1,892, 1,799 (re-run: 4,337, 1,945, 2,131) |

**Reading.** Adding the administrator's frames and one upload a minute changes the picture of §1e: **Level 1 on the alpha's code breaks at 15 members, not above 60.** The break is **502 answers** from the Worker or room (the re-run counted six in about 1,450 requests, on `projectdirectory`, `determinations`, `heldcaptures`, `groupkeystate`, `groupidentity` and `inbox`: not one op), plus member p90s of 2.5-4.7 s that the members' frames alone did not show (§1e: 1.1-2.5 s up to 60). The administrator's own screens are 3.0-8.1 s raw at every step, as at idle (§1b-full). Uploads answered 200 throughout (1.6-5.2 s for the call; the reading behind them is not timed here). **So the limit of a Level 1 copy is the heavy administrator reads and the writes landing in the one room, not the number of members who only read**: one or two administrators with a held queue of 500 plus one member adding a file a minute is enough to push 15 members past the stop rule. This is the alpha's code, no fold, no kept counts, no `heldcaptures` picker. **Not shown:** the cause of the 502s (a room that overran its time, or an overload answer); the measuring ops of step 1d would say. 3 minutes a step, one pass; the soak and record sizes are next.

## Deploys of the prototypes to `plat-s1` (record)

**Branch** `proto/levels-2-3-all` head `50c43739` (never merged): `proto/levels-2-3` (op `tablebytes`, `scripts/deploy-plane-only.mjs`) + C (`PROTO_C`, `PROTO_C_HELD`, `protocprobe`) + B (`PROTO_B`, `protobprobe`); built on `13c83a9ae7`; bundle sha256 `ac48aaea8bb4ae0e8590167a6491bcd347c12c7448fbd245e900bf5e3df17747`. Tests 665 of 666, the one failure (`record-core/r7-write-counter-workerd`) the same on the base. **Dry run** against the live Worker (PLATFORM #2, 2026-10-27): live code `d71bdc19e4604e72` (the `release/` bundle) -> new; 10 bindings sent, 6 kept by Cloudflare (5 secrets, STORE), cron `*/5 * * * *` kept. **Real run: refused** by the auto-mode classifier for PLATFORM #2 ("Modify Shared Resources"); not retried; BOB deploys (message to BOB #325 with the commands). No deploy recorded yet. **Rollback:** the same script with `release/bio-plane.bundled.mjs` (`d71bdc19e4604e72`).

## 1d. The room's tables (`op=tablebytes`, baseline deploy) (PLATFORM #2)

**Deploys (record).** (1) 2026-10-27 about 22:36Z, BOB #325: `proto/levels-2-3-all` `50c43739`, sha256 `ac48aaea8bb4ae0e8590167a6491bcd347c12c7448fbd245e900bf5e3df17747`, flags off; script check: bytes hash-identical, 16 of 16 bindings as before, cron `*/5 * * * *` kept. (2) about 22:41Z, BOB #325: `03a5c65e`, sha256 `03a740f8e2d89d8bf83e344476f1ec4d02ccf90d015d229db17605cc661a3095` (adds the gate: the three measuring reads also answer a signed-in team administrator, `op=stats`' check), `PROTO_C=1`, `PROTO_C_HELD=1`. Rollback: `scripts/deploy-plane-only.mjs plat-s1 ../release/bio-plane.bundled.mjs` (sha256 `d71bdc19e4604e72…`, the code that was live).

**Baseline with the new code, flags off** (5 runs, net ms, medians): administrator Home 2,822, Queue 2,915, Held 847, Inbox 562, Add 3,217, Projects 1,020, Project 4,126, Document 1,773; member 541-633 on every screen. Within the spread of §1b-full (Home 3,526, Queue 3,456, Add 2,752, Project 4,768): the deployed branch changes nothing while its flags are off.

**The tables.** `tablebytes` (copy: 503 documents, 297 MB of files): the database is **676,630,528 bytes** (exact). Durable Object SQLite has **no `dbstat`**, so the op answered `count-only`: rows, not bytes per table. 628 tables, 68 non-empty, 430,564 rows in all; **`capture_text` (the text units) 127,502 rows, its full-text index tables `capture_text_fts` 127,502, `_fts_docsize` 127,502, `_fts_data` 21,334, `_fts_idx` 8,382: together 412,222 rows, 96 % of every row in the room.** The next tables are `wiz_refusal_tallies` 3,193, `observation_log` 2,020, `files` 2,009, `job_batches` 960. So the room's growth with documents is the extracted text and its search index, as FILES' F5 said, and this is the term prototype B moves; bytes per table still need another route (a page-count read through a pragma, or the size of an exported copy).

## C on (`PROTO_C=1`, `PROTO_C_HELD=1`) (PLATFORM #2, 2026-10-28)

Deploy: BOB #325, `proto/levels-2-3-all` `03a5c65e`, ~22:41Z 2026-10-27 (hashes in §1d). **Screens, 5 runs, net ms medians:** administrator Home 3,393, Queue 3,334, Held 857, Inbox 546, Add 2,525, Projects 533, Project 3,911, Document 976; member 515-649 on every screen. Against the flags-off baseline (§1d: 2,822 / 2,915 / 847 / 562 / 3,217 / 1,020 / 4,126 / 1,773) there is **no clear gain**: the cache removes an op's own second wait but every request first makes a `session` room call that queues behind the heavy read (PROTO-C-SPEC caveat 1). `protocprobe` read later after light traffic: 0 hits, 9 misses (one isolate), so it says nothing about the cache's value under load. **The mixed ramp with C on did not run**: the driver exited within a minute with no output; not measured. Next: re-run it and read `protocprobe` after the ramp.


## Upload stages, C=1 against C=3 (PLATFORM #3, 2026-10-28, BOB #330's ask for CAPTURE T53-108)

**What ran.** `plat-s1` with `proto/levels-2-3-stages` d9abfdaa live (`PROTO_STAGES=1`, `PROTO_C=1`, `PROTO_C_HELD=1`; alpha 0.87.0, Level 1, Seed A of 503 documents, reading idle at the start). Driven **through the real Add door in Chromium** (`study/door-stages.cjs`): the project's Add door, "A file or photo", a text file of 250 KB-1.9 MB with 8 random trailing bytes (so none is a second sighting), then the page's own `captureupload` and `promote`; each response's `Server-Timing` read. C=1 (control) and C=3 uploaders, 6 files per batch, each run twice, alternating (c1, c3, c1, c3): **12 uploads at C=1, 12 at C=3**. Signed in as the **administrator** (`plat-s1-admin`; no member was enrolled yet, so the uploader is not a plain member). Raw times, proxy in. Also run: `scripts/upload-stages.mjs` (API call only, `study/upload-stages-fixed.mjs`: it called `/?op=` where the page calls `/api/?op=`, and its statement lacked the three lines), n=6: wall p50 2.6 s at C=1, 3.8 s at C=3, no failure.

| stage (median, ms) | C=1 | C=3 |
|---|---|---|
| whole page wait, click to "Captured" | 4,398 (max 7,417) | 5,405 (one 16 s; one never) |
| `captureupload` call, page's view | 1,992 | 2,392 |
| door admission (`up-door`) | 48 | 53 |
| room wait (`up-room-wait`) | 15 | 0 |
| body read (`up-body-read`) | 51 | 83 |
| hash and put (`up-hash-put`) | 304 | 366 |
| profile, registrar, promote-within | 0 | 0 |
| door's read of the upload (`up-read`) = answered | 670 | 942 |
| in the room, whole `captureupload` (`do-captureupload`) | 877 | 988 |
| gap between the two calls (page work) | about 490 | about 565 |
| `promote` call, page's view | 1,319 | 1,574 |
| `promote` in the room (`do-promote`) | 1,000 | 1,185 |

(Zeros are synchronous stages: workerd's clock does not advance in them; they are marked, not measured.)

**Reading.**
1. **On this copy, now, an upload takes 4.4 s at C=1 and 5.4 s at C=3, not 11-13 s.** About 2 s is `captureupload` (0.3 s hash and put, 0.7-0.9 s the door's read of what the object answered, the rest the proxy and the hop), then 0.5 s of the page's own work, then 1.3 s `promote`. No stage grows much with three uploaders: door admission and the room wait stay under 0.1 s. **The earlier 11-13 s did not recur**; what differed then was the reading of 380 just-landed files behind every upload, which is not what was running now (reading had finished; each of this study's files adds a little). So the 11-13 s is the reading backlog's wait, not a stage of the upload itself: **not shown by this run, it needs the same study during a bulk load**.
2. **The "timeout at 120 s" is, in the one case seen, not a slow upload.** One C=3 upload (410 KB) got **a 502 from `captureupload` after 2.8 s**, its stages stopping in `up-hash-put` (3,302 ms, the longest of any; no `up-read`, no `up-answered`): the object failed in the hash-and-put stage (the write of the bytes). The page then showed no "Captured" and my driver waited 150 s. So a small file "timing out at 120 s with three uploaders" may be **a fast failure that the page does not report**, which the earlier study read as a wait. I did not look at what the page printed; the driver waited only for the success text. **To confirm:** one C=3 run that also records the page's text at the failure (next).
3. One `promote` took 12.6 s (C=3, file 5), the only slow tail; its time inside the room (`promote-within`) cannot be timed (synchronous). One in twelve at C=3 failed; none at C=1. Twelve uploads each is a small sample.

**Caveats.** The uploader was an administrator; reading was idle; 24 uploads in all; the 502's cause (a write error from the object's store call, or the object's overload answer) is not known: the stages say only that it came in hash-and-put.

**Follow-up, the failures (same session, more C=3 batches; driver now waits 45 s and records the page's text).** C=3 in all: **54 uploads, 5 failed (9 %)**; C=1: 12, none. The five, none ended by a slow wait: `captureupload` 502 after 2.8 s (stopped in `up-hash-put`, 3.3 s), `captureupload` 500 after 1.8 s, `captureupload` 502 after 2.6 s (stopped with `up-body-read` 2.5 s and `up-hash-put` 1.0 s, neither near the others' 0.05 and 0.3 s), and **two `promote` calls that answered 502 after 2.7 and 1.6 s, after a good `captureupload`** (so the file was held, the document was not made). **In all five the page stayed on the Add screen and showed no result line and no words of an error that my check found (the first 400 characters of its text; the rest was not read)**; the success text never came. So the failure is **a quick 5xx from the room, shown to the member as nothing**, and any 2 minute wait in the earlier study was the driver waiting for text that never came. The admission, the room wait and the other stages do not grow with three uploaders; what does is the chance that a call in the object fails. `object-age` (the room object's age at the call) is 0-10 s on both the good and the failed calls (failed: 4.4-7.0 s), so the object is young at nearly every call and its age does not separate them; the cause of the 5xx is **not found by these stages** (a candidate to check: the object's memory with three bodies in hand, or an overload answer; the cron every 5 minutes is not the cause, the failures came within seconds of one another). Medians over all C=3 runs: page wait 5.9 s, `captureupload` call 3.0 s, `promote` call 1.5 s.

**Correction, and the repeat after a bulk load (PLATFORM #3, same day).** (1) **The page does say something on a 500.** With the page's text read to its end (earlier I kept only the first 400 characters), one failed upload shows: "This team's Civicsmith failed while handling the request, before it could produce an answer. That is a fault in this team's Civicsmith ... whether any part of it took effect is not known from here. The administrator can find the details in its logs under the reference given with this answer." So the statement above that the page shows nothing is **withdrawn**: the page names a fault, but it leaves the member without a retry and without saying whether the file was kept (a `promote` failure after a good `captureupload` leaves the file held and no document). Whether the same text shows on a 502 (an answer from the Worker's edge, not the room) was not read. (2) **Counts.** C=3: 7 of 87 uploads got a 5xx (8 %: the five above, a `captureupload` 502 after 20.6 s, a `captureupload` 500 after 2.3 s); C=1: 0 of 18. One more C=3 upload failed with no server error at all (the driver's file choice did not take: "Choose a file or take a photo first"); it is left out. (3) **Bulk load.** 45 uploads through `captureupload` at C=3 (`study/upload-stages-fixed.mjs`) all answered 200, 2.9 s median, 7.0 s longest; they make **no reading backlog** (the reading follows `promote`, which the API script does not send), so the repeat that was meant to bring back the 11-13 s did not: straight after it, the door at C=1 took 3.9 s (6 of 6) and at C=3 6.5 s (8 of 9; the failure the 502 after 20.6 s). The 11-13 s is therefore still unexplained; the candidate remains the reading of many documents being promoted while uploads land (needs promoted documents, i.e. the browser path in bulk, three at a time for many minutes). (4) **The room is heavier than Seed A now:** `op=stats` read 569 bundles and 761,416 text units (Seed A: 503 and 127,502): the 66 generated files of this study (one line a unit, 250 KB-1.9 MB) carry about 9,600 units each, five times the seed's density per document, so the later runs (including the failures) were in a room with 6 times Seed A's text units. The failures also came in the first batch (569 → 575 documents), so density is not shown to cause them.
