import http from "node:http";
import { Miniflare, sleep, SP, workerdRss } from "./mf.mjs";
import { boot, rssMB } from "./wd.mjs";
const MiB = 1048576, TOTAL = 150 * MiB;
const workerSrc = `
export default { async fetch(req, env) {
  const u = new URL(req.url); const op = u.pathname.slice(1); const out = { op, cl: req.headers.get("content-length"), te: req.headers.get("transfer-encoding") };
  try {
    if (op === "idle") return new Response("ok");
    if (op === "count") { const rd = req.body.getReader(); let n = 0; for (;;) { const { done, value } = await rd.read(); if (done) break; n += value.byteLength; } out.bytes = n; }
    if (op === "arraybuffer") { const ab = await req.arrayBuffer(); out.bytes = ab.byteLength; }
    if (op === "putdirect") { const o = await env.R.put("direct", req.body); out.size = o.size; }
    if (op === "putfixed") { const len = Number(u.searchParams.get("len") ?? req.headers.get("content-length")); const f = new FixedLengthStream(len); const p = req.body.pipeTo(f.writable); const o = await env.R.put("fixed", f.readable); await p; out.size = o.size; }
  } catch (e) { out.error = String(e.message); }
  return Response.json(out); } }`;
function post(url, path, { chunked, bytes = TOTAL }) {
  return new Promise((resolve) => {
    const u = new URL(url); const headers = chunked ? {} : { "content-length": String(bytes) };
    const req = http.request({ host: u.hostname, port: u.port, path, method: "POST", headers }, (res) => { let b = ""; res.on("data", (d) => (b += d)); res.on("end", () => resolve({ status: res.statusCode, body: b.slice(0, 400) })); });
    req.on("error", (e) => resolve({ clientError: e.code || e.message }));
    const chunk = Buffer.alloc(MiB, 1); let sent = 0;
    (function pump() { while (sent < bytes) { const n = Math.min(MiB, bytes - sent); const ok = req.write(n === MiB ? chunk : chunk.subarray(0, n)); sent += n; if (!ok) return req.once("drain", pump); } req.end(); })();
  });
}
async function measured(label, fn, rssFn) {
  let peak = 0, run = true; const base = rssFn(); const s = (async () => { while (run) { peak = Math.max(peak, rssFn()); await sleep(30); } })();
  const t = Date.now(); const r = await fn(); run = false; await s;
  console.log(JSON.stringify({ label, ...r, ms: Date.now() - t, rssBaseMB: base, rssPeakMB: peak }));
}
// A. Miniflare + R2
const mf = new Miniflare({ modules: true, compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], script: workerSrc, r2Buckets: ["R"], r2Persist: SP + "/data/s6-" + Date.now() });
const url = (await mf.ready).toString();
console.log("miniflare", url);
await measured("MF count bytes, content-length 150MiB", () => post(url, "/count", {}), workerdRss);
await measured("MF count bytes, chunked (no length)", () => post(url, "/count", { chunked: true }), workerdRss);
await measured("MF R2.put(request.body) content-length 150MiB", () => post(url, "/putdirect", {}), workerdRss);
await measured("MF R2.put(request.body) chunked", () => post(url, "/putdirect", { chunked: true }), workerdRss);
await measured("MF R2.put via FixedLengthStream, content-length 150MiB", () => post(url, "/putfixed", {}), workerdRss);
await measured("MF R2.put via FixedLengthStream, chunked, len=150MiB from query", () => post(url, `/putfixed?len=${TOTAL}`, { chunked: true }), workerdRss);
await measured("MF req.arrayBuffer() 150MiB", () => post(url, "/arraybuffer", {}), workerdRss);
await mf.dispose();
// B. raw workerd, old-space capped at 128 (no R2 there)
for (const op of ["count", "arraybuffer"]) {
  const port = 19300 + (op === "count" ? 1 : 2);
  const w = await boot({ dir: SP + "/data/s6raw", src: workerSrc, flags: ["--max-old-space-size=128"], port });
  await measured(`raw workerd (old-space 128) ${op} 150MiB content-length`, () => post(`http://127.0.0.1:${port}`, "/" + op, {}), () => rssMB(w.p.pid) || 0);
  if (w.exited) console.log("workerd exited", JSON.stringify(w.exited), w.log.slice(-200));
  w.p.kill("SIGKILL"); await sleep(300);
}
