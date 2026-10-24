/* content, fix round 9 (T51; K4831, K4837, K4910): a capture's held units read whole and as one rule (R46, R61), the part's kind named (R58, R1's `doc-part`),
   a capture cited and read by its whole digest (R59), and a partial reading said to be searched only so far (R60). Every test drives `content` at its interface; the
   units are what `extraction.unitsOf` answers (R36, R93, R107: a page and `next`, `state`, `counts`, each unit's `kind` and `lineRows`), stood in by the test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, bucket, V, sha, infoMd, provDoc, LAYER, onePagePdf } from "./fixture.mjs";
import {
  canonicalExtent, describeExtent, checkContentExtent, extentRelation, mintUndetermined, CONTENT_EXTENT_KINDS,
  PART_KIND_WORDS, HELD_TEXT_CHARS_MAX,
} from "../../../src/content/index.mjs";
import { heldTextAt, normUnits } from "../../../src/content/notice.mjs";

const DOC = "INFO-2026-0001-a", NEW = "INFO-2026-0002-b";
const P = (page, rect) => ({ kind: "pdf-page", page, ...(rect ? { rect } : {}) });
/** A unit as extraction answers it: the extent as the reader emitted it (an object), its `seq`, and any `kind`, `lineRows`, `run`. */
const U = (extent, text, seq, more = {}) => ({ extent, ref: `u${seq}`, text, truncated: false, seq, ...more });
const SHEET = (range) => ({ kind: "sheet-range", sheet: "S", range });
const PARA = (para, run) => ({ kind: "doc-para", para, ...(run === undefined ? {} : { run }) });
const PART = { kind: "doc-part", part: "word/footnotes.xml", ref: "fn:3" };

/** Make `w`'s extraction answer `sha`'s units a page at a time, as `unitsOf` does (`after`, `maxBytes`, `next`), with the index's own `state` and any
 *  `counts`, `read_through`, `total`; every other capture as the fixture answers it. Answers the list of calls made. */
function pages(w, sha, all, { state = "whole", counts = null, size = 2, extra = {} } = {}) {
  const calls = [], other = w.content.extraction.unitsOf;
  w.content.extraction.unitsOf = (s, opts = {}) => {
    if (s !== sha) return other(s, opts);
    calls.push({ after: opts.after ?? null });
    const from = Number.isInteger(opts.after) ? opts.after : -1;
    const rest = all.filter((u) => u.seq > from), page = rest.slice(0, size);
    return { capture_sha: s, units: page, ...(rest.length > size ? { next: page.at(-1).seq } : {}), state, ...(counts ? { counts } : {}), ...extra };
  };
  return calls;
}
function setup({ units = [], state = "whole", counts = null, size = 2, facts = {}, extra = {} } = {}) {
  const w = world();
  const a = w.cap("a");
  w.doc(DOC, [a]);
  w.read(a.sha, { chain: LAYER, pageCount: 3, ...facts });
  const calls = pages(w, a.sha, units, { state, counts, size, extra });
  const mint = (e) => w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: V("bo") });
  return { w, a, calls, mint, id: (e) => { const m = mint(e); assert.equal(m.ok, true, JSON.stringify(m)); return m.content_id; } };
}

/* ------------------------------------------------------------------------------------------------------------------ R61, R46 */

