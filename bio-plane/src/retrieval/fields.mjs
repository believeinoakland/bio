/* retrieval — the T33 fields' relations (R68, T33-40): for each field of `query-language`'s R28, the relation every
 * compile names to it (its R26, R29), `{table, key: "bundle_id", col: "value"}`.
 *
 * Two routes, R68's two. A field an owner's stated read contract supplies is a VIEW of this module's own over that
 * contract, joined to the bundle the row rests on; a view stores nothing, so it is never stale, needs no write in the
 * promotion and nothing for `reproject` to rebuild (R30 holds of it trivially). A field no contract supplies, but whose
 * owner answers it by a rule of its own (a one-home read: `standards.standardsFor`, `lines.holderAt`), is projected
 * here: `bundle_terms`, one row per value, written in the promotion's transaction from the provider the composition
 * root hands this module, and rebuilt by `reproject` with the rest of the projection. A field neither route supplies
 * is named to no relation, and `query-language` drops it with its warning (its R29).
 *
 * A bundle holds any number of values of one field (a document concerns many people). The compiler's filter on a
 * relation is `key IN (SELECT key FROM table WHERE col …)` (its R26), which reads a many-valued relation exactly;
 * these relations are not R62's registrations, whose tables hold one row per bundle.
 *
 * A view is created only when every table and column it reads exists (`needs`), so an owner not yet built leaves its
 * fields unavailable rather than a search failing; until then `searchFields` says so (R16). */

/* The prefix of every view this module creates; the rest is the field's name. */
export const FIELD_VIEW_PREFIX = "retrieval_field_";

/* R68's projection table: one row per (bundle, field, value). */
export const TERMS_TABLE = "bundle_terms";
export const TERMS_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS ${TERMS_TABLE} (
         bundle_id TEXT NOT NULL,
         field     TEXT NOT NULL,
         value     TEXT NOT NULL,
         PRIMARY KEY (bundle_id, field, value)
       )`,
  `CREATE INDEX IF NOT EXISTS ${TERMS_TABLE}_value ON ${TERMS_TABLE}(field, value)`,
];

/* The fields projected here, each answered by its owner's rule through a provider (`terms` in `retrievalOf`'s deps):
   `standard` by `standards.standardsFor` (its R21: the standards a bundle's readings cite), `holder` by
   `lines.holderAt` (its R18: `holderAt` has one home, so no view here computes it). */
export const TERM_FIELDS = Object.freeze(["standard", "holder"]);

/* Each field's relation as a view: `needs` the tables and columns it reads (the owner's stated read contract, R68),
   `sql` the view's body, answering `bundle_id` and `value`. Field names and closed words only: no member input. */
const viaTerms = (field) => ({ field, route: "projected", owner: "retrieval",
  needs: { [TERMS_TABLE]: ["bundle_id", "field", "value"] },
  sql: `SELECT bundle_id, value FROM ${TERMS_TABLE} WHERE field = '${field}'` });
/* A bundle and the captures it registers (provenance's `register`, its R48). */
const viaCapture = (field, owner, needs, select) => ({ field, route: "read contract", owner,
  needs: { register: ["capture_sha", "bundle_id"], ...needs }, sql: select });
/* An entity of one kind a bundle's captures resolve to (entities R35, K1563: `entities.kind`; the `concerns:` arm's
   relation). */
const entityOf = (field, kind) => ({ field, route: "read contract", owner: "entities",
  needs: { resolutions: ["bundle_id", "entity_id"], entities: ["entity_id", "kind"] },
  sql: `SELECT DISTINCT r.bundle_id AS bundle_id, r.entity_id AS value FROM resolutions r
          JOIN entities e ON e.entity_id = r.entity_id WHERE e.kind = '${kind}'` });
/* A column of the money facts a bundle's captures are the source of (money R19, K1563: `source_capture_sha`), a
   withdrawn fact left out. */
const moneyOf = (field, cols) => viaCapture(field, "money",
  { money_facts: ["fact_id", "source_capture_sha", ...cols], money_withdrawals: ["fact_id"] },
  cols.map((c) => `SELECT g.bundle_id AS bundle_id, f.${c} AS value FROM money_facts f
                     JOIN register g ON g.capture_sha = f.source_capture_sha
                    WHERE f.${c} IS NOT NULL AND f.fact_id NOT IN (SELECT fact_id FROM money_withdrawals)`).join(" UNION "));
/* A party of the duties arising in a bundle's captures (duties R20, K1563: `arising_in`). */
const dutyOf = (field, col) => viaCapture(field, "duties", { duties: ["duty_id", "arising_in", col] },
  `SELECT DISTINCT g.bundle_id AS bundle_id, d.${col} AS value FROM duties d
     JOIN register g ON g.capture_sha = d.arising_in WHERE d.${col} IS NOT NULL`);

export const FIELD_VIEWS = Object.freeze([
  /* extraction's `reading_refs` (its map §3): what a bundle's readings cite, as read and as recognised. */
  { field: "cites", route: "read contract", owner: "extraction", needs: { reading_refs: ["bundle_id", "ref", "ref_key"] },
    sql: `SELECT bundle_id, ref AS value FROM reading_refs
          UNION SELECT bundle_id, ref_key AS value FROM reading_refs WHERE ref_key IS NOT NULL AND ref_key <> ''` },
  entityOf("person", "person"),
  entityOf("post", "office"),
  /* events R37 (K1563): an event a bundle's captures attest (`event_attestations`), and that event's `when` (its start,
     `when_cache`). */
  viaCapture("event", "events", { event_attestations: ["event_id", "capture_sha"] },
    `SELECT DISTINCT g.bundle_id AS bundle_id, a.event_id AS value FROM event_attestations a
       JOIN register g ON g.capture_sha = a.capture_sha`),
  viaCapture("occurred", "events", { event_attestations: ["event_id", "capture_sha"], when_cache: ["event_id", "start"] },
    `SELECT DISTINCT g.bundle_id AS bundle_id, w.start AS value FROM event_attestations a
       JOIN register g ON g.capture_sha = a.capture_sha
       JOIN when_cache w ON w.event_id = a.event_id WHERE w.start IS NOT NULL`),
  moneyOf("kind", ["kind"]),
  moneyOf("phase", ["phase"]),
  moneyOf("stage", ["stage"]),
  moneyOf("basis", ["basis"]),
  moneyOf("period", ["period_from", "period_to"]),
  moneyOf("fund", ["from_fund", "to_fund"]),
  moneyOf("party", ["from_entity", "to_entity"]),
  dutyOf("obligor", "obligor"),
  dutyOf("owed_to", "obligee"),
  ...TERM_FIELDS.map(viaTerms),
]);

/* The relation a live view is named to `query-language` as. */
export const fieldRelation = (field) => Object.freeze({ table: FIELD_VIEW_PREFIX + field, key: "bundle_id", col: "value" });

/** R68: one bundle's projected values, `{field: [value, …]}` → rows `{bundle_id, field, value}`, each value a
 *  non-empty string, once; a provider that throws or answers anything but a list gives none for its field. */
export function termRows(bundleId, providers, input) {
  const out = [], seen = new Set();
  for (const field of TERM_FIELDS) {
    const fn = providers ? providers[field] : null;
    if (typeof fn !== "function") continue;
    let vals;
    try { vals = fn(input); } catch { vals = null; }
    if (!Array.isArray(vals)) continue;
    for (const v of vals) {
      if (typeof v !== "string" || v === "") continue;
      const k = `${field}\u0000${v}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ bundle_id: bundleId, field, value: v });
    }
  }
  return out;
}
