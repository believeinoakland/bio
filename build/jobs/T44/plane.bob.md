# BOB to plane (T44)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T44), layer 11, plane: T44-13 (N869, N874). Read also K2716, K2719, K2726, K2731, K2736 (their lines in `build/rulings.md`), DEC-191 in `docs/development/DECISIONS.md`, and `build/plan/draft-T44.md` § N869 (plane R36 lines).
Your requirements: `build/requirements/plane.md` (read whole). Marked `*(not yet met: T44)*`: R36's T44 clause (`NO_PAGE_RENDERED` carries `refused`: one `{page, reason, process?}` per asked page not sent; `reason` the renderer's `pdf-pixels` R39 key, `process` when its detail names one; over `TRANSCRIBE_IMAGE_MAX_BYTES` `IMAGE_TOO_LARGE`; a renderer that throws `DECODE_FAILED`; nothing else changes, nothing posted) and R6's (the gated hook's `by` for an `ai` caller is control-plane R17's `class:ai/<tokenId>`, never `class:ai`; affordances' roster was checked against that form by T44-9, merged before you). Tests: R36 `refused` for a progressive JPEG, an oversized frame and a PDF page refused `NOT_IMAGE_ONLY` (control: a rendered page posts, with no `refused`); R6 `by` for an `ai` caller on a gated op (control: a member's) (K874). Extraction (T44-5, merged in L4) already reads `refused`: run its `pageTranscribe` tests over your transcriber and report any red.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2): two T43 jobs skipped it and a whole read then found three flaws (K2730). Say in your record that you did, and deal with any flaw you find in this job (P8).
Run your release suite as in T43, and report every red by file and line.
Reading set (mechanics §17): measured at this START: 2865 KB with your tests (K2700), over the 600 KB limit. Read your own requirements, code and tests whole; for the used modules' public parts (2298 KB, an upper bound), give one or more helpers (agents in your session) your entries and what follows them (the tranche's close: every module's tests and the PR to `main`), have them read those parts in full and write you a digest of what your entries need, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding and you may read any cited section whole. State in your record how the set was read.
Merge order in L11: affordances, notice-producers, op-declarations, store-door, plane last. You merge last; merge `tranche/T44` into your branch when BOB announces the other L11 merges (CHANGE).
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

Both readings adopted (K2769): (1) a renderer answering ok without a PNG is reason DECODE_FAILED; (2) refused lists only the pages R36 takes in (whole, distinct, ascending, within TRANSCRIBE_PAGES_MAX); others are never asked and never listed. Carry on.

## B3 · CHANGE

Every other L11 job is merged into tranche/T44 (K2771, K2773): affordances (a control-plane stamp, class:/token:, now reads roster: null in op=affordancefacts), notice-producers, op-declarations, store-door. Merge tranche/T44 into your branch, re-run your tests and release suite and extraction's pageTranscribe tests, then complete again.
