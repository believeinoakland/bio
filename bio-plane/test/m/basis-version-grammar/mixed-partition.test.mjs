/* basis-version-grammar R3 (fix round 10, cause 30b; K5077; DEC-32 clause 4, as `inquiry-grammar` R68): "labelled all or
   none" (C-25.5) applies to grounds only as R68 states them. A supporting leg that names no ground, beside legs that do,
   is a necessary leg of the version and no finding; a version with no ground at all is clean. Pure: the grammar over a
   frontmatter object, the shape a question `{basis: [A in a ground, B unlabelled]}` copies into a version. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DOC, DOC2, T, fm, findingsOf, codes } from "./helper.mjs";

const labelled = { version: "first", target: DOC, role: "supports", ground: "main" };
const necessary = { version: "first", target: DOC2, role: "supports" };

test("R3: a version of one labelled ground and one unlabelled supporting leg raises no finding (the walker's case)", () => {
  assert.deepEqual(findingsOf(fm({ legs: [labelled, necessary] })), []);
});

test("R3: unlabelled supporting legs beside two labelled grounds are the one necessary part, and no finding", () => {
  const grounds = [{ version: "first", ground: "main", asserted_by: "member:alice", at: T },
                   { version: "first", ground: "other", asserted_by: "member:alice", at: T }];
  const x = fm({ v: { relationship: "or" }, grounds,
                 legs: [labelled, { ...labelled, target: "INFO-2026-0003-c", ground: "other" }, necessary, { ...necessary, target: "INFO-2026-0004-d" }] });
  assert.deepEqual(codes(x), []);
});

test("R3: a version with no ground at all (grounds empty, every supporting leg necessary) is clean", () => {
  assert.deepEqual(codes(fm({ legs: [necessary, { ...necessary, target: DOC }], grounds: [] })), []);
});

test("R3 control: beside an unlabelled supporting leg, a leg naming an undeclared ground is still refused (C-25.6)", () => {
  assert.deepEqual(codes(fm({ legs: [necessary, { ...necessary, target: "INFO-2026-0003-c", ground: "main" }], grounds: [] })),
    ["VERSION_GROUND_UNASSERTED"]);
});

test("R3 control: beside an unlabelled supporting leg, an empty declared ground is still refused (C-25.15)", () => {
  const grounds = [{ version: "first", ground: "main", asserted_by: "member:alice", at: T },
                   { version: "first", ground: "empty", asserted_by: "member:alice", at: T }];
  assert.deepEqual(codes(fm({ legs: [labelled, necessary], grounds })), ["VERSION_ORPHAN_ROW"]);
});
