# BOB to agent-model (T42)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 6, agent-model: T42-19a (N832). Read also K2611 and `build/plan/draft-T42-transcribe.md` sections 0, 1 and 4.
Your requirements: `build/requirements/agent-model.md` (read whole). Marked `*(not yet met: T42)*`: R1 amended and R14: a model entry for mode `transcribe` (`MODEL_FOR_MODE.transcribe`), and a page's picture reaching the model only inside the `tool_result` answering the call it came from, as an `image` block. Its user agent-worker (T42-20) merges after you; it needs `MODEL_FOR_MODE.transcribe` and R14's image block. Test each marked id explicitly at your interface, with a negative control (K874: the id's string may already be in your tests). Run your users' suites (P11) and report reds by file and line.
Reading set (mechanics §17): measured at this START: 133 KB by `build/plan/reading-sets.py`, within 300 KB: read it whole and state so.
Merge order in L6: `modules.json` order; inquiry and basis-versions (the seam owners) before run-productions; agent-model before agent-worker. Jobs this layer: inquiry, hypotheses, steps, citation, basis-versions, ai-use, run-productions, question-explorer, agent-model, agent-worker.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
