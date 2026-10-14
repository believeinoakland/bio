/* screens-action R5, R10 (and R7 on `action`): one action, its replies, due dates, pressure, holds and scope. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, last, ok, beside, DATA_PLANE, ROUTES, ACTION, ACTION_ID, FILINGS, PRESSURE, PROJECT, draft } from "./page.mjs";

test("R5: reads the action: what it is, to whom (by role, with who holds it today), when and by whom it was sent, its replies; 'Waiting on <office>'s reply' while one is owed", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  assert.equal(p.byOp("action")[0].query.id, ACTION_ID);
  const t = text(p);
  for (const s of ["Records request", "to City Clerk, Office of the City Clerk", "held today by Asha Rao", "sent 2 October 2026 by mai",
    "Waiting on City Clerk, Office of the City Clerk's reply", "3 October 2026", "received · Office of the City Clerk · email"]) assert.ok(t.includes(s), s);
  const q = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, reply_owed: { owed: false } }) });
  assert.doesNotMatch(text(q), /Waiting on/, "control: no reply owed, no waiting");
});

test("R5 (action-producers R1; v0.2 rule 6): each due date is drawn with mark.due and opens due-date; a passed one is canon's question, never 'overdue' until a member determines it", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  const dues = main(p).querySelectorAll(".cs-due");
  assert.equal(dues.length, 2);
  assert.ok(dues.every((d) => d.getAttribute("data-tip")), "mark.due explains itself");
  assert.ok(main(p).querySelector(`a[href="/app/due-date/${encodeURIComponent(ACTION_ID + "~0")}"]`));
  assert.match(text(p), /no reply recorded by 12 October 2026/);
  assert.doesNotMatch(text(p), /overdue/i);
  const q = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, clock: [{ ...ACTION.clock[0], status: "overdue" }] }) });
  assert.match(text(q), /overdue, as a member determined/);
});

test("R5: 'Record a reply' sends actioncorrespond with the day and the member's account; 'Mark a reply as pressure' marks a received one once", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, actioncorrespond: ok({}), actionpressure: ok({}) });
  const b = await press(p, "actioncorrespond", { reason: "it came" });
  assert.match(beside(p, b), /Give the day the reply came first/);
  await press(p, "actioncorrespond", { values: { "reply-at": "2026-10-11", "reply-account": "They will answer by 26 October." }, reason: "it came" });
  const r = last(p, "actioncorrespond");
  assert.deepEqual([r.query.target, r.query.direction, r.query.at, r.query.account], [ACTION_ID, "received", "2026-10-11", "They will answer by 26 October."]);
  await press(p, "actionpressure", { values: { "pressure-kind-2": "discrediting", "pressure-note-2": "called us saboteurs" }, reason: "x" });
  assert.deepEqual({ ...last(p, "actionpressure").body, reason: undefined }, { target: ACTION_ID, ord: 2, pressure: { kind: "discrediting", note: "called us saboteurs" }, reason: undefined });
  const q = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, entries: [{ ord: 2, pressure: { kind: "legal", note: "x" } }] }) });
  assert.ok(!ops(q).includes("actionpressure"), "control: a marked reply is marked once");
  assert.match(text(q), /legal/);
});

test("R5: 'Move the action' to a state its edges allow, with the reason in the query actions reads; resolving names how", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, actionmove: ok({}) });
  const to = p.doc.getElementById("move-to").querySelectorAll("option").map((o) => o.value);
  assert.deepEqual(to, ["active", "resolved", "abandoned"]);
  await press(p, "actionmove", { values: { "move-to": "resolved", "move-resolution": "complied" }, reason: "the logs came" });
  const r = last(p, "actionmove");
  assert.deepEqual([r.query.target, r.query.to, r.query.resolution, r.query.reason], [ACTION_ID, "resolved", "complied", "the logs came"]);
});

test("R5: 'Remind me' on a dated entry; 'Record a litigation hold' with a reason, then drawn as in place; confidential or not with a reason, a published case keeping what it said", async () => {
  let hold = null;
  const p = await open(ROUTES.action, { ...DATA_PLANE, reminderset: ok({}), actionhold: () => { hold = "in_place"; return ok({}); },
    actionholdpreview: () => ok({ target: ACTION_ID, hold }), actionscope: ok({}) });
  await press(p, "reminderset", { nth: 1, values: { "remind-1": "2099-10-20" } });
  assert.deepEqual(last(p, "reminderset").body, { target: ACTION_ID, entry: 1, on: "2099-10-20" });
  assert.match(text(p), /A published case keeps what it said/);
  await press(p, "actionhold", { reason: "a claim is coming" });
  assert.deepEqual(last(p, "actionhold").body, { target: ACTION_ID, hold: "in_place", reason: "a claim is coming" });
  assert.match(text(p), /A litigation hold is in place/);
  assert.ok(!ops(p).includes("actionhold"));
  await press(p, "actionscope", { reason: "names a witness" });
  assert.deepEqual(last(p, "actionscope").body, { target: ACTION_ID, confidential: true, reason: "names a witness" });
});

test("R10 (DEC-212): an action holding an approved, unsent text offers 'Pick up where you left off', opening the request at its send step; control: none without one", async () => {
  const p = await open(ROUTES.action, { ...DATA_PLANE, filingsfor: ok(FILINGS([draft({ approval: { approved_by: "member:mai", at: "x", sha: "s" } })])) });
  assert.match(text(p), /Approved, not yet sent: nothing has gone to the office/);
  const a = main(p).querySelectorAll("a").find((x) => /Pick up where you left off/.test(x.textContent));
  assert.equal(a.getAttribute("href"), `/app/request/${ACTION_ID}`);
  const q = await open(ROUTES.action, DATA_PLANE);
  assert.doesNotMatch(text(q), /Pick up where you left off/);
});

/* ---------- R12 (T48; N1035; K3145; actions R102; action-holds R16) ---------- */

