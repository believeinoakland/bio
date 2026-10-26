/* store-assembly's copy of plane's test. plane R75 -> R62 (T51 fix round 4; C5c; K4429; acquisition R96, extraction R80, record-core R87): THE SEAM TEST of C5c, press -> stored
   result, with the real merged acquisition, extraction, record-core and the assembled store's object alarm (the scheduler's, `alarmed-store.mjs`). The input is the member's own
   act: `acquire` of a 40 MiB document (five parts of 8 MiB) from a scripted network, against an evidence store whose first multipart
   upload never ends (the request that began it is over, as it is when the object is cut), within a bound that leaves no time to wait
   for it. The answer is `keep_pending` with every part held and no whole; the object's own alarm then makes the whole (a second upload,
   the first being lost) and `readHeld` writes the reading, so `op=reading` finds it. The home is registered as the promotion registers it
   (the bundle's row and its register row): the promotion's own route is control-plane's and is not what this seam tests. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./alarmed-store.mjs";
import { multipartBucket } from "../record-core/storage.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { pendingOf } from "../../../src/store-assembly/pending.mjs";

const MiB = 1024 * 1024;
/* acquisition holds a keep under way by the whole's digest for the life of the process (its R96), so each test has a document of its own */
function document40(text) {
  const line = new TextEncoder().encode(`${text}\n`);
  const bytes = new Uint8Array(40 * MiB);
  for (let at = 0; at < bytes.length; at += line.length) bytes.set(line.subarray(0, Math.min(line.length, bytes.length - at)), at);
  return bytes;
}
/* a body streamed in 1 MiB chunks, as a source sends it */
const streamed = (bytes) => new ReadableStream({ start(c) { for (let at = 0; at < bytes.length; at += MiB) c.enqueue(bytes.subarray(at, at + MiB)); c.close(); } });
/* the first multipart upload never completes (its request is over); every later one is the store's own */
function lostFirstUpload() {
  const b = multipartBucket();
  const make = b.createMultipartUpload.bind(b);
  let n = 0;
  b.createMultipartUpload = async (k) => {
    const u = await make(k);
    if (++n > 1) return u;
    return { uploadPart: (...a) => u.uploadPart(...a), abort: () => u.abort(), complete: () => new Promise(() => {}) };
  };
  return b;
}

test("R62 R4 (C5c) seam: a 40 MiB `acquire` whose keep cannot end inside the bound answers `keep_pending` with every part held; the object's own alarm makes the whole and reads it; `op=reading` then finds the reading (controls: the keep that ends inside the bound answers without `keep_pending`; nothing is left pending)", { timeout: 300_000 }, async () => {
  const bytes = document40("The board met on the first Tuesday and approved the minutes without objection.");
  const whole = createHash("sha256").update(bytes).digest("hex");
  const bucket = lostFirstUpload();
  const x = await store({ env: { CAPTURES: bucket } });
  const real = globalThis.fetch;
  globalThis.fetch = async () => new Response(streamed(bytes), { headers: { "content-type": "text/plain", "content-length": String(bytes.length) } });
  let pressed;
  try {
    pressed = await captureOf(x.ctx).acquire({ locator: "https://example.org/minutes-2026.txt" }, { cls: "admin", storeName: "bio", boundMs: 4_000 });
  } finally { globalThis.fetch = real; }
  assert.equal(pressed.status, 200, JSON.stringify(pressed.body).slice(0, 300));
  assert.equal(pressed.body.keep_pending, true, "the answer says the whole follows");
  assert.equal(pressed.body.document.capture.sha256, whole, "the capture is the whole document's");
  assert.equal(pressed.body.parts, 5);
  assert.ok(pressed.body.timings.stages.keep >= 0, "the keep is timed apart from the read");
  const ev = recordOf(x.ctx).evidenceStore();
  assert.equal(await ev.head(whole), null, "the whole is not held when the request ends");
  assert.deepEqual(pendingOf(x.ctx).list().map((r) => [r.sha, r.kind]), [[whole, "keep"]], "the keep is registered for the alarm");
  /* the home, as the promotion registers it */
  x.ctx.storage.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
    VALUES ('INFO-2026-0001', 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1)`);
  x.ctx.storage.sql.exec(`INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered,last_registered,authored,author,observed_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`, whole, "INFO-2026-0001", "snapshots/minutes-2026.txt", "binary", bytes.length, "2026-10-21T00:00:00Z", "2026-10-21T00:00:00Z", 0, null, null);
  assert.equal(extractionOf(x.ctx).readingFor(whole, "class:admin").found, false, "no reading before the alarm");
  await x.s.alarm();
  assert.ok(await ev.head(whole), "the alarm made the whole");
  assert.equal(extractionOf(x.ctx).readingFor(whole, "class:admin").found, true, "and wrote the reading");
  assert.deepEqual(pendingOf(x.ctx).list(), [], "nothing is left pending");
  const calls = bucket.calls.length;
  await x.s.alarm();
  assert.equal(bucket.calls.length, calls, "control: a second alarm does nothing");
});

test("R62 (C5c) seam, control: the same press against a store whose multipart upload ends inside the bound answers without `keep_pending`, holds the whole and leaves nothing pending", { timeout: 300_000 }, async () => {
  const bytes = document40("The board met again on the second Tuesday and adjourned without further business.");
  const whole = createHash("sha256").update(bytes).digest("hex");
  const x = await store({ env: { CAPTURES: multipartBucket() } });
  const real = globalThis.fetch;
  globalThis.fetch = async () => new Response(streamed(bytes), { headers: { "content-type": "text/plain", "content-length": String(bytes.length) } });
  let pressed;
  try {
    pressed = await captureOf(x.ctx).acquire({ locator: "https://example.org/minutes-2026.txt" }, { cls: "admin", storeName: "bio", boundMs: 120_000 });
  } finally { globalThis.fetch = real; }
  assert.equal(pressed.status, 200, JSON.stringify(pressed.body).slice(0, 300));
  assert.equal(pressed.body.keep_pending, undefined);
  assert.ok(await recordOf(x.ctx).evidenceStore().head(whole), "the whole is held when the request ends");
  assert.deepEqual(pendingOf(x.ctx).list(), []);
});
