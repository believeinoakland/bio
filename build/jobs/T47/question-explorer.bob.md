# BOB to question-explorer (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 6, question-explorer: **T47-85 · question-explorer** · (K3084) `choosing.test.mjs` R3 re-pointed to a held sign-in (credentials R70) · test only.
Your requirements: `build/requirements/question-explorer.md` (read whole). No requirement of yours changes: credentials R70 (merged, K3084) now answers a sign-in account as connected only when a token is held (`subscriptionTokenHold`), so your test that connects a sign-in by the fact alone (`subscriptionConnected`) is red; re-point it to a held token, keeping what it proves. Read credentials' Provides for R70 and R71.
Read your own code and tests whole where your reading set allows (P20); deal with any flaw you find (P8).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture 0 failures for your files (K2950).
Reading set: read your requirements, your code and tests; for what is over the 600 KB limit, helpers write a digest citing each section (K2032).
