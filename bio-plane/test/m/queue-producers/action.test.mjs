/* The Action layer's producers (R15–R18; K608, K611, K613–K615) and the self-registered signing key (R14; N375) at
   feedItems' interface. Each provider is a fake answering in the shape its requirements publish (action-clocks R3, R5;
   action-plans R17; escalation R16), filled per test; membership is real, so the recipients (the author, else the
   project's owners, else the administrators: membership R65, R86) and the signing keys (its R27) are its own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const DAY = 86400000;
const day = (ms) => iso(ms).slice(0, 10);
const page = (items, extra = {}) => ({ ok: true, items, limit: 500, truncated: false, cursor: null, ...extra });
const ofKind = (r, kind) => r.items.filter((i) => i.kind === kind);

/* Three members and an administrator; PRJ-1 owned by olga, PRJ-H a project alice may not see. */
function people(fakes) {
  const w = world(fakes);
  w.member("ada", { role: "admin" }); w.member("alice"); w.member("bob"); w.member("olga");
  w.bundle("PRJ-1", "project"); w.bundle("PRJ-H", "project"); w.bundle("ACT-1", "action"); w.bundle("ACT-2", "action");
  w.join("PRJ-1", "olga", { owner: true }); w.join("PRJ-1", "alice"); w.join("PRJ-1", "bob");
  return w;
}

test("R15: one CONDITION per overdue clock entry action-clocks answers the viewer, keyed CONDITION::action-clock-overdue::<action>::<position>, to its creator, else the project's owners, else the administrators", () => {
  const asked = [];
  const entries = [
    { action: "ACT-1", ord: 0, date: day(NOW - 3 * DAY), basis: "the records act, ten days", text: "response due", status: "pending",
      past: true, project: "PRJ-1", created_by: "alice" },
    { action: "ACT-1", ord: 2, date: day(NOW - 1 * DAY), basis: "the hearing notice", text: "hearing", status: "overdue",
      past: true, project: "PRJ-1", created_by: "alice" },
    { action: "ACT-2", ord: 0, date: day(NOW - 5 * DAY), basis: "b", text: "t", status: "pending", past: true,
      project: "PRJ-1", created_by: "token:member" },
    { action: "ACT-3", ord: 1, date: day(NOW - 2 * DAY), basis: "b", text: "t", status: "pending", past: true,
      project: null, created_by: null },
    { action: "ACT-4", ord: 0, date: null, basis: "b", text: "t", status: "overdue", past: false, project: null,
      created_by: "bob" }];
  const w = people({ actionClocks: { overdueClocks: (a) => { asked.push(a);
    /* two pages: the first truncated with a cursor, the second the rest */
    return a.after ? page(entries.slice(2)) : page(entries.slice(0, 2), { truncated: true, cursor: "ACT-1#2" }); } } });
  const ids = (r) => ofKind(r, "action-clock-overdue").map((i) => i.id).sort();
  const alice = w.read("alice");
  assert.deepEqual(asked.slice(0, 2).map((a) => [a.after, a.viewer, a.now]), [[null, "member:alice", NOW], ["ACT-1#2", "member:alice", NOW]],
    "the viewer and the read's instant are action-clocks' to read by, and its cursor is followed");
  assert.deepEqual(ids(alice), ["CONDITION::action-clock-overdue::ACT-1::0", "CONDITION::action-clock-overdue::ACT-1::2"],
    "the member who created the action, and only the entries of her actions");
  assert.deepEqual(ids(w.read("olga")), ["CONDITION::action-clock-overdue::ACT-2::0"],
    "an action a machine created goes to its project's owners");
  assert.deepEqual(ids(w.read("ada")), ["CONDITION::action-clock-overdue::ACT-3::1"],
    "an action with no member author and no project goes to the administrators");
  assert.deepEqual(ids(w.read("bob")), ["CONDITION::action-clock-overdue::ACT-4::0"]);
  assert.deepEqual(ids(w.read(null, "class:admin")), [], "a caller with no member is none of the members it goes to");
  const it = byId(alice)["CONDITION::action-clock-overdue::ACT-1::0"];
  assert.deepEqual([it.class, it.kind], ["CONDITION", "action-clock-overdue"], "a CONDITION, as Bob's approved draft has it (K611)");
  assert.deepEqual(it.subject, { kind: "action", id: "ACT-1", entry: 0, date: day(NOW - 3 * DAY), basis: "the records act, ten days",
    text: "response due", project: "PRJ-1" }, "its subject the action, naming the entry's date, basis and text");
  assert.deepEqual(it.age, { state: "determined", since: `${day(NOW - 2 * DAY)}T00:00:00Z`, ms: 2 * DAY },
    "aged from the day after the entry's date");
  assert.deepEqual(it.recipients, ["alice"]); assert.equal(it.basis.recipients_rule, "author");
  assert.deepEqual(byId(w.read("olga"))["CONDITION::action-clock-overdue::ACT-2::0"].basis.recipients_rule, "project_owners");
  assert.deepEqual(byId(w.read("ada"))["CONDITION::action-clock-overdue::ACT-3::1"].basis.recipients_rule, "administrators");
  assert.equal(byId(w.read("bob"))["CONDITION::action-clock-overdue::ACT-4::0"].age.state, "undetermined");
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]], "homed under the action's project");
  assert.deepEqual(it.options, [{ id: "opt", on: ["ACT-1"] }], "R12: the acts on the action, which a member's revision changes");
  assert.equal(it.basis.source, "action-clocks.overdueClocks"); assert.equal(it.basis.bound.truncated, false);
  // raised once and never re-notified here: the same read twice is the same one item; it leaves when the read stops answering it
  assert.deepEqual(ids(w.read("alice")), ids(alice));
  w.fakes.actionClocks.overdueClocks = () => page([]);
  assert.deepEqual(ids(w.read("alice")), [], "it leaves when the entry is met or waived or the action closes (the read no longer answers it)");
  // at most 20 pages are followed, and a cut is stated
  let n = 0;
  w.fakes.actionClocks.overdueClocks = () => { n += 1; return page([{ ...entries[0], ord: n }], { truncated: true, cursor: `ACT-1#${n}` }); };
  const cut = ofKind(w.read("alice"), "action-clock-overdue");
  assert.equal(n, 20); assert.equal(cut.length, 20); assert.ok(cut.every((i) => i.basis.bound.truncated === true));
});

