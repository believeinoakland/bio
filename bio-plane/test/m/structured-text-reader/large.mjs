/* R1's generated files, one for each kind, each exactly the text bound: the record that carries the last token is the
 * file's last. Shared by the two large-file test files, which run apart so each stays within one test file's time. */
import * as S from "../../../src/structured-text-reader/index.mjs";
import { generatedText, walk, TEXT_BYTES_MAX, CALENDAR_EVENTS_MAX } from "./fixtures.mjs";
import assert from "node:assert/strict";

const STEP = { bytes: 8 << 20 };
const geo = (sep) => `${sep}{"type":"Feature","properties":{"id":"@@@@@@@@@"},"geometry":{"type":"Point","coordinates":[1.5,2.5]}}`;

/* each kind: the generated file and how many units each record makes */
export const LARGE = {
  json: { entry: S.jsonEntry, per: 1, spec: { head: "[", first: ' {"id":"@@@@@@@@@"}', record: ',{"id":"@@@@@@@@@"}', tail: "]" } },
  ndjson: { entry: S.ndjsonEntry, per: 1, spec: { head: "", record: '{"id":"@@@@@@@@@"}\n', tail: "" } },
  /* four units a feature (its type, its property, its geometry's type, the feature) and the collection's own type */
  geojson: { entry: S.geojsonEntry, per: 4, extra: 1, spec: { head: '{"type":"FeatureCollection","features":[', first: geo(" "), record: geo(","), tail: "]}" } },
  xml: { entry: S.xmlEntry, per: 1, spec: { head: '<?xml version="1.0"?><root>', record: "<r>@@@@@@@@@</r>", tail: "</root>" } },
  svg: { entry: S.svgEntry, per: 1, spec: { head: '<svg xmlns="http://www.w3.org/2000/svg">', record: "<text>@@@@@@@@@</text>", tail: "</svg>" } },
  kml: { entry: S.kmlEntry, per: 1, spec: { head: "<kml><Document>", record: "<Placemark><name>@@@@@@@@@</name><Point><coordinates>1,2</coordinates></Point></Placemark>", tail: "</Document></kml>" } },
  /* an event of about 1.2 KB, so a calendar at the text bound stays within the events limit (R7) */
  ics: { entry: S.icsEntry, per: 1, spec: { head: "BEGIN:VCALENDAR\r\n", pad: "\n", tail: "END:VCALENDAR\r\n",
    record: `BEGIN:VEVENT\r\nSUMMARY:@@@@@@@@@\r\nDTSTART:20261101T090000Z\r\nDESCRIPTION:${"x".repeat(1200)}\r\nEND:VEVENT\r\n` } },
  vcf: { entry: S.vcfEntry, per: 1, spec: { head: "", pad: "\n", record: "BEGIN:VCARD\r\nFN:@@@@@@@@@\r\nEND:VCARD\r\n", tail: "" } },
  srt: { entry: S.srtEntry, per: 1, spec: { head: "", pad: "\n", record: "@@@@@@@@@\n00:00:01,000 --> 00:00:02,000\nw@@@@@@@@@\n\n", tail: "" } },
  vtt: { entry: S.vttEntry, per: 1, spec: { head: "WEBVTT\n\n", pad: "\n", record: "c@@@@@@@@@\n00:01.000 --> 00:02.000\nw@@@@@@@@@\n\n", tail: "" } },
};

/** Reads the kind's file at the text bound whole, a step at a time, and checks the last record's token is found. */
export async function readsWholeAtBound(kind) {
  const { entry, per, extra = 0, spec } = LARGE[kind];
  const source = generatedText({ ...spec, size: TEXT_BYTES_MAX });
  if (kind === "ics") assert.ok(source.count <= CALENDAR_EVENTS_MAX, "the generated calendar stays within the events limit");
  let found = null;
  const r = await walk(entry, source, STEP, { onUnit: (u) => { if (typeof u.text === "string" && u.text.includes(source.lastToken)) found = u; } });
  assert.equal(r.answer.ok, true, JSON.stringify(r.answer).slice(0, 300));
  assert.equal(r.answer.more, false);
  assert.equal(r.answer.final.whole, true, "read whole");
  assert.equal(r.answer.read_through, TEXT_BYTES_MAX);
  assert.equal(r.units, source.count * per + extra, "every record's units, each once");
  assert.ok(found, `the last record's token ${source.lastToken} is found`);
  assert.ok(r.steps >= Math.floor(TEXT_BYTES_MAX / STEP.bytes), "read in steps of the budget, never at once");
}
