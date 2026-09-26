/* The ooxml module's requirement-named tests (build/requirements/ooxml.md).
 * Every test calls the module's exported services on archives built by
 * ./zip.mjs and checks the result against the requirement its title names. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { crc32 as zcrc32, deflateRawSync } from "node:zlib";
import { registerHooks } from "node:module";
import * as M from "../../../src/ooxml.mjs";
import { buildZip, TYPES, MAIN, contentTypes, opc, odf, prng } from "./zip.mjs";

const {
  hasZipMagic, normalizePartName, readContainer, crc32, readPart,
  MEASURED_OOXML_TEXT_BOUND_BYTES, declaredTextBytes, sizeGuard,
  CONTENT_TYPES_PART, CONTAINER_FLAVOURS, discriminate,
  ODF_MIMETYPE_PART, ODF_MANIFEST_PART, ODF_MIMETYPE_MAX_BYTES,
  relsPartFor, parseRels, walkRels, CORE_PROPERTIES_PART, readCoreProperties,
  withContainerImages,
} = M;

const MODULE_URL = new URL("../../../src/ooxml.mjs", import.meta.url).href;
const enc = (s) => new TextEncoder().encode(s);
const dec = (b) => new TextDecoder().decode(b);
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const ODD = [undefined, null, 0, -1, 1.5, NaN, "", "PK\x03\x04", {}, [], Symbol("s"), () => 0, true];
const zipOf = (members, o) => buildZip(members, o);

/* ------------------------------------------------------------------ R1 */

test("R1 hasZipMagic: true iff length >= 4 and the first four bytes are PK\\x03\\x04", () => {
  const magic = [0x50, 0x4b, 0x03, 0x04];
  assert.equal(hasZipMagic(new Uint8Array(magic)), true);
  assert.equal(hasZipMagic(new Uint8Array([...magic, 9, 9, 9])), true);
  assert.equal(hasZipMagic(new Uint8Array(magic).buffer), true);
  for (let n = 0; n < 4; n++) assert.equal(hasZipMagic(new Uint8Array(magic.slice(0, n))), false, `length ${n}`);
  for (let i = 0; i < 4; i++) {
    for (let v = 0; v < 256; v++) {
      if (v === magic[i]) continue;
      const b = new Uint8Array([...magic, 0]);
      b[i] = v;
      assert.equal(hasZipMagic(b), false, `byte ${i} = ${v}`);
    }
  }
  assert.equal(hasZipMagic(new Uint8Array([0x50, 0x4b, 0x01, 0x02])), false);
  assert.equal(hasZipMagic(new Uint8Array([0x50, 0x4b, 0x05, 0x06])), false);
  for (const x of ODD) assert.equal(hasZipMagic(x), false);
});

/* ------------------------------------------------------------------ R2 */

test("R2 normalizePartName strips every leading /; null and undefined give \"\"; never throws", () => {
  const cases = [
    ["/word/document.xml", "word/document.xml"], ["///a/b", "a/b"], ["a/b", "a/b"], ["a/", "a/"],
    ["a//b/", "a//b/"], ["/", ""], ["", ""], [null, ""], [undefined, ""], ["[Content_Types].xml", "[Content_Types].xml"],
    ["/[Content_Types].xml", "[Content_Types].xml"], [" /a", " /a"],
  ];
  for (const [i, o] of cases) assert.equal(normalizePartName(i), o, JSON.stringify(i));
  for (const x of [...ODD, { toString() { throw new Error("x"); } }]) assert.equal(typeof normalizePartName(x), "string");
});

/* ------------------------------------------------------------------ R3 */

test("R3 readContainer: every central-directory record in file order, byName first, count", () => {
  const latin = new Uint8Array([0x63, 0x61, 0x66, 0xe9]); // "café" in Latin-1
  const utf = enc("café/ü.xml");
  const bytes = zipOf([
    { name: "a.xml", data: "alpha" },
    { name: "b.bin", data: "stored bytes", method: 0 },
    { name: "a.xml", data: "second a" },
    { name: "latin", nameBytes: latin, data: "l" },
    { name: "utf", nameBytes: utf, flags: 0x0800, data: "u" },
    { name: "utf-unflagged", nameBytes: utf, data: "v" },
  ]);
  const c = readContainer(bytes);
  assert.equal(c.ok, true);
  assert.equal(c.count, 6);
  assert.equal(c.entries.length, 6);
  assert.deepEqual(c.entries.map((e) => e.name), ["a.xml", "b.bin", "a.xml", "café", "café/ü.xml", "cafÃ©/Ã¼.xml"]);
  let off = 0;
  const datas = ["alpha", "stored bytes", "second a", "l", "u", "v"];
  const names = [enc("a.xml"), enc("b.bin"), enc("a.xml"), latin, utf, utf];
  c.entries.forEach((e, i) => {
    const data = enc(datas[i]);
    const comp = i === 1 ? data : deflateRawSync(data);
    assert.deepEqual(Object.keys(e).sort(), ["compressedSize", "crc32", "localHeaderOffset", "method", "name", "uncompressedSize"]);
    assert.equal(e.method, i === 1 ? 0 : 8);
    assert.equal(e.crc32, zcrc32(data) >>> 0);
    assert.equal(e.uncompressedSize, data.length);
    assert.equal(e.compressedSize, comp.length);
    assert.equal(e.localHeaderOffset, off);
    off += 30 + names[i].length + comp.length;
  });
  assert.ok(c.byName instanceof Map);
  assert.equal(c.byName.size, 5);
  assert.equal(c.byName.get("a.xml"), c.entries[0]);
  for (const e of c.entries) assert.ok(c.byName.has(e.name));
  // an ArrayBuffer reads the same; an empty archive is a real zero
  assert.deepEqual(readContainer(bytes.buffer).entries, c.entries);
  const empty = readContainer(zipOf([]));
  assert.equal(empty.ok, true); assert.equal(empty.count, 0); assert.deepEqual(empty.entries, []);
  // the central directory, never local headers, is the authority on contents
  const lying = zipOf([{ name: "x", data: "x", local: { sig: 0 } }, { name: "y", data: "y" }], { cdOrder: [1] });
  assert.deepEqual(readContainer(lying).entries.map((e) => e.name), ["y"]);
});

