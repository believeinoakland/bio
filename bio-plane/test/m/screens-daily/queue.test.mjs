/* The member's queue (R2, R3) at the module's interface, over the stand-in kit: the sort, the kinds, the words, the due
   dates, the hints, the note shown once, the grouping by case, and each act an item offers with what it sends. Items are in
   `queue` R6's shape, their options decorated (R17) and their dispositions naming their doors (R12, R46). */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-daily/index.mjs";
import { kit, viewOf, ops, drawn, keys, text } from "./kit.mjs";

const queue = SCREENS.find((s) => s.id === "queue");
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

test("R2: the queue is read with the member's chosen sort (time added, time due, case, kind), the route's subject; any other the default", () => {
  for (const s of ["added", "due", "case", "kind"]) assert.deepEqual(queue.reads(viewOf({ subject: s })).queue.query, { sort: s });
  assert.deepEqual(queue.reads(viewOf()).queue.query, {});
  assert.deepEqual(queue.reads(viewOf({ subject: "bogus" })).queue.query, {});
  const html = kit().render(queue, viewOf({ subject: "due", data: { queue: FEED } }));
  assert.match(html, /<b aria-current="true">⟦screen.queue.sort.due⟧/);
  for (const s of ["added", "case", "kind"]) assert.match(html, new RegExp(`href="/app/queue/${s}"`));
});

