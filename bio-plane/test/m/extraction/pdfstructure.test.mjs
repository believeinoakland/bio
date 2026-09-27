/* extraction: the re-read, `op=pdfstructure` (R31–R35, R47), at the module's interface: `Extraction#pdfStructure` (the
   Durable Object half) and `pdfStructureOp` (the control plane's handler), over a stored capture and its reading, with
   scripted fleet members and a scripted pdf entry. Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, member, withEntry, i2, noText, folio, unreadImage, ocrAnswer, calibration } from "./fixture.mjs";
import { REEXTRACT_CHECKS } from "../../../src/extraction/index.mjs";
import { pdfStructureOp } from "../../../src/extraction/ops.mjs";
import { OCR_INVOCATIONS_PER_REQUEST } from "../../../src/extraction/pipeline.mjs";
import { unregisterFormat, registerFormat, getFormat } from "../../../src/formats.mjs";

const pdf = (text, pages) => ({ format: "pdf", structure: async (b) => (new TextDecoder().decode(b).startsWith("%PDF")
  ? { ok: true, text: structuredClone(text), pages: pages ?? (text.pages || []).length, notes: [] }
  : { ok: false, reason: "NOT_A_PDF" }) });

/* A store holding a capture of `text` in bundle B-1, read once (its reading and whole-page units written). */
async function held(text, { env = {}, cal } = {}) {
  const w = fresh({ env, ...(cal ? { cal } : {}) });
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  const reading = { content_type: "generic", reader_version: 1, read_from_text: false, found: false, entities: [], facts: {},
                    at: "2026-09-01T00:00:00Z", basis: "b", text_source: null, page_count: 3, container_extent: { container: "pdf", levels: ["images"], images: [] } };
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading });
  return { w, d };
}
const writes = (w) => JSON.stringify([w.rows(`SELECT * FROM readings`), w.rows(`SELECT * FROM capture_text`), w.rows(`SELECT * FROM reading_history`)]);

test("R31: the control plane refuses a malformed digest (required argument) and an instance with no evidence storage, and forwards the rest with its stamps", async () => {
  const json = (b, s = 200) => ({ b, s });
  const helpers = { json, storeSilent: (op) => ({ silent: op }), storageAbsent: (op, e) => ({ absent: op, e }),
    requiredArgument: (op, arg, shape) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument: arg, shape }) };
  const noStore = await pdfStructureOp(new URL("http://p/?op=pdfstructure&sha256=" + "a".repeat(64)), {}, null, { ...helpers });
  assert.equal(noStore.absent, "pdfstructure");
  const bad = await pdfStructureOp(new URL("http://p/?sha256=XYZ"), { CAPTURES: { get() {} } }, null, { ...helpers });
  assert.deepEqual([bad.s, bad.b.reason, bad.b.argument], [400, "REQUIRED_ARGUMENT_MISSING", "sha256"]);
  let asked = null;
  const store = { fetch: async (p) => { asked = new URL(String(p)); return new Response(JSON.stringify({ ok: true, result: { status: 409, body: { reason: "X" } } })); } };
  const ok = await pdfStructureOp(new URL("http://p/?sha256=" + "B".repeat(64) + "&ocr=1"), { CAPTURES: { get() {} } }, store,
    { ...helpers, cls: "member", session: true, caps: new Set(["contribute"]), viewer: "member:m1", author: "member:m1", storeName: "ns" });
  assert.deepEqual([ok.s, ok.b.reason], [409, "X"]);
  assert.equal(asked.pathname, "/pdfstructure");
  assert.deepEqual(Object.fromEntries(asked.searchParams), { sha256: "b".repeat(64), cls: "member", session: "1", caps: "contribute",
    viewer: "member:m1", author: "member:m1", store: "ns", ocr: "1" });
  const silent = await pdfStructureOp(new URL("http://p/?sha256=" + "a".repeat(64)), { CAPTURES: { get() {} } }, { fetch: async () => new Response("{}") }, { ...helpers });
  assert.equal(silent.silent, "pdfstructure");
});

