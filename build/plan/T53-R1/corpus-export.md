# T53 R1 · corpus-export · rows

## plan-T53-draft.md

**corpus-export**
- T53 · K5441, K5443 · the whole team record exported by resumable parts, the one way to change region (PL50-PL53) · `platform/whole-record-move-draft.md` (READY, K5569) · rows: `planning/plan-T53-platform-rows.md`
**case-grammar**, **case-disclosures**, **case-checker**, **public-read**, **corpus-export**, **network-notices** (N1259, N1110) · a cited register row as flat extracts in the one `/10`, the seventh reason (K5503), the extract checks, `listingRequest` (network-notices R32) · `planning/plan-T53-capabilities.md` §A Layer 8
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**corpus-export**
- T53 · N1259 (K1493) · descriptors and tombstones, never rows; a limited register's rows in no form · N1259-d R16 `[owed: where segments' bundle lives]` (segments' exemption UNVERIFIED, recommended)

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 8 | corpus-export | 0 / 0 | 4 / 0 / 0 (3) |  |

## plan-T53-platform-rows.md

**Status** · READY · entries for BOB · PLANNING #4, 2026-10-27; service levels and the whole-record move folded by PLANNING #5 (L56, K5569); beside `plan-T53-draft.md` (at its cap). From PLATFORM P-22 (`platform/study/s1-results.md` §1b-full, lane/platform) and `platform/time-budgets-draft.md` §3 (READY), relayed by BOB #324. Each module's START carries its rows here verbatim (K5564).
**The bar these entries cite (P-22, "before").** On plat-s1 (alpha 0.87.0, Level 1), Seed A at 503 documents and 297 MB, reading idle, medians of five at 1280 px: the administrator's Home 3,526 ms, Queue 3,456, Add 2,752, Project 4,768 net (raw 2.8-6.5 s), the member's 0.55-0.66 s. The reads that wait are cheap ones queued behind the room's work: `bootstrap`, `memberlist`, `grouplanguages`, `profiles` (2.6-3.4 s of server time on Home), `queue`, and `heldcaptures` (241 KB, 0.8-1.7 s alone; asked by Home, Queue, Held, Add and Document, P24). Each entry's after-figure is taken on the same seed and copy and compared with this (the plan's Measurements, (a)), against its budget class (`time-budgets-draft.md` §2).
## Service levels and the whole-record move (K5569, PLANNING L56)
From `platform/service-levels-draft.md` (PL20-PL29) and `platform/whole-record-move-draft.md` (PL50-PL57), READY as they stand (K5569, BOB #325; lane/platform 481829c4). Bob's level names (K5438): Level 1 Team, Level 2 Institution, Level 3 Enterprise. Every figure is a measurement of code that exists now, run alongside R1 (K5567) and shown "not yet measured" until it lands (PL21); a level not built is listed and not selectable; no move down (K5569). Institution is built in T53 once the Levels 2-3 study has reported and Bob has decided (N1271, below; K5570), listed "not yet available" until then; Enterprise stays outside the product (K5454).
**corpus-export** (layer 8)
- T53 · K5441, K5443 · `exportWhole` (`exportwhole`, administrator only): a whole-record manifest with every stored file, `placement` and counts, one `export_log` row scoped `whole-record` (PL50); files by parts, each checkable alone, resumable, one part held at a time (PL51); what is not carried named in the manifest (`not_carried`: never, derived, expunged; members' sign-in material, K1489, K1490) (PL52); a read, no lock past a part, its instant stated (PL53) · `platform/whole-record-move-draft.md` §2
