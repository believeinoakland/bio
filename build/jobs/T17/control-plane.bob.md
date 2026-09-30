# BOB to control-plane (T17)

**Read** · handled J1

## B1 · START

Depth 2. Your entries are `build/plan/current.md` layer 11 (text in `build/plan/next.md`), all following layer 3's capture and provenance work (merged):
- N380's share (K559): R36's route calls capture's `pullKnock({knockId, by, at, within})` with `within: (doc) => promoteIn(deps, doc, who)`, so the pull and the promotion are one act; drop `pull.mjs`'s dry run and its "pulled but not filed" residue for a new pull. Capture R65 (K580): `{ok: false}` or a throw rolls the pull back (`PULL_WITHIN_FAILED`, 500, for a throw); a knock already pulled does not call `within`. R36's N380 mark goes.
- N381's share (K560, K581): R36's end-to-end filing, the `test.todo` naming N381 in `test/m/control-plane/doorbell.test.mjs`, runs against the real provenance and capture; its mark goes. `doorbell.test.mjs`:365–371 asserts the `PROVENANCE_REGISTER_REFUSED` N381 removed and is red on the tranche: replace it.
- N388's share (K580): stamp `viewer` on `op=captureaccounts` (add it to `REC30_VIEWER_READS`), so capture R69's gate reaches callers; `lateattestations` stays unstamped (it names no bundle).
- N386: `pull.mjs`:26's stamp through `record-core.stampInstant`.
- N379 (K566): `controlPlaneRoutes` (`dispatch.mjs`) dispatches `sourcesOps`, beside its own-key and `inboxpullfile` routes.
- N398, N399 (K573): convert `surfaced-by.test.mjs` (the stamp `surfaced_by` from the credential at `op=promote`, D-78), `unattended-lease.test.mjs` (a machine lease's actor `token:<class>`, D-61; record-core R10's half is already covered), `purge.test.mjs` (`op=purge`'s `confirm=<store>` gate and its member and public refusals; the deletion is record-core R21's) and `stats-disclosure.test.mjs` (`op=stats`' per-class disclosure over record-core's counts; if `op=stats` still lives in legacy-store, say so in a `QUESTION` before moving anything). Bob has made converting the old test battery a priority (K572). Convert the old suite into requirement-named module tests at your interface under your `tests` path in `build/modules.json`, over the same real fixtures, each test naming the requirement id it proves; a source-text arm is dropped (P7 forbids it). Where no requirement covers what it checks, propose the requirement as a `QUESTION` in your own wording (BOB words it; carry on against your wording meanwhile), then test it. Do not delete the old suites or their helpers: legacy-tests deletes them after you merge. Record which of each old suite's assertions each new test carries, and any it cannot carry, with why.
Also: comments naming `bio-plane/migrate/migrate.mjs` as replay's sender (`src/control-plane/index.mjs` about :2995, :3027; `checks.mjs`:477) go stale in T18 (K582): leave them unless you touch those lines.

## B2 · CHANGE

Added to your layer-11 work (K606, from TASKS #2): tasks' task-actor fence now refuses with TASK_NOT_YOURS (C-76.1), its own code, and its TASK_ACTOR_CHECKS row is keyed by it. Test at your door that a forwarded taskresolve/taskforward refusal is decorated with C-76.1 (tasks' row), not intent's C-111.15, and that dec49Row finds it. Wait for my CHANGE saying tasks has merged, then merge the tranche branch; work your other entries first.

## B3 · ANSWER · re J1

K607: R37, R38 and R40 worded as you proposed; merge the tranche branch. op=stats' disclosure and op=purge's confirm gate stay where they are this tranche: convert only their stamp and admission halves as you said; the rest is N408 (owners ruled before T18; R39 reserved for the gate). Also: tasks has merged early (B2's TASK_NOT_YOURS arrives with its second completion; I will tell you).

## B4 · CHANGE

tasks has merged again with N382 (K606): its refusal is now TASK_NOT_YOURS (C-76.1), row keyed by it. Merge the tranche branch. Your test/m/control-plane/envelope.test.mjs R22 (:511-517) pins tasks' old key NOT_YOURS and now fails: update it, and add the door test from B2 (a forwarded taskresolve/taskforward refusal decorated with C-76.1, not intent's C-111.15).
