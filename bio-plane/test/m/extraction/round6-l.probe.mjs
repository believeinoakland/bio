/* extraction R90 (fix round 6, G13; plan rule 4), platform check L: what one tick of the ledger costs the object when a large text is read in
 * pieces, on workerd, with the real Durable Object storage (SQLite, the text index and its triggers), the real R2 binding and the real
 * reader. A probe, not a test (no `.test.mjs`: it boots workerd under Miniflare and takes minutes):
 *   node round6-l.probe.mjs <dir> <mebibytes>...        (24 is the ceiling a text is read below; sizes may be fractional)
 * It writes <dir>/probe.mjs (a Durable Object that composes record-core, membership, calibration and this module over its storage, with a
 * register stand-in and a held text), serves it from Miniflare, holds a text of lines of exactly 100 bytes with a last line "ENDMARKER",
 * then makes the ledger's call, `readHeld({sha, kind: "reading"})`, until the answer has no `more`, timing each tick on the wall clock
 * outside the isolate (workerd freezes the clock during synchronous work, so inside it reads as nothing) and sampling the resident set
 * of workerd every 25 ms. The object's limit is 128 MB: the increase of the resident set over the idle object is printed with the
 * heap the isolate reports. Prints one line per size. Recorded in build/jobs/T51/extraction.md. */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtempSync } from "node:fs";
import { Miniflare } from "miniflare";

const [dir, ...sizes] = process.argv.slice(2);
if (!dir || !sizes.length) { console.error("usage: round6-l.probe.mjs <dir> <mebibytes>..."); process.exit(2); }
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
export class Probe extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.rows = new Map();
    this.core = recordOf(ctx, { evidence: env.CAPTURES, evidencePrefix: "bio/captures/" });
    this.core.migrate();
    const membership = membershipOf(ctx, { record: this.core });
    membership.migrate();
    const provenance = { homeOf: (s) => this.rows.get(s) ?? null, onTestimony: () => ({ ok: true }) };
    this.x = new Extraction(ctx.storage, { record: this.core, membership, env, provenance });
    this.x.migrate();
  }
  async fetch(req) {
    const u = new URL(req.url), q = (k) => u.searchParams.get(k);
    if (u.pathname === "/idle") return Response.json({ ok: true, mem: this.mem() });
    if (u.pathname === "/hold") {
      const total = Math.round(Number(q("mib")) * 1048576), n = Math.floor(total / 100);
      let bytes = new Uint8Array(total), at = 0;
      const enc = new TextEncoder();
      for (let i = 0; i < n - 1; i++) { const line = "line " + String(i).padStart(6, "0") + " " + "council-minutes ".repeat(5).padEnd(87, ".") + "\\n"; at += enc.encodeInto(line, bytes.subarray(at)).written; }
      at += enc.encodeInto("ENDMARKER".padEnd(total - at, " "), bytes.subarray(at)).written;
      const d = await sha(bytes);
      await this.core.evidenceStore().put(d, bytes);
      bytes = null;
      this.ctx.storage.sql.exec("INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('INFO-1','information','g','t','collected','2026-01-01','2026-01-01','x',1)");
      this.rows.set(d, { bundleId: "INFO-1", path: "log.txt", encoding: "binary", bytes: total, registered: "t", authored: false });
      const document = { file: "log.txt", locator: "https://a.example/log.txt", retrieved: "2026-10-22T00:00:00Z",
        profile: { profiled_from_text: true, format: { format: "undetermined", confidence: "none", signals: [] }, jurisdiction_view: null },
        provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
        capture: { sha256: d, bytes: total, content_type: "text/plain", transport: { http_headers: [] } } };
      this.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
      return Response.json({ sha: d, bytes: total, mem: this.mem() });
    }
    if (u.pathname === "/tick") {
      const r = await this.x.readHeld({ sha: q("sha"), kind: "reading", storeName: "bio", env: this.env });
      return Response.json({ r, mem: this.mem() });
    }
    if (u.pathname === "/state") {
      const got = this.x.readingFor(q("sha"), "class:admin");
      const st = this.x.unitsOf(q("sha"));
      const end = this.ctx.storage.sql.exec("SELECT count(*) c FROM capture_text_fts WHERE capture_text_fts MATCH 'ENDMARKER'").toArray()[0].c;
      return Response.json({ more: got.more, read_through: got.read_through, total: got.total, state: st.state, counts: st.counts, end });
    }
    return new Response("?", { status: 404 });
  }
  mem() { try { const m = globalThis.process.memoryUsage(); return { rss: m.rss, heapUsed: m.heapUsed, external: m.external, arrayBuffers: m.arrayBuffers }; } catch { return null; } }
}
export default { async fetch(req, env) { return env.PROBE.get(env.PROBE.idFromName("p")).fetch(req); } };
`);

const rssOfWorkerd = () => {
  try { return Math.max(0, ...execFileSync("ps", ["-C", "workerd", "-o", "rss="], { encoding: "utf8" }).split("\n").map((x) => Number(x.trim()) || 0)) * 1024; }
  catch { return 0; }
};

for (const mib of sizes) {
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { PROBE: { className: "Probe", useSQLite: true } }, r2Buckets: ["CAPTURES"],
    bindings: { VERSION: "probe" }, durableObjectsPersist: mkdtempSync(join(tmpdir(), "extraction-r6-l-")),
  });
  try {
    const call = async (path) => (await mf.dispatchFetch(`http://probe${path}`)).json();
    const idle = await call("/idle");
    const idleRss = rssOfWorkerd();
    const held = await call(`/hold?mib=${mib}`);
    await new Promise((r) => setTimeout(r, 500));
    await new Promise((r) => setTimeout(r, 1500));
    const heldRss = rssOfWorkerd();   /* the file held, the harness's own spike let go */
    let peak = heldRss, heapPeak = 0;
    const sampler = setInterval(() => { peak = Math.max(peak, rssOfWorkerd()); }, 25);
    const ticks = [];
    let out;
    try {
      do {
        const t0 = Date.now();
        out = await call(`/tick?sha=${held.sha}`);
        ticks.push(Date.now() - t0);
        heapPeak = Math.max(heapPeak, out.mem ? out.mem.heapUsed + (out.mem.external || 0) : 0);
      } while (out.r && out.r.more === true && ticks.length < 400);
    } finally { clearInterval(sampler); }
    const state = await call(`/state?sha=${held.sha}`);
    const mb = (n) => (n / 1048576).toFixed(0);
    const ok = out.r && out.r.read === true && !out.r.more && state.more === false && state.state === "whole" && state.end === 1;
    console.log(`${mib} MiB (${held.bytes} B): ${ok ? "read to ENDMARKER" : "NOT READ THROUGH " + JSON.stringify({ out: out.r, state })} in ${ticks.length} ticks; `
      + `wall per tick max ${Math.max(...ticks)} ms, mean ${Math.round(ticks.reduce((a, b) => a + b, 0) / ticks.length)} ms; `
      + `workerd resident set idle ${mb(idleRss)} MB, with the file held ${mb(heldRss)} MB, peak over the ticks ${mb(peak)} MB (+${mb(peak - heldRss)} MB over the held file); heap + external the isolate reports, peak ${mb(heapPeak)} MB (object limit 128)`);
  } finally { await mf.dispose(); }
}
