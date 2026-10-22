import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { seeded, ZONE } = await import(`${R}/progressions/fixture.mjs`);
const { realChain } = await import("./mp.mjs");
test("progressions whole", async () => {
  const ch = await realChain("b");
  const u = seeded();
  u.define();
  u.p.provenance = ch.w.prov;                        /* the real provenance (R72 row), in place of the fixture's stub */
  const WH = ch.m.whole;
  u.resolve("ENT-1", WH, "INFO-A", "A");
  const MEMBER = "member:alice";
  const r = await u.p.threadInstance({ progressionKey: "proc", entityId: "ENT-1", placements: [{ stage: "need", captureSha: WH }, { stage: "need", captureSha: "sa" }], threadedBy: "member:alice", viewer: MEMBER });
  console.log("thread", r.ok, r.reason ?? "");
  u.dates.registered.sa = "2026-01-02T00:00:00Z";   /* the stub only knows sa; the whole is answered by the real homeOf */
  const f = (sha) => (u.p.captureProgressions({ captureSha: sha, nowMs: Date.parse("2040-01-01T00:00:00Z") }).instances[0]?.findings || []).filter((x) => x.kind === "overdue_successor");
  const fw = f(WH);
  console.log("bounds", JSON.stringify(fw[0]?.bounds?.map((b) => [b.capture_sha === WH ? "WHOLE" : b.capture_sha, b.bound])));
  console.log("real homeOf(whole).registered", ch.w.prov.homeOf(WH)?.registered);
});
