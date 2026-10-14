# run-productions (T48)

**Status** · session_018nMYfxcYttRowYHBgGe42y · depth 2 · COMPLETE · handled B0

## Completion

**How the reading set was read (K2032, mechanics §17):**
- I read these whole myself: `build/requirements/run-productions.md`; `ai-accounts`' requirements, R21, R22 and R32, with their code (`aiKeepAwayState`, `projectsKeptAway`, `aiAccountsOf`); layer 6's contract in `build/layers.md`; my entry T48-31 and "Rules at the opening" in `build/plan/current.md`; every file of my code (`index.mjs`, `checks.mjs`, `reading.mjs`, `schema.mjs`) and tests (`fixture.mjs`, `counts`, `extract`, `module`, `reading` and `suggest` tests) (P20).
- A helper in this session read the public part of the other 15 used modules whole and wrote a digest citing each id: record-grammar, text-chain, record-core, membership, extraction, content, connections, inquiry, citation, basis-versions, strength, ai-runs, run-rules, steps and leg-earning. The sources stay binding.

**Entries applied:** T48-31 (N996 §5, K3195).
- `readPages` (R24) reads the group's limit from `ai-accounts.aiKeepAwayState` (its R21) and a project's from `projectsKeptAway` (its R22). It reaches them through `aiAccountsOf`, the `aiAccounts` dependency. `credentials` is no longer imported, so BOB can drop it from `uses` at merge.
- `credentials`' factory makes the instance first, with its seal secret (ai-accounts R32). The plane builds `credentials` before this module (`plane/store.mjs`), so the seal secret is kept.

**Flaw found in my own code and fixed (P8):** the project limit's read (`projectsKeptAway`) was outside the try that the group's read had. A throw there would have thrown out of `readPages` instead of refusing, against R24's fail-closed reading. Both reads now fail closed, the project's also on any non-list answer. Every other part of my code and tests was read and no other flaw was found.

**Tests:**
- `reading.test.mjs`' R24 limit test follows: it uses `ai-accounts`' `projectAiKeepAwaySet`, and it shows the module reaches `ai-accounts` through its factory.
- A new R24 test covers:
  - the group's limit covering reading: refused, in a project or not;
  - a group limit not covering reading, and the limit turned off: no refusal;
  - each unreadable arm, the group's or the project's, answered unknown or thrown: refused `AI_RUN_READ_NO_AI` with nothing read or spent.
  - I checked this test fails with the fix reverted.
- The fixture makes the real `ai-accounts` over its own tables in place of `credentials`.

**Deferred:** none.

**Found in other requirement texts** (wording only; reported to BOB, no behaviour affected):
- In `run-productions.md`, Provides and Uses put `runPrincipalGate` under `ai-runs` (its R5 is retired). It is `run-rules` R5, and R1 and R10 already say so.
- `run-productions.md` Uses has a stale pointer: the retired-target predicate is given as `inquiry` R3 (retired). It is `citation.retiredNotCitable` (citation R5), and `run-rules` and `citation` are not named in Uses.
- `basis-versions` R25 still says the narrow candidate source is "registered by `ai-runs`". It is this module's R14, through its R40.
- All three predate T48.

**Tests and checks run:**
- run-productions: `node --test test/m/run-productions/`: pass 59, fail 0.
- Modules reaching this code: plane `stats.test.mjs` 4/0; control-plane `t41-door.test.mjs` 14/0; question-explorer 32/0.
- `checks/format.mjs`: 168 modules; 0 failures.
- `checks/architecture.mjs` run-productions: 10 product files; 0 failures.
- `checks/coverage.mjs` run-productions: 25 of 25 live ids; 0 failures.
- `checks/ownership.mjs` run-productions tranche/T48: 0 failures.
- `checks/run.mjs`: architecture 0 failures, format 0, channels 0. Coverage has 37 failures, all other modules' ids marked *(not yet met: T48)* (rule 5.1); none are run-productions'.

Size (session_018nMYfxcYttRowYHBgGe42y): test runs 9, module lines 2309

## J1 · COMPLETE

T48-31 applied: readPages reads aiKeepAwayState and projectsKeptAway from ai-accounts (aiAccountsOf); credentials no longer imported, so uses can drop it at merge. Fixed in my code: the project limit's read now fails closed on a throw. The reading test follows, plus a new R24 test (group limit; every unreadable arm). Tests 59/0; format, architecture, coverage (25/25), ownership 0 failures; run.mjs architecture 0. Reported, wording only, all predating T48: run-productions.md Uses/Provides put runPrincipalGate under ai-runs R5 (it is run-rules R5) and the retired-target predicate under inquiry R3 (it is citation R5), and neither run-rules nor citation is named in Uses; basis-versions R25 still says the candidate source is registered by ai-runs. Record: build/jobs/T48/run-productions.md.
