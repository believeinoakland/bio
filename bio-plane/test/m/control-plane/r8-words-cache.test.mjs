/* control-plane R127 (fix round 8, G114; K4811 (7), K4814 (1), K4817; amends R116): THE WORDS ARE FETCHED ONCE PER BROWSER, RELEASE, LANGUAGE AND ADOPTIONS. The words are
   the owner's (`instance-setup`'s map, `translations`' answer); the hook stands for the plane's answer and the door alone is under test: the key `v` it accepts for the
   year (`<release>~<language>~<words_version>`, the three the owner's answer states beside the release), the `vary` that no longer names `Authorization`, the validator
   that two sign-ins share, and that the door does not pull the whole body of a words answer to tally it. The counting of the real plane's calls is `r8-words-door.test.mjs`.
   Bytes are counted at the owner's stream, never by a clock (R-CLOCK). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, defaultHooks, makeFetch } from "./harness.mjs";

const te = (t) => new TextEncoder().encode(t);
/* the owner's answer, as translations R19/R20 and instance-setup state it: the language answered and the adoptions stamp beside the words */
function wordsOf({ language = "es", stamp = "s1", n = 50, order = "head" } = {}) {
  const words = Object.fromEntries(Array.from({ length: n }, (_, i) => [`k.${i}`, { text: `palabra ${i}`, en: `word ${i}`, fallback: false }]));
  const result = order === "head" ? { ok: true, language, words_version: stamp, words } : { ok: true, words, language, words_version: stamp };
  return { ok: true, result, store: "bio", tokenClass: "member" };
}
/* a Response whose body counts the bytes pulled from it, so the test can say how much of the owner's answer the door read before the caller did */
function counted(answer, pulled, status = 200) {
  const bytes = te(JSON.stringify(answer));
  const chunk = 4096;
  let at = 0;
  const body = new ReadableStream({
    pull(c) {
      if (at >= bytes.length) { c.close(); return; }
      const end = Math.min(at + chunk, bytes.length);
      c.enqueue(bytes.subarray(at, end));
      pulled.n += end - at;
      at = end;
    },
  }, new CountQueuingStrategy({ highWaterMark: 0 }));
  return { res: new Response(body, { status, headers: { "content-type": "application/json", "content-length": String(bytes.length) } }), size: bytes.length };
}
const hooksOf = (answerOf, log = []) => ({ ...defaultHooks(),
  async gatedOp(ctx) { if (ctx.op !== "interfacewords") return undefined; log.push(ctx.url.searchParams.get("language")); return answerOf(ctx); } });
const ask = (w, { token, v, headers = {}, hooks, params = {} }) => {
  const u = new URL("https://plane.example/api");
  u.searchParams.set("op", "interfacewords");
  if (v !== undefined) u.searchParams.set("v", v);
  for (const [k, x] of Object.entries(params)) u.searchParams.set(k, x);
  return makeFetch(hooks)(new Request(u, { method: "GET", headers: { authorization: `Bearer ${token}`, ...headers } }), w.env);
};
const keyOf = (w, language, stamp) => `${w.env.VERSION}~${language}~${stamp}`;
const YEAR = /max-age=31536000/;

test("R127 (G114): two sign-ins in one browser, one release, one language and one adoptions stamp, are served the same year-long answer under the same validator, and `vary` names no `Authorization`", async () => {
  const w = world();
  const hooks = hooksOf(() => M.json(wordsOf(), 200));
  const v = keyOf(w, "es", "s1");
  const first = await ask(w, { token: w.S.ann, v, hooks });
  const second = await ask(w, { token: w.S.bare, v, hooks });
  for (const [label, r] of [["first", first], ["second", second]]) {
    assert.equal(r.status, 200, label);
    assert.match(r.headers.get("cache-control"), YEAR, label);
    assert.match(r.headers.get("cache-control"), /\bimmutable\b/, label);
    assert.match(r.headers.get("cache-control"), /\bprivate\b/, label);
    assert.doesNotMatch(r.headers.get("vary") ?? "", /authorization/i, `${label}: the key is the URL, not the bearer token`);
    assert.match(r.headers.get("vary") ?? "", /accept-encoding/i, label);
  }
  assert.ok(first.headers.get("etag"), "a validator");
  assert.equal(second.headers.get("etag"), first.headers.get("etag"), "the two tokens share one validator");
  assert.deepEqual(await first.json(), wordsOf());
  /* the second sign-in revalidates with the first's validator and is answered unchanged, with no body */
  const again = await ask(w, { token: w.S.bare, v, hooks, headers: { "if-none-match": first.headers.get("etag") } });
  assert.equal(again.status, 304);
  assert.equal(await again.text(), "");
  assert.doesNotMatch(again.headers.get("vary") ?? "", /authorization/i);
});

