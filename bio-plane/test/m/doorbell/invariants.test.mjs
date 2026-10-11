/* doorbell: its invariants at the module's interface: every write through record-core's `transact` (R22, a copy of
   capture R74; the doorbell's arms of capture's `services.test.mjs`, the map's §6), no place named (R23, a copy of
   capture R38; the knock and pull arm of capture's `act.test.mjs`), the contact reaching no document (R16), and the
   handler's relay of the store's own refusal through capture's `relayUnanswered` (R24, a copy of capture R64; the knock
   arm of capture's `relays.test.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket } from "./fixture.mjs";
import { knockOp } from "../../../src/doorbell/door.mjs";
import { DOORBELL_CHECKS, KNOCK_CHECKS } from "../../../src/doorbell/checks.mjs";
import { relayUnanswered } from "../../../src/capture/ops.mjs";

/* R22 (N418, K650, K655): observed at the interface: every writer, each statement it runs against the store, and
   record-core's `transact` around it. */
test("R22 (N418): every statement that changes the store, from every writer this module provides, runs inside record-core's transact", async () => {
  const b = bucket();
  const { c, core, s } = fresh({ evidence: b, env: { INSTANCE_NAME: "i" } });
  let depth = 0;
  const outside = [], inside = new Set();
  const transact = core.transact.bind(core);
  core.transact = (fn) => transact(() => { depth++; try { return fn(); } finally { depth--; } });
  const exec = s.sql.exec;
  let writer = null;
  s.sql.exec = (q, ...a) => {
    if (/^\s*(INSERT|UPDATE|DELETE|REPLACE)\b/i.test(q)) (depth > 0 ? inside.add(writer) : outside.push(`${writer}: ${q.trim().slice(0, 70)}`));
    return exec.call(s.sql, q, ...a);
  };
  const as = async (name, fn) => { writer = name; await fn(); writer = null; };
  await as("knock", () => c.knock({ content: "k1", sourceAddress: "1.1.1.1", knockerSecret: "a knocker secret of twenty-plus" }));
  await as("knockAttempt", () => c.knockAttempt({ sourceAddress: "1.1.1.2" }));
  const kid = c.inboxList(null).inbox[0].knock_id;
  await as("inboxResolve", () => c.inboxResolve({ knockId: kid, status: "discarded", by: "m1", reason: "not for us" }));
  await as("inboxResolve", () => c.inboxResolve({ knockId: kid, status: "new", by: "m1", reason: "after all" }));
  await as("pullKnock", () => c.pullKnock({ knockId: kid, by: "m1" }));
  await as("doorbellRefused", () => c.doorbellRefused({}));
  /* a rate refusal: the tally's count and the rate's own writes */
  for (let i = 0; i < 6; i++) await as("knock", () => c.knock({ content: `r${i}`, sourceAddress: "9.9.9.9" }));
  s.sql.exec = exec;
  assert.deepEqual(outside, [], "no statement changed the store outside a transaction");
  for (const w of ["knock", "knockAttempt", "inboxResolve", "pullKnock", "doorbellRefused"]) assert.ok(inside.has(w), `${w} wrote, through transact`);
});

test("R22 (N418): a write made inside a caller's transact joins it and rolls back with it; afterCommit called inside waits for the outermost commit", async () => {
  const { c, core, rows } = fresh({ evidence: bucket() });
  const k = await c.knock({ content: "joined", sourceAddress: "2.2.2.2" });
  const state = () => rows(`SELECT status, resolve_reason FROM inbox WHERE knock_id = ?`, k.knockId).map((r) => ({ ...r }));
  const before = state();
  const refused = core.transact(() => {
    assert.equal(c.inboxResolve({ knockId: k.knockId, status: "discarded", by: "m1", reason: "inside" }).ok, true);
    return { ok: false, reason: "THE_CALLER_REFUSED" };
  });
  assert.equal(refused.reason, "THE_CALLER_REFUSED");
  assert.deepEqual(state(), before, "the caller refused: the resolve rolled back with it");
  const ran = [];
  core.transact(() => {
    c.doorbellRefused({});
    core.afterCommit(() => ran.push(rows(`SELECT coalesce(sum(refused),0) n FROM doorbell_tally`)[0].n));
    assert.deepEqual(ran, [], "held until the commit");
    return { ok: true };
  });
  assert.deepEqual(ran, [1], "run after the outermost commit, the count landed");
  /* negative control: the same resolve outside any caller's transaction lands */
  assert.equal(c.inboxResolve({ knockId: k.knockId, status: "discarded", by: "m1", reason: "outside" }).ok, true);
  assert.deepEqual(state(), [{ status: "discarded", resolve_reason: "outside" }]);
});

