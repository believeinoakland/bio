/* structured-text-reader R8: one registry entry for each format, in format-registry's entry shape, each answering
 * `detect` by content (never by extension or declared type alone), each reading over a range source in windows with a
 * carry, so a window boundary inside a multi-byte character, a UTF-16 pair or a quoted string reads the same units. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../../../src/structured-text-reader/index.mjs";
import { makeZip } from "../../make-zip.mjs";
import { enc, unitsOf } from "./fixtures.mjs";

const SAMPLES = {
  json: '{"agenda": [{"item": 1, "title": "Minutes"}]}',
  ndjson: '{"id": 1, "v": "a"}\n{"id": 2, "v": "b"}\n',
  xml: '<?xml version="1.0"?>\n<agenda><item>Minutes</item></agenda>',
  svg: '<svg xmlns="http://www.w3.org/2000/svg"><text>Map</text></svg>',
  kml: '<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2"><Placemark><name>A</name></Placemark></kml>',
  geojson: '{"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {}, "geometry": null}]}',
  ics: "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n",
  vcf: "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:A\r\nEND:VCARD\r\n",
  srt: "1\n00:00:01,000 --> 00:00:02,000\nHello\n",
  vtt: "WEBVTT\n\n00:01.000 --> 00:02.000\nHello\n",
};
const sample = (f) => (f === "kmz" ? makeZip([{ name: "doc.kml", data: enc(SAMPLES.kml) }]) : enc(SAMPLES[f]));

test("R8 the module exports one entry for each format it reads, in format-registry's shape", () => {
  assert.deepEqual(S.STRUCTURED_TEXT_ENTRIES.map((e) => e.format), ["json", "ndjson", "xml", "svg", "kml", "kmz", "geojson", "ics", "vcf", "srt", "vtt"]);
  for (const e of S.STRUCTURED_TEXT_ENTRIES) {
    assert.equal(typeof e.format, "string");
    assert.ok(e.format.length > 0);
    assert.equal(typeof e.detect, "function");
    for (const slot of ["parts", "structure", "text"]) assert.ok(e[slot] === null || typeof e[slot] === "function", `${e.format}.${slot}`);
    assert.equal(typeof e.text, "function");
    assert.equal(typeof e.plan, "function");
    assert.equal(typeof e.read, "function");
  }
});

test("R8 each format's generated sample is answered with that format, certain, by its own entry and by no other", () => {
  for (const f of S.STRUCTURED_TEXT_FORMATS) {
    const b = sample(f);
    for (const e of S.STRUCTURED_TEXT_ENTRIES) {
      const hit = e.detect(b, null);
      if (e.format === f) {
        assert.equal(hit?.format, f, `${f} detected`);
        assert.equal(hit.confidence, "certain");
        assert.ok(Array.isArray(hit.signals) && hit.signals.length > 0);
      } else {
        assert.equal(hit, null, `${f}'s sample is not ${e.format}`);
      }
    }
  }
});

test("R8 a PNG named .json is not JSON; the declared type is not consulted while bytes are given", () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]);
  for (const e of S.STRUCTURED_TEXT_ENTRIES) {
    assert.equal(e.detect(png, null), null, e.format);
    assert.equal(e.detect(png, "application/json"), null, e.format);
  }
  assert.equal(S.jsonEntry.detect(enc("just some words, not data"), "application/json"), null);
  assert.equal(S.jsonEntry.detect(null, "application/json")?.confidence, "likely");
  assert.equal(S.icsEntry.detect(null, "text/calendar; charset=utf-8")?.format, "ics");
  assert.equal(S.icsEntry.detect(null, "text/plain"), null);
});

test("R8 control: a text that mentions BEGIN:VCALENDAR after its first lines is not ics; prose opening with a bracket is not JSON", () => {
  const note = enc("Notes from the meeting.\nTo subscribe, a calendar file starts with\nBEGIN:VCALENDAR\nEND:VCALENDAR\n");
  for (const e of S.STRUCTURED_TEXT_ENTRIES) assert.equal(e.detect(note, null), null, e.format);
  assert.equal(S.jsonEntry.detect(enc("[link](https://example.org) and more"), null), null);
  assert.equal(S.xmlEntry.detect(enc("<!doctype html><html><body>x</body></html>"), null), null);
  assert.equal(S.xmlEntry.detect(enc("<3 we love the park"), null), null);
});

const strip = (units) => units.map(({ seq, ...u }) => u);
const utf16le = (s) => { const o = new Uint8Array(2 + s.length * 2); o[0] = 0xff; o[1] = 0xfe; for (let i = 0; i < s.length; i++) { o[2 + i * 2] = s.charCodeAt(i) & 0xff; o[3 + i * 2] = s.charCodeAt(i) >> 8; } return o; };

test("R8 a window boundary inside a multi-byte character, a UTF-16 pair or a quoted string reads the same units as the whole text", async () => {
  const text = '{"name": "Ébène 😀 ✓", "quote": "a \\"quoted, string\\" here", "list": ["日本語", "x\\u00e9"]}';
  const cases = [["utf-8", enc(text)], ["utf-16le", utf16le(text)]];
  for (const [label, bytes] of cases) {
    const whole = await unitsOf(S.jsonEntry, bytes, null);
    for (let w = 1; w <= 11; w++) {
      const pieces = await unitsOf(S.jsonEntry, bytes, { bytes: w });
      assert.deepEqual(strip(pieces.units), strip(whole.units), `${label}, windows of ${w} bytes`);
    }
  }
  const xml = '<r a="x &amp; y"><t>Ébène 😀 &lt;b&gt;<![CDATA[ <raw> ]]></t><!-- a -- comment --></r>';
  const whole = await unitsOf(S.xmlEntry, xml, null);
  for (let w = 1; w <= 9; w++) assert.deepEqual(strip((await unitsOf(S.xmlEntry, xml, { bytes: w })).units), strip(whole.units), `xml, windows of ${w}`);
  const ics = "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Réunion 😀 du\r\n  conseil\r\nDTSTART:20261101\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
  const wi = await unitsOf(S.icsEntry, ics, null);
  assert.equal(wi.units[0].summary, "Réunion 😀 du conseil");
  for (let w = 1; w <= 9; w++) assert.deepEqual(strip((await unitsOf(S.icsEntry, ics, { bytes: w })).units), strip(wi.units), `ics, windows of ${w}`);
});

test("R8 a cursor from another file is refused, not followed", async () => {
  const a = enc(JSON.stringify(Array.from({ length: 100 }, (_, i) => i)));
  const first = await S.jsonEntry.read({ size: a.length, readRange: async (o, l) => a.subarray(o, o + l) }, null, { bytes: 16 });
  const b = enc("[1, 2, 3]");
  const r = await S.jsonEntry.read({ size: b.length, readRange: async (o, l) => b.subarray(o, o + l) }, first.next, { bytes: 16 });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "CURSOR_MISMATCH");
  const x = await S.xmlEntry.read({ size: a.length, readRange: async (o, l) => a.subarray(o, o + l) }, first.next, { bytes: 16 });
  assert.equal(x.reason, "CURSOR_MISMATCH", "a cursor of one format is not another's");
});
