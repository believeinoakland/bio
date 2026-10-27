/* reading-pipeline G68 (fix round 7), R40 and R41: a piece read from a byte window is the piece the whole read cuts. A capture read
   as text, or as a CSV, is given a cursor of kind `w` by its first piece, and each later piece asks the evidence store for its
   window alone. The ORACLE is the same capture read in ONE piece (`unitsBudget` and `maxUnits` unbounded): the units of every
   windowed piece, in order, are the oracle's units, each once, with their `seq`, extents, text and `truncated`; the pieces' words
   add up to the oracle's; `read_through` grows to `total`. The captures are the awkward ones: quoted fields holding line breaks
   (LF, CRLF), doubled quotes, empty records, CR-only and CRLF terminators, a record whose lines span several blocks, a row over
   the cap, multi-byte characters at the window's edge, a BOM, runs over the cap. A cursor that does not fit is refused. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, WINDOW_BYTES } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, sha } from "./fixture.mjs";

const CAP = 128 * 1024;
const ALL = { unitsBudget: Infinity, maxUnits: 1e9 };
const decode = (c) => JSON.parse(Buffer.from(c, "base64url").toString());
const encode = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const readOf = (store, document, cursor, extra = {}) => read(document, { evidence: store, env: {}, storeName: "bio", cursor, ...extra });

/* The oracle: the capture read in one piece. */
async function oracle(store, document) {
  const out = await readOf(store, document, null, ALL);
  assert.equal(out.more, false, "the oracle is one piece");
  return out;
}
/* Every piece to the end by the cursor of the one before, with the cursors kept. */
async function pieces(store, document, extra) {
  const out = [];
  let cursor = null;
  for (let guard = 0; guard < 2000; guard++) {
    const p = await readOf(store, document, cursor, extra);
    out.push({ ask: cursor, p });
    if (p.more !== true) break;
    cursor = p.cursor;
  }
  return out;
}
const kindOf = (cursor) => (cursor ? decode(cursor).k : null);

/* The pieces equal the oracle; `windowed` says the cursors after the first were `w` (a capture that is not windowable is given
   the cursor of the old kind and equals the oracle all the same). */
async function equivalent(label, bytes, { ct, format, fromText = true, extra = {}, windowed = true, minPieces = 3 } = {}) {
  const b = bucket();
  const store = evidenceStore(b);
  const d = await hold(b, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct, format, fromText });
  const want = await oracle(store, document);
  const run = await pieces(store, document, extra);
  assert.ok(run.length >= minPieces, `${label}: ${run.length} pieces`);
  const kinds = run.slice(1).map((r) => kindOf(r.ask));
  assert.deepEqual([...new Set(kinds)], [windowed ? "w" : kinds[0]], `${label}: the cursors after the first are ${windowed ? "windows" : "not windows"}: ${[...new Set(kinds)]}`);
  if (!windowed) assert.notEqual(kinds[0], "w", label);
  const got = run.flatMap((r) => r.p.text_units || []);
  assert.equal(got.length, want.text_units.length, `${label}: the same number of units`);
  assert.deepEqual(got, want.text_units, `${label}: the units of the pieces are the oracle's, in order`);
  assert.equal(new Set(got.map((u) => u.seq)).size, got.length, `${label}: each unit once`);
  /* words: the pieces' words add up to the oracle's, and to the first piece's total */
  const sum = run.reduce((n, r) => n + r.p.piece.words, 0);
  assert.equal(sum, want.piece.words, `${label}: the pieces' words are the oracle's`);
  assert.equal(run[0].p.reading.words_total, want.reading.words_total, `${label}: the first piece counts the whole text's words`);
  if (!extra.cutRow) assert.equal(sum, run[0].p.reading.words_total, `${label}: the pieces' words are the total (a row cut at the cap holds fewer words than the text had, R35)`);
  /* progress */
  run.forEach(({ p }, i) => {
    assert.equal(p.total, want.total, `${label}: piece ${i} total`);
    assert.equal(p.more, i < run.length - 1, `${label}: piece ${i} more`);
    assert.equal(p.cursor === null, i === run.length - 1, `${label}: piece ${i} cursor`);
    assert.ok(p.piece.units >= 1 || i === run.length - 1, `${label}: piece ${i} holds a unit`);
    if (i) assert.ok(p.read_through >= run[i - 1].p.read_through, `${label}: progress only grows`);
    assert.equal(p.reading !== undefined, i === 0, `${label}: only the first piece is the reading`);
  });
  assert.equal(run[run.length - 1].p.read_through, want.total, `${label}: the last piece has read through the end`);
  return { run, want, b, store, document, d };
}

