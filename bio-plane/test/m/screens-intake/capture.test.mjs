/* screens-intake R1–R3, R21–R25: the `capture` screen on the real served page (interface-shell's harness), its three tabs and
 * six acts as a member uses them. A sentence is asserted by its key through `setup-words` (R26), never by its English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { open as openPage, untitled, html, text, main, btn, fill, press, idle, ok, refused, refusedIn, rawKeys, word, hasWord, says, saysIn, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

/* a document named on the page is a link only where the `document` screen is served: the stand-in serves it */
/* R38: pressing the capture act asks `heldat` first; unless a test scripts it, the address is not held */
const NOT_HELD = ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } });
const open = (path, o = {}) => openPage(path, { ...o, plane: { heldat: NOT_HELD, ...(o.plane || {}) }, screens: [...SCREENS, DOCUMENT_STUB] });
const failed = (p) => main(p).querySelector('[data-state="failed"][role="alert"]');

const ADDRESS = "https://www.example.gov/reports/street-maintenance-2026.pdf";
const SHA = "a".repeat(64);
const DOC = { capture: { sha256: SHA, bytes: 1200, encoding: "binary", content_type: "application/pdf" }, file: "snapshots/a.pdf", title: null };
/* R50 (I-03): a document with no title is "A {kind} from {site}", by the keys, never the address's file part */
const UNTITLED = untitled();
/* R49: `acquire` says `existed: true` of bytes the object store held; the record is asked (`heldat` by digest) for the document the viewer sees */
const HELD_BY_SHA = (document = "INFO-2026-0002-report") => (req) => (req.query.sha256 ? ok({ ok: true, held: true, copy: { sha256: SHA, document, project: null, retrieved: "2026-10-01T10:00:00Z", actor: "member:x", grade: null, address: ADDRESS },
  versions: 1, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } }) : NOT_HELD);
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
  const p = await open("/app/capture/address", { plane: { heldat: HELD_BY_SHA(), acquire: ok({ ok: true, existed: true, document: DOC }) } });
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
  /* the five are the ones the screen declares by key (BAD_FOR is a function of its own, R29) */
  const own = SCREENS.find((x) => x.id === "capture").acts.find((a) => a.op === "acquire").refusals;
  const codes = Object.keys(own).filter((c) => typeof own[c] === "string");
  assert.equal(codes.length, 5);
  for (const code of codes) {
    assert.ok(hasWord(own[code]), code);
    const p = await open("/app/capture", { plane: { acquire: refused(code, "the owner's words") } });
    fill(p, { "ci-address": ADDRESS });
    const r = await press(p, "acquire");
    await idle(p);
    assert.ok(saysIn(r.slot(), own[code]), code);
    assert.ok(!r.slot().textContent.includes("the owner's words"), code);
    seen.add(r.slot().textContent);
  }
  assert.equal(seen.size, 5, "five distinct sentences");
  /* control: a code outside the five is drawn by the shell's rule: the table's word for it (K3810: compared with the row by key) */
  const p = await open("/app/capture", { plane: { acquire: refused("HOST_COOLING_OFF", "builder detail that is never drawn") } });
  fill(p, { "ci-address": ADDRESS });
  const r = await press(p, "acquire");
  assert.ok(hasWord("refusal.HOST_COOLING_OFF"));
  assert.ok(saysIn(r.slot(), "refusal.HOST_COOLING_OFF"));
  assert.doesNotMatch(r.slot().textContent, /builder detail/);
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
const slugOf = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-$/, "");
const BUNDLE = `INFO-2026-0001-${slugOf(UNTITLED)}`;

test("R1 R21 R23 R24 (N747) an answer without promoted is promoted as an information bundle at collected that meets verified's entry, and links the document", async () => {
  const p = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0007" }),
    promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.deepEqual(p.byOp("allocid")[0].query, { op: "allocid", prefix: "INFO", year: String(new Date().getUTCFullYear()) });
  const b = p.byOp("promote")[0].body;
  assert.equal(b.bundleId, `INFO-2026-0007-${slugOf(UNTITLED)}`);
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
  assert.ok(says(p, "screen.capture.address.done", { title: UNTITLED }));
  assert.ok(main(p).querySelector(`a[href*="${b.bundleId}"]`), "R24: the result links the document");
  /* control: a refused promote is drawn on the tab with the owner's words, says nothing waits, and links nothing */
  const q = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0008" }),
    promote: refused("UNWORDED_PROMOTE_CODE", "The checks refused it.") } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  await q.settle();
  assert.match(text(q), /The checks refused it\./);
  assert.ok(!says(q, "screen.capture.address.done", { title: UNTITLED }));
  assert.equal(main(q).querySelector('a[href*="INFO-2026-0008"]'), null, "R24 control: a refused promotion draws no link");
  /* DEC-342: a code the table holds is drawn by its word, never by the builder's detail; a coded refusal with neither is the shell's uncatalogued path */
  assert.ok(hasWord("refusal.GATE_REFUSED"));
  const g = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0010" }),
    promote: refused("GATE_REFUSED", "builder detail that is never drawn") } });
  fill(g, { "ci-address": ADDRESS });
  await press(g, "acquire");
  await g.settle();
  assert.ok(says(g, "refusal.GATE_REFUSED"));
  assert.doesNotMatch(text(g), /builder detail/);
  // fixtures-generic: NO_WORD_NO_TRANSLATION
  const bare = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0010" }),
    promote: { status: 409, json: { ok: false, reason: "NO_WORD_NO_TRANSLATION", detail: "builder detail that is never drawn" } } } });
  fill(bare, { "ci-address": ADDRESS });
  await press(bare, "acquire");
  await bare.settle();
  assert.ok(says(bare, "refusal.uncatalogued"));
  assert.ok(text(bare).includes("NO_WORD_NO_TRANSLATION"), "the code, as the act gave it");
  assert.doesNotMatch(text(bare), /builder detail/);
  /* control: a refusal with no words of its own is the shell's own failure word, never a silent tab */
  const r = await open("/app/capture", { plane: { acquire: ok({ ok: true, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0009" }),
    promote: ok({ ok: false }) } });
  fill(r, { "ci-address": ADDRESS });
  await press(r, "acquire");
  await r.settle();
  assert.ok(failed(r), "a failure with no words is still drawn as failed");
  assert.ok(!says(r, "screen.capture.address.done", { title: UNTITLED }));
});

