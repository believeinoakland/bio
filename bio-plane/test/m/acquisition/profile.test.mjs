/* acquisition R17: the profile the acquisition act records (`document.profile`), at the module's interface through
   `acquire` (fixture.mjs `run`) and the exported `profileOf` and `substanceDigests`. Converts acquisition's share of
   three legacy suites: `test/profile.test.mjs` (both axes of the profile, the PDF profiled honestly),
   `test/framework-digest-audit.test.mjs` (the rendition and evidentiary digests, the viewstate pair folding, the PDF's
   undetermined digests; its C-18.3 / op=audit arms are provenance's) and `test/capture-container-extent.test.mjs`
   (the FORMAT axis over office containers acquired; its container-extent, C-45.1 and reading arms are extraction's and
   content's). Office bytes are built here with a local ZIP writer; nothing reads them but the module under test.
   Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateRawSync } from "node:zlib";
import { world, run, sha } from "./fixture.mjs";
import { profileOf, profileView, substanceDigests, ODF_DIGEST_MAX } from "../../../src/acquisition/index.mjs";
import { registerDoctype, CONFIDENCE, CONTRACT } from "../../../../docprofile/registry.mjs";

/* docprofile registers no content type of its own (K1737), and the content types are wired in by the plane's
   composition root (plane R22), not by this module. So the content-type axis is judged here by two test-local types,
   registered through docprofile's own `registerDoctype`: a calendar recogniser (a version, a contract and two
   signals, for R17 to record as `doctypeFor` answers them) and the one fallback. */
registerDoctype({
  key: "test_calendar", label: "a test meeting calendar", version: 1, contract: CONTRACT.MEMBERSHIP,
  detect(ctx) {
    const t = String((ctx && ctx.text) || "");
    const signals = [/MeetingDetail\.aspx\?ID=/.test(t) && "meeting detail links", /<th>Agenda<\/th>/.test(t) && "an Agenda column"].filter(Boolean);
    return signals.length === 2 ? { match: true, confidence: CONFIDENCE.CERTAIN, signals } : { match: false, confidence: CONFIDENCE.NONE };
  },
});
registerDoctype({ key: "test_fallback", label: "a document of no recognised type", version: 1, fallback: true,
  contract: CONTRACT.SUBSTANCE, detect: () => ({ match: false, confidence: CONFIDENCE.NONE }) });

const HEX64 = /^[0-9a-f]{64}$/;
const ASPNET = { "x-powered-by": "ASP.NET", server: "Microsoft-IIS/10.0" };
const served = (body, ct, headers = {}) => () => new Response(body, { headers: { "content-type": ct, ...headers } });

/* ---- the pages (profile.test.mjs, framework-digest-audit.test.mjs) ---- */

/* A measured-shape ASP.NET WebForms meeting calendar: the __VIEWSTATE field makes the stack CERTAIN; the
   MeetingDetail.aspx?ID= links, the date-range control and the Agenda/Minutes columns make the content type CERTAIN;
   the <main role="main"> is the boundary the handler normalises around. */
const CAL_HTML = [
  '<!DOCTYPE html><html><head><title>City Council Calendar</title></head><body>',
  '<form id="aspnetForm" method="post">',
  '<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="/wEPDwUABBBBBB==" />',
  '<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="/wEdAAoCCC==" />',
  '<main id="mainContent" role="main">',
  '<select id="lstYears_Input" name="lstYears"><option>This Month</option></select>',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th><th>Minutes</th></tr>',
  '<tr><td><a href="MeetingDetail.aspx?ID=2101&GUID=ABC">City Council</a></td>',
  '<td>7/15/2026</td><td><a href="View.ashx?M=A&ID=1">Agenda</a></td>',
  '<td><a href="View.ashx?M=M&ID=1">Minutes</a></td></tr></table>',
  '</main></form></body></html>',
].join("");

/* `vs` is the per-render __VIEWSTATE (mechanical), `furniture` everything outside <main> (presentational), `body` the
   substance inside <main role="main"> (evidentiary). */