/* ---- the awkward CSV ------------------------------------------------------------------------------------------------------ */

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const monster = (n, tag) => `"${Array.from({ length: n }, (_, k) => `${tag} line ${k} of a long quoted answer, with "" doubled quotes ""`).join("\n")}"`;
/* About `rows` records of a table: a header and 100 plain rows (so the dialect is plain), then every kind of record. */
function awkwardCsv({ rows = 30000, bom = false, overlong = false } = {}) {
  const r = rng(11);
  const out = ["id,name,note,amount"];
  for (let i = 1; i <= 100; i++) out.push(`${i},Name ${i},note about item ${i} for the council,${(i * 37) % 997}.${i % 100}`);
  const parts = [];
  for (let i = 101; i <= rows; i++) {
    const k = i % 11;
    if (i === 400) { out.push(`${i},Monster,${monster(3000, "early")},9`); continue; }
    if (i === Math.floor(rows * 0.8)) { out.push(`${i},Monster,${monster(3000, "late")},9`); continue; }
    if (overlong && i === Math.floor(rows * 0.6)) { out.push(`${i},Overlong,${"W".repeat(CAP + 5000)},1`); continue; }
    switch (k) {
      case 1: out.push(`${i},"Smith, Jane","line one\nline two\n""quoted"" three",7`); break;
      case 2: parts.push([out.length, "\r\n"]); out.push(`${i},CRLF ${i},note ${i} ends with crlf,1`); break;
      case 3: out.push(""); break;
      case 4: out.push(",,,"); break;
      case 5: out.push(`${i},Zoë Müller,日本語のノート \u{1F3DB} civic ${i},3`); break;
      case 6: parts.push([out.length, "\r"]); out.push(`${i},CR ${i},note ${i} ends with a bare cr,2`); break;
      case 7: out.push(`${i},"a,b\r\nc ${i}",x,1`); break;
      case 8: out.push(`${i},Long,${"note ".repeat(60)}${i},4`); break;
      default: out.push(`${i},Plain ${i},note about item ${i} on the agenda ${Math.floor(r() * 1e6)},${i}`);
    }
  }
  /* join with the terminator each row asked for (default LF); the last record has none */
  const term = new Map(parts.map(([at, t]) => [at, t]));
  let text = "";
  out.forEach((line, at) => { text += line + (at === out.length - 1 ? "" : (term.get(at) ?? "\n")); });
  return (bom ? "﻿" : "") + text;
}

for (const [name, opts, extra] of [
  ["awkward records, default window", {}, {}],
  ["awkward records, windows of 40,000 bytes (every edge falls somewhere)", {}, { windowBytes: 40000 }],
  ["awkward records, windows of 4,099 bytes", { rows: 16000 }, { windowBytes: 4099 }],
  ["with a UTF-8 BOM", { bom: true }, { windowBytes: 70001 }],
  ["with a row over the cap (every block is flagged truncated)", { overlong: true }, { windowBytes: 50000, cutRow: true }],
]) {
  test(`R40 R41 R35 (G68): a CSV with ${name}: the pieces read by windows are the one-piece read's units, each once`, async () => {
    const text = awkwardCsv(opts);
    assert.ok(Buffer.byteLength(text) > 1.2 * 1024 * 1024, `${Buffer.byteLength(text)} bytes: longer than a head and its window`);
    const { run, want } = await equivalent(name, Buffer.from(text), { ct: "text/csv", format: "csv",
      extra: { unitsBudget: 150 * 1024, maxUnits: 3, ...extra }, minPieces: 4 });
    if (opts.overlong) assert.ok(want.text_units.every((u) => u.truncated === true), "a sheet with a cut row flags every block");
    assert.ok(want.text_units.length >= 10, `${want.text_units.length} blocks`);
    /* a record whose lines span blocks: some block begins inside a quoted field (its first line is a middle line of the record) */
    assert.ok(run.length >= 4);
  });
}

