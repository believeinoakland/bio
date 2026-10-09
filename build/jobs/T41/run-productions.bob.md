# BOB to run-productions (T41)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 6, run-productions: T41-24. Read also K2463, K2448 and K2472 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/run-productions.md` (read whole). Marked `*(not yet met: T41)*`: R21 (D2, D4) an extract-mode run reading inside a held document (`run-rules` R26) proposes connections and quote-bound passages, carrying the step (`steps.recordProduct`), R22 `proposalAccept` (`record-grammar` R52's forms), R23 `bearingNote`, each sentence tied to a quote by extraction R42's byte-exact check as R21 hands it, R24 a reading a few pages at a time within `pages`. Test each explicitly, with a negative control (K874).
R21's caller duties (K2463, EXTRACTION #18 J2): hand extraction R42 `{text, ceiling}` for the `capture_text` unit containing the proposal's place, gated by the viewer (`unitsOf` is not), read from the record and never from the proposal; a quote past the unit's cap reads unverified. Signature: `proposedReadingGrade(entry, capture = null)` and `checkProposedRef(entry, capture = null)`, both pure (`build/jobs/T41/extraction.md`:8, the contract at :54).
Reading set (mechanics §17): measured at this START: 475 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L6: inquiry-grammar, leg-earning, inquiry, hypotheses, steps, citation, basis-versions, contradiction; run-rules, ai-use, ai-runs (copy then delete), run-productions, capture-requests, reading-guides, skills, question-explorer; answers, agent-model, agent-worker (`modules.json` order; ai-use before ai-runs is K624's copy-then-delete). Same-layer providers you use: run-rules (R25, R26), steps (R9's `recordProduct`). Each one's services reach you by a CHANGE once it merges; build against its requirements until then. Add the `uses` edge to `steps` (§3.6's edge list) in your record, for BOB to apply at your merge. question-explorer uses your R21 later in this layer.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Taken (K2482), on tranche/T41 @ 7b6a8a2cf6 (K2482) (merge the tranche branch): R23's run is optional (absent when drafted interactively; the caller then a member who may see both). (6) the 'no AI' read is yours: credentials joins your uses. Send the REPORT for acceptedFor's enforcement when you have it.

## B3 · CHANGE

run-rules is merged into tranche/T41 @ 753d8164cd (K2489): merge the tranche branch and read RUN_ORIGINS, DRAFT_KINDS, ENQUIRE_MODE, pages/checkPagesRead and the test bar from run-rules by key, replacing any stand-in; re-run your tests and record it.

## B4 · CHANGE

steps is merged into tranche/T41 @ 0f747c0f4b (K2491): merge the tranche branch and replace deps.steps' stand-in with the real steps (stepsOf(ctx)); re-run your tests and record it; add the uses edge to steps in your record.

## B5 · ANSWER · re J2

Answered on tranche/T41 @ d88ecca31d (K2496); merge the tranche branch. (2) D4 means the record's own ceiling for the capture, route included: read leg-earning's earned capture ceiling (merged, earlier) for R21's {text, ceiling}, not captureBound's B alone; test a route-bound capture (negative control: an unbound route earns B). R21 says so. (1) N834 (next tranche). (3) joined L11's text. (4) your Uses is written. (5) T42's stamp. Then apply B3 (run-rules) and B4 (steps: replace deps.steps with the real module) and record completion again.
