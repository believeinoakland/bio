# run-productions (T18)

**Status** · session_01VFBFEMEmv24uKBA3Qo3CH8 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Read and planned. One point, with my best reading; I carry on on it.

**The ✱ deletion of `SUGGEST_LEVELS` against rule (6).** Two test importers outside my paths read the catalogue's copy: `agent-worker/test/wire-vocabulary.test.mjs`:69 and `agent-worker/test/plane-suggest.mjs`:85 (agent-worker's module tests; the latter also imports `SUGGEST_CHECKS`, which stays). `EXTRACT_PROPOSE_CHECKS` has no importer outside my module. Rule (6) takes a ✱ deletion only after every test importer in the layer has re-pointed; agent-worker's entry re-points these pins to run-productions in its own job, after my early merge (`run-productions/index.mjs` already exports `SUGGEST_LEVELS`).

Best reading: define both in `run-productions/checks.mjs` and delete both catalogue copies in this job (✱ as the entry says); agent-worker's two imports fail at import from my merge until its job re-points them, in this layer, so layer 6 closes green. If you want rule (6) strictly (no red between my merge and agent-worker's), say so: I will then define both here, delete `EXTRACT_PROPOSE_CHECKS` from the catalogue, and leave the catalogue's one-line `SUGGEST_LEVELS` as a copy for T19's layer 1 (named in my record).
