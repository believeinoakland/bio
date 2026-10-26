/* plane R75 (as B23 amends it: K4440; fix round 4, C5a/P8; control-plane R120; extraction R80): THE PLANE'S HALF OF A READING THAT WILL NOT FIT THE BOUND.
   control-plane's door hands `gatedOp` a `deferReading(document)` for an `acquire`; when it answers true the read step is skipped and
   the filed document is answered with `reading_pending: true` and no reading, the reading following by `readHeld` and the object's
   alarm (R75). Driven through the real door's hook (`gatedOp`) and the real object over a scripted network; the filed document is the
   one acquisition files. Controls: no hook, and a hook answering false, read as before. */
import "../../../src/store-assembly/register.mjs";   /* R68: the start's registration before any op table is read */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { gatedOp } from "../../../src/plane/door.mjs";

async function press(x, locator, extra = {}) {
  const stub = { fetch: (r, init) => x.s.fetch(r instanceof Request ? r : new Request(r, init)) };
  const env = { ...x.env, STORE: { idFromName: () => "bio", get: () => stub } };
  const u = new URL("http://w/acquire");
  const real = globalThis.fetch;
  globalThis.fetch = async () => new Response("<html><head><title>Notice 2026-118</title></head><body><p>The board approved the minutes.</p></body></html>",
    { headers: { "content-type": "text/html" } });
  try {
    const res = await gatedOp({ req: new Request(u, { method: "POST", body: JSON.stringify({ locator }) }), url: u, env, op: "acquire", cls: "admin",
      viaSession: false, storeName: "bio", stub, trace: "T-76", timings: {}, ...extra });
    return await res.json();
  } finally { globalThis.fetch = real; }
}
const counting = (x) => {
  const ex = extractionOf(x.ctx), real = ex.read.bind(ex);
  const calls = [];
  ex.read = (...a) => { calls.push(a); return real(...a); };
  return calls;
};

test("R75 (control-plane R120): an `acquire` the door defers is answered with the filed document, `reading_pending: true` and no reading, and nothing is read; the hook is asked once, of the document filed", async () => {
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  const reads = counting(x);
  const asked = [];
  const body = await press(x, "https://example.org/notice-2026-118.html", { deferReading: (d) => { asked.push(d); return true; } });
  assert.equal(body.ok, true, JSON.stringify(body).slice(0, 300));
  assert.equal(body.reading_pending, true);
  assert.equal(body.document.reading, undefined, "no reading");
  assert.equal(body.document.text_units, undefined, "no text units");
  assert.match(body.document.capture.sha256, /^[0-9a-f]{64}$/, "the capture is filed");
  assert.equal(typeof body.note, "string", "the grade note is still added");
  assert.equal(asked.length, 1);
  assert.equal(asked[0].capture.sha256, body.document.capture.sha256, "asked of the document filed");
  assert.equal(reads.length, 0, "the reading was not run");
});

test("R75 (control): with no hook, and with a hook answering false, the reading is made as before and the answer states no `reading_pending`", async () => {
  for (const extra of [{}, { deferReading: () => false }, { deferReading: undefined }]) {
    const x = await store({ env: { CAPTURES: bucketStandIn() } });
    const reads = counting(x);
    const body = await press(x, "https://example.org/notice-2026-118.html", extra);
    assert.equal(body.ok, true, JSON.stringify(body).slice(0, 300));
    assert.equal(body.reading_pending, undefined);
    assert.ok(body.document.reading && typeof body.document.reading === "object", "the reading is on the document");
    assert.equal(reads.length, 1);
  }
});

test("R75 (control): a hook that throws leaves the reading to be made, as before (the door never fails a kept capture for it)", async () => {
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  const body = await press(x, "https://example.org/notice-2026-118.html", { deferReading: () => { throw new Error("boom"); } });
  assert.equal(body.ok, true, JSON.stringify(body).slice(0, 300));
  assert.equal(body.reading_pending, undefined);
  assert.ok(body.document.reading);
});

test("R76 (amended, K4916): the door awaits `deferReading`'s answer: a promise of `true` defers the acquire (`reading_pending: true`, no reading); a promise of `false` and a rejection read as before", async () => {
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  const deferred = await press(x, "https://example.org/notice-2026-118.html", { deferReading: async () => true });
  assert.equal(deferred.ok, true, JSON.stringify(deferred).slice(0, 300));
  assert.equal(deferred.reading_pending, true, "a promise of true defers");
  assert.equal(deferred.document.reading, undefined, "no reading made");
  for (const [what, deferReading] of [["a promise of false", async () => false], ["a rejection", () => Promise.reject(new Error("no answer"))]]) {
    const y = await store({ env: { CAPTURES: bucketStandIn() } });
    const body = await press(y, "https://example.org/notice-2026-118.html", { deferReading });
    assert.equal(body.ok, true, what);
    assert.equal(body.reading_pending, undefined, `${what}: not deferred`);
    assert.ok(body.document.reading, `${what}: read as before`);
  }
});