test("R3 readContainer refuses by name: too_short_for_zip, eocd_not_found, zip64, multi-disk, truncated", () => {
  const good = zipOf([{ name: "a", data: "a" }]);
  for (let n = 0; n < 22; n++) assert.deepEqual(readContainer(good.subarray(good.length - n)), { ok: false, why: "too_short_for_zip" });
  assert.deepEqual(readContainer(new Uint8Array(22)), { ok: false, why: "eocd_not_found" });
  // the EOCD window is the fixed 22 bytes plus up to 65,535 bytes of comment tail, and no further
  const within = new Uint8Array(good.length + 0xffff); within.set(good);
  assert.equal(readContainer(within).ok, true);
  const beyond = new Uint8Array(good.length + 0x10000); beyond.set(good);
  assert.deepEqual(readContainer(beyond), { ok: false, why: "eocd_not_found" });
  const commented = zipOf([{ name: "a", data: "a" }], { comment: "c".repeat(0xffff) });
  assert.equal(readContainer(commented).ok, true);
  for (const eocd of [{ totalEntries: 0xffff, diskEntries: 0xffff }, { cdSize: 0xffffffff }, { cdOffset: 0xffffffff }]) {
    assert.deepEqual(readContainer(zipOf([{ name: "a", data: "a" }], { eocd })), { ok: false, why: "zip64_unsupported" }, JSON.stringify(eocd));
  }
  assert.deepEqual(readContainer(zipOf([{ name: "a", data: "a" }, { name: "b", data: "b" }], { eocd: { diskEntries: 1 } })), { ok: false, why: "multi_disk_unsupported" });
  const T = { ok: false, why: "central_directory_truncated" };
  // the declared directory runs past the EOCD
  assert.deepEqual(readContainer(zipOf([{ name: "a", data: "a" }], { eocd: { cdSize: 1000 } })), T);
  assert.deepEqual(readContainer(zipOf([{ name: "a", data: "a" }], { eocd: { cdOffset: 5000 } })), T);
  // a record's signature is missing
  assert.deepEqual(readContainer(zipOf([{ name: "a", data: "a", cd: { sig: 0x12345678 } }])), T);
  // a record is short: more entries declared than the directory holds
  assert.deepEqual(readContainer(zipOf([{ name: "a", data: "a" }], { eocd: { totalEntries: 2, diskEntries: 2 } })), T);
  // a record's name runs past the directory's declared end
  const one = zipOf([{ name: "abcdef", data: "a" }]);
  const cdSize = 46 + 6;
  assert.deepEqual(readContainer(zipOf([{ name: "abcdef", data: "a" }], { eocd: { cdSize: cdSize - 3 } })), T);
  assert.equal(readContainer(one).ok, true);
  for (const x of ODD) assert.equal(readContainer(x).ok, false);
});

/* ------------------------------------------------------------------ R4 */

test("R4 crc32 is the ZIP-polynomial CRC-32, unsigned, pure", () => {
  assert.equal(crc32(new Uint8Array(0)), 0);
  assert.equal(crc32(enc("123456789")), 0xcbf43926);
  assert.equal(crc32(enc("The quick brown fox jumps over the lazy dog")), 0x414fa339);
  const r = prng(4);
  for (let n = 0; n <= 600; n++) {
    const b = new Uint8Array(n).map(() => Math.floor(r() * 256));
    const v = crc32(b);
    assert.equal(v, zcrc32(b) >>> 0, `length ${n}`);
    assert.ok(Number.isInteger(v) && v >= 0 && v < 2 ** 32);
    assert.equal(crc32(b), v);
  }
  const all = new Uint8Array(256).map((_, i) => i);
  assert.equal(crc32(all), zcrc32(all) >>> 0);
  for (const x of ODD) assert.equal(typeof crc32(x), "number");
});

/* ------------------------------------------------------------------ R5 */

test("R5 readPart returns a member only once its length and CRC-32 are verified", async () => {
  const big = "x".repeat(70000) + "tail";
  const bytes = zipOf([
    { name: "d.xml", data: "<deflated/>" },
    { name: "s.txt", data: "stored", method: 0 },
    { name: "big.xml", data: big },
    { name: "empty", data: "" },
  ]);
  const c = readContainer(bytes);
  assert.deepEqual(await readPart(bytes, c, "d.xml"), { ok: true, bytes: enc("<deflated/>") });
  assert.deepEqual(await readPart(bytes, c, "/s.txt"), { ok: true, bytes: enc("stored") });
  assert.equal(dec((await readPart(bytes.buffer, c, "big.xml")).bytes), big);
  assert.deepEqual(await readPart(bytes, c, "empty"), { ok: true, bytes: new Uint8Array(0) });
  // falls back to a linear scan by normalized name when byName lacks it
  const scan = { ...c, byName: new Map() };
  assert.deepEqual(await readPart(bytes, scan, "/d.xml"), { ok: true, bytes: enc("<deflated/>") });
  const lead = zipOf([{ name: "/lead.xml", data: "L" }]);
  assert.deepEqual(await readPart(lead, readContainer(lead), "lead.xml"), { ok: true, bytes: enc("L") });
});

test("R5 readPart's named refusals, each carrying the normalized name", async () => {
  const ok = zipOf([{ name: "a.xml", data: "hello" }]);
  const c = readContainer(ok);
  assert.deepEqual(await readPart(ok, c, "/nope.xml"), { ok: false, why: "part_absent", name: "nope.xml" });

  const offOut = zipOf([{ name: "a.xml", data: "hello", cd: { lhOffset: 100000 } }]);
  assert.deepEqual(await readPart(offOut, readContainer(offOut), "/a.xml"), { ok: false, why: "local_header_invalid", name: "a.xml" });
  const badSig = zipOf([{ name: "a.xml", data: "hello", local: { sig: 0x08074b50 } }]);
  assert.deepEqual(await readPart(badSig, readContainer(badSig), "a.xml"), { ok: false, why: "local_header_invalid", name: "a.xml" });
  const nearEnd = zipOf([{ name: "a.xml", data: "hello" }]);
  const cNear = readContainer(nearEnd);
  cNear.entries[0].localHeaderOffset = nearEnd.length - 29;
  assert.deepEqual(await readPart(nearEnd, { ...cNear, byName: new Map() }, "a.xml"), { ok: false, why: "local_header_invalid", name: "a.xml" });

  const trunc = zipOf([{ name: "a.xml", data: "hello", cd: { csize: 1 << 20 } }]);
  assert.deepEqual(await readPart(trunc, readContainer(trunc), "a.xml"), { ok: false, why: "member_truncated", name: "a.xml" });

  for (const method of [1, 9, 12, 14, 93, 99]) {
    const m = zipOf([{ name: "a.xml", data: "hello", cd: { method } }]);
    assert.deepEqual(await readPart(m, readContainer(m), "a.xml"), { ok: false, why: "unsupported_compression_method", method, name: "a.xml" });
  }

  const junk = zipOf([{ name: "a.xml", data: "hello", compressed: new Uint8Array([0xff, 0xff, 0xff, 0xff]) }]);
  assert.deepEqual(await readPart(junk, readContainer(junk), "a.xml"), { ok: false, why: "inflate_failed", name: "a.xml" });
  // a deflate stream cut short is never returned as whole
  const full = deflateRawSync(enc("the whole member ".repeat(50)));
  const cut = zipOf([{ name: "a.xml", data: "the whole member ".repeat(50), compressed: full.subarray(0, full.length - 4) }]);
  const cutRead = await readPart(cut, readContainer(cut), "a.xml");
  assert.equal(cutRead.ok, false);
  assert.ok(["inflate_failed", "size_mismatch", "crc_mismatch"].includes(cutRead.why));

  const small = zipOf([{ name: "a.xml", data: "hello", cd: { usize: 3 } }]);
  assert.deepEqual(await readPart(small, readContainer(small), "a.xml"), { ok: false, why: "size_mismatch", name: "a.xml", expected: 3, got: 5 });
  const large = zipOf([{ name: "a.xml", data: "hello", cd: { usize: 9 } }]);
  assert.deepEqual(await readPart(large, readContainer(large), "a.xml"), { ok: false, why: "size_mismatch", name: "a.xml", expected: 9, got: 5 });
  const storedLarge = zipOf([{ name: "a.xml", data: "hello", method: 0, cd: { usize: 4 } }]);
  assert.deepEqual(await readPart(storedLarge, readContainer(storedLarge), "a.xml"), { ok: false, why: "size_mismatch", name: "a.xml", expected: 4, got: 5 });
  // a compression bomb declaring a small size is refused, never inflated to completion and returned
  const bomb = zipOf([{ name: "bomb", data: new Uint8Array(64 << 20), cd: { usize: 10 } }]);
  const bombRead = await readPart(bomb, readContainer(bomb), "bomb");
  assert.equal(bombRead.why, "size_mismatch");
  assert.equal(bombRead.expected, 10);
  assert.ok(bombRead.got > 10);

  for (const cd of [{ crc: 0 }, { crc: (zcrc32(enc("hello")) ^ 1) >>> 0 }]) {
    const m = zipOf([{ name: "a.xml", data: "hello", cd }]);
    assert.deepEqual(await readPart(m, readContainer(m), "a.xml"), { ok: false, why: "crc_mismatch", name: "a.xml" });
  }
  const storedCrc = zipOf([{ name: "a.xml", data: "hello", method: 0, cd: { crc: 1 } }]);
  assert.deepEqual(await readPart(storedCrc, readContainer(storedCrc), "a.xml"), { ok: false, why: "crc_mismatch", name: "a.xml" });

  for (const x of ODD) {
    const r = await readPart(x, x, x);
    assert.equal(r.ok, false);
    assert.equal(r.why, "part_absent");
  }
});

