/* screens-investigate, T51 fix round 3 (wave 2): C59 and N3 (one passage picker, R34), C14 (the pickers read when the screen opens, R34, R52),
 * C95 (the cite list's preselection, R34), each over `store-request`'s world (the real store behind the page's door), with the control that shows the fix is the cause. C8 is in money.test.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { refusedIn } from "../interface-shell/harness.mjs";
import { main, fill, press, word } from "./fixtures.mjs";
import { inWorld, openAs, settled, readHeld } from "./world.mjs";

const wordsOf = (p, id) => p.doc.querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith(id + "-"));
const unitsOf = (p, id) => wordsOf(p, id).querySelectorAll('[data-shell="word"]').map((e) => e.textContent);
const pickWord = async (p, id, i) => { await p.click(wordsOf(p, id).querySelectorAll('[data-shell="word"]')[i]); await p.settle(); };
const heading = (p, id) => main(p).querySelectorAll("[data-passage]").filter((e) => e.getAttribute("data-passage") === id);
const NOT_READ = word("retrieval.notread.not_extracted");

/** A world whose member holds two documents of a project, the first of two paragraphs, the second of one, each read by the store (`readHeld`), and a money trail of
 *  the project: the passages a page offers are the words of those readings. `read: false` leaves them held and unread. Also a person and an organisation to open. */
async function twoDocuments({ read = true } = {}) {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Pothole repairs");
  const first = await world.recipes.hold(me, "Lease amendment 1.txt", "The council adopted the amendment on March 3, 2026.\n\nThe rent is due on the first of each month.", project);
  const second = await world.recipes.hold(me, "Rent schedule.txt", "Monthly rent is due on the first.", project);
  const firstUnits = read ? await readHeld(world, me, first.sha) : [];
  const secondUnits = read ? await readHeld(world, me, second.sha) : [];
  if (read) {
    assert.equal(firstUnits.length, 2, "the first document reads as two passages");
    assert.equal(secondUnits.length, 1, "the second as one");
  }
  const trail = await world.recipes.trail(me, project, "Pothole repairs, FY2026");
  const person = (await me.act("entitycreate", { body: { kind: "person", label: "Lin Chen", note: "Director of Public Works." } })).entity_id;
  const org = (await me.act("entitycreate", { body: { kind: "institution", label: "Public Works Department", note: "A city department." } })).entity_id;
  return { world, me, project, trail, person, org, first, second, firstUnits, secondUnits };
}
/** `settled`, but `#cs-main` is looked up each round: choosing another document redraws the screen and replaces it, and world.mjs's `settled`, which holds the first
 *  element, then waits on a detached "loading" for its whole bound (sixteen seconds). */
async function quiet(p) {
  let last = -1, stable = 0;
  for (let i = 0; i < 1500 && stable < 8; i++) {
    await p.settle(20); await new Promise((r) => setTimeout(r, 10));
    const busy = p.doc.getElementById("cs-main").querySelectorAll('[data-state="loading"]').length > 0;
    stable = !busy && p.requests.length === last ? stable + 1 : 0; last = p.requests.length;
  }
}
const select = async (p, id, sha) => { fill(p, { [id]: sha }); p.fire(p.doc.getElementById(id), "change"); await quiet(p); };

/** The four screens that offer a passage picker: where each is opened over `w`, and the ids of its document choice and its words. */
const SCREENS = [
  ["person", (w) => "/app/person/" + w.person, "person-fact-doc", "person-fact-passage"],
  ["organization", (w) => "/app/person/" + w.org, "person-fact-doc", "person-fact-passage"],
  ["money", (w) => "/app/money/" + w.trail, "mf-doc", "mf-passage"],
  ["timeline", (w) => "/app/timeline/" + w.project, "tl-doc", "tl-passage"],
];

