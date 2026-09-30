/* affordances and the contradiction inquiry (N345), driven over `contradiction`'s own fixture: its real record,
   membership, promotion, inquiry and contradiction modules, with the candidates laid down through contradiction's own
   doors (the pairing forms them, a run proposes them, a member takes one up). `affordanceFacts` (R14) is asked
   in-process through `affordancesOf(host, deps)` over that record; the providers it reads that the fixture does not
   build (connections, citation, publication, ratification) are stand-ins answering that nothing cites, rests on or
   publishes these documents. Measured here: the `contradiction_inquiry` fact read from the front matter (R14), the
   offer agreeing with the act on such an inquiry (R8, R18), the backing of the five N345 acts graded `reasoned` (R19),
   and the machine map's `contradictionresolve` entry against the answer its method gives (R20). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, cand, IQ, INFO, M1 } from "../contradiction/seed.mjs";
import { basisVersionsOf } from "../../../src/basis-versions/index.mjs";
import { affordancesOf, deriveActs, JUSTIFICATION_REFUSALS, MACHINE_REFUSALS, RUNGS } from "../../../src/affordances.mjs";

const NONE = { confirmed: [], severed: [] };
const factsOf = (w) => affordancesOf(w.host, {
  record: w.record, membership: w.membership, sql: w.st.sql, inquiry: w.k, basisVersions: w.bv,
  connections: { citesInto: () => NONE },
  citation: { retiredNotCitable: () => false },
  publication: { caseRelation: () => ({ member: false }) },
  ratification: { caseConclusionFor: () => ({ state: "none" }), editionsRecordingConclusion: () => ({ same: [] }) },
});
/* A world with one K2 duty taken up as a contradiction inquiry. */
const takenUp = () => {
  const w = seeded();
  const duty = cand(w, "K2", "record");
  const up = w.c.takeUp({ candidate: duty, question: "Did the fee rise or fall?", frame: "a", viewer: M1, author: M1 });
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  return { w, duty, inquiry: up.inquiry };
};
const NO_WHY = [undefined, "", "   "];

test("R14: contradiction_inquiry is true on an inquiry whose document carries `contradiction`, false on one whose "
   + "document does not, and null on a type that is not an inquiry", () => {
  const { w, inquiry } = takenUp();
  const a = factsOf(w);
  const taken = a.affordanceFacts({ target: inquiry, viewer: M1, identity: M1, author: M1 });
  assert.equal(taken.ok, true, JSON.stringify(taken).slice(0, 300));
  assert.equal(w.fm(inquiry).contradiction?.candidate?.length, 64, "the document carries the link");
  assert.equal(taken.contradiction_inquiry, true);
  /* a plain inquiry, promoted through the same door with no `contradiction`: the one the take-up's legs rest on */
  const plainId = "INQ-2026-0009-plain";
  const md = w.text(inquiry).replace(/^contradiction:\n(?:[ ].*\n)+/m, "").replace(/^id: .*$/m, `id: ${plainId}`);
  assert.ok(!/^contradiction:/m.test(md));
  const made = w.promotion.promote({ bundleId: plainId, base: null, snapKey: "plain1", author: M1,
    files: [{ path: "bundle.md", text: md }], meta: { object_type: "inquiry" } });
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 400));
  const plain = a.affordanceFacts({ target: plainId, viewer: M1, identity: M1, author: M1 });
  assert.deepEqual([plain.ok, plain.contradiction_inquiry], [true, false]);
  /* an inquiry holding no document at all reads false, and an information bundle null */
  assert.equal(a.affordanceFacts({ target: IQ.a, viewer: M1 }).contradiction_inquiry, false);
  assert.equal(a.affordanceFacts({ target: INFO.a, viewer: M1 }).contradiction_inquiry, null);
});

test("R8 R18: on a contradiction inquiry the pre-flight offers contradictionresolve and not conclude; the act it offers "
   + "is accepted well-formed, and the one it withholds is refused (inquiry R47: no kind recorded)", () => {
  const { w, inquiry } = takenUp();
  const f = factsOf(w).affordanceFacts({ target: inquiry, viewer: M1, identity: M1, author: M1 });
  const ids = deriveActs(f).map((a) => a.id);
  assert.ok(ids.includes("contradictionresolve"), ids.join(","));
  assert.ok(!ids.includes("conclude"), ids.join(","));
  /* the withheld act: concluding it through basis-versions' door with no resolution is refused at the record's door */
  const plainConclude = w.bv.conclude({ target: inquiry, conclusion: "it rose", author: M1, viewer: M1 });
  assert.equal(plainConclude.ok, false, JSON.stringify(plainConclude).slice(0, 300));
  assert.match(JSON.stringify(plainConclude), /RESOLUTION_MISSING/);
  /* the offered act, well-formed, by the same member */
  const ok = w.c.resolve({ inquiry, resolution: { kind: "irreconcilable" }, conclusion: "both stand", viewer: M1, author: M1 });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  /* concluded, it is offered neither (no edge to `concluded`; resolve has no project arm) */
  const after = deriveActs(factsOf(w).affordanceFacts({ target: inquiry, viewer: M1, identity: M1, author: M1 }))
    .map((a) => a.id);
  assert.ok(!after.includes("contradictionresolve") && !after.includes("conclude"), after.join(","));
  /* and a plain inquiry is offered conclude, never resolve */
  const plain = deriveActs({ object_type: "inquiry", current_state: "open", contradiction_inquiry: false }).map((a) => a.id);
  assert.ok(plain.includes("conclude") && !plain.includes("contradictionresolve"));
});

