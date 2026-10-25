/* The queue's findings and buttons (R68, R69, R79) on the real served page: Defer beside Dismiss, a snoozed case held back from the
   list with "Bring back", the helps on an item's buttons, the unkeyed sentence, the snooze day picker, the answered rows and the
   signing key's link to Members. Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { open, ok, text, ops, button, press, beside, last, main, word, withScreens, screen, hasWord, dmy } from "./page.mjs";

const PROJ = (id, title) => ({ state: "determined", ungrouped: false, ancestors: [{ id, type: "project", title, depth: 1 }] });
const NONE = { ungrouped: true, ancestors: [] };
const day = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const FINDING = { id: "FINDING::tension::PROJ-2::x", class: "FINDING", kind: "tension", case: PROJ("PROJ-2", "The Coliseum lease"), subject: { kind: "bundle", id: "INF-8", title: "Lease" },
  summary: "Two filings disagree about the date", options: [], disposition: { available: true, op: "proposedispose", scope: "project", finding: "FINDING::tension::PROJ-2::x", projects: ["PROJ-2"] } };
const TASK = { id: "TSK-1", class: "OBLIGATION", kind: "check-requested", case: PROJ("PROJ-1", "Pothole repairs"), subject: { kind: "bundle", id: "INF-7", title: "Work orders" },
  summary: "Ana asked you to check a calculation", options: [], disposition: { available: false, instead: "taskresolve" } };
const timeout = { timeout: 300000 };
const openW = (w, as, path, plane = {}, o = {}) => open(path, plane, { ...w.boot(as), screens: withScreens("document", "action"), ...o });
/** A team on the REAL store (store-request's `storeWorld()`): rosa (administrator, owner of both projects), mai (a member, joined to both), the projects
 *  "Pothole repairs" and "The Coliseum lease", and the team's time zone (a day is read where the team is). */
async function team() {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const mai = await w.signIn("mai");
  await w.recipes.profiles(rosa, ["oakland-alameda"]);
  const p1 = await w.recipes.project(rosa, "Pothole repairs"), p2 = await w.recipes.project(rosa, "The Coliseum lease");
  for (const p of [p1, p2]) { await rosa.act("projectinvite", { query: { projectId: p, handle: "mai" } }); await mai.act("projectjoin", { query: { projectId: p } }); }
  return { w, rosa, mai, p1, p2 };
}
/** A web page "Doc <name>" held in `project` (in the case: a question of the project rests on it), and a check of it asked of `to` by rosa (her To do).
 *  Answers the document's bundle id. */
async function todo(w, rosa, to, project, name) {
  const doc = await w.recipes.page(rosa, "Doc " + name, { project });
  await w.recipes.question(rosa, project, { title: "About " + name, text: "Is " + name + " so?", legs: [{ target: doc.bundle, role: "supports" }], draw: true });
  await rosa.act("checkrequest", { body: { target: doc.bundle, member: to.handle, note: "please look at " + name } });
  return doc.bundle;
}
const feed = (items, extra = {}) => ({ queue: ok({ items, item_count: items.length, ...extra }) });
const rowOf = (p, id) => main(p).querySelectorAll(".cs-row").find((r) => r.querySelectorAll("button[data-act]").some((b) => b.dataset.item === id));
const tipOf = (el) => el.getAttribute("data-tip") || "";

test("R68: a finding row offers Defer beside Dismiss, each asking the member's reason in place; Defer sends to deferred, Dismiss to dismissed", async () => {
  const p = await open("/app/queue", feed([FINDING]));
  const row = rowOf(p, FINDING.id);
  const buttons = row.querySelectorAll('button[data-act="proposedispose"]');
  assert.deepEqual(buttons.map((b) => b.dataset.to), ["dismissed", "deferred"], "Dismiss, then Defer, beside each other");
  assert.ok(buttons[0].textContent.startsWith(word("act.proposedispose.label.queue")));
  assert.ok(buttons[1].textContent.startsWith(word("screen.queue.defer")), "Defer's own words");
  await press(p, "proposedispose", { nth: 1, reason: "Wait for the clerk" });
  assert.deepEqual(last(p, "proposedispose").body, { project: "PROJ-2", finding: FINDING.id, to: "deferred", reason: "Wait for the clerk" });
  await press(p, "proposedispose", { nth: 0, reason: "Not relevant to us" });
  assert.deepEqual(last(p, "proposedispose").body, { project: "PROJ-2", finding: FINDING.id, to: "dismissed", reason: "Not relevant to us" }, "control: Dismiss still sends dismissed");
});

test("R68: Defer with no reason sends nothing; the reason is asked in place", async () => {
  const p = await open("/app/queue", feed([FINDING]));
  const b = await press(p, "proposedispose", { nth: 1 });
  assert.equal(p.byOp("proposedispose").length, 0, "pressed, the reason is asked first");
  assert.ok(p.doc.getElementById("cs-reason-" + b.getAttribute("data-ai").replace(":", "-")), "its reason box is drawn beside it");
});

