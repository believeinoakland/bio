/* reading-pipeline R50 (fix round 9, job 40; G131i; K4834): a plain text, a JSON and an XML are read in byte windows with a carry, to the standard's 50 MB.
   Past a whole read (24 MiB) they are read from the first piece by range (the head gives the grain and the facts, each piece a window); a run with no
   separator in a window is read in chunks, the very chunks the whole run gives; 50 MB plus 1 is stated with the size and the bound; the bytes pulled over a
   whole read are at most twice the file's, counted (R-CLOCK). The carry cases run at a scaled window against the whole read. Each test names the ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, CAPTURE_TEXT_UNIT_CAP, WHOLE_READ_MAX } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";

const MiB = 1048576, TEXT_BOUND = 52428800;
const readOf = (b, document, opts = {}) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...opts });
async function allPieces(b, document, extra = {}) {
  const pieces = [];
  let cursor = null;
  for (let guard = 0; guard < 4000; guard++) {
    const out = await readOf(b, document, { unitsBudget: 512 * 1024, maxUnits: 4096, cursor, ...extra });
    pieces.push(out);
    if (out.more !== true) break;
    cursor = out.cursor;
  }
  return pieces;
}
const rangeLengths = (b) => b.calls.filter((c) => c[0] === "get" && c[2]).map((c) => c[2].length);

/* a text of lines of 100 bytes (a 6-digit number, filler), then the last token */
const line = (i) => `line ${String(i).padStart(7, "0")} ` + "council minutes ".repeat(5).padEnd(86, ".");
function lines(bytes, last) { const n = Math.floor(bytes / 100); const a = new Array(n + 1); for (let i = 0; i < n; i++) a[i] = line(i); a[n] = last; return { text: a.join("\n"), n }; }

for (const [kind, ct] of [["text", "text/plain"], ["json", "application/json"], ["xml", "application/xml"]]) {
  test(`R50 (G131i, ${kind}): a ${kind} of 30 MiB is read in windows from its first piece, never whole, each line once, the last token read, the bytes pulled at most twice the file`, async () => {
    const { text, n } = lines(30 * MiB, kind === "xml" ? "<end>LASTTOKEN-XML</end>" : kind === "json" ? '{"last":"LASTTOKEN-JSON"}' : "LASTTOKEN-TEXT");
    const size = Buffer.byteLength(text);
    assert.ok(size > WHOLE_READ_MAX && size < TEXT_BOUND);
    const b = bucket();
    const d = await hold(b, text);
    const document = doc({ digest: d, bytes: size, ct, format: "undetermined", fromText: true });
    const whole = await readOf(b, document, {});
    assert.equal(whole.reading.failure, "transient", "a read not in pieces says it is read in pieces and reads nothing");
    assert.match(whole.reading.basis, /in pieces/);
    b.served = 0; b.calls.length = 0;
    const pieces = await allPieces(b, document);
    assert.ok(pieces.length > 40, `${pieces.length} pieces`);
    const units = pieces.flatMap((p) => p.text_units || []);
    assert.equal(units.length, n + 1, "every line once");
    for (const i of [0, 1, 1000, n - 1]) assert.equal(units[i].text, line(i).trim());
    assert.match(units[n].text, /LASTTOKEN/);
    assert.deepEqual(units.slice(0, 5000).map((u) => [u.extent.para, u.seq]), Array.from({ length: 5000 }, (_, i) => [i, i]));
    assert.equal(units.at(-1).extent.para, n);
    const last = pieces.at(-1);
    assert.equal(last.more, false);
    assert.equal(last.cursor, null);
    assert.equal(last.reading.words_total, 13 * n + 1, "the last piece states the document's words (R35, R57)");
    assert.ok(b.served <= 2 * size, `${b.served} bytes pulled of ${size}`);
    assert.ok(Math.max(...rangeLengths(b)) <= 5 * MiB, `the largest range ${Math.max(...rangeLengths(b))}: the file is never loaded whole`);
    assert.equal(pieces[0].reading.provenance.text_scope.of, size, "the first reading says it digests the head");
    assert.equal(pieces[0].reading.words_total, null, "the document's words are stated by the last piece");
  });
}

