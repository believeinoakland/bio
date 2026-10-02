/* reading-pipeline: the transcription chain a reading carries, at `read`, called directly. Moved from `extraction`'s
   convert-chain.test.mjs (N513), its assertions unchanged; `extraction` keeps the cases that write the reading and read
   it back (its R19, R27, R29) and the one on the view's source (its R18). Its share of three
   `build/jobs/T17/legacy-tests.md` rows (the old suites were deleted in T20, K931):
   - `test/drive-convert.test.mjs`: R10's Drive conversion over the real odt/ods/odp entries, R11's determined reading,
     and the over-strictness arms (a city ODT, an archive replay and a city PDF gain no conversion), pinned by the
     digests the old suite measured (PRISTINE below);
   - `test/producer-provenance.test.mjs`: R10/R11's `layer -> ocr(<product>)` over the real pdf entry;
   - `test/reading-wire.test.mjs`: the real Legistar packet through the real pdf entry with R11's partial-decode
     statement, and R11's failed readings naming tier 1's marker.
   The capture documents are built as capture's acquire answer carries them (the Drive and archive hops by their own
   builders). R24: the agenda readers run over the view the caller hands in, here the instance's profiles combined. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";
import { fresh, hold, doc, sha } from "./fixture.mjs";
import { readDriveAddress, driveHop, driveConvertStep } from "../../../src/drive.mjs";
import { archiveHop } from "../../../src/cdx.mjs";
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
/* drive-convert's two-page city PDF */
function pages(list) {
  const kid = (i) => 5 + 2 * i;
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${list.map((_, i) => `${kid(i)} 0 R`).join(" ")}] /Count ${list.length} >>` },
    { num: 3, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 4 0 R >>" },
    { num: 4, head: `<< /Length ${CMAP.length} >>`, stream: CMAP },
  ];
  list.forEach((lines, i) => {
    const cbuf = content(lines);
    objs.push({ num: kid(i), body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] `
      + `/Resources << /Font << /F1 3 0 R >> >> /Contents ${kid(i) + 1} 0 R >>` });
    objs.push({ num: kid(i) + 1, head: `<< /Length ${cbuf.length} >>`, stream: cbuf });
  });
  return pdf(objs);
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
/* R24: the view handed in names the profile whose file-number shape the agenda fixtures carry. */
const instance = () => fresh({ profiles: ["oakland-alameda"] });
async function readBytes(w, bytes, { format, ct, locator, chain = null, env = {} }) {
  const d = await hold(w.evidence, bytes);
  const out = await w.read(doc({ digest: d, bytes: bytes.length, ct, format, locator, retrieved: RETRIEVED, chain,
                                   headers: [["content-type", ct]] }), { env });
  return { d, out, r: out.reading };
}
const readPdf = (w, bytes, locator, env = {}) => readBytes(w, bytes, { format: "pdf", ct: "application/pdf", locator, env });
const steps = (c) => (Array.isArray(c) ? c.map((s) => s.step) : c);
const digest = (c) => sha(JSON.stringify(c ?? null));

/* The layer step as the old suites' op-level answers carried it (drive-convert's pins were measured there, D-535). */
const LAYER_MEASURED_BY = "unmeasured: a text layer is itself an unverified transcription (CPDF-9, the MEASUREMENTS ledger 2026-08-03)";
const layerStep = (container) => ({ step: "layer", tier: 1, container, cap: null, measured_by: LAYER_MEASURED_BY, calibration: null });
/* The PRISTINE pins, converted from drive-convert.test.mjs, measured on the tree before the conversion existed (and re-measured by
   D-535): every non-Drive chain, and the Drive chain behind its conversion, is byte-identical to them. */
const PRISTINE = {
  cityOdt:     "7aa7a9a9804fcfb7134eb8fb0b0991787e9be5895a6f9c3d0d76ad196ec29665",
  cityPdf:     "eeb2db5a85c7a8ab35f3751a57ecd5c5082000cd51d27cad030cab651e0ce34f",
  archivedOdt: "7aa7a9a9804fcfb7134eb8fb0b0991787e9be5895a6f9c3d0d76ad196ec29665",
  driveOdtPre: "7aa7a9a9804fcfb7134eb8fb0b0991787e9be5895a6f9c3d0d76ad196ec29665",
};

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

