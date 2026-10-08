/* events: who recorded something from this passage (T36-14; R49; N715, DEC-164 (4)). `recordedBy` is the one shape of a
   read by capture and extent naming who recorded each row that cites it; `standards`, `money`, `people` and every read
   `retrieval` registers answer in it. Here the rows are a dated fact (R1), an attestation citing a capture extent (R7;
   an event's own, or a relation's citation, R17) and each passage a use of a power cites (R43, R44). Testimony cites no
   capture and is never an item. Sight is R40's: a hidden row is neither answered nor counted, and a capture not held or
   not visible answers no items, as an absent one. It writes nothing, never throws, and is no arm of R36. */
import { noSha } from "../extraction/index.mjs";
import { canonicalExtent, extentRelation, CONTENT_EXTENT_KINDS } from "../content/index.mjs";

export const RECORDED_LIMIT_DEFAULT = 100;
export const RECORDED_LIMIT_MAX = 500;
const RELATIONS = ["same", "narrower", "wider"];

const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const said = (v) => typeof v === "string" && v.trim() !== "";
const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, detail, ...extra });
/* K2116 (K231): the shape's own two refusals carry no catalogue row in any module reading in this shape. */
const refused = (code, why) => ({ ok: false, refused: code, code, reason: code, why });
const json = (s) => { try { return typeof s === "string" ? JSON.parse(s) : s; } catch { return null; } };
const clamp = (limit) => Math.max(1, Math.min(Math.trunc(Number(limit)) || RECORDED_LIMIT_DEFAULT, RECORDED_LIMIT_MAX));
const known = (e) => isObj(e) && typeof e.kind === "string" && Object.prototype.hasOwnProperty.call(CONTENT_EXTENT_KINDS, e.kind);

/* A held extent in content's canonical form, as its string and its object; one naming no part is `document` (content R5). */
function canon(held) {
  const e = json(held);
  const c = canonicalExtent(known(e) ? e : { kind: "document" });
  return { key: c, extent: JSON.parse(c) };
}

