# T53 R1 · queue · rows

## plan-T53-draft.md

**queue**
- T53 · K5480, K5478 · `classOfKind` gains `retesting-off` (an OBLIGATION kind: one undismissable item while re-testing is off) and `ai-credits-stop` (R1) · AI-DESIGN A50, `draft-ai-accounts-dec465.md` R75
**queue**, **screens-daily**
- T53 · A6 · a per-key choice of act passed through (queue), a line and two acts per key, never handled by "choose several" (screens-daily) · `planning/lines-A6-queue-acts.md` (Q-A6-1, Q-A6-2 decided, K5456; their wording a UX need)
- C T52-62 to T52-65, T52-104 (screens-daily)
**installer**, **journey-check**, **notice-producers**, **queue**, **op-*** , **store-assembly**, **control-plane**, **instance-setup**, **stewards**, **site**, **screens-*** (CAPABILITIES) · N1265's check and gate (installer R86-R93, replacing T52-92's probe and T52-94's steps; journey-check R39-R41), installer R2 one line for every scope ask `[owed: BOB settles the count]`, register notices and kinds, the registers screen (screens-investigate, rec.), mail's ops and door, stewards' decline record (K5530: B2 stewards' own mail, B3 closed `RULE_PARTS`), N1272's Interpreted row (DEC-476, DEC-478) · `planning/plan-T53-capabilities.md` §A Layer 11
- T53 · DEC-475 · screens-ai: U8 the results page, U9 the health share and preview, AI6 the re-test switch and its Queue item, AI14 moment d's wait-then-switch (wait lengths 5, 15, 60 minutes, BOB's), U10 states g and h, K5483 state i, K5486's opt-in, K5488 moment l; the ops as AI-DESIGN's drafts (`airesultown`, `aihealthset`, `aihealthpreview`, `airetestset`, `aiwaitswitch`) and the Queue kinds `retesting-off` and the payer-flag stops
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**queue**
- T53 · N1259 · the four register kinds catalogued as FINDINGs; disposition `watched-changed` (UNVERIFIED, recommended) · N1259-c R97, **numbered R98** (A6 keeps R97)

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 11 | queue | 0 / 1 | 4 / 40 / 2 (13) |  |

## plan-T53-platform-rows.md

**Status** · READY · entries for BOB · PLANNING #4, 2026-10-27; service levels and the whole-record move folded by PLANNING #5 (L56, K5569); beside `plan-T53-draft.md` (at its cap). From PLATFORM P-22 (`platform/study/s1-results.md` §1b-full, lane/platform) and `platform/time-budgets-draft.md` §3 (READY), relayed by BOB #324. Each module's START carries its rows here verbatim (K5564).
**The bar these entries cite (P-22, "before").** On plat-s1 (alpha 0.87.0, Level 1), Seed A at 503 documents and 297 MB, reading idle, medians of five at 1280 px: the administrator's Home 3,526 ms, Queue 3,456, Add 2,752, Project 4,768 net (raw 2.8-6.5 s), the member's 0.55-0.66 s. The reads that wait are cheap ones queued behind the room's work: `bootstrap`, `memberlist`, `grouplanguages`, `profiles` (2.6-3.4 s of server time on Home), `queue`, and `heldcaptures` (241 KB, 0.8-1.7 s alone; asked by Home, Queue, Held, Add and Document, P24). Each entry's after-figure is taken on the same seed and copy and compared with this (the plan's Measurements, (a)), against its budget class (`time-budgets-draft.md` §2).
**queue**, **capture**, **case-authoring** (the counts Home reads)
- T53 · K4354, P15, P24 (`time-budgets-draft.md` §3; G80, G12a, G12c) · Home's in-room time (1.4 s then; Home 3.5 s net at Seed A) is the room's own work, which a combined read does not help: Home reads kept counts and cached roll-ups (the queue's count, held captures' count, `casedrafts`' count) in place of whole lists; which module keeps each count is settled at START from the read Home makes · bar: P-22's Home 3,526 ms and Queue 3,456 ms · Test: Home's and Queue's in-room time and net time on Seed A within their class; Control: the counts equal the lists' lengths after each act that changes them
