/* capture R99 (T51; K4234; plane R55): the door's `trace`, handed to the `acquire` op in process, reaches the store's
   acquire as the header `x-civicsmith-trace` (never in the query or the body), so the object can hold that acquire's
   timings under it (plane #44). At the module's interface through `captureOp`, the door's call, with a store stub that
   records the request it is sent. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { captureOp } from "../../../src/capture/ops.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/* control-plane R23, R25: as `relays.test.mjs` states them: a reply with `ok: false` below 500 is the store's own refusal */
const doAnswer = async (res) => {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  return { answered: false, result: undefined };
};
// fixtures-contract: answer-envelope door-helpers
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", code: "STORE_DID_NOT_ANSWER", op }, 502);
const storageAbsent = (op) => json({ ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED", op }, 503);
const env = { CAPTURES: { put() {}, get() {} } };
const TRACE = "trace_7f3a9c21";

/* a store that records each request it is sent and answers a refusal, so the arm ends before any reading */
const recordingStore = () => {
  const sent = [];
  return { sent, fetch: async (url, init = {}) => { sent.push({ url: String(url), headers: init.headers ?? {}, body: init.body }); return json({ ok: false, reason: "X", code: "X" }, 400); } };
};
const handlerParts = (extra = {}) => ({ json, storeSilent, doAnswer, storageAbsent, cls: "member", member: true, sessMember: "member:ann",
                                        storeName: "bio", readAcquired: null, ...extra });
const acquireReq = () => new Request("https://p/?op=acquire", { method: "POST", body: JSON.stringify({ locator: "https://t.example/d" }) });
const url = new URL("https://p/?op=acquire");

test("R99 (T51; K4234): the acquire op sends the door's trace given as the x-civicsmith-trace header of the store's acquire, and in neither its query nor its body", async () => {
  const store = recordingStore();
  await captureOp("acquire", acquireReq(), url, env, () => store, handlerParts({ trace: TRACE }));
  assert.equal(store.sent.length, 1);
  const { url: sentUrl, headers, body } = store.sent[0];
  assert.equal(headers["x-civicsmith-trace"], TRACE, "the door's trace reaches the store's acquire");
  assert.equal(sentUrl.includes(TRACE), false, "the trace is not in the query");
  assert.equal(String(body).includes(TRACE), false, "the trace is not in the body");
});

test("R99 (T51; K4234): with no trace handed in, or one that is not a printable string, the store's acquire carries no trace header (control)", async () => {
  for (const trace of [undefined, null, "", "has a space", "x".repeat(201), 42]) {
    const store = recordingStore();
    await captureOp("acquire", acquireReq(), url, env, () => store, handlerParts({ trace }));
    assert.equal(store.sent.length, 1, `one request for ${JSON.stringify(trace)}`);
    assert.equal(Object.hasOwn(store.sent[0].headers, "x-civicsmith-trace"), false, `no header for ${JSON.stringify(trace)}`);
  }
});
