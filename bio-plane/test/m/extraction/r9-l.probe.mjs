/* extraction, fix round 9 (G126a, G126b, G126e, G127d, G132k; R102, R103, R104), platform check L: on workerd under Miniflare, with the real Durable
 * Object storage (SQLite, the text index), the real R2 binding (wrapped inside the isolate to count the reads and the bytes it answers) and this
 * module's real code; the OCR member and the transcriber are stand-ins inside the isolate that count their calls. A probe, not a test (no
 * `.test.mjs`: it boots workerd and takes a minute):   node r9-l.probe.mjs <dir>
 * It prints one line per case:
 *   press     a 3 MiB, 30-page scan (page 0 typed) pressed (`op=pdfstructure&ocr=1`): R2 reads and OCR calls inside the request; the job it owes;
 *   pass      the ledger's OCR pass that job asks for, over two ticks, after Miniflare is stopped and started again over the same storage between the
 *             press and the pass (state loss, I8): R2 bytes read by the pass, OCR calls, pages read, unread pages left;
 *   transcribe `op=pagetranscribe` on another 3 MiB scan: R2 reads (ranged and whole) and bytes, OCR calls, pages the AI filled, `says`;
 *   parts     a 2.5 MiB text held only as two parts in R2 (no whole object), read by `readHeld` through `readRange` across the part seam: read, the
 *             last line found, R2 ranged reads.
 * Recorded in build/jobs/T51/extraction.md. */
import { mkdirSync, writeFileSync, readFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Miniflare } from "miniflare";

