# BOB to run-rules (T37)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 6, run-rules: T37-49 (N669, its share: the translation draft runs in T37, K2200 (4)). Read also K1793, K1804, K2200 and K2201 (their lines in `build/rulings.md`), and DEC-127 and DEC-157 in `docs/development/DECISIONS.md` (each entry whole).
Your requirements: `build/requirements/run-rules.md` (read whole); text changed: R21 amended and R22 new, both not yet met: T37: `DRAFT_KINDS` (`own_words`, `translation`) named by `DRAFT_MODE`; a translation draft reads nothing of the record, not `ASK_SCOPE`, whatever the suggestions switch, and is given only the words asked about (at most 100 a draft, K2201); `draftMayRead({kind, firsthand, suggestions})`; no new mode, no new flag: `RUN_MODES`, `DEPLOYED_MODES` and the flags unchanged. The code is `bio-plane/src/run-rules/deployment.mjs` (`DRAFT_MODE` at :174). Your users read R22 later in this layer: `answers` R1 (T37-15) cites it and `agent-worker` (T37-17, its R68) reads `draftMayRead`.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 200 KB (own requirements 18 KB, the used modules' public parts 43 KB, code 139 KB); your tests, 63 KB, are not counted (the script sums `paths` only): 263 KB with them, at most 300 KB. Read it whole, tests included, and state so in your record.

Merge order in L6 (`modules.json` order): run-rules → capture-requests → skills → answers → agent-runner → agent-worker.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here. None is named: the red census lists no run-rules test.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