test("R127 (G114): a `v` that does not carry the current release, the answered language and the current stamp is answered `private, no-cache` with no validator, whoever asks", async () => {
  const w = world();
  const hooks = hooksOf(() => M.json(wordsOf({ language: "es", stamp: "s2" }), 200));
  const cases = {
    "the release alone (a load before bootstrap)": w.env.VERSION,
    "the release before the last one": `9.8.6~es~s2`,
    "an old stamp (an adoption since)": keyOf(w, "es", "s1"),
    "another language": keyOf(w, "fr", "s2"),
    "no stamp": `${w.env.VERSION}~es~`,
    "no language": `${w.env.VERSION}~~s2`,
    "a fourth part": `${keyOf(w, "es", "s2")}~x`,
    "no v at all": undefined,
  };
  for (const [label, v] of Object.entries(cases)) {
    const r = await ask(w, { token: w.S.ann, v, hooks });
    assert.equal(r.status, 200, label);
    assert.match(r.headers.get("cache-control") ?? "", /\bprivate\b/, label);
    assert.match(r.headers.get("cache-control") ?? "", /\bno-cache\b/, label);
    assert.doesNotMatch(r.headers.get("cache-control") ?? "", /max-age|immutable/, `${label}: not kept for the year`);
    assert.equal(r.headers.get("etag"), null, label);
    assert.deepEqual(await r.json(), wordsOf({ language: "es", stamp: "s2" }), `${label}: the words are the words`);
  }
  /* control: the current key is kept for the year */
  const current = await ask(w, { token: w.S.ann, v: keyOf(w, "es", "s2"), hooks });
  assert.match(current.headers.get("cache-control"), YEAR);
});

test("R127 (G114): an adoption mid-release is seen at the next load: the stamp the owner states changes, the old key is no longer kept and the new key is, under its own validator", async () => {
  const w = world();
  let stamp = "s1";
  const hooks = hooksOf(() => M.json(wordsOf({ stamp }), 200));
  const before = await ask(w, { token: w.S.ann, v: keyOf(w, "es", "s1"), hooks });
  assert.match(before.headers.get("cache-control"), YEAR);
  const tag = before.headers.get("etag");
  await before.text();
  stamp = "s2";   /* translationadopt has run */
  const stale = await ask(w, { token: w.S.ann, v: keyOf(w, "es", "s1"), hooks, headers: { "if-none-match": tag } });
  assert.equal(stale.status, 200, "the old validator does not stand for the new stamp");
  assert.doesNotMatch(stale.headers.get("cache-control"), /max-age|immutable/);
  assert.equal((await stale.json()).result.words_version, "s2", "the answer states the stamp the shell names next");
  const fresh = await ask(w, { token: w.S.ann, v: keyOf(w, "es", "s2"), hooks });
  assert.match(fresh.headers.get("cache-control"), YEAR);
  assert.notEqual(fresh.headers.get("etag"), tag);
});

test("R127 (G114): two members with different languages on one browser each get their own key and validator; neither is served the other's words", async () => {
  const w = world();
  const hooks = hooksOf((ctx) => M.json(wordsOf({ language: ctx.url.searchParams.get("language") ?? "es" }), 200));
  const es = await ask(w, { token: w.S.ann, v: keyOf(w, "es", "s1"), hooks, params: { language: "es" } });
  const fr = await ask(w, { token: w.S.bare, v: keyOf(w, "fr", "s1"), hooks, params: { language: "fr" } });
  assert.match(es.headers.get("cache-control"), YEAR);
  assert.match(fr.headers.get("cache-control"), YEAR);
  assert.notEqual(es.headers.get("etag"), fr.headers.get("etag"), "one validator for each language");
  assert.equal((await es.json()).result.language, "es");
  assert.equal((await fr.json()).result.language, "fr");
  /* the French key asked of a member whose words are Spanish is not kept: it does not name the language answered */
  const crossed = await ask(w, { token: w.S.ann, v: keyOf(w, "fr", "s1"), hooks, params: { language: "es" } });
  assert.doesNotMatch(crossed.headers.get("cache-control"), /max-age|immutable/);
});