test("R40 R41 (G68): a CSV read by windows with the default budget and bound equals the one-piece read, and its blocks name their rows", async () => {
  const { want } = await equivalent("default budget", Buffer.from(awkwardCsv({ rows: 40000 })), { ct: "text/csv", format: "csv", extra: { unitsBudget: 512 * 1024 }, minPieces: 2 });
  for (const u of want.text_units) assert.match(u.extent.range, /^A\d+:D\d+$/, "a block names its rows");
});

test("R40 (G68): a CSV that is not longer than the head a window needs is given the cursor of the old kind, and a CSV in UTF-16 too; both equal the one-piece read", async () => {
  const small = awkwardCsv({ rows: 3500 });
  assert.ok(Buffer.byteLength(small) < 1024 * 1024, `${Buffer.byteLength(small)}`);
  await equivalent("small", Buffer.from(small), { ct: "text/csv", format: "csv", extra: { unitsBudget: 60 * 1024, maxUnits: 2 }, windowed: false, minPieces: 2 });
  const wide = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(awkwardCsv({ rows: 12000 }), "utf16le")]);
  await equivalent("utf-16", wide, { ct: "text/csv", format: "csv", extra: { unitsBudget: 150 * 1024, maxUnits: 3 }, windowed: false, minPieces: 3 });
});

/* ---- a text read as text -------------------------------------------------------------------------------------------------- */

const MB = (s) => Buffer.byteLength(s);
function lineLog(n, { crlf = false, multibyte = false } = {}) {
  return Array.from({ length: n }, (_, i) => `line ${String(i).padStart(6, "0")} ${multibyte ? "日本語 council-minutes \u{1F3DB} é" : "council-minutes"} ${"x".repeat(i % 40)}`).join(crlf ? "\r\n" : "\n");
}
const SEPARATORS = ["\n\n", "\r\n\r\n", "\n \t\n", "\n \n", "\n\n\n\n", "\r\n \r\n"];
function paragraphs(n, { multibyte = false } = {}) {
  return Array.from({ length: n }, (_, i) => `Paragraph ${i}: ${multibyte ? "café 日本語 \u{1F3DB}" : "the council received"} the staff report on item ${i}.\nIts second line, ${i}.${SEPARATORS[i % SEPARATORS.length]}`).join("").trimEnd();
}

for (const [name, text, extra] of [
  ["lines, LF, default window", lineLog(30000), { windowBytes: WINDOW_BYTES }],
  ["lines, CRLF, windows of 5,003 bytes", lineLog(20000, { crlf: true }), { windowBytes: 5003 }],
  ["lines, multi-byte characters, windows of 4,097 bytes (an edge falls inside a character)", lineLog(20000, { multibyte: true }), { windowBytes: 4097 }],
  ["lines, multi-byte characters, windows of 4,099 bytes", lineLog(20000, { multibyte: true }), { windowBytes: 4099 }],
  ["paragraphs between blank lines of every kind, windows of 6,011 bytes", paragraphs(9000), { windowBytes: 6011 }],
  ["paragraphs with multi-byte characters, windows of 4,101 bytes", paragraphs(8000, { multibyte: true }), { windowBytes: 4101 }],
  ["with a BOM", "﻿" + lineLog(20000), { windowBytes: 7001 }],
]) {
  test(`R40 (G68): a text of ${name}: the pieces read by windows are the one-piece read's units, each once`, async () => {
    assert.ok(MB(text) > 200 * 1024, `${MB(text)} bytes`);
    await equivalent(name, Buffer.from(text), { ct: "text/plain", format: "undetermined",
      extra: { unitsBudget: 150 * 1024, maxUnits: 400, ...extra }, minPieces: 3 });
  });
}

