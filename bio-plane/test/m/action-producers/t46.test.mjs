/* T46 (T46-46; N924, N926, N913; DEC-194; K2880, K2960): what this tranche adds, at actionItems' interface. R21, the door
   stating a clock entry met or waived (actions' revision, `op=promote`); R22, an entry a duty's Noticed item stood for,
   drawn once that duty's watch has ended (`following.dutyWatchEnd`); R23, the items' sentences and the doors' labels read
   by key from `words.json` (`./words.mjs`), with the sentences R23 keeps named. Each test names its ids and carries a
   control (K874). Providers are fakes in their requirements' shapes; membership is real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso, page, ofKind, DAY, day, planAnswer } from "./world.mjs";
import { WORD, FILLED } from "./words.mjs";
import { ACTION_KEYS, WORDS_CANON, KEPT } from "../../../src/action-producers/index.mjs";
import { word, localize, hasWord } from "../../../src/setup-words/index.mjs";

function people(fakes) {
  const w = world(fakes);
  w.member("ada", { role: "admin" }); w.member("alice"); w.member("bob"); w.member("olga");
  for (const p of ["PRJ-1", "PRJ-H"]) w.bundle(p, "project");
  for (const a of ["ACT-1", "ACT-2"]) w.bundle(a, "action");
  w.join("PRJ-1", "olga", { owner: true }); w.join("PRJ-1", "alice"); w.join("PRJ-1", "bob");
  return w;
}
const entry = (x = {}) => ({ action: "ACT-1", ord: 0, date: day(NOW - 3 * DAY), basis: "the records act", text: "response due",
  status: "pending", past: true, project: "PRJ-1", created_by: "alice", owed_by: "body", basis_of: { kind: "rule", citation: "c" },
  steps: [], local_day: day(NOW), zone: "UTC", ...x });
const K = "CONDITION::action-clock-overdue::ACT-1::0";

test("R21, R11: R1's item offers actioncorrespond, then the met-or-waived door (the action's revision, op=promote, keyed to the action and the entry, changing only its status to met or waived, labelled door.clockentrystate), then take-up; an entry stated met leaves", () => {
  let entries = [entry()];
  const w = people({ actionClocks: { overdueClocks: () => page(entries) } });
  const it = byId(w.read("alice"))[K];
  assert.deepEqual(it.options.map((o) => o.id), ["actioncorrespond", "promote", "itemtakeup", "opt"]);
  const door = it.options[1];
  assert.deepEqual(door, { id: "promote", label: WORD("door.clockentrystate"), weight: "single",
    revision: { action: "ACT-1", entry: 0, field: "status", to: ["met", "waived"] } }, "the door is the action's revision of that entry's status");
  assert.equal(door.label, word("door.clockentrystate"));
  /* the door keys each item to its own entry */
  entries = [entry(), entry({ ord: 4 })];
  assert.deepEqual(byId(w.read("alice"))["CONDITION::action-clock-overdue::ACT-1::4"].options[1].revision,
    { action: "ACT-1", entry: 4, field: "status", to: ["met", "waived"] });
  /* taking it states the entry met: action-clocks R3 no longer answers it, so the item leaves */
  entries = [entry({ ord: 4 })];
  assert.equal(byId(w.read("alice"))[K], undefined, "the entry stated met is no longer an item");
  /* control: no other kind offers it (it is R1's alone) */
  const v = people({ actionClocks: { remindersDue: () => page([{ action: "ACT-1", ord: 0, date: day(NOW + DAY), basis: "b", text: "t",
    on: day(NOW), set_by: "alice", project: "PRJ-1" }]) } });
  assert.ok(v.read("alice").items.every((i) => !i.options.some((o) => o.id === "promote")));
});

