/* reading-pipeline G48 (fix round 6; K4670, K4673, K4679), R11 (basis and `classified_over`) and R40/R41 (the first piece makes
 * its unit list once). A large sheet's first reading tick took 16 s against G37's 10 s bar: its whole text was classified
 * twice, and its units were made and counted twice. These tests go through `read` with a cursor (`pieces`), counting WORK DONE
 * (what a detector is handed, how often the sheet's text is read), never a compute time (R-CLOCK).
 *   (a) a sheet classified over a bounded view says so in the reading's `basis` on every determined branch and carries
 *       `classified_over`; `readingFromWire` is tested directly with a synthetic `wired`, so only the end-to-end tests wait
 *       for DOCPROFILE #7 (seam red by name until it merges: `CLASSIFY_WHOLE_MAX_CHARS`);
 *   (b) the first tick reads a sheet's text no more often than a later tick that cuts the same list;
 *   (c) controls: the answers recorded on the tip before the change (`fixtures/g48-answers.json`), first tick and every later
 *       piece, and each piece asked again by the cursor the OLD code made (R-OLD). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as rp from "../../../src/reading-pipeline/index.mjs";
import * as registry from "../../../../docprofile/registry.mjs";
import { registerDoctype, doctypeFor } from "../../../../docprofile/registry.mjs";
import { readText } from "../../../../docprofile/registry.mjs";
import { bucket, evidenceStore, hold, doc, withEntry } from "./fixture.mjs";
import { CASES, WHOLE_BOUND, csvText, readCase, readAsk, recordOf } from "./g48-cases.mjs";

const { readingFromWire, read, CAPTURE_TEXT_UNIT_CAP } = rp;
const RECORD = JSON.parse(readFileSync(new URL("./fixtures/g48-answers.json", import.meta.url), "utf8"));
const BOUND = registry.CLASSIFY_WHOLE_MAX_CHARS;   /* undefined until DOCPROFILE #7 merges */
const seamBound = () => assert.equal(typeof BOUND, "number", "seam: DOCPROFILE #7's CLASSIFY_WHOLE_MAX_CHARS (docprofile/registry.mjs) is not merged yet");

let seen = [];
registerDoctype({
  key: "g48-lengths", label: "lengths", version: 1,
  detect: (ctx) => { if (typeof ctx.text === "string" && ctx.text.length) seen.push(ctx.text.length); return { match: false, confidence: "none", signals: [] }; },
  parse: () => ({ entities: [] }),
});
const marked = (marker) => (ctx) => (typeof ctx.text === "string" && ctx.text.includes(marker)
  ? { match: true, confidence: "certain", signals: [marker] } : { match: false, confidence: "none", signals: [] });
registerDoctype({ key: "g48-finds", label: "finds", version: 1, detect: marked("SPYFINDS"),
  parse: () => ({ entities: [{ key: "e1", kind: "g48", label: "one", facts: {} }] }) });
registerDoctype({ key: "g48-none", label: "none", version: 1, detect: marked("SPYNONE"), parse: () => ({ entities: [] }) });
registerDoctype({ key: "g48-throws", label: "throws", version: 1, detect: marked("SPYTHROWS"),
  parse: () => { throw new Error("the spy parse fails"); } });

const csvDoc = async (b, text) => doc({ digest: await hold(b, text), bytes: text.length, ct: "text/csv", format: "csv", fromText: true });
const firstTick = async (b, document, extra = {}) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", unitsBudget: 512 * 1024, cursor: null, ...extra });

/* ---- (a) the statement reaches the member -------------------------------------------------------------------------- */

const SAMPLE = { chars: 1_400_000, of: 6_000_000, head_chars: 262_144, windows: [{ from: 1_000_000, to: 1_098_304 }, { from: 5_901_696, to: 6_000_000 }],
                 sheet_heads: [], heads_used: false };
const sentenceOf = (co) => {
  assert.equal(typeof rp.classifiedOverSentence, "function", "the module states a sampled classification with classifiedOverSentence(classified_over)");
  return rp.classifiedOverSentence(co);
};
const wiredOf = (kind) => ({
  determined: true, classified_over: SAMPLE, why: "docprofile's own sentence",
  doctype: { type: { key: "g48-type", version: 2 } },
  parsed: kind === "finds" ? { entities: [{ key: "e1", kind: "g48", label: "one", facts: {} }] } : { entities: [] },
  ...(kind === "throws" ? { parse_error: "the spy parse fails" } : {}),
});
const wireArgs = { docType: null, chain: [{ who: "x" }], wiredTier: 1, fmt: "csv", retrieved: "2026-10-23T00:00:00Z", tier2note: null, ocrNote: null };

