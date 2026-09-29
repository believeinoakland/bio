/* extraction R64 (N339 widened by N349, K421, K444, K445): the two handlers that relay a store answer
   (`pdfStructureOp`, `acquireReadingOp`) answer the store's own refusal with its status, code and sentence, and only a
   reply that is no answer as the silence, carrying the store's correlation id when it gave one. The control plane's
   helpers are stand-ins that behave as its R23, R25 and R30 state them (`doAnswer`, `storeSilent`, `storeRefusal`).
   Each relay is exercised as the plane will call it (every helper handed) and as legacy-index calls it today (no
   `doAnswer`, no `storeRefusal`; `acquireReadingOp` handed no `json` either), and the answers must be the same. Each
   test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { pdfStructureOp, acquireReadingOp } from "../../../src/extraction/ops.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const requiredArgument = (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const storageAbsent = (op, error) => json({ ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED", op, error }, 503);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/* control-plane R23, R25: a reply with `ok: false` below 500 is the store's own refusal, `refused` with its `reply`;
   at 500 or above it is a silence, carrying the correlation of the store's own STORE_INTERNAL_ERROR only. */
const doAnswer = async (res) => {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  const correlation = out.reason === "STORE_INTERNAL_ERROR" && typeof out.correlation === "string" && UUID.test(out.correlation)
    ? out.correlation : undefined;
  return correlation ? { answered: false, result: undefined, correlation } : { answered: false, result: undefined };
};
/* control-plane R25, R30: the silence names the op and never echoes the store's envelope (its `error` is a stack). */
const storeSilent = (op, correlation = undefined) =>
  json({ ok: false, reason: "STORE_DID_NOT_ANSWER", code: "STORE_DID_NOT_ANSWER", op, detail: "the store did not answer", correlation }, 502);
const storeRefusal = (out, extra = {}) => json({ ...out.reply.body, ...extra }, out.reply.status);

const CORRELATION = "0f8fad5b-d9cb-469f-a165-70867728950e";
const STACK = "Error: boom\n    at Store.fetch (store.mjs:10:5)";
const SHA = "a".repeat(64);
const stub = (body, status) => ({ calls: [], async fetch(path) { this.calls.push(String(path)); return json(body, status); } });

/* Each relay, called as the control plane calls it, answering a Response. */
const RELAYS = {
  pdfstructure: (store, h) => pdfStructureOp(new URL(`https://p/?op=pdfstructure&sha256=${SHA}`), { CAPTURES: { get() {} } }, store,
    { ...h, storageAbsent, requiredArgument, cls: "member", session: true, caps: new Set(["contribute"]), viewer: "member:m1",
      author: "member:m1", storeName: "bio" }),
  acquire: async (store, h) => {
    const out = await acquireReadingOp({ ok: true, document: { capture: { sha256: SHA } } }, store, { ...h, storeName: "bio" });
    return out.response;
  },
};
/* What each relay is handed: by the plane at layer 11, and by legacy-index today (`src/index.mjs`). */
const HANDED = {
  pdfstructure: { "every helper": { json, storeSilent, storeRefusal, doAnswer }, "doAnswer without storeRefusal": { json, storeSilent, doAnswer },
                  "as legacy-index hands it today": { json, storeSilent } },
  acquire: { "every helper": { json, storeSilent, storeRefusal, doAnswer }, "doAnswer without storeRefusal": { json, storeSilent, doAnswer },
             "as legacy-index hands it today": { storeSilent } },
};
const cases = function* () {
  for (const [name, relay] of Object.entries(RELAYS))
    for (const [label, h] of Object.entries(HANDED[name])) yield [name, relay, label, h];
};
const read = async (r) => ({ status: r.status, body: await r.json() });

test("R64 (N339): each relay answers the store's own refusal (ok false below 500) with the store's status, code and sentence, never as STORE_DID_NOT_ANSWER, whatever it is handed", async () => {
  const refusals = [
    [{ ok: false, reason: "BAD_JSON", error: "the body is not JSON" }, 400],
    [{ ok: false, reason: "UNKNOWN_OP", code: "UNKNOWN_OP", error: "unknown op: pdfstructure", translation: "t" }, 404],
    [{ ok: false, error: "unknown op: extractread" }, 404],
    [{ ok: false, reason: "PAYLOAD_TOO_LARGE" }, 413],
  ];
  for (const [name, relay, label, h] of cases())
    for (const [body, status] of refusals) {
      const store = stub(body, status);
      const r = await read(await relay(store, h));
      assert.equal(store.calls.length, 1, `${name} ${label}: the store was asked once`);
      assert.equal(r.status, status, `${name} ${label}: the store's status`);
      assert.deepEqual(r.body, body, `${name} ${label}: the store's code and sentence, as the store gave them`);
    }
});

