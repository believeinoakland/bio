/* extraction R90 (fix round 7, G82; plan rule 4), platform check L: does a tick of the reading, `readHeld({sha, kind: "reading"})` (one piece of a
 * large text, as the plane's ledger calls it), hold the Durable Object's one thread, so that every other call waits behind it? A probe, not a
 * test (no `.test.mjs`: it boots workerd under Miniflare and takes minutes):
 *   node r7-contention-l.probe.mjs <dir> <text:mib|csv:mib>...
 * The same object as `round6-l.probe.mjs` (record-core, membership and this module over the object's SQLite and a real R2 binding, the real
 * reader), plus `/ping`, a cheap read that enters the object and answers at once. For each size: 12 pings are timed with no tick running (the
 * baseline), then ticks run one after another while 12 concurrent pings are sent every 250 ms, each timed by THIS process's clock outside the
 * isolate (R-CLOCK: workerd freezes the clock during synchronous work, so inside it reads as nothing). Prints the baseline and the p50, p95
 * and max of the pings sent while a tick was in flight, with the ticks' own wall times. Recorded in build/jobs/T51/extraction.md. */
import { mkdirSync, writeFileSync, readFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Miniflare } from "miniflare";

const [dir, ...sizes] = process.argv.slice(2);
if (!dir || !sizes.length) { console.error("usage: r7-contention-l.probe.mjs <dir> <text:mib|csv:mib>..."); process.exit(2); }
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
    this.rows = new Map(); this.docs = new Map();
    this.core = recordOf(ctx, { evidence: env.CAPTURES, evidencePrefix: "bio/captures/" });
    this.core.migrate();
    const membership = membershipOf(ctx, { record: this.core });
    membership.migrate();
    const provenance = { homeOf: (s) => this.rows.get(s) ?? null, onTestimony: () => ({ ok: true }) };
    this.x = new Extraction(ctx.storage, { record: this.core, membership, env, provenance });
    this.x.migrate();
    this.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [...this.docs.values()] }) } : null);
  }
  async fetch(req) {
    const u = new URL(req.url), q = (k) => u.searchParams.get(k);
    if (u.pathname === "/ping") return Response.json({ ok: true, who: this.x.readingFor("0".repeat(64), "class:admin").found });
    if (u.pathname === "/post") {
      const bytes = new Uint8Array(await req.arrayBuffer());
      const total = bytes.length, d = await sha(bytes);
      await this.core.evidenceStore().put(d, bytes);
      this.ctx.storage.sql.exec("INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('INFO-1','information','g','t','collected','2026-01-01','2026-01-01','x',1)");
      this.rows.set(d, { bundleId: "INFO-1", path: q("name"), encoding: "binary", bytes: total, registered: "t", authored: false });
      this.docs.set(d, { file: q("name"), locator: "https://a.example/" + q("name"), retrieved: "2026-10-22T00:00:00Z",
        profile: { profiled_from_text: true, format: { format: q("format"), confidence: "none", signals: [] }, jurisdiction_view: null },
        provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
        capture: { sha256: d, bytes: total, content_type: q("ct"), transport: { http_headers: [] } } });
      return Response.json({ sha: d, bytes: total });
    }
    if (u.pathname === "/tick") return Response.json({ r: await this.x.readHeld({ sha: q("sha"), kind: "reading", storeName: "bio", env: this.env }) });
    return new Response("?", { status: 404 });
  }
}
export default { async fetch(req, env) { return env.PROBE.get(env.PROBE.idFromName("p")).fetch(req); } };
`);

const textBytes = (mib) => {
  const total = Math.round(mib * 1048576), n = Math.floor(total / 100), enc = new TextEncoder();
  const bytes = new Uint8Array(total); let at = 0;
  for (let i = 0; i < n - 1; i++) at += enc.encodeInto("line " + String(i).padStart(6, "0") + " " + "council-minutes ".repeat(5).padEnd(87, ".") + "\n", bytes.subarray(at)).written;
  enc.encodeInto("ENDMARKER".padEnd(total - at, " "), bytes.subarray(at));
  return bytes;
};
const csvBytes = (mib) => {
  const rows = ["id,name,amount,note"];
  for (let n = 20, i = 0; n < mib * 1048576; i++) { const r = `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"council note ${i} budget line"`; rows.push(r); n += r.length + 1; }
  rows.push(`LASTROWMARK,"last name",1.00,"the final row of the sheet"`);
  return new TextEncoder().encode(rows.join("\n") + "\n");
};
const pct = (xs, p) => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)] : null; };

for (const size of sizes) {
  const [kind, amount] = size.split(":");
  const persist = mkdtempSync(join(tmpdir(), "extraction-r7-l-"));
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { PROBE: { className: "Probe", useSQLite: true } }, r2Buckets: ["CAPTURES"],
    bindings: { VERSION: "probe" }, durableObjectsPersist: join(persist, "do"), r2Persist: join(persist, "r2"),
  });
  try {
    const call = async (path, init) => (await mf.dispatchFetch(`http://probe${path}`, init)).json();
    const timedPing = async () => { const t0 = performance.now(); await call("/ping"); return performance.now() - t0; };
    const bytes = kind === "csv" ? csvBytes(Number(amount)) : textBytes(Number(amount));
    const [ct, format, name] = kind === "csv" ? ["text/csv", "csv", "table.csv"] : ["text/plain", "undetermined", "log.txt"];
    const held = await call(`/post?ct=${encodeURIComponent(ct)}&format=${format}&name=${name}`, { method: "POST", body: bytes });
    await timedPing();
    const base = []; for (let i = 0; i < 12; i++) base.push(await timedPing());
    let inflight = false, tickNo = 0; const during = [], later = [], ticks = [];
    const stopper = { stop: false };
    const pinger = (async () => {
      while (!stopper.stop) {
        if (inflight) await Promise.all(Array.from({ length: 12 }, async () => { const was = inflight, no = tickNo; const ms = await timedPing(); if (was) { during.push(ms); if (no > 0) later.push(ms); } }));
        await new Promise((r) => setTimeout(r, 250));
      }
    })();
    let out;
    try {
      do { inflight = true; const t0 = performance.now(); out = await call(`/tick?sha=${held.sha}`); ticks.push(Math.round(performance.now() - t0)); inflight = false; tickNo++; await new Promise((r) => setTimeout(r, 300)); }
      while (out.r && out.r.more === true && ticks.length < 200);
    } finally { stopper.stop = true; await pinger; }
    const f = (x) => (x === null ? "n/a" : Math.round(x));
    console.log(`ticks ms: ${ticks.join(" ")}`);
    console.log(`${size} (${held.bytes} B): ${ticks.length} ticks, wall per tick max ${Math.max(...ticks)} ms, mean ${Math.round(ticks.reduce((a, b) => a + b, 0) / ticks.length)} ms; `
      + `ping with no tick: p50 ${f(pct(base, 0.5))} ms, p95 ${f(pct(base, 0.95))} ms, max ${f(Math.max(...base))} ms (12); `
      + `ping while a tick is in flight: n ${during.length}, p50 ${f(pct(during, 0.5))} ms, p95 ${f(pct(during, 0.95))} ms, max ${f(Math.max(0, ...during))} ms; `
      + `ping while a LATER tick (not the first) is in flight: n ${later.length}, p50 ${f(pct(later, 0.5))} ms, p95 ${f(pct(later, 0.95))} ms, max ${f(Math.max(0, ...later))} ms`);
  } finally { await mf.dispose(); }
}
