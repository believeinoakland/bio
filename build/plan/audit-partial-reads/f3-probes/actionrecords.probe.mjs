import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m/action-records";
const { world } = await import(`${R}/fixture.mjs`);
const { realChain, install, sha } = await import("./mp.mjs");
test("action-records whole", async () => {
  const w = world();
  const ch = await realChain("b");
  install(w.st, ch, { tables: ["register"] });
  const ctl = w.doc("INFO-2026-0002-ctl");
  for (const [n, s] of [["control", ctl], ["whole", ch.m.whole], ["unknown", sha("nowhere")]]) {
    const r = w.r.unregisteredArtifact(s);
    console.log("unregisteredArtifact", n, r === null ? "null (register holds it)" : r.reason ?? r.code ?? JSON.stringify(r).slice(0, 80));
  }
});
