# screens-inquiry (R085)

**Status** · session_01C32QGvXWpSbZKJMKWKdBMX · depth 2 · WORKING · handled B1

## J1 · COMPLETE

**Entry R085-6 (K3477; WALK-085 F2): applied.** screens-inquiry R45 is met. All in `question.mjs`; the dock's keys and pattern reused, no new key.

**What changed**
1. **At once.** The press of "Ask the assistant" sets `ui.asking` before `airunopen` is sent, so state d is drawn immediately (machine mark, `question.run.leave`, "Stop the run" as a disabled button with no `data-act`, since nothing is live to stop yet). A refusal, a limit, a failed call or a withheld dispatch clears it and draws as R33 says; `started: false` still dispatches nothing. `ui.asking` counts as at work until that run is read ended, so no flicker to state c between dispatch and the first read.
2. **While it works.** The run list is kept across a re-read (`ui.lastRuns`), so the answer stands while `airuns` is read again. State d adds `screen.assistant.run.running` with the run's `ticks`. While `myRun` runs, `cs.later(10000)` bumps `seq` to read `airuns` again, armed only once a read has settled (not while loading), so it is at most one read per 10 s and none after the run has ended.
3. **When it ends.** The member's latest run (`airuns` is newest first) not running, no proposal (state e) and no conclusion (state g): `screen.assistant.run.ended` with `why` = the condition's `bound`/`kind`, else the status (as the dock), and the ask offered again (inside state c's own rows there, elsewhere beside the line). Never state c's empty text alone.

**Tests** (`test/m/screens-inquiry/r45.test.mjs`, six, all name R45): the press draws state d before `airunopen` answers (held on a gate) with its stop disabled, then a limit refusal replaces it; a withheld dispatch replaces it with its reason; a running run is read again once at 10 s and not at 9 s, its ticks move 1→4, its end is then stated, the ask is offered once and reading stops; an ended run on a question that cites passages draws the ending and the ask; a run ended with no condition is named by its status, another member's ended run is not hers; control: no run draws state c with no ending.

**Run**
- `node --test test/m/screens-inquiry/` (bio-plane): tests 124, pass 124, fail 0. `interface-shell` tests (the shell it runs on): pass 149, fail 0.
- `node checks/format.mjs bio`: 170 modules, 169 requirements files; 0 failures. `architecture.mjs bio screens-inquiry`: 16 product files, 36 relative imports; 0 failures. `coverage.mjs bio screens-inquiry`: 45 of 45 live requirement ids named by a test; 0 failures. `ownership.mjs bio screens-inquiry tranche/R085`: 2 files changed by screens-inquiry; 0 failures.

**Deferred:** nothing. **Found in another module:** nothing; no generated artifact of another module made stale (`bio-plane/dist/bio-plane.bundled.mjs` and `release/` carry this module's code and are rebuilt by BOB at the cut, K1548: REPORTing it as stale).

Size (session_01C32QGvXWpSbZKJMKWKdBMX): test runs 7, module lines 2277
