/* file-safety R6, R7, R20: the threat grade, computed at the call from the capture's receipts, its reader's `active`
   list, its notes and, for an archive, acquisition's listing; never stored, and never changing the capture's own grade.
   Archives are captured and unpacked by acquisition's real act (`unpack`), so their members are captures of their own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, sha, enc } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { FileSafety, THREAT_REASONS } from "../../../src/file-safety/index.mjs";

const CT = (main) => `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="${main}"/></Types>`;
const DOC = `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>hi</w:t></w:r></w:p></w:body></w:document>`;
const DOCX_MAIN = "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml";
const docx = (extra = [], main = DOCX_MAIN) => makeZip([{ name: "[Content_Types].xml", data: CT(main) }, { name: "word/document.xml", data: DOC }, ...extra]);
const ODT_MANIFEST = `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"><manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`;
const odt = (extra = []) => makeZip([{ name: "mimetype", data: "application/vnd.oasis.opendocument.text", method: 0 }, { name: "META-INF/manifest.xml", data: ODT_MANIFEST },
  { name: "content.xml", data: `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:text><text:p>hi</text:p></office:text></office:body></office:document-content>` }, ...extra]);
const ENC_PDF = enc("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\n3 0 obj<</Filter/Standard/V 2/R 3/O(x)/U(y)/P -4>>endobj\ntrailer<</Root 1 0 R/Encrypt 3 0 R/ID[<00><00>]>>\n%%EOF");
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 9, 9]);
const codes = (g) => g.reasons.map((r) => r.code).sort();
const symlinked = (bytes, k) => {
  const b = new Uint8Array(bytes);
  let seen = -1;
  for (let i = 0; i + 4 <= b.length; i++)
    if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 1 && b[i + 3] === 2 && ++seen === k) { b[i + 5] = 3; b.set([0, 0, 0xff, 0xa1], i + 38); return b; }
  return b;
};
async function unpacked(w, entries, { via = "direct", options = {} } = {}) {
  const z = makeZip(entries, options);
  const s = await w.capture(z, { via });
  const u = await w.acq.unpack({ core: w.record, provenance: w.prov }, { archiveSha: s, by: "m1", member: true });
  return { s, z, u };
}

test("R6: a file other than an archive is low only when some receipt is a fetch by this copy, its format has an active list that is empty (or it is an image, plain text or HTML), it is not encrypted, under no scan hold and with no listed reputation; else high, each reason named with its member words; the answer carries {threat, reasons, source, format, active, scan_hold, latest_scan, latest_deeper, safe_view, safe_copy, archive}", async () => {
  const w = world({ scan: { clamav: (s) => (s === sha(pdf(false, "held")) ? { result: "found", findings: ["Pdf.Exploit.A"] } : { result: "clean" }) } });
  const g = async (bytes, opts) => w.fs.threatOf({ captureSha: await w.capture(bytes, opts), viewer: "member:m1" });
  /* low: fetched directly, by a web archive, by a capture request; a clean PDF, office file, OpenDocument file, csv, image, text, HTML */
  for (const [bytes, opts, format] of [[pdf(false, "low"), {}, "pdf"], [pdf(false, "arch"), { via: "archive.org" }, "pdf"],
                                        [pdf(false, "req"), { via: "capture-request" }, "pdf"], [docx(), {}, "docx"], [odt(), {}, "odt"],
                                        [enc("a,b\n1,2\n"), {}, "csv"], [PNG, {}, "image"], [enc("plain words\nhere"), {}, "text"],
                                        [enc("<!doctype html><html><script>alert(1)</script></html>"), {}, "html"]]) {
    const r = await g(bytes, opts);
    assert.deepEqual([r.ok, r.threat, r.reasons, r.format], [true, "low", [], format], format);
  }
  const one = await g(pdf(false, "fields"));
  assert.deepEqual(Object.keys(one).sort(), ["active", "archive", "captureSha", "format", "latest_deeper", "latest_scan", "ok", "reasons", "safe_copy", "safe_view", "scan_hold", "source", "threat"]);
  assert.deepEqual([one.active, one.archive, one.scan_hold, one.source.fetched, one.source.routes], [[], null, null, true, ["direct"]]);
  /* handed in, not fetched */
  assert.deepEqual(codes(await g(pdf(false, "knock"), { via: "doorbell", address: "knock:K-1" })), ["source_not_fetched"]);
  /* active content, one reason per kind */
  const js = await g(pdf(true, "js"));
  assert.deepEqual(codes(js), ["active:javascript", "active:open-action"]);
  assert.deepEqual(js.reasons.find((r) => r.code === "active:javascript"), { code: "active:javascript", translation: THREAT_REASONS["active:javascript"].translation });
  assert.equal(js.active.length, 2);
  assert.deepEqual(codes(await g(docx([{ name: "word/vbaProject.bin", data: "not a cfb" }], "application/vnd.ms-word.document.macroEnabled.main+xml"))), ["active:vba-project"]);
  assert.deepEqual(codes(await g(docx([{ name: "word/activeX/activeX1.xml", data: "<x/>" }, { name: "word/embeddings/oleObject1.bin", data: "x" }]))), ["active:activex", "active:ole-object"]);
  assert.deepEqual(codes(await g(odt([{ name: "Basic/Standard/Module1.xml", data: "<x/>" }]))), ["active:odf-basic"]);
  /* encrypted, and the part it could not read */
  assert.deepEqual(codes(await g(ENC_PDF)), ["encrypted", "unread"]);
  /* a format no reader checks */
  for (const bytes of [new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0]), enc("<svg xmlns='http://www.w3.org/2000/svg'><script/></svg>"),
                       new Uint8Array([0, 1, 2, 3]), makeZip([{ name: "mimetype", data: "application/vnd.oasis.opendocument.text", method: 0 }, { name: "content.xml", data: "<x/>" }])])
    assert.ok(codes(await g(bytes)).includes("format_unchecked"));
  /* a scan hold */
  const held = await w.capture(pdf(false, "held"));
  await w.fs.scanBatch({});
  const h = await w.fs.threatOf({ captureSha: held });
  assert.deepEqual([h.threat, codes(h)], ["high", ["scan_hold"]]);
  assert.deepEqual(h.scan_hold.names, ["Pdf.Exploit.A"]);
  assert.deepEqual([h.latest_scan.result, h.latest_deeper], ["found", null]);
  /* bytes not held at all: the format cannot be checked */
  const gone = await w.capture(pdf(false, "gone"));
  w.bucket.held.delete(`bio/captures/${gone}`);
  assert.ok(codes(await w.fs.threatOf({ captureSha: gone })).includes("format_unchecked"));
  /* every reason has its words */
  for (const r of [...js.reasons, ...h.reasons]) assert.ok(typeof r.translation === "string" && r.translation.length > 10, r.code);
});