test("R31: without ocr it is a read: NOT_FOUND, FORMAT_UNREGISTERED, the entry's own answer for a non-PDF; otherwise the structure with tier 2, its tier and provenance; nothing written, and two reads answer alike", async () => {
  const { w, d } = await held(i2([{ page: 0, text: "Plain page" }]));
  const absent = await w.x.pdfStructure({ sha: "e".repeat(64) });
  assert.deepEqual([absent.status, absent.body.reason], [404, "NOT_FOUND"]);
  const had = getFormat("pdf");
  unregisterFormat("pdf");
  try { const u = await w.x.pdfStructure({ sha: d }); assert.deepEqual([u.status, u.body.reason], [501, "FORMAT_UNREGISTERED"]); }
  finally { registerFormat(had); }
  const notPdf = await hold(w.evidence, "not a pdf");
  const n = await withEntry(pdf(i2([])), () => w.x.pdfStructure({ sha: notPdf }));
  assert.deepEqual([n.status, n.body.reason], [422, "NOT_A_PDF"]);
  const before = writes(w);
  const a = await withEntry(pdf(i2([{ page: 0, text: "Plain page" }])), () => w.x.pdfStructure({ sha: d }));
  const b = await withEntry(pdf(i2([{ page: 0, text: "Plain page" }])), () => w.x.pdfStructure({ sha: d }));
  assert.equal(a.status, 200);
  assert.equal(a.body.tier, 1);
  assert.equal(a.body.provenance.scheme, "reading-provenance/1");
  assert.equal("reextraction" in a.body, false);
  assert.deepEqual(a, b);
  assert.equal(writes(w), before, "nothing is written");
  /* tier 2's notes: no improvement, unavailable */
  const garbled = i2([{ page: 0, text: "", undetermined: [{ page: 0, reason: "no_tounicode", count: 1 }, { page: 0, reason: "no_tounicode", count: 1 }] }]);
  const noImp = await withEntry(pdf(garbled), () => w.x.pdfStructure({ sha: d, env: { PDF_WORKER: member(() => ({ status: 500, body: { ok: false } })) } }));
  assert.ok(noImp.body.notes.includes("tier2_no_improvement"));
  const gone = await withEntry(pdf(garbled), () => w.x.pdfStructure({ sha: d, env: { PDF_WORKER: member(() => new Error("down")) } }));
  assert.ok(gone.body.notes.includes("tier2_unavailable"));
  const won = await withEntry(pdf(garbled), () => w.x.pdfStructure({ sha: d, env: { PDF_WORKER: member(() => ({ ok: true, notes: ["member note"], text: i2([{ page: 0, text: "decoded" }]) })) } }));
  assert.equal(won.body.tier, 2);
  assert.ok(won.body.notes.includes("member note"));
});

