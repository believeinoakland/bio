/* capture R116-R118 (T53; N824; K2425 (4), K5506, K5527 (1)): `emailCapture` brings a received message into the record as `uploadCapture` brings a file, and registers a
   `member` job row for each attachment, at the module's interface: record-core's evidence store, provenance's `recordReceipt` and `registerHolds` as the fixture states them,
   `mail-reader`'s real reading of generated messages, and test-support's job registrar. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";
import { UPLOAD_STATEMENT_MAX, MAIL_WITHIN_FAILED_DETAIL } from "../../../src/capture/index.mjs";
import { CAPTURE_MAX } from "../../../src/acquisition/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { byteLedger } from "../../../src/byte-ledger.mjs";
// fixtures-contract: store-assembly job-registrar
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";
import { withAttachments, attachmentPart, eml, STANDARD } from "../mail-reader/fixtures.mjs";

const te = new TextEncoder();
const STATEMENT = "forwarded to the team address by the clerk's office on Tuesday";
const AT = "2026-10-28T12:00:00Z";
const setup = () => {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  const j = jobRegistrarStub();
  // fixtures-contract: store-assembly job-registrar
  f.c.registerJob = j.registerJob;
  f.c.armJobs = j.armJobs;
  /* the registrar as plane wires it: the filing transaction rolls back with a refusal, and the registrar's rows with it */
  const real = f.core.transact.bind(f.core);
  f.core.transact = (fn) => {
    try {
      return real(() => j.transact(() => { const out = fn(); if (out && typeof out === "object" && out.ok === false) throw Object.assign(new Error("refused"), { refused: out }); return out; }));
    } catch (e) { if (e && e.refused) return e.refused; throw e; }
  };
  const state = () => JSON.stringify([f.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((t) => [t.name, f.rows(`SELECT * FROM ${t.name}`)]), [...b.held.keys()].sort(), j.rows()]);
  return { ...f, b, j, state };
};
const mail = (extra = {}) => ({ statement: STATEMENT, by: "member:ann", at: AT, ...extra });
const three = () => withAttachments([
  attachmentPart("agenda.pdf", "application/pdf", te.encode("%PDF-1.4\n% an agenda\n")),
  attachmentPart("rows.csv", "text/csv", te.encode("a,b\n1,2\n")),
  attachmentPart("seal.png", "image/png", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]), { inline: true, cid: "seal@x" }),
]);
const plain = () => eml([...STANDARD], "Please find the request below.\r\n");

test("R116: a message brought in is one capture whose digest equals the raw bytes', graded received with her statement on its receipt, filed as an emailed document whose source names no member and no sender", async () => {
  const w = setup();
  const bytes = plain();
  const r = await w.c.emailCapture({ bytes, ...mail() });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.existed, r.capture], [false, { sha256: sha(bytes), bytes: bytes.length }]);
  assert.deepEqual(r.receipt, { address: `email:${sha(bytes)}`, via: "email", retrieved: AT, observation: null });
  assert.deepEqual(w.c.provenance.receipts, [{ address: `email:${sha(bytes)}`, addressNorm: `email:${sha(bytes)}`, captureSha: sha(bytes), retrieved: AT, via: "email",
                                               retrievalLocator: null, by: "member:ann", statement: STATEMENT }]);
  const d = r.document;
  assert.deepEqual([d.capture.method, d.capture.actor_class, d.capture.actor, d.capture.grade, d.capture.grade_basis],
                   ["emailed", "member", "member:ann", null, "CAPTURE_RECEIVED_NOT_FETCHED"]);
  assert.deepEqual(d.source, { kind: "mailer", receipt: { sha256: sha(bytes), bytes: bytes.length, received: AT } });
  assert.deepEqual(d.origin, { kind: "email" });
  assert.deepEqual(d.origin_statement, { text: STATEMENT, words_of: "member:ann", evidence_of_truth: false });
  assert.equal(d.locator, `email:${sha(bytes)}`);
  assert.equal(JSON.stringify(d.source).includes("ada@example.org"), false, "the source names no sender");
  assert.equal(d.message.stated, true);
  assert.deepEqual([d.message.from, d.message.to, d.message.cc, d.message.subject, d.message.message_id],
                   ["Ada Lane <ada@example.org>", "Clerk <clerk@example.gov>", "Ben <ben@example.org>", "Records request", "<m1@example.org>"]);
  assert.deepEqual(w.b.held.get(`bio/captures/${sha(bytes)}`), bytes, "held under its own digest");
  assert.deepEqual(w.j.rows().map((x) => x.kind), ["reading"], "a message with no attachment registers no member row (R117 control)");
  assert.deepEqual(r.attachments, []);
  assert.equal((await w.c.gradeNoteOf({ captureSha: sha(bytes) })).note, null, "R76: received, never fetched");
});

