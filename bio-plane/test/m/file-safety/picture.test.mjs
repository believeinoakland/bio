/* file-safety R60–R65, R67 (T53; DEC-460; K5471, K5473, K5520–K5523, K5546, K5547, K5555): the safe picture of a photograph, at the module's
   interface: the batch that makes it (`renderBatch`), the view that answers it (`safeView`, the description and, with `picture`, the picture's own
   bytes) and the rows and records around them. The photographs are image-cover's published fixtures; the reference for their pixels and for what
   each says is `image-cover/fixtures/photo-cases.json`, made once by Pillow and read back by exiftool in `make-photo-fixtures.py`, never by this
   module's own earlier output. The hostile photographs are built byte by byte with image-cover's builders.
   R66 (the container's other picture kinds) is held as a todo: the container client is not among this module's uses. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { filedWorld as world, sha, enc, pdf } from "./fixture.mjs";
import { FILE_SAYS_FIELDS, HELD_BACK, PICTURE_LEFT_OUT_KINDS, WAITING_RECHECK_MS } from "../../../src/file-safety/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { fixture, pngChunks } from "../image-cover/answers.mjs";
import { tiff, asc, short, rationals, jpegWithExif, pngWithChunks, textChunk, ztxtChunk, iccpChunk, ascii } from "../image-cover/photo-hostile.mjs";

const PHOTOS = JSON.parse(readFileSync(new URL("../image-cover/fixtures/photo-cases.json", import.meta.url), "utf8"));
const V = { viewer: "member:m1" };
const MiB = 1048576;
const refOf = (name) => PHOTOS.redraw.find((c) => c.file === name);
const factsOf = (name) => PHOTOS.facts.find((c) => c.file === name);
const hash = (b) => createHash("sha256").update(b).digest("hex");

/** A picture's samples as stored (8-bit grey or RGB), by node's zlib and the PNG standard's unfiltering. */
function samplesOf(png) {
  const { chunks, after } = pngChunks(png);
  assert.equal(after.length, 0, "nothing follows IEND");
  const ih = chunks[0].body, dv = new DataView(ih.buffer, ih.byteOffset);
  const W = dv.getUint32(0), H = dv.getUint32(4), ct = ih[9], bpp = ct === 0 ? 1 : 3, stride = W * bpp;
  assert.deepEqual([ih[8], ih[10], ih[11], ih[12]], [8, 0, 0, 0]);
  const raw = inflateSync(Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.body)));
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
  return new Uint8Array(inflateSync(c.body.subarray(z + 2)));
};

/** The photograph captured, its picture made by the batch; the digest. */
async function made(w, bytes, opts = {}) {
  const s = await w.capture(bytes, opts);
  await w.fs.renderBatch({});
  return s;
}
const describe = (w, s, viewer = V) => w.fs.safeView({ captureSha: s, ...viewer });
async function servedBytes(w, s, viewer = V) {
  const r = await w.fs.safeView({ captureSha: s, ...viewer, picture: true });
  assert.ok(r instanceof Response, JSON.stringify(r));
  return { r, bytes: new Uint8Array(await r.arrayBuffer()) };
}

