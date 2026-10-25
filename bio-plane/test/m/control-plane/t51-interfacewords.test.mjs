/* control-plane R116 (fix round 2, C15; amends R66; fix round 8, G114: R127): `op=interfacewords` is cached for the release and compressed. The words are
   `instance-setup`'s (through `translations`' map, R66); the hook stands for the plane's answer, a large JSON body, and the door
   alone is under test: the header its answer leaves with, the validator, the compression, and that the gates and the other ops
   are as they were. A request is "versioned" when its `v` is the release (`env.VERSION`, R1), the language answered and the words stamp, joined by `~` (R127; `r8-words-cache.test.mjs` holds the key's other cases). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, defaultHooks, makeFetch } from "./harness.mjs";

const WORDS = { ok: true, result: { ok: true, language: "es", words_version: "s1", words: Object.fromEntries(Array.from({ length: 4000 }, (_, i) => [`k.${i}`, { shown: `palabra ${i} `.repeat(4), english: `word ${i} `.repeat(4) }])) },
                store: "bio", tokenClass: "member" };
/* the key the shell names: the release, the language answered and the owner's stamp (R127) */
const keyOf = (version, language = "es", stamp = "s1") => `${version}~${language}~${stamp}`;
const hooksOf = (log = []) => ({ ...defaultHooks(),
  async gatedOp(ctx) { log.push(ctx.op); return ctx.op === "interfacewords" ? M.json(WORDS, 200) : undefined; } });

/* a request through the door, the Response whole (the body not yet read) */
const ask = (w, { op = "interfacewords", token, v, headers = {}, hooks = hooksOf(), method = "GET", params = {} } = {}) => {
  const u = new URL("https://plane.example/api");
  u.searchParams.set("op", op);
  if (v !== undefined) u.searchParams.set("v", v);
  for (const [k, x] of Object.entries(params)) u.searchParams.set(k, x);
  return makeFetch(hooks)(new Request(u, { method, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers } }), w.env);
};
const gunzip = async (res) => new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).text();

test("R116 (C15): a versioned `interfacewords` answer leaves with a long-lived, immutable cache header and a validator; the words are the same words", async () => {
  const w = world();
  const res = await ask(w, { token: w.S.ann, v: keyOf(w.env.VERSION) });
  assert.equal(res.status, 200);
  const cc = res.headers.get("cache-control");
  assert.match(cc, /max-age=(\d+)/);
  assert.ok(Number(/max-age=(\d+)/.exec(cc)[1]) >= 30 * 24 * 3600, `a long max-age: ${cc}`);
  assert.match(cc, /\bimmutable\b/);
  assert.match(cc, /\bprivate\b/, "the words are read under a session, so no shared cache keeps them");
  assert.ok(res.headers.get("etag"), "a validator");
  assert.doesNotMatch(res.headers.get("vary") ?? "", /authorization/i, "the key is the address (R127), not the bearer token");
  assert.deepEqual(JSON.parse(await res.text()), WORDS);
});

test("R116 (C15): a caller that holds the release's words and sends their validator is answered unchanged, with no body; a new release's words are sent afresh", async () => {
  const w = world();
  const first = await ask(w, { token: w.S.ann, v: keyOf(w.env.VERSION) });
  const tag = first.headers.get("etag");
  await first.text();
  const again = await ask(w, { token: w.S.ann, v: keyOf(w.env.VERSION), headers: { "if-none-match": tag } });
  assert.equal(again.status, 304);
  assert.equal((await again.text()), "");
  assert.equal(again.headers.get("etag"), tag);
  assert.match(again.headers.get("cache-control"), /immutable/);
  /* the release changes: its words are fetched afresh under their own validator, and the old release's request is not cached as the new */
  const next = world();
  next.env.VERSION = "9.8.8";
  const fresh = await ask(next, { token: next.S.ann, v: keyOf("9.8.8"), headers: { "if-none-match": tag } });
  assert.equal(fresh.status, 200, "the old validator does not stand for the new release");
  assert.notEqual(fresh.headers.get("etag"), tag);
  assert.deepEqual(JSON.parse(await fresh.text()), WORDS);
  const stale = await ask(next, { token: next.S.ann, v: keyOf("9.8.7") });
  assert.equal(stale.status, 200);
  assert.doesNotMatch(stale.headers.get("cache-control") ?? "", /max-age|immutable/, "a request naming another release is not kept as this release's");
  assert.equal(stale.headers.get("etag"), null);
});

