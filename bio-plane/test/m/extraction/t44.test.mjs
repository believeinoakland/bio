/* extraction, T44-5 at the module's interface: N869 and N876 (DEC-191 (4), (5), DEC-192 (1), (2), (6); K2713, K2719):
   R71's `says`, read by key for every way nothing was filled (nothing sent, a photo not prepared, sent with no reading
   back, a refusal), and R27's `capture.picture.unread` for a picture's one unread page, each with a negative control
   (K874). Words are read by key from `words.json` (`./words.mjs`); a key the list lacks fails the test. The
   transcriber is a stub of the composition root's (plane R36's shape), its `refused` built as plane R36 states it.
   Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, withEntry, i2, noText, pageUnits, payingAccount } from "./fixture.mjs";
import { WORD } from "./words.mjs";
import { noAccount, keptAwayProject } from "../ai-accounts/fixtures.mjs";

const member1 = { cls: "member", session: true, caps: ["contribute"], viewer: "class:admin", by: "member:m1" };
const writes = (w) => JSON.stringify([w.rows(`SELECT * FROM readings`), w.rows(`SELECT * FROM capture_text`), w.rows(`SELECT * FROM reading_history`)]);
const fill = (key, f = {}) => Object.entries(f).reduce((s, [k, v]) => s.replace(`{${k}}`, v), WORD(key));

/* R27: a reading of `pages` pages written with `format`, its page units the `read` pages. */
function readingWith(w, captureSha, { format, container = format, pages = 1, read = [] }) {
  const unit = (p) => ({ extent: { kind: "pdf-page", page: p, rect: null }, text: `words of page ${p}`, seq: p });
  w.x.writeReading({ bundleId: "PROJ-1", captureSha, profileFormat: format, textUnits: read.map(unit),
    reading: { entities: [], at: "a", page_count: pages, text_container: container } });
  return w.x.readingFor(captureSha, "class:admin");
}

test("R27 (T44; N869, N876; DEC-191 (5), DEC-192 (6)): a jpeg or png reading with its one page unread says capture.picture.unread, by key, in place of document.unread.pages; a PDF's one unread page, a read picture and a hidden bundle are the controls", () => {
  const w = fresh();
  bundle(w.s, "PROJ-1", { type: "project" });
  for (const [i, format] of ["jpeg", "png"].entries()) {
    const r = readingWith(w, String(i + 1).repeat(64), { format });
    assert.deepEqual([r.unread_pages, r.unread_says], [[0], WORD("capture.picture.unread")], format);
  }
  /* a photo profiled before its entry was registered: the reading's own container names the picture */
  const old = readingWith(w, "3".repeat(64), { format: "undetermined", container: "jpeg" });
  assert.deepEqual([old.unread_pages, old.unread_says], [[0], WORD("capture.picture.unread")]);
  /* controls: a PDF's one unread page keeps document.unread.pages; a read picture says nothing; a hidden one withholds */
  const pdf = readingWith(w, "4".repeat(64), { format: "pdf" });
  assert.deepEqual([pdf.unread_pages, pdf.unread_says], [[0], fill("document.unread.pages", { pages: "1" })]);
  assert.notEqual(pdf.unread_says, WORD("capture.picture.unread"));
  const read = readingWith(w, "5".repeat(64), { format: "jpeg", read: [0] });
  assert.deepEqual([read.unread_pages, "unread_says" in read], [[], false]);
  const many = readingWith(w, "6".repeat(64), { format: "pdf", container: "pdf", pages: 3, read: [1] });
  assert.equal(many.unread_says, fill("document.unread.pages", { pages: "1, 3" }));
  const hidden = w.x.readingFor("1".repeat(64), "member:outsider");
  assert.deepEqual(["unread_pages" in hidden, "unread_says" in hidden], [false, false]);
});

/* ---- R71: `says` by key when nothing was filled ---- */

/* The composition root's transcriber, deployable, its AI path answering `answer` (plane R36's shapes). */
function transcriber({ answer, account = null, limit = null, away = null }) {
  const calls = { transcribe: [] };
  const t = {
    deployable: () => true,
    keptAway: () => away,
    transcription: ({ member, project, at }) => ({ member, project, at, act: `transcribe:t44:${at}`,
      accounts: { accountFor: payingAccount({ answer: account }) },
      useCheck: async () => limit,
      transcribe: async (q) => { calls.transcribe.push(q); return typeof answer === "function" ? answer(q) : answer; } }),
  };
  return { t, calls };
}
const pdfEntry = (text, pages) => ({ format: "pdf",
  detect: (b) => (b && new TextDecoder().decode(b.slice(0, 5)) === "%PDF-" ? { format: "pdf", confidence: "certain", signals: [] } : null),
  structure: async () => ({ ok: true, text: structuredClone(text), pages, notes: [] }) });
