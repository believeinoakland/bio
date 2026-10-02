/* reading-pipeline: `read` (R1–R17, R21, R22, R24) at the module's interface, called directly over a stored capture
   with the evidence store, the bindings, the view and the live-calibration callback a caller hands in, scripted fleet
   members and format entries standing in for the tiers. Moved from `extraction`'s read.test.mjs (N513), its
   assertions unchanged; `extraction` keeps the arms that are its own (R1's store binding, R18's view, the acquire
   wire). Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, hold, doc, member, withEntry, i2, noText, folio, unreadImage, ocrAnswer, calibration, sha, EVIDENCE_PREFIX } from "./fixture.mjs";
import { identify, doctypeFor } from "../../../../docprofile/registry.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";
import { OCR_INVOCATIONS_PER_REQUEST, ACQUIRE_TEXT_UNITS_BUDGET, ACQUIRE_TEXT_UNIT_ENVELOPE, CAPTURE_TEXT_UNIT_CAP } from "../../../src/reading-pipeline/index.mjs";

const ROW = (id, name, date) => `<tr><td><a href="MeetingDetail.aspx?ID=${id}&GUID=X">${name}</a></td><td>${date}</td><td><a href="View.ashx?M=A&ID=5${id}">Agenda</a></td></tr>`;
const CAL = (rows) => ['<!DOCTYPE html><html><head><title>Council Calendar</title></head><body><form id="aspnetForm" method="post">',
  '<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="STATE" />', '<main id="mainContent" role="main">',
  '<select id="lstYears_Input" name="lstYears" value="This Month"><option>This Month</option></select>',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>', rows, '</table></main></form></body></html>'].join("");
const ASPNET = [["content-type", "text/html; charset=utf-8"], ["x-powered-by", "ASP.NET"], ["server", "Microsoft-IIS/10.0"]];

async function readHtml(w, html, extra = {}) {
  const d = await hold(w.evidence, html);
  return w.read(doc({ digest: d, bytes: html.length, fromText: true, headers: ASPNET, ...extra }));
}

/* A pdf entry whose `structure` answers `text` (and `pages`, `images`) for any bytes. */
const pdfEntry = (text, { pages = null, images = undefined, imagesWhy = null } = {}) => ({
  format: "pdf", structure: async () => ({ ok: true, text: structuredClone(text), pages: pages ?? (text.pages ? text.pages.length : 0), notes: [],
                                           ...(images !== undefined ? { images, imagesWhy } : {}) }) });
async function readPdf(w, text, opts = {}, entryOpts = {}) {
  const d = await hold(w.evidence, opts.bytes || "%PDF-1.7 test " + Math.random());
  return withEntry(pdfEntry(text, entryOpts), () => w.read(doc({ digest: d, ct: "application/pdf", format: "pdf", ...opts.doc }), { env: opts.env || {} }));
}

test("R24 R21: the bytes come from the evidence store handed in, under the digest; no store, no digest or no object is a failed reading saying so, and no caller field supplies text", async () => {
  const noStore = fresh({ evidence: null });
  const a = await noStore.read(doc({ digest: "a".repeat(64), fromText: true }));
  assert.equal(a.reading.found, false);
  assert.match(a.reading.basis, /no evidence store/);
  const w = fresh();
  const absent = await w.read(doc({ digest: "b".repeat(64), fromText: true }));
  assert.equal(absent.reading.found, false);
  assert.match(absent.reading.basis, /not held in the evidence store/);
  const none = await w.read({ ...doc({ digest: "c".repeat(64) }), capture: {} });
  assert.match(none.reading.basis, /names no capture digest/);
  /* a caller's text and reading on the document are ignored: the stored bytes are read */
  const html = CAL(ROW("2101", "City Council", "7/15/2026"));
  const d = await hold(w.evidence, html);
  const r = await w.read({ ...doc({ digest: d, bytes: html.length, fromText: true, headers: ASPNET }),
                             text: "meeting:9999", reading: { entities: [{ kind: "meeting", key: "9999" }] } });
  assert.deepEqual(r.reading.entities.map((e) => e.ref), ["meeting:2101"]);
  assert.ok(w.evidence.calls.some(([op, k]) => op === "get" && k === `${EVIDENCE_PREFIX}${d}`));
});

test("R1 R21: text read as text with no entry that reads it goes to the content type's reader; found exactly when an entity was read; references as they appear", async () => {
  const w = fresh();
  const r = (await readHtml(w, CAL(ROW("2101", "City Council", "7/15/2026") + ROW("2102", "Rules", "7/22/2026")))).reading;
  assert.equal(r.content_type, "meeting_calendar");
  assert.equal(r.read_from_text, true);
  assert.equal(r.found, true);
  assert.deepEqual(r.entities.map((e) => e.ref), ["meeting:2101", "meeting:2102"]);
  for (const k of ["reader_version", "facts", "at", "basis", "position_parts", "position_why"]) assert.ok(k in r, k);
  assert.equal(r.at, "2026-09-27T00:00:00Z");
  /* a document no reader finds anything in: found false, an empty reading, never emptied */
  const g = (await readHtml(w, "<!DOCTYPE html><html><body><p>About us.</p></body></html>", { headers: [["content-type", "text/html"]] })).reading;
  assert.equal(g.found, false);
  assert.deepEqual(g.entities, []);
  assert.ok(g.basis.length > 0);
});

