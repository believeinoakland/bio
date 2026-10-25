/* screens-investigate R7: how a due date was worked out, on interface-shell's served page over `store-request`'s world: the real store behind the page's door,
   a real sign-in. The action, its sent entry, its proposals and its clock are made by the member's own acts (`actioncreate`, `actioncorrespond`, `clockpropose`,
   `clockadopt`, `reminderset`); every value a test asserts is read back from the world's answers. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs, settled, rewrite, refused } from "./world.mjs";
import { main, actsIn, button, fill, press, word, drew, dayOf } from "./fixtures.mjs";

const REASON = "The clerk received it that day.";
const ROLE = "City Clerk", BODY = "City Council";
const OFFICE = [`  state: "named"`, `  role: "${ROLE}"`, `  body: "${BODY}"`];

/** A world with the Oakland profile active, one project, and a records request addressed by `counterparty` lines (an office by default). */
async function setUp({ counterparty = OFFICE } = {}) {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Rent schedules");
  const request = async (lines = counterparty) => (await me.act("actioncreate", { body: { document: ["---", "id: PENDING", "object_type: action", 'title: "The rent schedules"', "current_state: planned",
    'created: "2026-10-01T12:00:00Z"', 'last_updated: "2026-10-01T12:00:00Z"', "project: " + project, 'action_kind: "records_request"', "counterparty:", ...lines, "---", "", "The rent schedules.", ""].join("\n") } })).id;
  /* the day the team sent it, then a rule's date proposed from it (a proposal, never the date) */
  const sentOn = (id, day) => me.act("actioncorrespond", { query: { target: id, direction: "sent", at: day, account: "We asked for the rent schedules." } });
  const propose = async (id, rule) => { await me.act("clockpropose", { body: { target: id, rule } }); return (await me.read("clockproposals", { query: { action: id } })).proposals.find((x) => x.rule === rule); };
  const adopt = async (id, proposal) => me.act("clockadopt", { body: { target: id, proposal: proposal.key, why: REASON } });
  return { world, me, project, request, sentOn, propose, adopt };
}

test("R7 reads the action's clock entry (action) and its standing proposals (clockproposals); draws its basis, the day received, the days counted, each day skipped with its source, and when it falls due, in the action's zone", async () => {
  const { world, me, request, sentOn, propose, adopt } = await setUp();
  const id = await request();
  await sentOn(id, "2026-11-23");
  await adopt(id, await propose(id, "records_response"));
  const proposal = await propose(id, "immediate_disclosure");   /* a standing proposal beside the adopted entry */
  const p = await openAs(world, me, "/app/due-date/" + id);
  assert.equal(p.byOp("action")[0].query.id, id);
  assert.equal(p.byOp("clockproposals")[0].query.action, id);
  const held = (await me.read("action", { query: { id } })).clock;
  assert.equal(held.length, 1, "the adopted entry is on the action's clock");
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, word("screen.due-date.due", { date: dayOf(held[0].date) }));
  drew(m, "screen.due-date.of", { who: `${ROLE}, ${BODY}` });
  const how = m.querySelector(`[data-proposal="${proposal.key}"]`);
  assert.ok(how, "the standing proposal is drawn by its key");
  const t = proposal.trace;
  assert.ok(t.skipped.length > 0, "the request crosses Thanksgiving and a weekend: days are skipped");
  const steps = how.querySelectorAll("li").map((l) => l.textContent);
  assert.equal(steps.length, 3 + t.skipped.length + 1);
  assert.equal(steps[0], word("screen.due-date.step.basis", { basis: proposal.basis }));
  assert.equal(steps[1], word("screen.due-date.step.received.sent", { date: dayOf(t.anchor_day) }), "counted from the day the team sent it: no receipt is recorded");
  assert.equal(steps[2], word("screen.due-date.step.counted", { amount: String(t.amount), units: t.units }));
  t.skipped.forEach((s, i) => {
    assert.ok(steps[3 + i].includes(dayOf(s.day)), "the day skipped: " + s.day);
    assert.ok(steps[3 + i].includes(s.why), "and why: " + s.why);
  });
  assert.equal(steps[steps.length - 1], word("screen.due-date.step.due", { date: dayOf(proposal.date), zone: t.zone }));
  assert.equal(t.zone, "America/Los_Angeles", "in the zone of the team's profile");
});

