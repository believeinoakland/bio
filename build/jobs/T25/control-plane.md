# control-plane (T25)

**Status** · session_01E6cJNG8QgJmfxSy1h3JDEj · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1; `build/plan/current.md` T25 L11, N512's user side)
- `families.mjs`: `CHECK_FAMILY_FILES` gains `src/attestation/checks.mjs` (C-89 `ATTEST_CHECKS`) and `src/provenance-routes/checks.mjs` (C-34 `ROUTE_MARK_CHECKS`), imported from the new modules, in the module order (provenance, attestation, provenance-routes, before capture-sources). Clears red 8 for this module (`families.test.mjs` R22 totality and `catalogue-end.test.mjs` R43, R22, both red at the start, now green). No row added or changed by this job (red 6: none to list).
- `test/m/control-plane/record.mjs`: builds `attestationOf` and `provenanceRoutesOf` directly after provenance, migrates provenance-routes in the migration pass after provenance, and spreads `provenanceRouteOps` beside `provenanceOps` (under `step`, as provenance's map is).
- **Reading taken on "composes attestation's `attestOp`"** (QUESTION J2): `attestOp` is a Worker arm `(req, env, store, helpers)`, and `record.mjs` is the record store's door (`dispatch`), which has no Worker arms; attestation has no store route map. So the fixture composes attestation (`attestationOf`, its tables made and declared to purge) and routes no `attestOp`. The Worker's `op=attest` arm is `plane/door.mjs`' (it imports provenance's N516 copy until plane's L11 merge, red 9); no file of this module imports `attestOp`.
- Re-scan for the N502/N508 kind: no `awaiting stamp` remains in this module; every mention of `legacy-store`, `legacy-index`, `store.mjs` or the catalogue is past-tense history. One comment at `dispatch.mjs`:209–210, broken mid-sentence ("no longer by legacy-store, made / the same way"), re-worded to say the maps were legacy-store's, deleted at T20; no meaning changed.
- New tests: `families.test.mjs` "R22, R43 (N512; K1193)" (both files listed in order, every row decorates with its own check and words, provenance's file holds neither family; negative control: the list without either file misses its family); `provenance-split.test.mjs` "R26, R22 (N512)" (the three route ops reach provenance-routes' map through the door, stamps from the query never the body, C-34 refusals decorated from provenance-routes' file; negative control: without the map spread each is an unknown op).

**Deferred:** none.

**Found in other modules** (also in REPORT, J3)
- Both fail identically on `origin/tranche/T25` without this job's change (run there in a worktree):
  - `test/m/affordances/sources.test.mjs`:117 "R2: reattest …": the fixture hands capture a `provenance` stub carrying `attestAnswer`, but capture's `reattest` now reaches `cap.attestation` (K1224), so `f.c.provenance.attests` is undefined (TypeError at :129). A fixture of the provenance split's users: red 7's "their fixtures".
  - `test/m/promotion/write-path.test.mjs`:218 "R53 (N426) …": `/list` answers no `bundles` (TypeError at :234); retrieval's `op=list` joins `provenance_route_marks` (provenance-routes R8), which that fixture does not build. Red 7's kind (retrieval's L5 re-point; a fixture not yet composing provenance-routes).
- Generated artifact: this job changed `bio-plane/src/control-plane/families.mjs` and `dispatch.mjs` (a comment), inputs of `bio-plane/dist/bio-plane.bundled.mjs` (the plane's source): that bundle may now be stale. Regenerated nothing (manifest §14).
- Step 2 deviation: I read whole the public parts of `attestation` and `provenance-routes` (the uses this job's entries touch) and provenance's `ops.mjs`; not the public parts of all 65 modules in Uses, none of whose interfaces this job reaches.

**Tests and checks**
- `node --test test/m/control-plane/` (bio-plane): tests 128, pass 128, fail 0.
- `node --test test/m/` (bio-plane): tests 5335, pass 5322, fail 2, todo 11; the two failures above, both red on the tranche base.
- `node checks/format.mjs`: 91 modules, 90 requirements files; 0 failures.
- `node checks/architecture.mjs … control-plane`: 37 product files, 218 relative imports (3 naming no tracked file, not judged); 0 failures.
- `node checks/coverage.mjs … control-plane`: 29 of 29 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … control-plane tranche/T25`: 6 files changed; 0 failures.

Size (session_01E6cJNG8QgJmfxSy1h3JDEj): test runs 7, module lines 3535
