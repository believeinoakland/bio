/* screens-investigate, T51 fix round 3 (wave 2): C59 and N3 (one passage picker, R34), C14 (the pickers read when the screen opens, R34, R52),
 * C95 (the cite list's preselection, R34), each over a scripted plane, with the control that shows the fix is the cause. C8 is in money.test.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, fill, press, PATHS, P, ENT, ORG, SHA, SHA2, MSR, word, drew, notDrew } from "./fixtures.mjs";
import { inWorld, openAs, settled, readHeld } from "./world.mjs";

const wordsOf = (p, id) => p.doc.querySelectorAll("[data-words]").find((e) => e.getAttribute("data-words").startsWith(id + "-"));
const unitsOf = (p, id) => wordsOf(p, id).querySelectorAll('[data-shell="word"]').map((e) => e.textContent);
const pickWord = async (p, id, i) => { await p.click(wordsOf(p, id).querySelectorAll('[data-shell="word"]')[i]); await p.settle(); };
const heading = (p, id) => main(p).querySelectorAll("[data-passage]").filter((e) => e.getAttribute("data-passage") === id);
const NOT_READ = word("retrieval.notread.not_extracted");
const orgAt = "/app/person/" + ORG;
const orgPlane = { entity: (r) => ok(r.query.id === ORG ? { ok: true, found: true, entity: { entity_id: ORG, kind: "institution", label: "Public Works Department", note: "", aliases: [], relations: [] } } : { ok: false, found: false }),
  person: refusedIn("NOT_A_PERSON", "The record named is not a person."), samepersoncandidates: refusedIn("NOT_A_PERSON", "The record named is not a person.") };

const SCREENS = [
  ["person", PATHS.person, "person-fact-doc", "person-fact-passage"],
  ["organization", orgAt, "person-fact-doc", "person-fact-passage", orgPlane],
  ["money", PATHS.money, "mf-doc", "mf-passage"],
  ["timeline", PATHS.timeline, "tl-doc", "tl-passage"],
];

for (const [name, path, doc, words, extra] of SCREENS) {
  test(`R34 C59 ${name}: "Choose the passage on the document" is drawn with the chosen document's words, from its reading; control: a document with a reading lists its passages`, async () => {
    const p = await open(path, { plane: extra || {} });
    assert.equal(heading(p, words).length, 1, "the heading is drawn, once");
    assert.ok(heading(p, words)[0].textContent.includes(word("form.choose.passage")));
    assert.deepEqual(unitsOf(p, words), ["Lin Chen, Director of Public Works", "Appointed in March 2022"], "the first document's words");
    assert.equal(p.byOp("reading")[0].query.sha256, SHA);
    assert.equal(main(p).querySelector('[data-state="failed"]'), null, "nothing failed");
    /* choosing the other document redraws the words from that document's reading */
    fill(p, { [doc]: SHA2 });
    p.fire(p.doc.getElementById(doc), "change");
    await p.settle();
    assert.deepEqual(unitsOf(p, words), ["Monthly rent is due on the first."]);
  });

  test(`R34 N3 ${name}: a document with no reading, or one that cannot be read, says why; never "Nothing here" nor "Could not read this"; control: a document with a reading draws no such sentence`, async () => {
    for (const reading of [ok({ ok: true, sha256: SHA, unread_pages: [], text_units: [] }), refusedIn("NOT_READ", ""), () => ({ ok: false })]) {
      const p = await open(path, { plane: Object.assign({ reading }, extra || {}) });
      const sec = main(p).textContent;
      assert.ok(sec.includes(NOT_READ), "the reason is said");
      assert.ok(!sec.includes(word("shell.unread")), "not 'could not read this'");
      assert.equal(wordsOf(p, words), undefined, "no words to select");
      assert.ok(heading(p, words).length === 1, "the heading stays");
    }
    const read = await open(path, { plane: extra || {} });
    assert.ok(!main(read).textContent.includes(NOT_READ), "control: a reading draws no reason");
  });
}

