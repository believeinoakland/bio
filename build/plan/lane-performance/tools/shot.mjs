// usage: node shot.mjs <ADMIN|MEMBER> <path> <out.png>  — signs in, opens path, waits 8 s, prints visible text head and in-flight requests
import { createRequire } from "node:module";
const require = createRequire("/home/user/bio/bio-plane/src/journey-check/package.json");
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "https://biosmoke8.believeinoakland.workers.dev";
const [role, path, out] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--no-proxy-server"], ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const open = new Map(); page.on("request", (r) => open.set(r, Date.now())); page.on("requestfinished", (r) => open.delete(r)); page.on("requestfailed", (r) => open.delete(r));
await page.goto(BASE + "/");
await page.fill("#fs-handle", process.env[`JOURNEY_${role}_HANDLE`]); await page.fill("#fs-pw", process.env[`JOURNEY_${role}_PASSWORD`]);
await page.locator('[data-act="login"]').first().click();
await page.waitForFunction(() => location.pathname === "/app", null, { timeout: 20000 });
await page.waitForLoadState("networkidle").catch(() => {});
const t0 = Date.now(); await page.goto(BASE + path); await page.waitForTimeout(8000);
console.log("after 8 s:", (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 500));
console.log("open:", [...open.keys()].map((r) => r.url().slice(-80) + " " + (Date.now() - open.get(r)) + "ms"));
await page.screenshot({ path: out }); await b.close();