test("R61: a document extent's text is the units' lines once each: a sheet block's repeated first line (its lineRows naming the sheet's first row again) is dropped, a quoted line break's lines kept", () => {
  /* the blocks of a sheet over the unit cap (reading-pipeline R41, R47): each later block repeats the header, naming the sheet's first row first */
  const units = [
    U(SHEET("A1:B3"), "h1\th2\na\tb\nc\td", 0, { kind: "body", lineRows: [1, 2, 3] }),
    U(SHEET("A4:B6"), "h1\th2\ne\tf\ng\th", 1, { kind: "body", lineRows: [1, 4, 5] }),
    U(SHEET("A6:B7"), "h1\th2\ni\tj\nk\tl", 2, { kind: "body", lineRows: [1, 6, 7] }),
  ];
  const s = setup({ units, size: 10 });
  assert.equal(s.w.content.passageText(s.id({ kind: "document" })), "h1\th2\na\tb\nc\td\ne\tf\ng\th\ni\tj\nk\tl");
  /* a record's quoted line break: every line of it carries its row, and only a block's FIRST line can repeat */
  const multi = [
    U(SHEET("A1:B2"), "h\nx\ny", 0, { lineRows: [1, 2, 2] }),
    U(SHEET("A2:B4"), "h\nz\nw", 1, { lineRows: [1, 2, 3] }),
  ];
  const m = setup({ units: multi, size: 10 });
  assert.equal(m.w.content.passageText(m.id({ kind: "document" })), "h\nx\ny\nz\nw", "the record's lines kept across the cut");
  /* a header-only repeat (a block that holds nothing but the header) adds no blank line */
  const empty = [U(SHEET("A1:B2"), "h\nx", 0, { lineRows: [1, 2] }), U(SHEET("A3:B3"), "h", 1, { lineRows: [1] }), U(SHEET("A4:B4"), "h\ny", 2, { lineRows: [1, 3] })];
  const e = setup({ units: empty, size: 10 });
  assert.equal(e.w.content.passageText(e.id({ kind: "document" })), "h\nx\ny");
  /* two sheets each keep their own header once */
  const two = [U({ ...SHEET("A1:A2"), sheet: "One" }, "o\n1", 0, { lineRows: [1, 2] }), U({ ...SHEET("A1:A2"), sheet: "Two" }, "t\n2", 1, { lineRows: [1, 2] })];
  const t = setup({ units: two, size: 10 });
  assert.equal(t.w.content.passageText(t.id({ kind: "document" })), "o\n1\nt\n2");
});

test("R61: controls: units that state no lineRows, and units that are not a sheet, are joined as R46 states: one line feed between, nothing dropped", () => {
  const plain = [U(P(0), "same", 0), U(P(1), "same", 1), U(P(2), "same", 2)];
  const s = setup({ units: plain, size: 10 });
  assert.equal(s.w.content.passageText(s.id({ kind: "document" })), "same\nsame\nsame");
  const noRows = [U(SHEET("A1:B2"), "h\nx", 0), U(SHEET("A3:B3"), "h\ny", 1)];
  const n = setup({ units: noRows, size: 10 });
  assert.equal(n.w.content.passageText(n.id({ kind: "document" })), "h\nx\nh\ny", "a block that names no rows cannot be told from a data line, so nothing is dropped");
  /* a 127 KiB sheet is one unit and passes through whole */
  const one = [U(SHEET("A1:B3"), "h\nx\ny", 0, { lineRows: [1, 2, 3] })];
  const o = setup({ units: one, size: 10 });
  assert.equal(o.w.content.passageText(o.id({ kind: "document" })), "h\nx\ny");
});

test("R61: heldTextAt, pure, is the one rule: the text R31 grades a document by is the text passageText reads", () => {
  const held = normUnits({ units: [U(SHEET("A1:B2"), "h\nx", 0, { lineRows: [1, 2] }), U(SHEET("A3:B3"), "h\ny", 1, { lineRows: [1, 3] })], state: "whole" });
  assert.equal(heldTextAt({ kind: "document" }, held).text, "h\nx\ny");
  assert.equal(heldTextAt({ kind: "document" }, { ...held, state: "partial" }).text, null);
});

