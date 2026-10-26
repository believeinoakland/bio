/* screens-inquiry fix round 2 (T51), the question screen: C34 (R104, R62: reopen a project-concluded finding by withdrawing the
 * conclusion), C36 (R23, R24, R34: each leg draws the first words of the passage it cites), C37 (R2: the parts of a leg and of the
 * read-back are separate elements), C41 (R35, R50, R117: BASIS_VERSION_REFUSED is drawn with its findings), C44 and C62 (R2: the
 * head and the crumb name the project). On interface-shell's served page over a scripted plane; every expectation is a word read by key
 * (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, storeWorld, main, actsIn, fill, press, inquiryMd, INQUIRY_REFS, BASIS, says, word, lead, SCREENS, P, Q, D, SHA, POLICY } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const OWN = { capabilities: ["contribute", "create_projects"] };
/** A project of `ann`'s with a held page for each of `docs` (`{title, paragraphs?}`) and questions of hers resting on the first `legsOf(targets)` (none: the first document, ungraded), by real acts.
 *  `page(id, opts)` boots a question's page over the world's door. `question(title, {draw})` makes another. */
const worldOf = async (docs = [{ title: "Pothole repair policy" }]) => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const targets = [];
  for (const d of docs) targets.push((await world.recipes.page(ann, d.title, { paragraphs: d.paragraphs || ["The Director shall repair each reported pothole within seven calendar days of the report."], project })).bundle);
  const question = async (title = "Seven days", { draw = true, legs = null } = {}) => (await world.recipes.question(ann, project, { title, text: "Is the city repairing reported potholes within seven days?",
    legs: legs ? legs(targets) : [{ target: targets[0], role: "supports" }], draw })).id;
  const page = async (id, o = {}) => {
    const { door, session } = world.boot(ann);
    const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + id, ...o });
    await p.settle();
    return p;
  };
  return { world, ann, project, targets, question, page };
};
/** the finding concluded within the project (its own state still open), by her real act */
const concludeIn = (w, id) => w.ann.act("conclude", { query: { target: id, project: w.project, reading: "Yes: repairs are made within seven days.", falsifier: "Work orders dated later show otherwise." } });
const refusedBody = (code, extra = {}) => ({ status: 200, json: { ok: true, result: { ok: false, reason: code, code, ...extra } } });

/* ------------------------------------------------------------------------------------------------------------------ C34 */

test("R104 R62 a finding concluded within a project (its own state still open) is reopened by withdrawing that conclusion: withdrawconclusion carries the project and the reason, and no reopen is sent", async () => {
  const w = await worldOf();
  const id = await w.question();
  await concludeIn(w, id);
  const p = await w.page(id);
  const fold = main(p).querySelector("details[data-reopen]");
  assert.ok(fold && says(fold.querySelector("summary"), "screen.question.reopen.summary"), "the fold is offered");
  assert.ok(says(await press(p, "reopen", { within: fold }), "screen.question.reopen.refused.noreason"), "the reason is required");
  assert.equal(p.byOp("withdrawconclusion").length + p.byOp("reopen").length, 0, "nothing sent without one");
  fill(p, { "question-reopen-why": "a later audit corrects the figure" });
  await press(p, "reopen", { within: fold });
  assert.equal(p.byOp("reopen").length, 0, "no state move is sent for it");
  const q = p.byOp("withdrawconclusion")[0].query;
  assert.deepEqual([q.target, q.project, q.reason], [id, w.project, "a later audit corrects the figure"]);
  assert.equal((await w.ann.read("basisversions", { query: { id, project: w.project } })).conclusion_stance, "withdrawn", "and the real act took the conclusion off the question");
});

