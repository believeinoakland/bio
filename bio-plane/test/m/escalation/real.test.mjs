/* escalation over the real layer-9 providers merged into the tranche (K250, K252): conformance's own scene (a
   published finding, a standard in force, a project with olive its owner and pat joined), escalation reaching
   `conformanceOf` and `consequencesModule` through its factory defaults on the same host. Actions and filings are
   stand-ins until they merge. */
import test from "node:test";
import assert from "node:assert/strict";
import { scene, V } from "../conformance/fixture.mjs";
import { escalationOf } from "../../../src/escalation/index.mjs";

function real() {
  const s = scene();
  const { w } = s;
  const actions = { actionRead: () => ({ ok: false, reason: "NO_SUCH_BUNDLE" }), actionFacts: () => ({ clock_next: null }) };
  const filings = { filingsFor: () => ({ ok: true, drafts: [], packets: [] }), availableActions: () => ({ ok: true, kinds: [] }) };
  s.esc = escalationOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, actions, filings,
                                 now: () => w.clock.now });
  s.esc.migrate();
  return s;
}

test("R1 R4 R14 over the real conformance: a live noncompliant determination opens at stage 1 pursuing its noncompliant standard, the actor's office proposes 1→2, and compliance is restored only by a later live compliant determination of the same act id; consequences, read through the real module, stays undetermined with none recorded", () => {
  const x = real();
  const d = x.w.c.determine(x.input());
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  /* pat, joined, opens it */
  const o = x.esc.escalationOpen({ determination: d.id, author: V("pat"), viewer: V("pat") });
  assert.equal(o.ok, true, JSON.stringify(o).slice(0, 400));
  assert.deepEqual(o.standards, [x.std]);
  assert.deepEqual(o.proposed.map((p) => [p.from, p.to, p.ids]), [[1, 2, [d.id]]]);
  /* quinn, outside the project, sees neither */
  assert.equal(x.esc.escalationOpen({ determination: d.id, author: V("quinn"), viewer: V("quinn") }).reason, "NO_SUCH_DETERMINATION");
  assert.equal(x.esc.escalationRead({ id: o.id, viewer: V("quinn") }).reason, "NO_SUCH_ESCALATION");
  let exit = x.esc.escalationRead({ id: o.id, viewer: V("pat") }).exit;
  assert.deepEqual([exit.compliance.state, exit.consequences.state, exit.consequences.why], ["not_met", "undetermined", "no consequence recorded"]);
  /* a later compliant determination of the same act restores compliance; consequences still stops the end */
  x.w.clock.now = "2026-10-05T00:00:00Z";
  const act = x.w.c.determinationRead({ id: d.id, viewer: V("olive") }).act.id;
  const c = x.w.c.determine(x.input({ act: { ...x.input().act, id: act }, standards: [{ standard: x.std, outcome: "compliant" }],
    rows: [{ standard: x.std, requires: "thirty days' public notice before a closure", did: "gave the notice", reading: "aligns",
             content: x.input().rows[0].content }] }));
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  exit = x.esc.escalationRead({ id: o.id, viewer: V("pat") }).exit;
  assert.deepEqual([exit.compliance.state, exit.compliance.ids], ["met", [c.id]]);
  assert.equal(x.esc.escalationEnd({ id: o.id, author: V("pat"), viewer: V("pat") }).reason, "CONSEQUENCES_UNDETERMINED");
});
