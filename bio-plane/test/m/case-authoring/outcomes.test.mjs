/* case-authoring R74 and R65 (T45; T47, N908; N855 (6c); Actions D5, D6c; v0.2 §3 Success record, rule 17): the outcomes
   carried into a case's next edition, written into the edition `publishCase` prepares. The service itself (carrying,
   withdrawing, listing, pending) is `case-inputs` R9's and its tests; here outcomes are carried through it (`w.ci`) as
   setup, and `publishCase` reads them through its `pendingOutcomes`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, AUTHORED, WHAT_CHANGED } from "./fixture.mjs";
import { outcomesOf, OUTCOMES_HEAD, accountOf } from "../../../src/case-grammar/index.mjs";
import { AUTHORED_FIELDS, ACT_FIELDS } from "../../../src/case-authoring/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const CITES = [{ kind: "finding", ref: Q }];
const OUTCOME = { kind: "success", text: "The council published the amended minutes.", cites: CITES, on: "2026-09-20" };

function setup() {
  const w = world();
  for (const m of ["alice", "bo", "cy", "di"]) w.member(m);
  w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  const P = w.project("Team", "alice", [Q]);
  w.join(P, "bo");
  w.join(P, "cy", "invited");
  const e1 = w.publish(P, "alice", [Q]);
  if (!e1.ok) throw new Error(JSON.stringify(e1).slice(0, 300));
  w.ratify(e1);
  return { w, P, e1, caseId: e1.caseId };
}
test("R65 (T45; Actions D6c; T47): R74's outcomes are never authored fields of publishCase: a body field naming them is refused CASE_FIELD_NOT_ALLOWED as any other, naming it, and nothing is written", () => {
  const { w, P } = setup();
  for (const f of ["outcomes", "outcome", "carriedOutcomes", "success", "cure", "harmAddressed"]) {
    assert.equal(AUTHORED_FIELDS.includes(f) || ACT_FIELDS.includes(f), false, f);
    const before = w.snapshot();
    const r = w.publish(P, "alice", [Q], { [f]: [{ kind: "success", text: "We won." }] });
    assert.deepEqual([r.ok, r.reason, r.fields], [false, "CASE_FIELD_NOT_ALLOWED", [f]]);
    assert.deepEqual(w.snapshot(), before);
  }
});

/* An edition above the last ratified one: the finding moved to new bytes, and the four statements authored fresh (R10). */
const DOC2 = "INFO-2026-0002-b";
const fresh = (n) => ({ statement: `It does not cover the later amendments, edition ${n}.`,
                        subjectJustification: `The award is public, as of edition ${n}.`,
                        biasAcknowledgement: `We read the minutes as authoritative, as of edition ${n}.`,
                        excluded: [{ description: `the side letter ${n}`, reason: "not in hand" }] });
function nextEdition(w, P, caseId, n, over = {}) {
  return w.publish(P, "alice", [Q], { caseId, ...fresh(n), ...over });
}
const docText = (w, r) => w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text;

test("R74: publishCase writes every pending, unwithdrawn outcome of the case into case-grammar R29's block and its body section, in the order carried; a withdrawn one is not written; R34's first step lists them", () => {
  const { w, P, caseId } = setup();
  w.doc(DOC2);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const a = w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).outcome;
  const b = w.ci.carryOutcome({ case: caseId, ...OUTCOME, kind: "cure", text: "The clerk corrected the register.", on: "2026-09-21", by: "bo" }).outcome;
  const gone = w.ci.carryOutcome({ case: caseId, ...OUTCOME, kind: "harm_addressed", text: "Withdrawn later.", by: "alice" }).outcome;
  w.ci.withdrawCarriedOutcome({ outcome: gone, reason: "it belongs to another case", by: "alice" });
  const pre = w.ca.publishPreflight({ ...AUTHORED, whatChanged: WHAT_CHANGED, project: P, targets: [Q], roles: { [Q]: "load_bearing" },
                                      viewer: V("alice"), author: "alice", caseId, ...fresh(2) });
  assert.equal(pre.first, null, JSON.stringify(pre.first).slice(0, 300));
  assert.deepEqual(pre.steps[0].outcomes.map((o) => [o.outcome, o.kind]), [[a, "success"], [b, "cure"]]);
  const e2 = nextEdition(w, P, caseId, 2);
  assert.deepEqual([e2.ok, e2.edition], [true, 2], JSON.stringify(e2).slice(0, 300));
  const text = docText(w, e2);
  const rows = outcomesOf(w.fm(text));
  assert.deepEqual(rows.map((r) => [r.outcome, r.kind, r.text, r.on, r.carried_by]),
    [[a, "success", OUTCOME.text, OUTCOME.on, "alice"], [b, "cure", "The clerk corrected the register.", "2026-09-21", "bo"]]);
  assert.deepEqual(rows[0].cites, [{ kind: "finding", ref: Q, ord: null }]);
  assert.equal(text.includes(gone) || text.includes("Withdrawn later."), false, "a withdrawn outcome is not written");
  const body = text.slice(text.indexOf("\n---\n", 4) + 5);
  assert.ok(body.includes(OUTCOMES_HEAD));
  assert.ok(body.indexOf(OUTCOMES_HEAD) < body.indexOf("## What This Excludes"));
  /* still pending: the preparation is unsigned */
  assert.deepEqual(w.ci.carriedOutcomesOf({ case: caseId, viewer: V("alice") }).outcomes.map((o) => o.state), ["pending", "pending", "withdrawn"]);
});

