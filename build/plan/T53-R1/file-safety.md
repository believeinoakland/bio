# T53 R1 · file-safety · rows

## plan-T53-draft.md

**file-safety**
- T53 · A4 · the safe picture of a photograph, `file_says`, `left_out`, lifecycle, the named security review · `planning/lines-A3-A4-source-picture.md` (file-safety R60-R64); FILES's `files/PHOTO-DATA.md` checked against A4 §2 (one source, K5471 (3)): serials and owner name shown beside the picture to members who may see it (K5521, governing K5473 (1) for them); image id, artist, copyright read, not shown by default; the place name shown, exact figures one step away A4 the one source (K5473 (1)); "near {place}" from the shipped and team layers only, else rounded figures (L21, K5546: a colour profile passing A4-R8's check kept in the picture, not the recommendation, bounded as drafted, K5555; L22, K5547: all the photo's data shown as "the file says") (the published place decided, K5514: shown in an edition only where the author turns it on, per photo, off by default)
- T53 · DEC-454 · the partial-scan reason in plain words · `docs/development/DECISIONS.md` DEC-454
- T53 · N1266 (K5436) · a held-and-named file safe-graded like any other · `files/REQ-format-registry-beta.md` RF10
**JOURNEYS's defects** (K5471 (6))
- W6-W7's 130 defects (6 BLOCKS: R-1, R-65 to R-68, R-94; 97 with no T52 entry), one entry each under its owning module, with JOURNEYS's READY lines (about 109): `planning/plan-T53-journeys.md` §A. Modules: jurisdictions (L1); promotion, provenance, capture, file-safety (L3); entities, events, money, explore, calculations (L5); publication, docket, public-read, case-import, case-authoring, review (L8); actions (L9); affordances, interface-shell, screens-entry, -wizards, -settings, installer-steps, site, screens-intake, -daily, -inquiry, -investigate, -publish, -action (L11). Each module's job reads its rows there at START. A defect wholly a carried entry merges into it (marked MERGE). (J1-J7 answered as recommended, K5553, K5554, K5556-K5560; the four BOB points K5561) (§B: eight decided by DEC-472, four by K5474 and K5561; §D decided, K5476). DEC-472's owed: interface-shell the keyboard rule (4); screens-settings, -entry, -investigate (1), (3), (5), (6); Security's floor a stated constant (2)
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-journeys.md

**file-safety**
- T53 · R-28 · "Open the original" saves under the digest, not the file name · REG R-28 · D1 screens-intake R?6 (register owner file-safety). LANE: FILES (named in D1 Needs).
- T53 · R-64 · safe view draws a comma-bearing text note as a sheet (type by sniffing); breadcrumb has no link back · REG R-64 · D1 screens-intake R?10 (module file-safety). LANE: FILES (named in D1 Needs; safe view by sniffed type).

## carried-T52-R1.md

- ~~T52-103~~ done by BOB at layer 5's close (K5406) · DEC-449 (UX-DESIGN U493, `cf94163859`, B544) · test-only · `STAND_INS` drops `SIGNATURES_RUN_UNDER_WAY` now that `refusal.SIGNATURES_RUN_UNDER_WAY` has its row; R24 (`rows.test.mjs`) green. Done instead by BOB as a §5.10 mechanical pass at layer 5's close (no job running), with DEC-449 and DEC-450 (U494, `2ac5195725`) merged in the same step, so R24 is never red on the tranche (K5397).

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 3 | file-safety | 0 / 0 | 5 / 1 / 0 (4) |  |

## plan-T53-design-rows.md

- **Order within layer 3 (BOB's, P4).** DEC-479 puts `file-safety` in `doorbell`'s uses, but `doorbell` (49) is before `file-safety` (50) in `modules.json`. `file-safety` does not use `doorbell`, and every user of `doorbell` (`sources` 51 and later) stays after both, so the two are swapped (file-safety 49, doorbell 50), member-roster R27's `MODULE_ORDER` re-pinned in the same act (decided, BOB #324).
