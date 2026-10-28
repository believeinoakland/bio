/* reading-pipeline R49 (fix round 10; K5195; verify-marks.md): every text is decoded by one rule, `ooxml.decodeText`, and the reading says what the
 * decode did. One test per clause, each at the input's real shape (a held object read as the door reads it: `read(document, {evidence})` over a
 * document in the shape capture's acquire answer carries): the windows whose detection differs from the file's (`encoding_disagree`), an encoding
 * it cannot decode (`ENCODING_UNSUPPORTED {name}`), UTF-16 without a BOM, ISO-8859-x, a decode's failures that are no glyphs (text-chain R73), and the
 * encoding matrix at 100 KB, 3 MiB and 9 MiB as an upload (one object under the capture's digest) and a fetch (the parts a fetch streams, the whole
 * never stored under its own digest). A text equals the truth or the reading states the refusal; UTF-8 is the control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boundOf } from "../../../src/read-bounds.mjs";
import { read, TEXT_WINDOW_FROM, MULTIPART_READ_MAX } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, sha } from "./fixture.mjs";

const MiB = 1048576, KB = 1000;
const enc = new TextEncoder();
const lineOf = (i) => `ligne ${String(i).padStart(6, "0")} café déjà vu naïve œuvre`;
const rowsOf = (n, f = lineOf) => Array.from({ length: n }, (_, i) => f(i));

/* a charset's bytes for a string, built from the platform's own decoder for the charset (every byte decoded once, then the table reversed) */
function encoderFor(label) {
  const td = new TextDecoder(label), back = new Map();
  for (let b = 0; b < 256; b++) { const ch = td.decode(new Uint8Array([b])); if (ch !== "�" && !back.has(ch)) back.set(ch, b); }
  return (s) => { const out = new Uint8Array([...s].length); let i = 0; for (const ch of s) { if (!back.has(ch)) throw new Error(`${label} cannot hold ${ch}`); out[i++] = back.get(ch); } return out; };
}
const utf16 = (s, { le = true, bom = true } = {}) => {
  const b = Buffer.from(s, "utf16le");
  if (!le) b.swap16();
  const mark = le ? [0xff, 0xfe] : [0xfe, 0xff];
  return bom ? new Uint8Array([...mark, ...b]) : new Uint8Array(b);
};

/* an upload: one object under the capture's digest. A fetch: the parts the fetch streamed, each held under its own digest */
async function upload(bytes, ct) {
  const b = bucket(), d = await hold(b, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct, format: "undetermined", fromText: true });
  return { b, document };
}
async function fetched(bytes, ct, size = Math.min(8 * MiB, Math.ceil(bytes.length / 2))) {
  const b = bucket(), parts = [];
  for (let at = 0; at < bytes.length; at += size) { const p = bytes.subarray(at, at + size); parts.push({ sha256: await hold(b, p), bytes: p.length }); }
  const document = doc({ digest: sha(bytes), bytes: bytes.length, ct, format: "undetermined", fromText: false, parts });
  document.profile.source_content_type = ct;
  return { b, document };
}
const readAll = ({ b, document }, extra = {}) => read(document, { evidence: evidenceStore(b), env: {}, unitsBudget: Infinity, ...extra });
const texts = (out) => (out.text_units || []).map((u) => u.text);

/* ---- the windows whose detection differs from the file's ---- */

test("R49 (encoding_disagree): a text read as UTF-8 with a window that is not UTF-8, and a text read as windows-1252 with a window that is UTF-8, state the offsets of those windows; a clean text states none", async () => {
  /* UTF-8 with a legacy window: the stray bytes sit in the second 64 KiB window; the other characters stay true (ooxml R36, G169) */
  const a = enc.encode(`${rowsOf(2400).join("\n")}\n`);
  const stray = Buffer.from("caf\xe9 d\xe9j\xe0 vu\n", "latin1");
  const mixed = new Uint8Array([...a.subarray(0, 70000), ...stray, ...a.subarray(70000)]);
  const m = await readAll(await upload(mixed, "text/plain"));
  assert.equal(m.reading.encoding, "utf-8");
  assert.equal(m.reading.encoding_assumed, true);
  assert.deepEqual(m.reading.encoding_disagree, [65536], "the window that is not UTF-8, by its byte offset");
  assert.equal(m.reading.encoding_replaced, 3, "the stray bytes are counted");
  assert.equal(texts(m).filter((t) => t.includes("café déjà vu")).length >= 2399, true, "every other line is true");
  /* a legacy text with a window that is UTF-8 */
  const latin = enc.encode("x") && new Uint8Array(Buffer.from(rowsOf(4000).join("\n"), "latin1"));
  const u8win = enc.encode("café déjà vu œuvre ".repeat(4000));
  const swapped = new Uint8Array([...latin.subarray(0, 65536), ...u8win.subarray(0, 65536), ...latin.subarray(65536)]);
  const s = await readAll(await upload(swapped, "text/plain"));
  assert.equal(s.reading.encoding, "windows-1252");
  assert.deepEqual(s.reading.encoding_disagree, [65536]);
  /* control: a clean text, and one held in parts, state no window */
  const clean = enc.encode(rowsOf(5000).join("\n"));
  for (const shape of [upload, fetched]) {
    const c = await readAll(await shape(clean, "text/plain"));
    assert.equal(c.reading.encoding, "utf-8");
    assert.equal("encoding_disagree" in c.reading, false);
  }
  /* a text held in parts states the same window as the upload does */
  const p = await readAll(await fetched(mixed, "text/plain"));
  assert.deepEqual(p.reading.encoding_disagree, [65536]);
});

