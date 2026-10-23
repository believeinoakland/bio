// PERFORMANCE lane: press one control on a screen and time it: node act.mjs <ADMIN|MEMBER> <path> '<css selector>'  (prints ms to quiet network, requests made)
import { createRequire } from "node:module";
const require = createRequire("/home/user/bio/bio-plane/src/journey-check/package.json");
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "https://biosmoke8.believeinoakland.workers.dev";
const [role, path, sel] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--no-proxy-server"], ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
let log = []; page.on("requestfinished", (r) => { const u = new URL(r.url()); if (u.searchParams.get("op")) log.push(u.searchParams.get("op") + (r.method() === "POST" ? "(POST)" : "")); });
await page.goto(BASE + "/");
await page.fill("#fs-handle", process.env[`JOURNEY_${role}_HANDLE`]); await page.fill("#fs-pw", process.env[`JOURNEY_${role}_PASSWORD`]);
await page.locator('[data-act="login"]').first().click();
await page.waitForFunction(() => location.pathname === "/app", null, { timeout: 20000 });
await page.goto(BASE + path); await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {}); await page.waitForTimeout(1500);
for (let i = 0; i < 2; i++) {
  log = []; const t0 = Date.now();
  await page.locator(sel).first().click();
  await page.waitForTimeout(300); await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  console.log(`press ${i + 1}: ${Date.now() - t0} ms incl. 0.3 s settle; ops: ${log.join(", ")}`);
}
await b.close();
