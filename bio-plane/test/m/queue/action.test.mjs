/* The Action layer's kinds at queue's interface (K608, K611, K614; K899 (7)), over a stubbed `queue-producers.feedItems`
   (its R8, R15–R19) minting each as its requirement keys it: the four OBLIGATIONs (the litigation hold among them) pass
   the mint (R1, R11), name the door each leaves by (R12, R28) and are never muted (R19, R26, R31); the overdue clock is
   a CONDITION a member may mute (R5, R14, R20). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { QUEUE_ACT_CHECKS } from "../../../src/queue/index.mjs";

const ITEMS = {
  checkpoint: { id: "OBLIGATION::plan-checkpoint-due::PLN-1::S1::2", class: "OBLIGATION", kind: "plan-checkpoint-due",
                subject: { kind: "bundle", id: "PLN-1" }, door: "checkpointrecord", says: /op=checkpointrecord/ },
  stage:      { id: "OBLIGATION::escalation-stage-proposed::ESC-1::filed", class: "OBLIGATION", kind: "escalation-stage-proposed",
                subject: { kind: "bundle", id: "ESC-1" }, door: "escalationadvance", says: /op=escalationadvance.*op=escalationdecline/ },
  reminder:   { id: "OBLIGATION::action-reminder::ACT-1::0::2026-09-02", class: "OBLIGATION", kind: "action-reminder",
                subject: { kind: "bundle", id: "ACT-1" }, door: "reminderanswer", says: /op=reminderanswer/ },
  hold:       { id: "OBLIGATION::litigation-hold::ACT-1::2", class: "OBLIGATION", kind: "litigation-hold",
                subject: { kind: "bundle", id: "ACT-1" }, door: "actionhold",
                says: /keyed by the action and the entry rather than by a task: it leaves when a member records the hold in place or released, with a reason: in place by placing it \(op=actionhold\), released by releasing it \(op=actionholdrelease\), its own act/ },
  overdue:    { id: "CONDITION::action-clock-overdue::ACT-1::0", class: "CONDITION", kind: "action-clock-overdue",
                subject: { kind: "bundle", id: "ACT-1" } },
};
const FACTS = { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 0, inquiries: [] },
                contradiction: { bound: 50, truncated: false }, dispositions: [] };

function withAction() {
  const w = world({ producers: { feedItems: (a) => ({ facts: FACTS, items: Object.values(ITEMS).map(({ door, says, ...it }) => ({
    ...it, case: a.homesOf([it.subject.id]), summary: it.kind, detail: null,
    basis: { source: "queue-producers", detail: "stubbed as its requirement keys it" },
    age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: "alice", assignee_role: null,
    options: a.optionsOf([it.subject.id]) })) }) } });
  w.member("alice");
  w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice");
  for (const id of ["PLN-1", "ESC-1", "ACT-1"]) { w.bundle(id); w.cite("PRJ-1", id); }
  return w;
}

test("R1, R11, R12: the Action layer's OBLIGATIONs, litigation-hold among them, pass the mint and each names its own door, never taskresolve", () => {
  const w = withAction();
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const items = byId(f);
  for (const k of ["checkpoint", "stage", "reminder", "hold"]) {
    const { id, door, says } = ITEMS[k];
    const d = items[id].disposition;
    assert.deepEqual([items[id].class, d.available, d.reason, d.instead], ["OBLIGATION", false, "an_obligation_is_resolved_not_disposed", door], id);
    assert.match(d.detail, says, id);
    assert.deepEqual(items[id].case.ancestors.map((a) => a.id), ["PRJ-1"], "homed by R7's walk");
  }
  assert.equal(f.counts.obligation, 4);
  assert.deepEqual(f.items.map((i) => i.class), ["OBLIGATION", "OBLIGATION", "OBLIGATION", "OBLIGATION", "CONDITION"]);
});

test("R5, R11, R12: action-clock-overdue mints as a CONDITION and its door is queuemute; minted as a FINDING the feed refuses", () => {
  const w = withAction();
  const d = byId(w.feed("alice"))[ITEMS.overdue.id].disposition;
  assert.deepEqual([d.available, d.instead, d.reason], [false, "queuemute", "a_condition_is_acknowledged_or_muted"]);
  // t18-entries.md's FINDING is not adopted (K611): the mint says so
  const w2 = world({ producers: { feedItems: (a) => ({ facts: FACTS, items: [{ id: "FINDING::action-clock-overdue::ACT-1::0",
    class: "FINDING", kind: "action-clock-overdue", case: a.homesOf([]), subject: { kind: "bundle", id: "ACT-1" },
    basis: { source: "x", detail: "x" }, age: { state: "undetermined" }, assignee: null, assignee_role: null, options: [] }] }) } });
  const r = w2.feed(null, "class:admin");
  assert.deepEqual([r.ok, r.reason, r.catalogued_as, r.minted_as], [false, "KIND_MISCLASSED", "CONDITION", "FINDING"]);
});

test("R19, R26, R31: each Action OBLIGATION, litigation-hold among them, is refused KIND_NOT_PERSONAL by kind and by its published id, and no row suppresses it", () => {
  const w = withAction();
  for (const k of ["checkpoint", "stage", "reminder", "hold"]) {
    const { id, kind } = ITEMS[k];
    for (const r of [w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: [kind] }),
                     w.q.queueMute({ member: "alice", viewer: "member:alice", item: id })])
      assert.deepEqual([r.ok, r.reason, r.kind_class, r.check, r.translation],
        [false, "KIND_NOT_PERSONAL", "OBLIGATION", "C-33.27", QUEUE_ACT_CHECKS.KIND_NOT_PERSONAL.translation], id);
    w.run(`INSERT INTO queue_item_mutes VALUES ('alice', ?, 'OBLIGATION', ?)`, id, iso(NOW));
  }
  assert.equal(w.all(`SELECT count(*) c FROM queue_state`)[0].c, 0, "a refusal writes nothing");
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('alice','PRJ-1','action-reminder,escalation-stage-proposed,litigation-hold,plan-checkpoint-due')`);
  const f = w.feed("alice");
  assert.equal(f.counts.obligation, 4, "rows naming them suppress none");
  assert.ok(f.mute.suppressed.every((s) => s.class !== "OBLIGATION"));
});

test("R14, R19, R20: a member mutes action-clock-overdue for themselves, by kind on a case or by its id; another member still sees it", () => {
  const w = withAction();
  w.member("bob"); w.join("PRJ-1", "bob");
  const byKind = w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: ["action-clock-overdue"] });
  assert.deepEqual([byKind.ok, byKind.muted_kinds], [true, ["action-clock-overdue"]]);
  let f = w.feed("alice");
  assert.equal(byId(f)[ITEMS.overdue.id], undefined);
  assert.deepEqual(f.mute.suppressed.map((s) => [s.id, s.scope, s.case]), [[ITEMS.overdue.id, "case", "PRJ-1"]]);
  assert.ok(byId(w.feed("bob"))[ITEMS.overdue.id], "a mute is personal");
  w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: ["action-clock-overdue"], unmute: true });
  const byItem = w.q.queueMute({ member: "alice", viewer: "member:alice", item: ITEMS.overdue.id });
  assert.deepEqual([byItem.ok, byItem.form, byItem.item_class], [true, "item", "CONDITION"]);
  f = w.feed("alice");
  assert.deepEqual(f.mute.suppressed.map((s) => [s.id, s.scope]), [[ITEMS.overdue.id, "item"]]);
  // it is offered among the mutable kinds a refusal lists
  const refused = w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: [] });
  assert.ok(refused.available.includes("action-clock-overdue"));
  assert.ok(!refused.available.includes("action-reminder"));
  assert.ok(!refused.available.includes("litigation-hold"));
});

test("R8, R15–R18, R20, R21 (K728, K921): a caller's fakes for the Action layer's providers, filingTemplates and localFacts reach queue-producers, each asked by its producer", () => {
  const asked = [];
  const page = (name) => (a) => { asked.push([name, a.viewer]); return { ok: true, items: [], truncated: false, cursor: null }; };
  const w = world({ actionClocks: { overdueClocks: page("overdueClocks"), remindersDue: page("remindersDue"),
                                    /* action-clocks R11: one path a live deadline reads, so R21 asks local-facts of it */
                                    calendarFactsRead: (a) => { asked.push(["calendarFactsRead", a.viewer]);
                                      return { ok: true, paths: [{ path: "calendar.holidays.2026",
                                        actions: [{ action: "ACT-1", project: null, created_by: "alice" }] }], truncated: false }; } },
                    escalation: { escalationsDue: page("escalationsDue") },
                    actionPlans: { checkpointsDue: page("checkpointsDue") },
                    filingTemplates: { reviewsRequested: page("reviewsRequested") },
                    localFacts: { factsDue: (a) => { asked.push(["factsDue", a.viewer, a.paths]); return { ok: true, due: [], unknown: [], absent: [] }; } } });
  w.member("alice");
  assert.equal(w.feed("alice").ok, true);
  assert.deepEqual(asked.map(([n]) => n).sort(), ["calendarFactsRead", "checkpointsDue", "escalationsDue", "factsDue", "overdueClocks",
                                                  "remindersDue", "reviewsRequested"]);
  for (const [n, v] of asked) if (n !== "checkpointsDue") assert.equal(v, "member:alice", n);
  assert.deepEqual(asked.find(([n]) => n === "factsDue")[2], ["calendar.holidays.2026"], "R21 asks local-facts of the paths action-clocks answered");
});

