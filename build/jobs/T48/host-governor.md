# host-governor (T48)

**Status** · session_018WszZPFcBb984RMAWXHUB2 · depth 2 · COMPLETE · handled B1

## Completion

**Read, whole:** `build/requirements/host-governor.md`; the public part of `record-core` (my one Use); layer 3's contract and the layer-3 sections of `build/layers.md`; my entry T48-13 in `build/plan/current.md`; and all of my code (`index.mjs`, `schema.mjs`) and tests (`fixture.mjs`, `governor.test.mjs`, `holding.test.mjs`, `ops.test.mjs`), as P20 asks. I found no flaw in the module's code or tests to fix in this job.

**Entry applied:** T48-13 (N1052; K3192, K3195), test only. The shared `before` in `ops.test.mjs` now signs each enrolled member in with `{handle: id, password}` instead of `{role: "member:<id>", password}`, and signs the founder in with `{handle: "admin", password}`. That is how membership's sign-in has worked since T47. Before the change, all 12 of the file's plane tests failed in `before` (`login ruth: SIGN_IN_REFUSED`). No code changed, and no requirement or assertion changed.

**Deferred:** none.

**Found in another module:** nothing. No generated artifact is made stale, because only a test file changed.

**Tests and checks run:**
- `node --test test/m/host-governor/` (in `bio-plane/`): tests 43, pass 43, fail 0, skipped 0. Before the change: 31 pass, 12 fail.
- I did not run any user's tests, since no service changed.
- `node checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
- `node checks/architecture.mjs … host-governor`: 6 product files, 11 relative imports; 0 failures.
- `node checks/coverage.mjs … host-governor`: 28 of 28 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … host-governor tranche/T48`: 1 file changed; 0 failures.
- `node checks/run.mjs` over the product:
  - format, architecture and channels: 0 failures each (architecture: 3276 product files; 0 failures for mine or any).
  - coverage: 46 failures, none of them host-governor's (other modules' ids not yet named, e.g. queue R54, screens-*).

Size (session_018WszZPFcBb984RMAWXHUB2): test runs 2, module lines 435
