# pdf-pixels (T51)

**Status** · session_01CDmjLZR4AnXcUoKjGVUyEk · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Two of the 27 plain findings are not sentences a member reads; they stay unconverted and BOB decides them (the design's `unkeyed` list, K3944):

- `pdf-worker/src/pagepixels.mjs:119` and `pdf-worker/src/picturepixels.mjs:60`: "an image past the memory bound". It is the mapping key of the JPX and PNG codecs' feature refusals (`featureReasons(…, { "an image past the memory bound": "IMAGE_TOO_LARGE" })`), matched by exact equality with the codec's declared feature names (image-codecs R25, R42). A key is a wire string, not a sentence: a word row for it would change the key the mapping matches, so it must not be read through `localize`. Not shown to a member; the member sees `IMAGE_TOO_LARGE` and its `why`.

## J2 · COMPLETE

**T51-257 applied.** The 27 `plain` findings in `build/plan/words-pass/pdf-pixels.md`:

- 25 converted to `localize("pdf-pixels.<stem>.<slug>", en[, vars])`, the slug the first five words of the sentence: `pagepixels` 13 refusal `why`s in `REFUSALS` and 4 refusal `note`s (the inline-image, JBIG2-globals, JBIG2 bit-depth and colour-space notes); `imagecrop` 8 refusal `why`s in `CROP_REFUSALS`. The import is `../../bio-plane/src/setup-words/index.mjs` (`pagepixels.mjs` already had it).
- 2 left and REPORTed (above): the codec mapping key "an image past the memory bound" at `pagepixels.mjs:119` and `picturepixels.mjs:60`.
- Tests: each new id is named by a test (`WORD_IDS` in `pagepixels.test.mjs` and `imagecrop.test.mjs`, a dotted-id and uniqueness check). A test cannot read a sentence through `localize` without holding its text, which the marker arm then flags, so the tests name the ids and the `R39` checks already compare each `why` with its key's text.
- Commit `b24c52a795` on `job/T51/pdf-pixels`, pushed.

**Deferred:** none. **Found in another module:** none.

**Read for the job:** `build/requirements/pdf-pixels.md` (whole, both parts); the T51-257 entry and rule 11 in `build/plan/current.md`; the findings file (whole); the layer 1 row of `build/layers.md`; the `setup-words` source (`index.mjs`, whole); the module's four source files. I did not read `build/plan/current.md` or `build/layers.md` whole (181 KB and 23 KB, the plan's bulk outside my entry).

**Tests run** (module suites, all 0 failed): `pagepixels.test.mjs` 383 passed; `imagecrop.test.mjs` 55 passed; `jbig2.test.mjs` 179 passed; `jpx.test.mjs` 205 passed. The two corpus probes (`pagepixels-corpus.probe.mjs`, `agenda-scan-census.probe.mjs`) were not run: they need the Oakland corpus, which is not in this container.

**Checks** (scoped to `pdf-pixels`, from `civicos-process` at 27aa50e):
- `checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio pdf-pixels`: 16 product files, 38 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio pdf-pixels`: 27 of 27 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio pdf-pixels tranche/T51 job/T51/pdf-pixels`: 5 files changed by pdf-pixels; 0 failures.
- `checks/words.mjs /home/user/bio pdf-pixels`: 2 `plain` findings remain, both the REPORTed mapping key; `marker` 0, `inline` 2 (the same two), `testcopy` 0.
- `checks/run.mjs /home/user/bio` was run as the step asks: it reports repo-wide failures in other modules (4822 total, mostly `testcopy` in `wizard-scripts`); none is in pdf-pixels beyond the two above.

So the words check is not yet clean for this module: the two REPORTed keys read as `plain` until BOB decides them. Everything else reads zero.

Size (session_01CDmjLZR4AnXcUoKjGVUyEk): test runs 11, module lines 1400

## J3 · COMPLETE

**B2 and B3 applied** (CHANGE K3971, K3972; image-codecs merged, `tranche/T51` merged into the job branch, not rebased).

- `pagepixels.mjs` and `picturepixels.mjs` now key `IMAGE_TOO_LARGE` by the codecs' exported `MEMORY_FEATURE` (`jpxdecode.mjs`, `pngdecode.mjs`), not the English literal. The REPORT on those two keys is resolved by this change.
- `jpx.test.mjs` (the two lines that named the feature) and `pagepixels.test.mjs` (the PNG mapping check) compare with `MEMORY_FEATURE`. The three testcopy findings are gone.
- Commit `298f179e25` on `job/T51/pdf-pixels`, pushed.

**Tests** (all 0 failed): `pagepixels.test.mjs` 383; `imagecrop.test.mjs` 55; `jbig2.test.mjs` 179; `jpx.test.mjs` 205. Corpus probes not run (corpus not in the container).

**Checks** (scoped to `pdf-pixels`):
- `checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio pdf-pixels`: 16 product files, 36 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio pdf-pixels`: 27 of 27 live requirement ids named by a test; 0 failures.
- `checks/words.mjs /home/user/bio pdf-pixels`: 0 failures (`plain` 0, `inline` 0, `testcopy` 0, `marker` 0). This clears the words findings this job carried.
- `checks/ownership.mjs /home/user/bio pdf-pixels tranche/T51 job/T51/pdf-pixels`: 5 files changed by pdf-pixels; 0 failures.

Size (session_01CDmjLZR4AnXcUoKjGVUyEk): test runs 15, module lines 1400
