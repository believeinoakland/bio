/* extraction, T46-8 at the module's interface: N897 (2) (R74, a transcription on the test-instance exception records the
   label the plane hands in, kept by every later reading over it) and N886 (R75, agent-worker R72's five refusals the worker answers answered
   as refusals with DEC-193's reasons), each with a negative control (K874). Words are read by key from `words.json`
   (`./words.mjs`); a key the list lacks fails the test. The transcriber is a stub of the composition root's (plane R36's
   shape); the label is run-rules R29's `untestedLabel("transcribe")` shape, restated as data (no edge to run-rules,
   K2872). Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, member, withEntry, i2, noText, ocrAnswer, pageUnits, pressThenPass, payingAccount } from "./fixture.mjs";
import { TRANSCRIBE_WORDS } from "../../../src/extraction/index.mjs";
import { WORD } from "./words.mjs";

const member1 = { cls: "member", session: true, caps: ["contribute"], viewer: "class:admin", by: "member:m1" };
const LABEL = Object.freeze({ kind: "untested", part: "transcribe", set: "civicsmith", set_version: 1, words: "ai.label.untested" });
const writes = (w) => JSON.stringify([w.rows(`SELECT * FROM readings`), w.rows(`SELECT * FROM capture_text`), w.rows(`SELECT * FROM reading_history`)]);

/* The composition root's transcriber, deployable; `untested` is what its `transcription` hands in for the act, and
   `answer` what its AI path answers for the pages asked. */
function transcriber({ untested, answer = (pages) => ({ ok: true, engine: "claude-test", version: "1",
                                                         pages: pages.map((p) => ({ page: p, text: `AI text of page ${p}` })) }) } = {}) {
  const calls = { transcribe: [] };
  const state = { untested, answer };
  const t = {
    deployable: () => true,
    keptAway: () => null,
    transcription: ({ member: m, project, at }) => ({ member: m, project, at, act: `transcribe:t46:${at}`,
      ...(state.untested !== undefined ? { untested: state.untested } : {}),
      accounts: { accountFor: payingAccount() },
      useCheck: async () => null,
      transcribe: async (q) => { calls.transcribe.push(q); return state.answer(q.pages, q); } }),
  };
  return { t, calls, state };
}
const pdfEntry = (text, pages) => ({ format: "pdf",
  detect: (b) => (b && new TextDecoder().decode(b.slice(0, 5)) === "%PDF-" ? { format: "pdf", confidence: "certain", signals: [] } : null),
  structure: async () => ({ ok: true, text: structuredClone(text), pages, notes: [] }) });
const SCAN = i2([{ page: 0, text: "Minutes of the meeting" }, { page: 1, text: "", undetermined: [noText(1)] },
                 { page: 2, text: "", undetermined: [noText(2)] }]);

/* A three-page scan stored in project PROJ-1 and read once, its transcriber registered. */
async function heldScan(opts) {
  const w = fresh();
  bundle(w.s, "PROJ-1", { type: "project" });
  const d = await hold(w.evidence, "%PDF-1.7 " + Math.random());
  w.x.writeReading({ bundleId: "PROJ-1", captureSha: d, profileFormat: "pdf", reading: { content_type: "generic", reader_version: 1,
    found: false, entities: [], facts: {}, at: "2026-09-01T00:00:00Z", basis: "b", text_source: null, page_count: 3 }, textUnits: pageUnits(SCAN) });
  const tr = transcriber(opts);
  w.x.registerTranscriber("plane", tr.t);
  const run = (env) => withEntry(pdfEntry(SCAN, 3), () => w.x.pageTranscribe({ captureSha: d, ...member1, ...(env ? { env } : {}) }));
  return { w, d, tr, run };
}

/* ---- R74: the test-instance label ---- */

