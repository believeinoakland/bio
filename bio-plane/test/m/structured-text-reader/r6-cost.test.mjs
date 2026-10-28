/* structured-text-reader R6: each step's cost is bounded by the bytes it decodes; no step rescans what another read.
 * A file at the text bound on one line finishes in steps of the budget; nesting deeper than the limit refuses the file
 * whole, naming the limit, after reading no more than the step that found it. Work is counted, never timed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../../../src/structured-text-reader/index.mjs";
import { generatedText, countingSource, enc, NESTING_MAX, TEXT_BYTES_MAX } from "./fixtures.mjs";

const counted = (source) => {
  const log = { bytes: 0, reads: 0 };
  return { log, size: source.size, async readRange(o, l) { log.reads++; log.bytes += l; return source.readRange(o, l); } };
};

test("R6 a single-line JSON at the text bound finishes in steps of the budget, each byte read once", async () => {
  const gen = generatedText({ head: "[", first: ' {"id":"@@@@@@@@@","v":"x"}', record: ',{"id":"@@@@@@@@@","v":"x"}', tail: "]", size: TEXT_BYTES_MAX });
  const src = counted(gen);
  const budget = { bytes: 4 << 20 };
  let cursor = null, steps = 0, before = 0;
  for (;;) {
    const r = await S.jsonEntry.read(src, cursor, budget);
    assert.equal(r.ok, true);
    steps++;
    assert.ok(r.read_through - before <= budget.bytes, "a step decodes no more than its budget");
    assert.equal(r.final?.whole ?? true, true);
    before = r.read_through;
    if (!r.more) break;
    cursor = r.next;
  }
  assert.equal(before, TEXT_BYTES_MAX);
  assert.equal(steps, Math.ceil(TEXT_BYTES_MAX / budget.bytes));
  assert.ok(src.log.bytes <= TEXT_BYTES_MAX + S.HEAD_BYTES, `bytes read ${src.log.bytes}: the file once and its head`);
});

const nestedXml = (depth) => "<a>".repeat(depth) + "deep" + "</a>".repeat(depth);
const nestedJson = (depth) => "[".repeat(depth) + "1" + "]".repeat(depth);

test("R6 an XML nested 10,000 deep is refused whole naming the limit, within the first step's budget", async () => {
  const bytes = enc(nestedXml(10 * NESTING_MAX));
  const src = countingSource(bytes);
  const budget = { bytes: 64 * 1024 };
  const r = await S.xmlEntry.read(src, null, budget);
  assert.equal(r.ok, false);
  assert.equal(r.failure, "final");
  assert.equal(r.reason, "NESTING_OVER_LIMIT");
  assert.equal(r.bound, NESTING_MAX);
  assert.equal(r.whole, true);
  assert.deepEqual(r.units, []);
  assert.ok(r.detail.includes(String(NESTING_MAX)), "the sentence names the limit");
  assert.ok(src.log.bytes <= S.HEAD_BYTES + budget.bytes);
});

test("R6 nesting at the limit reads; one deeper refuses, for XML and for JSON", async () => {
  for (const [entry, make] of [[S.xmlEntry, nestedXml], [S.jsonEntry, nestedJson]]) {
    const at = await entry.read(countingSource(enc(make(NESTING_MAX))), null, null);
    assert.equal(at.ok, true, entry.format);
    assert.equal(at.final.whole, true);
    const over = await entry.read(countingSource(enc(make(NESTING_MAX + 1))), null, { bytes: 1 << 12 });
    assert.equal(over.reason, "NESTING_OVER_LIMIT", entry.format);
    assert.equal(over.bound, NESTING_MAX);
  }
});

test("R6 control: a step's units come from its own window alone; the next step starts where it stopped", async () => {
  const bytes = enc(JSON.stringify(Array.from({ length: 2000 }, (_, i) => ({ i }))));
  const src = countingSource(bytes);
  let cursor = null, last = 0;
  for (;;) {
    const r = await S.jsonEntry.read(src, cursor, { bytes: 1000 });
    if (!r.more) break;
    cursor = r.next;
    last = r.read_through;
  }
  const offsets = src.log.ranges.slice(1).map(([o]) => o);
  for (let k = 1; k < offsets.length; k++) assert.ok(offsets[k] > offsets[k - 1], "no range is read twice");
  assert.ok(last > 0);
});
