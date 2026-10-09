/* capture: a file a member holds, brought into the record (R86; T41-8a, N821, K2425 (4), K2449, K2452) at the module's
   interface: `uploadCapture` over record-core's evidence store, provenance's `recordReceipt` and `registerHolds` as its
   Provides state them (fixture.mjs), and acquisition's `profileOf`. Each refusal has its negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, provenance, network, register, sha } from "./fixture.mjs";
import { UPLOAD_MAX, UPLOAD_STATEMENT_MAX, UPLOAD_NAME_MAX, UPLOAD_WITHIN_FAILED_DETAIL } from "../../../src/capture/index.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";
import { INSTALLATION_CHECKS, firstHopWho } from "../../../src/acquisition/index.mjs";

const te = new TextEncoder();
const MiB = 1024 * 1024;
const everything = (rows) => rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name)
  .map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);
const setup = ({ evidence = true } = {}) => {
  const b = evidence ? bucket() : null;
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  return { ...f, b, prov: f.c.provenance, state: () => [everything(f.rows), b ? [...b.held.keys()].sort() : null] };
};
const STATEMENT = "a printout the clerk handed me at the counter on 3 October";
const AT = "2026-10-09T12:00:00Z";
const ok = { bytes: te.encode("the budget memo"), statement: STATEMENT, by: "m1", at: AT };
/* a stream of `n` chunks of one buffer, recording whether it was cancelled */
const streamOf = (chunk, n) => {
  const s = { cancelled: false, sent: 0 };
  s.stream = new ReadableStream({ pull(ctl) { if (s.sent++ < n) ctl.enqueue(chunk); else ctl.close(); }, cancel() { s.cancelled = true; } }, { highWaterMark: 0 });
  return s;
};

test("R86 (fence): a by that is absent, blank or a machine identity is MEMBER_SESSION_REQUIRED, first and writing nothing; a member, the founder included, is admitted", async () => {
  const { c, state } = setup();
  const before = state();
  for (const by of [undefined, null, "", "  ", 7, "class:ai", "class:admin", "daemon", "ai", "token:member"]) {
    /* first: with every other refusal tripped too */
    const r = await c.uploadCapture({ bytes: new Uint8Array(0), statement: "", name: 5, by });
    assert.deepEqual([r.ok, r.reason, r.status], [false, "MEMBER_SESSION_REQUIRED", 403], String(by));
  }
  assert.deepEqual(state(), before, "nothing written");
  for (const by of ["m1", "member:m2", "admin"]) assert.equal((await c.uploadCapture({ ...ok, bytes: te.encode(`from ${by}`), by })).ok, true, by);
});

test("R86 R37 (C-118.10): a statement absent, not a string, blank or over 2,000 characters is UPLOAD_NO_STATEMENT with its row, after the fence and before the rest; 2,000 characters are admitted", async () => {
  const { c, state } = setup();
  const row = CAPTURE_CHECKS.UPLOAD_NO_STATEMENT;
  assert.equal(row.check, "C-118.10");
  assert.equal(UPLOAD_STATEMENT_MAX, 2000);
  const before = state();
  for (const statement of [undefined, null, 42, {}, "", " \n\t", "x".repeat(2001), "😀".repeat(2001)]) {
    const r = await c.uploadCapture({ bytes: new Uint8Array(0), statement, name: 5, by: "m1" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.status, r.maxChars],
                     [false, "UPLOAD_NO_STATEMENT", "UPLOAD_NO_STATEMENT", "C-118.10", row.translation, 400, 2000], JSON.stringify(statement)?.slice(0, 20));
  }
  assert.deepEqual(state(), before, "nothing written");
  /* characters, not bytes: 2,000 emoji are admitted */
  for (const statement of ["x".repeat(2000), "😀".repeat(2000), "a"]) assert.equal((await c.uploadCapture({ ...ok, bytes: te.encode(statement.slice(0, 9)), statement })).ok, true);
});

