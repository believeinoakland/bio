/* ai-use's published fixtures (fix round 10; K4990, K4993, K5044): the answers this module's real code gives, made when a
 * test runs and never stored. A user takes the answer from here instead of hand-building ai-use's refusal. Each is checked
 * by `fixtures.test.mjs`, which calls it and compares the real answer. */
import { standard } from "./fixture.mjs";

const AT = "2026-10-09T12:00:00Z";

/** `ceilingRefusal`: the real `useCheck` answer for a use over a spent daily ceiling: the project's `ask` limit of 2 calls a day,
 *  spent by two calls of bob's. A refusal `{ok: false, code: "AI_LIMIT_REACHED", check: "C-143.1", translation, detail, ...}`
 *  naming the limit's owner, scope, unit and period, never a cost. `at` is the instant judged (the same local day by default). */
export async function ceilingRefusal({ at = AT } = {}) {
  const w = await standard();
  w.u.aiLimitSet({ owner: "project:P", scope: "ask", unit: "calls", period: "day", amount: 2, by: "ann", at: AT });
  w.count("project:P", "bob", "ask");
  w.count("project:P", "bob", "ask");
  return w.u.useCheck({ owner: "project:P", member: "bob", use: "ask", at });
}
