/* The Action layer's producers (R15–R19, R29; K608, K611, K613–K615, K899 (7); DEC-113) and the self-registered signing key (R14; N375) at
   feedItems' interface. Each provider is a fake answering in the shape its requirements publish (action-clocks R3, R5;
   action-plans R17; escalation R16; actions R54, R59), filled per test; membership is real, so the recipients (the author, else the
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

test("R19: one OBLIGATION litigation-hold per legal mark actions.holdsDue answers the viewer, keyed OBLIGATION::litigation-hold::<action>::<position>, to every administrator and the marker and nobody else, until a hold is stated", () => {
  const asked = [];
  const marks = [
    { action: "ACT-1", ord: 2, note: "a letter threatening suit", marked_by: "alice", marked_at: iso(NOW - 3 * DAY), project: "PRJ-1" },
    { action: "ACT-1", ord: 4, note: "a second letter", marked_by: "bob", marked_at: iso(NOW - DAY), project: "PRJ-1" },
    { action: "ACT-2", ord: 0, note: "a subpoena", marked_by: "alice", marked_at: "not an instant", project: null },
    { action: "ACT-H", ord: 1, note: "on a hidden action", marked_by: "alice", marked_at: iso(NOW), project: "PRJ-1" }];
  const held = new Set();      // the marks on which some member has stated a hold (actions R52)
  const w = people({ actions: { holdsDue: (a) => { asked.push(a);
    const due = marks.filter((m) => !held.has(`${m.action}#${m.ord}`));
    /* two pages: the first truncated with a cursor, the second the rest */
    return a.after ? page(due.slice(2)) : page(due.slice(0, 2), { truncated: due.length > 2, cursor: due.length > 2 ? "ACT-1#4" : null }); } } });
  /* ACT-H is an action alice may not see: a mark on it is no item (R11), whatever the provider answered */
  w.bundle("ACT-H", "action"); w.run(`UPDATE bundles SET project='PRJ-H' WHERE bundle_id='ACT-H'`);
  const ids = (r) => ofKind(r, "litigation-hold").map((i) => i.id).sort();
  const alice = w.read("alice");
  assert.deepEqual(asked.slice(0, 2).map((a) => [a.after, a.viewer]), [[null, "member:alice"], ["ACT-1#4", "member:alice"]],
    "the viewer is actions' to read by, and its cursor is followed");
  const all = ["OBLIGATION::litigation-hold::ACT-1::2", "OBLIGATION::litigation-hold::ACT-1::4", "OBLIGATION::litigation-hold::ACT-2::0",
    "OBLIGATION::litigation-hold::ACT-H::1"];
  assert.deepEqual(ids(w.read("ada")), all, "every administrator: one item per unanswered legal mark");
  assert.deepEqual(ids(w.read(null, "class:admin")), all, "and the admin machine credential, as R14's");
  assert.deepEqual(ids(alice), ["OBLIGATION::litigation-hold::ACT-1::2", "OBLIGATION::litigation-hold::ACT-2::0"],
    "the member who marked it, her own marks only, and never one on an action she may not see");
  assert.ok(!JSON.stringify(alice).includes("ACT-H"), "R11: the invisible action is named nowhere");
  assert.deepEqual(ids(w.read("bob")), ["OBLIGATION::litigation-hold::ACT-1::4"]);
  assert.deepEqual(ids(w.read("olga")), [], "never to a member who is neither an administrator nor the marker, though she owns the project");
  assert.deepEqual(ids(w.read(null, "class:member")), [], "nor another machine credential");
  const it = byId(alice)["OBLIGATION::litigation-hold::ACT-1::2"];
  assert.deepEqual([it.class, it.kind], ["OBLIGATION", "litigation-hold"]);
  assert.deepEqual(it.subject, { kind: "action", id: "ACT-1", entry: 2, note: "a letter threatening suit", project: "PRJ-1" },
    "its subject the action, naming the entry's position and the mark's note");
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 3 * DAY), ms: 3 * DAY }, "aged from the mark's instant");
  assert.equal(byId(alice)["OBLIGATION::litigation-hold::ACT-2::0"].age.state, "undetermined");
  assert.deepEqual(it.recipients, ["ada", "alice"], "every administrator and the marker");
  assert.deepEqual(it.options, [{ id: "actionhold", label: "Record that a litigation hold is in place", weight: "single" },
    { id: "actionholdrelease", label: "Record that no hold is needed, with a reason", weight: "single" },
    { id: "opt", on: ["ACT-1"] }], "both its doors (DEC-113): the hold in place and its release, beside the acts on the action");
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]], "homed under the action's project");
  assert.equal(it.basis.source, "actions.holdsDue"); assert.equal(it.basis.bound.truncated, false);
  assert.ok(!/bundle/i.test(`${it.summary} ${it.detail} ${it.basis.detail}`), "K899 (1): the text says record, never bundle");
  // raised once: the same read twice is the same items
  assert.deepEqual(ids(w.read("alice")), ids(alice));
  // gone once any hold is stated on the mark: in place (actions R52) or released, its own act (actions R56)
  held.add("ACT-1#2"); held.add("ACT-2#0");
  assert.deepEqual(ids(w.read("ada")), ["OBLIGATION::litigation-hold::ACT-1::4", "OBLIGATION::litigation-hold::ACT-H::1"]);
  assert.deepEqual(ids(w.read("alice")), []);
});

