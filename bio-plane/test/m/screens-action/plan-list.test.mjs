/* screens-action R25 (T51-122; DEC-329 (6); N1237): `plan` opened on a project draws its one live plan, its plans, or where one is started.
   The plans are the real store's: each opened by `planopen` of its own question, paused by `planpause`, closed by `planclose`. */
import test from "node:test";
import assert from "node:assert/strict";
import { actionWorld, openIn, planIn, colleague } from "./world-D.mjs";
import { main, text, W, D } from "./page.mjs";

const PATH = (project) => `/app/plan/${project}`;
const links = (p) => main(p).querySelectorAll("a.cs-ref").map((a) => [a.getAttribute("href"), a.textContent.trim()]).filter(([h]) => h.startsWith("/app/plan/"));

test("R25: a project with one open plan opens that plan at once, with no list; the read is `plans` for the project", async () => {
  const { world, me, project } = await actionWorld();
  await planIn(world, me, project, "Last year's list", { state: "closed" });
  const live = await planIn(world, me, project, "Repairs: closed is not repaired");
  const p = await openIn(world, me, PATH(project));
  assert.equal(p.byOp("plans")[0].query.project, project);
  await p.clock.tick(5);
  assert.equal(p.location.pathname, `/app/plan/${live.id}`, "the one live plan");
  assert.equal(main(p).querySelector("h1").textContent, live.title, "R1's page");
  assert.equal(links(p).length, 0, "no list");
});

test("R25: several live plans, or only closed ones, are listed: live first (open, paused), newest first, then closed; each row a reference with its state and who opened it", async () => {
  const { world, me, project } = await actionWorld();
  const ana = await colleague(world, me, project, "ana");
  const c = await planIn(world, me, project, "Last year's resurfacing list", { state: "closed" });
  const b = await planIn(world, me, project, "Response times by district", { state: "paused", who: ana });
  const a = await planIn(world, me, project, "Repairs: closed is not repaired");
  const p = await openIn(world, me, PATH(project));
  assert.equal(p.location.pathname, PATH(project), "several live plans: nothing opens");
  assert.deepEqual(links(p).map(([h]) => h), [a, b, c].map((x) => `/app/plan/${x.id}`));
  const t = text(p);
  assert.ok(t.includes(W("screen.plan.list.title")) && t.includes(W("screen.plan.list")), "the heading and the section");
  assert.ok(t.includes(W("screen.plan.state.open")) && t.includes(W("screen.plan.state.paused")) && t.includes(W("screen.plan.state.closed")));
  assert.ok(t.includes(W("screen.plan.opened", { date: D(b.opened_at), name: "ana" })), "the opener's handle");
  const other = await world.recipes.project(me, "Street trees");
  const lone = await planIn(world, me, other, "Last year's resurfacing list", { state: "closed" });
  const only = await openIn(world, me, PATH(other));
  assert.equal(only.location.pathname, PATH(other), "only closed: listed, never opened");
  assert.deepEqual(links(only).map(([h]) => h), [`/app/plan/${lone.id}`]);
});

test("R25: a project with no plan says where one is started, with no list and no empty heading; a failed read is drawn failed, never as no plan", async () => {
  const { world, me, project } = await actionWorld();
  const p = await openIn(world, me, PATH(project));
  assert.ok(text(p).includes(W("screen.plan.none")));
  assert.equal(main(p).querySelectorAll("section.cs-section").length, 0, "no empty heading");
  assert.equal(links(p).length, 0);
  const f = await openIn(world, me, PATH(project), { plans: { status: 502, text: "boom" } });
  assert.ok(main(f).querySelector('[data-state="failed"]'));
  assert.ok(!text(f).includes(W("screen.plan.none")), "control: never drawn as no plan");
});

test("R25: control: a plan id as the subject opens that plan as before; the back step lists the project's plans instead of opening it again", async () => {
  const { world, me, project } = await actionWorld();
  const plan = await planIn(world, me, project, "Repairs: closed is not repaired");
  const p = await openIn(world, me, `/app/plan/${plan.id}`);
  assert.equal(p.byOp("plans").length, 0, "a plan's id reads the plan, not the project's plans");
  assert.equal(main(p).querySelector("h1").textContent, plan.title);
  const q = await openIn(world, me, PATH(project));
  await q.clock.tick(5);
  assert.equal(q.location.pathname, `/app/plan/${plan.id}`);
  await q.back(PATH(project));
  assert.deepEqual(links(q).map(([h]) => h), [`/app/plan/${plan.id}`], "coming back lists the plan instead of opening it again");
});
