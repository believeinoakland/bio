/* provenance: the two ops' Worker arms (`ops.mjs`), moved out of legacy-index at T18: op=registeraudit (R8, R9) and
   op=attest (R31–R33), driven with a stand-in store, evidence bucket and envelope helpers, as the control plane hands
   them in. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { sha, evidence } from "./fixture.mjs";
import { registerAuditOp, attestOp } from "../../../src/provenance/ops.mjs";
import { ATTEST_CHECKS } from "../../../src/provenance/checks.mjs";

/* The control plane's helpers, each recording what it was asked. */
function helpers(calls = []) {
  return {
    json: (body, status = 200) => ({ body, status }),
    doAnswer: async (p) => p,
    storeSilent: (op, correlation) => { calls.push(["silent", op, correlation ?? null]); return { silent: op }; },
    storeRefusal: (out) => { calls.push(["refused", out.reason]); return { refused: out.reason }; },
    storageAbsent: (op, error) => { calls.push(["absent", op, error]); return { absent: op }; },
    captureKey: (store, s) => `${store}/captures/${s}`,
    storeName: "bio", cls: "admin",
  };
}
const storeAnswering = (answer, seen = []) => ({ fetch: async (url) => { seen.push(String(url)); return answer(String(url)); } });

test("R8, R9: op=registeraudit probes each unresolved row in the working bucket under the store's key, and relays silence and refusal", async () => {
  const held = sha("held whole");
  const rows = { total: 2, live: 0, superseded: 0, historical: 0, orphan: 0,
    unresolved: [{ capture_sha: held, bundle_id: "B", path: "p", bytes: Buffer.byteLength("held whole"), class: "unresolved" },
                 { capture_sha: sha("absent"), bundle_id: "B", path: "q", bytes: 6, class: "unresolved" }] };
  const bucket = evidence({ [`bio/captures/${held}`]: "held whole" });
  const seen = [];
  const out = await registerAuditOp({ CAPTURES: bucket }, storeAnswering(() => ({ answered: true, result: rows }), seen), helpers());
  assert.deepEqual(seen, ["http://do/registeraudit"]);
  assert.equal(out.status, 200);
  assert.deepEqual([out.body.ok, out.body.store, out.body.tokenClass], [true, "bio", "admin"]);
  assert.deepEqual([out.body.result.captured, out.body.result.unbacked, out.body.result.sound, out.body.result.probed],
                   [1, 1, false, true]);
  assert.deepEqual(bucket.calls.filter(([k]) => k === "head").map(([, key]) => key),
                   [`bio/captures/${held}`, `bio/captures/${sha("absent")}`], "the bucket is asked under the store's key");
  /* No bucket bound: every unresolved row unbacked, and the report says it could not probe (R9). */
  const bare = await registerAuditOp({}, storeAnswering(() => ({ answered: true, result: rows })), helpers());
  assert.deepEqual([bare.body.result.probed, bare.body.result.sound, bare.body.result.unbacked], [false, false, 2]);
  /* The store refused, was silent, or answered nothing: relayed, never a verdict. */
  const calls = [];
  assert.deepEqual(await registerAuditOp({}, storeAnswering(() => ({ refused: true, reason: "X" })), helpers(calls)), { refused: "X" });
  assert.deepEqual(await registerAuditOp({}, storeAnswering(() => ({ answered: false, correlation: "c1" })), helpers(calls)),
                   { silent: "registeraudit" });
  assert.deepEqual(await registerAuditOp({}, storeAnswering(() => ({ answered: true, result: null })), helpers(calls)),
                   { silent: "registeraudit" });
  assert.deepEqual(calls, [["refused", "X"], ["silent", "registeraudit", "c1"], ["silent", "registeraudit", null]]);
});

test("R31, R32: op=attest is a POST over the working bucket, asks the store's register and receipts on a miss, and keeps attest's status", async () => {
  const s = sha("capture");
  const post = (body) => ({ method: "POST", json: async () => body });
  /* Not a POST; no bucket bound. */
  assert.deepEqual(await attestOp({ method: "GET" }, {}, storeAnswering(() => null), helpers()),
                   { body: { ok: false, error: "attest is a POST" }, status: 405 });
  const calls = [];
  assert.deepEqual(await attestOp(post({ sha256: s }), {}, storeAnswering(() => null), helpers(calls)), { absent: "attest" });
  assert.deepEqual(calls, [["absent", "attest", "this instance has no evidence storage configured"]]);
  /* A malformed digest: attest's own refusal and status, with the store and class beside it. */
  const bucket = evidence({});
  const bad = await attestOp(post({ sha256: "nope" }), { CAPTURES: bucket }, storeAnswering(() => null), helpers());
  assert.deepEqual([bad.status, bad.body.reason, bad.body.store, bad.body.tokenClass], [400, "BAD_SHA", "bio", "admin"]);
  /* A body that does not parse is an empty request, refused the same way. */
  const unparsed = await attestOp({ method: "POST", json: async () => { throw new Error("not json"); } }, { CAPTURES: bucket },
                                  storeAnswering(() => null), helpers());
  assert.equal(unparsed.body.reason, "BAD_SHA");
  /* A miss asks the store whether its register or a receipt names the hash: the register alone refuses by C-89.1. */
  const seen = [];
  const parts = await attestOp(post({ sha256: s }), { CAPTURES: bucket },
    storeAnswering(() => ({ answered: true, result: { acquired: false, registered: true } }), seen), helpers());
  assert.deepEqual(seen, [`http://x/registerholds?sha256=${s}`]);
  assert.deepEqual([parts.status, parts.body.reason, parts.body.check, parts.body.translation],
                   [409, "CAPTURE_HELD_IN_PARTS", "C-89.1", ATTEST_CHECKS.CAPTURE_HELD_IN_PARTS.translation]);
  assert.deepEqual(bucket.calls.filter(([k]) => k === "head").map(([, key]) => key), [`bio/captures/${s}`]);
  /* A store that does not answer is a record that could not be asked. */
  const silent = await attestOp(post({ sha256: s }), { CAPTURES: bucket }, storeAnswering(() => ({ answered: false })), helpers());
  assert.deepEqual([silent.status, silent.body.reason], [404, "NO_SUCH_CAPTURE"]);
  assert.match(silent.body.detail, /could not be asked/);
  /* Held whole: the authorities are asked through the network, and a token is stored under the store's key (R32). */
  const real = globalThis.fetch;
  const asked = [];
  globalThis.fetch = async (url) => { asked.push(url); return { ok: false, status: 503 }; };
  try {
    const whole = evidence({ [`bio/captures/${s}`]: "capture" });
    const r = await attestOp(post({ sha256: s }), { CAPTURES: whole }, storeAnswering(() => null), helpers());
    assert.deepEqual([r.status, r.body.reason, r.body.attempts.length > 0], [502, "NO_ATTESTATION", true]);
    assert.equal(asked.length, r.body.attempts.length, "every authority asked is an attempt");
  } finally { globalThis.fetch = real; }
});
