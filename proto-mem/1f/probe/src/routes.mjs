/* proto-mem/1f (THROWAWAY probe, not product code): the probe Worker's routes, independent of the Container class so that a local workerd run (local/ in this folder) exercises the SAME code
   that BOB deploys. `hooks.instance(which, name)` returns something with `.fetch(Request)`: on the platform a Durable Object stub of the container class (Worker -> DO -> container,
   the hops reader-container's own Worker has), locally a function that forwards to a Node process running the image's server.
   Every route needs `Authorization: Bearer <env.PROBE_TOKEN>` (a Worker secret BOB sets; never printed, never logged). Nothing here calls any service but its own bindings (R2 bucket PROBE_R2, container instances).
   Routes:
     GET  /health
     GET  /gen?key=K&bytes=N&kind=random|zeros[&salt=S]       fill R2 key K with N deterministic bytes made INSIDE the Worker (AES-CTR / zeros); N <= env.PROBE_MAX_GEN (default 600 MiB)
     PUT  /put?key=K                                           stream the body into R2 key K (needs Content-Length; subject to the zone's request-body cap)
     GET  /head?key=K
     GET  /bytepass?key=K&mode=windows|stream&window=8388608&token=T      L1 floor: read K in 8 MiB R2 range windows (or one stream), SHA-256 via DigestStream, newline count, search for the truth token
     GET  /ping?which=min|reader&inst=NAME&path=/ping          container cold start / warm round trip as seen from the Worker
     GET  /push?which=&inst=&key=K&mode=stream|windows         P-M17 (a): the Worker reads R2 K and POSTs it to the container's /sink; the container answers bytes, sha256, its own timings
     GET  /pull?which=&inst=&key=K                             P-M17 (b): the container GETs http://r2.local/K, answered by the class's outbound handler from R2; same answer shape
     POST /reader/<convert|frames|archive>?key=K&kind=&to=&name=[&bounds=JSON]   L3-L5: the product's own caller side (readAll or 8 MiB windows from R2, x-reader-bounds, readRecords) against the reader image; payloads are counted, never returned
     GET  /fetchsource?which=&inst=&bytes=N                    container -> Worker: the Worker reads N deterministic bytes streamed by the container's /source and counts them (the stream analogue of exec().output(), whose API is not in the library read)
     GET  /hold?which=&inst=&seconds=S&beat=B                  a streamed heartbeat from the container (rollout / SIGTERM tests); passes the stream through
     GET  /state?which=&inst=     GET /stop?which=&inst=&signal=SIGTERM|SIGKILL */
import { readRecords } from "../../vendor/reader-container/src/records.mjs";

