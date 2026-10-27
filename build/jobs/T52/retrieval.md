# retrieval (T52)

**Status** · session_018BhcedyRp1uFhsb5WwxYio · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-27)

# retrieval · T52 · report

## Entries applied

- **T52-101** (query-language R35, K5389, test-only): done for `passage-arm.test.mjs` (R11, R15, R54 and R79 assertions) and `t51-round9.test.mjs` (R95). Both now read `MARK_OPEN` and `MARK_CLOSE` imported from `bio-plane/src/query.mjs`. Test run: 20 of 20 pass.

## Not done, and why

- **`t51-fix2.test.mjs`** (named by T52-101): not changed. Its R92 bracket assertions test the question excerpt that `#questionExcerpt` (`bio-plane/src/retrieval/index.mjs:855`) builds with literal `[ ]`, not the query-language marks. Switching the test would fail it. Question sent to BOB (reading A: leave it; reading B: move the excerpt to the marks, a src change). Waiting on BOB's answer.
- **Side effect to report:** I ran `git checkout` on `t51-fix2.test.mjs` to revert my own edit. A notice then said that file had changed on disk since I last read it, so the checkout may have discarded uncommitted content I did not make. Not recoverable from git. Reported to BOB.

## Found in other modules

None.

**Met** · none

Tests: 221/222. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Inherited reds: ["R92 control: a document hit's excerpt is unchanged, cut from its own text"]
Size (session_018BhcedyRp1uFhsb5WwxYio): test runs 1, module lines 3187

## Completion (2026-10-27)

# retrieval · T52 · report (second pass)

## Entries applied

- **T52-101** (query-language R35, K5389, test-only): applied.
  - `passage-arm.test.mjs` (R11, R15, R54, R79) and `t51-round9.test.mjs` (R95) read `MARK_OPEN` and `MARK_CLOSE` imported from `bio-plane/src/query.mjs`.
  - `t51-fix2.test.mjs`: the R92 document control (its matched term is in the document text) reads the marks. The two R92 question-excerpt assertions keep brackets, because `#questionExcerpt` (`bio-plane/src/retrieval/index.mjs:855`) writes its own brackets and never uses the marks.
  - Runs: `passage-arm` + `t51-round9` 20/20; `t51-fix2` 5/5.

## Open with BOB

- Whether `#questionExcerpt` should move to the query-language marks (a src change, outside a test-only entry). QUESTION sent; the test is left as it is until BOB answers.
- Before this pass, `t51-fix2` was reverted to HEAD with `git checkout`, and that discarded uncommitted content in the file. A notice had reported the file changed on disk since I last read it. I cannot recover that content. Reported to BOB.

## Found in other modules

None.

**Met** · none

Tests: 222/222. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedyRp1uFhsb5WwxYio): test runs 2, module lines 3187
