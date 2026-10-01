# plane (T20)

**Status** · session_01MArhjhBE3JJDCvHTPZ55xo · depth 2 · WORKING · handled B2

## Work

- **Done (commit on `job/T20/plane`):** the figures of record-core (R74), membership (R96), run-productions (R20), inquiry (R52 (1)), observation-log (R32) and basis-versions (R47) are registered through record-core R63, each under its owner's name, where `registerHeldCounts` stood (`src/plane/stats.mjs`, `registerOwnersCounts`); inquiry's resolver (R52 (2)) is registered as `inquiry` through `retrieval.registerLegGrades` where `registerHeldLegGrades` stood. The plane's own stats sight (the `hid`/`runTail` sight, `refs` from connections' `refsCounts` (R61; K882), `textIndexOk`, `observationsNonLead`, the R63 spread) is `src/plane/stats.mjs`, registered as `plane` (my choice of name, K861 (2)). `held.test.mjs` re-keyed and renamed `stats.test.mjs`. `op=stats` (whole, alice, bob, empty stamp, admin) and purge's proof compared key by key on one world before and after the switch: identical.
- **Waiting:** the promotion step stays in `held.mjs` as `plane-held` until CONTROL-PLANE #11's R42 export merges (K918, B2); then `held.mjs`, `HELD` and their uses go, and `STEP_ORDER` ranks `control-plane` where `HELD` ranks.
- **Deferred:** deleting `src/index.mjs` (R8), N463 (B2): `test/m/capture-requests/plane.test.mjs` and `test/m/scheduler/plane.test.mjs` still read it and neither module has a T20 job.
- **Next step if restarted:** read the inbox for BOB's CHANGE on control-plane's merge.

## J1 · QUESTION

Re-scan at start (tranche/T20 @ 8fb87be1a5), two items; I carry on with the rest on my best reading.

(1) The step. record-core (R74), membership (R96), run-productions (R20), inquiry (R52 (1), (2): `Inquiry.COUNT_KEYS`/`counts`, `inquiryLegGrades`), basis-versions (R47), observation-log (R32) and connections (R61, `refsCounts`) have exported and merged. control-plane's R42 step has not: its job (CONTROL-PLANE #11) started and has no commit yet. Best reading: its START says "merge before plane's T20 job", so I switch the figures and the leg grades now and wait for its merge to switch the step, rather than re-housing the step in my own file. If you would rather I close without it, I keep it held in my stats file under plane's name with R10's clause, and say so.

(2) `src/index.mjs` readers still there besides the four instance-setup tests BOB named (instance-setup's job is running): `test/m/capture-requests/plane.test.mjs`:17–:18 and `test/m/scheduler/plane.test.mjs`:17–:18 (`join(SRC, "index.mjs")`, SRC = `bio-plane/src`, i.e. the re-export) — neither module has a T20 job; and ~30 old suites under `bio-plane/test/` (e.g. `content-extent-arms.test.mjs`:102, `observation-log.test.mjs`:418, `nc-rec129.mjs`:36, `mint-ledger.test.mjs`:144), which legacy-tests deletes last (K879). promotion's write-path probe is already re-pointed (K867). Best reading: the deletion of `src/index.mjs` waits until capture-requests', scheduler's and instance-setup's tests are re-pointed to `src/plane/index.mjs` (one line each); the old suites are not test/m and go with legacy-tests, so they do not hold it. Which modules re-point the two, and when?
