# store-assembly (T51)

**Status** · session_01PFCJP5a6GVyjzzsxKD2a53 · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three points; I carry on with my best reading of each.

1. **`modules.json` paths.** My row has `paths: []`, `tests: []` (K1043: empty until the job's COMPLETE); your START says BOB adds them. The ownership check fails any job change to `build/modules.json`, and coverage, architecture and test-support's `declaredOpsOf` all read the paths. Best reading: I do not edit `modules.json`; you add `paths: ["bio-plane/src/store-assembly/"]`, `tests: ["bio-plane/test/m/store-assembly/"]` on the tranche (before or at my COMPLETE), and I merge it. Until then I run the checks over an uncommitted local copy of the file that lists them.

2. **`DECLARED_OPS` during the copy window (K5052 (4)).** The same collision hits `declared.mjs` (ask, readtranslate, owedwork) as `owner-ops.mjs`: once my paths are listed, `declaredOpsOf` (`test/declared-ops.mjs:92`, `^export const DECLARED_OPS`) finds those three in both plane and store-assembly. Best reading: neither copy has an `export const DECLARED_OPS` line until Wave B. The rows are held under internal names (`ASSEMBLY_DECLARED_OPS` in `declared.mjs`, `OWNER_MAP_DECLARED_OPS` in `owner-ops.mjs`), and my `declarations.mjs` registers both under `store-assembly` in its `OWNERS`, so the world's assembled table is production's (plane's 3 rows plus control-plane's 4). Wave B renames both to `DECLARED_OPS` when plane and control-plane delete theirs. Because a registration happens once per process (op-declarations R81), the route-map parity test builds plane's `Store` in a child process and compares the key lists.

3. **What only Wave B can meet.** R98 (plane and control-plane hold none of the files) and R1's "the Durable Object class calls it", plus R99's census of plane's imports, cannot hold while plane keeps its copy. Best reading: I write R99's test against my export list and against plane importing no file of mine by path, which holds now. I leave R98 and R1's class clause unmet, listed as deferred to Wave B in my record, with no test that passes falsely. Coverage then names R98 red, and you accept it by name until plane's Wave B job. If you want R98 tested now instead, say how.
