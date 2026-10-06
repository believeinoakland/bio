/* plane R19 (DEC-121 (5); K1363 B11, K619): the plane's release suite for the required flows. `requiredFailures`
   (`wizard-scripts` R14) is held empty for the registration the plane carries in its bundle and registers at start: a
   required script of the Civicsmith library that the checks refuse fails this suite, and a release requires it (the
   `regression` workflow runs `npm test` in `bio-plane/`, which runs every module suite, this one among them). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { wizardRegistration, screenFailures } from "../../../src/plane/wizards.mjs";
import { SCREENS } from "../../../src/plane/screens.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { requiredFailures, SCREEN_REGISTRY } from "../../../src/wizard-scripts/index.mjs";

test("R19 (K1869 (2)): every required script of the bundled Civicsmith library passes the checks against the bundled registration, the registry's screens among it (requiredFailures is empty)", () => {
  assert.equal(wizardRegistration().screens, SCREEN_REGISTRY, "the design stream's registry wizard-scripts carries");
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

test("R24 (Q1-7): every screen of the registry the plane carries is {id, title, acts, purpose}, and every act it names is an op op-declarations declares", () => {
  assert.ok(SCREENS.length >= 20, `${SCREENS.length} screens`);
  for (const s of SCREENS) assert.deepEqual(Object.keys(s).sort(), ["acts", "id", "purpose", "title"], s.id);
  assert.deepEqual(screenFailures(SCREENS, OPS), [], "a screen naming an op no spec holds fails the release");
  /* the plane's own registry is answers' explain read's (store.mjs); wizard-scripts is registered with its own
     `SCREEN_REGISTRY` (K1869 (2)), so a required flow walks the registry's screens */
  assert.notEqual(wizardRegistration().screens, SCREENS);
});

test("R24 negative control: an entry naming an op no spec holds, a repeated id, or a missing purpose fails the suite", () => {
  const bad = [...SCREENS, { id: "zz", title: "Zz", acts: ["zz-no-such-op"], purpose: "x" }, { id: "queue", title: "Q", acts: [], purpose: "" }];
  assert.deepEqual(screenFailures(bad, OPS), [{ screen: "zz", problem: "no op spec", act: "zz-no-such-op" },
                                              { screen: "queue", problem: "no purpose" }, { screen: "queue", problem: "id repeated" }]);
});

test("R24 (DEC-149; T34-87, K1784): the screen purposes a member reads through the explain read call the group's Civicsmith \"your group's Civicsmith\", never \"this instance\", \"the instance\", \"this copy\", \"this plane\" or \"server\"", () => {
  const purpose = (id) => SCREENS.find((s) => s.id === id).purpose;
  assert.equal(purpose("record"), "The whole record as rows: every bundle your group's Civicsmith holds, with its type and its state.");
  assert.equal(purpose("members"), "Who holds what in your group's Civicsmith: the roster, each member's capabilities, and the invitations outstanding.");
  assert.equal(purpose("published"), "The cases your group's Civicsmith has published, readable by somebody holding no credential at all.");
  for (const s of SCREENS)
    for (const f of ["title", "purpose"])
      assert.doesNotMatch(s[f], /\b(?:this|the) (?:instance|copy|plane)\b|\bserver\b/i, `${s.id}.${f}`);
});
