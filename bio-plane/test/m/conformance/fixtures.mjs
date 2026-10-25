/* conformance's published fixtures (K4990, K4993, K4995): each is made by conformance's real code over the real modules
   it uses (./fixture.mjs) when a test calls it, never stored. A user takes `conformance` (the real module on a real
   database) and the ids and viewers that answer to its reads. */
import { scene, V } from "./fixture.mjs";

/** R37: `curesOf` over a noncompliant determination, the later compliant determination that cures it, and the link a
 *  member recorded. `viewer` is a participant who sees both; `outsider` is a member who sees neither. */
export function curesOf() {
  const { w, std, ev, input } = scene();
  const target = w.c.determine(input());
  const later = w.event(ev, { date: "2026-04-01" });
  const cure = w.c.determine(input({ act: { ...input().act, event: later }, standards: [{ standard: std, outcome: "compliant" }],
                                      rows: [{ ...input().rows[0], reading: "aligns" }] }));
  const linked = w.c.cureLink({ determination: target.id, standard: std, cure: cure.id, author: V("olive"), viewer: V("olive") });
  if (!linked.ok) throw new Error(`fixture cure refused: ${JSON.stringify(linked).slice(0, 300)}`);
  return { conformance: w.c, determination: target.id, cure: cure.id, standard: std, link: linked.link,
           viewer: V("pat"), outsider: V("quinn"), world: w };
}

/** R9: `determinationRead` over a live determination, one a later determination superseded (and the superseding one),
 *  and one whose standard's outcome is unclear (an open question). */
export function determinationRead() {
  const { w, std, input } = scene();
  const live = w.c.determine(input());
  const old = w.c.determine(input());
  const next = w.c.determine(input({ supersedes: old.id, reason: "restated" }));
  const unclear = w.c.determine(input({ standards: [{ standard: std, outcome: "unclear" }],
    questions: [{ question: "Was notice posted on the city's site instead?" }], rows: [{ ...input().rows[0], reading: "open" }] }));
  for (const d of [live, old, next, unclear])
    if (!d.ok) throw new Error(`fixture determination refused: ${JSON.stringify(d).slice(0, 300)}`);
  return { conformance: w.c, live: live.id, superseded: old.id, supersededBy: next.id, unclear: unclear.id,
           viewer: V("pat"), outsider: V("quinn"), world: w };
}

/** R19: conformance over an empty store, where every id is NO_SUCH_DETERMINATION. */
export function noDeterminations() {
  const { w } = scene();
  return { conformance: w.c, viewer: V("pat"), world: w };
}
