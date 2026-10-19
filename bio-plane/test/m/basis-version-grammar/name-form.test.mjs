/* basis-version-grammar R7 (moved from basis-versions R54; T50; N1136; K3402; K231): a version name outside the name form
   has a code of its own. `VERSION_NAME_MALFORMED` (C-25.36) for a name that is not 1 to 64 permitted characters, its
   words read by key; `VERSION_NAME_NOT_UNIQUE` (C-25.2) only for a name another version of the question already carries.
   The findings arm of `basis-versions`' `name-form.test.mjs`; its promotion arms stay there. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { BASIS_VERSION_GRAMMAR_CHECKS, VERSION_NAME_RE } from "../../../src/basis-version-grammar/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { fm, findingsOf } from "./helper.mjs";

const nameCodes = (x) => findingsOf(x).map((f) => f.code).filter((c) => c.startsWith("VERSION_NAME"));
const named = (name) => fm({ v: { name }, legs: [], grounds: [] });

test("R7: a name of 65 characters gives VERSION_NAME_MALFORMED and not VERSION_NAME_NOT_UNIQUE, with the row's number and the list's words", () => {
  const long = findingsOf(named("n".repeat(65)));
  assert.deepEqual(long.map((f) => f.code), ["VERSION_NAME_MALFORMED"]);
  assert.equal(long[0].check, "C-25.36");
  assert.equal(BASIS_VERSION_GRAMMAR_CHECKS.VERSION_NAME_MALFORMED.check, "C-25.36");
  assert.equal(BASIS_VERSION_GRAMMAR_CHECKS.VERSION_NAME_MALFORMED.translation, word("refusal.VERSION_NAME_MALFORMED"));
  for (const bad of ["with/slash", " ", "-leads with a dash", 'a"quote', "", undefined, 3]) {
    assert.deepEqual(nameCodes(named(bad)), ["VERSION_NAME_MALFORMED"], String(bad));
    if (typeof bad === "string") assert.equal(VERSION_NAME_RE.test(bad.trim()), false, `${bad} is outside the form`);
  }
});

test("R7: a duplicate gives VERSION_NAME_NOT_UNIQUE and not VERSION_NAME_MALFORMED", () => {
  const twin = fm({ more: [{ name: "first", description: "a second reading under the same name", relationship: "and", state: "suggested" }] });
  assert.deepEqual(nameCodes(twin), ["VERSION_NAME_NOT_UNIQUE"]);
  assert.equal(findingsOf(twin).find((x) => x.code === "VERSION_NAME_NOT_UNIQUE").check, "C-25.2");
  const padded = fm({ more: [{ name: "  first ", description: "a second reading under the same name", relationship: "and", state: "suggested" }] });
  assert.deepEqual(nameCodes(padded), ["VERSION_NAME_NOT_UNIQUE"], "names are compared trimmed");
});

test("R7 control: a valid unique name raises neither, at 1 and at 64 characters", () => {
  for (const name of ["a", "n".repeat(64), "A plain name_1.0-x"]) assert.deepEqual(nameCodes(named(name)), [], name);
});