test("R60: a baseline JPEG and an 8-bit PNG answer a picture redrawn from their pixels: its pixels are the reference decoder's, it holds no marker, string or coordinate of the photograph, nothing follows its end, and the capture is as before", async () => {
  const needles = ["Exif", "TestCam", "Phone One", "PhoneOS", "A. Photographer", "Pat Owner", "SN-0042", "LS-77", "abc123def456", "xmpmeta", "ns.adobe.com", "Photoshop", "JFIF",
    "MPF", "AFTER", "TRAILER", "37.8083", "122.27", "tEXt", "zTXt", "iTXt", "eXIf", "XMP", "Oakland", "member seven", "PNG Creator"];
  for (const name of ["photo-full.jpg", "photo-full.png", "photo-p3.jpg", "photo-p3.png", "photo-bare.jpg", "photo-bare.png", "photo-grey-p3.jpg"]) {
    const w = world();
    const original = fixture(name);
    const s = await w.capture(original);
    const before = { grade: JSON.stringify(w.prov.captureGrade(s)), register: JSON.stringify(w.rows("SELECT * FROM register")), stored: sha(w.bucket.held.get(`bio/captures/${s}`)),
                     notes: w.fs.verdictNotes({ captureSha: s }).notes.length };
    /* R63: not yet made, it is pending; then the batch makes it */
    assert.equal((await describe(w, s)).code, "SAFE_VIEW_PENDING", name);
    const batch = await w.fs.renderBatch({});
    assert.deepEqual([batch.ok, batch.rendered, batch.failed], [true, 1, 0], name);
    assert.equal(w.calls("/render").length, 0, `${name}: the renderer is not asked; the picture is made here`);
    const a = await describe(w, s);
    const ref = refOf(name);
    assert.deepEqual([a.ok, a.kind, a.derived, a.of, a.content_type, a.width, a.height], [true, "picture", true, s, "image/png", ref.width, ref.height], name);
    assert.deepEqual(Object.keys(a).sort(), ["content_type", "derived", "file_says", "file_says_held", "height", "kind", "left_out", "of", "ok", "original", "sha256", "width"], name);
    const { r, bytes } = await servedBytes(w, s);
    assert.equal(r.headers.get("content-type"), "image/png");
    assert.equal(r.headers.get("x-derived-sha256"), a.sha256);
    assert.equal(hash(bytes), a.sha256, "the picture is named by its own digest");
    assert.deepEqual(JSON.parse(r.headers.get("x-file-safety")), { kind: "picture", derived: true, of: s, sha256: a.sha256, content_type: "image/png", width: ref.width, height: ref.height });
    /* the pixels are the reference decoder's (Pillow; libjpeg-turbo for a JPEG), rotation 0: the orientation is told, never applied */
    const got = samplesOf(bytes);
    assert.deepEqual([got.W, got.H, got.comps], [ref.width, ref.height, ref.comps], name);
    assert.equal(hash(got.samples), ref.pixels_sha256, `${name}: the pixels equal the original's`);
    /* nothing but the picture and a profile that passed: chunks, and a byte search for each marker, string and coordinate */
    assert.deepEqual(got.chunks.map((c) => c.type).filter((t) => t !== "iCCP"), ["IHDR", "IDAT", "IEND"], name);
    const text = Buffer.from(bytes).toString("latin1");
    for (const n of needles) assert.ok(!text.includes(n), `${name} holds ${n}`);
    /* R22: the capture's bytes, digest, register entry and grade, and the notes, are as they were */
    assert.deepEqual({ grade: JSON.stringify(w.prov.captureGrade(s)), register: JSON.stringify(w.rows("SELECT * FROM register")), stored: sha(w.bucket.held.get(`bio/captures/${s}`)),
                       notes: w.fs.verdictNotes({ captureSha: s }).notes.length }, before, `${name}: nothing of the capture changed, and no note was written (clean is never implied)`);
    assert.equal(sha(original), s);
    /* R37, R63: the picture is no capture: provenance names neither digest */
    for (const table of ["register", "captured_locators"]) assert.ok(!JSON.stringify(w.rows(`SELECT * FROM ${table}`)).includes(a.sha256), table);
  }
});

test("R60 control: a PDF answers as before, an HTML file, a file holding a NUL and a kind with no route still answer NO_SAFE_VIEW; a held file has its picture; no scanner bound, no safe view is made", async () => {
  const w = world();
  const p = await w.capture(pdf(false, "pic-control"));
  assert.equal((await describe(w, p)).code, "SAFE_VIEW_PENDING");
  await w.fs.renderBatch({});
  assert.equal((await describe(w, p)).status, 200);
  for (const b of [enc("<!doctype html><html><body>hi</body></html>"), new Uint8Array([0x61, 0x62, 0x00, 0x63, 0x0a]), new Uint8Array([0x49, 0x49, 0x2a, 0x00, 8, 0, 0, 0, 9])]) {
    const r = await describe(w, await w.capture(b));
    assert.equal(r.code, "NO_SAFE_VIEW");
  }
  /* R12: a file under a scan hold still has its picture */
  const held = world({ scan: { clamav: () => ({ result: "found", findings: ["Test.File"] }) } });
  const s = await held.capture(fixture("photo-full.jpg"));
  await held.fs.scanBatch({});
  assert.ok((await held.fs.threatOf({ captureSha: s })).scan_hold);
  await held.fs.renderBatch({});
  const a = await describe(held, s);
  assert.deepEqual([a.ok, a.kind, a.original.may_open, a.original.why], [true, "picture", false, "SCAN_HOLD"]);
  /* no scanner bound: the view is not made, as for every route */
  const n = world({ bound: false });
  const u = await n.capture(fixture("photo-full.jpg"));
  assert.equal((await describe(n, u)).code, "RENDERER_ABSENT");
});

