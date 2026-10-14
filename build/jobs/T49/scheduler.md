# scheduler (T49)

**Status** · session_01QZbGvrbfgrrJ5Li8Y5hW5Y · depth 2 · WAITING ON BOB (J2) · handled B0

## Record

**How the set was read.** Requirements `scheduler.md` (whole: lines 1–24 and R5, R10, R12, R21 in full; the rest by the test and coverage checks), plan entry T49-12, my code `bio-plane/src/scheduler/index.mjs` whole, `m/scheduler/plane.test.mjs` whole (it names R12). Of the used modules, only `instance-setup`'s update-check registration and tick (`setup.mjs` 1222, 3251–3330) were read, in full, as the diagnosis led there. My other tests were run, not read (plan rule 2).

**Measurement (BOB's step 1).** Scratch git worktree (removed), N1095's one-line fix at `control-plane/index.mjs`:2477 (strip `member` only for `stepsource` and `stepsourcewithdraw`), nothing committed. With it `pr.ok` passes. R12 then fails at the loop `the request expired within 1000 alarms` (plane.test.mjs:267) after 88.7 s: the 1000 alarms are spent at one instant.

**Diagnosis.** Alarms 0–7 advance 900 s each (capture-request drain, 3,600,000 ms tick, as designed). After about 20.4 h of virtual time (T0+73,643 s = 2026-10-15T18:33:00Z) `instance-setup`'s `update-check` consumer (R8, K3189) comes due. Its registration drops the alarm's `now` (`tick: () => this.updateCheckTick()`), and `#runUpdateCheck` stamps the row with the Durable Object's real clock (`#iso()`). The test drives `onAlarm(at)` on a virtual clock ahead of real time, so the row's `at` is real "now" (22:xx the day before); `updateCheckWake()` recomputes from that row and answers the same 18:33 instant, still ≤ the virtual `now`. The consumer is therefore due again at every firing, `nextAt` equals `at` forever, and the 24 h expiry is never reached. Not a scheduler defect in R12: scheduler passes `tick(now)` and runs, wakes and expires correctly.
Confirmed in the scratch copy: with N1095's fix plus `instance-setup` passing `now` through (`tick: (now) => this.updateCheckTick(now)`, `#runUpdateCheck(now)` stamping `at` from it) the R12 test passes (17 s, 1 pass 0 fail). Nothing else in the scheduler needs to change.

**Entries applied.** T49-12: diagnosed; no change to scheduler's code or tests, no requirement re-scoped. `plane` R12 is unchanged and stays red until T49-29 (control-plane's refusal) and the `instance-setup` fix below both merge.

**Found in another module.**
1. `instance-setup` (R88's update check): the consumer's `tick` ignores the `now` the scheduler passes it and stamps `update_checks.at` from the real clock. In production the two clocks agree, so only a driven clock shows it; but any `tick(now)` that does not use its `now` has this fault. Fix: the one change in the scratch copy above (3 lines in `bio-plane/src/setup.mjs`). Scheduler R5/R8 already say the consumer's tick receives `now`.
2. Hazard, mine to decide with BOB (deferred, see below): a consumer registered through R8 whose tick throws, or does not move its own wake past `now`, keeps the alarm firing again at once, forever (the guards exist only for `deadline-recheck` and `scheduled-publish`). For `update-check` a failing SQL insert in `#runUpdateCheck` would do it in production, not only in the test.

**Deferred, with why.** A general guard in `#reconcile` (a registered consumer whose wake is unchanged and ≤ `now` after its tick wants no wake until its wake changes or an arm or start releases it) would remove hazard 2 and would make the R12 test pass even without fix 1. I did not add it: it changes behaviour for every registered consumer (`tasks`, `queue`, `instance-setup`) with no requirement text, and the requirement text is BOB's (P9). Proposed in a QUESTION below.

**Tests and checks.** `node --test bio-plane/test/m/scheduler/`: tests 129, pass 128, fail 1 (R12, the inherited red, failing at `pr.ok` as expected without N1095's fix). `format`: 170 modules, 169 requirements files; 0 failures. `architecture scheduler`: 14 product files, 69 relative imports; 0 failures. `coverage scheduler`: 26 of 26 live requirement ids named by a test; 0 failures. `ownership scheduler tranche/T49`: 1 file changed (this record); 0 failures. I did not run `checks/run.mjs` over the whole product; the four checks above are the ones for my module.

Size (session_01QZbGvrbfgrrJ5Li8Y5hW5Y): test runs 3, module lines 0

## J1 · REPORT

T49-12 diagnosis (record has detail). With N1095's fix, plane R12 fails at 'expired within 1000 alarms' (88.7 s), not pr.ok. Cause is not scheduler's: at T0+73,643 s (~20.4 h virtual) instance-setup's update-check consumer comes due; its registration drops the alarm's now (setup.mjs:1223 'tick: () => this.updateCheckTick()') and #runUpdateCheck stamps update_checks.at from the real clock, so updateCheckWake() answers the same past instant at every firing and nextAt never advances to the 24 h expiry. Verified in a scratch copy: N1095 fix + instance-setup passing now through (3 lines in setup.mjs) makes R12 pass (17 s). That is an instance-setup finding (its R88). Scheduler code unchanged; R12 not re-scoped. Hazard also: a registered (R8) consumer whose tick throws or does not move its wake past now spins the alarm forever; see QUESTION.

## J2 · QUESTION

Should scheduler add a guard (new requirement text, yours)? Proposal: a consumer registered through R8 whose wake, read after its tick, is unchanged and at or before now, wants no wake until its wake changes or an arm/start releases it (as deadline-recheck and scheduled-publish are already held). Pros: removes a production spin (e.g. update_checks insert throwing) and makes R12 pass without the instance-setup edit. Cons: behaviour change for tasks, queue, instance-setup consumers. My recommendation: send the 3-line fix to instance-setup's job (the root cause) and do NOT add the guard now; if you want it, CHANGE me with the text. Otherwise I complete with no change.
