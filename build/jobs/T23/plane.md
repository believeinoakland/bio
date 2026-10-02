# plane (T23)

**Status** · session_017NFraWSdSr3q7n2ieXDSvL · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

One reading I am building on; nothing waits on it.

network-notices' three public reads (`activitymethod`, `noticespublic`, `groupkeyspublic`, public-read R18, K1150) are reachable today as `op=publicread&name=<name>` through `publicReadDoorOp`, which my `src/plane/door.mjs` calls. Public-read's record says they can also be reached as `op=<name>` when the plane hands `publicReadDoorOp` the declared names as `helpers.publicReads`, and that this needs op-declarations to declare each name `classes: null`.

My reading: no entry of mine asks for routing by name, so I leave `door.mjs` as it is, with the reads reached through `op=publicread&name=<name>` only. If op-declarations' or control-plane's L11 merge declares the three names, tell me in a CHANGE. I would then hand `publicReads` the names network-notices registered (`Object.keys(networkNoticesPublicReads(...))`, read through public-read's `publicReads()`, never a list of my own), and test one through the Worker door.

## Completion

**Entries applied** (B1; `build/plan/current.md` T23 L11, plane):
- **(1) N483 (K1024, K1122):** R5's route map spreads `corpusExportOps(corpusExportOf(ctx), q)` (corpus-export R6), in the modules' order just before publication's map. `op=export` and `op=exportlog` reach corpus-export through control-plane's door again. The instance is the one publication's eager creation makes, so `export_log` and its purge exemption stand at every boot. No arm of my own. This clears red 14 and red 6's plane share in the store; `worker.test.mjs`:39 stays red until queue-producers' merge (below).
- **(2) network-notices composed (DEC-111, K1100; R2, R3, R5):**
  - Built at construction with the plane's `env` (`networkNoticesOf(ctx, { env })`), right after publication. That is its place among what the constructor builds: publication, then public-read and project-stage, which are built lazily, then network-notices. At creation it makes and declares its tables, holds its mint seed, and registers its three public reads with public-read R18.
  - Migrated in R3's pass, after intent's, before layer 9's.
  - The scheduler reaches it for `working-on-seal` and `working-on-attest` through its default owner, which finds the instance the plane built.
  - Its ops map is spread after project-stage's.
- **(3) N482, R13:** `test/m/plane/limits.test.mjs` parses `wrangler.jsonc` with `parseJsonc` and shows `limits.subrequests` = 10000, carried unchanged by `deriveLimits`. It imports `SUBRESOURCE_CAP` (400) and shows 10000 ≥ 10 × 2 × (1 + cap) = 8,020. Negative controls: a cap of 500 fails; no `limits`, `{}`, 0, 2.5 and `"10000"` are refused `NO_SUBREQUEST_LIMIT`; and a changed comment parses to the same figure. "R13" is in every test title.
- **K1163 (monitoring R64):** capture-requests (and capture) are built before monitoring now, and the composed capture-requests is handed to `monitoringOf`. Monitoring's sweep scope check is therefore registered at construction.
  - The test, on a fresh instance whose scheduler reaches no owner: the slot is held by monitoring, and a sweep-named request drained there is judged by monitoring's check ("no sweep is named …").
  - Negative control: the old order with no sweep service asked is refused "no scope check is registered".
  - I proved the test fails with the hand-over reverted.
  - The test drives an unknown sweep, not a ratified one. Building a ratified sweep would need monitoring's whole grammar at the plane; monitoring's own tests show its check admits a ratified sweep.
- **Found while testing K1163:** in the old order, scheduler's `start` already reached monitoring's `sweepDue`, which registers the check, inside `blockConcurrencyWhile` and so before any request. The window MONITORING #12 described was therefore closed at the plane before the first request. It was open only to a host whose scheduler start reaches no monitoring. The change still makes the registration not depend on that.

**Deferred:** none.
- J1 (routing the three public reads by name) waits on your answer. As things stand they are reached at `op=publicread&name=<name>`.

**Found in other modules / for BOB:**
- `build/requirements/plane.md` R13 still reads `*(not yet met: T23)*`; it is met now. The mark is yours to strike.
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from my `src/plane/store.mjs`. fleetbundles says: 1 test, 0 pass, 1 fail; the only finding is `bio-plane: STALE BUNDLE`, naming `src/plane/store.mjs` (red 12). The workers pass. I regenerated nothing.
- `worker.test.mjs`:39 (`op=queue` → 502): queue-producers still calls `publication.exportLog` (`queue-producers/index.mjs`:1493), retired by N483. This is red 6's queue-producers share and clears with queue-producers' merge, which should read corpus-export's `exportLog`.

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/plane/`: tests 47, pass 46, fail 1 (`worker.test.mjs`:39, red 6, above). New: `notices.test.mjs` 8, `limits.test.mjs` 3.
- `node --test test/system/migrate-released.test.mjs`: tests 1, pass 1, fail 0, no skip.
- `node --test "test/m/control-plane/**/*.test.mjs"`: tests 116, pass 114, fail 2. Both are accepted: `families.test.mjs`:47 (red 5) and `inbox-door.test.mjs`:81 (red 9).
- `node --test "test/m/**/*.test.mjs"`: tests 5194, pass 5178, fail 5, todo 11, skipped 0. All 5 are accepted by name:
  - control-plane `families.test.mjs`:47 (red 5) and `inbox-door.test.mjs`:81 (red 9);
  - plane `worker.test.mjs`:39 (red 6);
  - queue `catalogue.test.mjs`:34 and :116 (red 13, until queue's merge).
- `node --test test/system/fleetbundles.test.mjs` (repo root): 1 fail, the plane bundle STALE (red 12).
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures.
- `node checks/architecture.mjs … plane`: 19 product files, 184 relative imports; 0 failures.
- `node checks/coverage.mjs … plane`: 13 of 13 live ids named; 0 failures.
- `node checks/ownership.mjs … plane tranche/T23`: 5 files; 0 failures.

**Merge:** last in L11. I wait for your CHANGE announcing each L11 merge, then merge `tranche/T23` and re-run.

Size (session_017NFraWSdSr3q7n2ieXDSvL): test runs 12, module lines 487

## J2 · COMPLETE

plane's entries are applied; details are under Completion in build/jobs/T23/plane.md. (1) The op map spreads corpusExportOps, and op=export and op=exportlog are answered and logged through the door (clears red 14). (2) network-notices is built with env after publication, migrated in R3's pass, its public reads and scheduler consumers held, and its four ops routed, with negative controls. (3) R13 is tested from the parsed config with negative controls; please strike its not-yet-met mark. K1163: capture-requests is built before monitoring and handed to it, so the scope check is held at construction; the test fails with the change reverted. Tests: plane 46/47; the whole test/m has 5,178 pass and 5 fail, all accepted by name (control-plane families:47 and inbox-door:81, plane worker:39 for queue-producers' exportLog (red 6), queue catalogue:34 and :116). The plane bundle is STALE from my store.mjs (red 12); I regenerated nothing. format, architecture, coverage (13/13) and ownership: 0 failures. J1 is still open. I merge last; waiting for your CHANGEs.

## Re-run after B3 (K1174: every other L11 job merged)

**Merged** `tranche/T23` into `job/T23/plane`; no conflict. Nothing I read changed: `build/requirements/plane.md`, `src/plane/`, `test/m/plane/` and the network-notices, corpus-export, monitoring and capture-requests sources are as they were. No code change was needed.

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/plane/`: tests 47, pass 47, fail 0. Red 6's plane share (`worker.test.mjs`:39) is cleared: queue-producers now reads corpus-export's `exportLog`.
- `node --test test/system/migrate-released.test.mjs`: tests 1, pass 1, fail 0, no skip.
- `node --test "test/m/**/*.test.mjs"`: tests 5218, pass 5207, fail 0, todo 11, skipped 0.
- `node --test test/system/fleetbundles.test.mjs` (repo root): tests 1, fail 1, no skip. The only finding is `bio-plane: STALE BUNDLE`, from the L11 merges. The stale inputs are `src/affordances.mjs`, `src/control-plane/{dispatch,families,index,pull}.mjs`, `src/op-declarations/index.mjs`, `src/plane/store.mjs` (mine), `src/queue-producers/index.mjs`, `src/queue/index.mjs`, `src/queuestate.mjs` and `src/tasks/index.mjs`. This is red 12, for your close; I regenerated nothing.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures.
- `node checks/architecture.mjs … plane`: 21 product files, 195 relative imports; 0 failures.
- `node checks/coverage.mjs … plane`: 13 of 13 live ids named; 0 failures.
- `node checks/ownership.mjs … plane tranche/T23`: 5 files; 0 failures.

Size (session_017NFraWSdSr3q7n2ieXDSvL): test runs 18, module lines 487

## J3 · COMPLETE

B3 (K1174) applied: tranche/T23 merged into job/T23/plane with no conflict, and nothing I read had changed, so no code change was needed. The plane's tests pass 47/47, so red 6's plane share is cleared. The whole test/m: 5,218 tests, 5,207 pass, 0 fail, 11 todo. migrate-released 1/1. format, architecture, coverage (13/13) and ownership: 0 failures. fleetbundles: the plane bundle is STALE from the L11 inputs, mine and the other L11 modules' (red 12, for your close). I regenerated nothing. Ready to merge.
