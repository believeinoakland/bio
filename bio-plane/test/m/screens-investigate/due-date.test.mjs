/* screens-investigate R7: how a due date was worked out, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, ACT, ACTION, word, drew, dayOf } from "./fixtures.mjs";

const at = "/app/due-date/" + ACT;

test("R7 reads the action's clock entry (action) and its standing proposals (clockproposals); draws its basis, the day received, the days counted, each day skipped with its source, and when it falls due, in the action's zone", async () => {
  const p = await open(at);
  assert.equal(p.byOp("action")[0].query.id, ACT);
  assert.equal(p.byOp("clockproposals")[0].query.action, ACT);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, word("screen.due-date.due", { date: dayOf("2026-10-14") }));
  drew(m, "screen.due-date.of", { who: "City Clerk, City Council" });
  const how = m.querySelector(`[data-proposal="pra_10day@member:mai"]`);
  const steps = how.querySelectorAll("li").map((l) => l.textContent);
  assert.deepEqual(steps, [word("screen.due-date.step.basis", { basis: "Gov. Code §7922.535(a) (profile basis: the 10-day window)" }),
    word("screen.due-date.step.received.receipt", { date: dayOf("2026-10-02") }), word("screen.due-date.step.counted", { amount: "10", units: "days" }),
    word("screen.due-date.step.skipped", { date: dayOf("2026-10-12"), why: "Indigenous Peoples' Day (office calendar)", source: "the team's profile" }),
    word("screen.due-date.step.due", { date: dayOf("2026-10-14"), zone: "America/Los_Angeles" })]);
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
  const save = main(p).querySelectorAll("button").find((b) => b.textContent === word("screen.due-date.download"));
  assert.ok(save, "the kit's own save control (interface-shell R47)");
  await p.click(save);
  assert.deepEqual(p.files.map((f) => f.name), ["deadlines.ics"], "the calendar handed to the browser as a file");
  const q = await open(at, { plane: { clocksics: ok({ ok: true, filename: "deadlines.ics", ics: "", events: 0 }) } });
  assert.equal(main(q).querySelectorAll("button").find((b) => b.textContent === word("screen.due-date.download")), undefined);
  assert.ok(!main(q).textContent.includes(word("screen.due-date.download")), "R22: nothing to put in a calendar, nothing offered");
});

test("R7 a refused proposal is drawn beside the act (control)", async () => {
  const p = await open(at, { plane: { clockpropose: refusedIn("NO_SUCH_RULE", "No such rule for this action.") } });
  await press(p, "clockpropose");
  assert.ok(main(p).textContent.includes(word("refusal.NO_SUCH_RULE")), "the refusal by its words");
});

test("R7 the subject `<action>~<entry position>` (screens-action's links, K3149) reads the action and opens at that entry; the action alone still opens (control)", async () => {
  const two = { ...(await import("./fixtures.mjs")).ACTION, clock: [{ text: "a", description: "The acknowledgement", date: "2026-10-05", basis: "x", status: "met" },
    { text: "b", description: "The City Clerk's reply", date: "2026-10-14", basis: "y", status: "pending" }] };
  const p = await open(at + "~1", { plane: { action: ok(two), reminderset: ok({ ok: true }) } });
  assert.equal(p.byOp("action")[0].query.id, ACT);
  assert.equal(p.byOp("clockproposals")[0].query.action, ACT);
  assert.equal(main(p).querySelector("h1").textContent, word("screen.due-date.due", { date: dayOf("2026-10-14") }));
  assert.ok(main(p).querySelector('[aria-current="true"]').textContent.includes("The City Clerk's reply"), "the entry the address names");
  fill(p, { "dd-on": "2026-10-12" });
  await press(p, "reminderset");
  assert.deepEqual(p.byOp("reminderset")[0].body, { target: ACT, entry: 1, on: "2026-10-12" });
  const q = await open(at + "~0", { plane: { action: ok(two) } });
  assert.equal(main(q).querySelector("h1").textContent, word("screen.due-date.due", { date: dayOf("2026-10-05") }));
});

/* R54 (T51; K4194 L21), R55 (L22) */
test("R54 after reminderset the entry shows the day the reminder was set for; control: a refused day shows its refusal and no reminder", async () => {
  const p = await open(at, { plane: { reminderset: (r) => ok({ ok: true, target: r.body.target, entry: r.body.entry, on: r.body.on, from: null }) } });
  assert.equal(main(p).querySelectorAll("[data-reminder]").length, 0, "none before");
  fill(p, { "dd-entry": "0", "dd-on": "2026-10-12" });
  await press(p, "reminderset");
  const shown = main(p).querySelectorAll("[data-reminder]");
  assert.equal(shown.length, 1);
  assert.equal(shown[0].textContent, word("screen.due-date.on") + " " + dayOf("2026-10-12").replace(/, 2026$/, "") + ", 2026");
  assert.ok(main(p).querySelector('[data-reminder="0"]').closest("div"), "beside its entry");
  const bad = await open(at, { plane: { reminderset: refusedIn("REMINDER_REFUSED", "Not a day.") } });
  fill(bad, { "dd-entry": "0", "dd-on": "2026-10-12" });
  await press(bad, "reminderset");
  assert.equal(main(bad).querySelectorAll("[data-reminder]").length, 0);
  assert.ok(main(bad).textContent.includes(word("refusal.REMINDER_REFUSED")) || main(bad).textContent.includes("Not a day."), "the refusal beside the act");
});