const SNOOZED = (until) => ({ ...TASK, id: "TSK-3", summary: "Sign the lease amendment", snoozed: { until, cases: [{ case: "PROJ-1", until }] } });

test("R69: an item of a snoozed case leaves the main list and is listed apart by its case and the day it comes back, with Bring back; Bring back sends the clear", timeout, async () => {
  const { w, rosa, mai, p1, p2 } = await team();
  const later = day(5);
  await todo(w, rosa, mai, p1, "Lease amendment");
  await todo(w, rosa, mai, p2, "Another finding");
  await mai.act("queuesnooze", { body: { case: p1, until: later } });   // the real snooze of the case: the real queue marks its items
  const p = await openW(w, mai, "/app/queue");
  assert.ok(!text(p).includes("Doc Lease amendment"), "the snoozed item is not in the list");
  assert.ok(text(p).includes("Doc Another finding"), "control: an item with no snoozed stays in the list");
  const section = main(p).querySelectorAll("section").find((s) => s.querySelector('button[data-clear]'));
  assert.ok(section, "the snoozed section");
  assert.ok(text(p, section).includes("Pothole repairs"), "the case, by its title");
  assert.ok(text(p, section).includes(word("screen.queue.snoozed.until", { date: dmy(later) })), "the day it comes back");
  assert.equal(text(p, section.querySelector("h2")), word("screen.queue.snoozed.head"), "the section's own heading");
  assert.ok((section.querySelector("h2").getAttribute("data-tip") || "").includes(word("screen.queue.snoozed.holds")), "explained by its own help");
  assert.ok(button(p, "queuesnooze").textContent.startsWith(word("screen.queue.bringback")), "Bring back's own words");
  await press(p, "queuesnooze", {});
  assert.deepEqual(last(p, "queuesnooze").body, { case: p1, clear: "1" });
  assert.ok(text(p).includes("Doc Lease amendment") && !main(p).querySelector('button[data-clear]'), "brought back: it is in the list again");
});

test("R69: with every item snoozed the list holds none and the section remains; a queue with no snoozed item draws no section", async () => {
  const p = await open("/app/queue", feed([SNOOZED(day(4))]));
  assert.ok(main(p).querySelector('button[data-clear]'));
  assert.ok(!text(p).includes("Sign the lease amendment"));
  const none = await open("/app/queue", feed([TASK]));
  assert.ok(!main(none).querySelector('button[data-clear]'));
});

test("R79 (a): an item's own act carries queue.act.dothis.help in its explanation and a separate Open carries queue.act.open.help; Mark it done carries neither", async () => {
  const reminder = { id: "OBLIGATION::action-reminder::ACT-1::0::d", class: "OBLIGATION", kind: "action-reminder", case: PROJ("PROJ-1", "Pothole repairs"),
    subject: { kind: "action", id: "ACT-1", entry: 0 }, summary: "Remind me", options: [], disposition: { instead: "reminderanswer" } };
  const check = { ...TASK, options: [{ id: "cite" }] };
  const p = await open("/app/queue", feed([reminder, check]), { screens: withScreens("document", "action") });
  const own = button(p, "reminderanswer");
  assert.ok(tipOf(own).includes(word("queue.act.dothis.help")), "an item's own act");
  assert.ok(tipOf(own).includes(word("act.reminderanswer.does")), "the act's own explanation is kept");
  const resolve = button(p, "taskresolve");
  assert.ok(resolve.textContent.startsWith(word("act.taskresolve.label.queue")), "the act keeps its name");
  assert.ok(!tipOf(resolve).includes(word("queue.act.dothis.help")), "control: putting an item aside is no act of its own");
  const open1 = rowOf(p, "TSK-1").querySelector('a.cs-btn[data-nav][href="/app/document/INF-7"]');
  assert.equal(open1.textContent, word("screen.queue.open"));
  assert.ok(tipOf(open1).includes(word("queue.act.open.help")), "Open says it opens and resolves nothing");
});

test("R79 (b): a kind with no sentence of its own draws queue.unkeyed.summary with the subject by its title and queue.unkeyed.detail, never an address's file part", async () => {
  const bare = { ...TASK, id: "TSK-8", kind: "some-new-kind", summary: "https://example.org/files/permit-2026.pdf", subject: { kind: "bundle", id: "INF-7", title: "Permit application" } };
  const p = await open("/app/queue", feed([bare]), { screens: withScreens("document") });
  assert.ok(text(p).includes(word("queue.unkeyed.summary", { title: "Permit application" })));
  assert.ok(text(p).includes(word("queue.unkeyed.detail")));
  assert.doesNotMatch(text(p), /permit-2026|https?:/);
  assert.equal(main(p).querySelector('a.cs-ref[href="/app/document/INF-7"]').textContent, "Permit application");
  // Control: an item with its own sentence is unchanged and draws no unkeyed sentence.
  const own = await open("/app/queue", feed([TASK]), { screens: withScreens("document") });
  assert.ok(text(own).includes("Ana asked you to check a calculation") && !text(own).includes(word("queue.unkeyed.detail")));
});

