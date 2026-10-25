/* people's published fixtures (K4990, K4993, K5044): the answers of people's real code, made when a test runs and never
   stored. A user module's test takes one of these in place of a hand-built answer of people's interface. Each is
   people's own method over a fresh record of the test world (./fixture.mjs), the shipped checks and no other entry. */
import { world } from "./fixture.mjs";

const empty = world();

/** `people.checkResults` (R24) and `people.listChecks` (R22), over the empty record: the shipped revolving-door check,
 *  gated until a gold set measures it, so no result is shown. Each takes the reader's `viewer`, as the real call does. */
export const checkResults = {
  checkResults: (args) => empty.p.checkResults(args),
  listChecks: (args) => empty.p.listChecks(args),
};

/** `people.evaluateChecks` (R23) over the empty record: the one person the test world registers, evaluated, nothing left. */
export const evaluateChecksAnswers = (args) => empty.p.evaluateChecks(args);

/** `people.tiesConcerning` (R20) with a bad argument (a `member` none is named): the real answer is an empty list, not
 *  a refusal; `tiesConcerning` has no refusal of its own, so the fixture gives the answer the real code gives. */
export const tiesConcerningRefusal = (args) => empty.p.tiesConcerning(args);
