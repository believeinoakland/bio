/* extraction R103, R106 (fix round 9, G126b, G126e, G129d, G132k pass half; K4901): a member's request loads no object whole and makes no OCR call;
   what it leaves is owed; a re-read or transcription never writes over a stored reading that changed under it; `says` names the pages filled; the
   OCR remainder of a standalone image is a job like a PDF's. Counted at the module's real entries (`pdfStructure`, `pageTranscribe`, `readHeld`): the
   evidence store's reads (`get` with and without a range), the OCR member's calls, the registrar's rows (test-support's `jobRegistrarStub`). Each test
   names the requirement ids it checks. SCAN E4 / PDF E11 run here at the smallest size that shows the cause (a 3 MiB file over the 2 MiB request bound);
   their full sizes are the corpus R set's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, member, withEntry, i2, noText, ocrAnswer, pageUnits, payingAccount } from "./fixture.mjs";
// fixtures-contract: plane job-registrar
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";
import { REQUEST_READ_MAX } from "../../../src/extraction/index.mjs";
import { WORD } from "./words.mjs";
import { memberRefusal } from "../../../../ocr-worker/test/fixtures.mjs";

/* the real OCR member declining a page it cannot read (its published fixture, K5044) */
const PAGE_NOT_LEGIBLE = await memberRefusal("PAGE_NOT_LEGIBLE");

const MiB = 1048576;
const member1 = { cls: "member", session: true, caps: ["contribute"], viewer: "class:admin", by: "member:m1" };
const pdfDetect = { format: "pdf", detect: (b) => (b && new TextDecoder().decode(b.slice(0, 5)) === "%PDF-" ? { format: "pdf", confidence: "certain", signals: [] } : null),
  structure: async () => { throw new Error("the file is never parsed in this request"); } };
const scan = (n, read = []) => i2(Array.from({ length: n }, (_, p) => (read.includes(p) ? { page: p, text: `typed words of page ${p}` } : { page: p, text: "", undetermined: [noText(p)] })));
/* the evidence reads: whole gets (no range) and their bytes, and ranged gets */
const reads = (w) => { const gets = w.evidence.calls.filter(([op]) => op === "get"); return { whole: gets.filter((c) => !(c[2] && c[2].range)).length, ranged: gets.filter((c) => c[2] && c[2].range).length }; };

/* a held PDF of `bytes` bytes whose stored reading is `text` (its units as the reader stores them), with the job registrar as the `registerOwe` hook */
async function held(text, { bytes = 3 * MiB, format = "pdf", extra = {} } = {}) {
  const w = fresh();
  bundle(w.s, "B-1");
  const body = new Uint8Array(bytes); body.set(new TextEncoder().encode(format === "jpeg" ? "\xff\xd8\xff\xe0" : "%PDF-1.7 "));
  if (format === "jpeg") body.set([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00], 0);
  body[bytes - 1] = Math.floor(Math.random() * 255);
  const d = await hold(w.evidence, body);
  w.x.writeReading({ bundleId: "B-1", captureSha: d, profileFormat: format, textUnits: pageUnits(text), reading: { content_type: "generic", reader_version: 1,
    read_from_text: false, found: false, entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b", text_source: null,
    page_count: text.pages.length, text_container: format, ...extra } });
  const jobs = jobRegistrarStub();
  w.x.registerOwe(jobs.registerJob);
  w.evidence.calls.length = 0;
  return { w, d, jobs };
}

test("R103 (G126b, G126e; SCAN E4, PDF E11): the press on a 3 MiB, 30-page scan loads no byte of it and calls no engine in the request; the pages left are an `ocr` job, raised, listed by `owedwork`", async () => {
  const { w, d, jobs } = await held(scan(30, [0]));
  assert.ok(3 * MiB > REQUEST_READ_MAX);
  const ocr = member(() => { throw new Error("never in the request"); });
  const r = await w.x.pdfStructure({ ocr: "1", sha: d, viewer: "class:admin", author: "member:m1", env: { OCR_WORKER: ocr } });
  assert.equal(r.status, 200);
  assert.deepEqual([r.body.reextraction.performed, r.body.reextraction.written, r.body.reextraction.owed, r.body.reextraction.candidate.length], [false, false, true, 29]);
  assert.deepEqual(reads(w), { whole: 0, ranged: 0 }, "no byte of the object is read");
  assert.equal(ocr.calls.length, 0);
  assert.deepEqual(jobs.rows().map((j) => [j.kind, j.sha, j.cursor, j.priority, j.detail]), [["ocr", d, 1, "raised", { via: "op=pdfstructure&ocr=1", by: "member:m1" }]]);
});

