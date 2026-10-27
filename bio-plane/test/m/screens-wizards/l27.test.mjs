/* T51 fix round (FR-47; L27 / T-02; DEC-384): a step on a subject screen never navigates without its subject (R20). The walk
   of the whole library in the real page is `walk.test.mjs` (R21). Answered by the real store through the world's door (K5175;
   `world.mjs`): the questions and documents a member holds are held by the recipes, the clock moved on between them. */
import test from "node:test";
import assert from "node:assert/strict";
import { standIn, unhtml, said } from "./standin.mjs";
import { team, authored, withSubjects, listed, WELCOME_SCRIPT } from "./world.mjs";

const STEP4 = "wizard." + WELCOME_SCRIPT.id + ".step4";
const stepsOn = (...screens) => screens.map((screen) => ({ screen, act: null, what: "a", why: "b" }));

test("R20 the welcome's step 4 with no question held draws its three none keys in place, navigates nowhere, and the door opens the project choice, then project with Open a question rung", async () => {
  const t = await team();
  const g = standIn({ team: t, as: t.rosa, values: { "wz-subject": t.P2 } });
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
  const mine = (await t.rosa.read("projectlist")).projects;
  assert.ok(g.render().includes('id="wz-subject"') && mine.every((x) => g.render().includes(x.name)));
  // then a new question: project on the chosen project, "Open a question" (promote) rung, nothing pressed
  g.cs.ring = (op) => { g.rings.push(op); return true; };
  await g.control("subjectgo");
  assert.deepEqual(g.nav, [["project", t.P2]]);
  assert.deepEqual(g.rings, ["promote"], "the guide rings Open a question and presses nothing");
  assert.ok(g.requests.every((r) => ["wizardread", "startfrom", "wizardprogress", "wizardsat", "list", "projectlist"].includes(r.op)), "no act is sent");
  // the ring is once: a later step on another screen rings its own act, not promote
  const rung = g.rings.length;
  await g.enter("project", t.P2);
  assert.equal(g.rings.length, rung, "promote is not rung again");
});

test("R20 the door with no project to choose says wizard.subject.none.project in its fold and opens nothing", async () => {
  const t = await team();
  const g = standIn({ team: t, as: t.ivy });
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
  const t = await team();
  const subj = await withSubjects(t, { questions: 2 });
  const g = standIn({ team: t, as: t.mai });
  await g.enter("wizards");
  await g.start({ script: WELCOME_SCRIPT.id, at: 4 });
  const latest = (await listed(t.mai, "inquiry")).reduce((a, b) => (String(b.last_updated) > String(a.last_updated) ? b : a)).bundle_id;
  assert.equal(latest, subj.questions[1], "the store gives the later one the later update");
  assert.deepEqual(g.nav, [["question", latest]], "the most recently updated, not the first listed");
  assert.ok(!g.render().includes('id="wz-subject"') && !g.render().includes("data-guide-nosubject"), "no choice asked, no none state");
  assert.ok(unhtml(g.render()).includes(said(STEP4 + ".what")), "the step's own words");
  // a later step on a question screen opens the same one
  await g.control("next");
  await g.control("next");
  assert.ok(g.nav.every(([s, id]) => s !== "question" || id === latest));
  assert.equal(g.requests.filter((r) => r.op === "list" && r.query.type === "inquiry").length, 1, "read once for the run");
});

test("R20 the most recent is taken by last_updated, the list's order for equals", async () => {
  const t = await team();
  /* two questions held in the same instant (the clock is not moved between them) */
  const a = (await t.world.recipes.question(t.mai, t.P1, { title: "A question", text: "Is it A?" })).id;
  const b = (await t.world.recipes.question(t.mai, t.P1, { title: "B question", text: "Is it B?" })).id;
  const rows = await listed(t.mai, "inquiry");
  assert.equal(rows.length, 2);
  assert.equal(rows[0].last_updated, rows[1].last_updated, "equal instants");
  const s = await authored(t, { name: "Read the question", steps: stepsOn("question") });
  const g = standIn({ team: t, as: t.mai });
  await g.start({ script: s.script });
  assert.deepEqual(g.nav, [["question", rows[0].bundle_id]]);
  assert.ok([a, b].includes(rows[0].bundle_id));
});

