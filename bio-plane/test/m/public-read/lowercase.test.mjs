/* public-read — R5 (T46; N906, K2832): a `sha256` of 64 hexadecimal digits in upper or mixed case is lowercased, by the
   Worker (`publishedbytes`, raw and in container form) and by the store alike (`verify`, `publishedcase`, `withheld`,
   through the op and by the method), and answered as its lowercase form, never refused for its case; what is not 64
   hexadecimal digits is still the required-argument refusal at the Worker. Each arm compares the whole answer with the
   lowercase one's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, sha } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";

class StoreSilent extends Error { constructor(op) { super(op); this.op = op; } }
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, StoreSilent, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

const call = async (w, env, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};
const answer = async (res) => ({ status: res.status, headers: [...res.headers], body: new Uint8Array(await res.arrayBuffer()) });

const F = "INQ-2026-0001";
function publishedCase() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare("CASE-2026-0001", 1, { format: "bio-case-document/5", project: proj, roles: [{ target: F, version_sha: pin }],
                                   strength: [{ target: F, axis: "capture", grade: "B" }] });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  const text = w.text(F);
  w.signFinding(F, { shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) }] });
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(text));
  return { w, env, pin, text };
}
/* every case form of a lowercase hash: upper, and mixed in two phases */
const forms = (h) => [h.toUpperCase(), [...h].map((c, i) => (i % 2 ? c.toUpperCase() : c)).join(""),
                      [...h].map((c, i) => (i % 2 ? c : c.toUpperCase())).join("")];

test("R5 (T46) the Worker's publishedbytes lowercases a 64-hex sha256 in upper or mixed case and answers it exactly as its lowercase form: published bytes, never-existed, and container form", async () => {
  const { w, env, pin, text } = publishedCase();
  assert.match(pin, /[a-f]/, "the fixture's hash has letters to case");
  const lower = await answer(await call(w, env, "publishedbytes", { sha256: pin }));
  assert.equal(lower.status, 200);
  assert.equal(new TextDecoder().decode(lower.body), text);
  const never = "ab".repeat(32);
  const neverLower = await answer(await call(w, env, "publishedbytes", { sha256: never }));
  assert.equal(neverLower.status, 404);
  const notc = await answer(await call(w, env, "publishedbytes", { sha256: pin, format: "zip" }));
  assert.equal(notc.status, 400, "NOT_A_CONTAINER");
  for (const f of forms(pin)) {
    assert.notEqual(f, pin);
    assert.deepEqual(await answer(await call(w, env, "publishedbytes", { sha256: f })), lower, `${f}: as its lowercase form`);
    assert.deepEqual(await answer(await call(w, env, "publishedbytes", { sha256: f, format: "zip" })), notc, `${f}: container form`);
  }
  for (const f of forms(never))
    assert.deepEqual(await answer(await call(w, env, "publishedbytes", { sha256: f })), neverLower,
                     "a never-existed hash in any case answers the same bytes, naming its lowercase form");
  assert.equal(JSON.parse(new TextDecoder().decode(neverLower.body)).sha256, never);
  /* a container served by its manifest's hash, asked in upper case */
  const manifest = { format: "bio-case/1", files: [] };
  const mBytes = new TextEncoder().encode(JSON.stringify(manifest));
  const mSha = sha(Buffer.from(mBytes));
  w.p.recordCaseManifest({ caseId: "CASE-2026-0001", edition: 1, manifest, manifestSha: mSha });
  env.PUBLISHED.m.set(`bio/published/${mSha}`, mBytes);
  const zLower = await answer(await call(w, env, "publishedbytes", { sha256: mSha, format: "zip" }));
  for (const f of forms(mSha))
    assert.deepEqual(await answer(await call(w, env, "publishedbytes", { sha256: f, format: "zip" })), zLower);
});

test("R5 (T46) controls: what is not 64 hexadecimal digits is still the required-argument refusal at the Worker, whatever its case", async () => {
  const { w, env, pin } = publishedCase();
  for (const bad of [pin.slice(1), pin + "a", pin.toUpperCase().slice(1), pin.toUpperCase() + "A", "G".repeat(64),
                     pin.slice(0, 63) + "g", pin.slice(0, 63) + "G", " " + pin, "", "NOT-A-HASH"]) {
    const r = await call(w, env, "publishedbytes", { sha256: bad });
    assert.equal(r.status, 400, JSON.stringify(bad));
    assert.equal((await r.json()).reason, "REQUIRED_ARGUMENT_MISSING");
  }
});

test("R5 (T46) the store lowercases alike: verify, publishedcase and withheld, through the op and by the method, answer an upper- or mixed-case hash as its lowercase form", () => {
  const { w, pin } = publishedCase();
  const vLower = w.read("verify", { sha256: pin });
  assert.equal(vLower.published, true);
  const cLower = w.read("publishedcase", { sha256: pin });
  assert.equal(cLower.ok, true);
  const never = "cd".repeat(32);
  const nLower = w.pr.verifySha(never);
  assert.equal(nLower.published, false);
  for (const f of forms(pin)) {
    assert.deepEqual(w.read("verify", { sha256: f }), vLower, "op=verify");
    assert.deepEqual(w.pr.verifySha(f), w.pr.verifySha(pin), "verifySha, by the method");
    assert.equal(w.pr.verifySha(f).sha256, pin, "answered as its lowercase form");
    assert.deepEqual(w.read("publishedcase", { sha256: f }), cLower, "op=publishedcase");
    assert.deepEqual(w.pr.publishedCase({ sha256: f }), w.pr.publishedCase({ sha256: pin }), "publishedCase, by the method");
    assert.deepEqual(w.pr.withheldOf(f), w.pr.withheldOf(pin), "withheldOf");
  }
  for (const f of forms(never)) assert.deepEqual(w.pr.verifySha(f), nLower);
  /* control: a string that is not 64 hex digits is not rewritten by the store (nothing published answers to it) */
  const odd = pin.toUpperCase().slice(1);
  assert.deepEqual(w.pr.verifySha(odd), { published: false, sha256: odd, matches: [] });
});
