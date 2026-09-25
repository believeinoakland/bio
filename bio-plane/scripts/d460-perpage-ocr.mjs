/* D-460 — DOES A MULTI-PAGE SCAN READ GENERIC BECAUSE ONLY ITS FIRST SCANNED PAGE IS EVER TRANSCRIBED?
 *
 * The code answers the mechanism (`ocr-worker/src/contract.mjs` `chooseChunk` takes the LOWEST page and defers the
 * rest; `bio-plane/src/index.mjs` `tier3Extend` calls `/transcribe` ONCE and never reads `deferred`). This instrument
 * answers the CONSEQUENCE, by holding everything fixed but that one call:
 *
 *   arm `shipped`  the REAL plane (`src/index.mjs`), the COMMITTED pdf-worker bundle as PDF_WORKER and the COMMITTED
 *                  OCR member (`ocr-worker/test/memberworker.mjs`'s recipe) as OCR_WORKER — FW-20's census exactly.
 *   arm `perpage`  the same, but OCR_WORKER is a WRAPPER that calls that same member ONCE PER REQUESTED PAGE and hands
 *                  the plane one answer carrying every page the member answered for. The wrapper transcribes nothing
 *                  itself and changes no page's regions; it is the named fix (the caller loops) done at the seam,
 *                  inside the instrument, so the plane's own merge, chain and content-type registry judge the result.
 *
 * Each arm drives `op=acquire` once per document (bytes served from a local outbound stub, as FW-20's census does)
 * and records the plane's own `reading`: content type, tier, and the pages its basis sentence says were and were not
 * transcribed. Nothing here classifies a document itself. With D460_TEXT_DIR the `perpage` arm also writes each
 * page's transcription (`<sha>.p<N>.txt`) so a reader can judge by eye whether a document that stays generic IS.
 *
 * usage (from bio-plane/): node scripts/d460-perpage-ocr.mjs <manifest.json> <pdf-dir> [out.json]
 *   manifest: [{ key, sha, bytes }]; <pdf-dir>/<sha>.pdf holds the bytes. D460_ARMS=shipped|perpage limits the arms.
 *
 * WHAT IT CANNOT SEE: whether one invocation per page stays inside the member's memory bound on the DEPLOYED runtime
 * (miniflare is not workerd's isolate budget — D-312); it measures the reading, not the cost. Pages the member
 * REFUSES (PAGE_NOT_RENDERABLE, PIXELS_UNREADABLE — D-320's DCT route) stay unread in both arms.
 */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ocrWorkerDef } from "../../ocr-worker/test/memberworker.mjs";

const [manPath, pdfDir, outPath] = process.argv.slice(2);
if (!manPath || !pdfDir) { console.error("usage: d460-perpage-ocr.mjs <manifest.json> <pdf-dir> [out.json]"); process.exit(2); }
const man = JSON.parse(readFileSync(manPath, "utf8"));
if (!Array.isArray(man) || !man.length) { console.error("empty manifest"); process.exit(2); }
const ARMS = (process.env.D460_ARMS || "shipped,perpage").split(",");
const TEXT_DIR = process.env.D460_TEXT_DIR || null;
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const PDFW = fileURLToPath(new URL("../../pdf-worker/dist/pdf-worker.bundled.mjs", import.meta.url));
const byPath = new Map(man.map((m) => ["/" + m.key, m]));
const serve = (request) => {
  const m = byPath.get(decodeURIComponent(new URL(request.url).pathname));
  if (!m) return new Response("unscripted", { status: 404 });
  return new Response(readFileSync(`${pdfDir}/${m.sha}.pdf`), { headers: { "content-type": "application/pdf" } });
};

/* The wrapper. One member call per requested page, in page order; the member's own answers are kept verbatim for
   the text dump. It returns the FIRST ok answer's envelope (engine, version, cap, measured_by, grain) with every ok
   answer's `pages[]`, `deferred: []`, and the member's notes minus the one-page-per-invocation sentence (which is no
   longer true of this answer). Pages the member refused are named in a note. No ok page: the first answer, as is. */
