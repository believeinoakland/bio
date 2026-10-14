# action-plans (T48)

**Status** · session_013tQFG4eQVgJ5Dw7du8QRfz · depth 2 · WORKING · handled B1

## Record

**Read (whole):** `build/requirements/action-plans.md`; my entry T48-52 in `build/plan/current.md`; layer 9's contract in `build/layers.md`; `bio-plane/src/action-plans/index.mjs` (all 2,400 lines); `plan-work`'s `#openRun` (the model R51 names); `ai-runs` R46, R47, R52, R77, its `open`'s signature and returns, `runFor`; the test `fixture.mjs` and `runs.test.mjs` (R30–R34). Other tests were run, not read. `doc.mjs`, `schema.mjs`, `values.mjs`, `checks.mjs` were not read: no entry touches them.

**Entries applied**
- **T48-52 · R51**: `planAsk({plan, author, viewer})` (`op=planask`). Refusals in order: `MACHINE_CANNOT_PLAN`, `NO_SUCH_PLAN` (absent and unseen alike), `PLAN_CLOSED`; then `ai-runs.open` (mode `plan`, project context, the member as actor, principals her own as `plan-work` passes them, skill `planning@1`, bounds proposals 20 and wallclock 600000), whose refusals pass through unchanged. While a planning run of the plan is running (read from this module's `plan_runs` and `ai-runs.runFor`), it opens none and answers `{ok, plan, run, started: false, existed: true}`, after the joined-member fence; two asks at once open one run. Success answers `{ok, plan, run, started: true}`. Records no option, proposal or disposition. `ai-runs` is the existing edge (`open`); no new edge.

**Deferred:** none.

**Found in other modules (for BOB)**
- `op-declarations` (and `op-grades`, `setup-words`, `affordances` where they list the T45 plan ops, as `planpause`/`planresume` do) need `planask` declared as a member act stamped `author` and `viewer`; `legacy-store`'s spread already carries every key `actionPlansOps` returns. Without the declaration the screen's "Ask the assistant for options" cannot reach the op.
- `build/requirements/action-plans.md` R51 still reads `*(not yet met: T48)*`; BOB's to clear.
- The `ai-runs` real `open` was not exercised by this job (its test stand-in reproduces R46/R47's check and refusal shape); the first real run through `planAsk` is `screens-action`'s or the integration's to see. Note `open`'s refusals have no `ok` key (`{run, started: false, code, ...}`), so `planAsk` passes them through in that shape.

**Tests (all at the interface; `fixture.mjs` gained an `aiRuns.open` stand-in)**
- New `ask.test.mjs`, five tests naming R51: the run opened (arguments, answer keys, nothing else written, tray); the second ask and concurrent asks answer the same run, an ended run and another plan's run do not; every refusal in order with its control (machine, unstamped, absent, unseen, closed, not joined, mode not deployed, paused plan allowed); not-joined is not answered a running run and an absent `aiRuns` refuses by name; a member's `optionpropose` records her own proposal and opens no run, `op=planask` reaches the act with the query's stamps.
- `invariants.test.mjs`: the pinned list of `actionPlansOps` keys gained `planask`.
- `node --test bio-plane/test/m/action-plans/`: tests 88, pass 88, fail 0.
- format: 168 modules, 167 requirements files; 0 failures. architecture: 20 product files, 65 relative imports; 0 failures. coverage: 51 of 51 live requirement ids named by a test; 0 failures.

Size (session_013tQFG4eQVgJ5Dw7du8QRfz): test runs 3, module lines 3396

**Full checks (`node checks/run.mjs`, whole product):** format 0 failures; architecture 3,296 product files, 0 failures (none of mine); ownership (action-plans against `tranche/T48`) 5 files changed, 0 failures; channels 0 failures; coverage 28 failures, all in other modules (admission, answer-envelope, control-plane, filing-templates, filings, following, installer, instance-setup, interface-assets, interface-shell, journey-check, op-declarations, op-grades, plane, queue, screens-*, setup-words, wizard-scripts), none in action-plans (51 of 51 named): inherited reds, not mine.
