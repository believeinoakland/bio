/* retrieval R63 (T51 fix round 10, K5203): `listBundles`' `total` counts the bundles the viewer passes that also match
   `type` and `state` as the page does, never narrowed by `after`. Driven at the module's interface, as roster.test.mjs. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";

/* Three information bundles and one project bundle, all visible to the machine credential. */
function roster() {
  const w = world();
  for (const id of ["INFO-2026-0001-a", "INFO-2026-0002-b", "INFO-2026-0003-c"])
    w.doc(id, {}, { files: [{ path: "n.md", text: `notes of ${id}` }] });
  w.project("Open", "ann");
  return w.retrieval;
}

test("R63: a typed page's total is the count of bundles of that type the viewer passes, as the untyped control's total is the count of all of them", () => {
  const r = roster();
  const typed = r.listBundles({ viewer: MACHINE, type: "information", limit: 2 });
  assert.equal(typed.bundles.length, 2);
  assert.equal(typed.total, 3, "three information bundles; the project is not counted");
  assert.equal(r.listBundles({ viewer: MACHINE, limit: 2 }).total, 4, "control: the untyped total counts all four");
});

test("R63: a state-filtered page's total counts the bundles in that state, as the page does", () => {
  const r = roster();
  const page = r.listBundles({ viewer: MACHINE, type: "information", state: "collected", limit: 2 });
  assert.equal(page.bundles.length, 2);
  assert.equal(page.total, 3);
  assert.equal(r.listBundles({ viewer: MACHINE, type: "information", state: "no-such-state", limit: 2 }).total, 0);
});

test("R63: a typed page's total is never narrowed by after: the cursor moves the page, not the count", () => {
  const r = roster();
  const page = r.listBundles({ viewer: MACHINE, type: "information", limit: 2, after: "INFO-2026-0002-b" });
  assert.deepEqual(page.bundles.map((b) => b.bundle_id), ["INFO-2026-0003-c"]);
  assert.equal(page.total, 3, "after keeps the count of the whole typed set");
});
