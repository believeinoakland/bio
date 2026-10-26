/* journey-check R9 step 2 (K4435): "Start a project" asks who can find the project, and chooses neither for her; the walk, which
   starts a project through the screen's own controls, chooses one (hidden, the choice that keeps the project to the members it
   invites). The selector the walk uses is run against the Projects screen as the plane really draws it, through screens-daily's
   own harness, and the act is refused, as the real screen refuses it, when neither is chosen. */
import "../screens-settings/register.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { START_PROJECT_VISIBILITY } = await import("../../../src/journey-check/investigation.mjs");
const { open, ok, press, beside, last, MEMBER, word } = await import("../screens-daily/page.mjs");
const { assertDeclared } = await import("./tables.mjs");

test("R9: the Projects screen draws exactly one control for the walk's visibility choice; with it chosen \"Start the project\" sends, with neither chosen it is refused in place and sends nothing", async () => {
  // fixtures-own: harness journey-check walks a served plane and imports no module (K3100, K5062); the ops and codes of this table are held equal to the real ones by tables.mjs
  const table = { projectlist: ok({ ok: true, projects: [] }), whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }), promote: ok({ ok: true, bundleId: "PROJ-1" }) };
  assertDeclared(table, "the Projects table");
  const p = await open("/app/projects", table);
  assert.equal(p.doc.querySelectorAll(START_PROJECT_VISIBILITY).length, 1, `the walk's selector ${START_PROJECT_VISIBILITY} finds one control`);
  assert.equal(p.doc.querySelectorAll(START_PROJECT_VISIBILITY)[0].getAttribute("value"), "hidden");
  const b = await press(p, "promote", { values: { "projects-title": "Roof repairs" } });
  assert.equal(p.byOp("promote").length, 0, "neither chosen: nothing is sent");
  assert.equal(beside(p, b), word("project.visibility.start.required"));
  await press(p, "promote", { values: { "projects-title": "Roof repairs", "projects-visibility-hidden": true } });
  assert.equal(last(p, "promote").body.visibility, "hidden");
});
