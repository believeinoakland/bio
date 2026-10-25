/* extraction, T43-10 at the module's interface: N853a (R71, a refusal tier 4 relays is answered as that refusal),
   N853b (R73, the format read from the stored bytes, a picture file's one page) and N862 (R47's C-51.7 words, R71's
   `transcription.label` and `says`, R27's `unread_pages` and `unread_says`), each with a negative control (K874). Words
   are read by key from `words.json` (`./words.mjs`); a key the list lacks fails the test. Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, doc, withEntry, i2, noText, pageUnits, payingAccount } from "./fixture.mjs";
import { REEXTRACT_CHECKS, TRANSCRIBE_WORDS } from "../../../src/extraction/index.mjs";
import { WORD } from "./words.mjs";
import { crc32 as zlibCrc } from "node:zlib";
import { noAccount } from "../ai-accounts/fixtures.mjs";

const member1 = { cls: "member", session: true, caps: ["contribute"], viewer: "class:admin", by: "member:m1" };
const ONE_MATTER = { id: "t-set", version: 2, matters: [{ id: "m1" }] };

/* The composition root's transcriber (plane R36's shape), deployable, recording every call. */
function transcriber({ deployable = true, account = null, limit = null,
                       answer = (pages) => ({ ok: true, engine: "claude-test", version: "2026-01", pages: pages.map((p) => ({ page: p, text: `AI text of page ${p}` })) }) } = {}) {
  const calls = { transcribe: [] };
  const t = {
    deployable: () => deployable && ONE_MATTER.matters.length > 0,
    keptAway: () => null,
    transcription: ({ member, project, at }) => ({ member, project, at, act: `transcribe:t43:${at}`,
      accounts: { accountFor: payingAccount({ answer: account }) },
      useCheck: async () => limit,
      transcribe: async (q) => { calls.transcribe.push(q); return answer(q.pages, q); } }),
  };
  return { t, calls };
}
const pdfEntry = (text, pages) => ({ format: "pdf",
  detect: (b) => (b && new TextDecoder().decode(b.slice(0, 5)) === "%PDF-" ? { format: "pdf", confidence: "certain", signals: [] } : null),
  structure: async () => ({ ok: true, text: structuredClone(text), pages, notes: [] }) });
const SCAN = i2([{ page: 0, text: "Minutes of the meeting" }, { page: 1, text: "", undetermined: [noText(1)] },
                 { page: 2, text: "", undetermined: [noText(2)] }]);
/* A plain ZIP of one stored member (no OPC map, no ODF mimetype), which the zip entry detects; it has no structure. */
function storedZip(name, data) {
  const u16 = (v) => [v & 255, (v >> 8) & 255], u32 = (v) => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  const n = [...Buffer.from(name)], b = [...Buffer.from(data)], crc = zlibCrc(Buffer.from(data));
  const local = [...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(b.length), ...u32(b.length),
                 ...u16(n.length), ...u16(0), ...n, ...b];
  const central = [...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(b.length),
                   ...u32(b.length), ...u16(n.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(0), ...n];
  const end = [...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(1), ...u16(1), ...u32(central.length), ...u32(local.length), ...u16(0)];
  return new Uint8Array([...local, ...central, ...end]);
}
const writes = (w) => JSON.stringify([w.rows(`SELECT * FROM readings`), w.rows(`SELECT * FROM capture_text`), w.rows(`SELECT * FROM reading_history`)]);

async function heldScan(text = SCAN) {
  const w = fresh();
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading: { content_type: "generic", reader_version: 1, found: false,
    entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b", text_source: null, page_count: text.pages.length }, textUnits: pageUnits(text) });
  return { w, d };
}
/* A baseline JPEG's first bytes (SOI, APP0 JFIF): the jpeg entry reads the signature and decodes nothing. */
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
                             0x00, 0x01, 0x00, 0x00, 0xff, 0xd9]);

