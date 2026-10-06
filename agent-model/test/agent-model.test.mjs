/* agent-model — its requirements, one by one, at its interface (`build/requirements/agent-model.md`).
 *
 * The module's two egresses are stood in for at their boundaries: the Messages API by a scripted global `fetch`
 * that records every request, and the `agent-runner` container by a scripted Container Durable Object binding whose
 * WebSocket speaks agent-runner's wire (its R1–R4), coded to that module's requirements until it merges (K1563 (1)).
 * Nothing here reads the module's source text. */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  modelCall, converse, segmentMeter, MODEL_FOR_MODE, MODEL_FOR_MODE_SOURCE, MODEL_ENDPOINT, RUNNER_URL,
  CONVERSATION_MAX_TURNS, USAGE_FIGURES, SEGMENT_BYTES_SOURCE, parentSystem, subsessionSystem, judgeTools,
  planJudgeTools, subsessionTools, rowPrompt, LOAD_LAYER,
} from "../src/model.mjs";

/* ------------------------------------------------------------------ the two stand-ins */

const realFetch = globalThis.fetch;
let calls;          // every global fetch: {url, init, body}
let replies;        // what the next fetches answer, in order: {status, body} | {raw} | {throws}

function json(status, body) { return { status, body }; }
function message(content, extra = {}) {
  return { id: "msg", type: "message", role: "assistant", content, stop_reason: "end_turn",
           usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 3, cache_creation_input_tokens: 2 },
           ...extra };
}
const toolUse = (id, name, input = {}) => ({ type: "tool_use", id, name, input });

beforeEach(() => {
  calls = [];
  replies = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init, body: init.body ? JSON.parse(init.body) : null });
    const r = replies.shift() ?? json(200, message([{ type: "text", text: "nothing scripted" }]));
    if (r.throws) throw new Error(r.throws);
    if (r.raw !== undefined) return new Response(r.raw, { status: r.status ?? 200 });
    return new Response(JSON.stringify(r.body), { status: r.status });
  };
});
afterEach(() => { globalThis.fetch = realFetch; });

/** A Container DO namespace whose every connection runs `script`: the nth message the module sends is answered
 *  with `script[n](msg)`'s messages (an array; `"close"` closes the socket). */
function fakeRunner(script = []) {
  const log = { urls: [], sent: [], opened: 0, closed: 0, ids: 0 };
  const stub = {
    async fetch(url, init = {}) {
      log.urls.push(String(url));
      log.upgrade = init.headers && init.headers.Upgrade;
      log.opened += 1;
      const on = { message: [], close: [], error: [] };
      let n = 0;
      const deliver = (out) => {
        for (const m of out || []) queueMicrotask(() => {
          if (m === "close") on.close.forEach((f) => f({ code: 1006 }));
          else on.message.forEach((f) => f({ data: typeof m === "string" ? m : JSON.stringify(m) }));
        });
      };
      const ws = {
        accept() {},
        addEventListener(t, f) { on[t].push(f); },
        send(text) { const msg = JSON.parse(text); log.sent.push(msg); const step = script[n]; n += 1; deliver(step ? step(msg) : []); },
        close() { log.closed += 1; },
      };
      return { status: 101, webSocket: ws };
    },
  };
  const ns = { newUniqueId() { log.ids += 1; return `id${log.ids}`; }, get() { return stub; } };
  return { ns, stub, log };
}
const end = (extra = {}) => ({ ok: true, result: "done", stop_reason: "end_turn", num_turns: 1,
  usage: { input_tokens: 7, output_tokens: 4, cache_read_input_tokens: 0, cache_creation_input_tokens: 1, total_cost_usd: 0.01 },
  ...extra });

const KEY = "sk-ant-api03-SENTINELKEY-0000";
const TOKEN = "sk-ant-oat01-SENTINELTOKEN-0000";
const APIKEY = { kind: "apikey", key: KEY };
const SUB = { kind: "subscription", token: TOKEN };
const PACK = { version: 7, resident: { rule: "RESIDENT-LAYER-MARK", disclosable: [{ layer: "law", load_when: "a law question" }] } };
const TOOLS = [
  { name: "lookup", description: "look", input_schema: { type: "object", properties: { q: { type: "string" } } } },
  { name: "answer", description: "answer", input_schema: { type: "object", properties: { v: { type: "string" } } } },
];
const BODY = { model: "claude-opus-5", max_tokens: 100, system: "SYS", messages: [{ role: "user", content: "hi" }], tools: TOOLS };
const meter = (turnsBound = 100, bytesBound = 1e9) => segmentMeter({ turnsBound, bytesBound });
function conv(over = {}) {
  return { reference: APIKEY, mode: "check", meter: meter(), system: parentSystem(PACK),
           messages: [{ role: "user", content: "STEP plan" }], tools: TOOLS, finalTool: "answer",
           onTool: async () => ({ content: "ok" }), ...over };
}
const MODES = ["check", "investigate", "extract", "plan", "ask"];