test("R116: the caller's headers are the message's statement of itself; with none handed, the message's own; the same bytes by a second member leave one capture and two receipts, each with its own statement", async () => {
  const w = setup();
  const bytes = plain();
  const given = { from: "Forwarder <fwd@example.net>", subject: "Fwd: Records request", received: ["from a by b", "from c by d"], authentication_results: ["spf=pass"], date: "Tue, 6 Oct 2026 09:30:00 -0700" };
  const a = await w.c.emailCapture({ bytes, headers: given, ...mail() });
  assert.deepEqual([a.document.message.from, a.document.message.subject, a.document.message.received, a.document.message.authentication_results],
                   [given.from, given.subject, given.received, given.authentication_results]);
  assert.equal(a.document.message.to, "Clerk <clerk@example.gov>", "a header the caller did not hand is the message's own");
  const b = await w.c.emailCapture({ bytes, ...mail({ by: "member:bea", statement: "Bea's own words about it" }) });
  assert.deepEqual([b.ok, b.existed, b.capture.sha256], [true, true, sha(bytes)]);
  assert.deepEqual(w.c.provenance.receipts.map((r) => [r.by, r.statement]), [["member:ann", STATEMENT], ["member:bea", "Bea's own words about it"]]);
  assert.equal(w.c.provenance.receipts.every((r) => r.captureSha === sha(bytes)), true);
  assert.equal(w.j.rows().length, 1, "one reading row");
});

test("R116: a machine identity is refused MEMBER_SESSION_REQUIRED first; a statement absent, blank or over 2,000 characters is MAIL_NO_STATEMENT (C-118.12); no bytes is EMPTY; each writes nothing; `uploadCapture` answers exactly as before", async () => {
  const w = setup();
  const before = w.state();
  for (const by of [undefined, "", "class:ai", "class:admin", "daemon", "member:"]) {
    const r = await w.c.emailCapture({ bytes: new Uint8Array(0), statement: "", by });
    assert.deepEqual([r.ok, r.reason, r.status], [false, "MEMBER_SESSION_REQUIRED", 403], String(by));
  }
  const row = CAPTURE_CHECKS.MAIL_NO_STATEMENT;
  assert.equal(row.check, "C-118.12");
  for (const statement of [undefined, null, 5, "", "  \n", "x".repeat(UPLOAD_STATEMENT_MAX + 1)]) {
    const r = await w.c.emailCapture({ bytes: plain(), ...mail({ statement }) });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.status, r.maxChars], [false, "MAIL_NO_STATEMENT", "MAIL_NO_STATEMENT", "C-118.12", row.translation, 400, UPLOAD_STATEMENT_MAX]);
  }
  const empty = await w.c.emailCapture({ bytes: new Uint8Array(0), ...mail() });
  assert.deepEqual([empty.ok, empty.reason, empty.status], [false, "EMPTY", 400]);
  assert.equal(w.state(), before, "nothing written");
  assert.equal((await w.c.emailCapture({ bytes: plain(), ...mail({ statement: "x".repeat(UPLOAD_STATEMENT_MAX) }) })).ok, true, "2,000 characters are admitted");
  /* control: an upload of the same bytes is an upload, as before */
  const u = await w.c.uploadCapture({ bytes: plain(), statement: STATEMENT, by: "member:ann", at: AT, name: "q.eml" });
  assert.deepEqual([u.ok, u.document.capture.method, u.receipt.via, u.document.origin.kind], [true, "uploaded", "upload", "upload"]);
});

