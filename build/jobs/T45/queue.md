# queue (T45)

**Status** · session_01RjHrzA8rocdW5JJBBdTHUw · depth 2 · WAITING ON BOB (J1) · handled B4

## J1 · COMPLETE

**Entries applied.** T45-43 (R1, R12), commits 9d9ed48bc7 and the test commit after it:
- R1: `watch-keep-or-stop`, `plan-review-due`, `plan-look-again` OBLIGATION and `member-left-items` FINDING catalogued, each with its sentence. `litigation-hold`'s sentence now also covers a docket entry's `legal` mark and a `legal` pressure record. The moved kinds keep their classes and sentences; their producer pointers now name `action-producers` R1–R8.
- R12: the doors are `watchanswer`, `planreviewrecord` and `planresume` (the ops `following`, `plan-work` and `action-plans` serve), each with a door detail. The bridge (R28) and the mute fence (R19, R26, R31) follow automatically from the kind's class. `member-left-items` is `available: false, instead: queuemute` (reason `a_departure_is_taken_up_not_disposed`). The litigation-hold door detail also names the mark-keyed arm.
- Suggestions "Deps": `Queue.PRODUCER_DEPS` gains `actionHolds`, `following` and `planWork`.

**How the set was read.** My requirements and all of my code (`queuestate.mjs`, `queue/{index,door,checks,schema}.mjs`) were read whole. I read these tests whole myself: `catalogue`, `action`, `words`, `world`. A helper read the other 18 test files and `conclude-project`/`docdates` whole and gave a digest with file:line (K2032). For the used modules I read the parts that bear on this entry myself: `action-producers` (whole requirements), `queue-producers` R8/R25/R36 and its Uses, `plan-work` R4, `action-plans` R40, `following` R25, and `draft-T45-upper.md` §queue-producers with doubt 15.

**Flaws found in this module, fixed.** `words.test`'s R48 sweep had grown past the feed's default limit (203 items against 200). It now asks for 500 and asserts it is not cut. The R16 loop could pass on an empty list. The R38 test now sweeps every kind sentence and translation. Two stale counts are corrected (docket "ten kinds", watched "eight T31 kinds").

**Deferred, with why.**
- R34's "never from a caller" is not checked in behaviour; it would need a document-backed item compared to op=affordances. The text is unchanged.
- R52's text says `acts: [projectwatch, projectclose, setcondition]`. The code and `investigation.test` have `[projectwatch, projectclosewithgaps, objectivecondition]` (the ops op-declarations R43 serves). The text looks stale; that is BOB's to re-word.

**Owed at queue-producers' merge (T45-41).** Re-point to `actionHolds`/action-producers:
- `docket.test`:163–181 (`actions.holdsReleased`)
- `action.test`:104–122 and :136–155 (`actions.holdsDue`, the Action providers; its title cites queue-producers' ids)
- the `world.mjs` default fakes (`actions.*`; none yet for `actionHolds`, `following`, `planWork`, `actionPlans.plansToLookAgain`)
- `templates.test`:88–104

**Tests and checks.**
- `node --test bio-plane/test/m/queue/`: pass 141, fail 0.
- `conclude-project.test.mjs`: 4 FAIL, the same 4 on `tranche/T45` without my change (`queue-producers` `holdsDue is not a function`, the plan's rule 4 (6), K2849; inherited, not mine).
- `checks/format`: 0 failures. `architecture`: 0 failures. `coverage`: 42 of 42 live ids named, 0 failures. `ownership`: 9 files, 0 failures.

Size (session_01RjHrzA8rocdW5JJBBdTHUw): test runs 7, module lines 3072