/* ------------------------------------------------------------------ R1 */

test("R1 the model per mode comes from MODEL_FOR_MODE only; the call runs under the reference given, with the pack's system prompt, within the segment bound", async () => {
  assert.ok(Object.isFrozen(MODEL_FOR_MODE));
  assert.deepEqual(Object.keys(MODEL_FOR_MODE).sort(), [...MODES].sort());
  for (const m of MODES) assert.match(MODEL_FOR_MODE[m], /^claude-/);
  assert.match(MODEL_FOR_MODE_SOURCE, /M-Q9/);
  assert.throws(() => { "use strict"; MODEL_FOR_MODE.check = "other"; });

  for (const mode of MODES) {
    /* API key: the body's model is the table's, whatever the caller passes beside it. */
    replies.push(json(200, message([toolUse("t1", "answer", { v: "x" })])));
    const got = await converse(conv({ mode, model: "claude-chosen-by-caller", id: "x" }));
    assert.deepEqual(got.answer, { v: "x" });
    const c = calls.at(-1);
    assert.equal(c.body.model, MODEL_FOR_MODE[mode]);
    assert.equal(c.init.headers["x-api-key"], KEY);
    assert.ok(c.body.system.map((b) => b.text).join("").includes("RESIDENT-LAYER-MARK"), "the pack's resident layer is sent");
    /* subscription: the conversation request's model is the table's too. */
    const r = fakeRunner([() => [{ tool_use: { id: "u1", name: "answer", input: { v: "y" } } }], () => [end()]]);
    const s = await converse(conv({ mode, reference: SUB, runner: r.ns, model: "claude-chosen-by-caller" }));
    assert.deepEqual(s.answer, { v: "y" });
    assert.equal(r.log.sent[0].model, MODEL_FOR_MODE[mode]);
    assert.ok(r.log.sent[0].system.includes("RESIDENT-LAYER-MARK"));
  }
  /* A mode the table does not hold is refused before any call; so is a key of Object's prototype. */
  for (const mode of ["investigate-all", "toString", undefined]) {
    const n = calls.length;
    const got = await converse(conv({ mode }));
    assert.equal(got.refused.type, "MODE_UNKNOWN");
    assert.equal(calls.length, n);
  }
  /* Within the segment bound: a spent meter sends nothing. */
  const spent = meter(0);
  const n = calls.length;
  assert.deepEqual((await converse(conv({ meter: spent }))).stopped, "turns");
  assert.equal(calls.length, n);
});

/* ------------------------------------------------------------------ R2 */

test("R2 the provider follows the reference's kind: apikey to MODEL_ENDPOINT with the key in x-api-key only; subscription to the runner with the token in the credential field only; unusable references and a missing runner are refused with no call", async () => {
  replies.push(json(200, message([{ type: "text", text: "a" }])));
  const r = fakeRunner([() => [end()]]);
  const a = await modelCall(APIKEY, BODY, { runner: r.ns });
  assert.ok(a.result);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, MODEL_ENDPOINT);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers["x-api-key"], KEY);
  assert.ok(!calls[0].init.body.includes(KEY), "the key is not in the body");
  assert.equal(Object.values(calls[0].init.headers).filter((v) => String(v).includes(KEY)).length, 1);
  assert.equal(r.log.opened, 0, "an API-key turn never reaches the runner");

  const s = await modelCall(SUB, BODY, { runner: r.ns });
  assert.ok(s.result);
  assert.equal(calls.length, 1, "a subscription turn makes no fetch");
  assert.equal(r.log.opened, 1);
  assert.deepEqual(r.log.urls, [RUNNER_URL]);
  assert.equal(r.log.upgrade, "websocket");
  const req = r.log.sent[0];
  assert.deepEqual(req.credential, { kind: "subscription", secret: TOKEN });
  const { credential, ...rest } = req;
  assert.ok(!JSON.stringify(rest).includes(TOKEN), "the token is in the credential field and nowhere else");
  assert.deepEqual(Object.keys(req).sort(), ["credential", "max_turns", "model", "prompt", "system", "tools"]);

  /* A stub (not a namespace) is accepted as the binding too. */
  const r2 = fakeRunner([() => [end()]]);
  assert.ok((await modelCall(SUB, BODY, { runner: r2.stub })).result);

  const bad = [undefined, null, "sk-x", {}, { kind: "other", key: "k" }, { kind: "apikey" }, { kind: "apikey", key: "" },
    { kind: "apikey", token: "t" }, { kind: "subscription" }, { kind: "subscription", token: "" },
    { kind: "subscription", key: "k" }, { kind: "apikey", key: 42 }];
  const r3 = fakeRunner([() => [end()]]);
  for (const ref of bad) {
    const m = await modelCall(ref, BODY, { runner: r3.ns });
    assert.equal(m.refused.type, "ACCOUNT_REFERENCE_UNUSABLE", JSON.stringify(ref));
    const c = await converse(conv({ reference: ref, runner: r3.ns }));
    assert.equal(c.refused.type, "ACCOUNT_REFERENCE_UNUSABLE");
  }
  for (const runner of [undefined, null]) {
    assert.equal((await modelCall(SUB, BODY, { runner })).refused.type, "RUNNER_NOT_CONFIGURED");
    assert.equal((await converse(conv({ reference: SUB, runner }))).refused.type, "RUNNER_NOT_CONFIGURED");
  }
  assert.equal((await modelCall(SUB, BODY)).refused.type, "RUNNER_NOT_CONFIGURED");
  assert.equal(calls.length, 1);
  assert.equal(r3.log.opened, 0);
});

