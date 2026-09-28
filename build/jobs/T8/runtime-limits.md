# runtime-limits (T8)

**Status** · session_01A5CFL3k1MxyKAgWRcRPdu6 · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

**R26's `bound` on a non-string value.** R26 says `bound` is true when `env.DAEMON_TOKEN` or `env.ADMIN_TOKEN` is "present and non-empty (presence only)". It does not say what a non-string value such as `5` or `true` is. Best reading, built: presence is truthiness, exactly legacy-store's `#monitorTokenBound()` (`!!(env.DAEMON_TOKEN || env.ADMIN_TOKEN)`), so monitoring keeps its arming behaviour byte for byte when it switches over. A Worker secret is always a string, so in practice this is "a non-empty string". `token()` never spends a non-string. My R26 test covers every state of a string binding (missing, empty, live, published), and non-string values for `token()` only. It does not pin `bound` for a non-string. If you want `bound` to be `typeof v === "string" && v.length > 0` instead, say so. It is a one-line change. Not blocking: I am COMPLETE on this reading.

## J2 · REPORT

Two items outside my paths.
1. **Stale generated artifact (mechanics §14).** `bio-plane/src/tokens.mjs` is an input of `agent-worker/dist/agent-worker.bundled.mjs`. Adding R26 staled that bundle: `node --test bio-plane/test/fleetbundles.test.mjs` fails "agent-worker: STALE BUNDLE — the source ../bio-plane/src/tokens.mjs has changed". The bundle is agent-worker's, so I did not regenerate it. It needs `npm run build` in `agent-worker/` at the layer close.
2. **Requirement mark.** `build/requirements/runtime-limits.md` still says R26 is "not yet met: N63", in the Status header and on R26 itself. It is met now at `tokens.mjs` `unattendedCredential`, so the marks are yours to clear. Its callers still hold their own copies: legacy-store's `#monitorTokenBound`/`#monitorToken` (store.mjs 17597–17608). Those move to R26 when monitoring and capture-requests are extracted, not in this job.

## J3 · COMPLETE

**Entries applied:** N63, runtime-limits' share. R26 `unattendedCredential(env) → {bound, token}` is now in `bio-plane/src/tokens.mjs`:
- `bound` is synchronous presence of `DAEMON_TOKEN` or `ADMIN_TOKEN` (see J1).
- `token()` resolves to the first live one of the two, else `null`, using this module's own `liveToken`.
- The object is frozen and holds no value. The call never throws, and `token()` never rejects, even when reading the env throws.

**Deferred:** none. **Other modules:** J2 (the agent-worker bundle is stale; the R26 marks are yours to clear).

**Tests:** `node --test bio-plane/test/m/runtime-limits/`: tests 26, pass 26, fail 0, todo 0. The R26 test covers the full 4×4 matrix of the two bindings' states (missing, empty, live, published), plus unrelated bindings, non-string values and a hostile env. The R22 and R23 tests now include R26: it is in the export surface, and it is pure and read-only on a frozen env. No layer tests (manifest). No module uses R26 yet, so there are no user suites to run. `fleetbundles.test.mjs`: the agent-worker STALE BUNDLE row fails, as reported in J2.

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures.
- architecture: 3 product files, 3 relative imports; 0 failures.
- coverage: 26 of 26 live requirement ids named by a test; 0 failures.
- ownership: 3 files changed by runtime-limits between tranche/T8 and HEAD; 0 failures.

Size (session_01A5CFL3k1MxyKAgWRcRPdu6): test runs 2, module lines 306
