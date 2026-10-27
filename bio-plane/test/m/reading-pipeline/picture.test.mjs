/* reading-pipeline over a picture capture (T43; N853b, format-registry R29, R30): a JPEG or PNG file reads, through the
   REAL registered entry, as one picture page carrying `no_text_layer`, so `read` treats it as it treats an un-OCR'd
   scan: no tier 2, a tier-3 candidate, unread with the tier-3 note, a failed reading never an emptied document. Tested
   at `read`, called directly over the stored bytes. Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, hold, doc, member, ocrAnswer } from "./fixture.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { pageNotRenderable } from "../../../../ocr-worker/test/fixtures.mjs";

registerDoctypes(registerDoctype);

/* The signatures' first bytes and a little more: the entries decode nothing, so the rest need not be an image. */
const PICTURES = {
  jpeg: { ct: "image/jpeg", bytes: Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]) },
  png: { ct: "image/png", bytes: Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]) },
};
const NO_OCR = word("reading-pipeline.document_text_layer");
const readPicture = async (format, env = {}) => {
  const w = fresh();
  const { ct, bytes } = PICTURES[format];
  const d = await hold(w.evidence, bytes);
  const out = await w.read(doc({ digest: d, bytes: bytes.length, ct, format, headers: [["content-type", ct]] }), { env });
  return { d, out, r: out.reading };
};

test("R4 R9 R11 R12 R3 (N853b): a JPEG and a PNG capture each read as one picture page: tier 2 never asked, no OCR member bound leaves it unread with the tier-3 note, a tier-3 candidate, a failed reading at tier 1 under the layer chain, page count 1, no units", async () => {
  for (const format of ["jpeg", "png"]) {
    const pdf = member(() => { throw new Error("tier 2 must not be asked for a picture"); });
    const { out, r } = await readPicture(format, { PDF_WORKER: pdf });
    assert.equal(pdf.calls.length, 0, `${format}: no tier 2`);
    assert.deepEqual([r.found, r.read_from_text, r.entities, r.text_tier, r.text_container], [false, false, [], 1, format], format);
    assert.equal(r.tier3_candidate, true, format);
    assert.ok(r.basis.startsWith(`${NO_OCR} (`), `${format}: ${r.basis}`);
    assert.deepEqual(r.text_source.map((s) => [s.step, s.tier]), [["layer", 1]], format);
    assert.deepEqual([r.page_count, r.page_boxes, r.container_extent], [1, null, null], format);
    assert.deepEqual([r.text_chars, r.text_glyphs, r.text_undetermined], [0, 0, 1], `${format}: a scan read to nothing`);
    assert.equal("text_units" in out, false, `${format}: no unit`);
    assert.equal(r.ai_transcription, undefined);
  }
});

const notRenderable = await pageNotRenderable();

test("R4 R5 R9 (N853b): with an OCR member bound, the picture's one page is asked for (page 0, the capture's digest and store); a member that cannot render it leaves it unread with the member's reason, still a candidate, as for a scan", async () => {
  for (const format of ["jpeg", "png"]) {
    const ocr = member(() => notRenderable);   /* ocr-worker's published fixture: the real member's answer, made by its real code */
    const { d, r } = await readPicture(format, { OCR_WORKER: ocr });
    assert.deepEqual(ocr.calls.map((c) => c.body), [{ capture_sha: d, store: "bio", pages: [0] }], format);
    assert.equal(r.found, false, format);
    assert.equal(r.tier3_candidate, true, format);
    /* R54: the renderer's own reason in the member's answer (`refusal.render.reason`) is the reason stated */
    assert.match(r.basis, new RegExp(`the OCR member declined to transcribe this document \\(${notRenderable.refusal.render.reason}\\)`), format);
    assert.notEqual(r.text_tier, 3, format);
    /* control: a member that reads the page fills it, as it fills a scan's */
    const reads = await readPicture(format, { OCR_WORKER: member((b) => ocrAnswer(b.pages)) });
    assert.deepEqual([reads.r.text_tier, reads.r.tier3_candidate, reads.out.text_units.map((u) => u.text)],
                     [3, undefined, ["ocr text of page 0"]], format);
    assert.deepEqual(reads.r.text_source.map((x) => x.step), ["pixels", "ocr"], `${format}: chain pixels -> ocr`);
    assert.deepEqual([reads.r.title, reads.out.text_units.length], [null, 1], `${format}: one unit`);
  }
});
