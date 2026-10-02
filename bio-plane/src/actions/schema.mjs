/* actions' tables (requirements: `build/requirements/actions.md`, R3, R8, R19, R28, R36, R48, R52; K4). Moved from
 * `schema.mjs` (legacy-store) with their comments; `action_risk_proposals` (R28, REC-215) is new;
 * `action_clock_proposals` (R32) moved to `action-clocks` (K617); `action_overrides` (R8) and `action_pressure` (R48)
 * are T18's, `action_holds` (R52) T20's, `action_hold_projects`
 * (R52, R56; DEC-113) T27's. Each is keyed by the action's `bundle_id` and declared to record-core's purge
 * (K23), so a purge of that action clears its rows. The projection columns on `bundles` are retrieval's; this module
 * only supplies their values (R12). */

export const ACTIONS_SCHEMA = `
-- REC-24 (a): WHY AN ACTION EXISTS, and it is DELIBERATELY inquiry_basis's
-- shape rather than a new one. Read from the action it is *why we are asking*;
-- read from the case it is *what we did about it*. One table, one grammar, one
-- projection discipline: a projection of the action document's own
-- action_basis[] block, re-projected WHOLE on every promotion, never a second
-- place the relationship is stated (D-21).
--
-- kind is 'rests_on' (this action is built on that finding) or 'advances'
-- (this action pursues that question). TWO kinds and not one, because the
-- difference is what DEC-13 rides on: a request_for_comment names THE SPECIFIC
-- INQUIRIES IT DISCLOSED as advances legs, so "we contacted them" and "we put
-- these four claims to them" are different rows in the record rather than the
-- same sentence. The Columbia review of Rolling Stone identified a comment
-- request made WITHOUT SPECIFICS as the central failure; this column is where
-- the specifics live.
--
-- It is ALSO where DEC-14's outcome/impact line is drawn. A recorded
-- consequence is an OUTCOME by default and needs nothing here; promoting it to
-- an IMPACT claim requires a rests_on leg pointing at evidence that is NOT
-- our own action and NOT a document this action's own correspondence produced.
-- Absent that, the claim is RECORDED and its state is unproven — a stated
-- state on the R1 shape, never a fifth grade and never a low one.
--
-- action_basis_target is the reverse index: "which actions rest on this
-- finding" is ONE indexed lookup, exactly as inquiry_basis_target is for
-- questions. Cleared in BOTH purge arms via the TABLES list (D-113); the
-- module test of R36 (test/m/actions/read.test.mjs) holds that list against
-- this file's tables.
CREATE TABLE IF NOT EXISTS action_basis (
  bundle_id   TEXT NOT NULL,   -- the action
  ord         INTEGER NOT NULL,-- position in action_basis[], so a leg is addressable
  target_id   TEXT NOT NULL,   -- an INFO- or an INQ-/PROB-/FOCUS- bundle
  target_type TEXT NOT NULL,   -- denormalised from the id prefix through the catalog's map
  kind        TEXT NOT NULL,   -- 'rests_on' | 'advances'
  note        TEXT,
  at          TEXT,            -- the document's own authored date, never a server stamp
  PRIMARY KEY (bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS action_basis_target ON action_basis(target_id);
CREATE INDEX IF NOT EXISTS action_basis_bundle ON action_basis(bundle_id);

-- REC-24 (b): THE CORRESPONDENCE LEDGER — what we sent, what came back, and
-- what did NOT come back. A projection of a new frontmatter correspondence[]
-- block exactly as refs is of references[]: re-projected whole on every
-- promotion, appended to by op=actioncorrespond and NEVER rewritten, because a
-- correspondence entry that changed is itself a fact rather than a correction.
--
-- THE CAPTURE-OR-TESTIFY CHOICE IS STRUCTURAL, and it is the reason two of
-- these columns are nullable rather than one being NOT NULL. An entry carries
-- either an artifact_sha that resolves in register — the bytes, hashed, the
-- thing we can prove later — OR an account with an author, which is a
-- member's dated testimony that this exchange happened. NEVER NEITHER (an
-- entry standing for nothing) and NEVER BOTH (bytes and a paraphrase of the
-- same exchange competing to be the record; DEC-13 is explicit that what comes
-- back is CAPTURED, not summarised). C-2.10 enforces the choice over the
-- document and promote enforces the RESOLUTION of the sha, which only the store
-- can see. This is inquiry_exclusions' target-or-prose structure one construct
-- over.
--
-- direction is 'sent', 'received', or 'no_response'. The third is not a
-- bookkeeping convenience: DEC-13 rules that a refusal to reply is a dated
-- first-party fact about the body and frequently the more useful one, so it is
-- RECORDED with its date rather than left as an absence a reader has to infer.
-- A no_response entry is testimony by construction — there are no bytes to
-- hash when nothing arrived — and takes the account/author arm.
--
-- author is SERVER-STAMPED by the control plane from the authenticated session, like
-- every other authorship in this plane: who put a testimonial account on the
-- record is part of the record, and a caller naming it would be a caller
-- signing as somebody else. recorded_at is when the entry was written; at is
-- when the exchange HAPPENED, and they are different facts.
--
-- artifact_bundle_id is resolved from the register at projection time, so the
-- ledger can name the INFO- bundle a captured reply became without the document
-- restating it. Cleared in BOTH purge arms via the TABLES list (D-113).
CREATE TABLE IF NOT EXISTS correspondence (
  bundle_id          TEXT NOT NULL,   -- the action
  ord                INTEGER NOT NULL,-- position in correspondence[], append-only
  direction          TEXT NOT NULL,   -- 'sent' | 'received' | 'no_response'
  at                 TEXT NOT NULL,   -- when the exchange happened (authored)
  medium             TEXT,
  party              TEXT,
  artifact_bundle_id TEXT,            -- resolved from register, NULL for testimony
  artifact_sha       TEXT,            -- the capture, XOR account/author below
  account            TEXT,
  author             TEXT,            -- server-stamped, required with account
  recorded_at        TEXT,
  PRIMARY KEY (bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS correspondence_artifact ON correspondence(artifact_sha);
CREATE INDEX IF NOT EXISTS correspondence_bundle ON correspondence(bundle_id);

-- D-148: A FEE QUOTE IS EVIDENCE (BIO_Case_Making_v0_1.md section 2, Bob 2026-09-22).
-- A received correspondence entry may carry a QUOTE - the amount and currency
-- as quoted, the stated basis verbatim, and the ord of the sent entry it
-- answers; a later quote may name the quote it revises, and a waiver is a
-- revision to zero with BOTH entries standing. This table is a PROJECTION of
-- those entry keys, written in promote's transaction by the same
-- delete-then-insert as correspondence above, never a second place to state a
-- quote (D-21). It exists so a read can set quotes side by side by
-- counterparty and by request with an index rather than a walk of every
-- action's bytes.
--
-- amount is the text AS QUOTED and value is its parse, so ordering never
-- rewrites what the body said. counterparty is the action's own
-- counterparty.name, denormalised at projection and NULL when the action
-- states its counterparty undetermined - such a quote is still read by its
-- request. The record asserts only what was quoted, by whom, when, for which
-- request: no column here judges a quote (DEC-24). Cleared in BOTH purge arms
-- via the TABLES list (D-113).
CREATE TABLE IF NOT EXISTS action_quotes (
  bundle_id    TEXT NOT NULL,   -- the action
  ord          INTEGER NOT NULL,-- the received entry carrying the quote
  amount       TEXT NOT NULL,   -- as quoted
  value        REAL,            -- amount parsed, for setting side by side
  currency     TEXT NOT NULL,   -- as quoted, never inferred
  basis        TEXT,            -- verbatim, NULL when none was recorded
  answers_ord  INTEGER NOT NULL,-- the sent entry it answers
  revises_ord  INTEGER,         -- the earlier quote it revises, if any
  counterparty TEXT,            -- the action's counterparty.name, NULL if undetermined
  at           TEXT NOT NULL,   -- when the quote was received (authored)
  PRIMARY KEY (bundle_id, ord)
);
CREATE INDEX IF NOT EXISTS action_quotes_counterparty ON action_quotes(counterparty);


-- REC-195 (D-149's remaining half, BIO_Case_Making_v0_1.md §2): A MACHINE'S
-- PROPOSAL OF THE LAWS GOVERNING AN ACTION, STORED APART FROM THE MEMBER'S LIST.
--
-- D-149: *the machine may propose the list from the counterparty, labelled as
-- machine work, and never sets it*. THE WHOLE POINT OF THIS TABLE IS THE WORD
-- APART. The member's list lives in the action's own frontmatter
-- (governing_laws[], set by op=actionlaws and by nothing else, C-73.1), and a
-- proposal that shared that home would BE the list the moment anything read the
-- document -- the overclaim this row exists to refuse. So a proposal is not a
-- projection of the bytes, nothing writes it into them, and no read composes the
-- two: op=projection's action block serves governing_laws and
-- governing_laws_proposals as two separate answers, each saying whose it is.
--
-- KEYED (bundle_id, proposed_by, ord): ONE STANDING PROPOSAL PER PROPOSER, its
-- citations ordered as proposed. A proposer restating replaces its own rows and
-- nobody else's, which is themes' hunch discipline one construct over: the
-- record keeps who proposed what, and two machines proposing different lists is
-- two proposals rather than one overwriting the other.
--
-- NOTHING HERE IS DERIVED FROM THE COUNTERPARTY BY THIS PLANE. The proposer
-- supplies the citations and the levels, and the plane stores them under that
-- proposer's name and encodes no law's rules (D-149), which is why there is no
-- column mapping an agency to a law.
--
-- Carries bundle_id, so it clears in BOTH purge arms through the TABLES list
-- (D-113), and the module test of R36 holds that list against this file. A proposal
-- outliving the action it was made against would attach itself to whatever
-- bundle was next allocated that id -- somebody else's request wearing a
-- machine's citations.
CREATE TABLE IF NOT EXISTS action_law_proposals (
  bundle_id   TEXT NOT NULL,   -- the action
  proposed_by TEXT NOT NULL,   -- the control plane's stamp: class:<cls>, class:ai/<tokenId>, or a member handle
  ord         INTEGER NOT NULL,-- position in the proposed list
  level       TEXT NOT NULL,   -- one of LAW_LEVELS, judged before the write
  citation    TEXT NOT NULL,   -- as the proposer wrote it, and never parsed for a rule
  proposed_at TEXT NOT NULL,
  PRIMARY KEY (bundle_id, proposed_by, ord)
);

-- R28 (REC-215): A PROPOSED RISK TIER, STORED APART FROM THE MEMBER'S. Any
-- credential may propose; a proposer's restatement replaces its own row and
-- nobody else's (keyed bundle_id, proposed_by). Nothing here is the tier: the
-- tier is the action's own risk_tier, set by a member's act (R23-R24), and no
-- read composes the two.
CREATE TABLE IF NOT EXISTS action_risk_proposals (
  bundle_id   TEXT NOT NULL,   -- the action
  proposed_by TEXT NOT NULL,   -- the control plane's stamp
  tier        INTEGER NOT NULL,-- 1, 2 or 3
  basis       TEXT NOT NULL,   -- what the proposer read the tier from, as written
  proposed_at TEXT NOT NULL,
  PRIMARY KEY (bundle_id, proposed_by)
);

-- R8 (K600 (a)): WHO STATED A PREMISE OVERRIDE, AND WHEN. The reason is the
-- document's own (premise_override: {reason}); this module stamps the author and
-- the time of the promotion that first carried it, once, and never again: the
-- override is never edited or removed (PREMISE_OVERRIDE_REWRITTEN).
CREATE TABLE IF NOT EXISTS action_overrides (
  bundle_id   TEXT PRIMARY KEY, -- the action
  reason      TEXT NOT NULL,    -- as the document states it
  stated_by   TEXT,             -- the promotion's author
  at          TEXT NOT NULL     -- when it first landed
);

-- R48 (K597 (1)): PRESSURE MARKED ON A RECEIVED ENTRY - a threat, retaliation,
-- discrediting or legal harassment directed at the group. A member's mark, kept
-- in this table and never written into the entry (the ledger is append-only,
-- R34); one mark per entry.
CREATE TABLE IF NOT EXISTS action_pressure (
  bundle_id   TEXT NOT NULL,    -- the action
  ord         INTEGER NOT NULL, -- the received correspondence entry
  kind        TEXT NOT NULL,    -- legal | retaliation | discrediting | other
  note        TEXT NOT NULL,
  marked_by   TEXT NOT NULL,    -- the member who marked it
  at          TEXT NOT NULL,
  PRIMARY KEY (bundle_id, ord)
);

-- R52 (K899 (7), DEC-61): A LITIGATION HOLD stated on a received entry marked
-- pressure of kind legal: in_place (the group is preserving what the matter may
-- reach) or released, with the member's reason. Each statement is appended and
-- never rewritten; the latest for an entry (its highest seq) is its hold. While
-- an entry's hold is in_place, no material of a project it covers, and not the
-- action itself, is purged (R60; DEC-113, K1252).
CREATE TABLE IF NOT EXISTS action_holds (
  bundle_id   TEXT NOT NULL,    -- the action
  ord         INTEGER NOT NULL, -- the received entry carrying the legal mark
  seq         INTEGER NOT NULL, -- the statement's place among that entry's, from 1
  hold        TEXT NOT NULL,    -- in_place | released
  reason      TEXT NOT NULL,
  stated_by   TEXT NOT NULL,    -- the member who stated it
  at          TEXT NOT NULL,
  PRIMARY KEY (bundle_id, ord, seq)
);

-- R52, R56 (DEC-113): A HOLD STATEMENT'S PROJECTS. For an in_place statement,
-- the projects it records: the action's own project (filled in by this module)
-- and each project the member named. For a released statement, the projects
-- it restarted (R56's restarted, computed in the release's transaction,
-- whatever the releasing member may see). Appended with its statement and
-- never rewritten.
CREATE TABLE IF NOT EXISTS action_hold_projects (
  bundle_id   TEXT NOT NULL,    -- the action
  ord         INTEGER NOT NULL, -- the entry carrying the hold
  seq         INTEGER NOT NULL, -- the statement (action_holds.seq)
  project     TEXT NOT NULL,    -- a project id
  PRIMARY KEY (bundle_id, ord, seq, project)
);
`;

/** The tables, each keyed to the action by `bundle_id` (record-core R21, R46). */
export const ACTIONS_TABLES = Object.freeze(["action_basis", "correspondence", "action_quotes",
  "action_law_proposals", "action_risk_proposals", "action_overrides", "action_pressure", "action_holds",
  "action_hold_projects"]);

/** Creates the tables; idempotent. */
export function migrateActions(sql) {
  const bare = ACTIONS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
