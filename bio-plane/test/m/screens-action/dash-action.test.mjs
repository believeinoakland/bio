/* screens-action R30 (T51-122; K3815, journey 22; DEC-335): the Action dashboard. Every sentence is asserted by its key (R19). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, W, D, DATA_PLANE, ROUTES, ACTION, ACTION_ID, ACTIONS, PROJECT, FILINGS, draft, FILING, READER, RO } from "./page.mjs";

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
  const p = await open(ROUTES["dash-action"], { ...DATA_PLANE, actions: ok(ONE), action: ok(SENT), filingsfor: ok(FILINGS([draft()])), filingapprove: ok({ ok: true }) });
  const row = rows(p)[0].textContent.replace(/\s+/g, " ");
  assert.ok(row.includes(W("screen.dash-action.tile.ours")), "our move");
  assert.ok(section(p, "home.needsyou.title"), "Needs you");
  assert.equal(section(p, "home.needsyou.title").querySelectorAll('button[data-act="filingapprove"]').length, 1);
  assert.ok(section(p, "home.needsyou.title").querySelector('button[data-act="filingapprove"]').textContent.includes(W("act.filingapprove.label.dash-action")));
  await press(p, "filingapprove", { confirm: true });
  assert.equal(last(p, "filingapprove").body.filing, FILING);
  const neither = await open(ROUTES["dash-action"], { ...DATA_PLANE, actions: ok(ONE), action: ok({ ...SENT, reply_owed: { owed: false } }) });
  const r = rows(neither)[0].textContent;
  assert.ok(!r.includes(W("screen.dash-action.tile.ours")) && !r.includes(W("screen.dash-action.tile.theirs")), "neither");
});

test("R30: Needs you lists the member's queue items of Action's kinds, each with the act the item offers; the others are not Action's", async () => {
  const p = await open(ROUTES["dash-action"], { ...DATA_PLANE, actions: ok(ONE), queue: ok(QITEMS), taskresolve: ok({ ok: true }), reminderanswer: ok({ ok: true }) });
  const s = section(p, "home.needsyou.title");
  assert.ok(s.textContent.includes("The City Clerk's reply to the records request was due") && s.textContent.includes("Remind me about the extension"));
  assert.ok(!s.textContent.includes("Not Action's"));
  await press(p, "taskresolve", { reason: "x" });
  assert.equal(last(p, "taskresolve").body.id, "Q-1");
  await press(p, "reminderanswer", { values: { "dash-on-1": "2026-11-01" }, reason: "x" });
  assert.deepEqual({ ...last(p, "reminderanswer").body, reason: undefined }, { target: ACTION_ID, entry: 1, on: "2026-11-01", reason: undefined });
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
