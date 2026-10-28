/* reading-pipeline R51 (fix round 10; READING-PIPELINE #40; K4630, K5211): an HTML page past a whole read (`TEXT_WINDOW_FROM`) and within the text bound, held whole or in parts, is read by the
 * one streaming pass in byte windows with a carry; its units equal the same page read whole. A page of 25 MiB and a half (just past the ceiling; the window of the job is scaled to 64 KiB, below the
 * page, and one window is larger than it) is made once; its reference is the page decoded and read whole by `textUnitsOfText`. Entered at `read` through the evidence store, in pieces by a cursor, as the
 * ledger reads a page that large. The pass itself, at every window size and every cut, is in r51-windows.test.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, textUnitsOfText, TEXT_WINDOW_FROM } from "../../../src/reading-pipeline/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { bucket, evidenceStore, hold, doc, sha } from "./fixture.mjs";

const MiB = 1048576;
const enc = new TextEncoder();

/* a page of a government notice's shape: a head, navigation, a main with many paragraphs, a table, a list of links, comments, scripts, entities and multi-byte characters (so a window's end
   falls inside one), and a footer */
function pageBytes(minBytes, { charset = "utf-8" } = {}) {
  const parts = [`<!doctype html><html><head><meta charset="${charset}"><title>Housing notices 2026</title><script>var a = "</div>";</script></head><body>`,
    `<nav><a href="/a">Home</a> <a href="/b">Meetings</a></nav><header>Site header</header><main><h1>Housing notices</h1>`];
  let size = parts.join("").length, n = 0;
  while (size < minBytes) {
    let block = `<div class="row"><p>Paragraph ${n} of the notice: the housing committee adopted resolution ${n} after public comment, café déjà vu naïve &amp; œuvre.</p></div>\n`;
    if (n % 1000 === 0) block += `<!-- comment ${n} with <b>tags</b> and > signs -->`;
    if (n % 5000 === 0) block += `<script>if (a < ${n}) { x = "<p>no</p>"; }</script><style>p { color: red }</style>`;
    if (n % 20000 === 0) block += `<table><tr><td><p>Unit ${n}</p></td><td>Rent</td></tr></table><ul><li><a href="/p${n}">Resolution ${n}</a></li><li><a href="/q${n}">Staff report ${n}</a></li></ul>`;
    parts.push(block); size += block.length; n++;
  }
  parts.push(`</main><footer>Contact the clerk</footer></body></html>`);
  return parts.join("");
}
const text = pageBytes(TEXT_WINDOW_FROM + 300 * 1024);
const bytes = enc.encode(text);

const asUpload = async () => {   /* one object under the capture's digest, however large the upload (R45) */
  const b = bucket(), d = await hold(b, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "text/html; charset=utf-8", format: "undetermined", fromText: false });
  document.profile.source_content_type = "text/html; charset=utf-8";
  return { b, document };
};
const asFetch = async () => {   /* the parts a fetch streams, 8 MiB each, the whole never stored; the format the range reads of its head record is `html` */
  const b = bucket(), parts = [];
  for (let at = 0; at < bytes.length; at += 8 * MiB) { const p = bytes.subarray(at, Math.min(bytes.length, at + 8 * MiB)); parts.push({ sha256: await hold(b, p), bytes: p.length }); }
  const document = doc({ digest: sha(bytes), bytes: bytes.length, ct: "text/html; charset=utf-8", format: "html", fromText: false, parts });
  document.profile.source_content_type = "text/html; charset=utf-8";
  return { b, document };
};
async function piecesOf({ b, document }, windowBytes, { stopAfter = Infinity } = {}) {
  const units = [], firsts = [];
  let cursor = null, reading = null;
  for (let n = 0; n < 5000 && n < stopAfter; n++) {
    const out = await read(document, { evidence: evidenceStore(b), env: {}, cursor, windowBytes });
    assert.equal(out.refused, undefined, JSON.stringify(out.refused));
    if (n === 0) { reading = out.reading; assert.equal(reading.failure, undefined, reading.basis); }
    units.push(...(out.text_units || []));
    firsts.push(out);
    if (!out.more) { assert.equal(out.cursor, null); return { units, reading, pieces: n + 1, outs: firsts }; }
    cursor = out.cursor;
  }
  return { units, reading, pieces: firsts.length, outs: firsts, stopped: true };
}
const shape = (units) => units.map((u) => `${u.extent.para}:${u.extent.run}:${u.seq}:${u.text}`);

const reference = (() => {
  let memo = null;
  return () => memo ??= textUnitsOfText(new TextDecoder().decode(bytes), { html: true, budget: Infinity });
})();

