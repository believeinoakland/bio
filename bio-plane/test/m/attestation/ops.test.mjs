/* attestation: the op=attest Worker arm (`ops.mjs`; R1–R3), moved from `test/m/provenance/ops.test.mjs` with N512 (its
   R31/R32 case), assertions unchanged: driven with a stand-in store, evidence bucket and envelope helpers, as the
   control plane hands them in. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { sha, evidence } from "./fixture.mjs";
import { attestOp, ATTEST_CHECKS } from "../../../src/attestation/index.mjs";

/* The control plane's helpers, each recording what it was asked. */
function helpers(calls = []) {
  return {
    json: (body, status = 200) => ({ body, status }),
    doAnswer: async (p) => p,
    storageAbsent: (op, error) => { calls.push(["absent", op, error]); return { absent: op }; },
    captureKey: (store, s) => `${store}/captures/${s}`,
    storeName: "bio", cls: "admin",
  };
}
const storeAnswering = (answer, seen = []) => ({ fetch: async (url) => { seen.push(String(url)); return answer(String(url)); } });

test("R1, R2: op=attest is a POST over the working bucket, asks the store's register and receipts on a miss, and keeps attest's status", async () => {
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
  /* Held whole: the authorities are asked through the network, and a token is stored under the store's key (R2). */
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
