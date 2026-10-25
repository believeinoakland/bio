/* Journey helpers for the walk of sitting 01 (K5122): the plane under Miniflare, a real Chromium on its address, the record file. */
import { makeKit } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
export const pw = createRequire(import.meta.url)("playwright");
export const HERE = dirname(fileURLToPath(import.meta.url));
export const OUT = join(HERE, "..");
export const SHOTS = join(OUT, "shots", "01-install");
mkdirSync(SHOTS, { recursive: true });
export { makeKit };
export const later = (ms) => new Promise((r) => setTimeout(r, ms));

/* the record: one row per check the moment it is done; the whole file is rewritten after each row so it is complete at any stop */
const RECORD = join(OUT, "01-install.md");
export const counts = { WORKS: 0, BROKEN: 0, "NOT REACHED": 0, KNOWN: 0 };
export const severities = [];   /* { row, sev, text } */
const rows = [];
const notes = [];
let head = "";
const TABLE = "| row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED | what I saw (Server-Timing, wall) | screenshot |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n";
function flush(done = false) {
  const c = counts;
  const top = `# Final pass of T51, sitting 01 (Install, claim, set up the room): offline walk, WALK-FINAL-01 #1\n\n**Counts** · rows ${rows.length}: WORKS ${c.WORKS}, BROKEN ${c.BROKEN}, KNOWN ${c.KNOWN}, NOT REACHED ${c["NOT REACHED"]}. Defects by severity: ${["BLOCKER","MAJOR","MINOR"].map((k) => k + " " + severities.filter((x) => x.sev === k).length).join(", ")}.\n\n${head}\n\n## Rows\n\n${TABLE}`;
  const defects = severities.length ? `\n\n## Defects (for BOB to place with K4426's four fields)\n\n${severities.map((d, i) => `${i + 1}. **${d.sev}** · ${d.row} · ${d.text}`).join("\n")}\n` : "";
  const nts = notes.length ? `\n\n## Notes\n\n${notes.map((n) => "- " + n).join("\n")}\n` : "";
  writeFileSync(RECORD, top + rows.join("") + defects + nts + (done ? "\nDONE\n" : "\n(walk in progress)\n"));
}
export function startRecord(h) { head = h; flush(); }
export function note(t) { notes.push(t); flush(); }
export function finish() { flush(true); }
export function rec(row, check, width, role, did, verdict, saw, shot = "", defect = null) {
  const v = verdict.split(" ")[0] === "NOT" ? "NOT REACHED" : verdict.split(" ")[0];
  counts[v] = (counts[v] || 0) + 1;
  if (defect) severities.push({ row, sev: defect[0], text: `${check}: ${defect[1]}` });
  const cell = (x) => String(x).replace(/\|/g, "\\|").replace(/\n+/g, " ").slice(0, 1600);
  rows.push(`| ${row} | ${cell(check)} | ${width} | ${role} | ${cell(did)} | ${verdict}${defect ? " (" + defect[0] + ")" : ""} | ${cell(saw)} | ${shot} |\n`);
  flush();
  console.log(`${verdict.padEnd(12)} ${row} ${check}`);
}
export const ST = (res) => res.headers && res.headers.get ? (res.headers.get("server-timing") || "") : "";
export function stSummary(res) { const s = ST(res); const m = {}; for (const part of s.split(",")) { const [k, ...r] = part.trim().split(";"); const d = (r.find((x) => x.startsWith("dur=")) || "").slice(4); if (k && d) m[k] = d; } return Object.entries(m).filter(([k]) => /^(do-|in-)/.test(k)).map(([k, v]) => `${k}=${v}`).join(" ") || "-"; }

export async function launch() { return pw.chromium.launch(); }
export async function pageAt(browser, url, { width = 1280, height = 900, storage = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, ...(storage ? { storageState: storage } : {}) });
  const p = await ctx.newPage();
  p.errs = [];
  p.on("pageerror", (e) => p.errs.push("pageerror: " + e.message));
  p.on("console", (m) => { if (m.type() === "error") p.errs.push("console: " + m.text().slice(0, 200)); });
  p.on("requestfailed", (r) => p.errs.push("requestfailed: " + r.url().slice(0, 120)));
  p.outside = [];
  p.on("request", (r) => { try { const u = new URL(r.url()); if (!["127.0.0.1", "localhost"].includes(u.hostname) && u.protocol.startsWith("http")) p.outside.push(r.url()); } catch {} });
  return p;
}
export async function shot(p, name) { const f = `${name}.png`; await p.screenshot({ path: join(SHOTS, f) }); return `shots/01-install/${f}`; }
export async function metrics(p) {
  return p.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const over = document.documentElement.scrollWidth > w + 1;
    const small = [...document.querySelectorAll("button, a, input, select, textarea, [role=button], [role=tab]")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44) && !(e.tagName === "A" && e.closest("p, li, span") && !e.closest("nav")); }).length;
    const cut = [...document.querySelectorAll("*")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > w + 2 && getComputedStyle(e).position !== "fixed"; }).length;
    const noname = [...document.querySelectorAll("button, a[href], [role=button]")].filter((e) => !((e.innerText || "").trim() || e.getAttribute("aria-label") || e.getAttribute("title"))).length;
    return { w, scrollW: document.documentElement.scrollWidth, over, smallTargets: small, beyondRight: cut, unnamed: noname, text: document.body.innerText.length };
  });
}
