/* acquisition R115 (T51 fix round 9, G124b; amends R96): A MULTIPART CAPTURE IS NOT HELD TWICE. `acquire` of a 20 MiB capture in three parts, against
   a store that offers no `compose`, holds in memory (counted by the byte ledger, runtime-limits) no more than the kept bytes plus the one part being
   read, and the whole is kept under its own digest, put from the buffer the parts were received into. A single-part capture is held and kept as
   before (control). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha, rendererEnv } from "./fixture.mjs";
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
  assert.ok(ledger.peak() >= kept, `the ledger counted the kept bytes (peak ${ledger.peak()}), so a module that does not meter reads red`);
  assert.ok(ledger.peak() <= kept + PART + slack, `peak ${ledger.peak()} is over the kept bytes plus one part`);
  assert.ok(ledger.peak() < 2 * kept, "a buffer of the whole's size is not formed beside the kept parts");
});

const kept = 20 * MIB, slack = MIB;   // the chunks of the stream not yet copied into the part they fill
/* a response that states a length the body does not have, or none */
const serveStated = (bytes, stated) => () => new Response(streamed(bytes), { headers: { "content-type": "application/octet-stream", ...(stated === null ? {} : { "content-length": String(stated) }) } });

for (const [label, stated] of [["no length declared", null], ["a declared length shorter than the body", 12 * MIB], ["a declared length longer than the body", 22 * MIB]]) {
  test(`R115: a 20 MiB multipart capture with ${label}, against a store with no compose, peaks by the ledger at no more than the kept bytes plus one part and is kept whole`, async () => {
    const w = world();
    const data = varied(20 * MIB);
    const ledger = byteLedger();
    const r = await run(w, { [url]: serveStated(data, stated) }, { locator: url }, { ledger });
    assert.equal(r.status, 200);
    assert.equal(r.body.parts, 3);
    assert.equal(sha(w.bytesOf(sha(data))), sha(data), "the whole is held under its own digest");
    assert.ok(ledger.peak() >= kept, `the ledger counted the kept bytes (peak ${ledger.peak()})`);
    assert.ok(ledger.peak() <= Math.max(kept, stated ?? 0) + PART + slack, `peak ${ledger.peak()} is over the kept bytes (the buffer the declared length asked for) plus one part`);
    assert.ok(ledger.peak() < 2 * kept, "a buffer of the whole's size is not formed beside the kept parts");
    assert.equal(ledger.held(), 0, "every byte the call held is let go when it ends");
    if (stated !== 12 * MIB && stated !== 22 * MIB) {
      /* K4926: a body received into no single buffer is not joined from held parts: the stored parts are read back one at a time (red against a join, which reads none) */
      const back = w.b.calls.filter((c) => c[0] === "get" && !(c[2] && c[2].range)).map((c) => c[1]).sort();
      assert.deepEqual(back, r.body.document.parts.map((p) => `bio/captures/${p.sha256}`).sort(), "each stored part is read back once");
    }
  });
}

test("R115: a capture whose render is asked is kept whole by the same rule (the ledger's peak is the kept bytes plus one part)", async () => {
  const data = varied(20 * MIB);
  const ledger = byteLedger();
  const w = world({ env: rendererEnv({ ok: false, reason: "RENDER_FAILED" }) });
  const r = await run(w, { [url]: serveStated(data, 20 * MIB) }, { locator: url, render: true }, { ledger });
  assert.equal(typeof r.status, "number", "the capture is answered");
  assert.ok(ledger.peak() <= kept + PART + slack, `peak ${ledger.peak()} is over the kept bytes plus one part`);
});

test("R115: a PDF in several parts with no length declared is named by its reading, not by a join of the parts (title null at capture, stated)", async () => {
  const w = world();
  const data = varied(18 * MIB);
  const r = await run(w, { [url]: serveStated(data, null) }, { locator: url });
  assert.equal(r.status, 200);
  assert.equal(r.body.document.title, null);
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
