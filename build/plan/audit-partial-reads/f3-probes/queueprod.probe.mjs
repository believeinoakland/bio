import test from "node:test";
import assert from "node:assert/strict";
const R = "/home/user/bio/bio-plane/test/m/queue-producers";
const { world, byId, NOW, iso } = await import(`${R}/world.mjs`);
const { realChain, sha } = await import("./mp.mjs");
const INQ_A = "INQ-2026-4100-was-0042-bid", INQ_B = "INQ-2026-4200-how-many-held";
test("queue-producers whole", async () => {
  const ch = await realChain("b");
  const WH = ch.m.whole;
  const req = (request, capture_sha) => ({ request, run: "RUN-pl15", target: INQ_A, lead_inquiry: INQ_B, address: `https://records.example.gov/${request}.pdf`, host: "records.example.gov",
    purpose: "investigate", ua_mode: "civicos", capture_sha, captured_at: iso(NOW - 60000), attribution: { ok: true, actor: "token:daemon", statement: "the daemon captured this" } });
  const rows = [req("CR-1", WH), req("CR-2", sha("nowhere"))];
  /* provenance: the REAL one from the real chain (homeOf over the register with the whole row), not a fake */
  const w = world({ captureRequests: { leads: () => ({ requests: rows }) }, provenance: { homeOf: (s) => ch.w.prov.homeOf(s) } });
  w.bundle(INQ_A, "inquiry"); w.bundle(INQ_B, "inquiry"); w.bundle("PRJ-A", "project"); w.bundle("PRJ-B", "project");
  w.cite("PRJ-A", INQ_A); w.cite("PRJ-B", INQ_B);
  w.bundle(ch.id);                                  /* the home bundle as the producers' record holds it */
  const m = byId(w.read(null, "class:admin"));
  for (const id of ["CR-1", "CR-2"]) {
    const l = m[`FINDING::out-of-inquiry-lead::${id}`]; const be = l.basis.basis_entry;
    console.log("lead", id, "basis_entry", be.state, be.reason, be.bundle_id, "| subject.bundle_id", l.subject.bundle_id);
  }
});
