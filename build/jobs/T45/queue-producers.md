# queue-producers (T45)

**Status** · session_01DYXLS1wknT5aRvQSA1DDD2 · depth 2 · WORKING · handled B1

## J1 · QUESTION

R8 (T45 sentence) says `facts` "carries its `facts` beside the others" without naming the key. My reading: `facts.action`, holding `action-producers.actionItems`' `facts` object whole (its R13: each producer's bound and `truncated`, and `failed`), `{}` when it answers none; beside `objective_gap`, `unattributed`, `contradiction` and `dispositions`. `queue` names no key it reads from it, so nothing else changes. I am building on this reading; confirm or name another key.

## J2 · REPORT

Read whole: my requirements, my code (index.mjs, proposals.mjs) and every test file; action-producers' public part; the plan's T45-40/41 entries, rule 4 at START, the reconciliation lines naming either module (R5, R14, R20, the id table); `draft-T45-upper.md` "queue-producers" and Doubts; K2780, K2781, K2787; v0.2 rule 18. The used modules' public parts beyond action-producers and machinery-producers were not re-read: my change uses no new service of theirs (reading set over 600 KB, K2700).

Prepared, not committed (START: delete only after action-producers' merge): the moved producers (R15–R21, R29) and every helper only they used (zone and day helpers, `#actionRecipients`, `#actionHomes`, their door constants) deleted; R8 calls `action-producers.actionItems({member, viewer, now, homesOf, optionsOf})`, built lazily over this module's own deps as `machinery-producers` is, its items in the place the moved ones held, its facts as `facts.action` (my QUESTION). Tests: templates.test.mjs and the moved arms of action.test.mjs deleted; new R8 tests (pass-through unchanged and in order, the same walk and options, facts; and no moved kind raised here whatever its old providers answer, with control); R25 and R36 re-tested over what remains (no item carries `due`; nothing moves with the instance's zone). 73 of 73 pass against a local stub; format, architecture, coverage 0 failures. After the CHANGE I merge `tranche/T45`, add one test through the real `action-producers`, and run `queue`'s and the plane's feed tests.

For BOB:
1. Edges to drop at my merge (no remaining import): `action-clocks`, `escalation`, `action-plans`, `actions`, `filing-templates`, `local-facts`. `civil-time` stays (`isCalendarDate`, R37). The Uses lines for them and the "Until this module's T34 job…" sentence are stale.
2. Requirement text: R33 says "as R20's" and R35 "(as R20's `group` template)"; R20 is retired here (now `action-producers` R6). R36's text still names R15, R16, R18, R21 as its producers: after the move this module derives no day at all.
3. Size (M-T45-6): `index.mjs` 2,725 lines after the move (was 3,307), `proposals.mjs` 180.
4. Owed to `queue` (its job): `PRODUCER_DEPS` gains `actionHolds`, `following`, `planWork` (action-producers' private Deps line), and loses nothing it still needs for `action-producers`.
