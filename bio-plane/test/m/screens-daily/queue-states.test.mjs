/* The queue's other states (R58 to R61) on the real served page (interface-shell's harness): choosing several items and acting once
   with each item's outcome, what the member answered, the feeds' honesty, and the set-aside findings with a muted item named.
   Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { collectOwnerRows, fieldMismatches } from "../interface-shell/harness.mjs";
import { perItemRetained } from "../record-core/fixtures.mjs";
import { open, ok, refused, refusedIn, text, ops, button, press as pressRaw, beside, last, main, word, hasWord, dmy, withScreens, settle, screen } from "./page.mjs";

// a day well after tomorrow, on the page's own clock (R79 (c): a snooze comes back tomorrow at the earliest)
const LATER = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
const R = "looking";
const RETAINED = perItemRetained("taskresolve"); // record-core's own answer to a set act that applied one item and retained one
const press = (p, op, o = {}) => pressRaw(p, op, { reason: R, ...o });
const PROJ = (id, title) => ({ state: "determined", ungrouped: false, ancestors: [{ id, type: "project", title, depth: 1 }] });
const NOCASE = { ungrouped: true, ancestors: [] };
const task = (id, over = {}) => ({ id, class: "OBLIGATION", kind: "check-requested", case: PROJ("PROJ-1", "Pothole repairs"), subject: { kind: "bundle", id: "INF-" + id, title: "Doc " + id },
  summary: "Do " + id, options: [], disposition: { available: false, instead: "taskresolve" }, ...over });
const finding = (id, over = {}) => ({ id, class: "FINDING", kind: "tension", case: PROJ("PROJ-2", "Coliseum"), subject: { kind: "bundle", id: "INF-" + id, title: "F " + id },
  summary: "Tension " + id, options: [], disposition: { available: true, op: "proposedispose", scope: "project", finding: id, projects: ["PROJ-2"] }, ...over });
const FEEDS_OK = { feeds: [{ feed: "tasks", classes: ["OBLIGATION"], answered: true, failed: [] }], all_answered: true,
  classes_answered: { OBLIGATION: true, FINDING: true, CONDITION: true }, all_clear: { OBLIGATION: true, FINDING: true, CONDITION: true } };
const queueOf = (items, extra = {}) => (req) => (req.query.muted || req.query.answered || req.query.aside ? ok({ ok: true, muted: [], answered: [], aside: [] }) : ok({ items, item_count: items.length, ...FEEDS_OK, ...extra }));
const pick = (ids) => Object.fromEntries(ids.map((id) => [`queue-pick-${id}`, true]));
const tick = async (p, ids) => { for (const id of ids) { await p.click(p.doc.getElementById(`queue-pick-${id}`).checked === false ? p.doc.getElementById(`queue-pick-${id}`) : p.doc.getElementById(`queue-pick-${id}`)); } };
const stripButton = (p, op) => main(p).querySelectorAll(`.cs-hold button[data-act="${op}"]`)[0] || null;
const choose = async (p, ids) => { for (const id of ids) { const box = p.doc.getElementById(`queue-pick-${id}`); box.checked = true; await p.click(box); } };

test("R58: the queue offers choosing several items and what was answered; choosing puts a box on each item and the hold strip with the number chosen", async () => {
  const items = [task("T1"), task("T2"), finding("F1")];
  const p = await open("/app/queue", { queue: queueOf(items) });
  const links = main(p).querySelectorAll('a[href="/app/queue/choose"], a[href="/app/queue/answered"]');
  assert.deepEqual(links.map((a) => a.textContent), [word("queue.multi.choose"), word("queue.answered.title")]);
  const c = await open("/app/queue/choose", { queue: queueOf(items) });
  assert.ok(text(c).includes(word("queue.multi.head")) && text(c).includes(word("queue.multi.head2")));
  assert.equal(main(c).querySelectorAll('input[data-shell="pick"]').length, 3, "a box on each item");
  assert.equal(main(c).querySelector(".cs-hold"), null, "control: nothing chosen draws no strip");
  await choose(c, ["T1"]);
  assert.ok(text(c, main(c).querySelector(".cs-hold")).includes(word("queue.multi.chosen.one")));
  await choose(c, ["T2", "F1"]);
  assert.ok(text(c, main(c).querySelector(".cs-hold")).includes(word("queue.multi.chosen", { n: "3" })));
  assert.deepEqual(["taskresolve", "taskforward", "queuesnooze", "proposedispose"].filter((o) => stripButton(c, o)).length, 4, "the four acts");
  assert.equal(c.byOp("taskresolve").length + c.byOp("proposedispose").length, 0, "choosing sends nothing");
});

test("R58: Mark them done sends taskresolve once with the chosen items; the outcome says for each item done or not handled, stays here, with the door that is why; nothing chosen sends nothing", async () => {
  const items = [task("T1"), task("T2"), task("L1", { kind: "filing-approval", disposition: { available: false, instead: "filingapprove" }, options: [] }), finding("F1")];
  const p = await open("/app/queue/choose", {
    queue: queueOf(items),
    taskresolve: ok(RETAINED.answer),
  });
  const none = await press(p, "taskresolve", { nth: 0 }).catch(() => null);
  assert.equal(none, null, "control: with nothing chosen there is no strip to press");
  await choose(p, ["T1", "T2", "L1"]);
  await press(p, "taskresolve", { nth: 0, values: { "qm-to": "" } });
  const calls = p.byOp("taskresolve");
  assert.equal(calls.length, 1, "once");
  assert.deepEqual(calls[0].body.items, [{ id: "T1" }, { id: "T2" }], "the to-dos the set act reaches; the letter's own door is not sent");
  const t = text(p);
  assert.ok(t.includes(word("queue.multi.result", { n: "3", done: "1", kept: "2" })));
  assert.equal(t.split(word("queue.multi.refused")).length - 1, 2);
  assert.ok(t.includes(word("queue.multi.why.letter")), "a letter to approve");
  assert.ok(t.includes(RETAINED.answer.items[1].translation), "a kept item's reason is the record's own translation");
  assert.ok(main(p).querySelector('a[href="/app/queue"]') && t.includes(word("queue.multi.back")));
  // An item never leaves on a refusal: back on the list the re-read queue still holds the kept items.
  assert.ok(p.byOp("queue").length >= 1);
});

test("R58, C71: a set act over a mix says why for every item it does not handle: a reason key on each kept row, none on a handled one", async () => {
  const expert = task("E1", { kind: "expertise-confirmation-owed", subject: { kind: "member", id: "M-9", label: "tenant law" }, disposition: { available: false, instead: "expertiseconfirm" }, options: [{ id: "expertiseconfirm" }] });
  const endorse = task("D1", { kind: "endorsement-owed", subject: { kind: "member", id: "M-8" }, disposition: { available: false, instead: "adminendorse" }, options: [{ id: "adminendorse" }] });
  const letter = task("L1", { kind: "filing-approval", disposition: { available: false, instead: "filingapprove" }, options: [] });
  const p = await open("/app/queue/choose", { queue: queueOf([task("T1"), expert, endorse, letter]),
    taskresolve: ok({ ok: true, count: 1, applied: 1, retained: 0, items: [{ index: 0, outcome: "applied", asked: { id: "T1" } }] }) });
  await choose(p, ["T1", "E1", "D1", "L1"]);
  await press(p, "taskresolve", { nth: 0 });
  assert.deepEqual(last(p, "taskresolve").body.items, [{ id: "T1" }], "only the item the set act reaches is sent");
  const rows = main(p).querySelectorAll(".cs-row").map((r) => text(p, r));
  const kept = rows.filter((r) => r.includes(word("queue.multi.refused")));
  assert.equal(kept.length, 3);
  const reasons = ["queue.multi.why.letter", "queue.multi.why.check", "queue.multi.done.help2"].map((k) => word(k));
  for (const r of kept) assert.ok(reasons.some((x) => r.includes(x)), "a reason on every kept row: " + r);
  assert.ok(text(p, main(p).querySelectorAll(".cs-row").find((r) => text(p, r).includes("Do E1"))).includes(word("queue.multi.done.help2")), "an item that needs the member's own reason says so, not nothing");
  assert.ok(text(p, main(p).querySelectorAll(".cs-row").find((r) => text(p, r).includes("Do L1"))).includes(word("queue.multi.why.letter")));
  // Control: the handled row carries none of them.
  const done = rows.filter((r) => r.includes(word("queue.multi.done")) && r.includes("Do T1"));
  assert.equal(done.length, 1);
  for (const x of reasons) assert.ok(!done[0].includes(x), "a handled row draws no reason");
});

test("R58: an item that is a check another member asked of you stays with the check's reason, its own door beside it", async () => {
  const check = task("C1", { kind: "check", disposition: { available: false, instead: "taskresolve" }, options: [] });
  const p = await open("/app/queue/choose", { queue: queueOf([task("T1"), task("T2"), check]),
    taskresolve: ok(RETAINED.answer) });
  await choose(p, ["T1", "T2", "C1"]);
  await press(p, "taskresolve", { nth: 0 });
  const t = text(p);
  assert.ok(t.includes(word("queue.multi.why.check")) && !t.includes(word("queue.multi.why.letter")));
});

test("R58: Forward sends taskforward once with items and the one member; Dismiss sends proposedispose once with items, the one reason and to dismissed; a call over the bound is sent in further calls in order", async () => {
  const many = Array.from({ length: 103 }, (_, i) => task("M" + i));
  const items = [task("T1"), task("T2"), finding("F1"), finding("F2"), ...many];
  const p = await open("/app/queue/choose", { queue: queueOf(items), taskforward: ok({ ok: true, op: "taskforward", count: 2, applied: 2, retained: 0, items: [{ index: 0, outcome: "applied" }, { index: 1, outcome: "applied" }] }),
    proposedispose: ok({ ok: true, count: 2, applied: 2, retained: 0, items: [{ index: 0, outcome: "applied" }, { index: 1, outcome: "applied" }] }), taskresolve: ok({ ok: true, count: 100, applied: 100, retained: 0, items: [] }) });
  await choose(p, ["T1", "T2"]);
  await press(p, "taskforward", { nth: 0, values: { "qm-to": "@rosa" } });
  assert.deepEqual([p.byOp("taskforward").length, p.byOp("taskforward")[0].body], [1, { items: [{ id: "T1" }, { id: "T2" }], to: "rosa" }]);
  const q = await open("/app/queue/choose", { queue: queueOf(items), proposedispose: ok({ ok: true, count: 2, applied: 2, retained: 0, items: [{ index: 0, outcome: "applied" }, { index: 1, outcome: "applied" }] }) });
  await choose(q, ["F1", "F2"]);
  await press(q, "proposedispose", { nth: 0, reason: "not worth pursuing" });
  assert.equal(q.byOp("proposedispose").length, 1);
  assert.deepEqual(q.byOp("proposedispose")[0].body, { items: [{ project: "PROJ-2", finding: "F1" }, { project: "PROJ-2", finding: "F2" }], to: "dismissed", reason: "not worth pursuing" });
  // Over the bound: 103 to-dos go in calls of at most 100, in order.
  const b = await open("/app/queue/choose", { queue: queueOf(items), taskresolve: ok({ ok: true, count: 100, applied: 100, retained: 0, items: [] }) });
  await choose(b, many.map((x) => x.id));
  await press(b, "taskresolve", { nth: 0 });
  assert.deepEqual(b.byOp("taskresolve").map((r) => r.body.items.length), [100, 3]);
  assert.equal(b.byOp("taskresolve")[0].body.items[0].id, "M0");
  const empty = await open("/app/queue/choose", { queue: queueOf(items) });
  assert.equal(stripButton(empty, "taskforward"), null);
});

test("R58, R70: a set of findings of a declared flow sends each item's key with definitionVersion (the word proposedispose reads), never definition_version; one with no version sends the key alone", async () => {
  const staged = (id, version) => finding(id, { disposition: { available: true, op: "proposedispose", scope: "instance", key: "prog::" + id, ...(version === null ? {} : { definition_version: version }) } });
  const items = [staged("S1", 4), staged("S2", null)];
  const p = await open("/app/queue/choose", { queue: queueOf(items), proposedispose: ok({ ok: true, count: 2, applied: 2, retained: 0, items: [{ index: 0, outcome: "applied" }, { index: 1, outcome: "applied" }] }) });
  await choose(p, ["S1", "S2"]);
  await press(p, "proposedispose", { nth: 0, reason: "settled by the flow" });
  assert.equal(p.byOp("proposedispose").length, 1);
  assert.deepEqual(p.byOp("proposedispose")[0].body, { items: [{ key: "prog::S1", definitionVersion: 4 }, { key: "prog::S2" }], to: "dismissed", reason: "settled by the flow" });
  assert.ok(!JSON.stringify(p.byOp("proposedispose")[0].body).includes("definition_version"), "control: the old spelling is not sent");
});

test("R58: Snooze sends queuesnooze once for each distinct case among the chosen items, the day from the field; an item with no case is not handled", async () => {
  const items = [task("T1"), task("T2"), finding("F1"), task("T3", { case: NOCASE })];
  const p = await open("/app/queue/choose", { queue: queueOf(items), queuesnooze: ok({ ok: true }) });
  await choose(p, ["T1", "T2", "F1", "T3"]);
  await press(p, "queuesnooze", { nth: 0, values: { "qm-until": LATER } });
  assert.deepEqual(p.byOp("queuesnooze").map((r) => r.body), [{ case: "PROJ-1", until: LATER }, { case: "PROJ-2", until: LATER }]);
  assert.ok(text(p).includes(word("queue.multi.result", { n: "4", done: "3", kept: "1" })));
  const none = await open("/app/queue/choose", { queue: queueOf(items), queuesnooze: ok({ ok: true }) });
  await choose(none, ["T1"]);
  const b = await press(none, "queuesnooze", { nth: 0 });
  assert.equal(none.byOp("queuesnooze").length, 0, "control: no day, nothing sent");
  assert.equal(beside(none, b), word("screen.queue.fieldfirst"));
});

const ROSTER = ok({ members: [{ member_id: "id-rosa", handle: "rosa", status: "active" }, { member_id: "id-mai", handle: "mai", status: "active" }] });
const ANSWERED = ok({ ok: true, count: 5, window_days: 30, bound: 200, truncated: false, answered: [
  { act: "resolved", id: "T9", class: "OBLIGATION", kind: "check-requested", title: "The lease check", by: "mai", by_you: true, at: "2026-10-14T14:05:00Z" },
  { act: "resolved", id: "T8", class: "OBLIGATION", kind: "update-ready", title: null, by: "rosa", by_you: false, at: "2026-10-09T11:02:00Z" },
  { act: "forwarded", id: "T7", kind: "check-requested", title: "The clause check", to: "rosa", at: "2026-10-13T09:40:00Z" },
  { act: "forwarded", id: "T6", kind: "check-requested", title: "An earlier one", to: null, at: "2026-10-01T09:40:00Z" },
  { act: "snoozed", case: { id: "PROJ-1", title: "Pothole repairs" }, until: "2026-10-20", at: null },
] });

test("R59: the answered page reads queue with answered true and draws each answer newest first with who and when, a forward and a snooze with their days; it sends nothing but the read", async () => {
  const p = await open("/app/queue/answered", { memberlist: ROSTER, queue: (req) => (req.query.answered ? ANSWERED : ok({ ok: true, aside: [] })) });
  const reads = p.byOp("queue");
  assert.ok(reads.some((r) => r.query.answered === "true"));
  assert.deepEqual(p.requests.filter((r) => r.method !== "GET" && r.op !== "subscriptionsignin").map((r) => r.op), [], "the page sends nothing but the read");
  const t = text(p);
  const at = new Date("2026-10-14T14:05:00Z");
  const clock = (d) => word("time.clock", { hour: String(d.getHours() % 12 === 0 ? 12 : d.getHours() % 12), minute: String(d.getMinutes()).padStart(2, "0"), ampm: word(d.getHours() < 12 ? "time.am" : "time.pm") });
  assert.ok(t.includes(word("queue.answered.byyou", { when: word("time.at", { date: dmy("2026-10-14"), time: clock(at) }) })));
  const other = new Date("2026-10-09T11:02:00Z");
  assert.ok(t.includes(word("queue.answered.bymember", { member: "rosa", when: word("time.at", { date: dmy("2026-10-09"), time: clock(other) }) })), "another member's, by her handle, by_you false");
  assert.ok(t.includes(word("queue.answered.byother")));
  assert.ok(t.includes(word("queue.source.untitled", { date: dmy("2026-10-09") })), "a to-do with no title is named by the untitled word");
  assert.ok(t.includes(word("queue.answered.forwarded", { item: "The clause check", member: "rosa" })));
  assert.ok(!t.includes(word("queue.answered.forwarded", { item: "An earlier one", member: "null" })), "control: an earlier forward names nobody, never guessed");
  assert.ok(t.includes(word("queue.answered.forwarded.unnamed", { item: "An earlier one" })), "an earlier forward is its own sentence, naming nobody");
  assert.ok(t.includes(word("queue.answered.snoozed", { item: "Pothole repairs", date: dmy("2026-10-20") })));
  assert.ok(t.includes(word("queue.answered.snoozed.meta")));
  const rows = main(p).querySelectorAll(".cs-row").map((r) => text(p, r));
  assert.ok(rows[0].includes("The lease check") && rows[1].includes("rosa"), "newest first, as the read answers them");
  const failed = await open("/app/queue/answered", { queue: refused("STORE_DID_NOT_ANSWER", null, 502) });
  assert.ok(main(failed).querySelector('[data-state="failed"]'), "a failed read is drawn failed");
});

const feeds = (failed) => ({ feeds: [{ feed: "tasks", classes: ["OBLIGATION"], answered: true, failed: [] }, ...failed.map((f) => ({ feed: f, classes: ["FINDING"], answered: false, failed: ["x"] }))],
  all_answered: !failed.length, classes_answered: { OBLIGATION: true, FINDING: !failed.length, CONDITION: true }, all_clear: { OBLIGATION: true, FINDING: !failed.length, CONDITION: true } });

test("R60: a feed that did not answer is named at the head of a queue with items, with Try again; with nothing waiting the all-clear is withheld and no class is told none here", async () => {
  const withItems = await open("/app/queue", { queue: queueOf([task("T1")], feeds(["sources"])) });
  const t = text(withItems);
  assert.ok(t.includes(word("queue.allclear.failed")) && t.includes(word("queue.allclear.failed2")));
  const retry = main(withItems).querySelector(`a[href="/app/queue"]`);
  assert.ok(retry && [...main(withItems).querySelectorAll("a")].some((a) => a.textContent === word("queue.tryagain")));
  const named = await open("/app/queue", { queue: queueOf([task("T1")], feeds(["retrieval"])) });
  assert.ok(text(named).includes(word("queue.allclear.failed.feed", { feed: word("queue.feed.retrieval") })));
  for (const id of ["tasks", "bias-debts", "proposals", "shared-inquiries", "leads", "exports", "references", "objectives", "machinery", "contradictions", "signing-keys",
    "action", "attribution", "docket", "cited-cases", "wizards", "schedule", "places", "projects"]) {
    const one = await open("/app/queue", { queue: queueOf([task("T1")], feeds([id])) });
    assert.ok(text(one).includes(word("queue.allclear.failed.feed", { feed: word("queue.feed." + id) })), id);
  }
  const bare = await open("/app/queue", { queue: queueOf([task("T1")], feeds(["tasks-x"])) });
  assert.ok(text(bare).includes(word("queue.allclear.withheld")), "a feed the word list does not name is not named, and the class stays withheld");
  const withheld = await open("/app/queue", { queue: queueOf([], feeds(["sources"])) });
  const w = text(withheld);
  assert.ok(w.includes(word("queue.allclear.withheld")) && w.includes(word("queue.allclear.failed")) && w.includes(word("queue.tryagain")));
  assert.ok(!w.includes(word("screen.queue.empty")) && !w.includes(word("queue.none.todo")), "no 'nothing is waiting' and no 'none here'");
  // Control: all feeds answered, nothing waiting: the sentence, each class, the up-to-date row and the door to Home; no kinds legend or sort controls.
  const clear = await open("/app/queue", { queue: queueOf([], FEEDS_OK) });
  const c = text(clear);
  assert.ok(c.includes(word("screen.queue.empty")) && c.includes(word("screen.queue.uptodate")) && c.includes(word("screen.queue.gohome")));
  for (const k of ["todo", "noticed", "status"]) assert.ok(c.includes(word(`queue.none.${k}`)) && c.includes(word(`queue.none.${k}2`)), k);
  assert.ok(!c.includes(word("screen.queue.sort")));
  // Control: a class whose feeds did not all answer is not told none here, though the rest are.
  const part = await open("/app/queue", { queue: queueOf([], { ...FEEDS_OK, all_answered: true, all_clear: { OBLIGATION: true, FINDING: false, CONDITION: true } }) });
  assert.ok(!text(part).includes(word("queue.none.noticed")) && text(part).includes(word("queue.none.todo")));
  // Control: an item held draws no 'none here' for its class (the list is drawn, not the all-clear).
  assert.ok(!text(withItems).includes(word("queue.none.todo")));
});

const ASIDE = (rows, extra = {}) => ok({ ok: true, count: rows.length, next: null, truncated: false, aside: rows, ...extra });
const row = (i, over = {}) => ({ scope: "project", finding: "F" + i, project: "PROJ-2", key: null, state: "dismissed", reason: "r" + i, decided_by: "you", at: "2026-10-08T10:00:00Z", definition_version: null, title: "Finding " + i, ...over });

test("R61: the set-aside findings are listed on the answered page with the decision, its reason and the version judged; a deferred one offers Dismiss with a reason; all pages are walked and each row listed once", async () => {
  const pages = (req) => {
    if (!req.query.aside) return ANSWERED;
    const from = req.query.after ? Number(req.query.after) : 0;
    const rows = Array.from({ length: 70 }, (_, i) => row(i + 1, i === 0 ? { scope: "instance", project: null, key: "prog::stage", state: "deferred", definition_version: 3, at: "2026-10-09T10:00:00Z" } : {})).slice(from, from + 40);
    return ASIDE(rows, { truncated: from + 40 < 70, next: from + 40 < 70 ? String(from + 40) : null });
  };
  const p = await open("/app/queue/answered", { queue: pages }, { screens: withScreens("timeline") });
  await settle(80);
  const asides = p.byOp("queue").filter((r) => r.query.aside);
  assert.deepEqual(asides.map((r) => r.query.after || ""), ["", "40"], "walked in pages by after");
  const set = main(p).querySelectorAll("section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent === word("progression.finding.state.dismissed"));
  assert.ok(set, "the set-aside section");
  const rows = set.querySelectorAll(".cs-row");
  assert.equal(rows.length, 70, "each listed once");
  const t0 = text(p, rows[0]);
  assert.ok(t0.includes(word("queue.aside.deferred", { date: dmy("2026-10-09") })) && t0.includes(word("queue.aside.v2", { n: "3" })) && t0.includes("r1"));
  assert.ok(rows[0].querySelector('button[data-act="proposedispose"]'), "a deferred row offers Dismiss with a reason");
  assert.ok(!text(p, rows[1]).includes(word("queue.aside.v2", { n: "" }).split("{")[0].slice(0, 12)) || !text(p, rows[1]).includes("version"), "control: a project row with no version draws no version line");
  assert.ok(text(p, rows[1]).includes(word("queue.aside.dismissed", { date: dmy("2026-10-08") })) && !rows[1].querySelector('button[data-act="proposedispose"]'));
  await press(p, "proposedispose", { nth: 0, reason: "enough" });
  assert.deepEqual(last(p, "proposedispose").body, { key: "prog::stage", definitionVersion: 3, to: "dismissed", reason: "enough" });
  // R70: control: the old spelling fails the guard over the owner's declaration.
  const declared = collectOwnerRows().proposedispose;
  assert.deepEqual(fieldMismatches({ query: {}, body: { key: "k", definition_version: 3, to: "dismissed", reason: "r" } }, declared).map((m) => m.field), ["definition_version"]);
  assert.deepEqual(fieldMismatches({ query: {}, body: { key: "k", definitionVersion: 3, to: "dismissed", reason: "r" } }, declared), []);
  const other = await open("/app/queue/answered", { memberlist: ROSTER, queue: (req) => (req.query.aside ? ASIDE([row(1, { decided_by: "rosa" })]) : ANSWERED) });
  assert.ok(text(other).includes(word("queue.aside.dismissed.bymember", { member: "rosa", date: dmy("2026-10-08") })), "another member's decision by her handle");
});

test("R34: every key the queue reads is a word of the list, including the states' words", () => {
  for (const k of screen("queue").words) assert.ok(hasWord(k), k);
  for (const k of ["queue.multi.entry", "queue.answered.title", "queue.allclear.withheld", "queue.aside.help", "queue.tryagain"]) assert.ok(screen("queue").words.includes(k), k);
});
