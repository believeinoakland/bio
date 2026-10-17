# ai-runs (T50)

**Status** · session_01HFyXekPPJFwXWYmk1asrfA · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

COMPLETE. T50-13 ai-runs, pushed on `job/T50/ai-runs` (tranche/T50 @ 78abb15cc5 merged in; credentials R79 and membership R149 were already there, so R89 runs against the real fence).

**Entries applied**
- **R87.** `dispatchMemberRun({run, by, viewer, at, trace?, memberRef?})` sends the door's `trace` and `memberRef` as `x-civicsmith-trace` and `x-civicsmith-member-ref` on the one call to `/run`, each only when a non-empty printable string of at most 200 characters (plane R55's shape, which this layer cannot import from signin-door), never in a body or an address, kept in no row, log entry or answer. The wake's dispatch and R84's continuation hand none and send neither.
- **R88.** Each tick `usage` entry's `effort` is passed to `ai-use.countUsage` beside `model` (null when none is stated); ai-use R15 judges it (a bad one refuses the whole tick, `AI_RUN_CONSUME_INVALID`, nothing counted). `session.cost` and the close's `cost` already spread `ai-use.actualOf`'s answer, so `by_model` reaches the paying account's owners with no copy kept here.
- **R89.** New `project` column on `ai_runs`. `open` takes `project`: for a project context it is the context whatever is sent; for a question it must be a project that draws on the question (the one live-cites predicate) and that the member whose act it is has joined. Otherwise `AI_RUN_NOT_PROJECT_MEMBER` (`run-rules` R6's `projectGate`, relayed), nothing written; absent, hidden, not drawn on and not joined answer alike, and a caller with no member behind it is refused. Recorded at the open, never changed; answered by `open` (`project`), `read` (`session.project`) and `runFor` (`project`), null for a run in none. `dispatchMemberRun` passes it to `credentials.aiRunCredentialMint` only when the run has one.
- **Plan rule 6 (words by key).** 43 sentences now read through `word(key)`, all of the `ai-runs.*` keys `words-reads.json` lists that match code (notes, `says`, `stated`, fences, acts, reasons), plus `bias.manifest_force` and `consequences.nothing`; tests that quoted them read the keys instead (converts, reads, surfacing, t46). New `words.test.mjs` drives each arm at the interface. No "labelled" in the module.

**Deferred / for BOB**
1. **ai-use R15 is not merged.** R88's tests drive a stand-in `ai-use` that follows R15 (refuses a bad `effort`, answers `by_model` to the owner alone). On your CHANGE after ai-use merges, I re-run `t50.test.mjs` against the real module (same tests, `world({aiUse})` removed); no code change expected.
2. **Sentences no key holds (REPORT for the design lane, left as they are):** the project-gate notes at the open, tick and close ("... licensed by PARTICIPATION IN THAT PROJECT ..."); the no-capability note ("a run names TWO principals ..."); the member-run `says` and its why ("a member's credential opened it ... your group's Civicsmith ..."); the no-account `says` and `AI_NO_ACCOUNT`'s detail (and the one for a batch); the `detail`s of the plan, re-examination, step and batch refusals; the SURFACE_* details; the log entries members read in `op=airunlog` (terminal entry, wake entry, "the segment ended ...", "the next segment was not dispatched ...", "Resumption: the dispatch ... did not complete ..." and "not continued now"); the provider-limit sentence; the verification and group-test details. words-reads.json (T49's source) lists none of them. Those that still say "your group's Civicsmith" are not yet "team"; R54's text says "group" (as ai-accounts' J1 raised): please re-word it.
3. **Stale key:** `ai-runs.reason.answer_within_bound` ("no answer within the bound: the segment is still running") is B6's reading, retired by R82; the code says "no acceptance within the bound" and holds it inline. The design lane should replace the key.
4. **R87's citation:** it says "agent-worker R83's shapes", but agent-worker R83 is `POST /signin`'s log lines; the header shape is plane R55 / signin-door R3. I followed plane R55.
5. **Answer shapes grew:** `open`'s answer, `read`'s `session` and `runFor` carry `project` (always present, null for none). `screens-inquiry` (T50-32) and `control-plane` read them.
6. **Flaky test made robust:** `r085.test.mjs`' mock-timer arm waited a fixed 20 turns for the dispatch to reach the binding and hung forever under load (one full run stalled 11 minutes); it now waits for the call. Nothing weakened.

**Found in another module:** `action-plans` t46 (R47, R20) and `case-account` t46 (R16) fail on "group" against words.json's "team" (the inherited reds of plan rule 5 (10), (14)); not touched by this job (the same failures on the base).

**Ran**
- `node --test bio-plane/test/m/ai-runs/`: 132 tests, 132 pass, 0 fail (29 s). New: `t50.test.mjs` (8: R87 x2, R88 x2, R89 x4), `words.test.mjs` (7).
- Modules that use ai-runs (fully green): run-productions 59, capture-requests 123, skills 126, question-explorer 34, intent 82, plan-work 50, queue-producers 75, wizard-scripts 97. With failures, each identical on `tranche/T50` run beside mine (same tests failing, base worktree with the same node_modules): case-account 1, action-plans 2 (words "group" against "team"), scheduler 1 (plane R12, plan rule 5 (7)), affordances 4, op-declarations 9, store-door 1. None is touched by this job.
- Process repository: `checks/architecture.mjs` 0 failures; `checks/coverage.mjs ai-runs` 58 of 58 ids named, 0 failures; `checks/ownership.mjs ai-runs tranche/T50` 0 failures; `checks/format.mjs` 0 failures; `checks/run.mjs` shows no ai-runs failure (its 37 coverage failures are other modules').

Size (session_01HFyXekPPJFwXWYmk1asrfA): test runs 14, module lines 3853
