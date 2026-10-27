# T53's entries from PLATFORM's measurements on plat-s1 (PLANNING L52)

**Status** · READY · entries for BOB · PLANNING #4, 2026-10-27; service levels and the whole-record move folded by PLANNING #5 (L56, K5569); beside `plan-T53-draft.md` (at its cap). From PLATFORM P-22 (`platform/study/s1-results.md` §1b-full, lane/platform) and `platform/time-budgets-draft.md` §3 (READY), relayed by BOB #324. Each module's START carries its rows here verbatim (K5564).

**The bar these entries cite (P-22, "before").** On plat-s1 (alpha 0.87.0, Level 1), Seed A at 503 documents and 297 MB, reading idle, medians of five at 1280 px: the administrator's Home 3,526 ms, Queue 3,456, Add 2,752, Project 4,768 net (raw 2.8-6.5 s), the member's 0.55-0.66 s. The reads that wait are cheap ones queued behind the room's work: `bootstrap`, `memberlist`, `grouplanguages`, `profiles` (2.6-3.4 s of server time on Home), `queue`, and `heldcaptures` (241 KB, 0.8-1.7 s alone; asked by Home, Queue, Held, Add and Document, P24). Each entry's after-figure is taken on the same seed and copy and compared with this (the plan's Measurements, (a)), against its budget class (`time-budgets-draft.md` §2).

## Layer 3

**capture** (the Add door's acceptance; reached by store-door's streamed body, `store-door/dispatch.mjs`:373 `STREAMED_BODY_OPS`, and `store-assembly/owner-ops.mjs`:97 to `uploadCapture`)
- T53 · P9 (P-22, found on plat-s1) · with three members adding at once while reading runs, small files (0.1-2.5 MB: CSV, text, PDF) time out at the page's 120 s, 17 of 380; each succeeds alone in 10.7-15.5 s: the door queues behind the room's reading work · first: settle where the wait is (the room's reading slices, reading-pipeline; or the door's admission queue, store-door), from plane R24 (d)'s arrival line and the room's timings; the fix lands in capture's acceptance, a CHANGE to the module that holds the room if the slice must yield · an upload's acceptance answers within the Add budget (write act, `time-budgets-draft.md` §2) while reading runs, at three concurrent uploaders · Test: on PLATFORM's study driver, three uploaders with reading running, every acceptance within the budget; Control: one uploader alone, as today (10.7-15.5 s end to end, acceptance within budget)

## Layer 11

**op-declarations**, **screens-daily** (Home, Queue), **screens-intake** (Add), **screens-document** (Document)
- T53 · K4354, P24 (`time-budgets-draft.md` §3) · `heldcaptures` leaves each screen's first wave (PL10, PL11's waves) and returns as a picker read on open, so the door window no longer queues behind it · bar: P-22's figures above · Test: each screen's first wave holds no `heldcaptures`; the four administrator screens re-timed on Seed A within their class at p50; Control: Held still reads it on open

