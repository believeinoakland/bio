/* capture-sources: the in-plane renderer driven against REAL Chromium (DOCS V4–V7, SCAN E8's page shapes at their smallest size),
 * at the module's interface (build/requirements/capture-sources.md R11, R69, R70). Where `browserrender.test.mjs` proves the
 * driver against a fake that speaks the binding's protocol, this proves what a page does to it: the fake cannot show a 403, a
 * browser error page, a shell that never hydrates, a dialog, a page that hydrates late.
 *
 * THE ORIGIN IS OFFLINE: an https server on the loopback, a self-signed certificate made by openssl for the test, and the browser
 * told to map `portal.example.gov` to 127.0.0.1 and to accept that certificate. The address the driver is asked to render is a
 * public locator (R64), so the hold lets it go; nothing leaves the machine. The binding is a shim: it starts Chromium, and answers
 * the two calls of the Browser Rendering protocol with the browser's own DevTools socket. A machine with no Chromium or no openssl
 * skips this file, saying so. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:https";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { crc32, deflateSync } from "node:zlib";
import { join } from "node:path";
import { renderWithBinding } from "../../../src/browserrender.mjs";
import { renderBlock, keepRenderBodies, RENDER_COPY_STATEMENT } from "../../../src/render.mjs";

const HOST = "portal.example.gov";

const PAGES = {
  "/ok": { body: "<!DOCTYPE html><html><body><h1>Agenda</h1><p>Council meets Tuesday.</p></body></html>" },
  "/forbidden": { status: 403, body: "<html><body><h1>Forbidden</h1><p>You do not have access.</p></body></html>" },
  "/gone": { status: 404, body: "" },
  "/blank": { body: "<html><body></body></html>" },
  "/shell": { body: "<!DOCTYPE html><html><head><title>App</title></head><body><div id=\"root\"></div><noscript>You need to enable JavaScript.</noscript><script>/* never hydrates */</script></body></html>" },
  "/hydrates": { body: "<!DOCTYPE html><html><body><div id=\"root\"></div><script>fetch('/slow-data').then(function (r) { return r.text(); }).then(function (t) { document.getElementById('root').textContent = t; });</script></body></html>" },
  "/slow-data": { body: "Hydrated agenda", delayMs: 1500, type: "text/plain" },
  "/dialog": { body: "<!DOCTYPE html><html><body><p>Before the dialog</p><script>alert('cookies?'); document.body.appendChild(document.createTextNode(' after the dialog'));</script></body></html>" },
  "/reset": { reset: true },
  "/images": { body: (n) => `<!DOCTYPE html><html><body>${Array.from({ length: n }, (_, i) => `<img src="/img/${i}.bin">`).join("")}</body></html>` },
};
const IMAGE_BYTES = 40_000, IMAGES = 12;
/* A real PNG (one pixel, a tEXt chunk of padding to IMAGE_BYTES), a different colour for each i, so every picture is its own bytes. */
function png(i) {
  const chunk = (type, data) => { const body = Buffer.concat([Buffer.from(type), data]); const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body)); return Buffer.concat([len, body, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(1, 0); ihdr.writeUInt32BE(1, 4); ihdr[8] = 8; ihdr[9] = 2;
  const parts = (pad) => [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr),
    chunk("tEXt", Buffer.from("k\0" + "x".repeat(pad))), chunk("IDAT", deflateSync(Buffer.from([0, i + 1, 0, 0]))), chunk("IEND", Buffer.alloc(0))];
  const base = Buffer.concat(parts(0)).length;
  return Buffer.concat(parts(IMAGE_BYTES - base));
}

function makeCertificate(dir) {
  const r = spawnSync("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", join(dir, "k.pem"), "-out", join(dir, "c.pem"),
    "-days", "2", "-subj", `/CN=${HOST}`, "-addext", `subjectAltName=DNS:${HOST}`], { encoding: "utf8" });
  return r.status === 0 ? { key: readFileSync(join(dir, "k.pem")), cert: readFileSync(join(dir, "c.pem")) } : null;
}

