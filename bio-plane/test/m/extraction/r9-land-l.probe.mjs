/* extraction, fix round 9, the second half (G128, G128d, G128e, G128f; R22, R97, R99, R100), platform check L, on the pattern of `r9-l.probe.mjs`: on workerd under Miniflare, with the real Durable
 * Object storage (SQLite, the text index), the real R2 binding (wrapped inside the isolate to count the reads and the bytes it answers) and this
 * module's real code; the OCR member and the transcriber are stand-ins inside the isolate that count their calls. A probe, not a test (no
 * `.test.mjs`: it boots workerd and takes a minute):   node r9-l.probe.mjs <dir>
 * It prints one line per case:
 *   land      a 3.5 MiB text (120-byte lines and a 300,009-character line before the last) held whole, read by the ledger's ticks: ticks, batches landed,
 *             the largest unit and the largest stored value, the last word of the long line and the last line found, completeness;
 *   guard     a reading whose cells pass 1 MiB written through the writer on the real SQLite: not thrown, the cells omitted and stated, its units kept.
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
    const u = new URL(req.url);
    if (u.pathname === "/land") {
      const lines = []; for (let i = 0; i < 28000; i++) lines.push("line " + String(i).padStart(6, "0") + " " + "council-minutes ".repeat(6).padEnd(107, "."));
      lines.push("council ".repeat(37500) + "LONGLINEMARK");
      lines.push("LANDENDMARKER");
      const whole = new TextEncoder().encode(lines.join("\\n"));
      const d = await sha(whole);
      await this.core.evidenceStore().put(d, whole);
      this.bundle();
      this.rows.set(d, { bundleId: "INFO-1", path: "log.txt", encoding: "binary", bytes: whole.length, registered: "t", authored: false });
      this.docs.set(d, { file: "log.txt", locator: "https://a.example/log.txt", retrieved: "2026-10-24T00:00:00Z",
        profile: { profiled_from_text: true, source_content_type: "text/plain", format: { format: "undetermined", confidence: "none", signals: [] }, jurisdiction_view: null },
        provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
        capture: { sha256: d, bytes: whole.length, content_type: "text/plain", transport: { http_headers: [] } } });
      this.keep();
      let a, n = 0;
      do { a = await this.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: this.env }); } while (a.more === true && ++n < 80);
      const one = (q, ...v) => this.ctx.storage.sql.exec(q, ...v).toArray()[0];
      const fts = (t) => one("SELECT count(*) c FROM capture_text_fts WHERE capture_text_fts MATCH ?", t).c;
      return Response.json({ bytes: whole.length, ticks: n + 1, last: a, batches: one("SELECT count(*) c FROM job_batches WHERE sha=?", d).c,
        units: one("SELECT count(*) c FROM capture_text WHERE capture_sha=?", d).c, maxUnit: one("SELECT max(length(CAST(text AS BLOB))) m FROM capture_text WHERE capture_sha=?", d).m,
        maxReading: one("SELECT max(length(CAST(reading AS BLOB))) m FROM readings").m, long: fts("LONGLINEMARK"), end: fts("LANDENDMARKER"),
        completeness: this.x.readingFor(d, "class:admin").completeness.state });
    }
    if (u.pathname === "/guard") {
      const d = "a".repeat(64);
      this.bundle();
      const cells = { "table 1": Array.from({ length: 30000 }, (_, i) => ({ source: { kind: "doc-table", table: 0, cell: "A" + (i + 1) }, value: "cell value number " + i + " with words", type: "text" })) };
      let thrown = null, w = null;
      try { w = this.core.transact(() => this.x.writeReading({ bundleId: "INFO-1", captureSha: d, composed: true, textUnits: [{ extent: { kind: "doc-para", para: 0, run: null }, text: "GUARDUNIT words", seq: 0 }],
        reading: { found: true, entities: [], content_type: "generic", text_container: "docx", basis: "b", at: "t", text_source: null, cells } })); } catch (e) { thrown = String(e && e.message || e); }
      const one = (q, ...v) => this.ctx.storage.sql.exec(q, ...v).toArray()[0];
      const stored = JSON.parse(one("SELECT reading FROM readings WHERE capture_sha=?", d).reading);
      return Response.json({ thrown, cellsBytes: JSON.stringify(cells).length, omitted: w && w.omitted ? w.omitted.map((o) => [o.key, o.bytes]) : null, stated: !!(w && w.stated),
        rowBytes: one("SELECT length(CAST(reading AS BLOB)) n FROM readings WHERE capture_sha=?", d).n, unitKept: one("SELECT count(*) c FROM capture_text_fts WHERE capture_text_fts MATCH 'GUARDUNIT'").c,
        storedCellsNull: stored.cells && stored.cells["table 1"] === null });
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
const persist = mkdtempSync(join(tmpdir(), "extraction-r9-land-l-"));
let mf = newMiniflare(persist);
const call = async (path) => (await mf.dispatchFetch(`http://probe${path}`)).json();
try {
  const land = await call("/land");
  console.log(`land: ${land.bytes} B text read in ${land.ticks} tick(s) (last ${JSON.stringify(land.last)}); ${land.units} units in ${land.batches} batches; largest unit ${land.maxUnit} B, largest stored reading ${land.maxReading} B; long line's last word found ${land.long}, last line found ${land.end}; completeness ${land.completeness}`);
  const guard = await call("/guard");
  console.log(`guard: thrown ${guard.thrown}; cells ${guard.cellsBytes} B; omitted ${JSON.stringify(guard.omitted)}; stated ${guard.stated}; stored row ${guard.rowBytes} B; cells stored null ${guard.storedCellsNull}; unit kept ${guard.unitKept}`);
} finally { await mf.dispose(); }
