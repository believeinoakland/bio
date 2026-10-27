# T53 R1 · extraction · rows

## plan-T53-draft.md

**extraction** (with screens-document)
- T53 · N1272 (K5445) · what is interpreted: what a member opens or cites; a member's "interpret these parts for <investigation>"; Civicsmith's own proposals from the investigation's words (no AI), labelled and interpreted only on acceptance, built in the beta if they test well on real documents; finding names, organisations and dates across a whole document is reading, not interpretation (K5496, C21 A); the page and search say what was interpreted, for which investigation, by whom and when, with "not interpreted for this investigation" in search, and the document view marks interpreted parts visibly (K5495, C2 A; the mark UX-DESIGN's) · · `planning/plan-T53-capabilities.md` §A Layer 4 (extraction R114-R119, reading-pipeline R64-R65, acquisition R135) and Layer 7 (investigation R26-R32) (R119: a ceiling per level, K5535, PLATFORM's figure)
**reading-pipeline**, **extraction**
- T53 · N1266, N1267 (K5427) · the text bound 100 MB, HTML streamed to it; the held-unread verdict re-run when a reader arrives · `files/SIZES-N1267.md` §3, `REQ-format-registry-beta.md` RF10 `[owed: BOB writes reading-pipeline's 100 MB line (SIZES §3) and RF10's]`
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**extraction** (replaces the plan's `[owed: CAPABILITIES N1269-N1272 READY]`; uses project-roster (38) and civil-time (3) for R114)
- T53 · N1272 (K4636, K5445, K5496) · `interpretPart` as the one recorded act, `cellsOf` as a caller, `interpretationOf`, acceptance basis, withdrawal (nothing erased), storage bounded by marks not file size · N1269-N1272 R114-R118 and R119 `[R119 waits: Bob: a member-visible limit on interpreted parts?; PLATFORM's bound per level]`
- T53 · N1259 (K4403 (2), (5)) · a register segment is not read: reading state `held_as_register`, never indexed as text · N1259-a R113

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 4 | extraction | 0 / 0 | 26 / 16 / 8 (20) |  |

## plan-T53-design-rows.md

**extraction** (op declarations)
- T53 · DEC-479 (61) · `readheld` ("Read it now") weighs Reversible and asks no reason (`act.readheld.does`) · DEC-479
