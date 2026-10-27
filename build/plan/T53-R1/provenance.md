# T53 R1 · provenance · rows

## plan-T53-draft.md

**JOURNEYS's defects** (K5471 (6))
- W6-W7's 130 defects (6 BLOCKS: R-1, R-65 to R-68, R-94; 97 with no T52 entry), one entry each under its owning module, with JOURNEYS's READY lines (about 109): `planning/plan-T53-journeys.md` §A. Modules: jurisdictions (L1); promotion, provenance, capture, file-safety (L3); entities, events, money, explore, calculations (L5); publication, docket, public-read, case-import, case-authoring, review (L8); actions (L9); affordances, interface-shell, screens-entry, -wizards, -settings, installer-steps, site, screens-intake, -daily, -inquiry, -investigate, -publish, -action (L11). Each module's job reads its rows there at START. A defect wholly a carried entry merges into it (marked MERGE). (J1-J7 answered as recommended, K5553, K5554, K5556-K5560; the four BOB points K5561) (§B: eight decided by DEC-472, four by K5474 and K5561; §D decided, K5476). DEC-472's owed: interface-shell the keyboard rule (4); screens-settings, -entry, -investigate (1), (3), (5), (6); Security's floor a stated constant (2)
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**provenance**
- T53 · N824 (K2425) · a message by email graded as an upload, `origin.kind` `email`, the `message` block; an attachment earns its message's grade; an `email` or `email-attachment` capture is not `handed_in` (say so in A3-R1's test) · N824 R82-R84
- The receipt builder for `email-attachment` sits here or in acquisition, never capture (as R39's does for ZIP).

## plan-T53-journeys.md

**provenance**
- T53 · R-1 · BLOCKS · testimony filer makes a bundle without `data/dataset.json`, so ratification refuses it · REG R-1 · D1 screens-intake R?1. MERGE T52-44 (pull filer, store-door) and T52-85 (archive filer, control-plane); testimony filer FIXED IN CODE (T52-9, R81) but failed on deployed 0.87.0: redeploy and re-walk (PLATFORM). LANE: PLATFORM (deploy).
- T53 · R-24 · testimony filer does not carry the route's project (Held says "No project yet") · REG R-24 · D1 provenance R?1 (owner half), screens-intake R?5. Register: SAME AS B-K14, no T52 entry.

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 3 | provenance | 0 / 1 | 16 / 20 / 30 (13) |  |
