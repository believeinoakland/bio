/* link-sweep's tables (requirements: `build/requirements/link-sweep.md`, R4–R9; K1036). Moved from
 * `monitoring/schema.mjs` with N506 (K1159), unchanged. Both are DERIVED and declared to record-core's purge by the
 * bundle whose `data/gathering.json` carries the sweep, as monitoring R41 declared them. */

export const LINK_SWEEP_SCHEMA = `
-- R4–R9 (K1036): ONE ROW PER RUN OF A RATIFIED SWEEP ("<bundle>#<id>"), never edited: what it fetched and filed,
-- and detail (JSON: each seed's outcome and capture, the candidates and matches, what was filed, the skips by reason,
-- the excluded, failed and redirected fetches, the links cut, the budget) and the anomaly R8 noted, when one was.
-- Derived; declared to purge by the bundle whose data/gathering.json carries the sweep.
CREATE TABLE IF NOT EXISTS sweep_runs (
  sweep      TEXT    NOT NULL,
  seq        INTEGER NOT NULL,
  bundle_id  TEXT    NOT NULL,
  at         TEXT    NOT NULL,
  filed      INTEGER NOT NULL,
  fetched    INTEGER NOT NULL,
  detail     TEXT    NOT NULL,
  anomaly    TEXT,
  PRIMARY KEY (sweep, seq)
);

-- R6 (already_swept): every address a sweep filed a document from, and the bundle it was filed as. Derived; declared
-- to purge by the sweep's bundle.
CREATE TABLE IF NOT EXISTS sweep_filed (
  sweep         TEXT NOT NULL,
  address_norm  TEXT NOT NULL,
  bundle_id     TEXT NOT NULL,
  filed         TEXT NOT NULL,
  at            TEXT NOT NULL,
  PRIMARY KEY (sweep, address_norm)
);`;

/** This module's tables, as record-core's purge declaration names them (its R21, R46). */
export const LINK_SWEEP_TABLES = Object.freeze([
  Object.freeze({ name: "sweep_runs", keys: Object.freeze(["bundle_id"]) }),
  Object.freeze({ name: "sweep_filed", keys: Object.freeze(["bundle_id"]) }),
]);

export function migrateLinkSweep(sql) {
  const bare = LINK_SWEEP_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
}
