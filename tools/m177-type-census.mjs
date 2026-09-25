// M-177 (D-578) — READ-ONLY census: every bundle row's object_type, bucketed. Only stats and list are called; stats before/after is the witness.
// Usage: BIO_INSTANCE, BIO_ADMIN_TOKEN set; node tools/m177-type-census.mjs scratch bio
const inst = process.env.BIO_INSTANCE, tok = process.env.BIO_ADMIN_TOKEN;
const base = `https://${inst}.believeinoakland.workers.dev/api/`;
async function call(store, op, qs = "") {
  const r = await fetch(`${base}?op=${op}&store=${store}&token=${encodeURIComponent(tok)}${qs ? "&" + qs : ""}`);
  const t = await r.text(); try { const j = JSON.parse(t); return j && j.result !== undefined ? j.result : j; } catch { return { _status: r.status }; }
}
for (const store of process.argv.slice(2)) {
  const before = await call(store, "stats");
  let after = "", all = [], total = null;
  for (;;) {
    const r = await call(store, "list", `limit=500${after ? "&after=" + encodeURIComponent(after) : ""}`);
    if (!r.bundles) { console.log(store, "LIST SHAPE", JSON.stringify(r).slice(0, 200)); break; }
    all.push(...r.bundles); total = r.total; if (!r.cursor || !r.bundles.length) break; after = r.cursor;
  }
  const buckets = {};
  for (const b of all) { const k = typeof b.object_type !== "string" ? `<${typeof b.object_type}>` : b.object_type.trim() === "" ? `<blank:${JSON.stringify(b.object_type)}>` : b.object_type; buckets[k] = (buckets[k] || 0) + 1; }
  const afterStats = await call(store, "stats");
  console.log(JSON.stringify({ store, when: new Date().toISOString(), list_total: total, rows: all.length, buckets,
    stats_unchanged: JSON.stringify(before) === JSON.stringify(afterStats) }));
}
