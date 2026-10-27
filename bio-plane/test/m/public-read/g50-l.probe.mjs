/* public-read G50 (fix round 6; plan G50 (5) platform check L), what assembling and serving a case file of k held captures of one
 * `ref` costs the Worker, on workerd (Miniflare) with the real Worker code and a real R2 binding and SQLite-backed Durable Object.
 * A probe, not a test (no `.test.mjs`: it boots workerd and takes a minute):
 *
 *   node --import ./bio-plane/test/platform-sqlite.mjs bio-plane/test/m/public-read/g50-l.probe.mjs <dir> [k]     (k defaults to 501)
 *
 * The case (one `ref` on k included rows, each capture held whole with its extracted text: 2k material files) is made in node by
 * the real fixture and the real `PublicRead.caseFileFacts`; the Worker then runs the real `assembleCaseContainer` (it asks the object
 * for the facts, reads each file from the bucket, checks each with `head` and `put`s it, records the manifest) and the real
 * `publishedRoutes` `publishedbytes&format=zip&part=1` for every part. The object is a stand-in that answers `casefilefacts` and
 * `verify` and `withheld`, and records the manifest as `recordCaseManifest` does (a `published_shas` row for each file and the
 * manifest's own text in one row); the real module graph of `publication` is not run in the object, so the object's own CPU is
 * not what is measured here. Counted inside the Worker: bucket calls (get, head, put), object calls (by op), SHA-256 digests;
 * measured outside: wall per request and the CPU workerd used (`/proc`, 10 ms ticks), the stored manifest's bytes against the value
 * bound 2,098,176 B (record-core/schema.mjs). Prints one line per step. Recorded in build/jobs/T51/public-read.md. */
import { mkdirSync, writeFileSync, readFileSync, readdirSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Miniflare } from "miniflare";
import { world, bucket } from "./fixture.mjs";

