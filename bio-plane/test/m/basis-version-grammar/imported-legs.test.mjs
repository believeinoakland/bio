/* basis-version-grammar R3 (N522; DEC-112 (6), DEC-96 item 1): a version's leg on another group's finding. Its form is
   judged by inquiry-grammar R11 (C-21.3) in place of C-25.10 and C-25.14; whether an acceptance is in force at the edition
   it names is accepted-work R3's (C-21.4, C-21.5), the caller's and not this module's (the promotion half stays in
   `basis-versions`). The edition is inside the composition (R5), so the freeze sees it. Copied from `basis-versions`'
   `imported-legs.test.mjs` without its arms that drive a promotion. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { basisVersionFindings, versionsIn, versionAsWritten, isImportedRef } from "../../../src/basis-version-grammar/index.mjs";
import { DOC, T, version, fmOf } from "./helper.mjs";

const IMP = "a".repeat(64);
const REF = `imported:${IMP}/INQ-2026-0040-x`;

/* one version over DOC and the given imported legs, each `[ref, edition, extra]` */
function withRefs(name, refs, extra = {}) {
  const b = version(name, [DOC], extra);
  for (const [ref, edition, more] of refs)
    b.legs.push({ version: name, target: ref, target_edition: edition, role: "supports", ground: "main", ...(more || {}) });
  return b;
}

test("R3: a version's leg on an imported finding reference passes C-25.10 and C-25.14 when inquiry-grammar R11 judges its form, and a malformed one is R11's C-21.3, never C-25.10", () => {
  const ok = [];
  basisVersionFindings(fmOf(withRefs("first", [[REF, 2]])), ok);
  assert.deepEqual(ok, [], "a well-formed leg on another team's finding raises nothing");
  for (const bad of [{ target_edition: undefined }, { grade: "A" }, { grade_axis: "capture" }, { extent_kind: "page", extent_page: 1 },
                     { content_id: "f".repeat(64) }, { extent_capture: "e".repeat(64) }]) {
    const b = withRefs("first", [[REF, 2, bad]]);
    if ("target_edition" in bad) delete b.legs[1].target_edition;
    const f = [];
    basisVersionFindings(fmOf(b), f);
    assert.ok(f.length >= 1, JSON.stringify(bad));
    assert.ok(f.every((x) => x.check === "C-21.3"), `${JSON.stringify(bad)}: ${JSON.stringify(f.map((x) => x.check))}`);
  }
  /* the role arm still asks it; a local id that is not a ref is judged as before */
  const role = [];
  basisVersionFindings(fmOf(withRefs("first", [[REF, 2, { role: "decorates" }]])), role);
  assert.deepEqual(role.map((x) => x.check), ["C-25.10"]);
  const notRef = [];
  basisVersionFindings(fmOf(withRefs("first", [[`imported:${IMP}`, 2]])), notRef);
  assert.ok(notRef.some((x) => x.check === "C-25.10"), "a spelling R11 does not match is not a ref");
  assert.equal(isImportedRef(` ${REF} `), true, "after trimming");
  assert.equal(isImportedRef(`imported:${IMP}`), false);
  assert.equal(isImportedRef(DOC), false);
  assert.equal(isImportedRef(null), false);
});

test("R3, R5: the edition a leg on another group's finding names is in the composition after the leg_capture lines, and a composition without one is unchanged", () => {
  const [v] = versionsIn(fmOf(withRefs("first", [[REF, 2]])));
  const lines = v.composition.split("\n");
  assert.equal(lines[lines.length - 1], "leg_edition\t1\t2");
  const [plain] = versionsIn(fmOf(version("first", [DOC])));
  assert.ok(!plain.composition.includes("leg_edition"));
  const w = versionAsWritten({ name: "x", description: "a reading of it", author: "member:alice", at: T,
    legs: [{ target: REF, target_edition: 3, role: "supports" }, { target: DOC, role: "supports" }] });
  assert.equal(w.legs[0].target_edition, 3);
  assert.ok(!("extent_kind" in w.legs[0]), "a leg on another team's finding carries no extent");
  assert.equal(w.legs[1].extent_kind, "document");
  const text = versionAsWritten({ name: "x", author: "member:alice", at: T, legs: [{ target: REF, target_edition: " 4 " }] });
  assert.equal(text.legs[0].target_edition, "4", "a textual edition is kept, trimmed");
});
