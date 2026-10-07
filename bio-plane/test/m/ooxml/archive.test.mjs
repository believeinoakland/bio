/* The ooxml module's ZIP archive services (build/requirements/ooxml.md
 * R27–R30; N688, K1844, K1852, K1881, K1903): the validated listing, the
 * verified cut and the limits. Archives are written by test-support's
 * `makeZip` (its R10–R14). Info-ZIP's `unzip -t` and Python's `zipfile` are
 * the oracles where the host has them; every assertion below also stands on
 * its own, so a host without them checks the same requirements. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { deflateRawSync, crc32 as zcrc32 } from "node:zlib";
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  listArchive, streamMember, ARCHIVE_LIMITS, ARCHIVE_ENTRIES_MAX, ARCHIVE_TOTAL_MAX, MEMBER_MAX,
  ARCHIVE_RATIO_MAX, ARCHIVE_DEPTH_MAX, ARCHIVE_TREE_TOTAL_MAX, ARCHIVE_TREE_ENTRIES_MAX,
} from "../../../src/ooxml.mjs";
import { makeZip, zipBomb, nestedZip } from "../../make-zip.mjs";
import { buildZip } from "./zip.mjs";

const enc = (s) => new TextEncoder().encode(s);
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const hex = (b) => Buffer.from(b).toString("hex");
const crcOf = (b) => zcrc32(b) >>> 0;
const DIR = mkdtempSync(join(tmpdir(), "ooxml-archive-"));
let fileNo = 0;
const onDisk = (bytes) => { const p = join(DIR, `a${fileNo++}.zip`); writeFileSync(p, bytes); return p; };
const has = (cmd, args) => { try { return spawnSync(cmd, args, { encoding: "utf8" }).status === 0; } catch { return false; } };
const HAVE_UNZIP = has("unzip", ["-v"]);
const HAVE_PYTHON = has("python3", ["-c", "import zipfile"]);

/* Python's zipfile over an archive: each entry's name, offset, method, CRC,
 * sizes, stated time and the SHA-256 of what it extracts. */
function pythonList(bytes) {
  const script = `
import sys, json, zipfile, hashlib
z = zipfile.ZipFile(sys.argv[1])
print(json.dumps([dict(name=i.filename, offset=i.header_offset, method=i.compress_type, crc=i.CRC,
  compressed=i.compress_size, uncompressed=i.file_size, time="%04d-%02d-%02dT%02d:%02d:%02d" % i.date_time,
  sha=hashlib.sha256(z.read(i)).hexdigest()) for i in z.infolist()]))`;
  const r = spawnSync("python3", ["-c", script, onDisk(bytes)], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout);
}
const unzipT = (bytes) => spawnSync("unzip", ["-tqq", onDisk(bytes)], { encoding: "utf8" }).status;

/* A range source over `bytes` that records every read. */
function ranged(bytes, { fail = () => false, short = () => false } = {}) {
  const reads = [];
  return {
    reads,
    source: {
      size: bytes.length,
      async read(offset, length) {
        reads.push([offset, length]);
        if (fail(offset, length)) throw new Error("gone");
        return bytes.slice(offset, offset + (short(offset, length) ? length - 1 : length));
      },
    },
  };
}

/* The byte offset of central-directory record `index`, read from the EOCD. */
function centralAt(z, index) {
  const v = new DataView(z.buffer, z.byteOffset);
  let eocd = z.length - 22;
  while (v.getUint32(eocd, true) !== 0x06054b50) eocd--;
  let p = v.getUint32(eocd + 16, true);
  for (let i = 0; i < index; i++) p += 46 + v.getUint16(p + 28, true) + v.getUint16(p + 30, true) + v.getUint16(p + 32, true);
  return p;
}
/* Made on Unix (version made by 3.x) with these mode bits as its external attributes. */
function asUnix(z, index, mode) {
  const out = z.slice();
  const v = new DataView(out.buffer);
  const p = centralAt(out, index);
  v.setUint8(p + 5, 3);
  v.setUint32(p + 38, (mode << 16) >>> 0, true);
  return out;
}
async function cutAll(source, row) {
  const { chunks, done } = streamMember(source, row);
  const parts = [];
  for await (const c of chunks) parts.push(c);
  return { bytes: Buffer.concat(parts), result: await done };
}

/* ------------------------------------------------------------------ R27 */

