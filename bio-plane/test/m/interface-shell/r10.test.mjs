/* interface-shell fix round 10 (K5148, K5150): R108 the wizard mark is a 44 px target in the phone block; R32 a stored sign-in whose
   whoami is answered 401 on the first load draws front's ended state, an unknown token none (screens-entry J10's R34 finding). */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, refused } from "./harness.mjs";
import { ALL, FRONT } from "./screens.fixture.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { MARKS } from "../../../src/op-grades/index.mjs";

const SCREENS = [...ALL, FRONT];
const stateOf = (p) => (p.doc.getElementById("state") || { textContent: "" }).textContent;
const screenOf = (p) => p.root().querySelector("#cs-main").getAttribute("data-screen");

test("R108 the phone block's 44 px rule names the wizard mark `.cs-wizmark` (drawn by screens-wizards), as it names the shell's other controls", async () => {
  const p = await boot({ screens: ALL, path: "/app/held", phone: true });
  const rule = /@media \(max-width:760px\)\{[^]*?\n([^\n{]*\.cs-btn[^\n{]*)\{min-height:44px;min-width:44px\}/.exec(p.html);
  assert.ok(rule, "the phone block's rule giving targets 44 px");
  const selectors = rule[1].split(",").map((x) => x.trim());
  for (const mine of [".cs-btn", ".cs-wizmark"]) assert.ok(selectors.includes(mine), mine + " in the 44 px rule");
  /* control: the mark's rule is added in the phone block alone (R108): the page holds `.cs-wizmark` nowhere else */
  assert.equal(p.html.split(".cs-wizmark").length - 1, 1);
});

test("R32 a stored sign-in whose whoami answers 401 on the first load draws front's ended state; control: an unknown token (no record) draws none", async () => {
  for (const path of ["/app", "/app/held"]) {
    const ended = await boot({ screens: SCREENS, path, plane: { whoami: refused("MEMBER_TOKEN_RETIRED", null, 401) } });
    assert.equal(screenOf(ended), "front", path);
    assert.equal(stateOf(ended), "fx t state ended", path);
  }
  const none = await boot({ screens: SCREENS, session: null, path: "/app" });
  assert.equal(stateOf(none), "fx t state none");
  const unknown = await boot({ screens: SCREENS, path: "/app", plane: { whoami: refused("NOT_AUTHENTICATED") } });
  assert.equal(stateOf(unknown), "fx t state none", "a refusal that is no 401 ends nothing: the plain front");
});


