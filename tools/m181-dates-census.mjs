// M-181 (D-615) — READ-ONLY census: bundles whose PROJECTED `created`/`last_updated` (the row) differ from what the HEAD
// document states. D-615 derives both from the document, so a row that differs is one an envelope wrote apart from its
// bytes, and an internal writer that relabels from the row (provenanceChainRebuild) would meet ENVELOPE_DATES_DISAGREE.
// op=list carries no `created`, so the row is read per bundle from op=projection (a first draft compared list rows and
// was empty by construction: 31 of 31 rows had no `created` to compare).
// Usage: BIO_INSTANCE, BIO_ADMIN_TOKEN set; node tools/m181-dates-census.mjs scratch bio
// Every call names its store; only read ops (stats, list, image) are called, and stats is read before and after as the witness.
// Two dates AGREE when both parse to the same instant (a respelling of one instant is not a drift), else when their
// trimmed text is equal — the same rule promote's refusal uses.
const inst = process.env.BIO_INSTANCE, tok = process.env.BIO_ADMIN_TOKEN;
const base = `https://${inst}.believeinoakland.workers.dev/api/`;
async function call(store, op, qs = "") {
  const u = `${base}?op=${op}&store=${store}&token=${encodeURIComponent(tok)}${qs ? "&" + qs : ""}`;
  const r = await fetch(u); const t = await r.text();
  try { const j = JSON.parse(t); return j && j.result !== undefined ? j.result : j; } catch { return { _status: r.status, _text: t.slice(0, 200) }; }
}
const { parseFrontmatter } = await import(new URL("../bio-plane/checks/bio-checks.mjs", import.meta.url));
const stated = (v) => typeof v === "string" && v.trim() !== "";
const sameInstant = (a, b) => {
  const x = Date.parse(String(a).trim()), y = Date.parse(String(b).trim());
  return Number.isFinite(x) && Number.isFinite(y) ? x === y : String(a).trim() === String(b).trim();
};
for (const store of process.argv.slice(2)) {
  const before = await call(store, "stats");
  let after = "", all = [], total = null;
  for (;;) {
    const r = await call(store, "list", `limit=500${after ? "&after=" + encodeURIComponent(after) : ""}`);
    const rows = r.bundles;
    if (!rows) { console.log(store, "LIST SHAPE", JSON.stringify(r).slice(0, 300)); break; }
    all.push(...rows); total = r.total; if (!r.cursor || !rows.length) break; after = r.cursor;
  }
  let read = 0, blob = 0, unparsed = 0, rowNoDates = 0;
  const created = [], updated = [], docUnstated = [], rowUnstated = [], respelled = []; let sample = null;
  for (const b of all) {
    /* op=list carries no `created`; the row's two dates are read from op=projection's single-bundle answer. */
    const pr = await call(store, "projection", `id=${encodeURIComponent(b.bundle_id)}`);
    const row = pr && (pr.bundle || pr.row || pr);
    if (!row || !("created" in row) || !("last_updated" in row)) { rowNoDates++; if (rowNoDates === 1) console.error("PROJECTION SHAPE", JSON.stringify(pr).slice(0, 300)); continue; }
    const img = await call(store, "image", `id=${encodeURIComponent(b.bundle_id)}`);
    const md = (img.image || img.files || img)["bundle.md"];
    if (typeof md !== "string") { blob++; continue; }
    read++;
    const fm = parseFrontmatter(md).data;
    if (!fm || typeof fm !== "object") { unparsed++; continue; }
    if (!stated(fm.created) || !stated(fm.last_updated)) docUnstated.push([b.bundle_id, fm.created ?? null, fm.last_updated ?? null]);
    if (!stated(row.created) || !stated(row.last_updated)) rowUnstated.push([b.bundle_id, row.created ?? null, row.last_updated ?? null]);
    if (!sample) sample = { id: b.bundle_id, row: [row.created, row.last_updated], document: [fm.created, fm.last_updated] };
    for (const k of ["created", "last_updated"])
      if (stated(fm[k]) && stated(row[k]) && sameInstant(row[k], fm[k]) && String(row[k]).trim() !== String(fm[k]).trim())
        respelled.push([b.bundle_id, k, row[k], fm[k]]);
    if (stated(fm.created) && stated(row.created) && !sameInstant(row.created, fm.created))
      created.push([b.bundle_id, row.created, fm.created]);
    if (stated(fm.last_updated) && stated(row.last_updated) && !sameInstant(row.last_updated, fm.last_updated))
      updated.push([b.bundle_id, row.last_updated, fm.last_updated]);
  }
  const afterStats = await call(store, "stats");
  console.log(JSON.stringify({ store, list_total: total, bundles: all.length, rows_without_date_fields: rowNoDates,
    head_documents_read: read, blob_held: blob, unparsed, document_states_no_date: docUnstated.length, docUnstated,
    row_states_no_date: rowUnstated.length, rowUnstated, compared: read - unparsed, sample, same_instant_respelled: respelled.length, respelled,
    created_differs: created.length, created, last_updated_differs: updated.length, updated,
    stats_unchanged: JSON.stringify(before) === JSON.stringify(afterStats), stats_before: before }, null, 1));
}
