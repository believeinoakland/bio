/* escalation's published fixtures (fix round 10; K4990, K4993, K4995): each is made by escalation's real code over the
   real modules it uses (./fixture.mjs) when a test calls it, never stored. A user takes `escalation` (the real module on
   a real database) and the ids and viewers that answer to its reads. */
import { seeded, opened, V, ms } from "./fixture.mjs";

const UNKNOWN = "ESC-2026-0404-x", NO_DETERMINATION = "CONF-2026-0404-determination";

/** R2, R22: `escalationRead` as it answers an escalation a viewer may see, an unknown id and one the viewer may not see
 *  (R3's `NO_SUCH_ESCALATION`, the same answer for both); `escalationsFor` as it answers a determination with an
 *  escalation, one with none and one that is unknown or unseen (`NO_SUCH_DETERMINATION`). */
export function escalationRead() {
  const w = seeded();
  opened(w);
  const none = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0004-d", outcome: "noncompliant" }] });
  const viewer = V("bob"), outsider = V("carol");
  return { escalation: w.esc, world: w, viewer, outsider, id: w.E, determination: w.D, withoutEscalations: none, unknown: UNKNOWN,
           unknownDetermination: NO_DETERMINATION,
           read: w.esc.escalationRead({ id: w.E, viewer }),
           unknownAnswer: w.esc.escalationRead({ id: UNKNOWN, viewer }),
           unseenAnswer: w.esc.escalationRead({ id: w.E, viewer: outsider }),
           forDetermination: w.esc.escalationsFor({ determination: w.D, viewer }),
           forNone: w.esc.escalationsFor({ determination: none, viewer }),
           unknownDeterminationAnswer: w.esc.escalationsFor({ determination: NO_DETERMINATION, viewer }),
           unseenDeterminationAnswer: w.esc.escalationsFor({ determination: w.D, viewer: outsider }) };
}

/** R16: `escalationsDue` over a fresh world (no escalation, so no item) and over one in which a member opened an
 *  escalation by the real `escalationOpen` (one item, the proposed 1→2 edge), at `nowMs`. */
export function escalationsDue() {
  const empty = seeded();
  const w = seeded();
  opened(w);
  const nowMs = ms("2026-10-01T00:00:00Z"), viewer = V("bob");
  return { escalation: w.esc, world: w, emptyWorld: empty, viewer, nowMs, id: w.E,
           none: empty.esc.escalationsDue({ nowMs, viewer }),
           due: w.esc.escalationsDue({ nowMs, viewer }) };
}