test("R74 (controls): a replaced preparation still carries a pending outcome; once a ratified edition's signed document holds it, it is carried (with that edition), settled, and not written into the edition after it; a first edition and a case with none carry no block", () => {
  const { w, P, caseId, e1 } = setup();
  assert.equal(w.fm(docText(w, e1)).outcomes, undefined, "no outcome, no block");
  w.doc(DOC2);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const a = w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).outcome;
  const firstText = docText(w, nextEdition(w, P, caseId, 2));
  const again = nextEdition(w, P, caseId, 2, { statement: "It does not cover the later amendments, prepared again." });
  assert.deepEqual([again.ok, again.edition], [true, 2], JSON.stringify(again).slice(0, 300));
  assert.notEqual(docText(w, again), firstText, "the preparation was replaced");
  assert.deepEqual(outcomesOf(w.fm(docText(w, again))).map((r) => r.outcome), [a], "the replaced preparation carries it again");
  w.ratify(again);
  const listed = w.ci.carriedOutcomesOf({ case: caseId, viewer: V("alice") }).outcomes;
  assert.deepEqual([listed[0].state, listed[0].edition], ["carried", 2]);
  const settled = w.ci.withdrawCarriedOutcome({ outcome: a, reason: "too late", by: "alice" });
  assert.deepEqual([settled.code, settled.state, settled.edition], ["CARRIED_OUTCOME_SETTLED", "carried", 2]);
  /* the edition after it */
  w.finding(Q, [{ target: DOC2 }]);
  const b = w.ci.carryOutcome({ case: caseId, ...OUTCOME, text: "A second success.", by: "alice" }).outcome;
  const e3 = nextEdition(w, P, caseId, 3);
  assert.deepEqual([e3.ok, e3.edition], [true, 3], JSON.stringify(e3).slice(0, 300));
  assert.deepEqual(outcomesOf(w.fm(docText(w, e3))).map((r) => r.outcome), [b], "only what no ratified edition carries");
});

