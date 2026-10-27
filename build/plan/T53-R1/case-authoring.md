# T53 R1 · case-authoring · rows

## plan-T53-draft.md

**case-authoring**
- T53 · A5 · the sign step lists ungraded passages; the edition states it; never refused for it · `planning/lines-A5-A6-signing.md` (case-authoring R88-R90)
**public-read** · C T52-23 · **case-disclosures** · C T52-25 · **case-inputs** · C T52-26 · **case-authoring** · C T52-27 · **case-check** · C T52-28
- T53 · DEC-474 (DEC-461's drawing) · interface-shell: a `ceiling` scale beside `capture` in `cs.grade` and the chip tooltip, the capture icon until one is drawn; screens-document, screens-intake, screens-investigate: chips on a document or source drawn on `ceiling` (Document head and revisions, Held, money, timeline, person, calculation), the fold's choice label `screen.question.leggrade.choice`; ratification and case-authoring: the signing list and the edition's statement as A5 (`planning/lines-A5-A6-signing.md`) in DEC-474 (4)'s words; screens-publish draws `screen.published.ungraded` with its "Which passages" fold
**JOURNEYS's defects** (K5471 (6))
- W6-W7's 130 defects (6 BLOCKS: R-1, R-65 to R-68, R-94; 97 with no T52 entry), one entry each under its owning module, with JOURNEYS's READY lines (about 109): `planning/plan-T53-journeys.md` §A. Modules: jurisdictions (L1); promotion, provenance, capture, file-safety (L3); entities, events, money, explore, calculations (L5); publication, docket, public-read, case-import, case-authoring, review (L8); actions (L9); affordances, interface-shell, screens-entry, -wizards, -settings, installer-steps, site, screens-intake, -daily, -inquiry, -investigate, -publish, -action (L11). Each module's job reads its rows there at START. A defect wholly a carried entry merges into it (marked MERGE). (J1-J7 answered as recommended, K5553, K5554, K5556-K5560; the four BOB points K5561) (§B: eight decided by DEC-472, four by K5474 and K5561; §D decided, K5476). DEC-472's owed: interface-shell the keyboard rule (4); screens-settings, -entry, -investigate (1), (3), (5), (6); Security's floor a stated constant (2)
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-journeys.md

**case-authoring**
- T53 · R-100 (owner half) · unchanged-statement refusal does not tell the screen which box (`field`) · REG3 R-100 · D3 case-authoring R?1.
- T53 · R-103 (owner part) · heading counts the ratified draft as the next edition · REG3 R-103 · +T52-78 (D-K9 screen half); owner half has no line (D3 puts it in screens-publish R?8 only).

## carried-T52-R1.md

- T52-27 · W14 · E-K3 · BLOCKER · the pre-flight answers `published` per draft (`case_documents.draft_id`, publication R40), not per case, so a second draft over a published case shows its steps; the case's published edition stays as a note. The screen is unchanged. Test: a draft made through the question page's "Prepare a case from this" after edition 1. PL1 W14.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 8 | case-authoring | 1 / 1 | 19 / 7 / 13 (12) |  |

## plan-T53-platform-rows.md

**Status** · READY · entries for BOB · PLANNING #4, 2026-10-27; service levels and the whole-record move folded by PLANNING #5 (L56, K5569); beside `plan-T53-draft.md` (at its cap). From PLATFORM P-22 (`platform/study/s1-results.md` §1b-full, lane/platform) and `platform/time-budgets-draft.md` §3 (READY), relayed by BOB #324. Each module's START carries its rows here verbatim (K5564).
**The bar these entries cite (P-22, "before").** On plat-s1 (alpha 0.87.0, Level 1), Seed A at 503 documents and 297 MB, reading idle, medians of five at 1280 px: the administrator's Home 3,526 ms, Queue 3,456, Add 2,752, Project 4,768 net (raw 2.8-6.5 s), the member's 0.55-0.66 s. The reads that wait are cheap ones queued behind the room's work: `bootstrap`, `memberlist`, `grouplanguages`, `profiles` (2.6-3.4 s of server time on Home), `queue`, and `heldcaptures` (241 KB, 0.8-1.7 s alone; asked by Home, Queue, Held, Add and Document, P24). Each entry's after-figure is taken on the same seed and copy and compared with this (the plan's Measurements, (a)), against its budget class (`time-budgets-draft.md` §2).
**queue**, **capture**, **case-authoring** (the counts Home reads)
- T53 · K4354, P15, P24 (`time-budgets-draft.md` §3; G80, G12a, G12c) · Home's in-room time (1.4 s then; Home 3.5 s net at Seed A) is the room's own work, which a combined read does not help: Home reads kept counts and cached roll-ups (the queue's count, held captures' count, `casedrafts`' count) in place of whole lists; which module keeps each count is settled at START from the read Home makes · bar: P-22's Home 3,526 ms and Queue 3,456 ms · Test: Home's and Queue's in-room time and net time on Seed A within their class; Control: the counts equal the lists' lengths after each act that changes them
