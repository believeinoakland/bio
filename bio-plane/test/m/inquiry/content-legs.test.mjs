/* inquiry's share of the content suites (T18): a leg's part and the capture it rests on, at the promotion and at the
   earned read. Converts inquiry's share of the old suites
     - content-extent-arms.test.mjs: shape refusals relayed as C-2.8 CONTENT_EXTENT_UNREADABLE with their sentences;
       the arms minting through the projection, one address one row; legExtent's per-arm fields; an unbounded address
       minting; op=earnedbasis at content grain for a cell;
     - content-extent.test.mjs: the projection's says/carried/minted; the C-2.8 relay per code with its translation
       (and the store gate's C-45 refusals relayed unchanged); a document leg on an unread and an uncaptured document;
       a re-read carried, never re-minted; narrowing mints anew; the same id after a purge;
     - content-reads.test.mjs: the portion row's NO_CONNECTION with its empty level and sentence; the backfill's
       exactness and its continuation over 51 legs; the two legitimate nulls' sentences;
     - rec220-version-pin.test.mjs: the pinned capture kept after a preferred later one, fresh and re-promoted; the
       author's re-pointing wins; the unpinned leg carried; earnedBasis's version shapes;
     - transcribe.test.mjs: a whole-document attestation of a chainless capture does not raise a typing through a leg.
   Driven through the real promotion (the fixture's `world()`), content's own writers where a fact must exist. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, infoMd, provDoc, sha, V } from "./fixture.mjs";
import { CONTENT_EXTENT_CHECKS, EARNED_CAPTURE_CEILING, contentIdFor } from "../../../checks/bio-checks.mjs";
import { LEG_BACKFILL_MAX } from "../../../src/inquiry/index.mjs";

/* ------------------------------------------------------------------------------------------------ helpers */