const cal = (vs, furniture, body) => [
  '<!DOCTYPE html><html><head><title>City Council Calendar</title></head><body>',
  `<div id="ctl00_divHeader">${furniture}</div>`,
  '<form id="aspnetForm" method="post">',
  `<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${vs}" />`,
  `<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="ev-${vs}" />`,
  '<main id="mainContent" role="main">',
  '<select id="lstYears_Input" name="lstYears"><option>This Month</option></select>',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>',
  body,
  '</table></main></form></body></html>',
].join("");
const ROW = (name, date) => `<tr><td><a href="MeetingDetail.aspx?ID=2101&GUID=ABC">${name}</a></td>`
  + `<td>${date}</td><td><a href="View.ashx?M=A&ID=1">Agenda</a></td></tr>`;
/* A and B: the same calendar (identical <main>), different viewstate and furniture; C: different substance. */
const PAGE_A = cal("STATE_ONE_" + "x".repeat(400), "nav one", ROW("City Council", "7/15/2026"));
const PAGE_B = cal("STATE_TWO_" + "y".repeat(900), "nav two, a longer footer rail", ROW("City Council", "7/15/2026"));
const PAGE_C = cal("STATE_ONE_" + "x".repeat(400), "nav one", ROW("Rules Committee", "7/22/2026"));

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a]); // "%PDF-1.7\n"
const PDF1 = new Uint8Array([...PDF, 0x31]);
const PDF2 = new Uint8Array([...PDF, 0x32]);

/* ---- an independent crc32 and ZIP writer (capture-container-extent.test.mjs's): the fixture must not inherit a
   defect from a container reader. `store: true` writes a member uncompressed, as OpenDocument requires of `mimetype`. */
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
    const name = Buffer.from(f.name, "utf-8");
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, "utf-8");
    const comp = f.store ? data : deflateRawSync(data);
    const method = f.store ? 0 : 8;
    const crc = crc32(data);
    const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0x0800), u16(method), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length), u16(name.length), u16(0), name, comp]);
    const central = Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(method), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]);
    locals.push(local); centrals.push(central); offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cd.length), u32(offset), u16(0)]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

/* ---- the OOXML containers (capture-container-extent.test.mjs's workbook, document and deck) ---- */
const RELS_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types";
const OFFICE_DOC_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument";
const types = (overrides) => `<?xml version="1.0"?><Types xmlns="${CT_NS}"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${overrides}</Types>`;
const rootRels = (target) => `<?xml version="1.0"?><Relationships xmlns="${RELS_NS}"><Relationship Id="rId1" Type="${OFFICE_DOC_REL}" Target="${target}"/></Relationships>`;

const XLSX_CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const SHEET_NAMES = ["Summary", "Detail", "Reconciliation"];
const sheetXml = (rows) => `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`
  + rows.map((cells, i) => `<row r="${i + 1}">` + cells.map((v, j) => `<c r="${String.fromCharCode(65 + j)}${i + 1}" t="inlineStr"><is><t>${v}</t></is></c>`).join("") + `</row>`).join("")
  + `</sheetData></worksheet>`;
const XLSX = zip([
  { name: "[Content_Types].xml", data: types(`<Override PartName="/xl/workbook.xml" ContentType="${XLSX_CT}.main+xml"/>`) },
  { name: "_rels/.rels", data: rootRels("xl/workbook.xml") },
  { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>`
      + SHEET_NAMES.map((n, i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") + `</sheets></workbook>` },
  { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="${RELS_NS}">`
      + SHEET_NAMES.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("") + `</Relationships>` },
  { name: "xl/worksheets/sheet1.xml", data: sheetXml([["Department", "FY26 Adopted"], ["Police", "2200000"], ["Fire", "2000000"]]) },
  { name: "xl/worksheets/sheet2.xml", data: sheetXml([["Fund 1010", "General Purpose Fund"]]) },
  { name: "xl/worksheets/sheet3.xml", data: sheetXml([["Reconciliation notes"]]) },
]);