test("R32 R47: with ocr, before any byte is read or engine called: malformed flag, agent, no contribute, no OCR member, no reading the caller can see — each refused with its C-51 row", async () => {
  const { w, d } = await held(i2([{ page: 0, text: "", undetermined: [noText(0)] }]));
  bundle(w.s, "PROJ-9", { type: "project" });
  const hidden = await hold(w.evidence, "%PDF hidden");
  w.x.writeReading({ bundleId: "PROJ-9", captureSha: hidden, reading: { entities: [], at: "a" } });
  const ocr = member(() => { throw new Error("never"); });
  const calls = () => w.evidence.calls.filter(([op]) => op === "get").length;
  const n0 = calls();
  const cases = [
    [{ ocr: "yes", sha: d }, 400, "REEXTRACT_FLAG_MALFORMED"],
    [{ ocr: "1", sha: d, cls: "ai", env: { OCR_WORKER: ocr } }, 403, "REEXTRACT_AGENT_REFUSED"],
    [{ ocr: "1", sha: d, cls: "member", session: true, caps: ["view"], env: { OCR_WORKER: ocr } }, 403, "REEXTRACT_NOT_CAPABLE"],
    [{ ocr: "1", sha: d, cls: "member", session: true, caps: ["contribute"], env: {} }, 501, "REEXTRACT_NO_OCR_MEMBER"],
    [{ ocr: "1", sha: "9".repeat(64), cls: "admin", viewer: "class:admin", env: { OCR_WORKER: ocr } }, 409, "REEXTRACT_NOT_READ"],
    [{ ocr: "1", sha: hidden, cls: "member", session: true, caps: ["contribute"], viewer: "member:outsider", env: { OCR_WORKER: ocr } }, 409, "REEXTRACT_NOT_READ"],
  ];
  for (const [args, status, reason] of cases) {
    const r = await w.x.pdfStructure(args);
    assert.deepEqual([r.status, r.body.reason], [status, reason], reason);
    assert.equal(r.body.check, REEXTRACT_CHECKS[reason].check);
    assert.equal(r.body.translation, REEXTRACT_CHECKS[reason].translation);
    assert.equal(r.body.code, reason);
  }
  assert.equal(calls(), n0, "no byte was read");
  assert.equal(ocr.calls.length, 0, "no engine was called");
  const never = await w.x.pdfStructure({ ocr: "1", sha: "8".repeat(64), viewer: "class:admin", env: { OCR_WORKER: ocr } });
  const invisible = await w.x.pdfStructure({ ocr: "1", sha: hidden, viewer: "member:outsider", env: { OCR_WORKER: ocr } });
  assert.equal(never.body.detail, invisible.body.detail, "answered alike for one never filed");
  assert.deepEqual(Object.keys(REEXTRACT_CHECKS).map((k) => REEXTRACT_CHECKS[k].check), ["C-51.1", "C-51.2", "C-51.3", "C-51.4", "C-51.5"]);
});