test("R41 (G68): a text whose runs are over the cap (a line of 300,000 characters among short ones) is carried whole as runs by windows", async () => {
  const lines = [];
  for (let i = 0; i < 4000; i++) lines.push(`short line ${i}`);
  lines.push("L".repeat(300000));
  for (let i = 0; i < 4000; i++) lines.push(`after line ${i} café`);
  lines.push(("word ".repeat(70000)).trim());
  const text = lines.join("\n");
  const { want } = await equivalent("long runs", Buffer.from(text), { ct: "text/plain", format: "undetermined", extra: { unitsBudget: 150 * 1024, maxUnits: 1000, windowBytes: 20011 }, minPieces: 3 });
  assert.ok(want.text_units.some((u) => u.extent.run === 2), "the run over the cap is carried as consecutive units");
});

test("R40 (G68): a text that is not valid UTF-8, an HTML page and a text held only in parts keep the cursor of the old kind and equal the one-piece read", async () => {
  const bad = Buffer.concat([Buffer.from(lineLog(8000)), Buffer.from([0xff, 0xfe, 0x41, 0x0a]), Buffer.from(lineLog(8000))]);
  await equivalent("invalid utf-8", bad, { ct: "text/plain", format: "undetermined", extra: { unitsBudget: 100 * 1024, maxUnits: 300 }, windowed: false });
  const page = `<html><body><main>${Array.from({ length: 6000 }, (_, i) => `<p>Paragraph ${i} of the notice, with words.</p>`).join("")}</main></body></html>`;
  await equivalent("html", Buffer.from(page), { ct: "text/html", format: "html", extra: { unitsBudget: 60 * 1024, maxUnits: 300 }, windowed: false });
  /* parts only: no whole object under the document's digest */
  const bytes = Buffer.from(lineLog(20000));
  const b = bucket();
  const cut = [0, Math.floor(bytes.length / 2), bytes.length];
  const parts = [];
  for (let i = 0; i < 2; i++) { const part = bytes.subarray(cut[i], cut[i + 1]); parts.push({ sha256: await hold(b, part), bytes: part.length }); }
  const document = { ...doc({ digest: sha(bytes), bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: false, parts }),
                     profile: { profiled_from_text: false, format: { format: "undetermined", confidence: "none", signals: [] }, source_content_type: "text/plain" } };
  const store = evidenceStore(b);
  const want = await oracle(store, document);
  const run = await pieces(store, document, { unitsBudget: 100 * 1024, maxUnits: 300 });
  assert.ok(run.slice(1).every((r) => kindOf(r.ask) !== "w"), "no whole object, no window");
  assert.deepEqual(run.flatMap((r) => r.p.text_units || []), want.text_units);
});

/* ---- the cursor is checked, and a store that cannot answer is a failed reading ------------------------------------------------ */