/* ------------------------------------------------------------------ R3 */

test("R3 never throws: a throw or a non-JSON body is silent (detail ≤ 200); a non-200 is refused with status, type and message ≤ 300; a 429 is not retried; stop_reason refusal is refused type refusal; the runner's failures alike", async () => {
  replies.push({ throws: "x".repeat(1000) });
  const t = await modelCall(APIKEY, BODY);
  assert.deepEqual(Object.keys(t), ["silent"]);
  assert.equal(t.silent.detail.length, 200);

  replies.push({ raw: "<html>gateway</html>", status: 502 });
  const nj = await modelCall(APIKEY, BODY);
  assert.ok(nj.silent && !nj.refused && !nj.result);
  assert.ok(nj.silent.detail.length <= 200 && nj.silent.detail.includes("502"));

  replies.push(json(400, { type: "error", error: { type: "invalid_request_error", message: "m".repeat(900) } }));
  const r400 = await modelCall(APIKEY, BODY);
  assert.equal(r400.refused.status, 400);
  assert.equal(r400.refused.type, "invalid_request_error");
  assert.equal(r400.refused.message.length, 300);

  for (const type of ["rate_limit_error", "enforced_spend_limit_reached"]) {
    const n = calls.length;
    replies.push(json(429, { type: "error", error: { type, message: "slow down" } }));
    replies.push(json(200, message([{ type: "text", text: "would be a retry" }])));
    const r = await modelCall(APIKEY, BODY);
    assert.deepEqual([r.refused.status, r.refused.type, r.refused.message], [429, type, "slow down"]);
    assert.equal(calls.length, n + 1, "never retried here");
    replies.length = 0;
    /* In a conversation a 429 ends it the same way, after one request. */
    replies.push(json(429, { type: "error", error: { type, message: "slow down" } }));
    const c = await converse(conv());
    assert.equal(c.refused.status, 429);
    assert.equal(calls.length, n + 2);
  }

  replies.push(json(200, message([], { stop_reason: "refusal", stop_details: { explanation: "e".repeat(500) } })));
  const ref = await modelCall(APIKEY, BODY);
  assert.deepEqual([ref.refused.status, ref.refused.type, ref.refused.message.length], [200, "refusal", 300]);

  /* Inputs a caller should never send still never throw. */
  for (const req of [null, undefined, "body"]) assert.equal((await modelCall(APIKEY, req)).refused.type, "REQUEST_UNUSABLE");
  const cyclic = { ...BODY }; cyclic.self = cyclic;
  assert.ok((await modelCall(APIKEY, cyclic)).silent);

  /* The runner: a binding that throws, an upgrade refused, a dropped socket, a non-JSON frame, an error, a refusal. */
  const throwing = { get() { throw new Error("no such binding"); }, newUniqueId() { return "x"; } };
  assert.ok((await modelCall(SUB, BODY, { runner: throwing })).silent);
  const refusing = { fetch: async () => new Response("no", { status: 503 }) };
  const up = await modelCall(SUB, BODY, { runner: refusing });
  assert.deepEqual([up.refused.status, up.refused.type], [503, "RUNNER_REFUSED"]);
  assert.ok((await modelCall(SUB, BODY, { runner: fakeRunner([() => ["close"]]).ns })).silent);
  assert.ok((await modelCall(SUB, BODY, { runner: fakeRunner([() => ["not json"]]).ns })).silent);
  const sdk = await modelCall(SUB, BODY, { runner: fakeRunner([() => [{ ok: false, code: "SDK_ERROR", detail: "d".repeat(900) }]]).ns });
  assert.deepEqual([sdk.refused.type, sdk.refused.message.length], ["SDK_ERROR", 300]);
  const sref = await modelCall(SUB, BODY, { runner: fakeRunner([() => [end({ stop_reason: "refusal", result: "no" })]]).ns });
  assert.equal(sref.refused.type, "refusal");
  const sc = await converse(conv({ reference: SUB, runner: fakeRunner([() => [{ ok: false, code: "SDK_ERROR", detail: "x" }]]).ns }));
  assert.equal(sc.refused.type, "SDK_ERROR");
  assert.ok((await converse(conv({ reference: SUB, runner: fakeRunner([() => ["close"]]).ns }))).silent);
});

