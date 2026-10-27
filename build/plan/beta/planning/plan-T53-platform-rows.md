# T53's entries from PLATFORM's measurements on plat-s1 (PLANNING L52)

**Status** · Entries for BOB · PLANNING #4, 2026-10-27, beside `plan-T53-draft.md` (at its cap). From PLATFORM P-22 (`platform/study/s1-results.md` §1b-full, lane/platform) and `platform/time-budgets-draft.md` §3 (READY), relayed by BOB #324. Each module's START carries its rows here verbatim (K5564).

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
