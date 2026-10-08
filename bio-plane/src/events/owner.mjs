/* events as a connection owner (R35; connection-grammar R2, R6–R9; K1469, K1470). Its kinds: took part (one per
   role), concerns, within and the five event links, each evidentiary (every one is cited). `neighbours` answers an
   entity's or an event's connections in connection-grammar's shape, each with its evidence and both grade axes, valid at
   the event's own time, through the viewer's sight (R40), from the indexes on `event_participants (entity_id)`,
   `event_relations (from_event)`, `(to_event)` and `event_concerns (end_id)`; a connection to a use of a power carries its
   facet (R45). A hub is judged per kind against `hubBoundOf(kind)` (T36-14). It writes nothing and logs no reader. */
import { validAt } from "../civil-time/index.mjs";
import { BOUNDS, LOWEST_GRADE, hubBoundOf } from "../connection-grammar/index.mjs";
import { BASIS_GRADES } from "../record-grammar/index.mjs";

const ROLE_WORDS = { actor: "acted in", organizer: "organised", mover: "moved", seconder: "seconded", voted: "voted in",
  present: "was present at", speaker: "spoke at", sender: "sent", recipient: "was sent", copied: "was copied on",
  signatory: "signed", decider: "decided", author: "wrote", implementer: "carried out", party: "was a party to",
  subject: "was the subject of" };
const LINK_WORDS = { authorises: "authorises", answers: "answers", amends: "amends", reverses: "reverses",
  stated_cause: "is stated by a source to cause", within: "took place within" };

export const OWNER_KINDS = Object.freeze([
  ...Object.entries(ROLE_WORDS).map(([role, word]) => ({ kind: `event_${role}`, word, class: "evidentiary" })),
  { kind: "event_concerns", word: "concerns", class: "evidentiary" },
  ...Object.entries(LINK_WORDS).map(([k, word]) => ({ kind: `event_${k}`, word, class: "evidentiary" })),
]);
const ALL = OWNER_KINDS.map((k) => k.kind);
const grade = (g) => (BASIS_GRADES.includes(g) ? g : LOWEST_GRADE);
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);

/* The validity of a connection: the event's own time (from and to its when), or unstated when it has none. */
function validOf(w, zone) {
  if (!w || w === "undetermined" || !w.zone || w.precision === "upper_bound")
    return { from: null, to: null, precision: "day", zone: (w && w.zone) || zone || "UTC" };
  return { from: w.value, to: w.value, precision: w.precision, zone: w.zone };
}
const marks = (xs) => xs.map(() => "?").join(",");

/** R35. A page costs its slice (T36-14, K2119): the node's set is first read as candidates (kind, event, the attestation's
 *  sight) in a few queries, each event's time read in bulk, so every kind's set is counted and judged against its own
 *  hub bound (`hubBoundOf`); grades, evidence and a use's facet are built only for the rows of the page asked. */
