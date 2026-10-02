/* attestation: trusted timestamps and the co-archive (R1–R3), the instance's own signed receipt (R4), every attestation
   the record holds for a capture (R7), and the one place the module makes a network call (R8). Moved from
   `test/m/provenance/attest.test.mjs` with N512 (its R31–R34, R39, R49), assertions unchanged. The network is a
   stand-in: each test says what each endpoint answers. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, sha, evidence, provDoc, infoMd, granted, net, resp, pkcs8 } from "./fixture.mjs";
import { attest, attestStatus, instanceStatement, ATTEST_CHECKS } from "../../../src/attestation/index.mjs";
import { TSA_ENDPOINTS, ARCHIVE_SAVE_BASE, ARCHIVE_SERVICE } from "../../../src/tsa.mjs";
import { PROVENANCE_ACT_CHECKS } from "../../../src/provenance/index.mjs";

test("R1: a digest must be 64 hex; a miss asks the record, which separates parts, the register alone and nothing", async () => {
  const s = sha("capture");
  const r0 = await attest({ sha256: "nope" }, {});
  assert.deepEqual([r0.ok, r0.reason, attestStatus(r0)], [false, "BAD_SHA", 400]);
  for (const bad of [s.slice(1), `${s}0`, s.replace(/^./, "g"), null, 7])
    assert.equal((await attest({ sha256: bad }, {})).reason, "BAD_SHA", String(bad));
  const n = net(() => resp(500));
  /* Held whole: attested without asking the record. */
  let asked = 0;
  const holds = (answer) => async () => { asked++; return answer; };
  const store = evidence({ [s]: "capture" });
  const whole = await attest({ sha256: s.toUpperCase() }, { head: store.head, put: store.put, fetch: n.fetch, holds: holds(null) });
  assert.equal(asked, 0);
  assert.equal(whole.reason, "NO_ATTESTATION");
  /* Not held, a receipt names it: proceeds, and says how it is held. */
  const empty = evidence({});
  const parts = await attest({ sha256: s }, { head: empty.head, put: empty.put, fetch: n.fetch, holds: holds({ acquired: true, registered: true }) });
  assert.equal(parts.reason, "NO_ATTESTATION", "it proceeded to the authorities");
  const n2 = net(() => resp(200, granted(s)));
  const partsOk = await attest({ sha256: s }, { head: empty.head, put: empty.put, fetch: n2.fetch, holds: holds({ acquired: true }) });
  assert.deepEqual([partsOk.ok, partsOk.held.form, partsOk.held.on], [true, "parts", "acquisition_receipt"]);
  /* The register alone: CAPTURE_HELD_IN_PARTS, which does not call the bytes missing. */
  const reg = await attest({ sha256: s }, { head: empty.head, put: empty.put, fetch: n.fetch, holds: holds({ acquired: false, registered: true }) });
  assert.deepEqual([reg.reason, reg.code, reg.check, reg.translation, attestStatus(reg)],
                   ["CAPTURE_HELD_IN_PARTS", "CAPTURE_HELD_IN_PARTS", "C-89.1", ATTEST_CHECKS.CAPTURE_HELD_IN_PARTS.translation, 409],
                   "the refusal carries its catalogue row");
  assert.match(reg.detail, /Nothing here says the bytes are missing/);
  /* Neither; and the record not asked. */
  const none = await attest({ sha256: s }, { head: empty.head, put: empty.put, fetch: n.fetch, holds: holds({ acquired: false, registered: false }) });
  assert.deepEqual([none.reason, attestStatus(none)], ["NO_SUCH_CAPTURE", 404]);
  assert.match(none.detail, /register holds no row/);
  const unasked = await attest({ sha256: s }, { head: empty.head, put: empty.put, fetch: n.fetch, holds: async () => { throw new Error("down"); } });
  assert.equal(unasked.reason, "NO_SUCH_CAPTURE");
  assert.match(unasked.detail, /could not be asked/);
  /* No refusal asked an authority: only the held cases reached the network. */
  assert.equal(n.calls.length, TSA_ENDPOINTS.length * 2);
});

test("R1: the record's own question, over provenance's registerHolds: a receipt proceeds, a register row alone refuses", async () => {
  const w = world();
  const a = w.cap("a");
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a] }).ok, true);
  const empty = evidence({});
  const holds = (x) => w.prov.registerHolds({ sha: x });
  const n = net(() => resp(200, granted(a.sha)));
  const reg = await attest({ sha256: a.sha }, { head: empty.head, put: empty.put, fetch: n.fetch, holds });
  assert.equal(reg.reason, "CAPTURE_HELD_IN_PARTS");
  assert.equal(n.calls.length, 0, "no authority is asked on the register alone");
  w.prov.recordReceipt({ addressNorm: "example.org/a", captureSha: a.sha, retrieved: "2026-09-27T00:00:00Z" });
  const ok = await attest({ sha256: a.sha }, { head: empty.head, put: empty.put, fetch: n.fetch, holds });
  assert.deepEqual([ok.ok, ok.held.on], [true, "acquisition_receipt"]);
  const nothing = await attest({ sha256: sha("nothing names it") }, { head: empty.head, put: empty.put, fetch: n.fetch, holds });
  assert.equal(nothing.reason, "NO_SUCH_CAPTURE");
});

