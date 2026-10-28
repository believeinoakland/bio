/* proto-mem: shared harness. One Miniflare, one workerd process, memory read from OUTSIDE (/proc/<pid>/status), nothing leaves the machine. */
const { Miniflare } = await import(process.env.MF_PATH || "/home/user/wt-alloc/bio-plane/node_modules/miniflare/dist/src/index.js");   /* MF_PATH: a copy patched to pass MF_V8_FLAGS to workerd (see README) */
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

export const TOKEN = process.env.PROTO_MEM_TOKEN || randomBytes(24).toString("hex");   /* local-only throwaway bootstrap token, random per run (or fixed by PROTO_MEM_TOKEN so a later process can use the sessions of a persisted room); never printed */
const MB = 1048576;

export function workerdPids() {
  const out = [];
  for (const d of readdirSync("/proc")) {
    if (!/^\d+$/.test(d)) continue;
    try {
      const st = readFileSync(`/proc/${d}/stat`, "utf8");
      const ppid = Number(st.slice(st.lastIndexOf(")") + 2).split(" ")[1]);
      const exe = readFileSync(`/proc/${d}/cmdline`, "utf8").split("\0")[0];
      if (ppid === process.pid && /workerd/.test(exe)) out.push(Number(d));
    } catch { /* gone */ }
  }
  return out;
}

export function status(pid) {
  const t = readFileSync(`/proc/${pid}/status`, "utf8");
  const g = (k) => { const m = t.match(new RegExp(`^${k}:\\s+(\\d+) kB`, "m")); return m ? Number(m[1]) / 1024 : null; };
  return { rss: g("VmRSS"), hwm: g("VmHWM"), anon: g("RssAnon"), file: g("RssFile"), shmem: g("RssShmem"), vsz: g("VmSize"), threads: Number((t.match(/^Threads:\s+(\d+)/m) || [])[1]) };
}
export function rollup(pid) {
  const t = readFileSync(`/proc/${pid}/smaps_rollup`, "utf8");
  const g = (k) => { const m = t.match(new RegExp(`^${k}:\\s+(\\d+) kB`, "m")); return m ? Number(m[1]) / 1024 : null; };
  return { rss: g("Rss"), pss: g("Pss"), anon: g("Anonymous"), private_dirty: g("Private_Dirty"), private_clean: g("Private_Clean"), shared_clean: g("Shared_Clean") };
}
export function resetHwm(pid) { try { writeFileSync(`/proc/${pid}/clear_refs`, "5"); return true; } catch { return false; } }

/* Samples VmRSS every `ms`; `peak` is the maximum seen and `hwm` the kernel's own high-water mark (reset to the current RSS first when clear_refs allows). */
export class Sampler {
  constructor(pid, ms = 10) { this.pid = pid; this.ms = ms; this.series = []; this.t = null; }
  begin(label) {
    this.label = label; this.series = []; this.canReset = resetHwm(this.pid);
    this.start = status(this.pid); this.t0 = Date.now();
    this.t = setInterval(() => { try { this.series.push([Date.now() - this.t0, status(this.pid).rss]); } catch { /* process gone */ } }, this.ms);
    return this;
  }
  end() {
    clearInterval(this.t);
    const e = status(this.pid);
    const rs = this.series.map((x) => x[1]).concat([this.start.rss, e.rss]);
    const peak = Math.max(...rs);
    return { label: this.label, ms: Date.now() - this.t0, samples: this.series.length, start_rss: this.start.rss, end_rss: e.rss, peak_rss: peak,
      peak_above_start: peak - this.start.rss, end_above_start: e.rss - this.start.rss, hwm_after: e.hwm, hwm_reset_ok: this.canReset, series: this.series };
  }
}

const stubWorker = (n) => ({ name: n, modules: true, compatibilityDate: "2026-07-01", script: `export default{fetch(r){return new URL(r.url).pathname==="/version"?new Response(JSON.stringify({ok:true,name:${JSON.stringify(n)},version:"0.87.0"})):new Response("stub",{status:404})}}` });

