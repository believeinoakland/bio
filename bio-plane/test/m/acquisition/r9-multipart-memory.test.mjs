/* acquisition R115 (T51 fix round 9, G124b; amends R96): A MULTIPART CAPTURE IS NOT HELD TWICE. `acquire` of a 20 MiB capture in three parts, against
   a store that offers no `compose`, holds in memory (counted by the byte ledger, runtime-limits) no more than the kept bytes plus the one part being
   read, and the whole is kept under its own digest, put from the buffer the parts were received into. A single-part capture is held and kept as
   before (control). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha } from "./fixture.mjs";
import { byteLedger } from "../../../src/byte-ledger.mjs";

const MIB = 1024 * 1024, PART = 8 * MIB;
const varied = (n) => new Uint8Array(n).map((_, i) => (i * 2654435761 + (i >> 9)) >>> 24);
const url = "https://a.example/twenty.pdf";
/* streamed in 64 KiB chunks, as a network delivers it */
const streamed = (bytes) => new ReadableStream({ start(c) { for (let at = 0; at < bytes.length; at += 65536) c.enqueue(bytes.slice(at, at + 65536)); c.close(); } });
const serve = (bytes, declared = true) => () => new Response(streamed(bytes), { headers: { "content-type": "application/octet-stream", ...(declared ? { "content-length": String(bytes.length) } : {}) } });

test("R115: a 20 MiB multipart capture, against a store with no compose, peaks by the ledger at no more than the kept bytes plus one part, and is kept whole", async () => {
  const w = world();
  const data = varied(20 * MIB);
  const ledger = byteLedger();
  const r = await run(w, { [url]: serve(data) }, { locator: url }, { ledger });
  assert.equal(r.status, 200);
  assert.equal(r.body.parts, 3);
  assert.equal(sha(w.bytesOf(sha(data))), sha(data), "the whole is held under its own digest");
  const kept = 20 * MIB, slack = MIB;   // the chunks of the stream not yet copied into the part they fill
  assert.ok(ledger.peak() <= kept + PART + slack, `peak ${ledger.peak()} is over the kept bytes plus one part`);
  assert.ok(ledger.peak() < 2 * kept, "a buffer of the whole's size is not formed beside the kept parts");
});

test("R115: a body whose length was not declared is held as before and still kept whole (the fallback joins, answering the same)", async () => {
  const w = world();
  const data = varied(18 * MIB);
  const r = await run(w, { [url]: serve(data, false) }, { locator: url });
  assert.equal(r.status, 200);
  assert.equal(sha(w.bytesOf(sha(data))), sha(data));
});

test("R115 (control): a single-part capture is held and kept as before and holds one part at most", async () => {
  const w = world();
  const data = varied(2 * MIB);
  const ledger = byteLedger();
  const r = await run(w, { [url]: serve(data) }, { locator: url }, { ledger });
  assert.equal(r.status, 200);
  assert.equal(r.body.parts, undefined);
  assert.ok(ledger.peak() <= PART);
});
