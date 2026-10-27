/* screens-intake T51 fix round 8 (SCREENS-INTAKE #22): G111, R29: Add opened for a question does not read every project's questions before it settles. The settle reads the
 * routed question's own project (at most one `projectquestions`); the other projects are read afterwards, once each, and the chooser then labels each question by its
 * project as before. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, main, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

/* Over the REAL store (fix round 10, K5054): 37 projects and 200 questions are made by the member's real acts (the project and question recipes), question i in
   project (i mod 37), and the page reads them through the owners' own `search`, `projectlist`, `projectquestions` and `image`. */
const COUNT_PROJECTS = 37, COUNT_QUESTIONS = 200;
/* one world for the file: the page only reads it, and making it is the cost (every test opens its own page over it) */
let made = null;
async function build() {
  if (made) return made;
  const t = await members({ mai: ["contribute", "create_projects"] });
  const projects = [];
  for (let i = 0; i < COUNT_PROJECTS; i++) projects.push(await t.world.recipes.project(t.mai, `Project ${i + 1}`));
  const ids = [];
  for (let i = 0; i < COUNT_QUESTIONS; i++) ids.push((await t.world.recipes.question(t.mai, projects[i % COUNT_PROJECTS], { title: `Question ${i + 1}`, text: `Question ${i + 1}`, draw: true })).id);
  made = { ...t, projects, ids };
  return made;
}
const ROUTED = (t) => t.ids[0];
const options = (p) => Array.from(main(p).querySelectorAll("#ci-for option")).map((o) => o.textContent);
const reads = (p) => p.byOp("projectquestions").map((r) => r.query.project);
const open = (t, path) => openWorld(path, { world: t.world, as: t.mai, screens: [...SCREENS, DOCUMENT_STUB] });

test("R29 (G111) Add opened for a question reads only the routed question's project by the time it settles", { timeout: 600000 }, async () => {
  const t = await build();
  const p = await open(t, `/app/capture/address/${ROUTED(t)}`);
  await p.settle();
  assert.ok(reads(p).length <= 1, `projectquestions reads at settle: ${reads(p).length}`);
  assert.deepEqual(reads(p), [t.projects[0]]);
  assert.ok(options(p).some((o) => o.includes("Question 1") && o.includes("Project 1")), "the routed question is told by its project at once");
});

test("R29 (G111) control: afterwards each other project is read once and every question is labelled by its project as before", { timeout: 600000 }, async () => {
  const t = await build();
  const p = await open(t, `/app/capture/address/${ROUTED(t)}`);
  await p.settle();
  await p.clock.tick(2000);
  for (let i = 0; i < 12; i++) await p.settle(20);
  const got = reads(p);
  assert.equal(got.length, 37, "one read per project");
  assert.equal(new Set(got).size, 37, "none twice");
  const o = options(p);
  assert.equal(o.length, 200);
  for (const i of [0, 1, 36, 37, 150, 199]) assert.ok(o.includes(`Question ${i + 1} · Project ${(i % 37) + 1}`), `question ${i + 1}: ${o[i]}`);
  await p.clock.tick(60000);
  for (let i = 0; i < 6; i++) await p.settle(20);
  assert.equal(reads(p).length, 37, "a later redraw reads nothing again");
});

test("R29 (G111) control: a screen opened for no question reads no project's questions", { timeout: 600000 }, async () => {
  const t = await build();
  const p = await open(t, "/app/capture/address");
  await p.clock.tick(5000);
  for (let i = 0; i < 6; i++) await p.settle(20);
  assert.equal(reads(p).length, 0);
});