const [dir, kArg] = process.argv.slice(2);
const K = Number(kArg || 501);
if (!dir) { console.error("usage: g50-l.probe.mjs <dir> [k]"); process.exit(2); }
mkdirSync(dir, { recursive: true });
const src = (p) => JSON.stringify(fileURLToPath(new URL(`../../../src/${p}`, import.meta.url)));
const ENTRY = join(dir, "probe.mjs");
writeFileSync(ENTRY, `
import { DurableObject } from "cloudflare:workers";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from ${src("publication/worker.mjs")};

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

let counts = {};
const bump = (k) => { counts[k] = (counts[k] || 0) + 1; };
const realDigest = crypto.subtle.digest.bind(crypto.subtle);
try { crypto.subtle.digest = (...a) => { bump("sha256"); return realDigest(...a); }; } catch { counts.sha256_uncounted = true; }

export class Store extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS published_shas (sha256 TEXT, bundle_id TEXT, path TEXT, kind TEXT, bytes INTEGER, published TEXT, PRIMARY KEY (sha256, bundle_id, path))");
    this.sql.exec("CREATE TABLE IF NOT EXISTS kept (k TEXT PRIMARY KEY, v TEXT)");
  }
  async fetch(req) {
    const u = new URL(req.url), op = u.pathname.slice(1);
    if (op === "seed") { this.sql.exec("INSERT OR REPLACE INTO kept (k, v) VALUES ('facts', ?)", await req.text()); return Response.json({ ok: true, result: { ok: true } }); }
    if (op === "casefilefacts") {
      const row = [...this.sql.exec("SELECT v FROM kept WHERE k='facts'")][0];
      return Response.json({ ok: true, result: JSON.parse(row.v) });
    }
    if (op === "recordcasemanifest") {
      const b = JSON.parse(await req.text()), t0 = Date.now();
      const text = JSON.stringify(b.manifest);
      let stored = true, detail = null;
      try { this.sql.exec("INSERT OR REPLACE INTO kept (k, v) VALUES ('manifest', ?)", text); } catch (e) { stored = false; detail = String(e && e.message || e); }
      this.sql.exec("DELETE FROM published_shas");
      for (const f of b.manifest.files) this.sql.exec("INSERT OR IGNORE INTO published_shas VALUES (?,?,?,?,?,?)", f.sha256, b.caseId, f.path, f.kind, f.bytes, "t");
      this.sql.exec("INSERT OR IGNORE INTO published_shas VALUES (?,?,?,?,?,?)", b.manifestSha, b.caseId, "manifest.json", "manifest", b.bytes, "t");
      return Response.json({ ok: true, result: { ok: true, manifest_text_bytes: new TextEncoder().encode(text).length, stored, detail, rows: b.manifest.files.length + 1 } });
    }
    if (op === "verify") {
      const sha = u.searchParams.get("sha256");
      const matches = [...this.sql.exec("SELECT bundle_id, path, kind, published FROM published_shas WHERE sha256=? ORDER BY published", sha)];
      return Response.json({ ok: true, result: { published: matches.length > 0, sha256: sha, matches } });
    }
    if (op === "withheld") return Response.json({ ok: true, result: { ok: true, withheld: {} } });
    if (op === "manifestinfo") {
      const row = [...this.sql.exec("SELECT v FROM kept WHERE k='manifest'")][0];
      return Response.json({ ok: true, result: { stored: !!row, bytes: row ? new TextEncoder().encode(row.v).length : null, rows: [...this.sql.exec("SELECT COUNT(*) AS n FROM published_shas")][0].n } });
    }
    return Response.json({ ok: false, error: "unknown op " + op }, { status: 400 });
  }
}

const counted = (env) => ({ ...env, PUBLISHED: {
  get: (k) => { bump("r2.get"); return env.PUBLISHED.get(k); },
  head: (k) => { bump("r2.head"); return env.PUBLISHED.head(k); },
  put: (k, v) => { bump("r2.put"); return env.PUBLISHED.put(k, v); } } });
const stubOf = (env) => {
  const s = env.STORE.get(env.STORE.idFromName("s"));
  return { fetch: (r, i) => { bump("do.fetch"); bump("do." + new URL(typeof r === "string" ? r : r.url).pathname.slice(1)); return s.fetch(r, i); } };
};

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    const s = env.STORE.get(env.STORE.idFromName("s"));
    if (u.pathname === "/seed") {
      const b = await req.json();
      for (const [k, v] of Object.entries(b.objects)) await env.PUBLISHED.put(k, Uint8Array.from(atob(v), (c) => c.charCodeAt(0)));
      await s.fetch("http://do/seed", { method: "POST", body: JSON.stringify(b.facts) });
      return Response.json({ ok: true, objects: Object.keys(b.objects).length });
    }
    if (u.pathname === "/manifestinfo") return Response.json((await (await s.fetch("http://do/manifestinfo")).json()).result);
    counts = {};
    if (u.pathname === "/assemble") {
      const out = await assembleCaseContainer({ env: counted(env), stub: stubOf(env), storeName: "bio", cs: await req.json(), via: "probe" });
      const { inband, part_addresses, ...rest } = out;
      return Response.json({ out: rest, counts });
    }
    if (u.pathname === "/serve") {
      const url = new URL("https://plane/?op=publishedbytes&sha256=" + u.searchParams.get("sha256") + "&format=zip&part=" + u.searchParams.get("part"));
      const r = await publishedRoutes({ op: "publishedbytes", url, env: counted(env), stub: stubOf(env) });
      const bytes = r.status === 200 ? new Uint8Array(await r.arrayBuffer()).length : null;
      return Response.json({ status: r.status, bytes, counts, body: r.status === 200 ? null : (await r.text()).slice(0, 300) });
    }
    return new Response("?", { status: 404 });
  },
};
`);

const cpuOfWorkerd = () => {
  let ticks = 0;
  for (const p of readdirSync("/proc").filter((x) => /^\d+$/.test(x))) {
    try {
      const comm = readFileSync(`/proc/${p}/comm`, "utf8").trim();
      if (comm !== "workerd") continue;
      const f = readFileSync(`/proc/${p}/stat`, "utf8").replace(/^.*\) /, "").split(" ");
      ticks += Number(f[11]) + Number(f[12]);
    } catch { /* gone */ }
  }
  return ticks * 10;
};

