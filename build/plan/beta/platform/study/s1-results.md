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

