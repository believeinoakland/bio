# Plan T25

**Status** · OPEN · BOB #102 · session_019EG7uFMTRzUH2vnxRBoDoW · depth 1

**Jobs** · membership: MEMBERSHIP #19 session_01VygP3okwnSo5Wu6aPRkQw3; promotion: PROMOTION #26 session_0132mjJUXBPPWVGDGbsFCnND; provenance: PROVENANCE #14 session_015S38x6eWCQ3i11cv9DGEP2; attestation: ATTESTATION #1 session_01CCB76CKHZSXMLTrZc9xP3J; provenance-routes: PROVENANCE-ROUTES #1 session_01JmVkWBZc9hpTWverdFG37a; acquisition: ACQUISITION #7 session_01VQnDAX596bDF5ZMb1jr9kL; capture: CAPTURE #17 session_01DBaNZTnhW4WpM4Cc51PGKx; reading-pipeline: READING-PIPELINE #1 session_012Yr3gwtfrXrBoUUrtJgU8a; extraction: EXTRACTION #12 session_018Jaiitbn2X3Px2hE9n3hc8; retrieval: RETRIEVAL #10 session_01Rg1wTDnZPBLyb87zvpKsZk; capture-requests: CAPTURE-REQUESTS #9 session_0113zrDaPdg9qvGBAGsWubQr; case-authoring: CASE-AUTHORING #12 session_01TvrujhMcaGJbTFhyyPqdMd; network-notices: NETWORK-NOTICES #3 session_01Xmknu5rGF5DJySuKiZEqtc; filings: FILINGS #12 session_01W16gVN2HRjfWXSGsuuntKT; affordances: AFFORDANCES #16 session_01X8od5dcSEoHd7paZCEK1Jv

**Opened** 2026-10-02 ~17:00 UTC by BOB #101 from `main` @ dfb82f85cc (T24 closed, K1216), from `draft-T25.md` with BOB #100's review, `draft-T25-req/REVIEW.md`, and T24's `next.md` (K1218). **Bob's weekly meter** · asked at the opening; 61% at T23's close, unanswered at T24's.

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T25 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633; manifest "Parallel work"). Its shares wait on the UX stream: N487 and the left-out table's legacy-ui rows. |

No other module is marked `legacy`; no extraction is open.

## Folds at the opening (BOB, on this branch, K1219, K1220)

