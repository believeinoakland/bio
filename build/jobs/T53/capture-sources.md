# capture-sources (T53)

**Status** · session_018Bhcef6NZJ89Tvrn2YSfS2 · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# T53 · capture-sources · report

**Entries applied:** T53-96 (K5565, English in tests). Commits a048975c (conversion), b40c8529 (merge of tranche/T53), and the revert of the shared baseline.

**What changed**
- Test files under bio-plane/test/m/capture-sources/ (browserrender, cdx, credentials, dec149, drive, memento, render) now assert word keys, not English. Every `localize("id", "en", vars)` in the tests is `word("id", vars)`, and every regex over a sentence compares the sentence from its key.
- Sentences that existed only inline in the module source got their key with their text unchanged: browserrender (thrown errors for the binding and the would-not-hold messages, phase bound, no serialised document), drive (the convert-step measured_by constant, now a single localize literal), memento (the entry-does-not-begin parse message). A key the words file lacked was not invented; each key is a localize(id, en, vars) in source, extracted by setup-words build.
- Regenerated bio-plane/src/setup-words/rows.mjs and words-unreviewed.json by build.mjs (one new row, plus the count line). build.mjs --check passes.
- build/tests-english-baseline.json: NOT changed. The ownership check refuses it outside the module paths. The module now holds fewer sites than the ratchet records (its one remaining line, "binding exploded", is test input), so the ratchet passes. BOB to lower the capture-sources lines when placing the baseline.

**Judgement calls**
- drive: the no-signals case now passes `signals: []` with confidence "certain", so the key's full sentence can be compared. The no-signals path is still exercised.
- memento parse message: the test takes the character index from the product's own output and checks the sentence structure and the entry number.
- Kept as test input (C sites, not product English): "binding exploded" (browserrender, the fake binding's thrown text; the one remaining baseline line), "could not be reached: connection refused" (render), and the CDP and DevTools echoes in browserrender and chromium-render. These are not product sentences.

**Not done:** none of the entry's sites are left unconverted except the C inputs above.

**Found in other modules:** words check reports 2 testcopy failures in screens-inquiry (fr28-document.test.mjs:438, fr3-document.test.mjs:184, "Authored through op=testify."), inherited from the tranche, not this module. The committed baseline already disagreed with the tree for ai-accounts (its lines were absent in the tree but still recorded). Not changed by this job; BOB may want the ai-accounts job to regenerate it.

**Checks:** module suite `node --import ./test/platform-sqlite.mjs --test test/m/capture-sources/*.test.mjs` 130/130 pass. words check 0 failures. setup-words build --check passes.

**Met** · none

Tests: 130/130. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcef6NZJ89Tvrn2YSfS2): test runs 1, module lines 2914
