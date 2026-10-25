/* The to-dos Home and the queue draw as the design draws them (R3, R17; B21, DEC-389): the photos a member captured and has not
   vouched for ("Vouch for N photos you captured on …", the registry's `release`), and a letter drafted for the group awaiting her
   approval ("Read and approve it", `filingapprove`). On the real served page over the REAL store (store-request's `storeWorld()`,
   op-tables §5.3): the captures, their vouching, the action and its drafts are made by the real acts, and every answer the page reads
   is the real store's. Every sentence is asserted as `word(key, vars)` (R34). */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { storeWorld } from "../store-request/fixtures.mjs";
import { counted } from "../interface-shell/harness.mjs";
import { open as openRaw, ok, refused, main, text, ops, button, fill, last, press, beside, word, hasWord, withScreens, settle } from "./page.mjs";

const timeout = { timeout: 180000 };
const SCR = { screens: withScreens("action", "document", "project", "start-send") };
const open = (w, as, path, plane = {}) => openRaw(path, plane, { ...w.boot(as), ...SCR });
const screens = [["home", "/app"], ["queue", "/app/queue"]];
const GATE = "https://city.example/gate", LOT = "https://city.example/lot";
const hex = (s) => createHash("sha256").update(s).digest("hex");
const stamp = (w) => new Date(w.now()).toISOString().replace(/\.\d{3}Z$/, "Z");

/** A document the member holds, collected and not vouched for, by the real acts: from a public address (`acquire`, the address answered by
 *  the world's network, scripted) or an upload (`captureupload`), then the promotion of its information bundle at `collected`, as the capture
 *  screen promotes it. Answers the bundle's id. */
