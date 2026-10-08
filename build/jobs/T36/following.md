# following (T36)

**Status** · session_01RzHpXRzbChU2C1fk3rBD1t · depth 2 · COMPLETE · handled B1

## Completion (FOLLOWING #4)

**Reading set (mechanics §17).** Measured as §3 asks: my requirements 15 KB, my code and tests 166 KB, each used module's Purpose (15 modules, about 8 KB) and the services my Uses names (`monitoring` `sweepHost`, `standards`' policy reads, `acquisition`'s capture arm, `civil-time`/`record-grammar` instants), with `bias` R44 (cited by R21): about 200 KB, under 300 KB. Read whole myself: `build/requirements/following.md`, layer 10's row of `build/layers.md`, every file under `bio-plane/src/following/` and `bio-plane/test/m/following/`, my plan entry (T36-44), the plan's rules at the opening, K2129, K2038, K1727, K1740 and the draft's following section. No workers used.

**Entries applied.** T36-44 (N741, K2038, K2129): R21 `policyChanges({after?, since?, limit?, viewer})`. With `since`, only changes whose later capture's instant is at or after it are answered; the order, `after`, `limit` and `cursor` are unchanged (the window is a SQL bound, so a reader reaches the window's start without paging through older changes). `since` is read as `bias` R44 reads one: ms since the epoch, or a string `Date.parse` reads (record-core R48's readable instant), taken as the first whole second at or after it, since every later capture is stamped to the whole second. A `since` that is not an instant (an empty or unreadable string, NaN, Infinity, an object, a boolean) answers `{ok: true, changes: [], cursor: null, since_invalid: true, note}`; an absent (null) `since` sets no window.

**Deferred.** None.

**Other modules.** Nothing found. The `*(not yet met: T36)*` marker on R21 is BOB's to remove from the requirements at merge.

**Tests and checks.**
- `node --test bio-plane/test/m/following/`: tests 50, pass 50, fail 0 (new: "R21 with since …", 460 changes over 5 policies, the window of 210 read across pages of 200 and of 7, the boundary inclusive, a fraction past a second excluding it, ms accepted, sight kept, nine invalid forms answering `since_invalid`).
- Layer tests: none named in `build/manifest.md`.
- Users' tests (scheduler, affordances, notice-producers, op-declarations, answer-envelope, control-plane, plane with `system/migrate-released.test.mjs`), run on this branch and on its base in a separate worktree: identical results, 781 tests, 13 fail in both, all inherited reds by rule 5: affordances 2 (reds 19, 20), op-declarations 3 (13, 17), answer-envelope 2 (11, 18), control-plane 4 (22, 23, 24, 26), plane 2 (27). scheduler 95/95, notice-producers 61/61, migrate-released 1/1.
- `node checks/format.mjs`: 135 modules, 134 requirements files; 0 failures.
- `node checks/architecture.mjs … following`: 14 product files, 42 relative imports; 0 failures.
- `node checks/coverage.mjs … following`: 21 of 21 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … following tranche/T36`: 3 files changed by following; 0 failures.

**P6.** 1,336 module lines (source), under 4,000.

Size (session_01RzHpXRzbChU2C1fk3rBD1t): test runs 5, module lines 1336
