/* screens-intake R1–R3, R21–R25: the `capture` screen on the real served page (interface-shell's harness), its three tabs and
 * six acts as a member uses them. A sentence is asserted by its key through `setup-words` (R26), never by its English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { open as openPage, html, text, main, btn, fill, press, ok, refused, refusedIn, rawKeys, word, hasWord, says, saysIn, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

/* a document named on the page is a link only where the `document` screen is served: the stand-in serves it */
const open = (path, o = {}) => openPage(path, { ...o, screens: [...SCREENS, DOCUMENT_STUB] });
const failed = (p) => main(p).querySelector('[data-state="failed"][role="alert"]');

const ADDRESS = "https://www.example.gov/reports/street-maintenance-2026.pdf";
const SHA = "a".repeat(64);
const DOC = { capture: { sha256: SHA, bytes: 1200, encoding: "binary" }, file: "snapshots/a.pdf", title: null };
const sha256 = (t) => createHash("sha256").update(t, "utf8").digest("hex");
/* record-grammar's canonical JSON, restated here for flat documents: keys sorted, no space */
const canon = (v) => Array.isArray(v) ? `[${v.map(canon).join(",")}]` : v && typeof v === "object"
  ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(",")}}` : JSON.stringify(v);
/* what `ratification` R22 asks of a bundle for `verified` (`release.mjs`:192–197), asked of a promote request's files */
const entryMissing = (files) => {
  const md = files.find((f) => f.path === "bundle.md").text;
  const ch = /^content_hash: (.*)$/m.exec(md);
  return [!(ch && /^sha256:[0-9a-f]{64}$/.test(ch[1])) && "content_hash", !files.some((f) => f.path === "data/dataset.json") && "dataset",
          !files.some((f) => f.path.startsWith("snapshots/")) && "snapshots"].filter(Boolean);
};

test("R26 every key the capture screen reads is a word of the list", async () => {
  const { SCREENS } = await import("../../../src/screens-intake/index.mjs");
  const keys = SCREENS.find((s) => s.id === "capture").words;
  assert.ok(keys.length > 60);
  for (const k of keys) assert.ok(hasWord(k), k);
  assert.ok(Object.isFrozen(keys));
});

test("R1 R16 the address tab draws acquire, capturerequest, and the two watching acts, monitorset and monitor", async () => {
  const p = await open("/app/capture/address", { plane: { acquire: ok({ ok: true, existed: true, document: DOC, bundleId: "INFO-2026-0002-report" }) } });
  for (const op of ["acquire", "capturerequest"]) assert.ok(btn(p, op), op);
  assert.ok(!btn(p, "monitorset") && !btn(p, "monitor"), "R18: watching waits for a captured address");
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  for (const op of ["acquire", "capturerequest", "monitorset", "monitor"]) assert.ok(btn(p, op), op);
  assert.ok(btn(p, "monitorset").textContent.includes(word("act.monitorset.label.capture")));
  assert.ok(btn(p, "monitor").textContent.includes(word("act.monitor.label.capture")));
  /* the frequency is a word of MONITOR_FREQ (monitoring R14), "none" never offered for watching */
  const opts = p.doc.getElementById("ci-freq").querySelectorAll("option").map((o) => o.getAttribute("value"));
  assert.deepEqual(opts.sort(), ["daily", "hourly", "monthly", "per_meeting", "weekly"]);
  assert.deepEqual(rawKeys(p), []);
});

test("R1 R25 acquire sends the address as the locator; an empty address sends nothing and draws capture.fieldneeded with its label", async () => {
  const p = await open("/app/capture", { plane: { acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(p, { "ci-address": `  ${ADDRESS} ` });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS }]);
  const q = await open("/app/capture");
  const r = await press(q, "acquire");
  assert.equal(q.byOp("acquire").length, 0);
  assert.ok(saysIn(r.slot(), "capture.fieldneeded", { field: word("screen.capture.address.label") }));
  /* control: the same word for the other acts that read the address */
  const e = await open("/app/capture");
  assert.ok(saysIn((await press(e, "capturerequest")).slot(), "capture.fieldneeded", { field: word("screen.capture.address.label") }));
  assert.equal(e.byOp("capturerequest").length, 0);
});

test("R1 R25 each of acquire's five refusals is drawn by its key beside the address; any other code is the shell's (R13)", async () => {
  const seen = new Set();
  for (const code of ["BAD_LOCATOR", "SOURCE_REFUSED", "FETCH_FAILED", "EMPTY", "TOO_LARGE"]) {
    assert.ok(hasWord(`refusal.${code}`), code);
    const p = await open("/app/capture", { plane: { acquire: refused(code, "the owner's words") } });
    fill(p, { "ci-address": ADDRESS });
    const r = await press(p, "acquire");
    assert.ok(saysIn(r.slot(), `refusal.${code}`), code);
    assert.ok(!r.slot().textContent.includes("the owner's words"), code);
    seen.add(r.slot().textContent);
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
  assert.ok(says(p, "screen.capture.address.archive", { filed: 1 }));
  assert.ok(says(p, "screen.capture.address.notpromoted", { count: 1 }));
});

const CAPTURED = { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0001" }),
                   promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) };
const BUNDLE = "INFO-2026-0001-street-maintenance-2026-pdf";

test("R1 R21 R23 R24 (N747) an answer without promoted is promoted as an information bundle at collected that meets verified's entry, and links the document", async () => {
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
  assert.match(md.text, /^## Summary$/m);
  assert.doesNotMatch(md.text, /^project:/m, "R22 control: a capture with no subject is filed under no project");
  assert.equal(md.bytes, Buffer.byteLength(md.text, "utf8"));
  assert.equal(md.sha256, sha256(md.text), "cs.digest over the UTF-8 bytes");
  assert.ok(b.files.some((f) => f.path === "data/provenance.json"));
  assert.deepEqual(b.register, [{ sha256: SHA, path: "snapshots/a.pdf", encoding: "binary", bytes: 1200 }]);
  /* R23: every file `verified` names, a well-formed content_hash that the canonical dataset hashes to */
  assert.deepEqual(entryMissing(b.files), []);
  const ds = b.files.find((f) => f.path === "data/dataset.json");
  assert.equal(ds.text, canon(JSON.parse(ds.text)), "the dataset is written in its canonical form");
  assert.equal(JSON.parse(ds.text).documents[0].sha256, SHA);
  assert.match(md.text, new RegExp(`^content_hash: sha256:${sha256(ds.text)}$`, "m"));
  assert.equal(ds.sha256, sha256(ds.text));
  assert.equal(ds.bytes, Buffer.byteLength(ds.text, "utf8"));
  /* R21 R24: said only once the promotion answered; the result links the document it made */
  assert.ok(says(p, "screen.capture.address.done", { title: "street-maintenance-2026.pdf" }));
  assert.ok(main(p).querySelector(`a[href*="${b.bundleId}"]`), "R24: the result links the document");
  /* control: a refused promote is drawn on the tab with the owner's words, says nothing waits, and links nothing */
  const q = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0008" }),
    promote: refused("GATE_REFUSED", "The checks refused it.") } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  await q.settle();
  assert.match(text(q), /The checks refused it\./);
  assert.ok(!says(q, "screen.capture.address.done", { title: "street-maintenance-2026.pdf" }));
  assert.equal(main(q).querySelector('a[href*="INFO-2026-0008"]'), null, "R24 control: a refused promotion draws no link");
  /* control: a refusal with no words of its own is the shell's own failure word, never a silent tab */
  const r = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0009" }),
    promote: ok({ ok: false }) } });
  fill(r, { "ci-address": ADDRESS });
  await press(r, "acquire");
  await r.settle();
  assert.ok(failed(r), "a failure with no words is still drawn as failed");
  assert.ok(!says(r, "screen.capture.address.done", { title: "street-maintenance-2026.pdf" }));
});

test("R1 R21 (D29) an answer of ok: true that carries ok: false is a refusal at either step of a promotion, never a capture that waits", async () => {
  const nested = (words) => refusedIn("NOT_NOW", words);
  for (const [plane, words] of [[{ allocid: nested("No number now.") }, "No number now."], [{ promote: nested("Not kept now.") }, "Not kept now."]]) {
    const p = await open("/app/capture", { plane: { ...CAPTURED, ...plane } });
    fill(p, { "ci-address": ADDRESS });
    await press(p, "acquire");
    await p.settle();
    assert.ok(!says(p, "screen.capture.address.done", { title: "street-maintenance-2026.pdf" }), words);
    assert.ok(failed(p), `${words}: drawn failed`);
    assert.equal(main(p).querySelector(`a[href*="${BUNDLE}"]`), null, `${words}: no link`);
    const u = await open("/app/capture/file", { plane: { ...UPLOAD_PLANE, ...plane } });
    fill(u, filled);
    await press(u, "captureupload");
    await u.settle();
    assert.ok(!says(u, "screen.capture.file.done", { name: "Seminary Ave.jpg" }), `${words}: upload`);
    assert.ok(failed(u), `${words}: upload drawn failed`);
  }
});

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
  assert.ok(says(p, "screen.capture.address.watching", { title: "street-maintenance-2026.pdf", frequency: word("screen.capture.address.freq.daily") }));
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
  assert.ok(says(p, "screen.capture.address.checked", { title: "street-maintenance-2026.pdf" }));
});

test("R14 an address not captured this visit is watched through the held document for that address; none known, nothing is sent", async () => {
  const held = ok({ ok: true, held: [{ bundle_id: "INFO-2026-0003-other", title: "Other", source: { address: "https://x.example/y" } },
                                     { bundle_id: "INFO-2026-0002-report", title: "The report", source: { address: ADDRESS } }] });
  const p = await open("/app/capture", { plane: { heldcaptures: held, acquire: ok({ ok: true, existed: true, document: DOC }), monitorset: ok({ ok: true }), monitor: ok({ ok: true }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await press(p, "monitorset", { reason: "r" });
  assert.equal(p.byOp("monitorset")[0].body.bundleId, "INFO-2026-0002-report");
  await press(p, "monitor");
  assert.equal(p.byOp("monitor")[0].body.bundleId, "INFO-2026-0002-report");
  /* control: an address no held document names: nothing is sent, and the member is told to capture it first */
  const q = await open("/app/capture", { plane: { heldcaptures: held, acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  fill(q, { "ci-address": "https://never.example/z" });
  const r = await press(q, "monitorset", { reason: "r" });
  assert.equal(q.byOp("monitorset").length, 0);
  assert.ok(saysIn(r.slot(), "screen.capture.address.watchafter"));
  fill(q, { "ci-address": "" });
  assert.ok(saysIn((await press(q, "monitor")).slot(), "capture.fieldneeded", { field: word("screen.capture.address.label") }));
  assert.equal(q.byOp("monitor").length, 0);
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
    assert.ok(!says(p, "screen.capture.address.watching", { title: "street-maintenance-2026.pdf", frequency: word("screen.capture.address.freq.weekly") }), code);
    assert.ok(!says(p, "screen.capture.address.checked", { title: "street-maintenance-2026.pdf" }), code);
  }
});

test("R14 \"Ask for this later\" sends capturerequest with the address and no run, and says when the request waits (drains: false)", async () => {
  const p = await open("/app/capture", { plane: { capturerequest: ok({ ok: true, id: "CR-1", drains: false }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "capturerequest");
  assert.deepEqual(p.byOp("capturerequest")[0].body, { address: ADDRESS }, "no run named");
  assert.ok(says(p, "screen.capture.address.requested.waits", { address: ADDRESS }));
  /* control: a request that drains is asked for later, with no waiting sentence */
  const q = await open("/app/capture", { plane: { capturerequest: ok({ ok: true, id: "CR-2", drains: true }) } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "capturerequest");
  assert.ok(says(q, "screen.capture.address.requested", { address: ADDRESS }));
  assert.ok(!says(q, "screen.capture.address.requested.waits", { address: ADDRESS }));
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
  assert.ok(says(p, "screen.capture.file.downloaded"));
  assert.ok(main(p).querySelector('a[href="/app/capture/address"][data-nav]'), "the address tab offered");
  assert.ok(says(p, "photo.reminder"), "photo.reminder by its key");
  assert.ok(btn(p, "captureupload").textContent.includes(word("act.captureupload.label.capture")));
  assert.deepEqual(rawKeys(p), []);
});

const FILE = new File(["ÿØ photo bytes"], "Seminary Ave.jpg", { type: "image/jpeg" });
const filled = { "ci-file": FILE, "ci-how-made": true, "ci-where": "6012 Seminary Ave, 4 October", "ci-what": "The pothole, still open." };
const USHA = "d".repeat(64);
/* capture R86's answer: the capture and a provenance document built as a pulled knock's is */
const UPLOADED = { ok: true, existed: false, capture: { sha256: USHA, bytes: 14 },
  document: { file: `snapshots/upload-${USHA}`, locator: `upload:${USHA}`, capture: { method: "uploaded", sha256: USHA, encoding: "binary", bytes: 14 },
              provenance_chain: [{ who: "x", asserts: "y" }], source: { kind: "uploader" } } };
const UPLOAD_PLANE = { captureupload: ok(UPLOADED), allocid: ok({ ok: true, id: "INFO-2026-0011" }), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) };
const STATEMENT = `${word("screen.capture.file.how")}: ${word("screen.capture.file.how.made")}\n`
  + `${word("screen.capture.file.where")}: 6012 Seminary Ave, 4 October\n${word("screen.capture.file.what")}: The pothole, still open.`;

test("R2 the statement is composed from the three answers in order, each with its label, sent with the raw bytes", async () => {
  const p = await open("/app/capture/file", { plane: UPLOAD_PLANE });
  fill(p, filled);
  await press(p, "captureupload");
  const r = p.byOp("captureupload")[0];
  assert.equal(r.init.body, FILE, "the file's bytes are the raw body");
  assert.equal(r.headers["content-type"], undefined, "no JSON content type");
  assert.equal(r.query.name, "Seminary Ave.jpg");
  assert.equal(r.query.statement, STATEMENT);
  assert.match(r.headers.Authorization, /^Bearer /);
});

test("R2 nothing is sent while a file or any answer is missing, saying which, or over 2,000 characters", async () => {
  const labels = (...ks) => ks.map((k) => word(k)).join(", ");
  const cases = [[{ ...filled, "ci-file": null }, "screen.capture.file.nofile", {}],
                 [{ "ci-file": FILE }, "screen.capture.file.missing", { fields: labels("screen.capture.file.how", "screen.capture.file.where", "screen.capture.file.what") }],
                 [{ ...filled, "ci-where": "" }, "screen.capture.file.missing", { fields: labels("screen.capture.file.where") }],
                 [{ ...filled, "ci-what": "x".repeat(2000) }, "screen.capture.file.toolong", { count: [...`${STATEMENT.slice(0, STATEMENT.lastIndexOf(": ") + 2)}${"x".repeat(2000)}`].length }]];
  for (const [values, key, vars] of cases) {
    const p = await open("/app/capture/file");
    fill(p, values);
    const r = await press(p, "captureupload");
    assert.equal(p.byOp("captureupload").length, 0);
    assert.ok(saysIn(r.slot(), key, vars), key);
  }
  /* control: at the bound it is sent */
  const head = `${STATEMENT.slice(0, STATEMENT.lastIndexOf(": ") + 2).replace("The pothole, still open.", "")}`;
  const p = await open("/app/capture/file", { plane: UPLOAD_PLANE });
  fill(p, { ...filled, "ci-what": "x".repeat(2000 - [...head].length) });
  await press(p, "captureupload");
  assert.equal([...p.byOp("captureupload")[0].query.statement].length, 2000);
});

test("R2 R21 R24 the answer: existed says the record already held the bytes and promotes nothing; otherwise the upload is promoted and then waits in Held captures, linked", async () => {
  const p = await open("/app/capture/file", { plane: { ...UPLOAD_PLANE, captureupload: ok({ ok: true, existed: true }) } });
  fill(p, filled);
  await press(p, "captureupload");
  assert.ok(says(p, "screen.capture.file.existed"));
  assert.equal(p.byOp("allocid").length, 0, "existed: true promotes nothing new");
  assert.equal(p.byOp("promote").length, 0);
  const q = await open("/app/capture/file", { plane: UPLOAD_PLANE });
  fill(q, filled);
  await press(q, "captureupload");
  await q.settle();
  assert.ok(says(q, "screen.capture.file.done", { name: "Seminary Ave.jpg" }));
  assert.ok(!says(q, "screen.capture.file.existed"));
  assert.deepEqual(q.byOp("allocid")[0].query, { op: "allocid", prefix: "INFO", year: String(new Date().getUTCFullYear()) });
  const b = q.byOp("promote")[0].body;
  assert.equal(b.bundleId, "INFO-2026-0011-seminary-ave-jpg");
  assert.equal(b.meta.current_state, "collected");
  assert.deepEqual(b.register, [{ sha256: USHA, path: `snapshots/upload-${USHA}`, encoding: "binary", bytes: 14 }]);
  assert.deepEqual(entryMissing(b.files), [], "R23: the upload's bundle meets verified's entry too");
  const md = b.files.find((f) => f.path === "bundle.md").text;
  assert.match(md, new RegExp(`^  locator: "upload:${USHA}"$`, "m"));
  const ds = b.files.find((f) => f.path === "data/dataset.json");
  assert.match(md, new RegExp(`^content_hash: sha256:${sha256(ds.text)}$`, "m"));
  assert.ok(main(q).querySelector(`a[href*="${b.bundleId}"]`), "R24: the result links the document");
  /* control: a refused promotion draws its refusal, not "It waits", and no link */
  const r = await open("/app/capture/file", { plane: { ...UPLOAD_PLANE, promote: refused("GATE_REFUSED", "The checks refused it.") } });
  fill(r, filled);
  await press(r, "captureupload");
  await r.settle();
  assert.match(text(r), /The checks refused it\./);
  assert.ok(!says(r, "screen.capture.file.done", { name: "Seminary Ave.jpg" }));
  assert.equal(main(r).querySelector('a[href*="INFO-2026-0011"]'), null);
});

test("R2 UPLOAD_NO_STATEMENT, EMPTY, TOO_LARGE and MEMBER_SESSION_REQUIRED are each drawn in its own sentence", async () => {
  const keys = { UPLOAD_NO_STATEMENT: "screen.capture.refusal.UPLOAD_NO_STATEMENT", EMPTY: "screen.capture.refusal.upload.EMPTY",
                 TOO_LARGE: "screen.capture.refusal.upload.TOO_LARGE", MEMBER_SESSION_REQUIRED: "screen.capture.refusal.MEMBER_SESSION_REQUIRED" };
  const texts = new Set();
  for (const [code, key] of Object.entries(keys)) {
    const p = await open("/app/capture/file", { plane: { captureupload: refused(code, "the owner's words") } });
    fill(p, filled);
    const r = await press(p, "captureupload");
    assert.ok(saysIn(r.slot(), key), code);
    assert.ok(!r.slot().textContent.includes("the owner's words"), code);
    texts.add(r.slot().textContent);
  }
  assert.equal(texts.size, 4);
  /* control: another code is the shell's */
  const p = await open("/app/capture/file", { plane: { captureupload: refused("SOME_CODE_WITH_NO_WORD", "A name over 300 characters.") } });
  fill(p, filled);
  assert.match((await press(p, "captureupload")).slot().textContent, /A name over 300 characters\./);
});

/* R22 (BOB's reading of J2: the subject rides the path, `/app/capture/<tab>/<id>`) */
const PROJ = "PROJ-2026-0007", Q = "INQ-2026-0001-seven-days";
const questionMd = (project) => ["---", `id: ${Q}`, "object_type: inquiry", 'title: "Seven days"', ...(project ? [`project: ${project}`] : []), "references: []", "---", "", "## Question", ""].join("\n");
const FOR_QUESTION = (project = PROJ) => ({ ...CAPTURED, image: (r) => ok(r.query.id === Q ? { "bundle.md": questionMd(project) } : null) });

test("R22 a capture made from a question is filed under the question's project and offers Cite a passage over the document with the question", async () => {
  const p = await open(`/app/capture/address/${Q}`, { plane: FOR_QUESTION() });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.deepEqual(p.byOp("image").map((r) => r.query.id), [Q]);
  const md = p.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text;
  assert.match(md, new RegExp(`^project: ${PROJ}$`, "m"));
  const cite = main(p).querySelector(`a[href="/app/find-in/${BUNDLE}/${Q}"]`);
  assert.ok(cite, "Cite a passage opens find-in over the document with the question");
  assert.ok(cite.textContent.includes(word("act.cite.label.document")));
  /* the subject rides every tab link, so the tabs keep the question */
  assert.ok(main(p).querySelector(`a[href="/app/capture/file/${Q}"][data-nav]`));
  /* the upload tab files it the same way */
  const u = await open(`/app/capture/file/${Q}`, { plane: { ...UPLOAD_PLANE, image: FOR_QUESTION().image } });
  fill(u, filled);
  await press(u, "captureupload");
  await u.settle();
  assert.match(u.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text, new RegExp(`^project: ${PROJ}$`, "m"));
});

test("R22 a capture made from a project is filed under it, with no question read and no question carried to find-in", async () => {
  const p = await open(`/app/capture/address/${PROJ}`, { plane: CAPTURED });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.equal(p.byOp("image").length, 0);
  assert.match(p.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text, new RegExp(`^project: ${PROJ}$`, "m"));
  assert.ok(main(p).querySelector(`a[href="/app/find-in/${BUNDLE}"]`));
});

test("R22 controls: no subject, a subject that is neither a project nor a question, and a question stating no project file it under none; a question that cannot be read files nothing", async () => {
  for (const path of ["/app/capture/address", "/app/capture/address/INFO-2026-0004-lease", "/app/capture/address/"]) {
    const p = await open(path, { plane: CAPTURED });
    fill(p, { "ci-address": ADDRESS });
    await press(p, "acquire");
    await p.settle();
    assert.doesNotMatch(p.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text, /^project:/m, path);
    assert.equal(p.byOp("image").length, 0, path);
    assert.equal(main(p).querySelector('a[href^="/app/find-in/"]'), null, `${path}: nothing to cite into`);
  }
  const n = await open(`/app/capture/address/${Q}`, { plane: FOR_QUESTION("") });
  fill(n, { "ci-address": ADDRESS });
  await press(n, "acquire");
  await n.settle();
  assert.doesNotMatch(n.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text, /^project:/m);
  /* the question's read fails: nothing is promoted, so nothing is filed where the member did not mean */
  const u = await open(`/app/capture/address/${Q}`, { plane: { ...CAPTURED, image: ok(null) } });
  fill(u, { "ci-address": ADDRESS });
  await press(u, "acquire");
  await u.settle();
  assert.equal(u.byOp("promote").length, 0);
  assert.ok(failed(u), "a failure with no words is still drawn as failed");
});

/* provenance testify's answer as it is served (provenance/index.mjs: `{ok, bundle_id, bundle_sha, capture_sha, file, …}`) */
const TESTIFIED = { ok: true, bundle_id: "INFO-2026-0009-observation", bundle_sha: "e".repeat(64), capture_sha: "f".repeat(64),
                    file: "observations/observation.md" };

test("R3 (K3171) the recorded testimony is named by the bundle_id provenance's testify answers", async () => {
  const p = await open("/app/capture/saw", { plane: { testify: ok(TESTIFIED) } });
  fill(p, { "ci-words": "The pothole is still open.", "ci-where": "6012 Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(p, "testify");
  assert.ok(says(p, "screen.capture.saw.done", { id: "INFO-2026-0009-observation" }));
  assert.doesNotMatch(text(p), new RegExp("f".repeat(16)), "never the capture's digest");
  /* control: an answer naming no bundle draws no testimony id */
  const q = await open("/app/capture/saw", { plane: { testify: ok({ ok: true, id: "INFO-2026-0010-x" }) } });
  fill(q, { "ci-words": "x", "ci-where": "y", "ci-when": "2026-10-04T09:10:00Z" });
  await press(q, "testify");
  assert.doesNotMatch(text(q), /INFO-2026-0010-x/);
});

test("R3 testify sends the member's words with where, and when as observedAt; never a time after now", async () => {
  const p = await open("/app/capture/saw", { plane: { testify: ok(TESTIFIED) } });
  fill(p, { "ci-words": "The pothole is still open.", "ci-where": "6012 Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(p, "testify");
  assert.deepEqual(p.byOp("testify")[0].body, { words: `The pothole is still open.\n\n${word("screen.capture.saw.wherein", { where: "6012 Seminary Ave" })}`, observedAt: "2026-10-04T09:10:00Z" });
  assert.ok(says(p, "screen.capture.saw.done", { id: "INFO-2026-0009-observation" }));
  const q = await open("/app/capture/saw");
  fill(q, { "ci-words": "x", "ci-where": "y", "ci-when": "2999-01-01T00:00:00Z" });
  assert.ok(saysIn((await press(q, "testify")).slot(), "screen.capture.saw.badwhen"));
  fill(q, { "ci-words": "x", "ci-where": "", "ci-when": "" });
  assert.ok(saysIn((await press(q, "testify")).slot(), "screen.capture.saw.missing", { fields: `${word("screen.capture.saw.where")}, ${word("screen.capture.saw.when")}` }));
  assert.equal(q.byOp("testify").length, 0);
});

test("R3 R10 writinghelp under the words only while reachable; its draft filled into the words field itself, labelled, kept only by testify", async () => {
  const off = await open("/app/capture/saw");
  assert.equal(btn(off, "writinghelp"), null);
  const p = await open("/app/capture/saw", { reachable: true, plane: { writinghelp: ok({ ok: true, text: "The pothole is still open, about 60 cm across.",
    label: { kind: "machine", asked_by: "mai" } }), testify: ok(TESTIFIED) } });
  const h = html(p);
  assert.ok(h.indexOf('data-act="writinghelp"') > h.indexOf('id="ci-words"'), "under the words field");
  assert.ok(h.indexOf('data-act="writinghelp"') < h.indexOf('id="ci-where"'));
  const label = word("screen.capture.saw.draft", { handle: "mai" });
  assert.ok(!text(p).includes(label.split(" · ")[0] + " ·"), "no label before a draft");
  fill(p, { "ci-words": "pothole still open 60cm" });
  await press(p, "writinghelp");
  assert.deepEqual(p.byOp("writinghelp")[0].body, { op: "testify", field: "words", told: "pothole still open 60cm" });
  /* R10: the same field, filled (cs.fill); no field of a new id */
  assert.equal(p.doc.getElementById("ci-words").value, "The pothole is still open, about 60 cm across.");
  assert.equal(main(p).querySelectorAll("textarea.rec").length, 1);
  assert.ok(text(p).includes(label));
  assert.equal(p.byOp("testify").length, 0, "nothing is kept by the draft itself");
  /* the member's own act keeps the draft as edited */
  fill(p, { "ci-words": "The pothole is still open.", "ci-where": "Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(p, "testify");
  assert.match(p.byOp("testify")[0].body.words, /^The pothole is still open\./);
  assert.ok(!text(p).includes(label), "the label leaves once the member's own act kept it");
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
    if (labelled) assert.ok(says(p, "ai.label.untested"));
  }
});

test("R26 what the capture screen draws for a sample of its keys equals word(key, vars)", async () => {
  const p = await open("/app/capture/address");
  for (const k of ["screen.capture.sub", "screen.capture.tab.address", "screen.capture.tab.file", "screen.capture.tab.saw", "screen.capture.address.label",
                   "screen.capture.address.help", "screen.capture.address.note", "act.acquire.label.capture", "act.capturerequest.label.capture"])
    assert.ok(says(p, k) || btn(p, k.split(".")[1]) && btn(p, k.split(".")[1]).textContent.includes(word(k)), k);
  const f = await open("/app/capture/file");
  for (const k of ["screen.capture.file.choose", "screen.capture.file.choosehelp", "screen.capture.file.how", "screen.capture.file.how.made", "screen.capture.file.how.handed",
                   "screen.capture.file.how.sent", "screen.capture.file.how.downloaded", "screen.capture.file.where", "screen.capture.file.what", "screen.capture.file.note"])
    assert.ok(says(f, k), k);
  const s = await open("/app/capture/saw");
  for (const k of ["screen.capture.saw.note", "screen.capture.saw.words", "screen.capture.saw.where", "screen.capture.saw.when", "screen.capture.saw.whenhelp", "screen.capture.saw.after"])
    assert.ok(says(s, k), k);
});