test("R86: a name given that is not a string or is over 300 characters is the required-argument refusal naming it, after the statement; absent or 300 characters is admitted", async () => {
  const { c, state } = setup();
  assert.equal(UPLOAD_NAME_MAX, 300);
  const before = state();
  for (const name of [5, {}, ["a"], true, "n".repeat(301)]) {
    const r = await c.uploadCapture({ bytes: new Uint8Array(0), statement: STATEMENT, name, by: "m1" });
    assert.deepEqual([r.ok, r.reason, r.argument, r.status], [false, "REQUIRED_ARGUMENT_MISSING", "name", 400], JSON.stringify(name).slice(0, 20));
  }
  assert.deepEqual(state(), before, "nothing written");
  for (const name of [undefined, null, "n".repeat(300), "minutes.pdf"]) assert.equal((await c.uploadCapture({ ...ok, bytes: te.encode(`n ${name}`), name })).ok, true, String(name));
});

test("R86 (R21's storage): with no evidence store the upload is EVIDENCE_STORAGE_NOT_CONFIGURED, after the argument refusals, before the bytes are read, writing nothing", async () => {
  const { c, state } = setup({ evidence: false });
  const before = state();
  const s = streamOf(te.encode("x"), 3);
  const r = await c.uploadCapture({ ...ok, bytes: s.stream });
  assert.deepEqual([r.ok, r.reason, r.check, r.translation, r.status],
                   [false, "EVIDENCE_STORAGE_NOT_CONFIGURED", INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED.check,
                    INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED.translation, 503]);
  assert.equal(s.sent, 0, "nothing read");
  assert.equal((await c.uploadCapture({ ...ok, statement: "" })).reason, "UPLOAD_NO_STATEMENT", "the statement before the store");
  assert.deepEqual(state(), before, "nothing written");
  assert.equal((await setup().c.uploadCapture(ok)).ok, true, "negative control: with a store");
});

test("R86 (acquisition R10): zero bytes is EMPTY and no bytes at all NO_BODY, each writing nothing; one byte is admitted", async () => {
  const { c, state } = setup();
  const before = state();
  for (const bytes of [new Uint8Array(0), new ArrayBuffer(0), streamOf(new Uint8Array(0), 2).stream, (async function* () {})()])
    assert.deepEqual([(await c.uploadCapture({ ...ok, bytes })).reason, (await c.uploadCapture({ ...ok, bytes: new Uint8Array(0) })).status], ["EMPTY", 400]);
  for (const bytes of [undefined, null, "text is not bytes", 42])
    assert.deepEqual([(await c.uploadCapture({ ...ok, bytes })).reason], ["NO_BODY"], String(bytes));
  assert.deepEqual(state(), before, "nothing written");
  const one = await c.uploadCapture({ ...ok, bytes: Uint8Array.of(7) });
  assert.deepEqual([one.ok, one.capture], [true, { sha256: sha(Uint8Array.of(7)), bytes: 1 }]);
});

test("R86 (acquisition R10): more than 256 MiB is TOO_LARGE (413) with the stream cancelled, and no receipt, actor or document; exactly 256 MiB is admitted, held in parts of 8 MiB", async () => {
  assert.equal(UPLOAD_MAX, 256 * MiB);
  const chunk = new Uint8Array(8 * MiB).fill(0x61);
  const big = setup();
  const s = streamOf(chunk, 40);
  const r = await big.c.uploadCapture({ ...ok, bytes: s.stream });
  assert.deepEqual([r.ok, r.reason, r.status, r.maxBytes, r.bytes], [false, "TOO_LARGE", 413, UPLOAD_MAX, 33 * 8 * MiB], "refused at the first chunk past the limit");
  assert.equal(s.cancelled, true, "the stream cancelled");
  assert.deepEqual(big.prov.receipts, [], "no receipt");
  assert.equal(big.rows(`SELECT count(*) n FROM capture_actors`)[0].n, 0, "no actor");
  /* negative control: exactly the limit is filed, in 32 parts of 8 MiB, each under its own digest */
  const fit = setup();
  const r2 = await fit.c.uploadCapture({ ...ok, bytes: streamOf(chunk, 32).stream });
  assert.deepEqual([r2.ok, r2.existed, r2.capture.bytes], [true, false, UPLOAD_MAX]);
  assert.equal(r2.document.parts.length, 32);
  assert.ok(r2.document.parts.every((p, i) => p.bytes === 8 * MiB && p.sha256 === sha(chunk)
    && p.file === `snapshots/upload-${r2.capture.sha256}.part${String(i).padStart(3, "0")}`));
  assert.ok(fit.b.held.has(`bio/captures/${sha(chunk)}`), "the part held under its own digest");
});

