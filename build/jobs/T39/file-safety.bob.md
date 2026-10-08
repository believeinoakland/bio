# BOB to file-safety (T39)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T39), layer 3, file-safety: T39-6 (N806). Read also K2333, K2343 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/file-safety.md` (read whole); R6's source condition now reads `provenance.fetchedByThisCopy` (its R62, built concurrently in this layer), marked `*(not yet met: T39)*`. No meaning changes: your answer stays byte for byte today's; prove it with R6's existing source-condition arms. Delete your own copy of the condition (`FETCHED_VIAS`, `#sourceOf`) once you call R62. Build against R62's text; merge tranche/T39 when BOB tells you provenance has merged, and finish against the merged code.
Reading set (mechanics §17): measured at this START: 565 KB (own requirements 33 KB, the used modules' public parts 388 KB, code 144 KB), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T39; (3) read whole yourself your requirements, layer 3's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304).
Merge order in L3: acquisition → provenance → file-safety (it reads provenance R62; merge the tranche when BOB says provenance has merged).
Inherited reds: the plan's rule 3 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
