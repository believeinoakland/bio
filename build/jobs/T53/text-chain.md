# text-chain (T53)

**Status** · session_018BhcefLjzJMZjCWK4WMZtR · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# text-chain · T53 R1 report

**Entries applied**
- T53-45 · A8 (DEC-464): R107 and R108 in `bio-plane/src/textchain.mjs`. `TYPED_UNCHECKED_GRADE` and `TYPED_CHECKED_GRADE` are derived from `BASIS_GRADES` (D, C today). `typedStepOf(chain, target?)` is the one predicate for a typed passage. `chainKindFor` and `typedStepOf` now share one private walk (`coveringSteps`); `chainKindFor` answers as before. `gradeCeiling` answers a typed chain D by the typist, or C by the checkers (determinant `second_member`, `by` sorted and de-duplicated). The typist's own attestation is ignored. Every other chain is answered as R56 and R57 say. Tests: `typed.test.mjs` (R107, R108, controls).
- T53-46 · K5565: the 11 A regex sites in chain, exports, tier2 and transcription tests now read the word table by key. The 2 C sites are test input or a comment: one detail check now asserts the step name and the letter, the other is a comment the census mistook for a regex. The four files are converted. `build/tests-english-baseline.json` is outside this module's paths (the ownership check refuses my edit), so BOB removes its four `bio-plane/test/m/text-chain/{chain,exports,tier2,transcription}.test.mjs` rows. With the rows held, the words check reports 0 failures; the module suite is green.

**Not done:** nothing.

**Found in other modules**
- `content` (A8-R63, its own entry): seven tests in `bio-plane/test/m/content/` pin the old typed grading (R21, R22, R24, R25, R26 transcription cases). They go red on text-chain's R107 and must be re-stated by the content job. Today `content.transcribe` mints a typed row graded "undetermined", and `transcriptionAttest` reads `gradeCeiling` as B.
- `setup-words`: two new sentences are written once with `localize` in the module (`text-chain.textchain.typed_by_typist_not_checked`, `text-chain.textchain.typed_by_typist_checked_by`). The words table and `rows.mjs` need the build step (`node bio-plane/src/setup-words/build.mjs`) at merge. I did not edit the generated artifact.
- The design stream's stale words (`refusal.TEXT_CHAIN_LETTER_ON_PERSON`, "stays not yet determined") are already listed as owed in the A8 line.

**Met** · R107, R108

Tests: 158/158. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefLjzJMZjCWK4WMZtR): test runs 1, module lines 2130
