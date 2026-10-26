/* reading-pipeline R1 (fix round 10; READING-PIPELINE #40; K5200 (4); amends R1, R32; K4630, K4571, R54): "single part" is no condition of reading a textual capture
 * as text. A fetch stored in parts (the whole never stored under its own digest, the profile read from range reads of its head and tail, so an HTML page's
 * recorded format is `html` and a plain text's is `undetermined`) within the profile's text bound is read as text whole, its parts joined in order and decoded as an
 * upload is (R49), with R32's text units, field for field as the same bytes held as one object read. Every case enters at `read` through the evidence store.
 * Controls: a single-part capture is the reference every parts case is compared with; one over the bound is refused `TOO_LARGE {size, bound}` with the number of parts,
 * never "(multipart)". */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { bucket, evidenceStore, hold, doc, sha } from "./fixture.mjs";

const MiB = 1048576;
const enc = new TextEncoder();

/* a page with a title, landmarks of furniture, multi-byte characters (so a seam can fall inside one), a table and a list of links in its content (R32, R51) */
const PAGE = enc.encode(`<!doctype html><html><head><meta charset="utf-8"><title>Housing notice 2026-118</title></head><body>
<nav><a href="/a">Home</a> <a href="/b">Meetings</a></nav>
<main><article><h1>Notice 2026-118</h1>
<p>The housing committee adopted the annual budget resolution after public comment: café, déjà vu, naïve, œuvre, 東京.</p>
<p>A second paragraph of the notice, with a figure of 1,250 units &amp; a deadline of June 30.</p>
<table><tr><td>Unit</td><td>Rent</td></tr><tr><td>Studio</td><td>$1,100</td></tr></table>
<ul><li><a href="/p1">Resolution text</a></li><li><a href="/p2">Staff report</a></li></ul>
</article></main><footer>Contact the clerk</footer></body></html>`);
const TEXT = enc.encode(["Title line of the notice", "", "The committee met on Tuesday and adopted the resolution: café, déjà vu, 東京.", "",
  "A second paragraph follows, with a figure of 1,250 units.", "", "The last paragraph closes the notice."].join("\n"));
const JSON_BYTES = enc.encode(JSON.stringify({ notice: "2026-118", title: "Housing café", units: 1250, items: ["studio", "one bedroom", "東京"] }, null, 1));

/* a position inside a multi-byte character, so the join (not the parts) is what decodes */
const seamInsideCharacter = (bytes) => { let i = Math.floor(bytes.length / 3); while (i < bytes.length && (bytes[i] & 0xc0) !== 0x80) i++; return i < bytes.length ? i : Math.floor(bytes.length / 3); };

/* the same bytes as an upload (one object under the capture's digest) and as a fetch (three parts, no whole stored); the profile each records is the one acquisition
   gives: the capture's type declared, the format from range reads of the head (`html` found, a plain text `undetermined`) */
async function single(bytes, ct, format) {
  const b = bucket(), d = await hold(b, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct, format, fromText: true });
  document.profile.source_content_type = ct;
  return { b, document };
}
async function inParts(bytes, ct, format) {
  const b = bucket(), cut = [0, seamInsideCharacter(bytes), Math.floor(bytes.length * 2 / 3) + 1, bytes.length], parts = [];
  for (let i = 0; i < 3; i++) { const p = bytes.subarray(cut[i], cut[i + 1]); parts.push({ sha256: await hold(b, p), bytes: p.length }); }
  const document = doc({ digest: sha(bytes), bytes: bytes.length, ct, format, fromText: false, parts });
  document.profile.source_content_type = ct;
  return { b, document };
}
const readOf = ({ b, document }, extra = {}) => read(document, { evidence: evidenceStore(b), env: {}, unitsBudget: Infinity, ...extra });
const wordsOf = (out) => (out.text_units || []).map((u) => u.text).join("\n");

const SHAPES = [["an HTML page", PAGE, "text/html; charset=utf-8", "html"],
                ["a plain text", TEXT, "text/plain", "undetermined"],
                ["a JSON document", JSON_BYTES, "application/json", "undetermined"]];

for (const [what, bytes, ct, format] of SHAPES) {
  test(`R1 R32: ${what} fetched and held in three parts is read as text whole, as the same bytes held as one object are read: the same units, the same reading`, async () => {
    const one = await readOf(await single(bytes, ct, format));
    const parts = await readOf(await inParts(bytes, ct, format));
    assert.equal(one.reading.failure, undefined, one.reading.basis);
    assert.ok(one.text_units && one.text_units.length > 0, "the reference reads");
    assert.equal(parts.reading.failure, undefined, parts.reading.basis);
    assert.equal(parts.reading.read_from_text, one.reading.read_from_text);
    assert.ok(!/multipart/i.test(parts.reading.basis), parts.reading.basis);
    assert.ok(Array.isArray(parts.text_units) && parts.text_units.length > 0, "R32's text units");
    assert.deepEqual(parts.text_units, one.text_units, "the parts joined in order and decoded as an upload is");
    assert.deepEqual(parts.reading, one.reading, "field for field");
    assert.deepEqual(parts.counters, one.counters);
    assert.match(wordsOf(parts), /café/, "a character across a seam is whole");
  });
}

test("R1 R32: an HTML page held in parts states its title and its furniture as the page held whole does; a fetch's page without a nav keeps all its text", async () => {
  const parts = await readOf(await inParts(PAGE, "text/html", "html"));
  assert.equal(parts.reading.title, "Housing notice 2026-118");
  const words = wordsOf(parts);
  assert.match(words, /housing committee adopted the annual budget resolution/);
  assert.doesNotMatch(words, /Meetings|Contact the clerk/, "the nav and the footer are no passage");
  const bare = enc.encode("<!doctype html><html><body><p>First paragraph of a bare page.</p><p>Second paragraph, kept too.</p></body></html>");
  const out = await readOf(await inParts(bare, "text/html", "html"));
  assert.match(wordsOf(out), /First paragraph of a bare page\./);
  assert.match(wordsOf(out), /Second paragraph, kept too\./);
});

