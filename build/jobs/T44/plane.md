# plane (T44)

**Status** · session_01Dwre5v9yYZxVWPCf2yNy66 · depth 2 · COMPLETE · handled B3

**How the reading set was read (mechanics §17).** Read whole: `build/requirements/plane.md`; every file of `bio-plane/src/plane/` (`ask.mjs`, `door.mjs`, `index.mjs`, `screens.mjs`, `stats.mjs`, `store.mjs`, `transcribe.mjs`, `unpack.mjs`, `wiring.mjs`, `wizards.mjs`); every test under `bio-plane/test/m/plane/` (the 33 `.test.mjs`, `fixture.mjs`, `maps.mjs`; the two binary fixtures not read) and `test/system/migrate-released.test.mjs`; START's rulings K2716, K2719, K2726, K2731, K2736; DEC-191; `draft-T44.md` § N869. The used modules' public parts (pdf-pixels, with its R39 though private, control-plane, extraction, agent-worker, affordances, image-codecs, ai-use, store-door, op-declarations, notice-producers) and `build/layers.md`'s general rules and layer 11 were read in full by one helper agent in this session, which wrote a digest citing a section (and the code's file:line) for every statement (K2032); the sources stay binding.

## Completion

**Entries applied (T44-13).**
- R36 (N869; DEC-191 (4), (5); K2719): `transcribe.mjs`' new `renderAsked` answers `{sent, refused}`; `renderPages` answers its `sent`. A `NO_PAGE_RENDERED` answer carries `refused`, one `{page, reason, process?}` per asked page not sent, ascending: the renderer's own key (the picture renderer's after `NOT_A_PDF`, never `NOT_A_PDF`), `process` when the refusal names one (top-level `process`, as pdf-pixels spreads its detail), `IMAGE_TOO_LARGE` for a PNG over `TRANSCRIBE_IMAGE_MAX_BYTES`, `DECODE_FAILED` for a renderer that throws, and (J1, K2769) for one that answers no PNG or an empty one. Only the pages R36 takes in are listed (K2769). Nothing else changes; nothing is posted. A rendered answer carries no `refused`.
- R6 (N874; K2726): `door.mjs`' gated hook stamps `by` for an `ai` caller as `class:ai/<tokenId>`, as control-plane's generic forward does; a session's stays its member, a binding class `class:<cls>`. Only `affordancesOp` is handed `by`.

**Own flaws found by the whole read, fixed here (P8).** Two stale comments in `store.mjs`: admission's fingerprint named capture R56 (it is doorbell R12 since K2719), and doorbell's routes said capture's map still carried the names "until its T43 delete" (deleted, N849). No behavioural flaw found in the rest of the module.

**Deferred.** None.

**Other modules.** None found against their requirements. extraction's `pageTranscribe` reading of `refused` (index.mjs:1781–1806: top-level `refused`, `reason`, `process` containing "progressive") matches what the transcriber now answers; its tests stub the transcriber, so they run over its shape, not this code (22 pass). affordances' `t36.test.mjs` R48 (two titles) are red on this branch before the tranche merge: rule 4 (6)'s accepted reds, cleared by T44-9 on the tranche.

**Tests and checks.**
- `node --test "test/m/plane/*.test.mjs" test/system/migrate-released.test.mjs` (from `bio-plane/`; the release suite, as in T43): tests 197, pass 197, fail 0. New `t44.test.mjs` (6): R36 `refused` for a progressive JPEG (pdf-pixels' `refuse-progressive` fixture), a JPEG frame over `PICTURE_SOURCE_MAX`, and a vector-only PDF page (`NOT_IMAGE_ONLY`), each with nothing posted; control: a rendered page posts with no `refused`; the per-case table; R6 `by` for an `ai` caller (control: a member's, a binding class's). `t42.test.mjs`:384's pin gains the two `NO_SUCH_PAGE` entries.
- `node --test test/m/extraction/pagetranscribe.test.mjs test/m/extraction/t43.test.mjs test/m/extraction/t44.test.mjs`: 22 pass, 0 fail.
- `node --test "test/m/affordances/*.test.mjs"` (users of `by`): 233 tests, 231 pass, 2 fail, both rule 4 (6) (`t36.test.mjs` R48, until T44-9).
- Checks: format 0 failures; architecture 0; coverage 38 of 38, 0; ownership 0 (6 files against `tranche/T44`).
- No file added outside the module's `paths` and `tests` (rule 3).

**Merge (B3, CHANGE; K2771, K2773).** `tranche/T44` merged into `job/T44/plane` after affordances, notice-producers, op-declarations and store-door, no conflict. Re-run on the merged branch: plane tests and release suite 197 pass, 0 fail; extraction's transcription tests 22 pass, 0 fail; affordances 226 pass, 0 fail (rule 4 (6)'s two reds cleared by T44-9, and its roster reads `class:ai/<tokenId>` as `roster: null`); checks format, architecture, coverage (38 of 38), ownership (6 files) all 0. No reds.

Size (session_01Dwre5v9yYZxVWPCf2yNy66): test runs 9, module lines 232

## J1 · QUESTION

R36 (T44) `refused`: two cases the clause does not name. (1) A renderer answering ok but with no PNG (not image/png, or empty bytes): my reading, `reason: "DECODE_FAILED"` (the page was not prepared as pixels; DECODE_FAILED is a pdf-pixels R39 key). (2) "Each asked page": my reading, the pages R36 already takes in (whole numbers >= 0, each once, ascending, at most TRANSCRIBE_PAGES_MAX); a page past the cap, or not a whole number, is never asked of a renderer and is not listed (no renderer key would fit). Extraction reads only reason and process (its index.mjs:1781-1806), so neither changes what a member is told. I am building on these readings; nothing here blocks.

## J2 · COMPLETE

T44-13 done on job/T44/plane (0290a7ada5): R36 `refused` per asked page (K2769's readings), R6 `by` = class:ai/<tokenId> for an ai caller; two stale store.mjs comments fixed from the whole read (own code and tests read whole; used modules' public parts by one helper's cited digest). Plane tests + release suite (migrate-released): 197/197. extraction pageTranscribe tests 22/22. affordances 231/233, the 2 reds rule 4 (6) (t36.test.mjs R48, until T44-9). Checks format, architecture, coverage (38/38), ownership all 0. No reds of mine. I merge tranche/T44 on your CHANGE after the other L11 merges and re-run. Details and Size line in my record.
