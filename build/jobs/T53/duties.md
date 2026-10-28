# duties (T53)

**Status** · session_018BhcefuyFQ7MjUduiZCHQX · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

## duties T53: report

**Entries applied**

- **T53-159 (N1257, K5458): R35, a duty from a rule keeps the rule's layer.**
  - `proposeFromRule` resolves `rule` with `jurisdictions.nameResolve` (R121) over the view's layers (built from the governing view's `layers` and the deadlines each layer gives; no copy of R99's order). A name two active layers give is refused `NAME_AMBIGUOUS` with `layers: [{layer, level, place}]` (new row C-133.45, one site `ruleAmbiguous`, nothing written). `layer` is an optional input that names the layer. The proposal keeps `time.layer`.
  - `declare`, `adopt` and `revise` resolve a rule-basis `time.rule` the same way in `fieldRefusal`: the layer found is stored as `time.layer` in the version's fields (no new column; the clause text is untouched); a `<layer id>:<name>` spelling is stored as the plain name plus its layer.
  - `occurrencesOf` reads the rule of the layer `time.layer` names. A duty adopted before the change has no `time.layer`: where the view now holds the name in more than one layer, its rule is read over the layers active on its `adopted_at` (`record-core.getSettingAt('jurisdiction_profiles', adopted_at)`, expanded by `combine`), by `nameResolve`; where that cannot be answered, or the name is held once, it reads as before (first match). A recorded transition and a stored version are never rewritten. A revision that leaves `time` alone does not give a legacy duty a layer.
  - Tests (`t53-layers.test.mjs`): a duty adopted from the Oakland layer's rule keeps `time.layer` and identical occurrences after a second city layer gives the same name; the bare name is `NAME_AMBIGUOUS` naming both layers (proposal and declaration, nothing written); naming the layer settles it; the control, a duty adopted before the change, derives the same occurrences (the other layer's rule is first in the view, so a first-match read fails it; checked by breaking the lookup). A view with no layers gives no layer.
- **T53-160 (K5565): English in tests.** The 17 sites of 9 test files are converted to the word key and its placeholders' values (`word(key, vars)`, or `startsWith` where a placeholder's value is another module's reason). No B site needed a new key (all keys were already in the word table). One C site removed with its reason: `t48-reasons` checked "your team's Civicsmith" in a word, which the line above it (the word equals `words.json`'s `en`) already holds. `t46-words` now pins the T46 rows without the new T53 row. The words check over `duties` with the baseline lines removed finds 0 testenglish.

**For BOB at merge**

- Remove these 9 files from `build/tests-english-baseline.json` (outside my paths): `bio-plane/test/m/duties/` `acts`, `exports`, `occurrences`, `policies`, `records`, `response`, `t46-words`, `t48-reasons`, `uses` (`.test.mjs`).
- Regenerate `bio-plane/src/setup-words/rows.mjs` and `words-unreviewed.json` (two new `localize` ids: `duties.index.rule_in_several_layers`, `duties.checks.rule_name_in_several_layers`); I did not touch the generated files.
- The new row C-133.45 `NAME_AMBIGUOUS` awaits promotion's stamp (the row census is already red for other modules' rows). `local-facts` R28 also names a bare `NAME_AMBIGUOUS`: if that job mints the same code in its own family, DEC-49 arm A (one code, one condition) needs a ruling on which row stands.
- R35 says the layer is kept in "the adopted `clause` (`time.rule`)"; I kept it in the version's `time` (`time.layer`), where `time.rule` is, as the requirement's "no new column" says. The clause column is the member's text.

**My decisions, lower-level (P17), reported done**

- The layers `nameResolve` reads are those of the governing view (`view.layers`), each with the deadlines tagged to it (`layer`, else `profile`); the team layer and `group` rules are in only if the view lists them.
- A legacy duty whose adoption-date layers cannot be read keeps the old first-match read.

**Found in other modules**

- None new.

**Met** · R35

Tests: 82/82. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefuyFQ7MjUduiZCHQX): test runs 1, module lines 2287
