/* content: converted from two legacy suites, content's share of each only.
 *   cpdf18-pdf-images (pdf-reader, content, pdf-pixels): the human form of a PDF image extent (R2), a PDF image row
 *     minted by page and rect and read back as `bytes` (R4, R12, R21), the crop of an image painted inside a Form
 *     XObject (R32), and the painted-image list's refusal (R7, C-45.12). The structure walk, the Oakland fixtures, the
 *     text pins and pdf-pixels' own refusal arms are pdf-reader's and pdf-pixels'.
 *   content-chain-kind (content): a store whose `content` table predates `chain_kind` migrates (R14, R45), and a
 *     mixed document's units minted through `contentMint` each say how they were read (R14, R15). The `rows=content`
 *     and `content:` query arms are query-language's and retrieval's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inflateSync } from "node:zlib";
import { world, bucket, V, sha, MIXED } from "./fixture.mjs";
import { describeExtent, canonicalExtent, contentIdFor } from "../../../src/content/index.mjs";
import { mergedChain } from "../../../src/textchain.mjs";

const DOC = "INFO-2026-0001-a";

/* ---- a PDF assembled here with a correct cross-reference table; every placement matrix is written in this file ---- */
function pdf(objs) {
  const parts = [Buffer.from("%PDF-1.7\n", "latin1")];
  const offsets = [];
  let pos = parts[0].length;
  objs.forEach((o, i) => {
    offsets.push(pos);
    const body = o.stream
      ? Buffer.concat([Buffer.from(`<< ${o.dict} /Length ${o.stream.length} >>\nstream\n`, "latin1"), o.stream,
                       Buffer.from("\nendstream", "latin1")])
      : Buffer.from(o.body, "latin1");
    const b = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`, "latin1"), body, Buffer.from("\nendobj\n", "latin1")]);
    parts.push(b); pos += b.length;
  });
  const xref = [`xref\n0 ${objs.length + 1}\n`, "0000000000 65535 f \n",
    ...offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`),
    `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`].join("");
  parts.push(Buffer.from(xref, "latin1"));
  return new Uint8Array(Buffer.concat(parts));
}

/* A 2x2 DeviceGray 8-bit image, unfiltered samples, painted ONLY inside a Form XObject on page 0: the page's
   `1 0 0 1 300 100 cm`, the form's /Matrix [2 0 0 2 10 10], the form's own `30 0 0 40 0 0 cm` compose to
   [60 0 0 80 310 110], so the unit square lands at [310, 110, 370, 190] (derived by hand, cpdf18's ground truth).
   Page 1 paints nothing. */
