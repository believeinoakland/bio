# Diagnosis R6 G40: where a 1 MB CSV's read goes at the platform's shape (BOB #256; measured 2026-10-22 on tranche/T51)

**Status** · Diagnosis worker for BOB #256. Product source unchanged, nothing committed (`git status` shows only this file). Product source measured is that of `3b7e291b62` (verified: `extraction/index.mjs`, `csv-reader/index.mjs` are byte-identical there and at HEAD `f157b2f85f`; `reading-pipeline/index.mjs` and `setup-words/rows.mjs` changed after, see "Tree moved under the run"). Node v26.10, workerd 2026-07-22 (`bio-plane/node_modules/.bin/workerd`), 4 cores. Scratch (outside the repo): `/tmp/claude-0/-home-user/a99d9263-4a03-5a57-81ae-e0298c6da980/scratchpad/` (`bisect.mjs`, `variant.py`, `stages2.mjs`, `words.mjs`, `csvwd.probe.mjs`, `wd/run.sh`; a 500 MB source copy `copy/` the variants were applied to; the repo was never edited).

## Findings in one page

1. **D = 38.7 MB (call it 39).** Harness node-child idle 87.6-87.9 MB (the `fed.idleMB` of every run) less the plane's ASCII bundle in raw workerd, which boots and answers one Store op at `--max-old-space-size=49` and not at 48 (3 runs each; HEAD rebuilt: same). As built (committed bundle) the plane needs 85 (84 fails, 3 runs). Node booting the Store alone needs a cap of 87 (86 fails): by cap against cap, D = 87 - 49 = 38. Real-shape cap for a file of N MB = 128 + 39 - N.
2. **The decisive finding is not memory.** On the platform the 1 MB CSV's read *cannot be stored*: Durable Object SQLite refuses a value over about 2.1 MB (`SQLITE_TOOBIG`, measured in raw workerd below), and the stored reading of a 1 MB CSV is **11.27 MB** of JSON (`cells`). In workerd (Miniflare, real DO SQLite, real extraction `readHeld`) a CSV of 188,847 B reads; one of 209,811 B throws `string or blob too big: SQLITE_TOOBIG`; so does 1 MiB. The E3 harness is node:sqlite, which has no such limit, so it cannot see this. G40 as drafted (serialise once) does not change the 11.27 MB row.
3. **Memory at the real shape for the 1 MB CSV:** it already survives (node needs cap 133, the platform gives 166). The copies matter from 2 MB: with the deep copy dropped (a) it survives 2 MB, not 4; with the cell shape compacted (b) it survives 4 MB, not 5; both give the same as (b). Beyond that the walk's retained records (14.9 MB per MB of file) set the floor, and only the existing streaming path (csv-reader R9, no records, no cells) holds at 8 MB (117 against 159).
4. **words_read > words_total:** the header row R41 repeats at the head of each later block is counted again by the piece's words. Owner reading-pipeline. Already fixed at HEAD by READING-PIPELINE #25 (`5c87fd6a94`, merged `5e09498204`); I confirmed the cause on the old tree and the fix on HEAD.

## 1. The real idle (G39)