**queue**, **capture**, **case-authoring** (the counts Home reads)
- T53 · K4354, P15, P24 (`time-budgets-draft.md` §3; G80, G12a, G12c) · Home's in-room time (1.4 s then; Home 3.5 s net at Seed A) is the room's own work, which a combined read does not help: Home reads kept counts and cached roll-ups (the queue's count, held captures' count, `casedrafts`' count) in place of whole lists; which module keeps each count is settled at START from the read Home makes · bar: P-22's Home 3,526 ms and Queue 3,456 ms · Test: Home's and Queue's in-room time and net time on Seed A within their class; Control: the counts equal the lists' lengths after each act that changes them

**admission**, **store-door** (the fold, PL12-PL14; their entries in `plan-T53-draft.md`) · their after-figures are compared with P-22's bar.

## Service levels and the whole-record move (K5569, PLANNING L56)

From `platform/service-levels-draft.md` (PL20-PL29) and `platform/whole-record-move-draft.md` (PL50-PL57), READY as they stand (K5569, BOB #325; lane/platform 481829c4). Bob's level names (K5438): Level 1 Team, Level 2 Institution, Level 3 Enterprise. Every figure is a measurement of code that exists now, run alongside R1 (K5567) and shown "not yet measured" until it lands (PL21); a level not built is listed and not selectable; no move down (K5569). In T53 only Team is built: Institution and Enterprise are listed "not yet available" (N1271 left out, below).

**runtime-limits** (layer 1)
- T53 · K4746, K5438, K5569 · the three levels as rows of the one bounds table (`kind: level`, never a second table), each `{name, design_stage, cf_plan, record_bytes (database and R2 apart), members_at_once, upload_bytes, measured}`, Level 1's bounds FILES's per-kind rows (CONSISTENCY §2.8); `levelOf(copy)` from design stage and declared plan, an undeclared copy 1 (PL20); `levelFigures` throws a `TypeError` naming an unmeasured level (PL21); R119's interpretation ceiling a row beside them, `measured: null` until recorded (PL45, K5535) · `platform/service-levels-draft.md` §3, `platform/load-test-draft.md` PL45

**corpus-export** (layer 8)
- T53 · K5441, K5443 · `exportWhole` (`exportwhole`, administrator only): a whole-record manifest with every stored file, `placement` and counts, one `export_log` row scoped `whole-record` (PL50); files by parts, each checkable alone, resumable, one part held at a time (PL51); what is not carried named in the manifest (`not_carried`: never, derived, expunged; members' sign-in material, K1489, K1490) (PL52); a read, no lock past a part, its instant stated (PL53) · `platform/whole-record-move-draft.md` §2

**plane** (layer 11)
- T53 · K5438 · per week, three counts kept for the copy: record bytes against the level's bound, the most members working in one 5-minute window against its rating, the share of screens and acts whose p90 broke their class; counts only, never what a member did (PL26) · `platform/service-levels-draft.md` §3

**screens-settings** (layer 11; the gauge, G42)
- T53 · K5438, K5569 · the administrator sees the level, the record against its bound and the four factors, only once measured; a member none (PL22); members at once a rating, never a live count (PL23); "approaching" at 70 % for 7 days and "outgrowing" at 90 % (budget indicator 10 % and 25 %), told in plain words with the next level (PL27); while Institution is not built, an outgrowing copy is told what it can do now (pare the record) and that the next level is not yet offered, its own words key (PL28) · `platform/service-levels-draft.md` §3 · screen needs to UX-DESIGN through BOB (§3's two)

**installer**, **installer-steps** (layer 11)
- T53 · K5444, K5454, K5569 · the install lists Team, Institution and Enterprise, each with its sentence, measured range or "not yet measured", plan and monthly cost; a level not built shown "not yet available", not selectable (in T53, Institution and Enterprise); the chosen level sets the design stage and the declared level; preflight (`installer` R70) refuses a level whose plan the account lacks, before anything is created (PL29); a Level 1 copy declaring Business still answers 1 (PL25) · `platform/service-levels-draft.md` §3
- T53 · K5441, K5443 · a new copy created from a whole-record export: the parts named by link or file, the new copy's region or jurisdiction chosen (PL32), the room and its R2 bucket first, then the import (PL54); every part and file checked against its digest and the counts against the manifest, a mismatch stopping before members are let in, naming the part (PL55); the new copy states what it received and did not, the export's instant and the old placement; the old copy untouched, the rollback until its administrator ends it (PL56); a different region or jurisdiction allowed, said before it is chosen (PL57) · `platform/whole-record-move-draft.md` §3 · `uses` corpus-export (BOB's, recommended: the import reads the parts' format; layer 11 over 8) · screen needs to UX-DESIGN through BOB (the move path, "what was not carried", the old copy's end act, the sentence before choosing a region)

**Left out of T53** · PL24 (the upgrade step from Team to Institution) and the Institution and Enterprise design stages: N1271's build, its hard reason Bob's decision not yet made (the Levels 2-3 study S1-S4 and its report to Bob, K5444, K5569); the study runs on, 1e and 1f on plat-s1 under K5120.

**Measurements** (the plan's Measurements lists each)
- At once: Level 1's figures on a scratch copy (record bound with the gauge's 70 % and 90 %, members at once at the budget, upload through the Worker and direct to R2, cost at the rated load; `platform/service-levels-draft.md` §4); Enterprise's stated from Cloudflare's published limits with their source, not measured (K5454).
- After the code: the whole-record move at 1, 5 and 25 GB (time per part, total, memory held, the 2 s act bar for other members while it runs, rows read and R2 operations; `platform/whole-record-move-draft.md` §4) · after corpus-export PL50-PL53 and the installer's PL54-PL57 (layers 8, 11); the cross-endpoint `CopyObject` in the `eu` rehearsal (§5 (3)).
