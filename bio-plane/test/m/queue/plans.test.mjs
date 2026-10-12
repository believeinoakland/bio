/* T45's kinds at queue's interface (N855, N881, N890; Actions D6d, D14, D27; v0.2 rules 17, 18, 20), over a stubbed
   `queue-producers.feedItems` minting each as `action-producers` R9, R10 and R12 key it: the three OBLIGATIONs pass the
   mint (R1, R11), each names the door it leaves by (R12, R28) and is never muted (R19, R26, R31); `member-left-items` is a
   FINDING its recipient quiets for themselves (R12, R14, R20). And R1's moved kinds keep their classes, the litigation
   hold's sentence reaching a docket mark and a pressure record. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { QUEUE_ACT_CHECKS } from "../../../src/queue/index.mjs";
import { classOfKind, QUEUE_OBLIGATION_KINDS, QUEUE_FINDING_KINDS, QUEUE_CONDITION_KINDS } from "../../../src/queuestate.mjs";

const ITEMS = {
  watch:  { id: "OBLIGATION::watch-keep-or-stop::LNK-1", class: "OBLIGATION", kind: "watch-keep-or-stop", subject: "PLN-1",
            door: "watchanswer", says: /keeping the watch until a date or stopping it \(op=watchanswer\)/ },
  review: { id: "OBLIGATION::plan-review-due::PLN-1::2026-09-01", class: "OBLIGATION", kind: "plan-review-due", subject: "PLN-1",
            door: "planreviewrecord", says: /records a review of the plan \(op=planreviewrecord\)/ },
  look:   { id: "OBLIGATION::plan-look-again::PLN-2::2026-09-01", class: "OBLIGATION", kind: "plan-look-again", subject: "PLN-2",
            door: "planresume", says: /resumes the plan \(op=planresume\) or closes it/ },
  left:   { id: "FINDING::member-left-items::PRJ-1::carol", class: "FINDING", kind: "member-left-items", subject: "PLN-1" },
};
const OBLIGATIONS = ["watch", "review", "look"];
const FACTS = { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 0, inquiries: [] },
                contradiction: { bound: 50, truncated: false }, dispositions: [] };
const stub = (list) => ({ producers: { feedItems: (a) => ({ facts: FACTS, items: list.map(({ door, says, subject, ...it }) => ({
  ...it, case: a.homesOf([subject]), subject: { kind: "bundle", id: subject }, summary: it.kind, detail: null,
  basis: { source: "action-producers", detail: "stubbed as its requirement keys it" },
  age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: "alice", assignee_role: null,
  options: a.optionsOf([subject]) })) }) } });

function withPlans(list = Object.values(ITEMS)) {
  const w = world(stub(list));
  w.member("alice"); w.member("bob");
  w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice"); w.join("PRJ-1", "bob");
  for (const id of ["PLN-1", "PLN-2"]) { w.bundle(id); w.cite("PRJ-1", id); }
  return w;
}

test("R1: watch-keep-or-stop, plan-review-due and plan-look-again are OBLIGATIONs and member-left-items a FINDING, each with its sentence; the moved kinds keep theirs", () => {
  const SAYS = {
    "watch-keep-or-stop": [QUEUE_OBLIGATION_KINDS, /a plan that set a watch running has closed, or every promise it watched is met: keep the watch until a date, or stop it/],
    "plan-review-due": [QUEUE_OBLIGATION_KINDS, /a review day your group set for a plan has come; record a review/],
    "plan-look-again": [QUEUE_OBLIGATION_KINDS, /a paused plan's look-again date has come; look again, resume it .* or close it/],
    "member-left-items": [QUEUE_FINDING_KINDS, /a member who left had items of this project routed to them; take up the ones you choose/],
  };
  for (const [k, [vocab, says]] of Object.entries(SAYS)) {
    assert.equal(classOfKind(k), vocab === QUEUE_FINDING_KINDS ? "FINDING" : "OBLIGATION", k);
    assert.match(vocab[k], says, k);
    assert.match(vocab[k], /LIVE: action-producers R(9|10|12)\b/, `${k} names its producer`);
  }
  // the litigation hold's sentence reaches a docket entry's legal mark and a legal pressure record (action-producers R5)
  assert.match(QUEUE_OBLIGATION_KINDS["litigation-hold"], /a legal mark on a docket entry, or a legal pressure record, asks the same/);
  // the kinds moved to action-producers keep their classes, and each sentence names its producer there
  const MOVED = { "action-clock-overdue": ["CONDITION", "R1"], "plan-checkpoint-due": ["OBLIGATION", "R2"],
                  "escalation-stage-proposed": ["OBLIGATION", "R3"], "action-reminder": ["OBLIGATION", "R4"],
                  "litigation-hold": ["OBLIGATION", "R5"], "template-review-requested": ["OBLIGATION", "R6"],
                  "local-fact-due": ["OBLIGATION", "R7"], "litigation-hold-released": ["FINDING", "R8"] };
  const all = { ...QUEUE_OBLIGATION_KINDS, ...QUEUE_FINDING_KINDS, ...QUEUE_CONDITION_KINDS };
  for (const [k, [cls, r]] of Object.entries(MOVED)) {
    assert.equal(classOfKind(k), cls, k);
    assert.match(all[k], new RegExp(`LIVE: action-producers ${r}\\b`), k);
    assert.doesNotMatch(all[k], /LIVE: queue-producers/, k);
  }
  // negative control: near-misses of the new kinds are outside the vocabulary
  for (const v of ["watch-keep", "watch-keep-or-stop ", "WATCH-KEEP-OR-STOP", "plan-review", "plan-reviews-due",
                   "plan_look_again", "plan-look", "member-left", "member-left-item", "OBLIGATION::plan-review-due",
                   "FINDING::member-left-items"])
    assert.equal(classOfKind(v), null, v);
});

test("R1, R11, R12: the three to-dos pass the mint, each naming its own door, never taskresolve; member-left-items is quieted, not disposed", () => {
  const w = withPlans();
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const items = byId(f);
  for (const k of OBLIGATIONS) {
    const { id, door, says } = ITEMS[k];
    const d = items[id].disposition;
    assert.deepEqual([items[id].class, d.available, d.op, d.scope, d.key, d.reason, d.instead],
      ["OBLIGATION", false, null, null, null, "an_obligation_is_resolved_not_disposed", door], id);
    assert.match(d.detail, says, id);
    assert.deepEqual(items[id].case.ancestors.map((a) => a.id), ["PRJ-1"], "homed by R7's walk");
  }
  const left = items[ITEMS.left.id];
  assert.deepEqual(left.case.ancestors.map((a) => a.id), ["PRJ-1"], "homed under its project, yet no set-aside");
  assert.deepEqual([left.class, left.disposition.available, left.disposition.op, left.disposition.scope, left.disposition.key,
                    left.disposition.instead, left.disposition.reason],
    ["FINDING", false, null, null, null, "queuemute", "a_departure_is_taken_up_not_disposed"]);
  assert.equal(left.disposition.requires, undefined, "it asks for no project and no finding");
  assert.match(left.disposition.detail, /take up the items you choose .* quiet it for yourself \(op=queuemute, naming this item\)/);
  assert.equal(f.counts.obligation, 3);
  assert.equal(f.counts.finding, 1);
  // negative control: a kind the catalogue does not name is refused whole; a new kind minted in another class is misclassed
  for (const [it, reason] of [[{ ...ITEMS.watch, id: "OBLIGATION::watch-keep::LNK-1", kind: "watch-keep" }, "NO_SUCH_KIND"],
                              [{ ...ITEMS.review, class: "FINDING", id: "FINDING::plan-review-due::PLN-1" }, "KIND_MISCLASSED"],
                              [{ ...ITEMS.left, class: "CONDITION", id: "CONDITION::member-left-items::PRJ-1" }, "KIND_MISCLASSED"]]) {
    const r = withPlans([it]).feed("alice");
    assert.deepEqual([r.ok, r.reason, r.id], [false, reason, it.id], it.id);
  }
});

test("R12, R19, R26, R31: watch-keep-or-stop, plan-review-due and plan-look-again muted are refused KIND_NOT_PERSONAL, by kind and by id, and no row suppresses them", () => {
  const w = withPlans();
  for (const k of OBLIGATIONS) {
    const { id, kind } = ITEMS[k];
    for (const r of [w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: [kind] }),
                     w.q.queueMute({ member: "alice", viewer: "member:alice", item: id })])
      assert.deepEqual([r.ok, r.reason, r.kind_class, r.check, r.translation],
        [false, "KIND_NOT_PERSONAL", "OBLIGATION", "C-33.27", QUEUE_ACT_CHECKS.KIND_NOT_PERSONAL.translation], id);
    w.run(`INSERT INTO queue_item_mutes VALUES ('alice', ?, 'OBLIGATION', ?)`, id, iso(NOW));
  }
  assert.equal(w.all(`SELECT count(*) c FROM queue_state`)[0].c, 0, "a refusal writes nothing");
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('alice','PRJ-1','plan-look-again,plan-review-due,watch-keep-or-stop')`);
  const f = w.feed("alice");
  assert.equal(f.counts.obligation, 3, "rows naming them suppress none");
  assert.ok(f.mute.suppressed.every((s) => s.class !== "OBLIGATION"));
  const refused = w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: [] });
  for (const k of OBLIGATIONS) assert.ok(!refused.available.includes(ITEMS[k].kind), ITEMS[k].kind);
  assert.ok(refused.available.includes("member-left-items"), "the FINDING is among the kinds a member may quiet");
});

test("R12, R28: the bridge refuses each to-do CLASS_NOT_DISPOSED naming the door its item names; member-left-items is a noticed item with no project scope", () => {
  const w = withPlans();
  const items = byId(w.feed("alice"));
  const pd = (key) => w.q.proposeDispose({ key, to: "deferred", reason: "r", decidedBy: "alice", viewer: "member:alice",
                                          identity: "member:alice" });
  for (const k of OBLIGATIONS) {
    const { id, kind } = ITEMS[k];
    const door = items[id].disposition.instead;
    for (const key of [id, id.replace(/^OBLIGATION::/, "")]) {
      const r = pd(key);
      assert.deepEqual([r.ok, r.reason, r.class, r.kind, r.instead, r.check, r.translation],
        [false, "CLASS_NOT_DISPOSED", "OBLIGATION", kind, door, "C-33.44", QUEUE_ACT_CHECKS.CLASS_NOT_DISPOSED.translation], key);
    }
  }
  const r = pd(ITEMS.left.id);
  assert.deepEqual([r.ok, r.reason, r.kind], [false, "NO_PROJECT_SCOPE", "member-left-items"]);
  assert.equal(w.all(`SELECT count(*) c FROM finding_dispositions`)[0].c, 0, "nothing written");
});

test("R12, R14, R20, R30: member-left-items is quieted by its recipient, by its id or by kind on its case; another owner still sees it", () => {
  const w = withPlans([ITEMS.left]);
  const byItem = w.q.queueMute({ member: "alice", viewer: "member:alice", item: ITEMS.left.id });
  assert.deepEqual([byItem.ok, byItem.form, byItem.item_class, byItem.wrote.queue_item_mutes, byItem.wrote.tasks],
    [true, "item", "FINDING", 1, 0]);
  let f = w.feed("alice");
  assert.equal(byId(f)[ITEMS.left.id], undefined);
  assert.deepEqual(f.mute.suppressed.map((s) => [s.id, s.scope]), [[ITEMS.left.id, "item"]]);
  assert.ok(byId(w.feed("bob"))[ITEMS.left.id], "a mute is personal");
  w.q.queueMute({ member: "alice", viewer: "member:alice", item: ITEMS.left.id, unmute: true });
  const byKind = w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: ["member-left-items"] });
  assert.deepEqual([byKind.ok, byKind.muted_kinds], [true, ["member-left-items"]]);
  f = w.feed("alice");
  assert.deepEqual(f.mute.suppressed.map((s) => [s.id, s.scope, s.case]), [[ITEMS.left.id, "case", "PRJ-1"]]);
  assert.ok(byId(w.feed("bob"))[ITEMS.left.id], "still on another owner's feed");
});
