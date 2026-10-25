/* screens-daily, T51 fix round 4, wave 2 (K4429, K4437, K4458, K4462): each cause one test written first and seen failing, entered by the
   member's act, with its control. R89 (C22: Find names every place of the frontier, the live mix of kinds), R95 (C70: the Queue says what
   each number counts). Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { storeWorld } from "../store-request/fixtures.mjs";
import { open, ok, text, press, main, settle, dmy, word, MEMBER, withScreens } from "./page.mjs";

/** A page over the REAL store (store-request's `storeWorld()`, op-tables §5.3): the team, its members, projects and captures are made by the real acts. */
const openW = (w, as, path, plane = {}, o = {}) => open(path, plane, { ...w.boot(as), ...o });
const CREATE = ["contribute", "create_projects"];
const hex = (s) => createHash("sha256").update(s).digest("hex");
const stamp = (w) => new Date(w.now()).toISOString().replace(/\.\d{3}Z$/, "Z");

/** A document the member holds, collected and not vouched for, by the real acts: from a public address (`acquire`, the address answered by the
 *  world's network, scripted), then the promotion of its information bundle at `collected`, as the capture screen promotes it. Answers its id. */
async function held(w, as, { title, address, project = "" }) {
  const seen = (w.__scripted ||= new Set());
  if (!seen.has(address)) {
    seen.add(address);
    w.script(address, async () => { const t = w.__title; return new Response(`<html><head><title>${t}</title></head><body><p>${address} ${t}</p></body></html>`, { status: 200, headers: { "content-type": "text/html" } }); });
  }
  w.__title = title;
  const doc = (await as.act("acquire", { body: { locator: address } })).document;
  const now = stamp(w);
  const minted = await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const id = minted.id + "-" + (title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    ...(project ? ["project: " + project] : []), "---", "", "## Summary", "", title || "untitled", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now }, files, register } });
  return made.bundleId || id;
}

const SHA = (c) => c.repeat(64);

/* ---------- R89 (C22): Find names every place the frontier counts, whatever its kind ---------- */

const LEVELS = ["document", "content", "meaning", "internet"];
const GOT = { found: true, built: true, never_looked: [], never_looked_count: 0, tally: { LOOKED_FOUND: 4, LOOKED_ABSENT: 1 }, note: "" };
const rowOf = (p, l) => main(p).querySelectorAll(".cs-row").find((r) => r.querySelector("b") && r.querySelector("b").textContent === word("screen.answers.level." + l));
const itemsOf = (p, l) => rowOf(p, l).querySelectorAll("li").map((li) => li.textContent);

// The live mix (the walker's 78 places): documents with a title, documents with none (some captured the same day), a legislation
// reference and a meeting's, as the meaning level answers them (`subject_kind: "reference"`, the source's own `kind:key`), an entity.
const MIX = {
  document: GOT,
  content: { ...GOT, never_looked_count: 4, never_looked: [
    { subject: SHA("a"), bundle_id: "INF-3", registered: "2026-10-03T10:00:00Z" },
    { subject: SHA("b"), bundle_id: "INF-4", registered: "2026-10-04T10:00:00Z" },
    { subject: SHA("c"), bundle_id: "INF-5", registered: "2026-10-05T10:00:00Z" },
    { subject: SHA("d"), bundle_id: "INF-6" }] },
  meaning: { ...GOT, never_looked_count: 5, never_looked: [
    { subject: "legislation:26-0788", subject_kind: "reference", entered: "2026-09-30T10:00:00Z" },
    { subject: "legislation:26-0790", subject_kind: "reference", entered: "2026-09-30T10:00:00Z" },
    { subject: "meeting:2101", subject_kind: "reference" },
    { subject: SHA("e"), subject_kind: "capture", bundle_id: "INF-4", entered: "2026-10-04T10:00:00Z" },
    { subject: "ENT-0042", subject_kind: "entity", entered: "2026-10-06T10:00:00Z" }] },
  internet: GOT,
};
const planeOf = (per) => ({
  frontier: (req) => ok(per[req.query.level]),
  search: (req) => { const ids = [...String(req.query.q).matchAll(/id:([A-Za-z0-9-]+)/g)].map((m) => m[1]);
    return ok({ total: 1, hits: ids.filter((i) => i === "INF-3").map((i) => ({ bundle_id: i, title: "Council minutes 2024" })) }); },
});

