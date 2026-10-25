# connections (T51)

**Status** · session_01KxwDp4ty9H6XwcoGUpKoBx · depth 2 · WORKING · handled B7

## J1 · REPORT

B2 handled: both reasons are keyed on the job branch already (mentioned.mjs MENTIONED_UNDATED, stepsources.mjs STEP_SOURCE_UNDATED, commits d3d66eed13 and e34b6eb307). explore test/m/explore/real-connections.test.mjs: 1 pass, 0 fail on this branch. Connections: 129 tests pass; words check 0 failures on the committed tree. Still open on my side: the sentence fragments held in test regular expressions (a sub-agent is converting them), then the final checks, the Size line and COMPLETE.

## Completion record (T51-193, the words pass for connections)

**Applied.** T51-193: the 14 findings of `build/plan/words-pass/connections.md` (the inline and test copies) and its 11 plain findings, each read through `localize` (ids `connections.<file>.<slug>`, fixed once) or `word` (existing words.json keys, for sentences equal to a row: `connections.target_bytes_seen`, `connections.version_target_source`, `connections.says.longer_member`, `connections.says.longer_proposed`, `duties.why.read_names_member` for the viewer refusal, which also sits under the same sentence in hypotheses). The undetermined reasons of `mentioned_together` and `step_source` answer `{key, vars}` (`MENTIONED_UNDATED`, `STEP_SOURCE_UNDATED`), so the owner-conformance battery passes and explore's real-connections test is green (BOB's CHANGE B2).

**Beyond the checker (R13, K3964, K3974).** Refusal details, composed `why` and `says` sentences, the kind words, the `choose` label fragments ("recorded: ", "already the choice, so nothing was written: ") and the NEED_CAPTURE detail in `ops.mjs` are keyed too, each rendering the same text. Test regular expressions and substring checks on those sentences are now equality or `includes` against the same `localize`/`word` call; a test never repeats a sentence it did not get from a key.

**Deferred.** None. Two judgements for BOB: (1) the viewer refusal reuses `duties.why.read_names_member`, because connections cannot add a row to `words.json`; (2) a few test checks take a reference (`ref`) or a count out of the output they check, to build the expected `localize` call (read, converts-reads, read's R10/R11 test). Those tests fix the template and the other vars, but the reference itself is read from the answer, not from the fixture. The checks are weaker than full equality there; a fixture-level expected value would close it.

**Tests and checks run** (on the pushed tree, job branch at `984a22b6b1` plus the record):
- `node --test test/m/connections/*.test.mjs`: 129 tests, 129 pass, 0 fail.
- `node test/m/explore/real-connections.test.mjs`: 1 pass, 0 fail.
- `checks/words.mjs /home/user/bio connections`: 0 failures; inline 0, plain 0, testcopy 0, missingkey 0, marker 0.
- `checks/format.mjs /home/user/bio`: 175 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio connections`: 25 product files, 112 relative imports, 0 failures.
- `checks/coverage.mjs /home/user/bio connections`: 69 of 69 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio connections tranche/T51 job/T51/connections`: 20 files, 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: the stale-rows note for `rows.mjs` (expected), no refusal naming connections.
- `checks/run.mjs /home/user/bio`: format and architecture 0 failures; the words check reports the other 173 modules' findings, none in connections; coverage shows 30 failures across the tree, none in connections (the accepted reds of rule 5, not this module's).

**Size (session_01B18LY8jj8WugArr9aZjMRC): test runs 20, module lines 2347.** The module-lines count is the non-blank, non-comment lines of `bio-plane/src/connections/*.mjs`; the test-run count is approximate, from the runs of this session.

## J2 · COMPLETE

T51-193 done on job/T51/connections (head b2b0bd99cf). 129 connections tests pass; explore real-connections passes; words check 0 failures for connections; format, architecture, coverage (69 of 69) and ownership pass; setup-words check shows only the expected stale-rows note. Refusal details, composed sentences and test sentence checks are keyed (R13). Two judgements for BOB: the viewer refusal reuses duties.why.read_names_member; some test checks take a reference from the output they check, weaker than full equality. Full record and Size line in build/jobs/T51/connections.md.

## Completion record (FR-13, the fix round: C28, C29, the census)

