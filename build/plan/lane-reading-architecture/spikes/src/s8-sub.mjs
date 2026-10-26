import http from "node:http";
import { Miniflare, SP } from "./mf.mjs";
let cur = 0, max = 0, total = 0, hold = 0;
const srv = http.createServer((req, res) => { total++; cur++; max = Math.max(max, cur); setTimeout(() => { cur--; res.end("ok"); }, hold); });
await new Promise((r) => srv.listen(0, "127.0.0.1", r)); const port = srv.address().port;
const script = `
export default { async fetch(req, env) {
  const u = new URL(req.url); const op = u.pathname.slice(1); const n = Number(u.searchParams.get("n")); const out = { op, n }; const t0 = Date.now();
  const target = "http://127.0.0.1:${port}/";
  try {
    if (op === "seq") { let ok = 0; for (let i = 0; i < n; i++) { try { const r = await fetch(target + i); await r.text(); ok++; } catch (e) { out.firstError = out.firstError || String(e.message).slice(0, 200); out.failedAt = out.failedAt ?? i; } } out.ok = ok; }
    if (op === "par") { const rs = await Promise.allSettled(Array.from({ length: n }, (_, i) => fetch(target + i).then((r) => r.text()))); out.ok = rs.filter((x) => x.status === "fulfilled").length; const bad = rs.find((x) => x.status === "rejected"); if (bad) out.firstError = String(bad.reason.message).slice(0, 200); }
    if (op === "r2") { let ok = 0; for (let i = 0; i < n; i++) { try { await env.R.head("k" + i); ok++; } catch (e) { out.firstError = out.firstError || String(e.message).slice(0, 200); out.failedAt = out.failedAt ?? i; } } out.ok = ok; }
    if (op === "kv") { let ok = 0; for (let i = 0; i < n; i++) { try { await env.K.get("k" + i); ok++; } catch (e) { out.firstError = out.firstError || String(e.message).slice(0, 200); out.failedAt = out.failedAt ?? i; } } out.ok = ok; }
  } catch (e) { out.error = String(e.message); }
  out.ms = Date.now() - t0; return Response.json(out); } }`;
const mf = new Miniflare({ modules: true, compatibilityDate: "2026-07-01", script, r2Buckets: ["R"], kvNamespaces: ["K"], r2Persist: SP + "/data/s8r-" + Date.now(), kvPersist: SP + "/data/s8k-" + Date.now() });
async function call(path, h = 0) { hold = h; cur = 0; max = 0; total = 0; const r = await mf.dispatchFetch("http://x/" + path); const j = await r.json(); j.serverSawTotal = total; j.serverMaxConcurrent = max; console.log(JSON.stringify(j)); }
await call("seq?n=1100");
await call("seq?n=10500");
await call("par?n=30", 400);
await call("par?n=200", 400);
await call("r2?n=1100");
await call("kv?n=1100");
await mf.dispose(); srv.close();
