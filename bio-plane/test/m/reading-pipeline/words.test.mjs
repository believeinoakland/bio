/* reading-pipeline R35 (T51 fix round 2, C17; K4312): a reading that has text units carries `words_total`, the words of
   its text, and `words_read`, the words its text units hold: equal when the whole text was read, fewer when a part
   could not be read. Tested at `read`, called directly over the stored bytes, through the real registered entries. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, hold, doc, member, ocrAnswer } from "./fixture.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";
import { CAPTURE_TEXT_UNIT_CAP } from "../../../src/reading-pipeline/index.mjs";

registerDoctypes(registerDoctype);

const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const readPicture = async (answer) => {
  const w = fresh();
  const d = await hold(w.evidence, JPEG);
  const out = await w.read(doc({ digest: d, bytes: JPEG.length, ct: "image/jpeg", format: "jpeg" }), { env: { OCR_WORKER: member(answer) } });
  return { out, r: out.reading };
};
const at = (n) => ({ kind: "pdf-page", ref: "p0", page: 0, rect: [0, n * 10, 10, n * 10 + 9] });
const region = (text, value) => ({ text, source: at(text.length), confidence: { value, basis: "engine" } });
const answer = (regions) => ({ ok: true, engine: "tess", version: "5.3", cap: "C", measured_by: "M-1", confidence_floor: 0.6,
                               pages: [{ page: 0, regions }], deferred: [], notes: [] });
const readText = async (text, { format = "html", ct = "text/html" } = {}) => {
  const w = fresh();
  const d = await hold(w.evidence, text);
  return w.read(doc({ digest: d, bytes: Buffer.byteLength(text), ct, format, fromText: true }));
};

test("R35: a picture read whole by the OCR member answers equal counts, the words of what it read", async () => {
  const { out, r } = await readPicture(() => answer([region("notice of public hearing", 0.9), region("on the housing plan", 0.8)]));
  assert.equal(r.text_tier, 3);
  assert.ok(out.text_units.length > 0);
  assert.deepEqual([r.words_total, r.words_read], [8, 8]);
});

test("R35: a picture with an unreadable part answers fewer words read than total: the words of a region below the engine's floor are counted in the total and are no unit's", async () => {
  const { out, r } = await readPicture(() => answer([region("notice of public hearing", 0.9), region("faint blurred lower paragraph here", 0.1)]));
  assert.equal(out.text_units.map((u) => u.text).join(" ").includes("faint"), false, "the discarded words are not carried");
  assert.deepEqual([r.words_read, r.words_total], [4, 9]);
  assert.ok(r.words_read < r.words_total);
});

test("R35 control: a picture every region of which is below the floor has no text units, so no counts", async () => {
  const { out, r } = await readPicture(() => answer([region("faint blurred words", 0.1)]));
  assert.equal("text_units" in out, false);
  assert.equal("words_total" in r, false);
  assert.equal("words_read" in r, false);
});

test("R35: a captured page and a plain-text capture read whole answer equal counts, over the text the units are drawn from", async () => {
  const html = await readText("<html><head><title>T</title></head><body><nav>Home Menu Search</nav><main><p>The council met on Tuesday.</p><p>It adopted the plan.</p></main></body></html>");
  assert.ok(html.text_units.length > 0);
  assert.deepEqual([html.reading.words_total, html.reading.words_read], [9, 9]);
  const plain = await readText("A title line\nsecond line has more words\nthird", { format: "text", ct: "text/plain" });
  assert.deepEqual([plain.reading.words_total, plain.reading.words_read], [9, 9]);
});

test("R35: a unit cut to its cap holds fewer words than the text had", async () => {
  const word = "lorem ";
  const big = word.repeat(Math.ceil(CAPTURE_TEXT_UNIT_CAP / word.length) + 1000).trim();
  const { reading, text_units } = await readText(big, { format: "text", ct: "text/plain" });
  assert.equal(text_units[0].truncated, true);
  assert.ok(reading.words_read < reading.words_total);
  assert.equal(reading.words_total, big.split(" ").length);
});

test("R35 control: a capture with no glyph has no text units and no counts", async () => {
  const { reading, text_units } = await readText("   \n\n  ", { format: "text", ct: "text/plain" });
  assert.equal(text_units, undefined);
  assert.equal("words_total" in reading, false);
});
