/* basis-versions R54 (T50; N1136; K3402; K231): a version name outside the name form has a code of its own.
   `VERSION_NAME_MALFORMED` (C-25.36) for a name that is not 1 to 64 permitted characters, its words read by key;
   `VERSION_NAME_NOT_UNIQUE` (C-25.2) only for a name another version of the question already carries. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge } from "./fixture.mjs";
import { BASIS_VERSION_CHECKS } from "../../../src/basis-versions/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const codesOf = (r) => (r.findings ?? []).map((f) => f.code).filter((c) => c.startsWith("VERSION_NAME"));

function offer(name, extra = {}) {
  const w = world();
  w.doc(DOC);
  return { w, r: w.inquiry(Q, block(merge(version(name, [DOC]), extra))) };
}

test("R54: a name of 65 characters gives VERSION_NAME_MALFORMED and not VERSION_NAME_NOT_UNIQUE, with the row's number and the list's words; nothing lands", () => {
  const { w, r } = offer("n".repeat(65));
  assert.deepEqual([r.ok, r.reason, codesOf(r)], [false, "BASIS_VERSION_REFUSED", ["VERSION_NAME_MALFORMED"]]);
  const f = r.findings.find((x) => x.code === "VERSION_NAME_MALFORMED");
  assert.deepEqual([f.check, f.translation], ["C-25.36", word("refusal.VERSION_NAME_MALFORMED")]);
  assert.equal(BASIS_VERSION_CHECKS.VERSION_NAME_MALFORMED.translation, word("refusal.VERSION_NAME_MALFORMED"));
  assert.equal(w.record.head(Q), null, "nothing landed");
  for (const bad of ["with/slash", " ", "-leads with a dash", 'a"quote']) {
    const x = offer(bad);
    assert.ok(codesOf(x.r).includes("VERSION_NAME_MALFORMED") && !codesOf(x.r).includes("VERSION_NAME_NOT_UNIQUE"), bad);
  }
});

test("R54: a duplicate gives VERSION_NAME_NOT_UNIQUE and not VERSION_NAME_MALFORMED", () => {
  const dup = { versions: [{ name: "twin", description: "a second reading under the same name", relationship: "and", state: "suggested" }] };
  const { w, r } = offer("twin", dup);
  assert.deepEqual([r.ok, codesOf(r)], [false, ["VERSION_NAME_NOT_UNIQUE"]]);
  assert.equal(r.findings.find((x) => x.code === "VERSION_NAME_NOT_UNIQUE").check, "C-25.2");
  assert.equal(w.record.head(Q), null);
});

test("R54 control: a valid unique name raises neither, at 1 and at 64 characters", () => {
  for (const name of ["a", "n".repeat(64), "A plain name_1.0-x"]) {
    const { r } = offer(name);
    assert.equal(r.ok, true, `${name}: ${JSON.stringify(r).slice(0, 200)}`);
  }
});