test("R46: an element carried as chunks (run 0, 1, ...) is its chunks in order, joined with nothing (a seam's overlap is a field, never text), as a paragraph, in a document, and by one chunk's run", () => {
  const units = [
    U(PARA(2), "paragraph two", 0), U(PARA(3, 0), "chunk zero ", 1), U(PARA(3, 1), "chunk one ", 2, { overlap: "zero chunk" }),
    U(PARA(3, 2), "tail", 3, { overlap: "one" }), U(PARA(4), "paragraph four", 4),
  ];
  const s = setup({ units, size: 10, facts: { containerExtent: { container: "docx", levels: ["paragraphs"], paragraphs: 10 } } });
  const text = (e) => s.w.content.passageText(s.id(e));
  assert.equal(text(PARA(3)), "chunk zero chunk one tail", "the element whole, the overlap counted once");
  assert.equal(text(PARA(3, 1)), "chunk one ", "one chunk named by its run");
  assert.equal(text(PARA(2)), "paragraph two");
  assert.equal(text({ kind: "document" }), "paragraph two\nchunk zero chunk one tail\nparagraph four", "chunks joined with nothing, elements with a line feed");
  /* a gap, or a start past run 0, is not the element whole */
  const gap = setup({ units: [U(PARA(3, 0), "a", 0), U(PARA(3, 2), "c", 1)], size: 10 });
  assert.equal(gap.w.content.passageText(gap.id(PARA(3))), null);
  const late = setup({ units: [U(PARA(3, 1), "b", 0)], size: 10 });
  assert.equal(late.w.content.passageText(late.id(PARA(3))), null);
  /* a chunked element read from an index that is not whole may lack its last chunk: not held; an unchunked one still is */
  const partial = setup({ units: units, state: "partial", size: 10 });
  assert.equal(partial.w.content.passageText(partial.id(PARA(3))), null);
  assert.equal(partial.w.content.passageText(partial.id(PARA(2))), "paragraph two");
});

test("R46 (R31): a chunked element is one passage on both sides of a version grade: identical chunks are A, never read as a first chunk alone", () => {
  const w = world();
  const a = w.cap("a", "old"), b = w.cap("b", "new");
  w.doc(DOC, [a]); w.doc(NEW, [b]);
  const chunks = (t) => [U(PARA(0, 0), `${t} one `, 0), U(PARA(0, 1), `${t} two `, 1), U(PARA(0, 2), "three", 2)];
  w.read(a.sha, { chain: LAYER, pageCount: 1, containerExtent: { container: "docx", levels: ["paragraphs"], paragraphs: 3 } }, chunks("same"));
  w.read(b.sha, { chain: LAYER, pageCount: 1, containerExtent: { container: "docx", levels: ["paragraphs"], paragraphs: 3 } }, chunks("same"));
  w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: a.sha, retrieved: "2026-09-01T00:00:00Z" });
  w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: b.sha, retrieved: "2026-09-20T00:00:00Z" });
  const id = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: PARA(0), mintedBy: V("bo") }).content_id;
  const n = w.content.passageNotice({ contentId: id, viewer: V("bo") });
  assert.deepEqual([n.candidates[0].grade, n.affects], ["A", "unaffected"]);
  /* edited in its second chunk: the whole element differs, and it is graded as one passage, not as the first chunk (which is unchanged) */
  w.ex.units[b.sha] = { units: [U(PARA(0, 0), "same one ", 0), U(PARA(0, 1), "entirely different words here ", 1), U(PARA(0, 2), "three", 2)], state: "whole" };
  const m = w.content.passageNotice({ contentId: id, viewer: V("bo") });
  assert.notEqual(m.candidates[0].grade, "A", "the first chunk alone is unchanged, the element is not");
});

