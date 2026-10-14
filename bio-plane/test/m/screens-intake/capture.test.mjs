/* screens-intake R1–R3: the `capture` screen on the real served page (interface-shell's harness), its three tabs and six
 * acts as a member uses them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, html, text, main, btn, fill, press, ok, refused, rawKeys } from "./page.mjs";

const ADDRESS = "https://www.example.gov/reports/street-maintenance-2026.pdf";
const DOC = { capture: { sha256: "a".repeat(64), bytes: 1200, encoding: "binary" }, file: "snapshots/a.pdf", title: null };

test("R1 R16 the address tab draws acquire, capturerequest, and the two watching acts, monitorset and monitor", async () => {
  const p = await open("/app/capture/address");
  for (const op of ["acquire", "capturerequest", "monitorset", "monitor"]) assert.ok(btn(p, op), op);
  assert.match(btn(p, "monitorset").textContent, /Watch this address/);
  assert.match(btn(p, "monitor").textContent, /Check it now/);
  /* the frequency is a word of MONITOR_FREQ (monitoring R14), "none" never offered for watching */
  const opts = p.doc.getElementById("ci-freq").querySelectorAll("option").map((o) => o.getAttribute("value"));
  assert.deepEqual(opts.sort(), ["daily", "hourly", "monthly", "per_meeting", "weekly"]);
  assert.deepEqual(rawKeys(p), []);
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

const CAPTURED = { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0001" }),
                   promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) };
const BUNDLE = "INFO-2026-0001-street-maintenance-2026-pdf";