test("R89 R96 (C22, round 4): the member presses 'See where nobody looked' and every place of the live mix is named, no two different places by the same words, none by an id, a digest or the bare kind of thing", async () => {
  const p = await open("/app/finder", planeOf(MIX));
  await press(p, "frontier", { reason: "looking" });
  await settle();
  const content = itemsOf(p, "content");
  assert.equal(content.length, 4, "four places, four names");
  assert.equal(content[0], "Council minutes 2024", "a titled document is named by its title");
  assert.equal(content[1], word("queue.source.untitled", { date: dmy("2026-10-04") }), "an untitled one by the untitled word and the day it was registered");
  assert.equal(content[2], word("queue.source.untitled", { date: dmy("2026-10-05") }));
  assert.equal(content[3], word("shell.card.document"), "an untitled one with no day is the plain word, once");
  const meaning = itemsOf(p, "meaning");
  assert.equal(meaning.length, 5);
  assert.deepEqual(meaning.slice(0, 3), ["legislation 26-0788", "legislation 26-0790", "meeting 2101"], "a reference is named by the identifier its source gave it, kind then key, never `kind:key`");
  assert.equal(meaning[3], word("queue.source.untitled", { date: dmy("2026-10-04") }), "a document with no title that the meaning level counts is named as the content level names it");
  assert.equal(meaning[4], word("shell.card.person"), "an entity is named by what it is");
  for (const l of ["content", "meaning"]) assert.ok(itemsOf(p, l).every((t) => !/[0-9a-f]{64}|INF-\d|ENT-\d|^[a-z-]+:\S/.test(t)), l + ": no digest, id or `kind:key` is drawn");
  const all = [...content, ...meaning].filter((t) => t !== word("shell.card.document") && t !== word("shell.card.person"));
  assert.equal(new Set(all).size, all.length - 1, "no two different places share a name: only the one document counted at two levels repeats");
});

test("R89 (C22, round 4) control: the nine places that name themselves are named as they were; a document counted at a level with its own title asks for no other", async () => {
  const per = { document: { ...GOT, never_looked_count: 2, never_looked: [{ subject: "https://a.example/x" }, { subject: "https://b.example/y" }] }, content: GOT, meaning: GOT, internet: GOT };
  const p = await open("/app/finder", planeOf(per));
  await press(p, "frontier", { reason: "looking" });
  await settle();
  assert.deepEqual(itemsOf(p, "document"), ["https://a.example/x", "https://b.example/y"]);
  assert.equal(p.byOp("search").length, 0);
  assert.ok(text(p).includes(word("screen.finder.nobody", { n: "2" })));
});

/* ---------- R87, R88 (C14, this screen's part): what Home and the Queue read ---------- */

const ROW_IDS = (rows) => rows.map((r) => r.id);
/** A team: rosa (an administrator) with her own project "Pothole repairs" (she takes part in it), and mo's two, "The Coliseum lease" and "Odd" (she is
 *  no participant in them: her roster rows answer `participation: null`). All by the real acts; she has looked at Home before. */
async function roster() {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const mo = await w.signIn("mo", { capabilities: CREATE });
  const coliseum = await w.recipes.project(mo, "The Coliseum lease");
  const pothole = await w.recipes.project(rosa, "Pothole repairs");
  const odd = await w.recipes.project(mo, "Odd");
  await rosa.read("lookedsince");
  return { w, rosa, mo, ids: [coliseum, pothole, odd] };
}
/** The world's own `projectlist` answer with each row's `participation` key taken away (an older roster's rows). */
const withoutParticipation = (w, as) => async (req) => {
  const a = await w.door(req, as);
  const result = a && a.json && a.json.result;
  if (result) for (const r of result.projects || []) delete r.participation;
  return a;
};

