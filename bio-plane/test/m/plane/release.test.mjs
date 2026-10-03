/* plane R19 (DEC-121 (5); K1363 B11, K619): the plane's release suite for the required flows. `requiredFailures`
   (`wizard-scripts` R14) is held empty for the registration the plane carries in its bundle and registers at start: a
   required script of the Civicsmith library that the checks refuse fails this suite, and a release requires it (the
   `regression` workflow runs `npm test` in `bio-plane/`, which runs every module suite, this one among them). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { wizardRegistration } from "../../../src/plane/wizards.mjs";
import { requiredFailures } from "../../../src/wizard-scripts/index.mjs";

test("R19: every required script of the bundled Civicsmith library passes the checks against the bundled registration (requiredFailures is empty)", () => {
  const failures = requiredFailures(wizardRegistration());
  assert.deepEqual(failures, [], `a failing required flow blocks the release: ${JSON.stringify(failures)}`);
});

test("R19: the suite fails when a required script fails, and only a required one counts (negative control)", () => {
  const reg = wizardRegistration();
  const steps = [{ screen: "zz-no-such-screen", act: null, what: "Open the page", why: "To begin" }];
  const library = [...reg.library,
    { id: "WIZ-zz-required", name: "A required flow", required: true, version: 1, steps },
    { id: "WIZ-zz-optional", name: "An optional flow", required: false, version: 1, steps }];
  const failures = requiredFailures({ ...reg, library });
  assert.deepEqual(failures.map((f) => [f.id, f.refusal.code]), [["WIZ-zz-required", "WIZARD_SCREEN_UNKNOWN"]]);
  /* and one that walks a registered screen passes */
  const screens = [...reg.screens, { id: "zz-screen", acts: [] }];
  const fixed = [{ id: "WIZ-zz-required", name: "A required flow", required: true, version: 1,
                   steps: [{ ...steps[0], screen: "zz-screen" }] }];
  assert.deepEqual(requiredFailures({ ...reg, screens, library: [...reg.library, ...fixed] }), []);
});
