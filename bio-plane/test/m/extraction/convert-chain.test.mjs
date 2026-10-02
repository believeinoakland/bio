/* extraction: what the record keeps and reads back of a reading's transcription chain, at the module's interface.
   Converts extraction's share of three `build/jobs/T17/legacy-tests.md` rows (the old suites were deleted in T20, K931):
   `test/drive-convert.test.mjs`, `test/producer-provenance.test.mjs` and `test/reading-wire.test.mjs`. Here: R19's
   writer, R27's `readingFor` and R29's `transcribedDocuments` over those readings, and R18's view. The chain each
   reading is composed with (the Drive conversion, `layer -> ocr(<product>)`, the partial-decode statement, the failed
   readings naming tier 1's marker, and the over-strictness pins) is `reading-pipeline`'s since N513 (its R2, R10, R11),
   and those cases moved there. `Extraction#read` runs over bytes held in the evidence bucket, with the capture
   documents built as capture's acquire answer carries them (the Drive hop by its own builder). R18: the agenda readers
   run over the view record-core's `jurisdiction_profiles` names, set here, never a fallback. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";
import { fresh, bundle, hold, doc, sha } from "./fixture.mjs";
import { readDriveAddress, driveHop } from "../../../src/drive.mjs";
/* The ODF media types (OpenDocument v1.2 part 3, the mimetype each package declares). */
const ODT_CONTENT_TYPE = "application/vnd.oasis.opendocument.text";
const ODS_CONTENT_TYPE = "application/vnd.oasis.opendocument.spreadsheet";
const ODP_CONTENT_TYPE = "application/vnd.oasis.opendocument.presentation";

