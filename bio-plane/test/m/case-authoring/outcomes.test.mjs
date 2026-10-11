/* case-authoring R71 and R65 (T45; N855 (6c); Actions D5, D6c; v0.2 §3 Success record, rule 17): outcomes carried into a
   case's next edition by a member's act (`carryOutcome`, the service `consequences` R22 calls), withdrawn with a reason,
   listed behind R19's member door, and pending until a ratified edition's signed document holds them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, DEAD } from "./fixture.mjs";
import { PUBLISH_ACT_CHECKS, OUTCOME_KINDS, AUTHORED_FIELDS, ACT_FIELDS } from "../../../src/case-authoring/index.mjs";

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
function refused(r, code, extra = {}) {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
    [false, code, code, PUBLISH_ACT_CHECKS[code].check, PUBLISH_ACT_CHECKS[code].translation], JSON.stringify(r).slice(0, 300));
  for (const [k, v] of Object.entries(extra)) assert.deepEqual(r[k], v);
}

test("R71: R71's six codes are new rows of this module's table, C-136.3–C-136.8, each with a translation", () => {
  const codes = ["MACHINE_CANNOT_CARRY_OUTCOME", "CARRY_NOT_A_PARTICIPANT", "BAD_CARRIED_OUTCOME", "NO_SUCH_CARRIED_OUTCOME",
                 "CARRIED_OUTCOME_SETTLED", "CARRY_NO_REASON"];
  assert.deepEqual(codes.map((c) => PUBLISH_ACT_CHECKS[c].check), ["C-136.3", "C-136.4", "C-136.5", "C-136.6", "C-136.7", "C-136.8"]);
  assert.ok(codes.every((c) => /Nothing was written\.$/.test(PUBLISH_ACT_CHECKS[c].translation)));
  assert.deepEqual(OUTCOME_KINDS, ["success", "cure", "harm_addressed"]);
});

test("R71: carryOutcome records one pending outcome of each kind by a joined participant's act and answers {ok: true, outcome}, an opaque id; the list shows it pending, in the order carried, with its cites as case-account R5 shapes them", () => {
  const { w, caseId } = setup();
  const ids = OUTCOME_KINDS.map((kind, i) => {
    const r = w.ca.carryOutcome({ case: caseId, ...OUTCOME, kind, text: `${OUTCOME.text} ${i}`, by: i === 1 ? "bo" : "alice" });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.match(r.outcome, /^OUTC-2026-\d{4}$/);
    return r.outcome;
  });
  assert.equal(new Set(ids).size, 3);
  const list = w.ca.carriedOutcomesOf({ case: caseId, viewer: V("bo") });
  assert.equal(list.ok, true);
  assert.deepEqual(list.outcomes.map((o) => [o.outcome, o.kind, o.text, o.cites, o.on, o.carried_by, o.state]),
    ids.map((id, i) => [id, OUTCOME_KINDS[i], `${OUTCOME.text} ${i}`, [{ kind: "finding", ref: Q, ord: null }], OUTCOME.on,
                        i === 1 ? "bo" : "alice", "pending"]));
});

test("R71: carryOutcome's refusals, in order, each writing nothing: MACHINE_CANNOT_CARRY_OUTCOME; NO_SUCH_CASE, one answer for a case with no ratified edition and one whose project the member does not see; CARRY_NOT_A_PARTICIPANT; BAD_CARRIED_OUTCOME naming the field", () => {
  const { w, P, caseId } = setup();
  const before = w.snapshot();
  for (const by of [null, "", "class:daemon"])
    refused(w.ca.carryOutcome({ case: caseId, ...OUTCOME, by }), "MACHINE_CANNOT_CARRY_OUTCOME");
  /* the machine fence first, even over a case that does not exist */
  refused(w.ca.carryOutcome({ case: "CASE-2026-0000", ...OUTCOME, by: "class:daemon" }), "MACHINE_CANNOT_CARRY_OUTCOME");
  const none = w.ca.carryOutcome({ case: "CASE-2026-0000", ...OUTCOME, by: "alice" });
  assert.equal(none.reason, "NO_SUCH_CASE");
  /* prepared but never ratified */
  const w2 = world(); w2.member("alice"); w2.doc(DOC); w2.finding(Q, [{ target: DOC }]);
  const P2 = w2.project("Team", "alice", [Q]);
  const prepared = w2.publish(P2, "alice", [Q]);
  assert.deepEqual(w2.ca.carryOutcome({ case: prepared.caseId, ...OUTCOME, by: "alice" }), none, "one answer");
  /* a project the member does not see in full: the project is hidden (the default) and di is no participant */
  assert.equal(w.membership.sight(P, V("di")), "none");
  assert.deepEqual(w.ca.carryOutcome({ case: caseId, ...OUTCOME, by: "di" }), none, "unseen answers as absent");
  /* seen, not joined: an invited member */
  assert.equal(w.membership.sight(P, V("cy")), "full");
  refused(w.ca.carryOutcome({ case: caseId, ...OUTCOME, by: "cy" }), "CARRY_NOT_A_PARTICIPANT");
  /* the participant fence before the shape */
  refused(w.ca.carryOutcome({ case: caseId, ...OUTCOME, kind: "story", by: "cy" }), "CARRY_NOT_A_PARTICIPANT");
  for (const [over, field] of [[{ kind: "story" }, "kind"], [{ kind: undefined }, "kind"],
                               [{ text: "" }, "text"], [{ text: "  " }, "text"], [{ text: 3 }, "text"], [{ text: "x".repeat(2001) }, "text"],
                               [{ text: 'she said "yes"' }, "text"], [{ text: "a\\b" }, "text"], [{ text: "a\nb" }, "text"],
                               [{ cites: undefined }, "cites"], [{ cites: "Q" }, "cites"], [{ cites: [{ kind: "story", ref: Q }] }, "cites"],
                               [{ cites: [{ kind: "leg", ref: Q }] }, "cites"],
                               [{ on: null }, "on"], [{ on: "2026-9-20" }, "on"], [{ on: "2026-02-30" }, "on"], [{ on: "2026-13-45" }, "on"]])
    refused(w.ca.carryOutcome({ case: caseId, ...OUTCOME, ...over, by: "alice" }), "BAD_CARRIED_OUTCOME", { field });
  assert.deepEqual(w.snapshot(), before, "nothing written by any refusal");
  /* controls: 2,000 characters and an empty cites list are legal */
  assert.equal(w.ca.carryOutcome({ case: caseId, ...OUTCOME, text: "x".repeat(2000), by: "alice" }).ok, true);
  assert.equal(w.ca.carryOutcome({ case: caseId, ...OUTCOME, cites: [], by: "alice" }).ok, true);
});

