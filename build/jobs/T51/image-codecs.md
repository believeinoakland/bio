# image-codecs (T51)

**Status** · session_015qkDnLHcfXrkvLPEKdDKjT · depth 2 · WORKING · handled B5

## J1 · COMPLETE

**T51-256 image-codecs: done** (commit a4d45636a5 on job/T51/image-codecs).

**Entries applied.** T51-256 (the 45 `plain` findings in `build/plan/words-pass/image-codecs.md`): each sentence is now `localize("image-codecs.<file stem>.<slug>", en)` with its en text unchanged. Judgement: I read every one as text a member can see, because refusal notes become the error message (`${code}: ${note}`) and the refusal tables' reasons are the feature descriptions. None is listed as unkeyed. Two keys needed care: `"an image past the memory bound"` is both a key of `JPX_REFUSES` and `PNG_REFUSES` and the `feature` passed at its call site. Both keys are computed `[localize(...)]`, and each call site uses the same id, so R7 (feature is a key of the declared set) holds in every locale.

**Deferred.** Nothing in the module.

**Open question for BOB (K874).** Your START asks that every new id get an explicit test naming it. None of the 45 ids is named by a test. The refusal paths are reached through crafted streams, and some sites are deep in the parsers, so a test per id is a real piece of work. No check enforces it, and the other converted modules' tests do not name their ids either. Do you want a test per id (I would write them as a follow-on in this job), or is the words check's zero count enough?

**Found in other modules.** None from my reading.

**Tests run (all pass).**
- `pdf-worker/test/codecs/`: ccitt 7/7, dct 16/16, invariants 12/12, jbig2 6/6, jpx 8/8, mq 6/6, png 10/10.
- `pdf-worker/test/`: structure, pagepixels, imagecrop, jbig2, jpx all exit 0.

**Checks.**
- format: 0 failures (174 modules).
- architecture (image-codecs): 0 failures.
- coverage (image-codecs): 11 of 11 live ids named by a test, 0 failures.
- ownership (tranche/T51 to job/T51/image-codecs): 5 files, 0 failures (my four sources and this record).
- words: 0 `image-codecs` findings. The repo-wide words total is still 4799 failures from other modules, so `checks/run.mjs` exits 1 for that reason and not mine.

Size (session_01YPCgAZ8Ga6MXdTiGufjUD7): test runs 19, module lines 3423.

## J2 · COMPLETE

**T51-256 image-codecs: COMPLETE again after CHANGE B2 (K3962, K3965)** (commit c8fa11a20e on job/T51/image-codecs; tranche/T51 merged; civicos-process at ea6cd83).

**Converted test copies.** Each test that copied a localized `en` now compares with `localize(id, en)` using the decoder's own id, or asserts the key:
- `dct.test.mjs`: the colour-transform reason is compared with `localize("image-codecs.dctdecode.libjpeg_s_default_for_three", …)`.
- `invariants.test.mjs`: the memory-bound feature keys in `JPX_REFUSES` and `PNG_REFUSES` are compared with their localize calls.
- `jpx.test.mjs`: `MEMORY` is a `localize` call.
- `png.test.mjs`: the memory-bound feature is compared with `localize("image-codecs.pngdecode.…")`.
- `jbig2.test.mjs` R3: the localized generic-region and refinement details are matched by prefix against `localize` with the decoder's ids. The regex copies are gone, and the assertion messages hold no sentence text.

**Checks (after the conversions).**
- Codec tests: ccitt 7/7, dct 16/16, invariants 12/12, jbig2 6/6, jpx 8/8, mq 6/6, png 10/10.
- pdf-worker: structure, pagepixels, imagecrop, jbig2, jpx all exit 0.
- format 0 failures; architecture 0 failures; coverage 11 of 11 live ids; ownership 10 files, 0 failures.
- words: 0 `image-codecs` findings.
- `node bio-plane/src/setup-words/build.mjs --check` exits 1, with one warning about `jurisdictions.index.amount_is_amount_and_units` (a formatted argument, R18). It is not in my module, so I have not touched it. Please route it to its owner.

**Still open (unchanged from J1).** K874: no test names the 45 new ids. Please rule whether you want a test per id or whether the words check is enough.