const SCAN = i2([{ page: 0, text: "Minutes of the meeting" }, { page: 1, text: "", undetermined: [noText(1)] },
                 { page: 2, text: "", undetermined: [noText(2)] }]);
/* A baseline JPEG's first bytes (SOI, APP0 JFIF): the jpeg entry reads the signature and decodes nothing. */
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
                             0x00, 0x01, 0x00, 0x00, 0xff, 0xd9]);

/* Runs one act over a stored three-page scan (or, with `photo`, an uploaded JPEG's one page) and answers what came back,
   whether anything was written, and what the AI path was asked. */
async function act(opts, { photo = false } = {}) {
  const w = fresh();
  bundle(w.s, "B-1");
  const d = await hold(w.evidence, photo ? JPEG : "%PDF-1.7 " + Math.random());
  w.x.writeReading({ bundleId: "B-1", captureSha: d, profileFormat: photo ? "jpeg" : "pdf", reading: { content_type: "generic",
    reader_version: 1, found: false, entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b", text_source: null,
    page_count: photo ? 1 : 3, text_container: photo ? "jpeg" : "pdf" }, textUnits: photo ? null : pageUnits(SCAN) });
  const tr = transcriber(opts);
  w.x.registerTranscriber("plane", tr.t);
  const before = writes(w);
  const run = () => w.x.pageTranscribe({ captureSha: d, ...member1 });
  const r = photo ? await run() : await withEntry(pdfEntry(SCAN, 3), run);
  return { r, written: writes(w) !== before, asked: tr.calls.transcribe.map((q) => q.pages) };
}
const unfilled = (r) => [r.status, r.body.ok, r.body.transcription.performed, r.body.transcription.written];

test("R71 (T44; N869; DEC-191 (4)): nothing sent (AGENT_WORKER_UNBOUND, EVIDENCE_ABSENT, NO_PAGE_RENDERED) stays 200 performed false, nothing written, and says transcribe.notsent with {why} from transcribe.why.*, by key; control: a post agent-worker answered ok filling nothing says transcribe.none", async () => {
  for (const [reason, why] of [["AGENT_WORKER_UNBOUND", "transcribe.why.unbound"], ["EVIDENCE_ABSENT", "transcribe.why.evidenceabsent"],
                               ["NO_PAGE_RENDERED", "transcribe.why.norender"]]) {
    // fixtures-contract: agent-worker transcribe-not-sent
    const { r, written, asked } = await act({ answer: { ok: false, reason } });
    assert.deepEqual(asked, [[1, 2]], reason);
    assert.deepEqual(unfilled(r), [200, true, false, false], reason);
    assert.match(r.body.transcription.why, new RegExp(reason));
    assert.equal(r.body.says, fill("transcribe.notsent", { why: WORD(why) }), reason);
    assert.equal(written, false);
  }
  const none = (await act({ answer: { ok: true, engine: "claude-test", version: "1", pages: [] } })).r;
  assert.equal(none.body.says, fill("transcribe.none", { pages: "2, 3", why: none.body.transcription.why }));
  assert.doesNotMatch(none.body.says, /^Nothing was sent/);
});

test("R71 (T44; N869; DEC-191 (5)): a photo whose page plane R36's refused names IMAGE_TOO_LARGE, or UNSUPPORTED_JPEG_PROCESS in a progressive process, says transcribe.picture.unprepared with its transcribe.picture.why.*; any other refusal of a picture's page, NO_PAGE_RENDERED without refused, and a PDF's page too large say transcribe.notsent with transcribe.why.norender", async () => {
  const refusedAs = (...refused) => ({ answer: { ok: false, reason: "NO_PAGE_RENDERED", ...(refused.length ? { refused } : {}) } });
  const unprepared = (why) => fill("transcribe.picture.unprepared", { why: WORD(why) });
  const norender = fill("transcribe.notsent", { why: WORD("transcribe.why.norender") });
  for (const [opts, says] of [
    [refusedAs({ page: 0, reason: "IMAGE_TOO_LARGE" }), unprepared("transcribe.picture.why.toolarge")],
    [refusedAs({ page: 0, reason: "UNSUPPORTED_JPEG_PROCESS", process: "progressive-huffman" }), unprepared("transcribe.picture.why.progressive")],
    [refusedAs({ page: 0, reason: "UNSUPPORTED_JPEG_PROCESS", process: "differential-progressive-arithmetic" }), unprepared("transcribe.picture.why.progressive")],
    /* controls: no own words for these */
    [refusedAs({ page: 0, reason: "DECODE_FAILED" }), norender],
    [refusedAs({ page: 0, reason: "UNSUPPORTED_JPEG_PROCESS", process: "lossless-huffman" }), norender],
    [refusedAs({ page: 0, reason: "UNSUPPORTED_JPEG_PROCESS" }), norender],
    [refusedAs(), norender],
  ]) {
    const { r, written, asked } = await act(opts, { photo: true });
    assert.deepEqual(asked, [[0]]);
    assert.deepEqual(unfilled(r), [200, true, false, false]);
    assert.equal(r.body.says, says, JSON.stringify(opts.answer.refused));
    assert.equal(written, false);
  }
  /* control: a PDF's page refused as too large is no photo */
  const pdf = (await act(refusedAs({ page: 1, reason: "IMAGE_TOO_LARGE" }, { page: 2, reason: "IMAGE_TOO_LARGE" }))).r;
  assert.equal(pdf.body.says, norender);
});

