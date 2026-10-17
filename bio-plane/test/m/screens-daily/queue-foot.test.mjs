/* The queue's foot and its acknowledgements (R50), titles on real items (R49) and Home's counts (R51) on the real served page
   (interface-shell's harness). Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { open as openRaw, ok, text, ops, press, last, main, word, withScreens, MEMBER, dmy } from "./page.mjs";
import { ADMIN } from "../interface-shell/harness.mjs";

const open = (path, plane, o = {}) => openRaw(path, plane, { screens: withScreens("document", "question", "project", "action", "dash-project", "members"), ...o });
const NOCASE = { ungrouped: true, ancestors: [] };
const MUTED = ok({ ok: true, count: 3, muted: [
  { kind: "step-cost-shared", case: { id: "PROJ-1", title: "Pothole repairs" }, at: "2026-10-05T10:00:00Z" },
  { kind: "watched-changed", case: { id: "PROJ-2", title: "Coliseum" }, at: null },
  { item: "FINDING::x::1", class: "FINDING", at: null },
] });
const queueOf = (items, muted = MUTED) => (req) => (req.query.muted ? muted : ok({ items, item_count: items.length }));

test("R50: Muted at the foot lists each kind muted in a project and each item muted on its own, with its date or the undated sentence, and Turn back on sends the unmute", async () => {
  const p = await open("/app/queue", { queue: queueOf([{ id: "TSK-1", class: "OBLIGATION", kind: "check", case: NOCASE, summary: "Do a thing", options: [], disposition: { instead: "taskresolve" } }]) });
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent === word("queue.muted.title"));
  assert.ok(sec, "Muted section");
  assert.ok(text(p, sec).includes(word("queue.muted.kind", { kind: word("queue.kind.step-cost-shared"), project: "Pothole repairs" })));
  assert.ok(text(p, sec).includes(word("queue.muted.by", { date: dmy("2026-10-05") })));
  assert.ok(text(p, sec).includes(word("queue.muted.kind", { kind: word("queue.kind.watched-changed"), project: "Coliseum" })));
  assert.equal((text(p, sec).match(new RegExp(word("queue.muted.by.undated").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 2, "an undated row never draws a blank date");
  assert.ok(text(p, sec).includes(word("queue.muted.item", { item: "FINDING::x::1" })));
  assert.equal(sec.querySelectorAll('button[data-act="queuemute"]').length, 3);
  const unmute = sec.querySelectorAll('button[data-act="queuemute"]');
  assert.ok(unmute.every((b) => b.textContent.startsWith(word("queue.muted.unmute"))));
  const at = (pred) => main(p).querySelectorAll('button[data-act="queuemute"]').findIndex(pred);
  await press(p, "queuemute", { nth: at((b) => b.dataset.unmute === "kind" && b.dataset.kind === "step-cost-shared") });
  assert.deepEqual([last(p, "queuemute").body.case, last(p, "queuemute").body.kinds, last(p, "queuemute").body.unmute], ["PROJ-1", ["step-cost-shared"], true]);
  await press(p, "queuemute", { nth: at((b) => b.dataset.unmute === "item") });
  assert.deepEqual([last(p, "queuemute").body.item, last(p, "queuemute").body.unmute], ["FINDING::x::1", true]);
  // Control: nothing muted draws no section; a failed read of it is drawn failed.
  const none = await open("/app/queue", { queue: queueOf([{ id: "TSK-1", class: "OBLIGATION", kind: "check", case: NOCASE, summary: "Do a thing", options: [] }], ok({ ok: true, count: 0, muted: [] })) });
  assert.ok(!text(none).includes(word("queue.muted.title")));
});

test("R50: each item's button names its own act and, after the act, the screen says it has left the queue", async () => {
  let items = [{ id: "TSK-1", class: "OBLIGATION", kind: "check", case: NOCASE, summary: "Do a thing", options: [], disposition: { instead: "taskresolve" }, subject: { kind: "bundle", id: "INF-1", title: "Work orders" } }];
  const p = await open("/app/queue", { queue: (req) => (req.query.muted ? ok({ ok: true, muted: [] }) : ok({ items, item_count: items.length })), taskresolve: () => { items = []; return ok({ ok: true }); } });
  const b = main(p).querySelector('button[data-act="taskresolve"]');
  assert.ok(b.textContent.startsWith(word("act.taskresolve.label.queue")));
  assert.ok(!text(p).includes("Act on an item"));
  await press(p, "taskresolve");
  assert.ok(text(p).includes(word("queue.done", { what: word("act.taskresolve.label.queue") })));
  // Control: an item with no act in the screen's list draws "Open".
  const o = await open("/app/queue", { queue: queueOf([{ id: "TSK-2", class: "OBLIGATION", kind: "check", case: NOCASE, summary: "x", options: [{ id: "steps" }], subject: { kind: "bundle", id: "INF-1", title: "Work orders" } }], ok({ ok: true, muted: [] })) });
  assert.ok(text(o).includes(word("screen.queue.open")));
});

test("R50: an invitation is drawn by its keys with Join; a team's own passed date is drawn by due.ours.passed, explained, and Home's strip reads it and opens the queue", async () => {
  const invitation = { id: "OBLIGATION::project-invitation::PROJ-7::mai", class: "OBLIGATION", kind: "project-invitation", case: NOCASE, subject: { kind: "project", id: "PROJ-7", name: "Library hours" },
    summary: "x", detail: "y", basis: { inviter: null }, assignee: "mai", options: [{ id: "projectjoin" }], disposition: { instead: "projectjoin" }, age: { since: "2026-10-10T10:00:00Z" } };
  const ours = { id: "OBLIGATION::clock::1", class: "OBLIGATION", kind: "action-clock-overdue.ours", word: "queue.action-clock-overdue.ours.summary", fills: { action: "Letter", date: "3 October" },
    case: NOCASE, subject: { kind: "action", id: "ACT-1" }, summary: "x", due: "2026-10-03", assignee: "mai", options: [], disposition: { instead: "taskresolve" } };
  for (const path of ["/app/queue", "/app"]) {
    const p = await open(path, { queue: queueOf([invitation, ours], ok({ ok: true, muted: [] })), projectlist: ok({ ok: true, projects: [] }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
      groupidentity: ok({ ok: true, display_name: "Lakeshore" }), startfrom: ok({ ok: true, scripts: [], doors: [] }) });
    const t = text(p);
    assert.ok(t.includes(word("queue.project-invitation.summary.unnamed", { project: "Library hours" })), path);
    assert.ok(t.includes(word("queue.project-invitation.detail")));
    assert.ok(t.includes(word("act.projectjoin.label.queue")) || t.includes(word("act.projectjoin.label.home")));
    assert.ok(t.includes(word("due.ours.passed", { date: dmy("2026-10-03") })), "the team's own passed date");
    assert.ok(main(p).querySelectorAll("[data-tip]").some((e) => e.getAttribute("data-tip") === word("due.ours.passed_says")), "explained by due.ours.passed_says");
  }
  const home = await open("/app", { queue: queueOf([ours], ok({ ok: true, muted: [] })), projectlist: ok({ ok: true, projects: [] }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
    groupidentity: ok({ ok: true, display_name: "Lakeshore" }), startfrom: ok({ ok: true, scripts: [], doors: [] }) });
  const strip = main(home).querySelector(".mk-strip");
  assert.ok(strip.textContent.includes(word("home.strip.ours_passed.one")));
  assert.equal(strip.querySelectorAll("a").find((a) => a.textContent.includes(word("home.strip.ours_passed.one"))).getAttribute("href"), "/app/queue");
  // Control: no item of the team's own, no such reading.
  const none = await open("/app", { queue: queueOf([], ok({ ok: true, muted: [] })), projectlist: ok({ ok: true, projects: [] }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
    groupidentity: ok({ ok: true, display_name: "Lakeshore" }), startfrom: ok({ ok: true, scripts: [], doors: [] }) });
  assert.ok(!text(none).includes(word("home.strip.ours_passed.one")));
});

test("R50: \"Start a project\" explains itself on Home by act.promote.here.home, in place of the general act.promote.does", async () => {
  const p = await open("/app", { whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }), queue: ok({ items: [] }), projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "Mine", participation: "joined" }] }),
    projectquestions: ok({ ok: true, items: [], cursor: null }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }), groupidentity: ok({ ok: true, display_name: "L" }), startfrom: ok({ ok: true, scripts: [{ id: "W", version: 1, name: "n" }], doors: [{ door: "problem", scripts: ["W"] }] }) });
  assert.ok(text(p).includes(word("act.promote.here.home")));
  assert.ok(!text(p).includes(word("act.promote.does")));
});

test("R49: a queue or Home item names its subject by subject.title, a reference; a subject with no title draws queue.source.untitled with the item's date; no item draws a record id as a title", async () => {
  const items = [
    { id: "TSK-1", class: "OBLIGATION", kind: "check", case: NOCASE, summary: "INF-7", subject: { kind: "bundle", id: "INF-7", title: "Work orders FY2025" }, options: [{ id: "taskresolve" }], disposition: { instead: "taskresolve" }, since: "2026-10-04T10:00:00Z" },
    { id: "TSK-2", class: "OBLIGATION", kind: "check", case: NOCASE, summary: "INF-8", subject: { kind: "bundle", id: "INF-8", title: null }, options: [{ id: "taskresolve" }], disposition: { instead: "taskresolve" }, since: "2026-10-04T10:00:00Z" },
  ];
  for (const path of ["/app/queue", "/app"]) {
    const plane = { queue: queueOf(items.map((i) => ({ ...i, assignee: "mai" })), ok({ ok: true, muted: [] })), projectlist: ok({ ok: true, projects: [] }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
      groupidentity: ok({ ok: true, display_name: "L" }), startfrom: ok({ ok: true, scripts: [], doors: [] }) };
    const p = await open(path, plane);
    const refs = main(p).querySelectorAll("a.cs-ref").map((a) => a.textContent);
    assert.ok(refs.includes("Work orders FY2025"), path);
    assert.ok(refs.includes(word("queue.source.untitled", { date: dmy("2026-10-04") })), path + ": the untitled subject's date");
    assert.ok(!refs.some((r) => /^INF-\d+$/.test(r)), "no record id as a title");
  }
  // A find over a project names it by its title.
  const f = await open("/app/find-in/PROJ-1", { projectquestions: ok({ ok: true, items: [], cursor: null }), factstatus: ok({ ok: true, facts: [] }),
    findin: ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 3, title: "The Coliseum lease" }, kinds: [] }), image: ok({ "bundle.md": "no front matter" }) });
  await press(f, "findin", { values: { "findin-kind-people": true }, reason: "r" });
  assert.ok(text(f).includes(word("screen.find-in.scope.project", { project: "The Coliseum lease", count: "3" })));
  assert.ok(!text(f).includes("PROJ-1"));
});

test("R51: Home's Investigation block opens the investigation dashboard and its project is a reference; Home's member count equals Members', the founder once", async () => {
  const roster = ok({ members: [{ member_id: "admin", handle: null, founder: true, role: "admin", status: "active" }, { member_id: "rosa", handle: "rosa", role: "admin", status: "active" },
    { member_id: "mai", handle: "mai", role: "member", status: "active" }, { member_id: "k", handle: "k", role: "member", status: "invited" }] });
  const plane = { whoami: ok({ ...ADMIN, member: "rosa", handle: "rosa" }), queue: ok({ items: [] }), memberlist: roster, bootstrap: ok({ ok: true, version: "0.84.0", claimed: true }),
    projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "The Coliseum lease", stage: "investigating", lastChange: "2026-10-12T15:00:00Z", participation: "joined" }] }),
    projectquestions: ok({ ok: true, items: [{ inquiry: "I1" }], cursor: null }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }), groupidentity: ok({ ok: true, display_name: "L" }),
    startfrom: ok({ ok: true, scripts: [], doors: [] }), profiles: ok({ ok: true, profiles: [] }), grouplanguages: ok({ languages: [] }), aiuseovertime: ok({ periods: [] }) };
  const p = await open("/app", plane);
  const inv = main(p).querySelector('[data-area="investigation"]');
  assert.equal(inv.querySelector("a.cs-ref").getAttribute("href"), "/app/dash-project");
  assert.ok(inv.querySelectorAll("a.cs-ref").some((a) => a.textContent === "The Coliseum lease" && a.getAttribute("href") === "/app/project/PROJ-1"), "its project opens the project");
  const members = main(p).querySelector('[data-area="members"]');
  assert.match(text(p, members), /3\s*[^\d]*members/i);
  assert.match(text(p, members), /2\s*[^\d]*admin/i, "two administrators: the founder and rosa, once each");
  // Control: a block with nothing to show is not drawn.
  const empty = await open("/app", { ...plane, projectlist: ok({ ok: true, projects: [] }), queue: ok({ items: [] }) });
  assert.ok(!main(empty).querySelector('[data-area="investigation"]'));
});
