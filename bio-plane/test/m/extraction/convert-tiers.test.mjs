/* extraction: `op=pdfstructure`'s tier-2 wire (R31), converted from `test/tier2-wire.test.mjs` (REC-98), extraction's
   share of `build/jobs/T17/legacy-tests.md`'s row. The reading's halves of these cases, and the converted
   `tier3-layer-parts` cases, are `reading-pipeline`'s since N513 (its R3, R6, R10, R11). `Extraction#pdfStructure` runs
   over stored bytes with the real tier-1 `pdf` entry: the committed CPDF-20 PDFs with the real `pdf-worker` member bound
   to its own `fetch`, and synthesised PDFs with scripted members. Each test names the requirement ids it checks in its
   title; reading-pipeline's ids are named as such. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fresh, hold } from "./fixture.mjs";
import pdfWorker from "../../../../pdf-worker/src/index.mjs";
import { getFormat } from "../../../src/formats.mjs";
import { mergeTier2Text, tier2Note, glyphCount } from "../../../src/textchain.mjs";
import { decodeView } from "../../../src/reading-pipeline/index.mjs";

const CPDF20 = (f) => new Uint8Array(readFileSync(new URL(`../../fixtures/cpdf20/${f}`, import.meta.url)));
const MIXED = CPDF20("legistar-73545.pdf");     // 7 pages: 0-5 to tier 2, 6 kept at tier 1
const CLEAN = CPDF20("legistar-73450.pdf");     // fully decodable: never escalates
const DEGRADES = CPDF20("legistar-73618.pdf");  // CPDF-20's page; tier 1 reads it, so it never escalates

/* The real member over the store's evidence bucket; each call's body and answer recorded. */
function realMember(w) {
  const calls = [];
  return { calls, async fetch(url, init) {
    const res = await pdfWorker.fetch(new Request(url, init), { CAPTURES: w.evidence, VERSION: "test" });
    calls.push({ body: JSON.parse(init.body), answer: await res.clone().json() });
    return res;
  } };
}
const tier1 = async (bytes) => (await getFormat("pdf").structure(bytes)).text;
const TIER2_WORDS = /tier-2 decoder|merge of two decodes|tier2_/;

/* ---------------------------------------------------------------- tier2-wire.test.mjs (REC-98) */

