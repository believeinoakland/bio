/* reading-pipeline: the pieces of `read` that `extraction`'s re-read (its R31–R35) and its store half compose (R23),
   each at the module's interface; the invariant that no machine mints a grade (R20); and the over-strictness arms of
   R2 and R15: a real PDF and an office capture read through this module byte for byte as `extraction`'s `read` read
   them before the move (N513), pinned by digests measured over both on `tranche/T25` before `extraction/pipeline.mjs`
   was left for extraction's job to delete. Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as rp from "../../../src/reading-pipeline/index.mjs";
import { fresh, bucket, evidenceStore, hold, doc, member, withEntry, i2, noText, unreadImage, ocrAnswer, calibration } from "./fixture.mjs";
import { combine } from "../../../../jurisdictions/index.mjs";

const hex = (s) => createHash("sha256").update(s).digest("hex");
const { tier2Escalate, decodeView, pageBoxesFrom, needsTier3, tier3Extend, tier3SeedFrom, layerChainFor, readingFromWire,
        textCountsOf, textUnitsFor, bytesOf, CAPTURE_TEXT_UNIT_CAP, PROVENANCE_SCHEME } = rp;
const bad = (page) => ({ page, reason: "no_tounicode", count: 1 });

/* Every global fetch during `fn` is counted: a piece reaches nothing but the store and bindings it is handed. */
async function noFetch(fn) {
  const orig = globalThis.fetch;
  let fetched = 0;
  globalThis.fetch = async () => { fetched++; return new Response("no"); };
  try { await fn(); } finally { globalThis.fetch = orig; }
  return fetched;
}

test("R23: the module exports read and every piece the re-read composes, and the two constants with their values", () => {
  for (const name of ["read", "tier2Escalate", "decodeView", "pageBoxesFrom", "needsTier3", "tier3Extend", "tier3SeedFrom",
                      "layerChainFor", "readingFromWire", "textCountsOf", "textUnitsFor", "bytesOf",
                      "readingProvenance", "compareProvenance"])
    assert.equal(typeof rp[name], "function", name);
  assert.equal(CAPTURE_TEXT_UNIT_CAP, 128 * 1024, "R15's per-unit cap");
  assert.equal(PROVENANCE_SCHEME, "reading-provenance/1", "R18's scheme");
});

test("R23 R3 R16: tier2Escalate asks the bound member only when tier 1 read essentially nothing, with the digest and store alone; unbound, failing and not needed are outcomes, never throws; decodeView takes image_unread out of the weighing; pageBoxesFrom reads whole or not at all", async () => {
  const t1 = i2([{ page: 0, text: "", undetermined: [bad(0), bad(0), bad(0)] }]);
  const good = i2([{ page: 0, text: "decoded by tier one" }]);
  const pdf = member(() => ({ ok: true, text: i2([{ page: 0, text: "decoded by tier two" }]) }));
  let merged, notNeeded, unbound, down;
  const fetched = await noFetch(async () => {
    merged = await tier2Escalate({ PDF_WORKER: pdf }, { sha: "d1", storeName: "ns", text: t1 });
    notNeeded = await tier2Escalate({ PDF_WORKER: pdf }, { sha: "d1", storeName: "ns", text: good });
    unbound = await tier2Escalate({}, { sha: "d1", storeName: "ns", text: t1 });
    down = await tier2Escalate({ PDF_WORKER: member(() => new Error("down")) }, { sha: "d1", storeName: "ns", text: t1 });
  });
  assert.equal(fetched, 0);
  assert.deepEqual(pdf.calls.map((c) => c.body), [{ capture_sha: "d1", store: "ns" }], "asked once, for the escalation only");
  assert.deepEqual([merged.outcome, merged.replaced, merged.text.pages[0].text], ["merged", [0], "decoded by tier two"]);
  assert.deepEqual([notNeeded.outcome, notNeeded.text], ["not_needed", good]);
  assert.deepEqual([unbound.outcome, unbound.text], ["unbound", t1]);
  assert.deepEqual([down.outcome, down.text], ["unavailable", t1]);
  /* decodeView: the markers stay on the text, the weighed count drops by the image markers */
  const photo = i2([{ page: 0, text: "caption", undetermined: [unreadImage(0), unreadImage(0), bad(0)] }]);
  const v = decodeView(photo);
  assert.deepEqual([v.counts.undetermined, v.undetermined.map((m) => m.reason)], [1, ["no_tounicode"]]);
  assert.equal(photo.undetermined.length, 3, "the text handed in is not changed");
  assert.equal(decodeView(good), good, "a text with no image marker is returned as it is");
  /* pageBoxesFrom: a box this wire cannot read makes the whole answer null (negative control beside the positive) */
  const boxes = { boxes: [{ media_box: [0, 0, 612, 792], rotate: 0 }], of_page: [0, null] };
  assert.deepEqual(pageBoxesFrom(boxes), { boxes: [{ media_box: [0, 0, 612, 792], w: 612, h: 792, rotate: 0 }], of_page: [0, null] });
  assert.equal(pageBoxesFrom({ boxes: [...boxes.boxes, { media_box: [0, 0, 0, 0] }], of_page: [0] }), null);
  assert.equal(pageBoxesFrom(undefined), null);
});