test("R7 clockpropose \"Work it out again\" is a proposal (never the date); clockadopt only on a standing proposal, naming it; reminderset", async () => {
  const { world, me, request, sentOn, propose } = await setUp();
  const id = await request();
  await sentOn(id, "2026-10-02");
  const proposal = await propose(id, "records_response");
  const p = await openAs(world, me, "/app/due-date/" + id);
  await press(p, "clockpropose", { reason: REASON });
  assert.deepEqual(p.byOp("clockpropose")[0].body, { target: id, rule: proposal.rule });
  assert.deepEqual((await me.read("action", { query: { id } })).clock, [], "a proposal is never a clock entry");
  fill(p, { "dd-why": "the clerk received it on the 2nd" });
  await press(p, "clockadopt", { reason: REASON });
  assert.deepEqual(p.byOp("clockadopt")[0].body, { target: id, proposal: proposal.key, why: "the clerk received it on the 2nd" });
  const clock = (await me.read("action", { query: { id } })).clock;
  assert.equal(clock.length, 1, "now it is on the action's clock");
  assert.equal(clock[0].date, proposal.date);
  assert.equal(clock[0].adopted_why, "the clerk received it on the 2nd");
  fill(p, { "dd-entry": "0", "dd-on": "2026-10-09" });
  await press(p, "reminderset", { reason: REASON });
  assert.deepEqual(p.byOp("reminderset")[0].body, { target: id, entry: 0, on: "2026-10-09" });
  const reminders = await me.read("remindersfor", { query: { action: id } });
  assert.ok(JSON.stringify(reminders).includes("2026-10-09"), "the store holds the reminder on that day");
});

test("R7 with no standing proposal nothing can be confirmed (control: clockadopt is not drawn)", async () => {
  const { world, me, request, sentOn } = await setUp();
  const id = await request();
  await sentOn(id, "2026-10-02");
  assert.deepEqual((await me.read("clockproposals", { query: { action: id } })).proposals, [], "none stands");
  const p = await openAs(world, me, "/app/due-date/" + id);
  assert.equal(button(p, "clockadopt"), null);
  assert.deepEqual(actsIn(main(p)).sort(), ["clockpropose", "reminderset"]);
});

test("R7 \"Download to my calendar\" saves clocksics' calendar for the action (cs.save, K3145); with nothing dated it is not offered", async () => {
  const { world, me, request, sentOn, propose, adopt } = await setUp();
  const id = await request();
  await sentOn(id, "2026-10-02");
  await adopt(id, await propose(id, "records_response"));
  const p = await openAs(world, me, "/app/due-date/" + id);
  assert.equal(p.byOp("clocksics")[0].query.actions, id);
  const save = main(p).querySelectorAll("button").find((b) => b.textContent === word("screen.due-date.download"));
  assert.ok(save, "the kit's own save control (interface-shell R47)");
  await p.click(save);
  const ics = await me.read("clocksics", { query: { actions: id } });
  assert.ok(ics.events > 0, "the store's calendar holds the dated entry");
  assert.deepEqual(p.files.map((f) => f.name), [ics.filename], "the calendar handed to the browser as a file");
  const bare = await request();
  assert.equal((await me.read("clocksics", { query: { actions: bare } })).events, 0, "nothing dated in the store's calendar");
  const q = await openAs(world, me, "/app/due-date/" + bare);
  assert.equal(main(q).querySelectorAll("button").find((b) => b.textContent === word("screen.due-date.download")), undefined);
  assert.ok(!main(q).textContent.includes(word("screen.due-date.download")), "R22: nothing to put in a calendar, nothing offered");
});

