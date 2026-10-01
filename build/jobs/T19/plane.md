# plane (T19)

**Status** · session_01LyQdjVWwytEZ1iVYFQbzYm · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

Three readings I am working on; none stops me now (I build the class, `held.mjs` and the tests first).

1. **`publicOp` and `gatedOp`.** After the L11 owners take their arms (affordances, queue, instance-setup, control-plane's door share), what is left of the two hooks in `src/index.mjs` is dispatch lines to owners' handlers (`publicReadDoorOp`, `publicationDoorOp`, `capturePublicOp`, `bootstrapOp`; `registerAuditOp`, `connectionsOp`, `governorOpResponse`, `captureOp`, `extractionOp`, `attestOp`, `monitorOp`, `ratificationOp`) and the frames. My reading: those frames and dispatch lines are the composition root (legacy-index map §1a marks the frames "composition root"), so I move them whole into `src/plane/` (I am `from` legacy-index) once those jobs have merged, and R6's hooks are plane's compositions of the owners' handlers. The alternative (control-plane holds the two hooks and plane only calls `makeFetch` with them) I will follow if you say so.
2. **R6 "No other export."** `src/index.mjs` also re-exports `PUBLISHED_TOKEN_HASHES`, `liveToken`, `PLANE_LIMITS`, and `store.mjs` `stampInstant`, `instantOrder`. My entry drops all five; no product file imports them through these paths (I will re-check at the deletion).
3. **Files: my own call, recorded here.** `src/plane/index.mjs` the Worker entry (`default`, `Store`), `src/plane/store.mjs` the class, `src/plane/held.mjs` K842's held code; `wrangler.jsonc` `main` → `src/plane/index.mjs`.

For routing (REPORT-grade, listed now so the owners can plan): module tests outside my paths that read the three files and will break at my deletion unless re-pointed to `src/plane/index.mjs` / `src/plane/store.mjs`: `test/m/host-governor/ops.test.mjs`:192, `test/m/capture/plane.test.mjs`:13 (closed layers), `test/m/instance-setup/{worker-page,profiles,reports,worker-reports}.test.mjs` (SRC), `test/m/queue/world.mjs`:7 (`SCHEMA` from `schema.mjs`), `test/m/control-plane/{dispatch,store-class}.test.mjs` (`store.mjs`), `test/m/legacy-store/` (its fixture imports `store.mjs`; it goes with the legacy module?), and agent-worker's `requirements`, `harness`, `agent-worker`, `versions` tests (`PLANE_ENTRY`/`PLANE_IDX_PATH` = `bio-plane/src/index.mjs`). Old system suites reading them are accepted red (K619). `build-plane.mjs` / the fleet bundle input: bundler's, I will REPORT the exact edit when my entry exists.

## J2 · REPORT

**Plane's copy is ready for its early merge (rule 4), at `job/T19/plane` HEAD.** It holds `src/plane/store.mjs` (the class: R1–R5), `src/plane/held.mjs` (K842's held code, R10), `src/plane/door.mjs` and `src/plane/index.mjs` (R6: the hooks moved from `src/index.mjs` as it stands after affordances', queue's and control-plane's merges), `wrangler.jsonc` `main` → `src/plane/index.mjs` and `package.json`'s `test`/`test:system` (R7), and `test/m/plane/` (22 tests; 21 pass, R8's fails by name until the deletions). Nothing outside my paths is touched yet: `src/index.mjs`, `store.mjs`, `schema.mjs` and `dispatch.mjs` are as on the tranche. After this merges, control-plane deletes its wrapper (`dispatch.mjs`:7, :196), and I then delete `store.mjs`, `schema.mjs`, `test/m/legacy-store/`, and reduce `src/index.mjs` to the re-export (K846).

**One choice of mine, recorded:** an unregistered name ranks last in promotion's steps, so `plane-held` would have run after `affordances`' and `tasks`'. The plane builds promotion first with `STEP_ORDER` (the modules' order with `plane-held` just before `affordances`, i.e. `legacy-store`'s place), which keeps today's step and refusal order (R2; tested with probes on either side).

**`modules.json` (yours):** the architecture check fails on 4 missing edges. Plane's `uses`, narrowed to what its code and tests import (K771): record-grammar, signatures, record-core, membership, credentials, promotion, host-governor, provenance, capture, calibration, extraction, content, entities, connections, progressions, bias, observation-log, retrieval, inquiry-grammar, inquiry, citation, basis-versions, strength, contradiction, ai-runs, run-productions, capture-requests, intent, reevaluation, publication, public-read, project-stage, ratification, case-authoring, review, standards, conformance, consequences, actions, action-clocks, filings, escalation, action-plans, monitoring, scheduler, affordances, tasks, queue, instance-setup, op-declarations, control-plane. Added: record-grammar, credentials, inquiry-grammar, op-declarations; dropped: runtime-limits, query-language, run-rules.

**Tests outside my paths that the deletions break** (with `src/index.mjs` kept as the re-export, every reader of it by path keeps working): `test/m/control-plane/dispatch.test.mjs`:7 and `store-class.test.mjs`:11 (`await import("../../../src/store.mjs")`, control-plane's, for its wrapper deletion), and `test/m/legacy-store/` (deleted by me, per B2). `test/m/queue/world.mjs` no longer imports `schema.mjs` at HEAD. None in agent-worker, host-governor or capture.

**Generated artifact:** `dist/bio-plane.bundled.mjs` is stale against my new files (its entry is `src/index.mjs`, which reaches them only after my deletion step); regenerate at the close.

## J3 · REPORT

`src/index.mjs` reduced (B4, K853): now the one line `export { default, Store } from "./plane/index.mjs";` (K846), tranche merged first. Green through the re-export: host-governor/ops 9/0, instance-setup worker-page 10/0, profiles 7/0, reports 6/0, worker-reports 8/0, capture/plane 2/0, scheduler 51/0. Plane 21/1: R8 red by name until store.mjs, schema.mjs and test/m/legacy-store/ go. Ownership 0 failures (legacy-index: 1 line added, the re-export; 158 removed); architecture 0. `store.mjs`, `schema.mjs`, `test/m/legacy-store/` untouched, waiting for your CHANGE.

## J4 · COMPLETE

**Entries applied** (B1, K842, K846, K853, K856, K857). Every R met, with its tests (`test/m/plane/`, 28 tests):
- **R1** the class `Store extends DurableObject` (`src/plane/store.mjs`), starting instance-setup once per object, every store route through control-plane's `dispatch`: `store.test.mjs` "R1: …once per object", "R1, R5: …one frame"; `door.test.mjs` (control-plane's class test moved here, K856) five R1 tests.
- **R2** construction order as `store.mjs` built it, plus `dispatch.mjs`' wrapper's queue/tasks/instance-setup; evidence bucket and namespace prefix; the held step at `legacy-store`'s rank: `store.test.mjs` three R2 tests; `door.test.mjs` "R2, R5 (N13)".
- **R3** the migration pass in `blockConcurrencyWhile`, `RECORD_SCHEMA` first, owners in today's order, REC-143's two passes, PROJ ledger seed: `store.test.mjs` three R3 tests (idempotent; an older store opens; a throwing migration leaves the object unanswering).
- **R4** `alarm`/`onAlarm`/`schedAlarmAt` are scheduler's: `store.test.mjs` R4.
- **R5** the route map, every module's own map, then instance-setup's, then control-plane's, in today's order (417 routes, identical keys and order to the old composed map, checked at the copy): `store.test.mjs` R5; `door.test.mjs` "R1, R5".
- **R6** `src/plane/index.mjs` exports exactly `default { fetch }` (control-plane's `makeFetch` over `door.mjs`' `publicOp`/`gatedOp`, moved from `src/index.mjs`) and `Store`; `bindPublishedPlane` at load: `worker.test.mjs` two R6 tests (one in Miniflare).
- **R7** `wrangler.jsonc` `main` = `src/plane/index.mjs`, bindings unchanged; `package.json` `test` = `node --test "test/m/**/*.test.mjs"`, `test:system` = `node --test "test/system/**/*.test.mjs"`, every other `test:*` dropped: `worker.test.mjs` two R7 tests.
- **R8** `store.mjs`, `schema.mjs` deleted; `src/index.mjs` the one line `export { default, Store } from "./plane/index.mjs";` (K846); nothing imports the three: `worker.test.mjs` R8.
- **R9** no route, table or answer of its own: `store.test.mjs` R9.
- **R10** held code in `src/plane/held.mjs`, registered as `plane-held`: `held.test.mjs` six R10 tests (figures, log counts, registrations, the step's projection, its testimony slot, the leg grades); `store.test.mjs` "R2, R10" (step rank).

**`held.mjs` layout for T20** (202 lines; shared helpers 1–19: imports, `HELD`, `rows`, `one`):
- **Stats figures, 21–145** (`registerHeldCounts` 25–27, `counts` 29–145), registered with record-core (R63/R65). Per owner inside `counts`: the sight subtraction 64–75 (membership's `hiddenBundles`, ai-runs' `hiddenRuns`); record-core's `bundles`, `files`, `history`, `refs` 78–79; extraction's `textIndexOk` 80; membership's `projectParticipants`, `projectOwnerVotes` 81–86; run-productions' `proposedReadings` 76, 87–96, `suggestRefusals` 136–140; inquiry's `inquiryMigrationReplays` 97–98; observation-log's `observations`/`observationsNonLead` 99–126 and `leads` 127–128; basis-versions' `basisVersions`, `basisVersionLegs` 129–135; the registered figures' spread 141–143 (record-core, stays with whoever holds the source last).
- **Leg grades, 147–159** (inquiry R13, R14): `registerHeldLegGrades` 149–151, `heldLegGrades` 153–159.
- **Promotion step, 161–202** (provenance's testimony slot R52, membership's sight index D-497 and `visibilityOf`): `registerHeldStep` 163–165, `promoteChecks` 167–172, `promoteProjections` 174–202 (membership 184 and 198; provenance 186–191; the answer's keys 193–201).
The rank: `store.mjs`' `STEP_ORDER` puts `plane-held` just before `affordances` (adopted, K852); when control-plane takes the slot (its R42, T20), it needs the same rank.

**Deferred:** none.

**Other modules / process:**
- `test/m/capture-sources/credentials.test.mjs`:557 (R55, R57, R63) is red: the DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`:3082) still reads `bio-plane/checks/bio-checks.mjs`, deleted by control-plane R43. Not my change; I take it as one of your accepted reds. `test/m/text-chain/extent.test.mjs` red (N446, accepted).
- Ownership's 3 failures are the three `test/m/legacy-store/` files I deleted on your direction (B2, B5), outside my paths; no other failure. legacy-store: 508 lines removed, 0 added; legacy-index (this step): 0/0 (the re-export landed earlier).
- `dist/bio-plane.bundled.mjs` is stale (bundler's entry `src/index.mjs` now re-exports `src/plane/`): regenerate at the close.

**Tests and checks run** (on `job/T19/plane` @ tranche merged at K857):
- whole `test/m`: tests 4571, pass 4548, fail 3 before my R8 fix (my R8's import scan matched pdf-worker's `src/index.mjs`; anchored to the plane's own paths), so now fail 2: `capture-sources/credentials.test.mjs` (catalogue gone) and `text-chain/extent.test.mjs` (N446).
- `test/m/plane/`: 28 pass, 0 fail. Through the re-export (B4): host-governor/ops 9/0, instance-setup worker-page 10/0, profiles 7/0, reports 6/0, worker-reports 8/0, capture/plane 2/0, scheduler 51/0.
- `format`: 0 failures. `architecture plane`: 0 failures. `coverage plane`: 10 of 10 live ids, 0 failures. `ownership plane tranche/T19`: 3 failures, the directed `test/m/legacy-store/` deletions above.

Size (session_01LyQdjVWwytEZ1iVYFQbzYm): test runs 16, module lines 575
