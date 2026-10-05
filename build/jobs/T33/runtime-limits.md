# runtime-limits (T33)

**Status** · session_01MsnfffgQ6VggcGRSweB1wW · depth 2 · WORKING · handled B1

## Completion (RUNTIME-LIMITS #4)

**Entries applied.** T33-6 (K1502): `INSTANCE_CLAUDE_TOKEN` retired. `instanceClaudeStatus` answers `{level: "instance", configured: false, reason: CASCADE_UNSET, detail}` for every `env` and reads nothing from it (R13); the detail says each member who wants the assistant connects their own Claude account or API key. `instanceClaudeToken` is always `null`, derived from the status (R17). `INSTANCE_CLAUDE_BINDING` is no longer exported; no Claude credential is read from `env` (R23). `CASCADE_PUBLISHED` stays exported and stable (R21) but no service gives it any longer. Tests for retired R14 and R15 removed with the ids; R12, R13, R16, R17, R21, R22, R23, R25 tests rewritten to the amended text (R13, R17 and R23 shown with an env that records every read: none). Checked against the pre-change code: R12, R13, R17, R21 and R23 fail there, all 24 pass here.

**Deferred.** Nothing. The two Claude services stay exported (R13, R17 still name them); their removal is a later change once their callers re-point (Suggestions).

**Found in other modules (REPORT J1).**
1. `ai-runs`: `bio-plane/src/ai-runs/index.mjs:1579` forwards `claude_accounts.instance = {token: await instanceClaudeToken(env), ...}`; after K1502 the token is always `null`, and its test `test/m/ai-runs/scheduler.test.mjs:123` (R18) now fails (1 of 56): it expects `instance: {token: "claude-account-x", ref: "instance"}` from `INSTANCE_CLAUDE_TOKEN`. T33-50 (ai-runs) does not name this; the re-point to the member's own reference is K1502's (T33-57 for agent-worker's cascade). An accepted red until ai-runs' job, or a CHANGE to T33-50.
2. Generated artifacts staled by `tokens.mjs` (§14; not rebuilt by me): `agent-worker/dist/agent-worker.bundled.mjs` (agent-worker's own requirements test then fails 1 of 273: STALE BUNDLE) and `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`). `fleetbundles.test.mjs` names both and no other; `pdf-worker` (uses `cpu.mjs` only) is fresh.
3. `bio-plane/scripts/deploy.mjs:235` and `derive-bindings.mjs:92` (with `test/m/bundler/release.test.mjs:146,151,323` and `test/system/deploybindings.test.mjs:116`) still bind `INSTANCE_CLAUDE_TOKEN` as a secret when given; `newgroup/src/release.mjs` likewise. K1502 retires that binding from the installer (T33-91); the bundler/deploy scripts' half is named in no T33 entry.

**Tests and checks.**
- `node --test bio-plane/test/m/runtime-limits/`: tests 24, pass 24, fail 0.
- Users of runtime-limits: subresources 36/0, capture-requests 73/0, monitoring 111/0, instance-setup 94/0, admission 19/0, control-plane 159/0, ocr-worker 1/0 (pass/fail); ai-runs 55/1 and agent-worker 0/1 (272 of 273 requirements), both as in item 1 and 2 above. agent-harness, agent-model and sheet-worker have no tests yet.
- `node checks/format.mjs`: 126 modules, 124 requirements files; 0 failures.
- `node checks/architecture.mjs … runtime-limits`: 3 product files, 3 relative imports; 0 failures.
- `node checks/coverage.mjs … runtime-limits`: 24 of 24 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … runtime-limits tranche/T33`: 3 files changed; 0 failures.

Size (session_01MsnfffgQ6VggcGRSweB1wW): test runs 2, module lines 278

## J1 · REPORT

Found in other modules (record, 'Found in other modules'): (1) ai-runs: index.mjs:1579 forwards claude_accounts.instance from instanceClaudeToken, now always null (K1502); its R18 test (scheduler.test.mjs:123) fails 1 of 56, expecting the INSTANCE_CLAUDE_TOKEN value. T33-50 does not name the re-point. (2) Stale generated artifacts from tokens.mjs, not rebuilt by me (§14): agent-worker/dist/agent-worker.bundled.mjs (agent-worker's requirements test fails on STALE BUNDLE, 272/273) and bio-plane/dist/bio-plane.bundled.mjs; pdf-worker is fresh. (3) bio-plane/scripts/deploy.mjs:235 and derive-bindings.mjs:92 (with bundler's release.test.mjs and system/deploybindings.test.mjs) and newgroup/src/release.mjs still bind INSTANCE_CLAUDE_TOKEN; T33-91 covers the installer, no T33 entry names the scripts' half.
