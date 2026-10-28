#!/usr/bin/env node
/* PROTO STAGES (throwaway): uploads N files with `op=captureupload` (the product page's query: statement, name, type) at concurrency C=1 (control) then C=3, and prints per-stage
   medians from each response's Server-Timing (the plane must run with PROTO_STAGES=1). Usage:
     BASE=https://<plane> STAGES_TOKEN=<signed-in member session token> node scripts/upload-stages.mjs <dir> [n=6] [c=1,3] [salt=1] [promote=0]
   Files of 200 KB to 2 MB are taken from <dir> (not recursive). Each upload is salted with 8 random trailing bytes (salt=0 to send the file as it is) so a second run is not a
   "second sighting" of bytes the record holds. promote=1 also posts `op=promote` per upload (the document from the answer) and reports its stages as promote.*. Goes through
   HTTPS_PROXY with https-proxy-agent. Never prints the token. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import https from "node:https";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";

const require = createRequire("/opt/node-tools/node_modules/");
const { HttpsProxyAgent } = require("https-proxy-agent");
const dir = process.argv[2];
const args = Object.fromEntries(process.argv.slice(3).map((a) => a.split("=")));
const { BASE, STAGES_TOKEN } = process.env;
if (!dir || !BASE || !STAGES_TOKEN) { console.error("usage: BASE=... STAGES_TOKEN=... node scripts/upload-stages.mjs <dir> [n=6] [c=1,3] [salt=1] [promote=0]"); process.exit(2); }
const N = Number(args.n || 6), LEVELS = String(args.c || "1,3").split(",").map(Number), SALT = args.salt !== "0", PROMOTE = args.promote === "1";
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
const TYPES = { ".pdf": "application/pdf", ".txt": "text/plain", ".md": "text/markdown", ".csv": "text/csv", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".html": "text/html", ".json": "application/json" };
const files = readdirSync(dir).map((f) => join(dir, f)).filter((f) => { const s = statSync(f); return s.isFile() && s.size >= 200 * 1024 && s.size <= 2 * 1024 * 1024; }).sort();
if (!files.length) { console.error("no files of 200 KB to 2 MB in", dir); process.exit(2); }
const pick = (i) => files[i % files.length];

const send = (path, { method = "POST", body, type = "application/octet-stream" }) => new Promise((resolve) => {
  const u = new URL(path, BASE), t0 = Date.now();
  const req = https.request(u, { method, agent, headers: { authorization: `Bearer ${STAGES_TOKEN}`, "content-type": type, "content-length": body.length } }, (res) => {
    const chunks = [];
    res.on("data", (c) => chunks.push(c));
    res.on("end", () => { let json = null; try { json = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { /* not JSON */ }
      resolve({ status: res.statusCode, wall: Date.now() - t0, timing: String(res.headers["server-timing"] || ""), json }); });
  });
  req.setTimeout(150000, () => { req.destroy(new Error("timeout")); });
  req.on("error", (e) => resolve({ status: 0, wall: Date.now() - t0, timing: "", json: null, error: e.message }));
  req.end(body);
});
const timingOf = (h) => { const o = {}; for (const part of h.split(",")) { const [n, ...p] = part.trim().split(";"); const d = p.find((x) => x.trim().startsWith("dur=")); if (n && d) o[n.trim()] = Number(d.trim().slice(4)); } return o; };

const upload = async (i, tag) => {
  const f = pick(i), raw = readFileSync(f), body = SALT ? Buffer.concat([raw, randomBytes(8)]) : raw;
  const q = new URLSearchParams({ op: "captureupload", statement: `upload stage timing ${tag} ${i}`, name: basename(f), type: TYPES[extname(f).toLowerCase()] || "application/octet-stream" });
  const r = await send(`/?${q}`, { body });
  const out = { wall: r.wall, status: r.status, ok: !!(r.json && r.json.result && r.json.result.ok), t: timingOf(r.timing), error: r.error, size: body.length };
  if (PROMOTE && out.ok && r.json.result.document) {
    const p = await send(`/?op=promote`, { body: Buffer.from(JSON.stringify({ document: r.json.result.document })), type: "application/json" });
    out.promote = { wall: p.wall, status: p.status, t: timingOf(p.timing) };
  }
  return out;
};
const med = (a) => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };

for (const C of LEVELS) {
  const tag = `c${C}-${Date.now().toString(36)}`, results = [];
  let next = 0;
  const t0 = Date.now();
  await Promise.all(Array.from({ length: C }, async () => { while (next < N) { const i = next++; results.push(await upload(i, tag)); } }));
  const names = new Set(); for (const r of results) for (const k of Object.keys(r.t)) names.add(k);
  const stat = {}; for (const k of [...names].sort()) stat[k] = med(results.map((r) => r.t[k]));
  const summary = { concurrency: C, files: N, batch_ms: Date.now() - t0, ok: results.filter((r) => r.ok).length, statuses: [...new Set(results.map((r) => r.status))],
                    errors: results.filter((r) => r.error).map((r) => r.error), wall_median_ms: med(results.map((r) => r.wall)), wall_max_ms: Math.max(...results.map((r) => r.wall)),
                    median_ms: stat };
  if (PROMOTE) { const pn = new Set(); for (const r of results) if (r.promote) for (const k of Object.keys(r.promote.t)) pn.add(k);
    summary.promote_median_ms = Object.fromEntries([...pn].sort().map((k) => [k, med(results.map((r) => r.promote?.t[k]))])); summary.promote_wall_median_ms = med(results.map((r) => r.promote?.wall)); }
  console.log(JSON.stringify(summary, null, 1));
}
