# BOB to question-explorer (T41)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 6, question-explorer: T41-28. Read also K1043, K2425, K2448 and K2472 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/question-explorer.md` (read whole). Marked `*(not yet met: T41)*`: all of R1–R14, a new module: R1 `exploreDue`, `exploreWake`, `exploreTick`; R2 worth exploring; R3 the run path (`origin: "explore"`), a principal served by a sign-in exploring only while that sign-in's `explore` use is on (credentials R32, R55; N796, K2425: test both ways, on and off); R4 each find gauged; R5 `findsFor`; R6 a find's only doors a member's; R7 the gauge's gate; R8 a run stopped by a limit; R9 never a person on its own; R10 `EXPLORE_PERSON_CAP` (20); R11 a group's own test investigations; R12 estimate and actual cost; R13 reading inside documents (`run-productions` R21); R14 a find against as prominent as one for. Test each explicitly, with a negative control (K874). R6 names `queue` R27 (layer 11), R5 serves `notice-producers` and R1 `scheduler` (later layers): those are theirs.
Your `modules.json` entry has empty `paths` and `tests` (K1043; the format check refuses a path naming nothing). Your Suggestions name `bio-plane/src/question-explorer/` and `bio-plane/test/m/question-explorer/`, as the other plane modules. Name your paths and tests in your record, every file you create; BOB writes them into `modules.json` before the ownership check (`build/rulings-active.md` §5). Your `uses`, as `modules.json` shows: record-grammar, civil-time, record-core, membership, credentials, connections, retrieval, inquiry, leg-earning, basis-versions, contradiction, steps, run-rules, ai-use, ai-runs, capture-requests, run-productions. Built and tested; offered to no member until R7's gate (D11's bar) opens.
Reading set (mechanics §17): measured at this START: 473 KB by `build/plan/reading-sets.py` (your code is 0 today: the module is not yet built), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L6: inquiry-grammar, leg-earning, inquiry, hypotheses, steps, citation, basis-versions, contradiction; run-rules, ai-use, ai-runs (copy then delete), run-productions, capture-requests, reading-guides, skills, question-explorer; answers, agent-model, agent-worker (`modules.json` order; ai-use before ai-runs is K624's copy-then-delete). You come after steps (T41-17), ai-use (T41-22) and ai-runs (T41-23). Same-layer providers you use: steps, ai-use, ai-runs, leg-earning (R13, R14), run-rules (R19, R23, R26), run-productions (R21), capture-requests (R55). Each one's services reach you by a CHANGE once it merges; build against its requirements until then. Record your final `uses` in your record, for BOB to apply at your merge.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

All seven readings taken (K2482). Your family is C-145. entities joins your uses (record it).

## B3 · CHANGE

leg-earning is merged into tranche/T41 @ e3d47c7994 (K2485): merge the tranche branch into yours and replace your stand-in or fail-closed path with leg-earning's real R13 projectsDrawingOnPaged and R14 projectsShownOn; re-run your tests and record it.

## B4 · CHANGE

run-rules is merged into tranche/T41 @ 753d8164cd (K2489): merge the tranche branch and read RUN_ORIGINS, DRAFT_KINDS, ENQUIRE_MODE, pages/checkPagesRead and the test bar from run-rules by key, replacing any stand-in; re-run your tests and record it.

## B5 · ANSWER · re J2

Settled on tranche/T41 @ 119f4f7640 (K2490) (merge the tranche branch): you create no step. You pass place and work to ai-runs' open; ai-runs opens the run, then creates the system step through steps.stepCreate with run = the open run (ai-runs R73 now says so; your R3 too). Change your open path to that.

## B6 · CHANGE

steps is merged into tranche/T41 @ 0f747c0f4b (K2491): merge the tranche branch and replace deps.steps' stand-in with the real steps (stepsOf(ctx)); re-run your tests and record it; add the uses edge to steps in your record.

## B7 · CHANGE

ai-use is merged into tranche/T41 (K2488; now @ 50adb50c36): merge the tranche branch and reach ai-use's exploreAllowed, estimate, label and exploreAsk through its real module, not deps alone; re-run and record it. You merge after ai-runs, run-productions and capture-requests (merge order), each reaching you by CHANGE.
