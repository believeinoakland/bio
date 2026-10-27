/* image-cover R13: `photoFactsOf` reads a photograph's kept fields as typed, bounded data and lists what the picture leaves out.
 *
 * The expected values are the ones `fixtures/make-photo-fixtures.py` wrote into each photo (Pillow reads the EXIF back there),
 * never read from the module. The hostile photographs are built here byte by byte. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { photoFactsOf, LEFT_OUT_KINDS, COVER_REFUSALS } from "../../../src/image-cover/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { fixture } from "./answers.mjs";
import { pngChunk } from "./hostile.mjs";
import { tiff, asc, short, rationals, jpegWithExif, pngWithExif, pngWithChunks, textChunk, ztxtChunk, iccpChunk, jpegWithApp1, ascii } from "./photo-hostile.mjs";

const PHOTOS = JSON.parse(readFileSync(new URL("./fixtures/photo-cases.json", import.meta.url), "utf8"));
const TEXT = boundOf("image", "photo_text_chars"), FIELD = boundOf("image", "photo_field_chars");
const MiB = 1048576;
const leftOut = (r) => Object.fromEntries(r.left_out.map((x) => [x.kind, { count: x.count, bytes: x.bytes }]));
const facts = async (bytes) => { const r = await photoFactsOf(bytes); assert.equal(r.ok, true, `${r.code} ${r.detail}`); return r; };

test("R13 each kept field by name, against the values written into the reference photographs: a JPEG with all of them, a PNG, XMP alone, an animated PNG", async () => {
  for (const c of PHOTOS.facts) {
    const r = await facts(fixture(c.file));
    assert.deepEqual(r.facts, { ...c.facts, width: c.width, height: c.height }, `${c.file}: the kept fields, no more and no other`);
    assert.deepEqual(leftOut(r), c.left_out, `${c.file}: what is left out, by kind with count and bytes`);
  }
});

test("R13 the closed lists: facts carry only the table's names, left_out only the closed set of kinds, in its order", async () => {
  const KEPT = new Set(["orientation", "time_taken", "time_modified", "gps_latitude", "gps_longitude", "gps_altitude", "gps_direction", "gps_time", "gps_datum",
    "width", "height", "make", "model", "lens", "software", "exposure_time", "f_number", "iso", "focal_length", "flash", "body_serial", "lens_serial", "owner_name",
    "image_unique_id", "artist", "copyright", "description", "comments", "keywords", "byline", "credit", "place_name", "png_text", "profile_description", "profile_colour_space"]);
  assert.deepEqual([...LEFT_OUT_KINDS], ["thumbnail", "maker_note", "profile", "extra_picture", "after_end", "xmp", "credentials", "other_metadata", "unreadable"]);
  for (const c of PHOTOS.facts) {
    const r = await facts(fixture(c.file));
    for (const k of Object.keys(r.facts)) assert.ok(KEPT.has(k), `${c.file}: ${k} is not on the list`);
    const kinds = r.left_out.map((x) => x.kind);
    assert.deepEqual(kinds, LEFT_OUT_KINDS.filter((k) => kinds.includes(k)), "closed set, in order");
    for (const x of r.left_out) assert.ok(Number.isSafeInteger(x.count) && x.count > 0 && Number.isSafeInteger(x.bytes) && x.bytes >= 0, `${c.file} ${x.kind}`);
  }
});

test("R13 a bare photograph says nothing and lists nothing left out; its size is its own", async () => {
  for (const name of ["photo-bare.jpg", "photo-bare.png", "grey.png", "adobe-ycc.jpg"]) {
    const r = await facts(fixture(name));
    assert.deepEqual(r.left_out, [], name);
    assert.deepEqual(Object.keys(r.facts).sort(), ["height", "width"], name);
  }
});

test("R13 the serial numbers, owner, image id, artist and copyright holder are read as data; coordinates are numbers in range", async () => {
  const r = await facts(fixture("photo-full.jpg"));
  for (const k of ["body_serial", "lens_serial", "owner_name", "image_unique_id", "artist", "copyright"]) assert.equal(typeof r.facts[k], "string", k);
  for (const k of ["gps_latitude", "gps_longitude", "gps_altitude", "gps_direction"]) assert.equal(typeof r.facts[k], "number", k);
  assert.ok(Math.abs(r.facts.gps_latitude) <= 90 && Math.abs(r.facts.gps_longitude) <= 180);
});

/* ── hostile fields, omitted or neutralised within bound ─────────────────── */