/** A leg's own fields as frontmatter scalars (the restricted grammar holds no nested object in an array element). */
const legLines = (legs) => ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role || "supports"}`,
  ...Object.entries(l.f || {}).map(([k, v]) => `    ${k}: ${v}`)])];
/** An inquiry whose legs carry extent / capture / content-id fields, each target cited. */
const md = (id, legs, { subject = null } = {}) => inquiryMd(id, { subject,
  refs: [...new Set(legs.map((l) => l.target))].map((t) => ({ target: t })), extra: legs.length ? legLines(legs) : [] });
const q = (s) => `"${s}"`;
const codes = (r) => (r.findings || []).map((f) => f.check).sort();
const codeNames = (r) => [...new Set((r.findings || []).map((f) => f.code).filter(Boolean))].sort();
const detail = (r) => (r.findings || []).map((f) => f.detail).join(" || ");

/** A scoped chain: a document whose pages each name themselves, which is what gives the capture a page set. */
const scoped = (pages, cap = "C") => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" }, extent: { kind: "pages", pages } }];
const LAYER = [{ step: "layer" }];

/** A revision of an information bundle over its head: `caps` [{path, text, chain?}] are every capture it holds
 *  (their bytes carried), `register` the new ones this revision registers. */
let revs = 0;
function redoc(w, id, caps, register = []) {
  const all = caps.map((c) => ({ ...c, sha: sha(c.text) }));
  const reading = (c) => (c.chain === undefined ? null
    : { content_type: "meeting_calendar", reader_version: 1, found: false, at: "2026-09-27T00:00:00Z", entities: [], facts: {},
        ...(c.chain === null ? {} : { text_source: c.chain }) });
  const files = [{ path: "bundle.md", text: infoMd(id) }, ...all.map((c) => ({ path: c.path, text: c.text })),
    { path: "data/provenance.json", text: JSON.stringify({ documents: all.map((c) =>
        (reading(c) ? { ...provDoc(c), reading: reading(c) } : provDoc(c))) }, null, 2) }];
  const r = w.promotion.promote({ bundleId: id, base: w.record.head(id).bundleSha, snapKey: `re-${id}-${++revs}`,
    author: "member:alice", files, meta: { object_type: "information" },
    register: all.filter((c) => register.includes(c.path))
      .map((c) => ({ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) })) });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  return all.map((c) => c.sha);
}
/** An information bundle this record holds no capture of: its document alone, through the promotion. */
function uncaptured(w, id) {
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `bare-${id}`, author: "member:alice",
    files: [{ path: "bundle.md", text: infoMd(id) }], meta: { object_type: "information" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
}
const capOf = (w, cid) => w.content.contentRow(cid)?.capture_sha ?? null;
const legOf = (r, ord) => (r.legs || []).find((l) => l.ord === ord) || null;

const BOOK = "INFO-2026-0001-book", TEXT = "INFO-2026-0002-text", DECK = "INFO-2026-0003-deck";
const PAGED = "INFO-2026-0004-paged", BARE = "INFO-2026-0005-bare", NOCAP = "INFO-2026-0006-nocap";

/* ------------------------------------------------------------------------------------------------ R11 */

test("R11 R5 check: a shape the record cannot read is BASIS_REFUSED at C-2.8 with the content family's code, its translation and the sentence saying why; nothing minted", () => {
  const w = world(); w.doc(BOOK, ["book"], { chain: LAYER }); w.doc(TEXT, ["text"], { chain: LAYER });
  w.doc(DECK, ["deck"], { chain: LAYER }); w.doc(PAGED, ["paged"], { chain: scoped([0, 1, 2]) });
  const refuse = (id, target, f) => w.promote(id, md(id, [{ target, f }]));
  const cases = [
    ["no sheet", BOOK, { extent_kind: "sheet-cell", extent_cell: q("B14") }, "CONTENT_EXTENT_UNREADABLE", /names which sheet, as the workbook spells it/],
    ["not A1", BOOK, { extent_kind: "sheet-cell", extent_sheet: q("Sheet1"), extent_cell: q("14B") }, "CONTENT_EXTENT_UNREADABLE", /A1 notation/],
    ["paragraph not an integer", TEXT, { extent_kind: "doc-para", extent_para: "two" }, "CONTENT_EXTENT_UNREADABLE", /0-based integer/],
    ["no paragraph", TEXT, { extent_kind: "doc-para" }, "CONTENT_EXTENT_UNREADABLE", null],
    ["slide 0 (1-based)", DECK, { extent_kind: "slide-shape", extent_slide: 0 }, "CONTENT_EXTENT_UNREADABLE", /1-based integer/],
    ["a shape with no slide", DECK, { extent_kind: "slide-shape", extent_shape: 2 }, "CONTENT_EXTENT_UNREADABLE", null],
    ["dom, no producer", PAGED, { extent_kind: "dom" }, "CONTENT_EXTENT_NO_PRODUCER", null],
    ["an unknown kind", PAGED, { extent_kind: "paragraph-ish" }, "CONTENT_EXTENT_UNREADABLE", null],
    ["a page naming no page", PAGED, { extent_kind: "pdf-page" }, "CONTENT_EXTENT_UNREADABLE", null],
  ];
  let i = 0;
  for (const [label, target, f, code, sentence] of cases) {
    const id = `INQ-2026-01${String(++i).padStart(2, "0")}-r`;
    const r = refuse(id, target, f);
    assert.equal(r.ok, false, label); assert.equal(r.reason, "BASIS_REFUSED", label);
    assert.deepEqual(codes(r), ["C-2.8"], `${label}: the leg grammar's rule`);
    assert.deepEqual(codeNames(r), [code], `${label}: the content family's name`);
    assert.equal(r.findings[0].translation, CONTENT_EXTENT_CHECKS[code].translation, `${label}: its translation travels`);
    if (sentence) assert.match(detail(r), sentence, label);
    assert.equal(w.record.head(id), null, `${label}: nothing written`);
  }
  /* the cell with no sheet is refused for naming no sheet, never as an unlanded kind (the arm landed) */
  assert.doesNotMatch(detail(refuse("INQ-2026-0199-r", BOOK, { extent_kind: "sheet-cell", extent_cell: q("B7") })),
    /named in the grammar and this plane cannot yet/);
  assert.equal(w.count("content"), 0, "no refused promotion minted anything");
  /* negative control: the same arms well-formed are admitted */
  assert.equal(refuse("INQ-2026-0198-ok", BOOK, { extent_kind: "sheet-cell", extent_sheet: q("Sheet1"), extent_cell: q("B14") }).ok, true);
  assert.equal(refuse("INQ-2026-0197-ok", DECK, { extent_kind: "slide-shape", extent_slide: 1 }).ok, true);
});

