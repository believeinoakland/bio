# BOB to progressions (T37)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 5, progressions: T37-12 (test only). Read also K2090 (its line in `build/rulings.md`; MEMBERSHIP #27 J2).
Your requirements: `build/requirements/progressions.md` (read whole); no text change. Red 4 is yours: `bio-plane/test/m/progressions/order.test.mjs`:15 (R41) pins a literal copy of layer 5's order; read it from `build/modules.json`'s layer 5, as membership's R83 test does, so a module added to the layer never stales it. A small job: keep your reading to what this entry needs.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 542 KB (own requirements 26 KB, the used modules' public parts 377 KB, code and tests 139 KB), an over-estimate (it counts each used module's whole public part and every file under your paths, tests included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 5's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L5 (`modules.json` order): events → standards → progressions → retrieval.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

K2204 (P8): deal with two of your deferrals in this job: (1) the whole-store overdueScan on listener registration (index.mjs:891) scans only that thread, where R33 allows, with a test; (2) fix the zoneOf comment (:38-39). The listeners awaited in turn stay as they are (R33 as written; no timeout owed). Your 32 users' reds are named in rule 6 (items 7, 14, 17). Then COMPLETE again.
