# agent-runner (T39)

**Status** · session_01NpUoSSKhpotLhikWUwzPRL · depth 2 · WORKING · handled B1

## Completion

**Reading set** (mechanics §17): read whole: `build/requirements/agent-runner.md`; bundler's Purpose and Provides; layer 6's contract (`build/layers.md`); every file of `agent-runner/` but the generated bundle and the lock (`src/` 6 files, `test/` 9 files, `Dockerfile`, `package.json`, `wrangler.jsonc`, `fleet-member.json`, `scripts/build.mjs`, `.gitignore`, `.dockerignore`); the plan's T39-8 entry and rule 3; K2290 and K2343. 152 KB as BOB measured, under the limit.

**Entries applied.** T39-8 (N801; K2290, K2343): R2.
- `src/runner.mjs`: `credentialOf` takes `{kind: "signin", member}` alone (member a non-empty string, R2's letter; a member R17 would refuse finds no sign-in and answers `NOT_SIGNED_IN`). Any other kind (`subscription`, `apikey`, anything else), a credential carrying a `secret` (any value, even empty), or none answers `NO_CREDENTIAL` before the shape check, the sign-in check or any temporary directory, so nothing starts and the binary is not run. The token path is removed: no `CLAUDE_CODE_OAUTH_TOKEN`/`ANTHROPIC_API_KEY` map, no fresh `CLAUDE_CONFIG_DIR`, no secret threaded to `scrub`; every query's environment is the replacing one with `CLAUDE_CONFIG_DIR` the stored sign-in's directory.
- Tests: `helpers.mjs`' default request is now `{kind: "signin", member}` and `startRunner(…, {signedIn})` signs the instance in through R17/R18 against the stubbed binary. New `R2 R8 …` (conversation.test): with the instance signed in, a `subscription` and an `apikey` credential carrying a sentinel token (with and without a member), a `signin` one carrying a `secret`, and the malformed shapes are each refused `NO_CREDENTIAL`, no query, no binary run, no temporary directory, and the sentinel is in no frame, log line or file under the temporary and sign-in roots. R2's environment test rewritten for the one kind (environment replaced whole, neither variable, the stored sign-in's own directory). The old R8 token-scrub test was removed with the token path (R8's sentinel half is now the `R2 R8` test, its stored-sign-in half signin.test's R8); R9 (conversation.test) now checks the per-conversation temporary directory; signin.test's R9 runs the `signin` kind and a refused `subscription` one; R22 no longer sends token credentials; worker.test's R12 checks the query ran under the image's stored sign-in.
- Negative control: the new tests against the T38 `runner.mjs` fail (`R2 R8`, and signin.test R9: the subscription conversation ran).

**Bundle.** `src/worker.mjs` and its inputs unchanged: `bundles.mjs --check` reports every guarded bundle fresh; nothing regenerated.

**Deferred.** None.

**Other modules.** None found. `agent-worker` (the user of this service) imports no agent-runner code; its tests pass unchanged.

**Tests and checks.**
- `agent-runner`: `node --test test/` — tests 34, pass 34, fail 0.
- `agent-worker`: `node --test test/` — tests 12, pass 12, fail 0.
- `node bio-plane/scripts/bundles.mjs --check` — every guarded bundle is fresh.
- `checks/format.mjs` — 139 modules, 137 requirements files; 0 failures.
- `checks/architecture.mjs agent-runner` — 28 product files, 29 relative imports; 0 failures.
- `checks/coverage.mjs agent-runner` — 23 of 23 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs agent-runner tranche/T39` — 7 files changed; 0 failures.

**Uses** (final): `bundler`, unchanged.

Size (session_01NpUoSSKhpotLhikWUwzPRL): test runs 9, module lines 2170
