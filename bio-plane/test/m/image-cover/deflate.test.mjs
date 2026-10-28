/* image-cover R12 (T53-513): the streaming compressor the redraw feeds its rows to. Its streams are read back by node's zlib,
 * an inflater that shares no line with it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Deflater } from "../../../src/image-cover/deflate.mjs";
import { redrawPicture } from "../../../src/image-cover/index.mjs";
import { fixture } from "./answers.mjs";

let seed = 7;
const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
const MiB = 1048576;
const deflate = (data, step = 12347, onOver = () => {}) => {
  const z = new Deflater(onOver);
  for (let o = 0; o < data.length; o += step) z.push(data.subarray(o, o + step));
  return z.finish();
};

test("R12 the compressor's streams inflate to the input, whatever the input: empty, one byte, runs, text, random, skewed symbols, band edges", () => {
  const cases = {
    empty: new Uint8Array(0), one: Uint8Array.of(5), zeros: new Uint8Array(3_000_000), random: Uint8Array.from({ length: 700_000 }, () => rnd() * 256),
    text: Uint8Array.from({ length: 900_000 }, (_, i) => 97 + (((i * i) >> 3) % 7)),
    skew: Uint8Array.from({ length: 600_000 }, () => Math.floor(-Math.log(rnd() + 1e-9) * 2) & 255),
    band: new Uint8Array(262144).fill(9), bandPlus: Uint8Array.from({ length: 262144 * 2 + 5 }, (_, i) => i % 251),
    fibonacci: (() => { const a = []; let x = 1, y = 1; for (let s = 0; s < 40; s++) { for (let k = 0; k < Math.min(x, 200000); k++) a.push(s); [x, y] = [y, x + y]; } return Uint8Array.from(a); })(),
  };
  for (const [name, d] of Object.entries(cases)) {
    const { parts, total } = deflate(d);
    const z = Buffer.concat(parts);
    assert.equal(z.length, total, name);
    assert.equal(Buffer.compare(inflateSync(z), Buffer.from(d)), 0, name);
  }
});

test("R12 the pieces pushed make no difference: one push, row-sized pushes and odd-sized pushes give the same stream", () => {
  const d = Uint8Array.from({ length: 500_000 }, (_, i) => (i * 7 + (i >> 5)) & 255);
  const a = Buffer.concat(deflate(d, d.length).parts), b = Buffer.concat(deflate(d, 12096).parts), c = Buffer.concat(deflate(d, 4097).parts);
  assert.deepEqual(a, b);
  assert.deepEqual(a, c);
});

test("R12 the compressor stops the moment its output passes the bound it was given, and keeps nothing past it", () => {
  const d = Uint8Array.from({ length: 2 * MiB }, () => rnd() * 256);
  let seen = 0;
  assert.throws(() => deflate(d, 12347, (total) => { seen = total; if (total > MiB / 2) throw new RangeError("over"); }), RangeError);
  assert.ok(seen > MiB / 2 && seen < MiB, `stopped at ${seen}`);
});

test("R6 pure: the same input, the same stream", () => {
  const d = Uint8Array.from({ length: 300_000 }, (_, i) => (i * i) & 255);
  assert.deepEqual(Buffer.concat(deflate(d).parts), Buffer.concat(deflate(d).parts));
});

test("R12 the redraw's working set is a band of rows, never the bitmap: a flat 12 MP photograph's redraw grows the process by far less than its 36 MB bitmap", () => {
  const photo = fileURLToPath(new URL("./fixtures/photo-flat-12mp.jpg", import.meta.url));
  const child = fileURLToPath(new URL("./peak-child.mjs", import.meta.url));
  const run = spawnSync(process.execPath, [child, photo], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const r = JSON.parse(run.stdout);
  assert.equal(r.ok, true, r.code);
  assert.deepEqual([r.width, r.height], [4032, 3024]);
  assert.ok(r.out < MiB, "the answer is small, so its memory is not the answer's");
  const bitmap = r.width * r.height * 3;
  assert.ok(r.growth_kb * 1024 < bitmap * 0.75, `the peak grew ${(r.growth_kb / 1024).toFixed(1)} MB, a bitmap is ${(bitmap / MiB).toFixed(1)} MB`);
});

test("R12 a redraw is the same bytes however it is fed: the photograph and its copy answer the same picture", async () => {
  const a = await redrawPicture(fixture("photo-full.jpg")), b = await redrawPicture(Uint8Array.from(fixture("photo-full.jpg")));
  assert.deepEqual(a.bytes, b.bytes);
});
