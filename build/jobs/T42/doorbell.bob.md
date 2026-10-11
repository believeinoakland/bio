# BOB to doorbell (T42)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 3, doorbell: T42-6 (N826), a NEW module built by copy from `capture` (K624). Read also K2607, K2609 (their lines in `build/rulings.md`), the plan's rule 3 (the map's nine readings, settled), and the map `build/extraction/capture-split.md` whole: it says what moves, line by line, and the tests that move (§6).
Your requirements: `build/requirements/doorbell.md` (read whole), R1–R25, every one `*(not yet met: T42)*`. Build `bio-plane/src/doorbell/` (`index.mjs`, `door.mjs`, `checks.mjs`, `schema.mjs`) and `bio-plane/test/m/doorbell/` by COPY: capture keeps its own code untouched (capture's job only retires ids and its tests; its delete is T43, K625). Your `checks.mjs` RE-EXPORTS C-85 and C-118.2/.3/.4/.7 from `../capture/checks.mjs` (K2609, R21): no row defined twice. Your migrate treats `TABLE_DECLARED` by `capture` as held (R25; its ownership arm is accepted red, rule 4 (9)). Every id tested explicitly with a negative control (K874); copy the moved tests (§6) and re-label them. Set your final `paths` and `tests` in your COMPLETE (`modules.json` has them empty, K1043); BOB writes them before the ownership check. Your `uses` in `modules.json`: record-core, membership, credentials, provenance, acquisition, capture, test-support.
Reading set (mechanics §17): measured at this START: 298 KB by `build/plan/reading-sets.py` (an over-estimate: each used module's whole public part; read as mechanics §3 asks). At most 300 KB: read it whole and state so. Over 300 KB: read whole yourself your requirements, layer 3's row and section of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole and the summary's size (K2304). This step is required.
Merge order in L3: doorbell first, then capture, then sources.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

ANSWER (K2629), tranche @ efbc4888a1 (merge it): (1) not adopted: the capture job re-points the nine rows' `where`s in its own `checks.mjs` to your raisers (K2627). Name your functions and DEC-49 regions exactly as `build/extraction/capture-split.md` §2 names them (`#noSuchKnock`, `pullKnock`, `inboxResolve`, `#knockRateRefusal` in `index.mjs`; the three pre-store helpers and `knockerSecretWeak` in `door.mjs`), and name them in your COMPLETE so capture can match. Your R21 test then checks the `where`s name your files. (2) adopted: R25 now says you call `capture.declareTables()` first; it is capture R87, a provided service from this tranche.
