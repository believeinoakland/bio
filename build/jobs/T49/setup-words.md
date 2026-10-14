# setup-words (T49)

**Status** · session_01Jgzr6YuhktL8nhsH7iR1fe · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

**Entries applied (T49-15; R10–R13).** Reading set as BOB's START: requirements whole, entry, layer contract, my code (generated data excluded) and the old word-list test whole; the other tests were run, not read.
- Measured: `words.json` holds 5,810 words (818 protected), keys distinct, fields `key, en, protected, source, note`; one placeholder form only, `{name}` (1,393 braces pairs in 886 words, all letters/digits/_; no other brace form). Importers of `WORD_ROWS`/`WORDS_COMMIT`: `screens-wizards/index.mjs`:11 and `setup.mjs`:44 (same names, same row form; they keep working); `interface-shell` reads words through its own `words.mjs`.
- R10: `build.mjs` (generator, never imported by `index.mjs`) writes `rows.mjs` (GENERATED header, SHA-256 `8a54848a9e9489d4a82a9fcc24d0473e9b49d9d1b72a8007da5467e2c5fba637`; `WORDS_COMMIT` = `8a54848a9e`); `--check` exits 1 naming the first differing word. Options `--words`/`--out` for fixtures.
- R11 `word(key, vars)`; R12 `hasWord(key)` over a `Map` built on first call; `UNKNOWN_WORD` and `WORD_VAR_MISSING` are `Error`s with `.code` and the code at the start of the message. A `vars` value of `undefined`/`null` or an inherited property counts as absent (never an empty string or "null").
- R13: stated by this module; its test checks the rule's interface side (every key answers, unknown keys never fall back).
- R2, R5–R8 (pinned commits retired by R10) are still live ids in the requirements file; one test names them and checks the pinned commits are gone. BOB may mark them retired in the requirements text.
- R4 test now allows exactly one import (`./rows.mjs`).

**Plan rule 6 checks.** N1068: no row's `en` holds "labelled" (control in tests). `admin` grep (N1072): the module's code has no founder id. N1073: the new test hand-lists no module's words (the old `word-list.test.mjs` hand lists R6_GONE/RETIRED are gone). D29 not applicable.

**Found in other modules (not mine).** With the file's 5,810 words in `WORD_ROWS` these consumer tests are red that were green (or went more red) at my START: screens-entry `common.test.mjs` (1→3 fails: R9 words/contract), screens-daily `contract.test.mjs` (0→1: R7/R22/R23, own rows vs WORD_ROWS), screens-action `contract.test.mjs` (1→3), screens-inquiry `common.test.mjs` (1→2: R5 own words shadowing WORD_ROWS). screens-settings `contract` was already red. Each module's own T49 job re-points to `word`/`hasWord` (R13). Also stale: `bio-plane/dist/bio-plane.bundled.mjs` (plane bundle, `fleetbundles.test.mjs` fails; BOB regenerates at layer close, rule 5 (5)); `rows.mjs` is a generated artifact in the manifest already (regenerate before the bundles). Screens-entry's `signin.founderhint`: the file no longer holds that key (`hasWord("signin.founderhint")` is false); its reads (`front.mjs`:78, `index.mjs`:31) are cleared by T49-21 (rule 5 (8)).

**Deferred.** None.

**Tests and checks.**
- `node --test bio-plane/test/m/setup-words/`: 10 pass, 0 fail.
- `instance-setup/interface-words`, `translations`, `screens-wizards/words`, `screens-intake/common`: pass.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio setup-words`: 2 product files (now 3 with rows), 0 failures; `checks/run.mjs`: architecture 0 failures over 3351 files. `checks/coverage.mjs bio setup-words`: 12 of 12 live ids named, 0 failures (other modules' coverage reds are theirs). `checks/ownership.mjs bio setup-words tranche/T49`: 0 failures.

Size (session_01Jgzr6YuhktL8nhsH7iR1fe): test runs 6, module lines 125
