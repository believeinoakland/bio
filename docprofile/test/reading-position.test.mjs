/* docprofile — where a reference was read, and text from any producer (K619 converts):
 * docprofile's shares of three old suites, converted to requirement-named tests at the
 * module's interface, `docprofile/registry.mjs`:
 *   - `bio-plane/test/reading-position.test.mjs` (FW-17), its sections 1-4: the segment
 *     map, the total locator, the agenda reader's positions, the readers that cannot place;
 *   - `bio-plane/test/reading-position-occurrences.test.mjs` (D-454), its section 0: a
 *     reference read again is another occurrence;
 *   - `bio-plane/test/reading-wire.test.mjs` (FW-15), its `readText` unit arms and the
 *     agenda facts its mini packet reads.
 * The rest of each (the store, the ops, the connections and the real PDF through the
 * plane's wire) is extraction's, connections' and text-chain's. The old suites' Oakland-shaped
 * file numbers are read under `HELD`, the held non-test profiles' view, passed explicitly;
 * the old suites passed no view (the K39 fallback). Section 4's reading of two readers'
 * source headers (P7) is carried as their behaviour instead. Which old assertion each test
 * carries is in the job record, `build/jobs/T19/docprofile.md`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as dp from "../registry.mjs";
import { HELD } from "./fixtures.mjs";

const { readText, flattenText, makeLocator, doctypes } = dp;
const typeOf = (key) => doctypes().find((t) => t.key === key);
const agenda = () => typeOf("meeting_agenda");

/* The old suites' own pages: an agenda whose descriptions and file numbers fall on different pages. */
const PAGES = [
  { page: 0, text: "Rules and Legislation Committee\nThursday, July 16, 2026" },
  { page: 1, text: "Subject:\nGrand Performance Mural\nFrom:\nCouncilmember Wang\n3.1\n26-0910" },
  { page: 2, text: "Page 3\n2\n26-0844" },
];
const JOINED = PAGES.map((p) => p.text).join("\n");

test("R22 R23 the segment map: one segment per non-empty part, earned over document only by a byte-for-byte join", () => {
  assert.ok(PAGES.length >= 3 && JOINED.length > 100, "the fixture is non-empty");
  const f = flattenText({ pages: PAGES });
  assert.deepEqual([f.source, f.segments.map((s) => s.source.page)], ["pages", [0, 1, 2]]);
  assert.deepEqual(f.segments.map((s) => f.text.slice(s.start, s.end)), PAGES.map((p) => p.text), "each span is its page's text");
  assert.deepEqual(f.segments[1].source, { kind: "pdf-page", ref: "p.2", page: 1, rect: null });
  const both = flattenText({ document: JOINED, pages: PAGES });
  assert.deepEqual([both.source, both.segments.length, both.position_why], ["document", 3, null]);
  const off = flattenText({ document: JOINED + "\nAN EXTRA LINE THE PAGES DO NOT CARRY", pages: PAGES });
  assert.equal(off.segments.length, 0);
  assert.match(off.position_why, /not its pages joined/);
  // a blank page adds no segment and no separator, and the page after it is still placed
  const blank = flattenText({ pages: [{ page: 0, text: "first" }, { page: 1, text: "" }, { page: 2, text: "third" }] });
  assert.equal(blank.text, "first\nthird");
  assert.deepEqual(blank.segments.map((s) => s.source.page), [0, 2]);
  assert.equal(makeLocator(blank.segments)(blank.text.indexOf("third")).page, 2);
  // paragraphs keep the producer's own human form
  const paras = flattenText({ paragraphs: [{ para: 0, ref: "¶1", text: "The agreement" },
                                           { para: 141, ref: "¶142", text: "Ordinance 13579 applies" }] });
  assert.deepEqual(paras.segments.map((s) => s.source), [{ kind: "doc-para", ref: "¶1", para: 0, run: null },
                                                         { kind: "doc-para", ref: "¶142", para: 141, run: null }]);
});

