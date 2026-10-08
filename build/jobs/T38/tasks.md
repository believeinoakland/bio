# tasks (T38)

**Status** · session_01Q76EduEf1fMRaD5uxMeUng · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied:** T38-21 (N793; K231, K2300, K2318), against R3 as amended at the START.
- **R3, `NO_SUCH_MEMBER`** (`src/tasks/index.mjs`, `taskForward`, was :612): a forward to no active member (unknown, not active, empty or absent `to`) now answers `membership.noSuchMember` (its R121, C-96.47), `member` the `to` asked (null when it is not a string). This module's own sentence is gone; it never held a row for the code. Its place in R3's order is unchanged: after `TASK_NOT_YOURS`, before `ALREADY_THEIRS`. The import names `noSuchMember`, as the Uses line does.
- **New test** (`inbox.test.mjs`, "R3 (T38, N793; K231) …"). Across three actors (the assignee, an administrator, anyone on an unassigned task) and seven kinds of `to`, it checks:
  - the answer equals `noSuchMember(to)`;
  - its reason, code, membership's row (C-96.47) and translation;
  - R121's one fixed sentence;
  - that nothing is written;
  - its order in R3;
  - the set form, per item.
- The existing R3 test's two `NO_SUCH_MEMBER` lines (reason only) stand.

**Deferred:** none.

**Found in other modules:** nothing new. I ran the tests of the modules that use `tasks` (R3 is a provided service). 11 tests fail, and the same 11, by name, fail with my change stashed, so none is caused by tasks:
- op-declarations: 4 (R19/R6, R21/R27, R38 obscuremark, R21 T37).
- answer-envelope: 4 (R7/R2 catalogue totality, case-disclosures and case-carriage rows).
- plane: 3 (R18/R5 case-carriage route, R10 stats ×2).

These look like work owed by L11's other entries (T38-15, the obscuremark and case-carriage work), and are BOB's to match against rule 6.

**Reading:** I measured the set as mechanics §3 asks:
- own requirements: 19 KB;
- code and tests: 215 KB;
- each used module's Purpose and the services my Uses names: about 26 KB.

About 260 KB in all, at most 300 KB, so I read it whole myself: the requirements, layer 11's row of `build/layers.md`, all three source files and all six test files, membership R121 and R84 and the other used services. No worker summary was used.

**Tests:**
- `node --test test/m/tasks/`: 102 tests, 102 pass, 0 fail.
- Users of `tasks`:
  - queue 128/0;
  - store-door 41/0;
  - control-plane 192/0;
  - op-declarations 110/4;
  - answer-envelope 24/4;
  - plane 143/3.
  The failures are the same with and without my change (above).
- The layer tests: none named in `build/manifest.md`.

**Checks:**
- format: 137 modules, 136 requirements files; 0 failures.
- architecture: 9 product files, 37 relative imports; 0 failures.
- coverage: 18 of 18 live requirement ids named by a test; 0 failures.
- ownership: 3 files changed by tasks between tranche/T38 and HEAD; 0 failures.

Size (session_01Q76EduEf1fMRaD5uxMeUng): test runs 16, module lines 1444

## J1 · COMPLETE

T38-21 applied: taskForward's NO_SUCH_MEMBER answers membership.noSuchMember (R121, C-96.47), member the 'to' asked; its own sentence gone. New R3 test (code, row, R121's sentence, order, set form, no write). tasks 102/0; checks format, architecture, coverage, ownership 0 failures. Users' tests: 11 failures in op-declarations (4), answer-envelope (4), plane (3), identical with my change stashed: not tasks'. Details in my record's Completion.
