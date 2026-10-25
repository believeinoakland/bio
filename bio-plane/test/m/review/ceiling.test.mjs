/* review T51 (fix round 10, C46-class): the reads that bind one variable per id stay under the plane's bound, the viewer's
   gate counted in it (D-36). The fixture's database caps variables at the plane's ceiling, so a statement that binds too
   many fails here as it fails on the plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, P, V, SECRET } from "./fixture.mjs";

const draft = (w, extra = {}, author = "ann", project = P) => w.r.act({ act: "draft", author, project, statement: "S", ...extra });
const grant = (w, d, n, author = "ann") => w.r.act({ act: "grant", author, draft: d.draftId, recipient: `R${n}`, secretSha: SECRET(n) });

test("R43: sharedDraftsByProject answers 150 projects asked under the plane's variable bound, for a member whose viewer gate binds its own variables, and counts the one shared project as it counts it asked alone", () => {
  const w = standard();
  w.clock.now = "2026-09-28T01:00:00.000Z";
  const d = draft(w);
  grant(w, d, 1);
  const ids = [P, ...Array.from({ length: 149 }, (_, i) => `PROJ-2026-9${String(i).padStart(3, "0")}-x`)];
  const got = w.r.sharedDraftsByProject({ projectIds: ids, viewer: V("ann") });
  assert.equal(Object.keys(got).length, 150, "every project asked is answered");
  assert.deepEqual(got[P], { count: 1, newest: "2026-09-28T01:00:00.000Z" });
  assert.deepEqual(got[ids[1]], { count: 0, newest: null }, "control: a project not shared");
  assert.deepEqual(w.r.sharedDraftsByProject({ projectIds: [P], viewer: V("ann") })[P], got[P], "the same answer asked alone");
});

test("R43: sharedDraftsByProject answers 150 projects for the founder's viewer under the variable bound (the gate's own arguments, one for the founder)", () => {
  const w = standard();
  w.clock.now = "2026-09-28T01:00:00.000Z";
  w.discoverable(P, "ann");                                                 // the founder's viewer sees a discoverable project
  grant(w, draft(w), 1);
  const ids = [P, ...Array.from({ length: 149 }, (_, i) => `PROJ-2026-9${String(i).padStart(3, "0")}-y`)];
  assert.deepEqual(w.r.sharedDraftsByProject({ projectIds: ids, viewer: "admin" })[P], { count: 1, newest: "2026-09-28T01:00:00.000Z" });
});
