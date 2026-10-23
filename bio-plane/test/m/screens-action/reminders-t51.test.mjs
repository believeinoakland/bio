/* screens-action, fix round 3 (T51; C53): a reminder the member sets is the record's, not the page's. The action page reads an action's
   reminders by `op=remindersfor` (action-clocks R26) on load and again after each `reminderset`, so a reload draws them; the plan draws
   "Remind me" on a chosen option and the day it holds (R1, R44 (c)). Every sentence is asserted by its key (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, press, last, ok, W, D, DATA_PLANE, ROUTES, ACTION_ID } from "./page.mjs";

const mark = (p, i) => main(p).querySelector(`[data-reminder="${i}"]`);
const stateful = (seed = []) => {
  const held = [...seed];
  return { held, plane: { ...DATA_PLANE,
    reminderset: (req) => { held.push({ entry: req.body.entry, on: req.body.on, set_by: "mai", set_at: "2026-10-09T10:00:00Z", answered_at: null, state: "waiting" }); return ok({ ok: true }); },
    remindersfor: () => ok({ ok: true, action: ACTION_ID, as_of: "2026-10-09", reminders: held, limit: 500, truncated: false, standing_max: 50 }) } };
};

test("R5, R52 (C53): the reminder set on an entry is read from the record: drawn after the act, and again after a reload; control: an entry with none draws none, and a reminder already answered is not announced", async () => {
  const { plane } = stateful();
  const p = await open(ROUTES.action, plane);
  assert.equal(p.byOp("remindersfor").length, 1, "read on load");
  assert.deepEqual(p.byOp("remindersfor")[0].query, { op: "remindersfor", action: ACTION_ID });
  assert.equal(main(p).querySelector("[data-reminder]"), null, "none held: none drawn");
  await press(p, "reminderset", { nth: 1, values: { "remind-1": "2099-10-20" } });
  assert.deepEqual(last(p, "reminderset").body, { target: ACTION_ID, entry: 1, on: "2099-10-20" });
  assert.equal(p.byOp("remindersfor").length, 2, "read again after the act");
  assert.ok(mark(p, 1).textContent.includes(W("screen.reminder.on", { date: D("2099-10-20") })));
  assert.equal(mark(p, 0), null, "only the entry it was set on");
  // a reload: a fresh page over the same record draws it with nothing pressed
  const again = await open(ROUTES.action, plane);
  assert.equal(again.byOp("reminderset").length, 0);
  assert.ok(mark(again, 1).textContent.includes(W("screen.reminder.on", { date: D("2099-10-20") })), "the reminder survives a reload");
  // control: one already answered is not announced
  const answered = await open(ROUTES.action, { ...DATA_PLANE, remindersfor: () => ok({ ok: true, action: ACTION_ID, reminders: [{ entry: 1, on: "2026-10-01", set_by: "mai", set_at: "2026-09-30T10:00:00Z", answered_at: "2026-10-01T09:00:00Z", state: "answered" }] }) });
  assert.equal(main(answered).querySelector("[data-reminder]"), null);
});

test("R5, R52 (C53): a reminder read that fails is drawn as failed, not as none; the act re-reads only the reminders", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, remindersfor: { status: 502, text: "boom" } });
  const dates = main(p).querySelectorAll("section").find((x) => x.querySelector("h2") && x.querySelector("h2").textContent.includes(W("screen.action.dates")));
  assert.ok(dates && dates.querySelector('[data-state="failed"]'), "failed, never silently none");
  const { plane } = stateful();
  const q = await open(ROUTES.action, plane);
  const reads = ["action", "filingsfor", "pressurefor", "templatesforaction"].map((op) => q.byOp(op).length);
  await press(q, "reminderset", { nth: 1, values: { "remind-1": "2099-10-20" } });
  assert.deepEqual(["action", "filingsfor", "pressurefor", "templatesforaction"].map((op) => q.byOp(op).length), reads, "no other read is sent again");
});
