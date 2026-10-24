/* file-safety R39 (fix round 9, K4900): the render wake is `now` while the last renderBatch left a view queued, since a batch renders one
   file a tick (R12); null after the last. At the module's interface, over the scripted renderer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf } from "./fixture.mjs";
import { FILE_SAFETY_POLL_MS, RENDER_RETRY_MS } from "../../../src/file-safety/index.mjs";

test("R39: three files queued, each renderBatch renders one and renderWake answers now until the last view is drawn, then null", async () => {
  const w = world();
  for (const n of ["a", "b", "c"]) { await w.capture(pdf(false, n)); w.tick(1000); }
  let done = 0;
  for (let i = 0; i < 3; i++) {
    const r = await w.fs.renderBatch({});
    done += r.rendered;
    if (i < 2) assert.equal(w.fs.renderWake(w.clock.now), w.clock.now, `after render ${i + 1}: now, not now + ${FILE_SAFETY_POLL_MS}`);
  }
  assert.equal(done, 3);
  assert.equal(w.fs.renderWake(w.clock.now), null, "after the last view: no wake");
});

test("R39: a view in its back-off after a transient failure is not now; it waits for the end of the back-off", async () => {
  const w = world({ scan: { render: () => ({ code: "TIME_LIMIT", class: "transient", status: 504 }), throwOn: new Set() } });
  await w.capture(pdf(false, "slow"));
  await w.fs.renderBatch({});
  const wake = w.fs.renderWake(w.clock.now);
  assert.ok(wake > w.clock.now, "backing off: later than now");
  assert.ok(wake <= w.clock.now + Math.max(RENDER_RETRY_MS, FILE_SAFETY_POLL_MS) * 2);
});

test("R39: a render marked in flight holds the wake as before: queued views behind it are not now", async () => {
  const w = world();
  await w.capture(pdf(false, "a")); await w.capture(pdf(false, "b"));
  await w.fs.renderBatch({});
  assert.equal(w.fs.renderWake(w.clock.now), w.clock.now);
  w.exec("UPDATE fs_files SET render_state = 'rendering', render_started_at = ? WHERE render_state = 'queued' AND capture_sha = (SELECT capture_sha FROM fs_files WHERE render_state = 'queued' LIMIT 1)", new Date(w.clock.now).toISOString());
  assert.ok(w.fs.renderWake(w.clock.now) > w.clock.now, "in flight: held");
});