test("R46: the units of a reading of more than one page are read page by page to the last (never the first page alone); a reading read past what an object may hold is partial, said so", () => {
  const units = Array.from({ length: 9 }, (_, i) => U(P(i), `page ${i}`, i));
  const s = setup({ units, size: 2, facts: { pageCount: 9 } });
  assert.equal(s.w.content.passageText(s.id({ kind: "document" })), units.map((u) => u.text).join("\n"));
  assert.equal(s.calls.length, 5, "five pages of two, then one");
  assert.deepEqual(s.calls.map((c) => c.after), [null, 1, 3, 5, 7], "each asked after the last `seq` of the one before");
  assert.equal(s.w.content.passageText(s.id(P(8))), "page 8", "a unit on the last page");
  /* a page that makes no progress ends the read: partial, never an endless loop */
  const w2 = setup({ units, size: 2, facts: { pageCount: 9 } });
  let n = 0;
  w2.w.content.extraction.unitsOf = () => (n++ ? { units: [], state: "whole", next: 0 } : { units: units.slice(0, 2), state: "whole", next: 1 });
  assert.equal(w2.w.content.passageText(w2.id({ kind: "document" })), null);
  /* the bound on what is held: three units of 17 million characters pass 32 MiB at the second page */
  const big = [0, 1, 2].map((i) => U(P(i), "x".repeat(17_000_000), i));
  assert.ok(HELD_TEXT_CHARS_MAX < 34_000_000);
  const b = setup({ units: big, size: 1, counts: { offered: 3, written: 3 }, facts: { pageCount: 3 } });
  const held = b.w.content.passageHeld(b.id({ kind: "document" }));
  assert.equal(held.text, null);
  assert.deepEqual(held.searched, { through: 2, total: 3 }, "how far it was read, of how many written");
  assert.equal(b.calls.length, 2, "the third page is never read");
});

/* ------------------------------------------------------------------------------------------------------------------ R1 doc-part, R58 */

test("R1 (K4910): a doc-part extent is the tenth kind: canonical {kind, part, ref}, human form by key, `same` only as itself, narrower than the document, refused only when malformed, its part list undetermined", () => {
  assert.ok(CONTENT_EXTENT_KINDS["doc-part"].landed);
  const a = { kind: "doc-part", part: " word/footnotes.xml ", ref: " fn:3 " };
  assert.equal(canonicalExtent(a), canonicalExtent(PART));
  assert.deepEqual(JSON.parse(canonicalExtent(PART)), { kind: "doc-part", part: "word/footnotes.xml", ref: "fn:3" });
  assert.notEqual(canonicalExtent(PART), canonicalExtent({ ...PART, ref: "fn:4" }));
  assert.match(describeExtent(PART), /fn:3/, "the element reference, not the caller's `ref` field read as an authored human form");
  const ctx = { chain: LAYER, pageCount: 1, container: {} };
  assert.equal(checkContentExtent(PART, ctx), null);
  assert.equal(checkContentExtent({ kind: "doc-part", ref: "fn:3" }, ctx), null);
  assert.equal(checkContentExtent({ kind: "doc-part", part: "word/footnotes.xml" }, ctx), null);
  for (const bad of [{ kind: "doc-part" }, { kind: "doc-part", part: 7 }, { kind: "doc-part", part: "", ref: "" }, { kind: "doc-part", ref: ["x"] }]) {
    const r = checkContentExtent(bad, ctx);
    assert.equal(r.code, "CONTENT_EXTENT_UNREADABLE", JSON.stringify(bad));
    assert.equal(r.check, "C-45.3");
  }
  assert.equal(checkContentExtent(PART, { chain: null, pageCount: 1, container: {} }).code, "CONTENT_EXTENT_NO_CHAIN");
  assert.equal(mintUndetermined(PART, ctx).level, "part_list");
  assert.equal(extentRelation(PART, PART), "same");
  assert.equal(extentRelation({ kind: "document" }, PART), "narrower");
  assert.equal(extentRelation(PART, { kind: "document" }), "wider");
  assert.equal(extentRelation(PART, { ...PART, ref: "fn:4" }), "disjoint");
  assert.equal(extentRelation(PART, PARA(0)), "disjoint");
  assert.equal(extentRelation(PART, { kind: "chapter" }), "unreadable");
});

