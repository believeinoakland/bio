/* reevaluation's published fixtures (fix round 10): what a user module's test takes in place of reevaluation's answers.
   Each is made by reevaluation's real code when the test runs, over `world()`, and is never stored. */
import { world, V, U } from "./fixture.mjs";

const OLD = "INFO-2026-0001-old", NEW = "INFO-2026-0002-new", Q = "INQ-2026-0001-q";
const Q2 = "INQ-2026-0002-q", Q3 = "INQ-2026-0003-q", OLD2 = "INFO-2026-0004-old2", NEW2 = "INFO-2026-0005-new2";
const NEW3 = "INFO-2026-0006-new3";

/** `noticesRead` (R14): the real `notices` read, as `{ok, limit, truncated, notices}`, over the notice the real
 *  `raiseNotices` raised for a question whose cited passage has a newer capture at its address. `world` is the real
 *  module's host; `holder` the question, `raised` what `raiseNotices` answered, `viewer` the member who reads.
 *  `several: true` instead raises four notices over three holders and two targets: two of `holder`'s legs on one
 *  target, both waiting on one newer capture the reading does not hold (`grade` UNDETERMINED); a second holder's leg on
 *  that target (UNDETERMINED); and a third holder's leg on another target, whose newer version is read and changed
 *  (`grade` NOT_FOUND, `affects` affected). Each leg is a passage of a capture, made by `passage`. */
export function noticesRead({ viewer = "class:admin", several = false } = {}) {
  if (several) return severalNotices(viewer);
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(OLD, [a]); w.doc(NEW, [b]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut")]);
  w.read(b.sha, [U(0, "alpha"), U(1, "something else entirely")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b.sha, "ex.org/doc", "2026-09-20T00:00:00Z");
  const cid = w.passage(OLD, a.sha);
  w.inquiry(Q, { legs: [{ target: OLD, content_id: cid }] });
  const raised = w.r.raiseNotices({});
  if (!(raised.count > 0)) throw new Error(`fixture raiseNotices raised nothing: ${JSON.stringify(raised).slice(0, 300)}`);
  const read = w.r.notices({ viewer });
  if (!read.ok) throw new Error(`fixture notices refused: ${JSON.stringify(read).slice(0, 300)}`);
  return { world: w, viewer, holder: Q, raised, ...read };
}

/** The `several` scene of `noticesRead`: four notices, read whole by the real `notices` at its default limit. */
function severalNotices(viewer) {
  const w = world();
  const a = w.cap("a", "old"), a2 = w.cap("a2", "other old"), b2 = w.cap("b2", "other new"), b3 = w.cap("b3", "unread new");
  w.doc(OLD, [a]); w.doc(OLD2, [a2]); w.doc(NEW2, [b2]); w.doc(NEW3, [b3]);
  w.read(a.sha, [U(0, "alpha"), U(1, "the budget was cut"), U(2, "the roads were paved")]);
  w.read(a2.sha, [U(0, "x"), U(1, "the park was closed")]);
  w.read(b2.sha, [U(0, "x"), U(1, "the park reopened")]);
  w.at(a.sha, "ex.org/doc", "2026-09-01T00:00:00Z"); w.at(b3.sha, "ex.org/doc", "2026-09-25T00:00:00Z");
  w.at(a2.sha, "ex.org/doc2", "2026-09-01T00:00:00Z"); w.at(b2.sha, "ex.org/doc2", "2026-09-20T00:00:00Z");
  const p1 = w.passage(OLD, a.sha, { kind: "pdf-page", page: 1 }), p2 = w.passage(OLD, a.sha, { kind: "pdf-page", page: 2 });
  const q1 = w.passage(OLD2, a2.sha, { kind: "pdf-page", page: 1 });
  w.inquiry(Q, { legs: [{ target: OLD, content_id: p1 }, { target: OLD, content_id: p2 }] });
  w.inquiry(Q2, { legs: [{ target: OLD, content_id: p1 }] });
  w.inquiry(Q3, { legs: [{ target: OLD2, content_id: q1 }] });
  const raised = w.r.raiseNotices({});
  if (!(raised.count === 4)) throw new Error(`fixture raiseNotices raised ${raised.count}: ${JSON.stringify(raised).slice(0, 300)}`);
  const read = w.r.notices({ viewer });
  if (!read.ok) throw new Error(`fixture notices refused: ${JSON.stringify(read).slice(0, 300)}`);
  return { world: w, viewer, holder: Q, raised, ...read };
}