test("R51: an HTML page past a whole read, within the text bound, held as one object and read in pieces through byte windows of 64 KiB, has the units of the page read whole, each once", async () => {
  assert.ok(bytes.length > TEXT_WINDOW_FROM && bytes.length <= boundOf("text", "bytes"), "past the ceiling, within the bound");
  const ref = (await reference()).textUnits;
  const got = await piecesOf(await asUpload(), 64 * 1024);
  assert.ok(got.pieces > 5, "read in pieces");
  assert.equal(got.units.length, ref.length);
  assert.deepEqual(shape(got.units), shape(ref));
  assert.match(got.units.map((u) => u.text).join("\n"), /Resolution 40000/, "the table and the list in the content are kept");
  assert.doesNotMatch(got.units.map((u) => u.text).join("\n"), /Meetings|Site header|Contact the clerk/, "navigation, header and footer are furniture, outside the main");
  assert.equal(got.reading.title, "Housing notices 2026");
  assert.equal(got.reading.text_container, "html");
  assert.deepEqual(got.reading.provenance.text_scope.of, bytes.length, "the head is what the reader was handed (R50)");
  assert.equal(got.reading.container_extent.paragraphs, (await reference()).paragraphCount, "R63: the paragraphs the page numbers");
  assert.equal(got.outs[got.outs.length - 1].more, false);
});

test("R51: the same page held in parts as a fetch holds it, and read through one window larger than the page, has the same units: whole, in parts and in a single window agree", async () => {
  const ref = shape((await reference()).textUnits);
  const parts = await piecesOf(await asFetch(), 64 * 1024);
  assert.equal(parts.reading.failure, undefined, parts.reading.basis);
  assert.deepEqual(shape(parts.units), ref);
  const single = await piecesOf(await asUpload(), 64 * MiB);
  assert.deepEqual(shape(single.units), ref);
  assert.equal(parts.reading.words_total, single.reading.words_total);
  assert.ok(parts.reading.words_total > 1000000, "the document's words are stated");
});

test("R51: a read that is not in pieces answers a reading not yet done, transient, 'read in pieces', as a text past a whole read does; a later piece whose page the object no longer holds is made again from the windows", async () => {
  const w = await asUpload();
  const whole = await read(w.document, { evidence: evidenceStore(w.b), env: {} });
  assert.equal(whole.reading.failure, "transient");
  assert.equal(whole.text_units, undefined);
  const normal = await piecesOf(w, 64 * 1024, { stopAfter: 3 });
  /* another page's first piece takes the object's kept page; the next piece of this one is cut from a page made again */
  const other = { b: bucket(), document: null };
  const small = enc.encode("<html><body><p>another page, held and read first so the kept one is let go.</p></body></html>");
  other.document = doc({ digest: await hold(other.b, small), bytes: small.length, ct: "text/html", format: "html", fromText: true });
  const first = await read(w.document, { evidence: evidenceStore(w.b), env: {}, cursor: null, windowBytes: 64 * 1024 });
  const pagesAway = await read(other.document, { evidence: evidenceStore(other.b), env: {}, cursor: null });
  assert.equal(pagesAway.reading.failure, undefined);
  const next = await read(w.document, { evidence: evidenceStore(w.b), env: {}, cursor: first.cursor, windowBytes: 64 * 1024 });
  assert.equal(next.refused, undefined);
  assert.deepEqual(shape(next.text_units), shape(normal.outs[1].text_units));
  assert.equal(next.cursor, normal.outs[1].cursor);
});

test("R51 R54: an HTML page above the text bound is refused TOO_LARGE with its size and the bound (50 MB plus 1), final; a page past the whole-read ceiling and within the bound is read (the tests above)", async () => {
  const bound = boundOf("text", "bytes");
  const d = doc({ digest: "e".repeat(64), bytes: bound + 1, ct: "text/html", format: "html", fromText: false });
  d.profile.source_content_type = "text/html";
  const out = await read(d, { evidence: evidenceStore(bucket()), env: {} });
  assert.equal(out.reading.failure, "final");
  assert.equal(out.reading.reason, "TOO_LARGE");
  assert.equal(out.reading.size, bound + 1);
  assert.equal(out.reading.bound, bound);
});

test("R51 R49: a page past a whole read in a single-byte charset its own meta declares (windows-1252) is read through windows decoded by it: the units are those of the page decoded and read whole", async () => {
  const latin = pageBytes(TEXT_WINDOW_FROM + 100 * 1024, { charset: "windows-1252" })
    .replace(/[œ—]/g, "e");   /* every character is in windows-1252 */
  const b1252 = new Uint8Array(Buffer.from(latin, "latin1"));
  const b = bucket(), d = await hold(b, b1252);
  const document = doc({ digest: d, bytes: b1252.length, ct: "text/html", format: "undetermined", fromText: false });
  document.profile.source_content_type = "text/html";
  const refUnits = shape(textUnitsOfText(new TextDecoder("windows-1252").decode(b1252), { html: true, budget: Infinity }).textUnits);
  const got = await piecesOf({ b, document }, 100 * 1024);
  assert.equal(got.reading.encoding, "windows-1252");
  assert.deepEqual(shape(got.units), refUnits);
});
