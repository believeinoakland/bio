/* connections: the published fixtures (fixtures.mjs), each checked against connections' real answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { themeReadWithPassage } from "./fixtures.mjs";

test("R44: themeReadWithPassage is the real themeread answer: the passage carries its extent and page 1, the document neither", () => {
  const r = themeReadWithPassage();
  const passage = r.members.find((m) => m.target_kind === "content");
  const whole = r.members.find((m) => m.target_kind === "document");
  assert.equal(passage.page, 1);
  assert.equal(passage.extent.kind, "pdf-page");
  assert.equal(passage.extent.page, 1);
  assert.equal(Object.hasOwn(whole, "page"), false);
  assert.equal(Object.hasOwn(whole, "extent"), false);
});
