/* connections — the connection owner (R62–R65; T33-29, B1a.6, K1470, K1486): co-mention presented in
 * `connection-grammar`'s one shape as the derived kind `mentioned_together` ("mentioned together"), so `explore` walks
 * it through the one registry. Each item is one of R1's derived connections (R59's rows) between two documents through
 * one entity. The read reads and never derives: a node whose entity was never derived answers what is held.
 *
 * Read with BOB's question J1 (T33): an undated kind has no item `in` or `out` at a date, so every item is marked
 * undetermined; an entity over the co-mention hub threshold is named in `hubs`, apart from `hub`, which keeps
 * `connection-grammar`'s meaning (the node's own set over `BOUNDS.hub`, with no items); one item per (document pair,
 * entity), its id `derivedId` of the pair in sorted order, the derivation time and the pair rule through the entity;
 * a capped derivation is read from `connection_derivations` (R64). */
import { BOUNDS, derivedId } from "../connection-grammar/index.mjs";

/** R62: the owner, its one kind, the members' word (K1486) and its class. */
export const MENTIONED_OWNER = "connections";
export const MENTIONED_KIND = "mentioned_together";
export const MENTIONED_KINDS = Object.freeze([Object.freeze({ kind: MENTIONED_KIND, word: "mentioned together", class: "derived" })]);
/** R65 (X110; legistar-events §6, M-P4): an entity concerned by more than this many documents is a co-mention hub;
 *  it is R2's document bound at the default pair limit (32 documents, 496 pairs). */
export const CO_MENTION_HUB = 32;
/** R65: the warn band's floor (connection-grammar's 250–1,000): a set this large is answered whole, its size stated. */
export const WARN_BAND = 250;

/* A co-mention states no dates (R63): `valid` unstated. The zone names no place (R37); with no bound stated it is
   never read. */
const VALID = Object.freeze({ from: null, to: null, precision: "day", zone: "UTC" });
const UNDATED = "a co-mention states no dates: when the two documents came to concern the same subject is not "
  + "stated, so whether this connection holds at the date asked is undetermined, never out";

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** The pair rule an item states as its method, through its entity (J1 (3)). */
export function mentionedMethod(pairRule, entityId) {
  return `${pairRule || "strongest-graded/scan-order (derived before the tie-break was recorded)"} through ${entityId}`;
}

/**
 * R63–R65: `neighbours({node, kinds, at, page, viewer, scope})` for `node` a bundle id, over `k`, one connections
 * instance; `positionOf(row, side)` reads an end's recorded position. `at` and `scope` change nothing: the kind is
 * undated and holds no hunch. Synchronous; writes nothing.
 */