test("R1: a type with no reader answers read_from_text false and says so; a reader that throws is a failed reading naming the error", async () => {
  const w = fresh();
  const txt = "plain words";
  const d = await hold(w.evidence, txt);
  const probe = doctypeFor({ ...{ headers: {}, locator: "https://a.example/x", content_type: "text/plain", text: txt },
    handler: identify({ headers: {}, locator: "https://a.example/x", content_type: "text/plain", text: txt }).handler });
  const r = (await w.read(doc({ digest: d, ct: "text/plain", format: "undetermined", fromText: true, headers: [] }))).reading;
  if (typeof probe.type.parse === "function") {
    assert.equal(r.read_from_text, true);
  } else {
    assert.equal(r.read_from_text, false);
    assert.match(r.basis, /declares no reader/);
  }
  const t = probe.type, saved = t.parse;
  t.parse = () => { throw new Error("boom in the reader"); };
  try {
    const f = (await w.read(doc({ digest: d, ct: "text/plain", format: "undetermined", fromText: true, headers: [] }))).reading;
    assert.equal(f.found, false);
    assert.equal(f.read_from_text, true);
    assert.match(f.basis, /boom in the reader/);
  } finally { if (saved) t.parse = saved; else delete t.parse; }
});

test("R2 R12 R13: delimited text read as text at intake is read through its format entry: the entry's own decode, its sheet list and its dialect", async () => {
  const w = fresh();
  const bytes = Uint8Array.from([...Buffer.from("name,place\n", "latin1"), ...Buffer.from("José,Hall\n", "latin1")]);
  const d = await hold(w.evidence, bytes);
  const out = await w.read(doc({ digest: d, bytes: bytes.length, ct: "text/csv", format: "csv", fromText: true, headers: [["content-type", "text/csv"]] }));
  const r = out.reading;
  assert.equal(r.text_container, "csv");
  assert.equal(r.text_tier, 1);
  assert.ok(!JSON.stringify(r).includes("�"), "the entry's decode, never the lossy intake one");
  assert.ok(r.container_extent && Array.isArray(r.container_extent.sheets) && r.container_extent.sheets.length === 1, "a delimited-text reading carries its sheet list");
  assert.ok(r.container_extent.levels.includes("sheets"));
  assert.ok(r.dialect && typeof r.dialect === "object", "the entry's dialect, through readingDialect");
  assert.ok("delimiter" in r.dialect && "encoding" in r.dialect);
});

test("R2: a multi-part capture within the bound is assembled from its parts for the entry; one over the bound, or with a part not held, is not read and says so", async () => {
  const w = fresh();
  const p1 = await hold(w.evidence, "part one ");
  const p2 = await hold(w.evidence, "part two");
  let handed = null;
  const out = await withEntry({ format: "t3multi", text: async (b) => { handed = new TextDecoder().decode(b);
      return { ok: true, document: handed, paragraphs: [{ para: 0, text: handed }], counts: { chars: handed.length, undetermined: 0 }, undetermined: [] }; } },
    () => w.read(doc({ digest: "f".repeat(64), ct: "application/x-t", format: "t3multi",
      parts: [{ file: "a", sha256: p1, bytes: 9 }, { file: "b", sha256: p2, bytes: 8 }] })));
  assert.equal(handed, "part one part two");
  assert.equal(out.reading.text_container, "t3multi");
  const missing = await withEntry({ format: "t3multi", text: async () => ({ ok: true }) },
    () => w.read(doc({ digest: "f".repeat(64), format: "t3multi", parts: [{ sha256: p1, bytes: 9 }, { sha256: "0".repeat(64), bytes: 8 }] })));
  assert.equal(missing.reading.found, false);
  assert.match(missing.reading.basis, /part 2 of 2 is not held/);
  const over = await withEntry({ format: "t3multi", text: async () => ({ ok: true }) },
    () => w.read(doc({ digest: "f".repeat(64), format: "t3multi", parts: [{ sha256: p1, bytes: 30 * 1024 * 1024 }] })));
  assert.match(over.reading.basis, /over the \d+ B a format entry is handed/);
});

test("R3 R10: tier 2 is asked only when undetermined markers outnumber glyphs (not for scan markers alone), merged page by page; two tiers give two page-scoped parts; tier 2 only when a page moved; the producer marker carried", async () => {
  const w = fresh();
  const garbled = { page: 1, reason: "no_tounicode", count: 5 };
  const t1 = i2([{ page: 0, text: "Page zero text" }, { page: 1, text: "", undetermined: [garbled, garbled, garbled, garbled, garbled, garbled, garbled, garbled, garbled, garbled, garbled, garbled, garbled, garbled, garbled] }],
               { producer: { determination: "ocr", ocr: { engine: "ABBYY FineReader", field: "Producer", marker: "ABBYY" } } });
  const pdf = member(() => ({ ok: true, text: i2([{ page: 0, text: "" }, { page: 1, text: "Page one decoded by tier two" }]) }));
  const out = await readPdf(w, t1, { env: { PDF_WORKER: pdf } });
  assert.equal(pdf.calls.length, 1);
  assert.deepEqual(Object.keys(pdf.calls[0].body).sort(), ["capture_sha", "store"]);
  const r = out.reading;
  assert.equal(r.text_tier, 2);
  const scoped = r.text_source.filter((s) => s.extent);
  assert.ok(scoped.length >= 2, "two page-scoped parts");
  assert.ok(r.text_source.some((s) => s.step === "ocr" && s.engine === "ABBYY FineReader"), "the tier-1 producer marker carried");
  /* scan markers alone: tier 2 is not asked */
  const scan = member(() => { throw new Error("must not be called"); });
  await readPdf(w, i2([{ page: 0, text: "", undetermined: [noText(0)] }]), { env: { PDF_WORKER: scan } });
  assert.equal(scan.calls.length, 0);
});

