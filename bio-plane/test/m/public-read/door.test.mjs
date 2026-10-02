/* public-read — the door's half of the public read path (`door.mjs`, moved from `src/index.mjs` by the legacy-index
   map's §4.4 move, K649 (7)): `verify` and `publishedmanifest` answered with no credential from the published store
   (R1, R4, R10), their argument refusal, the store's refusal relayed and a silence answered as one (R9), and
   `publishedcase`/`publishedbytes` handed to the Worker's routes (R3, R5). The plane's helpers are bound as
   `control-plane` R23 and R25 state them; the published store is the store's op map over a real world. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket } from "./fixture.mjs";
import { publicReadDoorOp, PUBLIC_READ_DOOR_OPS } from "../../../src/public-read/door.mjs";
import { bindPublishedPlane } from "../../../src/publication/worker.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
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
const requiredArgument = (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const HELPERS = { json, requiredArgument, storeSilent, storeRefusal, doAnswer };
class StoreSilent extends Error { constructor(op) { super(op); this.op = op; } }
bindPublishedPlane({ ...HELPERS, StoreSilent, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent",
                     PUBLISHED_STORE: "bio" });

const F = "INQ-2026-0001";
function publishedCase() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  const text = w.text(F);
  w.signFinding(F, { shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) }] });
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(text));
  return { w, env, pin, text };
}
const door = (op, q, env, stub) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publicReadDoorOp(op, url, env, stub, HELPERS);
};
const replying = (res) => ({ async fetch() { return res(); } });

test("R1 R10 the door's verify answers with no credential from the published store, the sha lowercased; a malformed sha is the argument refusal at 400", async () => {
  const { w, env, pin } = publishedCase();
  const r = await door("verify", { sha256: pin.toUpperCase() }, env, stubOf(w));
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, ...w.pr.verifySha(pin) });
  const none = await (await door("verify", { sha256: "0".repeat(64) }, env, stubOf(w))).json();
  assert.deepEqual([none.ok, none.published, none.matches], [true, false, []]);
  for (const bad of ["", "abc", "g".repeat(64)]) {
    const b = await door("verify", { sha256: bad }, env, stubOf(w));
    assert.equal(b.status, 400);
    assert.deepEqual(await b.json(), { ok: false, ...requiredArgument("verify", "sha256", "<64 lowercase hex>"),
                                       error: "verify requires sha256=<64 lowercase hex>" });
  }
});

test("R4 R10 the door's publishedmanifest answers the whole projection wrapped as `result`, with no credential", async () => {
  const { w, env } = publishedCase();
  const r = await door("publishedmanifest", {}, env, stubOf(w));
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, result: w.pr.publishedManifest() });
});

test("R9 R18 the door's verify, publishedmanifest and publicread answer the store's own refusal with its status and sentence, and a reply that is no answer as STORE_DID_NOT_ANSWER, with the correlation id when given", async () => {
  const refused = () => Response.json({ ok: false, reason: "BAD_JSON", detail: "the body was not JSON" }, { status: 400 });
  const internal = () => Response.json({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: "0f0e0d0c-0b0a-4908-8706-050403020100" }, { status: 500 });
  const stack = () => Response.json({ ok: false, error: "Error: boom\n    at Store.fetch (store.mjs:1:1)" }, { status: 500 });
  for (const [op, q] of [["verify", { sha256: "a".repeat(64) }], ["publishedmanifest", {}], ["publicread", { name: "noticespublic" }]]) {
    const r = await door(op, q, {}, replying(refused));
    assert.deepEqual([r.status, await r.json()], [400, { ok: false, reason: "BAD_JSON", detail: "the body was not JSON" }], op);
    const i = await door(op, q, {}, replying(internal));
    const ib = await i.json();
    assert.deepEqual([i.status, ib.reason, ib.op, ib.correlation], [502, "STORE_DID_NOT_ANSWER", op, "0f0e0d0c-0b0a-4908-8706-050403020100"], op);
    const s = await door(op, q, {}, replying(stack));
    const text = await s.text();
    assert.equal(s.status, 502, op);
    assert.doesNotMatch(text, /boom|store\.mjs/, op);
    assert.equal("correlation" in JSON.parse(text), false, op);
  }
});

test("R3 R5 the door hands publishedcase and publishedbytes to the Worker's routes; any other op is not its own and answers null", async () => {
  const { w, env, pin, text } = publishedCase();
  const c = await door("publishedcase", { id: "CASE-2026-0001" }, env, stubOf(w));
  assert.equal(c.status, 200);
  const cb = await c.json();
  assert.deepEqual([cb.caseId, cb.findings[0].body.state], ["CASE-2026-0001", "published"]);
  const b = await door("publishedbytes", { sha256: pin }, env, stubOf(w));
  assert.deepEqual([b.status, await b.text()], [200, text]);
  assert.deepEqual(PUBLIC_READ_DOOR_OPS, ["verify", "publishedmanifest", "publishedcase", "publishedbytes", "publicread"]);
  for (const op of ["caseflags", "casedocument", "instancegroup", "publishedlist", ""])
    assert.equal(await door(op, {}, env, stubOf(w)), null, op);
});
