/* run-productions' published fixtures (`fixtures.mjs`), each called here and its real answer checked. A user's test takes
   these answers from the fixture; this file is what keeps them run-productions' own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SUGGEST_CHECKS } from "../../../src/run-productions/index.mjs";
import { suggestRefusals } from "./fixtures.mjs";

test("R3: suggestRefusals answers SUGGEST_BOILERPLATE (C-27.12) for a placeholder description, with its catalogue check and translation", () => {
  const { boilerplate } = suggestRefusals();
  assert.deepEqual([boilerplate.ok, boilerplate.code, boilerplate.check], [false, "SUGGEST_BOILERPLATE", "C-27.12"]);
  assert.equal(boilerplate.translation, SUGGEST_CHECKS.SUGGEST_BOILERPLATE.translation);
  assert.equal(boilerplate.wrote, false, "a verdict of R3 is asked before anything is written");
});

test("R3: suggestRefusals answers SUGGEST_UNWRITABLE_STATE (C-27.13) for a body that carries a member's state, with its catalogue check and translation", () => {
  const { unwritableState } = suggestRefusals();
  assert.deepEqual([unwritableState.ok, unwritableState.code, unwritableState.check], [false, "SUGGEST_UNWRITABLE_STATE", "C-27.13"]);
  assert.equal(unwritableState.translation, SUGGEST_CHECKS.SUGGEST_UNWRITABLE_STATE.translation);
});

test("R3: the two fixture answers are different refusals of the same suggestion, each caused by its own fault alone", () => {
  const { boilerplate, unwritableState } = suggestRefusals();
  assert.notEqual(boilerplate.code, unwritableState.code);
  assert.notEqual(boilerplate.check, unwritableState.check);
});
