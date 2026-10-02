# Plan draft: T25

**Status** · DRAFT by a worker for BOB #100, not reviewed. 2026-10-02, from `tranche/T24` @ fed148dfef (K1205), while T24's L10 runs (P18). Inputs: `next.md` (S2, N511–N514), `current.md`'s left-out table and N501, `draft-T25-splits.md` as reviewed (K1193), `modules.json`, `layers.md`, rulings K1150–K1205. Re-checked at T24's close against L10's and L11's COMPLETEs, then written as `next.md` → `current.md` (§5.2).

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T25 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633; manifest "Parallel work"). Its shares wait on the UX stream: N487, the left-out table's legacy-ui rows. |

No other module is marked `legacy`; no extraction is open.

## Folds at the opening (BOB, on the tranche branch; not done here)

1. **N512** (K1193): `requirements/provenance-routes.md` (R1–R13 = provenance R19–R23, R54, R36, R48's last sentence, R53's three route arms, R55's `routeMarks`, R37's route clause, R41's `provenance_route_marks`, R40 as a copy; C-34.1–.4) and `requirements/attestation.md` (R1–R9 = provenance R31–R34, R56, R57 as met, R49, R39, R40 as a copy; R10 new wording: owns `receipt_keys`, `signed_receipts`; C-89), each Status naming N512, the old → new map and "no change of meaning"; provenance retires R19–R23, R31–R34, R36, R39, R49, R54, R56, R57 (never reused) and re-words R37, R41, R48, R53 (six ops), R55. Users' requirements re-pointed, marked `*(not yet met: T25)*` where their code changes: retrieval R63, record-core R68, acquisition, capture, case-authoring R35, filings R9, network-notices R1, R13, R21, affordances.
2. **N513** (K1193, E-1 only): `requirements/reading-pipeline.md` (R1–R19 = extraction R2–R17, R60, R25, R26; R20–R22 copies of R44, R45, R50); extraction retires R2–R17, R25, R26, R60, keeps R1, R18, and R31–R35 cite the new ids; `observation-log.md`:76 and `calibration.md` "Where it runs" re-worded (no job runs them).
3. **`modules.json`**: `attestation` and `provenance-routes` directly after provenance in layer 3 (provenance, attestation, provenance-routes, capture-sources); `reading-pipeline` directly before extraction in layer 4 (calibration, reading-pipeline, extraction); `paths`, `tests`, `uses` per the splits draft, filled before any ownership check (K1153); provenance's and extraction's `paths`/`tests` trimmed (extraction drops `src/readingprov.mjs` and the six moved test paths); edges gained: retrieval, plane, control-plane → provenance-routes; acquisition, capture, case-authoring, filings, network-notices, plane, control-plane → attestation; extraction → reading-pipeline. A Status AMENDED line.
4. **`layers.md`**: an AMENDED line (K617, K1193) and the L3, L4 rows. `layers-view.html` stays as K1181 left it (no generator).
5. **N511**: record-core R72, R73 re-worded to its own route map and gate (no change of meaning).
6. **BOB's decisions owed before the STARTs (P17)**: attestation R10's wording; C-103.6/.7 stay in provenance's `PROVENANCE_ACT_CHECKS`, attestation imports them (splits draft's proposal); `CAPTURE_TEXT_UNIT_CAP` stays re-exported by extraction (proposal) or two src lines and three tests re-point; the later-layer window of the provenance split (Worker notes, 1).
7. At T24's close: each L10/L11 COMPLETE's deferrals added to the roster; S2's row list from every T24 L3–L11 COMPLETE.

## Rules at the opening

T24's rules hold (merge early; one file, one editor; marks struck at the merge; no layer closes red except by name; owners export, the plane composes; the UX stream's DECs cited, never minted; a job re-scans its module for the N502/N508 kind). A split's new module owns its moved files from the opening (their `paths` move in fold 3); the source module's job only deletes them from its own paths (T24 L10's pattern). A row a T25 job adds or changes after L2's stamp is `awaiting stamp` until T26's L2 (S3) and listed in its COMPLETE.

**Accepted reds, by name, at the opening:**
1. `row-census.test.mjs`: T24's L3–L11 rows `awaiting stamp` (T24's red 5), until promotion's L2 merge (S2). Absent if T24's COMPLETEs list none.
2. The UI's DEC-88 tests (N487, K1030): Bob's.
3. Coverage: each id folded at the opening (provenance-routes R1–R13, attestation R1–R10, reading-pipeline R1–R22, the users' marked ids), until its module's merge.
4. Format: the three new modules' `paths` and `tests` directories absent until their merges.
5. membership's R83 test and promotion's `registry.test.mjs`:58: `MODULE_ORDER` lacks the three new modules, from fold 3 until membership's L2 merge (K1185's precedent).
6. Rows T25's L3–L11 jobs add or change (C-34.1–.4 and C-89.* `where` re-pointed; the census pins `where`): `awaiting stamp` until T26's L2 (S3).
7. The provenance split's users, from provenance's L3 merge until each user's merge: retrieval (L5: `routeFinding` import), network-notices (L8: `instanceStatement` import; `instanceSign`, `instanceKeys`, `instanceKeyBound` calls), case-authoring (L8) and filings (L9: `attestationsOf`), their fixtures. Scope depends on decision 6 (Worker notes, 1).
8. `CHECK_FAMILIES` (control-plane `families.mjs`:19, :82) and affordances' `catalogue.test.mjs`:958 lack C-34 and C-89, from provenance's L3 merge until control-plane's and affordances' L11 merges.
9. The plane's composition: `provenancechain`, `provenanceroute`, `provenanceroutes`, `attest` and the receipt signing key (`plane/store.mjs`:20, :99, `door.mjs`:12), from provenance's L3 merge until plane's L11 merge.
10. Any T24 red still open at T24's close, by name.