test("R27 listArchive: one row per central-directory entry, every field as the archive states it", async () => {
  const big = new Uint8Array(200000).map((_, i) => (i * 31) & 255);
  const entries = [
    { name: "a.txt", data: "alpha alpha alpha", dosDate: (44 << 9) | (2 << 5) | 29, dosTime: (23 << 11) | (59 << 5) | 29 },
    { name: "dir/", data: "", method: 0 },
    { name: "dir/b.bin", data: big },
    { name: "stored.txt", data: "stored", method: 0, dosDate: (45 << 9) | (2 << 5) | 29 },
    { name: "café/ü.txt", data: "utf8 name" },
    { name: Uint8Array.of(0x80, 0x41, 0xe1, 0xff), data: "cp437", utf8: false },
    { name: "a.txt", data: "second a", dosDate: 0, dosTime: 0 },
    { name: "../up", data: "u" }, { name: "/abs", data: "u" }, { name: "\\back", data: "u" },
    { name: "C:/drive", data: "u" }, { name: "x\\y", data: "u" }, { name: "n\0ul", data: "u" }, { name: "ok/../x", data: "u" },
    { name: "fine/..x/y", data: "u" },
    { name: "desc.txt", data: "descriptor", dataDescriptor: true, dosTime: (12 << 11) | (60 << 5) },
    { name: "link", data: "target", method: 0 },
    { name: "plainmode", data: "p", method: 0 },
  ];
  const z = asUnix(asUnix(makeZip(entries), 16, 0o120777), 17, 0o100644);
  const l = await listArchive(z);
  assert.equal(l.ok, true);
  assert.equal(l.count, entries.length);
  assert.equal(l.zip64, false);
  assert.equal(l.verdict, "ok");
  const keys = ["index", "name_raw", "name", "name_encoding", "name_shared", "path_unsafe", "method", "flags", "crc32", "compressed", "uncompressed", "local_offset", "data_offset", "dos_time", "kind", "encrypted", "verdict"];
  let offset = 0;
  l.entries.forEach((row, i) => {
    const e = entries[i];
    const nameBytes = typeof e.name === "string" ? enc(e.name) : e.name;
    const data = typeof e.data === "string" ? enc(e.data) : e.data;
    const comp = (e.method ?? 8) === 8 ? deflateRawSync(data) : data;
    assert.deepEqual(Object.keys(row), keys, `row ${i}`);
    assert.equal(row.index, i);
    assert.equal(row.name_raw, hex(nameBytes));
    assert.equal(row.method, e.method ?? 8);
    assert.equal(row.crc32, crcOf(data));
    assert.equal(row.compressed, comp.length);
    assert.equal(row.uncompressed, data.length);
    assert.equal(row.local_offset, offset);
    assert.equal(row.data_offset, offset + 30 + nameBytes.length);
    assert.equal(row.encrypted, false);
    offset += 30 + nameBytes.length + comp.length + (e.dataDescriptor ? 16 : 0);
  });
  const rows = l.entries;
  assert.deepEqual(rows.map((r) => r.name), ["a.txt", "dir/", "dir/b.bin", "stored.txt", "café/ü.txt", "ÇAß\u00a0", "a.txt", "../up", "/abs", "\\back", "C:/drive", "x\\y", "n\0ul", "ok/../x", "fine/..x/y", "desc.txt", "link", "plainmode"]);
  assert.deepEqual(rows.map((r) => r.name_encoding), rows.map((_, i) => (i === 4 ? "utf-8" : "cp437")));
  assert.deepEqual(rows.map((r) => r.name_shared), rows.map((_, i) => (i === 0 || i === 6 ? 2 : 1)));
  assert.deepEqual(rows.map((r) => r.path_unsafe), rows.map((_, i) => i >= 7 && i <= 13));
  assert.deepEqual(rows.map((r) => r.kind), rows.map((_, i) => (i === 1 ? "dir" : i === 16 ? "symlink" : "file")));
  assert.deepEqual(rows.map((r) => r.flags), rows.map((_, i) => (i === 4 ? 0x0800 : i === 15 ? 0x0008 : 0)));
  // the stated MS-DOS time, no zone; null when the fields name no real instant
  assert.equal(rows[0].dos_time, "2024-02-29T23:59:58");
  assert.equal(rows[2].dos_time, "1980-01-01T00:00:00");
  assert.equal(rows[3].dos_time, null); // 2025-02-29
  assert.equal(rows[6].dos_time, null); // month 0
  assert.equal(rows[15].dos_time, null); // minute 60
  assert.deepEqual(rows.map((r) => r.verdict), rows.map((_, i) => (i === 1 ? "directory" : i === 16 ? "symlink" : "ok")));
  // declared_total sums the files' declared sizes only
  assert.equal(l.declared_total, rows.filter((r) => r.kind === "file").reduce((a, r) => a + r.uncompressed, 0));

  // the oracles read the same archive the same way (names, offsets, methods, CRCs, sizes, times, bytes)
  const plain = makeZip(entries.filter((e) => typeof e.name === "string" && !e.name.includes("\0")).map((e) => ({ ...e, dosDate: undefined, dosTime: undefined })));
  const pl = await listArchive(plain);
  if (HAVE_UNZIP) assert.equal(unzipT(plain), 0);
  if (HAVE_PYTHON) {
    const py = pythonList(plain);
    assert.deepEqual(pl.entries.map((r) => ({ name: r.name, offset: r.local_offset, method: r.method, crc: r.crc32, compressed: r.compressed, uncompressed: r.uncompressed, time: r.dos_time })),
      py.map(({ sha, ...rest }) => rest));
    for (const [i, row] of pl.entries.entries()) {
      if (row.verdict !== "ok") continue;
      assert.equal((await cutAll(plain, row)).result.sha256, py[i].sha);
    }
    // a CP437 name reads as Python's cp437 codec reads it, every high byte
    const all = makeZip([{ name: Uint8Array.from({ length: 128 }, (_, i) => 0x80 + i), data: "x", utf8: false }]);
    assert.equal((await listArchive(all)).entries[0].name, pythonList(all)[0].name);
  }
});