async function held(w, as, { title, address = null }) {
  const body = `<html><head><title>${title}</title></head><body><p>${address || "upload"} ${title}</p></body></html>`;
  let doc;
  if (address) {
    w.script(address, async () => new Response(body, { status: 200, headers: { "content-type": "text/html" } }));
    doc = (await as.act("acquire", { body: { locator: address } })).document;
  } else {
    const up = await w.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: title || "upload", name: title || "upload" })}`,
      init: { method: "POST", headers: { "content-type": "text/plain" }, body: new TextEncoder().encode(body) } }, as);
    doc = up.json && up.json.result && up.json.result.document;
    if (!doc || !doc.capture) throw new Error("the upload was refused: " + JSON.stringify(up.json).slice(0, 300));
  }
  const now = stamp(w);
  const minted = await as.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const id = minted.id + "-" + (title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    "---", "", "## Summary", "", title || "untitled", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const len = (s) => new TextEncoder().encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await as.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now }, files, register } });
  return made.bundleId || id;
}
/** The member's held captures as the doors read them (`fields: picker`), in the order read. */
const heldRead = async (as) => (await as.read("heldcaptures", { query: { limit: "500", fields: "picker" } })).held;

/** A group and a member `mai` who has looked at Home before (her first look is the real `lookedsince`, which records it), so Home is not her first visit. */
async function desk({ looked = true } = {}) {
  const w = await storeWorld({ group: null });
  const mai = await w.signIn("mai");
  if (looked) await mai.read("lookedsince");
  return { w, mai };
}
/** A group with an administrator `rosa` (who looked at Home before) and an action of her project "Pothole repairs" ("Demand to rescind"). */
async function office() {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  await rosa.read("lookedsince");
  const project = await w.recipes.project(rosa, "Pothole repairs");
  const doc = ["---", "object_type: action", "title: Demand to rescind", "current_state: active", 'created: "2026-10-01T00:00:00Z"', 'last_updated: "2026-10-01T00:00:00Z"',
    "action_kind: records_request", "project: " + project, "---", "", "An action.", ""].join("\n");
  const action = (await rosa.act("actioncreate", { body: { document: doc } })).id;
  await rosa.act("actionrisktier", { query: { target: action, tier: "1", reason: "a plain request" }, body: { target: action, tier: 1, reason: "a plain request" } });
  const draft = async (words) => (await rosa.act("filingprepare", { body: { action, text: words } })).id;
  return { w, rosa, project, action, draft };
}
/** The letter drafted for the group, as the queue's item for it reads (no module raises the kind `filing-draft`: the item is the screen's own fixture). */
const letterOf = (action) => ({ id: `OBLIGATION::letter::${action}::rosa`, class: "OBLIGATION", kind: "filing-draft", case: { ungrouped: true, ancestors: [] }, assignee: "rosa", summary: "A letter to approve",
  subject: { kind: "action", id: action, title: "Demand to rescind" }, options: [{ id: "filingapprove" }], disposition: { available: false, instead: "filingapprove" } });
const later = (ms = 1100) => new Promise((r) => setTimeout(r, ms));

test("R17 (words): the words the vouch to-do and the letter's approval read are held by the word list", () => {
  for (const k of ["screen.home.todo.vouch", "screen.home.todo.vouch.noplace", "screen.home.todo.vouch.noplace.one", "screen.dash-project.next.vouch.one",
    "act.release.label.home", "act.release.label.queue", "act.release.does", "act.filingapprove.label.home", "act.filingapprove.label.queue", "act.filingapprove.does",
    "screen.held.ack", "screen.held.ackhelp", "screen.held.mitigation", "screen.held.mitigationhelp", "screen.held.vouchmissing", "screen.held.vouchbad",
    "screen.held.selectfailed"]) assert.ok(hasWord(k), k);
});

for (const [where, path] of screens) {
  test(`R17 (${where}): photos the member captured and has not vouched for are one to-do for each place, "Vouch for N photos you captured on …", with the registry's act release`, timeout, async () => {
    const { w, mai } = await desk();
    await held(w, mai, { title: "Photo 1", address: GATE });
    await held(w, mai, { title: "Photo 2", address: GATE });
    await held(w, mai, { title: "Photo 3", address: LOT });
    const p = await open(w, mai, path);
    await settle();
    assert.equal(p.byOp("heldcaptures").length, 1, "the held captures are read once, as the doors read them; her own are the rows whose actor is she (C14, P2.3)");
    const t = text(p);
    assert.ok(t.includes(word("screen.home.todo.vouch", { count: "2", place: GATE })), "two photos at one place");
    assert.ok(t.includes("Photo 3") && !t.includes(word("screen.dash-project.next.vouch.one", { place: LOT })), "C25: one capture at another place is the document, named by its title");
    const bare = await desk();
    await held(bare.w, bare.mai, { title: "", address: LOT });
    const titleless = await open(bare.w, bare.mai, path);
    await settle();
    assert.ok(text(titleless).includes(word("screen.dash-project.next.vouch.one", { place: LOT })), "control: one with no title keeps the sentence about its place");
    assert.deepEqual(ops(p).filter((o) => o === "release"), ["release", "release"], "each to-do carries the act");
    assert.ok(button(p, "release").textContent.includes(word(`act.release.label.${where}`)));
  });

  test(`R17 (${where}): a capture with no place is vouched for in a to-do of its own, by the keys that say no place; one photo reads in the singular`, timeout, async () => {
    const { w, mai } = await desk();
    await held(w, mai, { title: "Photo 1" });
    await held(w, mai, { title: "Photo 2" });
    await held(w, mai, { title: "Photo 3", address: LOT });
    const p = await open(w, mai, path);
    await settle();
    assert.ok(text(p).includes(word("screen.home.todo.vouch.noplace", { count: "2" })));
    const one = await desk();
    await held(one.w, one.mai, { title: "Photo 1" });
    const q = await open(one.w, one.mai, path);
    await settle();
    assert.ok(text(q).includes("Photo 1") && !text(q).includes(word("screen.home.todo.vouch.noplace.one")), "C25: one capture is the document, named by its title");
    const bare = await desk();
    await held(bare.w, bare.mai, { title: "" });
    const untitled = await open(bare.w, bare.mai, path);
    await settle();
    assert.ok(text(untitled).includes(word("screen.home.todo.vouch.noplace.one")), "control: with no title, one photo reads in the singular");
  });

  test(`R17 (${where}): vouching asks her two statements; with one missing nothing is sent; with both it selects the group's captures, then releases them over the handle`, timeout, async () => {
    const { w, mai } = await desk();
    await held(w, mai, { title: "Photo 1", address: GATE });
    await held(w, mai, { title: "Photo 2", address: GATE });
    const ids = (await heldRead(mai)).filter((r) => r.source.address === GATE).map((r) => r.bundle_id);
    assert.equal(ids.length, 2);
    const p = await open(w, mai, path);
    await settle();
    const b = button(p, "release");
    const f = b.dataset.f;
    assert.ok(main(p).querySelector(`#${f}-ack`) && main(p).querySelector(`#${f}-mitigation`), "both statements are fields beside the act");
    await press(p, "release");
    assert.equal(p.byOp("select").length + p.byOp("release").length, 0, "no statement, nothing sent");
    fill(p, { [`${f}-ack`]: "They are what the gate cameras gave" });
    const half = await press(p, "release");
    assert.equal(p.byOp("release").length, 0, "one statement missing, nothing sent");
    assert.ok(beside(p, half).includes(word("screen.held.vouchmissing", { fields: word("screen.held.mitigation") })), "the missing one is named");
    await press(p, "release", { values: { [`${f}-mitigation`]: "I compared each with the original" } });
    assert.deepEqual(last(p, "select").body.ids, ids);
    const rel = last(p, "release");
    assert.deepEqual([rel.query.acknowledgment, rel.query.mitigation], ["They are what the gate cameras gave", "I compared each with the original"]);
    assert.equal(typeof rel.query.handle, "string", "the handle the real selection gave");
    assert.deepEqual((await heldRead(mai)).map((r) => r.bundle_id), [], "the real release vouched for both: none is held now");
  });

  test(`R17 (${where}): control: with no photo held there is no vouch to-do and no release act; a failed read of her captures adds no second failed mark`, timeout, async () => {
    const { w, mai } = await desk();
    const none = await open(w, mai, path);
    await settle();
    assert.ok(!ops(none).includes("release"));
    assert.ok(!text(none).includes(word("screen.home.todo.vouch.noplace", { count: "0" })));
    // The point is a refused read, which the world cannot make: only that op is overridden on top of the world's plane.
    const failed = await open(w, mai, path, { heldcaptures: refused("NOT_YET", "No.", 500) });
    await settle();
    assert.ok(!ops(failed).includes("release"));
    assert.equal(main(failed).querySelectorAll('[data-state="failed"]').length, 1, "the door's failed mark, and no other");
  });

  test(`R3 (${where}): a letter drafted for the group awaiting her approval draws "Read and approve it" as the act filingapprove; pressing it approves the newest draft not yet sent`, timeout, async () => {
    const { w, rosa, action, draft } = await office();
    await draft("Dear clerk, the first words.");
    await later();
    const newest = await draft("Dear clerk, the second words.");
    const p = await open(w, rosa, path, { queue: ok({ items: [letterOf(action)], item_count: 1 }) });
    await settle();
    const b = button(p, "filingapprove");
    assert.ok(b, "the act is drawn on the letter's item");
    assert.ok(b.textContent.includes(word(`act.filingapprove.label.${where}`)));
    assert.equal(button(p, "filingapprove", 1), null, "once");
    await press(p, "filingapprove", { confirm: true });
    assert.equal(last(p, "filingsfor").query.action, action);
    assert.deepEqual(last(p, "filingapprove").body, { filing: newest });
    const drafts = (await rosa.read("filingsfor", { query: { action } })).drafts;
    assert.ok(drafts.find((d) => d.filing === newest).approval, "the real draft is approved");
    assert.equal(drafts.filter((d) => d.approval).length, 1, "and no other");
  });

  test(`R3 (${where}): control: with no draft awaiting approval nothing is approved and the member is taken to the action; an item with another option draws no filingapprove`, timeout, async () => {
    const { w, rosa, action, draft } = await office();
    const done = await draft("Dear clerk, the words.");
    await rosa.act("filingapprove", { body: { filing: done } });
    const p = await open(w, rosa, path, { queue: ok({ items: [letterOf(action)], item_count: 1 }) });
    await settle();
    await press(p, "filingapprove", { confirm: true });
    assert.equal(p.byOp("filingapprove").length, 0);
    assert.equal(p.location.pathname, `/app/action/${action}`, "taken to the action, where its state is");
    const other = await open(w, rosa, path, { queue: ok({ items: [{ ...letterOf(action), options: [{ id: "taskresolve" }], disposition: { available: true, op: "taskresolve" } }], item_count: 1 }) });
    await settle();
    assert.ok(!ops(other).includes("filingapprove"));
  });
}

