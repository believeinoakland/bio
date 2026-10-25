# T51 walk coverage map: index

This folder is the map `build/plan/walk-coverage-T51.md` split mechanically by sitting (mechanics §17 step 2, P20), nothing lost. Each area file holds, verbatim, the map's Status line and §1, that area's line of §3, that area's part of §4 (its sitting text, its table header and every row placed there) and that area's part of §6. This README holds the rest: §2 counts, §3 whole, the §4 heading, §5 whole, the general part of §6. The map itself is the source; these files are regenerated from it.

## Status and how to read it (from the map)

**Status** · COMPLETED BY COVERAGE #1 (K4784), FOR BOB'S REVIEW; not yet in force. K4784's completion is done: every source the draft's section 5 named as unread was read whole by a helper (section 5 says which), and every row was re-set from what was found. It scopes no walk until BOB has reviewed it (K4784, "then BOB reviews"). Written 2026-10-23 on the third account by COVERAGE #1 for BOB #269 (K4790), on `prep/account3-coverage` from `tranche/T51`; nothing deployed, no live site contacted.

# T51 walk coverage map

The map scopes K4781's final pass and every later targeted walk (K4782): one walker per area, each area one sitting in a new empty room, in the order a founder's real investigation takes them; offline walkers run as their own sessions, never as workers in BOB's container (K4782). The live pass adds the everyday load of K4783/K4785 (5 members at once, measured), carried in the overlay (R108).

## 1. How to read it

- **Status**, applied strictly. WALKED-CURRENT: a T51 walk exercised all the row's main acts after the last change that touched it. STALE: walked, but a later change touched it, or only some of its main acts were walked. NEVER: no walk record shows its main act exercised. Canon, rulings, plans and helpers' judgement are never evidence; a screen seen in a sweep, a timing of a screen, or a refusal read is not an exercise. Because the completed rows now carry every main act the canon, the registry and the rulings give them, a row walked only in its earlier, narrower form is STALE. Where a helper proposed a higher status than the walk records support (S33 proposed WALKED-CURRENT for R30, R31, R36, R62, R92 and kept R06, R07, R13, R17, R46, R48, R80, R84, R90, R91, R93, R94, R101, R106), the records were followed.
- **Evidence keys** (all under `build/plan/` unless stated). LIVE = `walk-T51-live/` (2026-10-20, 0.86.0, before any fix round). BUILD = `walk-T51-build/` (2026-10-21, after round 1; its `CAUSES.md` holds S-22..S-48, E24..E61, CA31..CA70). RW2 = `walk-T51-rewalk/`. RW3 = `archive/walk-T51-rewalk3/`. RW4, RW5, RW6 = `walk-T51-rewalk4/`, `-rewalk5/`, `-rewalk6/`. **RW7 = `walk-T51-rewalk7/` (complete and recorded, K4791/K4793; it walked the round-7 redeploy 2496ff995b; counted here).** LANE = `lane-journeys/` (0.85.0, HTTP only; STALE evidence at best). `walk-T51-findings.md` and `walk-T51-run.txt` (the local journey-check run) count for no row.
- **Fix rounds.** Round 1 (`archive/fix-round-T51.md`, C1-C85, L1-L30; 0.86.0). Round 2 (`archive/fix-round-2-T51.md`, C1-C96; e1367d2a2c). Round 3 (`archive/fix-round-3-T51.md`; 753ea4db8a). Rounds 4 and 4b (86792d1179). Round 5 (5ff8b5e01b). Round 6 (`archive/fix-round-6-T51.md`, G1-G57; 6351c8fb14). Round 7 (`archive/fix-round-7-T51-s1-s5.md` G58-G82 and `fix-round-7-T51.md` section 8, `-added.md` G83/G84, `-G88.md` G88; 2496ff995b). Round-1 C-numbers collide with round 2's: a C-number is always given with its round. **G90 did not ship in redeploy 2496ff995b**: it is cut in signed release 0.87.0 after the final pass (`fix-round-7-T51.md` §7 item 4 and §8 G90), so install and update rows stay NEVER until then. G87 is a load measurement, not a defect. Causes shipped only as logging or a best-reading fix (G62, G63, G66, G68, G70, G72, G75, G78, G79, G82) do not make a row current by shipping. Global changes touching every screen (the shell: rounds 2-6 C14, C76, C81, E12, G12b; round 7 G81; G83's room location; G84's start-up margin) are not repeated per row.
- **Columns.** "Screens and ops" uses the registry's ids (`docs/development/ux-substrate/screens/registry.json`); an op the registry marks owed is "(owed)": a walker records its absence, which is not a defect of the walk. "(not built: …)" marks an act the sources say is designed but not built; such a row is walked to confirm its state and its absence is recorded, never logged as a defect of the build. Citations in brackets use short forms: S01-S36 are the reading helpers of section 5; FR1/FR6/FR7 the fix-round plans; DEC-n Bob's rulings in `docs/development/DECISIONS.md`; UC-n the use cases and openQuestions[n] the questions of `ux-experience.json`; registry `<id>` a screen.
- **Ids.** R01-R108 keep their draft ids; rows added by this completion are R110 onward, numbered in area order. Rows proposed by several helpers were merged into one row; a row the draft had in one area may now sit in another (founder order).

