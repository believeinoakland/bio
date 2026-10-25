/* screens-inquiry fix round 2 (T51), the `project` screen: C43 (R39, R116: a question's card names its title and its strength once,
 * never the record id), C63 (R1, R36: Plan what to do opens the plan page), C90 (R75, R29: a sole owner's Stand down is not offered).
 * On interface-shell's served page over the real world (store-assembly's store with the real door; the state is made by real acts, K5054); every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { open, storeWorld, main, actsIn, fill, press, says, section, word, batchStrength, SCREENS, P, Q } from "./fixtures.mjs";

const at = "/app/project/" + P;
const cardOf = (p, q) => section(p, "screen.project.questions.head").querySelectorAll(".cs-row").find((r) => r.querySelector(`a[href$="${q}"]`));
const TITLE = "Is the city repairing reported potholes within seven days?";
const OWN = { capabilities: ["contribute", "create_projects"] };
/** A project made by `ann` with a document held in it and a question drawn into it resting on that document (`legs` as the recipe reads them; none cites the document ungraded), all by real acts. */
const worldOf = async (legs) => {
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  const doc = (await world.recipes.hold(ann, "Policy memo", "The Director shall repair each reported pothole within seven days.", project)).bundle;
  const q = (await world.recipes.question(ann, project, { title: "Seven days", text: TITLE, legs: legs ? legs(doc) : [{ target: doc, role: "supports" }], draw: true })).id;
  return { world, ann, project, doc, q, at: "/app/project/" + project };
};
/** The project's page as `as` reads it, over the world's door (`plane` overrides only the ops it names). */
const pageOf = async (world, as, path, o = {}) => {
  const { door, session } = world.boot(as);
  const p = await boot({ screens: SCREENS, door, session, path, ...o });
  await p.settle();
  return p;
};
const everything = (el) => el.outerHTML;

