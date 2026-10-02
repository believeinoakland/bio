# scheduler (T23)

**Status** · session_01YcT6Cp42KzY2bvkiQ13zJU · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Two readings, both carried on in the meantime; neither stops the job.

(1) R10 and monitoring R56: the sweep tick offers its items to the rank as `{kind: "sweep", id: "<bundle>#<id>", waitingSince}`, but intent's `servesOf` (its R28) names only addresses, bundles and requests, so as built `rankBy` would rank every sweep by its wait alone. My reading: a sweep serves what its bundle serves, so the rank asks `servesOf` about the bundle before `#` (in the `bundles` list) and ranks the sweep by that answer. I am building that. If you read R10 otherwise (a sweep ranked by wait alone), say so and I take it out.

(2) R2 lists the answer's keys; the three new consumers' keys are not in it. I use `gatheringsweep` (mine to name) and `workingonseal`, `workingonattest` (the keys network-notices' `networkNoticesConsumers` already answers under). Requirement text for you to amend if you agree; the code follows R2's "a registered consumer's own" pattern meanwhile.

`RANKED` gains `gathering-sweep` (K1122).

## J2 · REPORT

Progress, and three things for you.

Done and pushed (`job/T23/scheduler`): R5's three consumers in their places (`gathering-sweep` after `monitor-cadence`, `working-on-seal` and `working-on-attest` last), keys `gatheringsweep`, `workingonseal`, `workingonattest`; `RANKED` gained `gathering-sweep`; R9's promotion arm also arms when `monitoring.sweepWake` answers a wake; the rank asks intent about a sweep's bundle (J1 (1)). Tests: `test/m/scheduler/` 62 pass, 0 fail, including the real network-notices (seal and attestation on the alarm). The four checks pass. Left for after monitoring's merge (your CHANGE): R5 against the real monitoring's `sweepTick` with the rank, and the plane R9 test (ratify a sweep on an idle instance, with its negative control).

(1) A flaw in network-notices, against scheduler's Purpose ("an idle instance holds no timer") and R15: `sealWake` always answers the next week's start and `attestWake` the next month's first day, even on an instance with no project, no notice and nothing to seal or attest. So once its consumers are registered no instance is ever idle: the alarm fires at least weekly forever. The seal's own R14 has nothing to seal on an instance without projects, so its wake could be null there (and `attestWake` null with no notice open and no opening kept). I have not changed it (not mine); the scheduler weighs what its owner answers (R7).

(2) Users re-tested (`test/m/plane/`, `tasks/`, `queue/`, `instance-setup/`): 285 pass, 3 fail, each red on `tranche/T23` without my change and accepted: queue `catalogue.test.mjs` R1 and R5 (red 13), plane `worker.test.mjs`:39 (red 6's plane share).

(3) My change under `bio-plane/src/scheduler/` stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`); regenerated nothing.

## J3 · COMPLETE

Complete. Branch `job/T23/scheduler` @ 8e2e853845 (tranche/T23 merged in after your CHANGE B4).

**Entries applied** (`build/plan/current.md` T23 L10, scheduler; B1, B2, B4):
- R5: `gathering-sweep` (monitoring's `sweepDue`, `sweepWake`, `sweepTick(now, rank)`, R56) directly after `monitor-cadence`, before `ai-run-reap`; `working-on-seal` (network-notices' `sealDue`/`sealWake`/`sealTick`, R14, R15) and `working-on-attest` (`attestDue`/`attestWake`/`attestTick`, R12, R17) last. Keys `gatheringsweep`, `workingonseal`, `workingonattest` (R2 as amended, K1160). `SCHEDULER_ORDER`'s note now says positions after `gathering-sweep` moved; tests assert order by name (K1122). The default owners gain `networkNotices` (`networkNoticesOf(ctx, {env})`).
- R10: `RANKED` gained `gathering-sweep` (yes, it did). `rankBy` asks `servesOf` about a sweep's bundle, the part of `<bundle>#<id>` before `#` (K1160); a sweep named without `#` ranks by its wait.
- R9: `listenTo`'s promotion arm also arms when `monitoring.sweepWake` answers a wake, so a promotion that ratifies or re-ratifies a sweep arms even where monitoring were unconfigured; the reconcile weighs the sweep's wake.

**Deferred:** nothing.

**Found in other modules** (reported in J2; routed by you as N507): network-notices' `sealWake`/`attestWake` never answer null, so no instance is idle once its consumers are registered.
Also, for monitoring's test world (`test/m/monitoring/fixture.mjs`, not mine): once monitoring's wakes have been asked, later promotions in that world fail on tables it never creates (`refs`, then `inquiry_bundle_facts`): its other wakes construct modules on the host whose promotion steps read them. Not a product fault (the plane holds them); my R9 unit test therefore gives the scheduler monitoring's real sweep services with its other arms idle. Noted only.
The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from my change (regenerated nothing; yours at L10's close).

**Tests**
- `bio-plane/test/m/scheduler/`: 66 pass, 0 fail. New `consumers.test.mjs`: R5 places and owner calls of the three consumers, R3 (stand-ins whose due, wake or tick throws; and the real monitoring whose sweepTick throws), R5 against the real network-notices (weekly seal once, monthly attestation once), R5/R10 against the real monitoring (two ratified sweeps run in the rank's order, the gap-serving bundle's first; negative control: R56's own order without the rank), R10 (sweep ranked by its bundle; equal wait: the gap decides), R9 (stand-ins; and through the real promotion with the real sweep: unratified arms nothing, ratified arms at now + 1 s). `plane.test.mjs` R9 in Miniflare: an owner's promotion of an unratified sweep leaves the alarm as it was; ratifying it arms at the sweep's wake.
- Whole `bio-plane/test/m`: 5183 tests, 5166 pass, 6 fail. Five are accepted reds: control-plane `families.test.mjs`:47 (K1150), `inbox-door.test.mjs`:81 (red 9), plane `worker.test.mjs`:39 (red 6), queue `catalogue.test.mjs`:34 and :116 (red 13). The sixth was my own new plane test, which failed only beside the file's earlier tests (their two administrators made my member add need consensus); fixed, and `test/m/scheduler/` was re-run whole after: 66 pass, 0 fail.
- Checks: format `87 modules, 86 requirements files; 0 failures`; architecture `9 product files, 32 relative imports …; 0 failures`; coverage `1 modules, 20 of 20 live requirement ids named by a test; 0 failures`; ownership `6 files changed by scheduler between tranche/T23 and HEAD; 0 failures`.

Size (session_01YcT6Cp42KzY2bvkiQ13zJU): test runs 24, module lines 1838