Commands (scratch; no repo file touched). The ASCII bundle was built *without writing* through the recipe's own functions: `node build-ascii.mjs out.mjs` = `planeMember()`, `buildMember(m, {write:false})` from `bio-plane/scripts/fleet-bundle.mjs` (its `asciiOptions`/`asciiOutput`, `fleet-bundle.mjs:822-890,1135`), the bytes written to the scratchpad. "As built" is the committed `bio-plane/dist/bio-plane.bundled.mjs`. The raw workerd run is `diagnosis-R6-idle.md`'s: a wrapper module (`main.mjs`: `Store extends` the bundle's `Store` with `ping()` reading `schedAlarmAt()`), the bundle as module `plane`, a capnp config with `durableObjectNamespaces = [(className="Store", uniqueKey=..., enableSql=true)]`, `durableObjectStorage = (localDisk=...)`, top-level `v8Flags = ["--max-old-space-size=N"]`, compatibility date 2026-07-01, `nodejs_compat`. A pass is `/version` answering `0.86.0` and `/store` answering `{"ok":true,...}` within 60 s. Script: `wd/run.sh <bundle> <N>`.

| bundle | bytes | non-ASCII bytes | N tried (pass = P, fail = F) | lowest passing cap |
|---|---|---|---|---|
| as built, committed (`32388221` B) | 32,388,221 | 9,877 | 72 F, 80 F, 84 F x3, 85 P x3, 86 P x2, 87 P x2, 88 P, 92 P | **85** |
| ASCII, rebuilt at 3b7e291b62 | 26,860,795 | 0 | 40 F, 44 F, 48 F x3, 49 P x3, 50 P x2, 51 P x2, 52 P, 56 P | **49** |
| ASCII, rebuilt at HEAD f157b2f85f (setup-words rows regenerated since) | 26,886,423 | 0 | 47 F, 48 F x2, 49 P x2, 50 P; committed bundle at HEAD: 84 F, 85 P, 86 P | **49** (85 as built) |

Node child (the harness): `node --expose-gc --max-old-space-size=N boot.mjs` (register, `plane/fixture.mjs` `store()`, one `sql.exec`): 80 F, 84 F, 85 F, 86 F x2, 87 P x2, 88 P; used heap after boot 84.8-85.4 MB. The harness's own idle with a document fed (`fed.idleMB`): 86.0-87.7 MB, 87.6-87.9 on the CSV runs.

**D = 87.7 - 49 = 38.7 MB.** (By lowest boot cap on each side: 87 - 49 = 38.) The cap bounds V8's old space only, to 1-2 MB (a boot is one pass or one fail); the figure counts neither platform overhead nor R2 streams. Used below as D = 39: a read that survives in the node child at a cap of 128 + 39 - N survives in a plane whose idle is the ASCII 49.

## 2. The E3 probes, alone, on the current tree

Every run alone (one heavy process at a time), `node bio-plane/test/m/plane/shape/<probe>` from `/home/user/bio`. "Real shape" = the probe's cap + D. **This machine runs about 1.4-1.5 times slower than the one READING-PIPELINE #24 timed on** (12 MB text tick 1: 5.1 s here against 3.6 s; BUDGET tick 1: 12.1 s against 8.2 s; 24 MiB: 10.3 s against 7.2 s); times below are this machine's node wall time, not workerd CPU.

| probe, command | cap | result | ticks, max tick | peak (heap + buffers) | at the real shape (cap + 39) |
|---|---|---|---|---|---|
| `g13` 12,000,060 B, `g13.probe.mjs 25165824:143` | 116 | survives; ENDMARKER in fts, search 1 hit, 120,001 units, state whole, ledger empty | 30 ticks, 5,109 ms (tick 1; the rest 0.35-1 s) | 108.5 MB (reading 95.5; paged 30 pages, largest 842,686 B) | **holds** (it survives at 116; 155 not re-run, a larger cap cannot hurt survival) |
| `g13` 24 MiB (25,165,824 B) | 104 | survives; ENDMARKER found, 251,658 units, whole | 62 ticks, **10,272 ms** (tick 1) | 116.1 MB (op=reading 119.7; paged 62 pages) | memory **holds**. Time: tick 1 is 10.3 s here, 7.2 s on the job's machine; at cap 143 tick 1 is 9,941 ms, peak 124.7 (it is CPU, not GC) |
| `g15` 1 MB CSV, `g15.probe.mjs 166` | 127 | **dies** (SIGABRT, read tick); 130 and 132 die too | | | |
| `g15` bisected (`bisect.mjs 1 88 133`, `bis15.mjs 1048576 130 132 133 134 136`) | **133 lowest surviving** (132 dies) | 8 units `sheet-range`, none cut, LASTROWMARK in fts, search 1 hit, last unit `csv!A17040:D18098`; `op=reading` answers 8 units, 1,053,493 B (G38 holds) | 1 tick, 1.7-2.0 s | 133.0 at 133; 136.4 at 166 (48.5 above base) | memory **holds**: needs 45.4 above the 87.6 idle, the platform gives 78 above its 49. **Storing fails on the platform (section 3)** |
| `g26` BUDGET-2024-APP, `g26.probe.mjs 151` | 112 | **survives now**: 7 ticks, ledger empty, 1,328 units (none cut, longest 19,902), `op=reading` 105 units 1,118,848 B, paged to the end: 14 pages, 1,328 units, largest 1,121,430 B | max **12,138 ms** (tick 1; ticks 2-7: 6.5, 6.7, 6.4, 6.0, 6.4, 4.4 s) | 128.1 (at the ceiling) ; reading 122.5 | memory **holds** at 151 (peak 156.9; max tick 8,673 ms, none over 10 s; reading 132.2, paging 146.7). The probe prints "1328 of 1354 (every page once: false)": its own check compares units to pages; the reading says `read_through 1354/1354, whole`; which 26 pages have no unit (blank pages are dropped by `indexUnits`, D-531) is **not measured** |
| `keep40` 40,014,922 B, `keep40.probe.mjs 151` | 112 | survives; 1 tick; stated with its size ("over the 25165824 B a format entry is handed here, so it was not read"), 0 units | 449 ms | 117.4; reading 118.4 | **holds** (cap 151: 458 ms, peak 101.5) |

**In-workerd run of the CSV read: feasible with existing tooling, and I did it.** `bio-plane/test/m/extraction/round6-l.probe.mjs` (Miniflare: workerd, real DO SQLite, real R2 binding, real extraction `readHeld`) with the held text replaced by the probe's CSV (`csvwd.probe.mjs`, same generator as `harness.mjs:128-134`; the document's profile `csv`, content type `text/csv`). It is the plane's Extraction composed over a Durable Object, not the whole plane, and Miniflare applies no old-space cap (the process resident set it prints is not a cap reading). What it does see is what node:sqlite cannot: the platform's SQL limits.

