# Plan T31

**Status** · OPEN · BOB #108 · session_01JVc45Ron6Z6Qg9yuJinySb · depth 1

**Jobs** · signatures: SIGNATURES #8 session_01JojTP81KLXqohStkarosgE; acquisition: ACQUISITION #8 session_01TNXZ4EjoqnXE7ZRkqLBzKq; capture: CAPTURE #19 session_01A4QQEgEAz3S4VbtQrGS5L3; reading-pipeline: READING-PIPELINE #2 session_01DyVawcUA9UTeHgLqooX3Aa; accepted-work: ACCEPTED-WORK #2 session_01CZLKztGUri31Gi7fLxYE45; strength: STRENGTH #11 session_01EghdokiWqHZ7K6YuUQjVB9; capture-requests: CAPTURE-REQUESTS #10 session_01EdzfgSAti176MrfZd2aQyS; skills: SKILLS #11 session_01DcobKxG1hPDvC7ij2ey15E; reevaluation: REEVALUATION #17 session_013cjuBNfdxEeQYE6n1vCq5N; case-grammar: CASE-GRAMMAR #6 session_01PgEhNJ94yAy3KBKUN6MKcr; publication: PUBLICATION #19 session_01TE4VxHB897hfFXwEHVjykh; docket: DOCKET #4 session_01Qyoizgt1w9CACfsTkAN1sV; public-read: PUBLIC-READ #10 session_016SfTxv2owbWsyKBSjqM3an; network-notices: NETWORK-NOTICES #5 session_016Qoe57tyy7EQDdaxDtEBXa; ratification: RATIFICATION #18 session_01HDpsLF3gYUqeM8zxQGYAq7; case-checker: CASE-CHECKER #3 session_01DbmGw6aXDCHDt4jNqGVCsU; case-import: CASE-IMPORT #2 session_01MtNWSCDRK9AGiEKUk2dMFY; case-authoring: CASE-AUTHORING #16 session_01HNgAFdfDCrMf2zid6uorgB; monitoring: MONITORING #14 session_01P7ix1fsb1sMMLpFiv27Btv; wizard-scripts: WIZARD-SCRIPTS #1 session_015rXhvVXUnRr73rAvgxK4WZ

**Opened** 2026-10-03 by BOB #107 from `main` @ d2b7451b80 (PR #9 merged at the T30/T31 boundary, K1361) with T30's boundary records; on Bob's "Start the work now" (K1362). Requirements folded at the opening on this branch (K1367 N538, K1368 N528, K1369 N534). **Bob's weekly meter** · 86% at the opening (K1361).

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T31 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633); its CivicOS strings and folder name too (K1361). |

## Rules at the opening

T30's rules hold. **Merge order within a layer is `modules.json` order** (every provider is earlier than its users); in L3 acquisition first, in L8 case-grammar first, in L11 wizard-scripts first. A job whose module uses a provider of the same layer merges the tranche branch after that provider's merge (BOB's `CHANGE`). Signed-record labels (K1365): new records `civicsmith-…`, old kept and accepted forever, a test per format proving an old-label record verifies; the seal hash tags, `civicos-working-on-seal/1` and `urn:civicos:` feed ids never change.

**Accepted reds, by name, at the opening:**
1. Coverage: every id marked `*(not yet met: T31)*`, until its module's merge. Six new ids read covered by an unrelated string (reevaluation R33, public-read R25, case-import R19, queue-producers R34, plane R20, control-plane R52, K1369): their jobs write real tests.
2. `bio-plane/test/system/row-census.test.mjs`: rows T31's jobs add (wizard-scripts' family, case-import C-130.15–.16, docket's) read changed until T32's stamp (S7; promotion is L2).
3. The UI's DEC-88 tests (Bob's).

## Roster (by layer)