/* ---- a zip assembler and ODF packages (converted from drive-convert.test.mjs) ---- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1; }
  return (c ^ 0xffffffff) >>> 0;
}
const u16 = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]);
const u32 = (n) => Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8"), data = Buffer.from(f.data, "utf-8");
    const method = f.store ? 0 : 8, comp = method === 8 ? deflateRawSync(data) : data, crc = crc32(data);
    const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0x0800), u16(method), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length), u16(nameB.length), u16(0), nameB, comp]);
    const central = Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(method), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length), u16(nameB.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameB]);
    locals.push(local); centrals.push(central); offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  return new Uint8Array(Buffer.concat([...locals, cd, Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(files.length),
    u16(files.length), u32(cd.length), u32(offset), u16(0)])]));
}
const NS = ["office", "text", "table", "drawing", "presentation"]
  .map((n) => `xmlns:${n === "drawing" ? "draw" : n}="urn:oasis:names:tc:opendocument:xmlns:${n}:1.0"`).join(" ");
const BODY = {
  odt: `<office:text><text:p>Oakland Police Commission, agenda of 14 September 2026.</text:p></office:text>`,
  ods: `<office:spreadsheet><table:table table:name="Budget"><table:table-row>`
     + `<table:table-cell office:value-type="string"><text:p>General Fund</text:p></table:table-cell>`
     + `</table:table-row></table:table></office:spreadsheet>`,
  odp: `<office:presentation><draw:page draw:name="page1"><draw:frame><draw:text-box>`
     + `<text:p>Capital plan</text:p></draw:text-box></draw:frame></draw:page></office:presentation>`,
};
const MIME = { odt: ODT_CONTENT_TYPE, ods: ODS_CONTENT_TYPE, odp: ODP_CONTENT_TYPE };
const odf = (flavour, body = BODY[flavour]) => zip([
  { name: "mimetype", data: MIME[flavour], store: true },
  { name: "META-INF/manifest.xml", data: `<?xml version="1.0" encoding="UTF-8"?>`
    + `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">`
    + `<manifest:file-entry manifest:full-path="/" manifest:media-type="${MIME[flavour]}"/></manifest:manifest>` },
  { name: "content.xml", data: `<?xml version="1.0" encoding="UTF-8"?>`
    + `<office:document-content ${NS} office:version="1.3"><office:body>${body}</office:body></office:document-content>` },
]);

/* ---- a PDF assembler (the old suites'): an ASCII identity ToUnicode, so the decoded text is known ---- */
function pdf(objs, trailer = "") {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"), o.stream, Buffer.from("\nendstream\n", "latin1"));
    else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from(trailer + "%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const CMAP = Buffer.from(`/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`, "latin1");
const content = (lines) => Buffer.from("BT /F1 10 Tf " + lines.map((l, j) => (j ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET", "latin1");
/* producer-provenance's and reading-wire's one-page PDF, with an optional /Info */
function onePage(lines, infoBody = null) {
  const cbuf = content(lines);
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${cbuf.length} >>`, stream: cbuf },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
    { num: 6, head: `<< /Length ${CMAP.length} >>`, stream: CMAP },
  ];
  if (infoBody) objs.push({ num: 7, body: infoBody });
  return pdf(objs, infoBody ? `trailer\n<< /Root 1 0 R /Info 7 0 R >>\n` : "");
}
/* the measured Legistar agenda text shape (producer-provenance's and reading-wire's) */
const agendaLines = (subject, n1, n2, n3) => ["Thursday, July 16, 2026", "City of Oakland", "Office of the City Clerk",
  "*Rules & Legislation Committee", " Agenda - SUPPLEMENTAL", "Roll Call /  Call To Order", "Subject: ", subject, "From: ",
  "Office Of The City Clerk", "Recommendation: Adopt A Resolution On Consent", "3.1", n1, "Subject: ",
  "Coliseum Payment Allocation", "From: ", "Finance Department", "Recommendation: Receive An Informational Report", "3.2", n2,
  "Determination Of Schedule Of Outstanding Committee Items", "2", n3, "Open Forum", "Adjournment"];
const ENCRYPT = "<< /Filter /Standard /V 2 /R 3 /O (0000000000000000) /U (0000000000000000) /P -44 >>";

/* ---- reading a capture ---- */
const RETRIEVED = "2026-09-18T00:00:00Z";
const LEGISTAR = (name) => `https://oakland.legistar.com/${name}`;
/* R18: the instance's view names the profile whose file-number shape the agenda fixtures carry. */
function instance() {
  const w = fresh();
  w.core.setSetting("jurisdiction_profiles", ["oakland-alameda"], "member:admin");
  return w;
}
async function readBytes(w, bytes, { format, ct, locator, chain = null, env = {} }) {
  const d = await hold(w.evidence, bytes);
  const out = await w.x.read(doc({ digest: d, bytes: bytes.length, ct, format, locator, retrieved: RETRIEVED, chain,
                                   headers: [["content-type", ct]] }), { env });
  return { d, out, r: out.reading };
}
const readPdf = (w, bytes, locator, env = {}) => readBytes(w, bytes, { format: "pdf", ct: "application/pdf", locator, env });
const digest = (c) => sha(JSON.stringify(c ?? null));

/* The layer step as the old suites' op-level answers carried it (drive-convert's pins were measured there, D-535). */
const LAYER_MEASURED_BY = "unmeasured: a text layer is itself an unverified transcription (CPDF-9, the MEASUREMENTS ledger 2026-08-03)";
const layerStep = (container) => ({ step: "layer", tier: 1, container, cap: null, measured_by: LAYER_MEASURED_BY, calibration: null });

/* ---- the Drive captures: capture's hop builders over the three kinds ---- */
const DRIVE = {
  odt: "https://docs.google.com/document/d/1AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTt/edit",
  ods: "https://docs.google.com/spreadsheets/d/1BbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUu/edit#gid=0",
  odp: "https://docs.google.com/presentation/d/1CcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVv/edit",
};
const directHop = { who: "instance t", asserts: "served", via: "direct", bound: false };
function driveChain(fmt) {
  const drive = readDriveAddress(DRIVE[fmt]);
  assert.equal(drive.format, fmt, "the recogniser names the export format");
  return [directHop, driveHop(drive, { retrieved: RETRIEVED })];
}
async function readDrive(w, fmt) {
  const drive = readDriveAddress(DRIVE[fmt]);
  return readBytes(w, odf(fmt), { format: fmt, ct: MIME[fmt], locator: drive.exportAddress, chain: driveChain(fmt) });
}

test("R19 R27 R29 (drive-convert): written, the Drive reading's chain persists step for step; readingFor states it with the conversion first; transcribedDocuments carries it transcribed, two steps, terminal layer, google-export among the engines, derivation cap null, and convert in its step vocabulary", async () => {
  const w = instance();
  bundle(w.s, "INFO-2026-9180-drive");
  const { d, r } = await readDrive(w, "odt");
  w.x.writeReading({ bundleId: "INFO-2026-9180-drive", captureSha: d, reading: r, profileFormat: "odt", author: "member:m1" });
  const back = w.x.readingFor(d, "class:admin");
  assert.equal(back.found, true);
  assert.deepEqual(back.reading.text_source, r.text_source, "the persisted chain is the read chain");
  assert.equal(digest(back.reading.text_source), digest(r.text_source));
  assert.deepEqual([back.text_provenance.transcribed, back.text_provenance.terminal_step, back.text_provenance.engines,
                    back.text_provenance.derivation_cap, back.text_provenance.steps], [true, "layer", ["google-export"], null, 2]);
  assert.equal(back.text_provenance.says,
    "the document as converted by the host that served it (google-export to odt) -> the document's own text layer");
  const tp = w.x.transcribedDocuments({ limit: 50, viewer: "class:admin" });
  assert.ok(tp.kinds.includes("convert"), "convert is in the step vocabulary");
  const row = tp.documents.find((x) => x.capture_sha === d);
  assert.deepEqual(row, { capture_sha: d, bundle_id: "INFO-2026-9180-drive", transcribed: true, terminal_step: "layer",
                          engines: ["google-export"], derivation_cap: null, steps: 2 });
  assert.equal(w.one(`SELECT chain FROM reading_text_source WHERE capture_sha=?`, d).chain, JSON.stringify(r.text_source));
});

/* ---- producer-provenance's fixtures: the measured ABBYY string (CPDF-9) in its creator field, and no marker ---- */
const ABBYY = "ABBYY FineReader Engine 11";
const P = {
  abbyyCreator: onePage(agendaLines("Certified Enacted Resolution", "26-9501", "26-9502", "26-9503"), `<< /Producer (PDFWriter) /Creator (${ABBYY}) >>`),
  noInfo: onePage(agendaLines("Certified Enacted Resolution", "26-9531", "26-9532", "26-9533"), null),
};

test("R19 R29 (producer-provenance): written, transcribedDocuments with terminal step ocr finds the machine-transcribed document naming its engine and not the no-marker one; with terminal step layer the reverse", async () => {
  const w = instance();
  bundle(w.s, "B-ocr"); bundle(w.s, "B-layer");
  const a = await readPdf(w, P.abbyyCreator, LEGISTAR("abbyyCreator.pdf"));
  const n = await readPdf(w, P.noInfo, LEGISTAR("noInfo.pdf"));
  w.x.writeReading({ bundleId: "B-ocr", captureSha: a.d, reading: a.r, profileFormat: "pdf" });
  w.x.writeReading({ bundleId: "B-layer", captureSha: n.d, reading: n.r, profileFormat: "pdf" });
  const ocr = w.x.transcribedDocuments({ terminalStep: "ocr", limit: 50, viewer: "class:admin" });
  assert.deepEqual(ocr.documents, [{ capture_sha: a.d, bundle_id: "B-ocr", transcribed: true, terminal_step: "ocr",
                                     engines: [ABBYY], derivation_cap: null, steps: 2 }]);
  const layer = w.x.transcribedDocuments({ terminalStep: "layer", limit: 50, viewer: "class:admin" });
  assert.deepEqual(layer.documents.map((x) => [x.capture_sha, x.terminal_step, x.engines, x.steps]), [[n.d, "layer", [], 1]]);
});

/* ---- reading-wire's fixtures: the real packet (oakland.legistar.com/View.ashx?M=A&ID=1425405, fetched 2026-08-03)
   and an encrypted PDF ---- */
const REAL = new Uint8Array(readFileSync(new URL("../../fixtures/legistar-agenda-1425405.pdf", import.meta.url)));
const ENC = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
  { num: 4, body: ENCRYPT },
], "trailer\n<< /Root 1 0 R /Encrypt 4 0 R >>\n");

test("R27 R19 (reading-wire): written, readingFor answers the packet's reading with reader_found true and its entity count, and a failed reading persisted as such: found, reader_found false, entity count 0", async () => {
  const w = instance();
  bundle(w.s, "INFO-2026-0001-wire"); bundle(w.s, "INFO-2026-0002-wire");
  const real = await readPdf(w, REAL, "https://oakland.legistar.com/View.ashx?M=A&ID=1425405");
  w.x.writeReading({ bundleId: "INFO-2026-0001-wire", captureSha: real.d, reading: real.r, profileFormat: "pdf" });
  const back = w.x.readingFor(real.d, "class:admin");
  assert.deepEqual([back.found, back.reader_found, back.entity_count, back.content_type, back.bundle_id],
                   [true, true, real.r.entities.length, "meeting_agenda", "INFO-2026-0001-wire"]);
  assert.equal(back.entity_count, 41);
  const enc = await readPdf(w, ENC, LEGISTAR("enc.pdf"));
  w.x.writeReading({ bundleId: "INFO-2026-0002-wire", captureSha: enc.d, reading: enc.r, profileFormat: "pdf" });
  const e = w.x.readingFor(enc.d, "class:admin");
  assert.deepEqual([e.found, e.reader_found, e.entity_count], [true, false, 0]);
});

test("R18 (reading-wire's odd note): the real packet's file numbers are recognised through the view record-core's jurisdiction_profiles names; an instance naming none, or none that exists, reads under the empty view, never a default, and reads no reference from it", async () => {
  const set = instance();
  const withView = (await readPdf(set, REAL, "https://oakland.legistar.com/View.ashx?M=A&ID=1425405")).r;
  assert.equal(withView.entities.length, 41);
  const empty = fresh();
  empty.core.setSetting("jurisdiction_profiles", [], "member:admin");
  const none = (await readPdf(empty, REAL, "https://oakland.legistar.com/View.ashx?M=A&ID=1425405")).r;
  assert.deepEqual([none.found, none.entities], [false, []]);
  assert.deepEqual(none.text_source, [layerStep("pdf")], "the chain does not depend on the view");
  /* never a default: an instance that names no profile, or names one that does not exist, reads as the empty view,
     not as every held profile combined (docprofile's K39 fallback for a caller handing no view) */
  for (const setting of [undefined, ["no-such-profile"]]) {
    const unset = fresh();
    if (setting) unset.core.setSetting("jurisdiction_profiles", setting, "member:admin");
    const r = (await readPdf(unset, REAL, "https://oakland.legistar.com/View.ashx?M=A&ID=1425405")).r;
    assert.deepEqual([r.found, r.entities], [false, []], JSON.stringify(setting));
    assert.deepEqual(unset.x.view(), empty.x.view());
  }
});
