# BOB to provenance-routes (T41)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 3, provenance-routes: T41-7b (tests only). Read also K2442 (its line in `build/rulings.md`).
D54 (Bob's "D54: B", K2408; built by membership in L2, K2442): an administrator, the founder included, neither invited nor joined to a HIDDEN project sees it only at `EXISTENCE` (its id, name and owners), never its contents; discoverable projects unchanged. Your tests `marked.test.mjs`:126 and `table.test.mjs`:40 assumed an administrator's `FULL` sight of a hidden project and are red since membership's merge (rule 4 (11)); re-state each for D54, with a negative control (a discoverable project, or an invited administrator, still at `FULL`). No requirement changes; if your requirements' text assumes the old sight, report it as a QUESTION.
Reading set (mechanics §17): measured at this START: 340 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 3's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L3: provenance, provenance-routes, capture-sources, acquisition, capture, file-safety (`modules.json` order; provenance provides R63 to capture).
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

Re-opening your job (K2457; P9 finding from PROVENANCE #20, layer 3 still open): provenance R63 (merged) adds upload documents (origin.kind upload, source.receipt without knock_id; their receipt's sightings answered as uploads: [{by, statement, at}]). Your index.mjs:143 builds a doorbell document's one-hop chain from source.receipt.knock_id; give an upload document its own one-hop chain from its upload receipt (R1), tested with a negative control. Merge tranche/T41 first; then record COMPLETE again.

## B3 · RESUME

Idle since 21:20 with nothing pushed; your dependent suites' run appears to have stopped (a background command does not survive the turn). Push the R1 change (40/40) if not pushed, re-run the users' suites in the foreground one path at a time, then record COMPLETE.
