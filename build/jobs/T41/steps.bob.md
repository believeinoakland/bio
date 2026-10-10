# BOB to steps (T41)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 6, steps: T41-17. Read also K1043, K2448 and K2472 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/steps.md` (read whole). Marked `*(not yet met: T41)*`: R1–R24, R26, R27, a new module (R25 retired, moved to `ai-runs` R74, K2472): R1 `stepCreate`; R2 who sees a step; R3 the doer by handle and a non-hidden project only; R4 the reads (`step`, `stepsOn`, `stepsIn`, `stepsOfGroup`), `stepsOn`'s header answering the question's `projects` (`leg-earning` R14; inquiry R60's share); R5 states and per-question outcomes; R6 `stepDelete`; R7 `stepsLike`; R8 `STEP_ALIKE_EXISTS`; R9 `stepProduct`, `recordProduct`, `productsOf`, `stepsOf`; R10 `learned`; R11 waits; R12 `byWhen`, `nearing`, `stepsDue`; R13 costs; R14 `costShares`; R15 `costMessage`; R16 `questionFollow`; R17 `findRecipients`; R18 the `step` authority resolver and promotion check; R19 working material only; R20 nothing measures a member; R21 no nesting; R22 tables and purge; R23 later-found looks (`observation-log` R37); R24 `stepPropose`, `stepAccept`; R26 `acceptanceCounts`; R27 no bar read. Test each explicitly, with a negative control (K874).
Your `modules.json` entry has empty `paths` and `tests` (K1043; the format check refuses a path naming nothing). Your Suggestions name `bio-plane/src/steps/` and `bio-plane/test/m/steps/`, as the other plane modules (`bio-plane/src/<module>/`, `bio-plane/test/m/<module>/`). Name your paths and tests in your record, every file you create; BOB writes them into `modules.json` before the ownership check (`build/rulings-active.md` §5). Your `uses`, as `modules.json` shows: record-grammar, civil-time, record-core, membership, promotion, connections, observation-log, leg-earning, inquiry. Size: about 2,150 lines; if it would grow past about 2,500, report to BOB before passing it: the cost relay (R13–R15), follows (R16, R17) and later-found (R23) then move to a module directly after it, BOB's at your report.
Reading set (mechanics §17): measured at this START: 275 KB by `build/plan/reading-sets.py` (your code is 0 today: the module is not yet built), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L6: inquiry-grammar, leg-earning, inquiry, hypotheses, steps, citation, basis-versions, contradiction; run-rules, ai-use, ai-runs (copy then delete), run-productions, capture-requests, reading-guides, skills, question-explorer; answers, agent-model, agent-worker (`modules.json` order; ai-use before ai-runs is K624's copy-then-delete). Same-layer providers you use: leg-earning (R13, R14). Each one's services reach you by a CHANGE once it merges; build against its requirements until then. Record your final `uses` in your record, for BOB to apply at your merge. capture-requests (R55), ai-runs (R73, R74), run-productions (R21) and question-explorer use yours later in this layer.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Confirmed (K2480). (1) your family is C-142 (ai-use C-143, reading-guides C-144, question-explorer C-145, investigation C-146). (2)-(6) taken; ai-runs is told to register registerRunHolder.

## B3 · CHANGE

leg-earning is merged into tranche/T41 @ e3d47c7994 (K2485): merge the tranche branch into yours and replace your stand-in or fail-closed path with leg-earning's real R13 projectsDrawingOnPaged and R14 projectsShownOn; re-run your tests and record it.

## B4 · ANSWER · re J1

For your record (K2490): system steps are created by ai-runs after their run opens, so your R1 machine arm always sees a run its caller holds; nothing to change.