**Entries applied.**
1. **C28 (R70).** A connection row read by capture (`op=connections&sha256=`) now carries `mentions`, the mentions of the row's entity in that document, each `{ref, occurrence, position, grade}` (occurrence the key `connectionchoose` takes, null where the reading kept none; position null where unplaced), ordered by reference and then the reading's order, cut at 256 (R14's bound on listed occurrences) with `mentions_truncated`. The entity arm and the content arm are unchanged; a row whose document the viewer may not see carries neither field (R33). `connectionchoose` is unchanged: it already takes any listed `ref` and `occurrence` and treats the chosen one as a no-op (R14, R16). The mention read is one private method now shared with the part-grade read (`#mentionsRead`), memoised per entity in a capture-arm read. `converts-position.test.mjs` line 99 now expects the capture arm's keys plus these two (R4 as amended by R70).
2. **C29 and the census (R71).** `DECLARED_OPS` exported beside `connectionsOps`, ten ops: `connect`, `connectionassert`, `connectionchoose`, `stepsource`, `stepsourcewithdraw`, `themedeclare`, `themeplace`, `themepropose`, `themeread`, `themewithdraw`. Classes, `mutating`, weight and description copied from the op's existing rows (`op-declarations` OPS and t48 family, `op-grades` RUNGS / RUNG_ABSENT / NON_ACTS; `connect`'s description is its NON_ACTS reason, its weight its RUNG_ABSENT ground `substrate`); `stepsource` and `stepsourcewithdraw` carry `machineClasses: []` as their t48 family row says. Fields read from the arms: `connect` accepts `id`, `entityId`, `limit`, requires one of `entityId` / `id`; `connectionassert` accepts and requires `a`, `b`, `basis`; `connectionchoose` accepts `capture`, `other`, `entity`, `ref`, `occurrence` and requires all but `occurrence`; `stepsource` accepts and requires `relation`, `captureSha`, `extent`, `basis`; `stepsourcewithdraw` accepts and requires `id`, `reason` (the arm reads its own `reason`); `themedeclare` accepts and requires `name`, `test`; `themeplace` and `themepropose` accept `theme`, `target`, `note` and require `theme`, `target`; `themeread` accepts `id`, `q`, `limit` and requires none; `themewithdraw` accepts and requires `theme`, `target`, `reason`. Judgement for BOB: `connect`'s `assertedBy` is read from the body by the arm but the control plane overwrites it with `system` (control-plane index.mjs:3028, R38), so I treat it as the door's stamp and leave it out of `accepts`.

**Requirement lines for BOB to fold (the ownership check refuses my writing `build/requirements/connections.md`; I wrote them there, saw the refusal, and took them back out; the tests name R70 and R71).**
- **R70** (T51; C28; K4165; amends R4, R14) *(not yet met: T51)* A member can choose a mention other than the one the record chose. A connection row read by capture (`op=connections&sha256=`) carries `mentions`, the mentions of the connection's entity in that document, each `{ref, occurrence, position, grade}`: `occurrence` the key `connectionchoose` takes (null where the reading kept none), `position` where it was read (null where unplaced), ordered by reference and then in the order the reading kept them. A name mentioned in three places lists the three. The list is cut at 256 (R14's bound on listed occurrences) and `mentions_truncated` says so. A row read by entity or by content id carries neither field, and a row whose document the viewer may not see carries none (R33). `connectionchoose` accepts any listed mention by its `ref` (and `occurrence`) and writes it; the mention already chosen writes nothing (R16).
- **R71** (T51; K4168, K4190, K4202; `op-declarations` R80, `op-grades` R49) *(not yet met: T51)* The module states, as `DECLARED_OPS` beside its ops map, each op it serves that a screen sends or that this tranche adds: `connect`, `connectionassert`, `connectionchoose`, `stepsource`, `stepsourcewithdraw`, `themedeclare`, `themeplace`, `themepropose`, `themeread` and `themewithdraw`. Each row carries the op's classes, `mutating`, weight and description as `op-declarations` and `op-grades` already give them, and `fields: {accepts, requires}` read from the op's arm (the door's stamps, among them `viewer`, `author`, `member`, `declarer`, `placer`, `proposer`, `actor`, `administer`, and `connect`'s `assertedBy`, are not fields). A test holds each declaration true by calling the op as the door does (`test-support` R15). Item 3's census line is this same R71: the ten ops are one declaration.

**Needs BOB (not mine to write).**
1. `build/modules.json`: `connections` does not list `test-support` in `uses`, so `checks/architecture.mjs` reports the one finding "declared-ops.test.mjs imports bio-plane/test/declared-ops.mjs of test-support, which connections does not declare in uses". Adding `test-support` to its `uses` (as `lines`, `bias`, `money` have) clears it; nothing else in the architecture check fails.
2. R70 and R71 above into `build/requirements/connections.md`. Until they are there, the coverage check shows 69 of 69 live ids (R70, R71 not yet live); with them it shows 71 of 71, every id named by a test.

**Hand rows that can now go** (each agrees with my row; `op-grades.registerDeclaredOps` over every module's rows answers all ten as `agreed`, `op-declarations.registerDeclaredOps` accepts them; those rows are another module's, so I did not touch them):
- `op-declarations`: OPS rows `connect`, `connectionassert`, `connectionchoose`, `themedeclare`, `themeplace`, `themepropose`, `themeread`, `themewithdraw`; the t48 family row for `stepsource` and `stepsourcewithdraw`.
- `op-grades`: RUNGS rows `connectionassert`, `connectionchoose`, `themedeclare`, `themeplace`, `themepropose`, `themewithdraw`, and t48's `stepsource`, `stepsourcewithdraw`; RUNG_ABSENT `connect`; NON_ACTS rows for all ten (t48's two for the step sources).

