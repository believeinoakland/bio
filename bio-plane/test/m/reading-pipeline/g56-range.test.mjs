/* reading-pipeline R40 for a PDF, G56 (fix round 6; K4693, K4700): a page-range piece is sized by work as well as by pages. The range
   was 200 pages whatever the pages weighed, so the first tick of a 1,354-page volume took 11.0-11.7 s against the 10 s bar (PLANE #52's
   J37). Now a range is at most `PDF_RANGE_PAGES` (100) pages and, at the document's bytes a page, at most `PDF_RANGE_BYTES` of file
   (pdf-reader's `extractPdfRange` takes `maxBytes`; this module passes it on every tick), at least one page.
   The tests pin the WORK a piece does, the pages it carries (`piece.pages`) and the bytes they weigh, never a duration (R-CLOCK); the
   time is `g26.probe.mjs`'s, in the plane. Two documents (`g56-cases.mjs`): a light 450-page PDF (1,578 B a page, bound by pages) and
   the same pages with image streams bringing the file to 12 MB (26,704 B a page, 16.9 times the light's, bound by bytes).
   Red on the tip before the change: (a1), (a2), (a3-bound) and the byte part of (c); green on it, kept so the change is not credited with
   them: (b), (c) page part, the answers record, R-OLD, and the span never above PDF_RANGE_PAGES.
   (a3) and (c)'s byte part wait for the provider, PDF-READER #12's `maxBytes` (merge order: pdf-reader first); they stay red by name
   until it merges. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as pipeline from "../../../src/reading-pipeline/index.mjs";   /* by namespace: the base has no PDF_RANGE_BYTES, and a missing name must fail one test, not the file */
import { LIGHT, HEAVY, PAGES, worldOf, inPieces, readOf, summary } from "./g56-cases.mjs";
import { extractPdfRange } from "../../../src/pdfstructure.mjs";

const { PDF_RANGE_PAGES, PDF_RANGE_BYTES } = pipeline;
const recorded = JSON.parse(readFileSync(new URL("./fixtures/g56-answers.json", import.meta.url), "utf8"));
const spanOf = (p) => p.piece.pages[1] - p.piece.pages[0];
const widest = (pieces) => Math.max(...pieces.map(spanOf));
const worlds = {};
const world = async (name, synth) => (worlds[name] ??= await worldOf(synth));

test("R40 (G56 a1): a range is at most 100 pages and at most about 1.3 MB of file bytes: the constants", () => {
  assert.ok(PDF_RANGE_PAGES <= 100, `PDF_RANGE_PAGES is ${PDF_RANGE_PAGES}`);
  assert.ok(Number.isInteger(PDF_RANGE_BYTES) && PDF_RANGE_BYTES >= 1_200_000 && PDF_RANGE_BYTES <= 1_400_000, `PDF_RANGE_BYTES is ${PDF_RANGE_BYTES}`);
});

test("R40 (G56 a2): the light 450-page PDF read in pieces with the default range: at least ceil(450 / 100) pieces, the first range at most 100 pages, no range above PDF_RANGE_PAGES", async () => {
  const w = await world("light", LIGHT);
  assert.ok(w.bytes.length / PAGES < PDF_RANGE_BYTES / PDF_RANGE_PAGES, "the light synth is bound by pages, not by bytes");
  const pieces = await inPieces(w);
  assert.ok(pieces.length >= Math.ceil(PAGES / 100), `${pieces.length} pieces`);
  const [from, to] = pieces[0].reading.provenance.text_scope.pages;
  assert.equal(from, 0); assert.ok(to <= 100, `the first piece digests pages [0, ${to})`);
  assert.ok(widest(pieces) <= PDF_RANGE_PAGES, "control: no piece above PDF_RANGE_PAGES");
});

/* Fix round 9 (K4872): pdf-reader's `maxBytes` is judged against each page's own decoded size as the page is built (its R43 as amended,
   G124d), no longer the document's average bytes a page, so the heavy synth (its weight is image padding, not page content) is no
   longer cut by its file bytes. What the plane owes is that `maxBytes` is PDF_RANGE_BYTES on every tick: each piece is exactly the
   range pdf-reader answers for that ask. */
const providerRange = (bytes, from, count) => extractPdfRange(bytes, { from, count, maxBytes: PDF_RANGE_BYTES }).then((r) => r.count);
test("R40 (G56 a3, seam): every piece of the heavy and the light synth is the range pdf-reader answers for its ask with maxBytes PDF_RANGE_BYTES, at most PDF_RANGE_PAGES pages", async () => {
  for (const w of [await world("light", LIGHT), await world("heavy", HEAVY)]) {
    const ps = await inPieces(w);
    for (const p of ps) {
      const [from, to] = p.piece.pages;
      assert.ok(to - from <= PDF_RANGE_PAGES);
      assert.equal(to - from, await providerRange(w.bytes, from, Math.min(PDF_RANGE_PAGES, PAGES - from)), `the piece at ${from}`);
    }
  }
});

