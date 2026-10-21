// PERFORMANCE lane probe: sign in as a role, open paths, record requests per page. Credentials by variable, never printed.
// usage: node probe.mjs <role: ADMIN|MEMBER> <width> <path>...   (env: BASE, PW_CORE dir)
import { createRequire } from "node:module";
const require = createRequire("/home/user/bio/bio-plane/src/journey-check/package.json");
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "https://biosmoke8.believeinoakland.workers.dev";
const [role, width, ...paths] = process.argv.slice(2);
const h = process.env[`JOURNEY_${role}_HANDLE`], pw = process.env[`JOURNEY_${role}_PASSWORD`];
const b = await chromium.launch({ args: ["--no-proxy-server"], ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const ctx = await b.newContext({ viewport: { width: +width, height: 900 } });
const page = await ctx.newPage();
let log = []; const T0 = Date.now();
page.on("requestfinished", async (r) => {
  try {
    const res = await r.response(); const t = r.timing(); const u = new URL(r.url());
    const sz = await r.sizes();
    log.push({ path: u.pathname, op: u.searchParams.get("op"), q: u.search.slice(0, 120), status: res.status(), ms: Math.round(t.responseEnd),
      wait: Math.round(t.responseStart - t.requestStart), body: sz.responseBodySize, cc: res.headers()["cache-control"] || null, cf: res.headers()["server-timing"] || null,
      enc: res.headers()["content-encoding"] || null, start: Math.round(t.startTime - T0) });
  } catch {}
});
await page.goto(BASE + "/"); 
await page.fill("#fs-handle", h); await page.fill("#fs-pw", pw);
await page.locator('[data-act="login"]').first().click();
await page.waitForFunction(() => location.pathname === "/app" || location.pathname === "/", null, { timeout: 20000 });
await page.waitForLoadState("networkidle").catch(() => {});
const out = [];
for (const p of paths) {
  log = [];
  const t0 = Date.now();
  await page.goto(BASE + p);
  // settle: network idle for 700ms
  await page.waitForLoadState("networkidle").catch(() => {});
  const ms = Date.now() - t0;
  const byOp = {};
  for (const r of log) { const k = r.op || r.path; (byOp[k] ||= { n: 0, bytes: 0, ms: 0, maxms: 0 }); byOp[k].n++; byOp[k].bytes += Math.max(0, r.body); byOp[k].ms += r.ms; byOp[k].maxms = Math.max(byOp[k].maxms, r.ms); }
  if (process.env.DUMP) out.push({ dump: log.map(r => `${String(r.start).padStart(6)} +${String(r.ms).padStart(5)} w${String(r.wait).padStart(5)} ${String(r.body).padStart(8)} ${r.status} ${r.op||r.path}${r.op==="heldcaptures"||r.op==="queue"?" "+r.q:""} cc=${r.cc||"-"} enc=${r.enc||"-"}`) });
  out.push({ path: p, settle_ms: ms, requests: log.length, api: log.filter(r => r.op).length, bytes: log.reduce((a, r) => a + Math.max(0, r.body), 0), byOp,
    words: log.filter(r => r.op === "interfacewords").map(r => ({ status: r.status, body: r.body, cc: r.cc, enc: r.enc, q: r.q, ms: r.ms })),
    slowest: [...log].sort((a, c) => c.ms - a.ms).slice(0, 5).map(r => ({ op: r.op || r.path, ms: r.ms, wait: r.wait, body: r.body })) });
}
console.log(JSON.stringify(out, null, 1));
await b.close();
