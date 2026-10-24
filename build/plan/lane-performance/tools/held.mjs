// PERFORMANCE lane: list which held captures / open captures mention a substring (no content printed). usage: node held.mjs <ROLE> <substr>
import { createRequire } from "node:module";
const require = createRequire("/home/user/bio/bio-plane/src/journey-check/package.json");
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "https://biosmoke8.believeinoakland.workers.dev";
const [role, sub] = process.argv.slice(2);
const b = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY }, executablePath: process.env.CHROMIUM });
const page = await (await b.newContext()).newPage();
await page.goto(BASE + "/"); await page.fill("#fs-handle", process.env[`JOURNEY_${role}_HANDLE`]); await page.fill("#fs-pw", process.env[`JOURNEY_${role}_PASSWORD`]);
await page.locator('[data-act="login"]').first().click(); await page.waitForFunction(() => location.pathname === "/app", null, { timeout: 20000 });
const r = await page.evaluate(async ({ sub }) => {
  const key = Object.keys(localStorage).find((k) => { try { return JSON.parse(localStorage[k]).t; } catch { return false; } });
  const H = { Authorization: "Bearer " + JSON.parse(localStorage[key]).t };
  const out = {};
  for (const op of ["heldcaptures", "opencaptures"]) { const t = await (await fetch("/api/?op=" + op, { headers: H })).text(); out[op] = { bytes: t.length, body: t.length < 3000 ? t : undefined, hits: (t.match(new RegExp("[^\"]{0,80}" + sub + "[^\"]{0,60}", "g")) || []).slice(0, 12) }; }
  return out;
}, { sub });
console.log(JSON.stringify(r, null, 1)); await b.close();
