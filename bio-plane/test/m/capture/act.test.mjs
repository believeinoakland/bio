/* capture R73 and R55 (K617, K649 (1)): the acquisition act is `acquisition`'s, and capture's `acquire` and
   `archiveLookup` reach it with this module's store handed in, so what the act learns lands in capture's own tables:
   the source's outcome (R8), the undetermined-authority event (R15), the walk's links, site assets and ceiling (R23,
   R24, R27), a parked session (R22), the validators, the capturing member (R69) and the compute measurement handed to
   its listeners (R55). Over a scripted network, an evidence bucket and the providers as their Provides state them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network } from "./fixture.mjs";
import { SUBRESOURCE_STAGGER_SETTING, captureOps } from "../../../src/capture/index.mjs";
import { acquire as acquisitionAcquire, archiveLookup as acquisitionArchiveLookup } from "../../../src/acquisition/index.mjs";

const page = (body, type = "text/html; charset=utf-8", headers = {}) => new Response(body, { headers: { "content-type": type, ...headers } });
const HTML = (body) => `<!doctype html><html><head><title>t</title><link rel="stylesheet" href="/s.css"></head><body>${body}</body></html>`;

function world() {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  f.core.setSetting(SUBRESOURCE_STAGGER_SETTING, 0, "member:admin");
  return { ...f, b };
}
async function net(routes, fn) { const n = network(routes); try { return await fn(n); } finally { n.restore(); } }

test("R73: capture's acquire is acquisition's act with capture's store handed in: the same answer, and what it learns lands in capture's own tables", async () => {
  const w = world();
  const opts = { cls: "member", member: true, sessMember: "m1", storeName: "bio" };
  const routes = { "https://s.example/p": () => page(HTML('<nav><a href="/about">About</a></nav><a href="https://t.example/x">x</a>'), undefined, { etag: '"v1"' }),
                   "https://s.example/s.css": () => page("body{}", "text/css"),
                   "https://s.example/gone": () => new Response("no", { status: 410 }) };
  const r = await net(routes, () => w.c.acquire({ locator: "https://s.example/p", subresources: true }, opts));
  assert.equal(r.status, 200);
  const d = r.body.document.capture.sha256;
  /* the same act: acquisition's own acquire over the same store answers the same capture, now already held */
  const again = await net(routes, () => acquisitionAcquire(w.c, { locator: "https://s.example/p", subresources: true }, opts));
  assert.deepEqual([again.status, again.body.document.capture.sha256, again.body.existed], [200, d, true]);
  /* what the act learned is capture's */
  assert.equal(w.c.sourceReachability({ addressNorm: "https://s.example/p" }).last_outcome, "success", "R8");
  assert.equal(w.c.taskEventCount(), 1, "R15: one undetermined-authority event for the digest");
  assert.equal(w.c.linksTo({ address_norm: "https://t.example/x" }).count, 1, "R27");
  assert.ok(w.c.siteAssets({ host: "s.example" }).count >= 1, "R24");
  assert.deepEqual(w.c.validatorsOf({ addressNorm: "https://s.example/p", captureSha: d }), { etag: '"v1"', lastModified: null }, "the validators");
  assert.deepEqual(w.c.captureAccountsOf(d).actors.map((a) => a.actor), ["m1"], "R69: the member session is recorded as capturing it");
  /* a refusal of the act is answered as the act answers it, and still recorded against the document address */
  const refused = await net(routes, () => w.c.acquire({ locator: "https://s.example/gone" }, opts));
  assert.deepEqual([refused.status, refused.body.reason], [502, "SOURCE_REFUSED"]);
  assert.equal(w.c.sourceReachability({ addressNorm: "https://s.example/gone" }).last_outcome, "source_refused");
  /* archiveLookup: acquisition's, reading capture's reachability (an address never failing is not eligible) */
  const al = await w.c.archiveLookup({ address: "https://s.example/p" });
  const direct = await acquisitionArchiveLookup(w.c, { address: "https://s.example/p" });
  assert.deepEqual([al.body.reason, al.body.reason], [direct.body.reason, "NOT_ELIGIBLE"]);
  /* and through this module's routes, as op=acquire and op=archivelookup reach it */
  const viaRoute = await net(routes, () => captureOps(w.c, new URL("http://x/acquire?cls=member&member=1&sessMember=m1&store=bio"),
                                                      { locator: "https://s.example/p" }, w.c.env).acquire());
  assert.deepEqual([viaRoute.status, viaRoute.body.document.capture.sha256], [200, d]);
  assert.equal((await captureOps(w.c, new URL("http://x/archivelookup?address=https://s.example/p"), null, w.c.env).archivelookup()).body.reason, "NOT_ELIGIBLE");
});

