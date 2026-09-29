# entities (T12)

**Status** · session_014uYCCRJpRYo3N4vJcfu6tz · depth 2 · COMPLETE · handled B1

## Completion

**Applied.** N285, entities' share (B1), on `tranche/T12` merged at 4290f52fb7:
- **R37** `noEntity(detail?)` (`src/entities/index.mjs`, exported beside `noSuchEntity`, with `NO_ENTITY_DETAIL`), the one site of `NO_ENTITY`, its own row `ENTITY_CHECKS.NO_ENTITY` (C-91.5, the next of C-91; `where` `src/entities/index.mjs noEntity > is-entity-named`), translation verbatim from R37. `detail` is the caller's sentence when a non-empty string, else the default; writes nothing, never throws. R2 (`addAlias`), R5 (`readEntity`), R12 (`testify`), R15 (`concerns`), R17 (`namingDocuments`) and alias withdrawal answer through it, each with its own sentence. `connections` (R1) and `progressions` (R6, R9, R14, R15) can build against it now.
- **R1** `createEntity` refuses `ENTITY_NO_LABEL` with its own row `ENTITY_CHECKS.ENTITY_NO_LABEL` (C-91.6, `createEntity > is-entity-labelled`), translation verbatim from R1; entities no longer mints `NO_LABEL`.
- **R11, R12, R14** the no-digest answers of `resolve` (and its set form, per item), `testify` and `resolutionsFor` answer through `extraction.noSha` (its R63, C-51.6), each with its own sentence; entities mints no `NO_SHA`.

**Strike.** R37's `(not yet met: N285)` and R1's `(not yet met: N285; minted as NO_LABEL)` are met by this work. R36's mark stays: it waits on `intent` (layer 7).

**Deferred.** None.

**Found (reported to BOB).**
1. Legacy UI key on the renamed code: `civicos-ui/app.html:17024`, the `entitycreate` probe `expects:r=>r.reason==="NO_LABEL"` (now `ENTITY_NO_LABEL`). `affordances.mjs:447` names `NO_LABEL` only in the comment listing codes deliberately outside `JUSTIFICATION_REFUSALS`; no `reasoned`/`*_REFUSALS`/`NON_ACTS` list names `NO_LABEL`, `NO_ENTITY` or `NO_SHA` as entities' code.
2. Legacy-tests suite broken: `bio-plane/test/entityregistry.test.mjs:140` pins `reason === "NO_LABEL"` for `entitycreate` (passes on the parent, fails here). `d470-catalog-census` fails identically before and after (its 1.42.0 row, already listed for legacy-tests).
3. DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`), this commit against its parent: failures 30 → 29. Arm G: `NO_LABEL`'s multi-site failure is gone; `NO_ENTITY` 8 → 3 literal sites (connections' and progressions', theirs under N285); `NO_SHA` 5 → 2 (extraction's helper and progressions'); multi-site codes 68 → 67 (ceiling 54). Floors legacy-tests re-pins move: rows 786 → 788, census 1066 → 1067, reach 811 → 812, governedSites 497 → 499, regions 458 → 460, regionLines 5478 → 5490, codesChecked 887 → 891, outcomeReturns 260 → 262, refusalsJudged 860 → 862.
4. Generated artifacts stale, not rebuilt (§14): `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs` (both manifests list `src/entities/` inputs).

**Tests and checks.**
- `node --test bio-plane/test/m/entities/`: tests 41, pass 41, fail 0. New: "R37 noEntity answers the one refusal …" (the row, the translation, caller's detail or default for every non-sentence, writes nothing, never throws); "R37 every act … answers through noEntity: R2, R5, R12, R15, R17 and alias withdrawal" (absent, null, empty, a number, an object; each its own sentence; negative control); "R11 R12 R14 … through extraction's noSha" (every shape of absence, set form, negative control). R1's test now checks `ENTITY_NO_LABEL`'s row field for field.
- Modules using entities (`connections`, `progressions`, `bias`, `observation-log`, `retrieval`, `inquiry`, `basis-versions`, `contradiction`, `intent`, `scheduler`, `affordances` under `test/m/`): tests 562, pass 556, fail 0, todo 6 (theirs).
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … entities`: 10 product files, 28 relative imports; 0 failures.
- `node checks/coverage.mjs … entities`: 37 of 37 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … entities tranche/T12`: 5 files; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_014uYCCRJpRYo3N4vJcfu6tz): test runs 6, module lines 1085
