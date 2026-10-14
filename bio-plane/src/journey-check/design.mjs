/* journey-check R6: each working screen beside the design mock's drawing of it, at 1280 and 390 px, and the limits a live
   page fails on. The mock is `layouts.html` as committed at the interface's `ASSETS_COMMIT` (read from git, so the
   working copy never moves it), drawn through its own walker (`CS_WALK`) in screen mode with the assistant off: `phone`
   at 390, `desktop` at 1280. Each pair is one image, LIVE on the left and DESIGN on the right, as WALK-084 #2 made them,
   in the arm's `pairs/` directory; the report lists them for BOB, who records the comparison before a release is called
   ready. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const MOCK_PATH = "docs/development/ux-substrate/layouts.html";
/* interface-assets' own file, read as data (journey-check imports no module) */
export const ASSETS_FILE = join(ROOT, "bio-plane", "src", "interface-assets", "index.mjs");
export const WIDTHS = Object.freeze([1280, 390]);
export const PHONE = 390;
const HEIGHT = { 1280: 900, 390: 844 };
export const viewportOf = (width) => ({ width, height: HEIGHT[width] || 900 });

export const LIMIT = Object.freeze({ WIDER: "wider", TABS: "tabs", BAND: "band", CLASS: "class", WORDS: "words" });

/* The commit the interface's assets are built from. */
export function assetsCommit(file = ASSETS_FILE) {
  const m = /export const ASSETS_COMMIT = "([0-9a-f]{7,40})"/.exec(readFileSync(file, "utf8"));
  if (!m) throw new Error(`no ASSETS_COMMIT in ${file}`);
  return m[1];
}

/* What a person must never read on a screen (R6; WALK-084 #2's C8): a slug, a language tag, a record id, a refusal code.
   `slugs` are the instance's own short names, matched as words. */
const SLUG = /\b(?:[a-z]+[0-9][a-z0-9]*|[0-9]+[a-z][a-z0-9]*|[a-z0-9]+)(?:-[a-z0-9]+)+\b/g;
const WORDS = [
  ["a record id", /\b[A-Z]{2,6}-\d{4}-(?:\d{4,}|[a-z0-9]{16})\b/g],
  ["a refusal code", /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g],
  ["a language tag", /\b[a-z]{2,3}(?:-[A-Z][a-z]{3})?-(?:[A-Z]{2}|\d{3})\b|\b[a-z]{2,3}-[A-Z][a-z]{3}\b/g],
  ["a slug", /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g],
];
/* English compounds of three parts that a screen's words may use: words, not slugs */
export const COMPOUNDS = Object.freeze(["step-by-step", "side-by-side", "up-to-date", "out-of-date", "day-to-day", "face-to-face",
  "end-to-end", "one-on-one", "word-for-word", "hand-in-hand", "mother-in-law", "father-in-law"]);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* The developer words in `text`: `[{what, word}]`, each word once. A hyphenated lowercase word is a slug when it holds a
   letter and a digit, or three or more parts; English compounds of two parts ("sign-in"), those of `COMPOUNDS` and dates
   are words. */
export function developerWords(text, { slugs = [] } = {}) {
  const t = String(text);
  const found = new Map();
  const add = (what, word) => { if (!found.has(word)) found.set(word, { what, word }); };
  /* a word inside an address (a host, a path, an e-mail) is the address, shown as one */
  const inAddress = (m) => /[\w-][./@:]$|[/@]$/.test(t.slice(Math.max(0, m.index - 2), m.index)) || /^[./@:][\w-]/.test(t.slice(m.index + m[0].length, m.index + m[0].length + 2));
  for (const [what, re] of WORDS) for (const m of t.matchAll(re)) if (!inAddress(m)) add(what, m[0]);
  const within = (m) => [...found.values()].some((f) => f.word.includes(m[0]));
  for (const m of t.matchAll(SLUG))
    if (/[a-z]/.test(m[0]) && (/\d/.test(m[0]) || (m[0].split("-").length >= 3 && !COMPOUNDS.includes(m[0]))) && !inAddress(m) && !within(m)) add("a slug", m[0]);
  for (const s of slugs.filter(Boolean)) for (const m of t.matchAll(new RegExp(`(?<![\\w-])${esc(s)}(?![\\w-])`, "g"))) if (!inAddress(m)) add("a slug", m[0]);
  return [...found.values()];
}