/* ---- an encoding it cannot decode ---- */

test("R49 R54 (ENCODING_UNSUPPORTED {name}): an encoding the rule cannot decode is stated by its name, final, with no text and no replacement characters: declared by the header, by the page's own meta, by the XML prolog, and in the parts a fetch streams", async () => {
  const body = enc.encode("hello world\nsecond line here\n");
  const named = async (shape, bytes, ct, format, name) => {
    const w = await shape(bytes, ct);
    if (format) w.document.profile.format = { format, confidence: "certain", signals: [] };
    const out = await readAll(w);
    assert.equal(out.reading.failure, "final", `${shape.name} ${name}`);
    assert.equal(out.reading.reason, "ENCODING_UNSUPPORTED", `${shape.name} ${name}`);
    assert.equal(out.reading.name, name, `${shape.name}: the refusal names the encoding`);
    assert.ok(out.reading.basis.includes(name), `${shape.name}: the sentence names it: ${out.reading.basis}`);
    assert.equal(out.reading.found, false);
    assert.equal(out.text_units, undefined, "no text is made of it");
    assert.equal("encoding" in out.reading, false, "no encoding is claimed");
    assert.equal(out.final, true);
    return out;
  };
  for (const shape of [upload, fetched]) {
    await named(shape, body, "text/plain; charset=shift_jis", null, "shift_jis");
    await named(shape, body, "text/plain; charset=big5", null, "big5");
  }
  /* declared by the page itself, the header saying nothing (a header wins over the markup's own) */
  await named(upload, enc.encode('<html><head><meta charset="gb2312"></head><body><p>hello</p></body></html>'), "text/html", "html", "gb2312");
  await named(upload, enc.encode('<meta http-equiv="content-type" content="text/html">\n<meta charset=euc-kr><p>hello</p>'), "text/html", "html", "euc-kr");
  await named(upload, enc.encode('<?xml version="1.0" encoding="EBCDIC-US"?><note>hello</note>'), "application/xml", "xml", "EBCDIC-US");
  /* controls: the header's supported charset wins over the page's own unsupported one; UTF-8 is read as before */
  const win = await readAll(await upload(enc.encode('<meta charset="gb2312"><p>hello</p>'), "text/html; charset=utf-8"));
  assert.equal(win.reading.reason, undefined);
  const ok = await readAll(await upload(body, "text/plain; charset=utf-8"));
  assert.deepEqual(texts(ok), ["hello world", "second line here"]);
  assert.equal(ok.reading.encoding, "utf-8");
});

/* ---- UTF-16 without a BOM ---- */

test("R49 (UTF-16 without a BOM): little- and big-endian UTF-16 with no byte-order mark is read as UTF-16, stated and assumed, every character true, as an upload and as a fetch; with a BOM it is not assumed", async () => {
  const lines = ["Hello UTF-16", "café déjà vu naïve œuvre — €5", "emoji 😀 pair", "last line"];
  const truth = lines.join("\n");
  for (const le of [true, false]) {
    const want = le ? "utf-16le" : "utf-16be";
    for (const shape of [upload, fetched]) {
      const out = await readAll(await shape(utf16(truth, { le, bom: false }), "text/plain"));
      assert.deepEqual(texts(out), lines, `${want} ${shape.name}`);
      assert.equal(out.reading.encoding, want);
      assert.equal(out.reading.encoding_assumed, true, "no mark and no declaration decided it");
      assert.equal(out.counters.skipped, 0);
      const marked = await readAll(await shape(utf16(truth, { le, bom: true }), "text/plain"));
      assert.deepEqual(texts(marked), lines);
      assert.equal(marked.reading.encoding, want);
      assert.equal(marked.reading.encoding_assumed, false, "the mark decided it");
    }
  }
  /* JSON in UTF-16 without a mark is read the same way */
  const json = await readAll(await upload(utf16('{"a":"café"}\n{"b":2}', { bom: false }), "application/json"));
  assert.deepEqual(texts(json), ['{"a":"café"}', '{"b":2}']);
  assert.equal(json.reading.encoding, "utf-16le");
});