test("R116: `within` is taken as an upload's: called with the document inside the transaction, its refusal rolls the filing back, a throw is MAIL_WITHIN_FAILED (500) with one fixed sentence", async () => {
  const w = setup();
  const seen = [];
  const ok = await w.c.emailCapture({ bytes: plain(), ...mail(), within: (doc) => { seen.push(doc.capture.method); return { fine: true }; } });
  assert.deepEqual([ok.ok, ok.within, seen], [true, { fine: true }, ["emailed"]]);
  const before = w.state();
  const refused = await w.c.emailCapture({ bytes: eml([...STANDARD, "X-N: 2"], "another"), ...mail(), within: () => ({ ok: false, reason: "NOT_NOW" }) });
  assert.deepEqual([refused.ok, refused.reason], [false, "NOT_NOW"]);
  const threw = await w.c.emailCapture({ bytes: eml([...STANDARD, "X-N: 3"], "third"), ...mail(), within: () => { throw new Error("secret detail"); } });
  assert.deepEqual([threw.ok, threw.reason, threw.status, threw.detail], [false, "MAIL_WITHIN_FAILED", 500, MAIL_WITHIN_FAILED_DETAIL]);
  assert.equal(JSON.stringify(threw).includes("secret detail"), false);
  assert.equal(w.rows(`SELECT count(*) n FROM captured_locators`)[0].n, 1, "only the first filing stands");
  assert.equal(w.rows(`SELECT count(*) n FROM capture_actors`)[0].n, 1);
  void before;
});

test("R117: each attachment mail-reader lists registers one `member` row keyed `<messageSha>!<index>` inside the filing, with the container's detail; an inline image is an attachment; the answer lists each with its state", async () => {
  const w = setup();
  const bytes = three();
  const r = await w.c.emailCapture({ bytes, ...mail() });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const d = sha(bytes);
  const members = w.j.rows().filter((x) => x.kind === "member");
  assert.equal(members.length, 3);
  assert.deepEqual(members.map((x) => x.session).sort(), [0, 1, 2].map((i) => `${d}!${i}`));
  const m1 = members.find((x) => x.session === `${d}!1`);
  assert.deepEqual(m1.detail, { container: d, container_kind: "message", index: 1, name_stated: "rows.csv", type_stated: "text/csv", project: null });
  assert.equal(w.j.rows().filter((x) => x.kind === "reading").length, 1);
  assert.deepEqual(r.attachments.map((a) => [a.index, a.name_stated, a.state, a.inline]), [[0, "agenda.pdf", "waiting", false], [1, "rows.csv", "waiting", false], [2, "seal.png", "waiting", true]]);
  /* a second sighting leaves one row each */
  const again = await w.c.emailCapture({ bytes, ...mail({ by: "member:bea", statement: "mine too" }) });
  assert.equal(again.existed, true);
  assert.equal(w.j.rows().filter((x) => x.kind === "member").length, 3);
});

test("R117: a registrar that refuses a member row rolls the filing back with no receipt and no actor; with no registrar the answer says which rows it could not register", async () => {
  const w = setup();
  const real = w.c.registerJob;
  // fixtures-contract: store-assembly job-registrar
  w.c.registerJob = (e) => (e.kind === "member" ? { ok: false, reason: "JOB_ENTRY_INVALID" } : real(e));
  const r = await w.c.emailCapture({ bytes: three(), ...mail() });
  assert.deepEqual([r.ok, r.reason, r.job.kind], [false, "JOB_NOT_REGISTERED", "member"]);
  assert.equal(w.rows(`SELECT count(*) n FROM captured_locators`)[0].n, 0, "no receipt");
  assert.equal(w.rows(`SELECT count(*) n FROM capture_actors`)[0].n, 0, "no actor");
  assert.deepEqual(w.j.rows(), [], "no job row");
  const bare = setup();
  bare.c.registerJob = undefined;
  const n = await bare.c.emailCapture({ bytes: three(), ...mail() });
  assert.equal(n.ok, true);
  assert.deepEqual(n.jobs.not_registered.map((x) => x.kind), ["reading", "member", "member", "member"]);
});

