/* reading-pipeline R60 R54 (fix round 10, cause 2b; K5055): a refusal for a bound carries what its figure measures. A CSV of 1,048,577 rows is
   refused with `metric` "rows" and a sentence that says rows, never bytes; a DOCX refused for objects carries `n` 250,001 for the bound 250,000
   and the unit objects. Each test names the ids. Through `read`, the entry path every caller takes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, withEntry } from "./fixture.mjs";

const readOf = (b, document, extra = {}) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...extra });

test("R60 R54 (cause 2b; walks B2d, B3d, B9b, B11, B12a): a CSV of 1,048,577 rows is refused with metric rows and a sentence that does not say bytes", async () => {
  const rows = 1048577;
  const body = "1\n".repeat(rows);
  const b = bucket();
  const d = await hold(b, body);
  const out = await readOf(b, doc({ digest: d, bytes: body.length, ct: "text/csv", format: "csv", fromText: true }));
  const r = out.reading;
  assert.equal(r.found, false);
  assert.equal(r.failure, "final");
  assert.equal(r.reason, "TOO_LARGE");
  assert.equal(r.metric, "rows", "the refusal carries the unit its figure measures");
  assert.equal(r.size, rows);
  assert.equal(r.bound, rows - 1);
  assert.ok(r.basis.includes(String(r.size)) && r.basis.includes(String(r.bound)), r.basis);
  assert.match(r.basis, /\brows\b/);
  assert.doesNotMatch(r.basis, /bytes/i, "rows are never called bytes");
});

test("R60 R54 (cause 2b; walk B3d): a DOCX refused for objects carries bound 250,000, n 250,001 and the unit objects", async () => {
  const marker = { ok: false, why: "TOO_MANY_OBJECTS", n: 250001, bound: 250000, final: true };
  const b = bucket();
  const d = await hold(b, "PK-stand-in");
  await withEntry({ format: "zip", detect: (x) => (x && x.length ? { format: "zip", confidence: "certain", signals: [] } : null), parts: null,
                    text: async () => ({ document: "", undetermined: [{ part: "word/document.xml", why: marker.why, guard: marker }], counts: { chars: 0, undetermined: 1 } }) }, async () => {
    const r = (await readOf(b, doc({ digest: d, bytes: 11, ct: "application/octet-stream", format: "zip" }))).reading;
    assert.equal(r.reason, "STRUCTURE_OVER_BOUND");
    assert.equal(r.failure, "final");
    assert.equal(r.bound, 250000);
    assert.equal(r.n, 250001);
    assert.equal(r.metric, "objects");
    assert.match(r.basis, /objects/);
    assert.ok(r.basis.includes("250000") || r.basis.includes("250,000"), r.basis);
    assert.doesNotMatch(r.basis, /bytes/i);
  });
});

test("R60 R54 (cause 2b): a size over a byte bound still says bytes, with the metric", async () => {
  const guard = { ok: false, text: "undetermined", why: "over_size_bound", size: 34603008, bound: 33554432, boundName: "STREAMED_TEXT_BOUND_BYTES", metric: "bytes", final: true };
  const b = bucket();
  const d = await hold(b, "PK-stand-in");
  await withEntry({ format: "zip", detect: (x) => (x && x.length ? { format: "zip", confidence: "certain", signals: [] } : null), parts: null,
                    text: async () => ({ document: "", undetermined: [{ part: "xl/worksheets/sheet1.xml", why: guard.why, guard }], counts: { chars: 0, undetermined: 1 } }) }, async () => {
    const r = (await readOf(b, doc({ digest: d, bytes: 11, ct: "application/octet-stream", format: "zip" }))).reading;
    assert.equal(r.reason, "TOO_LARGE");
    assert.equal(r.metric, "bytes");
    assert.match(r.basis, /34603008 bytes/);
  });
});
