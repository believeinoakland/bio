# provenance (T25)

**Status** · session_015S38x6eWCQ3i11cv9DGEP2 · depth 2 · RUNNING until 2026-10-02T18:30:16Z (node --test test/m/ (whole suite, per-test timeout 60s)) · handled B6

## Completion

**Entries applied** (BOB's B1, with B2 K1225, B3 K1226, B4 K1227, B6 K1228):
- **N512's removal side.** Deleted from `bio-plane/src/provenance/` everything that moved. To `provenance-routes`: `chainFromEvidence`, `OBSERVATION_MEANS`, `ROUTE_MARK_NOTE` (export), `ROUTE_FINDING_KEY`, `ROUTE_TALLY_*`, `ROUTE_MARKED_*`, `rowUnlessStated`, `provenanceChainRebuild`, `#latestRouteMark`, `routeOf`, `routeTally`, `provenanceRouteAssess`, `provenanceRoutesMarked`, C-34 `ROUTE_MARK_CHECKS`, `provenance_route_marks` with its index and DDL, the `provenancechain`/`provenanceroute`/`provenanceroutes` arms, the audit's `route` finding registration and the `routeMarks` figure. To `attestation`: `attestStatus` (export), `RECEIPT_KIND`/`STATEMENT_KIND` (exports), `noKey`, `attestationsOf`, `receiptStatement`, `#key`, `#signWith`, `signReceipt`, `instanceSign`, `instanceKeyBound`, `instanceKeys`, `signedReceipts`, the `signingKey` and `instanceName` options, C-89 `ATTEST_CHECKS`, `receipt_keys` and `signed_receipts`. Also gone: their purge declarations and their entries in `PROVENANCE_TABLES` (now `register`, `captured_locators`, `origin_declarations`). This module creates, declares and writes none of the moved tables, so each table has one writer.
- **Copies kept (N516; deleted by this module's T26 job), each under an N516 comment, none reading or writing a table:** `routeFinding` (retrieval, L5) and `instanceStatement` (network-notices, L8), both pure; `attest` (acquisition and capture, L3; K1226), stateless over its caller's callbacks, keeping C-89.1's check and words privately so no second C-89 family is exported; `attestOp` in `ops.mjs` (plane `door.mjs`, L11; K1228) with a private `attestStatus`. Not kept (K1225): `ROUTE_MARK_CHECKS`, `ATTEST_CHECKS`.
- **R58.** `PROVENANCE_ACT_CHECKS` is exported with its codes, numbers and translations unchanged. Re-pointed `where`s: C-103.6 and C-103.7 → `src/attestation/index.mjs signReceipt`; C-103.3 → `src/provenance/index.mjs declareOrigin > is-origin-act; src/provenance-routes/index.mjs provenanceChainRebuild` (K1227). The C-103 header states the seam. `DOORBELL_ORIGIN`, `homeOf`, R48's contract, `ARCHIVE_CAPTURE_GRADE`, `ARCHIVE_VIA` and `DOORBELL_VIA` are kept.
- **R53** is six ops; **R55** is `register` only; **R37**, **R41** and **R48** as re-worded.
- **Rows changed (red 6, `awaiting stamp` until T26's L2):** C-103.3, C-103.6 and C-103.7 (`where` only). C-34.1–.4 and C-89.1 left this module's file (K1225); their rows are now held by `provenance-routes` and `attestation`.
- **Re-scan for the N502/N508 kind:** nothing found. Every mention of the legacy store or legacy-index in my paths and tests is past-tense history. Comments naming moved work were re-worded (the module header, the evidence-store header, `registerHolds`' `op=attest` note, `ops.mjs`' and `schema.mjs`' headers, the C-103 header).

**Tests** (`bio-plane/test/m/provenance/`): deleted `chain-route.test.mjs`, `attest.test.mjs` and `instance-key.test.mjs`. Trimmed `convert-chain-marker.test.mjs` to its two R46 cases (C-18.9 stays here) and `audit-figures.test.mjs` to R55's `register` figure, adding an R41/R55 case that no `route` finding or `routeMarks` figure is registered here. `ops.test.mjs` asserts six arms, and the attest case became an N516 case for the `attestOp` copy. R37 (`audit.test.mjs`), R15 (`receipts.test.mjs`) and R40 (`testify.test.mjs`) dropped the moved services. In `register.test.mjs`, R41 asserts the three tables are neither created nor declared here. The fixture lost `signingKey` and `instanceName`. New `seam.test.mjs`: two R58 tests (rows, numbers, words and each `where`; this module raises its own rows and has no signing service) and one N516 test (the copies' behaviour, no table read or written, no C-34 or C-89 family exported, no stateful moved method kept).

**Runs and checks:**
- `node --test bio-plane/test/m/provenance/`: 89 tests, 89 pass, 0 fail.
- `node --test bio-plane/test/m/` (with `--test-timeout=120000`): 5258 tests, 5164 pass, **83 fail**, 0 cancelled. Baseline before the job: 0 fail. Every failure is a named red:
  - red 7: case-authoring `preflight` (13), filings `outward` (2) and `packet` (1) (`attestationsOf`); network-notices `activity`, `post`, `prepare`, `reads` and `seals` (54) and scheduler `consumers` (1, through network-notices' fixture), all `NOTICE_NO_INSTANCE_KEY` (no `signingKey`); retrieval `roster` (9) and `projection` (1) (`provenance_route_marks` no longer created by provenance's migrate).
  - red 9: promotion `write-path` (1). The plane's `op=list` hits `no such table: provenance_route_marks` until plane composes provenance-routes.
  - red 8: control-plane `catalogue-end` (1). `CAPTURE_HELD_IN_PARTS lost its row`; C-89 and C-34 leave `CHECK_FAMILIES` until control-plane's L11 merge.
- `bio-plane/test/mk6-bundle-names-no-author.test.mjs` (one of my `tests` paths): 1 test, 0 pass, **1 fail**. It passes on clean `tranche/T25`, checked in a worktree, so my change causes the failure. The cause is red 9: the test drives the plane, whose `op=list` (retrieval) hits `no such table: provenance_route_marks` until plane composes provenance-routes (L11). It is the only red under my `tests` paths. I did not add the table to the test, because that would put another module's DDL in my fixture. If you want it green before L11, the smallest fix is the plane migrating provenance-routes, at plane's job.
- `node checks/format.mjs`: 6 failures, all red 4 (the new modules' `paths` and `tests` directories). `architecture.mjs provenance`: 0 failures. `coverage.mjs provenance`: 43 of 43 live ids named, 0 failures. `ownership.mjs provenance tranche/T25`: 0 failures.

**Found in other modules (for BOB):**
- `build/modules.json`: provenance's `uses` still lists `signatures`. It is needed only while the `attest` copy imports `isPublicHttpsLocator` (record-grammar) and `tsa.mjs`; measure again in T26 when the copies go (N516).
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (owned by `not_product`) is stale from my change under `bio-plane/src/provenance/`. Not regenerated (manifest §14).
- Between the L3 merges and plane's L11, a deployed plane's `op=list` would fail on the missing `provenance_route_marks` table unless the plane composes provenance-routes' migrate. This is red 9 in the tests, and a deployment hazard if a build ships mid-tranche.

**Deferred:** none.

Size (session_015S38x6eWCQ3i11cv9DGEP2): test runs 16, module lines 2750

## J1 · QUESTION

**Option B and `attest`.** `acquisition/index.mjs`:30 and `capture/index.mjs`:28 import `attest` by name from provenance. With `attest` deleted (your START (2): it is not pure, since it fetches through an injected `fetch` and puts a token through an injected `put`, though it reads and writes no table), every module whose tests load capture or acquisition fails at import time: `test/m` goes from 0 fail to **520 fail** (497 files report `does not provide an export named 'attest'`), not only acquisition's and capture's own tests. That red lasts until acquisition's and capture's L3 merges.

**My reading, which I am following:** delete `attest` and `attestStatus` as your START says. The import red joins red 7 ("any user of a name moved"), and I list it in COMPLETE.

**The alternative, if you prefer it:** keep a stateless copy of `attest` (with its imports from `tsa.mjs` and `isPublicHttpsLocator`) under the N516 comment until acquisition and capture re-point. It writes no table, so the one-writer rule holds. All other moved names are already gone, and `routeFinding`, `instanceStatement`, `ROUTE_MARK_CHECKS` and `ATTEST_CHECKS` are kept as pure copies. Answer only if you want the alternative; until then I carry on with deletion.

## J2 · QUESTION

**B2–B4 applied** (7364e558fd): a stateless `attest` copy (K1226); no `ROUTE_MARK_CHECKS` or `ATTEST_CHECKS` copy (K1225); the three tables dropped from purge, `PROVENANCE_TABLES` and the schema; no `route` finding and no `routeMarks` figure registered; C-103.3's `where` names both sites (K1227).

**`attestOp`, the same case as J1.** `plane/door.mjs`:12 imports `attestOp` by name. With it deleted (red 9), the Worker cannot load, so `test/m/instance-setup/worker-page.test.mjs` and `worker-reports.test.mjs` **hang** instead of failing: `node --test test/m/` never finishes, even with `--test-timeout`. Any job's proof run would stall until plane's L11 merge.

**My reading, which I am following:** apply K1226's reason to it as well. I keep a stateless `attestOp` copy in `ops.mjs`, over the `attest` copy, with `attestStatus` private to it, under the N516 comment. It reads and writes no table. With it, both files pass (18/18). Answer only if you want it deleted instead; until then it stays, and I list it in COMPLETE.
