/* calibration's tables (requirements: `build/requirements/calibration.md`): the calibrations, the engines this
 * instance probes, and the announcement signals. Moved from `schema.mjs` at the module's extraction (T5-1; Bob's
 * ruling 3, "each module owns its tables"); `schema.mjs` interpolates this text where the tables stood, so the
 * store's schema pass creates them as before. Exempt from purge (R16): they are measurements of engines, not of
 * the record. */
export const CALIBRATION_TABLES = Object.freeze(["calibrations", "calibration_subjects", "calibration_signals"]);

export const CALIBRATION_SCHEMA = `-- CPDF-13 / D-183 / D-253: THE CALIBRATION -- a dated, identified fidelity
-- measurement of a named derivation engine and version, stored WITH the probe
-- inputs and the scores that produced it.
--
-- THE INPUTS AND THE SCORES ARE COLUMNS RATHER THAN PROSE, and that is the
-- item. CPDF-10 shaped measured_by as a free STRING -- today
-- "the MEASUREMENTS ledger 2026-08-03 (CPDF-9)" -- which is better than a bare letter
-- and is still not a binding: nothing checks the pointer resolves, and nothing
-- can answer "which transcriptions rest on a measurement that has been
-- superseded". A row here is that answer's other half.
--
-- superseded_by IS THE ONLY MUTABLE COLUMN and it is set ONCE, when a later
-- probe of the same engine lands. Nothing else is ever updated: a calibration
-- is a record of a measurement that was taken, and a measurement does not
-- change after the fact. That is append-only history for the same reason the
-- record's own is.
--
-- cap NULL IS A REAL ANSWER, NOT A GAP. A probe that ran and could not
-- establish a fidelity letter measured something: that this engine's fidelity
-- is UNDETERMINED, on that date, by that probe. Recording it is strictly better
-- than recording nothing, because it is DATED.
CREATE TABLE IF NOT EXISTS calibrations (
  calibration_id TEXT PRIMARY KEY,   -- CAL-<n>, minted by the store, never by a caller
  engine         TEXT NOT NULL,      -- the derivation engine measured
  version        TEXT NOT NULL,      -- ITS version. An external service retrains under one name
  at             TEXT NOT NULL,      -- the date the PROBE RAN, never the date an announcement landed
  at_ms          INTEGER NOT NULL,   -- the same instant, for the scheduler's cadence arithmetic
  cap            TEXT,               -- a BASIS_GRADES letter, or NULL for undetermined -- STATED
  probe_id       TEXT NOT NULL,      -- which probe produced this
  probe_inputs   TEXT NOT NULL,      -- JSON. WHAT the probe was given -- two runs of one probe over
                                     -- different corpora are two measurements wearing one name
  scores         TEXT NOT NULL,      -- JSON. What came back. Stored so a later reader can disagree
  measured_by    TEXT NOT NULL,      -- who or what ran the probe
  -- WHICH CALIBRATION REPLACED THIS ONE. Set ONCE.
  --
  -- IT IS replaced_by AND NOT superseded_by, AND THAT IS A DELIBERATE
  -- NAMING CONSTRAINT RATHER THAN A PREFERENCE. D-221's version-chain pin
  -- (test/versionchain.test.mjs section 2) sweeps the WHOLE schema for any
  -- stored pointer from one version to another -- supersede/superseded_by/
  -- predecessor/previous_version and their family -- because the thesis of that
  -- item is that a document's version history is DERIVED from captures and is
  -- never an edge somebody wrote down. That pin is total on purpose and this
  -- column set it off.
  --
  -- THE PIN IS RIGHT AND WAS NOT NARROWED. A calibration is a measurement of an
  -- ENGINE, not a version of a DOCUMENT, so the two constructs have nothing to
  -- do with each other -- but loosening a total sweep to admit a lookalike is
  -- how a guard stops being total, and the next stored pointer would arrive
  -- through the hole this one made. The word moves instead, and this comment is
  -- here so a later reader knows the relationship is real and why it is spelled
  -- this way rather than concluding the author did not know the usual word.
  replaced_by    TEXT,
  drift          TEXT,               -- the verdict AT SUPERSESSION: worse, better, same, incomparable
  note           TEXT
);
CREATE INDEX IF NOT EXISTS calibrations_engine ON calibrations(engine, version, at_ms);
-- "which calibrations have been superseded by a WORSE one" is the drift
-- handler's whole question, and it is an indexed lookup rather than a scan.
CREATE INDEX IF NOT EXISTS calibrations_drift ON calibrations(drift, replaced_by);

-- CPDF-13: THE CALIBRATABLE ENGINES THIS INSTANCE ACTUALLY HAS.
--
-- The scheduler consumer reads THIS, and an instance with no row here holds NO
-- ALARM AT ALL -- which is the self-termination property REC-1 prized and the
-- reason this feature costs an idle instance exactly zero. A group that never
-- turns on a derivation engine never pays for a probe of one.
--
-- ONE PROBE PER SUBJECT PER CADENCE, on the instance's OWN account, against the
-- free allocation. That is stated in SCHEDULER.md and in calibration.mjs's
-- header as well as here, because a cost a group discovers by being billed for
-- it is a cost the plan failed to state.
CREATE TABLE IF NOT EXISTS calibration_subjects (
  engine         TEXT PRIMARY KEY,   -- the engine this instance can probe
  version        TEXT,               -- the version currently installed. NULL until a probe names one
  probe_id       TEXT NOT NULL,      -- the probe to run for it
  registered_at  TEXT NOT NULL,
  last_probe_ms  INTEGER,            -- when a probe LAST RAN. NULL means never -- due immediately
  enabled        INTEGER NOT NULL DEFAULT 1
);

-- CPDF-13, clause (e): THE ANNOUNCEMENT WATCH, WHICH MAY ONLY ACCELERATE.
--
-- A signal is somebody ELSE'S statement about their own product and the record
-- keeps it as exactly that. It carries NO cap and NO scores -- checkSignal
-- refuses one that does -- and the ONE thing it can do is pull probe_by
-- earlier than the cadence would. It may never stand in for a probe and it may
-- never itself change a grade.
--
-- AND THE ABSENCE OF A SIGNAL DOES NOTHING AT ALL. There is deliberately no
-- column here that could push a probe OUT: absence of an announcement is not
-- evidence of no change, and a silent retrain under an unchanged version string
-- is the exact failure DEC-35 named when it argued against Textract.
CREATE TABLE IF NOT EXISTS calibration_signals (
  signal_id      TEXT PRIMARY KEY,
  engine         TEXT NOT NULL,
  source         TEXT NOT NULL,      -- WHERE it was observed. A claim, attributed to its claimant
  observed_at    TEXT NOT NULL,
  probe_by_ms    INTEGER NOT NULL,   -- the instant this asks the next probe to happen BY
  detail         TEXT,
  consumed_at    TEXT                -- set when a probe ran after it. A spent signal accelerates nothing
);
CREATE INDEX IF NOT EXISTS calibration_signals_engine
  ON calibration_signals(engine, consumed_at, probe_by_ms);`;
