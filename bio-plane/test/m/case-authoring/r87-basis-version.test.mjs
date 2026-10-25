/* case-authoring R87 (case-grammar R34): prepare writes each member finding's basis version from basis-versions' current
   version of that finding's project at that moment: its name, and the SHA-256 of that version's composition. Over the real
   modules, at the interface (publishCase and the stored case document). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, V, T0, readingLines, currentLines } from "./fixture.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const ALICE = "member:alice";

/* a finding whose one reading is named `first`, concluded by a project. `standing` says whether the project made that
   reading current (basis-versions R13); when it did not, the project's conclusion is recorded with no version named. */
function chain({ standing = true } = {}) {
  const w = world();
  w.member("alice"); w.doc(DOC);
  w.finding(Q, [{ target: DOC }], { state: "open", lines: readingLines("first", [DOC]) });
  if (!standing) {
    const P = w.project("Team", "alice", [Q], { extra: ["conclusions:", `  - inquiry: "${Q}"`, `    at: "${T0}"`, `    by: "${ALICE}"`] });
    return { w, P };
  }
  const P = w.project("Team", "alice", [Q], { extra: currentLines(Q) });
  const concl = w.basisVersions.conclude({ target: Q, project: P, falsifier: "a later amendment", author: "alice",
                                           viewer: V("alice"), identity: ALICE });
  assert.equal(concl.ok, true, JSON.stringify(concl).slice(0, 300));
  return { w, P };
}
const rowOf = (w, r) => w.fm(w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, r.caseId, r.edition).text)
  .case_roles.find((x) => x.target === Q);

test("R87: a finding whose project stands on a named version writes that version's name and the SHA-256 of its composition on the member's case_roles row", () => {
  const { w, P } = chain();
  const r = w.publish(P, "alice", [Q], { roles: { [Q]: "load_bearing" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const listed = w.basisVersions.basisVersions({ id: Q, viewer: V("alice") });
  const version = listed.versions.find((v) => v.name === "first");
  assert.ok(version && typeof version.composition === "string", "the version is listed with its composition");
  const row = rowOf(w, r);
  assert.equal(row.basis_version, "first");
  assert.equal(row.basis_version_identity, createHash("sha256").update(version.composition, "utf8").digest("hex"));
});

test("R87 control: a project that stands on no version writes null for both fields, never a filled name", () => {
  const { w, P } = chain({ standing: false });
  const r = w.publish(P, "alice", [Q], { roles: { [Q]: "load_bearing" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const row = rowOf(w, r);
  assert.deepEqual([row.basis_version, row.basis_version_identity], [null, null]);
});
