/* control-plane R17, R29 (fix round 10, final pass; K5138; WALK-FINAL-10A R172, diag2-0910a.md section 1; case-carriage COMPLETE follow-up 70, build/jobs/T51/case-carriage.md): the walker's case through the real door.
   A member uploads a PNG (`captureupload`, as the Add screen sends it), files it in her project, cites it in a question she concludes, drafts the case and asks `publishpreflight`: the Photos step lists the
   photo and the pre-flight holds `PHOTO_UNCHECKED` for it. Before the fix an upload (no `capture.content_type`, a register path with no extension) was never a photo: the Photos step listed none and the case
   prepared as an ordinary case with the photo unobscured. Controls: a text upload named like a photo (`notes.png`) is not a photo (its bytes' format wins over its name); a PNG uploaded with no `type` is
   still a photo (the bytes decide). Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { PARTS } from "../../../src/screens-publish/parts.mjs";
import { makeKit, BIAS } from "./r8-kit.mjs";

const kit = makeKit({ tag: "wphoto" });
after(() => kit.mf.dispose());
const R = kit.R;

/* a small valid PNG made here: 24 x 24, 8-bit RGB, one IDAT, with the chunk checksums */
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const crc32 = (b) => { let c = -1; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function pngOf(seed) {
  const w = 24, h = 24, raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw.set([(40 + x * 7 + seed) % 256, (40 + y * 11) % 256, 120], y * (w * 3 + 1) + 1 + x * 3);
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

/* the member's chain as the screens make it: upload, filing in her project, a question she cites the whole upload in and concludes, the case drafted; the pre-flight asked as the ceremony asks it */
async function chainOf(handle, { bytes, name, type }) {
  const own = await kit.ownerOf(handle);
  const cs = kit.screenCall(own.auth);
  const project = await kit.projectOf(own.auth, `Photo walk ${handle}`);
  const q = new URLSearchParams({ statement: handle, name, ...(type ? { type } : {}) });
  const up = (await (await kit.plane(`/api/?op=captureupload&${q}`, { method: "POST", headers: own.auth, body: bytes })).json()).result;
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: name, locator: up.document.locator, project });
  assert.equal(filed.refused, undefined, JSON.stringify(filed).slice(0, 400));
  const bundle = filed.bundleId;
  const question = await kit.questionOf(own.auth, project, "Does the photograph show the stamp on the counter?");
  /* "Cite in the question" the whole document: `select` it, then `cite` by the handle (a picture has no passage to find) */
  const sel = R(await cs.call("select", { body: { ids: [bundle] } }));
  assert.ok(sel && sel.handle, "a selection: " + JSON.stringify(sel).slice(0, 300));
  const cited = R(await cs.call("cite", { body: { project: question, role: "supports", handle: sel.handle } }));
  assert.deepEqual(cited.cited, [bundle], "the question rests on the upload: " + JSON.stringify(cited).slice(0, 400));
  const concl = R(await cs.call("conclude", { query: { target: question, project, reading: "The photograph shows the stamp on the counter.",
    falsifier: "A dated photograph of the same counter without the stamp would overturn this.", reason: "The photograph shows it." } }));
  assert.equal(concl.ok, true, "concluded: " + JSON.stringify(concl).slice(0, 400));
  const draft = R(await cs.call("casedraft", { body: { project, targets: [question], scope: "Whether the stamp was on the counter, on the photograph in hand.",
    statement: "This case covers the photograph only; it leaves out the later amendments.", subjectPosition: "sought_and_answered",
    subjectJustification: "We put the question to the Clerk and printed the answer.", roles: { [question]: "load_bearing" }, excluded: [] } }));
  assert.ok(draft.draftId, "a draft: " + JSON.stringify(draft).slice(0, 300));
  const copy = R(await cs.call("reviewcopy", { query: { draft: draft.draftId } }));
  assert.ok(copy && copy.case, "the draft's copy: " + JSON.stringify(copy).slice(0, 300));
  const body = Object.assign({}, PARTS.caseArgs(copy, draft.draftId), { biasAcknowledgement: BIAS });
  const pre = await cs.call("publishpreflight", { body });
  return { own, cs, bundle, pre, photos: ((R(pre).steps || []).find((s) => s && typeof s === "object" && "photos" in s) || {}).photos };
}
const heldPhotoRefusal = (pre) => JSON.stringify(pre).includes("PHOTO_UNCHECKED");

test("R17, R29 (case-carriage R1, R8, R9, R13; 10A R172): a PNG the member uploaded and cites is a photo: the pre-flight's Photos step lists it and holds PHOTO_UNCHECKED", { timeout: 900000 }, async () => {
  const c = await chainOf("wphoto-owner", { bytes: pngOf(1), name: "street.png", type: "image/png" });
  assert.ok(Array.isArray(c.photos) && c.photos.length === 1, "the Photos step lists the upload: " + JSON.stringify(c.pre).slice(0, 900));
  assert.equal(heldPhotoRefusal(c.pre), true, "PHOTO_UNCHECKED is held: " + JSON.stringify(c.pre).slice(0, 900));
});

test("R17, R29 (case-carriage R1, R9) control: a PNG uploaded with no declared type is still a photo (the bytes decide)", { timeout: 900000 }, async () => {
  const c = await chainOf("wphoto-owner-b", { bytes: pngOf(2), name: "street2", type: "" });
  assert.ok(Array.isArray(c.photos) && c.photos.length === 1, "the Photos step lists the upload: " + JSON.stringify(c.pre).slice(0, 900));
  assert.equal(heldPhotoRefusal(c.pre), true, JSON.stringify(c.pre).slice(0, 900));
});

test("R17, R29 (case-carriage R1, R9) control: a text upload named notes.png is not a photo: no Photos step entry, no PHOTO_UNCHECKED", { timeout: 900000 }, async () => {
  const c = await chainOf("wphoto-owner-c", { bytes: kit.te("The clerk stamped the amended contract RECEIVED before the council voted on it, notes of the morning."), name: "notes.png", type: "" });
  assert.ok(!c.photos || c.photos.length === 0, "no photo is listed: " + JSON.stringify(c.pre).slice(0, 900));
  assert.equal(heldPhotoRefusal(c.pre), false, JSON.stringify(c.pre).slice(0, 900));
});
