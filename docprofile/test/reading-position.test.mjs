/* docprofile — where a reference was read, and text from any producer (K619 converts;
 * re-pointed to stub types by T34-8): docprofile's shares of three old suites, as
 * requirement-named tests at the module's interface, `docprofile/registry.mjs`:
 *   - `bio-plane/test/reading-position.test.mjs` (FW-17): the segment map, the total
 *     locator, a reader's positions;
 *   - `bio-plane/test/reading-position-occurrences.test.mjs` (D-454): a reference read
 *     again is another occurrence;
 *   - `bio-plane/test/reading-wire.test.mjs` (FW-15): `readText`'s unit arms.
 * This module holds no content type (R36), so the reader is ./stubs.mjs's `stub_items`,
 * registered through the seam, reading Port Alder's file numbers through this module's
 * helpers. How each of `doctypes`' readers places its own references is `doctypes` R7.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as dp from "../registry.mjs";
import { PORT_ALDER, view } from "./fixtures.mjs";
import { registerStubs, stubItems, stubFallback } from "./stubs.mjs";

const { readText, flattenText, makeLocator, registerDoctype } = dp;
for (const r of registerStubs(registerDoctype)) assert.equal(r.ok, true);
const PA = view(PORT_ALDER);

/* Pages whose descriptions and file numbers fall on different pages. */
const PAGES = [
  { page: 0, text: "MEMO TO THE BOARD\nHarbor Commission\nTuesday, March 3, 2026" },
  { page: 1, text: "MEMO TO THE BOARD\nSubject:\nDock Fee Schedule\nFrom:\nHarbor Master\n3.1\nPA-910" },
  { page: 2, text: "MEMO TO THE BOARD\nPage 3\n2\nPA-844" },
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
  assert.deepEqual([locate(0).page, locate(f.text.indexOf("PA-910")).page, locate(f.text.indexOf("PA-844")).page], [0, 1, 2]);
  for (const x of [f.text.length + 10, -1, "3", NaN, undefined]) assert.equal(locate(x), null, String(x));
  for (const segs of [[], undefined]) { assert.equal(typeof makeLocator(segs), "function"); assert.equal(makeLocator(segs)(0), null); }
});

test("R20 R34 a reader places each reference on the part the container put it on, never the description's, and nothing without a locator", () => {
  const f = flattenText({ pages: PAGES });
  const r = readText({ pages: PAGES }, { view: PA });
  assert.equal(r.doctype.type, stubItems);
  assert.deepEqual(r.parsed.entities.map((e) => e.key), ["PA-910", "PA-844"]);
  assert.deepEqual(r.parsed.entities.map((e) => e.source.ref), ["p.2", "p.3"]);
  assert.deepEqual(r.parsed.entities.map((e) => e.source.rect), [null, null], "the page is the honest maximum");
  const bare = readText(f.text, { view: PA });
  assert.deepEqual(bare.parsed.entities.map((e) => e.key), ["PA-910", "PA-844"], "the same entities with no structure");
  assert.ok(bare.parsed.entities.every((e) => !("source" in e)), "and no position, no throw");
  // CRLF: the producer's own parts, so nothing drifts
  const crlf = readText({ pages: PAGES.map((p) => ({ ...p, text: p.text.replace(/\n/g, "\r\n") })) }, { view: PA });
  assert.deepEqual(crlf.parsed.entities.map((e) => e.source.page), [1, 2]);
  // a reader with nothing to place places nothing: the fallback reads no entity, located or not
  const g = readText({ pages: [{ page: 0, text: "anything" }] }, { view: PA });
  assert.equal(g.doctype.type, stubFallback);
  assert.deepEqual([g.position_parts, g.parsed.entities], [1, []]);
});

test("R34 a reference read again is another occurrence: one entity, every place in reading order, the first as its source", () => {
  const pages = [
    ...PAGES,
    { page: 3, text: "Continued from item 3.1\nPA-910" },
    { page: 4, text: "Page 5\nNothing here" },
    { page: 5, text: "Supplemental\nPA-910" },
  ];
  const r = readText({ pages }, { view: PA });
  assert.deepEqual(r.parsed.entities.map((e) => e.key), ["PA-910", "PA-844"], "one entity per file number");
  const [e910, e844] = r.parsed.entities;
  assert.equal(e910.source.ref, "p.2", "the source is the first sighting");
  assert.deepEqual(e910.occurrences.map((s) => s.ref), ["p.2", "p.4", "p.6"], "every sighting, in reading order");
  assert.ok(!("occurrences" in e844), "a reference read once has no occurrences");
  assert.equal(e844.source.ref, "p.3");
  // two on one part are two occurrences of that part
  const twice = readText({ pages: [{ page: 0, text: "ITEMS\nPA-101 and PA-101" }] }, { view: PA });
  assert.deepEqual(twice.parsed.entities[0].occurrences.map((s) => s.ref), ["p.1", "p.1"]);
  // with no structure every occurrence is the honest null
  const bare = readText(pages.map((p) => p.text).join("\n"), { view: PA });
  assert.deepEqual(bare.parsed.entities[0].occurrences, [null, null, null]);
});

test("R19 R23 a producer's paragraphs alone are a source of text, read by the same reader, each reference on its paragraph", () => {
  const lines = ["MEMO TO THE BOARD", "Harbor Commission", "Subject: Dock fees", "PA-921", "Subject: Moorings", "PA-922",
                 "MEMO TO THE BOARD", "Items held over", "PA-923", "MEMO TO THE BOARD"];
  const paras = lines.map((l, i) => ({ para: i, ref: `¶${i + 1}`, text: l }));
  const r = readText({ paragraphs: paras, undetermined: [], counts: { chars: 120, undetermined: 0 } }, { view: PA });
  assert.deepEqual([r.determined, r.text_from, r.doctype.type, r.position_parts], [true, "paragraphs", stubItems, lines.length]);
  assert.deepEqual(r.parsed.entities.map((e) => e.key), ["PA-921", "PA-922", "PA-923"]);
  assert.deepEqual(r.parsed.entities.map((e) => e.source.ref), ["¶4", "¶6", "¶9"], "each placed on its paragraph");
  const f = flattenText({ pages: [{ page: 0, text: "one" }, { page: 1, text: "two" }] });
  assert.deepEqual([f.source, f.text], ["pages", "one\ntwo"], "pages alone are a source of text too");
});

test("R18 text nobody decoded is a failed reading naming the producer's reason, and a fragment is refused stating the imbalance", () => {
  const enc = readText({ document: "", pages: [], counts: { chars: 0, undetermined: 1 },
                         undetermined: [{ page: null, reason: "encrypted", font: null, codes: null, count: 1 }] }, { view: PA });
  assert.equal(enc.determined, false);
  assert.match(enc.why, /encrypted/);
  const scrap = readText({ document: "scrap", undetermined: [{ page: 0, reason: "no_tounicode", count: 4000 }],
                           counts: { chars: 5, undetermined: 4000 } }, { view: PA });
  assert.equal(scrap.determined, false);
  assert.match(scrap.why, /could not decode most/);
});
