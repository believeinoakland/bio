# capture (T20)

**Status** · session_015soMeRVHoEuTpMbyTVTmi8 · depth 2 · COMPLETE · handled B1

## Completion (CAPTURE #12)

**Entry applied** (B1; `build/plan/current.md` T20 L3, K846, K861 (6); plane R8): `bio-plane/test/m/capture/plane.test.mjs`:13 `SRC` (Miniflare's `scriptPath` and `script`) re-pointed from `../../../src/index.mjs` to `../../../src/plane/index.mjs` (plane R6's entry). The header's mention of `src/index.mjs` (:2) is history and stays. No product code changed.

**Re-scan of `test/m/capture/`** for any other read or import of `bio-plane/src/index.mjs`: none. `relays.test.mjs`:35's `store.mjs:10:5` is a fixture string (left, as B1 says). `evidence-absent.test.mjs`:77 walks the whole `src/` directory (R63's sweep, asserting over 100 files), so deleting the one-line `src/index.mjs` leaves it green. The other `index.mjs` hits are module entries (`src/<module>/index.mjs`) or comments.

**Merge order:** this branch carries nothing that waits; ready to merge before plane's T20 job (L11) deletes `src/index.mjs`.

**Deferred:** nothing.

**Found in other modules:** none. **Generated artifacts staled:** none (a test path only; no bundler input changed).

**Tests and checks:**
- `node --test test/m/capture/plane.test.mjs` (in `bio-plane/`): tests 2, pass 2, fail 0, against `src/plane/index.mjs`.
- `node --test test/m/capture/` (in `bio-plane/`): tests 94, pass 94, fail 0, skipped 0.
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `checks/architecture.mjs … capture`: 19 product files, 78 relative imports; 0 failures.
- `checks/coverage.mjs … capture`: 48 of 48 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … capture tranche/T20`: 1 file changed; 0 failures.

Size (session_015soMeRVHoEuTpMbyTVTmi8): test runs 2, module lines 1

## J1 · COMPLETE

B1 applied: bio-plane/test/m/capture/plane.test.mjs:13 SRC re-pointed to ../../../src/plane/index.mjs; re-scan of test/m/capture/ found no other read of src/index.mjs (evidence-absent.test.mjs:77 sweeps all of src/, unaffected). No product code; no artifact staled; nothing found elsewhere. plane.test.mjs 2/2 against src/plane/index.mjs; test/m/capture/ 94 pass 0 fail; format, architecture, coverage (48/48), ownership (1 file) all 0 failures. Branch job/T20/capture @ 04002bcd8a ready to merge before plane's L11 job. Record: build/jobs/T20/capture.md.