| command (from `bio-plane/`) | size | result |
|---|---|---|
| `node csvwd.probe.mjs <dir> 0.1 0.18` | 104,962 B; 188,847 B | read to the last row, 1 tick |
| `... 0.2 0.25 0.5 1` | 209,811 B; 262,214; 524,356; 1,048,660 | **`threw: string or blob too big: SQLITE_TOOBIG`**, state null, last row not indexed |
| raw workerd, the plane's Store, `INSERT` of an `"a".repeat(n)` text: n = 1,000,000 / 2,000,000 / 2,100,000 / 2,300,000 / 11,270,000 | | ok / ok / ok / **SQLITE_TOOBIG** / **SQLITE_TOOBIG** |

The same limit is already in the repository: `record-core/schema.mjs:34` ("Durable Object SQLite refuses a single value above roughly 2MiB with SQLITE_TOOBIG (2,098,176 B passed, 2,252,800 B failed)", where files spill to R2 at 1 MB). Nothing guards `readings.reading` (`extraction/schema.mjs:32`, `reading TEXT NOT NULL`) or `reading_history.reading` (:1099, :1110).

## 3. G40's root cause, measured

### 3.1 The serialisations (confirmed by running, not only by reading)
A hook on `JSON.stringify`/`JSON.parse` (`hook.mjs`, `NODE_OPTIONS="--import hook.mjs" node run15.mjs 1048576`, output over 300 KB logged with its stack) on the harness's read of the probe's 1 MB CSV logged:

| # | site | what | size |
|---|---|---|---|
| 1 | `extraction/index.mjs:658:39` `recordComposed`, called by `read()` :636 and `readHeld` :760 | `sha256HexSync(JSON.stringify(reading))`, the composed-here digest (R21) | 11.27 MB string |
| 2 | `:1086:23` `#keepReading` (called :986 inside `writeReading`) | `json` for the digest and `reading_history.reading` (`INSERT` :1110, bound `json`) | 11.27 MB string, bound into SQL |
| 3 | `:999:14` in `writeReading` | `INSERT OR REPLACE INTO readings ... JSON.stringify(reading)` | 11.27 MB string, bound into SQL |
| 4 | `:1064:37` `#holdAfterRead` (called :1046) | `JSON.parse(JSON.stringify(reading))`: **a string (11.27 MB) and a parse (:1064:26) that builds a second full object graph** | 11.27 MB + a graph of 17.6 MB live |