export function mentionedNeighbours(k, args, { positionOf = () => null } = {}) {
  const a = isObj(args) ? args : {};
  const { node, kinds, page, viewer } = a;
  /* connection-grammar R7: a read names its viewer; an absent one is neither an administrator nor the public. */
  if (viewer === undefined || viewer === null || viewer === "")
    return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
  if (Array.isArray(kinds) && !kinds.includes(MENTIONED_KIND)) return { items: [] };
  /* R33: a node the viewer may not see answers as one the record does not hold. */
  if (typeof node !== "string" || !node || !k.sees(node, viewer)) return { items: [] };
  const keep = k.redactor(viewer);
  const rows = [...k.sql.exec(
    `SELECT * FROM connections WHERE (a_bundle_id = ? OR b_bundle_id = ?) AND a_bundle_id <> b_bundle_id
      ORDER BY entity_id, a_capture_sha, b_capture_sha`, node, node)]
    .filter((r) => keep(r.a_bundle_id === node ? r.b_bundle_id : r.a_bundle_id));

  /* R65: each entity's set, counted over the documents the viewer may see, so a hidden one neither shows nor moves
     the answer (R33; connection-grammar R7). */
  const entityIds = [...new Set(rows.map((r) => r.entity_id))];
  const hubs = [], through = new Map();
  for (const e of entityIds) {
    const size = k.visibleCaptureCount(e, viewer);
    if (size > CO_MENTION_HUB) {
      hubs.push({ entity: e, set_size: size,
                  why: `${size} documents you can see concern ${e}, more than ${CO_MENTION_HUB}, so being mentioned `
                     + `together through it says little; its co-mentions are not listed, and a walk can step around it` });
      continue;
    }
    const d = k.lastDerivation(e);
    through.set(e, d);
  }

  /* One item per (document pair, entity): the strongest row, ties by the capture digests (J1 (3)). */
  const best = new Map();
  for (const r of rows) {
    if (!through.has(r.entity_id)) continue;
    const other = r.a_bundle_id === node ? r.b_bundle_id : r.a_bundle_id;
    const key = `${other}\u0000${r.entity_id}`;
    const held = best.get(key);
    if (!held || k.rankOf(r.grade) > k.rankOf(held.grade)) best.set(key, r);
  }
  const items = [...best.values()].map((r) => item(r, through.get(r.entity_id), positionOf)).sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));

  const bounds = [];
  for (const [e, d] of [...through.entries()].sort(([x], [y]) => (x < y ? -1 : 1)))
    if (d && d.truncated && items.some((i) => i.derived.inputs[0].entity === e))
      bounds.push({ entity: e, documents: d.documents, document_limit: d.document_limit,
                    resolution_rows: d.resolution_rows, pair_limit: d.pair_limit, why: cappedWhy(e, d) });
  const extra = { ...(hubs.length ? { hubs: hubs.sort((x, y) => (x.entity < y.entity ? -1 : 1)) } : {}),
                  ...(bounds.length ? { truncated: true, bounds } : {}) };

  /* connection-grammar R6: a node whose set exceeds the hub bound is answered by its size, with no items. */
  if (items.length > BOUNDS.hub)
    return { items: [], hub: { set_size: items.length,
             why: `this document is mentioned together with ${items.length} others, more than ${BOUNDS.hub}; it is named, `
                + `never expanded` }, ...extra };

  const after = isObj(page) && typeof page.after === "string" ? page.after : null;
  const rest = after ? items.filter((i) => i.id > after) : items;
  const shown = rest.slice(0, BOUNDS.fanout);
  const more = rest.length > shown.length;
  return { items: shown, ...(more ? { next: { after: shown[shown.length - 1].id } } : {}), ...extra,
           ...(items.length >= WARN_BAND
             ? { set_size: items.length,
                 says: `this document is mentioned together with ${items.length} others; the set is answered whole` }
             : {}) };
}

function cappedWhy(e, d) {
  return `${e}'s last derivation stopped at its bound: it paired ${d.documents} documents (at most ${d.document_limit} `
    + `for ${d.pair_limit} pairs) and read ${d.resolution_rows} resolution rows, so documents beyond the bound are not `
    + `connected here and this set is not the whole`;
}

/* One row as the shape (R63): the two documents in sorted order, so either end gives the same id. */
function item(r, d, positionOf) {
  const aFirst = r.a_bundle_id < r.b_bundle_id;
  const end = (side) => ({ bundle: r[`${side}_bundle_id`], capture: r[`${side}_capture_sha`], ref: r[`${side}_ref`] ?? null,
                           grade: r[`${side}_grade`], position: positionOf(r, side) });
  const [f, t] = aFirst ? [end("a"), end("b")] : [end("b"), end("a")];
  const method = mentionedMethod(r.pair_rule, r.entity_id);
  const asOf = typeof r.at === "string" && r.at ? r.at : "unrecorded";
  const id = derivedId({ kind: MENTIONED_KIND, from: f.bundle, to: t.bundle, as_of: asOf, method });
  return {
    id, from: f.bundle, to: t.bundle, kind: MENTIONED_KIND, owner: MENTIONED_OWNER, valid: { ...VALID },
    evidence: [f, t].map((x) => ({ source: x.bundle, capture: x.capture, ref: x.ref, position: x.position })),
    grade: { assertion: r.grade, ends: [f.grade, t.grade] },
    derived: { method, as_of: asOf,
               inputs: [{ entity: r.entity_id }, ...[f, t].map((x) => ({ end: x.bundle, capture: x.capture, ref: x.ref }))] },
    established: !!r.established, asserted_by: r.asserted_by, basis: r.basis,
    undetermined: { why: UNDATED },
    ...(d && d.truncated ? { truncated: true } : {}),
  };
}