test("R11 check: the store gate's own content refusals are relayed at their C-45 number (outside the page set, no chain, no capture at all), naming the extent", () => {
  const w = world(); w.doc(PAGED, ["paged"], { chain: scoped([0, 1, 2]) }); w.doc(BARE, ["bare"], { chain: null });
  w.doc(BOOK, ["book"], { chain: null });
  const r = (id, target, f) => w.promote(id, md(id, [{ target, f }]));
  const oob = r("INQ-2026-0201-r", PAGED, { extent_kind: "pdf-page", extent_page: 9 });
  assert.deepEqual([oob.ok, oob.reason, codes(oob)], [false, "BASIS_REFUSED", ["C-45.1"]]);
  assert.match(detail(oob), /3 page\(s\) \(0-2\).*page 9/);
  const noChain = r("INQ-2026-0202-r", BARE, { extent_kind: "pdf-page", extent_page: 0 });
  assert.deepEqual([noChain.ok, codes(noChain)], [false, ["C-45.2"]]);
  const cellNoChain = r("INQ-2026-0203-r", BOOK, { extent_kind: "sheet-cell", extent_sheet: q("Sheet1"), extent_cell: q("B14") });
  assert.deepEqual([cellNoChain.ok, codes(cellNoChain)], [false, ["C-45.2"]], "not relayed at C-2.8");
  assert.match(detail(cellNoChain), /Sheet1!B14/);
  /* negative control: page 2 of the same set is in range */
  assert.equal(r("INQ-2026-0204-ok", PAGED, { extent_kind: "pdf-page", extent_page: 2 }).ok, true);
});

/* ------------------------------------------------------------------------------------------------ R12 */

test("R12 projection: a document leg and a page leg each mint their row, with what it says; a second citer of one passage finds it; nothing minted twice", () => {
  const w = world(); const [capP] = w.doc(PAGED, ["paged"], { chain: scoped([0, 1, 2]) });
  const whole = w.promote("INQ-2026-0301-w", md("INQ-2026-0301-w", [{ target: PAGED }]));
  assert.equal(whole.ok, true, JSON.stringify(whole).slice(0, 400));
  const [d] = whole.content;
  assert.deepEqual([whole.content.length, d.extent_kind, d.minted, d.carried, d.stale], [1, "document", true, false, false]);
  assert.equal(d.says, "the whole document, as this record holds it");
  assert.match(d.content_id, /^[0-9a-f]{64}$/);
  assert.equal(d.content_id, contentIdFor(capP, { kind: "document" }, scoped([0, 1, 2])));
  const page = w.promote("INQ-2026-0302-p", md("INQ-2026-0302-p", [{ target: PAGED,
    f: { extent_kind: "pdf-page", extent_page: 1, extent_rect: "[10, 20, 100, 200]" } }]));
  const [p] = page.content;
  assert.deepEqual([p.extent_kind, p.content_id !== d.content_id, p.minted], ["pdf-page", true, true]);
  assert.equal(p.says, "page 2, a region of it, as this record holds it", "a page counted from one for a reader");
  const again = w.promote("INQ-2026-0303-p", md("INQ-2026-0303-p", [{ target: PAGED,
    f: { extent_kind: "pdf-page", extent_page: 1, extent_rect: "[10, 20, 100, 200]", extent_ref: q("page 2, the table") } }]));
  assert.deepEqual([again.content[0].content_id, again.content[0].minted, again.content[0].carried], [p.content_id, false, false],
    "a second citer finds the row; the member's words are not in the address");
  assert.equal(w.count("content"), 2);
});

