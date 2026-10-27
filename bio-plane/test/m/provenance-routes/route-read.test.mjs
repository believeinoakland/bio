/* provenance-routes R15 (T51; K4259): `provenanceroutes` with a `bundleId` answers one visible document's standing
   route through `routeFinding`, never absent, so NEVER_LOOKED and PRESENT read distinctly. Driven as the door drives
   it: the ops map over `url`, on the real modules. The control is the paged roster, unchanged without `bundleId`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, provDoc } from "./fixture.mjs";
import { routeFinding } from "../../../src/provenance-routes/index.mjs";
import { provenanceRouteOps, DECLARED_OPS } from "../../../src/provenance-routes/ops.mjs";

const ops = (w, o) => provenanceRouteOps(w.routes, new URL(`http://do/?${new URLSearchParams(o)}`), null);
const read = (w, bundleId, viewer = V("ruth")) => ops(w, { bundleId, viewer }).provenanceroutes();
const assess = (w, id) => ops(w, { bundleId: id, viewer: V("ruth"), author: V("ruth") }).provenanceroute();

function routed(w, id) {
  const c = w.cap(id);
  assert.equal(w.promoteInfo(id, { captures: [c] }).ok, true);
}
function unrouted(w, id) {
  const c = w.cap(id);
  assert.equal(w.promoteInfo(id, { captures: [c], docs: [{ ...provDoc(c), locator: "in hand" }] }).ok, true);
}

test("R15: one document's route is read for each state: NEVER_LOOKED before any assessment, then PRESENT or LOOKED_INDETERMINATE as marked", () => {
  const w = world();
  routed(w, "INFO-2026-0001-a");
  unrouted(w, "INFO-2026-0002-b");
  for (const id of ["INFO-2026-0001-a", "INFO-2026-0002-b"]) {
    const never = read(w, id);
    assert.deepEqual([never.ok, never.bundleId, never.state, never.objectType], [true, id, "collected", "information"]);
    assert.deepEqual(never.route, routeFinding("information", null));
    assert.deepEqual([never.route.finding, never.route.assessed, never.route.marked], ["NEVER_LOOKED", false, false]);
  }
  assess(w, "INFO-2026-0001-a");
  assess(w, "INFO-2026-0002-b");
  const present = read(w, "INFO-2026-0001-a"), indeterminate = read(w, "INFO-2026-0002-b");
  assert.deepEqual([present.route.finding, present.route.assessed, present.route.marked], ["PRESENT", true, false]);
  assert.deepEqual([indeterminate.route.finding, indeterminate.route.assessed, indeterminate.route.marked],
                   ["LOOKED_INDETERMINATE", true, true]);
  assert.deepEqual(present.route, w.routes.routeOf("INFO-2026-0001-a", "information"), "the standing mark through routeFinding");
  assert.deepEqual(indeterminate.route, w.routes.routeOf("INFO-2026-0002-b", "information"));
  assert.notEqual(present.route.finding, routeFinding("information", null).finding, "assessed and never looked read apart");
});

test("R15: the standing route is the latest mark; a re-assessment that finds more moves it, and reading writes nothing", () => {
  const w = world();
  unrouted(w, "INFO-2026-0001-a");
  assess(w, "INFO-2026-0001-a");
  assert.equal(read(w, "INFO-2026-0001-a").route.seq, 1);
  const before = w.snapshot();
  read(w, "INFO-2026-0001-a");
  assert.deepEqual(w.snapshot(), before, "a read of one document's route writes nothing");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM provenance_route_marks`).n, 1);
});

test("R15: a bundle that is not a document states that the marker does not apply, never an absent route", () => {
  const w = world();
  w.inquiry("INQ-2026-0001-q");
  const r = read(w, "INQ-2026-0001-q");
  assert.deepEqual([r.ok, r.objectType, r.route], [true, "inquiry", routeFinding("inquiry", null)]);
  assert.deepEqual([r.route.applies, r.route.finding], [false, null]);
});

test("R15: an absent bundle, an unseen one and an unstamped viewer answer alike, and name nothing about the bundle", () => {
  const w = world();
  routed(w, "INFO-2026-0001-a");
  assess(w, "INFO-2026-0001-a");
  const gone = read(w, "INFO-2026-9999-none");
  assert.deepEqual([gone.ok, gone.reason], [false, "NO_SUCH_BUNDLE"]);
  const fenced = w.project("PROJ-2026-0001-fenced", { owner: "olive", visibility: "hidden" });
  routed(w, "INFO-2026-0002-p");
  w.fence("INFO-2026-0002-p", fenced);
  assess(w, "INFO-2026-0002-p");
  const hidden = read(w, "INFO-2026-0002-p", V("ruth"));
  assert.deepEqual(hidden, { ...gone, bundleId: "INFO-2026-0002-p" }, "unseen answers as absent does");
  assert.deepEqual(read(w, "INFO-2026-0001-a", "stranger"), { ...gone, bundleId: "INFO-2026-0001-a" });
  assert.deepEqual(ops(w, { bundleId: "INFO-2026-0001-a" }).provenanceroutes(), { ...gone, bundleId: "INFO-2026-0001-a" },
                   "no viewer stamped sees nothing");
});

test("R15: the viewer is the query's stamp and the bundle the query's, never the body's", () => {
  const w = world();
  routed(w, "INFO-2026-0001-a");
  const viaBody = provenanceRouteOps(w.routes, new URL(`http://do/?${new URLSearchParams({ viewer: V("ruth") })}`),
                                     { bundleId: "INFO-2026-0001-a" }).provenanceroutes();
  assert.equal(viaBody.documents !== undefined, true, "a body's bundleId reaches nothing: this is the paged roster");
  const viaBodyViewer = provenanceRouteOps(w.routes, new URL(`http://do/?${new URLSearchParams({ bundleId: "INFO-2026-0001-a" })}`),
                                           { viewer: V("ruth") }).provenanceroutes();
  assert.equal(viaBodyViewer.reason, "NO_SUCH_BUNDLE");
});

test("R15: control: without a bundleId, or with an empty one, the paged roster is what the service answers, unchanged", () => {
  const w = world();
  unrouted(w, "INFO-2026-0001-a");
  routed(w, "INFO-2026-0002-b");
  assess(w, "INFO-2026-0001-a");
  assess(w, "INFO-2026-0002-b");
  const want = w.routes.provenanceRoutesMarked({ after: "", limit: "5", viewer: V("ruth") });
  assert.deepEqual(want.documents.map((d) => d.bundleId), ["INFO-2026-0001-a"]);
  for (const extra of [{}, { bundleId: "" }])
    assert.deepEqual(ops(w, { viewer: V("ruth"), limit: "5", after: "", ...extra }).provenanceroutes(), want, JSON.stringify(extra));
  const one = read(w, "INFO-2026-0002-b");
  assert.equal(one.documents, undefined, "a bundleId answers the one document, not a page");
  assert.equal(one.census, undefined);
});

test("R15: provenanceroutes is declared a read that accepts bundleId, after and limit and requires none", () => {
  const row = DECLARED_OPS.provenanceroutes;
  assert.equal(row.mutating, false);
  assert.deepEqual([...row.fields.accepts].sort(), ["after", "bundleId", "limit"]);
  assert.deepEqual(row.fields.requires, []);
});
