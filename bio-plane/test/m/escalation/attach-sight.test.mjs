/* escalation, T46 (T46-38; N931; K2890, K2953): R34. R9's one-attachment refusal judged within the viewer's sight, and
   `attachConditions`, the read of stage 7's counterparty conditions that `affordances` (its R51) offers attachment by,
   each driven at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, toStage, V, OFFICE } from "./fixture.mjs";
import { ESCALATION_CHECKS, ACCOUNTABILITY_PURPOSES } from "../../../src/escalation/index.mjs";
import { noSuchAction } from "../../../src/actions/index.mjs";

const by = (who) => ({ author: V(who), viewer: V(who) });
const attach = (w, id, action, who = "bob", extra = {}) =>
  w.esc.escalationAttach({ reason: "This act serves the stage.", id, action, ...by(who), ...extra });
const std = ["STD-2026-0001-a"];

/* bob's escalation of w.D at stage 2, and alice's of D2 in a project bob may not see, also at stage 2, holding `shared`,
   an action resting on both that bob may see. */
function hiddenElsewhere() {
  const w = seeded();
  toStage(w, 2);
  const P2 = w.project("Harbour watch", "alice");
  const D2 = w.determine({ project: P2, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  const o2 = w.esc.escalationOpen({ reason: "Worth pursuing.", determination: D2, ...by("alice") });
  assert.equal(o2.ok, true, JSON.stringify(o2));
  assert.equal(w.esc.escalationAdvance({ id: o2.id, to: 2, reason: "Go.", ...by("alice") }).ok, true);
  const shared = w.action({ project: w.P, restsOn: [w.D, D2] });
  assert.equal(attach(w, o2.id, shared, "alice").ok, true);
  return { w, E2: o2.id, shared };
}

test("R34 R9 ALREADY_ATTACHED stands for every attachment whatever the viewer may see, and is answered within the viewer's sight: it names the escalation and stage already attached only where the viewer may see that escalation; for one in a project the viewer may not see it names nothing of it (no id, stage or count), one answer, the same as for an action attached nowhere it could name; nothing is written", () => {
  const { w, E2, shared } = hiddenElsewhere();
  assert.equal(w.esc.escalationRead({ id: E2, viewer: V("bob") }).reason, "NO_SUCH_ESCALATION", "bob may not see E2");
  const row = ESCALATION_CHECKS.ALREADY_ATTACHED;
  const before = w.snapshot();
  /* bob: refused, naming nothing of E2 */
  const blind = attach(w, w.E, shared);
  assert.deepEqual([blind.ok, blind.reason, blind.code, blind.check, blind.translation],
    [false, "ALREADY_ATTACHED", "ALREADY_ATTACHED", "C-116.14", row.translation]);
  assert.deepEqual(Object.keys(blind).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
  assert.equal(JSON.stringify(blind).includes(E2), false, "no id of the unseen escalation");
  assert.equal(/stage \d|\d+ escalation/.test(blind.detail), false, "no stage or count in the detail");
  /* alice, who may see both: the escalation and stage are named */
  const seen = attach(w, w.E, shared, "alice");
  assert.deepEqual([seen.reason, seen.escalation, seen.stage], ["ALREADY_ATTACHED", E2, 2]);
  /* an action attached to the viewer's own escalation is named to the viewer, as before */
  const own = attach(w, w.E, w.N);
  assert.deepEqual([own.reason, own.escalation, own.stage], ["ALREADY_ATTACHED", w.E, 2]);
  /* one answer: bob's refusal reads exactly as one for an action attached to another escalation bob cannot see, with
     every key but the detail's id-free sentence equal */
  const { w: v, shared: s2 } = hiddenElsewhere();
  assert.deepEqual(attach(v, v.E, s2), blind);
  assert.deepEqual(w.snapshot(), before, "no refusal writes anything");
});

test("R34 attachConditions({id, action, viewer}) answers, at stage 7, R12's counterparty conditions per accountability purpose for the action's addressee, as R9 would judge them on the day read: an office the profile marks elected: false answers official_request refused COUNTERPARTY_NOT_ELECTED, testimony and enforcing_legislation asking no condition; it writes nothing and chooses nothing, and each answer agrees with what R9 then does", () => {
  const w = seeded();
  toStage(w, 7);
  const clerk = w.action({ project: w.P, restsOn: [w.D] });                       // not elected; oversight unstated
  const before = w.snapshot();
  const c = w.esc.attachConditions({ id: w.E, action: clerk, viewer: V("bob") });
  assert.deepEqual([c.ok, c.id, c.action, c.stage], [true, w.E, clerk, 7]);
  assert.deepEqual(Object.keys(c.purposes), [...ACCOUNTABILITY_PURPOSES]);
  assert.deepEqual([c.purposes.official_request.state, c.purposes.official_request.code, c.purposes.official_request.check,
                    c.purposes.official_request.translation],
    ["refused", "COUNTERPARTY_NOT_ELECTED", "C-116.17", ESCALATION_CHECKS.COUNTERPARTY_NOT_ELECTED.translation]);
  assert.equal(c.purposes.testimony.state, "none_asked");
  assert.equal(c.purposes.enforcing_legislation.state, "none_asked");
  assert.equal(c.purposes.oversight_request.state, "undetermined", "the profile is silent on the clerk's oversight");
  assert.equal(c.purposes.audit_request.state, "undetermined");
  assert.equal("chosen" in c, false);
  assert.deepEqual(w.snapshot(), before, "a read writes nothing");
  /* the other offices: elected admitted; oversight false refused; oversight true admitted */
  const cond = (office) => w.esc.attachConditions({ id: w.E, action: w.action({ project: w.P, restsOn: [w.D],
    counterparty: { state: "named", ...office } }), viewer: V("bob") }).purposes;
  const board = cond(OFFICE.board), harbour = cond(OFFICE.harbour), examiner = cond(OFFICE.examiner), unlisted = cond(OFFICE.unlisted);
  assert.equal(board.official_request.state, "admitted");
  assert.deepEqual([harbour.official_request.state, harbour.oversight_request.code, harbour.audit_request.code],
    ["admitted", "COUNTERPARTY_NOT_OVERSIGHT", "COUNTERPARTY_NOT_OVERSIGHT"]);
  assert.deepEqual([examiner.official_request.code, examiner.oversight_request.state, examiner.audit_request.state],
    ["COUNTERPARTY_NOT_ELECTED", "admitted", "admitted"]);
  assert.deepEqual([unlisted.official_request.state, unlisted.oversight_request.state], ["undetermined", "undetermined"]);
  /* each answer agrees with what R9 does: refused where refused, landing where admitted, undetermined or asked nothing */
  for (const [office, purpose] of [[OFFICE.clerk, "official_request"], [OFFICE.harbour, "audit_request"], [OFFICE.board, "official_request"],
                                   [OFFICE.unlisted, "official_request"], [OFFICE.clerk, "testimony"], [OFFICE.examiner, "oversight_request"]]) {
    const a = w.action({ project: w.P, restsOn: [w.D], counterparty: { state: "named", ...office } });
    const said = w.esc.attachConditions({ id: w.E, action: a, viewer: V("bob") }).purposes[purpose];
    const done = attach(w, w.E, a, "bob", { purpose, standards: std });
    if (said.state === "refused") assert.equal(done.reason, said.code, `${office.role} ${purpose}`);
    else assert.equal(done.ok, true, `${office.role} ${purpose}: ${JSON.stringify(done).slice(0, 200)}`);
  }
});

test("R34 attachConditions with lines: an oversight or audit request to an office holding an oversees line to the actor's office on the day read is admitted, naming the line, over the profile's oversight: false (control: the same office without the line is refused COUNTERPARTY_NOT_OVERSIGHT)", () => {
  const w = seeded({ structure: true });
  w.clerk = w.ent("office", "Town Clerk");
  w.D = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }],
                      actor: { ...OFFICE.clerk, entity_id: w.clerk } });
  toStage(w, 7);
  const harbour = w.ent("office", "Harbour District Board");
  const a = w.action({ project: w.P, restsOn: [w.D], counterparty: { state: "named", ...OFFICE.harbour, entity_id: harbour } });
  const ask = () => w.esc.attachConditions({ id: w.E, action: a, viewer: V("bob") }).purposes;
  assert.equal(ask().oversight_request.code, "COUNTERPARTY_NOT_OVERSIGHT", "control: no line, the flag refuses");
  const line = w.say("oversees", harbour, w.clerk);
  const p = ask();
  for (const purpose of ["oversight_request", "audit_request"]) {
    assert.equal(p[purpose].state, "admitted", purpose);
    assert.deepEqual(p[purpose].lines.map((l) => [l.line.line_id, l.line.kind]), [[line, "oversees"]], purpose);
  }
  assert.equal(attach(w, w.E, a, "bob", { purpose: "audit_request", standards: std }).ok, true, "R9 lands it");
});