test("R16: one OBLIGATION per checkpoint action-plans answers due, keyed OBLIGATION::plan-checkpoint-due::<plan>::<scenario>::<phase>, to the member who set the scenario, else the owners, else the administrators; never a FINDING or a CONDITION", () => {
  let asked = null;
  const due = [
    { plan: "PLN-1", project: "PRJ-1", scenario: 1, version: 2, phase: "p1", set_by: "bob", due: day(NOW - 4 * DAY), days_since_due: 4 },
    { plan: "PLN-1", project: "PRJ-1", scenario: 2, version: 1, phase: "p2", set_by: "token:member", due: day(NOW), days_since_due: 0 },
    { plan: "PLN-2", project: "PRJ-H", scenario: 1, version: 1, phase: "p1", set_by: "alice", due: day(NOW - DAY), days_since_due: 1 }];
  const w = people({ actionPlans: { checkpointsDue: (a) => { asked = a; return { ok: true, items: due, limit: 500, truncated: false }; } } });
  const ids = (r) => ofKind(r, "plan-checkpoint-due").map((i) => i.id).sort();
  const bob = w.read("bob");
  assert.deepEqual(asked, { nowMs: NOW }, "K711: checkpointsDue({nowMs}) at the read's instant");
  assert.deepEqual(ids(bob), ["OBLIGATION::plan-checkpoint-due::PLN-1::1::p1"]);
  assert.deepEqual(ids(w.read("olga")), ["OBLIGATION::plan-checkpoint-due::PLN-1::2::p2"], "a machine's scenario goes to the owners");
  assert.deepEqual(ids(w.read("alice")), [], "R11: a plan of a project alice may not see is no item, though she set it");
  assert.deepEqual(ids(w.read(null, "class:admin")), [], "a caller with no member is told none");
  const it = byId(bob)["OBLIGATION::plan-checkpoint-due::PLN-1::1::p1"];
  assert.deepEqual([it.class, it.kind], ["OBLIGATION", "plan-checkpoint-due"]);
  assert.deepEqual(it.subject, { kind: "plan", id: "PLN-1", project: "PRJ-1", scenario: 1, phase: "p1", version: 2 });
  assert.deepEqual(it.age, { state: "determined", since: day(NOW - 4 * DAY), ms: 4 * DAY }, "aged from the checkpoint's day");
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]]);
  assert.deepEqual(it.options.map((o) => o.id), ["checkpointrecord"], "the act that answers it: a member's judgement");
  assert.deepEqual(it.recipients, ["bob"]);
  assert.ok(!JSON.stringify(w.read("alice")).includes("PRJ-H"), "R11: the hidden project is named nowhere");
  w.fakes.actionPlans.checkpointsDue = () => ({ ok: true, items: [], limit: 500, truncated: false });
  assert.deepEqual(ids(w.read("bob")), [], "it leaves when a member judges the checkpoint or closes the plan");
  // with no owner and a machine author, the administrators
  w.fakes.actionPlans.checkpointsDue = () => ({ ok: true, limit: 500, truncated: false,
    items: [{ plan: "PLN-3", project: "PRJ-O", scenario: 1, version: 1, phase: "p", set_by: null, due: day(NOW) }] });
  w.bundle("PRJ-O", "project");
  assert.deepEqual(ids(w.read("ada")), ["OBLIGATION::plan-checkpoint-due::PLN-3::1::p"]);
  assert.equal(byId(w.read("ada"))["OBLIGATION::plan-checkpoint-due::PLN-3::1::p"].basis.recipients_rule, "administrators");
});

