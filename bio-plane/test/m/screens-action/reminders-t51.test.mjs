/* screens-action, fix round 3 (T51; C53): a reminder the member sets is the record's, not the page's. The action page reads an action's
   reminders by `op=remindersfor` (action-clocks R26) on load and again after each `reminderset`, so a reload draws them; the plan draws
   "Remind me" on a chosen option and the day it holds (R1, R44 (c)). Every sentence is asserted by its key (R19). Over `store-request`'s world:
   the reminder is a real `reminderset` and the page reads it back from the record. */
import test from "node:test";
import assert from "node:assert/strict";
import { clockWorld, openIn } from "./world-B.mjs";
import { main, press, last, W, D } from "./page.mjs";

const mark = (p, i) => main(p).querySelector(`[data-reminder="${i}"]`);
const at = (action) => `/app/action/${action}`;

test("R5, R52 (C53): the reminder set on an entry is read from the record: drawn after the act, and again after a reload; control: an entry with none draws none, and a reminder already answered is not announced", async () => {
  const { world, me, action } = await clockWorld();
  const p = await openIn(world, me, at(action));
  assert.equal(p.byOp("remindersfor").length, 1, "read on load");
  assert.deepEqual(p.byOp("remindersfor")[0].query, { op: "remindersfor", action });
  assert.equal(main(p).querySelector("[data-reminder]"), null, "none held: none drawn");
  await press(p, "reminderset", { nth: 1, values: { "remind-1": "2099-10-20" } });
  assert.deepEqual(last(p, "reminderset").body, { target: action, entry: 1, on: "2099-10-20" });
  assert.equal(p.byOp("remindersfor").length, 2, "read again after the act");
  assert.ok(mark(p, 1).textContent.includes(W("screen.reminder.on", { date: D("2099-10-20") })));
  assert.equal(mark(p, 0), null, "only the entry it was set on");
  // the record holds it: what the page drew is what the world answers
  assert.deepEqual((await me.read("remindersfor", { query: { action } })).reminders.map((r) => [r.entry, r.on]), [[1, "2099-10-20"]]);
  // a reload: a fresh page over the same record draws it with nothing pressed
  const again = await openIn(world, me, at(action));
  assert.equal(again.byOp("reminderset").length, 0);
  assert.ok(mark(again, 1).textContent.includes(W("screen.reminder.on", { date: D("2099-10-20") })), "the reminder survives a reload");
  // control: one already answered is not announced (a reminder on a day that has come, answered by its member)
  const { world: w2, me: m2, action: a2 } = await clockWorld({ handle: "mai" });
  await m2.act("reminderset", { body: { target: a2, entry: 0, on: "2026-10-01" } });
  await m2.act("reminderanswer", { body: { target: a2, entry: 0 } });
  assert.equal((await m2.read("remindersfor", { query: { action: a2 } })).reminders[0].state, "answered", "the record holds it answered");
  const answered = await openIn(w2, m2, at(a2));
  assert.equal(main(answered).querySelector("[data-reminder]"), null);
});

test("R5, R52 (C53): a reminder read that fails is drawn as failed, not as none; the act re-reads only the reminders", async () => {
  const { world, me, action } = await clockWorld();
  const p = await openIn(world, me, at(action), { remindersfor: { status: 502, text: "boom" } });
  const dates = main(p).querySelectorAll("section").find((x) => x.querySelector("h2") && x.querySelector("h2").textContent.includes(W("screen.action.dates")));
  assert.ok(dates && dates.querySelector('[data-state="failed"]'), "failed, never silently none");
  const q = await openIn(world, me, at(action));
  const reads = ["action", "filingsfor", "pressurefor", "templatesforaction"].map((op) => q.byOp(op).length);
  await press(q, "reminderset", { nth: 1, values: { "remind-1": "2099-10-20" } });
  assert.deepEqual(["action", "filingsfor", "pressurefor", "templatesforaction"].map((op) => q.byOp(op).length), reads, "no other read is sent again");
});
