/* provenance: trusted timestamps and the co-archive (R31–R33), the instance's own signed receipt (R34), and the one
   place the module makes a network call (R39). The network is a stand-in: each test says what each endpoint answers. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, createHash } from "node:crypto";
import { world, sha, evidence } from "./fixture.mjs";
import { attest, attestStatus } from "../../../src/provenance/index.mjs";
import { TSA_ENDPOINTS, ARCHIVE_SAVE_BASE, ARCHIVE_SERVICE } from "../../../src/tsa.mjs";
import { PROVENANCE_ACT_CHECKS } from "../../../checks/bio-checks.mjs";

/* A TimeStampResp, granted, whose token carries the digest's raw bytes (what `parseTimestampResponse` binds on). */
function granted(digestHex) {
  const der = (tag, body) => {
    const n = body.length;
    const len = n < 128 ? [n] : n < 256 ? [0x81, n] : [0x82, n >> 8, n & 255];
    return Buffer.concat([Buffer.from([tag, ...len]), body]);
  };
  const status = der(0x30, der(0x02, Buffer.from([0])));
  const token = der(0x30, Buffer.concat([der(0x06, Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x07, 0x02])),
                                          der(0x04, Buffer.from(digestHex, "hex"))]));
  return der(0x30, Buffer.concat([status, token]));
}
const net = (answers) => {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    const a = answers(url);
    if (a instanceof Error) throw a;
    return a;
  };
  return { calls, fetch };
};
const resp = (status, body = Buffer.alloc(0), headers = {}) => ({
  ok: status >= 200 && status < 300, status, url: headers.url ?? "", headers: { get: (k) => headers[k.toLowerCase()] ?? null },
  arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.length) });

test("R31: a digest must be 64 hex; a miss asks the record, which separates parts, the register alone and nothing", async () => {
  const s = sha("capture");
  const r0 = await attest({ sha256: "nope" }, {});
  assert.deepEqual([r0.ok, r0.reason, attestStatus(r0)], [false, "BAD_SHA", 400]);
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
  assert.deepEqual([reg.reason, attestStatus(reg)], ["CAPTURE_HELD_IN_PARTS", 409]);
  assert.match(reg.detail, /Nothing here says the bytes are missing/);
  /* Neither; and the record not asked. */
  const none = await attest({ sha256: s }, { head: empty.head, put: empty.put, fetch: n.fetch, holds: holds({ acquired: false, registered: false }) });
  assert.deepEqual([none.reason, attestStatus(none)], ["NO_SUCH_CAPTURE", 404]);
  assert.match(none.detail, /register holds no row/);
  const unasked = await attest({ sha256: s }, { head: empty.head, put: empty.put, fetch: n.fetch, holds: async () => { throw new Error("down"); } });
  assert.equal(unasked.reason, "NO_SUCH_CAPTURE");
  assert.match(unasked.detail, /could not be asked/);
});

test("R32: the authorities in order, stopping at the first bound token, stored under its own digest; every attempt kept", async () => {
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
  /* Every authority fails: NO_ATTESTATION, every attempt recorded, and a thrown fetch is an attempt, not a throw. */
  const bad = net(() => new Error("unreachable"));
  const f = await attest({ sha256: s }, { head: store.head, put: store.put, fetch: bad.fetch });
  assert.deepEqual([f.ok, f.reason, f.attempts.length, attestStatus(f)], [false, "NO_ATTESTATION", TSA_ENDPOINTS.length, 502]);
  assert.equal(f.attempts.every((x) => x.ok === false && /unreachable/.test(x.note)), true);
});

