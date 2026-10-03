# Plan T32

**Status** · OPEN · BOB #109 · session_01StRnMqhDPSE4Afi9a5z1U7 · depth 1

**Jobs** · record-grammar: RECORD-GRAMMAR #7 session_01TRvdoW3T2CWeCikzNiB9jS; membership: MEMBERSHIP #23 session_01Wfr9yNZxkhG7EgTdUKQsMf; promotion: PROMOTION #31 session_01UDnkacoJ2wBBSc6UQbGpGi; acquisition: ACQUISITION #9 session_01YSPCBnvSnZ3tLVcBFfJatU; capture: CAPTURE #20 session_01GSh98oKfBHUNDu5vj9XCLy; reading-pipeline: READING-PIPELINE #3 session_01JD6kskytnjr8DdFry3Y75L; case-import: CASE-IMPORT #3 session_01MiW6fXUHMWPvHxptpYDLsJ; queue-producers: QUEUE-PRODUCERS #11 session_01Fk6NZizVdw2PkBBvxaGQW3; queue: QUEUE #17 session_01LniC4TbnKF6muwuHuXpuiY; control-plane: CONTROL-PLANE #21 session_012juXu9ukz4qbejbB2SqhAc; plane: PLANE #21 session_01JL5ihXZTwMD225KhykMihR

**Opened** 2026-10-03 ~22:00 UTC by BOB #109 from `main` @ 8cd952d87c (T31 closed, K1410), at once (§5.7 (6), P18). Bob's weekly meter: asked at the opening.

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T32 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633); its CivicOS strings and folder name too (K1361). |

## Rules at the opening

T31's rules hold. Merge order within a layer is `modules.json` order. N545 was carried into T31 (K1405).

**Accepted reds, by name, at the opening:**
1. Coverage: every id marked `*(not yet met: T32)*`, until its module's merge.
2. `bio-plane/test/system/row-census.test.mjs`: T31's rows read changed until promotion's S7 merges (L2).
3. The UI's DEC-88 tests (Bob's).
4. wizard-scripts R5's label test, until record-grammar's N543 merges (L1).
5. membership's R83 test (`module-order.test.mjs`), until N544 merges (L2).
6. control-plane's R42 rank test (`promotion-step.test.mjs`:32), until plane's and control-plane's L11 merges (K1416).

## Roster (by layer)

**L1** · record-grammar: N543.
**L2** · membership: N544; promotion: S7.
**L3** · acquisition: N541 (provides the `who` spelling; merges first in L3), N539 (no module outside acquisition names the aliases; `newgroup/src/release.mjs` only embeds the released bundle's source, rebuilt at the next signed release); capture: N541 (reads it).
**L4** · reading-pipeline: N542 (with the `uses` edge reading-pipeline → acquisition).
**L8** · case-import: N546 (R20's `seen_at`).
**L11** · queue-producers: N546 (R35 ages from `seen_at`; merges first in L11); queue: N547; control-plane: R42's rank test names the step's next module as the first layer-11 module, not `affordances` (K1416); plane: `STEP_ORDER` (`store.mjs`) puts the step before the first layer-11 module, now `wizard-scripts` (K1416); merges last, after control-plane.

## Entries

- N543 · **record-grammar**: `PROPOSAL_STATES` gains the `wizard` subject (one frozen table, three sentences, worded as `template`'s for a wizard script's steps), so wizard-scripts R5's label test turns green (K1396).
- N544 · **membership**: `MODULE_ORDER` gains `wizard-scripts` between `scheduler` and `affordances` (R83), as for link-sweep, attestation, docket (K1396).
- S7 · **promotion**: stamp the catalogue rows T31's jobs added or moved (wizard-scripts' family C-131, case-import C-130.15–.16, docket's, and any the T31 records name); `CATALOG_VERSION` MINOR; `ROW_CENSUS` re-pinned. Clears red 2.
- N541 · **acquisition, capture**: one spelling of a first hop's `who` (`instance <name> (Civicsmith/<version>)`), provided by acquisition and read by capture R65 (CAPTURE #19 J1, K1374).
- N539 · **acquisition**: remove the `civicosUserAgent` and `CIVICOS_CONTACT_URL` aliases (K1365 (6)).
- N542 · **reading-pipeline**: `tier-pagewise.probe.mjs` composes its `--census` user agent with `acquisition.civicsmithUserAgent`; `modules.json` gains the edge reading-pipeline → acquisition (K1376).
- N546 · **case-import**: each `watchItems` entry names the instant this copy read it, so queue-producers R35's findings age from it (K1397); queue-producers reads it (P10: a provided service changed, its user in a later layer).
- N548 · **plane, control-plane**: the promotion step's rank (control-plane R42: after every layer 1–10 module, before every later one) holds now that `MODULE_ORDER` carries `wizard-scripts` before `affordances` (N544): plane's `STEP_ORDER` places the step before the first layer-11 module instead of before `affordances`; control-plane's R42 test expects that module after the step (ACQUISITION #9 J2; K1416). P10: membership's provided list changed in L2, so its users in L11 pick it up in this tranche.
- N547 · **queue**: R50 names `reevaluationrecord` as the act of `cited-newer-edition` and `cited-edition-withdrawn`, as for `edition-withdrawn` (QUEUE #16 J2).

Out: N540 (a live acquisition after the first deploy carrying the Civicsmith user agent): a deployment. N538 (4): Bob's domains.

## Left out of T32 (one hard reason each; carried to `next.md`)

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