test("R25 (DEC-110 (1)): action-clock-overdue and action-reminder carry the clock entry's date as due, plan-checkpoint-due the checkpoint's, YYYY-MM-DD; an unreadable date carries null", () => {
  const w = people({
    actionClocks: {
      overdueClocks: () => page([
        { action: "ACT-1", ord: 0, date: "2026-08-20", basis: "b", text: "t", status: "pending", past: true, project: "PRJ-1", created_by: "alice" },
        { action: "ACT-1", ord: 1, date: null, basis: "b", text: "t", status: "overdue", past: false, project: "PRJ-1", created_by: "alice" }]),
      remindersDue: () => page([
        { action: "ACT-1", ord: 0, date: "2026-09-12", basis: "b", text: "t", on: "2026-08-30", set_by: "alice", project: "PRJ-1" }]) },
    actionPlans: { checkpointsDue: () => ({ ok: true, limit: 500, truncated: false, items: [
      { plan: "PLN-1", project: "PRJ-1", scenario: 1, version: 1, phase: "p", set_by: "alice", due: "2026-08-28", days_since_due: 4 },
      { plan: "PLN-1", project: "PRJ-1", scenario: 2, version: 1, phase: "q", set_by: "alice", due: "2026-08-29T09:30:00Z", days_since_due: 3 }] }) } });
  const m = byId(w.read("alice"));
  assert.equal(m["CONDITION::action-clock-overdue::ACT-1::0"].due, "2026-08-20", "the clock entry's date");
  assert.equal(m["CONDITION::action-clock-overdue::ACT-1::1"].due, null, "no date the producer can read: null, never invented");
  assert.equal(m["OBLIGATION::action-reminder::ACT-1::0::2026-08-30"].due, "2026-09-12", "the entry's date, not the reminder's day");
  assert.equal(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::p"].due, "2026-08-28", "the checkpoint's day");
  assert.equal(m["OBLIGATION::plan-checkpoint-due::PLN-1::2::q"].due, "2026-08-29", "spelled YYYY-MM-DD");
  for (const it of Object.values(m))
    if (it.due !== null) assert.match(it.due, /^\d{4}-\d{2}-\d{2}$/, it.id);
});

test("R29 (DEC-113): one FINDING litigation-hold-released per release actions.holdsReleased answers the viewer, keyed FINDING::litigation-hold-released::<action>::<position>::<sequence>, to every administrator and each member among its placers and nobody else, raised once", () => {
  const asked = [];
  const released = [
    { action: "ACT-1", ord: 2, seq: 3, released_by: "olga", released_at: iso(NOW - 2 * DAY), reason: "the matter settled",
      placers: ["alice", "bob"], restarted: ["PRJ-1", "PRJ-H"] },
    { action: "ACT-1", ord: 4, seq: 7, released_by: "alice", released_at: "not an instant", reason: "no suit was filed",
      placers: ["bob", "token:member"], restarted: [] },
    { action: "ACT-2", ord: 0, seq: 2, released_by: "ada", released_at: iso(NOW - DAY), reason: "withdrawn",
      placers: ["alice"], restarted: ["PRJ-1"] },
    { action: "ACT-H", ord: 1, seq: 2, released_by: "ada", released_at: iso(NOW), reason: "r", placers: ["alice"], restarted: [] }];
  const w = people({ actions: { holdsReleased: (a) => { asked.push(a);
    /* two pages: the first truncated with a cursor, the second the rest */
    return a.after ? page(released.slice(2)) : page(released.slice(0, 2), { truncated: true, cursor: "ACT-1#4#7" }); } } });
  w.bundle("ACT-H", "action"); w.run(`UPDATE bundles SET project='PRJ-H' WHERE bundle_id='ACT-H'`);
  w.run(`UPDATE bundles SET project='PRJ-1' WHERE bundle_id IN ('ACT-1','ACT-2')`);
  const ids = (r) => ofKind(r, "litigation-hold-released").map((i) => i.id).sort();
  const alice = w.read("alice");
  assert.deepEqual(asked.slice(0, 2).map((a) => [a.after, a.viewer]), [[null, "member:alice"], ["ACT-1#4#7", "member:alice"]],
    "the viewer is actions' to read by, and its cursor is followed");
  const all = ["FINDING::litigation-hold-released::ACT-1::2::3", "FINDING::litigation-hold-released::ACT-1::4::7",
    "FINDING::litigation-hold-released::ACT-2::0::2", "FINDING::litigation-hold-released::ACT-H::1::2"];
  assert.deepEqual(ids(w.read("ada")), all, "every administrator member: one item per release");
  assert.deepEqual(ids(w.read(null, "class:admin")), all, "and the admin machine credential, as R14's");
  assert.deepEqual(ids(alice), ["FINDING::litigation-hold-released::ACT-1::2::3", "FINDING::litigation-hold-released::ACT-2::0::2"],
    "a placer, of the holds she placed, never one on an action she may not see, nor one she released and did not place");
  assert.deepEqual(ids(w.read("bob")), ["FINDING::litigation-hold-released::ACT-1::2::3", "FINDING::litigation-hold-released::ACT-1::4::7"]);
  assert.deepEqual(ids(w.read("olga")), [], "not the member who released it, nor the project's owner, who is neither");
  assert.deepEqual(ids(w.read(null, "class:member")), [], "nor another machine credential");
  assert.ok(!JSON.stringify(alice).includes("ACT-H") && !JSON.stringify(alice).includes("PRJ-H"),
    "R11: the hidden action and the hidden restarted project are named nowhere");
  const it = byId(alice)["FINDING::litigation-hold-released::ACT-1::2::3"];
  assert.deepEqual([it.class, it.kind], ["FINDING", "litigation-hold-released"]);
  assert.deepEqual(it.subject, { kind: "action", id: "ACT-1", entry: 2, sequence: 3, released_by: "olga",
    reason: "the matter settled", restarted: ["PRJ-1"] }, "its subject the action, naming who released it, the reason, the restarted projects she may see");
  assert.match(it.summary, /olga released the litigation hold on ACT-1/);
  assert.match(it.detail, /the matter settled/); assert.match(it.detail, /restarts for PRJ-1\./);
  assert.ok(!/PRJ-H/.test(JSON.stringify(it)));
  assert.deepEqual(byId(w.read("ada"))["FINDING::litigation-hold-released::ACT-1::2::3"].subject.restarted, ["PRJ-1", "PRJ-H"],
    "an administrator who sees both projects is told both");
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 2 * DAY), ms: 2 * DAY }, "aged from the release");
  assert.equal(byId(w.read("bob"))["FINDING::litigation-hold-released::ACT-1::4::7"].age.state, "undetermined");
  assert.deepEqual(it.recipients, ["ada", "alice", "bob"], "every administrator and each placer");
  assert.deepEqual(byId(w.read("bob"))["FINDING::litigation-hold-released::ACT-1::4::7"].recipients, ["ada", "bob"],
    "a machine among the placers is no member to tell");
  assert.deepEqual(it.options, [{ id: "opt", on: ["ACT-1"] }], "the acts on the action; it leaves by its recipient's disposal");
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]], "homed as R15's, under the action's project");
  assert.equal(it.basis.source, "actions.holdsReleased"); assert.deepEqual(it.basis.placers, ["alice", "bob"]);
  for (const s of [it.summary, it.detail, it.basis.detail]) assert.doesNotMatch(s, /\b(obligation|condition|subject|bundle)s?\b/i, s);
  // raised once and never repeated: the same read twice is the same items, and nothing here makes it leave
  assert.deepEqual(ids(w.read("alice")), ids(alice));
  assert.deepEqual(ids(w.read("alice", "member:alice", { now: NOW + 30 * DAY })), ids(alice),
    "it stands until its recipient disposes of it (queue's mint), however long");
  // at most 20 pages are followed, and a cut is stated
  let n = 0;
  w.fakes.actions.holdsReleased = () => { n += 1; return page([{ ...released[0], seq: n }], { truncated: true, cursor: `ACT-1#2#${n}` }); };
  const cut = ofKind(w.read("alice"), "litigation-hold-released");
  assert.equal(n, 20); assert.equal(cut.length, 20); assert.ok(cut.every((i) => i.basis.bound.truncated === true));
});