test("R103 (G126e; K4901 (2); R-SILENT): the plain `op=pdfstructure` of a PDF over the request bound reads nothing in the request: it owes a raised `reading` job and states the file's size and the bound; one at the bound is read as R31 states (control)", async () => {
  const big = await held(scan(3, [0, 1, 2]), { bytes: REQUEST_READ_MAX + 1 });
  const r = await big.w.x.pdfStructure({ sha: big.d });
  assert.deepEqual([r.status, r.body.ok, r.body.size, r.body.limit, r.body.reextraction.owed, r.body.reextraction.performed], [200, true, REQUEST_READ_MAX + 1, REQUEST_READ_MAX, true, false]);
  assert.match(r.body.reextraction.why, new RegExp(`${REQUEST_READ_MAX + 1} bytes.*${REQUEST_READ_MAX} bytes`));
  assert.deepEqual(reads(big.w), { whole: 0, ranged: 0 });
  assert.deepEqual(big.jobs.rows().map((j) => [j.kind, j.priority]), [["reading", "raised"]]);
  const small = await held(scan(1, [0]), { bytes: REQUEST_READ_MAX });
  const entry = { format: "pdf", structure: async (b) => ({ ok: true, text: i2([{ page: 0, text: `read ${b.length}` }]), pages: 1, notes: [] }) };
  const s = await withEntry(entry, () => small.w.x.pdfStructure({ sha: small.d }));
  assert.deepEqual([s.status, s.body.text.pages[0].text, s.body.reextraction], [200, `read ${REQUEST_READ_MAX}`, undefined]);
  assert.equal(small.jobs.rows().length, 0);
});

test("R103 (G126e; SCAN E4, PDF E11): `op=pagetranscribe` on a 3 MiB scan reads its first KiB alone (the format, R73), makes no OCR call, and `says` names the pages the AI filled, not those asked", async () => {
  const { w, d } = await held(scan(5, [0]));
  const asked = [];
  w.x.registerTranscriber("plane", { deployable: () => true, keptAway: () => null,
    transcription: ({ member: m, project, at }) => ({ member: m, project, at, act: "t", accounts: { accountFor: payingAccount() },
      useCheck: async () => null, transcribe: async (q) => { asked.push(q.pages); return { ok: true, engine: "claude-test", version: "1", pages: [{ page: 2, text: "AI words of page 2" }, { page: 4, text: "AI words of page 4" }] }; } }) });
  const ocr = member(() => { throw new Error("never in the request"); });
  const r = await withEntry(pdfDetect, () => w.x.pageTranscribe({ captureSha: d, ...member1, env: { OCR_WORKER: ocr } }));
  assert.equal(r.body.transcription.written, true, JSON.stringify(r.body).slice(0, 300));
  assert.deepEqual(asked, [[1, 2, 3, 4]]);
  assert.deepEqual(reads(w), { whole: 0, ranged: 1 }, "one ranged read: the first KiB");
  assert.equal(w.evidence.calls.find(([op, , o]) => op === "get" && o && o.range)[2].range.length, 1024);
  assert.equal(ocr.calls.length, 0);
  assert.equal(r.body.says, WORD("transcribe.done").replace("{pages}", "3, 5"), "the pages filled (2 and 4, counted from 1)");
  assert.deepEqual(r.body.owed, { kind: "ocr", pages_left: 2, registered: true, existed: false }, "pages 1 and 3, which the AI left, are owed to OCR");
});

test("R103 (G126e): a stored reading that changes while a transcription runs is not written over: the act answers written false with its reason, and the newer reading stands", async () => {
  const { w, d } = await held(scan(3, [0]));
  const newer = { content_type: "generic", reader_version: 1, found: true, entities: [], facts: {}, at: "2026-10-01T00:00:00Z", basis: "a newer reading", text_source: null, page_count: 3 };
  w.x.registerTranscriber("plane", { deployable: () => true, keptAway: () => null,
    transcription: ({ member: m, project, at }) => ({ member: m, project, at, act: "t", accounts: { accountFor: payingAccount() },
      useCheck: async () => null,
      transcribe: async (q) => {
        /* while the AI reads, a promotion writes a newer reading of the capture */
        w.x.writeReading({ bundleId: "B-1", captureSha: d, reading: newer });
        return { ok: true, engine: "claude-test", version: "1", pages: q.pages.map((p) => ({ page: p, text: `AI ${p}` })) };
      } }) });
  const r = await withEntry(pdfDetect, () => w.x.pageTranscribe({ captureSha: d, ...member1 }));
  assert.deepEqual([r.body.transcription.performed, r.body.transcription.written, "says" in r.body], [true, false, false]);
  assert.match(r.body.transcription.why, /changed while this transcription was being made/);
  assert.equal(w.x.readingOf(d).reading.basis, "a newer reading");
  /* control: the same act with nothing changing under it is written */
  const c = await held(scan(3, [0]));
  c.w.x.registerTranscriber("plane", { deployable: () => true, keptAway: () => null,
    transcription: ({ member: m, project, at }) => ({ member: m, project, at, act: "t", accounts: { accountFor: payingAccount() },
      useCheck: async () => null, transcribe: async (q) => ({ ok: true, engine: "claude-test", version: "1", pages: q.pages.map((p) => ({ page: p, text: `AI ${p}` })) }) }) });
  assert.equal((await withEntry(pdfDetect, () => c.w.x.pageTranscribe({ captureSha: c.d, ...member1 }))).body.transcription.written, true);
});

