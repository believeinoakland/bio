/* escalation over the real layer-9 providers merged into the tranche (K250, K252): conformance's own scene (a
   published finding, a standard in force, a project with olive its owner and pat joined), escalation reaching
   `conformanceOf`, `consequencesModule` and `actionsOf` through its factory defaults on the same host (K250, K252,
   K253) and `filingsOf` (B8). */
import test from "node:test";
import assert from "node:assert/strict";
import { scene, V } from "../conformance/fixture.mjs";
import { escalationOf } from "../../../src/escalation/index.mjs";
import { actionsOf, noSuchAction } from "../../../src/actions/index.mjs";
import { noSuchDetermination, determinationSuperseded } from "../../../src/conformance/index.mjs";

function real() {
  const s = scene();
  const { w } = s;
  /* actions on this host without retrieval's projection columns, which conformance's scene does not migrate; escalation
     then reaches this instance through its default (one instance per host). */
  actionsOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, retrieval: null, conformance: w.c });
  s.esc = escalationOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion,
                                 now: () => w.clock.now });
  return s;
}

test("R1 R4 R14 over the real conformance: a live noncompliant determination opens at stage 1 pursuing its noncompliant standard, the actor's office proposes 1→2, and compliance is restored only by a later live compliant determination of the same act id; consequences, read through the real module, stays undetermined with none recorded", () => {
  const x = real();
  const d = x.w.c.determine(x.input());
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  /* pat, joined, opens it */
  const o = x.esc.escalationOpen({ reason: "Worth pursuing.", determination: d.id, author: V("pat"), viewer: V("pat") });
  assert.equal(o.ok, true, JSON.stringify(o).slice(0, 400));
  assert.deepEqual(o.standards, [x.std]);
  assert.deepEqual(o.proposed.map((p) => [p.from, p.to, p.ids]), [[1, 2, [d.id]]]);
  /* quinn, outside the project, sees neither */
  assert.equal(x.esc.escalationOpen({ reason: "Worth pursuing.", determination: d.id, author: V("quinn"), viewer: V("quinn") }).reason, "NO_SUCH_DETERMINATION");
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
  const o = x.esc.escalationOpen({ reason: "Worth pursuing.", determination: d.id, author: V("pat"), viewer: V("pat") });
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
  assert.equal(x.esc.escalationAttach({ reason: "This act serves the stage.", id: E, action: plain, author: V("pat"), viewer: V("pat") }).reason, "NOT_A_BREACH_ACTION");
  assert.deepEqual(x.esc.escalationAttach({ reason: "This act serves the stage.", id: E, action: "ACTN-2026-0999-none", author: V("pat"), viewer: V("pat") }),
                   noSuchAction("ACTN-2026-0999-none"), "actions' one answer (its R43)");
  assert.equal(x.esc.escalationAttach({ reason: "This act serves the stage.", id: E, action: N, author: V("pat"), viewer: V("pat") }).ok, true);
  assert.deepEqual(x.esc.escalationRead({ id: E, viewer: V("pat") }).actions.map((a) => [a.action, a.stage]), [[N, 2]]);
  /* filings, reached through its default on this host, answers the available actions for the determination (R8's read) */
  const av = x.esc.filings.availableActions({ determination: d.id, viewer: V("pat") });
  assert.equal(av.ok, true, JSON.stringify(av).slice(0, 300));
  assert.equal(av.determination, d.id);
});