:658, :999, :1064 and :1086 are all four of the four named in READING-PIPELINE #24's report, with the same line numbers, and :1064 is a stringify **and** a parse. (:664 `#composedHere` did not run: `composed` was true.) The reading is 11.27 MB because `reading.cells` is: every other top-level key of the reading is 0.00 MB at two decimals (the per-key sizes, `stages.mjs`); `cells` is 11.27 MB = 72,392 cells x 147 B.

### 3.2 Live heap, stage by stage (1 MB CSV, plane, node, forced GC at each point)
`variant.py probe` inserted `__probe(label)` (two `gc()` then `heapUsed + arrayBuffers`) in a scratch copy at the sites below; `PROBELOG=probe.log NODE_OPTIONS="--import probe_hook.mjs" node run15.mjs 1048576`, no cap. Idle (harness `fed`, with the hook) 89.1 MB.

| point (file:line, copy at 3b7e291b62) | live heap + buffers | delta | what it adds |
|---|---|---|---|
| after `entry.parts(bytes)` (`reading-pipeline/index.mjs:2052`) | 106.5 | +17.4 | the bytes (1.05), the transport decode (1.0), **`parts.records`: 18,098 arrays of 72,392 strings = 14.9 MB** (`csv-reader/index.mjs:578`) |
| after `entry.text(parts)` (:2053) | 113.6 | +7.1 | the output while records are still held: cells, `lineRows`, text. Alone, **the entry's output retains 17.17 MB** (below) |
| i2text kept as `emitted`, joined `document` dropped (:2112) | 112.2 | -1.4 | |
| reading assembled with `cells` (`emittedFieldsOf`, :2204; passes the same array, no copy) | 113.2 | +1.0 | reading-pipeline's own stages: 1.0 (units 0.1, `readText` 0.9, as J18 said) |
| `readDocument` returned to `Extraction.read` (:636) | 107.7 | -5.5 | records released: the reading is +18.6 over idle |
| `:658` with its JSON live | 119.0 | +11.3 | string 1 |
| `writeReading` entry; after `keepReading` | 107.7; 107.7 | | strings 2 and 3 are transient (not live at the next point) |
| after the `readings` INSERT (:999) | 119.0 | +11.3 | the bound string still referenced |
| `:1064` with the string live | 119.1 | +11.4 | |
| **`:1064` string + deep copy `written` live** | **136.7** | **+17.6** | the second object graph; **peak live heap = 89.1 idle + 18.6 reading + 11.4 string + 17.6 copy = 136.7, 47.6 above idle** |

The entry's output on its own (`stages2.mjs`, warm, scratch variants of the output): **17.17 MB** = `cells` 16.0 (72,392 objects at about 221 B: the typed-cell object, its `source` object, `ref` and `cell` strings, the value) + `lineRows` 0.17 + `text`/`document` 1.0. One cell is 147 B of JSON: `{"source":{"kind":"sheet-cell","ref":"csv!B1","sheet":"csv","cell":"B1"},"value":"name","type":"text","declared":null,"cached":null,"formula":null}`. `lineRows` JSON is 0.09 MB, the sheet text 0.98 MB.

Refuted: that extraction's four serialisations are all *live* at once: 1, 2, 3 are transient (live at the same time as the reading, never together); the live ones are the reading, one string, and (at :1064) the deep copy. The repeated stringify costs time and transient allocation (11 MB each, 4-5 times), and two bound SQL values; the memory peak is the copy plus string at :1064.