test("R10 R11 (drive-convert): a Drive export (odt, ods, odp) read through its real entry carries exactly [convert(google-export, <format>), layer]: the conversion at the head, cap undetermined and stated with CAP-11 named, no calibration; the layer behind it the pre-conversion chain; the reading determined and nothing refused", async () => {
  const w = instance();
  for (const fmt of ["odt", "ods", "odp"]) {
    const { r } = await readDrive(w, fmt);
    const c = r.text_source;
    assert.deepEqual(steps(c), ["convert", "layer"], fmt);
    assert.deepEqual(c, [driveConvertStep({ format: fmt }), layerStep(fmt)], `${fmt}: the whole chain`);
    const head = c[0];
    assert.deepEqual([head.engine, head.format], ["google-export", fmt]);
    assert.ok(Object.prototype.hasOwnProperty.call(head, "cap") && head.cap === null, `${fmt}: cap present and null`);
    assert.match(head.measured_by, /unmeasured/);
    assert.match(head.measured_by, /CAP-11/);
    assert.equal(head.calibration, null);
    /* R10's refusal is not what happened: the step was stated, and the reading is determined over the export's text */
    assert.equal((r.basis.match(/C-35\.\d+ [A-Z_]+/) || [null])[0], null, `${fmt}: no chain refusal named`);
    assert.doesNotMatch(r.basis, /could not be stated honestly/);
    assert.deepEqual([r.read_from_text, r.text_tier, r.text_container], [true, 1, fmt], `${fmt}: R11 determined`);
    /* R14: the reading's provenance is over the chain the reading carries */
    assert.equal(r.provenance.text_tier, 1);
  }
  /* the layer step behind the conversion is byte-identical to the pre-conversion Drive chain */
  const { r } = await readDrive(w, "odt");
  assert.equal(digest(r.text_source.slice(1)), PRISTINE.driveOdtPre);
});

test("R10 (drive-convert, over-strictness): a city OpenDocument file (the same container, not a Drive export), an archive replay of one (two archive.org hops) and a city PDF gain no conversion; each chain is exactly the layer step, byte-identical to the pre-conversion pins", async () => {
  const w = instance();
  const city = await readBytes(w, odf("odt", `<office:text><text:p>City Clerk, notice of public hearing.</text:p></office:text>`),
                               { format: "odt", ct: ODT_CONTENT_TYPE, locator: "https://www.oaklandca.gov/notice.odt" });
  assert.deepEqual(city.r.text_source, [layerStep("odt")]);
  assert.equal(digest(city.r.text_source), PRISTINE.cityOdt);
  const ARC = "https://www.oaklandca.gov/minutes.odt", TS = "20240115120000";
  const replay = `https://web.archive.org/web/${TS}id_/${ARC}`;
  const arcBytes = odf("odt", `<office:text><text:p>Archived minutes of the Finance Committee.</text:p></office:text>`);
  const hop = archiveHop({ original: ARC, archived_at: "2024-01-15T12:00:00Z", statuscode: "200", timestamp: TS,
                           urlkey: "gov,oaklandca)/minutes.odt", digest: "MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MF", mimetype: ODT_CONTENT_TYPE }, replay);
  const archived = await readBytes(w, arcBytes, { format: "odt", ct: ODT_CONTENT_TYPE, locator: replay,
    chain: [{ who: "instance t", asserts: "served", via: "archive.org", bound: false }, hop] });
  assert.deepEqual(archived.r.text_source, [layerStep("odt")], "a replay is not a conversion");
  assert.equal(digest(archived.r.text_source), PRISTINE.archivedOdt);
  const cityPdf = await readPdf(w, pages([["City of Oakland", "Fiscal Year 2026 Budget"], ["Appendix A", "Schedule of transfers"]]),
                                "https://www.oaklandca.gov/budget.pdf");
  assert.deepEqual(cityPdf.r.text_source, [layerStep("pdf")]);
  assert.equal(digest(cityPdf.r.text_source), PRISTINE.cityPdf);
  for (const x of [city, archived, cityPdf]) assert.equal(x.r.read_from_text, true);
});

