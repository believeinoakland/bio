/* screens-intake R1–R3: the `capture` screen on the real served page (interface-shell's harness), its three tabs and six
 * acts as a member uses them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, html, text, main, btn, fill, press, ok, refused, rawKeys } from "./page.mjs";

const ADDRESS = "https://www.example.gov/reports/street-maintenance-2026.pdf";
const DOC = { capture: { sha256: "a".repeat(64), bytes: 1200, encoding: "binary" }, file: "snapshots/a.pdf", title: null };

test("R1 the address tab draws acquire and capturerequest, and monitor only once a capture landed in a bundle", async () => {
  const p = await open("/app/capture/address", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0001" }),
    promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) } });
  assert.ok(btn(p, "acquire"));
  assert.ok(btn(p, "capturerequest"));
  assert.equal(btn(p, "monitor"), null);
  assert.deepEqual(rawKeys(p), []);
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.ok(btn(p, "monitor", '[data-bundle="INFO-2026-0001-street-maintenance-2026-pdf"]'));
  /* control: bytes the record already held name no new bundle, so watching is not offered */
  const q = await open("/app/capture", { plane: { acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  assert.match(text(q), /already held exactly these bytes/);
  assert.equal(btn(q, "monitor"), null);
});

test("R1 acquire sends the address as the locator, and nothing while the address is empty", async () => {
  const p = await open("/app/capture", { plane: { acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(p, { "ci-address": `  ${ADDRESS} ` });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS }]);
  const q = await open("/app/capture");
  const r = await press(q, "acquire");
  assert.equal(q.byOp("acquire").length, 0);
  assert.match(r.slot().textContent, /Write the address first/);
});

test("R1 each of acquire's five refusals is drawn in its own sentence; any other code is the shell's (R13)", async () => {
  const seen = new Set();
  for (const code of ["BAD_LOCATOR", "SOURCE_REFUSED", "FETCH_FAILED", "EMPTY", "TOO_LARGE"]) {
    const p = await open("/app/capture", { plane: { acquire: refused(code, "the owner's words") } });
    fill(p, { "ci-address": ADDRESS });
    const r = await press(p, "acquire");
    const t = r.slot().textContent;
    assert.doesNotMatch(t, /the owner's words/, code);
    seen.add(t);
  }
  assert.equal(seen.size, 5, "five distinct sentences");
  /* control: a code outside the five is drawn by the shell's rule: the answer's translation */
  const p = await open("/app/capture", { plane: { acquire: refused("HOST_COOLING_OFF", "The site asked us to wait.") } });
  fill(p, { "ci-address": ADDRESS });
  const r = await press(p, "acquire");
  assert.match(r.slot().textContent, /The site asked us to wait\./);
});

test("R1 (N747) an answer carrying promoted is not promoted again by the screen", async () => {
  const p = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC, promoted: [{ sha256: "b".repeat(64), bundleId: "INFO-2026-0002" }],
    not_promoted: [{ sha256: "c".repeat(64), code: "X" }] }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.equal(p.byOp("allocid").length, 0);
  assert.equal(p.byOp("promote").length, 0);
  assert.match(text(p), /Captured an archive: 1 of its files were filed/);
  assert.match(text(p), /1 of its files could not be filed/);
});

test("R1 (N747) an answer without promoted is promoted by the screen as an information bundle at collected", async () => {
  const p = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0007" }),
    promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.deepEqual(p.byOp("allocid")[0].query, { op: "allocid", prefix: "INFO", year: String(new Date().getUTCFullYear()) });
  const b = p.byOp("promote")[0].body;
  assert.equal(b.bundleId, "INFO-2026-0007-street-maintenance-2026-pdf");
  assert.equal(b.base, null);
  assert.equal(b.meta.object_type, "information");
  assert.equal(b.meta.current_state, "collected");
  const md = b.files.find((f) => f.path === "bundle.md");
  assert.match(md.text, /^schema: information@2$/m);
  assert.match(md.text, /^current_state: collected$/m);
  assert.match(md.text, new RegExp(`^content_hash: sha256:${"a".repeat(64)}$`, "m"));
  assert.match(md.text, /^## Summary$/m);
  assert.equal(md.bytes, Buffer.byteLength(md.text, "utf8"));
  const { createHash } = await import("node:crypto");
  assert.equal(md.sha256, createHash("sha256").update(md.text, "utf8").digest("hex"), "cs.digest over the UTF-8 bytes");
  assert.ok(b.files.some((f) => f.path === "data/provenance.json"));
  assert.deepEqual(b.register, [{ sha256: "a".repeat(64), path: "snapshots/a.pdf", encoding: "binary", bytes: 1200 }]);
  assert.match(text(p), /Captured: street-maintenance-2026\.pdf\. It waits in Held captures/);
  /* control: a refused promote is drawn on the tab with the owner's words */
  const q = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0008" }),
    promote: refused("GATE_REFUSED", "The checks refused it.") } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  await q.settle();
  assert.match(text(q), /The checks refused it\./);
  assert.doesNotMatch(text(q), /It waits in Held captures/);
});

test("R1 capturerequest sends the address; monitor sends the captured bundle", async () => {
  const p = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0001" }),
    promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "capturerequest");
  assert.deepEqual(p.byOp("capturerequest")[0].body, { address: ADDRESS });
  assert.match(text(p), /Asked for later/);
  await press(p, "acquire");
  await press(p, "monitor");
  assert.deepEqual(p.byOp("monitor")[0].body, { bundleId: "INFO-2026-0001-street-maintenance-2026-pdf" });
  assert.match(text(p), /Watching street-maintenance-2026\.pdf for changes/);
  /* its refusals by the shell (N969: NOT_MONITORED on a bundle the screen writes) */
  const q = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0001" }),
    promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }), monitor: refused("NOT_MONITORED", "This document is not set to be watched.") } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  const r = await press(q, "monitor");
  assert.match(r.slot().textContent, /not set to be watched/);
});

