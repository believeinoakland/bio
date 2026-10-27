/* file-safety R12, R51 (fix round 9, G136b; X17, X19; DOCS S2, S4, S5): a render is bounded and its failure is classed. At the module's
   interface, over the scripted renderer, the clock moved the days the cases name. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, enc, sha, DAY } from "./fixture.mjs";
import { RENDER_RETRY_MS, WAITING_RECHECK_MS, SAFE_VIEW_BYTES_MAX } from "../../../src/file-safety/index.mjs";

const V = { viewer: "member:m1" };
const state = (w, s) => w.row("SELECT render_state, render_reason, render_tries, render_wait_at FROM fs_files WHERE capture_sha = ?", s);

test("R12 G136b: TIME_LIMIT and an unreachable renderer are transient: the file stays queued and is tried again with back-off that doubles to the hour; a renderer healthy ten days after a TIME_LIMIT renders the file", async () => {
  let mode = "time";
  const w = world({ scan: { render: () => (mode === "time" ? { code: "TIME_LIMIT", class: "transient", status: 504 } : enc("%PDF-1.4 view")), throwOn: new Set() } });
  const s = await w.capture(pdf(false, "slow"));
  assert.equal((await w.fs.renderBatch({})).failed, 1);
  assert.deepEqual([state(w, s).render_state, state(w, s).render_reason, state(w, s).render_tries], ["queued", "TIME_LIMIT", 1]);
  assert.equal((await w.fs.safeView({ captureSha: s, ...V })).code, "SAFE_VIEW_PENDING", "not a final failure");
  /* before the back-off ends: not asked; after it: asked again, and the back-off doubles */
  w.tick(RENDER_RETRY_MS - 1000);
  await w.fs.renderBatch({});
  assert.equal(w.calls("/render").length, 1, "within the back-off nothing is asked");
  w.tick(2000);
  await w.fs.renderBatch({});
  assert.equal(w.calls("/render").length, 2);
  assert.equal(state(w, s).render_tries, 2);
  w.tick(RENDER_RETRY_MS + 1000);
  await w.fs.renderBatch({});
  assert.equal(w.calls("/render").length, 2, "the second back-off is twice the first");
  /* the wake follows the back-off, never null while the file is queued */
  assert.ok(w.fs.renderWake(w.clock.now) > w.clock.now);
  /* ten days on, the renderer healthy */
  mode = "ok";
  w.tick(10 * DAY);
  const r = await w.fs.renderBatch({});
  assert.equal(r.rendered, 1);
  assert.equal(state(w, s).render_state, "done");
  assert.equal((await w.fs.safeView({ captureSha: s, ...V })).status, 200);
  /* an unreachable renderer is transient too */
  const u = world({ scan: { throwOn: new Set(["render"]) } });
  const us = await u.capture(pdf(false, "down"));
  await u.fs.renderBatch({});
  assert.deepEqual([state(u, us).render_state, state(u, us).render_reason], ["queued", "SCANNER_UNREACHABLE"]);
  assert.ok(WAITING_RECHECK_MS >= RENDER_RETRY_MS);
});

test("R12 G136b: NOT_RENDERABLE, ENCRYPTED and any other refusal of the renderer are final: the file is not tried again and its safe view says why; only NOT_FOUND waits for the bytes", async () => {
  const w = world({ scan: { render: (sha0) => ({ code: shaCode.get(sha0), class: shaCode.get(sha0) === "TIME_LIMIT" ? "transient" : "final", status: shaCode.get(sha0) === "NOT_FOUND" ? 404 : 422 }) } });
  const shaCode = new Map();
  const files = {};
  for (const code of ["NOT_RENDERABLE", "ENCRYPTED", "RENDER_FAILED", "NOT_FOUND"]) {
    const s = await w.capture(pdf(false, code)); w.tick(1000);
    shaCode.set(s, code); files[code] = s;
  }
  for (let i = 0; i < 4; i++) await w.fs.renderBatch({});
  for (const code of ["NOT_RENDERABLE", "ENCRYPTED", "RENDER_FAILED"]) {
    assert.deepEqual([state(w, files[code]).render_state, state(w, files[code]).render_reason], ["failed", code], code);
    const v = await w.fs.safeView({ captureSha: files[code], ...V });
    assert.deepEqual([v.code, v.renderer_reason], ["SAFE_VIEW_FAILED", code]);
  }
  assert.deepEqual([state(w, files.NOT_FOUND).render_state, state(w, files.NOT_FOUND).render_reason], ["waiting", "NOT_FOUND"]);
  const calls = w.calls("/render").length;
  w.tick(40 * DAY);
  await w.fs.renderBatch({}); await w.fs.renderBatch({});
  const later = w.calls("/render").slice(calls).map((c) => c.body.target.capture_sha);
  assert.deepEqual(later, [files.NOT_FOUND], "a final failure is not retried; the waiting file is looked at again");
});

test("R12 G136b: the renderer's PDF is read as a stream held to SAFE_VIEW_BYTES_MAX and stored once; one past the bound is refused, final, and stored nowhere", async () => {
  assert.equal(SAFE_VIEW_BYTES_MAX, 33_554_432);
  const w = world({ scan: { render: (s0) => (s0 === big ? enc("x").constructor.from({ length: SAFE_VIEW_BYTES_MAX + 1 }, () => 37) : enc(`%PDF-1.4 ok ${s0}`)) } });
  const ok = await w.capture(pdf(false, "ok")); w.tick(1000);
  const big0 = await w.capture(pdf(false, "huge"));
  var big = big0;   // eslint-disable-line no-var
  await w.fs.renderBatch({});
  const puts = () => w.bucket.calls.filter((c) => c[0] === "put" && c[1].includes("/derived/"));
  assert.equal(state(w, ok).render_state, "done");
  assert.equal(puts().length, 1, "stored once");
  await w.fs.renderBatch({});
  assert.deepEqual([state(w, big0).render_state, state(w, big0).render_reason], ["failed", "OVER_BOUND"]);
  assert.equal(puts().length, 1, "the view past the bound is stored nowhere");
  assert.equal(sha("x").length, 64);
});
