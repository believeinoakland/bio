/* journey-check R9 (journey 28's invitation, DEC-286; K4435): the walk finds, on the members screen the plane really draws, the
   one choice that lets the invited member start projects. The selector the walk uses (`START_PROJECTS_BOX`) is run against the
   screen drawn through screens-settings' own stand-in shell, never against a markup this module invents. */
import test from "node:test";
import assert from "node:assert/strict";

const { START_PROJECTS_BOX } = await import("../../../src/journey-check/journeys.mjs");
const { open } = await import("../screens-settings/kit.mjs");
const { team } = await import("../screens-settings/seed-members.mjs");

test("R9: the invitation form the administrator is drawn has exactly one choice that lets her start projects, and the walk's selector finds it; control: a selector for a box the screen does not draw finds none", async () => {
  const { w, founder } = await team();
  const a = await open("members", { world: w, as: founder });
  const found = a.b.doc.querySelectorAll(START_PROJECTS_BOX);
  assert.equal(found.length, 1, `the walk's selector ${START_PROJECTS_BOX} finds one box`);
  assert.equal(found[0].value, "create_projects");
  assert.equal(a.b.doc.querySelectorAll('input[name="mi-caps"][value="no_such_capability"]').length, 0);
});
