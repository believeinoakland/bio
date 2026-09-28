/* affordances: R19's backing for `narrow` and `triage`, driven at basis-versions' and intent's own interfaces over their
   fixtures (a reading whose leg cites a part of a document; open proposals), which the plane fixture does not build. Everything else R19 drives is in
   `plane.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, V } from "../basis-versions/fixture.mjs";
import { seeded, V as IV } from "../intent/fixture.mjs";
import { JUSTIFICATION_REFUSALS, RUNGS } from "../../../src/affordances.mjs";

test("R19: narrow, graded `reasoned` (R27), called well-formed but without its account of what changed, is refused "
   + "with a code in JUSTIFICATION_REFUSALS, and with one it is accepted", () => {
  const DOC = "INFO-2026-0001-a", Q2 = "INQ-2026-0002-r", Q = "INQ-2026-0001-q";
  const w = world();
  w.doc(DOC);
  assert.equal(w.inquiry(Q2, block({})).ok, true);
  assert.equal(w.inquiry(Q, block(merge(version("first", [DOC, Q2], { claim: "the claim" }), { grounds: [], legs: [] }))).ok, true);
  const args = { target: Q, version: "first", ord: 0, author: "member:alice", viewer: V("alice"), name: "first narrowed",
                 extent: { extent_kind: "pdf-page", extent_page: "2" } };
  assert.equal(RUNGS.narrow, "reasoned");
  for (const description of [undefined, "", "   "]) {
    const r = w.bv.narrow({ ...args, description });
    assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${JSON.stringify(description)}: ${r.reason}`);
  }
  assert.equal(w.bv.narrow({ ...args, description: "points at page three, where the vote is recorded" }).ok, true);
});

test("R19: triage, graded `reasoned` (K219), is refused without a reason where it sets a proposal down (defer, dismiss), "
   + "and adopting — which revises nothing — asks none (K212)", async () => {
  const w = seeded();
  w.entity("ENT-1"); w.define();
  await w.thread("ENT-1", { need: "A" });
  w.i.registerSource("monitoring", () => [{ key: "c-1", kind: "capture-failed", grade: null, basis: { n: 1 }, instances: [] },
                                          { key: "c-2", kind: "capture-failed", grade: null, basis: { n: 2 }, instances: [] }]);
  assert.equal(RUNGS.triage, "reasoned");
  for (const act of ["defer", "dismiss"])
    for (const reason of [undefined, "", "  "]) {
      const r = w.i.triage({ proposal: "monitoring::c-2", act, reason, author: IV("bob") });
      assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${act} ${JSON.stringify(reason)}: ${r.reason}`);
    }
  assert.equal(w.i.triage({ proposal: "monitoring::c-1", act: "adopt", project: w.P, author: IV("bob"), viewer: IV("bob") }).ok, true);
  assert.equal(w.i.triage({ proposal: "monitoring::c-2", act: "defer", reason: "not now", author: IV("bob"), viewer: IV("bob") }).ok, true);
});

/* T8 layer 11: layer 9's six `reasoned` acts, driven at their own modules' interfaces over their fixtures (the durable
   object dispatches none of layer 9's ops until N216, K250). Each is called well-formed but without its reason, then
   with one; escalationresume, `reversible`, is taken back by a further suspension. */
import { world as cWorld, V as CV } from "../consequences/fixture.mjs";
import { seeded as escSeeded, opened, toStage, V as EV } from "../escalation/fixture.mjs";
import { RUNG_ABSENT } from "../../../src/affordances.mjs";

const cScene = () => {
  const S = "STD-2026-0001-law", DOC = "INFO-2026-0001-doc", INQ = "INQ-2026-0001-cause";
  const w = cWorld();
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.cid = w.figure(DOC, "Restored 100");
  w.inquiryAt(INQ, "open", { target: DOC });
  w.inquiryAt(INQ, "concluded", { target: DOC, prior: "open" });
  const r = w.c.consequenceRecord({ determination: w.D, standard: S, affected: { kind: "fund", description: "f" },
    period: { from: "2026-01-01", to: "2026-12-31" }, measure: { unit: "money", value: 10 }, basis: { rationale: "r" },
    causation: INQ, author: CV("alice") });
  assert.equal(r.ok, true, JSON.stringify(r));
  w.id = r.id;
  return w;
};
const NO_WHY = [undefined, "", "   "];

