# Plan T29

**Status** · OPEN · BOB #106 · session_014NiBSyfeN9Ej6wJuwzhDhh · depth 1

**Jobs** · signatures: SIGNATURES #7 session_01LrwnC23wRd3ati4bwBSKnq; membership: MEMBERSHIP #22 session_016G62nZSnbukEEdrMHSsV1z; promotion: PROMOTION #29 session_012itywqqcejzP4TtrJ2dRny; capture: CAPTURE #18 session_0181RUrJ7zf5WDcW4trWkR3Y; reevaluation: REEVALUATION #16 session_01NTpQJf5vp8NWhH7MCRQXe9; case-carriage: CASE-CARRIAGE #1 session_01NMLMCaPqjqRW2kHK9vegRN; publication: PUBLICATION #17 session_017bm3BWK3xDxBgctGcV2Rnp; docket: DOCKET #3 session_01CSkgoq9z5tRnMWZZnTMGfA; case-checker: CASE-CHECKER #2 session_01WJvRKHshhLTwUVBauzgSmg

**Opened** 2026-10-03 ~03:25 UTC by BOB #106 from `main` @ cd196e63c4 (T28 closed, K1335), from T28's `next.md` (K1336). **Bob's weekly meter** · 72% after T26 (K1250); asked at T28's close.

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T29 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633; manifest "Parallel work"). |

No other module is marked `legacy`; no extraction is open.

## Rules at the opening

T28's rules hold (merge early; one file, one editor; marks struck at the merge; no layer closes red except by name; owners export, the plane composes; the UX stream's DECs cited, never minted; a job re-scans its own module for the N502/N508 kind and re-words what it finds). Requirements for L1–L3 (N530) are folded at the opening by BOB; those for L7–L11 (N529, N531–N534) are folded on `prep/T29-folds` and merged before L7 starts (P18: no running job reads them). The new modules `case-carriage` (N532, before `publication`) and `case-disclosures` (N529, after `case-import`, before `case-authoring`) are registered with empty `paths`; each job names its files and BOB records them in `modules.json` before its merge.

**Within a layer, a new or changed provided service is merged first** (§4): L8 in the order `case-carriage`, `publication`, `docket`, `case-checker`, `case-import`, `case-disclosures`, `case-authoring`; L11 in the order `affordances`, `queue-producers`, `op-declarations`, `control-plane`, `plane`.

**Accepted reds, by name, at the opening:**
1. Coverage: every id marked `*(not yet met: T29)*` with no test yet (case-carriage and case-disclosures whole, and the rest the folds mark), until its module's merge.
2. `bio-plane/test/system/row-census.test.mjs`: rows whose `where` moves with the case-authoring split (C-120) and docket's new codes (N533) read changed until T30's stamp (S6; promotion is L2, before they move). S5 stamps T28's rows now.
3. The UI's DEC-88 tests (N487, K1030): stay red, Bob's.

## Roster (by layer)

**L1** · signatures: R41 `captureAccountStatement` (N530).
**L2** · membership: R83's `MODULE_ORDER` re-pinned to the new order (`case-carriage`, `case-disclosures`). promotion: S5.
**L3** · capture: R69 wording; its spelling becomes a re-export (N530).
**L7** · reevaluation: R31's telling reads as the plane (N531); N534's share.
**L8** · case-carriage (new, N532); publication (N532: the moved code out, delegates kept); docket (N533: its own codes for the two shared); case-checker (N530: R3, the import, `program.mjs` rebuilt); case-import (N534's share); case-disclosures (new, N529); case-authoring (N529: the moved code out, R55).
**L10** · monitoring (N534).
**L11** · affordances, queue-producers, op-declarations, control-plane (N529 `CHECK_FAMILY_FILES`; N533 docket's place, R43), plane (composition of the two new modules), each as the folds name; N534's ops.

## Entries

- S5 · 2026-10-03 · **promotion**: stamp the catalogue rows T28's L6–L11 jobs add (case-checker's, case-import's, accepted-work's and docket's new rows, and any the drafts name that did not exist at T28's L2), as their T28 records name them; `CATALOG_VERSION` MINOR; `ROW_CENSUS` re-pinned. **Why next:** promotion is L2, before the rows exist (P8, P10). Clears T28's red 2.

- N528 · 2026-10-03 · **DEC-120–DEC-123** (U30–U32): the wizard and its two libraries, a phone's act set and handoff, both themes, bundled typefaces and scripts, the 57 design principles. Their owed server-side work is folded into requirements once on `main` (the design stream's next PR, merged at a tranche close) or as Bob names it; the screens are the UX stream's (K633). **Hard reason:** the DECs are not yet on `main` (manifest "Parallel work").