test("R1 R40: an HTML page and a plain text held in parts, read in pieces by a cursor, give the pieces of the same bytes held whole: every unit once, the same cursors' ends", async () => {
  for (const [bytes, ct, format] of [[PAGE, "text/html", "html"], [TEXT, "text/plain", "undetermined"]]) {
    const piecesOf = async (shape) => {
      const units = [], seen = [];
      let cursor = null;
      for (let n = 0; n < 50; n++) {
        const out = await read(shape.document, { evidence: evidenceStore(shape.b), env: {}, cursor, maxUnits: 2 });
        assert.equal(out.reading && out.reading.failure, undefined, out.reading && out.reading.basis);
        assert.equal(out.refused, undefined);
        units.push(...(out.text_units || []));
        seen.push(out.more);
        if (!out.more) { assert.equal(out.cursor, null); return { units, pieces: n + 1, seen }; }
        cursor = out.cursor;
      }
      assert.fail("the pieces never ended");
    };
    const one = await piecesOf(await single(bytes, ct, format));
    const parts = await piecesOf(await inParts(bytes, ct, format));
    assert.ok(one.pieces > 1, "the reference is read in more than one piece");
    assert.deepEqual(parts.units, one.units);
    assert.deepEqual(parts.seen, one.seen);
  }
});

test("R1 R49 R54: an HTML page held in parts whose own meta declares an encoding the rule cannot decode is stated ENCODING_UNSUPPORTED by that name, final, with no text, as the page held whole is", async () => {
  const sj = enc.encode(`<!doctype html><html><head><meta charset="shift_jis"><title>x</title></head><body><p>A paragraph of the page.</p></body></html>`);
  const one = await readOf(await single(sj, "text/html", "html"));
  const parts = await readOf(await inParts(sj, "text/html", "html"));
  assert.equal(one.reading.reason, "ENCODING_UNSUPPORTED");
  assert.equal(parts.reading.failure, "final");
  assert.equal(parts.reading.reason, "ENCODING_UNSUPPORTED");
  assert.equal(parts.reading.name, one.reading.name);
  assert.equal(parts.text_units, undefined);
});

test("R1 R54: a textual capture held in parts over the text bound is refused TOO_LARGE with its size and the bound, final, saying how many parts: an HTML page and a plain text alike, never `(multipart)`", async () => {
  const bound = boundOf("text", "bytes"), size = bound + 1;
  for (const [ct, format] of [["text/html", "html"], ["text/plain", "undetermined"]]) {
    const parts = Array.from({ length: 4 }, (_, i) => ({ sha256: String(i).repeat(64), bytes: i < 3 ? Math.floor(size / 4) : size - 3 * Math.floor(size / 4) }));
    const d = doc({ digest: "e".repeat(64), bytes: size, ct, format, fromText: false, parts });
    d.profile.source_content_type = ct;
    const out = await read(d, { evidence: evidenceStore(bucket()), env: {} });
    assert.equal(out.reading.failure, "final");
    assert.equal(out.reading.reason, "TOO_LARGE");
    assert.equal(out.reading.size, size);
    assert.equal(out.reading.bound, bound);
    assert.ok(out.reading.basis.includes(String(size)) && out.reading.basis.includes(String(bound)), out.reading.basis);
    assert.ok(out.reading.basis.includes("4 parts"), out.reading.basis);
    assert.ok(!/multipart/i.test(out.reading.basis), out.reading.basis);
    assert.equal(out.text_units, undefined);
  }
});

test("R1 (control): a single-part capture is read as it was: an HTML page and a plain text answer their units and no part is named", async () => {
  const html = await readOf(await single(PAGE, "text/html", "html"));
  assert.equal(html.reading.failure, undefined);
  assert.match(wordsOf(html), /housing committee adopted the annual budget resolution/);
  assert.equal(html.reading.title, "Housing notice 2026-118");
  const text = await readOf(await single(TEXT, "text/plain", "undetermined"));
  assert.equal(text.reading.failure, undefined);
  assert.equal(text.text_units.length, 4);
});

test("R1: a plain text of 21 MiB (between what other kinds are assembled to and the whole-read ceiling) fetched in parts is read whole as the text bound allows: its first and its last line are found", async () => {
  const line = "The housing committee adopted the annual budget resolution after public comment.\n\n";
  const n = Math.ceil((21 * MiB) / line.length);
  const text = enc.encode(`first-mark ${line.repeat(n)}last-mark`);
  assert.ok(text.length > 20 * MiB && text.length < 24 * MiB, "between the two limits");
  const b = bucket(), parts = [];
  for (let at = 0; at < text.length; at += 8 * MiB) { const p = text.subarray(at, Math.min(text.length, at + 8 * MiB)); parts.push({ sha256: await hold(b, p), bytes: p.length }); }
  const document = doc({ digest: sha(text), bytes: text.length, ct: "text/plain", format: "undetermined", fromText: false, parts });
  document.profile.source_content_type = "text/plain";
  const out = await read(document, { evidence: evidenceStore(b), env: {}, unitsBudget: Infinity });
  assert.equal(out.reading.failure, undefined, out.reading.basis);
  assert.ok(out.text_units && out.text_units.length > 100000, "its units");
  assert.match(out.text_units[0].text, /^first-mark The housing committee/);
  assert.match(out.text_units[out.text_units.length - 1].text, /last-mark$/);
});
