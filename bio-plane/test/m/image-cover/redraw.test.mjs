/* image-cover R12 and R14: a picture redrawn from its pixels, the colour profile kept only when it passes the strict check.
 *
 * The reference is Pillow's decode of the original (libjpeg-turbo for JPEG, alpha drawn over white for PNG), made once by
 * `fixtures/make-photo-fixtures.py` and recorded in `photo-cases.json`: the answer is decoded here by node's zlib and the
 * PNG standard's unfiltering and must reach the same pixel hash. Never against this module's own earlier output. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { redrawPicture, coverAreas, COVER_REFUSALS, REDRAW_MAX_BYTES } from "../../../src/image-cover/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { fixture, pngChunks } from "./answers.mjs";
import { pngDeclaring, pngOfChunks } from "./hostile.mjs";

const PHOTOS = JSON.parse(readFileSync(new URL("./fixtures/photo-cases.json", import.meta.url), "utf8"));
const sha = (b) => createHash("sha256").update(b).digest("hex");

/** A redrawn PNG's samples (8-bit grey or RGB, rows top to bottom, as stored), by node's zlib and the standard's filters. */
function samplesOf(png) {
  const { chunks, after } = pngChunks(png);
  assert.equal(after.length, 0, "nothing follows IEND");
  const ih = chunks[0].body, dv = new DataView(ih.buffer, ih.byteOffset);
  const W = dv.getUint32(0), H = dv.getUint32(4), ct = ih[9];
  assert.deepEqual([ih[8], ih[10], ih[11], ih[12]], [8, 0, 0, 0], "8-bit, standard methods, not interlaced");
  const bpp = ct === 0 ? 1 : 3, stride = W * bpp;
  assert.ok(ct === 0 || ct === 2, `colour type ${ct}`);
  const raw = inflateSync(Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.body)));
  assert.equal(raw.length, (stride + 1) * H);
  const out = new Uint8Array(stride * H);
  let prev = new Uint8Array(stride);
  for (let y = 0; y < H; y++) {
    const t = raw[y * (stride + 1)], row = Uint8Array.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? row[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      row[i] = (row[i] + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][t]) & 255;
    }
    out.set(row, y * stride);
    prev = row;
  }
  return { W, H, comps: bpp, samples: out, chunks };
}

const profileOf = (png) => {
  const c = pngChunks(png).chunks.find((x) => x.type === "iCCP");
  if (!c) return null;
  const z = c.body.indexOf(0);
  assert.equal(c.body[z + 1], 0, "deflate method");
  return new Uint8Array(inflateSync(c.body.subarray(z + 2)));
};

test("R12 a picture is redrawn from pixels: its pixels equal Pillow's (libjpeg-turbo's for a JPEG) byte for byte, over every plain fixture", async () => {
  assert.ok(PHOTOS.redraw.length >= 30);
  for (const c of PHOTOS.redraw) {
    const r = await redrawPicture(fixture(c.file));
    assert.equal(r.ok, true, `${c.file}: ${r.code} ${r.detail}`);
    assert.equal(r.format, "png");
    assert.deepEqual([r.width, r.height], [c.width, c.height], c.file);
    const got = samplesOf(r.bytes);
    assert.deepEqual([got.W, got.H, got.comps], [c.width, c.height, c.comps], c.file);
    assert.equal(sha(got.samples), c.pixels_sha256, `${c.file}: the redrawn pixels are the reference's`);
  }
});

