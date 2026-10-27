/* following's published fixtures (fix round 10, Wave A batch 5; K4990, K4993, K4995, K5044): what the module answers, made by
 * its real code over the real record and membership each time a test calls one, never stored. A module that reads these answers
 * takes them from here and never builds one by hand. `fixtures.test.mjs` calls each and checks the real answer. */
import { world } from "./fixture.mjs";

/** `watchedByRefusal` (R35): the real `watchedBy` answer for an id no item of the marks list answers to: the refusal
 *  `{ok: false, reason: "MARK_NO_SUCH_ITEM", code, check, translation, detail}`. */
export function watchedByRefusal({ item = "INFO-2026-9999-none" } = {}) {
  const r = world().f.watchedBy(item);
  if (!r || r.ok !== false || r.reason !== "MARK_NO_SUCH_ITEM") throw new Error(`watchedByRefusal: following did not refuse as expected: ${JSON.stringify(r)}`);
  return r;
}