test("R87 R98 (C14, this screen): a roster row that answers `participation` (null for an administrator who is no participant) is taken at its word: Home and Projects make no `projectparticipants` read for it; a row that answers none is read once", async () => {
  const { w, rosa, ids } = await roster();
  const rows = (await rosa.read("projectlist")).projects;
  assert.deepEqual(ids.map((id) => rows.find((r) => r.id === id).participation), [null, "joined", null], "the real roster states the viewer's place on every row");
  for (const path of ["/app", "/app/projects"]) {
    const p = await openW(w, rosa, path);
    await settle(80);
    assert.equal(p.byOp("projectparticipants").length, 0, path + ": no per-project read for a row that states the viewer's place");
  }
  const old = await openW(w, rosa, "/app", { projectlist: withoutParticipation(w, rosa) });
  await settle(80);
  assert.deepEqual(old.byOp("projectparticipants").map((r) => r.query.projectId).sort(), [...ids].sort(), "control: a row with no `participation` key is read once");
});

/* ---------- R17 (C25): the vouch to-do names the document the way every other list does ---------- */

const FORM = "https://www.irs.gov/pub/irs-pdf/f1040es.pdf";
const vouchRows = (p) => main(p).querySelectorAll('button[data-act="release"]').map((b) => { let r = b; while (r && !(r.className || "").includes("cs-row")) r = r.parentNode; return r; });
/** A member `mai` who may start projects, has looked at Home before and holds the documents titled `titles` (captured from one place, not vouched for). */
async function holder(titles) {
  const w = await storeWorld({ group: null });
  const mai = await w.signIn("mai", { capabilities: CREATE });
  await mai.read("lookedsince");
  await w.recipes.project(mai, "Tax help");
  const ids = [];
  for (const t of titles) { ids.push(await held(w, mai, { title: t, address: FORM })); w.tick(1000); }
  return { w, mai, ids };
}

for (const [where, path] of [["queue", "/app/queue"], ["home", "/app"]]) {
  test(`R17 R97 (C25; ${where}): a vouch to-do for one capture is the document named by its title, a reference to it, never the address it came from or "photo"; control: several captures at one place and a capture with no title keep the sentences`, { timeout: 240000 }, async () => {
    const one = await holder(["2026 Form 1040-ES"]);
    const p = await openW(one.w, one.mai, path, {}, { screens: withScreens("document") });
    await settle(80);
    const [row] = vouchRows(p);
    assert.ok(row, "the to-do is drawn");
    assert.ok(text(p, row).includes("2026 Form 1040-ES"), "named by the document's title");
    assert.ok(row.querySelectorAll("a").some((a) => a.textContent === "2026 Form 1040-ES" && (a.getAttribute("href") || "").includes(one.ids[0])), "a reference to the document");
    assert.ok(!text(p, row).includes(FORM) && !text(p, row).includes(word("screen.dash-project.next.vouch.one", { place: FORM })), "neither the address nor the photo sentence");
    // Control: two captures at a place are told by their count and place; one with no title keeps the one-capture sentence.
    const twoWorld = await holder(["2026 Form 1040-ES", "Form 1040-ES instructions"]);
    const two = await openW(twoWorld.w, twoWorld.mai, path);
    await settle(80);
    assert.ok(text(two, vouchRows(two)[0]).includes(word("screen.home.todo.vouch", { count: "2", place: FORM })));
    const bareWorld = await holder([""]);
    const bare = await openW(bareWorld.w, bareWorld.mai, path);
    await settle(80);
    assert.ok(text(bare, vouchRows(bare)[0]).includes(word("screen.dash-project.next.vouch.one", { place: FORM })));
  });
}