/* ------------------------------------------------------------------ R6–R8 */

test("R6 MEASURED_OOXML_TEXT_BOUND_BYTES is 20 MiB and is sizeGuard's default bound", () => {
  assert.equal(MEASURED_OOXML_TEXT_BOUND_BYTES, 20 * 1024 * 1024);
  assert.equal(MEASURED_OOXML_TEXT_BOUND_BYTES, 20971520);
  assert.deepEqual(sizeGuard(20971520), { ok: true });
  assert.equal(sizeGuard(20971521).bound, 20971520);
});

test("R7 declaredTextBytes sums declared uncompressed sizes of matching parts, before inflation", () => {
  const bytes = zipOf([
    { name: "/word/document.xml", data: "abc", cd: { usize: 1000 } },
    { name: "word/media/i.png", data: "png", cd: { usize: 50000 } },
    { name: "word/footer1.xml", data: "abcdef" },
    { name: "docProps/core.xml", data: "", cd: { crc: 7 } },
  ]);
  const c = readContainer(bytes);
  const seen = [];
  const r = declaredTextBytes(c, (n) => { seen.push(n); return n.startsWith("word/") && n.endsWith(".xml"); });
  assert.deepEqual(seen, ["word/document.xml", "word/media/i.png", "word/footer1.xml", "docProps/core.xml"]);
  assert.deepEqual(r, { total: 1006, parts: [{ name: "word/document.xml", declared: 1000 }, { name: "word/footer1.xml", declared: 6 }] });
  assert.deepEqual(declaredTextBytes(c, () => false), { total: 0, parts: [] });
  assert.deepEqual(declaredTextBytes(c, () => true).total, 51006);
  for (const x of ODD) {
    assert.deepEqual(declaredTextBytes(x, () => true), { total: 0, parts: [] });
    if (typeof x !== "function") assert.deepEqual(declaredTextBytes(c, x), { total: 0, parts: [] });
  }
});

test("R8 sizeGuard: ok iff declaredBytes <= bound, else the stated over_size_bound refusal", () => {
  const refusal = (size, bound) => ({
    ok: false, text: "undetermined", why: "over_size_bound", size, bound,
    boundName: "MEASURED_OOXML_TEXT_BOUND_BYTES", metric: "declared_uncompressed_text_part_bytes",
  });
  const B = MEASURED_OOXML_TEXT_BOUND_BYTES;
  for (const n of [0, 1, B - 1, B]) assert.deepEqual(sizeGuard(n), { ok: true });
  for (const n of [B + 1, B * 4, Number.MAX_SAFE_INTEGER, Infinity]) assert.deepEqual(sizeGuard(n), refusal(n, B));
  for (const [n, b] of [[10, 10], [0, 0], [-5, -5]]) assert.deepEqual(sizeGuard(n, b), { ok: true });
  for (const [n, b] of [[11, 10], [1, 0], [7, -1]]) assert.deepEqual(sizeGuard(n, b), refusal(n, b));
  // a size that is not a number is never under the bound
  for (const n of [NaN, undefined, "x"]) assert.equal(sizeGuard(n).ok, false);
  for (const x of ODD) assert.doesNotThrow(() => sizeGuard(x, x));
});

/* ------------------------------------------------------------------ R9–R14 */

test("R9 CONTENT_TYPES_PART is \"[Content_Types].xml\"", () => {
  assert.equal(CONTENT_TYPES_PART, "[Content_Types].xml");
});

test("R10 CONTAINER_FLAVOURS: the three OPC rows then the three ODF rows; a row with no partMap is OPC", async () => {
  assert.deepEqual(CONTAINER_FLAVOURS, [
    { partMap: "opc", flavour: "docx", mainContentType: TYPES.docx, conventionalMainPart: "word/document.xml" },
    { partMap: "opc", flavour: "xlsx", mainContentType: TYPES.xlsx, conventionalMainPart: "xl/workbook.xml" },
    { partMap: "opc", flavour: "pptx", mainContentType: TYPES.pptx, conventionalMainPart: "ppt/presentation.xml" },
    { partMap: "odf", flavour: "odt", mimetype: TYPES.odt, conventionalMainPart: "content.xml" },
    { partMap: "odf", flavour: "ods", mimetype: TYPES.ods, conventionalMainPart: "content.xml" },
    { partMap: "odf", flavour: "odp", mimetype: TYPES.odp, conventionalMainPart: "content.xml" },
  ]);
  const VSDX = "application/vnd.ms-visio.drawing.main+xml";
  const vsdx = zipOf([{ name: "[Content_Types].xml", data: contentTypes({ "/visio/document.xml": VSDX }) }, { name: "visio/document.xml", data: "<v/>" }]);
  const r = await discriminate(vsdx, null, [{ flavour: "vsdx", mainContentType: VSDX, conventionalMainPart: "visio/document.xml" }]);
  assert.equal(r.format, "vsdx"); assert.equal(r.mainPart, "visio/document.xml");
  // the default table reads the same package as an unrecognised OPC package
  assert.equal((await discriminate(vsdx)).why, "opc_main_part_unrecognized");
});

const isSignals = (r) => Array.isArray(r.signals) && r.signals.every((s) => typeof s === "string");
const withoutSignals = ({ signals, ...rest }) => rest;

test("R11 discriminate: each flavour, from the container's own parts", async () => {
  for (const f of ["docx", "xlsx", "pptx"]) {
    const r = await discriminate(zipOf(opc(f)));
    assert.deepEqual(withoutSignals(r), { ok: true, format: f, mainPart: MAIN[f], confidence: "high" });
    assert.ok(isSignals(r));
  }
  for (const f of ["odt", "ods", "odp"]) {
    const r = await discriminate(zipOf(odf(f)));
    assert.deepEqual(withoutSignals(r), { ok: true, format: f, mainPart: "content.xml", confidence: "high" });
    assert.ok(isSignals(r));
  }
  // mainPart is the declared part name, not the conventional one
  const moved = zipOf([{ name: "[Content_Types].xml", data: contentTypes({ "/word/doc2.xml": TYPES.docx }) }, { name: "word/doc2.xml", data: "<d/>" }]);
  assert.equal((await discriminate(moved)).mainPart, "word/doc2.xml");
  // declared by a Default extension on the conventional main part
  const byDefault = zipOf([{ name: "[Content_Types].xml", data: contentTypes({}, { xml: TYPES.xlsx }) }, { name: "xl/workbook.xml", data: "<w/>" }]);
  assert.deepEqual(withoutSignals(await discriminate(byDefault)), { ok: true, format: "xlsx", mainPart: "xl/workbook.xml", confidence: "high" });
  const byDefaultUpper = zipOf([{ name: "[Content_Types].xml", data: contentTypes({}, { XML: TYPES.pptx }) }, { name: "ppt/presentation.xml", data: "<p/>" }]);
  assert.equal((await discriminate(byDefaultUpper)).format, "pptx");
});