test("R79 (c): Snooze to a date is a date input whose earliest day is tomorrow, helped by screen.queue.snooze.pick; a day before tomorrow is not sent", async () => {
  const p = await open("/app/queue", feed([TASK]));
  const snooze = button(p, "queuesnooze");
  const f = snooze.dataset.f;
  const input = p.doc.getElementById(f + "-until");
  assert.equal(input.getAttribute("type"), "date");
  assert.equal(input.getAttribute("min"), day(1), "tomorrow is the earliest");
  assert.ok(text(p, snooze.closest("details")).includes(word("screen.queue.snooze.pick")));
  const today = await press(p, "queuesnooze", { values: { [f + "-until"]: day(0) } });
  assert.equal(p.byOp("queuesnooze").length, 0, "a day before tomorrow is not sent");
  assert.equal(beside(p, today), word("screen.queue.snooze.pick"));
  const past = await press(p, "queuesnooze", { values: { [f + "-until"]: day(-3) } });
  assert.equal(p.byOp("queuesnooze").length, 0);
  assert.equal(beside(p, past), word("screen.queue.snooze.pick"));
  await press(p, "queuesnooze", { values: { [f + "-until"]: day(1) } });
  assert.deepEqual(last(p, "queuesnooze").body, { case: "PROJ-1", until: day(1) }, "control: tomorrow is sent");
});

/** What the member answered, the REAL store's list with the rows of the acts no producer of the store records added (a dismissal in the old shape, a mute of a
 *  kind, an act the page has no sentence for): the page draws each by its own sentence. */
const answeredWith = (w, as, extra) => async (req) => {
  const a = await w.boot(as).door(req);
  const r = a.json && a.json.result;
  if (r && Array.isArray(r.answered)) { r.answered = [...r.answered, ...extra]; r.count = r.answered.length; }
  return a;
};

test("R79 (d): What you answered draws a done, dismissed (with and without its reason), muted and any other act by its own sentence, never a name and a day alone", timeout, async () => {
  const { w, rosa, mai, p1 } = await team();
  await todo(w, rosa, mai, p1, "Lease check");
  const mine = (await mai.read("queue")).items.find((i) => i.kind === "check-requested" && i.subject.title === "Doc Lease check");
  await mai.act("taskresolve", { body: { id: mine.id } });   // she marks it done
  const p = await openW(w, mai, "/app/queue/answered", { queue: answeredWith(w, mai, [
    { act: "dismissed", title: "A tension", reason: "Not ours", at: "2026-10-13T14:05:00Z" },
    { act: "dismissed", title: "Another tension", reason: "", at: "2026-10-12T14:05:00Z" },
    { act: "muted", kind: "monitoring-recheck-due", at: "2026-10-11T14:05:00Z" },
    { act: "reopened", title: "The old claim", at: "2026-10-10T14:05:00Z" },
  ]) });
  const t = text(p);
  assert.ok(t.includes(word("queue.answered.done", { item: "Doc Lease check" })));
  assert.ok(t.includes(word("queue.answered.dismissed", { item: "A tension", reason: "Not ours" })));
  assert.ok(t.includes(word("queue.answered.dismissed.noreason", { item: "Another tension" })), "no reason kept: its own sentence");
  assert.ok(t.includes(word("queue.answered.muted", { kind: word("queue.kind.monitoring-recheck-due") })));
  assert.ok(t.includes(word("queue.answered.generic", { item: "The old claim" })), "any other act");
  assert.equal(main(p).querySelectorAll(".cs-row").length, 5, "control: a set-aside row is R61's list, not this one");
});

test("R79 (e): the signing key's item draws Open Members, a link to members", async () => {
  const key = { id: "FINDING::signer-self-registered::mai", class: "FINDING", kind: "signer-self-registered", case: NONE, subject: { kind: "key", id: "mai" },
    summary: "A signing key was registered", options: [], disposition: {} };
  const p = await open("/app/queue", feed([key]), { screens: withScreens("account", "members") });
  const link = main(p).querySelectorAll('a[data-nav][href="/app/members"]').find((a) => a.textContent === word("queue.signer-self-registered.members"));
  assert.ok(link, "Open Members");
  const plain = await open("/app/queue", feed([TASK]));
  assert.ok(!main(plain).querySelector('a[href="/app/members"]'), "control: another kind has no such link");
});

test("R34: the words these states read are words of the list and the queue reads them", () => {
  for (const k of ["queue.act.dothis.help", "queue.act.open.help", "queue.unkeyed.summary", "queue.unkeyed.detail", "screen.queue.snooze.pick", "queue.signer-self-registered.members",
    "queue.answered.done", "queue.answered.dismissed", "queue.answered.dismissed.noreason", "queue.answered.muted", "queue.answered.generic", "screen.queue.defer", "screen.queue.bringback", "screen.queue.snoozed.head", "screen.queue.snoozed.holds", "screen.queue.snoozed.until"]) {
    assert.ok(hasWord(k), k);
    assert.ok(screen("queue").words.includes(k), `queue reads ${k}`);
  }
  assert.ok(ops);
});