**L1** · signatures: N538: R32; `sign-release.html` strings, `signpage.mjs` re-rendered; tests.
**L3** · acquisition: N538: R9, R16, R24 (`civicsmithUserAgent`, `CIVICSMITH_CONTACT_URL`, old names kept as aliases); merges first in L3; capture: N538: the `who` text (`index.mjs` ~845) and its test.
**L4** · reading-pipeline: N538: the probe user-agent constant to `Civicsmith/…`.
**L6** · accepted-work: N534: R1, R2, R8 (`publisherMoves`); strength: N538: R15, R31 (`gradingMethodText(version, product)`; "CivicOS" byte-identical for `/6`); capture-requests: N538: R14 (`ua_mode` `civicsmith`, `civicos` one mode), re-point to `civicsmithUserAgent`; skills: N528: R1, R5, R9, R10, R32 (wizard scripts, `wizard_authoring`); N538: doctrine rule 9's sentence.
**L7** · reevaluation: N534: R8, R33 (`cited_case_moved`).
**L8** · case-grammar: N538: R1 (`bio-case-document/7`), R14 (the name by format); N528: R14 light-only; docket: N538: R6 (`civicsmith-docket-entry/1`, both accepted, mixed chains); N534: R24; public-read: N534: R25; network-notices: N538: R3, R10, R12, R13, R17 (new labels, old accepted; seal tags kept); the TSA user agent; ratification: N538: read `/7` as `/6` wherever the code names the current format (`checks.mjs` 516–801); publication: N538: read `/7` as `/6` (`checks.mjs` ~114 and any other place); case-checker: N538: R10, R16; header and `spec.mjs` text; `program.mjs` rebuilt; case-import: N534: R12–R14, R16, R17–R20 (the watch; C-130.15, C-130.16); case-authoring: N538: R14 (writes `/7`).
**L10** · monitoring: N534: R30, R36, R67, R68 (the daily docket read); N538: re-point to `civicsmithUserAgent`, `SLATE_FRAMING_OPEN`.
**L11** · wizard-scripts: N528: new module, R1–R20 (K1364); merges first in L11; affordances: N528: R36, R37; N534: R38; queue-producers: N528: R8, R32, R33; N534: R34, R35; instance-setup: N538: R8 (well-known fallback), re-point; N528: R49; op-declarations: N528: R15; N534: R16; control-plane: N528: R41, R50, R51; N534: R52; plane: N528: R19; N534: R20; installer: N538: R22 (texts, `newgroup/dist` rebuilt); N528: R35 (no outside loads).

## Entries

- N538 · DEC-124, the rename to Civicsmith (K1361, K1365, K1367): parts (1), (3) and (2)'s code identifiers, as the roster names.
- N528 · DEC-120–DEC-122's server share (K1363, K1364, K1368), with the new module `wizard-scripts`.
- N534 · DEC-101 (3) with DEC-116 (8)'s citing side: watching other groups' published cases (K1339, K1366, K1369).

Out: N538 (4) and what waits on it (the served addresses, bundler R17's worker name, the workers.dev address, the `civicos-process` repository): Bob does not yet hold the civicsmith domains. legacy-ui's share: Bob's (UX).

## Left out of T31 (one hard reason each; carried to `next.md`)

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
| A8 | bias R26 | dependency not yet built | K102's trigger |
| A21 | inquiry R31 | dependency not yet built | no opinion element (MK-5) |
| A22, A23 | installer R13, R24 | dependency not yet built | the new member surfaces |
| A37 | progressions R32 | dependency not yet built | no amounts or funds as values |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |
| N493 (part) | member-facing translations of "noticed" (contradiction `checks.mjs`:136, :236; queue `checks.mjs`:63) | Bob's: UX (the design stream's DECs decide member-facing wording) | by BOB #93, K1099 |

| T27-1 | a docket-signing step in the member interface (signatures J1: the signer page signs docket entries; `civicos-ui` signs nothing) | Bob's (UX) | K633; legacy-ui |
| N521 | DEC-113's device half | dependency not yet built | no device-storage module |
| T28-1 (rest) | DEC-96 (3) "meets standards"; the public list of acceptances and flags | trigger (Bob's, DEC-96) | nothing to ask Bob |
| N538 (4) | the served addresses, the worker name, the process repository | dependency: Bob's domains | K1361, K1365 |