test("R11 (G48): readingFromWire states a sampled classification in the basis on all three determined branches and carries classified_over", () => {
  for (const kind of ["finds", "none", "throws"]) {
    const reading = readingFromWire({ wired: wiredOf(kind), ...wireArgs });
    assert.deepEqual(reading.classified_over, SAMPLE, kind);
    assert.ok(reading.basis.includes(sentenceOf(SAMPLE)), `${kind}: ${reading.basis}`);
    assert.equal(reading.found, kind === "finds", kind);
  }
});

test("R11 (G48): the sentence is built from classified_over's figures, not docprofile's why", () => {
  const a = sentenceOf(SAMPLE);
  const b = sentenceOf({ ...SAMPLE, chars: 1_300_000, of: 7_000_000 });
  assert.notEqual(a, b, "the figures are in it");
  assert.ok(a.includes(String(SAMPLE.chars)) && a.includes(String(SAMPLE.of)), a);
  assert.ok(!a.includes("docprofile's own sentence"));
  assert.ok(!readingFromWire({ wired: wiredOf("none"), ...wireArgs }).basis.includes("docprofile's own sentence"));
  assert.ok(!readingFromWire({ wired: wiredOf("throws"), ...wireArgs }).basis.includes("docprofile's own sentence"));
});

test("R11 (G48) control: a wire without classified_over gives the reading it always gave: no field, no sentence", () => {
  for (const kind of ["finds", "none", "throws"]) {
    const { classified_over, ...whole } = wiredOf(kind);
    const reading = readingFromWire({ wired: whole, ...wireArgs });
    assert.equal(Object.hasOwn(reading, "classified_over"), false, kind);
    assert.ok(typeof rp.classifiedOverSentence !== "function" || !reading.basis.includes(rp.classifiedOverSentence(SAMPLE)), kind);
  }
  const failed = readingFromWire({ wired: { determined: false, why: "no text" }, docType: { type: { key: "generic" } }, chain: null, wiredTier: 1, fmt: "csv", retrieved: null, tier2note: null, ocrNote: null });
  assert.equal(Object.hasOwn(failed, "classified_over"), false);
});

for (const [branch, marker] of [["entities found", "SPYFINDS"], ["none found", "SPYNONE"], ["parse throws", "SPYTHROWS"]]) {
  test(`R11 (G48) seam: the first piece of a 6 MB CSV hands every detect at most CLASSIFY_WHOLE_MAX_CHARS characters, the reading carries classified_over and its basis states it (${branch})`, async () => {
    seamBound();
    const b = bucket();
    const text = csvText(6_000_000, { header: `id,${marker},amount,note` });
    const document = await csvDoc(b, text);
    seen = [];
    const out = await firstTick(b, document);
    assert.equal(out.reading.failure, undefined, out.reading.basis);
    assert.equal(out.reading.text_container, "csv");
    assert.ok(seen.length > 0 && seen.every((n) => n <= BOUND), `a detect was handed ${Math.max(...seen)} characters, the bound is ${BOUND}`);
    const co = out.reading.classified_over;
    assert.ok(co && typeof co === "object", "the reading carries classified_over");
    assert.equal(co.of, out.reading.text_chars);
    assert.ok(co.chars <= BOUND && co.chars < co.of);
    assert.ok(out.reading.basis.includes(sentenceOf(co)), out.reading.basis);
    assert.equal(out.reading.read_from_text, true);
    assert.equal(out.reading.found, marker === "SPYFINDS");
    assert.equal(out.more, true, "the text is read whole in pieces whatever it was classified over");
  });
}

test("R11 (G48) seam: a 3 MB CSV no type recognises gives the content type doctypeFor gives its whole text, and says it was sampled", async () => {
  seamBound();
  const b = bucket();
  const text = csvText(3_000_000);
  const document = await csvDoc(b, text);
  const out = await firstTick(b, document);
  const whole = doctypeFor({ text, headers: {}, locator: "https://a.example/x", content_type: "text/csv", at: "2026-09-27T00:00:00Z" });
  assert.equal(out.reading.content_type, whole.type.key, "no recognised type: the same verdict as the whole text gives");
  assert.ok(out.reading.classified_over, "a sheet over the bound is stated as sampled");
});

