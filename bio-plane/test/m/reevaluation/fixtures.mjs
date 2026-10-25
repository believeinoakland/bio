/* reevaluation's published fixtures (fix round 10): what a user module's test takes in place of reevaluation's answers.
   Each is made by reevaluation's real code when the test runs, over `world()`, and is never stored. */
import { world, V, U } from "./fixture.mjs";

const OLD = "INFO-2026-0001-old", NEW = "INFO-2026-0002-new", Q = "INQ-2026-0001-q";

/** `noticesRead` (R14): the real `notices` read, as `{ok, limit, truncated, notices}`, over the notice the real
 *  `raiseNotices` raised for a question whose cited passage has a newer capture at its address. `world` is the real
 *  module's host; `holder` the question, `raised` what `raiseNotices` answered, `viewer` the member who reads. */
export function noticesRead({ viewer = "class:admin" } = {}) {
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
