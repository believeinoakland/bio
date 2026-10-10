# capture-requests (T41)

**Status** · session_01F53hF4viv8F8bxe3JE1BHx · depth 2 · COMPLETE · handled B4

## Completion (CAPTURE-REQUESTS #16, B4)

**Reading set.** B4 is test-only: read whole `plane.test.mjs` (the five tests B4 names), `test/m/ai-runs/world.mjs` (the bar B4 points to), run-rules' `test-set.mjs` and `test-bar.mjs` (R19's gate), ai-runs' `testBarRecord`, `testBarRecords`, `#partDeployable`, the open's mode gate and `aiRunsOf`, the plane `Store`'s constructor and migration and record-core's `recordOf`/`evidenceStore`. The rest of the reading set is as #15 recorded; nothing in my code or other tests changed.

**B4 applied (K2514).** `plane.test.mjs` runs the real plane in Miniflare, where no `deps.testSet` can be handed in, and `testBarRecord` is reached by no route. Pre-seeding ai-runs' instance before the Store builds was tried and rejected: its constructor builds record-core and other modules eagerly, before the plane hands them their bindings (the evidence bucket went missing, C-68.1). Instead, the new `test/m/capture-requests/plane-world.mjs` `planeEntry()` copies `src/` to a scratch directory (the repository's other directories, which `src/` imports from, are symlinked beside it, not copied). In the copy, Civicsmith's set holds one matter (as ai-runs' world's `TEST_SET`). The added entry module is the plane's own door and `Store`, which, once built, records a passing result per part through ai-runs R75's `testBarRecord`. `dispose()` removes the copy after the tests. Test-only; no module code changed. Negative control: with the copy's set left empty, the runs are refused `AI_RUN_MODE_NOT_DEPLOYED` (C-109.1) again.

**Ran.**
- `node --test test/m/capture-requests/`: tests 108, pass 108, fail 0 (before B4: 103/5, the five B4 named).
- No layer tests named in the manifest. No service I provide changed, so no users' suites re-run.
- Checks: `format` 0 failures; `architecture` 0 failures; `coverage` 55 of 55; `ownership` 0 failures.

**Deferred.** None.

**Found in other modules.** None against their requirements. Note: while `CIVICSMITH_TEST_SET` holds no matter (N829), a deployed plane opens no run in any mode, and a plane test can hold a bar only by a copy as here. Other Miniflare plane tests that open a run (e.g. `scheduler`'s) face the same. Two scratch copies from my failed attempts remain in the container's temp directory (my deletion was refused); they are outside the repository.

Size (session_01F53hF4viv8F8bxe3JE1BHx): test runs 7, module lines 2537

## Completion (CAPTURE-REQUESTS #15)

**Reading set** (mechanics §17, K2304): measured over 300 KB (own code 167 KB, own tests 197 KB, requirements 37 KB). Read whole myself: `build/requirements/capture-requests.md`; layer 6's row of `build/layers.md` (and its "Layers 3 and 6" section); the plan's entry T41-25 and K2448, K2472; `steps`' public part (Purpose, Provides R1–R26, R9 and R11 the services my Uses names), and after B3 the code of its `stepsOf`, registrations (R1, R9, R11), `step`, `recordProduct`, `#product`, `#productSeen`, `#tie`, `productsOf`; `draft-T41-investigation.md` §3.6's line for R55 and the edge list; all of `index.mjs`, `schema.mjs`, `checks.mjs` and `fixture.mjs` (the code and fixture my entry changes); `run-rules`' `runPrincipalOf`. A worker read the nine other test files whole (retry, drain, door, plane, t35, reads, sweep, member-only, t34) and wrote a ~7 KB summary citing file:line: per-file requirement coverage, how the world and fakes are built, and every exact-shape assertion a new field, column, code or registration could break. Its "could break" list was exact: the two it named (reads:67 R24's row keys, door:222 the C-28 map) were the only existing tests that needed `step` / C-28.34 added; nothing it left out mattered (all others passed unchanged).

