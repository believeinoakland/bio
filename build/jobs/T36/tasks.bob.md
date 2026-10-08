# BOB to tasks (T36)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 11, tasks: T36-45. Read also the plan's "Rules at the opening", K2130 (its line in `build/rulings.md`, and the draft it cites, `build/plan/draft-T36-L11-reqs.md`, your section and its "BOB's review"; Suggestions bind nothing), K2097 and the rulings your entry cites.
Your requirements: `build/requirements/tasks.md` (read whole); R1 and R18 (appended, the paged drain and wake) are yours (K2130). Sites (K2097): `taskDrain` (`bio-plane/src/tasks/index.mjs`:324–368) and `#backoffWake` (:977–995); the test stand-ins `test/m/tasks/world.mjs`:115 and `ledger.test.mjs`:53, 76 honour `after` as `capture` R45 states it. A waiting event no longer uses up `limit` (the draft's "Choices made" 7). Edge: tasks uses capture (`after` and each event's `cursor`, T36-41, merged in L3): present in `modules.json`.
P6: 1,416 lines on `tranche/T36` (own `paths`, code only, tests excluded; +about 20); report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 421 KB, an over-estimate (it counts each used module's whole public part; it counts no tests): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 11's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task (T36-45), the requirements it serves and what follows (the scheduler's task-drain wake and queue, which read your drain); state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Layer 11 has 16 jobs; merge order: wizard-scripts → op-grades → affordances → tasks → notice-producers → queue → setup-page → instance-setup → op-declarations → legacy-ui → installer → admission → answer-envelope → store-door → control-plane → plane (`modules.json` order, except N711's callers before admission); you are 4th.
Inherited reds: the plan's rule 5 list as it stands at your START (read it there; open at this writing: 1, 4, 7, 10–13, 15–20, 22–24, 26, 27). None is yours. Expect among your users' tests the reds rule 5 names for op-declarations, control-plane and plane until their L11 jobs merge.
Not part of any reading set: generated artifacts (bundles under `dist/`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