test("R2: the authorities in order, stopping at the first bound token, stored under its own digest; every attempt kept", async () => {
  const s = sha("capture");
  const store = evidence({ [s]: "capture" });
  const answers = [resp(503), resp(200, granted(sha("another digest"))), resp(200, granted(s))];
  let i = 0;
  const n = net(() => answers[i++]);
  const a = await attest({ sha256: s }, { head: store.head, put: store.put, fetch: n.fetch, now: () => "2026-09-27T01:02:03.456Z" });
  assert.equal(a.ok, true);
  assert.deepEqual(n.calls.map((c) => c.url), TSA_ENDPOINTS.slice(0, 3));
  assert.deepEqual(a.attempts.map((x) => [x.service, x.ok, x.note ?? x.kind]),
                   [[TSA_ENDPOINTS[0], false, "http 503"], [TSA_ENDPOINTS[1], false, "NOT_BOUND"], [TSA_ENDPOINTS[2], true, "rfc3161"]]);
  assert.equal(a.attempts[0].attempted, "2026-09-27T01:02:03Z");
  const tokenSha = a.attestation.sha256;
  assert.equal(store.held.has(tokenSha), true, "stored under its own digest");
  assert.equal(createHash("sha256").update(store.held.get(tokenSha)).digest("hex"), tokenSha);
  assert.deepEqual([a.attestation.file, a.attestation.kind, a.attestation.over, a.attestation.service],
                   [`snapshots/timestamp-${tokenSha.slice(0, 12)}.tsr`, "rfc3161", s, TSA_ENDPOINTS[2]]);
  assert.match(a.note, /does not claim to have verified the signature/);
  /* Each request is a fresh RFC 3161 request over the digest, POSTed. */
  for (const c of n.calls) assert.equal(c.init.method, "POST");
  /* Every authority fails: NO_ATTESTATION, every attempt recorded, and a thrown fetch is an attempt, not a throw. */
  const bad = net(() => new Error("unreachable"));
  const f = await attest({ sha256: s }, { head: store.head, put: store.put, fetch: bad.fetch });
  assert.deepEqual([f.ok, f.reason, f.attempts.length, attestStatus(f)], [false, "NO_ATTESTATION", TSA_ENDPOINTS.length, 502]);
  assert.equal(f.attempts.every((x) => x.ok === false && /unreachable/.test(x.note)), true);
  assert.equal(f.attestation, undefined, "no token, no attestation");
});

test("R3: the co-archive only when asked, only for a public https locator, recording the locator or the failure", async () => {
  const s = sha("capture");
  const store = evidence({ [s]: "capture" });
  const n = net((url) => url.startsWith(ARCHIVE_SAVE_BASE)
    ? resp(200, Buffer.alloc(0), { "content-location": "/web/20260927010203/https://e.org/doc" })
    : resp(200, granted(s)));
  const a = await attest({ sha256: s, archive: true, locator: "https://e.org/doc" }, { head: store.head, put: store.put, fetch: n.fetch });
  assert.equal(n.calls.some((c) => c.url === `${ARCHIVE_SAVE_BASE}https://e.org/doc`), true);
  assert.equal(a.archive.service, ARCHIVE_SERVICE);
  assert.match(a.archive.locator, /web\/20260927010203/);
  assert.equal(a.attempts.some((x) => x.kind === "co-archive" && x.ok), true);
  /* Not asked: no archive call. */
  const n2 = net(() => resp(200, granted(s)));
  const b = await attest({ sha256: s, locator: "https://e.org/doc" }, { head: store.head, put: store.put, fetch: n2.fetch });
  assert.equal(n2.calls.some((c) => c.url.startsWith(ARCHIVE_SAVE_BASE)), false);
  assert.equal(b.archive, undefined);
  /* Asked with a locator that is not public https: recorded as a failed attempt, not asked. */
  const n3 = net(() => resp(200, granted(s)));
  const c = await attest({ sha256: s, archive: true, locator: "http://localhost/x" }, { head: store.head, put: store.put, fetch: n3.fetch });
  assert.equal(n3.calls.some((x) => x.url.startsWith(ARCHIVE_SAVE_BASE)), false);
  assert.deepEqual(c.attempts.find((x) => x.service === ARCHIVE_SERVICE), { service: ARCHIVE_SERVICE, attempted: c.attempts.find((x) => x.service === ARCHIVE_SERVICE).attempted, ok: false, note: "no public https locator to archive" });
  const n4 = net((url) => (url.startsWith(ARCHIVE_SAVE_BASE) ? resp(523) : resp(200, granted(s))));
  const d = await attest({ sha256: s, archive: true, locator: "https://e.org/doc" }, { head: store.head, put: store.put, fetch: n4.fetch });
  assert.deepEqual(d.attempts.find((x) => x.service === ARCHIVE_SERVICE).note, "http 523");
});

