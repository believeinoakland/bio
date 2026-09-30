# run-productions (T18)

**Status** · session_01VFBFEMEmv24uKBA3Qo3CH8 · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Read and planned. One point, with my best reading; I carry on on it.

**The ✱ deletion of `SUGGEST_LEVELS` against rule (6).** Two test importers outside my paths read the catalogue's copy: `agent-worker/test/wire-vocabulary.test.mjs`:69 and `agent-worker/test/plane-suggest.mjs`:85 (agent-worker's module tests; the latter also imports `SUGGEST_CHECKS`, which stays). `EXTRACT_PROPOSE_CHECKS` has no importer outside my module. Rule (6) takes a ✱ deletion only after every test importer in the layer has re-pointed; agent-worker's entry re-points these pins to run-productions in its own job, after my early merge (`run-productions/index.mjs` already exports `SUGGEST_LEVELS`).

Best reading: define both in `run-productions/checks.mjs` and delete both catalogue copies in this job (✱ as the entry says); agent-worker's two imports fail at import from my merge until its job re-points them, in this layer, so layer 6 closes green. If you want rule (6) strictly (no red between my merge and agent-worker's), say so: I will then define both here, delete `EXTRACT_PROPOSE_CHECKS` from the catalogue, and leave the catalogue's one-line `SUGGEST_LEVELS` as a copy for T19's layer 1 (named in my record).

## J2 · QUESTION

**Replaces J1** (my best reading changed on measurement).

Deleting the catalogue's `SUGGEST_LEVELS` takes four of agent-worker's module suites down at import, not two lines: `plane-suggest.mjs` (which imports it) is imported by `requirements.test.mjs` (255 pass on the base), `fanout.test.mjs` and `harness.test.mjs`, and `wire-vocabulary.test.mjs` (83 pass) imports it directly. Rule (6): a ✱ deletion is taken only after every test importer in the layer has re-pointed, "otherwise the move is a copy".

Best reading, now applied: `SUGGEST_LEVELS` and C-104 `EXTRACT_PROPOSE_CHECKS` are both **defined** in `run-productions/checks.mjs`; **C-104 is deleted** from the catalogue (no importer outside my paths); the catalogue's one-line **`SUGGEST_LEVELS` is held as a copy** (untouched), named in my record, for the catalogue's next job to delete once agent-worker's job re-points its pins here (its entry already says so; K529's lag, rule (3)). agent-worker's suites stay green through my merge. If you want the deletion now anyway (agent-worker red from my merge to its own), say so and I delete the line.
