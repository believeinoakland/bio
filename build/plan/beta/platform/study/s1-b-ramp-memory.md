# S1 results on `plat-s1`: B, the mixed ramp and the memory study

**Status** · PLATFORM #3, 2026-10-28. Prototype B (per-unit and packed), the mixed ramp with C on, and the local workerd memory study. Continues `s1-results.md` (steps 1a-1e, the baseline and C on); same copy and conventions (through the agent proxy, raw times with the proxy in unless stated; credentials never printed).

## B on (`PROTO_B=1`): `protobprobe` (PLATFORM #3, 2026-10-28)

**Deploy.** BOB #331, 14:19Z: `proto/levels-2-3-stages` d9abfdaa (bundle 0ea6029a408f270c), `--set-var PROTO_B=1` added to the live `PROTO_STAGES=1`, `PROTO_C=1`, `PROTO_C_HELD=1`. **What ran.** `scripts/protob-probe.mjs` (through `/api`, administrator token, `NODE_USE_ENV_PROXY=1`), n=50 captures asked, `maxunits` 400 (the prototype's cap), 3 repeats, each phase a whole request less a `noop` baseline (150-175 ms; workerd's clock stands still in synchronous SQL, so the room's own phases read 0 inside). The copy phase wrote 403 objects (400 unit objects and 2 per-bundle inverted indexes) into `proto-b/` of the copy's R2 bucket, from 2 captures; no room row changed. **The room holds 761,000-882,000 text units** (study files, about 5 times Seed A's density).

| what | room (SQLite) | R2 (one object per unit, one index per bundle) |
|---|---|---|
| read 20 units | 40 ms | 478 ms |
| read 100 units | 98 ms | 2,936 ms |
| read 400 units | 57 ms | 12,031 ms |
| term search ("grant": 521 matches in the room, 362 in the index; the 20 first fetched) | 148-235 ms (338,766 room rows read) | 438-608 ms (2 index gets of about 440 KB, 20 unit gets) |
| copy of 400 units to R2 | | 24.2 s (403 puts, 8 at a time: about 60 ms each) |
| bytes | text 359,015 B in 577 rows (FTS index not counted) | units 288,782 B + index 883,909 B = 1,172,691 B in 403 objects |

**Reading.** (1) **As built, B is slower on both reads and searches**: R2 reads cost about 30 ms a unit (a document screen needing 100 units would take 3 s; 400 units, 12 s), 10-200 times the room; the term search is 2-4 times slower, the inverted index (a JSON map per bundle) being 3 times the text it indexes. That is the worst layout for reads (one object per unit); a unit window packed in one object and read by byte range would read in one get, and the prototype does not measure it. (2) **What B is for is not shown by this probe**: it moves bytes and rows out of the room, and by §1d 96 % of the room's rows are units and their index; the probe does not write fewer rows in the room, so it cannot show whether the reading's memory (P-32) or the soak would improve. (3) The room's own search reads 338,766 rows to find 521 matches in 2 captures: its cost grows with the room's size (here 880k units), yet answered in 0.15-0.24 s, well inside the bar. **So at this size the room is still the faster place for units and search; B pays only if the room's rows or memory, not the time, are what must be saved.** Not measured: a packed layout; the room's memory with the reading of a document written to R2 instead of the room (the question P-32 raises).

## Packed layout (`PROTO_PACKED=1`): `protopackedprobe` (PLATFORM #3, 2026-10-28 ~14:55Z)

**Deploy.** BOB #331, 14:50Z: `proto/levels-2-3-packed` 635f3496, bundle sha256 eee4fe552ad232194cdea67aeea7d2b6f164b0a06bc5d2d84a59c6d7e210c335, `PROTO_PACKED=1` (the readout code is not in this bundle). **What ran.** `study/protopacked-probe.mjs` (n=50, maxunits 2,000, 3 reps, each phase a whole request less a `noop` baseline of 158 ms; workerd freezes the clock in synchronous work, so inside figures read 0) after the copy of 2,000 units from 6 captures to `proto-packed/`: one units object per bundle (newline-delimited JSON, offsets table in a manifest), one compact index per bundle (term to delta-coded positions). **The room now holds 1,411,312 text units** (study files added: 5 times Seed A's density per document).