test("R13 latitude 91, longitude 181, altitude and direction out of range, a missing hemisphere and a zero denominator are each omitted and counted unreadable, never guessed", async () => {
  const bad = (gps) => jpegWithExif(tiff({ ifd0: [short(0x0112, 1)], gps }));
  const lat = (deg, ref = "N") => [{ tag: 1, type: 2, value: [...ascii(ref), 0] }, rationals(2, [deg, 1], [0, 1], [0, 1])];
  let r = await facts(bad(lat(91)));
  assert.equal("gps_latitude" in r.facts, false);
  assert.equal(r.facts.orientation, 1);
  assert.deepEqual(leftOut(r).unreadable?.count, 1);
  r = await facts(bad(lat(90)));
  assert.equal(r.facts.gps_latitude, 90, "the boundary is in range");
  r = await facts(bad([{ tag: 3, type: 2, value: [...ascii("E"), 0] }, rationals(4, [181, 1], [0, 1], [0, 1])]));
  assert.equal("gps_longitude" in r.facts, false);
  r = await facts(bad([{ tag: 1, type: 2, value: [...ascii("X"), 0] }, rationals(2, [10, 1], [0, 1], [0, 1])]));
  assert.equal("gps_latitude" in r.facts, false, "an unknown hemisphere");
  r = await facts(bad(lat(10).slice(1)));
  assert.equal("gps_latitude" in r.facts, false, "no hemisphere");
  r = await facts(bad([{ tag: 1, type: 2, value: [...ascii("N"), 0] }, rationals(2, [10, 0], [0, 1], [0, 1])]));
  assert.equal("gps_latitude" in r.facts, false, "a zero denominator");
  r = await facts(bad([rationals(0x11, [361, 1]), rationals(6, [9999999, 1])]));
  assert.ok(!("gps_direction" in r.facts) && !("gps_altitude" in r.facts));
  assert.ok(leftOut(r).unreadable.count >= 2);
  r = await facts(bad([{ tag: 1, type: 2, value: [...ascii("S"), 0] }, rationals(2, [37, 1], [30, 1], [0, 1])]));
  assert.equal(r.facts.gps_latitude, -37.5, "south is negative");
});

test("R13 a long string in EXIF is omitted and counted, a long text field is cut to its bound, a short one is kept; none passes the bound", async () => {
  const huge = new Uint8Array(MiB).fill(0x61);
  const long = new Uint8Array(200 * 1024).fill(0x61);
  let r = await facts(pngWithExif(tiff({ ifd0: [{ tag: 0x010e, type: 2, value: [...long, 0] }, asc(0x010f, "Cam")] })));
  assert.equal("description" in r.facts, false, "200 KB in EXIF: omitted");
  assert.equal(r.facts.make, "Cam", "a field beside it still reads");
  assert.ok(leftOut(r).unreadable.count >= 1);
  r = await facts(pngWithChunks([textChunk("Comment", huge)]));
  assert.equal(r.facts.png_text[0].text.length, TEXT, "a PNG's text is plain text cut to the bound");
  r = await facts(jpegWithExif(tiff({ ifd0: [asc(0x010f, "M".repeat(FIELD + 10))] })));
  assert.equal(r.facts.make, "M".repeat(FIELD), "a camera make a little over its bound is cut to it");
  r = await facts(jpegWithExif(tiff({ ifd0: [asc(0x010f, "M".repeat(FIELD * 4 + 10))] })));
  assert.equal("make" in r.facts, false, "one far over it is omitted and counted");
  assert.ok(leftOut(r).unreadable.count >= 1);
});

