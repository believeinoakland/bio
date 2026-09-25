// M-185 (D-726) — READ-ONLY census: bundles whose PROJECTED `group_id` (the row) differs from the `group` the HEAD
// document states. D-726 refuses a non-replay revision whose document restates a different group (C-86.14), so a head
// that already differs is one a revision wrote before the fence; it is counted, never rewritten.
// Usage: BIO_INSTANCE, BIO_ADMIN_TOKEN set; node tools/m185-group-census.mjs scratch bio
// Every call names its store; only read ops (stats, list, projection, image) are called, and stats is read before and
// after as the witness. M-181's instrument (tools/m181-dates-census.mjs), one column over: the row from op=projection
// (op=list carries no group_id), the head bundle.md from op=image parsed by the catalogue's own parseFrontmatter, and a
// document group compared as the fence compares it — any stated value, String()-ed and trimmed.
const inst = process.env.BIO_INSTANCE, tok = process.env.BIO_ADMIN_TOKEN;
const base = `https://${inst}.believeinoakland.workers.dev/api/`;
async function call(store, op, qs = "") {
  const u = `${base}?op=${op}&store=${store}&token=${encodeURIComponent(tok)}${qs ? "&" + qs : ""}`;
  const r = await fetch(u); const t = await r.text();
  try { const j = JSON.parse(t); return j && j.result !== undefined ? j.result : j; } catch { return { _status: r.status, _text: t.slice(0, 200) }; }
}
const { parseFrontmatter } = await import(new URL("../bio-plane/checks/bio-checks.mjs", import.meta.url));
const groupOf = (v) => v !== undefined && v !== null && String(v).trim() !== "" ? String(v).trim() : null;
for (const store of process.argv.slice(2)) {
  const before = await call(store, "stats");
  let after = "", all = [], total = null;
  for (;;) {
    const r = await call(store, "list", `limit=500${after ? "&after=" + encodeURIComponent(after) : ""}`);
    const rows = r.bundles;
    if (!rows) { console.log(store, "LIST SHAPE", JSON.stringify(r).slice(0, 300)); break; }
    all.push(...rows); total = r.total; if (!r.cursor || !rows.length) break; after = r.cursor;
  }
  let read = 0, blob = 0, unparsed = 0, rowNoGroup = 0;
  const differs = [], docUnstated = [], idDiffers = [], groups = {}; let sample = null, idStated = 0;
  for (const b of all) {
    const pr = await call(store, "projection", `id=${encodeURIComponent(b.bundle_id)}`);
    const row = pr && (pr.bundle || pr.row || pr);
    if (!row || groupOf(row.group_id) === null) { rowNoGroup++; if (rowNoGroup === 1) console.error("PROJECTION SHAPE", JSON.stringify(pr).slice(0, 300)); continue; }
    groups[row.group_id] = (groups[row.group_id] || 0) + 1;
    const img = await call(store, "image", `id=${encodeURIComponent(b.bundle_id)}`);
    const md = (img.image || img.files || img)["bundle.md"];
    if (typeof md !== "string") { blob++; continue; }
    read++;
    const fm = parseFrontmatter(md).data;
    if (!fm || typeof fm !== "object") { unparsed++; continue; }
    /* The sweep's second column (D-726's sweep, minted separately): the head document's `id:` against the bundle id. */
    if (groupOf(fm.id) !== null) idStated++;
    if (groupOf(fm.id) !== null && groupOf(fm.id) !== b.bundle_id) idDiffers.push([b.bundle_id, fm.id]);
    const g = groupOf(fm.group);
    if (!sample) sample = { id: b.bundle_id, row: row.group_id, document: fm.group ?? null };
    if (g === null) { docUnstated.push(b.bundle_id); continue; }
    if (g !== String(row.group_id).trim()) differs.push([b.bundle_id, row.group_id, g]);
  }
  const afterStats = await call(store, "stats");
  console.log(JSON.stringify({ store, list_total: total, bundles: all.length, rows_without_group: rowNoGroup, row_groups: groups,
    head_documents_read: read, blob_held: blob, unparsed, document_states_no_group: docUnstated.length, docUnstated,
    compared: read - unparsed - docUnstated.length, sample, group_differs: differs.length, differs, documents_stating_id: idStated, id_differs: idDiffers.length, idDiffers,
    stats_unchanged: JSON.stringify(before) === JSON.stringify(afterStats), stats_before: before }, null, 1));
}
