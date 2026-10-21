/* capture, T51 fix round 2 (the walk's C5 upload half, C14, C26): at the module's interface, over record-core's evidence
   store, provenance's stand-in and the capture store (fixture.mjs). Each test names the requirement ids it proves. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";

const MiB = 1024 * 1024;
const te = new TextEncoder();
const STATEMENT = "a scan the clerk handed me at the counter";
const AT = "2026-10-09T12:00:00Z";
const setup = () => { const b = bucket(); const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } }); return { ...f, b }; };
const varied = (n) => { const u = new Uint8Array(n); for (let i = 0; i < n; i++) u[i] = (i * 31 + (i >> 8)) & 255; return u; };

test("R86 (C5; acquisition R10): a file over 16 MiB (three parts) is kept whole under its own digest as well as in its parts, and its document reads back whole; a single part is unchanged; a part gone at read-back is UPLOAD_NOT_STORED and writes nothing", async () => {
  const { c, b, rows } = setup();
  const big = varied(16 * MiB + 5);
  const r = await c.uploadCapture({ bytes: big, statement: STATEMENT, by: "m1", at: AT });
  assert.equal(r.ok, true);
  assert.equal(r.document.parts.length, 3);
  assert.equal(r.document.capture.sha256, sha(big));
  const whole = b.held.get(`bio/captures/${sha(big)}`);
  assert.ok(whole, "an object is held under the document's own fingerprint");
  assert.equal(sha(whole), sha(big));
  for (const p of r.document.parts) assert.ok(b.held.has(`bio/captures/${p.sha256}`), "the parts stay held");
  /* control: one part is one object */
  const one = setup();
  const small = te.encode("the budget memo");
  assert.equal((await one.c.uploadCapture({ bytes: small, statement: STATEMENT, by: "m1", at: AT })).ok, true);
  assert.equal(one.b.calls.filter((x) => x[0] === "put").length, 1);
  /* a part gone at read-back: refused, nothing written */
  const miss = setup();
  const parts = [sha(big.subarray(0, 8 * MiB)), sha(big.subarray(8 * MiB, 16 * MiB)), sha(big.subarray(16 * MiB))];
  const get = miss.b.get.bind(miss.b);
  miss.b.get = async (k) => (k.endsWith(parts[2]) ? null : get(k));
  const before = JSON.stringify(miss.rows("SELECT * FROM captured_locators"));
  const rr = await miss.c.uploadCapture({ bytes: big, statement: STATEMENT, by: "m1", at: AT });
  assert.deepEqual([rr.ok, rr.reason, rr.document], [false, "UPLOAD_NOT_STORED", undefined]);
  assert.equal(JSON.stringify(miss.rows("SELECT * FROM captured_locators")), before, "no receipt");
  assert.equal(miss.rows("SELECT COUNT(*) AS n FROM capture_actors")[0].n, 0, "no actor");
});