test("R74, R69: each pending outcome's text is judged with case-account R6's judgment as a row of kind outcome, after the four statements; its refusal is answered as R69's are, naming the outcome, and nothing is written; with the same act's outcome withdrawn the act prepares", () => {
  const { w, P, caseId } = setup();
  w.doc(DOC2);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const a = w.ci.carryOutcome({ case: caseId, ...OUTCOME, text: "The council saved 40,000 dollars.", by: "alice" }).outcome;
  /* case-disclosures R30's judgment stood in: it refuses the outcome's sentence as stating a fact its cites do not hold */
  w.judgeAccount = ({ statements }) => ({ refusals: statements.filter((r) => r.kind === "outcome").map((r) => ({ ok: false,
    reason: "ACCOUNT_FACT_NOT_IN_CITED", code: "ACCOUNT_FACT_NOT_IN_CITED", sentences: [r.ord] })) });
  const before = w.snapshot();
  const r = nextEdition(w, P, caseId, 2);
  assert.deepEqual([r.ok, r.code, r.outcomes], [false, "ACCOUNT_FACT_NOT_IN_CITED", [a]], JSON.stringify(r).slice(0, 300));
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const handed = w.judged.at(-1).statements.filter((x) => x.kind === "outcome");
  assert.deepEqual(handed.map((x) => [x.text, x.cites, x.outcome]), [["The council saved 40,000 dollars.", [{ kind: "finding", ref: Q, ord: null }], a]]);
  const kinds = w.judged.at(-1).statements.map((x) => x.kind);
  assert.ok(kinds.lastIndexOf("statement") < kinds.indexOf("outcome"), "after the four statements");
  /* the pre-flight lists it among blockers, as op=publish refuses it first */
  const pre = w.ca.publishPreflight({ ...AUTHORED, whatChanged: WHAT_CHANGED, project: P, targets: [Q], roles: { [Q]: "load_bearing" },
                                      viewer: V("alice"), author: "alice", caseId, ...fresh(2) });
  assert.equal(pre.first.code, "ACCOUNT_FACT_NOT_IN_CITED");
  /* control: withdrawn, nothing to judge, and the act prepares; the account block holds no outcome row */
  w.ci.withdrawCarriedOutcome({ outcome: a, reason: "the figure was wrong", by: "alice" });
  const ok = nextEdition(w, P, caseId, 2);
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.equal(w.judged.at(-1).statements.some((x) => x.kind === "outcome"), false);
});

test("R74 (real judgment): a carried outcome passes case-account R6 and is written into the account block as a row of kind outcome beside the outcomes: block", () => {
  const { w, P, caseId } = setup();
  w.doc(DOC2);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const a = w.ci.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).outcome;
  const e2 = nextEdition(w, P, caseId, 2);
  assert.equal(e2.ok, true, JSON.stringify(e2).slice(0, 400));
  const fm = w.fm(docText(w, e2));
  const rows = accountOf(fm);
  const list = Array.isArray(rows) ? rows : rows && rows.rows ? rows.rows : [];
  assert.ok(list.some((r) => r.kind === "outcome" && r.text === OUTCOME.text), JSON.stringify(rows).slice(0, 400));
  assert.deepEqual(outcomesOf(fm).map((r) => r.outcome), [a]);
});

test("R74 (T47): publishCase asks case-inputs.pendingOutcomes once, for the case R7 resolves, for an edition above its highest ratified one, and writes what it answers in that order; a minted case asks nothing and carries none", () => {
  const { w, P, caseId } = setup();
  w.doc(DOC2);
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const asked = [];
  const real = w.ci.pendingOutcomes.bind(w.ci);
  /* case-inputs R9's answer, stood in on its one instance: two outcomes in this order, whatever the table holds */
  const ROWS = [{ outcome: "OUTC-2026-0002", kind: "cure", text: "The clerk corrected the register.", cites: CITES,
                  on: "2026-09-21", carried_by: "bo", carried_at: "2026-09-28T01:00:00.000Z" },
                { outcome: "OUTC-2026-0001", kind: "success", text: OUTCOME.text, cites: CITES, on: OUTCOME.on,
                  carried_by: "alice", carried_at: "2026-09-28T01:00:00.000Z" }];
  w.ci.pendingOutcomes = (c) => { asked.push(c); return ROWS; };
  const e2 = nextEdition(w, P, caseId, 2);
  assert.equal(e2.ok, true, JSON.stringify(e2).slice(0, 300));
  assert.deepEqual(asked, [caseId], "asked once, for the case R7 resolves");
  assert.deepEqual(outcomesOf(w.fm(docText(w, e2))).map((r) => [r.outcome, r.kind]),
    [["OUTC-2026-0002", "cure"], ["OUTC-2026-0001", "success"]], "in the order carried");
  /* a minted case: nothing asked, no block */
  asked.length = 0;
  w.finding("INQ-2026-0009-z", [{ target: DOC }]);
  const P2 = w.project("Other", "alice", ["INQ-2026-0009-z"]);
  const fresh1 = w.publish(P2, "alice", ["INQ-2026-0009-z"]);
  assert.deepEqual([fresh1.ok, fresh1.minted, asked], [true, true, []]);
  assert.equal(w.fm(docText(w, fresh1)).outcomes, undefined);
  w.ci.pendingOutcomes = real;
});
