import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, doc, ANN } = await import(`${R}/people/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");
const mdFor = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`, "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting", "---", "", "## Summary", "", "A document.", ""].join("\n");
const valid = { from: "2020-01-01", to: "2030-12-31", precision: "day", zone: "America/Los_Angeles" };
test("people whole", () => {
  const w = world();
  const m = multipart("b"); const id = "INFO-2026-0900-big";
  const { files, register } = mpFiles(m, { md: mdFor(id) });
  const pr = w.dw.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: ANN, files, meta: { object_type: "information" }, register });
  console.log("promote", pr.ok, pr.reason ?? "");
  w.dw.sw.ex.readings[m.whole] = { chain: [{ step: "layer", tier: 1 }], pageCount: 3 };
  const ctl = w.capture("ctl"); const p = w.person("Rita Moreno");
  for (const [n, s] of [["control", ctl.captureSha], ["whole", m.whole], ["unknown", sha("nowhere")]]) {
    const r = w.p.recordPersonFact({ person: p, kind: "locality", value: "Port Ellery " + n, valid, citation: { captureSha: s, extent: { kind: "pdf-page", page: 0 } }, by: ANN });
    console.log("recordPersonFact", n, r.ok, r.reason ?? "", r.ok ? "" : (r.detail ?? "").slice(0, 80));
    const rb = w.p.recordedBy({ captureSha: s, viewer: "member:ann" });
    console.log("recordedBy", n, rb.ok, "items", rb.items?.length);
  }
});