test("R71: withdrawCarriedOutcome withdraws a pending outcome with the member's reason; refusals in order, each writing nothing: MACHINE_CANNOT_CARRY_OUTCOME, NO_SUCH_CARRIED_OUTCOME (absent or unseen alike), CARRIED_OUTCOME_SETTLED (withdrawn already), CARRY_NO_REASON", () => {
  const { w, caseId } = setup();
  const o = w.ca.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).outcome;
  const before = w.snapshot();
  refused(w.ca.withdrawCarriedOutcome({ outcome: o, reason: "wrong", by: "class:daemon" }), "MACHINE_CANNOT_CARRY_OUTCOME");
  refused(w.ca.withdrawCarriedOutcome({ outcome: "OUTC-2026-0000", reason: "wrong", by: "alice" }), "NO_SUCH_CARRIED_OUTCOME");
  /* unseen: di does not see the hidden project */
  refused(w.ca.withdrawCarriedOutcome({ outcome: o, reason: "wrong", by: "di" }), "NO_SUCH_CARRIED_OUTCOME");
  for (const reason of [undefined, "", "   ", 7, "x".repeat(2001)])
    refused(w.ca.withdrawCarriedOutcome({ outcome: o, reason, by: "alice" }), "CARRY_NO_REASON");
  assert.deepEqual(w.snapshot(), before);
  const ok = w.ca.withdrawCarriedOutcome({ outcome: o, reason: "it was the wrong case", by: "bo" });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const listed = w.ca.carriedOutcomesOf({ case: caseId, viewer: V("alice") }).outcomes[0];
  assert.deepEqual([listed.state, listed.withdrawal.reason, listed.withdrawal.by], ["withdrawn", "it was the wrong case", "bo"]);
  const again = w.snapshot();
  refused(w.ca.withdrawCarriedOutcome({ outcome: o, reason: "again", by: "alice" }), "CARRIED_OUTCOME_SETTLED", { state: "withdrawn" });
  assert.deepEqual(w.snapshot(), again);
});

test("R71: carriedOutcomesOf is fenced as R19's member door: a joined participant of the case's project reads it; every other caller, an unknown case included, receives R19's dead answer, byte-identical", () => {
  const { w, caseId } = setup();
  w.ca.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" });
  assert.equal(w.ca.carriedOutcomesOf({ case: caseId, viewer: V("alice") }).ok, true);
  for (const [c, viewer] of [[caseId, V("cy")], [caseId, V("di")], [caseId, "class:daemon"], [caseId, null], [caseId, "alice"],
                             ["CASE-2026-0000", V("alice")], [null, V("alice")]])
    assert.deepEqual(w.ca.carriedOutcomesOf({ case: c, viewer }), DEAD);
});

test("R71: the outcomes and their withdrawals are append-only tables of this module, declared whole to record-core's purge as working material (R28's form)", () => {
  const { w, caseId } = setup();
  const o = w.ca.carryOutcome({ case: caseId, ...OUTCOME, by: "alice" }).outcome;
  w.ca.withdrawCarriedOutcome({ outcome: o, reason: "wrong", by: "alice" });
  assert.equal(w.count("carried_outcomes"), 1);
  assert.equal(w.count("carried_outcome_withdrawals"), 1);
  const declared = w.record.declaredTables().filter((d) => ["carried_outcomes", "carried_outcome_withdrawals"].includes(d.name));
  assert.deepEqual(declared.map((d) => [d.module, d.name, d.keys, d.purge]),
    [["case-authoring", "carried_outcomes", [], "clear"], ["case-authoring", "carried_outcome_withdrawals", [], "clear"]]);
  w.record.purge();
  assert.deepEqual([w.count("carried_outcomes"), w.count("carried_outcome_withdrawals")], [0, 0]);
});

test("R65 (T45; Actions D6c): R71's outcomes are never authored fields of publishCase: a body field naming them is refused CASE_FIELD_NOT_ALLOWED as any other, naming it, and nothing is written", () => {
  const { w, P } = setup();
  for (const f of ["outcomes", "outcome", "carriedOutcomes", "success", "cure", "harmAddressed"]) {
    assert.equal(AUTHORED_FIELDS.includes(f) || ACT_FIELDS.includes(f), false, f);
    const before = w.snapshot();
    const r = w.publish(P, "alice", [Q], { [f]: [{ kind: "success", text: "We won." }] });
    assert.deepEqual([r.ok, r.reason, r.fields], [false, "CASE_FIELD_NOT_ALLOWED", [f]]);
    assert.deepEqual(w.snapshot(), before);
  }
});