test("R13 text is plain: control and bidi characters are removed, an invalid UTF-8 sequence drops the value, markup stays inert text", async () => {
  const rlo = [0xe2, 0x80, 0xae], lri = [0xe2, 0x81, 0xa6], zw = [0xe2, 0x80, 0x8b];
  const script = [...ascii("<script>alert(1)</script>"), ...rlo, ...ascii("gnp.exe"), ...lri, 0x07, ...zw, ...ascii("end"), 0x0a, ...ascii("line")];
  const r = await facts(jpegWithExif(tiff({ ifd0: [{ tag: 0x010e, type: 2, value: [...script, 0] }, { tag: 0x010f, type: 2, value: [0x4d, 0xfc, 0x6c, 0x6c, 0x65, 0x72, 0] }] })));
  const d = r.facts.description;
  assert.equal(typeof d, "string");
  assert.equal(d, "<script>alert(1)</script>gnp.exeend line", "the characters that reorder or hide text are gone; the markup is only characters");
  for (const ch of d) {
    const cp = ch.codePointAt(0);
    assert.ok(!(cp < 0x20 || (cp >= 0x7f && cp <= 0x9f) || (cp >= 0x200b && cp <= 0x200f) || (cp >= 0x202a && cp <= 0x202e) || (cp >= 0x2066 && cp <= 0x2069)), `U+${cp.toString(16)} remains`);
  }
  assert.equal("make" in r.facts, false, "a Latin-1 'M\\xfcller' is not UTF-8: dropped");
  assert.ok(leftOut(r).unreadable.count >= 1);
});

test("R13 a directory that points to itself, a directory in a cycle and a huge entry count are each unreadable, and the walk ends", async () => {
  let r = await facts(jpegWithExif(tiff({ ifd0: [asc(0x010f, "Cam")], sub: [asc(0xa431, "S1")], selfPoint: true })));
  assert.equal(r.facts.make, "Cam");
  assert.ok(leftOut(r).unreadable.count >= 1);
  assert.equal("body_serial" in r.facts, false);
  /* IFD0's next-IFD offset names IFD0: the thumbnail directory is the same one */
  r = await facts(jpegWithExif(tiff({ ifd0: [asc(0x010f, "Cam")], next: 8 })));
  assert.equal(r.facts.make, "Cam");
  assert.ok(leftOut(r).unreadable.count >= 1);
  /* sixty thousand entries declared */
  const t = Uint8Array.from([...ascii("MM"), 0, 42, 0, 0, 0, 8, 0xea, 0x60, ...new Uint8Array(40)]);
  r = await facts(jpegWithExif(t));
  assert.deepEqual(r.facts.make, undefined);
  assert.ok(leftOut(r).unreadable.count >= 1);
  /* not a TIFF at all, and a TIFF cut short */
  r = await facts(jpegWithExif(Uint8Array.from(ascii("garbage, not tiff at all"))));
  assert.ok(leftOut(r).unreadable.count >= 1);
  r = await facts(jpegWithExif(tiff({ ifd0: [asc(0x010f, "Camera name long enough")] }).subarray(0, 30)));
  assert.equal(r.ok, true);
});

test("R13 a maker note of 5 MB, declared or real, is named in left_out with a size no larger than the file, and read by nothing", async () => {
  let r = await facts(jpegWithExif(tiff({ ifd0: [asc(0x010f, "Cam")], sub: [{ tag: 0x927c, type: 7, count: 5 * MiB, raw: [0, 0, 0, 200] }] })));
  const declared = leftOut(r).maker_note;
  assert.equal(declared.count, 1);
  assert.ok(declared.bytes <= fixture("photo-bare.jpg").length + 400, "the size is bounded by the bytes that exist");
  const note = new Uint8Array(600 * 1024).fill(7);
  r = await facts(pngWithExif(tiff({ ifd0: [asc(0x010f, "Cam")], sub: [{ tag: 0x927c, type: 7, value: [...note] }] })));
  assert.deepEqual(leftOut(r).maker_note, { count: 1, bytes: note.length });
  assert.equal(r.facts.make, "Cam");
  /* an EXIF block over its bound is not walked */
  r = await facts(pngWithExif(tiff({ ifd0: [asc(0x010f, "Cam")], sub: [{ tag: 0x927c, type: 7, value: [...new Uint8Array(MiB + 10)] }] })));
  assert.equal("make" in r.facts, false);
  assert.ok(leftOut(r).unreadable.count >= 1);
});