test("R17: one OBLIGATION per (escalation, proposed edge) escalation answers the viewer, keyed OBLIGATION::escalation-stage-proposed::<escalation>::<to>, to its opener, else the owners, else the administrators, aged from the trigger's instant", () => {
  let asked = null;
  const due = [
    { id: "ESC-1", project: "PRJ-1", opened_by: "alice", from: 4, to: 5, stage: "legal_tools", instant: iso(NOW - 6 * DAY),
      age_ms: 6 * DAY, ids: ["RESP-1"], by: "protocol" },
    { id: "ESC-1", project: "PRJ-1", opened_by: "alice", from: 4, to: 7, stage: "political_accountability",
      instant: iso(NOW - 6 * DAY), age_ms: 6 * DAY, ids: ["RESP-1"], by: "protocol" },
    { id: "ESC-2", project: "PRJ-1", opened_by: "token:member", from: 1, to: 2, stage: "notification", instant: "not an instant",
      ids: [], by: "protocol" }];
  const w = people({ escalation: { escalationsDue: (a) => { asked = a; return { ok: true, items: due, limit: 500, truncated: false }; } } });
  const ids = (r) => ofKind(r, "escalation-stage-proposed").map((i) => i.id).sort();
  const alice = w.read("alice");
  assert.deepEqual(asked, { nowMs: NOW, viewer: "member:alice" });
  assert.deepEqual(ids(alice), ["OBLIGATION::escalation-stage-proposed::ESC-1::5", "OBLIGATION::escalation-stage-proposed::ESC-1::7"]);
  assert.deepEqual(ids(w.read("olga")), ["OBLIGATION::escalation-stage-proposed::ESC-2::2"]);
  assert.deepEqual(ids(w.read("bob")), []); assert.deepEqual(ids(w.read(null, "class:admin")), []);
  const it = byId(alice)["OBLIGATION::escalation-stage-proposed::ESC-1::7"];
  assert.deepEqual([it.class, it.kind], ["OBLIGATION", "escalation-stage-proposed"]);
  assert.deepEqual(it.subject, { kind: "escalation", id: "ESC-1", project: "PRJ-1", from: 4, to: 7, stage: "political_accountability" });
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 6 * DAY), ms: 6 * DAY }, "a fact of the record, never this read's clock");
  assert.deepEqual(it.options.map((o) => o.id), ["escalationadvance", "escalationdecline"]);
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]]);
  assert.deepEqual(it.basis.ids, ["RESP-1"]);
  assert.equal(byId(w.read("olga"))["OBLIGATION::escalation-stage-proposed::ESC-2::2"].age.state, "undetermined");
  w.fakes.escalation.escalationsDue = () => ({ ok: true, items: [], limit: 500, truncated: false });
  assert.deepEqual(ids(w.read("alice")), [], "it leaves when the edge is advanced or declined, or the escalation suspended or ended");
});

