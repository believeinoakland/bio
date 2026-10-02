/* filing-templates' tables (requirements: `build/requirements/filing-templates.md`, R1–R13, R16, R17; K23, K921).
 *
 * APPEND-ONLY (R17): no act updates or deletes a row. A version's state, an approval, an update, a widening, a
 * withdrawal and a retirement are each a row of `tpl_events`, and the state is derived from them; a revision, a notes
 * edit, a review, a grant's revocation and a comment are each a row of their own. Every row carries `bundle_id`, the
 * bundle it is purged with (record-core R21, R46; K23): the template's project, or, for a template migrated from
 * `filings` whose draft drew on no project, that draft's action. A comment on a profile's template carries none and
 * is cleared by the whole-store purge only.
 *
 * Named `tpl_*`: `filing_templates` is `filings`' table, its retired R26 library's, written by nothing since T21 (K986)
 * and read only by this module's migration (`migrateFromFilings`, index.mjs). Every name in attribution is held by
 * value beside the id (R16). */

export const FILING_TEMPLATES_SCHEMA = `
-- R1: A TEMPLATE. scope is its project; widened by a 'widened' event (R10).
-- profiles is a JSON list of profile ids, or the string general. migrated_from
-- is filings' library id for a row taken over by the migration (K927).
CREATE TABLE IF NOT EXISTS tpl_templates (
  template_id    TEXT PRIMARY KEY,
  bundle_id      TEXT,
  project        TEXT,
  kind           TEXT,
  use            TEXT NOT NULL,
  profiles       TEXT NOT NULL,
  name           TEXT NOT NULL,
  origin         TEXT NOT NULL,
  created_by     TEXT NOT NULL,
  created_name   TEXT NOT NULL,
  created_at     TEXT NOT NULL,
  migrated_from  TEXT UNIQUE
);
-- R2: A VERSION, counting from 1 within its template. Its text and sha are its
-- latest revision's; derived_from is null or JSON {filing, sha} | {version} | {proposal}.
CREATE TABLE IF NOT EXISTS tpl_versions (
  template_id    TEXT NOT NULL,
  version        INTEGER NOT NULL,
  bundle_id      TEXT,
  author         TEXT NOT NULL,
  author_name    TEXT NOT NULL,
  derived_from   TEXT,
  created_at     TEXT NOT NULL,
  PRIMARY KEY (template_id, version)
);
-- R4, R5: EVERY REVISION of a version's text, with its author; adopted names the
-- proposal (R6) whose text it took.
CREATE TABLE IF NOT EXISTS tpl_revisions (
  rid            INTEGER PRIMARY KEY,
  template_id    TEXT NOT NULL,
  version        INTEGER NOT NULL,
  bundle_id      TEXT,
  text           TEXT NOT NULL,
  sha            TEXT NOT NULL,
  author         TEXT NOT NULL,
  author_name    TEXT NOT NULL,
  adopted        TEXT,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tpl_revisions_version ON tpl_revisions (template_id, version, rid);
-- R12: EVERY EDIT of a draft's notes; carried marks the predecessor's notes a new
-- version starts with.
CREATE TABLE IF NOT EXISTS tpl_notes (
  nid            INTEGER PRIMARY KEY,
  template_id    TEXT NOT NULL,
  version        INTEGER NOT NULL,
  bundle_id      TEXT,
  text           TEXT NOT NULL,
  author         TEXT,
  author_name    TEXT,
  carried        INTEGER NOT NULL DEFAULT 0,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tpl_notes_version ON tpl_notes (template_id, version, nid);
-- R7, R10, R11: WHAT HAPPENED TO A VERSION OR A TEMPLATE: submitted, approved,
-- updated (by its successor), withdrawn; widened and retired (version NULL).
-- detail is JSON (the tier, profiles and reason of an approval, a successor, a reason).
CREATE TABLE IF NOT EXISTS tpl_events (
  eid            INTEGER PRIMARY KEY,
  template_id    TEXT NOT NULL,
  version        INTEGER,
  bundle_id      TEXT,
  event          TEXT NOT NULL,
  actor          TEXT NOT NULL,
  actor_name     TEXT NOT NULL,
  detail         TEXT,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tpl_events_template ON tpl_events (template_id, event, version);
-- R7, R20: THE MEMBERS ASKED TO REVIEW a version, with who asked and when.
CREATE TABLE IF NOT EXISTS tpl_reviewers (
  template_id    TEXT NOT NULL,
  version        INTEGER NOT NULL,
  member         TEXT NOT NULL,
  bundle_id      TEXT,
  member_name    TEXT NOT NULL,
  asked_by       TEXT NOT NULL,
  asked_name     TEXT NOT NULL,
  at             TEXT NOT NULL,
  PRIMARY KEY (template_id, version, member)
);
-- R6: A PROPOSAL of wording, for a template or for a kind, stored apart and labelled.
CREATE TABLE IF NOT EXISTS tpl_proposals (
  proposal_id    TEXT PRIMARY KEY,
  bundle_id      TEXT,
  template_id    TEXT,
  kind           TEXT,
  text           TEXT NOT NULL,
  sha            TEXT NOT NULL,
  why            TEXT NOT NULL,
  proposer       TEXT NOT NULL,
  run            TEXT,
  model          TEXT,
  skill_pack     TEXT,
  at             TEXT NOT NULL
);
-- R9: A REVIEW, against the sha it read; a reviewer's later review of the same sha
-- stands in place of the earlier, which is kept.
CREATE TABLE IF NOT EXISTS tpl_reviews (
  rvid           INTEGER PRIMARY KEY,
  template_id    TEXT NOT NULL,
  version        INTEGER NOT NULL,
  bundle_id      TEXT,
  sha            TEXT NOT NULL,
  kind           TEXT NOT NULL,
  reviewer       TEXT NOT NULL,
  reviewer_name  TEXT NOT NULL,
  organisation   TEXT,
  credential     TEXT,
  expertise      TEXT,
  outcome        TEXT NOT NULL,
  scope          TEXT NOT NULL,
  comment        TEXT,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tpl_reviews_version ON tpl_reviews (template_id, version, rvid);
-- R8: A REVIEW GRANT to a named non-member, by the SHA-256 of a secret the control
-- plane made (the secret itself never reaches this module).
CREATE TABLE IF NOT EXISTS tpl_grants (
  grant_id       TEXT PRIMARY KEY,
  template_id    TEXT NOT NULL,
  version        INTEGER NOT NULL,
  bundle_id      TEXT,
  recipient      TEXT NOT NULL,
  organisation   TEXT NOT NULL,
  secret_sha     TEXT NOT NULL UNIQUE,
  actor          TEXT NOT NULL,
  actor_name     TEXT NOT NULL,
  at             TEXT NOT NULL
);
-- R8: A GRANT'S REVOCATION, at most one per grant.
CREATE TABLE IF NOT EXISTS tpl_grant_revocations (
  grant_id       TEXT PRIMARY KEY,
  bundle_id      TEXT,
  actor          TEXT NOT NULL,
  actor_name     TEXT NOT NULL,
  at             TEXT NOT NULL
);
-- R12, R13: A COMMENT on a version, by a member, a grant or a labelled run; note
-- marks a note added after the version left draft.
CREATE TABLE IF NOT EXISTS tpl_comments (
  cid            INTEGER PRIMARY KEY,
  template_id    TEXT NOT NULL,
  version        INTEGER NOT NULL,
  bundle_id      TEXT,
  text           TEXT NOT NULL,
  note           INTEGER NOT NULL DEFAULT 0,
  kind           TEXT NOT NULL,
  author         TEXT NOT NULL,
  author_name    TEXT NOT NULL,
  organisation   TEXT,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tpl_comments_version ON tpl_comments (template_id, version, cid);
`;

/** The tables, each keyed to its bundle by `bundle_id` (record-core R21, R46; K23). */
export const FILING_TEMPLATES_TABLES = Object.freeze(["tpl_templates", "tpl_versions", "tpl_revisions", "tpl_notes",
  "tpl_events", "tpl_reviewers", "tpl_proposals", "tpl_reviews", "tpl_grants", "tpl_grant_revocations", "tpl_comments"]);

/** The opaque ids its tables hold, for record-core's mint ledger (its R40, R70). */
export const FILING_TEMPLATES_MINT_SEED = Object.freeze([
  Object.freeze(["TPL", "tpl_templates", "template_id"]),
  Object.freeze(["TPP", "tpl_proposals", "proposal_id"]),
  Object.freeze(["TRG", "tpl_grants", "grant_id"]),
]);

/** Creates the tables; idempotent. */
export function migrateFilingTemplates(sql) {
  const bare = FILING_TEMPLATES_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--"))
    .map((l) => l.replace(/\s--.*$/, "")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
