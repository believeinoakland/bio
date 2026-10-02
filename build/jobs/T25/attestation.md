# attestation (T25)

**Status** · session_01CCB76CKHZSXMLTrZc9xP3J · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · REPORT

REPORT (built against `tranche/T25`; nothing of another module edited). The module is built and pushed on `job/T25/attestation`: `bio-plane/src/attestation/` (`index.mjs`, `checks.mjs`, `schema.mjs`, `ops.mjs`) and `bio-plane/test/m/attestation/` (19 tests naming R1–R10; format, architecture, coverage 10/10 and ownership pass for attestation). I wait for your word that provenance has merged, then merge `tranche/T25` and finish.

1. **Factory reading.** START wrote `attestationOf(record, {signingKey, …})`; I built the others' pattern, `attestationOf(host, deps)`, deps `record`, `provenance` (each reached on the host unless given), `signingKey`, `instanceName`, `now`. Stateful services are instance methods (`attestationsOf`, `signReceipt`, `instanceSign`, `instanceKeys`, `instanceKeyBound`, `signedReceipts`, `instanceStatement`); pure exports `attest`, `attestStatus`, `instanceStatement`, `receiptStatement`, `RECEIPT_KIND`, `STATEMENT_KIND`, `ATTEST_CHECKS`, `attestOp`, `ATTESTATION_SCHEMA`/`_TABLES`/`_EXEMPT`, `migrateAttestation`, `Attestation`. Say if you want another signature; nothing outside my tests calls it yet.
2. **For provenance's L3 job (R10 hangs on it).** `record.declarePurge` refuses a table declared twice, all or nothing. Today provenance declares `signed_receipts` and `receipt_keys` (`provenance/index.mjs`:2727), so attestation's declaration is refused `TABLE_DECLARED … declaredBy: provenance` (kept as `attestation.purgeDeclared`): my one red, `invariants.test.mjs`:34 (R10), clears when provenance's removal merges. Provenance's job must drop both from its `declarePurge`, its `PROVENANCE_TABLES` (:48) and its schema; attestation creates them (`CREATE TABLE IF NOT EXISTS`, same columns). Construction order matters: attestation reaches provenance first, so a composition that builds attestation before provenance would make provenance's whole declaration refused; the plane's L11 job builds provenance first.
3. **C-103.6/.7 `where`** (provenance's file): today `src/provenance/index.mjs signReceipt`; after the move the site is `src/attestation/index.mjs signReceipt` (provenance's job re-points, per START (2)).
4. **Row census (a red not named in "Accepted reds"):** `test/system/row-census.test.mjs` reads `CENSUS MOVED: held 2 times, stamped 1: C-89.1` because option B keeps provenance's pure copy of `ATTEST_CHECKS` until T26 (N516) beside mine. Red 6 names C-89's `where` re-pointed; "held twice" until N516 is its consequence. Please name it (or rule it under red 6).
5. **Whole `bio-plane/test/m`** (my branch, `tranche/T25` @ its START): 5309 tests, 5296 pass, 2 fail: my R10 (item 2) and `control-plane/families.test.mjs`:47 (red 8, `src/attestation/checks.mjs` not in `CHECK_FAMILIES`). Nothing imports `src/attestation/` outside its tests, so no bundle is staled (`fleetbundles.test.mjs` 1 pass).

## Completion (ATTESTATION #1)

