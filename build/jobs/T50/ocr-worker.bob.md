# BOB to ocr-worker (T50)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 1, ocr-worker: **T50-55 · ocr-worker**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/ocr-worker.md` (read whole), folded by K3616; yours to meet: R23 (N1191 (c), JOURNEYS V4 B-30: a photograph's words are not read today).
BOB's notes for this job:
1. Found by a reading worker (`build/plan/fold-T50-owners.md` §5 (c)): `ocr-worker/src/member.mjs`:41, 85 call `renderPageToPixels`, which refuses `NOT_A_PDF` (`pdf-worker/src/pagepixels.mjs`:345); the picture renderer `renderPictureToPixels` (pdf-pixels R42, `pdf-worker/src/picturepixels.mjs`:246) exists and is used by the plane's AI transcriber. Read pdf-pixels' Provides for R42 whole before using it; `pdf-pixels` must be in your `uses` (check `modules.json`; if not, a REPORT to BOB).
2. Your bundle `ocr-worker/dist/` is a generated artifact: rebuild it with `npm run build` in `ocr-worker/` and say so in your record; BOB verifies it at the layer's close.
3. reading-pipeline's R4 (layer 4, T50-58) selects a picture for OCR; it relies on your R23 as written.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items; words by key through setup-words' `word(key, vars)`, which is now in layer 1 so you may use it, adding `setup-words` to your `uses` by a REPORT to BOB if you start using it).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