test("R34 attachConditions refuses as R9 does for an absent or invisible escalation (NO_SUCH_ESCALATION, one answer) or action (actions R43's noSuchAction); at a stage other than 7 it asks no counterparty condition (purposes: null); control: the same action at stage 7 is answered", () => {
  const w = seeded();
  toStage(w, 2);
  const a = w.action({ project: w.P, restsOn: [w.D] });
  const before = w.snapshot();
  const none = w.esc.attachConditions({ id: "ESC-2026-0999-escalation", action: a, viewer: V("bob") });
  const unseen = w.esc.attachConditions({ id: w.E, action: a, viewer: V("carol") });
  assert.deepEqual([none.reason, none.check], ["NO_SUCH_ESCALATION", "C-116.8"]);
  assert.deepEqual(unseen, none, "absent and unseen are one answer");
  assert.deepEqual(w.esc.attachConditions({ id: w.E, action: "ACTN-2026-0999-act", viewer: V("bob") }), noSuchAction("ACTN-2026-0999-act"));
  w.actionHidden.add(a);
  assert.deepEqual(w.esc.attachConditions({ id: w.E, action: a, viewer: V("bob") }), noSuchAction(a), "an action bob may not see");
  w.actionHidden.delete(a);
  const at2 = w.esc.attachConditions({ id: w.E, action: a, viewer: V("bob") });
  assert.deepEqual([at2.ok, at2.stage, at2.purposes], [true, 2, null]);
  assert.deepEqual(w.snapshot(), before);
  const x = seeded();
  toStage(x, 7);
  const b = x.action({ project: x.P, restsOn: [x.D] });
  assert.equal(x.esc.attachConditions({ id: x.E, action: b, viewer: V("bob") }).purposes.testimony.state, "none_asked");
});
