import test from "node:test";
const R = "/home/user/bio/bio-plane/test/m";
const { world, E, BOB } = await import(`${R}/duties/fixture.mjs`);
const { multipart, mpFiles, sha } = await import("./mp.mjs");
const V = (i) => `member:${i}`;
const mdFor = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`, "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting", "---", "", "## Summary", "", "A document.", ""].join("\n");
test("duties whole", () => {
  const w = world();
  const m = multipart("b"); const id = "INFO-2026-0900-big";
  const { files, register } = mpFiles(m, { md: mdFor(id) });
  console.log("promote", w.sw.promotion.promote({ bundleId: id, base: null, snapKey: "mp", author: V("alice"), files, meta: { object_type: "information" }, register }).ok);
  const words = "We will publish the audit response by June 30, 2026.";
  w.sw.ex.readings[m.whole] = { chain: [{ step: "layer", tier: 1 }], pageCount: 3 };
  w.sw.ex.units[m.whole] = { units: [{ extent: { kind: "pdf-page", page: 0 }, text: words, seq: 0 }], state: "whole" };
  const ctl = w.passage("reply", { text: words });
  const mint = w.content.mint({ bundleId: id, captureSha: m.whole, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("alice") });
  console.log("mint on whole", mint.ok, mint.reason ?? "");
  const mk = (cid, cite) => w.sw.declare({ cite, kind: "commitment", issuer: "Town Clerk", text: [cid] });
  const c1 = mk(ctl.contentId, "Clerk letter control"), c2 = mk(mint.content_id, "Clerk letter whole");
  console.log("commitments", c1.ok, c2.ok);
  const cite = (s) => ({ captureSha: s, extent: { kind: "pdf-page", page: 0 } });
  const prop = (s, std) => w.duties.proposeFromResponse({ kind: "promise", arisingIn: s, quote: cite(s), obligor: E.clerk, performance: "publish the audit response", standard: std, by: "class:member" });
  for (const [n, s, std] of [["control", ctl.capSha, c1.id], ["whole", m.whole, c2.id], ["unknown", sha("nowhere"), c1.id]]) {
    const r = prop(s, std); console.log("proposeFromResponse", n, r.ok, r.reason ?? "", r.ok ? "" : (r.detail ?? "").slice(0, 100));
  }
  for (const [n, s] of [["control", ctl.capSha], ["whole", m.whole], ["unknown", sha("nowhere")]]) {
    const d = w.declare({ arising_in: s }); console.log("declare arising_in", n, d.ok, d.reason ?? "");
    if (d.ok) { const rd = w.duties.read ? w.duties.read({ id: d.id ?? d.duty_id, viewer: BOB }) : null; console.log("   visible to bob:", w.duties.visible ? w.duties.visible({ arising_in: s }, V("bob")) : "n/a", " visible to carol:", w.duties.visible({ arising_in: s }, V("carol"))); }
  }
});