/* ------------------------------------------------------------------ R4 */

test("R4 on the apikey path every request marks the system prompt (with the pack's resident layer), the tool definitions and the transcript cacheable", async () => {
  const check = (body) => {
    const sys = body.system;
    assert.ok(Array.isArray(sys) && sys.length >= 1);
    assert.deepEqual(sys.at(-1).cache_control, { type: "ephemeral" });
    assert.ok(sys.map((b) => b.text).join("").includes("RESIDENT-LAYER-MARK"));
    assert.deepEqual(body.tools.at(-1).cache_control, { type: "ephemeral" });
    assert.deepEqual(body.tools.slice(0, -1).map((t) => t.cache_control), body.tools.slice(0, -1).map(() => undefined));
    const last = body.messages.at(-1);
    assert.deepEqual(last.content.at(-1).cache_control, { type: "ephemeral" });
    const marks = JSON.stringify(body).split('"cache_control"').length - 1;
    assert.ok(marks <= 4, "within the API's four breakpoints");
  };
  replies.push(json(200, message([{ type: "text", text: "a" }])));
  const body = { ...BODY, system: parentSystem(PACK) };
  const before = JSON.stringify(body);
  await modelCall(APIKEY, body);
  check(calls[0].body);
  assert.equal(JSON.stringify(body), before, "the caller's request is not changed");

  /* Every request of a conversation, the first and the later ones; system given as blocks is marked too. */
  replies.push(json(200, message([toolUse("a", "lookup", { q: "1" })])));
  replies.push(json(200, message([toolUse("b", "answer", { v: "z" })])));
  const messages = [{ role: "user", content: "row" }];
  await converse(conv({ messages }));
  check(calls[1].body);
  check(calls[2].body);
  assert.ok(messages.every((m) => !JSON.stringify(m).includes("cache_control")), "the kept transcript carries no marks");
  replies.push(json(200, message([toolUse("c", "answer", {})])));
  await converse(conv({ system: [{ type: "text", text: "A" }, { type: "text", text: "RESIDENT-LAYER-MARK" }] }));
  check(calls[3].body);
  assert.equal(calls[3].body.system[0].cache_control, undefined);
});

/* ------------------------------------------------------------------ R5 */

test("R5 every outcome that reached the provider carries usage with the five figures on both paths; an unstated figure is null, never 0; total_cost_usd only where stated", async () => {
  const five = (u) => assert.deepEqual(Object.keys(u).sort(), [...USAGE_FIGURES].sort());
  assert.deepEqual([...USAGE_FIGURES].sort(), ["cache_creation_input_tokens", "cache_read_input_tokens", "input_tokens",
    "output_tokens", "total_cost_usd"]);
  replies.push(json(200, message([{ type: "text", text: "a" }])));
  const a = await modelCall(APIKEY, BODY);
  five(a.usage);
  assert.deepEqual(a.usage, { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 3, cache_creation_input_tokens: 2,
                              total_cost_usd: null });
  replies.push(json(200, message([{ type: "text", text: "a" }], { usage: { input_tokens: 0, output_tokens: 9 } })));
  const b = await modelCall(APIKEY, BODY);
  assert.deepEqual(b.usage, { input_tokens: 0, output_tokens: 9, cache_read_input_tokens: null, cache_creation_input_tokens: null,
                              total_cost_usd: null });
  replies.push(json(400, { type: "error", error: { type: "invalid_request_error", message: "no" } }));
  const c = await modelCall(APIKEY, BODY);
  five(c.usage);
  assert.ok(Object.values(c.usage).every((v) => v === null));
  replies.push(json(200, message([], { stop_reason: "refusal", usage: { input_tokens: 4, output_tokens: 1 } })));
  assert.equal((await modelCall(APIKEY, BODY)).usage.input_tokens, 4);
  replies.push({ raw: "nope", status: 500 });
  five((await modelCall(APIKEY, BODY)).usage);

  /* subscription: the runner's figures as it states them, cost included; unstated ones null. */
  const s = await modelCall(SUB, BODY, { runner: fakeRunner([() => [end()]]).ns });
  assert.deepEqual(s.usage, { input_tokens: 7, output_tokens: 4, cache_read_input_tokens: 0, cache_creation_input_tokens: 1,
                              total_cost_usd: 0.01 });
  const s2 = await modelCall(SUB, BODY, { runner: fakeRunner([() => [end({ usage: { input_tokens: 2, total_cost_usd: "1" } })]]).ns });
  assert.deepEqual(s2.usage, { input_tokens: 2, output_tokens: null, cache_read_input_tokens: null,
                               cache_creation_input_tokens: null, total_cost_usd: null });
  const s3 = await modelCall(SUB, BODY, { runner: fakeRunner([() => [{ ok: false, code: "SDK_ERROR", detail: "x" }]]).ns });
  five(s3.usage);
  /* An outcome that never reached the provider carries none. */
  assert.equal((await modelCall(undefined, BODY)).usage, undefined);
  replies.push({ throws: "offline" });
  assert.equal((await modelCall(APIKEY, BODY)).usage, undefined);
});

