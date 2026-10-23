// PERFORMANCE lane: time single API reads one at a time (and N at once) from inside a signed-in page. No credential printed.
// usage: node ops.mjs <ADMIN|MEMBER> <op[?k=v&..]>...   env REPEAT (default 5), PAR (default 1)
import { createRequire } from "node:module";
const require = createRequire("/home/user/bio/bio-plane/src/journey-check/package.json");
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "https://biosmoke8.believeinoakland.workers.dev";
const [role, ...ops] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--no-proxy-server"], ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto(BASE + "/");
await page.fill("#fs-handle", process.env[`JOURNEY_${role}_HANDLE`]); await page.fill("#fs-pw", process.env[`JOURNEY_${role}_PASSWORD`]);
await page.locator('[data-act="login"]').first().click();
await page.waitForFunction(() => location.pathname === "/app", null, { timeout: 20000 });
await page.waitForLoadState("networkidle").catch(() => {});
const res = await page.evaluate(async ({ ops, REPEAT, PAR }) => {
  const key = Object.keys(localStorage).find((k) => { try { return JSON.parse(localStorage[k]).t; } catch { return false; } });
  const t = JSON.parse(localStorage[key]).t; const out = {};
  for (const o of ops) {
    const url = "/api/?op=" + o.replace("?", "&"); const ms = []; let bytes = 0, status = 0, hdr = {};
    for (let i = 0; i < REPEAT; i++) {
      const t0 = performance.now();
      const rs = await Promise.all(Array.from({ length: PAR }, () => fetch(url, { headers: { Authorization: "Bearer " + t } }).then(async (r) => { const x = await r.arrayBuffer(); status = r.status; bytes = x.byteLength; hdr = { cc: r.headers.get("cache-control"), st: r.headers.get("server-timing"), cfray: r.headers.get("cf-ray") }; })));
      ms.push(Math.round(performance.now() - t0));
    }
    out[o] = { status, bytes, ms, hdr };
  }
  return out;
}, { ops, REPEAT: +(process.env.REPEAT || 5), PAR: +(process.env.PAR || 1) });
console.log(JSON.stringify(res));
await b.close();
