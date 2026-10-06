/* events as a connection owner (R35; connection-grammar R2, R6–R9; K1469, K1470). Its kinds: took part (one per
   role), concerns, within and the five event links, each evidentiary (every one is cited). `neighbours` answers an
   entity's or an event's connections in connection-grammar's shape, each with its evidence and both grade axes, valid at
   the event's own time, through the viewer's sight (R40), from the indexes on `event_participants (entity_id)`,
   `event_relations (from_event)`, `(to_event)` and `event_concerns (end_id)`. It writes nothing and logs no reader. */
import { validAt } from "../civil-time/index.mjs";
import { BOUNDS, LOWEST_GRADE } from "../connection-grammar/index.mjs";
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
function validOf(k, eventId) {
  const w = k.whenRead(eventId).when;
  if (!w || w === "undetermined" || !w.zone || w.precision === "upper_bound")
    return { from: null, to: null, precision: "day", zone: (w && w.zone) || k.zone() || "UTC" };
  return { from: w.value, to: w.value, precision: w.precision, zone: w.zone };
}

/** R35. */
export function neighboursOf(k, args) {
  const a = isObj(args) ? args : {};
  if (a.viewer === undefined || a.viewer === null || a.viewer === "")
    return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
  const node = typeof a.node === "string" ? a.node : "";
  const kinds = Array.isArray(a.kinds) ? a.kinds.filter((x) => ALL.includes(x)) : ALL;
  const sees = (bundleId) => k.sees(bundleId, a.viewer);
  const att = (id) => k.one(`SELECT * FROM event_attestations WHERE attestation_id=?`, id);
  const evGrade = (eventId) => { const g = k.governing(eventId); if (g) return g.grade;
    const v = k.visibleAttestations(eventId, a.viewer)[0]; return v ? v.grade : null; };
  const evidence = (x) => [{ source: x.capture_sha ? `capture:${x.capture_sha}` : `testimony:${x.attestation_id}`,
                             ...(x.extent ? { extent: JSON.parse(x.extent) } : {}) }];
  const out = [];
  const push = (c, eventId) => {
    const valid = validOf(k, eventId);
    let v;
    try { v = validAt({ valid, basis: null }, a.at, { view: k.view() }); } catch (e) { v = { undetermined: true, why: String(e && e.message || e) }; }
    if (v === "out") return;
    out.push({ ...c, owner: "events", valid, derived: null, ...(v === "in" ? {} : { undetermined: { why: v && v.why ? v.why : "undetermined at the date asked" } }) });
  };
  const live = (id) => { const e = k.one(`SELECT alias_of FROM events WHERE event_id=?`, id); return e && !e.alias_of; };
  /* took part: an entity's participations, or an event's participants */
  const parts = /^EVT-/.test(node)
    ? k.rows(`SELECT * FROM event_participants WHERE event_id=? AND superseded_by IS NULL ORDER BY participant_id`, node)
    : k.rows(`SELECT * FROM event_participants WHERE entity_id=? AND superseded_by IS NULL ORDER BY participant_id`, node);
  for (const p of parts) {
    const kind = `event_${p.role}`;
    if (!kinds.includes(kind) || !live(p.event_id)) continue;
    const x = att(p.attestation_id);
    if (!x || !sees(x.bundle_id)) continue;
    push({ id: `events:${kind}:${p.participant_id}`, from: p.entity_id, to: p.event_id, kind, evidence: evidence(x),
           grade: { assertion: grade(x.grade), ends: [grade(k.resolutionGrade(p.entity_id, x)), grade(evGrade(p.event_id))] } }, p.event_id);
  }
  /* concerns */
  if (kinds.includes("event_concerns")) {
    const cs = /^EVT-/.test(node)
      ? k.rows(`SELECT * FROM event_concerns WHERE event_id=? OR end_id=? ORDER BY event_id, end_id`, node, node)
      : k.rows(`SELECT * FROM event_concerns WHERE end_id=? ORDER BY event_id`, node);
    for (const c of cs) {
      if (!live(c.event_id)) continue;
      const x = k.visibleAttestations(c.event_id, a.viewer)[0];
      if (!x) continue;
      push({ id: `events:event_concerns:${c.event_id}:${c.end_id}`, from: c.event_id, to: c.end_id, kind: "event_concerns",
             evidence: evidence(x), grade: { assertion: grade(x.grade), ends: [grade(evGrade(c.event_id)), grade(/^EVT-/.test(c.end_id) ? evGrade(c.end_id) : x.grade)] } }, c.event_id);
    }
  }
  /* within and the five links */
  if (/^EVT-/.test(node))
    for (const r of k.rows(`SELECT * FROM event_relations WHERE (from_event=? OR to_event=?) AND withdrawn_at IS NULL ORDER BY relation_id`, node, node)) {
      const kind = `event_${r.kind}`;
      if (!kinds.includes(kind)) continue;
      const x = att(r.attestation_id);
      if (!x || !sees(x.bundle_id)) continue;
      push({ id: `events:${kind}:${r.relation_id}`, from: r.from_event, to: r.to_event, kind, evidence: evidence(x),
             grade: { assertion: grade(x.grade), ends: [grade(evGrade(r.from_event)), grade(evGrade(r.to_event))] } }, r.from_event);
    }
  if (out.length > BOUNDS.hub)
    return { items: [], hub: { set_size: out.length, why: `this node has more than ${BOUNDS.hub} connections of these kinds; it is named, never expanded` } };
  const start = Number.isInteger(a.page) && a.page > 0 ? a.page : 0;
  const items = out.slice(start, start + BOUNDS.fanout);
  return { items, ...(start + BOUNDS.fanout < out.length ? { next: start + BOUNDS.fanout } : {}) };
}
