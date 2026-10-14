/* The member's queue (R2, R3) on the real served page (interface-shell's harness): the sort, the kinds, the words, the due
   dates, the hints, the note shown once, the grouping by case, and each act an item offers with what it sends. Items are
   in `queue` R6's shape, their options decorated (R17) and their dispositions naming their doors (R12, R46). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, ops, acts, button, press, beside, last, main } from "./page.mjs";

const PROJ = (id, title) => ({ state: "determined", ungrouped: false, ancestors: [{ id, type: "project", title, depth: 1 }] });
const day = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const ITEMS = [
  { id: "TSK-1", class: "OBLIGATION", kind: "check-requested", case: PROJ("PROJ-1", "Pothole repairs"), subject: { kind: "bundle", id: "INF-7" },
    summary: "Ana asked you to check a calculation", detail: "812 of 903 reports", due: day(-1),
    options: [{ id: "cite", label: "Cite" }], disposition: { available: false, instead: "taskresolve" } },
  { id: "FINDING::source-modified::PROJ-2::x", class: "FINDING", kind: "source-modified", case: PROJ("PROJ-2", "The Coliseum lease"),
    subject: { kind: "bundle", id: "INF-8" }, summary: "Two documents give different dates",
    hint: { matched: "Form 700 against votes", how: "the check matched names", false_alarm_rate: 0.12 },
    options: [], disposition: { available: true, op: "proposedispose", scope: "project", finding: "FINDING::source-modified::PROJ-2::x", projects: ["PROJ-2"] } },
  { id: "FINDING::newer::1", class: "FINDING", kind: "newer-capture-affects-reference", case: PROJ("PROJ-2", "The Coliseum lease"),
    subject: { kind: "capture", id: "abc123" }, summary: "A newer version", options: [],
    disposition: { available: true, scope: "notice", notice: "VN-5", acts: ["versionadopt", "versionkeep"] } },
  { id: "OBLIGATION::action-reminder::ACT-1::0::d", class: "OBLIGATION", kind: "action-reminder", case: PROJ("PROJ-1", "Pothole repairs"),
    subject: { kind: "action", id: "ACT-1", entry: 0 }, summary: "Remind me", due: day(0), options: [], disposition: { instead: "reminderanswer" } },
  { id: "OBLIGATION::explore-ask::x", class: "OBLIGATION", kind: "explore-ask", case: { ungrouped: true, ancestors: [] },
    subject: { kind: "ai_account", id: "project:PROJ-1", day: "2026-10-12" }, basis: { owner: "project:PROJ-1" },
    summary: "Explore today?", options: [], disposition: { instead: "exploreapprove" } },
  { id: "CONDITION::q", class: "CONDITION", kind: "step-date-due", word: "queue.step-date-due.summary", fills: { step: "Ask the clerk", date: "3 October" },
    case: { ungrouped: true, ancestors: [] }, summary: "raw summary", options: [{ id: "steps", label: "Steps" }], subject: { kind: "step", id: "STP-1" },
    disposition: { instead: "queuemute" } },
];
const FEED = { items: ITEMS, item_count: 8, truncated: true };
const PLANE = { queue: ok(FEED) };
const CONTRIB = (p) => p; // the harness's member holds `contribute` (proposedispose, adoptversion, keepversion need it)
const mainQueue = (p) => p.byOp("queue").filter((r) => r.query.limit !== "500");
const itemOf = (p, id) => main(p).querySelectorAll(".cs-row").find((r) => r.querySelectorAll("button[data-act]").some((b) => b.dataset.item === id));
const opsOf = (row) => row.querySelectorAll("button[data-act]").map((b) => b.getAttribute("data-act"));

test("R2: the queue is read with the member's chosen sort (time added, time due, case, kind), the route's subject; any other the default", async () => {
  for (const s of ["added", "due", "case", "kind"]) {
    const p = await open("/app/queue/" + s, PLANE);
    assert.deepEqual(mainQueue(p).at(-1).query, { op: "queue", sort: s });
    assert.equal(main(p).querySelector("nav.mk-sorts b[aria-current]").textContent, { added: "time added", due: "time due", case: "case", kind: "kind" }[s]);
  }
  const d = await open("/app/queue", PLANE);
  assert.deepEqual(mainQueue(d).at(-1).query, { op: "queue" });
  const bogus = await open("/app/queue/bogus", PLANE);
  assert.deepEqual(mainQueue(bogus).at(-1).query, { op: "queue" });
  const links = main(d).querySelectorAll("nav.mk-sorts a[data-nav]").map((a) => a.getAttribute("href"));
  assert.deepEqual(links, ["/app/queue/added", "/app/queue/due", "/app/queue/kind"]);
  // A sort is a route: following it keeps the browser's history and re-reads in that sort.
  await d.click(main(d).querySelector('a[href="/app/queue/due"]'));
  assert.equal(d.location.pathname, "/app/queue/due");
  assert.deepEqual(mainQueue(d).at(-1).query, { op: "queue", sort: "due" });
});

test("R2: each item drawn by its kind mark (To do, Noticed, Status), grouped by case in the feed's order, with the uncased together", async () => {
  const p = await open("/app/queue", PLANE);
  const marks = main(p).querySelectorAll(".cs-row > .cs-kind").map((e) => e.getAttribute("data-kind"));
  assert.deepEqual(marks, ["todo", "todo", "noticed", "noticed", "todo", "status"]);
  const heads = main(p).querySelectorAll("section.mk-sec > h2").map((h) => h.textContent);
  assert.deepEqual(heads, ["Pothole repairs", "The Coliseum lease", "Not in a case"]);
  assert.match(text(p), /8 items · grouped by case/);
  assert.match(text(p), /8 more items are not shown here|2 more items are not shown here/);
});

test("R2: an item's summary and detail are its queue.<kind> words where keyed, filled, else its own summary and detail", async () => {
  const p = await open("/app/queue", PLANE);
  assert.match(text(p), /Past its date: Ask the clerk/);
  assert.match(text(p), /You set 3 October for this step/);
  assert.doesNotMatch(text(p), /raw summary/);
  assert.match(text(p), /Ana asked you to check a calculation812 of 903 reports/);
  const cost = await open("/app/queue", { queue: ok({ items: [{ id: "N1", class: "FINDING", kind: "step-cost-shared", fills: { step: "s", totals: "$4", projects: "A, B" }, case: { ungrouped: true }, options: [] }] }) });
  assert.match(text(cost), /your group's Civicsmith records no split/, "DEC-149's form, this module's own row (interface-shell R5)");
});

test("R2: due dates drawn with mark.due (overdue, near, later), and a hint with mark.hint opening in place with what, how, the false-alarm rate and what it is not", async () => {
  const p = await open("/app/queue", PLANE);
  const dues = main(p).querySelectorAll(".cs-due").map((e) => e.getAttribute("data-due"));
  assert.deepEqual(dues, ["overdue", "near"]);
  const later = await open("/app/queue", { queue: ok({ items: [{ ...ITEMS[0], due: day(30) }] }) });
  assert.equal(main(later).querySelector(".cs-due").getAttribute("data-due"), null);
  const hint = main(p).querySelector("details.mk-hintd");
  assert.ok(hint.querySelector(".cs-hint"));
  assert.match(text(p, hint), /Hint · machine work How was this found\?What was matchedForm 700 against votesHow it was foundthe check matched namesHow far to trust itOf this check's past hints that members looked into, 12% were false alarms\.What it is notA lead, never a finding/);
  const norate = await open("/app/queue", { queue: ok({ items: [{ ...ITEMS[1], hint: { matched: "m" } }] }) });
  assert.match(text(norate), /No false-alarm rate is recorded for this check yet\./);
});

test("R2: due dates are judged on the page's clock (cs.now(), K3002)", async () => {
  const p = await open("/app/queue", { queue: ok({ items: [{ ...ITEMS[0], due: day(1) }] }) });
  assert.equal(main(p).querySelector(".cs-due").getAttribute("data-due"), "near");
  await p.clock.tick(3 * 86400000);
  await p.click(main(p).querySelector('a[href="/app/queue/due"]'));
  assert.equal(main(p).querySelector(".cs-due").getAttribute("data-due"), "overdue");
});

test("R2: the three-kinds note is shown once per member on the device", async () => {
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  try {
    const first = await open("/app/queue", PLANE);
    assert.match(text(first), /Three kinds: To do needs your act.*\(Shown once\.\)/);
    await press(first, "taskresolve");
    assert.match(text(first), /Three kinds/, "kept through the screen's redraws and re-reads while the member is here");
    assert.doesNotMatch(text(await open("/app/queue", PLANE)), /Three kinds/, "not again for the same member");
    globalThis.localStorage = { getItem() { throw new Error("blocked"); }, setItem() {} };
    assert.doesNotMatch(text(await open("/app/queue", PLANE)), /Three kinds/, "a device that cannot keep it does not repeat it on every draw");
  } finally { delete globalThis.localStorage; }
});

test("R3: an item's acts are its options and disposition's doors among the registered acts; any other option is \"Open\", a link to its subject's screen", async () => {
  const p = await open("/app/queue", PLANE);
  assert.deepEqual(opsOf(itemOf(p, "TSK-1")), ["taskresolve"]);
  assert.deepEqual(opsOf(itemOf(p, "FINDING::source-modified::PROJ-2::x")), ["proposedispose", "queuemute"]);
  assert.deepEqual(opsOf(itemOf(p, "FINDING::newer::1")), ["adoptversion", "keepversion", "queuemute"]);
  assert.deepEqual(opsOf(itemOf(p, "OBLIGATION::action-reminder::ACT-1::0::d")), ["reminderanswer"]);
  assert.deepEqual(opsOf(itemOf(p, "OBLIGATION::explore-ask::x")), ["exploreapprove"]);
  assert.deepEqual(opsOf(itemOf(p, "CONDITION::q")), ["queuemute"]);
  assert.deepEqual(acts(p).filter(([op]) => op === "queuesnooze").map(([, d]) => d.project), ["PROJ-1", "PROJ-2"], "snooze is by case, on each case's heading");
  const open1 = itemOf(p, "TSK-1").querySelector('a[data-nav][href="/app/document/INF-7"]');
  assert.equal(open1.textContent, "Open");
  assert.equal(main(p).querySelector('a[href^="/app/step/"]'), null, "a subject with no built screen has no link");
  assert.match(button(p, "taskresolve").textContent, /^Act on an item/);
  // Each act drawn only where the gate allows it (interface-shell R12): without `contribute`, the dispositions needing it go.
  const plain = await open("/app/queue", { ...PLANE, whoami: ok({ tokenClass: "member", session: true, member: "mai", handle: "mai", capabilities: [] }) });
  assert.ok(!ops(plain).includes("proposedispose") && !ops(plain).includes("adoptversion"));
  assert.ok(ops(plain).includes("queuemute"));
});

test("R3: each act sends its op's body for the item it was drawn on; an act asking the member's words draws its fields in place", async () => {
  const p = await open("/app/queue", PLANE);
  await press(p, "taskresolve");
  assert.deepEqual(last(p, "taskresolve").body, { id: "TSK-1" });
  const fwd = button(p, "taskforward");
  assert.equal(fwd, null, "forwarding is not this item's option");
  await press(p, "queuemute", { nth: 1 });
  assert.deepEqual(last(p, "queuemute").body, { item: "FINDING::newer::1" });
  await press(p, "proposedispose", { reason: "Not relevant to us" });
  assert.deepEqual(last(p, "proposedispose").body, { project: "PROJ-2", finding: "FINDING::source-modified::PROJ-2::x", to: "dismissed", reason: "Not relevant to us" });
  const snooze = button(p, "queuesnooze");
  const f = snooze.dataset.f;
  assert.equal(snooze.closest("details").querySelector("summary").textContent, "Snooze to a date");
  await press(p, "queuesnooze", { values: { [f + "-until"]: "2026-10-20" } });
  assert.deepEqual(last(p, "queuesnooze").body, { case: "PROJ-1", until: "2026-10-20" });
  const keep = await press(p, "keepversion");
  assert.deepEqual(last(p, "keepversion").body, { notice: "VN-5" });
  const adopt = button(p, "adoptversion");
  const b = await press(p, "adoptversion");
  assert.equal(p.byOp("adoptversion").length, 0, "control: adopting asks why (reevaluation R15)");
  assert.equal(beside(p, b), "Fill this in first.");
  await press(p, "adoptversion", { values: { [adopt.dataset.f + "-why"]: " It corrects the date " } });
  assert.deepEqual(last(p, "adoptversion").body, { notice: "VN-5", why: "It corrects the date" }, "the member's why is the act's reason, no second one asked (interface-shell R11)");
  const rem = button(p, "reminderanswer");
  await press(p, "reminderanswer");
  assert.deepEqual(last(p, "reminderanswer").body, { target: "ACT-1", entry: 0 });
  await press(p, "reminderanswer", { values: { [rem.dataset.f + "-on"]: "2026-10-25" } });
  assert.deepEqual(last(p, "reminderanswer").body, { target: "ACT-1", entry: 0, on: "2026-10-25" });
  await press(p, "exploreapprove");
  assert.deepEqual(last(p, "exploreapprove").body, { owner: "project:PROJ-1", day: "2026-10-12" });
  assert.ok(keep);
});

test("R3: forwarding, a project key and a question from a hint, each with its own field, and nothing sent without it", async () => {
  const items = [
    { id: "TSK-2", class: "OBLIGATION", kind: "check", case: PROJ("PROJ-1", "Pothole repairs"), summary: "s", options: [{ id: "taskforward" }, { id: "projectkeyset" }, { id: "promote" }] },
  ];
  const p = await open("/app/queue", { queue: ok({ items }), promote: ok({ ok: true, bundleId: "INQ-3" }), whoami: ok({ tokenClass: "member", session: true, member: "mai", handle: "mai", capabilities: ["contribute"] }) });
  const fwd = await press(p, "taskforward");
  assert.equal(p.byOp("taskforward").length, 0);
  assert.equal(beside(p, fwd), "Fill this in first.");
  await press(p, "taskforward", { values: { [button(p, "taskforward").dataset.f + "-to"]: "@ana" } });
  assert.deepEqual(last(p, "taskforward").body, { id: "TSK-2", to: "ana" });
  await press(p, "projectkeyset", { values: { [button(p, "projectkeyset").dataset.f + "-key"]: "sk-ant-x" } });
  assert.deepEqual(last(p, "projectkeyset").body, { project: "PROJ-1", key: "sk-ant-x" });
  assert.equal(last(p, "projectkeyset").url.includes("sk-ant"), false, "the key travels in the body only");
  await press(p, "promote", { values: { [button(p, "promote").dataset.f + "-question"]: "Did the council vote?" } });
  const r = last(p, "promote");
  assert.equal(r.query.project, "PROJ-1");
  assert.equal(r.body.meta.object_type, "inquiry");
  assert.equal(r.body.meta.title, "Did the council vote?");
  assert.match(r.body.files[0].text, /question: "Did the council vote\?"/);
  assert.equal(p.location.pathname, "/app/question/INQ-3");
});

test("R2, R3 (interface-shell R10, R13): the queue's four states; a refusal beside its act; an item resolved or muted leaves the list on the re-read", async () => {
  const empty = await open("/app/queue", { queue: ok({ items: [] }) });
  assert.match(text(empty), /You are up to date\./);
  const loading = await open("/app/queue", { queue: { pending: true } });
  assert.ok(main(loading).querySelector('[data-state="loading"]'));
  const failed = await open("/app/queue/kind", { queue: (req) => (req.query.sort ? refused("QUEUE_SORT_UNKNOWN", "That sort is not one the queue knows.") : ok({ items: [] })) });
  assert.ok(main(failed).querySelector('[data-state="failed"]'));
  assert.doesNotMatch(text(failed), /up to date/);
  let done = false;
  const p = await open("/app/queue", { queue: () => ok({ items: done ? ITEMS.slice(1) : ITEMS }), taskresolve: () => { done = true; return ok({ ok: true, id: "TSK-1", status: "resolved" }); } });
  await press(p, "taskresolve");
  assert.equal(itemOf(p, "TSK-1"), undefined, "re-read after the act: the resolved item is gone");
  const r = await open("/app/queue", { ...PLANE, taskresolve: refused("TASK_NOT_YOURS", "This task is not yours to resolve.") });
  const b = await press(r, "taskresolve");
  assert.match(beside(r, b), /not yours|TASK_NOT_YOURS/);
  assert.ok(itemOf(r, "TSK-1"), "nothing on the screen changes but the refusal");
  assert.ok(CONTRIB);
});

test("R12 (DEC-201 (13)): with nothing waiting the queue says the member is up to date, one step from Home", async () => {
  const p = await open("/app/queue", { queue: ok({ items: [] }) });
  assert.match(text(p), /You are up to date\. When something needs your act, a reply arrives, or the record notices something you follow, it appears here, once\./);
  assert.equal(main(p).querySelector('a[data-nav][href="/app"]').textContent, "Go to Home");
  // Controls: a queue with items, and a failed read, say neither.
  for (const plane of [PLANE, { queue: refused("STORE_DID_NOT_ANSWER", null, 502) }]) {
    const q = await open("/app/queue", plane);
    assert.doesNotMatch(text(q), /up to date/);
    assert.equal(main(q).querySelector('a[data-nav][href="/app"]'), null);
  }
});

// The unsent request (action-producers R25): its subject the action, homed under its project.
const UNSENT = { id: "CONDITION::request-unsent::FIL-3", class: "CONDITION", kind: "request-unsent", case: PROJ("PROJ-1", "Pothole repairs"),
  subject: { kind: "action", id: "ACT-9" }, summary: "You left a records request unsent", options: [], disposition: { available: false, instead: "queuemute" } };

test("R13 (DEC-212): the unsent-request item draws \"Pick up where you left off\", \"Keep it for later\" and \"Drop the request, with a reason\"", async () => {
  const p = await open("/app/queue", { queue: ok({ items: [UNSENT, ITEMS[0]] }) });
  const row = itemOf(p, "CONDITION::request-unsent::FIL-3");
  assert.deepEqual(opsOf(row), ["queuesnooze", "actionmove"], "its own acts only: no mute, no other door");
  const pick = row.querySelector('a[data-nav][href="/app/request/ACT-9"]'); // the request screen, at its step (K3145)
  assert.equal(pick.textContent, "Pick up where you left off");
  assert.equal(row.querySelector('button[data-act="queuesnooze"]').closest("details").querySelector("summary").textContent, "Keep it for later");
  assert.match(row.querySelector('button[data-act="actionmove"]').textContent, /^Drop the request, with a reason/);
  // Control: actionmove is drawn on no other item.
  assert.equal(itemOf(p, "TSK-1").querySelectorAll('button[data-act="actionmove"]').length, 0);
  const other = await open("/app/queue", { queue: ok({ items: [{ ...ITEMS[0], options: [{ id: "actionmove" }] }] }) });
  assert.ok(!ops(other).includes("actionmove"), "an item offering actionmove among its options does not draw it");
});

test("R13: \"Drop the request\" sends actionmove to abandoned with the member's reason; \"Keep it for later\" snoozes its case to the chosen day", async () => {
  let gone = false;
  const p = await open("/app/queue", { queue: () => ok({ items: gone ? [] : [UNSENT] }),
    actionmove: () => { gone = true; return ok({ ok: true, target: "ACT-9", to: "abandoned" }); }, queuesnooze: ok({ ok: true }) });
  const snooze = button(p, "queuesnooze");
  const b = await press(p, "queuesnooze");
  assert.equal(p.byOp("queuesnooze").length, 0, "control: no day, nothing sent");
  assert.equal(beside(p, b), "Fill this in first.");
  await press(p, "queuesnooze", { values: { [snooze.dataset.f + "-until"]: "2026-10-30" } });
  assert.deepEqual(last(p, "queuesnooze").body, { case: "PROJ-1", until: "2026-10-30" });
  await press(p, "actionmove", { reason: "We found the logs online" });
  assert.deepEqual(last(p, "actionmove").body, { target: "ACT-9", to: "abandoned", reason: "We found the logs online" });
  assert.equal(itemOf(p, "CONDITION::request-unsent::FIL-3"), undefined, "re-read after the act: the dropped request leaves the list");
  const r = await open("/app/queue", { queue: ok({ items: [UNSENT] }), actionmove: refused("ACTION_NOT_FOUND", "No such action.") });
  const c = await press(r, "actionmove", { reason: "x" });
  assert.match(beside(r, c), /No such action|ACTION_NOT_FOUND/);
});