## 2. Counts

| status | all rows | draft rows (R01-R108) | added rows (R110 on) |
| --- | --- | --- | --- |
| WALKED-CURRENT | 0 | 0 | 0 |
| STALE | 56 | 56 | 0 |
| NEVER | 138 | 138 | 0 |
| total | 194 | 194 | 0 |

The draft counted WALKED-CURRENT 18, STALE 37, NEVER 30. No row is WALKED-CURRENT now: re-walk 7 exercised parts of many rows but all of none, and every draft WALKED-CURRENT row either gained canon acts no walk did or was touched by a later change.

| area | WALKED-CURRENT | STALE | NEVER | rows |
| --- | --- | --- | --- | --- |
| 1 Install, claim, set up the room | 0 | 2 | 15 | 17 |
| 2 The team's people and accounts | 0 | 8 | 8 | 16 |
| 3 Projects and the daily rhythm | 0 | 8 | 8 | 16 |
| 4 Bring documents in (two sittings, 4a and 4b) | 0 | 10 | 15 | 25 |
| 5 Vouch; the people, organizations and ties the documents name | 0 | 4 | 5 | 9 |
| 6 Read, find, cite into a question | 0 | 5 | 7 | 12 |
| 7 Money, time, connections, registers | 0 | 4 | 5 | 9 |
| 8 Law and courts | 0 | 1 | 4 | 5 |
| 9 Question to conclusion (and the plan opened) | 0 | 4 | 14 | 18 |
| 10 Case to publication (two sittings, 10a and 10b) | 0 | 5 | 20 | 25 |
| 11 Act | 0 | 4 | 16 | 20 |
| 12 After the alpha (needs the assistant; not walked in the alpha) | 0 | 0 | 14 | 14 |
| Overlay for every walker | 0 | 1 | 7 | 8 |

## 3. Areas for the walkers (one walker, one sitting each, in founder order)