test("R23 R4 R5 R6 R9: needsTier3 selects a scan unless encrypted; tier3Extend fills the asked pages under the member's chain naming the live calibration, says no OCR engine is installed when none is bound, and asks nothing for pages tier3SeedFrom kept from an earlier reading", async () => {
  const scan = i2([{ page: 0, text: "" , undetermined: [noText(0)] }, { page: 1, text: "", undetermined: [noText(1)] }]);
  assert.equal(needsTier3(scan), true);
  assert.equal(needsTier3(i2([{ page: 0, text: "", undetermined: [noText(0), { page: null, reason: "encrypted", count: 1 }] }])), false);
  assert.equal(needsTier3(i2([{ page: 0, text: "text" }])), false);
  /* no member bound: unread, said, still wanting */
  const none = await tier3Extend({}, { sha: "d", storeName: "bio", i2text: scan, wiredTier: 1, tier2PerPage: null, fmt: "pdf" });
  assert.match(none.ocrNote, /no OCR engine is installed/);
  assert.deepEqual([none.stillWanting, none.filled, none.wiredTier, none.chainSet], [true, [], 1, false]);
  /* a member: both pages filled, tier 3, the chain names the calibration the callback answered */
  const cal = calibration({ live: [{ calibration_id: "CAL-9", engine: "tess", version: "5.3" }] });
  const ocr = member((body) => ocrAnswer(body.pages));
  const done = await tier3Extend({ OCR_WORKER: ocr }, { sha: "d", storeName: "bio", i2text: scan, wiredTier: 1, tier2PerPage: null,
                                                         fmt: "pdf", liveCalibration: (q) => cal.liveCalibration(q) });
  assert.deepEqual([done.filled, done.wiredTier, done.stillWanting], [[0, 1], 3, false]);
  assert.deepEqual(done.chain.map((s) => [s.step, s.calibration]), [["pixels", "CAL-9"], ["ocr", "CAL-9"]]);
  assert.deepEqual(done.engine, { engine: "tess", version: "5.3", calibration: "CAL-9" });
  assert.deepEqual(ocr.calls.map((c) => c.body), [{ capture_sha: "d", store: "bio", pages: [0, 1] }]);
  /* the re-read's seed: the stored chain and units say page 0 was transcribed; only page 1 is asked */
  const reading = { text_source: done.chain };
  const seed = tier3SeedFrom(reading, [{ page: 0, text: "ocr text of page 0" }]);
  assert.deepEqual(seed.parts.map((p) => p.pages), [[0]]);
  assert.equal(seed.text.get(0), "ocr text of page 0");
  const again = member((body) => ocrAnswer(body.pages));
  const re = await tier3Extend({ OCR_WORKER: again }, { sha: "d", storeName: "bio", i2text: scan, wiredTier: 1, tier2PerPage: null,
                                                         fmt: "pdf", seed });
  assert.deepEqual(again.calls.map((c) => c.body.pages), [[1]], "the kept page is not asked again");
  assert.deepEqual([re.filled, re.seeded, re.stillWanting], [[1], [0], false]);
  assert.match(re.ocrNote, /1 of them were transcribed by an earlier reading of this capture and kept/);
  /* every page kept: the member is not asked at all (negative control: it throws if called) */
  const all = tier3SeedFrom(reading, [{ page: 0, text: "p0" }, { page: 1, text: "p1" }]);
  const never = member(() => new Error("must not be asked"));
  const kept = await tier3Extend({ OCR_WORKER: never }, { sha: "d", storeName: "bio", i2text: scan, wiredTier: 1, tier2PerPage: null, fmt: "pdf", seed: all });
  assert.equal(never.calls.length, 0);
  assert.match(kept.ocrNote, /was already transcribed by an earlier reading/);
  /* no seed from a chain that does not check, or from no units */
  assert.equal(tier3SeedFrom({ text_source: [{ step: "nonsense" }] }, [{ page: 0, text: "x" }]), null);
  assert.equal(tier3SeedFrom(reading, []), null);
});

