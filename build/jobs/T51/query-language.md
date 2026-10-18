# query-language (T51)

**Status** · session_01FS8FKWSy2DYXTK38z1ksz2 · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T51-41 · query-language: done. Commit 73ccc0bb78 on job/T51/query-language.

Entries applied:
- T51-41 (K3807): the stale comment in `bio-plane/src/query.mjs` at the `op=searchfields` note named `civicos-ui`, deleted in T51-126. Restated without naming it: the measurement (2026-08-09, no non-test caller of `op=meaningrows`) is kept, and the surface that called `op=searchfields` is described as removed. No behaviour change; no code, test or requirement changed.
- BOB note 2 (retrieval R88 / parsed-query route): nothing asked of query-language; no change.

Deferred: none.

Found in other modules: none from this job's changes. The full suite (`node checks/run.mjs /home/user/bio`) reports 13 coverage failures in modules other than query-language (agent-harness R17; agent-runner R36 R37 R38 R40; agent-steps, all 49 ids; agent-worker R119; basis-versions R55; case-grammar R33; entities R57–R61; explore R26; journey-check R19; people R40 R41; progressions R46; retrieval-browse, all 18 ids; retrieval R87 R89 R90). Those are live ids named by no test in their modules; I did not touch them. Format and architecture are clean across the tree (3538 product files, 0 failures).

Tests and checks:
- `node --test test/m/query-language/` (in bio-plane): 56 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 174 modules, 172 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio query-language`: 10 product files; 0 failures.
- `checks/coverage.mjs /home/user/bio query-language`: 33 of 33 live ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio query-language tranche/T51`: 1 file changed; 0 failures.
- `checks/run.mjs /home/user/bio`: architecture 0 failures; coverage 13 failures, all in other modules (above); channels 0 failures.

Size (session_01FS8FKWSy2DYXTK38z1ksz2): test runs 1, module lines 3030
