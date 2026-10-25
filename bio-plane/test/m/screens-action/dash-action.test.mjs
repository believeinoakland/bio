/* screens-action R30 (T51-122; K3815, journey 22; DEC-335): the Action dashboard. Every sentence is asserted by its key (R19). */
import test from "node:test";
import { actionWorld, clockWorld, correspond, inWorld, openIn, plannedIn } from "./world-B.mjs";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, W, D, DATA_PLANE, ROUTES, ACTION, ACTION_ID, ACTIONS, PLAN, PROJECT, FILINGS, draft, FILING, READER, RO } from "./page.mjs";

const said = (p, key, vars) => assert.ok(text(p).includes(W(key, vars)), key);
const unsaid = (p, key, vars) => assert.ok(!text(p).includes(W(key, vars)), key);
const section = (p, titleKey) => main(p).querySelectorAll("section.cs-section").find((s) => (s.querySelector("h2") || { textContent: "" }).textContent.trim() === W(titleKey));
const rows = (p) => main(p).querySelectorAll("tbody tr");
const ONE = { ...ACTIONS, items: [ACTIONS.items[0]] };
// sent on October 2 and not answered: the correspondence holds the sent entry and no reply after it
const SENT = { ...ACTION, correspondence: [ACTION.correspondence[0]], entries: [] };
const OFFICE = "City Clerk, Office of the City Clerk";
const QITEMS = { items: [
  { id: "Q-1", kind: "action-clock-overdue", summary: "The City Clerk's reply to the records request was due; no reply recorded", due: "2026-10-12", options: [{ id: "taskresolve" }], subject: { id: ACTION_ID } },
  { id: "Q-2", kind: "action-reminder", summary: "Remind me about the extension", options: [{ id: "reminderanswer" }], subject: { id: ACTION_ID, entry: 1 } },
  { id: "Q-3", kind: "some-other-kind", summary: "Not Action's" }] };

test("R30: the screen is drawn at /app/dash-action from ops only: the visible actions, `action` and `filingsfor` for each one listed, and the member's queue; a resolved action has no row", async () => {
  const p = await open(ROUTES["dash-action"], { ...DATA_PLANE, actions: ok(ACTIONS) });
  assert.equal(p.byOp("actions").length, 1);
  assert.deepEqual(p.byOp("action").map((r) => r.query.id), [ACTION_ID], "the action listed and open");
  assert.deepEqual(p.byOp("filingsfor").map((r) => r.query.action), [ACTION_ID]);
  assert.ok(p.byOp("queue").length >= 1);
  assert.equal(rows(p).length, 1, "one row for the open action; the resolved one has none");
  assert.equal(main(p).querySelector("h1").textContent, W("screen.dash-action.name"));
  said(p, "screen.dash-action.every.heading");
  for (const k of ["screen.dash-action.col.to", "screen.dash-action.col.whose", "screen.dash-action.col.clock", "screen.dash-action.col.next"]) said(p, k);
  assert.ok(main(p).querySelector(`tbody a[href="/app/action/${ACTION_ID}"]`), "each row a reference opening `action`");
});

test("R30: an action sent and unanswered draws 'their move' with its clock as a sentence with its rule and date, never a countdown; the readings equal the rows", async () => {
  const p = await open(ROUTES["dash-action"], { ...DATA_PLANE, actions: ok(ONE), action: ok(SENT) });
  const row = rows(p)[0].textContent.replace(/\s+/g, " ");
  assert.ok(row.includes(OFFICE) && row.includes(W("screen.dash-action.tile.theirs")), "their move, to whom");
  assert.ok(row.includes(W("screen.dash-action.clock.due", { office: OFFICE, date: D("2026-10-12"), days: "10", law: "Gov. Code § 7922.535(b)" })), "the clock: rule and date");
  assert.ok(row.includes(W("screen.dash-action.next.record")));
  assert.doesNotMatch(row, /overdue|days left|countdown/i, "never a countdown and never 'overdue'");
  const strip = main(p).querySelector(".mk-tiles");
  assert.ok(strip.textContent.includes(W("screen.dash-action.tile.clocks")) && strip.textContent.includes(W("screen.dash-action.tile.theirs")));
  assert.ok(!strip.textContent.includes(W("screen.dash-action.tile.ours")), "control: no reading at zero");
  assert.equal(strip.querySelectorAll(".mk-tile").length, 2, "clocks running and their move: each the count of the rows below");
  assert.ok(strip.textContent.includes(W("screen.dash-action.tile.noreply", { n: "1" })), "no reply recorded by the date");
  assert.ok(!text(p).includes(W("screen.dash-action.tile.replies")), "'replies to read' has no definition in the record: not drawn");
});

