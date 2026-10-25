/* walk-T51-final sitting 03: the real plane under Miniflare, the real pages in Chromium (routed to the plane), as a member's own acts */
import { createRequire } from "node:module";
import { makeKit } from "/home/user/bio/bio-plane/test/m/control-plane/r8-kit.mjs";
export { makeKit };
const req = createRequire("/opt/node-tools/node_modules/noop.js");
export const pw = req("playwright-core");
export const EXE = "/opt/pw-browsers/chromium";
export async function browserFor(kit) {
  const browser = await pw.chromium.launch({ executablePath: EXE });
  async function open(auth, handle, { width = 1280, height = 900, dark = false } = {}) {
    const token = auth.authorization.replace("Bearer ", "");
    const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: dark ? "dark" : "light" });
    await ctx.addInitScript(([t, w]) => { try { localStorage.setItem("bio-session", JSON.stringify({ t, e: 0, d: "own", w })); } catch {} }, [token, handle]);
    const page = await ctx.newPage();
    const log = [];
    const st = [];
    page.on("console", (m) => { if (m.type() === "error") log.push("console: " + m.text().slice(0, 200)); });
    page.on("pageerror", (e) => log.push("pageerror: " + String(e).slice(0, 200)));
    page.on("response", (res) => { try { const u = new URL(res.url()); if (u.pathname.startsWith("/api")) st.push({ op: u.searchParams.get("op"), status: res.status(), st: res.headers()["server-timing"] || "" }); } catch {} });
    await ctx.route("https://group.example/**", async (r) => {
      const rq = r.request();
      const body = rq.postDataBuffer();
      const res = await kit.plane(rq.url(), { method: rq.method(), headers: rq.headers(), ...(body ? { body } : {}) });
      const buf = Buffer.from(await res.arrayBuffer());
      const headers = {}; res.headers.forEach((v, k) => { headers[k] = v; });
      try { await r.fulfill({ status: res.status, headers, body: buf }); } catch { /* the page moved on while the plane was answering */ }
    });
    await ctx.route(/^https?:\/\/(?!group\.example)/, (r) => { log.push("OUTSIDE request: " + r.request().url()); try { r.abort(); } catch {} });
    return { ctx, page, log, st };
  }
  return { browser, open, close: () => browser.close() };
}

export async function dump(page, { max = 3000 } = {}) {
  const info = await page.evaluate(() => {
    const root = document.querySelector("#cs-main") || document.body;
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const txt = (e) => (e.innerText || e.value || e.getAttribute("aria-label") || e.title || "").replace(/\s+/g, " ").trim().slice(0, 80);
    return {
      alerts: [...document.querySelectorAll("[role=alert],[aria-live],.cs-refusal,[class*=refus],[data-state=refused],[class*=toast],[class*=receipt]")].map((e) => (e.innerText || "").replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 8),
      title: document.title,
      sw: document.documentElement.scrollWidth,
      buttons: [...root.querySelectorAll("button,[role=button],input[type=submit]")].filter(vis).map((e) => txt(e) + (e.disabled ? " [disabled]" : "") + (e.dataset && e.dataset.op ? " {op=" + e.dataset.op + "}" : "")),
      links: [...root.querySelectorAll("a[href]")].filter(vis).map((e) => txt(e) + " -> " + e.getAttribute("href")),
      inputs: [...root.querySelectorAll("input,textarea,select")].filter(vis).map((e) => `${e.tagName.toLowerCase()}${e.type ? ":" + e.type : ""}#${e.id || e.name || ""}${e.checked ? " [checked]" : ""} ${(e.labels && e.labels[0] ? e.labels[0].innerText : e.getAttribute("aria-label") || "").slice(0, 60)}`),
    };
  });
  const body = (await page.innerText("#cs-main").catch(() => page.innerText("body"))).replace(/\n{2,}/g, "\n");
  return { ...info, body: body.length > max ? body.slice(0, max >> 1) + "\n…\n" + body.slice(-(max >> 1)) : body };
}
export const show = (d, o = {}) => console.log(`--- ${d.title} (scrollWidth ${d.sw})\n${d.body}\nALERTS: ${(d.alerts||[]).join(" || ")}\nBUTTONS: ${d.buttons.join(" | ")}\nLINKS: ${d.links.join(" | ")}\nINPUTS: ${d.inputs.join(" | ")}`);
export async function settle(page, ms = 1500) {
  try { await page.waitForLoadState("networkidle", { timeout: 8000 }); } catch {}
  await page.waitForTimeout(ms);
}

/* the record: one row per check, the moment it is done */
import { appendFileSync, writeFileSync, existsSync } from "node:fs";
export const OUT = "/home/user/bio/build/plan/walk-T51-final/03-projects.md";
export const SHOTS = "/home/user/bio/build/plan/walk-T51-final/shots/03-projects/";
export const counts = { WORKS: 0, BROKEN: 0, "NOT REACHED": 0, KNOWN: 0 };
const cell = (x) => String(x ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim();
export function rec(id, check, width, role, did, verdict, saw, shot = "") {
  const v = String(verdict).split(" ")[0] === "NOT" ? "NOT REACHED" : String(verdict).split(" ")[0];
  counts[v] = (counts[v] || 0) + 1;
  if (process.env.WALK_REC) appendFileSync(OUT, `| ${[id, check, width, role, did, verdict, saw, shot].map(cell).join(" | ")} |\n`);
  console.log(`ROW ${id} ${verdict}: ${cell(check).slice(0, 90)} || SAW: ${cell(saw).slice(0, 300)}`);
}
export function stSummary(st) {
  const ops = st.length; let worst = 0, worstOp = "";
  for (const e of st) for (const m of String(e.st).matchAll(/(?:^|,)\s*(do-[\w-]+|in-[\w-]+|total)[^,]*?;dur=([\d.]+)/g)) if (+m[2] > worst) { worst = +m[2]; worstOp = e.op + ":" + m[1]; }
  return `${ops} api requests, worst Server-Timing ${worst} ms (${worstOp || "none"})`;
}
export async function shot(page, name) { const f = `${name}.png`; if (!process.env.WALK_REC) return ""; await page.screenshot({ path: SHOTS + f }); return `shots/03-projects/${f}`; }