test("R6 (K1929 (Q1)): an archive is low only when its source condition holds, its listing answers opened with no refusal, no waiting, not-filed or link entry, and every filed and already-held entry's file is low (a nested archive by the same rule); else high with archive_not_opened, archive_refused (with the refusal's code), archive_waiting, archive_entry_not_filed and archive_link (with the count), archive_member_high (with the count) or archive_cycle; `archive` is {opened, entries, members_low, members_high}", async () => {
  const w = world();
  /* opened, every member low, a nested archive among them */
  const inner = makeZip([{ name: "deep.txt", data: "deep words" }]);
  const a = await unpacked(w, [{ name: "a.txt", data: "file a" }, { name: "b.txt", data: "file a" }, { name: "inner.zip", data: inner }]);
  /* the nested archive, not yet opened, makes its archive high; opened by a member, it is graded by the same rule */
  assert.deepEqual(codes(await w.fs.threatOf({ captureSha: a.s })), ["archive_member_high"]);
  assert.deepEqual(codes(await w.fs.threatOf({ captureSha: sha(inner) })), ["archive_not_opened", "archive_waiting"]);
  await w.acq.unpack({ core: w.record, provenance: w.prov }, { archiveSha: sha(inner), by: "m1", member: true });
  const ga = await w.fs.threatOf({ captureSha: a.s });
  assert.deepEqual([ga.threat, ga.reasons, ga.format], ["low", [], "zip"], JSON.stringify(ga.reasons));
  assert.deepEqual(ga.archive, { opened: true, entries: 3, members_low: 3, members_high: 0 });
  assert.equal((await w.fs.threatOf({ captureSha: sha(inner) })).threat, "low");
  /* never opened: every entry waits */
  const closed = await w.capture(makeZip([{ name: "c.txt", data: "c" }, { name: "d.txt", data: "d" }]));
  const gc = await w.fs.threatOf({ captureSha: closed });
  assert.deepEqual(codes(gc), ["archive_not_opened", "archive_waiting"]);
  assert.equal(gc.reasons.find((r) => r.code === "archive_waiting").count, 2);
  assert.deepEqual(gc.archive, { opened: false, entries: 2, members_low: 0, members_high: 0 });
  /* refused whole: an archive that can be read two ways */
  const amb = await unpacked(w, [{ name: "e.txt", data: "e" }], { options: { secondEocd: true } });
  const gr = await w.fs.threatOf({ captureSha: amb.s });
  assert.ok(codes(gr).includes("archive_refused"), JSON.stringify(gr.reasons));
  assert.equal(gr.reasons.find((r) => r.code === "archive_refused").refusal, "ARCHIVE_AMBIGUOUS");
  /* an entry not filed, and a link */
  const nf = await unpacked(w, [{ name: "ok.txt", data: "ok words" }, { name: "locked", data: "x", encrypted: "traditional" }]);
  const gn = await w.fs.threatOf({ captureSha: nf.s });
  assert.deepEqual(codes(gn), ["archive_entry_not_filed"]);
  assert.equal(gn.reasons[0].count, 1);
  const lz = symlinked(makeZip([{ name: "t.txt", data: "target words" }, { name: "ln", data: "t.txt", method: 0 }]), 1);
  const ls = await w.capture(lz);
  await w.acq.unpack({ core: w.record, provenance: w.prov }, { archiveSha: ls, by: "m1", member: true });
  const gl = await w.fs.threatOf({ captureSha: ls });
  assert.deepEqual(codes(gl), ["archive_link"]);
  /* a member graded high, counted */
  const mh = await unpacked(w, [{ name: "x.pdf", data: pdf(true, "inside") }, { name: "y.pdf", data: pdf(true, "inside2") }, { name: "z.txt", data: "fine" }]);
  const gm = await w.fs.threatOf({ captureSha: mh.s });
  assert.deepEqual(codes(gm), ["archive_member_high"]);
  assert.equal(gm.reasons[0].count, 2);
  assert.deepEqual(gm.archive, { opened: true, entries: 3, members_low: 1, members_high: 2 });
  /* the source condition: an archive handed in, and its members, are not fetched by this copy */
  const kn = await unpacked(w, [{ name: "k.txt", data: "knocked file" }], { via: "doorbell" });
  assert.ok(codes(await w.fs.threatOf({ captureSha: kn.s })).includes("source_not_fetched"));
  assert.deepEqual(codes(await w.fs.threatOf({ captureSha: sha("knocked file") })), ["source_not_fetched"]);
  /* a cycle: a listing that names the archive itself (as only a stand-in can) ends that path high */
  const listing = (archiveSha) => ({ ok: true, archive: { sha256: archiveSha, opened: true, refused: null }, entries: [{ index: 0, state: "filed", sha256: archiveSha }], truncated: false, next: null });
  const fs2 = new FileSafety({ sql: w.st.sql, record: w.record, membership: w.membership, credentials: w.credentials, provenance: w.prov,
                               acquisition: { archiveList: async ({ archiveSha }) => listing(archiveSha) }, env: w.env, now: () => w.clock.now });
  const gy = await fs2.threatOf({ captureSha: a.s });
  assert.deepEqual(codes(gy), ["archive_cycle", "archive_member_high"]);
});

