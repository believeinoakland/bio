# retrieval (T25)

**Status** · session_01Rg1wTDnZPBLyb87zvpKsZk · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T25 L5, retrieval: N512's user side. `routeFinding` is imported from `bio-plane/src/provenance-routes/` (its R5), no longer from provenance's pure copy (N516 may delete it once this merges); R63's one LEFT JOIN on `provenance_route_marks`' standing mark is unchanged and its comments now name provenance-routes R8's read contract. `test/m/retrieval/roster.test.mjs`:9 re-points; the fixture builds `provenanceRoutesOf` after provenance and migrates it (it owns the table). New R63 test against the real module: a mark appended by `provenanceRouteAssess` is the route `listBundles` answers, for three viewers and in the paged arm, with negative controls in the test (the superseded mark, another bundle's mark, an unknown finding). **Negative control by mutation** (run, then reverted): reading `MIN(seq)` instead of `MAX(seq)`, and passing a null mark to `routeFinding`, each turn both R63 route tests red (8 pass, 2 fail). Deferred: none.

**N502/N508 re-scan** of my paths and tests: nothing stale. `checks.mjs`:2 and `index.mjs`:181 are past-tense history; `retrievalRoutes`' comment (`index.mjs`:1286) names the plane store, which spreads it today (`plane/store.mjs`:312). No catalogue row added or changed (nothing for red 6).

**Found in other modules / artifacts:**
- **plane (red 9):** `plane/store.mjs` builds no provenance-routes and migrates no `provenance_route_marks`, so `op=list` through the plane store fails `STORE_INTERNAL_ERROR` "no such table: provenance_route_marks" (seen in promotion `write-path.test.mjs`:218, R53). Already red on `tranche/T25` before this job (same failure on the base); it goes green when plane composes provenance-routes (L11).
- **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) takes `src/retrieval/index.mjs` as an input, so this change stales it; `test/system/fleetbundles.test.mjs` reports bio-plane stale (D-298 arm, byte identity, manifest sha). Not regenerated (manifest §14); for BOB's layer-close rebuild.

**Tests and checks** (on `job/T25/retrieval` @ 5571a83555):
- `node --test bio-plane/test/m/retrieval/`: 123 tests, 123 pass, 0 fail (before the change: roster's 10 tests failed "no such table: provenance_route_marks").
- whole `bio-plane/test/m`: 5330 tests, 5244 pass, 75 fail, none in retrieval, every one among the accepted reds and each also failing on `origin/tranche/T25` without this change (checked file by file): case-authoring `preflight` (13), filings `outward`/`packet` (3), network-notices `activity`/`post`/`prepare`/`reads`/`seals` (54), scheduler `consumers`:198 (NOTICE_NO_INSTANCE_KEY), affordances `sources`:117 (reattest through provenance's `attest`): red 7; control-plane `families`:47 (attestation's and provenance-routes' files), `catalogue-end`:15 (CAPTURE_HELD_IN_PARTS): red 8; promotion `write-path`:218: red 9 (above).
- `test/system/fleetbundles.test.mjs`: bio-plane stale (above); the other members pass.
- `node checks/format.mjs`: 91 modules, 0 failures. `architecture.mjs … retrieval`: 0 failures. `coverage.mjs … retrieval`: 67 of 67 live ids named, 0 failures. `ownership.mjs … retrieval tranche/T25`: 4 files, 0 failures.

Size (session_01Rg1wTDnZPBLyb87zvpKsZk): test runs 14, module lines 2347

## J1 · COMPLETE

Done (record "Completion"): routeFinding imported from provenance-routes (R5); R63's join reads provenance_route_marks under provenance-routes R8; fixture migrates provenance-routes; R63 test against the real provenanceRouteAssess with negative controls (and a mutation control, both red then reverted). retrieval tests 123/123; whole test/m 5330, 75 fail, none in retrieval, all reds 7/8/9 and all red on the base too. Checks: format, architecture, coverage (67/67), ownership all 0. No row added. Reported: plane store composes no provenance-routes, so op=list through the plane fails 'no such table' (red 9, promotion write-path:218); bio-plane bundle staled by src/retrieval/index.mjs (not regenerated). R63's 'not yet met: T25' mark is yours to strike at the merge.
