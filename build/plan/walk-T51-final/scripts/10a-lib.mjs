/* WALK-FINAL-10A #1: shared helpers for the 10a journey script (record writer, small readers, a PNG maker). Test-side only; no product file is touched. */
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync, crc32 } from "node:zlib";
import { fileURLToPath } from "node:url";

export const OUT = fileURLToPath(new URL("../10a-case.md", import.meta.url));
const rows = [];
let notes = [];
export const J = (x, n = 600) => { try { return JSON.stringify(x).slice(0, n); } catch { return String(x).slice(0, n); } };
export const R = (a) => (a && a.result !== undefined ? a.result : a);
export const reasonOf = (a) => { const r = R(a) || {}; return r.reason || r.code || (a && (a.reason || a.code)) || null; };
export const sayOf = (a) => { const r = R(a) || {}; return String(r.translation || r.detail || r.says || "").replace(/\s+/g, " ").slice(0, 260); };

export function rec(id, check, role, did, verdict, saw, width = "1280") {
  rows.push({ id, check, width, role, did, verdict, saw: String(saw).replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 900), shot: "none (no browser in the offline pass)" });
  flush();
}
export function note(text) { notes.push(text); flush(); }
export function counts() {
  const c = { WORKS: 0, BROKEN: 0, "NOT REACHED": 0, KNOWN: 0 };
  for (const r of rows) { const k = r.verdict.startsWith("KNOWN") ? "KNOWN" : r.verdict; c[k] = (c[k] || 0) + 1; }
  return c;
}
let header = "";
export function setHeader(h) { header = h; flush(); }
export function flush(done = false) {
  const c = counts();
  const body = [
    "# Walk T51 final, sitting 10a (Case to publication, first sitting): offline, through the door", "",
    `Counts: ${rows.length} checks; WORKS ${c.WORKS}; BROKEN ${c.BROKEN}; NOT REACHED ${c["NOT REACHED"]}; KNOWN ${c.KNOWN}. Severity of each BROKEN is in its row (BLOCKER / MAJOR / MINOR).`, "",
    header, "",
    "| row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED | what I saw (Server-Timing: none offline; wall ms where given) | screenshot |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows.map((r) => `| ${r.id} | ${r.check} | ${r.width} | ${r.role} | ${r.did} | ${r.verdict} | ${r.saw} | ${r.shot} |`),
    "", "## Notes", "", ...notes.map((n) => "- " + n), "", done ? "DONE" : "(in progress)", "",
  ].join("\n");
  mkdirSync(fileURLToPath(new URL("..", import.meta.url)), { recursive: true });
  writeFileSync(OUT, body);
}

/* an RGB PNG of w x h whose pixels are a gradient (non-interlaced), the member's "photo" */
export function pngOf(w = 64, h = 48, seed = 1) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = (x * 4 + seed) & 255; raw[o + 1] = (y * 5 + seed * 7) & 255; raw[o + 2] = ((x + y) * 2 + seed * 13) & 255; }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td) >>> 0);
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return new Uint8Array(Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
}