/** A world whose member holds two documents of a project, the first of two paragraphs, the second of one, each read by the store (`readHeld`), and a money trail of
 *  the project: the passages a page offers are the words of those readings. */
async function twoDocuments() {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Pothole repairs");
  const first = await world.recipes.hold(me, "Lease amendment 1.txt", "The council adopted the amendment on March 3, 2026.\n\nThe rent is due on the first of each month.", project);
  const second = await world.recipes.hold(me, "Rent schedule.txt", "Monthly rent is due on the first.", project);
  const firstUnits = await readHeld(world, me, first.sha);
  const secondUnits = await readHeld(world, me, second.sha);
  assert.equal(firstUnits.length, 2, "the first document reads as two passages");
  assert.equal(secondUnits.length, 1, "the second as one");
  const trail = await world.recipes.trail(me, project, "Pothole repairs, FY2026");
  return { world, me, project, trail, first, second, firstUnits, secondUnits };
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
const QS = { ok: true, bundles: [{ bundle_id: "INQ-2026-0009-other", title: "Another team question" }, { bundle_id: "INQ-2026-0001-seven-days", title: "Is the city repairing reported potholes within seven days?" }] };
const optionsOf = (p, id) => p.doc.getElementById(id).querySelectorAll("option").map((o) => [o.getAttribute("value"), o.hasAttribute("selected")]);

test("R34 C95 money: the question the project cites is first and chosen; control: a project citing none has none chosen", async () => {
  const p = await open(PATHS.money, { plane: { list: ok(QS) } });
  assert.deepEqual(optionsOf(p, "mf-question"), [["INQ-2026-0001-seven-days", true], ["INQ-2026-0009-other", false]]);
  const none = await open(PATHS.money, { plane: { list: ok(QS), image: (r) => ok(r.query.id === P ? { "bundle.md": ["---", `id: ${P}`, "object_type: project", "title: \"Pothole repairs\"", "---", ""].join("\n") } : null) } });
  assert.deepEqual(optionsOf(none, "mf-question").map(([, sel]) => sel), [false, false], "none chosen when the project cites none");
});

test("R34 C95 timeline: the cited question is the chosen one; control: none cited, none offered", async () => {
  const p = await open(PATHS.timeline, { plane: { list: ok(QS) } });
  assert.deepEqual(optionsOf(p, "tl-question"), [["INQ-2026-0001-seven-days", true]]);
  const none = await open(PATHS.timeline, { plane: { list: ok(QS), image: (r) => ok(r.query.id === P ? { "bundle.md": ["---", `id: ${P}`, "object_type: project", "title: \"Pothole repairs\"", "---", ""].join("\n") } : null) } });
  assert.deepEqual(optionsOf(none, "tl-question"), [], "none cited, none offered, none chosen");
});

/* C14 (R34, R52; shell R113): the picker reads when the screen opens, once, with `fields=picker`; choosing, searching and acts that file no
 * document read nothing of it again, and a document's reading is read once however often it is chosen */
for (const [name, path, doc, words] of SCREENS.filter((x) => !x[4])) {
  test(`R34 C14 ${name}: one picker read when the screen opens (fields picker, held and vouched); choosing and choosing back reads no document list again, and each reading once`, async () => {
    const p = await open(path);
    assert.equal(p.byOp("heldcaptures").length, 1, "one read of the documents at open");
    assert.equal(p.byOp("heldcaptures")[0].query.fields, "picker");
    assert.equal(p.byOp("heldcaptures")[0].query.state, "held_and_vouched");
    for (const sha of [SHA2, SHA, SHA2]) { fill(p, { [doc]: sha }); p.fire(p.doc.getElementById(doc), "change"); await p.settle(); }
    assert.equal(p.byOp("heldcaptures").length, 1, "control: a picker already opened is not read twice");
    assert.deepEqual(p.byOp("reading").map((r) => r.query.sha256).sort(), [SHA, SHA2].sort(), "each document's reading once");
  });
}
