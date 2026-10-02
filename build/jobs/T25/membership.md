# membership (T25)

**Status** · session_01VygP3okwnSo5Wu6aPRkQw3 · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T25 L2, membership)
- R83: `MODULE_ORDER` (`bio-plane/src/membership/index.mjs`) now equals `build/modules.json`'s total order after T25's opening fold (N512, N513, K1219): `attestation` and `provenance-routes` directly after `provenance` in layer 3, `reading-pipeline` directly before `extraction` in layer 4. Clears red 5 (this module's R83 test and promotion's `registry.test.mjs`:58 now pass).
- Re-scan for the N502/N508 kind (N469's rule): no `awaiting stamp` note and no note naming the retired legacy store, its op map or legacy-index as live. One stale pointer of the same kind re-worded: `activeAdmins`' comment named "queue R23's" earliest active administrator; that rule is `tasks` R1's since the queue split (R86 already says so). Past-tense history notes (the legacy store's boot and `auditPass`, `query.mjs`, the negative controls in `test/members.test.mjs`) left as history. The header names T25's R83 change.

**Deferred** · none.

**Found in other modules** · `bio-plane/src/` changed (membership's `index.mjs`), so the plane's bundle (`bio-plane/dist/bio-plane.bundled.mjs`, owned `not_product`) is stale until BOB regenerates it at the layer close; nothing regenerated here (`build/manifest.md`).

**Tests and checks**
- `node --test test/m/membership/ test/members.test.mjs` (in `bio-plane/`): tests 140, pass 140, fail 0.
- Users: `node --test test/m/promotion/ test/m/provenance/`: tests 223, pass 223, fail 0.
- Whole `bio-plane/test/m`: tests 5290, pass 5279, fail 0, skipped 0, todo 11 (pre-existing TODOs). No red; none of the accepted reds 1–5 shows there.
- `checks/format.mjs`: 91 modules, 87 requirements files; 6 failures, all red 4 (the three new modules' `paths`/`tests` directories absent: attestation, provenance-routes, reading-pipeline).
- `checks/architecture.mjs … membership`: 23 product files, 59 relative imports; 0 failures.
- `checks/coverage.mjs … membership`: 79 of 79 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … membership tranche/T25`: 1 file changed by membership; 0 failures.

Size (session_01VygP3okwnSo5Wu6aPRkQw3): test runs 5, module lines 3345

## J1 · COMPLETE

R83 applied: MODULE_ORDER equals modules.json after fold 3 (attestation, provenance-routes after provenance; reading-pipeline before extraction); red 5 cleared. Stale-note re-scan: one pointer re-worded (activeAdmins' comment: queue R23 -> tasks R1); nothing else of the N502/N508 kind. Module 140/140; promotion+provenance 223/223; whole test/m 5279 pass, 0 fail, 11 todo. Checks: format 6 failures (all red 4), architecture/coverage (79/79)/ownership 0. REPORT: bio-plane/src changed, so the plane bundle is stale until your layer-close regeneration; nothing regenerated. Record: build/jobs/T25/membership.md.
