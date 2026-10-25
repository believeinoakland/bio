/* interface-shell, K5178 (T51; SCREENS-INVESTIGATE #16 J28 (1)): the re-points R73 and R55 name. `person`'s second act `linecurrentthrough`
   (screens-investigate R1: stating a holder current through a day) is not the registry's for `person`, so it is a named re-point. */
import "./register.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { checkScreens, RE_POINTS } from "../../../src/interface-shell/index.mjs";

const screen = (id, ...ops) => ({ id, render: () => "", acts: ops.map((op) => ({ op })) });

test("R73 K5178 a person screen naming linecurrentthrough is served, the holder stated current through a day; control: another unlisted op on person, and linecurrentthrough on another screen, still throw", () => {
  assert.equal(checkScreens([screen("person", "linecurrentthrough")]), true);
  assert.throws(() => checkScreens([screen("person", "stepsourcewithdraw")]), /person.*stepsourcewithdraw/);
  assert.throws(() => checkScreens([screen("explore", "linecurrentthrough")]), /explore.*linecurrentthrough/);
});