/* ------------------------------------------------------------------ R6 */

test("R6 a conversation ends on the final tool, on stopped turns or bytes before sending, exhausted after maxTurns (12 by default), or a silent or refused turn; every tool call gets a result; usage sums with null kept", async () => {
  /* The final tool, after one tool round; a second call in the final turn still gets a result. */
  replies.push(json(200, message([toolUse("a", "lookup", { q: "1" }), toolUse("b", "lookup", { q: "2" })])));
  replies.push(json(200, message([toolUse("c", "lookup", { q: "3" }), toolUse("d", "answer", { v: "done" })])));
  const performed = [];
  const messages = [{ role: "user", content: "row" }];
  const m = meter();
  const got = await converse(conv({ messages, meter: m, onTool: async (name, input) => { performed.push([name, input]); return { content: { n: input.q } }; } }));
  assert.deepEqual(got.answer, { v: "done" });
  assert.deepEqual(performed, [["lookup", { q: "1" }], ["lookup", { q: "2" }]]);
  assert.deepEqual(got.usage, { input_tokens: 20, output_tokens: 10, cache_read_input_tokens: 6, cache_creation_input_tokens: 4,
                                total_cost_usd: null });
  assert.equal(m.turns, 2);
  assert.equal(m.bytes, calls[0].init.body.length + calls[1].init.body.length);
  const ids = (role, type) => messages.filter((x) => x.role === role && Array.isArray(x.content))
    .flatMap((x) => x.content.filter((b) => b.type === type).map((b) => b.type === "tool_use" ? b.id : b.tool_use_id));
  assert.deepEqual(ids("assistant", "tool_use"), ids("user", "tool_result"), "every tool call has its result");
  assert.deepEqual(JSON.parse(messages[2].content[0].content), { n: "1" });
  assert.equal(calls[1].body.messages.length, 3, "the tool results went back to the model");

  /* null kept in the sum. */
  replies.push(json(200, message([toolUse("a", "lookup")], { usage: { input_tokens: 1 } })));
  replies.push(json(200, message([toolUse("b", "answer")])));
  const nul = await converse(conv());
  assert.equal(nul.usage.input_tokens, 11);
  assert.equal(nul.usage.output_tokens, null);

  /* stopped: turns, before sending. */
  const mt = meter(1);
  replies.push(json(200, message([toolUse("a", "lookup")])));
  let n = calls.length;
  const st = await converse(conv({ meter: mt }));
  assert.equal(st.stopped, "turns");
  assert.equal(mt.stopped, "turns");
  assert.equal(calls.length, n + 1);
  assert.equal(st.usage.input_tokens, 10, "what the segment spent is still reported");

  /* stopped: bytes, counted as the serialized request's length, before sending. */
  const mb = meter(100, 50);
  n = calls.length;
  const sb = await converse(conv({ meter: mb }));
  assert.equal(sb.stopped, "bytes");
  assert.deepEqual([mb.bytes, mb.turns, mb.stopped, calls.length], [0, 0, "bytes", n]);
  replies.length = 0;
  replies.push(json(200, message([toolUse("a", "lookup")])));
  const probe = meter();
  await converse(conv({ meter: probe, maxTurns: 1 }));
  const first = probe.bytes;
  const exact = meter(100, first);
  replies.push(json(200, message([toolUse("a", "answer", { v: 1 })])));
  assert.deepEqual((await converse(conv({ meter: exact }))).answer, { v: 1 }, "a request exactly at the bound is sent");

  /* exhausted: the default 12, and a given maxTurns; a model that only talks is asked again. */
  replies.length = 0;
  n = calls.length;
  for (let i = 0; i < 20; i += 1) replies.push(json(200, message([{ type: "text", text: "thinking" }])));
  const ex = await converse(conv());
  assert.equal(CONVERSATION_MAX_TURNS, 12);
  assert.equal(ex.exhausted, true);
  assert.equal(calls.length, n + 12);
  assert.equal(ex.usage.input_tokens, 120);
  assert.match(calls.at(-1).body.messages.at(-1).content.at(-1).text, /Answer by calling the `answer` tool/);
  replies.length = 0;
  n = calls.length;
  for (let i = 0; i < 5; i += 1) replies.push(json(200, message([toolUse(`t${i}`, "lookup")])));
  assert.equal((await converse(conv({ maxTurns: 3 }))).exhausted, true);
  assert.equal(calls.length, n + 3);
  replies.length = 0;

  /* silent and refused end it. */
  replies.push({ throws: "down" });
  assert.ok((await converse(conv())).silent);
  replies.push(json(200, message([toolUse("a", "lookup")])));
  replies.push(json(500, { type: "error", error: { type: "api_error", message: "x" } }));
  const rf = await converse(conv());
  assert.equal(rf.refused.status, 500);
  assert.equal(rf.usage.input_tokens, null, "the refused turn stated no usage, so the sum is null");

  /* onTool may halt the conversation with its own outcome. */
  replies.push(json(200, message([toolUse("a", "lookup")])));
  assert.deepEqual(await converse(conv({ onTool: async () => ({ halt: { planeSilent: { detail: "p" } } }) })),
                   { planeSilent: { detail: "p" } });
});