test("R12 R5 projection: each landed office arm mints through the promotion; one address one row, two addresses two; legExtent reads each arm's own fields", () => {
  const w = world(); w.doc(BOOK, ["book"], { chain: LAYER }); w.doc(TEXT, ["text"], { chain: LAYER }); w.doc(DECK, ["deck"], { chain: LAYER });
  let n = 0;
  const cite = (target, f) => { const id = `INQ-2026-04${String(++n).padStart(2, "0")}-c`;
    const r = w.promote(id, md(id, [{ target, f }])); assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400)); return r.content[0]; };
  const cell = cite(BOOK, { extent_kind: "sheet-cell", extent_sheet: q("Sheet1"), extent_cell: q("B14") });
  assert.deepEqual([cell.extent_kind, cell.minted, cell.stale], ["sheet-cell", true, false]);
  const para = cite(TEXT, { extent_kind: "doc-para", extent_para: 11 });
  assert.deepEqual([para.extent_kind, para.minted], ["doc-para", true]);
  const shape = cite(DECK, { extent_kind: "slide-shape", extent_slide: 7, extent_shape: 3 });
  assert.deepEqual([shape.extent_kind, shape.minted], ["slide-shape", true]);
  assert.equal(w.count("content"), 3);
  const same = (r, row, label) => assert.deepEqual([r.content_id === row.content_id, r.minted], [true, false], label);
  const other = (r, row, label) => assert.deepEqual([r.content_id !== row.content_id, r.minted], [true, true], label);
  same(cite(BOOK, { extent_kind: "sheet-cell", extent_sheet: q("Sheet1"), extent_cell: q("B14") }), cell, "one cell, one row");
  same(cite(BOOK, { extent_kind: "sheet-cell", extent_sheet: q("Sheet1"), extent_cell: q("$B$14") }), cell, "$B$14 is B14");
  same(cite(BOOK, { extent_kind: "sheet-cell", extent_sheet: q("Sheet1"), extent_cell: q("b14") }), cell, "b14 is B14");
  other(cite(BOOK, { extent_kind: "sheet-cell", extent_sheet: q("Sheet1"), extent_cell: q("C14") }), cell, "another cell");
  other(cite(BOOK, { extent_kind: "sheet-cell", extent_sheet: q("Sheet2"), extent_cell: q("B14") }), cell, "the sheet is in the address");
  other(cite(TEXT, { extent_kind: "doc-para", extent_para: 12 }), para, "another paragraph");
  other(cite(TEXT, { extent_kind: "doc-para", extent_para: 11, extent_run: 2 }), para, "a run narrows the address");
  other(cite(DECK, { extent_kind: "slide-shape", extent_slide: 7, extent_shape: 4 }), shape, "another shape");
  other(cite(DECK, { extent_kind: "slide-shape", extent_slide: 7 }), shape, "a whole slide is not shape 0");
  /* legExtent: each arm's own fields and no others — a stray field is not in the address */
  same(cite(TEXT, { extent_kind: "doc-para", extent_para: 11, extent_cell: q("B1") }), para, "a stray extent_cell under doc-para");
  same(cite(BOOK, { extent_kind: "sheet-cell", extent_sheet: q("Sheet1"), extent_cell: q("B14"), extent_para: 9 }), cell,
       "a stray extent_para under sheet-cell");
  assert.deepEqual(w.content.contentRow(cell.content_id).extent, { cell: "B14", kind: "sheet-cell", sheet: "Sheet1" });
  assert.deepEqual(w.content.contentRow(para.content_id).extent, { kind: "doc-para", para: 11, run: null });
  /* with no container extent held, an impossible but well-formed address mints: undetermined, never refused */
  const wild = cite(BOOK, { extent_kind: "sheet-cell", extent_sheet: q("NoSuchSheet"), extent_cell: q("ZZ9999999") });
  assert.deepEqual([wild.extent_kind, wild.minted], ["sheet-cell", true]);
  const wildP = cite(TEXT, { extent_kind: "doc-para", extent_para: 9999999 });
  assert.deepEqual([wildP.extent_kind, wildP.minted], ["doc-para", true]);
  assert.equal(w.content.contentRow(wild.content_id).page_count, null);
});

test("R12 R5 projection: a leg naming no extent, or an empty extent_kind, is the whole document — one row", () => {
  const w = world(); w.doc(PAGED, ["paged"], { chain: scoped([0, 1, 2]) });
  const a = w.promote("INQ-2026-0501-a", md("INQ-2026-0501-a", [{ target: PAGED }]));
  const b = w.promote("INQ-2026-0502-b", md("INQ-2026-0502-b", [{ target: PAGED, f: { extent_kind: q("") } }]));
  const c = w.promote("INQ-2026-0503-c", md("INQ-2026-0503-c", [{ target: PAGED, f: { extent_kind: "document", extent_page: 4, extent_ref: q("x") } }]));
  for (const r of [a, b, c]) assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([b.content[0].extent_kind, b.content[0].content_id], ["document", a.content[0].content_id]);
  assert.equal(c.content[0].content_id, a.content[0].content_id, "a document's address carries no stray field");
});

test("R12 projection: a document leg on an unread capture mints; on a document with no capture it is legal and mints nothing; a PART of it is refused", () => {
  const w = world(); const [capB] = w.doc(BARE, ["bare"], { chain: null });
  uncaptured(w, NOCAP);
  const bare = w.promote("INQ-2026-0601-b", md("INQ-2026-0601-b", [{ target: BARE }]));
  assert.deepEqual([bare.ok, bare.content[0].extent_kind, bare.content[0].minted], [true, "document", true]);
  assert.equal(capOf(w, bare.content[0].content_id), capB);
  const none = w.promote("INQ-2026-0602-n", md("INQ-2026-0602-n", [{ target: NOCAP }]));
  assert.deepEqual([none.ok, none.content], [true, undefined], "legal, and no row invented");
  assert.equal(w.row(`SELECT content_id FROM inquiry_basis WHERE bundle_id=?`, "INQ-2026-0602-n").content_id, null);
  const part = w.promote("INQ-2026-0603-p", md("INQ-2026-0603-p", [{ target: NOCAP, f: { extent_kind: "pdf-page", extent_page: 0 } }]));
  assert.deepEqual([part.ok, codes(part)], [false, ["C-45.2"]]);
});