/* ---------- R28, R49 (C25): an item whose subject has no title yet is named by the one rule from the address it came from ---------- */

const AUTH = (o = {}) => ({ id: "TSK-9", class: "OBLIGATION", kind: "authority-undetermined", assignee: "mai", summary: FORM, case: { ungrouped: true, ancestors: [] },
  subject: { kind: "bundle", id: "INF-9", title: null }, age: { since: "2026-10-04T10:00:00Z" }, options: [], disposition: { instead: "taskdecide" }, ...o });
for (const [where, path] of [["queue", "/app/queue"], ["home", "/app"]]) {
  test(`R49 R97 (C25; ${where}): an item with a title is named by it; one with none and an address as its words is named by the host and the day (the one rule), never the file part of the address; control: no address, the untitled word`, { timeout: 240000 }, async () => {
    // The member and her project are the real store's; the item is the queue's own answer (no act of the door raises an issuer question for a subject it does not hold).
    const w = await storeWorld({ group: null });
    const mai = await w.signIn("mai", { capabilities: CREATE });
    await mai.read("lookedsince");
    await w.recipes.project(mai, "Tax help");
    const refs = (p) => main(p).querySelectorAll("a.cs-ref").filter((a) => /document\/INF-9/.test(a.getAttribute("href") || "")).map((a) => a.textContent);
    const has = async (it) => { const p = await openW(w, mai, path, { queue: ok({ items: [it], item_count: 1 }) }, { screens: withScreens("document") }); await settle(80); return refs(p); };
    assert.deepEqual(await has(AUTH({ subject: { kind: "bundle", id: "INF-9", title: "2026 Form 1040-ES" } })), ["2026 Form 1040-ES"]);
    const named = await has(AUTH());
    assert.deepEqual(named, [word("document.untitled.web", { site: "www.irs.gov", date: dmy("2026-10-04") })], "host and day, not f1040es.pdf");
    assert.deepEqual(await has(AUTH({ summary: "Who issued this?" })), [word("queue.source.untitled", { date: dmy("2026-10-04") })], "control");
  });
}

/* ---------- R95 (C70): the Queue says what each number counts, over the real shell in Chromium ---------- */

import { measure } from "./measure.mjs";
const ITEMS = [...Array.from({ length: 72 }, (_, i) => ({ id: "TSK-" + i, class: "OBLIGATION", kind: "check", summary: "Check " + i, assignee: "mai", subject: { kind: "bundle", id: "INF-" + i }, options: [], disposition: { instead: "taskresolve" }, case: { ungrouped: true, ancestors: [] } })),
  ...Array.from({ length: 7 }, (_, i) => ({ id: "FND-" + i, class: "FINDING", kind: "x", summary: "Noticed " + i, subject: { kind: "bundle", id: "INF-N" + i }, options: [], case: { ungrouped: true, ancestors: [] } }))];
/** `mai`'s group holding `n` captures from three places that nobody has vouched for, captured by `actor` ("mai" herself, or another member), by the real acts. */
async function heldBy(actor, n) {
  const w = await storeWorld({ group: null });
  const mai = await w.signIn("mai", { capabilities: CREATE });
  const by = actor === "mai" ? mai : await w.signIn(actor, { capabilities: ["contribute"] });
  for (let i = 0; i < n; i++) await held(w, by, { title: "Photo " + i, address: "https://city.example/p" + (i % 3) });
  return { w, mai };
}
const NEW3 = [1, 2, 3].map((id) => ({ id, status: "new" }));
const PAGE = () => ({ badge: document.querySelector(".cs-rail a .count")?.textContent || "", mast: document.querySelector('.cs-mast [data-kind="todo"]')?.textContent || "",
  main: document.getElementById("cs-main").innerText.replace(/\s+/g, " ") });
