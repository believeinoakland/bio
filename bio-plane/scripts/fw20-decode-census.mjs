/* FW-20 — THE DECODE CENSUS OF THE STAFF-DIRECTORY CLASS, RE-TAKEN THROUGH THE PLANE.
 *
 * D-376 measured (FW-18, 2026-09-15) that 0 of 30 name-matched directory PDFs decoded
 * at Tier 1. The FW-20 row says that premise is a measurement and must be RE-TAKEN, not
 * inherited, now that tier 3 exists. This instrument boots the REAL plane
 * (`src/index.mjs`) and the REAL OCR member (its committed bundle, wasm core and model,
 * `ocr-worker/test/memberworker.mjs`'s recipe) in miniflare, serves each cached PDF's
 * bytes from a local outbound service, and drives `op=acquire` — the capture path that
 * reaches tiers 2 (the committed pdf-worker bundle, as the live fleet binds it) and 3 — once per document, then `op=pdfstructure&ocr=1` (D-319's seam) for
 * any page the acquire left unread. It records what the plane's own reading says:
 * text tier, whether it read from text, the content type the registry chose, and the
 * basis sentence. Nothing here classifies a document itself.
 *
 * usage: node scripts/fw20-decode-census.mjs <manifest.json> <pdf-dir> [out.json]
 *   manifest: [{ key, sha, bytes, ... }] — the bucket keys and the sha of the bytes held.
 *
 * usage, tier 1 alone (D-376's instrument): FW20_TIER1_ONLY=1 node scripts/fw20-decode-census.mjs …
 * Optional: FW20_TEXT_DIR=<dir> keeps each document's `op=pdfstructure` text beside the census.
 *
 * WHAT IT CANNOT SEE: the member transcribes ONE page per invocation (CPDF-15's memory
 * ceiling), so a multi-page scan is reported with the pages the plane says it read;
 * nothing is inferred about the rest. The locator given to acquire is the S3 URL, but
 * the bytes are the cached copy (sha in the manifest), fetched from s3://cao-94612.
 */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ocrWorkerDef } from "../../ocr-worker/test/memberworker.mjs";

const [manPath, pdfDir, outPath] = process.argv.slice(2);
if (!manPath || !pdfDir) { console.error("usage: fw20-decode-census.mjs <manifest.json> <pdf-dir> [out.json]"); process.exit(2); }
const man = JSON.parse(readFileSync(manPath, "utf8"));
if (!Array.isArray(man) || !man.length) { console.error("empty manifest"); process.exit(2); }
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const TIER1_ONLY = process.env.FW20_TIER1_ONLY === "1";
const PDFW = fileURLToPath(new URL("../../pdf-worker/dist/pdf-worker.bundled.mjs", import.meta.url));
const byPath = new Map(man.map((m) => ["/" + m.key, m]));
const serve = (request) => {
  const m = byPath.get(decodeURIComponent(new URL(request.url).pathname));
  if (!m) return new Response("unscripted", { status: 404 });
  return new Response(readFileSync(`${pdfDir}/${m.sha}.pdf`), { headers: { "content-type": "application/pdf" } });
};
const mf = new Miniflare({ workers: [{
  name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* FW20_TIER1_ONLY=1 binds NO member: the plane's own tier 1 alone, which is the instrument
     D-376 was measured with. Same bytes, same plane — only the fleet differs. */
  ...(TIER1_ONLY ? {} : { serviceBindings: { OCR_WORKER: "ocr-worker", PDF_WORKER: "pdf-worker" } }),
  bindings: { ADMIN_TOKEN: "adm-c", MEMBER_TOKEN: "mem-c", PROBE_TOKEN: "prb-c", VERSION: "census",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: serve,
}, ...(TIER1_ONLY ? [] : [ocrWorkerDef(), {
  name: "pdf-worker", modules: true, modulesRoot: "/", scriptPath: PDFW, script: readFileSync(PDFW, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], r2Buckets: ["CAPTURES"],
  bindings: { VERSION: "census" },
}])] });
const api = async (q, init) => (await (await mf.dispatchFetch(`http://x/api/?${q}`, init)).json());

const rows = [];
try {
  for (const m of man) {
    const t0 = Date.now();
    let doc = null, err = null;
    try {
      const r = await api("op=acquire&token=mem-c", { method: "POST",
        body: JSON.stringify({ locator: "https://cao-94612.s3.amazonaws.com/" + m.key, authority: "City of Oakland" }) });
      doc = r.document || null; if (!doc) err = JSON.stringify(r).slice(0, 300);
    } catch (e) { err = String(e && e.message || e); }
    const rd = (doc && doc.reading) || {};
    const row = { key: m.key, sha: m.sha, bytes: m.bytes, ms: Date.now() - t0, err,
      text_tier: rd.text_tier ?? null, read_from_text: rd.read_from_text ?? null, found: rd.found ?? null,
      content_type: rd.content_type ?? null, entities: Array.isArray(rd.entities) ? rd.entities.length : null,
      tier3_candidate: rd.tier3_candidate ?? null, basis: rd.basis ?? null, also: rd.also ?? rd.facts?.also_satisfies ?? null };
    /* The text the reading was made from, kept beside the census so a reader can
       check the decode is text and not glyph noise (an equality that costs nothing). */
    if (process.env.FW20_TEXT_DIR && doc) {
      try {
        const st = await (await mf.dispatchFetch(`http://x/api/pdfstructure?token=mem-c&sha256=${m.sha}`)).json();
        const pages = (st.text && Array.isArray(st.text.pages)) ? st.text.pages : [];
        row.structure_tier = st.text ? (st.text.tier ?? null) : null;
        row.chars = pages.reduce((n, p) => n + String(p.text || "").length, 0);
        writeFileSync(`${process.env.FW20_TEXT_DIR}/${m.sha}.txt`, pages.map((p) => String(p.text || "")).join("\n\f\n"));
        if (st.text) writeFileSync(`${process.env.FW20_TEXT_DIR}/${m.sha}.i2.json`, JSON.stringify(st.text));
      } catch (e) { row.text_err = String(e && e.message || e); }
    }
    rows.push(row);
    console.log(JSON.stringify(row));
  }
} finally { await mf.dispose(); }
if (outPath) writeFileSync(outPath, JSON.stringify(rows, null, 1));
const read = rows.filter((r) => r.read_from_text === true).length;
console.log(`CENSUS${TIER1_ONLY ? " (tier 1 only)" : ""} ${rows.length} documents · read_from_text ${read} · tier3 ${rows.filter((r) => r.text_tier === 3).length} · errors ${rows.filter((r) => r.err).length}`);