test("R30: a prepared text awaiting the member's approval draws 'our move' and the approve act, in Needs you; control: an action that is neither says neither", async () => {
  // sent and unanswered, a text prepared and not yet approved: really `actioncorrespond` (sent), `actionrisktier` and `filingprepare`
  const { world, me, action } = await actionWorld();
  await correspond(me, action, "sent", { at: "2026-10-02" });
  await me.act("actionrisktier", { body: { target: action, tier: 1, reason: "routine" } });
  const filing = (await me.act("filingprepare", { body: { action, text: "We request the logs." } })).id;
  const p = await openIn(world, me, "/app/dash-action");
  const row = rows(p)[0].textContent.replace(/\s+/g, " ");
  assert.ok(row.includes(W("screen.dash-action.tile.ours")), "our move");
  assert.ok(section(p, "home.needsyou.title"), "Needs you");
  assert.equal(section(p, "home.needsyou.title").querySelectorAll('button[data-act="filingapprove"]').length, 1);
  assert.ok(section(p, "home.needsyou.title").querySelector('button[data-act="filingapprove"]').textContent.includes(W("act.filingapprove.label.dash-action")));
  await press(p, "filingapprove", { confirm: true });
  assert.equal(last(p, "filingapprove").body.filing, filing);
  assert.ok((await me.read("filingsfor", { query: { action } })).drafts.find((d) => d.filing === filing).approval, "the store holds the approval the page asked for");
  // control: replied to, with nothing prepared: neither move is ours or theirs
  const other = await actionWorld({ handle: "mai" });
  await correspond(other.me, other.action, "sent", { at: "2026-10-02" });
  await correspond(other.me, other.action, "received", { at: "2026-10-03" });
  const neither = await openIn(other.world, other.me, "/app/dash-action");
  const r = rows(neither)[0].textContent;
  assert.ok(!r.includes(W("screen.dash-action.tile.ours")) && !r.includes(W("screen.dash-action.tile.theirs")), "neither");
});

test("R30: Needs you lists the member's queue items of Action's kinds, each with the act the item offers; the others are not Action's", async () => {
  // the real queue: a clock entry whose date passed with no reply (`action-clock-overdue`), a reminder the member set that has come due (`reminderset`,
  // `action-reminder`), and a local fact a deadline rests on (`local-fact-due`, a kind that is not Action's)
  const { world, me, action } = await clockWorld({ clock: [["2026-09-20", "Response due"], ["2099-10-26", "Extension ends"]] });
  await me.act("reminderset", { body: { target: action, entry: 0, on: "2026-10-01" } });
  const items = (await me.read("queue")).items;
  const KINDS = ["action-clock-overdue", "action-reminder", "request-unsent"];
  const overdue = items.find((i) => i.kind === "action-clock-overdue"), reminder = items.find((i) => i.kind === "action-reminder"), other = items.find((i) => !KINDS.includes(i.kind));
  assert.ok(overdue && reminder && other, "the world's queue holds the three");
  const p = await openIn(world, me, "/app/dash-action");
  const s = section(p, "home.needsyou.title");
  assert.ok(s.textContent.includes(overdue.summary) && s.textContent.includes(reminder.summary));
  assert.ok(!s.textContent.includes(other.summary));
  const nth = items.filter((i) => KINDS.includes(i.kind)).indexOf(reminder);
  await press(p, "reminderanswer", { values: { ["dash-on-" + nth]: "2026-11-01" }, reason: "x" });
  assert.deepEqual({ ...last(p, "reminderanswer").body, reason: undefined }, { target: reminder.subject.id, entry: reminder.subject.entry, on: "2026-11-01", reason: undefined });
  const held = (await me.read("remindersfor", { query: { action } })).reminders;
  assert.deepEqual(held.map((r) => [r.entry, r.on, r.state]), [[0, "2026-10-01", "answered"], [0, "2026-11-01", "waiting"]], "the store holds the answer and the further day");
  // `taskresolve` (queue's): no item of Action's kinds offers it in the real queue (action-producers' doors for them name none), so the "Start the next step"
  // act is drawn here over a task item the plane scripts, unchanged
  const task = await open(ROUTES["dash-action"], { ...DATA_PLANE, actions: ok(ONE), queue: ok({ items: [QITEMS.items[0], QITEMS.items[2]] }), taskresolve: ok({ ok: true }) });
  assert.ok(section(task, "home.needsyou.title").textContent.includes("The City Clerk's reply to the records request was due"));
  assert.ok(!section(task, "home.needsyou.title").textContent.includes("Not Action's"));
  await press(task, "taskresolve", { reason: "x" });
  assert.equal(last(task, "taskresolve").body.id, "Q-1");
});

