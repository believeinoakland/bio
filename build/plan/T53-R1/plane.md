# T53 R1 · plane · rows

## plan-T53-draft.md

**control-plane**, **plane**
- C T52-85 to T52-91 · T53 · N1264, K4599: routes `screenread` and the folded admission · `platform/combined-read-and-fold-draft.md` §3
- T53 · K5425 (b) (control-plane) · `store-assembly/r10-fixtures-run.test.mjs` lines 23 (job-registrar) and 29 (owed-ledger) are orphan fixtures-run lines: the tests now run the real registrar and wrap the real ledger; delete each line, or name the stand-in it is owed for · `tests-sweep/FIXTURES.md`
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**control-plane**, **plane**
- T53 · N1259 · the door answers the ops from declarations (test) · N1259-c R139
- T53 · N824 · member acts routed; the plane's `email()` entry calls `receiveMail` · N824 R12 `[waits: M1]`

## carried-T52-R1.md

- T52-89 · R1, R9, R111, R112, R113, R114 *(not yet met: T52)* · the Store class builds by `assembleStore`; no row, refusal or answer of its own; the `ask`/`draft` RPCs; `pagetranscribe` through `extraction`'s `pageTranscribeOp`; `knock` through `doorbellPublicOp`; `dispatchMemberRun` and `groupFields` RPCs. If R114 proves to rest on the remote path, REPORT: it moves to N1220's side.
- T52-90 · K5343 reds (4) · first: settle each cause, then fix it.
- T52-91 · N1264 and K4599 (a) · the Store's RPC for the folded admission and the combined read.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 11 | plane | 0 / 0 | 1 / 1 / 12 (8) |  |

## plan-T53-platform-rows.md

**Status** · READY · entries for BOB · PLANNING #4, 2026-10-27; service levels and the whole-record move folded by PLANNING #5 (L56, K5569); beside `plan-T53-draft.md` (at its cap). From PLATFORM P-22 (`platform/study/s1-results.md` §1b-full, lane/platform) and `platform/time-budgets-draft.md` §3 (READY), relayed by BOB #324. Each module's START carries its rows here verbatim (K5564).
**The bar these entries cite (P-22, "before").** On plat-s1 (alpha 0.87.0, Level 1), Seed A at 503 documents and 297 MB, reading idle, medians of five at 1280 px: the administrator's Home 3,526 ms, Queue 3,456, Add 2,752, Project 4,768 net (raw 2.8-6.5 s), the member's 0.55-0.66 s. The reads that wait are cheap ones queued behind the room's work: `bootstrap`, `memberlist`, `grouplanguages`, `profiles` (2.6-3.4 s of server time on Home), `queue`, and `heldcaptures` (241 KB, 0.8-1.7 s alone; asked by Home, Queue, Held, Add and Document, P24). Each entry's after-figure is taken on the same seed and copy and compared with this (the plan's Measurements, (a)), against its budget class (`time-budgets-draft.md` §2).
## Service levels and the whole-record move (K5569, PLANNING L56)
From `platform/service-levels-draft.md` (PL20-PL29) and `platform/whole-record-move-draft.md` (PL50-PL57), READY as they stand (K5569, BOB #325; lane/platform 481829c4). Bob's level names (K5438): Level 1 Team, Level 2 Institution, Level 3 Enterprise. Every figure is a measurement of code that exists now, run alongside R1 (K5567) and shown "not yet measured" until it lands (PL21); a level not built is listed and not selectable; no move down (K5569). Institution is built in T53 once the Levels 2-3 study has reported and Bob has decided (N1271, below; K5570), listed "not yet available" until then; Enterprise stays outside the product (K5454).
**plane** (layer 11)
- T53 · K5438 · per week, three counts kept for the copy: record bytes against the level's bound, the most members working in one 5-minute window against its rating, the share of screens and acts whose p90 broke their class; counts only, never what a member did (PL26) · `platform/service-levels-draft.md` §3
