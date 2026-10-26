/* screens-inquiry fix round 3 (T51), the question screen, second pass: C36 (R23, R24, R34: a leg draws the words it cites, in the shape the
 * owner's reading really has), C81 (R5: the controls of the question at 390 px), rereads (R2, R113: every act declares what it re-reads).
 * On interface-shell's served page over a scripted plane; every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { main, press, says, word, SCREENS, Q, storeWorld } from "./fixtures.mjs";
import { holdRefusals } from "../hypotheses/fixtures.mjs";
import { onPhone } from "./phone.mjs";

const TITLE = "A PDF from www.oaklandca.gov";
const supportsHead = (p) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.question.supports.head"));
const supportsRows = (p) => supportsHead(p).querySelectorAll(".cs-row");

/* ------------------------------------------------------------------------------------------------------------------ C36 */

/* the units as `extraction` R27 answers them: `reading-pipeline` R15 gives a paragraph unit `{kind: "doc-para", para, run: null}`: the fields a unit does not narrow to are null, not absent.
   The words are the ones the world's reading really holds for each held page (a web page's paragraphs; a held PDF's text is decoded only for a font that carries its map, `fonts` of the
   world's `pdf` recipe, and undetermined otherwise) */
const PDF_WORDS = "The Director shall repair each reported pothole within seven calendar days of the report.";
const WEB_WORDS = "Potholes reported through 311 are repaired within seven days.";
const OTHER_WORDS = "Repairs are recorded as closed when the crew reports the work complete.";
const OWN = { capabilities: ["contribute", "create_projects"] };
/** A project of `ann`'s with three held web pages (the first and the third both named TITLE, told apart by their words) and a held PDF (its text decoded when `fonts` is given) and a question of hers resting on them with `legs(docs)` (none: no leg), by real acts. */
const worldOf = async (legs, { fonts = null } = {}) => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const docs = [(await world.recipes.page(ann, TITLE, { paragraphs: [PDF_WORDS, "Page two words."], project })).bundle,
    (await world.recipes.page(ann, "A web page from www.oaklandca.gov", { paragraphs: ["Intro.", WEB_WORDS], project })).bundle,
    (await world.recipes.page(ann, TITLE, { paragraphs: [OTHER_WORDS], project })).bundle,
    (await world.recipes.pdf(ann, "The audit", { pages: 2, project, ...(fonts ? { fonts } : {}) })).bundle];
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Is the city repairing reported potholes within seven days?", legs: legs(docs), draw: true })).id;
  return { world, ann, project, docs, id };
};
const pageOf = async (w, o = {}) => {
  const { door, session } = w.world.boot(w.ann);
  const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + w.id, ...o });
  await p.settle();
  return p;
};
const legOf = (target, n) => ({ target, role: "supports", ...(n === undefined ? {} : { extent_kind: "doc-para", extent_para: n }) });

test("R23 R24 R34 C36 each leg draws the words it cites, told apart by them: three legs on three documents (two of one name) in the units' real shape (null run) draw their own words; control: the same units without the null fields draw the same words", async () => {
  const w = await worldOf((docs) => [legOf(docs[0], 1), legOf(docs[1], 2), legOf(docs[2], 1)]);
  const p = await pageOf(w);
  const rows = supportsRows(p);
  assert.equal(rows.length, 3);
  assert.ok(rows[0].textContent.includes(PDF_WORDS) && !rows[0].textContent.includes(OTHER_WORDS), "the first leg: its paragraph's words");
  assert.ok(rows[1].textContent.includes(WEB_WORDS), "the web leg: its paragraph's words");
  assert.ok(rows[2].textContent.includes(OTHER_WORDS) && !rows[2].textContent.includes(PDF_WORDS), "a second document with the same name is told apart by its words");
  assert.ok(says(rows[0], "screen.question.leg.paragraph", { n: "2" }) && says(rows[1], "screen.question.leg.paragraph", { n: "3" }), "and the place: the paragraph");
  /* control: the units without the null fields (the shape that always matched) draw the same words, so the null fields were the cause: the world's own readings, their null fields taken off */
  const bare = async (r) => {
    const real = await w.ann.read("reading", { query: { sha256: r.query.sha256 } });
    return ok({ ...real, text_units: (real.text_units || []).map((u) => ({ ...u, extent: Object.fromEntries(Object.entries(u.extent).filter(([, v]) => v !== null)) })) });
  };
  const q = await pageOf(w, { plane: { reading: bare } });
  assert.ok(supportsRows(q)[0].textContent.includes(PDF_WORDS) && supportsRows(q)[1].textContent.includes(WEB_WORDS), "control: the same words from units without null fields");
});