test("R7: the same capture and notes always give the same answer; computing it writes nothing, and no note or grade changes the capture's grade letter, its state or its provenance document", async () => {
  const w = world({ scan: { clamav: () => ({ result: "found", findings: ["Win.Trojan.Q"] }) } });
  w.promoted("INFO-2026-0001-doc", "the document", { path: "snapshots/a.txt" });
  const s = await w.capture("the document");
  const facts = () => JSON.stringify([w.prov.captureGrade(s), w.rows("SELECT * FROM bundles"), w.rows("SELECT * FROM files"), w.rows("SELECT * FROM register"), w.rows("SELECT * FROM captured_locators")]);
  const before = facts(), tables = w.tables();
  const g1 = await w.fs.threatOf({ captureSha: s }), g2 = await w.fs.threatOf({ captureSha: s });
  assert.deepEqual(g1, g2);
  assert.deepEqual(w.tables(), tables, "computing the grade writes nothing");
  await w.fs.scanBatch({});
  const g3 = await w.fs.threatOf({ captureSha: s });
  assert.deepEqual([g3.threat, codes(g3)], ["high", ["scan_hold"]]);
  assert.deepEqual(await w.fs.threatOf({ captureSha: s }), g3);
  assert.equal(facts(), before, "the grade letter, the state and the provenance document are unchanged");
});