/* The browser draws the page over a plane of answers; the queue's 72 to-dos and 7 findings are the plane's own (no act of the door raises a finding), the
   held captures are the REAL store's, forwarded from a world's door. */
const forward = (w, as, op) => (req) => w.door({ url: `/api/?${new URLSearchParams({ ...req.query, op })}`, init: { method: "GET" } }, as);
const queueAt = ({ w, mai }, inbox) => measure({ path: "/app/queue", width: 1280, ready: "#cs-main .cs-row", measure: PAGE,
  plane: { whoami: ok({ ...MEMBER }), queue: ok({ items: ITEMS, item_count: 79 }), heldcaptures: forward(w, mai, "heldcaptures"), inbox: ok({ inbox: inbox }), memberlist: ok({ members: [] }) } });

test("R95 (C70): with 46 captures held and 79 items the bell and the sidebar read 79, and the page says what 79 counts and, apart, what 46 and the Inbox's 3 count", { timeout: 600000 }, async () => {
  const m = await queueAt(await heldBy("other", 46), NEW3);
  assert.equal(m.badge, "79", "the sidebar");
  assert.equal(m.mast, word("shell.todo", { n: "79" }), "the bell");
  assert.ok(m.main.includes(word("screen.queue.count.many", { n: "79" })), "the page counts 79 items");
  assert.ok(m.main.includes(word("shell.queue.waiting", { n: "79", todo: "72", noticed: "7", status: "0" })), "and says what they are");
  const line = word("screen.home.waiting.counts", { held: "46", inbox: "3" });
  assert.ok(m.main.includes(line), "and says what the 46 and the 3 count");
  assert.ok(m.main.indexOf(line) < m.main.indexOf(word("screen.queue.count.many", { n: "79" })), "the sentence about the doors comes with the doors, above the list");
  assert.ok(m.main.includes(word("act.release.label.queue")) && m.main.includes(word("screen.held.name")), "the door to Held captures is still there");
});

test("R95 (C70) control: with no held capture and no knock neither the sentence nor the door is drawn, the items' sentence is; a member's own vouch to-dos, drawn in the list, are counted in the page, the bell and the sidebar alike", { timeout: 600000 }, async () => {
  const none = await queueAt(await heldBy("other", 0), []);
  assert.equal(none.badge, "79");
  assert.ok(!none.main.includes(word("screen.home.waiting.counts", { held: "0", inbox: "0" })) && !none.main.includes(word("screen.held.name")), "no door and no counts of doors");
  assert.ok(none.main.includes(word("shell.queue.waiting", { n: "79", todo: "72", noticed: "7", status: "0" })));
  const mine = await queueAt(await heldBy("mai", 46), []);
  assert.equal(mine.badge, "82", "three places to vouch for, each a to-do of hers, in the sidebar");
  assert.equal(mine.mast, word("shell.todo", { n: "82" }), "and in the bell");
  assert.ok(mine.main.includes(word("screen.queue.count.many", { n: "82" })) && mine.main.includes(word("shell.queue.waiting", { n: "82", todo: "75", noticed: "7", status: "0" })), "and on the page: the same 82");
});

test("R122, R93 (C14, Home and Queue): a page load sends one `bootstrap` and one read of the queue's list (the frame's own is the count); `groupidentity` is read once (the frame and the screen share one request, interface-shell R123)", async () => {
  const { w, rosa } = await roster();
  for (const [path, groups] of [["/app", 1], ["/app/queue", 1]]) {
    const p = await openW(w, rosa, path);
    await settle(80);
    assert.equal(p.byOp("bootstrap").length, 1, path + ": one bootstrap");
    assert.equal(p.byOp("queue").filter((r) => r.query.count !== "true" && !r.query.muted).length, 1, path + ": one list read");
    assert.equal(p.byOp("groupidentity").length, groups, path + ": groupidentity");
    assert.equal(p.byOp("projectparticipants").length, 0, path + ": no per-project read");
  }
});
