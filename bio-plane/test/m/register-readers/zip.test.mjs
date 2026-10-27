/* register-readers R2: a zip read by its directory and one member at a time. The archives are test-support's
 * `zipChunks64` (the ZIP64 writer); the reads go through a range that records them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { zipChunks64 } from "../../make-zip.mjs";
import { listMembers, streamZipMember, readRows } from "../../../src/register-readers/index.mjs";
import { CONTRIB_HEADER, CONTRIB_ROWS, TAB, delimited, enc, all, concat, memoryRange } from "./fixtures.mjs";

const zipOf = async (entries, options) => concat(await all(zipChunks64(entries, options)));
const u32 = (b, i) => (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;
const u64 = (b, i) => u32(b, i) + u32(b, i + 4) * 2 ** 32;
/* The archive's directory offset, read here from the ZIP64 end record (independently of the module). */
function directoryOffset(z) {
  for (let i = z.length - 22; i >= 0; i--) if (u32(z, i) === 0x06064b50) return u64(z, i + 48);
  throw new Error("no zip64 end record");
}
const bytesOf = (items) => concat(items.filter((x) => x instanceof Uint8Array));
const results = (items) => items.filter((x) => !(x instanceof Uint8Array));

const pseudo = (n, seed = 7) => { const b = new Uint8Array(n); let x = seed; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; b[i] = x >>> 24; } return b; };
const TEXT = enc(delimited([CONTRIB_HEADER, ...Array.from({ length: 3000 }, (_, i) => CONTRIB_ROWS[i % 5])], "\t"));

test("R2 listMembers reads the central directory, and only it: names, methods, sizes, offsets and CRCs", async () => {
  const z = await zipOf([
    { name: "A.TSV", data: TEXT },
    { name: "RCPT_CD.TSV", chunks: [TEXT.subarray(0, 5000), TEXT.subarray(5000)] },
    { name: "C.bin", data: pseudo(4000), method: 0 },
  ]);
  const range = memoryRange(z);
  const listed = await listMembers(range);
  assert.equal(listed.ok, true);
  assert.deepEqual(listed.members.map((m) => [m.name, m.method, m.uncompressed]), [["A.TSV", 8, TEXT.length], ["RCPT_CD.TSV", 8, TEXT.length], ["C.bin", 0, 4000]]);
  assert.equal(listed.members[2].compressed, 4000);
  for (const m of listed.members) assert.ok(Number.isInteger(m.crc32) && Number.isInteger(m.offset));
  const dir = directoryOffset(z);
  for (const [lo] of range.reads) assert.ok(lo >= dir, `read at ${lo} is inside the members (directory at ${dir})`);
});

test("R2 the second of three members streams reading only its span, and its bytes are the member's", async () => {
  const z = await zipOf([{ name: "a.tsv", data: TEXT }, { name: "b.tsv", chunks: [TEXT] }, { name: "c.tsv", data: TEXT }]);
  const { members } = await listMembers(memoryRange(z));
  const range = memoryRange(z);
  const items = await all(streamZipMember(range, "b.tsv", { members, readBytes: 1000 }));
  assert.deepEqual(bytesOf(items), TEXT);
  assert.deepEqual(results(items), [{ ok: true, bytes: TEXT.length, crc32: members[1].crc32 }]);
  const lo = members[1].offset, hi = members[2].offset;
  assert.ok(range.reads.length > 2, "read in parts");
  for (const [a, b] of range.reads) assert.ok(a >= lo && b <= hi, `read [${a}, ${b}) is outside member b's span [${lo}, ${hi})`);
});

test("R2 a ZIP64 directory: a member stated over 4 GiB lists its true sizes; a directory of more than 65,535 entries lists every one", async () => {
  const big = 5 * 2 ** 30 + 17;
  const z = await zipOf([{ name: "itcont.txt", data: "x", central: { uncompressedSize: big, compressedSize: 3 } }]);
  const one = await listMembers(memoryRange(z));
  assert.equal(one.ok, true);
  assert.equal(one.members[0].uncompressed, big);
  const n = 65_540;
  const many = await zipOf(Array.from({ length: n }, (_, i) => ({ name: `m${i}`, data: "", method: 0 })));
  const listed = await listMembers(memoryRange(many));
  assert.equal(listed.ok, true);
  assert.equal(listed.members.length, n);
  assert.equal(listed.members.at(-1).name, `m${n - 1}`);
});

