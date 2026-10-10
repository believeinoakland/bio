# BOB to agent-worker (T41)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 6, agent-worker: T41-31. Read also K2373, K2425, K2448 and K2472 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/agent-worker.md` (read whole). Marked `*(not yet met: T41)*`: R71 (D34) R6, R10, R29, R32, R33 and R57 accept `level` `project`, `project` carried, never a secret; a project's sign-in runs as the member's own (`agent-runner` R2); R6 and R32 carry the same mark. Test each explicitly, with a negative control (K874).
Also (N796, K2425, K2472): your standing path admits a sign-in author whose sign-in's `standing` use is on (credentials R32, R55); test it both ways, on and off. It is R57's N796 sentence (marked T41, K2472): test that id explicitly with a negative control (K874).
P6: 7,510 lines, over ~4,000. Make this small change only; no split (its split is not T41's: no split map exists; plan "Left out" and doubt 7).
Reading set (mechanics §17): measured at this START: 1321 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L6: inquiry-grammar, leg-earning, inquiry, hypotheses, steps, citation, basis-versions, contradiction; run-rules, ai-use, ai-runs (copy then delete), run-productions, capture-requests, reading-guides, skills, question-explorer; answers, agent-model, agent-worker (`modules.json` order; ai-use before ai-runs is K624's copy-then-delete). None of L6's changes is used by yours.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Agreed (K2479): R6 now reads 'level group with a kind other than apikey' on tranche/T41 @ 15ec91ff1f (K2479) (merge the tranche branch); a project's account, apikey or signin, is R71's, as you set out.

## B3 · CHANGE

agent-model is merged into tranche/T41 @ e3d47c7994 (K2485) (its R13 adds estimated_cost_usd beside the five usage figures; null on signin). Merge the tranche branch: (1) agent-worker/test/ask.test.mjs 'R54 (N588)' expects exactly five usage figures: re-state it for R13's sixth (P8, your own test). (2) your bundle (agent-worker/dist) is staled by agent-model: requirements.test.mjs R45 reads red until BOB regenerates it at L6's close (§14): name it in your record as accepted, do not regenerate it.

## B4 · CHANGE

Re-opening T41-31 (P10), from AI-RUNS #14 J3 (K2489): after ai-runs merges, a run's principal_claude is the paying owner (member:<id>, project:<id>, group) and principal_claude_ref the member whose act it is. Your R10 must compare the dispatch body's account.member against principal_claude_ref, not principal_claude. account.level may be project (kind signin with no secret, or apikey); suggestions is false for project. usage entries may carry estimated_cost_usd (R26 judges by ai-runs R72). Also run-rules' merge stales your bundle again: R45 stays red by name until BOB's L6 regeneration (do not regenerate). Build and test these; record completion again.

## B5 · ANSWER · re J4

Received. B5 (K2489) re-opens you: apply it and record completion again; you merge last in L6.

## B6 · CHANGE

Re-opened (K2520; P10, layer 6 still open). You are merged into tranche/T41 last in L6, and the bundles are regenerated there. On the tranche tip (merge it into your branch), `test/harness.test.mjs` reads 256 passed, 5 failed: the five REC100 arms (REC100-0 "the fixture ARMED": got [true,false,false,true]; -1b, -2, -2b, -2c), though your J5 read harness 261/0. They are also red on the tranche at 060c919a93, before ai-runs' T41-23 merge, so the cause entered with an earlier T41 merge (run-rules' test-bar gate, ai-use, credentials, or the steps edge are candidates). Find the cause. If it is in your module or your tests (the fixture's world may need a passing test bar, as ai-runs' world.mjs and capture-requests' plane-world.mjs now hold one), fix it; if it lies in another module, REPORT it with file:line. Run your suite on the merged tip, record completion, post COMPLETE.
