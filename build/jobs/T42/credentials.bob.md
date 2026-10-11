# BOB to credentials (T42)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 2, credentials: T42-4 (N831). Read also K2442, K2480, K2608 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/credentials.md` (read whole). Marked `*(not yet met: T42)*`: R62 `accountUsesOf({owner})`, an in-plane read with no route and no viewer, answering as R60 answers an owner, failing closed (`unreadable: true`, no default). Tests (from `build/plan/draft-T42-reqs.md` N831, read that section): its answer equals R60's to an owner for `group`, `project:<id>`, `member:<id>`; answers with no viewer; a malformed owner gives `held: false`; a broken store gives `unreadable: true`; no key or digest in the answer (sentinel); no route serves it. Each with a negative control (K874). `ai-use` (layer 6) re-points to it in its own job; do not edit it.
Reading set (mechanics §17): measured at this START: 432 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: read whole yourself your requirements, your layer's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites (K2304). This step is required.
Merge order in L2: record-core, membership, credentials, promotion last.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
