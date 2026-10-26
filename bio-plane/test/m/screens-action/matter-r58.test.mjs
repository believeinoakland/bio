/* screens-action R58 (T51 fix round 10; DEC-438 (UX-DESIGN U480); K5299): the matter draws the three sentences DEC-438 gives its cases and the body's
   help, each through the world's real reads, and each is absent when its condition does not hold. */
import test from "node:test";
import assert from "node:assert/strict";
import { matterWorld, question as concluded, inWorld } from "./world-A.mjs";
import { openIn } from "./world.mjs";
import { main, text, W, refused } from "./page.mjs";

// R58: C2a (1), the event picker when the project has no dated event
test("R58: a project with no dated event draws, in place of the event picker, the sentence that says so and where to record one; control: a project with an event draws the picker and not the sentence", async () => {
  const { world, me } = await inWorld({ handle: "olive" });
  const project = await world.recipes.project(me, "Stormwater");
  const p = await openIn(world, me, `/app/matter/${project}`);
  assert.ok(text(p).includes(W("screen.matter.event.none")), "the sentence");
  assert.equal(main(p).querySelector("#mt-d-event"), null, "no picker is drawn over nothing");
  // control: a project whose document follows an event offers it
  const w = await matterWorld();
  const q = await openIn(w.world, w.me, `/app/matter/${w.project}`);
  assert.ok(main(q).querySelector("#mt-d-event"), "the picker");
  assert.ok(!text(q).includes(W("screen.matter.event.none")), "no sentence");
});

// R58: C2a (2), above Record a determination when no finding is held to rest it on
test("R58: with no finding held to rest a determination on, the determination says so above Record a determination; control: with a published finding it does not", async () => {
  const { world, me } = await inWorld({ handle: "olive" });
  const project = await world.recipes.project(me, "Stormwater");
  const p = await openIn(world, me, `/app/matter/${project}`);
  const t = text(p);
  assert.ok(t.includes(W("screen.matter.determine.needscase")), "the sentence");
  assert.ok(t.includes(W("screen.matter.record.this")), "the record button");
  assert.ok(t.indexOf(W("screen.matter.determine.needscase")) < t.indexOf(W("screen.matter.record.this")), "above it");
  // control: the matter's own finding is published, so there is one to rest on
  const w = await matterWorld();
  const q = await openIn(w.world, w.me, `/app/matter/${w.project}`);
  assert.ok(!text(q).includes(W("screen.matter.determine.needscase")));
});

// R58: walk C C-M11, a concluded question no published case holds
test("R58 (walk C C-M11): a concluded question no published case holds says it is concluded and not yet a finding, beside its title; control: with none such, the sentence is absent", async () => {
  const w = await matterWorld();
  await concluded(w.world, w.me, w.project, w.docs[1], "Was the memo signed in March?", { conclude: "It was signed on March 2." });
  const p = await openIn(w.world, w.me, `/app/matter/${w.project}`);
  const apart = main(p).querySelector('[data-list="concluded-unpublished"]');
  assert.ok(apart, "drawn apart");
  assert.ok(text(p, apart).includes("Was the memo signed in March?"), "its title");
  assert.ok(text(p, apart).includes(W("screen.matter.concluded.unpublished")), "the sentence");
  // control: the only concluded question is published
  const q = await matterWorld();
  const r = await openIn(q.world, q.me, `/app/matter/${q.project}`);
  assert.ok(!text(r).includes(W("screen.matter.concluded.unpublished")));
});

// R58: DEC-438 C2a (a), the body is chosen among the team's offices and bodies and helped
test("R58: the determination's body is a choice among the team's offices and bodies, helped by its sentence; control: with the body read failed, neither the choice nor the help is drawn", async () => {
  const w = await matterWorld();
  const p = await openIn(w.world, w.me, `/app/matter/${w.project}`);
  assert.ok(main(p).querySelector("#mt-d-body"), "the choice");
  assert.ok(text(p).includes(W("screen.matter.f.body.help")), "its help");
  // control: the team's entities cannot be read
  const q = await openIn(w.world, w.me, `/app/matter/${w.project}`, { entitieskind: refused("NO_ENTITY", "the owner's own sentence") });
  assert.equal(main(q).querySelector("#mt-d-body"), null, "no choice");
  assert.ok(!text(q).includes(W("screen.matter.f.body.help")), "no help");
});