test("R47 (T43, N862): C-51.7's translation is words.json's transcribe.refused.notdeployed, verbatim; it names no account", async () => {
  assert.equal(REEXTRACT_CHECKS.TRANSCRIBE_NOT_DEPLOYED.translation, WORD("transcribe.refused.notdeployed"));
  for (const [k, en] of Object.entries(TRANSCRIBE_WORDS)) assert.equal(en, WORD(k), `${k} is the list's word`);
  const { w, d } = await heldScan();
  const r = await w.x.pageTranscribe({ captureSha: d, ...member1 });
  assert.deepEqual([r.status, r.body.reason, r.body.check, r.body.translation], [501, "TRANSCRIBE_NOT_DEPLOYED", "C-51.7", WORD("transcribe.refused.notdeployed")]);
  assert.doesNotMatch(JSON.stringify(r.body), /apikey|signin/);
  /* the stub's false arm (T50; N1066): a transcriber answering deployable false is refused 501 beside one answering true */
  const off = await heldScan();
  off.w.x.registerTranscriber("plane", transcriber({ deployable: false }).t);
  assert.deepEqual([(await off.w.x.pageTranscribe({ captureSha: off.d, ...member1 })).status], [501]);
  /* control: the other rows keep their own words */
  assert.notEqual(REEXTRACT_CHECKS.REEXTRACT_NOT_READ.translation, WORD("transcribe.refused.notdeployed"));
});

test("R71 R103 (T43, N862; fix round 9, G126e): a written transcription's label is transcribe.label and says is transcribe.done over the pages filled, never the pages asked; with the write rolled back no says", async () => {
  const { w, d } = await heldScan();
  const tr = transcriber({ answer: () => ({ ok: true, engine: "claude-test", version: "1", pages: [{ page: 1, text: "AI text" }] }) });
  w.x.registerTranscriber("plane", tr.t);
  const r = await withEntry(pdfEntry(SCAN, 3), () => w.x.pageTranscribe({ captureSha: d, ...member1 }));
  assert.equal(r.body.transcription.written, true);
  assert.equal(r.body.transcription.label, WORD("transcribe.label"));
  assert.deepEqual(tr.calls.transcribe.map((q) => q.pages), [[1, 2]]);
  assert.equal(r.body.says, WORD("transcribe.done").replace("{pages}", "2"), "page 2 filled of pages 2 and 3 asked");
  /* negative control: a listener refuses the write, so nothing was written and nothing is said done */
  const v = await heldScan();
  v.w.x.registerTranscriber("plane", transcriber().t);
  v.w.x.onReading("content", () => { throw new Error("refused"); });
  const x = await withEntry(pdfEntry(SCAN, 3), () => v.w.x.pageTranscribe({ captureSha: v.d, ...member1 }));
  assert.deepEqual([x.body.transcription.performed, x.body.transcription.written, "says" in x.body], [true, false, false]);
});

test("R71 (T43, N862, K2689): transcribe.none only when agent-worker was asked and filled nothing, {why} the reason as answered; no page left is performed false with no says (the other unfilled reasons are T44's: t44.test.mjs)", async () => {
  const { w, d } = await heldScan();
  w.x.registerTranscriber("plane", transcriber({ answer: () => ({ ok: true, engine: "claude-test", version: "1", pages: [] }) }).t);
  const before = writes(w);
  const r = await withEntry(pdfEntry(SCAN, 3), () => w.x.pageTranscribe({ captureSha: d, ...member1 }));
  assert.deepEqual([r.status, r.body.transcription.performed, r.body.transcription.written], [200, false, false]);
  assert.equal(r.body.says, WORD("transcribe.none").replace("{pages}", "2, 3").replace("{why}", r.body.transcription.why));
  assert.equal(writes(w), before);
  const n = await heldScan(i2([{ page: 0, text: "all text" }]));
  n.w.x.registerTranscriber("plane", transcriber().t);
  const z = await withEntry(pdfEntry(i2([{ page: 0, text: "all text" }]), 1), () => n.w.x.pageTranscribe({ captureSha: n.d, ...member1 }));
  assert.deepEqual([z.body.transcription.performed, "says" in z.body], [false, false], "no page left: the AI was not asked");
});

