/* consequences R3, R5, R6, R12: a member's assessment, the causation every part answers, and a revision as a successor. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { RATIONALE_MAX, REASON_MAX } from "../../../src/consequences/index.mjs";

const S = "STD-2026-0001-law";
const DOC = "INFO-2026-0001-budget";
const INQ = "INQ-2026-0001-cause";

function setup(opts) {
  const w = world(opts);
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.cid = w.figure(DOC, "Cut 100");
  w.base = { determination: w.D, standard: S, affected: { kind: "service", description: "library hours" },
             measure: { unit: "time", range: { low: 10, high: 20 } }, period: { from: "2026-01-01", to: "2026-03-31" },
             basis: { rationale: "the schedule shows fewer hours", rests_on: [] }, author: V("alice") };
  return w;
}

test("R3: a member's assessment carries the value or range, rationale, what it rests on, who and when", () => {
  const w = setup();
  const r = w.c.consequenceRecord({ ...w.base, basis: { rationale: "the schedule shows fewer hours", rests_on: [w.cid] } });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.part.state, "assessed");
  assert.deepEqual(r.part.measure.range, { low: 10, high: 20 });
  assert.deepEqual(r.part.assessment.rests_on, [w.cid]);
  assert.equal(r.part.assessment.by, V("alice"));
  assert.equal(r.part.assessment.at, "2026-09-28T01:00:00Z");
  assert.equal(r.part.grade, undefined, "an assessment is never graded as computed");
  assert.equal(r.part.computation, undefined);
  assert.match(r.part.label.says, /never presented, summed or graded as computed/);
  /* Resting on nothing is stated as none. */
  const none = w.c.consequenceRecord(w.base);
  assert.deepEqual(none.part.assessment.rests_on, []);
  assert.match(none.part.assessment.says, /resting on nothing in the record \(stated as none\)/);
  /* A finding (an inquiry) is something it may rest on; something the record does not hold is not. */
  w.inquiryAt(INQ, "open", { target: DOC });
  assert.equal(w.c.consequenceRecord({ ...w.base, basis: { rationale: "r", rests_on: [INQ] } }).ok, true);
  assert.equal(w.c.consequenceRecord({ ...w.base, basis: { rationale: "r", rests_on: ["INQ-2026-0099-none"] } }).reason,
               "NO_SUCH_EVIDENCE");
  assert.equal(w.c.consequenceRecord({ ...w.base, basis: { rationale: "r", rests_on: [DOC] } }).reason, "NO_SUCH_EVIDENCE",
               "a document is not a finding; its content is cited by content id");
  /* The rationale: required, at most 2,000 characters (and 2,000 lands). */
  assert.equal(w.c.consequenceRecord({ ...w.base, basis: { rests_on: [] } }).reason, "NO_RATIONALE");
  assert.equal(w.c.consequenceRecord({ ...w.base, basis: { rationale: "x".repeat(RATIONALE_MAX + 1) } }).reason, "BAD_RATIONALE");
  assert.equal(w.c.consequenceRecord({ ...w.base, basis: { rationale: "x".repeat(RATIONALE_MAX) } }).ok, true);
  /* A machine assessment is refused. */
  assert.equal(w.c.consequenceRecord({ ...w.base, author: "class:ai" }).reason, "MACHINE_CANNOT_ASSESS");
});

test("R5 R12: with no inquiry, or one not concluded, the causation is unproven, stated, and the part lands", () => {
  const w = setup();
  const none = w.c.consequenceRecord(w.base);
  assert.equal(none.ok, true);
  assert.equal(none.part.causation.state, "unproven");
  assert.match(none.part.causation.why, /sequence alone/);
  w.inquiryAt(INQ, "open", { target: DOC });
  const open = w.c.consequenceRecord({ ...w.base, causation: INQ });
  assert.equal(open.ok, true);
  assert.deepEqual([open.part.causation.state, open.part.causation.inquiry], ["unproven", INQ]);
  assert.match(open.part.causation.why, /not concluded/);
  assert.equal(w.c.consequenceRecord({ ...w.base, causation: DOC }).part.causation.state, "unproven", "a document is not an inquiry");
  assert.equal(w.c.consequenceRecord({ ...w.base, causation: "INQ-2026-0099-none" }).part.causation.state, "unproven");
  /* Unproven is never a low grade: an assessed part has no grade, and a computed one keeps its operands' grade. */
  const comp = w.c.consequenceRecord({ ...w.base, measure: { unit: "money" }, causation: INQ,
                                       basis: { op: "sum", operands: [{ content: w.cid, figure: "100" }] } });
  assert.equal(comp.part.causation.state, "unproven");
  assert.equal(comp.part.grade.grade, "B");
  /* R12: every part answers its causation, established or unproven. */
  const all = w.c.consequencesOf({ determination: w.D, viewer: V("alice") });
  assert.ok(all.parts.every((p) => ["established", "unproven"].includes(p.causation.state)));
  assert.deepEqual(all.unproven.sort(), all.parts.map((p) => p.id).sort());
});

