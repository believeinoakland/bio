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
 * Optional: FW20_TEXT_DIR=<dir> keeps the text each document's reading classified beside the census (D-557).
 *
 * D-557 — THE TEXT A CENSUS JUDGES IS THE TEXT THE READING CLASSIFIED. With FW20_TEXT_DIR set, `<sha>.txt`
 * holds the acquire document's own `text_units` — REC-91's units, taken off the SAME i2 text the content-type
 * reader was handed, AFTER tier 2's merge and tier 3's transcription — and not the plain `op=pdfstructure`
 * answer, which stops at tier 2 (only `&ocr=1` reaches tier 3, and only for a PROMOTED capture, which a
 * census never makes). Until D-557 `<sha>.txt` was that plain answer, so a document the acquire read at tier
 * 3 was judged on EMPTY text while its OCR text existed (M-152: 34 of 38). The plain answer is still kept,
 * as `<sha>.plain.txt`, for audit and for the negative control. `row.judged` says what was judged: the
 * units, their characters, the tiers of the producers of exactly those pages (`reading_provenance`'s
 * `producers`, never the document-level `text_tier`), and whether the digest of the joined units equals
 * the reading's own `text_sha256` — the check that the text judged IS the text classified.
 *
 * WHAT IT CANNOT SEE: the member transcribes ONE page per invocation (CPDF-15's memory
 * ceiling), so a multi-page scan is reported with the pages the plane says it read;
 * nothing is inferred about the rest. The locator given to acquire is the S3 URL, but
 * the bytes are the cached copy (sha in the manifest), fetched from s3://cao-94612.
 * The units obey the acquire wire's budget (`ACQUIRE_TEXT_UNITS_BUDGET`) and carry no page of pure
 * whitespace (D-531): `judged.over_bound` counts what the wire dropped, and `judged.matches_reading` is
 * false wherever the units are not byte for byte the text the reading digested — stated, not smoothed.
 *
 * NEGATIVE CONTROL: `node test/nc-d557.mjs` from `bio-plane/` (D-557, 2026-09-25) — arm `plain` judges the
 * plain `op=pdfstructure` answer again and `d557-census-judged-text.test.mjs`'s TIER-3 arm fails by name;
 * arm `texttier` labels the reader from `text_tier` again and the label arm fails. Results in the driver's
 * header.
 */
import { createHash } from "node:crypto";
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

/* D-557 — THE TEXT THE READING CLASSIFIED, as the acquire document carries it: REC-91's `text_units`, one
   per page that holds a glyph, in the producer's own page order. Returns the pages judged and what they
   are, with the producers of exactly those pages read off the reading's own provenance. */
const sha256 = (s) => createHash("sha256").update(s).digest("hex");
function judgedOf(doc) {
  const units = Array.isArray(doc && doc.text_units) ? doc.text_units : [];
  const pages = units.filter((u) => u && u.extent && u.extent.kind === "pdf-page" && typeof u.text === "string")
    .map((u) => ({ page: u.extent.page, text: u.text }));
  const prov = (doc && doc.reading && doc.reading.provenance) || null;
  const on = new Set(pages.map((p) => p.page));
  const producers = (prov && Array.isArray(prov.producers) ? prov.producers : [])
    .filter((p) => p && (p.pages == null || p.pages.some((pg) => on.has(pg))));
  const joined = pages.map((p) => p.text).join("\n");
  const tiers = [...new Set(pages.length ? producers.map((p) => p.tier) : [])].sort((a, b) => (a ?? 99) - (b ?? 99));
  const glyphs = pages.some((p) => p.text.trim().length);
  return { pages, judged: {
    from: "acquire text_units", units: pages.length, chars: pages.reduce((n, p) => n + p.text.length, 0),
    over_bound: (doc && doc.text_units_over_bound) || 0,
    /* THE READER, from the producers of the pages judged — never from `text_tier` (D-557). No text judged,
       no tier: a label names a tier only when that tier's text is what was judged. */
    tiers,
    reader: glyphs && tiers.some((t) => t != null)
      ? `plane (text tier ${tiers.filter((t) => t != null).join("+")})` : "plane (no text judged)",
    producers: producers.map((p) => ({ tier: p.tier, member: p.member, ...(p.engine ? { engine: p.engine } : {}),
                                       pages: p.pages })),
    /* Equal only when the units are the reading's own text byte for byte; null when nothing was classified. */
    matches_reading: prov && prov.text_sha256 ? (joined.length ? sha256(joined) === prov.text_sha256 : false) : null,
  } };
}

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
      tier3_candidate: rd.tier3_candidate ?? null, basis: rd.basis ?? null, also: rd.also ?? rd.facts?.also_satisfies ?? null,
      /* D-536: the reading's own provenance — tier, member, pages and the digest of the text it classified. */
      reading_provenance: rd.provenance ?? null };
    /* The text the reading was made from, kept beside the census so a reader can
       check the decode is text and not glyph noise (an equality that costs nothing). */
    if (process.env.FW20_TEXT_DIR && doc) {
      try {
        const st = await (await mf.dispatchFetch(`http://x/api/pdfstructure?token=mem-c&sha256=${m.sha}`)).json();
        const plain = (st.text && Array.isArray(st.text.pages)) ? st.text.pages : [];
        row.structure_tier = st.text ? (st.text.tier ?? null) : null;
        /* D-536: the provenance of the PLAIN answer, which stops at tier 2 — kept for audit; since D-557 it
           is NOT the text the census judges, which is `judged` below. */
        row.structure_provenance = st.provenance ?? null;
        row.plain_chars = plain.reduce((n, p) => n + String(p.text || "").length, 0);
        writeFileSync(`${process.env.FW20_TEXT_DIR}/${m.sha}.plain.txt`, plain.map((p) => String(p.text || "")).join("\n\f\n"));
        /* D-557: THE TEXT JUDGED is the text the reading classified. */
        const j = judgedOf(doc);
        const judged = j.pages;
        row.judged = j.judged;
        row.chars = j.judged.chars;
        writeFileSync(`${process.env.FW20_TEXT_DIR}/${m.sha}.txt`, judged.map((p) => String(p.text || "")).join("\n\f\n"));
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
