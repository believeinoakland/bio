# setup-words (T51)

**Status** · session_0159yMToiZVmPM49sS8nuxny · depth 2 · WORKING · handled B3

## J1 · COMPLETE

T51-156 setup-words: done, committed on `job/T51/setup-words`.

**Entries applied.** R14 `t(id, en, vars)` in `index.mjs` (the same `Map` as `word`; shared placeholder fill; `BAD_WORD_ID` for a malformed id; `BAD_WORD_EN` when the id has no row and `en` is not a string, a code I added for that case and tested). R15 the extraction in `build.mjs`: vendored acorn 8.18.0 (`vendor/`, with `LICENSE` and `VENDORED.md`), reads tracked JS files under a module's `paths`, never tests, `dist`, `vendor`/`vendored`, fixtures, generated files (the manifest's list by exact path), `node_modules`; scope-aware, so a `t` a file declares itself (12 files do, as a local function or parameter) is not the call; a `t` imported or unbound is. Failures name both places: two `en` for one id, a non-literal id or `en`, a malformed id. Rows gain the sixth field (origin). R16 `words-unreviewed.json` (empty list today). R17 `--pseudo [--out]` (default `rows.pseudo.mjs`). R18 a formatted argument (`{name, …}`) in any row fails the generator naming the id. R13 restated: stated in the requirements; checked here by `t` and `word` reading one list. R4 test updated for the new export.

**Real tree.** No `t` call exists: `rows.mjs` keeps its 14,522 design rows, each now with origin `"design"`; `WORDS_COMMIT` unchanged (`90a05d9fbf`). `--check` covers `rows.mjs` and `words-unreviewed.json`. The generator takes about 7 s over the whole tree.

**Tests.** `node --test bio-plane/test/m/setup-words/`: 19 pass, 0 fail (word-list.test.mjs adjusted to six fields; new extraction.test.mjs on fixture git trees names R13–R18 with their controls). Reader modules rerun after regeneration: extraction 184/184, screens-wizards 52/52, translations 30/30, case-carriage 88/88; screens-daily 138/140 and journey-check 18/76 — the same 2 and 58 failures on the branch before my change (journey-check: `playwright-core` not installed in this container; screens-daily `browse.test.mjs` R44). Not mine.
**Checks.** `checks/run.mjs`: format 0 failures; architecture 0 failures; coverage for setup-words 12 of 12 ids named, 0 failures (the other modules' coverage failures are theirs); words check 13,908 failures, all the conversion's targets (inline/testcopy/handlist), none in setup-words. `checks/ownership.mjs setup-words tranche/T51 job/T51/setup-words`: 10 files, 0 failures.

**For BOB.**
1. Manifest row for `rows.mjs`: the regenerate command is unchanged (`node bio-plane/src/setup-words/build.mjs`, `--check`); it now also writes/checks `bio-plane/src/setup-words/words-unreviewed.json`; inputs are `words.json` plus every `t(id, en)` call in tracked product source (module `paths`, not tests). The extraction depends on `git ls-files`, so a new file must be tracked (`git add`) before a regenerate sees it. Not run through `bundles.mjs`; the generator is never bundled.
2. `rows.pseudo.mjs` must never be committed. `.gitignore` is not mine; please add `bio-plane/src/setup-words/rows.pseudo.mjs` (or have it ignored).
3. A bare `t` call that the file does not declare is treated as the marker. Your `checks/words.mjs` `marker` arm should apply the same shadowing rule, or the 12 files with a local `t` will be flagged.
4. Keys of `words.json` outside R14's id shape exist (e.g. `label.timezones.America/Los_Angeles`): `word` reads them, `t` cannot.
5. Deferred / flaws in other modules: none found. journey-check's 58 failures are environmental (`playwright-core`).

Size (session_01YQJWyJVbKFAY8sdhq1JwY5): test runs 5, module lines 346

## J2 · COMPLETE

B2 (K3943) applied: `tranche/T51` merged first, then `t` renamed `localize` in `index.mjs` (export, behaviour unchanged, no alias), `build.mjs` (the extraction reads `localize(id, en)`, scope rule unchanged, every message says `localize`) and both test files. R14 and R15 are met; R13 and R18 restated by the rename hold.

Tests: `node --test bio-plane/test/m/setup-words/`: 19 pass, 0 fail. `build.mjs --check`: matches (rows.mjs regenerated: only its header wording changed; still 0 code rows). Process checks (civicos-process ebcc1a3): format 0 failures; architecture 0 failures; coverage: setup-words has no failure (12 of 12 ids named); words: marker 0, none in setup-words; ownership: 6 files, 0 failures.

Size (session_01YQJWyJVbKFAY8sdhq1JwY5): test runs 8, module lines 346

## J3 · COMPLETE

B3 (K3962, K3965) applied after merging `tranche/T51` and civicos-process ea6cd83.

**Test copies.** The two flagged strings were the path of `words.json`; both tests now build it from path segments, so no string literal equals a product `localize` sentence. No regular-expression copy of a code sentence exists in my tests.

**A flaw of mine found on the converted tree, fixed.** R18 as I built it refused any `{name, …}`; the tree now holds `jurisdictions.index.amount_is_amount_and_units` ("an amount is {amount, units}, …"), a shape written in a sentence, not an ICU argument, and the generator failed on it. It now refuses only an ICU argument type after the name (`plural`, `select`, `selectordinal`, `number`, `date`, `time`, `spellout`, `ordinal`, `duration`); tests cover each refusal and that the shape is text. BOB: R18's wording (`{name, …}`) is broader than what I built; please re-word it to the ICU argument types if you agree.

**Rows regenerated** over the converted tree: 15,344 design rows, 3,840 code rows; `words-unreviewed.json` lists the 3,840. Two of my assertions held code rows to the design file's spelling rules (no brace form beyond `{name}`; no "labelled"); they now apply to the design rows only, since a code row is the design's to review.

**For BOB, in other modules:** code ids `odf-reader.odf.content_xml_with_text_list` and `roster-reader.org-chart.labelled_line_s_name_a` have an `en` spelled "labelled" (DEC-221 spells "labeled"); and `jurisdictions.index.a_template_is_fields_never_bare` holds a brace form beyond `{name}`. Both are the design's review or those modules' jobs, not mine.

**Run.** `node --test bio-plane/test/m/setup-words/`: 19 pass, 0 fail. `build.mjs --check`: matches. Checks: format 0, architecture 0, coverage no setup-words failure, words: none in setup-words (marker 0), ownership 6 files 0 failures.

Size (session_01YQJWyJVbKFAY8sdhq1JwY5): test runs 12, module lines 348
