/* register-readers R10: a row count estimated from a sample, and always said to be an estimate. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate } from "../../../src/register-readers/index.mjs";

/* A piece of rows of the given lengths, sampled as the caller samples it: head, middle and tail windows. */
function piece(lengths, window = 4096) {
  const ends = [];
  let total = 0;
  for (const n of lengths) { total += n; ends.push(total); }
  const windowAt = (from) => {
    let bytes = 0, rows = 0;
    for (let i = 0, start = 0; i < lengths.length; start = ends[i], i++) {
      if (start < from) continue;
      if (bytes + lengths[i] > window) break;
      bytes += lengths[i]; rows++;
    }
    return { bytes, rows };
  };
  const spread = [windowAt(0), windowAt(Math.floor(total / 2)), windowAt(Math.max(0, total - window))];
  return { total, sample: { bytes: spread.reduce((s, w) => s + w.bytes, 0), rows: spread.reduce((s, w) => s + w.rows, 0), spread } };
}

test("R10 uniform rows give an estimate within 10% of the true count", () => {
  const lengths = Array.from({ length: 50_000 }, (_, i) => 80 + (i % 7));
  const { total, sample } = piece(lengths);
  const e = estimate(sample, { bytes: total });
  assert.equal(e.rows.basis, "estimated");
  assert.ok(Math.abs(e.rows.value - lengths.length) <= lengths.length * 0.1, `${e.rows.value} vs ${lengths.length}`);
  assert.ok(e.rows.low <= lengths.length && lengths.length <= e.rows.high);
  assert.ok(e.bytes_per_row > 80 && e.bytes_per_row < 87);
});

test("R10 a piece whose tail rows are 5 times longer has the true count inside the interval", () => {
  const lengths = [...Array(30_000).fill(60), ...Array(10_000).fill(300)];
  const { total, sample } = piece(lengths);
  const e = estimate(sample, { bytes: total });
  assert.ok(e.rows.low <= lengths.length && lengths.length <= e.rows.high, `${e.rows.low}..${e.rows.high} vs ${lengths.length}`);
});

test("R10 never a count: no input is not_stated, and no answer says counted", () => {
  assert.deepEqual(estimate(), { rows: { value: null, basis: "not_stated" }, bytes_per_row: null });
  assert.deepEqual(estimate({ bytes: 100, rows: 2 }, {}), { rows: { value: null, basis: "not_stated" }, bytes_per_row: null });
  for (const args of [[{ bytes: 100, rows: 2 }, { bytes: 1000 }], [{ bytes: 1000, rows: 10 }, { bytes: 1000 }], [null, null], [{ rows: 0, bytes: 0 }, { bytes: 5 }]]) {
    assert.notEqual(estimate(...args).rows.basis, "counted");
  }
});

test("R10 control: a sample of the whole file gives low equal to high", () => {
  const e = estimate({ bytes: 1000, rows: 10, spread: [{ bytes: 1000, rows: 10 }] }, { bytes: 1000 });
  assert.equal(e.rows.low, e.rows.high);
  assert.equal(e.rows.value, 10);
  assert.equal(e.rows.basis, "estimated");
});
