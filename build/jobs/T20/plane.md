# plane (T20)

**Status** · session_01MArhjhBE3JJDCvHTPZ55xo · depth 2 · WORKING · handled B3

## Completion

**Entries applied** (B1, B3; K861, K882, K918, K920):
- (1) Each owner's figure source registered through record-core R63 under its own name, where `registerHeldCounts` stood (`src/plane/stats.mjs`, `registerOwnersCounts`): record-core (R74: `bundles`, `files`, `history`), membership (R96), run-productions (R20), inquiry (R52 (1)), observation-log (R32: `observations`, `leads`, purge's proof only) and basis-versions (R47). Inquiry's resolver (R52 (2), `inquiryLegGrades`) registered as `inquiry` through `retrieval.registerLegGrades` (retrieval R55) where `registerHeldLegGrades` stood. Control-plane's step (its R42, `promotionStep` from `src/control-plane/step.mjs`) registered under `control-plane` through `promotion.registerStep` where `registerHeldStep` stood; `STEP_ORDER` ranks `control-plane` where `HELD` ranked (after layer 10, directly before `affordances`, before `tasks`).
- (2) The plane's own stats sight is `src/plane/stats.mjs`, registered as `plane` (name my choice, K861 (2)): the `hid`/`runTail` sight, `refs` read from connections' `refsCounts` (R61; K882) in place of its own SQL, `textIndexOk`, `observationsNonLead`, and the R63 spread. `held.mjs`, `HELD` and their imports and calls in `store.mjs` deleted. `held.test.mjs` re-keyed and renamed `stats.test.mjs` (the figures, what is registered under which name, the leg grades); the step's pins moved to `step.test.mjs`; `store.test.mjs`' R2 pins re-keyed (the stats source's holder `plane`, the resolver's `inquiry`, the step `control-plane` and its rank).
- `op=stats` (no viewer, alice, bob, an empty stamp, admin) and purge's proof dumped key by key on one world (a project, two testimonies) on the tranche before the job and after each switch: identical.

**Deferred:** (3) deleting `src/index.mjs` (R8), N463 (B2): `test/m/capture-requests/plane.test.mjs`:17–:18 and `test/m/scheduler/plane.test.mjs`:17–:18 still read it, and neither module has a T20 job. ~30 old suites under `bio-plane/test/` also read it (legacy-tests, K879).

**Found in other modules (for BOB):**
- Stale comments, no behaviour: `src/membership/index.mjs`:292–:294 (R96) and `src/basis-versions/index.mjs`:614–:616 (R47) say plane holds a copy in `src/plane/held.mjs` and that the module registers nothing "while plane holds its copy"; `test/m/membership/t20-figures.test.mjs`:4, `test/m/basis-versions/t20-figures.test.mjs`:4 and `test/m/observation-log/figures.test.mjs`:4 name `held.mjs` as the statement they are held against; `src/control-plane/step.mjs`:2 says plane holds it as `plane-held`. Each is true of history only once `held.mjs` is gone; the owners' "registers nothing itself while plane holds its copy" clauses (record-core R74, membership R96, run-productions R20, inquiry R52, basis-versions R47, observation-log R32) can lose that clause with R10's retirement.
- Generated artifact stale: `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`; my change and others' in T20). `npm run build` from `src/plane/index.mjs` builds (6,731,176 B); I restored the committed files. `test/system/fleetbundles.test.mjs` fails the same arms before and after my change (bio-plane staleness, agent-worker's 153 inputs, the two (j) remedy arms); the baseline also failed the comment-only arm.

**Tests and checks:**
- `node --test test/m/plane/*.test.mjs`: tests 28, pass 28, fail 0.
- `node --test "test/m/**/*.test.mjs"` (bio-plane): tests 4676, pass 4656, fail 0, todo 20.
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures. `architecture.mjs … plane`: 17 product files, 163 relative imports; 0 failures. `coverage.mjs … plane`: 10 of 10 live requirement ids named by a test; 0 failures. `ownership.mjs … plane tranche/T20`: 8 files changed; 0 failures.

Size (session_01MArhjhBE3JJDCvHTPZ55xo): test runs 10, module lines 454

## J1 · QUESTION

Re-scan at start (tranche/T20 @ 8fb87be1a5), two items; I carry on with the rest on my best reading.

(1) The step. record-core (R74), membership (R96), run-productions (R20), inquiry (R52 (1), (2): `Inquiry.COUNT_KEYS`/`counts`, `inquiryLegGrades`), basis-versions (R47), observation-log (R32) and connections (R61, `refsCounts`) have exported and merged. control-plane's R42 step has not: its job (CONTROL-PLANE #11) started and has no commit yet. Best reading: its START says "merge before plane's T20 job", so I switch the figures and the leg grades now and wait for its merge to switch the step, rather than re-housing the step in my own file. If you would rather I close without it, I keep it held in my stats file under plane's name with R10's clause, and say so.

(2) `src/index.mjs` readers still there besides the four instance-setup tests BOB named (instance-setup's job is running): `test/m/capture-requests/plane.test.mjs`:17–:18 and `test/m/scheduler/plane.test.mjs`:17–:18 (`join(SRC, "index.mjs")`, SRC = `bio-plane/src`, i.e. the re-export) — neither module has a T20 job; and ~30 old suites under `bio-plane/test/` (e.g. `content-extent-arms.test.mjs`:102, `observation-log.test.mjs`:418, `nc-rec129.mjs`:36, `mint-ledger.test.mjs`:144), which legacy-tests deletes last (K879). promotion's write-path probe is already re-pointed (K867). Best reading: the deletion of `src/index.mjs` waits until capture-requests', scheduler's and instance-setup's tests are re-pointed to `src/plane/index.mjs` (one line each); the old suites are not test/m and go with legacy-tests, so they do not hold it. Which modules re-point the two, and when?