test("R4: the instance signs its own receipt with its own key; a receipt stays verifiable after the key is replaced", async () => {
  const k1 = pkcs8(), k2 = pkcs8();
  const w = world({ signingKey: k1, instanceName: "civic" });
  const s = sha("archived bytes");
  const r1 = await w.att.signReceipt({ captureSha: s, retrievalLocator: "https://web.archive.org/web/2026/https://e.org/d",
                                       retrieved: "2026-09-27T01:00:00Z" });
  assert.equal(r1.ok, true, JSON.stringify(r1));
  assert.equal(r1.statement, `bio-receipt/1\ninstance: civic\nfetched: 2026-09-27T01:00:00Z\n`
    + `locator: https://web.archive.org/web/2026/https://e.org/d\nsha256: ${s}\n`);
  /* The operator replaces the key: a new instance of the module over the same storage, with the new secret. */
  const p2 = w.rekey(k2);
  const r2 = await p2.signReceipt({ captureSha: s, retrievalLocator: "https://web.archive.org/web/2027/https://e.org/d",
                                    retrieved: "2027-01-01T00:00:00Z" });
  assert.notEqual(r2.key_id, r1.key_id, "one key per instance at a time, replaceable");
  const kept = await w.att.signedReceipts(s);
  assert.equal(kept.length, 2);
  assert.equal(kept.every((x) => x.verified === true), true, "each verifies against the key it was signed with");
  assert.deepEqual(kept.map((x) => x.key_id), [r1.key_id, r2.key_id]);
  /* A tampered statement does not verify. */
  w.st.sql.exec(`UPDATE signed_receipts SET statement = replace(statement, 'e.org', 'x.org') WHERE key_id = ?`, r1.key_id);
  assert.equal((await w.att.signedReceipts(s))[0].verified, false);
  /* No key bound: stated, never a silent skip. */
  const w0 = world();
  const none = await w0.att.signReceipt({ captureSha: s, retrievalLocator: "https://x", retrieved: "t" });
  assert.deepEqual([none.reason, none.check, none.translation], ["RECEIPT_NO_KEY", "C-103.7", PROVENANCE_ACT_CHECKS.RECEIPT_NO_KEY.translation]);
  assert.equal(w0.count("signed_receipts"), 0);
  const bad = await w0.att.signReceipt({ captureSha: "x" });
  assert.deepEqual([bad.reason, bad.check, bad.translation], ["RECEIPT_MALFORMED", "C-103.6", PROVENANCE_ACT_CHECKS.RECEIPT_MALFORMED.translation]);
  /* The key is a secret: no answer carries it. */
  assert.equal(JSON.stringify([r1, r2, kept]).includes(k1.slice(0, 40)), false);
});

test("R8: attest is the one caller of the network, and asks only the compiled endpoints", async () => {
  const s = sha("capture");
  const store = evidence({ [s]: "capture" });
  const n = net(() => resp(200, granted(s)));
  await attest({ sha256: s, archive: true, locator: "https://e.org/doc", endpoints: ["https://evil.example/tsa"],
                 tsa: "https://evil.example" }, { head: store.head, put: store.put, fetch: n.fetch });
  assert.ok(n.calls.length > 0);
  for (const c of n.calls) assert.ok(TSA_ENDPOINTS.includes(c.url) || c.url.startsWith(ARCHIVE_SAVE_BASE), c.url);
  /* Every other service runs with no network at all: a global fetch that fails the test if called. */
  const real = globalThis.fetch;
  let called = 0;
  globalThis.fetch = () => { called++; throw new Error("a network call outside attest"); };
  try {
    const w = world({ signingKey: pkcs8() });
    const a = w.cap("a");
    w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
    w.att.attestationsOf(a.sha);
    await w.att.signReceipt({ captureSha: a.sha, retrievalLocator: "https://web.archive.org/x", retrieved: "2026-09-27T00:00:00Z" });
    await w.att.signedReceipts(a.sha);
    await w.att.instanceKeyBound();
    await w.att.instanceSign(instanceStatement("civicos-working-on-attestation/1", a.sha));
    w.att.instanceKeys();
    w.att.migrate();
  } finally { globalThis.fetch = real; }
  assert.equal(called, 0);
});

