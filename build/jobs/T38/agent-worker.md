# agent-worker (T38)

**Status** · session_01FkkvLb4mMocNRN7xTn7DXk · depth 2 · COMPLETE · handled B3

### Work (AGENT-WORKER #14)

**Reading set (mechanics §17).** BOB measured 1,284 KB; over 300 KB, so (3): I read whole `build/requirements/agent-worker.md` (44 KB), layer 6's row of `build/layers.md`, the code my entry changes (`src/cascade.mjs` whole; `accountOf` and the run's model-half comments in `src/index.mjs`), the tests my entry changes (`test/cascade.test.mjs`, `test/ask.test.mjs`, `test/requirements.test.mjs`, each whole), and the used services my Uses names for this entry: `agent-model`'s terms and R2 (amended, T38-9), `credentials` R22 and R35. One worker read the rest of `src/` (`index.mjs`, `ask.mjs`, `draft.mjs`, `signin.mjs`, `ops.mjs`, `reads.mjs`) and every other file under `test/` whole and wrote a summary of about 7 KB, each statement citing file and line: every reader of the account's kind, level, secret, member and suggestions (`index.mjs`:1434–1460, :1568, :1391, :1373–1383; `ask.mjs`:152, :187–192; `draft.mjs`:153–166, :196–206, :221, :319–325, :358), every test using `subscription` or a stub `RUNNER`, and the stub's interface (`ask.test.mjs`:297–335). Nothing it left out mattered: no other code reads `secret`, and every `cascadeToken(...).reference` site is reached only past `accountOf`, which now agrees with the cascade on `signin`.

**Entries applied.** T38-10 (N785, its share; K2200, K2290; reading confirmed K2299, B2):
- `src/cascade.mjs`: `ACCOUNT_KINDS` is `["apikey", "signin"]`; `subscription` retired (credentials R22). R32: a `signin` account is `available` exactly when its `member` is a non-empty string, with no published-hash check (no secret), else `unset`; group level holds `apikey` only. R33: `cascadeToken` hands agent-model `{kind: "signin", member}`. Comments no longer name a subscription token.
- `src/index.mjs` `accountOf` (R6): a `signin` carrying a `secret` key at all, or a `suggestions` present and not `false`, is refused `BAD_ACCOUNT`; an absent `suggestions` is off (R56 as before). The header and the run's model-half comment now say "the member's own sign-in … in that member's `agent-runner` instance".
- Merged `tranche/T38` after agent-model's T38-9 (B3) and rebuilt the bundle (`npm run build`): 23 inputs. My change adds no `src/` file.

**Tests.** Named by R id: `cascade.test.mjs` (R32 sign-in available/unset arms, R33's `{kind: signin, member}`, R6 `BAD_ACCOUNT` for a member's `subscription`, a sign-in with a secret, an empty secret, suggestions true, group level, no or empty member; R6/R29/R10 a sign-in drives named `{available, kind: signin, level: member, member}`, with no `suggestions` field too, and Ruth's sign-in on Sam's run refused `RUN_NAMES_A_DIFFERENT_PAYER`); `requirements.test.mjs` (the same R6 arms plus suggestions not a boolean, R29, R10, R32's table and R33's); `ask.test.mjs` (R54's refusal table gains the four T38 arms; R6/R33: a run on the sign-in reaches only the runner instance named by its member, `idFromName(member)`, each conversation carrying `{kind: "signin", member}` and no model-API call; R26's two `calls` arms now on the sign-in path, the stub a namespace with `idFromName`/`get`).

**Found in other modules.**
- `bundler`: `bio-plane/test/system/fleetbundles.test.mjs`:237 (agent-worker's pinned 23 inputs) is red after the rebuild: agent-model's T38-9 renamed `agent-model/src/subscription.mjs` to `signin.mjs`, so the manifest now records `../agent-model/src/signin.mjs` in its place; still 23 inputs, nothing else differs. The pin needs re-pinning from the committed manifest (bundler's). Reported (J2).
- `agent-worker/test/cascade.control.mjs`: stale before T38 (its arms match nothing in `index.mjs`, as its own header says); not re-armed here, deferred as before.

**Deferred.** None of this entry's.

**Tests and checks** (after the merge of `tranche/T38` and the rebuild):
- `agent-worker/test/*.test.mjs`, each run: agent-worker 140/0, ask 62/0, cascade 71/0, fanout 185/0, harness 261/0, plan 55/0, requirements 305/0, t35 206/0, t36 20/0, t37 165/0, versions 20/0, wire-vocabulary 83/0. Before the merge, `ask` R26 ×2 and the new R6/R33 sign-in arm were red against the old agent-model, and green against agent-model's job branch in a scratch worktree (62/0). No layer tests are named in `build/manifest.md`; I changed no service I provide.
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: 1 fail, the bundler pin above (staleness arm for agent-worker PASS).
- `format`: 137 modules, 136 requirements files; 0 failures.
- `architecture agent-worker`: 37 product files, 131 relative imports; 0 failures.
- `coverage agent-worker`: 62 of 62 live requirement ids named by a test; 0 failures.
- `ownership agent-worker tranche/T38`: 8 files changed by agent-worker; 0 failures.

Size (session_01FkkvLb4mMocNRN7xTn7DXk): test runs 32, module lines 46

## J1 · QUESTION

R6's `signin` "carried with `level` `member`, `suggestions` `false` and no `secret` (one present is refused `BAD_ACCOUNT`)". My reading, which I am building on: `accountOf` refuses `BAD_ACCOUNT` a `signin` account whose `level` is not `member`, which carries a `secret` key at all (any value, empty string included), or whose `suggestions` is present and not `false` (`true` refused; absent accepted and read as off, as R56 reads an absent switch). The cascade (R32) judges a `signin` account `available` exactly when its `member` is a non-empty string (the wire's `member`, the account itself being the wire object), never checks the published-hash list for it (no secret), and `cascadeToken` hands agent-model `{kind: "signin", member}`. `subscription` is dropped from `ACCOUNT_KINDS` (now `["apikey", "signin"]`), so a `subscription` account is refused `BAD_ACCOUNT`. If you want an absent `suggestions` refused too, say so.

## J2 · REPORT

bundler: `bio-plane/test/system/fleetbundles.test.mjs`:237, the pin on agent-worker's 23 inputs, is red after my rebuild. agent-model's T38-9 renamed `agent-model/src/subscription.mjs` to `signin.mjs`, so the committed manifest (`agent-worker/dist/agent-worker.bundle.json`) now records `../agent-model/src/signin.mjs` in its place. It is still 23 inputs and nothing else differs; the staleness arm for agent-worker passes. The pin needs re-pinning from the committed manifest (bundler's). My change adds no `src/` file.
