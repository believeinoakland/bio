import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, V, sha } = await import(`${R}/local-facts/fixture.mjs`);
const { realChain, install } = await import("./mp.mjs");
const DL = { rule: "group_answer", applies_to: "records_request", units: "days", amount: 7, starts: "received", citation: "Test Bylaw § 9", effective_from: "2026-09-01" };
test("local-facts whole", async () => {
  const w = world();
  const ch = await realChain("b"); install(w.st, ch);
  w.content.extraction.writeReading({ bundleId: ch.id, captureSha: ch.m.whole, composed: true, reading: { content_type: "text/html", reader_version: 1, found: true, at: "2026-09-27T00:00:00Z", entities: [] } });
  const ctl = w.held("INFO-2026-0002-ctl", sha("the bylaw"));
  for (const [n, s] of [["control", ctl], ["whole", ch.m.whole], ["unknown", sha("nowhere")]]) {
    const r = w.lf.ruleDraft({ section: "deadlines", entry: DL, source: { captureSha: s, extent: { kind: "document" } }, reason: "the bylaw", by: V("bob"), viewer: V("bob") });
    console.log("ruleDraft", n, r.ok, r.reason ?? "", r.ok ? "" : (r.detail ?? "").slice(0, 100));
  }
});