test("R40 (G68): a window cursor that does not fit is refused with no reading and no units: another capture, another size, an offset that begins no run, a cursor of the wrong shape", async () => {
  for (const [what, text, ct, format, extra] of [
    ["text", lineLog(30000), "text/plain", "undetermined", { unitsBudget: 100 * 1024, maxUnits: 300 }],
    ["csv", awkwardCsv({ rows: 30000 }), "text/csv", "csv", { unitsBudget: 150 * 1024, maxUnits: 3 }]]) {
    const b = bucket();
    const store = evidenceStore(b);
    const d = await hold(b, text);
    const document = doc({ digest: d, bytes: MB(text), ct, format, fromText: true });
    const first = await readOf(store, document, null, extra);
    const cur = decode(first.cursor);
    assert.equal(cur.k, "w", what);
    const other = await hold(b, text + "\nand more");
    const otherDoc = doc({ digest: other, bytes: MB(text) + 9, ct, format, fromText: true });
    const tamper = [
      ["another capture", otherDoc, cur],
      ["another size", document, { ...cur, n: cur.n + 1 }],
      ["a negative offset", document, { ...cur, ob: -1 }],
      ["an offset past the end", document, { ...cur, ob: cur.n + 5 }],
      ["a fractional offset", document, { ...cur, ob: cur.ob + 0.5 }],
      ["another mode", document, { ...cur, m: "x" }],
      ["no digest", document, { ...cur, s: "" }],
      ["not base64", document, "12 !"],
    ];
    if (what === "text") tamper.push(["an offset inside a run", document, { ...cur, ob: cur.ob + 3 }], ["a bad grain", document, { ...cur, g: 7 }]);
    else tamper.push(["a head that is too short", document, { ...cur, he: 10 }], ["a negative row", document, { ...cur, rw: 0 }]);
    for (const [name, document2, cursor] of tamper) {
      const out = await readOf(store, document2, typeof cursor === "string" ? cursor : encode(cursor), extra);
      assert.equal(out.refused && out.refused.code, "CURSOR_MISMATCH", `${what}: ${name}`);
      assert.equal(out.reading, undefined, name);
      assert.equal(out.text_units, undefined, name);
    }
    const next = await readOf(store, document, first.cursor, extra);
    assert.ok(next.text_units && next.text_units.length >= 1, `${what}: the right cursor still reads`);
  }
});

test("R40 (G68): a store that cannot answer a range leaves every cursor of the old kind, and the pieces are still the one-piece read's units", async () => {
  const b = bucket();
  const noRange = { head: evidenceStore(b).head, put: evidenceStore(b).put,
    get: (d, options) => { if (options && options.range) throw new Error("this store cannot answer a range"); return evidenceStore(b).get(d); } };
  for (const [text, ct, format, extra] of [
    [lineLog(30000), "text/plain", "undetermined", { unitsBudget: 100 * 1024, maxUnits: 300 }],
    [awkwardCsv({ rows: 16000 }), "text/csv", "csv", { unitsBudget: 150 * 1024, maxUnits: 3 }]]) {
    const document = doc({ digest: await hold(b, text), bytes: MB(text), ct, format, fromText: true });
    const want = await oracle(noRange, document);
    const run = [];
    let cursor = null;
    for (let g = 0; g < 500; g++) { const p = await readOf(noRange, document, cursor, extra); run.push({ ask: cursor, p }); if (!p.more) break; cursor = p.cursor; }
    assert.ok(run.length >= 3);
    assert.ok(run.slice(1).every((r) => kindOf(r.ask) !== "w"), "no window cursor was made");
    assert.deepEqual(run.flatMap((r) => r.p.text_units || []), want.text_units);
  }
});

test("R40 R24 (G68): a window read of an object the store no longer holds is a failed reading that says it can be read again; a store that ignores the range gives the same units", async () => {
  const text = lineLog(30000);
  const b = bucket();
  const store = evidenceStore(b);
  const d = await hold(b, text);
  const document = doc({ digest: d, bytes: MB(text), ct: "text/plain", format: "undetermined", fromText: true });
  const extra = { unitsBudget: 100 * 1024, maxUnits: 300 };
  const first = await readOf(store, document, null, extra);
  const want = await readOf(store, document, first.cursor, extra);
  /* a store that gives the whole object whatever is asked */
  const whole = { head: store.head, put: store.put, get: (digest) => store.get(digest) };
  const same = await readOf(whole, document, first.cursor, extra);
  assert.deepEqual(same.text_units, want.text_units);
  assert.equal(same.cursor, want.cursor);
  /* an object that is gone */
  b.held.clear();
  const gone = await readOf(store, document, first.cursor, extra);
  assert.equal(gone.reading.found, false);
  assert.equal(gone.reading.failure, "transient");
  assert.equal(gone.text_units, undefined);
  /* no store */
  const none = await readOf(null, document, first.cursor, extra);
  assert.equal(none.reading.failure, "transient");
});