test("R30: 'Start an action' opens the composer on the project chosen and writes nothing; a team with no action draws only that first step", async () => {
  const p = await open(ROUTES["dash-action"], { ...DATA_PLANE, actions: ok({ ...ACTIONS, items: [] }) });
  assert.equal(rows(p).length, 0);
  assert.equal(main(p).querySelectorAll(".mk-tiles").length, 0, "no reading drawn at zero");
  assert.equal(section(p, "screen.dash-action.every.heading"), undefined, "no empty table");
  assert.ok(ops(p).includes("actioncreate"), "the first step");
  await press(p, "actioncreate");
  assert.equal(p.location.pathname, `/app/actionnew/${PROJECT}`);
  assert.equal(p.byOp("actioncreate").length, 0, "nothing written here");
});

test("R30, R27: a member who may read and not act reads the kit's sentence and sees no act, and every read is still made; a failed list is drawn failed", async () => {
  const p = await open(ROUTES["dash-action"], { ...DATA_PLANE, actions: ok(ONE), whoami: ok(READER) });
  assert.ok(text(p).includes(RO("dash-action")));
  assert.deepEqual(ops(p), []);
  assert.equal(rows(p).length, 1);
  const f = await open(ROUTES["dash-action"], { ...DATA_PLANE, actions: { status: 502, text: "boom" } });
  assert.ok(main(f).querySelector('[data-state="failed"]'));
});

test("R30: a due, unjudged checkpoint on a plan whose started option made the action is 'our move'; control: a judged one is not, a plan with no action counts nowhere", async () => {
  /* the plan, its option and the action it made are real acts (`planopen`, `optionadd`, `optiondispose`, `scenarioset`, `optionstart`); the action is sent. A checkpoint
     cannot be made due by acts: `checkpointsdue` is read at action-plans' own wall clock, its phases are due at least a day after the plan starts, and the op takes no
     instant, so the one scripted line is its answer, naming the real plan and project */
  const { world, me } = await inWorld({ handle: "olive" });
  const project = await world.recipes.project(me, "Stormwater");
  const { plan, action } = await plannedIn(world, me, project);
  await correspond(me, action, "sent", { at: "2026-10-02" });
  assert.equal((await me.read("plan", { query: { id: plan } })).options.find((o) => o.action).action.id, action, "the plan's started option names the action it made");
  const due = { ok: true, items: [{ plan, project, scenario: 1, phase: "q", days_since_due: 3 }] };
  const p = await openIn(world, me, "/app/dash-action", { checkpointsdue: ok(due) });
  assert.equal(p.byOp("checkpointsdue").length >= 1, true);
  assert.ok(rows(p)[0].textContent.includes(W("screen.dash-action.tile.ours")), "our move");
  const judged = await openIn(world, me, "/app/dash-action"); // the store lists no checkpoint as due (nothing is due, as a judged one is not), and answers so itself
  assert.deepEqual((await me.read("checkpointsdue")).items, []);
  assert.ok(!rows(judged)[0].textContent.includes(W("screen.dash-action.tile.ours")), "control: a judged checkpoint is not our move");
  // a plan whose chosen option was never started made no action: the action in the list is another one, and the checkpoint counts nowhere
  const other = await actionWorld({ handle: "mai" });
  const unstarted = await plannedIn(other.world, other.me, other.project, { start: false });
  await correspond(other.me, other.action, "sent", { at: "2026-10-02" });
  const noAction = await openIn(other.world, other.me, "/app/dash-action", { checkpointsdue: ok({ ok: true, items: [{ plan: unstarted.plan, project: other.project, scenario: 1, phase: "q", days_since_due: 3 }] }) });
  assert.ok(!rows(noAction)[0].textContent.includes(W("screen.dash-action.tile.ours")), "a plan with no action counts nowhere");
  // a text approved and not yet sent: really `filingprepare` then `filingapprove`
  const ap = await actionWorld({ handle: "rosa" });
  await correspond(ap.me, ap.action, "sent", { at: "2026-10-02" });
  await ap.me.act("actionrisktier", { body: { target: ap.action, tier: 1, reason: "routine" } });
  const filing = (await ap.me.act("filingprepare", { body: { action: ap.action, text: "We request the logs." } })).id;
  await ap.me.act("filingapprove", { body: { filing } });
  const approved = await openIn(ap.world, ap.me, "/app/dash-action");
  assert.ok(rows(approved)[0].textContent.includes(W("screen.dash-action.tile.ours")), "approvedunsent's items are the drafts at step send: the same");
});