**Entries applied.** L3 attestation, N512 (K1193, K1218, K1220, K1225): the new module `bio-plane/src/attestation/` from provenance's moved code, no change of meaning. `index.mjs`: `attest`, `attestStatus` (R1–R3, R8), `RECEIPT_KIND`, `STATEMENT_KIND`, `instanceStatement`, `receiptStatement` (R4, R5), the class `Attestation` with `attestationsOf` (R7, over provenance's `homeOf` and record-core's `readFile`), `signReceipt`, `signedReceipts` (R4), `instanceStatement`, `instanceSign`, `instanceKeys` (R5), `instanceKeyBound` (R6), `migrate`; the factory `attestationOf(host, deps)` (deps `record`, `provenance`, `signingKey`, `instanceName`, `now`; K1225), which reaches provenance first, creates the tables and declares them to purge (`signed_receipts` keyed to no bundle, `receipt_keys` exempt; R10), its answer kept as `purgeDeclared`. `checks.mjs`: C-89 `ATTEST_CHECKS`. `schema.mjs`: `receipt_keys`, `signed_receipts` (same DDL, `CREATE TABLE IF NOT EXISTS`, no data migration), `ATTESTATION_TABLES`, `ATTESTATION_EXEMPT`, `migrateAttestation`. `ops.mjs`: `attestOp` for the plane (L11). C-103.6/.7 are imported from provenance's `PROVENANCE_ACT_CHECKS` (provenance R58). Private one-liners duplicated (record-grammar's `b64ToBytes` is not `atob`'s equivalent: it skips characters `atob` refuses, which R6's unreadable-key arm relies on). Tests moved to `bio-plane/test/m/attestation/` with their ids re-pointed (provenance R31–R34, R39, R49, R56, R57 → R1–R4, R8, R7, R5, R6), assertions unchanged, over a small fixture of my own; added: R1 over provenance's real `registerHolds`, R9 (`invariants.test.mjs`, with a negative control) and R10 (tables, purge declaration and its refusal to any other module, purge's two forms, and that provenance's write services and my reads write neither table).

**Stale-note rescan (N502/N508's kind).** None in the module; the one `awaiting stamp` note (`checks.mjs`:6) is C-89.1's, true (red 6).

**Rows awaiting stamp (red 6, until T26's L2).** C-89.1 CAPTURE_HELD_IN_PARTS: moved from `src/provenance/checks.mjs` to `src/attestation/checks.mjs` `ATTEST_CHECKS`, `where` re-pointed to `src/attestation/index.mjs attest > is-attest-parts`; code, number and translation unchanged. (C-103.6/.7's `where`, `src/attestation/index.mjs signReceipt`, were re-pointed in provenance's file by provenance's job.)

**Deferred.** None.

**Found in other modules** (J1; ruled K1225): provenance's purge declaration of my two tables (removed at its merge); C-103.6/.7's `where`; the census reading C-89.1 twice under option B (resolved: provenance keeps no copy). No bundle is staled: nothing outside my tests imports `src/attestation/`.

**Tests and checks** (on `job/T25/attestation` with `tranche/T25` @ 3f838afdea merged, after provenance's merge, K1229):
- `node --test bio-plane/test/m/attestation/`: 19 pass, 0 fail (R1–R10 each named).
- `node --test bio-plane/test/m/`: 5277 tests, 5182 pass, 84 fail, 11 todo; every fail a named red from provenance's merge, none importing this module: red 7 (network-notices 54, case-authoring 13, filings 3, scheduler `consumers.test.mjs`:198 through network-notices' fixture; retrieval 10 and promotion `write-path.test.mjs`:218 through the route split), red 8 (`control-plane/families.test.mjs`:47 and `catalogue-end.test.mjs`:15, C-89's file not in `CHECK_FAMILIES`).
- `node --test bio-plane/test/system/row-census.test.mjs`: 1 fail, red 6: C-89.1 "changed with no record" (held once), with provenance's and provenance-routes' rows (C-103.3/.6/.7 changed, C-34.1–.4 departed).
- `node checks/format.mjs`: 4 failures, all provenance-routes' and reading-pipeline's absent directories (red 4), none attestation's. `architecture.mjs … attestation`: 9 product files, 27 relative imports; 0 failures. `coverage.mjs … attestation`: 10 of 10; 0 failures. `ownership.mjs … attestation tranche/T25`: 10 files; 0 failures.

Size (session_01CCB76CKHZSXMLTrZc9xP3J): test runs 9, module lines 558

## J2 · COMPLETE

COMPLETE (B3). attestation built and run after provenance's merge (K1229; tranche/T25 merged into job/T25/attestation); the record's "Completion" section has the whole account.
- Tests: `test/m/attestation/` 19 pass, 0 fail (R1–R10). Whole `test/m`: 5277 tests, 5182 pass, 84 fail, every one a named red from provenance's merge, none importing this module: red 7 (network-notices 54, case-authoring 13, filings 3, scheduler consumers.test.mjs:198 via network-notices' fixture; retrieval 10 and promotion write-path.test.mjs:218 via the route split); red 8 (control-plane families.test.mjs:47, catalogue-end.test.mjs:15).
- One change after B3: R10's write test no longer drives provenance's route services (now provenance-routes', not a use of mine); it drives provenance's own write services only.
- Checks: format (4 failures, all red 4, none attestation's), architecture (9 files, 27 imports), coverage (10/10), ownership (10 files): 0 failures each for attestation.
- Row awaiting stamp (red 6): C-89.1 CAPTURE_HELD_IN_PARTS, `where` re-pointed to `src/attestation/index.mjs attest > is-attest-parts`; the census reads it held once, "changed with no record".
- No bundle staled. Deferred: none.