test("R2: each item drawn by its kind mark (To do, Noticed, Status), grouped by case in the feed's order, with the uncased together", () => {
  const html = kit().render(queue, viewOf({ data: { queue: FEED } }));
  const marks = [...html.matchAll(/data-mark="(kind\.\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(marks, ["kind.todo", "kind.todo", "kind.noticed", "kind.noticed", "kind.todo", "kind.status"]);
  const heads = [...html.matchAll(/<section class="cs-section mk-sec"><h2>(.*?)<\/h2>/g)].map((m) => text(m[1]));
  assert.deepEqual(heads, ["Pothole repairs", "The Coliseum lease", "Not in a case"]);
  assert.match(html, /href="\/app\/project\/PROJ-1"/);
  assert.match(text(html), /8 items/);
  assert.ok(keys(html).includes("screen.queue.grouped"));
  assert.ok(keys(html).includes("screen.queue.more"), "a truncated feed says more are not shown");
});

test("R2: an item's summary and detail are its queue.<kind> words where keyed, filled, else its own summary and detail", () => {
  const html = kit().render(queue, viewOf({ data: { queue: FEED } }));
  assert.ok(keys(html).includes("queue.step-date-due.summary"));
  assert.ok(keys(html).includes("queue.step-date-due.detail"));
  assert.match(text(html), /Past its date: Ask the clerk/);
  assert.doesNotMatch(text(html), /raw summary/);
  assert.match(text(html), /Ana asked you to check a calculation 812 of 903 reports/);
  // The step-cost word is drawn from this module's own row (interface-shell R5, DEC-149).
  const k = kit();
  const cost = k.render(queue, viewOf({ data: { queue: { items: [{ id: "N1", class: "FINDING", kind: "step-cost-shared", fills: { step: "s", totals: "$4", projects: "A, B" }, case: { ungrouped: true }, options: [] }] } } }));
  assert.match(text(cost), /your group's Civicsmith records no split/);
});

test("R2: due dates drawn with mark.due (overdue, near, later), and a hint with mark.hint opening in place with what, how, the false-alarm rate and what it is not", () => {
  const html = kit().render(queue, viewOf({ data: { queue: FEED } }));
  assert.match(html, new RegExp(`data-due="overdue" data-iso="${day(-1)}"`));
  assert.match(html, new RegExp(`data-due="near" data-iso="${day(0)}"`));
  const later = kit().render(queue, viewOf({ data: { queue: { items: [{ ...ITEMS[0], due: day(30) }] } } }));
  assert.match(later, /data-due="" /);
  const hint = html.match(/<details class="mk-hintd">.*?<\/details>/)[0];
  assert.ok(keys(hint).includes("mark.hint.label"));
  for (const k of ["screen.queue.hint.matched", "screen.queue.hint.method", "screen.queue.hint.trust", "screen.queue.hint.not", "screen.queue.hint.not.text"]) assert.ok(keys(hint).includes(k), k);
  assert.match(text(hint), /Form 700 against votes.*the check matched names.*12% were false alarms/);
  const norate = kit().render(queue, viewOf({ data: { queue: { items: [{ ...ITEMS[1], hint: { matched: "m" } }] } } }));
  assert.ok(keys(norate).includes("screen.queue.hint.rate.none"));
});

test("R2: the three-kinds note is shown once per member on the device", () => {
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  try {
    const v = { data: { queue: FEED }, me: { member: "mai" } };
    assert.ok(keys(kit().render(queue, viewOf(v))).includes("screen.queue.note"));
    assert.ok(!keys(kit().render(queue, viewOf(v))).includes("screen.queue.note"), "not again for the same member");
    assert.ok(keys(kit().render(queue, viewOf({ ...v, me: { member: "dev" } }))).includes("screen.queue.note"), "another member sees it once");
    globalThis.localStorage = { getItem() { throw new Error("blocked"); }, setItem() {} };
    assert.ok(!keys(kit().render(queue, viewOf(v))).includes("screen.queue.note"), "a device that cannot keep it does not repeat it on every draw");
  } finally { delete globalThis.localStorage; }
});

test("R3: an item's acts are its options and disposition's doors among the registered acts; any other option is \"Open\", a link to its subject's screen", () => {
  const html = kit().render(queue, viewOf({ data: { queue: FEED } }));
  const byItem = {};
  for (const [op, d] of drawn(html)) (byItem[d.item || d.project] ||= []).push(op);
  assert.deepEqual(byItem["TSK-1"], ["taskresolve"]);
  assert.deepEqual(byItem["FINDING::source-modified::PROJ-2::x"], ["proposedispose", "queuemute"]);
  assert.deepEqual(byItem["FINDING::newer::1"], ["adoptversion", "keepversion", "queuemute"]);
  assert.deepEqual(byItem["OBLIGATION::action-reminder::ACT-1::0::d"], ["reminderanswer"]);
  assert.deepEqual(byItem["OBLIGATION::explore-ask::x"], ["exploreapprove"]);
  assert.deepEqual(byItem["CONDITION::q"], ["queuemute"]);
  // Snooze is by case, on each case's heading.
  assert.deepEqual(drawn(html).filter(([op]) => op === "queuesnooze").map(([, d]) => d.project), ["PROJ-1", "PROJ-2"]);
  // "cite" is not a queue act: the item opens its subject's screen instead; a subject with no built screen has no link.
  assert.match(html, /href="\/app\/document\/INF-7">⟦screen.queue.open⟧Open/);
  assert.doesNotMatch(html, /\/app\/step\//);
  for (const [op, d] of drawn(html)) assert.equal(d.label, `act.${op}.label.queue`);
  // Each act drawn only where the gate allows it (interface-shell R12).
  const gated = kit({ allow: (op) => op !== "queuemute" }).render(queue, viewOf({ data: { queue: FEED } }));
  assert.ok(!ops(gated).includes("queuemute"));
});

test("R3: each act sends its op's body for the item it was drawn on", () => {
  const k = kit();
  const html = k.render(queue, viewOf({ data: { queue: FEED } }));
  const on = (op, item) => drawn(html).find(([o, d]) => o === op && (!item || d.item === item))[1];
  const v = viewOf({ data: { queue: FEED } });
  assert.deepEqual(k.send(queue, "taskresolve", v, on("taskresolve")), { body: { id: "TSK-1" } });
  assert.deepEqual(k.send(queue, "taskforward", v, on("taskresolve"), { fields: { to: "@ana" } }), { body: { id: "TSK-1", to: "ana" } });
  assert.equal(k.send(queue, "taskforward", v, on("taskresolve"), { fields: { to: " " } }), null, "control: nobody named, nothing sent");
  assert.deepEqual(k.send(queue, "proposedispose", v, on("proposedispose")), { body: { project: "PROJ-2", finding: "FINDING::source-modified::PROJ-2::x", to: "dismissed" } });
  assert.deepEqual(k.send(queue, "queuemute", v, on("queuemute", "CONDITION::q")), { body: { item: "CONDITION::q" } });
  assert.deepEqual(k.send(queue, "queuesnooze", v, on("queuesnooze"), { fields: { until: "2026-10-20" } }), { body: { case: "PROJ-1", until: "2026-10-20" } });
  assert.equal(k.send(queue, "queuesnooze", v, on("queuesnooze"), { fields: {} }), null);
  assert.deepEqual(k.send(queue, "adoptversion", v, on("adoptversion"), { fields: { why: " It corrects the date " } }), { body: { notice: "VN-5", why: "It corrects the date" } });
  assert.equal(k.send(queue, "adoptversion", v, on("adoptversion"), { fields: {} }), null, "control: adopting asks why (reevaluation R15)");
  assert.equal(queue.acts.find((a) => a.op === "adoptversion").reasonField, "why", "the member's why is the act's reason (interface-shell R11)");
  assert.deepEqual(k.send(queue, "keepversion", v, on("keepversion")), { body: { notice: "VN-5" } });
  assert.deepEqual(k.send(queue, "reminderanswer", v, on("reminderanswer")), { body: { target: "ACT-1", entry: 0 } });
  assert.deepEqual(k.send(queue, "reminderanswer", v, on("reminderanswer"), { fields: { on: "2026-10-25" } }), { body: { target: "ACT-1", entry: 0, on: "2026-10-25" } });
  assert.deepEqual(k.send(queue, "exploreapprove", v, on("exploreapprove")), { body: { owner: "project:PROJ-1", day: "2026-10-12" } });
  assert.deepEqual(k.send(queue, "projectkeyset", v, on("exploreapprove"), { fields: { key: "sk-ant-x" } }), { body: { project: "PROJ-1", key: "sk-ant-x" } });
  assert.equal(k.send(queue, "projectkeyset", v, on("exploreapprove"), { fields: {} }), null);
});

test("R3: a hint opens a question in its case's project, opened on success", () => {
  const k = kit();
  const v = viewOf({ data: { queue: FEED } });
  const sent = k.send(queue, "promote", v, { item: "FINDING::x", project: "PROJ-2" }, { fields: { question: "Did the council vote?" } });
  assert.deepEqual(sent.query, { project: "PROJ-2" });
  assert.equal(sent.body.meta.object_type, "inquiry");
  assert.equal(sent.body.meta.title, "Did the council vote?");
  assert.match(sent.body.files[0].text, /question: "Did the council vote\?"/);
  assert.equal(k.send(queue, "promote", v, { item: "FINDING::x" }, { fields: {} }), null);
  k.done(queue, "promote", v, { ok: true, bundleId: "INQ-3" });
  assert.deepEqual(k.log.go, [["question", "INQ-3"]]);
});

test("R2, R3 (interface-shell R10): the queue's four states; an item resolved or muted leaves the list on the re-read", () => {
  const empty = kit().render(queue, viewOf({ data: { queue: { state: "empty", value: { items: [] } } } }));
  assert.ok(keys(empty).includes("screen.queue.empty"));
  assert.match(kit().render(queue, viewOf({ data: { queue: { state: "loading" } } })), /data-state="loading"/);
  const failed = kit().render(queue, viewOf({ data: { queue: { state: "failed", refusal: { code: "QUEUE_SORT_UNKNOWN" } } } }));
  assert.match(failed, /data-state="failed"/);
  assert.ok(!keys(failed).includes("screen.queue.empty"));
  // After an act the shell re-reads every read (no `rereads`): the feed without the item draws without it.
  const after = kit().render(queue, viewOf({ data: { queue: { items: ITEMS.filter((i) => i.id !== "TSK-1") } } }));
  assert.ok(!drawn(after).some(([, d]) => d.item === "TSK-1"));
});

test("R2 (interface-shell R21, K3002): due dates are judged on the page's clock, cs.now()", () => {
  const item = { ...ITEMS[0], due: "2026-10-20" };
  const before = kit({ now: Date.parse("2026-10-01T12:00:00Z") }).render(queue, viewOf({ data: { queue: { items: [item] } } }));
  assert.match(before, /data-due="" data-iso="2026-10-20"/);
  const near = kit({ now: Date.parse("2026-10-19T12:00:00Z") }).render(queue, viewOf({ data: { queue: { items: [item] } } }));
  assert.match(near, /data-due="near"/);
  const after = kit({ now: Date.parse("2026-10-21T12:00:00Z") }).render(queue, viewOf({ data: { queue: { items: [item] } } }));
  assert.match(after, /data-due="overdue"/);
});
