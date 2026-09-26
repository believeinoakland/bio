# calibration — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18, N41, K73), split from extraction's draft; for Bob's approval (a product module, P17). Layer 4. Code today: its own file `bio-plane/src/calibration.mjs` (429 lines, less `driftObligations` and its header, 369–429, which extraction takes); and inside the legacy modules, measured at `tranche/T3` @ `91933d75`. `bio-plane/src/store.mjs`: the calibration region `calibrationSubjects` … `#calibrationTick` (24646–25154, less `#calDriftFor` and `calibrationDrift`, which extraction takes); the dispatch arms `calibrations`, `calibrate`, `calibrationsubject`, `calibrationsignal` (52436–52464, in part). `schema.mjs`: `calibrations`, `calibration_subjects`, `calibration_signals`. `bio-checks.mjs`: `CALIBRATION_CHECKS` (C-42). The map is `build/extraction/calibration.md`. Not yet met: R4 and R12 (N41), R5 (D-587, D-668), R8 (D-668), R10 and R11 (N41), R16 (K23). Old-plan rows carried here: D-587, D-668. Ids from extraction's draft (old → new): R38 → R1, R39 → R2, R40 → R3, R42 → R4, R43 → R5, R44 (its `calibrations` sentence) → R6, R45 → R7, R46 → R8, R47 → R9; R51, R54, R55, R56, R57 (their calibration parts) → R13–R17; R10–R12 are new, the services extraction reaches.

**Size (P6).** About 950 lines move (about 480 without comment-only lines): `calibration.mjs` about 370 (about 130 code), `store.mjs` about 400 with its dispatch arms (about 225 code), `schema.mjs` about 80, the check family 78. Well under the 4,000 at which BOB reports a module. Not counted, because they stay in extraction: the drift obligations (`driftObligations`, `#calDriftFor`, `calibrationDrift`, about 170 lines), which read extraction's `reading_text_source`.

## Public

### Purpose

