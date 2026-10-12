/* local-facts' tables (requirements: `build/requirements/local-facts.md`, R5, R9, R14). One row per member's act on a
 * profile fact, and one per member's act on a group rule, written once and never updated or removed: a status or a
 * rule's state is read from the acts in the order written (`seq`). The tables name no bundle, so record-core's
 * single-bundle purge leaves them and the whole-store purge clears them (K23). */

export const LOCAL_FACTS_SCHEMA = `
-- R1, R5: a member's confirm, correct or dispute of the fact at path. value_json is the value the act is about: for a
-- confirm, the value that governed when it was made; for a correct, the corrected value; for a dispute, the value
-- disputed. source is a correction's source, else NULL.
CREATE TABLE IF NOT EXISTS local_fact_acts (
  seq           INTEGER PRIMARY KEY AUTOINCREMENT,
  path          TEXT NOT NULL,
  profile       TEXT NOT NULL,
  act           TEXT NOT NULL,
  how           TEXT NOT NULL,
  value_json    TEXT,
  source        TEXT,
  by_member     TEXT NOT NULL,
  at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS local_fact_acts_path ON local_fact_acts(path, seq);
-- R10-R14 (T45): the group's own jurisdiction rules, one row per member's act, written once and never updated or
-- removed. A draft row is the rule: its id is GR-<seq>, and draft_seq is NULL on it; a confirm or a withdraw row names
-- its rule by draft_seq. entry_json and source_json are the draft's; statement is a confirmation's professional
-- qualification (R11), recorded only on that row; reason is a draft's or a withdrawal's.
CREATE TABLE IF NOT EXISTS local_rule_acts (
  seq           INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_seq     INTEGER,
  act           TEXT NOT NULL,
  section       TEXT,
  entry_json    TEXT,
  source_json   TEXT,
  reason        TEXT,
  statement     TEXT,
  by_member     TEXT NOT NULL,
  at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS local_rule_acts_rule ON local_rule_acts(draft_seq, seq);
`;

/** R5, R9 (plan T33, Rules (6)): the table, declared explicitly through record-core's `declareTable` (its R21). No
 *  bundle key, so only the whole-store purge clears it (R5, K23); appended, never overwritten (`version_chain`); a
 *  profile fact is the instance's (`sight: "group"`); the other classes as `declarePurge`'s default form gives them. */
const appended = (name) => Object.freeze({
  name, keys: Object.freeze([]), purge: "clear", expunge: "none", export: "admin-only",
  sight: "group", derive: "stored", version_chain: true,
});
/** R14 (T45): the rules' table on the same terms (append-only, `sight: "group"`, purged with the store). */
export const LOCAL_FACTS_TABLE_CLASSES = Object.freeze([appended("local_fact_acts"), appended("local_rule_acts")]);
export const LOCAL_FACTS_TABLES = Object.freeze(LOCAL_FACTS_TABLE_CLASSES.map((e) => e.name));

export function migrateLocalFacts(sql) {
  const bare = LOCAL_FACTS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