### 3.3 Candidate fixes, measured by scratch variants (never committed; the tree is untouched)
`variant.py <name>` rewrote two files in the scratch copy; `bisect.mjs <MB> 88 <hi>` found the lowest `--max-old-space-size` at which the *whole harness path* survives (feed, ticks, `op=reading`, paged to the end) for the harness's CSV of that size (`csvDoc`); one extra MB per size is one more row block. Variants: **base** = the tree; **a1** = `const written = reading` at :1064 (no copy; an upper bound for dropping the deep copy); **a2** = a1 plus one `JSON.stringify` memoised per reading object (WeakMap) used by :658, :999, :1086; **bnull** = `cells = null` in the csv entry (the upper bound of any cell fix); **bgrid** = the cells as an array of row arrays of values (a compact grid, 16 B of JSON per cell; the realistic compact shape); **stream** = the csv entry forced onto its >20 MiB window path (`textPlan(MEASURED_CSV_TEXT_BOUND_BYTES + 1)`, `csv-reader/index.mjs:545`; no `records`, `cells` null).

Lowest surviving cap (MB; "dies at" is one less):

| variant | 1 MB | 2 MB | 4 MB | 5 MB | 8 MB |
|---|---|---|---|---|---|
| base | 133 | 178 | 265 | | 433 |
| a1 (copy dropped) | 118 | 146 | 245 | | 396 |
| a2 (+ stringify once) | 118 | | | | |
| bnull | 105 | | | | |
| bgrid (compact cells) | 107 | 121 | 155 | 172 | 221 |
| a1 + bgrid | 107 | 121 | 155 | 173 | 220 |
| stream (no records, no cells) | 98 | | 103 | | 117 |
| **real-shape cap 128 + 39 - N** | **166** | **165** | **163** | **162** | **159** |

MB saved against base (cap lowered): **(a)** 15 / 32 / 20 / 37 at 1 / 2 / 4 / 8 MB (the copy is 17.6 MB live per MB of file; it is the peak only while the string is also live); **(a2)** nothing more than (a): the memoised string changes no peak once the copy is gone (118 against 118), its worth is time and the 3 x 11 MB of garbage; **(b)** 26 / 57 / 110 / 212; (b) is larger the bigger the file because cells are 16 MB per MB, held in the reading, the JSON and the copy; **both** adds nothing to (b) (the copy of a 1.1 MB reading is small).

**Which CSV sizes survive at the real shape, by memory** (survives when its lowest cap is at or under the real-shape cap):

| | 1 MB | 2 MB | 4 MB | 5 MB | 8 MB |
|---|---|---|---|---|---|
| none (today) | yes (133 <= 166) | **no** (178 > 165) | no | no | no |
| (a) alone | yes | yes (146 <= 165) | **no** (245 > 163) | no | no |
| (b) alone | yes | yes | **yes** (155 <= 163, 8 spare) | **no** (172 > 162) | no (221 > 159) |
| both | yes | yes | yes (155) | no (173) | no (220) |
| streamed csv entry (no records, no cells) | yes | | yes (103) | | **yes** (117 <= 159) |

With (b) the floor is the entry's `records` (14.9 MB per MB, `csv-reader/index.mjs:578`, `walkRecords` over the whole text) plus the text decodes: the cap rises 16-17 MB per MB of file (121, 155, 172, 221). Only not keeping the records holds a CSV up to its 20 MiB bound (the stream row: 98, 103, 117, about 2.7 MB of cap per MB of file).

**By the platform's SQL limit** (section 2) none of (a) or (a2) helps at all: the row stays 11.27 MB. (b) grid: the reading is 1.10 MB of cells per MB of file, so in workerd a 1 MB and a 1.5 MiB CSV read through `readHeld` (variant bgrid, `csvwd.probe.mjs`, ok), a 2 MiB one throws `SQLITE_TOOBIG`; the stored value limit of about 2.1 MB allows a compact grid to about 1.7 MiB of CSV. A CSV between 1.7 MiB and its 20 MiB bound can be stored only if its cells are *not in the one reading row* (not carried, or in rows of their own under 1 MB): that is the shape of the fix, and not a detail of extraction. Streamed (cells null) `op=reading` answers 1,053,461 B at 1 MB and 1,130,570 B at 8 MB (flat); the stored row without `cells` is small by construction (the other keys are 0.00 MB), its size was not printed.

