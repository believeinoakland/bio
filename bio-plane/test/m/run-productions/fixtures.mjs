/* run-productions' published fixtures (K4990, K4993, K4995, K5044): what suggest() refuses, made by this module's own code
   when the test runs and never stored. A user's test takes the answer from here and does not write it by hand. Each is
   called by a test of run-productions' own, `fixtures.test.mjs`, which checks the real answer. */
import { world, Q, RUN, DOC } from "./fixture.mjs";

const LEG = { target: DOC, role: "supports", ground: "paper" };
const PART = [{ ground: "paper", statement: "the paper trail of the approval" }];

/* `suggest()` refused on the one question and the one run this module's world holds, each submission a different fault
   and nothing else wrong with it: `boilerplate` a placeholder description (R3, C-27.12); `unwritableState` a body that
   carries a member's `state` (R3, C-27.13), which R3 asks before the boilerplate check. Each answer is the arm's own. */
export function suggestRefusals() {
  const w = world();
  w.inquiry(Q);
  w.run(RUN);
  w.doc(DOC);
  return {
    boilerplate: w.suggest({ name: "placeholder", description: "TBD" }),
    unwritableState: w.suggest({ name: "member-state", state: "accepted", legs: [LEG], grounds: PART }),
  };
}