test("R117: an attachment over its kind's bound is listed refused with its size and the bound and gets no row, while the message and the others are filed", async () => {
  const w = setup();
  const bytes = three();
  const csvBound = 6;   // scaled: the attachment bound a caller may only LOWER (as `bounds` are)
  const r = await w.c.emailCapture({ bytes, ...mail(), bounds: { attachment: csvBound } });
  assert.equal(r.ok, true);
  const over = r.attachments.filter((a) => a.state === "over_bound");
  assert.ok(over.length >= 1);
  for (const a of over) {
    assert.ok(a.size > a.bound && a.bound === csvBound, a.name_stated);
    assert.ok(typeof a.key === "string" && a.key.length > 0);
    assert.equal(w.j.rows().some((x) => x.session === `${sha(bytes)}!${a.index}`), false, "no row for a refused attachment");
  }
  const waiting = r.attachments.filter((a) => a.state === "waiting");
  assert.equal(w.j.rows().filter((x) => x.kind === "member").length, waiting.length);
  assert.ok(w.b.held.has(`bio/captures/${sha(bytes)}`), "the message itself is filed");
});

test("R118: the ceiling is the lower of the mail bound and CAPTURE_MAX; a declared size over it is TOO_LARGE with size, bound and key before one byte is read or held; a message at the bound is filed, held once", async () => {
  const w = setup();
  const bound = Math.min(boundOf("mail", "message_bytes"), CAPTURE_MAX);
  assert.equal(bound, boundOf("mail", "message_bytes"));
  const before = w.state();
  let pulled = 0, cancelled = false;
  const stream = new ReadableStream({ pull(c) { pulled++; c.enqueue(new Uint8Array(1024)); }, cancel() { cancelled = true; } }, { highWaterMark: 0 });
  const r = await w.c.emailCapture({ bytes: stream, ...mail(), declared: bound + 1 });
  assert.deepEqual([r.ok, r.reason, r.status, r.size, r.bound, r.key], [false, "TOO_LARGE", 413, bound + 1, bound, "limit.mail.message_bytes"]);
  assert.deepEqual([pulled, cancelled], [0, true]);
  assert.equal(w.state(), before);
  /* a stream that passes the bound is cancelled at the first chunk past it, and nothing is filed */
  let sent = 0, cancelled2 = false;
  const over = new ReadableStream({ pull(c) { if (sent > bound) c.close(); else { sent += 1 << 20; c.enqueue(new Uint8Array(1 << 20)); } }, cancel() { cancelled2 = true; } }, { highWaterMark: 0 });
  const r2 = await w.c.emailCapture({ bytes: over, ...mail() });
  assert.deepEqual([r2.ok, r2.reason, r2.bound], [false, "TOO_LARGE", bound]);
  assert.equal(cancelled2, true);
  assert.equal(w.c.provenance.receipts.length, 0);
  /* control: exactly the bound is filed, held once (the ledger counts it and is empty after) */
  const head = plain();
  const exact = new Uint8Array(bound); exact.set(head, 0); exact.fill(0x20, head.length);
  const ledger = byteLedger();
  const ok = await w.c.emailCapture({ bytes: exact, ...mail(), ledger });
  assert.deepEqual([ok.ok, ok.capture.bytes], [true, bound]);
  assert.equal(ledger.held(), 0);
  assert.ok(ledger.peak() <= 3 * bound, "the body is counted, never request buffer plus a copy plus a read-back");
});
