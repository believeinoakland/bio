# capture-requests (T47)

**Status** · session_01NZ5W5xidnV9DeKDD7m38zu · depth 2 · WORKING · handled B2

## J1 · QUESTION

R56, my readings where its text is silent (I am building on them; answer only where you differ):
(1) `lead_inquiry` with no `target`: allowed, judged by R3 (a visible inquiry); the row is still seen by her alone (no target).
(2) `step` (R55) on a member's request: judged with her as the asker (her stamp's sight), tied on completion as R55 does.
(3) `sweep` on a member's request: recorded as sent and refused at the drain C-28.19 (no new code), since R56 says her capture's deeming actor is never a sweep.
(4) The fetch's origin: `{matched_sweep: target or null, deeming_actor: her stamp}`, so acquisition R21 files a sweep-kind origin with her as deeming actor when there is a target, and `named_request` (as her own op=acquire capture) when not.
(5) "R49 is not asked" covers its 2,048-character bound too.
(6) "with no target, by her alone" is literal: a machine or admin viewer (the "member" scope of membership R43) does not see a no-target member's request in R23/R24/R26/R43, nor through R42's retry or the observation log's look on it (its sweep resolver answers false for anyone else).
(7) R48's captured-for reader skips a no-target member's request (it names no question).
(8) `drains` (boolean) rides both the written and the standing (already: true) answer of a member's request; when false, `detail` is the waiting sentence.
(9) The table's `run`, `target` and `principal_claude` become nullable through a one-time table rebuild in `migrateCaptureRequests` (SQLite cannot drop NOT NULL in place).

## Completion

**Reading.** I read my requirements whole, and my code whole (`index.mjs`, `schema.mjs`, `checks.mjs`). I read whole the tests I changed or that touch R56's amended ids: door, drain, reads, retry, t34, t41, plane, plane-world and fixture. I did not read `member-only`, `sweep` or `t35` line by line; I ran them, and they pass unchanged. For the used modules I read only the services my Uses names, at their source: `run-rules`' `runPrincipalOf` and `runPrincipalGate`, `membership`'s `viewerPredicate`, `acquisition`'s capture-request origin (R21, R31), `observation-log`'s sweep resolution (R13), `capture-sources`' `credentialsForFetch`, the scheduler's `capture-request-drain` consumer and arm, and the control plane's `principal` stamp. I used no helper digest.

**Entries applied.**
- T47-21 (N969), **R56**, a member's own request ("Ask for this later"). A request with no run under a member's session stamp (`member:<id>`) files a row with `run` null, `principal_claude` null and her stamp as the plane principal; `purpose` defaults to `acquire`. A machine stamp, an AI credential (including `member:<id>/<tok>`) or no stamp still gets R1's `CAPTURE_REQUEST_NO_RUN`.
  - At the door: R49 is not asked; `target` is optional and R3 applies when it is given; R2, R4, R5, R46 and R50 apply as written; R6's idempotence is on (her stamp, address, render).
  - R10: her attribution is `{member, inquiry}` with the statement "the daemon captured this, at the request of <plane>".
  - At the drain: R49 is not asked; a sweep named on her request is refused C-28.19; the origin is `{matched_sweep: target|null, deeming_actor: her stamp}`.
  - She joins no run's wait (R29; `markWoken` now stamps only a run's request).
  - Sight: with a target, the target's viewers see it; with none, she alone does, across R23/R24/R26/R43, the R42 retry and the observation log's look (resolved through the new `lookSight`). R48's captured-for reader skips a request that names no question.
  - `drains` rides her answers, with the waiting sentence when it is false.
  - `migrate` rebuilds a pre-T47 table once, so that `run`, `target` and `principal_claude` become nullable.
  - BOB kept all nine of my readings in J1 (B2, K3089).
- K3065 (CAPTURE #30 J1 (b)), the `plane.test.mjs` flake. **Cause:** filing a request tells the scheduler (R44, scheduler R9). Its reconcile arms the Durable Object's alarm at once (the `capture-request-drain` consumer is due now while `drainPending` > 0), and the alarm runs the same drain. So the test's `op=capturerequestdrain` raced it: the op answered `busy` (R11) or found the row already captured, and either way its answer did not list the request. **Fix:** each plane test drives the op until its row has been judged (bounded at 40 rounds) and reads the outcome from the row (R23/R24) and from `op=heldcaptures` by digest, never from one tick's answer. "The door fetched nothing" is R9's test in door.test.mjs; in the plane the check is now "fetched exactly once, by a drain". No test was skipped or weakened in what it measures.
- A new in-plane R56 test covers a member session with no run and an AI-credential control.

**Deferred.** Nothing.

**Found in other modules.** Nothing new. The question-explorer R3 test failed on my branch's base; the tranche had already fixed it, and it passes after I merged `tranche/T47`.

**Tests and checks.**
- `node --test bio-plane/test/m/capture-requests/` → pass 122, fail 0 (13 new in `t47.test.mjs`, 1 new in `plane.test.mjs`).
- Mutation checks, each restored afterwards: reading through the old gate turned the R56 sight test red; asking R49 of a member's request turned 10 tests red.
- Users' tests (P11): scheduler 129/0, link-sweep 29/0, intent 82/0, investigation 32/0, question-explorer 32/0 (after the merge), agent-worker 16/0.
- `format` 0 failures, `architecture` 0, `coverage` 56 of 56 ids, `ownership` 0 (5 files).
- `run.mjs`: architecture 0 failures; the 43 coverage reds are other modules', none of them mine.

Size (session_01NZ5W5xidnV9DeKDD7m38zu): test runs 22, module lines 2643

## J2 · COMPLETE

T47-21 applied: R56, a member's own request with no run ("Ask for this later"), with all nine J1 readings (K3089). The table is rebuilt once with run, target and principal_claude nullable. K3065's plane flake: its cause was the scheduler's alarm drain, armed at once by R44, racing op=capturerequestdrain (busy, or the row already taken); the plane tests now assert on the row's end state, bounded, and nothing was skipped. capture-requests 122/122 (t47.test.mjs 13 new; 1 new plane test); users scheduler 129, link-sweep 29, intent 82, investigation 32, question-explorer 32 (after merging tranche/T47, which carried its R3 fix), agent-worker 16, all green. format, architecture, coverage (56/56) and ownership 0 failures; run.mjs architecture 0, with no coverage red of mine. Nothing deferred. Record: build/jobs/T47/capture-requests.md on job/T47/capture-requests.