Walk the areas in this order, each in a new empty room seeded by what the earlier areas leave behind (area 1 creates the room and its people; each area's sitting says what it needs first). Areas 4 and 10 are each two sittings (4a/4b, 10a/10b), so the alpha's offline pass has thirteen walkers' sittings plus the after-alpha area. Home and the Queue are walked again at the ends of areas 6, 10 and 11, when the notices they hold exist (area 3). The overlay applies to every walker in every area. The order changed from the draft's ten areas on the founder's journeys (S19): vouching and resolving the people a document names come straight after intake (area 5); a question is opened before the first citation (area 6); the plan opens while the inquiry is young (area 9) and starts only after a determination (area 11); the records request is sent early and its reply arrives as a document (area 4); the after-publication source change ends area 10.

1. **Install, claim, set up the room** · R01, R08, R09, R14, R02, R03, R110, R111, R112, R113, R114, R115, R116, R117, R118, R119, R120.
2. **The team's people and accounts** · R04, R05, R06, R07, R10, R11, R12, R13, R15, R17, R121, R122, R123, R124, R125, R126.
3. **Projects and the daily rhythm** · R20, R21, R22, R23, R24, R25, R26, R27, R28, R127, R128, R129, R130, R131, R132, R133.
4. **Bring documents in (two sittings, 4a and 4b)** · R30, R31, R32, R34, R33, R35, R36, R37, R134, R135, R39, R40, R41, R137, R138, R100, R136, R139, R140, R141, R142, R143, R144, R145, R146.
5. **Vouch; the people, organizations and ties the documents name** · R38, R55, R56, R57, R58, R59, R147, R148, R149.
6. **Read, find, cite into a question** · R45, R46, R47, R48, R49, R50, R152, R153, R150, R151, R154, R155.
7. **Money, time, connections, registers** · R60, R61, R62, R63, R64, R65, R157, R158, R156.
8. **Law and courts** · R70, R71, R72, R73, R74.
9. **Question to conclusion (and the plan opened)** · R80, R81, R82, R83, R84, R85, R102, R165, R166, R167, R168, R169, R159, R160, R161, R162, R163, R164.
10. **Case to publication (two sittings, 10a and 10b)** · R90, R91, R92, R93, R94, R95, R96, R97, R98, R171, R172, R174, R175, R176, R177, R180, R181, R182, R170, R173, R178, R179, R183, R184, R185.
11. **Act** · R101, R103, R104, R105, R106, R107, R187, R188, R189, R190, R191, R186, R192, R193, R194, R195, R196, R197, R198, R199.
- **After the alpha (needs the assistant; not walked in the alpha)** · R16, R18, R200, R201, R202, R203, R204, R205, R206, R207, R208, R209, R210, R211.
- **Overlay, for every walker** · R108, R212, R213, R216, R217, R214, R215, R218.

## 4. The areas and their rows

## 5. Sources, and which helper read each whole

K4784's completion, by COVERAGE #1 (mechanics §17, P20). Thirty-six reading helpers (sonnet, medium), each with a share of at most about 150 KB, read the draft map whole and then their share whole, every line in order, and returned the rows to add or correct with citations (S01-S36). Their returns were put into one form, without judgement, by thirteen normalizers (N1-N13: 1,974 entries), grouped by row and area, written into rows by one writer per area (W00-W12), and reconciled by four helpers: RC1-RC3 checked each of the 250 proposed rows against the written rows and recovered 30 that no writer had placed (an older area numbering had sent them to the wrong area), and RD merged 26 clusters of rows written twice and moved 21 rows to their founder-order area; COVERAGE #1 merged the recovered rows that repeated each other (7 clusters), renumbered and assembled. The draft's own reading (the capability ladders, `requirements/README.md`, the journeys page, the walk records listed in its section 5) stands under it.

**The canon (every file `requirements/README.md` lists)**

| source | read whole by |
| --- | --- |
| `docs/architecture/BIO_Complete_Roadmap_v5.md` (all, incl. §§13-15 and appendices), `BIO_Design_Requirements_v2.md`, `BIO_Functional_Architecture_v3.md` | S01 |
| `docs/architecture/BIO_System_Design.md`, `BIO_Investigation_v0_1.md`, `BIO_Action_v0_2.md` | S02 |
| `docs/architecture/BIO_Content_Framework_v0_10.md` lines 1-1271 / 1272-2657 | S03 / S04 |
| `docs/architecture/BIO_Intake_Doctrine_v1_1.md`, `BIO_Declared_Bias_v0_1.md` | S05 |
| `docs/architecture/BIO_Membership_Architecture_v2.md` | S06 |
| `docs/architecture/BIO_Case_Making_v0_1.md` (its history sections too, marked so), `BIO_Distribution_v0_1.md` | S07 |
| `docs/architecture/BIO_Interaction_Constructs_v0_1.md`, `BIO_Assistant_and_AI_Roles_v0_1.md` | S08 |
| `docs/architecture/BIO_Publication_v0_1.md` | S09 |
| `docs/architecture/BIO_State_Rules_Consistency_v1_5.md`; `docs/development/CAPTURE-FIDELITY.md`, `MULTI-INSTANCE-ISOLATION.md`, `SCHEDULER.md` | S10 |
| `docs/architecture/BIO_Technical_Architecture_Decisions_v10.md`, `BIO_Bundle_Skill_Composite_Design_v1_7.md` | S11 |
| `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md`, `CONTENT-SEARCH-DESIGN.md`, `CONTRADICTION-IDENTIFY-DESIGN.md` | S12 |
| `docs/development/OBSERVATION-LOG-DESIGN.md`, `EXTRACTION-BREADTH-DESIGN.md` | S13 |
| `docs/development/INVESTIGATIVE-SESSION.md` lines 1-792, `MEMBER-KNOWLEDGE-DESIGN.md` | S14 |
| `docs/development/INVESTIGATIVE-SESSION.md` lines 793-1817, `ASSISTANT-PILOT.md`, `RETRIEVAL-SUBSTRATE.md` | S15 |
| `docs/development/DOCUMENT-PROFILES.md`, `OFFICE-FORMATS.md`, `AUTHORITY-AND-TRUST.md`, `LINK-FIDELITY.md`, `ARCHIVE-FALLBACK.md` | S16 |
| `docs/development/SOURCE-ACCESS.md`, `CLIENT-RENDERED.md`, `INBOX-GRAMMAR.md`, `NOTIFICATIONS.md`, `UI-KICKOFF.md` | S17 |
| `docs/architecture/BIO_Capability_Ladders_v0_1.md`, `requirements/README.md` | the draft's worker (its section 5) |
| Bob's DEC rulings, `docs/development/DECISIONS.md` lines 1-3479 / 3480-6475 (a record, read for the member-visible acts, screens, constructs and journeys each DEC names; purely internal DECs listed and passed) | S35 / S36 |

**The design registry (`docs/development/ux-substrate/`)**

| source | read whole by |
| --- | --- |
| `ux-experience.json`, in seven shares: `useCases` (172) / `meta`, `audiences`, `journeyExperience` (11 journeys, 81 steps), `designOpen` / `surfaceRules` / `openQuestions` [0-15] / [16-22] / [23-28] / [29-35] | S18 / S19 / S20 / S21 / S22 / S23 / S24 |
| `screens/registry.json` (84 screens, every op) | S25 |
| `layouts.html` (its text; its inlined scripts are the `screens/` mock sources), `HANDOFF.md`, `screens/mock-journeys.js` | S26 |
| `screens/library.json` (23 wizards), `ux-substrate-v2.json` `surfaces` and `journeys`, `T50-requirements-gaps-2026-10-17.md`; `build/plan/handoff-ux-round7.md`, `build/plan/walk-T51-run.txt` | S27 |
| `README.md`, `journeys.html` | the draft's worker |

**Records read for the construct ids and journeys they name (K4784)**

| source | read by |
| --- | --- |
| `docs/architecture/construct-status.json` (retired as a status source; 15 sections, 168 claims, every id, state, text and note) | S34, by script and reading, except the 225 KB changelog note inside claim `3.census`, of which S34 read only the first 7,000 and last 3,000 characters; that note (224,292 characters) was then read whole on 2026-10-23 by the coverage-split worker for BOB #269 (a single session, no helper), extracted by script to a scratch file and read in four shares of about 56 KB; the note repeats each entry through its merges, so after the first 83,000 characters were read line by line, every later sentence was checked by script as an exact repeat of one already read and the 41 that were not (about 8 KB) were read; its rows corrected: R25, R30, R41, R49, R50, R80, R91, R94, R100, R101, R136, R144, R154, R173 |

**Fix-round plans and walk records**

| source | read whole by |
| --- | --- |
| `build/plan/fix-round-6-T51.md` lines 1-204 / 205-417 / 418-635 | S28 / S29 / S30 |
| `build/plan/archive/fix-round-7-T51-s1-s5.md` (G58-G82) and `build/plan/fix-round-7-T51.md` (G83-G90, its section 8) | S31 |
| `build/plan/fix-round-7-T51-added.md`, `fix-round-7-G88.md`, `archive/fix-round-T51.md` (round 1), `fix-round-T51-pass.md` | S32 |
| `build/plan/walk-T51-rewalk7/BRIEF.md`, `A.md`, `B.md`; `rewalk7-found.md`; `lane-journeys/PLAN.md`, `CHARTER.md`; `walk-T51-live/CAUSES-live.md` (all, past L30) | S33 |
| rounds 2, 3, 4, 4b, 5 and round 6 §§0-2a, G1-G13; the walk records LIVE, BUILD, RW2-RW6, `walk-T51-findings.md`, `redeploy-walk-T51.md`, `lane-journeys/HANDOFF.md`, `FINDINGS.md` | the draft's worker |

Area writers also opened the walk records at the cited lines to confirm evidence (W02, W06, W11).

**Not read whole, and why.** The `shots/` folders and the walkers' scripts (`smoke.mjs`) were not read: they are pictures and code, not records of what was done. `ux-substrate.html` and `ux-substrate.json` are the built page and the first inventory, rendered from the files read. The design stream's other pages (`visual-language.html`, `brand-and-voice.html`, `design-principles.html`, `dashboards.html`, `measures-map.html`, `new-name.html`), the `screens/words-*` word lists and the rest of `ux-substrate-v2.json` were not among the sources the draft named as unread and were not read for this completion. BOB may set a helper to them if the review wants them.

## 6. Notes for BOB

What the writers and reconcilers could not settle, contradictions between sources and the map (with both citations), ids the map named that the registry lacks, and acts designed but not built, by area. The three most consequential: (1) the alpha's install and update rows wait on release 0.87.0 (G90 did not ship in 2496ff995b); (2) DEC-120, DEC-148 and DEC-157 make wizards and translation by hand part of the unassisted product, so they moved from the after-alpha area into areas 1, 2 and 9; (3) several draft rows rested on superseded rulings: R04's session lengths (now DEC-202 (2): own device locks after 30 minutes and signs out after 12 hours, a shared device after 15 minutes), R11's two-administrator floor (DEC-134: one administrator allowed, only the last may not step down), R15's debt blocking (DEC-20: only an uncleared hunch refuses publication). Whether rows that rest on ops the registry marks owed should read a fourth status (BLOCKED-OWED) is BOB's to decide; this map keeps the three statuses and marks the ops.

## Files

| file | map area | sitting |
| --- | --- | --- |
| `01-install.md` | Area 1 Install, claim, set up the room | sitting 1 |
| `02-people.md` | Area 2 The team's people and accounts | sitting 2 |
| `03-projects.md` | Area 3 Projects and the daily rhythm | sitting 3 |
| `04-documents.md` | Area 4 Bring documents in (4a and 4b) | sitting 4 |
| `05-vouch.md` | Area 5 Vouch; people, organizations, ties | sitting 5 |
| `06-read-cite.md` | Area 6 Read, find, cite into a question | sitting 6 |
| `07-money-time.md` | Area 7 Money, time, connections, registers | sitting 7 |
| `08-law.md` | Area 8 Law and courts | sitting 8 |
| `09-question.md` | Area 9 Question to conclusion (and the plan opened) | sitting 9 |
| `10-case.md` | Area 10 Case to publication (10a and 10b) | sitting 10 |
| `11-act.md` | Area 11 Act | sitting 11 |
| `12-after-alpha.md` | Area 12 After the alpha (not walked in the alpha) | not walked in the alpha |
| `overlay.md` | Overlay for every walker | every walker, in every area |
| `README.md` | this index | |