test("R27 listArchive: names, encryption, ZIP64 and the totals", async () => {
  // a UTF-8 flag over bytes that are not UTF-8: no name, stated as such
  const bad = await listArchive(makeZip([{ name: Uint8Array.of(0x66, 0xff, 0x2e, 0x2e), data: "x", utf8: true }]));
  assert.equal(bad.entries[0].name, null);
  assert.equal(bad.entries[0].name_encoding, "utf-8-invalid");
  assert.equal(bad.entries[0].name_raw, "66ff2e2e");
  const badUnsafe = await listArchive(makeZip([{ name: Uint8Array.of(0x2e, 0x2e, 0x2f, 0xff), data: "x", utf8: true }]));
  assert.equal(badUnsafe.entries[0].path_unsafe, true);
  // encrypted when bit 0, 6 or 13 is set, or the method is 99
  for (const kind of ["traditional", "strong", "aes", "directory"]) {
    const row = (await listArchive(makeZip([{ name: "e", data: "secret", encrypted: kind }]))).entries[0];
    assert.equal(row.encrypted, true, kind);
    assert.equal(row.method, kind === "aes" ? 99 : 8);
  }
  // ZIP64: the 64-bit values are read, and zip64 says the end record was
  const data = enc("z".repeat(5000));
  const z = makeZip([{ name: "a", data: "one", method: 0 }, { name: "b", data, zip64: true }, { name: "c", data: "three", dataDescriptor: true, zip64: true }], { zip64: true });
  const l = await listArchive(z);
  assert.equal(l.ok, true);
  assert.equal(l.zip64, true);
  assert.deepEqual(l.entries.map((r) => [r.uncompressed, r.verdict]), [[3, "ok"], [5000, "ok"], [5, "ok"]]);
  assert.equal(l.entries[1].compressed, deflateRawSync(data).length);
  assert.equal(l.entries[1].local_offset, 30 + 1 + 3);
  if (HAVE_PYTHON) assert.deepEqual(l.entries.map((r) => r.local_offset), pythonList(z).map((p) => p.offset));
  // ARCHIVE_TOTAL_MAX: listed in full, verdict and figure stated, no member cut
  const over = Math.floor(ARCHIVE_TOTAL_MAX / 2) + 1;
  const huge = (name) => ({ name, data: "x", local: { uncompressedSize: over }, central: { uncompressedSize: over } });
  const t = await listArchive(makeZip([huge("h1"), huge("h2")]));
  assert.equal(t.ok, true);
  assert.equal(t.verdict, "ARCHIVE_TOTAL_MAX");
  assert.equal(t.limit, ARCHIVE_TOTAL_MAX);
  assert.equal(t.declared_total, 2 * over);
  assert.equal(t.count, 2);
  const at = await listArchive(makeZip([{ name: "d/", data: "", method: 0, local: { uncompressedSize: ARCHIVE_TOTAL_MAX + 1 }, central: { uncompressedSize: ARCHIVE_TOTAL_MAX + 1 } }]));
  assert.equal(at.declared_total, 0); // a directory's size is not a file's
  assert.equal(at.verdict, "ok");
});

test("R27 listArchive: a range source reads only the structures and answers as the bytes do", async () => {
  const archives = [
    makeZip([{ name: "big", data: new Uint8Array(300000).map((_, i) => (i * 7919) & 255), method: 0 }, { name: "x", data: "y".repeat(90000) }]),
    makeZip([{ name: "a", data: "x".repeat(50000) }, { name: "b", data: "stored", method: 0 }, { name: "c", data: "desc", dataDescriptor: true }], { comment: "c".repeat(300) }),
    makeZip([{ name: "z", data: "zip64 data", zip64: true }], { zip64: true }),
    makeZip([{ name: "a", data: "1" }, { name: "b", data: "2", local: { crc32: 7 } }]),
    zipBomb({ kernel: 4096, entries: 3 }),
    makeZip([{ name: "a", data: "a" }], { secondEocd: true }),
    makeZip([]),
  ];
  for (const z of archives) {
    const whole = await listArchive(z);
    const { reads, source } = ranged(z);
    assert.deepEqual(await listArchive(source), whole);
    /* The first read is R3's end-record window, which R28 scans whole for a
       second candidate; every other read is a structure, never member data. */
    const window = Math.max(0, z.length - 22 - 0xffff);
    assert.deepEqual(reads[0], [window, z.length - window]);
    for (const row of whole.entries ?? []) {
      if (row.data_offset === null || row.compressed === 0) continue;
      const lo = row.data_offset, hi = row.data_offset + row.compressed;
      for (const [o, n] of reads.slice(1)) assert.ok(o + n <= lo || o >= hi, `read [${o}, ${o + n}) touches the data of entry ${row.index}`);
    }
  }
  const z = archives[0];
  // a rejected read, a short read, a source with no usable size
  assert.deepEqual(await listArchive(ranged(z, { fail: () => true }).source), { ok: false, why: "source_unreadable", entries: null });
  assert.deepEqual(await listArchive(ranged(z, { short: (o) => o < 100 }).source), { ok: false, why: "source_unreadable", entries: null });
  for (const size of [-1, 1.5, NaN, "9", undefined]) {
    assert.deepEqual(await listArchive({ size, read: async () => z }), { ok: false, why: "source_unreadable", entries: null });
  }
  assert.deepEqual(await listArchive({ size: z.length, read: async () => "not bytes" }), { ok: false, why: "source_unreadable", entries: null });
  // an ArrayBuffer and a typed view are bytes too; a longer answer is cut to the length asked
  assert.deepEqual(await listArchive(z.buffer), await listArchive(z));
  assert.deepEqual(await listArchive({ size: z.length, read: async (o, n) => z.slice(o, o + n + 5).buffer }), await listArchive(z));
  for (const x of [undefined, null, 0, "PK", {}, [], Symbol("s"), () => 0]) {
    const r = await listArchive(x);
    assert.equal(r.ok, false); assert.equal(r.entries, null); assert.equal(typeof r.why, "string");
  }
});

/* ------------------------------------------------------------------ R28 */