test("R16 \"Watch this address\" sends monitorset alone, enabled with the frequency chosen, for the bundle the address was captured into", async () => {
  const p = await open("/app/capture", { plane: { ...CAPTURED, monitorset: ok({ ok: true, bundleId: BUNDLE, enabled: true, frequency: "daily" }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  fill(p, { "ci-freq": "daily" });
  await press(p, "monitorset", { reason: "To see when it changes." });
  /* its friction is op-grades' (an ungraded op is reasoned, interface-shell R11): a reason the shell asks rides beside */
  const { reason, ...sent } = p.byOp("monitorset")[0].body;
  assert.deepEqual(sent, { bundleId: BUNDLE, enabled: true, frequency: "daily" });
  assert.equal(p.byOp("monitorset").length, 1);
  assert.equal(p.byOp("monitor").length, 0, "watching sends no check");
  assert.match(text(p), /Watching street-maintenance-2026\.pdf for changes, Every day\./);
  /* the frequency left as drawn is weekly */
  const q = await open("/app/capture", { plane: { ...CAPTURED, monitorset: ok({ ok: true }) } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  await press(q, "monitorset", { reason: "r" });
  assert.equal(q.byOp("monitorset")[0].body.frequency, "weekly");
});

test("R16 \"Check it now\" sends monitor alone, for the same bundle", async () => {
  const p = await open("/app/capture", { plane: { ...CAPTURED, monitor: ok({ ok: true }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await press(p, "monitor");
  assert.deepEqual(p.byOp("monitor").map((r) => r.body), [{ bundleId: BUNDLE }]);
  assert.equal(p.byOp("monitorset").length, 0, "checking sets no watching");
  assert.match(text(p), /Checked street-maintenance-2026\.pdf just now/);
});

test("R14 an address not captured this visit is watched through the held document for that address; none known, nothing is sent", async () => {
  const held = ok({ ok: true, held: [{ bundle_id: "INFO-2026-0003-other", title: "Other", source: { address: "https://x.example/y" } },
                                     { bundle_id: "INFO-2026-0002-report", title: "The report", source: { address: ADDRESS } }] });
  const p = await open("/app/capture", { plane: { heldcaptures: held, monitorset: ok({ ok: true }), monitor: ok({ ok: true }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "monitorset", { reason: "r" });
  assert.equal(p.byOp("monitorset")[0].body.bundleId, "INFO-2026-0002-report");
  await press(p, "monitor");
  assert.equal(p.byOp("monitor")[0].body.bundleId, "INFO-2026-0002-report");
  /* control: an address no held document names: nothing is sent, and the member is told to capture it first */
  const q = await open("/app/capture", { plane: { heldcaptures: held } });
  fill(q, { "ci-address": "https://never.example/z" });
  const r = await press(q, "monitorset", { reason: "r" });
  assert.equal(q.byOp("monitorset").length, 0);
  assert.match(r.slot().textContent, /capture it first, then watch it/);
  const e = await open("/app/capture");
  assert.match((await press(e, "monitor")).slot().textContent, /Write the address first/);
  assert.equal(e.byOp("monitor").length, 0);
});

test("R14 NOT_MONITORED, NO_LOCATOR and MONITOR_SET_REFUSED are drawn by the shell's rule (R13): the code's refusal word where held, else the answer's own words", async () => {
  const { WORD_ROWS } = await import("../../../src/setup-words/index.mjs");
  for (const [op, code] of [["monitor", "NOT_MONITORED"], ["monitorset", "NO_LOCATOR"], ["monitorset", "MONITOR_SET_REFUSED"]]) {
    const p = await open("/app/capture", { plane: { ...CAPTURED, [op]: refused(code, `Words for ${code}.`, 400, { field: "frequency" }) } });
    fill(p, { "ci-address": ADDRESS });
    await press(p, "acquire");
    const r = await press(p, op, { reason: "r" });
    const held = WORD_ROWS.find((w) => w[0] === `refusal.${code}`);
    const expected = held ? held[1].split("{")[0].trim() : `Words for ${code}.`;
    assert.ok(r.slot().textContent.includes(expected), `${code}: ${r.slot().textContent}`);
    assert.doesNotMatch(text(p), /Watching street|Checked street/, code);
  }
});

test("R14 \"Ask for this later\" sends capturerequest with the address and no run, and says when the request waits (drains: false)", async () => {
  const p = await open("/app/capture", { plane: { capturerequest: ok({ ok: true, id: "CR-1", drains: false }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "capturerequest");
  assert.deepEqual(p.byOp("capturerequest")[0].body, { address: ADDRESS }, "no run named");
  assert.match(text(p), /waits until your group's Civicsmith captures on its own, unattended/);
  /* control: a request that drains is asked for later, with no waiting sentence */
  const q = await open("/app/capture", { plane: { capturerequest: ok({ ok: true, id: "CR-2", drains: true }) } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "capturerequest");
  assert.match(text(q), /Asked for later: https/);
  assert.doesNotMatch(text(q), /unattended/);
  /* nothing is sent with no address */
  const e = await open("/app/capture");
  await press(e, "capturerequest");
  assert.equal(e.byOp("capturerequest").length, 0);
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

test("R3 R10 writinghelp under the words only while reachable; its draft filled into the words field itself, labelled, kept only by testify", async () => {
  const off = await open("/app/capture/saw");
  assert.equal(btn(off, "writinghelp"), null);
  const p = await open("/app/capture/saw", { reachable: true, plane: { writinghelp: ok({ ok: true, text: "The pothole is still open, about 60 cm across.",
    label: { kind: "machine", asked_by: "mai" } }), testify: ok({ ok: true, id: "INFO-2026-0009" }) } });
  const h = html(p);
  assert.ok(h.indexOf('data-act="writinghelp"') > h.indexOf('id="ci-words"'), "under the words field");
  assert.ok(h.indexOf('data-act="writinghelp"') < h.indexOf('id="ci-where"'));
  assert.doesNotMatch(text(p), /Draft ·/, "no label before a draft");
  fill(p, { "ci-words": "pothole still open 60cm" });
  await press(p, "writinghelp");
  assert.deepEqual(p.byOp("writinghelp")[0].body, { op: "testify", field: "words", told: "pothole still open 60cm" });
  /* R10: the same field, filled (cs.fill); no field of a new id */
  assert.equal(p.doc.getElementById("ci-words").value, "The pothole is still open, about 60 cm across.");
  assert.equal(main(p).querySelectorAll("textarea.rec").length, 1);
  assert.match(text(p), /Draft · the assistant's, asked by mai/);
  assert.equal(p.byOp("testify").length, 0, "nothing is kept by the draft itself");
  /* the member's own act keeps the draft as edited */
  fill(p, { "ci-words": "The pothole is still open.", "ci-where": "Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(p, "testify");
  assert.match(p.byOp("testify")[0].body.words, /^The pothole is still open\./);
  assert.doesNotMatch(text(p), /Draft ·/, "the label leaves once the member's own act kept it");
  /* control: nothing typed, nothing asked */
  const q = await open("/app/capture/saw", { reachable: true });
  await press(q, "writinghelp");
  assert.equal(q.byOp("writinghelp").length, 0);
});

test("R3 R10 (K2816 (2); wizard-scripts R34) a writing-help draft carries the test-instance label exactly when its answer carries untested", async () => {
  for (const [answer, labelled] of [[{ ok: true, text: "X.", untested: true }, true], [{ ok: true, text: "X.", untested: "untested", label: { kind: "machine", asked_by: "mai" } }, true], [{ ok: true, text: "X." }, false]]) {
    const p = await open("/app/capture/saw", { reachable: true, plane: { writinghelp: ok(answer) } });
    fill(p, { "ci-words": "x" });
    await press(p, "writinghelp");
    assert.equal(!!main(p).querySelector('[data-label="untested"]'), labelled, JSON.stringify(answer));
    if (labelled) assert.match(text(p), /Not yet tested: this part of the assistant/);
  }
});