const GREY = Buffer.from([0x00, 0x40, 0x80, 0xff]);
const FORM_RECT = [310, 110, 370, 190];
const FORM_PDF = pdf([
  { body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { body: "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>" },
  { body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Fm1 5 0 R >> >> /Contents 6 0 R >>" },
  { body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 7 0 R >>" },
  { dict: "/Type /XObject /Subtype /Form /BBox [0 0 100 100] /Matrix [2 0 0 2 10 10] /Resources << /XObject << /Im2 8 0 R >> >>",
    stream: Buffer.from("q 30 0 0 40 0 0 cm /Im2 Do Q", "latin1") },
  { dict: "", stream: Buffer.from("q 1 0 0 1 300 100 cm /Fm1 Do Q", "latin1") },
  { dict: "", stream: Buffer.from("BT ET", "latin1") },
  { dict: "/Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceGray /BitsPerComponent 8", stream: GREY },
]);
const FORM_SHA = sha(Buffer.from(FORM_PDF));

/** The 8-bit grey samples of a PNG, read back with node's own zlib. */
function greySamples(png) {
  const b = Buffer.from(png);
  let off = 8, w = 0, h = 0;
  const idat = [];
  while (off < b.length) {
    const len = b.readUInt32BE(off), type = b.toString("latin1", off + 4, off + 8), data = b.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); }
    if (type === "IDAT") idat.push(data);
    off += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), out = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out.push(raw[y * (w + 1) + 1 + x]);
  return { w, h, out };
}

/** A document whose one capture is the Form PDF (held in the evidence store unless `held` is false), known to content
 *  through the capture its reading carries (R11), read with `facts`. */
function formWorld({ facts = {}, held = true } = {}) {
  const w = world({ evidence: bucket(held ? { [`bio/captures/${FORM_SHA}`]: FORM_PDF } : {}) });
  w.doc(DOC, []);
  w.ex.readFor[DOC] = [FORM_SHA];
  w.read(FORM_SHA, { pageCount: 2, ...facts });
  return w;
}
const PAINTED = { container: "pdf", levels: [], images: [{ page: 0, rect: FORM_RECT }] };

/* ================================ cpdf18-pdf-images ================================ */

test("R2 (cpdf18-pdf-images): a PDF image extent's human form is the IC-1 form, 1-based, with or without a rect; a caller's ref is kept", () => {
  /* pdf-reader's `pdfImageRef` (src/pdfstructure.mjs) is not reachable from content or its uses, so the parity arm
     asserts the form itself: `an image on page N+1`, the ref that helper is written to produce. */
  assert.equal(describeExtent({ kind: "image", page: 0, rect: [1, 2, 3, 4] }), "an image on page 1");
  assert.equal(describeExtent({ kind: "image", page: 6 }), "an image on page 7");
  assert.equal(describeExtent({ kind: "image", page: 0, rect: [1, 2, 3, 4] }),
    describeExtent({ kind: "image", page: 0, rect: [3, 4, 1, 2] }), "the rect's corner order does not move the form");
  assert.equal(describeExtent({ kind: "image", page: 0, rect: [1, 2, 3, 4], ref: "the masthead" }), "the masthead");
  /* negative control: the page matters, and a pdf-page extent is not described as an image */
  assert.notEqual(describeExtent({ kind: "image", page: 1 }), describeExtent({ kind: "image", page: 0 }));
  assert.doesNotMatch(describeExtent({ kind: "pdf-page", page: 0 }), /image/);
});

test("R4, R12, R21 (cpdf18-pdf-images): a PDF image minted by page and rect reads back cited as bytes, no chain, no cap, transcription axis not applicable", () => {
  const w = formWorld({ facts: { containerExtent: PAINTED } });
  const e = { kind: "image", page: 0, rect: [370, 190, 310, 110] };
  const m = w.content.contentMint({ bundleId: DOC, extent: e, mintedBy: V("bo"), viewer: V("bo") });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  assert.deepEqual([m.minted, m.capture_sha, m.extent_kind], [true, FORM_SHA, "image"]);
  assert.equal("undetermined" in m, false, "the painted-image list was held: nothing undetermined");
  /* the address: the capture, the canonical extent, and a NULL chain although the capture's reading has one */
  assert.equal(m.content_id, contentIdFor(FORM_SHA, e, null));
  assert.notEqual(m.content_id, contentIdFor(FORM_SHA, e, w.ex.readings[FORM_SHA].chain), "the chain is left out of a bytes address");
  const row = w.content.contentRow(m.content_id);
  assert.deepEqual([row.extent, row.cited_as, row.chain, row.derivation_cap, row.ref, row.stale],
    [{ kind: "image", cited_as: "bytes", page: 0, part: null, rect: FORM_RECT }, "bytes", null, null, "an image on page 1", false]);
  assert.equal(canonicalExtent(row.extent), canonicalExtent({ kind: "image", page: 0, rect: FORM_RECT, cited_as: "bytes" }),
    "its canonical address is the one the reference canonicalises to");
  assert.equal(w.row(`SELECT chain_kind FROM content WHERE content_id=?`, m.content_id).chain_kind, null);
  /* contentRead and standings: the transcription axis does not apply, stated as that and not as undetermined */
  const read = w.content.contentRead({ id: m.content_id, viewer: V("bo"), extras: ["id", "viewer"] });
  assert.equal(read.ok, true, JSON.stringify(read).slice(0, 300));
  assert.deepEqual([read.cited_as, read.chain, read.derivation_cap], ["bytes", null, null]);
  assert.deepEqual([read.transcription.applies, read.transcription.ceiling, read.transcription.determinant], [false, null, null]);
  assert.match(read.transcription.why, /does not apply/);
  const s = w.content.standings([m.content_id])[m.content_id];
  assert.deepEqual([s.cited_as, s.chain, s.derivation_cap, s.transcription.applies], ["bytes", null, null, false]);
  /* over-strictness: a pdf-page region at the same place is TEXT, with the capture's chain, and a determined axis */
  const t = w.content.contentMint({ bundleId: DOC, extent: { kind: "pdf-page", page: 0, rect: FORM_RECT }, mintedBy: V("bo"), viewer: V("bo") });
  assert.deepEqual([t.cited_as, t.chain], ["text", w.ex.readings[FORM_SHA].chain]);
  assert.notEqual(w.content.contentRead({ id: t.content_id, viewer: V("bo") }).transcription.applies, false);
  /* R22: a re-read with a new chain never stales the bytes row (it names no chain); the text row goes stale */
  w.content.markStale(FORM_SHA, [{ step: "ocr", engine: "x", version: "2", cap: "C", measured_by: "m" }]);
  assert.deepEqual([w.content.contentRow(m.content_id).stale, w.content.contentRow(t.content_id).stale], [false, true]);
});

test("R7 (cpdf18-pdf-images): an image by page where the held painted-image list says the page paints none is refused C-45.12; a painted page, a measured zero and an unheld list are each answered as what they are", () => {
  const w = formWorld({ facts: { containerExtent: PAINTED } });
  const mint = (e) => w.content.mint({ bundleId: DOC, captureSha: FORM_SHA, extent: e, mintedBy: V("bo") });
  for (const e of [{ kind: "image", page: 1 }, { kind: "image", page: 1, rect: FORM_RECT }]) {
    const r = mint(e);
    assert.deepEqual([r.ok, r.code, r.check], [false, "CONTENT_EXTENT_NO_IMAGE_PAINTED", "C-45.12"], JSON.stringify(e));
    assert.equal(typeof r.translation, "string");
    assert.match(r.detail, /page 1 of this capture paints (no image|0 image)/);
  }
  /* a rect the page paints nothing at, on a page that paints one: refused by name, the painted rect listed */
  const off = mint({ kind: "image", page: 0, rect: [0, 0, 10, 10] });
  assert.equal(off.code, "CONTENT_EXTENT_NO_IMAGE_PAINTED");
  assert.match(off.detail, /\[310, 110, 370, 190\]/);
  assert.equal(w.count("content"), 0, "a refusal writes nothing");
  /* negative controls: page 0 paints the image, by page and by its exact rect (corners in either order) */
  assert.equal(mint({ kind: "image", page: 0 }).ok, true);
  assert.equal(mint({ kind: "image", page: 0, rect: [370, 190, 310, 110] }).ok, true);
  /* a page past the page set is C-45.1, not C-45.12 */
  assert.equal(mint({ kind: "image", page: 2 }).code, "CONTENT_EXTENT_OUT_OF_RANGE");
  /* a measured EMPTY list is a zero, not an absence: page 0 is refused too */
  const w0 = formWorld({ facts: { containerExtent: { container: "pdf", levels: [], images: [] } } });
  assert.equal(w0.content.mint({ bundleId: DOC, captureSha: FORM_SHA, extent: { kind: "image", page: 0 }, mintedBy: V("bo") }).code,
    "CONTENT_EXTENT_NO_IMAGE_PAINTED");
  /* no list held: admitted, the absence stated (R8), never refused */
  const wn = formWorld();
  const u = wn.content.mint({ bundleId: DOC, captureSha: FORM_SHA, extent: { kind: "image", page: 1 }, mintedBy: V("bo") });
  assert.equal(u.ok, true, JSON.stringify(u).slice(0, 300));
  assert.equal(u.undetermined.level, "page_images");
});

test("R32 (cpdf18-pdf-images): the image painted inside a Form XObject is cropped at its composed rectangle, its own samples, a derived rendition", async () => {
  const w = formWorld({ facts: { containerExtent: PAINTED } });
  const id = w.content.mint({ bundleId: DOC, captureSha: FORM_SHA, extent: { kind: "image", page: 0, rect: FORM_RECT }, mintedBy: V("bo") }).content_id;
  const before = w.snapshot();
  const r = await w.content.cropOf({ contentId: id, viewer: V("bo") });
  assert.deepEqual(w.snapshot(), before, "the crop writes nothing");
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.derived, r.rendition, r.content_id, r.capture_sha, r.capture_sha256], [true, "crop", id, FORM_SHA, FORM_SHA]);
  assert.deepEqual(r.of, { kind: "image", page: 0, rect: FORM_RECT });
  assert.deepEqual([r.route, r.width, r.height], ["raw-samples-grey8", 2, 2]);
  assert.match(r.says, /derived rendition/);
  const file = Buffer.from(r.bytes_base64, "base64");
  assert.equal(sha(file), r.file_sha256);
  assert.equal(r.mediaType, "image/png");
  const px = greySamples(file);
  assert.deepEqual([px.w, px.h, px.out], [2, 2, [...GREY]], "the image's own samples");
  /* negative control: the form's own placement rect, uncomposed, names no image */
  const w2 = formWorld();
  const raw = w2.content.mint({ bundleId: DOC, captureSha: FORM_SHA, extent: { kind: "image", page: 0, rect: [0, 0, 30, 40] }, mintedBy: V("bo") });
  const miss = await w2.content.cropOf({ contentId: raw.content_id, viewer: V("bo") });
  assert.deepEqual([miss.ok, miss.reason, miss.pdf_pixels_reason], [false, "CROP_NOT_DERIVABLE", "NO_IMAGE_AT_RECT"]);
});

