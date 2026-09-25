// M-172 (D-563) — READ-ONLY census: bundles whose PROJECTED title/state (the row) differs from what the HEAD document
// states. D-563 derives both from the document, so a row that differs is one an envelope wrote, and an internal writer
// that relabels from the row (provenanceChainRebuild, the actioncorrespond family) would meet ENVELOPE_*_DISAGREES on it.
// Usage: BIO_INSTANCE, BIO_ADMIN_TOKEN set; node tools/m172-title-state-census.mjs scratch bio
// Every call names its store; only read ops (stats, list, image) are called, and stats is read before and after as the witness.
const inst = process.env.BIO_INSTANCE, tok = process.env.BIO_ADMIN_TOKEN;
const base = `https://${inst}.believeinoakland.workers.dev/api/`;
async function call(store, op, qs = "") {
  const u = `${base}?op=${op}&store=${store}&token=${encodeURIComponent(tok)}${qs ? "&" + qs : ""}`;
  const r = await fetch(u); const t = await r.text();
  try { const j = JSON.parse(t); return j && j.result !== undefined ? j.result : j; } catch { return { _status: r.status, _text: t.slice(0, 200) }; }
}
const { parseFrontmatter, deriveInquiryTitle, inquiryQuestionOf, normalizeType } =
  await import(new URL("../bio-plane/checks/bio-checks.mjs", import.meta.url));
const same = (a, b) => String(a).trim().replace(/\s+/g, " ") === String(b).trim().replace(/\s+/g, " ");
const stated = (v) => typeof v === "string" && v.trim() !== "";
for (const store of process.argv.slice(2)) {
  const before = await call(store, "stats");
  let after = "", all = [], total = null;
  for (;;) {
    const r = await call(store, "list", `limit=500${after ? "&after=" + encodeURIComponent(after) : ""}`);
    const rows = r.bundles;
    if (!rows) { console.log(store, "LIST SHAPE", JSON.stringify(r).slice(0, 300)); break; }
    all.push(...rows); total = r.total; if (!r.cursor || !rows.length) break; after = r.cursor;
  }
  let read = 0, blob = 0, unparsed = 0;
  const title = [], state = [], prior = [];
  for (const b of all) {
    const img = await call(store, "image", `id=${encodeURIComponent(b.bundle_id)}`);
    const md = (img.image || img.files || img)["bundle.md"];
    if (typeof md !== "string") { blob++; continue; }
    read++;
    const fm = parseFrontmatter(md).data;
    if (!fm || typeof fm !== "object") { unparsed++; continue; }
    const qt = normalizeType(fm.object_type) === "inquiry" ? deriveInquiryTitle(inquiryQuestionOf(md)) : null;
    if ((stated(fm.title) || qt) && stated(b.title)
        && !(stated(fm.title) && same(b.title, fm.title)) && !(qt && same(b.title, qt)))
      title.push([b.bundle_id, b.title, fm.title ?? null, qt]);
    if (stated(fm.current_state) && stated(b.current_state) && !same(b.current_state, fm.current_state))
      state.push([b.bundle_id, b.current_state, fm.current_state]);
    if (Object.prototype.hasOwnProperty.call(fm, "prior_state") && (fm.prior_state ?? null) !== (b.prior_state ?? null))
      prior.push([b.bundle_id, b.prior_state ?? null, fm.prior_state ?? null]);
  }
  const afterStats = await call(store, "stats");
  console.log(JSON.stringify({ store, list_total: total, bundles: all.length, head_documents_read: read, blob_held: blob,
    unparsed, title_differs: title.length, title, state_differs: state.length, state, prior_differs: prior.length, prior,
    stats_unchanged: JSON.stringify(before) === JSON.stringify(afterStats), stats_before: before }, null, 1));
}
