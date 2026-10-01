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

/* Layer 9's six acts graded `reasoned` (K264; their rows restored in T9 with N216), driven at their own modules'
   interfaces over their fixtures. Each is called well-formed but without its reason, then with one; escalationresume,
   graded `reversible`, is taken back by a further suspension. */
import { world as cWorld, V as CV } from "../consequences/fixture.mjs";
import { seeded as escSeeded, opened, toStage, V as EV } from "../escalation/fixture.mjs";

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

test("R19: consequencerevise and addressedrecord, graded `reasoned` (K264), are refused without their reason with a code in "
   + "JUSTIFICATION_REFUSALS, and accepted with one", () => {
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

test("R2: escalationresume, graded `reversible` (K264), is taken back by a published act — a further suspension — and "
   + "escalationsuspend, which it takes back, is stated at its higher rung `reasoned`", () => {
  const who = { author: EV("bob"), viewer: EV("bob") };
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

/* N310 (with conformance's N233): `determine`, graded `reasoned`, driven at conformance's interface over its fixture's
   scene (a published finding and a standard in force). A first determination replaces nothing and asks no reason
   (K212); a supersession, which revises what stands, is refused without its reason and accepted with one. */
import { scene as confScene } from "../conformance/fixture.mjs";

test("R19: determine, graded `reasoned` (N310), superseding a determination without its reason is refused with a code "
   + "in JUSTIFICATION_REFUSALS, and with one it is accepted; a first determination, which replaces nothing, asks none", () => {
  assert.equal(RUNGS.determine, "reasoned");
  const { w, input } = confScene();
  const first = w.c.determine(input());
  assert.equal(first.ok, true, JSON.stringify(first).slice(0, 300));
  for (const reason of NO_WHY) {
    const r = w.c.determine(input({ supersedes: first.id, reason }));
    assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason), `${JSON.stringify(reason)}: ${JSON.stringify(r).slice(0, 200)}`);
  }
  const next = w.c.determine(input({ supersedes: first.id, reason: "a second notice rule applies" }));
  assert.equal(next.ok, true, JSON.stringify(next).slice(0, 300));
});

/* K727 (T18): action-plans' five acts graded `reasoned` and its scenario graded `reversible`, driven at action-plans'
   interface over its fixture (a project, a plan over its subjects, options). */
import { seeded as apSeeded, opened as apOpened, option as apOption, choose as apChoose, by as apBy } from "../action-plans/fixture.mjs";

test("R19: plansubjectadd, plansubjectremove, optionrevise, optiondispose (setting an option down) and planclose, graded "
   + "`reasoned` (K727), are refused without their reason with a code in JUSTIFICATION_REFUSALS, and accepted with one", () => {
  for (const op of ["plansubjectadd", "plansubjectremove", "optionrevise", "optiondispose", "planclose"])
    assert.equal(RUNGS[op], "reasoned", op);
  const scene = () => { const w = apSeeded(); apOpened(w, [w.SI, w.S1]); w.A = apOption(w); return w; };
  const acts = {
    plansubjectadd: (w, reason) => w.ap.planSubjectAdd({ plan: w.PL, subject: w.S3, reason, ...apBy("bob") }),
    plansubjectremove: (w, reason) => w.ap.planSubjectRemove({ plan: w.PL, subject: w.S1, reason, ...apBy("bob") }),
    optionrevise: (w, reason) => w.ap.optionRevise({ plan: w.PL, option: w.A, summary: "Write again", reason, ...apBy("bob") }),
    optiondispose: (w, reason) => w.ap.optionDispose({ plan: w.PL, options: [w.A], disposition: "declined", reason, ...apBy("bob") }),
    planclose: (w, reason) => w.ap.planClose({ id: w.PL, reason, ...apBy("bob") }),
  };
  for (const [op, act] of Object.entries(acts)) {
    for (const reason of NO_WHY) {
      const r = act(scene(), reason);
      assert.ok(JUSTIFICATION_REFUSALS.includes(r.reason ?? r.code), `${op} ${JSON.stringify(reason)}: ${JSON.stringify(r).slice(0, 200)}`);
    }
    const ok = act(scene(), "the group decided so at its meeting");
    assert.equal(ok.ok, true, `${op}: ${JSON.stringify(ok).slice(0, 300)}`);
  }
  /* optiondispose asks no reason where it revises nothing that stands (choosing), K212 */
  const w = scene();
  assert.equal(w.ap.optionDispose({ plan: w.PL, options: [w.A], disposition: "chosen", ...apBy("bob") }).ok, true);
});

test("R2: scenarioset, graded `reversible` (K727), asks no reason and is taken back by a published act — a further "
   + "scenarioset replaces it whole, the earlier version kept in history", () => {
  assert.equal(RUNGS.scenarioset, "reversible");
  const w = apSeeded(); apOpened(w); const A = apOption(w); apChoose(w, [A]);
  const phases = [{ id: "ask", name: "Ask", options: [A], starts: "plan_start" }];
  assert.equal(w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "First line", phases, ...apBy("bob") }).ok, true);
  assert.equal(w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "Second line", phases, ...apBy("bob") }).ok, true);
  const sc = w.ap.planRead({ id: w.PL, nowMs: Date.now(), viewer: "member:bob" }).scenarios.find((s) => s.scenario === 1);
  assert.deepEqual([sc.name, sc.version], ["Second line", 2]);
  assert.ok(sc.history.some((h) => h.name === "First line"), "the earlier version is kept");
});
