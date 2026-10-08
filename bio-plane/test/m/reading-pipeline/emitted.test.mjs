/* reading-pipeline: what the format entry emitted beside the text, carried on the reading (R28; T33-24, C:A-5; K1556),
   at the module's interface: `read` over a stored capture, and the piece `emittedFieldsOf`. Each test names the
   requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { emittedFieldsOf } from "../../../src/reading-pipeline/index.mjs";
import { getFormat } from "../../../src/formats.mjs";
import { fresh, hold, doc, member, withEntry, i2, noText, ocrAnswer } from "./fixture.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";
import { makeZip } from "../../make-zip.mjs";

/* K1737: docprofile registers no content type of its own, so this suite registers doctypes' readers, as the plane's
   store does. */
registerDoctypes(registerDoctype);

const META = { author: "A. Clerk", lastModifiedBy: "B. Deputy", created: "2026-01-02T03:04:05Z", modified: "2026-02-03T04:05:06Z",
               source: "docProps/core.xml" };
const cell = (ref, value, type = "text", formula = null, cached = null) =>
  ({ source: { kind: "sheet-cell", ref }, value, type, declared: type === "number" ? null : "s", cached, formula });
const rng = (sheet, range) => ({ kind: "sheet-range", ref: `${sheet}!${range}`, sheet, range });

test("R28: a workbook's reading carries the entry's metadata as emitted and cells keyed by sheet name, each sheet's cells as emitted, null over the size guard; neither altered", async () => {
  const sheets = [
    { sheet: 0, name: "Budget", text: "Fund\t0.1", range: rng("Budget", "A1:B1"),
      cells: [cell("Budget!A1", "Fund"), cell("Budget!B1", "0.1", "number", "SUM(C1:C9)", "0.1")] },
    { sheet: 1, name: "Huge", text: "x", range: rng("Huge", "A1:A1"), cells: null },
    { sheet: 2, name: "Old", text: "y", range: rng("Old", "A1:A1") },
    { sheet: 3, text: "unnamed", range: null, cells: [cell("?!A1", "unnamed")] },
  ];
  const emitted = { ok: true, container: "xlsx", document: "Fund\t0.1\nx\ny\nunnamed", sheets, metadata: META,
                    counts: { chars: 20, undetermined: 0 }, undetermined: [] };
  const pristine = structuredClone(emitted);
  const w = fresh();
  const out = await withEntry({ format: "t28x", text: async () => emitted },
    async () => { const d = await hold(w.evidence, "t28x bytes"); return w.read(doc({ digest: d, format: "t28x", ct: "application/x" })); });
  assert.deepEqual(out.reading.metadata, META);
  assert.deepEqual(out.reading.cells, { Budget: pristine.sheets[0].cells, Huge: null, Old: null });
  assert.equal(out.reading.cells.Budget[1].value, "0.1");
  assert.deepEqual(emitted, pristine, "what the entry emitted is not altered");
  /* The reading survives the wire as the entry emitted it. */
  assert.deepEqual(JSON.parse(JSON.stringify(out.reading)).cells, out.reading.cells);
});

test("R28: the real csv entry's reading carries its one sheet's cells exactly as the entry emits them, and metadata null", async () => {
  const csv = "name,amount\nAna,0.1\nBo,2\n";
  const bytes = new TextEncoder().encode(csv);
  const own = await getFormat("csv").text(bytes);
  assert.ok(Array.isArray(own.sheets) && own.sheets.length === 1);
  const w = fresh();
  const d = await hold(w.evidence, csv);
  const r = await w.read(doc({ digest: d, bytes: csv.length, ct: "text/csv", format: "csv", fromText: true, headers: [["content-type", "text/csv"]] }));
  assert.deepEqual(r.reading.cells, { [own.sheets[0].name]: Array.isArray(own.sheets[0].cells) ? own.sheets[0].cells : null });
  assert.equal(r.reading.metadata, null);
});

