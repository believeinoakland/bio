# actions (T41)

**Status** · session_01To13zdek2Zn7rXSM6hPTP7 · depth 2 · WORKING · handled B6

## Completion

**Reading set** (mechanics §17): over 300 KB (START: 859 KB; `index.mjs` 203 KB, the tests 200 KB). Read whole myself: `requirements/actions.md` (with R72, R73 as K2561 added them), layer 9's row and contract in `build/layers.md`, `src/actions/index.mjs`, `t34`, `t27`, `fixture.mjs`, and the services my entry uses (membership R43, R44, R60, R77, R78, R85 and `sight`, `visibilityOf`, `existenceAct`; progressions R5 `readProgression`; intent R33 `registerNoneExistsReader`; action-grammar R13, R14 and `seeksOf`/`seeksFindings`; publish-schedule R1, R8; ratification's fixture). A worker read whole the rest (`schema.mjs`; `acts`, `write`, `read`, `t11`, `t12`, `t17`–`t20`, `t22`, `t33`: 158,771 bytes) and summarised it with file and line: the hold tables and `ACTIONS_TABLES`; no test there touches a hidden project or an administrator's sight; the start registrations asserted (none counts them all); the records_request writes a `seeks` check must leave unchanged; the exact key sets and `where` regions to keep. Nothing it left out mattered.

**Entries applied** (T41-47; N822, N823, K2505, K2561):
- R52, R56–R60 (D54; K2484): "may name" (`#mayName`): `FULL`, or `EXISTENCE` of a hidden project (membership answers it only to an administrator neither invited nor joined; a discoverable project's `EXISTENCE` names nothing). Applied to `actionHold`'s named projects and its `projects`, R56's `restarted`, R57's `restarts`/`out_of_view`, R58's `held: null`, R59's `restarted`, R25's statements. R60 already read no viewer's sight: stated in its comment and proved.
- `t34` (N823, K2438): its stub re-pointed from `publication.scheduleEdition` to publish-schedule's (`w.schedule.scheduleEdition`, its R1); rule 4 (13)'s actions red cleared. No `publish-schedule` edge needed: actions' source does not import it; the test reaches it through ratification's fixture.
- R70: `seeks` judged at the write when stated or changed (never re-judged when carried forward), facts read per distinct progression through `progressions.readProgression` (`null` for one not held; an unreadable read fails closed, `cause: PROGRESSIONS_UNREADABLE`), refused with the grammar's own `SEEKS_REFUSED` (C-117.29), every finding carried.
- R71: `noneExistsFor` registered once at start with `intent.registerNoneExistsReader` (reached as ratification is: given, or the composition root's `env`; a reader already held stands).
- R72: `MACHINE_CANNOT_STATE_SEEKS` (C-32.21) at `#seeksFence > is-machine-state-seeks`.
- R73: `actionSeeksPropose` (`op=actionseekspropose`), table `action_seeks_proposals` (in `ACTIONS_TABLES`, purged with the action), R25's `seeks` and `seeks_proposals` (at most 12, newest first, R19's bound).

**For L11 (op-declarations, control-plane):** `actionseekspropose` in `actionsOps`: `target` (query or body), `seeks` (body list or JSON, or query JSON), stamps `viewer` and `proposer`; any credential; a write to this module's own table only.

**Final `uses`** (for BOB at merge): today's list plus `progressions` (R70, R73: `readProgression`) and `intent` (R71: `registerNoneExistsReader`). Membership's `visibilityOf` (its R85) joins the services named under membership.

**Deferred:** none.

**Found in other modules:** none new. The plane boots actions with its `env` before `intentOf` (`plane/src/store.mjs`:252 vs :286), so actions' factory now creates intent first on that host; intent's factory is idempotent per host, and the plane's later call returns the same instance.

**Tests and checks:**
- actions: 109 pass, 0 fail (START: 95/96, the `t34` red). New `t41.test.mjs`: 13 tests; the 7 D54 tests each fail against the FULL-only rule.
- users and providers: intent 82/0, progressions 63/0, action-grammar 42/0, action-clocks 55/0, escalation 63/0, action-plans 63/0, monitoring 121/0; filings 69/1 (`outward`:136, rule 4 (9)); queue-producers 3 fail, store-door 28 fail, answer-envelope 4 fail, each identical on `tranche/T41` (inherited).
- `checks/format.mjs`: 0 failures. `checks/coverage.mjs`: 61 of 61, 0 failures. `checks/ownership.mjs`: 0 failures. `checks/architecture.mjs`: 2 failures, the `progressions` and `intent` edges above (BOB's at merge, per the START).

Size (session_01To13zdek2Zn7rXSM6hPTP7): test runs 38, module lines 3547

## J1 · QUESTION

R70/R71 against action-grammar R13 (T41-46a, not yet merged): R13 leaves two things to its job that my write must match: (1) the shape of `facts` that `seeksFindings(fm, facts, findings)` takes, and (2) the code of its row. My best reading, which I build on until your CHANGE brings the merged grammar: `facts` is what I read per distinct progression key through `progressions.readProgression({progressionKey})` — for each key `{found, stages: [stage_key…]}` (a key not held reads `found: false`, which is R70's "a progression it does not hold" finding); and I refuse with the first error finding's own `code`/`check` (whatever R13's row names it), carrying all findings, before any write. R52–R60 and the t34 re-point go ahead now; R70/R71 are wired when the CHANGE lands. If action-grammar's job settles a different `facts` shape, the CHANGE saying so is all I need.

## J2 · QUESTION

R70's last sentence ("any member who may write the action may state `seeks`; a machine may propose it as R28's shape, never state it") names two things no row or op exists for yet. My best reading, built now unless you answer otherwise: (1) the fence: a machine or unstamped author that states `seeks` on a creation, or changes it on a revision, is refused before any write, under its own code `MACHINE_CANNOT_STATE_SEEKS`, minted in a DEC-49 region of mine (`#seeksFence > is-machine-state-seeks`) beside C-32.20's; its catalogue row belongs in action-grammar's table (its R9), which I may not write: it goes in my REPORT for a later action-grammar job (or tell me the row is added now and by whom). (2) The proposal: "may propose it as R28's shape" read as owed but not built in this job: a proposal act (`actionSeeksPropose`, stored apart, labelled, listed in R25) needs a new table, an op and op-declarations' route (L11), and nothing in T41 reads it; I defer it with that reason in my record unless you say it is in this job. The `seeks` check itself relays `seeksFindings`' own code and check (SEEKS_REFUSED, C-117.29) with every finding, as B3 says.

## J3 · REPORT

B5 applied: R72 (`#seeksFence > is-machine-state-seeks`) and R73 (`actionSeeksPropose`, op `actionseekspropose`, table `action_seeks_proposals` in ACTIONS_TABLES, R25's `seeks` and `seeks_proposals`) built and pushed with R70, R71 and R52–R60. Suite 108/109: the one red is R72's test asserting C-32.21's row (`code`, `check`, `translation`), which goes green when action-grammar's R14 row merges into `tranche/T41`; nothing else waits. Checks: format 0, coverage 61/61, ownership 0; architecture 2, the `progressions` and `intent` edges you apply at my merge. On your CHANGE with the row I merge, re-run, and post COMPLETE.
