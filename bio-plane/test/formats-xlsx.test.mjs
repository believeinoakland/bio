/* The XLSX registry entry (QUEUE COFF-3), tested against a workbook BUILT
 * HERE, hermetically, modelled on the real Oakland corpus COFF-6 measured
 * (an adopted-budget summary workbook: departments and totals on a visible
 * sheet, a SUM formula over a column, external hyperlinks into
 * oaklandca.gov, a mailto contact link, a cross-sheet reference, a defined
 * name, a hidden row, a hidden column, an embedded OLE object — and a
 * HIDDEN reconciliation sheet, the tenth-of-spreadsheets finding the
 * measurement showed is real). No multi-MB binary is committed; the zip is
 * assembled byte-by-byte with an independent crc32.
 *
 * The accepts-when cases, all present:
 *   - cell-referenced links: {kind:"sheet-cell", ref:"Summary!A2", ...} per
 *     IC-1 RESOLVED as amended, wrappers byte-identical to subresources.mjs's
 *     ONE linkWrapper (the HTML/PDF parity pin, same as pdfstructure.test.mjs)
 *   - formulas BESIDE values: the <f> and its cached <v> as two named fields
 *     on one evidentiary item (IC-2 as ACCEPTED — COFF-4's envelope, which
 *     this entry CONFIRMS), the text stream showing the VALUE and never the
 *     formula — distinguishable everywhere shown, cited or indexed (DEC-5)
 *   - a hidden sheet FLAGGED, in structure.sheets, in text.sheets, and as a
 *     first-class evidence finding
 *   - an over-bound workbook -> a STATED text-undetermined NAMING the
 *     measured bound and its metric (COFF-6's enactment), links surviving
 *     from the rels with the lost cell-join stated
 * Plus the detect confidence ladder (a bare PK prefix — the acquire-time
 * 1 KiB seam — must NOT claim xlsx), stated undetermineds for unreadable
 * sharedStrings, and the plain-zip / truncated-container refusals.
 */
/* NEGATIVE CONTROL: (1) collapse <f> into <v> — in src/formats-xlsx.mjs's formula-item emit, replace `formula: c.f` with `formula: c.v` -> the suite fails NAMING the formula/value distinction. RE-RUN 2026-08-03 against the conformed `evidentiary` envelope: 3 of 75 failed ("the formula is held BESIDE its cached value — TWO named fields, both present", "never collapsed: the formula is not the value", "the hidden sheet's cross-sheet formula is held too"); restored -> 75 pass 0 fail. (2) strip the hidden flag — in src/formats-xlsx.mjs's sheets mapping, replace `hidden: state === "visible" ? false : state` with `hidden: false` -> the suite fails on the hidden flag everywhere it is surfaced. RE-RUN 2026-08-03 against the conformed shape: 6 of 75 failed ("Reconciliation is FLAGGED hidden", "sheets carried with hidden flags", "the hidden SHEET is a first-class finding (source null — workbook-scoped, stated)", "and enumerates its kinds", "per-sheet units, hidden flags carried", "the hidden SHEET is still flagged (workbook.xml is not a text part)"); restored -> 75 pass 0 fail. */

import { deflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";
import { getFormat, listFormats, detectFormat } from "../src/formats.mjs";
import { xlsxEntry, XLSX_CONTENT_TYPE } from "../src/formats-xlsx.mjs";
import { linkWrapper } from "../src/subresources.mjs";
import { MEASURED_OOXML_TEXT_BOUND_BYTES } from "../src/ooxml.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ---- independent crc32 + zip assembler (the ooxml.test.mjs pattern: the
 * fixture builder must not inherit a defect from the module under test) ---- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
function u16le(n) { return Buffer.from([n & 0xff, (n >> 8) & 0xff]); }
function u32le(n) { return Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]); }
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8");
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, "utf-8");
    const method = f.store ? 0 : 8;
    const comp = method === 8 ? deflateRawSync(data) : data;
    const crc = f.badCrc ? (crc32(data) ^ 0xdeadbeef) >>> 0 : crc32(data);
    const local = Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), nameB, comp,
    ]);
    const central = Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0), u32le(0), u32le(offset), nameB,
    ]);
    locals.push(local); centrals.push(central); offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    u32le(0x06054b50), u16le(0), u16le(0), u16le(files.length), u16le(files.length),
    u32le(cd.length), u32le(offset), u16le(0),
  ]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

