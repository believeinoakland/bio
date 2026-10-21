# queue (T51)

**Status** · session_01FQVnGoBMzsSJMQVV911nYM · depth 2 · WORKING · handled B8

## J1 · QUESTION

Best reading, no waiting on it: K4065's fix (the test world runs project-roster's `migrate()`) needs `bio-plane/test/m/queue/world.mjs` to import `project-roster`, and `checks/architecture.mjs` refuses it: "world.mjs (queue): imports bio-plane/src/project-roster/index.mjs of project-roster, which queue does not declare in uses". `build/modules.json` is yours: please add `project-roster` to queue's `uses` (it is a test-only use; queue-producers, which queue composes, already uses it for R41/R42). With it the 29 inherited reds are green (queue suite 180 pass, 0 fail here). If you would rather not widen `uses`, tell me another door to the roster's `migrate()` and I will use it. Everything else is applied; I am finishing the record and will COMPLETE once the architecture check can pass.

## Completion (QUEUE #26, T51-104)

**Entries applied** (`build/plan/current.md` T51-104):
- **R58** muted row `{item, class, kind, title, at}`: `queue_item_mutes` gains `item_kind`, `item_title`, `item_subject` (schema and `migrate()`); the item form looks the item up once among her feed's items (`#liveItem`) and stores its kind, its subject's title (R56) and the subject's id; a re-mute keeps what the row held; a row with no kind reads the id's second segment only where `classOfKind` names it a kind of the row's class, else null; a title whose subject the viewer may no longer see is not answered (R33).
- **R59** `queueFeed({answered: true})`: `{ok, answered, count, window_days, bound, truncated}` with `resolved`, `forwarded`, `snoozed`, `set_aside` rows (`queue.answered.left` dropped: nothing here names it). `queue_state` gains `snoozed_at`. Readings I took: a `resolved` row for a member is a to-do assigned to her, unassigned, or resolved by her (literal reading of R59), and every settled bias debt R39 shows (`bias.settled` names no recipient, so it cannot be narrowed); `forwarded` is one row per forward entry by her, `to` the task's assignee only for its latest forward; a `set_aside` row also carries `project` (null for an instance decision), beyond R59's list.
- **R60** `feeds` (21 rows: `tasks`, the 19 feed ids of queue-producers R45, `notice-producers`), `all_answered`, `classes_answered`, `all_clear`. `feeds[].failed` is the list of codes the feed named (R45's `reason`s, or notice-producers' failed producer names). The class table (`Queue.QUEUE_FEEDS`) is queue's reading of which classes each feed can raise, over-stated where a feed raises several (that only withholds an all-clear); a feed id R45's list does not know gets a row raising every class. A reader not composed (notice-producers without `noticeItems`, or `facts.absent`) is not answered. queue-producers does not yet publish `facts.failed` / `facts.absent` at this tranche tip (its R45 is not met), so the consumer reads them defensively and every producer feed is `answered: true` until it does; tested with stubbed facts.
- **R61** `queueFeed({aside: true, after, limit})`: `{ok, aside, count, next, truncated}` over both scopes, newest first then scope, project, finding; instance rows from `progressions.proposalsFeed`'s `dispositions[]` (version it judged), project rows from `finding_dispositions` (`definition_version: null`, no column added); opaque cursor; a row whose project or a bundle its finding's id names the viewer may not see is left out. `title` of a project row is the first visible bundle the finding's id names (a finding's id has no fixed subject segment), null for an instance row (its subject is a progression stage). The route and the door pass `answered`, `aside`, `after`; `queueAnswer` passes the three lists through undecorated.
- **Words** (K3949, K3957, K3962): the 2 findings, the 11 `plain` and the 3 test copies fixed; also every other refusal `detail` and sentence the answers carried inline in `index.mjs` (exploreapprove, member-left-items, tension-after-publication, NO_SUCH_KIND, resolved block, BAD_KIND, BAD_UNTIL, UNTIL_IN_PAST, NO_REASON, NO_CASE, age) by `localize('queue.index.<slug>')`; the five plain catalogue sentences in `queuestate.mjs` by `localize('queue.queuestate.<slug>')`; `link-verdict-changed` reads the design's row `queuestate.link_verdict_changed`. Tests: `t50` asserts the muted keys one by one, `words.test.mjs` takes its sample from the catalogue. `node checks/words.mjs` over queue: 0 failures; over every module: no line names queue.
- **K4065**: `world.mjs` runs project-roster's `migrate()` (the 29 reds, green). Needs `project-roster` in queue's `uses` (J1).
- Stale comments (K3839): the `civicos-ui` mentions in `index.mjs` and `queuestate.mjs` reworded.
- Test-only: every positional `INSERT INTO queue_item_mutes` in the suite names its four columns now that the table has seven.

