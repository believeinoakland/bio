# monitoring (T23)

**Status** · session_01YcGTGLceU7FuKo6wgFMjYL · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

**Size (P6), before building.** monitoring is 3,077 lines today (`index.mjs` 2,728, `checks.mjs` 199, `schema.mjs` 150). My estimate of R53–R64 as required: the linear-time matcher (R54: a parser for the regular-expression subset with classes, alternation, counted repetition, anchors, case folding, and a Thompson NFA simulation) about 350; C-18.5's sweep arm (R53, R54's refusals) about 130; R55's fence (diff of `sweeps[]` against the live image, owner and member tests, the ratifier read from history) about 130; the run (R56–R60: due, wake, tick, seeds, link extraction from HTML, feeds and sitemaps, the match, skips, filing at `collected`, backlog, anomaly, silence) about 500; reads and conditions (R61, R63, R30's slate) about 150; R64 about 50; tables and three rows about 70. Total about 1,380, so the module would reach about 4,450, past 4,000.

**My best reading, and what I do meanwhile:** I build the sweep in its own files under my path, `bio-plane/src/monitoring/sweep.mjs` (the run, reads, conditions, R55, R64) and `bio-plane/src/monitoring/sweep-match.mjs` (the matcher, pure, no record access), with the tables in `schema.mjs` and the rows in `checks.mjs`, the class `Monitoring` delegating to them, so a split is a move of two files and their tests. I carry on with the matcher and C-18.5 first (about 500 lines, taking the module to about 3,580), and stop before passing 4,000 unless you answer first.

**Question:** split the sweep out as its own module (your act), or accept monitoring past 4,000 with the sweep in those two files? If split: under what id and paths, so I write to them.

## Completion

