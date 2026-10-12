# action-producers (T45)

**Status** · session_01DzwLCqCEUUezneMAmESEez · depth 2 · COMPLETE · handled B2

## Record

**How the reading set was read** (mechanics §17; START: 365 KB). Read whole: `roles/JOB.md` and mechanics §3, §6, §13, §17; `build/requirements/action-producers.md`; `build/plan/current.md` (the opening rules, L11 entries, the new-module table, the reconciliation); K624, K1850, K2581, K2780, K2781, K2787, K2794, K2874; `draft-T45-upper.md` (its sources, "queue-producers", the doubts); layer 11's contract in `build/layers.md`; `BIO_Action_v0_2.md` §4 (rules 6, 12, 17, 18, 20 the ids cite); `queue-producers`' moved code (the class frame and helpers, `feedItems`, `#homesAt`, R15–R21 and R29, the factory) and its tests of the moved ids (`action.test.mjs`, `templates.test.mjs`, `localday.test.mjs`, `world.mjs`, and the R11–R13, R24, R25, R28 tests of `feeditems.test.mjs`); `machinery-producers`' frame (K1850's form); the Provides of the services my Uses name: `action-clocks` (whole public part), `action-holds` R2, R3, R5, R8, R12, `plan-work` (whole public part), `following` R24, R25, `action-plans` R6, R17, R40, `escalation` R16, R31, `membership` R68, R74 and the services named, `queue-producers` R8, R11–R13, R24, R25, R28, R36, `queue` R12, R17, `affordances.decorate`; and, where a published shape needed confirming, the providers' code for `overdueClocks`, `remindersDue`, `remindersFor`, `pendingClocks`, `holdsDue`, `takeUpsFor`, `planReviewsDue`, `plansToLookAgain`, `checkpointsDue`, `escalationsDue`, `watchQuestions`, `planRead` and the op maps of `action-clocks`, `actions`, `plan-work`, `action-plans`.

