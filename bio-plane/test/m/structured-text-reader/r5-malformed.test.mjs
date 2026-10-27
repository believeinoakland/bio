/* structured-text-reader R5: a malformed file is read as far as it parses and the rest is stated ("stopped at line N"),
 * never dropped and never claimed whole. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../../../src/structured-text-reader/index.mjs";
import { unitsOf } from "./fixtures.mjs";

/* 1,000 records, one a line after the opening bracket; the record numbered 400 (line 402) is broken */
const broken = () => {
  const lines = ["["];
  for (let i = 0; i < 1000; i++) lines.push(i === 400 ? '{"n": 400, oops}' : `{"n": ${i}},`);
  lines.push("]");
  return lines.join("\n");
};

test("R5 a JSON file broken at 40 %: 40 % read, the break stated at its line, not claimed whole", async () => {
  for (const budget of [null, { bytes: 4096 }, { bytes: 3 }]) {
    const r = await unitsOf(S.jsonEntry, broken(), budget);
    assert.equal(r.ok, true);
    assert.equal(r.more, false);
    assert.equal(r.final.whole, false);
    /* the 400 records before the break, and the broken record's value before its fault */
    assert.equal(r.units.filter((u) => u.key === "n").length, 401);
    assert.equal(r.units.at(-2).text, "399");
    assert.equal(r.final.stopped.line, 402);
    assert.equal(r.final.stopped.why, "expected_key");
    assert.equal(r.counters.skipped, 1, "the unread rest is counted as stated, not dropped");
    assert.equal(typeof r.final.stopped.detail, "string");
    assert.ok(r.final.stopped.detail.includes("402"));
  }
});

test("R5 an XML, a calendar and a caption file each stop at their fault's line, the units before it kept", async () => {
  const x = await unitsOf(S.xmlEntry, "<a>\n<b>one</b>\n<c>two</b>\n<d>three</d>\n</a>");
  assert.equal(x.final.whole, false);
  assert.equal(x.final.stopped.line, 3);
  assert.deepEqual(x.units.map((u) => u.text), ["one", "two"]);
  const ics = await unitsOf(S.icsEntry, "BEGIN:VCALENDAR\nBEGIN:VEVENT\nSUMMARY:kept\nEND:VEVENT\nBEGIN:VEVENT\nthis line has no colon\nEND:VEVENT\nEND:VCALENDAR\n");
  assert.equal(ics.final.stopped.line, 6);
  assert.deepEqual(ics.units.map((u) => u.summary), ["kept"]);
  const srt = await unitsOf(S.srtEntry, "1\n00:00:01,000 --> 00:00:02,000\nfirst\n\n2\nnot a time\nsecond\n");
  assert.equal(srt.final.stopped.line, 6);
  assert.deepEqual(srt.units.map((u) => u.text), ["first"]);
  const cut = await unitsOf(S.jsonEntry, '{"a": [1, 2, "unterminated');
  assert.equal(cut.final.whole, false);
  assert.equal(cut.final.stopped.why, "ended_inside_value");
  assert.deepEqual(cut.units.map((u) => u.text), ["1", "2"]);
});

test("R5 control: a well-formed file is claimed whole and states no stop", async () => {
  const r = await unitsOf(S.jsonEntry, '{"a": [1, 2]}');
  assert.equal(r.final.whole, true);
  assert.equal(r.final.stopped, undefined);
  assert.equal(r.counters.skipped, 0);
});
