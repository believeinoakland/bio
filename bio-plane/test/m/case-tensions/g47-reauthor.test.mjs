/* case-tensions — G47: choosing one capture's level re-authors only that capture's attesting row, even when several
   captures of one source share a `ref` (R7). Driven at the module's interface through publication's splice stand-in. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, NOW, sha } from "./fixture.mjs";

const F = "INQ-2026-0001", CASE = "CASE-2026-0001", SRC = "INFO-2026-0009-knocked";
const A = sha("capture A bytes"), B = sha("capture B bytes");
const material = (s) => ({ ref: SRC, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                           included: false, rests_under: "supporting" });
const row = (s, by, signature) => ({ ref: SRC, by_kind: "member", by, level: "cover", at: NOW, signature,
                                     recorded_in: null, ...(s ? { sha: s } : {}) });

function twoCaptures({ withSha }) {
  const w = world();
  w.member("olive"); w.member("ann");
  const proj = w.project("PROJ-1", ["olive"]);
  const pin = w.finding(F);
  for (const c of [A, B]) {
    w.actors.set(c, [V("ann")]);
    w.accounts.set(c, [{ by: V("ann"), signature: "SIG-ANN-ACCOUNT" }]);
  }
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }],
    sources: [A, B].map((capture) => ({ capture, stated: `unnamed ${capture.slice(0, 6)}`, basis: null })),
    attributions: [], materials: [material(A), material(B)],
    attestations: [row(withSha && A, "Cover ann", "SIG-A"), row(withSha && B, "Cover ann", "SIG-B")] });
  return w;
}
const attestations = (w) => w.pub.get(CASE, 1).text.split("material_attestations:")[1].split("\n---")[0];
const choose = (w, capture) => w.op("attribute", { by: "ann" }, { caseId: CASE, edition: 1, capture, level: "group",
                                                                 reason: "The group speaks for it." });

test("R7 G47 choosing capture A's level re-authors A's attesting row and leaves capture B's row as written", () => {
  const w = twoCaptures({ withSha: true });
  const r = choose(w, A);
  assert.equal(r.ok, true);
  assert.equal(r.attestations.reauthored, true);
  const t = attestations(w);
  assert.ok(!t.includes("SIG-A"), "A's row no longer carries the named signature");
  assert.ok(t.includes("SIG-B") && t.includes("Cover ann"), "B's row is untouched");
  assert.ok(t.includes(B), "B's row keeps its sha");
});

test("R7 G47 control: a document whose rows carry no sha is re-authored as before, every row of the ref", () => {
  const w = twoCaptures({ withSha: false });
  const r = choose(w, A);
  assert.equal(r.attestations.reauthored, true);
  assert.ok(!attestations(w).includes("SIG-A") && !attestations(w).includes("SIG-B"));
});