test("R23 R10 R11 R12 R13 R14 R15 R17: layerChainFor, readingFromWire, textCountsOf and textUnitsFor each do their part of read: the layer chain with a named engine, a determined and a failed reading from a wire answer, the three counts, and the bounded units", () => {
  const plain = layerChainFor(i2([{ page: 0, text: "x" }]), { tier: 2, container: "pdf" });
  assert.deepEqual(plain.map((s) => [s.step, s.tier, s.cap]), [["layer", 2, null]]);
  const named = layerChainFor({ producer: { determination: "ocr", ocr: { engine: "ABBYY", field: "producer", marker: "abbyy" } } }, { tier: 1, container: "pdf" });
  assert.deepEqual(named.map((s) => [s.step, s.engine ?? null, s.cap]), [["layer", null, null], ["ocr", "ABBYY", null]]);
  /* readingFromWire: a determined wire answer and an undetermined one; no wire, no reading */
  const docType = { type: { key: "generic", version: 1 } };
  const ok = readingFromWire({ wired: { determined: true, doctype: docType, parsed: { entities: [{ kind: "k", key: "1" }] }, why: "why" },
                               docType, chain: plain, wiredTier: 2, fmt: "pdf", retrieved: "t", tier2note: "t2", ocrNote: null });
  assert.deepEqual([ok.found, ok.read_from_text, ok.text_tier, ok.text_container, ok.text_source], [true, true, 2, "pdf", plain]);
  assert.match(ok.basis, /read by the generic reader v1 over pdf .* \(tier 2\); why — t2/);
  const no = readingFromWire({ wired: { determined: false, why: "undetermined" }, docType, chain: plain, wiredTier: 1, fmt: "pdf",
                               retrieved: "t", tier2note: null, ocrNote: "unread" });
  assert.deepEqual([no.found, no.read_from_text, no.entities, no.tier3_candidate], [false, false, [], true]);
  assert.equal(no.basis, "unread (undetermined)");
  assert.equal(readingFromWire({ wired: null }), null);
  /* textCountsOf */
  assert.deepEqual(textCountsOf("a b"), { text_chars: 3, text_glyphs: 2, text_undetermined: null });
  assert.deepEqual(textCountsOf(i2([{ page: 0, text: "ab", undetermined: [noText(0), unreadImage(0)] }])),
                   { text_chars: 2, text_glyphs: 2, text_undetermined: 1 });
  assert.equal(textCountsOf(null), null);
  /* textUnitsFor: one unit per page with a glyph; none is null, never an empty list */
  const u = textUnitsFor(i2([{ page: 2, text: "two" }, { page: 3, text: " " }]));
  assert.deepEqual(u.textUnits, [{ extent: { kind: "pdf-page", page: 2, rect: null }, seq: 0, text: "two" }]);
  assert.deepEqual(textUnitsFor(i2([{ page: 0, text: "" }])), { textUnits: null, textUnitsOverBound: 0, textUnitsSkipped: null });
  assert.deepEqual(textUnitsFor(null), { textUnits: null, textUnitsOverBound: 0, textUnitsSkipped: null });
});

