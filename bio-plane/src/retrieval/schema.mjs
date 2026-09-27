/* retrieval — its storage (K4): the projection columns it adds to record-core's `bundles` (R1, R2; where they live is
 * BOB's Q1, recorded in the job record), the text index `bundles_fts` (R1, R17), and the selections (R18–R22).
 * Every statement here is idempotent: `migrate()` runs them at every start. */
import { FTS_COLUMNS } from "../query.mjs";

/* S-10 step 1: the metadata projection the retrieval surface filters and sorts on. Probe 2
   (development/RETRIEVAL-SUBSTRATE.md) measured that the original nine columns cover about half of what real
   frontmatter carries, and that typed indexed columns beat a facet table by roughly 9x on write cost and 5.5x on
   space while never being slower. So: a column for every field the UX filters on, and fm_json for the per-schema
   tail, since information@1, information@2, problem@1 and project@1 carry different field sets and more versions are
   coming. All nullable and additive, so an older row simply has an empty projection until the backfill re-derives it
   from bundle.md (R3).

   REC-24 (e): the ACTION's six projection columns — the first projection columns whose subject is the outward ask
   rather than the question. A bundle that is not an action simply has none. action_kind / action_risk_tier /
   action_counterparty_state / action_resolution are pure facts about the document, cached here so the Actions rail can
   filter without opening every bundle. THE TWO CLOCK COLUMNS ARE A CACHE AND THE READ IS THE AUTHORITY: action_clock_next
   is the earliest PENDING clock date, which does not rot; action_clock_overdue is that date compared against the clock
   AT PROMOTION TIME, and it exists for the FILTER, never for the answer a reader is shown (R53: the rule is `actions'`).

   S-10 step 2: `fts_id`, the row key the text index is aligned on. FTS5 addresses rows by integer rowid, and probe 2
   chose an integer join over a string join for text-plus-metadata queries, so a bundle needs a stable integer of its
   own. NOT the table's implicit rowid: that is an implementation detail SQLite is entitled to renumber. */
export const PROJECTION_COLUMNS = Object.freeze([
  ["schema_id", "TEXT"], ["produced_mode", "TEXT"], ["capability_tier", "TEXT"], ["source_locator", "TEXT"],
  ["source_authority", "TEXT"], ["source_retrieved", "TEXT"], ["source_status", "TEXT"], ["content_hash", "TEXT"],
  ["monitor_enabled", "INTEGER"], ["monitor_frequency", "TEXT"], ["monitor_last_checked", "TEXT"],
  ["annotations_open", "INTEGER"], ["reeval_flag", "INTEGER"], ["reeval_since", "TEXT"], ["reeval_source", "TEXT"],
  ["fm_json", "TEXT"], ["fts_id", "INTEGER"],
  ["action_kind", "TEXT"], ["action_risk_tier", "INTEGER"], ["action_counterparty_state", "TEXT"],
  ["action_resolution", "TEXT"], ["action_clock_next", "TEXT"], ["action_clock_overdue", "INTEGER"],
]);

/* Indexed because probe 2 recorded the difference in the query PLAN, not only the latency: without an index a filter is
   a full table scan whose cost grows with the corpus, and at 20,000 rows a scan is still fast enough to look like
   success. REC-26 added `monitor_enabled` (the cadence consumer asks it on every reconcile of the one alarm). REC-24
   indexes three of the six action columns: "every open CPRA request", "every action awaiting a response", "everything
   overdue" are the Actions rail's own three seeks; the other three are read WITH a row, and an index nobody seeks on is
   cost with no reader (REC-12's reason). `strength`'s two axis columns are indexed by their writer, not here. */
export const PROJECTION_INDEXED = Object.freeze(["schema_id", "produced_mode", "source_authority", "source_status",
  "monitor_enabled", "monitor_frequency", "reeval_flag", "annotations_open",
  "action_kind", "action_resolution", "action_clock_overdue"]);