test("R104 a question whose own state is concluded, or a disposition, is reopened by the state move, and withdrawconclusion is not sent for it; control: an open, unconcluded one draws neither", async () => {
  const w = await worldOf();
  /* each state made by the real act: concluded by her conclusion with no project; deferred and dismissed by the disposition of a question no project draws on */
  const made = { concluded: await w.question("Concluded on its own", { draw: false }), deferred: await w.question("Deferred", { draw: false }), dismissed: await w.question("Dismissed", { draw: false }) };
  await w.ann.act("conclude", { query: { target: made.concluded, reading: "Yes: repairs are made within seven days.", falsifier: "Work orders dated later show otherwise." } });
  for (const to of ["deferred", "dismissed"]) {
    const sel = await w.ann.act("select", { body: { ids: [made[to]] } });
    await w.ann.act("dispose", { query: { handle: sel.handle, to, reason: "waiting for the budget" } });
  }
  for (const state of ["concluded", "deferred", "dismissed"]) {
    const p = await w.page(made[state]);
    const fold = main(p).querySelector("details[data-reopen]");
    assert.ok(fold, state + ": the fold is offered");
    fill(p, { "question-reopen-why": "new evidence" });
    await press(p, "reopen", { within: fold });
    const q = p.byOp("reopen")[0].query;
    assert.deepEqual([q.target, q.reason], [made[state], "new evidence"], state);
    assert.equal(p.byOp("withdrawconclusion").length, 0, state);
  }
  const open1 = await w.page(await w.question("Still open"));
  assert.ok(!actsIn(main(open1)).includes("reopen") && !actsIn(main(open1)).includes("withdrawconclusion"));
  assert.equal(main(open1).querySelector("details[data-reopen]"), null);
});

test("R104 each failure has its own sentence: a withdrawal with nothing to withdraw, and a reopen of a finding that cannot be reopened", async () => {
  const w = await worldOf();
  const id = await w.question();
  await concludeIn(w, id);
  const wp = await w.page(id);
  /* the conclusion is taken off by her real act after the page was drawn: the page still offers the fold, and the owner answers there is nothing to withdraw */
  await w.ann.act("withdrawconclusion", { query: { target: id, project: w.project, reason: "a later audit corrects the figure" } });
  fill(wp, { "question-reopen-why": "a reason" });
  const sw = await press(wp, "reopen", { within: main(wp).querySelector("details[data-reopen]") });
  assert.ok(says(sw, "refusal.NOTHING_TO_WITHDRAW"), "the withdrawal's own sentence");
  /* a question concluded on its own that no published case carries cannot be reopened */
  const own = await w.question("Concluded on its own", { draw: false });
  await w.ann.act("conclude", { query: { target: own, reading: "Yes: repairs are made within seven days.", falsifier: "Work orders dated later show otherwise." } });
  const r = await w.page(own);
  fill(r, { "question-reopen-why": "a reason" });
  const sr = await press(r, "reopen", { within: main(r).querySelector("details[data-reopen]") });
  assert.ok(says(sr, "screen.question.reopen.refused.notsetdown") && !says(sr, "refusal.ILLEGAL_TRANSITION"), "the reopen's own sentence, not the release act's");
});

/* ------------------------------------------------------------------------------------------------------------------ C36 */

const SITE_TITLE = "A PDF from www.oaklandca.gov";
const WORDS_A = "The Director shall repair each reported pothole within seven calendar days of the report.";
const WORDS_B = "Repairs are recorded as closed when the crew reports the work complete.";
const supportsOf = (p) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.question.supports.head"));

