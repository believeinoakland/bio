# capture (T47)

**Status** · session_01KkTk4cfHC6cNK5LX8VR99u · depth 2 · WORKING · handled B1

## Completion (CAPTURE #30, session_01KkTk4cfHC6cNK5LX8VR99u)

**Restart.** The record's Status line named session_011naTtV4rRTduD7pKYGh6AV (it ran `mail start` only); the plan's Jobs line names this session as CAPTURE #30, so it re-ran `mail start` and took B1 from the inbox. That earlier session left no other commit.

**Read (P20, mechanics §6 step 2; §17).** Read whole myself: `build/requirements/capture.md` (public and private) and the module's code, all of it (`src/capture/index.mjs`, `ops.mjs`, `schema.mjs`, `grammar.mjs`, `checks.mjs`). The reading set measured 1,013 KB at START, over the limit, so two helpers in this session read the rest whole and each wrote me a digest citing every section (K2032, mechanics §17 (3)). The first covered the module's tests: all 21 files in `test/m/capture/`, `cap13-reuse-pages.test.mjs` and `d57selflink.test.mjs`. The second covered the public parts (Purpose and Provides) of provenance, membership, record-core, acquisition, record-grammar and test-support, layer 3's contract and the general rules in `build/layers.md`, and the provenance code behind R48 and `captureGrade`. The sources stayed binding: I re-read each passage I relied on (`register`'s schema, `captureGrade`, the held and archive tests, the grammar test's bundle).

**Entries applied (T47-11, with T47-13's N983 half, K3033).**
- **R77 amended (N979).** Each held row (an archive's row included) now answers `capture: {sha256, grade}`.
  - `sha256` is the register's capture under the document: the first registered, compared as an instant with `julianday`, so a whole-second spelling and a millisecond spelling of the same second order alike; ties go by digest.
  - `grade` is `provenance.captureGrade`'s answer, whole. It is null when provenance does not answer: no such method, a throw, or a promise.
  - A document with no registered capture answers `capture: null`.
- **R88 new (N969).** `heldCaptures` takes `state`.
  - `held` is the default; absent or empty reads as `held`. `set_aside` lists documents whose latest act is a set-aside, built by the same WHERE builder. So sight, filters, sorts, bound, row fields and archive grouping are all R77's.
  - Each set-aside row carries `set_aside: {reason, author, at}` from its latest set-aside.
  - Any other value is the required-argument refusal naming `state`, with shape `held | set_aside`.
  - The answer echoes `state`. `op=heldcaptures` passes the query's `state`. A new export, `HELD_STATES`, lists the two values.
- **R89 new (N971).** It was already met: `grammar.mjs` exports `INFORMATION_GRAMMAR` frozen, and `index.mjs` re-exports it with `checkInformationExtension`. A test now names it.
- **R90 new (N983, K3027).**
  - `captureOf` takes `now`, the clock: a function answering epoch milliseconds, `Date.now` by default. It is adopted and compared as R58 states: a default is adopted from the first caller that supplies one, and another function is refused with a throw naming `now`.
  - `sourceReachability` with no `now` is judged at that clock. A clock that throws, or answers a non-finite value, reads `Date.now`.
  - The `sourcereach` route no longer reads the request's `now`.
  - An in-plane caller's own `now` is honoured as before (monitoring's tests are unchanged and pass).

**Re-pinned.**
- `held.test.mjs`'s whole-row comparison of INFO-1 gains `capture` (the fixture's stand-in has no `captureGrade`, so `grade: null`).
- The fixture's stand-in `register` table gains provenance R48's `registered` column, defaulted, and `register()` takes it.

**Flaws in my own module.** None found beyond the work above. Comments only: the header's requirement list now ends at R90.

**Deferred.** Nothing.

**Found in other modules (also in my REPORT).**
- (a) `provenance` R1: re-registering a capture under the same bundle updates `register.registered`. That makes R77's "the one first registered" read as "last (re-)registered" for a revised capture. Provenance R48 does not say which. Its owner, or BOB, may want R48 to state it.
- (b) `capture-requests`' `plane.test.mjs` "R48 in the plane …" fails intermittently when the whole module suite runs: once in four runs, and it also failed once on the tranche's code without my change. It passed in six runs alone. Load-dependent, not caused by this job.
- (c) Inherited reds, identical with and without my change: op-declarations has 9 failing tests, affordances has 2.
- (d) Generated artifact: `src/capture/index.mjs` changed, which stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), regenerated at the layer close. I did not write it.
- (e) For `screens-intake` (L11): R77's `capture` and R88's `state=set_aside` are ready. Its own tests pass unchanged (42/42). `affordances`' help for `heldcaptures` may name `state`.

**Tests and checks.**
- New file `test/m/capture/t47.test.mjs`, 14 tests. They name R77 (4 tests), R88 (5), R89 (1) and R90 (4), and every refusal has a control.
- Mutation checks, each restored afterwards: putting the request's `now` back into the route turned R90's test red, and ordering `registered` as text turned R77's ordering test red.
- `node --test bio-plane/test/m/capture/` → tests 142, pass 142, fail 0.
- `node bio-plane/test/cap13-reuse-pages.test.mjs` → 22 pass, 0 fail.
- `node bio-plane/test/d57selflink.test.mjs` → 24 pass, 0 fail.
- No layer tests are named in the manifest.
- The users of the changed services pass, or fail only as on the tranche's code:
  - screens-intake 42/42, monitoring 137/137, doorbell 69/69, ratification 233/233, sources 30/30, file-safety 55/55, setup-page 87/87;
  - capture-requests 107/108 (the flake in (b)), op-declarations 147/156 and affordances 243/245 (inherited, (c)).
- `node checks/format.mjs` → format: 165 modules, 164 requirements files; 0 failures
- `node checks/architecture.mjs … capture` → architecture: 28 product files, 112 relative imports (0 naming no tracked file, not judged); 0 failures
- `node checks/coverage.mjs … capture` → coverage: 1 modules, 43 of 43 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … capture tranche/T47` → ownership: 5 files changed by capture between tranche/T47 and HEAD; 0 failures
- `node checks/run.mjs` (K2950):
  - format: 0 failures;
  - architecture: 3,064 product files, 9,355 relative imports; 0 failures;
  - coverage: 4,969 of 5,096; 44 failures, none of them capture's (other modules' T47 ids);
  - channels: 0 failures.

Size (session_01KkTk4cfHC6cNK5LX8VR99u): test runs 14, module lines 3253

## J1 · REPORT

Found outside capture (detail in my record): (a) provenance R1 updates register.registered on a re-registration under the same bundle, so R77's 'first registered' reads 'last (re-)registered' for a revised capture; R48 does not say which, so it may want stating. (b) capture-requests plane.test.mjs 'R48 in the plane …' fails intermittently under the full module suite (1 in 4 runs; it also failed once on the tranche's code without my change; 6/6 pass alone): a load-dependent flake, not this job's. (c) Inherited reds, unchanged by me: op-declarations 9 tests, affordances 2. (d) The capture/index.mjs change stales the plane bundle, regenerated at the layer close. (e) For screens-intake (L11): R77's capture and R88's state=set_aside are ready (its 42 tests pass unchanged); affordances' heldcaptures help may name state.
