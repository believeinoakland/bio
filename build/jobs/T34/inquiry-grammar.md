# inquiry-grammar (T34)

**Status** · session_01FaokvJZPmRci5p59ej5t9j · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Two points, both blocking only the merge; I carry on with the rest of the job on my best reading.

1. **`modules.json` uses.** inquiry-grammar's `uses` lacks `standards`, `duties` and `connection-grammar`, which my requirements' Uses name for R13, R15 and R17 (T34's fold). The architecture check fails on my three new imports until they are added. `modules.json` is yours: please add the three.

2. **Where R15 imports `OCCURRENCE_KEY_RE` from.** `duties` states it only in `duties/index.mjs`. That file imports record-core, membership, entities, standards, events, lines, money, provenance and content. The standalone case checker bundles `inquiry-grammar/grammar.mjs` (`case-checker/program.mjs`), so importing from there takes the checker from 65 bundled inputs (0.6 MB) to 180 (4.4 MB), store code included. I measured this with esbuild over `case-checker/main.mjs`. The same weight lands on every pure caller of this grammar. The other two imports are already light: `isPortionPath` and `PORTION_PATH_MAX` come from `standards/instrument.mjs` (no imports), and `derivedId` from `connection-grammar/shape.mjs` (record-grammar only).
   **My best reading:** `duties` moves `OCCURRENCE_KEY_RE` into a file that imports nothing of the record. Its `vocab.mjs` fits, and `index.mjs` already re-exports it with `export *`, so duties' public face does not change. That is a CHANGE to duties. Once it lands I re-point my one import line to `../duties/vocab.mjs`. Until then my branch imports from `duties/index.mjs`: it meets R15 and all tests pass, but nobody should regenerate `program.mjs` from it. If you would rather accept the heavier bundle, say so and I leave the import as it is.

## J2 · COMPLETE

**Completion (T34-28).** Branch `job/T34/inquiry-grammar` @ the commit carrying this entry; `tranche/T34` merged in (for K1799).

**Entries applied**
- **R17 (N582):** the derived-connection leg kind. The new names are `DERIVED_CONNECTION_ID_RE`, `DERIVATION_FIELDS` and `derivedConnectionLegFindings`.
  - A leg whose target is 64 lowercase hex is admitted. It is no longer refused as an unknown target.
  - Each of the following is one C-2.8 `DERIVED_LEG_MALFORMED` departure naming its field: a missing or empty `derivation_*` field; a target not equal to `connection-grammar.derivedId` of the five (asked only when all five are stated); a grade field; a content id, extent or extent capture.
  - `checkInquiryBasis` runs it in place of the target arm, as for R14 and R15: not a reference, no C-6.3, the grade arms silent, role, note and grounds as any leg, lead and theme first.
- **R16:** the row `DERIVED_LEG_MALFORMED` (C-2.8, `derivedLegRefusal > is-derived-leg-form`), with my draft translation. It awaits stamping (row-census red, Rules (5) 4).
- **R13 (N583):** `target_portion` is judged by `standards.isPortionPath`, and its bound sentence by `PORTION_PATH_MAX`, both imported from `standards/instrument.mjs`. The local 200-character copy is gone. Behaviour change: a portion is now measured in code points, as standards measures it, not in UTF-16 units.
- **R15 (K1799):** `OCCURRENCE_KEY_RE` is held here, exported and frozen. A test asserts it equal to duties' export (source and flags), and checks agreement over a set of keys. Nothing here imports `duties/index.mjs`. The case-checker bundle went from 65 to 67 inputs (`instrument.mjs`, `shape.mjs`), 0.60 MB. N675 re-points it in T35.

**Deferred:** none.

**Found in other modules (REPORT-worthy, against their requirements)**
1. **inquiry** `test/m/inquiry/grammar.test.mjs:176` (its R38 R4) pins `INQUIRY_GRAMMAR_CHECKS`' ids. It goes red on the new `DERIVED_LEG_MALFORMED` row, my R16. INQUIRY's job adds the row to its expectation. It was 158/0 before my change; it is 157/1 after.
2. **case-checker** generated artifact `bio-plane/src/case-checker/program.mjs` is stale from my grammar change: `program.test.mjs:19`, R13, red until regenerated (`node bio-plane/src/case-checker/build-program.mjs`) at the layer close (mechanics §14). I did not write it.

**Tests and checks**
- inquiry-grammar: 59 pass, 0 fail (`node --test bio-plane/test/m/inquiry-grammar/`).
- Users of the module, run on the final code:
  - green: accepted-work 23/0, leg-earning 47/0, basis-versions 131/0, strength 138/0, skills 67/0, reevaluation 135/0, action-grammar 28/0, case-import 84/0, case-disclosures 56/0, case-authoring 137/0, ratification 204/0, hypotheses 14/0;
  - red: inquiry 157/1 (item 1 above), case-checker 33/1 (item 2 above).
- format: 126 modules, 125 requirements files; 0 failures.
- architecture: 11 product files, 38 relative imports; 0 failures.
- coverage: 17 of 17 live requirement ids named by a test; 0 failures.
- ownership: 6 files changed by inquiry-grammar between tranche/T34 and HEAD; 0 failures.

Size (session_01FaokvJZPmRci5p59ej5t9j): test runs 12, module lines 1840