test("R32 (cpdf18-pdf-images): a crop asked of a page that paints nothing is refused by name, never a blank frame", async () => {
  /* the row can only exist where the painted-image list is not held (with it, C-45.12 refuses the mint above) */
  const w = formWorld();
  const m = w.content.mint({ bundleId: DOC, captureSha: FORM_SHA, extent: { kind: "image", page: 1, rect: FORM_RECT }, mintedBy: V("bo") });
  assert.equal(m.undetermined.level, "page_images");
  const r = await w.content.cropOf({ contentId: m.content_id, viewer: V("bo") });
  assert.deepEqual([r.ok, r.reason, r.derived, r.pdf_pixels_reason], [false, "CROP_NOT_DERIVABLE", true, "NO_IMAGE_AT_RECT"]);
  assert.equal("bytes_base64" in r, false);
  assert.equal(typeof r.pdf_pixels_why, "string");
});

/* ================================ content-chain-kind ================================ */

const LAYER1 = [{ step: "layer" }];
const OCR1 = [{ step: "pixels" }, { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" } }];
const OVERLAP = mergedChain([{ chain: LAYER1, pages: [0, 1, 2] }, { chain: OCR1, pages: [2] }]);

/** A store's content table replaced by the shape it had before `chain_kind` (no column, no index), holding `rows`
 *  written as the old minter wrote them. */
function preChainKindStore(rows) {
  const w = world();
  w.doc(DOC, []);
  w.st.db.exec(`DROP TABLE content`);
  w.st.db.exec(`CREATE TABLE content (content_id TEXT PRIMARY KEY, capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL,
    extent_kind TEXT NOT NULL, extent TEXT NOT NULL, ref TEXT NOT NULL, chain TEXT, derivation_cap TEXT, page_count INTEGER,
    minted_by TEXT NOT NULL, at TEXT NOT NULL, stale INTEGER NOT NULL DEFAULT 0, cited_as TEXT NOT NULL DEFAULT 'text')`);
  const ins = w.st.db.prepare(`INSERT INTO content (content_id,capture_sha,bundle_id,extent_kind,extent,ref,chain,
    derivation_cap,page_count,minted_by,at,stale,cited_as) VALUES (?,?,?,?,?,?,?,?,?,?,?,0,?)`);
  for (const [id, extent, chain, citedAs = "text"] of rows)
    ins.run(id, "c".repeat(64), DOC, extent.kind, JSON.stringify(extent), describeExtent(extent),
            chain == null ? null : JSON.stringify(chain), null, 3, "plane", "2026-09-18T00:00:00Z", citedAs);
  return w;
}
const cols = (w) => [...w.st.sql.exec(`PRAGMA table_xinfo(content)`)];
const kinds = (w) => w.rows(`SELECT content_id, chain_kind FROM content ORDER BY content_id`).map((r) => `${r.content_id}=${r.chain_kind}`);

test("R14, R45 (content-chain-kind): a content table with no chain_kind gains it on migrate, a plain column, each existing row's kind computed from its own chain and extent", () => {
  const P = (n) => ({ kind: "pdf-page", page: n, rect: null });
  const w = preChainKindStore([
    ["c-ocr", { kind: "document" }, OCR1], ["c-layer", { kind: "document" }, LAYER1], ["c-bare", { kind: "document" }, null],
    ["c-bad", { kind: "document" }, [{ step: "nope" }]],
    ["m-page0", P(0), MIXED], ["m-page2", P(2), MIXED], ["m-doc", { kind: "document" }, MIXED],
    ["o-page0", P(0), OVERLAP], ["o-page2", P(2), OVERLAP], ["o-doc", { kind: "document" }, OVERLAP],
    ["x-image", { kind: "image", page: 0, rect: [0, 0, 1, 1], cited_as: "bytes" }, null, "bytes"],
  ]);
  assert.equal(cols(w).some((c) => c.name === "chain_kind"), false, "ARMED: the old shape holds no chain_kind");
  assert.equal(w.row(`SELECT name FROM sqlite_master WHERE type='index' AND name='content_chain_kind'`), null, "ARMED: nor its index");
  const kept = w.rows(`SELECT * FROM content ORDER BY content_id`).map((r) => ({ ...r }));
  w.content.migrate();
  const ck = cols(w).filter((c) => c.name === "chain_kind");
  assert.deepEqual(ck.map((c) => [c.type, c.hidden]), [["TEXT", 0]], "one plain TEXT column, visible");
  assert.ok([...w.st.sql.exec(`PRAGMA table_info(content)`)].some((c) => c.name === "chain_kind"));
  assert.deepEqual(kinds(w), ["c-bad=null", "c-bare=null", "c-layer=layer", "c-ocr=ocr",
    "m-doc=mixed", "m-page0=layer", "m-page2=ocr", "o-doc=mixed", "o-page0=layer", "o-page2=mixed", "x-image=null"]);
  assert.deepEqual(w.rows(`SELECT * FROM content ORDER BY content_id`).map(({ chain_kind, ...r }) => ({ ...r })), kept,
    "nothing but the new column moved");
  assert.equal(w.row(`SELECT name FROM sqlite_master WHERE type='index' AND name='content_chain_kind'`).name, "content_chain_kind");
  assert.match(w.row(`SELECT sql FROM sqlite_master WHERE name='content_chain_kind'`).sql, /content\s*\(\s*chain_kind\s*,\s*bundle_id\s*\)/);
});

test("R14, R45 (content-chain-kind): a second migrate recomputes nothing: a kind set by hand after the first survives the second, and the column is not added twice", () => {
  const w = preChainKindStore([["m-doc", { kind: "document" }, MIXED], ["m-page0", { kind: "pdf-page", page: 0, rect: null }, MIXED]]);
  w.content.migrate();
  assert.deepEqual(kinds(w), ["m-doc=mixed", "m-page0=layer"]);
  w.st.db.exec(`UPDATE content SET chain_kind='typed' WHERE content_id='m-doc'`);
  const before = w.snapshot();
  w.content.migrate();
  assert.deepEqual(kinds(w), ["m-doc=typed", "m-page0=layer"], "the sentinel survives: no recompute on a later boot");
  assert.equal(cols(w).filter((c) => c.name === "chain_kind").length, 1);
  assert.deepEqual(w.snapshot(), before, "a second boot writes nothing");
  /* negative control: a store booted today (the column already there) is not recomputed on its first migrate either */
  const fresh = world();
  const a = fresh.cap("a"); fresh.doc(DOC, [a]); fresh.read(a.sha, { chain: MIXED, pageCount: 3 });
  const m = fresh.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "document" }, mintedBy: "plane" });
  fresh.st.db.exec(`UPDATE content SET chain_kind='typed'`);
  fresh.content.migrate();
  assert.equal(fresh.row(`SELECT chain_kind FROM content WHERE content_id=?`, m.content_id).chain_kind, "typed");
});

