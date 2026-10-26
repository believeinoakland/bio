/* The answers this module publishes for its users' tests (K4990, K4993, K4995, K5175): each is made by this module's real
   code when the test runs, never stored. A user's test takes its value from here instead of building the answer by hand. */
import { world, V, received } from "./fixture.mjs";
import { docketEntryRead } from "../docket/fixtures.mjs";
import { actionHoldsOf, actionHoldsOps } from "../../../src/action-holds/index.mjs";

const A = "ACTN-2026-0001-a";
const BY = "alice";

/* R19 (K5175): the answer of `op=holdsdue`, the door's read of what still wants a hold, over the module's real `holdsDue`:
   one legal mark on an action in a project the viewer sees, with no hold stated on it, so the page holds it with its
   arrival (`{action, ord}`) and who marked it and when. Answers `{w, h, viewer, answer}` where `answer` is the door's
   answer and `w.h.holdsDue({viewer})` is the same page as the module answers it. Each call builds its own world. */
export function holdsDueAnswer() {
  const w = world();
  const project = w.project(BY);
  w.action(A, [`project: ${project}`, ...received(2)]);
  w.mark(A, 0, "legal", V(BY));
  const viewer = V(BY);
  const url = new URL(`https://x/?viewer=${encodeURIComponent(viewer)}`);
  const answer = actionHoldsOps(w.h, url, null).holdsdue();
  return { w, h: w.h, viewer, answer };
}

/* R19 (K5222): the answers of `op=holdsdue` for one docket `legal` mark, over docket's own published world (`docketEntryRead`:
   a real legal mark made by docket's real act on an entry of project P, which alice manages). `answer` is the door's answer
   before a hold: the mark listed as `{arrived: {docket_entry, case}}`. `placed` is the same world's answer after the hold is
   placed from that entry (the place is P, the project the docket reads), its items empty. Each call builds its own world. */
export function holdsDueDocketAnswer() {
  const d = docketEntryRead();
  const { world: w, marked: entry, manager: viewer } = d;
  const h = actionHoldsOf(w.host, { record: w.record, membership: w.membership, now: () => w.clock.now, ratification: null,
                                    docket: w.docket, doorbell: null });
  const url = new URL(`https://x/?viewer=${encodeURIComponent(viewer)}`);
  const direct = h.holdsDue({ viewer });
  const answer = actionHoldsOps(h, url, null).holdsdue();
  const placedHold = h.actionHold({ project: w.P, from: { docket_entry: entry }, hold: "in_place", reason: "keep",
                                    viewer, author: viewer });
  if (placedHold.ok !== true) throw new Error(`the hold was not placed: ${JSON.stringify(placedHold)}`);
  const placed = actionHoldsOps(h, url, null).holdsdue();
  return { w, h, viewer, entry, answer, direct, placed };
}