| | room (SQLite) | per-unit R2 (earlier B) | **packed R2** |
|---|---|---|---|
| read 20 units | 112 ms | 478 ms | **225 ms** (3 gets) |
| read 100 units | 29 ms | 2,936 ms | **136 ms** (3 gets) |
| read 400 units | 46 ms | 12,031 ms | **109 ms** (3 gets) |
| term "report" (1,819 matches in the room; 1,733 in the index, other tokenizer; 20 units fetched) | 246 ms (341,131 rows read) | 440-610 ms | **258 ms** (6 index gets, 2 unit range gets, 139 KB) |
| a term with no match ("data") | 33 ms | | 107 ms (6 index gets, 125 KB) |
| bytes for 2,000 units | text 1,295,927 B in 2,100 room rows (+ about 4,287 FTS shadow rows, estimated by the table's row ratio) | 3.3 x the text | units 1,446,782 B + index 124,820 B + manifest 31,299 B = **1.60 MB, 1.24 x the text** (index 0.10 x) |
| copy of 2,000 units to R2 | | 24 s for 400 | 12.3 s for 2,000 (13 objects) |

**Reading.** (1) **Packing removes the layout's penalty**: a 400-unit read falls from 12 s to 0.11 s, a search from 440-610 ms to about 260 ms (equal to the room's own 246 ms for a term of 1,800 matches), and the bytes from 3.3 times the text to 1.24 times. (2) **It is still 2-5 times the room on a plain read** (136 against 29 ms for 100 units; 109 against 46 ms for 400): the room's SQLite read is hard to beat, and a screen that reads units pays about 0.1 s more with this layout; inside the 2 s bar. (3) **What it saves**: for these 2,000 units, 2,100 room rows and about 4,300 FTS rows; at the room's 1.4 million units the rows are the room's growth (§1d: 96 % of its rows). (4) **What it does not do**: it does not fix the 5xx (P-35: with no rows written the resets went on), and `memoryUsage` is zeros in workerd, so the probe's memory proxy (1.3 MB of strings held for the copy) is only a proxy. (5) **The room's own search reads 341,131 rows for a common term** at 1.4 million units: its cost rises with the room, the R2 index's does not (6 small objects), which is where B would win as a room grows toward Level 2's sizes. Not measured: the room's search at 5-10 million units; a team's record in R2 for the whole life of a document (deletes, rewrites, re-readings).

## The mixed ramp with C on, two runs (PLATFORM #3, 2026-10-28) (`PROTO_C=1`, `PROTO_C_HELD=1`, `PROTO_PIECE_UNITS=512`, `PROTO_READOUT=0`; bundle e13b0ba7…)

**Method.** `study/ramp3.cjs` (written from §1e-mixed; the screens' declared reads were captured once per role from the page's own requests, `study/capture-reads.cjs`): N virtual members (the member token of `plat2-member`) replay a screen's reads in parallel, mix Home 25, Queue 15, Project 35 (the member's Document screen returned no reads, its 15 % folded into Project), Projects 10, Held, Inbox, Add 5 each; think time exponential, mean 30 s; one administrator walker per ten members (at least one) on Home 25, Queue 20, Project 30, Document 25; one 200 KB text upload a minute as the member; 3 minutes a step, steps 5, 10, 15, 25, no stop. Raw times, proxy in. Room at the time: 705 documents, 1,721,682 text units, all indexed. **Run 1 (15:33-15:50Z) had a driver mistake**: the page's call `POST op=subscriptionsignin` was replayed without its body `{"step":"state"}`, and the Worker answered each with `503 RUNNER_NOT_CONFIGURED` (checked by hand: with the body, `200`); those 503s are removed below. **Run 2 (15:55-16:14Z) sends the body.**

| members (+ admin walkers) | run 1: real errors (502/0) of requests | resets (requests killed), "overloaded" lines | run 2: errors of requests | resets (requests killed), "overloaded" lines |
|---|---|---|---|---|
| 5 (+1) | 0 of 552 (0 %) | 0, 0 | 0 of 664 (0 %) | 4 (12), 0 |
| 10 (+1) | 1 of 1,027 (0.1 %) | 2 (25), 0 | 0 of 1,071 (0 %) | 2 (10), 0 |
| 15 (+2) | 190 of 1,811 (10.5 %) | 8 (161), 32 | 51 of 1,636 (3.1 %) | 1 (10), 0 |
| 25 (+3) | 363 of 2,544 (14.3 %) | 9 (90), 94 | 1 of 3,275 (0.03 %; one network error) | 5 (6), 0 |

