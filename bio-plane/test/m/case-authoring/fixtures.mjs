/* case-authoring's published fixtures (fix-round 10, Wave A batch 4; K4990, K4993, K4995, K5044): the answers this module
   gives to a caller of `publishPreflight` (R34), made by this module's real code when the function is called, over the test
   world of fixture.mjs, and never stored. A user's test takes the answer from here and does not write it by hand. Each is
   checked by fixtures.test.mjs, which calls it and checks the real answer. */
import { world, V, MACHINE, AUTHORED } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a";
const Q = "INQ-2026-0001-q";
const ratified = (real) => new Proxy(real, { get: (t, p) => (p === "caseRatifyPreflight"
  ? () => ({ ok: true, ready: true, refusals: [] }) : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });

/** `caseAuthoring.publishPreflight` (R34), three answers over one project `alice` owns and `bo` has joined, each the real
 *  one: `blocked` for a project whose bar (A on both axes) its load-bearing finding does not reach, so `first` is the
 *  refusal `op=publish` gives (BELOW_PROJECT_STRENGTH) and `blockers` holds the other shortfalls; `machine` for a machine
 *  author, whose `first` is MACHINE_CANNOT_PUBLISH; and `notOwner` for a participant who owns nothing, whose `first` is
 *  NOT_THE_PROJECT_OWNER. Each has `{ok, wrote: false, ready: false, first, blockers, steps}`; `args` are the owner's. */
export function preflightAnswer() {
  const w = world({ ratification: ratified });
  for (const m of ["alice", "bo"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC, grade: "C", grade_axis: "capture", grade_source: "capture" }]);
  const P = w.project("Team", "alice", [Q], { extra: ["required_strength:", "  capture: A", "  connection: A"] });
  w.join(P, "bo");
  const args = (author) => ({ ...AUTHORED, project: P, targets: [Q], roles: { [Q]: "load_bearing" }, viewer: V(author), author });
  return {
    world: w, project: P, finding: Q, args: args("alice"),
    blocked: w.ca.publishPreflight(args("alice")),
    machine: w.ca.publishPreflight({ ...args("alice"), author: MACHINE }),
    notOwner: w.ca.publishPreflight(args("bo")),
  };
}