test("R61: what the file says is a closed list, each field {value, from: 'the file', checked: false}: the serial numbers and the owner name are shown beside the picture, the image id, the artist and the copyright holder are read into the record and held back from the default; each value is the reference's", async () => {
  const w = world();
  const s = await made(w, fixture("photo-full.jpg"));
  const a = await describe(w, s);
  const ref = factsOf("photo-full.jpg").facts;
  const all = { ...a.file_says, ...a.file_says_held };
  for (const [k, entry] of Object.entries(all)) assert.deepEqual(Object.keys(entry).sort(), ["checked", "from", "value"], k);
  for (const e of Object.values(all)) assert.deepEqual([e.from, e.checked], ["the file", false]);
  for (const [k, v] of Object.entries(ref)) {
    assert.ok(FILE_SAYS_FIELDS.includes(k), `${k} is in the closed list`);
    assert.deepEqual(all[k] && all[k].value, v, `${k}: the reference's value`);
  }
  for (const k of Object.keys(all)) assert.ok(FILE_SAYS_FIELDS.includes(k) && (k in ref || k === "width" || k === "height" || k === "orientation"), `${k} is nothing outside the list`);
  /* the serials and the owner are shown; the id, the artist and the copyright holder are kept apart */
  for (const k of ["body_serial", "lens_serial", "owner_name"]) assert.ok(a.file_says[k], `${k} is shown`);
  assert.deepEqual(Object.keys(a.file_says_held).sort(), [...HELD_BACK].sort());
  for (const k of HELD_BACK) assert.ok(!(k in a.file_says), `${k} is not shown by default`);
  assert.deepEqual([a.file_says.body_serial.value, a.file_says.owner_name.value, a.file_says_held.image_unique_id.value], ["SN-0042", "Pat Owner", "abc123def456"]);
  /* the place and the time are citable as 'the file says' and nothing more: no grade, date or note of the record moved */
  assert.deepEqual([a.file_says.gps_latitude.value, a.file_says.time_taken.value, a.file_says.orientation.value], [37.8083333, "2026-10-08T07:00:00", 6]);
  assert.equal(w.fs.verdictNotes({ captureSha: s }).notes.length, 0);
  /* a PNG's text chunks are plain text, capped */
  const w2 = world();
  const s2 = await made(w2, fixture("photo-full.png"));
  const b = await describe(w2, s2);
  assert.deepEqual(b.file_says.png_text.value, factsOf("photo-full.png").facts.png_text);
  assert.deepEqual(Object.keys(b.file_says_held), ["artist"]);
});

test("R61: a field that is absent, malformed, out of range or over its bound is omitted and counted, never guessed: latitude 91, a 1 MB string, markup and a bidi override, a self-pointing directory and a 5 MB maker note", async () => {
  const w = world();
  const ascii0 = (s) => [...ascii(s), 0];
  const lat = (deg) => [{ tag: 1, type: 2, value: ascii0("N") }, rationals(2, [deg, 1], [0, 1], [0, 1])];
  const answer = async (bytes) => { const s = await made(w, bytes); const a = await describe(w, s); assert.equal(a.kind, "picture", JSON.stringify(a).slice(0, 200)); return a; };
  const lat91 = await answer(jpegWithExif(tiff({ ifd0: [short(0x0112, 1), asc(0x010f, "Cam")], gps: lat(91) })));
  assert.ok(!("gps_latitude" in lat91.file_says), "latitude 91 is omitted");
  assert.equal(lat91.file_says.make.value, "Cam", "the field beside it still reads");
  assert.ok(lat91.left_out.some((x) => x.kind === "unreadable" && x.count >= 1), "and counted");
  assert.equal((await answer(jpegWithExif(tiff({ ifd0: [short(0x0112, 1)], gps: lat(90) })))).file_says.gps_latitude.value, 90, "control: 90 is in range");
  const big = await answer(jpegWithExif(tiff({ ifd0: [{ tag: 0x010e, type: 2, value: [...new Uint8Array(MiB).fill(0x61), 0] }, asc(0x010f, "Cam")] })));
  assert.ok(!("description" in big.file_says), "a 1 MB string is omitted");
  const rlo = [0xe2, 0x80, 0xae];
  const mark = await answer(jpegWithExif(tiff({ ifd0: [{ tag: 0x010e, type: 2, value: [...ascii("<script>alert(1)</script>"), ...rlo, ...ascii("gnp.exe"), 0x07, 0] }] })));
  assert.equal(mark.file_says.description.value, "<script>alert(1)</script>gnp.exe", "markup stays characters; the bidi override and the control are gone");
  const loop = await answer(jpegWithExif(tiff({ ifd0: [asc(0x010f, "Cam")], sub: [asc(0xa431, "S1")], selfPoint: true })));
  assert.deepEqual([loop.file_says.make.value, "body_serial" in loop.file_says], ["Cam", false], "a directory that points to itself ends the walk");
  const note = await answer(jpegWithExif(tiff({ ifd0: [asc(0x010f, "Cam")], sub: [{ tag: 0x927c, type: 7, count: 5 * MiB, raw: [0, 0, 0, 200] }] })));
  const mk = note.left_out.find((x) => x.kind === "maker_note");
  assert.ok(mk && mk.count === 1 && mk.bytes <= fixture("photo-bare.jpg").length + 400, "a 5 MB maker note is named with the size that exists, and read by nothing");
  /* control: nothing outside the list appears, whatever the photograph carries */
  for (const a of [lat91, big, mark, loop, note]) for (const k of Object.keys({ ...a.file_says, ...a.file_says_held })) assert.ok(FILE_SAYS_FIELDS.includes(k), k);
});

