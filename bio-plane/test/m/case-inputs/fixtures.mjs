/* case-inputs' published fixtures (K4990, K4993, K5044): the answers this module gives to a caller of `carryOutcome` (R9)
   and of `op=statementack` (R1, R12), made by this module's real code when the function is called, over the test world
   of fixture.mjs, and never stored. A user's test takes the answer from here and does not write it by hand. Each is
   checked by fixtures.test.mjs, which calls it and checks the real answer. */
import { world, V, MACHINE, WORDS } from "./fixture.mjs";
import { caseInputsOps } from "../../../src/case-inputs/index.mjs";

const Q = "INQ-2026-0001-q";
const CITES = [{ kind: "finding", ref: Q }];
const OUTCOME = { kind: "success", text: "The council published the amended minutes.", cites: CITES, on: "2026-09-20" };

/** `caseInputs.carryOutcome` (R9), three answers, each the real one: `noSuchCase` for a case nothing published holds
 *  (C-136.4's NO_SUCH_CASE), `badCarriedOutcome` for a blank text (naming `text`), and `ok`, the outcome carried by a
 *  joined member's act on a ratified case. */
export function carryOutcome() {
  const w = world();
  w.member("alice");
  const P = w.project("Team", "alice");
  const caseId = w.ratifiedCase(P, "alice");
  return {
    noSuchCase: w.ci.carryOutcome({ case: "CASE-2026-9999", ...OUTCOME, by: "alice" }),
    badCarriedOutcome: w.ci.carryOutcome({ case: caseId, ...OUTCOME, text: "", by: "alice" }),
    ok: w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }),
  };
}

/** `caseInputsOps(...).statementack()` (R1, R12), three answers over an unsigned case document that a joined member `bo`
 *  may acknowledge: `noReviewCopy` for a viewer with no door (the review copy's dead answer, which the test world's review
 *  stand-in gives; review's own NO_REVIEW_COPY is checked by review's `fixtures-run`), `noReason` for an act with no
 *  reason (STATEMENT_ACK_NO_REASON), and `ok`, the reasoned acknowledgement. */
export function statementAck() {
  const w = world();
  w.member("alice");
  w.member("bo");
  const P = w.project("Team", "alice");
  w.join(P, "bo");
  const pub = w.prepare(P, "alice");
  const act = (params) => caseInputsOps(w.ci, new URL(`http://do/statementack?${new URLSearchParams({
    case: pub.caseId, edition: "1", ...params })}`), null).statementack();
  return {
    // fixtures-contract: review no-review-copy
    noReviewCopy: act({ viewer: MACHINE, reason: WORDS }),
    noReason: act({ viewer: V("bo") }),
    ok: act({ viewer: V("bo"), reason: WORDS }),
  };
}