- N529 · 2026-10-03 · **case-authoring split** (K1315): if CASE-AUTHORING #13 completes past ~4,000 lines (measured 3,426 at its START; R43–R54 add ~700–800), split it at the disclosures seam (R31–R37, R43–R54), the new arms already in their own files (`materials.mjs`, `accepted.mjs`), so the split moves whole files. **Why next:** one job per module (P8); the split is a new module's job (P6). **Seam (K1333, `build/extraction/case-authoring-split.md`):** new module `case-disclosures`, directly after case-import and before case-authoring (~1,210 lines; case-authoring ~2,940): `materials.mjs`, `accepted.mjs` whole, the C-120 rows (R12 moves too), 15 methods and `disclosureBlocks`; the disclosure renderers move from `document.mjs` (one spelling, case-authoring imports them; the signed document byte-identical). R31, R35–R37, R43–R52, R54, R12 become case-disclosures R1–R16; R32, R34, R53 stay; new case-authoring R55 (the order `publishCase` asks). Users: membership `MODULE_ORDER`, control-plane `CHECK_FAMILY_FILES`, promotion re-stamps the census (S5's job), plane re-points (optional).

- N530 · 2026-10-03 · **capture's account statement, one spelling** (K1317): `case-checker` spells `bio-capture-account <sha>\n<text>` itself (R3, R14) because `capture` is store-bound; move `captureAccountStatement` into a pure module both use (`record-grammar` or a pure file of `capture`). **Why next:** both jobs are running or merged (P8).

