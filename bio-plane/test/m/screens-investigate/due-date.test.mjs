/* screens-investigate R7: how a due date was worked out, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, ACT } from "./fixtures.mjs";

const at = "/app/due-date/" + ACT;

test("R7 reads the action's clock entry (action) and its standing proposals (clockproposals); draws its basis, the day received, the days counted, each day skipped with its source, and when it falls due, in the action's zone", async () => {
  const p = await open(at);
  assert.equal(p.byOp("action")[0].query.id, ACT);
  assert.equal(p.byOp("clockproposals")[0].query.action, ACT);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Due 14 October 2026");
  const how = m.querySelector(`[data-proposal="pra_10day@member:mai"]`);
  const steps = how.querySelectorAll("li").map((l) => l.textContent);
  assert.deepEqual(steps, ["Basis: Gov. Code §7922.535(a) (profile basis: the 10-day window)", "Received by the office: 2 October 2026.", "Counted 10 days (calendar days).",
    "12 October 2026 skipped: Indigenous Peoples' Day (office calendar) (from the group's profile).", "Falls due 14 October 2026, America/Los_Angeles."]);
});

test("R7 clockpropose \"Work it out again\" is a proposal (never the date); clockadopt only on a standing proposal, naming it; reminderset", async () => {
  const p = await open(at, { plane: { clockpropose: ok({ ok: true }), clockadopt: ok({ ok: true }), reminderset: ok({ ok: true }) } });
  await press(p, "clockpropose");
  assert.deepEqual(p.byOp("clockpropose")[0].body, { target: ACT, rule: "pra_10day" });
  fill(p, { "dd-why": "the clerk received it on the 2nd" });
  await press(p, "clockadopt");
  assert.deepEqual(p.byOp("clockadopt")[0].body, { target: ACT, proposal: "pra_10day@member:mai", why: "the clerk received it on the 2nd" });
  fill(p, { "dd-entry": "0", "dd-on": "2026-10-12" });
  await press(p, "reminderset");
  assert.deepEqual(p.byOp("reminderset")[0].body, { target: ACT, entry: 0, on: "2026-10-12" });
});

test("R7 with no standing proposal nothing can be confirmed (control: clockadopt is not drawn)", async () => {
  const p = await open(at, { plane: { clockproposals: ok({ ok: true, action: ACT, proposals: [] }) } });
  assert.equal(button(p, "clockadopt"), null);
  assert.deepEqual(actsIn(main(p)).sort(), ["clockpropose", "reminderset"]);
});

test("R7 \"Download to my calendar\" saves clocksics' calendar for the action (cs.save, K3145); with nothing dated it is not offered", async () => {
  const p = await open(at);
  assert.equal(p.byOp("clocksics")[0].query.actions, ACT);
  const save = main(p).querySelector('[data-shell="save"]');
  assert.ok(save);
  assert.equal(save.textContent, "Download to my calendar");
  assert.equal(save.getAttribute("data-name"), "deadlines.ics");
  const q = await open(at, { plane: { clocksics: ok({ ok: true, filename: "deadlines.ics", ics: "", events: 0 }) } });
  assert.equal(main(q).querySelector('[data-shell="save"]'), null);
  assert.match(main(q).textContent, /No confirmed due date to put in a calendar yet/);
});

test("R7 a refused proposal is drawn beside the act (control)", async () => {
  const p = await open(at, { plane: { clockpropose: refusedIn("NO_SUCH_RULE", "No such rule for this action.") } });
  await press(p, "clockpropose");
  assert.match(main(p).textContent, /No such rule for this action\./);
});

test("R7 the subject `<action>~<entry position>` (screens-action's links, K3149) reads the action and opens at that entry; the action alone still opens (control)", async () => {
  const two = { ...(await import("./fixtures.mjs")).ACTION, clock: [{ text: "a", description: "The acknowledgement", date: "2026-10-05", basis: "x", status: "met" },
    { text: "b", description: "The City Clerk's reply", date: "2026-10-14", basis: "y", status: "pending" }] };
  const p = await open(at + "~1", { plane: { action: ok(two), reminderset: ok({ ok: true }) } });
  assert.equal(p.byOp("action")[0].query.id, ACT);
  assert.equal(p.byOp("clockproposals")[0].query.action, ACT);
  assert.equal(main(p).querySelector("h1").textContent, "Due 14 October 2026");
  assert.match(main(p).querySelector('[aria-current="true"]').textContent, /The City Clerk's reply/);
  fill(p, { "dd-on": "2026-10-12" });
  await press(p, "reminderset");
  assert.deepEqual(p.byOp("reminderset")[0].body, { target: ACT, entry: 1, on: "2026-10-12" });
  const q = await open(at + "~0", { plane: { action: ok(two) } });
  assert.equal(main(q).querySelector("h1").textContent, "Due 5 October 2026");
});
