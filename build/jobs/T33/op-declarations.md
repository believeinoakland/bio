# op-declarations (T33)

**Status** · session_01BLy9wpCWCj7n1UuSHwbkir · depth 2 · COMPLETE · handled B1

## Completion (OP-DECLARATIONS #10)

**Applied: T33-88 (R17–R20), with every START finding.** New export `OP_FAMILIES`, one frozen entry per owner, one append site each (R19): `events`, `lines`, `money`, `money-checks`, `duties`, `people`, `explore`, `hypotheses`, `calculations`, `workbooks`, `answers`, `following`, and T33's ops in `standards` (K1571), `credentials` (K1544), `sources` (`sourcekeyed`, K1550), `entities` (`entityidentify`, K1572), `ai-runs` (`aiusage`, `aiceilingset`, `aicopyceilingset`, `airunverify`; K1601, K1610, K1612), `inquiry` (`waitlook`, K1604), `corpus-export` (`exportrender`, K1640), `actions` (`addresseesuggest`, K1657), `action-clocks` (`clockadopt`, `clockpropose`, `clocksics`, `clocklateness`; R17, K1658), `capture-requests` (the three platform ops, K1601) and `instance-setup` (`officesseed`, `assistantset`, R17). 181 ops. Each entry gives every op a kind (`OP_KINDS`: open, member, admin, own, proposal, tally, read, ownread). `OPS`, both `SESSION_OPS` sets and `NEEDS` are spread from it, so a family cannot be specced in one table and missed in another. Each entry also names the stamps the door sets: `viewer` on every op, `actor` `{key, at}` on each act, `proposer` on each proposal. `at` says whether the owner reads the stamp from the query or the body (J1 (1)). Declared apart: `exportpage` (`export`'s classes); `moneydetectorsrun` (the operator's, unattended by money-checks R6); and `ASK_GRANT_OPS` `askceiling`, `askcheck`, `askusage` (K1601: a session's kinds, no bearer, in no session set; `askusage` is unattended, citing K1601). `standardinforce` gains R18's null row. Built on J1's readings (1)–(7) (no ANSWER yet).

**Not done from J1 (8):** `aigrantmint` also reads `member` and `session` from the query (credentials R27). The family names `by` as its actor only. Stamping the session token is control-plane's to decide.

**The docket finding (K1635):** `docketprepare`'s new `order` and `capture` are body fields. Nothing here changes for them.

**Deferred:** none of mine.

