/* following's published fixtures (fixtures.mjs), each called and compared with the real answer it stands for. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { watchedByRefusal } from "./fixtures.mjs";
import { world } from "./fixture.mjs";
import { FOLLOWING_CHECKS } from "../../../src/following/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

test("fixtures watchedByRefusal: the real watchedBy refuses an id no item of the marks list answers to with MARK_NO_SUCH_ITEM, writing nothing; it names the id it was asked about, and a blank id is refused the same way", () => {
  const r = watchedByRefusal();
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
    [false, "MARK_NO_SUCH_ITEM", "MARK_NO_SUCH_ITEM", FOLLOWING_CHECKS.MARK_NO_SUCH_ITEM.check, word("refusal.MARK_NO_SUCH_ITEM")]);
  assert.deepEqual(watchedByRefusal({ item: "OTHER-2026-0001-none" }), r, "the refusal does not depend on the id asked about");
  assert.equal(world().f.watchedBy("").code, "MARK_NO_SUCH_ITEM", "control: a blank id");
});
