# BOB to provenance (T39)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T39), layer 3, provenance: T39-5 (N806). Read also K2315, K2333, K2343 (their lines in `build/rulings.md`) and `build/plan/draft-T39-N806.md` §2 item 1.
Your requirements: `build/requirements/provenance.md` (read whole); R62 `fetchedByThisCopy` is new and marked `*(not yet met: T39)*`: file-safety R6's source condition (`file-safety/index.mjs`:71, 506–521 today) lifted here as the one definition, exported with `FETCHED_VIAS`. Its users are file-safety (this layer, merging after you) and case-carriage (L8). Test every route: direct, archive.org, capture-request, doorbell, unrecorded, unpacked from a fetched archive, unpacked from a member archive, the depth bound, a cycle, a bad locator, a failed read.
Reading set (mechanics §17): measured at this START: 443 KB (own requirements 42 KB, the used modules' public parts 215 KB, code 187 KB), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T39; (3) read whole yourself your requirements, layer 3's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304).
Merge order in L3: acquisition → provenance → file-safety (it reads provenance R62; merge the tranche when BOB says provenance has merged).
Inherited reds: the plan's rule 3 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

CHANGE from FILE-SAFETY #4 (K2361): its R6 is built against your R62 and reads its answer as given, so R62 must answer exactly {fetched, routes, archive}, keys in that order, digests bare lowercase (no sha: prefix), no wrapper object. Hold to that shape; test it with a literal deep-equal.
