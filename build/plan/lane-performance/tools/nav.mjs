// PERFORMANCE lane: in-app navigation vs full load. usage: node nav.mjs <ADMIN|MEMBER> <width>
// Signs in, loads Home once, then moves between screens inside the page (a link when the page has one for the address, else the
// shell's own route change: history.pushState + popstate, which is what a link does) and, separately, loads the same screens in full.
// Per move: time to the last API read, requests, waves (starts within 150 ms of each other), hops and the price of a hop
// (Server-Timing do-<route> minus in-<route>). Reads only; nothing is written.
import { createRequire } from "node:module";
const require = createRequire("/home/user/bio/bio-plane/src/journey-check/package.json");
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "https://biosmoke8.believeinoakland.workers.dev";
const [role, width] = process.argv.slice(2);
const PR = "PROJ-2026-5304-walk-085-project", Q = "INQ-2026-0001-how-many-pothole-reports-did-the-city-cl", DOC = "INFO-2026-0001-walk085-sample-txt";
const SCREENS = [["Home", "/app"], ["Project", `/app/project/${PR}`], ["Question", `/app/question/${Q}/${PR}`], ["Document", `/app/document/${DOC}`], ["Timeline", `/app/timeline/${PR}`], ["Held", "/app/held"]];
const b = await chromium.launch({ args: ["--no-proxy-server"], ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const page = await (await b.newContext({ viewport: { width: +width, height: 900 } })).newPage();
let log = [], docs = 0;
page.on("framenavigated", (f) => { if (f === page.mainFrame()) docs++; });
page.on("requestfinished", async (r) => { try {
  const u = new URL(r.url()); const res = await r.response(); const t = r.timing();
  log.push({ op: u.searchParams.get("op"), path: u.pathname, start: t.startTime, end: t.startTime + t.responseEnd, st: res.headers()["server-timing"] || "", body: (await r.sizes()).responseBodySize });
} catch {} });
await page.goto(BASE + "/");
await page.fill("#fs-handle", process.env[`JOURNEY_${role}_HANDLE`]); await page.fill("#fs-pw", process.env[`JOURNEY_${role}_PASSWORD`]);
await page.locator('[data-act="login"]').first().click();
await page.waitForFunction(() => location.pathname === "/app", null, { timeout: 20000 });
await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500);
const quiet = async (ms = 800, cap = 15000) => { const t0 = Date.now(); let n = -1; let since = Date.now();
  while (Date.now() - t0 < cap) { await page.waitForTimeout(100); if (log.length !== n) { n = log.length; since = Date.now(); } else if (Date.now() - since >= ms) break; } };
const summarise = (t0) => {
  const api = log.filter((r) => r.op);
  const last = api.reduce((a, r) => Math.max(a, r.end), t0);
  const starts = api.map((r) => r.start).sort((a, c) => a - c); const waves = []; for (const s of starts) { if (!waves.length || s - waves[waves.length - 1] > 150) waves.push(s); else waves[waves.length - 1] = s; }
  const ops = {}; let hops = 0, doSum = 0, inSum = 0, chain = 0;
  for (const r of api) { ops[r.op] = (ops[r.op] || 0) + 1; let c = 0;
    for (const m of r.st.split(",")) { const [n, d] = m.trim().split(";dur="); if (n.startsWith("do-")) { hops++; c++; doSum += +d; } if (n.startsWith("in-")) inSum += +d; }
    chain = Math.max(chain, c); }
  const repeats = Object.entries(ops).filter(([, n]) => n > 1).map(([k, n]) => `${k}x${n}`);
  const html = log.filter((r) => !r.op && /^\/app/.test(r.path) && !/\/assets\//.test(r.path) && !/shell-/.test(r.path)).length, shell = log.filter((r) => /shell-[\d.]+\.js|\/assets\//.test(r.path)).length;
  return { html_loads: html, shell_files: shell, ops, drawn_ms: Math.round(last - t0), requests: log.length, api: api.length, waves: waves.length, hops, hop_ms: hops ? Math.round((doSum - inSum) / hops) : null, longest_chain: chain, repeats };
};
const move = async (path, how) => { log = []; const d0 = docs; const t0 = Date.now(); let via = "full load";
  if (how === "app") {
    const sel = `a[href="${path}"]:visible`;
    if (await page.locator(sel).count()) { via = "link"; await page.locator(sel).first().click(); }
    else { via = "route"; await page.evaluate((p) => { history.pushState({}, "", p); window.dispatchEvent(new PopStateEvent("popstate")); }, path); }
  } else await page.goto(BASE + path);
  await quiet(); const s = summarise(t0); return { via, ...s }; };
const out = { role, width: +width, inapp: [], full: [] };
for (let round = 0; round < 2; round++) for (const [name, path] of SCREENS.slice(1).concat([SCREENS[0]])) out.inapp.push({ round: round + 1, screen: name, ...(await move(path, "app")) });
for (let round = 0; round < 2; round++) for (const [name, path] of SCREENS) out.full.push({ round: round + 1, screen: name, ...(await move(path, "full")) });
console.log(JSON.stringify(out, null, 0));
await b.close();