test("R2 the file tab: accept and capture attributes, four choices none preselected, the downloaded offer, the photo reminder", async () => {
  const p = await open("/app/capture/file");
  const f = p.doc.getElementById("ci-file");
  assert.equal(f.getAttribute("type"), "file");
  assert.match(f.getAttribute("accept"), /image\/\*/);
  assert.equal(f.getAttribute("capture"), "environment");
  const radios = main(p).querySelectorAll('input[type="radio"]');
  assert.equal(radios.length, 4);
  assert.ok(radios.every((r) => !r.checked), "none preselected");
  assert.match(html(p), /Downloaded from a website\?[^<]*<a href="\/app\/capture\/address" data-nav>/);
  assert.match(text(p), /Frame what you are checking/, "photo.reminder by its key");
  assert.match(btn(p, "captureupload").textContent, /Capture a file or photo/);
  assert.deepEqual(rawKeys(p), []);
});


const FILE = new File(["ÿØ photo bytes"], "Seminary Ave.jpg", { type: "image/jpeg" });
const filled = { "ci-file": FILE, "ci-how-made": true, "ci-where": "6012 Seminary Ave, 4 October", "ci-what": "The pothole, still open." };

test("R2 the statement is composed from the three answers in order, each with its label, sent with the raw bytes", async () => {
  const p = await open("/app/capture/file", { plane: { captureupload: ok({ ok: true, document: {} }) } });
  fill(p, filled);
  await press(p, "captureupload");
  const r = p.byOp("captureupload")[0];
  assert.equal(r.init.body, FILE, "the file's bytes are the raw body");
  assert.equal(r.headers["content-type"], undefined, "no JSON content type");
  assert.equal(r.query.name, "Seminary Ave.jpg");
  assert.equal(r.query.statement, "How you got it: I made it myself: a photo, a recording, my notes\n"
    + "Where and when: 6012 Seminary Ave, 4 October\nWhat it shows, in your own words: The pothole, still open.");
  assert.match(r.headers.Authorization, /^Bearer /);
});

test("R2 nothing is sent while a file or any answer is missing, saying which, or over 2,000 characters", async () => {
  const cases = [[{ ...filled, "ci-file": null }, /Choose a file or take a photo first/],
                 [{ "ci-file": FILE }, /say: How you got it, Where and when, What it shows, in your own words\./],
                 [{ ...filled, "ci-where": "" }, /say: Where and when\./],
                 [{ ...filled, "ci-what": "x".repeat(2000) }, /the limit is 2,000/]];
  for (const [values, words] of cases) {
    const p = await open("/app/capture/file");
    fill(p, values);
    const r = await press(p, "captureupload");
    assert.equal(p.byOp("captureupload").length, 0);
    assert.match(r.slot().textContent, words);
  }
  /* control: at the bound it is sent */
  const head = "How you got it: I made it myself: a photo, a recording, my notes\nWhere and when: 6012 Seminary Ave, 4 October\nWhat it shows, in your own words: ";
  const p = await open("/app/capture/file", { plane: { captureupload: ok({ ok: true }) } });
  fill(p, { ...filled, "ci-what": "x".repeat(2000 - head.length) });
  await press(p, "captureupload");
  assert.equal([...p.byOp("captureupload")[0].query.statement].length, 2000);
});