test("R116 (C15): a request that accepts a compressed body is answered compressed, and it decompresses to the same words; one that does not is answered plain", async () => {
  const w = world();
  const plain = await ask(w, { token: w.S.ann, v: keyOf(w.env.VERSION) });
  const plainText = await plain.text();
  assert.equal(plain.headers.get("content-encoding"), null);
  const zipped = await ask(w, { token: w.S.ann, v: keyOf(w.env.VERSION), headers: { "accept-encoding": "gzip, br" } });
  assert.equal(zipped.status, 200);
  assert.equal(zipped.headers.get("content-encoding"), "gzip");
  assert.match(zipped.headers.get("vary") ?? "", /accept-encoding/i);
  assert.equal(zipped.headers.get("etag"), plain.headers.get("etag"), "one validator for the words, compressed or not");
  assert.match(zipped.headers.get("cache-control"), /immutable/);
  assert.equal(await gunzip(zipped), plainText);
  assert.equal(zipped.headers.get("content-length"), null, "the length of the plain body is not the compressed one's");
});

test("R116 control: the gates are as they were and no other answer is kept: no session, no words; another op, an unversioned request and a refusal carry no cache lifetime and no validator", async () => {
  const w = world();
  const log = [];
  const stranger = await ask(w, { v: keyOf(w.env.VERSION), hooks: hooksOf(log) });
  assert.ok(stranger.status === 401 || stranger.status === 403, `status ${stranger.status}`);
  assert.doesNotMatch(stranger.headers.get("cache-control") ?? "", /max-age|immutable/);
  assert.equal(log.length, 0, "the words were not asked for");
  /* a stranger with the member's validator is still refused: a validator opens nothing */
  const held = await ask(w, { token: w.S.ann, v: keyOf(w.env.VERSION) });
  const tag = held.headers.get("etag");
  await held.text();
  const probe = await ask(w, { v: keyOf(w.env.VERSION), headers: { "if-none-match": tag } });
  assert.notEqual(probe.status, 304);
  assert.doesNotMatch(probe.headers.get("cache-control") ?? "", /max-age|immutable/);
  for (const [label, r] of [["no version", await ask(w, { token: w.S.ann })], ["whoami", await ask(w, { op: "whoami", token: w.S.ann, v: keyOf(w.env.VERSION) })]]) {
    assert.doesNotMatch(r.headers.get("cache-control") ?? "", /max-age|immutable/, label);
    assert.equal(r.headers.get("etag"), null, label);
    assert.equal(r.headers.get("content-encoding"), null, label);
  }
  /* an answer that is a refusal inside a 200 is not kept */
  // fixtures-generic: NO_SUCH_LANGUAGE (any refusal inside a 200: the door keeps no refused answer)
  const refusing = { ...defaultHooks(), async gatedOp(ctx) { return ctx.op === "interfacewords" ? M.json({ ok: true, result: { ok: false, reason: "NO_SUCH_LANGUAGE" } }, 200) : undefined; } };
  const refused = await ask(w, { token: w.S.ann, v: keyOf(w.env.VERSION), hooks: refusing });
  assert.doesNotMatch(refused.headers.get("cache-control") ?? "", /max-age|immutable/);
  assert.equal(refused.headers.get("etag"), null);
});

test("R116 control (R75): the interface's page keeps `cache-control: no-store`", async () => {
  const w = world();
  const page = await makeFetch(defaultHooks())(new Request("https://plane.example/app", { headers: { "accept-encoding": "gzip" } }), w.env);
  assert.equal(page.status, 200);
  assert.equal(page.headers.get("cache-control"), "no-store");
  assert.equal(page.headers.get("content-encoding"), null);
});
