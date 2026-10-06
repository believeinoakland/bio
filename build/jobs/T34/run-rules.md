# run-rules (T34)

**Status** · session_01CNMEKJTqYUQLE8kuP8dFsz · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.**
- **T34-32** (N586; K1603, K1615): `GATE_ADDRESS.file` is `agent-harness/src/harness.mjs`, the file that holds `MODES`, `CONTROL_FLOW["gate-mode"]`, `FIRST_STEP` and `nextStep` since T33-54; `owned_by` says the harness is held by agent-harness and run by agent-worker; `DEPLOYMENT_SEQUENCE.enforced_by_row` follows (`agent-harness/src/harness.mjs:CONTROL_FLOW["gate-mode"]`). Two comments in `rules.mjs` that named the gate's old file now name agent-harness'. R9's test asserts the new file, that it exists, and that it is not agent-worker's re-export. Reading of R9 ("GATE_ADDRESS naming agent-worker's gate"): the gate agent-worker runs, addressed at the file that holds it; the entry says "req: none", so R9's wording is unchanged (BOB may reword it to name agent-harness at a later fold).
- **T34-86** (DEC-149; K1784, K1797): `checks.mjs`:315 (C-33.29) now says "your group's Civicsmith could not find an account". BOB's grep missed two more member-facing strings in this module, applied here under the same entry: C-109.1's translation ("not switched on for this / instance yet", split across lines) now says "your group's Civicsmith"; C-109.9's ("keep the group's copy from being overloaded") now says "your group's Civicsmith"; and `STANDARD_BASIS["none-recorded"]` ("the plane does not fill one in afterwards", a sentence a surface renders) now reads "none is filled in afterwards". A new test (R11, R20, DEC-149) names each changed string exactly and holds every translation and vocabulary sentence of this module free of instance, copy, plane and server, with a control.

**Fixed in this module (found while reading).** C-109.10 `AI_NO_ACCOUNT`'s translation said "The assistant works only on the account of the member who asks", which K1755 replaced and R20 no longer says (no account serves the act: none of the member's own, and the group's API key not held or off). It now says so: "no account serves your request: you have not connected a Claude account or an API key of your own, and your group has no API key of its own switched on. Connect yours, or ask an administrator about the group's." Its comment cites K1755. R20's test asserts both halves.

**Deferred.** None.

**Found in other modules (REPORT J2).**
- `skills` (`test/m/skills/doctrine.test.mjs`:160, :165, its R18 R29) pins `GATE_ADDRESS.file` to `agent-worker/src/harness.mjs`: red from this merge until skills' T34-35 re-points the pin (N586 expects it).
- `agent-worker` (`agent-worker/test/requirements.test.mjs`:1350, R44 (N53)) pins the same file string: red until agent-worker's T34-39 re-points it. Its `HARNESS` exports all exist at the new address.
- Generated artifacts staled by this change (mechanics §14; not written by this job): `agent-worker/dist/agent-worker.bundled.mjs` (agent-worker R45 now red: STALE BUNDLE for `run-rules/checks.mjs`, `deployment.mjs`, `rules.mjs`), and the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) and the bundles built from it, for BOB's regeneration at layer close.
- `observation-log`'s vocabularies, re-exported here, hold two member-readable sentences DEC-149 names: `OBSERVATION_ACTOR_CLASSES.plane` ("the plane's own scheduler looked") and `OBSERVATION_AUTHORITY_KINDS.objective` ("a standing objective the instance is monitoring for"). observation-log is L5 (closed); for N664's T35 share.

**Tests and checks.**
- `node --test bio-plane/test/m/run-rules/`: tests 24, pass 24, fail 0 (baseline before the change: 23/23).
- Modules using run-rules: ai-runs 69 pass 0 fail; action-plans 61/0; run-productions 38 pass 1 fail (R3, inherited K1708); capture-requests 76 pass 4 fail (inherited ×4, K1708); control-plane 167 pass 1 fail (R43, inherited K1708); skills 66 pass 1 fail (R18 R29, the doctrine pin above, skills' T34-35); agent-worker 6 pass 3 fail (files: ask, harness, requirements — R55 and REC100 ×5 inherited K1764/K1708; R44's pin and R45's stale bundle above).
- `node checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `node checks/architecture.mjs … run-rules`: 12 product files, 21 relative imports; 0 failures.
- `node checks/coverage.mjs … run-rules`: 20 of 20 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … run-rules tranche/T34`: 6 files changed; 0 failures.

Size (session_01CNMEKJTqYUQLE8kuP8dFsz): test runs 3, module lines 1972

## J1 · REPORT

Other modules (detail in this record's Completion):
1. skills `doctrine.test.mjs`:160, :165 (R18 R29) pins `GATE_ADDRESS.file` to `agent-worker/src/harness.mjs`: red from run-rules' merge until T34-35 re-points it.
2. agent-worker `requirements.test.mjs`:1350 (R44, N53) pins the same string: red until T34-39 re-points it.
3. Stale generated artifacts (§14): agent-worker's bundle (its R45 red: run-rules checks/deployment/rules changed) and the plane bundle, for regeneration.
4. DEC-149 in observation-log (L5, closed; N664 T35): `OBSERVATION_ACTOR_CLASSES.plane` ("the plane's own scheduler…") and `OBSERVATION_AUTHORITY_KINDS.objective` ("…the instance is monitoring for").
5. BOB's T34-86 grep missed two run-rules strings split across lines (C-109.1 "this / instance", C-109.9 "the group's copy"); applied here. The same split may hide others in L6+ modules.

## J2 · COMPLETE

T34-32 and T34-86 applied (plus C-109.1, C-109.9, STANDARD_BASIS none-recorded under DEC-149, and AI_NO_ACCOUNT's translation brought to K1755/R20). run-rules 24/24; format, architecture, coverage 20/20, ownership 0 failures. New reds outside this module: skills R18 R29 and agent-worker R44 (the file pin), agent-worker R45 (stale bundle) — see J2. Record: Completion.
