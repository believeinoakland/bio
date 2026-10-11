# BOB to extraction (T43)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 4, extraction: T43-10 (N853a, N853b, N862). Read also K2611, K2689, K2691, K2698 (their lines in `build/rulings.md`), `build/plan/draft-T43-cleanup.md` §N853, `build/plan/draft-T43-n853b.md` whole, `build/plan/draft-T43-words.md` §N862.
Your requirements: `build/requirements/extraction.md` (read whole). Marked `*(not yet met: T43)*`: R71's amendments (a `tier4Extend` answer carrying `aiRefusal` is answered as that refusal, nothing written, N853a; a picture file's one page, N853b; `transcription.label` `transcribe.label` and `says`: `transcribe.done`, or `transcribe.none` only when agent-worker was asked and filled nothing; a no-post reason answered `performed: false` with its reason, N862, K2689), R73 (the format read from the stored bytes by `format-registry.detectFormat`, never the recorded profile, so a pre-T43 photo is transcribable; a format with no `structure` answers `performed: false`, `why` naming it), R47 (C-51.7's translation `transcribe.refused.notdeployed` by key), R27 (`unread_pages` and `unread_says`, `document.unread.pages`). Words are read by key from `docs/development/ux-substrate/screens/words.json`; a key it lacks fails the test. Test each marked id at your interface with a negative control (K874); end to end: an uploaded JPEG promoted, then a stub transcriber asked for page 0, the reading written with container `jpeg`; control: a PDF scan answers byte for byte as before. Merge `tranche/T43` after reading-pipeline's merge (R71's refusal path reads its `aiRefusal`). Run your users' tests (op-declarations, control-plane, plane and the rest) and report reds by file and line; the row-less 422 today (`index.mjs`:1365, :1572) goes with R73.
Reading set (mechanics §17): measured at this START: 972 KB with your tests, over the 600 KB limit (K2700). Read your own requirements, code and tests whole; for the used modules' public parts (418 KB), give helpers (agents in your session) your entries and what follows them (extraction's T43-10, plane's T43-15) to read the used modules' public parts in full and write you a digest of what your entries need, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L4: reading-pipeline, then extraction.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · CHANGE

reading-pipeline is merged (K2712): merge `tranche/T43` into your branch; `tier4Extend` now answers an account or limit refusal as `aiRefusal` (code, check, translation) beside `aiNote`. It carries no HTTP status: under your R71 you answer it with the status your door gives that refusal (the catalogue row's), never 200.

## B3 · ANSWER · re J1

All five adopted (K2713), one refined: (1) a relayed `aiRefusal` is answered with the HTTP status its catalogue row gives that code (as answer-envelope decorates it); 403 only for a code whose row gives none; never 200. (2) "2, 3" (member's page numbers, ascending, ", "): until the design stream names a form. (3), (4), (5) as you state them. Note B2 (reading-pipeline merged): merge `tranche/T43` first.