test("R58: a passage whose unit names a kind other than body is cited as that kind: contentRead and standings name it and the row's human form says it, read from the unit at exactly the row's extent; the kind is no part of the id", () => {
  const body = U(PARA(0), "Body paragraph about $9,000.", 0, { kind: "body" });
  const foot = U(PART, "The fee is $4,200.", 1, { kind: "footnote" });
  const s = setup({ units: [body, foot], size: 10, facts: { containerExtent: { container: "docx", levels: ["paragraphs"], paragraphs: 1 } } });
  const idFoot = s.id(PART), idBody = s.id(PARA(0));
  const f = s.w.content.contentRead({ id: idFoot, viewer: V("bo") });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.equal(f.part_kind, "footnote");
  assert.ok(f.ref.includes(PART_KIND_WORDS.footnote) && f.ref.includes("fn:3"), `ref: ${f.ref}`);
  assert.equal(s.w.content.passageText(idFoot), "The fee is $4,200.", "the passage's text is the unit at the part's extent");
  /* control: a body paragraph's citation names no kind but body, and its human form is unchanged */
  const b = s.w.content.contentRead({ id: idBody, viewer: V("bo") });
  assert.equal(b.part_kind, "body");
  assert.equal(b.ref, describeExtent(PARA(0)));
  /* the set read names it too */
  const set = s.w.content.standings([idFoot, idBody]);
  assert.deepEqual([set[idFoot].part_kind, set[idBody].part_kind], ["footnote", "body"]);
  /* a unit stored before the kind names none: null, undetermined, never read as body, the human form unchanged */
  s.w.content.extraction.unitsOf = () => ({ units: [U(PART, "The fee is $4,200.", 1)], state: "whole" });
  const old = s.w.content.contentRead({ id: idFoot, viewer: V("bo") });
  assert.equal(old.part_kind, null);
  assert.equal(old.ref, describeExtent(PART));
  /* the kind is read, not addressed: the same row (R3) whatever the unit names */
  assert.equal(s.mint(PART).content_id, idFoot);
  assert.equal(s.mint(PART).minted, false);
  /* every kind in the closed list is named */
  for (const kind of Object.keys(PART_KIND_WORDS)) {
    s.w.content.extraction.unitsOf = () => ({ units: [U(PART, "x", 1, { kind })], state: "whole" });
    assert.equal(s.w.content.contentRead({ id: idFoot, viewer: V("bo") }).part_kind, kind, kind);
  }
});

test("R58: the version notice for a footnote's row names the kind beside the extent, from the unit at exactly the row's extent", () => {
  const w = world();
  const a = w.cap("a", "old bytes"), b = w.cap("b", "new bytes");
  w.doc(DOC, [a]); w.doc(NEW, [b]);
  const foot = (text, kind) => [U(PARA(0), "body", 0, { kind: "body" }), U(PART, text, 1, kind ? { kind } : {})];
  const facts = { chain: LAYER, pageCount: 1, containerExtent: { container: "docx", levels: ["paragraphs"], paragraphs: 1 } };
  w.read(a.sha, facts); w.read(b.sha, facts);
  w.ex.units[a.sha] = { units: foot("The fee is $4,200.", "footnote"), state: "whole" };
  w.ex.units[b.sha] = { units: foot("The fee is $4,200.", "footnote"), state: "whole" };
  w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: a.sha, retrieved: "2026-09-01T00:00:00Z" });
  w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: b.sha, retrieved: "2026-09-20T00:00:00Z" });
  const mint = (e) => w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: V("bo") }).content_id;
  const n = w.content.passageNotice({ contentId: mint(PART), viewer: V("bo") });
  assert.equal(n.ok, true, JSON.stringify(n).slice(0, 300));
  assert.equal(n.part_kind, "footnote");
  assert.ok(n.ref.includes(PART_KIND_WORDS.footnote));
  assert.equal(n.candidates[0].grade, "A", "a footnote graded from its own unit");
  const body = w.content.passageNotice({ contentId: mint(PARA(0)), viewer: V("bo") });
  assert.equal(body.part_kind, "body");
  assert.equal(body.ref, describeExtent(PARA(0)));
});

/* ------------------------------------------------------------------------------------------------------------------ R60 */

