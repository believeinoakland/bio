// PERFORMANCE lane: time one POST/GET op from inside a signed-in page; prints timing and the answer's keys (not its content unless SHOW=1).
// usage: node post.mjs <ADMIN|MEMBER> <op[?k=v]> '<json body or ->'
import { createRequire } from "node:module";
const require = createRequire("/home/user/bio/bio-plane/src/journey-check/package.json");
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "https://biosmoke8.believeinoakland.workers.dev";
const [role, op, body] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--no-proxy-server"], ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}) });
const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto(BASE + "/");
await page.fill("#fs-handle", process.env[`JOURNEY_${role}_HANDLE`]); await page.fill("#fs-pw", process.env[`JOURNEY_${role}_PASSWORD`]);
await page.locator('[data-act="login"]').first().click();
await page.waitForFunction(() => location.pathname === "/app", null, { timeout: 20000 });
await page.waitForLoadState("networkidle").catch(() => {});
const res = await page.evaluate(async ({ op, body }) => {
  const key = Object.keys(localStorage).find((k) => { try { return JSON.parse(localStorage[k]).t; } catch { return false; } });
  const t = JSON.parse(localStorage[key]).t; const t0 = performance.now();
  const r = await fetch("/api/?op=" + op.replace("?", "&"), { method: body && body !== "-" ? "POST" : "GET", headers: { Authorization: "Bearer " + t, "content-type": "application/json" }, ...(body && body !== "-" ? { body } : {}) });
  const text = await r.text();
  return { ms: Math.round(performance.now() - t0), status: r.status, bytes: text.length, text };
}, { op, body });
let j = null; try { j = JSON.parse(res.text); } catch {}
console.log(JSON.stringify({ ms: res.ms, status: res.status, bytes: res.bytes }));
if (j) { const r = j.result && typeof j.result === "object" ? j.result : j; console.log("keys:", Object.keys(r).join(",")); if (r.timings) console.log("timings:", JSON.stringify(r.timings)); if (r.render || r.document?.render) { const rr = r.render || r.document.render; const { subresources, ...rest } = rr; console.log("render:", JSON.stringify(rest).slice(0, 1500)); if (Array.isArray(subresources)) console.log("subresources:", subresources.length, "bytes", subresources.reduce((a, x) => a + (x.bytes || 0), 0)); } if (process.env.SHOW) console.log(res.text.slice(0, +process.env.SHOW)); }
else console.log(res.text.slice(0, 300));
await b.close();
