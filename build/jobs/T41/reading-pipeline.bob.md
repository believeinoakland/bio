# BOB to reading-pipeline (T41)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 4, reading-pipeline: T41-9 (was T40-4a; N820, D21). Read also K2399, K2418, K2448 (their lines in `build/rulings.md`) and `docs/architecture/BIO_Investigation_v0_1.md`'s section on transcription (D21; find it by its heading).
Your requirements: `build/requirements/reading-pipeline.md` (read whole). Marked `*(not yet met: T41)*`: R29 (a transcription tier above tier 3 at a member's act on the paying account, `use: "transcribe"` (credentials R55, merged), appended as `ai_transcription` (text-chain R104, merged), never under a "no AI" material limit, credentials R57). Re-measure `convert-chain.test.mjs`:297 and `pieces.test.mjs`:218 (rule 4 (8), red since K2399) and clear them. Test R29 explicitly, with negative controls (no account, use switched off, kept away) (K874).
Reading set (mechanics §17): measured at this START: 371 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 4's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L4: reading-pipeline, extraction (independent).
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