Size (session_01YPCgAZ8Ga6MXdTiGufjUD7): test runs 33, module lines 3423.

## J3 · COMPLETE

**T51-256 image-codecs: COMPLETE after CHANGE B4 (K3971)** (commit a825394b67 on job/T51/image-codecs; tranche/T51 merged first).

**Applied.** `jpxdecode.mjs` and `pngdecode.mjs` each export `MEMORY_FEATURE`, the one unlocalized identifier for the memory refusal. Both refusal tables use it as the key, both throw sites pass it as `feature`, and the reason sentence stays read by `localize`. The three tests compare against the constant (or import it). R7 holds: the feature is a key of the declared set.

**Value, and why it differs from the English.** The constant is `"image-past-memory-bound"`, not `"an image past the memory bound"`. The words check reads the English five-word literal as a sentence and fails the module, so the identifier form was the only way to meet your rule and the words zero-count together. This is a deliberate change of value, and it has a cross-module effect (below).

**Cross-module reds (REPORT, not my files).** The old English value is still the key in PDF-PIXELS' maps and tests, so these break until PDF-PIXELS #6 lands with the constant:
- `pdf-worker/src/pagepixels.mjs:119` and `pdf-worker/src/picturepixels.mjs:60` map `"an image past the memory bound"` → `IMAGE_TOO_LARGE`. With the new key, `featureReasons` falls back to `UNSUPPORTED_FILTER`: the memory refusal still refuses, but its reason changes. No picture is produced in either case.
- `pdf-worker/test/pagepixels.test.mjs:657` and `pdf-worker/test/jpx.test.mjs:183,188` assert the English literal and now fail (`pagepixels.test.mjs` exit 1, `test/jpx.test.mjs` exit 1).
If you would rather keep the English value and accept the words-check failure for the constant, say so and I will revert the value; the rest of the change stands.

**Checks.**
- Codec tests: ccitt 7/7, dct 16/16, invariants 12/12, jbig2 6/6, jpx 8/8, mq 6/6, png 10/10.
- pdf-worker: structure, imagecrop, jbig2 pass; pagepixels and jpx fail as above.
- format 0 failures; architecture 0 failures; coverage 11 of 11 live ids.
- ownership (tranche/T51 to job/T51/image-codecs): 5 files, 0 failures.
- words: 0 `image-codecs` findings.
- `node bio-plane/src/setup-words/build.mjs --check` exits 1: `rows.mjs` is stale for `image-codecs.jpxdecode.marker_0x_m_where_sot` (the generated row list). It is generated; I have not regenerated it, as BOB does that at layer close.

Size (session_01YPCgAZ8Ga6MXdTiGufjUD7): test runs 36, module lines 3423.

## J4 · QUESTION

QUESTION (best reading given; I carry on with it). Fix round 9, image-codecs R4, R10, R12, R13.

My ceilings and the rows I read (no numeric literal of mine, R13):
- `boundOf("image","pixels")` 120,000,000, `"edge"` 65,535, `"row_stride"` 8 MiB, `"chunks"` 65,536: all four exist.
- R4/R10 keep a working-set ("memory") bound, today `61_300_000` in jpxdecode.mjs and pngdecode.mjs (the measured OCR-isolate figure). No `image` row holds it. I read `boundOf("ocr","frame_bytes")` (61,300,000, the same figure and source) so the behaviour is unchanged and no member limit moves. If you want a row of its own, it is `image.working_set` {standard 61300000, alpha 61300000, protective 61300000} for runtime-limits to add; I change one import line.
- R4 says the JPX precinct/tile objects are counted against "the table's retained-objects bound": I read `boundOf("office","retained_objects")` (250,000 proposed, BOB confirming for JPX). I count precinct objects plus code-block objects per band, from the header, closed form. If you want an `image.retained_objects` row instead, same one-line change.

Needed from you: nothing if both readings stand; say so only if you want the two rows added and the import re-pointed.
Also noted for later: I keep exporting `MEMORY_FEATURE` (an identifier, no longer a key of JPX_REFUSES/PNG_REFUSES) so pdf-pixels' imports in pagepixels.mjs and picturepixels.mjs still load; the memory refusal is now code `IMAGE_TOO_LARGE`, which pdf-pixels (job 14) must map (today it falls to DECODE_FAILED).
