/* events as a connection owner (R35; connection-grammar R2, R6–R9; K1469, K1470). Its kinds: took part (one per
   role), concerns, within and the five event links, each evidentiary (every one is cited). `neighbours` answers an
   entity's or an event's connections in connection-grammar's shape, each with its evidence and both grade axes, valid at
   the event's own time, through the viewer's sight (R40), from the indexes on `event_participants (entity_id)`,
   `event_relations (from_event)`, `(to_event)` and `event_concerns (end_id)`; a connection to a use of a power carries its
   facet (R45). A hub is judged per kind against `hubBoundOf(kind)` (T36-14). It writes nothing and logs no reader.
   A page's other ends are read in pages too (T37-11): the events a page names are answered together, in a few queries,
   the first time a walk asks one of them, and every answer is kept only while the store is unchanged. */
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
const isEvt = (n) => /^EVT-/.test(n);
/* `q(part)` over `ids` in slices of 400 bound values, the rows joined. */
function inSlices(ids, q) {
  const out = [];
  for (let i = 0; i < ids.length; i += 400) out.push(...q(ids.slice(i, i + 400)));
  return out;
}

/** R35. A page costs its slice (T36-14, K2119): a node's set is first read as candidates (kind, event, the attestation's
 *  sight) in a few queries, each event's time read in bulk, so every kind's set is counted and judged against its own
 *  hub bound (`hubBoundOf`); grades, evidence and a use's facet are built only for the rows of the page asked.
 *  (T37-11) A walk reads a hub's page and then asks each event on it in turn: the events a page names are kept as one
 *  batch, and the first of them asked is answered with the whole batch, in the same few queries as one node. Answers
 *  and paged sets are kept only while `k.kept()` answers the same store (unchanged since, and outside any transaction);
 *  each answer equals the one the node asked alone would get, and is handed out as a copy. */
export function neighboursOf(k, args) {
  const a = isObj(args) ? args : {};
  if (a.viewer === undefined || a.viewer === null || a.viewer === "")
    return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
  const node = typeof a.node === "string" ? a.node : "";
  const kinds = Array.isArray(a.kinds) ? a.kinds.filter((x) => ALL.includes(x)) : ALL;
  const start = Number.isInteger(a.page) && a.page > 0 ? a.page : 0;
  const ctx = { kinds, at: a.at, viewer: a.viewer, view: k.view(), zone: k.zone() };
  const kept = typeof k.kept === "function" ? k.kept() : null;
  if (!kept) return answersFor(k, [node], ctx, start, null).get(node);
  const asked = JSON.stringify([kinds, a.at ?? null, a.viewer, ctx.zone]);
  const key = (n, p) => `${asked}\u0000${n}\u0000${p}`;
  if (!kept.answers.has(key(node, start))) {
    const batch = start === 0 && kept.pending.get(node);
    const nodes = batch && batch.asked === asked ? batch.nodes.filter((n) => !kept.answers.has(key(n, 0))) : [node];
    for (const n of nodes) kept.pending.delete(n);
    if (!nodes.includes(node)) nodes.push(node);
    const got = answersFor(k, nodes, ctx, start, { sets: kept.sets, asked });
    for (const [n, ans] of got) {
      kept.answers.set(key(n, start), ans);
      /* the events this page names, asked together the first time a walk asks one of them */
      const ends = [...new Set((ans.items || []).flatMap((i) => [i.from, i.to]).filter((e) => e !== n && isEvt(e) && !kept.answers.has(key(e, 0))))];
      if (ends.length > 1) { const b = { asked, nodes: ends }; for (const e of ends) if (!kept.pending.has(e)) kept.pending.set(e, b); }
    }
  }
  return structuredClone(kept.answers.get(key(node, start)));
}

/* The answers for `nodes` at page `start`, each as the node asked alone gets it. `keep`, when given, holds the paged
   sets (a set longer than one page, read once for all its pages). */
function answersFor(k, nodes, ctx, start, keep) {
  const sets = new Map(), fresh = [];
  for (const n of nodes) {
    const s = keep && keep.sets.get(`${keep.asked}\u0000${n}`);
    if (s) sets.set(n, s); else fresh.push(n);
  }
  for (const [n, s] of liveSets(k, fresh, ctx)) {
    sets.set(n, s);
    if (keep && s.length > BOUNDS.fanout) keep.sets.set(`${keep.asked}\u0000${n}`, s);
  }
  const out = new Map(), pages = [];
  for (const n of nodes) {
    const live = sets.get(n);
    /* R35 (connection-grammar R6, R10; K2079): a hub is judged per kind, each kind against its own bound */
    const perKind = new Map();
    for (const c of live) perKind.set(c.kind, (perKind.get(c.kind) || 0) + 1);
    const over = [...perKind].filter(([kind, x]) => x > hubBoundOf(kind)).sort((p, q) => (p[0] < q[0] ? -1 : 1))[0];
    if (over) {
      out.set(n, { items: [], hub: { set_size: over[1], why: `this node has ${over[1]} connections of the kind ${over[0]}, more than that kind's bound of ${hubBoundOf(over[0])}; it is named, never expanded` } });
      continue;
    }
    pages.push([n, live.slice(start, start + BOUNDS.fanout), live.length]);
  }
  const build = builder(k, pages.flatMap((p) => p[1]), ctx);
  for (const [n, page, size] of pages)
    out.set(n, { items: page.map(build), ...(start + BOUNDS.fanout < size ? { next: start + BOUNDS.fanout } : {}) });
  return out;
}