test("R7 a refused proposal is drawn beside the act (control)", async () => {
  const { world, me, request } = await setUp();
  const id = await request();
  /* no proposal stands, so the page names the action's kind as the rule, which no profile states: the store refuses it */
  const p = await openAs(world, me, "/app/due-date/" + id);
  await press(p, "clockpropose", { reason: REASON });
  assert.equal(p.byOp("clockpropose").length, 1);
  assert.equal((await refused(world, me, "clockpropose", p.byOp("clockpropose")[0].body)).reason, "NO_SUCH_RULE", "the store's own refusal");
  assert.ok(main(p).textContent.includes(word("refusal.NO_SUCH_RULE")), "the refusal by its words");
});

test("R7 the subject `<action>~<entry position>` (screens-action's links, K3149) reads the action and opens at that entry; the action alone still opens (control)", async () => {
  const { world, me, request, sentOn, propose, adopt } = await setUp();
  const id = await request();
  await sentOn(id, "2026-10-02");
  await adopt(id, await propose(id, "records_response"));
  await adopt(id, await propose(id, "immediate_disclosure"));
  const clock = (await me.read("action", { query: { id } })).clock;
  assert.equal(clock.length, 2, "two entries on the clock");
  assert.notEqual(clock[0].date, clock[1].date, "on different days");
  const p = await openAs(world, me, "/app/due-date/" + id + "~1");
  assert.equal(p.byOp("action")[0].query.id, id);
  assert.equal(p.byOp("clockproposals")[0].query.action, id);
  assert.equal(main(p).querySelector("h1").textContent, word("screen.due-date.due", { date: dayOf(clock[1].date) }));
  assert.ok(main(p).querySelector('[aria-current="true"]').textContent.includes(clock[1].description), "the entry the address names");
  fill(p, { "dd-on": "2026-10-05" });
  await press(p, "reminderset", { reason: REASON });
  assert.deepEqual(p.byOp("reminderset")[0].body, { target: id, entry: 1, on: "2026-10-05" });
  const q = await openAs(world, me, "/app/due-date/" + id + "~0");
  assert.equal(main(q).querySelector("h1").textContent, word("screen.due-date.due", { date: dayOf(clock[0].date) }));
  const alone = await openAs(world, me, "/app/due-date/" + id);
  assert.ok(main(alone).querySelector("h1").textContent.length > 0, "the action alone still opens");
  assert.ok(main(alone).querySelector('[aria-current="true"]') === null, "at no entry in particular");
});

/* R54 (T51; K4194 L21), R55 (L22) */
test("R54 after reminderset the entry shows the day the reminder was set for; control: a refused day shows its refusal and no reminder", async () => {
  const { world, me, request, sentOn, propose, adopt } = await setUp();
  const id = await request();
  await sentOn(id, "2026-10-02");
  await adopt(id, await propose(id, "records_response"));
  const p = await openAs(world, me, "/app/due-date/" + id);
  assert.equal(main(p).querySelectorAll("[data-reminder]").length, 0, "none before");
  fill(p, { "dd-entry": "0", "dd-on": "2026-10-09" });
  await press(p, "reminderset", { reason: REASON });
  const shown = main(p).querySelectorAll("[data-reminder]");
  assert.equal(shown.length, 1);
  assert.equal(shown[0].textContent, word("screen.reminder.on", { date: dayOf("2026-10-09") }), "drawn by the one reminder key (B419 3)");
  assert.ok(main(p).querySelector('[data-reminder="0"]').closest("div"), "beside its entry");
  /* the same day again: the store refuses a second reminder on one day of the entry */
  const bad = await openAs(world, me, "/app/due-date/" + id);
  fill(bad, { "dd-entry": "0", "dd-on": "2026-10-09" });
  await press(bad, "reminderset", { reason: REASON });
  assert.equal(main(bad).querySelectorAll("[data-reminder]").length, 0);
  const refusal = await refused(world, me, "reminderset", bad.byOp("reminderset")[0].body);
  assert.equal(refusal.reason, "REMINDER_REFUSED", "the store's own refusal");
  assert.ok(main(bad).textContent.includes(word("refusal.REMINDER_REFUSED")) || main(bad).textContent.includes(refusal.detail), "the refusal beside the act");
});

