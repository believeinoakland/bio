# inquiry-grammar (T34)

**Status** · session_01FaokvJZPmRci5p59ej5t9j · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two points, both blocking only the merge; I carry on with the rest of the job on my best reading.

1. **`modules.json` uses.** inquiry-grammar's `uses` lacks `standards`, `duties` and `connection-grammar`, which my requirements' Uses name for R13, R15 and R17 (T34's fold). The architecture check fails on my three new imports until they are added. `modules.json` is yours: please add the three.

2. **Where R15 imports `OCCURRENCE_KEY_RE` from.** `duties` states it only in `duties/index.mjs`. That file imports record-core, membership, entities, standards, events, lines, money, provenance and content. The standalone case checker bundles `inquiry-grammar/grammar.mjs` (`case-checker/program.mjs`), so importing from there takes the checker from 65 bundled inputs (0.6 MB) to 180 (4.4 MB), store code included. I measured this with esbuild over `case-checker/main.mjs`. The same weight lands on every pure caller of this grammar. The other two imports are already light: `isPortionPath` and `PORTION_PATH_MAX` come from `standards/instrument.mjs` (no imports), and `derivedId` from `connection-grammar/shape.mjs` (record-grammar only).
   **My best reading:** `duties` moves `OCCURRENCE_KEY_RE` into a file that imports nothing of the record. Its `vocab.mjs` fits, and `index.mjs` already re-exports it with `export *`, so duties' public face does not change. That is a CHANGE to duties. Once it lands I re-point my one import line to `../duties/vocab.mjs`. Until then my branch imports from `duties/index.mjs`: it meets R15 and all tests pass, but nobody should regenerate `program.mjs` from it. If you would rather accept the heavier bundle, say so and I leave the import as it is.