test("R86 R65 R16: an upload holds the bytes under their digest, writes one upload receipt at upload:<sha256> with by and her statement, records her as the capture's actor, and answers the document graded received, attributed to her, naming no member as its source; no bundle", async () => {
  const { c, rows, b, prov } = setup();
  const bytes = te.encode("minutes of the closed session");
  const d = sha(bytes);
  const tables = () => ({ ...rows(`SELECT (SELECT count(*) FROM bundles) b, (SELECT count(*) FROM register) r, (SELECT count(*) FROM files) f`)[0] });
  const before = tables();
  const r = await c.uploadCapture({ bytes, statement: STATEMENT, name: "minutes.pdf", by: "m1", at: AT });
  assert.deepEqual([r.ok, r.existed, r.capture], [true, false, { sha256: d, bytes: bytes.length }]);
  assert.deepEqual(r.receipt, { address: `upload:${d}`, via: "upload", retrieved: AT, observation: null });
  assert.deepEqual(prov.receipts, [{ address: `upload:${d}`, addressNorm: `upload:${d}`, captureSha: d, retrieved: AT, via: "upload",
                                     retrievalLocator: null, by: "m1", statement: STATEMENT }], "one receipt, with by and her statement");
  assert.deepEqual(Buffer.from(b.held.get(`bio/captures/${d}`)).toString(), "minutes of the closed session");
  assert.deepEqual(c.captureAccountsOf(d).actors.map((a) => [a.actor, a.at]), [["m1", AT]], "attributed to her (R69's actor)");
  const doc = r.document;
  assert.deepEqual([doc.file, doc.locator, doc.retrieved], [`snapshots/upload-${d}`, `upload:${d}`, AT], "named from the digest");
  assert.deepEqual(doc.capture, { method: "uploaded", grade: null, grade_basis: "CAPTURE_RECEIVED_NOT_FETCHED", actor_class: "member",
                                  actor: "m1", sha256: d, encoding: "binary", bytes: bytes.length });
  assert.equal("transport" in doc.capture || "content_type" in doc.capture, false, "no header, no transport invented");
  assert.deepEqual(doc.source, { kind: "uploader", receipt: { sha256: d, bytes: bytes.length, received: AT } });
  assert.ok(!JSON.stringify(doc.source).includes("m1"), "the member is never the source");
  assert.deepEqual(doc.origin_statement, { text: STATEMENT, words_of: "m1", evidence_of_truth: false });
  assert.deepEqual(doc.name_stated, { text: "minutes.pdf", words_of: "m1", evidence_of_truth: false });
  assert.deepEqual(doc.origin, { kind: "upload" });
  assert.deepEqual(doc.attestation_attempts, []);
  assert.equal("parts" in doc, false, "one part");
  assert.equal(doc.provenance_chain.length, 1);
  const hop = doc.provenance_chain[0];
  assert.deepEqual([hop.who, hop.via, hop.bound], [firstHopWho("inst", "9.9.9"), "upload", false]);
  assert.match(hop.asserts, /received from the member, not fetched/);
  assert.equal(doc.authority_state, "undetermined");
  assert.equal(typeof doc.profile, "object");
  assert.equal(doc.profile.source_content_type, null, "profiled from the bytes, no declared type");
  assert.ok(!("knocker_note" in doc) && !("contact" in doc));
  assert.deepEqual(tables(), before, "no bundle, register or file row: it writes no bundle");
  /* no name given: no name_stated */
  assert.equal("name_stated" in (await c.uploadCapture({ ...ok, bytes: te.encode("unnamed") })).document, false);
  /* the forms the bytes come in: a stream, an ArrayBuffer, an async iterable of chunks, one digest */
  const forms = [streamOf(te.encode("same"), 2).stream, te.encode("samesame").buffer, (async function* () { yield te.encode("sa"); yield te.encode("mesame"); })()];
  for (const form of forms) {
    const f = setup();
    assert.deepEqual((await f.c.uploadCapture({ ...ok, bytes: form })).capture, { sha256: sha("samesame"), bytes: 8 });
  }
});