## Roster (by layer; 16 jobs, plus T24 L10/L11 deferrals)

**L2** (merge order: membership, then promotion) · membership: R83, `MODULE_ORDER` equal to `modules.json` after fold 3. · promotion: S2, the stamp 1.54.0 → 1.55.0 over T24's L3–L11 rows (each COMPLETE's list), `ROW_CENSUS` re-pinned, its fixture.
**L3** (merge order: provenance, then attestation and provenance-routes, then acquisition and capture) · provenance: N512's removal side (deletes the moved ranges of `index.mjs`, `checks.mjs`, `schema.mjs`, `ops.mjs` and the moved tests; keeps C-103, `homeOf`, R48's register contract and anything decision 6 holds over). · attestation: N512, the new module from the moved code and tests (`attest.test.mjs`, `instance-key.test.mjs`, `ops.test.mjs` 53–98), C-89, its tables, `attestOp`. · provenance-routes: N512, the new module (`chain-route.test.mjs`, `convert-chain-marker.test.mjs`, the R54/R55/R48 cases of `audit-figures.test.mjs`, `ops.test.mjs`:154), C-34, `provenance_route_marks`, `provenanceRouteOps`; `op=stats`' order pinned. · acquisition: `attest` and `signReceipt` through attestation (`index.mjs`:30, :1025), its fixture. · capture: `attest` through attestation (`index.mjs`:28, :979).
**L4** (merge order: reading-pipeline, then extraction) · reading-pipeline: N513, the new module from `extraction/pipeline.mjs` and `readingprov.mjs` and the moved tests (`read.test.mjs`, `convert-ocr`, `staffdirectory`, `convert-tiers`, `rules.test.mjs` 18–54, the six legacy-path tests), its own small fixture. · extraction: N513's removal side, `index.mjs`:24, :30 re-pointed, mixed tests split case by case, `uses` measured (`pdf-worker` likely dropped).
**L5** · retrieval: `routeFinding` and R63's join through provenance-routes (`index.mjs`:24, `roster.test.mjs`:9), its fixture migrates the new module.
**L8** · case-authoring: `attestationsOf` through attestation (`index.mjs`:1145, R35). · network-notices: `instanceStatement`, `instanceSign`, `instanceKeys`, `instanceKeyBound` through attestation (R1, R13, R21; `activity.test.mjs`:9 and its fixture).
**L9** · filings: `attestationsOf` through attestation (`index.mjs`:897, R9), its fixture.
**L11** (merge order: affordances, control-plane, then plane) · affordances: `catalogue.test.mjs`:958 and `backing.test.mjs` read the new checks files and migrate the new modules. · control-plane: `families.mjs` gains C-34's and C-89's files; `record.mjs`:17's ops spread. · plane: composes attestation (`attestationOf`, `signingKey` from `plane/store.mjs`:99) and provenance-routes (`provenanceRouteOps` beside `provenanceOps`), `door.mjs`:12's `attestOp`, `maps.mjs`:15.