**Entries applied (T41-25, N820).**
- R55 door: optional `step`, judged before anything is written by `steps.step({step, viewer})` with the run's principal as viewer (`runPrincipalOf(principal_plane)`); unseen, absent, non-text, no steps reachable or a throw are refused alike `CAPTURE_REQUEST_NO_STEP` (new row C-28.34, region `is-capture-request`, awaiting stamp). Blank or absent is an ordinary request.
- R55 row: new column `step` (additive, NULL on legacy rows); answered by R6's both arms (a repeat keeps the stored step), R24/R43 reads and R29's waits.
- R55 tie: on every `captured` outcome (new capture and R39's already-held alike) a row naming a step calls `steps.recordProduct({step, record: {kind: "capture", id: sha}, by: principal_plane})`; its answer is relayed as `step_product` on the captured entry and never changes the row or the drain.
- R55 arrival: at creation `steps.registerArrivalSource("capture_request", read, "capture-requests")`; `arrived(id)` answers true when captured, false otherwise, null for an unknown id (steps: undetermined).
- B3 (K2491): `steps` reached as `stepsOf(host, {record, observationLog, promotion})` unless `deps.steps` is given; the fixture builds the real `steps` over its record, membership, promotion and log. Readings recorded by BOB as K2482.

**`uses` edge for BOB to apply at my merge:** `capture-requests` gains `steps`. (`architecture` reports 2 failures until then, both this edge: `index.mjs` and `fixture.mjs` import `steps`; with the edge applied locally, uncommitted, it reports 0.)

**Tests.** New `t41.test.mjs` (5 tests, R55 in each title, on the real `steps`, each with a negative control, K874: door accept/standing/plain; refusal alike for hidden-project and absent steps, malformed values, no steps, a throwing steps, sight being the run principal's; the tie read back through `productsOf`, R39's held capture, a refused request tying nothing; a deleted step's refused tie and a throwing `recordProduct` leaving the capture filed; the arrival registration held, a wait met exactly on capture and an unmet one on a refused request). Mutations (tie removed, sight always true, registration removed) each turned t41 red. Existing tests changed only where R55 changed the contract: reads:67 (R24 row keys gain `step`), door:222 (C-28 map gains C-28.34), fixture (`steps`).

**Ran.**
- `node --test test/m/capture-requests/`: tests 108, pass 108, fail 0.
- No layer tests named in the manifest.
- Users of this module and `steps` (I changed a service I provide: rows answer `step`): `steps` 33/0; intent 72 ok/2 fail; link-sweep 29/0; scheduler 122/0; machinery-producers 24/0; queue-producers 77/3; op-declarations 109/8; answer-envelope 24/4; store-door 41/0; control-plane 195/0; plane 147/8; agent-worker 12/0; `test/system/migrate-released.test.mjs` 1/0. The 25 reds are identical, test for test, on `tranche/T41` @ cbdca49cd0 without my change: none mine.
- Checks: `format` 0 failures; `architecture` 2 failures (the `steps` edge above), 0 with it; `coverage` 55 of 55; `ownership` 8 files, 0 failures.

**Deferred.** None.

**Found in other modules.** None against their requirements. Note for `steps`: `#productSeen` judges a capture seen only when `register` files it in a bundle the viewer sees, so a capture filed in no bundle is unseen by `productsOf`, where capture R27 (and this module's R49) read such a capture as visible; consistent with steps' fail-closed rule, recorded only. My own requirements' Terms (Provides) do not list `step` among the request's fields; R55 implies it (BOB's text). Generated artifacts staled: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), regenerated at layer close. `plane`/`control-plane` wiring passes no `steps` to this module; the default `stepsOf(host, …)` reaches the one instance on the host.

Size (session_01Y176r2DgXuBjQoTamPdKfb): test runs 17, module lines 2537

## J1 · QUESTION

R55's seam with `steps` (not yet built; its requirements name no signatures for `recordProduct` or the arrival read). My best reading, which I am building on now; only the signatures change if you rule otherwise:

1. **Reach.** `steps`' instance is `deps.steps` (K61). Until steps merges, nothing defaults it and no plane wiring changes (control-plane/plane are not mine); at your CHANGE for steps' merge I default it lazily (`stepsOf(host)`, as `inquiry` is reached) and the arrival registration then runs at creation.
2. **Door (sight).** `step`, when given and non-blank, is judged by `steps.step({step, viewer})` with `viewer` = `runPrincipalOf(run.principal_plane)` (the run's principal as a viewer stamp, as the drain judges R49). Seen = an answer `{ok !== false, step: <that id>}`. Unseen, absent, non-text, or no steps reachable: refused, before anything is written, under one new code `CAPTURE_REQUEST_NO_STEP` (C-28.34, region `is-capture-request`), answering alike for absent and unseen ("refused as absent"). Judged after R3's lead checks, before R4.
3. **Row.** New column `step` (TEXT, NULL on legacy rows), answered by R6 (both arms), R24/R43 reads and R29. Idempotency key unchanged (run, address, render): a repeat naming a different step answers the standing row (its stored `step`), nothing written, as R50 keeps `co_archive`.
4. **Tie.** On a `captured` outcome (new capture, and R39's already-held one alike), when the row names a step: `steps.recordProduct({step, record: <capture sha>, kind: "capture", by: <row's principal_plane>, run, request, at})`. Its answer (or failure/throw) never changes the row or the drain's outcome; it is reported on the captured entry as `step_product: {ok, ...}`.
5. **Arrival source.** At creation, `steps.registerArrivalSource("capture_request", read)`; `read(id | {id, viewer})` answers null for an unknown id, or one the given viewer cannot see by target (→ steps' `undetermined`), else `{kind: "capture_request", id, state, met: state === "captured", ended: state is terminal, at: captured_at ?? updated, capture_sha}`. Synchronous, writes nothing, never throws.

`uses` edge to add at my merge: `steps`.

## J2 · COMPLETE

T41-25 applied: R55 (step on a request, refused as absent C-28.34; the capture tied by steps.recordProduct; capture_request registered as an arrival source), on the real steps after B3. Tests 108/0; users' suites' 25 reds identical on tranche/T41; checks format 0, coverage 55/55, ownership 0, architecture 0 once the uses edge capture-requests → steps is applied (2 failures until then, both that edge). Record: Completion (CAPTURE-REQUESTS #15).

## J3 · COMPLETE

B4 applied (K2514): plane.test.mjs's five runs now open on a passing test bar. The Miniflare plane takes no deps.testSet, so plane-world.mjs runs a scratch copy of src/ whose Civicsmith set holds one matter, its Store recording a passing bar per part through ai-runs R75's testBarRecord. Test-only; negative control (empty set) refused C-109.1. Tests 108/0; checks format 0, architecture 0, coverage 55/55, ownership 0. Record: Completion (CAPTURE-REQUESTS #16, B4).
