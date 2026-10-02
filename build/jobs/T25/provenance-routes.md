# provenance-routes (T25)

**Status** · session_01JmVkWBZc9hpTWverdFG37a · depth 2 · WAITING ON BOB (J1) · handled B1

## Work (PROVENANCE-ROUTES #1)

**Entries.** N512 (provenance-routes side), from B1 START.

**Built** on `job/T25/provenance-routes` from `tranche/T25` (provenance not yet merged), the new module at its paths:
- `bio-plane/src/provenance-routes/index.mjs`: `OBSERVATION_MEANS`, `FINDING_MEANS` (now exported, frozen), `chainFromEvidence` (R1), `ROUTE_MARK_NOTE`, `routeFinding` (R5), `ROUTE_FINDING_KEY`, `ROUTE_TALLY_*`, `ROUTE_MARKED_*`, `rowUnlessStated`, and the class with `migrate`, `provenanceChainRebuild` (R2, R3), `routeOf`, `routeTally` (R6), `counts` (R10, `routeMarks` only), `provenanceRouteAssess` (R4), `provenanceRoutesMarked` (R5); factory `provenanceRoutesOf(host, deps)` (K61's per-host pattern, as `provenanceOf`; B1's "`provenanceRoutesOf(record, …)`" read as this), which declares `provenance_route_marks` to purge (R12), registers record-core's audit finding `route` (R6) and the figure `routeMarks` (R10), each under `provenance-routes`. Also exports `PROVENANCE_ROUTES_TABLES`, `PROVENANCE_ROUTES_MODULE`, `PROVENANCE_ROUTES_SCHEMA`, `ROUTE_MARK_CHECKS` and `provenanceRouteOps`.
- `checks.mjs`: C-34.1–C-34.4 `ROUTE_MARK_CHECKS`, rows unchanged but each `where` re-pointed to `src/provenance-routes/index.mjs provenanceRouteAssess > is-route-mark`. C-103.3 `NO_BUNDLE` is imported from provenance's `PROVENANCE_ACT_CHECKS` (R2), with `DOORBELL_ORIGIN` (R1).
- `schema.mjs`: `provenance_route_marks` and its index, `CREATE TABLE IF NOT EXISTS` under the same name, comments kept; `migrateProvenanceRoutes`.
- `ops.mjs`: `provenanceRouteOps(routes, url, body)` (R9), the three arms unchanged.
- Comments re-pointed to this module's ids (provenance R19–R23 → R1–R5, R54 → R6, R36 → R7).

**Flaws fixed in this module.** (1) `provenanceChainRebuild`'s applied answer read `promoted.sha`, a key `promote` never answers, so `sha` was always null; it is now the promoted `bundleSha` (no reader of `sha` found in src or the UI). (2) C-34.1's row comment said the row does "not refuse a MACHINE principal"; REC-158 widened it (R4, as R3), and the comment now says so (no row field changed).

**Re-scan (N502/N508 kind, N469's rule).** Every mention of the legacy store, `store.mjs`, `query.mjs` or the retired suites in the module is past tense or names them retired; no `awaiting stamp` text. Nothing to re-word.

**R7 (splits draft's question).** Confirmed: only R2 writes hops, so provenance R36 moved whole as R7. Provenance's C-18.9 arm (its R46) judges a recorded chain at the gate and writes no hop, so it does not need R7's words. Of `convert-chain-marker.test.mjs`, the two pure R46 cases (C-18.9's findings over `registerChecks`) stay provenance's; its R41 purge case moved here as R12; its R19/R20 C-18.9-clean case moved as R2 (it calls provenance's exported `registerChecks`).

**Tests** (`bio-plane/test/m/provenance-routes/`, renamed to this module's ids, with a fixture of its own that composes provenance only when asked): `chain` (R1, R7), `rebuild` (R1, R2, R3, R4), `assess` (R4, R5, R11), `marked` (R5), `audit` (R6), `table` (R8, R10, R12), `ops` (R9), `invariants` (R13), `composition` (R6, R10, R12 with provenance composed first). Added beyond the moved assertions: a promotion's refusal returned as it came (a registered refusing step, with its negative control); R3 reads nothing for a refused author; R5's incomplete census and a project-fenced bundle withheld from page and census, cursor advancing past a withheld page; R12's one-writer instrument and the other module's declaration refused; R9's body never read.

**Deferred.** None in this module.

## J1 · REPORT

Built and pushed (`job/T25/provenance-routes` @ 180be8bd95; record "Work" section): the module at its paths (index, checks C-34 with `where` re-pointed, schema `provenance_route_marks`, ops `provenanceRouteOps`), factory `provenanceRoutesOf(host, deps)` registering `route`, `routeMarks` and the table's purge under `provenance-routes`; tests R1–R13 under `test/m/provenance-routes/` (37). Coverage 13/13, architecture 0, ownership 0, format: only attestation's and reading-pipeline's dirs (red 4).

**Waiting on provenance's merge.** 36/37 green; the one red is `composition.test.mjs` (R6, R10, R12 with provenance composed first): today's provenance still registers `route`, `routeMarks` and declares `provenance_route_marks`, so mine are refused. It goes green when provenance's L3 job drops those three registrations (K1220). Then I merge `tranche/T25`, re-run and post COMPLETE.

Found elsewhere (each against its owner):
- provenance: drop the three registrations above; its pure copy of `ROUTE_MARK_CHECKS` (option B) makes C-34.1–.4 held twice in the row census with different `where` (red 6); C-103.3's `where` should name `provenanceChainRebuild` in `src/provenance-routes/index.mjs` too (its R58).
- control-plane (red 8): `CHECK_FAMILIES` lacks `bio-plane/src/provenance-routes/checks.mjs` (and `index.mjs`, which re-exports `ROUTE_MARK_CHECKS`).
- plane (red 9): build `provenanceRoutesOf(ctx, { instanceName: env.INSTANCE_NAME || "unnamed" })` after provenance, migrate it, spread `provenanceRouteOps(provenanceRoutesOf(ctx), url, body)`.
- requirements (wording): provenance-routes Uses names record-core `getSetting` for R1's instance name; the code takes it as `deps.instanceName` from the composition root, as provenance did. No change of meaning; I left the code as it was.
- Bundles: none staled (`fleetbundles.test.mjs` 0 fail).

Rows awaiting stamp (T26 L2): C-34.1, C-34.2, C-34.3, C-34.4, each `where` re-pointed to `src/provenance-routes/index.mjs provenanceRouteAssess > is-route-mark`.