/* ---- the Oakland-modelled workbook ---- */
const XLSX_MAIN_CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml";
const CONTENT_TYPES = `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${XLSX_MAIN_CT}"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;
const ROOT_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
const WORKBOOK = `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Summary" sheetId="1" r:id="rId1"/><sheet name="Detail" sheetId="2" r:id="rId2"/><sheet name="Reconciliation" sheetId="3" state="hidden" r:id="rId3"/></sheets><definedNames><definedName name="TotalBudget">Summary!$B$14</definedName></definedNames></workbook>`;
const WORKBOOK_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`;
const SHARED_STRINGS = `<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="8" uniqueCount="8"><si><t>Department</t></si><si><t>Police</t></si><si><t>Fire</t></si><si><t>Total</t></si><si><r><t>See </t></r><r><t>adopted budget</t></r></si><si><t>Contact clerk</t></si><si><t>Reconciliation notes — not in the published PDF</t></si><si><t>General Fund transfer pending</t></si></sst>`;
const BUDGET_URL = "https://www.oaklandca.gov/documents/fy26-adopted-budget?view=adopted&fy=2026";
const SHEET1 = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><cols><col min="3" max="3" width="9" hidden="1"/></cols><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="inlineStr"><is><t>FY26 Adopted</t></is></c></row><row r="2"><c r="A2" t="s"><v>1</v></c><c r="B2"><v>2200000</v></c></row><row r="3"><c r="A3" t="s"><v>2</v></c><c r="B3"><v>2000000</v></c></row><row r="5"><c r="A5" t="s"><v>5</v></c></row><row r="9" hidden="1"><c r="A9" t="s"><v>7</v></c></row><row r="14"><c r="A14" t="s"><v>3</v></c><c r="B14"><f>SUM(B2:B13)</f><v>4200000</v></c></row></sheetData><hyperlinks><hyperlink ref="A2" r:id="rId1"/><hyperlink ref="A5" r:id="rId2"/></hyperlinks></worksheet>`;
const SHEET1_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${BUDGET_URL.replace("&", "&amp;")}" TargetMode="External"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="mailto:clerk@oaklandca.gov" TargetMode="External"/></Relationships>`;
const SHEET2 = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>4</v></c></row></sheetData><hyperlinks><hyperlink ref="A1" location="Summary!B14" display="Total"/></hyperlinks></worksheet>`;
const SHEET3 = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>6</v></c><c r="B1"><f>Summary!B14*0.05</f><v>210000</v></c></row></sheetData></worksheet>`;
const CORE_XML = `<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>FY26 Adopted Budget Summary</dc:title><dc:creator>Budget Office</dc:creator><cp:lastModifiedBy>M. Analyst</cp:lastModifiedBy><cp:revision>9</cp:revision><dcterms:created xsi:type="dcterms:W3CDTF">2026-05-01T09:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-30T17:00:00Z</dcterms:modified></cp:coreProperties>`;
const OLE_BYTES = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 1, 2, 3, 4]);

const workbookFiles = (overrides = {}) => [
  { name: "[Content_Types].xml", data: CONTENT_TYPES },
  { name: "_rels/.rels", data: ROOT_RELS },
  { name: "xl/workbook.xml", data: WORKBOOK },
  { name: "xl/_rels/workbook.xml.rels", data: WORKBOOK_RELS },
  { name: "xl/sharedStrings.xml", data: SHARED_STRINGS, ...(overrides.sharedStrings ?? {}) },
  { name: "xl/worksheets/sheet1.xml", data: overrides.sheet1 ?? SHEET1 },
  { name: "xl/worksheets/_rels/sheet1.xml.rels", data: SHEET1_RELS },
  { name: "xl/worksheets/sheet2.xml", data: SHEET2 },
  { name: "xl/worksheets/sheet3.xml", data: SHEET3 },
  { name: "docProps/core.xml", data: CORE_XML },
  { name: "xl/embeddings/oleObject1.bin", data: OLE_BYTES, store: true },
];
const WB = zip(workbookFiles());
const PLAIN_ZIP = zip([{ name: "readme.txt", data: "minutes, plain text" }]);

/* ================================================================== */
console.log("\n--- registration: the entry is on the registry (ONE registerFormat call in formats.mjs) ---");
t("xlsx is registered", listFormats().includes("xlsx"), true);
t("getFormat returns THE entry", getFormat("xlsx") === xlsxEntry, true);

console.log("\n--- the detect confidence ladder: a bare PK sniff must NOT claim xlsx ---");
t("full container: xlsx, by directory walk", detectFormat(WB, null).format, "xlsx");
t("but LIKELY, never certain — the declared main type lives in a deflated part",
  detectFormat(WB, null).confidence, "likely");