**Found in other modules** (also in my REPORT):
- (a) **Ops declared but not yet served by any ops map (R6's other half).** The R6 test names each one's server:
  - `clockpropose`: action-clocks has no arm; filings calls the service in-process.
  - `capturerequestplatformmark`, `capturerequestplatformunmark`, `capturerequestplatformhosts`: capture-requests left them out of its map.
  - `ask`, `askceiling`, `askcheck`, `askusage`: no plane code serves them.
  - The control plane would route all of these (T33-89). `officesseed` and `assistantset` are instance-setup's (T33-87).
- (b) **Stamping site per owner.** lines, money, money-checks, workbooks, people, hypotheses, entities and standards read the actor from the **body**, so the control plane must overwrite the body's copy, as it does for `resolutiondefect`. calculations, answers and capture-requests' platform services take the stamped `viewer` as their actor.
- (c) **answers and agent-worker disagree on the check's name.** answers serves `answercheck` (it writes tallies); agent-worker calls `askcheck`. Both are declared. The control plane routes one of them.
- (d) **credentials' `aiGrantAdmit` is called by no plane code**, and `AI_GRANT_OPS` misnames ops: it lists `calculations`, but calculations' read is `calculation` (N580, as ANSWERS #1 found).
- (e) **Possible gaps against requirements, for their owners to judge:**
  - people `identitywithdraw` and `personfactwithdraw` check no caller.
  - money's machine test is `class:` only, where its siblings use `isMachineIdentity`.
  - events R4 says "a member's act", where K1505 (9) and the code make `readoptin` an administrator's.
  - standards `lawwithdraw` lets any member withdraw any relation, with no sight check.
  - entities R43's `withdrawIdentifier` has no op.
  - money-checks' `moneydetectorsrun` arm checks no identity. It is declared the operator's.
- (f) **New reds, from this job's specs**, each until its own job:
  - control-plane `declarations.test.mjs:11`: R2 over op-declarations R6, no handler for the new specs. Until T33-89 routes the families.
  - control-plane `totality.test.mjs:13`: affordances' `unaccounted` over the door's table. Until T33-85 grades them.
  - The START's named reds are unchanged. control-plane `doorbell.test.mjs:488` (R26, sourcekeyed), `catalogue-end.test.mjs:15`, `families.test.mjs:47` and `:245`; plane `docket.test.mjs:41`, `notices.test.mjs:118` and `store.test.mjs:68`; affordances `catalogue.test.mjs:548` ("62 ops", which affordances clears in T33-85 now the specs exist), `:707` and `:1061`.

**Tests and checks:**
- Module: `node --test bio-plane/test/m/op-declarations/*.test.mjs`: 68 tests, 68 pass, 0 fail (59 before, plus `t33.test.mjs`'s 9). The stamp tests drive every family act, proposal and read through the owner's own ops map.
- Users of the service: admission 19/0; queue 113/0; control-plane 153/6 (the 4 named reds and (f)'s 2); plane 82/3 (named); affordances 164/3 (named).
- Checks:
  - `format`: 126 modules, 0 failures.
  - `architecture`: 9 product files, 0 failures.
  - `coverage`: 20 of 20 live ids, 0 failures.
  - `ownership`: 4 files, 0 failures.

**Final `uses`:** unchanged (affordances, link-sweep, case-import, wizard-scripts). The families' owners are read by the tests only.

Size (session_01BLy9wpCWCj7n1UuSHwbkir): test runs 9, module lines 2888

## J1 · QUESTION

My readings, on which I am building now (none stops me):
(1) **One append site per family (R19).** A new export `OP_FAMILIES`: one frozen entry per owner (`events`, `lines`, `money`, `money-checks`, `duties`, `people`, `explore`, `hypotheses`, `calculations`, `workbooks`, `answers`, `following`, and the T33 additions to `standards`, `credentials`, `sources`, `entities`, `ai-runs`, `inquiry`, `corpus-export`, `actions`, `action-clocks`, `capture-requests`, `instance-setup`), each `{acts, proposals, reads, actor: {key, at}, proposer: {key, at} | null}`. `at` is `query` or `body`, because the owners read the author differently (events, duties, following, credentials, sources, ai-runs: query `by`; lines, money, money-checks, workbooks, people, hypotheses, entities: body `by`; standards: body `author`/`proposer`; calculations, answers: the `viewer` stamp is the actor; inquiry `waitlook`, action-clocks `clockadopt`: query `author`). The control plane stamps `viewer` on every family op, the actor on each act and the proposer on each proposal, so T33-89 is one loop. That is the "stamps are the control plane's" half; I tell CONTROL-PLANE nothing directly.
(2) **Machine classes (R19).** An act whose owner refuses a machine by name gets `machineClasses: []`; one the owner admits a machine to (dated facts, `linerecord`, `moneyrecord`, `entityidentify`, `identityclaim`, `personfact`, `calculationcreate`, workbook acts…) admin, member, probe with no `machineClasses`. An administrator-only act (`readoptin`, `personexpunge`, `interestcheckgate`, `moneydetectorgate`, `patterngate`, `ruleservicesswitch`, `standingaiswitch`, `keyedserviceset`/`switch`, `aicopyceilingset`) is classes admin, member, `machineClasses: []`, NEEDS `null` (D-136's reasoning, as `wizardeditorgrant`), not `contribute`; likewise a member's own-account act (`accountreference*`, `accountswitchset`, `aigrantmint`, `aiceilingset`, `membertie*`, `standing*`, `ask`) NEEDS `null`.
(3) **Ops with no handler yet** (R6 "no spec without a handler"): `clockpropose` (R17; no ops map has an arm, only filings calls it in-process), `ask`, `askceiling`, `askcheck`, `askusage` (K1601; no plane code), `capturerequestplatformmark`, `capturerequestplatformunmark`, `capturerequestplatformhosts` (K1601; capture-requests left them out of its map), `officesseed`, `assistantset` (instance-setup's L11 job). I declare all of them as R17/R20 and the findings say, and my R6 test names, per op, the job whose arm serves it (control-plane T33-89 for the ask ops, clockpropose and the platform ops, instance-setup T33-87 for its two). Please confirm those owners. The platform op names are my reading of K1601's "`capturerequestplatformmark`/`unmark`/`platformhosts`".
(4) **The ask's plane ops** (K1601): `askceiling` and `askcheck` reads, `askusage` mutating, each classes admin, member with `machineClasses: []` (no bearer; the `ai` grant is admitted outside the table, R2). Not in either session set; `askusage` gets an `UNATTENDED_BY_DECISION` row citing K1601. `askcheck` vs answers' arm `answercheck`: I declare both names (agent-worker calls `askcheck`; answers serves `answercheck`). `answercheck` writes tallies, so I declare it mutating; `askcheck` I declare as agent-worker's `ASK_PLANE_OPS` has it (not mutating). Which name survives is for control-plane's routing.
(5) **`exportrender`**: R17 says "as `export`'s classes" (the ADMIN_TOKEN bearer only), but K1640 says "a member's stamped viewer", and corpus-export R10 filters by the viewer, which the admin bearer makes moot. I follow K1640: classes admin, member, `machineClasses: []`, mutating (it writes an `export_log` row), in both session sets, NEEDS `null`. `exportpage` takes `export`'s classes as R17/K1640 say.
(6) **`moneydetectorsrun`** has no identity check and is the scheduler's (money-checks R6), and the scheduler calls the service in-process. I declare it classes admin, probe (as `reproject`), in no session set, with an `UNATTENDED_BY_DECISION` row citing money-checks R6 and K1566.
(7) **`samepersoncandidates`** (people R8: unpublished until M-P6 passes): K1592 records M-P6 met, so I declare it.
(8) `aigrantmint` reads a `session` stamp (the session token itself) and `member`: I name them in the credentials family's stamps; carrying a session token into a URL is control-plane's to judge.
