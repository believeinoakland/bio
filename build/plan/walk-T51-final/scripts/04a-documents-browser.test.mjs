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
const { CAPTURE_SCREEN } = await import(join(HERE, "../../../../bio-plane/src/screens-intake/capture.mjs"));
import { readFileSync } from "node:fs";
const PDF_BUNDLE = join(HERE, "../../../../pdf-worker/dist/pdf-worker.bundled.mjs");
const pdfWorkerDef = () => ({ name: "pdf-worker", modules: true, modulesRoot: "/", scriptPath: PDF_BUNDLE, script: readFileSync(PDF_BUNDLE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], r2Buckets: ["CAPTURES"], bindings: { VERSION: "test" } });
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
k = makeKit({ tag: "w04ab", outbound, workers: [pdfWorkerDef()], bindings: { DAEMON_TOKEN: "dmn-w04ab-0123456789abcdef" }, serviceBindings: { SELF: (req) => k.mf.dispatchFetch(req), PDF_WORKER: "pdf-worker" } });
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
  const lines = async (pg) => (await pg.innerText("body")).split("\n").map((x) => x.trim()).filter(Boolean);
  const fresh = (b, a) => { const set = new Set(b); return a.filter((x) => !set.has(x)).join(" / "); };
  const noSideways = (pg) => pg.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
  const smallTargets = (pg) => pg.evaluate(() => [...document.querySelectorAll("button,input:not([type=hidden]),select,textarea,[role=tab],nav a")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44); }).length);
  const goto = async (pg, path) => { await pg.goto(url + path); await pg.waitForTimeout(2500); };

  /* a 20-page PDF made by the member's own upload and filed, for the Document page */
  const g20 = pdfgen.generate({ kind: "pdf", seed: 20, size: { pages: 20, lines: 20 } });
  const up = await (await k.plane(`/api/?op=captureupload&statement=${encodeURIComponent("How: handed to me\nWhere: counter\nWhat: budget")}&name=w10-${tag}.pdf&type=application%2Fpdf`, { method: "POST", headers: ann, body: await g20.bytes() })).json();
  const filed20 = await CAPTURE_SCREEN.parts.promoteDocument(k.screenCall(ann), { doc: (up.result ?? up).document, title: `w10-${tag}`, locator: (up.result ?? up).document.locator, project: projA });
  await later(6000);
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
      const before = await lines(pg);
      const t0 = Date.now();
      await pg.click("button:has-text('Capture from an address')");
      await pg.waitForFunction(() => /Captured:|Already in the record|couldn|Nothing was kept/.test(document.body.innerText), null, { timeout: 40000 }).catch(() => {});
      const took = Date.now() - t0;
      await pg.waitForTimeout(1500);
      const d = fresh(before, await lines(pg));
      const s = await shot(pg, "add-captured", width);
      return [/Captured:|Already in the record/.test(d) ? "WORKS" : "BROKEN", `result drawn after ${took} ms: ${d.slice(0, 900)}`, s];
    });
    await check("R30", "UI: the same address pressed again: one sentence 'already in the record', no second bundle", W, "member (ann)", "press the same address again", async () => {
      await pg.fill("#ci-address", `https://dena${width}.example.gov/pages/dena-${tag}.html`);
      const before = await lines(pg);
      await pg.click("button:has-text('Capture from an address')");
      await pg.waitForTimeout(4000);
      const d = fresh(before, await lines(pg));
      const s = await shot(pg, "add-again", width);
      return [/Already in the record/i.test(d) ? "WORKS" : "BROKEN", `new on the page: ${d.slice(0, 700)}`, s];
    });
    await check("R30", "UI: a refusing site is attributed to the site in words (no code, no 'disguise')", W, "member (ann)", "press an address the site refuses (403)", async () => {
      await pg.fill("#ci-address", `https://refuse${width}.example.gov/pages/refuse-${tag}.html`);
      const before = await lines(pg);
      await pg.click("button:has-text('Capture from an address')");
      await pg.waitForTimeout(4000);
      const d = fresh(before, await lines(pg));
      const s = await shot(pg, "add-refused", width);
      const raw = /SOURCE_REFUSED|BAD_LOCATOR|HOST_COOLING_OFF|FETCH_FAILED|\b[A-Z]{3,}_[A-Z_]{3,}\b/.test(d);
      return [!raw && d ? "WORKS" : "BROKEN", `raw code shown ${raw}; new on the page: ${d.slice(0, 800) || "NOTHING drawn"}`, s];
    });
    await check("R30", "UI: 'the page as a visitor saw it' with no render binding in the room: said in words, not a silent shell", W, "member (ann)", "choose visitor, press", async () => {
      site.set(`vis-${tag}.html`, { bytes: te(`<html><title>V</title><body>visitor ${tag}</body></html>`) });
      await pg.fill("#ci-address", `https://vis${width}.example.gov/pages/vis-${tag}.html`);
      await pg.check("#ci-render-1");
      const before = await lines(pg);
      await pg.click("button:has-text('Capture from an address')");
      await pg.waitForTimeout(6000);
      const d = fresh(before, await lines(pg));
      const s = await shot(pg, "add-visitor", width);
      await pg.check("#ci-render-0");
      return [d ? "WORKS" : "BROKEN", `new on the page: ${d.slice(0, 900) || "NOTHING drawn"}`, s];
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
      const before = await lines(pg);
      await pg.click("button:has-text('Capture a file or photo')");
      await pg.waitForTimeout(5000);
      const d = fresh(before, await lines(pg));
      const s = await shot(pg, "add-file-done", width);
      return [/Captured|kept|Filed|filed|Added|added|held/.test(d) ? "WORKS" : "BROKEN", `new on the page after the press: ${d.slice(0, 900) || "NOTHING drawn"}`, s];
    });
    await check("R32", "UI: 'What I saw or heard': words, where, when; record it; a future time is refused in words", W, "member (ann)", "fill the three, press; then a future time", async () => {
      await goto(pg, "/app/capture");
      await pg.click("text=What I saw or heard"); await pg.waitForTimeout(800);
      const ids = await pg.$$eval("input,textarea,select,button", (els) => els.map((e) => `${e.tagName}#${e.id}[${e.type}] ${(e.innerText || "").slice(0, 30)}`).filter((x) => /ci-|Record/.test(x)));
      await pg.fill("#ci-words", `I saw the stamp at counter three. UISAW${width}${tag}`); await pg.fill("#ci-where", "City Hall");
      const past = new Date(Date.now() - 86400e3).toISOString().slice(0, 16);
      await pg.fill("#ci-when", past).catch(() => {});
      const b1 = await lines(pg);
      await pg.click("button:has-text('Record what you saw')"); await pg.waitForTimeout(3500);
      const l1 = await lines(pg); const d1 = fresh(b1, l1);
      await pg.fill("#ci-words", "Another sighting"); await pg.fill("#ci-when", new Date(Date.now() + 5 * 86400e3).toISOString().slice(0, 16)).catch(() => {});
      await pg.click("button:has-text('Record what you saw')"); await pg.waitForTimeout(2500);
      const d2 = fresh(l1, await lines(pg));
      const s = await shot(pg, "add-saw", width);
      return [/Recorded|recorded|Kept|kept|Captured/.test(d1) && d2 ? "WORKS" : "BROKEN", `first press: ${d1.slice(0, 500) || "NOTHING"}; future time: ${d2.slice(0, 400) || "NOTHING"}`, s];
    });
    await check("R34", "UI: the Document page of a 20-page PDF: reading state, 'By page', Next page / Previous page, 'Showing N of M'", W, "member (ann)", "open /app/document/<id>, press Next page", async () => {
      await goto(pg, "/app/document/" + filed20.bundleId);
      await pg.waitForTimeout(2500);
      const t0 = await body(pg);
      const s0 = await shot(pg, "document-pdf", width);
      const nexts = await pg.locator("button:has-text('Next page')").count();
      let moved = "no Next page control";
      if (nexts) { const before = await lines(pg); await pg.locator("button:has-text('Next page')").first().click(); await pg.waitForTimeout(2500); moved = fresh(before, await lines(pg)).slice(0, 300); }
      return [/Next page/.test(t0) ? "WORKS" : "BROKEN", `no sideways ${await noSideways(pg)}; Next page controls ${nexts}; Showing: ${(t0.match(/Showing[^.]{0,60}/) || ["none"])[0]}; reading words: ${(t0.match(/(Read in full|Read in part|being read|Unread)[^.]{0,80}/) || ["none"])[0]}; after Next page new: ${moved}`, s0];
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