test("R71 (T44; N876; DEC-192 (2)): sent and nothing back: AGENT_WORKER_SILENT says transcribe.failed with transcribe.why.silent; agent-worker R74's ending (MODEL_SILENT, MODEL_REFUSED) transcribe.failed with transcribe.why.ended; 200 performed false, nothing written; never transcribe.none", async () => {
  for (const [answer, why] of [
    [{ ok: false, reason: "AGENT_WORKER_SILENT" }, "transcribe.why.silent"],
    [{ ok: false, reason: "MODEL_SILENT", code: "MODEL_SILENT", ending: "silent", detail: "d", worker: "agent-worker", status: 502, usage: {} }, "transcribe.why.ended"],
    [{ ok: false, reason: "MODEL_REFUSED", code: "MODEL_REFUSED", ending: "refused", detail: "d", worker: "agent-worker", status: 502,
       model_error: "overloaded_error", model_status: 529 }, "transcribe.why.ended"],
  ]) {
    const { r, written } = await act({ answer });
    assert.deepEqual(unfilled(r), [200, true, false, false], answer.reason);
    assert.equal(r.body.says, fill("transcribe.failed", { why: WORD(why) }), answer.reason);
    assert.doesNotMatch(r.body.says, /found no words/);
    assert.equal(written, false);
  }
});

test("R71 (T44; N869, N876; DEC-192 (1); K2713): a refusal (tier 4's aiRefusal, the keep-away refusal, agent-worker's after the post with its row) keeps its envelope, ok false with its code, check, translation and a refusal's status, nothing written, and gains says transcribe.refused with {reason} its translation exactly as relayed, its placeholders left for the screen; controls: agent-worker's refusal with no row (BAD_PAGES) says nothing of this module's own, and a declining AI with no row is 200 performed false", async () => {
  const NO_ACCOUNT = await noAccount();
  const KEPT = (await keptAwayProject({ project: "P", use: "transcribe" })).aiKeptAway;
  /* agent-worker's refusal after the post, one of its five codes carrying its own row's translation (R72, R75) */
  const WORKER = { ok: false, reason: "BAD_PAGES", code: "BAD_PAGES", check: "C-1.1", translation: "A refusal of {who}.", worker: "agent-worker" };
  for (const [opts, refusal, sent] of [[{ account: NO_ACCOUNT, answer: null }, NO_ACCOUNT, false], [{ away: KEPT, answer: null }, KEPT, false],
                                       [{ answer: WORKER }, WORKER, true]]) {
    const { r, written, asked } = await act(opts);
    assert.equal(r.body.ok, false, refusal.code);
    assert.equal(r.status, 403, "a refusal that states no status is 403, never 200 (R71)");
    assert.deepEqual(r.body, { ...refusal, says: WORD("transcribe.refused").replace("{reason}", refusal.translation) });
    assert.equal("transcription" in r.body, false);
    assert.deepEqual(asked.length > 0, sent);
    assert.equal(written, false);
  }
  assert.equal((await act({ away: KEPT, answer: null })).r.body.says, WORD("transcribe.refused").replace("{reason}", KEPT.translation), "placeholders kept");
  /* (T46) BAD_PAGES is one of agent-worker R72's five codes, answered with DEC-193's reason (R75: t46.test.mjs) */
  /* a code outside the five, made up on purpose: it names no row of agent-worker's, and the answer for it is not this module's own sentence */
  // fixtures-generic: SOME_OTHER_CODE (invented: tests this module's handling of a code no row and none of agent-worker's five names)
  // fixtures-generic: busy (invented: an answer of no worker at all, a bare reason)
  for (const answer of [{ ok: false, reason: "SOME_OTHER_CODE", code: "SOME_OTHER_CODE", detail: "d", worker: "agent-worker" }, { ok: false, reason: "busy" }]) {
    const { r, written } = await act({ answer });
    assert.deepEqual(unfilled(r), [200, true, false, false], answer.reason);
    assert.equal("says" in r.body, false, `${answer.reason}: no row, no sentence`);
    assert.equal(written, false);
  }
});
