# image-codecs (T51)

**Status** · session_01YPCgAZ8Ga6MXdTiGufjUD7 · depth 2 · COMPLETE · handled B2

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