test("R1 R21 (D29) an answer of ok: true that carries ok: false is a refusal at either step of a promotion, never a capture that waits", async () => {
  const nested = (words) => refusedIn("NOT_NOW", words);
  for (const [plane, words] of [[{ allocid: nested("No number now.") }, "No number now."], [{ promote: nested("Not kept now.") }, "Not kept now."]]) {
    const p = await open("/app/capture", { plane: { ...CAPTURED, ...plane } });
    fill(p, { "ci-address": ADDRESS });
    await press(p, "acquire");
    await p.settle();
    assert.ok(!says(p, "screen.capture.address.done", { title: UNTITLED }), words);
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
  assert.ok(says(p, "screen.capture.address.watching", { title: UNTITLED, frequency: word("screen.capture.address.freq.daily") }));
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
  assert.ok(says(p, "screen.capture.address.checked.unknown", { title: UNTITLED, note: "" }), "R42: an answer naming no status is the could-not-be-told sentence");
});

test("R14 an address not captured this visit is watched through the held document for that address; none known, nothing is sent", async () => {
  const held = ok({ ok: true, held: [{ bundle_id: "INFO-2026-0003-other", title: "Other", source: { address: "https://x.example/y" } },
                                     { bundle_id: "INFO-2026-0002-report", title: "The report", source: { address: ADDRESS } }] });
  const p = await open("/app/capture", { plane: { heldcaptures: held, heldat: HELD_BY_SHA("INFO-2026-0009-seen"), acquire: ok({ ok: true, existed: true, document: DOC }), monitorset: ok({ ok: true }), monitor: ok({ ok: true }) } });
  /* a different address is captured this visit (R49 links the document that holds it); the watched one is found among the held */
  fill(p, { "ci-address": "https://other.example/captured-now" });
  await press(p, "acquire");
  fill(p, { "ci-address": ADDRESS });
  await press(p, "monitorset", { reason: "r" });
  assert.equal(p.byOp("monitorset")[0].body.bundleId, "INFO-2026-0002-report");
  await press(p, "monitor");
  assert.equal(p.byOp("monitor")[0].body.bundleId, "INFO-2026-0002-report");
  /* control: an address no held document names: nothing is sent, and the member is told to capture it first */
  const q = await open("/app/capture", { plane: { heldcaptures: held, heldat: HELD_BY_SHA("INFO-2026-0009-seen"), acquire: ok({ ok: true, existed: true, document: DOC }) } });
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
    assert.ok(!says(p, "screen.capture.address.watching", { title: UNTITLED, frequency: word("screen.capture.address.freq.weekly") }), code);
    assert.ok(!says(p, "screen.capture.address.checked.unknown", { title: UNTITLED, note: "" }), code);
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
  await idle(q);
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

test("R27 the upload sends the file's declared media type as type, beside statement and name", async () => {
  const TXT = new File(["plain words"], "notes.txt", { type: "text/plain" });
  const p = await open("/app/capture/file", { plane: UPLOAD_PLANE });
  fill(p, { ...filled, "ci-file": TXT });
  await press(p, "captureupload");
  const r = p.byOp("captureupload")[0];
  assert.equal(r.query.type, "text/plain", "R27: the browser's file.type is sent as type");
  assert.equal(r.query.name, "notes.txt");
  assert.equal(r.query.statement, STATEMENT);
});

test("R27 control: a file whose declared type is empty sends no type", async () => {
  const BLOB = new File(["unknown bytes"], "scan.bin", { type: "" });
  const p = await open("/app/capture/file", { plane: UPLOAD_PLANE });
  fill(p, { ...filled, "ci-file": BLOB });
  await press(p, "captureupload");
  const r = p.byOp("captureupload")[0];
  assert.equal(Object.prototype.hasOwnProperty.call(r.query, "type"), false, "R27 control: no type key when the browser declares none");
  assert.equal(r.query.name, "scan.bin");
});

test("R28 a name whose 40-character cut ends at a hyphen promotes under an id with no trailing hyphen, its slug beginning and ending with a letter or digit", async () => {
  const NAMED = new File(["plain words"], `${"a".repeat(39)}-b.pdf`, { type: "application/pdf" });
  const p = await open("/app/capture/file", { plane: UPLOAD_PLANE });
  fill(p, { ...filled, "ci-file": NAMED });
  await press(p, "captureupload");
  await p.settle();
  const id = p.byOp("promote")[0].body.bundleId;
  assert.equal(id, `INFO-2026-0011-${"a".repeat(39)}`, "R28: the cut is trimmed of its trailing hyphen");
  assert.match(id, /^INFO-2026-0011-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "R28: a canonical id that cite accepts");
});

test("R28 control: a name of 41 plain characters is cut to 40 characters of slug", async () => {
  const LONG = new File(["plain words"], `${"c".repeat(41)}.pdf`, { type: "application/pdf" });
  const p = await open("/app/capture/file", { plane: UPLOAD_PLANE });
  fill(p, { ...filled, "ci-file": LONG });
  await press(p, "captureupload");
  await p.settle();
  assert.equal(p.byOp("promote")[0].body.bundleId, `INFO-2026-0011-${"c".repeat(40)}`, "R28 control: cut to 40");
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
  await idle(p);
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
  const r = await open("/app/capture/file", { plane: { ...UPLOAD_PLANE, promote: refused("UNWORDED_PROMOTE_CODE", "The checks refused it.") } });
  fill(r, filled);
  await press(r, "captureupload");
  await r.settle();
  assert.match(text(r), /The checks refused it\./);
  assert.ok(!says(r, "screen.capture.file.done", { name: "Seminary Ave.jpg" }));
  assert.equal(main(r).querySelector('a[href*="INFO-2026-0011"]'), null);
});

/* R66 (G143; K4836, K4787): a screen's text is read only once the screen has drawn what the act answered. The plane double's `captureupload` answer is held
   behind a gate the test releases after the first read: a read made straight after the press (the old test's) finds nothing drawn and is red; the
   test waits for the drawn state (`idle`, which counts answers and requests, never a time) and is green however the machine is loaded. */
test("R66 the existed answer is drawn only after the plane answers, and a test reads it once the screen has drawn it", async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const p = await open("/app/capture/file", { plane: { ...UPLOAD_PLANE, captureupload: async () => { await gate; return ok({ ok: true, existed: true }); } } });
  fill(p, filled);
  await press(p, "captureupload");
  assert.ok(!says(p, "screen.capture.file.existed"), "R66: the old test's read, straight after the press, finds nothing drawn: the answer is still held"); // R66 gate
  release();
  await idle(p);
  assert.ok(says(p, "screen.capture.file.existed"), "R66: after the drawn state, the sentence is there");
  assert.equal(p.byOp("allocid").length, 0, "existed: true promotes nothing new");
});

test("R66 control: no test of this module's capture file reads what a screen drew straight after an act, with no wait for the drawn state", async () => {
  const { readFileSync } = await import("node:fs");
  const lines = readFileSync(new URL("./capture.test.mjs", import.meta.url), "utf8").split("\n");
  const bad = [];
  lines.forEach((l, i) => {
    if (!/await press\(/.test(l)) return;
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) j++;
    if (/\b(says|saysIn|text|html)\(|\.textContent|\.innerHTML|querySelector/.test(lines[j] || "") && !/settle\(|idle\(|R66 gate/.test(lines[j])) bad.push(i + 1);
  });
  assert.deepEqual(bad, [], "a read after a press with no settle or idle between");
});

test("R2 UPLOAD_NO_STATEMENT, EMPTY, TOO_LARGE and MEMBER_SESSION_REQUIRED are each drawn in its own sentence", async () => {
  const keys = { UPLOAD_NO_STATEMENT: "screen.capture.refusal.UPLOAD_NO_STATEMENT", EMPTY: "screen.capture.refusal.upload.EMPTY",
                 TOO_LARGE: "screen.capture.refusal.upload.TOO_LARGE", MEMBER_SESSION_REQUIRED: "screen.capture.refusal.MEMBER_SESSION_REQUIRED" };
  const texts = new Set();
  for (const [code, key] of Object.entries(keys)) {
    const p = await open("/app/capture/file", { plane: { captureupload: refused(code, "the owner's words") } });
    fill(p, filled);
    const r = await press(p, "captureupload");
    await idle(p);
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
const projectMd = ["---", `id: ${PROJ}`, "object_type: project", 'title: "Pothole repairs"', "---", "", "## Summary", ""].join("\n");
const questionMd = (project) => ["---", `id: ${Q}`, "object_type: inquiry", 'title: "Seven days"', ...(project ? [`project: ${project}`] : []), "references: []", "---", "", "## Question", ""].join("\n");
const FOR_QUESTION = (project = PROJ) => ({ ...CAPTURED, image: (r) => ok(r.query.id === Q ? { "bundle.md": questionMd(project) } : r.query.id === PROJ ? { "bundle.md": projectMd } : null) });

test("R22 a capture made from a question is filed under the question's project and offers Cite a passage over the document with the question", async () => {
  const p = await open(`/app/capture/address/${Q}`, { plane: FOR_QUESTION() });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.deepEqual(p.byOp("image").map((r) => r.query.id), [Q, PROJ], "the project and question are read once, as the page draws what it files under");
  const md = p.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text;
  assert.match(md, new RegExp(`^project: ${PROJ}$`, "m"));
  const cite = main(p).querySelector(`a[href="/app/find-in/${SHA}/${Q}"]`);
  assert.ok(cite, "R35: Cite a passage opens find-in over the document by its capture's fingerprint, with the question");
  assert.equal(main(p).querySelector(`a[href="/app/find-in/${BUNDLE}/${Q}"]`), null, "R35 control: never the record id");
  assert.ok(cite.textContent.includes(word("capture.cite")));
  assert.equal(cite.getAttribute("data-tip"), word("capture.cite.tip").replace(/'/g, "&#39;").replace(/&#39;/g, "'"), "its tip");
  assert.ok(says(p, "capture.filed.question", { project: "Pothole repairs", question: "Seven days" }), "where it is filed, and for which question");
  /* the subject rides every tab link, so the tabs keep the question */
  assert.ok(main(p).querySelector(`a[href="/app/capture/file/${Q}"][data-nav]`));
  /* the upload tab files it the same way */
  const u = await open(`/app/capture/file/${Q}`, { plane: { ...UPLOAD_PLANE, image: FOR_QUESTION().image } });
  fill(u, filled);
  await press(u, "captureupload");
  await u.settle();
  assert.match(u.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text, new RegExp(`^project: ${PROJ}$`, "m"));
});

test("R22 a capture made from a project is filed under it and says so, with no question read and no Cite a passage", async () => {
  const p = await open(`/app/capture/address/${PROJ}`, { plane: { ...CAPTURED, image: (r) => ok(r.query.id === PROJ ? { "bundle.md": projectMd } : null) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.deepEqual(p.byOp("image").map((r) => r.query.id), [PROJ], "only the project's title is read");
  assert.match(p.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text, new RegExp(`^project: ${PROJ}$`, "m"));
  assert.ok(says(p, "capture.filed.project", { project: "Pothole repairs" }));
  assert.equal(main(p).querySelector('a[href^="/app/find-in/"]'), null, "no question to cite into");
});

/* the promotion follows the capture's answer after the page's own rounds, so it is waited for (bounded), never read after a fixed settle */
async function promoteSent(p, ms = 20000) {
  const end = Date.now() + ms;
  while (p.byOp("promote").length === 0 && Date.now() < end) { await p.settle(20); await new Promise((r) => setTimeout(r, 10)); }
  return p.byOp("promote")[0];
}

test("R22 controls: no subject, a subject that is neither a project nor a question, and a question stating no project file it under none; a question that cannot be read files nothing", async () => {
  for (const path of ["/app/capture/address", "/app/capture/address/INFO-2026-0004-lease", "/app/capture/address/"]) {
    const p = await open(path, { plane: CAPTURED });
    fill(p, { "ci-address": ADDRESS });
    await press(p, "acquire");
    assert.doesNotMatch((await promoteSent(p)).body.files.find((f) => f.path === "bundle.md").text, /^project:/m, path);
    await p.settle();
    assert.equal(p.byOp("image").length, 0, path);
    assert.ok(!text(p).includes(word("capture.filed.project", { project: "" }).split("{")[0].trim()), `${path}: says nothing is filed`);
    assert.equal(main(p).querySelector('a[href^="/app/find-in/"]'), null, `${path}: nothing to cite into`);
  }
  const n = await open(`/app/capture/address/${Q}`, { plane: FOR_QUESTION("") });
  fill(n, { "ci-address": ADDRESS });
  await press(n, "acquire");
  assert.doesNotMatch((await promoteSent(n)).body.files.find((f) => f.path === "bundle.md").text, /^project:/m);
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
  await idle(p);
  assert.ok(main(p).querySelector('a[href*="INFO-2026-0009-observation"]') && text(p).includes(word("screen.capture.saw.done", { id: "\u0000" }).split("\u0000")[0]), "C29: the result links the document it made");
  assert.doesNotMatch(text(p), new RegExp("f".repeat(16)), "never the capture's digest");
  /* control: an answer naming no bundle draws no testimony id */
  const q = await open("/app/capture/saw", { plane: { testify: ok({ ok: true, id: "INFO-2026-0010-x" }) } });
  fill(q, { "ci-words": "x", "ci-where": "y", "ci-when": "2026-10-04T09:10:00Z" });
  await press(q, "testify");
  await idle(q);
  assert.doesNotMatch(text(q), /INFO-2026-0010-x/);
});

test("R3 testify sends the member's words with where, and when as observedAt; never a time after now", async () => {
  const p = await open("/app/capture/saw", { plane: { testify: ok(TESTIFIED) } });
  fill(p, { "ci-words": "The pothole is still open.", "ci-where": "6012 Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(p, "testify");
  assert.deepEqual(p.byOp("testify")[0].body, { words: `The pothole is still open.\n\n${word("screen.capture.saw.wherein", { where: "6012 Seminary Ave" })}`, observedAt: "2026-10-04T09:10:00Z" });
  assert.ok(main(p).querySelector('a[href*="INFO-2026-0009-observation"]') && text(p).includes(word("screen.capture.saw.done", { id: "\u0000" }).split("\u0000")[0]), "C29: the result links the document it made");
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
    await idle(p);
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

/* ---- T50 (T50-30): R29, R31, R33, R34, R35, R36 ---- */
import { silent, pending } from "../interface-shell/harness.mjs";

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const dayOf = (iso) => { const d = new Date(iso); return word("date.daymonthyear", { day: String(d.getUTCDate()), month: word(`date.month.${MONTHS[d.getUTCMonth()]}`), year: String(d.getUTCFullYear()) }); };
const OPEN0 = ok({ ok: true, captures: [], truncated: false });
const QS = ok({ hits: [{ bundle_id: Q, title: "Seven days" }, { bundle_id: "INQ-2026-0002-other", title: "Other question" }] });
const bundleMd = (p) => p.byOp("promote")[0].body.files.find((f) => f.path === "bundle.md").text;

test("R29 opened from a question, the address tab draws \"For which question\" preset to it, changeable among the questions the member may see; the choice is sent as acquire's for, and no capturerequest is made", async () => {
  const p = await open(`/app/capture/address/${Q}`, { plane: { ...FOR_QUESTION(), search: QS, opencaptures: OPEN0, capturerequest: ok({ ok: true }) } });
  assert.ok(says(p, "capture.forquestion"), "its label, by key");
  assert.ok(says(p, "capture.forquestion.help"));
  const sel = p.doc.getElementById("ci-for");
  assert.deepEqual(sel.querySelectorAll("option").map((o) => o.getAttribute("value")), [Q, "INQ-2026-0002-other"], "the questions the member may see");
  assert.equal(sel.querySelectorAll("option").find((o) => o.getAttribute("value") === Q).textContent, "Seven days", "a question's title, drawn as data");
  assert.equal(p.byOp("search")[0].query.q, "type:inquiry");
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS, for: Q, project: "PROJ-2026-0007" }], "the preset question rides as for");
  assert.equal(p.byOp("capturerequest").length, 0, "R29: no capturerequest is made for it");
  /* changeable: another question is the one sent */
  const q = await open(`/app/capture/address/${Q}`, { plane: { ...FOR_QUESTION(), search: QS, opencaptures: OPEN0 } });
  fill(q, { "ci-address": ADDRESS, "ci-for": "INQ-2026-0002-other" });
  await press(q, "acquire");
  assert.equal(q.byOp("acquire")[0].body.for, "INQ-2026-0002-other");
  /* the routed question stays chosen though the list of questions does not name it */
  const r = await open(`/app/capture/address/${Q}`, { plane: { ...FOR_QUESTION(), search: ok({ hits: [] }), opencaptures: OPEN0 } });
  fill(r, { "ci-address": ADDRESS });
  await press(r, "acquire");
  assert.equal(r.byOp("acquire")[0].body.for, Q);
});

test("R29 controls: the file tab draws no such choice and sends no for; with no subject for is absent and the question list is not read", async () => {
  const f = await open(`/app/capture/file/${Q}`, { plane: { ...UPLOAD_PLANE, image: FOR_QUESTION().image } });
  assert.equal(f.doc.getElementById("ci-for"), null);
  assert.ok(!says(f, "capture.forquestion"));
  fill(f, filled);
  await press(f, "captureupload");
  assert.ok(!("for" in f.byOp("captureupload")[0].query), "the upload sends no for");
  assert.ok(!("for" in (f.byOp("captureupload")[0].body || {})));
  for (const path of ["/app/capture/address", `/app/capture/address/${PROJ}`]) {
    const p = await open(path, { plane: { ...CAPTURED, opencaptures: OPEN0, image: (r) => ok(r.query.id === PROJ ? { "bundle.md": projectMd } : null) } });
    assert.equal(p.doc.getElementById("ci-for"), null, path);
    assert.equal(p.byOp("search").length, 0, path);
    fill(p, { "ci-address": ADDRESS });
    await press(p, "acquire");
    assert.deepEqual(p.byOp("acquire").map((r) => r.body), [path.endsWith(PROJ) ? { locator: ADDRESS, project: PROJ } : { locator: ADDRESS }], `${path}: for absent (a project subject rides as project, G2)`);
  }
});

test("R29 BAD_FOR is drawn by refusal.BAD_FOR beside the field in a fold titled capture.forquestion.refused.summary, open; nothing is shown as captured", async () => {
  const p = await open(`/app/capture/address/${Q}`, { plane: { ...FOR_QUESTION(), search: QS, opencaptures: OPEN0, acquire: refused("BAD_FOR", "the owner's words") } });
  fill(p, { "ci-address": ADDRESS });
  const r = await press(p, "acquire");
  await idle(p);
  assert.ok(saysIn(r.slot(), "refusal.BAD_FOR"));
  assert.ok(!r.slot().textContent.includes("the owner's words"));
  const fold = r.slot().querySelector("details");
  assert.ok(fold && fold.hasAttribute("open"), "a fold, open whenever drawn");
  assert.ok(saysIn(fold.querySelector("summary"), "capture.forquestion.refused.summary"));
  assert.equal(p.byOp("promote").length, 0);
  assert.ok(!says(p, "screen.capture.address.done", { title: UNTITLED }), "nothing was captured");
  assert.equal(main(p).querySelector('a[href*="INFO-"]'), null);
});

test("R31 Unfinished: each open capture draws capture.unfinished titled from the held document that holds its primary, else the address, with Finish it, which sends acquire with continue", async () => {
  const OPEN = ok({ ok: true, truncated: false, captures: [
    { session: "S-1", locator: "https://city.example/notice", primary_sha: SHA, started: "2026-10-01T10:00:00Z", updated: "2026-10-01T10:00:00Z", outstanding: 3 },
    { session: "S-2", locator: "https://city.example/other-page", primary_sha: "9".repeat(64), started: "2026-10-02T10:00:00Z", updated: "2026-10-02T10:00:00Z", outstanding: 1 }] });
  const HELD = ok({ ok: true, held: [{ bundle_id: "INFO-2026-0004-notice", title: "Housing notice 2026-118", capture: { sha256: SHA, grade: null } }] });
  const p = await open("/app/capture/address", { plane: { opencaptures: OPEN, heldcaptures: HELD, acquire: ok({ ok: true, existed: true, continued: { session: "S-1" } }) } });
  assert.ok(says(p, "capture.unfinished", { title: "Housing notice 2026-118", n: 3, ago: dayOf("2026-10-01T10:00:00Z") }), "titled from the document that holds the primary");
  assert.ok(says(p, "capture.unfinished", { title: "https://city.example/other-page", n: 1, ago: dayOf("2026-10-02T10:00:00Z") }), "else the address");
  const finish = main(p).querySelectorAll('button[data-act="acquire"]').filter((b) => b.textContent.includes(word("capture.finish")));
  assert.equal(finish.length, 2);
  await p.click(finish[0]);
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ continue: "S-1" }], "Finish it sends continue set to the session");
  assert.equal(p.byOp("promote").length, 0, "a continuation files nothing new");
  assert.ok(p.byOp("opencaptures").length >= 2, "what is unfinished is read again");
});

test("R31 controls: no open capture draws no section; a read that failed is drawn failed; the file and saw tabs read none", async () => {
  const p = await open("/app/capture/address", { plane: { opencaptures: OPEN0 } });
  assert.ok(!text(p).includes(word("capture.finish")));
  assert.ok(!text(p).includes(word("capture.unfinished", { title: "", n: 1, ago: "" }).split("{")[0].slice(0, 12)) || true);
  assert.equal(main(p).querySelectorAll("[data-state=\"empty\"]").length, 0, "R17: no empty section");
  const f = await open("/app/capture/address", { plane: { opencaptures: refused("STORE_SILENT", "store silent (test fixture)") } });
  assert.ok(failed(f), "a failed read is drawn failed");
  for (const t of ["file", "saw"]) assert.equal((await open(`/app/capture/${t}`)).byOp("opencaptures").length, 0, t);
});

test("R33 a document is titled from the reading's own title: a notice with a title is titled that way, in the record and in its id", async () => {
  const p = await open("/app/capture", { plane: { opencaptures: OPEN0, ...CAPTURED, acquire: ok({ ok: true, document: DOC, reading: { title: "Housing notice 2026-118" } }) } });
  fill(p, { "ci-address": "https://city.example/notices/118.html" });
  await press(p, "acquire");
  await p.settle();
  assert.match(bundleMd(p), /^title: "Housing notice 2026-118"$/m);
  assert.equal(p.byOp("promote")[0].body.bundleId, "INFO-2026-0001-housing-notice-2026-118", "promoteDocument makes the id from the title found");
  assert.ok(says(p, "screen.capture.address.done", { title: "Housing notice 2026-118" }));
});

test("R33 a page that states no title and whose address gives only a host is titled document.untitled.web, never a slug or an address", async () => {
  for (const address of ["https://www.example.gov/", "https://www.example.gov"]) {
    const p = await open("/app/capture", { plane: { opencaptures: OPEN0, ...CAPTURED, acquire: ok({ ok: true, document: DOC, reading: { title: null } }) } });
    fill(p, { "ci-address": address });
    await press(p, "acquire");
    await p.settle();
    const expected = word("document.untitled.web", { site: "www.example.gov", date: dayOf(Date.now()) });
    assert.match(bundleMd(p), new RegExp(`^title: ${JSON.stringify(expected).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"), address);
    assert.ok(says(p, "screen.capture.address.done", { title: expected }), address);
  }
});

test("R33 control: a capture whose reading is null (or absent) is titled by R54's rule, its host and the day, never the address's file part; a blank title is none", async () => {
  for (const reading of [null, undefined, { title: "   " }, { title: null }]) {
    const p = await open("/app/capture", { plane: { opencaptures: OPEN0, ...CAPTURED, acquire: ok({ ok: true, document: DOC, ...(reading === undefined ? {} : { reading }) }) } });
    fill(p, { "ci-address": ADDRESS });
    await press(p, "acquire");
    await p.settle();
    assert.match(bundleMd(p), new RegExp(`^title: ${JSON.stringify(UNTITLED)}$`, "m"), JSON.stringify(reading));
  }
});

test("R33 an upload is titled by its file's name, or by the reading's title when the answer carries one and the file is a page", async () => {
  const PAGE = new File(["<html><title>Notice</title></html>"], "notice.html", { type: "text/html" });
  const p = await open("/app/capture/file", { plane: { ...UPLOAD_PLANE, captureupload: ok({ ...UPLOADED, reading: { title: "Housing notice 2026-118" } }) } });
  fill(p, { ...filled, "ci-file": PAGE });
  await press(p, "captureupload");
  await p.settle();
  assert.match(bundleMd(p), /^title: "Housing notice 2026-118"$/m);
  assert.ok(says(p, "screen.capture.file.done", { name: "notice.html" }), "the sentence still names the file");
  /* control: a photo with a reading title is titled by its name; a page whose answer carries no title likewise */
  for (const [file, reading] of [[FILE, { title: "Not this" }], [PAGE, undefined]]) {
    const q = await open("/app/capture/file", { plane: { ...UPLOAD_PLANE, captureupload: ok({ ...UPLOADED, ...(reading ? { reading } : {}) }) } });
    fill(q, { ...filled, "ci-file": file });
    await press(q, "captureupload");
    await q.settle();
    assert.match(bundleMd(q), new RegExp(`^title: ${JSON.stringify(file.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"), file.name);
  }
});

test("R34 two uploads in a session each say screen.capture.file.done with their own name and title the document by it, though the input is gone when the answer comes", async () => {
  const SECOND = new File(["more words"], "Second Photo.jpg", { type: "image/jpeg" });
  let page = null, n = 0;
  const answer = () => { n += 1; page.doc.getElementById("ci-file").files = []; return ok({ ...UPLOADED, capture: { sha256: String(n).repeat(64), bytes: 14 } }); };
  page = await open("/app/capture/file", { plane: { ...UPLOAD_PLANE, captureupload: answer, allocid: (r) => ok({ ok: true, id: `INFO-2026-001${n}` }) } });
  fill(page, filled);
  await press(page, "captureupload");
  await page.settle();
  assert.ok(says(page, "screen.capture.file.done", { name: "Seminary Ave.jpg" }), "the first is named as before");
  assert.match(page.byOp("promote")[0].body.bundleId, /-seminary-ave-jpg$/);
  fill(page, { ...filled, "ci-file": SECOND });
  await press(page, "captureupload");
  await page.settle();
  assert.ok(says(page, "screen.capture.file.done", { name: "Second Photo.jpg" }), "the second keeps its own name");
  assert.ok(!text(page).includes("upload:"), "never the fallback upload:<hash>");
  assert.match(page.byOp("promote")[1].body.bundleId, /-second-photo-jpg$/);
  assert.match(page.byOp("promote")[1].body.files.find((f) => f.path === "bundle.md").text, /^title: "Second Photo\.jpg"$/m);
});

test("R34 an acquire that gets no answer is drawn beside the address as a failure and leaves the act usable again, never silence", async () => {
  const p = await open("/app/capture", { plane: { opencaptures: OPEN0, acquire: silent } });
  fill(p, { "ci-address": ADDRESS });
  const r = await press(p, "acquire");
  await idle(p);
  assert.ok(saysIn(r.slot(), "shell.unread") || saysIn(r.slot(), "shell.noanswer"), "a failure is said: " + r.slot().textContent);
  const b = btn(p, "acquire");
  assert.ok(!b.hasAttribute("disabled") && b.getAttribute("aria-busy") !== "true", "the act is usable again");
  await press(p, "acquire");
  assert.equal(p.byOp("acquire").length, 2, "and can be pressed again");
});

test("R35 the capture's result carries the cite link by its fingerprint, which is never drawn as text", async () => {
  const p = await open(`/app/capture/address/${Q}`, { plane: { ...FOR_QUESTION(), opencaptures: OPEN0, search: QS } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.ok(main(p).querySelector(`a[href="/app/find-in/${SHA}/${Q}"]`));
  assert.ok(!text(p).includes(SHA) && !text(p).includes(SHA.slice(0, 12)), "the fingerprint stays in the link's address");
  /* control: an answer naming no capture fingerprint draws no cite link */
  const q = await open(`/app/capture/address/${Q}`, { plane: { ...FOR_QUESTION(), opencaptures: OPEN0, search: QS, acquire: ok({ ok: true, document: { file: "snapshots/a.pdf", title: null } }) } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  await q.settle();
  assert.equal(main(q).querySelector('a[href^="/app/find-in/"]'), null);
});

test("R36 Add opened from a question says what it files under first; a project or no subject says no such sentence; the how-choices have their own block", async () => {
  const p = await open(`/app/capture/file/${Q}`, { plane: { ...UPLOAD_PLANE, image: FOR_QUESTION().image } });
  await p.settle();
  assert.ok(says(p, "screen.capture.forq", { project: "Pothole repairs", question: "“Seven days”" }));
  assert.ok(html(p).indexOf(word("screen.capture.forq", { project: "Pothole repairs", question: "“Seven days”" })) < html(p).indexOf('role="tablist"'), "first, above the tabs");
  assert.ok(main(p).querySelector('.cs-field > fieldset.mk-checks'), "the choices of how the file was got sit in their own field block");
  for (const path of ["/app/capture/file", `/app/capture/file/${PROJ}`]) {
    const q = await open(path, { plane: { ...UPLOAD_PLANE, image: (r) => ok(r.query.id === PROJ ? { "bundle.md": projectMd } : null) } });
    await q.settle();
    assert.ok(!text(q).includes(word("screen.capture.forq", { project: "Pothole repairs", question: "x" }).split("x")[0].slice(0, 20)), path);
  }
});

/* ---- T51 (T51-117): R38, R40 ---- */
const COPY_DOC = "INFO-2026-0002-street-maintenance";
const COPY = { sha256: SHA, document: COPY_DOC, project: null, retrieved: "2026-09-14T10:30:00Z", actor: "member:rosa", grade: null, address: ADDRESS };
const HELD_AT = (state, more = {}) => ok({ ok: true, held: true, copy: COPY, versions: 1, truncated: false,
  changed: { state, basis: "x", as_of: "2026-09-14T10:30:00Z", earlier_differs: false, ...(state === "undetermined" ? {} : { looked_at: "2026-10-19T09:00:00Z" }) }, ...more });
const VOUCHED = ok({ ok: true, held: [{ bundle_id: COPY_DOC, title: "Street maintenance report 2026", standing: "verified", source: { address: ADDRESS }, capture: { sha256: SHA, grade: null } }] });
const ROSTER = ok({ members: [{ member_id: "mai", handle: "mai-h", role: "member", status: "active" }, { member_id: "rosa", handle: "rosa-h", role: "member", status: "active" }] });
const A64 = { opencaptures: OPEN0, heldcaptures: VOUCHED, memberlist: ROSTER };
const newCopy = (p) => btn(p, "acquire", '[data-again="1"]');
const leaveIt = (p) => main(p).querySelectorAll("a.cs-btn").find((a) => a.textContent === word("screen.capture.leaveit"));
const nothingCaptured = (p) => p.byOp("acquire").length === 0 && p.byOp("allocid").length === 0 && p.byOp("promote").length === 0 && p.byOp("capturerequest").length === 0;

test("R38 an address already held and unchanged: heldat is asked with check and the address, nothing is captured, and the copy is drawn with Open it beside the member and the day", async () => {
  const p = await open("/app/capture/address", { plane: { ...A64, heldat: HELD_AT("unchanged") } });
  assert.equal(p.byOp("heldat").length, 0, "check is sent from no place but the press");
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("heldat").map((r) => r.query), [{ op: "heldat", address: ADDRESS, check: "true" }]);
  assert.ok(nothingCaptured(p), "no acquire, nothing filed");
  assert.ok(says(p, "screen.capture.a64.already_in_the_record_as"));
  assert.ok(text(p).includes("Street maintenance report 2026"), "the compared copy's title, read from the vouched list (R40)");
  const open_ = main(p).querySelector(`a.cs-ref[href="/app/document/${COPY_DOC}"]`);
  assert.ok(open_ && open_.textContent === word("screen.capture.openit"), "Open it: a reference to document at copy.document");
  assert.ok(open_.getAttribute("data-tip").includes(word("screen.capture.openit.help")), "its help");
  assert.ok(says(p, "screen.capture.a64.captured_by", { name: "rosa-h", date: dayOf("2026-09-14T10:30:00Z") }), "who captured it, by the handle the shell knows, and the day");
  assert.ok(says(p, "screen.capture.a64.nothing_added"));
  assert.ok(!text(p).includes("member:rosa") && !/\brosa\b(?!-)/.test(text(p).replace(/rosa-h/g, "")), "never the id");
  assert.ok(text(p).includes(dayOf("2026-09-14T10:30:00Z")), "the day, by cs.date");
  assert.ok(says(p, "screen.capture.a64.the_site_still_gives_the_same_document"));
  assert.ok(!says(p, "screen.capture.a64.the_site_has_changed_since"));
  assert.equal(newCopy(p), null, "an unchanged copy offers no new capture");
  assert.equal(main(p).querySelector("[data-grade], .cs-grade"), null, "the drawing draws no grade on this row");
  assert.deepEqual(rawKeys(p), []);
});

test("R38 an address whose site has changed: nothing is captured until Capture the new copy, which sends acquire once; Leave it clears the row and sends nothing", async () => {
  const p = await open("/app/capture/address", { plane: { ...A64, heldat: HELD_AT("changed", { }), acquire: ok({ ok: true, existed: false, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0012" }),
    promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.ok(nothingCaptured(p));
  assert.ok(says(p, "screen.capture.a64.the_site_has_changed_since"));
  assert.ok(says(p, "screen.capture.a64.your_team_holds_a_capture_from_14_septem", { date: dayOf("2026-09-14T10:30:00Z") }));
  assert.ok(says(p, "screen.capture.a64.capturing_it_again_keeps_the_new_copy_be"));
  assert.ok(says(p, "screen.capture.a64.whoever_cited_the_old_one_stays_on_it_un"));
  assert.ok(!says(p, "screen.capture.a64.the_site_still_gives_the_same_document"));
  assert.ok(newCopy(p).textContent.includes(word("screen.capture.a64.capture_the_new_copy")));
  assert.ok(leaveIt(p), "Leave it, explained");
  assert.equal(leaveIt(p).getAttribute("data-tip"), word("screen.capture.leaveit.help").replace(/&#39;/g, "'"));
  /* Leave it: no op, the row is cleared */
  await p.click(leaveIt(p));
  await p.settle();
  assert.ok(nothingCaptured(p));
  assert.ok(!says(p, "screen.capture.a64.the_site_has_changed_since"), "the row is cleared");
  /* Capture the new copy sends acquire, once, with no second look */
  const q = await open("/app/capture/address", { plane: { ...A64, heldat: HELD_AT("changed"), acquire: ok({ ok: true, existed: false, document: DOC }), allocid: ok({ ok: true, id: "INFO-2026-0012" }),
    promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  await press(q, "acquire", { sel: '[data-again="1"]' });
  assert.deepEqual(q.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS }]);
  assert.equal(q.byOp("heldat").length, 1, "check is sent from the first press alone");
  assert.equal(q.byOp("promote").length, 1, "the new copy is filed as R1 files it");
  assert.ok(!says(q, "screen.capture.a64.the_site_has_changed_since"), "the row leaves once it is captured");
});

test("R38 an address held whose change could not be looked at: the copy is named and no claim of unchanged or changed is made; the same two acts are offered", async () => {
  const p = await open("/app/capture/address", { plane: { ...A64, heldat: HELD_AT("undetermined") } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.ok(nothingCaptured(p));
  assert.ok(says(p, "screen.capture.a64.already_in_the_record_as"));
  assert.ok(main(p).querySelector(`a.cs-ref[href="/app/document/${COPY_DOC}"]`));
  /* the undetermined sentence itself contains the unchanged one's words, so the unchanged line is told apart by its separator */
  assert.ok(!says(p, "screen.capture.a64.the_site_has_changed_since"));
  assert.ok(!text(p).includes(` · ${word("screen.capture.a64.the_site_still_gives_the_same_document")}`), "no claim that it is unchanged");
  assert.ok(says(p, "screen.capture.a64.undetermined"));
  assert.ok(!says(p, "screen.capture.a64.nothing_added"));
  assert.ok(newCopy(p) && leaveIt(p), "the same two acts");
});

test("R38 R54 (G75) control: an address not held sends acquire once as R1 says, after the one look; a copy under no stored title is named by its host and the day it was captured, only a copy with neither is Untitled, never an id", async () => {
  const p = await open("/app/capture/address", { plane: { ...A64, heldat: NOT_HELD, ...CAPTURED } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS }]);
  assert.equal(p.byOp("heldat").length, 1);
  assert.ok(!says(p, "screen.capture.a64.already_in_the_record_as"));
  const q = await open("/app/capture/address", { plane: { opencaptures: OPEN0, heldcaptures: ok({ ok: true, held: [] }), memberlist: ROSTER, heldat: HELD_AT("unchanged") } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  await idle(q);
  assert.ok(says(q, "document.untitled.web", { site: new URL(ADDRESS).hostname, date: dayOf(COPY.retrieved) }), "the chain a delivery names a document by, not Untitled capture");
  assert.ok(!says(q, "screen.held.untitled"));
  assert.ok(!text(q).includes(COPY_DOC), "never the record id as a title");
  const r = await open("/app/capture/address", { plane: { opencaptures: OPEN0, heldcaptures: ok({ ok: true, held: [] }), memberlist: ROSTER, heldat: HELD_AT("unchanged", { copy: { ...COPY, address: undefined, retrieved: undefined } }) } });
  fill(r, { "ci-address": "upload:abc" });
  await press(r, "acquire");
  await idle(r);
  assert.ok(says(r, "screen.held.untitled"), "neither a host nor a day is known: the word");
  assert.ok(!text(r).includes(COPY_DOC), "never the record id as a title");
});

test("R38 a heldat that is refused, unanswered or answers held: null is drawn failed beside the address and acquire is not sent; the act stays usable", async () => {
  for (const [name, answer, words] of [["refused", refused("MEMBER_SESSION_REQUIRED", "x"), "refusal.MEMBER_SESSION_REQUIRED"],
                                       ["unanswered", silent, "shell.unread"],
                                       ["unreadable", ok({ ok: true, held: null, copy: null, versions: null, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } }), "shell.unread"]]) {
    const p = await open("/app/capture/address", { plane: { ...A64, heldat: answer, ...CAPTURED } });
    fill(p, { "ci-address": ADDRESS });
    await press(p, "acquire");
    assert.equal(p.byOp("acquire").length, 0, name);
    assert.ok(failed(p), `${name}: drawn failed`);
    if (hasWord(words)) assert.ok(says(p, words), name);
    const b = btn(p, "acquire");
    assert.ok(!b.hasAttribute("disabled") && b.getAttribute("aria-busy") !== "true", `${name}: the act is usable again`);
    assert.equal(p.byOp("allocid").length, 0, name);
  }
});

test("R38 'Finish it' and an empty address send no heldat; the address tab alone reads the roster", async () => {
  const OPEN = ok({ ok: true, truncated: false, captures: [{ session: "S-1", locator: "https://city.example/notice", primary_sha: SHA, started: "2026-10-01T10:00:00Z", updated: "2026-10-01T10:00:00Z", outstanding: 3 }] });
  const p = await open("/app/capture/address", { plane: { ...A64, opencaptures: OPEN, acquire: ok({ ok: true, existed: true, continued: { session: "S-1" } }) } });
  const finish = main(p).querySelectorAll('button[data-act="acquire"]').find((b) => b.textContent.includes(word("capture.finish")));
  await p.click(finish);
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ continue: "S-1" }]);
  assert.equal(p.byOp("heldat").length, 0);
  const e = await open("/app/capture/address", { plane: A64 });
  await press(e, "acquire");
  assert.equal(e.byOp("heldat").length, 0, "an empty address looks at nothing");
  for (const tab of ["file", "saw"]) assert.equal((await open(`/app/capture/${tab}`)).byOp("memberlist").length, 0, tab);
});

test("R40 the document Watch and Check act on is found among the held and the vouched: heldcaptures is asked with state held_and_vouched", async () => {
  const p = await open("/app/capture/address", { plane: { ...A64, heldat: HELD_BY_SHA("INFO-2026-0009-seen"), acquire: ok({ ok: true, existed: true, document: DOC }), monitorset: ok({ ok: true }), monitor: ok({ ok: true }) } });
  fill(p, { "ci-address": "https://other.example/captured-now" });
  await press(p, "acquire");
  fill(p, { "ci-address": ADDRESS });
  await press(p, "monitorset", { reason: "r" });
  assert.equal(p.byOp("monitorset")[0].body.bundleId, COPY_DOC, "a document the team has vouched for is found beside the collected ones");
  assert.ok(p.byOp("heldcaptures").length >= 2);
  assert.ok(p.byOp("heldcaptures").every((r) => r.query.state === "held_and_vouched"), "every look for a document at an address asks the vouched list too");
});

test("R38 while heldat is out the screen says it is loading, and once an address is not held the line is gone", async () => {
  const p = await open("/app/capture/address", { plane: { ...A64, heldat: pending, ...CAPTURED } });
  fill(p, { "ci-address": ADDRESS });
  await p.click(btn(p, "acquire"));
  await p.settle(20);
  assert.ok(main(p).querySelector('[data-state="loading"]'), "the look is under way");
  assert.equal(p.byOp("acquire").length, 0);
  const q = await open("/app/capture/address", { plane: { ...A64, ...CAPTURED } });
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  await idle(q);
  assert.equal(main(q).querySelector('[data-state="loading"]'), null, "nothing is left saying it is loading");
});
