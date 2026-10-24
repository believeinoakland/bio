import { Miniflare, sleep, SP, workerdRss } from "./mf.mjs";
const MiB = 1048576;
const callee = `
import { WorkerEntrypoint } from "cloudflare:workers";
export class Callee extends WorkerEntrypoint {
  take(u8) { return u8.byteLength; }
  give(n) { return new Uint8Array(n); }
  stream(n) { let sent = 0; const chunk = new Uint8Array(MiB1); return new ReadableStream({ type: "bytes", pull(c) { if (sent >= n) { c.close(); return; } const k = Math.min(MiB1, n - sent); c.enqueue(chunk.slice(0, k)); sent += k; } }); }
  async takeStream(rs) { const rd = rs.getReader(); let n = 0; for (;;) { const { done, value } = await rd.read(); if (done) break; n += value.byteLength; } return n; }
}
const MiB1 = 1048576;
export default { fetch() { return new Response("callee"); } };`;
const caller = `
export default { async fetch(req, env) {
  const u = new URL(req.url); const op = u.pathname.slice(1); const n = Math.round(Number(u.searchParams.get("mib")) * 1048576); const out = { op, mib: n / 1048576 }; const t0 = Date.now();
  try {
    if (op === "take") out.got = await env.CALLEE.take(new Uint8Array(n));
    if (op === "give") { const r = await env.CALLEE.give(n); out.got = r.byteLength; }
    if (op === "stream") { const rs = await env.CALLEE.stream(n); const rd = rs.getReader(); let c = 0, chunks = 0; for (;;) { const { done, value } = await rd.read(); if (done) break; c += value.byteLength; chunks++; } out.got = c; out.chunks = chunks; }
    if (op === "takeStream") { let sent = 0; const chunk = new Uint8Array(1048576); const rs = new ReadableStream({ type: "bytes", pull(c) { if (sent >= n) { c.close(); return; } const k = Math.min(1048576, n - sent); c.enqueue(chunk.slice(0, k)); sent += k; } }); out.got = await env.CALLEE.takeStream(rs); }
  } catch (e) { out.error = String(e.message).slice(0, 300); out.name = e.name; }
  out.ms = Date.now() - t0; return Response.json(out); } }`;
const mf = new Miniflare({ compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], workers: [
  { name: "caller", modules: true, compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], script: caller, serviceBindings: { CALLEE: { name: "callee", entrypoint: "Callee" } } },
  { name: "callee", modules: true, compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], script: callee } ] });
await mf.ready;
async function call(path) { let peak = 0, run = true; const s = (async () => { while (run) { peak = Math.max(peak, workerdRss()); await sleep(40); } })();
  const r = await mf.dispatchFetch("http://x/" + path); const txt = await r.text(); run = false; await s; let j; try { j = JSON.parse(txt); } catch { j = { status: r.status, body: txt.slice(0, 300) }; } j.rssPeakMB = peak; console.log(JSON.stringify(j)); }
for (const op of ["take", "give"]) for (const mib of [8, 31, 32, 33, 40, 100]) await call(`${op}?mib=${mib}`);
for (const op of ["stream", "takeStream"]) for (const mib of [40, 200]) await call(`${op}?mib=${mib}`);
await mf.dispose();
