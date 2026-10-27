/* screens-action's published contract `plan-screen-shape` (fix round 10; K4990, K5044): screens-inquiry's project screen
   registers a stand-in for the `plan` screen beside its own SCREENS, to follow the door it draws to a plan it opened.
   Its value is stated here as data and run through the shell's own check, together with this module's real `plan`
   screen: the stand-in must carry the id of the real one, and the shell must accept it in the real one's place. */
import test from "node:test";
import assert from "node:assert/strict";
import { checkScreens } from "../../../src/interface-shell/index.mjs";
import { SCREENS } from "../../../src/screens-action/index.mjs";

// fixtures-run: screens-inquiry plan-screen-shape
const STAND_IN = { id: "plan", reads: () => ({}), render: () => "", acts: [], words: [] };

test("plan-screen-shape (screens-action R1): the stand-in screens-inquiry registers for `plan` carries the real plan screen's id and the shell accepts it in that screen's place", () => {
  const real = SCREENS.find((s) => s.id === "plan");
  assert.ok(real, "this module draws a screen with the id `plan`");
  assert.equal(STAND_IN.id, real.id);
  assert.equal(checkScreens(SCREENS.map((s) => (s.id === real.id ? STAND_IN : s))), true);
  for (const key of ["id", "reads", "render", "acts", "words"]) assert.ok(key in real, `the real plan screen has \`${key}\`, as the stand-in does`);
});