test("R25 the locator is total: inside a part it answers that part, and no offset makes it throw or guess", () => {
  const f = flattenText({ pages: PAGES });
  const locate = makeLocator(f.segments);
  assert.deepEqual([locate(0).page, locate(f.text.indexOf("26-0910")).page, locate(f.text.indexOf("26-0844")).page], [0, 1, 2]);
  for (const x of [f.text.length + 10, -1, "3", NaN, undefined]) assert.equal(locate(x), null, String(x));
  for (const segs of [[], undefined]) { assert.equal(typeof makeLocator(segs), "function"); assert.equal(makeLocator(segs)(0), null); }
});

test("R20 R34 the agenda places each reference on the part the container put it on, never the description's, and nothing without a locator", () => {
  const f = flattenText({ pages: PAGES });
  const placed = agenda().parse({ text: f.text, view: HELD, locate: makeLocator(f.segments) });
  assert.deepEqual(placed.entities.map((e) => e.key), ["26-0910", "26-0844"]);
  assert.deepEqual(placed.entities.map((e) => e.source.ref), ["p.2", "p.3"]);
  assert.deepEqual(placed.entities.map((e) => e.source.rect), [null, null], "the page is the honest maximum");
  const bare = agenda().parse({ text: f.text, view: HELD });
  assert.deepEqual(bare.entities.map((e) => e.key), ["26-0910", "26-0844"], "the same entities with no locator");
  assert.ok(bare.entities.every((e) => !("source" in e)), "and no position, no throw");
  // CRLF: offsets come from the separators the split matched, so nothing drifts
  const crlf = flattenText({ pages: PAGES.map((p) => ({ ...p, text: p.text.replace(/\n/g, "\r\n") })) });
  const pc = agenda().parse({ text: crlf.text, view: HELD, locate: makeLocator(crlf.segments) });
  assert.deepEqual(pc.entities.map((e) => e.source.page), [1, 2]);
});

test("R34 the readers that cannot place a reference place none: the calendar emits no source even when handed a locator, the generic type no entity", () => {
  const html = '<html><body><main><input id="ctl00_lstYears_Input" value="This Month" /><table>'
    + '<tr><td><a href="MeetingDetail.aspx?ID=7">Harbor Commission</a></td><td>3/3/2026</td></tr></table></main></body></html>';
  let asked = 0;
  const locate = () => { asked++; return { kind: "pdf-page", ref: "p.1", page: 0, rect: null }; };
  const cal = typeOf("meeting_calendar").parse({ text: html, locate });
  assert.ok(cal.entities.length >= 1, "the calendar read its meeting");
  assert.ok(cal.entities.every((e) => !("source" in e)), "and placed none of them");
  assert.equal(asked, 0, "it never asks the locator, whose offsets are not its own");
  assert.deepEqual(typeOf("generic").parse({ text: "anything", locate }).entities, [], "the generic type reads no references");
});

test("R20 R34 a reference read again is another occurrence: one entity, every place in reading order, the first as its source", () => {
  const pages = [
    ...PAGES,
    { page: 3, text: "Continued from item 3.1\n26-0910" },
    { page: 4, text: "Page 5\nNothing here" },
    { page: 5, text: "Supplemental\n26-0910" },
  ];
  const f = flattenText({ pages });
  assert.ok(f.segments.length >= 6, "the fixture is non-empty");
  const ag = agenda().parse({ text: f.text, view: HELD, locate: makeLocator(f.segments) });
  assert.deepEqual(ag.entities.map((e) => e.key), ["26-0910", "26-0844"], "one entity per file number");
  const e910 = ag.entities[0], e844 = ag.entities[1];
  assert.equal(e910.source.ref, "p.2", "the source is the first sighting");
  assert.deepEqual(e910.occurrences.map((s) => s.ref), ["p.2", "p.4", "p.6"], "every sighting, in reading order");
  assert.ok(!("occurrences" in e844), "a reference read once has no occurrences");
  assert.equal(e844.source.ref, "p.3");
  // the readers that take references inline keep occurrences the same way
  const reg = flattenText({ pages: [{ page: 0, text: "ORDINANCE NO. 13600 C.M.S.\nAN ORDINANCE AMENDING Ordinance No. 13579" },
                                    { page: 1, text: "WHEREAS, Ordinance No. 13579 set the rate; now, therefore\nBE IT ORDAINED" }] });
  const rg = typeOf("regulation").parse({ text: reg.text, view: HELD, locate: makeLocator(reg.segments) });
  const r579 = rg.entities.filter((e) => e.key === "ordinance:13579");
  assert.equal(r579.length, 1);
  assert.deepEqual(r579[0].occurrences.map((s) => s.ref), ["p.1", "p.2"]);
  // with no locator every occurrence is the honest null
  const bare = agenda().parse({ text: f.text, view: HELD });
  assert.deepEqual(bare.entities[0].occurrences, [null, null, null]);
});