test("R71 (T43, N853a): an account or limit refusal tier 4 relays as aiRefusal is answered as that refusal, ok false with its code, check and translation, nothing written; a declining AI stays 200 performed false (control)", async () => {
  /* the account refusal is ai-accounts' real one; the limit refusal is `ai-use`'s `useCheck` answer, which ai-use's test runs against its real code */
  // fixtures-contract: ai-use use-check
  const refusals = [await noAccount(),
                    { ok: false, reason: "AI_LIMIT_REACHED", code: "AI_LIMIT_REACHED", check: "C-130.1", translation: "limit" }];
  for (const [i, refusal] of refusals.entries()) {
    const { w, d } = await heldScan();
    const tr = transcriber(i === 0 ? { account: refusal } : { limit: refusal });
    w.x.registerTranscriber("plane", tr.t);
    const before = writes(w);
    const r = await withEntry(pdfEntry(SCAN, 3), () => w.x.pageTranscribe({ captureSha: d, ...member1 }));
    assert.equal(r.body.ok, false, refusal.code);
    assert.deepEqual([r.body.code, r.body.check, r.body.translation], [refusal.code, refusal.check, refusal.translation]);
    assert.equal(r.status, 403, "a refusal that states no status is 403, never 200 (R71)");
    assert.equal("transcription" in r.body, false);
    assert.deepEqual(tr.calls.transcribe, [], "nothing sent");
    assert.equal(writes(w), before, "nothing written");
  }
  const { w, d } = await heldScan();
  w.x.registerTranscriber("plane", transcriber({ answer: () => ({ ok: false, reason: "busy" }) }).t);
  const c = await withEntry(pdfEntry(SCAN, 3), () => w.x.pageTranscribe({ captureSha: d, ...member1 }));
  assert.deepEqual([c.status, c.body.ok, c.body.transcription.performed], [200, true, false]);
});

test("R73 R71 (T43, N853b): an uploaded JPEG promoted, then a stub transcriber asked for page 0: the format read from the bytes, the reading written with container jpeg; a photo promoted before T43 (profiled undetermined, a failed reading) is transcribable with no re-read", async () => {
  for (const pre of [false, true]) {
    const w = fresh();
    bundle(w.s, "B-1");
    const d = await hold(w.evidence, JPEG);
    let reading;
    if (pre) {
      reading = { content_type: null, reader_version: null, found: false, entities: [], facts: {}, at: "2026-09-01T00:00:00Z",
                  basis: "not read as text", page_count: null };
    } else {
      const r = await w.x.read(doc({ digest: d, bytes: JPEG.length, ct: "image/jpeg", format: "jpeg", headers: [] }));
      reading = r.reading;
      assert.equal(reading.text_container, "jpeg");
      assert.equal(reading.page_count, 1);
    }
    w.prom.steps[0].project({ bundleId: "B-1", author: "member:m1", files: [{ path: "data/provenance.json", text: JSON.stringify({ documents: [
      { capture: { sha256: d }, reading, profile: { format: { format: pre ? "undetermined" : "jpeg" } } }] }) }] });
    const tr = transcriber();
    w.x.registerTranscriber("plane", tr.t);
    const out = await w.x.pageTranscribe({ captureSha: d, ...member1 });
    assert.equal(out.status, 200, pre ? "pre-T43" : "T43");
    assert.deepEqual(tr.calls.transcribe.map((q) => q.pages), [[0]]);
    assert.deepEqual([out.body.transcription.written, out.body.transcription.pages], [true, [0]]);
    assert.equal(out.body.says, WORD("transcribe.done").replace("{pages}", "1"));
    const stored = w.x.readingOf(d).reading;
    assert.equal(stored.text_container, "jpeg");
    assert.equal(stored.page_count, 1);
    assert.equal(stored.provenance.container, "jpeg");
    /* the picture's one page is the AI's, so no layer step survives the merge; any container the chain names is jpeg */
    assert.deepEqual([...new Set(stored.text_source.filter((s) => "container" in s).map((s) => s.container))].filter((c) => c !== "jpeg"), [],
                     "the chain's container");
    assert.ok(stored.text_source.some((s) => s.step === "ai_transcription"));
    assert.equal(w.one(`SELECT text FROM capture_text WHERE capture_sha=?`, d).text, "AI text of page 0");
  }
});