test("R28 listArchive refuses unreadable archives by R3's names and ARCHIVE_ENTRIES_MAX, entries null", async () => {
  const R = (why, extra = {}) => ({ ok: false, why, ...extra, entries: null });
  const good = makeZip([{ name: "a", data: "a" }, { name: "b", data: "b" }]);
  for (let n = 0; n < 22; n++) assert.deepEqual(await listArchive(good.subarray(0, n)), R("too_short_for_zip"));
  assert.deepEqual(await listArchive(new Uint8Array(100)), R("eocd_not_found"));
  // a comment length that does not reach exactly the archive's end is no candidate
  const tail = new Uint8Array(good.length + 3); tail.set(good);
  assert.deepEqual(await listArchive(tail), R("eocd_not_found"));
  assert.deepEqual(await listArchive(good.subarray(0, good.length - 1)), R("eocd_not_found"));
  const beyond = makeZip([{ name: "a", data: "a" }], { comment: "c".repeat(0xffff) });
  assert.equal((await listArchive(beyond)).ok, true);
  // ZIP64: a sentinel with no locator, a locator naming no end record, a record out of place, a CD sentinel with no value
  assert.deepEqual(await listArchive(makeZip([{ name: "a", data: "a" }], { eocd: { cdOffset: 0xffffffff } })), R("zip64_record_invalid"));
  assert.deepEqual(await listArchive(makeZip([{ name: "a", data: "a" }], { eocd: { entries: 0xffff, diskEntries: 0xffff } })), R("zip64_record_invalid"));
  const z64 = makeZip([{ name: "a", data: "a" }], { zip64: true });
  const locAt = z64.length - 22 - 20;
  for (const [at, value] of [[locAt + 8, 1], [locAt + 4, 1], [locAt + 16, 2], [locAt - 56, 0], [locAt - 56 + 4, 45]]) {
    const broken = z64.slice();
    new DataView(broken.buffer).setUint32(at, value, true);
    assert.deepEqual(await listArchive(broken), R("zip64_record_invalid"), `byte ${at}`);
  }
  const cdSentinel = makeZip([{ name: "a", data: "a", central: { uncompressedSize: 0xffffffff }, local: { uncompressedSize: 0xffffffff } }]);
  assert.deepEqual(await listArchive(cdSentinel), R("zip64_record_invalid"));
  assert.deepEqual(await listArchive(makeZip([{ name: "a", data: "a" }, { name: "b", data: "b" }], { eocd: { diskEntries: 1 } })), R("multi_disk_unsupported"));
  assert.deepEqual(await listArchive(makeZip([{ name: "a", data: "a" }], { eocd: { cdSize: 1000 } })), R("central_directory_truncated"));
  assert.deepEqual(await listArchive(makeZip([{ name: "a", data: "a" }], { eocd: { entries: 3, diskEntries: 3 } })), R("central_directory_truncated"));
  const cdLen = 46 + 1;
  assert.deepEqual(await listArchive(makeZip([{ name: "a", data: "a" }, { name: "b", data: "b" }], { eocd: { cdSize: cdLen + 46 } })), R("central_directory_truncated"));
  assert.deepEqual(await listArchive(makeZip([{ name: "a", data: "a" }], { eocd: { cdOffset: 1 } })), R("central_directory_truncated"));
  // a prefixed archive: its directory is not where the end record says
  assert.deepEqual(await listArchive(new Uint8Array([...new Uint8Array(10), ...good])), R("central_directory_truncated"));
  const sigless = good.slice(); new DataView(sigless.buffer).setUint32(centralAt(sigless, 1), 0, true);
  assert.deepEqual(await listArchive(sigless), R("central_directory_truncated"));
  // more entries declared than the limit: refused before the directory is walked
  const many = makeZip([{ name: "a", data: "a" }], { eocd: { entries: ARCHIVE_ENTRIES_MAX + 1, diskEntries: ARCHIVE_ENTRIES_MAX + 1, cdSize: 0 } });
  assert.deepEqual(await listArchive(many), R("ARCHIVE_ENTRIES_MAX", { limit: ARCHIVE_ENTRIES_MAX }));
  const exactly = makeZip(Array.from({ length: ARCHIVE_ENTRIES_MAX }, (_, i) => ({ name: `${i}`, data: "", method: 0 })));
  const ex = await listArchive(exactly);
  assert.equal(ex.ok, true); assert.equal(ex.count, ARCHIVE_ENTRIES_MAX);
});