/* The limits page `page` breaks, measured as it stands at viewport width `width`: `[{kind, detail}]`. */
export async function pageLimits(page, { width, slugs = [] }) {
  const m = await page.evaluate((phone) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const wide = Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0);
    const shown = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
    const tabsAt = () => { const t = [...document.querySelectorAll(".cs-tabs")].find(shown); return t ? Math.round(t.getBoundingClientRect().bottom) : null; };
    let tabs = null;
    if (phone) {
      window.scrollTo(0, 0); const top = tabsAt();
      window.scrollTo(0, document.documentElement.scrollHeight); const end = tabsAt();
      window.scrollTo(0, 0);
      tabs = { top, end, vh };
    }
    const band = [...document.querySelectorAll(".cs-testband")].find(shown);
    const frame = band && (band.closest(".cs-frame") || document.getElementById("cs-frame") || document.body);
    const bandW = band ? { band: Math.round(band.getBoundingClientRect().width), frame: Math.round(frame.getBoundingClientRect().width) } : null;
    /* every class a loaded stylesheet's selector names, through nested rules */
    const defined = new Set();
    const walk = (rules) => { for (const r of rules || []) {
      if (r.selectorText) for (const c of r.selectorText.matchAll(/\.((?:\\.|[\w-])+)/g)) defined.add(c[1].replace(/\\(.)/g, "$1"));
      try { if (r.cssRules) walk(r.cssRules); } catch {}
    } };
    for (const s of document.styleSheets) { try { walk(s.cssRules); } catch {} }
    const undefinedClasses = new Map();
    for (const e of document.querySelectorAll("[class]")) for (const c of e.classList)
      if (!defined.has(c) && !undefinedClasses.has(c)) undefinedClasses.set(c, e.tagName.toLowerCase());
    return { vw, wide, tabs, bandW, undefinedClasses: [...undefinedClasses], text: document.body ? document.body.innerText : "" };
  }, width <= PHONE);
  const out = [];
  if (m.wide > m.vw + 1) out.push({ kind: LIMIT.WIDER, detail: `the page is ${m.wide}px wide in a ${m.vw}px viewport` });
  if (m.tabs) {
    const at = (y) => y !== null && Math.abs(y - m.tabs.vh) <= 1;
    if (m.tabs.top === null) out.push({ kind: LIMIT.TABS, detail: `no tabs are drawn at ${width}px` });
    else if (!at(m.tabs.top) || !at(m.tabs.end))
      out.push({ kind: LIMIT.TABS, detail: `the tabs end at ${m.tabs.top}px at the top and ${m.tabs.end}px at the end, not at the viewport's foot (${m.tabs.vh}px)` });
  }
  if (m.bandW && m.bandW.band < m.bandW.frame - 1) out.push({ kind: LIMIT.BAND, detail: `the test band is ${m.bandW.band}px wide in a ${m.bandW.frame}px frame` });
  for (const [c, tag] of m.undefinedClasses) out.push({ kind: LIMIT.CLASS, detail: `${tag}.${c}: no loaded stylesheet defines the class` });
  for (const w of developerWords(m.text, { slugs })) out.push({ kind: LIMIT.WORDS, detail: `the page shows ${w.what}: ${w.word}` });
  return out;
}

/* The design mock: `layouts.html` at `commit`, written into `dir` and opened in its own browser context. `draw(id, width)`
   answers its drawing of screen `id` as PNG bytes, or `null` when the mock draws no such screen; drawings are kept. */
export async function designMock(b, { dir, commit = assetsCommit(), root = ROOT } = {}) {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `layouts-${commit}.html`);
  writeFileSync(file, execFileSync("git", ["-C", root, "show", `${commit}:${MOCK_PATH}`], { maxBuffer: 64 << 20 }));
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1200 } });
  /* the mock's own file only: its web fonts are not fetched */
  await ctx.route("**/*", (r) => (r.request().url().startsWith("file:") ? r.continue() : r.abort("blockedbyclient")));
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(file).href);
  await page.waitForFunction(() => !!window.CS_WALK, null, { timeout: 15000 });
  const kept = new Map();
  return {
    commit,
    async draw(id, width) {
      const key = `${id}@${width}`;
      if (kept.has(key)) return kept.get(key);
      const ok = await page.evaluate(([id, dev]) => {
        if (!REG.some((r) => r.id === id)) return false;
        const W = window.CS_WALK; Object.assign(W.st, { mode: "screen", id, ai: false, dev, step: 0 }); W.draw();
        /* the mock scales its drawing to fit its column; the pair holds it at its own size */
        const sc = document.getElementById("vscale"), box = document.getElementById("vdev");
        sc.style.transform = "none";
        Object.assign(box.style, { width: "max-content", height: "auto", overflow: "visible" });
        return true;
      }, [id, width <= PHONE ? "phone" : "desktop"]);
      const png = ok ? await page.locator("#vscale").screenshot() : null;
      kept.set(key, png);
      return png;
    },
    close: () => ctx.close().catch(() => {}),
  };
}

/* One image of `live` beside `design` (PNG bytes), LIVE on the left and DESIGN on the right, written to `file`. */
export async function pair(b, live, design, file, { title = "" } = {}) {
  mkdirSync(dirname(file), { recursive: true });
  const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
  try {
    const page = await ctx.newPage();
    const img = (png) => `data:image/png;base64,${png.toString("base64")}`;
    await page.setContent(`<!doctype html><html><body style="margin:0;font:14px sans-serif;background:#fff">
<div id="pair" style="display:flex;width:max-content;gap:24px;padding:16px;align-items:flex-start">
<figure style="margin:0;flex:none"><figcaption><b>LIVE</b> ${title.replace(/[<>&]/g, "")}</figcaption><img style="display:block" src="${img(live)}"></figure>
<figure style="margin:0;flex:none"><figcaption><b>DESIGN</b></figcaption><img style="display:block" src="${img(design)}"></figure></div></body></html>`);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
    await page.locator("#pair").screenshot({ path: file });
  } finally { await ctx.close().catch(() => {}); }
  return file;
}