for (const [name, at, doc, words] of SCREENS) {
  test(`R34 C59 ${name}: "Choose the passage on the document" is drawn with the chosen document's words, from its reading; control: a document with a reading lists its passages`, async () => {
    const w = await twoDocuments();
    const p = await openAs(w.world, w.me, at(w));
    assert.equal(heading(p, words).length, 1, "the heading is drawn, once");
    assert.ok(heading(p, words)[0].textContent.includes(word("form.choose.passage")));
    const chosen = p.doc.getElementById(doc).value;
    const units = { [w.first.sha]: w.firstUnits, [w.second.sha]: w.secondUnits };
    assert.ok(units[chosen], "a held document is the one chosen");
    assert.deepEqual(unitsOf(p, words), units[chosen].map((u) => u.text), "the chosen document's words");
    assert.equal(p.byOp("reading")[0].query.sha256, chosen);
    assert.equal(main(p).querySelector('[data-state="failed"]'), null, "nothing failed");
    /* choosing the other document redraws the words from that document's reading */
    const other = chosen === w.first.sha ? w.second.sha : w.first.sha;
    await select(p, doc, other);
    assert.deepEqual(unitsOf(p, words), units[other].map((u) => u.text));
  });

  test(`R34 N3 ${name}: a document with no reading, or one that cannot be read, says why; never "Nothing here" nor "Could not read this"; control: a document with a reading draws no such sentence`, async () => {
    /* held and not yet read: the store's own answer; then a reading the store answered with no words, one it refused, and one it gave no reason for (faults) */
    const w = await twoDocuments({ read: false });
    const faults = [null, () => ({ status: 200, json: { ok: true, result: { ok: true, sha256: w.first.sha, unread_pages: [], text_units: [] } } }), refusedIn("NOT_READ", ""),
      () => ({ status: 200, json: { ok: true, result: { ok: false } } })];
    for (const reading of faults) {
      const p = await openAs(w.world, w.me, at(w), { plane: reading ? { reading } : {} });
      const sec = main(p).textContent;
      assert.ok(sec.includes(NOT_READ), "the reason is said");
      assert.ok(!sec.includes(word("shell.unread")), "not 'could not read this'");
      assert.equal(wordsOf(p, words), undefined, "no words to select");
      assert.ok(heading(p, words).length === 1, "the heading stays");
    }
    const r = await twoDocuments();
    const read = await openAs(r.world, r.me, at(r));
    assert.ok(!main(read).textContent.includes(NOT_READ), "control: a reading draws no reason");
  });
}

test("R34 C59 money and timeline send the passage chosen on screen, and the whole document when none is chosen", async () => {
  const w = await twoDocuments();
  const m = await openAs(w.world, w.me, "/app/money/" + w.trail);
  await select(m, "mf-doc", w.first.sha);
  assert.deepEqual(unitsOf(m, "mf-passage"), w.firstUnits.map((u) => u.text), "the chosen document's words");
  await pickWord(m, "mf-passage", 1);
  fill(m, { "mf-amount": "1200", "mf-asread": "$1,200", "mf-from-date": "2025-07-01", "mf-to-date": "2026-06-30" });
  await press(m, "recordfact", { reason: "The lease amendment says so." });
  await settled(m);
  assert.deepEqual(m.byOp("recordfact")[0].body.source, { capture_sha: w.first.sha, extent: w.firstUnits[1].extent });
  assert.equal((await w.me.read("moneyset", { query: { id: w.trail } })).proposals.length, 1, "the figure is held");
  await pickWord(m, "mf-passage", 1);
  fill(m, { "mf-amount": "1300", "mf-asread": "$1,300", "mf-from-date": "2025-07-01", "mf-to-date": "2026-06-30" });
  await press(m, "recordfact", { reason: "The lease amendment says so, again." });
  await settled(m);
  assert.deepEqual(m.byOp("recordfact")[1].body.source, { capture_sha: w.first.sha, extent: { kind: "document" } }, "control: nothing selected");
  const t = await openAs(w.world, w.me, "/app/timeline/" + w.project);
  await select(t, "tl-doc", w.first.sha);
  await pickWord(t, "tl-passage", 0);
  await press(t, "createevent", { reason: "the minutes record it" });
  await settled(t);
  assert.deepEqual(t.byOp("createevent")[0].body.attestations, [{ captureSha: w.first.sha, extent: w.firstUnits[0].extent }]);
  assert.equal((await w.me.read("timeline", { query: { captures: w.first.sha } })).world.placed_nowhere.length, 1, "the event is held, attested by that passage");
});

test("R34 C59 each document's words are their own selection: words picked on one document are not sent for another (control: back on the first, still picked)", async () => {
  const w = await twoDocuments();
  const p = await openAs(w.world, w.me, "/app/timeline/" + w.project);
  await select(p, "tl-doc", w.first.sha);
  await pickWord(p, "tl-passage", 1);
  await select(p, "tl-doc", w.second.sha);
  await press(p, "createevent", { reason: "the minutes record it" });
  await settled(p);
  assert.deepEqual(p.byOp("createevent")[0].body.attestations, [{ captureSha: w.second.sha, extent: { kind: "document" } }], "the other document is cited whole");
  await select(p, "tl-doc", w.first.sha);
  await press(p, "createevent", { reason: "the minutes record it" });
  await settled(p);
  assert.deepEqual(p.byOp("createevent")[1].body.attestations, [{ captureSha: w.first.sha, extent: w.firstUnits[1].extent }]);
  const held = (await w.me.read("timeline", { query: { captures: `${w.first.sha},${w.second.sha}` } })).world.placed_nowhere;
  assert.equal(held.length, 2, "both events are held");
});

