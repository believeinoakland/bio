# membership (T12)

**Status** · session_014cnQoDew2TTTD4pKeceZ77 · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entry applied** (layer 2's membership bullet, N285; B1), commit 2df0f3624a:
1. **N285.** R21's no-label refusal is `EXPERTISE_NO_LABEL`, no longer the shared `NO_LABEL` (K275, K343). `expertiseDeclare` answers `{ok: false, reason, code, check, translation, detail}` built from its own row in `MEMBERSHIP_CHECKS` (`src/membership/checks.mjs`): check **C-96.13** (my reading of K107 (3): expertise had no family; C-96 is this module's family for acts on a member's row, and .13 is its next free number, unused anywhere), `where` `src/membership/index.mjs expertiseDeclare > is-expertise-labelled` (a new DEC-49 region pair), translation R21's sentence word for word. The detail sentence is kept. R21's test checks the row in full, every blank label (undefined, null, empty, whitespace) answering exactly that refusal, and that nothing is written.
2. R21's mark `(not yet met: N285; minted as NO_LABEL)` is met; the requirements file is not mine to edit, so BOB strikes it.

**Deferred:** none.

**Found in other modules, reported (not edited):**
- **UI and legacy suites:** nothing pins membership's old code. `civicos-ui/app.html`'s only `NO_LABEL` key is `entitycreate`'s (entities'); `affordances.mjs`' `NO_LABEL` is a comment and its catalogue test lists the generic code. The legacy suites that call `op=expertisedeclare` pass: capability 1/0, identity-claims 1/0, machine-attest 1/0.
- **legacy-tests, the DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`): 21 failures on `tranche/T12`, 26 with this change. Cleared by it (3): `rows` 782 → 783 and `governedSites` 493 → 494 now meet their floors (both were BREACHED on the base), and arm G's `PROGRESSION_CHECKS.NO_LABEL` goes from 3 literal sites to 2 (entities' is N285's, layer 5). New (8): the FLOOR SLACK of seven ratchets this landing moves by design, each +1 unless noted: `census` 1065, `reach` 810, `regions` 455, `regionLines` +7 (5462), `codesChecked` +2 (881), `outcomeReturns` 257, `refusalsJudged` 857; they need re-pinning by legacy-tests. Arm G's `ESCALATION_CHECKS.NOT_PROPOSED` at 2 sites (escalation's and membership's `adminEndorse`) fails on the base too: escalation's N312 `EDGE_NOT_PROPOSED` is its fix.
- **Generated artifact (§14):** `agent-worker/dist/agent-worker.bundled.mjs` is STALE against `src/membership/checks.mjs` and `index.mjs` (`fleetbundles.test.mjs` fails its agent-worker arm). Not rebuilt; BOB regenerates at the layer close.

**Tests and checks run:**
- membership (`bio-plane/test/m/membership/`): 95 tests, 94 pass, 0 fail, 1 todo (R81's rows, pre-existing: N202, N206).
- Legacy suites calling the service: capability, identity-claims, machine-attest: 1/0 each. `fleetbundles.test.mjs`: the agent-worker arm fails (stale, above); the rest pass.
- `format.mjs`: 69 modules, 64 requirements files; 0 failures. `architecture.mjs … membership`: 15 product files, 36 relative imports; 0 failures. `coverage.mjs … membership`: 83 of 83 live requirement ids named by a test; 0 failures. `ownership.mjs … membership tranche/T12`: 4 files changed; legacy-store 0 added, 0 removed; 0 failures.

Size (session_014cnQoDew2TTTD4pKeceZ77): test runs 9, module lines 5,572
