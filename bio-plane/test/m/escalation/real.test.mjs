/* escalation over the real layer-9 providers merged into the tranche (K250, K252): conformance's own scene (a
   published finding, a standard in force, a project with olive its owner and pat joined), escalation reaching
   `conformanceOf`, `consequencesModule` and `actionsOf` through its factory defaults on the same host (K250, K252,
   K253). Filings is a stand-in until it merges. */
import test from "node:test";
import assert from "node:assert/strict";
import { scene, V } from "../conformance/fixture.mjs";
import { escalationOf } from "../../../src/escalation/index.mjs";
import { actionsOf } from "../../../src/actions/index.mjs";

function real() {
  const s = scene();
  const { w } = s;
  const filings = { filingsFor: () => ({ ok: true, drafts: [], packets: [] }), availableActions: () => ({ ok: true, kinds: [] }) };
  /* actions on this host without retrieval's projection columns, which conformance's scene does not migrate; escalation
     then reaches this instance through its default (one instance per host). */
  actionsOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, retrieval: null, conformance: w.c });
  s.esc = escalationOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, filings,
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

test("R9 over the real actions: a breach action resting on the determination attaches at stage 2; one not recorded for the breach does not; an absent one is NO_SUCH_ACTION", () => {
  const x = real();
  const d = x.w.c.determine(x.input());
  const o = x.esc.escalationOpen({ determination: d.id, author: V("pat"), viewer: V("pat") });
  const E = o.id;
  assert.equal(x.esc.escalationAdvance({ id: E, to: 2, reason: "Notify.", author: V("pat"), viewer: V("pat") }).ok, true);
  const actions = x.esc.actions;
  let k = 0;
  const actionMd = (id, breach, target) => ["---", `id: ${id}`, "object_type: action", `title: ${id}`, "current_state: planned",
    'created: "2026-09-28T01:00:00Z"', 'last_updated: "2026-09-28T01:00:00Z"', "action_kind: other",
    "counterparty:", "  state: named", "  role: Director of Parks", "  body: Parks Department",
    `breach: ${breach}`, "action_basis:", `  - target: ${target}`, "    kind: rests_on", "---", "", "A notice.", ""].join("\n");
  const make = (id, breach, target) => {
    const r = x.w.promotion.promote({ bundleId: id, base: null, snapKey: `20260928T010000Z_000000a${++k}`, author: V("pat"), viewer: V("pat"),
      files: [{ path: "bundle.md", text: actionMd(id, breach, target) }], meta: { object_type: "action" } });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
    return id;
  };
  const N = make("ACTN-2026-0001-notice", true, d.id);
  const plain = make("ACTN-2026-0002-records", false, d.id);
  assert.equal(actions.actionRead({ id: N, viewer: V("pat") }).breach, true);
  assert.equal(x.esc.escalationAttach({ id: E, action: plain, author: V("pat"), viewer: V("pat") }).reason, "NOT_A_BREACH_ACTION");
  assert.equal(x.esc.escalationAttach({ id: E, action: "ACTN-2026-0999-none", author: V("pat"), viewer: V("pat") }).reason, "NO_SUCH_ACTION");
  assert.equal(x.esc.escalationAttach({ id: E, action: N, author: V("pat"), viewer: V("pat") }).ok, true);
  assert.deepEqual(x.esc.escalationRead({ id: E, viewer: V("pat") }).actions.map((a) => [a.action, a.stage]), [[N, 2]]);
});

test.todo("R5 R6 over the real actions: a sent entry on the attached breach action, recorded through actions.actionCorrespond, meets 2→3, and a reply after it meets 3→4 — blocked by actions: actionCorrespond (and its other acts that revise an action) promote without the viewer, so actions' own R8 check reads the determination with no viewer, the real conformance answers it unseen, and every correspondence on a breach action is refused ACTION_NO_DETERMINATION (REPORT J3). Stages 2 and 3 are tested over the actions stand-in in stages.test.mjs.");