test("R2 a flipped byte ends member_crc_mismatch as the last result, never silently", async () => {
  const data = pseudo(3000);
  const z = await zipOf([{ name: "stored.bin", data, method: 0 }]);
  const { members } = await listMembers(memoryRange(z));
  const at = members[0].offset + 30 + "stored.bin".length + 20 + 1500;
  const bad = z.slice();
  bad[at] ^= 0xff;
  const items = await all(streamZipMember(memoryRange(bad), "stored.bin"));
  assert.equal(items.at(-1).ok, false);
  assert.equal(items.at(-1).why, "member_crc_mismatch");
  assert.equal(results(items).length, 1);
  const lied = await zipOf([{ name: "d.tsv", data: TEXT, central: { crc32: 12345 } }]);
  assert.equal((await all(streamZipMember(memoryRange(lied), "d.tsv"))).at(-1).why, "member_crc_mismatch");
});

test("R2 a bzip2 member is unsupported_method before any of it is read", async () => {
  const z = await zipOf([{ name: "a.tsv", data: TEXT }, { name: "b.bz2", data: TEXT, method: 0 }]);
  const { members } = await listMembers(memoryRange(z));
  const bad = z.slice();
  for (let i = 0; i < bad.length - 4; i++) if (u32(bad, i) === 0x02014b50 && new TextDecoder().decode(bad.subarray(i + 46, i + 51)) === "b.bz2") { bad[i + 10] = 12; bad[i + 11] = 0; }
  const listed = await listMembers(memoryRange(bad));
  assert.equal(listed.members[1].method, 12);
  const range = memoryRange(bad);
  const items = await all(streamZipMember(range, "b.bz2", { members: listed.members }));
  assert.deepEqual(items, [{ ok: false, why: "unsupported_method", method: 12 }]);
  assert.deepEqual(range.reads, [], "nothing read");
  assert.equal(members.length, 2);
});

test("R2 refusals: not_a_zip, zip64_record_invalid, directory_unreadable, ambiguous_member, member_missing", async () => {
  assert.deepEqual(await listMembers(memoryRange(pseudo(5000))), { ok: false, why: "not_a_zip" });
  assert.deepEqual(await listMembers(memoryRange(new Uint8Array(0))), { ok: false, why: "not_a_zip" });
  const z = await zipOf([{ name: "a", data: "1" }, { name: "b", data: "2" }]);
  const locator = (() => { for (let i = z.length - 22; i >= 0; i--) if (u32(z, i) === 0x07064b50) return i; return -1; })();
  const noRecord = z.slice();
  noRecord[locator + 8] ^= 0x01;
  assert.deepEqual(await listMembers(memoryRange(noRecord)), { ok: false, why: "zip64_record_invalid" });
  const cut = z.slice();
  const dir = directoryOffset(z);
  cut[dir] = 0;
  assert.deepEqual(await listMembers(memoryRange(cut)), { ok: false, why: "directory_unreadable" });
  const twice = await zipOf([{ name: "same", data: "1" }, { name: "same", data: "2" }]);
  assert.deepEqual(await all(streamZipMember(memoryRange(twice), "same")), [{ ok: false, why: "ambiguous_member" }]);
  assert.deepEqual(await all(streamZipMember(memoryRange(z), "A")), [{ ok: false, why: "member_missing" }], "a name is matched exactly");
});

test("R2 a member's stream feeds readRows", async () => {
  const z = await zipOf([{ name: "x", data: "" }, { name: "RCPT_CD.TSV", chunks: [TEXT] }]);
  const items = await all(readRows(streamZipMember(memoryRange(z), "RCPT_CD.TSV", { readBytes: 777 }), TAB, "t"));
  assert.equal(items.filter((x) => x.cells).length, 3000);
  assert.equal(items.at(-1).done, true);
});

test("R2 control: a member streams identically from a whole file", async () => {
  const z = await zipOf([{ name: "a.tsv", data: TEXT }, { name: "b.bin", chunks: [pseudo(300_000, 3)] }]);
  const whole = { size: z.length, read: async (o, n) => z.slice(o, o + n) };
  for (const [name, want] of [["a.tsv", TEXT], ["b.bin", pseudo(300_000, 3)]]) {
    const ranged = bytesOf(await all(streamZipMember(memoryRange(z), name, { readBytes: 4096 })));
    const oneRead = bytesOf(await all(streamZipMember(whole, name, { readBytes: z.length })));
    assert.deepEqual(ranged, want);
    assert.deepEqual(oneRead, want);
  }
});