test("R12 projection: a re-read stales the row and the re-promoted leg CARRIES it, saying so (never re-minted); narrowing is the act that mints anew", () => {
  const w = world(); w.doc(PAGED, ["paged"], { chain: scoped([0, 1, 2]) });
  const legs = [{ target: PAGED, f: { extent_kind: "pdf-page", extent_page: 1, extent_rect: "[10, 20, 100, 200]" } }];
  const first = w.promote("INQ-2026-0701-p", md("INQ-2026-0701-p", legs)).content[0];
  const whole = w.promote("INQ-2026-0702-w", md("INQ-2026-0702-w", [{ target: PAGED }])).content[0];
  const before = w.count("content");
  redoc(w, PAGED, [{ path: "snapshots/c0.txt", text: "paged", chain: scoped([0, 1, 2], "B") }]);
  assert.equal(w.count("content"), before, "nothing deleted");
  assert.equal(w.content.contentRow(first.content_id).stale, true, "the row minted against the old chain is stale");
  const again = w.promote("INQ-2026-0701-p", md("INQ-2026-0701-p", legs));
  const [a] = again.content;
  assert.deepEqual([a.content_id, a.carried, a.minted, a.stale], [first.content_id, true, false, true]);
  assert.match(a.says, /re-read and the text may have changed/);
  assert.equal(w.count("content"), before, "re-projecting minted no row");
  /* narrowing from the whole document to a page mints anew and does not carry; the old row stays */
  const narrow = w.promote("INQ-2026-0702-w", md("INQ-2026-0702-w", [{ target: PAGED,
    f: { extent_kind: "pdf-page", extent_page: 2, extent_ref: q("page 3, the table") } }]));
  const [nr] = narrow.content;
  assert.deepEqual([nr.extent_kind, nr.carried, nr.content_id !== whole.content_id], ["pdf-page", false, true]);
  assert.ok(w.content.contentRow(whole.content_id), "the old document row is not deleted");
  assert.ok(w.count("content") > before);
});

test("R12 projection: after a purge the same leg over the same capture and chain mints the same id — a hash, not an allocator", () => {
  const w = world(); const [cap] = w.doc(PAGED, ["paged"], { chain: scoped([0, 1, 2]) });
  const id0 = w.inquiry("INQ-2026-0801-a", { legs: [{ target: PAGED }] }).content[0].content_id;
  w.record.purge({ bundleId: "INQ-2026-0801-a" }); w.record.purge({ bundleId: PAGED });
  assert.equal(w.content.contentRow(id0), null, "the row went with its document");
  w.doc(PAGED, ["paged"], { chain: scoped([0, 1, 2]) });
  const reborn = w.inquiry("INQ-2026-0802-b", { legs: [{ target: PAGED }] });
  assert.deepEqual([reborn.content[0].content_id, reborn.content[0].minted], [id0, true]);
  assert.equal(id0, contentIdFor(cap, { kind: "document" }, scoped([0, 1, 2])));
});

/* ------------------------------------------------------------------------------------------------ R12 R15: REC-220's pin */

