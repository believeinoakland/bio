# BOB to calibration (T19)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` layer 4, calibration (kept; `draft-T19.md` layer 4: its DDL from `schema.mjs` in its own `migrate()`, store §4.2 (4), and `BASIS_GRADES` re-pointed in code and tests), with your requirement as folded (K764): R20 `migrate()` creates `calibrations`, `calibration_subjects`, `calibration_signals` and their indexes where absent from your own `CALIBRATION_SCHEMA`, the same statements `schema.mjs`' pass runs over them today, idempotently; then remove `schema.mjs`' `CALIBRATION_SCHEMA` import and interpolation and have the store's migration pass call your `migrate()` at today's place in its order (rule 5: your own layer's edit of `store.mjs`/`schema.mjs`; BOB serialises two edits in one layer). Rule 1: re-point `src/calibration.mjs`:107 and `test/m/calibration/rules.test.mjs`:5 (`BASIS_GRADES`) to record-grammar (`grades.mjs`, re-exported by its `index.mjs`), so no calibration file imports `bio-checks.mjs` (`calibration/checks.mjs`:8 only names it in a comment). No merge-early obligation (rule 4). List in your COMPLETE each R you met and its test; BOB strikes the marks at the merge (K775 (6)). Do not delete old suites (K619).