test("R3 R11: a tier-2 member that fails, refuses or is unbound leaves tier 1 standing, and the reason is carried on the basis", async () => {
  const w = fresh();
  const bad = { page: 0, reason: "no_tounicode", count: 1 };
  const t1 = i2([{ page: 0, text: "x", undetermined: [bad, bad, bad] }]);
  for (const [env, says] of [[{}, /no pdf-worker member is bound/],
                             [{ PDF_WORKER: member(() => ({ status: 500, body: { ok: false } })) }, /answered without improving/],
                             [{ PDF_WORKER: member(() => new Error("down")) }, /could not be reached/]]) {
    const r = (await readPdf(w, t1, { env })).reading;
    assert.equal(r.text_tier, 1);
    assert.match(r.basis, says);
  }
});

test("R4 R16: tier 3 selects pages with a routing marker and no encryption; each deferred page asked one per call, in order, within the budget; past it named; no member says no OCR engine is installed", async () => {
  const w = fresh();
  const pages = Array.from({ length: 30 }, (_, i) => ({ page: i, text: "", undetermined: [noText(i)] }));
  const ocr = member((body, n) => (n === 1
    ? { ...ocrAnswer([body.pages[0]]), deferred: body.pages.slice(1) }
    : ocrAnswer(body.pages)));
  const r = (await readPdf(w, i2(pages), { env: { OCR_WORKER: ocr } })).reading;
  assert.equal(ocr.calls.length, OCR_INVOCATIONS_PER_REQUEST);
  assert.deepEqual(ocr.calls[0].body.pages, pages.map((p) => p.page));
  assert.deepEqual(ocr.calls.slice(1).map((c) => c.body.pages), Array.from({ length: 23 }, (_, i) => [i + 1]));
  for (const c of ocr.calls) assert.deepEqual(Object.keys(c.body).sort(), ["capture_sha", "pages", "store"]);
  assert.match(r.basis, /6 of them \(pages 25-30\) were not asked for in this request/);
  assert.equal(r.tier3_candidate, true);
  const enc = member(() => { throw new Error("never"); });
  await readPdf(w, i2([{ page: 0, text: "", undetermined: [noText(0), { page: null, reason: "encrypted", count: 1 }] }]), { env: { OCR_WORKER: enc } });
  assert.equal(enc.calls.length, 0, "an encrypted document is not a candidate");
  const none = (await readPdf(w, i2([{ page: 0, text: "", undetermined: [noText(0)] }]))).reading;
  assert.match(none.basis, /no OCR engine is installed/);
  assert.equal(none.tier3_candidate, true);
});

test("R4: a page after a call that throws, a declined page, one under another engine build and one not asked for are not merged, and the note names them", async () => {
  const w = fresh();
  const pages = [0, 1, 2, 3, 4].map((i) => ({ page: i, text: "", undetermined: [noText(i)] }));
  const ocr = member((body, n) => {
    if (n === 1) return { ...ocrAnswer([0]), deferred: [1, 2, 3, 4] };
    if (n === 2) return { ok: false, reason: "busy" };                          // page 1 declined
    if (n === 3) return ocrAnswer([2], { version: "6.0" });                     // page 2 another build
    if (n === 4) return ocrAnswer([0]);                                         // page 3's call answers page 0: a stray
    return new Error("gone");                                                   // page 4's call throws
  });
  const r = (await readPdf(w, i2(pages), { env: { OCR_WORKER: ocr } })).reading;
  assert.match(r.basis, /declined 1 page\(s\) it was asked for one at a time \(page 2\)/);
  assert.match(r.basis, /1 page\(s\) \(page 3\) were answered under a different engine build/);
  assert.match(r.basis, /were not the page that call asked for, and were dropped/);
  assert.match(r.basis, /the call for page 5 failed/);
  assert.equal(r.provenance.pages.filter((p) => p.tier === 3 && p.text_sha256).map((p) => p.page).join(), "0");
});

test("R5: a member answer is taken only with engine, version, a measured cap and measured_by; anchorless regions dropped and counted; below the floor undetermined; the chain names the live calibration or none", async () => {
  const pages = [{ page: 0, text: "", undetermined: [noText(0)] }];
  for (const [answer, says] of [[{ ...ocrAnswer([0]), engine: "" }, /did not name its engine and version/],
                                [{ ...ocrAnswer([0]), cap: "" }, /reported no MEASURED fidelity/],
                                [{ ...ocrAnswer([0]), pages: [{ page: 0, regions: [{ text: "x" }] }] }, /no page this record could anchor/]]) {
    const r = (await readPdf(fresh(), i2(pages), { env: { OCR_WORKER: member(() => answer) } })).reading;
    assert.match(r.basis, says);
    assert.notEqual(r.text_tier, 3);
  }
  const cal = calibration({ live: [{ calibration_id: "CAL-7", engine: "tess", version: "5.3", at: "t", cap: "C", measured_by: "m" }] });
  const w = fresh({ cal });
  const mixed = { ...ocrAnswer([0]), confidence_floor: 0.5,
    pages: [{ page: 0, regions: [
      { text: "kept", source: { kind: "pdf-page", ref: "p0", page: 0, rect: [0, 0, 1, 1] }, confidence: { value: 0.9, basis: "engine" } },
      { text: "low", source: { kind: "pdf-page", ref: "p0", page: 0, rect: [0, 1, 1, 2] }, confidence: { value: 0.1, basis: "engine" } },
      { text: "no anchor" }] }] };
  const r = (await readPdf(w, i2(pages), { env: { OCR_WORKER: member(() => mixed) } })).reading;
  assert.equal(r.text_tier, 3);
  assert.deepEqual(r.text_source.map((s) => s.step), ["pixels", "ocr"]);
  assert.ok(r.text_source.every((s) => s.calibration === "CAL-7" && s.cap === "C"));
  assert.deepEqual(cal.asked, [{ engine: "tess", version: "5.3" }]);
  assert.match(r.basis, /1 region\(s\) the OCR member returned carried no checkable image region/);
  const thrown = (await readPdf(fresh({ cal: calibration({ throws: true }) }), i2(pages), { env: { OCR_WORKER: member(() => ocrAnswer([0])) } })).reading;
  assert.ok(thrown.text_source.every((s) => s.calibration === null), "a calibration that cannot be read is none");
});

