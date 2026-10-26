// PERFORMANCE lane: acquire a locator, then poll heldcaptures until its document is complete; prints times. usage: node poll.mjs <ADMIN|MEMBER> <url>
import { createRequire } from "node:module";
const require = createRequire("/home/user/bio/bio-plane/src/journey-check/package.json");
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "https://biosmoke8.believeinoakland.workers.dev";
const [role, url] = process.argv.slice(2);
const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY }, ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto(BASE + "/");
await page.fill("#fs-handle", process.env[`JOURNEY_${role}_HANDLE`]); await page.fill("#fs-pw", process.env[`JOURNEY_${role}_PASSWORD`]);
await page.locator('[data-act="login"]').first().click();
await page.waitForFunction(() => location.pathname === "/app", null, { timeout: 20000 });
await page.waitForLoadState("networkidle").catch(() => {});
const res = await page.evaluate(async ({ url }) => {
  const key = Object.keys(localStorage).find((k) => { try { return JSON.parse(localStorage[k]).t; } catch { return false; } });
  const H = { Authorization: "Bearer " + JSON.parse(localStorage[key]).t, "content-type": "application/json" };
  const t0 = performance.now(); const out = { polls: [] };
  const r = await fetch("/api/?op=acquire", { method: "POST", headers: H, body: JSON.stringify({ locator: url }) }); const j = await r.json();
  out.first_ms = Math.round(performance.now() - t0); const a = j.result || j; out.keys = Object.keys(a); out.note = a.note; out.fetch_pending = a.fetch_pending; out.reading_pending = a.reading_pending;
  for (let i = 0; i < 40; i++) {
    await new Promise((s) => setTimeout(s, 3000));
    const h = await (await fetch("/api/?op=heldcaptures", { headers: H })).text();
    const has = h.includes(url.split("?")[1]);
    out.polls.push({ at_ms: Math.round(performance.now() - t0), listed: has });
    if (has) break;
  }
  return out;
}, { url });
console.log(JSON.stringify(res, null, 1).slice(0, 2500));
await b.close();
