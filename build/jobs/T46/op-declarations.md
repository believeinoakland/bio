# op-declarations (T46)

**Status** · session_01NUf7KtHeiN1J9PyDGrJ1af · depth 2 · WORKING · handled B3

## J1 · QUESTION

Two readings; I carry on with my best reading of each. Work so far is pushed (6da0899eb1): R50–R53 built, t46.test.mjs added, older registry and library tests re-pinned. The module's tests are at 152 of 155; the three reds are (1) below.

(1) The help timing for `infolevelset` and `escalationstoppursuing` (R34, R50, R51; affordances R53). Affordances R53 holds their texts under `owed_infolevelset` and `owed_escalationstoppursuing` "until op-declarations declares them". It merges before me, so at my merge neither op has an `ACT_HELP` entry under its own name. R50 and R51 say both are explained by `ACT_HELP`, so I do not name them in `ACT_HELP_ABSENT`. Today `escalationreopen` has no text either; affordances' merge gives it one.
Best reading: leave all three out of `ACT_HELP_ABSENT`. R34's partition tests (t36 "R34 (affordances R48)", t42 "R47, R34") then stay red for these ops until `ACT_HELP` holds them under their op names. After affordances merges, that is still true for the two `owed_` keys, until a follow-up moves them (a CHANGE to affordances at my merge, or a step at the merge). The alternative is to name all three under `unexplained` now and drop them in the same merge that moves the keys. Which do you want?

(2) `airundispatch`'s admission (R51; control-plane R77: "her session or her own ai credential"). Admission lets an `ai` credential reach an op only when `member` is in `classes` and there are no `machineClasses`. So I gave it a new kind, `memberrun`: classes `admin`, `member`, no `machineClasses`, mutating, `NEEDS` null, `by` stamped, in ai-runs' family.
That also lets the operator's `admin` bearer past the spec gate; `dispatchMemberRun` then refuses it (`AI_RUN_NOT_PRINCIPAL`).
Classes `["member"]` alone would refuse the admin bearer, but would also refuse the founder's own session (kind `admin`). I kept `[admin, member]`. Say if you want `["member"]` instead.

## J2 · REPORT

checks/run.mjs over the product (6da0899eb1): architecture's one failure for my files is t46.test.mjs importing escalation's ops map (escalationOps), to drive R51's escalationstoppursuing and escalationreopen stamps through their owner. R51's Uses note leaves that edge to BOB: please add escalation to op-declarations' uses in modules.json. format 0, coverage 52/52 for op-declarations, ownership 0. The other coverage failures are modules not yet merged in L11 (installer, instance-setup, interface and screen modules, notice-producers, op-grades, setup-page, setup-words, wizard-scripts).

## J3 · COMPLETE

COMPLETE at 659a277c13 (job/T46/op-declarations, tranche/T46 merged at 01a102f366).

**Entries applied (T46-51):**
- R50: `infolevelset` (`sessionact`, as memberlanguageset; `by` stamped) and `infolevel` (`sessionread`), both in instance-setup's family.
- R51:
  - `statusreportassist`: an ownread in plan-work's family.
  - `escalationstoppursuing` and `escalationreopen`: admin, member, probe with `machineClasses: []`, mutating, `contribute`, in ESCALATION_ACTIONS beside `declinetoescalate`.
  - `airundispatch`: the new kind `memberrun` (`{classes: [admin, member], mutating: true}`, NEEDS null, `by` and `viewer` stamped), in ai-runs' family, as K2999 (2) states.
  - `joindoors`: an ownread in membership's family, `by` an extra stamp.
  - `textcheck`: an ownread in agent-worker's family, as the two drafts are.
  - `clockproposals`: a read in action-clocks' family.
- R34 (K2996, K2999): `ACT_HELP_ABSENT` names `infolevel`, `statusreportassist`, `joindoors` and `clockproposals` under the read ground and `airundispatch` under the last. It names none of `infolevelset`, `escalationstoppursuing`, `escalationreopen`, `textcheck` or `handlechange`.
- R52: the R21 and R27 tests are re-pinned to PR #28's registry and library (80 function acts; seven owed acts, all declared; four owed in the library; `handlechange` off "Your account").
- R53: `handlechange` keeps R42's spec and is in no ground.
- The T46 shares are held in a new `src/op-declarations/t46.mjs`, merged by `family()` beside `T45_SHARES`. It is inside my `paths`, so nothing needs adding.

**Read:** my requirements, my code (index.mjs, t45.mjs) and the seven test files I changed, each whole (P20). A helper read the rest whole and wrote a digest citing each section: my other eleven test files, and the public parts of the used modules that bear on my entries (instance-setup R79, plan-work R14, escalation R31 and R33, ai-runs R18, membership R129 and R130, agent-worker R76, action-clocks R20, affordances R48 and R53, wizard-scripts R29 and R30, op-grades, control-plane R57, R76 and R77).
**Flaws found in my own code:** none beyond the stale pins I re-pinned.
**Deferred:** none.

**Found in other modules (against their requirements):** none open.
- The architecture edge to escalation is added (J2, B3).
- local-facts' `grouprules` and case-account's two T45 ops are now served by their own maps (N935). I dropped them from my tests' list of ops another job serves.

**Tests (`node --test bio-plane/test/m/op-declarations/`):** 155 tests, 153 pass, 2 fail.
- The two reds are the R34 partition tests: t36 "R34 (affordances R48)" and t42 "R47, R34".
- Each fails because `escalationstoppursuing`, `escalationreopen`, `infolevelset` and `textcheck` have no `ACT_HELP` entry under their own names until affordances (T46-45) merges with R53 (K2999 (1)).
- Every R50–R53 test is green.

**Checks (from the process repository):**
- format: 159 modules, 0 failures
- architecture op-declarations: 21 product files, 0 failures
- coverage op-declarations: 52 of 52, 0 failures
- ownership op-declarations tranche/T46: 11 files, 0 failures
- checks/run.mjs over the product: architecture 0 failures (2974 files). Coverage has 13 failures, none op-declarations' (modules not yet merged in L11). Channels 0.

Size (session_01NUf7KtHeiN1J9PyDGrJ1af): test runs 12, module lines 3642
