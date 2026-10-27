/* image-cover tests: the phone photographs and the workerd process measurements R4 and R12 share. */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fixture, jpegSegments } from "./answers.mjs";

export const MB = 1024 * 1024;

/** The strip's restart segments tiled into a `W` x `H` JPEG (W a multiple of 4032, H of 16), oriented 6 as a phone
 *  held upright writes it. */
export function phoneJpeg(W, H) {
  const strip = fixture("strip-4032x64.jpg");
  const { segs } = jpegSegments(strip);
  const sos = segs.find((s) => s.marker === 0xda);
  const dataAt = sos.body.byteOffset - strip.byteOffset + sos.body.length;
  const pieces = [];
  let p = dataAt, from = dataAt;
  for (; p < strip.length - 1; p++) {
    if (strip[p] !== 0xff) continue;
    const n = strip[p + 1];
    if (n === 0) { p++; continue; }
    if ((n >= 0xd0 && n <= 0xd7) || n === 0xd9) { pieces.push(strip.subarray(from, p)); from = p + 2; p++; if (n === 0xd9) break; }
  }
  assert.equal(pieces.length, 4, "four bands");
  const head = [0xff, 0xd8];
  const exif = [0x45, 0x78, 0x69, 0x66, 0, 0, 0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, 6, 0, 0, 0, 0, 0, 0];
  head.push(0xff, 0xe1, 0, exif.length + 2, ...exif);
  for (const s of segs) {
    let body = [...s.body];
    if (s.marker === 0xc0) { body[1] = H >> 8; body[2] = H & 255; body[3] = W >> 8; body[4] = W & 255; }
    if (s.marker === 0xe0) continue;
    head.push(0xff, s.marker, (body.length + 2) >> 8, (body.length + 2) & 255, ...body);
  }
  const per = W / 4032, n = (H / 16) * per;
  const total = head.length + pieces.reduce((k, x) => k + x.length, 0) * (n / 4 + 1) + 2 * n + 2;
  const out = new Uint8Array(total);
  out.set(head);
  let o = head.length;
  for (let i = 0; i < n; i++) {
    const band = Math.floor(i / per);
    out.set(pieces[band % 4], o); o += pieces[band % 4].length;
    out[o++] = 0xff; out[o++] = i === n - 1 ? 0xd9 : 0xd0 + (i & 7);
  }
  return out.subarray(0, o);
}

/* The workerd process Miniflare started: the child of this process whose command is workerd. */
export function workerdPid() {
  for (const d of readdirSync("/proc")) {
    if (!/^\d+$/.test(d)) continue;
    try {
      const stat = readFileSync(`/proc/${d}/stat`, "utf8");
      const ppid = Number(stat.slice(stat.lastIndexOf(")") + 2).split(" ")[1]);
      if (ppid === process.pid && readFileSync(`/proc/${d}/cmdline`, "utf8").includes("workerd")) return Number(d);
    } catch {}
  }
  throw new Error("no workerd child process");
}
export const status = (pid, key) => Number(readFileSync(`/proc/${pid}/status`, "utf8").match(new RegExp(`${key}:\\s+(\\d+) kB`))[1]) * 1024;

