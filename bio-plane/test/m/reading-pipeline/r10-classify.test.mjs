/* reading-pipeline R52 (fix round 9, job 40; G133f; X25): classification is a budgeted step. The recognisers (`docprofile.doctypeFor`) are handed a bounded view of
   a text above 2 MiB, whatever its kind (a plain text, an HTML page, a CSV, a JSON), each `detect` a window and one shared work counter, and the characters all the
   detects examine are at most four times the view for each registered type (docprofile R40); a read in pieces classifies once (R42) and its tick's longest stretch is
   one `detect` over one window. R-CLOCK: counts of characters and calls, never a time. A short text is classified whole, as before. Each test names the ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { doctypes, registerDoctype, CLASSIFY_WHOLE_MAX_CHARS, CLASSIFY_VIEW_MAX_CHARS, CLASSIFY_WORK_FACTOR } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";

registerDoctypes(registerDoctype);   /* the real content types, as the plane registers them */

const seen = [];   /* one record per detect call: the text length it was handed, its window and the work counter */
for (const t of doctypes()) {
  const detect = t.detect;
  registerDoctype({ ...t, detect: function (ctx, ...a) {
    seen.push({ key: t.key, text: typeof ctx.text === "string" ? ctx.text.length : null, window: ctx.window ? { ...ctx.window } : null, work: ctx.work || null });
    return detect.call(this, ctx, ...a);
  } });
}
const firstTick = async (text, { ct = "text/plain", format = "undetermined" } = {}) => {
  const b = bucket();
  const d = await hold(b, text);
  seen.length = 0;
  return read(doc({ digest: d, bytes: Buffer.byteLength(text), ct, format, fromText: true }), { evidence: evidenceStore(b), env: {}, storeName: "bio", cursor: null, unitsBudget: 512 * 1024, maxUnits: 4096 });
};
const sentence = "The board of supervisors met on the third day of the month and approved the minutes of the prior meeting. ";

for (const [name, ct, make] of [
  ["plain text", "text/plain", () => sentence.repeat(Math.ceil(12e6 / sentence.length))],
  ["HTML", "text/html", () => "<html><body>" + `<p>${sentence}</p>`.repeat(Math.ceil(12e6 / (sentence.length + 7))) + "</body></html>"],
  ["JSON", "application/json", () => "[" + `{"text":"${sentence}"},`.repeat(Math.ceil(12e6 / (sentence.length + 12))) + "{}]"],
]) {
  test(`R52 (G133f, DOCS T1/T4/Q1): a 12 MB ${name} is classified from a bounded view: every detect is handed at most the view, a window and the one work counter, and the characters examined are within four times the view per type`, { timeout: 600_000 }, async () => {
    const text = make();
    assert.ok(text.length > 4 * CLASSIFY_WHOLE_MAX_CHARS);
    const out = await firstTick(text, { ct, format: ct === "text/html" ? "html" : "undetermined" });
    assert.ok(out.reading, "a reading was composed");
    assert.ok(seen.length >= 8, `${seen.length} detects: every registered type is asked`);
    for (const s of seen) {
      assert.ok(s.text !== null && s.text <= CLASSIFY_VIEW_MAX_CHARS, `${s.key} was handed ${s.text} characters of a ${text.length}-character text`);
      assert.ok(s.window && Number.isFinite(s.window.of) && s.window.to - s.window.from <= CLASSIFY_VIEW_MAX_CHARS, `${s.key}'s window ${JSON.stringify(s.window)}`);
      assert.ok(s.work && typeof s.work === "object", `${s.key} is handed the work counter`);
    }
    const w = seen[0].work;
    assert.ok(w.chars <= w.limit + CLASSIFY_VIEW_MAX_CHARS, `${w.chars} characters examined, the limit ${w.limit}`);
    assert.ok(w.limit <= CLASSIFY_WORK_FACTOR * CLASSIFY_VIEW_MAX_CHARS * doctypes().length, "the limit is four times the view for each registered type");
    assert.equal(out.reading.classified_over === undefined, false, "the reading states it was classified over a view");
  });
}

test("R52 (control): a short text is classified whole, as before: each detect is handed the whole text and no view is stated", async () => {
  const text = sentence.repeat(200);
  const out = await firstTick(text);
  assert.ok(seen.length >= 8);
  for (const s of seen) assert.equal(s.text, text.length);
  assert.equal(out.reading.classified_over, undefined);
});
