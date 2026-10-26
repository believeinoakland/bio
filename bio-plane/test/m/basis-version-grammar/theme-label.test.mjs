/* basis-version-grammar R12 at the module's interface: the label a version leg hands to connections' themeLegFindings is
   plain words (its place and the version's name), never a field spelling such as `basis_version_legs[i]`. The theme
   finding itself is connections' (R73) and is pinned here by its code only. Each test drives basisVersionFindings over
   frontmatter objects, as grammar.test.mjs does. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { basisVersionFindings } from "../../../src/basis-version-grammar/index.mjs";
import { BUNDLE_CASES, bundleFiles } from "../inquiry-grammar/corpus.mjs";
import { fm, findingsOf } from "./helper.mjs";

const THEME = "THEME-2026-0101-abc123";
const themeLeg = (version, extra = {}) => ({ version, target: THEME, role: "supports", ground: "main", ...extra });
const themeFindings = (x) => findingsOf(x).filter((y) => y.code === "THEME_NOT_EVIDENCE");

test("R12: a version leg that names a theme raises THEME_NOT_EVIDENCE, and its message names the leg in plain words, never basis_version_legs", () => {
  const found = themeFindings(fm({ legs: [themeLeg("first")] }));
  assert.equal(found.length, 1, "control: the theme refusal is still raised for a version leg");
  assert.match(found[0].message, /^Leg 1 of version 'first' /, "the label is the leg's place and the version's name");
  assert.doesNotMatch(found[0].message, /basis_version_legs/, "no field spelling reaches the reader");
});

test("R12: the place is the leg's position in the version's legs, counted from one, across every version of the block", () => {
  const legs = [{ version: "first", target: "INFO-2026-0001-a", role: "supports", ground: "main" }, themeLeg("second")];
  const block = fm({
    v: {},
    legs,
    grounds: [{ version: "first", ground: "main", asserted_by: "member:alice", at: "2026-09-27T00:00:00Z" },
              { version: "second", ground: "main", asserted_by: "member:alice", at: "2026-09-27T00:00:00Z" }],
    more: [{ name: "second", description: "the second account of it", relationship: "and", state: "suggested",
             hidden: false, derived_from: null }],
  });
  const found = themeFindings(block);
  assert.equal(found.length, 1);
  assert.match(found[0].message, /^Leg 2 of version 'second' /);
});

test("R12: over the corpus, no finding that the version block raises names basis_version_legs", async () => {
  let bundles = 0;
  for (const id of Object.keys(BUNDLE_CASES)) {
    const md = bundleFiles(id).get("bundle.md");
    const doc = parseFrontmatter(typeof md === "string" ? md : new TextDecoder().decode(md)).data;
    if (!doc || !/^(inquiry|problem|focus)$/.test(String(doc.object_type))) continue;
    bundles++;
    for (const f of themeFindings(doc)) {
      assert.doesNotMatch(f.message, /basis_version_legs/, `${id}: ${f.code}`);
    }
  }
  assert.ok(bundles > 0, "the corpus carries inquiry bundles to read");
});

test("R12: a theme leg that cuts against a version gets the same refusal in the same plain words", () => {
  const found = themeFindings(fm({ legs: [themeLeg("first", { role: "cuts_against" })] }));
  assert.equal(found.length, 1);
  assert.match(found[0].message, /^Leg 1 of version 'first' /);
});
