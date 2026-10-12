/* screens-intake R1–R3: the `capture` screen, its three tabs and six acts, at its interface (render, send, done), over
 * the stand-in kit. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { pageScreen, kit, viewOf, press } from "./kit.mjs";

const S = pageScreen(SCREENS.find((s) => s.id === "capture"));
const draw = (view, opts) => S.render(kit(S, view, opts).cs, view);
const ADDRESS = "https://www.example.gov/reports/street-maintenance-2026.pdf";
const DOC = { capture: { sha256: "a".repeat(64), bytes: 1200, encoding: "binary" }, file: "snapshots/a.pdf", title: null };

test("R1 the address tab draws acquire and capturerequest, and monitor only once a capture landed in a bundle", () => {
  const html = draw(viewOf(S, { subject: "address" }));
  assert.match(html, /data-act="acquire"/);
  assert.match(html, /data-act="capturerequest"/);
  assert.doesNotMatch(html, /data-act="monitor"/);
  const after = draw(viewOf(S, { subject: "address", ui: { captured: { title: "Report", bundleId: "INFO-2026-0001-report" } } }));
  assert.match(after, /data-act="monitor" data-bundle="INFO-2026-0001-report"/);
  /* control: a capture the record already held names no new bundle, so watching is not offered on it */
  assert.doesNotMatch(draw(viewOf(S, { subject: "address", ui: { captured: { existed: true, title: "Report" } } })), /data-act="monitor"/);
});

test("R1 acquire sends the address as the locator, and nothing while the address is empty", async () => {
  const v = viewOf(S, { subject: "address" });
  const r = await press(S, v, "acquire", { values: { "ci-address": `  ${ADDRESS} ` }, answers: { acquire: { ok: true, existed: true, document: DOC } } });
  assert.deepEqual(r.request.body, { locator: ADDRESS });
  const empty = await press(S, viewOf(S), "acquire", { values: { "ci-address": " " } });
  assert.equal(empty.sent, false);
  assert.equal(empty.refused.key, "screen.capture.address.empty");
});

test("R1 each of acquire's five refusals is drawn in its own sentence; any other code is the shell's (R13)", async () => {
  const seen = new Set();
  for (const code of ["BAD_LOCATOR", "SOURCE_REFUSED", "FETCH_FAILED", "EMPTY", "TOO_LARGE"]) {
    const r = await press(S, viewOf(S), "acquire", { values: { "ci-address": ADDRESS }, answers: { acquire: { ok: false, reason: code } } });
    assert.equal(r.refused.key, `screen.capture.refusal.${code}`);
    seen.add(r.refused.text);
  }
  assert.equal(seen.size, 5, "five distinct sentences");
  /* control: a code outside the five is left to interface-shell R13 (the answer as given) */
  const other = await press(S, viewOf(S), "acquire", { values: { "ci-address": ADDRESS }, answers: { acquire: { ok: false, reason: "HOST_COOLING_OFF" } } });
  assert.equal(other.refused.answer.reason, "HOST_COOLING_OFF");
});

test("R1 (N747) an answer carrying promoted is not promoted again by the screen", async () => {
  const v = viewOf(S, { subject: "address" });
  const r = await press(S, v, "acquire", { values: { "ci-address": ADDRESS },
    answers: { acquire: { ok: true, document: DOC, promoted: [{ sha256: "b".repeat(64), bundleId: "INFO-2026-0002" }], not_promoted: [{ sha256: "c".repeat(64), code: "X" }] } } });
  assert.deepEqual(r.kit.requests.map((q) => q.op), ["acquire"], "no allocid, no promote");
  assert.deepEqual(v.ui.captured, { archive: true, filed: 1, notPromoted: 1, title: "street-maintenance-2026.pdf" });
  const html = draw(v);
  assert.match(html, /1 of its files could not be filed/);
});