test("R64: a relay handed storeRefusal and doAnswer answers through them, once each, and its answer is the one composed without them", async () => {
  for (const [name, relay] of Object.entries(RELAYS)) {
    const refused = [], read1 = [];
    const spyRefusal = (out) => { refused.push(out.reply.status); return storeRefusal(out); };
    const spyAnswer = (res) => { read1.push(1); return doAnswer(res); };
    const body = { ok: false, reason: "BAD_JSON", error: "the body is not JSON" };
    const via = await read(await relay(stub(body, 400), { json, storeSilent, storeRefusal: spyRefusal, doAnswer: spyAnswer }));
    const own = await read(await relay(stub(body, 400), HANDED[name]["as legacy-index hands it today"]));
    assert.deepEqual(refused, [400], `${name}: the refusal went through storeRefusal once`);
    assert.deepEqual(read1, [1], `${name}: the reply was read through the plane's doAnswer`);
    assert.deepEqual(via, own, `${name}: the same answer either way`);
  }
});

test("R64 (control-plane R30): a 500 {ok: false, error} is 502 STORE_DID_NOT_ANSWER naming the op, carrying no stack and no correlation key, whatever the relay is handed", async () => {
  for (const [name, relay, label, h] of cases()) {
    const r = await read(await relay(stub({ ok: false, error: STACK }, 500), h));
    assert.equal(r.status, 502, `${name} ${label}`);
    assert.equal(r.body.reason, "STORE_DID_NOT_ANSWER");
    assert.equal(r.body.op, name, `${name} ${label}: the op named`);
    assert.ok(!JSON.stringify(r.body).includes("Store.fetch"), `${name} ${label}: no stack`);
    assert.equal("correlation" in r.body, false, `${name} ${label}: no correlation key`);
  }
});

test("R64 (N349, control-plane R25): a 500 STORE_INTERNAL_ERROR with a correlation id is 502 carrying that id; one without, or with an id that is not one, carries no correlation key", async () => {
  for (const [name, relay, label, h] of cases()) {
    const withId = await read(await relay(stub({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: CORRELATION, error: STACK }, 500), h));
    assert.deepEqual([withId.status, withId.body.reason, withId.body.correlation], [502, "STORE_DID_NOT_ANSWER", CORRELATION], `${name} ${label}`);
    assert.ok(!JSON.stringify(withId.body).includes("Store.fetch"), `${name} ${label}: nothing else of the store's envelope`);
    for (const body of [{ ok: false, reason: "STORE_INTERNAL_ERROR" }, { ok: false, reason: "STORE_INTERNAL_ERROR", correlation: "not-an-id" },
                        { ok: false, reason: "OTHER", correlation: CORRELATION }]) {
      const r = await read(await relay(stub(body, 500), h));
      assert.equal(r.status, 502, `${name} ${label}`);
      assert.equal("correlation" in r.body, false, `${name} ${label}: ${JSON.stringify(body)}`);
    }
  }
});

test("R64: a reply that is no answer at all (not JSON, an array, a thrown fetch, an answer with no result) is the silence; an answer is relayed as before", async () => {
  const silences = [
    { async fetch() { return new Response("not json", { status: 200 }); } },
    { async fetch() { return json([1, 2], 200); } },
    { fetch() { throw new Error("stub gone"); } },
    { async fetch() { return json({ ok: true }, 200); } },
  ];
  for (const [name, relay, label, h] of cases())
    for (const store of silences) {
      const r = await read(await relay(store, h));
      assert.deepEqual([r.status, r.body.reason, r.body.op], [502, "STORE_DID_NOT_ANSWER", name], `${name} ${label}`);
    }
  for (const [label, h] of Object.entries(HANDED.pdfstructure)) {
    const r = await read(await RELAYS.pdfstructure(stub({ ok: true, result: { status: 404, body: { ok: false, reason: "EVIDENCE_NOT_HELD" } } }, 200), h));
    assert.deepEqual([r.status, r.body.reason], [404, "EVIDENCE_NOT_HELD"], `pdfstructure ${label}: the Durable Object's own answer`);
  }
  for (const [label, h] of Object.entries(HANDED.acquire)) {
    const out = await acquireReadingOp({ ok: true, document: { capture: { sha256: SHA } } },
      stub({ ok: true, result: { reading: { found: false }, text_units: [{ seq: 0 }] } }, 200), { ...h, storeName: "bio" });
    assert.equal(out.response, undefined, `acquire ${label}`);
    assert.deepEqual([out.body.document.reading, out.body.document.text_units], [{ found: false }, [{ seq: 0 }]], `acquire ${label}`);
  }
});
