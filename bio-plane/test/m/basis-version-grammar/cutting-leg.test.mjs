/* basis-version-grammar R3 (T51 fix round 2, C1): a version's totality (C-2.8) counts only the legs that support. A leg
   cutting against needs no ground and never makes a version refused. Pure: the grammar over a frontmatter object. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DOC, DOC2, fm, codes } from "./helper.mjs";

const CUTTING = { version: "first", target: DOC2, role: "cuts_against" };

test("R3: a version of one supporting leg in a one-part partition and one cutting leg with no ground is not refused", () => {
  const x = fm({ legs: [{ version: "first", target: DOC, role: "supports", ground: "main" }, CUTTING] });
  assert.deepEqual(codes(x), []);
});

test("R3: a version whose only legs cut against, with no ground declared, is not refused", () => {
  const x = fm({ legs: [CUTTING], grounds: [] });
  assert.deepEqual(codes(x), []);
});

test("R3 control: a supporting leg left out of the partition is a necessary leg and no finding, beside a cutting leg or not (fix round 10, cause 30b)", () => {
  const supports = (target) => ({ version: "first", target, role: "supports" });
  const labelled = { version: "first", target: DOC, role: "supports", ground: "main" };
  assert.deepEqual(codes(fm({ legs: [labelled, supports(DOC2)] })), []);
  assert.deepEqual(codes(fm({ legs: [labelled, supports(DOC2), { ...CUTTING, target: "INFO-2026-0003-c" }] })), []);
});