/* ------------------------------------------------------------------ R7 */

test("R7 on the subscription path only the named tools are offered, each relayed call is performed by onTool with its result sent back on the same connection, and R6's endings hold", async () => {
  const performed = [];
  const r = fakeRunner([
    () => [{ tool_use: { id: "u1", name: "lookup", input: { q: "a" } } }],
    () => [{ tool_use: { id: "u2", name: "Bash", input: { command: "ls" } } }],
    () => [{ tool_use: { id: "u3", name: "answer", input: { v: "fin" } } }],
    () => [end()],
  ]);
  const messages = [{ role: "user", content: "row" }];
  const m = meter();
  const got = await converse(conv({ reference: SUB, runner: r.ns, messages, meter: m,
    onTool: async (name, input) => { performed.push([name, input]); return { content: { found: input.q } }; } }));
  assert.deepEqual(got.answer, { v: "fin" });
  assert.deepEqual(performed, [["lookup", { q: "a" }]], "only an offered tool is performed, and only by onTool");
  assert.equal(r.log.opened, 1, "one connection for the conversation");
  assert.deepEqual(r.log.sent[0].tools.map((t) => t.name), ["lookup", "answer"]);
  assert.equal(r.log.sent[0].max_turns, 12);
  assert.ok(r.log.sent[0].prompt.includes("row"));
  assert.deepEqual(r.log.sent[1], { tool_result: { id: "u1", content: JSON.stringify({ found: "a" }) } });
  assert.equal(r.log.sent[2].tool_result.id, "u2");
  assert.equal(r.log.sent[2].tool_result.is_error, true);
  assert.deepEqual(r.log.sent[3], { tool_result: { id: "u3", content: "received" } });
  assert.equal(r.log.closed, 1);
  assert.deepEqual(got.usage, end().usage);
  assert.equal(m.turns, 4);
  assert.equal(m.bytes, r.log.sent.reduce((s, x) => s + JSON.stringify(x).length, 0));
  /* The transcript is kept in the Messages API's shape, every call with its result. */
  const uses = messages.filter((x) => x.role === "assistant").flatMap((x) => x.content.map((b) => b.id));
  const results = messages.filter((x) => Array.isArray(x.content) && x.role === "user").flatMap((x) => x.content.map((b) => b.tool_use_id));
  assert.deepEqual(uses, ["u1", "u2", "u3"]);
  assert.deepEqual(results, uses);

  /* An error result from onTool is relayed as an error. */
  const re = fakeRunner([() => [{ tool_use: { id: "e1", name: "lookup", input: {} } }], () => [end()], () => [end()]]);
  await converse(conv({ reference: SUB, runner: re.ns, maxTurns: 2, onTool: async () => ({ content: "no", error: true }) }));
  assert.deepEqual(re.log.sent[1], { tool_result: { id: "e1", content: JSON.stringify("no"), is_error: true } });

  /* Endings: bytes before sending a result; turns; the runner's MAX_TURNS is exhausted; a model that ends without
     answering is asked again in a fresh conversation, up to maxTurns. */
  const rb = fakeRunner([() => [{ tool_use: { id: "b1", name: "lookup", input: { q: "x".repeat(500) } } }]]);
  const first = JSON.stringify({ credential: { kind: "subscription", secret: TOKEN } }).length;
  const mb = meter(100, 2000);
  const sb = await converse(conv({ reference: SUB, runner: rb.ns, meter: mb, onTool: async () => ({ content: "y".repeat(3000) }) }));
  assert.equal(sb.stopped, "bytes");
  assert.equal(rb.log.sent.length, 1, "the result that would pass the bound was not sent");
  assert.ok(first > 0 && rb.log.closed === 1);
  assert.equal(sb.usage.input_tokens, null, "the closed conversation stated no usage");
  const rt = fakeRunner([() => [{ tool_use: { id: "t1", name: "lookup", input: {} } }]]);
  assert.equal((await converse(conv({ reference: SUB, runner: rt.ns, meter: meter(1) }))).stopped, "turns");
  const mt0 = fakeRunner();
  assert.equal((await converse(conv({ reference: SUB, runner: mt0.ns, meter: meter(0) }))).stopped, "turns");
  assert.equal(mt0.log.opened, 0);
  const rx = fakeRunner([() => [{ ok: false, code: "MAX_TURNS", detail: "limit" }]]);
  assert.equal((await converse(conv({ reference: SUB, runner: rx.ns }))).exhausted, true);
  const talk = fakeRunner([() => [end({ result: "I think" })], () => [end({ result: "still" })]]);
  const msgs = [{ role: "user", content: "row" }];
  const tk = await converse(conv({ reference: SUB, runner: talk.ns, maxTurns: 2, messages: msgs }));
  assert.equal(tk.exhausted, true);
  assert.equal(talk.log.opened, 2);
  assert.ok(talk.log.sent[1].prompt.includes("I think") && talk.log.sent[1].prompt.includes("Answer by calling the `answer` tool"));
  assert.equal(talk.log.sent[1].max_turns, 1);
  assert.equal(tk.usage.input_tokens, 14);
  const lim = fakeRunner([() => [{ tool_use: { id: "l1", name: "lookup", input: {} } }]]);
  assert.equal((await converse(conv({ reference: SUB, runner: lim.ns, maxTurns: 1 }))).exhausted, true);
  /* A halt from onTool closes the connection. */
  const rh = fakeRunner([() => [{ tool_use: { id: "h1", name: "lookup", input: {} } }]]);
  assert.deepEqual(await converse(conv({ reference: SUB, runner: rh.ns, onTool: async () => ({ halt: { planeSilent: { detail: "p" } } }) })),
                   { planeSilent: { detail: "p" } });
  assert.equal(rh.log.closed, 1);
});