test("R11 discriminate: the declared content type is recorded in signals and never used", async () => {
  const docx = zipOf(opc("docx"));
  const plain = zipOf([{ name: "a.txt", data: "a" }]);
  const base = await discriminate(docx);
  for (const ct of [TYPES.xlsx, "application/pdf", "application/zip", TYPES.docx]) {
    const r = await discriminate(docx, ct);
    assert.deepEqual(withoutSignals(r), withoutSignals(base));
    assert.ok(r.signals.some((s) => s.includes(ct)));
    const p = await discriminate(plain, ct);
    assert.deepEqual(withoutSignals(p), { ok: true, format: "zip" });
    assert.ok(p.signals.some((s) => s.includes(ct)));
    const n = await discriminate(enc("%PDF-1.7"), ct);
    assert.deepEqual(withoutSignals(n), { ok: false, why: "not_a_zip" });
  }
});

test("R11 discriminate: not a zip, an unreadable zip, a plain zip", async () => {
  for (const b of [new Uint8Array(0), enc("PK"), enc("%PDF-1.4 ..."), new Uint8Array(100)]) {
    const r = await discriminate(b);
    assert.deepEqual(withoutSignals(r), { ok: false, why: "not_a_zip" }); assert.ok(isSignals(r));
  }
  const cases = [
    [zipOf([{ name: "a", data: "a" }], { eocd: { cdSize: 999 } }), "central_directory_truncated"],
    [zipOf([{ name: "a", data: "a" }], { eocd: { cdOffset: 0xffffffff } }), "zip64_unsupported"],
    [zipOf([{ name: "a", data: "a" }, { name: "b", data: "b" }], { eocd: { diskEntries: 1 } }), "multi_disk_unsupported"],
  ];
  for (const [b, why] of cases) {
    const r = await discriminate(b);
    assert.deepEqual(withoutSignals(r), { ok: false, why }); assert.ok(isSignals(r));
  }
  const noEocd = zipOf([{ name: "a", data: "a" }]).subarray(0, 40);
  assert.equal((await discriminate(noEocd)).ok, false);
  for (const members of [[{ name: "a.txt", data: "a" }], [{ name: "word/document.xml", data: "<d/>" }, { name: "content.xml", data: "<c/>" }, { name: "META-INF/manifest.xml", data: "<m/>" }]]) {
    const r = await discriminate(zipOf(members));
    assert.deepEqual(withoutSignals(r), { ok: true, format: "zip" }); assert.ok(isSignals(r));
  }
});

test("R11 discriminate: every OPC undetermined reason", async () => {
  const U = (why, extra = {}) => ({ ok: true, format: "undetermined", why, ...extra });
  const ctBadCrc = zipOf([{ name: "[Content_Types].xml", data: contentTypes({ "/word/document.xml": TYPES.docx }), cd: { crc: 1 } }, { name: "word/document.xml", data: "<d/>" }]);
  assert.deepEqual(withoutSignals(await discriminate(ctBadCrc)), U("content_types_unreadable:crc_mismatch"));
  const ctBadMethod = zipOf([{ name: "[Content_Types].xml", data: "x", cd: { method: 12 } }]);
  assert.deepEqual(withoutSignals(await discriminate(ctBadMethod)), U("content_types_unreadable:unsupported_compression_method"));
  for (const data of ["", "hello", "<Type/>", "<Overrides/>"]) {
    const r = await discriminate(zipOf([{ name: "[Content_Types].xml", data }, { name: "word/document.xml", data: "<d/>" }]));
    assert.deepEqual(withoutSignals(r), U("content_types_unparseable"), data);
  }
  const prefixed = zipOf([{ name: "[Content_Types].xml", data: `<ct:Types xmlns:ct="x"><ct:Override PartName="/word/document.xml" ContentType="${TYPES.docx}"/></ct:Types>` }, { name: "word/document.xml", data: "<d/>" }]);
  assert.equal((await discriminate(prefixed)).format, "docx");
  const unknown = zipOf([{ name: "[Content_Types].xml", data: contentTypes({ "/x/main.xml": "application/x-other+xml" }, { xml: "application/xml" }) }, { name: "x/main.xml", data: "<x/>" }, { name: "word/document.xml", data: "<d/>" }]);
  assert.deepEqual(withoutSignals(await discriminate(unknown)), U("opc_main_part_unrecognized"));
  for (const f of ["docx", "xlsx", "pptx"]) {
    const absent = zipOf(opc(f).filter((m) => m.name !== MAIN[f]));
    const r = await discriminate(absent);
    assert.deepEqual(withoutSignals(r), U("declared_main_part_absent", { flavourDeclared: f })); assert.ok(isSignals(r));
  }
});

test("R11 discriminate: every ODF undetermined reason", async () => {
  const U = (why, extra = {}) => ({ ok: true, format: "undetermined", why, ...extra });
  // not first by central-directory index
  const second = odf("odt"); second.unshift(second.splice(1, 1)[0]);
  assert.deepEqual(withoutSignals(await discriminate(zipOf(second))), U("odf_mimetype_not_first"));
  // first in the central directory but not first in the file
  const late = odf("odt"); const lateMembers = [late[1], late[0], late[2]];
  const lateZip = zipOf(lateMembers, { cdOrder: [1, 0, 2] });
  assert.equal(readContainer(lateZip).entries[0].name, "mimetype");
  assert.deepEqual(withoutSignals(await discriminate(lateZip)), U("odf_mimetype_not_first"));
  // compressed
  const deflated = odf("ods"); deflated[0] = { ...deflated[0], method: 8 };
  assert.deepEqual(withoutSignals(await discriminate(zipOf(deflated))), U("odf_mimetype_not_stored"));
  // oversized, measured by the declared size
  const over = odf("odp", { mimetype: "a".repeat(ODF_MIMETYPE_MAX_BYTES + 1) });
  assert.deepEqual(withoutSignals(await discriminate(zipOf(over))), U("odf_mimetype_oversized"));
  const overDeclared = odf("odp"); overDeclared[0] = { ...overDeclared[0], cd: { usize: 1 << 30 } };
  assert.deepEqual(withoutSignals(await discriminate(zipOf(overDeclared))), U("odf_mimetype_oversized"));
  const atBound = odf("odp", { mimetype: "a".repeat(ODF_MIMETYPE_MAX_BYTES) });
  assert.deepEqual(withoutSignals(await discriminate(zipOf(atBound))), U("odf_mimetype_unrecognized"));
  // unreadable
  const badCrc = odf("odt"); badCrc[0] = { ...badCrc[0], cd: { crc: 3 } };
  assert.deepEqual(withoutSignals(await discriminate(zipOf(badCrc))), U("odf_mimetype_unreadable:crc_mismatch"));
  const truncated = odf("odt"); truncated[0] = { ...truncated[0], cd: { usize: 5 } };
  assert.deepEqual(withoutSignals(await discriminate(zipOf(truncated))), U("odf_mimetype_unreadable:size_mismatch"));
  // unrecognised: the exact, untrimmed value decides
  for (const v of [`${TYPES.odt}\n`, ` ${TYPES.odt}`, TYPES.odt.toUpperCase(), "application/epub+zip", "", "application/vnd.oasis.opendocument.graphics"]) {
    assert.deepEqual(withoutSignals(await discriminate(zipOf(odf("odt", { mimetype: v })))), U("odf_mimetype_unrecognized"), JSON.stringify(v));
  }
  for (const f of ["odt", "ods", "odp"]) {
    assert.deepEqual(withoutSignals(await discriminate(zipOf(odf(f, { manifest: false })))), U("odf_manifest_absent", { flavourDeclared: f }));
    assert.deepEqual(withoutSignals(await discriminate(zipOf(odf(f, { content: false })))), U("declared_main_part_absent", { flavourDeclared: f }));
  }
  // a caller table with no ODF rows never reads the mimetype member
  assert.equal((await discriminate(zipOf(odf("odt")), null, CONTAINER_FLAVOURS.filter((f) => f.partMap === "opc"))).format, "zip");
  // a table with only some ODF rows recognises only those
  assert.equal((await discriminate(zipOf(odf("ods")), null, CONTAINER_FLAVOURS.filter((f) => f.flavour === "odt"))).why, "odf_mimetype_unrecognized");
});