export function neighboursOf(k, args) {
  const a = isObj(args) ? args : {};
  if (a.viewer === undefined || a.viewer === null || a.viewer === "")
    return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
  const node = typeof a.node === "string" ? a.node : "";
  const kinds = Array.isArray(a.kinds) ? a.kinds.filter((x) => ALL.includes(x)) : ALL;
  const isEvent = /^EVT-/.test(node);
  const seen = new Map();
  const sees = (bundleId) => { const key = bundleId ?? "\u0000"; if (!seen.has(key)) seen.set(key, k.sees(bundleId, a.viewer)); return seen.get(key); };
  const view = k.view(), zone = k.zone();

  /* 1. the candidates, in the order the set is paged: took part, concerns, then within and the five links */
  const cands = [];
  const roles = kinds.filter((x) => x.startsWith("event_") && ROLE_WORDS[x.slice(6)]).map((x) => x.slice(6));
  if (roles.length)
    for (const p of k.rows(`SELECT p.participant_id, p.event_id, p.entity_id, p.role, p.attestation_id, x.bundle_id
                            FROM event_participants p JOIN events e ON e.event_id = p.event_id AND e.alias_of IS NULL
                            JOIN event_attestations x ON x.attestation_id = p.attestation_id
                            WHERE p.${isEvent ? "event_id" : "entity_id"} = ? AND p.superseded_by IS NULL AND p.role IN (${marks(roles)})
                            ORDER BY p.participant_id`, node, ...roles))
      if (sees(p.bundle_id)) cands.push({ type: "part", kind: `event_${p.role}`, eventId: p.event_id, row: p });
  if (kinds.includes("event_concerns")) {
    const cs = k.rows(`SELECT c.event_id, c.end_id FROM event_concerns c JOIN events e ON e.event_id = c.event_id AND e.alias_of IS NULL
                       WHERE ${isEvent ? "c.event_id = ? OR c.end_id = ?" : "c.end_id = ?"} ORDER BY c.event_id, c.end_id`, ...(isEvent ? [node, node] : [node]));
    /* each concerning event's first visible attestation, read for all of them at once */
    const first = new Map(), evs = [...new Set(cs.map((c) => c.event_id))];
    for (let i = 0; i < evs.length; i += 400) {
      const part = evs.slice(i, i + 400);
      for (const x of k.rows(`SELECT * FROM event_attestations WHERE event_id IN (${marks(part)}) AND serves='event' ORDER BY attestation_id`, ...part))
        if (!first.has(x.event_id) && sees(x.bundle_id)) first.set(x.event_id, x);
    }
    for (const c of cs) if (first.has(c.event_id)) cands.push({ type: "concerns", kind: "event_concerns", eventId: c.event_id, row: c, att: first.get(c.event_id) });
  }
  const links = kinds.filter((x) => LINK_WORDS[x.slice(6)]).map((x) => x.slice(6));
  if (isEvent && links.length)
    for (const r of k.rows(`SELECT r.*, x.bundle_id FROM event_relations r JOIN event_attestations x ON x.attestation_id = r.attestation_id
                            WHERE (r.from_event = ? OR r.to_event = ?) AND r.withdrawn_at IS NULL AND r.kind IN (${marks(links)})
                            ORDER BY r.relation_id`, node, node, ...links))
      if (sees(r.bundle_id)) cands.push({ type: "link", kind: `event_${r.kind}`, eventId: r.from_event, row: r });

  /* 2. each candidate's validity at `at`, from its event's time read in bulk; one out at `at` is no connection */
  const whens = k.whensRead(cands.map((c) => c.eventId));
  const live = [];
  for (const c of cands) {
    const valid = validOf(whens.get(c.eventId).when, zone);
    let v;
    try { v = validAt({ valid, basis: null }, a.at, { view }); } catch (e) { v = { undetermined: true, why: String(e && e.message || e) }; }
    if (v !== "out") live.push({ ...c, valid, v });
  }

  /* 3. R35 (connection-grammar R6, R10; K2079): a hub is judged per kind, each kind against its own bound */
  const perKind = new Map();
  for (const c of live) perKind.set(c.kind, (perKind.get(c.kind) || 0) + 1);
  const over = [...perKind].filter(([kind, n]) => n > hubBoundOf(kind)).sort((p, q) => (p[0] < q[0] ? -1 : 1))[0];
  if (over)
    return { items: [], hub: { set_size: over[1], why: `this node has ${over[1]} connections of the kind ${over[0]}, more than that kind's bound of ${hubBoundOf(over[0])}; it is named, never expanded` } };

  /* 4. the page: grades, evidence and facets for its rows only */
  const start = Number.isInteger(a.page) && a.page > 0 ? a.page : 0;
  const page = live.slice(start, start + BOUNDS.fanout);
  const att = (id) => k.one(`SELECT * FROM event_attestations WHERE attestation_id=?`, id);
  const ends = new Set();
  for (const c of page) { ends.add(c.eventId); if (c.type === "concerns" && /^EVT-/.test(c.row.end_id)) ends.add(c.row.end_id);
                          if (c.type === "link") ends.add(c.row.to_event); }
  const gov = k.governingMany([...ends]);
  const evMemo = new Map();
  const evGrade = (eventId) => {
    if (!evMemo.has(eventId)) {
      const g = gov.has(eventId) ? gov.get(eventId) : k.governing(eventId);
      const v = g ? null : k.visibleAttestations(eventId, a.viewer)[0];
      evMemo.set(eventId, g ? g.grade : v ? v.grade : null);
    }
    return evMemo.get(eventId);
  };
  const resMemo = new Map();
  const resolution = (entityId, x) => {
    const key = `${entityId}\u0000${x.capture_sha ?? ""}`;
    if (!resMemo.has(key)) resMemo.set(key, k.resolutionGrade(entityId, x));
    return resMemo.get(key);
  };
  const kindMemo = new Map();
  const useOf = (eventId) => {
    if (!kindMemo.has(eventId)) { const e = k.one(`SELECT kind FROM events WHERE event_id=?`, eventId); kindMemo.set(eventId, e ? e.kind : null); }
    return ["discretion", "waiver", "assessment"].includes(kindMemo.get(eventId)) ? k.facet(eventId, a.viewer) : null;
  };
  const evidence = (x) => [{ source: x.capture_sha ? `capture:${x.capture_sha}` : `testimony:${x.attestation_id}`,
                             ...(x.extent ? { extent: JSON.parse(x.extent) } : {}) }];
  const items = page.map((c) => {
    let conn;
    if (c.type === "part") {
      const p = c.row, x = att(p.attestation_id);
      conn = { id: `events:${c.kind}:${p.participant_id}`, from: p.entity_id, to: p.event_id, kind: c.kind, evidence: evidence(x),
               grade: { assertion: grade(x.grade), ends: [grade(resolution(p.entity_id, x)), grade(evGrade(p.event_id))] } };
    } else if (c.type === "concerns") {
      const x = c.att, e = c.row;
      conn = { id: `events:event_concerns:${e.event_id}:${e.end_id}`, from: e.event_id, to: e.end_id, kind: "event_concerns", evidence: evidence(x),
               grade: { assertion: grade(x.grade), ends: [grade(evGrade(e.event_id)), grade(/^EVT-/.test(e.end_id) ? evGrade(e.end_id) : x.grade)] } };
    } else {
      const r = c.row, x = att(r.attestation_id);
      conn = { id: `events:${c.kind}:${r.relation_id}`, from: r.from_event, to: r.to_event, kind: c.kind, evidence: evidence(x),
               grade: { assertion: grade(x.grade), ends: [grade(evGrade(r.from_event)), grade(evGrade(r.to_event))] } };
    }
    /* R45: a connection to a use of a power carries the use's facet */
    const use = useOf(c.eventId);
    return { ...conn, owner: "events", valid: c.valid, derived: null, ...(use ? { use } : {}),
             ...(c.v === "in" ? {} : { undetermined: { why: c.v && c.v.why ? c.v.why : "undetermined at the date asked" } }) };
  });
  return { items, ...(start + BOUNDS.fanout < live.length ? { next: start + BOUNDS.fanout } : {}) };
}
