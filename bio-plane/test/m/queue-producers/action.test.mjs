/* The Action layer's to-dos (T45; K2781 (1)), action-producers' since T45 (its R1–R12, was this module's R15–R21, R29), as
   feedItems answers them (R8): every item `action-producers.actionItems` answers, passed the read's member, viewer and instant
   and queue's walk and options, with its facts beside the others; and none of the moved kinds raised here, whatever their
   old providers answer. And the self-registered signing key (R14; N375). action-producers is a fake answering its R13's
   shape, filled per test; membership is real, so the signing keys (its R27) are its own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const DAY = 86400000;
const page = (items, extra = {}) => ({ ok: true, items, limit: 500, truncated: false, cursor: null, ...extra });
const ofKind = (r, kind) => r.items.filter((i) => i.kind === kind);
/* The kinds that moved to action-producers (its R1–R12): never raised by this module itself. */
const MOVED = ["action-clock-overdue", "plan-checkpoint-due", "escalation-stage-proposed", "action-reminder", "litigation-hold",
               "litigation-hold-released", "template-review-requested", "local-fact-due", "member-left-items", "watch-keep-or-stop",
               "plan-review-due", "plan-look-again"];

/* An action-producers fake in its R13 shape: each item homed and offered through the functions it was handed. */
function actionFake(log, { facts = { action_clock_overdue: { bound: 20, truncated: false }, failed: [] } } = {}) {
  return { actionItems: (a) => {
    log.push(a);
    const homes = (s) => (typeof a.homesOf === "function" ? a.homesOf(s) : { state: "determined", ungrouped: true, reasons: [], depth_bound: null, ancestors: [] });
    const opts = (s) => (typeof a.optionsOf === "function" ? a.optionsOf(s) : []);
    const door = { id: "actioncorrespond", label: "Record a reply", weight: "single" };
    return answered.set(a, { facts, items: [
      { id: "CONDITION::action-clock-overdue::ACT-1::0", class: "CONDITION", kind: "action-clock-overdue", case: homes(["ACT-1"]),
        due: "2026-08-20", subject: { kind: "action", id: "ACT-1", entry: 0 }, summary: "Noticed: no reply recorded by 2026-08-20",
        detail: "d", basis: { source: "action-clocks.overdueClocks", detail: "the provider's" },
        age: { state: "determined", since: "2026-08-21T00:00:00Z", ms: 1, days: 11 }, assignee: null, assignee_role: null,
        recipients: [a.member], options: [door, ...opts(["ACT-1"])] },
      { id: "OBLIGATION::plan-review-due::PLN-1::2026-08-31", class: "OBLIGATION", kind: "plan-review-due", case: homes(["PRJ-1"]),
        due: "2026-08-31", subject: { kind: "plan", id: "PLN-1" }, summary: "s", detail: "d", basis: { source: "plan-work.planReviewsDue" },
        age: { state: "undetermined", reason: "zone_undetermined" }, assignee: null, assignee_role: null, recipients: [a.member],
        options: opts(["PLN-1"]) }] }).get(a);
  } };
}
/* what each read of the fake answered, by its arguments */
const answered = new Map();

test("R8 (T45; K2781 (1)): feedItems answers every item action-producers.actionItems answers, unchanged and in its order, passed the read's member, viewer and instant and the same homesOf and optionsOf; its facts beside the others", () => {
  const log = [];
  const w = world({ actionProducers: actionFake(log) });
  w.member("alice"); w.bundle("PRJ-1", "project"); w.bundle("ACT-1", "action"); w.join("PRJ-1", "alice"); w.cite("PRJ-1", "ACT-1");
  const r = w.read("alice");
  assert.equal(log.length, 1, "action-producers is read once per read");
  const a = log[0];
  assert.deepEqual([a.member, a.viewer, a.now], ["alice", "member:alice", NOW], "the read's member, viewer and instant");
  assert.deepEqual(Object.keys(a).sort(), ["homesOf", "member", "now", "optionsOf", "viewer"], "and nothing else (its R13's parameters)");
  /* the walk and the options are queue's own, as this read was handed them: what action-producers asks of them is what queue records */
  assert.ok(w.asked.homes.some((s) => s.length === 1 && s[0] === "ACT-1"), "the walk action-producers asked is the one queue passed");
  assert.ok(w.asked.options.some((s) => s.length === 1 && s[0] === "ACT-1"), "and the options");
  const theirs = r.items.filter((i) => MOVED.includes(i.kind));
  const said = answered.get(a).items;
  assert.equal(theirs.length, said.length);
  theirs.forEach((it, i) => assert.equal(it, said[i], `${it.id}: the very item it answered, untouched (homes, options, due, age)`));
  assert.deepEqual(theirs.map((i) => i.id), said.map((i) => i.id), "in its order");
  assert.deepEqual(theirs[0].case.ancestors.map((x) => x.id), ["PRJ-1"], "homed by queue's walk, as action-producers asked it");
  assert.deepEqual(theirs[0].options.map((o) => o.id), ["actioncorrespond", "opt"], "its doors first, then queue's options");
  for (const it of theirs) assert.ok(!("disposition" in it) && !("catalogue_id" in it), `${it.id}: the mint's and queue's`);
  assert.deepEqual(r.facts.action, { action_clock_overdue: { bound: 20, truncated: false }, failed: [] }, "its facts, beside the others");
  for (const k of ["objective_gap", "unattributed", "contradiction", "dispositions"]) assert.ok(k in r.facts, `${k} still beside it`);
  /* a caller with no member is passed none; a read handed no walk passes none on */
  w.read(null, "class:admin");
  assert.deepEqual([log[1].member, log[1].viewer], [null, "class:admin"]);
  w.read("alice", "member:alice", { homes: false, options: false });
  assert.deepEqual([log[2].homesOf, log[2].optionsOf], [undefined, undefined], "no walk passed, none handed on");
  assert.deepEqual(ofKind(w.read("alice", "member:alice", { homes: false, options: false }), "action-clock-overdue")[0].case.ancestors, [],
    "so no item is given a home it was not handed");
  /* an answer with no facts is stated as none, never missing */
  w.fakes.actionProducers.actionItems = () => ({ items: [] });
  assert.deepEqual(w.read("alice").facts.action, {});
});

