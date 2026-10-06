/* ai-runs' tables (R38, R49, R50, R53; Bob's ruling 3, "each module owns its tables"), moved from `schema.mjs` at the
 * module's extraction; `ai_usage` and `ai_ceilings` added by T33-50. `lens_at_open`, `rerun_of` and `plan` (R46) are additive columns of the store's migration; they are part of the
 * table here, and `migrate` adds them to a table created before them. */
export const AI_RUNS_TABLES = Object.freeze(["ai_runs", "ai_run_bounds", "inquiry_run_surfacings", "ai_usage", "ai_ceilings",
  "ai_mode_verifications"]);

export const AI_RUNS_SCHEMA = `

-- IS-6 / INVESTIGATIVE-SESSION.md §11: THE RUN IS AN OBJECT, and it is built on
-- the capture_sessions shape (capture's table) rather than on a new one — "SCRATCH, not
-- record… a work list with an expiry": ticks, an expiry, opaque state,
-- resumable across invocations. Every column beyond that shape is one §11 or
-- §14b.6 names, and each is here because a version is only interpretable
-- against the conditions it was formed under.
--
-- THE LEASE IS THE HEARTBEAT AND 'expires' IS IT. A run extends it on every
-- tick. A run that is KILLED extends nothing, so the lease lapses and the
-- ai-run-reap scheduler consumer terminates it — which is how the observation
-- log gets its terminal entry for a run that never ran its own exit path. That
-- is the whole of §14b.6's guarantee and the reason this column is not merely a
-- TTL for tidiness.
--
-- TWO PRINCIPALS, NEVER ONE (§14a, DEC-27(b), DEC-55.4). 'principal_plane' is
-- the plane credential as the control plane stamps it ('member:<id>' for a
-- member, '/<tokenId>' added for a member's AI credential; 'class:<cls>' for a
-- machine, '/<tokenId>' added for an AI credential); 'principal_claude' is
-- the member whose own Claude account carries the run, 'member:<id>' (R52, K1502,
-- K1503: there is no group, project or instance account). They are two different
-- principals and an act must say both. NEITHER IS EVER A TOKEN VALUE:
-- 'principal_claude_ref' is a label, not a secret, and nothing in the plane writes
-- a credential here.
--
-- NO TRANSCRIPT COLUMN, AND THAT IS DEC-61 (Bob, 2026-08-06). The model's
-- reasoning is DEVICE-LOCAL, TTL'd and deleted at publication, and never in the
-- record store. 'state' is the run's resumable SCRATCH — its work list — and
-- the observation log (observation-log's table, the run's rows under authority
-- 'run') is a structured account of where the search went.
-- Neither is a transcript, and there is no column here one could be put in.
CREATE TABLE IF NOT EXISTS ai_runs (
  run                   TEXT PRIMARY KEY,
  status                TEXT NOT NULL DEFAULT 'running',
  label                 TEXT,
  mode                  TEXT,
  context_type          TEXT NOT NULL,
  context_id            TEXT NOT NULL,
  principal_plane       TEXT NOT NULL,
  principal_claude      TEXT NOT NULL,
  principal_claude_ref  TEXT,
  skill_version         TEXT,
  bias_manifest         TEXT,
  standard_pair         TEXT,
  created               TEXT NOT NULL,
  updated               TEXT NOT NULL,
  expires               TEXT NOT NULL,
  ticks                 INTEGER NOT NULL DEFAULT 1,
  state                 TEXT NOT NULL,
  stopped_bound         TEXT,
  stopped_condition     TEXT,
  stopped_at            TEXT,
  lens_at_open          TEXT,
  rerun_of              TEXT,
  -- R46 (K660): the plan a run in mode 'plan' works on, stored verbatim; NULL for every other run.
  plan                  TEXT
);
CREATE INDEX IF NOT EXISTS ai_runs_expires ON ai_runs(status, expires);
CREATE INDEX IF NOT EXISTS ai_runs_context ON ai_runs(context_id);

-- §14b.6's budget, ONE ROW PER BOUND, with its live consumption beside it.
-- Rows rather than columns because F11 (§19, carried by UI-38) requires the
-- surface to render the budget and its consumption while the run is live, and
-- its renderers are field-name-blind — they walk what the record published. A
-- bound added later is a row, and nothing on any surface moves.
--
-- BOTH NUMBERS ARE STORED. UI-38 derives nothing and its suite fails any
-- arithmetic in the rendered output, so the record must publish 'allowed' and
-- 'consumed' separately; a percentage or a remainder computed here would only
-- move the same defect one layer down.
CREATE TABLE IF NOT EXISTS ai_run_bounds (
  run       TEXT NOT NULL,
  bound     TEXT NOT NULL,
  allowed   INTEGER NOT NULL,
  consumed  INTEGER NOT NULL DEFAULT 0,
  unit      TEXT,
  PRIMARY KEY (run, bound)
);

-- D-85 (INVESTIGATIVE-SESSION.md section 11 item 5, rule 2, BOB #25, 2026-09-21): AN ASSISTANT OPENS A
-- QUESTION ONLY INSIDE A RUN. When an 'ai' credential creates an inquiry it names a RUNNING run whose
-- principal it is, and the plane records the link HERE, keyed by the new inquiry. It is an INSTANCE row and
-- never a line in the inquiry's signed bytes: the run is scratch and is never published, and a pointer in
-- published bytes that no reader can resolve is not provenance. One row per inquiry (an inquiry is created
-- once). Its principal is the control plane's stamp for the credential that created it, never a field it sent.
-- The column is named bundle_id so the row rides purge's TABLES list and clears in BOTH arms (D-113).
-- NO index beyond the key: every reader asks by the inquiry.
CREATE TABLE IF NOT EXISTS inquiry_run_surfacings (
  bundle_id  TEXT PRIMARY KEY,
  run        TEXT NOT NULL,
  principal  TEXT NOT NULL,
  at         TEXT NOT NULL
);

-- R48, R49 (T33-50; K1450): THE USE COUNTER, one row per member, per local day (civil-time's localDay in the group's
-- time zone) and per mode: the sums of each model call's figures and a count of calls. It is not a run row and not an
-- observation row, and it holds no question, answer, address or content: a member id, a day, a mode and numbers.
-- Cost is summed in millionths of a dollar so the sum is exact. A figure the provider did not state adds nothing and is
-- counted in 'tokens_unstated' / 'cost_unstated' (calls with a token figure, or the cost, unstated), never as 0.
CREATE TABLE IF NOT EXISTS ai_usage (
  member                       TEXT NOT NULL,
  day                          TEXT NOT NULL,
  mode                         TEXT NOT NULL,
  calls                        INTEGER NOT NULL DEFAULT 0,
  input_tokens                 INTEGER NOT NULL DEFAULT 0,
  output_tokens                INTEGER NOT NULL DEFAULT 0,
  cache_read_input_tokens      INTEGER NOT NULL DEFAULT 0,
  cache_creation_input_tokens  INTEGER NOT NULL DEFAULT 0,
  cost_micro_usd               INTEGER NOT NULL DEFAULT 0,
  tokens_unstated              INTEGER NOT NULL DEFAULT 0,
  cost_unstated                INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (member, day, mode)
);

-- R50 (K1450, K1502): THE CEILINGS. 'holder' is 'member:<id>' for a member's own daily ceiling, set by that member's own
-- act, or 'copy' for the lower one an administrator sets for the copy's own load. A NULL figure is no ceiling of that
-- figure at that holder (a member's then falls back to the provisional default).
CREATE TABLE IF NOT EXISTS ai_ceilings (
  holder  TEXT PRIMARY KEY,
  tokens  INTEGER,
  calls   INTEGER,
  set_by  TEXT NOT NULL,
  set_at  TEXT NOT NULL
);

-- K1606 (run-rules R19; VF-4): THE ACT THAT RECORDS A MODE'S FIRST LIVE RUN VERIFIED, by a member, with what they saw.
-- Append-only: the chain that lets the next mode deploy is read from these rows, never from a parameter.
CREATE TABLE IF NOT EXISTS ai_mode_verifications (
  mode         TEXT NOT NULL,
  run          TEXT NOT NULL,
  verified_by  TEXT NOT NULL,
  at           TEXT NOT NULL,
  evidence     TEXT NOT NULL,
  PRIMARY KEY (mode, run)
);
`;