/* C95 (R34, parts): the question choice leads with the question the page was opened for, chosen; with none, none is chosen */
const hex = (x) => createHash("sha256").update(x).digest("hex");
const iso = (world) => new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
/** A question the team asks (an inquiry), as the record holds one. Answers its id. */
async function ask(world, me, title) {
  const now = iso(world);
  const id = (await me.read("allocid", { query: { prefix: "INQ", year: now.slice(0, 4) } })).id + "-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 20);
  const text = ["---", "id: " + id, "object_type: inquiry", "schema: inquiry@1", "title: " + JSON.stringify(title), "current_state: open", "prior_state: null", "references: []",
    "state_history: []", "surfaced_by: human", "---", "", "## Question", "", title, "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const made = await me.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "inquiry", title, current_state: "open", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [] } });
  return made.bundleId || id;
}
/** A project (as `recipes.project` starts one) whose document cites `targets`, as a project's document cites the questions it follows. */
async function projectCiting(world, me, title, targets) {
  const now = iso(world);
  const refs = targets.length ? ["references:", ...targets.flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: active"])] : [];
  const text = ["---", "object_type: project", "title: " + JSON.stringify(title), "objective: " + JSON.stringify(title), "current_state: forming", `created: "${now}"`, `last_updated: "${now}"`,
    ...refs, "---", "", "## Session Log", "", `### Session ${now} | Formation | interactive`, "Trigger: test", "Changes: created.", ""].join("\n");
  const made = await me.act("promote", { body: { base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(title).slice(0, 8),
    meta: { object_type: "project", title, current_state: "forming", created: now, last_updated: now }, files: [{ path: "bundle.md", text }], register: [], visibility: "discoverable" } });
  return made.bundleId;
}
/** Two questions the team asks, one of which a project cites (the other is asked first, so it leads the list unless the page puts the cited one ahead), a project that
 *  cites it with a money trail, and a project that cites none with a trail. */
async function questions() {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const other = await ask(world, me, "Another team question");
  const cited = await ask(world, me, "Is the city repairing reported potholes within seven days?");
  const citing = await projectCiting(world, me, "Pothole repairs", [cited]);
  const bare = await projectCiting(world, me, "Street lighting", []);
  return { world, me, other, cited, citing, bare, trail: await world.recipes.trail(me, citing, "Pothole repairs, FY2026"), bareTrail: await world.recipes.trail(me, bare, "Street lighting, FY2026") };
}
const optionsOf = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.hasAttribute("selected")]);

test("R34 C95 money: the question the project cites is first and chosen; control: a project citing none has none chosen", async () => {
  const q = await questions();
  const listed = (await q.me.read("list", { query: { type: "inquiry", limit: "500" } })).bundles.map((b) => b.bundle_id);
  assert.deepEqual(listed.slice().sort(), [q.cited, q.other].sort(), "the world lists both questions");
  const p = await openAs(q.world, q.me, "/app/money/" + q.trail);
  assert.deepEqual(optionsOf(p, "mf-question"), [[q.cited, true], [q.other, false]]);
  const none = await openAs(q.world, q.me, "/app/money/" + q.bareTrail);
  assert.deepEqual(optionsOf(none, "mf-question").map(([, sel]) => sel), [false, false], "none chosen when the project cites none");
});

test("R34 C95 timeline: the cited question is the chosen one; control: none cited, none offered", async () => {
  const q = await questions();
  const p = await openAs(q.world, q.me, "/app/timeline/" + q.citing);
  assert.deepEqual(optionsOf(p, "tl-question"), [[q.cited, true]]);
  const none = await openAs(q.world, q.me, "/app/timeline/" + q.bare);
  assert.deepEqual(optionsOf(none, "tl-question"), [], "none cited, none offered, none chosen");
});

/* C14 (R34, R52; shell R113): the picker reads when the screen opens, once, with `fields=picker`; choosing, searching and acts that file no
 * document read nothing of it again, and a document's reading is read once however often it is chosen */
for (const [name, at, doc] of SCREENS.filter(([n]) => n !== "organization")) {
  test(`R34 C14 ${name}: one picker read when the screen opens (fields picker, held and vouched); choosing and choosing back reads no document list again, and each reading once`, async () => {
    const w = await twoDocuments();
    const p = await openAs(w.world, w.me, at(w));
    assert.equal(p.byOp("heldcaptures").length, 1, "one read of the documents at open");
    assert.equal(p.byOp("heldcaptures")[0].query.fields, "picker");
    assert.equal(p.byOp("heldcaptures")[0].query.state, "held_and_vouched");
    for (const sha of [w.second.sha, w.first.sha, w.second.sha]) await select(p, doc, sha);
    assert.equal(p.byOp("heldcaptures").length, 1, "control: a picker already opened is not read twice");
    assert.deepEqual(p.byOp("reading").map((r) => r.query.sha256).sort(), [w.first.sha, w.second.sha].sort(), "each document's reading once");
  });
}