test("R31 (reading-pipeline R3, R18) (tier2-wire): op=pdfstructure over the mixed legistar-73545 states the tier per page, 0-5 the member's decode and 6 tier 1's own text byte for byte, tier 2, and carries the merge's own per-page statement", async () => {
  const w = fresh();
  const pw = realMember(w);
  const d = await hold(w.evidence, MIXED);
  const before = JSON.stringify([w.rows(`SELECT * FROM readings`), w.rows(`SELECT * FROM capture_text`)]);
  const out = await w.x.pdfStructure({ sha: d, storeName: "bio", env: { PDF_WORKER: pw } });
  assert.equal(out.status, 200);
  assert.equal(pw.calls.length, 1);
  assert.deepEqual(pw.calls[0].body, { capture_sha: d, store: "bio" });
  const t1 = await tier1(MIXED), t2 = pw.calls[0].answer.text;
  const pages = out.body.text.pages;
  assert.deepEqual(pages.map((p) => p.tier), [2, 2, 2, 2, 2, 2, 1]);
  assert.equal(out.body.tier, 2, "the wired tier is 2: a page was replaced");
  for (const p of pages) {
    const want = (p.tier === 2 ? t2 : t1).pages.find((q) => q.page === p.page).text;
    assert.equal(p.text, want, `page ${p.page} is tier ${p.tier}'s own text`);
  }
  assert.ok(t1.pages[0].text.length < 50 && pages[0].text.length > 1000, "page 0 is the recovery the escalation is for");
  /* the note is text-chain's own statement of this merge, carried; it counts both parts */
  const note = tier2Note(mergeTier2Text(t1, t2));
  assert.ok(out.body.notes.includes(note));
  assert.match(note, /6 page\(s\) were re-read by the tier-2 decoder/);
  assert.match(note, /the other 1 page\(s\) kept tier 1's reading/);
  assert.match(note, /this document's text layer is a merge of two decodes/);
  /* reading-pipeline R18: provenance credits each page to its own tier and member */
  assert.deepEqual(out.body.provenance.pages.map((p) => [p.page, p.tier, p.member]),
                   [0, 1, 2, 3, 4, 5].map((n) => [n, 2, "pdf-worker"]).concat([[6, 1, "plane"]]));
  assert.equal(JSON.stringify([w.rows(`SELECT * FROM readings`), w.rows(`SELECT * FROM capture_text`)]), before, "nothing is written");
});

test("R31 (reading-pipeline R3) (tier2-wire): one tier throughout: legistar-73450 is never escalated through op=pdfstructure, tier 1 and no tier-2 note, and the member is not asked", async () => {
  const w = fresh();
  const pw = realMember(w);
  const d = await hold(w.evidence, CLEAN);
  const s = await w.x.pdfStructure({ sha: d, env: { PDF_WORKER: pw } });
  assert.equal(s.body.tier, 1);
  assert.equal(s.body.notes.some((n) => TIER2_WORDS.test(n)), false);
  assert.equal(pw.calls.length, 0, "the member is not asked for a document tier 1 read");
});

test("R31 (reading-pipeline R3) (tier2-wire): the real legistar-73618 does not escalate: its undetermined markers do not outnumber its glyphs, the member is never asked, and the op answers tier 1's own text with no tier-2 note", async () => {
  const w = fresh();
  const pw = realMember(w);
  const t1 = await tier1(DEGRADES);
  const weighed = decodeView(t1).counts.undetermined;
  assert.ok(weighed >= 1 && weighed <= glyphCount(t1.document), "markers do not outnumber glyphs");
  const d = await hold(w.evidence, DEGRADES);
  const s = await w.x.pdfStructure({ sha: d, env: { PDF_WORKER: pw } });
  assert.equal(pw.calls.length, 0);
  assert.equal(s.body.tier, 1);
  assert.deepEqual(s.body.text, t1, "tier 1's text, untouched");
  assert.equal(s.body.notes.some((n) => TIER2_WORDS.test(n)), false);
});

/* Two synthesised one-page PDFs (tier2-wire §7): a layer whose /Info producer names ABBYY, and an encrypted document
   (tier 1's pageless early return, the only shape that reaches the merge's wholesale branch). */
const classic = (bodies, trailer) => {
  let s = "%PDF-1.7\n%\xe2\xe3\xcf\xd3\n"; const off = [];
  bodies.forEach((b, i) => { off[i] = s.length; s += `${i + 1} 0 obj\n${b}\nendobj\n`; });
  const x = s.length, n = bodies.length + 1;
  let xr = `xref\n0 ${n}\n0000000000 65535 f \n`;
  for (let i = 0; i < bodies.length; i++) xr += `${String(off[i]).padStart(10, "0")} 00000 n \n`;
  s += xr + `trailer\n<< /Size ${n} /Root 1 0 R ${trailer} >>\nstartxref\n${x}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(s, "latin1"));
};
const HELLO = "BT /F1 24 Tf 72 700 Td (Hello Oakland 2026) Tj ET";
const ABBYY = classic(["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${HELLO.length} >>\nstream\n${HELLO}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  "<< /Producer (ABBYY FineReader 15) >>"], "/Info 6 0 R");
const ENCRYPTED = classic(["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>",
  "<< /Filter /Standard /V 2 /R 3 /O (0000000000000000) /U (0000000000000000) /P -44 >>"], "/Encrypt 4 0 R");

test("R31 (reading-pipeline R3) (tier2-wire): the tier-1 producer marker is carried through op=pdfstructure's page-wise merge when the member supplies none", async () => {
  const w = fresh();
  const pw = realMember(w);
  const t1 = await tier1(ABBYY);
  assert.deepEqual([t1.producer.determination, t1.producer.ocr.engine], ["ocr", "ABBYY FineReader 15"], "the arm is real");
  const d = await hold(w.evidence, ABBYY);
  const s = await w.x.pdfStructure({ sha: d, env: { PDF_WORKER: pw } });
  assert.equal("producer" in pw.calls[0].answer.text, false, "the member supplies no producer");
  assert.deepEqual([s.body.tier, s.body.text.document], [2, "Hello Oakland 2026"]);
  assert.deepEqual(s.body.text.producer, t1.producer);
});

test("R31 (reading-pipeline R3) (tier2-wire): in the merge's wholesale branch (an encrypted document, no pages and no glyph) op=pdfstructure carries tier 1's producer onto the real member's text and keeps the wired tier 1", async () => {
  const w = fresh();
  const pw = realMember(w);
  const t1 = await tier1(ENCRYPTED);
  assert.deepEqual([t1.pages.length, t1.counts.chars, t1.producer.why], [0, 0, "encrypted"], "the wholesale shape");
  const d = await hold(w.evidence, ENCRYPTED);
  const s = await w.x.pdfStructure({ sha: d, env: { PDF_WORKER: pw } });
  assert.equal(pw.calls.length, 1, "it escalates");
  assert.equal("producer" in pw.calls[0].answer.text, false);
  assert.deepEqual(s.body.text.producer, t1.producer, "the op still says why its /Info could not be read");
  assert.equal(s.body.tier, 1, "no page was replaced, so the wired tier stays 1");
});
