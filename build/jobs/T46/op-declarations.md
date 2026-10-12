# op-declarations (T46)

**Status** · session_01NUf7KtHeiN1J9PyDGrJ1af · depth 2 · WAITING ON BOB (J1) · handled B3

## J1 · QUESTION

Two readings; I carry on with my best reading of each. Work so far is pushed (6da0899eb1): R50–R53 built, t46.test.mjs added, older registry and library tests re-pinned. The module's tests are at 152 of 155; the three reds are (1) below.

(1) The help timing for `infolevelset` and `escalationstoppursuing` (R34, R50, R51; affordances R53). Affordances R53 holds their texts under `owed_infolevelset` and `owed_escalationstoppursuing` "until op-declarations declares them". It merges before me, so at my merge neither op has an `ACT_HELP` entry under its own name. R50 and R51 say both are explained by `ACT_HELP`, so I do not name them in `ACT_HELP_ABSENT`. Today `escalationreopen` has no text either; affordances' merge gives it one.
Best reading: leave all three out of `ACT_HELP_ABSENT`. R34's partition tests (t36 "R34 (affordances R48)", t42 "R47, R34") then stay red for these ops until `ACT_HELP` holds them under their op names. After affordances merges, that is still true for the two `owed_` keys, until a follow-up moves them (a CHANGE to affordances at my merge, or a step at the merge). The alternative is to name all three under `unexplained` now and drop them in the same merge that moves the keys. Which do you want?

(2) `airundispatch`'s admission (R51; control-plane R77: "her session or her own ai credential"). Admission lets an `ai` credential reach an op only when `member` is in `classes` and there are no `machineClasses`. So I gave it a new kind, `memberrun`: classes `admin`, `member`, no `machineClasses`, mutating, `NEEDS` null, `by` stamped, in ai-runs' family.
That also lets the operator's `admin` bearer past the spec gate; `dispatchMemberRun` then refuses it (`AI_RUN_NOT_PRINCIPAL`).
Classes `["member"]` alone would refuse the admin bearer, but would also refuse the founder's own session (kind `admin`). I kept `[admin, member]`. Say if you want `["member"]` instead.

## J2 · REPORT

checks/run.mjs over the product (6da0899eb1): architecture's one failure for my files is t46.test.mjs importing escalation's ops map (escalationOps), to drive R51's escalationstoppursuing and escalationreopen stamps through their owner. R51's Uses note leaves that edge to BOB: please add escalation to op-declarations' uses in modules.json. format 0, coverage 52/52 for op-declarations, ownership 0. The other coverage failures are modules not yet merged in L11 (installer, instance-setup, interface and screen modules, notice-producers, op-grades, setup-page, setup-words, wizard-scripts).