test("R23 R34 C36 a leg named only draws no words and no bytes: a whole-document leg, a leg whose page the reading holds no unit for, and a leg narrower than the unit (a rect) draw none", async () => {
  /* a held PDF's text is undetermined in the world (no pdf-worker member), so the reading holds no unit for any of its pages */
  const w = await worldOf((docs) => [legOf(docs[0]), { target: docs[3], role: "supports", extent_kind: "pdf-page", extent_page: 1 }, { target: docs[3], role: "supports", extent_kind: "pdf-page", extent_page: 0 }]);
  const p = await pageOf(w);
  const rows = supportsRows(p);
  assert.equal(rows.length, 3);
  for (const r of rows) assert.equal(r.querySelector("[data-leg-words]"), null, "no words drawn");
  const all = rows.map((r) => r.textContent).join(" ");
  for (const t of [PDF_WORDS, WEB_WORDS, OTHER_WORDS, "Page two words.", "Intro."]) assert.ok(!all.includes(t), "no invented words: " + t);
  /* a leg narrower than the unit: a page with a rect, over a PDF whose text is decoded (a font that carries its map): the page's words are drawn for the leg without the rect */
  const decoded = await worldOf((docs) => [{ target: docs[3], role: "supports", extent_kind: "pdf-page", extent_page: 0 }, { target: docs[3], role: "supports", extent_kind: "pdf-page", extent_page: 0, extent_rect: [10, 10, 100, 100] }], { fonts: ["type0"] });
  const rect = supportsRows(await pageOf(decoded));
  assert.ok(rect[0].querySelector("[data-leg-words]"), "control: the same page, no rect, draws its words");
  assert.equal(rect[1].querySelector("[data-leg-words]"), null, "no words drawn for a rect");
  assert.ok(!rect[1].textContent.includes(rect[0].querySelector("[data-leg-words]").textContent), "no invented words");
  /* a leg that names no extent at all draws the document, no words */
  const none = await worldOf((docs) => [legOf(docs[0])]);
  const bare = await pageOf(none);
  assert.equal(supportsRows(bare)[0].querySelector("[data-leg-words]"), null, "a leg with no extent draws no words");
  assert.ok(supportsRows(bare)[0].textContent.includes(TITLE), "it names its document");
});

/* ------------------------------------------------------------------------------------------------------------------ C81 */

const LONG = "Administrative Instruction 4.12, the repair of reported potholes within seven calendar days of the report by the Director of Public Works";
const LONG_WORDS = "The Director shall repair each reported pothole within seven calendar days of the report and shall record the closing of every report in the public ledger without delay or exception";
/* what the question's page reads of the record, which the phone's scripted plane answers from the world's door as the member (onPhone hands each answer `{op, query, body}`) */
const THE_RECORD = ["image", "inquirystrength", "basisversions", "hypotheses", "questionwaits", "inquirypartition", "importedcases", "backlinks", "queue", "projectparticipants", "themeread",
  "publishedfrozen", "reevaluations", "reading", "plans"];