test("R55 the head names the counterparty from whatever keys it holds: an addressee's role and body, a described audience's description; none for one not yet determined", async () => {
  const { world, me, request } = await setUp();
  const head = async (id, plane = {}) => main(await openAs(world, me, "/app/due-date/" + id, { plane }));
  drew(await head(await request()), "screen.due-date.of", { who: `${ROLE}, ${BODY}` });
  drew(await head(await request(['  state: "audience"', '  description: "the Public Works front desk"'])), "screen.due-date.of", { who: "the Public Works front desk" });
  /* an office stated by its name: the store takes an addressee by role and body alone (COUNTERPARTY_REFUSED), so the live copy's record is the world's own `action` answer with its counterparty changed */
  const id = await request();
  assert.equal(((await refused(world, me, "actioncreate", { document: "---\nid: PENDING\nobject_type: action\ntitle: x\ncurrent_state: planned\ncreated: \"2026-10-01T12:00:00Z\"\nlast_updated: \"2026-10-01T12:00:00Z\"\naction_kind: records_request\ncounterparty:\n  state: named\n  name: Office of the City Attorney\n  kind: office\n---\n\nx\n" })) || {}).code, "COUNTERPARTY_REFUSED");
  const named = rewrite(world, me, (req, a) => {
    if (!/op=action(&|$)/.test(String(req.url))) return a;
    const j = JSON.parse(JSON.stringify(a.json));
    j.result.counterparty = { name: "Office of the City Attorney", kind: "office" };
    return { ...a, json: j };
  });
  drew(await head(id, { action: named }), "screen.due-date.of", { who: "Office of the City Attorney" });
  const none = await head(await request(['  state: "undetermined"', '  basis: "no one has answered yet"']));
  assert.equal(none.querySelector(".mk-sub"), null, "no sentence");
  assert.ok(!none.textContent.includes("no one has answered yet"), "the basis is not a name");
});

/* R59 (T51; DEC-384 E6) */
test("R59 the refusal that no rule states a deadline draws the deadlines its answer carries to pick from, the help and the door to the rules; choosing one sends the owner's declared fields; control: a due date that is found draws none", async () => {
  const { world, me, request, sentOn } = await setUp();
  const id = await request();
  await sentOn(id, "2026-10-02");
  const p = await openAs(world, me, "/app/due-date/" + id);
  assert.equal(main(p).querySelector("[data-rules]"), null, "nothing before the refusal");
  await press(p, "clockpropose", { reason: REASON });
  /* what the store answers to that very request (the refusal is written nothing, so it can be asked again) */
  const refusal = await refused(world, me, "clockpropose", p.byOp("clockpropose")[0].body);
  assert.equal(refusal.reason, "NO_SUCH_RULE");
  assert.ok(refusal.deadlines.length >= 2, "its answer carries the deadlines the profile lists");
  drew(main(p), "refusal.NO_SUCH_RULE");
  const box = main(p).querySelector("[data-rules]");
  assert.ok(box, "the pick box is drawn beside the refusal");
  drew(box, "screen.due-date.rule.summary");
  drew(box, "screen.due-date.rule.help");
  assert.deepEqual(p.doc.getElementById("dd-rule").querySelectorAll("option").map((o) => o.getAttribute("value")).filter(Boolean), refusal.deadlines.map((d) => d.rule));
  assert.equal(box.querySelector('a[href="/app/places"]').textContent, word("screen.due-date.rule.go"), "the door to the rules");
  const pick = refusal.deadlines[1].rule;
  fill(p, { "dd-rule": pick });
  await press(p, "clockpropose", { within: box, reason: REASON });
  const sent = p.byOp("clockpropose");
  assert.deepEqual(sent[sent.length - 1].body, { target: id, rule: pick }, "the owner's declared fields (the guard accepts them)");
  const held = (await me.read("clockproposals", { query: { action: id } })).proposals;
  assert.deepEqual(held.map((x) => x.rule), [pick], "the store holds the proposal for the rule she picked");
  /* control: a due date that is found draws none */
  const found = await openAs(world, me, "/app/due-date/" + id);
  assert.equal(found.doc.getElementById("dd-rule"), null, "control: a due date that is found draws none");
  assert.equal(main(found).querySelector("[data-rules]"), null);
});