test("R33: the co-archive only when asked, only for a public https locator, recording the locator or the failure", async () => {
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

test("R34: the instance signs its own receipt with its own key; a receipt stays verifiable after the key is replaced", async () => {
  const pkcs8 = () => generateKeyPairSync("ed25519").privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");
  const k1 = pkcs8(), k2 = pkcs8();
  const w = world({ signingKey: k1, instanceName: "civic" });
  const s = sha("archived bytes");
  const r1 = await w.prov.signReceipt({ captureSha: s, retrievalLocator: "https://web.archive.org/web/2026/https://e.org/d",
                                        retrieved: "2026-09-27T01:00:00Z" });
  assert.equal(r1.ok, true, JSON.stringify(r1));
  assert.equal(r1.statement, `bio-receipt/1\ninstance: civic\nfetched: 2026-09-27T01:00:00Z\n`
    + `locator: https://web.archive.org/web/2026/https://e.org/d\nsha256: ${s}\n`);
  /* The operator replaces the key: a new instance of the module over the same storage, with the new secret. */
  const { provenanceOf } = await import("../../../src/provenance/index.mjs");
  const host2 = { storage: w.st };
  const p2 = provenanceOf(host2, { record: w.record, membership: w.membership, promotion: { registerStep: () => ({ ok: true }) },
    signingKey: k2, instanceName: "civic" });
  const r2 = await p2.signReceipt({ captureSha: s, retrievalLocator: "https://web.archive.org/web/2027/https://e.org/d",
                                    retrieved: "2027-01-01T00:00:00Z" });
  assert.notEqual(r2.key_id, r1.key_id, "one key per instance at a time, replaceable");
  const kept = await w.prov.signedReceipts(s);
  assert.equal(kept.length, 2);
  assert.equal(kept.every((x) => x.verified === true), true, "each verifies against the key it was signed with");
  assert.deepEqual(kept.map((x) => x.key_id), [r1.key_id, r2.key_id]);
  /* A tampered statement does not verify. */
  w.st.sql.exec(`UPDATE signed_receipts SET statement = replace(statement, 'e.org', 'x.org') WHERE key_id = ?`, r1.key_id);
  assert.equal((await w.prov.signedReceipts(s))[0].verified, false);
  /* No key bound: stated, never a silent skip. */
  const w0 = world();
  const none = await w0.prov.signReceipt({ captureSha: s, retrievalLocator: "https://x", retrieved: "t" });
  assert.deepEqual([none.reason, none.check, none.translation], ["RECEIPT_NO_KEY", "C-103.7", PROVENANCE_ACT_CHECKS.RECEIPT_NO_KEY.translation]);
  assert.equal(w0.count("signed_receipts"), 0);
  const bad = await w0.prov.signReceipt({ captureSha: "x" });
  assert.deepEqual([bad.reason, bad.check, bad.translation], ["RECEIPT_MALFORMED", "C-103.6", PROVENANCE_ACT_CHECKS.RECEIPT_MALFORMED.translation]);
  /* The key is a secret: no answer carries it. */
  assert.equal(JSON.stringify([r1, r2, kept]).includes(k1.slice(0, 40)), false);
});

test("R39: attest is the one caller of the network, and asks only the compiled endpoints", async () => {
  const s = sha("capture");
  const store = evidence({ [s]: "capture" });
  const n = net(() => resp(200, granted(s)));
  await attest({ sha256: s, archive: true, locator: "https://e.org/doc", endpoints: ["https://evil.example/tsa"],
                 tsa: "https://evil.example" }, { head: store.head, put: store.put, fetch: n.fetch });
  for (const c of n.calls) assert.ok(TSA_ENDPOINTS.includes(c.url) || c.url.startsWith(ARCHIVE_SAVE_BASE), c.url);
  /* Every other service runs with no network at all: a global fetch that fails the test if called. */
  const real = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("a network call outside attest"); };
  try {
    const w = world();
    const a = w.cap("a");
    w.promoteInfo("INFO-2026-0001-a", { captures: [a] });
    w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: a.sha, retrieved: "2026-09-27T00:00:00Z" });
    w.prov.homeCensus({}); w.prov.versionChain({ addressNorm: "e.org/a", viewer: "member:x" }); w.prov.captureGrade(a.sha);
    await w.prov.registerAudit(null);
    w.prov.testify({ words: "w", observedAt: "2026-09-20", author: "member:x" });
    w.prov.provenanceRouteAssess({ bundleId: "INFO-2026-0001-a", author: "member:x", viewer: "member:x" });
  } finally { globalThis.fetch = real; }
});