test("R8 (T45; R15–R21, R29 retired): the moved kinds are never raised here, whatever their old providers answer; only what action-producers answers reaches the feed", () => {
  const asked = { clocks: 0, plans: 0, escalation: 0, holds: 0, templates: 0, facts: 0 };
  const count = (k, v) => (...x) => { asked[k] += 1; void x; return v; };
  /* every provider the moved producers read, answering something each would have raised an item for */
  const w = world({
    actionClocks: { overdueClocks: count("clocks", page([{ action: "ACT-1", ord: 0, date: "2026-08-20", basis: "b", text: "t",
                      status: "pending", past: true, project: "PRJ-1", created_by: "alice" }])),
                    remindersDue: count("clocks", page([{ action: "ACT-1", ord: 0, date: "2026-08-20", basis: "b", text: "t",
                      on: "2026-08-15", set_by: "alice", project: "PRJ-1" }])),
                    calendarFactsRead: count("facts", { ok: true, paths: [{ path: "p", actions: [{ action: "ACT-1", project: "PRJ-1", created_by: "alice" }] }],
                      actions_limit: 500, truncated: false }) },
    actionPlans: { checkpointsDue: count("plans", { ok: true, limit: 500, truncated: false, items: [{ plan: "PLN-1", project: "PRJ-1",
                     scenario: 1, version: 1, phase: "p", set_by: "alice", due: "2026-08-30" }] }) },
    escalation: { escalationsDue: count("escalation", { ok: true, limit: 500, truncated: false, items: [{ id: "ESC-1", project: "PRJ-1",
                    opened_by: "alice", from: 1, to: 2, stage: "s", instant: iso(NOW - DAY), ids: [] }] }) },
    actions: { holdsDue: count("holds", page([{ action: "ACT-1", ord: 1, note: "n", marked_by: "alice", marked_at: iso(NOW - DAY), project: "PRJ-1" }])),
               holdsReleased: count("holds", page([{ action: "ACT-1", ord: 0, seq: 2, released_by: "alice", released_at: iso(NOW - DAY),
                 reason: "r", placers: ["alice"], restarted: [] }])) },
    filingTemplates: { reviewsRequested: count("templates", page([{ template: "TPL-1", version: "TPL-1@1", name: "n", kind: "k",
                         member: "alice", asked_by: { id: "olga" }, asked_at: iso(NOW - DAY) }])) },
    localFacts: { factsDue: count("facts", { ok: true, due: [{ path: "p", status: "unconfirmed", due: true }], unknown: [], absent: [] }) } });
  w.member("alice", { role: "admin" }); w.bundle("PRJ-1", "project"); w.bundle("ACT-1", "action"); w.join("PRJ-1", "alice", { owner: true });
  for (const [member, viewer] of [["alice", "member:alice"], [null, "class:admin"]]) {
    const r = w.read(member, viewer);
    assert.deepEqual(r.items.filter((i) => MOVED.includes(i.kind)).map((i) => i.id), [], `${viewer}: no moved kind raised here`);
    assert.ok(!r.items.some((i) => MOVED.some((k) => i.id.includes(`::${k}::`))), "and no id of one");
  }
  assert.deepEqual(asked, { clocks: 0, plans: 0, escalation: 0, holds: 0, templates: 0, facts: 0 }, "none of their providers is asked by this module");
  /* the control: the same kinds, answered by action-producers, are answered */
  const log = [];
  w.fakes.actionProducers.actionItems = actionFake(log).actionItems;
  assert.deepEqual(w.read("alice").items.filter((i) => MOVED.includes(i.kind)).map((i) => i.id),
    ["CONDITION::action-clock-overdue::ACT-1::0", "OBLIGATION::plan-review-due::PLN-1::2026-08-31"]);
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