test("R28 listArchive refuses an ambiguous archive as ARCHIVE_AMBIGUOUS with its detail", async () => {
  const A = (detail) => ({ ok: false, why: "ARCHIVE_AMBIGUOUS", detail });
  const pick = ({ ok, why, detail }) => ({ ok, why, detail });
  // several_eocd_candidates: two end records each reaching the end exactly
  const two = await listArchive(makeZip([{ name: "a", data: "a" }], { secondEocd: true }));
  assert.deepEqual(two, { ...A("several_eocd_candidates"), entries: null });
  // directory_disagrees_with_eocd: fewer records declared than the directory holds (walked; rows given)
  const fewer = await listArchive(makeZip([{ name: "a", data: "a" }, { name: "b", data: "b" }], { eocd: { entries: 1, diskEntries: 1 } }));
  assert.deepEqual(pick(fewer), A("directory_disagrees_with_eocd"));
  assert.equal(fewer.entries.length, 1); assert.equal(fewer.entries[0].verdict, "ok");
  // ... the ZIP64 end record and the EOCD state different counts, sizes or offsets (not walked)
  for (const eocd of [{ entries: 2, diskEntries: 2 }, { cdSize: 48 }, { cdOffset: 5 }]) {
    const d = await listArchive(makeZip([{ name: "a", data: "a" }], { zip64: true, eocd }));
    assert.deepEqual(d, { ...A("directory_disagrees_with_eocd"), entries: null }, JSON.stringify(eocd));
  }
  // ... bytes between the directory and its end record (a prefixed or concatenated archive)
  const gap = buildZip([{ name: "a", data: "a" }], { afterCd: new Uint8Array(4) });
  const gapped = await listArchive(gap);
  assert.deepEqual(pick(gapped), A("directory_disagrees_with_eocd"));
  assert.deepEqual(gapped.entries.map((r) => [r.name, r.verdict]), [["a", "ok"]]);
  // entry_out_of_range: a local header, data or data descriptor past the archive or into the directory
  for (const spec of [
    { central: { localOffset: 10000 } },
    { central: { compressedSize: 500 }, local: { compressedSize: 500 } },
    { dataDescriptor: true, descriptor: { compressedSize: 500 }, central: { compressedSize: 500 } },
  ]) {
    const r = await listArchive(makeZip([{ name: "a", data: "hello", ...spec }]));
    assert.deepEqual(pick(r), A("entry_out_of_range"), JSON.stringify(spec));
    assert.equal(r.entries.length, 1);
  }
  // entries_overlap: two entries' ranges intersect (the overlapping bomb, a shared local header, a header inside data)
  for (const z of [
    zipBomb({ kernel: 1 << 16, entries: 4 }),
    makeZip([{ name: "a", data: "aaaa" }, { name: "b", sameDataAs: 0 }]),
    makeZip([{ name: "a", data: "x".repeat(100), method: 0 }, { name: "b", data: "b", central: { localOffset: 40 } }]),
  ]) {
    const r = await listArchive(z);
    assert.deepEqual(pick(r), A("entries_overlap"));
    assert.ok(Array.isArray(r.entries) && r.entries.length >= 2);
  }
  // adjacent entries do not overlap
  assert.equal((await listArchive(makeZip([{ name: "a", data: "a" }, { name: "b", data: "b" }]))).ok, true);
});

test("R28 each row's verdict is the first that applies; a duplicate or unsafe name changes none", async () => {
  const one = async (e, opts) => (await listArchive(makeZip([e], opts))).entries[0].verdict;
  assert.equal(await one({ name: "d/", data: "", method: 0 }), "directory");
  assert.equal(await one({ name: "d/", data: "x", encrypted: "traditional", method: 12 }), "directory");
  assert.equal((await listArchive(asUnix(makeZip([{ name: "l", data: "t", encrypted: "aes" }]), 0, 0o120777))).entries[0].verdict, "symlink");
  for (const kind of ["traditional", "strong", "aes", "directory"]) {
    assert.equal(await one({ name: "e", data: "x", encrypted: kind, method: 12 }), "MEMBER_ENCRYPTED", kind);
  }
  for (const method of [1, 9, 12, 14, 93, 95]) {
    assert.equal(await one({ name: "m", data: "x", method, local: { crc32: 0 } }), "MEMBER_METHOD_UNSUPPORTED", `method ${method}`);
  }
  // MEMBER_AMBIGUOUS: the local header disagrees on the name bytes, the method or the flags ...
  for (const local of [{ name: "b" }, { name: "A" }, { method: 0 }, { flags: 0x0800 }, { flags: 0x0002 }, { crc32: 1 }, { compressedSize: 1 }, { uncompressedSize: 99 }]) {
    assert.equal(await one({ name: "a", data: "hello", local }), "MEMBER_AMBIGUOUS", JSON.stringify(local));
  }
  // ... a central-directory value the local header does not repeat
  for (const central of [{ crc32: 5 }, { uncompressedSize: 4 }, { compressedSize: 3 }]) {
    assert.equal(await one({ name: "a", data: "hello", central }), "MEMBER_AMBIGUOUS", JSON.stringify(central));
  }
  // ... read through the local header's own ZIP64 field where it carries sentinels
  assert.equal(await one({ name: "a", data: "hello", zip64: true }, { zip64: true }), "ok");
  assert.equal(await one({ name: "a", data: "hello", local: { compressedSize: 0xffffffff } }), "MEMBER_AMBIGUOUS");
  assert.equal(await one({ name: "a", data: "hello", local: { uncompressedSize: 0xffffffff, compressedSize: 0xffffffff } }), "MEMBER_AMBIGUOUS");
  // ... with bit 3, the descriptor (signed or not, 32- or 64-bit) must agree; the local header's zeros are not compared
  assert.equal(await one({ name: "a", data: "hello", dataDescriptor: true }), "ok");
  assert.equal(await one({ name: "a", data: "hello", dataDescriptor: true, descriptor: { signature: false } }), "ok");
  assert.equal(await one({ name: "a", data: "hello", dataDescriptor: true, zip64: true }, { zip64: true }), "ok");
  assert.equal(await one({ name: "a", data: "hello", dataDescriptor: true, local: { crc32: 3 } }), "ok");
  for (const descriptor of [{ crc32: 1 }, { compressedSize: 1 }, { uncompressedSize: 1 }]) {
    assert.equal(await one({ name: "a", data: "hello", dataDescriptor: true, descriptor }), "MEMBER_AMBIGUOUS", JSON.stringify(descriptor));
  }
  const noHeader = makeZip([{ name: "a", data: "a".repeat(40), method: 0 }, { name: "b", data: "b", central: { localOffset: 31 } }]);
  assert.equal((await listArchive(noHeader)).entries[1].verdict, "MEMBER_AMBIGUOUS");
  // MEMBER_MAX, then ARCHIVE_RATIO_MAX (a zero compressed size with data declared included)
  const declared = (n, extra = {}) => ({ name: "big", data: "x", local: { uncompressedSize: n, ...extra }, central: { uncompressedSize: n, ...extra } });
  const mm = (await listArchive(makeZip([declared(MEMBER_MAX + 1)]))).entries[0];
  assert.deepEqual([mm.verdict, mm.limit], ["MEMBER_MAX", MEMBER_MAX]);
  const xc = deflateRawSync(enc("x")).length;
  const atRatio = (await listArchive(makeZip([declared(xc * ARCHIVE_RATIO_MAX)]))).entries[0];
  assert.equal(atRatio.verdict, "ok");
  const ratio = (await listArchive(makeZip([declared(xc * ARCHIVE_RATIO_MAX + 1)]))).entries[0];
  assert.deepEqual([ratio.verdict, ratio.limit], ["ARCHIVE_RATIO_MAX", ARCHIVE_RATIO_MAX]);
  const zero = (await listArchive(makeZip([{ name: "z", data: "", method: 0, local: { uncompressedSize: 1 }, central: { uncompressedSize: 1 } }]))).entries[0];
  assert.equal(zero.verdict, "ARCHIVE_RATIO_MAX");
  assert.equal(await one({ name: "empty", data: "", method: 0 }), "ok");
  // a duplicate or unsafe name is addressed by index and keeps its verdict
  const dup = await listArchive(makeZip([{ name: "../x", data: "1" }, { name: "../x", data: "2" }]));
  assert.deepEqual(dup.entries.map((r) => [r.name_shared, r.path_unsafe, r.verdict]), [[2, true, "ok"], [2, true, "ok"]]);
  // only "ok" rows carry no limit; a limit row names its figure
  for (const row of dup.entries) assert.equal("limit" in row, false);
});