test("R12 the answer holds the pixels and nothing of the original: only IHDR, IDAT and IEND, and no metadata marker or string anywhere in its bytes", async () => {
  for (const name of ["photo-full.jpg", "photo-full.png", "photo-xmp.jpg", "photo-apng.png", "photo-bare.jpg", "photo-bare.png"]) {
    const r = await redrawPicture(fixture(name));
    assert.equal(r.ok, true, name);
    const types = samplesOf(r.bytes).chunks.map((c) => c.type);
    assert.deepEqual(types.filter((t) => t !== "iCCP"), ["IHDR", "IDAT", "IEND"], name);
    if (types.includes("iCCP")) assert.equal(sha(profileOf(r.bytes)), PHOTOS.p3_sha256, `${name}: the one profile that passed, unchanged`);
    const text = Buffer.from(r.bytes).toString("latin1");
    for (const needle of ["Exif", "TestCam", "Phone One", "A. Photographer", "Pat Owner", "SN-0042", "abc123def456", "ns.adobe.com", "xmpmeta", "Photoshop",
      "ICC_PROFILE", "JFIF", "tEXt", "zTXt", "iTXt", "eXIf", "acTL", "fdAT", "pHYs", "TRAILER", "AFTER-IEND", "member", "SEFT", "MPF", "XMP", "Oakland", "Agency", "oak"])
      assert.ok(!text.includes(needle), `${name} holds ${needle}`);
  }
});

test("R12 the orientation is answered as read and never applied: the pixels stay as stored", async () => {
  const expect = { "phone-420-o6.jpg": 6, "444-o3.jpg": 3, "grey-o8-optimised.jpg": 8, "q100-upright.jpg": 1, "o2.png": 2, "o7.png": 7, "screenshot-rgba-o6.png": 6, "grey.png": 1, "photo-full.jpg": 6, "photo-full.png": 3 };
  for (const [name, o] of Object.entries(expect)) {
    const r = await redrawPicture(fixture(name));
    assert.equal(r.ok, true, name);
    assert.equal(r.orientation, o, name);
  }
  const sideways = PHOTOS.redraw.find((c) => c.file === "phone-420-o6.jpg");
  assert.deepEqual([sideways.width, sideways.height], [203, 157], "stored, not displayed (157 x 203)");
});

test("R12 alpha is drawn over white and a palette is expanded", async () => {
  const r = await redrawPicture(fixture("palette-room.png"));
  assert.equal(r.ok, true);
  assert.equal(samplesOf(r.bytes).comps, 3);
  const g = await redrawPicture(fixture("grey-alpha.png"));
  assert.equal(g.ok, true);
  assert.equal(samplesOf(g.bytes).comps, 1, "grey with alpha stays one component");
});

test("R12 refusals by name, nothing answered but the refusal: progressive, interlaced, truncated, corrupt, not a picture, too large", async () => {
  const want = {
    "refuse-progressive.jpg": "UNSUPPORTED_JPEG_PROCESS", "strip-progressive-o3.jpg": "UNSUPPORTED_JPEG_PROCESS", "refuse-arithmetic.jpg": "UNSUPPORTED_JPEG_PROCESS",
    "refuse-lossless.jpg": "UNSUPPORTED_JPEG_PROCESS", "refuse-12bit.jpg": "UNSUPPORTED_JPEG_PROCESS", "strip-cmyk-adobe.jpg": "UNSUPPORTED_JPEG_PROCESS",
    "refuse-interlaced.png": "PNG_INTERLACED", "strip-interlaced-rgba-o3.png": "PNG_INTERLACED",
    "refuse-truncated.jpg": "TRUNCATED_IMAGE_DATA", "refuse-truncated.png": "TRUNCATED_IMAGE_DATA", "refuse-crc.png": "IMAGE_DATA_CORRUPT",
    "refuse-heic.heic": "NOT_A_COVERABLE_FORMAT", "strip-refuse.bmp": "NOT_A_COVERABLE_FORMAT", "strip-one-frame.gif": "NOT_A_COVERABLE_FORMAT",
  };
  for (const [name, code] of Object.entries(want)) {
    const r = await redrawPicture(fixture(name));
    assert.deepEqual(Object.keys(r).sort(), ["code", "detail", "ok"], name);
    assert.equal(r.ok, false, name);
    assert.equal(r.code, code, `${name}: ${r.code} ${r.detail}`);
    assert.ok(r.code in COVER_REFUSALS, `${name}: ${r.code} is a declared code`);
  }
  assert.equal((await redrawPicture("a string")).code, "NOT_A_COVERABLE_FORMAT");
  assert.equal((await redrawPicture(new Uint8Array(0))).code, "NOT_A_COVERABLE_FORMAT");
});