test("R55 the head names the counterparty from whatever keys it holds: an addressee's role and body, a described audience's description; none for one not yet determined", async () => {
  const head = async (counterparty) => {
    const p = await open(at, { plane: { action: ok({ ...ACTION, counterparty }) } });
    return main(p);
  };
  drew(await head({ role: "City Clerk", body: "City Council" }), "screen.due-date.of", { who: "City Clerk, City Council" });
  drew(await head({ state: "audience", description: "the Public Works front desk" }), "screen.due-date.of", { who: "the Public Works front desk" });
  drew(await head({ name: "Office of the City Attorney", kind: "office" }), "screen.due-date.of", { who: "Office of the City Attorney" });
  const none = await head({ state: "undetermined", basis: "no one has answered yet" });
  assert.equal(none.querySelector(".mk-sub"), null, "no sentence");
  assert.ok(!none.textContent.includes("no one has answered yet"), "the basis is not a name");
});

/* R59 (T51; DEC-384 E6) */
test("R59 the refusal that no rule states a deadline draws the deadlines its answer carries to pick from, the help and the door to the rules; choosing one sends the owner's declared fields; control: a due date that is found draws none", async () => {
  const deadlines = [{ rule: "pra_10day", label: "10 calendar days", citation: "Gov. Code §7922.535" }, { rule: "idr_3day", label: "3 business days", citation: "Immediate Disclosure Request" }];
  const noRule = (r) => (r.body && r.body.rule === "idr_3day" ? ok({ ok: true, target: ACT, key: "idr_3day@member:mai" })
    : { status: 200, json: { ok: true, result: { ok: false, reason: "NO_SUCH_RULE", code: "NO_SUCH_RULE", deadlines } } });
  const p = await open(at, { plane: { proposals: undefined, clockproposals: ok({ ok: true, action: ACT, proposals: [] }), clockpropose: noRule, action: ok({ ...ACTION, kind: "records_request" }) } });
  assert.equal(main(p).querySelector("[data-rules]"), null, "nothing before the refusal");
  await press(p, "clockpropose");
  drew(main(p), "refusal.NO_SUCH_RULE");
  const box = main(p).querySelector("[data-rules]");
  assert.ok(box, "the pick box is drawn beside the refusal");
  drew(box, "screen.due-date.rule.summary");
  drew(box, "screen.due-date.rule.help");
  assert.deepEqual(p.doc.getElementById("dd-rule").querySelectorAll("option").map((o) => o.getAttribute("value")), ["pra_10day", "idr_3day"]);
  assert.equal(box.querySelector('a[href="/app/places"]').textContent, word("screen.due-date.rule.go"), "the door to the rules");
  fill(p, { "dd-rule": "idr_3day" });
  await press(p, "clockpropose", { within: box });
  const sent = p.byOp("clockpropose");
  assert.deepEqual(sent[sent.length - 1].body, { target: ACT, rule: "idr_3day" }, "the owner's declared fields (the guard accepts them)");
  const found = await open(at);
  assert.equal(found.doc.getElementById("dd-rule"), null, "control: a due date that is found draws none");
  assert.equal(main(found).querySelector("[data-rules]"), null);
});
