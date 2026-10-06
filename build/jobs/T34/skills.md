# skills (T34)

**Status** · session_015nfoizo1p2YDa9AM8MBLGz · depth 2 · WORKING · handled B1

## Completion

**Entry applied: T34-35** (N586, K1615). The doctrine pin now names agent-harness' file:
- `doctrine.test.mjs`, the R18 R29 test: `GATE_ADDRESS.file` is pinned to `agent-harness/src/harness.mjs`, and `DEPLOYMENT_SEQUENCE.enforced_by_row` to `agent-harness/src/harness.mjs:CONTROL_FLOW["gate-mode"]`. These are strings only; the test reads nothing later in the order (P4). agent-harness' `harness.mjs` exports `MODES`, `CONTROL_FLOW` (with row `gate-mode`), `FIRST_STEP` and `nextStep`, the names `GATE_ADDRESS` gives.
- `skilldoctrine.mjs`: the SK-4 header comment now says where the gate lives (agent-harness' table, which agent-worker runs) and that run-rules' tests dereference the address. No behaviour changed; the pack's rendered words are unchanged.

**Depends on run-rules (T34-32).** The value is run-rules' `GATE_ADDRESS`, which this module re-exports unchanged (R18). So the R18 R29 test is red on this branch until RUN-RULES' T34-32 changes `GATE_ADDRESS.file` to `agent-harness/src/harness.mjs`. That matches L6's merge order: run-rules merges before skills. I checked this: with only that one line of `bio-plane/src/run-rules/deployment.mjs` changed locally (then reverted, never committed), skills' tests are 67/67. If run-rules picks a different spelling, this pin follows it.

**Deferred:** none.

**Found in other modules:**
- `bio-plane/dist/bio-plane.bundled.mjs` is stale, because `skilldoctrine.mjs`'s source changed (one comment). BOB regenerates it at layer close (mechanics §14).
- R18's and run-rules R9's wording ("`GATE_ADDRESS` naming `agent-worker`'s gate") still reads true: the gate is agent-worker's, held in agent-harness' table. No fold is needed unless BOB wants the file named.

**Tests and checks**, on `job/T34/skills`:
- `node --test bio-plane/test/m/skills/`: tests 67, pass 66, fail 1. The one failure is R18 R29, waiting on T34-32 (above). With run-rules' change applied locally: 67/67.
- No layer tests are named in `build/manifest.md`. No service was changed, so no users' tests were run.
- `format`: 126 modules, 125 requirements files; 0 failures.
- `architecture`: 12 product files, 59 relative imports; 0 failures.
- `coverage`: 35 of 35 live requirement ids named by a test; 0 failures.
- `ownership`: 3 files changed by skills between tranche/T34 and HEAD; 0 failures.

Size (session_015nfoizo1p2YDa9AM8MBLGz): test runs 3, module lines 2188