test("R20: each file cut from an archive is scanned, graded, held and released as its own file, its source the archive's; the archive is scanned as itself and a finding in it holds the archive only; a member's hold makes the archive high", async () => {
  const bad = sha("bad member");
  let archiveBad = false;
  const w = world({ scan: { clamav: (s) => (s === bad ? { result: "found", findings: ["Txt.Trojan.M"] } : archiveBad && s === zipSha ? { result: "found", findings: ["Zip.Trojan.Z"] } : { result: "clean" }) } });
  let zipSha;
  const a = await unpacked(w, [{ name: "good.txt", data: "good member" }, { name: "bad.txt", data: "bad member" }]);
  zipSha = a.s;
  await w.fs.scanBatch({});
  const targets = w.calls("/scan")[0].body.targets.map((t) => t.capture_sha).sort();
  assert.deepEqual(targets, [a.s, sha("good member"), bad].sort(), "the archive and each member, each its own target");
  assert.ok((await w.fs.threatOf({ captureSha: bad })).scan_hold, "the member is held");
  assert.equal((await w.fs.threatOf({ captureSha: sha("good member") })).threat, "low", "its sibling is not");
  const ga = await w.fs.threatOf({ captureSha: a.s });
  assert.deepEqual([ga.threat, codes(ga), ga.scan_hold], ["high", ["archive_member_high"], null], "the member's hold makes the archive high; the archive itself is not held");
  /* its source is the archive's */
  assert.deepEqual((await w.fs.threatOf({ captureSha: sha("good member") })).source, { fetched: true, routes: ["unpacked"], archive: a.s });
  /* released as its own file */
  w.fs.releaseScanHold({ captureSha: bad, by: "m1", reason: "a" });
  assert.equal(w.fs.releaseScanHold({ captureSha: bad, by: "m2", reason: "b" }).state, "released");
  assert.equal((await w.fs.threatOf({ captureSha: a.s })).threat, "low");
  /* a finding in the archive holds the archive only */
  archiveBad = true;
  w.tick(8 * 86_400_000);
  await w.fs.scanBatch({});
  assert.ok((await w.fs.threatOf({ captureSha: a.s })).scan_hold);
  assert.equal((await w.fs.threatOf({ captureSha: sha("good member") })).scan_hold, null);
});
