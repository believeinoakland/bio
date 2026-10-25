/* action-clocks' published fixtures (fix round 10): what a user module's test takes in place of action-clocks' answers.
   Each is made by action-clocks' real code when the test runs, over `world()`, and is never stored. */
import { world } from "./fixture.mjs";

/** R1: the real refusal of `pendingClocks` to a `before` that is no date, PENDING_CLOCKS_BAD_BEFORE (C-117.5). */
export function pendingClocksRefusal({ before = "x" } = {}) {
  return world().c.pendingClocks({ before });
}