test("R17 (queue): with nothing else waiting, the photos she has not vouched for are waiting on her: the to-do is drawn and the queue is not told 'Nothing is waiting on you'; control: with no photo it is", timeout, async () => {
  const { w, mai } = await desk();
  await held(w, mai, { title: "Photo 1", address: GATE });
  const p = await open(w, mai, "/app/queue");
  await settle();
  assert.ok(text(p).includes("Photo 1"));
  assert.ok(!text(p).includes(word("screen.queue.empty")));
  const quiet = await desk();
  const none = await open(quiet.w, quiet.mai, "/app/queue");
  await settle();
  assert.ok(text(none).includes(word("screen.queue.empty")));
});

test("R17 (home): a to-do to vouch counts among the member's own on the strip; a new member's first visit draws no 'Needs you', so none", timeout, async () => {
  const { w, mai } = await desk();
  await held(w, mai, { title: "Photo 1" });
  const p = await open(w, mai, "/app");
  await settle();
  assert.ok(text(p).includes(word("screen.home.needsyou")));
  assert.ok(text(p).includes(word("screen.home.strip.you")), "the strip reads one of hers");
  const q = await desk();
  const quiet = await open(q.w, q.mai, "/app");
  await settle();
  assert.ok(!text(quiet).includes(word("screen.home.strip.you")), "control: with none, no reading");
  const f = await desk({ looked: false });
  await held(f.w, f.mai, { title: "Photo 1" });
  const first = await open(f.w, f.mai, "/app");
  await settle();
  assert.ok(!text(first).includes(word("screen.home.needsyou")));
  assert.ok(!ops(first).includes("release"));
});

