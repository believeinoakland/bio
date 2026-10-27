# Diagnosis R6 shape: fix round 6 checked at the platform's shape (K4426 (4), K4597 E3; read-only on product source; measured 2026-10-22, tranche/T51 at 9452ddd27f)

## What was built, and what its numbers are
`bio-plane/test/m/plane/shape/harness.mjs` (E3, reusable, README comment at its top) starts the real plane `Store` (`plane/fixture.mjs`, `plane/register.mjs`) in a **node child whose old space is 128 MB less the file's bytes** (no "idle +"; the plane's own idle heap, 86-88 MB measured, is inside the cap), feeds a document by the member's path (`captureOf(ctx).uploadCapture`, the capture screen's promotion with the whole first in the register, the door's `pendingadd`), then fires the ledger's alarm tick by tick to the end. Per tick: wall ms, peak heap + array buffers (less the stand-in bucket's bytes, which R2 holds), ledger rows, text rows written, and whether the child died. After the ticks it asks `op=reading` (extraction `readingFor`) as the Document screen does. Fault mode `{remote:true}`: the door's first call on the first stub throws and that stub stays broken; the door takes a fresh stub (`fault.probe.mjs`: 2 stubs, 1 fault, reading read, holds).

**Limits to read the numbers by.** This is node, not workerd: old space is capped, array buffers are outside it (so `peak` is added by the harness and compared with 128), node:sqlite's own memory is in neither figure, and node has no CPU limit (R-CLOCK: workerd's clock is frozen inside the object, so `ms` is node wall time, the compute cost). A child that outgrows its cap dies (SIGABRT, "Ineffective mark-compacts"); that is the check. The plane's idle is 86-88 MB, so only about 40 MB of the 128 is the work's: any cap below about 98 MB kills any read. No raw-workerd run was made here.

Files (all in `bio-plane/test/m/plane/shape/`): `harness.mjs`, `g13.probe.mjs`, `keep40.probe.mjs`, `g26.probe.mjs`, `g15.probe.mjs`, `fault.probe.mjs`. Nothing else was touched; no commit.

## Verdicts

| item | verdict |
|---|---|
| a. G13 12,000,060 B text | **holds** at the shape |
| a. G13 24 MiB text | pieces and memory hold; **first tick 14.0-16.6 s, over 10 s** (cause below) |
| b. 2a-5 40 MB `keep` and reading statement | **holds** |
| c. G26 assembled, BUDGET-2024-APP | **fails**: tick 1 12.4 s over 10 s; memory at the ceiling; `op=reading` on the finished reading kills the child |
| d. G15 1 MB CSV | content correct, **fails at the shape**: the read tick dies at the 127 MB cap |
| e. G14 unclosed head, G15 sheet blocks never seen red | **now seen red**: 5 of 5 red on the code before cc3c133526, 5 of 5 green on the tree |

## a. G13: the 12,000,060 B and the 24 MiB text
Command: `node bio-plane/test/m/plane/shape/g13.probe.mjs 25165824:96 25165824:90` (the first two runs are the real caps: 116 and 104 MB; the rest are margin runs).

| text | cap | ticks | max tick | peak (heap+buffers, of 128) | ENDMARKER | search op | result |
|---|---|---|---|---|---|---|---|
| 12,000,060 B (2 parts) | 116 | 30 | 6,855 ms (tick 1; the rest 0.15-0.9 s) | 101-108 MB | in `capture_text_fts` (1), last unit seq 120000 "ENDMARKER" | 1 hit | state whole, offered = written = 120,001, over_bound 0, read_through 12000060/12000060, ledger empty |
| 12,000,060 B | 100 | 30 | 7.6 s | 103 MB | 1 | 1 hit | survives (idle 86 + 14) |
| 24 MiB 25,165,824 B (3 parts) | 104 | 62 | **13,967 ms** (tick 1; the rest 0.26-0.8 s) | 116 MB | 1 | 1 hit | state whole, 251,658 units, read_through 25165824/25165824, ledger empty |
| 24 MiB | 96 | 62 | 16,596 ms | 115.6 MB | 1 | 1 hit | survives |
| 24 MiB | 90 | dies | | | | | SIGABRT, heap out of memory (idle 86.4 MB) |

