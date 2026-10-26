/* case-inputs' published fixtures (K4990, K4993, K5044): the answers this module gives to a caller of `carryOutcome` (R9)
   and of `op=statementack` (R1, R12), the standard details' answers of `casedetailsset`, `casedetails` and `casedetailspublic`
   (R20–R24, T51), made by this module's real code when the function is called, over the test world
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
 *  may acknowledge: `noReviewCopy` for a viewer with no door (the review copy's dead answer, given by the real act), `noReason` for an act with no
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
    noReviewCopy: act({ viewer: MACHINE, reason: WORDS }),
    noReason: act({ viewer: V("bo") }),
    ok: act({ viewer: V("bo"), reason: WORDS }),
  };
}

const AREA = [{ words: "The harbour authority" }];
const CONTACT = { kind: "doorbell" };

/** The details' world: `alice` owns Team and `bo` joins it; `published` is a ratified case, `prepared` an unsigned one of
 *  the same project. Every act here is the module's own and is checked to have been done. */
function detailsWorld() {
  const w = world();
  w.member("alice");
  w.member("bo");
  const P = w.project("Team", "alice");
  w.join(P, "bo");
  const prepared = w.prepare(P, "alice").caseId;
  const published = w.ratifiedCase(P, "alice");
  return { w, prepared, published };
}

const setDetail = (w, caseId, field, value) => {
  const r = w.ci.caseDetailsSet({ case: caseId, field, value, by: "alice", viewer: V("alice") });
  if (r.ok !== true) throw new Error(`details fixture: the set of ${field} was refused: ${JSON.stringify(r).slice(0, 300)}`);
};

/** `caseDetails` (R23), the read a joined member gets of a published case with two of its four details recorded: `recorded`,
 *  the real answer, `ok: true`, with `area` and `contact` stated and `related` and `relationships` not stated. */
export function casedetails() {
  const { w, published } = detailsWorld();
  setDetail(w, published, "area", AREA);
  setDetail(w, published, "contact", CONTACT);
  return { recorded: w.ci.caseDetails({ case: published, viewer: V("bo") }) };
}

/** `casedetailsset` (R20, R22), two answers: `set`, the owner's real write of an area of government on a published case
 *  (`ok: true`, `{case, field, value, at}`), and `notOwner`, a joined member's refused write of the same field. */
export function casedetailsset() {
  const { w, published } = detailsWorld();
  return {
    set: w.ci.caseDetailsSet({ case: published, field: "area", value: AREA, by: "alice", viewer: V("alice") }),
    notOwner: w.ci.caseDetailsSet({ case: published, field: "area", value: AREA, by: "bo", viewer: V("bo") }),
  };
}

/** `casedetailspublic` (R24), two answers: `published`, the public read of a published case with two details set (stated for
 *  those two, the team's slug and the current-statement sentence), and `unpublished`, the public read of an unsigned case,
 *  which is `NOT_PUBLISHED` and carries nothing of it. */
export function casedetailspublic() {
  const { w, prepared, published } = detailsWorld();
  setDetail(w, published, "area", AREA);
  setDetail(w, published, "contact", CONTACT);
  setDetail(w, prepared, "area", AREA);
  return {
    published: w.ci.caseDetailsPublic({ case: published }),
    unpublished: w.ci.caseDetailsPublic({ case: prepared }),
  };
}

const RELATED = [
  { relation: "builds_on", case_ref: { group: "river-town", case: "CASE-2026-0007", edition: 1 }, words: "Builds on the council's 2025 minutes" },
  { relation: "disagrees_with", url: "https://example.org/housing-study", words: "A competing reading of the same vote" },
];

/** `caseDetails` (R23) and `caseDetailsPublic` (R24), the two reads of a published case whose `related` standing has works:
 *  `recorded`, the owner's case read to a joined member, and `publicRead`, the public read; each the real answer, with
 *  `related` stated as a `builds_on` and a `disagrees_with` (their values as set) and `relationships` not stated. */
export function casedetailsRelated() {
  const { w, published } = detailsWorld();
  setDetail(w, published, "related", RELATED);
  return {
    recorded: w.ci.caseDetails({ case: published, viewer: V("bo") }),
    publicRead: w.ci.caseDetailsPublic({ case: published }),
  };
}

/** `caseDetails` (R23) and `caseDetailsPublic` (R24), the two reads of a published case whose `relationships` standing is
 *  stated as `{none: true}` (no relationships to report): `recorded` and `publicRead`, each the real answer, with
 *  `relationships` stated as `{none: true}` and `related` not stated. */
export function casedetailsNone() {
  const { w, published } = detailsWorld();
  setDetail(w, published, "relationships", { none: true });
  return {
    recorded: w.ci.caseDetails({ case: published, viewer: V("bo") }),
    publicRead: w.ci.caseDetailsPublic({ case: published }),
  };
}
