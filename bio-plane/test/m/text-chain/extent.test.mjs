/* text-chain: requirement-named tests for the content-extent algebra (build/requirements/text-chain.md R92-R98),
 * copied here from the check catalogue in T19 (draft-T19 line 28). While the catalogue keeps its copy the two must
 * answer alike: every content id is taken over `canonicalExtent`, so the parity sweep below is part of R97. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CONTENT_EXTENT_KINDS, CONTENT_EXTENT_A1_RE, CONTENT_EXTENT_RANGE_RE, a1ToRowCol, rangeCorners, canonicalRange,
  contentCitedAs, canonicalExtent, describeExtent,
} from "../../../src/textchain.mjs";
import * as catalogue from "../../../checks/bio-checks.mjs";
import { canonicalJson } from "../../../src/record-grammar/index.mjs";

const KINDS = ["document", "pdf-page", "sheet-cell", "slide-shape", "doc-para", "sheet-range", "doc-table", "image"];
const JUNK = [undefined, null, 0, 1, -1, 1.5, NaN, "", " ", "x", true, [], {}, [1, 2], Symbol.for("s"), () => 1,
  Object.create(null)];
/* A message for any input, a prototype-less object and a symbol included. */
const label = (x) => { try { return typeof x === "symbol" ? "symbol" : JSON.stringify(x) ?? String(x); } catch { return "(no string form)"; } };
/* The catalogue's answer, or the exception it throws instead (its copy is not total; this one is, R83). */
const theirs = (fn, ...a) => { try { return { value: fn(...a) }; } catch (e) { return { threw: e }; } };

test("R92: CONTENT_EXTENT_KINDS is the eight landed kinds, in order, each with its human phrase; dom is not one", () => {
  assert.equal(Object.getPrototypeOf(CONTENT_EXTENT_KINDS), Object.prototype);
  assert.deepEqual(Object.keys(CONTENT_EXTENT_KINDS), KINDS);
  assert.deepEqual(CONTENT_EXTENT_KINDS, {
    document: { landed: true, human: "the whole document" },
    "pdf-page": { landed: true, human: "a page of a PDF" },
    "sheet-cell": { landed: true, human: "a cell of a spreadsheet" },
    "slide-shape": { landed: true, human: "a shape on a slide" },
    "doc-para": { landed: true, human: "a paragraph of a document" },
    "sheet-range": { landed: true, human: "a range of cells in a spreadsheet" },
    "doc-table": { landed: true, human: "a table in a document" },
    image: { landed: true, human: "an image in a document" },
  });
  assert.equal(Object.hasOwn(CONTENT_EXTENT_KINDS, "dom"), false);
});

test("R93: the A1 cell and range patterns match exactly the stated shapes", () => {
  const cells = ["A1", "b14", "$B$14", "$b14", "B$14", "ZZZ9999999", "xfd1048576", "AB10"];
  const notCells = ["", "A", "1", "A0", "A01", "AAAA1", "A10000000", "1A", "A1:B2", " A1", "A1 ", "$$A1", "A$$1", "A-1", "Ä1"];
  for (const c of cells) { assert.ok(CONTENT_EXTENT_A1_RE.test(c), c); assert.ok(CONTENT_EXTENT_RANGE_RE.test(c), c); }
  for (const c of notCells.filter((x) => x !== "A1:B2")) {
    assert.equal(CONTENT_EXTENT_A1_RE.test(c), false, c);
    assert.equal(CONTENT_EXTENT_RANGE_RE.test(c), false, c);
  }
  assert.equal(CONTENT_EXTENT_A1_RE.test("A1:B2"), false);
  for (const r of ["A1:B2", "$a$1:c$10", "C3:B2", "B3:B3"]) assert.ok(CONTENT_EXTENT_RANGE_RE.test(r), r);
  for (const r of ["A1:", ":B2", "A1:B2:C3", "A:C", "2:5", "A1-B2", "A1 : B2"]) assert.equal(CONTENT_EXTENT_RANGE_RE.test(r), false, r);
});