### 3.4 Owners and requirement ids
| fix | module (`build/modules.json`) | requirements |
|---|---|---|
| (a) serialise once (one `{json, digest}` per reading object), no deep copy inside the transaction, the hooks' input made lazily after commit and only when a hook can run | **extraction** (`bio-plane/src/extraction/`): `recordComposed`, `writeReading`, `#keepReading`, `#holdAfterRead` | `extraction.md` R19 (the writer), R21 (composed digest), R23 (history keyed by the JSON's digest), R69 (afterRead), R30 (`readingOf` answers the stored reading whole); `reading-pipeline.md` R43 (`ReadHooks.wants`, merged 36714d0e14), `hooks.mjs` |
| (b) the cell shape, or cells not in the reading's row | **csv-reader** (`bio-plane/src/csv-reader/`) for the entry's output (R8 the `cells` list, R16 `lineRows`, R9 pieces/`cells` null); **reading-pipeline** for what it carries (R28: cells "as the entry emitted them... neither is altered", `emittedFieldsOf` `reading-pipeline/index.mjs:1716-1723`); **extraction** for where the row is stored (R19, `readings`/`reading_history`); readers of `reading.cells`: **content** R52 `cellsAt`, R46 (`content/index.mjs:1114,1258,1277,1299`, `notice.mjs:110`), **retrieval-browse** R8 (`findin.mjs:350-394,652`) | as listed; the same applies to the other containers' cells (xlsx, ods, docx tables: R28's cells have the same shape and the same limit) |
| records not retained / the 20 MiB walk bound | **csv-reader** (`csvParts` :535-600; the comment :225-267 says the 12x was measured in node alone and "THE DECIDING MEASUREMENT HAS NOT BEEN TAKEN") | csv-reader R9 |