export async function start({ bundle, env = {}, name = "bio-plane", persist = null, session: session0 = null } = {}) {
  const script = readFileSync(bundle, "utf8");
  const logs = [];
  const inspectorPort = 20000 + Math.floor(Math.random() * 20000);
  const mf = new Miniflare({
    inspectorPort,
    log: undefined,
    handleRuntimeStdio(stdout, stderr) {
      const on = (s) => { let buf = ""; s.on("data", (c) => { buf += c.toString(); let i; while ((i = buf.indexOf("\n")) >= 0) { logs.push({ t: Date.now(), line: buf.slice(0, i) }); buf = buf.slice(i + 1); } }); };
      on(stdout); on(stderr);
    },
    workers: [{ name, modules: true, modulesRoot: "/", script, scriptPath: bundle, compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { ADMIN_TOKEN: TOKEN, MEMBER_TOKEN: "m".repeat(40), PROBE_TOKEN: "p".repeat(40), VERSION: "0.87.0", ...env },
      r2Buckets: ["CAPTURES", "PUBLISHED"], durableObjects: { STORE: { className: "Store", useSQLite: true } },
      serviceBindings: { PDF_WORKER: "pdf-worker", AGENT_WORKER: "agent-worker", OCR_WORKER: "ocr-worker", SHEET_WORKER: "sheet-worker", FILE_SCANNER: "file-scanner", SELF: name },
      outboundService: async (req) => new Response("no network in the measurement", { status: 599 }) },
      ...["pdf-worker", "agent-worker", "ocr-worker", "sheet-worker", "file-scanner"].map(stubWorker)],
    ...(persist ? { durableObjectsPersist: persist + "/do", r2Persist: persist + "/r2" } : {}),
  });
  await mf.ready;
  const pids = workerdPids();
  const pid = pids[0];
  let session = session0;
  const call = async (path, { method = "GET", body, headers = {} } = {}) => {
    const r = await mf.dispatchFetch("http://localhost" + path, { method, body, headers: { authorization: "Bearer " + (headers.__tok || session || TOKEN), ...headers } });
    const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch { /* */ }
    return { status: r.status, json, text: json ? undefined : text.slice(0, 300), timing: r.headers.get("server-timing") };
  };
  /* a signed-in member session, as the live studies used: the bootstrap claim (founding admin, a random password) then login */
  const signin = async () => {
    const password = randomBytes(12).toString("hex");
    const c = await call("/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: TOKEN, handle: "pat", password }), headers: { "content-type": "application/json" } });
    const l = await call("/?op=login", { method: "POST", body: JSON.stringify({ handle: "pat", password, device: "proto-mem" }), headers: { "content-type": "application/json" } });
    const tok = l.json && (l.json.token || (l.json.result && l.json.result.token) || (l.json.session && l.json.session.token));
    if (!tok) throw new Error(`signin failed: claim ${c.status} ${JSON.stringify(c.json).slice(0, 200)} login ${l.status} ${JSON.stringify(Object.keys(l.json || {}))}`);
    session = tok; return { claim: c.status, login: l.status };
  };
  const meas = async (route, body = {}) => { const r = await call(`/__meas/${route}`, { method: "POST", body: JSON.stringify(body) }); if (r.status !== 200) throw new Error(`meas ${route}: ${r.status} ${JSON.stringify(r.json || r.text)}`); return r.json.r; };
  /* the isolate's own JS heap, from the V8 inspector (Runtime.getHeapUsage): usedSize (live + garbage not yet collected), totalSize (committed heap). A forced GC is not answered by workerd's inspector. */
  let insp = null;
  const heapConnect = async () => {
    const list = await (await fetch(`http://127.0.0.1:${inspectorPort}/json`)).json();
    const t = list.find((x) => x.id === `core:user:${name}`);
    const ws = new WebSocket(t.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    let id = 0; const pend = new Map();
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
    const send = (method) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method })); });
    await send("Runtime.enable");
    insp = { ws, send };
  };
  const heap = async () => {
    if (!insp) await heapConnect();
    const r = await insp.send("Runtime.getHeapUsage");
    return { used: r2(r.result.usedSize / 1048576), total: r2(r.result.totalSize / 1048576), backing: r2(r.result.backingStorageSize / 1048576) };
  };
  return { inspectorPort, heap, mf, pid, pids, logs, call, meas, signin, getSession: () => session, close: async () => { try { if (insp) insp.ws.close(); } catch { /* */ } await mf.dispose(); } };
}

/* deterministic prose: `words` words a line (12), words drawn from a vocabulary of pseudo-words, a unit about 100 bytes */
export function makeText(bytes, seed = 1) {
  let s = seed >>> 0 || 1;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const syl = ["ka", "to", "mi", "ren", "sol", "vi", "dar", "ne", "pho", "lu", "ba", "cri", "tem", "or", "an", "gue", "shi", "ros", "ment", "tion"];
  const vocab = Array.from({ length: 6000 }, () => { let w = ""; const n = 2 + Math.floor(rnd() * 2); for (let i = 0; i < n; i++) w += syl[Math.floor(rnd() * syl.length)]; return w; });
  const lines = []; let size = 0;
  while (size < bytes) {
    const ws = Array.from({ length: 12 }, () => vocab[Math.floor(rnd() * vocab.length)]);
    const l = ws.join(" "); lines.push(l); size += l.length + 1;
  }
  return lines.join("\n") + "\n";
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const r2 = (x) => Math.round(x * 10) / 10;
export const r1 = (x) => (x === null || x === undefined ? x : Math.round(x * 10) / 10);
export { MB, randomBytes };

/* The Add door's own two calls, as bio-plane/src/screens-intake/capture.mjs (promoteDocument) makes them: op=captureupload with the bytes, then op=allocid + op=promote
   with the bundle it composes (bundle.md, data/provenance.json, data/dataset.json, the held file by blobSha, the register). */
import { createHash } from "node:crypto";
const sha256 = (s) => createHash("sha256").update(s).digest("hex");
const ulen = (s) => Buffer.byteLength(s, "utf8");
const canon = (v) => Array.isArray(v) ? "[" + v.map(canon).join(",") + "]"
  : v !== null && typeof v === "object" ? "{" + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}" : JSON.stringify(v);