test("R12 a photograph over the bounds is refused from its header before the memory is asked for: pixels, the decoded frame, the row, the chunks", async () => {
  const MB = 1048576;
  const lean = async (run) => {
    const before = process.memoryUsage().arrayBuffers;
    let peak = 0;
    const watch = setInterval(() => { peak = Math.max(peak, process.memoryUsage().arrayBuffers - before); }, 1);
    const r = await run();
    clearInterval(watch);
    return { r, peak: Math.max(peak, process.memoryUsage().arrayBuffers - before) };
  };
  /* a 70-byte PNG declaring 30,000,000 x 1 RGBA: the row is over the bound */
  const wide = await lean(() => redrawPicture(pngDeclaring(30_000_000, 1)));
  assert.equal(wide.r.code, "IMAGE_TOO_LARGE");
  assert.ok(wide.peak < 32 * MB, `asked for ${wide.peak}`);
  /* more pixels than the bound, in a JPEG's header and in a PNG's */
  const tall = new Uint8Array(fixture("adobe-ycc.jpg"));          // no thumbnail of its own: the first SOF0 is its frame
  const dims = (w, h) => { const d = Uint8Array.from(tall); for (let p = 2; p < d.length - 9; p++) if (d[p] === 0xff && d[p + 1] === 0xc0) { d[p + 5] = h >> 8; d[p + 6] = h & 255; d[p + 7] = w >> 8; d[p + 8] = w & 255; return d; } throw new Error("no SOF0"); };
  const px = await lean(() => redrawPicture(dims(60000, 60000)));
  assert.equal(px.r.code, "PHOTO_TOO_LARGE");
  assert.ok(px.peak < 32 * MB);
  assert.equal((await redrawPicture(pngDeclaring(60000, 60000, 2))).code, "PHOTO_TOO_LARGE");
  /* inside the pixel bound but past the decoded-frame bound (4096 x 3072 x 3): refused before the frame is allocated */
  const frame = await lean(() => redrawPicture(dims(4096, 4000)));
  assert.equal(frame.r.code, "IMAGE_TOO_LARGE", `${frame.r.code} ${frame.r.detail}`);
  assert.ok(frame.peak < 32 * MB, `asked for ${frame.peak}`);
  assert.equal((await redrawPicture(pngDeclaring(4096, 4000, 2))).code, "IMAGE_TOO_LARGE");
  /* a million chunks */
  assert.equal((await redrawPicture(pngOfChunks(1_000_000))).code, "IMAGE_TOO_LARGE");
  /* the photo itself over the bytes bound */
  const big = new Uint8Array(boundOf("image", "cover_bytes") + 1);
  big.set(tall.subarray(0, 4));
  assert.equal((await redrawPicture(big)).code, "PHOTO_TOO_LARGE");
  assert.equal(REDRAW_MAX_BYTES, boundOf("image", "redraw_bytes"));
});

test("R6 pure: the same bytes answer the same bytes, alone or interleaved with other calls; the input is not changed", async () => {
  for (const name of ["photo-full.jpg", "photo-full.png", "grey-alpha.png"]) {
    const input = fixture(name), before = sha(input);
    const a = await redrawPicture(input);
    await coverAreas(fixture("phone-420-o6.jpg"), { areas: [[0, 0, 9, 9]] });
    const [b, c] = await Promise.all([redrawPicture(input), redrawPicture(input)]);
    assert.deepEqual([...a.bytes], [...b.bytes], name);
    assert.deepEqual([...a.bytes], [...c.bytes], name);
    assert.equal(sha(input), before, `${name}: the input is unchanged`);
  }
});