test("R12 R15 a pinned leg keeps capture A after a preferred later B, fresh and re-promoted; the author's re-pointing to B wins; the unpinned leg is carried at A and reads undetermined", () => {
  const w = world();
  const DOC = "INFO-2026-0901-doc", OTHER = "INFO-2026-0902-other";
  const [A] = w.doc(DOC, ["capture A"]); const [O] = w.doc(OTHER, ["capture O"]);
  const pin = (cap) => ({ extent_capture: q(cap) });
  const Q1 = "INQ-2026-0901-pinned", Q2 = "INQ-2026-0902-unpinned", Q3 = "INQ-2026-0903-question";
  const Q4 = "INQ-2026-0904-fresh", Q5 = "INQ-2026-0905-copy";
  assert.equal(w.promote(Q1, md(Q1, [{ target: DOC, f: pin(A) }])).ok, true);
  w.inquiry(Q2, { legs: [{ target: DOC }] });
  const eb = (id) => w.k.earnedBasis({ id, viewer: "admin" });
  const legAt = (id, target) => { const l = eb(id).legs.find((x) => x.target === target);
    return { cid: l.content_id ?? null, capture: l.content_id ? capOf(w, l.content_id) : null, version: l.version ?? null, null_case: l.null_case ?? null }; };
  const c1 = legAt(Q1, DOC);
  assert.equal(c1.capture, A);
  assert.deepEqual(c1.version, { state: "pinned", by: "extent_capture", capture: A });
  const c2a = legAt(Q2, DOC);
  assert.deepEqual([c2a.capture, c2a.version], [A, { state: "only_capture", capture: A }]);

  /* B: registered later, but first held earlier by this instance's own receipt — the resolver now prefers it */
  const [, B] = redoc(w, DOC, [{ path: "snapshots/c0.txt", text: "capture A" }, { path: "snapshots/b.txt", text: "capture B" }],
                      ["snapshots/b.txt"]);
  w.prov.recordReceipt({ address: "https://example.org/rec220", addressNorm: "example.org/rec220", captureSha: B,
                         retrieved: "2020-01-01T00:00:00Z", via: "direct" });
  w.inquiry(Q4, { legs: [{ target: DOC }] });
  assert.equal(legAt(Q4, DOC).capture, B, "the fixture arms the pin: an unpinned leg projected now rests on B");

  /* the pin in the bytes, with no prior row to carry: Q1's bytes as a new question */
  assert.equal(w.promote(Q5, w.text(Q1).replaceAll(Q1, Q5)).ok, true);
  const c5 = legAt(Q5, DOC);
  assert.deepEqual([c5.capture, c5.cid], [A, c1.cid], "projected fresh after B, the pinned bytes rest on A, the very row");
  /* in place: Q1 re-promoted with a second leg */
  assert.equal(w.promote(Q1, md(Q1, [{ target: DOC, f: pin(A) }, { target: OTHER, f: pin(O) }])).ok, true);
  const c1b = legAt(Q1, DOC);
  assert.deepEqual([c1b.capture, c1b.cid], [A, c1.cid]);
  assert.equal(legAt(Q1, OTHER).capture, O);
  /* the author re-points Q5 to B: the authored capture wins over the carried row */
  assert.equal(w.promote(Q5, w.text(Q5).replace(`extent_capture: "${A}"`, `extent_capture: "${B}"`)).ok, true);
  assert.equal(legAt(Q5, DOC).capture, B);
  /* the unpinned leg re-promoted in place keeps A, by the projection's carry-forward, not by its bytes */
  assert.equal(w.promote(Q2, w.text(Q2)).ok, true);
  const c2b = legAt(Q2, DOC);
  assert.equal(c2b.capture, A);
  assert.deepEqual(w.fm(Q2).basis.map((l) => l.extent_capture ?? null), [null]);
  assert.deepEqual([c2b.version.state, c2b.version.resolved_capture, c2b.version.captures_held, "capture" in c2b.version],
                   ["undetermined", A, 2, false]);
  assert.match(c2b.version.detail, /undetermined/);
  assert.deepEqual(legAt(Q1, DOC).version, { state: "pinned", by: "extent_capture", capture: A }, "two held, still pinned");

  /* a leg naming a content id is pinned by it; a leg onto a question carries no version, its null case says why */
  w.inquiry(Q3, { legs: [] });
  assert.equal(w.promote(Q3, md(Q3, [{ target: Q1 }, { target: DOC, role: "cuts_against", f: { content_id: c1.cid } }])).ok, true);
  const c6 = legAt(Q3, DOC);
  assert.deepEqual([c6.cid, c6.capture], [c1.cid, A]);
  assert.deepEqual(c6.version, { state: "pinned", by: "content_id", capture: A });
  const onQ = legAt(Q3, Q1);
  assert.deepEqual([onQ.version, onQ.null_case], [null, "INQUIRY_TARGET"]);
});

/* ------------------------------------------------------------------------------------------------ R13 R15: the earned read */

