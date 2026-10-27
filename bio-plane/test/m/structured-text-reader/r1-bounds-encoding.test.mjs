/* structured-text-reader R1: a file one byte over the text bound is refused with its size before any byte is read; the
 * bound itself plans as readable; the encoding (UTF-8, UTF-16 with or without its mark, windows-1252, ISO-8859-x) is
 * decided from the head, carried in the cursor from step to step and shown on every answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../../../src/structured-text-reader/index.mjs";
import { enc, countingSource, unitsOf, TEXT_BYTES_MAX } from "./fixtures.mjs";

const ENTRIES = S.STRUCTURED_TEXT_ENTRIES;

const unreadable = (size) => {
  const log = { reads: 0 };
  return { log, size, async readRange() { log.reads++; throw new Error("no byte of an over-bound file is read"); } };
};

test("R1 a file of the text bound plus one byte is refused with its size and the limit, nothing read, by every entry", async () => {
  for (const entry of ENTRIES) {
    const src = unreadable(TEXT_BYTES_MAX + 1);
    const r = await entry.read(src, null, null);
    assert.equal(r.ok, false, entry.format);
    assert.equal(r.failure, "final");
    assert.equal(r.reason, "TOO_LARGE");
    assert.equal(r.size, TEXT_BYTES_MAX + 1);
    assert.equal(r.bound, TEXT_BYTES_MAX);
    assert.equal(typeof r.key, "string");
    assert.ok(r.detail.includes(String(TEXT_BYTES_MAX + 1)), "the sentence states the size");
    assert.equal(src.log.reads, 0, `${entry.format}: nothing read`);
    const p = await entry.plan({ size: TEXT_BYTES_MAX + 1, readRange: async (o, l) => new Uint8Array(l).fill(0x20) });
    assert.equal(p.verdict.ok, false);
    assert.equal(p.verdict.size, TEXT_BYTES_MAX + 1);
    assert.equal(p.verdict.limit, TEXT_BYTES_MAX);
  }
});

test("R1 plan reads the head alone: a file at the text bound plans as readable, in byte windows", async () => {
  const src = { size: TEXT_BYTES_MAX, log: [], async readRange(o, l) { this.log.push([o, l]); return new Uint8Array(l).fill(0x20); } };
  const p = await S.jsonEntry.plan(src);
  assert.equal(p.kind, "json");
  assert.equal(p.verdict.ok, true);
  assert.equal(p.mode, "windows");
  assert.equal(src.log.length, 1);
  assert.equal(src.log[0][0], 0);
  assert.ok(src.log[0][1] <= S.HEAD_BYTES);
});

const utf16 = (s, le, bom) => {
  const out = new Uint8Array((s.length + (bom ? 1 : 0)) * 2);
  let at = 0;
  const put = (u) => { if (le) { out[at++] = u & 0xff; out[at++] = u >> 8; } else { out[at++] = u >> 8; out[at++] = u & 0xff; } };
  if (bom) put(0xfeff);
  for (let i = 0; i < s.length; i++) put(s.charCodeAt(i));
  return out;
};
const latin = (s) => Uint8Array.from(s, (ch) => ch.charCodeAt(0));

test("R1 the encoding is decided from the head, shown on the answer and carried by the cursor across windows", async () => {
  const json = '{"name": "café ✓", "n": [1, 2]}';
  const cases = [
    ["utf-8", enc(json), "café ✓"],
    ["utf-8", Uint8Array.from([0xef, 0xbb, 0xbf, ...enc(json)]), "café ✓"],
    ["utf-16le", utf16(json, true, true), "café ✓"],
    ["utf-16be", utf16(json, false, true), "café ✓"],
    ["utf-16le", utf16(json, true, false), "café ✓"],
    ["windows-1252", latin('{"name": "café \u0093q\u0094"}'), "café “q”"],
  ];
  for (const [encoding, bytes, expected] of cases) {
    for (const budget of [null, { bytes: 3 }]) {
      const r = await unitsOf(S.jsonEntry, bytes, budget);
      assert.equal(r.ok, true, encoding);
      assert.equal(r.encoding, encoding, `${encoding} shown`);
      assert.equal(r.units[0].text, expected, `${encoding} read alike whole and in ${budget ? "3-byte windows" : "one piece"}`);
      assert.equal(r.final.whole, true);
    }
  }
  /* ISO-8859-2, named by the XML declaration: 0xB1 is ą */
  const xml = Uint8Array.from([...enc('<?xml version="1.0" encoding="ISO-8859-2"?><a>'), 0xb1, ...enc("</a>")]);
  const x = await unitsOf(S.xmlEntry, xml, { bytes: 5 });
  assert.equal(x.encoding, "iso-8859-2");
  assert.equal(x.units[0].text, "ą");
});

test("R1 every step's answer names the encoding and the bytes read through, of the file's size", async () => {
  const bytes = utf16('[' + Array.from({ length: 50 }, (_, i) => `"é${i}"`).join(",") + "]", true, true);
  const src = countingSource(bytes);
  let cursor = null, steps = 0;
  for (;;) {
    const r = await S.jsonEntry.read(src, cursor, { bytes: 16 });
    steps++;
    assert.equal(r.encoding, "utf-16le");
    assert.equal(r.total, bytes.length);
    assert.ok(r.read_through <= bytes.length);
    if (!r.more) break;
    cursor = r.next;
  }
  assert.ok(steps > 10);
});