const [dir] = process.argv.slice(2);
if (!dir) { console.error("usage: r9-l.probe.mjs <dir>"); process.exit(2); }
mkdirSync(dir, { recursive: true });
const src = (p) => JSON.stringify(fileURLToPath(new URL(`../../../src/${p}`, import.meta.url)));
const outer = (p) => JSON.stringify(fileURLToPath(new URL(`../../../../${p}`, import.meta.url)));
const ENTRY = join(dir, "probe.mjs");
writeFileSync(ENTRY, `
import { DurableObject } from "cloudflare:workers";
import { recordOf } from ${src("record-core/index.mjs")};
import { membershipOf } from ${src("membership/index.mjs")};
import { Extraction } from ${src("extraction/index.mjs")};
import { registerDoctype } from ${outer("docprofile/registry.mjs")};
import { registerDoctypes } from ${outer("doctypes/index.mjs")};
registerDoctypes(registerDoctype);
const sha = async (b) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", b))].map((x) => x.toString(16).padStart(2, "0")).join("");
const MiB = 1048576;
export class Probe extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    const kept = ctx.storage.kv.get("held");
    this.rows = new Map(kept ? kept.rows : []); this.parts = new Map(kept ? kept.parts : []); this.docs = new Map(kept ? kept.docs : []);
    this.jobs = new Map(kept ? kept.jobs : []);
    this.r2 = { gets: 0, ranged: 0, bytes: 0 };
    const bucket = env.CAPTURES, count = this.r2;
    const counted = { head: (k) => bucket.head(k), put: (k, b, o) => bucket.put(k, b, o),
      get: async (k, o) => { const r = await bucket.get(k, o); count.gets++; if (o && o.range) count.ranged++; if (r) count.bytes += (o && o.range ? Math.min(o.range.length, r.size - (o.range.offset || 0)) : r.size); return r; } };
    this.core = recordOf(ctx, { evidence: counted, evidencePrefix: "bio/captures/" });
    this.core.migrate();
    const membership = membershipOf(ctx, { record: this.core });
    membership.migrate();
    const provenance = { homeOf: (s) => this.rows.get(s) ?? null, partsOf: (s) => this.parts.get(s) ?? null, onTestimony: () => ({ ok: true }) };
    this.x = new Extraction(ctx.storage, { record: this.core, membership, env, provenance });
    this.x.migrate();
    this.x.registerOwe((e) => { this.jobs.set(e.sha + ":" + e.kind, e); this.keep(); return { ok: true, existed: false, state: "queued" }; });
    this.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [...this.docs.values()] }) } : null);
    this.ocrCalls = 0;
    this.ocr = { fetch: async (url, init) => { this.ocrCalls++; const b = JSON.parse(init.body); const [first, ...rest] = b.pages;
      return Response.json({ ok: true, engine: "tess", version: "5.3", cap: "C", measured_by: "M-1", confidence_floor: null, deferred: rest,
        pages: [{ page: first, regions: [{ text: "ocr words of page " + first, source: { kind: "pdf-page", ref: "p" + first, page: first, rect: [0, 0, 10, 10] }, confidence: "none" }] }] }); } };
  }
  keep() { this.ctx.storage.kv.put("held", { rows: [...this.rows], parts: [...this.parts], docs: [...this.docs], jobs: [...this.jobs] }); }
  bundle() { this.ctx.storage.sql.exec("INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('INFO-1','information','g','t','collected','2026-01-01','2026-01-01','x',1)"); }
  async scan(pages) {
    const bytes = new Uint8Array(3 * MiB); bytes.set(new TextEncoder().encode("%PDF-1.7 a scan "), 0); bytes[bytes.length - 1] = Math.floor(Math.random() * 255);
    const d = await sha(bytes);
    await this.core.evidenceStore().put(d, bytes);
    this.bundle();
    this.rows.set(d, { bundleId: "INFO-1", path: "scan.pdf", encoding: "binary", bytes: bytes.length, registered: "t", authored: false });
    this.x.writeReading({ bundleId: "INFO-1", captureSha: d, profileFormat: "pdf",
      textUnits: [{ extent: { kind: "pdf-page", page: 0 }, text: "typed words of page 0", seq: 0 }],
      reading: { content_type: "generic", reader_version: 1, found: false, entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b", text_source: null, page_count: pages, tier3_candidate: true } });
    this.keep();
    return d;
  }
  unread(d) { return (this.x.readingFor(d, "class:admin").unread_pages || []).length; }
  reset() { this.r2.gets = 0; this.r2.ranged = 0; this.r2.bytes = 0; this.ocrCalls = 0; }
  async fetch(req) {
    const u = new URL(req.url), q = (k) => u.searchParams.get(k);
    if (u.pathname === "/press") {
      const d = await this.scan(30);
      this.reset();
      const r = await this.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", author: "member:m1", env: { ...this.env, OCR_WORKER: this.ocr } });
      return Response.json({ sha: d, status: r.status, re: r.body.reextraction, r2: { ...this.r2 }, ocr: this.ocrCalls, job: this.jobs.get(d + ":ocr") ?? null });
    }
    if (u.pathname === "/pass") {
      const d = q("sha"), job = this.jobs.get(d + ":ocr");
      this.reset();
      const ticks = [];
      for (let i = 0; i < 3; i++) {
        const a = await this.x.readHeld({ sha: d, kind: "ocr", env: { ...this.env, OCR_WORKER: this.ocr }, detail: job ? job.detail : null });
        ticks.push({ read: a.read, owed: a.owed ?? false, pages: a.reextraction ? a.reextraction.pages.length : 0, why: a.why ?? null });
        if (!a.owed) break;
      }
      const units = this.ctx.storage.sql.exec("SELECT extent, substr(text,1,40) t FROM capture_text WHERE capture_sha=? ORDER BY seq LIMIT 3", d).toArray();
      const n = this.ctx.storage.sql.exec("SELECT count(*) c FROM capture_text WHERE capture_sha=?", d).toArray()[0].c;
      return Response.json({ ticks, r2: { ...this.r2 }, ocr: this.ocrCalls, unread: this.unread(d), by: (this.x.readingOf(d).reading.reextracted || {}).by ?? null, units, n });
    }
    if (u.pathname === "/transcribe") {
      const d = await this.scan(5);
      let asked = null;
      try { this.x.registerTranscriber("plane", { deployable: () => true, keptAway: () => null,
        transcription: ({ member, project, at }) => ({ member, project, at, act: "t", accounts: { accountFor: async () => ({ ok: true, kind: "apikey", level: "member", key: "k" }) },
          useCheck: async () => null, transcribe: async (x) => { asked = x.pages; return { ok: true, engine: "claude-test", version: "1", pages: [{ page: 2, text: "AI words of page 2" }] }; } }) }); } catch {}
      this.reset();
      const r = await this.x.pageTranscribe({ captureSha: d, cls: "member", session: true, caps: ["contribute"], viewer: "class:admin", by: "member:m1", env: { ...this.env, OCR_WORKER: this.ocr } });
      return Response.json({ written: r.body.transcription && r.body.transcription.written, pages: r.body.transcription && r.body.transcription.pages, asked, says: r.body.says ?? null, r2: { ...this.r2 }, ocr: this.ocrCalls });
    }
    if (u.pathname === "/parts") {
      const lines = []; for (let i = 0; i < 26000; i++) lines.push("line " + String(i).padStart(6, "0") + " " + "council-minutes ".repeat(5).padEnd(87, "."));
      lines.push("PARTSENDMARKER");
      const whole = new TextEncoder().encode(lines.join("\\n"));
      const d = await sha(whole);
      const cut = Math.floor(whole.length / 2) + 7;
      const ps = [];
      for (const b of [whole.subarray(0, cut), whole.subarray(cut)]) { const s = await sha(b); await this.core.evidenceStore().put(s, b); ps.push({ sha256: s, bytes: b.length }); }
      this.bundle();
      this.rows.set(d, { bundleId: "INFO-1", path: "log.txt", encoding: "binary", bytes: whole.length, registered: "t", authored: false });
      this.parts.set(d, ps);
      this.docs.set(d, { file: "log.txt", locator: "https://a.example/log.txt", retrieved: "2026-10-22T00:00:00Z",
        profile: { profiled_from_text: true, source_content_type: "text/plain", format: { format: "undetermined", confidence: "none", signals: [] }, jurisdiction_view: null },
        provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
        capture: { sha256: d, bytes: whole.length, content_type: "text/plain", transport: { http_headers: [] } }, parts: ps.map((p, i) => ({ file: "p" + i, ...p })) });
      this.keep();
      this.reset();
      const held = await this.core.evidenceStore().head(d);
      let a, n = 0;
      do { a = await this.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: this.env }); } while (a.more === true && ++n < 50);
      const end = this.ctx.storage.sql.exec("SELECT count(*) c FROM capture_text_fts WHERE capture_text_fts MATCH ?", "PARTSENDMARKER").toArray()[0].c;
      return Response.json({ bytes: whole.length, wholeHeld: !!held, last: a, ticks: n + 1, end, r2: { ...this.r2 }, state: this.x.unitsOf(d).state });
    }
    return new Response("?", { status: 404 });
  }
}
export default { async fetch(req, env) { return env.PROBE.get(env.PROBE.idFromName("p")).fetch(req); } };
`);

