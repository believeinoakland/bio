/* file-safety R39, R12, R4 (fix round 9, G171; K4998): a view or a file queued AFTER a batch that left nothing is due at the next wake, not a
   poll later; a renderer answering a server error with no classed refusal is transient. At the module's interface, over the scripted
   scanner and renderer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, enc } from "./fixture.mjs";
import { FILE_SAFETY_POLL_MS, RESCAN_INTERVAL_MS } from "../../../src/file-safety/index.mjs";

const state = (w, s) => w.row("SELECT render_state, render_reason, render_tries FROM fs_files WHERE capture_sha = ?", s);

test("R39 G171: a view queued after a renderBatch that left nothing is due now, not a poll after that batch; a view in back-off keeps its instant", async () => {
  const w = world();
  await w.capture(pdf(false, "first"));
  assert.equal((await w.fs.renderBatch({})).rendered, 1);
  assert.equal(w.fs.renderWake(w.clock.now), null, "nothing queued after the batch");
  w.tick(1000);
  await w.capture(pdf(false, "second"));
  assert.equal(w.fs.renderWake(w.clock.now), w.clock.now, `now, not now + ${FILE_SAFETY_POLL_MS - 1000} (the last batch plus the poll)`);
  assert.equal(w.fs.renderWake(w.clock.now + 5000), w.clock.now + 5000, "never before the instant asked");
  assert.equal((await w.fs.renderBatch({})).rendered, 1);
  assert.equal(w.fs.renderWake(w.clock.now), null);
  /* control: a view in its back-off is not now */
  const b = world({ scan: { render: () => ({ code: "TIME_LIMIT", class: "transient", status: 504 }), throwOn: new Set() } });
  await b.capture(pdf(false, "slow"));
  await b.fs.renderBatch({});
  b.tick(1000);
  assert.ok(b.fs.renderWake(b.clock.now) > b.clock.now, "backing off: later than now");
});

test("R12 G171: a renderer answering a server error (5xx) with no classed refusal is SCANNER_UNREACHABLE: the row stays queued and is retried with back-off; a classed refusal keeps its class", async () => {
  let mode = "down";
  const w = world({ scan: { render: () => (mode === "down" ? { status: 500 } : enc("%PDF-1.4 view")), throwOn: new Set() } });
  const s = await w.capture(pdf(false, "down"));
  assert.equal((await w.fs.renderBatch({})).failed, 1);
  assert.deepEqual([state(w, s).render_state, state(w, s).render_reason], ["queued", "SCANNER_UNREACHABLE"], "transient, not RENDER_FAILED");
  assert.equal((await w.fs.safeView({ captureSha: s, viewer: "member:m1" })).code, "SAFE_VIEW_PENDING");
  mode = "up";
  w.tick(2 * 60 * 60_000);
  assert.equal((await w.fs.renderBatch({})).rendered, 1, "a renderer healthy later renders the file");
  /* controls: a 5xx that carries its own class stays as it says; a 4xx with no class stays final */
  const c = world({ scan: { render: (s0) => (s0 === fin ? { code: "NOT_RENDERABLE", class: "final", status: 500 } : { status: 422 }), throwOn: new Set() } });
  const fin = await c.capture(pdf(false, "classed"));
  const plain = await c.capture(pdf(false, "plain"));
  await c.fs.renderBatch({}); await c.fs.renderBatch({});
  assert.deepEqual([state(c, fin).render_state, state(c, fin).render_reason], ["failed", "NOT_RENDERABLE"]);
  assert.deepEqual([state(c, plain).render_state, state(c, plain).render_reason], ["failed", "RENDER_FAILED"]);
});

test("R4 R39 G171: a file queued in the same second after a scanBatch is due at the next wake, not a poll after that batch", async () => {
  const w = world();
  await w.capture(pdf(false, "one"));
  await w.fs.scanBatch({});
  const ran = w.clock.now;
  w.tick(1);
  await w.capture(pdf(false, "two"));
  assert.equal(w.fs.scanWake(w.clock.now), w.clock.now, `now, not ${ran + FILE_SAFETY_POLL_MS}`);
  /* control: once the batch has scanned it, the file is next due a week after its scan */
  assert.equal((await w.fs.scanBatch({})).scanned, 1);
  assert.equal(w.fs.scanWake(w.clock.now), ran + RESCAN_INTERVAL_MS, "both scanned: next due a week after the first scan");
});
