# inquiry-grammar (T35)

**Status** · session_0149evd1NyLT3FnFWo5BhDQC · depth 2 · WORKING · handled B1

## Completion

**Entries applied (T35-40)**
- **R15 (N675; K1799):** `OCCURRENCE_KEY_RE` is imported from `duties/vocab.mjs`, which imports nothing of the record, and re-exported as the same value. The held copy is gone. Tests (`t34.test.mjs`): the export is `===` duties' `vocab.mjs` and `index.mjs` exports; loading this module in a fresh process resolves only `duties/vocab.mjs` of duties, and no store or record-core file, with a negative control (duties' `index.mjs` does load record code). Mutation check: pointing the import back at `duties/index.mjs` turns that test red. The case-checker build with this change: 69 inputs, 607,482 bytes (0.6 MB).
- **K1972 (red 27):** `golden.json` re-pinned: C-2.8 `CONTENT_EXTENT_NO_PRODUCER`'s sentence now reads "Nothing produces a dom address yet" (content's DEC-149 wording, T35-26), 8 occurrences. No other difference: every golden comparison passes byte for byte with only that replacement. `corpus.mjs`' header records the re-pin.

**Deferred:** none.

**Found in other modules (generated artifacts my change stales, §14; not written by me)**
1. **case-checker** `bio-plane/src/case-checker/program.mjs`: `program.test.mjs` R13 red (34/1) until regenerated at the layer close (`node bio-plane/src/case-checker/build-program.mjs`). A probe run of that script overwrote it once by mistake; I restored the committed file unchanged.
2. **plane bundle** `bio-plane/dist/bio-plane.bundled.mjs` (its manifest lists `inquiry-grammar/grammar.mjs`): stale until the close regenerates it.

**Tests and checks**
- inquiry-grammar: 60 pass, 0 fail.
- Users of the module: accepted-work 23/0, inquiry 175/0, basis-versions 131/0 (R43 green: red 27 cleared), strength 143/0, skills 67/0, reevaluation 140/0, ratification 212/0, case-import 88/0, case-disclosures 59/0, case-authoring 145/0, action-grammar 29/0; leg-earning 46/1 (red 28, `earnedBasis` cell leg), control-plane 179/3 (reds 19, 26, 29), plane 110/6 (red 22, `ask.test.mjs` ×6), case-checker 34/1 (item 1 above).
- format: 130 modules, 129 requirements files; 0 failures.
- architecture: 11 product files, 40 relative imports; 0 failures.
- coverage: 17 of 17 live requirement ids named by a test; 0 failures.
- ownership: 5 files changed by inquiry-grammar between tranche/T35 and HEAD; 0 failures.

Size (session_0149evd1NyLT3FnFWo5BhDQC): test runs 9, module lines 1840
