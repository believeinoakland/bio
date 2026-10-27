import test from "node:test";
import "/home/user/bio/bio-plane/test/m/store-door/harness.mjs";
const P = await import("/home/user/bio/bio-plane/src/store-door/pull.mjs");
const { realChain, sha } = await import("./mp.mjs");
test("store-door pullAndFile, already pulled knock whose capture is the whole", async () => {
  const ch = await realChain("b");
  const WH = ch.m.whole;
  const doorbell = { pullKnock: async () => ({ ok: true, existed: true, pulled_at: "2026-10-01T00:00:00Z", capture: { sha256: WH }, document: null, within: undefined }) };
  const cs = ch.w.cap("single"); ch.w.promoteInfo("INFO-2026-0002-s", { captures: [cs] });
  const run = async (s) => P.pullAndFile({ doorbell: { pullKnock: async () => ({ ok: true, existed: true, capture: { sha256: s }, document: null }) }, provenance: ch.w.prov, promotion: null, record: null, extraction: null },
                                         { knockId: "K1", by: "ann", identity: "member:ann", viewer: "member:ann" });
  for (const [n, s] of [["whole", WH], ["control", cs.sha], ["unknown", sha("nowhere")]]) {
    const r = await run(s);
    console.log("pullAndFile existed", n, JSON.stringify(r.bundle ?? null), r.reason ?? "");
  }
});