test("R62: what was left out is told by kind, count and bytes, in the closed set the design reads by key: the reference's list for a full photograph, an animated PNG's second picture, a bare image lists none, and every kind has its screen key", async () => {
  const w = world();
  const full = await describe(w, await made(w, fixture("photo-full.jpg")));
  const ref = factsOf("photo-full.jpg").left_out;
  assert.deepEqual(Object.fromEntries(full.left_out.map((x) => [x.kind, { count: x.count, bytes: x.bytes }])), ref);
  assert.deepEqual(full.left_out.map((x) => x.kind), PICTURE_LEFT_OUT_KINDS.filter((k) => k in ref), "in the closed set's order");
  const apng = await describe(w, await made(w, fixture("photo-apng.png")));
  assert.equal(apng.left_out.find((x) => x.kind === "extra_picture").count, factsOf("photo-apng.png").left_out.extra_picture.count);
  assert.deepEqual((await describe(w, await made(w, fixture("photo-bare.jpg")))).left_out, [], "a bare image lists none");
  assert.deepEqual(PICTURE_LEFT_OUT_KINDS, ["thumbnail", "maker_note", "profile", "extra_picture", "after_end", "xmp", "credentials", "other_metadata", "unreadable"]);
  const keys = new Set(WORD_ROWS.map((r) => r[0]));
  for (const kind of PICTURE_LEFT_OUT_KINDS) assert.ok(keys.has(`screen.photo.dropped.${kind}`), `the screen reads ${kind} by key`);
  for (const a of [full, apng]) for (const x of a.left_out) assert.ok(PICTURE_LEFT_OUT_KINDS.includes(x.kind), "a kind outside the set is never answered");
  /* profile: only a profile the colour check refused */
  const cmyk = await describe(w, await made(w, fixture("photo-profile-cmyk.jpg")));
  assert.deepEqual(cmyk.left_out.map((x) => x.kind), ["profile"]);
  assert.deepEqual((await describe(w, await made(w, fixture("photo-p3.jpg")))).left_out, [], "a profile that passed is kept in the picture and left out of nothing");
});

