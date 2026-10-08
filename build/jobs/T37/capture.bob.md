# BOB to capture (T37)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 3, capture: T37-38. Read also K2155 and K2175 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/capture.md` (read whole); R73 amended, not yet met: T37: `captureOf`'s `reputation` reader and `fileScanner` binding kept on the instance and handed to acquisition with the store; `cap.reputation` a function calling the reader at each call (null with none); each adopted from the first caller that supplies it, a later one ignored, never compared; R58 unchanged for `env`. acquisition (T37-37) merges before you: merge the tranche branch once it has, and test the reader reaching `acquire` end to end.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 677 KB (own requirements 58 KB, the used modules' public parts 364 KB, code and tests 256 KB), an over-estimate (it counts each used module's whole public part and every file under your paths, tests included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 3's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L3 (`modules.json` order): acquisition → capture → file-safety.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

acquisition (T37-37) is merged into tranche/T37 (K2190): merge it, run t37.test.mjs end to end, and complete.
