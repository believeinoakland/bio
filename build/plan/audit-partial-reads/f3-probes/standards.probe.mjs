import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { seeded, V } = await import(`${R}/standards/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");
const mdFor = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`, "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting", "---", "", "## Summary", "", "A document.", ""].join("\n");
for (const label of ["b", "a"]) test("standards whole " + label, () => {
  const w = seeded();
  const m = multipart(label); const id = "INFO-2026-0900-big";
  const { files, register } = mpFiles(m, { md: mdFor(id) });
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: V("alice"), files, meta: { object_type: "information" }, register });
  console.log(label, "promote", r.ok, "captureFor is whole:", w.content.captureFor(id) === m.whole);
  w.ex.readings[m.whole] = { chain: [{ step: "layer", tier: 1 }], pageCount: 3 };
  const ctl = w.passage("ctl", { text: "Fees." });
  for (const [n, s] of [["control", ctl.capSha], ["whole", m.whole], ["unknown", sha("nowhere")]]) {
    const d = w.declare({ cite: "PEBL § " + n, text: [{ capture_sha: s, extent: { kind: "pdf-page", page: 1 } }] });
    console.log(label, "declare text=found", n, d.ok, d.reason ?? d.code ?? "", d.ok ? JSON.stringify(d.text).slice(0, 30) : "");
    const rb = w.s.recordedBy({ captureSha: s, viewer: V("bob") });
    console.log(label, "recordedBy", n, rb.ok, "items", rb.items?.length ?? "-", rb.undetermined ? "undetermined" : "");
  }
});
