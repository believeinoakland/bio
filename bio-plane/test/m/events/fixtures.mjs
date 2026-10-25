/* The fixtures events publishes for the modules that use it (K4990, K4993, K4995, K5044). Each is made by events' real
 * code when it is called, over a fresh `world()`, never stored; each is checked by `fixtures.test.mjs`. */
import { world, MEMBER, MACHINE } from "./fixture.mjs";

const doc = { kind: "document" };

/** events.recordedBy over a capture with an extent that is no extent of a known kind: EXTENT_MALFORMED, whole. */
export function recordedByMalformedExtent(malformed = "page 1") {
  const w = world();
  const s = w.capture("malformed-extent");
  return w.ev.recordedBy({ captureSha: s, extent: malformed, viewer: MEMBER });
}

/** The real `events.sequence` answers `undetermined` over events that cannot be ordered: `withWhy` as events answers it
 *  (two events on one day at day precision), `withoutWhy` the same answer with the `why` taken off it (a reader that has
 *  none to relay), `disagree` the answer of two standing relations ordering the pair both ways. */
export function sequenceUndetermined() {
  const w = world();
  const a = w.event({ value: "2026-07-01" }).event_id, b = w.event({ value: "2026-07-01" }).event_id;
  const withWhy = w.ev.sequence({ a, b, viewer: MEMBER });
  const { why, ...withoutWhy } = withWhy;
  const s = w.capture("order");
  w.ev.relate({ from: a, to: b, kind: "precedes", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  w.ev.relate({ from: b, to: a, kind: "precedes", attestation: { captureSha: s, extent: doc }, by: MEMBER });
  const disagree = w.ev.sequence({ a, b, viewer: MEMBER });
  return { withWhy, withoutWhy, disagree };
}

/** events.timeline over an empty world: a set naming one entity that has no event answers `{ok, world:{items:[]}, ours:{sources:[]}}`. */
export function timelineAnswer() {
  const w = world();
  return w.ev.timeline({ set: [w.entity("Nobody")], viewer: MEMBER });
}

/** events.timeline's refusals: NO_SET (an empty set) and BAD_DATE (a date that is no date). */
export function timelineRefusal() {
  const w = world();
  const p = w.entity("Dee");
  return { noSet: w.ev.timeline({ set: [], viewer: MEMBER }), badDate: w.ev.timeline({ set: [p], from: "2026-02-31", viewer: MEMBER }) };
}

/** events.usesOf over a world seeded with one use of each kind (discretion, waiver, assessment) recorded through the
 *  real acts, with provision, decider and subject; `refused` is usesOf({kinds:["x"]}), KIND_NOT_DISCRETION. */
export function usesOf() {
  const w = world();
  const s = w.capture("decision", { pages: 3, units: [0, 1, 2].map((i) => ({ seq: i, extent: { kind: "pdf-page", page: i }, text: `Page ${i} of the decision.` })) });
  const decider = w.entity("Dana Director"), subject = w.entity("Owen Owner");
  const page = (n) => ({ captureSha: s, extent: { kind: "pdf-page", page: n } });
  const fact = w.ev.recordDatedFact({ captureSha: s, extent: { kind: "pdf-page", page: 0 }, kind: "signed", value: "2026-03-04", method: "read by a member", by: MEMBER }).dated_fact.dated_fact_id;
  const common = { provision: { standard: "STD-2026-0001", portion: "§4.2" }, statedReason: page(1), attestations: [{ datedFactId: fact }],
    participants: [{ entityId: decider, role: "decider", attestation: 0 }, { entityId: subject, role: "subject", attestation: 0 }], by: MEMBER };
  const made = {};
  made.discretion = w.ev.recordDiscretion({ ...common, kind: "discretion", outcome: { value: "granted", extent: page(0) } });
  made.waiver = w.ev.recordDiscretion({ ...common, kind: "waiver", outcome: { value: "granted", extent: page(0) }, scope: page(2) });
  made.assessment = w.ev.recordAssessment({ ...common, unmet: [] });
  return { w, decider, subject, made, all: w.ev.usesOf({ viewer: MEMBER }), refused: w.ev.usesOf({ viewer: MEMBER, kinds: ["x"] }) };
}
