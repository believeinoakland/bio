/* strength's table (requirements: `build/requirements/strength.md`, R15, R23). Moved out of the legacy `schema.mjs` at
 * this module's extraction (layers.md ruling 3, "each module owns its tables"). `group_strength_bar` is keyed by
 * group, not by bundle, and is exempt from purge as an instance setting (K23): it is declared to record-core as such. */

export const STRENGTH_SCHEMA = `
-- REC-14 / DEC-17 as amended: the GROUP's default required evidentiary
-- strength, which a project may then override in its own bundle.md. A PAIR
-- (capture, connection) per R2 and never a scalar, because a single letter
-- would re-collapse the two axes in the one field a reader is most likely to
-- quote.
--
-- It is a DECLARATION BY THE GROUP ABOUT ITS OWN WORK, not a system rule and
-- not a property of any reader: nobody's standard is set by who they are
-- (AUDIENCES 5). An ABSENT declaration gates nothing and the published case
-- SAYS SO -- an absent bar is not a bar of zero and must never render as one.
-- Governance, not corpus: like members and signers it survives a whole-store
-- purge, and hygiene.test.mjs carries that exemption with its reason.
CREATE TABLE IF NOT EXISTS group_strength_bar (
  group_id   TEXT PRIMARY KEY,
  capture    TEXT,
  connection TEXT,
  author     TEXT NOT NULL,
  at         TEXT NOT NULL
);
`;

/** R23 (K23): declared to record-core's purge, and exempt. */
export const STRENGTH_EXEMPT_TABLES = Object.freeze(["group_strength_bar"]);

/** Creates the table; idempotent. */
export function migrateStrength(sql) {
  const bare = STRENGTH_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
