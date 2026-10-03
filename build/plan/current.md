# Plan T30

**Status** · OPEN · BOB #107 · session_01Fibz26JrnCgkNYHwprt7tt · depth 1

**Jobs** · promotion: PROMOTION #30 session_011zouuDt37KpxHQBHzQxiy3; publication: PUBLICATION #18 session_01Ez4jm4BPM9Hw57fyKwKCSW; case-disclosures: CASE-DISCLOSURES #2 session_01U6qsAeYBHqtfyBmpcudgfN; case-authoring: CASE-AUTHORING #15 session_01KRZJePotSWg7xtiYtCJpak

**Opened** 2026-10-03 ~04:55 UTC by BOB #107 from `main` @ 92e387269b (T29 closed, K1356), from T29's `next.md` (K1357). **Bob's weekly meter** · 72% after T26 (K1250); asked at T29's close.

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T30 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633; manifest "Parallel work"). |

No other module is marked `legacy`; no extraction is open.

## Rules at the opening

T29's rules hold (merge early; one file, one editor; marks struck at the merge; no layer closes red except by name; owners export, the plane composes; the UX stream's DECs cited, never minted; a job re-scans its own module for the N502/N508 kind and re-words what it finds). No requirement changes meaning: N535–N537 are cleanups within requirements as they stand, S6 a stamp.

**Accepted reds, by name, at the opening:**
1. `bio-plane/test/system/row-census.test.mjs` (T29's red 2): the C-120 rows' `where` and docket's two codes, until PROMOTION #30's merge (S6).
2. The UI's DEC-88 tests (N487, K1030): stay red, Bob's.

## Roster (by layer)

**L2** · promotion: S6.
**L8** · publication (N537); case-disclosures (N535); case-authoring (N536). No provided service changes; merged as each completes.

## Entries

- S6 · 2026-10-03 · **promotion**: stamp the rows T29's L8 jobs move or add (the C-120 rows' `where` after the case-authoring split; docket's own codes for `PRESSURE_MARKED`, `PRESSURE_REFUSED`, N533; any the T29 records name); `CATALOG_VERSION` MINOR; `ROW_CENSUS` re-pinned. **Why next:** promotion is L2, before the rows move (P8, P10). Clears T29's red 2.

- N534 (out) · 2026-10-03 · **DEC-101 (3) with DEC-116 (8)'s citing side: watching other groups' published cases** (from T29, K1339, K1342): `plan/draft-T29-n534.md` (L6 accepted-work R8; L7 reevaluation R33; L8 docket R24, public-read R25, case-import R17–R20; L10 monitoring R67, R68; L11 queue-producers R32, R33, affordances R36, op-declarations R15, control-plane R50, plane R19). **Hard reason:** the placement and F1 are Bob's (DEC-101's owed line); folded at T30's opening once he approves.

- N535 · 2026-10-03 · **case-disclosures**: `acceptedBodyLines` prints "because: <reason>." after a reason that already ends in a full stop ("whole.."); add the full stop only when the reason lacks one, for editions written from then on (a published edition's bytes stay as signed). From CASE-DISCLOSURES #1 J3 (K1348). **Why next:** the T29 move had to keep signed bytes identical (K1333).

- N536 · 2026-10-03 · **case-authoring**: drop the `get attestation()` pass-through and the dependency hand-through in `caseAuthoringOf` once no caller passes them (plane's T29 L11 re-point to `caseDisclosuresOf(ctx, {attestation})`). From CASE-AUTHORING #14 J2 (K1351). **Why next:** one job per module (P8); it waits on plane's re-point, L11 after L8 (P10).

- N537 · 2026-10-03 · **publication**: drop the one-line `get acceptedWork()` delegate to case-carriage; nothing reads it since PLANE #19 re-pointed `accepted.test` R16 (K1349, K1355). **Why next:** one job per module (P8); the reader moved in L11, after publication's L8 job (P10).

N534 stays out (hard reason: Bob's, K1339; the placement and F1). If he approves while T30 runs, it is folded into T31's plan at once (its first layer, L6, is below T30's running L8: P10). N528 stays out: DEC-120–DEC-123 are not on `main`.

## Left out of T30 (one hard reason each; carried to `next.md`)

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
| N534 | DEC-101 (3) watching | Bob's (K1339) | draft ready, `plan/draft-T29-n534.md` |
