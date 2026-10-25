# queue (T51)

**Status** · session_01YN9TEdL7KJ1syeaAkvZf85 · depth 2 · COMPLETE · handled B20

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

## J8 · QUESTION

Two queue causes in this START have no requirement line, and each runs against a line in force. I have built nothing for either. Best readings, so you can say "yes" or correct:

**C66, the `limit` cap.** R6 says `limit` is clamped to 1–500 (default 200); `queueFeed` does exactly that, and I cannot make `op=queue&limit=500` answer 400 from this module (tests: `feed.test.mjs` R6 and its `limit: 500` case answer 200; the door only passes `limit` on). The 400 the walk saw is not in queue's code; `interface-shell/browser.mjs:2368` is the caller that asks for 500. The plan says "cap the limit at 200". Best reading: amend R6 to a cap of 200 (a larger ask is clamped to 200, never refused, `limit` in the answer states what applied), and the shell (not mine) asks for at most 200. If you would rather keep 500, say so and I will leave R6 and report the 400 as outside queue. Note `#liveItem` and `exploreapprove`'s feed read use `limit: 500` inside this module and would move to 200 or to a paged read: tell me if a mute of an item past the 200th must still find its title (my reading: page until found).

**C72, "What you answered" for derived items.** R59 says the receipts of acts another module keeps (a vouching, an answer to a request to join, an approved letter) "are not rows here". An expertise confirm is such an act (`member-roster` keeps it; the item leaves the feed because `expertiseAwaitingConfirmation` stops naming it), so the cause as written reverses R59. Best reading, a new line R59a: queue lists a derived to-do as answered when its producer's module can state the receipt. Each producer module that raises a to-do (`queue-producers`' kinds: `endorsement-owed`, `expertise-confirmation-owed`, `project-invitation`, `project-request`, and the rest) publishes `answeredItems({member, viewer, since, limit})` returning `{id, kind, title, by, at}` for the acts it recorded; queue merges them into R59's `resolved` rows (`act: "resolved"`, `by_you` as for tasks), inside the same window and bound, and a producer that does not publish it is listed in the answer's `answered_unread` (never read as "none"). That is a service in `queue-producers` (and `member-roster`/`project-roster` behind it), which I do not hold; I would only consume it. Alternative (smaller, mine alone): queue records its own receipt row whenever `proposedispose`/`taskresolve` run, but an expertise confirm never passes through queue, so this does not meet the cause. The screen's handle-not-internal-id half is C94 (screens-daily, `queue-producers`).

I stop here until you answer: both decide everything I would build. Words: none needed yet.

## J9 · COMPLETE

Fix round 2, wave 1: no change to queue's code or tests, as BOB ruled (B10, K4307).