test("R5 R12: a concluded inquiry establishes the causation, naming it, with its strength pair per axis", () => {
  const w = setup();
  w.inquiryAt(INQ, "open", { target: DOC });
  w.inquiryAt(INQ, "concluded", { target: DOC, prior: "open" });
  const r = w.c.consequenceRecord({ ...w.base, causation: INQ });
  assert.equal(r.part.causation.state, "established");
  assert.equal(r.part.causation.inquiry, INQ);
  const s = r.part.causation.strength;
  assert.deepEqual(Object.keys(s).filter((k) => k !== "says").sort(), ["capture", "connection", "testimony"]);
  const direct = w.strength.inquiryStrength({ id: INQ, viewer: V("alice") });
  assert.deepEqual([s.capture, s.connection, s.testimony], [direct.capture, direct.connection, direct.testimony]);
  assert.match(s.says, /never composed/);
  assert.equal(w.c.consequencesOf({ determination: w.D, viewer: V("alice") }).unproven.length, 0);
  /* A superseded inquiry's finding does not stand. */
  const sup = setup({ superseded: new Map([[INQ, ["INQ-2026-0002-next"]]]) });
  sup.inquiryAt(INQ, "open", { target: DOC });
  sup.inquiryAt(INQ, "concluded", { target: DOC, prior: "open" });
  assert.equal(sup.c.consequenceRecord({ ...sup.base, causation: INQ }).part.causation.state, "unproven");
});

test("R6: a part is never edited; a revision records a successor with R1's refusals, and the earlier part stays readable", () => {
  const w = setup();
  const first = w.c.consequenceRecord(w.base);
  const snap = JSON.stringify(w.c.consequenceRead({ id: first.id, viewer: V("alice") }).part.measure);
  const rev = w.c.consequenceRevise({ id: first.id, measure: { unit: "time", value: 12 }, reason: "the schedule was read again",
                                      author: V("alice") });
  assert.equal(rev.ok, true, JSON.stringify(rev));
  assert.equal(rev.part.supersedes, first.id);
  assert.equal(rev.part.reason, "the schedule was read again");
  assert.deepEqual([rev.part.determination, rev.part.standard, rev.part.affected.description],
                   [w.D, S, "library hours"], "the rest is carried from the earlier part");
  const old = w.c.consequenceRead({ id: first.id, viewer: V("alice") });
  assert.equal(old.ok, true);
  assert.equal(old.part.superseded_by, rev.id);
  assert.equal(JSON.stringify(old.part.measure), snap, "the earlier part is unchanged");
  /* Only the successor is live. */
  assert.deepEqual(w.c.consequencesOf({ determination: w.D, viewer: V("alice") }).parts.map((p) => p.id), [rev.id]);
  /* Refusals: the part superseded already; no reason; a reason too long; R1's (here, a member who has not joined, and a
     bad measure); a superseded determination refuses a revision as it refuses a part. */
  assert.equal(w.c.consequenceRevise({ id: first.id, reason: "again", author: V("alice") }).reason, "ALREADY_SUPERSEDED");
  assert.equal(w.c.consequenceRevise({ id: rev.id, reason: "", author: V("alice") }).reason, "NO_REASON");
  assert.equal(w.c.consequenceRevise({ id: rev.id, reason: "x".repeat(REASON_MAX + 1), author: V("alice") }).reason, "BAD_REASON");
  assert.equal(w.c.consequenceRevise({ id: rev.id, reason: "r", author: V("carol") }).reason, "NOT_A_PARTICIPANT");
  assert.equal(w.c.consequenceRevise({ id: rev.id, reason: "r", measure: { unit: "joy" }, author: V("alice") }).reason,
               "MEASURE_UNKNOWN_UNIT");
  assert.equal(w.c.consequenceRevise({ id: "CONS-2026-0999-x", reason: "r", author: V("alice") }).reason, "NO_SUCH_PART");
  w.determinations.get(w.D).superseded_by = "CONF-2026-0009-new";
  assert.equal(w.c.consequenceRevise({ id: rev.id, reason: "r", author: V("alice") }).reason, "NOT_NONCOMPLIANT");
  /* Its parts stay readable, not carried forward. */
  assert.equal(w.c.consequencesOf({ determination: w.D, viewer: V("alice") }).parts.length, 1);
});
