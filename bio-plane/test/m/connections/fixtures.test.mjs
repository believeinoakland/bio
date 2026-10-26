/* connections: the published fixtures (fixtures.mjs), each checked against connections' real answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { themeReadWithPassage, connectionChooseMention, connectionChooseUnplaced } from "./fixtures.mjs";

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

test("R70: connectionChooseMention is the real connectionchoose answer for the second mention, its occurrence named", () => {
  const r = connectionChooseMention();
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.wrote, true);
  assert.equal(r.chosen.ref, "Ord. 1");
  assert.equal(typeof r.chosen.occurrence, "string", "the mention names the occurrence it chose");
});

test("R70: connectionChooseUnplaced is the real answer for a mention with no occurrence: the one read, chosen without a place", () => {
  const r = connectionChooseUnplaced();
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.wrote, true);
  assert.equal(r.chosen.ref, "Ord. 1");
});
