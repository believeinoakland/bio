/* review's tables (requirements: `build/requirements/review.md`, R4, R6, R7, R18, R21, R24). Moved from `schema.mjs`
 * with their comments (K4). Working data: each is declared to record-core's purge as a whole-store table (K23, R24), so
 * only a whole-store purge clears it. */

export const REVIEW_SCHEMA = `
-- REC-126 / DEC-31 / IC-146: THE REVIEW COPY, BIO_Publication_v0_1.md section 6A.
-- An addressed act BESIDE publish that NEVER LEAVES THE INSTANCE. Three tables,
-- and none of them is a bucket: the grant is a capability over the private
-- store, never a third place bytes live (6A.2, never a bucket).
--
-- case_drafts IS THE PRODUCTION (6A.4, gap 3): a DRAFT case, identified BEFORE
-- the publish gates run, holding the arguments op=publish would take as JSON.
-- It is MUTABLE (Bob, 2026-09-17: only a real publish is not) and it is working
-- data, so a whole-store purge clears it. case_id is the existing case the draft
-- would be the next edition of, or NULL for a new case, whose identity is minted
-- only by publication. The EDITION is not stored: it is read from the published
-- record every time it is asked, which is what lets a grant bound to one edition
-- die when that edition is signed.
CREATE TABLE IF NOT EXISTS case_drafts (
  draft_id    TEXT PRIMARY KEY,   -- DRAFT-YYYY-NNNN, allocated by the draft act
  project_id  TEXT NOT NULL,      -- the producing project, whose OWNER authors the draft
  case_id     TEXT,               -- the existing case named, or NULL for a new case
  params      TEXT NOT NULL,      -- JSON of the op=publish arguments, the project excepted
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_by  TEXT NOT NULL,      -- the editor the dry run of the publish gates acts as
  updated_at  TEXT NOT NULL,
  -- REC-193 / BIO_Publication_v0_1.md section 3 rule 13 (BOB #32, 2026-09-23): WHO WROTE THE EXCLUSION
  -- STATEMENT'S CURRENT BYTES. Stamped by the SERVER at the draft write that changes the statement text and
  -- left alone by every other edit, so an editor who rewrites another section does not become the statement's
  -- author -- which is what updated_by, the last editor of ANY field, said when op=statementack read it.
  -- NULLABLE AND NEVER BACK-FILLED: a draft written before this column existed recorded no writer, and the
  -- only value a backfill could reach for is updated_by, the very value this column exists to stop standing
  -- in for one. NULL reads back as UNDETERMINED, stated, and op=statementack refuses by name rather than
  -- guess. Nothing about publication turns on it: rule 11 never refuses a case for want of an acknowledgement.
  statement_by TEXT
);
CREATE INDEX IF NOT EXISTS case_drafts_project ON case_drafts(project_id);

-- THE GRANT (6A.2): scoped to ONE production, revocable, read-and-comment,
-- attributed. Its READ SECRET is generated at the edge and this table holds only
-- its SHA-256, never the value -- the ai_credentials shape. It is BOUND TO ONE
-- CASE EDITION: case_id and edition are the draft's identity at the moment of
-- issue, and a grant whose draft no longer stands at that edition is dead
-- exactly as a revoked one is. The recipient is a LABEL the issuer typed, never
-- a member -- a grant is not an account, not membership, not a weaker member.
CREATE TABLE IF NOT EXISTS review_grants (
  grant_id    TEXT PRIMARY KEY,   -- RVG-YYYY-NNNN, the public identity. NEVER the secret
  draft_id    TEXT NOT NULL,
  case_id     TEXT,               -- the case edition bound at issue, NULL for a new case
  edition     INTEGER NOT NULL,
  recipient   TEXT NOT NULL,      -- to whom, as the issuer named them
  secret_sha  TEXT NOT NULL UNIQUE, -- SHA-256 of the read secret. NEVER its value
  issued_by   TEXT NOT NULL,
  issued_at   TEXT NOT NULL,
  revoked_by  TEXT,
  revoked_at  TEXT
);
CREATE INDEX IF NOT EXISTS review_grants_draft ON review_grants(draft_id);

-- THE COMMENT: attributed, and a recipient's comment is a RECIPIENT's. author is
-- the grant id for a recipient and the member id for a member, and author_kind
-- says which, so no reader can take one for the other.
CREATE TABLE IF NOT EXISTS review_comments (
  comment_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_id    TEXT NOT NULL,
  author_kind TEXT NOT NULL CHECK (author_kind IN ('recipient','member')),
  author      TEXT NOT NULL,
  grant_id    TEXT,               -- the grant that admitted a recipient, NULL for a member
  text        TEXT NOT NULL,
  at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS review_comments_draft ON review_comments(draft_id);
`;

/** R24: whole-store tables (no bundle key). */
export const REVIEW_TABLES = Object.freeze([
  { name: "review_comments", keys: [] },
  { name: "review_grants", keys: [] },
  { name: "case_drafts", keys: [] },
]);

/* REC-193: `case_drafts.statement_by` arrived after the table did. A store created before it holds the table without
   the column; it is added, never back-filled (NULL reads back as UNDETERMINED, R4). */
const ADDED_COLUMNS = [["case_drafts", "statement_by", "TEXT"]];

/** Creates the tables and the columns added since; idempotent. */
export function migrateReview(sql) {
  const bare = REVIEW_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  for (const [table, column, decl] of ADDED_COLUMNS) {
    const have = [...sql.exec(`PRAGMA table_info(${table})`)].map((r) => r.name);
    if (have.length && !have.includes(column)) sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
  }
}
