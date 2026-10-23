/* basis-version-grammar R11 (T51 fix round 2, C41; K4312): a version refused because a supporting leg has no ground
   carries `legs`, the ids of every such leg, so a caller can name them. Pure: the grammar over a frontmatter object. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DOC, DOC2, fm, findingsOf, codes } from "./helper.mjs";

const refusal = (x) => findingsOf(x).find((f) => f.code === "VERSION_PARTITION_INCOMPLETE");
const placed = { version: "first", target: DOC, role: "supports", ground: "main" };
const unplaced = (target) => ({ version: "first", target, role: "supports" });

test("R11: a version with two supporting legs, one placed, is refused with `legs` naming the other", () => {
  const f = refusal(fm({ legs: [placed, unplaced(DOC2)] }));
  assert.ok(f, "the version is refused");
  assert.deepEqual(f.legs, [DOC2]);
});

test("R11: every unplaced supporting leg is named, in the order of the document, and a cutting leg is not", () => {
  const cutting = { version: "first", target: "INFO-2026-0004-d", role: "cuts_against" };
  const f = refusal(fm({ legs: [unplaced(DOC2), placed, cutting, unplaced("INFO-2026-0003-c")] }));
  assert.deepEqual(f.legs, [DOC2, "INFO-2026-0003-c"]);
});

test("R11: the legs of another version are not named", () => {
  const second = { name: "second", description: "the second account of it", relationship: "and", state: "suggested", hidden: false, derived_from: null };
  const x = fm({ more: [second], legs: [placed, unplaced(DOC2), { version: "second", target: "INFO-2026-0003-c", role: "supports", ground: "g" }],
                 grounds: [{ version: "first", ground: "main", asserted_by: "member:alice", at: "2026-09-27T00:00:00Z" },
                           { version: "second", ground: "g", asserted_by: "member:alice", at: "2026-09-27T00:00:00Z" }] });
  assert.deepEqual(refusal(x).legs, [DOC2]);
});

test("R11 control: a version that concludes carries no such finding, and no finding carries `legs`", () => {
  const x = fm({ legs: [placed] });
  assert.deepEqual(codes(x), []);
  assert.ok(findingsOf(x).every((f) => f.legs === undefined));
});

test("R11 control: findings other than the partition's carry no `legs`", () => {
  const x = fm({ v: { relationship: "or" } });
  assert.ok(codes(x).includes("VERSION_RELATIONSHIP_DISAGREES"));
  assert.ok(findingsOf(x).every((f) => f.legs === undefined));
});