Not a job: record-core (N511, a fold); N514 (struck, K1197); **N501** (met in T24: PUBLICATION #14 retired the re-exports, K1199; queue-producers imports `exportLog` and `EXPORT_LOG_LIMIT_DEFAULT` from corpus-export, `queue-producers/index.mjs`:42, since K1170).

## Left out of T25 (re-checked 2026-10-02; one hard reason each)

Every row of T24's table still holds; none becomes an entry.

| row | item | hard reason | still holds because |
|---|---|---|---|
| B1, B2, B3, B11/C9, B16, C1, C2, C3 | DIST-14, N75, N34, N461/N471 release, N473, office-readers R28/R29, `MODES.plan`, newgroup installer/N336 | deployment | no deployment or signed release since T23 (K1176–K1205 record only bundle regeneration); B3 also pdf-worker's 4,277 lines (P6) |
| C4, A11–A17 | contradiction R24, R27, R32, R33/R36 K5 arms, R34, R41, R57 | measurement | `contradiction.md`:56, :88, :140, :146, :182 still "no measured recommender run, K488" |
| C8 | first profile's facts without a source | measurement | K925, K934, K941; nothing measured since |
| N481, N488, N491 | DEC-112, DEC-113, DEC-116 | Bob's | PR #7 is on `main` (K1177), so the "off `main`" half is gone; K1134 Q1–Q6 still unanswered (K1203) |
| B13, H5 | N470, DEC-100 | Bob's | answered by DEC-116 (N491), out above |
| B4, B5, A54, B6–B10, B12, B18, B20, C6, C7, D2, I2, N487, H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11, N493 (part) | legacy-ui shares, UI fixtures, DEC screens, member-facing wording | Bob's (UX) | K633, K899 (2), K1006, K1030, K1099; no UX DEC on `main` since PR #7 settles them |
| J7, H13, C5 | DEC-81 Grade A, DEC-105 guidance, `PLN-` affordances | Bob's | K1019, its trigger, K608 (4)/K600 (c); no new answer |
| H1, H6b, J4 | DEC-96, DEC-101 (3), DEC-92 | dependency not yet built | nothing brings another group's edition into this copy; DEC-112's import (N481) would, and is Bob's |
| A8 | bias R26 | dependency not yet built | `bias.md`:55, K102's trigger |
| A21 | inquiry R31 | dependency not yet built | `inquiry.md`:138, MK-5 |
| A22, A23 | installer R13, R24 | dependency not yet built | `installer.md`:42, :58 |
| A37 | progressions R32 | dependency not yet built | `progressions.md`:98 |
| A41 | publication R30 | dependency not yet built | `publication.md`:118, D-246; still a todo at PUBLICATION #14 (K1199) |
| S3 | T25's own L3–L11 rows | the order (P4) | promotion's one T25 job is L2 (P8, P10) |
| N512's holdovers (if decision 6 keeps any) | provenance deletes what later users imported | one job per module (P8) | provenance's one T25 job is L3; deleted at its T26 job |

## Worker notes for BOB

1. **The provenance split's later-layer window.** Unlike link-sweep (users one layer up), the moved names are reached from L3 to L11: by import, `routeFinding` (retrieval, L5), `instanceStatement` (network-notices, L8), `attestOp` and `provenanceOps`' arms (plane, L11), the checks files (control-plane, L11); by method, `attestationsOf` (case-authoring L8, filings L9), `instanceSign`/`instanceKeys`/`instanceKeyBound` (network-notices), `cap.provenance.signReceipt` (acquisition). A missing named export fails at load, so retrieval's import alone would red every module importing retrieval from L3 to L5, and network-notices' would red the plane's composition to L8. Options: (A) delete at L3, accept red 7 as listed (large); (B) K649/K651's copy-then-delete: provenance keeps the pure exported names later modules import (`routeFinding`, `instanceStatement`, `attestOp` with what it calls) until those importers re-point, deleted in provenance's T26 job; stateful methods writing attestation's tables cannot stay without two owners of one table, so their callers' reds stand. Not decided here.
2. **L3 merge order.** Drafted source-first as T24 L10. If attestation or provenance-routes needs nothing new exported from provenance, the two new modules may merge first (inert until composed); either way acquisition and capture merge last.
3. **S2 may be empty.** K1188–K1204 record no new rows from T24's L3–L9 jobs; S2's content depends on L10/L11 (link-sweep's moved C-18 rows if their `where` changed; any new rows). If empty, promotion has no T25 job and red 5's L2 dependency is membership alone.
4. **Version number** 1.55.0 for S2 is assumed (MINOR, as S1).
5. **Ratification** measures 3,973 lines (K1201) and has no T25 job; nothing to plan unless a T24 deferral gives it one.
6. **attestation R10 wording** and the R36/R46 confirmations (splits draft) are BOB's/the jobs'; listed in fold 6, not drafted.
7. **N501** needs no entry; `current.md`'s hard reason (queue-producers' T23 L11 job) was cleared by K1170, and the entry was met by K1199.

## BOB #100's review (2026-10-02)

Reviewed; adopted as the T25 draft with these decisions, to be ruled at T25's opening (§5.2) with the plan:
1. Open point 1: **option B** (K651's pattern). Provenance's L3 job keeps every name a later layer imports (`routeFinding`, `instanceStatement`, `attestOp`, `provenanceOps`' arms, the checks files) until its importer re-points; each importer that has a T25 job re-points in it (retrieval L5, network-notices L8, control-plane and plane L11); T26 carries provenance's deletion of the kept names. Reason: option A would leave importers unloadable from L3 to L11, so every job in L4–L10 would run its layer against red it cannot judge; the safeguard stands over speed (P19).
2. Open point 2: provenance first in L3, as drafted (the new modules are later in the order and test against provenance's narrowed public part).
3. Open points 3–4: S2 is read from the T24 COMPLETEs at the close; stamp version fixed then.
4. Open point 5: BOB's wording, done in the opening's folds.
