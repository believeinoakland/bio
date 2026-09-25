// M-156 (D-547) — READ-ONLY census: bundles whose revisions carry more than one object_type.
// Usage: BIO_INSTANCE, BIO_ADMIN_TOKEN set; node tools/m156-retype-census.mjs scratch bio
// Every call names its store; only read ops (stats, list, image) are called, and stats is read before and after as the witness.
const inst = process.env.BIO_INSTANCE, tok = process.env.BIO_ADMIN_TOKEN;
const base = `https://${inst}.believeinoakland.workers.dev/api/`;
const ALIAS = { problem: "inquiry", focus: "inquiry" };
const norm = (t) => ALIAS[t] || t;
async function call(store, op, qs = "") {
  const u = `${base}?op=${op}&store=${store}&token=${encodeURIComponent(tok)}${qs ? "&" + qs : ""}`;
  const r = await fetch(u); const t = await r.text();
  try { const j = JSON.parse(t); return j && j.result !== undefined ? j.result : j; } catch { return { _status: r.status, _text: t.slice(0, 200) }; }
}
const typeOf = (md) => {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md); if (!m) return null;
  const l = /^object_type:\s*["']?([A-Za-z_]+)["']?\s*$/m.exec(m[1]); return l ? norm(l[1]) : null;
};
for (const store of process.argv.slice(2)) {
  const before = await call(store, "stats");
  let after = "", all = [];
  for (;;) {
    const r = await call(store, "list", `limit=500${after ? "&after=" + encodeURIComponent(after) : ""}`);
    if (!all.length && !after) console.log(store, 'list keys', Object.keys(r));
    const rows = r.bundles || r.rows || r.items || (Array.isArray(r) ? r : null);
    if (!rows) { console.log(store, "LIST SHAPE", JSON.stringify(r).slice(0, 300)); break; }
    all.push(...rows); if (!r.cursor || !rows.length) { console.log(store, 'total', r.total, 'listed', all.length); break; } after = r.cursor;
  }
  let snaps = 0, blobSnaps = 0, untyped = 0, retyped = [], rowVsDoc = [];
  for (const b of all) {
    const img = await call(store, "image", `id=${encodeURIComponent(b.bundle_id)}`);
    const files = img.image || img.files || img;
    if (b === all[0]) console.log(store, 'image keys', Object.keys(files).slice(0, 12));
    const types = new Set();
    for (const [k, v] of Object.entries(files || {})) {
      if (!(k === 'bundle.md' || /^_history\/bundle_[^/]*\.md$/.test(k))) continue;
      if (typeof v !== "string") { blobSnaps++; continue; }
      snaps++; const t = typeOf(v); if (t === null) { untyped++; continue; } types.add(t);
      if (k === "bundle.md" && t !== norm(b.object_type)) rowVsDoc.push([b.bundle_id, b.object_type, t]);
    }
    if (types.size > 1) retyped.push([b.bundle_id, b.object_type, [...types]]);
  }
  const afterStats = await call(store, "stats");
  console.log(JSON.stringify({ store, bundles: all.length, bundle_md_versions_read: snaps, blob_held_versions: blobSnaps,
    versions_stating_no_type: untyped, retyped_bundles: retyped.length, retyped, row_type_differs_from_head_document: rowVsDoc,
    stats_before: before, stats_after: afterStats }, null, 1));
}
