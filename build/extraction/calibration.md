<!-- The calibration survey, split from the extraction map for BOB #42 on 2026-09-26 on tranche/T3 (N41, K73 (7)); superseded where it disagrees with build/requirements/calibration.md. -->
# calibration — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `91933d75` by a drafting worker for BOB #42 (P18), split from `build/extraction/extraction.md` (N41, K73 (7)). The line numbers are from `grep -n`/`awk` over `bio-plane/src/store.mjs` (53,685 lines), `schema.mjs` (4,180) and `bio-plane/checks/bio-checks.mjs` (16,591); the calibration job confirms them. A range runs from the comment block above a method to its closing brace. The contract is `build/requirements/calibration.md` (R1–R17). K61 applies. **`from`: `["legacy-checks", "legacy-store"]`**: `legacy-store` for the store region and the three tables, `legacy-checks` for C-42 on K64's precedent (§5). Nothing comes from `legacy-index`: its one calibration read (`tier3Extend`'s `op=calibrations` fetch) is extraction's, and the OPS rows are `control-plane`'s.

## 1. What moves to `calibration`

**Already on its paths**: `calibration.mjs` (429), less `driftObligations` and its header (369–429), which go to extraction (§2). Its imports are `CALIBRATION_CHECKS` and `BASIS_GRADES` from `bio-checks.mjs`, nothing else.

**`store.mjs`** (legacy-store)

| what | lines | R |
| --- | --- | --- |
| `calibrationSubjects`, `#calibrationCurrent`, `#mintCalibrationId`, `calibrationRecord`, `#calCheckRow`, `#calRowToCal` | 24646–24829 | R4, R5, R10 |
| `calibrations`, `#calNextProbe`, `calibrationSignalRecord`, `calibrationSubjectRegister`, `#calibrationDue`, `#calibrationWake`, `#calibrationTick` | 24938–25154 | R6–R9 |
| new: `liveCalibration` (from `#calibrationCurrent` plus the version match `tier3Extend` does today), `worseSupersessions` (the first half of `#calDriftFor`), `onCalibration` and its listener run inside `calibrationRecord` | | R10–R12 |
| the `CAL_CANNOT_REGRADE` import note | 465–470 | R4 |
| dispatch arms `calibrations`, `calibrate`, `calibrationsubject`, `calibrationsignal` | 52436–52464, in part | |

**Tables it owns** (`schema.mjs`, each with its indexes and the comment above): `calibrations` (3101–3138), `calibration_subjects` (3151–3158), `calibration_signals` (3172–3182). About 80 lines with their comments. Purge: no module declares them today, so they are never touched; calibration declares them exempt (R16).

**Checks** (`bio-checks.mjs`): `CALIBRATION_CHECKS` (C-42.1–C-42.7, 11250–11327, `where` naming `calibration.mjs` and `store.mjs calibrationRecord`). D-668 adds `CAL_UNATTRIBUTED`, `CAL_SUBJECT_UNNAMED` and `CAL_SUBJECT_NO_PROBE`.

**Size.** About 950 lines, about 480 without comment-only lines: `calibration.mjs` about 370 (about 130 code), `store.mjs` about 400 (about 225 code), `schema.mjs` about 80, checks 78.

## 2. What stays in extraction or goes elsewhere, and why

| what | where | owner |
| --- | --- | --- |
| `driftObligations` | calibration.mjs 369–429 | **`extraction`** (its R38). It reads transcriptions bound to calibrations; it calls `drifted`, which stays here |
| `#calDriftFor`, `calibrationDrift`, the `calibrationdrift` arm | store.mjs 24830–24937 | **`extraction`** (its R39–R40). They read `reading_text_source`, extraction's table; they reach the supersessions through R11 |
| the `reading_text_source.calibrations` column and its migration (store.mjs 1239–1247) | store.mjs, schema.mjs | **`extraction`**: the chain's calibration ids are a reading's facts |
| `tier3Extend`'s `op=calibrations` fetch | index.mjs 5210–5222 | **`extraction`**, which reads R10 instead |
| the `calibration-reprobe` scheduler consumer | store.mjs 3818–3872, 3975 | `scheduler`, which calls R9 |
| the OPS rows and session sets for the five ops, and the `measured_by` stamp | index.mjs | `control-plane` (K3) |

## 3. Callers to rewire, and conflicts

- `calibrationRecord`'s obligation echo (`this.#calDriftFor(prev.calibration_id)`) becomes R12's listener run; extraction registers the listener (its R40).
- `calibrationDrift` (extraction's) reads R11 instead of the `calibrations` table.
- `#calibrationWake` reads `Store.SCHED_GRACE_MS`, which is `scheduler`'s; R9 takes the grace from its caller.

**Uses that `modules.json` lacks:** `scheduler` → `calibration` (R9). `extraction` → `calibration` is added with this split.

## 4. Old-battery tests that anchor on the moved source

- `calibration.test.mjs` (reads `index.mjs` at 392), `calibration.control.mjs`; `derivation-bounds.test.mjs` and `meaning-bounds.test.mjs` (scan `store.mjs` for the bounds of `#mintCalibrationId`, `#calDriftFor` and `calibrations`); `airuns.test.mjs`' index sweep (reads the `calibrations_drift` predicate off `#calDriftFor`'s SQL, which moves to extraction). `civicos-ui/check-refusal-codes.mjs` reads C-42 from the catalogue.

## 5. Undetermined (stated, not guessed)

- **`from` including `legacy-checks`.** Moving C-42 now follows K64; leaving it for a `legacy-checks` entry follows N36. The refusal-code scripts read the catalogue either way.
- **Whether `#rows`/`#one` are copied** as membership's and record-core's jobs did (K57), or reached through `record-core`.
