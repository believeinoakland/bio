# plane (T29)

**Status** · session_013R53oRbit9nK4tT9VYdbFQ · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

plane's `uses` in `modules.json` lack the two T29 modules, so R18's work fails `architecture.mjs` until BOB records them. Best reading, on which I proceed:
- add `case-disclosures` (src: `store.mjs` calls `caseDisclosuresOf(ctx, {attestation})`, as R18 and Uses name);
- add `case-carriage`, a test-only use: B1's re-point of `accepted.test` R16 to `caseCarriageOf(ctx).acceptedWork`, and R18's test of its two tables (`CASE_CARRIAGE_EXEMPT`) existing and declared at boot. R18's Uses line says "case-carriage: none directly"; I read that as the source, which stays without an import. If you would rather the tests not import it, say so and I read through `publicationOf(ctx).caseCarriage` instead.

## J2 · COMPLETE

**Entries applied** (L11, plane R18; N529, N532; K1332, K1333, K1337):
- `src/plane/store.mjs`: builds `caseDisclosuresOf(ctx, {attestation})` with the plane's one attestation instance, at its place after `case-import` and before `case-authoring`; `case-authoring` is now built as `caseAuthoringOf(ctx)`, without `attestation`. `case-carriage` has no line of its own: `publication`'s factory creates it eagerly. No moved name was imported by plane, so nothing needed re-pointing.
- `test/m/plane/split.test.mjs` R2 (B1, K1351): the attestation identity is now read from `caseDisclosuresOf(ctx).attestation`, not from case-authoring's `get attestation()` pass-through. Nothing in plane reads that pass-through any more, so N536 can remove it.
- `test/m/plane/accepted.test.mjs` R16 (B1, K1349): publication's reader is now read as `caseCarriageOf(ctx).acceptedWork`. Nothing in plane reads `publicationOf(ctx).acceptedWork` any more.
- New `test/m/plane/disclosures.test.mjs` for R18, which checks:
  - case-disclosures holds the plane's key-bound attestation, and case-authoring's `disclosures` is that same one instance per host;
  - case-carriage's two tables exist at boot, are declared exempt under `case-carriage`, and survive a whole-store purge;
  - a store written before case-carriage opens with its tables, and a second construction changes nothing;
  - neither module has an ops map, and the route map is exactly the union of the other modules' maps.
- `uses` gain `case-disclosures` and `case-carriage` (tests only) (B2, K1353).

**Deferred:** none.

**For other modules (REPORT):**
- `publication`: its one-line `acceptedWork` delegate (`get acceptedWork() { return this.caseCarriage.acceptedWork; }`) is no longer read by plane. It can be removed in publication's next job (K1349).
- `case-authoring`: `get attestation()` and the `attestation` it passes to case-disclosures' factory are no longer used by plane. N536 removes them.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale, because `src/plane/store.mjs` changed. BOB regenerates it at the layer close (mechanics §14).

**Tests and checks** (on `job/T29/plane` after merging `tranche/T29` at B2):
- `node --test test/m/plane/*.test.mjs test/system/migrate-released.test.mjs`: tests 77, pass 77, fail 0, skipped 0.
- `format`: 97 modules, 96 requirements files; 0 failures.
- `architecture plane`: 27 product files, 250 relative imports; 0 failures.
- `coverage plane`: 18 of 18 live requirement ids named by a test; 0 failures.
- `ownership plane tranche/T29`: 5 files changed; 0 failures.

The manifest names no layer tests. I changed no provided service, so no user module's tests needed running.

Size (session_013R53oRbit9nK4tT9VYdbFQ): test runs 3, module lines 551
