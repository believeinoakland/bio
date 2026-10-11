# BOB to reading-pipeline (T42)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 4, reading-pipeline: T42-9 (N835, N832). Read also K2500, K2611, K2613 (their lines in `build/rulings.md`) and `build/plan/draft-T42-transcribe.md` §1–§3 (the chain: what your R30 is for and what extraction, agent-worker and the plane build on it).
Your requirements: `build/requirements/reading-pipeline.md` (read whole). (1) N835, tests only (R29 stands): `index.mjs`:698 spells the paying owner `member:${member}` from the `member` it is handed; a stamped `member:<id>` gives `member:member:<id>`, which ai-use's owner parser rejects: build it from the bare id, tested with a stamped and a bare member (negative control). (2) R30 `*(not yet met: T42)*`: the act's entry into R29's tier, and a re-read keeps AI-transcribed pages (`tier3SeedFrom` keeps only OCR pages today; a later OCR re-read must not drop the AI's pages nor pay again for them). Test R30 explicitly with negative controls (K874; the string R30 may already be in your tests). Run extraction's tests too (it uses you, P11).
Reading set (mechanics §17): measured at this START: 484 KB by `build/plan/reading-sets.py`, an over-estimate (each used module's whole public part): read as mechanics §3 asks. At most 300 KB: read it whole and state so. Over: read whole yourself your requirements, layer 4's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole and the summary's size (K2304). This step is required.
Merge order in L4: reading-pipeline, then extraction.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · CHANGE

CHANGE (K2635), tranche @ 8b76a53f9a, from EXTRACTION #19 J1 (1), within your R30 (a kept AI page is never asked again): `tier3Extend` must merge a given seed's kept pages (their text into `i2text` and their parts into `chain`) in EVERY case, asking the OCR member only when it is bound and only for pages not kept. Today (`index.mjs`:496–590) (a) with OCR bound and every wanted page kept, `seeded` is set but `i2text` is returned without the kept pages (:507–510); (b) with no OCR bound, nothing of the seed is merged (:584–588); either way `tier4Pages` lists kept pages again, so the AI would be asked and charged again and a partial answer would drop pages. Test both cases with negative controls. Extraction calls `tier3Extend` with `tier3SeedFrom` always.