test("R20 R10: contradictionresolve's method answers a machine author MACHINE_CANNOT_ACT_ON_CANDIDATE, the code "
   + "MACHINE_REFUSALS maps it to, and a machine is not offered it", () => {
  const { w, inquiry } = takenUp();
  for (const author of ["class:ai", "class:ai/tok1", "token:member"]) {
    const r = w.c.resolve({ inquiry, resolution: { kind: "irreconcilable" }, conclusion: "c", viewer: M1, author });
    assert.equal(r.reason, MACHINE_REFUSALS.contradictionresolve, author);
  }
  const f = factsOf(w).affordanceFacts({ target: inquiry, viewer: M1, identity: M1, author: "class:ai" });
  assert.equal(f.actor_is_machine, true);
  assert.ok(!deriveActs(f).some((a) => a.id === "contradictionresolve"));
});

test("R19: contradictiondismiss, graded `reasoned`, is refused without the lead's reason with a code in "
   + "JUSTIFICATION_REFUSALS, and accepted with one", () => {
  const w = seeded();
  const lead = cand(w, "K2", "world");
  assert.equal(RUNGS.contradictiondismiss, "reasoned");
  for (const reason of NO_WHY) {
    const r = w.c.dismiss({ candidate: lead, reason, viewer: M1, author: M1 });
    assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${JSON.stringify(reason)}: ${JSON.stringify(r).slice(0, 200)}`);
  }
  assert.equal(w.c.dismiss({ candidate: lead, reason: "not_same_matter", viewer: M1, author: M1 }).ok, true);
});

test("R19: contradictionclarify, graded `reasoned`, is refused without its explanation (differs) or without why a side "
   + "is wrong (one_wrong), each with a code in JUSTIFICATION_REFUSALS, and accepted with one", () => {
  assert.equal(RUNGS.contradictionclarify, "reasoned");
  for (const why of NO_WHY) {
    const w = seeded();
    const duty = cand(w, "K2", "record");
    const differs = w.c.clarify({ candidate: duty, choice: "differs", coordinates: ["scope"], explanation: why, viewer: M1, author: M1 });
    assert.ok(JUSTIFICATION_REFUSALS.includes(differs.reason), `differs ${JSON.stringify(why)}: ${JSON.stringify(differs).slice(0, 200)}`);
    const wrong = w.c.clarify({ candidate: duty, choice: "one_wrong", wrongSide: "a", reason: why, viewer: M1, author: M1 });
    assert.ok(JUSTIFICATION_REFUSALS.includes(wrong.reason), `one_wrong ${JSON.stringify(why)}: ${JSON.stringify(wrong).slice(0, 200)}`);
  }
  const w = seeded();
  const duty = cand(w, "K2", "record");
  const ok = w.c.clarify({ candidate: duty, choice: "differs", coordinates: ["scope"], explanation: "one counts the base fee",
                           viewer: M1, author: M1 });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  const wrong = w.c.clarify({ candidate: duty, choice: "one_wrong", wrongSide: "a", reason: "the minutes were misread",
                              viewer: M1, author: M1 });
  assert.equal(wrong.ok, true, JSON.stringify(wrong).slice(0, 300));
});

test("R19: contradictiontakeup, graded `reasoned`, is refused without the member's question with a code in "
   + "JUSTIFICATION_REFUSALS, and accepted with one", () => {
  const w = seeded();
  const duty = cand(w, "K2", "record");
  assert.equal(RUNGS.contradictiontakeup, "reasoned");
  for (const question of [...NO_WHY, null]) {
    const r = w.c.takeUp({ candidate: duty, question, frame: "a", viewer: M1, author: M1 });
    assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${JSON.stringify(question)}: ${JSON.stringify(r).slice(0, 200)}`);
  }
  assert.equal(w.c.takeUp({ candidate: duty, question: "Which holds?", frame: "b", viewer: M1, author: M1 }).ok, true);
});

test("R19: contradictionresolve, graded `reasoned`, concluding through basis-versions' own `conclude` without its "
   + "conclusion, is refused with a code in JUSTIFICATION_REFUSALS", () => {
  const { w, inquiry } = takenUp();
  /* the real basis-versions over this record answers the conclusion the act delegates (contradiction R36; its R16) */
  const real = basisVersionsOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion,
                                         content: w.content, inquiry: w.k });
  w.bv.conclude = (args) => real.conclude(args);
  assert.equal(RUNGS.contradictionresolve, "reasoned");
  for (const conclusion of NO_WHY) {
    const r = w.c.resolve({ inquiry, resolution: { kind: "irreconcilable" }, conclusion, viewer: M1, author: M1 });
    assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${JSON.stringify(conclusion)}: ${JSON.stringify(r).slice(0, 200)}`);
  }
});

test("R19: resolutiondefect, graded `reasoned`, is refused without its reason with a code in JUSTIFICATION_REFUSALS, "
   + "and accepted with one", () => {
  const w = seeded();
  assert.equal(RUNGS.resolutiondefect, "reasoned");
  const args = { captureSha: "capA", ref: "ref:1", entityId: "E1", by: M1 };
  for (const reason of NO_WHY) {
    const r = w.entities.reportResolutionDefect({ ...args, reason });
    assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${JSON.stringify(reason)}: ${JSON.stringify(r).slice(0, 200)}`);
  }
  const ok = w.entities.reportResolutionDefect({ ...args, reason: "the reference names a different body" });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
});