test("R55: after each walk, every compute listener is handed the measurement {metric: capture_work_bytes, value, detail}; a failing listener fails nothing, and this module writes no runtime observation", async () => {
  const w = world();
  const heard = [];
  w.c.on("compute", "instance-setup", (m) => { heard.push(m); });
  w.c.on("compute", "broken", () => { throw new Error("listener down"); });
  const before = w.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((x) => x.name);
  const routes = { "https://s.example/p": () => page(HTML("<p>body</p>")), "https://s.example/s.css": () => page("body{}", "text/css"),
                   "https://s.example/t.txt": () => page("plain", "text/plain") };
  const r = await net(routes, () => w.c.acquire({ locator: "https://s.example/p", subresources: true }, { cls: "member", member: true, sessMember: "m1" }));
  assert.equal(r.status, 200, "the failing listener did not fail the capture");
  const snap = r.body.snapshot;
  assert.equal(heard.length, 1);
  assert.deepEqual([heard[0].metric, heard[0].value], ["capture_work_bytes", snap.compute.work_bytes]);
  assert.match(heard[0].detail, /compute calls over \d+ bytes; \d+ fetched, \d+ discovered/);
  assert.equal(snap.compute_recorded, undefined, "no recording claimed in the answer");
  assert.deepEqual(w.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((x) => x.name), before, "no table of its own for the measurement");
  /* no walk, no measurement */
  await net(routes, () => w.c.acquire({ locator: "https://s.example/t.txt", subresources: true }, { cls: "member", member: true, sessMember: "m1" }));
  assert.equal(heard.length, 1);
});

test("R38: no place is named in this module's answers or its own rows' words, and an upload is profiled only through the instance's profile view", async () => {
  const { CAPTURE_CHECKS } = await import("../../../src/capture/checks.mjs");
  const place = /oakland|alameda|california/i;
  for (const [code, row] of Object.entries(CAPTURE_CHECKS)) assert.ok(!place.test(row.translation), code);
  const w = world();
  w.core.setSetting("jurisdiction_profiles", ["test-port-ellery"], "member:admin");
  const te = new TextEncoder();
  const up = (c, text) => c.uploadCapture({ bytes: te.encode(text), statement: "handed to me", by: "m1", at: "2026-09-30T10:00:00Z" });
  const answers = [];
  const uploaded = await up(w.c, "minutes of the meeting");
  answers.push(uploaded, await w.c.uploadCapture({ bytes: te.encode("x"), statement: "", by: "m1" }),
               await w.c.uploadCapture({ bytes: te.encode("x"), statement: "s", by: "class:ai" }),
               await w.c.recordCaptureAccount({ captureSha: uploaded.capture.sha256, text: "", signature: "", by: "m2" }),
               w.c.sourceReachability({ addressNorm: "https://x.example/" }), w.c.siteChrome({ host: "x.example" }),
               w.c.resolveLinks({ sourceCapture: uploaded.capture.sha256 }), w.c.navChanges({ host: "x.example" }),
               w.c.renderAdmit({ allowanceMs: 1, reserveMs: 0, at: "2026-09-30T00:00:00Z" }));
  assert.ok(!place.test(JSON.stringify(answers)), "no answer names a place");
  assert.deepEqual(uploaded.document.profile.jurisdiction_view, ["test-port-ellery"], "local vocabulary only through the instance's view");
  const none = world();
  assert.equal((await up(none.c, "minutes")).document.profile.jurisdiction_view, null, "no setting: no view claimed");
});
