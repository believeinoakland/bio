/* extraction, the re-read's word counts (T51 fix round 2, C17; reading-pipeline R35; extraction R34, R71): a reading a
   re-read writes states `words_total` and `words_read` as the first reading does, stores them and answers them through
   `op=reading`. Each test names the requirement ids it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, member, withEntry, i2, noText, ocrAnswer, pageUnits, pressThenPass, payingAccount } from "./fixture.mjs";

const pdf = (text) => ({ format: "pdf", structure: async () => ({ ok: true, text: structuredClone(text), pages: (text.pages || []).length, notes: [] }) });

/* A capture read once with no word counts (a reading made before R35), then re-read through `op=pdfstructure&ocr=1`. */
async function held(text) {
  const w = fresh();
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  const reading = { content_type: "generic", reader_version: 1, read_from_text: false, found: false, entities: [], facts: {},
                    at: "2026-09-01T00:00:00Z", basis: "b", text_source: null, page_count: 2, tier3_candidate: true,
                    container_extent: { container: "pdf", levels: ["images"], images: [] } };
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading, textUnits: pageUnits(text) });
  return { w, d };
}

test("R34 R35 (reading-pipeline R35, C17): a re-read states, stores and answers words_total and words_read, equal when every page was read", async () => {
  const t = i2([{ page: 0, text: "alpha beta gamma" }, { page: 1, text: "", undetermined: [noText(1)] }]);
  const { w, d } = await held(t);
  const { x } = await pressThenPass(w, d, { OCR_WORKER: member(() => ocrAnswer([1])) });
  assert.equal(x.written, true);
  const stored = JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading);
  assert.deepEqual([stored.words_total, stored.words_read], [8, 8], "three typed words and the five the OCR read");
  const got = w.x.readingFor(d, "class:admin").reading;
  assert.deepEqual([got.words_total, got.words_read], [8, 8], "op=reading answers them");
});

test("R34 R35 (reading-pipeline R35, C17): a re-read of a page the OCR member read below its floor answers fewer words read than total", async () => {
  const t = i2([{ page: 0, text: "alpha beta gamma" }, { page: 1, text: "", undetermined: [noText(1)] }]);
  const { w, d } = await held(t);
  const src = (rect) => ({ kind: "pdf-page", ref: "p1", page: 1, rect });
  const ans = ocrAnswer([1], { floor: 0.5 });
  ans.pages[0].regions = [{ text: "good words here", source: src([0, 0, 10, 10]), confidence: { value: 0.9, basis: "engine" } },
                          { text: "faint smudge text", source: src([0, 20, 10, 30]), confidence: { value: 0.1, basis: "engine" } }];
  await pressThenPass(w, d, { OCR_WORKER: member(() => ans) });
  const got = w.x.readingFor(d, "class:admin").reading;
  assert.ok(Number.isInteger(got.words_total) && Number.isInteger(got.words_read), "both counts are stated");
  assert.deepEqual([got.words_total, got.words_read], [9, 6], "three typed, three read, three below the floor");
});

test("R35 (reading-pipeline R35, C17; control): a document never re-read answers the counts its first reading wrote", async () => {
  const w = fresh();
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading: { basis: "b", entities: [], words_total: 12, words_read: 9 } });
  const got = w.x.readingFor(d, "class:admin").reading;
  assert.deepEqual([got.words_total, got.words_read], [12, 9]);
});

test("R71 R35 (reading-pipeline R35, C17): a transcription states, stores and answers the words of the text it wrote, as a re-read does", async () => {
  const w = fresh();
  bundle(w.s, "B-1", { project: null, type: "information" });
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading: { content_type: "generic", reader_version: 1, read_from_text: false, found: false,
    entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b", text_source: null, page_count: 2,
    container_extent: { container: "pdf", levels: ["images"], images: [] } }, textUnits: [{ extent: { kind: "pdf-page", page: 0 }, text: "Minutes of the meeting", seq: 0 }] });
  const t = i2([{ page: 0, text: "Minutes of the meeting" }, { page: 1, text: "", undetermined: [noText(1)] }]);
  w.x.registerTranscriber("plane", {
    deployable: () => true, keptAway: () => null,
    transcription: ({ member: m, project, at }) => ({ member: m, project, at, act: `transcribe:abc:${at}`,
      accounts: { accountFor: payingAccount({ key: "sk-ant-SENTINEL-KEY-0000" }) },
      useCheck: async () => null,
      transcribe: async (q) => ({ ok: true, engine: "claude-test", version: "2026-01", pages: q.pages.map((p) => ({ page: p, text: `AI text of page ${p}` })) }) }) });
  const scan = { format: "pdf",
    detect: (b) => (b && new TextDecoder().decode(b.slice(0, 5)) === "%PDF-" ? { format: "pdf", confidence: "certain", signals: [] } : null),
    structure: async () => ({ ok: true, text: structuredClone(t), pages: 2, notes: [] }) };
  const r = await withEntry(scan, () => w.x.pageTranscribe({ captureSha: d, cls: "member", session: true, caps: ["contribute"], viewer: "class:admin", by: "member:m1", env: {} }));
  assert.equal(r.body.transcription.written, true);
  const got = w.x.readingFor(d, "class:admin").reading;
  assert.deepEqual([got.words_total, got.words_read], [9, 9], "four typed words and the five the AI wrote");
});