test("R23: no place is named in this module's answers or rows' words, and a pulled knock is profiled only through the instance's profile view", async () => {
  const place = /oakland|alameda|california/i;
  for (const [code, row] of Object.entries({ ...DOORBELL_CHECKS, ...KNOCK_CHECKS })) assert.ok(!place.test(row.translation), code);
  const w = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  w.core.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:admin");
  const answers = [];
  const k = await w.c.knock({ content: "minutes of the meeting", note: "n", sourceAddress: "1.1.1.1" });
  answers.push(k, await w.c.knock({ content: "", sourceAddress: "1.1.1.1", knockerSecret: "short" }), w.c.inboxGet("KNOCK-none"),
               w.c.inboxList(null), w.c.doorbellTally({ viewer: "member:m1" }), await w.c.knockerDigestOf("a secret of twenty and more"));
  const pulled = await w.c.pullKnock({ knockId: k.knockId, by: "m1", at: "2026-09-30T10:00:00Z" });
  answers.push(pulled, w.c.knocksOf({ pseudonym: "knocker-0000-0000-0000-0000" }), w.c.pulledKnocksOf(pulled.capture.sha256));
  assert.ok(!place.test(JSON.stringify(answers)), "no answer names a place");
  assert.deepEqual(pulled.document.profile.jurisdiction_view, ["test-port-ellery"], "local vocabulary only through the instance's view");
  const none = fresh({ evidence: bucket() });
  const k2 = await none.c.knock({ content: "minutes", sourceAddress: "2.2.2.2" });
  assert.equal((await none.c.pullKnock({ knockId: k2.knockId, by: "m1" })).document.profile.jurisdiction_view, null, "no setting: no view claimed");
});

test("R16: an inbox contact reaches no capture document, receipt or log line; only the member reads answer it", async () => {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  const logs = [];
  const orig = { log: console.log, warn: console.warn, error: console.error };
  for (const k of Object.keys(orig)) console[k] = (...a) => logs.push(a.join(" "));
  try {
    const k = await f.c.knock({ content: "a tip", note: "n", contact: "tipster@example.org", knockerSecret: "a knocker secret of twenty-plus", sourceAddress: "3.3.3.3" });
    const p = await f.c.pullKnock({ knockId: k.knockId, by: "m1", within: (doc) => ({ ok: true, saw: JSON.stringify(doc).includes("tipster") }) });
    const again = await f.c.pullKnock({ knockId: k.knockId, by: "m2" });
    const reached = JSON.stringify([p, again, f.c.provenance.receipts, f.rows(`SELECT * FROM capture_actors`), f.c.knocksOf({ pseudonym: k.pseudonym }),
                                    f.c.pulledKnocksOf(p.capture.sha256), logs]);
    assert.ok(!reached.includes("tipster"), "no document, receipt, actor, pseudonym read or log line carries it");
    assert.equal(p.within.saw, false, "nor the document handed to the caller's act");
    /* negative control: the member reads answer it */
    assert.equal(f.c.inboxGet(k.knockId).item.contact, "tipster@example.org");
    assert.equal(f.c.inboxList(null).inbox[0].contact, "tipster@example.org");
  } finally { Object.assign(console, orig); }
});