test("R13 a compressed-text bomb and a profile claiming a gigabyte are stopped at their bounds without allocating them", async () => {
  const lean = async (run) => {
    const before = process.memoryUsage().arrayBuffers;
    let peak = 0;
    const watch = setInterval(() => { peak = Math.max(peak, process.memoryUsage().arrayBuffers - before); }, 1);
    const r = await run();
    clearInterval(watch);
    return { r, peak: Math.max(peak, process.memoryUsage().arrayBuffers - before) };
  };
  const bomb = new Uint8Array(200 * MiB);                     // 200 MB of zeros deflates to a few hundred kilobytes
  const z = await lean(() => photoFactsOf(pngWithChunks([ztxtChunk("Bomb", bomb), textChunk("Author", ascii("Pat"))])));
  assert.equal(z.r.ok, true);
  assert.deepEqual(z.r.facts.png_text, [{ keyword: "Author", text: "Pat" }], "the bomb is dropped, the text beside it is read");
  assert.ok(leftOut(z.r).unreadable.count >= 1);
  assert.ok(z.peak < 64 * MiB, `the bomb cost ${z.peak}`);
  const p = await lean(() => photoFactsOf(pngWithChunks([iccpChunk(bomb)])));
  assert.equal(p.r.ok, true);
  assert.equal(leftOut(p.r).profile.count, 1, "named as profile");
  assert.ok(p.peak < 64 * MiB, `the profile bomb cost ${p.peak}`);
});

test("R13 XMP that declares a DOCTYPE or an entity is not read, an entity reference is a character and not an expansion, and the packet is never carried", async () => {
  const wrap = (inner) => [...ascii("http://ns.adobe.com/xap/1.0/"), 0, ...ascii(`<x:xmpmeta xmlns:rdf="r" xmlns:dc="d">${inner}</x:xmpmeta>`)];
  const dc = (v) => `<rdf:Description><dc:creator><rdf:Seq><rdf:li>${v}</rdf:li></rdf:Seq></dc:creator></rdf:Description>`;
  let r = await facts(jpegWithApp1(wrap(`<!DOCTYPE x [<!ENTITY a "aaaaaaaa">]>${dc("&a;&a;")}`)));
  assert.equal("artist" in r.facts, false);
  assert.equal(leftOut(r).xmp.count, 1);
  r = await facts(jpegWithApp1(wrap(dc("A &amp; B &lt;i&gt; &#65;&#x42;"))));
  assert.equal(r.facts.artist, "A & B <i> AB");
  r = await facts(jpegWithApp1(wrap(dc("x".repeat(FIELD * 3)))));
  assert.equal(r.facts.artist.length, FIELD, "cut to the field bound");
  r = await facts(jpegWithApp1(wrap("<rdf:Description dc:creator=\"unterminated")));
  assert.equal(r.ok, true);
});

test("R13 never refuses a photograph for its fields, never throws: damaged and truncated photographs answer facts or a named refusal", async () => {
  let seed = 99;
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
  for (const name of ["photo-full.jpg", "photo-full.png", "photo-apng.png", "photo-xmp.jpg", "phone-420-o6.jpg", "screenshot-rgba-o6.png", "photo-profile-cmyk.jpg"]) {
    const orig = fixture(name);
    for (let i = 0; i < 40; i++) {
      const cut = orig.subarray(0, Math.floor(rnd() * orig.length));
      const flipped = Uint8Array.from(orig);
      for (let k = 0; k < 8; k++) flipped[Math.floor(rnd() * flipped.length)] ^= 1 << Math.floor(rnd() * 8);
      for (const bytes of [cut, flipped]) {
        const r = await photoFactsOf(bytes);
        assert.ok(r.ok ? Array.isArray(r.left_out) && typeof r.facts === "object" : r.code in COVER_REFUSALS, `${name}: ${r.code}`);
      }
    }
  }
});

test("R13 refusals: bytes that are neither a JPEG nor a PNG, or over the bytes bound, are refused by name; a progressive JPEG and an interlaced PNG still give their facts", async () => {
  assert.equal((await photoFactsOf(fixture("refuse-heic.heic"))).code, "NOT_A_COVERABLE_FORMAT");
  assert.equal((await photoFactsOf("text")).code, "NOT_A_COVERABLE_FORMAT");
  assert.equal((await photoFactsOf(new Uint8Array(boundOf("image", "cover_bytes") + 1))).code, "PHOTO_TOO_LARGE");
  const prog = await photoFactsOf(fixture("strip-progressive-o3.jpg"));
  assert.equal(prog.ok, true);
  assert.equal(prog.facts.orientation, 3);
  assert.equal((await photoFactsOf(fixture("strip-interlaced-rgba-o3.png"))).ok, true);
});

test("R6 pure: the same bytes answer the same facts, the input unchanged", async () => {
  const input = fixture("photo-full.jpg"), copy = Uint8Array.from(input);
  const a = await photoFactsOf(input), b = await photoFactsOf(input);
  assert.deepEqual(a, b);
  assert.deepEqual(input, copy);
});
