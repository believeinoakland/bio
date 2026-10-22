import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { seeded, sha } = await import(`${R}/sources/fixture.mjs`);
const { realChain, install } = await import("./mp.mjs");
test("sources whole", async () => {
  const w = seeded();
  const ch = await realChain("b", { patch: (m) => { m.doc.capture.actor = "bob"; m.doc.capture.actor_class = "member"; } });
  install(w.st, ch, { tables: ["bundles", "files", "register"] });
  const c = w.captured({ actor: "bob" });
  for (const [n, s] of [["control", c.sha], ["whole", ch.m.whole], ["unknown", sha("nowhere")]]) {
    w.tick();
    const r = w.s.markKeyedResult({ captureSha: s, service: "PeopleFinder Pro", terms: "x", by: "bob" });
    console.log("markKeyedResult", n, r.ok, r.reason ?? "");
    if (r.ok) console.log("   keyedResultOf", JSON.stringify(w.s.keyedResultOf(s)));
  }
});
