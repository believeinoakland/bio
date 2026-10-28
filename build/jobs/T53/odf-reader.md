# odf-reader (T53)

**Status** · session_018BhcefXKEEqrV3LsP4yTXY · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# odf-reader · T53 · report (entry T53-40, K5565: English in tests)

## Entries applied
- T53-40 (K5565): odf-reader's English-in-test sites converted. Census: 1 A / 9 B / 4 C regex sites (3 files), and the words check's baseline held 10 sites in 3 files (digest 7, entries 1, envelope 2). After the change: the words check reports testenglish 0, missingkey 0, 0 failures; the baseline loses the three odf-reader files (688 to 685 files).
  - Each assertion now reads the key through `word(key, vars)` and compares the whole basis or note (exact equality), not a regex fragment.
  - The four C-class sites were not really in neither: their fragments are split by placeholders (`content.xml references {length} package member(s)`, `no intra link: {ODF_MANIFEST_PART} …`, `the sha256 of the .{flavour} …`), so each now uses the key that carries them.
  - Source: `bio-plane/src/odf.mjs` keys the two inline basis fragments that were the only B text not already keyed: `odf-reader.odf.normalised_by` and `odf-reader.odf.no_byte_rewritten`. `ODF_EVIDENTIARY_NORMALISE` is now exported so the test takes the normalisation's name from the module.
  - Words: eleven keys the suite reads are added to the word table as the module's own rows in `docs/development/ux-substrate/screens/words-mod-5.json`, read by `build_words.mjs` (words.json 19753 to 19764). `bio-plane/src/setup-words/rows.mjs` and `words-unreviewed.json` regenerated (`build.mjs --check` passes).
- Module suite: `node --test bio-plane/test/m/odf-reader/*.test.mjs`: 127 pass, 0 fail (baseline 127).
- Also run, green: setup-words word-list, translations interface-words, bundler (69 pass).

## Decisions for BOB (flagging, not done unilaterally)
1. `ODF_EVIDENTIARY_NORMALISE` is newly exported, so the R43 public-surface list in `entries.test.mjs` gains that name. This is an addition to the module's exported constants, not a removed or weakened check. Say if you want it kept private instead.
2. The eleven words-mod-5 rows carry the module's current English as written (code wording, not UX-DESIGN wording). They are marked not yet reviewed in the note; the words-unreviewed list picks them up. Member-facing review of the basis and note sentences is still open.

## Not done / out of scope
- Nothing from the entry is left undone. The no-`en` rule (K3943) is respected: the tests take keys only.

## Found in other modules
- None.

**Met** · none

Tests: 127/127. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefXKEEqrV3LsP4yTXY): test runs 1, module lines 2904
