/* PROTO_LEAN_LAND / PROTO_LEAN_FLAT (throwaway measuring prototype): each flag leaves the capture_text rows (seq, extent_kind, extent, text, ref, kind, chain_kind, truncated),
   the capture_text_state and the reading's text_sha256 exactly as the unset run has them; unset = the code as it was. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, bucket, doc, sha, homesOver } from "./fixture.mjs";
import { canonicalExtent, setLeanExtent } from "../../../src/textchain.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";
import { utf8BytesOf, setLeanLand } from "../../../src/extraction/index.mjs";
import { isUnitLine, setLeanLines } from "../../../../roster-reader/lines.mjs";
import { setLeanFlat } from "../../../../doctypes/windows.mjs";
import { doctypeFor } from "../../../../docprofile/registry.mjs";

const lines = (n) => Array.from({ length: n }, (_, i) => `line ${String(i).padStart(5, "0")} ` + "council-minutes é ".repeat(5).padEnd(88, ".")).concat(["ENDMARKER"]).join("\n");
const longLines = () => Array.from({ length: 60 }, (_, i) => (i % 7 === 3 ? ("wörd ".repeat(20000 + i * 5000)).trim() : `short ${i} ` + "é".repeat(30))).join("\n");
const multiByte = () => Array.from({ length: 9000 }, (_, i) => `ligne ${i} ${"日本語のテキスト ".repeat(3)}😀 émigré Ωmega ${i % 5 === 0 ? "   tabs\tand  spaces" : ""}`).join("\n");

/* ---- (A) canonicalExtent: byte-identical to canonicalJson's spelling ---- */
let seed = 12345;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const NUMS = [0, -0, 1, 2, 17, 255, 4096, -3, 2.5, 1e21, 1e-7, 123456789012, NaN, Infinity, -Infinity, null, undefined, "7", true, {}, [], "x"];
const STRS = ["", " ", "Sheet1", " Sheet 1 ", "a\"b", "back\\slash", "é日本😀", "  ", "lone\ud800", "lone\udc00x", "B7", "$b$7", " c3 ", "A1:b2", "ZZ99", "tab\tx", "nul\u0000x", null, undefined, 5, "Footnote", "fn-1"];
const RECTS = [null, undefined, [1, 2, 3, 4], [4, 3, 2, 1], [0.5, 1.5, 2.5, 3.5], [1, 2, 3], [1, 2, 3, NaN], [-0, 0, 0, -0], "r", [1e21, 1e-7, 3, 4]];
const KINDS = ["document", "doc-para", "pdf-page", "sheet-cell", "slide-shape", "sheet-range", "doc-table", "image", "doc-part", "other", undefined, null, 7, "paragraph"];
function genExtent() {
  const e = { kind: pick(KINDS) };
  if (rnd() < 0.9) e.para = pick(NUMS);
  if (rnd() < 0.9) e.run = pick(NUMS);
  if (rnd() < 0.8) e.page = pick(NUMS);
  if (rnd() < 0.8) e.rect = pick(RECTS);
  if (rnd() < 0.8) e.sheet = pick(STRS);
  if (rnd() < 0.8) e.cell = pick(STRS);
  if (rnd() < 0.8) e.range = pick(STRS);
  if (rnd() < 0.8) e.slide = pick(NUMS);
  if (rnd() < 0.8) e.shape = pick(NUMS);
  if (rnd() < 0.8) e.table = pick(NUMS);
  if (rnd() < 0.8) e.part = pick(STRS);
  if (rnd() < 0.8) e.ref = pick(STRS);
  if (rnd() < 0.5) e.cited_as = pick(["text", "bytes", null, "", 3]);
  if (rnd() < 0.3) e.fields = pick([null, { a: 1 }, [1, 2]]);
  return e;
}
test("PROTO_LEAN_LAND canonicalExtent: 60,000 generated extents of every arm (and shapes it does not recognise) spell the same bytes as without the flag", () => {
  seed = 12345;
  const cases = [];
  for (let i = 0; i < 60000; i++) cases.push(genExtent());
  for (let i = 0; i < 2000; i++) cases.push({ kind: "doc-para", para: i, run: i % 3 ? i : null }, { kind: "pdf-page", page: i, rect: [i, 1, 2, i], run: i });
  cases.push(null, undefined, "str", 5, [], {}, { kind: "document", extra: 1 });
  try {
    setLeanExtent(false);
    const want = cases.map((c) => canonicalExtent(c));
    setLeanExtent(true);
    for (let i = 0; i < cases.length; i++) assert.equal(canonicalExtent(cases[i]), want[i], JSON.stringify(cases[i]));
  } finally { setLeanExtent(false); }
  /* and the base spelling is canonicalJson's of the arm's object, for the shape the reader produces */
  assert.equal(canonicalExtent({ kind: "doc-para", para: 3, run: 9 }), canonicalJson({ kind: "doc-para", para: 3, run: 9 }));
});

