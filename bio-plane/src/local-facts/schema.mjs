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
  layer         TEXT,
  government_json TEXT,
  entry_json    TEXT,
  source_json   TEXT,
  reason        TEXT,
  statement     TEXT,
  by_member     TEXT NOT NULL,
  at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS local_rule_acts_rule ON local_rule_acts(draft_seq, seq);
-- R30 (T53): the team layer, one row per member's act on an entry of it, written once and never updated or removed. A
-- 'draft' row is the entry (its id is LE-<seq>, draft_seq NULL); a 'confirm' or 'withdraw' row names it by draft_seq; a
-- 'state' row is a member's stated fiscal year (R31), an entry at once, with its how in reason. government_json is the
-- government the entry is about ({level, place}, jurisdictions R115); statement is a confirmation's qualification (R23).
CREATE TABLE IF NOT EXISTS team_layers (
  seq             INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_seq       INTEGER,
  act             TEXT NOT NULL,
  section         TEXT,
  government_json TEXT,
  entry_json      TEXT,
  source_json     TEXT,
  reason          TEXT,
  statement       TEXT,
  by_member       TEXT NOT NULL,
  at              TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS team_layers_entry ON team_layers(draft_seq, seq);
-- R26 (T53): a team's report that a rule of a Civicsmith layer is wrong, one row per act: a 'report' row is the report (its
-- id is LR-<seq>, draft_seq NULL) and a 'carry' row marks it carried by a member (draft_seq names the report).
CREATE TABLE IF NOT EXISTS layer_reports (
  seq             INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_seq       INTEGER,
  act             TEXT NOT NULL,
  layer           TEXT,
  layer_as_of     TEXT,
  layer_version   TEXT,
  key_text        TEXT,
  said_json       TEXT,
  believes        TEXT,
  source_json     TEXT,
  by_member       TEXT NOT NULL,
  at              TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS layer_reports_report ON layer_reports(draft_seq, seq);
`;

/** R5, R9 (plan T33, Rules (6)): the table, declared explicitly through record-core's `declareTable` (its R21). No
 *  bundle key, so only the whole-store purge clears it (R5, K23); appended, never overwritten (`version_chain`); a
 *  profile fact is the instance's (`sight: "group"`); the other classes as `declarePurge`'s default form gives them. */
const appended = (name) => Object.freeze({
  name, keys: Object.freeze([]), purge: "clear", expunge: "none", export: "admin-only",
  sight: "group", derive: "stored", version_chain: true,
});
/** R30 (T53): the team layer's table is exempt from purge (the team's own record, `sight: "group"`, append-only). */
const exempt = (name) => Object.freeze({ ...appended(name), purge: "exempt" });
/** R14 (T45): the rules' table on the same terms (append-only, `sight: "group"`, purged with the store). */
export const LOCAL_FACTS_TABLE_CLASSES = Object.freeze([appended("local_fact_acts"), appended("local_rule_acts"),
  exempt("team_layers"), appended("layer_reports")]);
export const LOCAL_FACTS_TABLES = Object.freeze(LOCAL_FACTS_TABLE_CLASSES.map((e) => e.name));

export function migrateLocalFacts(sql) {
  const bare = LOCAL_FACTS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  /* R28 (T53): a rule keeps the layer it belongs to and the government it is about; the columns are added to a table
     that exists, and a row written before is not touched (its NULLs read as the team's one layer, R24) */
  const have = [...sql.exec(`SELECT name FROM pragma_table_info('local_rule_acts')`)].map((r) => r.name);
  for (const [column, decl] of [["layer", "TEXT"], ["government_json", "TEXT"]])
    if (have.length && !have.includes(column)) sql.exec(`ALTER TABLE local_rule_acts ADD COLUMN ${column} ${decl}`);
}