/* R24 (N339, N349, K421): the door's handler relays the store's own refusal through capture's `relayUnanswered`. The
   control plane's helpers are stand-ins as its R23, R25 and R30 state them. */
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const requiredArgument = (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
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
const storeSilent = (op, correlation = undefined) =>
  json({ ok: false, reason: "STORE_DID_NOT_ANSWER", code: "STORE_DID_NOT_ANSWER", op, detail: "the store did not answer", correlation }, 502);
const storeRefusal = (out, extra = {}) => json({ ...out.reply.body, ...extra }, out.reply.status);
const CORRELATION = "0f8fad5b-d9cb-469f-a165-70867728950e";
const stub = (body, status) => ({ calls: 0, async fetch() { this.calls++; return json(body, status); } });
const knock = (store, h) => knockOp(new Request("https://p/?op=knock", { method: "POST", headers: { "cf-connecting-ip": "203.0.113.9" },
  body: JSON.stringify({ contentText: "a tip" }) }), {}, store, { ...h, requiredArgument });
const handed = { "with storeRefusal": { json, storeSilent, storeRefusal, doAnswer }, "without it": { json, storeSilent, doAnswer } };
const read = async (r) => ({ status: r.status, text: await r.text() });

test("R24 (N339): the knock's handler answers the store's own refusal (ok false below 500) with the store's status, code and sentence, never as STORE_DID_NOT_ANSWER, through storeRefusal when handed, byte for byte the same without it", async () => {
  for (const [label, h] of Object.entries(handed))
    for (const [body, status] of [[{ ok: false, reason: "BAD_JSON", error: "the body is not JSON" }, 400],
                                  [{ ok: false, reason: "UNKNOWN_OP", code: "UNKNOWN_OP", error: "unknown op: knock", translation: "t" }, 404]]) {
      const store = stub(body, status);
      const r = await read(await knock(store, h));
      assert.equal(store.calls, 1);
      assert.deepEqual([r.status, JSON.parse(r.text)], [status, body], label);
    }
  const seen = [];
  const spy = (out) => { seen.push(out.reply.status); return storeRefusal(out); };
  const body = { ok: false, reason: "BAD_JSON", error: "the body is not JSON" };
  assert.deepEqual(await read(await knock(stub(body, 400), { json, storeSilent, storeRefusal: spy, doAnswer })),
                   await read(await knock(stub(body, 400), { json, storeSilent, doAnswer })));
  assert.deepEqual(seen, [400], "through storeRefusal once");
});

test("R24 (N349): a reply that is no answer is 502 STORE_DID_NOT_ANSWER naming knock, carrying the store's correlation id when it gave one; the door answers exactly as capture's relayUnanswered does", async () => {
  for (const [label, h] of Object.entries(handed)) {
    const stack = JSON.parse((await read(await knock(stub({ ok: false, error: "Error: boom\n    at Store.fetch" }, 500), h))).text);
    assert.deepEqual([stack.reason, stack.op, "error" in stack, "correlation" in stack], ["STORE_DID_NOT_ANSWER", "knock", false, false], label);
    const withId = JSON.parse((await read(await knock(stub({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: CORRELATION }, 500), h))).text);
    assert.deepEqual([withId.reason, withId.op, withId.correlation], ["STORE_DID_NOT_ANSWER", "knock", CORRELATION], label);
    for (const bad of [{ fetch: async () => new Response("not json") }, { fetch: async () => { throw new Error("down"); } }])
      assert.equal(JSON.parse((await read(await knock(bad, h))).text).reason, "STORE_DID_NOT_ANSWER", label);
  }
  /* the door's relay and capture's relayUnanswered answer the same for the same reply */
  const out = await doAnswer(json({ ok: false, reason: "BAD_JSON" }, 400));
  assert.deepEqual(await read(relayUnanswered(out, "knock", handed["without it"])),
                   await read(await knock(stub({ ok: false, reason: "BAD_JSON" }, 400), handed["without it"])));
});
