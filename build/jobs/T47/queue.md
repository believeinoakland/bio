# queue (T47)

**Status** · session_01LGyJtZ45XatgTxY114jhrD · depth 2 · COMPLETE · handled B1

## Completion (QUEUE #24, session_01LGyJtZ45XatgTxY114jhrD)

**Read (P20, mechanics §6 step 2; §17).** Read whole myself: `build/requirements/queue.md` (public and private) and the module's code, all of it (`src/queuestate.mjs`, `src/queue/index.mjs`, `door.mjs`, `checks.mjs`, `schema.mjs`), and `capture` R58 and R90, whose rule R53 cites (with capture's T47 commit implementing it). The reading set measured 1,110 KB at START, over the limit, so a helper in this session read the module's tests whole (all 23 files in `test/m/queue/`, `conclude-project.test.mjs`, `docdates.mjs`) and wrote me a digest citing each file and line (K2032, mechanics §17 (3)): which tests send `now` through a request, which call `queueOf` twice on one storage, which pass `nowMs` in-plane, and the ids each names. The used modules' public parts were not needed beyond the two services R53 names (`queue-producers` R8 and `notice-producers` R1 take `now`; unchanged). I re-read `world.mjs` and `door.test.mjs` myself before changing them.

**Entry applied (T47-73; N983, K3027).** R53:
- `queueOps`' `queue` arm no longer reads the query's `now`; nothing reads a body `now` there.
- `door.mjs`' `queueFeedOp` no longer passes a caller's `now` to the store (only `limit` and `sort`).
- `queueOf`'s option `now` (a function answering epoch ms) is the module's clock: kept from the first caller that supplies it, adopted from a later caller when none was supplied, and a later caller's other function refused by a throw naming `now` before anything changes (capture R90's rule). A call supplying no `now` is no comparison.
- `queueFeed({nowMs})` from an in-plane caller is honoured as before; every item's `age`, `due` order, snooze (R40), `resolved` window and the producers' `now` are judged at the one instant.
- A clock that throws or answers no finite instant reads the wall clock, never the epoch.
- Default clock: see J1 (open). On my stated reading the instance binding `env.BIO_NOW_MS` stays behind an unsupplied clock, as before; production binds none, so it is `Date.now` there. If BOB answers otherwise the change is one line and its test.

**Flaws in my own module, fixed.** `queuestate.mjs`: the REC-124 comment had drifted above the N172 kind instead of `shared-inquiry-concluded-by-another-project`, which it explains; moved. The T41 comment's gendered wording about a member made neutral.

**Deferred.** Nothing.

**Found in other modules.** None caused by this job. Inherited reds, identical with and without my change (stash run): `test/m/plane/` 5 of 223 fail (case-import R17, project-roster R5/R9, case-account R38, the T45 registrations R39, credentials/agent-worker R33). Generated artifact: `src/queue/*` changed, which stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), regenerated at the layer close; I did not write it. No user of a changed service: `queueOf`'s callers (`plane/store.mjs`, `plane/watch.test.mjs`) pass no `now`.

**Tests and checks.**
- New `test/m/queue/clock.test.mjs`, 4 tests naming R53: the control (a `now` a year ahead in the query or the body answers deep-equal to none; the clock moved answers differently); an in-plane `nowMs` honoured; adoption, sameness and refusal of `queueOf`'s `now` (a refused call adopts nothing); a faulty clock reads the wall clock. `door.test.mjs`' R6/R37 test now also names R53 and holds that `now` is not passed on.
- `node --test test/m/queue/ test/conclude-project.test.mjs` → tests 147, pass 147, fail 0.
- `node --test test/m/plane/` → tests 223, pass 218, fail 5 (inherited, above; same 5 on the tranche's code).
- No layer tests are named in the manifest.
- `node checks/format.mjs` → format: 168 modules, 167 requirements files; 0 failures
- `node checks/architecture.mjs … queue` → architecture: 30 product files, 90 relative imports (0 naming no tracked file, not judged); 0 failures
- `node checks/coverage.mjs … queue` → coverage: 1 modules, 43 of 43 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … queue tranche/T47` → ownership: 6 files changed by queue between tranche/T47 and HEAD; 0 failures
- `node checks/run.mjs` (K2950): format 0 failures; architecture 3,125 product files, 9,565 relative imports, 0 failures; coverage 5,059 of 5,192, 24 failures, none of them queue's (other L11 modules' ids); channels 0 failures.

Size (session_01LGyJtZ45XatgTxY114jhrD): test runs 5, module lines 3095

## J1 · QUESTION

R53 says the clock is `queueOf`'s option `now`, "`Date.now` by default". Today, with no `now` given, queue falls back to the instance binding `env.BIO_NOW_MS` before the wall clock (as tasks, actions, action-holds, network-notices and progressions do), and plane tests (`test/m/plane/watch.test.mjs`, `docket.test.mjs`, `accepted.test.mjs`) set the whole store's clock through that binding.

My best reading, on which I am carrying on: the default clock is the server's own, i.e. `env.BIO_NOW_MS` when the instance binds it, else `Date.now`. The binding is server-side configuration, never request-borne, so R53's point (no instant from the request) holds; production binds none, so the default is `Date.now` there. If you mean `Date.now` strictly (the binding no longer read by queue), say so and I will drop it; the plane tests would then judge queue ages at the wall clock.

Not blocking: the rest of the job (route ignores `now`, door stops forwarding it, `queueOf` adopts and compares `now`) does not depend on the answer.

## J2 · COMPLETE

T47-73 applied: R53 met (op=queue judged at queueOf's clock; route and door pass no request now; queueOf adopts/compares now as capture R90). Record's Completion section has tests and checks: queue 147/147; checks 0 failures for queue; plane's 5 inherited reds unchanged. J1 (default clock: BIO_NOW_MS kept behind an unsupplied clock) is still open; an answer otherwise is a one-line change. Generated plane bundle stale (layer close regenerates).
