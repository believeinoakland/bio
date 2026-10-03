# Plan T28

**Status** · OPEN · BOB #104 · session_01GJwrrGrvmxmL87Ju4BtBpV · depth 1

**Jobs** · membership: MEMBERSHIP #21 session_014t8ory3KuXTmiZLiSDLmaB; promotion: PROMOTION #28 session_01JXCfBLEWnwDJYd7wTMihga; inquiry-grammar: INQUIRY-GRAMMAR #5 session_01PnLhSoHMj7KMjQmdKaYkP6; accepted-work: ACCEPTED-WORK #1 session_01Ny1sjsJ9vEJz7rxs28vcCh; inquiry: INQUIRY #13 session_01QNQaUggEEA2eXfwiByRD2P; basis-versions: BASIS-VERSIONS #11 session_01EC1CbcpHTUynmhmiinbKPz; strength: STRENGTH #10 session_01Q7AodKmzj5rYSu6PxmkvRb

**Opened** 2026-10-03 ~00:40 UTC by BOB #104 from `main` @ 416385c819 (T27 closed, K1298; PR #8, DEC-117–DEC-119, on `main`), from T27's `next.md` (K1299). **Bob's weekly meter** · 72% after T26 (K1250); asked at T27's opening and again at its close.

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T28 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633; manifest "Parallel work"). Its shares (the import screens, the acceptance and flag acts, the public page's acceptance statement, the attesting member's credit choice) wait on the UX stream. |

No other module is marked `legacy`; no extraction is open.

## Rules at the opening

T27's rules hold (merge early; one file, one editor; marks struck at the merge; no layer closes red except by name; owners export, the plane composes; the UX stream's DECs cited, never minted; a job re-scans its own module for the N502/N508 kind and re-words what it finds). Requirements were folded at the opening: `prep/T28-folds` (K1292: `draft-T28-dec112.md`, `draft-T28-n522.md`), and N525–N527 by BOB (K1299). The new modules `accepted-work`, `case-checker` and `case-import` are registered with empty `paths`; each job names its files and BOB records them in `modules.json` before its merge.

**Within a layer, a new or changed provided service is merged first** (§4): L6 in the order `inquiry-grammar`, `accepted-work`, `inquiry`, `basis-versions`, `strength`; L8 in the order `case-grammar`, `publication`, `docket`, `public-read`, `ratification`, `case-checker`, `case-import`, `case-authoring`; L11 in the order `affordances`, `queue`, `op-declarations`, `control-plane`, `plane` (`plane` composes everything and merges last).

**Accepted reds, by name, at the opening:**
1. Coverage: every id marked `*(not yet met: T28)*` with no test yet (accepted-work, case-checker, case-import whole; case-authoring, case-grammar, inquiry-grammar, public-read, publication, reevaluation, strength, docket R23, and the rest the folds mark), until its module's merge.
2. `bio-plane/test/system/row-census.test.mjs`: catalogue rows this tranche's L6–L11 jobs add read `awaiting stamp` until T29's promotion stamp (promotion is L2, before they exist). S4 stamps T27's rows now.
3. The UI's DEC-88 tests (N487, K1030): stay red, Bob's.
4. The new ops' L11 arms (control-plane totality, affordances R12) for `case-import`'s eight ops, from case-import's L8 merge until L11's.

## Roster (by layer; 21 jobs)

**L2** · membership: R83's `MODULE_ORDER` re-pinned to the new order (accepted-work, case-checker, case-import). promotion: S4 (T27's rows: C-117.23–.25, C-69.5, C-129.1–.26, public-read's and signatures' new rows as their T27 records name them), and the drafts' stamps of rows that exist when it runs (C-120.8, C-122.2, C-21.3–.5, C-120.10–.13, C-122.3, .4; C-58.5 and C-92.10 re-worded, K1275); `CATALOG_VERSION` MINOR; `ROW_CENSUS` re-pinned. A row that does not yet exist is listed in its record, for T29.
**L6** · inquiry-grammar: R7, R8, R11 (N522). accepted-work (new): R1–R7 (N522). inquiry: R4, R12 wording, a ref's projection (N522). basis-versions: R3 (N522). strength: R31–R34 (N519, N522).
**L7** · reevaluation: R1, R8, R31, R32 (N519, N522).
**L8** · case-grammar: R1, R9 (N524), R11–R16 (N519, N520, N522). publication: R33, R57–R60 (N519, N522). docket: R2's own code (N526), R23 (N525). public-read: R3, R5, R6, R22–R24 (N520). ratification: R2, R14, R35, R36 and two translations (N519, N523); 3,979 lines at the opening: measured at its START, split first if past 4,000 (K617, K1277). case-checker (new): R1–R18 (N520, N522). case-import (new): R1–R16 (N520, N522). case-authoring: R14, R29, R34, R37, R43–R53 (N519, N520, N522).
**L11** · affordances: the eight `case-import` ops graded (the four DEC-96 acts `reasoned`). queue: R28 (N527). op-declarations: specs for `caseimport`, `importedcases`, `importedcase`, `caseimportdocument`, `importaccept`, `importacceptwithdraw`, `importflag`, `importflagclear`; `publish` and `publishpreflight` gain `flagsDisclosed`. control-plane: routes for the eight ops (`case-checker`'s two public reads ride `public-read` R18), and docket's family at its module-order place in `CHECK_FAMILY_FILES` once docket's own code is merged (N526). plane: composition (`accepted-work`'s factory before `inquiry`'s; `case-checker`'s and `case-import`'s registrations).

## Entries

- S4 · promotion (L2). Clears T27's red 2.
- N519 · DEC-112 (5) as ruled on 1 October (K1275, K1277): strength, reevaluation, case-grammar, publication, ratification, case-authoring.
- N520's DEC-112 share · `case-checker`, `case-import` (K1256, K1268): new, L8; users in L11.
- N522 · DEC-96 items 1, 4 (K1273): `accepted-work` (new, L6) and its users.
- N523 · ratification R35 (DEC-119 (3)).
- N524 · case-grammar R9's lens sentence (DEC-117).
- N525 · docket's addresses in one form (K1299).
- N526 · docket's own machine-refusal code; control-plane's family order (K1291).
- N527 · queue R28 classes contradiction-duty ids (K1293).

## Watched for size (P6, K617)

ratification 3,979 lines at the opening (measured at its START; split first if past 4,000). publication measures 3,633 (`worker.mjs` is public-read's, K702), case-authoring 3,426, control-plane 3,618 by its paths. Each job measures its module at completion.

## Left out of T28 (one hard reason each; carried to `next.md`)

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
| T28-1 | H1, H6b, J4's remaining shares (DEC-96, DEC-101 (3), DEC-92) beyond N522 | dependency not yet built | `case-import` is built in this tranche (L8); re-read for T29 once it is merged |