const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PARAS = ["AGENDA REPORT", "SUBJECT: Midcycle Budget Amendments", "FISCAL IMPACT", "Adopt the accompanying resolution."];
const DOCX = zip([
  { name: "[Content_Types].xml", data: types(`<Override PartName="/word/document.xml" ContentType="${DOCX_CT}.main+xml"/>`) },
  { name: "_rels/.rels", data: rootRels("word/document.xml") },
  { name: "word/document.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>`
      + PARAS.map((p) => `<w:p><w:r><w:t>${p}</w:t></w:r></w:p>`).join("") + `</w:body></w:document>` },
  { name: "word/_rels/document.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="${RELS_NS}"/>` },
]);

const PPTX_CT = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const SLIDE_TITLES = ["PROPOSED MIDCYCLE BUDGET", "GENERAL PURPOSE FUND OUTLOOK", "FISCAL IMPACT"];
const PNS = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const PPTX = zip([
  { name: "[Content_Types].xml", data: types(`<Override PartName="/ppt/presentation.xml" ContentType="${PPTX_CT}.main+xml"/>`
      + SLIDE_TITLES.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")) },
  { name: "_rels/.rels", data: rootRels("ppt/presentation.xml") },
  { name: "ppt/presentation.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:presentation ${PNS}><p:sldIdLst>`
      + SLIDE_TITLES.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("") + `</p:sldIdLst></p:presentation>` },
  { name: "ppt/_rels/presentation.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="${RELS_NS}">`
      + SLIDE_TITLES.map((_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join("") + `</Relationships>` },
  ...SLIDE_TITLES.flatMap((title, i) => [
    { name: `ppt/slides/slide${i + 1}.xml`, data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sld ${PNS}><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>${title}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>` },
    { name: `ppt/slides/_rels/slide${i + 1}.xml.rels`, data: `<?xml version="1.0"?><Relationships xmlns="${RELS_NS}"/>` },
  ]),
]);

/* ---- the OpenDocument packages (capture-container-extent.test.mjs's .ods, and its .odt and .odp siblings): the
   `mimetype` member FIRST and STORED, a manifest, content.xml, styles.xml. `styles` varies the presentational part
   only, so two packages differing in it carry the same content.xml. */
const ODF_NS = ['xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"', 'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"', 'xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"',
  'xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"', 'xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0"'].join(" ");
const ODF_CT = { odt: "application/vnd.oasis.opendocument.text", ods: "application/vnd.oasis.opendocument.spreadsheet",
                 odp: "application/vnd.oasis.opendocument.presentation" };
const odsCell = (v) => `<table:table-cell office:value-type="string"><text:p>${v}</text:p></table:table-cell>`;
const ODF_BODY = {
  odt: (s) => `<office:text><text:p>${s}</text:p><text:p>Adopt the accompanying resolution.</text:p></office:text>`,
  ods: (s) => `<office:spreadsheet><table:table table:name="Appropriations"><table:table-row>${odsCell("Department")}${odsCell("FY26 Adopted")}</table:table-row>`
            + `<table:table-row>${odsCell(s)}${odsCell("2200000")}</table:table-row></table:table></office:spreadsheet>`,
  odp: (s) => `<office:presentation><draw:page draw:name="page1"><draw:frame><draw:text-box><text:p>${s}</text:p></draw:text-box></draw:frame></draw:page></office:presentation>`,
};
const odf = (flavour, substance = "Police", styles = "") => zip([
  { name: "mimetype", data: ODF_CT[flavour], store: true },
  { name: "META-INF/manifest.xml", data: `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">`
      + `<manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="${ODF_CT[flavour]}"/>`
      + `<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>` },
  { name: "content.xml", data: `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${ODF_NS} office:version="1.3"><office:automatic-styles/><office:body>${ODF_BODY[flavour](substance)}</office:body></office:document-content>` },
  { name: "styles.xml", data: `<?xml version="1.0"?><office:document-styles ${ODF_NS}>${styles}</office:document-styles>` },
]);

test("R17: an ASP.NET WebForms meeting calendar is profiled on both axes, each with its recogniser's version, confidence and signals, with the handler's normalisation and boundary, at the capture instant", async () => {
  const w = world();
  const r = await run(w, { "https://city.example/Calendar.aspx": served(CAL_HTML, "text/html; charset=utf-8", ASPNET) },
    { locator: "https://city.example/Calendar.aspx", authority: "City Clerk" });
  assert.equal(r.status, 200);
  const p = r.body.document.profile;
  assert.equal(typeof p, "object");
  /* the host stack axis */
  assert.equal(p.handler, "aspnet_webforms", "the profile names the host stack handler");
  assert.equal(typeof p.handler_label, "string");
  assert.equal(p.handler_version, 1, "the recogniser's version, so the judgment can be revised later");
  assert.equal(p.confidence, "certain");
  assert.ok(Array.isArray(p.signals) && p.signals.includes("__VIEWSTATE field"), "the handler's signals");
  assert.equal(p.document_kind, "index", "the document kind is read from the address");
  /* the content type axis */
  assert.equal(p.content_type, "test_calendar");
  assert.equal(p.content_type_version, 1, "the second recogniser's own version");
  assert.equal(p.content_type_confidence, "certain");
  assert.ok(Array.isArray(p.content_type_signals) && p.content_type_signals.length >= 2, "the second signal set");
  assert.equal(p.contract, "membership", "the monitoring contract the type declares");
  /* what was normalised, and the source's declared type */
  assert.ok(Array.isArray(p.normalised) && p.normalised.length >= 1, "the handler's normalisation is recorded");
  assert.ok(p.normalised.every((x) => x.region && x.label), "each normalisation names a region and a label");
  assert.equal(p.boundary, true, "the boundary the handler normalises around");
  assert.equal(p.source_content_type, "text/html", "the declared content type, distinct from the content TYPE");
  assert.equal(p.profiled_from_text, true);
  assert.equal(p.at, r.body.document.retrieved, "the profiling instant is the capture instant");
  assert.equal(p.format.format, "html");
  /* over the active profiles' combined view, the same judgment, and the view it was judged under is named */
  const v = world();
  v.core.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:admin");
  assert.deepEqual(profileView(v.core).ids, ["test-port-ellery"]);
  const rv = await run(v, { "https://city.example/Calendar.aspx": served(CAL_HTML, "text/html; charset=utf-8", ASPNET) },
    { locator: "https://city.example/Calendar.aspx", authority: "City Clerk" });
  const pv = rv.body.document.profile;
  assert.deepEqual([pv.handler, pv.content_type, pv.content_type_confidence, pv.jurisdiction_view],
                   ["aspnet_webforms", "test_calendar", "certain", ["test-port-ellery"]]);
});

test("R17: a PDF is profiled honestly, the conservative handler and the registered fallback type at no confidence, not read as text, its declared type kept, and its digests undetermined with the basis stated", async () => {
  const w = world();
  const r = await run(w, { "https://city.example/report.pdf": served(PDF, "application/pdf") },
    { locator: "https://city.example/report.pdf", authority: "City Auditor" });
  assert.equal(r.status, 200);
  const p = r.body.document.profile;
  assert.equal(p.handler, "conservative", "not a fabricated stack");
  assert.equal(p.content_type, "test_fallback", "not an invented type: the registered fallback");
  assert.equal(p.confidence, "none");
  assert.equal(p.profiled_from_text, false);
  assert.equal(p.source_content_type, "application/pdf");
  assert.equal(p.format.format, "pdf");
  /* framework-digest-audit: an unnormalisable document's digest is undetermined, never faked */
  const P1 = (await run(w, { "https://city.example/one.pdf": served(PDF1, "application/pdf") }, { locator: "https://city.example/one.pdf" })).body.document;
  const P2 = (await run(w, { "https://city.example/two.pdf": served(PDF2, "application/pdf") }, { locator: "https://city.example/two.pdf" })).body.document;
  for (const d of [P1, P2]) {
    assert.equal(d.profile.digests.determined, false);
    assert.equal(d.profile.digests.evidentiary, null, "absent, not a fabricated value");
    assert.equal(d.profile.digests.rendition, null);
    assert.equal(typeof d.profile.digests.basis, "string", "the basis states why");
  }
  assert.notEqual(P1.capture.sha256, P2.capture.sha256);
});

test("R17: a certain-stack page's digests are determined, rendition and evidentiary, identity not restated; the same page with a different viewstate and furniture folds to an equal evidentiary digest, and different substance does not", async () => {
  const w = world();
  const routes = { "https://city.example/a.aspx": served(PAGE_A, "text/html; charset=utf-8", ASPNET),
                   "https://city.example/b.aspx": served(PAGE_B, "text/html; charset=utf-8", ASPNET),
                   "https://city.example/c.aspx": served(PAGE_C, "text/html; charset=utf-8", ASPNET) };
  const acq = async (path) => (await run(w, routes, { locator: "https://city.example" + path, authority: "City Clerk" })).body.document;
  const A = await acq("/a.aspx"), B = await acq("/b.aspx"), C = await acq("/c.aspx");
  const dA = A.profile.digests, dB = B.profile.digests, dC = C.profile.digests;
  assert.equal(typeof dA, "object");
  assert.equal(dA.determined, true, "the stack was identified with certainty");
  assert.match(dA.rendition || "", HEX64);
  assert.match(dA.evidentiary || "", HEX64);
  assert.equal("identity" in dA, false, "identity is the capture sha, not restated");
  assert.notEqual(dA.evidentiary, A.capture.sha256, "normalisation happened");
  assert.equal(A.capture.sha256, sha(PAGE_A));
  /* the same document fetched twice */
  assert.notEqual(A.capture.sha256, B.capture.sha256, "the raw identities differ");
  assert.equal(dA.evidentiary, dB.evidentiary, "viewstate and furniture normalised: the evidentiary digests fold");
  assert.notEqual(dA.rendition, dB.rendition, "the furniture moved, so the rendition differs");
  /* a genuinely different document */
  assert.notEqual(dA.evidentiary, dC.evidentiary);
});

/* The format is judged from the stored bytes read back whole up to ODF_DIGEST_MAX (R17, K659): an office container's
   central directory lies at its end, so its bytes, never its label, say what it is. */
test("R17: office containers acquired (docx, xlsx, pptx, odt, ods, odp) are recognised on the format axis from their bytes, whatever the declared type, and none is read as text", async () => {
  const w = world();
  const cases = [["budget.xlsx", XLSX, XLSX_CT, "xlsx"], ["report.docx", DOCX, DOCX_CT, "docx"], ["deck.pptx", PPTX, PPTX_CT, "pptx"],
                 ["report.odt", odf("odt"), ODF_CT.odt, "odt"], ["budget.ods", odf("ods"), ODF_CT.ods, "ods"], ["deck.odp", odf("odp"), ODF_CT.odp, "odp"]];
  for (const [path, bytes, ct, format] of cases) {
    const r = await run(w, { [`https://city.example/${path}`]: served(bytes, ct) }, { locator: `https://city.example/${path}`, authority: "City" });
    assert.equal(r.status, 200, path);
    const p = r.body.document.profile;
    assert.equal(p.format.format, format, path);
    const fromBytes = (f) => f.signals.some((x) => /^magic:/.test(x));
    assert.ok(fromBytes(p.format), `${path}: from the bytes`);
    assert.equal(p.profiled_from_text, false, `${path}: a container, not read as text at intake`);
    assert.equal(p.source_content_type, ct, path);
    assert.equal(r.body.document.capture.sha256, sha(bytes), path);
    /* served under a generic type, the same bytes are the same format; an OpenDocument one keeps its container digest */
    const g = await run(w, { [`https://city.example/g-${path}`]: served(bytes, "application/octet-stream") }, { locator: `https://city.example/g-${path}` });
    assert.equal(g.body.document.profile.format.format, format, `${path} as octet-stream`);
    assert.ok(fromBytes(g.body.document.profile.format), `${path} as octet-stream: from the bytes`);
    if (format === "odt" || format === "ods") assert.equal(g.body.document.profile.digests.determined, true, `${path}: container digest from the bytes`);
  }
  assert.ok(cases.some(([, bytes]) => bytes.length > 1024), "a container past the first KiB is among them");
});

test("R17: an OpenDocument package's digests take the container arm: .ods and .odt determined over content.xml, folding across a restyle and not across a changed substance; .odp stated undetermined with its flavour; OOXML claims none", async () => {
  const w = world();
  const acq = async (path, bytes, ct) => (await run(w, { [`https://city.example/${path}`]: served(bytes, ct) }, { locator: `https://city.example/${path}` })).body.document.profile.digests;
  for (const flavour of ["ods", "odt"]) {
    const d = await acq(`a.${flavour}`, odf(flavour), ODF_CT[flavour]);
    assert.equal(d.determined, true, flavour);
    assert.equal(d.container, flavour, flavour);
    assert.equal(d.over, "content.xml", flavour);
    assert.match(d.evidentiary || "", HEX64, flavour);
    assert.equal(d.rendition, null, `${flavour}: no rendition digest is claimed for a container`);
    assert.equal(typeof d.basis, "string");
    /* a restyled export (styles.xml only) folds; a changed substance does not */
    const restyled = odf(flavour, "Police", "<office:styles/>");
    assert.notEqual(sha(restyled), sha(odf(flavour)), `${flavour}: the fixture really differs in its bytes`);
    const dr = await acq(`b.${flavour}`, restyled, ODF_CT[flavour]);
    assert.equal(dr.evidentiary, d.evidentiary, `${flavour}: presentational parts are discounted`);
    const dc = await acq(`c.${flavour}`, odf(flavour, "Fire"), ODF_CT[flavour]);
    assert.equal(dc.determined, true);
    assert.notEqual(dc.evidentiary, d.evidentiary, `${flavour}: a changed content.xml is a different substance`);
  }
  const dp = await acq("a.odp", odf("odp"), ODF_CT.odp);
  assert.deepEqual([dp.determined, dp.container, dp.evidentiary, dp.rendition], [false, "odp", null, null], "no .odp export is measured");
  assert.equal(typeof dp.basis, "string");
  for (const [path, bytes, ct] of [["b.xlsx", XLSX, XLSX_CT], ["r.docx", DOCX, DOCX_CT], ["d.pptx", PPTX, PPTX_CT]]) {
    const d = await acq(path, bytes, ct);
    assert.deepEqual([d.determined, d.evidentiary, d.rendition, "container" in d], [false, null, null, false], path);
  }
});

test("R17: profileOf and substanceDigests trust a digest only over bytes that hash to the capture identity, and an OpenDocument package over ODF_DIGEST_MAX is not read back for one", async () => {
  const ods = odf("ods");
  const evOf = (bytes) => { const gets = []; return { gets, async get(k) { gets.push(k); return { arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length) }; } }; };
  const view = { view: undefined, ids: null };
  const at = "2026-09-30T00:00:00Z";
  /* the store's bytes are the capture's: the container arm is determined */
  const good = await profileOf({ ev: evOf(ods), sha: sha(ods), ct: ODF_CT.ods, total: ods.length, view, retrieved: at, locator: "https://city.example/a.ods" });
  assert.deepEqual([good.format.format, good.digests.determined, good.digests.container], ["ods", true, "ods"]);
  assert.equal(good.at, at);
  /* bytes read back that do not hash to the identity: no digest is trusted */
  const liar = await profileOf({ ev: evOf(ods), sha: sha("something else"), ct: ODF_CT.ods, total: ods.length, view, retrieved: at, locator: "https://city.example/a.ods" });
  assert.deepEqual([liar.digests.determined, liar.digests.evidentiary], [false, null]);
  assert.match(liar.digests.basis, /did not hash/);
  /* over the bound (K659): nothing is read back; the format is the declared type with the absence stated, and no
     container digest is claimed */
  const ev = evOf(ods);
  const big = await profileOf({ ev, sha: sha(ods), ct: ODF_CT.ods, total: ODF_DIGEST_MAX + 1, view, retrieved: at, locator: "https://city.example/a.ods" });
  assert.equal(ev.gets.length, 0, "not read back over the bound");
  assert.deepEqual([big.format.format, big.format.confidence], ["ods", "likely"], "the declared type");
  assert.deepEqual([big.digests.determined, big.digests.evidentiary, "container" in big.digests], [false, null, false]);
  /* at the bound it is read back whole, once, and that one read serves the format and the container digest */
  const ev2 = evOf(ods);
  const atBound = await profileOf({ ev: ev2, sha: sha(ods), ct: ODF_CT.ods, total: ODF_DIGEST_MAX, view, retrieved: at, locator: "https://city.example/a.ods" });
  assert.equal(ev2.gets.length, 1, "one whole read");
  assert.deepEqual([atBound.format.format, atBound.format.confidence, atBound.digests.determined], ["ods", "certain", true]);
  /* substanceDigests directly: the container arm's identity check, and no container bytes means nothing claimed */
  const sd = await substanceDigests(null, { handler: { key: "conservative", textual: false }, confidence: "none" }, {}, sha("x"), false, ods);
  assert.deepEqual([sd.determined, sd.evidentiary], [false, null]);
  assert.match(sd.basis, /container bytes read back from the store did not hash/);
  const sdOk = await substanceDigests(null, { handler: { key: "conservative", textual: false }, confidence: "none" }, {}, sha(ods), false, ods);
  assert.deepEqual([sdOk.determined, sdOk.container], [true, "ods"]);
  const none = await substanceDigests(null, { handler: { key: "conservative", textual: false }, confidence: "none" }, {}, sha(ods), false, null);
  assert.deepEqual([none.determined, none.evidentiary, none.rendition], [false, null, null]);
  const multi = await substanceDigests(null, { handler: { key: "conservative", textual: false }, confidence: "none" }, {}, sha(ods), true, ods);
  assert.equal(multi.determined, false, "a multipart capture takes no container digest");
});