async function setup() {
  let chromePath;
  try {
    const pw = await import("playwright").catch(() => createRequire(join(process.cwd(), "x.js"))("playwright"));
    chromePath = (pw.chromium ?? pw.default?.chromium).executablePath();
  } catch { return { skip: "Playwright is not installed" }; }
  const dir = mkdtempSync(join(tmpdir(), "bio-chromium-render-"));
  const cert = makeCertificate(dir);
  if (!cert) { rmSync(dir, { recursive: true, force: true }); return { skip: "openssl cannot make a certificate" }; }
  const server = createServer(cert, (req, res) => {
    const path = new URL(req.url, "https://x").pathname;
    const img = /^\/img\/(\d+)\.bin$/.exec(path);
    if (img) { res.writeHead(200, { "content-type": "image/png" }); return res.end(png(Number(img[1]))); }
    const page = PAGES[path];
    if (!page) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("no such page"); }
    if (page.reset) return req.socket.destroy();
    setTimeout(() => {
      res.writeHead(page.status || 200, { "content-type": page.type || "text/html; charset=utf-8" });
      res.end(typeof page.body === "function" ? page.body(IMAGES) : page.body);
    }, page.delayMs || 0);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;

  /* The Browser Rendering binding's two calls, answered by a browser started for each session. */
  const sessions = new Map();
  const binding = {
    async fetch(url, init = {}) {
      const u = new URL(url);
      if (init.method === "POST" && u.pathname === "/v1/devtools/browser") {
        const profile = mkdtempSync(join(dir, "profile-"));
        const child = spawn(chromePath, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--no-first-run",
          "--no-proxy-server", "--remote-debugging-port=0", `--user-data-dir=${profile}`, `--host-resolver-rules=MAP ${HOST} 127.0.0.1`, "--ignore-certificate-errors", "about:blank"],
          { stdio: ["ignore", "ignore", "pipe"] });
        const endpoint = await new Promise((resolve, reject) => {
          let seen = "";
          const timer = setTimeout(() => reject(new Error("Chromium gave no DevTools address")), 20000);
          child.stderr.on("data", (d) => { seen += d; const m = /DevTools listening on (ws:\/\/\S+)/.exec(seen); if (m) { clearTimeout(timer); resolve(m[1]); } });
          child.on("exit", () => { clearTimeout(timer); reject(new Error("Chromium exited at start")); });
        });
        const id = `chromium-${sessions.size + 1}`;
        sessions.set(id, { child, endpoint });
        return { status: 200, json: async () => ({ sessionId: id }), text: async () => "" };
      }
      const m = /^\/v1\/devtools\/browser\/(.+)$/.exec(u.pathname);
      if (m && (init.headers || {}).Upgrade === "websocket" && sessions.has(m[1])) {
        const ws = new WebSocket(sessions.get(m[1]).endpoint);
        await new Promise((resolve, reject) => { ws.addEventListener("open", resolve); ws.addEventListener("error", () => reject(new Error("DevTools socket refused"))); });
        ws.accept = () => {};
        return { status: 101, webSocket: ws };
      }
      return { status: 404, text: async () => "unexpected" };
    },
  };
  const stop = async () => {
    for (const { child } of sessions.values()) { try { child.kill("SIGKILL"); } catch { /* gone */ } }
    await new Promise((r) => server.close(r));
    rmSync(dir, { recursive: true, force: true });
  };
  return { binding, port, stop, sessions };
}

const ask = (world, path, over = {}) => renderWithBinding(world.binding, {
  url: `https://${HOST}:${world.port}${path}`, navigation_timeout_ms: 15000, wait: { until: "networkidle", timeout_ms: 8000 },
  viewport: { width: 1280, height: 800 }, dpr: 1, locale: "en-US", timezone: "UTC", ...over });
const judge = (a, extra = {}) => renderBlock(a, { pageUrl: a.navigated_to || "https://portal.example.gov/", shellSha: "0".repeat(64), at: "2026-10-24T00:00:00Z", ...extra });

