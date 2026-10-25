/* capture's published fixtures (`fixtures.mjs`): each is called here and its answer compared with what capture's real code gives, so a fixture can never drift
   from the module it stands for (K4990, K5044). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { acquireRefusal, storageNotConfigured, captureArm, heldActsUnreadable, heldSetAside, partRefusal, recordReuseVerdicts, uploadProvenance, UPLOAD_PNG, sha } from "./fixtures.mjs";

test("fixture acquireRefusal: the real refusals of a render, by code: deferred (429, render state deferred), no renderer (501), host cooling off (429); nothing is fetched or filed", async () => {
  const d = await acquireRefusal({ code: "RENDER_DEFERRED" });
  assert.deepEqual([d.status, d.body.ok, d.body.reason, d.body.render.state], [429, false, "RENDER_DEFERRED", "deferred"]);
  const n = await acquireRefusal({ code: "RENDER_NO_RENDERER" });
  assert.deepEqual([n.status, n.body.ok, n.body.reason], [501, false, "RENDER_NO_RENDERER"]);
  const c = await acquireRefusal({ code: "RENDER_HOST_COOLING_OFF" });
  assert.deepEqual([c.status, c.body.reason], [429, "RENDER_HOST_COOLING_OFF"]);
  // fixtures-generic: RENDER_MADE_UP (a control: a code no render refusal gives, which the fixture must refuse to make)
  await assert.rejects(() => acquireRefusal({ code: "RENDER_MADE_UP" }), /no render refusal/);
});

test("fixture storageNotConfigured: acquire on an instance with no evidence store is refused 503 EVIDENCE_STORAGE_NOT_CONFIGURED, its check and translation the installation's", async () => {
  const r = await storageNotConfigured();
  assert.deepEqual([r.status, r.body.ok, r.body.reason, r.body.check], [503, false, "EVIDENCE_STORAGE_NOT_CONFIGURED", "C-68.1"]);
  assert.equal(typeof r.body.translation, "string");
});

test("fixture captureArm: a real capture over a scripted network files what the route serves, answers a refusal the source gives, records each call and each reader registration, and refuses an unknown or a second reader as capture does", async () => {
  const arm = captureArm({ routes: { "https://s.example/p": () => new Response("<html><body>hello</body></html>", { headers: { "content-type": "text/html" } }),
                                    "https://s.example/gone": () => new Response("no", { status: 410 }) } });
  const ok = await arm.acquire({ locator: "https://s.example/p" });
  assert.deepEqual([ok.status, ok.body.ok, ok.body.document.locator], [200, true, "https://s.example/p"]);
  assert.equal(ok.body.document.capture.sha256, sha(new TextEncoder().encode("<html><body>hello</body></html>")));
  const gone = await arm.acquire({ locator: "https://s.example/gone" });
  assert.deepEqual([gone.status, gone.body.ok], [502, false]);
  assert.deepEqual(arm.calls.map((c) => c.body.locator), ["https://s.example/p", "https://s.example/gone"]);
  assert.equal(arm.registerReader("captured-for", "capture-requests", () => ({ questions: [] })).ok, true);
  assert.equal(arm.registerReader("captured-for", "other", () => ({ questions: [] })).reason, "LISTENER_DECLARED");
  assert.equal(arm.registerReader("no-such-slot", "x", () => null).reason, "UNKNOWN_READER");
  assert.equal(arm.readers.length, 3);
  arm.routes["https://s.example/later"] = () => new Response("later", { headers: { "content-type": "text/plain" } });
  assert.equal((await arm.acquire({ locator: "https://s.example/later" })).status, 200, "a route set after the arm was made is served");
});

test("fixture heldActsUnreadable: heldActsOf over a store it cannot read answers ok false, HELD_ACTS_UNREADABLE and no list, never throws", () => {
  const r = heldActsUnreadable({ question: "INQ-9" });
  assert.deepEqual([r.ok, r.reason, r.acts, r.question], [false, "HELD_ACTS_UNREADABLE", null, "INQ-9"]);
});

test("fixture heldSetAside: setAside of documents waited on answers the act, the ids, the reason and, for each document, the questions it was waited on for as the viewer is shown them", () => {
  const r = heldSetAside();
  assert.deepEqual([r.ok, r.act, r.ids, r.reason], [true, "set_aside", ["INFO-2026-0002-budget"], "Wrong year."]);
  assert.equal(r.documents.length, 1);
  assert.equal(r.documents[0].document, "INFO-2026-0002-budget");
  assert.deepEqual(r.documents[0].waiting.questions.map((q) => q.question), ["INQ-1"]);
  assert.equal(r.documents[0].waiting.questions[0].title, "Were the transfers authorised?");
  const none = heldSetAside({ ids: ["A", "B"], waiting: [] });
  assert.deepEqual([none.ok, none.ids, none.documents.map((d) => d.waiting.questions)], [true, ["A", "B"], [[], []]]);
});

test("fixture partRefusal: the real refusals of a part: a wrong digest is a 400 with expected and got, a changed or early part is a 409, an aborted upload's part is unknown, a lost hashing state is a 409 UPLOAD_LOST", async () => {
  const r = await partRefusal();
  assert.deepEqual([r.PART_DIGEST_MISMATCH.ok, r.PART_DIGEST_MISMATCH.reason, r.PART_DIGEST_MISMATCH.status], [false, "PART_DIGEST_MISMATCH", 400]);
  assert.equal(r.PART_DIGEST_MISMATCH.expected, sha("another part"));
  assert.match(r.PART_DIGEST_MISMATCH.got, /^[0-9a-f]{64}$/);
  assert.deepEqual([r.PART_CONFLICT.reason, r.PART_CONFLICT.status], ["PART_CONFLICT", 409]);
  assert.deepEqual([r.PART_OUT_OF_ORDER.reason, r.PART_OUT_OF_ORDER.status, r.PART_OUT_OF_ORDER.next], ["PART_OUT_OF_ORDER", 409, 1]);
  assert.deepEqual([r.UPLOAD_UNKNOWN.reason, r.UPLOAD_UNKNOWN.status], ["UPLOAD_UNKNOWN", 404]);
  assert.deepEqual([r.UPLOAD_LOST.reason, r.UPLOAD_LOST.status], ["UPLOAD_LOST", 409]);
});

test("fixture recordReuseVerdicts: reusedparts answers the seeded reused parts of the bundle, recordreuseverdicts records through capture, and recorded() reads the verdicts back from the record, newest first", () => {
  const f = recordReuseVerdicts();
  const read = f.ops.reusedparts();
  assert.deepEqual([read.bundleId, read.count, read.parts.map((p) => p.address_norm)], ["INFO-1", 2, ["https://x.example/a.css", "https://x.example/b.js"]]);
  assert.deepEqual(read.parts.map((p) => p.reused_sha), f.parts.map((p) => p.reused_sha));
  assert.deepEqual(f.recorded(), []);
  const out = f.ops.recordreuseverdicts("http://do/recordreuseverdicts", { verdicts: read.parts.map((p, i) => ({ source_capture: p.primary_sha, host: p.host, address_norm: p.address_norm, verdict: i ? "changed" : "confirmed", reused_sha: p.reused_sha, observed_sha: sha(`now ${i}`) })) });
  assert.deepEqual([out.ok, out.recorded], [true, 2]);
  assert.deepEqual(f.recorded().map((v) => [v.address_norm, v.verdict, v.phase]).sort(), [["https://x.example/a.css", "confirmed", "ratify"], ["https://x.example/b.js", "changed", "ratify"]]);
});

test("fixture uploadProvenance: the document capture's real uploadCapture writes for a PNG brought with no declared type is the one upload.test.mjs pins (graded received, no content_type, file snapshots/upload-<sha>, the bytes profiled as a PNG); a text named notes.png is profiled by its bytes, not its name", async () => {
  const d = await uploadProvenance();
  const s = sha(UPLOAD_PNG), at = "2026-10-09T12:00:00Z";
  assert.deepEqual(d.capture, { method: "uploaded", grade: null, grade_basis: "CAPTURE_RECEIVED_NOT_FETCHED", actor_class: "member", actor: "m1", sha256: s, encoding: "binary", bytes: UPLOAD_PNG.length });
  assert.equal("content_type" in d.capture, false, "no declared type, so no content_type");
  assert.deepEqual([d.file, d.locator, d.retrieved], [`snapshots/upload-${s}`, `upload:${s}`, at]);
  assert.deepEqual(d.source, { kind: "uploader", receipt: { sha256: s, bytes: UPLOAD_PNG.length, received: at } });
  assert.deepEqual([d.origin, d.authority_state], [{ kind: "upload" }, "undetermined"]);
  assert.deepEqual(d.origin_statement, { text: "a photo the clerk took at the counter", words_of: "m1", evidence_of_truth: false });
  assert.deepEqual([d.attestation_attempts, "parts" in d], [[], false]);
  assert.deepEqual([d.provenance_chain.length, d.provenance_chain[0].via, d.provenance_chain[0].bound], [1, "upload", false]);
  assert.deepEqual([d.profile.format.format, d.profile.source_content_type], ["png", null]);
  assert.equal(d.name_stated.text, "street.png");
  const t = await uploadProvenance({ bytes: new TextEncoder().encode("the minutes of the meeting"), name: "notes.png" });
  assert.notEqual(t.profile.format.format, "png", "the bytes decide what the file is, not its name");
  assert.equal("content_type" in t.capture, false);
});