const LOOP = `
const seen = new Map();
const j = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
export default { async fetch(req, env) {
  const u = new URL(req.url);
  if (req.method === "GET" && u.pathname.startsWith("/answers/")) return j(seen.get(u.pathname.slice(9)) || null);
  if (req.method !== "POST") return env.MEMBER.fetch(req);
  const body = await req.json();
  const pages = Array.isArray(body.pages) ? body.pages : [];
  const answers = [];
  for (const p of pages) {
    const r = await env.MEMBER.fetch("https://ocr-worker/transcribe", { method: "POST",
      headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, pages: [p] }) });
    answers.push({ page: p, status: r.status, body: await r.json().catch(() => null) });
  }
  seen.set(body.capture_sha, answers);
  const ok = answers.filter((a) => a.status === 200 && a.body && a.body.ok);
  if (!ok.length) { const f = answers[0]; return j(f ? f.body : { ok: false, reason: "BAD_PAGES" }, f ? f.status : 400); }
  const first = ok[0].body;
  const refused = answers.filter((a) => !ok.includes(a)).map((a) => a.page + ":" + (a.body && a.body.reason));
  return j({ ...first, pages: ok.flatMap((a) => a.body.pages), deferred: [],
    notes: [...(first.notes || []).filter((n) => !/ONE PAGE PER INVOCATION/.test(n)),
            ...(refused.length ? ["instrument loop: the member refused " + refused.length + " page(s): " + refused.join(", ")] : [])] });
} };`;

function boot(arm) {
  const plane = {
    name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    serviceBindings: { OCR_WORKER: arm === "perpage" ? "ocr-loop" : "ocr-worker", PDF_WORKER: "pdf-worker" },
    bindings: { ADMIN_TOKEN: "adm-c", MEMBER_TOKEN: "mem-c", PROBE_TOKEN: "prb-c", VERSION: "d460",
                GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
    outboundService: serve,
  };
  const pdfw = { name: "pdf-worker", modules: true, modulesRoot: "/", scriptPath: PDFW, script: readFileSync(PDFW, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], r2Buckets: ["CAPTURES"], bindings: { VERSION: "d460" } };
  const loop = { name: "ocr-loop", modules: true, script: LOOP, compatibilityDate: "2026-07-01", serviceBindings: { MEMBER: "ocr-worker" } };
  return new Miniflare({ workers: [plane, ocrWorkerDef(), pdfw, ...(arm === "perpage" ? [loop] : [])] });
}

const num = (re, s) => { const m = re.exec(String(s || "")); return m ? +m[1] : 0; };
const rows = [];
for (const arm of ARMS) {
  const mf = boot(arm);
  try {
    for (const m of man) {
      const t0 = Date.now();
      let doc = null, err = null;
      try {
        const r = await (await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-c", { method: "POST",
          body: JSON.stringify({ locator: "https://cao-94612.s3.amazonaws.com/" + m.key, authority: "City of Oakland" }) })).json();
        doc = r.document || null; if (!doc) err = JSON.stringify(r).slice(0, 300);
      } catch (e) { err = String(e && e.message || e); }
      const rd = (doc && doc.reading) || {};
      const row = { arm, key: m.key, sha: m.sha, ms: Date.now() - t0, err,
        content_type: rd.content_type ?? null, text_tier: rd.text_tier ?? null, read_from_text: rd.read_from_text ?? null,
        entities: Array.isArray(rd.entities) ? rd.entities.length : null,
        ocr_filled: num(/(\d+) scanned page\(s\) were transcribed/, rd.basis),
        ocr_unread: num(/(\d+) page\(s\) with no text layer were not transcribed/, rd.basis),
        tier3_candidate: rd.tier3_candidate ?? null, basis: rd.basis ?? null };
      if (arm === "perpage" && TEXT_DIR) {
        const answers = await (await (await mf.getWorker("ocr-loop")).fetch(`http://loop/answers/${m.sha}`)).json();
        for (const a of answers || []) {
          const pg = a.body && a.body.ok && a.body.pages && a.body.pages[0];
          writeFileSync(`${TEXT_DIR}/${m.sha}.p${a.page}.txt`, pg ? pg.regions.map((x) => x.text).join("\n")
            : `UNREAD ${a.status} ${a.body && a.body.reason}`);
        }
      }
      rows.push(row);
      console.log(JSON.stringify({ ...row, basis: undefined }));
    }
  } finally { await mf.dispose(); }
}
if (outPath) writeFileSync(outPath, JSON.stringify(rows, null, 1));
for (const arm of ARMS) {
  const a = rows.filter((r) => r.arm === arm);
  const types = {};
  for (const r of a) types[r.content_type] = (types[r.content_type] || 0) + 1;
  console.log(`D460 arm=${arm} documents ${a.length} · errors ${a.filter((r) => r.err).length} · pages transcribed `
    + `${a.reduce((n, r) => n + r.ocr_filled, 0)} · pages left unread ${a.reduce((n, r) => n + r.ocr_unread, 0)} · types ${JSON.stringify(types)}`);
}