test("R50 R54 (G131i): a text of 50 MB plus 1 is stated with the size and the bound (TOO_LARGE), final, nothing owed; 50 MB itself is read", async () => {
  const b = bucket();
  const d = await hold(b, "x");
  const over = await readOf(b, doc({ digest: d, bytes: TEXT_BOUND + 1, ct: "application/json", format: "undetermined", fromText: true }), { cursor: null });
  assert.equal(over.reading.reason, "TOO_LARGE");
  assert.equal(over.reading.failure, "final");
  assert.equal(over.reading.size, TEXT_BOUND + 1);
  assert.equal(over.reading.bound, TEXT_BOUND);
  assert.ok(over.reading.basis.includes(String(TEXT_BOUND + 1)) && over.reading.basis.includes(String(TEXT_BOUND)), over.reading.basis);
  assert.notEqual(over.more, true);
});

test("R50 R47 (G131i): a JSON of one 30 MiB line is read in the chunks the whole run gives: consecutive units of one element, run 0, 1, ..., none cut, the text joined equal to the file", async () => {
  const body = Array.from({ length: 1_500_000 }, (_, i) => `"k${i}":"v${i}"`).join(", ");
  const text = `{${body}, "last":"LASTTOKEN-JSON"}`;
  const size = Buffer.byteLength(text);
  assert.ok(size > WHOLE_READ_MAX, `${size}`);
  const b = bucket();
  const d = await hold(b, text);
  const document = doc({ digest: d, bytes: size, ct: "application/json", format: "undetermined", fromText: true });
  const pieces = await allPieces(b, document);
  const units = pieces.flatMap((p) => p.text_units || []);
  assert.ok(units.length > 200 && units.every((u) => u.extent.para === 0 && u.text.length <= CAPTURE_TEXT_UNIT_CAP && u.truncated === undefined));
  assert.deepEqual(units.map((u) => u.extent.run), units.map((_, i) => i));
  assert.deepEqual(units.map((u) => u.seq), units.map((_, i) => i));
  assert.equal(units.map((u) => u.text).join(""), text, "none of it lost, none repeated");
  assert.match(units.at(-1).text, /LASTTOKEN-JSON/);
  assert.ok(b.served <= 2 * size);
  assert.ok(Math.max(...rangeLengths(b)) <= 5 * MiB);
});

test("R50 R41 (G131i, carry): at a scaled window the pieces of a text equal the whole read, with a character, a line and a run split at the window's edge and one either side", async () => {
  const unit = "élan €5 😀 line of words that is long enough to cross a window edge several times over, with é and 😀 inside; ";
  const base = Array.from({ length: 3000 }, (_, i) => `row ${i} ${unit.repeat(1 + (i % 4))}`).join("\n") + "\nENDMARKER";
  for (const shift of [0, 1, 2, 3, 4, 5]) {
    const text = "x".repeat(shift) + base;
    const b = bucket();
    const d = await hold(b, text);
    const document = doc({ digest: d, bytes: Buffer.byteLength(text), ct: "text/plain", format: "undetermined", fromText: true });
    const whole = await readOf(b, document, { unitsBudget: Infinity, cursor: null, maxUnits: 1e6 });   /* one piece of everything: the reference, numbered as pieces number */
    const got = [];
    let cursor = null;
    for (let i = 0; i < 4000; i++) {
      const out = await readOf(b, document, { unitsBudget: 20000, maxUnits: 4096, cursor, windowBytes: 4099 });
      got.push(...(out.text_units || []));
      if (!out.more) break;
      cursor = out.cursor;
    }
    assert.deepEqual(got.map((u) => [u.extent.para, u.extent.run, u.seq, u.text]), whole.text_units.map((u) => [u.extent.para, u.extent.run, u.seq, u.text]), `shift ${shift}`);
  }
  /* one run of 400,000 characters (no separator) at a window of 4,099 bytes, and the same with the run in the middle of lines */
  const long = "alpha beta gamma delta ".repeat(18000) + "OMEGA";
  for (const text of [long, `first line\n${long}\nlast line`, `${long}\n\nsecond paragraph here`]) {
    const b = bucket();
    const d = await hold(b, text);
    const document = doc({ digest: d, bytes: Buffer.byteLength(text), ct: "text/plain", format: "undetermined", fromText: true });
    const whole = await readOf(b, document, { unitsBudget: Infinity, cursor: null, maxUnits: 1e6 });   /* one piece of everything: the reference, numbered as pieces number */
    const got = [];
    let cursor = null;
    for (let i = 0; i < 4000; i++) {
      const out = await readOf(b, document, { unitsBudget: 300000, maxUnits: 4096, cursor, windowBytes: 4099 });
      got.push(...(out.text_units || []));
      if (!out.more) break;
      cursor = out.cursor;
    }
    assert.deepEqual(got.map((u) => [u.extent.para, u.extent.run, u.seq, u.text]), whole.text_units.map((u) => [u.extent.para, u.extent.run, u.seq, u.text]));
  }
});

