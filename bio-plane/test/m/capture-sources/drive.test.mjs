/* capture-sources: Google Drive (`drive.mjs`), tested at the module's interface
 * (build/requirements/capture-sources.md R38–R46), with the invariants R51 and R53.
 * Each test names the requirement id it checks in its title. Addresses, register rows
 * and retrieval records below are this file's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRIVE_HOSTS, DRIVE_KINDS, DRIVE_PRODUCER, DRIVE_CONVERT_ENGINE, readDriveAddress, exportAddressFor, driveHop,
  driveConvertStep, DRIVE_HOP_FACT_KEYS, callerSuppliedHopFacts, driveBaselineRow, classifyDriveBaseline,
} from "../../../src/drive.mjs";
import { archiveHop, selectCapture } from "../../../src/cdx.mjs";
import { renderLocaleFor } from "../../../src/render.mjs";

const ID = "1AbCdEfGhIjKlMnOpQrStUvWxYz_-0123456789";
const DOC = `https://docs.google.com/document/d/${ID}/edit`;
const EXPORT = `https://docs.google.com/document/d/${ID}/export?format=odt`;

test("R38: the Drive hosts, the three kinds with their OpenDocument types, the producer and engine", () => {
  assert.deepEqual([...DRIVE_HOSTS].sort(), ["docs.google.com", "drive.google.com", "sheets.google.com", "slides.google.com"]);
  assert.deepEqual(DRIVE_KINDS.map((k) => [k.kind, k.segment, k.format, k.mimetype]), [
    ["document", "document", "odt", "application/vnd.oasis.opendocument.text"],
    ["spreadsheet", "spreadsheets", "ods", "application/vnd.oasis.opendocument.spreadsheet"],
    ["presentation", "presentation", "odp", "application/vnd.oasis.opendocument.presentation"],
  ]);
  assert.equal(DRIVE_PRODUCER, "Google Drive export");
  assert.equal(DRIVE_CONVERT_ENGINE, "google-export");
  /* An exact set: another Google property is not a Drive host. */
  for (const a of ["https://www.google.com/maps/x", "https://fonts.googleapis.com/css", "https://google.com/search?q=x",
                   "https://docs.google.com.evil.example/document/d/" + ID])
    assert.equal(readDriveAddress(a), null, a);
});

test("R39: null for anything not an https URL on a Drive host; otherwise always a verdict, u/ and a/ pairs dropped", () => {
  for (const a of [null, undefined, 5, "", "not a url", `http://docs.google.com/document/d/${ID}/edit`,
                   `ftp://docs.google.com/document/d/${ID}`, "https://example.org/document/d/" + ID])
    assert.equal(readDriveAddress(a), null, String(a));
  const spellings = [
    DOC, `https://www.docs.google.com/document/d/${ID}/edit`, `https://DOCS.GOOGLE.COM/document/d/${ID}/view`,
    `HTTPS://docs.google.com/document/d/${ID}/edit`,
    `https://docs.google.com/u/0/document/d/${ID}/edit`, `https://docs.google.com/document/u/1/d/${ID}/edit`,
    `https://docs.google.com/a/example.org/document/d/${ID}/edit`, `https://docs.google.com/a/example.org/u/2/document/d/${ID}/preview`,
    `https://docs.google.com/document/d/${ID}/edit#heading=h.1`,
  ];
  for (const a of spellings) {
    const v = readDriveAddress(a);
    assert.deepEqual([v.address, v.host, v.shape, v.harvestable, v.fileId], [a, "docs.google.com", "document", true, ID], a);
  }
  assert.equal(readDriveAddress(`https://drive.google.com/weird/path`).shape, "unknown");
  /* An `a/` pair is only a name with a dot in it; a `u/` pair only digits. */
  assert.equal(readDriveAddress(`https://docs.google.com/a/nodot/document/d/${ID}/edit`).shape, "unknown");
  assert.equal(readDriveAddress(`https://docs.google.com/u/x/document/d/${ID}/edit`).shape, "unknown");
});