const prefix = WB.subarray(0, 1024); // the acquire-time seam: profile.format range-reads 1 KiB
t("a 1 KiB prefix (the acquire seam) is a stated undetermined, not an xlsx claim",
  detectFormat(prefix, null).format, "undetermined");
t("the prefix plus the declared xlsx content type: likely, from the CT pass",
  [detectFormat(prefix, XLSX_CONTENT_TYPE).format, detectFormat(prefix, XLSX_CONTENT_TYPE).confidence],
  ["xlsx", "likely"]);
t("content type alone: likely", detectFormat(null, XLSX_CONTENT_TYPE).confidence, "likely");
t("a full PLAIN zip never detects xlsx (no [Content_Types].xml)",
  detectFormat(PLAIN_ZIP, null).format, "undetermined");
t("the entry itself declines a plain zip", xlsxEntry.detect(PLAIN_ZIP, null), null);
t("and declines a wrong content type", xlsxEntry.detect(null, "application/zip"), null);

console.log("\n--- parts(): the container walk, flavour-confirmed, hidden sheets known ---");
const parts = await getFormat("xlsx").parts(WB);
t("parts ok", parts.ok, true);
t("three sheets in workbook order", parts.sheets.map((s) => s.name), ["Summary", "Detail", "Reconciliation"]);
t("their states", parts.sheets.map((s) => s.state), ["visible", "visible", "hidden"]);
t("Reconciliation is FLAGGED hidden", parts.sheets[2].hidden, "hidden");
t("shared strings loaded", parts.sharedStrings.length, 8);
t("a plain zip is a stated refusal, not a walk", (await xlsxEntry.parts(PLAIN_ZIP)).why, "not_xlsx:zip");
{
  let cut = -1;
  for (let p = 0; p < WB.length - 4; p++) {
    if (WB[p] === 0x50 && WB[p + 1] === 0x4b && WB[p + 2] === 0x01 && WB[p + 3] === 0x02) { cut = p; break; }
  }
  const truncated = new Uint8Array([...WB.slice(0, cut + 10), ...WB.slice(cut + 30)]);
  t("a truncated central directory is stated, never a partial walk",
    (await xlsxEntry.parts(truncated)).why, "central_directory_truncated");
}

console.log("\n--- structure(): cell-referenced links through the ONE linkWrapper (HTML/PDF parity) ---");
const structure = await getFormat("xlsx").structure(parts);
t("structure ok", structure.ok, true);
t("container named", structure.container, "xlsx");
const deferred = structure.links.find((l) => l.partition === "deferred");
t("the oaklandca.gov hyperlink is DEFERRED, its XML entity decoded",
  deferred.target.url, BUDGET_URL);
t("its wrapper is byte-identical to linkWrapper.deferred (imported, never re-derived)",
  deferred.wrapper, linkWrapper.deferred(BUDGET_URL));
t("and it is CELL-REFERENCED per IC-1: kind, ref, sheet, cell",
  deferred.source, { kind: "sheet-cell", ref: "Summary!A2", sheet: "Summary", cell: "A2" });
const refused = structure.links.find((l) => l.partition === "refused");
t("the mailto link is REFUSED with the exact refused wrapper",
  refused.wrapper, linkWrapper.refused());
t("from its own cell", refused.source.ref, "Summary!A5");
const anchors = structure.links.filter((l) => l.partition === "anchor");
const crossSheet = anchors.find((l) => l.target.location);
t("the cross-sheet hyperlink is an ANCHOR through linkWrapper.anchor",
  crossSheet.wrapper, linkWrapper.anchor("#Summary!B14"));
t("cell-referenced from the Detail sheet",
  crossSheet.source, { kind: "sheet-cell", ref: "Detail!A1", sheet: "Detail", cell: "A1" });
const definedName = anchors.find((l) => l.target.definedName);
t("the defined name is an ANCHOR naming itself and its ref",
  [definedName.target.definedName, definedName.target.ref], ["TotalBudget", "Summary!$B$14"]);
t("workbook-scoped: its null source is a statement, not an omission", definedName.source, null);
const intra = structure.links.find((l) => l.partition === "intra");
const oleSha = createHash("sha256").update(OLE_BYTES).digest("hex");
t("the embedded OLE object is INTRA, content-addressed by its true sha256",
  intra.target.sha256, oleSha);