test("R33: with no page filled the answer's reextraction is performed false, written false, the cost, candidacy and why, and nothing is written", async () => {
  const { w, d } = await held(i2([{ page: 0, text: "all text" }]));
  const before = writes(w);
  const r = await withEntry(pdf(i2([{ page: 0, text: "all text" }])),
    () => w.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", env: { OCR_WORKER: member(() => ocrAnswer([0])) } }));
  assert.deepEqual([r.body.reextraction.performed, r.body.reextraction.written, r.body.reextraction.candidate], [false, false, false]);
  assert.match(r.body.reextraction.cost, /per image-only page/);
  assert.match(r.body.reextraction.why, /no page of this document lacks a text layer/);
  const declined = await withEntry(pdf(i2([{ page: 0, text: "", undetermined: [noText(0)] }])),
    () => w.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", env: { OCR_WORKER: member(() => ({ ok: false, reason: "busy" })) } }));
  assert.equal(declined.body.reextraction.performed, false);
  assert.equal(declined.body.reextraction.candidate, true);
  assert.match(declined.body.reextraction.why, /declined/);
  assert.equal(writes(w), before);
});

test("R34 R24 R6: with pages filled, the reading by R12's rule with the stored type, at kept, page count and extent carried, provenance and reextracted; written by R19 with no bundle version; the answer reports the listeners and the index", async () => {
  const cal = calibration({ live: [{ calibration_id: "CAL-3", engine: "tess", version: "5.3" }] });
  const { w, d } = await held(i2([{ page: 0, text: "Text" }, { page: 1, text: "", undetermined: [noText(1)] }]), { cal });
  w.x.onReading("content", () => ({ staled: 4 }));
  w.x.onReading("observation-log", () => ({ observed: { written: 2 } }));
  const r = await withEntry(pdf(i2([{ page: 0, text: "Text" }, { page: 1, text: "", undetermined: [noText(1)] }]), 2),
    () => w.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", author: "member:m1", env: { OCR_WORKER: member(() => ocrAnswer([1])) } }));
  const x = r.body.reextraction;
  assert.deepEqual([x.performed, x.written, x.pages, x.engine.engine, x.engine.calibration, x.staled, x.observed.written],
                   [true, true, [1], "tess", "CAL-3", 4, 2]);
  assert.ok(x.units && x.units.written === 2);
  assert.match(x.chain, /pixels|OCR|ocr/i);
  const stored = JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading);
  assert.equal(stored.content_type, "generic");
  assert.equal(stored.at, "2026-09-01T00:00:00Z");
  assert.equal(stored.page_count, 2);
  assert.deepEqual(stored.container_extent, { container: "pdf", levels: ["images"], images: [] });
  assert.equal(stored.provenance.scheme, "reading-provenance/1");
  assert.deepEqual(Object.keys(stored.reextracted).sort(), ["at", "by", "calibration", "engine", "pages", "version", "via"]);
  assert.deepEqual([stored.reextracted.by, stored.reextracted.via, stored.reextracted.calibration], ["member:m1", "op=pdfstructure&ocr=1", "CAL-3"]);
  assert.equal(r.body.tier, 3);
  assert.equal(w.x.readingFor(d).origin.state, "composed");
  assert.equal(w.rows(`SELECT * FROM manifest`).length, 0, "no bundle version is minted");
  assert.equal(x.compared.state, "undetermined");
});

test("R35 R8: a re-read asks only for the pages the stored reading still leaves unread, so repeated re-reads reach a long scan's tail, and a folio page is never appended twice", async () => {
  const pages = Array.from({ length: 30 }, (_, i) => ({ page: i, text: i === 0 ? "7" : "", undetermined: [i === 0 ? folio(0) : noText(i)] }));
  const { w, d } = await held(i2(pages));
  const ocr = () => member((body, n) => (n === 1 ? { ...ocrAnswer([body.pages[0]]), deferred: body.pages.slice(1) } : ocrAnswer(body.pages)));
  const first = ocr();
  const r1 = await withEntry(pdf(i2(pages)), () => w.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", env: { OCR_WORKER: first } }));
  assert.equal(first.calls.length, OCR_INVOCATIONS_PER_REQUEST);
  assert.equal(r1.body.reextraction.pages.length, OCR_INVOCATIONS_PER_REQUEST);
  const second = ocr();
  const r2 = await withEntry(pdf(i2(pages)), () => w.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", env: { OCR_WORKER: second } }));
  const asked2 = second.calls.flatMap((c) => c.body.pages);
  assert.deepEqual([...new Set(asked2)].sort((a, b) => a - b), [24, 25, 26, 27, 28, 29], "only the tail is asked");
  assert.deepEqual(r2.body.reextraction.pages, [24, 25, 26, 27, 28, 29]);
  const p0 = w.one(`SELECT text FROM capture_text WHERE capture_sha=? AND seq=0`, d).text;
  assert.equal(p0, "7\nocr text of page 0", "the folio page keeps one copy of its folio");
  const third = ocr();
  const r3 = await withEntry(pdf(i2(pages)), () => w.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", env: { OCR_WORKER: third } }));
  assert.equal(third.calls.length, 0, "every page read: the member is not asked again");
  assert.equal(r3.body.reextraction.performed, false);
  assert.equal(r3.body.reextraction.candidate, false);
});

test("R9: a page tier 2 wins keeps a still-true image_unread marker; a page OCR fills discharges it", async () => {
  const bad = { page: 0, reason: "no_tounicode", count: 1 };
  const t1 = i2([{ page: 0, text: "", undetermined: [bad, bad, bad, unreadImage(0)] }, { page: 1, text: "", undetermined: [noText(1), unreadImage(1)] }]);
  const { w, d } = await held(t1);
  const env = { PDF_WORKER: member(() => ({ ok: true, text: i2([{ page: 0, text: "decoded by tier two" }, { page: 1, text: "" }]) })),
                OCR_WORKER: member(() => ocrAnswer([1])) };
  const r = await withEntry(pdf(t1), () => w.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", env }));
  const p0 = r.body.text.pages.find((p) => p.page === 0), p1 = r.body.text.pages.find((p) => p.page === 1);
  assert.equal(p0.tier, 2);
  assert.ok(p0.undetermined.some((u) => u.reason === "image_unread"), "kept on the page tier 2 won");
  assert.ok(!p1.undetermined.some((u) => u.reason === "image_unread" || u.reason === "no_text_layer"), "discharged where OCR filled");
});
