# consequences (T22)

**Status** · session_012mH4kBBWFn1UKt6XSSmtew · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

Complete on `job/T22/consequences` @ 8aca1d9101. No source behaviour changed: the cause was in the test.

**Entry applied (K1055: `reads.test.mjs`:185, R15).**
- **Cause, confirmed (BOB's reading, made exact).** `holds` stringified the whole answer. The only value in it drawn per run is `project`: record-core mints `PROJ-<year>-<four random digits>-<slug>` (its counter is hidden by design). So `holds(pat, "900")` at :196 failed whenever those digits were 900x or x900. Measured over the fixture's own generator: 5 of 3,000 worlds (~0.17%). Content ids and capture shas are hashes of fixed text, so they are the same every run; `CONS-` ids are counted; the clock is fixed.
- **Fix.** `holds` now searches every field except `project`, whose value it replaces with a fixed phrase. Nothing withheld can reach the project id, which is the determination's, so every text and figure the part answers is still searched. This covers every `holds(…)` in the module's tests. All the others search for ids, a placeholder or a sentence, none short enough to collide; the one short figure was "900".
- **Negative controls** added at :196: alice's answer, which carries the figure in its why, holds "900"; pat's answer with an operand carrying `figure: "900"` holds it; pat's answer with project `PROJ-2026-9001-budget-watch` does not (the old collision, now deterministic).
- **Proof.** `node --test --test-name-pattern "R15" test/m/consequences/reads.test.mjs` ran 200 times in a row: 200 pass, 0 fail.

**Re-scan (N469, N471, N480).** Two notes named the legacy store as live; both re-worded:
- `src/consequences/index.mjs`:856: the ops are entries of "the legacy store's op map". Now: "the plane's one route map (`plane/store.mjs`, plane R5)". This is a comment only.
- `test/m/consequences/fixture.mjs`:94–96: promotion's facts were registered as provided by `"legacy-store"`. Now they name the modules that provide them: `instance-setup` (`producingGroup`) and `publication` (`caseMember`, `publishedRegistry`).
- No note names a deleted file, `tools/` or the deleted plane `index.mjs`.

**Deferred.** None.

**Found in other modules (for BOB).**
1. Seventeen other modules' test fixtures also register promotion's facts as `"legacy-store"`. Examples: `test/m/{record-core,action-plans,monitoring,case-authoring,capture-requests,actions,content,retrieval,standards,connections,inquiry,ratification,basis-versions}/…` and scheduler, calibration and tasks tests. This is the same N471/N480 kind of note, if BOB reads it that way. It is harmless to behaviour.
2. **Stale bundle.** My comment edit in `src/consequences/index.mjs` makes `bio-plane/dist/bio-plane.bundled.mjs` stale. I regenerated nothing (mechanics §14).

**Tests and checks.**
- `bio-plane/test/m/consequences/`: 30 tests, 30 pass, 0 fail.
- The R15 loop: 200 of 200 pass.
- Whole `bio-plane/test/m`: 4926 tests, 4897 pass, 11 fail, 18 todo. No new red. The 11 fails are the reds carried by name:
  - actions `t18.test.mjs`:299
  - control-plane `doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15
  - accepted red 4: membership `module-order.test.mjs`:12 and `t9-notice-sight-bounds.test.mjs`:185; promotion `registry.test.mjs`:58
  - queue-producers `proposals.test.mjs`: 4 tests
  - scheduler `plane.test.mjs`:85
- Checks:
  - `format`: 86 modules, 85 requirements files; 0 failures.
  - `architecture`: 10 product files, 38 relative imports; 0 failures.
  - `coverage`: 15 of 15 live requirement ids named by a test; 0 failures.
  - `ownership`: 4 files changed between tranche/T22 and HEAD; 0 failures.

Size (session_012mH4kBBWFn1UKt6XSSmtew): test runs 203, module lines 1105
