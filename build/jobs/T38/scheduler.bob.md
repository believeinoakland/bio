# BOB to scheduler (T38)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 10, scheduler: T38-30 (N789's other share), test only. Read also K2235 and K2293 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/scheduler.md` (read whole); unchanged. Your work: `bio-plane/test/m/scheduler/files.test.mjs`:288 asserts render's `RENDERER_ABSENT` tick with no scanner bound; file-safety R39 (T38-18, merged) now answers no render wake with no renderer bound, as with scan: the test asserts no `filerender` key in the tick and `nextAt` as R39's wakes give it, naming R24 in its title. Clears plan rule 6 item 14. No `src/` change is expected; if one proves needed, ask in a QUESTION first.
Reading set (mechanics §17): measured at this START by `build/plan/reading-sets.py`: 705 KB (own requirements 23 KB, the used modules' public parts 634 KB, code 49 KB), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (3) **required, not optional (K2304):** read whole yourself your requirements, layer 10's row of `build/layers.md`, `files.test.mjs` and file-safety's R39, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line); state in your record what you read whole and the summary's size.
Merge order in L10: scheduler alone.
Inherited reds: the plan's rule 6 list as it stands at your START; only item 14 is yours.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
