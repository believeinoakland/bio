# scheduler (T33)

**Status** · session_01FP2K16KmLSM3py4LR1p71s · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Readings for T33-80 (R21, R9); I build on them unless answered otherwise.

1. **The three daily consumers** (`duty-transitions`, `interest-checks`, `money-detectors`; K1522): their due and wake are held here. Due at the group's local day start once per local day; while the owner answers `remaining` (people), a cursor (money-checks) or `done: false` (duties), wake = now, so the next firing continues the pass (K1566). The zone is the active jurisdiction view's `time_zone` (record-core's `jurisdiction_profiles` setting combined by `jurisdictions.combine`, as inquiry and action-clocks read it), the day through `civil-time.localDay`/`dayRange`; with no zone held, the UTC day, said in the answer (`zone: null`). Their state `{day, cursor}` lives in one storage value `sched_daily`, not a table (as R13's `sched_probe`; R18 holds). A consumer whose last tick found nothing to work over (duties `duties_read: 0`, people `evaluated: 0`, money-checks `detectors: 0`) wants no wake until the instance's next start (R11) clears that, so an idle instance holds no timer (R15). A tick that throws counts the day as run, so it never spins (R3).
2. **Budgets** (R7, R21): duties and people state a default (1000 ms) and are passed none. money-checks states none and refuses `NO_BUDGET` without one; I pass 1000 ms, its siblings' stated default, named in the code as theirs, and REPORT the gap (money-checks R6 should state its budget).
3. **Instants**: inquiry R57 and answers R17 take `now` as an instant string and answer wakes as instant text; their consumers pass second-precision ISO text and read wakes with `Date.parse`. Duties' `asOf` likewise.
4. **following** (not merged): coded to its R12–R13 as an injected owner, `now` in ms like monitoring's, ranked (R10, batch-bounded). Its requirements name no arming notice for R9's "a follow recorded": which notice does it offer (I would register `onFollowed(module, fn)` if FOLLOWING #1 provides it)? I re-point my tests at the real module after it merges, before COMPLETE (K1563 (1)).
5. **Notices**: inquiry's `onWaitSet` (K1601) is registered, its arm deferred past the promotion's transaction (as entities'). duties, people, money-checks and answers offer no arming notice, so their new work is picked up at the next local day or the next start; I REPORT it rather than call them.
6. **uses** at COMPLETE: duties, people, money-checks, answers, inquiry, following, plus civil-time, jurisdictions, record-core (the zone). The six R2 keys: `follow`, `dutytransitions`, `interestchecks`, `moneydetectors`, `standingquestions`, `datedwaits`.

## J2 · REPORT

Merged tranche/T33 (B2, B3 applied; pushed 3 commits on job/T33/scheduler). Scheduler tests 80/81, the one red being the named R12 (AI_NO_ACCOUNT, N585). plane.test.mjs:109 is green: the instance now holds the first held non-test profile with a zone (test profiles are refused PROFILE_IS_TEST), and its entry is dated two days back. Checks: format, architecture, coverage (21/21), ownership (8 files): 0 failures each.

Findings in other modules:
1. **instance-setup** `test/m/instance-setup/identity.test.mjs:256` ("R9 at start … booting with SCHED_PROBE bound arms no probe", its line 271) turns red. It asserts a fresh instance's start wants no wake. Under R21 and K1522, `duty-transitions`, `interest-checks` and `money-detectors` want their first pass at the start of the local day (one pass; a pass that finds nothing wants no wake until the next start). The test needs a CHANGE to instance-setup's job: assert no probe was armed rather than that no alarm is set. It was green on the tranche before this job.
2. **money-checks** installs its shipped detectors at creation (`installShipped`), and `runDetectors` runs every current version whatever the per-project switches. So any instance holding money-checks keeps one daily alarm (K1522's daily pass), and R15's "an idle instance holds no timer" holds only where no detector is held. This is consistent with K1522, and I'm noting it in case you want detectors that are switched on nowhere to be skipped (money-checks' own job; N604's neighbour).
3. **Generated artifact**: the plane bundle is stale from this job's change to `bio-plane/src/scheduler/index.mjs` (regenerated at the close).

Next: once FOLLOWING #1 merges, I merge the tranche and re-point the `follow` consumer and its R9 test at the real module (K1563 (1)), then post COMPLETE.

## J3 · COMPLETE

T33-80 complete (B1–B4 applied; tranche/T33 merged at following's merge, K1668).

**Entries applied**
- R21, R5, R2: the six consumers after `working-on-attest`, each calling its owner, answered under `follow`, `dutytransitions`, `interestchecks`, `moneydetectors`, `standingquestions` and `datedwaits`; `follow` batch-bounded and given the rank (R10).
  - `follow`: following R12, R13, the real module (`followingOf`).
  - `standing-questions`: answers R17.
  - `dated-waits`: inquiry R57. Answers and inquiry are given instant text and their wakes are read back to ms; a consumer due now wants now.
- K1522, K1566 (accepted K1666): `duty-transitions` (duties R13, `asOf` the firing, its cursor handed back), `interest-checks` (people R23) and `money-detectors` (money-checks R6, `DETECTORS_BUDGET_MS` 1000, named as its siblings'; N604).
  - They run once per local day at the group's local day start: the active view's `time_zone` through civil-time; with no zone held, the UTC day, answered `zone: null`.
  - They run at every firing while a pass is under way.
  - A pass that finds nothing wants no wake until the next start (R11); one that throws or is refused counts the day as run.
  - Their state is the storage value `sched_daily`, never a table (R18); with a storage that cannot hold it, it is kept in memory.
- R9: inquiry's `onWaitSet` (K1601; the arm is deferred past the promotion's transaction) and following's `onFollowed` (its R19, K1666) are registered, both with the real modules. duties, people, money-checks and answers offer no notice (N605).
- K1667: `plane.test.mjs:109` is green: the instance holds the first held non-test profile with a zone, and the entry is dated two days back.

**Deferred:** none.

**Found in other modules** (reported in J2; routed in B4): instance-setup `identity.test.mjs:256` (to its L11 START, until T33-87); money-checks runs detectors switched on nowhere, so an instance holding it keeps a daily alarm (N607); the plane bundle is stale (at the close).

**uses** (set by BOB, K1666): duties, people, money-checks, answers, inquiry, following, civil-time, jurisdictions, record-core, besides the earlier ones.

**Tests and checks**
- `node --test bio-plane/test/m/scheduler/`: 81 pass, 1 fail. The fail is the named R12 (AI_NO_ACCOUNT, N585).
- Modules using the scheduler:
  - tasks: 71/71.
  - queue: 113/113.
  - following: 21/21.
  - instance-setup: 89 pass, 5 fail, all named: R44 ×4 (K1544) and identity:256 (B4).
  - plane findings/notices/store/sweep: 23 pass, 2 fail, both named (K1640, K1643), the same as before this job.
- Checks: format 0 failures; architecture (scheduler) 0 failures; coverage 21/21, 0 failures; ownership 8 files, 0 failures.

Size (session_01FP2K16KmLSM3py4LR1p71s): test runs 22, module lines 585
