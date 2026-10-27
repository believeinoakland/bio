/* structured-text-reader R2: each unit keeps its structure and is addressed by it: a JSON path, an XML element path,
 * a KML placemark's name, a calendar event's summary, start and attendees, a caption's start time. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "../../../src/structured-text-reader/index.mjs";
import { unitsOf } from "./fixtures.mjs";

test("R2 a value deep in a JSON file is found and cited by its path", async () => {
  const doc = { meeting: { items: [{ title: "a" }, { title: "b", votes: { "aye count": 5, motion: "adopt ordinance 1234" } }] } };
  for (const budget of [null, { bytes: 7 }]) {
    const r = await unitsOf(S.jsonEntry, JSON.stringify(doc, null, 2), budget);
    const hit = r.units.find((u) => u.text === "adopt ordinance 1234");
    assert.ok(hit);
    assert.equal(hit.path, "$.meeting.items[1].votes.motion");
    assert.equal(hit.cite, hit.path);
    assert.equal(hit.line, 11);
    assert.equal(r.units.find((u) => u.text === "5").path, "$.meeting.items[1].votes['aye count']");
  }
});

test("R2 an NDJSON value is cited by its record and path", async () => {
  const r = await unitsOf(S.ndjsonEntry, '{"a":1}\n{"a":2,"b":{"c":"needle"}}\n');
  assert.equal(r.units.find((u) => u.text === "needle").path, "$[1].b.c");
});

test("R2 an ICS event is found by its summary and cited by its date, with its attendees", async () => {
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", "UID:1", "SUMMARY:Planning commission", "DTSTART:20261104T180000Z", "END:VEVENT",
    "BEGIN:VEVENT", "UID:2", "SUMMARY:Budget hearing", "DTSTART;TZID=America/New_York:20261112T090000", "DTEND:20261112T110000",
    'ATTENDEE;CN="Ana Ruiz":mailto:ana@example.org', "ATTENDEE:mailto:clerk@example.org", "LOCATION:Room 3\\, floor 2",
    "BEGIN:VALARM", "TRIGGER:-PT15M", "SUMMARY:alarm text", "END:VALARM", "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
  const r = await unitsOf(S.icsEntry, ics, { bytes: 11 });
  const hit = r.units.find((u) => u.summary === "Budget hearing");
  assert.ok(hit);
  assert.equal(hit.kind, "event");
  assert.equal(hit.start, "2026-11-12T09:00:00");
  assert.equal(hit.start_tz, "America/New_York");
  assert.ok(hit.cite.startsWith("2026-11-12"), "cited by its date");
  assert.equal(hit.path, "VCALENDAR[1]/VEVENT[2]");
  assert.deepEqual(hit.attendees, [{ name: "Ana Ruiz", address: "ana@example.org" }, { name: null, address: "clerk@example.org" }]);
  assert.equal(hit.location, "Room 3, floor 2");
  assert.equal(r.units.length, 2, "an alarm is part of its event, not a unit");
});

test("R2 an XML text is cited by its element path; a KML placemark by its name; a caption by its start time", async () => {
  const x = await unitsOf(S.xmlEntry, "<agenda><item><t>one</t></item><item><t>two</t><t>three</t></item></agenda>", { bytes: 4 });
  assert.equal(x.units.find((u) => u.text === "three").path, "/agenda/item[2]/t[2]");
  const k = await unitsOf(S.kmlEntry, '<kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark><name>Lot 7</name><Point><coordinates>-1.5,2.5</coordinates></Point></Placemark></Document></kml>');
  const pm = k.units.find((u) => u.kind === "placemark");
  assert.equal(pm.name, "Lot 7");
  assert.equal(pm.cite, "Lot 7");
  const c = await unitsOf(S.srtEntry, "1\n00:01:02,500 --> 00:01:04,000\nThe motion carries.\n");
  assert.equal(c.units[0].start, "00:01:02.500");
  assert.equal(c.units[0].cite, "00:01:02.500");
  const v = await unitsOf(S.vttEntry, "WEBVTT\n\n00:02.000 --> 00:03.000\n<v Chair>Next item.\n");
  assert.equal(v.units[0].start, "00:00:02.000");
  assert.equal(v.units[0].voice, "Chair");
  assert.equal(v.units[0].text, "Next item.");
});

test("R2 a contact is a unit with its name, organisation and addresses", async () => {
  const r = await unitsOf(S.vcfEntry, "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Ana Ruiz\r\nORG:City Clerk;Records\r\nEMAIL:ana@example.org\r\nTEL:+1 555 0100\r\nEND:VCARD\r\n");
  assert.equal(r.units[0].kind, "contact");
  assert.equal(r.units[0].name, "Ana Ruiz");
  assert.equal(r.units[0].org, "City Clerk, Records");
  assert.deepEqual(r.units[0].emails, ["ana@example.org"]);
});
