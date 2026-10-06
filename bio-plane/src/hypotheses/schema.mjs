/* hypotheses: the two tables this module owns (R10). A hypothesis is never edited in place (R2): `hypotheses` holds
   its current statement and nodes for the reads and the hunch hops, and `hypothesis_revisions` every act on it, in
   order, with who, when and why. Both are keyed by the inquiry's `bundle_id`, so a purge of the inquiry takes them. */
export const HYPOTHESES_SCHEMA = `
CREATE TABLE IF NOT EXISTS hypotheses (
  hypothesis_id TEXT PRIMARY KEY,
  bundle_id     TEXT NOT NULL,      -- the inquiry holding it; its sight is the inquiry's
  kind          TEXT NOT NULL,      -- cause | identity | relation | flow | other
  statement     TEXT NOT NULL,      -- the current statement, the last revision's
  about_json    TEXT NOT NULL,      -- the current nodes: {from, to} or a list of ids
  from_node     TEXT,               -- the hunch hop's ends, when the nodes are {from, to}
  to_node       TEXT,
  held_by       TEXT NOT NULL,
  held_at       TEXT NOT NULL,
  withdrawn     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS hypotheses_bundle ON hypotheses (bundle_id);
CREATE INDEX IF NOT EXISTS hypotheses_from ON hypotheses (from_node, bundle_id);
CREATE INDEX IF NOT EXISTS hypotheses_to ON hypotheses (to_node, bundle_id);
CREATE TABLE IF NOT EXISTS hypothesis_revisions (
  seq           INTEGER PRIMARY KEY AUTOINCREMENT,
  hypothesis_id TEXT NOT NULL,
  bundle_id     TEXT NOT NULL,
  act           TEXT NOT NULL,      -- hold | revise | withdraw
  statement     TEXT,
  about_json    TEXT,
  reason        TEXT,
  by_actor      TEXT NOT NULL,
  at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS hypothesis_revisions_of ON hypothesis_revisions (hypothesis_id, seq);
CREATE INDEX IF NOT EXISTS hypothesis_revisions_bundle ON hypothesis_revisions (bundle_id);
`;

export const HYPOTHESES_TABLES = Object.freeze(["hypotheses", "hypothesis_revisions"]);
