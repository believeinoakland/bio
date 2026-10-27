# T53 R1 · record-core · rows

## plan-T53-draft.md

**record-core**
- T53 · N1271 (K5444, K5454, K5570) · Institution's design stage: the record split and the upgrade step from Team (PL24) · `planning/plan-T53-platform-rows.md` `[waits: the Levels 2-3 study S1-S4 and Bob's decision on its report; then its modules' still-open jobs, else the completion round]`
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**record-core** (beside, not instead of, the N1271 placeholder)
- T53 · N1257 (K5458, C10, K5462) · `getSettingAt(name, at)`: the setting as of an instant from the rows already kept, `SETTING_UNDETERMINED` before the first set, `SETTING_AT_INVALID` (C-102.40), no new table or row; `settings` stays purge-exempt and expunge-none · N1257 record-core R92 `[PLATFORM's load line; first: the job's two read-only checks, §C]`

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 2 | record-core | 0 / 0 | 2 / 5 / 4 (8) |  |

## plan-T53-platform-rows.md

**Status** · READY · entries for BOB · PLANNING #4, 2026-10-27; service levels and the whole-record move folded by PLANNING #5 (L56, K5569); beside `plan-T53-draft.md` (at its cap). From PLATFORM P-22 (`platform/study/s1-results.md` §1b-full, lane/platform) and `platform/time-budgets-draft.md` §3 (READY), relayed by BOB #324. Each module's START carries its rows here verbatim (K5564).
**The bar these entries cite (P-22, "before").** On plat-s1 (alpha 0.87.0, Level 1), Seed A at 503 documents and 297 MB, reading idle, medians of five at 1280 px: the administrator's Home 3,526 ms, Queue 3,456, Add 2,752, Project 4,768 net (raw 2.8-6.5 s), the member's 0.55-0.66 s. The reads that wait are cheap ones queued behind the room's work: `bootstrap`, `memberlist`, `grouplanguages`, `profiles` (2.6-3.4 s of server time on Home), `queue`, and `heldcaptures` (241 KB, 0.8-1.7 s alone; asked by Home, Queue, Held, Add and Document, P24). Each entry's after-figure is taken on the same seed and copy and compared with this (the plan's Measurements, (a)), against its budget class (`time-budgets-draft.md` §2).
## Service levels and the whole-record move (K5569, PLANNING L56)
From `platform/service-levels-draft.md` (PL20-PL29) and `platform/whole-record-move-draft.md` (PL50-PL57), READY as they stand (K5569, BOB #325; lane/platform 481829c4). Bob's level names (K5438): Level 1 Team, Level 2 Institution, Level 3 Enterprise. Every figure is a measurement of code that exists now, run alongside R1 (K5567) and shown "not yet measured" until it lands (PL21); a level not built is listed and not selectable; no move down (K5569). Institution is built in T53 once the Levels 2-3 study has reported and Bob has decided (N1271, below; K5570), listed "not yet available" until then; Enterprise stays outside the product (K5454).
**record-core**, **runtime-limits**, **installer**, **installer-steps** and the modules the split touches (N1271, K5444, K5454, K5570)
- T53 · N1271 · Institution's design stage: the record split across rooms with bulk tables in R2, created at install for an Institution copy (PL29) and reached from Team by the upgrade step, the Team room kept whole as the rollback until the administrator confirms, refused when the copy cannot hold both, naming what is short (PL24) · `platform/service-levels-draft.md` §2, §3, `platform/levels-2-3-study-plan.md` `[waits: the Levels 2-3 study S1-S4 and Bob's decision on its report (the split is high-level architecture, P4, P17); its lines are written from the decided option, then the build goes to its modules' still-open jobs, else the completion round (P10, K5567)]`; the study runs now, 1e and 1f on plat-s1 under K5120. Enterprise alone stays outside the product (K5454).
