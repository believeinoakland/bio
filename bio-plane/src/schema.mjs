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

-- ---- write arc ----

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

-- =========================================================================

${HOST_GOVERNOR_SCHEMA}
`;