/* ------------------------------------------------------------------ R29 */

test("R29 streamMember cuts each ok member, verified by size, CRC-32 and SHA-256, in order", async () => {
  const big = new Uint8Array((3 << 20) + 17).map((_, i) => (i * 7 + (i >> 9)) & 255);
  const inner = nestedZip({ depth: 2, fanout: 2, leaf: enc("leaf") });
  const z = makeZip([
    { name: "deflated", data: big }, { name: "stored", data: big.subarray(0, (1 << 20) + 5), method: 0 },
    { name: "empty", data: "" }, { name: "empty-stored", data: "", method: 0 },
    { name: "desc", data: "described", dataDescriptor: true }, { name: "z64", data: "sixty-four", zip64: true, dataDescriptor: true },
    { name: "inner.zip", data: inner },
  ], { zip64: true });
  const l = await listArchive(z);
  const datas = [big, big.subarray(0, (1 << 20) + 5), new Uint8Array(0), new Uint8Array(0), enc("described"), enc("sixty-four"), inner];
  for (const row of l.entries) {
    const want = datas[row.index];
    for (const source of [z, ranged(z).source]) {
      const { bytes, result } = await cutAll(source, row);
      assert.deepEqual(new Uint8Array(bytes), want, `entry ${row.index}`);
      assert.deepEqual(result, { ok: true, sha256: sha256(want), crc32: crcOf(want), size: want.length });
    }
  }
  // a nested archive cut out is itself listed and cut
  const innerRow = l.entries[6];
  const innerBytes = new Uint8Array((await cutAll(z, innerRow)).bytes);
  const il = await listArchive(innerBytes);
  assert.equal(il.count, 2);
  const leafList = await listArchive(new Uint8Array((await cutAll(innerBytes, il.entries[0])).bytes));
  assert.equal((await cutAll(innerBytes, il.entries[0])).result.ok, true);
  assert.deepEqual(new Uint8Array((await cutAll(new Uint8Array((await cutAll(innerBytes, il.entries[0])).bytes), leafList.entries[1])).bytes), enc("leaf"));
  // a range source is read only inside the member's data, one bounded window at a time, in order
  const { reads, source } = ranged(z);
  await cutAll(source, l.entries[0]);
  let at = l.entries[0].data_offset;
  for (const [o, n] of reads) { assert.equal(o, at); assert.ok(n <= 1 << 20); at += n; }
  assert.equal(at, l.entries[0].data_offset + l.entries[0].compressed);
  // the oracle extracts the same bytes
  if (HAVE_PYTHON) {
    const plain = makeZip([{ name: "deflated", data: big }, { name: "stored", data: "s", method: 0 }]);
    const py = pythonList(plain);
    for (const row of (await listArchive(plain)).entries) assert.equal((await cutAll(plain, row)).result.sha256, py[row.index].sha);
  }
});

test("R29 streamMember: a member not ok is refused by its verdict, nothing read", async () => {
  const z = makeZip([{ name: "d/", data: "", method: 0 }, { name: "e", data: "x", encrypted: "traditional" }, { name: "m", data: "x", method: 12 }, { name: "a", data: "x", local: { crc32: 1 } },
    { name: "big", data: "x", local: { uncompressedSize: MEMBER_MAX + 1 }, central: { uncompressedSize: MEMBER_MAX + 1 } },
    { name: "r", data: "x", local: { uncompressedSize: 100000 }, central: { uncompressedSize: 100000 } }]);
  const l = await listArchive(z);
  const wants = [["directory"], ["MEMBER_ENCRYPTED"], ["MEMBER_METHOD_UNSUPPORTED"], ["MEMBER_AMBIGUOUS"], ["MEMBER_MAX", MEMBER_MAX], ["ARCHIVE_RATIO_MAX", ARCHIVE_RATIO_MAX]];
  for (const row of l.entries) {
    const { reads, source } = ranged(z);
    const { bytes, result } = await cutAll(source, row);
    const [why, limit] = wants[row.index];
    assert.deepEqual(result, { ok: false, why, index: row.index, ...(limit ? { limit } : {}) });
    assert.equal(bytes.length, 0);
    assert.deepEqual(reads, []);
  }
  const sym = (await listArchive(asUnix(makeZip([{ name: "l", data: "t" }]), 0, 0o120777))).entries[0];
  assert.deepEqual((await cutAll(z, sym)).result, { ok: false, why: "symlink", index: 0 });
  // a row that is not one of the listing's is refused, never thrown on
  for (const row of [undefined, null, 5, "row", {}, { verdict: "ok" }, { ...l.entries[3], verdict: "ok", method: 12 }, { ...l.entries[3], verdict: "ok", data_offset: -1 }]) {
    const { chunks, done } = streamMember(z, row);
    const r = await done;
    assert.equal(r.ok, false);
    assert.equal(typeof r.why, "string");
    for await (const c of chunks) assert.fail(`yielded ${c.length} bytes`);
  }
});