- N531 · 2026-10-03 · **reevaluation**: `acceptanceWithdrawn`'s detail read passes `class:admin` as its viewer, which `case-import` R16 answers null, so the acceptance cause's `group` and `case` read null (CASE-IMPORT #1 J3; K1319). Read as the plane (no viewer) for the telling's detail, or state why not. **Why next:** reevaluation's T28 job is merged (P8).

- N532 · 2026-10-03 · **publication split** (K1322): 3,996 lines at its T28 merge, at the ~4,000 mark (P6). Split at the seam its job named (R57's holding: `#holdMaterials`, `#tokenFiles`, `publishedMaterialText`, `heldMaterialsOf`, ~140 lines; R59's re-read, ~50) before its next job adds to it. **Why next:** its T28 job is merged (P8). **Seam (K1332, `build/extraction/publication-split-2.md`):** new module `case-carriage` (L8, directly before publication) takes R57's holding, R59's and R51's re-reads (~270 lines; publication ~3,820) and owns `published_material_texts`, `published_case_materials`; publication keeps one-line delegates and writes every `published_shas` row. With it: provenance R48 names `register.bytes`; publication R57's timestamp-token sentence reworded to the capture's `provenance.json` as built (K1322).

- N533 · 2026-10-03 · **docket, then control-plane** (K1331; CONTROL-PLANE #18 J1): docket's family shares `PRESSURE_MARKED` (C-129.12 / action-grammar C-117.17) and `PRESSURE_REFUSED` (C-129.13 / C-117.15) with action-grammar, so reading it at its module-order place would re-row both. docket: its own codes for the two (catalogue rows re-worded, stamped by promotion); then control-plane: `CHECK_FAMILY_FILES` reads docket at its module-order place (R43's docket clause). **Why next:** docket's T28 job is merged (P8); control-plane's move follows docket's codes (dependency).

- N534 · 2026-10-03 · **DEC-101 (3) and DEC-116 (8)'s citing side: watching other groups' published cases** (T28-1's last share, K1268; `draft-T29-carried.md` §1): a member's watch on an imported case, naming the publisher's docket address; corrections and withdrawals told to dependents; ops routed. Drafted (`draft-T29-n534.md`); **waits on Bob's approval** (DEC-101's owed line: "BOB places them, for Bob's approval"; K1339). **Moved to T30** (K1342): L7 started before his answer, and its L6 share (accepted-work R8) must precede reevaluation (P4, P10); hard reason: a question that is Bob's (P19).

N528 stays out: DEC-120–DEC-123 are not on `main` (manifest "Parallel work"). T28-1 closes (K1336): DEC-96 (1), (2), (4) and DEC-92's server share are met; DEC-96 (3) and the public list (option B) wait on Bob's triggers; the display is UX (K633); DEC-101 (3) is N534.

## Watched for size (P6, K617)

case-authoring 4,010 and publication 3,996 are split in this tranche (N529, N532). queue 2,781 lines of own code (its job counted 6,015 with tests). Each job measures its module at completion.

## Left out of T29 (one hard reason each; carried to `next.md`)

| row | item | hard reason | note |
|---|---|---|---|
| B1 | DIST-14 (office-readers) | deployment | CSV bound measured on a deployed plane |
| B2 | N75 (image-codecs) | deployment | 61.3 MB bound |
| B3 | N34 (pdf-worker) | deployment | JPX bound; JBIG2 fixture encoder; 4,277 lines (P6) |
| B11, C9 | N461 release share; N471's release copies | deployment | the next signed release, Bob's act |
| B16 | N473 (`filing_templates` table) | deployment | migration run at every instance |
| C1 | office-readers R28/R29 retired | deployment | migrations at every instance |
| C2 | `MODES.plan` deployed | deployment | K660 (5) |
| C3 | newgroup installer deployed, N336 | deployment | a signed release |
| C4, A11–A17 | contradiction R24, R27, R32, R33/R36 K5 arms, R34, R41, R57 | measurement | a measured recommender run (K488) |
| C8 | first profile's facts without a source | measurement | K925, K934, K941 |
| B4, B5 | N144, N232 | Bob's (UX) | K899 (2) |
| A54 | skills R10 | Bob's (UX): ruled, waits on the new interface | K899 (2), with N144 |
| B6–B10, B12, B18, B20, C6, C7, D2, I2 | legacy-ui shares, UI fixtures, the module | Bob's (UX) | K633, K1006 |
| N487 | legacy-ui DEC-88 reasons | Bob's (UX) | K633, K1030 |
| J7 | DEC-81's Grade A (and its three decisions) | trigger: DEC-81 (4) defers Grade A until a case is challenged on authenticity, a group needs legal-grade evidence, "self-attested only" becomes material, or Bob asks | nothing to ask Bob (K1267) |
| H13 | DEC-105 audience guidance | trigger (a group asks, or a case is challenged) | DEC-105 defers it; nothing to ask Bob (K1266) |
| C5 | `PLN-` affordances, plan page, joint action | Bob's (UX) for the plan page (approved, K608 (4)); trigger for joint action (a coalition asks, K600 (c)) | nothing to ask Bob (K1266) |
| H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11 | DEC screens of the new interface | Bob's (UX) | K633, K899 (2) |
| H1, H6b, J4 | DEC-96, DEC-101 (3), DEC-92 | dependency not yet built | nothing brings another group's edition into this copy |
| A8 | bias R26 | dependency not yet built | K102's trigger |
| A21 | inquiry R31 | dependency not yet built | no opinion element (MK-5) |
| A22, A23 | installer R13, R24 | dependency not yet built | the new member surfaces |
| A37 | progressions R32 | dependency not yet built | no amounts or funds as values |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |
| N493 (part) | member-facing translations of "noticed" (contradiction `checks.mjs`:136, :236; queue `checks.mjs`:63) | Bob's: UX (the design stream's DECs decide member-facing wording) | by BOB #93, K1099 |

| T27-1 | a docket-signing step in the member interface (signatures J1: the signer page signs docket entries; `civicos-ui` signs nothing) | Bob's (UX) | K633; legacy-ui |
| N521 | DEC-113's device half | dependency not yet built | no device-storage module |
| N528 | DEC-120–DEC-123's server-side share | dependency: not yet on `main` | the design stream's next PR, merged at a tranche close |
| T28-1 (rest) | DEC-96 (3) "meets standards"; the public list of acceptances and flags | trigger (Bob's, DEC-96) | nothing to ask Bob |
