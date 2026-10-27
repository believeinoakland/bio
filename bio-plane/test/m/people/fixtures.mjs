/* people's published fixtures (K4990, K4993, K5044): the answers of people's real code, made when a test runs and never
   stored. A user module's test takes one of these in place of a hand-built answer of people's interface. Each is
   people's own method over a fresh record of the test world (./fixture.mjs), the shipped checks and no other entry. */
import { world, doc, ANN, BOSS } from "./fixture.mjs";

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

/** The `person` read (`personAt`, R12 and R14) of a person one of whose facts an administrator removed on a court order,
 *  its `removed` marker `[{ground, at, by}]` as the real code answers it to a member; made fresh at each call, over a record
 *  of its own. `read` is the whole answer, `entityId` the person, `viewer` the member who reads it. */
export const personRemoved = () => {
  const w = world();
  const entityId = w.person("Ines Calder");
  const valid = { from: "2020-01-01", to: "2030-12-31", precision: "day", zone: "UTC" };
  const fact = w.p.recordPersonFact({ person: entityId, kind: "name", value: "Ines Calder-Voss", valid, citation: doc(w.capture("c")), by: ANN });
  w.p.expunge({ id: fact.fact_id, ground: "court_order", order: "Order 2026-12", reason: "ordered removed", by: BOSS });
  return { entityId, viewer: ANN, read: w.p.personAt({ entityId, at: "2024-05-05", viewer: ANN }) };
};