t("through the intra wrapper exactly", intra.wrapper, linkWrapper.intra(oleSha));
t("counts by partition", structure.counts,
  { anchor: 2, intra: 1, deferred: 1, refused: 1, undetermined: 0 });
t("sheets carried with hidden flags",
  structure.sheets.map((s) => [s.name, s.hidden]),
  [["Summary", false], ["Detail", false], ["Reconciliation", "hidden"]]);

console.log("\n--- THE EVIDENTIARY CORE (DEC-5): the formula held BESIDE its cached value ---");
/* CORRECTED after COFF-4 landed first: the envelope key is `evidentiary` with
 * {container, kinds, items, undetermined, counts} — IC-2 as ACCEPTED from
 * docx.mjs's as-built code. The original assertions here pinned this worker's
 * own colliding filing (`evidence`, with `format`/`metadata` fields), which
 * never reached main and would have been a variant fork of the shared shape. */
const items = structure.evidentiary.items;
const fx = items.find((i) => i.kind === "formula" && i.source && i.source.ref === "Summary!B14");
t("the formula is held BESIDE its cached value — TWO named fields, both present",
  [fx.formula, fx.value], ["SUM(B2:B13)", "4200000"]);
t("never collapsed: the formula is not the value", fx.formula !== fx.value, true);
t("cell-referenced per IC-1", fx.source, { kind: "sheet-cell", ref: "Summary!B14", sheet: "Summary", cell: "B14" });
const fx3 = items.find((i) => i.kind === "formula" && i.source && i.source.sheet === "Reconciliation");
t("the hidden sheet's cross-sheet formula is held too",
  [fx3.formula, fx3.value], ["Summary!B14*0.05", "210000"]);
t("formula count in the envelope", structure.evidentiary.counts.formula, 2);

console.log("\n--- DEC-5: hidden rows, columns and SHEETS emitted flagged hidden ---");
const hiddenSheet = items.find((i) => i.kind === "hidden-sheet");
t("the hidden SHEET is a first-class finding (source null — workbook-scoped, stated)",
  hiddenSheet, { kind: "hidden-sheet", sheet: "Reconciliation", state: "hidden", source: null });
const hiddenRows = items.find((i) => i.kind === "hidden-rows");
t("the hidden ROW is flagged, by sheet and row number",
  [hiddenRows.sheet, hiddenRows.rows], ["Summary", [9]]);
const hiddenCols = items.find((i) => i.kind === "hidden-cols");
t("the hidden COLUMN is flagged, by range",
  [hiddenCols.sheet, hiddenCols.cols], ["Summary", [{ min: 3, max: 3 }]]);

console.log("\n--- core properties as a `core-properties` ITEM: the kind DOCX also emits ---");
/* CORRECTED: the superseded variant filing carried docProps as an envelope
 * `metadata` field; the ACCEPTED envelope (docx.mjs as built) carries it as an
 * item {kind:"core-properties", ..., source:null} — one vocabulary across the
 * office entries, so a consumer branches on kind once. */
const coreItem = items.find((i) => i.kind === "core-properties");
t("creator / lastModifiedBy / revision, on the item",
  [coreItem.creator, coreItem.lastModifiedBy, coreItem.revisionNumber],
  ["Budget Office", "M. Analyst", 9]);
t("its source is an explicit null (document-scoped)", coreItem.source, null);
t("the envelope names its container", structure.evidentiary.container, "xlsx");
t("and enumerates its kinds", structure.evidentiary.kinds,
  ["formula", "hidden-rows", "hidden-cols", "hidden-sheet", "core-properties"]);
t("nothing undetermined on the clean fixture", structure.evidentiary.undetermined, []);

console.log("\n--- text(): sharedStrings + cached <v> values; hidden sheets included AND flagged ---");
const text = await getFormat("xlsx").text(parts);
t("the accepted pageless form: ok + container (docx's paragraphs[] is sheets[] here)",
  [text.ok, text.container], [true, "xlsx"]);
t("the document text carries the shared strings",
  text.document.includes("Police") && text.document.includes("Department"), true);
t("run-split shared strings are joined", text.document.includes("See adopted budget"), true);
t("and the cached values", text.document.includes("2200000") && text.document.includes("4200000"), true);
t("the TEXT stream shows the cached value, never the formula (the derivation lives in the envelope)",
  text.document.includes("SUM(B2:B13)"), false);
t("the hidden sheet's text IS in the record (the file carries it)",
  text.document.includes("Reconciliation notes — not in the published PDF"), true);
t("the hidden ROW's cell too (hiding is a flag, not an omission)",
  text.document.includes("General Fund transfer pending"), true);
