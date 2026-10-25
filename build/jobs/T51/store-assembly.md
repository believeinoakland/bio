# store-assembly (T51)

**Status** · session_01PFCJP5a6GVyjzzsxKD2a53 · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three points; I carry on with my best reading of each.

1. **`modules.json` paths.** My row has `paths: []`, `tests: []` (K1043: empty until the job's COMPLETE); your START says BOB adds them. The ownership check fails any job change to `build/modules.json`, and coverage, architecture and test-support's `declaredOpsOf` all read the paths. Best reading: I do not edit `modules.json`; you add `paths: ["bio-plane/src/store-assembly/"]`, `tests: ["bio-plane/test/m/store-assembly/"]` on the tranche (before or at my COMPLETE), and I merge it. Until then I run the checks over an uncommitted local copy of the file that lists them.

2. **`DECLARED_OPS` during the copy window (K5052 (4)).** The same collision hits `declared.mjs` (ask, readtranslate, owedwork) as `owner-ops.mjs`: once my paths are listed, `declaredOpsOf` (`test/declared-ops.mjs:92`, `^export const DECLARED_OPS`) finds those three in both plane and store-assembly. Best reading: neither copy has an `export const DECLARED_OPS` line until Wave B. The rows are held under internal names (`ASSEMBLY_DECLARED_OPS` in `declared.mjs`, `OWNER_MAP_DECLARED_OPS` in `owner-ops.mjs`), and my `declarations.mjs` registers both under `store-assembly` in its `OWNERS`, so the world's assembled table is production's (plane's 3 rows plus control-plane's 4). Wave B renames both to `DECLARED_OPS` when plane and control-plane delete theirs. Because a registration happens once per process (op-declarations R81), the route-map parity test builds plane's `Store` in a child process and compares the key lists.

3. **What only Wave B can meet.** R98 (plane and control-plane hold none of the files) and R1's "the Durable Object class calls it", plus R99's census of plane's imports, cannot hold while plane keeps its copy. Best reading: I write R99's test against my export list and against plane importing no file of mine by path, which holds now. I leave R98 and R1's class clause unmet, listed as deferred to Wave B in my record, with no test that passes falsely. Coverage then names R98 red, and you accept it by name until plane's Wave B job. If you want R98 tested now instead, say how.

## J2 · QUESTION

**The owed-work ledger keeps the wall clock, so a world's `tick` never reaches an owed row.** `pending.mjs` (plane's and my copy, `pendingOf(ctx, {env, store, deliver})`, `:214`) is handed no `now`, so it stamps `registered_at`, `due_at` and back-offs with `Date.now()`. The scheduler's firing then asks it with the instance clock: `onAlarm(now)`, and `tick(at)` keeps the rows with `due_at <= at`. In the world the clock is pinned at `WORLD_NOW` (2026-10-01) and moved only by `tick` (R93), so every row registered in a world is due at the wall's 2026-10-25 and never comes due. A screens or `store-request` test that drives an owed row by `tick` (R93: "an owed row") would wait forever. In production `BIO_NOW_MS` is unset, so both clocks are the wall and nothing differs; the mismatch is under R-CLOCK only.

Best reading, which I am carrying out unless you say otherwise: the assembly hands the ledger its R5 clock for instants, `pendingOf(ctx, {..., now: () => nowMs(null)})`. `pendingOf` already takes `deps.now` and reads it everywhere it stamps. The cost: under a pinned clock a run's measured times (`last_ms`, `own_ms`, `wait_ms`, R71) read 0 while the clock stands still, where today they read the wall's elapsed time. Production is unchanged, and so are plane's tests and copy. If you would rather keep the measured times off the pinned clock (a second, wall clock for durations alone), that touches about ten lines of `pending.mjs`; say so and I'll do that instead.

## J3 · REPORT

Five items for you; none blocks my building, and items 1–2 decide whether my checks can read green at COMPLETE.

1. **Four `uses` edges, test-only (architecture check, 5 failures).** Tests copied from plane import these earlier modules, all already in plane's `uses`:
   - `case-grammar`: `g54-seed.mjs`, `materialsLines`;
   - `answer-envelope`: `g54-sweep.test.mjs`, the published plane's binding helpers;
   - `connection-grammar`: `t33.test.mjs`;
   - `signatures`: `watch.test.mjs`, `sshsig.mjs` and `scripts/sign-sshsig.mjs`.

   Best reading: you add the four to store-assembly's row in `modules.json` at the merge, with the paths (K5125). I carry on as if added.
2. **`words-reads.json` has no `store-assembly` list (words check, 15 failures).** The 15 are the copied strings that plane's list marks `unkeyed`: `ask.mjs`' BAD_TASK details and malformed-request details, `wiring.mjs`' three, `wizards.mjs`' `screenFailures` problems. R95 makes the list's regeneration yours, at the design commit; the file is the design stream's. Until then the words check is red by name for store-assembly with exactly plane's unkeyed set, and `words.test.mjs` (R95) reads plane's list.
3. **A red that predates this job.** `release.test.mjs`' R23 words test fails, as plane's original does: the words list lacks `screen.objective.purpose`. It is the design's (words.json), not this module's; my suite is 373 pass, 1 fail (this), 2 todo (R1's class clause and R98, per K5125).
4. **The case-file sweep in a world.** R70's consumer builds an edition's case file through public-read's published plane, which is bound only by plane's `index.mjs` (`bindPublishedPlane`) in the isolate. A world (no Worker) has it unbound, so the sweep cannot build there unless a test binds it, as my `g54-sweep.test.mjs` does with answer-envelope's real helpers and the store's own namespace. This is for `store-request`'s world door, or public-read, to decide; I changed nothing.
5. **Fixture contracts stay plane's in the copy window.** The users' `fixtures-contract: plane <id>` markers (job-registrar, keep-later, owed-later, owed-ledger) name plane, so plane keeps `r10-fixtures-run.test.mjs`; I did not copy it, since the runs would be orphans here. They move to store-assembly when Wave B re-points the users. My copies of plane's ledger tests carried plane's open FIX-E and CODE lines (part-4 §plane); a worker is re-pointing mine to the providers' published fixtures now, so store-assembly's fixtures count reaches 0.