test("R11 discriminate never throws on odd arguments", async () => {
  const docx = zipOf(opc("docx"));
  for (const x of ODD) {
    const r = await discriminate(x, x, x);
    assert.equal(typeof r.ok, "boolean"); assert.ok(isSignals(r));
    const d = await discriminate(docx, null, x);
    assert.ok(isSignals(d));
    if (x !== undefined) assert.notEqual(d.format, "docx");
  }
  assert.equal((await discriminate(docx.buffer)).format, "docx");
  assert.equal((await discriminate(docx, null, [null, 5, "x", CONTAINER_FLAVOURS[0]])).format, "docx");
});

test("R12 OPC is tried before ODF: a container with both is read as OPC and the ODF branch never runs", async () => {
  const both = zipOf([...odf("odt"), ...opc("docx")]);
  const r = await discriminate(both);
  assert.deepEqual(withoutSignals(r), { ok: true, format: "docx", mainPart: "word/document.xml", confidence: "high" });
  assert.ok(!r.signals.some((s) => s.startsWith("odf:")));
  for (const [ct, why] of [["garbage", "content_types_unparseable"], [contentTypes({ "/x.xml": "application/x" }), "opc_main_part_unrecognized"]]) {
    const b = zipOf([...odf("odt"), { name: "[Content_Types].xml", data: ct }]);
    const u = await discriminate(b);
    assert.equal(u.format, "undetermined"); assert.equal(u.why, why);
    assert.ok(!u.signals.some((s) => s.startsWith("odf:")));
  }
});

test("R13 OPC rows are walked in the caller's order; the first declared row wins, Override before Default", async () => {
  const both = zipOf([
    { name: "[Content_Types].xml", data: contentTypes({ "/xl/workbook.xml": TYPES.xlsx, "/word/document.xml": TYPES.docx }) },
    { name: "word/document.xml", data: "<d/>" }, { name: "xl/workbook.xml", data: "<w/>" },
  ]);
  assert.equal((await discriminate(both)).format, "docx");
  const [docx, xlsx, pptx] = CONTAINER_FLAVOURS;
  assert.equal((await discriminate(both, null, [xlsx, docx])).format, "xlsx");
  assert.equal((await discriminate(both, null, [pptx, xlsx, docx])).format, "xlsx");
  // the first declared row wins even when its part is absent: no fall-through to a later row
  const firstAbsent = zipOf([
    { name: "[Content_Types].xml", data: contentTypes({ "/word/document.xml": TYPES.docx, "/xl/workbook.xml": TYPES.xlsx }) },
    { name: "xl/workbook.xml", data: "<w/>" },
  ]);
  assert.deepEqual(withoutSignals(await discriminate(firstAbsent)), { ok: true, format: "undetermined", why: "declared_main_part_absent", flavourDeclared: "docx" });
  assert.equal((await discriminate(firstAbsent, null, [xlsx, docx])).format, "xlsx");
  // an Override naming the type is preferred to a Default on the conventional part
  const overrideAndDefault = zipOf([
    { name: "[Content_Types].xml", data: contentTypes({ "/word/other.xml": TYPES.docx }, { xml: TYPES.docx }) },
    { name: "word/other.xml", data: "<o/>" }, { name: "word/document.xml", data: "<d/>" },
  ]);
  assert.equal((await discriminate(overrideAndDefault)).mainPart, "word/other.xml");
  // an Override on the conventional part with another type overrides its Default
  const overridden = zipOf([
    { name: "[Content_Types].xml", data: contentTypes({ "/word/document.xml": "application/xml" }, { xml: TYPES.docx }) },
    { name: "word/document.xml", data: "<d/>" },
  ]);
  assert.equal((await discriminate(overridden)).why, "opc_main_part_unrecognized");
});

test("R14 the ODF constants", () => {
  assert.equal(ODF_MIMETYPE_PART, "mimetype");
  assert.equal(ODF_MANIFEST_PART, "META-INF/manifest.xml");
  assert.equal(ODF_MIMETYPE_MAX_BYTES, 128);
});

/* ------------------------------------------------------------------ R15–R17 */

test("R15 relsPartFor gives the conventional relationships part", () => {
  for (const x of [undefined, null, ""]) assert.equal(relsPartFor(x), "_rels/.rels");
  assert.equal(relsPartFor(), "_rels/.rels");
  assert.equal(relsPartFor("word/document.xml"), "word/_rels/document.xml.rels");
  assert.equal(relsPartFor("a/b/c.xml"), "a/b/_rels/c.xml.rels");
  assert.equal(relsPartFor("document.xml"), "_rels/document.xml.rels");
  assert.equal(relsPartFor("ppt/slides/slide1.xml"), "ppt/slides/_rels/slide1.xml.rels");
});

const REL = (a) => `<Relationship ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(" ")}/>`;
const RELS = (...rs) => `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rs.join("")}</Relationships>`;

test("R16 parseRels reads every Relationship carrying a Target; External ones are outbound", () => {
  for (const x of [...ODD, "", "<Relationship Target='a'/>", "<Rels/>"]) assert.deepEqual(parseRels(x), { ok: false, why: "rels_unparseable" });
  assert.deepEqual(parseRels(RELS()), { ok: true, relationships: [], outbound: [] });
  const xml = RELS(
    REL({ Id: "rId1", Type: "t/image", Target: "media/i.png" }),
    REL({ Id: "rId2", Type: "t/hyperlink", Target: "https://example.org/a?b=1", TargetMode: "External" }),
    REL({ Id: "rId3", Type: "t/x", Target: "x.xml", TargetMode: "Internal" }),
    REL({ Id: "rId4", Type: "t/none" }),
    REL({ Target: "bare.xml" }),
    REL({ Id: "rId6", Target: "mailto:x@example.org", TargetMode: "External" }),
  );
  const r = parseRels(xml);
  const rels = [
    { id: "rId1", type: "t/image", target: "media/i.png", targetMode: null, external: false },
    { id: "rId2", type: "t/hyperlink", target: "https://example.org/a?b=1", targetMode: "External", external: true },
    { id: "rId3", type: "t/x", target: "x.xml", targetMode: "Internal", external: false },
    { id: null, type: null, target: "bare.xml", targetMode: null, external: false },
    { id: "rId6", type: null, target: "mailto:x@example.org", targetMode: "External", external: true },
  ];
  assert.deepEqual(r, { ok: true, relationships: rels, outbound: [rels[1], rels[4]] });
  // any namespace prefix on the root and elements
  const pre = `<pr:Relationships xmlns:pr="x"><pr:Relationship Id="a" Target="t" TargetMode="External"/></pr:Relationships>`;
  assert.deepEqual(parseRels(pre).outbound, [{ id: "a", type: null, target: "t", targetMode: "External", external: true }]);
});

