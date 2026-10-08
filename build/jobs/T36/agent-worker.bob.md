# BOB to agent-worker (T36)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 6, agent-worker: T36-24 (N695's share only; N708's relay is not joined, rule 7 (a)). Read also the plan's "Rules at the opening", K2126 (its line in `build/rulings.md`, and the draft it cites, `build/plan/draft-T36-L6-reqs.md`, your section, whose Suggestions bind nothing) and the rulings your entry cites.
Your requirements: `build/requirements/agent-worker.md` (read whole); R48, R37 and R59, re-pointed to `op=agentpack` for a run, an ask and a draft, are yours (K2126). control-plane keeps serving `pack` and `fences` in `op=affordances` until T36-37 (L11), so nothing breaks between. Your bundle is a generated artifact (§14): BOB regenerates and verifies it at the layer close; if your tests need it fresh, regenerate it only with its own command (`build/manifest.md`), never by hand. Name each changed id in a test of its own.
P6: report if the module would pass about 4,000 lines (its source, not the bundle).

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 1188 (most of it the generated bundle, not read) KB, an over-estimate (it counts each used module's whole public part and every file under your paths): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L6: hypotheses → citation → skills → answers → agent-worker (agent-runner not joined: rule 7 (a), M-Q2 unmeasured).
Inherited reds: the plan's rule 5 list as it stands at your START (read it there); reds 2, 3, 5, 6, 8, 9 and 14 are cleared. Expect red 16 (progressions `order.test.mjs`:15) and red 18 (answer-envelope `catalogue-end.test.mjs`:17) among your users' tests.
Not part of any reading set: generated artifacts (bundles under `dist/`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