test("R63: the picture shares the original's life: made once, pending then a picture, a progressive JPEG and an interlaced PNG fail final with the maker's reason and are not tried again, and no value of what the file says reaches a log, a note, a count, a forwarded record or a scanner request", async () => {
  const lines = [];
  const log = console.log;
  console.log = (...a) => { lines.push(a.map(String).join(" ")); };
  let w, s, a;
  try {
    w = world();
    s = await w.capture(fixture("photo-full.jpg"));
    assert.equal((await describe(w, s)).code, "SAFE_VIEW_PENDING");
    await w.fs.renderBatch({});
    a = await describe(w, s);
    assert.equal(a.kind, "picture");
    /* once: another batch and another look make no second picture */
    const puts = () => w.bucket.calls.filter((c) => c[0] === "put" && /derived/.test(c[1])).length;
    const one = puts();
    await w.fs.renderBatch({}); await describe(w, s); await servedBytes(w, s);
    assert.equal(puts(), one);
    assert.equal(one, 1);
    await w.fs.scanBatch({});
    await w.fs.forwardSecurityCounts({ from: new Date(w.clock.now - 3_600_000).toISOString(), to: new Date(w.clock.now).toISOString() });
  } finally { console.log = log; }
  const secrets = ["SN-0042", "LS-77", "Pat Owner", "abc123def456", "37.8083", "-122.27", "The corner at dusk", "A. Photographer", "TestCam"];
  const rest = JSON.stringify([lines, w.rows("SELECT * FROM fs_notes"), w.rows("SELECT * FROM fs_counts"), w.rows("SELECT * FROM fs_wakes"), w.rows("SELECT * FROM fs_deeper"),
    w.rows("SELECT * FROM fs_holds"), w.rows("SELECT * FROM fs_copies"), w.scanner.calls,
    (await w.fs.forwardSecurityCounts({ from: new Date(w.clock.now - 3_600_000).toISOString(), to: new Date(w.clock.now).toISOString() })).record]);
  for (const x of secrets) assert.ok(!rest.includes(x), `${x} reached a log, a note, a count, a record or a scanner request`);
  /* it is kept with the picture and nowhere else */
  assert.ok(JSON.stringify(w.rows("SELECT * FROM fs_files")).includes("SN-0042"));
  /* the maker's refusals are final: not retried, not even by another release of the renderer */
  const f = world({ scan: { rendererVersion: "renderer one" } });
  const prog = await f.capture(fixture("refuse-progressive.jpg")), il = await f.capture(fixture("refuse-interlaced.png"));
  await f.fs.renderBatch({}); await f.fs.renderBatch({});
  for (const [x, why] of [[prog, "UNSUPPORTED_JPEG_PROCESS"], [il, "PNG_INTERLACED"]]) {
    const r = await describe(f, x);
    assert.deepEqual([r.code, r.renderer_reason, r.final], ["SAFE_VIEW_FAILED", why, true]);
  }
  f.scanner.calls.length = 0;
  f.tick(2 * WAITING_RECHECK_MS);
  await f.fs.renderBatch({}); await f.fs.renderBatch({});
  assert.deepEqual(f.rows("SELECT render_state, render_route FROM fs_files ORDER BY capture_sha").map((r) => [r.render_state, r.render_route]), [["failed", "picture"], ["failed", "picture"]]);
  /* the original's bytes, digest and grade are as before (R22, with the picture made) */
  assert.equal(sha(w.bucket.held.get(`bio/captures/${s}`)), s);
  assert.deepEqual((await w.fs.threatOf({ captureSha: s })).format, "image");
  /* a purge of the original's bundle takes the picture's row, and with it what the file says */
  assert.equal(w.record.purge({ bundleId: `INFO-AUTO-${s.slice(0, 8)}` }).ok, true);
  assert.equal(w.row("SELECT COUNT(*) AS n FROM fs_files WHERE capture_sha = ?", s).n, 0);
});