/* ---- producer-provenance's fixtures: the measured ABBYY string (CPDF-9), its other field, UTF-16BE, and no marker ---- */
const ABBYY = "ABBYY FineReader Engine 11";
const P = {
  abbyyCreator: onePage(agendaLines("Certified Enacted Resolution", "26-9501", "26-9502", "26-9503"), `<< /Producer (PDFWriter) /Creator (${ABBYY}) >>`),
  tesseractProducer: onePage(agendaLines("Certified Enacted Resolution", "26-9511", "26-9512", "26-9513"), "<< /Producer (Tesseract 5.3.4) >>"),
  abbyyUtf16: onePage(agendaLines("Certified Enacted Resolution", "26-9521", "26-9522", "26-9523"),
    "<< /Producer <FEFF0041004200420059005900200046 0069006E0065005200650061006400650072> >>"),
  noInfo: onePage(agendaLines("Certified Enacted Resolution", "26-9531", "26-9532", "26-9533"), null),
  word: onePage(agendaLines("Certified Enacted Resolution", "26-9541", "26-9542", "26-9543"), "<< /Producer (Microsoft: Word 2016) /Creator (Microsoft Word) >>"),
  unanticipated: onePage(agendaLines("Certified Enacted Resolution", "26-9551", "26-9552", "26-9553"), "<< /Producer (Scanbot Document Recognition Suite 9.2) >>"),
  malformed: onePage(agendaLines("Certified Enacted Resolution", "26-9561", "26-9562", "26-9563"), "<< /Producer 42 /Creator 99 0 R >>"),
};
const NAMED_BY_INFO = /NAMED by the document's own \/Info/;

test("R10 R11 (producer-provenance): through the real pdf entry, a text layer whose /Info names OCR software reads exactly [layer, ocr(<product>)]: the product as the file spelled it, the field and marker row that said so, no version, cap null with measured_by naming /Info; the basis names the product as a derivation sequence; the reading still determined at tier 1", async () => {
  const w = instance();
  for (const [key, engine, field, marker] of [["abbyyCreator", ABBYY, "creator", "abbyy"],
                                              ["tesseractProducer", "Tesseract 5.3.4", "producer", "tesseract"],
                                              ["abbyyUtf16", "ABBYY FineReader", "producer", "abbyy"]]) {
    const { r } = await readPdf(w, P[key], LEGISTAR(`${key}.pdf`));
    assert.deepEqual(steps(r.text_source), ["layer", "ocr"], key);
    assert.deepEqual(r.text_source[0], layerStep("pdf"), `${key}: the layer step survived, the classification appended`);
    const ocr = r.text_source[1];
    assert.deepEqual(Object.keys(ocr).sort(), ["cap", "engine", "field", "marker", "measured_by", "step", "version"], key);
    assert.deepEqual([ocr.engine, ocr.field, ocr.marker, ocr.version, ocr.cap], [engine, field, marker, null, null], key);
    assert.match(ocr.measured_by, NAMED_BY_INFO);
    assert.ok(r.basis.includes(engine), `${key}: the basis names the product`);
    assert.match(r.basis, /text layer -> optical character recognition/);
    assert.deepEqual([r.found, r.read_from_text, r.text_tier, r.text_container], [true, true, 1, "pdf"], key);
  }
});

test("R10 (producer-provenance): a layer with no OCR marker (no /Info, authoring software, an unanticipated spelling, malformed metadata) stays exactly [layer], and \"authored\" appears nowhere in its chain", async () => {
  const w = instance();
  for (const key of ["noInfo", "word", "unanticipated", "malformed"]) {
    const { r } = await readPdf(w, P[key], LEGISTAR(`${key}.pdf`));
    assert.deepEqual(r.text_source, [layerStep("pdf")], key);
    assert.doesNotMatch(JSON.stringify(r.text_source), /authored/i, key);
    assert.equal(r.found, true, `${key}: read, as the marked ones are`);
  }
});

