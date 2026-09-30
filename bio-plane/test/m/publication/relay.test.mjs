/* publication — R48 (N339, N349; K421, K444): every relay in the Worker half answers the store's own refusal with the
   store's status, code and sentence, and only a reply that is no answer as `STORE_DID_NOT_ANSWER`, carrying the store's
   correlation id when it gave one. The plane's helpers are bound as `control-plane` R23 and R25 state them (its
   `doAnswer`, `storeRefusal` and `storeSilent`), and a stub store answers each relay's read in turn. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";

class StoreSilent extends Error { constructor(op) { super(op); this.op = op; } }
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
/* control-plane R23 (K421) and R25 (N333), as it states them. */
async function doAnswer(res) {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  const correlation = out.reason === "STORE_INTERNAL_ERROR" && typeof out.correlation === "string" && UUID.test(out.correlation)
    ? out.correlation : undefined;
  return correlation ? { answered: false, result: undefined, correlation } : { answered: false, result: undefined };
}
const storeRefusal = (out, extra = {}) => json({ ...out.reply.body, ...extra }, out.reply.status);
const storeSilent = (op, correlation = undefined) =>
  json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op, detail: "the store did not answer", correlation }, 502);
const PLANE = { json, doAnswer, storeSilent, StoreSilent, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER",
                STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
                requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }) };

const SHA = "a".repeat(64), BODY_SHA = "b".repeat(64);
const CORRELATION = "0f0e0d0c-0b0a-4908-8706-050403020100";
/* The store's replies, one per kind: its own refusal, its catch (a stack), its internal error with and without an id. */
const REPLY = {
  refused: () => Response.json({ ok: false, reason: "BAD_JSON", detail: "the body was not JSON" }, { status: 400 }),
  stack: () => Response.json({ ok: false, error: "Error: boom\n    at Store.fetch (store.mjs:1:1)" }, { status: 500 }),
  internal: () => Response.json({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: CORRELATION }, { status: 500 }),
  bare: () => Response.json({ ok: false, reason: "STORE_INTERNAL_ERROR" }, { status: 500 }),
};
const FINDING = ["---", "object_type: inquiry", "basis:", "  - target: INQ-2026-0002", "    role: supports", "---", "",
                 "## Question", "", "Q?", ""].join("\n");
/* Each relay: the op and query that reach it, and what the store answers before it (the reads it relays last). */
const RELAYS = [
  { name: "publishedbytes/verify (worker :392)", op: "publishedbytes", q: { sha256: SHA }, fails: "verify", before: {} },
  { name: "publishedbytes/publishedcasedoctext (:405)", op: "publishedbytes", q: { sha256: SHA }, fails: "publishedcasedoctext",
    before: { verify: { published: true, matches: [{ kind: "case_document", path: "case.md" }] } } },
  { name: "publishedcase (:522)", op: "publishedcase", q: { id: "INQ-2026-0001" }, fails: "publishedcase", before: {} },
  { name: "publishedcase/publishedtargets (:633, thrown)", op: "publishedcase", q: { id: "INQ-2026-0001" }, fails: "publishedtargets",
    before: { publishedcase: { ok: true, findings: [{ bundle_id: "INQ-2026-0001", bundle_sha: BODY_SHA }] } } },
];
function stubOf(relay, kind) {
  return { async fetch(req) {
    const op = new URL(typeof req === "string" ? req : req.url).pathname.slice(1);
    if (op === relay.fails) return REPLY[kind]();
    if (op in relay.before) return Response.json({ ok: true, result: relay.before[op] });
    return Response.json({ ok: false, reason: "UNEXPECTED", op }, { status: 418 });
  } };
}
const env = { PUBLISHED: { async get(k) { return k === `bio/published/${BODY_SHA}`
  ? { arrayBuffer: async () => new TextEncoder().encode(FINDING).buffer } : null; }, async head() { return null; } } };
async function call(relay, kind) {
  const url = new URL(`https://plane/?op=${relay.op}`);
  for (const [k, v] of Object.entries(relay.q)) url.searchParams.set(k, v);
  const res = await publishedRoutes({ op: relay.op, url, env, stub: stubOf(relay, kind) });
  const text = await res.text();
  return { status: res.status, text, body: JSON.parse(text) };
}

for (const bound of [true, false]) {
  test(`R48 each of the four relays answers the store's own refusal with its status, code and sentence (storeRefusal ${bound ? "bound" : "absent: the same answer composed"})`, async () => {
    bindPublishedPlane(bound ? { ...PLANE, storeRefusal } : PLANE);
    for (const relay of RELAYS) {
      const r = await call(relay, "refused");
      assert.equal(r.status, 400, relay.name);
      assert.deepEqual(r.body, { ok: false, reason: "BAD_JSON", detail: "the body was not JSON" }, relay.name);
    }
  });
}

test("R48 a reply that is no answer is STORE_DID_NOT_ANSWER at 502: no stack reaches the caller; the store's correlation id is carried when it gave one, and no `correlation` key when it did not", async () => {
  bindPublishedPlane({ ...PLANE, storeRefusal });
  for (const relay of RELAYS) {
    const stack = await call(relay, "stack");
    assert.deepEqual([stack.status, stack.body.reason, "correlation" in stack.body], [502, "STORE_DID_NOT_ANSWER", false], relay.name);
    assert.doesNotMatch(stack.text, /boom|store\.mjs|at Store/, relay.name);
    const internal = await call(relay, "internal");
    assert.deepEqual([internal.status, internal.body.reason, internal.body.correlation], [502, "STORE_DID_NOT_ANSWER", CORRELATION], relay.name);
    const bare = await call(relay, "bare");
    assert.deepEqual([bare.status, bare.body.reason, "correlation" in bare.body], [502, "STORE_DID_NOT_ANSWER", false], relay.name);
  }
  /* the thrown relay names the sub-read it relays */
  assert.equal((await call(RELAYS[3], "internal")).body.op, "publishedcase/publishedtargets");
});
