/* The fixtures money publishes for its users (K4990, K4993, K5044): each is made by money's real code when it is called,
 * never stored, and each is checked by `fixtures.test.mjs`. Named with the requirement each answer carries. */
import { seeded, ANN } from "./fixture.mjs";

/** `money.readFact` for an id an empty money record does not hold: `{ok:true, found:false, fact_id, fact:null}` (R8). */
export function readFactNotFound() {
  const s = seeded();
  return s.m.readFact({ factId: "MNY-2026-0000000000000000", viewer: ANN });
}

/** `money.readFact({factId})` for a fact recorded over the seeded world (fields of the fact overridden by `over`):
 *  `{ok:true, found:true, fact}`, the fact as money answers it (R8). */
export function readFactOf(over = {}) {
  const s = seeded();
  return s.m.readFact({ factId: s.rec(over), viewer: ANN });
}
