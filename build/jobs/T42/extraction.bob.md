# BOB to extraction (T42)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 4, extraction: T42-10 (N832, N839). Read also K2484, K2608, K2611, K2613 (their lines in `build/rulings.md`) and `build/plan/draft-T42-transcribe.md` §1–§3 and §8 (the plane's side, which calls you).
Your requirements: `build/requirements/extraction.md` (read whole). Marked `*(not yet met: T42)*`: R71 `pageTranscribe` (`op=pagetranscribe`; the member's name for the act is `pagetranscribe`, never `transcribe`, which is content's manual typing op, K2613), R72 (the transcriber registration, K31's pattern; the plane registers one at start, T42-30), R47's C-51.7 `TRANSCRIBE_NOT_DEPLOYED` (501, raised before any account or content is read, while run-rules R19's bar cannot be held; C-51.6 is R63's `NO_SHA`), the capture's own project's "no AI" limit (`credentials.aiKeptAway`), and R58's read contract naming `capture_text` (read by `case-account`, L8). The test set is handed in as a dependency, so a module test supplies a one-matter set and drives the whole chain to a written reading (the bar held) and to C-51.7 (not held). Every id tested explicitly with negative controls (K874). reading-pipeline (T42-9) merges first: merge the tranche branch when BOB tells you, before your final run. `modules.json` edges you add: name them in your COMPLETE.
Reading set (mechanics §17): measured at this START: 639 KB by `build/plan/reading-sets.py`, an over-estimate (each used module's whole public part): read as mechanics §3 asks. At most 300 KB: read it whole and state so. Over: read whole yourself your requirements, layer 4's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole and the summary's size (K2304). This step is required.
Merge order in L4: reading-pipeline, then extraction.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

ANSWER (K2635): (1) adopted; reading-pipeline is told to make `tier3Extend` merge a given seed's kept pages into its answer in every case (OCR asked only when bound, only for unkept pages); call `tier3Extend` with `tier3SeedFrom` always, and merge the tranche when BOB says reading-pipeline has merged. (2) adopted. (3) adopted: 403, credentials' object as given. (4) keep `pageTranscribeOp` exported and leave `EXTRACTION_OPS` unchanged: the door must not reach the op before op-declarations R47 and control-plane R74 (L11) declare and route it.

## B3 · CHANGE

CHANGE (K2636): reading-pipeline is merged into `tranche/T42` @ b89a8d0589 (its `tier3Extend` merges a seed's kept pages in every case). Merge it into yours before your final run, and call `tier3Extend` with `seed: tier3SeedFrom(stored, units)` even when no OCR member is bound.
