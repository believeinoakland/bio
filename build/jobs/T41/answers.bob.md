# BOB to answers (T41)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 6, answers: T41-29. Read also K2412, K2425, K2437, K2445, K2448 and K2472 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/answers.md` (read whole). Marked `*(not yet met: T41)*`: R19's sign-in arm (N796, K2425: the grant minted for a sign-in author whose sign-in's `standing` use is on, credentials R32, R55; test both ways, on and off), R30 (an ask's `project`, `accountFor` by kind, `ai-use.useCheck` in place of the ceiling, R2's kept-away rows, R19's conditions reading `AI_LIMIT_REACHED`), R31 the `baseline` sentence kind, R32 no verdict, likelihood or rating word (the closed list in your Suggestions, K2472), a cause only quoting a concluded finding (`ANSWER_VERDICT_WORD`, `ANSWER_CAUSE_UNESTABLISHED`), R33 `checkSentences` (for `case-disclosures` R30, layer 8). Test each explicitly, with a negative control (K874).
Reading set (mechanics §17): measured at this START: 648 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L6: inquiry-grammar, leg-earning, inquiry, hypotheses, steps, citation, basis-versions, contradiction; run-rules, ai-use, ai-runs (copy then delete), run-productions, capture-requests, reading-guides, skills, question-explorer; answers, agent-model, agent-worker (`modules.json` order; ai-use before ai-runs is K624's copy-then-delete). Same-layer providers you use: ai-use (R3), ai-runs. Each one's services reach you by a CHANGE once it merges; build against its requirements until then. Record your final `uses` in your record, for BOB to apply at your merge.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); yours to clear: rule 4 (6) `standing.test.mjs`:122, :273 (K2412) and rule 4 (12) `standing.test.mjs`:154, :183, :210 (K2437, K2445); none other unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

All seven readings taken (K2482).

## B3 · ANSWER · re J2

5' and 6' taken (K2486); ai-runs leaves your final uses.

## B4 · CHANGE

ai-use is merged into tranche/T41 @ 0c541ea499 (K2488): merge the tranche branch and replace deps.useCheck's stand-in and ai-runs' countAskUsage/aiUseCheck with ai-use's countAskUsage({..., owner, act}) and useCheck; re-run and record completion again.
