/* observation-log's tables (requirements: `build/requirements/observation-log.md`, R22, R23; K4, K23). Moved out of the
 * legacy `schema.mjs` at this module's extraction, with the comments that record why each is shaped as it is:
 * `observation_log` with its three indexes, `leads` and `lead_shares`. `observation_log` and `leads` carry no
 * `bundle_id` and clear only with the whole store; `lead_shares` carries the project as `bundle_id` and clears in both
 * forms (R23). */

export const OBSERVATION_LOG_SCHEMA = `
-- =========================================================================
-- REC-93 / IC-92 -- THE OBSERVATION LOG (OBSERVATION-LOG-DESIGN.md section 3).
--
-- AN OBSERVATION IS AN APPEND-ONLY EVENT ABOUT LOOKING. We fetched and it was
-- unchanged. We fetched and it had changed. We looked and it was gone. We
-- looked and could not tell. We searched for a thing a member named and found
-- nothing. It is SEPARATE FROM THE RECORD and that separation is the one
-- architectural decision STORE-AS-CACHE.md settles: the record is write-once,
-- content-addressed and never evicts, so folding a failed look into it makes
-- every failed look either a phantom capture or nothing at all. This table is
-- what lets ABSENCE BE RECORDED rather than retried away, at the cost of one
-- row and zero record bytes -- the WARC revisit economy.
--
-- ONE TABLE FOR EVERY LEVEL, and that is a decision rather than a convenience.
-- A log per level is the D-164 failure (built three times, drifts) arriving in
-- the coverage record, so internet, document, content and meaning share this
-- shape. REC-94, REC-95 and REC-96 write into THIS table at THIS vocabulary.
--
-- WHAT IT IS NOT: a transcript (DEC-61 puts those device-local and out of the
-- store entirely), a measurement of our own runtime (runtime_observations
-- measures what WE cost and stays where it is), a capture (a look that produced
-- bytes POINTS AT the capture through result_ref and is not one), or a member
-- browsing (section 4.6 -- a member ad hoc search is never an observation, and
-- that provisional is enforced by there being no writer for it).
--
-- THE STATE COLUMN IS DELIBERATELY NOT A SQL ENUM, and no CHECK constraint
-- appears anywhere below. The refusal lives in code, in this module's
-- checkObservation (vocabulary.mjs), where it can NAME the legal values and say why -- ai_run_log
-- above made the same choice for the same reason, and DEC-49 is what it is for:
-- a SQLite constraint error refuses with a sentence nobody can translate.
--
-- THE FOLD. ai_run_log IS THIS TABLE. Its rows are rows here with
-- authority_kind = run, and #migrate copies them across and drops the old table,
-- because two writers for one fact is what section 4.4 forbids. op=airunlog
-- reads through the (authority_kind, authority, seq) index and answers in its
-- existing envelope, so I3 does not change shape.
--
-- seq IS STORE-WIDE and never reused, so the order of two looks at different
-- levels is a fact the table holds rather than one a reader reconstructs. A run
-- own ordering is the seq order WITHIN its authority.
--
-- NULLABILITY, and one column deviates from the design with its reason here
-- rather than silently: section 3 writes subject as NOT NULL, but ai_run_log --
-- the design own precedent and first consumer -- has always permitted a row with
-- no subject, and section 4.4 requires those rows to fold in and read back
-- UNCHANGED. A NOT NULL here would force the fold to INVENT a subject, which is
-- the record claiming more than it can support. So the column is nullable in
-- SQL and the requirement is enforced at the one append site, where it can name
-- what is missing -- exactly the argument the state column already makes one
-- paragraph up. Reported as a DESIGN GAP against section 3.
CREATE TABLE IF NOT EXISTS observation_log (
  seq            INTEGER PRIMARY KEY,  -- monotonic, store-wide, never reused
  at             TEXT NOT NULL,
  actor_class    TEXT NOT NULL,     -- plane | machine | member
  actor          TEXT,              -- a machine credential or a member id. NULL is the plane own scheduler
  authority_kind TEXT NOT NULL,     -- run | sweep | link | ratify | acquire | extract | derive | lead | objective
  authority      TEXT,              -- the run id, the sweep request id, the document a link came from, the lead id
  level          TEXT NOT NULL,     -- internet | document | content | meaning
  subject_kind   TEXT NOT NULL,     -- address | capture | extent | entity | description | unstated
  subject        TEXT,              -- the normalised address, the capture_sha, the canonical extent, the entity id, or a member words. See the nullability note above
  state          TEXT NOT NULL,     -- LOOKED_ABSENT | LOOKED_INDETERMINATE | partial | PRESENT. NEVER_LOOKED is the ABSENCE of a row
  governed       INTEGER NOT NULL DEFAULT 0,
  condition      TEXT,              -- queuestate.mjs vocabulary, and no new words
  bound          TEXT,              -- which bound stopped it, if one did
  terminal       INTEGER NOT NULL DEFAULT 0,
  result_kind    TEXT,              -- capture | content | entity | reading | observation (a rollup, REC-100). What the look produced, if anything
  result_ref     TEXT,              -- THE BACK-REFERENCE: the capture_sha, content_id, entity id
  detail         TEXT               -- unchanged | changed | the reason | the reader name
);
-- The three reads this table exists to answer, and none of them may be a scan.
-- THE FRONTIER (section 5) is the latest row per level/subject_kind/subject --
-- a VIEW and never a second table -- so that index leads with exactly that key
-- and ends on seq, which is what makes "the latest row per subject" an index
-- walk. THE RUN READ-THROUGH is op=airunlog after the fold, and it is why the
-- second index exists at all: without it the fold would turn a primary-key read
-- into a table scan, which is how a fold quietly becomes a regression. THE
-- TALLIES are the per-level counts a completeness statement is computed from.
CREATE INDEX IF NOT EXISTS observation_log_frontier ON observation_log(level, subject_kind, subject, seq);
CREATE INDEX IF NOT EXISTS observation_log_authority ON observation_log(authority_kind, authority, seq);
CREATE INDEX IF NOT EXISTS observation_log_tally ON observation_log(level, state, seq);

-- MK-4 / IC-135 / D-194 -- THE LEAD. MEMBER-KNOWLEDGE-DESIGN.md section 5: the
-- same member knowledge BEFORE the search. I was told the contract was amended,
-- look at the Clerk March agenda. An AUTHORED ROW and NEVER EVIDENCE.
--
-- WHY A TABLE OF ITS OWN AND NOT A CONTENT ROW OR A BUNDLE. Everything a basis
-- leg can cite is a bundle or a content row. A lead stored as either would be an
-- unlabelled observation a member could cite as evidence, which is the one thing
-- section 5 rules it is not. So it lives here, under an id (LEAD-...) that no leg
-- grammar accepts, and C-54.1 refuses it BY NAME at every leg grammar as well.
--
-- FOLLOWING A LEAD IS A LOOK, and the look is NOT stored here. It is a row of
-- observation_log with authority_kind = lead and authority = lead_id (section 5,
-- OBSERVATION-LOG-DESIGN.md section 4.5). Nothing is written to the log when a
-- lead is AUTHORED: nobody has looked yet, and NEVER_LOOKED is never stored.
--
-- NO bundle_id, BY THE DESIGN'S FIELD LIST. So a per-bundle purge leaves it and
-- the whole-store purge clears it (D-113). Visibility is the AUTHOR's (a
-- provisional, stated in store.mjs leadRead) because no bundle scopes it.
CREATE TABLE IF NOT EXISTS leads (
  lead_id   TEXT PRIMARY KEY,   -- LEAD-YYYY-MMDD-hex, minted by the plane
  author    TEXT NOT NULL,      -- a member id, server-stamped, never a machine (C-54.2)
  words     TEXT NOT NULL,      -- the member words AS WRITTEN, never paraphrased
  locator   TEXT,               -- an optional place to look the member suggests. NULL = none suggested
  at        TEXT NOT NULL       -- when the record received the lead
);
CREATE INDEX IF NOT EXISTS leads_author ON leads(author, at);
-- A LEAD SHARED TO A PROJECT. RULED 2026-09-18 by BOB #14 on MK-4's design gap: a
-- lead is visible to its AUTHOR, to a project's participants ONLY after the author
-- SHARES it to that project, to a machine credential only within the scope a member
-- minted for it, and to nobody else. The share is an AUTHORED, DATED act and this
-- row is it. Never rewritten: sharing twice finds the same row.
-- bundle_id IS THE PROJECT, named so it rides op=purge TABLES list and clears in
-- BOTH arms (D-113) -- a share outliving its project would admit whoever holds that
-- id next.
CREATE TABLE IF NOT EXISTS lead_shares (
  lead_id    TEXT NOT NULL,
  bundle_id  TEXT NOT NULL,     -- the PROJECT the lead is shared to
  sharer     TEXT NOT NULL,     -- the lead author, server-stamped (C-54.10)
  at         TEXT NOT NULL,
  PRIMARY KEY (lead_id, bundle_id)
);
CREATE INDEX IF NOT EXISTS lead_shares_bundle ON lead_shares(bundle_id);
`;

/** The declaration to record-core's purge (its R21, R46): the log and the leads by the whole-store form only. */
export const OBSERVATION_LOG_TABLES = Object.freeze([
  "lead_shares",
  { name: "observation_log", keys: [] },
  { name: "leads", keys: [] },
]);

/** Which of the legacy declarations this module now owns (the legacy store filters them out of its own list). */
export function observationLogOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return name === "observation_log" || name === "leads" || name === "lead_shares";
}

/** The module's tables, created where absent. The statements are the schema text above, run one by one. */
export function migrateObservationLog(sql) {
  const bare = OBSERVATION_LOG_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const stmt of bare.split(";")) if (stmt.trim()) sql.exec(stmt);
}