test("R40: each shape is named, with its harvestability and why", () => {
  for (const a of ["https://drive.google.com/drive/folders/ABCDEFGHIJ", "https://drive.google.com/folderview?id=ABCDEFGHIJKL",
                   "https://drive.google.com/drive/my-drive", "https://drive.google.com/drive/u/0/shared-with-me"]) {
    const v = readDriveAddress(a);
    assert.deepEqual([v.shape, v.harvestable, typeof v.why], ["folder", false, "string"], a);
  }
  const pub = readDriveAddress("https://docs.google.com/document/d/e/2PACX-1vQabcdefghijklmnop/pub");
  assert.deepEqual([pub.shape, pub.harvestable], ["published", false]);
  assert.match(pub.why, /ordinary\s+path/);
  const kinds = [["spreadsheets", "spreadsheet", "ods", "application/vnd.oasis.opendocument.spreadsheet"],
                 ["presentation", "presentation", "odp", "application/vnd.oasis.opendocument.presentation"],
                 ["document", "document", "odt", "application/vnd.oasis.opendocument.text"]];
  for (const [seg, kind, format, mimetype] of kinds) {
    const v = readDriveAddress(`https://sheets.google.com/${seg}/d/${ID}/edit#gid=0`);
    assert.deepEqual({ shape: v.shape, harvestable: v.harvestable, kind: v.kind, fileId: v.fileId, format: v.format, mimetype: v.mimetype, exportAddress: v.exportAddress },
      { shape: kind, harvestable: true, kind, fileId: ID, format, mimetype, exportAddress: `https://docs.google.com/${seg}/d/${ID}/export?format=${format}` });
  }
  /* The id's bounds: 10 to 200 of A–Z a–z 0–9 _ -. */
  assert.equal(readDriveAddress("https://docs.google.com/document/d/ABCDEFGHI/edit").shape, "unknown");
  assert.equal(readDriveAddress("https://docs.google.com/document/d/ABCDEFGHIJ/edit").shape, "document");
  assert.equal(readDriveAddress(`https://docs.google.com/document/d/${"a".repeat(200)}/edit`).shape, "document");
  assert.equal(readDriveAddress(`https://docs.google.com/document/d/${"a".repeat(201)}/edit`).shape, "unknown");
  assert.equal(readDriveAddress("https://docs.google.com/document/d/ABC.DEFGHIJK/edit").shape, "unknown");
  for (const [a, fileId] of [[`https://drive.google.com/file/d/${ID}/view`, ID], [`https://drive.google.com/open?id=${ID}`, ID],
                             [`https://drive.google.com/uc?id=${ID}&export=download`, ID], ["https://drive.google.com/open", undefined],
                             [`https://drive.google.com/anything?id=${ID}`, ID], ["https://drive.google.com/file/d/short/view", undefined]]) {
    const v = readDriveAddress(a);
    assert.deepEqual([v.shape, v.harvestable, v.fileId], ["file", false, fileId], a);
    assert.match(v.why, /KIND/);
  }
  const u = readDriveAddress("https://slides.google.com/something/else");
  assert.deepEqual([u.shape, u.harvestable, u.host], ["unknown", false, "slides.google.com"]);
  assert.match(u.why, /slides\.google\.com/);
});

test("R41: exportAddressFor composes one export host whatever host the link used", () => {
  for (const k of DRIVE_KINDS)
    assert.equal(exportAddressFor(k, ID), `https://docs.google.com/${k.segment}/d/${ID}/export?format=${k.format}`);
  assert.equal(readDriveAddress(`https://drive.google.com/document/d/${ID}/edit`).exportAddress, EXPORT);
});