export const WINDOW = 8 * 1048576;
const MiB = 1048576, GiB = 1073741824;
/* the active bounds as lane/platform's bio-plane/src/read-bounds.mjs gives them (boundOf, beta rows = `standard`); a copy for the probe only */
export const BOUNDS = {
  convert: (kind) => ({ bytes: kind === "xls" || kind === "xlsm" ? 50 * MiB : 100 * MiB, timeMs: 900000 }),
  frames: { bytes: 50 * MiB, pixels: 120000000, edge: 65535, pages: 5000, timeMs: 900000 },
  archive: { bytes: 524288000, unpacked: 2 * GiB, ratio: 1100, members: 10000, member: 2 * GiB, name: 4096, timeMs: 900000 },
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const now = () => performance.now();

function authed(request, env) {
  const want = env.PROBE_TOKEN; if (typeof want !== "string" || want.length < 16) return false;
  const got = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (got.length !== want.length) return false;
  let d = 0; for (let i = 0; i < got.length; i++) d |= got.charCodeAt(i) ^ want.charCodeAt(i);
  return d === 0;
}
const must = (u, ...names) => { for (const n of names) if (!u.searchParams.get(n)) throw Object.assign(new Error(`missing ?${n}=`), { status: 400 }); };

/* deterministic bytes made inside the Worker */
function genStream(bytes, kind, salt) {
  let i = 0, key = null; const zeros = new Uint8Array(MiB);
  return new ReadableStream({
    async pull(c) {
      if (i * MiB >= bytes) { c.close(); return; }
      const n = Math.min(MiB, bytes - i * MiB);
      if (kind === "zeros") { c.enqueue(n === MiB ? zeros : zeros.subarray(0, n)); i++; return; }
      key ??= await crypto.subtle.importKey("raw", new TextEncoder().encode("proto-mem-1f-key"), "AES-CTR", false, ["encrypt"]);
      const ctr = new Uint8Array(16); const dv = new DataView(ctr.buffer); dv.setUint32(0, salt >>> 0); dv.setBigUint64(8, BigInt(i) * 65536n);
      const enc = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CTR", counter: ctr, length: 64 }, key, zeros));
      c.enqueue(n === MiB ? enc : enc.subarray(0, n)); i++;
    },
  });
}

async function bytepass(env, u) {
  const key = u.searchParams.get("key"), mode = u.searchParams.get("mode") || "windows", win = Number(u.searchParams.get("window") || WINDOW), token = u.searchParams.get("token") || "";
  const head = await env.PROBE_R2.head(key); if (!head) return json({ ok: false, error: "no such key" }, 404);
  const size = head.size, t0 = now(), d0 = Date.now(); const ds = new crypto.DigestStream("SHA-256"); const w = ds.getWriter();
  let nl = 0, found = -1, tail = "", seen = 0, windows = 0, maxWin = 0;
  const feed = async (buf, base) => {
    for (let i = 0; i < buf.length; i++) if (buf[i] === 10) nl++;                                  /* a byte pass in JavaScript, as a parser's floor */
    if (token && found < 0) { const s = tail + new TextDecoder("latin1").decode(buf); const at = s.indexOf(token); if (at >= 0) found = base - tail.length + at; tail = s.slice(Math.max(0, s.length - token.length + 1)); }
    await w.write(buf); seen += buf.length;
  };
  if (mode === "stream") { const o = await env.PROBE_R2.get(key); const r = o.body.getReader(); for (;;) { const { done, value } = await r.read(); if (done) break; await feed(value, seen); windows++; } }
  else for (let at = 0; at < size; at += win) { const a = now(); const o = await env.PROBE_R2.get(key, { range: { offset: at, length: Math.min(win, size - at) } }); const buf = new Uint8Array(await o.arrayBuffer()); await feed(buf, at); windows++; maxWin = Math.max(maxWin, now() - a); }
  await w.close(); const sha = [...new Uint8Array(await ds.digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return json({ ok: true, key, size, mode, windows, window_bytes: mode === "stream" ? null : win, bytes_seen: seen, sha256: sha, newlines: nl, token_found_at: found >= 0 ? found : null,
    worker_perf_now_ms: Math.round(now() - t0), worker_date_now_ms: Date.now() - d0, max_window_ms: Math.round(maxWin), note: "in-Worker clocks may not advance during synchronous JavaScript; the client's wall time is the figure" });
}

/* the source as reader.mjs reads it: whole (readAll) for convert and frames, 8 MiB windows as a request body for an archive */
async function r2ReadAll(env, key, size) { const out = new Uint8Array(size); for (let at = 0; at < size; at += WINDOW) { const o = await env.PROBE_R2.get(key, { range: { offset: at, length: Math.min(WINDOW, size - at) } }); out.set(new Uint8Array(await o.arrayBuffer()), at); } return out; }
function r2Windows(env, key, size) { let at = 0; return new ReadableStream({ async pull(c) { if (at >= size) { c.close(); return; } const n = Math.min(WINDOW, size - at); const o = await env.PROBE_R2.get(key, { range: { offset: at, length: n } }); at += n; c.enqueue(new Uint8Array(await o.arrayBuffer())); } }); }

async function reader(env, hooks, route, u) {
  must(u, "key", "kind"); const key = u.searchParams.get("key"), kind = u.searchParams.get("kind"), which = "reader", inst = u.searchParams.get("inst") || "r0";
  const head = await env.PROBE_R2.head(key); if (!head) return json({ ok: false, error: "no such key" }, 404);
  const bounds = u.searchParams.get("bounds") ? JSON.parse(u.searchParams.get("bounds")) : route === "convert" ? BOUNDS.convert(kind) : BOUNDS[route];
  const q = new URLSearchParams({ kind }); if (u.searchParams.get("to")) q.set("to", u.searchParams.get("to")); if (u.searchParams.get("name")) q.set("name", u.searchParams.get("name"));
  const t0 = now(); let body, readMs = 0;
  if (route === "archive") body = r2Windows(env, key, head.size); else { const a = now(); body = await r2ReadAll(env, key, head.size); readMs = now() - a; }
  const res = await hooks.instance(which, inst).fetch(new Request(`http://reader-container/${route}?${q}`, { method: "POST", body, duplex: "half", headers: { "x-reader-bounds": JSON.stringify(bounds), "content-type": "application/octet-stream" } }));
  const firstByte = now() - t0; const records = {}; let payload = 0, refusal = null, end = null, facts = null, firstRecord = null, err = null; const frames = [];
  try {
    for await (const { header, payload: p } of readRecords(res.body)) {
      if (firstRecord === null) firstRecord = now() - t0; records[header.type] = (records[header.type] || 0) + 1; payload += p ? p.length : 0;
      if (header.type === "refusal") refusal = header; if (header.type === "end") end = header; if (header.type === "facts") facts = header; if (header.type === "frame" && frames.length < 3) frames.push({ page: header.page, w: header.width, h: header.height });
    }
  } catch (e) { err = String(e.message || e).slice(0, 200); }
  return json({ ok: true, route, kind, key, file_bytes: head.size, bounds, http_status: res.status, r2_read_all_ms: Math.round(readMs), response_headers_ms: Math.round(firstByte), first_record_ms: firstRecord === null ? null : Math.round(firstRecord), total_ms: Math.round(now() - t0),
    records, payload_bytes: payload, refusal: refusal && { code: refusal.code, size: refusal.size, limit: refusal.limit, pixels: refusal.pixels, pages: refusal.pages, members: refusal.members, why: refusal.why }, end, facts, frames_sample: frames, error: err });
}

export async function handle(request, env, ctx, hooks) {
  const u = new URL(request.url);
  try {
    if (env.LOCAL_TEST === "1" && u.pathname === "/r2obj") { const o = await env.PROBE_R2.get(u.searchParams.get("key")); return o ? new Response(o.body, { headers: { "content-length": String(o.size) } }) : new Response("no", { status: 404 }); }   /* local runs only: lets a Node process stand in for the container's outbound handler */
    if (!authed(request, env)) return json({ ok: false, error: "unauthorized" }, 401);
    const which = u.searchParams.get("which") || "min", inst = u.searchParams.get("inst") || "i0";
    switch (`${request.method} ${u.pathname}`) {
      case "GET /health": return json({ ok: true, name: env.PROBE_NAME || null, local: env.LOCAL_TEST === "1" });
      case "GET /gen": {
        must(u, "key", "bytes"); const bytes = Number(u.searchParams.get("bytes")), max = Number(env.PROBE_MAX_GEN || 600 * MiB);
        if (!(bytes > 0) || bytes > max) return json({ ok: false, error: `bytes must be 1..${max}` }, 400);
        const kind = u.searchParams.get("kind") || "random"; const t0 = now(); const { readable, writable } = new FixedLengthStream(bytes);
        genStream(bytes, kind, Number(u.searchParams.get("salt") || 1)).pipeTo(writable).catch(() => {}); const o = await env.PROBE_R2.put(u.searchParams.get("key"), readable);
        return json({ ok: true, key: u.searchParams.get("key"), size: o.size, kind, ms: Math.round(now() - t0) }); }
      case "PUT /put": { must(u, "key"); const len = Number(request.headers.get("content-length")); if (!(len > 0)) return json({ ok: false, error: "Content-Length required" }, 411); const t0 = now(); const o = await env.PROBE_R2.put(u.searchParams.get("key"), request.body); return json({ ok: true, size: o.size, ms: Math.round(now() - t0) }); }
      case "GET /head": { must(u, "key"); const h = await env.PROBE_R2.head(u.searchParams.get("key")); return h ? json({ ok: true, size: h.size }) : json({ ok: false }, 404); }
      case "GET /bytepass": must(u, "key"); return await bytepass(env, u);
      case "GET /ping": { const t0 = now(); const res = await hooks.instance(which, inst).fetch(new Request(`http://probe${u.searchParams.get("path") || "/ping"}`)); const h = now() - t0; const text = await res.text(); let body = null; try { body = JSON.parse(text); } catch { body = text.slice(0, 300); } return json({ ok: res.ok, which, inst, status: res.status, worker_to_container_ms: Math.round(h), body }); }
      case "GET /push": {
        must(u, "key"); const key = u.searchParams.get("key"), mode = u.searchParams.get("mode") || "stream"; const t0 = now(); const head = await env.PROBE_R2.head(key); if (!head) return json({ ok: false, error: "no such key" }, 404);
        const headMs = now() - t0; const a = now(); let body;
        if (mode === "windows") body = r2Windows(env, key, head.size); else { const o = await env.PROBE_R2.get(key); body = o.body; }
        const res = await hooks.instance(which, inst).fetch(new Request("http://probe/sink", { method: "POST", body, duplex: "half", headers: { "content-type": "application/octet-stream" } }));
        const j = await res.json(); return json({ ok: res.ok, which, inst, mode, key, size: head.size, r2_head_ms: Math.round(headMs), push_total_ms: Math.round(now() - a), container: j }); }
      case "GET /pull": {
        must(u, "key"); const key = u.searchParams.get("key"); const base = env.LOCAL_TEST === "1" && u.searchParams.get("urlBase") ? u.searchParams.get("urlBase") : "http://r2.local/"; const a = now();
        const res = await hooks.instance(which, inst).fetch(new Request(`http://probe/pull?url=${encodeURIComponent(base + key)}`)); const j = await res.json(); return json({ ok: res.ok, which, inst, key, pull_total_ms: Math.round(now() - a), container: j }); }
      case "GET /fetchsource": { must(u, "bytes"); const a = now(); const res = await hooks.instance(which, inst).fetch(new Request(`http://probe/source?bytes=${u.searchParams.get("bytes")}`)); const rd = res.body.getReader(); let n = 0, first = null; for (;;) { const { done, value } = await rd.read(); if (done) break; if (first === null) first = now() - a; n += value.length; } return json({ ok: res.ok, which, inst, bytes: n, first_chunk_ms: Math.round(first), total_ms: Math.round(now() - a) }); }
      case "GET /hold": { const res = await hooks.instance(which, inst).fetch(new Request(`http://probe/hold?seconds=${u.searchParams.get("seconds") || 60}&beat=${u.searchParams.get("beat") || 5}`)); return new Response(res.body, { status: res.status, headers: { "content-type": "text/plain" } }); }
      case "GET /state": { const res = await hooks.instance(which, inst).fetch(new Request("http://probe/__state")); return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } }); }
      case "GET /stop": { const res = await hooks.instance(which, inst).fetch(new Request(`http://probe/__stop?signal=${u.searchParams.get("signal") || "SIGTERM"}`)); return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } }); }
      default: { const m = u.pathname.match(/^\/reader\/(convert|frames|archive)$/); if (m && request.method === "POST") return await reader(env, hooks, m[1], u); return json({ ok: false, error: "no such route" }, 404); }
    }
  } catch (e) { return json({ ok: false, error: String(e && e.message || e).slice(0, 300) }, e && e.status || 500); }
}
