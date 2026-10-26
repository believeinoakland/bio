/* retrieval R99 (with R19, R21, R77): another credential's selection is refused with retrieval's own code and catalogue
   row, never intent's NOT_YOURS (C-111.15, the aspiration sentence). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { SELECTION_CHECKS } from "../../../src/retrieval/index.mjs";

async function held() {
  const w = world();
  w.doc("INFO-1", { source_status: "live" }, { files: [{ path: "n.md", text: "water" }] });
  const s = await w.retrieval.selectionCreate({ owner: "ann", kind: "enumerated", ids: ["INFO-1"], viewer: V("ann") });
  return { w, handle: s.handle };
}

test("R99: the catalogue row of retrieval's own code is a selection's, apart from intent's NOT_YOURS", () => {
  const row = SELECTION_CHECKS.SELECTION_NOT_YOURS;
  assert.equal(typeof row.check, "string");
  assert.equal(typeof row.translation, "string");
  assert.doesNotMatch(row.translation, /aspiration/i);
  assert.notEqual(row.check, "C-111.15");
  assert.match(row.check, /^C-33\./);
});

test("R99, R19: selectionResolve of another member's selection (or none) is SELECTION_NOT_YOURS, never NOT_YOURS", async () => {
  const { w, handle } = await held();
  for (const owner of ["mel", null]) {
    const r = w.retrieval.selectionResolve({ handle, owner, viewer: V("mel") });
    assert.deepEqual([r.ok, r.reason], [false, "SELECTION_NOT_YOURS"]);
  }
});

test("R99, R77: selectionRead of another member's selection is SELECTION_NOT_YOURS", async () => {
  const { w, handle } = await held();
  for (const owner of ["mel", null]) assert.equal(w.retrieval.selectionRead({ handle, owner, viewer: V("mel") }).reason, "SELECTION_NOT_YOURS");
});

test("R99, R21: selectionRelease of another member's selection, or of none held, is SELECTION_NOT_YOURS", async () => {
  const { w, handle } = await held();
  assert.deepEqual(w.retrieval.selectionRelease({ handle, owner: "mel" }), { ok: false, reason: "SELECTION_NOT_YOURS" });
  assert.deepEqual(w.retrieval.selectionRelease({ handle: "sel-none", owner: "mel" }), { ok: false, reason: "SELECTION_NOT_YOURS" });
});