test("R73 (T43, N853b): a detected format with no structure (a zip) answers performed false with why naming it, nothing written or sent; a PDF scan answers as before (control)", async () => {
  const w = fresh();
  bundle(w.s, "B-1");
  const zip = storedZip("a.txt", "hello");
  const d = await hold(w.evidence, zip);
  w.x.writeReading({ bundleId: "B-1", captureSha: d, reading: { entities: [], at: "a" } });
  const tr = transcriber();
  w.x.registerTranscriber("plane", tr.t);
  const before = writes(w);
  const r = await w.x.pageTranscribe({ captureSha: d, ...member1 });
  assert.deepEqual([r.status, r.body.format, r.body.transcription.performed, r.body.transcription.written], [200, "zip", false, false]);
  assert.match(r.body.transcription.why, /"zip"/);
  assert.equal(writes(w), before);
  assert.deepEqual(tr.calls.transcribe, []);
  const s = await heldScan();
  s.w.x.registerTranscriber("plane", transcriber().t);
  const p = await withEntry(pdfEntry(SCAN, 3), () => s.w.x.pageTranscribe({ captureSha: s.d, ...member1 }));
  const stored = s.w.x.readingOf(s.d).reading;
  assert.deepEqual([p.status, p.body.transcription.written, stored.text_container, stored.provenance.container], [200, true, "pdf", "pdf"]);
});

test("R27 (T43, N862): readingFor carries unread_pages, the pages holding no glyph after every tier, ascending, and unread_says when any; [] with no says when none; absent with no pages; withheld with the bundle", async () => {
  const w = fresh();
  bundle(w.s, "PROJ-1", { type: "project" });
  const unit = (p, text) => ({ extent: { kind: "pdf-page", page: p, rect: null }, text, seq: p });
  const r3 = { entities: [], at: "a", page_count: 3 };
  const S = { some: "1".repeat(64), all: "2".repeat(64), none: "3".repeat(64), nopages: "4".repeat(64) };
  w.x.writeReading({ bundleId: "PROJ-1", captureSha: S.some, reading: r3, textUnits: [unit(1, "words")] });
  w.x.writeReading({ bundleId: "PROJ-1", captureSha: S.all, reading: r3, textUnits: [0, 1, 2].map((p) => unit(p, "w")) });
  w.x.writeReading({ bundleId: "PROJ-1", captureSha: S.none, reading: r3, textUnits: [] });
  w.x.writeReading({ bundleId: "PROJ-1", captureSha: S.nopages, reading: { entities: [], at: "a" } });
  const some = w.x.readingFor(S.some, "class:admin");
  assert.deepEqual(some.unread_pages, [0, 2]);
  assert.equal(some.unread_says, WORD("document.unread.pages").replace("{pages}", "1, 3"));
  assert.deepEqual(w.x.readingFor(S.none, "class:admin").unread_pages, [0, 1, 2]);
  const all = w.x.readingFor(S.all, "class:admin");
  assert.deepEqual([all.unread_pages, "unread_says" in all], [[], false]);
  const np = w.x.readingFor(S.nopages, "class:admin");
  assert.deepEqual(["unread_pages" in np, "unread_says" in np], [false, false]);
  const hidden = w.x.readingFor(S.some, "member:outsider");
  assert.deepEqual([hidden.bundle_id, "unread_pages" in hidden, "unread_says" in hidden], [null, false, false]);
});
