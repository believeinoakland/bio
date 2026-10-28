/* ooxml's MS-CFB reader as a service (R39; T53-524; K5629): `readCfb`, `hasCfbMagic` and `CFB_MAGIC`, the one reader of a compound file for the
 * VBA project read here and for an Outlook MSG in `mail-reader`. The files are written by ./cfb.mjs from MS-CFB, independent of the module. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readCfb, hasCfbMagic, CFB_MAGIC } from "../../../src/ooxml.mjs";
import { makeCfb, makeVbaProject } from "./cfb.mjs";

const latin1 = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const bytesOf = (n, seed) => new Uint8Array(n).map((_, i) => (i * 31 + seed) & 255);

test("R39 T53-524 readCfb gives the root, each storage's children in directory order and each stream's bytes, mini and regular", () => {
  const small = bytesOf(100, 1), exact = bytesOf(4095, 2), big = bytesOf(9000, 3), empty = new Uint8Array(0);
  const { bytes } = makeCfb({ Top: small, Folder: { inner: exact, deeper: { leaf: big } }, Zero: empty });
  const cfb = readCfb(bytes);
  assert.ok(cfb);
  assert.deepEqual([cfb.root.name, cfb.root.type], ["Root Entry", 5]);
  const top = cfb.children(cfb.root);
  assert.deepEqual(top.map((e) => [e.name, e.type]).sort(), [["Folder", 1], ["Top", 2], ["Zero", 2]]);
  assert.deepEqual(top.map((e) => e.id), top.map((e) => e.id).sort((a, b) => a - b));
  const named = (list, name) => list.find((e) => e.name === name);
  assert.deepEqual(cfb.stream(named(top, "Top")), small);
  assert.deepEqual(cfb.stream(named(top, "Zero")), empty);
  const folder = named(top, "Folder");
  assert.deepEqual(cfb.stream(named(cfb.children(folder), "inner")), exact);
  const deeper = named(cfb.children(folder), "deeper");
  assert.deepEqual(cfb.stream(named(cfb.children(deeper), "leaf")), big);
  // a storage has no bytes, a stream has no children
  assert.equal(cfb.stream(folder), null);
  assert.deepEqual(cfb.children(named(top, "Top")), []);
});

test("R39 T53-524 readCfb refuses what is not a well-formed compound file with null, and never throws", () => {
  const good = makeVbaProject({ modules: [{ name: "M", source: "Sub AutoOpen()\r\nEnd Sub" }] });
  for (const bad of [undefined, null, "text", [1, 2, 3], new Uint8Array(0), latin1("not a compound file"), new Uint8Array(4096), good.bytes.subarray(0, 511)]) {
    assert.equal(readCfb(bad), null, String(bad));
  }
  const patch = (at, value, width = 4) => {
    const b = good.bytes.slice();
    const v = new DataView(b.buffer);
    if (width === 2) v.setUint16(at, value, true); else v.setUint32(at, value, true);
    return b;
  };
  const dir = 512 * (good.dirSector + 1), dirFat = good.fatOffset + 4 * good.dirSector;
  for (const [what, b] of [
    ["byte order", patch(0x1c, 0xfeff, 2)], ["sector shift", patch(0x1e, 10, 2)], ["mini sector shift", patch(0x20, 7, 2)],
    ["mini cutoff", patch(0x38, 2048)], ["directory past the file", patch(0x30, 9999)], ["FAT sector past the file", patch(0x4c, 9999)],
    ["FAT count", patch(0x2c, 9999)], ["directory chain loops", patch(dirFat, good.dirSector)], ["chain into a free sector", patch(dirFat, 0xffffffff)],
    ["root is not a root", patch(dir + 0x42, 1, 2)], ["a stream's chain leaves the mini stream", patch(dir + 128 + 0x74, 9999)],
    ["the directory tree loops", patch(dir + 128 + 0x48, 1)],
  ]) assert.equal(readCfb(b), null, what);
  // and the file itself reads
  assert.ok(readCfb(good.bytes));
});

test("R39 T53-524 hasCfbMagic is true iff the first eight bytes are the compound-file signature; CFB_MAGIC is that signature, frozen", () => {
  assert.deepEqual([...CFB_MAGIC], [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  assert.ok(Object.isFrozen(CFB_MAGIC));
  const file = makeCfb({ a: bytesOf(10, 4) }).bytes;
  assert.equal(hasCfbMagic(file), true);
  assert.equal(hasCfbMagic(file.subarray(0, 8)), true);
  assert.equal(hasCfbMagic(file.subarray(0, 7)), false);
  for (const bad of [null, undefined, "x", [0xd0, 0xcf], new Uint8Array(8), Uint8Array.of(...CFB_MAGIC.slice(0, 7), 0)]) assert.equal(hasCfbMagic(bad), false, String(bad));
});

test("R39 T53-524 readCfb is pure: the same bytes give the same answer, and the bytes are not changed", () => {
  const { bytes } = makeCfb({ s: bytesOf(5000, 5), t: bytesOf(60, 6) });
  const before = bytes.slice();
  const one = readCfb(bytes), two = readCfb(bytes);
  assert.deepEqual(one.children(one.root).map((e) => [e.name, one.stream(e).length]), two.children(two.root).map((e) => [e.name, two.stream(e).length]));
  assert.deepEqual(bytes, before);
});

test("R39 T53-524 readCfb answers null for a stream cut short, a stream whose chain loops, a size the chain cannot hold, and a loop in any storage", () => {
  const dirEntry = (n) => 512 * (dirSector + 1) + 128 * n;
  const { bytes: good, dirSector, fatOffset } = makeCfb({ F: { x: bytesOf(10, 7), y: bytesOf(10, 8) }, big: bytesOf(9000, 9) });
  const names = makeCfb({ F: { x: bytesOf(10, 7), y: bytesOf(10, 8) }, big: bytesOf(9000, 9) }).entries;
  assert.ok(readCfb(good));
  const patch = (at, value) => { const b = good.slice(); new DataView(b.buffer).setUint32(at, value, true); return b; };
  const big = names.indexOf("big"), x = names.indexOf("x");
  const start = new DataView(good.buffer, good.byteOffset).getUint32(dirEntry(big) + 0x74, true);
  // a regular stream whose chain ends before its stated size, and a stated size far past anything the chain holds (never allocated)
  assert.equal(readCfb(patch(dirEntry(big) + 0x78, 9000 + 512 * 40)), null);
  assert.equal(readCfb(patch(dirEntry(big) + 0x78, 0x7fffffff)), null);
  // a stream chain that loops on itself, and one cut by the file ending (the stream's first sector past the last)
  assert.equal(readCfb(patch(fatOffset + 4 * start, start)), null);
  assert.equal(readCfb(patch(dirEntry(big) + 0x74, 9999)), null);
  // a storage below the root whose own tree loops: the whole file is refused, not only the storage
  assert.equal(readCfb(patch(dirEntry(x) + 0x48, x)), null);
  assert.equal(readCfb(patch(dirEntry(x) + 0x44, x)), null);
});

test("R39 T53-524 readCfb gives the shapes a caller keeps: entry fields, a stream for no storage, a storage's [] for no children", () => {
  const { bytes } = makeCfb({ Empty: {}, S: bytesOf(70, 10) });
  const cfb = readCfb(bytes);
  const [empty, stream] = ["Empty", "S"].map((n) => cfb.children(cfb.root).find((e) => e.name === n));
  assert.deepEqual(Object.keys(stream).sort(), ["child", "id", "left", "name", "right", "size", "start", "type"]);
  assert.deepEqual([empty.type, stream.type, stream.size], [1, 2, 70]);
  assert.deepEqual(cfb.children(empty), []);
  assert.deepEqual(cfb.children(stream), []);
  assert.equal(cfb.stream(empty), null);
});
