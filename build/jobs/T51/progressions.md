# progressions (T51)

**Status** · session_011v5ZCTD2aqsukHM8utVFpG · depth 2 · WORKING · handled B5

## J1 · COMPLETE

COMPLETE. Entries applied: T51-36 (R46): every finding carries `state` (`open`, `dismissed`, `deferred`), the applying decision's (R20), else `open`; `open_finding_count` (R12, R19) now counts the findings whose state is `open`; R18's `instances[]` findings carry `state: open` (decided ones have left it). Change is in bio-plane/src/progressions/index.mjs (`stateOf`, `withState`); new test bio-plane/test/m/progressions/state.test.mjs (3 tests naming R46: no decision / dismissed at current / deferred at an earlier version, count control, feed arm). Per BOB's note 2 nothing for the step labels, help or the set-aside list. The word keys `progression.finding.state.*` are screens-investigate's.
Tests: progressions 79 pass 0 fail. Users of the module (queue, queue-producers, inquiry, calculations, intent, money-checks, affordances): 917 of 920 pass; the 2 failures are affordances' ACT_HELP / words tests (R48..R62, R62 R65), nothing of mine; not caused by this change (additive field only) and I did not touch them.
Checks (process repo, against /home/user/bio): format 0 failures; architecture progressions 0 failures; coverage progressions 46 of 46 live ids named; ownership progressions tranche/T51 job/T51/progressions 0 failures (1 file changed besides tests/record as permitted); run.mjs: channels 0 failures, coverage fails only in other modules (agent-worker R119, basis-versions R55, case-grammar R33, entities R57-61, explore R26, journey-check R19, people R40 R41, retrieval-browse all, retrieval R87 R89 R90).
Deferred: none. Found elsewhere: none. BOB: requirements/progressions.md still marks R46 `(not yet met: T51)` and its Status line; that marker is yours to clear.
Size (session_01Q1YvYM1WKe2ebwrUEkPtA5): test runs 6, module lines 2193 (index.mjs 1693, schema.mjs 323, checks.mjs 177).

## J2 · COMPLETE

COMPLETE for B2 (T51-201, the words and red-test re-run). Branch job/T51/progressions at 79bf285bb5 (merged tranche/T51 as K1991 asks).

