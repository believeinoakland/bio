/* reading-pipeline R47 (fix round 10, cause 16; office-readers R38): a hidden pptx slide is one unit of the reading, marked `hidden`, never two.
   `office-readers` holds the slide once, `hidden` on the slide; this module copies the mark from the slide into its unit. The deck is test-support's
   generator's (a hidden slide and speaker notes), read by the real `office-readers` entry through `read`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { generate } from "../../docgen.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";

const unitsOf = async (recipe, cursor) => {
  const f = generate({ kind: "pptx", ...recipe });
  const bytes = await f.bytes();
  const b = bucket();
  const d = await hold(b, bytes);
  const out = await read(doc({ digest: d, bytes: bytes.length, ct: f.type, format: "pptx" }), { evidence: evidenceStore(b), env: {}, storeName: "bio", ...(cursor === undefined ? {} : { cursor }) });
  return out.text_units || [];
};

for (const cursor of [undefined, null]) {
  test(`R47 (cause 16; walk C3): a hidden slide is one unit marked hidden, whole and in pieces (${cursor === null ? "pieces" : "whole"})`, async () => {
    const units = await unitsOf({ seed: "C3", size: { units: 3 }, parts: ["hidden", "notes"] }, cursor);
    const hiddenWords = units.filter((u) => u.text.includes("C3-u4-khidden"));
    assert.equal(hiddenWords.length, 1, "the hidden slide's words are in one unit, never two");
    assert.equal(hiddenWords[0].hidden, true);
    assert.equal(hiddenWords[0].extent.kind, "slide-shape");
    assert.equal(hiddenWords[0].kind, "body");
    for (const u of units.filter((x) => x !== hiddenWords[0])) assert.equal(u.hidden, undefined, `unit ${u.seq} is not hidden`);
  });
}

test("R47 (cause 16): control: a deck with no hidden slide marks no unit hidden", async () => {
  const units = await unitsOf({ seed: "C3-plain", size: { units: 3 }, parts: ["notes"] });
  assert.ok(units.length >= 3);
  assert.ok(units.every((u) => u.hidden === undefined));
});