test("R18: one OBLIGATION per reminder action-clocks answers due, keyed OBLIGATION::action-reminder::<action>::<position>::<on>, to the member who set it and to nobody else, offering another reminder or none", () => {
  const asked = [];
  const due = [
    { action: "ACT-1", ord: 0, date: day(NOW + 5 * DAY), basis: "the records act", text: "response due", on: day(NOW - DAY),
      set_by: "alice", project: "PRJ-1" },
    { action: "ACT-1", ord: 0, date: day(NOW + 5 * DAY), basis: "the records act", text: "response due", on: day(NOW),
      set_by: "bob", project: "PRJ-1" },
    { action: "ACT-2", ord: 1, date: day(NOW + 9 * DAY), basis: "b", text: "t", on: day(NOW - 2 * DAY), set_by: "alice", project: null }];
  const w = people({ actionClocks: { remindersDue: (a) => { asked.push(a);
    return a.after ? page(due.slice(2)) : page(due.slice(0, 2), { truncated: true, cursor: `ACT-1#0#${day(NOW)}#bob` }); } } });
  const ids = (r) => ofKind(r, "action-reminder").map((i) => i.id).sort();
  const alice = w.read("alice");
  assert.deepEqual(asked.slice(0, 2).map((a) => [a.nowMs, a.after, a.viewer]),
    [[NOW, null, "member:alice"], [NOW, `ACT-1#0#${day(NOW)}#bob`, "member:alice"]]);
  assert.deepEqual(ids(alice), [`OBLIGATION::action-reminder::ACT-1::0::${day(NOW - DAY)}`, `OBLIGATION::action-reminder::ACT-2::1::${day(NOW - 2 * DAY)}`]);
  assert.deepEqual(ids(w.read("bob")), [`OBLIGATION::action-reminder::ACT-1::0::${day(NOW)}`]);
  assert.deepEqual(ids(w.read("olga")), [], "the project's owner set no reminder and is reminded of nothing (DEC-69)");
  assert.deepEqual(ids(w.read("ada")), [], "nor an administrator");
  assert.deepEqual(ids(w.read(null, "class:admin")), []);
  const it = byId(alice)[`OBLIGATION::action-reminder::ACT-1::0::${day(NOW - DAY)}`];
  assert.deepEqual([it.class, it.kind], ["OBLIGATION", "action-reminder"]);
  assert.deepEqual(it.subject, { kind: "action", id: "ACT-1", entry: 0, date: day(NOW + 5 * DAY), basis: "the records act",
    text: "response due", on: day(NOW - DAY), project: "PRJ-1" }, "its subject the action, naming the entry's date, basis and text");
  assert.deepEqual(it.age, { state: "determined", since: `${day(NOW - DAY)}T00:00:00Z`, ms: DAY }, "aged from the reminder's day");
  assert.deepEqual(it.recipients, ["alice"]);
  assert.deepEqual(it.options, [{ id: "reminderanswer", label: "Remind me again on a later day, or not again", weight: "single" },
    { id: "opt", on: ["ACT-1"] }], "its response offers another reminder or none, beside the acts on the action");
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]]);
  w.fakes.actionClocks.remindersDue = () => page([]);
  assert.deepEqual(ids(w.read("alice")), [], "it leaves when she answers it, or the entry or the action no longer calls for it");
});

test("R14: OBLIGATIONs signer-self-registered, one per active self-registered key, to an administrator or the admin credential and nobody else, offering R26's revoke", () => {
  const w = world();
  w.member("ada", { role: "admin" }); w.member("alice"); w.member("bob");
  w.signer("KEY-A", "alice", { comment: "alice's laptop", added: iso(NOW - 3000) });
  w.signer("KEY-B", "bob", { origin: "admin" });                 // an administrator's registration: no item
  w.signer("KEY-C", "bob", { status: "revoked" });               // no longer active: no item
  const ids = (r) => ofKind(r, "signer-self-registered").map((i) => i.id);
  assert.deepEqual(ids(w.read("ada")), ["OBLIGATION::signer-self-registered::KEY-A"]);
  assert.deepEqual(ids(w.read(null, "class:admin")), ["OBLIGATION::signer-self-registered::KEY-A"]);
  assert.deepEqual(ids(w.read("alice")), [], "not the member who registered it, who is no administrator");
  assert.deepEqual(ids(w.read(null, "class:member")), [], "nor another machine credential");
  const it = byId(w.read("ada"))["OBLIGATION::signer-self-registered::KEY-A"];
  assert.deepEqual([it.class, it.kind, it.subject.kind, it.subject.id, it.subject.comment, it.subject.registered_by],
    ["OBLIGATION", "signer-self-registered", "signer_key", "KEY-A", "alice's laptop", "alice"], "naming the key's comment and its member");
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 3000), ms: 3000 }, "aged from its added instant");
  assert.deepEqual(it.options, [{ id: "signerset", label: "Revoke this signing key", weight: "single" }]);
  assert.deepEqual(it.basis.raised_to, ["ada"]);
  w.run(`UPDATE signers SET status='revoked' WHERE key_b64='KEY-A'`);
  assert.deepEqual(ids(w.read("ada")), [], "it leaves when the key is no longer active");
});