- **C66** (queue's part): R6 stands as written (clamp 1–500, default 200, never refused); queue's internal limit-500 reads stay. `op=queue&limit=500` answers 200 here (feed.test.mjs R6). The console 400 is not queue's; BOB sent it to the shell job (caller `interface-shell/browser.mjs:2368`).
- **C72** (queue's part): R59 stands. Receipts of acts another module keeps (an expertise confirm included) are not queue's rows by a requirement in force, so the derived-items half is no defect against queue; BOB places it on the design lane's later list as an observation. The founder-named-by-id half is C94 (shell's memberName, screens-daily).

Deferred: none. Found in other modules: none new.

Tests and checks: `node --test --test-force-exit bio-plane/test/m/queue/`: 206 pass, 0 fail. `checks/run.mjs`: no failure names queue (the 10 coverage failures are other modules' ids: screens-inquiry R123–R125, screens-intake R54, screens-publish R70–R72, and others); words 0 failures; channels 0. `checks/ownership.mjs … queue tranche/T51 job/T51/queue`: 0 failures.

Size (session_01FQVnGoBMzsSJMQVV911nYM): test runs 2, module lines 0

## J10 · COMPLETE

QUEUE #32 (session_01EBabhfYdEqcho6FTvR1wrp), depth 2. B11 (fix round 4, wave 1, #15): P9's provider part, queue R93. Tranche merged at start and again before this entry (wave-1 providers merged before me are read in the second merge; no scripted double stands in for one).

**Cause P9 / P10 / C14, provider part: `op=queue` with `count: true`** (`bio-plane/src/queue/index.mjs` `queueFeed`, `queueOps`, `queueAnswer`; `door.mjs` `queueFeedOp`). It answers `{ok, member, count}`: the open items the list would hold, after the mutes and the projects' decisions and before the limit's cut, so it equals the length of the same viewer's uncut list (`limit: 500` on any fixture under 500). No item, block or decoration is built or sent. The query's "true" and "1" read as the other flags do. The route passes `count` on; the door passes it to the store (and still no `now`); the decoration passes the answer through, as it does the muted list.

**The four fields**
1. Root cause: known. The frame's bell and sidebar have only the list to get a number from (`op=queue`, 10.6 KB for the smoke member, 117 KB for the walker's), and read it for themselves and the screen again. Provider fix: the number alone. What it does not do, said plainly: the feed is still assembled in the store (the count needs the mint, the mutes and the projects' decisions), so the saving is the answer's size and decoration and the second list read, not the store's assembly time; L13's per-feed times (R91) name what makes that dear.
2. Why the tests missed it: no requirement asked the frame's number of the queue, so the frame read the list (class b: reads counted, not time or size). Test-gap fix: `count.test.mjs` holds the count against the list; the users' read-set tests (control-plane, screens-daily, cause-shell-4) assert one `queue` list and the frame on `count`.
3. Failing-first (R93, `bio-plane/test/m/queue/count.test.mjs`, 4 tests), seen red before the change: `count: true` answered the full list (no `count`), the limit and mute case answered `undefined`, the route, door and decoration test failed on the decorated list, and the control (no `count`: list as before, no `count` key) passed in both states. Green after: 4 of 4. Tests: (a) count equals the uncut list's length for a member, for the query's "true" and "1", and for a machine credential, with no `items` key; (b) a `limit` of 2 does not cut it, a mute lowers it as it lowers the list, another member's count is not moved by it (R30); (c) the route, the door's pass-through (with `now` still not passed) and `queueAnswer` carry it; (d) control: `count` absent, false, "false", "0", null or "" reads the list as before, with every block, and no `count`.
4. Platform check: N for the change (pure code), with P for the baseline. Read-only probe of the smoke copy, member, 1280 px, `/app` (probe.mjs, no proxy): two `op=queue` reads per page load, 1023 ms and 1022 ms (each 10,676 / 10,564 bytes), in parallel with 15 other reads; `bootstrap` 1491 ms, `projectlist` 1491 ms. R93 is not deployed (no mid-round deploy), so its own time is first measured at the redeploy: expect the same store time, a few hundred bytes, no second list.

**Requirement ids met**: R93 (marked met in `build/requirements/queue.md`: the line now states the count's definition, the door and the decoration; ownership lists that one file, accepted at the merge by B4). No other line proposed.

**Tests and checks** (from `/home/user/bio` after the second merge)
- `node --test --test-force-exit bio-plane/test/m/queue/`: 210 pass, 0 fail (206 before; 4 new).
- Impact (`impact.mjs origin/tranche/T51 HEAD`: queue, store-door, control-plane, plane; 90 test files): every file passes but five, which fail identically on the tranche tip without my change, so not mine: `plane/disclosures.test.mjs`, `plane/release.test.mjs`, `plane/roster.test.mjs`, `plane/store.test.mjs`, `store-door/declared-ops.test.mjs`.
- `checks/run.mjs`: format 0, architecture 0, channels 0; coverage 15 failures and words 3, none naming queue (coverage: acquisition R99, agent-harness R17, agent-runner R37 R38, citation R21, control-plane R120–R122, installer-steps R26 R31, interface-shell R120, journey-check R19, jurisdictions R96 R97, money R29, pdf-reader R40 R41, public-read R42, screens-daily R95, screens-inquiry R129, screens-publish R80: unmerged providers' and users' ids; words: op-grades inline strings). `coverage.mjs … queue`: 54 of 54, 0 failures. `words.mjs … queue`: 0 failures.
- `checks/ownership.mjs /home/user/bio queue tranche/T51 job/T51/queue`: 1 failure, `build/requirements/queue.md` outside queue's paths, tests and job record: the one requirement file B4 accepts at the merge.

**Questions**: none open. **Reported to BOB**: nothing new in another module. Users of R93 for BOB's order: control-plane's frame read (`bootstrap` once; `Server-Timing`), screens-daily's bell and sidebar (C70's numbers equal the items), cause-shell-4's shared frame reads; each reads `op=queue&count=true` for the number and `op=queue` only on the Queue screen. Hand rows that can go: none.

Commit `b2776a6fbe` on `job/T51/queue` (the change is `b6d3a06377`).

Size (session_01EBabhfYdEqcho6FTvR1wrp): test runs 12, module lines 3391

## J11 · QUESTION

QUEUE #33 (session_0193vawNA3pryumn3wcVVBRD), T51 fix round 7, G61 and G80. Both causes are built and tested on `job/T51/queue`; one thing is missing for COMPLETE, and it is not mine.

**What I need (the smallest thing):** record-core's R89/R90 (`writeCount()`) on `tranche/T51`. Your START says it is "merged before you"; at `origin/tranche/T51` e897c62d73 it is not (`git grep writeCount origin/tranche/T51 -- bio-plane/src` finds nothing). `job/T51/record-core` has it (6a71a26b96, 41d4267568, triggers on every declared table; its job is still running its users sweep). My seam test `r7-count-cache.test.mjs`, "R93 (G80, seam: record-core R89, R90)", is red by name on my branch for that reason and green when I merge record-core's branch into a scratch copy (tasks' `taskResolve` moves the counter, the next count is recomputed and right). Please merge record-core into `tranche/T51` when its job completes, or tell me to COMPLETE with that one test named red (I will not, under R-NOTMET, unless you say so). I will merge the tranche, re-run, and COMPLETE.

**Done meanwhile**
- G61 (certain): `ingest-done`, `ingest-stopped`, `fetch-done` added to `QUEUE_FINDING_KINDS`. The catalogue cross-check test (`catalogue.test.mjs`, "R1 (G61)") was red with the three, and with SIX more the same scan found that producers mint and the catalogue does not name (each would refuse a member's whole Queue the same way): `edition-scheduled` (CONDITION), `edition-published-as-scheduled`, `scheduled-edition-stopped` (queue-producers R37), `place-profile-arrived` (CONDITION, R38), `wizard-base-updated` (R39), `request-unsent` (CONDITION, action-producers R25). All nine are now named, in the class their producer mints. Owed to UX-DESIGN (T52, K4269): the plain names `queue.kind.<kind>` for those nine (`t50.test.mjs` R55 names them as the exact owed set, so a row arriving makes it fail until the list shrinks).
- G80: `op=queue&count=true` keeps one count per (member, viewer), record-core's write counter, this module's own writes (mutes, snoozes, project decisions: its own tables) and a 5 s bucket of the clock; no counter stated by record-core means nothing is kept; refusals are not kept. 10 tests in `r7-count-cache.test.mjs` (the recompute counted via the producers' and tasks' reads, not timed); 9 were red before the change.

Reports for you (other modules): queue-producers and action-producers export no kind table, so the cross-check cannot read their kinds from a table (queue-producers' `SCHEDULED_KINDS` is read; the others are listed in the test); a producer-by-producer end-to-end invalidation (each real producer's write moves the counter) is the control-plane seam file's (Miniflare), as record-core's R89 test is for the write paths; membership's and any other module's writes that bypass record-core's declared tables would be stale for up to 5 s.

## J12 · COMPLETE

QUEUE #33 (session_0193vawNA3pryumn3wcVVBRD), T51 fix round 7, G61 and G80. Tranche merged (record-core's R89/R90 in it).

**G61** (`queuestate.mjs`): `ingest-done`, `ingest-stopped`, `fetch-done` added to QUEUE_FINDING_KINDS, plus six more producers mint and the catalogue did not name: `edition-published-as-scheduled`, `scheduled-edition-stopped`, `wizard-base-updated` (FINDING); `edition-scheduled`, `place-profile-arrived`, `request-unsent` (CONDITION, in QUEUE_CONDITION_KINDS). Each with one code-origin sentence. Failing-first: `catalogue.test.mjs` "R1 (G61)" (NOTICE_KINDS and QueueProducers.SCHEDULED_KINDS against classOfKind, plus the three producers without a table) red before, green after; R1 and R5 lists updated (condition kinds 22 to 25). Rows owed to UX-DESIGN (T52): `queue.kind.<kind>` for the nine (the three of B13 are written ahead); `t50.test.mjs` R55 names the owed set exactly. Door test (member's whole Queue with ingest-done) is control-plane's seam file. Platform: N; P at the re-walk. Old records: none.

**G80** (`queue/index.mjs`, R93's count): one count per (member, viewer), `record.writeCount()`, this module's own writes (`#wrote()` at its five table writes) and a 5 s clock bucket (QUEUE_COUNT_BUCKET_MS); no counter stated means nothing kept; refusals not kept; at most 256 viewers kept. Failing-first `r7-count-cache.test.mjs` (11 tests, the recompute counted via the producers' and tasks' reads): 8 of 11 red before the change (the 3 controls pass in both states), the seam test red until the tranche merge, all green now. Tests cover repeat, per viewer, counter moves for each feed id, whole-counter key, own acts (item mute/unmute, kind mute/unmute in a case, snooze, clear), project decision, bucket (and clock going back), no-counter, refusal, and the real counter via tasks' `taskResolve`. Platform: L (contention run) then P (R-QUIET) are BOB's re-walk. Old records: none.

**Suites and checks**: queue suite 222 pass, 0 fail. Impact set (store-door, control-plane, plane; 77 files): 519 tests, 518 pass; the one failure is `plane/release.test.mjs` R24 (words list lacks `screen.objective.purpose`), failing identically on the tranche tip, not mine. checks/run.mjs: format 0, coverage 0 (queue 54 of 54), channels 0; architecture 1 failure, queue-producers' test imports `content`, not declared (not mine); words: no finding in queue's files, counts 694305 literals vs tranche tip. ownership: 6 files, 0 failures.

**Requirement lines proposed (BOB writes)**: R1 gains the nine kinds with their classes (list above); R5 adds edition-scheduled, place-profile-arrived, request-unsent to the queue-only conditions; R93 amended: a count asked again for the same viewer with no write to the record (record-core R90) or to this module's tables since, within one 5-second bucket of the clock, is the answer already made; never kept without a counter or for a refusal. Census ops: none new. Rows owed: above.

Reports (noted by BOB at B14): queue-producers/action-producers export no kind table; writes bypassing the record's tables (none, per B15: total_changes) stale at most 5 s.

Size (session_0193vawNA3pryumn3wcVVBRD): test runs 6, module lines 3438

## Completion (QUEUE #34, fix round 8, G116; START B16)

**Applied: G116 / R94** (`bio-plane/src/queue/index.mjs`). One derivation per (member, viewer, signature) now serves the list, the count and the bridge's feed reads. `queueFeed` is split into `#derive` (the tasks, the producers' and notices' items, the mint, the project decisions, the mutes, the disposed rows, the feeds' rows and the all-clear: everything that needs the feeds) and the answer's own tail (the snoozes at the ask's instant, R49's sort, the cut, the counts); the signature is R93's (`writeCount()`, own writes, the 5 s bucket), the cache holds at most 256 viewers, nothing is kept without a counter or for a refusal, and every answer is made from a copy (`structuredClone`) so a caller's change reaches no other answer. `resolved` (R39) is read lazily on a list and kept with the derivation. Own writes: the item-mute path now counts its write again after the insert (the live-item lookup derives the feed between the first bump and the insert, so without it a derivation made without the new mute would outlive it).

**G116 fields.**
1. *Cause.* Certain for the sharing: `queueFeed` re-derived the whole feed for every list ask (`index.mjs` old 1138-1441 ran per call; only `count: true` was kept, old 1130-1137), and the live item-mute lookup (`#liveItem`, `queueFeed({limit: 500})`) derived it again; so a screen (the list, then the count, then a mute's lookup) made two or three derivations. The live cost factor stays unknown here (diagnosis-R8-speed.md B): the logging it needs rides this change. **`rows-queue` figures:** a miss states `derivation.rows_read` and `rows_written` (the sums of the `rowsRead` and `rowsWritten` of every cursor the storage's `exec` handed out during the derivation, the platform's own counters, no clock; null where the runtime states none, never a made-up number) and `items_by_producer` (`tasks`, `queue-producers`, `notice-producers`); one log line per miss `{"event":"queue_derive","module":"queue","rows_read","rows_written","items_by_producer","items"}`, counts only; a hit states only `{served: "hit"}`.
2. *Why missed, gap fixed.* No test put two reads of one screen through one viewer and counted the producers' read; the pinned control of `r7-count-cache.test.mjs` asserted the opposite (the list made on every ask). The unit `r8-derive-once.test.mjs` counts the producers' read for the list, the muted list, the count and a cut list; the pinned control is rewritten to R94 with the stale-list control.
3. *Failing-first.* `r8-derive-once.test.mjs`, against the previous module code: RED `3 !== 1` ("four reads of one screen, the producers read once (before: 3)"); the marks, the figures, the log line, the write controls and the lapsing-snooze control were red (6 of 7). Green after: 7 of 7; `r7-count-cache.test.mjs` (rewritten control "R94 (G116, control; replaces R93's pin ...)" plus the stale-list control): 11 of 11; whole queue suite 229 of 229, also on one core (`taskset -c 0`); the two new/changed files five times: 18 of 18 each. The seam file's count section (cases 1-4, control-plane's) is not mine; it reads `derivation.served` and `rows_read` below.
4. *Platform.* **L** by the counts above (a stand-in producers' read, R-CLOCK); **P** is BOB's re-walk (R-QUIET): `rows_read` of a miss against `items` names the cost factor.

**For control-plane (phase clock, review G4)** — the figures ride every `op=queue` list and count answer in `result.derivation`: `served` (`"hit"` | `"miss"`) for `queue-count;desc=`, and, on a miss, `rows_read` (a number or null), `rows_written` (a number or null) and `items_by_producer` for `rows-queue`. `queueAnswer` passes `derivation` through untouched. The muted list, the answered list and the aside list carry none: they read only this module's tables and make no derivation of the feeds (the START's "muted list is a separate derivation" is not what the code does: the second derivation was the mute's live-item lookup, now served by the kept one).

**Behaviour changes to know (all inside R94's reading).** (a) The tasks read is now `QUEUE_TASKS_READ_MAX` = 1000 (the old `limit * 2` at the largest limit), whatever limit the list asked, so the one derivation serves every limit and the count equals the uncut list; a small limit now sorts the whole set and then cuts (before: tasks past `2 * limit` never reached the sort). (b) A hit's `age.ms`, `feeds[].ms` and `feeds_ms` are the producing derivation's, at most one bucket (5 s) old; the snoozes are read at each ask's own instant. (c) A producer whose answer changes with no row written anywhere is seen at the next 5 s bucket, as the count already was (R93): tests that swap a producer's fake between two reads now move `w.now` one bucket (`converts.test.mjs` twice) and `clock.test.mjs` re-snoozes between asks so each is its own derivation; `doors.test.mjs` R28 expects one read for the set and none for the single refusal after it; `untimed` (world.mjs) and `plainCount` strip the serving mark.

**Requirement wording proposed (BOB writes).** R94: replace "Each answer of `op=queue` states ... `queue-count` ... and, for a miss, `rows-queue`" by "Each list or count answer states in `derivation` how it was served (`served`: `hit` or `miss`) and, for a miss, `rows_read`, `rows_written` and `items_by_producer`, which control-plane carries as `queue-count` and `rows-queue`; the muted, answered and set-aside lists make no derivation and state none"; and add the tasks read's fixed bound (1000) and the hit's ages (at most one bucket old). Strike "(not yet met: T51)" once G115's counter is merged.

**Found in other modules.** (1) `plane` `test/m/plane/compose.test.mjs:105` (R11 "queue is handed the composed filing-templates and local-facts"): reads `op=queue` for `bob`, then replaces `filingTemplatesOf(...).reviewsRequested`, `actionClocksOf(...).calendarFactsRead` and `localFactsOf(...).factsDue` with fakes and reads again expecting the new item, with no row written between; the second read is now the kept derivation (a write or a 5 s bucket moves it). The fix is the plane's test: write a row the real way between the reads, or read the first answer with a count that does not keep it. RED on my branch, green on `tranche/T51`; the other failing test of the impact set, `plane/release.test.mjs` R24, fails on the tranche tip too (as at J12). (2) record-core's `writeCount()` on `tranche/T51` is still the `total_changes()` version; G115's exclusion is not merged, so live the key still moves with every foreground request (G115's temporary state): case 3 (one derivation per wave) holds, cases 1-2 wait for it, as the START states. (3) `items_by_producer` has three producers because `queue-producers` tags no item with its feed; a finer figure needs a tag there.

**Checks** (civicos-process `checks/`, each read by its failure count): format 176 modules, 0 failures; architecture 41 product files, 0 failures; coverage queue 55 of 55 ids, 0 failures; words queue, 0 failures; ownership 10 files, 0 failures. Impact set (`build/plan/impact.mjs`: queue 32, store-door 6, control-plane 17, plane 59 files): 547 tests, 545 pass, 2 fail (the two above). Census ops: none new.

Size (session_011pqGr91RHciRQowMDqiftF): test runs 14, module lines 2948

## J13 · COMPLETE

QUEUE #34 (session_011pqGr91RHciRQowMDqiftF), T51 fix round 8, G116 (R94). Complete on `job/T51/queue`; the record's last section has the four fields, the control-plane contract and the wording.

**Built.** One derivation per (member, viewer, signature) serves the list, the count and the bridge's feed reads; every answer is made from a copy; the item-mute path counts its write again after the insert. A miss states `derivation: {served: "miss", rows_read, rows_written, items_by_producer}` and logs one `queue_derive` line; a hit states `{served: "hit"}`. Control-plane carries them as `queue-count;desc=` and `rows-queue` (the muted, answered and aside lists make no derivation and state none).

**Failing-first:** `r8-derive-once.test.mjs` RED `3 !== 1` against the previous code (6 of 7 red), green after; `r7-count-cache.test.mjs` rewritten to R94 with the stale-list control. Queue suite 229 of 229 (also on one core); format, architecture, coverage, words, ownership 0 failures.

**For you:** (1) `plane` `test/m/plane/compose.test.mjs:105` (R11) swaps three providers' answers between two reads with no row written, so its second read is now the kept derivation: a plane test fix (write a row between), not mine. `plane/release.test.mjs` R24 fails on the tranche tip too. (2) record-core's `writeCount()` on `tranche/T51` is still the total_changes version; G115's exclusion is unmerged, so case 3 holds and cases 1-2 wait, as the START states. (3) Behaviour notes and the proposed R94 wording are in the record (tasks read fixed at 1000; a hit's ages are at most one bucket old).

## Completion (QUEUE #35, job 70, fix round 9 batch D: R1 `reading-ended`, G135f, K4933)

**Entries applied.** `classOfKind("reading-ended")` answers `FINDING` (`bio-plane/src/queuestate.mjs`, `QUEUE_FINDING_KINDS`), with one code-origin sentence ending "— LIVE: notice-producers R29". R1's wording was already on the tranche.

**Failing first.** `catalogue.test.mjs` "R1 (G61)" was red on `reading-ended` (`AssertionError: reading-ended`); green after. It now also names `reading-ended` as FINDING with a sentence. Two hand lists in my own tests that must equal the catalogue's kinds gained the kind and went red until then: `catalogue.test.mjs` R1 (the FINDING list) and `t50.test.mjs` R55 (the kinds with no `queue.kind.<kind>` row yet, OWED). Control: every other kind's class unchanged (the same R1 test over all kinds).

**Words.** No words row is needed by the check (words queue: 0 failures). The plain name `queue.kind.reading-ended` is owed to the design stream, as for `fetch-done`; it is in R55's OWED list in `t50.test.mjs` and that assertion fails when the row arrives, until the kind leaves the list.

**Not mine, seen on the impact set** (`build/plan/impact.mjs origin/tranche/T51 HEAD`: queue 34, store-door 6, control-plane 17, plane 64 files; 599 tests, 596 pass, 3 fail). The same three fail on `tranche/T51` without my change: `control-plane/t51-visitor-copy.test.mjs` (R104 R100 R99 E8), `plane/release.test.mjs` R24 (known since J12), `plane/g41-shape.test.mjs` (R84 G41, the 200,000-row xlsx).

**Checks** (each read by its failure count): queue suite 229 of 229; format 176 modules, 0 failures; architecture 41 product files, 0 failures; coverage queue 55 of 55 ids, 0 failures; words queue, 0 failures; ownership 4 files, 0 failures.

Size (session_01MHgZjvBKiaDWFEhDJRUvf3): test runs 7, module lines 2956

## J14 · COMPLETE

QUEUE #35 (session_01MHgZjvBKiaDWFEhDJRUvf3), job 70, R1 reading-ended (G135f, K4933). Complete on job/T51/queue; the record's last section has the fields. classOfKind('reading-ended') is FINDING with a code-origin sentence (notice-producers R29). Red first: catalogue.test.mjs R1 (G61), then green; two hand lists in my tests (R1's FINDING list, R55's OWED list) gained the kind. Queue suite 229/229; format, architecture, coverage, words, ownership 0 failures. Impact set 599 tests, 3 red, the same 3 on tranche/T51 without my change (control-plane t51-visitor-copy, plane release R24, plane g41-shape). Owed to the design stream: the plain name queue.kind.reading-ended.

## J15 · COMPLETE

B18 applied: merged origin/tranche/T51 (no node_modules entry tracked in my branch; diff vs tranche is 4 files: queuestate.mjs, two queue tests, my record). Queue suite 229/229. COMPLETE stands.

## Completion (QUEUE #36, fix round 10, Wave B batch 6: 8 own fixture lines, B19)

**Applied (FIX-E, the providers' fixtures taken in place of hand-built answers).** `world.mjs` `defaultFakes`: `provenance.homeOf` from provenance's `homeOfEmpty()`; `progressions.disposeProposal`'s refusal branch from progressions' `disposeProposalRefusal()`; `monitoring.monitoring` from `monitoringReads().empty` (the harness awaits it once at load); `docket.coreDue` from docket's `coreDue().unread`; each answer is copied (`structuredClone`) per call. `dispose.test.mjs` and `converts.test.mjs`: the `disposeProposal` spy returns progressions' `disposeProposalOk(args)` (the real success, over a world that holds the progression). `noticed.test.mjs`: `people` is people's `checkResults`, `moneyChecks.noticed` is money-checks' `noticed()`. `watched.test.mjs`: the refusal code `STEP_GONE` (no product file gives it) is the real `WIZARD_STEP_REFUSED` with its check `C-131.7`. In `dispose.test.mjs` R27 the call now names definition version 1, the version the provider's real world holds (the old fake accepted any).

**Markers added:** no `fixtures-own`, no `fixtures-generic`, no `fixtures-contract` (every provider was FIX-E).

**Lines.** `fixtures.mjs . queue --list`: 8 failures before; 7 of my 8 lines gone. Left, named: `noticed.test.mjs:292` (`notices:` op table, tag `op-table notices`): it stood on `people` and `moneyChecks`, now fixtures; it still lists because the same table holds `duties.dutiesOf/occurrencesOf`, `answers.standingAnswersFor` and `inquiry.datedWaits` answers, which are not in this batch (they need fixtures from duties, answers, inquiry that do not publish these answers yet: waiting).

**NEEDS BOB (not mine to change).** `node checks/architecture.mjs . queue` has 5 failures: each fixtures import is a test import of a module queue does not declare in `uses` in `build/modules.json` (the K1088 case): `people` and `money-checks` (noticed.test.mjs), `provenance`, `monitoring` and `docket` (world.mjs). `progressions` is already declared. Adding those five edges (all earlier modules) clears it.

**Checks.** queue suite 229 of 229; format 0 failures; coverage queue 55 of 55, 0 failures; words queue 0 failures; ownership 0 failures; architecture 5 failures (the edges above); fixtures 1 failure (the waiting line above).

Size (session_01YN9TEdL7KJ1syeaAkvZf85): test runs 3, module lines 2956

## J16 · BLOCKED

BLOCKED (cause: needs BOB). B19 applied on job/T51/queue: 7 of my 8 fixture lines now take the providers' published fixtures; queue suite 229/229; format, coverage, words, ownership 0 failures. Two things left, in my record's last section. (1) NEEDS BOB: architecture queue has 5 failures because the new fixture imports are of modules queue does not declare in uses (K1088's case): add to queue's uses in build/modules.json the earlier modules people, money-checks, provenance, monitoring, docket (progressions is declared). modules.json is yours, not mine. (2) fixtures list keeps noticed.test.mjs:292 (op-table notices): people and money-checks halves are done; the same table holds duties, answers and inquiry answers with no published fixture for them, so that line waits on those providers. No marker added. Say when the edges are on tranche/T51 and I merge and re-run the checks, then COMPLETE.

## Completion, after B20 (QUEUE #36)

Merged `origin/tranche/T51` (the five `uses` edges, K5103). Architecture queue: 0 failures. Queue suite 229 of 229; format 0; ownership 0 (6 files); coverage 55 of 55; words 0; impact set (queue only, 31 test files) is the queue suite. Fixtures: 7 of 8 lines done; no `fixtures-own`, `fixtures-generic` or `fixtures-contract` marker added.

**Left, per B20 (2): `noticed.test.mjs:292`, the `notices:` table of the real `noticeProducersOf`, test "R51, R7, R11, R12, R14, R49" (lines 295-302).** Three providers' ops there are still hand-built:
- **duties** `dutiesOf(...)` → `{ok: true, duties: []}` and `occurrencesOf(...)` → `{ok: true, occurrences: []}`: duties' real answer for a viewer holding no duty; needed throughout the test (the producers read them on every feed read; none is expected in the feed).
- **answers** `standingAnswersFor({member, ...})` → `{ok: true, cursor: null, entries: [{question: {id: "STQ-1", question}, run: "r1", at, finds: {ids: ["DOC-2"]}, answer: null, held_back: "ai_off", label}]}`: one standing question of the viewer whose run is held back because AI is off, with the finds it kept; the test needs it for the item `FINDING::standing-answer::STQ-1::r1`, and asserts the call's `member` is `member:alice`.
- **inquiry** `datedWaits({viewer, ...})` → `{ok: true, zone: "America/Los_Angeles", waits: [{inquiry: "INQ-1", index: 0, text, description, date: "2026-08-31", state: "due", set_by: "member:alice", set_at}]}`: one dated wait on the question INQ-1 that the test also writes into its world (`w.bundle("INQ-1","inquiry")`, a leg to DOC-2, cited by PRJ-A), due before `NOW`; needed for `OBLIGATION::inquiry-recheck-due::INQ-1::2026-08-31` and asserts the call's `viewer`.
Each provider's follow-up fixture should return these by its real code (duties: empty and, if wanted, one; answers: one held-back standing run; inquiry: one due wait on a stated question); I re-point the line then.

Size (session_01YN9TEdL7KJ1syeaAkvZf85): test runs 4, module lines 2956
