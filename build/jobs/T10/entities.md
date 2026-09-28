# entities (T10)

**Status** · session_01Spi2rw7fqrSoC1eWoQVSEo · depth 2 · COMPLETE · handled B1

## J1 · REPORT

R36 is pushed (`04b1eff410` on `job/T10/entities`), ready for your early merge for progressions (and intent later).

- `noSuchEntity(entityId, extra?)` is a module-level export of `bio-plane/src/entities/index.mjs`. It answers `{ok: false, reason: "NO_SUCH_ENTITY", code, check, translation, entity_id, detail}`. `detail` is one fixed sentence; `extra` adds fields and never replaces these. It never throws.
- Its row is `ENTITY_CHECKS.NO_SUCH_ENTITY` (exported from the same file; held in `entities/checks.mjs`): check **C-91.4**, the next free number of C-91, the family entities holds (membership's C-70.5 is the precedent, K174). Its `where` is `src/entities/index.mjs noSuchEntity > is-entity-registered`, and the region is marked (4 lines, over the guard's 120-character floor). The translation names no act, so it reads true for every caller: "No subject with that id is registered in the record, so nothing can be said about it or attached to it. Register the subject first, or name one that is registered. Nothing was written."
- Entities' own sites (R2, R3 with `end`, R12, R17) now call it. Progressions' C-100.12 and intent's C-111.5 are to give way to it.
- In the same commit: R13 goes through membership's `listenerRefusal` and runs listeners in `MODULE_ORDER` (N202). R35 is stated by a test (N110, N135). `is-alias-named` is widened to the whole refusal (N126).
- Module tests are 38/0. Format, architecture, coverage (36/36) and ownership all report 0 failures.

I'm continuing with the rest of the job.

## J2 · REPORT

These are things this job found in other modules, artifacts and requirements. I changed none of them.

1. **Generated artifacts made stale** (mechanics §14). `fleetbundles.test.mjs` names `src/entities/checks.mjs`, `index.mjs` and `schema.mjs` as changed sources for:
   - `agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json` (owner `agent-worker`);
   - `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` (owner `not_product`).

   Regenerate them at the layer's close.
2. **progressions and intent (N208).** They still mint `NO_SUCH_ENTITY` themselves. The DEC-49 guard's arm G now counts 4 literal sites, down from 8: entities' `noSuchEntity`, then `intent/index.mjs` `refuseNoSuchEntity` and `progressions/index.mjs` `threadInstance` and `dischargeStage`. Their rows C-100.12 and C-111.5 give way to C-91.4 (entities R36; progressions R6 and R14 already name `entities.noSuchEntity`).
3. **Shared generic codes (N217, K275; not in my share).** The guard's arm G still counts entities among several modules that mint:
   - `NO_ENTITY` (connections, entities, progressions);
   - `NO_LABEL` (entities, membership, progressions);
   - `NO_SHA` (content, entities, extraction, progressions).

   Under K275 you decide whether each is one condition with the earliest module's helper, or each module's own renamed code. If they are one condition, entities is the earliest holder of `NO_ENTITY` and would provide it in a later job.
4. **legacy-tests.**
   - `test/readingname.test.mjs` is 99/1 (100/0 on `origin/tranche/T10`). Its sweep "the fixed-position orderings … are exactly the three" now also finds `MODULE_ORDER`, because entities' `#listen` ranks listeners by `MODULE_ORDER.indexOf` as R13 (N202) requires. The suite's expected list wants `MODULE_ORDER` added, as it already allows for extraction and content.
   - The DEC-49 guard is 120 failures, the same count as the tranche. Entities' changes move only measured figures: families +1 (`ENTITY_CHECKS`), rows +1, regions +2, regionLines +12, governedSites +1, codesChecked +2, refusalsJudged +1, outcomeReturns +1. They also clear three failures: `is-alias-named` under the span floor (N126), `LISTENER_DECLARED`'s entities site, and four of `NO_SUCH_ENTITY`'s sites. The floors are yours to move.
   - `test/nc-rec95.mjs` reports 4 arms NOT AS DECLARED both with and without my change.