**A BOB question, not a job's detail (P17):** the cells of a sheet are a feature (find-in, typed cells) whose shape or storage must change to read a CSV above about 0.2 MB on the platform. Options with the recommendation: (1) cells stay in the reading and are compacted (grid): stores to about 1.7 MiB of CSV, survives 4 MB by memory; (2) cells leave the reading row into rows of their own under 1 MB (extraction's table, `readingOf`/`cellsAt` read them): every size, a change to R28/R19/R30/R52 and their readers; (3) a CSV above a stated size carries no cells, like the >20 MiB path today (csv-reader R9; the sheet's text is still in the units and the index): smallest change, find-in's cell results absent above the size. Recommendation: (3) for the round (it is the existing, measured streaming path: 98-117 MB cap at 1-8 MB, the answer 1.05-1.13 MB), (2) after the tranche if a member needs cells of large sheets. Not measured: the read of an xlsx/ods of the same size (their entries share R28).

## 4. words_read > words_total

**Root cause (measured on the old tree, `3b7e291b62`).** The two sides count different things for a sheet over the unit cap.
- `words_total`: `textWordsFor` (`reading-pipeline/index.mjs:932-942` at HEAD; :921-932 before), `sum(allUnitsOf(i2text))`: the sheet is one unit, its text holds the header row once. 162,878 words.
- `words_read`: the sum of `piece.words`, `for (const u of p.units) words += wordsIn(u.text)` in `listPieceAnswer` (:1465-1467 before), added up per piece by `extraction/index.mjs:1250` into `capture_text_state.words_read` and put on the reading by `readingFor` :1325. The units are `pieceUnitsOf` -> `sheetBlocks` (:1347-1363), and `flush` builds `withHead = ${head}\n${cur...}` for every block after the first (R41: "its first line repeated at the head of each later block"). The 1 MB CSV is 8 blocks: 7 repeated headers x 4 words (`id name amount note`) = **28**, exactly 162,906 - 162,878. (A repeated header also adds 19 bytes x 7 to `read_through`/`total`: 976,404 against the sheet's 976,271 chars.)
- Check: `words_old.mjs` (scratch copy at 3b7e291b62): `read` in pieces over the CSV, sum of `piece.words` = 162,906, `words_total` 162,878, the units' texts sum 162,906, `units sum - total = 28 = (units - 1) x 4`.

**Owner: reading-pipeline** (both counts are its code; R35 against R41 are its own two rules, written in different rounds: R35 fix round 2 "words its text units hold", R41 fix round 6 "header repeated"). **Already fixed at HEAD:** `5c87fd6a94` (READING-PIPELINE #25, merged `5e09498204`) enters a repeated header's block and a word a hard cut splits with their own words (`ownWords`, `withOwnWords`, `leadWords`, `continuesWord`, :921-931, :1362); re-run on HEAD: sum of `piece.words` = **162,878 = words_total**. The second contributor the fix names (a word split by a hard cut at the 131,064 cap in a run of a `doc-para`) I did not measure.

## 5. Why the tests missed G40, and the failing-first tests

**Why missed.**
1. *No test in the suite reads a CSV at the cap with the plane's idle.* The E3 harness (`plane/shape/`) was added in this round and its probes (`g15.probe.mjs`) are `.probe.mjs`, not run by `node --test`; it found the memory (G37), and it is node: the SQL is node:sqlite.
2. *No fixture has the platform's value limit.* `extraction/fixture.mjs:40-49` emulates a workerd limit (LIKE/GLOB pattern, `checkPatterns`) and `plane/fixture.mjs:44-50` its savepoints, but neither refuses a bound text over about 2.1 MB with `SQLITE_TOOBIG`. `extraction/g38.test.mjs:77` ("a 1 MB CSV, read by the real reader as the ledger reads it", `readHeld`) is the nearest test: it reads the same CSV, in node with no cap and unlimited SQL, and asserts the *answer* is under 2 MB and the last row is on a page; its R94 (`cells` named in `reading_omitted`, over 256 KiB) shows the bulk was known and bounded for the answer, never for the stored row.
3. *Every other CSV test is three rows* (`extraction/read.test.mjs:59`, `reading-pipeline/read.test.mjs:102,446`, `emitted.test.mjs:46`, `classify-once.test.mjs:39`); csv-reader's large tests (`large-text.test.mjs`) are over 20 MiB and assert `cells` is `null`: the whole cell list for a mid-sized body is asserted for correctness (`typed-cells.test.mjs`), never for size.
4. *The bound was reasoned, not measured at the plane's shape:* csv-reader's header (`csv-reader/index.mjs:225-267`) records node's 12x and local workerd with no cap, and says the deciding measurement was not taken; the 20 MiB bound kept the figure "the plane already enforces for text". The plane's idle (87 of 128 in node) was not in that sum.
5. *R35 against R41:* the R41 test (`pieces-formats.test.mjs:83`) asserts the header leads every block and the rows once, and no test sums words across the blocks; R35's tests read a page whole or a picture with an unreadable part. The harness never printed `words_read`.

**Failing-first tests (through the real entry path, seen red on today's tree).**

*extraction* (`bio-plane/test/m/extraction/`; fixture `fixture.mjs`, the reading path of `g38.test.mjs:77`: `fresh()`, `readHeld({sha, kind: "reading", storeName: "bio", env: {}})` until no `more`):
- E1 *copies*: wrap `JSON.stringify`/`JSON.parse`; over the 1 MB CSV count outputs/inputs over 1 MB across `read()` and the write. Assert exactly one stringify, no parse over 1 MB inside the transaction. **Red today: 4 stringifies, 1 parse** (section 3.1). Controls (BOB's plan): row, history, `reading_sha256` and the `composed_readings` digest equal to today's code on the same fixture; a mutating hook leaves the stored row and `out.reading` unchanged; `events` still finds the dates.
- E2 *the stored value limit*: give the fixture's `sql.exec` the platform's limit (throw `string or blob too big: SQLITE_TOOBIG` for any bound text/blob over 2,097,152 B; 2,100,000 passes and 2,300,000 fails, measured; `record-core/schema.mjs:34`). `readHeld` of the 1 MB CSV must end `{ok: true, read: true}`, the last row in `capture_text_fts`, and `max(length(reading))` over `readings` and `reading_history` must be under 1 MiB. **Red today: the read throws `SQLITE_TOOBIG`** (reproduced in workerd, section 2). This test is the one whose fix is the BOB question of 3.4. The same shim in `plane/fixture.mjs`, so every plane test sees it.
- E3 *memory at the real shape*: a child with `--max-old-space-size` = (the child's idle with the fixture, measured in the parent by a no-read child) + 79 - N (79 = 128 - the ASCII idle 49; N the file's MB), as `c5b-memory.test.mjs` does, for 2 and 4 MB CSVs (pattern of `harness.mjs`). Today's need above idle: 2 MB 90.3, 4 MB 178.1 against 77 and 75 allowed: **red at 2 MB and at 4 MB**; green after (a) at 2 MB, after (b) at 2 and 4 MB, after the stream at 8 MB (117 - 87.3 = 30 above idle against 71).

*csv-reader* (`bio-plane/test/m/csv-reader/`, `entry.test.mjs` pattern, `csvEntry.text(bytes)` with the harness's generator):
- C1 the output's stored size: `JSON.stringify(t.sheets[0].cells ?? null).length` for the 1 MB CSV is at most 2 x the file (11.27 MB, 10.75 x, today): **red**; a CSV above the stated size has `cells` null (the stream path) and then it holds.
- C2 retained heap: `--expose-gc` child, `await csvEntry.text(bytes)` kept, two `gc()`, retained heap at most 6 x the body (today 17.2 x: 17.17 MB for 1.05 MB): **red**; and the peak above base during `parts()`+`text()` at 4 MB at most 40 MB (today records 15 x).

*reading-pipeline* (`bio-plane/test/m/reading-pipeline/words-pieces.test.mjs` exists since 5c87fd6a94; the equivalents through the entry):
- W1 `read(document, {cursor})` in a loop over the 1 MB CSV (this report's `words.mjs`): the sum of `piece.words` equals `reading.words_total` (**red on 3b7e291b62: 162,906 against 162,878**, green on HEAD 162,878).
- W2 through extraction: after the ledger's ticks, `readingFor(sha).reading.words_read === words_total` and the Document screen's "Read {read} of {total}" (`screens-inquiry/document.mjs:255-257`) never draws read above total.

*plane* (`bio-plane/test/m/plane/shape/`): G1 the E3 harness as a suite test for the CSV ladder: `shapeRun({doc: csvDoc(N MB)}, {capMB: capFor(N) + D})`, D = 39 stated with its derivation (section 1), N = 2 and 4: died false, `readingDied` false (**red today at 2 and 4 MB**: need 178 and 265 against 165 and 163), and the harness reports the stored reading's largest value (`max(length(reading))`) so a value over 1 MiB fails the run (red at 1 MB: 11.27 MB).

## 6. Tree moved under the run, and not measured
- The checkout is shared: HEAD moved from `3b7e291b62` to `f157b2f85f` while I worked (G40 seam K4624 `19bda6521f`; READING-PIPELINE #25 `5e09498204`; setup-words rows regenerated at DEC-419 `cc6c880845` 22:23; mails). The probes of section 2, the stage and variant measurements ran on the `3b7e291b62` source (verified identical for `extraction`, `csv-reader`); the ASCII idle was re-measured on HEAD (49, unchanged); `words.mjs` was run on both. I did not re-run `g13/g15/g26/keep40` on HEAD; READING-PIPELINE #25 changes the words only and R43 only a hook predicate.
- Not measured: a raw-workerd run of the whole plane reading a CSV at a real old-space cap (it needs an R2 stand-in; Miniflare has none of the cap); the ledger tick's CPU in workerd; the same limit on xlsx/ods/docx cells and on the PDF reading's row (BUDGET's stored reading size was not printed); the re-read parses (:977, :1096-1100, :960, :842, :717) the plan names; the 26 pages of BUDGET with no unit; `extraction`'s `projectPromotion` path (:664).
- Scratch only: `variant.py`, the 500 MB `copy/` and every output are in the scratchpad above; none is in the repository.