test("R94: a1ToRowCol answers 1-based {col,row}, the column bijective base 26, $ dropped and case folded; null otherwise", () => {
  const want = { A1: [1, 1], Z1: [26, 1], AA1: [27, 1], AZ1: [52, 1], BA1: [53, 1], ZZ1: [702, 1], AAA1: [703, 1],
    XFD1048576: [16384, 1048576], ZZZ9999999: [18278, 9999999], b14: [2, 14], "$B$14": [2, 14] };
  for (const [cell, [col, row]] of Object.entries(want)) assert.deepEqual(a1ToRowCol(cell), { col, row }, cell);
  /* Every column of one and two letters, against an independent count. */
  let n = 0;
  for (const b of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") assert.equal(a1ToRowCol(`${b}1`).col, ++n);
  for (const a of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") for (const b of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") assert.equal(a1ToRowCol(`${a}${b}1`).col, ++n);
  for (const x of [...JUNK, "A0", "A01", "AAAA1", "1A", "A1:B2", " A1", "A 1"]) assert.equal(a1ToRowCol(x), null, label(x));
});

test("R95: rangeCorners orders the corners, a cell is a one-cell range; canonicalRange spells it with two corners", () => {
  assert.deepEqual(rangeCorners("B2:C3"), { r0: 2, c0: 2, r1: 3, c1: 3 });
  assert.deepEqual(rangeCorners("C3:B2"), { r0: 2, c0: 2, r1: 3, c1: 3 });
  assert.deepEqual(rangeCorners("C2:B3"), { r0: 2, c0: 2, r1: 3, c1: 3 });
  assert.deepEqual(rangeCorners(" b3 "), { r0: 3, c0: 2, r1: 3, c1: 2 });
  assert.deepEqual(rangeCorners("$Z$1:aa$20"), { r0: 1, c0: 26, r1: 20, c1: 27 });
  for (const x of [...JUNK, "A1:", "A:C", "2:5", "A1:B2:C3", "A0:B1"]) {
    assert.equal(rangeCorners(x), null, label(x));
    assert.equal(canonicalRange(x), null, label(x));
  }
  assert.equal(canonicalRange("B3"), "B3:B3");
  assert.equal(canonicalRange("B3:B3"), "B3:B3");
  assert.equal(canonicalRange("$c$10:a1"), "A1:C10");
  assert.equal(canonicalRange("az5:Ba7"), "AZ5:BA7");
  assert.equal(canonicalRange("ZZ1:AAA2"), "ZZ1:AAA2");
  /* Every spelling of one range is one string. */
  assert.equal(new Set(["A1:C10", "a1:c10", "$A$1:$C$10", "C10:A1", "c1:a10", "A10:C1"].map(canonicalRange)).size, 1);
});

test("R96: contentCitedAs is the stated value unchanged, else bytes for an image and text for any other kind", () => {
  for (const kind of KINDS) for (const v of [undefined, null, ""])
    assert.equal(contentCitedAs({ kind, cited_as: v }), kind === "image" ? "bytes" : "text", `${kind} ${v}`);
  for (const v of ["text", "bytes", "neither", 3, false, {}]) assert.equal(contentCitedAs({ kind: "doc-para", cited_as: v }), v);
  for (const x of JUNK) assert.equal(contentCitedAs(x), "text");
  assert.equal(contentCitedAs({ cited_as: "bytes" }), "bytes");
});

test("R97: canonicalExtent is canonicalJson of each arm's fixed fields, absent as null, every spelling of one address one string", () => {
  const C = (o) => canonicalJson(o);
  assert.equal(canonicalExtent({ kind: "document", page: 3, ref: "x" }), C({ kind: "document" }));
  assert.equal(canonicalExtent({ kind: "pdf-page", page: 2, rect: [10, 20, 1, 2], ref: "a" }), C({ kind: "pdf-page", page: 2, rect: [1, 2, 10, 20] }));
  for (const rect of [undefined, [1, 2, 3], [1, 2, 3, NaN], [1, 2, 3, "4"], [1, 2, 3, Infinity]])
    assert.equal(canonicalExtent({ kind: "pdf-page", page: 1.5, rect }), C({ kind: "pdf-page", page: null, rect: null }));
  assert.equal(canonicalExtent({ kind: "sheet-cell", sheet: " S1 ", cell: " $b$14 " }), C({ kind: "sheet-cell", sheet: "S1", cell: "B14" }));
  assert.equal(canonicalExtent({ kind: "sheet-cell", sheet: "  ", cell: "B0" }), C({ kind: "sheet-cell", sheet: null, cell: null }));
  assert.notEqual(canonicalExtent({ kind: "sheet-cell", sheet: "s", cell: "A1" }), canonicalExtent({ kind: "sheet-cell", sheet: "S", cell: "A1" }));
  assert.equal(canonicalExtent({ kind: "slide-shape", slide: 7, shape: 3 }), C({ kind: "slide-shape", slide: 7, shape: 3 }));
  assert.equal(canonicalExtent({ kind: "slide-shape", slide: "7" }), C({ kind: "slide-shape", slide: null, shape: null }));
  assert.equal(canonicalExtent({ kind: "doc-para", para: 0, run: 2 }), C({ kind: "doc-para", para: 0, run: 2 }));
  assert.equal(canonicalExtent({ kind: "doc-para" }), C({ kind: "doc-para", para: null, run: null }));
  assert.equal(canonicalExtent({ kind: "sheet-range", sheet: "S", range: "$c$3:b2" }), C({ kind: "sheet-range", sheet: "S", range: "B2:C3" }));
  assert.equal(canonicalExtent({ kind: "sheet-range", sheet: "S", range: 5 }), C({ kind: "sheet-range", sheet: "S", range: null }));
  assert.equal(canonicalExtent({ kind: "doc-table", table: 1, cell: "$a$2" }), C({ kind: "doc-table", table: 1, cell: "A2" }));
  assert.equal(canonicalExtent({ kind: "image", part: " Word/Media/IMG1.PNG ", page: 0, rect: [5, 5, 0, 0] }),
    C({ kind: "image", cited_as: "bytes", part: "word/media/img1.png", page: 0, rect: [0, 0, 5, 5] }));
  assert.equal(canonicalExtent({ kind: "image", cited_as: "text" }), C({ kind: "image", cited_as: "text", part: null, page: null, rect: null }));
  /* cited_as is in the image's address only. */
  assert.equal(canonicalExtent({ kind: "doc-para", para: 1, cited_as: "bytes" }), canonicalExtent({ kind: "doc-para", para: 1 }));
  /* Any other kind: a total form, never another arm's. */
  assert.equal(canonicalExtent({ kind: "dom", fields: { a: 1 } }), C({ kind: "dom", fields: { a: 1 } }));
  for (const x of JUNK) assert.equal(canonicalExtent(x), C({ kind: null, fields: null }), label(x));
  /* ref never takes part. */
  for (const kind of KINDS) assert.equal(canonicalExtent({ kind, page: 0, ref: "one" }), canonicalExtent({ kind, page: 0, ref: "two" }));
});

/* The inputs the parity sweep and R98 drive: every kind with each of its fields valid, missing and malformed. */
function* extents() {
  const vals = {
    page: [undefined, 0, 3, -1, 1.5, "2"], rect: [undefined, [0, 0, 10, 10], [10, 10, 0, 0], [1, 2, 3], [1, 2, 3, NaN]],
    sheet: [undefined, "Sheet1", " S ", "", 3], cell: [undefined, "B14", "$b$14", " c3 ", "B0", "A1:B2", 5],
    slide: [undefined, 1, 7, -1], shape: [undefined, 0, 3], para: [undefined, 0, 11, "1"], run: [undefined, 0, 2, -2],
    range: [undefined, "B2:C3", "c3:$b$2", "B3", "A:C", "", 9], table: [undefined, 0, 4, 1.5],
    part: [undefined, "word/media/image1.png", " PPT/Media/X.JPEG ", "", 7], cited_as: [undefined, null, "", "text", "bytes", "x"],
    ref: [undefined, "", "  ", " authored ", 4], fields: [undefined, { a: 1 }],
  };
  const arms = {
    document: [], "pdf-page": ["page", "rect"], "sheet-cell": ["sheet", "cell"], "slide-shape": ["slide", "shape"],
    "doc-para": ["para", "run"], "sheet-range": ["sheet", "range"], "doc-table": ["table", "cell"],
    image: ["part", "page", "rect", "cited_as"], dom: ["fields"], constructor: [], toString: [], "": [],
  };
  for (const [kind, fields] of Object.entries(arms)) {
    const combos = fields.reduce((acc, f) => acc.flatMap((o) => vals[f].map((v) => (v === undefined ? o : { ...o, [f]: v }))), [{ kind }]);
    for (const c of combos) { yield c; for (const ref of vals.ref.slice(1)) yield { ...c, ref }; }
  }
  yield* JUNK;
  yield { cited_as: "bytes" };
  yield { kind: 3, fields: "f" };
}

test("R97: canonicalExtent answers byte for byte as the catalogue's copy over every kind, field and malformation", () => {
  let n = 0;
  for (const e of extents()) {
    const t = theirs(catalogue.canonicalExtent, e);
    if (!t.threw) { assert.equal(canonicalExtent(e), t.value, label(e)); n++; }
  }
  assert.ok(n > 2000, `${n} inputs`);
  /* The pieces it is built from answer as the catalogue's too. */
  for (const x of [...JUNK, "A1", "$z$9", "AAA1", "B3:A1", " c10:a1 ", "A:C", "A0"]) {
    for (const [mine, fn] of [[a1ToRowCol, catalogue.a1ToRowCol], [rangeCorners, catalogue.rangeCorners],
      [canonicalRange, catalogue.canonicalRange], [contentCitedAs, catalogue.contentCitedAs]]) {
      const t = theirs(fn, x);
      if (t.threw) assert.equal(mine(x) === null || mine(x) === "text", true, `${mine.name}(${label(x)})`);
      else assert.deepEqual(mine(x), t.value, `${mine.name}(${label(x)})`);
    }
  }
  assert.deepEqual(CONTENT_EXTENT_KINDS, catalogue.CONTENT_EXTENT_KINDS);
  assert.equal(CONTENT_EXTENT_A1_RE.source, catalogue.CONTENT_EXTENT_A1_RE.source);
  assert.equal(CONTENT_EXTENT_RANGE_RE.source, catalogue.CONTENT_EXTENT_RANGE_RE.source);
});

test("R98: describeExtent is the authored ref, else the derived form per arm, else the kind's phrase or the unnamed sentence", () => {
  const cases = [
    [{ kind: "pdf-page", page: 3, ref: "  printed p. 4 " }, "printed p. 4"],
    [{ kind: "pdf-page", page: 3, ref: "   " }, "page 4"],
    [{ kind: "document" }, "the whole document"],
    [{ kind: "pdf-page", page: 0 }, "page 1"],
    [{ kind: "pdf-page", page: 0, rect: [0, 0, 1, 1] }, "page 1, a region of it"],
    [{ kind: "pdf-page", page: "0" }, "a page of this document"],
    [{ kind: "sheet-cell", sheet: " Sheet1 ", cell: " B14 " }, "Sheet1!B14"],
    [{ kind: "sheet-cell", sheet: "Sheet1" }, "a cell of this spreadsheet"],
    [{ kind: "doc-para", para: 11, run: 2 }, "¶12"],
    [{ kind: "doc-para" }, "a paragraph of this document"],
    [{ kind: "slide-shape", slide: 7, shape: 3 }, "slide 7"],
    [{ kind: "slide-shape", shape: 3 }, "a shape in this deck"],
    [{ kind: "sheet-range", sheet: "S", range: "c3:$b$2" }, "S!B2:C3"],
    [{ kind: "sheet-range", sheet: "S", range: "A:C" }, "a range of cells in this spreadsheet"],
    [{ kind: "doc-table", table: 0, cell: "$b$2" }, "table 1, B2"],
    [{ kind: "doc-table", table: 2 }, "table 3"],
    [{ kind: "doc-table" }, "a table in this document"],
    [{ kind: "image", part: " Word/Media/IMAGE123456789.png " }, "image word/media/i"],
    [{ kind: "image", page: 4 }, "an image on page 5"],
    [{ kind: "image" }, "an image in this document"],
    [{ kind: "dom" }, "a part of this document the record cannot name"],
    [{ kind: "constructor" }, "a part of this document the record cannot name"],
    [{ kind: "__proto__" }, "a part of this document the record cannot name"],
  ];
  for (const [e, want] of cases) assert.equal(describeExtent(e), want, JSON.stringify(e));
  for (const x of JUNK) assert.equal(describeExtent(x), "a part of this document the record cannot name");
  /* Always a non-empty string, and the catalogue's own sentence wherever the catalogue answers a string. */
  for (const e of extents()) {
    const mine = describeExtent(e);
    assert.ok(typeof mine === "string" && mine.length > 0);
    const t = theirs(catalogue.describeExtent, e);
    if (typeof t.value === "string") assert.equal(mine, t.value, label(e));
  }
});