/* ---- ISO-8859-x ---- */

test("R49 (ISO-8859-x): a text declared ISO-8859-1, -2, -7, -9 and -15 is decoded by its charset, every character true and the encoding stated, by the header and by the page's own meta; the label latin1 is windows-1252", async () => {
  /* the encoding stated is the platform's name for the charset: ISO-8859-1 and -9 are windows-1252 and windows-1254 there (a superset, the same letters) */
  const cases = [
    ["iso-8859-1", "café déjà vu naïve — ñandú ÿ"],
    ["iso-8859-2", "zażółć gęślą jaźń Łódź ČŠŽ"],
    ["iso-8859-7", "καλημέρα κόσμε Ελλάδα"],
    ["iso-8859-9", "İstanbul şğı ÇÖÜ café"],
    ["iso-8859-15", "café €5 Šuma œuvre Ÿ"],
  ];
  for (const [label, line] of cases) {
    const want = new TextDecoder(label).encoding;
    const lines = [line, `second line of ${label}`];
    const bytes = encoderFor(label)(lines.join("\n"));
    for (const shape of [upload, fetched]) {
      const out = await readAll(await shape(bytes, `text/plain; charset=${label}`));
      assert.deepEqual(texts(out), lines, `${label} ${shape.name}`);
      assert.equal(out.reading.encoding, want);
      assert.equal(out.reading.encoding_assumed, false, "the header declared it");
      assert.ok(!texts(out).some((t) => t.includes("�")));
    }
    /* declared by the page itself */
    const page = encoderFor(label)(`<html><head><meta charset="${label}"></head><body><p>${line}</p></body></html>`);
    const w = await upload(page, "text/html");
    w.document.profile.format = { format: "html", confidence: "certain", signals: [] };
    const html = await readAll(w);
    assert.deepEqual(texts(html), [line], `${label} meta`);
    assert.equal(html.reading.encoding, want);
  }
  const latin1 = await readAll(await upload(encoderFor("windows-1252")("café déjà vu\nsecond"), "text/plain; charset=latin1"));
  assert.equal(latin1.reading.encoding, "windows-1252");
  assert.deepEqual(texts(latin1), ["café déjà vu", "second"]);
  /* control: bytes that are not UTF-8 and declare nothing are read as windows-1252 and said to be assumed */
  const undeclared = await readAll(await upload(encoderFor("windows-1252")("café déjà vu\nsecond"), "text/plain"));
  assert.equal(undeclared.reading.encoding, "windows-1252");
  assert.equal(undeclared.reading.encoding_assumed, true);
});

/* ---- a decode's failures are no glyphs (text-chain R73) ---- */

test("R49 (text-chain R73): U+FFFD and NUL in a text are counted as no glyph in the reading's glyphs, whatever the encoding; a replacement over 0.5 % of the characters leaves the reading partial with the count, as an upload and as a fetch", async () => {
  /* a NUL in the text of a capture held in parts makes it no text (R2 R32's control), so NUL is told on the upload and U+FFFD on both */
  for (const [shape, body, glyphs] of [[upload, "ab\u0000\u0000 cd\u{fffd}\u{fffd}\nsecond line", 4 + 10], [fetched, "ab cd\u{fffd}\u{fffd}\nsecond line", 4 + 10]]) {
    const out = await readAll(await shape(enc.encode(body), "text/plain; charset=utf-8"));
    assert.equal(out.reading.text_glyphs, glyphs, `${shape.name}: ab, cd and 'secondline' are glyphs; NUL and U+FFFD are not`);
    assert.equal(out.reading.encoding_replaced, 2, "the replacement characters the text holds are counted");
    assert.ok(out.counters.skipped >= 1, "over 0.5 % of its characters, so the reading is partial");
    assert.equal(out.final, true);
    /* bytes that are not UTF-8, declared UTF-8, are replaced and counted, never read as whole */
    const bad = new Uint8Array([...enc.encode("abc ".repeat(20)), ...new Uint8Array(40).fill(0xff), 0x0a, ...enc.encode("tail line")]);
    const r = await readAll(await shape(bad, "text/plain; charset=utf-8"));
    assert.ok(r.reading.encoding_replaced > 0, `${shape.name}: counted`);
    assert.ok(r.counters.skipped >= 1, `${shape.name}: partial`);
    assert.equal(r.reading.failure, undefined, "a text, not a refusal");
    /* control: a text with one stray byte in a long text is under the tolerance, so nothing is skipped */
    const longText = enc.encode(rowsOf(2000).join("\n"));
    const one = new Uint8Array([...longText.subarray(0, 5000), 0xff, ...longText.subarray(5000)]);
    const c = await readAll(await shape(one, "text/plain; charset=utf-8"));
    assert.equal(c.reading.encoding_replaced, 1);
    assert.equal(c.counters.skipped, 0, `${shape.name}: one replacement is under 0.5 %`);
  }
});