test("R14, R15 (content-chain-kind): units minted through contentMint on a mixed document each say how they were read: a text-layer page layer, the OCR page ocr, a page two parts read mixed, the whole document mixed", () => {
  const w = world();
  const a = w.cap("a"), b = w.cap("b"), c = w.cap("c");
  w.doc(DOC, [a]); w.read(a.sha, { chain: MIXED, pageCount: 3 });
  w.doc("INFO-2026-0002-b", [b]); w.read(b.sha, { chain: OVERLAP, pageCount: 3 });
  w.doc("INFO-2026-0003-c", [c]); w.read(c.sha, { chain: LAYER1, pageCount: 3 });
  const kind = (bundleId, extent) => {
    const m = w.content.contentMint({ bundleId, extent, mintedBy: V("mina"), viewer: V("mina") });
    assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
    assert.equal(m.minted_by, V("mina"));
    return w.row(`SELECT chain_kind FROM content WHERE content_id=?`, m.content_id).chain_kind;
  };
  const P = (n) => ({ kind: "pdf-page", page: n });
  assert.deepEqual([kind(DOC, P(0)), kind(DOC, P(1)), kind(DOC, P(2)), kind(DOC, null)], ["layer", "layer", "ocr", "mixed"],
    "a partitioned mixed document; no extent is the document (R15)");
  assert.deepEqual([kind("INFO-2026-0002-b", P(0)), kind("INFO-2026-0002-b", P(2)), kind("INFO-2026-0002-b", { kind: "document" })],
    ["layer", "mixed", "mixed"], "overlapping parts: the page both read is mixed");
  /* negative control: a document read one way is that way, whole or by page, never mixed */
  assert.deepEqual([kind("INFO-2026-0003-c", P(2)), kind("INFO-2026-0003-c", { kind: "document" })], ["layer", "layer"]);
  assert.equal(w.count("content"), 9);
});
