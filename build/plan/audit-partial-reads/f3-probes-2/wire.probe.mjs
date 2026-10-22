import test from "node:test";
import { realChain, sha } from "./mp.mjs";
import { projectReachReaders } from "/home/user/bio/bio-plane/src/plane/wiring.mjs";
for (const label of ["a", "b"]) test("wiring " + label, async () => {
  const ch = await realChain(label);
  const w = ch.w;
  const readers = projectReachReaders({ record: () => ({ listBundles: ({ project }) => ({ ids: [ch.id] }) }), provenance: () => w.prov, connections: () => ({}), sql: w.st?.sql ? () => w.st.sql : null });
  const m = ch.m;
  console.log(label, "capturesOf", JSON.stringify(w.prov.capturesOf(ch.id).map((c) => c.capture_sha === m.whole ? "WHOLE" : "part")), "homeOf(whole)", w.prov.homeOf(m.whole)?.bundleId, "homeOf(part0)", w.prov.homeOf(m.held[0].sha256)?.bundleId);
  console.log(label, "reach provenance({project})", JSON.stringify(readers.provenance({ project: "PRJ-2026-0001-p" })), "unknown project/none:", JSON.stringify(readers.provenance({ project: "" })));
});
