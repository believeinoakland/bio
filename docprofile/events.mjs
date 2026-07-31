/* The shared event catalogue, and significance graded ONCE.
 *
 * CONSTRUCTS Step 0, collisions #5 and #6. Before this, a content type invented its
 * own event-type strings inline (`delisted`, `cancelled`, `minutes_replaced`, ...)
 * and stamped a significance beside each push site by hand, and `meaningful` was a
 * second boolean carried alongside the significance it could have been derived from.
 * Both are the lesson the plane's check catalogue already taught: a vocabulary with
 * no registry is a vocabulary that the second author either duplicates or contradicts.
 *
 * So every event a content type can emit is named here ONCE, with its significance,
 * and a content type draws its events from `event()` rather than writing the string
 * and the grade itself. A second content type either reuses these types or extends
 * the catalogue in this one place.
 */

/* How much a member should be troubled, ordered so a report leads with the worst
   thing rather than the first thing. */
export const SIGNIFICANCE = { EVENT: "event", NOTICE: "notice", ROUTINE: "routine" };
const SIG_RANK = { routine: 0, notice: 1, event: 2 };
/** Where a significance sits, for ordering and for deriving `meaningful`. */
export function significanceRank(s) { return SIG_RANK[s] != null ? SIG_RANK[s] : -1; }

/* The catalogue. Each entry names the fixed significance of that kind of event.
   Document events come in agenda/ and minutes/ pairs because the two are the same
   shape of thing arriving on the same clock. */
export const EVENTS = {
  /* a public record removed from a public list, or one that cannot be told apart
     from that because the window could not be read — close to the reason BIO exists */
  delisted:          { significance: SIGNIFICANCE.EVENT },
  possibly_delisted: { significance: SIGNIFICANCE.EVENT },
  /* a meeting's own status, date or a swapped/withdrawn document: things a member
     watching that body needs to see */
  cancelled:         { significance: SIGNIFICANCE.EVENT },
  rescheduled:       { significance: SIGNIFICANCE.EVENT },
  status_changed:    { significance: SIGNIFICANCE.EVENT },
  moved:             { significance: SIGNIFICANCE.EVENT },
  agenda_withdrawn:  { significance: SIGNIFICANCE.EVENT },
  minutes_withdrawn: { significance: SIGNIFICANCE.EVENT },
  agenda_replaced:   { significance: SIGNIFICANCE.EVENT },
  minutes_replaced:  { significance: SIGNIFICANCE.EVENT },
  /* the body holding a meeting is named differently: worth showing, not an alarm */
  renamed:           { significance: SIGNIFICANCE.NOTICE },
  /* the list doing its job: a new meeting, or a document arriving on schedule */
  scheduled:         { significance: SIGNIFICANCE.ROUTINE },
  agenda_published:  { significance: SIGNIFICANCE.ROUTINE },
  minutes_published: { significance: SIGNIFICANCE.ROUTINE },
};

/** Build an event, drawing its significance from the catalogue so the grade lives in
 *  ONE place. An unknown type throws rather than defaulting: a silently-routine typo
 *  is exactly the miscarriage the catalogue exists to prevent, and a new event type
 *  is a deliberate addition to the catalogue above, not an inline string. */
export function event(type, detail) {
  const spec = EVENTS[type];
  if (!spec) throw new Error(`docprofile: unknown event type "${type}" — add it to the catalogue in events.mjs`);
  return { type, significance: spec.significance, ...(detail || {}) };
}

/** The worst significance among a set of events, or null when there are none. */
export function worstSignificance(events) {
  let worst = null;
  for (const e of events)
    if (worst === null || SIG_RANK[e.significance] > SIG_RANK[worst]) worst = e.significance;
  return worst;
}

/** `meaningful` is DERIVED, never a second fact carried beside the grade: a change is
 *  meaningful exactly when its worst event rises to EVENT. (CONSTRUCTS Step 0 #6) */
export function isMeaningful(events) {
  return worstSignificance(events) === SIGNIFICANCE.EVENT;
}

/** Sort events worst-first, in place, so a report leads with the heaviest thing. */
export function bySeverity(events) {
  return events.sort((a, b) => SIG_RANK[b.significance] - SIG_RANK[a.significance]);
}
