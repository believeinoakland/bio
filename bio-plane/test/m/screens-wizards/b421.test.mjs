/* T51 (B6 CHANGE, K4248; DEC-387 B421): a step whose subject is an action, a matter or a due date, with none held for the run,
   stays on the wizard's card with the step's own `none` words and the door "Open a plan" (R22, amending R20). The walk of the
   whole library in the real page is `walk.test.mjs` (R21). Answered by the real store through the world's door (K5175; `world.mjs`):
   the library's scripts are read as the store gives them. */
import test from "node:test";
import assert from "node:assert/strict";
import { standIn, unhtml, said } from "./standin.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { CIVICSMITH_LIBRARY, team } from "./world.mjs";

const scriptOf = (id) => CIVICSMITH_LIBRARY.find((s) => s.id === id);
const key = (id, n) => "wizard." + id + ".step" + n + ".none";

/* the steps the design drew a card for (U420, B421): script id, step, the kind of subject */
const CARDS = [
  ["WIZ-cb0ad18a17a04233", 9, "due-date"], ["WIZ-bd7bde2c61b6badb", 8, "due-date"],
  ["WIZ-33cece8a68e76f58", 1, "matter"], ["WIZ-33cece8a68e76f58", 2, "action"], ["WIZ-33cece8a68e76f58", 3, "matter"],
  ["WIZ-33cece8a68e76f58", 4, "matter"], ["WIZ-33cece8a68e76f58", 5, "due-date"],
  ["WIZ-d0cdcee9437b213b", 6, "action"], ["WIZ-d0cdcee9437b213b", 7, "action"],
  ["WIZ-a17835c4d8235f65", 4, "due-date"], ["WIZ-a8c349d7d71b6bb0", 7, "due-date"]];

test("R22 each step the design drew a card for, with no subject held, draws its none keys in place and navigates nowhere", async () => {
  for (const [id, n, kind] of CARDS) {
    assert.equal(scriptOf(id).steps[n - 1].screen, kind, `${id} step ${n} is on ${kind}`);
    const t = await team();
    const g = standIn({ team: t, as: t.rosa });
    await g.enter("wizards");
    await g.start({ script: id, at: n });
    assert.deepEqual(g.nav, [], `${id} step ${n} opens no screen on a null subject`);
    assert.equal(g.view.screen, "wizards");
    const html = g.render(), text = unhtml(html);
    for (const part of ["what", "why", "door"]) assert.ok(hasWord(key(id, n) + "." + part), `${key(id, n)}.${part} is a held word`);
    for (const part of ["what", "why", "door"]) assert.ok(text.includes(said(key(id, n) + "." + part)), `${id} step ${n} draws .none.${part}`);
    assert.ok(!text.includes(said("wizard." + id + ".step" + n + ".what")), "in place of the step's own words");
    assert.ok(html.includes('data-guide="next"'), "Next goes on");
    assert.equal(g.requests.filter((r) => r.op === "list").length, 0, "no list is read for a plan's subject");
  }
});

test("R22 the door \"Open a plan\" opens the project choice, then plan on the chosen project, ringing and pressing nothing", async () => {
  for (const [id, n] of [["WIZ-33cece8a68e76f58", 1], ["WIZ-33cece8a68e76f58", 2], ["WIZ-33cece8a68e76f58", 5]]) {
    const t = await team();
    const g = standIn({ team: t, as: t.rosa, values: { "wz-subject": t.P2 } });
    await g.enter("wizards");
    await g.start({ script: id, at: n });
    assert.equal(g.requests.filter((r) => r.op === "projectlist").length, 0, "no project asked before the door is pressed");
    await g.control("door");
    assert.deepEqual(g.nav, [], "the choice is made before anything opens");
    const html = g.render();
    const mine = (await t.rosa.read("projectlist")).projects;
    assert.ok(html.includes('id="wz-subject"') && mine.every((x) => html.includes(x.name)));
    await g.control("subjectgo");
    assert.deepEqual(g.nav, [["plan", t.P2]]);
    assert.deepEqual(g.rings, [], "nothing is rung");
    assert.ok(g.requests.every((r) => ["wizardread", "startfrom", "wizardprogress", "wizardsat", "projectlist"].includes(r.op)), "no act is sent");
  }
});

test("R22 the door with no project to choose says wizard.subject.none.project in its fold and opens nothing", async () => {
  const id = "WIZ-33cece8a68e76f58";
  const t = await team();
  const g = standIn({ team: t, as: t.ivy });
  await g.enter("wizards");
  await g.start({ script: id, at: 3 });
  await g.control("door");
  const html = g.render();
  assert.ok(/<details[^>]* open[ >]/.test(html));
  assert.ok(unhtml(html).includes(said("wizard.subject.none.project")));
  assert.deepEqual(g.nav, []);
  assert.ok(html.includes('data-guide="next"'), "Next goes on");
});

test("R22 control: a step whose subject the run holds draws no card and opens its screen on it; each kind", async () => {
  const id = "WIZ-33cece8a68e76f58";
  for (const [n, kind, subject] of [[1, "matter", "DET-1"], [2, "action", "ACT-1"], [5, "due-date", "ACT-1~0"]]) {
    const t = await team();
    const g = standIn({ team: t, as: t.rosa });
    await g.enter(kind, subject);
    await g.enter("home");
    await g.start({ script: id, at: n });
    assert.deepEqual(g.nav.slice(-1), [[kind, subject]], `${kind} opens on the subject last held there`);
    assert.ok(!unhtml(g.render()).includes(said(key(id, n) + ".what")), `${kind}: no card`);
    assert.ok(!g.render().includes('data-guide="door"'));
  }
});

test("R22 the card gives way when the member reaches the step's own screen on a subject, and the step is rung", async () => {
  const id = "WIZ-33cece8a68e76f58";
  const t = await team();
  const g = standIn({ team: t, as: t.rosa, drawn: { action: ["actioncorrespond"] } });
  await g.enter("wizards");
  await g.start({ script: id, at: 2 });
  assert.ok(unhtml(g.render()).includes(said(key(id, 2) + ".what")));
  await g.enter("action", "ACT-7");
  assert.ok(!unhtml(g.render()).includes(said(key(id, 2) + ".what")), "the none card is gone");
  assert.ok(unhtml(g.render()).includes(said("wizard." + id + ".step2.what")), "the step's own words are back");
});

test("R22 the unopened step is counted once, and Back and Next work from the card", async () => {
  const id = "WIZ-33cece8a68e76f58";
  const t = await team();
  const g = standIn({ team: t, as: t.rosa });
  await g.enter("wizards");
  await g.start({ script: id, at: 1 });
  await g.control("next");
  await g.control("back");
  await g.control("next");
  assert.deepEqual(g.progress().filter((b) => b.script === id && b.event === "step").map((b) => b.step), [1, 2]);
});
