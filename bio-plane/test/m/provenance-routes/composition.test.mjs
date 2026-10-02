/* provenance-routes composed with provenance in the composition root's order (layer 3: provenance, attestation,
   provenance-routes): `op=stats`' figure keys keep their order, `routeMarks` after provenance's `register` (R10), and
   this module, not provenance, holds the audit's `route` finding (R6), the figure (R10) and the table (R12) (N512,
   K1220: the route side moves whole). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, provDoc } from "./fixture.mjs";

test("R10: composed after provenance, op=stats' figures keep their order: routeMarks directly after register", () => {
  const w = world({ withProvenance: true });
  const c = w.cap("a");
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [c], docs: [{ ...provDoc(c), locator: "in hand" }] }).ok, true);
  w.routes.provenanceRouteAssess({ bundleId: "INFO-2026-0001-a", author: V("ruth"), viewer: V("ruth") });
  const keys = Object.keys(w.record.counts(null));
  const at = keys.indexOf("register");
  assert.ok(at >= 0, `provenance's figure is registered: ${keys}`);
  assert.equal(keys[at + 1], "routeMarks", `routeMarks follows register: ${keys}`);
  assert.equal(keys.filter((k) => k === "routeMarks").length, 1);
  assert.deepEqual([w.record.counts(null).register, w.record.counts(null).routeMarks], [1, 1]);
  /* Negative control: built before provenance, the order would differ, so the pin is on the composition order. */
  assert.notDeepEqual(["routeMarks", "register"], keys.slice(at, at + 2));
});

test("R6, R10, R12: composed with provenance, this module holds the route finding, the figure and the table", async () => {
  const w = world({ withProvenance: true });
  const route = w.record.registerAuditFinding("someone-else", "route", () => ({}));
  assert.deepEqual([route.reason, route.heldBy], ["AUDIT_CHECK_DECLARED", "provenance-routes"]);
  const fig = w.record.registerCounts("someone-else", ["routeMarks"], () => ({}));
  assert.deepEqual([fig.reason, fig.heldBy], ["COUNTS_DECLARED", "provenance-routes"]);
  const reg = w.record.registerCounts("someone-else", ["register"], () => ({}));
  assert.deepEqual([reg.reason, reg.heldBy], ["COUNTS_DECLARED", "provenance"], "register stays provenance's");
  const table = w.record.declarePurge("someone-else", ["provenance_route_marks"]);
  assert.deepEqual([table.reason, table.declaredBy], ["TABLE_DECLARED", "provenance-routes"]);
  /* And the whole path works through provenance's register step: a promoted register, assessed and audited. */
  const c = w.cap("b");
  assert.equal(w.promoteInfo("INFO-2026-0002-b", { captures: [c] }).ok, true);
  assert.equal(w.routes.provenanceRouteAssess({ bundleId: "INFO-2026-0002-b", author: V("ruth"), viewer: V("ruth") }).route.finding, "PRESENT");
  const pass = await w.record.auditPass({ after: "", limit: 5, visible: () => true });
  assert.deepEqual(pass.route.tally, { LOOKED_INDETERMINATE: 0, PRESENT: 1, NEVER_LOOKED: 0, notApplicable: 0 });
});