test("R42: driveHop states Google's conversion, from the address and the fetch, with its three facts as keys", () => {
  const d = readDriveAddress(`https://sheets.google.com/spreadsheets/d/${ID}/edit`);
  const exp = `https://docs.google.com/spreadsheets/d/${ID}/export?format=ods`;
  const h = driveHop(d, { retrieved: "2026-09-27T01:00:00Z", resolved: "https://doc-0s.googleusercontent.com/export/abc",
                          detected: { format: "ods", confidence: "certain", signals: ["mimetype entry names ods"] } });
  assert.equal(h.who, "Google Drive (Google Drive export)");
  for (const part of ["Google's ODS conversion, made at export time", `spreadsheet ${ID}`, `served for ${exp} at 2026-09-27T01:00:00Z`,
                      `lives at ${d.address}`])
    assert.ok(h.asserts.includes(part), part);
  for (const part of [`export address ${exp}`, "export format ods (application/vnd.oasis.opendocument.spreadsheet)",
                      "producer Google Drive export", "COMPOSED BY THIS INSTANCE", "no part of it was read from the request",
                      "canonicalised to docs.google.com, though the link named sheets.google.com",
                      "redirected to https://doc-0s.googleusercontent.com/export/abc", "confirmed from the bytes: ods (certain)"])
    assert.ok(h.evidence.includes(part), part);
  assert.deepEqual({ bound: h.bound, via: h.via, export_address: h.export_address, export_format: h.export_format, producer: h.producer,
                     drive_file_id: h.drive_file_id, drive_kind: h.drive_kind, document_address: h.document_address,
                     export_format_confirmed: h.export_format_confirmed },
    { bound: false, via: "direct", export_address: exp, export_format: "ods", producer: "Google Drive export",
      drive_file_id: ID, drive_kind: "spreadsheet", document_address: d.address, export_format_confirmed: true });
  assert.match(h.unsigned_reason, /not the original file/);
  const doc = readDriveAddress(DOC);
  const same = driveHop(doc, { retrieved: "t", resolved: EXPORT });
  assert.ok(!/though the link named/.test(same.evidence) && !/redirected/.test(same.evidence));
  assert.match(same.evidence, /were not sniffed/);
  assert.equal(same.export_format_confirmed, null);
  const disagree = driveHop(doc, { retrieved: "t", detected: { format: "ods", confidence: "certain", signals: ["x"] } });
  assert.match(disagree.evidence, /NOT confirmed from the bytes: odt was asked for and the bytes detect as ods/);
  assert.equal(disagree.export_format_confirmed, false);
  /* A detection without signals is still recorded. */
  assert.match(driveHop(doc, { retrieved: "t", detected: { format: "odt" } }).evidence, /confirmed from the bytes: odt/);
});

test("R43: driveConvertStep is the conversion as a derivation step, its cap undetermined and stated", () => {
  const s = driveConvertStep(readDriveAddress(DOC));
  assert.deepEqual({ ...s, measured_by: typeof s.measured_by }, { step: "convert", engine: "google-export", format: "odt", cap: null,
    measured_by: "string", calibration: null });
  assert.match(s.measured_by, /^unmeasured/);
});

test("R44: DRIVE_HOP_FACT_KEYS and callerSuppliedHopFacts answer the own top-level keys, in the list's order", () => {
  assert.deepEqual(DRIVE_HOP_FACT_KEYS, ["export_address", "export_format", "producer", "drive_file_id", "drive_kind", "drive",
                                         "document_address", "provenance_hop"]);
  assert.deepEqual(callerSuppliedHopFacts({ provenance_hop: {}, locator: DOC, producer: "me", export_address: "x" }),
                   ["export_address", "producer", "provenance_hop"]);
  assert.deepEqual(callerSuppliedHopFacts(Object.create({ producer: "inherited" })), []);
  assert.deepEqual(callerSuppliedHopFacts({ nested: { producer: "x" } }), []);
  for (const v of [null, undefined, "producer", 5]) assert.deepEqual(callerSuppliedHopFacts(v), []);
});

const drive = readDriveAddress(DOC);
const regRow = (locator, profile = {}, capture = { sha256: "b".repeat(64) }) => ({ locator, profile, capture, retrieved: "2026-09-01T00:00:00Z" });

test("R45: driveBaselineRow prefers the export address's row, else the locator's, else null", () => {
  const exp = regRow(EXPORT), page = regRow(DOC);
  assert.equal(driveBaselineRow([page, exp], drive, DOC), exp);
  assert.equal(driveBaselineRow([page], drive, DOC), page);
  assert.equal(driveBaselineRow([{ locator: 5 }, null, regRow("https://other.example/")], drive, DOC), null);
  const file = readDriveAddress(`https://drive.google.com/file/d/${ID}/view`);
  assert.equal(driveBaselineRow([regRow(EXPORT), page], file, DOC), page);
  assert.equal(driveBaselineRow(null, drive, DOC), null);
});

