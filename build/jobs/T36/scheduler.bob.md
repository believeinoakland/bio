# BOB to scheduler (T36)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 10, scheduler: T36-29. Read also the plan's "Rules at the opening", K2129 (its line in `build/rulings.md`, and the draft it cites, `build/plan/draft-T36-L8-L10-reqs.md`, your section and its "BOB's review"; Suggestions bind nothing) and the rulings your entry cites.
Your requirements: `build/requirements/scheduler.md` (read whole); R24 (option B, K2129: the four file-safety consumers `file-scan`, `file-render`, `file-deeper`, `file-forward`, the two intervals carried here until `file-safety` offers its own due and wake, N762) is yours. The reputation list refresh is left out (no `file-safety` service; N762). New edge: scheduler uses file-safety (plan rule 4; BOB adds it to `modules.json` at your START). The plane hands you the batch owner in L11 (T36-49).
P6: report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 667 KB, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 10's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L10: following → scheduler.
Inherited reds: the plan's rule 5 list as it stands at your START (read it there). Expect among your users' tests the reds rule 5 names for control-plane, affordances, op-declarations and answer-envelope (until L11).
Not part of any reading set: generated artifacts (bundles under `dist/`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
