/* proto-mem/1f (THROWAWAY probe image): a bare node server for P-M17. No dependencies. Endpoints:
     GET  /ping              process facts: pid, seconds since this process started, rss
     POST /sink              consumes the body; answers bytes, sha256, ms to first body byte after the handler started, total ms, rss  (R2 -> container by the caller's push)
     GET  /pull?url=U        fetches U (inside the platform: http://r2.local/<key>, answered by the class's outbound handler), consumes it; same answer shape plus the status
     GET  /source?bytes=N    streams N deterministic bytes (xorshift) - container -> Worker direction
     GET  /hold?seconds=S&beat=B   streams one JSON line per B seconds for S seconds; on SIGTERM writes a line {sigterm:ts} into every open hold and keeps going (so a client sees how long after SIGTERM the process lives)
     GET  /rss
   Listens on 0.0.0.0:$PORT (8080). Keeps nothing between requests. */
import { createServer } from "node:http";
import { createHash } from "node:crypto";
const PORT = Number(process.env.PORT || 8080), HOST = process.env.HOST || "0.0.0.0";
const started = Date.now();
const rssMb = () => Math.round(process.memoryUsage().rss / 1048576 * 10) / 10;
const holds = new Set();
process.on("SIGTERM", () => { const l = JSON.stringify({ sigterm: Date.now() }) + "\n"; for (const r of holds) r.write(l); console.log("SIGTERM at", Date.now()); });
async function consume(stream, t0) {
  const h = createHash("sha256"); let n = 0, first = null;
  for await (const c of stream) { if (first === null) first = Date.now() - t0; n += c.length; h.update(c); }
  return { bytes: n, sha256: h.digest("hex"), first_byte_ms: first, total_ms: Date.now() - t0, rss_mb: rssMb() };
}
const json = (res, o, s = 200) => { res.writeHead(s, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
export const server = createServer(async (req, res) => {
  const u = new URL(req.url, "http://c"); const t0 = Date.now();
  try {
    if (req.method === "GET" && u.pathname === "/ping") return json(res, { ok: true, pid: process.pid, process_uptime_s: Math.round(process.uptime() * 1000) / 1000, started_ms: started, now_ms: Date.now(), rss_mb: rssMb(), node: process.version });
    if (req.method === "GET" && u.pathname === "/rss") return json(res, { rss_mb: rssMb() });
    if (req.method === "POST" && u.pathname === "/sink") return json(res, { ok: true, ...(await consume(req, t0)) });
    if (req.method === "GET" && u.pathname === "/pull") { const r = await fetch(u.searchParams.get("url")); const hdr = Date.now() - t0; if (!r.ok) return json(res, { ok: false, status: r.status }, 502); const o = await consume(r.body, t0); return json(res, { ok: true, status: r.status, headers_ms: hdr, ...o }); }
    if (req.method === "GET" && u.pathname === "/source") {
      let n = Number(u.searchParams.get("bytes")), s = 2463534242; res.writeHead(200, { "content-type": "application/octet-stream", "content-length": String(n) }); const blk = Buffer.alloc(1 << 20);
      while (n > 0) { const k = Math.min(n, blk.length); for (let i = 0; i < k; i += 4) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; blk.writeUInt32LE(s, i); } if (!res.write(blk.subarray(0, k))) await new Promise((r) => res.once("drain", r)); n -= k; }
      return void res.end();
    }
    if (req.method === "GET" && u.pathname === "/hold") {
      const secs = Number(u.searchParams.get("seconds") || 60), beat = Number(u.searchParams.get("beat") || 5) * 1000; res.writeHead(200, { "content-type": "text/plain" }); holds.add(res); let k = 0;
      res.write(JSON.stringify({ hold: "start", pid: process.pid, ts: Date.now(), process_uptime_s: process.uptime() }) + "\n");
      const iv = setInterval(() => { res.write(JSON.stringify({ beat: ++k, ts: Date.now() }) + "\n"); if (k * beat >= secs * 1000) { clearInterval(iv); holds.delete(res); res.end(JSON.stringify({ hold: "end", ts: Date.now() }) + "\n"); } }, beat);
      res.on("close", () => { clearInterval(iv); holds.delete(res); }); return;
    }
    json(res, { ok: false, error: "UNKNOWN" }, 404);
  } catch (e) { try { json(res, { ok: false, error: String(e.message || e).slice(0, 200) }, 500); } catch { /* */ } }
});
server.requestTimeout = 0;
if (import.meta.url === `file://${process.argv[1]}`) server.listen(PORT, HOST, () => console.log("probe image listening", HOST, PORT));
