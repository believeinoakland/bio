import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { seeded, file } = await import(`${R}/docket/fixture.mjs`);
const { realChain, install, sha } = await import("./mp.mjs");
test("docket whole", async () => {
  const w = seeded();
  const ch = await realChain("b", { patch: (m) => { m.doc.origin = { kind: "sweep", matched_sweep: "SWEEP-1", deeming_actor: "member:alice" }; m.doc.co_archive = { service: "web.archive.org", locator: "https://web.archive.org/web/2026/x" }; } });
  install(w.st, ch, { tables: ["bundles", "files", "register"] });
  const addr = "https://news.example/bigpdf";
  w.provenance.recordReceipt({ address: addr, addressNorm: addr, captureSha: ch.m.whole, retrieved: "2026-09-27T00:00:00Z", via: "direct" });
  console.log("captured_locators", JSON.stringify(w.rows(`SELECT address_norm, substr(capture_sha,1,8) s FROM captured_locators WHERE capture_sha=?`, ch.m.whole)));
  for (const [n, s] of [["control", w.cap.sha], ["swept control", w.swept.sha], ["whole", ch.m.whole], ["unknown", sha("nowhere")]]) {
    const r = file(w, { capture: s });
    console.log("docketFile", n, r.ok, r.reason ?? "", r.ok ? JSON.stringify({ found_by: r.found_by ?? r.entry?.found_by ?? null }) : "");
  }
});