test("R22: an entry carrying noticed_by raises R1's item once its duty's watch has ended (dutyWatchEnd a day before the read's local day), with R1's recipients, key, words and age; while it answers null, today, or throws, none (one fact, one item)", () => {
  let end = null;
  const asked = [];
  const noticed = { duty: "DUT-2026-0001", occurrence: "o1" };
  const w = people({ actionClocks: { overdueClocks: () => page([entry({ noticed_by: noticed })]) },
    following: { dutyWatchEnd: (d) => { asked.push(d); if (end === "throw") throw new Error("boom"); return end; } } });
  assert.equal(byId(w.read("alice"))[K], undefined, "control: the duty's links unanswered (null): the Noticed item stands for it");
  end = day(NOW - DAY);
  const r = w.read("alice");
  const it = byId(r)[K];
  assert.ok(it, "the watch was stopped yesterday: R1's item is drawn");
  assert.deepEqual(asked.at(-1), "DUT-2026-0001", "following is asked of the entry's duty");
  assert.deepEqual(it.recipients, ["alice"]); assert.equal(it.basis.recipients_rule, "author");
  assert.equal(it.summary, localize("action-producers.words.noreply_canon", "Noticed: no reply recorded by {date}", { date: "August 29" }));
  assert.deepEqual(it.age, { state: "determined", since: `${day(NOW - 2 * DAY)}T00:00:00Z`, ms: 2 * DAY, days: 2 });
  assert.deepEqual(it.basis.noticed_by, noticed); assert.equal(it.basis.duty_watch_end, day(NOW - DAY));
  assert.deepEqual(ids(w.read("olga")), [], "R1's recipients, nobody else");
  /* the watch ends today, or later: not yet passed */
  for (const d of [day(NOW), day(NOW + 5 * DAY)]) { end = d; assert.equal(byId(w.read("alice"))[K], undefined, d); }
  end = "throw";
  assert.equal(byId(w.read("alice"))[K], undefined, "a following that throws draws nothing");
  assert.deepEqual(w.read("alice").facts.failed, [], "and fails no producer");
  end = "not a day";
  assert.equal(byId(w.read("alice"))[K], undefined, "an answer that is no day is no end");
  /* the day is the read's local day in the action's zone: Tokyo is already 2026-09-01 09:00 at the read */
  end = "2026-08-31";
  const t = people({ actionClocks: { overdueClocks: () => page([entry({ noticed_by: noticed, zone: "Asia/Tokyo" })]) },
    following: { dutyWatchEnd: () => end } });
  assert.ok(byId(t.read("alice"))[K], "in Tokyo 2026-08-31 has passed");
  const la = people({ actionClocks: { overdueClocks: () => page([entry({ noticed_by: noticed, zone: "America/Los_Angeles" })]) },
    following: { dutyWatchEnd: () => end } });
  assert.equal(byId(la.read("alice"))[K], undefined, "in Los Angeles it is still 2026-08-31: not passed");
});
const ids = (r) => ofKind(r, "action-clock-overdue").map((i) => i.id).sort();

test("R22, R9: a departed creator's entry a duty's Noticed item stands for is named only once that duty's watch has ended", () => {
  let end = null;
  const w = people({ actionClocks: { overdueClocks: () => page([entry({ noticed_by: { duty: "DUT-1" } })]),
                                      pendingClocks: () => page([{ action: "ACT-1", ord: 0, date: day(NOW - 3 * DAY), basis: "b", text: "t", past: true }]) },
                     following: { dutyWatchEnd: () => end } });
  w.run(`UPDATE members SET status='revoked' WHERE member_id='alice'`);
  assert.deepEqual(ofKind(w.read("olga"), "member-left-items"), [], "control: the duty's item stands for it, so nothing names it");
  end = day(NOW - DAY);
  const it = ofKind(w.read("olga"), "member-left-items")[0];
  assert.deepEqual(it.subject.items.map((x) => [x.kind, x.subject, x.entry]), [["clock", "ACT-1", 0]]);
  assert.deepEqual(ids(w.read("olga")), [K], "and R1's item goes to the owner");
});

