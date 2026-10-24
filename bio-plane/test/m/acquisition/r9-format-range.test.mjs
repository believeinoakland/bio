/* acquisition R101 (fix round 9, G130c; amends R17): A CAPTURE OF ANY SIZE IS PROFILED FROM RANGE READS OF ITS HEAD AND ITS TAIL. `profileOf` for a capture held in
   several parts, or whole past the bytes read back, judges `format` through range reads (the one reader behind `readRange`, R113): an office or OpenDocument file past
   8 MiB is its own format, a PDF or picture with no declared type is itself, a plain ZIP is `zip` only from its bytes, bytes of no known format stay `undetermined`, and a part
   that is not there or a store that cannot read is stated, never a failed profile. Each test has its control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { profileOf, profileView } from "../../../src/acquisition/index.mjs";

const MIB = 1024 * 1024;
const PART = 8 * MIB;
const filler = (n) => new Uint8Array(n).map((_, i) => (i * 2654435761) >>> 24);
const docx = (n) => makeZip([{ name: "[Content_Types].xml", data: '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
  { name: "word/document.xml", data: "<w:document/>" }, { name: "word/media/big.bin", data: filler(n), method: 0 }]);
const odt = (n) => makeZip([{ name: "mimetype", data: "application/vnd.oasis.opendocument.text", method: 0 }, { name: "content.xml", data: "<office:document-content/>" },
  { name: "META-INF/manifest.xml", data: "<m/>" }, { name: "Pictures/big.bin", data: filler(n), method: 0 }]);
const plainZip = (n) => makeZip([{ name: "big.bin", data: filler(n), method: 0 }, { name: "a.txt", data: "a" }]);
const png = (n) => { const b = new Uint8Array(n).fill(7); b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0); return b; };

/* what an upload leaves: the bytes in parts of 8 MiB, each under its own digest, and (when `whole`) the whole under its own */
async function held(w, bytes, { whole = false } = {}) {
  const ev = w.core.evidenceStore();
  const parts = [];
  for (let at = 0; at < bytes.length; at += PART) {
    const buf = bytes.slice(at, at + PART);
    const psha = sha(buf);
    await ev.put(psha, buf);
    parts.push({ sha256: psha, bytes: buf.length });
  }
  if (whole) await ev.put(sha(bytes), bytes);
  return { ev, parts, total: bytes.length, sha: sha(bytes) };
}
const profile = (w, h, extra = {}) => profileOf({ ev: h.ev, sha: h.sha, ct: null, total: h.total, multipart: h.parts.length > 1, headers: {}, locator: "upload:x",
  view: profileView(w.core), retrieved: "2026-10-24T00:00:00Z", origin: "member", parts: h.parts, ...extra });

test("R101 (G130c): an office file past 8 MiB, in several parts, is docx; an OpenDocument file is odt, certain; neither is zip nor undetermined", async () => {
  const w = world();
  const d = await profile(w, await held(w, docx(10 * MIB)));
  assert.equal(d.format.format, "docx");
  const o = await profile(w, await held(w, odt(10 * MIB)));
  assert.equal(o.format.format, "odt");
  assert.equal(o.format.confidence, "certain");
});

test("R101 (G130c): the same office file held whole past 8 MiB (no parts handed) is docx; a plain ZIP in parts is zip, from its bytes", async () => {
  const w = world();
  const bytes = docx(10 * MIB);
  const h = await held(w, bytes, { whole: true });
  const whole = await profileOf({ ev: h.ev, sha: h.sha, ct: null, total: h.total, multipart: false, headers: {}, locator: "upload:y",
    view: profileView(w.core), retrieved: "2026-10-24T00:00:00Z", origin: "member", parts: null });
  assert.equal(whole.format.format, "docx", "held whole past the bytes read back");
  const z = await profile(w, await held(w, plainZip(10 * MIB)));
  assert.equal(z.format.format, "zip");
});

test("R101 (G130c): a picture and a PDF with no declared type are themselves; each is read by range, no part whole", async () => {
  const w = world();
  const p = await held(w, png(10 * MIB));
  w.b.calls.length = 0;
  assert.equal((await profile(w, p)).format.format, "png");
  assert.deepEqual(w.b.calls.filter((c) => c[0] === "get" && !(c[2] && c[2].range)), [], "no part read whole");
});

test("R101 control: bytes of no known format stay undetermined; a declared ZIP type whose bytes are not a ZIP does not make one; a declared type names a format the bytes do not contradict", async () => {
  const w = world();
  const junk = await held(w, new Uint8Array(10 * MIB).fill(0x41));
  assert.equal((await profile(w, junk)).format.format, "undetermined");
  const lie = await profile(w, junk, { ct: "application/zip" });
  assert.equal(lie.format.format, "undetermined", "a declared type never makes a ZIP");
  const typed = await profile(w, junk, { ct: "application/pdf" });
  assert.equal(typed.format.format, "pdf", "the declared type stands when the bytes name none");
});

test("R101 control: a first part that is not there is stated and the profile is not failed; a store that cannot read is stated through `unread`, a missing part is not", async () => {
  const w = world();
  const h = await held(w, plainZip(10 * MIB));
  const missing = { ...h, parts: [{ sha256: "0".repeat(64), bytes: 1 }, ...h.parts] };
  const unread = {};
  const p = await profile(w, missing, { unread });
  assert.equal(p.format.format, "undetermined");
  assert.equal(unread.reason, undefined, "an absent part is a statement, not a store failure");
  const failing = { ...h, ev: { head: async () => null, get: async () => { throw new Error("store unavailable"); }, put: h.ev.put } };
  const u2 = {};
  const q = await profile(w, failing, { unread: u2 });
  assert.equal(q.format.format, "undetermined");
  assert.match(u2.reason, /store unavailable/);
});
