/* plane R6 (K2011; publication R73, F1): the public hook hands publication's door the request's body, so a review
   grant's secret travels in the body and reaches the store only as its digest, never in an address; the address form
   still works for T35's release and is named deprecated. Driven through `publicOp`, the hook R6's `makeFetch` takes,
   with a stub of the store recording each request it is sent. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import "./fixture.mjs";   /* answers `cloudflare:workers` */
const { publicOp } = await import("../../../src/plane/door.mjs");

const SECRET = "a-review-grant-secret";
const SHA = createHash("sha256").update(SECRET).digest("hex");

async function ask({ query = "", body } = {}) {
  const seen = [];
  const stub = { fetch: async (u) => { seen.push(String(u)); return new Response(JSON.stringify({ ok: true, result: { sha: "x" } }),
    { headers: { "content-type": "application/json" } }); } };
  const env = { STORE: { idFromName: (n) => n, get: () => stub } };
  const url = new URL(`http://x/api/?op=casedocument&case=CASE-2026-0001&edition=1${query}`);
  const req = new Request(url, body === undefined ? { method: "GET" } : { method: "POST", body: JSON.stringify(body) });
  const res = await publicOp({ req, url, env, op: "casedocument", stub, fp: "f", presentedAi: { cred: null } });
  return { seen, answer: await res.json(), req };
}

test("R6 (K2011; publication R73): the review grant's secret in the request body reaches the store as its SHA-256, with no deprecation, and the request stays readable after", async () => {
  const { seen, answer, req } = await ask({ body: { secret: SECRET } });
  assert.equal(seen.length, 1);
  assert.match(seen[0], new RegExp(`[?&]secretSha=${SHA}(&|$)`), "the body's secret, as its digest");
  assert.ok(!seen[0].includes(SECRET), "never the secret itself in an address");
  assert.equal(answer.deprecated, undefined);
  assert.deepEqual(await req.json(), { secret: SECRET }, "the door read a copy: the body is still the request's");
});

test("R6 (K2011; publication R73): the body's secret wins over an address secret beside it; the address form alone still works, named deprecated; no secret sends none", async () => {
  const both = await ask({ query: "&secret=other", body: { secret: SECRET } });
  assert.match(both.seen[0], new RegExp(`secretSha=${SHA}`));
  const addr = await ask({ query: `&secret=${SECRET}` });
  assert.match(addr.seen[0], new RegExp(`secretSha=${SHA}`));
  assert.equal(addr.answer.deprecated, "CREDENTIAL_IN_ADDRESS");
  const none = await ask({});
  assert.ok(!none.seen[0].includes("secretSha"));
});

test("R6 (K2062; capture R85): the public hook hands capture's knock the country the door read, so the store is told it beside the source; with none, none is sent", async () => {
  const knock = async (country) => {
    const seen = [];
    const stub = { fetch: async (r) => { seen.push(String(r instanceof Request ? r.url : r));
      return new Response(JSON.stringify({ ok: true, result: { ok: true, knockId: "k" } }), { headers: { "content-type": "application/json" } }); } };
    const env = { STORE: { idFromName: (n) => n, get: () => stub } };
    const url = new URL("http://x/api/?op=knock");
    const req = new Request(url, { method: "POST", body: JSON.stringify({ contentText: "a tip" }) });
    await publicOp({ req, url, env, op: "knock", stub, fp: "f", presentedAi: { cred: null }, credential: null, country });
    return seen.find((u) => u.startsWith("http://do/knock?")) ?? null;
  };
  assert.match(await knock("US"), /[?&]country=US(&|$)/);
  const none = await knock(null);
  assert.ok(none && !none.includes("country="), none);
});
