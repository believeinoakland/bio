# BOB to retrieval (T42)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 5, retrieval: T42-11 (N830). Read also K2480, K2608 (their lines in `build/rulings.md`) and `build/plan/draft-T42-reqs.md` section N830 (the design and its tests).
Your requirements: `build/requirements/retrieval.md` (read whole). Marked `*(not yet met: T42)*`: R78 `registerSearchDecoration(module, fn)` (batched and synchronous, so `search` stays synchronous; adds keys to page-mode hits only; reuses R56's two refusal codes) and R58's wording. Its user is inquiry R60 (layer 6, T42-12), which registers the question row's `projects`. Test R78 explicitly with negative controls (K874; the string R78 may already be in your tests). Run your users' suites (P11) and report reds by file and line.
Reading set (mechanics §17): measured at this START: 845 KB by `build/plan/reading-sets.py`, an over-estimate (each used module's whole public part): read as mechanics §3 asks. At most 300 KB: read it whole and state so. Over: read whole yourself your requirements, layer 5's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole and the summary's size (K2304). This step is required.
Merge order in L5: retrieval, lines, money (independent; `modules.json` order).
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