test("R17 walkRels reads every _rels/*.rels part at any depth; unreadable ones are recorded, never dropped", async () => {
  const bytes = zipOf([
    { name: "_rels/.rels", data: RELS(REL({ Id: "r1", Target: "word/document.xml" })) },
    { name: "word/document.xml", data: "<d/>" },
    { name: "word/_rels/document.xml.rels", data: RELS(REL({ Id: "h1", Target: "https://a.example/", TargetMode: "External" }), REL({ Id: "i1", Target: "media/x.png" })) },
    { name: "word/_rels/bad.xml.rels", data: RELS(), cd: { crc: 9 } },
    { name: "a/b/c/_rels/deep.xml.rels", data: RELS(REL({ Id: "d1", Target: "file:///x", TargetMode: "External" })) },
    { name: "word/_rels/junk.xml.rels", data: "not xml" },
    { name: "foo_rels/x.rels", data: RELS(REL({ Id: "no", Target: "no", TargetMode: "External" })) },
    { name: "_rels/nested/x.rels", data: RELS(REL({ Id: "no", Target: "no", TargetMode: "External" })) },
    { name: "_rels/x.xml", data: RELS() },
    { name: "/ppt/_rels/presentation.xml.rels", data: RELS() },
  ]);
  const r = await walkRels(bytes, readContainer(bytes));
  assert.deepEqual(r, {
    ok: true,
    byPart: [
      { part: "_rels/.rels", relationships: [{ id: "r1", type: null, target: "word/document.xml", targetMode: null, external: false }], outbound: [] },
      {
        part: "word/_rels/document.xml.rels",
        relationships: [
          { id: "h1", type: null, target: "https://a.example/", targetMode: "External", external: true },
          { id: "i1", type: null, target: "media/x.png", targetMode: null, external: false },
        ],
        outbound: [{ id: "h1", type: null, target: "https://a.example/", targetMode: "External", external: true }],
      },
      { part: "a/b/c/_rels/deep.xml.rels", relationships: [{ id: "d1", type: null, target: "file:///x", targetMode: "External", external: true }], outbound: [{ id: "d1", type: null, target: "file:///x", targetMode: "External", external: true }] },
      { part: "ppt/_rels/presentation.xml.rels", relationships: [], outbound: [] },
    ],
    outbound: [
      { part: "word/_rels/document.xml.rels", id: "h1", type: null, target: "https://a.example/", targetMode: "External", external: true },
      { part: "a/b/c/_rels/deep.xml.rels", id: "d1", type: null, target: "file:///x", targetMode: "External", external: true },
    ],
    undetermined: [{ part: "word/_rels/bad.xml.rels", why: "crc_mismatch" }, { part: "word/_rels/junk.xml.rels", why: "rels_unparseable" }],
  });
  assert.deepEqual(await walkRels(zipOf([{ name: "a", data: "a" }]), readContainer(zipOf([{ name: "a", data: "a" }]))), { ok: true, byPart: [], outbound: [], undetermined: [] });
  for (const x of ODD) assert.deepEqual(await walkRels(x, x), { ok: true, byPart: [], outbound: [], undetermined: [] });
});

/* ------------------------------------------------------------------ R18–R19 */

test("R18 CORE_PROPERTIES_PART is \"docProps/core.xml\"", () => {
  assert.equal(CORE_PROPERTIES_PART, "docProps/core.xml");
});

const CORE = (inner) => `<?xml version="1.0"?><cp:coreProperties xmlns:cp="c" xmlns:dc="d" xmlns:dcterms="t">${inner}</cp:coreProperties>`;
const coreOf = async (data, extra = {}) => {
  const b = zipOf([{ name: "docProps/core.xml", data, ...extra }]);
  return readCoreProperties(b, readContainer(b));
};

test("R19 readCoreProperties: absent, unreadable, unparseable, and every field as the file carries it", async () => {
  const none = zipOf([{ name: "a", data: "a" }]);
  assert.deepEqual(await readCoreProperties(none, readContainer(none)), { ok: false, why: "part_absent" });
  assert.deepEqual(await coreOf(CORE(""), { cd: { crc: 1 } }), { ok: false, why: "crc_mismatch" });
  assert.deepEqual(await coreOf(CORE(""), { cd: { method: 6 } }), { ok: false, why: "unsupported_compression_method" });
  for (const d of ["", "<properties/>", "<dc:creator>x</dc:creator>"]) assert.deepEqual(await coreOf(d), { ok: false, why: "core_properties_unparseable" });
  const full = await coreOf(CORE(
    `<dc:title>Budget &amp; &#x41;&#66; &lt;draft&gt;</dc:title><dc:creator>A. Clerk</dc:creator>`
    + `<cp:lastModifiedBy>B &quot;Editor&quot; &apos;x&apos;</cp:lastModifiedBy><cp:revision>42</cp:revision>`
    + `<dcterms:created xsi:type="dcterms:W3CDTF">2024-01-02T03:04:05Z</dcterms:created>`
    + `<dcterms:modified xsi:type="dcterms:W3CDTF">2024-02-03T04:05:06Z</dcterms:modified>`,
  ));
  assert.deepEqual(full, {
    ok: true, creator: "A. Clerk", lastModifiedBy: `B "Editor" 'x'`, revision: "42", revisionNumber: 42,
    created: "2024-01-02T03:04:05Z", modified: "2024-02-03T04:05:06Z", title: "Budget & AB <draft>",
  });
  const empty = await coreOf(CORE(""));
  assert.deepEqual(empty, { ok: true, creator: null, lastModifiedBy: null, revision: null, revisionNumber: null, created: null, modified: null, title: null });
  const selfClosing = await coreOf(CORE(`<dc:creator/><cp:lastModifiedBy /><cp:revision/><dcterms:created xsi:type="x"/><dcterms:modified/><dc:title/>`));
  assert.deepEqual(selfClosing, empty);
  // an element present and empty is its own (empty) text, not absence
  assert.equal((await coreOf(CORE(`<dc:creator></dc:creator>`))).creator, "");
  for (const [rev, n] of [[" 7 ", 7], ["0", 0], ["007", 7], ["12a", null], ["1.5", null], ["-3", null], ["", null], ["\n 13\t", 13]]) {
    const r = await coreOf(CORE(`<cp:revision>${rev}</cp:revision>`));
    assert.equal(r.revision, rev); assert.equal(r.revisionNumber, n, JSON.stringify(rev));
  }
  // any namespace prefix, or none
  const bare = await coreOf(`<coreProperties><creator>X</creator><title>T</title></coreProperties>`);
  assert.equal(bare.creator, "X"); assert.equal(bare.title, "T");
  for (const x of ODD) assert.deepEqual(await readCoreProperties(x, x), { ok: false, why: "part_absent" });
});

/* ------------------------------------------------------------------ R20–R21 */

const MIME = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", jpe: "image/jpeg", gif: "image/gif", bmp: "image/bmp",
  tif: "image/tiff", tiff: "image/tiff", svg: "image/svg+xml", webp: "image/webp", emf: "image/emf", wmf: "image/wmf",
  emz: "image/x-emz", wmz: "image/x-wmz",
};
const partsOf = (bytes) => ({ ok: true, bytes, container: readContainer(bytes) });

test("R20 withContainerImages returns its input unchanged when no container was read", async () => {
  const out = { ok: true, text: "t" };
  const bytes = zipOf([{ name: "word/media/a.png", data: "png" }]);
  for (const o of [null, undefined, false, { ok: false, why: "x" }]) assert.equal(await withContainerImages(o, partsOf(bytes), "word/media/"), o);
  for (const p of [null, undefined, { ok: false }, { ok: true, bytes }]) assert.equal(await withContainerImages(out, p, "word/media/"), out);
  assert.equal(await withContainerImages(Promise.resolve(out), null, "word/media/"), out);
});