/* ------------------------------------------------------------------ R8 */

test("R8 a reference's secret is in no returned value, transcript or console output, even when the provider echoes it; a second call without a reference makes no call", async () => {
  const out = [];
  const saved = { log: console.log, error: console.error, warn: console.warn, info: console.info, debug: console.debug,
                  write: process.stdout.write, ewrite: process.stderr.write };
  for (const k of ["log", "error", "warn", "info", "debug"]) console[k] = (...a) => out.push(a.map(String).join(" "));
  process.stdout.write = (s, ...r) => { out.push(String(s)); return true; };
  process.stderr.write = (s, ...r) => { out.push(String(s)); return true; };
  const returned = [];
  try {
    replies.push({ throws: `connect failed for ${KEY}` });
    returned.push(await modelCall(APIKEY, BODY));
    replies.push(json(401, { type: "error", error: { type: `bad ${KEY}`, message: `invalid x-api-key ${KEY}` } }));
    returned.push(await modelCall(APIKEY, BODY));
    replies.push(json(200, message([], { stop_reason: "refusal", stop_details: { explanation: KEY } })));
    returned.push(await modelCall(APIKEY, BODY));
    replies.push(json(200, message([toolUse("a", "lookup")])));
    replies.push(json(200, message([toolUse("b", "answer", { v: 1 })])));
    const messages = [{ role: "user", content: "row" }];
    const m = meter();
    returned.push(await converse(conv({ messages, meter: m })));
    returned.push(messages, m);
    for (const script of [
      [() => [{ ok: false, code: "SDK_ERROR", detail: `token ${TOKEN} rejected` }]],
      [() => [end({ stop_reason: "refusal", result: TOKEN })]],
      [() => [{ tool_use: { id: "x", name: "answer", input: {} } }], () => [end()]],
      [() => ["close"]],
    ]) {
      const msgs = [{ role: "user", content: "row" }];
      returned.push(await converse(conv({ reference: SUB, runner: fakeRunner(script).ns, messages: msgs })), msgs);
      returned.push(await modelCall(SUB, BODY, { runner: fakeRunner(script).ns }));
    }
    returned.push(await modelCall(SUB, BODY, { runner: { get() { throw new Error(`binding ${TOKEN}`); }, newUniqueId() { return 1; } } }));
    returned.push(await modelCall(SUB, BODY, { runner: { fetch: async () => { throw new Error(TOKEN); } } }));
    /* A second call without a reference makes no call: nothing from the first was kept. */
    const n = calls.length;
    const r = fakeRunner([() => [end()]]);
    returned.push(await modelCall(undefined, BODY, { runner: r.ns }));
    returned.push(await converse(conv({ reference: undefined, runner: r.ns })));
    assert.equal(calls.length, n);
    assert.equal(r.log.opened, 0);
  } finally {
    Object.assign(console, { log: saved.log, error: saved.error, warn: saved.warn, info: saved.info, debug: saved.debug });
    process.stdout.write = saved.write;
    process.stderr.write = saved.ewrite;
  }
  const text = JSON.stringify(returned) + out.join("\n");
  assert.ok(returned.length > 10);
  assert.ok(!text.includes(KEY), "the key is nowhere returned or printed");
  assert.ok(!text.includes(TOKEN), "the token is nowhere returned or printed");
  assert.ok(!text.includes("SENTINEL"));
});