test("R69 R11 (DOCS V4–V7): real Chromium over an offline origin: a page that renders is a document with its copy's statement; a 403, a page the browser refuses, a blank page and a shell that never hydrates are 'the page did not render'; a late hydration, a dialog and a dead connection are as stated", async (t) => {
  const world = await setup();
  if (world.skip) return t.skip(world.skip);
  try {
    /* V4: the page renders (a shell that hydrates from a request answered 1.5 s in is waited for and is a document) */
    const ok = await ask(world, "/ok");
    assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
    assert.equal(ok.status, 200);
    const block = judge(ok);
    assert.equal(block.ok, true);
    assert.ok(block.render.undetermined.includes(RENDER_COPY_STATEMENT));
    const late = await ask(world, "/hydrates");
    assert.equal(late.ok, true);
    assert.ok(late.html.includes(">Hydrated agenda<"), "the page hydrated when its data came, 1.5 s in, and the copy has it");
    assert.equal(judge(late).ok, true);

    /* V5: a 403 with a body answers its status, and is not the document; an empty 404 ends on the browser's own error page */
    const forbidden = await ask(world, "/forbidden");
    assert.equal(forbidden.ok, true);
    assert.equal(forbidden.status, 403);
    const r403 = judge(forbidden);
    assert.equal(r403.ok, false);
    assert.equal(r403.failure_class, "permanent");
    /* an empty 404 is refused by the browser itself (it would show its own error page): the render fails, permanent, with the browser's words */
    const gone = await ask(world, "/gone");
    assert.equal(gone.ok, false);
    assert.equal(gone.failure_class, "permanent");
    assert.match(gone.detail, /ERR_HTTP_RESPONSE_CODE_FAILURE/);
    assert.ok(gone.elapsed_ms > 0);
    assert.equal(judge(gone).ok, false);
    /* a blank page, and a shell that never hydrates: an empty shell */
    for (const path of ["/blank", "/shell"]) {
      const a = await ask(world, path);
      assert.equal(a.ok, true, path);
      const r = judge(a);
      assert.equal(r.ok, false, path);
      assert.equal(r.failure_class, "permanent", path);
    }

    /* V6: a dialog does not hold the render: it is dismissed and the page goes on */
    const dialog = await ask(world, "/dialog");
    assert.equal(dialog.ok, true, JSON.stringify(dialog).slice(0, 300));
    assert.ok(dialog.html.includes("after the dialog"));
    assert.ok(dialog.elapsed_ms < 8000 + 15000);

    /* V7: the host unreachable, the connection reset: a failed render states its real time and its class */
    const t0 = Date.now();
    const reset = await ask(world, "/reset");
    assert.equal(reset.ok, false);
    assert.equal(reset.failure_class, "permanent");
    assert.ok(reset.elapsed_ms > 0 && reset.elapsed_ms <= Date.now() - t0 + 50, String(reset.elapsed_ms));
    assert.ok(reset.detail.length > 0 && reset.detail.length <= 200);
    /* the session is closed on every path: no browser is left running */
    await new Promise((r) => setTimeout(r, 500));
    for (const { child } of world.sessions.values()) assert.notEqual(child.exitCode, null, "the browser was closed");
  } finally { await world.stop(); }
});

test("R70 (SCAN E8): real Chromium loads a page of images and the bodies it collects are kept one turn at a time, each digest the plane's", async (t) => {
  const world = await setup();
  if (world.skip) return t.skip(world.skip);
  try {
    const a = await ask(world, "/images");
    assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
    const images = a.requests.filter((r) => /\/img\//.test(r.url));
    assert.equal(images.length, IMAGES);
    assert.ok(images.every((r) => typeof r.body_base64 === "string"), "every picture came with its bytes");
    let live = 0, peak = 0;
    const held = new Map();
    const out = await keepRenderBodies(a, {
      sha256: async (b) => (await import("node:crypto")).createHash("sha256").update(b).digest("hex"),
      put: async (d, b) => { live++; peak = Math.max(peak, live); await new Promise((r) => setTimeout(r, 5)); held.set(d, b.length); live--; } });
    assert.ok(out.filter((o) => o && o.kept).length >= IMAGES);
    assert.equal([...held.values()].filter((n) => n === IMAGE_BYTES).length, IMAGES);
    assert.ok(peak <= 8);
  } finally { await world.stop(); }
});
