# BOB to reading-pipeline (T50)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 4, reading-pipeline: **T50-58 · reading-pipeline**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/reading-pipeline.md` (read whole), folded by K3627; the ids marked `*(not yet met: T50)*` are yours to meet: R33 (a text capture with no blank line split at its single line breaks), R4 (a JPEG or PNG with no text is a tier-3 candidate for page 0), R34 (`title`: HTML `<title>`, else the first heading).
BOB's notes for this job:
1. Measure first (M-T50-4, N1191 (a)): run V4's walked text file through `textUnitsOfText` before you change R33, and put the units it gives before and after in your COMPLETE.
2. R4 relies on ocr-worker R23 (T50-55, merged in L1, K3620): a picture is transcribed as a one-page document through pdf-pixels' picture renderer; read ocr-worker's Provides for R23 only.
3. R34 is HTML only in T50; office and PDF titles wait as N1202 (T51). screens-intake (T50-30, L11) titles a capture from `reading.title`.
4. No new op: nothing for L11's op lists.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (named above), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements and code are well under 600 KB; its used-public figure is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1; `setup-words` added to your `uses`, K3632), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L4 merge order: `modules.json`'s (extraction, reading-pipeline); the two share no new service, so each merges as soon as it is complete.