/* ------------------------------------------------------------------ R9 */

test("R9 it reads no environment variable or binding for a credential: with keys in env and no reference every call is refused and nothing is sent", async () => {
  const names = ["INSTANCE_CLAUDE_TOKEN", "ANTHROPIC_API_KEY", "CLAUDE_CODE_OAUTH_TOKEN", "CLAUDE_TOKEN", "MODEL_API_KEY"];
  const saved = Object.fromEntries(names.map((k) => [k, process.env[k]]));
  const env = Object.fromEntries(names.map((k) => [k, "sk-ant-env-0000"]));
  Object.assign(process.env, env);
  globalThis.env = env;
  const r = fakeRunner([() => [end()]]);
  try {
    for (const ref of [undefined, null, {}, { kind: "apikey" }, { kind: "subscription" }]) {
      assert.equal((await modelCall(ref, BODY, { runner: r.ns, env })).refused.type, "ACCOUNT_REFERENCE_UNUSABLE");
      assert.equal((await converse(conv({ reference: ref, runner: r.ns, env }))).refused.type, "ACCOUNT_REFERENCE_UNUSABLE");
    }
    assert.equal(calls.length, 0);
    assert.equal(r.log.opened, 0);
  } finally {
    for (const k of names) if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    delete globalThis.env;
  }
});

/* ------------------------------------------------------------------ R10 */

test("R10 it reaches no address but MODEL_ENDPOINT and the runner binding, and names no place in its behaviour or outward text", async () => {
  replies.push(json(200, message([toolUse("a", "lookup")])));
  replies.push(json(400, { type: "error", error: { type: "x", message: "y" } }));
  const outward = [];
  outward.push(await converse(conv()));
  outward.push(await modelCall(APIKEY, BODY));
  const r = fakeRunner([() => [{ tool_use: { id: "u", name: "answer", input: {} } }], () => [end()]]);
  outward.push(await converse(conv({ reference: SUB, runner: r.ns })));
  outward.push(await modelCall(undefined, BODY), await modelCall(SUB, BODY), await converse(conv({ mode: "nope" })),
               await modelCall(APIKEY, null), await modelCall(SUB, BODY, { runner: { fetch: async () => new Response("", { status: 500 }) } }));
  assert.ok(calls.length >= 3);
  assert.ok(calls.every((c) => c.url === MODEL_ENDPOINT), "every fetch is to MODEL_ENDPOINT");
  assert.equal(MODEL_ENDPOINT, "https://api.anthropic.com/v1/messages");
  assert.ok(r.log.urls.every((u) => u === RUNNER_URL), "the runner only through its binding");
  const contract = { level: "web", scope: ["meaningrows"], returns: { states: ["PRESENT"] } };
  outward.push(MODEL_FOR_MODE_SOURCE, SEGMENT_BYTES_SOURCE, parentSystem(PACK), subsessionSystem(PACK, contract),
               judgeTools(["web"]), planJudgeTools(["title"]), subsessionTools(contract), rowPrompt("plan", { does: "d", judged: "j" }, {}),
               LOAD_LAYER(["law"]), r.log.sent);
  const text = JSON.stringify(outward);
  assert.doesNotMatch(text, /oakland|alameda|california|san francisco|berkeley/i);
});
