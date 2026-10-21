/* T51 fix round (FR-47; L27 / T-02; DEC-384): a step on a subject screen never navigates without its subject (R20). The walk
   of the whole library in the real page is `walk.test.mjs` (R21). */
import test from "node:test";
import assert from "node:assert/strict";
import { standIn, unhtml, said } from "./standin.mjs";
import { WELCOME_SCRIPT } from "./fixtures.mjs";

const okr = (result) => ({ ok: true, result });
const STEP4 = "wizard." + WELCOME_SCRIPT.id + ".step4";
const readWelcome = (q) => q.script !== WELCOME_SCRIPT.id ? { ok: false, code: "NO_SUCH_WIZARD" } : okr({ ok: true, script: { id: WELCOME_SCRIPT.id, name: said("wizard." + WELCOME_SCRIPT.id + ".name"), origin: "civicsmith" },
  version: { id: WELCOME_SCRIPT.id + "@1", state: "approved", steps: WELCOME_SCRIPT.steps } });
const GROUP_ID = "WIZ-00000000000000f1";
const readGroup = (steps) => () => okr({ ok: true, script: { id: GROUP_ID, name: "Walk it", origin: "group" }, version: { id: GROUP_ID + "@1", state: "approved", steps } });
const PROJECTS = okr({ ok: true, projects: [{ id: "P1", name: "Pothole repairs" }, { id: "P2", name: "The Coliseum lease" }] });
const QUESTIONS = okr({ ok: true, bundles: [
  { bundle_id: "INQ-1", title: "Are potholes repaired?", last_updated: "2026-09-01T10:00:00Z" },
  { bundle_id: "INQ-2", title: "Who pays for the lease?", last_updated: "2026-10-12T09:30:00Z" }] });
const DOCUMENTS = okr({ ok: true, bundles: [
  { bundle_id: "DOC-9", title: "The lease", last_updated: "2026-10-14T08:00:00Z" },
  { bundle_id: "DOC-3", title: "Council minutes", last_updated: "2026-08-20T08:00:00Z" }] });
const list = (inq, doc) => (q) => (q.type === "inquiry" ? inq : doc);
const plane = (steps, over = {}) => ({ wizardread: readGroup(steps), startfrom: okr({ ok: true, doors: [] }), wizardprogress: okr({ ok: true }),
  projectlist: PROJECTS, list: list(okr({ ok: true, bundles: [] }), okr({ ok: true, bundles: [] })), ...over });
const welcome = (over = {}) => ({ wizardread: readWelcome, startfrom: okr({ ok: true, doors: [] }), wizardprogress: okr({ ok: true }), projectlist: PROJECTS,
  list: list(okr({ ok: true, bundles: [] }), okr({ ok: true, bundles: [] })), ...over });

test("R20 the welcome's step 4 with no question held draws its three none keys in place, navigates nowhere, and the door opens the project choice, then project with Open a question rung", async () => {
  const g = standIn({ plane: welcome(), values: { "wz-subject": "P2" } });
  await g.enter("wizards");
  await g.start({ script: WELCOME_SCRIPT.id, at: 4 });
  assert.deepEqual(g.nav, [], "step 4 opens no screen on a null subject");
  assert.equal(g.view.screen, "wizards", "the member stays where she was");
  const html = g.render();
  const text = unhtml(html);
  assert.ok(text.includes(said(STEP4 + ".none.what")), "wizard.<id>.step4.none.what");
  assert.ok(text.includes(said(STEP4 + ".none.why")), "wizard.<id>.step4.none.why");
  assert.ok(text.includes(said(STEP4 + ".none.door")), "wizard.<id>.step4.none.door");
  assert.ok(!text.includes(said(STEP4 + ".what")) && !text.includes(said(STEP4 + ".why")), "in place of the step's own words");
  assert.ok(html.includes('data-guide="next"') && html.includes('data-guide="back"'), "Back and Next work as on any step");
  assert.equal(g.requests.filter((r) => r.op === "list").map((r) => r.query.type).join(), "inquiry");
  // the door opens the project choice
  assert.equal(g.requests.filter((r) => r.op === "projectlist").length, 0, "no project asked before the door is pressed");
  await g.control("door");
  assert.deepEqual(g.nav, [], "the choice is made before anything opens");
  assert.equal(g.requests.filter((r) => r.op === "projectlist").length, 1);
  assert.ok(g.render().includes('id="wz-subject"') && g.render().includes("Pothole repairs") && g.render().includes("The Coliseum lease"));
  // then a new question: project on the chosen project, "Open a question" (promote) rung, nothing pressed
  g.cs.ring = (op) => { g.rings.push(op); return true; };
  await g.control("subjectgo");
  assert.deepEqual(g.nav, [["project", "P2"]]);
  assert.deepEqual(g.rings, ["promote"], "the guide rings Open a question and presses nothing");
  assert.ok(g.requests.every((r) => ["wizardread", "startfrom", "wizardprogress", "wizardsat", "list", "projectlist"].includes(r.op)), "no act is sent");
  // the ring is once: a later step on another screen rings its own act, not promote
  const rung = g.rings.length;
  await g.enter("project", "P2");
  assert.equal(g.rings.length, rung, "promote is not rung again");
});