test("C43 R39 R116 a question's card on the project page draws no record id and the unrated reason once, where the plane's detail names ids", async () => {
  /* the real state: a question resting on a held document with no grade on any axis: both axes are unrated, and strength's detail names the document by its id */
  const w = await worldOf();
  const real = await w.ann.read("inquirystrength", { query: { id: w.q } });
  assert.ok(String(real.capture.detail).includes(w.doc) && String(real.connection.detail).includes(w.doc), "the plane's detail for the quiet axes names the record id");
  const p = await pageOf(w.world, w.ann, w.at);
  const card = cardOf(p, w.q);
  assert.ok(card, "the question's card is drawn");
  assert.ok(card.textContent.includes("Is the city repairing"), "the card names the question by its title");
  const html = card.outerHTML.replace(/href="[^"]*"/g, "");
  assert.ok(!/INQ-\d|INFO-\d/.test(html), "no record id in what the card draws (text or tips)");
  assert.equal(card.querySelectorAll('.cs-gap[data-gap="unrated"]').length, 2, "both axes keep their mark");
  const sentence = String(real.capture.detail).split(": ")[1].split(",")[0];
  assert.ok(sentence.length > 20 && !card.textContent.includes(sentence), "the plane's long sentence for the quiet axes is not repeated on the card");
  /* an undetermined reason the plane gives for both axes is told once (no act of the world leaves an axis undetermined: the strength is scripted here over the real question) */
  const und = { state: "undetermined", detail: `its owner has not settled ${w.doc}` };
  const q = await pageOf(w.world, w.ann, w.at, { plane: { inquirystrength: batchStrength((id) => ({ ok: true, target: id, capture: und, connection: und })) } });
  const c2 = cardOf(q, w.q);
  assert.equal(c2.querySelectorAll('.cs-gap[data-gap="undetermined"]').length, 2, "both axes keep their mark");
  assert.equal(c2.textContent.split("its owner has not settled").length - 1, 1, "the same reason is drawn once");
  assert.ok(!/INQ-\d|INFO-\d/.test(c2.outerHTML.replace(/href="[^"]*"/g, "")));
});

test("C43 R39 control: a graded card keeps its two grades and its title", async () => {
  const p = await open(at);
  const card = cardOf(p, Q);
  assert.deepEqual(card.querySelectorAll(".cs-grade").map((g) => g.textContent.slice(-1)), ["B", "C"]);
  assert.ok(card.textContent.includes("Is the city repairing"));
});

/* the screens of other modules a press opens: stand-ins, so the page serves them and navigation lands */
const stub = (id) => ({ id, reads: () => ({}), render: () => "", acts: [], words: [] });
const SERVED = { screens: [...SCREENS, stub("plan")] };

test("C63 R1 R36 Plan what to do opens the plan page it made; a refused or unanswered press stays on the project and opens none (control)", async () => {
  const w = await worldOf();
  const p = await pageOf(w.world, w.ann, w.at, SERVED);
  fill(p, { "project-plan": "Ask the committee", "project-plan-about": w.q });
  await press(p, "planopen");
  assert.deepEqual(p.byOp("planopen")[0].body, { project: w.project, title: "Ask the committee", subjects: [{ kind: "inquiry", inquiry: w.q }] });
  const made = (await w.ann.read("plans", { query: { project: w.project } }));
  const plans = Array.isArray(made.plans) ? made.plans : made.items || [];
  assert.equal(plans.length, 1, "the plan was made");
  assert.equal(p.location.pathname, "/app/plan/" + plans[0].id, "the plan page opens with the plan as subject");
  /* control: an empty title sends nothing and the project stays */
  const c = await pageOf(w.world, w.ann, w.at, SERVED);
  await press(c, "planopen");
  assert.equal(c.byOp("planopen").length, 0);
  assert.equal(c.location.pathname, w.at);
  /* control: an answer with no plan id opens nothing (the real act always names its plan: this answer alone is scripted over the world) */
  const n = await pageOf(w.world, w.ann, w.at, { ...SERVED, plane: { planopen: ok({ ok: true }) } });
  fill(n, { "project-plan": "x", "project-plan-about": w.q });
  await press(n, "planopen");
  assert.equal(n.location.pathname, w.at);
});

test("C90 R75 R29 the sole owner is drawn no Stand down (a vote that could never carry) and is told to add another owner first; with two owners it is offered (control); a member's row offers owner acts as before", async () => {
  /* the real state: ann made the project (its only owner) and dev joined it, invited by her */
  const world = await storeWorld();
  const ann = await world.signIn("ann", OWN);
  const dev = await world.signIn("dev", OWN);
  const project = await world.recipes.project(ann, "Pothole repairs");
  await ann.act("projectinvite", { query: { projectId: project, handle: "dev" }, body: {} });
  await dev.act("projectjoin", { query: { projectId: project }, body: {} });
  const path = "/app/project/" + project;
  const sole = await pageOf(world, ann, path);
  assert.ok(!actsIn(main(sole)).includes("projectownerremove"), "no stand-down act for the only owner");
  const row = section(sole, "screen.project.members.head").querySelector('[data-standdown="sole"]');
  assert.ok(row, "the row says why");
  assert.ok(says(row, "refusal.LAST_OWNER"), "by the held sentence that says add another owner first");
  assert.ok(actsIn(main(sole)).includes("projectowneradd"), "the owner can still make another an owner");
  /* control: a member who is not an owner is drawn neither (read before the second owner is made) */
  const mem = await pageOf(world, dev, path);
  assert.ok(!actsIn(main(mem)).includes("projectownerremove"));
  assert.equal(section(mem, "screen.project.members.head").querySelector('[data-standdown="sole"]'), null);
  await ann.act("projectowneradd", { query: { projectId: project, handle: "dev" }, body: {} });
  const two = await pageOf(world, ann, path);
  assert.ok(actsIn(main(two)).includes("projectownerremove"), "two owners: the stand-down is offered");
  assert.equal(section(two, "screen.project.members.head").querySelector('[data-standdown="sole"]'), null);
});
