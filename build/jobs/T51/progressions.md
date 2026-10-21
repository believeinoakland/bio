# progressions (T51)

**Status** · session_01C8PvCDQYKHJx8qBYQNU9ak · depth 2 · WORKING · handled B3

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