test("R12: the action heads the screen with its title and its project as a reference, each as `action` answers them; control: a null is drawn absent, never as 'untitled'", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  assert.equal(main(p).querySelector("h1").textContent, "Inspection logs, 2025");
  assert.equal(main(p).querySelectorAll("nav.cs-crumbs li").map((li) => li.textContent.trim()).join(" › "), "Projects › Pothole repairs › Action");
  assert.equal(p.byOp("file").length, 0, "the project comes from the action's own answer, not from its document");
  const bare = await open(ROUTES.action, { ...DATA_PLANE, action: ok({ ...ACTION, title: null, project: null }) });
  assert.equal(main(bare).querySelector("h1").textContent, "Action", "no title: the screen's own name");
  assert.doesNotMatch(text(bare), /untitled/i);
  assert.equal(main(bare).querySelectorAll("nav.cs-crumbs li").map((li) => li.textContent.trim()).join(" › "), "Projects › Action", "no project: no project step");
});

test("R12: the pressure marks from pressurefor are drawn with where each arrived; control: a mark on another action is not drawn", async () => {
  const p = await open(ROUTES.action, DATA_PLANE);
  assert.equal(p.byOp("pressurefor")[0].query.action, ACTION_ID);
  for (const s of ["Pressure on this action", "legal · a letter from the city's counsel", "arrived with reply 2", "marked by mai", "4 October 2026"]) assert.ok(text(p).includes(s), s);
  const other = { arrived: { action: "ACTN-2026-ffffffffffffffff", ord: 1 }, project: PROJECT, kind: "retaliation", note: "a threat on the other action", by: "member:dev", at: "2026-10-05T09:00:00Z" };
  const q = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: ok({ ...PRESSURE, items: [...PRESSURE.items, other] }) });
  assert.doesNotMatch(text(q), /a threat on the other action/);
  const none = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: ok({ ...PRESSURE, items: [] }) });
  assert.doesNotMatch(text(none), /Pressure on this action/, "no mark: the section is not drawn");
  const failed = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: { status: 502, text: "boom" } });
  assert.ok(main(failed).querySelector('[data-state="failed"]'), "a failed read is drawn as failed");
});

test("R12: the marks are paged by `after`: the next page is read from the cursor until none follows", async () => {
  const mark = (ord, note) => ({ arrived: { action: ACTION_ID, ord }, project: PROJECT, kind: "other", note, by: "member:mai", at: "2026-10-04T09:00:00Z" });
  const pages = { undefined: { ...PRESSURE, items: [mark(2, "first page")], truncated: true, cursor: `${ACTION_ID}#2` },
    [`${ACTION_ID}#2`]: { ...PRESSURE, items: [mark(3, "second page")], truncated: true, cursor: `${ACTION_ID}#3` },
    [`${ACTION_ID}#3`]: { ...PRESSURE, items: [mark(4, "third page")], truncated: false, cursor: null } };
  const p = await open(ROUTES.action, { ...DATA_PLANE, pressurefor: (r) => ok(pages[r.query.after]) });
  for (const s of ["first page", "second page", "third page"]) assert.ok(text(p).includes(s), s);
  assert.deepEqual(p.byOp("pressurefor").map((r) => r.query.after), [undefined, `${ACTION_ID}#2`, `${ACTION_ID}#3`]);
});
