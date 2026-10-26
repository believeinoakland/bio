import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, sha } = await import(`${R}/events/fixture.mjs`);
const { realChain, install } = await import("./mp.mjs");
test("events whole", async () => {
  const w = world();
  const ch = await realChain("b");
  install(w.st, ch);
  const s = ch.m.whole;
  w.x.writeReading({ bundleId: ch.id, captureSha: s, composed: true, textUnits: null,
    reading: { content_type: "application/pdf", reader_version: 1, found: true, at: "2026-09-27T00:00:00Z", entities: [], facts: {} } });
  const ctl = w.capture("ctl");
  for (const [n, c] of [["control", ctl], ["whole", s], ["unknown", sha("unk")]]) {
    const f = w.ev.recordDatedFact({ captureSha: c, extent: { kind: "document" }, kind: "meeting", value: "2026-03-04", method: "read by a member", by: "member:alice" });
    console.log(n, "recordDatedFact", f.ok, f.reason ?? "");
    const e = w.ev.createEvent({ kind: "meeting", attestations: [{ captureSha: c, extent: { kind: "document" } }], by: "member:alice" });
    console.log(n, "createEvent", e.ok, e.reason ?? "");
  }
});
