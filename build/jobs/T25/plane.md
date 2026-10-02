# plane (T25)

**Status** · session_01G6d3LzEEHyaJZdkY3r73gm · depth 2 · RUNNING until 2026-10-02T21:00:38Z (node --test test/m (whole)) · handled B1

## Completion (PLANE #16)

**Entries applied** (`build/plan/current.md` T25 L11, plane: N512's composition; BOB's B1):
- **attestation composed (R2, R3).** `src/plane/store.mjs` builds `attestationOf(ctx, {provenance, signingKey: env.RECEIPT_SIGNING_KEY ?? null, instanceName})` directly after provenance, before any module can reach it, so the one instance holds the deployment's key. provenance is now built bare (`provenanceOf(ctx)`): it no longer takes the key or the name.
  - That one instance is handed to capture (`captureOf(ctx, {env, attestation})`, which acquisition reaches as `cap.attestation`), case-authoring (`{attestation}`), filings (`attestation` beside its other deps) and network-notices (`{env, attestation}`).
  - `#migrate` runs `attestationOf(ctx).migrate()` after provenance's.
- **provenance-routes composed (R2, R3, R5).** `provenanceRoutesOf(ctx, {instanceName})` is built at start, after attestation, so its audit finding `route` and its figure `routeMarks` are registered before the first request. `#migrate` runs its `migrate()`. The route map spreads `provenanceRouteOps(provenanceRoutesOf(ctx), url, body)` right after `provenanceOps`, at the place provenance's map held the three arms, so the order of the ops is unchanged.
- **Door (R6).** `src/plane/door.mjs` takes `attestOp` from `attestation`. `registerAuditOp` stays provenance's.
- **Test world.** `test/m/plane/maps.mjs` adds provenance-routes' map after provenance's. The plane fixture builds the real Store, so both new modules are built and migrated there.
- **Red 9 cleared.** `promotion/write-path.test.mjs`:218 "R53 (N426)", which FILINGS #12 read as red 9, now passes.
- **Re-scan (N502/N508 kind).** No stale note was found in plane. The remaining mentions of `legacy-store` and `src/index.mjs` (`store.mjs`:71, `door.mjs`:2, `stats.test.mjs`:3, :20, `step.test.mjs`:3, `store.test.mjs`:84, `worker.test.mjs`:96) are past-tense history or R8's probe of retired files.

**Rows changed:** none. No refusal code, check, translation or `where` moved, so this job adds no row under red 6.

**Deferred:** none.

**Found elsewhere (REPORT J1):**
- **Stale bundle.** The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from `src/plane/store.mjs` and `src/plane/door.mjs`, as well as from earlier T25 merges. I regenerated nothing.
- **`affordances/sources.test.mjs`:117** "R2: reattest … through provenance's attest" fails because its stand-in sets `c.provenance` with an `attest`. Capture's `reattest` now asks `attestation`, since capture's L3 move. The test does not reach the plane. This is affordances' test (L11, running); it is not in the accepted list by name.
- **Minor.** plane's Uses (`build/requirements/plane.md`) names attestation and provenance-routes only through its catch-all line. You may want to name them, with R2's key hand-off.

**Tests and checks:**
- **New tests,** in `test/m/plane/split.test.mjs`:
  - R2: the deployment's key is bound, and capture, case-authoring, filings and network-notices hold the plane's one attestation instance. A receipt signed through `cap.attestation` names the instance and verifies.
  - R2: with no key, `instanceKeyBound` is false and a receipt answers `RECEIPT_NO_KEY`.
  - R2, R3: the three tables exist; `routeMarks` is in `op=stats` after `register`; the audit carries `route`, and that finding is registered once.
  - R5: the three route arms answer what provenance-routes' services answer.
  - R6: the door's `attest` gives 405 for a GET, refuses when there is no evidence store, and answers `BAD_SHA` with 400 and its stamps.
- `node --test bio-plane/test/m/plane/`: tests 55, pass 55, fail 0 (before the change: 50 of 50).
- `node --test bio-plane/test/system/migrate-released.test.mjs`: tests 1, pass 1, fail 0.
- **The whole `bio-plane/test/m`:** tests 5338, pass 5324, fail 3. FILINGS #12 recorded 4 failures before this change. The 3 that remain do not reach the plane:
  - `control-plane/catalogue-end.test.mjs` "R43, R22" and `control-plane/families.test.mjs` "R22 … CHECK_FAMILIES is total": red 8.
  - `affordances/sources.test.mjs`:117: see above.
  - Red 2 (the UI's DEC-88 tests) is outside `test/m`.
- `fleetbundles.test.mjs`: fails only on the bio-plane member's staleness (above); agent-worker, ocr-worker and pdf-worker pass.
- `format`: 91 modules, 90 requirements files; 0 failures.
- `architecture plane`: 22 product files, 205 relative imports; 0 failures.
- `coverage plane`: 13 of 13 live requirement ids named by a test; 0 failures.
- `ownership plane tranche/T25`: 5 files changed; 0 failures.

Size (session_01G6d3LzEEHyaJZdkY3r73gm): test runs 7, module lines 703

## J1 · REPORT

Stale: the plane bundle (bio-plane/dist/bio-plane.bundled.mjs) from src/plane/store.mjs and src/plane/door.mjs (and earlier T25 merges); I regenerated nothing. affordances/sources.test.mjs:117 'R2: reattest … through provenance's attest' fails: its stand-in sets c.provenance.attest, but capture's reattest asks attestation since capture's L3 move; it does not reach the plane and is not an accepted red by name (affordances' L11 job). Minor: plane's Uses names attestation and provenance-routes only through its catch-all line.
