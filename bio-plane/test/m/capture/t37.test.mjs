/* capture R73 (T37; N774, K2155, K2175): `captureOf`'s `reputation` reader and `fileScanner` binding are kept on the
   instance and handed to `acquisition` with the store: the instance exposes `fileScanner`, and `reputation` as a
   function that calls the reader at each call and answers what it answers (null with none), so the plane's per-call
   reader (`plane` R29) reaches every acquisition. Each is adopted from the first caller that supplies it; a later one
   is ignored, never compared and never refused; R58 is unchanged for `env`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network } from "./fixture.mjs";
import { captureOf, SUBRESOURCE_STAGGER_SETTING } from "../../../src/capture/index.mjs";

/* A Capture made through `captureOf` over a fresh fixture's storage (its tables migrated, its stand-ins handed in). */
function world(opts = {}) {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  f.core.setSetting(SUBRESOURCE_STAGGER_SETTING, 0, "member:admin");
  const ctx = { storage: f.s };
  const c = captureOf(ctx, { record: f.core, provenance: f.c.provenance, governor: f.c.governor, credentials: f.c.credentials, ...opts });
  return { ...f, ctx, c };
}
/* A stand-in for the `FILE_SCANNER` binding: answers `POST /provider/reputation` (file-scanner R25), recording each ask. */
function scanner(answer = { ok: true, listed: true, categories: ["phishing"] }) {
  const asked = [];
  return { asked, fetch: async (url, init) => { asked.push({ url: String(url), body: JSON.parse(init.body) }); return Response.json(answer); } };
}
const spec = (n) => ({ tool_id: `urlhaus-${n}`, kind: "url_reputation", handling: "local" });
const page = (body) => new Response(`<!doctype html><html><head><title>t</title></head><body>${body}</body></html>`,
                                    { headers: { "content-type": "text/html; charset=utf-8" } });
const opts = { cls: "member", member: true, sessMember: "m1", storeName: "bio" };

test("R73 (T37): with no reader or binding handed in, `reputation()` answers null and `fileScanner` is null", () => {
  const { c } = world();
  assert.equal(typeof c.reputation, "function");
  assert.equal(c.reputation(), null);
  assert.equal(c.fileScanner, null);
});

test("R73 (T37): `reputation()` calls the reader at each call and answers what it answers: a value, a promise, null, a throw", async () => {
  let calls = 0, mode = "spec";
  const reader = () => {
    calls += 1;
    if (mode === "throw") throw new Error("tool unreadable");
    if (mode === "promise") return Promise.resolve(spec(calls));
    return mode === "null" ? null : spec(calls);
  };
  const { c } = world({ reputation: reader });
  assert.deepEqual(c.reputation(), spec(1));
  assert.deepEqual(c.reputation(), spec(2), "read again at the next call, never a value kept from the first");
  mode = "promise";
  const p = c.reputation();
  assert.ok(p instanceof Promise, "a promise is answered as the reader answers it, for acquisition to await");
  assert.deepEqual(await p, spec(3));
  mode = "null";
  assert.equal(c.reputation(), null);
  mode = "throw";
  assert.throws(() => c.reputation(), /tool unreadable/, "a throw reaches acquisition, which records it as no answer");
  assert.equal(calls, 5);
  /* read off the store and called detached, as acquisition may, it answers the same */
  mode = "spec";
  const detached = c.reputation;
  assert.deepEqual(detached(), spec(6));
  /* a tool spec handed in as a value (acquisition R44 takes one too) is answered as it is */
  const { c: d } = world({ reputation: spec(9) });
  assert.deepEqual(d.reputation(), spec(9));
});

test("R73 R58 (T37): the reader and the binding are adopted from the first caller that supplies each; a later caller's is ignored, never compared or refused; a different env is still refused", () => {
  const w = world({ env: { INSTANCE_NAME: "inst" } });
  const { c, ctx } = w;
  assert.equal(c.reputation(), null);
  const first = () => spec("first"), second = () => spec("second");
  const fs1 = scanner(), fs2 = scanner();
  /* the plane's call: the instance already exists (made earlier with env and attestation), so adoption is what keeps them */
  assert.equal(captureOf(ctx, { reputation: first, fileScanner: fs1 }), c);
  assert.deepEqual(c.reputation(), spec("first"));
  assert.equal(c.fileScanner, fs1);
  /* a later caller's own: ignored, and no throw (a function has no value to compare) */
  assert.equal(captureOf(ctx, { reputation: second, fileScanner: fs2 }), c);
  assert.deepEqual(c.reputation(), spec("first"));
  assert.equal(c.fileScanner, fs1);
  /* a caller supplying one adopts that one only: the other stays as the first caller left it */
  const v = world();
  captureOf(v.ctx, { fileScanner: fs2 });
  assert.equal(v.c.fileScanner, fs2);
  assert.equal(v.c.reputation(), null);
  captureOf(v.ctx, { reputation: second });
  assert.deepEqual(v.c.reputation(), spec("second"));
  assert.equal(v.c.fileScanner, fs2);
  /* R58 unchanged for env: one that differs from what a caller supplied is still refused, and a refused call adopts
     nothing it carried */
  assert.throws(() => captureOf(ctx, { env: { INSTANCE_NAME: "other" } }), /env/);
  const r = world({ env: { INSTANCE_NAME: "inst" } });
  assert.throws(() => captureOf(r.ctx, { env: { INSTANCE_NAME: "other" }, reputation: first, fileScanner: fs1 }), /env/);
  assert.deepEqual([r.c.reputation(), r.c.fileScanner], [null, null]);
  /* the first caller of all may hand them in as the instance is made */
  const u = world({ reputation: first, fileScanner: fs1 });
  assert.deepEqual([u.c.reputation(), u.c.fileScanner], [spec("first"), fs1]);
});

test("R73 (T37; acquisition R44, plane R29): the reader handed to captureOf reaches every acquisition, read once at each, and the binding carries the lookup", async () => {
  const w = world();
  let calls = 0;
  const fs = scanner();
  captureOf(w.ctx, { reputation: () => spec(++calls), fileScanner: fs });
  const routes = { "https://s.example/a": () => page("<p>a</p>"), "https://s.example/b": () => page("<p>b</p>") };
  const n = network(routes);
  try {
    const a = await w.c.acquire({ locator: "https://s.example/a" }, opts);
    const b = await w.c.acquire({ locator: "https://s.example/b" }, opts);
    assert.deepEqual([a.status, b.status], [200, 200]);
    assert.equal(calls, 2, "the reader was read once at each acquisition, never once at start");
    assert.deepEqual(fs.asked.map((x) => [x.url, x.body.address, x.body.tool]),
                     [["https://file-scanner/provider/reputation", "https://s.example/a", spec(1)],
                      ["https://file-scanner/provider/reputation", "https://s.example/b", spec(2)]],
                     "each lookup carries that acquisition's spec, through the binding handed in");
    assert.deepEqual([a.body.reputation.tool, a.body.reputation.listed, a.body.reputation.categories], ["urlhaus-1", true, ["phishing"]]);
    assert.deepEqual([b.body.reputation.tool, b.body.reputation.listed], ["urlhaus-2", true]);
  } finally { n.restore(); }
  /* with no reader handed in, the acquisition records no tool, never `listed: false` */
  const v = world();
  const m = network(routes);
  try {
    const r = await v.c.acquire({ locator: "https://s.example/a" }, opts);
    assert.equal(r.status, 200);
    assert.deepEqual([r.body.reputation.tool, r.body.reputation.listed, r.body.reputation.unanswered], [null, null, "NO_TOOL"]);
  } finally { m.restore(); }
});
