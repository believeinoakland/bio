/* reading-pipeline R11b (fix round 10, cause 11b; walk A12): a reading of 120,000 or more paragraphs with parts beside them is read. The next
   `seq` of the parts was `Math.max(...units.map(...))`, which overflows the stack past about 120,000 arguments, so the DOCX of the walk was
   a final failure "Maximum call stack size exceeded". The DOCX is test-support's generator's (130,000 paragraphs and a footnote), read by the
   real `office-readers` entry through `read`; no `failure`, and the units the wire carries are the body's and the footnote's, `seq` continuing. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { generate } from "../../docgen.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";

const UNITS = 130000;
for (const cursor of [undefined, null]) {
  test(`R11b R47 (cause 11b; walk A12): a DOCX of ${UNITS} paragraphs and a footnote is read ${cursor === null ? "in pieces" : "whole"}: no failure, the units carried`, { timeout: 300_000 }, async () => {
    const f = generate({ kind: "docx", seed: "A12", size: { units: UNITS }, parts: ["footnote"] });
    const bytes = await f.bytes();
    const b = bucket();
    const d = await hold(b, bytes);
    const out = await read(doc({ digest: d, bytes: bytes.length, ct: f.type, format: "docx" }),
      { evidence: evidenceStore(b), env: {}, storeName: "bio", ...(cursor === undefined ? {} : { cursor }) });
    assert.doesNotMatch(String(out.reading.basis), /call stack/i);
    assert.notEqual(out.reading.failure, "final", String(out.reading.basis).slice(0, 200));
    assert.equal(out.reading.failure, undefined);
    assert.ok(Array.isArray(out.text_units) && out.text_units.length > 0, "units were drawn");
    const seqs = out.text_units.map((u) => u.seq);
    assert.deepEqual(seqs, [...seqs].sort((x, y) => x - y), "seq is in order");
    assert.equal(new Set(seqs).size, seqs.length, "no seq twice");
  });
}

test("R11b (cause 11b): control: a short document with a footnote numbers the part after the body", async () => {
  const f = generate({ kind: "docx", seed: "A12-small", size: { units: 4 }, parts: ["footnote"] });
  const bytes = await f.bytes();
  const b = bucket();
  const d = await hold(b, bytes);
  const out = await read(doc({ digest: d, bytes: bytes.length, ct: f.type, format: "docx" }), { evidence: evidenceStore(b), env: {}, storeName: "bio" });
  const foot = out.text_units.find((u) => u.kind === "footnote");
  assert.ok(foot, "the footnote is a unit of its kind");
  const body = out.text_units.filter((u) => u.kind === "body");
  assert.ok(foot.seq > Math.max(...body.map((u) => u.seq)), "the part's seq follows the body's");
});
