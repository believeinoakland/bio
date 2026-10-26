// PERFORMANCE lane probe: sign in as a role, open paths, record requests per page. Credentials by variable, never printed.
// usage: node probe.mjs <role: ADMIN|MEMBER> <width> <path>...   (env: BASE, PW_CORE dir)
import { createRequire } from "node:module";
const require = createRequire("/home/user/bio/bio-plane/src/journey-check/package.json");
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "https://biosmoke8.believeinoakland.workers.dev";
const [role, width, ...paths] = process.argv.slice(2);
const h = process.env[`JOURNEY_${role}_HANDLE`], pw = process.env[`JOURNEY_${role}_PASSWORD`];
const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY }, ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const ctx = await b.newContext({ viewport: { width: +width, height: 900 } });
const page = await ctx.newPage();
let log = []; const T0 = Date.now();
// R-PROXY (fix round 7): the agent proxy adds 1-2 s to concurrent requests. Each request's server time is its Server-Timing
// (`<op>;dur`, else the largest dur); its proxy-free duration = HOP (the direct /version figure) + server time + download.
const HOP = +(process.env.HOP || 50);
const srvMs = (st, op) => { if (!st) return 0; const e = st.split(",").map(x => x.trim()); const own = op && e.find(x => x.split(";")[0] === op);
  const d = (x) => +((x.match(/dur=([\d.]+)/) || [])[1] || 0); return own ? d(own) : Math.max(0, ...e.map(d)); };
// Rebuild the load without the proxy: a request starts after the request that ended last before it (its gate), shifted by
// the proxy delay the gate carried; browser time between them is kept.
const netOf = (rows, t0) => { const rs = [...rows].sort((a, c) => a.abs - c.abs); let proxy = 0;
  for (const r of rs) { const gate = rs.filter(g => g !== r && g.netEnd !== undefined && g.end <= r.abs).sort((a, c) => c.end - a.end)[0];
    const shift = gate ? gate.end - gate.netEnd : 0; const dur = Math.min(r.end - r.abs, HOP + r.srv + r.dl);
    r.netEnd = r.abs - shift + dur; proxy += (r.end - r.abs) - dur; }
  const api = rs.filter(r => r.op); return { net_done_ms: Math.round(api.reduce((a, r) => Math.max(a, r.netEnd), t0) - t0), proxy_ms_sum: Math.round(proxy),
    srv_max_ms: Math.round(Math.max(0, ...api.map(r => r.srv))) }; };
page.on("requestfinished", async (r) => {
  try {
    const res = await r.response(); const t = r.timing(); const u = new URL(r.url());
    const sz = await r.sizes();
    log.push({ path: u.pathname, op: u.searchParams.get("op"), q: u.search.slice(0, 120), status: res.status(), ms: Math.round(t.responseEnd),
      wait: Math.round(t.responseStart - t.requestStart), body: sz.responseBodySize, cc: res.headers()["cache-control"] || null, cf: res.headers()["server-timing"] || null,
      enc: res.headers()["content-encoding"] || null, start: Math.round(t.startTime - T0), end: t.startTime + t.responseEnd,
      abs: t.startTime, dl: Math.max(0, t.responseEnd - t.responseStart), srv: t.responseEnd + 5 < srvMs(res.headers()["server-timing"], u.searchParams.get("op")) ? 0 /* from cache */ : srvMs(res.headers()["server-timing"], u.searchParams.get("op")) });
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
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  const ms = Date.now() - t0;
  const byOp = {};
  for (const r of log) { const k = r.op || r.path; (byOp[k] ||= { n: 0, bytes: 0, ms: 0, maxms: 0 }); byOp[k].n++; byOp[k].bytes += Math.max(0, r.body); byOp[k].ms += r.ms; byOp[k].maxms = Math.max(byOp[k].maxms, r.ms); }
  if (process.env.DUMP) out.push({ dump: log.map(r => `${String(r.start).padStart(6)} +${String(r.ms).padStart(5)} w${String(r.wait).padStart(5)} ${String(r.body).padStart(8)} ${r.status} ${r.op||r.path}${r.op==="heldcaptures"||r.op==="queue"?" "+r.q:""} cc=${r.cc||"-"} enc=${r.enc||"-"}`) });
  const apiEnd = log.filter(r => r.op).reduce((a, r) => Math.max(a, r.end), t0);
  out.push({ path: p, settle_ms: ms, api_done_ms: Math.round(apiEnd - t0), ...netOf(log, t0), requests: log.length, api: log.filter(r => r.op).length, bytes: log.reduce((a, r) => a + Math.max(0, r.body), 0), byOp,
    words: log.filter(r => r.op === "interfacewords").map(r => ({ status: r.status, body: r.body, cc: r.cc, enc: r.enc, q: r.q, ms: r.ms })),
    slowest: [...log].sort((a, c) => c.ms - a.ms).slice(0, 5).map(r => ({ op: r.op || r.path, ms: r.ms, wait: r.wait, srv: r.srv, body: r.body })),
    slowest_srv: [...log].filter(r => r.op).sort((a, c) => c.srv - a.srv).slice(0, 5).map(r => ({ op: r.op, srv: r.srv, ms: r.ms, st: r.cf })) });
}
console.log(JSON.stringify(out, null, 1));
await b.close();