test("R64: the picture and what the file says are answered only to a viewer who may see the capture, as the original's views are: one who may not gets what a capture that is not there gets; the three held-back fields are in no list, count or record", async () => {
  const w = world({ homed: true });
  const s = await made(w, fixture("photo-full.jpg"));
  w.project("PROJ-1", "m1"); w.home(s, "INFO-P", { project: "PROJ-1" });
  const a = await describe(w, s, { viewer: "member:m1" });
  assert.equal(a.kind, "picture");
  const absent = await describe(w, sha("never held"), { viewer: "member:m2" });
  const hidden = await describe(w, s, { viewer: "member:m2" });
  assert.deepEqual(hidden, { ...absent, captureSha: s }, "a hidden capture answers as an absent one");
  const hiddenBytes = await w.fs.safeView({ captureSha: s, viewer: "member:m2", picture: true });
  assert.ok(!(hiddenBytes instanceof Response));
  assert.equal(hiddenBytes.code, "FILE_NOT_HELD");
  /* the figures are shown no more widely: in no list, count or forwarded record of this module */
  const everywhere = JSON.stringify([w.fs.verdictNotes({ captureSha: s, viewer: "member:m1" }), w.fs.scanFindings({ viewer: "member:m1" }), await w.fs.threatOf({ captureSha: s, viewer: "member:m1" }),
    await w.fs.originalState({ captureSha: s, viewer: "member:m1" }), w.rows("SELECT * FROM fs_counts")]);
  for (const x of ["SN-0042", "Pat Owner", "abc123def456", "A. Photographer", "(c) 2026", "37.8083", "-122.27"]) assert.ok(!everywhere.includes(x), x);
  /* the coordinates are numbers in the answer: text with no link, and the module makes no request to anything outside it */
  assert.deepEqual([typeof a.file_says.gps_latitude.value, typeof a.file_says.gps_longitude.value], ["number", "number"]);
  assert.ok(!/https?:\/\//.test(JSON.stringify(a)), "no address in the description");
  assert.deepEqual(w.scanner.calls.map((c) => c.path).filter((p) => p !== "/version"), [], "no request to the scanner, the renderer or any outside service");
});

test("R65: the picture maker withstands a corpus of hostile photographs, each refused or made safe within its bounds with the isolate alive: size bombs, truncation, bytes after the end, a comment holding %PDF or HTML, cyclic or out-of-range directories, a huge entry count, a compressed-text bomb, bidi text, a profile claiming a gigabyte, a bad profile table, a polyglot", async () => {
  const w = world();
  const bare = fixture("photo-bare.jpg"), barePng = fixture("photo-bare.png");
  const cat = (...p) => Uint8Array.from(p.flatMap((x) => [...x]));
  const cases = [];
  /* a size bomb: a header declaring a gigantic frame, in both kinds */
  const sof = (w0, h0) => { const b = Uint8Array.from(bare); const i = b.findIndex((x, k) => x === 0xff && b[k + 1] === 0xc0); b.set([h0 >> 8, h0 & 255, w0 >> 8, w0 & 255], i + 5); return b; };
  cases.push(["jpeg size bomb", sof(65535, 65535)]);
  const png = Uint8Array.from(barePng); new DataView(png.buffer).setUint32(16, 100000); new DataView(png.buffer).setUint32(20, 100000);
  cases.push(["png size bomb", png]);
  cases.push(["jpeg truncated", bare.subarray(0, Math.floor(bare.length / 2))]);
  cases.push(["png truncated", barePng.subarray(0, barePng.length - 40)]);
  cases.push(["jpeg bytes after the end", cat(bare, enc("%PDF-1.4 <html><script>alert(1)</script>"), new Uint8Array(4096).fill(0xff))]);
  cases.push(["png bytes after the end", cat(barePng, enc("%PDF-1.4 <html>"))]);
  cases.push(["jpeg comment holding %PDF and HTML", jpegWithComment(bare, "%PDF-1.7 <html><script>x</script>")]);
  cases.push(["png text holding %PDF and HTML", pngWithChunks([textChunk("Comment", ascii("%PDF-1.7 <html><script>x</script>"))])]);
  cases.push(["exif directory pointing at itself", jpegWithExif(tiff({ ifd0: [asc(0x010f, "Cam")], sub: [asc(0xa431, "S1")], selfPoint: true }))]);
  cases.push(["exif next-ifd cycle", jpegWithExif(tiff({ ifd0: [asc(0x010f, "Cam")], next: 8 }))]);
  cases.push(["exif sixty thousand entries", jpegWithExif(Uint8Array.from([...ascii("MM"), 0, 42, 0, 0, 0, 8, 0xea, 0x60, ...new Uint8Array(40)]))]);
  cases.push(["exif offset out of range", jpegWithExif(tiff({ ifd0: [{ tag: 0x010f, type: 2, count: 64, raw: [0x7f, 0xff, 0xff, 0xf0] }] }))]);
  cases.push(["exif that is no tiff", jpegWithExif(Uint8Array.from(ascii("garbage, not tiff at all")))]);
  cases.push(["a bidi text in a field", jpegWithExif(tiff({ ifd0: [{ tag: 0x010e, type: 2, value: [...ascii("fdp."), 0xe2, 0x80, 0xae, ...ascii("exe"), 0] }] }))]);
  cases.push(["a maker note of 5 MB, declared", jpegWithExif(tiff({ ifd0: [asc(0x010f, "Cam")], sub: [{ tag: 0x927c, type: 7, count: 5 * MiB, raw: [0, 0, 0, 200] }] }))]);
  cases.push(["a compressed-text bomb", pngWithChunks([ztxtChunk("Bomb", new Uint8Array(200 * MiB))])]);
  cases.push(["a polyglot: a ZIP end joined to a JPEG", cat(bare, Uint8Array.from([0x50, 0x4b, 0x05, 0x06, ...new Uint8Array(18)]))]);
  cases.push(["a profile claiming a gigabyte", pngWithChunks([iccpChunk(profileClaiming(1 << 30))])]);
  const lean = async () => { const before = process.memoryUsage().arrayBuffers; const r = await w.fs.renderBatch({}); return { r, grew: process.memoryUsage().arrayBuffers - before }; };
  for (const [name, bytes] of cases) {
    const s = await w.capture(bytes);
    const out = await lean();
    assert.equal(out.r.ok, true, `${name}: the batch survived`);
    assert.ok(out.grew < 256 * MiB, `${name}: ${out.grew} bytes allocated`);
    const a = await describe(w, s);
    assert.ok(a.kind === "picture" || a.code === "SAFE_VIEW_FAILED", `${name}: ${JSON.stringify(a).slice(0, 160)}`);
    if (a.kind === "picture") {
      const { bytes: served } = await servedBytes(w, s);
      assert.ok(served.length <= boundOf("image", "redraw_bytes"), `${name}: within the bound`);
      assert.deepEqual(samplesOf(served).chunks.map((c) => c.type).filter((t) => t !== "iCCP"), ["IHDR", "IDAT", "IEND"], name);
      assert.ok(!Buffer.from(served).toString("latin1").includes("<script>"), name);
    } else assert.equal(a.final, true, `${name}: final`);
  }
  /* control: an ordinary photograph of each kind still makes a picture, after the corpus */
  for (const name of ["photo-full.jpg", "photo-full.png"]) {
    const s = await made(w, fixture(name));
    assert.equal((await describe(w, s)).kind, "picture", name);
  }
});

test("R67: a Display P3 JPEG's picture carries the identical profile bytes and the pixels of the original; a PNG's iCCP likewise; a CMYK profile, an input-class profile, one over the bound and one whose tag points past its end are each left out and named, the picture drawn in standard colours", async () => {
  const w = world();
  for (const name of ["photo-p3.jpg", "photo-p3.png"]) {
    const s = await made(w, fixture(name));
    const { bytes } = await servedBytes(w, s);
    assert.equal(hash(profileOf(bytes)), PHOTOS.p3_sha256, `${name}: the profile's bytes are unchanged`);
    assert.equal(hash(samplesOf(bytes).samples), refOf(name).pixels_sha256, `${name}: and the pixels are the original's`);
    const a = await describe(w, s);
    assert.equal(a.file_says.profile_description.value, "Display P3");
    assert.equal(a.file_says.profile_colour_space.value, "RGB");
  }
  for (const name of ["photo-profile-cmyk.jpg", "photo-profile-cmyk.png", "photo-profile-input.jpg", "photo-profile-over-bound.jpg", "photo-profile-past-end.jpg", "photo-profile-overlap.jpg", "photo-profile-size-lies.jpg", "photo-profile-version1.jpg"]) {
    const s = await made(w, fixture(name));
    const a = await describe(w, s);
    assert.equal(a.kind, "picture", name);
    const { bytes } = await servedBytes(w, s);
    assert.equal(profileOf(bytes), null, `${name}: no profile is carried`);
    assert.deepEqual(a.left_out.filter((x) => x.kind === "profile").map((x) => x.count), [1], `${name}: named as profile`);
  }
  assert.ok(boundOf("image", "photo_profile_max") >= 1);
});

test.todo("R66: a photograph of a kind the container decodes (TIFF, HEIC, HEIF, AVIF, the first frame of a GIF, WebP, BMP, JPEG 2000) has the same safe picture, kept fields and left-out kinds as the JPEG case, and a kind the container does not decode stays NO_SAFE_VIEW (not met: the container client is not among this module's uses, nor is a redraw from decoded pixels offered by image-cover; reported to BOB)");

/* hostile builders local to this file */
/** An ICC profile header that claims `size` bytes and holds 132. */
function profileClaiming(size) { const h = new Uint8Array(132); new DataView(h.buffer).setUint32(0, size); return h; }
function jpegWithComment(base, text) {
  const body = [...ascii(text)];
  const seg = [0xff, 0xfe, (body.length + 2) >> 8, (body.length + 2) & 255, ...body];
  return Uint8Array.from([...base.subarray(0, 2), ...seg, ...base.subarray(2)]);
}
