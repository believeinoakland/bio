import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { seeded, sha, ANN } = await import(`${R}/money/fixture.mjs`);
const { realChain, install } = await import("./mp.mjs");
test("money whole", async () => {
  const w = seeded();
  const ch = await realChain("b"); install(w.st, ch);
  const rf = (cap) => w.m.recordFact(w.fact({ source: { capture_sha: cap, extent: { kind: "document" } } }));
  for (const [n, s] of [["control", w.cap], ["whole", ch.m.whole], ["unknown", sha("nowhere")]]) {
    const r = rf(s); console.log("recordFact", n, r.ok, r.reason ?? "", r.ok ? "" : (r.detail ?? "").slice(0, 150));
    if (r.ok) { const row = w.one(`SELECT sight_bundle, grade_reading, grade_basis, source_capture_sha FROM money_facts WHERE fact_id=?`, r.fact_id) ?? w.one(`SELECT * FROM money_facts LIMIT 1`); console.log("   row", JSON.stringify({ sight: row.sight_bundle, grade: row.grade_reading, basis: row.grade_basis })); }
  }
});