test("R28: a document that is neither a workbook nor a .docx has no cells; metadata is the entry's as emitted, or null: an office text with metadata and tables, a PDF read through tier 3, text read as text, an entry that throws, and a failed reading", async () => {
  const w = fresh({ env: { OCR_WORKER: member((b) => ocrAnswer(b.pages)) } });
  const word = await withEntry({ format: "t28d", text: async () => ({ ok: true, container: "odt", document: "Agenda",
      paragraphs: [{ para: 0, text: "Agenda" }], tables: [{ table: 0, ref: "table 1", rows: 1, cols: 1, cells: [] }],
      metadata: META, counts: { chars: 6, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "t28d bytes"); return w.read(doc({ digest: d, format: "t28d", ct: "application/x" })); });
  assert.deepEqual(word.reading.metadata, META);
  assert.equal("cells" in word.reading, false);
  const noMeta = await withEntry({ format: "t28n", text: async () => ({ ok: true, document: "Agenda", paragraphs: [{ para: 0, text: "Agenda" }],
      metadata: null, counts: { chars: 6, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "t28n bytes"); return w.read(doc({ digest: d, format: "t28n", ct: "application/x" })); });
  assert.equal(noMeta.reading.metadata, null);

  const pages = i2([{ page: 0, text: "Agenda of the council" }, { page: 1, text: "", undetermined: [noText(1)] }]);
  const pdf = await withEntry({ format: "pdf", structure: async () => ({ ok: true, text: structuredClone(pages), pages: 2, notes: [] }) },
    async () => { const d = await hold(w.evidence, "%PDF-1.7 r28"); return w.read(doc({ digest: d, bytes: 12, ct: "application/pdf", format: "pdf" })); });
  assert.equal(pdf.reading.text_tier, 3);
  assert.equal(pdf.reading.metadata, null);
  assert.equal("cells" in pdf.reading, false);

  const html = "<html><head><title>Minutes</title></head><body><p>The council met.</p></body></html>";
  const dh = await hold(w.evidence, html);
  const text = await w.read(doc({ digest: dh, bytes: html.length, fromText: true }));
  assert.equal(text.reading.read_from_text, true);
  assert.equal(text.reading.metadata, null);
  assert.equal("cells" in text.reading, false);

  const threw = await withEntry({ format: "t28t", text: async () => { throw new Error("broken"); } },
    async () => { const d = await hold(w.evidence, "t28t bytes"); return w.read(doc({ digest: d, format: "t28t", ct: "application/x" })); });
  assert.equal(threw.reading.found, false);
  assert.equal(threw.reading.metadata, null);
  assert.equal("cells" in threw.reading, false);

  const gone = await w.read(doc({ digest: "e".repeat(64), bytes: 1 }));
  assert.equal(gone.reading.found, false);
  assert.equal(gone.reading.metadata, null);
  assert.equal("cells" in gone.reading, false);
});

test("R28 R23: emittedFieldsOf, the piece a re-read composes, answers the same rule over an I2 text", () => {
  assert.deepEqual(emittedFieldsOf(null), { metadata: null });
  assert.deepEqual(emittedFieldsOf({ document: "x" }), { metadata: null });
  assert.deepEqual(emittedFieldsOf({ metadata: META, paragraphs: [] }), { metadata: META });
  const c = [cell("S!A1", "1", "number")];
  const t = { metadata: null, sheets: [{ name: "S", cells: c }, { name: "T", cells: null }, { name: "U" }, { cells: c }, null] };
  const got = emittedFieldsOf(t);
  assert.deepEqual(got, { metadata: null, cells: { S: c, T: null, U: null } });
  assert.equal(got.cells.S, c, "the entry's own list, not a copy that could drift");
  assert.deepEqual(emittedFieldsOf({ sheets: [] }), { metadata: null, cells: {} });
});

/* N724 (K1972, K2092): a `.docx` document's tables, read through the real docx entry over a package built here. */
const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const wp = (t) => `<w:p><w:r><w:t xml:space="preserve">${t}</w:t></w:r></w:p>`;
const wtc = (...inner) => `<w:tc>${inner.length ? inner.join("") : "<w:p/>"}</w:tc>`;
const wtr = (...cells) => `<w:tr>${cells.join("")}</w:tr>`;
const wtbl = (cols, ...rows) => `<w:tbl><w:tblGrid>${"<w:gridCol/>".repeat(cols)}</w:tblGrid>${rows.join("")}</w:tbl>`;
const DOCX_MAIN = "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml";
const docxBytes = (body) => makeZip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
      + `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`
      + `<Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="${DOCX_MAIN}"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
      + `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
  { name: "word/document.xml", data: `<?xml version="1.0"?><w:document ${W}><w:body>${body}</w:body></w:document>` },
]);
const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const readDocx = async (w, bytes) => {
  const d = await hold(w.evidence, bytes);
  return w.read(doc({ digest: d, bytes: bytes.length, ct: DOCX_CT, format: "docx" }));
};
const dc = (ref, value) => ({ source: { kind: "doc-table", ref, table: Number(ref.match(/^table (\d+)/)[1]) - 1, cell: ref.split(", ")[1] },
                              value, type: "text", declared: null, cached: null, formula: null });

test("R28: a .docx reading carries cells keyed by each table's ref, exactly as the real docx entry emits them: a table of dates and amounts, and a nested table under its own key", async () => {
  const body = wp("Disclosure")
    + wtbl(2, wtr(wtc(wp("Date")), wtc(wp("Amount"))), wtr(wtc(wp("2026-03-14")), wtc(wp("$1,250.00"))))
    + wtbl(1, wtr(wtc(wp("Outer"), wtbl(1, wtr(wtc(wp("Inner")))))));
  const bytes = docxBytes(body);
  const entry = getFormat("docx");
  const own = await entry.text(await entry.parts(bytes));
  assert.equal(own.container, "docx");
  assert.deepEqual(own.tables.map((t) => t.ref), ["table 1", "table 2", "table 3"]);
  const w = fresh();
  const r = await readDocx(w, bytes);
  assert.equal(r.reading.text_container, "docx");
  assert.deepEqual(r.reading.cells, Object.fromEntries(own.tables.map((t) => [t.ref, t.cells])));
  assert.deepEqual(r.reading.cells["table 1"], [dc("table 1, A1", "Date"), dc("table 1, B1", "Amount"),
                                                dc("table 1, A2", "2026-03-14"), dc("table 1, B2", "$1,250.00")]);
  assert.deepEqual(r.reading.cells["table 3"], [dc("table 3, A1", "Inner")], "the nested table is its own key");
  assert.deepEqual(JSON.parse(JSON.stringify(r.reading)).cells, r.reading.cells, "the cells survive the wire");
});

test("R28: a .docx body with no tables reads cells {}, one not read (over its size guard or unreadable) reads cells null, kept distinct; metadata as emitted", async () => {
  const w = fresh();
  const plain = await readDocx(w, docxBytes(wp("No tables here")));
  assert.deepEqual(plain.reading.cells, {});
  /* The real entry's two branches that walk no body (over the guard; a main part it cannot read) say `tables: null`. */
  const unread = await withEntry({ format: "t28u", text: async () => ({ ok: true, container: "docx", document: null, paragraphs: [],
      tables: null, metadata: null, undetermined: [{ reason: "size_guard" }], counts: { chars: 0, undetermined: 1 } }) },
    async () => { const d = await hold(w.evidence, "t28u bytes"); return w.read(doc({ digest: d, format: "t28u", ct: "application/x" })); });
  assert.equal(unread.reading.cells, null);
  assert.equal("cells" in unread.reading, true, "null, never absent");
  const empty = await withEntry({ format: "t28e", text: async () => ({ ok: true, container: "docx", document: "x", paragraphs: [{ para: 0, text: "x" }],
      tables: [], metadata: META, undetermined: [], counts: { chars: 1, undetermined: 0 } }) },
    async () => { const d = await hold(w.evidence, "t28e bytes"); return w.read(doc({ digest: d, format: "t28e", ct: "application/x" })); });
  assert.deepEqual(empty.reading.cells, {});
  assert.deepEqual(empty.reading.metadata, META);
});

test("R28 R23: emittedFieldsOf over a .docx text: cells by table ref, the entry's own lists unaltered, {} for no tables, null for tables null, a table with no ref no key", () => {
  const c1 = [dc("table 1, A1", "2026-01-01")], c2 = [dc("table 2, A1", "nested")];
  const t = { container: "docx", metadata: null, tables: [{ table: 0, ref: "table 1", rows: 1, cols: 1, cells: c1 },
    { table: 1, ref: "table 2", rows: 1, cols: 1, cells: c2 }, { table: 2, ref: "table 3", rows: 0, cols: null }, { table: 3, cells: c1 }, null] };
  const pristine = structuredClone(t);
  const got = emittedFieldsOf(t);
  assert.deepEqual(got, { metadata: null, cells: { "table 1": c1, "table 2": c2, "table 3": null } });
  assert.equal(got.cells["table 1"], c1, "the entry's own list, not a copy");
  assert.deepEqual(t, pristine);
  assert.deepEqual(emittedFieldsOf({ container: "docx", tables: [] }), { metadata: null, cells: {} });
  assert.deepEqual(emittedFieldsOf({ container: "docx", tables: null }), { metadata: null, cells: null });
  assert.deepEqual(emittedFieldsOf({ container: "pptx", tables: [{ ref: "table 1", cells: c1 }] }), { metadata: null });
});