5. **connections.** `test/m/connections/factory.test.mjs` (capture R58's `env` refusal) is 59/1, identical on `origin/tranche/T10`. It predates this job.
6. **entities' requirements header.** It still lists R8, R19, R20, R23, R25 and R32 as not yet met, as do their inline marks (K106, N4, N6, REC-225, K102). The code meets each, and each has a passing test at the interface (registry R8; naming R19; idmatch R20, R23, R25; reads R32). R13, R35 and R36's `not yet met: T10` marks can be struck now. The requirements file is yours, so I struck nothing.

## J3 · COMPLETE

**Entries applied** (plan: the entities bullet, layer 5):
- **N208, R36.** `noSuchEntity(entityId, extra?)` is a module-level export and the one site of `NO_SUCH_ENTITY`. Its row is `ENTITY_CHECKS.NO_SUCH_ENTITY`, C-91.4, the next free number of the C-91 family entities holds (membership's C-70.5 is the precedent). Its `where` is `noSuchEntity > is-entity-registered`. R2, R3 (`end` through `extra`), R12 and R17 answer through it. It was pushed first for your early merge (J1).
- **N202, R13.** `onResolved` and `onResolveAttempt` refuse through `membership.listenerRefusal` (its R81), so entities' own `LISTENER_MALFORMED`/`LISTENER_DECLARED` literals are gone. Listeners run in `membership.MODULE_ORDER` (its R83), whatever order they registered in; a module not in the list runs last, in registration order.
- **N110, N135, R35.** The read contract on `entities(entity_id, at)` and `resolutions(capture_sha, bundle_id, ref, entity_id, grade, established)` is stated by a test. It checks every grade and every writing path, including a raise in place, and a later module's join. The schema's comment names it.
- **N126.** `is-alias-named` is widened to the whole refusal and is now over the guard's 4-line / 120-character floor. The act-shape helper is renamed `actShapeRefusal` so the guard's arm C can read the refusal inside the region.
- **Improvement (K313, K316).** The module's test fixture answers at the plane's shape: `sql.exec` returns a cursor, and a LIKE/GLOB pattern over 50 bytes is refused as workerd refuses it. All 38 tests stay green on it. Entities builds no LIKE/GLOB pattern.

**Deferred:** none.

**Other modules:** see J2. Two corrections to J2:
- **J2 item 4, `readingname.test.mjs`.** The sweep's expected list holds only `BASIS_GRADES`, `CORRESPONDENCE_RANK` and `Store.QUEUE_CLASSES`. My claim that it "already allows for extraction and content" was wrong; the sweep evidently does not scan those files.
- **J2 item 4, the DEC-49 guard.** Measured again on the final tree against `origin/tranche/T10`, the moves are: families 99→100, rows 783→784, regions 407→409, regionLines 5139→5150, bodyLines 7207→7218, governedSites 480→481, codesChecked 867→870, refusalsJudged 844→846, outcomeReturns 262→263. The guard reports 120 failures on both trees.

**Tests run:**
- `node --test bio-plane/test/m/entities/` gives tests 38, pass 38, fail 0, todo 0. New: `contract.test.mjs` (R35, R36 ×2) and a second R13 test (N202).
- The manifest names no layer tests.
- Every module that uses entities: connections 59/1 (predates, J2 5), progressions 40/0 (1 todo), bias 45/0 (1 todo), observation-log 42/0, retrieval 58/0, inquiry 50/0, basis-versions 42/0, contradiction 28/0, intent 35/0, scheduler 46/0 (6 todo), affordances 73/0 (1 todo).
- Legacy suites that exercise entities: entityregistry 47/0, resolution 46/0, d484-refusal-translation 31/0, shadowed-refusals 45/0, readingname 99/1 (J2 4), nc-rec95 (predates).
- `fleetbundles.test.mjs` fails only on the two stale bundles (J2 1).

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 10 product files, 27 relative imports (0 naming no tracked file, not judged); 0 failures
- coverage: 1 modules, 36 of 36 live requirement ids named by a test; 0 failures
- ownership: 7 files changed by entities between tranche/T10 and HEAD; legacy-store: 0 line(s) added, 0 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures

Size (session_01Spi2rw7fqrSoC1eWoQVSEo): test runs 36, module lines 1048