test("R5 R6 R7 over the real actions (K256): a sent entry on the attached breach action, recorded through actions.actionCorrespond, meets 2→3 at its date; a reply after it meets 3→4; the reply is evaluated at stage 4", () => {
  const x = real();
  const d = x.w.c.determine(x.input());
  const E = x.esc.escalationOpen({ reason: "Worth pursuing.", determination: d.id, author: V("pat"), viewer: V("pat") }).id;
  assert.equal(x.esc.escalationAdvance({ id: E, to: 2, reason: "Notify.", author: V("pat"), viewer: V("pat") }).ok, true);
  const N = "ACTN-2026-0001-notice";
  const md = ["---", `id: ${N}`, "object_type: action", `title: ${N}`, "current_state: planned",
    'created: "2026-09-28T01:00:00Z"', 'last_updated: "2026-09-28T01:00:00Z"', "action_kind: other",
    "counterparty:", "  state: named", "  role: Director of Parks", "  body: Parks Department", "breach: true",
    "action_basis:", `  - target: ${d.id}`, "    kind: rests_on", "---", "", "A notice.", ""].join("\n");
  const made = x.w.promotion.promote({ bundleId: N, base: null, snapKey: "20260928T010000Z_000000b1", author: V("pat"),
    viewer: V("pat"), files: [{ path: "bundle.md", text: md }], meta: { object_type: "action" } });
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 400));
  assert.equal(x.esc.escalationAttach({ reason: "This act serves the stage.", id: E, action: N, author: V("pat"), viewer: V("pat") }).ok, true);
  const edge = (to) => x.esc.escalationRead({ id: E, viewer: V("pat") }).triggers.find((t) => t.to === to);
  assert.equal(edge(3).met, false);
  const sent = x.esc.actions.actionCorrespond({ target: N, direction: "sent", at: "2026-09-02", account: "we wrote to the office",
                                                viewer: V("pat"), author: V("pat") });
  assert.equal(sent.ok, true, JSON.stringify(sent).slice(0, 400));
  assert.deepEqual([edge(3).met, edge(3).instant, edge(3).ids], [true, "2026-09-02T00:00:00Z", [N, `${N}#${sent.ord}`]]);
  assert.equal(x.esc.escalationAdvance({ id: E, to: 3, reason: "Sent.", author: V("pat"), viewer: V("pat") }).ok, true);
  assert.equal(edge(4).met, false);
  const reply = x.esc.actions.actionCorrespond({ target: N, direction: "received", at: "2026-09-12", account: "they refused",
                                                 viewer: V("pat"), author: V("pat") });
  assert.equal(reply.ok, true, JSON.stringify(reply).slice(0, 400));
  assert.deepEqual([edge(4).met, edge(4).instant, edge(4).ids], [true, "2026-09-12T00:00:00Z", [N, `${N}#${sent.ord}`, `${N}#${reply.ord}`]]);
  assert.equal(x.esc.escalationAdvance({ id: E, to: 4, reason: "Replied.", author: V("pat"), viewer: V("pat") }).ok, true);
  const ev = x.esc.escalationEvaluate({ id: E, response: { action: N, ord: reply.ord }, reading: "denied", reason: "Refused.",
                                       author: V("pat"), viewer: V("pat") });
  assert.equal(ev.ok, true, JSON.stringify(ev).slice(0, 300));
  assert.deepEqual(x.esc.escalationRead({ id: E, viewer: V("pat") }).proposed.map((p) => p.to), [5, 7]);
});

/* R1 through conformance's own helpers (its R19, R20; N309, N312, K275, K400): escalation's answer to each condition is
   exactly the helper's. */
test("R1 over the real conformance: NO_SUCH_DETERMINATION (absent and unseen) and DETERMINATION_SUPERSEDED are conformance's own answers, R19's and R20's, exactly", () => {
  const x = real();
  const first = x.w.c.determine(x.input());
  assert.equal(first.ok, true, JSON.stringify(first).slice(0, 300));
  const open = (determination, who = "pat") => x.esc.escalationOpen({ reason: "Worth pursuing.", determination, author: V(who), viewer: V(who) });
  assert.deepEqual(open("CONF-2026-0999-determination"), noSuchDetermination("CONF-2026-0999-determination"));
  assert.deepEqual(open(first.id, "quinn"), noSuchDetermination(first.id), "unseen answers as absent");
  assert.deepEqual(open(undefined), noSuchDetermination(null));
  const second = x.w.c.determine(x.input({ supersedes: first.id, reason: "the act was misdated" }));
  assert.equal(second.ok, true, JSON.stringify(second).slice(0, 300));
  assert.deepEqual(open(first.id), determinationSuperseded(first.id, second.id));
});