test("R23 R2 R24: bytesOf reads the evidence store handed in by digest, assembles a multi-part capture in order, and says why when a part is missing or the whole is over the bound", async () => {
  const b = bucket();
  const store = evidenceStore(b);
  const whole = await hold(b, "whole bytes");
  const p1 = await hold(b, "one "), p2 = await hold(b, "two");
  const dec = (r) => new TextDecoder().decode(r.bytes);
  assert.equal(dec(await bytesOf(store, { capture: { sha256: whole } })), "whole bytes");
  assert.equal(dec(await bytesOf(store, { capture: { sha256: "x" }, parts: [{ sha256: p1, bytes: 4 }, { sha256: p2, bytes: 3 }] })), "one two");
  assert.deepEqual(await bytesOf(store, { capture: { sha256: "0".repeat(64) } }), { bytes: null });
  assert.match((await bytesOf(store, { capture: { sha256: "x" }, parts: [{ sha256: p1, bytes: 4 }, { sha256: "0".repeat(64), bytes: 3 }] })).why,
               /part 2 of 2 is not held/);
  assert.match((await bytesOf(store, { capture: { sha256: "x" }, parts: [{ sha256: p1, bytes: 21 * 1024 * 1024 }] })).why, /over the \d+ B/);
  assert.ok(b.calls.every(([op, k]) => op !== "get" || k.startsWith("bio/captures/")), "only the store's own keys are read");
});

test("R23: the pieces hold no state: the same inputs answer the same, call after call", async () => {
  const t = i2([{ page: 0, text: "same", undetermined: [unreadImage(0)] }]);
  for (let i = 0; i < 2; i++) {
    assert.deepEqual(textUnitsFor(t).textUnits.map((u) => u.text), ["same"]);
    assert.deepEqual(textCountsOf(t), { text_chars: 4, text_glyphs: 4, text_undetermined: 0 });
    assert.deepEqual(layerChainFor(t, { tier: 1, container: "pdf" }).length, 1);
    assert.equal((await tier2Escalate({}, { sha: "d", storeName: "bio", text: t })).outcome, "not_needed");
  }
});