test("R1 (N747) an answer without promoted is promoted by the screen as an information bundle at collected", async () => {
  const v = viewOf(S, { subject: "address" });
  let promoted = null;
  const r = await press(S, v, "acquire", { values: { "ci-address": ADDRESS }, answers: {
    acquire: { ok: true, document: DOC },
    allocid: { ok: true, result: { ok: true, id: "INFO-2026-0007" } },
    promote: (req) => { promoted = req.body; return { ok: true, result: { ok: true, bundleId: req.body.bundleId } }; } } });
  assert.deepEqual(r.kit.requests.map((q) => q.op), ["acquire", "allocid", "promote"]);
  assert.deepEqual(r.kit.requests[1].query, { prefix: "INFO", year: "2026" });
  assert.equal(promoted.bundleId, "INFO-2026-0007-street-maintenance-2026-pdf");
  assert.equal(promoted.base, null);
  assert.equal(promoted.meta.object_type, "information");
  assert.equal(promoted.meta.current_state, "collected");
  const md = promoted.files.find((f) => f.path === "bundle.md");
  assert.match(md.text, /^schema: information@2$/m);
  assert.match(md.text, /^current_state: collected$/m);
  assert.match(md.text, new RegExp(`^content_hash: sha256:${"a".repeat(64)}$`, "m"));
  assert.match(md.text, /^## Summary$/m);
  assert.equal(md.bytes, Buffer.byteLength(md.text, "utf8"));
  assert.match(md.sha256, /^[0-9a-f]{64}$/);
  assert.ok(promoted.files.some((f) => f.path === "data/provenance.json"));
  assert.deepEqual(promoted.register, [{ sha256: "a".repeat(64), path: "snapshots/a.pdf", encoding: "binary", bytes: 1200 }]);
  assert.deepEqual(v.ui.captured, { title: "street-maintenance-2026.pdf", bundleId: "INFO-2026-0007-street-maintenance-2026-pdf" });
  /* control: bytes the record already held are not promoted */
  const held = await press(S, viewOf(S), "acquire", { values: { "ci-address": ADDRESS }, answers: { acquire: { ok: true, existed: true, document: DOC } } });
  assert.deepEqual(held.kit.requests.map((q) => q.op), ["acquire"]);
  /* control: a refused promote is drawn on the tab with the owner's words */
  const v2 = viewOf(S, { subject: "address" });
  await press(S, v2, "acquire", { values: { "ci-address": ADDRESS }, answers: { acquire: { ok: true, document: DOC },
    allocid: { ok: true, id: "INFO-2026-0008" }, promote: { ok: false, reason: "GATE_REFUSED", translation: "The checks refused it." } } });
  assert.equal(v2.ui.captured, undefined);
  assert.match(draw(v2), /The checks refused it\./);
});

test("R1 capturerequest sends the address; monitor sends the captured bundle", async () => {
  const v = viewOf(S, { subject: "address" });
  const r = await press(S, v, "capturerequest", { values: { "ci-address": ADDRESS } });
  assert.deepEqual(r.request.body, { address: ADDRESS });
  assert.match(draw(v), /Asked for later/);
  const v2 = viewOf(S, { subject: "address", ui: { captured: { title: "Report", bundleId: "INFO-2026-0001-report" } } });
  const m = await press(S, v2, "monitor", { dataset: { bundle: "INFO-2026-0001-report" } });
  assert.deepEqual(m.request.body, { bundleId: "INFO-2026-0001-report" });
  assert.match(draw(v2), /Watching Report for changes/);
  /* control: with no bundle named, monitor sends nothing */
  const none = await press(S, viewOf(S), "monitor", {});
  assert.equal(none.sent, false);
});

test("R2 the file tab: accept and capture attributes, four choices none preselected, the downloaded offer, the photo reminder", () => {
  const html = draw(viewOf(S, { subject: "file" }));
  assert.match(html, /<input id="ci-file" type="file" accept="[^"]*image\/\*[^"]*" capture="environment"/);
  const radios = html.match(/type="radio"[^>]*>/g);
  assert.equal(radios.length, 4);
  assert.ok(radios.every((r) => !/checked/.test(r)), "none preselected");
  assert.match(html, /Downloaded from a website\?[^<]*<a href="\/app\/capture\/address">/);
  assert.match(html, /Frame what you are checking/, "photo.reminder by its key");
  assert.match(html, /data-act="captureupload"[^>]*>Capture a file or photo</);
});

const FILE = { name: "Seminary Ave.jpg", size: 3100000 };
const filled = { "ci-how-made": true, "ci-where": "6012 Seminary Ave, 4 October", "ci-what": "The pothole, still open." };

test("R2 the statement is composed from the three answers in order, each with its label, sent with the raw bytes", async () => {
  const r = await press(S, viewOf(S, { subject: "file" }), "captureupload", { values: filled, files: { "ci-file": FILE } });
  assert.equal(r.request.raw, FILE);
  assert.deepEqual(Object.keys(r.request.query), ["statement", "name"]);
  assert.equal(r.request.query.name, "Seminary Ave.jpg");
  assert.equal(r.request.query.statement, "How you got it: I made it myself: a photo, a recording, my notes\n"
    + "Where and when: 6012 Seminary Ave, 4 October\nWhat it shows, in your own words: The pothole, still open.");
  assert.equal(r.request.body, undefined, "no JSON body");
});

test("R2 nothing is sent while a file or any answer is missing, saying which, or over 2,000 characters", async () => {
  const nofile = await press(S, viewOf(S), "captureupload", { values: filled });
  assert.equal(nofile.refused.key, "screen.capture.file.nofile");
  const none = await press(S, viewOf(S), "captureupload", { values: {}, files: { "ci-file": FILE } });
  assert.equal(none.refused.key, "screen.capture.file.missing");
  assert.match(none.refused.text, /How you got it, Where and when, What it shows, in your own words/);
  const one = await press(S, viewOf(S), "captureupload", { values: { ...filled, "ci-where": "" }, files: { "ci-file": FILE } });
  assert.match(one.refused.text, /say: Where and when\./);
  const long = await press(S, viewOf(S), "captureupload", { values: { ...filled, "ci-what": "x".repeat(2000) }, files: { "ci-file": FILE } });
  assert.equal(long.refused.key, "screen.capture.file.toolong");
  assert.equal(long.sent, false);
  /* control: at the bound it is sent */
  const head = "How you got it: I made it myself: a photo, a recording, my notes\nWhere and when: 6012 Seminary Ave, 4 October\nWhat it shows, in your own words: ";
  const edge = await press(S, viewOf(S), "captureupload", { values: { ...filled, "ci-what": "x".repeat(2000 - head.length) }, files: { "ci-file": FILE } });
  assert.equal(edge.sent, true);
  assert.equal([...edge.request.query.statement].length, 2000);
});

test("R2 the answer: existed says the record already held the bytes; otherwise it waits in Held captures", async () => {
  const v = viewOf(S, { subject: "file" });
  await press(S, v, "captureupload", { values: filled, files: { "ci-file": FILE }, answers: { captureupload: { ok: true, existed: true } } });
  assert.match(draw(v), /already held exactly this file/);
  const v2 = viewOf(S, { subject: "file" });
  await press(S, v2, "captureupload", { values: filled, files: { "ci-file": FILE }, answers: { captureupload: { ok: true, document: {} } } });
  assert.match(draw(v2), /Captured: Seminary Ave\.jpg\. It waits in Held captures/);
});

test("R2 UPLOAD_NO_STATEMENT, EMPTY, TOO_LARGE and MEMBER_SESSION_REQUIRED are each drawn in its own sentence", async () => {
  const texts = new Set();
  for (const code of ["UPLOAD_NO_STATEMENT", "EMPTY", "TOO_LARGE", "MEMBER_SESSION_REQUIRED"]) {
    const r = await press(S, viewOf(S), "captureupload", { values: filled, files: { "ci-file": FILE }, answers: { captureupload: { ok: false, reason: code } } });
    assert.ok(r.refused.key && r.refused.key.startsWith("screen.capture.refusal."), code);
    texts.add(r.refused.text);
  }
  assert.equal(texts.size, 4);
  /* control: another code is the shell's */
  const other = await press(S, viewOf(S), "captureupload", { values: filled, files: { "ci-file": FILE }, answers: { captureupload: { ok: false, reason: "REQUIRED_ARGUMENT_MISSING" } } });
  assert.ok(other.refused.answer);
});

test("R3 testify sends the member's words with where, and when as observedAt; never a time after now", async () => {
  const v = viewOf(S, { subject: "saw" });
  const r = await press(S, v, "testify", { values: { "ci-words": "The pothole is still open.", "ci-where": "6012 Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" },
    answers: { testify: { ok: true, id: "INFO-2026-0009-observation" } } });
  assert.deepEqual(r.request.body, { words: "The pothole is still open.\n\nWhere: 6012 Seminary Ave", observedAt: "2026-10-04T09:10:00Z" });
  assert.match(draw(v), /Recorded as your testimony: INFO-2026-0009-observation/);
  const later = await press(S, viewOf(S), "testify", { values: { "ci-words": "x", "ci-where": "y", "ci-when": "2026-10-13T09:10:00Z" } });
  assert.equal(later.refused.key, "screen.capture.saw.badwhen");
  const missing = await press(S, viewOf(S), "testify", { values: { "ci-words": "x" } });
  assert.match(missing.refused.text, /Where, When/);
});

test("R3 writinghelp is drawn under the words only while the assistant is reachable, told only what the member typed", async () => {
  assert.doesNotMatch(draw(viewOf(S, { subject: "saw", reachable: false })), /data-act="writinghelp"/);
  const html = draw(viewOf(S, { subject: "saw", reachable: true }));
  assert.ok(html.indexOf('data-act="writinghelp"') > html.indexOf('id="ci-words"'), "under the words field");
  assert.ok(html.indexOf('data-act="writinghelp"') < html.indexOf('id="ci-where"'));
  const v = viewOf(S, { subject: "saw", reachable: true });
  const r = await press(S, v, "writinghelp", { values: { "ci-words": "pothole still open 60cm" }, answers: { writinghelp: { ok: true, text: "The pothole is still open, about 60 cm across." } } });
  assert.deepEqual(r.request.body, { op: "testify", field: "words", told: "pothole still open 60cm" });
  const after = draw(v);
  assert.match(after, /<textarea id="ci-words">The pothole is still open, about 60 cm across\.<\/textarea>/);
  assert.match(after, /Draft by the assistant, at your request/);
  const empty = await press(S, viewOf(S, { reachable: true }), "writinghelp", { values: {} });
  assert.equal(empty.sent, false);
});

test("R3 (K2816 (2)) a writing-help draft carries the test-instance label exactly when its answer carries untested", async () => {
  const v = viewOf(S, { subject: "saw", reachable: true });
  await press(S, v, "writinghelp", { values: { "ci-words": "x" }, answers: { writinghelp: { ok: true, text: "X.", untested: true } } });
  assert.match(draw(v), /data-label="untested">Not yet tested:/);
  const v2 = viewOf(S, { subject: "saw", reachable: true });
  await press(S, v2, "writinghelp", { values: { "ci-words": "x" }, answers: { writinghelp: { ok: true, text: "X.", label: "untested" } } });
  assert.match(draw(v2), /data-label="untested"/);
  /* control: a draft without it carries no label */
  const v3 = viewOf(S, { subject: "saw", reachable: true });
  await press(S, v3, "writinghelp", { values: { "ci-words": "x" }, answers: { writinghelp: { ok: true, text: "X." } } });
  assert.doesNotMatch(draw(v3), /untested/);
});
