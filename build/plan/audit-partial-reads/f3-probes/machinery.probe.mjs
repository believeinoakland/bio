import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m/machinery-producers";
const { world, byId, NOW, iso } = await import(`${R}/world.mjs`);
const { realChain, install, sha } = await import("./mp.mjs");
test("machinery-producers whole", async () => {
  const ch = await realChain("b", { id: "INFO-2026-0001-big" });
  const WH = ch.m.whole;
  const mk = (request, cap) => ({ request, run: "r", target: "INQ-1", address: `https://y.example/${request}`, host: "y.example", purpose: "investigate", ua_mode: "civicos",
    capture_sha: cap, captured_at: iso(NOW - 1), attribution: { ok: true, statement: "the daemon captured this" } });
  const w = world({ capture: { liveCaptureSessions: () => [
      { session: "S-WHOLE", locator: "https://x.example/", primarySha: WH, created: iso(NOW - 10), updated: iso(NOW), expires: iso(NOW + 10), ticks: 2, state: { queue: [1, 2], discovered: 5, spent: 3 } },
      { session: "S-NONE", locator: "https://x.example/n", primarySha: sha("nowhere"), created: iso(NOW - 10), updated: iso(NOW), expires: iso(NOW + 10), ticks: 2, state: { queue: [1], discovered: 1, spent: 1 } }] },
    provenance: { homeOf: (s) => ch.w.prov.homeOf(s) },                   /* the real provenance */
    captureRequests: { completed: () => ({ requests: [mk("CR-WHOLE", WH), mk("CR-NONE", sha("nowhere"))] }) } });
  w.bundle("INQ-1", "inquiry");
  install({ sql: w.sql }, ch, { tables: ["bundles", "register"] });       /* the real chain's rows in the producers' register */
  const m = byId(w.read(null, "class:admin"));
  for (const s of ["S-WHOLE", "S-NONE"]) { const p = m[`CONDITION::partial-capture-outstanding::${s}`]; console.log("partial-capture", s, p ? JSON.stringify([p.subject.kind, p.subject.id]) : "NO ITEM"); }
  for (const s of ["CR-WHOLE", "CR-NONE"]) {
    const u = m[`CONDITION::capture-completed-unattended::${s}`];
    console.log("completed-unattended", s, u ? JSON.stringify({ notes: u.options?.length ?? null, title: JSON.stringify(u).match(/Document INFO[^"\\]*/)?.[0] ?? null, grade_notes: u.basis?.grade_notes?.length ?? null, keys: Object.keys(u.basis || {}).join(",") }) : "NO ITEM");
  }
});