test("R20 a document step: with documents it opens the most recent and asks nothing; with none it stays on the card with its own words and Next", async () => {
  const t = await team();
  const s = await authored(t, { name: "Cite then look", steps: [{ screen: "document", act: "cite", what: "Cite it", why: "Because" }, { screen: "finder", act: null, what: "Then look", why: "Elsewhere" }] });
  // none: the screen is not opened
  const h = standIn({ team: t, as: t.mai });
  await h.enter("home");
  await h.start({ script: s.script });
  assert.deepEqual(h.nav, [], "a document step never opens `Nothing is here`");
  assert.equal(h.view.screen, "home");
  const text = unhtml(h.render());
  assert.ok(text.includes("Cite it") && text.includes("Because"), "the step's own words, the library holding no none words for it");
  assert.ok(!h.render().includes('data-guide="door"'), "no door where the library holds none");
  assert.ok(h.render().includes('data-guide="next"'));
  await h.control("next");
  assert.deepEqual(h.nav, [["finder", null]], "Next goes on to the next step");
  // with documents: the most recent
  const subj = await withSubjects(t, { documents: 2 });
  const g = standIn({ team: t, as: t.mai });
  await g.enter("home");
  await g.start({ script: s.script });
  assert.deepEqual(g.nav, [["document", subj.documents[1]]]);
  assert.deepEqual(g.requests.filter((r) => r.op === "list").map((r) => r.query), [{ type: "information", limit: "500" }]);
  assert.ok(!g.render().includes('id="wz-subject"'));
});

test("R20 the unopened step is counted once, and Back to it opens nothing either", async () => {
  const t = await team();
  const g = standIn({ team: t, as: t.mai });
  await g.enter("wizards");
  await g.start({ script: WELCOME_SCRIPT.id, at: 4 });
  await g.control("next");
  await g.control("back");
  assert.deepEqual(g.nav.filter(([s]) => s === "question"), []);
  assert.deepEqual(g.progress().filter((b) => b.script === WELCOME_SCRIPT.id && b.event === "step").map((b) => b.step), [4, 5]);
});

test("R20 a question the member last held opens at once, reads no list; a step on a screen with no subject opens at once", async () => {
  const t = await team();
  const subj = await withSubjects(t, { questions: 2 });
  const g = standIn({ team: t, as: t.mai });
  await g.enter("question", subj.questions[0]);
  await g.enter("home");
  await g.start({ script: WELCOME_SCRIPT.id, at: 4 });
  assert.deepEqual(g.nav, [["question", subj.questions[0]]]);
  assert.equal(g.requests.filter((r) => r.op === "list").length, 0, "nothing to read");
  const s = await authored(t, { name: "Look", steps: stepsOn("finder") });
  const f = standIn({ team: t, as: t.mai });
  await f.start({ script: s.script });
  assert.deepEqual(f.nav, [["finder", null]]);
  assert.equal(f.requests.filter((r) => r.op === "list" || r.op === "projectlist").length, 0);
});

test("R20 a project step still asks, or says it has none (R17, R18 unchanged)", async () => {
  const t = await team();
  const s = await authored(t, { name: "Time it", steps: stepsOn("timeline") });
  const g = standIn({ team: t, as: t.mai, values: { "wz-subject": t.P1 } });
  await g.start({ script: s.script });
  assert.deepEqual(g.nav, []);
  assert.ok(g.render().includes('id="wz-subject"'));
  await g.control("subjectgo");
  assert.deepEqual(g.nav, [["timeline", t.P1]]);
});
