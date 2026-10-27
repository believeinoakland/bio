/* screens-inquiry fix round 2 (T51), the `objective` screen: C58 (R106: a flow must exist before a measure names it, the open form
 * survives choosing a flow, and how it is going is read and drawn) and C62 (R106: the crumb names the project). On interface-shell's
 * served page over a scripted plane. Words by key (R44): each expectation is `word(key, vars)`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { word } from "../../../src/setup-words/index.mjs";
import { SCREENS, storeWorld } from "./fixtures.mjs";
import { boot, ok, refusedIn } from "../interface-shell/harness.mjs";
import { fill } from "./fixtures.mjs";

const COND = { progression: "PRG-rent", entity: "ENT-city", relation: null, filter: null, required: { grade: "B", stages: ["authorized"] }, satisfied: { share: 90 } };
/* the world: an owner `dev` of the project "Pothole repairs" she started, and `mai` joined to it, by the acts that make them (op-tables §5.3) */
async function team() {
  const world = await storeWorld();
  const dev = await world.signIn("dev", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(dev, "Pothole repairs");
  const mai = await world.signIn("mai", { capabilities: ["contribute"] });
  await dev.act("projectinvite", { query: { projectId: project, handle: "mai" } });
  await mai.act("projectjoin", { query: { projectId: project } });
  return { world, dev, project };
}
/** Two flows the group holds, defined by the real act; answers their keys. */
async function holdFlows(dev) {
  const stage = (key, label) => ({ key, label, cardinality: "1", required: "always" });
  await dev.act("progressiondefine", { body: { progressionKey: "PRG-rent", label: "Lease rent flow", basis: "the team's reading of the lease", stages: [stage("authorized", "Council signed off")] } });
  await dev.act("progressiondefine", { body: { progressionKey: "PRG-permits", label: "Permit flow", basis: "the team's reading of the permit office", stages: [stage("filed", "Filed")] } });
  return { rent: "PRG-rent", permits: "PRG-permits" };
}
/** The objective page of `project` as `me`, over the world's door; `plane` overrides an op the world cannot answer as the test needs. */
async function openAs(world, me, project, plane = {}) {
  const { door, session } = world.boot(me);
  const p = await boot({ screens: SCREENS, door, session, plane, path: "/app/objective/" + project });
  await p.settle();
  return p;
}
const main = (p) => p.doc.getElementById("cs-main");

test("C62 R106 the objective's crumb names the project from the project's own title, not its id; control: a project with no title draws no id", async () => {
  const { world, dev, project } = await team();
  const p = await openAs(world, dev, project);
  const crumbs = p.root().querySelector(".cs-crumbs");
  assert.ok(crumbs.textContent.includes("Pothole repairs"), "the project's name is in the crumb");
  assert.ok(!crumbs.textContent.includes(project), "never its id");
  const bare = await openAs(world, dev, project, { image: ok(null) });
  assert.ok(!bare.root().querySelector(".cs-crumbs").textContent.includes(project));
});

test("C58 R106 a flow typed where the group holds none draws the flow-must-exist sentence beside the field before anything is sent; control: a picker of held flows draws it not", async () => {
  const { world, dev, project } = await team();
  const p = await openAs(world, dev, project);
  assert.equal(p.doc.getElementById("ob-flow").localName, "input");
  assert.ok(main(p).querySelector('[data-note="flowfirst"]'), "the note is drawn");
  assert.ok(main(p).querySelector('[data-note="flowfirst"]').textContent.includes(word("refusal.INTENT_NO_SUCH_PROGRESSION")));
  assert.equal(p.byOp("objectivecondition").length, 0);
  /* and the plane's refusal of a typed name is that sentence too, never the plane's own jargon */
  const r = await openAs(world, dev, project);
  fill(r, { "ob-flow": "rent", "ob-ent": "city", "ob-share": "50", "ob-why": "Because." });
  await r.click(main(r).querySelectorAll('button[data-act="objectivecondition"]')[0]);
  const said = main(r).querySelectorAll('[role="alert"]').map((e) => e.textContent).join(" ");
  assert.ok(said.includes(word("refusal.INTENT_NO_SUCH_PROGRESSION")));
  assert.ok(!/progression|entity/i.test(said.replace(word("refusal.INTENT_NO_SUCH_PROGRESSION"), "")), "no jargon beside it");
  await holdFlows(dev);
  const held = await openAs(world, dev, project);
  assert.equal(held.doc.getElementById("ob-flow").localName, "select");
  assert.equal(main(held).querySelector('[data-note="flowfirst"]'), null, "control: flows exist, no note");
});

test("C58 R106 choosing a flow redraws the page with the measure's fold still open and the flow chosen; control: a page nobody touched has it closed", async () => {
  const { world, dev, project } = await team();
  const flows = await holdFlows(dev);
  const p = await openAs(world, dev, project);
  const fold = () => main(p).querySelectorAll("details").find((d) => d.querySelector("summary") && d.querySelector("summary").textContent === word("screen.objective.set-how-success-is-measured"));
  assert.ok(fold() && fold().getAttribute("open") === null, "closed at first");
  fold().setAttribute("open", "");
  const sel = p.doc.getElementById("ob-flow");
  sel.value = flows.permits;
  p.fire(sel, "change");
  await p.settle();
  assert.equal(p.doc.getElementById("ob-flow").value, flows.permits, "the flow chosen stays");
  assert.notEqual(fold().getAttribute("open"), null, "the fold stays open");
});

test("C58 R106 how it is going is read and drawn from the progress read: counts when it is computed, the not-counted-yet note when no measure is set; control: no read, no section", async () => {
  const { world, dev, project } = await team();
  await holdFlows(dev);
  const PROG = { ok: true, project, objective: "Whether the city kept the terms of its lease.", condition: COND, computable: true, matched: 12, meeting: 9, satisfied: false, undetermined: null, computed_at: "2026-10-20T09:00:00Z",
    short: [{ entity_id: "ENT-p1", entity_label: "Invoice 1", grade: "C", why: { stages_missing: ["authorized"] } }], undetermined: [] };
  const p = await openAs(world, dev, project, { objectiveprogress: ok(PROG) });
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.objective.how-it-is-going"));
  assert.ok(sec, "the section is drawn");
  assert.ok(sec.textContent.includes(word("screen.objective.rent-payments-meet-the-measure-are-short", { met: String(PROG.meeting), short: String(PROG.short.length) })));
  /* a measure nothing matches: the plane's own words for it fill the section, which is never blank */
  const ZERO = { ...PROG, matched: 0, meeting: 0, short: [], satisfied: null, satisfied_why: "No instance matches the measure yet." };
  const z = await openAs(world, dev, project, { objectiveprogress: ok(ZERO) });
  const sz = main(z).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.objective.how-it-is-going"));
  assert.ok(sz && sz.textContent.includes("No instance matches the measure yet."));
  const none = await openAs(world, dev, project);
  const s2 = main(none).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.objective.how-it-is-going"));
  assert.ok(s2.textContent.includes(word("screen.objective.not-counted-yet-no-measure-of-success-is-set")));
  const failed = await openAs(world, dev, project, { objectiveprogress: refusedIn("SOME_REFUSAL", "x") });
  assert.equal(main(failed).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.objective.how-it-is-going")), undefined);
});