/* A world raising every keyed kind, all to alice (an administrator, so the docket arm reaches her). */
function keyed() {
  const w = people({
    actionClocks: { overdueClocks: () => page([entry({ action: "ACT-2", project: null, created_by: "bob" })]) },
    actionHolds: { holdsDue: () => page([{ arrived: { docket_entry: "CASE-1#4", case: "CASE-1" }, note: "n", marked_by: null,
      marked_at: iso(NOW), project: "PRJ-1" }]) },
    following: { watchQuestions: () => ({ ok: true, cursor: null, questions: [
      { link: 1, plan: "PLN-1", matters: [], watch: { kind: "follow", id: "F-1", ends: null }, due_at: iso(NOW), cause: "closed",
        relied_on: false, offered: ["keep", "stop"], recipients: ["alice"] },
      { link: 2, plan: "PLN-1", matters: [], watch: { kind: "address", id: "https://x.example/a", ends: "2026-12-31" }, due_at: iso(NOW),
        cause: "closed", relied_on: true, offered: [], recipients: ["alice"] }] }) },
    actionPlans: { planRead: ({ id }) => planAnswer(id, "PRJ-1"),
      plansToLookAgain: () => ({ ok: true, limit: 500, truncated: false, items: [
        { plan: "PLN-2", project: "PRJ-1", title: "Library hours", look_again: day(NOW), paused_by: "alice", paused_at: iso(NOW - DAY), reason: "r" }] }) },
    planWork: { takeUpsFor: () => ({ ok: true, items: [], truncated: false, cursor: null }),
      planReviewsDue: () => ({ ok: true, limit: 500, truncated: false, items: [
        { plan: "PLN-1", project: "PRJ-1", member: "alice", due: iso(NOW - 3600000), day: day(NOW - 3600000), zone: "UTC" }] }) } });
  w.run(`UPDATE members SET role='admin' WHERE member_id='alice'`);
  w.join("PRJ-1", "ada", { state: "invited" });
  w.run(`UPDATE members SET status='revoked' WHERE member_id='bob'`);
  return w;
}

test("R23: each item's sentence is its words.json key's words filled from the item's own facts, answered beside its key; the kept sentences answer no key", () => {
  const m = byId(keyed().read("alice"));
  /* R9: {member}, {n} and {items} of the items the recipient may see, {place} the group for items of no project */
  const left = m["FINDING::member-left-items::bob::none"];
  assert.equal(left.summary_key, "queue.member-left-items.summary");
  assert.equal(left.summary, FILLED("queue.member-left-items.summary", { member: "bob", n: 1 }));
  assert.equal(left.detail_key, "queue.member-left-items.detail");
  assert.equal(left.detail, FILLED("queue.member-left-items.detail", { member: "bob", place: "the team",
    items: `the clock entry 0 on ACT-2 (${day(NOW - 3 * DAY)})` }));
  /* R10: the summary on every entry; the detail by key where watchanswer is offered; the relied-on entry keeps its own */
  const kept = m["OBLIGATION::watch-keep-or-stop::1"];
  assert.equal(kept.summary, FILLED("queue.watch-keep-or-stop.summary", { what: "the follow F-1" }));
  assert.equal(kept.summary_key, "queue.watch-keep-or-stop.summary");
  assert.equal(kept.detail, FILLED("queue.watch-keep-or-stop.detail", { plan: "PLN-1" }));
  assert.equal(kept.detail_key, "queue.watch-keep-or-stop.detail");
  const relied = m["OBLIGATION::watch-keep-or-stop::2"];
  assert.equal(relied.summary, FILLED("queue.watch-keep-or-stop.summary", { what: "the address https://x.example/a" }));
  assert.equal("detail_key" in relied, false, "control: the relied-on entry's detail is not the key's");
  assert.notEqual(relied.detail, WORD("queue.watch-keep-or-stop.detail"));
  assert.match(relied.detail, /relied on elsewhere/);
  /* R12: the summaries by key; the details kept */
  const rv = m[`OBLIGATION::plan-review-due::PLN-1::${day(NOW - 3600000)}`];
  assert.equal(rv.summary, FILLED("queue.plan-review-due.summary", { plan: "PLN-1" })); assert.equal("detail_key" in rv, false);
  const lk = m[`OBLIGATION::plan-look-again::PLN-2::${day(NOW)}`];
  assert.equal(lk.summary, FILLED("queue.plan-look-again.summary", { plan: '"Library hours"' })); assert.equal("detail_key" in lk, false);
  /* R5's docket arm: the protected summary by key, its detail kept */
  const dk = m["OBLIGATION::litigation-hold::docket::CASE-1#4"];
  assert.equal(dk.summary, FILLED("queue.litigation-hold.docket.summary", { entry: "CASE-1#4" }));
  assert.equal(dk.summary_key, "queue.litigation-hold.docket.summary"); assert.equal("detail_key" in dk, false);
  assert.notEqual(dk.detail, WORD("queue.litigation-hold.docket.detail"));
});

