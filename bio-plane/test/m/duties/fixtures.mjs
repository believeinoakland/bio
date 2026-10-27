/* duties' published fixtures (fix-round 10, Wave A batch 2; K4990, K4993, K4995, K5044): what the module answers, made by
 * its real code over the real record, events, entities and standards each time a test calls one, never stored. A module
 * that reads duties takes its answer from here and never builds one by hand. Each export returns the real answers
 * together with the ids the real code minted, so a user's test names no id of its own. */
import { world, BOB, CAROL, E, ZONE } from "./fixture.mjs";

export const AS_OF = "2026-03-09T12:00:00Z";
const day = (value) => ({ value, precision: "day", zone: ZONE });
const must = (r, what) => {
  if (!r || r.ok !== true) throw new Error(`fixture ${what} refused: ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};
/** A duty id the record does not hold. */
export const ABSENT_ID = "DUT-2026-0099";

/** A records-response duty triggered by each request (a communication concerning the clerk), with the first request
 *  matched by a response in time (met) and a second duty whose trigger the record places nowhere (undetermined). */
function seeded() {
  const w = world();
  const req1 = w.event({ value: day("2026-02-02"), concerns: [E.clerk] });
  const req2 = w.event({ value: day("2026-02-16"), concerns: [E.clerk] });
  const resp1 = w.event({ value: day("2026-02-10"), concerns: [E.group] });
  const dutyId = must(w.declare({ trigger: { kind: "event", event_kind: "communication", entity: E.clerk } }), "duty").duty_id;
  const window = { from: "2026-01-01", to: "2026-03-31" };
  const keyOf = (ref) => must(w.duties.occurrencesOf({ dutyId, asOf: AS_OF, ...window, viewer: BOB }), "occurrences").occurrences.find((o) => o.trigger.ref === ref).key;
  must(w.duties.matchEvent({ dutyId, occurrenceKey: keyOf(req1), eventId: resp1, reason: "the response", by: BOB }), "match");
  w.duties.registerTriggerSource("actions", () => [{ ref: "ACT-2026-0009-undated" }]);
  const undeterminedId = must(w.declare({ trigger: { kind: "source", source: "actions" } }), "undated duty").duty_id;
  return { w, dutyId, undeterminedId, req1, req2, resp1, window };
}

/** `occurrencesOf` (R9–R12): the occurrences of a duty read as of `AS_OF` (one met, one pending, over real events), those
 *  of a duty whose trigger the record places nowhere (undetermined), and `NO_SUCH_DUTY` for an id the record does not hold. */
export function occurrencesOf() {
  const s = seeded();
  const ask = (dutyId, viewer = BOB) => s.w.duties.occurrencesOf({ dutyId, asOf: AS_OF, ...s.window, viewer });
  return { duties: s.w.duties, asOf: AS_OF, dutyId: s.dutyId, undeterminedId: s.undeterminedId, absentId: ABSENT_ID,
           met: ask(s.dutyId), undetermined: ask(s.undeterminedId), absent: ask(ABSENT_ID) };
}

/** `occurrences` (R9–R12): the read a viewer makes without a window (`{dutyId, viewer}` and the instant to read at): the
 *  occurrences a visible duty derives, and the one `NO_SUCH_DUTY` answer for an id the record does not hold and for a
 *  viewer naming no member (`unseen`). */
export function occurrences() {
  const s = seeded();
  const ask = (dutyId) => s.w.duties.occurrencesOf({ dutyId, asOf: AS_OF, viewer: BOB });
  return { duties: s.w.duties, asOf: AS_OF, dutyId: s.dutyId, absentId: ABSENT_ID, read: ask(s.dutyId), absent: ask(ABSENT_ID),
           unseen: s.w.duties.occurrencesOf({ dutyId: s.dutyId, asOf: AS_OF, viewer: "nobody" }) };
}

/** `recordTransitionsAnswers` (R13): the scheduler's pass over an empty record, then over two duties with a budget that
 *  ends the first slice early (`{done: false, cursor: "DUT-…"}`), and the slice that finishes from that cursor. */
export function recordTransitionsAnswers() {
  const empty = world().duties.recordTransitions({ asOf: AS_OF });
  let t = 0;
  const w = world({ deps: { clockMs: () => (t += 10) } });
  w.event({ value: day("2026-02-02"), concerns: [E.clerk] });
  const first = must(w.declare({ trigger: { kind: "event", event_kind: "communication", entity: E.clerk } }), "duty").duty_id;
  const second = must(w.declare({ trigger: { kind: "date", date: "2026-02-02" } }), "second duty").duty_id;
  const unfinished = w.duties.recordTransitions({ asOf: AS_OF, budgetMs: 1 });
  const finished = w.duties.recordTransitions({ asOf: AS_OF, budgetMs: 1000000, cursor: unfinished.cursor });
  return { duties: w.duties, asOf: AS_OF, first, second, empty, unfinished, finished };
}

/** `transitionsUnknownDuty` (R14): the recorded transitions asked for a duty the record does not hold. The module
 *  refuses no such read: it answers `{ok: true, transitions: [], count: 0}`, so no `NO_SUCH_DUTY` comes from it. */
export function transitionsUnknownDuty() {
  const w = world();
  return { duties: w.duties, absentId: ABSENT_ID, read: w.duties.transitionsOf({ dutyId: ABSENT_ID, viewer: BOB }) };
}

/** `dutiesOf` and `occurrencesOf` read for a viewer (the duty listing and the occurrence read a notice producer makes, K5108
 *  follow-up 38): `none` is the listing of an entity holding no duty as obligor, from the record with no duty in it, and
 *  `noneOccurrences` the read of a duty id that record does not hold; `held` is the listing of the one duty the viewer
 *  sees, and `heldOccurrences` that duty read over a window holding none of its triggers. */
export function dutiesForViewer() {
  const empty = world();
  const none = empty.duties.dutiesOf({ entity: E.clerk, as: "obligor", viewer: CAROL });
  const noneOccurrences = empty.duties.occurrencesOf({ dutyId: ABSENT_ID, asOf: AS_OF, viewer: CAROL });
  const w = world();
  const dutyId = must(w.declare({ trigger: { kind: "date", date: "2026-02-02" } }), "duty").duty_id;
  const held = w.duties.dutiesOf({ entity: E.clerk, as: "obligor", viewer: BOB });
  const heldOccurrences = w.duties.occurrencesOf({ dutyId, asOf: AS_OF, from: "2026-04-01", to: "2026-04-30", viewer: BOB });
  return { duties: w.duties, asOf: AS_OF, entity: E.clerk, viewer: CAROL, holder: BOB, dutyId, absentId: ABSENT_ID,
           none, noneOccurrences, held, heldOccurrences };
}