test("R34 R23 R24 two legs on two documents with the same name draw different rows, each with the first words of its own passage and its place", async () => {
  /* the world holds no pdf-worker member, so a held PDF's text is undetermined: the two documents are web pages, cited at their paragraphs (a third, a PDF, is cited at its page, which has the place and no words) */
  const w = await worldOf([{ title: SITE_TITLE, paragraphs: [WORDS_A] }, { title: SITE_TITLE, paragraphs: [WORDS_B] }]);
  const pdf = (await w.world.recipes.pdf(w.ann, SITE_TITLE, { pages: 2, project: w.project })).bundle;
  const id = await w.question("Same name", { legs: (t) => [{ target: t[0], role: "supports", extent_kind: "doc-para", extent_para: 1 }, { target: t[1], role: "supports", extent_kind: "doc-para", extent_para: 1 },
    { target: pdf, role: "supports", extent_kind: "pdf-page", extent_page: 0 }] });
  const p = await w.page(id);
  const rows = main(p).querySelectorAll("[data-leg-words]");
  assert.equal(rows.length, 2);
  assert.ok(rows[0].textContent.includes("The Director shall repair each reported pothole") && !rows[0].textContent.includes("Repairs are recorded"));
  assert.ok(rows[1].textContent.includes("Repairs are recorded as closed") && !rows[1].textContent.includes("The Director shall repair"));
  const sup = supportsOf(p);
  assert.ok(sup.textContent.split(SITE_TITLE).length - 1 >= 2, "both rows still name their document");
  assert.ok(says(sup, "screen.question.leg.paragraph", { n: "2" }), "and the paragraph, drawn from one (title first)");
  assert.ok(says(sup, "screen.document.passage.where", { page: "1" }), "and the page, drawn from one");
});

test("R34 a web-page leg (no page, a part of the text) draws its cited words; control: a leg whose passage the reading does not hold draws none", async () => {
  const w = await worldOf([{ title: SITE_TITLE, paragraphs: ["Intro.", "Potholes reported through 311 are repaired within seven days."] }]);
  const pdf = (await w.world.recipes.pdf(w.ann, "The audit", { pages: 2, project: w.project })).bundle;
  const id = await w.question("Web page", { legs: (t) => [{ target: t[0], role: "supports", extent_kind: "doc-para", extent_para: 2 }, { target: pdf, role: "supports", extent_kind: "pdf-page", extent_page: 1 }] });
  const p = await w.page(id);
  const rows = main(p).querySelectorAll("[data-leg-words]");
  assert.equal(rows.length, 1, "one leg's words, none invented for the other (a PDF whose text the reading does not hold)");
  assert.ok(rows[0].textContent.includes("Potholes reported through 311 are repaired within seven days."));
});

/* ------------------------------------------------------------------------------------------------------------------ C37 */

test("R2 the parts of a leg and of the read-back are separate elements: a leg's carries line is set off from its name, and the read-back's lead and each passage are separated", async () => {
  const GROUNDS = [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }];
  const grouped = inquiryMd(P, INQUIRY_REFS, { legs: [{ target: D, role: "supports", grade: "B", ground: "part 1", extent_page: 0 }, { target: "INFO-2026-0006", role: "supports", grade: "B", ground: "part 1" }], grounds: GROUNDS });
  const a = await open(at, { images: { [Q]: { "bundle.md": grouped } } });
  const carries = main(a).querySelectorAll("[data-carries]");
  assert.ok(carries.length > 0);
  for (const c of carries) assert.equal(c.previousElementSibling && c.previousElementSibling.localName, "br", "the carries line follows a break, not the page number");
  const b = await open(at);
  const back = main(b).querySelector("[data-readback]");
  assert.ok(back);
  for (const el of back.children) if (el.localName !== "br") assert.ok(el.previousElementSibling === null || el.previousElementSibling.localName === "br", "no two parts of the read-back run together");
});

/* ------------------------------------------------------------------------------------------------------------------ C41 */