test("R86 (provenance R15): bytes the record already holds answer existed with the held digest and no document; the receipt is written as a second sighting with this uploader's own statement; no actor and no within", async () => {
  const { c, rows, prov } = setup();
  const first = await c.uploadCapture({ ...ok, by: "m1" });
  let called = 0;
  const again = await c.uploadCapture({ ...ok, statement: "forwarded to me by a colleague", by: "m2", at: "2026-10-10T08:00:00Z",
                                        within: () => { called++; return { ok: true }; } });
  assert.deepEqual([again.ok, again.existed, again.capture, "document" in again, "within" in again, called],
                   [true, true, first.capture, false, false, 0]);
  assert.deepEqual(prov.receipts.map((x) => [x.via, x.by, x.statement, x.retrieved]),
                   [["upload", "m1", STATEMENT, AT], ["upload", "m2", "forwarded to me by a colleague", "2026-10-10T08:00:00Z"]]);
  assert.equal(rows(`SELECT observations n FROM captured_locators WHERE capture_sha = ?`, first.capture.sha256)[0].n, 2, "a second sighting of one receipt row");
  assert.deepEqual(c.captureAccountsOf(first.capture.sha256).actors.map((a) => a.actor), ["m1"], "no actor recorded for the second");
  /* held by the record's register or a receipt alone (a capture held in parts): existed, as the register answers */
  const h = setup();
  const bytes = te.encode("held elsewhere");
  h.c.provenance = provenance(h.s, { registered: [sha(bytes)] });
  assert.equal((await h.c.uploadCapture({ ...ok, bytes })).existed, true, "registered");
  const g = setup();
  g.c.provenance = provenance(g.s, { acquired: [sha(bytes)] });
  assert.equal((await g.c.uploadCapture({ ...ok, bytes })).existed, true, "acquired");
  /* negative control: bytes nowhere held are new */
  assert.equal((await setup().c.uploadCapture({ ...ok, bytes })).existed, false);
  /* a receipt that cannot be written: RECEIPT_NOT_WRITTEN, and nothing written */
  const broken = setup();
  broken.c.provenance = { ...provenance(broken.s), recordReceipt() { throw new Error("down"); } };
  const before = everything(broken.rows);
  assert.deepEqual([(await broken.c.uploadCapture(ok)).reason], ["RECEIPT_NOT_WRITTEN"]);
  assert.deepEqual(everything(broken.rows), before);
});

test("R86 (provenance R59, R62): a later fetch of the same bytes from a public address writes its own receipt beside the upload's; the upload's receipt and statement stay", async () => {
  const { c, rows } = setup();
  const up = await c.uploadCapture({ ...ok, bytes: te.encode("the posted agenda") });
  const net = network({ "https://city.example/agenda": () => new Response("the posted agenda", { headers: { "content-type": "text/plain" } }) });
  let fetched;
  try { fetched = await c.acquire({ locator: "https://city.example/agenda" }, { cls: "member", member: true, sessMember: "m2" }); }
  finally { net.restore(); }
  assert.equal(fetched.body.ok, true);
  assert.deepEqual(rows(`SELECT via, address FROM captured_locators WHERE capture_sha = ? ORDER BY via`, up.capture.sha256).map((x) => [x.via, x.address]),
                   [["direct", "https://city.example/agenda"], ["upload", `upload:${up.capture.sha256}`]]);
  assert.deepEqual(c.provenance.receipts.filter((x) => x.via === "upload").map((x) => x.statement), [STATEMENT], "the upload's statement stays");
});

