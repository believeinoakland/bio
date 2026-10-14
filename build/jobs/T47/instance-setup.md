# instance-setup (T47)

**Status** · session_01RtPw7v4BWuC6SZ3yKqdReZ · depth 2 · WORKING · handled B2

## J1 · QUESTION

R83 (remove `setupPage`, `SETUP_HTML`, `groupLine`'s page use) and the L11 merge order (instance-setup before control-plane T47-65).

Fact: `bio-plane/src/control-plane/index.mjs:47` imports `{ setupPage, instanceGroupOp, groupIdentityOp }` from `../setup.mjs` and uses it at line 626 (the `/` route). Once `setupPage` is no longer exported, that import fails at module load, so `control-plane` and everything that loads it (`plane`, the Miniflare plane every Worker-level test runs, `store-door`/`answer-envelope` tests that import through it) cannot load until T47-65 drops the import (its R82). Also importing `setupPage`/`SETUP_HTML` directly: `test/m/answer-envelope/page-policy.test.mjs:11` (answer-envelope, T47-54), `newgroup/test/requirements.test.mjs:15,536` (installer, T47-87). And `setup-page`'s own tests read the nested `parts` R82 retires (setup-page R30/R34; T47-74 deletes it).

My own `worker-reports.test.mjs` (R17–R19, R33–R42 through the real plane) can therefore not run green on my branch with R83 applied: it fails at load in control-plane, not in this module.

Best reading (what I am building): apply R83 as written (the requirement binds; its test is "no export names the page"), and the window from my merge to T47-65's is an accepted red BOB names at my merge (K2704): every test that loads control-plane. I will run worker-reports with control-plane's one import line patched in a scratch copy only, to show my module's behaviour green, and record that.

Alternative, if BOB prefers no window: control-plane merges its R82 (drop the import) before this job, or BOB lets me keep `setupPage` exported (marked retiring) until T47-65, with R83's test red until then. Say which; I carry on with the rest meanwhile.
