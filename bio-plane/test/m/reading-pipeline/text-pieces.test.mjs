/* reading-pipeline R40 (fix round 6, G13; K4571): a large text is read whole, in pieces by a cursor. A plain text with no
   blank line makes each LINE a unit, and a 12 MB log is 120,000 of them, far more than one answer or the index's bound
   (extraction R22) holds. `read(document, {pieces: {cursor, maxUnits}, unitsBudget})` answers the next piece of units
   within the bound, a cursor to the one after it, and `more`; a cursor that no longer matches the bytes is refused. The
   first piece is the reading as it was, with its units; a later one is its units alone. Each test names the requirement
   ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, CAPTURE_TEXT_UNIT_CAP } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, sha } from "./fixture.mjs";

const BUDGET = 2 * 1024 * 1024, MAX_UNITS = 4096;

/* 120,000 lines of exactly 100 bytes with their break, then ENDMARKER: 12,000,060 bytes, no blank line anywhere. */
const LINES = 120000;
function longLog() {
  const out = new Array(LINES + 1);
  for (let i = 0; i < LINES; i++) out[i] = `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".");
  out[LINES] = "ENDMARKER" + " ".repeat(51);
  return out.join("\n");
}
const lineOf = (i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".");

const readOf = (b, document, opts = {}) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...opts });
const pieceOpts = (cursor = null, extra = {}) => ({ unitsBudget: BUDGET, pieces: { cursor, maxUnits: MAX_UNITS, ...extra } });

/* Every piece until `more` is false, each handed the cursor the one before answered. */
async function allPieces(b, document, extra = {}) {
  const pieces = [];
  let cursor = null;
  for (let guard = 0; guard < 500; guard++) {
    const out = await readOf(b, document, pieceOpts(cursor, extra));
    pieces.push(out);
    if (!out.piece || out.piece.more === false) break;
    cursor = out.piece.cursor;
  }
  return pieces;
}

test("R40 R15 R33: the 12,000,060 B text read in pieces is the whole read once: every line appears exactly once, in order, with the extents and seq the whole read gives, and the last piece has more false", async () => {
  const text = longLog();
  assert.equal(Buffer.byteLength(text), 12000060);
  const b = bucket();
  const d = await hold(b, text);
  const document = doc({ digest: d, bytes: 12000060, ct: "text/plain", format: "undetermined", fromText: true });
  const whole = await readOf(b, document, { unitsBudget: Infinity });
  assert.equal(whole.text_units.length, LINES + 1, "the reference: every line is a unit");
  assert.equal(whole.text_units_over_bound, undefined);

  const pieces = await allPieces(b, document);
  assert.ok(pieces.length > 20 && pieces.length < 60, `${pieces.length} pieces`);
  const units = pieces.flatMap((p) => p.text_units);
  assert.equal(units.length, LINES + 1);
  assert.deepEqual(units.map((u) => [u.extent.para, u.seq]), whole.text_units.map((u) => [u.extent.para, u.seq]));
  assert.equal(sha(JSON.stringify(units)), sha(JSON.stringify(whole.text_units)), "the pieces are the whole's units, byte for byte");
  assert.equal(units[0].text, lineOf(0));
  assert.equal(units[LINES - 1].text, lineOf(LINES - 1));
  assert.equal(units[LINES].text, "ENDMARKER", "the last line is in the text");
  assert.equal(new Set(units.map((u) => u.seq)).size, LINES + 1, "no line twice");

  pieces.forEach((p, i) => {
    const last = i === pieces.length - 1;
    assert.equal(p.piece.more, !last, `piece ${i}`);
    assert.equal(p.piece.cursor === null, last, `piece ${i}`);
    assert.ok(p.text_units.length >= 1 && p.text_units.length <= MAX_UNITS, `piece ${i} within the unit bound`);
    assert.equal(p.text_units_over_bound, undefined, "a piece names no skipped run: nothing is left out");
    assert.equal(p.text_units_skipped, undefined);
    assert.equal(p.piece.units, p.text_units.length);
    assert.equal(p.reading !== undefined, i === 0, "the first piece is the reading, a later one its units alone");
  });
  const through = pieces.map((p) => p.piece.chars_through);
  assert.deepEqual([...through].sort((x, y) => x - y), through, "progress only grows");
  assert.equal(through[through.length - 1], pieces[0].piece.chars_total, "the last piece has read through the end");
  assert.equal(pieces[0].piece.chars_total, text.length);

  /* R35: the first piece's reading counts the words of the whole text, and the pieces' own words add up to them */
  assert.equal(pieces[0].reading.words_total, whole.reading.words_total);
  assert.equal(pieces[0].piece.units_total, LINES + 1);
  assert.equal(pieces.reduce((n, p) => n + p.piece.words, 0), whole.reading.words_total);
  /* R14/R17: the reading is over the whole text, whatever its first piece holds */
  assert.equal(pieces[0].reading.provenance.text_sha256, whole.reading.provenance.text_sha256);
  assert.equal(pieces[0].reading.text_chars, whole.reading.text_chars);
});

test("R40: the same text held only in parts (an upload, profiled from no byte) is read in the same pieces", async () => {
  const text = longLog();
  const bytes = Buffer.from(text);
  const b = bucket();
  const cut = [0, 8 * 1024 * 1024, bytes.length];
  const parts = [];
  for (let i = 0; i < 2; i++) {
    const part = bytes.subarray(cut[i], cut[i + 1]);
    parts.push({ sha256: await hold(b, part), bytes: part.length });
  }
  const document = { ...doc({ digest: sha(bytes), bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: false, parts }),
                     profile: { profiled_from_text: false, format: { format: "undetermined", confidence: "none", signals: [] },
                                source_content_type: "text/plain" } };
  const pieces = await allPieces(b, document);
  const units = pieces.flatMap((p) => p.text_units);
  assert.equal(units.length, LINES + 1);
  assert.equal(units[LINES].text, "ENDMARKER");
  assert.equal(pieces[pieces.length - 1].piece.more, false);
});

test("R40: a cursor that no longer matches the bytes is refused, with no reading and no units: another capture's cursor, a cursor over a text of another length, an offset that is no unit's start, and one that is no cursor", async () => {
  const b = bucket();
  const text = longLog();
  const d = await hold(b, text);
  const document = doc({ digest: d, bytes: text.length, ct: "text/plain", format: "undetermined", fromText: true });
  const first = await readOf(b, document, pieceOpts());
  const cur = first.piece.cursor;
  assert.equal(cur.sha256, d);

  const other = await hold(b, text.slice(0, 100000) + " changed");
  const otherDoc = doc({ digest: other, bytes: 100008, ct: "text/plain", format: "undetermined", fromText: true });
  for (const [name, document2, cursor] of [
    ["another capture", otherDoc, cur],
    ["another length", document, { ...cur, chars: cur.chars + 1 }],
    ["not a unit's start", document, { ...cur, offset: cur.offset + 3 }],
    ["past the end", document, { ...cur, offset: text.length + 5 }],
    ["a negative offset", document, { ...cur, offset: -1 }],
    ["no cursor", document, { offset: 5 }],
    ["a string", document, "12"]]) {
    const out = await readOf(b, document2, pieceOpts(cursor));
    assert.equal(out.refused && out.refused.code, "CURSOR_MISMATCH", name);
    assert.equal(typeof out.refused.why, "string", name);
    assert.equal(out.reading, undefined, name);
    assert.equal(out.text_units, undefined, name);
  }
  /* the right cursor still reads */
  const next = await readOf(b, document, pieceOpts(cur));
  assert.equal(next.text_units[0].text, lineOf(first.text_units.length));
  assert.equal(next.text_units[0].extent.para, first.text_units.length);
});

test("R40: a cursor handed for a capture that is not read as text is refused; with none, such a capture is read whole as before and carries no piece", async () => {
  const b = bucket();
  const bytes = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(200, 7)]);
  const d = await hold(b, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf", fromText: false });
  const none = await readOf(b, document, pieceOpts());
  assert.ok(none.reading, "read whole, as before");
  assert.equal(none.piece, undefined);
  const withCursor = await readOf(b, document, pieceOpts({ sha256: d, chars: 10, offset: 0, para: 0 }));
  assert.equal(withCursor.refused && withCursor.refused.code, "NOT_PIECEWISE");
  assert.equal(withCursor.reading, undefined);
});

test("R40 (control): a text that fits one piece answers it with more false and no cursor, the units the read without pieces gives, and the grain unchanged: paragraphs by blank line, a one-line text one unit, HTML by its visible text", async () => {
  const b = bucket();
  const cases = [
    ["lines", "title\nfirst sentence.\nsecond sentence.\nthird one", "text/plain", "undetermined"],
    ["paragraphs", "First line\nstill the first\n\n   \t\nSecond\r\n\r\nThird  \n", "text/plain", "undetermined"],
    ["one line", "only", "text/plain", "undetermined"],
    ["html", "<html><body><h1>Budget</h1><p>First paragraph\nwraps.</p><nav>skip me</nav><p>Second</p></body></html>", "text/html", "html"]];
  for (const [name, body, ct, format] of cases) {
    const d = await hold(b, body);
    const document = doc({ digest: d, bytes: Buffer.byteLength(body), ct, format, fromText: true });
    const plain = await readOf(b, document, { unitsBudget: BUDGET });
    const piecewise = await readOf(b, document, pieceOpts());
    assert.deepEqual(piecewise.text_units, plain.text_units, name);
    assert.equal(piecewise.piece.more, false, name);
    assert.equal(piecewise.piece.cursor, null, name);
    assert.equal(piecewise.piece.units_total, plain.text_units.length, name);
    assert.deepEqual({ ...piecewise.reading, words_read: undefined }, { ...plain.reading, words_read: undefined }, name);
    assert.equal(piecewise.reading.words_read, plain.reading.words_read, name);
    assert.equal(plain.piece, undefined, `${name}: without pieces, no piece`);
  }
});

test("R40 (control): paragraphs and HTML read in pieces are the whole read once, and a unit larger than the piece's budget is still a piece of its own, cut at the unit cap as R15 states", async () => {
  const b = bucket();
  const paras = Array.from({ length: 5000 }, (_, i) => `Paragraph ${i} wraps\nover two lines of the minutes.`).join("\n\n");
  const dp = await hold(b, paras);
  const docP = doc({ digest: dp, bytes: Buffer.byteLength(paras), ct: "text/plain", format: "undetermined", fromText: true });
  const wholeP = await readOf(b, docP, { unitsBudget: Infinity });
  const piecesP = await allPieces(b, docP, { maxUnits: 700 });
  assert.ok(piecesP.length >= 8);
  assert.deepEqual(piecesP.flatMap((p) => p.text_units), wholeP.text_units);

  const page = "<html><body><main>" + Array.from({ length: 3000 }, (_, i) => `<p>Passage ${i} of the notice.</p>`).join("") + "</main><footer>Contact</footer></body></html>";
  const dh = await hold(b, page);
  const docH = doc({ digest: dh, bytes: Buffer.byteLength(page), ct: "text/html", format: "html", fromText: true });
  const wholeH = await readOf(b, docH, { unitsBudget: Infinity });
  const piecesH = await allPieces(b, docH, { maxUnits: 1000 });
  assert.equal(piecesH.length, 3);
  assert.deepEqual(piecesH.flatMap((p) => p.text_units), wholeH.text_units);

  const huge = "x".repeat(CAPTURE_TEXT_UNIT_CAP + 500);
  const body = [huge, "after one", "after two"].join("\n\n");
  const dg = await hold(b, body);
  const docG = doc({ digest: dg, bytes: body.length, ct: "text/plain", format: "undetermined", fromText: true });
  const tiny = [];
  let cursor = null;
  for (let i = 0; i < 6; i++) {
    const out = await readOf(b, docG, { unitsBudget: 100, pieces: { cursor, maxUnits: 10 } });
    tiny.push(out);
    if (!out.piece.more) break;
    cursor = out.piece.cursor;
  }
  assert.deepEqual(tiny.map((p) => p.text_units.length), [1, 1, 1], "a unit that does not fit a piece is a piece of its own");
  assert.equal(tiny[0].text_units[0].truncated, true);
  assert.equal(tiny[0].text_units[0].text.length, CAPTURE_TEXT_UNIT_CAP);
  assert.equal(tiny[2].piece.more, false);
});

test("R40 R15 (control): without pieces a text over the wire's bound is read as before: the units that fit, the rest named", async () => {
  const b = bucket();
  const text = Array.from({ length: 6000 }, (_, i) => lineOf(i)).join("\n");
  const d = await hold(b, text);
  const out = await readOf(b, doc({ digest: d, bytes: text.length, ct: "text/plain", format: "undetermined", fromText: true }));
  assert.ok(out.text_units.length < 6000);
  assert.equal(out.text_units_over_bound, 6000 - out.text_units.length);
  assert.ok(Array.isArray(out.text_units_skipped));
  assert.equal(out.piece, undefined);
});