/** An older capture `a` read whole and a newer capture `b` of the same address, `bUnits` its index as given. */
function versions(bIndex) {
  const w = world();
  const a = w.cap("a", "old bytes"), b = w.cap("b", "new bytes");
  w.doc(DOC, [a]); w.doc(NEW, [b]);
  const facts = { chain: LAYER, pageCount: 2 };
  w.read(a.sha, facts, [U(P(0), "kept", 0), U(P(1), "the budget was cut", 1)]);
  w.read(b.sha, facts);
  pages(w, b.sha, bIndex.units, bIndex);
  w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: a.sha, retrieved: "2026-09-01T00:00:00Z" });
  w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: b.sha, retrieved: "2026-09-20T00:00:00Z" });
  const mint = (e) => w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: V("bo") }).content_id;
  return { w, a, b, mint, notice: (e) => w.content.passageNotice({ contentId: mint(e), viewer: V("bo") }) };
}

test("R60: a notice over a half-read newer capture answers UNDETERMINED, never NOT_FOUND, and says how far it was searched, by the job row's counters", () => {
  const half = versions({ units: [U(P(0), "kept", 0)], state: "partial", counts: { offered: 12, written: 1, over_bound: 0, unaddressable: 0, truncated: 0, skipped_named: 0 } });
  const n = half.notice(P(1));
  assert.equal(n.ok, true, JSON.stringify(n).slice(0, 300));
  const c = n.candidates[0];
  assert.deepEqual([c.grade, c.affects, c.grade_reason], ["UNDETERMINED", "undetermined", "newer_text_partial"]);
  assert.deepEqual(c.searched, { through: 1, total: 12 });
  /* the job row's own figures, where the index states them, are read before the counts */
  const stated = versions({ units: [U(P(0), "kept", 0)], state: "partial", extra: { read_through: 7, total: 40 }, counts: { offered: 12, written: 1 } });
  assert.deepEqual(stated.notice(P(1)).candidates[0].searched, { through: 7, total: 40 });
  /* a document grade over a half-read newer capture is undetermined too */
  const doc = half.notice({ kind: "document" }).candidates[0];
  assert.equal(doc.grade, "UNDETERMINED");
  assert.deepEqual(doc.searched, { through: 1, total: 12 });
  /* a passage found in the part read is still found (positive evidence) and still says how far */
  const found = half.notice(P(0)).candidates[0];
  assert.equal(found.grade, "A");
  assert.deepEqual(found.searched, { through: 1, total: 12 });
  /* control: a whole reading answers as R31 states and carries no `searched` */
  const whole = versions({ units: [U(P(0), "kept", 0), U(P(1), "entirely new words", 1)], state: "whole", counts: { offered: 2, written: 2 } });
  const w = whole.notice(P(1)).candidates[0];
  assert.deepEqual([w.grade, w.affects], ["NOT_FOUND", "affected"]);
  assert.equal("searched" in w, false);
  /* never indexed: nothing was read, so nothing was searched so far */
  const none = versions({ units: [], state: null });
  assert.equal("searched" in none.notice(P(1)).candidates[0], false);
});

test("R60: contentContextFor and the passage text carry `searched` for a reading not whole, and neither for one that is whole", () => {
  const half = setup({ units: [U(P(0), "first", 0), U(P(1), "second", 1)], state: "partial", counts: { offered: 5, written: 2 }, size: 10 });
  assert.deepEqual(half.w.content.contentContextFor(half.a.sha).searched, { through: 2, total: 5 });
  const held = half.w.content.passageHeld(half.id(P(1)));
  assert.equal(held.text, "second", "a passage held whole at its extent is still read from a partial index");
  assert.deepEqual(held.searched, { through: 2, total: 5 });
  const doc = half.w.content.passageHeld(half.id({ kind: "document" }));
  assert.deepEqual([doc.text, doc.reason, doc.searched], [null, "cited_text_partial", { through: 2, total: 5 }]);
  assert.equal(half.w.content.passageText(half.id(P(1))), "second", "passageText is the text");
  /* control */
  const whole = setup({ units: [U(P(0), "first", 0), U(P(1), "second", 1)], state: "whole", counts: { offered: 2, written: 2 }, size: 10 });
  assert.equal("searched" in whole.w.content.contentContextFor(whole.a.sha), false);
  const wh = whole.w.content.passageHeld(whole.id(P(1)));
  assert.deepEqual([wh.text, "searched" in wh], ["second", false]);
});

