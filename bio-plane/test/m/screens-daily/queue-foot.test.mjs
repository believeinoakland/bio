/* The queue's foot and its acknowledgements (R50), titles on real items (R49) and Home's counts (R51) on the real served page over the REAL
   store (store-request's `storeWorld()`, op-tables §5.3): the team, its members, projects, documents, to-dos, mutes, invitations and
   questions are made by the real acts, and every answer the page reads is the real store's. Every sentence is asserted as
   `word(key, vars)` (R34): no test here holds a sentence's English. */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { hex, instant, resultOf } from "../store-request/door.mjs";
import { open as openRaw, ok, text, ops, press, last, main, word, withScreens, dmy, settle } from "./page.mjs";

const timeout = { timeout: 240000 };
const open = (w, as, path, plane = {}, o = {}) => openRaw(path, plane, { ...w.boot(as), screens: withScreens("document", "question", "project", "action", "dash-project", "members"), ...o });
const NOCASE = { ungrouped: true, ancestors: [] };

const tipOf = (el) => el.getAttribute("data-tip");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** A world with rosa (administrator, owner of every project made here) and mai (a member). */
async function world() {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const mai = await w.signIn("mai");
  return { w, rosa, mai };
}
/** A first visit to Home: the page reads `lookedsince`, which the store answers `null` once and then records, so a later visit is not a first (R11). */
async function firstVisit(w, as) {
  await open(w, as, "/app");
  await settle();
}
/** `mai` joins `project` (rosa invites her; she joins), by the real acts. */
async function join(rosa, mai, project) {
  await rosa.act("projectinvite", { query: { projectId: project, handle: mai.handle } });
  await mai.act("projectjoin", { query: { projectId: project } });
}
/** A web page `name` held in `project`, and a check of it asked of `mai` by rosa: a To do in mai's queue (a task of kind check-requested).
 *  Answers the document's bundle id. */
async function todo(w, rosa, mai, project, name, note = "please look") {
  const doc = await w.recipes.page(rosa, name, { project });
  await rosa.act("checkrequest", { body: { target: doc.bundle, member: mai.handle, note } });
  return doc.bundle;
}
/** The world's `queue` answer for `as`, with `extra` items added: only for an item no producer of the real store makes (named where it is used). */
const queueWith = (w, as, extra) => async (req) => {
  const a = await w.boot(as).door(req);
  const r = a.json && a.json.result;
  if (r && Array.isArray(r.items) && !req.query.muted) { r.items = [...r.items, ...extra]; r.item_count = r.items.length; }
  return a;
};