1. **N512** (provenance split): `requirements/attestation.md` and `requirements/provenance-routes.md` written from `draft-T25-req/`, with `REVIEW.md`'s decisions; provenance's moved ids retired (never reused), its route clauses (R37, R41, R48, R53, R55) re-worded to point at provenance-routes R8–R12 (K1220: the route side moves whole); users' requirements re-pointed, marked `not yet met: T25` where their code changes.
2. **N513** (extraction split): `requirements/reading-pipeline.md` (R1–R19 moved, R20–R22 copies, R24 `read`'s signature); extraction's moved ids retired; `observation-log.md` and `calibration.md` re-worded.
3. **`modules.json`**: `attestation`, `provenance-routes` after provenance in layer 3; `reading-pipeline` before extraction in layer 4; edges per `draft-T25-req/modules-json.md`, affordances gaining both (REVIEW 5); Status AMENDED.
4. **`layers.md`**: AMENDED; the L3 and L4 rows.
5. **N511**: record-core R72, R73 re-worded to its own route map and gate (no change of meaning).

## Rules at the opening

T24's rules hold (merge early; one file, one editor; marks struck at the merge; no layer closes red except by name; owners export, the plane composes; the UX stream's DECs cited, never minted; a job re-scans its own module for the N502/N508 kind and re-words what it finds). A split's new module owns its moved files from the opening; the source module's job only deletes what moved from its own paths (T24 L10's pattern). **Option B (K1218, as K1220 corrects it):** both new modules take their side whole in T25: attestation owns `receipt_keys` and `signed_receipts` and every write to them, provenance-routes owns `provenance_route_marks`, every write to it and the three route arms. Provenance's L3 job keeps only **pure copies** of the names a later layer imports by name (`routeFinding`, `instanceStatement`, `attest`, `attestOp`; no checks constants; K1225, K1226, K1228), never a stateful method or a table write (**one table, one writer**), until each importer re-points in this tranche; provenance deletes the copies in T26 (N516). A caller of a moved stateful method is red until its own merge (red 7). A row a T25 job adds or changes after L2's stamp is `awaiting stamp` until T26's L2 (S3) and listed in its COMPLETE.

**Accepted reds, by name, at the opening:**
1. `row-census.test.mjs`: C-18.16–.18 `awaiting stamp` (T24's red 5), until promotion's L2 merge (S2).
2. The UI's DEC-88 tests (N487, K1030): stay red, Bob's.
3. Coverage: each id folded at the opening (attestation, provenance-routes, reading-pipeline, and the users' ids marked `not yet met: T25`), until its module's merge.
4. Format: the three new modules' `paths` and `tests` directories do not exist until their merges.
5. membership's R83 test and promotion's `registry.test.mjs`:58: `MODULE_ORDER` lacks the three new modules, from this fold until membership's L2 merge (K1185's precedent).
6. Rows T25's L3–L11 jobs add or change (C-34.*, C-89.* `where` re-pointed): `awaiting stamp` until T26's L2 (S3).
7. The provenance split's users, from provenance's L3 merge until each user's merge: case-authoring (L8) and filings (L9) through `attestationsOf`; network-notices (L8) through `instanceSign`, `instanceKeys`, `instanceKeyBound`; any user of a name moved rather than kept under the one-writer rule; their fixtures.
8. `CHECK_FAMILIES` (control-plane `families.mjs`) and affordances' `catalogue.test.mjs`:958 lack C-34's and C-89's new files, from the L3 merges until control-plane's and affordances' L11 merges.
9. The plane's composition of attestation and provenance-routes (`attestOp`, the receipt signing key, `provenanceRouteOps` and the route arms leaving `provenanceOps`), from the L3 merges until plane's L11 merge.
10. Extraction's tests and callers reaching the moved pipeline, from reading-pipeline's L4 merge until extraction's L4 merge.
11. `test/m/attestation/invariants.test.mjs` R9 fails intermittently (its place probe matches `ca` inside a fresh base64 signature): a test flaw, not a behaviour; N517 in `next.md` (K1234). A job's proof run may re-run it once.

## Decisions at the opening (BOB's, P17; K1218)

- Option B for the provenance split (BOB #100's review 1, corrected by K1220: the route writes move with provenance-routes, provenance keeps pure copies only); provenance first in L3, the new modules after it (review 2).
- C-103.6/.7 stay in provenance's `PROVENANCE_ACT_CHECKS` (provenance R58, the seam); attestation imports them.
- `CAPTURE_TEXT_UNIT_CAP` moves to reading-pipeline and extraction re-exports it, so its other users do not change in T25.
- S2 stamps C-18.16–.18 as 1.55.0 (MINOR, as S1).
- `REVIEW.md` 1–6 bind; attestation R10's wording as drafted.

## Roster (by layer; 17 jobs)

**L2** (merge order: membership, then promotion) · membership: R83, `MODULE_ORDER` equal to `modules.json` after fold 3. · promotion: S2.
**L3** (merge order: provenance, then attestation and provenance-routes, then acquisition and capture) · provenance: N512's removal side under option B (deletes what moved, keeps pure copies of the names later layers import). · attestation: N512, the new module from the moved code and tests, C-89, `receipt_keys`, `signed_receipts`, `attestOp`. · provenance-routes: N512, the new module (R1–R13), C-34, `provenance_route_marks`, `provenanceRouteOps`; `op=stats`' order pinned. · acquisition: `attest` and `signReceipt` through attestation. · capture: `attest` through attestation.
**L4** (merge order: reading-pipeline, then extraction) · reading-pipeline: N513, the new module from `extraction/pipeline.mjs`, `readingprov.mjs` and the moved tests. · extraction: N513's removal side, its imports re-pointed, `CAPTURE_TEXT_UNIT_CAP` re-exported, `uses` measured.
**L5** · retrieval: `routeFinding` and R63's join through provenance-routes.
**L6** · capture-requests: N515.
**L8** · case-authoring: `attestationsOf` through attestation (R35). · network-notices: `instanceStatement`, `instanceSign`, `instanceKeys`, `instanceKeyBound` through attestation (R1, R13, R21).
**L9** · filings: `attestationsOf` through attestation (R9).
**L11** (merge order: affordances, control-plane, then plane) · affordances: the new checks files and modules in `catalogue.test.mjs` and `backing.test.mjs`. · control-plane: C-34's and C-89's files in `families.mjs`; `record.mjs`'s ops. · plane: composes attestation and provenance-routes.

Not a job: record-core (N511, a fold); N514 (struck, K1197); N501 (met, K1199).

## Entries

- S2 · 2026-10-02 · **promotion**: stamp the rows T24's L3–L11 jobs add or change (each COMPLETE lists them; at T24's close these are C-18.16–.18, their `where` re-pointed to link-sweep, K1209, K1216), `ROW_CENSUS` re-pinned. **Hard reason:** promotion's one T24 job is L2 (P8, P10).
- N511 · 2026-10-02 · **record-core** (K1186; RECORD-CORE #15's record): R72 and R73 describe today's behaviour as "`store.mjs`' explicit arms" and "as `store.mjs`' `auditPass` gates it"; re-word to the module's own route map and gate (N469's rule), no change of meaning. **Hard reason:** record-core's one T24 job (L2) is merged (P8); BOB's wording, folded at T25's opening.
- N512 · 2026-10-02 · **provenance** (K1189; PROVENANCE #13's record): its paths hold 4,001 lines at T24's L3 merge, at `layers.md` ruling 1's ~4,000 mark (P6, K617): split before its next job, with no change of meaning, along K1193's seams (`plan/draft-T25-splits.md`): new modules `provenance-routes` (the chain and route marker) and `attestation` (timestamping, the instance key), both directly after provenance in layer 3; `modules.json`, `layers.md`, membership's `MODULE_ORDER` (R83, in L2) and every reader re-pointed. **Hard reason:** provenance's one T24 job is merged (P8); the split and its seams are prepared under P18 and run as T25's first provenance entry.
- N513 · 2026-10-02 · **extraction** (K1192; EXTRACTION #11's Size line, measured over `paths`): its paths hold 4,001 lines at T24's L4 merge, at `layers.md` ruling 1's ~4,000 mark (P6, K617): split before its next job, with no change of meaning, along K1193's seam (`plan/draft-T25-splits.md`): new module `reading-pipeline` (`pipeline.mjs`, `readingprov.mjs`) directly before extraction in layer 4; `modules.json`, `layers.md`, membership's `MODULE_ORDER` (R83, in L2) re-pointed. **Hard reason:** extraction's one T24 job is merged (P8); the split and its seams are prepared under P18 and run as T25's first extraction entry.
- N514 · 2026-10-02 · **inquiry-grammar** R7, **run-rules** R11, **strength** R15 (K1195; `scratchpad` audit of stamp notes): each still says its rows are `awaiting stamp`; re-word to the stamp that took them (inquiry-grammar 1.50.0, run-rules 1.49.0, strength C-107.3 1.53.0), no change of meaning (N469's rule). BOB's wording, applied at each module's T24 L6 merge; struck here when done. All three done (K1196, K1197): **struck**. **Hard reason:** each module's job is running (P10: BOB does not change requirements a running job reads mid-job for wording alone).
- N515 · 2026-10-02 · **capture-requests** (K1207; LINK-SWEEP #1 J3): `index.mjs`:387–394 says R45's scope check is "registered once at start by `monitoring`" and names the sweep's sources "monitoring R53"; since N506 they are link-sweep's (R12, R1); `test/m/capture-requests/sweep.test.mjs` registers under "monitoring": re-word and re-name to link-sweep, no change of meaning (N469's rule). **Hard reason:** capture-requests' one T24 job (L6) is merged (P8).


## Left out of T25 (one hard reason each; carried to `next.md`)

Every row of T24's table re-checked (K1216, `draft-T25.md`); none becomes an entry. Also: N516, provenance's deletion of the pure copies option B keeps: one job per module (P8), provenance's one T25 job is L3, before its importers. S3 (T25's L3–L11 rows): the order (P4).

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
| A54 | skills R10 | Bob's | N144 |
| B13 | N470 | Bob's | K943; DEC-116 answers it, off `main` (N491) |
| B6–B10, B12, B18, B20, C6, C7, D2, I2 | legacy-ui shares, UI fixtures, the module | Bob's (UX) | K633, K1006 |
| N487 | legacy-ui DEC-88 reasons | Bob's (UX) | K633, K1030 |
| J7 | DEC-81's Grade A | Bob's | K1019: "nothing new" |
| H13 | DEC-105 audience guidance | Bob's | waits for its trigger |
| C5 | `PLN-` affordances, plan page, joint action | Bob's | K608 (4), K600 (c) |
| H5 | DEC-100 | Bob's | awaits Bob; DEC-116 (N491) off `main` |
| H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11 | DEC screens of the new interface | Bob's (UX) | K633, K899 (2) |
| N481 | DEC-112 published case in three forms | Bob's | on `main` (PR #7); K1134 Q2, Q3, Q6 unanswered |
| N488 | DEC-113 litigation hold of transcripts | Bob's | on `main` (PR #7); K1134 Q4, Q5 unanswered |
| N491 | DEC-116 withdrawal, docket | Bob's | on `main` (PR #7); K1134 Q1 unanswered (its home) |
| H1, H6b, J4 | DEC-96, DEC-101 (3), DEC-92 | dependency not yet built | nothing brings another group's edition into this copy |
| A8 | bias R26 | dependency not yet built | K102's trigger |
| A21 | inquiry R31 | dependency not yet built | no opinion element (MK-5) |
| A22, A23 | installer R13, R24 | dependency not yet built | the new member surfaces |
| A37 | progressions R32 | dependency not yet built | no amounts or funds as values |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |
| N493 (part) | member-facing translations of "noticed" (contradiction `checks.mjs`:136, :236; queue `checks.mjs`:63) | Bob's: UX (the design stream's DECs decide member-facing wording) | by BOB #93, K1099 |