/** R49. `k` is the instance's kernel (index.mjs). */
export function recordedBy(k, args) {
  try {
    const a = isObj(args) ? args : {};
    if (a.viewer === undefined || a.viewer === null || a.viewer === "")
      return refused("VIEWER_MISSING", "a read names the member reading; an absent viewer is neither an administrator nor the public");
    if (!said(a.captureSha)) return noSha("who recorded something is read for one captured document, named by its capture sha256");
    let asked = null;
    if (a.extent !== undefined && a.extent !== null) {
      if (!known(a.extent))
        return refused("EXTENT_MALFORMED", `an extent is an object of one of the kinds ${Object.keys(CONTENT_EXTENT_KINDS).join(", ")}`);
      asked = JSON.parse(canonicalExtent(a.extent));
    }
    const sha = a.captureSha.trim().toLowerCase();
    const cap = clamp(a.limit);
    const answer = (items, truncated) => ({ ok: true, module: "events", capture_sha: sha, items, truncated });
    if (!k.heldCapture(sha, a.viewer)) return answer([], false);

    const seen = new Map();
    const sees = (bundleId) => {
      const key = bundleId ?? "\u0000";
      if (!seen.has(key)) seen.set(key, k.sees(bundleId, a.viewer));
      return seen.get(key);
    };
    const eventSeen = new Map();
    const eventVisible = (id) => {
      if (!eventSeen.has(id)) eventSeen.set(id, k.visibleAttestations(id, a.viewer).length > 0);
      return eventSeen.get(id);
    };
    const useWithdrawn = (id) => { const u = k.one(`SELECT withdrawn FROM event_uses WHERE event_id=?`, id); return !!(u && u.withdrawn); };

    const rows = [];
    const add = (r, held) => { const c = canon(held); rows.push({ ...r, key: c.key, extent: c.extent }); };

    /* dated facts (R1) */
    for (const f of k.rows(`SELECT dated_fact_id, extent, bundle_id, by_actor, at FROM dated_facts WHERE capture_sha=?`, sha))
      if (sees(f.bundle_id))
        add({ record: f.dated_fact_id, kind: "dated_fact", field: "extent", by: f.by_actor, at: f.at, withdrawn: false }, f.extent);

    /* attestations citing an extent of the capture (R7): an event's own, or a relation's citation (R17) */
    for (const x of k.rows(`SELECT attestation_id, event_id, serves, extent, bundle_id, by_actor, at FROM event_attestations
                            WHERE capture_sha=? ORDER BY attestation_id`, sha)) {
      if (!sees(x.bundle_id)) continue;
      if (x.serves === "relation") {
        const r = k.one(`SELECT relation_id, withdrawn_at FROM event_relations WHERE attestation_id=?`, x.attestation_id);
        if (!r) continue;
        add({ record: String(r.relation_id), kind: "relation", field: "attestation", by: x.by_actor, at: x.at,
              withdrawn: r.withdrawn_at != null }, x.extent);
      } else {
        const id = k.resolve(x.event_id);
        if (!id) continue;
        add({ record: id, kind: "attestation", field: "extent", by: x.by_actor, at: x.at, withdrawn: useWithdrawn(id) }, x.extent);
      }
    }

    /* the passages a use of a power cites (R43, R44), answered with its event in sight (R40) */
    const like = `%"capture_sha":"${sha}"%`;
    const cites = (raw) => { const c = json(raw); return isObj(c) && c.capture_sha === sha ? [c] : []; };
    const useItem = (u, field, c) => {
      const id = k.resolve(u.event_id);
      if (!id || !sees(c.bundle_id) || !eventVisible(id)) return;
      add({ record: id, kind: u.kind, field, by: u.by_actor, at: u.at, withdrawn: !!u.withdrawn }, c.extent);
    };
    for (const u of k.rows(`SELECT * FROM event_uses WHERE reason LIKE ? OR outcome_cite LIKE ? OR scope LIKE ? OR conditions LIKE ?
                            ORDER BY event_id`, like, like, like, like)) {
      for (const c of cites(u.reason)) useItem(u, "stated_reason", c);
      for (const c of cites(u.outcome_cite)) useItem(u, "outcome", c);
      for (const c of cites(u.scope)) useItem(u, "scope", c);
      for (const raw of json(u.conditions) || []) for (const c of cites(raw)) useItem(u, "conditions", c);
    }
    for (const n of k.rows(`SELECT n.cite, u.event_id, u.kind, u.by_actor, u.at, u.withdrawn FROM event_unmet n
                            JOIN event_uses u ON u.event_id = n.event_id WHERE n.cite LIKE ? ORDER BY n.unmet_id`, like))
      for (const c of cites(n.cite)) useItem(n, "unmet", c);

    /* the extent asked: rows whose extent is the same, lies inside it or holds it */
    const kept = [], once = new Set();
    for (const r of rows) {
      const relation = asked ? extentRelation(asked, r.extent) : null;
      if (asked && !RELATIONS.includes(relation)) continue;
      const item = { module: "events", record: r.record, kind: r.kind, field: r.field, extent: r.extent, relation,
                     by: r.by ?? null, at: r.at ?? null, withdrawn: r.withdrawn };
      const dup = JSON.stringify([r.key, item]);
      if (once.has(dup)) continue;
      once.add(dup);
      kept.push({ key: r.key, item });
    }
    const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
    kept.sort((p, q) => cmp(p.key, q.key) || cmp(p.item.record, q.item.record) || cmp(p.item.field, q.item.field));
    return answer(kept.slice(0, cap).map((x) => x.item), kept.length > cap);
  } catch (e) {
    return refuse("RECORDED_BY_UNREADABLE", String(e && e.message || e).slice(0, 200));
  }
}
