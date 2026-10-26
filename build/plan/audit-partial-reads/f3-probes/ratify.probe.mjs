import test from "node:test";
import assert from "node:assert/strict";
const R = "/home/user/bio/bio-plane/test/m/ratification";
const { world, infoMd } = await import(`${R}/fixture.mjs`);
const { multipartOfBytes, realChainOf, mpFiles, MIB, sha } = await import("./mp.mjs");
test("ratification gateFacts + ratifyGate over a multipart bundle", async () => {
  const buf = Buffer.alloc(20 * MIB + 17, 9);
  const m = multipartOfBytes("rat", buf);
  const id = "INFO-2026-0001-big";
  const ch = await realChainOf(m, { id });
  const w = world();
  const real = ch.w.prov;
  w.provenance.registeredFor = (i) => real.registeredFor(i);
  w.provenance.registerHolds = (a) => real.registerHolds(a);
  /* the bundle in ratification's record (its own promotion, as its tests do) */
  const { files, register } = mpFiles(m, { md: infoMd(id) });
  const pr = w.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: "member:alice", files, meta: { object_type: "information" }, register });
  console.log("promote in ratification world", pr.ok, pr.reason ?? "");
  for (const p of m.held) w.evidence.set(`bio/captures/${p.sha256}`, p.bytesBuf);    /* the parts are in the working bucket; no whole */
  const gf = w.r.gateFacts(id, null);
  console.log("gateFacts", gf.ok, gf.reason ?? "", "registers:", JSON.stringify((gf.registers || []).map((r) => [r.capture_sha === m.whole ? "WHOLE" : "part", r.path, r.bytes])));
  const md = infoMd(id);
  const image = { "bundle.md": md, "data/provenance.json": JSON.stringify({ documents: [m.doc] }), ...Object.fromEntries(m.held.map((p) => [p.file, p.bytesBuf])) };
  const gate = await w.r.ratifyGate({ bundleId: id, image, knownIds: new Set([id]), registers: gf.registers, publishedRegistry: null, publishedCaseRegistry: null, earnedRegistry: null });
  console.log("ratifyGate ok:", gate.ok, "findings:", JSON.stringify((gate.findings || []).map((f) => [f.check, (f.detail || "").slice(0, 100)])), "parted:", JSON.stringify((gate.parted || []).map(([s, ps]) => [s === m.whole ? "WHOLE" : s.slice(0, 6), ps.length])));
  /* control: the same gate with the parts' rows alone (the pre-R72 register) */
  const gate0 = await w.r.ratifyGate({ bundleId: id, image, knownIds: new Set([id]), registers: gf.registers.filter((r) => r.capture_sha !== m.whole), publishedRegistry: null, publishedCaseRegistry: null, earnedRegistry: null });
  console.log("ratifyGate without the whole row ok:", gate0.ok, "findings:", JSON.stringify((gate0.findings || []).map((f) => f.check)), "parted:", (gate0.parted || []).length);
});
