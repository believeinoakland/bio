import { RECORD_SCHEMA } from "./record-core/index.mjs";
import { PROVENANCE_SCHEMA } from "./provenance/schema.mjs";
import { HOST_GOVERNOR_SCHEMA } from "./host-governor/schema.mjs";
import { CALIBRATION_SCHEMA } from "./calibration/schema.mjs";
import { BIAS_SCHEMA } from "./bias/schema.mjs";
import { AI_RUNS_SCHEMA } from "./ai-runs/schema.mjs";
import { QUEUE_SCHEMA } from "./queue/schema.mjs";
export const SCHEMA = `-- BIO store schema, draft 1, derived from the real bundle.md frontmatter and
-- _history/manifest.json shapes in tree 0.1.94. The bundle format is
-- authoritative; this is a projection of it and must never bend it.

${RECORD_SCHEMA}


-- The register, the acquisition receipts (captured_locators) and the route marks are provenance's tables,
-- defined with their reasons in src/provenance/schema.mjs (R41, R48).
${PROVENANCE_SCHEMA}

-- D-436 (State Rules v1.5 section 3.1, the core field group): THE PRODUCING GROUP'S SLUG,
-- ONE VALUE FOR THE WHOLE INSTANCE. Every bundle this instance writes names it as its
-- group, in the bytes that get signed, and nothing else may supply that name: not a
-- literal in the code, and not a deploy-time variable, which a redeploy could move
-- silently. One row, id=1, WRITTEN ONCE: every writer is an INSERT that does nothing on
-- conflict, and no statement anywhere updates or deletes it.
--   source  'bootstrap'  recorded at the store's FIRST BOOT (the migrate pass that finds no
--                        bundles table), from the slug the installer bound as INSTANCE_NAME,
--                        the worker name the group chose (D-102), read at that moment only
--           'seed'       recorded once by op=instancegroupseed, the root of trust's act, on a
--                        store that already held the schema when this table arrived
--   recorded_by  NULL for bootstrap, the server-stamped credential for a seed
-- EXEMPT FROM op=purge, in both arms: identity, not derived from the corpus, in the family
-- of bootstrap and seq. hygiene.test.mjs lists it among the purge exemptions.
CREATE TABLE IF NOT EXISTS instance_group (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  slug         TEXT NOT NULL,
  recorded_at  TEXT NOT NULL,
  source       TEXT NOT NULL,
  recorded_by  TEXT
);

-- ---- write arc ----

-- What the runtime was observed to COST and to ALLOW, measured rather than
-- assumed. capture_limits holds ceilings found by being refused; this holds
-- consumption found by measuring, which is a different kind of fact and the only
-- kind available for CPU.
--
-- Exceeding the CPU limit TERMINATES the isolate: there is no catchable error,
-- so no invocation can ever record its own death. Consumption is therefore
-- measured on every real run and the ceiling is found by a stepped probe whose
-- checkpoints survive the kill. peak_ms is the worst single run seen, which is
-- the number that matters for headroom; a mean would hide the run that dies.
CREATE TABLE IF NOT EXISTS runtime_observations (
  metric     TEXT PRIMARY KEY,
  peak_ms    REAL NOT NULL,
  peak_at    TEXT NOT NULL,
  peak_detail TEXT,
  last_ms    REAL NOT NULL,
  last_at    TEXT NOT NULL,
  samples    INTEGER NOT NULL DEFAULT 1,
  total_ms   REAL NOT NULL DEFAULT 0
);

-- The stepped CPU probe's durable trail. One row per step COMPLETED, so if the
-- isolate is killed during step N the table shows N-1 and the next probe knows
-- the ceiling lies between them. Nothing here is buffered until the end of the
-- request, on purpose: a buffered checkpoint is exactly the record that would be
-- lost at the moment it became interesting.
CREATE TABLE IF NOT EXISTS cpu_probe (
  step        INTEGER PRIMARY KEY,
  elapsed_ms  REAL NOT NULL,
  iterations  INTEGER NOT NULL,
  at          TEXT NOT NULL
);

${QUEUE_SCHEMA}


-- ---- D-104: source reachability, and what may NOT count as a failure ----

${AI_RUNS_SCHEMA}

-- THE OBSERVATION LOG (§11). Where the run searched across the four levels,
-- what it established, where it STOPPED and why. APPEND-ONLY: 'seq' is
-- monotonic per run and no row is ever updated, because a resumed run reads its
-- own log and continues (§14b.7) and a log that can be rewritten is not
-- evidence of anything.
--
-- IT IS NEVER WRITTEN INTO bundle.md. §11: "the observation log cannot live in
-- bundle.md, which is written only on success — the log's whole value is the
-- failure path." C-22.6 refuses an entry that names a bundle at the one append
-- site, so the separation is enforced where the write happens rather than
-- asserted about every reader.
--
-- 'state' is D-129's vocabulary and the column is deliberately not an enum in
-- SQL: the refusal is C-22.1 in airun.mjs, where it can NAME the five legal
-- values and say why. A CHECK constraint here would refuse with a SQLite error
-- nobody can translate, which is precisely what DEC-49 exists to prevent.
--
-- 'governed' is D-104's split as a stored fact: 1 means OUR pacing held us,
-- which is a fact about us and never about the source. C-22.2 refuses any
-- definitive state on a governed row.
-- REC-93 / IC-92, 2026-09-14: ai_run_log STOOD HERE AND IS NOW THE
-- observations TABLE further down this file. OBSERVATION-LOG-DESIGN.md
-- section 4.4 folds it: its rows are rows of that table with
-- authority_kind = run, and store.mjs #migrate copies every existing row across
-- and then DROPS the old table. The CREATE is removed rather than left standing
-- because an idempotent create would rebuild an empty ai_run_log on the next
-- boot and put the store straight back into the two-tables state section 4.4
-- forbids -- one fact, two writers, which is the D-164 failure this design
-- names. op=airunlog reads through unchanged, so I3 does not move.
--
-- THE WORDING OF THE LINE ABOVE IS LOAD-BEARING AND IS NOT A STYLE CHOICE: it
-- first read "because CREATE TABLE IF NOT EXISTS would rebuild ...", and
-- hygiene.test.mjs harvests table names out of this file by that exact literal,
-- so the sentence DESCRIBING the removal was itself parsed as a table named
-- "would" and failed the D-113 purge census. Measured, not reasoned -- the scan
-- cannot tell prose from schema, so prose here does not spell the phrase.

${BIAS_SCHEMA}




${CALIBRATION_SCHEMA}

-- =========================================================================



-- =========================================================================

-- =========================================================================

-- REC-164: THE PUBLISHING GROUP'S DISPLAY NAME AND ITS DOMAIN (BIO_Publication_v0_1.md
-- section 7 points 2 and 3). Two durable values, each with a dated history: a value is
-- the LATEST row for its field, and no statement updates or deletes a row, so every
-- revision stays readable with its date and the administrator who made it.
--   field             'display_name' or 'domain'
--   set_by            the member the control plane stamped from the signed-in session,
--                     never a caller's statement, never a bearer
--   instance_address  a domain row only: the origin the administrator's session reached,
--                     stamped by the control plane, which the well-known file must name
-- EXEMPT FROM op=purge, in both arms: identity, not derived from the corpus, the family
-- of instance_group. hygiene.test.mjs lists both tables among the purge exemptions.
CREATE TABLE IF NOT EXISTS group_identity_history (
  seq               INTEGER PRIMARY KEY AUTOINCREMENT,
  field             TEXT NOT NULL CHECK (field IN ('display_name','domain')),
  value             TEXT NOT NULL,
  set_at            TEXT NOT NULL,
  set_by            TEXT NOT NULL,
  instance_address  TEXT
);
-- Every verdict on a claimed domain, dated. The public read shows a domain only while
-- the latest verdict for the CURRENT claim is 'verified'. 'undetermined' is the fourth
-- word, and it is not one of the design's three: the governor holding the host, a fetch
-- that did not complete, or an answer that is neither a file nor its absence says
-- nothing about the domain, so it is recorded as what it is and never as 'absent'.
--   trigger  'set' (the administrator's act) or 'alarm' (the reconciling re-check)
CREATE TABLE IF NOT EXISTS group_domain_checks (
  seq         INTEGER PRIMARY KEY AUTOINCREMENT,
  domain      TEXT NOT NULL,
  verdict     TEXT NOT NULL CHECK (verdict IN ('verified','absent','mismatched','undetermined')),
  checked_at  TEXT NOT NULL,
  trigger     TEXT NOT NULL,
  status      INTEGER,
  detail      TEXT
);
-- =========================================================================

${HOST_GOVERNOR_SCHEMA}
`;