test("R12 damaged photographs answer a picture or a named refusal and never throw", async () => {
  let seed = 12345;
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
  for (const name of ["photo-full.jpg", "photo-full.png", "phone-420-o6.jpg", "screenshot-rgba-o6.png", "grey.png", "photo-p3.jpg"]) {
    const orig = fixture(name);
    for (let i = 0; i < 12; i++) {
      const cut = orig.subarray(0, Math.floor(rnd() * orig.length));
      const flipped = Uint8Array.from(orig);
      for (let k = 0; k < 6; k++) flipped[Math.floor(rnd() * flipped.length)] ^= 1 << Math.floor(rnd() * 8);
      for (const bytes of [cut, flipped]) {
        const r = await redrawPicture(bytes);
        assert.ok(r.ok === true || r.code in COVER_REFUSALS, `${name}: ${r.code}`);
        if (r.ok) assert.ok(r.bytes.length > 0);
      }
    }
  }
});

/* ── R14: the colour profile ──────────────────────────────────────────────── */

test("R14 a Display P3 JPEG's picture carries the identical profile bytes and its pixels equal the original's; a PNG's iCCP likewise", async () => {
  for (const name of ["photo-p3.jpg", "photo-p3.png"]) {
    const r = await redrawPicture(fixture(name));
    assert.equal(r.ok, true, name);
    assert.equal(r.profile_kept, true, name);
    assert.equal(sha(profileOf(r.bytes)), PHOTOS.p3_sha256, `${name}: the profile's bytes are unchanged`);
    assert.deepEqual(samplesOf(r.bytes).chunks.map((c) => c.type), ["IHDR", "iCCP", "IDAT", "IEND"], name);
    const c = PHOTOS.redraw.find((x) => x.file === name);
    assert.equal(sha(samplesOf(r.bytes).samples), c.pixels_sha256, `${name}: the pixels are the original's, not converted`);
    assert.ok(!r.left_out.some((x) => x.kind === "profile"), `${name}: a kept profile is not left out`);
  }
});

test("R14 control: a CMYK profile, an input-class profile, a version 1 profile, one whose tag points past its end, one whose tags overlap, one whose size lies, one over the bound and one on a grey picture are each left out and named `profile`, the picture drawn without one", async () => {
  const names = PHOTOS.facts.filter((c) => c.profile_refused).map((c) => c.file);
  assert.ok(names.length >= 9);
  for (const name of names) {
    const r = await redrawPicture(fixture(name));
    assert.equal(r.ok, true, `${name}: ${r.code}`);
    assert.equal(r.profile_kept, false, name);
    assert.equal(profileOf(r.bytes), null, name);
    assert.deepEqual(samplesOf(r.bytes).chunks.map((c) => c.type), ["IHDR", "IDAT", "IEND"], name);
    const left = r.left_out.find((x) => x.kind === "profile");
    assert.ok(left && left.count === 1 && left.bytes > 0, `${name}: named as profile`);
  }
});

test("R14 the strict check reads only the header and tag table: the profile's size is its own, within the bound read from the table", async () => {
  const { checkProfile, PHOTO_PROFILE_MAX } = await import("../../../src/image-cover/index.mjs");
  assert.equal(PHOTO_PROFILE_MAX, boundOf("image", "photo_profile_max"));
  assert.equal(checkProfile(new Uint8Array(10)).ok, false);
  assert.equal(checkProfile(new Uint8Array(PHOTO_PROFILE_MAX + 1)).reason, "over_bound");
});

test("R2 control: coverAreas is unchanged and still carries no profile", async () => {
  const r = await coverAreas(fixture("photo-p3.jpg"), { areas: [[0, 0, 9, 9]] });
  assert.equal(r.ok, true);
  assert.ok(!Buffer.from(r.bytes).toString("latin1").includes("ICC_PROFILE"));
});