/* Each node's set: its candidates (kind, event, the attestation's sight) in the order the set is paged (took part,
   concerns, then within and the five links), each valid at `at`; one out at `at` is no connection. */
function liveSets(k, nodes, ctx) {
  const out = new Map(nodes.map((n) => [n, []]));
  if (!nodes.length) return out;
  const { kinds, viewer, view, zone } = ctx;
  const seen = new Map();
  const sees = (bundleId) => { const key = bundleId ?? "\u0000"; if (!seen.has(key)) seen.set(key, k.sees(bundleId, viewer)); return seen.get(key); };
  const evs = nodes.filter(isEvt), ents = nodes.filter((n) => !isEvt(n));
  const parts = new Map(nodes.map((n) => [n, []])), concerns = new Map(nodes.map((n) => [n, new Map()])), links = new Map(nodes.map((n) => [n, new Map()]));

  /* took part: an event node's participants, an entity node's events */
  const roles = kinds.filter((x) => x.startsWith("event_") && ROLE_WORDS[x.slice(6)]).map((x) => x.slice(6));
  if (roles.length)
    for (const [col, list] of [["event_id", evs], ["entity_id", ents]])
      for (const p of inSlices(list, (part) => k.rows(`SELECT p.participant_id, p.event_id, p.entity_id, p.role, p.attestation_id, x.bundle_id
                                  FROM event_participants p JOIN events e ON e.event_id = p.event_id AND e.alias_of IS NULL
                                  JOIN event_attestations x ON x.attestation_id = p.attestation_id
                                  WHERE p.${col} IN (${marks(part)}) AND p.superseded_by IS NULL AND p.role IN (${marks(roles)})
                                  ORDER BY p.participant_id`, ...part, ...roles)))
        if (sees(p.bundle_id)) parts.get(p[col]).push({ type: "part", kind: `event_${p.role}`, eventId: p.event_id, row: p });

  /* concerns: an event node's ends and the events concerning it; an entity node's events */
  if (kinds.includes("event_concerns")) {
    const q = (col, list) => inSlices(list, (part) => k.rows(`SELECT c.event_id, c.end_id FROM event_concerns c JOIN events e ON e.event_id = c.event_id
                                         AND e.alias_of IS NULL WHERE c.${col} IN (${marks(part)})`, ...part));
    const cs = [];
    for (const c of q("event_id", evs)) { cs.push(c); concerns.get(c.event_id).set(`${c.event_id}\u0000${c.end_id}`, c); }
    for (const c of q("end_id", nodes)) { cs.push(c); concerns.get(c.end_id).set(`${c.event_id}\u0000${c.end_id}`, c); }
    /* each concerning event's first visible attestation, read for all of them at once */
    const first = new Map(), ids = [...new Set(cs.map((c) => c.event_id))];
    for (const x of inSlices(ids, (part) => k.rows(`SELECT * FROM event_attestations WHERE event_id IN (${marks(part)}) AND serves='event' ORDER BY attestation_id`, ...part)))
      if (!first.has(x.event_id) && sees(x.bundle_id)) first.set(x.event_id, x);
    for (const [n, m] of concerns)
      concerns.set(n, [...m.values()].sort((p, q) => (p.event_id < q.event_id ? -1 : p.event_id > q.event_id ? 1 : p.end_id < q.end_id ? -1 : p.end_id > q.end_id ? 1 : 0))
        .filter((c) => first.has(c.event_id)).map((c) => ({ type: "concerns", kind: "event_concerns", eventId: c.event_id, row: c, att: first.get(c.event_id) })));
  }

  /* within and the five links, an event node's, from both ends */
  const ls = kinds.filter((x) => LINK_WORDS[x.slice(6)]).map((x) => x.slice(6));
  if (ls.length)
    for (const col of ["from_event", "to_event"])
      for (const r of inSlices(evs, (part) => k.rows(`SELECT r.*, x.bundle_id FROM event_relations r JOIN event_attestations x ON x.attestation_id = r.attestation_id
                                  WHERE r.${col} IN (${marks(part)}) AND r.withdrawn_at IS NULL AND r.kind IN (${marks(ls)})`, ...part, ...ls)))
        if (sees(r.bundle_id)) links.get(r[col]).set(Number(r.relation_id), { type: "link", kind: `event_${r.kind}`, eventId: r.from_event, row: r });

  /* each candidate's validity at `at`, from its event's time read in bulk */
  const cands = new Map(nodes.map((n) => [n, [...parts.get(n), ...(Array.isArray(concerns.get(n)) ? concerns.get(n) : []),
    ...[...links.get(n)].sort((p, q) => p[0] - q[0]).map((x) => x[1])]]));
  const whens = k.whensRead([...cands.values()].flatMap((cs) => cs.map((c) => c.eventId)));
  const at = new Map();
  for (const [n, cs] of cands)
    for (const c of cs) {
      const valid = validOf(whens.get(c.eventId).when, zone);
      const vk = JSON.stringify(valid);
      if (!at.has(vk)) {
        let v;
        try { v = validAt({ valid, basis: null }, ctx.at, { view }); } catch (e) { v = { undetermined: true, why: String(e && e.message || e) }; }
        at.set(vk, v);
      }
      const v = at.get(vk);
      if (v !== "out") out.get(n).push({ ...c, valid, v });
    }
  return out;
}

