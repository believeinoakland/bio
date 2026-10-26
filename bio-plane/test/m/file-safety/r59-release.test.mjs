/* file-safety R59 (T51 fix round 10, live walk F-B14; K5272): a render that failed finally is tried again once when the renderer
   answering renderBatch is a different release from the one that failed it; never against the same release. At the module's
   interface, over the scripted renderer, whose release the test changes between batches. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, enc, DAY } from "./fixture.mjs";

const V = { viewer: "member:m1" };
const row = (w, s) => w.row("SELECT render_state, render_reason FROM fs_files WHERE capture_sha = ?", s);

test("R59: a NOT_RENDERABLE failure under release A is tried again once when the renderer answering is release B, and renders", async () => {
  let release = "renderer A";
  let works = false;
  const w = world({ scan: { rendererVersion: () => release, render: () => (works ? enc("%PDF-1.4 view") : { code: "NOT_RENDERABLE", class: "final", status: 422 }) } });
  const s = await w.capture(pdf(false, "zip64"));
  assert.equal((await w.fs.renderBatch({})).failed, 1);
  assert.deepEqual([row(w, s).render_state, row(w, s).render_reason], ["failed", "NOT_RENDERABLE"]);
  assert.equal((await w.fs.safeView({ captureSha: s, ...V })).code, "SAFE_VIEW_FAILED");
  /* the renderer is fixed and deployed: release B */
  release = "renderer B"; works = true;
  w.tick(DAY);
  /* the wake finds the file though nothing is queued */
  assert.ok(w.fs.renderWake(w.clock.now) !== null, "a failed file with another release answering is looked at again");
  const r = await w.fs.renderBatch({});
  assert.equal(r.rendered, 1);
  assert.equal(row(w, s).render_state, "done");
  assert.equal((await w.fs.safeView({ captureSha: s, ...V })).status, 200);
});

test("R59: control: the same release answering again leaves the failed file failed, and asked once more only per new release", async () => {
  let release = "renderer A";
  const codes = new Map();
  const w = world({ scan: { rendererVersion: () => release, render: (sha0) => ({ code: codes.get(sha0) ?? "NOT_RENDERABLE", class: "final", status: 422 }) } });
  const s = await w.capture(pdf(false, "never"));
  await w.fs.renderBatch({});
  assert.equal(w.calls("/render").length, 1);
  for (let i = 0; i < 3; i++) { w.tick(DAY); await w.fs.renderBatch({}); }
  assert.equal(w.calls("/render").length, 1, "never retried against the release that failed it");
  assert.equal(row(w, s).render_state, "failed");
  assert.ok(w.fs.renderWake(w.clock.now) >= w.clock.now + 3_600_000 - 1, "the failed file is looked at once an hour, not sooner");
  /* release B tries once and fails again; B is then the release that failed it */
  release = "renderer B";
  w.tick(DAY);
  await w.fs.renderBatch({});
  assert.equal(w.calls("/render").length, 2, "tried again once under B");
  assert.equal(row(w, s).render_state, "failed");
  for (let i = 0; i < 3; i++) { w.tick(DAY); await w.fs.renderBatch({}); }
  assert.equal(w.calls("/render").length, 2, "never again against B");
  /* an encrypted file is not tried again by a new release: no renderer release makes it readable */
  const e = await w.capture(pdf(false, "locked"));
  codes.set(e, "ENCRYPTED");
  await w.fs.renderBatch({});
  const before = w.calls("/render").length;
  release = "renderer C";
  w.tick(DAY);
  await w.fs.renderBatch({});
  assert.equal(row(w, e).render_reason, "ENCRYPTED");
  assert.equal(row(w, e).render_state, "failed");
  assert.equal(w.calls("/render").length, before + 1, "only the NOT_RENDERABLE file is asked again under C, not the one the renderer found encrypted");
});

test("R59: a renderer whose release cannot be read retries nothing", async () => {
  const w = world({ scan: { rendererVersion: () => undefined, render: () => ({ code: "NOT_RENDERABLE", class: "final", status: 422 }) } });
  const s = await w.capture(pdf(false, "blind"));
  await w.fs.renderBatch({});
  w.tick(DAY);
  await w.fs.renderBatch({});
  assert.equal(w.calls("/render").length, 1);
  assert.equal(row(w, s).render_state, "failed");
});