/* S-10 step 2: the text index, inside the Durable Object, which is what probe 1 measured and chose. Five columns rather
   than one blob, so a member can scope a term to the part of the document they mean; `meta` carries the flattened
   frontmatter. A regular content table, not contentless (a contentless table cannot produce snippet()) and not external
   content (`body` spans every inline text file in the bundle); the cost is a second copy of the text, roughly 430 bytes
   per document.

   R33: `bundle_id` is an UNINDEXED column after the five, so the table is keyed to a bundle in record-core's purge form
   (its R46) and a bundle's purge removes its own row. UNINDEXED: no term matches it, and it is last, so every column
   number the compiler's `snippet()` and `highlight()` name is unchanged. */
export const FTS_SCHEMA = `CREATE VIRTUAL TABLE IF NOT EXISTS bundles_fts USING fts5(
         ${FTS_COLUMNS.join(", ")}, bundle_id UNINDEXED, tokenize='unicode61')`;

/* S-10 step 5: server-side selections.
 *
 * A selection is the FIRST thing in this store that is legitimately collectable. Everything else is append-only by
 * doctrine, and a sweep that deletes rows would read as a violation to anyone who did not know why, so the exception is
 * written here: a selection is DERIVED, it holds no assertion about the world, and losing one costs a member a click.
 *
 * Two kinds, because two different intents were wearing one word:
 *   query       the operator picked a CRITERION and said "all of these", so the current answer to the criterion is the
 *               correct set by definition. No items are stored at all: the query plus a digest of the ordered id list
 *               is O(1) and still detects drift exactly.
 *   enumerated  the operator picked SPECIFIC items. Membership is frozen, and items are stored with the sha each carried
 *               when it was picked, which is what makes revision drift a comparison.
 *
 * Collapsing the two would mean a large enumeration silently became a query at whatever size a storage cap sat, which
 * changes what the operator's click meant. So the cap on an enumeration is a REFUSAL, not a fallback (R18). */
export const SELECTION_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS selections (
         handle     TEXT PRIMARY KEY,
         owner      TEXT NOT NULL,
         kind       TEXT NOT NULL,
         q          TEXT NOT NULL,
         sort_field TEXT, sort_dir TEXT,
         created    TEXT NOT NULL,
         touched    TEXT NOT NULL,
         expires    TEXT NOT NULL,
         n          INTEGER NOT NULL,
         digest     TEXT NOT NULL
       )`,
  `CREATE INDEX IF NOT EXISTS selections_owner ON selections(owner)`,
  `CREATE INDEX IF NOT EXISTS selections_expires ON selections(expires)`,
  `CREATE TABLE IF NOT EXISTS selection_items (
         handle     TEXT NOT NULL,
         ord        INTEGER NOT NULL,
         bundle_id  TEXT NOT NULL,
         bundle_sha TEXT NOT NULL,
         PRIMARY KEY (handle, ord)
       )`,
];

/* MEASURED, and lower than SQLite's documented default by two orders of magnitude: workerd refuses a statement binding
   more than about 100 variables. Binary-searched on 2026-07-25, where the largest id list that compiled was 99, with the
   gate, ranking and limit arguments sharing the same budget. 64 leaves headroom for arguments a future CTE arm adds
   without silently reintroducing the failure. Every id list this module binds (a selection's chunks, R18, R19; the
   frontier's index-state read, D-390) is cut at it, and the selection tests cross the boundary on purpose. */
export const SELECTION_ID_CHUNK = 64;

/* R33 (K23): the tables this module declares to record-core's purge. The text index is keyed to its bundle by the
   `bundle_id` column above. The two selection tables are cleared only by the whole-store form: a per-bundle purge
   leaves an enumerated item in place, so the next resolve reports it as `drift.purged` (R19) rather than the item
   silently leaving the set. */
export const RETRIEVAL_PURGE = Object.freeze([
  { name: "bundles_fts", keys: ["bundle_id"] },
  { name: "selection_items", keys: [] },
  { name: "selections", keys: [] },
]);