/* ---- (D) utf8Bytes ---- */
test("PROTO_LEAN_LAND utf8Bytes: the count equals TextEncoder's for ASCII, 2-, 3-, 4-byte characters, surrogate pairs and lone surrogates", () => {
  const enc = new TextEncoder();
  const parts = ["a", "é", "日", "😀", "\ud800", "\udc00", "\ud83d", "\ude00", "\u0000", "߿", "ࠀ", "￿", "\ud800\ud800", "\udc00\ud800"];
  seed = 99;
  for (let i = 0; i < 20000; i++) {
    let s = ""; const n = Math.floor(rnd() * 12);
    for (let k = 0; k < n; k++) s += pick(parts);
    assert.equal(utf8BytesOf(s), enc.encode(s).length, JSON.stringify(s));
  }
  const big = "x😀é日".repeat(100000);
  assert.equal(utf8BytesOf(big), enc.encode(big).length);
  assert.equal(utf8BytesOf(""), 0);
});

/* ---- (E) isUnitLine ---- */
test("PROTO_LEAN_FLAT isUnitLine: the same answer with and without the flag over generated lines", () => {
  const words = ["Department", "of", "Public", "Works", "Division", "the", "City", "Unit", "Bureau", "12", "3.", "Café", "日本", "of", "OF", "Office", "Budget", "-", "Team", "a1"];
  seed = 7;
  const cases = [];
  for (let i = 0; i < 20000; i++) { const n = Math.floor(rnd() * 12); cases.push(Array.from({ length: n }, () => pick(words)).join(pick([" ", "  ", "\t", "  "]))); }
  try {
    setLeanLines({});
    const want = cases.map((c) => isUnitLine(c));
    setLeanLines({ PROTO_LEAN_FLAT: "1" });
    for (let i = 0; i < cases.length; i++) assert.equal(isUnitLine(cases[i]), want[i], cases[i]);
    assert.ok(want.some(Boolean) && want.some((x) => !x));
  } finally { setLeanLines({}); }
});

/* ---- (F) the detect pass: same answers ---- */
test("PROTO_LEAN_FLAT doctypeFor: the same answer (type, confidence, signals, considered, also, work) with and without the flag", () => {
  const texts = [lines(3000), multiByte(), "Staff Directory\n" + Array.from({ length: 300 }, (_, i) => `Jane Doe${i}, Director of Public Works, jane${i}@city.gov (510) 555-${String(1000 + i)}`).join("\n"),
    "MINUTES OF THE REGULAR MEETING\nCall to order\n" + Array.from({ length: 400 }, (_, i) => `${i}. Councilmember Smith moved to approve item ${i}; seconded; passed 7-0.`).join("\n"),
    "AGENDA\n" + Array.from({ length: 200 }, (_, i) => `Item ${i}: Consent calendar`).join("\n"), "", "short"];
  const show = (r) => JSON.stringify(r, (k, v) => (typeof v === "function" ? undefined : v));
  try {
    setLeanFlat({}); setLeanLines({});
    const want = texts.map((t) => show(doctypeFor({ text: t })));
    setLeanFlat({ PROTO_LEAN_FLAT: "1" }); setLeanLines({ PROTO_LEAN_FLAT: "1" });
    texts.forEach((t, i) => assert.equal(show(doctypeFor({ text: t })), want[i], `text ${i}`));
    /* the same ctx object asked twice, and two passes in a row, stay equal */
    texts.forEach((t, i) => { const ctx = { text: t }; assert.equal(show(doctypeFor(ctx)), want[i]); assert.equal(show(doctypeFor(ctx)), want[i]); });
  } finally { setLeanFlat({}); setLeanLines({}); }
});

/* ---- the whole read, in pieces: rows, state and digest ---- */
async function run(body, env) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: homesOver(rows) });
  bundle(w.s, "INFO-1");
  const bytes = new TextEncoder().encode(body), d = sha(bytes);
  rows.set(d, { bundleId: "INFO-1", path: "log.txt", encoding: "binary", bytes: bytes.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: true });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  const orig = console.log; console.log = () => {};
  let n = 0, a, calls = 0;
  try { do { a = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env }); calls++; } while (a.more === true && ++n < 800); } finally { console.log = orig; }
  const state = { ...w.one(`SELECT * FROM capture_text_state WHERE capture_sha=?`, d) };
  const units = w.rows(`SELECT seq,extent_kind,extent,text,ref,kind,chain_kind,truncated FROM capture_text WHERE capture_sha=? ORDER BY seq`, d).map((r) => [r.seq, r.extent_kind, r.extent, r.text, r.ref, r.kind, r.chain_kind, r.truncated]);
  const rd = w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d);
  const shas = rd ? JSON.stringify(JSON.parse(rd.reading)).match(/"text_sha256":"[0-9a-f]{64}"/g) : null;
  return { state, units, shas, calls };
}
const strip = (s) => { const o = { ...s }; delete o.updated_at; delete o.at; delete o.read_at; return o; };