/* ---- reading-wire's fixtures: the real packet (oakland.legistar.com/View.ashx?M=A&ID=1425405, fetched 2026-08-03),
   a mini agenda naming three entities, an encrypted PDF, and a no-ToUnicode PDF tier 1 cannot decode ---- */
const REAL = new Uint8Array(readFileSync(new URL("../../fixtures/legistar-agenda-1425405.pdf", import.meta.url)));
const THREE = onePage(agendaLines("Grand Performance Mural", "26-9901", "26-9902", "26-9903"));
const ENC = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
  { num: 4, body: ENCRYPT },
], "trailer\n<< /Root 1 0 R /Encrypt 4 0 R >>\n");
function xrefPdf(bodies) {
  let p = "%PDF-1.7\n%\xe2\xe3\xcf\xd3\n";
  const offsets = [];
  bodies.forEach((body, i) => { offsets[i] = p.length; p += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  const xrefStart = p.length, n = bodies.length + 1;
  let xref = `xref\n0 ${n}\n0000000000 65535 f \n`;
  for (let i = 0; i < bodies.length; i++) xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  return new Uint8Array(Buffer.from(p + xref + `trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`, "latin1"));
}
const CID_STREAM = "BT /F1 24 Tf 72 700 Td (Hello Oakland 2026) Tj ET";
const CID = xrefPdf([
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${CID_STREAM.length} >>\nstream\n${CID_STREAM}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
]);

test("R2 R10 R11 (reading-wire): the real Legistar packet read through the real pdf entry at tier 1 is a determined reading over [layer], and its 45-code-point residue is stated on the basis as a PARTIAL decode; a full decode is not called partial", async () => {
  assert.equal(sha(REAL), "16cb1adf6d35116dbc475ae39ac1757f28cd549e7ff5b7f6d5bb7c660503570c", "the packet's bytes are the measured ones");
  const w = instance();
  const { r } = await readPdf(w, REAL, "https://oakland.legistar.com/View.ashx?M=A&ID=1425405");
  assert.deepEqual(r.text_source, [layerStep("pdf")]);
  assert.deepEqual([r.read_from_text, r.found, r.text_tier, r.text_container, r.content_type], [true, true, 1, "pdf", "meeting_agenda"]);
  assert.match(r.basis, /^read by the meeting_agenda reader v1 over pdf the document's own text layer \(tier 1\)/, "the reader, the chain and the tier");
  assert.match(r.basis, /PARTIAL decode, stated: 45 undetermined/);
  assert.match(r.basis, /every reference carries where it was read \(41 of 41\)/, "where references were read");
  const three = await readPdf(w, THREE, LEGISTAR("three.pdf"));
  assert.deepEqual([three.r.found, three.r.text_tier], [true, 1]);
  assert.doesNotMatch(three.r.basis, /PARTIAL/);
});

test("R11 R21 (reading-wire): text tier 1 could not determine is a failed reading naming tier 1's own marker: an encrypted PDF (encrypted), and with no pdf-worker bound a font with no Unicode map (no_tounicode); no entity invented, no reader claimed to have run", async () => {
  const w = instance();
  const enc = (await readPdf(w, ENC, LEGISTAR("enc.pdf"))).r;
  assert.deepEqual([enc.found, enc.entities, enc.read_from_text], [false, [], false]);
  assert.match(enc.basis, /encrypted/);
  const cid = (await readPdf(w, CID, LEGISTAR("cid.pdf"))).r;
  assert.deepEqual([cid.found, cid.entities, cid.read_from_text, cid.text_tier], [false, [], false, 1]);
  assert.match(cid.basis, /no_tounicode/);
  assert.match(cid.basis, /no pdf-worker member is bound/, "the tier-2 note");
});
