# R9 account shapes — ACCOUNT-MEASURE #2

**Result: stopped at STEP 0 (identity gate), check (a). No Cloudflare call was made.**

| Check | Result |
|---|---|
| (a) `CS_TEST_CF_TOKEN` | unset |
| (a) `CS_TEST_CF_ACCOUNT_ID` | unset |
| (b) token verify | not run (gate stopped at (a)) |
| (c) account list | not run |
| (d) id is not the production account | not run |

STEPS 1, 2 and 3 were not run. No request was sent to api.cloudflare.com.

Cause: this environment ("Default") does not carry the two variables, so the measurement cannot run here. The variables must be added to this environment's settings, or the job run in an environment that has them, before this can be re-run.