/* ---- (b) the sheet's text is read as often by the first tick as by a later one ---------------------------------------- */

const SHEET_LINES = Array.from({ length: 12_000 }, (_, i) => (i === 0 ? "Fund\tAmount\tNote" : `Fund ${i}\t${i * 100}\tnote about line ${i} the council`));
const SHEET_TEXT = SHEET_LINES.join("\n");
function countingEntry(counter) {
  const sheet = { name: "Budget", rows: null, cols: null, usedRows: SHEET_LINES.length, usedCols: 3,
                  range: { kind: "sheet-range", sheet: "Budget", range: `A1:C${SHEET_LINES.length}` }, cells: null, undetermined: [] };
  Object.defineProperty(sheet, "text", { enumerable: true, get() { counter.n++; return SHEET_TEXT; } });
  return { format: "g48cnt", text: async () => ({ ok: true, document: SHEET_TEXT, sheets: [sheet],
                                                  counts: { chars: SHEET_TEXT.length, undetermined: 0 }, undetermined: [], container: "xlsx" }) };
}

test("R40/R41 (G48): the first tick reads the sheet's text no more often than a later tick that cuts the same list (plus what the classification itself reads)", async () => {
  const b = bucket();
  const document = doc({ digest: await hold(b, "sheet bytes"), bytes: 11, ct: "application/x-g48cnt", format: "g48cnt" });
  const counter = { n: 0 };
  await withEntry(countingEntry(counter), async () => {
    const first = await firstTick(b, document, { maxUnits: 1 });
    assert.equal(first.more, true, "more than one block");
    const afterFirst = counter.n;
    counter.n = 0;
    const later = await firstTick(b, document, { maxUnits: 1, cursor: first.cursor });
    assert.equal(later.reading, undefined, "a later piece is units alone");
    const laterReads = counter.n;
    /* what the classification itself reads of the sheet (docprofile's view, once merged): measured on the same text */
    counter.n = 0;
    const probe = countingEntry(counter);
    readText(await probe.text(), { headers: {}, locator: "https://a.example/x", content_type: null, at: "2026-09-27T00:00:00Z", origin: "fetch" });
    const classifyReads = counter.n;
    assert.ok(laterReads > 0);
    assert.ok(afterFirst <= laterReads + classifyReads, `the first tick read the sheet ${afterFirst} times, a later tick ${laterReads} (and the classification ${classifyReads})`);
  });
});


test("R41 (G48): the first tick builds the blocks of its own piece and counts the rest: it reads the sheet's lineRows as a later tick that builds one block does", async () => {
  const b = bucket();
  const document = doc({ digest: await hold(b, "sheet bytes"), bytes: 11, ct: "application/x-g48rows", format: "g48rows" });
  const reads = { n: 0 };
  const rowOf = (i) => i + 1 + Math.floor(i / 50);
  const lineRows = new Proxy(SHEET_LINES.map((_, i) => rowOf(i)), { get(target, key, recv) { if (typeof key === "string" && /^\d+$/.test(key)) reads.n++; return Reflect.get(target, key, recv); } });
  const entry = { format: "g48rows", text: async () => ({ ok: true, document: SHEET_TEXT,
    sheets: [{ name: "Budget", rows: null, cols: null, usedRows: rowOf(SHEET_LINES.length - 1), usedCols: 3,
              range: { kind: "sheet-range", sheet: "Budget", range: `A1:C${rowOf(SHEET_LINES.length - 1)}` }, text: SHEET_TEXT, cells: null, undetermined: [], lineRows }],
    counts: { chars: SHEET_TEXT.length, undetermined: 0 }, undetermined: [], container: "xlsx" }) };
  await withEntry(entry, async () => {
    const first = await firstTick(b, document, { maxUnits: 1 });
    const firstReads = reads.n;
    assert.equal(first.piece.units, 1);
    assert.ok(first.piece.units_total >= 4, `${first.piece.units_total} blocks in all`);
    reads.n = 0;
    const second = await firstTick(b, document, { maxUnits: 1, cursor: first.cursor });
    assert.equal(second.piece.units, 1);
    /* fix round 9 (R41, R47; G128g): each block states its rows, one read of the sheet's lineRows a line of the block it builds */
    const own = (t) => t.text_units[0].lineRows.length;
    assert.equal(firstReads - own(first), reads.n - own(second), "the first tick built one block, as the later tick did; it did not build them all");
    assert.ok(firstReads - own(first) < SHEET_LINES.length + 2 * first.piece.units_total, "the rows of the blocks not asked for are not read");
  });
});