for (const [label, body] of [["a 12,000-line text", lines(12000)], ["very long lines", longLines()], ["a multi-byte text", multiByte()]]) {
  for (const piece of ["4096", "512"]) {
    test(`PROTO_LEAN_LAND / PROTO_LEAN_FLAT (${label}, pieces of ${piece}): rows, state and text_sha256 equal the unset run`, async () => {
      const env0 = { PROTO_PIECE_UNITS: piece };
      const base = await run(body, env0);
      assert.ok(base.units.length > 50 && base.shas && base.shas.length >= 1);
      if (piece === "512") assert.ok(base.calls > 3, "read in several pieces");
      for (const flags of [{ PROTO_LEAN_LAND: "1" }, { PROTO_LEAN_FLAT: "1" }, { PROTO_LEAN_LAND: "1", PROTO_LEAN_FLAT: "1" }, { PROTO_LEAN_LAND: "0", PROTO_LEAN_FLAT: "0" }]) {
        const r = await run(body, { ...env0, ...flags });
        assert.deepEqual(r.units, base.units, `rows for ${JSON.stringify(flags)}`);
        assert.deepEqual(strip(r.state), strip(base.state), `state for ${JSON.stringify(flags)}`);
        assert.deepEqual(r.shas, base.shas, `text_sha256 for ${JSON.stringify(flags)}`);
        assert.equal(r.calls, base.calls);
      }
      setLeanLand({}); setLeanFlat({}); setLeanLines({});
    });
  }
}

/* ---- (B) an earlier unit holds the address: appending a piece whose addresses overlap the rows already landed ---- */
test("PROTO_LEAN_LAND append: units whose address an earlier piece holds are counted unaddressable and not written, as the per-unit SELECT did", () => {
  const out = [];
  for (const flag of [{}, { PROTO_LEAN_LAND: "1" }]) {
    setLeanLand(flag);
    const w = fresh({});
    bundle(w.s, "INFO-1");
    const sha1 = "a".repeat(64);
    const mk = (from, to) => Array.from({ length: to - from }, (_, i) => ({ extent: { kind: "doc-para", para: from + i, run: null }, text: `unit ${from + i} é`, seq: from + i }));
    const first = w.x.indexUnits("INFO-1", sha1, mk(0, 600), null, { more: { more: true, cursor: "c1" } });
    /* overlap: 400..1000 (200 held), plus a repeated address inside the piece and one unit with an extent that names no kind */
    const second = [...mk(400, 1000), { extent: { kind: "doc-para", para: 700, run: null }, text: "dup in piece", seq: 5000 }, { extent: {}, text: "no kind", seq: 5001 }];
    const again = w.x.indexUnits("INFO-1", sha1, second, null, { append: true, batchKey: "p2" });
    const rows = w.rows(`SELECT seq,extent_kind,extent,text,ref,kind,chain_kind,truncated FROM capture_text WHERE capture_sha=? ORDER BY seq`, sha1).map((r) => Object.values(r));
    const st = { ...w.one(`SELECT * FROM capture_text_state WHERE capture_sha=?`, sha1) };
    out.push({ first, again, rows, st: strip(st) });
  }
  setLeanLand({});
  assert.equal(out[0].again.unaddressable >= 200, true, "the base counts the held ones");
  assert.deepEqual(out[1].rows, out[0].rows);
  assert.deepEqual(out[1].st, out[0].st);
  assert.deepEqual(JSON.parse(JSON.stringify(out[1].again)), JSON.parse(JSON.stringify(out[0].again)));
  assert.deepEqual(JSON.parse(JSON.stringify(out[1].first)), JSON.parse(JSON.stringify(out[0].first)));
});

test("PROTO_LEAN_LAND append: mixed kinds, addresses with unicode, a surrogate pair and a NUL (left to the per-unit SELECT) behave as without the flag", () => {
  const out = [];
  for (const flag of [{}, { PROTO_LEAN_LAND: "1" }]) {
    setLeanLand(flag);
    const w = fresh({});
    bundle(w.s, "INFO-1");
    const sha1 = "b".repeat(64);
    const sheets = ["Sheet1", "日本語", "emoji😀", "nul\u0000x", "Sheet1"];
    const mk = (from, to) => Array.from({ length: to - from }, (_, i) => {
      const n = from + i;
      return n % 3 === 0 ? { extent: { kind: "doc-para", para: n, run: null }, text: `p ${n}`, seq: n }
        : { extent: { kind: "sheet-cell", sheet: sheets[n % sheets.length], cell: `A${1 + (n % 40)}` }, text: `c ${n}`, seq: n };
    });
    w.x.indexUnits("INFO-1", sha1, mk(0, 300), null, { more: { more: true, cursor: "c1" } });
    const again = w.x.indexUnits("INFO-1", sha1, mk(150, 500), null, { append: true, batchKey: "p2" });
    const rows = w.rows(`SELECT seq,extent_kind,extent,text,ref,kind,chain_kind,truncated FROM capture_text WHERE capture_sha=? ORDER BY seq`, sha1).map((r) => Object.values(r));
    out.push({ again: JSON.parse(JSON.stringify(again)), rows, st: strip({ ...w.one(`SELECT * FROM capture_text_state WHERE capture_sha=?`, sha1) }) });
  }
  setLeanLand({});
  assert.ok(out[0].again.unaddressable > 50, `held ones counted: ${out[0].again.unaddressable}`);
  assert.deepEqual(out[1], out[0]);
});