test("R13 R15 earnedBasis at content grain: a portion's connection axis is undetermined with the empty level named (NO_CONNECTION), never borrowed; a document row earns its document's", () => {
  const w = world(); w.entity("ENT-2026-0001", "Sewer Fund Transfer Ordinance");
  const [cap] = w.doc(PAGED, ["paged"], { chain: scoped([0, 1, 2]) });
  w.resolve(cap, PAGED, "ordinance:24680", "ENT-2026-0001", "A");
  const r = w.promote("INQ-2026-1001-q", md("INQ-2026-1001-q", [{ target: PAGED },
    { target: PAGED, f: { extent_kind: "pdf-page", extent_page: 1, extent_rect: "[10, 20, 100, 200]", extent_ref: q("page 2, the transfer table") } }],
    { subject: "ENT-2026-0001" }));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const [DOC_ROW, PAGE_ROW] = r.content.map((c) => c.content_id);
  const eb = w.k.earnedBasis({ id: "INQ-2026-1001-q", viewer: "admin" });
  assert.deepEqual(Object.keys(eb.earned.content).sort(), [DOC_ROW, PAGE_ROW].sort());
  const d = eb.earned.content[DOC_ROW].connection, p = eb.earned.content[PAGE_ROW].connection;
  assert.deepEqual([d.determined, d.grain, d.grade], [true, "document", "A"], "the document row: its portion IS the document");
  assert.equal(d.grade, eb.earned.connection[PAGED].grade);
  assert.deepEqual([p.determined, p.grain, p.grade, p.undetermined_because], [false, "portion", null, "NO_CONNECTION"]);
  assert.match(p.empty_level, /^connection — /);
  assert.match(p.empty_level, /end of no connection through this subject/);
  assert.ok(String(p.why).includes(`nothing for ${eb.earned.content[PAGE_ROW].ref} to earn from`), p.why);
  assert.match(p.why, /end of no connection/);
  assert.equal(Object.prototype.hasOwnProperty.call(p, "document_grade"), false, "never borrowed from the document");
  assert.equal(Object.values(eb.earned.content).filter((c) => c.extent_kind !== "document")
    .filter((c) => c.connection.grade !== null || c.connection.determined !== false).length, 0);
  assert.deepEqual([legOf(eb, 0).null_case ?? null, legOf(eb, 1).null_case ?? null], [null, null],
    "a leg with a referent carries no null case");
});

test("R13 R15 earnedBasis for a cell leg: names the leg's row; its standing is about THIS extent, its connection and transcription undetermined and stated, its ref the cell", () => {
  const w = world(); w.doc(BOOK, ["book"], { chain: LAYER });
  const r = w.promote("INQ-2026-1101-c", md("INQ-2026-1101-c", [{ target: BOOK,
    f: { extent_kind: "sheet-cell", extent_sheet: q("Sheet1"), extent_cell: q("B14") } }]));
  const ROW = r.content[0].content_id;
  const eb = w.k.earnedBasis({ id: "INQ-2026-1101-c", viewer: "admin" });
  assert.deepEqual([eb.ok, eb.legs.length, eb.legs[0].content_id], [true, 1, ROW]);
  const s = eb.earned.content[ROW];
  assert.deepEqual([s.extent_kind, s.extent.sheet, s.extent.cell], ["sheet-cell", "Sheet1", "B14"]);
  assert.deepEqual([s.connection.determined, s.connection.grain, s.connection.undetermined_because], [false, "portion", "NO_CONNECTION"]);
  assert.equal(s.transcription.ceiling, null);
  assert.match(s.transcription.why, /cannot yet evaluate what a sheet-cell extent covers/);
  assert.equal(s.ref, "Sheet1!B14");
});

test("R15 the backfill: a leg promoted before its document was captured gets exactly the hashed document row on the first read, and is found, not re-minted, on the next", () => {
  const w = world();
  const LATE = "INFO-2026-1201-late", Q = "INQ-2026-1201-q";
  uncaptured(w, LATE);
  const first = w.promote(Q, md(Q, [{ target: LATE }]));
  assert.deepEqual([first.ok, first.content], [true, undefined], "the leg lands with no referent");
  const CHAIN = scoped([0, 1]);
  const [cap] = redoc(w, LATE, [{ path: "snapshots/l.txt", text: "captured after the leg", chain: CHAIN }], ["snapshots/l.txt"]);
  const eb = w.k.earnedBasis({ id: Q, viewer: "admin" });
  const leg = legOf(eb, 0);
  assert.deepEqual([leg.content_id != null, leg.backfilled], [true, true]);
  assert.equal(leg.content_id, contentIdFor(cap, { kind: "document" }, CHAIN), "the id the hash answers");
  assert.deepEqual([eb.earned.content[leg.content_id]?.extent_kind, eb.earned.content[leg.content_id]?.bundle_id], ["document", LATE]);
  const again = legOf(w.k.earnedBasis({ id: Q, viewer: "admin" }), 0);
  assert.deepEqual([again.content_id, !!again.backfilled], [leg.content_id, false]);
  assert.equal(w.content.contentRow(leg.content_id).bundle_id, LATE);
});