test("R19: consequencerevise and addressedrecord, graded `reasoned`, are refused without their reason with a code in "
   + "JUSTIFICATION_REFUSALS, and accepted with one", () => {
  assert.equal(RUNGS.consequencerevise, "reasoned"); assert.equal(RUNGS.addressedrecord, "reasoned");
  for (const reason of NO_WHY) {
    const w = cScene();
    const rv = w.c.consequenceRevise({ id: w.id, reason, author: CV("alice") });
    assert.ok(JUSTIFICATION_REFUSALS.includes(rv.reason), `revise ${JSON.stringify(reason)}: ${JSON.stringify(rv).slice(0, 200)}`);
    const ad = w.c.addressedRecord({ id: w.id, state: "addressed", evidence: [w.cid], reason, author: CV("alice") });
    assert.ok(JUSTIFICATION_REFUSALS.includes(ad.reason), `addressed ${JSON.stringify(reason)}: ${JSON.stringify(ad).slice(0, 200)}`);
  }
  const w = cScene();
  const ad = w.c.addressedRecord({ id: w.id, state: "addressed", evidence: [w.cid], reason: "the fund was restored", author: CV("alice") });
  assert.equal(ad.ok, true, JSON.stringify(ad));
  const rv = w.c.consequenceRevise({ id: w.id, reason: "the figure was corrected", author: CV("alice") });
  assert.equal(rv.ok, true, JSON.stringify(rv).slice(0, 300));
});

test("R19: escalationevaluate, escalationadvance, escalationdecline and escalationsuspend, graded `reasoned`, are "
   + "refused without their reason with a code in JUSTIFICATION_REFUSALS, and accepted with one", () => {
  const who = { author: EV("bob"), viewer: EV("bob") };
  for (const op of ["escalationevaluate", "escalationadvance", "escalationdecline", "escalationsuspend"])
    assert.equal(RUNGS[op], "reasoned", op);
  for (const reason of NO_WHY) {
    const a = escSeeded(); opened(a);
    for (const [op, r] of [["advance", a.esc.escalationAdvance({ id: a.E, to: 2, reason, ...who })],
                           ["decline", a.esc.escalationDecline({ id: a.E, to: 2, reason, ...who })],
                           ["suspend", a.esc.escalationSuspend({ id: a.E, reason, ...who })]])
      assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${op} ${JSON.stringify(reason)}: ${JSON.stringify(r).slice(0, 200)}`);
    const e = escSeeded(); toStage(e, 4);
    const ev = e.esc.escalationEvaluate({ id: e.E, reading: "none", reason, ...who });
    assert.ok(JUSTIFICATION_REFUSALS.includes(ev.reason), `evaluate ${JSON.stringify(reason)}: ${JSON.stringify(ev).slice(0, 200)}`);
  }
  const a = escSeeded(); opened(a);
  assert.equal(a.esc.escalationDecline({ id: a.E, to: 2, reason: "not yet", ...who }).ok, true);
  assert.equal(a.esc.escalationAdvance({ id: a.E, to: 2, reason: "the notice is due", ...who }).ok, true);
  const e = escSeeded(); toStage(e, 4);
  const ev = e.esc.escalationEvaluate({ id: e.E, reading: "none", reason: "no response came", ...who });
  assert.equal(ev.ok, true, JSON.stringify(ev).slice(0, 300));
});

test("R2: escalationresume, graded `reversible`, is taken back by a published act — a further suspension — and "
   + "escalationsuspend, which it takes back, is stated at its higher rung `reasoned`", () => {
  const who = { author: EV("bob"), viewer: EV("bob") };
  assert.equal(RUNGS.escalationresume, "reversible"); assert.ok(!Object.hasOwn(RUNG_ABSENT, "escalationresume"));
  const w = escSeeded(); opened(w);
  assert.equal(w.esc.escalationSuspend({ id: w.E, reason: "waiting on counsel", ...who }).ok, true);
  assert.equal(w.esc.escalationResume({ id: w.E, ...who }).ok, true);
  assert.equal(w.esc.escalationRead({ id: w.E, viewer: EV("bob") }).state, "open");
  assert.equal(w.esc.escalationSuspend({ id: w.E, reason: "waiting again", ...who }).ok, true);
  const state = () => w.esc.escalationRead({ id: w.E, viewer: EV("bob") }).state;
  assert.equal(state(), "suspended");
  assert.equal(w.esc.escalationResume({ id: w.E, ...who }).ok, true);
  assert.equal(state(), "open");
});