test("R6 R9: the merge fills only asked-for pages holding no glyph; other pages refused each with its own reason; the kept-text clause only when a page held text; tier 3 when filled", async () => {
  const w = fresh();
  const pages = [{ page: 0, text: "real text" }, { page: 1, text: "", undetermined: [noText(1)] }, { page: 2, text: "" }];
  const ans = ocrAnswer([0, 1, 2, 7]);
  const r = (await readPdf(w, i2(pages), { env: { OCR_WORKER: member(() => ans) } })).reading;
  assert.equal(r.text_tier, 3);
  assert.match(r.basis, /1 scanned page\(s\) were transcribed .* the page that already had text kept it/);
  assert.match(r.basis, /page 1 \(the OCR member was not asked for it\)/);
  assert.match(r.basis, /page 3 \(the OCR member was not asked for it\)/);
  assert.match(r.basis, /page 8 \(the document has no such page\)/);
  const p1 = r.provenance.pages.find((p) => p.page === 1);
  assert.equal(p1.tier, 3);
  assert.equal(r.tier3_candidate, undefined, "selected and filled: not a candidate");
  /* a page carrying glyphs that is selected but not routed as a folio page is refused as carrying text */
  const g = (await readPdf(fresh(), i2([{ page: 0, text: "has text", undetermined: [noText(0)] }]), { env: { OCR_WORKER: member(() => ocrAnswer([0])) } })).reading;
  assert.match(g.basis, /page 1 \(it already carries text of its own/);
  assert.equal(g.tier3_candidate, true);
  /* wholly scanned: the kept-text clause is not said */
  const s = (await readPdf(fresh(), i2([{ page: 0, text: "", undetermined: [noText(0)] }, { page: 1, text: "", undetermined: [noText(1)] }]),
                           { env: { OCR_WORKER: member(() => ocrAnswer([0, 1])) } })).reading;
  assert.doesNotMatch(s.basis, /already had text kept it/);
});

test("R6: a base with no per-page text refuses OCR when it holds a glyph and takes it whole when it holds none", async () => {
  const w = fresh();
  const flat = { document: "some glyphs", undetermined: [noText(0)], counts: { chars: 11, undetermined: 1 } };
  const r = (await readPdf(w, flat, { env: { OCR_WORKER: member(() => ocrAnswer([0])) } })).reading;
  assert.match(r.basis, /could not be merged page by page .* so an OCR pass was refused/);
  const empty = { document: "   ", undetermined: [noText(0)], counts: { chars: 3, undetermined: 1 } };
  const e = (await readPdf(fresh(), empty, { env: { OCR_WORKER: member(() => ocrAnswer([0])) } })).reading;
  assert.equal(e.text_tier, 3);
});

test("R7 R8: a folio page keeps its text, gains the transcription appended and is listed in both parts; OCR filling a page discharges image_unread", async () => {
  const w = fresh();
  const pages = [{ page: 0, text: "Body text here" }, { page: 1, text: "12", undetermined: [folio(1), unreadImage(1)] }];
  const r = (await readPdf(w, i2(pages), { env: { OCR_WORKER: member(() => ocrAnswer([1], { text: () => "chart words" })) } })).reading;
  const p1 = r.provenance.pages.find((p) => p.page === 1);
  assert.ok(p1.producers && p1.producers.length === 2, "credited to the layer and the engine");
  const parts = r.text_source.filter((s) => s.extent && s.extent.pages.includes(1));
  assert.ok(new Set(parts.map((s) => s.extent.part)).size === 2, "listed in both parts");
  assert.match(r.basis, /appended after it/);
  const out = await readPdf(fresh(), i2(pages), { env: { OCR_WORKER: member(() => ocrAnswer([1], { text: () => "chart words" })) } });
  const u1 = out.text_units.find((u) => u.extent.page === 1);
  assert.equal(u1.text, "12\nchart words");
});

test("R8: a page tier 2 wins keeps a still-true image_unread marker, and image_unread does not make a page read as undecoded", async () => {
  const w = fresh();
  const bad = { page: 0, reason: "no_tounicode", count: 1 };
  const t1 = i2([{ page: 0, text: "", undetermined: [bad, bad, bad, unreadImage(0)] }]);
  let seen = null;
  const pdf = member(() => ({ ok: true, text: i2([{ page: 0, text: "decoded well by tier two" }]) }));
  await withEntry({ format: "pdf", structure: async () => ({ ok: true, text: structuredClone(t1), pages: 1, notes: [] }) }, async () => {
    const d = await hold(w.evidence, "%PDF r9");
    const out = await w.read(doc({ digest: d, format: "pdf", ct: "application/pdf" }), { env: { PDF_WORKER: pdf } });
    seen = out.reading;
  });
  assert.equal(seen.text_tier, 2);
  assert.equal(seen.found !== undefined, true);
  assert.equal(seen.read_from_text, true, "image_unread counts no undecoded character");
});

test("R10: no chain until a text surface answers; a layer chain at the wired tier, cap undetermined, reason stated; a Drive export gains convert at the head", async () => {
  const w = fresh();
  const none = (await readHtml(w, "<html></html>", { headers: [] })).reading;
  assert.equal(none.text_source, undefined);
  const r = (await readPdf(w, i2([{ page: 0, text: "Text layer" }]))).reading;
  assert.equal(r.text_source.length, 1);
  assert.equal(r.text_source[0].step, "layer");
  assert.equal(r.text_source[0].tier, 1);
  assert.equal(r.text_source[0].cap, null);
  assert.match(r.text_source[0].measured_by, /unmeasured/);
  const drive = [{ who: "instance t", via: "direct" }, { who: "Google Drive", drive_file_id: "abc", export_format: "odt",
                                                          document_address: "https://docs.google.com/document/d/abc/edit" }];
  const dr = await withEntry({ format: "odt", text: async () => ({ ok: true, document: "Doc body", paragraphs: [{ para: 0, text: "Doc body" }],
                                                                   counts: { chars: 8, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "odt bytes"); return w.read(doc({ digest: d, format: "odt", ct: "application/vnd.oasis.opendocument.text", chain: drive })); });
  assert.equal(dr.reading.text_source[0].step, "convert");
  assert.equal(dr.reading.text_source[0].format, "odt");
  assert.equal(dr.reading.text_source[0].cap, null);
});

test("R11: a determined reading carries text_source, text_tier, text_container and a basis naming the reader, chain, tier and notes; an undetermined one is a failed reading with the tier notes and the entry's reason", async () => {
  const w = fresh();
  const r = (await readPdf(w, i2([{ page: 0, text: "Hello world" }]))).reading;
  for (const k of ["text_source", "text_tier", "text_container"]) assert.ok(k in r, k);
  assert.equal(r.text_container, "pdf");
  assert.match(r.basis, /(reader|found no entities)/);
  assert.match(r.basis, /tier 1/);
  const bad = { page: 0, reason: "no_tounicode", count: 1 };
  const u = (await readPdf(w, i2([{ page: 0, text: "", undetermined: [bad, bad] }]))).reading;
  assert.equal(u.found, false);
  assert.equal(u.read_from_text, false);
  assert.match(u.basis, /no pdf-worker member is bound/);
});

test("R12 R21: page_count is the structure's count when positive, else null, never zero; container_extent itemises by the keys the entry emitted, absent when no entry answered", async () => {
  const w = fresh();
  assert.equal((await readPdf(w, i2([{ page: 0, text: "a" }]), {}, { pages: 7 })).reading.page_count, 7);
  assert.equal((await readPdf(w, i2([{ page: 0, text: "a" }]), {}, { pages: 0 })).reading.page_count, null);
  const imgs = (await readPdf(w, i2([{ page: 0, text: "a" }]), {}, { images: [{ page: 0, rect: [1, 2, 3, 4], name: "x" }] })).reading;
  assert.deepEqual(imgs.container_extent, { container: "pdf", levels: ["images"], images: [{ page: 0, rect: [1, 2, 3, 4] }] });
  const why = (await readPdf(w, i2([{ page: 0, text: "a" }]), {}, { images: null, imagesWhy: "walk did not finish" })).reading;
  assert.equal(why.container_extent.images, null);
  assert.equal(why.container_extent.images_why, "walk did not finish");
  const noneAnswered = await withEntry({ format: "t13", text: async () => ({ ok: true, document: "a", counts: { chars: 1, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "t13 bytes"); return (await w.read(doc({ digest: d, format: "t13" }))).reading; });
  assert.equal(noneAnswered.container_extent, null, "present and null: an entry answered and itemised nothing");
  const html = (await readHtml(w, "<html><body>x</body></html>", { headers: [] })).reading;
  assert.equal("container_extent" in html, false, "absent when no entry answered");
  const deck = await withEntry({ format: "pptx", text: async () => ({ ok: true, document: "s1", slides: [{ slide: 1, text: "s1", shapes: 3 }, { slide: 3, text: "s3", shapes: "x" }],
      deckLength: 4, tables: [], counts: { chars: 2, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "pptx bytes"); return w.read(doc({ digest: d, format: "pptx", ct: "application/x" })); });
  assert.deepEqual(deck.reading.container_extent.slides, [{ shapes: 3 }, { shapes: null }, { shapes: null }, { shapes: null }]);
  assert.equal(deck.reading.container_extent.deckLength, 4);
  assert.deepEqual(deck.reading.container_extent.tables, []);
  const sheet = await withEntry({ format: "xlsx", text: async () => ({ ok: true, document: "a", sheets: [{ name: "S", rows: 10, cols: 2.5, usedRows: 3, usedCols: 2, text: "a" }],
      counts: { chars: 1, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "xlsx bytes"); return w.read(doc({ digest: d, format: "xlsx", ct: "application/x" })); });
  assert.deepEqual(sheet.reading.container_extent.sheets, [{ name: "S", rows: 10, cols: null, usedRows: 3, usedCols: 2 }]);
});

test("R13: dialect absent when no entry answered a decoding choice, null when it could not state one, else readingDialect's shape; a throwing signature leaves it absent", async () => {
  const w = fresh();
  const pdf = (await readPdf(w, i2([{ page: 0, text: "a" }]))).reading;
  assert.equal("dialect" in pdf, false);
  const mk = (dialect) => withEntry({ format: "t14", text: async () => ({ ok: true, document: "a", paragraphs: [{ para: 0, text: "a" }], counts: { chars: 1, undetermined: 0 }, undetermined: [], dialect }) },
    async () => { const d = await hold(w.evidence, "t14 " + Math.random()); return (await w.read(doc({ digest: d, format: "t14" }))).reading; });
  assert.equal((await mk(null)).dialect, null);
  assert.deepEqual(Object.keys((await mk({ delimiter: ",", encoding: "utf-8" })).dialect).sort(), ["confidence", "delimiter", "encoding", "signals", "undetermined"]);
  /* text read at intake: the entry's dialect signature over the same bytes; a throwing one leaves the key absent */
  const txt = "a;b\n1;2\n";
  const d = await hold(w.evidence, txt);
  const thrown = await withEntry({ format: "t14b", dialect: () => { throw new Error("x"); } },
    () => w.read(doc({ digest: d, format: "t14b", ct: "text/plain", fromText: true, headers: [] })));
  assert.equal("dialect" in thrown.reading, false);
  const said = await withEntry({ format: "t14b", dialect: () => ({ delimiter: ";", encoding: "utf-8" }) },
    () => w.read(doc({ digest: d, format: "t14b", ct: "text/plain", fromText: true, headers: [] })));
  assert.equal(said.reading.dialect.delimiter, ";");
});

test("R14: the reading's provenance is composed at one site over exactly the text the reader was handed; text read at intake names the plane with tier null", async () => {
  const w = fresh();
  const html = CAL(ROW("2101", "City Council", "7/15/2026"));
  const r = (await readHtml(w, html)).reading;
  assert.equal(r.provenance.scheme, "reading-provenance/1");
  assert.equal(r.provenance.text_tier, null);
  assert.equal(r.provenance.producers[0].member, "plane");
  assert.equal(r.provenance.text_sha256, sha(html));
  const p = (await readPdf(w, i2([{ page: 0, text: "Hello" }]))).reading;
  assert.equal(p.provenance.text_tier, 1);
  assert.equal(p.provenance.pages[0].member, "plane");
  const failed = (await fresh({ evidence: null }).read(doc({ digest: "a".repeat(64) }))).reading;
  assert.equal(failed.provenance.text_sha256, null);
});

test("R15 R21: text units one per page, paragraph or slide holding a glyph, the producer's numbering; the wire's budget with each unit charged its bytes plus the envelope; a unit that does not fit carried as its capped prefix marked truncated; every unit left out named; absent and empty differ", async () => {
  const w = fresh();
  const out = await readPdf(w, i2([{ page: 3, text: "three" }, { page: 4, text: "   " }, { page: 5, text: "five" }]));
  assert.deepEqual(out.text_units.map((u) => [u.extent.kind, u.extent.page, u.seq]), [["pdf-page", 3, 0], ["pdf-page", 5, 2]]);
  assert.equal(out.text_units[0].extent.rect, null);
  const big = "x".repeat(CAPTURE_TEXT_UNIT_CAP + 10);
  const para = (n) => ({ para: n, text: big });
  const many = await withEntry({ format: "t16", text: async () => ({ ok: true, document: "d", paragraphs: [0, 1, 2, 3, 4].map(para), counts: { chars: 1, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "t16"); return w.read(doc({ digest: d, format: "t16" })); });
  const per = CAPTURE_TEXT_UNIT_CAP + ACQUIRE_TEXT_UNIT_ENVELOPE;
  const fit = Math.floor(ACQUIRE_TEXT_UNITS_BUDGET / per);
  assert.equal(many.text_units.length, fit);
  assert.ok(many.text_units.every((u) => u.truncated === true && u.text.length === CAPTURE_TEXT_UNIT_CAP));
  assert.equal(many.text_units_over_bound, 5 - fit);
  assert.deepEqual(many.text_units_skipped, [{ first: { kind: "doc-para", para: fit, run: null }, first_seq: fit,
    last: { kind: "doc-para", para: 4, run: null }, last_seq: 4, units: 5 - fit }]);
  const noUnits = await readPdf(w, i2([{ page: 0, text: " " }]));
  assert.equal("text_units" in noUnits, false, "no unit list is absent, never an empty list");
  const slides = await withEntry({ format: "t16s", text: async () => ({ ok: true, document: "s", slides: [{ slide: 1, text: "one" }], counts: { chars: 3, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "t16s"); return w.read(doc({ digest: d, format: "t16s" })); });
  assert.deepEqual(slides.text_units[0].extent, { kind: "slide-shape", slide: 1, shape: null });
});

test("R15 R21: a workbook's unit is its sheet, a sheet-range at the used range its reader names; a sheet with no named range, or no glyph, is no unit; the real csv entry's sheet is one sheet-range unit", async () => {
  const w = fresh();
  const rng = (sheet, range) => ({ kind: "sheet-range", ref: `${sheet}!${range}`, sheet, range });
  const out = await withEntry({ format: "t16x", text: async () => ({ ok: true, container: "xlsx", document: "a\nc",
      sheets: [{ sheet: 0, name: "Budget", text: "a\tb", range: rng("Budget", "A1:B3") },
               { sheet: 1, name: "Blank", text: "  ", range: rng("Blank", "A1:A1") },
               { sheet: 2, name: "Unmeasured", text: "has words", range: null },
               { sheet: 3, name: "Notes", text: "c", range: rng("Notes", "A1:A9") }],
      counts: { chars: 3, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "t16x bytes"); return w.read(doc({ digest: d, format: "t16x", ct: "application/x" })); });
  assert.deepEqual(out.text_units, [
    { extent: { kind: "sheet-range", sheet: "Budget", range: "A1:B3" }, seq: 0, text: "a\tb" },
    { extent: { kind: "sheet-range", sheet: "Notes", range: "A1:A9" }, seq: 3, text: "c" }]);
  /* a sheet list whose reader named no range at all: no unit, and the list is absent */
  const unnamed = await withEntry({ format: "t16y", text: async () => ({ ok: true, document: "x", sheets: [{ name: "S", text: "x", range: null }],
      counts: { chars: 1, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "t16y bytes"); return w.read(doc({ digest: d, format: "t16y", ct: "application/x" })); });
  assert.equal("text_units" in unnamed, false);
  /* the real csv entry, read and written: the index holds the sheet as a sheet-range unit and says whole */
  const csv = "name,place\nAna,Hall\nBo,Park\n";
  const d = await hold(w.evidence, csv);
  const r = await w.read(doc({ digest: d, bytes: csv.length, ct: "text/csv", format: "csv", fromText: true, headers: [["content-type", "text/csv"]] }));
  assert.equal(r.text_units.length, 1);
  assert.equal(r.text_units[0].extent.kind, "sheet-range");
  assert.match(r.text_units[0].extent.range, /^A1:B3$/);
});

test("R16: nothing about the source is fetched: tiers 2 and 3 are reached only through their bindings, with the capture's digest and store", async () => {
  const w = fresh();
  const orig = globalThis.fetch;
  let fetched = 0;
  globalThis.fetch = async () => { fetched++; return new Response("no"); };
  try {
    const bad = { page: 0, reason: "no_tounicode", count: 1 };
    const pdf = member(() => ({ ok: true, text: i2([{ page: 0, text: "" }]) }));
    const ocr = member(() => ocrAnswer([0]));
    const d = await hold(w.evidence, "%PDF r17");
    await withEntry(pdfEntry(i2([{ page: 0, text: "", undetermined: [bad, bad, noText(0)] }])),
      () => w.read(doc({ digest: d, format: "pdf", ct: "application/pdf", locator: "https://source.example/doc.pdf" }),
                     { storeName: "ns1", env: { PDF_WORKER: pdf, OCR_WORKER: ocr } }));
    assert.equal(fetched, 0);
    for (const c of [...pdf.calls, ...ocr.calls]) { assert.equal(c.body.capture_sha, d); assert.equal(c.body.store, "ns1"); }
  } finally { globalThis.fetch = orig; }
});

test("R24 R22: every recogniser runs over the jurisdiction view the caller hands in (extraction R18 composes it), never a view of its own", async () => {
  const w = fresh();
  const memo = "OFFICER'S MEMORANDUM\nPROPOSAL\nThe Officer Proposes that the Selectboard adopt P.E.B.L. 4.\nCOSTS\nNone.\nCONSULTATION\nThe Harbour Commission.\n";
  const d = await hold(w.evidence, memo);
  const ctx = { headers: {}, locator: "https://a.example/x", content_type: "text/plain", text: memo };
  const view = combine(["test-port-ellery"]).view;
  const withView = doctypeFor({ ...ctx, handler: identify(ctx).handler, view });
  const withEmpty = doctypeFor({ ...ctx, handler: identify(ctx).handler, view: combine([]).view });
  assert.notEqual(withView.type.key, withEmpty.type.key, "the fixture separates the two views");
  w.profiles = ["test-port-ellery"];
  assert.deepEqual(w.view(), view);
  const r = (await w.read(doc({ digest: d, format: "undetermined", ct: "text/plain", fromText: true, headers: [] }))).reading;
  assert.equal(r.content_type, withView.type.key);
  w.profiles = [];
  const e = (await w.read(doc({ digest: d, format: "undetermined", ct: "text/plain", fromText: true, headers: [] }))).reading;
  assert.equal(e.content_type, withEmpty.type.key);
  /* R22: nothing this module says names the place a profile describes */
  const oakland = /oakland|alameda/i;
  for (const said of [r.basis, e.basis]) assert.doesNotMatch(said, oakland);
});

test("R3 R11 (N253): image_unread markers count no undecoded character: a photo page whose only residue is its unread images does not escalate to tier 2, and its text reads determined", async () => {
  const w = fresh();
  const images = Array.from({ length: 20 }, (_, i) => unreadImage(0, [0, i * 10, 100, i * 10 + 9]));
  const t1 = i2([{ page: 0, text: "Photo caption", undetermined: images }]);
  assert.ok(t1.counts.undetermined > "Photocaption".length, "the markers outnumber the glyphs");
  const pdf = member(() => { throw new Error("tier 2 must not be asked for a photo page"); });
  const out = await readPdf(w, t1, { env: { PDF_WORKER: pdf } });
  assert.equal(pdf.calls.length, 0);
  assert.equal(out.reading.text_tier, 1);
  assert.equal(out.reading.read_from_text, true, "readText is handed the decode view");
  assert.doesNotMatch(out.reading.basis, /tier 1 read essentially nothing/);
  /* control: the same page with undecoded glyph markers in their place escalates */
  const garbled = i2([{ page: 0, text: "Photo caption", undetermined: images.map(() => ({ page: 0, reason: "no_tounicode", count: 1 })) }]);
  const asked = member(() => ({ ok: true, text: i2([{ page: 0, text: "" }]) }));
  await readPdf(w, garbled, { env: { PDF_WORKER: asked } });
  assert.equal(asked.calls.length, 1);
});

test("R8 (N253): a page tier 2 wins keeps its image_unread markers once, through text-chain's merge, the reading's marker list stating each", async () => {
  const w = fresh();
  const bad = { page: 0, reason: "no_tounicode", count: 1 };
  const img = unreadImage(0, [1, 2, 3, 4]);
  const t1 = i2([{ page: 0, text: "", undetermined: [bad, bad, bad, img] }]);
  /* tier 2 states the same image itself: carried once, never twice */
  for (const t2own of [[], [img]]) {
    const pdf = member(() => ({ ok: true, text: i2([{ page: 0, text: "decoded well by tier two", undetermined: t2own }]) }));
    const out = await readPdf(w, t1, { env: { PDF_WORKER: pdf } });
    assert.equal(out.reading.text_tier, 2);
    assert.equal(out.reading.provenance.pages[0].tier, 2);
    const u = out.text_units[0];
    assert.equal(u.text, "decoded well by tier two");
  }
  const { mergeTier2Text } = await import("../../../src/textchain.mjs");
  const m = mergeTier2Text(t1, i2([{ page: 0, text: "decoded well by tier two" }]));
  assert.deepEqual(m.text.pages[0].undetermined.filter((x) => x.reason === "image_unread"), [img]);
});

test("R12 R21 (N100): page_boxes follows page_count's rule: pdf-reader's boxes as it answered them, null when the structure answered none or one this wire cannot read whole, null for an entry with no structure, absent where no entry answered", async () => {
  const w = fresh();
  const pageBoxes = { boxes: [{ media_box: [0, 0, 612, 792], w: 612, h: 792, rotate: 0 }, { media_box: [10, 10, 400, 300], w: 390, h: 290, rotate: 90 }],
                      of_page: [0, 1, null, 0] };
  const withBoxes = (text, pb) => ({ format: "pdf", structure: async () => ({ ok: true, text: structuredClone(text), pages: 4, notes: [], pageBoxes: pb }) });
  const readWith = async (pb) => { const d = await hold(w.evidence, "%PDF boxes " + Math.random());
    return (await withEntry(withBoxes(i2([{ page: 0, text: "a" }]), pb), () => w.read(doc({ digest: d, format: "pdf", ct: "application/pdf" })))).reading; };
  assert.deepEqual((await readWith(pageBoxes)).page_boxes, pageBoxes);
  assert.equal((await readWith(undefined)).page_boxes, null, "no boxes answered");
  assert.equal((await readWith({ boxes: [{ media_box: [0, 0, 0, 10] }], of_page: [0] })).page_boxes, null, "a box with no area: none, never a partial list");
  assert.equal((await readWith({ boxes: [{ media_box: [0, 0, 10, 10] }], of_page: [0, 3] })).page_boxes, null, "an index to no box");
  const office = await withEntry({ format: "t13b", text: async () => ({ ok: true, document: "a", paragraphs: [{ para: 0, text: "a" }], counts: { chars: 1, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "t13b bytes"); return (await w.read(doc({ digest: d, format: "t13b" }))).reading; });
  assert.equal(office.page_boxes, null);
  assert.equal(office.page_count, null);
  const html = (await readHtml(w, "<html><body>x</body></html>", { headers: [] })).reading;
  assert.equal("page_boxes" in html, false, "absent where page_count is absent");
  assert.equal("page_count" in html, false);
  const failedEarly = (await fresh({ evidence: null }).read(doc({ digest: "a".repeat(64) }))).reading;
  assert.equal("page_boxes" in failedEarly, false);
});

test("R17 R21 (N139): a reading whose text was classified carries text_chars, text_glyphs and text_undetermined over exactly the text the reader was handed, image_unread not counted; a bare string gives null residue; no text, no keys", async () => {
  const w = fresh();
  const t = i2([{ page: 0, text: "  ab c  " }, { page: 1, text: "", undetermined: [noText(1), unreadImage(1)] }]);
  const r = (await readPdf(w, t)).reading;
  assert.deepEqual([r.text_chars, r.text_glyphs, r.text_undetermined], [t.counts.chars, 3, 1]);
  /* a scan read to nothing: zero glyphs, a residue */
  const scan = (await readPdf(w, i2([{ page: 0, text: "", undetermined: [noText(0)] }]))).reading;
  assert.deepEqual([scan.text_chars, scan.text_glyphs, scan.text_undetermined], [0, 0, 1]);
  /* a text that states no figure: null, never a zero */
  const bare = await withEntry({ format: "t60", text: async () => ({ ok: true, paragraphs: [{ para: 0, text: "x" }], undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "t60"); return (await w.read(doc({ digest: d, format: "t60" }))).reading; });
  assert.deepEqual([bare.text_chars, bare.text_glyphs, bare.text_undetermined], [null, null, null]);
  /* text read at intake: a bare string */
  const html = CAL(ROW("2101", "City Council", "7/15/2026"));
  const h = (await readHtml(w, html)).reading;
  assert.deepEqual([h.text_chars, h.text_undetermined], [html.length, null]);
  assert.ok(Number.isInteger(h.text_glyphs) && h.text_glyphs > 0);
  /* no text: none of the three keys */
  const none = (await fresh({ evidence: null }).read(doc({ digest: "a".repeat(64) }))).reading;
  for (const k of ["text_chars", "text_glyphs", "text_undetermined"]) assert.equal(k in none, false, k);
  const threw = await withEntry({ format: "t60b", text: async () => { throw new Error("x"); } },
    async () => { const d = await hold(w.evidence, "t60b"); return (await w.read(doc({ digest: d, format: "t60b" }))).reading; });
  assert.equal("text_chars" in threw, false);
});

test("R3 (N253): a scan marker is any of no_text_layer, image_content_unread, image_content_undetermined: a document whose remaining markers are all scan markers does not escalate", async () => {
  const w = fresh();
  for (const reason of ["no_text_layer", "image_content_unread", "image_content_undetermined"]) {
    const marks = [0, 1, 2].map(() => ({ page: 0, reason, font: null, codes: null, count: 1 }));
    const pdf = member(() => { throw new Error(`tier 2 asked for ${reason}`); });
    await readPdf(w, i2([{ page: 0, text: "", undetermined: [...marks, unreadImage(0)] }]), { env: { PDF_WORKER: pdf } });
    assert.equal(pdf.calls.length, 0, reason);
  }
});
