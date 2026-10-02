# Plan T26

**Status** · OPEN · BOB #102 · session_019EG7uFMTRzUH2vnxRBoDoW · depth 1

**Jobs** · 

**Opened** 2026-10-02 ~21:05 UTC by BOB #102 from `main` @ 652b3f2f10 (T25 closed, K1245), from T25's `next.md` (K1246). **Bob's weekly meter** · asked at the opening; 61% at T23's close, unanswered at T24's and T25's.

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T26 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633; manifest "Parallel work"). Its shares wait on the UX stream: N487 and the left-out table's legacy-ui rows. |

No other module is marked `legacy`; no extraction is open.

## Rules at the opening

T25's rules hold (merge early; one file, one editor; marks struck at the merge; no layer closes red except by name; owners export, the plane composes; the UX stream's DECs cited, never minted; a job re-scans its own module for the N502/N508 kind and re-words what it finds).

**Accepted reds, by name, at the opening:**
1. `bio-plane/test/system/row-census.test.mjs`: C-34.* and C-89.* `awaiting stamp` (T25's red 6), until promotion's L2 merge (S3).
2. The UI's DEC-88 tests (N487, K1030): stay red, Bob's.
3. `test/m/attestation/invariants.test.mjs` R9 fails intermittently (T25's red 11; its place probe matches `ca` inside a fresh base64 signature), until attestation's L3 merge (N517). A job's proof run may re-run it once.

## Roster (by layer; 3 jobs)

**L2** · promotion: S3.
**L3** (no merge order: disjoint files, no edge between the two entries) · provenance: N516. · attestation: N517.

## Entries

- S3 · 2026-10-02 · **promotion**: stamp the rows T25's L3–L11 jobs added or changed: C-34.* (provenance-routes' route rows, `where` re-pointed) and C-89.* (attestation's rows, `where` re-pointed), as the T25 records of provenance, provenance-routes and attestation name them; `CATALOG_VERSION` 1.55.0 → 1.56.0 (MINOR, as S1, S2); `ROW_CENSUS` re-pinned (R50) with its fixture. **Why now:** promotion's one T25 job was L2, before the rows moved (P8, P10).
- N516 · 2026-10-02 · **provenance** (K1218, K1220, option B): delete the pure copies it kept in T25 for later importers (`routeFinding`, `instanceStatement`, `attest`, `attestOp`; K1225, K1226, K1228). Every importer re-pointed in T25 (retrieval L5, network-notices L8, plane L11, acquisition and capture L3); at the opening no file outside provenance imports any of them (BOB's grep, K1246). Drop `signatures` from its `uses` if nothing else in the module needs it. **Why now:** its importers re-pointed in T25 after provenance's one job (P8, P10).
- N517 · 2026-10-02 · **attestation** (K1234; EXTRACTION #12 J2): `test/m/attestation/invariants.test.mjs` R9's place probe (`/…|\bca\b|…/i`) runs over JSON holding fresh base64 signatures, so `\bca\b` matches a signature like `+ca/` about once in a few runs: strip signatures and keys before probing, or probe only the sentences (a test flaw, no change to R9). **Why now:** attestation's one T25 job (L3) was merged before the flake was found (P8).

## Watched for size (P6, `layers.md` ruling 1, K617)

No T26 job touches these; each is measured again before its next job: publication (4,354 at T24's job, K1024 corrected an earlier over-count; re-measure over its own paths), ratification (3,973 at T24), inquiry (3,882 at T23).

## Left out of T26 (one hard reason each; carried to `next.md`)

Every row of T25's table re-checked at T25's close (K1245); none becomes an entry: no deployment, measurement, dependency or ruling of Bob's it waits on has arrived.


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