test("R74 (T46; N897 (2)): a transcriber answering the label writes a reading whose untested equals it exactly, answered by readingFor and readingOf to every reader of that reading, the bundle withheld from one who may not see it; the answer's transcription carries it", async () => {
  const { w, d, run } = await heldScan({ untested: LABEL });
  const r = await run();
  assert.deepEqual([r.status, r.body.transcription.written], [200, true]);
  assert.deepEqual(r.body.transcription.untested, LABEL);
  assert.deepEqual(w.x.readingOf(d).reading.untested, LABEL, "R30");
  assert.deepEqual(w.x.readingFor(d, "class:admin").reading.untested, LABEL, "R27");
  const hidden = w.x.readingFor(d, "member:outsider");
  assert.deepEqual([hidden.bundle_id, hidden.reading.untested], [null, LABEL], "R27: the bundle withheld, the label with the reading");
  assert.deepEqual(JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, d).reading).untested, LABEL, "recorded at the act");
});

test("R74 R45 (control): a transcriber answering no label, or null, writes no untested: absent, never null; the answer's transcription carries none", async () => {
  for (const untested of [undefined, null]) {
    const { w, d, run } = await heldScan({ untested });
    const r = await run();
    assert.equal(r.body.transcription.written, true);
    assert.equal("untested" in r.body.transcription, false, String(untested));
    assert.equal("untested" in w.x.readingOf(d).reading, false, String(untested));
    assert.equal("untested" in w.x.readingFor(d).reading, false, String(untested));
  }
});

test("R74: a later unlabelled transcription of the remaining pages keeps the earlier label unchanged, and a later act's own label is answered in its transcription only; a re-read (R34) keeps it too", async () => {
  const { w, d, tr, run } = await heldScan({ untested: LABEL,
    answer: () => ({ ok: true, engine: "claude-test", version: "1", pages: [{ page: 1, text: "AI text of page 1" }] }) });
  assert.equal((await run()).body.transcription.written, true);
  /* second act: the bar now held, no label; only page 2 is left */
  tr.state.untested = undefined;
  tr.state.answer = (pages) => ({ ok: true, engine: "claude-test", version: "2", pages: pages.map((p) => ({ page: p, text: `AI text of page ${p}` })) });
  const b = await run();
  assert.deepEqual([b.body.transcription.written, b.body.transcription.pages], [true, [2]]);
  assert.equal("untested" in b.body.transcription, false, "this act carried none");
  assert.deepEqual(w.x.readingOf(d).reading.untested, LABEL, "no later bar removes it");
  /* a later act under another label: the stored one stays, the act's own is answered beside it */
  const other = { ...LABEL, set: "t-set", set_version: 2 };
  w.x.writeReading({ bundleId: "PROJ-1", captureSha: d, reading: { ...w.x.readingOf(d).reading, text_source: null } });
  w.rows(`DELETE FROM capture_text WHERE capture_sha=? AND seq=2`, d);
  tr.state.untested = other;
  const c = await run();
  assert.equal(c.body.transcription.written, true);
  assert.deepEqual(c.body.transcription.untested, other);
  assert.deepEqual(w.x.readingOf(d).reading.untested, LABEL);
  /* R34: a re-read over the labelled reading keeps the label */
  w.rows(`DELETE FROM capture_text WHERE capture_sha=? AND seq=2`, d);
  const re = await pressThenPass(w, d, { OCR_WORKER: member(() => ocrAnswer([2])) });
  assert.equal(re.x.written, true);
  assert.deepEqual(w.x.readingOf(d).reading.untested, LABEL);
  /* control: a re-read over a reading no labelled act wrote adds none */
  const v = await heldScan({});
  const plain = await pressThenPass(v.w, v.d, { OCR_WORKER: member(() => ocrAnswer([1, 2])) });
  assert.equal(plain.x.written, true);
  assert.equal("untested" in v.w.x.readingOf(v.d).reading, false);
});

/* ---- R75: agent-worker R72's five refusals the worker answers ---- */

