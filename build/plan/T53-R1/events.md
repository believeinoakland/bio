# T53 R1 · events · rows

## plan-T53-draft.md

**registers** (new, after workbooks; K4403 (1)) · T53 · N1259 · listing, imports by resumable slices, search, cite a row, compare, tombstones, interest and refresh, guardrails · `planning/plan-T53-capabilities.md` §A Layer 5; also events (one followed entry one event), local-facts, entities, duties (layer names) there
**JOURNEYS's defects** (K5471 (6))
- W6-W7's 130 defects (6 BLOCKS: R-1, R-65 to R-68, R-94; 97 with no T52 entry), one entry each under its owning module, with JOURNEYS's READY lines (about 109): `planning/plan-T53-journeys.md` §A. Modules: jurisdictions (L1); promotion, provenance, capture, file-safety (L3); entities, events, money, explore, calculations (L5); publication, docket, public-read, case-import, case-authoring, review (L8); actions (L9); affordances, interface-shell, screens-entry, -wizards, -settings, installer-steps, site, screens-intake, -daily, -inquiry, -investigate, -publish, -action (L11). Each module's job reads its rows there at START. A defect wholly a carried entry merges into it (marked MERGE). (J1-J7 answered as recommended, K5553, K5554, K5556-K5560; the four BOB points K5561) (§B: eight decided by DEC-472, four by K5474 and K5561; §D decided, K5476). DEC-472's owed: interface-shell the keyboard rule (4); screens-settings, -entry, -investigate (1), (3), (5), (6); Security's floor a stated constant (2)
**English in tests** (K5565) · every module with sites carries one conversion entry for its own, done in this tranche; 58 modules gain a job by it alone · `planning/plan-T53-tests-english.md`

## plan-T53-capabilities.md

**events**
- T53 · N1259 (C13 (5)) · one entry of a followed register is one event however many readings state it (key: system, proceeding, entry id); a second reading adds an attestation; a disagreement told, never fatal; old keys re-keyed · N1259-f R58, R59 `[waits: M-R9; first: f's check 5]`

## plan-T53-journeys.md

**events**
- T53 · R-84 · `timeline` with `captures=` answers 502 on every standard-page load · REG2 R-84 · D2 events R?1 (owner half), screens-investigate R?17 (screen half). Register: SAME AS E-K4; the plane fix is NOT in carried-T52-R1.md (T52-74 covers only the screen sentence after W7). LANE: PLATFORM (D2 Needs: which limit the 502 hits).
- T53 · R-83 (owner half) · an event row has no edit/withdraw/"date this" control · REG2 R-83 · D2 events R?2 (owner to confirm which act exists; if none, Bob's decision; unresolved).
- T53 · R-68 (dating half) · BLOCKS · an event stays UNDATED; a dated fact is a separate list · REG2 R-68 · MERGE T52-74 (W30; C-K11+E-K1); D2 adds only the journey 11/22 steps 4 and 8 walk test (TESTS-SWEEP).

## plan-T53-tests-english.md

**The entry, the same for every module below** · T53 · K5565 · convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (the text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where it is shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; and every test the job touches for its other entries is converted with it (the words check refuses English in a new or changed test) · `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (the module's rows) · Test: the words check's baseline loses the module's files, and the module's suite is green.
**Literal sites** (CENSUS) are A / B files (A: already a `words.json` value; B: inline only). **Regex sites** (CENSUS-RX) are A / B / C sites (files). Counts are before TESTS-SWEEP's certain conversions, which remove 31 A literals and 34 A regexes. "only this · <model>": the job's model (BOB #324, K3518): `haiku-5-5` where the work is test-only, `sonnet-5-5` where a B site needs the module to give a key first (a source change). The module had no other T53 entry, so K5565 gives it a job in R1 (62 such modules before this file; four of them have carried entries the count missed, marked here without the note).
| layer | module | literal A / B files | regex A / B / C sites (files) | |
|---|---|---|---|---|
| 5 | events | 0 / 0 | 1 / 0 / 7 (4) |  |

## K5629: layer-1 findings folded (BOB #327)

- T53-530 · court-doctypes' finding (N1259-c R38, R29) · `followedRegister` takes only three keys and keys an event by content type. Detail: `follow.mjs:283` takes `{captureSha, proceeding, by}`; a court register row (R38) becomes a `filing` or `order` event of the followed proceeding keyed by the entry id the source assigns (R18-R20 of court-doctypes: the `courtlistener_api` type and the docket entries), and the same entry read twice is one event. Test: two readings of one docket entry file one event; a second entry of another content type files its own. `[owed: BOB confirms what the keys of N1259-c R38 are; this worker did not find the line (see C)]`