test("R46: classifyDriveBaseline judges from the plane's retrievals and the register's profile, else undetermined", () => {
  const html = { format: { format: "html" } }, odt = { format: { format: "odt" } }, none = {};
  const fromExport = [{ address: DOC, via: "direct", retrieval_locator: EXPORT }];
  const fromPage = [{ address: DOC, via: "direct", retrieval_locator: null }];
  const both = [...fromExport, { address: DOC, via: "direct", retrieval_locator: DOC }];
  const cases = [
    ["no row", [], [], "no_baseline"],
    ["export fetched, profile silent", [regRow(EXPORT, none)], fromExport, "export"],
    ["export fetched, profile says odt", [regRow(EXPORT, odt)], fromExport, "export"],
    ["export fetched, profile says HTML", [regRow(EXPORT, html)], fromExport, "undetermined"],
    ["page fetched, profile silent", [regRow(DOC, none)], fromPage, "shell"],
    ["page fetched, profile says HTML type", [regRow(DOC, { source_content_type: "text/html; charset=utf-8" })], fromPage, "shell"],
    ["page fetched, profile says odt", [regRow(DOC, odt)], fromPage, "undetermined"],
    ["both fetched", [regRow(DOC, none)], both, "undetermined"],
    ["no retrieval, row at export, not HTML", [regRow(EXPORT, odt)], [], "export"],
    ["no retrieval, row at export, silent", [regRow(EXPORT, none)], [], "export"],
    ["no retrieval, row at export, HTML", [regRow(EXPORT, html)], [], "undetermined"],
    ["no retrieval, row at document, shell kind", [regRow(DOC, { document_kind: "shell" })], [], "shell"],
    ["no retrieval, row at document, declared xhtml", [regRow(DOC, {}, { sha256: "c".repeat(64), content_type: "application/xhtml+xml" })], [], "shell"],
    ["no retrieval, row at document, silent", [regRow(DOC, none)], [], "undetermined"],
    ["archive retrieval only", [regRow(DOC, none)], [{ address: DOC, via: "archive.org", retrieval_locator: "https://web.archive.org/x" }], "undetermined"],
  ];
  for (const [name, rows, retrievals, verdict] of cases) {
    const v = classifyDriveBaseline({ drive, locator: DOC, rows, retrievals });
    assert.equal(v.verdict, verdict, name);
    assert.equal(typeof v.basis, "string", name);
    if (verdict !== "no_baseline")
      for (const k of ["baseline", "handler", "document_kind", "format", "declared_content_type", "fetched_address", "fetched_record"])
        assert.ok(k in v, `${name}: ${k}`);
  }
  const v = classifyDriveBaseline({ drive, locator: DOC, rows: [regRow(DOC, { handler: "client_rendered", ...html })], retrievals: fromPage });
  assert.deepEqual({ baseline: v.baseline, handler: v.handler, format: v.format, fetched_address: v.fetched_address, fetched_record: v.fetched_record },
    { baseline: { sha256: "b".repeat(64), locator: DOC, retrieved: "2026-09-01T00:00:00Z" }, handler: "client_rendered", format: "html",
      fetched_address: DOC, fetched_record: "page" });
  assert.match(v.basis, /not the export address/);
  assert.equal(classifyDriveBaseline({ drive, locator: DOC, rows: [regRow(DOC)], retrievals: both }).fetched_record, "both");
  assert.equal(classifyDriveBaseline({ drive, locator: DOC, rows: [regRow(DOC)], retrievals: "junk" }).fetched_record, "none");
});

test("R51: both hops' facts derive from the address and what this instance fetched, and both are bound: false", () => {
  const a = driveHop(readDriveAddress(DOC), { retrieved: "t" });
  const b = driveHop(readDriveAddress(`https://drive.google.com/u/0/document/d/${ID}/view`), { retrieved: "t" });
  /* Two spellings of one document give the same composed facts. */
  for (const k of ["export_address", "export_format", "producer", "drive_file_id", "drive_kind"]) assert.equal(a[k], b[k], k);
  assert.equal(driveHop.length, 1);
  const c = archiveHop(selectCapture([{ urlkey: "k", timestamp: "20260303120000", original: DOC, statuscode: "200", digest: "D" }]).chosen, "r");
  assert.deepEqual([a.bound, c.bound], [false, false]);
  assert.ok(a.unsigned_reason.length > 0 && c.unsigned_reason.length > 0);
});

test("R53: no jurisdiction: the recognisers name only the platforms, and the locale comes from any profile", () => {
  assert.equal(readDriveAddress(`https://docs.google.com/a/anytown.example/document/d/${ID}/edit`).shape, "document");
  const h = driveHop(readDriveAddress(DOC), { retrieved: "t" });
  const c = archiveHop(selectCapture([{ timestamp: "20260303120000", original: "https://records.anytown.example/x", statuscode: "200", digest: "D" }]).chosen, "r");
  assert.deepEqual([h.who, c.who], ["Google Drive (Google Drive export)", "Internet Archive Wayback Machine"]);
  assert.equal(renderLocaleFor({ id: "test-anytown", locale: { value: "de-AT", basis: "TEST", profile: "test-anytown" } }), "de-AT");
});