Holds the calibrations of derivation engines: dated, identified fidelity measurements of a named engine and version, each with the probe inputs and scores that produced it. It checks a measurement's shape, compares two measurements of one engine, keeps the live calibration of each engine and the supersession chain behind it, registers the engines this instance probes, records announcement signals, and computes when each engine's next probe is due. It holds no engine, no probe corpus and no measured number of its own; it runs no probe, re-grades nothing, reads no reading, and names no transcription (the drift obligations over transcriptions are `extraction`'s).

### Provides

Terms. A **calibration** is `{calibration_id, engine, version, at, cap, probe_id, probe_inputs, scores, measured_by}`; `cap` is a `BASIS_GRADES` letter or null (undetermined). The **live** calibration of an engine is its one calibration no later one has superseded. A **subject** is an engine this instance probes, with its probe id. A **signal** is an announcement that an engine may have changed; it can bring a probe forward and nothing else.

**The pure rules (`calibration.mjs`)**
- **R1** `checkCalibration(cal)`: an object (`CAL_SHAPE`, C-42.1) naming engine and version (`CAL_UNNAMED`, C-42.2), dated (`CAL_UNDATED`, C-42.3), a cap that is a `BASIS_GRADES` letter or null (C-42.1), and a probe run: `probe_id`, non-empty `probe_inputs` and `scores` (`CAL_NO_PROBE`, C-42.4). A null cap is legal.
- **R2** `compare(next, prev)` is on caps: no previous is `same`; a malformed calibration or another engine is `incomparable`; a lost bound is `worse`; a gained bound is `better`; two nulls are `same`. `drifted(verdict)` answers `raises_obligation` only for `worse`, and `regrades: false` on every branch.
- **R3** `nextProbeDue({lastAt, signals, cadenceMs})` is never later than `lastAt` + cadence (30 days, `CALIBRATION_CADENCE_MS`); a never-probed engine is due at once; a signal can only bring the probe forward. `checkSignal` refuses a malformed signal (`CAL_SIGNAL_SHAPE`, C-42.5) and one carrying a cap or scores (`CAL_SIGNAL_CLAIMS_MEASUREMENT`, C-42.6).

**Recording and reading measurements** (the store)
- **R4** `calibrationRecord(pkg)` (`op=calibrate`): a request to re-grade (`regrade`, `apply_to_transcriptions`) is `CAL_CANNOT_REGRADE` (C-42.7); R1's refusals apply. It mints `CAL-<n>` from the highest suffix ever used, marks the engine's live calibration `replaced_by` with R2's verdict, registers or updates the engine's subject with this probe as its last, consumes the engine's pending signals, runs the listeners (R12), and answers `calibration_id`, `supersedes`, the drift, the obligations the listeners returned (`obligations`, `obligations_raised`) and `regraded: 0`, all in one `record-core.transact`. It never writes a reading, a chain or a grade. *(not yet met: N41 — the obligations are derived inline from `reading_text_source`)*
- **R5** `measured_by` is the control plane's stamp of the caller's principal, never the body's; a calibration with none is refused `CAL_UNATTRIBUTED`. *(not yet met: D-587 — a caller-supplied string; D-668 — refused `CAL_NO_PROBE`)*
- **R6** `calibrations({engine, limit})` (`op=calibrations`) lists calibrations newest first (each with its `superseded_by` and `drift`), at most `limit` (default 200, maximum 5,000) with `truncated` measured by reading one more, and the enabled subjects with each one's next probe (R3 over its unconsumed signals) and the cadence.
- **R7** `calibrationSignalRecord(pkg)` (`op=calibrationsignal`) records a signal R3 accepts and answers the subject's next probe (null with no subject registered for the engine), `changed_grades: 0`, `stood_in_for_probe: false`.
- **R8** `calibrationSubjectRegister(pkg)` (`op=calibrationsubject`) needs an engine and a probe id, refused by codes naming a subject's conditions; registering claims no fidelity (`measured: false`), and a never-probed subject's next probe is due at once. *(not yet met: D-668 — refused with the measurement codes `CAL_UNNAMED`, `CAL_NO_PROBE`)*
- **R9** For the scheduler: `calibrationDue(now)` counts subjects due; `calibrationWake(now)` is null with no enabled subject, otherwise the earliest next probe (a past one moved to now plus the scheduler's grace); `calibrationTick(now)` lists the due subjects and runs no probe and writes no calibration.

**For `extraction`** (the services it reaches measurements through)
- **R10** `liveCalibration({engine, version})` → `{calibration_id, engine, version, at, cap, measured_by}` of the engine's live calibration when its version equals `version`, else null (no calibration, another version live, or a malformed argument). Never throws; a store that cannot be read answers null, never the nearest measurement. *(not yet met: N41 — extraction filters `op=calibrations` itself)*
- **R11** `worseSupersessions({supersededId, limit})` → `{supersessions, limit, truncated}`: each calibration superseded with verdict `worse` (only `supersededId` when given), as `{superseded, verdict, current}` with both in R1's shape and `current` the calibration that superseded it; a row whose successor cannot be read is left out. Bounded as R6. It names no transcription. *(not yet met: N41 — read inside `#calDriftFor`, unbounded)*
- **R12** `onCalibration(module, fn)`: a later module registers once (a second registration by the same module is refused `LISTENER_DECLARED`). After each calibration R4 records, every `fn` runs in the same transaction, in the modules' total order, with `{calibration_id, engine, version, supersedes, drift}`, and returns a list of obligations; R4's `obligations` is their concatenation in that order and `obligations_raised` its length. With no listener registered both are null and `why` says no module derives obligations. A listener that throws fails the whole record. *(not yet met: N41)*

## Private

### Uses

- `legacy-checks`: `BASIS_GRADES`, and `CALIBRATION_CHECKS` (C-42) until it moves here (map §1).
- `record-core`: `recordOf`, `transact`, `declarePurge`.

### Invariants

- **R13** No machine mints a grade: a calibration re-grades nothing in either direction, a signal stands in for no probe, and no service here writes a reading, a chain or a grade (DEC-4).
- **R14** Each refusal carries its catalogue row: C-42.1–C-42.7, and D-668's subject and attribution codes once rowed.
- **R15** Every list read is bounded and says when it was cut (`limit`, `truncated`).
- **R16** Purge: the three tables (`calibrations`, `calibration_subjects`, `calibration_signals`) are declared exempt, being measurements of engines, not of the record. *(not yet met: K23 — nothing declares them)*
- **R17** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.2 (a derivation never raises a cap), §15 (the calibration form: a dated fidelity measurement, a cap or an honest null).
- `docs/development/SCHEDULER.md`, "The eleventh consumer, and what it costs a group" (the cadence, signals only accelerating, a tick that runs no probe).
- DEC-4 (no machine mints a grade).

### Suggestions

- **Where it runs.** Everything but R1–R3 is store-side, `calibrationOf(ctx)` (K61). Extraction's Worker pipeline reaches R10 as `index.mjs` reaches the store today.
- **`driftObligations` moves out.** It lives in `calibration.mjs` today and is extraction's R38; it calls R2's `drifted`, which stays here.
- **The scheduler's grace** is read from `Store.SCHED_GRACE_MS` today; `scheduler` is later, so R9 should take the grace from its caller. `scheduler` calls R9 (its `calibration-reprobe` consumer, store.mjs 3818–3872) and so uses `calibration`, which `modules.json` does not yet list.
- Tests: each C-42 refusal gets a negative control; R2 and R3 keep their table-driven arms; R12 gets an arm with no listener (null, not zero) and one whose listener throws (nothing recorded). Built work: D-668 on `land/worker/D-668`; judged at the job.