/* ---- the case, made in node by the real fixture, like the k = 501 test of g50-copies.test.mjs */
const enc = (s) => new TextEncoder().encode(s);
const hex = (b) => createHash("sha256").update(b).digest("hex");
const CASE = "CASE-2026-0001", F = "INQ-2026-0001", DOC = "INFO-2026-0001-minutes";
const w = world(), env = { PUBLISHED: bucket() };
w.doc(DOC);
const objects = {};
const keep = (bytes) => { env.PUBLISHED.m.set(`bio/published/${hex(bytes)}`, bytes); return hex(bytes); };
const rows = [];
for (let i = 0; i < K; i++) {
  const bytes = i === 0 ? enc(`the text of ${DOC}`) : enc(`capture ${i} of the minutes, kept after the page changed`);
  const text = enc(`extracted text of capture ${i}`);
  keep(bytes); keep(text);
  rows.push({ ref: DOC, kind: "document", sha: hex(bytes), text_sha: hex(text), origin: null, archived_copy: null, included: true, rests_under: "load_bearing" });
}
w.member("olive");
const proj = w.project("Parks", "olive");
w.inquiry(F, { legs: [{ target: DOC }] });
const pin = w.head(F);
w.prepare(CASE, 1, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }], materials: rows });
if (w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] }).ok !== true) throw new Error("the case was not signed");
if (w.signFinding(F).ok !== true) throw new Error("the finding was not signed");
keep(enc(w.text(F)));
const facts = await w.read("casefilefacts", { caseId: CASE, edition: 1 });
const cs0 = w.p.caseEditionState(CASE, 1, "parks-group");
const cs = { caseId: CASE, edition: 1, group: "parks-group", ratified_at: cs0.ratified_at ?? null, bar: cs0.bar ?? null,
             document: { attestor: { member: cs0.document && cs0.document.attestor ? cs0.document.attestor.member : null } } };
for (const [key, v] of env.PUBLISHED.m) objects[key] = Buffer.from(v).toString("base64");
const factsBytes = Buffer.byteLength(JSON.stringify(facts));

const persist = mkdtempSync(join(tmpdir(), "public-read-g50-l-"));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["PUBLISHED"],
  durableObjectsPersist: join(persist, "do"), r2Persist: join(persist, "r2"),
});
const call = async (path, init) => { const t0 = Date.now(), c0 = cpuOfWorkerd(); const r = await (await mf.dispatchFetch(`http://probe${path}`, init)).json(); return { ...r, wall_ms: Date.now() - t0, cpu_ms: cpuOfWorkerd() - c0 }; };
try {
  const seeded = await call("/seed", { method: "POST", body: JSON.stringify({ objects, facts }) });
  console.log(`k = ${K}: ${rows.length} rows of one ref; seeded ${seeded.objects} objects in the bucket; facts ${factsBytes} B`);
  const a = await call("/assemble", { method: "POST", body: JSON.stringify(cs) });
  console.log(`assemble: ${a.out.manifest_sha ? "ok" : "FAILED " + JSON.stringify(a.out).slice(0, 300)}; format ${a.out.format}; ${a.out.files} files in ${a.out.parts} part(s); unheld ${(a.out.unheld || []).length};`
    + ` bucket get ${a.counts["r2.get"] || 0}, head ${a.counts["r2.head"] || 0}, put ${a.counts["r2.put"] || 0}; object calls ${a.counts["do.fetch"] || 0} (${Object.entries(a.counts).filter(([k]) => k.startsWith("do.") && k !== "do.fetch").map(([k, v]) => `${k.slice(3)} ${v}`).join(", ")});`
    + ` SHA-256 digests ${a.counts.sha256 ?? "uncounted"}; wall ${a.wall_ms} ms; workerd CPU ${a.cpu_ms} ms`);
  const sub = (c) => (c["r2.get"] || 0) + (c["r2.head"] || 0) + (c["r2.put"] || 0) + (c["do.fetch"] || 0);
  console.log(`  subrequests (bucket calls + object calls) in the assembly's invocation: ${sub(a.counts)}`);
  if (a.out.manifest_sha) {
    const info = await call("/manifestinfo");
    console.log(`  the manifest stored in the object: ${info.bytes} B (the value bound is 2,098,176 B), ${info.rows} published_shas rows`);
    for (let p = 1; p <= a.out.parts; p++) {
      const s = await call(`/serve?sha256=${a.out.manifest_sha}&part=${p}`);
      console.log(`serve part ${p}: status ${s.status}, ${s.bytes} B; bucket get ${s.counts["r2.get"] || 0}; object calls ${s.counts["do.fetch"] || 0}; SHA-256 digests ${s.counts.sha256 ?? "uncounted"};`
        + ` subrequests ${sub(s.counts)}; wall ${s.wall_ms} ms; workerd CPU ${s.cpu_ms} ms${s.body ? "; " + s.body : ""}`);
    }
  }
} finally { await mf.dispose(); }
