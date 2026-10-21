# cause-stale-T51 (T51)

**Status** · session_01VVenL6MJ6dcy8qFSYYxGwR · depth 2 · COMPLETE · handled B1

## Completion record (cause job, START B1; FR starts-T51-FR/cause-stale-T51.txt)

**Entries applied**
1. **affordances, seven reds** (R12, K4279 reading: a NON_ACT carried ungated is not stale; carried by no row it is). Each red read is a NON_ACT only (checked by probing `unaccounted` with the owners registered; none is in RUNGS or RUNG_ABSENT), so each assertion now reads `!stale.includes(op)` for the ungated read, with an `unaccounted([])` control that the op is stale when no row carries it, as in 64d77a9741:
   - `catalogue.test.mjs`, N345's ops (`publishtensions`), titled "R1 R12 R24: N345's ops …";
   - `catalogue.test.mjs`, actionhold (`projectholds`);
   - `catalogue.test.mjs`, T23's ops (the loop over `T23_READS` and `T23_PUBLIC`; title reworded to "an ungated read is not stale (K4279) …");
   - `catalogue.test.mjs`, case-inputs (the NON_ACTS loop now `!stale` for each op a NON_ACTS row names, carried ungated);
   - `catalogue.test.mjs`, case-import (the `IMPORT_READS` and `IMPORT_PUBLIC` loop; its negative-control comment reworded);
   - `t31.test.mjs`, wizard-scripts (the `WIZARD_READS` loop, with the no-row control added);
   - `t34.test.mjs`, publishat (`publishschedule`, with the no-row control added).
2. **op-grades R44** (`test/m/op-grades/words.test.mjs`): the written count `11` is gone. The test now checks the consequence keys are in the `reads` list (`words-reads.json`, 37 keys), that each list key is `hasWord`, that each list key is held by one of the module's exported maps (as the key or its sentence), and that each word a map holds as a key is in the list. The 37 keys are the 11 consequence keys plus 26 `act.*.does`, `*.declared.*` and `screen.*` keys that the module draws through `word(...)` in its rows (`index.mjs`); all 37 are held by the maps, which the probe confirmed. No member operation and no requirement line changed.

**Deferred:** none in these modules. The R44 requirement's parenthetical "(11 keys at fa3c8b7e8e)" is now stale as a number. I left it, since the count sits in the requirement and this job changes no requirement line; BOB decides whether to reword it.

**Found in another module (not changed):** the full run reports four coverage failures in modules this job does not hold: `agent-harness` names no test for R17; `agent-runner` for R37, R38, R40; `installer-steps` for R26, R31; `journey-check` for R19. Their diffs are outside this job's paths.

**Tests and checks** (`node --test --test-force-exit`; at most two suites at once)
- `bio-plane/test/m/affordances/*.test.mjs`: before the change 281 tests, 274 pass, **7 fail**; after: 273 tests, **273 pass, 0 fail**. The test count fell by 8 with no `test(` line added or removed in the diff (the node runner's count, not checked further).
- `bio-plane/test/m/op-grades/words.test.mjs`: before, the R44 test failed ("37 !== 11"); after, all 3 pass.
- `bio-plane/test/m/op-grades/*.test.mjs`: **142 pass, 0 fail**.
- `node checks/format.mjs bio`: 175 modules, 175 requirement files, 0 failures.
- `node checks/architecture.mjs bio`: 3917 product files, 0 failures (the product-wide architecture run).
- `node checks/coverage.mjs bio affordances`: **54 of 54** live ids named. `node checks/coverage.mjs bio op-grades`: **51 of 51**.
- `node checks/ownership.mjs bio <module> tranche/T51`: run for `affordances` and `op-grades`; the diff lies in each module's paths and tests. The one file it lists outside is this job record, which the check does not allow for a single held module. The comma form (`affordances,op-grades`) is refused with "no such module" by this checker, so BOB's cause-job run should use its own form (§5.5).
- `node /home/user/civicos-process/checks/run.mjs /home/user/bio`: the four coverage failures above; channels and words pass.

Setup: `npm ci` in `file-scanner`, `bio-plane/src/journey-check`, `sheet-worker`, `agent-runner` and `site` (each has a lockfile and lacked `node_modules`, K4113).

Size (session_01VVenL6MJ6dcy8qFSYYxGwR): test runs 6, module lines 50 (34 added, 16 removed across four test files).