test("R35 R50 R117 a BASIS_VERSION_REFUSED answer lists its findings: the first finding's own translation and its repair, not only the generic sentence; control: BASIS_REFUSED is drawn as before", async () => {
  const finding = { check: "C-27.9", code: "VERSION_PARTITION_INCOMPLETE", detail: "version 'main' has 1 leg with no ground", translation: "Every passage must be placed in a part.", repairs: ["repair-sentinel-qq"] };
  /* still scripted (conclude's refusal): needed: no recipe can make it; VERSION_PARTITION_INCOMPLETE is held by basis-version-grammar but raised by no document (K5077) */
  const go = async (code, findings) => {
    const p = await open(at, { plane: { conclude: refusedBody(code, { findings }) } });
    fill(p, { "question-conclude-falsifier": "logs dated later", "question-conclude-reason": "it answers it" });
    return press(p, "conclude");
  };
  const slot = await go("BASIS_VERSION_REFUSED", [finding]);
  assert.ok(slot.textContent.includes("repair-sentinel-qq"), "the repair");
  assert.ok(!says(slot, "refusal.BASIS_VERSION_REFUSED") || slot.textContent.includes("give every leg"), "the finding is listed");
  /* a real finding code, as basis-version-grammar's catalogue gives it with its own words (`translation` is the row of its code): drawn by the word held for the code */
  const own = await go("BASIS_VERSION_REFUSED", [{ check: "C-27.1", code: "VERSION_PARTITION_INCOMPLETE", detail: "d", translation: word("refusal.VERSION_PARTITION_INCOMPLETE") }]);
  assert.ok(says(own, "refusal.VERSION_PARTITION_INCOMPLETE"), "the code's own words");
  const bare = await go("BASIS_VERSION_REFUSED", undefined);
  assert.ok(says(bare, "refusal.BASIS_VERSION_REFUSED"), "with no finding, the generic sentence");
  // fixtures-generic: SOMETHING_ELSE (a finding code made up on purpose: the control that BASIS_REFUSED is drawn by its detail, whatever code it carries)
  const old = await go("BASIS_REFUSED", [{ check: "C-9.9", code: "SOMETHING_ELSE", detail: "the leg names no edition" }]);
  assert.ok(old.textContent.includes("the leg names no edition"), "control: BASIS_REFUSED unchanged");
});

/* ------------------------------------------------------------------------------------------------------------------ C44, C62 */

/* still scripted (projectlist): needed: a recipe for a project whose record states no title (every project the world makes is titled), and one a member may not read (an image refused NO_SUCH_BUNDLE) */
const bareProject = { [P]: { "bundle.md": ["---", `id: ${P}`, "object_type: project", "---", ""].join("\n") } };
const listed = ok({ ok: true, projects: [{ id: P, name: "Pothole repairs" }] });

test("R2 the head and the crumb name the project even when its record states no title: the project list's name is read; control: the record's own title is not read past", async () => {
  const p = await open(at, { images: bareProject, plane: { projectlist: listed } });
  assert.ok(p.root().querySelector(".cs-crumbs").textContent.includes("Pothole repairs"), "the crumb");
  const sub = main(p).querySelector(".mk-sub");
  assert.ok(sub.textContent.includes("Pothole repairs"), "the head");
  const ref = main(p).querySelector('a.cs-ref[href="/app/project/' + P + '"]');
  assert.ok(ref && ref.textContent === "Pothole repairs");
  const titled = await open(at);
  assert.equal(titled.byOp("projectlist").length, 0, "control: with the title on the record the list is not read");
});

test("R2 a project that states no title and is listed by none draws no 'because' stub; a read that refused with words draws them after 'because'", async () => {
  const none = await open(at, { images: bareProject, plane: { projectlist: ok({ ok: true, projects: [] }) } });
  assert.ok(main(none).querySelector(".mk-sub"), "the head is drawn");
  assert.equal(main(none).querySelector('a.cs-ref[href="/app/project/' + P + '"]'), null, "no project link whose text is a dangling 'because'");
  const why = await open(at, { plane: { image: (r) => (r.query.id === P ? refusedIn("NO_SUCH_BUNDLE", "it is not readable by you") : ok(r.query.id === Q ? { "bundle.md": inquiryMd() } : null)), projectlist: ok({ ok: true, projects: [] }) } });
  assert.ok(main(why).querySelector(".mk-sub").textContent.includes(word("state.undetermined", { reason: "it is not readable by you" })));
});