**Entries applied** (B1, `build/plan/current.md` T23 layer 10: monitoring, the link sweep; K1019, K1036, K1044, K1094, K1114, K1122, K1129, K1140; B2, K1159). R29, R31 (the sweep items), R36 (the sweep arm) and R53–R64 met, each named by a test with negative controls.
- **Where it is** (B2: built so that N506's split into `link-sweep` is a move): `bio-plane/src/monitoring/sweep-match.mjs` (R53's scope rule `inScope` and R54's matcher, pure: a parser for the regular-expression subset and a Thompson NFA simulated over the text, never JavaScript's `RegExp`; the program is bounded at 4,000 states and counts at 100, so a term's time is linear in its text); `bio-plane/src/monitoring/sweep.mjs` (the class `Sweeps`: R55's fence and the ratifier read from the bundle's history, R56's due, wake and tick, R57–R60's run, R61's read, R63's conditions, R30's due sweeps, R64's scope check, and `linksOf`, the one-pass link reader for HTML, feeds and sitemaps); `checks.mjs` (C-18.5's sweep arm, R53, R54); `schema.mjs` (`sweep_runs`, `sweep_filed`, both declared to purge by the sweep's bundle). `Monitoring` keeps every public name and delegates: `sweepDue(now)`, `sweepWake(now)`, `sweepTick(now, rank)`, `sweeps({viewer, now})`, `sweepConditions({viewer, now})`, `registerSweepScope()`; the ops map gains `sweeps`.
- **New rows**, each `awaiting stamp` until T24's L2 (red 7): C-18.16 `SWEEP_TERM_REFUSED` (`index.mjs` `gatheringCheck` > `is-sweep-term`), C-18.17 `SWEEP_NOT_A_MEMBER` and C-18.18 `SWEEP_RATIFY_NOT_AN_OWNER` (`sweep.mjs` `sweepFence` > `is-sweep-member`, `is-sweep-owner`), in the family `SWEEP_CHECKS`, which `MONITORING_CHECKS` includes.
- **Readings of mine** (no question needed):
  - A term refusal is answered `SWEEP_TERM_REFUSED` (its row) with every C-18.5 finding beside it; any other C-18.5 error is still `GATHERING_REFUSED`.
  - R55's project is `record-core.bundleInfo`'s; for a bundle's first promotion, the document's own `project`. "Setting `ratified` to `false`" admitted from anyone is a change whose only difference is `ratified` true to false.
  - R56's closed test asks `project-stage` as the daemon; only a recorded `closed` stops a sweep (an undetermined stage does not).
  - A held or paused sweep is looked at again one archive interval on (`sweepWake`), as R19's paused cadence is.
  - A seed's bytes are filed in the sweep's bundle by a mechanical promotion with operation `sweep` (its field set is empty: nothing in `bundle.md` moves), as R9 files a tick's.
  - A governed fetch (seed or candidate) spends none of the budget and is looked at as governed. A candidate whose fetched bytes the record already holds is counted `already_held` and not filed.
  - R60's anomaly: "at least 4 runs exist" counts the run being recorded; the median is of up to the 8 runs before it. `sweep-held-backlog`'s `since` is the last run's instant (nothing stores when a hold began).
  - R64's count of requests: register documents whose origin names the sweep, whose `deeming_actor` is not this module's, retrieved after the sweep's last run.
- **R64's registration**: at construction when `captureRequests` is handed in; otherwise on the first sweep service asked (`sweepDue`, `sweepWake`, `sweepTick`, `sweeps`), through `captureRequestsOf(host)`. Calling the factory at construction would build capture-requests without the plane's deps, because `plane/store.mjs` builds monitoring first (:147) and capture-requests after (:152). See the REPORT.
- **Size:** I told you in J1 I would stop before 4,000; I wrote the whole sweep in one pass and reached 4,062 before I read your B2 (which said not to stop). Final count: **4,062 lines** (`index.mjs` 2,782, `checks.mjs` 299, `schema.mjs` 180, `sweep.mjs` 537, `sweep-match.mjs` 264). The sweep's share, to move at N506: `sweep.mjs` and `sweep-match.mjs` (801), the `SWEEP_CHECKS` rows and sweep arm in `checks.mjs` (about 100), two tables in `schema.mjs` (about 30), and the delegation in `index.mjs` (about 50).

**Deferred:** nothing of mine.

**Found in other modules** (REPORT J2):
- `plane` (`src/plane/store.mjs`:147–:152): R64 registers at construction only if the composition root hands monitoring its `captureRequests` (or builds capture-requests first). Until then the check registers on the first sweep service asked, and capture-requests' drain refuses a sweep-named request before that, failing closed.
- Red 5 for the new op `sweeps` (op-declarations R10, affordances R32, control-plane R45; L11).
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from my changes under `src/monitoring/`. I regenerated nothing.
- `scheduler` (L10, after me): the services are `sweepDue(now)`, `sweepWake(now)`, `sweepTick(now, rank)` on `Monitoring`; rank items `{kind: "sweep", id: "<bundle>#<id>", waitingSince}`; the tick answers `{paused, at, epoch, due, ran, skipped, failed}` (or `busy: true`).
- `queue-producers` R26 (L11): `sweepConditions({viewer})` answers `{ok, conditions: [{sweep, kind, since, detail}]}` with the five kinds in `SWEEP_CONDITION_KINDS`.

**Tests and checks:**
- `node --test bio-plane/test/m/monitoring/`: 107 pass, 0 fail (new: `sweep-grammar.test.mjs` 8, `sweep-run.test.mjs` 8, `sweep-reads.test.mjs` 6; R29's `test.todo` removed).
- Users re-tested: scheduler 52/0, queue-producers 59/0, affordances 146/0, capture-requests 72/0, control-plane 114/2 (`families.test.mjs`:47, `inbox-door.test.mjs`:81), plane 35/1 (`worker.test.mjs`:39).
- The whole `bio-plane/test/m`: 5,169 tests, 5,153 pass, 5 fail, 11 todo, 0 skipped. The 5 fails are all accepted reds by name: control-plane `families.test.mjs`:47 and `inbox-door.test.mjs`:81, plane `worker.test.mjs`:39, queue `catalogue.test.mjs`:34 and :116.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures. `node checks/architecture.mjs … monitoring`: 14 product files, 75 relative imports; 0 failures. `node checks/coverage.mjs … monitoring`: 63 of 63 live ids named; 0 failures. `node checks/ownership.mjs … monitoring tranche/T23`: 14 files; 0 failures.

Size (session_01YcGTGLceU7FuKo6wgFMjYL): test runs 19, module lines 4062

## J2 · REPORT

Found in other modules, each for you or a later job:
1. **plane** (`src/plane/store.mjs`:147–:152): it builds monitoring before capture-requests, so R64's scope check cannot register at construction without building capture-requests with no deps. Monitoring registers at construction when given `captureRequests`, else on the first sweep service asked. Until plane hands `captureRequests: captureRequestsOf(ctx, …)` to `monitoringOf` (or builds capture-requests first), a sweep-named request drained before the first sweep service runs is refused (fails closed).
2. **Red 5** for the new op `sweeps` (member session, read): op-declarations R10, affordances R32, control-plane R45 (L11). Affordances' suite is still green today.
3. **The plane bundle** is stale from my changes under `src/monitoring/` (two new files, `sweep.mjs` and `sweep-match.mjs`). I regenerated nothing.
4. **scheduler** (L10, after me): `sweepDue(now)`, `sweepWake(now)`, `sweepTick(now, rank)` on `Monitoring`. Rank items are `{kind: "sweep", id: "<bundle>#<id>", waitingSince}`. The tick answers `{paused, at, epoch, due, ran, skipped, failed}`, or `busy: true`.
5. **queue-producers** R26 (L11): `sweepConditions({viewer})` answers `{ok, conditions: [{sweep, kind, since, detail}]}` with the five kinds in `SWEEP_CONDITION_KINDS`.
6. **Re-tests:** scheduler, queue-producers, affordances and capture-requests are green. The only reds are accepted by name: control-plane `families.test.mjs`:47 and `inbox-door.test.mjs`:81, plane `worker.test.mjs`:39, queue `catalogue.test.mjs`:34 and :116.

## J3 · COMPLETE

The link sweep is built: R29, R31 (the sweep items), R36 (the sweep arm) and R53–R64 are met, each named by a test with negative controls. It sits in `monitoring/sweep.mjs` and `monitoring/sweep-match.mjs` as B2 asked. Final count: **4,062 lines** (`index.mjs` 2,782, `checks.mjs` 299, `schema.mjs` 180, `sweep.mjs` 537, `sweep-match.mjs` 264). I passed 4,000 before reading B2, contrary to what J1 said I would do; the record says so.

New rows, each `awaiting stamp` until T24's L2 (red 7): C-18.16 `SWEEP_TERM_REFUSED`, C-18.17 `SWEEP_NOT_A_MEMBER`, C-18.18 `SWEEP_RATIFY_NOT_AN_OWNER`.

Monitoring's suite: 107 pass, 0 fail. The whole `test/m`: 5,153 pass, 5 fail, every fail an accepted red by name. format, architecture, coverage (63/63) and ownership: 0 failures. Readings, the found items (REPORT J2) and the size line are in my record's Completion.