/* ---- the encoding matrix at 100 KB, 3 MiB and 9 MiB, as an upload and as a fetch ---- */

/* each encoding, with the characters it can hold and the bytes a text of it takes */
const ENCODINGS = [
  { name: "utf-8", ct: "text/plain; charset=utf-8", line: lineOf, bytes: (s) => enc.encode(s), want: "utf-8", assumed: false },
  { name: "utf-8 with a BOM", ct: "text/plain", line: lineOf, bytes: (s) => new Uint8Array([0xef, 0xbb, 0xbf, ...enc.encode(s)]), want: "utf-8", assumed: false },
  { name: "undeclared UTF-8", ct: "text/plain", line: lineOf, bytes: (s) => enc.encode(s), want: "utf-8", assumed: true },
  { name: "UTF-16LE with a BOM", ct: "text/plain", line: lineOf, bytes: (s) => utf16(s), want: "utf-16le", assumed: false },
  { name: "UTF-16BE with a BOM", ct: "text/plain", line: lineOf, bytes: (s) => utf16(s, { le: false }), want: "utf-16be", assumed: false },
  { name: "UTF-16LE without a BOM", ct: "text/plain", line: lineOf, bytes: (s) => utf16(s, { bom: false }), want: "utf-16le", assumed: true },
  { name: "UTF-16BE without a BOM", ct: "text/plain", line: lineOf, bytes: (s) => utf16(s, { le: false, bom: false }), want: "utf-16be", assumed: true },
  { name: "windows-1252", ct: "text/plain; charset=windows-1252", line: (i) => `${lineOf(i)} — €5`, bytes: (s) => encoderFor("windows-1252")(s), want: "windows-1252", assumed: false },
  { name: "undeclared windows-1252", ct: "text/plain", line: lineOf, bytes: (s) => encoderFor("windows-1252")(s), want: "windows-1252", assumed: true },
  { name: "ISO-8859-2", ct: "text/plain; charset=iso-8859-2", line: (i) => `ligne ${String(i).padStart(6, "0")} zażółć gęślą jaźń Łódź`, bytes: (s) => encoderFor("iso-8859-2")(s), want: "iso-8859-2", assumed: false },
  { name: "ISO-8859-15", ct: "text/plain; charset=iso-8859-15", line: (i) => `${lineOf(i)} €5 Šuma`, bytes: (s) => encoderFor("iso-8859-15")(s), want: "iso-8859-15", assumed: false },
];
/* the first and last lines of a text of about `target` bytes once encoded */
function textOf(e, target) {
  const per = e.bytes(`${e.line(0)}\n`).length;
  const n = Math.max(3, Math.floor(target / per));
  return rowsOf(n, e.line);
}
for (const [label, target] of [["100 KB", 100 * KB], ["3 MiB", 3 * MiB], ["9 MiB", 9 * MiB]]) {
  for (const e of ENCODINGS) {
    for (const shape of [upload, fetched]) {
      test(`R49 (${label} ${shape === upload ? "upload" : "fetch"}, ${e.name}): the text equals the truth and the reading states the encoding`, async () => {
        const lines = textOf(e, target);
        const bytes = e.bytes(lines.join("\n"));
        assert.ok(bytes.length <= (shape === upload ? TEXT_WINDOW_FROM : MULTIPART_READ_MAX), `${bytes.length}`);
        const out = await readAll(await shape(bytes, e.ct));
        assert.equal(out.reading.failure, undefined, out.reading.basis);
        assert.equal(out.reading.encoding, e.want);
        assert.equal(out.reading.encoding_assumed, e.assumed);
        assert.equal(out.counters.skipped, 0, "nothing replaced, nothing skipped");
        assert.equal(out.text_units_over_bound, undefined);
        const got = texts(out);
        assert.equal(got.length, lines.length, "every line once");
        for (const i of [0, 1, 2, Math.floor(lines.length / 2), lines.length - 1]) assert.equal(got[i], lines[i], `line ${i}`);
        assert.deepEqual(got, lines);
      });
    }
  }
}