Run 2 member frame times (p50 / p90 ms, raw): at 15 members Home 1,818 / 11,742, Queue 1,634 / 16,507, Project 2,294 / 9,279; at 25 members Home 1,986 / 3,891, Queue 1,477 / 5,267, Project 2,109 / 5,422, Projects 1,166 / 3,069; administrator frames 2.1-13 s at every step (as at idle, §1b-full). Uploads answered 200 in 2.0-5.3 s except one `500` at step 5 of run 2. A "resets" count merges memory-limit events within 2 s of one another (one reset logs one event for every request it kills).

**Reading.** (1) **Errors do not follow the member count.** The two runs, on the same build and the same method, give 10.5 % and 3.1 % at 15 members and 14.3 % and 0.03 % at 25: the spread between runs is larger than the effect of 10 more members. (2) **Resets happened at every step of both runs** (4, 2, 1, 5 in run 2 even at 5 members), so the room reset with five members, an administrator walker and an upload a minute; what differed is what followed: **in run 1 the resets were followed by Cloudflare's shed ("Durable Object is overloaded. Requests queued for too long.", 126 lines) and 161 and 90 requests killed per step; in run 2 no overload line and 6-12 requests killed per step.** The errors the members meet are therefore the resets' victims plus the overload cascade after them. (3) **What made run 1 worse is not established.** Candidates, none tested: the reading of the study's earlier uploads still in progress in the alarm (the piece test's 36 uploads ended 15:11Z; run 1 began 15:33Z; no backlog figure was read); run 1's extra 503 replay calls (one per screen frame, each a room call); chance, since a reset's effect depends on how many requests are in flight at that instant. (4) **For N and for load management**: a threshold read from one ramp would have been wrong either way; N needs the room quiesced before each step (no reading backlog: read `op=stats` and the alarm's lines), each step repeated at least three times, and errors counted with the resets that caused them. The members' own frame times are inside 2 s raw at the median for Projects, Queue and Home at 25 members and the p90 is 3-17 s: **the slowness members would feel is in the tail, which is the queueing the load-management draft is about.**

## Local workerd memory study (`proto/levels-2-3-mem` 360f8860; a worker's measurements, PLATFORM #3 spot-checked the baseline and one chain against the raw files) (2026-10-28)

**Method (the worker's README, `proto-mem/README.md`).** The plane bundle (the committed `bio-plane.bundled.mjs`, or the same built with a Store subclass that ticks one scheduler consumer) runs in local workerd through Miniflare; memory is read from outside (`/proc/<pid>/status` VmRSS and VmHWM, high-water mark reset before each operation) and the isolate's JS heap from the V8 inspector (`Runtime.getHeapUsage`, polled 15-50 ms). Documents go in through the product's own door (`captureupload`, `allocid`, `promote`); text is random words, 12 a line, about 91 bytes a unit. Rooms seeded through the door: 100 documents (111,703 units) and 580 documents (1,492,508 units, the live room's size). **What a local run cannot show:** workerd does not enforce 128 MB; its RSS includes the runtime; the inspector answers neither `collectGarbage` nor `takeHeapSnapshot` and `memoryUsage` answers zeros, so **retained data cannot be told from garbage not yet collected**; only synthetic ASCII text, no PDF, office or OCR (stubs), one team. Compare differences, not absolutes.

**Measured (MB).**
| | result |
|---|---|
| trivial Worker, same bindings | RSS 81.6 before a request, 85.6 after |
| **the plane bundle loaded, no request** | **RSS 236.6-240 (3 runs); JS heap used 52.2, committed 63.2**; after the first request (Store instantiated) RSS 253.8-257.2, heap used 54.6 |
| a fresh process's baseline | does not depend on the room's size (253-262 in the 100- and the 580-document rooms; run-to-run noise about 8) |
| `captureupload` (door), peak above baseline | +12 to +21 (1 MB file), +33 to +35 (1.9 MB), +46.5 (8 MB) |
| `promote` | +7 to +11 (1 MB), +10 to +11 (1.9 MB) |
| first read piece (the whole object is read: R2 `get` with no range; `WHOLE_READ_MAX` 24 MiB) | +7.6 to +7.9 (1 MB), +8.9 to +9.4 (1.9 MB), +30.3 (8 MB) |
| later pieces (a byte window of `WINDOW_BYTES` = 1 MiB, a ranged get, whatever the piece's units) | +2 to +5 each |
| every alarm consumer in one call, at the live room's size | at most +9.3 (`pending-work`, first piece), `file-render` +8.7, `document-copy` +8.1; the whole `onAlarm` +13 to +20; every other consumer 0 to +0.6 |
| **a chain of pieces and alarms in ONE process** (the live shape), 1.9 MB file | **+49 to +56 RSS** at 4,096 units (heap used 79-84, committed 102-106); **+62 to +95** at 512 units |
| the same, 8 MB file | **+138 to +162 RSS**; heap used 110-127, committed 152-157 (the raw file: +135.7, used 122.2, committed 161.8) |
| three 8 MB files in a row | the floor of used heap climbed 53 to 97 over the run (committed 68 to 166, RSS 255 to 414) |
| the growth is in the `pending-work` reading path | ticking only `pending-work` +136; `onAlarm` back to back +141; the natural alarm +159; with no inspector attached +141 |
| `PROTO_READOUT=1` (units to R2, no rows) | **worse**: +223 RSS, heap used 153, committed 195; control `=0` +126 |

**What this says (measured, then inferred, kept apart).**
1. **Measured:** no single call or consumer takes more than about 9 MB above its baseline (the door's upload of a 1.9 MB file, +33, is the largest single step). **A chain does: memory climbs over many consecutive pieces and alarm firings within one isolate lifetime**, and a 1.9 MB file's chain adds 49-56 MB RSS and about 25-30 MB of JS heap. **The plane's own code, loaded and idle, holds about 52-55 MB of JS heap** before any work, with RSS 155-175 MB above a trivial Worker.
2. **Measured, matching the live studies:** writing units to R2 instead of rows does not help (it was worse locally, as live); a smaller piece does not help (**+62 to +95 at 512 units against +49 to +56 at 4,096**), **because the window does not shrink: a 512-unit piece reads about 1 MiB of the file for about 47 KB of text**, so 40 pieces read 40 MiB where 6 read 6 MiB.
3. **Inferred, not shown here:** the live room dies because the idle heap (about 55 MB if production counts it so) plus a chain of readings of 1-2 MB files plus the requests in flight (an upload alone takes 12-35 MB) leave little of the 128 MB, and the chain's growth is not given back between pieces. Whether the growth is retained data (a leak in the reading path) or garbage V8 has not yet collected is **unknown**. Where the retaining code is, is unknown; only the `pending-work` path was examined.

**Proposals from this (for BOB; the architecture ones are Bob's).**
- **(i) Bound the chain, not the piece**: the work one isolate does between rests (bytes read since the object started), with the window sized to the piece's units (not a fixed 1 MiB), so a smaller piece reads less.
- **(ii) Read in another isolate**: the file parse and unit building run outside the store object (a worker of the fleet or a reader object) and only the finished units land in the room; the store's memory is then not a function of file size. Not tested; the reading code would move.
- **(iii) A deliberate restart at a quiet moment**: when the sense of risk (load-management draft §2a) is high and the line is empty, end the object's life on purpose so a reset never meets requests in flight. Whether the platform allows this is **not verified here**.
- **(iv) Lower the baseline**: 52-55 MB of heap is spent on module evaluation; which modules weigh, and whether rarely used ones (PDF, OCR, agent) can load on demand, is unmeasured.
- **(v) Calibration for the gate**: the table above is the first cost per call (door upload about 12-35 MB, first piece 8-9, a later piece 2-5, the alarm 13-20), to reserve by size; to be checked against live resets.

## Chain bound, window sized to the piece, and a forced GC (`proto/levels-2-3-chain` 9a0e6075; a worker's runs, PLATFORM #3 re-derived the table and the GC series from the raw files) (2026-10-28)

**What was built (env flags; unset = the base).** `PROTO_WINDOW_BYTES=<n>|auto` (`reading-pipeline/index.mjs`): the byte window a later piece reads, clamped to 16 KiB-1 MiB; `auto` = piece units x 256 B, clamped to 64 KiB-1 MiB (512 units: 128 KiB; 4,096: 1 MiB). `PROTO_CHAIN_BYTES=n`, `PROTO_CHAIN_REST_MS` (20,000): a per-isolate count of bytes the reading consumer reads (`store-assembly/pending.mjs`, `extraction/index.mjs`, `reading-pipeline`); past n it starts no further piece, makes every owed read row due after the rest (staggered 1 s apart: one deferred row stalled the chain through the scheduler's anti-spin hold, found and fixed by the worker), and the counter resets at the first tick after the rest. Deployable bundle `bio-plane/dist/bio-plane.bundled.mjs` sha256 8299fcc926edb56073c8dfa685c5252fb1967cf975a0614f8ec733e73fee33b5 (re-hashed from origin). Tests: the worker's 17 of 17 pass; the full suite did not finish (hung in a browser-world test); four failing files give the same 14 passed, 20 failed on the base 360f8860 and on this branch.

**Measured** (local workerd, one cold process per case, owed files in a room seeded with 100 documents; RSS peak above baseline in MB; heap-used floor = minimum in each 3 s window, first / last; raw: `proto-mem/results/chain-<size>-<case>.json`; table: `node proto-mem/summarize-chain.mjs chain-8mb` and `chain-3x8mb`; one run each, noise about 3-5 MB):

| case | 8 MB file: peak, floor last | 3 x 8 MB: peak, floor last |
|---|---|---|
| base (piece 4,096) | 131.6, 83 | 201.4, 137.9 |
| piece 512 | 171.6, 86.8 | 210.5, 54.2 (max 103.7) |
| piece 512 + window auto | **122.7**, 79.1 | **176.4**, 88.2 |
| piece 4,096 + window auto | 141.1, 92.6 | 200.0, 118.3 |
| base + chain (16 MiB, 20 s) | 126.3, 83.4 (max 111.6) | 177.4, 74.6 (max 118.3) |
| piece 512 + chain | 83.9, 52.7 (max 90.6); 213 s against 12 s | not run |
| piece 512 + auto + chain | 85.4, 54.7 (max 70.2) | 174.9, 53.6 (max 116.9) |

**Reading (measured, then what it does not show).**
1. **Sizing the window to the piece lowers the peak at piece 512** (8 MB: 171.6 to 122.7; 3 x 8 MB: 210.5 to 176.4) and undoes the worsening that a 512 piece caused; at 4,096 it changes nothing (same window). The heap floor still climbs in every case without a chain.
2. **The chain bound lowers the peak mostly by slowing the reading** (the 512 case: 83.9 against 171.6, in 213 s against 12 s); with three 8 MB files the peaks are 175-178 with or without it. **The first piece of a file reads the whole object (up to `WHOLE_READ_MAX`, 24 MiB) and dominates the peak**, which a rest between pieces cannot bound.
3. **Local workerd never evicted the idle object in a 20 s rest** (`isolate_age_ms` kept growing; RSS and heap did not move during a rest), so **whether the platform's eviction after a rest releases the memory is not testable here and is unknown.** Imitating a recycle (restarting workerd every 10 s on the persisted room): peak above baseline by segment, base +194.7, +73.4, +51.2; piece 512 + window auto +183.9, +50.9, +52.4, +24.9 (`recycle-3x8mb-*.json`); each new process restarts the floor at about 52.8 and climbs 10-17 MB in a 10 s segment.
4. **Forced GC** (a patched Miniflare giving workerd `--expose-gc`, `proto-mem/make-patched-miniflare.sh`; `gc-probe-*.json`): a GC every 2 s returns the **used heap to 52-59 MB every time** (the series falls from 105.4 to 58.2 at 7.6 s in `gc-probe-3x8mb-base.json`), flat over three 8 MB files. **So, in the heap as the inspector reports it, the growth is garbage V8 has not yet collected, not retained data.** But **the committed heap stays at 113-148 MB** across those collections (third column of `heap_series`) and RSS stayed about 60 MB above baseline; **which of used heap, committed heap or RSS the platform's 128 MB counts is unknown.** A forced GC cannot be used in production.

**What follows (proposals, for BOB).** (a) Size the window to the piece (measured gain at piece 512). (b) The first piece should read in windows too (the whole read dominates the peak: +30 MB cold for an 8 MB file, `s1-b-ramp-memory.md` memory study). (c) Since the growth is uncollected garbage, **cut the garbage a piece makes** (the transient strings, arrays and decoded text per piece) rather than only pacing the pieces: the next measurement is an allocation profile of one piece (the inspector's sampling heap profiler, not yet tried) to name the functions that allocate most. (d) The chain bound and rest stays a prototype until the platform's behaviour after a rest is seen on `plat-s1` (resets per minute with and without it; the control arms are 1.8, 3.4 (units to R2) and 2.0 (piece 512) a minute).