export async function uploadFile(w, body, { name = "a.txt", statement = "memory measurement" } = {}) {
  const q = new URLSearchParams({ op: "captureupload", statement, name, type: "text/plain" });
  return await w.call(`/?${q}`, { method: "POST", body, headers: { "content-type": "text/plain" } });
}
export async function promoteDoc(w, doc, title) {
  const now = new Date().toISOString().split(".")[0] + "Z";
  const a = await w.call(`/?${new URLSearchParams({ op: "allocid", prefix: "INFO", year: now.slice(0, 4) })}`);
  const mid = a.json && (a.json.result || a.json);
  if (!mid || typeof mid.id !== "string") throw new Error("allocid failed " + JSON.stringify(a.json).slice(0, 300));
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-$/, "");
  const id = slug ? `${mid.id}-${slug}` : mid.id;
  const sha = doc.capture.sha256, bytes = doc.capture.bytes, locator = doc.locator;
  const dataset = canon({ documents: [{ bytes, locator, sha256: sha }] });
  const text = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + sha256(dataset),
    "source:", "  locator: " + JSON.stringify(locator), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none", "---", "",
    "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const PROV_EMBED_MAX = 1048576 - 65536;
  let prov = JSON.stringify({ documents: [doc] }, null, 1), dropped = false;
  if (prov.length > PROV_EMBED_MAX || ulen(prov) > PROV_EMBED_MAX) { const { reading: _r, text_units: _u, text_units_over_bound: _o, text_units_skipped: _k, ...unread } = doc; prov = JSON.stringify({ documents: [unread] }, null, 1); dropped = true; }
  const files = [{ path: "bundle.md", text, bytes: ulen(text), sha256: sha256(text) }, { path: "data/provenance.json", text: prov, bytes: ulen(prov), sha256: sha256(prov) },
    { path: "data/dataset.json", text: dataset, bytes: ulen(dataset), sha256: sha256(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes }];
  const tail = randomBytes(4).toString("hex");
  const p = await w.call("/?op=promote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ bundleId: id, base: null,
    snapKey: now.replace(/[-:]/g, "") + "_" + tail, meta: { object_type: "information", group: "Proto-mem Team", title, current_state: "collected", created: now, last_updated: now }, files, register }) });
  return { status: p.status, result: p.json && (p.json.result || p.json), dropped, id };
}

/* one operation on a started world, its resident-memory peak: the kernel's high-water mark since a reset just before it, and the maximum of 10 ms samples */
export async function measuredOn(w, label, fn, ms = 10) {
  let h0 = null; try { h0 = await w.heap(); } catch { /* inspector unavailable */ }
  const sm = new Sampler(w.pid, ms).begin(label);
  let hmax = h0 ? { used: h0.used, total: h0.total } : null, polling = true;
  const poll = (async () => { while (polling && h0) { try { const h = await w.heap(); hmax.used = Math.max(hmax.used, h.used); hmax.total = Math.max(hmax.total, h.total); } catch { /* */ } await new Promise((r) => setTimeout(r, 15)); } })();
  let value, error;
  try { value = await fn(); } catch (e) { error = String(e && e.message || e); }
  polling = false; await poll;
  const m = sm.end();
  let h1 = null; try { h1 = await w.heap(); if (hmax) { hmax.used = Math.max(hmax.used, h1.used); hmax.total = Math.max(hmax.total, h1.total); } } catch { /* */ }
  const peak = Math.max(m.peak_rss, m.hwm_reset_ok ? m.hwm_after : 0);
  return { value, error, m: { label, ms: m.ms, samples: m.samples, start_rss: r1(m.start_rss), end_rss: r1(m.end_rss), peak_rss: r1(peak), peak_above_start: r1(peak - m.start_rss), end_above_start: r1(m.end_rss - m.start_rss), hwm_reset_ok: m.hwm_reset_ok,
    heap_used_start: h0 && h0.used, heap_used_peak_seen: hmax && hmax.used, heap_used_end: h1 && h1.used, heap_total_start: h0 && h0.total, heap_total_peak_seen: hmax && hmax.total, heap_total_end: h1 && h1.total }, series: m.series };
}
export const snapOf = (w) => { const s = status(w.pid); return { rss: r1(s.rss), anon: r1(s.anon), file: r1(s.file), hwm: r1(s.hwm) }; };