const fromWorld = (world, who) => ({ plane: Object.fromEntries(THE_RECORD.map((op) => [op, ({ query, body }) => world.door({ url: "/api/?" + new URLSearchParams({ ...query, op }),
  init: { method: body === undefined ? "GET" : "POST", headers: { "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }, headers: {} }, who)])) });
/** A project of `mai`'s (the page's own member) and a question of hers: three held pages named LONG whose paragraph is LONG_WORDS, the first two cited as supports, the third
 *  cutting against it, and a reading standing on them (none cited when `legs` is false); `busy` adds what the rows with an empty first cell hold: a decision the project made, a plan, a theme
 *  and a question that cites it; `waits` makes the question the one a document set aside is waited on by (the world's recipe, which makes its own question, with no passage cited). By real
 *  acts. Answers `{path, o}` for `onPhone`. */
const phoneWorld = async ({ legs = true, busy = false, waits = false } = {}) => {
  const world = await storeWorld();
  const mai = await world.signIn("mai", OWN);
  const project = await world.recipes.project(mai, "Pothole repairs");
  const docs = [];
  for (let i = 0; i < 3; i++) docs.push((await world.recipes.page(mai, LONG, { paragraphs: [LONG_WORDS + ` Part ${i + 1}.`], project })).bundle);
  const cite = (target, role) => ({ target, role, extent_kind: "doc-para", extent_para: 1 });
  const aside = waits ? await world.recipes.setAside(mai, { project }) : null;
  const id = aside ? aside.question : (await world.recipes.question(mai, project, { title: "Seven days", text: "Is the city repairing reported potholes within seven days?", draw: true,
    legs: legs ? [cite(docs[0], "supports"), cite(docs[1], "supports"), cite(docs[2], "cuts_against")] : [] })).id;
  if (legs && !waits) {
    await mai.act("conclude", { query: { target: id, project, reading: "Yes: repairs are made within seven days.", falsifier: "Work orders dated later show otherwise." } });
    await mai.act("withdrawconclusion", { query: { target: id, project, reason: "to read it again" } });
  }
  if (aside) await mai.act("drawquestion", { query: { project, inquiry: id, note: "" } });
  if (busy) {
    await mai.act("proposedispose", { body: { project, finding: id, to: "deferred", reason: "wait for the budget to be passed by the council" } });
    await mai.act("planopen", { body: { project, title: "Fix potholes quickly", subjects: [{ kind: "inquiry", inquiry: id }] } });
    const theme = await mai.act("themedeclare", { body: { name: "Pothole speed", test: "the document concerns how fast potholes are repaired" } });
    await mai.act("themeplace", { body: { theme: theme.theme_id, target: docs[0], note: "ref" } });
    await world.recipes.question(mai, project, { title: "Another question about the potholes of the city and its repair crews", legs: [{ target: id }], draw: true });
  }
  return { path: "/app/question/" + id, o: fromWorld(world, mai) };
};
const openAll = async (page) => { await page.evaluate(() => document.querySelectorAll("#cs-main details").forEach((d) => { d.open = true; })); };
const squeezed = (b) => b.width < 100 || b.height > 90;
const SEVER = word("act.sever.label.question"), NARROW = word("act.narrow.label.question"), CITE = word("act.cite.label.question"), RESTORE = word("act.heldrestore.label.question"), FIND = word("act.search.label.question");
const mine = (r) => r.small.filter((s) => !s.startsWith("a.cs-ref") && !/^a\. /.test(s));

test("R5 C81 the question at 390 px with long titles, long cited words and the legs' words drawn: the main area does not scroll sideways, 'Remove a citation' and 'Narrow the question' are inside the screen and 44 px or more each way", async () => {
  const r = await onPhone({ width: 390, controls: [SEVER, NARROW, CITE], ...(await phoneWorld()) });
  assert.ok(r.mainScroll <= 390, "the main area is no wider than the screen: " + r.mainScroll);
  assert.deepEqual(r.over, [], "nothing runs past the screen");
  for (const name of [SEVER, NARROW, CITE]) {
    assert.ok(r.boxes[name].length > 0, name + " is drawn");
    for (const b of r.boxes[name]) assert.ok(b.left >= 0 && b.right <= 390 && b.width >= 44 && b.height >= 44 && !squeezed(b), `${name} inside the screen and not squeezed: ${JSON.stringify(b)}`);
  }
  assert.deepEqual(mine(r), [], "no button or summary under 44 px (inline reference links are the shared stylesheet's)");
});

test("R5 C81 the question's own rows at 390 px: with no passage cited the three ways in sit inside the screen, with their acts at full width; what it waits on and the rows with an empty first cell are not squeezed", async () => {
  const empty = await onPhone({ width: 390, controls: [FIND, word("question.adddoc")], before: openAll, ...(await phoneWorld({ legs: false })) });
  assert.ok(empty.mainScroll <= 390, "state c: the main area is no wider than the screen: " + empty.mainScroll);
  assert.deepEqual(empty.over, [], "state c: nothing runs past the screen");
  assert.ok(empty.boxes[FIND].length > 0 && empty.boxes[word("question.adddoc")].length > 0, "state c: both drawn");
  for (const name of [FIND, word("question.adddoc")]) for (const b of empty.boxes[name]) assert.ok(b.right <= 390 && b.width >= 100 && b.height <= 90, `state c: ${name} not squeezed: ${JSON.stringify(b)}`);
  const full = await onPhone({ width: 390, controls: [RESTORE, FIND], before: openAll, ...(await phoneWorld({ legs: false, busy: true, waits: true })) });
  assert.ok(full.mainScroll <= 390 && full.over.length === 0, "the busy page stays inside the screen");
  for (const name of [RESTORE, FIND]) { assert.ok(full.boxes[name].length > 0, name + " is drawn"); for (const b of full.boxes[name]) assert.ok(b.right <= 390 && b.width >= 100 && b.height <= 90, `${name} (what it waits on) not squeezed: ${JSON.stringify(b)}`); }
  assert.deepEqual(mine(full), [], "no button or summary under 44 px");
});

test("R5 C81 control: at 1280 px no control runs past the screen, and the controls the change did not touch sit where they did (text left, act right)", async () => {
  const r = await onPhone({ width: 1280, controls: [SEVER, CITE], before: openAll, ...(await phoneWorld({ busy: true })) });
  assert.deepEqual(r.over, [], "nothing past the screen at 1280");
  const near = (b, left, right) => Math.abs(b.left - left) <= 2 && Math.abs(b.right - right) <= 2;
  assert.ok(r.boxes[SEVER].length === 3 && r.boxes[SEVER].every((b) => near(b, 602, 913)), "'Remove a citation' stays where it was drawn before the change (measured on the unchanged screen): " + JSON.stringify(r.boxes[SEVER]));
  assert.ok(r.boxes[CITE].every((b) => near(b, 208, 335)), "'Cite a passage' stays at the text's left edge");
  const empty = await onPhone({ width: 1280, controls: [word("question.adddoc")], ...(await phoneWorld({ legs: false })) });
  assert.ok(empty.boxes[word("question.adddoc")].every((b) => b.right > 1000 && b.right <= 1280), "state c at 1280: the act is at the right, inside the screen");
});

/* ------------------------------------------------------------------------------------------------------------------ rereads (K4370) */

const screen = SCREENS.find((s) => s.id === "question");
const READS = { inquiry: "image", strength: "inquirystrength", basis: "basisversions", hunches: "hypotheses", waits: "questionwaits", partition: "inquirypartition", imports: "importedcases", relies: "backlinks" };
const readCounts = (p) => Object.fromEntries(Object.entries(READS).map(([name, op]) => [name, p.byOp(op).length]));
const changed = (a, b) => Object.keys(a).filter((k) => b[k] !== a[k]);
/* hypotheses' real refusal of a hunch with no words (R1: `HYPOTHESIS_NO_STATEMENT`) */
const refusedAct = ok(holdRefusals().HYPOTHESIS_NO_STATEMENT);

test("R2 R113 every act of the question screen declares the reads it changes: a list of names that exist in its reads, or 'all'", () => {
  const names = Object.keys(screen.reads({ subject: Q }));
  assert.deepEqual(names.sort(), Object.keys(READS).sort(), "the reads this test names are the screen's");
  assert.ok(screen.acts.length > 20);
  for (const a of screen.acts) {
    assert.ok(a.rereads === "all" || Array.isArray(a.rereads), `${a.op} declares rereads`);
    if (Array.isArray(a.rereads)) for (const n of a.rereads) assert.ok(names.includes(n), `${a.op} names a read the screen holds: ${n}`);
  }
});

/** A page of the question `qid`, served by the world for `as`, over the plane's own answers but for the ones a test overrides. */
const worldPage = async (world, as, qid, plane = {}) => {
  const { door, session } = world.boot(as);
  const page = await boot({ screens: SCREENS, door, session, path: "/app/question/" + qid, plane });
  await page.settle();
  return page;
};
test("R2 R113 a hunch held re-reads the hunches and no other read; control: a refused act re-reads nothing", async () => {
  /* a real question resting on a document the member holds; the hunch is held by the page's own act */
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  const held = await world.recipes.hold(ann, "Minutes", "The council met on Monday.", project);
  const qid = (await world.recipes.question(ann, project, { title: "Seven days", text: "Is the city repairing reported potholes within seven days?", draw: true,
    legs: [{ target: held.bundle, role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture" }] })).id;
  const p = await worldPage(world, ann, qid);
  const a = readCounts(p);
  p.doc.getElementById("question-hunch").value = "Crews close reports when they inspect, not when they repair.";
  await press(p, "hypothesishold");
  const b = readCounts(p);
  assert.equal(p.byOp("hypothesishold").length, 1, "the act was sent");
  assert.deepEqual(changed(a, b), ["hunches"], "exactly the declared read: " + JSON.stringify({ a, b }));
  assert.equal((await ann.read("hypotheses", { query: { inquiry: qid } })).hypotheses.length, 1, "and it reached the store: the hunch is held");
  /* control: the same act refused re-reads nothing */
  const r = await worldPage(world, ann, qid, { hypothesishold: refusedAct });
  const x = readCounts(r);
  r.doc.getElementById("question-hunch").value = "A suspicion.";
  await press(r, "hypothesishold");
  assert.equal(r.byOp("hypothesishold").length, 1, "the refused act was sent");
  assert.deepEqual(changed(x, readCounts(r)), [], "control: a refused act re-reads nothing");
});

test("R2 R113 a document restored re-reads what the question waits on and no other read", async () => {
  /* the world's recipe: a capture request drained, its copy promoted and set aside by the member's own act (K4428's restore is the page's) */
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  const aside = await world.recipes.setAside(ann, { project });
  assert.equal((await ann.read("questionwaits", { query: { question: aside.question } })).document_waits.length, 1, "the document set aside is waited on");
  const p = await worldPage(world, ann, aside.question);
  const b = readCounts(p);
  await press(p, "heldrestore", { reason: "it is the right year" });
  const c = readCounts(p);
  assert.equal(p.byOp("heldrestore").length, 1, "the restore was sent");
  assert.deepEqual(changed(b, c), ["waits"], "exactly the declared read: " + JSON.stringify({ b, c }));
  assert.equal((await ann.read("questionwaits", { query: { question: aside.question } })).document_waits.length, 0, "and it reached the store: the document is restored");
});