test("R2 the answer: existed says the record already held the bytes; otherwise it waits in Held captures", async () => {
  const p = await open("/app/capture/file", { plane: { captureupload: ok({ ok: true, existed: true }) } });
  fill(p, filled);
  await press(p, "captureupload");
  assert.match(text(p), /already held exactly this file/);
  const q = await open("/app/capture/file", { plane: { captureupload: ok({ ok: true, document: {} }) } });
  fill(q, filled);
  await press(q, "captureupload");
  assert.match(text(q), /Captured: Seminary Ave\.jpg\. It waits in Held captures/);
});

test("R2 UPLOAD_NO_STATEMENT, EMPTY, TOO_LARGE and MEMBER_SESSION_REQUIRED are each drawn in its own sentence", async () => {
  const texts = new Set();
  for (const code of ["UPLOAD_NO_STATEMENT", "EMPTY", "TOO_LARGE", "MEMBER_SESSION_REQUIRED"]) {
    const p = await open("/app/capture/file", { plane: { captureupload: refused(code, "the owner's words") } });
    fill(p, filled);
    const r = await press(p, "captureupload");
    assert.doesNotMatch(r.slot().textContent, /the owner's words/, code);
    texts.add(r.slot().textContent);
  }
  assert.equal(texts.size, 4);
  /* control: another code is the shell's */
  const p = await open("/app/capture/file", { plane: { captureupload: refused("REQUIRED_ARGUMENT_MISSING", "A name over 300 characters.") } });
  fill(p, filled);
  assert.match((await press(p, "captureupload")).slot().textContent, /A name over 300 characters\./);
});

test("R3 testify sends the member's words with where, and when as observedAt; never a time after now", async () => {
  const p = await open("/app/capture/saw", { plane: { testify: ok({ ok: true, id: "INFO-2026-0009-observation" }) } });
  fill(p, { "ci-words": "The pothole is still open.", "ci-where": "6012 Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(p, "testify");
  assert.deepEqual(p.byOp("testify")[0].body, { words: "The pothole is still open.\n\nWhere: 6012 Seminary Ave", observedAt: "2026-10-04T09:10:00Z" });
  assert.match(text(p), /Recorded as your testimony: INFO-2026-0009-observation/);
  const q = await open("/app/capture/saw");
  fill(q, { "ci-words": "x", "ci-where": "y", "ci-when": "2999-01-01T00:00:00Z" });
  assert.match((await press(q, "testify")).slot().textContent, /no later than now/);
  fill(q, { "ci-words": "x", "ci-where": "", "ci-when": "" });
  assert.match((await press(q, "testify")).slot().textContent, /say: Where, When\./);
  assert.equal(q.byOp("testify").length, 0);
});

test("R3 writinghelp is drawn under the words only while the assistant is reachable, told only what the member typed", async () => {
  const off = await open("/app/capture/saw");
  assert.equal(btn(off, "writinghelp"), null);
  const p = await open("/app/capture/saw", { reachable: true, plane: { writinghelp: ok({ ok: true, text: "The pothole is still open, about 60 cm across." }) } });
  const h = html(p);
  assert.ok(h.indexOf('data-act="writinghelp"') > h.indexOf('id="ci-words"'), "under the words field");
  assert.ok(h.indexOf('data-act="writinghelp"') < h.indexOf('id="ci-where"'));
  fill(p, { "ci-words": "pothole still open 60cm" });
  await press(p, "writinghelp");
  assert.deepEqual(p.byOp("writinghelp")[0].body, { op: "testify", field: "words", told: "pothole still open 60cm" });
  assert.equal(p.doc.getElementById("ci-words"), null, "the draft is drawn into a new field");
  assert.equal(main(p).querySelector("textarea.rec").textContent, "The pothole is still open, about 60 cm across.");
  assert.match(text(p), /Draft by the assistant, at your request/);
  /* the member's own act then sends the draft as edited */
  const id = main(p).querySelector("textarea.rec").id;
  fill(p, { [id]: "The pothole is still open.", "ci-where": "Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(p, "testify");
  assert.match(p.byOp("testify")[0].body.words, /^The pothole is still open\./);
  /* control: nothing typed, nothing asked */
  const q = await open("/app/capture/saw", { reachable: true });
  await press(q, "writinghelp");
  assert.equal(q.byOp("writinghelp").length, 0);
});

test("R3 (K2816 (2)) a writing-help draft carries the test-instance label exactly when its answer carries untested", async () => {
  for (const [answer, labelled] of [[{ ok: true, text: "X.", untested: true }, true], [{ ok: true, text: "X.", label: "untested" }, true], [{ ok: true, text: "X." }, false]]) {
    const p = await open("/app/capture/saw", { reachable: true, plane: { writinghelp: ok(answer) } });
    fill(p, { "ci-words": "x" });
    await press(p, "writinghelp");
    assert.equal(!!main(p).querySelector('[data-label="untested"]'), labelled, JSON.stringify(answer));
    if (labelled) assert.match(text(p), /Not yet tested: this part of the assistant/);
  }
});
