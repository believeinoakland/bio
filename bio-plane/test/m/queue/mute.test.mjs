/* The personal half at its interface: queueMute (R19, R20, R26), queueSnooze (R21), the re-notify consumer (R22), and
   the boundary between a preference and a record act (R30). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { QUEUE_ACT_CHECKS } from "../../../src/queue/index.mjs";
import { QUEUE_CONDITION_KINDS, QUEUE_FINDING_KINDS } from "../../../src/queuestate.mjs";

const mutable = [...Object.keys(QUEUE_CONDITION_KINDS), ...Object.keys(QUEUE_FINDING_KINDS)];

function setup() {
  const w = world();
  w.member("alice"); w.member("bob");
  w.bundle("INQ-1", "inquiry"); w.bundle("PRJ-1", "project"); w.bundle("PRJ-H", "project"); w.bundle("INF-1");
  w.join("PRJ-1", "alice"); w.join("PRJ-H", "bob");
  w.task("TASK-2026-0001-a", "INF-1");
  return w;
}
const mute = (w, a) => w.q.queueMute({ member: "alice", viewer: "member:alice", ...a });

test("R19: refusals in order: NO_MEMBER; BAD_KIND for an item beside a case or kinds; NO_CASE, NO_SUCH_CASE, NOT_A_CASE, NO_KINDS", () => {
  const w = setup();
  assert.equal(w.q.queueMute({ member: "", case: "INQ-1", kinds: ["render-deferred"], viewer: "member:alice" }).reason, "NO_MEMBER");
  assert.equal(mute(w, { item: "FINDING::p::s", kinds: ["render-deferred"] }).reason, "BAD_KIND");
  assert.equal(mute(w, { item: "FINDING::p::s", case: "INQ-1" }).reason, "BAD_KIND");
  assert.equal(mute(w, { kinds: ["render-deferred"] }).reason, "NO_CASE");
  assert.equal(mute(w, { case: "NOPE", kinds: ["render-deferred"] }).reason, "NO_SUCH_CASE");
  const hidden = mute(w, { case: "PRJ-H", kinds: ["render-deferred"] });
  assert.equal(hidden.reason, "NO_SUCH_CASE", "invisible and absent answer alike");
  assert.equal(hidden.detail, mute(w, { case: "NOPE", kinds: ["render-deferred"] }).detail);
  assert.equal(mute(w, { case: "INF-1", kinds: ["render-deferred"] }).reason, "NOT_A_CASE");
  const nk = mute(w, { case: "INQ-1", kinds: [] });
  assert.equal(nk.reason, "NO_KINDS"); assert.deepEqual(nk.available, mutable);
});

test("R19: then per kind or item: a comma BAD_KIND; unclassifiable UNKNOWN_KIND (with the mutable kinds); an OBLIGATION KIND_NOT_PERSONAL with its sentence", () => {
  const w = setup();
  assert.equal(mute(w, { case: "INQ-1", kinds: ["a,b"] }).reason, "BAD_KIND");
  const u = mute(w, { case: "INQ-1", kinds: ["no-such-kind"] });
  assert.equal(u.reason, "UNKNOWN_KIND"); assert.deepEqual(u.available, mutable);
  assert.equal(mute(w, { item: "nothing-here" }).reason, "UNKNOWN_KIND");
  for (const r of [mute(w, { case: "INQ-1", kinds: ["authority-undetermined"] }), mute(w, { item: "TASK-2026-0001-a" })]) {
    assert.equal(r.reason, "KIND_NOT_PERSONAL"); assert.equal(r.kind_class, "OBLIGATION");
    assert.equal(r.check, "C-33.27"); assert.equal(r.translation, QUEUE_ACT_CHECKS.KIND_NOT_PERSONAL.translation);
    assert.match(r.detail, /OBLIGATION/);
  }
  assert.equal(w.all(`SELECT count(*) c FROM queue_state`)[0].c + w.all(`SELECT count(*) c FROM queue_item_mutes`)[0].c, 0, "nothing written");
});

test("R26: an OBLIGATION muted by its published id OBLIGATION::bias-debt::<run> is KIND_NOT_PERSONAL, not UNKNOWN_KIND", () => {
  const w = setup();
  const r = mute(w, { item: "OBLIGATION::bias-debt::run-1" });
  assert.equal(r.reason, "KIND_NOT_PERSONAL"); assert.equal(r.kind_class, "OBLIGATION"); assert.equal(r.check, "C-33.27");
});

test("R20: the item form records or removes one mute; the case form adds to the set and removes named kinds, keeping the snooze", () => {
  const w = setup();
  let r = mute(w, { item: "CONDITION::governor-holding-host::h.example", at: iso(NOW) });
  assert.deepEqual([r.ok, r.form, r.item_class, r.muted_items, r.added, r.removed, r.at],
    [true, "item", "CONDITION", ["CONDITION::governor-holding-host::h.example"], ["CONDITION::governor-holding-host::h.example"], [], iso(NOW)]);
  assert.equal(r.wrote.queue_item_mutes, 1); assert.equal(r.wrote.tasks, 0); assert.equal(r.wrote.proposal_dispositions, 0); assert.equal(r.wrote.bundles, 0);
  r = mute(w, { item: "CONDITION::governor-holding-host::h.example", unmute: true });
  assert.deepEqual([r.muted_items, r.added, r.removed], [[], [], ["CONDITION::governor-holding-host::h.example"]]);
  const until = iso(NOW + 86400000);
  assert.equal(w.q.queueSnooze({ member: "alice", case: "INQ-1", until, viewer: "member:alice" }).ok, true);
  r = mute(w, { case: "INQ-1", kinds: ["render-deferred"] });
  assert.deepEqual([r.muted_kinds, r.added], [["render-deferred"], ["render-deferred"]]);
  r = mute(w, { case: "INQ-1", kinds: ["governor-holding-host", "render-deferred"] });
  assert.deepEqual([r.muted_kinds, r.added], [["governor-holding-host", "render-deferred"], ["governor-holding-host"]], "added to, never replaced");
  r = mute(w, { case: "INQ-1", kinds: ["render-deferred"], unmute: true });
  assert.deepEqual([r.muted_kinds, r.removed], [["governor-holding-host"], ["render-deferred"]]);
  assert.deepEqual(Object.keys(r.wrote).filter((k) => r.wrote[k] > 0), ["queue_state"]);
  assert.equal(w.all(`SELECT snoozed_until FROM queue_state WHERE member_id='alice' AND case_id='INQ-1'`)[0].snoozed_until,
    new Date(Date.parse(until)).toISOString(), "the snooze is kept");
});

test("R21: NO_MEMBER, the case refusals, NO_UNTIL, BAD_UNTIL, UNTIL_IN_PAST; records or clears the snooze, keeping the mutes", () => {
  const w = setup();
  const s = (a) => w.q.queueSnooze({ member: "alice", viewer: "member:alice", ...a });
  assert.equal(w.q.queueSnooze({ case: "INQ-1", until: iso(NOW + 5000) }).reason, "NO_MEMBER");
  assert.equal(s({ until: iso(NOW + 5000) }).reason, "NO_CASE");
  assert.equal(s({ case: "PRJ-H", until: iso(NOW + 5000) }).reason, "NO_SUCH_CASE");
  assert.equal(s({ case: "INF-1", until: iso(NOW + 5000) }).reason, "NOT_A_CASE");
  assert.equal(s({ case: "INQ-1" }).reason, "NO_UNTIL");
  assert.equal(s({ case: "INQ-1", until: "tomorrow-ish" }).reason, "BAD_UNTIL");
  assert.equal(s({ case: "INQ-1", until: iso(NOW - 1000) }).reason, "UNTIL_IN_PAST");
  mute(w, { case: "INQ-1", kinds: ["render-deferred"] });
  let r = s({ case: "INQ-1", until: iso(NOW + 5000) });
  assert.equal(r.ok, true); assert.equal(r.snoozed_until, new Date(NOW + 5000).toISOString());
  r = s({ case: "INQ-1", clear: true });
  assert.equal(r.snoozed_until, null);
  const row = w.all(`SELECT * FROM queue_state WHERE member_id='alice' AND case_id='INQ-1'`)[0];
  assert.deepEqual([row.muted_kinds, row.snoozed_until], ["render-deferred", null]);
  assert.equal(w.all(`SELECT count(*) c FROM tasks`)[0].c, 1);
});

test("R22: the queue-renotify consumer is due when a snooze has expired, wakes at the earliest future one, and writes nothing", () => {
  const w = setup();
  const c = w.q.renotifyConsumer();
  assert.equal(c.name, "queue-renotify");
  assert.equal(c.due(NOW), null); assert.equal(c.wake(NOW), null);
  w.run(`INSERT INTO queue_state (member_id, case_id, snoozed_until) VALUES ('alice','INQ-1',?), ('bob','INQ-1',?), ('alice','PRJ-1',?)`,
    new Date(NOW + 5000).toISOString(), new Date(NOW + 9000).toISOString(), new Date(NOW - 1).toISOString());
  const before = JSON.stringify(w.all(`SELECT * FROM queue_state ORDER BY member_id, case_id`));
  assert.equal(c.due(NOW), NOW); assert.equal(c.wake(NOW), NOW + 5000);
  assert.deepEqual(c.tick(NOW), { queuerenotify: { expired: 1, next: NOW + 5000 } });
  assert.equal(JSON.stringify(w.all(`SELECT * FROM queue_state ORDER BY member_id, case_id`)), before);
});

test("R30: a mute writes only this member's rows and moves no other member's feed; a resolution or disposition never writes a mute", () => {
  const w = setup();
  w.bundle("INFO-2026-0001-doc"); w.leg("INQ-1", "INFO-2026-0001-doc"); w.task("TASK-2026-0002-b", "INFO-2026-0001-doc");
  mute(w, { case: "INQ-1", kinds: ["render-deferred"] });
  mute(w, { item: "FINDING::p::s" });
  assert.deepEqual(w.all(`SELECT DISTINCT member_id FROM queue_state UNION SELECT DISTINCT member_id FROM queue_item_mutes`).map((r) => r.member_id), ["alice"]);
  const bob = w.feed("bob");
  assert.equal(bob.mute.suppressed.length, 0); assert.deepEqual(bob.mute.cases, []);
  const n = () => w.all(`SELECT (SELECT count(*) FROM queue_state) + (SELECT count(*) FROM queue_item_mutes) AS c`)[0].c;
  const had = n();
  assert.equal(w.tasks.taskResolve({ id: "TASK-2026-0002-b", actor: "alice" }).ok, true);
  w.bundle("PRJ-2", "project"); w.join("PRJ-2", "alice");
  assert.equal(w.q.proposeDispose({ project: "PRJ-2", finding: "FINDING::x::y", to: "dismissed", reason: "no", decidedBy: "alice",
                                    viewer: "member:alice", identity: "member:alice" }).ok, true);
  assert.equal(n(), had);
});