`op=reading` after the read: 4,096 units, 824 KB, 64-139 ms, peak 94-115 MB (a page of 4,096 units; `next` 4095, so the rest is reached by paging). Every piece completes and the last line reaches the index and the search at both sizes. **12 MB holds** (ticks under 7 s, 20 MB spare). **24 MiB**: memory fits with about 12 MB spare and the child lives down to a 96 MB old space, but **tick 1 is 14.0 to 16.6 s**, over the 10 s bar (and about half the object's 30 s CPU); ticks 2-62 are under 1 s.

**Cause of the long first tick (seen, not fixed).** The first piece of a text is read without a cursor, so `readInner` classifies the WHOLE decoded text: `reading-pipeline/index.mjs:1918` `doctypeFor({...profCtx})`, where `profCtx.text` is the whole text (:1916, the text decoded at :1890), runs `docprofile/doctypes/registry.mjs:85` `doctypeFor` and `:102-112` `alsoFor`, which calls every registered type's `detect` over the whole text; the roster detectors (`roster-reader/staff-roster.mjs:123-128`, `roster-reader/org-chart.mjs:50-56`) walk it line by line (`roster-reader/lines.mjs:176` `eachLine`, `:112-117` `withoutContacts`, `:56-58`, `:259`). A CPU profile of tick 1 at 24 MiB: `readInner` 12.8 s of 16.1 s; `tidy`/`words`/`isUnitLine` and the contact regexes are the top self-time; GC 3.7 s. Later pieces skip it (the cursor shortcut, `:1903-1910`). Cost is linear in the text: 6.9 s at 12 MB, 14-16.6 s at 24 MiB, so any text over about 17 MiB passes 10 s on this path.

## b. 2a-5: the 40 MB upload's `keep` and its reading statement
Command: `node bio-plane/test/m/plane/shape/keep40.probe.mjs 104 98 90 60`. The file: 40,014,922 B, 5 parts of 8 MiB, uploaded by `uploadCapture`; the store's whole-making is made not to end inside the request (`keepLater: "ledger"`), so `keep_pending` is true and the ledger holds a `keep` row. Real cap 112 (128 less two 8 MiB parts the object holds at once).

| cap | result |
|---|---|
| 112 | survives. 1 tick, **331-441 ms**: `keep` (record-core `putFromParts`) ends and the `reading` it enters ends in the same tick; ledger empty. Peak heap + buffers 117.4 MB (31 above base; array buffers freed lazily). The reading is **stated with its size**: "the capture is 40014922 bytes in 5 parts, over the 25165824 B a format entry is handed here, so it was not read"; completeness `stated`; 0 units, nothing loaded |
| 104, 98 | survive, same peak |
| 90, 60 | die (idle 86 MB; nothing fits) |

**Holds.** The upload itself (streamed in under the same cap) takes 1.0-1.3 s. `op=reading` answers the statement in 3 ms. Limits: the multipart upload is a stand-in whose parts are handed over without a copy and whose whole is a length-only stand-in, so R2's own buffering is not measured; the harness measures what the object holds, which is the question.

## c. G26 assembled: BUDGET-2024-APP through the real Store
Command: `node bio-plane/test/m/plane/shape/g26.probe.mjs 136 124` (real cap 112 = floor(128 − 15.2); the file is the pinned `/tmp/bio-test-fixtures/BUDGET-2024-APP.pdf`, sha 6e0b3dc5…, 15,932,155 B, uploaded in 2 parts, 1,354 pages).

| cap | ticks | per tick | peak | outcome |
|---|---|---|---|---|
| 112 | 7, 46.8 s | **12,437**, 5,940, 6,106, 6,083, 6,127, 5,808, 4,276 ms | 126.8-128.0 MB of 128 | all 7 ticks complete, ledger empty, `capture_text_state` whole, 1,328 pdf-page units (none cut, longest 19,902 chars); **tick 1 over 10 s; then `op=reading` kills the child** |
| 124 | 7, 36 s | tick 1 9,655 ms | 137 MB | ticks complete; `op=reading` kills the child |
| 136 | 7, 31 s | tick 1 8,905 ms | 146 MB | ticks complete; `op=reading` kills the child |
| none | 7, 25 s | tick 1 7,986 ms, tick 7 2,285 ms | 447 MB (lazy GC) | completes; `op=reading` answer 1,328 units, **13,985,161 B**, 331 ms |

Against `pdf-pieces.test.mjs` (alone, no plane: slowest piece 3.3 s, 1.4 parses) the plane adds its own 87 MB idle, so the pieces run in GC-bound time: **a piece is 4.3-6.1 s at the real cap and the first 12.4 s.** Tick 1 profile at the cap (13.2 s): GC 5.6 s, `doctypeFor` 2.1 s (the roster detectors again, `reading-pipeline/index.mjs:1918`, `registry.mjs:85,102`), `readText` 2.1 s (`docprofile/readtext.mjs:273`), `pdfstructure.mjs` `run` :2361 0.9 s, `doc-clean/pdf.mjs:35` 0.7 s. The tick sits at the ceiling (peak 128.0 of 128 MB before any isolate or native overhead), so it lives on collections.

**Failures, with the cause seen:**
1. **Tick 1, 12.4 s (over 10 s)**: GC at the cap (5.6 s of 13.2 s) plus `doctypeFor` and `readText` on the first piece (above).
2. **`op=reading` on the finished 0111 kills the object, at caps 112, 124 and 136**: `extraction/index.mjs:1273-1299` `readingFor` returns `unitsOf` (:1455-1467), a page bounded by 4,096 UNITS (`CAPTURE_TEXT_CAPTURE_UNIT_BOUND`), not by bytes; this document's 1,328 units are 13.99 MB of text, held as rows, as the mapped copy (:1299) and as the answer. It needs more than about 50 MB live beyond the plane's idle. This is the screen's read of any large PDF whose text is long, not only 0111; it is reached after the reading is done and by every Document screen load.
3. Memory: peak 128.0 MB against the object's 128 during the ticks.

## d. G15: a 1 MB CSV through the real reading path
Command: `node bio-plane/test/m/plane/shape/g15.probe.mjs 136 0` (1,048,660 B, 18,098 rows, last row `LASTROWMARK`; real cap floor(128 − 1) = 127).

- **Cap 127: the child dies in the read tick** (SIGABRT, heap out of memory; fed fine, upload 1.0-1.1 s). 130 dies too; 136, 144, 160, 200 and no cap survive. Peak when it lives: **133 MB (45 above the 87.6 idle), 2.6-3.2 s for the tick.**
- At 136 (survives): 1 tick, 8 units (`sheet-range`, 0 cut, longest 131,064 chars, under the 131,072 cap; the header row repeated in each block), `LASTROWMARK` in `capture_text_fts` (1), found by `op=search` with `passage:LASTROWMARK` (total 1, 1 hit), the last unit's reference `csv!A17040:D18098` (the true rows 17040-18098; the last row is row 18,098). So the row blocks and the row-range citation are right: **no row-block unit cut**.
- `op=reading` on the finished CSV answers **12,872,074 B for a 1 MB file** (8 units, 151 ms, peak 130 MB at cap 136): the answer carries more than the units.

**Fails at the shape (the read tick needs about 133 MB of the 128).** Cause seen: a read of a text holds the bytes, the csv-reader's records, `lines`/`lineRows` and the joined sheet text (`csv-reader/index.mjs:780-796`), and `doctypeFor` over the whole text (`reading-pipeline/index.mjs:1918`, `registry.mjs:102-112`): `doctypeFor` alone allocates 129 MB of garbage over this 1 MB text (310 MB for the whole `read`; measured with the young generation made big enough that nothing is collected), and after the full collections 30 MB stays live, on top of the 88 MB idle. `read` alone (no plane) peaks 49-54 MB above its base.

## e. Never seen red: G14 unclosed head, G15 sheet blocks (R41)
Command: scratch worktree at `cc3c133526^` (667bb02db3, the commit before reading-pipeline's G14/R40/R41/unclosed-head commit `cc3c133526`, which is the only one that touches these; `git log -S"unclosed"`/`-S"lineRows"` agree), test file copied in from the tip, `node --test --test-force-exit bio-plane/test/m/reading-pipeline/pieces-formats.test.mjs`. Worktree removed after (`git worktree list` shows only /home/user/bio).

| test (tip file line) | before the fix | on the tree |
|---|---|---|
| R40 6,000-paragraph DOCX in pieces (:30) | red | green |
| R40 300-page dense PDF in pieces (:61) | red | green |
| **R41 a sheet over the cap carried as blocks of whole rows (:83)** | **red: "1 blocks"** (one unit, cut) | green |
| R41 control: a sheet within the cap is one unit (:108) | red (the cursor fields it asserts do not exist yet) | green |
| **R32 (G14) an unclosed head drops only the head (:122)** | **red: `'' !== 'Hello body'`** (the body's text is dropped) | green |

`# tests 5, pass 0, fail 5` before; `# tests 5, pass 5, fail 0` on the tree. The same five fail with the file as it stood at `cc3c133526`. The R41 control is red for a new field, not for the old behaviour it guards; it is not a red-first witness.

## Not covered
Raw workerd at 128 MB was not run (the harness is node); the cap model's gap to workerd is the isolate and native overhead, which only makes the margins above smaller. Not run: OCR pages, the 60-page scans, XLSX/ODS through the same path (only the CSV), a PDF over 24 MiB. The 10 s bar is node wall time; workerd's CPU limit is 30 s.