test("R23, R11: each door's label is words.json's door.<op> where it holds one; actionholdrelease and factconfirm, which it does not, keep theirs", () => {
  const w = keyed();
  w.fakes.actionHolds.holdsDue = () => page([{ action: "ACT-1", ord: 3, note: "n", marked_by: "alice", marked_at: iso(NOW), project: "PRJ-1",
    arrived: { action: "ACT-1", ord: 3 } }]);
  w.fakes.actionClocks.overdueClocks = () => page([entry()]);
  w.fakes.actionClocks.remindersDue = () => page([{ action: "ACT-1", ord: 0, date: day(NOW + DAY), basis: "b", text: "t", on: day(NOW), set_by: "alice", project: "PRJ-1" }]);
  w.fakes.actionPlans.checkpointsDue = () => ({ ok: true, limit: 500, truncated: false, items: [
    { plan: "PLN-1", project: "PRJ-1", scenario: 1, version: 1, phase: "p", set_by: "alice", due: day(NOW - DAY) }] });
  w.fakes.escalation.escalationsDue = () => ({ ok: true, limit: 500, truncated: false, items: [
    { id: "ESC-1", project: "PRJ-1", opened_by: "alice", from: 1, to: 2, stage: "s", instant: iso(NOW), ids: [] }] });
  w.bundle("ESC-1", "escalation");
  const r = w.read("alice");
  const seen = new Map();
  for (const it of r.items) for (const o of it.options) if (o.id !== "opt") seen.set(o.id, o.label);
  const KEYED = { actioncorrespond: "door.actioncorrespond", promote: "door.clockentrystate", itemtakeup: "door.itemtakeup",
    checkpointrecord: "door.checkpointrecord", escalationadvance: "door.escalationadvance", escalationdecline: "door.escalationdecline",
    reminderanswer: "door.reminderanswer", actionhold: "door.actionhold", watchanswer: "door.watchanswer",
    planreviewrecord: "door.planreviewrecord", planresume: "door.planresume" };
  for (const [op, key] of Object.entries(KEYED)) {
    assert.ok(seen.has(op), `the world offers ${op}`);
    assert.equal(seen.get(op), WORD(key), `${op}: ${key}`);
  }
  assert.equal(seen.get("actionholdrelease"), word("action-producers.label.record_hold_needed"), "control: no door.actionholdrelease, its label stays");
  assert.throws(() => WORD("door.actionholdrelease"), /holds no word/);
  assert.throws(() => WORD("door.factconfirm"), /holds no word/);
});

test("R23: every sentence this module holds by key is words.json's en, verbatim, but canon's question R23 keeps unchanged; the kept sentences are named", () => {
  for (const key of ACTION_KEYS) assert.ok(hasWord(key), key);
  /* control: canon's question is words.json's key, its own words held apart, and the one key so held */
  const [canon] = WORDS_CANON;
  assert.ok(hasWord(canon), canon);
  assert.notEqual(localize("action-producers.words.noreply_canon", "Noticed: no reply recorded by {date}", { date: "August 29" }),
    word(canon, { date: "August 29" }));
  for (const k of ["queue.action-clock-overdue.theirs.detail", "queue.plan-look-again.detail", "queue.litigation-hold.docket.detail"]) {
    assert.ok(KEPT.includes(k), k);
    assert.equal(typeof WORD(k), "string", `${k} is words.json's, kept and returned to BOB`);
  }
});
