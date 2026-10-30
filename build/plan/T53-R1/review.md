# T53 R1 · review · rows

## plan-T53-draft.md

**JOURNEYS's defects** (K5471 (6))
- W6-W7's 130 defects (6 BLOCKS: R-1, R-65 to R-68, R-94; 97 with no T52 entry), one entry each under its owning module, with JOURNEYS's READY lines (about 109): `planning/plan-T53-journeys.md` §A. Modules: jurisdictions (L1); promotion, provenance, capture, file-safety (L3); entities, events, money, explore, calculations (L5); publication, docket, public-read, case-import, case-authoring, review (L8); actions (L9); affordances, interface-shell, screens-entry, -wizards, -settings, installer-steps, site, screens-intake, -daily, -inquiry, -investigate, -publish, -action (L11). Each module's job reads its rows there at START. A defect wholly a carried entry merges into it (marked MERGE). (J1-J7 answered as recommended, K5553, K5554, K5556-K5560; the four BOB points K5561) (§B: eight decided by DEC-472, four by K5474 and K5561; §D decided, K5476). DEC-472's owed: interface-shell the keyboard rule (4); screens-settings, -entry, -investigate (1), (3), (5), (6); Security's floor a stated constant (2)
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-journeys.md

**review**
- T53 · R-98 (owner half) · a reader grant's acknowledgement is stored with no reader name · REG3 R-98 · D3 review R46.
- T53 · R-99 · owner's "Acknowledge what it leaves out" reaches the reviewer route, 404 `NO_REVIEW_COPY` · REG3 R-99 · MERGE T52-26 (W13, case-inputs), still open on 0.87.0; no draft line.
- T53 · R-107 (owner part) · acknowledge/comment both answer "Sent to the team." · REG3 R-107 · D3 screens-publish R99 (decided, K5560, J7 = B: shown by name only if the reader ticks that it may be); register owner review.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 8 | review | 0 / 0 | 11 / 4 / 10 (8) |  |
