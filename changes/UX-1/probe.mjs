import http from "node:http";
import { chromium } from "playwright-core";
import { pathToFileURL } from "node:url";
const [label, file, port] = process.argv.slice(2);
const worker = (await import(pathToFileURL(file).href)).default;
const srv = http.createServer(async (req, res) => {
  const r = await worker.fetch(new Request("http://127.0.0.1:" + port + req.url), { PLANE: { fetch: async () => new Response('{"ok":false}', { status: 503 }) } });
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
}).listen(+port);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage();
const outside = [], fonts = [];
await page.route("**/*", (route) => {
  const u = new URL(route.request().url());
  if (u.hostname !== "127.0.0.1") { outside.push(u.origin + u.pathname); return route.abort(); }
  return route.continue();
});
page.on("response", (r) => { if (r.url().includes("/fonts/")) fonts.push(`${r.status()} ${new URL(r.url()).pathname}`); });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
const faces = await page.evaluate(async () => {
  const want = ['400 16px "Source Serif 4"', 'italic 400 16px "Source Serif 4"', '400 16px "Source Sans 3"', '400 16px "Source Code Pro"'];
  const out = {};
  for (const w of want) { try { const l = await document.fonts.load(w); out[w] = l.length ? "loaded" : "NOT loaded"; } catch (e) { out[w] = "error " + e.message; } }
  return out;
});
await page.screenshot({ path: `${label}.png` });
console.log(JSON.stringify({ label, outsideRequestsBlocked: [...new Set(outside)], fontResponses: fonts, faces }, null, 1));
await browser.close(); srv.close();
