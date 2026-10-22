import test from "node:test";
import assert from "node:assert/strict";
const R = "/home/user/bio/bio-plane/test/m";
const { world, sha, ANN } = await import(`${R}/lines/fixture.mjs`);
const { realChain, install } = await import("./mp.mjs");
test("lines recordLine basis captureSha=whole", async () => {
  const w = world();
  const ch = await realChain("b");
  install(w.st, ch);
  w.content.extraction.writeReading({ bundleId: ch.id, captureSha: ch.m.whole, composed: true, reading: { content_type: "application/pdf", reader_version: 1, found: true, at: "2026-09-27T00:00:00Z", entities: [] } });
  const ctl = w.held("INFO-2026-0002-ctl", sha("ctl"));
  const o = w.ent("office", "Harbour Master"), b = w.ent("body", "Port Board");
  const rec = (s) => w.l.recordLine({ kind: "part_of", from: o, to: b, basis: { captureSha: s, extent: { kind: "document" } }, by: ANN });
  const c = rec(ctl); console.log("control", c.ok, c.reason);
  const r = rec(ch.m.whole); console.log("whole", r.ok, r.reason, r.detail);
  const u = rec(sha("unknown")); console.log("unknown", u.ok, u.reason);
});
