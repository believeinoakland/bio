# scheduler (T51)

**Status** · session_01WuSBArtKWiDTrSYjdTtS8z · depth 2 · WORKING · handled B1

## J1 · REPORT

Found in another module, not changed (P9): `bio-plane/src/op-grades/t36.mjs:18`, a plain sentence "scheduler: the security wakes; name no member and move no bundle", counted by the words check in the full run (`node checks/run.mjs`). It is op-grades' finding; op-grades' owner keys it.

For BOB, the three decisions I made on the T51-153 findings (recorded in `build/rulings.md` by BOB, since that file is outside my paths; I did not write it):
K4056 (proposed): the file-safety notice refusal's `detail` is `localize('scheduler.index.the_file_safety_owner_offers_no_onfilework', …)`; the refusal test takes its codes from file-safety's `FILE_SAFETY_CHECKS` declaration, not a hand-list (K3268); the plane test's capture method is the fixture token `fixture-capture`, not acquisition's sentence (K3810).

Also expected: `setup-words --check` reports `rows.mjs` stale at word 21287 (the new key); BOB regenerates it at the layer close.

## J2 · COMPLETE

T51-153 done. Entries applied: the (W) words finding and the plain finding (index.mjs:636, keyed); the hand-list (files.test.mjs:162, codes now from file-safety's declaration); one test copy (plane.test.mjs:107, a fixture token). Tranche/T51 merged first (68ba37c273); the suite ran green there before any edit.

Deferred: none. Other-module finding: REPORT posted (op-grades t36.mjs:18). Ruling K4056 proposed in the REPORT for BOB to record.

Tests and checks:
- scheduler suite (`node --test test/m/scheduler/*.test.mjs`): ℹ tests 135, ℹ pass 135, ℹ fail 0 (after merge, after edits).
- format: 176 modules, 175 requirements files; 0 failures.
- architecture (scheduler): 15 product files, 73 relative imports; 0 failures.
- coverage (scheduler): 1 modules, 27 of 27 live requirement ids named by a test; 0 failures.
- words (scheduler): 1 modules, 3002 string literals; 0 failures.
- words (monitoring following link-sweep scheduler): no line naming scheduler.
- ownership (scheduler, tranche/T51, job/T51/scheduler): 4 files changed by scheduler; 0 failures.
- setup-words --check: rows.mjs stale at word 21287 (expected; BOB regenerates).
- checks/run.mjs: scheduler's own lines clear; the remaining findings belong to other modules (op-grades, and the wider words backlog).

Size (session_014f28DBW5m4WZkX9XCWVNyB): test runs 5, module lines 796
