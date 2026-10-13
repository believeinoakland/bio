# accepted-work (T47)

**Status** · session_01KFAPWox7MWHEahyqLXHMsA · depth 2 · RUNNING until 2026-10-13T20:06:18Z (users' tests (basis-versions … plane)) · handled B1

## Completion

**Read, whole:** `build/requirements/accepted-work.md`; the public part of record-core, record-grammar, membership, promotion and inquiry-grammar; layer 6's contract in `build/layers.md`; my entry T47-15 in `build/plan/current.md` (with its rules and T47-30's entry naming my R9); every file of my code (`index.mjs`, `checks.mjs`) and tests (fixture and six test files) (P20). No flaw found in them beyond the change below.

**Entries applied:** T47-15 (N947, K2949): R9.
- `registerAcceptedWork` takes an optional fifth function, `flagHistory`. A registration without it is accepted. One whose `flagHistory` is given but is not a function is refused `LISTENER_MALFORMED` through `membership`'s `listenerRefusal` (R1, R81), and nothing is registered.
- `flagHistoryOn({ref, edition, since, viewer})` answers the registered function's answer unchanged. It hands on only those four fields, `since` exactly as given. With nothing registered, or a registration without `flagHistory`, it answers `{absent: true}` (`accepted_work_absent`). When the function throws or answers a promise, it answers `{unreadable: true}`. It writes nothing and never throws, through the one `#read` R2 and R8 use.
- The absent detail for an optional function (`moves` or `flagHistory`) now names the read that is missing, not always the publisher moves.

**Tests:** new `flags.test.mjs` (5 tests naming R9). They cover:
- the registration being optional, with `LISTENER_MALFORMED` controls;
- the answer passed through unchanged, including a flag opened and cleared inside the interval and a flag cleared before `since` left out, in opening order, `cleared_at` null while open;
- the arguments handed on, with `since` given as a non-instant, a number or absent;
- absent; unreadable; never throws; writes nothing.

The fixture's stand-in gained `flagHistory` and `flag()`. R1's and R8's "three alone" tests now take `flagHistory` out as well. R5's interface list now includes `flagHistoryOn`.

**Deferred:** none.

**Found in another module:**
- As my requirements' Suggestions say, R9 answers `absent` in the composed plane until `case-import` registers `flagHistory`. That is already in T47-30's entry (N947, K3033), so there is nothing new to report.
- `plane` `test/m/plane/t46.test.mjs` R33 (the sign-in account's `suggestions` switch, line 209) is red with or without this job's change. I checked it with `src/accepted-work` reverted. It is not named in rule 5 here; it reads `credentials`' `accountReferenceState`, which is not mine.

**Tests and checks run:**
- accepted-work: `node --test test/m/accepted-work/`: tests 28, pass 28, fail 0.
- Users of the module (P11):
  - basis-versions pass 145 fail 0;
  - strength 143/0;
  - reevaluation 141/0;
  - case-carriage 80/0;
  - publication 141/0;
  - case-import 101/0;
  - conformance 109/0;
  - filings 97/0;
  - `test/system/migrate-released.test.mjs` 1/0;
  - answer-envelope 32/1: R8 `DISCLOSURE_DUE`, rule 5 (7b);
  - plane 221/2: R5, R9 project-roster ops, rule 5 (7c); R33 above, inherited.
- `node checks/format.mjs`: 166 modules, 164 requirements files; 0 failures.
- `node checks/architecture.mjs . accepted-work`: 9 product files, 24 relative imports; 0 failures. The full run's architecture also shows 0 failures.
- `node checks/coverage.mjs . accepted-work`: 9 of 9 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . accepted-work tranche/T47`: 0 failures.
- `node checks/run.mjs` over the product:
  - format 0, architecture 0 and channels 0 failures;
  - coverage 43 failures, all other modules' ids not yet met (rule 5 (1)), none of them accepted-work's.

Size (session_01KFAPWox7MWHEahyqLXHMsA): test runs 4, module lines 263
