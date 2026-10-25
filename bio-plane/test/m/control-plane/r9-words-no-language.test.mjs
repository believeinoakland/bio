/* control-plane R127 (BOB K4853; diagnosis-R9-rewalk8-A): A VIEWER WITH NO LANGUAGE IS KEPT TOO. The owner states `language: null` for a viewer who has set none, and the shell
   names the empty part: `v = <release>~~<words_version>`. That key is kept for the year like any other; any other `v` is `private, no-cache`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { interfaceWordsCache } from "../../../src/control-plane/words-cache.mjs";
import { M, world, defaultHooks, makeFetch } from "./harness.mjs";

const VERSION = "4.8.1";
const YEAR = /^private, max-age=31536000, immutable$/;
const answer = ({ language = null, stamp = "0.0.0", n = 0 } = {}) => ({ ok: true, result: { ok: true, language, words_version: stamp,
  words: n ? Object.fromEntries(Array.from({ length: n }, (_, i) => [`k.${i}`, { text: `palabra ${i}`, en: `word ${i}`, fallback: false }])) : [] }, store: "bio", tokenClass: "member" });
const unit = (body, { v, headers = {} } = {}) => {
  const u = new URL("https://plane.example/api?op=interfacewords");
  if (v !== undefined) u.searchParams.set("v", v);
  const res = new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  return interfaceWordsCache(res, new Request(u, { headers }), { VERSION });
};

test("R127 no language (unit): a words answer stating `language: null` is kept for the year under `<release>~~<words_version>`, with a weak etag and vary", async () => {
  const { res, table } = await unit(answer(), { v: `${VERSION}~~0.0.0` });
  assert.equal(table, true);
  assert.match(res.headers.get("cache-control"), YEAR);
  assert.match(res.headers.get("etag"), /^W\/"/);
  assert.equal(res.headers.get("vary"), "Accept-Encoding");
  assert.deepEqual(await res.json(), answer());
});

test("R127 no language (unit): the validator answers 304 with no body, gzip is as for a language, and a body past the peek is judged the same", async () => {
  const held = await unit(answer(), { v: `${VERSION}~~0.0.0` });
  const tag = held.res.headers.get("etag");
  const again = await unit(answer(), { v: `${VERSION}~~0.0.0`, headers: { "if-none-match": tag } });
  assert.equal(again.res.status, 304);
  assert.equal(await again.res.text(), "");
  const zipped = await unit(answer({ n: 3000 }), { v: `${VERSION}~~0.0.0`, headers: { "accept-encoding": "gzip" } });
  assert.equal(zipped.res.headers.get("content-encoding"), "gzip");
  assert.match(zipped.res.headers.get("cache-control"), YEAR);
  assert.equal(zipped.res.headers.get("etag"), tag, "one validator for the key, plain or compressed or large");
  assert.equal((await new Response(zipped.res.body.pipeThrough(new DecompressionStream("gzip"))).json()).result.language, null);
  const tail = { ok: true, result: { ok: true, words: answer({ n: 3000 }).result.words, language: null, words_version: "0.0.0" } };
  const late = await unit(tail, { v: `${VERSION}~~0.0.0` });
  assert.match(late.res.headers.get("cache-control"), YEAR, "the fields after the words are found");
});

test("R127 no language (unit): any other `v` for a no-language answer stays `private, no-cache` with no validator", async () => {
  for (const v of [VERSION, `${VERSION}~es~0.0.0`, `${VERSION}~~old`, `${VERSION}~~`, `old~~0.0.0`, undefined]) {
    const { res } = await unit(answer(), { v });
    assert.equal(res.headers.get("cache-control"), "private, no-cache", String(v));
    assert.equal(res.headers.get("etag"), null, String(v));
  }
  /* a stamp the answer lacks is not kept either */
  const none = await unit({ ok: true, result: { ok: true, language: null, words_version: null, words: [] } }, { v: `${VERSION}~~` });
  assert.doesNotMatch(none.res.headers.get("cache-control") ?? "", /max-age|immutable/);
});

test("R127 no language control (unit): language `es` is unchanged, and `~es~` is not the key of a no-language answer", async () => {
  const es = await unit(answer({ language: "es", stamp: "s1" }), { v: `${VERSION}~es~s1` });
  assert.match(es.res.headers.get("cache-control"), YEAR);
  const crossed = await unit(answer({ language: "es", stamp: "s1" }), { v: `${VERSION}~~s1` });
  assert.equal(crossed.res.headers.get("cache-control"), "private, no-cache");
});

/* ---- the door ---- */
const hooksOf = (body) => ({ ...defaultHooks(), async gatedOp(ctx) { return ctx.op === "interfacewords" ? M.json(body, 200) : undefined; } });
const ask = (w, { v, headers = {}, body }) => {
  const u = new URL("https://plane.example/api");
  u.searchParams.set("op", "interfacewords");
  if (v !== undefined) u.searchParams.set("v", v);
  return makeFetch(hooksOf(body))(new Request(u, { headers: { authorization: `Bearer ${w.S.ann}`, ...headers } }), w.env);
};

test("R127 no language (door): a viewer with no language is answered the es control's year header, vary and validator, and a request carrying the validator is a 304", async () => {
  const w = world();
  const none = await ask(w, { v: `${w.env.VERSION}~~0.0.0`, body: answer() });
  const es = await ask(w, { v: `${w.env.VERSION}~es~s1`, body: answer({ language: "es", stamp: "s1" }) });
  assert.equal(none.status, 200);
  for (const k of ["cache-control", "vary"]) assert.equal(none.headers.get(k), es.headers.get(k), k);
  assert.match(none.headers.get("cache-control"), YEAR);
  assert.ok(none.headers.get("etag"));
  assert.notEqual(none.headers.get("etag"), es.headers.get("etag"));
  assert.deepEqual(await none.json(), answer());
  const again = await ask(w, { v: `${w.env.VERSION}~~0.0.0`, body: answer(), headers: { "if-none-match": none.headers.get("etag") } });
  assert.equal(again.status, 304);
  assert.equal(await again.text(), "");
  const stale = await ask(w, { v: w.env.VERSION, body: answer() });
  assert.equal(stale.headers.get("cache-control"), "private, no-cache");
  await stale.text();
});