test("R127 (G114): the key is judged whatever the order of the owner's fields, and a compressed request is answered compressed with the same validator", async () => {
  const w = world();
  const hooks = hooksOf(() => M.json(wordsOf({ order: "tail" }), 200));
  const v = keyOf(w, "es", "s1");
  const plain = await ask(w, { token: w.S.ann, v, hooks });
  assert.match(plain.headers.get("cache-control"), YEAR, "the stamp is found though the words come first");
  const text = await plain.text();
  const zipped = await ask(w, { token: w.S.ann, v, hooks, headers: { "accept-encoding": "gzip, br" } });
  assert.equal(zipped.headers.get("content-encoding"), "gzip");
  assert.equal(zipped.headers.get("etag"), plain.headers.get("etag"));
  assert.equal(await new Response(zipped.body.pipeThrough(new DecompressionStream("gzip"))).text(), text);
});

test("R127 (G114): the door does not pull the whole body of a words answer to tally it: a words answer of 1 MB is read for its key, not parsed twice more", async () => {
  const w = world();
  const pulled = { n: 0 };
  let size = 0;
  const hooks = hooksOf(() => { const c = counted(wordsOf({ n: 12000 }), pulled); size = c.size; return c.res; });
  const r = await ask(w, { token: w.S.ann, v: keyOf(w, "es", "s1"), hooks });
  assert.equal(r.status, 200);
  assert.ok(size > 800000, `a large answer: ${size}`);
  assert.ok(pulled.n <= 64 * 1024, `before the caller reads a byte, the door has pulled ${pulled.n} of ${size}: a prefix for the key, never the body`);
  assert.equal(JSON.parse(await r.text()).result.language, "es", "and the caller still receives the whole answer");
  assert.equal(pulled.n, size);
});

test("R127 control (G114): a refusal this op gives is still read and tallied: a 200 `{ok: false}` body is counted by its code, and a non-200 too", async () => {
  const w = world();
  // fixtures-generic: NO_SUCH_LANGUAGE (any code the owner refuses with: the door must tally whatever code it reads)
  const refusals = [["200", M.json({ ok: true, result: { ok: false, reason: "NO_SUCH_LANGUAGE" }, store: "bio", tokenClass: "member" }, 200)],
                    ["409", M.json({ ok: false, reason: "NO_SUCH_LANGUAGE", store: "bio", tokenClass: "member" }, 409)]];
  for (const [label, res] of refusals) {
    const w2 = world();
    const hooks = hooksOf(() => res.clone());
    const r = await ask(w2, { token: w2.S.ann, v: keyOf(w2, "es", "s1"), hooks });
    await r.text();
    assert.doesNotMatch(r.headers.get("cache-control") ?? "", /max-age|immutable/, label);
    assert.equal(r.headers.get("etag"), null, label);
    const tallied = w2.env.calls.some((c) => c.route === "wizardrefusaltally" && c.body && c.body.code === "NO_SUCH_LANGUAGE");
    assert.ok(tallied, `${label}: the refusal's code reaches the tally`);
  }
  void w;
});

test("R127 control (G114): the gates are as they were: a caller with no session is refused before the words are asked, and a validator opens nothing for them", async () => {
  const w = world();
  const log = [];
  const hooks = hooksOf(() => M.json(wordsOf(), 200), log);
  const held = await ask(w, { token: w.S.ann, v: keyOf(w, "es", "s1"), hooks });
  const tag = held.headers.get("etag");
  await held.text();
  const stranger = await makeFetch(hooks)(new Request(`https://plane.example/api?op=interfacewords&v=${encodeURIComponent(keyOf(w, "es", "s1"))}`,
    { headers: { "if-none-match": tag } }), w.env);
  assert.ok(stranger.status === 401 || stranger.status === 403, `status ${stranger.status}`);
  assert.doesNotMatch(stranger.headers.get("cache-control") ?? "", /max-age|immutable/);
  assert.equal(log.length, 1, "the words were asked of the owner once, for the member");
});