test("R12, R28 (K899 (7)): litigation-hold's door is actionhold on the item, and the bridge answers CLASS_NOT_DISPOSED with the same instead", () => {
  const w = withAction();
  const d = byId(w.feed("alice"))[ITEMS.hold.id].disposition;
  assert.deepEqual([d.available, d.op, d.scope, d.key, d.instead], [false, null, null, null, "actionhold"]);
  for (const key of [ITEMS.hold.id, "litigation-hold::ACT-1::2"]) {
    const r = w.q.proposeDispose({ key, to: "deferred", reason: "r", decidedBy: "alice", viewer: "member:alice", identity: "member:alice" });
    assert.deepEqual([r.ok, r.reason, r.class, r.kind, r.instead, r.check, r.translation],
      [false, "CLASS_NOT_DISPOSED", "OBLIGATION", "litigation-hold", d.instead, "C-33.44", QUEUE_ACT_CHECKS.CLASS_NOT_DISPOSED.translation], key);
  }
  assert.equal(w.all(`SELECT count(*) c FROM finding_dispositions`)[0].c, 0, "nothing written");
});

test("R8, R12 (K899 (7)): a caller's fake actions reaches queue-producers R19, whose litigation-hold item mints with its door; answering no mark, none", () => {
  const asked = [];
  const marks = [{ action: "ACT-1", ord: 2, note: "a letter from counsel", marked_by: "bob", marked_at: iso(NOW - 5000), project: null }];
  const holds = (answer) => ({ holdsDue: (a) => { asked.push(a.viewer); return { ok: true, items: answer, truncated: false, cursor: null }; } });
  const w = world({ actions: holds(marks) });
  w.member("alice", { role: "admin" }); w.member("bob"); w.bundle("ACT-1", "action");
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const it = byId(f)["OBLIGATION::litigation-hold::ACT-1::2"];
  assert.ok(it, "the fake's mark reached R19's mint");
  assert.deepEqual([it.class, it.kind, it.disposition.available, it.disposition.instead], ["OBLIGATION", "litigation-hold", false, "actionhold"]);
  assert.deepEqual(asked, ["member:alice"], "asked once, of this viewer");
  // negative control: the same feed over a fake answering no mark mints no litigation-hold item
  const none = world({ actions: holds([]) });
  none.member("alice", { role: "admin" }); none.bundle("ACT-1", "action");
  const g = none.feed("alice");
  assert.equal(g.ok, true);
  assert.equal(g.items.filter((i) => i.kind === "litigation-hold").length, 0);
  assert.equal(asked.length, 2, "the fake was asked and answered none");
});