test("R29 streamMember: MEMBER_CORRUPT by detail, source_unreadable, and done never rejects", async () => {
  const corrupt = async (z, i = 0) => (await cutAll(z, (await listArchive(z)).entries[i])).result;
  const C = (detail) => ({ ok: false, why: "MEMBER_CORRUPT", detail, index: 0 });
  const data = enc("the member's true bytes ".repeat(40));
  const lie = (fields) => makeZip([{ name: "a", data, local: fields, central: fields }]);
  const lieStored = (fields) => makeZip([{ name: "a", data, method: 0, local: fields, central: fields }]);
  // over_declared_size: inflation stops at the declared size + 1, never run to its end
  assert.deepEqual(await corrupt(lie({ uncompressedSize: 10 })), C("over_declared_size"));
  assert.deepEqual(await corrupt(lieStored({ uncompressedSize: 10, compressedSize: data.length })), C("over_declared_size"));
  const RealDS = globalThis.DecompressionStream;
  let produced = 0;
  globalThis.DecompressionStream = class extends RealDS {
    constructor(f) {
      super(f);
      const r = super.readable;
      const counted = r.pipeThrough(new TransformStream({ transform(c, ctl) { produced += c.length; ctl.enqueue(c); } }));
      Object.defineProperty(this, "readable", { value: counted });
    }
  };
  try {
    const bomb = makeZip([{ name: "bomb", data: new Uint8Array(256 << 20), local: { uncompressedSize: 1000 }, central: { uncompressedSize: 1000 } }]);
    const row = (await listArchive(bomb)).entries[0];
    row.verdict = "ok"; // past the ratio limit by design: the cut's own guard is what is tested
    assert.deepEqual((await cutAll(bomb, row)).result, C("over_declared_size"));
    assert.ok(produced < 16 << 20, `inflated ${produced} bytes`);
  } finally {
    globalThis.DecompressionStream = RealDS;
  }
  // size_mismatch: the output ends short of the declared size
  assert.deepEqual(await corrupt(lie({ uncompressedSize: data.length + 1 })), C("size_mismatch"));
  assert.deepEqual(await corrupt(lieStored({ uncompressedSize: data.length + 1 })), C("size_mismatch"));
  // crc_mismatch
  assert.deepEqual(await corrupt(lie({ crc32: 1 })), C("crc_mismatch"));
  assert.deepEqual(await corrupt(lieStored({ crc32: 1 })), C("crc_mismatch"));
  // inflate_failed: data that is not deflate, or a deflate stream cut short
  const junk = makeZip([{ name: "a", data }]);
  const jl = await listArchive(junk);
  const smashed = junk.slice(); smashed.fill(0xff, jl.entries[0].data_offset, jl.entries[0].data_offset + 3);
  assert.deepEqual((await cutAll(smashed, jl.entries[0])).result, C("inflate_failed"));
  const full = deflateRawSync(data);
  const short = buildZip([{ name: "a", data, compressed: full.subarray(0, full.length >> 1) }]);
  assert.deepEqual(await corrupt(short), C("inflate_failed"));
  // stream_end_mismatch: the whole member comes out, but the deflate stream does not end at the data's end
  const trailing = buildZip([{ name: "a", data, compressed: new Uint8Array([...full, 1, 2, 3]) }]);
  assert.equal((await listArchive(trailing)).entries[0].verdict, "ok");
  assert.deepEqual(await corrupt(trailing), C("stream_end_mismatch"));
  const noFinal = buildZip([{ name: "a", data: "abc", compressed: Uint8Array.of(0x00, 0x03, 0x00, 0xfc, 0xff, 0x61, 0x62, 0x63) }]);
  assert.deepEqual(await corrupt(noFinal), C("stream_end_mismatch"));
  // source_unreadable: a read that fails part-way, for stored and deflated data
  const big = makeZip([{ name: "a", data: new Uint8Array(3 << 20).map((_, i) => i & 255) }, { name: "s", data: new Uint8Array(3 << 20), method: 0 }]);
  for (const row of (await listArchive(big)).entries) {
    const src = ranged(big, { fail: (o) => o >= row.data_offset + (row.method === 0 ? 1 << 20 : 0) }).source;
    assert.deepEqual((await cutAll(src, row)).result, { ok: false, why: "source_unreadable", index: row.index });
    const shortSrc = ranged(big, { short: (o) => o >= row.data_offset + (row.method === 0 ? 1 << 20 : 0) }).source;
    assert.deepEqual((await cutAll(shortSrc, row)).result, { ok: false, why: "source_unreadable", index: row.index });
  }
  assert.deepEqual((await cutAll({ size: -1, read: async () => new Uint8Array(0) }, (await listArchive(big)).entries[0])).result, { ok: false, why: "source_unreadable", index: 0 });
  // a consumer that stops early: the rest is read and verified, unyielded, and done still answers
  const row = (await listArchive(big)).entries[0];
  const { chunks, done } = streamMember(big, row);
  for await (const c of chunks) { assert.ok(c.length > 0); break; }
  assert.deepEqual(await done, { ok: true, sha256: sha256(new Uint8Array(3 << 20).map((_, i) => i & 255)), crc32: row.crc32, size: 3 << 20 });
  // chunks can be iterated once
  const again = streamMember(big, row);
  let first = 0, second = 0;
  for await (const c of again.chunks) first += c.length;
  for await (const c of again.chunks) second += c.length;
  assert.deepEqual([first, second], [3 << 20, 0]);
  assert.equal((await again.done).ok, true);
  // a source that is not one: the cut is refused, never thrown
  for (const x of [undefined, null, 0, "PK", {}]) assert.deepEqual((await cutAll(x, row)).result, { ok: false, why: "source_unreadable", index: 0 });
});