/* ------------------------------------------------------------------------------------------------------------------ R59 */

/** A document of DOC holding one capture in parts: the whole `text`, cut into `cuts`, the register naming the whole and its parts (provenance R75). */
function multipart(w, id, parts) {
  const bytes = Buffer.concat(parts.map((p) => Buffer.from(p)));
  const whole = sha(bytes);
  const files = parts.map((p, i) => ({ path: `snapshots/big.part${String(i + 1).padStart(3, "0")}`, text: "", blobSha: sha(p), part: p }));
  const prov = { documents: [{ ...provDoc({ path: "snapshots/big", text: "", sha: whole }), capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary", bytes: bytes.length },
                              parts: files.map((f, i) => ({ file: f.path, sha256: f.blobSha, bytes: parts[i].length })) }] };
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `k${Math.random().toString(16).slice(2)}`, author: "member:alice",
    files: [{ path: "bundle.md", text: infoMd(id) }, { path: "data/provenance.json", text: JSON.stringify(prov, null, 2) }],
    meta: { object_type: "information" },
    register: [{ sha256: whole, path: "snapshots/big", encoding: "binary", bytes: bytes.length,
                 parts: files.map((f, i) => ({ sha256: f.blobSha, path: f.path, bytes: parts[i].length })) }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  return { whole, bytes, partShas: parts.map(sha) };
}

test("R59: a capture is cited by its whole digest: a part's digest is no capture and answers NO_BYTES_HELD, the whole's resolves; a capture held whole is cited as before", () => {
  const w = world();
  const { whole, partShas } = multipart(w, DOC, ["part one ".repeat(40), "part two ".repeat(40)]);
  w.read(whole, { chain: LAYER, pageCount: 2 });
  const byPart = w.content.resolveCitation({ target: DOC, extent_capture: partShas[0], extent: P(0) });
  assert.deepEqual([byPart.content_id, byPart.null_case], [null, "NO_BYTES_HELD"], "a part's digest is no capture");
  assert.equal(w.content.captureFor(DOC, partShas[1]), null);
  const byWhole = w.content.resolveCitation({ target: DOC, extent_capture: whole, extent: P(0) });
  assert.equal(typeof byWhole.content_id, "string", JSON.stringify(byWhole));
  assert.equal(w.content.captureFor(DOC), whole, "the bundle's first-held capture is the whole");
  assert.equal(w.row(`SELECT capture_sha FROM content WHERE content_id=?`, byWhole.content_id).capture_sha, whole);
  const refused = w.content.citationRefusals([{ target: DOC, extent_capture: partShas[0], extent: P(1) }], "leg");
  assert.equal(refused.length, 1);
  assert.equal(refused[0].code, "CONTENT_EXTENT_NO_CHAIN", "no capture held under that digest: the part of a document with no held capture (R27)");
  /* control: a capture held whole is cited as before */
  const w2 = world();
  const c = w2.cap("c");
  w2.doc(DOC, [c]);
  w2.read(c.sha, { chain: LAYER, pageCount: 1 });
  assert.equal(typeof w2.content.resolveCitation({ target: DOC, extent_capture: c.sha, extent: P(0) }).content_id, "string");
  assert.equal(w2.content.contentMint({ bundleId: DOC, extent: P(0), mintedBy: V("bo"), viewer: V("bo") }).capture_sha, c.sha);
});

test("R59: the crop reads a capture's bytes by its whole digest through readRange (handed in), a range at a time to the end, never by resolving a part", async () => {
  const pdf = onePagePdf();
  const pdfSha = sha(Buffer.from(pdf));
  const w = world({ evidence: bucket({}) });
  w.doc(DOC, [w.cap("a")]);
  w.read(pdfSha, { pageCount: 1, containerExtent: { container: "pdf", levels: [], images: [{ page: 0, rect: [0, 0, 3, 2] }] } });
  const id = w.content.mint({ bundleId: DOC, captureSha: pdfSha, extent: { kind: "image", page: 0, rect: [0, 0, 3, 2] }, mintedBy: V("bo") }).content_id;
  const asked = [];
  /* a store that holds no object under the whole digest: only a range reader that knows the parts could answer */
  w.content.readRange = async (store, s, offset, length) => {
    asked.push([s, offset, length, typeof store.core.evidenceStore, typeof store.provenance]);
    return new Uint8Array(pdf.subarray(offset, offset + length));
  };
  const r = await w.content.cropOf({ contentId: id, viewer: V("bo") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.capture_sha256, pdfSha);
  assert.deepEqual(asked.map((a) => a[0]), [pdfSha, ...asked.slice(1).map(() => pdfSha)], "every read by the whole digest");
  assert.deepEqual(asked[0].slice(1, 3), [0, 8 * 1048576]);
  assert.deepEqual(asked.at(-1).slice(3), ["function", "object"], "the record's store and provenance are what readRange is handed");
  /* a capture readRange does not hold is not held, stated as before */
  w.content.readRange = async () => ({ ok: false, reason: "NOT_HELD" });
  assert.equal((await w.content.cropOf({ contentId: id, viewer: V("bo") })).reason, "CROP_CAPTURE_NOT_HELD");
  w.content.readRange = async () => { throw new Error("store failed"); };
  assert.equal((await w.content.cropOf({ contentId: id, viewer: V("bo") })).reason, "CROP_CAPTURE_NOT_HELD", "never a throw");
});

test("R59: a capture held only in parts is cropped from its whole digest through the real readRange, across the parts the register names", async () => {
  const pdf = onePagePdf();
  const cut = [Math.floor(pdf.length / 3), Math.floor((2 * pdf.length) / 3)];
  const parts = [pdf.subarray(0, cut[0]), pdf.subarray(cut[0], cut[1]), pdf.subarray(cut[1])].map((p) => Buffer.from(p));
  const objects = Object.fromEntries(parts.map((p) => [`bio/captures/${sha(p)}`, p]));
  const w = world({ evidence: bucket(objects) });
  const { whole } = multipart(w, DOC, parts);
  assert.equal(whole, sha(Buffer.from(pdf)));
  assert.equal(w.prov.partsOf(whole).length, 3, "the register names the three parts");
  w.read(whole, { pageCount: 1, containerExtent: { container: "pdf", levels: [], images: [{ page: 0, rect: [0, 0, 3, 2] }] } });
  const id = w.content.mint({ bundleId: DOC, captureSha: whole, extent: { kind: "image", page: 0, rect: [0, 0, 3, 2] }, mintedBy: V("bo") }).content_id;
  const r = await w.content.cropOf({ contentId: id, viewer: V("bo") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.capture_sha256, whole);
});

test("R1, R3 (K4913): content's canonical form for a doc-part is text-chain's, and a content id over it is the one minted before the arm moved", async () => {
  const tc = await import("../../../src/textchain.mjs");
  const { contentIdFor: idFor } = await import("../../../src/content/index.mjs");
  const xs = [PART, { kind: "doc-part", part: " p ", ref: " r " }, { kind: "doc-part", ref: "r" }, { kind: "doc-part", part: "p" }, { kind: "doc-part", part: "", ref: "" }, { kind: "doc-part" }];
  for (const x of xs) assert.equal(canonicalExtent(x), tc.canonicalExtent(x), JSON.stringify(x));
  /* pinned from before the move (content's own arm): the ids of the first four shapes */
  assert.deepEqual(xs.slice(0, 4).map((x) => idFor("a".repeat(64), x, null).slice(0, 12)), ["a33870be253e", "e6cc3ada024e", "8118ded0a641", "c93b659ef24a"]);
});
