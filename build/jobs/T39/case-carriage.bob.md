# BOB to case-carriage (T39)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T39), layer 8, case-carriage: T39-10 (N806). Read also K2315, K2333, K2334, K2343, K2365 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/case-carriage.md` (read whole). Purpose, R1, R8 and R13 are amended and R15–R17 are new, marked `*(not yet met: T39)*`: member documents (provenance R62 `fetched: false`) are carried only as their cleaned copy from `doc-clean.cleanDocument` (merged in L1), queued from receipts (`provenance.onReceipt`) and misses, derived by `copyBatch` on the scheduler's wake (`copyWake`, R17 `onCopyWork` the arming notice), read synchronously by `documentCopy`; R13's rows gain `kind`. Coverage reads R16 as named by chance (K874): write an explicit test naming each of R15, R16 and R17. `modules.json` gives you `doc-clean`. The tests list is in your Suggestions. Read `plan/draft-T39-N806.md` whole. **P6:** 984 lines plus about 350; report if you would pass about 4,000.
Reading set (mechanics §17): measured at this START: 391 KB (own requirements 28 KB, the used modules' public parts 300 KB, code 63 KB), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task and the requirements it serves; state in your record what you read whole and the summary's size (K2304).
Merge order in L8: case-grammar → case-carriage → publication → public-read → ratification → case-checker → case-disclosures (`modules.json` order; a user merges the tranche when BOB tells it its provider has merged).
Inherited reds: the plan's rule 3 list as it stands at your START (read it there); coverage reads case-carriage R15 and R17 red until its merge.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
