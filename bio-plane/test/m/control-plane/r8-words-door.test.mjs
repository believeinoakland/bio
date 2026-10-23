/* control-plane R127 (fix round 8, G113, G114; K4811 (7), K4814 (1), K4817; R-SEAM, R-ONE, R-CLOCK): THE WORDS, ASKED THROUGH THE REAL PLANE AND COUNTED. The Worker the product
   deploys, its object, its alarm and R2 under Miniflare, behind the counting door (`wrap-entry.mjs`): every input is a member's own act (the language she sets, the translation
   she keeps), every count the door's own header. What the shell does with the key is `interface-shell`'s (R128 there); here the request is the one it makes, the release, the language
   and the stamp `bootstrap` states joined by `~`.
   Red by name until the providers have merged: `translations` (R19: the shown words alone; R20: the stamp), `instance-setup` (R103: `bootstrap` states the language and the stamp),
   and the stamp's place in `interfacewords`' answer, which this module's R127 reads. No wall time is asserted; sizes and counts are. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
import { wrapScript, readCalls, doCalls } from "./wrap-entry-read.mjs";

const ADM = "adm-r8words-0123456789abcdef", PASSWORD = "the founder's long password, words", ORIGIN = "https://group.example", VERSION = "4.8.1";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", ...wrapScript(),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r8words-0123456789abcdef", PROBE_TOKEN: "prb-r8words-0123456789abcdef", VERSION,
              INSTANCE_NAME: "r8words-town", GOVERNOR_APPETITE_PER_MIN: "600000" },
});
after(() => mf.dispose());
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

let claimed = false;
async function signIn() {
  if (!claimed) { await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer(); claimed = true; }
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return { authorization: `Bearer ${signed.result.token}` };
}
const act = async (auth, op, body) => (await (await plane(`/api/?op=${op}`, { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body) })).json());
const bootstrap = async (auth) => { const r = await (await plane("/api/?op=bootstrap", { headers: auth })).json(); assert.equal(r.ok, true, "bootstrap: " + JSON.stringify(r).slice(0, 300)); return r.result ?? r; };
const words = (auth, { v, headers = {}, language } = {}) => plane(`/api/?op=interfacewords${v ? `&v=${encodeURIComponent(v)}` : ""}${language ? `&language=${language}` : ""}`, { headers: { "accept-encoding": "identity", ...auth, ...headers } });
const YEAR = /max-age=31536000/;
/* Miniflare's own front door re-encodes a body it forwards (`mf-content-encoding`); the bytes are the answer's, gunzipped when they are Miniflare's gzip, never the door's (these requests accept no compression) */
async function plain(res) {
  const bytes = new Uint8Array(await res.arrayBuffer());
  const text = bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b
    ? await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text() : new TextDecoder().decode(bytes);
  return { text, json: () => JSON.parse(text) };
}

test("R127 (G113, G114): two sign-ins of one member in one release, language and stamp are answered under one key, one validator and no `Authorization` in `vary`; the object is asked for the words once a request; a 304 carries no body; the shown words alone are sent", { timeout: 600000 }, async () => {
  const first = await signIn();
  const set = await act(first, "memberlanguageset", { language: "es" });
  assert.equal(set.ok, true, JSON.stringify(set).slice(0, 300));
  const b = await bootstrap(first);
  assert.equal(b.language, "es", "bootstrap states the language (instance-setup R103)");
  assert.equal(typeof b.words_version, "string", "and the stamp");
  const v = `${VERSION}~${b.language}~${b.words_version}`;
  const a = await words(first, { v });
  const ca = readCalls(a);
  const bodyA = (await plain(a)).text;
  assert.equal(a.status, 200, bodyA.slice(0, 300));
  assert.match(a.headers.get("cache-control"), YEAR, "the key names the current release, language and stamp");
  assert.match(a.headers.get("cache-control"), /\bimmutable\b/);
  assert.doesNotMatch(a.headers.get("vary") ?? "", /authorization/i);
  assert.ok(a.headers.get("etag"));
  assert.ok(bodyA.length <= 4096, `no translation is held, so the answer holds no word: ${bodyA.length} bytes (translations R19)`);
  assert.equal(JSON.parse(bodyA).result.words.length, 0);
  assert.equal(ca.do.interfacewords?.n, 1, `the object is asked for the words once: ${JSON.stringify(ca.do)}`);
  /* a second sign-in, a new bearer token: the same key, the same validator; asked again it is answered unchanged with no body */
  const second = await signIn();
  const c = await words(second, { v });
  assert.equal(c.headers.get("etag"), a.headers.get("etag"), "the two tokens share one validator");
  assert.match(c.headers.get("cache-control"), YEAR);
  await plain(c);
  const d = await words(second, { v, headers: { "if-none-match": a.headers.get("etag") } });
  assert.equal(d.status, 304);
  assert.equal((await plain(d)).text, "");
  assert.equal(readCalls(d).do.interfacewords?.n, 1, "the object is asked once for the revalidation too");
  assert.ok(doCalls(readCalls(d)) <= 4, `a revalidation costs few calls to the object: ${JSON.stringify(readCalls(d).do)}`);
  /* a key that does not carry the current release, language and stamp is answered without the year */
  for (const [label, key] of [["the release alone", VERSION], ["an old stamp", `${VERSION}~es~old`], ["another language", `${VERSION}~fr~${b.words_version}`]]) {
    const r = await words(first, { v: key });
    await plain(r);
    assert.doesNotMatch(r.headers.get("cache-control") ?? "", /max-age=31536000|immutable/, label);
  }
});

test("R127 (G114): a translation kept mid-release changes the stamp bootstrap states; the key of the old stamp is no longer kept, the new key is, and the kept word is in the answer (fallback false)", { timeout: 600000 }, async () => {
  const auth = await signIn();
  await act(auth, "memberlanguageset", { language: "es" });
  const before = await bootstrap(auth);
  const listed = (await plain(await words(auth, { language: "es" }))).json();
  const word = listed.result.words.find((w) => typeof w.en === "string" && !w.en.includes("{") && w.en.trim() && [...w.en].length < 60);
  assert.ok(word, "a word with no placeholder to translate");
  const granted = await act(auth, "translationgrant", { member: "admin", language: "es" });
  assert.ok(granted.ok !== false, JSON.stringify(granted).slice(0, 300));
  const kept = await act(auth, "translationadopt", { language: "es", key: word.key, text: `${word.en} (es)` });
  assert.equal((kept.result || kept).ok, true, "a translation kept: " + JSON.stringify(kept).slice(0, 400));
  const after = await bootstrap(auth);
  assert.notEqual(after.words_version, before.words_version, "the stamp changes at an adoption");
  const oldKey = `${VERSION}~es~${before.words_version}`, newKey = `${VERSION}~es~${after.words_version}`;
  const stale = await words(auth, { v: oldKey });
  const staleBody = (await plain(stale)).json();
  assert.doesNotMatch(stale.headers.get("cache-control") ?? "", /max-age=31536000|immutable/, "the stale stamp is not served for a year");
  assert.equal(staleBody.result.words_version, after.words_version, "and the answer states the stamp to name next");
  const fresh = await words(auth, { v: newKey });
  const freshBody = (await plain(fresh)).json();
  assert.match(fresh.headers.get("cache-control"), YEAR);
  const shown = freshBody.result.words.filter((w) => w.fallback === false);
  assert.deepEqual(shown.map((w) => w.key), [word.key], "exactly the kept word is sent (translations R19)");
  assert.notEqual(fresh.headers.get("etag"), stale.headers.get("etag") ?? "none");
});