**Found in other modules.** `screens-inquiry/document.mjs:726` sends `connectionchoose` with `ref` only when the element carries one; `ref` is required (an empty one is `CONNECTION_CHOICE_NOT_A_MENTION`), so interface-shell's guard will name it for that screen's job, and its mention control should take its `ref` and `occurrence` from this entry's `mentions`. No other flaw found; nothing deferred.

**Tests and checks run** (job branch, after the commit):
- `node --test bio-plane/test/m/connections/*.test.mjs`: 145 tests (5 new in `mentions.test.mjs`, 12 in `declared-ops.test.mjs` with the existing), 145 pass, 0 fail. The declaration test was shown to fail on a wrong `requires` and on an undeclared read field, then restored.
- Users of the capture-arm read: `node --test bio-plane/test/m/question-explorer/` 46 pass; `bio-plane/test/m/explore/` 57 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 175 modules, 0 failures. `checks/words.mjs /home/user/bio connections`: 0 failures. `checks/ownership.mjs /home/user/bio connections tranche/T51 job/T51/connections`: see the last line of this record. `checks/architecture.mjs`: 1 finding, item 1 above. `checks/coverage.mjs`: see item 2.
- `checks/run.mjs /home/user/bio`: the findings in other modules are not mine (coverage in agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep, monitoring; words testcopy in `op-grades/t48.test.mjs:34`, which copies the very sentence my `stepsource` row now also holds).

**Size (session_01Ftd8r8DmURcdkXQn83Gtzb): test runs 16, module lines 2379.**

## J3 · COMPLETE

FR-13 done on job/T51/connections (head a0b8a2d2b3).
C28 (R70): a connection row read by capture lists the entity's mentions in that document ({ref, occurrence, position, grade}, cut at 256 with mentions_truncated); connectionchoose takes any listed one, and the chosen one is a no-op.
C29 and the census (R71): DECLARED_OPS for the ten ops (connect, connectionassert, connectionchoose, stepsource, stepsourcewithdraw, themedeclare, themeplace, themepropose, themeread, themewithdraw), each held true by test-support's declaredOpHolds; op-grades.registerDeclaredOps answers all ten as agreed.
145 connections tests pass; question-explorer 46 and explore 57 pass; format, words and ownership 0 failures.
NEEDS BOB, two things in build/ that are not mine:
(1) add test-support to connections' uses in build/modules.json (architecture shows its one finding: declared-ops.test.mjs imports test-support);
(2) fold requirement lines R70 and R71, whose text is in my record (the ownership check refuses my writing the requirements file; with them, coverage is 71 of 71).
Also in the record: the hand rows that can go; assertedBy left out of connect's accepts (the door overwrites it with system); screens-inquiry's connectionchoose sends ref only when present while ref is required.

## Fix round 10, Wave B batch 6 (CONNECTIONS #18, session_01KkQy33QFAKvdUAn9HUSQ1C)

**Causes and lines done (6 of 6; `fixtures.mjs . connections --list`: 0 failures, 5 accepted).**
- FIX-L answer-envelope/door-helpers: `converts-links.test.mjs:47` (now :48): marker `fixtures-contract: answer-envelope door-helpers` above `storeSilent`.
- FIX-L store-door/store-replies: `:69` (now :71), `:132` (now :135), `:142` (now :146): marker `fixtures-contract: store-door store-replies` above each value.
- CODE: `:146` (now :150): `OVERLOADED` 503 replaced by `STORE_INTERNAL_ERROR` 500 (no correlation, so the silence has none); the product has no overload refusal. No 503 asked for; nothing to REPORT.
- FIX-E extraction/unheldStructure: `fixture.mjs:95`: the stub's 404 for an unseeded digest is `await unheldStructure({ sha })` from `extraction/fixtures.mjs` (the real EVIDENCE_NOT_HELD answer); no connections test read the old NOT_FOUND body.

**Markers added.** `fixtures-own`: none. `fixtures-generic`: none. `fixtures-contract` (4, each waiting on nothing: the providers' `fixtures-run: connections ...` lines already exist, so `orphan-run` clears on this merge): converts-links.test.mjs:47, :70, :134, :145 (before shifting; they sit one line above each value).

**Found in other modules.** None.

**Run.** connections tests 146 pass, 0 fail; users named by impact (explore real-connections, affordances t48-backing, corpus-export) 39 pass, 0 fail; format 178 modules 0 failures; words (connections) 0 failures; architecture 0; coverage 71 of 71; ownership 0.

**Size (session_01KkQy33QFAKvdUAn9HUSQ1C): test runs 4, module lines 2379.**

## J4 · COMPLETE

Batch 6 done on job/T51/connections: 6 of 6 own fixture lines (4 contract markers: answer-envelope door-helpers, store-door store-replies x3; OVERLOADED 503 -> STORE_INTERNAL_ERROR 500; unheldStructure replaces the 404 hand-build). fixtures --list 0 failures. No fixtures-own/generic markers. 146 connections tests, users 39 pass; format, words, architecture, coverage, ownership 0. Requirement lines: none new. Record has Size line.
