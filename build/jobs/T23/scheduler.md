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
