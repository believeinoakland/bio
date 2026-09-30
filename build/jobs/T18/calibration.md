# calibration (T18)

**Status** · session_01M8HwMoNMeH4xHrpoNGwoVH · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied** (layer 4, B1): convert `calibration` (calibration's share, `build/jobs/T17/legacy-tests.md` row 55). Tests only; no code moved, so no catalogue, store or `src/index.mjs` edit and no row `awaiting stamp` (the store keeps only the wiring, `calibrationOf`/`calibrationOps`; C-42 left the catalogue at T5). Old suite not deleted (K619).
- Carried, as requirement-named tests at the module's interface (`bio-plane/test/m/calibration/`): **R6 scores read back** (probe inputs and scores as recorded, JSON or text; `store.test.mjs`); **unknown fields accepted (R1)** (pure, `rules.test.mjs`, and at the record, `store.test.mjs` "R4 R1": extra body fields recorded, id and supersession never the body's); **cadence wording** (R3 R6: `cadenceSentence` composed from the constant, default and given cadences, and carried in `nextProbeDue`'s why); **where pattern** (R14: every C-42 row's `where` names `<file> <service> > is-calibration-<region>`). Also carried from the suite's through-op and self-termination arms: `op=calibrations` reads engine and limit from the request (R6); an instance with nothing registered answers no subject, no calibration, `why` "holds no alarm at all", the cadence, and `calibrationWake` null (R6 R9). The rest of the suite's calibration arms were already carried by the module tests (C-42 refusals read off the code path, R2 asymmetry and totality, R3 signals, R4 regrade refusal both directions, R7, R8).
- Not calibration's share: extraction R38/R39 (`op=calibrationdrift`, `current_calibration`), R40/R44 (`derivation_cap` unchanged, DEC-4), the STRUCTURAL source-text arms over `extraction/pipeline.mjs` (extraction's convert this layer); "real onAlarm runs the consumer" (the Store's alarm, scheduler's). Not carried by P7: the three `SCHEDULER.md` text arms (document text, not behaviour).

**Deferred:** none.

**Found in other modules:** none. (Noted, not a flaw: `calibration.mjs` reads `BASIS_GRADES` from the catalogue's re-export as its Uses say; a re-point to `record-grammar` needs the `uses` edge, as jurisdictions had, if BOB wants it.)

**Tests and checks** (on `job/T18/calibration` after merging `tranche/T18` @ d8be75c2d5):
- `node --test bio-plane/test/m/calibration/`: tests 62, pass 62, fail 0. No provided service changed, so no user module's tests re-run; no layer tests in the manifest.
- `format`: 82 modules, 77 requirements files; 0 failures. `architecture calibration`: 8 product files, 21 relative imports; 0 failures. `coverage calibration`: 19 of 19 live requirement ids named by a test; 0 failures. `ownership calibration tranche/T18`: 3 files; legacy-checks 0/0, legacy-store 0/0; 0 failures.

Size (session_01M8HwMoNMeH4xHrpoNGwoVH): test runs 1, module lines 1095