/* The connection each candidate of the pages asked makes: grades, evidence and facets read for those rows only, in bulk. */
function builder(k, rows, ctx) {
  const { viewer } = ctx;
  const attIds = [...new Set(rows.filter((c) => c.type !== "concerns").map((c) => Number(c.row.attestation_id)))];
  const atts = new Map(inSlices(attIds, (part) => k.rows(`SELECT * FROM event_attestations WHERE attestation_id IN (${marks(part)})`, ...part))
    .map((x) => [Number(x.attestation_id), x]));
  const ends = new Set();
  for (const c of rows) { ends.add(c.eventId); if (c.type === "concerns" && isEvt(c.row.end_id)) ends.add(c.row.end_id);
                          if (c.type === "link") ends.add(c.row.to_event); }
  const gov = k.governingMany([...ends]);
  const evMemo = new Map();
  const evGrade = (eventId) => {
    if (!evMemo.has(eventId)) {
      const g = gov.has(eventId) ? gov.get(eventId) : k.governing(eventId);
      const v = g ? null : k.visibleAttestations(eventId, viewer)[0];
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
  const evIds = [...new Set(rows.map((c) => c.eventId))];
  const kindOf = new Map(inSlices(evIds, (part) => k.rows(`SELECT event_id, kind FROM events WHERE event_id IN (${marks(part)})`, ...part)).map((e) => [e.event_id, e.kind]));
  const facets = new Map();
  /* R45: a connection to a use of a power carries the use's facet */
  const useOf = (eventId) => {
    if (!["discretion", "waiver", "assessment"].includes(kindOf.get(eventId))) return null;
    if (!facets.has(eventId)) facets.set(eventId, k.facet(eventId, viewer));
    return facets.get(eventId);
  };
  const att = (id) => atts.get(Number(id)) ?? k.one(`SELECT * FROM event_attestations WHERE attestation_id=?`, id);
  const evidence = (x) => [{ source: x.capture_sha ? `capture:${x.capture_sha}` : `testimony:${x.attestation_id}`,
                             ...(x.extent ? { extent: JSON.parse(x.extent) } : {}) }];
  return (c) => {
    let conn;
    if (c.type === "part") {
      const p = c.row, x = att(p.attestation_id);
      conn = { id: `events:${c.kind}:${p.participant_id}`, from: p.entity_id, to: p.event_id, kind: c.kind, evidence: evidence(x),
               grade: { assertion: grade(x.grade), ends: [grade(resolution(p.entity_id, x)), grade(evGrade(p.event_id))] } };
    } else if (c.type === "concerns") {
      const x = c.att, e = c.row;
      conn = { id: `events:event_concerns:${e.event_id}:${e.end_id}`, from: e.event_id, to: e.end_id, kind: "event_concerns", evidence: evidence(x),
               grade: { assertion: grade(x.grade), ends: [grade(evGrade(e.event_id)), grade(isEvt(e.end_id) ? evGrade(e.end_id) : x.grade)] } };
    } else {
      const r = c.row, x = att(r.attestation_id);
      conn = { id: `events:${c.kind}:${r.relation_id}`, from: r.from_event, to: r.to_event, kind: c.kind, evidence: evidence(x),
               grade: { assertion: grade(x.grade), ends: [grade(evGrade(r.from_event)), grade(evGrade(r.to_event))] } };
    }
    const use = useOf(c.eventId);
    return { ...conn, owner: "events", valid: c.valid, derived: null, ...(use ? { use: structuredClone(use) } : {}),
             ...(c.v === "in" ? {} : { undetermined: { why: c.v && c.v.why ? c.v.why : "undetermined at the date asked" } }) };
  };
}