/** A document held with no title (its bundle's title blank), by the real acts `hold` makes (`captureupload`, `allocid`, `promote`). Answers its bundle id. */
async function untitledDoc(w, as, project) {
  const up = await w.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: "a scan with no title", name: "scan" })}`,
    init: { method: "POST", headers: { "content-type": "text/plain" }, body: new TextEncoder().encode("an unlabelled page\n") } }, as);
  const doc = resultOf(up).document;
  const now = instant(w);
  const id = (await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } })).id;
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", 'title: ""', "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    "project: " + project, "---", "", "## Summary", "", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title: "", current_state: "collected", created: now, last_updated: now }, files, register } });
  return made.bundleId || id;
}

test("R50: Muted at the foot lists each kind muted in a project and each item muted on its own, with its date or the undated sentence, and Turn back on sends the unmute", timeout, async () => {
  const { w, rosa, mai } = await world();
  const pothole = await w.recipes.project(rosa, "Pothole repairs"), coliseum = await w.recipes.project(rosa, "Coliseum");
  // A live "Noticed" item with a title to mute on its own: a question both projects draw on, concluded by one (the other is told).
  const doc = await w.recipes.page(rosa, "Seven days source", { project: pothole });
  const q = await w.recipes.question(rosa, pothole, { title: "Seven days", legs: [{ target: doc.bundle, role: "supports" }], draw: true });
  await rosa.act("drawquestion", { query: { project: coliseum, inquiry: q.id, note: "" } });
  await rosa.act("conclude", { query: { target: q.id, project: pothole, reading: "Repaired within seven days.", falsifier: "The work orders show otherwise." } });
  await w.tick(120_000);
  const told = (await rosa.read("queue")).items.find((i) => i.kind === "shared-inquiry-concluded-by-another-project");
  assert.ok(told, "the real queue holds the item to mute");
  // The mutes, by the real act: a kind in each project, and four items (one live, with its title; three not live).
  await rosa.act("queuemute", { body: { case: pothole, kinds: ["step-cost-shared"] } });
  await w.tick(60_000);
  await rosa.act("queuemute", { body: { item: told.id } });
  await w.tick(60_000);
  await rosa.act("queuemute", { body: { case: coliseum, kinds: ["watched-changed"] } });
  await rosa.act("queuemute", { body: { item: "FINDING::x::1" } });
  await rosa.act("queuemute", { body: { item: "FINDING::step-cost-shared::2" } });
  // Rows muted before their instants were kept (queue R55) answer `at: null`: the store's own rows, as such a store holds them.
  w.sql.exec("UPDATE queue_state SET muted_at = NULL WHERE case_id = ?", coliseum);
  const muted = (await rosa.read("queue", { query: { muted: "true" } })).muted;
  const kindRow = muted.find((m) => m.kind === "step-cost-shared" && m.case);
  const titled = muted.find((m) => m.item === told.id);
  assert.equal(muted.length, 5);
  assert.equal(titled.title, told.subject.title, "the live item's mute keeps its subject's title");
  // The two items not live are drawn undated too: the store's `queue_item_mutes.muted_at` is NOT NULL, so no act makes such a row; only
  // the muted list's answer is changed, those two rows' `at` blanked (queue R55's shape for a row with no instant).
  const undated = (req) => w.boot(rosa).door(req).then((a) => { const r = a.json && a.json.result;
    if (r && Array.isArray(r.muted)) for (const m of r.muted) if (m.item === "FINDING::x::1" || m.item === "FINDING::step-cost-shared::2") m.at = null; return a; });
  const p = await open(w, rosa, "/app/queue", { queue: (req) => (req.query.muted ? undated(req) : undefined) });
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent === word("queue.muted.title"));
  assert.ok(sec, "Muted section");
  assert.ok(text(p, sec).includes(word("queue.muted.kind", { kind: word("queue.kind.step-cost-shared"), project: "Pothole repairs" })));
  assert.ok(text(p, sec).includes(word("queue.muted.by", { date: dmy(kindRow.at.slice(0, 10)) })));
  assert.ok(text(p, sec).includes(word("queue.muted.kind", { kind: word("queue.kind.watched-changed"), project: "Coliseum" })));
  assert.equal((text(p, sec).match(new RegExp(word("queue.muted.by.undated").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length, 3, "an undated row never draws a blank date");
  // R61 (2): an item is named by its title, else its kind's plain name, else the shell's unread word; never by its id.
  assert.ok(text(p, sec).includes(word("queue.muted.item", { item: titled.title })));
  assert.ok(text(p, sec).includes(word("queue.muted.item", { item: word("queue.kind.step-cost-shared") })));
  assert.ok(text(p, sec).includes(word("queue.muted.item", { item: word("shell.unread") })));
  assert.ok(!text(p, sec).includes("FINDING::"), "control: no id is drawn");
  assert.equal(sec.querySelectorAll('button[data-act="queuemute"]').length, 5);
  const unmute = sec.querySelectorAll('button[data-act="queuemute"]');
  assert.ok(unmute.every((b) => b.textContent.startsWith(word("queue.muted.unmute"))));
  assert.ok(unmute.some((b) => (b.getAttribute("data-tip") || "").includes(esc(word("act.queuemute.here.queue_kind")))), "a muted kind is turned back on by its own word");
  const at = (pred) => main(p).querySelectorAll('button[data-act="queuemute"]').findIndex(pred);
  await press(p, "queuemute", { nth: at((b) => b.dataset.unmute === "kind" && b.dataset.kind === "step-cost-shared") });
  assert.deepEqual([last(p, "queuemute").body.case, last(p, "queuemute").body.kinds, last(p, "queuemute").body.unmute], [pothole, ["step-cost-shared"], true]);
  assert.ok(!(await rosa.read("queue", { query: { muted: "true" } })).muted.some((m) => m.kind === "step-cost-shared" && m.case), "the real mute is lifted");
  await press(p, "queuemute", { nth: at((b) => b.dataset.unmute === "item") });
  assert.deepEqual([last(p, "queuemute").body.item, last(p, "queuemute").body.unmute], [last(p, "queuemute").body.item, true]);
  assert.ok(last(p, "queuemute").body.item.startsWith("FINDING::"));
  // Control: nothing muted draws no section.
  await join(rosa, mai, pothole);
  await todo(w, rosa, mai, pothole, "Work orders");
  const none = await open(w, mai, "/app/queue");
  await settle();
  assert.ok(text(none).includes("Work orders"), "control: the queue is drawn");
  assert.ok(!text(none).includes(word("queue.muted.title")));
});

test("R50: each item's button names its own act and, after the act, the screen says it has left the queue", timeout, async () => {
  const { w, rosa, mai } = await world();
  const project = await w.recipes.project(rosa, "Pothole repairs");
  await join(rosa, mai, project);
  await todo(w, rosa, mai, project, "Work orders");
  const p = await open(w, mai, "/app/queue");
  const b = main(p).querySelector('button[data-act="taskresolve"]');
  assert.ok(b.textContent.startsWith(word("act.taskresolve.label.queue")));
  assert.ok(!text(p).includes("Act on an item"));
  await press(p, "taskresolve");
  assert.ok(text(p).includes(word("queue.done", { what: word("act.taskresolve.label.queue") })));
  assert.equal((await mai.read("queue")).items.length, 0, "the real to-do has left her queue");
  // Control: an item with no act in the screen's list draws "Open": a signing key a member registered for herself, told to the administrators.
  await w.recipes.signer(mai);
  const o = await open(w, rosa, "/app/queue");
  await settle();
  assert.ok(text(o).includes(word("screen.queue.open")));
});

test("R50: an invitation is drawn by its keys with Join; a team's own passed date is drawn by due.ours.passed, explained, and Home's strip reads it and opens the queue", timeout, async () => {
  const { w, rosa, mai } = await world();
  const library = await w.recipes.project(rosa, "Library hours");
  await rosa.act("projectinvite", { query: { projectId: library, handle: mai.handle } });
  // The team's own passed date: the producer of the real store (action-producers R1) raises it as a CONDITION `action-clock-overdue`, which
  // the page does not read (it reads kind `action-clock-overdue.ours` with `fills`): no act of the world makes the item the page reads, so
  // only this one item is added to the real answer.
  const ours = { id: "OBLIGATION::clock::1", class: "OBLIGATION", kind: "action-clock-overdue.ours", word: "queue.action-clock-overdue.ours.summary", fills: { action: "Letter", date: "3 October" },
    case: NOCASE, subject: { kind: "action", id: "ACT-1" }, summary: "x", due: "2026-10-03", assignee: "mai", options: [], disposition: { instead: "taskresolve" } };
  await firstVisit(w, mai);
  for (const path of ["/app/queue", "/app"]) {
    const p = await open(w, mai, path, { queue: queueWith(w, mai, [ours]) });
    await settle();
    const t = text(p);
    assert.ok(t.includes(word("queue.project-invitation.summary.unnamed", { project: "Library hours" })), path);
    assert.ok(t.includes(word("queue.project-invitation.detail")));
    assert.ok(t.includes(word("act.projectjoin.label.queue")) || t.includes(word("act.projectjoin.label.home")));
    assert.ok(t.includes(word("due.ours.passed", { date: dmy("2026-10-03") })), "the team's own passed date");
    assert.ok(main(p).querySelectorAll("[data-tip]").some((e) => e.getAttribute("data-tip") === word("due.ours.passed_says")), "explained by due.ours.passed_says");
  }
  const home = await open(w, mai, "/app", { queue: queueWith(w, mai, [ours]) });
  await settle();
  const strip = main(home).querySelector(".mk-strip");
  assert.ok(strip.textContent.includes(word("home.strip.ours_passed.one")));
  assert.ok(strip.querySelectorAll("[data-tip]").some((e) => (e.getAttribute("data-tip") || "").includes(esc(word("home.strip.ours_passed.opens")))), "the reading carries its `says`");
  assert.equal(strip.querySelectorAll("a").find((a) => a.textContent.includes(word("home.strip.ours_passed.one"))).getAttribute("href"), "/app/queue");
  // Control: no item of the team's own, no such reading (the real queue holds the invitation alone).
  const none = await open(w, mai, "/app");
  await settle();
  assert.ok(!text(none).includes(word("home.strip.ours_passed.one")));
});

test("R50: \"Start a project\" explains itself on Home by act.promote.here.home, in place of the general act.promote.does", timeout, async () => {
  const w = await storeWorld({ group: null });
  const mai = await w.signIn("mai", { capabilities: ["contribute", "create_projects"] });
  await w.recipes.project(mai, "Mine");
  const p = await open(w, mai, "/app");
  await settle();
  const tip = main(p).querySelector('button[data-act="promote"]').getAttribute("data-tip");
  assert.ok(tip.includes(esc(word("act.promote.here.home"))), "the place's own word, as the kit's `here`");
  assert.ok(!tip.includes(esc(word("act.promote.does"))), "in place of the general one");
  assert.ok(!text(p).includes(word("act.promote.here.home")), "control: not also drawn as a paragraph");
});

test("R49: a queue or Home item names its subject by subject.title, a reference; a subject with no title draws queue.source.untitled with the item's date; no item draws a record id as a title", timeout, async () => {
  const { w, rosa, mai } = await world();
  const project = await w.recipes.project(rosa, "The Coliseum lease");
  await join(rosa, mai, project);
  const titledId = await todo(w, rosa, mai, project, "Work orders FY2025");
  const untitledId = await untitledDoc(w, rosa, project);
  await rosa.act("checkrequest", { body: { target: untitledId, member: mai.handle, note: "please look" } });
  const real = (await mai.read("queue")).items;
  const bare = real.find((i) => i.subject.id === untitledId);
  assert.equal(bare.subject.title, null, "the real subject has no title");
  await firstVisit(w, mai);
  for (const path of ["/app/queue", "/app"]) {
    const p = await open(w, mai, path);
    await settle();
    const refs = main(p).querySelectorAll("a.cs-ref").map((a) => a.textContent);
    assert.ok(refs.includes("Work orders FY2025"), path);
    assert.ok(refs.includes(word("queue.source.untitled", { date: dmy(bare.age.since.slice(0, 10)) })), path + ": the untitled subject's date");
    assert.ok(!refs.some((r) => r.includes(titledId) || r.includes(untitledId)), "no record id as a title");
  }
  // A find over a project names it by its title.
  for (const n of ["Minutes", "Budget"]) await w.recipes.page(rosa, n, { project });
  const f = await open(w, rosa, "/app/find-in/" + project);
  await settle();
  await press(f, "findin", { values: { "findin-kind-people": true }, reason: "r" });
  const scope = last(f, "findin");
  assert.ok(scope, "the find was sent");
  const found = (await rosa.act("findin", { body: scope.body })).scope;
  assert.equal(found.captures, 4, "the real find counts the project's four held documents");
  assert.ok(text(f).includes(word("screen.find-in.scope.project", { project: "The Coliseum lease", count: String(found.captures) })));
  assert.ok(!text(f).includes(project));
});

test("R51 (K4107): the Investigation door names a project: the newest changed, else the first listed; with none it opens projects, never the bare dashboard", timeout, async () => {
  const door = async (w, as) => {
    const p = await open(w, as, "/app");
    await settle();
    return main(p).querySelector('[data-area="investigation"] .h a.cs-ref').getAttribute("href");
  };
  // several: the newest changed
  const a = await world();
  const [p1, p2, p3] = [await a.w.recipes.project(a.rosa, "One"), await a.w.recipes.project(a.rosa, "Two"), await a.w.recipes.project(a.rosa, "Three")];
  await a.w.tick(60_000);
  await a.w.recipes.page(a.rosa, "Newest", { project: p2 });
  const listed = (await a.rosa.read("projectlist")).projects;
  const newest = listed.slice().sort((x, y) => String(y.lastChange).localeCompare(String(x.lastChange)))[0];
  assert.equal(newest.id, p2, "control: the real read puts the change on the second");
  assert.equal(await door(a.w, a.rosa), "/app/dash-project/" + p2, "several: the newest changed");
  assert.ok(p1 && p3);
  // none changed (every project made at one instant): the first listed
  const d = await world();
  await d.w.recipes.project(d.rosa, "Alpha");
  await d.w.recipes.project(d.rosa, "Beta");
  const first = (await d.rosa.read("projectlist")).projects[0].id;
  assert.equal(await door(d.w, d.rosa), "/app/dash-project/" + first, "none changed: the first listed");
  // one: the first listed
  const b = await world();
  const only = await b.w.recipes.project(b.rosa, "Only");
  assert.equal(await door(b.w, b.rosa), "/app/dash-project/" + only, "one: the first listed");
  // none: the projects, not the bare dashboard
  const c = await world();
  await c.w.recipes.project(c.rosa, "Elsewhere");
  await c.w.recipes.page(c.mai, "My own notes");   // a document of hers in no project: the block has something to show, and no project to name
  assert.equal(await door(c.w, c.mai), "/app/projects", "no project: projects, not the bare dashboard");
});

test("R51: Home's Investigation block opens the investigation dashboard and its project is a reference; Home's member count equals Members', the founder once", timeout, async () => {
  const { w, rosa, mai } = await world();
  const founder = await w.signIn("founder");
  await founder.act("memberadd", { body: { memberId: "kay", cover: "the world's member kay" } });   // invited, not yet a member who has joined
  const project = await w.recipes.project(rosa, "The Coliseum lease");
  await w.recipes.questions(rosa, project, 1);
  const p = await open(w, rosa, "/app");
  await settle();
  const inv = main(p).querySelector('[data-area="investigation"]');
  assert.equal(inv.querySelector("a.cs-ref").getAttribute("href"), "/app/dash-project/" + project);
  assert.ok(inv.querySelectorAll("a.cs-ref").some((a) => a.textContent === "The Coliseum lease" && a.getAttribute("href") === "/app/project/" + project), "its project opens the project");
  const members = main(p).querySelector('[data-area="members"]');
  assert.match(text(p, members), /3\s*[^\d]*members/i);
  assert.match(text(p, members), /2\s*[^\d]*admin/i, "two administrators: the founder and rosa, once each");
  // Control: a block with nothing to show is not drawn (a member of no project).
  const empty = await open(w, mai, "/app");
  await settle();
  assert.ok(!main(empty).querySelector('[data-area="investigation"]'));
});