Entries applied:
- Words findings (build/plan/words-pass/progressions.md): the two `testcopy` findings at dispose.test.mjs:61-62 are fixed: the NOT_A_DISPOSITION translation is read through `word("refusal.NOT_A_DISPOSITION")`, not copied. The one `plain` finding (index.mjs, instancesFor's NO_SET detail) is `localize("progressions.index.set_none_named", en)`.
- Red tests (note 0): overdue.test.mjs (R16) and owndates.test.mjs (R38) pass civil-time's keyed reasons on as it answers them (`{key, vars}`) and assert the key. The owndates order-undetermined case with no own date keeps a plain word (progressions.why.date_came_first), asserted as a string.
- One red test not on BOB's list, same cause: owner.test.mjs:66 (R40) asserted "no start is stated" in the text of `undetermined.why`; civil-time now answers `civil-time.start_stated` as a key. Fixed the same way (asserts the key).

Deferred: none.

Found elsewhere (for BOB):
- A plain-looking sentence in this module's own code still reads as a refusal `detail`: NOT_A_DISPOSITION_DETAIL in src/progressions/checks.mjs (the R35 fixed sentence). The words check did not flag it, and setup-words R13 binds a refusal's `detail`. I did not convert it, because R35 says detail is one fixed sentence and the words check did not count it. BOB to rule whether it is a member-read sentence (then a `localize`) or a record-keeping field.
- Repo-wide `checks/run.mjs` shows many words, testcopy and coverage failures in other modules (for example wizard-scripts, action-grammar). None is progressions'. Not mine to change.
- setup-words `build.mjs --check`: rows.mjs stale, expected, names my new id progressions.index.set_none_named. No refusal naming this module.

Tests and checks (module tests run with `node --test bio-plane/test/m/progressions/*.test.mjs`):
- tests: 79 pass, 0 fail (after the merge).
- format: 175 modules, 174 requirements files; 0 failures.
- architecture progressions: 20 product files, 77 relative imports; 0 failures.
- coverage progressions: 46 of 46 live requirement ids named by a test; 0 failures.
- ownership progressions tranche/T51 job/T51/progressions: 0 failures (6 files changed by progressions, all in its paths and record).
- checks/run.mjs: 3833 lines of failures, none naming progressions (the only "progression" hit is action-grammar's own check).

Size (session_01DtreWyrLe5DTkd3njA9rev): test runs 4, module lines 2189.

## J3 · COMPLETE

COMPLETE again after CHANGE B3 (K3991). Branch job/T51/progressions at 5c9c47c6a8, tranche/T51 merged in.

Entries applied:
- B3: `NOT_A_DISPOSITION_DETAIL` in src/progressions/checks.mjs is `localize("progressions.checks.not_a_disposition_detail", en)`, English unchanged. R35's fixed sentence stays one fixed sentence; the detail check now compares it through the one constant, unchanged in the tests.
- Earlier work (J2): the words testcopy and plain findings, and the keyed-reason red tests (overdue, owndates, owner), are as reported in J2.

Deferred: none. Found elsewhere: none new.

Tests and checks:
- tests: 79 pass, 0 fail (`node --test bio-plane/test/m/progressions/*.test.mjs`).
- format: 175 modules, 174 requirements files; 0 failures.
- architecture progressions: 20 product files; 0 failures.
- coverage progressions: 46 of 46 live ids named (checked before B3; B3 adds no id).
- ownership progressions tranche/T51 job/T51/progressions: 0 failures (6 files, all in its paths and record).
- checks/run.mjs: no finding names progressions (words, testcopy or coverage).
- setup-words --check: rows.mjs stale, expected; it names progressions.checks.not_a_disposition_detail and progressions.index.set_none_named. No refusal naming this module.

Size (session_01DtreWyrLe5DTkd3njA9rev): test runs 5, module lines 2188.

## J4 · COMPLETE

COMPLETE for B4 (K4259, entry 1). Branch job/T51/progressions at 61c1f19294, pushed.

Entry applied: `op=progressions`, a read listing the progression definitions: `listProgressions({limit, after, viewer})` in src/progressions/index.mjs, routed in `progressionOps` (`limit` and `after` from the query or the body, as `instances` takes them). Each item is `{progression_key, label, current_version, stage_count, stages}`, the stages being R5's current-version stages in order (`stage_key, stage_no, label, after_stage, cardinality, within_interval, required`). Key order; `limit` 1-200 (default 50), `truncated` by reading one past, `next` the last key, passed back as `after`. No declarer, basis or bundle is answered. An empty store answers an empty list, no error. Writes nothing, never throws (`PROGRESSIONS_UNREADABLE` only on a storage fault). `DECLARED_OPS.progressions`: classes admin/member/probe, `mutating: false`, `weight: "read"`, accepts `limit`, `after`, requires none; its description is `localize("progressions.declared.progressions", ...)` since no design row exists for it.

Requirement line for BOB (next free id; R47 stands, and its list of six declared ops gains this seventh):
- **R48** (T51; K4259) `listProgressions({limit?, after?, viewer})` (`op=progressions`) answers the progression definitions held: `{ok, count, items, limit, truncated, next?}`, an item `{progression_key, label, current_version, stage_count, stages}` taken as R5 reads the current version, in key order. `limit` 1-200 (default 50), `truncated` by reading one past, `next` the last key (to pass as `after`). It names no declarer, basis or bundle, writes nothing and never throws. A store with no definition answers an empty list. Test: three definitions, one revised, listed in key order with the current version and stages; control: each item equals `op=progression` by key at its current version, and that read (and the earlier version's) is unchanged. Also: R47 gains `progressions` in its declared ops (no required field; accepts `limit`, `after`).

Tests (written first, seen failing: `progressionOps(...).progressions is not a function`): bio-plane/test/m/progressions/list.test.mjs (4 tests naming R48: the list with versions and stages, the control against `progression` by key and its version 1, paging and the 1-200 bound, the empty store / body arm / nothing written / no declarer or basis) and one in declared-ops.test.mjs (R48, `declaredOpHolds` for the new row). `node --test bio-plane/test/m/progressions/*.test.mjs`: 90 pass, 0 fail. Users of the module are untouched by an additive op and I did not re-run theirs.

Checks (process repo, against /home/user/bio): format 175 modules, 175 requirements files, 0 failures; architecture progressions 21 product files, 80 imports, 0 failures; coverage progressions 47 of 47 live ids named, 0 failures; ownership progressions tranche/T51 job/T51/progressions 4 files changed (all in its paths), 0 failures; run.mjs: no line names progressions (words, testcopy, coverage).

Deferred: none. Found elsewhere, for BOB (not mine to change):
- The door does not know `progressions` yet: `op-declarations` (its class/mutating table beside `captureprogressions`, index.mjs:1182), `op-grades` (marks.mjs:64, the weight row), `store-door`'s dispatch field hints (dispatch.mjs:111) and `affordances`' act-help list (act-help.mjs:151) each name the existing progression ops and need the seventh. Until they do, the door will not route it.
- Stale generated artifact: `bio-plane/src/setup-words/rows.mjs` (setup-words') is stale for my two new ids, `progressions.declared.progressions` and `progressions.index.the_progressions_could_not_be` (`build.mjs --check`); regenerate at the layer close. The screen draws the stage and flow labels as the member declared them, so no word row is needed for the list itself.
- `build/requirements/progressions.md` Status line and R47's marker are yours to update with R48.

Size (session_01C8PvCDQYKHJx8qBYQNU9ak): test runs 5, module lines 2228 (index.mjs 1729, schema.mjs 323, checks.mjs 176).

## J5 · COMPLETE

COMPLETE for B5 (fix round 10, Wave A batch 4). Branch job/T51/progressions, tranche/T51 merged in (K1991).

Fixtures published (`bio-plane/test/m/progressions/fixtures.mjs`, new; each made by the real code at call time, never stored; `fixtures.test.mjs`, 3 tests, calls each and checks the real answer, with a control):
- `definitionRead({progressionKey?, stages?, defined?})`: the real `readProgression` of a progression really defined; a key no definition holds answers `found: false`, no key is refused `NO_KEY` (checked against a fresh world's own read).
- `disposeProposalOk(args)`: the real `disposeProposal` success for the stage asked (`progressionKey`+`stageKey`, or `key`), over a world that really holds that progression; control: version 2 is `DEFINITION_MOVED`. A spy delegates to it with what it was called with.
- `disposeProposalRefusal()`: the real `disposeProposal({})`, `NO_KEY`.

Own fixture lines done (FIX-E; both providers merged on the branch point):
- provenance/registeredHomes, fixture.mjs:128: `world()` now builds the real provenance with `registeredHomes({host, record, membership, promotion, now})` over a `promotionOver`; a capture is registered by the real register act (`w.registerAt(sha, at)`, which answers the `registered` instant provenance holds). The three tests that set `dates.registered` (overdue.test.mjs ×2, owndates.test.mjs) register through it. The real register keys a capture by its sha-256 digest, so those tests use digests (`SA`, `SD`, ...) and `seeded()` also resolves each name by its digest to the same bundle; overdue's one predecessor_dates assertion is sorted by capture sha, the order the module answers; the registered bound is read from provenance, not copied.
- promotion/makePromotion, integration.test.mjs:20: the `promotionStub` is `promotionOver({record, membership, host})` from promotion's published fixtures. The world also registers `producingGroup`, `citedBy` and `caseMember` on that promotion the way provenance's own world does, so a register act is not refused FACT_UNAVAILABLE.

No `fixtures-own`/`fixtures-generic` marker added; no `fixtures-contract`/`fixtures-run` added (all FIX-E). Lines left in `checks/fixtures.mjs . progressions --list`: 0. Users of my fixtures re-point in their own jobs (action-records `definitionRead`, queue `disposeProposalOk`/`disposeProposalRefusal`).

Tests: progressions 90 pass, 0 fail (`node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/progressions/*.test.mjs`); affordances backing.test.mjs (imports my fixture.mjs) 22 pass, 0 fail, same as before. `impact.mjs origin/tranche/T51 HEAD` on committed state names no module.
Checks: fixtures 0 failures; format 178 modules, 0 failures; architecture progressions 22 files, 87 imports, 0 failures; coverage progressions 48 of 48 ids, 0 failures; ownership progressions 0 failures; run.mjs shows other modules' fixture lines naming progressions as a provider (action-records, queue, ...), none progressions' own.
Deferred: none. Found elsewhere: none.
Size (session_011v5ZCTD2aqsukHM8utVFpG): test runs 12, module lines 2228.