test("R103 (G126e): the ledger's pass does not write over a stored reading that changed while the OCR member read: the job stays owed and the next pass reads again", async () => {
  const { w, d } = await held(scan(2, [0]));
  let n = 0;
  const ocr = member((b) => { if (n++ === 0) w.x.writeReading({ bundleId: "B-1", captureSha: d, textUnits: pageUnits(scan(2, [0])),
    reading: { content_type: "generic", found: false, entities: [], at: "x", basis: "changed", text_source: null, page_count: 2 } }); return ocrAnswer(b.pages); });
  const first = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
  assert.deepEqual([first.read, first.owed, first.why], [false, true, "BASIS_CHANGED"]);
  assert.equal(w.x.readingOf(d).reading.basis, "changed");
  const second = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
  assert.deepEqual([second.read, second.reextraction.pages], [true, [1]]);
});

test("R106 (G129d; SCAN E3): a photograph's OCR continues without the PDF structure read: with the member down for three ticks the job stays owed, never UNREADABLE nor finished; the fourth tick reads it", async () => {
  const { w, d } = await held(i2([{ page: 0, text: "", undetermined: [noText(0)] }]), { bytes: 2048, format: "jpeg", extra: { tier3_candidate: true } });
  let up = false;
  const ocr = member((b) => (up ? ocrAnswer(b.pages, { text: () => "the words on the photographed page" }) : { status: 503, body: { ok: false } }));
  for (let tick = 0; tick < 3; tick++) {
    const a = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
    assert.deepEqual([a.read, a.owed], [false, true], `tick ${tick + 1}: ${JSON.stringify(a)}`);
    assert.notEqual(a.why, "UNREADABLE");
  }
  up = true;
  const done = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
  assert.deepEqual([done.read, done.owed, done.reextraction.pages], [true, undefined, [0]]);
  assert.match(w.x.readingFor(d, "class:admin").text_units.map((u) => u.text).join(" "), /photographed page/);
  assert.deepEqual(w.x.readingFor(d, "class:admin").unread_pages, []);
  assert.deepEqual(ocr.calls.map((c) => c.body.pages), [[0], [0], [0], [0]]);
});

test("R106 (control): a photograph the OCR member declines ends stated with its reason, owing nothing", async () => {
  const { w, d } = await held(i2([{ page: 0, text: "", undetermined: [noText(0)] }]), { bytes: 2048, format: "jpeg", extra: { tier3_candidate: true } });
  const a = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: member(() => PAGE_NOT_LEGIBLE) } });
  assert.deepEqual([a.read, a.owed, a.why], [false, undefined, "OCR_NO_PROGRESS"]);
});

test("R103 R35 (K4904 (2); plan 2c item 9): a page the reading lists in `folio_pages` keeps its folio and is OCRed by the pass, the OCR appended after it (D-635); a reading without the field rebuilds that page as text, unasked (control: old readings, new data only)", async () => {
  const t = i2([{ page: 0, text: "7" }, { page: 1, text: "typed words of page 1" }]);
  const { w, d } = await held(t, { bytes: 2048, extra: { folio_pages: [0] } });
  const ocr = member((b) => ocrAnswer(b.pages));
  const pass = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
  assert.deepEqual([pass.read, pass.reextraction && pass.reextraction.pages], [true, [0]], JSON.stringify(pass));
  assert.deepEqual(ocr.calls.flatMap((c) => c.body.pages), [0]);
  assert.equal(w.one(`SELECT text FROM capture_text WHERE capture_sha=? AND seq=0`, d).text, "7\nocr text of page 0", "the folio kept, the OCR appended");
  assert.equal(w.x.readingOf(d).reading.folio_pages, undefined, "a read folio page is no longer listed");
  const old = await held(t, { bytes: 2048 });
  const none = member((b) => ocrAnswer(b.pages));
  const r = await old.w.x.readHeld({ sha: old.d, kind: "ocr", env: { OCR_WORKER: none } });
  assert.deepEqual([r.read, r.why, none.calls.length], [false, "NO_PAGES_LEFT", 0]);
});

test("R102 R103 (E6's member): a pass whose OCR member answers some of the pages asked and names no rest leaves the others owed, re-registered from the first of them, and the next pass reads on to the end", async () => {
  const { w, d } = await held(scan(60, [0]), { bytes: 2048 });
  const ocr = member((b) => ocrAnswer(b.pages.slice(0, 24)));
  const one = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
  assert.deepEqual([one.read, one.owed, one.registration && one.registration.pages_left], [true, true, 35], JSON.stringify(one));
  const two = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
  const three = await w.x.readHeld({ sha: d, kind: "ocr", env: { OCR_WORKER: ocr } });
  assert.deepEqual([two.owed, three.owed], [true, undefined]);
  assert.deepEqual(w.x.readingFor(d, "class:admin").unread_pages, []);
  assert.equal(w.x.readingOf(d).reading.ocr_left, undefined);
});