test("R23 over the real actions (K600 (a)): a member's breach action stating a premise_override, written through actions with no determination to rest on, is refused ACTION_PREMISE_OVERRIDDEN at an attaching stage, ahead of NOT_A_BREACH_ACTION; one resting on the determination without the override attaches", () => {
  const x = real();
  const d = x.w.c.determine(x.input());
  const E = x.esc.escalationOpen({ reason: "Worth pursuing.", determination: d.id, author: V("pat"), viewer: V("pat") }).id;
  assert.equal(x.esc.escalationAdvance({ id: E, to: 2, reason: "Notify.", author: V("pat"), viewer: V("pat") }).ok, true);
  const md = (id, lines) => ["---", `id: ${id}`, "object_type: action", `title: ${id}`, "current_state: planned",
    'created: "2026-09-28T01:00:00Z"', 'last_updated: "2026-09-28T01:00:00Z"', "action_kind: other",
    "counterparty:", "  state: named", "  role: Director of Parks", "  body: Parks Department", "breach: true",
    ...lines, "---", "", "A notice.", ""].join("\n");
  let k = 0;
  const make = (id, lines) => {
    const r = x.w.promotion.promote({ bundleId: id, base: null, snapKey: `20260928T010000Z_000000c${++k}`, author: V("pat"),
      viewer: V("pat"), files: [{ path: "bundle.md", text: md(id, lines) }], meta: { object_type: "action" } });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
    return id;
  };
  const over = make("ACTN-2026-0001-override", ["premise_override:", '  reason: "The office has not answered; we act before a determination."',
    "action_basis: []"]);
  const read = x.esc.actions.actionRead({ id: over, viewer: V("pat") });
  assert.equal(read.ok, true, JSON.stringify(read).slice(0, 300));
  assert.equal(read.premise_override?.reason, "The office has not answered; we act before a determination.");
  const before = x.w.record.head(E).bundleSha;
  const r = x.esc.escalationAttach({ reason: "This act serves the stage.", id: E, action: over, author: V("pat"), viewer: V("pat") });
  assert.deepEqual([r.ok, r.reason, r.check, r.action], [false, "ACTION_PREMISE_OVERRIDDEN", "C-116.45", over]);
  assert.equal(x.w.record.head(E).bundleSha, before, "nothing written");
  const plain = make("ACTN-2026-0002-notice", ["action_basis:", `  - target: ${d.id}`, "    kind: rests_on"]);
  assert.equal(x.esc.escalationAttach({ reason: "This act serves the stage.", id: E, action: plain, author: V("pat"), viewer: V("pat") }).ok, true);
});

test("R29 over the real conformance, actions and consequences (their published shapes): the draft states the noncompliant standard with the basis the determination holds, the act, the breach action resting on it with its clock and its date passed at nowMs, and no consequence recorded; writes nothing", () => {
  const x = real();
  const d = x.w.c.determine(x.input());
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const N = "ACTN-2026-0001-notice";
  const md = ["---", `id: ${N}`, "object_type: action", `title: ${N}`, "current_state: planned",
    'created: "2026-09-28T01:00:00Z"', 'last_updated: "2026-09-28T01:00:00Z"', "action_kind: other",
    "counterparty:", "  state: named", "  role: Director of Parks", "  body: Parks Department", "breach: true",
    "clock:", '  - text: "reply due"', '    description: "the office answers the notice"', '    date: "2026-10-10"', '    basis: "the notice rule"', "    status: pending",
    "action_basis:", `  - target: ${d.id}`, "    kind: rests_on", "---", "", "A notice.", ""].join("\n");
  const made = x.w.promotion.promote({ bundleId: N, base: null, snapKey: "20260928T010000Z_000000d1", author: V("pat"),
    viewer: V("pat"), files: [{ path: "bundle.md", text: md }], meta: { object_type: "action" } });
  assert.equal(made.ok, true, JSON.stringify(made).slice(0, 400));
  const held = x.w.c.determinationRead({ id: d.id, viewer: V("pat") });
  const row = held.standards[0].rows[0];
  const before = x.w.record.head(N).bundleSha;
  const r = x.esc.escalationReasonDraft({ determination: d.id, nowMs: Date.parse("2026-10-11T00:00:00Z"), viewer: V("pat") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual(r.parts.map((p) => p.id), [d.id, held.act.id, x.std, N, N, N, d.id]);
  assert.equal(r.parts[2].text, `Standard ${x.std} is breached: it requires "${row.requires}"; the act did "${row.did}" `
    + `(reading: ${row.reading}; content ${row.content.join(", ")}). It was in force at the act's date.`);
  assert.equal(r.parts[3].text, `Action ${N} (other) rests on the determination, addressed to Director of Parks, Parks Department; its state is planned.`);
  assert.equal(r.parts[5].text, `The date 2026-10-10 on action ${N} passed without a response: the entry is still pending on 2026-10-11.`);
  assert.equal(r.parts[6].text, "No consequence of the breach is recorded on the determination.");
  assert.deepEqual([r.label.state, r.label.machine_work], ["machine_proposed", true]);
  assert.equal(x.w.record.head(N).bundleSha, before);
  /* quinn, outside the project, is answered conformance's one answer */
  assert.equal(x.esc.escalationReasonDraft({ determination: d.id, viewer: V("quinn") }).reason, "NO_SUCH_DETERMINATION");
});
