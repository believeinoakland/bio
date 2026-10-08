# agent-model (T38)

**Status** · session_01Ad5jo3ATsxaCVanqA7zcKg · depth 2 · COMPLETE · handled B1

## Reading

Reading set measured at START: 110 KB (own requirements 12 KB, code and tests 98 KB), under 300 KB, so read whole myself: `build/requirements/agent-model.md`; layer 6's row of `build/layers.md`; every file under `agent-model/` (`src/model.mjs`, `src/apikey.mjs`, `src/outcome.mjs`, `src/subscription.mjs`, `test/agent-model.test.mjs`); the T38-9 entry of `build/plan/current.md`; K2200, K1819, K2290 in `build/rulings.md`; and, for the wire R2 names, `agent-runner`'s public part (Terms, R1–R4, R17–R21). `modules.json` gives agent-model no `uses`, so no other public part was owed.

## Completion

**Entries applied.** T38-9 (N785, its share; K2200, K1819, K2290): R2 as amended.
- An account reference is `{kind: "apikey", key}` or `{kind: "signin", member}` (`member` a non-empty string); `subscription` is refused `ACCOUNT_REFERENCE_UNUSABLE` and gone from the code: `src/subscription.mjs` became `src/signin.mjs` (`signinTurn`, `signinConverse`), with no token anywhere.
- A `signin` turn, one turn (`modelCall`) and a conversation alike, opens the member's own instance, `runner.get(runner.idFromName(member))`, never `newUniqueId`, and sends the credential `{kind: "signin", member}` (agent-runner R2).
- The runner's `NOT_SIGNED_IN` and `NOT_THIS_MEMBER` pass through as `refused` with that type and the runner's own detail.
- R11: a `signin` reference of `level` `group` is refused, as any non-`apikey` group reference is.

**Reading of R2 (BOB's to correct).** "No `runner`" (`RUNNER_NOT_CONFIGURED`) is read as no binding that can name an instance: a `runner` without both `idFromName` and `get` (absent, or a bare instance stub) is refused `RUNNER_NOT_CONFIGURED` with no call, because a bare stub is an instance this module did not name. The old test that accepted a bare stub is replaced. agent-worker passes `env.RUNNER`, the namespace, so this changes nothing for it.

**Deferred.** None.

**Found in another module.**
- `agent-worker` (T38-10's): with this change, `test/ask.test.mjs` fails 2 cases, both R26 (N588) "on the subscription path…": they pass a `{kind: "subscription", token}` reference, which R2 now refuses (502 instead of 200). `src/cascade.mjs`:25, :83, :91 still build `{kind: "subscription", token}`. T38-10 carries `{kind: "signin", member}` and fixes both.
- `agent-worker`'s generated bundle `dist/agent-worker.bundled.mjs` (and the release copy) is now stale: `test/requirements.test.mjs` R45 fails 2 cases, because `agent-model/src/model.mjs` changed and `src/subscription.mjs` was renamed to `src/signin.mjs`. Not mine to write (mechanics §14); agent-worker's job or BOB rebuilds it with `node bio-plane/scripts/bundles.mjs`.
- `agent-worker` before this change: 12/12 files pass; after: 10/12 (`ask.test.mjs`, `requirements.test.mjs`, as above).

**Tests and checks.**
- `node --test agent-model/test/`: tests 13, pass 13, fail 0 (R2's test covers each point of the amendment by name).
- Layer tests: none (`build/manifest.md`).
- Users' tests (`agent-worker`): 10 of 12 files pass; the 2 failures are listed above.
- `checks/format.mjs`: 137 modules, 136 requirements files; 0 failures.
- `checks/architecture.mjs agent-model`: 5 product files, 6 relative imports; 0 failures.
- `checks/coverage.mjs agent-model`: 12 of 12 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs agent-model tranche/T38`: 0 failures.

Size (session_01Ad5jo3ATsxaCVanqA7zcKg): test runs 6, module lines 1660

## J1 · COMPLETE

T38-9 done on job/T38/agent-model (6ec78c0dae+). R2 as amended: account reference is apikey or {kind: "signin", member}; signin opens runner.get(runner.idFromName(member)), never newUniqueId, for modelCall and converse alike, credential {kind: "signin", member}; subscription refused ACCOUNT_REFERENCE_UNUSABLE and removed (src/subscription.mjs is now src/signin.mjs); NOT_SIGNED_IN / NOT_THIS_MEMBER pass through as refused with that type. My reading, yours to correct: a runner without idFromName and get (a bare stub) is RUNNER_NOT_CONFIGURED, no call. agent-model 13/13; format, architecture, coverage (12/12), ownership 0 failures. Merge early (K1750): agent-worker (T38-10) uses it. Found for agent-worker: ask.test.mjs R26 x2 (subscription-path cases now refused; cascade.mjs:25/83/91 still build subscription) and requirements.test.mjs R45 x2 (its dist bundle is stale after this change; not mine to rebuild, §14). Details in my record.