test("R15 the backfill's bound bites at LEG_BACKFILL_MAX over 51 legs, says so, names the rest NOT_YET_RESOLVED needing no cursor, and the next read continues onto one row", () => {
  const w = world();
  const MANY = "INFO-2026-1301-many", Q = "INQ-2026-1301-q", OVER = LEG_BACKFILL_MAX + 1;
  uncaptured(w, MANY);
  assert.equal(w.promote(Q, md(Q, Array.from({ length: OVER }, () => ({ target: MANY })))).ok, true);
  redoc(w, MANY, [{ path: "snapshots/m.txt", text: "captured after fifty-one legs", chain: scoped([0]) }], ["snapshots/m.txt"]);
  const first = w.k.earnedBasis({ id: Q, viewer: "admin" });
  assert.deepEqual([first.legs.length, first.legs.filter((l) => l.content_id).length], [OVER, LEG_BACKFILL_MAX]);
  assert.equal(first.backfill_truncated, true);
  const left = first.legs.find((l) => !l.content_id);
  assert.equal(left.null_case, "NOT_YET_RESOLVED");
  assert.match(left.why_no_content, /needs no cursor/);
  const second = w.k.earnedBasis({ id: Q, viewer: "admin" });
  assert.deepEqual([second.legs.filter((l) => l.content_id).length, second.backfill_truncated ?? false], [OVER, false]);
  assert.equal(new Set(second.legs.map((l) => l.content_id)).size, 1, "51 legs onto one referent");
});

test("R15 the two legitimate nulls are stated as which, each with its own sentence, never collapsed", () => {
  const w = world();
  const TARGET = "INQ-2026-1401-t", NOBYTES = "INFO-2026-1401-nobytes", Q = "INQ-2026-1402-q";
  w.inquiry(TARGET);
  uncaptured(w, NOBYTES);
  assert.equal(w.promote(Q, md(Q, [{ target: TARGET }, { target: NOBYTES }])).ok, true);
  const eb = w.k.earnedBasis({ id: Q, viewer: "admin" });
  const inq = legOf(eb, 0), none = legOf(eb, 1);
  assert.deepEqual([inq.content_id ?? null, none.content_id ?? null], [null, null]);
  assert.equal(inq.null_case, "INQUIRY_TARGET");
  assert.match(inq.why_no_content, /an inquiry rather than a/); assert.match(inq.why_no_content, /DEC-21/);
  assert.equal(none.null_case, "NO_BYTES_HELD");
  assert.match(none.why_no_content, /holds no capture of/);
  assert.match(none.why_no_content, /never evidence about what the document says/);
});

test("R13 a whole-document attestation of a chainless capture does not raise a member's typing through a leg; a second member's attestation of the typing does", () => {
  const w = world(); w.member("ruth"); w.member("sam");
  const DOC_N = "INFO-2026-1501-nochain", QN = "INQ-2026-1501-qn";
  const [capN] = w.doc(DOC_N, ["no chain was ever recorded"], { chain: null });
  const at = w.content.attestText({ captureSha: capN, member: "sam", at: "2026-09-27T00:00:00Z",
                                    extent: { kind: "document" }, viewer: V("sam") });
  assert.deepEqual([at.ok, at.chain_at_attestation], [true, null], JSON.stringify(at).slice(0, 300));
  const tx = w.content.transcribe({ bundleId: DOC_N, extent: { kind: "pdf-page", page: 0 }, text: "Lot 7, Block 3.",
                                    transcriber: "ruth", viewer: V("ruth"), at: "2026-09-27T00:00:00Z" });
  assert.equal(tx.ok, true, JSON.stringify(tx).slice(0, 300));
  assert.equal(w.promote(QN, md(QN, [{ target: DOC_N, f: { content_id: q(tx.content_id) } }])).ok, true);
  const ceil = (id) => { const s = w.k.earnedBasis({ id, viewer: "admin" }).earned.content?.[tx.content_id];
    return s ? [s.transcription.ceiling, s.transcription.determinant, s.transcription.by] : null; };
  assert.deepEqual(ceil(QN), [null, "derivation", []], "the capture attestation checked other text");
  const sa = w.content.transcriptionAttest({ contentId: tx.content_id, attestor: "sam", viewer: V("sam"), at: "2026-09-27T01:00:00Z" });
  assert.equal(sa.ok, true, JSON.stringify(sa).slice(0, 300));
  assert.deepEqual(ceil(QN), [EARNED_CAPTURE_CEILING, "attestation", ["sam"]], "the leg earns what the typing's attestation supports");
});