/* ---- past a whole read: UTF-16 without a BOM and ISO-8859-x reach the standard's 50 MB by windows too (R50) ---- */

const BIG = [
  { name: "UTF-16LE without a BOM", ct: "text/plain", perLine: 200, line: (i) => `${lineOf(i)}`.padEnd(99, "."), bytes: (s) => utf16(s, { bom: false }), want: "utf-16le", assumed: true },
  { name: "UTF-16BE without a BOM", ct: "text/plain", perLine: 200, line: (i) => `${lineOf(i)}`.padEnd(99, "."), bytes: (s) => utf16(s, { le: false, bom: false }), want: "utf-16be", assumed: true },
  { name: "ISO-8859-2", ct: "text/plain; charset=iso-8859-2", perLine: 100, line: (i) => `ligne ${String(i).padStart(7, "0")} zażółć gęślą jaźń Łódź`.padEnd(99, "."), bytes: (s) => encoderFor("iso-8859-2")(s), want: "iso-8859-2", assumed: false },
];
for (const e of BIG) {
  test(`R49 R50 (${e.name}, about 26 MiB): read in windows from its first piece, every line true and once, the last line read, the encoding stated, the bytes pulled at most twice the file`, async () => {
    const n = Math.ceil((26 * MiB) / e.perLine);
    const lines = rowsOf(n, e.line);
    lines.push("DERNIÈRE-LIGNE fin");
    const bytes = e.bytes(lines.join("\n").replace(/È/g, e.want === "iso-8859-2" ? "E" : "È"));
    if (e.want === "iso-8859-2") lines[n] = "DERNIERE-LIGNE fin";
    assert.ok(bytes.length > TEXT_WINDOW_FROM && bytes.length < boundOf("text", "bytes"), `${bytes.length}`);
    const { b, document } = await upload(bytes, e.ct);
    const whole = await read(document, { evidence: evidenceStore(b), env: {} });
    assert.equal(whole.reading.failure, "transient", "a read not in pieces says it is read in pieces");
    b.served = 0;
    const pieces = [];
    let cursor = null;
    for (let guard = 0; guard < 4000; guard++) {
      const out = await read(document, { evidence: evidenceStore(b), env: {}, unitsBudget: 512 * 1024, maxUnits: 4096, cursor });
      pieces.push(out);
      if (out.more !== true) break;
      cursor = out.cursor;
    }
    const units = pieces.flatMap((p) => p.text_units || []);
    assert.equal(units.length, n + 1, "every line once");
    for (const i of [0, 1, 12345, n - 1, n]) assert.equal(units[i].text, lines[i].trim(), `line ${i}`);
    assert.equal(pieces.at(-1).more, false);
    assert.ok(b.served <= 2 * bytes.length, `${b.served} of ${bytes.length}`);
    assert.equal(pieces[0].reading.encoding, e.want);
    assert.equal(pieces[0].reading.encoding_assumed, e.assumed);
  });
}

test("R49 R50 R54 (ENCODING_UNSUPPORTED past a whole read): a text of about 26 MiB declared in an encoding the rule cannot decode is not windowed and not guessed: it is stated against the whole-read bound with its size, final", async () => {
  const text = enc.encode(`${rowsOf(Math.ceil((26 * MiB) / enc.encode(`${lineOf(0)}\n`).length)).join("\n")}\n`);
  assert.ok(text.length > TEXT_WINDOW_FROM && text.length < boundOf("text", "bytes"), `${text.length}`);
  const { b, document } = await upload(text, "text/plain; charset=shift_jis");
  const out = await read(document, { evidence: evidenceStore(b), env: {} });
  assert.equal(out.reading.failure, "final");
  assert.equal(out.reading.reason, "TOO_LARGE");
  assert.equal(out.reading.size, text.length);
  assert.equal(out.reading.bound, TEXT_WINDOW_FROM);
  assert.equal(out.text_units, undefined);
});
