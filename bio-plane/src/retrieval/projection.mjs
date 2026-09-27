/* retrieval — the projection of one bundle.md (R2, R53), pure: no database, no clock of its own. */
import { parseFrontmatter, normalizeType } from "../../checks/bio-checks.mjs";

/* IC-24 / REC-59: the bound `op=projection`'s CORPUS arms apply (R5), NAMED rather than buried in the statement, on
   the same reasoning REC-57 applied to `op=exportlog`'s literal `LIMIT 200` — a cap nothing names is a cap the roster
   walk can only find by matching a number. `_MAX` is `op=list`'s ceiling, deliberately, because these two answer the
   same question about the same table and a second ceiling would be a second fact to keep in step. */
export const PROJECTION_LIMIT_DEFAULT = 200;
export const PROJECTION_LIMIT_MAX = 5000;

/* The columns R2 derives, in the order the writer sets them; `fts_id` is the text index's key and not derived. */
export const PROJECTION_COLS = Object.freeze([
  "schema_id", "produced_mode", "capability_tier", "source_locator",
  "source_authority", "source_retrieved", "source_status", "content_hash",
  "monitor_enabled", "monitor_frequency", "monitor_last_checked",
  "annotations_open", "reeval_flag", "reeval_since", "reeval_source",
  "action_kind", "action_risk_tier", "action_counterparty_state",
  "action_resolution", "action_clock_next", "action_clock_overdue", "fm_json",
]);

/* R53: the six action columns and the fact each is read from, as `actions.actionFacts` answers them (actions R12). */
const ACTION_FACTS = Object.freeze([
  ["action_kind", "kind"], ["action_risk_tier", "risk_tier"], ["action_counterparty_state", "counterparty_state"],
  ["action_resolution", "resolution"], ["action_clock_next", "clock_next"], ["action_clock_overdue", "clock_overdue"],
]);

const EMPTY = Object.freeze(Object.fromEntries(PROJECTION_COLS.map((c) => [c, null])));

/** R2, R53: the projection derived from a bundle.md, using the CATALOGUE'S OWN parser so the store's view and the
 *  checker's view cannot disagree about what the document says. Returns nulls rather than guesses when frontmatter
 *  does not parse: a wrong value in a filterable column is worse than an absent one, because a filter silently
 *  under-reports and the member cannot tell.
 *
 *  `actionFacts(bundleMd, nowMs)` is what `actions` registered (R53); this module holds no copy of the clock rule.
 *  Only a bundle whose type normalises to `action` asks it (D-526: through the catalogue's `normalizeType`, the one
 *  membership question every other type test asks, never the raw key). With nothing registered, or a provider that
 *  throws or answers nothing, the six columns are null. `nowMs` is threaded rather than read from a wall clock so a
 *  suite that pins the clock pins the cached flag too; the flag is still a CACHE, and the answer a reader is shown is
 *  derived on read by `actions`. */
export function projectionOf(bundleMdText, nowMs = Date.now(), actionFacts = null) {
  if (typeof bundleMdText !== "string") return { ...EMPTY };
  let fm = null;
  try { fm = parseFrontmatter(bundleMdText).data; } catch { return { ...EMPTY }; }
  if (!fm || typeof fm !== "object") return { ...EMPTY };
  const s = (v) => (typeof v === "string" && v !== "" ? v : v === 0 ? "0" : v == null ? null : String(v));
  const nested = (block, key) => {
    const b = fm[block];
    return b && typeof b === "object" && !Array.isArray(b) ? b[key] : undefined;
  };
  const bool = (v) => (v === true ? 1 : v === false ? 0 : null);
  const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  /* reeval_pending is a {flag, since, source} record, but the catalog also tolerates a legacy boolean, so both shapes
     are read rather than one assumed. */
  const rp = fm.reeval_pending;
  const rpObj = rp && typeof rp === "object" && !Array.isArray(rp);
  let facts = null;
  if (normalizeType(fm.object_type) === "action" && typeof actionFacts === "function") {
    try { facts = actionFacts(bundleMdText, nowMs); } catch { facts = null; }
    if (!facts || typeof facts !== "object") facts = null;
  }
  const action = Object.fromEntries(ACTION_FACTS.map(([col, key]) => {
    const v = facts ? facts[key] : null;
    if (col === "action_clock_overdue") return [col, v === true || v === 1 ? 1 : v === false || v === 0 ? 0 : null];
    if (col === "action_risk_tier") return [col, num(v)];
    return [col, s(v)];
  }));
  return {
    schema_id: s(fm.schema),
    produced_mode: s(nested("produced_by", "mode")),
    capability_tier: s(nested("produced_by", "capability_tier")),
    source_locator: s(nested("source", "locator")),
    source_authority: s(nested("source", "authority")),
    source_retrieved: s(nested("source", "retrieved")),
    source_status: s(fm.source_status),
    content_hash: s(fm.content_hash),
    monitor_enabled: bool(nested("monitoring", "enabled")),
    monitor_frequency: s(nested("monitoring", "frequency")),
    monitor_last_checked: s(nested("monitoring", "last_checked")),
    annotations_open: num(fm.annotations_open),
    reeval_flag: rpObj ? bool(rp.flag) : bool(rp),
    reeval_since: rpObj ? s(rp.since) : null,
    reeval_source: rpObj ? s(rp.source) : null,
    ...action,
    fm_json: JSON.stringify(fm),
  };
}
