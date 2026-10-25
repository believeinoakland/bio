/* walk-T51-final sitting 03 (Projects and the daily rhythm), offline: the real plane under Miniflare, the real pages in Chromium routed to it,
   every input made by a member's own acts at the screens (or the same op the screen sends where a screen has no control). Writes one row per
   check to build/plan/walk-T51-final/03-projects.md as it goes (lib.rec). It fixes nothing and contacts no live deployment. */
import { makeKit, browserFor, dump, settle, rec, shot, stSummary } from "./lib.mjs";

export const mainText = (page) => page.innerText("#cs-main").catch(() => page.innerText("body"));
export const has = (t, ...res) => res.every((r) => (r instanceof RegExp ? r.test(t) : t.includes(r)));
export const miss = (t, ...res) => res.filter((r) => !(r instanceof RegExp ? r.test(t) : t.includes(r)));
const clip = (t, n = 260) => String(t).replace(/\s+/g, " ").trim().slice(0, n);

export async function makeWorld({ tag = "w03" } = {}) {
  const k = makeKit({ tag });
  const b = await browserFor(k);
  const c = { k, b, W: {}, H: { f: "admin" }, pages: new Map(), ov: [], P: {}, settle };
  c.person = async (h, caps = null, role = "member") => { c.W[h] = await k.person(h, role, caps); c.H[h] = h; return c.W[h]; };
  c.sess = async (who, width = 1280, dark = false) => {
    const key = `${who}@${width}${dark ? "d" : ""}`;
    if (!c.pages.has(key)) c.pages.set(key, await b.open(c.W[who], c.H[who], { width, dark }));
    return c.pages.get(key);
  };
  c.go = async (who, path, o = {}) => {
    const s = await c.sess(who, o.width, o.dark); s.st.length = 0; s.log.length = 0;
    const t0 = Date.now();
    await s.page.goto("https://group.example" + path);
    await s.page.waitForSelector("#cs-main", { timeout: 15000 }).catch(() => {});
    await settle(s.page, o.ms ?? 1200);
    s.wall = Date.now() - t0; s.width = o.width || 1280; s.who = who; s.path = path;
    return s;
  };
  c.text = async (s) => clip(await mainText(s.page), 100000);
  c.press = async (s, name, o = {}) => { await s.page.getByRole("button", { name, exact: o.exact }).first().click(); await settle(s.page, o.ms ?? 1200); };
  c.start = async (who, title, vis, o = {}) => {
    const s = await c.go(who, o.from || "/app/projects");
    const id = o.from && /home/.test(o.from) ? "home" : "projects";
    await s.page.getByText("Start a project", { exact: true }).first().click(); await settle(s.page, 300);
    await s.page.locator(`#${id}-title`).fill(title);
    if (vis) await s.page.locator(`#${id}-visibility-${vis}`).check();
    await s.page.getByRole("button", { name: "Start the project" }).click(); await settle(s.page, 2200);
    return s;
  };
  c.close = async () => { await b.close(); await k.mf.dispose(); };
  return c;
}

/* ---- the overlay's mechanical checks, made on every screen this sitting reads ---- */
const WORDS = [[/\bgroup\b/i, "group"], [/\bsecret\b/i, "secret"], [/\bconfidential\b/i, "confidential"], [/\bSignal\b/, "Signal"], [/\bObligation\b|\bCondition\b/, "Obligation/Condition chip word"],
  [/\bundefined\b|\bnull\b|\[object|NaN/, "raw value"], [/\b(PROJ|INQ|INFO|THEME|BUN|STD|CASE)-\d{4}-\d+/, "raw id"]];
export async function overlay(c, s, name) {
  const t = await mainText(s.page);
  const info = await s.page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const small = [...document.querySelectorAll("#cs-main button, #cs-main a.cs-btn, #cs-main input[type=checkbox], #cs-main input[type=radio], #cs-main select")].filter(vis)
      .filter((e) => { const r = e.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).length;
    const namelessEls = [...document.querySelectorAll("#cs-main button, #cs-main input, #cs-main select, #cs-main textarea")].filter(vis)
      .filter((e) => !((e.innerText || "").trim() || e.getAttribute("aria-label") || e.getAttribute("title") || (e.labels && e.labels.length) || e.value));
    return { sw: document.documentElement.scrollWidth, title: document.title, small, nameless: namelessEls.length, namelessSample: namelessEls.slice(0, 2).map((e) => e.outerHTML.slice(0, 110)), lang: document.documentElement.lang };
  });
  const rec2 = { name, width: s.width, who: s.who, sw: info.sw, title: info.title, small: info.small, nameless: info.nameless, namelessSample: info.namelessSample, words: [], outside: s.log.filter((l) => l.startsWith("OUTSIDE")), errors: s.log.filter((l) => !l.startsWith("OUTSIDE")), timing: stSummary(s.st), wall: s.wall };
  for (const [re, w] of WORDS) { const m = t.match(re); if (m) rec2.words.push(w + ": " + clip(t.slice(Math.max(0, m.index - 30), m.index + 40), 80)); }
  if (/\boverdue\b/i.test(t) && /^\/app(\/home|\/queue)?$/.test(s.path)) rec2.words.push("overdue on Home/Queue");
  c.ov.push(rec2);
  return rec2;
}

/* a document made as the screens make one: the bytes uploaded (`captureupload`), then filed in the project (the Add screen's own `promoteDocument`) */
import { CAPTURE_SCREEN } from "/home/user/bio/bio-plane/src/screens-intake/capture.mjs";
export async function makeDoc(c, who, project, tag, text) {
  const { k } = c; const auth = c.W[who];
  const bytes = new TextEncoder().encode(text);
  const up = (await (await k.plane(`/api/?op=captureupload&statement=${encodeURIComponent(tag)}&name=${encodeURIComponent(tag)}&type=text%2Fplain`, { method: "POST", headers: auth, body: bytes })).json()).result;
  if (!up || up.ok !== true) throw new Error("upload refused: " + JSON.stringify(up).slice(0, 300));
  const cs = k.screenCall(auth);
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: tag, locator: up.document.locator, project });
  if (filed.refused !== undefined) return { refused: filed.refused, detail: filed };
  return { bundleId: filed.bundleId, sha: k.sha(bytes), up };
}
