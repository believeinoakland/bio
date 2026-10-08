# acquisition (T37)

**Status** · session_01G5k1CQoyCMyhGevtvZwFkg · depth 2 · WORKING · handled B1

## Completion (T37-37)

**Reading (mechanics §17, N739):** the reading set was measured at START as 604 KB (over 300 KB), so I used option (3). I read these whole myself:
- `build/requirements/acquisition.md`
- layer 3's row of `build/layers.md`
- the plan's T37-37 entry and rule 6
- K2155 and K2175 (their lines)
- `src/acquisition/index.mjs`, the file my entry changes
- `test/m/acquisition/reputation.test.mjs`
- the used service my Uses names for R44: `file-scanner` R21 and R25
- the related lines of `plane` R29 and `capture` R73

A worker read the rest whole: `checks.mjs`, `keyed.mjs`, `unpack.mjs` and the 16 other test files, `fixture.mjs` among them, about 429 KB. It wrote a summary of about 9 KB, each statement citing file and line. The summary covered:
- `fixture.mjs`'s `world`/`run` and how `opts` and `store.reputation`/`fileScanner`/`env.FILE_SCANNER` reach `acquire`
- that no other file reads or tests `reputation`, `fileScanner`, `REPUTATION_TIMEOUT_MS` or `TOOL_UNREADABLE`
- that no test pins acquire's answer or receipt key set
- the timing-dependent tests: `memento-at.test.mjs`:102 is within 5 s of `t0`, but no tool is set there, so it is unaffected

What mattered: it flagged that a reader answering `undefined` was recorded `NO_TOOL`. R44 says anything but a spec or null is `TOOL_UNREADABLE`, so I fixed it. Nothing it left out mattered.

**Entries applied (T37-37):** R44 (N774; K2155, K2175). `acquire`'s `reputation` (from `opts`, else the store handed in) may now be a reader: a function answering a spec, null, or a promise of either.
- The reader is called once for each acquisition, before the lookup, so `capture`'s per-call function reaches every acquisition (plane R29).
- One bound, `REPUTATION_TIMEOUT_MS`, covers the reader and the lookup together, so the fetch is never delayed past it.
- A reader that throws, rejects, outlasts the bound, or answers anything but a spec (an object; the scanner judges its fields, R21) or null is recorded `{tool: null, listed: null, categories: [], checked_at, unanswered: "TOOL_UNREADABLE"}`, never `listed: false`. `undefined` counts as unreadable.
- A reader's null is `NO_TOOL`, as a null tool is.
- A spec with no binding is `SCANNER_UNREACHABLE` naming the tool.
- A continuation calls no reader.
- A static spec or null behaves exactly as before.

The code is in `index.mjs`, `addressReputation` and `isToolSpec`. The new test is `reputation.test.mjs`, "R44 (T37): a reader of the tool …". It covers:
- a sync reader, a promise reader and a store reader, each called once per acquisition and in the order reader → lookup → fetch
- a reader whose answer changes between acquisitions
- null, and a spec with no binding
- nine unreadable answers
- a hanging reader, and a slow reader sharing the one bound with a hanging scanner
- a continuation, which calls no reader

R44's `*(not yet met: T37)*` marker is BOB's to lift (a requirements file).

**Found in other modules:** none new. The reds below are inherited, all `CREDENTIAL_IN_ADDRESS` (C-38.10) in a control-plane setup, the cause of rule 6's red 15 (see "Tests and checks").

**Deferred:** none.

**Tests and checks:**
- `node --test test/m/acquisition/`: 153 tests, 153 pass, 0 fail.
- Users of acquisition (step 5):
  - `capture` (with `cap13-reuse-pages`, `d57selflink`): 155 tests, 3 fail.
  - `capture-requests`: 103 tests, 5 fail (rule 6's red 15).
  - `plane`: 144 tests, 3 fail, 1 todo (R19 ×2 is rule 6's red 7; R6's runtime door is `CREDENTIAL_IN_ADDRESS`).
  - `control-plane`: 180 tests, 0 fail.
  - `monitoring`: 121 tests, 0 fail.
- The same failing tests by name on `tranche/T37` before my change (stash compared): none is mine. Capture's three (R21 R27 R73 through `captureOp`, `cap13`, `d57selflink`) and plane R6 fail on `CREDENTIAL_IN_ADDRESS` in a control-plane request. Rule 6 names that cause under red 15 but does not list these four tests. They are reported to BOB.
- `format`: 136 modules, 0 failures. `architecture`: 23 product files, 103 imports, 0 failures. `coverage`: 44 of 44 live ids, 0 failures. `ownership` vs `tranche/T37`: 3 files, 0 failures.
- P6: module lines below.

Size (session_01G5k1CQoyCMyhGevtvZwFkg): test runs 14, module lines 4,343
