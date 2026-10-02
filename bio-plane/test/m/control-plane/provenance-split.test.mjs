/* control-plane: provenance's split (N512, K1193; T25 L11). The record store's door routes provenance-routes' three
   route arms through that module's own map (`provenanceRouteOps`, its R9), spread beside provenance's (R26, the
   `membershipOps` pattern), and decorates their refusals from C-34 as provenance-routes' own file holds it (R22). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { record } from "./record.mjs";
import { ROUTE_MARK_CHECKS } from "../../../src/provenance-routes/checks.mjs";

const refusal = (r, code) => {
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.equal(r.json.ok, true);
  const row = ROUTE_MARK_CHECKS[code];
  assert.deepEqual([r.json.result.ok, r.json.result.reason, r.json.result.code, r.json.result.check, r.json.result.translation],
                   [false, code, code, row.check, row.translation], code);
};

test("R26, R22 (N512): provenanceroute, provenanceroutes and provenancechain are routed through provenance-routes' own map, their stamps read from the query; each C-34 refusal is decorated with its row from provenance-routes' file (negative control: without the map spread, each is an unknown op)", async () => {
  const x = await record({ step: true });
  refusal(await x.go("provenanceroute?viewer=admin", "POST"), "ROUTE_MARK_NO_AUTHOR");
  refusal(await x.go("provenanceroute?viewer=admin&author=member:alice", "POST"), "ROUTE_MARK_NO_BUNDLE");
  refusal(await x.go("provenanceroute?viewer=admin&author=member:alice&bundleId=IB-nope", "POST"), "ROUTE_MARK_NO_SUCH_BUNDLE");
  /* the author is the query's stamp, never the body's: a body author does not make the act a named one */
  refusal(await x.go("provenanceroute?viewer=admin", "POST", { author: "member:alice" }), "ROUTE_MARK_NO_AUTHOR");
  const page = await x.go("provenanceroutes?viewer=admin", "POST");
  assert.equal(page.status, 200);
  assert.deepEqual([page.json.ok, page.json.result.ok, page.json.result.finding, page.json.result.returned],
                   [true, true, "LOOKED_INDETERMINATE", 0]);
  const chain = await x.go("provenancechain?viewer=admin&author=member:alice", "POST");
  assert.deepEqual([chain.status, chain.json.result.ok, chain.json.result.reason, chain.json.result.check], [200, false, "NO_BUNDLE", "C-103.3"]);
  /* negative control: a record whose routes do not spread the map does not know the ops */
  const y = await record({ step: false });
  for (const op of ["provenanceroute", "provenanceroutes", "provenancechain"]) {
    const r = await y.go(`${op}?viewer=admin&author=member:alice`, "POST");
    assert.deepEqual([r.status, r.json], [400, { ok: false, error: `unknown op: ${op}` }], op);
  }
});