**Entries applied (T45-40):**
- **The copy (K624).** `queue-producers` R15–R21 and R29 copied into `bio-plane/src/action-producers/index.mjs` as R1–R8 (factory `actionProducersOf(ctx, deps)`, one read `actionItems`), with the helpers they call (the viewer gate, `#homesAt`, the zone and local-day helpers, the paged read); every key, kind, bound and `basis` copied, then amended. The moved tests copied into `bio-plane/test/m/action-producers/` (`action.test.mjs`, `templates.test.mjs`, `localday.test.mjs`, `world.mjs`), re-labelled by the plan's id table and driving `actionItems` directly; their only changed assertions are T45's (doors first, R1's rule, `action-holds` as the source). `queue-producers` keeps its copy until T45-41; this module registers nothing.
- **R1–R4, R7: R1's rule.** The last take-up (`plan-work.takeUpsFor`, read once per read as the plane), then the author, each while an active member (`memberFacts`) who may see the thing (`inSight`); else the project's active owners (owners who are active and joined); else the administrators. R4: a reminder only while its setter is active and sees the action, to nobody else. R3: a `stopped_pursuing` proposal raises none.
- **R1: one item per fact, words by basis.** No item for an entry carrying `noticed_by`; `steps` named on the one item. `summary_key` per K2880 (6): `owed_by: group` → `.ours`, basis kind `stated` → `.theirs`, else `.noreply` with canon's words ("Noticed: no reply recorded by 25 August"); no word "overdue", "violation" or (for `theirs`) "legal". The keyed sentences are in `words.mjs` (`ACTION_WORDS`; `WORDS_OWED` names the two the design stream owes).
- **R5: the docket and pressure arms**, keyed `docket::<entry>` and `pressure::<record>`, read from `action-holds.holdsDue` (its `arrived`); the marker told only while active.
- **R8** reads `action-holds.holdsReleased`.
- **R9** `member-left-items`, **R10** `watch-keep-or-stop`, **R12** `plan-review-due` and `plan-look-again`: as K2880 (3)–(5) read them.
- **R11 doors** as plain acts, queue decorating them (K2880 (2)); R1's met/waived door left out (K2880 (1); N924).
- **R13** `facts`: each producer's bound and `truncated` by kind, and `failed` naming each producer that threw (the rest stand). Provider reads that two producers need (R1 and R9: `overdueClocks`, `holdsDue`, `escalationsDue`, `checkpointsDue`) are read once per call.

Not-yet-met marks this job meets: **R1–R20**, each named by a test: `action.test.mjs` (R1–R5, R8, R14, R18, R20), `templates.test.mjs` (R6, R7, R14), `localday.test.mjs` (R1, R4, R18, R20), `t45.test.mjs` (R1–R5, R7, R9–R19).

**Files added** (for `modules.json`, plan rule 3): `bio-plane/src/action-producers/` (`index.mjs`, `words.mjs`) and `bio-plane/test/m/action-producers/` (`world.mjs`, `action.test.mjs`, `templates.test.mjs`, `localday.test.mjs`, `t45.test.mjs`).

**Deferred:** R11's door for stating an entry met or waived: no `action-clocks` op exists (K2880 (1)); N924 for my next job.

**Other modules (also in the COMPLETE):**
- `queue-producers` (T45-41): call `actionItems({member, viewer, now, homesOf, optionsOf})` and carry its `facts` beside its own; build it lazily over its own deps as it builds `machinery-producers`; its `deps` gain `actionHolds`, `planWork`, `following` (and its fakes in tests).
- `queue` (T45-43): R12's per-kind `instead` for the new kinds; items now carry `summary_key` on `action-clock-overdue`; `member-left-items` is a FINDING with no project-scoped finding id.
- `action-clocks`: no op states an entry met or waived (N924, K2880). Also: `pendingClocks` carries no creator or project, so R9 reads them through `record-core` (K2880 (3)); a read giving them would let R9 drop that.
- `action-holds`: a docket mark's item answers `marked_by: null` (docket R27 names no marker), so its marker is never told (K2880 (7)).
- `action-plans`: `plansToLookAgain` compares `look_again` with `dayOf(now)`, which reads as the UTC day; against its R40 and K1444 (iii) the day it has come is the local day.
- The design stream (via BOB): the words for `queue.action-clock-overdue.ours` and `.theirs` (held in `WORDS_OWED` until given).
- Generated artifacts: none staled (nothing imports this module yet).

**Tests and checks run** (final, on the commit below):
- `node --test bio-plane/test/m/action-producers/`: tests 36, pass 36, fail 0.
- `checks/format.mjs`: 153 modules, 0 failures. As committed (empty paths): `architecture.mjs action-producers` 0 failures; `coverage.mjs action-producers` fails only for want of the paths; `ownership.mjs action-producers tranche/T45` 0 failures. With `modules.json` naming my two paths (a local, uncommitted edit, as BOB will make it): `architecture.mjs` 7 product files, 25 relative imports, 0 failures; `coverage.mjs` 20 of 20 live ids named, 0 failures.

Size (session_01DzwLCqCEUUezneMAmESEez): test runs 10, module lines 1342

## J1 · QUESTION

Readings I am building on; each is my best reading, and I carry on with it unless you answer otherwise.

1. **R11, R1's door "the act action-clocks serves for stating an entry met or waived (its existing op, named at T45-40's START)".** The START names none, and action-clocks has no such op: its ops are `reminderset`, `reminderanswer`, `clockadopt`, `clockstate` (appends a new pending entry), `clocksics`, `clocklateness`; met/waived is a status in the action's document, changed by a revision. Reading: R1's doors are `actioncorrespond`, then take-up (`itemtakeup`); the met/waived door is left out until you name an op (I invent none). If you name one, it is a one-line addition.
2. **R11 "each decorated as options are (`affordances.decorate`)".** This module does not use `affordances` and holds no gate; `queue` R17 decorates every option of every item with the control plane's gate. Reading: doors are plain acts `{id, label, weight}`, decorated by `queue` at its answer, as `queue-producers` R9's take-up is today.
3. **R9's "pending or overdue clock entries".** `overdueClocks` answers overdue entries with project and creator; pending ones are answered only by `action-clocks.pendingClocks` (its R1, on the existing edge), which carries neither. Reading: pending entries through `pendingClocks({before: <a far day>, viewer})`; the action's creator read as action-clocks R3 defines it (the author of its first manifest entry, `record-core`), its project as `record-core.bundleInfo` answers it (as R8's homes already read). R9's reminders "on pending entries": `action-clocks.remindersFor({action, viewer})` over the actions of those entries, states `waiting` or `due`.
4. **R9 "it leaves when its recipient disposes of it".** Derived on read and writing nothing (R13), the item also leaves when no item remains routed to her (all taken up or closed). Reading accepted as the only form a no-write producer can take.
5. **R12's `<day>` in the key.** Reading: the review day the rhythm reached as `plan-work.planReviewsDue` names it (`day`, the rhythm's own local day), so the key is stable whatever the instance zone; `due` and `age` are counted in the instance profile's zone (R18, R20). `plan-look-again`'s day is the pause's `look_again`. Recipient: the member who set the rhythm (or paused the plan) while she is an active member who sees the plan's project; else the project's active owners; else the administrators (R1's rule, with no take-up arm: take-ups do not name reviews).
6. **R1's words by basis.** `queue.action-clock-overdue.noreply` carries canon's words ("Noticed: no reply recorded by <date>"); `.ours` and `.theirs` are the design stream's and not given (no key in `words.json`). Reading: each item carries `summary_key` naming its key, with a plain interim summary for `ours` and `theirs` that says neither "overdue", "violation" nor "legal", replaced when the design stream gives the words. Choice of key: `owed_by: group` → ours; else basis kind `stated` → theirs; else (body or undetermined) → noreply.
7. **R5's docket arm (a fact, for your record).** `action-holds.holdsDue` answers a docket mark with `marked_by: null` (docket R27's read names no marker), so a docket mark's item goes to the administrators alone; and it lists docket marks and pressure records only where the viewer sees the project at FULL, so R5's "told its id at EXISTENCE" arm never arises through that read. I build to the read as it is.

## J2 · COMPLETE

T45-40 complete on `job/T45/action-producers` @ cd83113414 (record: `## Record` in this file).

- R1–R20 met, each named by a test; `node --test bio-plane/test/m/action-producers/`: 36 pass, 0 fail.
- Files to add to `modules.json` (plan rule 3): paths `bio-plane/src/action-producers/` (`index.mjs`, `words.mjs`); tests `bio-plane/test/m/action-producers/` (`world.mjs`, `action.test.mjs`, `templates.test.mjs`, `localday.test.mjs`, `t45.test.mjs`). With them: architecture 0 failures (7 files), coverage 20/20; format 0; ownership 0.
- Deferred: R11's met/waived door (no action-clocks op; N924, K2880 (1)).
- For others (detail in the record): `queue-producers` (T45-41) calls `actionItems` and carries its `facts`, its deps gaining `actionHolds`, `planWork`, `following`; `queue` (T45-43) the new kinds' `instead`, `summary_key` on `action-clock-overdue`; `action-clocks` N924, and `pendingClocks` carries no creator or project; `action-plans.plansToLookAgain` compares `look_again` with the UTC day (`values.mjs` `dayOf`), against its R40 and K1444 (iii); the design stream owes the words for `queue.action-clock-overdue.ours`/`.theirs`.
