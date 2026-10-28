# retrieval (T53)

**Status** · session_018BhcecFW8tvVxtjMi8XpWv · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# retrieval · T53 · report

**Entries applied**
- T53-169 (K5565, English in tests): the module's test files now read the word key the product reads, with its placeholders' values, in place of a copied sentence. Converted: 30 candidate sites (the words check's testenglish count, from `checks/words.mjs --baseline`) down to 10. Files: meaning, passage-arm, observation-log, legs, search, frontier (one site), contentaxis, meaningread. The shared coverage sentence is built once in `test/m/retrieval/fixture.mjs` (`coverageOf`, `leadOf`) from the scope's tally by `retrieval.text.capture_counted_scope` and `retrieval.lead`. A negative check on a fragment was replaced by a comparison with the not-built note; a redundant negative check on a tally fragment was removed (the exact coverage sentence already fixes it). Commit 0f8bee57.
- Test: all 222 tests of `test/m/retrieval/` pass (`node --test --test-force-exit test/m/retrieval/*.test.mjs`). Checks: words 0 failures, testenglish 0 against the current baseline; coverage 88 of 88 live ids named; architecture 0 failures.

**Not done, and why**
- 10 candidate sites are sentences the product composes in its own source with no word key (B sites): they cannot be converted until the module gives a key, and the key's wording is the design stream's, not mine to write.
  - `content-arm.test.mjs:95` and `passage-limit.test.mjs:79`: "nobody has yet said whether a finding rests on what was found here…" (`src/retrieval/levels.mjs`, localize `retrieval.levels.finding_rests_plain`).
  - `contentaxis.test.mjs:82`: "no indexing unit arm" (`src/observation-log/index.mjs:357` localize `observation-log.index.a_container_has_no_arm`, the tail of `observation-log.indexed_none`).
  - `frontier.test.mjs` (3): "NOT an empty frontier" in the unknown-level note (`src/retrieval/frontier.mjs:91`, localize `retrieval.frontier.there_is_no_level_level`); "every record it names" (`frontier.mjs:168`); "reads UNDETERMINED where the record holds none" (`frontier.mjs:314`).
  - `observation-log.test.mjs` (2): "NOT an empty frontier" (`frontier.mjs:91`, as above); the watermark-band "whole seconds" wording (another module's word key, not this module's).
  - `search.test.mjs:147-148`: "cited or marked citable" (`src/retrieval/index.mjs`, localize `retrieval.index.content_searches_citations` and `retrieval.index.content_reaches_layer`; the test copies the English).
  - `selections.test.mjs:122`: "which rows moved is not recoverable" (no word key; in product source).
- **For BOB:** `build/tests-english-baseline.json` still lists the 11 retrieval test files at their old counts. Lowering the lines is BOB's act (ownership refuses this job editing the shared file, as in file-scanner). Lower them to the counts the check now reports, or delete the lines for files with no remaining candidates: `content-arm` 1, `contentaxis` 1, `frontier` 3, `meaning` 0 (delete), `meaningread` 0 (delete), `observation-log` 2, `passage-arm` 0 (delete), `passage-limit` 1, `search` 1, `selections` 1, `legs` 0 (delete). `retrieval/meaning.test.mjs` and `retrieval/passage-arm.test.mjs` are already at 0 (delete the lines).
- **Model:** the plan's row for retrieval says `sonnet-5-5` because some B sites need a source key. This job ran on haiku-5-5. The conversions here were test-only; the B sites above are the part that needs the sonnet-level source change.

**Met** · none

Tests: 222/222. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecFW8tvVxtjMi8XpWv): test runs 1, module lines 3187

## Completion (2026-10-28)

# retrieval · T53 · report (CHANGE from BOB #332: T53-169 finished)

**Entries applied**
- T53-169 (K5565, English in tests), finished per BOB's CHANGE: every one of the module's 10 B sites is now wrapped in `localize(id, en)` at its use, keeping today's English, and the tests read the sentence by its key (`WORD(id)`). Commit 925971ea.
  - Wrapped in source (were unwrapped): the three frontier note texts `retrieval.frontier.note_document_never_looked`, `retrieval.frontier.note_content_extraction`, `retrieval.frontier.note_meaning_level` (frontier.mjs); the selection drift sentence `retrieval.index.drift_criterion_moved` (index.mjs). Each was a concatenation of literals; it is now one literal, joined exactly, so the words check reads a plain literal.
  - Already localized in source, now read by key in the tests: `retrieval.levels.finding_rests_plain` (content-arm, passage-limit), `retrieval.frontier.there_is_no_level_level` (frontier, observation-log), `retrieval.index.content_searches_citations` and `retrieval.index.content_reaches_layer` (search, words), `observation-log.vocabulary.content_watermark_band` (observation-log), `observation-log.indexed_none` with `observation-log.index.a_container_has_no_arm` (contentaxis).
  - Negative regex checks that repeated a sentence's fragment and that the exact comparison already covers were removed (observation-log, meaning).
- Tests: 222/222 in `test/m/retrieval/`. Checks: words 0 failures, testenglish 0; `--baseline` now reports no files for this module; coverage 88 of 88 live ids named; architecture 0 failures.

**Left for BOB**
- `build/tests-english-baseline.json`: the module's lines are now all zero (the baseline check reports no retrieval files). Deleting the module's lines is BOB's act (ownership refuses the job editing the shared file).
- Observed, not fixed: the content-axis sentence for a workbook captured before D-672 is stored with a reason that lacks the parenthetical that `observation-log.index.a_container_has_no_arm` carries. The contentaxis test therefore asserts the key's main clause (its text before " (") and the indexed-none prefix, not the whole key value. Whether the stored reason should carry the whole key is a question for BOB and observation-log's owner.
- The word rows (`bio-plane/src/setup-words/rows.mjs`, `words-unreviewed.json`) were not committed; `proc job complete` regenerates them.
- The model: the plan's row says sonnet for this module; this job ran on haiku-5-5.

**Met** · none

Tests: 222/222. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecFW8tvVxtjMi8XpWv): test runs 2, module lines 3148