t("per-sheet units, hidden flags carried",
  text.sheets.map((s) => [s.name, s.hidden]),
  [["Summary", false], ["Detail", false], ["Reconciliation", "hidden"]]);
t("formulas counted where text is indexed", text.counts.formulas, 2);
t("nothing undetermined on the clean fixture", text.undetermined, []);

console.log("\n--- unreadable sharedStrings: every t=\"s\" cell is a STATED undetermined, never a guess ---");
{
  const broken = zip(workbookFiles({ sharedStrings: { badCrc: true } }));
  const p = await xlsxEntry.parts(broken);
  t("parts still ok (the failure is scoped to the part)", p.ok, true);
  t("the part failure is on the record", p.undetermined.some((u) => u.part === "xl/sharedStrings.xml" && u.why === "crc_mismatch"), true);
  const tx = await xlsxEntry.text(p);
  t("shared-string cells are stated undetermined, by cell",
    tx.undetermined.some((u) => u.cell === "A1" && u.reason === "shared_strings_unreadable"), true);
  t("while numeric values still read", tx.document.includes("2200000"), true);
}

console.log("\n--- THE ACCEPTANCE CASE: an over-bound workbook is a STATED text-undetermined, named ---");
{
  /* One sheet whose DECLARED uncompressed size exceeds the measured 20 MiB
   * text-part bound (COFF-6's metric: declared, summed from the central
   * directory, BEFORE inflation — the sheet is never inflated). */
  const bigSheet = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>${"A".repeat(MEASURED_OOXML_TEXT_BOUND_BYTES)}</t></is></c></row></sheetData></worksheet>`;
  const big = zip(workbookFiles({ sheet1: bigSheet }));
  const p = await xlsxEntry.parts(big);
  t("parts still ok — full central-directory and metadata treatment", p.ok, true);
  t("the guard measured the DECLARED text bytes over the bound (null under it, the marker over it)",
    p.guard != null && p.guard.ok === false, true);
  /* CORRECTED: the superseded variant filing spread the guard marker across
   * the text output's top level; the ACCEPTED form (docx.mjs as built)
   * carries the sizeGuard marker VERBATIM inside `undetermined[]`. */
  const tx = await xlsxEntry.text(p);
  const marker = tx.undetermined[0];
  t("text is a stated undetermined carrying the guard marker verbatim",
    marker.text, "undetermined");
  t("naming why", marker.why, "over_size_bound");
  t("naming the MEASURED bound", [marker.bound, marker.boundName],
    [MEASURED_OOXML_TEXT_BOUND_BYTES, "MEASURED_OOXML_TEXT_BOUND_BYTES"]);
  t("and the metric — declared uncompressed text-part bytes, not container size",
    marker.metric, "declared_uncompressed_text_part_bytes");
  t("no document text was silently truncated into existence", tx.document, null);
  t("counts state the refusal", tx.counts.undetermined, 1);
  const st = await xlsxEntry.structure(p);
  t("structure still runs over the bound", st.ok, true);
  t("the hidden SHEET is still flagged (workbook.xml is not a text part)",
    st.evidentiary.items.some((i) => i.kind === "hidden-sheet" && i.sheet === "Reconciliation"), true);
  t("the envelope's undetermined carries the guard, part-named",
    st.evidentiary.undetermined.some((u) => u.why === "over_size_bound" && u.guard && u.guard.boundName === "MEASURED_OOXML_TEXT_BOUND_BYTES"), true);
  const link = st.links.find((l) => l.partition === "deferred");
  t("outbound links survive from the rels", link.target.url, BUDGET_URL);
  t("with the lost cell join STATED, not invented",
    [link.source, link.note], [null, "cell_join_unavailable:over_size_bound"]);
  t("and the refusal is on structure's record too", st.notes.includes("text_parts_over_bound"), true);
}

console.log("\n--- structure()/text() on a failed parts result: honest, never a throw ---");
{
  const bad = await xlsxEntry.parts(PLAIN_ZIP);
  const st = await xlsxEntry.structure(bad);
  t("structure states the refusal", [st.ok, st.reason], [false, "not_xlsx:zip"]);
  /* CORRECTED: the accepted failed-parts text shape is {ok:false, container,
   * reason} (docx.mjs as built), not the variant's undetermined-marker list. */
  const tx = await xlsxEntry.text(bad);
  t("text states it too", tx, { ok: false, container: "xlsx", reason: "not_xlsx:zip" });
}

console.log(`\nformats-xlsx: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