/* The old wire suite's mini agenda, in the measured Legistar shape. */
const agendaLines = (n1, n2, n3) => [
  "Thursday, July 16, 2026", "City of Oakland", "Office of the City Clerk", "*Rules & Legislation Committee",
  " Agenda - SUPPLEMENTAL", "Roll Call /  Call To Order",
  "Subject: ", "Grand Performance Mural", "From: ", "Councilmember Wang", "Recommendation: Adopt A Resolution On Consent", "3.1", n1,
  "Subject: ", "Coliseum Payment Allocation", "From: ", "Finance Department", "Recommendation: Receive An Informational Report", "3.2", n2,
  "Determination Of Schedule Of Outstanding Committee Items", "2", n3, "Open Forum", "Adjournment",
];

test("R19 R23 a producer's paragraphs alone are a source of text, read by the same reader, with the agenda's item facts", () => {
  const paras = agendaLines("26-9921", "26-9922", "26-9923").map((l, i) => ({ para: i, ref: `¶${i + 1}`, text: l }));
  const r = readText({ paragraphs: paras, undetermined: [], counts: { chars: 400, undetermined: 0 } }, { view: HELD });
  assert.equal(r.determined, true);
  assert.equal(r.text_from, "paragraphs");
  assert.equal(r.doctype.type.key, "meeting_agenda");
  assert.deepEqual(r.parsed.entities.map((e) => e.key), ["26-9921", "26-9922", "26-9923"]);
  const byKey = Object.fromEntries(r.parsed.entities.map((e) => [e.key, e]));
  assert.equal(byKey["26-9921"].facts.subject, "Grand Performance Mural", "the labelled item's subject");
  assert.equal(byKey["26-9921"].facts.from, "Councilmember Wang");
  assert.equal(byKey["26-9923"].label, "Determination Of Schedule Of Outstanding Committee Items",
    "a section item with no Subject block takes its heading, never an invented subject");
  assert.equal(byKey["26-9923"].facts.subject, null);
  assert.deepEqual(r.parsed.entities.map((e) => e.source.ref), ["¶13", "¶20", "¶23"], "each placed on its paragraph");
  const f = flattenText({ pages: [{ page: 0, text: "one" }, { page: 1, text: "two" }] });
  assert.deepEqual([f.source, f.text], ["pages", "one\ntwo"], "pages alone are a source of text too");
});

test("R18 text nobody decoded is a failed reading naming the producer's reason, and a fragment is refused stating the imbalance", () => {
  const enc = readText({ document: "", pages: [], counts: { chars: 0, undetermined: 1 },
                         undetermined: [{ page: null, reason: "encrypted", font: null, codes: null, count: 1 }] }, { view: HELD });
  assert.equal(enc.determined, false);
  assert.match(enc.why, /encrypted/);
  const scrap = readText({ document: "scrap", undetermined: [{ page: 0, reason: "no_tounicode", count: 4000 }],
                           counts: { chars: 5, undetermined: 4000 } }, { view: HELD });
  assert.equal(scrap.determined, false);
  assert.match(scrap.why, /could not decode most/);
});