test("R20 withContainerImages enumerates every image member under dir, content-addressed, in directory order", async () => {
  const exts = Object.keys(MIME);
  const members = [
    { name: "word/media/", data: "" },
    { name: "word/media/sub/", data: "" },
    ...exts.map((e, i) => ({ name: `word/media/img${i}.${e}`, data: `bytes of ${e} ${i}`, method: i % 2 ? 0 : 8 })),
    { name: "word/media/clip.wav", data: "audio" },
    { name: "word/media/noext", data: "n" },
    { name: "word/media.png", data: "outside" },
    { name: "word/other/x.png", data: "outside" },
    { name: "/word/media/sub/deep.PNG", data: "deep" },
  ];
  const bytes = zipOf(members);
  const base = { ok: true, text: "body", extra: [1] };
  for (const dir of ["word/media/", "/word/media/"]) {
    const r = await withContainerImages(Promise.resolve(base), partsOf(bytes), dir);
    const want = [
      ...exts.map((e, i) => ({ data: `bytes of ${e} ${i}`, mime: MIME[e], name: `img${i}.${e}` })),
      { data: "deep", mime: "image/png", name: "deep.PNG" },
    ].map(({ data, mime, name }) => {
      const part = sha256(enc(data));
      return { kind: "image", ref: `image ${part.slice(0, 12)}`, part, mime, name };
    });
    assert.deepEqual(r, { ...base, images: want });
  }
  // a directory that exists and holds no image is a real zero
  const noImages = zipOf([{ name: "ppt/media/", data: "" }, { name: "ppt/media/a.mp4", data: "v" }]);
  assert.deepEqual(await withContainerImages(base, partsOf(noImages), "ppt/media/"), { ...base, images: [] });
  assert.deepEqual(await withContainerImages(base, partsOf(noImages), "Pictures/"), { ...base, images: [] });
});

test("R20 withContainerImages: the whole list is null, never partial, when media is over the bound or unreadable", async () => {
  const base = { ok: true, text: "body" };
  const B = MEASURED_OOXML_TEXT_BOUND_BYTES;
  const over = zipOf([{ name: "m/a.png", data: "a", cd: { usize: B } }, { name: "m/b.jpg", data: "b", cd: { usize: 1 } }, { name: "m/c.wav", data: "c", cd: { usize: B } }]);
  assert.deepEqual(await withContainerImages(base, partsOf(over), "m/"), { ...base, images: null, imagesWhy: `media_over_size_bound:${B + 1}>${B}` });
  const at = zipOf([{ name: "m/a.png", data: "a", cd: { usize: B } }]);
  assert.deepEqual((await withContainerImages(base, partsOf(at), "m/")).imagesWhy, "media_part_unreadable:m/a.png:size_mismatch");
  const unreadable = zipOf([{ name: "m/a.png", data: "a" }, { name: "m/b.gif", data: "b", cd: { crc: 5 } }, { name: "m/c.png", data: "c" }]);
  assert.deepEqual(await withContainerImages(base, partsOf(unreadable), "m/"), { ...base, images: null, imagesWhy: "media_part_unreadable:m/b.gif:crc_mismatch" });
  for (const x of ODD) await assert.doesNotReject(withContainerImages(base, { ok: true, bytes: x, container: x }, x));
});

test("R21 an image's ref is exactly `image ` plus the first 12 hex characters of its SHA-256 part", async () => {
  const r = prng(21);
  const members = Array.from({ length: 40 }, (_, i) => ({ name: `Pictures/p${i}.png`, data: new Uint8Array(1 + i * 37).map(() => Math.floor(r() * 256)) }));
  const bytes = zipOf(members);
  const { images } = await withContainerImages({ ok: true }, partsOf(bytes), "Pictures/");
  assert.equal(images.length, 40);
  images.forEach((img, i) => {
    assert.equal(img.part, sha256(members[i].data));
    assert.match(img.part, /^[0-9a-f]{64}$/);
    assert.equal(img.ref, `image ${img.part.slice(0, 12)}`);
  });
});

/* ------------------------------------------------------------------ R22–R26 */

/** Every service called once on the given archive. */
async function callAll(bytes) {
  const c = readContainer(bytes);
  const parts = c.ok ? c.entries.map((e) => e.name) : [];
  return {
    magic: hasZipMagic(bytes), crc: crc32(bytes), norm: normalizePartName("/a/b"), c,
    reads: await Promise.all(parts.map((n) => readPart(bytes, c, n))),
    text: c.ok ? declaredTextBytes(c, (n) => n.endsWith(".xml")) : null,
    guard: sizeGuard(12345), d: await discriminate(bytes, "application/octet-stream"),
    relsFor: relsPartFor("word/document.xml"), rels: parseRels(RELS(REL({ Target: "x" }))),
    walk: c.ok ? await walkRels(bytes, c) : null, core: c.ok ? await readCoreProperties(bytes, c) : null,
    images: await withContainerImages({ ok: true }, { ok: true, bytes, container: c.ok ? c : null }, "word/media/"),
  };
}
const richDocx = () => zipOf(opc("docx", [
  { name: "word/_rels/document.xml.rels", data: RELS(REL({ Id: "h", Target: "https://x.example/", TargetMode: "External" })) },
  { name: "docProps/core.xml", data: CORE("<dc:creator>c</dc:creator><cp:revision>3</cp:revision>") },
  { name: "word/media/image1.png", data: "\x89PNG fake" },
]));

test("R22 pure: no store, no network, no clock; identical inputs give identical results", async () => {
  const touched = [];
  const saved = { fetch: globalThis.fetch, Date: globalThis.Date, perf: globalThis.performance, random: Math.random, caches: globalThis.caches, WebSocket: globalThis.WebSocket };
  const spy = (label, fn) => function (...a) { touched.push(label); return fn?.apply(this, a); };
  const SpyDate = new Proxy(saved.Date, { construct(t, a) { touched.push("new Date"); return new t(...a); }, apply(t, s, a) { touched.push("Date()"); return t(...a); }, get(t, k) { if (k === "now") return spy("Date.now", t.now); return t[k]; } });
  const bytes = [richDocx(), zipOf(odf("ods")), zipOf([{ name: "a", data: "a" }]), enc("not a zip")];
  let first, second;
  try {
    globalThis.fetch = spy("fetch");
    globalThis.Date = SpyDate;
    Object.defineProperty(globalThis, "performance", { value: { now: spy("performance.now", () => 0) }, configurable: true, writable: true });
    Math.random = spy("Math.random", saved.random);
    globalThis.caches = new Proxy({}, { get(_, k) { touched.push(`caches.${String(k)}`); return undefined; } });
    globalThis.WebSocket = spy("WebSocket");
    first = await Promise.all(bytes.map(callAll));
    second = await Promise.all(bytes.map((b) => callAll(b.slice())));
  } finally {
    globalThis.fetch = saved.fetch; globalThis.Date = saved.Date; Math.random = saved.random;
    Object.defineProperty(globalThis, "performance", { value: saved.perf, configurable: true, writable: true });
    if (saved.caches === undefined) delete globalThis.caches; else globalThis.caches = saved.caches;
    if (saved.WebSocket === undefined) delete globalThis.WebSocket; else globalThis.WebSocket = saved.WebSocket;
  }
  assert.deepEqual(touched, []);
  assert.deepEqual(second, first);
  assert.equal(first[0].d.format, "docx"); assert.equal(first[0].images.images.length, 1);
});

