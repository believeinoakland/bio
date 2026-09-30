/* monitoring R49 (N339, N349, K421): the `monitor` relay answers a store refusal with its status, code and sentence
   through the plane's `storeRefusal`, and a silence with the store's correlation. What stands in: the control plane's
   `json`, `doAnswer`, `storeRefusal` and `storeSilent`, in the shapes control-plane R23, R25 and R30 state them (this
   module may not import a later one): `doAnswer` answers a JSON reply `ok: false` below 500 as `{refused: true, reply}`,
   and at 500 or above as a silence carrying a `STORE_INTERNAL_ERROR`'s correlation id; `storeSilent` answers 502
   `STORE_DID_NOT_ANSWER` with the correlation when one is given and none of the store's envelope. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { monitorOp } from "../../../src/monitoring/index.mjs";

const json = (b, s = 200) => ({ s, b: JSON.parse(JSON.stringify(b)) });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
async function doAnswer(res) {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: r.status, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  const correlation = out.reason === "STORE_INTERNAL_ERROR" && UUID.test(out.correlation || "") ? out.correlation : undefined;
  return correlation ? { answered: false, result: undefined, correlation } : { answered: false, result: undefined };
}
let refusals = 0;
const storeRefusal = (out, extra = {}) => { refusals++; return json({ ...out.reply.body, ...extra }, out.reply.status); };
const storeSilent = (op, correlation = undefined) =>
  json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op, detail: "the store did not answer", correlation }, 502);
const requiredArgument = (op, argument) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument });
const req = () => new Request("https://x/?op=monitor", { method: "POST", body: JSON.stringify({ bundleId: "INFO-2026-0001-doc" }) });
const store = (status, body) => ({ fetch: async () => new Response(JSON.stringify(body), { status }) });
const H = (extra = {}) => ({ json, storeSilent, storeRefusal, requiredArgument, doAnswer, viewer: "class:daemon", storeName: "s", cls: "daemon", ...extra });
const CORR = "0f1e2d3c-4b5a-4968-8776-a5b4c3d2e1f0";

test("R49 a store refusal (ok false below 500) behind the monitor relay is answered with the store's status, code and sentence through storeRefusal", async () => {
  refusals = 0;
  const refusal = { ok: false, reason: "BAD_JSON", detail: "the body is not JSON" };
  const r = await monitorOp(req(), store(400, refusal), H());
  assert.deepEqual(r, { s: 400, b: refusal });
  assert.equal(refusals, 1, "relayed through the plane's storeRefusal");
  /* any status below 500, relayed as the store gave it */
  const u = await monitorOp(req(), store(404, { ok: false, error: "unknown op: monitor" }), H());
  assert.deepEqual([u.s, u.b.error], [404, "unknown op: monitor"]);
  /* a caller that hands no storeRefusal (legacy-index today) gets the same answer */
  const bare = await monitorOp(req(), store(400, refusal), H({ storeRefusal: undefined }));
  assert.deepEqual(bare, { s: 400, b: refusal });
  assert.equal(refusals, 2);
});

test("R49 a 500 with no answer is 502 STORE_DID_NOT_ANSWER with no stack; a STORE_INTERNAL_ERROR's correlation id is carried, and none is no correlation key", async () => {
  const stack = { ok: false, error: "Error: boom\n    at Store.fetch (store.mjs:1:1)" };
  const a = await monitorOp(req(), store(500, stack), H());
  assert.deepEqual([a.s, a.b.reason], [502, "STORE_DID_NOT_ANSWER"]);
  assert.equal(JSON.stringify(a.b).includes("boom"), false, "the store's stack is not relayed");
  assert.equal("correlation" in a.b, false, "no correlation key when the store gave none");
  const c = await monitorOp(req(), store(500, { ok: false, reason: "STORE_INTERNAL_ERROR", correlation: CORR, error: "stack" }), H());
  assert.deepEqual([c.s, c.b.reason, c.b.correlation], [502, "STORE_DID_NOT_ANSWER", CORR]);
  assert.equal(JSON.stringify(c.b).includes("stack"), false);
  const n = await monitorOp(req(), store(500, { ok: false, reason: "STORE_INTERNAL_ERROR" }), H());
  assert.deepEqual([n.s, n.b.reason, "correlation" in n.b], [502, "STORE_DID_NOT_ANSWER", false]);
  /* a store that throws, or answers no JSON, is a silence too */
  const t = await monitorOp(req(), { fetch: async () => { throw new Error("gone"); } }, H());
  assert.deepEqual([t.s, t.b.reason, "correlation" in t.b], [502, "STORE_DID_NOT_ANSWER", false]);
  const x = await monitorOp(req(), { fetch: async () => new Response("<html>", { status: 400 }) }, H());
  assert.deepEqual([x.s, x.b.reason], [502, "STORE_DID_NOT_ANSWER"]);
});

test("R49 an answer is still relayed at its status, and an answered reply of the wrong shape stays a silence", async () => {
  const ok = await monitorOp(req(), store(200, { ok: true, result: { status: 404, body: { ok: false, reason: "ABSENT" } } }), H());
  assert.deepEqual([ok.s, ok.b.ok, ok.b.reason, ok.b.store, ok.b.tokenClass], [404, false, "ABSENT", "s", "daemon"]);
  const malformed = await monitorOp(req(), store(200, { ok: true, result: { body: {} } }), H());
  assert.deepEqual([malformed.s, malformed.b.reason, "correlation" in malformed.b], [502, "STORE_DID_NOT_ANSWER", false]);
});
