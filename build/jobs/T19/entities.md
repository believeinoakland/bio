# entities (T19)

**Status** · session_01W1XUggKP4umcYqzdbfTAio · depth 2 · COMPLETE · handled B1

## Completion (ENTITIES #6)

**Entries applied** (`build/plan/current.md` L5 entities, amended; B1):
- **R40:** `entitiesOps(entities, url, body)` holds its fourteen ops unchanged, plus `resolve` (`e.resolve(body || {})`, R11) and `resolvetestify` (`e.testify(body || {})`, R12). Each takes the request's body as given, so `resolvedBy` is the control plane's stamp.
- **Rule 5:** the two explicit arms `resolve` and `resolvetestify` and their comment are removed from `store.mjs`' `routes` (legacy-store −9/+0). The store's existing `...entitiesOps(...)` spread now answers both ops, with the same calls.
- **R41:** `Entities.COUNT_KEYS` (`entities`, `entityAliases`, `entityRelations`, `resolutions`) and `counts(hid)`, registered once per storage in `entitiesOf` through `record-core.registerCounts("entities", …)`. A refusal throws, as content's and capture's do.
  - The registry's three figures count every row. `resolutions` leaves out rows whose `COALESCE(bundle_id, '')` is in `hid`, as the store's `#counts` does.
  - A `hid` that is not `{sql, args}` subtracts nothing. A figure that cannot be read is null. The function is synchronous and writes nothing.
- **Rule 1:** `index.mjs` reads `SHARED_ACT_CHECKS` from `record-grammar/acts.mjs` (C-33.40 and C-33.41, through `actShapeRefusal`; C-33.25 stays the module's own `ENTITY_CHECKS` copy) and `BASIS_GRADES` from `record-grammar/grades.mjs`.
  - `resolve.test.mjs`' R33 test imports `BASIS_GRADES` from record-grammar.
  - The header comment (`index.mjs`:1–8) is re-worded.
  - No entities file, product or test, imports `bio-checks.mjs`.

**Rs met, with their tests (for BOB to strike):**
- R40: `ops.test.mjs`, three "R40 …" tests. Every one of the 16 arms is driven, 28 cases with bodies present and absent. Each is run against two worlds built alike, one through the map and one through the named service, and the answers and the five tables afterwards must be equal.
- R41: `ops.test.mjs`, two "R41 …" tests. They cover registration through `entitiesOf` and `record.counts`, the second registration refused (`COUNTS_DECLARED`), the subtraction for outsider, participant, refused and machine viewers through `membership.hiddenBundles`, a malformed `hid`, writes nothing, and null for an unreadable figure.

**Deferred:** nothing.

**Found in other modules (REPORT):**
1. **legacy-store (L10):**
   - R40's text says legacy-store's own job deletes the two explicit arms. B1 told me to remove them here, and I did, so that share is done. The spread it holds already answers both ops.
   - It still has to delete `#counts`' lines for `entities`, `entityAliases`, `entityRelations` and `resolutions` (`store.mjs` ~1051–1053, and purge's `d(...)` lines at ~1261–1264, which read the same figures through `proofCounts`), per R41. The registered figures give them identically.
2. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (inputs `src/entities/index.mjs`, `src/store.mjs`), for the layer close's regeneration.
3. **Catalogue rows still imported:** the catalogue's `ACT_SHAPE_CHECKS` still has importers after this job: `src/progressions/checks.mjs`:23, `src/inquiry/grammar.mjs`:8, and the module tests of citation, inquiry, progressions and basis-versions. So its deletion is not entities' under rule 1.
4. **Old suites already failing:** five old suites fail with the same failing tests on `tranche/T19` @ 362f39b46c without my change (compared by digest): `current`, `meaningquery`, `meaningread`, `project-sight`, `system/meaning-bounds`. One of them, meaning-bounds "RETURN-DELEGATE: `op=resolve` is on the BARE roster again", names `op=resolve`. It reads source text, not behaviour, and fails identically on the base.

**Tests and checks:**
- `node --test bio-plane/test/m/entities/`: tests 63, pass 63, fail 0 (start: 58).
- `node --test` over `test/m/scheduler/plane`, `test/m/legacy-store/`, `test/m/record-core/`, `meaningread`, `meaningquery`, `observation-meaning`, `current`, `project-sight` and `system/meaning-bounds`: tests 105, pass 100, fail 5. The 5 are the same suites, and the same failing tests, as on the base (item 4).
- `format`: 87 modules, 0 failures. `architecture entities`: 14 product files, 0 failures. `coverage entities`: 41 of 41 live ids. `ownership entities tranche/T19`: legacy-store 0 added, 9 removed; legacy-checks 0/0; 0 failures.

Size (session_01W1XUggKP4umcYqzdbfTAio): test runs 12, module lines 1308

## J1 · COMPLETE

Done; pushed to job/T19/entities. Record: build/jobs/T19/entities.md, Completion section. Met, with tests (ops.test.mjs): R40 (the 16 arms, resolve and resolvetestify added, each checked against its named service on two worlds built alike) and R41 (four figures through registerCounts, the hid subtraction on resolutions). Rule 1 done: SHARED_ACT_CHECKS and BASIS_GRADES come from record-grammar, and no entities file imports bio-checks.mjs. Rule 5 done: store.mjs' two explicit arms are removed (legacy-store -9/+0), and its spread now answers both. Entities' tests are 63/63. The 5 old-suite failures I ran are the same on the base. All four checks pass. Reports in the record: R40's text gives the arm deletion to legacy-store, but B1 gave it to me and it is done; #counts' four lines are still legacy-store's (R41); the plane bundle needs regenerating; the catalogue's ACT_SHAPE_CHECKS still has importers (progressions, inquiry), so its deletion is not mine.