**Deferred**: none.

**Found in other modules**:
- queue-producers: R45's `facts.failed` / `facts.absent` are not published yet (not met at the tip); queue's R60 is ready for them as `[{feed, reason}]` and `[feed id]` (strings are read as ids). Its own words findings (about 14 inline, plain) are its job's.
- tasks: a `forwarded` history entry names no recipient (R59's `to` is null for an earlier forward, as R59 says); no change asked.
- Feed ids with no word key (REPORT, never inline English): of R45's ids the word table holds only `queue.allclear.failed` (for `sources`); none of `tasks`, `bias-debts`, `proposals`, `shared-inquiries`, `leads`, `exports`, `references`, `objectives`, `machinery`, `contradictions`, `signing-keys`, `action`, `attribution`, `docket`, `cited-cases`, `wizards`, `schedule`, `places`, `projects` has a key (the table holds `queue.feed.<provider>` keys for other names, and `queue.feed.notice-producers`).
- Catalogue sentences: the values of `QUEUE_OBLIGATION_KINDS`, `QUEUE_FINDING_KINDS`, `QUEUE_CONDITION_KINDS` that carry ids, ops or "LIVE:" notes are developer catalogue text no member reads (only their keys leave the module; R1 says the words members see are the design's, `queue.kind.<kind>`); the five plain ones the check counted are converted so the check is clear, the others are not hidden and not flagged.
- Reds met outside queue at the tranche tip, identical with my changes stashed: `answer-envelope` 4 (R7/R13/R15 pins), `plane` 1 (R11, R5 local-facts and filing-templates routes). Not mine.

**Tests and checks** (all from `/home/user/bio`, process repo at its tip):
- `node --test bio-plane/test/m/queue/`: 180 pass, 0 fail (was 164 pass, 29 red at K4065; plus `t51.test.mjs`, 16 tests for R58–R61). `bio-plane/test/conclude-project.test.mjs`: 1 pass. `store-door`: 48 pass.
- `node checks/format.mjs`: 0 failures. `node checks/coverage.mjs … queue`: 51 of 51, 0 failures. `node checks/ownership.mjs … queue tranche/T51 job/T51/queue`: 0 failures. `node checks/words.mjs … queue`: 0 failures.
- `node checks/architecture.mjs … queue`: 1 failure, the `project-roster` import above (J1); every other import declared.
- After K4070 (project-roster in uses) architecture passes: 0 failures; queue suite 180 pass.
- `node bio-plane/src/setup-words/build.mjs --check`: stale-rows note only (my new `queue.index.*` and `queue.queuestate.*` ids), as expected.

Size (session_01DggByiBck91qKoo2zJ1P66): test runs 12, module lines 3264

## J2 · COMPLETE

T51-104 applied: R58-R61, words (0 findings in queue), K4065 world. Queue suite 180 pass; format, architecture, coverage, ownership, words all 0 failures. Details, readings taken and REPORT items (feed ids with no word key, queue-producers R45 not yet published) are in the record.

## J3 · QUESTION

Two questions; I carry on with my best reading of each and rework only if you say otherwise.

**1 · Entry 1 (C62, doors read from the producers).** Queue cannot read a door a producer has not stated, and tasks and queue-producers are running at the same time as I am. Best reading, the smallest form that changes no service's existing answer: whatever the producer mints carries an optional `door` (an op name, or a list of op names, first the one the screen leads with). `tasks`' `recentTasks` rows carry `door` for the kinds `tasks` declares (`authority-undetermined`: `["taskdecide","taskforward","taskresolve"]`); `queue-producers`' items carry it for `endorsement-owed` (`adminendorse`, or the change's own `projectowneradd` / `projectownerremove` for an owner vote) and `expertise-confirmation-owed` (`expertiseconfirm`). Queue's disposition `instead` is the item's own `door` when it is a non-empty name or list of names, else its hand list (`OBLIGATION_DOORS`, unchanged) and `taskresolve`; `Queue.doorOf(kind, declared)` takes the declared door first. R28's bridge, which holds only a key, reads the door off the caller's live item with that id, else the hand list. This needs `tasks` and `queue-producers` to add the field (FR-21, FR-22); until they do, nothing carries it and every door is the hand list's, so my tests stub a producer that carries it. If you prefer another shape (a per-kind map each producer exports), tell me and I take it.

**2 · Entry 3 (L13, milliseconds per feed).** Queue can time `tasks` and `notice-producers` itself, but the producers' 19 feeds run inside one `queue-producers.feedItems` call, in its own `feed()` helper, so queue sees only the total. Best reading: `queue-producers` publishes `facts.ms`, `{<feed id>: milliseconds}` for each feed it reads, a feed that threw included; each `feeds[]` row of mine carries `ms` (my own measure for `tasks` and `notice-producers`; `facts.ms[feed]` for the others; `null` when a producer states none, never a made-up number), and the answer carries `feeds_ms` (the whole `feedItems` call). Please add `facts.ms` to FR-22 (a one-line CHANGE to its job); without it only three numbers are real. Separately, and mine: the home-set walk and the options are asked per item with no memory, so I memoize both per `op=queue` ask (the cost grows with distinct subjects, not items x ancestors).

## Completion (QUEUE #28, FR-23)

Requirement lines are written in `build/requirements/queue.md` (B4 option one), each marked *(not yet met: T51)*: **R12** and **R28** amended (C62, one sub-bullet under R12's tests), **R39** amended (K4213), **R91** (the feeds' time, L13) and **R92** (`DECLARED_OPS`) new. R91 is the next free id as BOB numbered it; the file's last was R61.

**Entries applied**
1. **C62** · `Queue.declaredDoor(door)` (an op name, or a non-empty list of names; anything else declares nothing) and `Queue.doorOf(kind, declared)` (the declared door first, then the hand list, then `taskresolve`). A task row's `door` (`tasks`' `recentTasks`) and a producer item's `door` are carried onto the minted item; an OBLIGATION's `disposition.instead` is that door. R28's bridge reads the `door` of the caller's own live item with that id and kind (`#bridgeDoor`: the caller's feed once, and once for a whole `items` set), else the hand list. The hand list is unchanged for every kind whose producer declares none (control test over every entry of `OBLIGATION_DOORS`). Until `tasks` and `queue-producers` mint `door` (BOB's CHANGEs, B4), nothing carries it and every door is the hand list's; the tests stub a producer that carries it.
2. **C59, C60; 4. K4202** · `DECLARED_OPS` beside the ops map: `proposedispose`, `queuemute`, `queuesnooze`. Classes, mutating, weight and description copied from the hand rows (`op-declarations` `OPS`; `op-grades` `RUNGS` for `proposedispose`, `RUNG_ABSENT` ground `caller-owned` for the two personal ops, descriptions their `NON_ACTS` sentences), read by key `queue.declared.<op>`. Both registrations accept them as agreeing (`registerDeclaredOps` of `op-declarations` and `op-grades` over a fresh instance: `agreed` all three, none refused). `proposedispose` accepts `definitionVersion` (camel), never `definition_version`. Fields: `proposedispose` requires `[project|key|progressionKey]`, `[finding|key|progressionKey]`, `[to|state]`, `reason`; `queuemute` `[item|case]`; `queuesnooze` `case` and `[until|clear]`. `decidedBy` (the control plane's stamp on `proposedispose`) is a stamp, not a field.
3. **L13** · each `feeds[]` row carries `ms` (my own `performance.now()` measure for `tasks` and `notice-producers`, a notice read that threw included; `facts.ms[feed]` for the producers' feeds when finite and at least 0, else `null`), and the answer `feeds_ms` (the whole `feedItems` call). Reads: one ask-scoped memo holds each node's edges, each ancestor's row, each subject-set's homes (copied out per item) and each subject's derived acts; the reads of one ask grow with distinct subjects and homes, not items x homes (test at two sizes: 10 and 40 tasks over the same subjects cost the same statements; 9 more homes cost at most 4 reads each).
4. **B5 (K4213)** · `Queue.resolvingEntry(history)`: `resolved` or `resolved_undecided` is the resolving event in R39's `resolved` block and R59's `resolved` rows, so a task put aside by `taskresolve` names the member who did it.

**Tests changed that already existed** (all four compared two asks of `op=queue`, which now differ in the two timing fields and nothing else, R91): `clock.test.mjs` (R53), `converts.test.mjs` (queue-conditions), `t51.test.mjs` (R60: the row's key list gains `ms`, row comparisons ignore it); `world.mjs` gains `untimed`. No assertion was weakened; each compares the same thing minus the timings.

**Deferred**: none.

**Found in other modules**
- `plane` (tests): `R2, R5 (N13)` and `R45, R48 (T47)` (`servedThroughDoor`) compare `op=queue` answered through the door with the same ask answered directly; the two now differ in `feeds[].ms` and `feeds_ms` (a measure of that ask, R91). Their `mask` (maps.mjs:217) masks instants only; masking the two timing fields (as door.test.mjs's `mask` already masks `ms`) is `plane`'s tests'. Red in the plane suite because of my change: those two. The other four plane reds (`R17, R5` case-import's map, `R24` DEC-149, `R5 (N506)` link-sweep, `R5 (T46)`) are identical with my changes stashed.
- Hand rows that can now go (each owner's row agrees with the hand row, R81 / op-grades R50): `proposedispose`, `queuemute`, `queuesnooze` in `op-declarations` (`OPS`, the `QUEUE_ACTIONS` list stays an act list) and in `op-grades` (`RUNGS`, `RUNG_ABSENT`, `NON_ACTS`).
- `tasks` and `queue-producers` have not yet minted `door` (FR-21, FR-22) nor `facts.ms` (FR-22): until they do, three rows carry a real `ms` and the other nineteen `null`, as R91 says.
- Generated artifact stale: `setup-words/rows.mjs` (`build.mjs --check` is stale; my new ids `queue.declared.proposedispose|queuemute|queuesnooze` are among the rows to regenerate; other modules' ids too).
- `queuemute` and `queuesnooze` read an `at` from the body (a caller may stamp the instant a mute or snooze is recorded at). I declared it in `accepts` because the arm reads it and the route map spreads the body; it is not a field a screen sends. Not changed: it is the in-plane callers' and the tests' clock. BOB may rule that the route should not pass it.

**Tests and checks** (from `/home/user/bio` and the process repository at its tip):
- `node --test bio-plane/test/m/queue/`: 196 pass, 0 fail (180 at the start; `doors.test.mjs` 6, `measure.test.mjs` 6, `declared-ops.test.mjs` 5 new, 1 of them R39's). Each new test seen failing against the unchanged module (7 of 7 doors/declared, 4 of 6 measure; the other two measure tests are controls that hold before and after).
- `node --test bio-plane/test/m/answer-envelope/ bio-plane/test/m/store-door/`: 89 pass, 0 fail. `bio-plane/test/m/plane/`: 262 pass, 6 fail (the two above, four unrelated).
- `node checks/format.mjs`: 0 failures. `node checks/architecture.mjs … queue`: 0 failures. `node checks/coverage.mjs … queue`: 53 of 53, 0 failures. `node checks/ownership.mjs … queue tranche/T51 job/T51/queue`: see COMPLETE. `node checks/words.mjs … queue`: 0 failures. `node checks/run.mjs` over the whole product: architecture 0 findings; words: 16 failures, none in a file of mine (op-grades' test copies, strength:349); coverage: 5 failures in other modules (agent-harness, agent-runner, installer-steps, journey-check, link-sweep).

Size (session_01LFGQNNUSg4rqKWLPjYWTBr): test runs 16, module lines 3373

## J4 · COMPLETE

FR-23 applied: C62 (doors read from the producers' declared `door`, hand list the fallback, R28's bridge reads the caller's live item), DECLARED_OPS for proposedispose, queuemute, queuesnooze (agreed with both hand rows), L13 (feeds[].ms, feeds_ms, ask-scoped reads), B5 (resolved_undecided). Requirement lines R12/R28/R39 amended and R91, R92 new are written in build/requirements/queue.md (B4 option one), so the ownership check lists that one file, as B4 accepts. Queue suite 196 pass, 0 fail; format, architecture, coverage (53 of 53), words: 0 failures. For you: plane's tests R2,R5 (N13) and R45,R48 (T47) go red on op=queue's two new timing fields (their mask covers instants only); hand rows for the three ops can go; tasks/queue-producers have yet to mint door and facts.ms; setup-words rows are stale. Details in the record's Completion (QUEUE #28).

## Completion of B6 (QUEUE #28)

`tasks` R24 merged: authority-undetermined rows carry `door` in `recentTasks`; queue already carried a row's `door` onto the item and led `disposition.instead` with it (R12), no hand list. Tests: doors.test.mjs now uses the real `tasks` door (control: a check-requested task keeps taskresolve); feed.test.mjs R12 expected the old `taskresolve` for an authority task and now expects the declared door. Queue suite 197 pass, 0 fail.

## J5 · COMPLETE

B6 applied: queue already carried a task row's door onto the item; merged tasks R24, tests now use the real door (feed.test R12 updated from taskresolve to the declared door). Queue suite 197 pass, 0 fail.

## J6 · COMPLETE

Wave-2 change B7 (K4233) applied: queue-producers R46–R51 are merged, and queue now takes what they publish.

**Entries applied**
- **R60 (B7 1)** a failed feed's row carries `read` and `code` as its failure names them (queue-producers R50): the first failure that names either one; a row with no such failure keeps its keys unchanged (control).
- **R12 (B7 2)** a members-feed item (`endorsement-owed`, `expertise-confirmation-owed`) keeps the `door` its producer declared (a name, or the owner-vote list led by its first name) and its `summary_key` / `detail_key`. The door is read from the item by `Queue.doorOf`, never a hand list; an item that declares no door takes the kind's rule (control).
- **R60 / R91 (B7 3)** `members` is a row of `feeds` (classed `OBLIGATION`, added to `QUEUE_FEEDS`), so `facts.ms.members` reaches the answer as that row's `ms`.

**Readings taken**
- `members` is added to `QUEUE_FEEDS` (queue-producers R45 names it; without the row its time and its failure could not show when it answered). The row list is now 22 rows: tasks, the 20 producer feeds, notice-producers.
- `read` and `code` are added only where a failure names them, so every other row keeps the key list R91 and R60 state.
- Requirement line amended: `build/requirements/queue.md` R60 (the fix-round sentence, test named `feeds-cause.test.mjs`). R12 needed no wording: its door sentence already covers producer items.

**Found, not changed**
- The R12 door test passes on the unchanged module too: `queue` already carried a producer's `door` onto its items and into `disposition.instead`. The fix needed was the R60 row and the `members` row; the door tests are kept as guards (control: an undeclared door takes the kind's rule).
- Generated artifact stale: `setup-words/rows.mjs` (`build.mjs --check` reports it stale, as at every layer; the new `queue.*` ids are not added this round since none was added).
- Other modules' reds at the tip, none in queue: `op-grades` words testcopies (26), `strength` inline (1), coverage in `agent-harness`, `agent-runner`, `installer-steps`, `journey-check`; `checks/run.mjs` shows them, `queue` shows none.

**Deferred**: none.

**Tests and checks** (from `/home/user/bio`, process repository at its tip, deps installed per K4113):
- `node --test bio-plane/test/m/queue/`: 203 pass, 0 fail (197 at the start; `feeds-cause.test.mjs` 6 new). Seen failing against the unchanged module: 4 of 6 (the R60 and R91 tests); the 2 R12 tests pass on it (see above).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … queue`: 0 failures. `checks/coverage.mjs … queue`: 53 of 53. `checks/words.mjs … queue`: 0 failures. `checks/ownership.mjs … queue tranche/T51 job/T51/queue`: 0 failures (1 file, the requirement file's R60 line plus the code and tests named in the commit).
- `checks/run.mjs /home/user/bio`: architecture 0 failures; coverage, words and others as listed above, none in queue.

Commit `6ee59179e6` on `job/T51/queue`.

Size (session_01EHph3RAJgMWjTJAKvQgcMD): test runs 4, module lines 3384

## J7 · COMPLETE

QUEUE #30 (session_016RSk6PPCHyxn8XjwFBsMoF), depth 2. B8 (K4238) applied; the rest of the wave-2 entries stay as QUEUE #28 and #29 completed them (their records above).

**Entry applied (B8)**: `DECLARED_OPS.proposedispose` now takes `items` as an alternative for its two identity groups: `requires` is `[project|key|progressionKey|items]`, `[finding|key|progressionKey|items]`, `[to|state]`, `reason`. `to` and `reason` stay at the top level for a set, because the set arm (`queue-states` `run`) sends them there and `#perItem` spreads them onto every item (`reason` still required: each item's refusal would be NO_REASON otherwise). No code path changed; only the declaration. Readings taken: `to` is top-level in the set the screen sends (`shared.to`), so it is not an alternative for `items`.

**Requirement line (R92, amended in `build/requirements/queue.md`)**: the set form is written into R92's sentence on `proposedispose`: a project or a key or `items`; a finding or a key or `items`; a disposition word and a reason; the set names each item's identity in the item and shares the disposition and the reason at the top level (K4238). The line is marked as before; the file is the one the ownership check lists (B4 accepts it).

**Tests** (`bio-plane/test/m/queue/declared-ops.test.mjs`), each seen failing first:
- R92 set form: `declaredOpHolds` over the set declaration (`items` first in each identity group, derived from the module's own `requires`, so the helper's base is a set). First run red: the `to` group had no refusal naming it at the top level; the set's refusal names it inside `items[]` (its own act's `NOT_A_DISPOSITION`), so the test's refusal reader now looks there too. Green after the declaration change.
- R92 control: a request with neither a project, a key, a progression nor items is refused, `NO_KEY`, naming `progressionKey`.
- R92 control: a set whose items carry no reason is refused whole (`SET_ITEMS_RETAINED`), the item retained with `NO_REASON`, nothing applied.
- The existing single-form test still holds.

**Fixture change (`bio-plane/test/m/queue/world.mjs`)**: the default fake of `progressions.disposeProposal` answered ok for any identity, so the control could not see a refusal. It now refuses an identity that names no progression as `NO_KEY`, the code progressions' own generic refusal uses (`progressions/checks.mjs` GENERIC_CODES). The fake answers ok for every call that names one, as before. No other queue test changed; the suite passes.

**Deferred**: none.

**Found in other modules**
- `screens-daily` (queue-states `identity()`, its C60): a set's `proposedispose` item for a KEY-identified finding carries `definition_version` (snake case) inside the item. The arm reads `definitionVersion` (camel) only, so the item's version is dropped and the decision binds no version (null). The single path is not affected (it sends `definitionVersion`). Owner: screens-daily; the fix is in its identity() (camel case, as the disposition's `requires` says). Not changed here.
- `progressions`: none new; its generic `NO_KEY` is the refusal the control names.
- Hand rows that can go: none for `proposedispose`, `queuemute`, `queuesnooze` beyond those listed in #28 (the declaration's fields are not compared with `op-declarations`' hand rows, which carry no fields).

**Tests and checks** (from `/home/user/bio`, lockfile directories installed per K4113: agent-runner, bio-plane/src/journey-check, file-scanner, sheet-worker, site):
- `node --test bio-plane/test/m/queue/`: 206 pass, 0 fail (203 at the start; 3 new in declared-ops.test.mjs).
- `checks/format.mjs /home/user/bio`: 0 failures. `checks/architecture.mjs … queue`: 0 failures. `checks/coverage.mjs … queue`: 53 of 53, 0 failures. `checks/words.mjs … queue`: 0 failures.
- `checks/ownership.mjs /home/user/bio queue tranche/T51 job/T51/queue`: 1 failure, `build/requirements/queue.md` outside queue's paths, tests and job record. It is the one requirement file B4 accepts at merge; no other file.
- `checks/run.mjs /home/user/bio`: format 0, architecture 0, coverage 4 failures in other modules, words 27 failures (op-grades' test copies 26, strength inline 1). None in queue.

Commit `925b86b8a8` on `job/T51/queue` (merge of `tranche/T51` at `7195cf675c` is `289423cbb2`).

Size (session_016RSk6PPCHyxn8XjwFBsMoF): test runs 9, module lines 3386