test("R40 (G56 c): a caller's rangePages replaces the default page cap; the byte bound only shrinks it, and an ask of 5 stays 5", async () => {
  const light = await world("light", LIGHT);
  const big = await readOf(light, { cursor: null, unitsBudget: Infinity, rangePages: 400 });
  const cut = await providerRange(light.bytes, 0, 400);
  assert.ok(cut > PDF_RANGE_PAGES, `${cut}: the ask of 400 replaces the default cap`);
  assert.equal(big.piece.pages[1] - big.piece.pages[0], cut, "the ask stands where the decoded bytes allow it, as pdf-reader cuts it (K4872)");
  const small = await readOf(light, { cursor: null, unitsBudget: Infinity, rangePages: 5 });
  assert.equal(small.piece.pages[1] - small.piece.pages[0], 5);
});

test("R40 (G56 c, seam): an ask of 400 on the heavy synth is cut to the byte figure pdf-reader judges, like the default", async () => {
  const heavy = await world("heavy", HEAVY);
  const out = await readOf(heavy, { cursor: null, unitsBudget: Infinity, rangePages: 400 });
  assert.equal(out.piece.pages[1] - out.piece.pages[0], await providerRange(heavy.bytes, 0, 400));
});

test("R40 (G56 b): a range whose units do not fit the units budget still moves the cursor to the first page not carried, no page lost or doubled", async () => {
  const light = await world("light", LIGHT);
  const pieces = await inPieces(light, { unitsBudget: 6 * 1024, rangePages: 20 });
  assert.deepEqual(pieces.flatMap((p) => p.text_units.map((u) => u.extent.page)), Array.from({ length: PAGES }, (_, i) => i));
});

for (const name of ["light", "heavy"]) {
  test(`R40 (G56 answers, ${name}): the units, total, page_count, words_total, the sum of words and the cursor's n equal the answers the tip gave with a 200-page range; the cursors between, piece.pages and the piece count are what changes`, async () => {
    const was = recorded.cases[name], w = await world(name, name === "light" ? LIGHT : HEAVY);
    const now = summary(await inPieces(w));
    for (const k of ["units", "units_sha256", "total", "page_count", "words_total", "words_read_sum", "cursor_n"])
      assert.deepEqual(now[k], was[k], k);
    assert.deepEqual(now.unit_digests, was.unit_digests);
    assert.equal(was.words_total, null);
    assert.equal(now.spans[0][0], 0); assert.equal(now.spans[now.spans.length - 1][1], PAGES);
    for (let i = 1; i < now.spans.length; i++) assert.equal(now.spans[i][0], now.spans[i - 1][1], "a piece starts where the one before ended");
    assert.ok(now.pieces >= was.pieces, "the ranges are not wider than the tip's");
  });
}

test("R40 (G56 R-OLD): a reading cut under the old range resumes: the first piece cut with rangePages 200, continued with the default to the end, holds the units of the all-default run", async () => {
  const w = await world("light", LIGHT);
  const first = await readOf(w, { cursor: null, unitsBudget: 512 * 1024, rangePages: 200 });
  assert.equal(first.more, true);
  assert.ok(first.piece.pages[1] - first.piece.pages[0] > 100, "the old piece was wider than the new default");
  const rest = [first];
  for (let cursor = first.cursor; cursor && rest.length < 1000;) {
    const out = await readOf(w, { cursor, unitsBudget: 512 * 1024 });
    rest.push(out);
    cursor = out.more === true ? out.cursor : null;
  }
  const all = await inPieces(w);
  assert.deepEqual(rest.flatMap((p) => p.text_units), all.flatMap((p) => p.text_units));
  assert.equal(rest[rest.length - 1].more, false);
});

test("R40 (G56 census, K4208): read's accepted keys are as before: a PDF read with only cursor, unitsBudget and maxUnits answers; rangePages is the one optional override", async () => {
  const w = await world("light", LIGHT);
  const out = await readOf(w, { cursor: null, unitsBudget: 512 * 1024, maxUnits: 4096 });
  assert.equal(out.refused, undefined); assert.equal(out.more, true);
  assert.deepEqual(Object.keys(out.piece).sort(), ["pages", "units", "words"]);
});