const newMiniflare = (persist) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { PROBE: { className: "Probe", useSQLite: true } }, r2Buckets: ["CAPTURES"],
  bindings: { VERSION: "probe" }, durableObjectsPersist: join(persist, "do"), r2Persist: join(persist, "r2"),
});
const persist = mkdtempSync(join(tmpdir(), "extraction-r9-l-"));
let mf = newMiniflare(persist);
const call = async (path) => (await mf.dispatchFetch(`http://probe${path}`)).json();
try {
  const press = await call("/press");
  console.log(`press: status ${press.status}, performed ${press.re.performed}, owed ${press.re.owed}, ${press.re.candidate.length} pages owed; inside the request R2 gets ${press.r2.gets} (${press.r2.bytes} B), OCR calls ${press.ocr}; job ${JSON.stringify(press.job)}`);
  await mf.dispose(); mf = newMiniflare(persist);
  const pass = await call(`/pass?sha=${press.sha}`);
  console.log(`pass (after a restart): ticks ${JSON.stringify(pass.ticks)}; R2 gets ${pass.r2.gets} (${pass.r2.bytes} B); OCR calls ${pass.ocr}; unread pages left ${pass.unread}; written by ${pass.by}; units ${pass.n} ${JSON.stringify(pass.units)}`);
  const tr = await call("/transcribe");
  console.log(`transcribe: written ${tr.written}, AI asked ${JSON.stringify(tr.asked)}, filled ${JSON.stringify(tr.pages)}, says ${JSON.stringify(tr.says)}; R2 gets ${tr.r2.gets} (ranged ${tr.r2.ranged}, ${tr.r2.bytes} B); OCR calls ${tr.ocr}`);
  const parts = await call("/parts");
  console.log(`parts: ${parts.bytes} B held as two parts (whole object held: ${parts.wholeHeld}); read ${parts.last.read} in ${parts.ticks} tick(s), last line found ${parts.end}, index ${parts.state}; R2 gets ${parts.r2.gets} (ranged ${parts.r2.ranged}, ${parts.r2.bytes} B)`);
} finally { await mf.dispose(); }
