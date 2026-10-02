/* capture R64 (N339, N349, K421, K444): the four handlers that relay a store answer (`linksOp`, `archiveLookupOp`,
   `acquireOp`, `knockOp`) answer the store's own refusal with its status, code and sentence, and only a reply that is no
   answer as the silence, carrying the store's correlation id when it gave one. The control plane's helpers are
   stand-ins that behave as its R23, R25 and R30 state them (`doAnswer`, `storeSilent`, `storeRefusal`); each relay is
   exercised with `storeRefusal` handed in and without it (the plane's door hands it; a caller handing only
   `{json, storeSilent, doAnswer}`, as the retired legacy-index's did, is still answered alike), and the answers must
   be the same. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { linksOp, archiveLookupOp, acquireOp, relayUnanswered } from "../../../src/capture/ops.mjs";
import { knockOp } from "../../../src/capture/doorbell.mjs";

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
const stub = (body, status) => ({ calls: 0, async fetch() { this.calls++; return json(body, status); } });

/* Each relay, called as the control plane calls it, answering a Response. */
const RELAYS = {
  links: (store, h) => linksOp(new URL("https://p/?op=links&address=https://t.example/u"), store, { ...h, viewer: "class:admin" }),
  archivelookup: (store, h) => archiveLookupOp(new Request("https://p/?op=archivelookup", { method: "POST", body: JSON.stringify({ address: "https://t.example/d" }) }),
                                               new URL("https://p/?op=archivelookup"), store, h),
  acquire: async (store, h) => (await acquireOp(new Request("https://p/?op=acquire", { method: "POST", body: JSON.stringify({ locator: "https://t.example/d" }) }),
                                                { CAPTURES: { put() {}, get() {} } }, store,
                                                { ...h, storageAbsent, cls: "member", member: true, sessMember: "m1", storeName: "bio" })).response,
  knock: (store, h) => knockOp(new Request("https://p/?op=knock", { method: "POST", headers: { "cf-connecting-ip": "203.0.113.9" },
                                                                  body: JSON.stringify({ contentText: "a tip" }) }), {}, store, { ...h, requiredArgument }),
};
const handed = { "with storeRefusal": { json, storeSilent, storeRefusal, doAnswer }, "without it": { json, storeSilent, doAnswer } };
const read = async (r) => ({ status: r.status, text: await r.text() });

test("R64 (N339): each relay answers the store's own refusal (ok false below 500) with the store's status, code and sentence, never as STORE_DID_NOT_ANSWER, whether or not storeRefusal is handed", async () => {
  const refusals = [
    [{ ok: false, reason: "BAD_JSON", error: "the body is not JSON" }, 400],
    [{ ok: false, reason: "UNKNOWN_OP", code: "UNKNOWN_OP", error: "unknown op: links", translation: "t" }, 404],
    [{ ok: false, error: "unknown op: acquire" }, 404],
  ];
  for (const [name, relay] of Object.entries(RELAYS))
    for (const [label, h] of Object.entries(handed))
      for (const [body, status] of refusals) {
        const store = stub(body, status);
        const r = await read(await relay(store, h));
        assert.equal(store.calls, 1, `${name}: the store was asked`);
        assert.equal(r.status, status, `${name} ${label}: the store's status`);
        assert.deepEqual(JSON.parse(r.text), body, `${name} ${label}: the store's code and sentence, as the store gave them`);
      }
});

test("R64: a relay handed storeRefusal answers through it, and its answer is byte for byte the one composed without it", async () => {
  for (const [name, relay] of Object.entries(RELAYS)) {
    const seen = [];
    const spy = (out) => { seen.push(out.reply.status); return storeRefusal(out); };
    const body = { ok: false, reason: "BAD_JSON", error: "the body is not JSON" };
    const via = await read(await relay(stub(body, 400), { json, storeSilent, storeRefusal: spy, doAnswer }));
    const own = await read(await relay(stub(body, 400), { json, storeSilent, doAnswer }));
    assert.deepEqual(seen, [400], `${name}: the refusal went through storeRefusal once`);
    assert.deepEqual(via, own, `${name}: the same answer either way`);
  }
});

test("R64 (N349): a reply that is no answer is 502 STORE_DID_NOT_ANSWER naming the op: a 500 with a stack carries no stack; the store's STORE_INTERNAL_ERROR carries its correlation id, and one without an id gets no correlation key", async () => {
  for (const [name, relay] of Object.entries(RELAYS))
    for (const [label, h] of Object.entries(handed)) {
      const stack = await read(await relay(stub({ ok: false, error: STACK }, 500), h));
      const sb = JSON.parse(stack.text);
      assert.deepEqual([stack.status, sb.reason, sb.op], [502, "STORE_DID_NOT_ANSWER", name], `${name} ${label}: a 500 is a silence`);
      assert.ok(!stack.text.includes("Store.fetch") && !("error" in sb), `${name} ${label}: no stack`);
      assert.equal("correlation" in sb, false, `${name} ${label}: no correlation where the store gave none`);
      const withId = JSON.parse((await read(await relay(stub({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: CORRELATION }, 500), h))).text);
      assert.deepEqual([withId.reason, withId.op, withId.correlation], ["STORE_DID_NOT_ANSWER", name, CORRELATION], `${name} ${label}: the store's correlation`);
      const noId = await read(await relay(stub({ ok: false, reason: "STORE_INTERNAL_ERROR" }, 500), h));
      assert.equal(noId.status, 502);
      assert.equal("correlation" in JSON.parse(noId.text), false, `${name} ${label}: no correlation key without an id`);
      for (const bad of [{ fetch: async () => new Response("not json", { status: 200 }) }, { fetch: async () => { throw new Error("down"); } },
                         stub({ ok: false, reason: "BAD_JSON" }, 503)]) {
        const s = await read(await relay(bad, h));
        assert.deepEqual([s.status, JSON.parse(s.text).reason], [502, "STORE_DID_NOT_ANSWER"], `${name} ${label}: no answer is a silence`);
      }
    }
});

test("R64: relayUnanswered answers null for an answer, so an answered store's result is still the relay's own to answer", async () => {
  const out = await doAnswer(json({ ok: true, result: { x: 1 } }));
  assert.equal(relayUnanswered(out, "links", { json, storeSilent, storeRefusal }), null);
  const links = await (await RELAYS.links({ fetch: async () => json({ ok: true, result: { count: 0 } }) }, handed["without it"])).json();
  assert.deepEqual(links, { ok: true, count: 0 });
});