test("R7: attestationsOf reads every attestation the capture's register entry records, in order, asking nothing", async () => {
  const w = world();
  const real = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("attestationsOf asked the network"); };
  try {
    assert.equal(w.att.attestationsOf("nope").reason, "BAD_SHA");
    assert.equal(w.att.attestationsOf(sha("x").slice(1)).reason, "BAD_SHA");
    /* The plane's own record of op=attest's answer (setup.mjs: `attestations`, `co_archive {service, locator}`),
       with the attempts that obtained them. */
    const a = w.cap("a");
    const tok = sha("token bytes");
    const plane = { attestations: [{ file: `snapshots/timestamp-${tok.slice(0, 12)}.tsr`, kind: "rfc3161", service: TSA_ENDPOINTS[1],
                                     sha256: tok, bytes: 11, over: a.sha }, { kind: "something-else", file: "x" }],
                    co_archive: { service: ARCHIVE_SERVICE, locator: "https://web.archive.org/web/2026/https://e.org/a" },
                    attestation_attempts: [
                      { service: TSA_ENDPOINTS[0], attempted: "2026-09-27T01:00:00Z", ok: false, note: "http 503" },
                      { service: TSA_ENDPOINTS[1], attempted: "2026-09-27T01:00:01Z", ok: true, kind: "rfc3161", token_sha256: tok },
                      { service: ARCHIVE_SERVICE, attempted: "2026-09-27T01:00:02Z", ok: true, kind: "co-archive",
                        archived_locator: "https://web.archive.org/web/2026/https://e.org/a" }] };
    /* The daemon era's shape (State Rules v1.5 §4.1): `timestamp {authority, token_file}` and a bare co-archive locator. */
    const b = w.cap("b");
    const daemon = { timestamp: { authority: "https://tsa.example", token_file: "snapshots/b.tsr.b64", encoding: "base64" },
                     co_archive: "https://web.archive.org/web/2025/https://e.org/b",
                     attestation_attempts: [{ service: "https://tsa.example", attempted: true, ok: true }] };
    const c = w.cap("c");
    const r = w.promoteInfo("INFO-2026-0001-x", { captures: [a, b, c],
      docs: [provDoc(a, plane), provDoc(b, daemon), provDoc(c)] });
    assert.equal(r.ok, true, JSON.stringify(r));
    const where = { bundle: "INFO-2026-0001-x", path: "data/provenance.json" };
    const pa = w.att.attestationsOf(`sha256:${a.sha.toUpperCase()}`);
    assert.deepEqual({ ...pa, note: undefined }, { ok: true, sha256: a.sha, registered: true, note: undefined, attestations: [
      { kind: "rfc3161", service: TSA_ENDPOINTS[1], file: plane.attestations[0].file, token_sha: tok, at: "2026-09-27T01:00:01Z", ...where },
      { kind: "co_archive", service: ARCHIVE_SERVICE, locator: plane.co_archive.locator, at: "2026-09-27T01:00:02Z", ...where }] });
    assert.match(pa.note, /no timestamp authority or archive was asked, and no token's signature was verified/);
    const pb = w.att.attestationsOf(b.sha);
    assert.deepEqual(pb.attestations, [
      { kind: "rfc3161", service: "https://tsa.example", file: "snapshots/b.tsr.b64", ...where },
      { kind: "co_archive", locator: daemon.co_archive, ...where }], "a boolean `attempted` gives no instant");
    /* None recorded, read from a readable register: the earned empty answer, nothing undetermined. */
    const pc = w.att.attestationsOf(c.sha);
    assert.deepEqual([pc.registered, pc.attestations, pc.undetermined], [true, [], undefined]);
    /* No home: not "none recorded", but undetermined, with why. */
    const none = w.att.attestationsOf(sha("never registered"));
    assert.deepEqual([none.ok, none.registered, none.attestations], [true, false, []]);
    assert.match(none.undetermined, /no register row names this capture/);
    /* A home whose register cannot be read: undetermined, with why. */
    const w2 = world();
    const d = w2.cap("d");
    w2.promotion.promote({ bundleId: "INFO-2026-0002-u", base: null, snapKey: "u", author: "member:alice", replay: true,
      meta: { object_type: "information" }, register: [{ sha256: d.sha, path: d.path, encoding: "utf8", bytes: 9 }],
      files: [{ path: "bundle.md", text: infoMd("INFO-2026-0002-u") }, { path: d.path, text: d.text },
              { path: "data/provenance.json", text: "{broken" }] });
    const u = w2.att.attestationsOf(d.sha);
    assert.deepEqual([u.registered, u.attestations], [true, []]);
    assert.match(u.undetermined, /cannot be read as a register/);
    /* It writes nothing. */
    const before = w.snapshot();
    w.att.attestationsOf(a.sha);
    assert.deepEqual(w.snapshot(), before);
  } finally { globalThis.fetch = real; }
});