test("R29 the streamed SHA-256 is the host's own where it has DigestStream, and the same digest either way", async () => {
  const z = makeZip([{ name: "a", data: new Uint8Array(70000).map((_, i) => (i * 13) & 255) }, { name: "e", data: "" }]);
  const rows = (await listArchive(z)).entries;
  const plain = await Promise.all(rows.map(async (r) => (await cutAll(z, r)).result));
  const used = [];
  const had = Object.getOwnPropertyDescriptor(crypto, "DigestStream");
  crypto.DigestStream = class extends WritableStream {
    constructor(alg) {
      const h = createHash(alg.toLowerCase().replace("-", ""));
      let finish;
      const digest = new Promise((r) => { finish = r; });
      super({ write(c) { h.update(c); }, close() { finish(new Uint8Array(h.digest()).buffer); } });
      used.push(alg);
      this.digest = digest;
    }
  };
  try {
    const host = await Promise.all(rows.map(async (r) => (await cutAll(z, r)).result));
    assert.deepEqual(host, plain);
  } finally {
    if (had) Object.defineProperty(crypto, "DigestStream", had); else delete crypto.DigestStream;
  }
  assert.deepEqual(used, ["SHA-256", "SHA-256"]);
  // the module's own SHA-256 against the host's one-shot digest, across block boundaries
  for (const n of [0, 1, 55, 56, 63, 64, 65, 119, 120, 128, 1000, 65537]) {
    const data = new Uint8Array(n).map((_, i) => (i * 101 + 7) & 255);
    const one = makeZip([{ name: "x", data, method: 0 }]);
    const r = (await listArchive(one)).entries[0];
    const got = (await cutAll(ranged(one).source, r)).result.sha256;
    assert.equal(got, Buffer.from(await crypto.subtle.digest("SHA-256", data)).toString("hex"), `length ${n}`);
  }
});

/* ------------------------------------------------------------------ R30 */

test("R30 the limits, each exported by its name, and together as the frozen ARCHIVE_LIMITS", async () => {
  const want = {
    ARCHIVE_ENTRIES_MAX: 10000, ARCHIVE_TOTAL_MAX: 268435456, MEMBER_MAX: 268435456, ARCHIVE_RATIO_MAX: 1100,
    ARCHIVE_DEPTH_MAX: 3, ARCHIVE_TREE_TOTAL_MAX: 268435456, ARCHIVE_TREE_ENTRIES_MAX: 10000,
  };
  assert.deepEqual({ ...ARCHIVE_LIMITS }, want);
  assert.deepEqual(Object.keys(ARCHIVE_LIMITS), Object.keys(want));
  assert.ok(Object.isFrozen(ARCHIVE_LIMITS));
  assert.deepEqual(
    { ARCHIVE_ENTRIES_MAX, ARCHIVE_TOTAL_MAX, MEMBER_MAX, ARCHIVE_RATIO_MAX, ARCHIVE_DEPTH_MAX, ARCHIVE_TREE_TOTAL_MAX, ARCHIVE_TREE_ENTRIES_MAX },
    want,
  );
  assert.equal(256 * 1024 * 1024, ARCHIVE_TOTAL_MAX);
  // a refusal on a limit names it exactly and carries its figure (the listing, its rows, the cut)
  const entriesMax = await listArchive(makeZip([], { eocd: { entries: 10001, diskEntries: 10001 } }));
  assert.deepEqual([entriesMax.why, entriesMax.limit], ["ARCHIVE_ENTRIES_MAX", ARCHIVE_ENTRIES_MAX]);
  const half = ARCHIVE_TOTAL_MAX / 2;
  const total = await listArchive(makeZip([0, 1, 2].map((i) => ({ name: `${i}`, data: "x", method: 0, local: { uncompressedSize: half }, central: { uncompressedSize: half } }))));
  assert.deepEqual([total.verdict, total.limit], ["ARCHIVE_TOTAL_MAX", ARCHIVE_TOTAL_MAX]);
  const exact = await listArchive(makeZip([0, 1].map((i) => ({ name: `${i}`, data: "x", method: 0, local: { uncompressedSize: half }, central: { uncompressedSize: half } }))));
  assert.equal(exact.declared_total, ARCHIVE_TOTAL_MAX);
  assert.equal(exact.verdict, "ok");
  assert.equal("limit" in exact, false);
  for (const row of total.entries) assert.deepEqual([row.verdict, row.limit], ["ARCHIVE_RATIO_MAX", ARCHIVE_RATIO_MAX]);
  assert.deepEqual((await cutAll(makeZip([]), total.entries[0])).result, { ok: false, why: "ARCHIVE_RATIO_MAX", index: 0, limit: ARCHIVE_RATIO_MAX });
});
