// M-179 (D-546) — READ-ONLY census: every recorded state MOVE whose edge the catalogue's CURRENT table does not declare.
// Usage: BIO_INSTANCE, BIO_ADMIN_TOKEN set; node tools/m179-statemove-census.mjs scratch bio
// Every call names its store; only read ops (stats, list, image) are called, and stats is read before and after as the witness.
// CORRECTED 2026-09-25 before any figure was recorded: the first spelling paired by `created` alone, which the plane's
// own census suite (d546-state-edge) measured wrong — `created` is the writer's `last_updated`, a caller's statement.
// Two registers of moves are read, and kept apart because they are different claims:
//   (A) PROMOTION MOVES — consecutive recorded versions of `bundle.md` (each `_history/bundle_<key>.md` is the version a
//       promotion SNAPSHOTTED, i.e. the one before it; the head is the one after the last), paired in the manifest's order
//       (`created`, then as listed — REC-182), dated by the promotion that wrote the later one. A promotion that
//       snapshotted no `bundle.md` leaves its pair UNDETERMINED, counted apart, never classified.
//   (B) STATE_HISTORY MOVES — the `state_history` entries the head document itself carries (from_state -> to_state).
// The table is the catalogue's, read through `vocabFor` over the version's DECLARED spelling (the MAP RULE); no copy here.
import { STATES, vocabFor, parseFrontmatter, normalizeType } from "../bio-plane/checks/bio-checks.mjs";
const inst = process.env.BIO_INSTANCE, tok = process.env.BIO_ADMIN_TOKEN;
const base = `https://${inst}.believeinoakland.workers.dev/api/`;
async function call(store, op, qs = "") {
  const r = await fetch(`${base}?op=${op}&store=${store}&token=${encodeURIComponent(tok)}${qs ? "&" + qs : ""}`);
  const t = await r.text(); try { const j = JSON.parse(t); return j && j.result !== undefined ? j.result : j; } catch { return { _status: r.status }; }
}
const fmOf = (md) => (typeof md === "string" ? parseFrontmatter(md).data : null);
const version = await fetch(`https://${inst}.believeinoakland.workers.dev/version`).then((r) => r.text()).catch(() => "?");
for (const store of process.argv.slice(2)) {
  const before = await call(store, "stats");
  let after = "", all = [], total = null;
  for (;;) {
    const r = await call(store, "list", `limit=500${after ? "&after=" + encodeURIComponent(after) : ""}`);
    if (!r.bundles) { console.log(store, "LIST SHAPE", JSON.stringify(r).slice(0, 200)); break; }
    all.push(...r.bundles); total = r.total; if (!r.cursor || !r.bundles.length) break; after = r.cursor;
  }
  const moves = [], perType = {}, undeclared = [], undetermined = [], noTable = [], hist = {}, histUndeclared = [];
  const bump = (o, t, k) => { o[t] = o[t] || { moves: 0, undeclared: 0, revisions_in_place: 0 }; o[t][k]++; };
  let versionsRead = 0, blobHeld = 0;
  for (const b of all) {
    const img = await call(store, "image", `id=${encodeURIComponent(b.bundle_id)}`);
    const files = img.image || img.files || img;
    let man = [];
    try { man = JSON.parse(files["_history/manifest.json"]).entries || []; } catch { man = []; }
    // ORDER: the image exposes no write order (rowid), and `created` is the writer's claim, so a bundle is paired only
    // when the `created` order and the snap-key order AGREE; otherwise every pair of it is UNDETERMINED.
    const byCreated = man.map((e, i) => ({ ...e, i })).sort((x, y) => (x.created < y.created ? -1 : x.created > y.created ? 1 : x.i - y.i));
    const byKey = [...byCreated].sort((x, y) => (x.key < y.key ? -1 : x.key > y.key ? 1 : 0));
    const agree = byCreated.every((e, i) => e.key === byKey[i].key);
    man = byCreated;
    if (!agree) { for (let j = 1; j < man.length; j++) undetermined.push([b.bundle_id, man[j].created, "created and snap-key orders disagree"]); continue; }
    // version after promotion j = snapshot taken by promotion j+1, or the head for the last promotion.
    const after_ = man.map((e, j) => {
      if (j === man.length - 1) return files["bundle.md"];
      const nx = man[j + 1];
      return (nx.snapshotted || []).includes("bundle.md") ? files[`_history/bundle_${nx.key}.md`] ?? null : null;
    });
    for (const v of after_) { if (typeof v === "string") versionsRead++; else if (v !== null && v !== undefined) blobHeld++; }
    for (let j = 1; j < man.length; j++) {
      // NO JOIN CHECK HERE, and the reason: the image's manifest names a promotion's files but not the digests it wrote,
      // and comparing the later promotion's base with the snapshot that same promotion took is equal by construction
      // (the plane's census suite caught that spelling). The order-agreement test above is this tool's only guard.
      const a = fmOf(after_[j - 1]), z = fmOf(after_[j]);
      if (!a || !z) { undetermined.push([b.bundle_id, man[j].created, a ? "later version unrecorded" : "earlier version unrecorded"]); continue; }
      const t = normalizeType(z.object_type ?? b.object_type), spec = vocabFor(STATES, a.object_type ?? z.object_type ?? b.object_type);
      if (a.current_state === z.current_state) { bump(perType, t, "revisions_in_place"); continue; }
      bump(perType, t, "moves");
      moves.push([b.bundle_id, `${a.current_state}->${z.current_state}`, man[j].created]);
      if (!spec) { noTable.push([b.bundle_id, t]); continue; }
      if (!(spec.edges[a.current_state] || []).includes(z.current_state)) {
        bump(perType, t, "undeclared");
        undeclared.push({ bundle: b.bundle_id, type: t, from: a.current_state, to: z.current_state, date: man[j].created, author: man[j].author ?? null, key: man[j].key });
      }
    }
    const head = fmOf(files["bundle.md"]);
    const sh = head && Array.isArray(head.state_history) ? head.state_history : [];
    const spec = head ? vocabFor(STATES, head.object_type ?? b.object_type) : null;
    for (const e of sh) {
      if (!e || typeof e !== "object") continue;
      const t = normalizeType(head.object_type ?? b.object_type);
      hist[t] = hist[t] || { entries: 0, undeclared: 0 }; hist[t].entries++;
      if (spec && !(spec.edges[e.from_state] || []).includes(e.to_state)) {
        hist[t].undeclared++; histUndeclared.push({ bundle: b.bundle_id, type: t, from: e.from_state, to: e.to_state, date: e.timestamp ?? null });
      }
    }
  }
  const afterStats = await call(store, "stats");
  console.log(JSON.stringify({ store, when: new Date().toISOString(), plane_version: version.trim().slice(0, 40), list_total: total,
    bundles: all.length, versions_read: versionsRead, blob_held_versions: blobHeld,
    promotion_moves_per_type: perType, promotion_moves: moves, promotion_moves_undeclared: undeclared, pairs_undetermined: undetermined,
    moves_with_no_table: noTable, state_history_per_type: hist, state_history_undeclared: histUndeclared,
    witness_equal: JSON.stringify(before) === JSON.stringify(afterStats), stats_before: before, stats_after: afterStats }, null, 1));
}
