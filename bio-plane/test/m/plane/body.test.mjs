/* plane R6 (K2011, K2146; publication R73, F1): the public hook hands publication's door the request's body, so a review
   grant's secret travels in the body and reaches the store only as its digest, in the store request's body, never in an
   address; a secret in the address is not read at all (admission's gate refuses it before the door, its R20), and no
   answer carries a `deprecated` key. Driven through `publicOp`, the hook R6's `makeFetch` takes, with a stub of the store
   recording each request it is sent, address and body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import "./fixture.mjs";   /* answers `cloudflare:workers` */
const { publicOp } = await import("../../../src/plane/door.mjs");

const SECRET = "a-review-grant-secret";
const SHA = createHash("sha256").update(SECRET).digest("hex");
const OTHER = "an-address-secret";
const OTHER_SHA = createHash("sha256").update(OTHER).digest("hex");

async function ask({ query = "", body } = {}) {
  const seen = [];
  const stub = { fetch: async (u, init) => {
    seen.push({ url: String(u instanceof Request ? u.url : u), body: init && typeof init.body === "string" ? init.body : "" });
    return new Response(JSON.stringify({ ok: true, result: { sha: "x" } }), { headers: { "content-type": "application/json" } }); } };
  const env = { STORE: { idFromName: (n) => n, get: () => stub } };
  const url = new URL(`http://x/api/?op=casedocument&case=CASE-2026-0001&edition=1${query}`);
  const req = new Request(url, body === undefined ? { method: "GET" } : { method: "POST", body: JSON.stringify(body) });
  const res = await publicOp({ req, url, env, op: "casedocument", stub, fp: "f", presentedAi: { cred: null } });
  return { seen, answer: await res.json(), req };
}
const sent = (s) => s.url + "\n" + s.body;

test("R6 (K2011, K2146; publication R73): the review grant's secret in the request body reaches the store as its SHA-256 in the store request's body, never in its address, with no deprecation, and the request stays readable after", async () => {
  const { seen, answer, req } = await ask({ body: { secret: SECRET } });
  assert.equal(seen.length, 1);
  assert.deepEqual(JSON.parse(seen[0].body), { secretSha: SHA }, "the body's secret, as its digest, in the store request's body");
  assert.ok(!seen[0].url.includes(SHA) && !seen[0].url.includes("secret"), "neither the secret nor its digest in the address");
  assert.ok(!sent(seen[0]).includes(SECRET), "never the secret itself");
  assert.equal(answer.deprecated, undefined);
  assert.deepEqual(await req.json(), { secret: SECRET }, "the door read a copy: the body is still the request's");
});

test("R6 (K2146; publication R73): a secret in the address is not read, hashed or sent, beside a body secret or alone, and no answer is named deprecated; no secret sends none", async () => {
  const both = await ask({ query: `&secret=${OTHER}`, body: { secret: SECRET } });
  assert.deepEqual(JSON.parse(both.seen[0].body), { secretSha: SHA }, "the body's secret only");
  assert.ok(!sent(both.seen[0]).includes(OTHER) && !sent(both.seen[0]).includes(OTHER_SHA), "the address secret is not passed on, nor its digest");
  const addr = await ask({ query: `&secret=${OTHER}` });
  assert.ok(!sent(addr.seen[0]).includes("secretSha") && !sent(addr.seen[0]).includes(OTHER_SHA) && !sent(addr.seen[0]).includes(OTHER),
    "an address secret alone admits nothing: no digest is sent");
  assert.equal(addr.answer.deprecated, undefined, "no `deprecated` key");
  const none = await ask({});
  assert.ok(!sent(none.seen[0]).includes("secretSha"));
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