test("R20 the door with no project to choose says wizard.subject.none.project in its fold and opens nothing", async () => {
  const g = standIn({ plane: welcome({ projectlist: okr({ ok: true, projects: [] }) }) });
  await g.enter("wizards");
  await g.start({ script: WELCOME_SCRIPT.id, at: 4 });
  await g.control("door");
  const html = g.render();
  assert.ok(/<details[^>]* open[ >]/.test(html));
  assert.ok(unhtml(html).includes(said("wizard.subject.none.project")));
  assert.deepEqual(g.nav, []);
  assert.ok(html.includes('data-guide="next"'), "Next goes on");
});

test("R20 the welcome's step 4 with two questions opens the most recent, asks nothing, and keeps it for the run", async () => {
  const g = standIn({ plane: welcome({ list: list(QUESTIONS, DOCUMENTS) }) });
  await g.enter("wizards");
  await g.start({ script: WELCOME_SCRIPT.id, at: 4 });
  assert.deepEqual(g.nav, [["question", "INQ-2"]], "the most recently updated, not the first listed");
  assert.ok(!g.render().includes('id="wz-subject"') && !g.render().includes("data-guide-nosubject"), "no choice asked, no none state");
  assert.ok(unhtml(g.render()).includes(said(STEP4 + ".what")), "the step's own words");
  // a later step on a question screen opens the same one
  await g.control("next");
  await g.control("next");
  assert.ok(g.nav.every(([s, id]) => s !== "question" || id === "INQ-2"));
  assert.equal(g.requests.filter((r) => r.op === "list" && r.query.type === "inquiry").length, 1, "read once for the run");
});

test("R20 the most recent is taken by last_updated, the list's order for equals", async () => {
  const same = okr({ ok: true, bundles: [{ bundle_id: "A", title: "a", last_updated: "2026-10-01" }, { bundle_id: "B", title: "b", last_updated: "2026-10-01" }] });
  const g = standIn({ plane: plane([{ screen: "question", act: null, what: "a", why: "b" }], { list: list(same, same) }) });
  await g.start({ script: GROUP_ID });
  assert.deepEqual(g.nav, [["question", "A"]]);
});

test("R20 a document step: with documents it opens the most recent and asks nothing; with none it stays on the card with its own words and Next", async () => {
  const steps = [{ screen: "document", act: "cite", what: "Cite it", why: "Because" }, { screen: "finder", act: null, what: "Then look", why: "Elsewhere" }];
  const g = standIn({ plane: plane(steps, { list: list(QUESTIONS, DOCUMENTS) }) });
  await g.enter("home");
  await g.start({ script: GROUP_ID });
  assert.deepEqual(g.nav, [["document", "DOC-9"]]);
  assert.deepEqual(g.requests.filter((r) => r.op === "list").map((r) => r.query), [{ type: "information", limit: "500" }]);
  assert.ok(!g.render().includes('id="wz-subject"'));
  // none: the screen is not opened
  const h = standIn({ plane: plane(steps) });
  await h.enter("home");
  await h.start({ script: GROUP_ID });
  assert.deepEqual(h.nav, [], "a document step never opens `Nothing is here`");
  assert.equal(h.view.screen, "home");
  const text = unhtml(h.render());
  assert.ok(text.includes("Cite it") && text.includes("Because"), "the step's own words, the library holding no none words for it");
  assert.ok(!h.render().includes('data-guide="door"'), "no door where the library holds none");
  assert.ok(h.render().includes('data-guide="next"'));
  await h.control("next");
  assert.deepEqual(h.nav, [["finder", null]], "Next goes on to the next step");
});

test("R20 the unopened step is counted once, and Back to it opens nothing either", async () => {
  const g = standIn({ plane: welcome() });
  await g.enter("wizards");
  await g.start({ script: WELCOME_SCRIPT.id, at: 4 });
  await g.control("next");
  await g.control("back");
  assert.deepEqual(g.nav.filter(([s]) => s === "question"), []);
  assert.deepEqual(g.progress().filter((b) => b.event === "step").map((b) => b.step), [4, 5]);
});

test("R20 a question the member last held opens at once, reads no list; a step on a screen with no subject opens at once", async () => {
  const g = standIn({ plane: welcome({ list: list(QUESTIONS, DOCUMENTS) }) });
  await g.enter("question", "INQ-1");
  await g.enter("home");
  await g.start({ script: WELCOME_SCRIPT.id, at: 4 });
  assert.deepEqual(g.nav, [["question", "INQ-1"]]);
  assert.equal(g.requests.filter((r) => r.op === "list").length, 0, "nothing to read");
  const f = standIn({ plane: plane([{ screen: "finder", act: null, what: "a", why: "b" }]) });
  await f.start({ script: GROUP_ID });
  assert.deepEqual(f.nav, [["finder", null]]);
  assert.equal(f.requests.filter((r) => r.op === "list" || r.op === "projectlist").length, 0);
});

test("R20 a project step still asks, or says it has none (R17, R18 unchanged)", async () => {
  const g = standIn({ plane: plane([{ screen: "timeline", act: null, what: "a", why: "b" }]), values: { "wz-subject": "P1" } });
  await g.start({ script: GROUP_ID });
  assert.deepEqual(g.nav, []);
  assert.ok(g.render().includes('id="wz-subject"'));
  await g.control("subjectgo");
  assert.deepEqual(g.nav, [["timeline", "P1"]]);
});