test("R23 zero runtime dependency: the module imports nothing; inflate is DecompressionStream(deflate-raw), hashing crypto.subtle", async () => {
  const imported = [];
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (context.parentURL && context.parentURL.startsWith(MODULE_URL)) imported.push(specifier);
      return next(specifier, context);
    },
  });
  let fresh;
  try { fresh = await import(`${MODULE_URL}?r23=${Date.now()}`); } finally { hooks.deregister(); }
  assert.deepEqual(imported, []);
  assert.deepEqual(Object.keys(fresh).sort(), Object.keys(M).sort());

  const formats = [];
  const digests = [];
  const RealDS = globalThis.DecompressionStream;
  const realDigest = crypto.subtle.digest;
  globalThis.DecompressionStream = class extends RealDS { constructor(f) { formats.push(f); super(f); } };
  crypto.subtle.digest = function (alg, data) { digests.push(alg); return realDigest.call(this, alg, data); };
  try {
    const bytes = zipOf([{ name: "m/a.png", data: "deflated image" }]);
    const c = readContainer(bytes);
    assert.deepEqual(await readPart(bytes, c, "m/a.png"), { ok: true, bytes: enc("deflated image") });
    const r = await withContainerImages({ ok: true }, { ok: true, bytes, container: c }, "m/");
    assert.equal(r.images[0].part, sha256(enc("deflated image")));
  } finally {
    globalThis.DecompressionStream = RealDS;
    crypto.subtle.digest = realDigest;
  }
  assert.ok(formats.length >= 2 && formats.every((f) => f === "deflate-raw"));
  assert.deepEqual(digests, ["SHA-256"]);
});

test("R24 the central directory is the sole authority for size, CRC and method; a local header only locates bytes", async () => {
  const lying = zipOf([
    { name: "a.xml", data: "deflated truth", local: { method: 0, crc: 0, csize: 0, usize: 0 } },
    { name: "b.txt", data: "stored truth", method: 0, local: { method: 8, crc: 123, csize: 1, usize: 99999 } },
    { name: "c.xml", data: "flags", local: { flags: 0x08, crc: 0, csize: 0, usize: 0 } },
  ]);
  const c = readContainer(lying);
  assert.deepEqual(c.entries.map((e) => [e.method, e.uncompressedSize]), [[8, 14], [0, 12], [8, 5]]);
  assert.deepEqual(await readPart(lying, c, "a.xml"), { ok: true, bytes: enc("deflated truth") });
  assert.deepEqual(await readPart(lying, c, "b.txt"), { ok: true, bytes: enc("stored truth") });
  assert.deepEqual(await readPart(lying, c, "c.xml"), { ok: true, bytes: enc("flags") });
  // a local header telling the truth does not rescue a central directory that disagrees with the bytes
  const cdWrong = zipOf([{ name: "a", data: "hello", cd: { crc: 77 } }, { name: "b", data: "hello", cd: { usize: 4 } }, { name: "c", data: "hello", cd: { method: 0 } }]);
  const cw = readContainer(cdWrong);
  assert.equal((await readPart(cdWrong, cw, "a")).why, "crc_mismatch");
  assert.equal((await readPart(cdWrong, cw, "b")).why, "size_mismatch");
  assert.equal((await readPart(cdWrong, cw, "c")).ok, false);
  // declared sizes for the size guard come from the central directory too
  assert.equal(declaredTextBytes(c, () => true).total, 14 + 12 + 5);
});

test("R25 never invents structure and never throws on malformed or adversarial bytes", async () => {
  const seeds = [richDocx(), zipOf(odf("odt")), zipOf(opc("xlsx")), zipOf([{ name: "a", data: "a" }])];
  const r = prng(25);
  let cases = 0;
  for (const seed of seeds) {
    for (let k = 0; k < 150; k++) {
      let b = seed.slice();
      const kind = k % 5;
      if (kind === 0) for (let j = 0; j < 1 + Math.floor(r() * 8); j++) b[Math.floor(r() * b.length)] ^= 1 << Math.floor(r() * 8);
      else if (kind === 1) b = b.subarray(0, Math.floor(r() * b.length));
      else if (kind === 2) b = b.subarray(Math.floor(r() * b.length));
      else if (kind === 3) { const at = Math.floor(r() * b.length); const ins = new Uint8Array(1 + Math.floor(r() * 16)).map(() => Math.floor(r() * 256)); b = new Uint8Array([...b.subarray(0, at), ...ins, ...b.subarray(at)]); }
      else for (let j = 0; j < 4; j++) { const at = Math.floor(r() * (b.length - 4)); new DataView(b.buffer, b.byteOffset).setUint32(at, [0xffffffff, 0, 0x7fffffff, b.length][j], true); }
      cases++;
      const all = await callAll(b);
      for (const res of [all.c, all.d, ...all.reads, all.core].filter(Boolean)) {
        assert.equal(typeof res.ok, "boolean");
        if (!res.ok) assert.equal(typeof res.why, "string");
      }
      if (all.c.ok) {
        all.c.entries.forEach((e, i) => {
          const rd = all.reads[i];
          if (rd.ok && all.c.byName.get(e.name) === e) {
            assert.equal(rd.bytes.length, e.uncompressedSize);
            assert.equal(zcrc32(rd.bytes) >>> 0, e.crc32);
          }
        });
        assert.equal(all.walk.ok, true);
      } else {
        assert.ok(["undetermined", undefined].includes(all.d.format) || all.d.ok === false);
        assert.ok(!["docx", "xlsx", "pptx", "odt", "ods", "odp"].includes(all.d.format));
      }
      if (all.d.ok && all.d.format === "undetermined") assert.equal(typeof all.d.why, "string");
      if (all.images.images === null) assert.equal(typeof all.images.imagesWhy, "string");
    }
  }
  assert.equal(cases, 600);
  // random bytes carrying the magic
  for (let k = 0; k < 200; k++) {
    const b = new Uint8Array(4 + Math.floor(r() * 300)).map(() => Math.floor(r() * 256));
    b.set([0x50, 0x4b, 0x03, 0x04]);
    const d = await discriminate(b);
    assert.ok(!["docx", "xlsx", "pptx", "odt", "ods", "odp"].includes(d.format));
  }
});

test("R26 no jurisdiction: every service runs on bytes and caller tables alone, and names no place", async () => {
  const strings = [];
  const walk = (v, seen = new Set()) => {
    if (typeof v === "string") strings.push(v);
    else if (v && typeof v === "object" && !seen.has(v)) { seen.add(v); for (const x of Object.values(v)) walk(x, seen); }
  };
  walk(Object.fromEntries(Object.entries(M)));
  const all = await Promise.all([richDocx(), zipOf(odf("odp")), zipOf([{ name: "a", data: "a" }])].map(callAll));
  walk(all.map(({ c, reads, ...rest }) => rest));
  const places = /oakland|alameda|california|\bca\b|berkeley|san francisco|county|city of|municipal/i;
  for (const s of strings) assert.doesNotMatch(s, places, s);
  // a caller-supplied table is the only vocabulary the flavour decision reads
  const X = "application/x-local-format+xml";
  const b = zipOf([{ name: "[Content_Types].xml", data: contentTypes({ "/local/main.xml": X }) }, { name: "local/main.xml", data: "<l/>" }]);
  assert.equal((await discriminate(b, null, [{ flavour: "local", mainContentType: X, conventionalMainPart: "local/main.xml" }])).format, "local");
});