/* B44 (1), R49 R50 (K4834): every R49 encoding reaches the standard's 50 MB: the head's encoding is kept in the cursor and each window decoded by it */
const accented = (i) => `ligne ${String(i).padStart(7, "0")} café déjà vu naïve ${"council minutes ".repeat(4)}`;
for (const [name, enc, ct] of [["windows-1252", "windows-1252", "text/plain; charset=windows-1252"], ["UTF-16LE with a BOM", "utf-16le", "text/plain"], ["UTF-16BE with a BOM", "utf-16be", "text/plain"], ["UTF-16LE with a BOM, JSON", "utf-16le", "application/json"]]) {
  test(`R49 R50 (B44 (1), ${name}): a text of about 26 MiB is read in windows from its first piece, each line once, the last line read and searchable, bytes pulled at most twice the file`, async () => {
    const perLine = enc === "windows-1252" ? 100 : 200;
    const n = Math.ceil((26 * MiB) / perLine);
    const rows = Array.from({ length: n }, (_, i) => accented(i).padEnd(99, ".") + (enc === "windows-1252" ? "" : "😀"));
    rows.push("DERNIÈRE-LIGNE € fin");
    const str = rows.join("\n");
    let bytes;
    if (enc === "windows-1252") bytes = Buffer.from(str.replace(/€/g, "\x80"), "latin1");
    else {
      const le = enc === "utf-16le", u = Buffer.alloc(2 + str.length * 2);
      if (le) u.writeUInt16LE(0xfeff, 0); else u.writeUInt16BE(0xfeff, 0);
      for (let i = 0; i < str.length; i++) (le ? u.writeUInt16LE : u.writeUInt16BE).call(u, str.charCodeAt(i), 2 + i * 2);
      bytes = u;
    }
    assert.ok(bytes.length > WHOLE_READ_MAX && bytes.length < TEXT_BOUND, `${bytes.length}`);
    const b = bucket();
    const d = await hold(b, new Uint8Array(bytes));
    const document = doc({ digest: d, bytes: bytes.length, ct, format: "undetermined", fromText: true });
    const pieces = await allPieces(b, document);
    const units = pieces.flatMap((p) => p.text_units || []);
    assert.equal(units.length, n + 1, "every line once");
    for (const i of [0, 1, 12345, n - 1]) assert.equal(units[i].text, rows[i].trim(), `line ${i}`);
    assert.equal(units[n].text, "DERNIÈRE-LIGNE € fin");
    assert.equal(pieces.at(-1).more, false);
    assert.ok(b.served <= 2 * bytes.length, `${b.served} of ${bytes.length}`);
    assert.equal(pieces[0].reading.encoding, enc);
  });
}