/* agent-worker's refusal as plane R36 relays it (its body spread, the worker's status once T46-62 relays it). */
const WORKER_EXTRA = { NO_ACCOUNT: { capability: "unavailable" }, BAD_ACCOUNT: { field: "account" } };
const workerRefusal = (code, status, extra = {}) => ({ ok: false, reason: code, code, detail: "d", worker: "agent-worker",
  ...(WORKER_EXTRA[code] || {}), ...(status ? { status } : {}), ...extra });
const FIVE = [["BAD_BODY", 400, "transcribe.reason.requestfault"], ["BAD_SHA", 400, "transcribe.reason.requestfault"],
             ["BAD_PAGES", 400, "transcribe.reason.requestfault"], ["NO_ACCOUNT", 409, "transcribe.reason.noaccount"],
             ["BAD_ACCOUNT", 400, "transcribe.reason.badaccount"]];

test("R75 (T46; N886; DEC-193): each of agent-worker R72's five codes answered after the post is that refusal: its code as answered, the worker's status (a refusal's status when none is relayed), DEC-193's reason by key as its translation, says transcribe.refused filled with it, no check of its own, nothing written", async () => {
  for (const [code, status, key] of FIVE)
    for (const relayed of [status, null]) {
      // fixtures-contract: agent-worker transcribe-refusal
      const { w, tr, run } = await heldScan({ answer: () => workerRefusal(code, relayed) });
      const before = writes(w);
      const r = await run();
      assert.deepEqual(tr.calls.transcribe.map((q) => q.pages), [[1, 2]], `${code}: sent`);
      assert.equal(r.body.ok, false, code);
      assert.equal(r.status, relayed ?? 403, `${code}: a refusal's status`);
      assert.ok(r.status >= 400 && r.status < 500);
      assert.deepEqual([r.body.code, r.body.reason], [code, code]);
      assert.equal(r.body.translation, TRANSCRIBE_WORDS[key], `${code}: ${key}`);
      assert.equal(r.body.says, WORD("transcribe.refused").replace("{reason}", TRANSCRIBE_WORDS[key]));
      assert.equal("check" in r.body, false, "no row is minted");
      assert.equal("transcription" in r.body, false, "never 200 performed false");
      assert.equal(writes(w), before, "nothing written");
    }
});

test("R75: the reasons are words read by key: noaccount, badaccount, needsapikey and requestfault are words.json's verbatim (K2919 conformed requestfault, so no interim word remains)", () => {
  for (const key of ["transcribe.reason.noaccount", "transcribe.reason.badaccount", "transcribe.reason.needsapikey", "transcribe.reason.requestfault"])
    assert.equal(TRANSCRIBE_WORDS[key], WORD(key), key);
});

test("R75 (controls): a refusal carrying its own row's translation keeps it; another agent-worker code with no row is no refusal of the job's own, 200 performed false with no says", async () => {
  const OWN = workerRefusal("NO_ACCOUNT", 409, { check: "C-29.20", translation: "No Claude account serves you here." });
  const { run } = await heldScan({ answer: () => OWN });
  const r = await run();
  assert.equal(r.status, 409);
  assert.deepEqual(r.body, { ...OWN, says: WORD("transcribe.refused").replace("{reason}", OWN.translation) });
  /* a code outside the five, made up on purpose: it names no row of agent-worker's */
  // fixtures-generic: SOME_OTHER_CODE (invented: tests this module's handling of a code no row and none of agent-worker's five names)
  // fixtures-generic: busy (invented: an answer of no worker at all, a bare reason)
  for (const answer of [workerRefusal("SOME_OTHER_CODE", 400), { ok: false, reason: "busy" }]) {
    const v = await heldScan({ answer: () => answer });
    const x = await v.run();
    assert.deepEqual([x.status, x.body.ok, x.body.transcription.performed, x.body.transcription.written], [200, true, false, false]);
    assert.equal("says" in x.body, false, answer.reason);
  }
});
