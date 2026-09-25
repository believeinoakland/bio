/* D-616 — PAGES PAST THE PER-REQUEST OCR BUDGET ARE READ ON A LATER REQUEST: THE RE-READ ASKS ONLY FOR THE UNREAD TAIL.
 *
 * D-606 caps one acquire at OCR_INVOCATIONS_PER_REQUEST (24) member invocations. The re-read (`op=pdfstructure&ocr=1`)
 * started from tier 1's text, where every scanned page carries `no_text_layer` again, so it asked for the SAME first
 * pages and a scan longer than the budget could never be read past it. The fix seeds `tier3Extend` with the pages the
 * stored reading already transcribed (its chain's tier-3 steps say which; the record's per-page text units hold the
 * words), so each re-read asks only for the untranscribed tail and advances by up to the budget. Everything here is
 * driven through the ops: `op=acquire`, `op=promote`, `op=pdfstructure&ocr=1`, `op=reading`.
 *
 *  §1 THE ROW'S OWN FIXTURE: a 30-page scan reads 24 pages on the acquire and the other 6 on ONE re-read, and no page
 *     is transcribed twice. A further re-read asks nothing. The reading states how many pages remain.
 *  §2 A 50-PAGE SCAN ADVANCES BY THE BUDGET: 24, then 24, then the last 2.
 *  §3 A CHANGED ENGINE BUILD: the tail is read by the new build and the kept pages stay under the build that read them
 *     — two scoped parts, and no page is filed under the other build's chain (D-606's provenance rule).
 *
 * NEGATIVE CONTROL: RUN 2026-09-25, one arm, declared before arming. (1) START THE RE-READ FROM TIER-1 TEXT AGAIN — in
 * `bio-plane/src/index.mjs`, the re-read's `seed: tier3SeedFrom(stored, reBasis.units)` becomes `seed: null` (1 match,
 * armed). DECLARED: MUST fail "the re-read's first call does not ask for page 1 again" and "no page is transcribed
 * twice across the acquire and the re-read" by name, with the re-read asking from page 0; MUST NOT fail any §1
 * acquire-side arm (the acquire never had a seed). ACTUAL: 14 passed / 19 failed — the re-read's first call asked
 * pages 0-29 and transcribed 0-23 again, both named arms failed by name, the 50-page scan stuck at 24 read / 26 unread
 * and the changed-build arm got one build's pages; every §1 acquire-side arm passed -> 14/19. BASELINE 33/0. Restored by
 * `cp` from a pristine copy: sha256 284daddd…4889 before and after, `cmp` identical, 901,741 B; re-run 33/0.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { createHash } from "node:crypto";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0, footReached = false;
process.on("exit", () => {
  if (!footReached) console.log(`\nd616-tail-reread: ${pass} passed, ${fail + 1} failed — SUITE ENDED BEFORE ITS OWN FOOT`);
});
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const num = (re, s) => { const m = re.exec(String(s || "")); return m ? +m[1] : 0; };
const filledOf = (rd) => num(/(\d+) scanned page\(s\) were transcribed/, rd && rd.basis);
const unreadOf = (rd) => num(/(\d+) page\(s\) with no text layer were not transcribed/, rd && rd.basis);
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);

/* N image-only pages (D-606's fixture); `salt` changes one byte of the image so each scan is its own capture. */
function scanPdf(n, salt = 0) {
  const objs = [{ num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${Array.from({ length: n }, (_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${n} >>` }];
  const img = deflateSync(Buffer.alloc(256, 0x80 + salt));
  const content = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
  for (let i = 0; i < n; i++) {
    const p = 3 + i * 3;
    objs.push({ num: p, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>` });
    objs.push({ num: p + 1, head: `<< /Length ${content.length} >>`, stream: content });
    objs.push({ num: p + 2, head: `<< /Type /XObject /Subtype /Image /Width 16 /Height 16 /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${img.length} >>`, stream: img });
  }
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"), o.stream, Buffer.from("\nendstream\n", "latin1"));
    else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}

const DOCS = { "/scan30.pdf": scanPdf(30, 0), "/scan50.pdf": scanPdf(50, 1), "/build30.pdf": scanPdf(30, 2) };
const serve = (request) => {
  const b = DOCS[new URL(request.url).pathname];
  return b ? new Response(b, { headers: { "content-type": "application/pdf" } }) : new Response("unscripted", { status: 500 });
};

/* THE STUB MEMBER: D-606's — the real member's chunk rule (lowest page taken, the rest deferred) and envelope.
   `GET /log` returns every call's page list in order; `GET /build?v=` switches the engine version it answers under. */
const STUB = `
const log = [];
let version = "0.11.0";
const region = (p) => ({ text: "SCANNED PAGE " + p, confidence: { value: 0.97, basis: "engine" },
  source: { kind: "pdf-page", ref: "p" + p, page: p, rect: [72, 700, 540, 712] } });
export default { async fetch(req) {
  const u = new URL(req.url);
  if (req.method === "GET" && u.pathname === "/log") return Response.json(log);
  if (req.method === "GET" && u.pathname === "/build") { version = u.searchParams.get("v"); return Response.json({ version }); }
  const body = await req.json();
  const clean = [...new Set(body.pages)].filter(Number.isInteger).sort((a, b) => a - b);
  log.push(clean);
  const take = clean[0];
  return Response.json({ ok: true, engine: "tesseract-wasm", version, cap: "C", measured_by: "CPDF-15",
    confidence_floor: null, pages: [{ page: take, regions: [region(take)] }], deferred: clean.slice(1), notes: [] });
} };`;

const mf = new Miniflare({ workers: [
  { name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"], serviceBindings: { OCR_WORKER: "ocr-stub" },
    bindings: { ADMIN_TOKEN: "adm-616", MEMBER_TOKEN: "mem-616", PROBE_TOKEN: "prb-616", VERSION: "test",
                GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
    outboundService: serve },
  { name: "ocr-stub", modules: true, script: STUB, compatibilityDate: "2026-07-01" },
] });
const stub = async (path) => (await (await (await mf.getWorker("ocr-stub")).fetch(`http://s${path}`)).json());
const api = async (q, init) => { const r = await mf.dispatchFetch(`http://x/api/?${q}`, init); try { return await r.json(); } catch { return null; } };
const post = (q, body) => api(q, { method: "POST", body: JSON.stringify(body) });
const acquire = async (path) => (await post("op=acquire&token=mem-616",
  { locator: "https://oakland.legistar.com" + path, authority: "City Clerk" }));
const reread = (s) => api(`op=pdfstructure&token=mem-616&sha256=${s}&ocr=1`);
const reading = async (s) => (await api(`op=reading&token=mem-616&sha256=${s}`))?.result?.reading ?? null;
/* what each call TRANSCRIBED: the member takes the lowest page it is sent (the chunk rule). */
const takes = (log) => log.map((l) => l[0]);
const ocrParts = (chain) => (Array.isArray(chain) ? chain : []).filter((s) => s && s.step === "ocr")
  .map((s) => ({ version: s.version, pages: s.extent ? s.extent.pages : "all" }));

const NOW = "2026-09-25T00:00:00Z";
const bundleMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Member ${id}"`, "current_state: collected", "prior_state: null", `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged", "source:", "  locator: in hand",
  "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Member bundle.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
let bseq = 0;
const promote = async (doc) => {
  const bid = `INFO-2026-${String(++bseq).padStart(4, "0")}-d616`;
  const md = bundleMd(bid), prov = JSON.stringify({ documents: [doc] });
  const r = await post("op=promote&token=mem-616", {
    bundleId: bid, base: null, snapKey: `20260925T01000${bseq}Z_d616aaaa`, author: "d616",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Member ${bid}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [{ path: doc.file, sha256: doc.capture.sha256, bytes: doc.capture.bytes ?? 1, encoding: "binary" }] });
  return r?.result?.ok === true;
};

try {
  console.log("--- 1 · the row's fixture: 30 image-only pages, 24 on the acquire, the other 6 on ONE re-read ---");
  let S = null;
  {
    const a = await acquire("/scan30.pdf");
    const doc = a?.document, rd = doc?.reading || {};
    S = doc?.capture?.sha256;
    const log = await stub("/log");
    t("the acquire succeeds and the fixture is a 30-page scan", [a?.ok, log[0]?.length], [true, 30]);
    t("the acquire transcribes pages 0-23 — 24 invocations, the budget", takes(log), range(0, 24));
    t("the reading states how many pages remain: 24 transcribed, 6 unread", [filledOf(rd), unreadOf(rd)], [24, 6]);
    t("and says a re-read asks for them next", /6 of them \(from page 24\) were not asked for in this request.*a re-read \(op=pdfstructure&ocr=1\) asks for them next/.test(rd.basis || ""), true);
    t("the capture stays a tier-3 candidate", rd.tier3_candidate, true);
    t("the record's text units hold the 24 transcribed pages", (doc?.text_units || []).map((u) => u.extent?.page), range(0, 24));
    t("the bundle carrying it is promoted", await promote(doc), true);
  }
  {
    const before = (await stub("/log")).length;
    const r = await reread(S);
    const log = (await stub("/log")).slice(before);
    const all = takes(await stub("/log"));
    t("the re-read is performed and written", [r?.reextraction?.performed, r?.reextraction?.written], [true, true]);
    t("the re-read's first call does not ask for page 1 again — it asks for the unread tail only", log[0], range(24, 30));
    t("the re-read transcribes pages 24-29 and nothing else — 6 invocations", takes(log), range(24, 30));
    t("no page is transcribed twice across the acquire and the re-read", all.length === new Set(all).size && all.length === 30, true);
    t("the re-read names only the pages it transcribed", r?.reextraction?.pages, range(24, 30));
    const rd = await reading(S);
    t("the stored reading now holds all 30 pages, none unread", [filledOf(rd), unreadOf(rd)], [30, 0]);
    t("and says the 24 were kept from the earlier reading rather than asked again", /24 of them were transcribed by an earlier reading of this capture and kept, not asked for again/.test(rd?.basis || ""), true);
    t("the capture no longer wants OCR", rd?.tier3_candidate ?? false, false);
    t("one build read every page, so the chain is the one unscoped part it always was", ocrParts(rd?.text_source), [{ version: "0.11.0", pages: "all" }]);
    t("the served text carries every page's transcription, the kept ones included",
      range(0, 30).every((p) => (r?.text?.pages || []).find((x) => x.page === p)?.text === `SCANNED PAGE ${p}`), true);
    t("the re-read's text units hold all 30 pages", r?.reextraction?.units?.written, 30);
  }
  {
    const before = (await stub("/log")).length;
    const r = await reread(S);
    t("a further re-read asks the member for NOTHING — every page is transcribed", (await stub("/log")).length - before, 0);
    t("and is not performed, saying why", [r?.reextraction?.performed, /already transcribed/.test(r?.reextraction?.why || "")], [false, true]);
    t("the stored reading is unchanged by it", [filledOf(await reading(S)), unreadOf(await reading(S))], [30, 0]);
  }

  console.log("\n--- 2 · a 50-page scan advances by the budget: 24, 24, then 2 ---");
  {
    let before = (await stub("/log")).length;
    const a = await acquire("/scan50.pdf");
    const S50 = a?.document?.capture?.sha256;
    t("acquire: pages 0-23", takes((await stub("/log")).slice(before)), range(0, 24));
    t("promoted", await promote(a?.document), true);
    before = (await stub("/log")).length;
    await reread(S50);
    t("first re-read: pages 24-47, the budget again", takes((await stub("/log")).slice(before)), range(24, 48));
    t("the reading states the 2 that remain", [filledOf(await reading(S50)), unreadOf(await reading(S50))], [48, 2]);
    t("and stays a candidate", (await reading(S50))?.tier3_candidate, true);
    before = (await stub("/log")).length;
    await reread(S50);
    t("second re-read: pages 48-49", takes((await stub("/log")).slice(before)), range(48, 50));
    t("all 50 read, none unread", [filledOf(await reading(S50)), unreadOf(await reading(S50))], [50, 0]);
  }

  console.log("\n--- 3 · a changed engine build: the tail under the new build, the kept pages under the old ---");
  {
    await stub("/build?v=0.11.0");
    const a = await acquire("/build30.pdf");
    const SB = a?.document?.capture?.sha256;
    t("promoted", await promote(a?.document), true);
    await stub("/build?v=0.12.0");
    const before = (await stub("/log")).length;
    const r = await reread(SB);
    t("the new build is asked for the tail only", takes((await stub("/log")).slice(before)), range(24, 30));
    const rd = await reading(SB);
    t("all 30 pages read", [filledOf(rd), unreadOf(rd)], [30, 0]);
    t("each build's pages under its own chain — 0.11.0 over 0-23, 0.12.0 over 24-29", ocrParts(rd?.text_source),
      [{ version: "0.11.0", pages: range(0, 24) }, { version: "0.12.0", pages: range(24, 30) }]);
    t("the re-read names the new build as its engine", r?.reextraction?.engine?.version, "0.12.0");
    await stub("/build?v=0.11.0");
  }
  footReached = true;
} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`); fail++;
} finally { await mf.dispose(); }
console.log(`\nd616-tail-reread: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
