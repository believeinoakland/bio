/* strength's tables (requirements: `build/requirements/strength.md`, R13, R15, R23). Moved out of the legacy
 * `schema.mjs` at this module's extraction (layers.md ruling 3, "each module owns its tables"). `group_strength_bar` is
 * keyed by group, not by bundle, and is exempt from purge as an instance setting (K23). `strength_cache` is the search
 * cache of the pair (R13), keyed by `bundle_id` and declared to purge (K75 (3)); its two grade columns are the columns of
 * `query-language`'s `capture` and `connection` fields, registered with retrieval (its R62; N137). Until T18 the cache
 * stood on `bundles` (`inquiry_capture_strength`, `_state`, `inquiry_connection_strength`, `_state`, legacy-store's). */

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
-- purge; test/m/strength/cache.test.mjs (R23) proves that exemption.
-- reason (DEC-88, R15): the administrator's words on why the group sets
-- this bar, recorded with it; NULL only on a row written before DEC-88, added
-- to an older store by migrateStrength.
CREATE TABLE IF NOT EXISTS group_strength_bar (
  group_id   TEXT PRIMARY KEY,
  capture    TEXT,
  connection TEXT,
  author     TEXT NOT NULL,
  at         TEXT NOT NULL,
  reason     TEXT
);

-- REC-12, R13: the derived pair CACHED per axis for search, one row per
-- inquiry, written in the promotion that writes its legs. TWO grade columns
-- and never one, because a single cached letter is exactly the composed scalar
-- DEC-21 forbids. The STATE beside each grade tells unrated (nothing on the
-- axis is graded) from undetermined (the walk hit its depth bound) from "never
-- projected" (no row), which one nullable grade column cannot do. A CACHE:
-- a leg raised beneath the inquiry does not re-promote it, so a row can be
-- stale, and strengthOf() is the authority. The grade columns are indexed
-- because "every inquiry at B or better on capture" must be a seek; the
-- states are read with a row, never filtered across the corpus.
CREATE TABLE IF NOT EXISTS strength_cache (
  bundle_id        TEXT PRIMARY KEY,
  capture_grade    TEXT,
  capture_state    TEXT,
  connection_grade TEXT,
  connection_state TEXT
);
CREATE INDEX IF NOT EXISTS strength_cache_capture ON strength_cache(capture_grade);
CREATE INDEX IF NOT EXISTS strength_cache_connection ON strength_cache(connection_grade);
`;

/** R13, R23: the cache's table and the column of each field it fills (retrieval R62: `{table, key, col}`). */
export const STRENGTH_CACHE_TABLE = "strength_cache";
export const STRENGTH_CACHE_FIELDS = Object.freeze({
  capture: Object.freeze({ table: STRENGTH_CACHE_TABLE, key: "bundle_id", col: "capture_grade" }),
  connection: Object.freeze({ table: STRENGTH_CACHE_TABLE, key: "bundle_id", col: "connection_grade" }),
});
/** R23 (K75 (3)): declared to record-core's purge, by `bundle_id`. */
export const STRENGTH_PURGED_TABLES = Object.freeze([STRENGTH_CACHE_TABLE]);

/** R23 (K23): declared to record-core's purge, and exempt. */
export const STRENGTH_EXEMPT_TABLES = Object.freeze(["group_strength_bar"]);

/* The cache as legacy-store held it, on `bundles` (a store written before T18). */
const LEGACY_CACHE_COLS = ["inquiry_capture_strength", "inquiry_capture_state", "inquiry_connection_strength",
                           "inquiry_connection_state"];

/** Creates the tables; idempotent. A `group_strength_bar` created before DEC-88 gains its `reason` column, its rows'
 *  reason NULL (R15: written before a reason was asked). On a store that still holds the cache on `bundles` and none in
 *  `strength_cache` (the first boot after the move), the values there are carried over, so no search answer changes by
 *  the move (retrieval R62). Once this table holds a row, nothing is carried again: a row this module later removed
 *  stays removed. */
export function migrateStrength(sql) {
  const bare = STRENGTH_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const s of bare.split(";").map((x) => x.trim()).filter(Boolean)) sql.exec(s);
  const barCols = new Set([...sql.exec(`PRAGMA table_info(group_strength_bar)`)].map((r) => r.name));
  if (!barCols.has("reason")) sql.exec(`ALTER TABLE group_strength_bar ADD COLUMN reason TEXT`);
  const cols = new Set([...sql.exec(`PRAGMA table_info(bundles)`)].map((r) => r.name));
  if (!LEGACY_CACHE_COLS.every((c) => cols.has(c))) return;
  if ([...sql.exec(`SELECT 1 AS x FROM strength_cache LIMIT 1`)].length) return;
  sql.exec(`INSERT OR IGNORE INTO strength_cache (bundle_id, capture_grade, capture_state, connection_grade, connection_state)
            SELECT bundle_id, ${LEGACY_CACHE_COLS.join(", ")} FROM bundles
             WHERE ${LEGACY_CACHE_COLS.map((c) => `${c} IS NOT NULL`).join(" OR ")}`);
}
