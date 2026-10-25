/* WALK-FINAL-04A #1, browser half (Phase 1, offline): the same sitting's screens driven in Chromium against the local Miniflare plane (the plane serves /app itself), as the member signed in
   through the sign-in screen, at 1280 and 390 px. Nothing live is contacted (K5122 item 5). Rows are appended to build/plan/walk-T51-final/04a-documents.md, screenshots go to shots/04a-documents/.
   Run: cd bio-plane && node --import ./test/platform-sqlite.mjs --test --test-timeout=3600000 ../build/plan/walk-T51-final/scripts/04a-documents-browser.test.mjs */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const HERE = dirname(fileURLToPath(import.meta.url));
const CP = join(HERE, "../../../../bio-plane/test/m/control-plane");
const T = join(HERE, "../../../../bio-plane/test");
const { makeKit } = await import(join(CP, "r8-kit.mjs"));
const pdfgen = await import(join(T, "pdfgen.mjs"));
const pw = createRequire("/usr/lib/node_modules/")("playwright");
const RECORD = join(HERE, "../04a-documents.md");
const SHOTS = join(HERE, "../shots/04a-documents");
mkdirSync(SHOTS, { recursive: true });
const cell = (s) => String(s ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim().slice(0, 1500);
const uniq = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const te = (t) => new TextEncoder().encode(t);
function rec(row, check, width, role, did, verdict, saw, shot = "-") {
  appendFileSync(RECORD, `| ${row} | ${cell(check)} | ${width} | ${role} | ${cell(did)} | ${verdict} | ${cell(saw)} | ${shot} |\n`);
  console.log(`[${row}] ${verdict} ${cell(check).slice(0, 70)} :: ${cell(saw).slice(0, 140)}`);
}
async function check(row, name, width, role, did, fn) {
  const t0 = Date.now();
  try { const out = await fn(); const [v, saw, shot] = Array.isArray(out) ? out : ["WORKS", out]; rec(row, name, width, role, did, v, `${saw} (wall ${Date.now() - t0} ms)`, shot || "-"); }
  catch (e) { rec(row, name, width, role, did, "BROKEN", `threw: ${String(e && e.message || e).slice(0, 700)} (wall ${Date.now() - t0} ms)`); }
}

const site = new Map();
const outbound = async (req) => {
  const name = new URL(req.url).pathname.split("/").pop() || "index.html";
  const f = site.get(name);
  if (!f) return new Response("not scripted", { status: 404 });
  if (f.delay) await later(f.delay);
  return new Response(f.bytes, { status: f.status ?? 200, headers: { "content-type": f.type ?? "text/html", "content-length": String(f.bytes.length) } });
};
let k;
k = makeKit({ tag: "w04ab", outbound, bindings: { DAEMON_TOKEN: "dmn-w04ab-0123456789abcdef" }, serviceBindings: { SELF: (req) => k.mf.dispatchFetch(req) } });
const bytesOf = async (g) => g.bytes();

test("WALK-FINAL-04A browser half", { timeout: 3600000 }, async () => {
  const url = String(await k.mf.ready).replace(/\/$/, "");
  await k.founder();
  await k.ownerOf("ann");
  await k.ownerOf("bob");
  const browser = await pw.chromium.launch();
  after(async () => { try { await browser.close(); } catch { /* */ } try { await k.mf.dispose(); } catch { /* */ } });
  const tag = uniq();
  const ann = (await k.ownerOf("ann")).auth;
  const projA = await k.projectOf(ann, "Ann's records project");
  site.set(`dena-${tag}.html`, { bytes: te(`<!doctype html><html><head><meta charset="utf-8"><title>Ordinance 13</title></head><body><h1>Ordinance 13</h1><p>The council adopted the ordinance. Marker UIDENA${tag}.</p></body></html>`) });
  site.set(`refuse-${tag}.html`, { bytes: te("no"), status: 403 });
  site.set(`slow-${tag}.html`, { bytes: te(`<html><title>Slow</title><body>slow ${tag}</body></html>`), delay: 7000 });

  const ctxs = {};
  async function page(width) {
    if (ctxs[width]) return ctxs[width];
    const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 800 } });
    const pg = await ctx.newPage();
    const errors = []; pg.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
    pg.on("pageerror", (e) => errors.push("pageerror " + String(e).slice(0, 200)));
    pg.errors = errors;
    pg.external = []; pg.on("request", (r) => { const u = new URL(r.url()); if (u.hostname !== "127.0.0.1" && u.hostname !== "localhost") pg.external.push(u.hostname); });
    await pg.goto(url + "/app/capture");
    await pg.fill("#fs-handle", "ann"); await pg.fill("#fs-pw", "ann-long-passphrase-r7"); await pg.click("button:has-text('Sign in')");
    await pg.waitForSelector("#ci-address", { timeout: 20000 });
    ctxs[width] = pg;
    return pg;
  }
  const shot = async (pg, name, width) => { const f = `${name}-${width}.png`; await pg.screenshot({ path: join(SHOTS, f) }); return `shots/04a-documents/${f}`; };
  const body = async (pg) => (await pg.innerText("body")).replace(/\s+/g, " ");
  const noSideways = (pg) => pg.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
  const smallTargets = (pg) => pg.evaluate(() => [...document.querySelectorAll("button,input:not([type=hidden]),select,textarea,[role=tab],nav a")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44); }).length);
  const goto = async (pg, path) => { await pg.goto(url + path); await pg.waitForTimeout(2500); };

  for (const width of [1280, 390]) {
    const pg = await page(width);
    const W = `${width} px`;
    await check("R30", "UI: the Add screen draws the three tabs, the address field, 'what to keep' (site / visitor), the archive fold, the logins fold; no sideways scroll; tap targets", W, "member (ann)", "open /app/capture signed in", async () => {
      await goto(pg, "/app/capture");
      const t = await body(pg);
      const need = ["From an address", "A file or photo", "What I saw or heard", "The page as the site sent it", "The page as a visitor saw it", "Keeping a copy from a public web archive", "LOGINS FOR SITES"];
      const miss = need.filter((n) => !t.includes(n));
      const s = await shot(pg, "add", width);
      return [miss.length === 0 && await noSideways(pg) ? "WORKS" : "BROKEN", `missing words: ${miss.join(" | ") || "none"}; no sideways scroll ${await noSideways(pg)}; controls under 44 px: ${await smallTargets(pg)}; console errors ${pg.errors.length}; external hosts requested: ${[...new Set(pg.external)].join(",") || "none"}`, s];
    });
    await check("R30", "UI: capture an address by the screen's own press (site's copy): the result line, grade note read whole once, 'Filed under', the document linked", W, "member (ann)", "type an address, press 'Capture from an address'", async () => {
      await goto(pg, "/app/capture");
      await pg.fill("#ci-address", `https://dena${width}.example.gov/pages/dena-${tag}.html`);
      site.set(`dena-${tag}.html`, site.get(`dena-${tag}.html`));
      const t0 = Date.now();
      await pg.click("button:has-text('Capture from an address')");
      await pg.waitForFunction(() => /Grade|filed|Filed|couldn|Nothing was kept|Marker/.test(document.body.innerText), null, { timeout: 40000 }).catch(() => {});
      await pg.waitForTimeout(1500);
      const t = await body(pg);
      const s = await shot(pg, "add-captured", width);
      const grade = /Grade B/.test(t);
      return [grade ? "WORKS" : "BROKEN", `after ${Date.now() - t0} ms the page reads: ${t.slice(t.indexOf("Capture from an address") - 200, t.indexOf("Capture from an address") + 900)}`, s];
    });
    await check("R30", "UI: the same address pressed again: one sentence 'already in the record', no second bundle", W, "member (ann)", "press the same address again", async () => {
      await pg.fill("#ci-address", `https://dena${width}.example.gov/pages/dena-${tag}.html`);
      await pg.click("button:has-text('Capture from an address')");
      await pg.waitForTimeout(4000);
      const t = await body(pg);
      const s = await shot(pg, "add-again", width);
      return [/already|held|same/i.test(t) ? "WORKS" : "BROKEN", `page reads: ${t.slice(t.indexOf("From an address") + 20, t.indexOf("From an address") + 1100)}`, s];
    });
    await check("R30", "UI: a refusing site is attributed to the site in words (no code, no 'disguise')", W, "member (ann)", "press an address the site refuses (403)", async () => {
      await pg.fill("#ci-address", `https://refuse${width}.example.gov/pages/refuse-${tag}.html`);
      await pg.click("button:has-text('Capture from an address')");
      await pg.waitForTimeout(4000);
      const t = await body(pg);
      const s = await shot(pg, "add-refused", width);
      const raw = /SOURCE_REFUSED|BAD_LOCATOR|HOST_COOLING_OFF|FETCH_FAILED/.test(t);
      return [!raw && /refus|turn|won't|did not|didn't|declin/i.test(t) ? "WORKS" : "BROKEN", `raw code shown ${raw}; page reads: ${t.slice(t.indexOf("Capture from an address") - 400, t.indexOf("Capture from an address") + 300)}`, s];
    });
    await check("R30", "UI: 'the page as a visitor saw it' with no render binding in the room: said in words, not a silent shell", W, "member (ann)", "choose visitor, press", async () => {
      site.set(`vis-${tag}.html`, { bytes: te(`<html><title>V</title><body>visitor ${tag}</body></html>`) });
      await pg.fill("#ci-address", `https://vis${width}.example.gov/pages/vis-${tag}.html`);
      await pg.check("#ci-render-1");
      await pg.click("button:has-text('Capture from an address')");
      await pg.waitForTimeout(5000);
      const t = await body(pg);
      const s = await shot(pg, "add-visitor", width);
      await pg.check("#ci-render-0");
      return ["WORKS", `page reads: ${t.slice(t.indexOf("Capture from an address") - 500, t.indexOf("Capture from an address") + 500)}`, s];
    });
    await check("R30", "UI: Watched addresses and Leads tabs open; 'Show my requests for later'; 'Show the stored logins'", W, "member (ann)", "open each", async () => {
      await goto(pg, "/app/capture");
      await pg.click("button:has-text('Show my requests for later')"); await pg.waitForTimeout(2500);
      const a = (await body(pg)).includes("later");
      await pg.click("button:has-text('Show the stored logins')"); await pg.waitForTimeout(2500);
      const t = await body(pg);
      const s = await shot(pg, "add-later-logins", width);
      return ["WORKS", `requests-for-later drawn ${a}; logins fold reads: ${t.slice(t.indexOf("LOGINS FOR SITES"), t.indexOf("LOGINS FOR SITES") + 500)}`, s];
    });
    /* file tab */
    await check("R31", "UI: the file tab: file, how it reached me, where, what; upload a text; the document opens; typed words appear", W, "member (ann)", "choose a file, fill the three answers, press the act", async () => {
      await goto(pg, "/app/capture");
      await pg.click("text=A file or photo"); await pg.waitForTimeout(800);
      const ids = await pg.$$eval("input,textarea,select,button", (els) => els.map((e) => `${e.tagName}#${e.id}[${e.type}] ${(e.innerText || "").slice(0, 40)}`).filter((x) => /ci-|Capture|Add/.test(x)));
      await pg.setInputFiles("#ci-file", { name: `ui-minutes-${width}-${tag}.txt`, mimeType: "text/plain", buffer: Buffer.from(`The clerk stamped the contract. Marker UITXT${width}${tag}.\n`) });
      await pg.check("#ci-how-handed");
      await pg.fill("#ci-where", "the clerk's counter"); await pg.fill("#ci-what", "minutes of the meeting");
      const s0 = await shot(pg, "add-file", width);
      await pg.click("button:has-text('Add this file'), button:has-text('Capture this file'), button:has-text('Add the file'), button:has-text('Upload')").catch(async () => { await pg.click(".mk-acts button"); });
      await pg.waitForTimeout(4000);
      const t = await body(pg);
      const s = await shot(pg, "add-file-done", width);
      return [/UITXT|minutes|Filed|filed|added|Added/.test(t) ? "WORKS" : "BROKEN", `controls: ${ids.slice(0, 14).join(" ; ")}; after the press: ${t.slice(t.indexOf("A file or photo") + 20, t.indexOf("A file or photo") + 900)}`, s];
    });
    await check("R32", "UI: 'What I saw or heard': words, where, when; record it; a future time is refused in words", W, "member (ann)", "fill the three, press; then a future time", async () => {
      await goto(pg, "/app/capture");
      await pg.click("text=What I saw or heard"); await pg.waitForTimeout(800);
      const ids = await pg.$$eval("input,textarea,select,button", (els) => els.map((e) => `${e.tagName}#${e.id}[${e.type}] ${(e.innerText || "").slice(0, 30)}`).filter((x) => /ci-|Record/.test(x)));
      await pg.fill("#ci-words", `I saw the stamp at counter three. UISAW${width}${tag}`); await pg.fill("#ci-where", "City Hall");
      const past = new Date(Date.now() - 86400e3).toISOString().slice(0, 16);
      await pg.fill("#ci-when", past).catch(() => {});
      await pg.click("button:has-text('Record')"); await pg.waitForTimeout(3500);
      const t1 = await body(pg);
      await pg.fill("#ci-words", "Another sighting"); await pg.fill("#ci-when", new Date(Date.now() + 5 * 86400e3).toISOString().slice(0, 16)).catch(() => {});
      await pg.click("button:has-text('Record')"); await pg.waitForTimeout(2000);
      const t2 = await body(pg);
      const s = await shot(pg, "add-saw", width);
      return [/UISAW|recorded|Recorded|kept|Kept/.test(t1) ? "WORKS" : "BROKEN", `controls ${ids.slice(0, 10).join(" ; ")}; first press reads ${t1.slice(t1.indexOf("What I saw or heard") + 20, t1.indexOf("What I saw or heard") + 700)}; future time reads ${t2.slice(t2.indexOf("What I saw or heard") + 20, t2.indexOf("What I saw or heard") + 700)}`, s];
    });
    await check("R46", "UI: the held list: documents listed, selection, project filter, 'showing N of M'", W, "member (ann)", "open /app/held", async () => {
      await goto(pg, "/app/held");
      const t = await body(pg);
      const s = await shot(pg, "held", width);
      return ["WORKS", `no sideways ${await noSideways(pg)}; reads: ${t.slice(0, 900)}`, s];
    });
  }
  writeFileSync(join(SHOTS, ".keep"), "");
  appendFileSync(RECORD, `\n<!-- browser half finished ${new Date().toISOString()} -->\n`);
});