/* ---- (c) controls: byte-identical to the record made on the tip before the change ---------------------------------------- */

/* The sampled-classification statement is the one change a reading over the bound may show (DOCPROFILE #7's view): taken off
   before the comparison, and only a case over the bound may carry it. */
function withoutStatement(rec, c) {
  if (!rec.reading || !rec.reading.classified_over) return rec;
  assert.ok(BOUND !== undefined && c.chars >= BOUND, `${c.name} (${c.chars} characters) is not over the bound ${BOUND}, so it states no sample`);
  const { classified_over, basis, ...rest } = rec.reading;
  const sentence = sentenceOf(classified_over);
  return { ...rec, reading: { ...rest, basis: basis.replace(` — ${sentence}`, "") } };
}

/* A cursor is opaque (R40): the record keeps which pieces had one, not its text, which G68 changed for a CSV and a text (a window
   cursor in place of the offset's); what the cursor must still do is tested in `r7-window.test.mjs` and `text-pieces.test.mjs`. */
const opaque = (rec) => (rec && typeof rec.cursor === "string" ? { ...rec, cursor: "<a cursor>" } : rec);
/* R63 (final pass): a text reading states its paragraph count in `container_extent`, which the recorded answers (taken before it) lack;
   it is taken off by name after checking its shape, every other byte as recorded */
const withoutExtent = (rec) => {
  if (!rec || !rec.reading || !("container_extent" in rec.reading)) return rec;
  const { container_extent: e, ...reading } = rec.reading;
  if (!e || !Array.isArray(e.levels) || e.levels.join() !== "paragraphs") return rec;   /* a reading whose entry itemised its container keeps its recorded extent */
  assert.deepEqual([e.levels, e.sheets, e.slides, Number.isInteger(e.paragraphs) && e.paragraphs > 0], [["paragraphs"], null, null, true]);
  return { ...rec, reading };
};
for (const c of CASES) {
  test(`R40/R41 (G48) control: ${c.name} - the first tick, every later piece and the units are as recorded before the change`, async () => {
    const want = RECORD.cases[c.name];
    assert.ok(want, "recorded");
    const { asks } = await readCase(c);
    assert.equal(asks.length, want.pieces.length, "the same number of pieces");
    asks.forEach((a, k) => {
      assert.equal(a.ask === null, want.pieces[k].ask === null, `piece ${k}: asked by a cursor or not`);
      assert.deepEqual(opaque(withoutExtent(withoutStatement(a.record, c))), opaque(want.pieces[k].answer), `piece ${k}`);
    });
  });
  test(`R-OLD (G48) control: ${c.name} - each piece asked by the cursor the old code made answers as recorded`, async () => {
    const want = RECORD.cases[c.name];
    for (let k = 1; k < want.pieces.length; k++) {
      const out = await readAsk(c, want.pieces[k].ask);
      assert.deepEqual(opaque(withoutExtent(recordOf(out, false))), opaque(want.pieces[k].answer), `piece ${k}`);
    }
  });
}

test("R40 (G48) control: the recorded cases are the cases (a case over the bound is over the bound; the one under it is one character under)", () => {
  assert.equal(RECORD.whole_bound, WHOLE_BOUND);
  const under = RECORD.cases["csv-under-bound"].pieces[0].answer.reading.text_chars;
  assert.equal(under, WHOLE_BOUND - 1);
  assert.ok(RECORD.cases["csv-3m"].pieces[0].answer.reading.text_chars > WHOLE_BOUND);
  assert.ok(RECORD.cases["csv-100k"].pieces[0].answer.reading.text_chars < WHOLE_BOUND);
  if (BOUND !== undefined) assert.equal(BOUND, WHOLE_BOUND, "docprofile's bound moved: the recorded cases must be recorded again for the new bound");
  assert.ok(CAPTURE_TEXT_UNIT_CAP > 0);
});