/* R86 takes `within` exactly as R65 does (N380): the act and the control plane's promotion are one. */
test("R86 (R65's within): within is called inside the upload's own transaction after the receipt and the actor; its refusal, throw or promise rolls the upload back whole (UPLOAD_WITHIN_FAILED, one fixed sentence)", async () => {
  const { c, rows, s } = setup();
  s.db.exec(`CREATE TABLE promoted (sha TEXT)`);
  const seen = [];
  const r = await c.uploadCapture({ ...ok, within: (doc) => {
    seen.push({ doc, receipts: rows(`SELECT count(*) n FROM captured_locators`)[0].n, actors: rows(`SELECT count(*) n FROM capture_actors`)[0].n });
    s.sql.exec(`INSERT INTO promoted VALUES (?)`, doc.capture.sha256);
    doc.capture.actor = "someone else";
    return { ok: true, bundleId: "INFO-2026-0001-upload" };
  } });
  assert.deepEqual([r.ok, r.existed, r.within], [true, false, { ok: true, bundleId: "INFO-2026-0001-upload" }]);
  assert.deepEqual([seen.length, seen[0].receipts, seen[0].actors], [1, 1, 1]);
  assert.equal(r.document.capture.actor, "m1", "the caller's copy is its own");
  assert.equal(rows(`SELECT count(*) n FROM promoted`)[0].n, 1);
  assert.equal("within" in (await setup().c.uploadCapture(ok)), false, "no within, no within key");
  /* rolled back */
  const t = setup();
  t.s.db.exec(`CREATE TABLE promoted (sha TEXT)`);
  const write = () => t.s.sql.exec(`INSERT INTO promoted VALUES ('x')`);
  const before = everything(t.rows);
  const refused = await t.c.uploadCapture({ ...ok, within: () => { write(); return { ok: false, reason: "NO_GROUP_RECORDED", status: 409 }; } });
  assert.deepEqual([refused.ok, refused.reason, refused.status], [false, "NO_GROUP_RECORDED", 409]);
  assert.deepEqual(everything(t.rows), before, "nothing written");
  for (const within of [() => { write(); throw new Error("store fault at /srv/x.mjs"); }, async () => { write(); return { ok: true }; }]) {
    const f = await t.c.uploadCapture({ ...ok, within });
    assert.deepEqual(f, { ok: false, reason: "UPLOAD_WITHIN_FAILED", status: 500, detail: UPLOAD_WITHIN_FAILED_DETAIL });
    assert.deepEqual(everything(t.rows), before, "nothing written");
  }
  assert.equal(UPLOAD_WITHIN_FAILED_DETAIL, "the act run with the upload did not complete, so the upload was rolled back and nothing was written");
  /* then filed as ever */
  assert.deepEqual([(await t.c.uploadCapture({ ...ok, within: () => ({ ok: true }) })).existed], [false]);
});

test("R86 R77: an upload, once promoted at collected, is held for review as any capture: listed with its upload receipt as its source, under the member who brought it in", async () => {
  const { c, s } = setup();
  s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('m1', 'c', 'member', 'active', '2026-01-01', '2026-01-01')`);
  const r = await c.uploadCapture({ ...ok, within: (doc) => { register(s, doc.capture.sha256, "INFO-2026-0001"); return { ok: true }; } });
  const held = await c.heldCaptures({ viewer: "member:m1", member: "m1", now: "2026-10-10T00:00:00Z" });
  assert.deepEqual(held.held.map((x) => [x.bundle_id, x.source]),
                   [["INFO-2026-0001", { address: `upload:${r.capture.sha256}`, via: "upload", retrieved: AT }]]);
  assert.deepEqual((await c.heldCaptures({ viewer: "member:m1", member: "m2" })).held, [], "negative control: not under another member");
});