// C70 (fix round 2): the vouch to-dos are counted and drawn once with the list.
/** A group where rosa (administrator) is asked to check a document by name (a document a question of the project rests on, so its item has a case) and is told
 *  that mai declared an expertise (an item in no case): two items in her queue, both by the real acts. */
async function crew() {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const mai = await w.signIn("mai");
  await rosa.read("lookedsince");
  const project = await w.recipes.project(rosa, "Pothole repairs");
  await rosa.act("projectinvite", { query: { projectId: project, handle: "mai" } });
  await mai.act("projectjoin", { query: { projectId: project } });
  await rosa.act("projectowneradd", { query: { projectId: project, handle: "mai" } });
  const orders = await w.recipes.hold(mai, "Work orders", "812 of 903 reports", project);
  await w.recipes.question(mai, project, { title: "Which streets?", legs: [{ target: orders.bundle }] });
  await mai.act("checkrequest", { body: { target: orders.bundle, member: "rosa", note: "Check the first count" } });
  await mai.act("expertisedeclare", { body: { memberId: "mai", label: "tenant law" } });
  const items = (await rosa.read("queue")).items;
  assert.equal(items.length, 2, "two items wait on her");
  return { w, rosa, items, check: items.find((i) => i.kind === "check-requested").summary };
}

test("R17, C70 (queue): the vouch to-dos are counted with the list and grouped in it, with no case; with none held none is added", timeout, async () => {
  const { w, rosa } = await crew();
  await held(w, rosa, { title: "Photo 1", address: GATE });
  await held(w, rosa, { title: "Photo 2", address: LOT });
  const p = await open(w, rosa, "/app/queue");
  await settle();
  assert.ok(text(p).includes(word("screen.queue.count.many", { n: "4" })), "two items and two vouch to-dos are four");
  const sections = main(p).querySelectorAll("section.mk-sec");
  const uncased = sections.find((s) => text(p, s.querySelector("h2")) === word("screen.queue.nocase"));
  assert.ok(uncased.querySelectorAll('button[data-act="release"]').length === 2, "the vouch to-dos are in the group of what is in no case");
  assert.equal(main(p).querySelectorAll('button[data-act="release"]').length, 2, "each drawn once");
  const c = await crew();
  const none = await open(c.w, c.rosa, "/app/queue");
  await settle();
  assert.ok(text(none).includes(word("screen.queue.count.many", { n: "2" })), "control: none held adds none");
});

for (const [where, path] of screens) {
  test(`R17, C70 (${where}): the list is drawn once, with the vouch to-dos: while her captures are being read it is not drawn without them`, timeout, async () => {
    const { w, rosa, check } = await crew();
    await held(w, rosa, { title: "Photo 1", address: GATE });
    let open1;
    const gate = new Promise((r) => { open1 = r; });
    // The point is a read held open: the world's own answer, given once the gate opens (only this op wraps the world's door).
    const door = w.boot(rosa).door;
    const p = await open(w, rosa, path, { heldcaptures: counted(async (req) => { await gate; return door(req); }) });
    await settle();
    assert.ok(!text(p).includes(check), "not drawn before her captures are read");
    assert.ok(!text(p).includes("Photo 1"));
    assert.ok(main(p).querySelector('[data-state="loading"]'), "it says it is loading");
    if (where === "home") assert.ok(!text(p).includes(word("screen.home.strip.you")), "no strip reading before the count is whole");
    open1();
    await settle();
    assert.ok(text(p).includes(check) && text(p).includes("Photo 1"), "both at once");
    assert.equal(main(p).querySelectorAll('button[data-act="release"]').length, 1);
    if (where === "home") assert.ok(text(p).includes(word("screen.home.strip.you")));
  });
}