test("R20: no machine mints a grade: a reading carries no grade, every layer, named-engine and conversion step is uncapped, and an OCR step carries exactly the member's measured cap, never a higher one", async () => {
  const w = fresh({ cal: calibration() });
  const pages = [{ page: 0, text: "layer text" }, { page: 1, text: "", undetermined: [noText(1)] }];
  const d = await hold(w.evidence, "%PDF r20");
  const out = await withEntry({ format: "pdf", structure: async () => ({ ok: true, text: i2(pages, { producer: { determination: "ocr", ocr: { engine: "ABBYY", field: "producer", marker: "abbyy" } } }), pages: 2, notes: [] }) },
    () => w.read(doc({ digest: d, format: "pdf", ct: "application/pdf" }), { env: { OCR_WORKER: member(() => ocrAnswer([1], { cap: "D" })) } }));
  const r = out.reading;
  assert.equal(r.text_tier, 3);
  assert.doesNotMatch(JSON.stringify(out), /"grade"/, "no grade is stated anywhere in the answer");
  assert.ok(r.text_source.some((s) => s.step === "pixels") && r.text_source.some((s) => s.step === "ocr" && s.version), "the member's two steps");
  assert.ok(r.text_source.some((s) => s.step === "ocr" && s.engine === "ABBYY" && !s.version), "the named engine's step");
  for (const s of r.text_source) {
    if (s.step === "pixels" || (s.step === "ocr" && s.version)) assert.equal(s.cap, "D", "the member's own measured cap");
    else assert.equal(s.cap, null, `${s.step} is uncapped`);
  }
  /* a Drive export's conversion at the head is uncapped too */
  const drive = [{ who: "instance t", via: "direct" }, { who: "Google Drive", drive_file_id: "abc", export_format: "odt",
                                                          document_address: "https://docs.google.com/document/d/abc/edit" }];
  const dr = await withEntry({ format: "odt", text: async () => ({ ok: true, document: "Doc", paragraphs: [{ para: 0, text: "Doc" }], counts: { chars: 3, undetermined: 0 }, undetermined: [] }) },
    async () => { const dd = await hold(w.evidence, "odt r20"); return w.read(doc({ digest: dd, format: "odt", ct: "application/x", chain: drive })); });
  assert.deepEqual(dr.reading.text_source.map((s) => [s.step, s.cap]), [["convert", null], ["layer", null]]);
});

/* ---- the over-strictness arms: a stored .docx (members uncompressed, so the bytes do not depend on a zlib build) ---- */
const u16 = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]);
const u32 = (n) => Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) { c ^= buf[i]; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1; } return (c ^ 0xffffffff) >>> 0; }
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const [n, d] of files) {
    const name = Buffer.from(n), data = Buffer.from(d), crc = crc32(data);
    const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data]);
    centrals.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
    locals.push(local); offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  return new Uint8Array(Buffer.concat([...locals, cd, u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cd.length), u32(offset), u16(0)]));
}
const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const wp = (s) => `<w:p><w:r><w:t>${s}</w:t></w:r></w:p>`;
const DOCX = zip([["[Content_Types].xml", `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="${DOCX_CT}.main+xml"/></Types>`],
  ["_rels/.rels", `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],
  ["word/document.xml", `<?xml version="1.0"?><w:document ${W}><w:body>${["AGENDA REPORT", "SUBJECT: Midcycle Budget Amendments", "RECOMMENDATION", "Adopt the accompanying resolution."].map(wp).join("")}</w:body></w:document>`]]);
const PDF = new Uint8Array(readFileSync(new URL("../../fixtures/legistar-agenda-1425405.pdf", import.meta.url)));
/* Measured 2026-10-02 over `extraction/pipeline.mjs`'s `read` and this module's, the same inputs: equal. */
const PINNED = {
  pdf: "3f4eb430f988fd7a033d53ba5d1eb1c207561cd568c92996f3e0b323c737051f",
  docx: "b70fa4e8976d4c6ef3f663145af1b943d204b306eab29f7470dd9ea50038cd25",
};

test("R2 R15 (over-strictness): a real PDF and an office capture are read through this module byte for byte as before the move: the whole answer, reading and text units, digests to the pin", async () => {
  for (const [name, bytes, format, ct] of [["pdf", PDF, "pdf", "application/pdf"], ["docx", DOCX, "docx", DOCX_CT]]) {
    const b = bucket();
    const d = await hold(b, bytes);
    const document = doc({ digest: d, bytes: bytes.length, ct, format, locator: "https://a.example/doc", headers: [["content-type", ct]] });
    const out = await rp.read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", view: combine(["oakland-alameda"]).view,
                                          planeVersion: "v-test", liveCalibration: null });
    assert.ok(out.reading.read_from_text && Array.isArray(out.text_units) && out.text_units.length > 0, `${name}: read, with units`);
    assert.equal(hex(JSON.stringify(out)), PINNED[name], name);
  }
});
