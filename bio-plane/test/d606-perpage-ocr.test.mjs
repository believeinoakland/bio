/* D-606 — A SCANNED DOCUMENT IS READ PAST ITS FIRST PAGE: THE PLANE ASKS THE OCR MEMBER ONCE PER DEFERRED PAGE.
 *
 * The member transcribes ONE page per invocation and names the rest in `deferred` (`ocr-worker/src/contract.mjs`
 * `chooseChunk`); `tier3Extend` called it once and never read `deferred`, so a scan was read to its first image-only
 * page (M-165: 174 of 190 selected pages unread on FW-20's walk). Two halves, and each is tested through `op=acquire`:
 *
 *  §1 THE REAL PATH — the real plane, the COMMITTED OCR member (bundle + wasm + model, `memberworker.mjs`), and D-460's
 *     committed two-page fixture (`test/fixtures/d460/`): both pages are pixels only, and ONLY page 1 is an agenda.
 *     Read to page 0 alone it is `generic`; read whole it is `meeting_agenda`. `agenda-p1.pdf` (the same two images,
 *     swapped) is the over-strictness arm: it read `meeting_agenda` before the loop and must still.
 *
 *  §2 THE BUDGET AND THE FAILURE MODES — a STUB member honouring the same one-page contract, over synthetic N-page
 *     scans, so each rule is one assertion: the loop stops at OCR_INVOCATIONS_PER_REQUEST (24; Cloudflare's stated
 *     32-invocation limit — THEIR claim — less a reserve) and says so; a call that THROWS ends the loop and never the
 *     acquire; a refused page keeps its marker and the pages after it are still asked; a page answered by a different
 *     engine build is not merged; a page answered to the wrong call is dropped.
 *
 * NEGATIVE CONTROL: RUN 2026-09-25, one arm, declared before arming. (1) STOP READING `deferred` — in
 * `askMemberPerPage` (`bio-plane/src/index.mjs`) `const deferred = (first && Array.isArray(first.deferred) ? … : [])`
 * becomes `const deferred = ([])` (1 match, armed). DECLARED: MUST fail "agenda-p2 reads meeting_agenda through the op"
 * with the fixture reading `generic`, 1 transcribed / 1 unread (M-165's `shipped` row), and every §2/§3 arm that needs a
 * second call; MUST NOT fail "over-strictness: agenda-p1 … still reads meeting_agenda" (its agenda is page 0), the
 * throw arm's "does not fail the acquire", nor "the first call asked for all 30 pages". ACTUAL: 8 passed / 20 failed —
 * agenda-p2 got `generic` and [1,1] by name; agenda-p1 still `meeting_agenda` (its page-count arm failed, [1,1], as it
 * must); the three MUST-NOTs held -> 8/20. BASELINE 28/0. Restored by `cp` from a pristine copy: sha256 dc43a18e…249a before and
 * after, `cmp` identical, 895,450 B; re-run 28/0. Figures in `docs/development/measurements/M-175.md`.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { ocrWorkerDef } from "../../ocr-worker/test/memberworker.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const FIX = (n) => new Uint8Array(readFileSync(fileURLToPath(new URL(`./fixtures/d460/${n}`, import.meta.url))));
const P2 = FIX("agenda-p2.pdf"), P1 = FIX("agenda-p1.pdf");

let pass = 0, fail = 0, footReached = false;
process.on("exit", () => {
  if (!footReached) console.log(`\nd606-perpage-ocr: ${pass} passed, ${fail + 1} failed — SUITE ENDED BEFORE ITS OWN FOOT`);
});
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const num = (re, s) => { const m = re.exec(String(s || "")); return m ? +m[1] : 0; };
const filledOf = (rd) => num(/(\d+) scanned page\(s\) were transcribed/, rd && rd.basis);
const unreadOf = (rd) => num(/(\d+) page\(s\) with no text layer were not transcribed/, rd && rd.basis);

/* N image-only pages, each a 16x16 grey8 Flate image and nothing else: tier 1 marks every page `no_text_layer`. */
function scanPdf(n) {
  const objs = [{ num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${Array.from({ length: n }, (_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${n} >>` }];
  const img = deflateSync(Buffer.alloc(256, 0x80));
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

const DOCS = { "/p2.pdf": P2, "/p1.pdf": P1, "/scan30.pdf": scanPdf(30), "/scan6.pdf": scanPdf(6) };
const serve = (request) => {
  const b = DOCS[new URL(request.url).pathname];
  return b ? new Response(b, { headers: { "content-type": "application/pdf" } }) : new Response("unscripted", { status: 500 });
};
const planeDef = (ocr) => ({
  name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"], serviceBindings: { OCR_WORKER: ocr },
  bindings: { ADMIN_TOKEN: "adm-606", MEMBER_TOKEN: "mem-606", PROBE_TOKEN: "prb-606", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: serve,
});
const acquire = async (mf, path) => (await (await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-606", { method: "POST",
  body: JSON.stringify({ locator: "https://oakland.legistar.com" + path, authority: "City Clerk" }) })).json());

/* THE STUB MEMBER: the real member's chunk rule (lowest page taken, the rest deferred) and envelope, and nothing else.
   MODE picks one deviation; `GET /log` returns the page lists it was asked for, in order. */
const STUB = `
const log = [];
const region = (p) => ({ text: "SCANNED PAGE " + p, confidence: { value: 0.97, basis: "engine" },
  source: { kind: "pdf-page", ref: "p" + p, page: p, rect: [72, 700, 540, 712] } });
const env0 = { ok: true, engine: "tesseract-wasm", version: "0.11.0", cap: "C", measured_by: "CPDF-15", confidence_floor: null };
export default { async fetch(req, env) {
  const u = new URL(req.url);
  if (req.method === "GET" && u.pathname === "/log") return Response.json(log);
  const body = await req.json();
  const clean = [...new Set(body.pages)].filter(Number.isInteger).sort((a, b) => a - b);
  log.push(clean);
  const take = clean[0], deferred = clean.slice(1), M = env.MODE;
  if (M === "throw" && take === 3) throw new Error("the 33rd invocation");
  if (M === "refuse" && (take === 0 || take === 2))
    return Response.json({ ok: false, reason: "PAGE_NOT_RENDERABLE", detail: "x", page: take, deferred, notes: [] });
  const out = { ...env0, pages: [{ page: take, regions: [region(take)] }], deferred, notes: [] };
  if (M === "version" && take === 4) out.version = "0.12.0";
  if (M === "stray" && take === 2) out.pages = [{ page: 5, regions: [region(5)] }];
  return Response.json(out);
} };`;
const stubDef = (mode) => ({ name: "ocr-stub", modules: true, script: STUB, compatibilityDate: "2026-07-01",
  bindings: { MODE: mode } });

try {
  console.log("--- 1 · the real member over D-460's committed two-page fixture ---");
  {
    const mf = new Miniflare({ workers: [planeDef("ocr-worker"), ocrWorkerDef()] });
    try {
      const r2 = await acquire(mf, "/p2.pdf");
      const rd = r2.document?.reading || {};
      t("agenda-p2 (the agenda on page 1 only) is acquired", r2.ok, true);
      t("agenda-p2 reads meeting_agenda through the op — page 1 was asked for and read", rd.content_type, "meeting_agenda");
      t("agenda-p2: both scanned pages transcribed, none left unread", [filledOf(rd), unreadOf(rd)], [2, 0]);
      t("agenda-p2 no longer wants OCR (the reading carries `tier3_candidate` only when true)", rd.tier3_candidate ?? false, false);
      const r1 = await acquire(mf, "/p1.pdf");
      t("over-strictness: agenda-p1 (the agenda on page 0) still reads meeting_agenda", r1.document?.reading?.content_type, "meeting_agenda");
      t("agenda-p1: both pages transcribed", [filledOf(r1.document?.reading), unreadOf(r1.document?.reading)], [2, 0]);
    } finally { await mf.dispose(); }
  }

  const stubRun = async (mode, path) => {
    const mf = new Miniflare({ workers: [planeDef("ocr-stub"), stubDef(mode)] });
    try {
      const r = await acquire(mf, path);
      const log = await (await (await mf.getWorker("ocr-stub")).fetch("http://s/log")).json();
      return { r, rd: r.document?.reading || {}, log, doc: r.document };
    } finally { await mf.dispose(); }
  };

  console.log("\n--- 2 · the budget: a 30-page scan, one call per page, at most 24 calls ---");
  {
    const { r, rd, log } = await stubRun("chunk", "/scan30.pdf");
    t("the acquire succeeds", r.ok, true);
    t("the first call asked for all 30 pages", (log[0] || []).length, 30);
    t("every later call asked for exactly ONE page, in order", log.slice(1).map((l) => l.length === 1 ? l[0] : l),
      Array.from({ length: 23 }, (_, i) => i + 1));
    t("24 invocations in all — the budget, not the page count", log.length, 24);
    t("24 pages transcribed, 6 stay unread", [filledOf(rd), unreadOf(rd)], [24, 6]);
    t("the basis says the tail was NOT ASKED, from which page, and whose limit", /6 of them \(from page 24\) were not asked for in this request.*32 Worker invocations per request — their claim/.test(rd.basis || ""), true);
    t("and the capture stays a tier-3 candidate", rd.tier3_candidate, true);
  }
  {
    const { rd, log } = await stubRun("chunk", "/scan6.pdf");
    t("under the budget every page is read: 6 calls, 6 transcribed, 0 unread", [log.length, filledOf(rd), unreadOf(rd)], [6, 6, 0]);
    t("and nothing is said about a budget it did not meet", /not asked for/.test(rd.basis || ""), false);
    t("a fully read scan no longer wants OCR", rd.tier3_candidate ?? false, false);
  }

  console.log("\n--- 3 · failure modes: a throw, a refusal, a different build, a stray page ---");
  {
    const { r, rd, log } = await stubRun("throw", "/scan6.pdf");
    t("a binding call that THROWS does not fail the acquire", [r.ok, !!r.document], [true, true]);
    t("the pages before it are kept (0,1,2) and the rest stay unread", [filledOf(rd), unreadOf(rd)], [3, 3]);
    t("the loop stopped at the throw", log.length, 4);
    t("the basis names the page whose call failed", /the call for page 3 failed, so 3 page\(s\) from it on were not transcribed/.test(rd.basis || ""), true);
  }
  {
    const { rd, log } = await stubRun("refuse", "/scan6.pdf");
    t("a refused FIRST page no longer ends the document: every page is still asked", log.length, 6);
    t("the refused pages (0 and 2) keep their markers; the other four are read", [filledOf(rd), unreadOf(rd)], [4, 2]);
    t("the basis counts the declined pages", /declined 2 page\(s\)/.test(rd.basis || ""), true);
  }
  {
    const { rd, doc } = await stubRun("version", "/scan6.pdf");
    t("a page answered by a different engine build is not merged", [filledOf(rd), unreadOf(rd)], [5, 1]);
    t("and the basis says why", /1 page\(s\) were answered under a different engine build/.test(rd.basis || ""), true);
    t("the chain names the ONE build the merged pages came from",
      (Array.isArray(doc?.text_source) ? doc.text_source : rd.text_source || []).filter((s) => s.step === "ocr").map((s) => s.version), ["0.11.0"]);
  }
  {
    const { rd } = await stubRun("stray", "/scan6.pdf");
    t("a page answered to the wrong call is dropped, and the asked page stays unread", [filledOf(rd), unreadOf(rd)], [5, 1]);
    t("and the basis counts it", /1 page\(s\) the OCR member returned were not the page that call asked for/.test(rd.basis || ""), true);
  }
  footReached = true;
} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack || e}`); fail++;
}
console.log(`\nd606-perpage-ocr: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
